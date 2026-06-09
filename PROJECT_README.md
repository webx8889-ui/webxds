# Webx Design Studio Website - Project README

## 1) Project Overview

This repository contains the full front-end codebase for the **Webx Design Studio** marketing website (`webxds.com`).

It is a **static multi-page website** built with:

- HTML
- CSS
- Vanilla JavaScript

There is no back-end application in this repo. All pages are rendered client-side, and the lead form uses third-party services.

### For non-technical readers

This project is the public website for a UI/UX agency. It showcases:

- The company profile
- Services
- Portfolio/case studies
- Blog articles
- Contact details and inquiry form
- Legal pages (privacy policy and terms)

It also includes a browser installable experience (PWA basics) and SEO metadata for discoverability.

## 2) High-Level Features

- Multi-page marketing site with consistent branding
- Portfolio and detailed project case-study pages
- Blog listing and blog detail pages
- Contact form with:
  - Validation
  - Google reCAPTCHA
  - EmailJS submission
- Thank-you flow after successful inquiry
- Mobile-friendly interactions (sliders, accordions, bottom nav, overlays)
- Service worker-based caching for basic offline behavior
- Rich SEO setup (meta tags, Open Graph, Twitter cards, JSON-LD schema)

## 3) Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (no framework)
- **External services/libraries:**
  - EmailJS Browser SDK (CDN)
  - Google reCAPTCHA
  - External fonts via CDN
  - Iconify/Tabler icons (admin dashboard page)
- **PWA files:** `manifest.json`, `sw.js`
- **No package manager/build tool** in this repo (no `package.json`, no bundler)

## 4) Repository Structure

```text
/
|- index.html
|- css/
|  |- style.css
|- js/
|  |- script.js
|- pages/
|  |- main/        (about, services, work, faq, contact)
|  |- details/     (portfolio case-study detail pages)
|  |- blogs/       (blog listing and articles)
|  |- legal/       (privacy policy, terms)
|  |- system/      (service form, thank-you page, admin dashboard UI)
|- assets/images/  (site images, icons, logos, thumbnails)
|- videos/         (hero/background/showreel videos)
|- gif/            (timeline GIF assets)
|- manifest.json
|- sw.js
|- robots.txt
|- sitemap.xml
|- root/           (duplicate copies of robots/sitemap/manifest)
|- *.html redirect stubs for case-study shortcuts
```

## 5) Page Inventory

### Primary pages

- `index.html` - homepage
- `pages/main/about.html`
- `pages/main/services.html`
- `pages/main/work.html`
- `pages/main/faq.html`
- `pages/main/contact-page.html`

### Portfolio detail pages

- `pages/details/ab-pdp.html`
- `pages/details/de-pdp.html`
- `pages/details/gurukrupa-pdp.html`
- `pages/details/manglam-pdp.html`
- `pages/details/mecon-pdp.html`
- `pages/details/morphico-pdp.html`
- `pages/details/tictax-pdp.html`

### Blog pages

- `pages/blogs/blog.html`
- `pages/blogs/blog-apple.html`
- `pages/blogs/blog-3.html`
- `pages/blogs/blog-4.html`

### Legal and system pages

- `pages/legal/privacy-policy.html`
- `pages/legal/term-condition.html`
- `pages/system/service-form.html`
- `pages/system/thank-you-page.html`
- `pages/system/admin-dashboard.html` (front-end UI concept page)

### Redirect helper pages (root-level)

- `ab-pdp.html`, `de-pdp.html`, `gurukrupa-pdp.html`, `manglam-pdp.html`, `mecon-pdp.html`, `morphico-pdp.html`, `tictax-pdp.html`

These pages instantly redirect to corresponding files in `pages/details/`.

## 6) Core Functional Architecture

## 6.1 Global styling

- Central stylesheet: `css/style.css`
- Includes all shared components and page styles
- Covers responsive behavior, sliders, accordions, nav, forms, cards, animations

## 6.2 Global JavaScript

- Main script: `js/script.js`
- Single shared script used across most/all pages
- Initializes only if matching DOM elements exist (defensive checks)

Main behavior groups inside the script include:

- Before/after slider
- Multiple carousel/slider systems (visual identity, blog, work, impact sections)
- Sticky navigation + active section logic
- Overlay "More" menu behavior
- Services and FAQ accordion interactions
- Footer accordion behavior for mobile
- Stats counter animations
- About page timeline/year switcher
- Scroll/visibility animation helpers
- Hero/showreel interactions and modal video
- Contact form validation and submit flow via EmailJS + reCAPTCHA
- Scroll-to-top button
- Social share link generation and copy-link logic

## 6.3 Contact and lead flow

Entry points:

- Service CTAs on multiple pages
- Direct form page: `pages/system/service-form.html`

Flow:

1. User fills required fields.
2. Client-side validation runs.
3. reCAPTCHA must be verified.
4. JavaScript sends form data through EmailJS service/template.
5. On success, user is redirected to `pages/system/thank-you-page.html`.

## 6.4 Admin dashboard page

- File: `pages/system/admin-dashboard.html`
- This is a rich front-end dashboard interface with mock data and UI interactions.
- Current implementation appears **UI/demo only**:
  - No auth layer
  - No database connection
  - No persisted CRUD operations

## 6.5 PWA and caching

- `manifest.json` defines app name, icons, colors, and standalone display mode.
- `sw.js` caches core assets and serves cached content first with network fallback.

## 7) SEO and Discoverability

The project includes:

- Canonical URLs
- Meta description per page
- Open Graph and Twitter cards
- Structured data (JSON-LD), including:
  - Organization
  - WebSite
  - BreadcrumbList
  - FAQPage (FAQ page)
  - Service / AboutPage / CollectionPage / BlogPosting depending on page
- `sitemap.xml`
- `robots.txt`

## 8) External Dependencies and Integrations

Configured directly in HTML/JS:

- EmailJS public initialization key and service/template IDs in `js/script.js`
- Google reCAPTCHA site key in `pages/system/service-form.html`
- External font CDNs
- Icon CDN calls in dashboard page

Important note:

- Because this is a front-end-only site, all client keys are visible in source. This is common for public browser integrations, but still requires proper provider-side restrictions.

## 9) Local Development

There is no compile/build step.

### Run locally

1. Open the project folder in VS Code.
2. Serve with Live Server (or any static file server).
3. Open `index.html`.

Repository hint:

- `.vscode/settings.json` sets Live Server port to `5501`.

### Test checklist (manual)

- Navigation links and route integrity
- Slider/accordion behavior on desktop + mobile widths
- Contact form validation errors
- reCAPTCHA callback enable/disable submit button
- EmailJS submit success/failure behavior
- Service worker registration in browser console
- SEO meta presence on key pages

## 10) Deployment Notes

This codebase is deployment-ready for any static host (Netlify, Vercel static output, GitHub Pages, shared hosting, etc.).

Typical production checks:

1. Ensure all absolute paths (`/assets/...`, `/css/...`) are valid for the target host root.
2. Confirm `sitemap.xml` and `robots.txt` are served from root.
3. Verify EmailJS and reCAPTCHA domain restrictions include production domain.
4. Clear service worker cache version in `sw.js` when releasing major content changes.

## 11) Project Metrics (current repository snapshot)

- HTML files: 29
- Shared CSS: `css/style.css` (~201 KB)
- Shared JS: `js/script.js` (~100 KB)
- Images/assets under `assets/`: 180 files
- Video files under `videos/`: 2 files

## 12) Current Quality Notes and Risks

- Some pages are minified into a single line, reducing maintainability.
- Some visible text contains encoding artifacts (for example mojibake sequences) due to character encoding mismatch.
- `robots.txt` uses backslashes in `Disallow` path (`/pages\system\admin-dashboard.html`), which is non-standard for URLs.
- `sitemap.xml` namespace URLs use `http:/` (single slash) instead of `http://`.
- The admin dashboard appears publicly reachable as a static page unless server rules block it.

---

If you are a new developer joining this project: start with `index.html`, `css/style.css`, and `js/script.js`, then review the `pages/` folder by section (`main`, `details`, `blogs`, `system`, `legal`) to understand all templates and content patterns.
