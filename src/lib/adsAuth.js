// Lightweight login gate for /admin/ads-manager.
//
// IMPORTANT: this is a client-side React app, so ADS_PASSWORD ships inside
// the JS bundle — anyone who opens devtools can read it. This is only a
// deterrent against casual/accidental access, NOT real security. For an
// actual protected login, this needs to check credentials against your WP
// backend instead (e.g. a `thesun/v1/ads-auth` REST route) — let me know
// if you want that wired in instead of this.

const AUTH_KEY = 'thesun_ads_manager_auth'

// Change these to whatever you want. Keep them out of git history / commit
// messages if this repo is public.
const ADS_USER_ID = 'admin'
const ADS_PASSWORD = 'changeme'

export function checkCredentials(userId, password) {
  return userId.trim() === ADS_USER_ID && password === ADS_PASSWORD
}

// sessionStorage (not localStorage) on purpose — the login only lasts for
// the current browser tab/session, so closing the tab logs you out.
export function isAuthed() {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

export function setAuthed() {
  try {
    window.sessionStorage.setItem(AUTH_KEY, '1')
  } catch {}
}

export function logout() {
  try {
    window.sessionStorage.removeItem(AUTH_KEY)
  } catch {}
}
