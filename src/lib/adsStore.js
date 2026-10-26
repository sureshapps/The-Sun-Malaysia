// Simple client-side store for per-slot ad code.
//
// NOTE: this uses localStorage, which is scoped to whoever's browser saves
// it — perfect for previewing/testing a banner, but it will NOT show up
// for other site visitors. To go live site-wide, swap getAdCode/setAdCode
// below for calls to a real backend (e.g. a `thesun/v1/ads` WP REST route
// backed by wp_options) — every component using this file (AdSlot,
// AdsManagerPage) keeps working unchanged as long as these functions keep
// the same signature.

const PREFIX = 'thesun_ad_slot:'

export function getAdCode(id) {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(PREFIX + id) || ''
  } catch {
    return ''
  }
}

export function setAdCode(id, code) {
  if (typeof window === 'undefined') return
  try {
    if (code && code.trim()) {
      window.localStorage.setItem(PREFIX + id, code)
    } else {
      window.localStorage.removeItem(PREFIX + id)
    }
    // Lets any mounted <AdSlot> for this id update immediately without a reload.
    window.dispatchEvent(new CustomEvent('ad-slot-updated', { detail: { id } }))
  } catch {
    // localStorage unavailable (private mode, quota, etc) — fail silently,
    // the slot just keeps showing its default banner.
  }
}

export function clearAdCode(id) {
  setAdCode(id, '')
}
