import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'
import App from './App.jsx'
import './index.css'

const fetcher = (url) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SWRConfig value={{
      fetcher,
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      errorRetryCount: 2,
    }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SWRConfig>
  </React.StrictMode>,
)

// Dismiss the splash screen (markup + animation live inline in index.html so
// it paints before this bundle downloads). Waits for the logo draw-in
// animation (~2.2s) to finish before fading out, so it never gets cut off
// on fast connections; on slow connections it just stays up until mount.
const SPLASH_MIN_MS = 2200
const splashEl = document.getElementById('splash')
if (splashEl) {
  setTimeout(() => {
    splashEl.classList.add('splash-hidden')
    splashEl.addEventListener('transitionend', () => splashEl.remove(), { once: true })
  }, SPLASH_MIN_MS)
}

// Register service worker (required for installability / beforeinstallprompt on Chrome & Android).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* noop — PWA install just won't be offered */ })
  })
}
