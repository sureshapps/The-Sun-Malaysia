// Records a page view on every route change. Mounted once, in App.jsx.
//
// Two timing problems this has to work around, both caused by how useSeo.js
// behaves:
//
// 1. useSeo() sets document.title in an effect AFTER the page component
//    mounts, so reading the title synchronously on a route change stores the
//    PREVIOUS page's headline. Hence the short settle delay before recording.
//
// 2. On an article page the title isn't known at mount either — useSeo re-runs
//    once SWR resolves the post, which on a slow connection can be well after
//    any fixed delay. So after recording we keep watching <title> for a few
//    seconds and patch the stored headline when it lands. Views are counted
//    once; only the title gets corrected.
//
// useSeo also restores the previous title in its cleanup on unmount. That
// briefly puts a stale string in <title> mid-navigation, so every write is
// gated on the pathname still matching the one being tracked.

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { recordView, recordVisit, updateViewTitle } from '@/lib/analyticsStore'
import { STATIC_ROUTE_PATHS } from '@/lib/routes'

const TITLE_SETTLE_MS = 900
const TITLE_WATCH_MS = 12000

// Mirrors the route table in routes.js. Kept deliberately simple: anything
// with two segments that isn't /tag/... or /admin/... is an article, which
// matches the /:category/:slug rule App.jsx registers.
function classify(pathname) {
  const seg = pathname.split('/').filter(Boolean)
  if (seg.length === 0) return { kind: 'home', cat: '' }
  if (seg[0] === 'admin') return { kind: 'admin', cat: '' }
  if (seg[0] === 'tag') return { kind: 'tag', cat: '' }
  if (seg[0] === 'search') return { kind: 'search', cat: '' }
  if (seg.length === 1) {
    if (STATIC_ROUTE_PATHS.has(`/${seg[0]}`)) return { kind: 'page', cat: '' }
    return { kind: 'category', cat: seg[0] }
  }
  return { kind: 'article', cat: seg[0] }
}

// useSeo appends ' | theSun' unless the title already contains 'theSun', so
// strip that suffix — the table should read as a list of headlines, not a
// column of identical site names. The homepage title leads with the brand
// instead of trailing it, so it's named outright rather than mangled.
function cleanTitle(raw, kind) {
  if (kind === 'home') return 'Homepage'
  return String(raw || '')
    .replace(/\s*[-–—|]\s*theSun.*$/i, '')
    .trim()
}

export default function usePageViewTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    recordVisit()
  }, [])

  useEffect(() => {
    const { kind, cat } = classify(pathname)
    // Don't log admin screens — checking your own stats shouldn't inflate them.
    if (kind === 'admin') return

    let observer = null
    let stopWatch = null

    const recordTimer = setTimeout(() => {
      if (window.location.pathname !== pathname) return

      recordView({ path: pathname, title: cleanTitle(document.title, kind), kind, cat })

      // Keep correcting the headline until the page settles (or the reader
      // moves on). Only articles need this, but the cost is one observer.
      const titleEl = document.querySelector('title')
      if (!titleEl || typeof MutationObserver === 'undefined') return

      observer = new MutationObserver(() => {
        if (window.location.pathname !== pathname) return
        const title = cleanTitle(document.title, kind)
        if (title) updateViewTitle(pathname, title)
      })
      observer.observe(titleEl, { childList: true, characterData: true, subtree: true })

      stopWatch = setTimeout(() => observer.disconnect(), TITLE_WATCH_MS)
    }, TITLE_SETTLE_MS)

    return () => {
      clearTimeout(recordTimer)
      if (stopWatch) clearTimeout(stopWatch)
      if (observer) observer.disconnect()
    }
  }, [pathname])
}
