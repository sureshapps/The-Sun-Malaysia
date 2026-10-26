// Single source of truth for the app's route paths.
//
// This file intentionally holds ONLY path strings, not components — App.jsx
// pairs each path with its page component locally and renders <Route>s from
// this array, so there's no way for a route to exist in App.jsx that isn't
// also reflected here (and vice versa). Keeping it component-free also
// avoids a circular import: SystemsDeskPage.jsx is itself one of the routed
// pages, and it needs to import this file to validate menu.js links against
// the registered paths.
//
// To add a route: add its path here AND its component to the
// `routeComponents` map in App.jsx. If you do one without the other,
// App.jsx will fail to render that route (undefined component) rather than
// silently drifting.
export const ROUTE_PATHS = [
  '/',
  '/tag/:slug',
  '/search',
  '/systems-desk',
  '/latest',
  '/top-stories',
  '/most-viewed',
  '/videos',
  '/privacy-policy',
  '/contact-us',
  '/about-us',
  '/disclaimer',
  '/advertise-with-us',
  '/terms',
  '/subscribe-now',
  '/branding',
  // Author archive page (e.g. /author/bernama) — lists all posts by one
  // author/byline, sourced from the site's multi-author plugin data
  // (post.authors[]), not WP core's single post_author field. Two path
  // segments, same shape as /:category/:slug and /admin/*, so it MUST stay
  // above '/:category/:slug' below or that pattern would swallow it first
  // (category='author', slug=<the author slug>) and try to render an
  // article instead.
  '/author/:slug',
  '/admin/ads-manager',
  // Admin analytics. Two segments, like the ads manager — safe only because
  // it sits above '/:category/:slug', which would otherwise swallow it and
  // try to render an article in the 'admin' category.
  '/admin/page-views',
  // Article URL, matching the legacy /[category]/[post-slug] format
  // (e.g. /news/road-deaths-more-than-double-...) instead of the old flat
  // /article/[post-slug]. Two path segments, so it never collides with the
  // single-segment /:slug category catch-all below — but it must still stay
  // above '*' and below every static path listed above it.
  '/:category/:slug',
  // Catch-all for category archive slugs (e.g. /corporate-news, /spotlight),
  // replacing the old /category/:slug prefix. Must stay directly above '*'
  // and below every static path listed above it — React Router matches
  // top-down, so any static route added after this line would get silently
  // swallowed by this pattern and treated as a category slug instead.
  '/:slug',
  '*',
]

// Only concrete, param-free, non-wildcard paths are meaningful for
// validating a static menu.js `to` link — `/article/:slug` isn't something
// a nav item points at directly, and `*` matches everything, so including
// it would make every broken link look fine.
export const STATIC_ROUTE_PATHS = new Set(
  ROUTE_PATHS.filter((p) => p !== '*' && !p.includes(':'))
)
