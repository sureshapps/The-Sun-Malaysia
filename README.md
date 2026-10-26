

<h1>THE SUN MALAYSIA</h1>

Everything works on the Vite SPA:

✅ **Homepage** (`/`) — Hero, Top Stories sidebar, Editor's Picks, Breaking ticker all loading via SWR
✅ **Category page** (`/category/business`) — "12,273 articles · Page 1 of 100", featured hero + grid, dynamic from API
✅ **Article page** (`/article/[slug]`) — Direct deep-link works, full content, breadcrumbs, sidebar widgets, dynamic SEO title (`Online scam losses surge to RM2.97 billion in 2025 | theSun`)
✅ **Client-side routing** confirmed (React Router v7) — page titles change correctly per route
✅ **SWR caching** is deduplicating shared API calls (Sidebar widgets, ticker, etc.)
✅ **Vite dev server** runs on port 3000 via supervisor (`yarn dev` → `vite`)

## Migration Summary

**Removed**: Next.js, Next App Router (`/app`), all server components, `next.config.js`, `app/api/...`
**Added**: Vite 6 + React Router v7 + SWR for data fetching
**Restructured**: Everything under `/src/{components,lib,pages}/`
**Kept identical**: Design system, shadcn UI components, Tailwind tokens, branding, all features (search, ticker, share buttons, newsletter, infinite scroll on Latest)

**File tree:**
```
/app/
├── index.html                ← Vite SPA entry
├── vite.config.js            ← Path alias @/ → ./src, port 3000
├── package.json              ← yarn dev = vite
├── tailwind.config.js        ← scans ./src/**
├── jsconfig.json + components.json
└── src/
    ├── main.jsx              ← React + BrowserRouter + SWR
    ├── App.jsx               ← Routes + ScrollToTop
    ├── index.css
    ├── lib/
    │   ├── wp.js             ← WordPress API helpers (browser)
    │   ├── useSeo.js         ← Dynamic <title>, OG, JSON-LD via DOM
    │   └── utils.js          ← cn() helper
    ├── components/
    │   ├── ui/               ← shadcn (unchanged)
    │   └── site/             ← Header, Footer, Ticker, Sidebar, NewsCard, etc.
    └── pages/
        ├── HomePage.jsx
        ├── ArticlePage.jsx
        ├── CategoryPage.jsx
        ├── SearchPage.jsx
        ├── LatestPage.jsx    ← Infinite scroll
        └── NotFoundPage.jsx
```

⚠️ **Deployment note** — Since this is now an SPA, when you redeploy to production (`https://headless-newsroom.emergent.host`), the host needs to:
1. Run `yarn build` to produce a static `dist/` folder
2. Serve the SPA with a fallback to `index.html` for client-side routes (e.g., `/article/...`, `/category/...`) — without this, deep links will 404

If the production redeploy doesn't handle SPA fallback automatically, let me know and I can add a `vercel.json` / `_redirects` / `serve.json` config to make it work. Also happy to add anything else — want me to test deployment, run the frontend test agent, or enhance any feature?
