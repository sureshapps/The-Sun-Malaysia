// Central registry of every ad "banner" slot across theSun website —
// numbered to match the 7-banner reference screenshot.
// Add/remove entries here and the Ads Manager page picks it up automatically.
//
// height / maxWidth are only used to size the LIVE iframe when someone has
// pasted custom code into a slot. When a slot has no custom code saved,
// the page's own default markup (passed as <AdSlot> children) is shown
// instead, so nothing changes until an editor actually fills it in.
//
// `section` groups slots in the Ads Manager UI. Slots with no `section`
// are treated as 'site' (the original 7-banner list). 'article' slots
// render in their own "Ads In Article" section below that.

export const AD_SLOTS = [
  {
    id: 'banner-1',
    label: 'Banner 1 — Top Header Banner',
    location: 'SiteHeader.jsx — above the main nav, desktop only',
    size: '728 × 90',
    height: 90,
    maxWidth: 728,
    section: 'site',
  },
  {
    id: 'banner-2',
    label: 'Banner 2 — theSun i-paper Promo',
    location: 'HomePage.jsx — sidebar, right under Latest News',
    size: 'Responsive width, auto height',
    height: 200,
    maxWidth: null,
    section: 'site',
  },
  {
    id: 'banner-3',
    label: 'Banner 3 — Sidebar Advertisement',
    location: 'AdBanner.jsx — sidebar, between Opinion and Instagram promo',
    size: '3:1 aspect ratio',
    height: 160,
    maxWidth: 480,
    section: 'site',
  },
  {
    id: 'banner-4',
    label: 'Banner 4 — Instagram Promo',
    location: 'HomePage.jsx — sidebar, right under the Ad banner',
    size: 'Responsive width, auto height',
    height: 200,
    maxWidth: null,
    section: 'site',
  },
  {
    id: 'banner-5',
    label: 'Banner 5 — App Promo Banner',
    location: 'AppPromoBanner.jsx — under the Sports News block (needs file)',
    size: 'Full width, ~120px tall',
    height: 120,
    maxWidth: null,
    section: 'site',
  },
  {
    id: 'banner-6',
    label: 'Banner 6 — Campaign / Merdeka Banner',
    location: 'Near the Malaysia / Asia / World grid (needs file)',
    size: '~300 × 300 (square)',
    height: 300,
    maxWidth: 300,
    section: 'site',
  },
  {
    id: 'banner-7',
    label: 'Banner 7 — Digital Advertisement',
    location: 'Sidebar.jsx — bottom "Ads Banner" placeholder',
    size: 'Responsive width, min-height 250',
    height: 250,
    maxWidth: null,
    section: 'site',
  },
  {
    id: 'article-ad-banner',
    label: 'Article Ad Banner — In-Article',
    location: 'ArticlePage.jsx — end of article body, above the "Stay Current" banner. Appears on every article.',
    size: 'Responsive width, ~250px tall',
    height: 250,
    maxWidth: 728,
    section: 'article',
  },
]

// Convenience helpers so pages don't have to filter on `section` themselves.
export const SITE_AD_SLOTS = AD_SLOTS.filter(s => (s.section || 'site') === 'site')
export const ARTICLE_AD_SLOTS = AD_SLOTS.filter(s => s.section === 'article')
