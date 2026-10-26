import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteHeader from '@/components/site/SiteHeader'
import SiteFooter from '@/components/site/SiteFooter'
import HomePage from '@/pages/HomePage'
import ArticlePage from '@/pages/ArticlePage'
import CategoryPage from '@/pages/CategoryPage'
import TagPage from '@/pages/TagPage'
import AuthorPage from '@/pages/AuthorPage'
import SearchPage from '@/pages/SearchPage'
import SystemsDeskPage from '@/pages/SystemsDeskPage'
import LatestPage from '@/pages/LatestPage'
import TopStoriesPage from '@/pages/TopStoriesPage'
import MostViewedPage from '@/pages/MostViewedPage'
import VideoPage from '@/pages/VideoPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PrintDigitalPage from '@/pages/PrintDigitalPage'
import BrandingPage from '@/pages/BrandingPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import DisclaimerPage from '@/pages/DisclaimerPage'
import AdvertisePage from '@/pages/AdvertisePage'
import TermsPage from '@/pages/TermsPage'
import AdsManagerPage from '@/pages/AdsManagerPage'
import PageViewsPage from '@/pages/PageViewsPage'
import InstallPrompt from '@/components/site/InstallPrompt'
import BackToTop from '@/components/site/BackToTop'
import CookieConsentBar from '@/components/site/CookieConsentBar'
import { ROUTE_PATHS } from '@/lib/routes'
import usePageViewTracker from '@/lib/usePageViewTracker'

// Records a view on every route change. Kept as its own component (like
// ScrollToTop) so the location change re-renders this null component rather
// than the whole App tree.
function PageViewTracker() {
  usePageViewTracker()
  return null
}

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, search])
  return null
}

// Maps each path in ROUTE_PATHS (lib/routes.js — the single source of
// truth) to its page component. Routes below are generated from that array
// rather than hand-listed here, so App.jsx and SystemsDeskPage.jsx's link
// validation can never disagree about what's actually registered. If a path
// is added to ROUTE_PATHS without an entry here, that route renders nothing
// (undefined component) — a loud, obvious failure instead of silent drift.
const routeComponents = {
  '/': HomePage,
  '/tag/:slug': TagPage,
  '/search': SearchPage,
  '/systems-desk': SystemsDeskPage,
  '/latest': LatestPage,
  '/top-stories': TopStoriesPage,
  '/most-viewed': MostViewedPage,
  '/videos': VideoPage,
  '/author/:slug': AuthorPage,
  '/privacy-policy': PrivacyPolicyPage,
  '/contact-us': ContactPage,
  '/about-us': AboutPage,
  '/disclaimer': DisclaimerPage,
  '/advertise-with-us': AdvertisePage,
  '/terms': TermsPage,
  '/subscribe-now': PrintDigitalPage,
  '/branding': BrandingPage,
  '/admin/ads-manager': AdsManagerPage,
  '/admin/page-views': PageViewsPage,
  // Article URLs now live at /[category]/[post-slug] (e.g. /news/road-deaths-...)
  // instead of /article/[post-slug]. ArticlePage still fetches by the post
  // slug only — see ArticlePage.jsx for the 404-on-category-mismatch check.
  '/:category/:slug': ArticlePage,
  // Category archive pages now live at the bare slug (e.g. /corporate-news)
  // instead of /category/:slug — CategoryPage itself is unchanged, only the
  // path that reaches it moved. See routes.js for why this must stay last.
  '/:slug': CategoryPage,
  '*': NotFoundPage,
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScrollToTop />
      <PageViewTracker />
      <SiteHeader />
<main className="flex-1">
        <Routes>
          {ROUTE_PATHS.map((path) => {
            const Component = routeComponents[path]
            return <Route key={path} path={path} element={<Component />} />
          })}
        </Routes>
      </main>
      <SiteFooter />
      <InstallPrompt />
      <BackToTop />
      <CookieConsentBar />
    </div>
  )
}
