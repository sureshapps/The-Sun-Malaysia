// WordPress REST API helpers for thesun.my (browser/SPA version)
export const WP_BASE = 'https://thesun.my/wp-json/wp/v2'

export function buildUrl(path, params = {}) {
  const url = new URL(`${WP_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v))
    }
  })
  return url.toString()
}

// Fetch and return both data + headers (used for pagination)
export async function wpFetch(path, params = {}) {
  const url = buildUrl(path, params)
  const res = await fetch(url)
  if (!res.ok) {
    return { data: [], total: 0, totalPages: 0 }
  }
  const data = await res.json()
  const total = parseInt(res.headers.get('x-wp-total') || '0', 10)
  const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '0', 10)
  return { data, total, totalPages }
}

// SWR keys (so all hooks dedupe + cache correctly)
export const postsKey = (params = {}) => buildUrl('/posts', { _embed: 1, ...params })
export const postBySlugKey = (slug) => buildUrl('/posts', { slug, _embed: 1 })
// This site's multi-author plugin exposes its own taxonomy REST endpoint at
// /ppma_author (see the `wp:term` "author" link on any post, and the
// `authors[]` array included on every post response). Looking a term up by
// slug gives us its numeric term_id, which the posts endpoint can then
// filter by.
export const authorBySlugKey = (slug) => buildUrl('/ppma_author', { slug })
// Filtering /posts by `ppma_author=<term_id>` matches how WP auto-registers
// a taxonomy's REST base as a posts collection filter param. This wasn't
// independently verified end-to-end (see getAuthorPosts below for the
// safety net), so double-check results if author pages ever look off.
export const postsByAuthorKey = (authorTermId, params = {}) =>
  buildUrl('/posts', { _embed: 1, ppma_author: authorTermId, ...params })

// Defensive client-side filter: keeps only posts that actually list this
// author slug in their `authors[]` array. Wrap fetched "posts by author"
// results in this before rendering, so that if the `ppma_author` server-side
// filter above is ever ignored (unsupported param, caching, etc.) the page
// still shows the correct author's posts rather than an unfiltered feed —
// at the cost of a shorter list if the fetched batch is small relative to
// how many other authors' posts came back unfiltered.
export function filterPostsByAuthorSlug(posts, slug) {
  return asArray(posts).filter(p =>
    Array.isArray(p.authors) && p.authors.some(a => a.slug === slug)
  )
}
export const categoryBySlugKey = (slug) => buildUrl('/categories', { slug })
export const categoriesKey = (params = {}) => buildUrl('/categories', params)
// Real trending hashtags: WP tags sorted by how many posts use them.
export const tagsKey = (params = {}) => buildUrl('/tags', { orderby: 'count', order: 'desc', hide_empty: 1, ...params })

// Guards against WP REST occasionally returning a non-array truthy payload
// (rate-limit / error JSON bodies, WAF challenge pages, etc.) instead of the
// expected list. Every component should read SWR `data` through this rather
// than trusting it directly — `data || []` does NOT catch this case, since a
// truthy non-array object still passes that check and blows up the first
// .map()/.filter()/.slice() call, taking the whole page blank with it.
export function asArray(data) {
  return Array.isArray(data) ? data : []
}

// ---------- Helpers to extract data from embedded API responses ----------
export function getFeaturedImage(post, size = 'medium_large') {
  if (!post) return null
  const media = post?._embedded?.['wp:featuredmedia']?.[0]
  if (!media || media.code === 'rest_forbidden') return null
  const sizes = media?.media_details?.sizes || {}
  const order = [size, 'medium_large', 'td_696x385', 'td_1068x580', 'td_485x360', 'medium', 'full']
  for (const s of order) {
    if (sizes[s]?.source_url) return sizes[s].source_url
  }
  return media.source_url || null
}

export function getThumbnail(post) {
  return getFeaturedImage(post, 'td_485x360') || getFeaturedImage(post, 'medium')
}

export function getLargeImage(post) {
  return getFeaturedImage(post, 'td_1068x580') || getFeaturedImage(post, 'full')
}

export function getImageAlt(post) {
  const media = post?._embedded?.['wp:featuredmedia']?.[0]
  return media?.alt_text || decodeHtml(post?.title?.rendered || '')
}

export function getPrimaryCategory(post) {
  const terms = post?._embedded?.['wp:term']
  if (!Array.isArray(terms)) return null
  for (const group of terms) {
    if (!Array.isArray(group)) continue
    for (const t of group) {
      if (t.taxonomy === 'category' && t.slug !== 'uncategorized') {
        return { name: decodeHtml(t.name), slug: t.slug, id: t.id }
      }
    }
  }
  return null
}

export function getAllCategories(post) {
  const terms = post?._embedded?.['wp:term']
  const cats = []
  if (!Array.isArray(terms)) return cats
  for (const group of terms) {
    if (!Array.isArray(group)) continue
    for (const t of group) {
      if (t.taxonomy === 'category') cats.push({ name: decodeHtml(t.name), slug: t.slug, id: t.id })
    }
  }
  return cats
}

export function getTags(post) {
  const terms = post?._embedded?.['wp:term']
  const tags = []
  if (!Array.isArray(terms)) return tags
  for (const group of terms) {
    if (!Array.isArray(group)) continue
    for (const t of group) {
      if (t.taxonomy === 'post_tag') tags.push({ name: decodeHtml(t.name), slug: t.slug, id: t.id })
    }
  }
  return tags
}

// Author resolution, in order of preference:
// 1. `authors` — this site runs a multi-author plugin (PPMA/PublishPress
//    Authors-style; note the `ppma_author` taxonomy and
//    `_ppma_block_editor_authors` meta on every post). WordPress adds this
//    array to every post response with correct display_name/slug/avatar,
//    completely independent of core's single `post_author` field and
//    unaffected by any REST restriction on `wp/v2/users` — this is why it
//    kept showing "theSun" even after removing security-plugin blocks and
//    after adding a custom REST field: neither of those touched the actual
//    field the data was already sitting in. A post can have multiple
//    authors here; we show the first as the primary byline.
// 2. `author_info` — a custom REST field added via functions.php, kept as a
//    fallback in case a future post type doesn't carry the plugin's `authors`
//    array for some reason.
// 3. `_embedded.author[0]` — WP core's standard embed, kept as a last
//    fallback for as long as neither of the above resolves.
// 4. The generic 'theSun' byline — used only if none of the above have data
//    (e.g. a post with no assigned author at all).
export function getAuthor(post) {
  const authors = Array.isArray(post?.authors) ? post.authors : []
  if (authors.length && authors[0]?.display_name) {
    return {
      name: authors[0].display_name,
      slug: authors[0].slug || 'thesun',
      avatar: authors[0].avatar_url?.url,
    }
  }
  const info = post?.author_info
  if (info?.name) {
    return { name: info.name, slug: info.slug || 'thesun' }
  }
  const author = post?._embedded?.author?.[0]
  if (!author || author.code === 'rest_forbidden') return { name: 'theSun', slug: 'thesun' }
  return { name: author.name || 'theSun', slug: author.slug || 'thesun', avatar: author.avatar_urls?.['96'] }
}

// Canonical article URL: /[primary-category-slug]/[post-slug]
// Replaces the old flat /article/[post-slug] format to match the legacy
// thesun.my structure (e.g. /news/road-deaths-more-than-double-...). Falls
// back to 'news' when a post has no resolvable category (should be rare —
// every published post should carry at least one non-'uncategorized' term).
export function getPostUrl(post) {
  if (!post) return '/'
  const cat = getPrimaryCategory(post)
  const categorySlug = cat?.slug || 'news'
  return `/${categorySlug}/${post.slug}`
}

export function decodeHtml(html = '') {
  if (!html) return ''
  return String(html)
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
}

export function stripHtml(html = '', maxLen = 200) {
  if (!html) return ''
  const text = String(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  const decoded = decodeHtml(text)
  if (decoded.length <= maxLen) return decoded
  return decoded.slice(0, maxLen).trim() + '…'
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return '' }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('en-MY', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateStr)
}

export const NAV_CATEGORIES = [
  { slug: 'malaysia-news', name: 'Malaysia' },
  { slug: 'business', name: 'Business' },
  { slug: 'world', name: 'World' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'lifestyle', name: 'Lifestyle' },
  { slug: 'entertainment', name: 'Entertainment' },
  { slug: 'education', name: 'Education' },
  { slug: 'opinion', name: 'Opinion' },
  { slug: 'going-viral', name: 'Viral' },
  { slug: 'berita', name: 'Berita' },
]

export const FEATURED_CATEGORY_SLUGS = [
  'malaysia-news', 'business', 'world', 'sports', 'lifestyle', 'entertainment', 'berita',
]

export const LOGO_URL = 'https://customer-assets.emergentagent.com/job_3108d35f-a45a-4c79-ae5b-d6401293d73f/artifacts/j5qi0lcz_350x180-no-outline.png'

export const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9" width="800" height="450"><rect width="16" height="9" fill="%23e5e7eb"/><text x="50%25" y="55%25" text-anchor="middle" font-family="Arial" font-size="1" fill="%2399a">theSun</text></svg>'
