Converting from Next.js (App Router, server components, SSR/ISR) to a Vite + React SPA is a major rewrite. Please confirm a few details:

1. **Scope** — should I:
   - a) Fully replace Next.js with Vite + React Router (delete `/app/app`, rewrite everything as a pure client-side SPA)
   - b) Keep both side-by-side and add a separate Vite app

2. **Routing library** — for the SPA which would you prefer?
   - a) `react-router-dom` v7 (recommended, most popular)
   - b) `@tanstack/react-router` (type-safe, newer)

3. **Trade-offs you should be aware of** with a pure SPA — please confirm you're okay with these:
   - SEO will weaken (no SSR/meta tags rendered on initial HTML, search engines + social previews will see empty shell unless we add a prerender step)
   - JSON-LD / OpenGraph article tags will not appear in initial HTML response
   - Initial page load is slower (JS bundle must load before any content shows)
   - Are these acceptable, or do you want me to also set up `vite-plugin-ssr` / SSG for SEO?

4. **Deployment** — the current Next.js app is deployed at `https://headless-newsroom.emergent.host`. Switching to Vite will require a redeploy and may need a different build config. Are you okay with this?

5. **API calls** — currently server components fetch `thesun.my/wp-json` directly. In a SPA all calls go from the browser, so CORS must work. The thesun.my API does allow CORS, so this should be fine — just confirming you don't want a proxy layer.
Action: Converting from Next.js (App Router, server components, SSR/ISR) to a Vite + React SPA is a major rewrite. Please confirm a few details:

1. **Scope** — should I:
   - a) Fully replace Next.js with Vite + React Router (delete `/app/app`, rewrite everything as a pure client-side SPA)
   - b) Keep both side-by-side and add a separate Vite app

2. **Routing library** — for the SPA which would you prefer?
   - a) `react-router-dom` v7 (recommended, most popular)
   - b) `@tanstack/react-router` (type-safe, newer)

3. **Trade-offs you should be aware of** with a pure SPA — please confirm you're okay with these:
   - SEO will weaken (no SSR/meta tags rendered on initial HTML, search engines + social previews will see empty shell unless we add a prerender step)
   - JSON-LD / OpenGraph article tags will not appear in initial HTML response
   - Initial page load is slower (JS bundle must load before any content shows)
   - Are these acceptable, or do you want me to also set up `vite-plugin-ssr` / SSG for SEO?

4. **Deployment** — the current Next.js app is deployed at `https://headless-newsroom.emergent.host`. Switching to Vite will require a redeploy and may need a different build config. Are you okay with this?

5. **API calls** — currently server components fetch `thesun.my/wp-json` directly. In a SPA all calls go from the browser, so CORS must work. The thesun.my API does allow CORS, so this should be fine — just confirming you don't want a proxy layer.




Please proceed with:

1. **Scope:** Option **A** — fully replace Next.js with a Vite + React SPA. Remove the existing Next.js App Router structure and rebuild as a pure client-side application.

2. **Routing:** Use **react-router-dom v7**.

3. **SEO & Performance Trade-offs:** These are acceptable for this project. The primary goal is a fast, lightweight frontend that consumes content directly from the WordPress API. No SSR, ISR, SSG, or vite-plugin-ssr setup is required at this stage.

4. **Deployment:** Yes, I am okay with a full redeploy and any required build configuration changes.

5. **API Access:** Use direct browser requests to `https://thesun.my/wp-json/wp/v2/`. No proxy layer is required as long as CORS is working correctly.

Additional requirements:

* Build the site to resemble a modern news portal similar to Free Malaysia Today.
* All content (posts, categories, featured images, article pages, widgets, related posts, pagination, etc.) must come directly from the WordPress API.
* No backend implementation is required.
* Use the provided logo as the site's primary branding.
* Create a responsive design optimized for desktop, tablet, and mobile devices.
* Implement proper loading states, error handling, and API caching where appropriate.
* Structure the codebase cleanly and make it production-ready.

You may proceed with the conversion and implementation.
