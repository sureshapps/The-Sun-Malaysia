Build a Complete News Website Using WordPress REST API

Create a fully responsive, modern, professional news portal inspired by the layout, structure, and user experience of https://www.freemalaysiatoday.com

The website must function as a complete news platform and retrieve all content dynamically from the following WordPress REST API:

API Source:
https://thesun.my/wp-json/wp/v2/

# Core Requirements

1. Frontend Only Architecture

* Do not create any backend, database, CMS, or server-side content management system.
* The entire website must operate as a frontend application.
* All content must be fetched directly from the provided WordPress REST API.
* Use API calls for:

  * News articles
  * Categories
  * Tags
  * Featured images
  * Authors
  * Latest posts
  * Related posts
  * Popular content sections
  * Search results
  * Archives
  * Pagination

---

 2. Branding & Logo

* Use the attached image as the official logo of the news website.
* Create a professional news-brand identity around this logo.
* Ensure the logo is prominently displayed in:

  * Header
  * Mobile navigation
  * Footer
  * Browser favicon (optional)

---

3. Homepage Design

Design a homepage similar in quality and structure to Free Malaysia Today, including:

# Hero Section

* Breaking news banner
* Main featured article
* Large featured image
* Headline
* Category label
* Publication date

# Top Stories Section

* Grid layout
* Thumbnail images
* Article excerpts
* Read-more links

# Latest News Feed

* Infinite scroll or pagination
* Chronological article listing

# Category Blocks

Automatically generate sections from API categories, such as:

* Malaysia
* Business
* World
* Sports
* Lifestyle
* Technology
* Education
* Opinion
* Entertainment

Each category section should display:

* Featured story
* Secondary stories
* Thumbnail cards

---

4. Navigation System

# Desktop Navigation

* Sticky header
* Logo
* Search bar
* Category menu
* Dropdown navigation

# Mobile Navigation

* Hamburger menu
* Responsive slide-out navigation
* Search functionality

---

# 5. Single Article Page

Create a professional article reading experience including:

# Article Header

* Title
* Subtitle (if available)
* Author
* Publish date
* Category
* Featured image

# Article Content

* Proper typography
* Responsive images
* Embedded media support
* Clean reading layout

# Sidebar Widgets

* Latest News
* Trending Stories
* Category List
* Popular Articles

# Bottom Section

* Related Articles
* Previous/Next Article Navigation
* Social Sharing Buttons

---

6. Category Pages

Generate category archive pages dynamically from API data.

Each category page should contain:

* Category title
* Description (if available)
* Article listing
* Pagination
* Featured article at top

Example URLs:

/category/malaysia
/category/business
/category/world


---

7. Search Functionality

Implement real-time search using the API.

Features:

* Search articles by keyword
* Live suggestions
* Search results page
* Highlight matched terms

---

8. Sidebar Widgets

Create dynamic widgets populated from the API:

* Latest News
* Most Recent Articles
* Popular Categories
* Editor's Picks
* Trending Stories
* Related Posts
* Tag Cloud
* Newsletter Signup UI (frontend only)

---

9. News Cards & Components

Create reusable components for:

# Large Feature Card

* Large image
* Headline
* Excerpt

# Medium News Card

* Thumbnail
* Title
* Date

# Small List Card

* Thumbnail
* Headline only

# Breaking News Ticker

* Auto-scrolling headlines

---

10. Image Handling

All article images must be automatically retrieved from the API.

Requirements:

* Lazy loading
* Responsive images
* Fallback image when unavailable
* Optimized loading performance

---

11. Performance Optimization

* Lazy load images
* API response caching
* Skeleton loaders
* Infinite scrolling where appropriate
* SEO-friendly structure
* Fast page rendering

---

12. Responsive Design

Must be fully responsive for:

* Desktop
* Laptop
* Tablet
* Mobile

Follow modern news portal design standards.

---

13. SEO Structure

Implement:

* Dynamic page titles
* Meta descriptions
* Open Graph tags
* Twitter Cards
* Structured NewsArticle schema markup
* Canonical URLs

---

14. Technology Stack

Preferred stack:

* Next.js 15+
* React
* TypeScript
* Tailwind CSS
* Axios or Fetch API
* Server Components where applicable

Alternative:

* React + Vite + Tailwind CSS

---

15. Deliverables

Build a complete production-ready news website that:

* Closely resembles the professional structure of Free Malaysia Today.
* Uses the provided logo as the primary brand identity.
* Retrieves 100% of articles, categories, images, authors, and content dynamically from:
  [https://thesun.my/wp-json/wp/v2/](https://thesun.my/wp-json/wp/v2/)
* Requires **no backend development**.
* Is fully responsive, SEO-friendly, and optimized for performance.
* Includes Homepage, Category Pages, Single Article Pages, Search, Navigation, Widgets, and Dynamic Content Sections.

The final result should look and function like a modern, premium Malaysian news portal rather than a simple blog or news feed.

