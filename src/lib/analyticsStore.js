// Per-day, per-page view counts for theSun.
//
// Site-wide now: when REMOTE_BASE below is set, every read (the admin
// screen) and write (a visitor loading a page) goes through the
// thesun-pageviews WordPress plugin, so the Page Views screen shows traffic
// from every visitor — not just the browser you're looking at it in.
//
// While REMOTE_BASE is null, everything still works exactly as before:
// writes and reads both stay in this browser's own localStorage, so the app
// never breaks if the plugin isn't installed yet.
//
// To go live: install thesun-pageviews.php (see its own header for the
// two-minute install steps), then set REMOTE_BASE below to your site's
// REST URL, e.g. 'https://thesun.my/wp-json/thesun/v1'.
//
// Local data shape (key: thesun_pv:v1) — the remote endpoint returns the
// same shape, so the calculation functions below don't care which one they
// got:
// {
//   days: {
//     '2026-09-17': {
//       visits: 2,                                   // sessions started that day
//       pages: {
//         '/news/some-post': {
//           views: 12,
//           title: 'Some post headline',
//           kind: 'article',                         // article | category | page | home | tag | search
//           cat: 'news',
//         },
//       },
//     },
//   },
// }

const STORE_KEY = 'thesun_pv:v1'
const SESSION_KEY = 'thesun_pv:session'
const RETENTION_DAYS = 120

// Set this once the thesun-pageviews WordPress plugin is installed, e.g.
// 'https://thesun.my/wp-json/thesun/v1'. Leave it null to keep everything
// local-only (per-browser).
const REMOTE_BASE = null

export function isRemoteConfigured() {
  return Boolean(REMOTE_BASE)
}

const EMPTY = { days: {} }

// ---------------------------------------------------------------- date utils

// Local-time YYYY-MM-DD. Deliberately not toISOString(), which is UTC and
// would roll the day over at 8am Malaysia time.
export function dayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Oldest -> newest list of day keys ending today.
export function lastNDays(n) {
  const out = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push(dayKey(d))
  }
  return out
}

export function formatDayLabel(key, opts = {}) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    ...(opts.weekday ? { weekday: 'short' } : {}),
    ...(opts.year ? { year: 'numeric' } : {}),
  })
}

// ------------------------------------------------------------- local storage

function readStore() {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) return { days: {} }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || typeof parsed.days !== 'object') {
      return { days: {} }
    }
    return parsed
  } catch {
    return { days: {} }
  }
}

function writeStore(store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store))
    // Lets an open Page Views tab refresh without a reload.
    window.dispatchEvent(new CustomEvent('pageview-recorded'))
  } catch {
    // Quota or private mode — drop the write rather than break the page.
  }
}

function prune(store) {
  const keep = new Set(lastNDays(RETENTION_DAYS))
  for (const key of Object.keys(store.days)) {
    if (!keep.has(key)) delete store.days[key]
  }
  return store
}

// ------------------------------------------------------------------- writing

// Records one page view. `path` should be the pathname only (no query string)
// so /search?q=a and /search?q=b don't fragment into separate rows.
//
// Always writes locally first (instant, never fails silently into a broken
// page), then — if REMOTE_BASE is set — fires the same view at the shared
// WordPress counter. The local copy becomes a same-browser cache once the
// remote is live; the admin screen prefers the remote figure whenever it can
// reach it (see getEffectiveStore below).
export function recordView({ path, title = '', kind = 'page', cat = '' }) {
  if (typeof window === 'undefined' || !path) return

  const store = prune(readStore())
  const key = dayKey()
  const day = store.days[key] || (store.days[key] = { visits: 0, pages: {} })
  const page = day.pages[path] || (day.pages[path] = { views: 0, title, kind, cat })

  page.views += 1
  // Titles arrive async (useSeo sets document.title after mount), so always
  // take the freshest non-empty one rather than only the first.
  if (title) page.title = title
  if (kind) page.kind = kind
  if (cat) page.cat = cat

  writeStore(store)
  sendBeaconJson(`${REMOTE_BASE}/pageview`, { path, title, kind, cat })
}

// Corrects the stored headline for a page without counting another view.
// Used by the tracker when a title resolves after the view was recorded
// (article pages fetch their post, so the headline lands late). Local only
// — the remote title gets refreshed by the *next* view of that page.
export function updateViewTitle(path, title) {
  if (typeof window === 'undefined' || !path || !title) return

  const store = readStore()
  const page = store.days[dayKey()]?.pages?.[path]
  if (!page || page.title === title) return

  page.title = title
  writeStore(store)
}

// Counts one visit (session) per browser tab per day.
export function recordVisit() {
  if (typeof window === 'undefined') return
  const key = dayKey()
  try {
    if (window.sessionStorage.getItem(SESSION_KEY) === key) return
    window.sessionStorage.setItem(SESSION_KEY, key)
  } catch {
    return
  }
  const store = prune(readStore())
  const day = store.days[key] || (store.days[key] = { visits: 0, pages: {} })
  day.visits += 1
  writeStore(store)
  sendBeaconJson(`${REMOTE_BASE}/visit`, {})
}

function sendBeaconJson(endpoint, payload) {
  if (!REMOTE_BASE) return
  try {
    const body = JSON.stringify({ ...payload, ts: Date.now() })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // Never let tracking throw into the page.
  }
}

// ------------------------------------------------------------------- reading
//
// Every read function below is now async: when REMOTE_BASE is set they wait
// on one fetch to the WordPress plugin; when it isn't, they resolve
// immediately from localStorage. Callers just need one `await` — see
// PageViewsPage.jsx.

let remoteCache = null // { days, at, data }
const REMOTE_CACHE_MS = 15000 // avoid re-fetching on every render within ~15s

async function fetchRemoteStore(days) {
  if (!REMOTE_BASE) return null
  if (remoteCache && remoteCache.days === days && Date.now() - remoteCache.at < REMOTE_CACHE_MS) {
    return remoteCache.data
  }
  try {
    const res = await fetch(`${REMOTE_BASE}/pageviews?days=${days}`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data || typeof data.days !== 'object') return null
    remoteCache = { days, at: Date.now(), data }
    return data
  } catch {
    return null // offline, CORS misconfigured, plugin not installed yet, etc.
  }
}

// Site-wide store when the remote is configured and reachable; otherwise
// this browser's own local counts, so the screen still works before the
// plugin is deployed (or if a request fails).
async function getEffectiveStore(days) {
  const remote = await fetchRemoteStore(days)
  return remote || readStore()
}

// One row per day, oldest -> newest, including days with zero traffic so the
// chart doesn't silently compress gaps.
export async function getDailySeries(days = 30) {
  const store = await getEffectiveStore(days)
  return lastNDays(days).map((key) => {
    const day = store.days[key]
    if (!day) return { date: key, views: 0, visits: 0, pages: 0 }
    const pages = Object.values(day.pages || {})
    return {
      date: key,
      views: pages.reduce((sum, p) => sum + (p.views || 0), 0),
      visits: day.visits || 0,
      pages: pages.length,
    }
  })
}

// Totals per page across the window, sorted by views desc.
// `kind` filters to one page type ('article', 'category', ...), or 'all'.
export async function getPageTotals({ days = 30, kind = 'all' } = {}) {
  const store = await getEffectiveStore(days)
  const window_ = lastNDays(days)
  const acc = new Map()

  for (const key of window_) {
    const day = store.days[key]
    if (!day) continue
    for (const [path, page] of Object.entries(day.pages || {})) {
      if (kind !== 'all' && page.kind !== kind) continue
      const row = acc.get(path) || {
        path,
        title: page.title || path,
        kind: page.kind || 'page',
        cat: page.cat || '',
        views: 0,
        days: 0,
        firstSeen: key,
        lastSeen: key,
      }
      row.views += page.views || 0
      row.days += 1
      row.lastSeen = key
      if (page.title) row.title = page.title
      acc.set(path, row)
    }
  }

  return [...acc.values()].sort((a, b) => b.views - a.views)
}

// Day-by-day breakdown for one page — powers the expandable table row.
// Always looks across the full retention window so the requested page's
// history is complete regardless of which range tab is selected.
export async function getPageDaily(path, days = RETENTION_DAYS) {
  const store = await getEffectiveStore(days)
  return lastNDays(days).map((key) => ({
    date: key,
    views: store.days[key]?.pages?.[path]?.views || 0,
  }))
}

// Top pages on a single day.
export async function getDayBreakdown(dateKey) {
  const store = await getEffectiveStore(RETENTION_DAYS)
  const day = store.days[dateKey]
  if (!day) return []
  return Object.entries(day.pages || {})
    .map(([path, p]) => ({ path, title: p.title || path, kind: p.kind || 'page', views: p.views || 0 }))
    .sort((a, b) => b.views - a.views)
}

export async function getSummary(days = 30) {
  const [series, totals] = await Promise.all([getDailySeries(days), getPageTotals({ days })])
  const views = series.reduce((s, d) => s + d.views, 0)
  const visits = series.reduce((s, d) => s + d.visits, 0)
  const activeDays = series.filter((d) => d.views > 0).length
  const busiest = series.reduce((best, d) => (d.views > (best?.views || 0) ? d : best), null)
  return {
    views,
    visits,
    articles: totals.filter((t) => t.kind === 'article').length,
    pages: totals.length,
    avgPerDay: activeDays ? Math.round(views / activeDays) : 0,
    busiest: busiest && busiest.views > 0 ? busiest : null,
    trackingSince: await earliestDay(days),
  }
}

async function earliestDay(days) {
  const store = await getEffectiveStore(days)
  const keys = Object.keys(store.days).sort()
  return keys[0] || null
}

// ------------------------------------------------------------------ maintenance

// Clears this browser's local cache only. Once REMOTE_BASE is set, the
// shared site-wide totals live in the WordPress database and are not
// affected by this — there's no destructive "reset everyone's stats" button
// here on purpose.
export function clearAnalytics() {
  try {
    window.localStorage.removeItem(STORE_KEY)
    window.dispatchEvent(new CustomEvent('pageview-recorded'))
  } catch {}
}

export async function toCsv(days = 30) {
  const store = await getEffectiveStore(days)
  const rows = [['date', 'path', 'title', 'type', 'category', 'views']]
  for (const key of lastNDays(days)) {
    const day = store.days[key]
    if (!day) continue
    for (const [path, p] of Object.entries(day.pages || {})) {
      rows.push([key, path, p.title || '', p.kind || '', p.cat || '', p.views || 0])
    }
  }
  return rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}
