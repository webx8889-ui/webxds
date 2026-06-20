# Webx Website - Simple Project Documentation

---

## 1) What Is This Project?

This is the complete public website project for **Webx Design Studio**.

The main goals of the website are:

- Present the brand
- Explain services
- Showcase portfolio/case studies
- Publish blog content
- Collect leads (through contact/service forms)
- Improve Google visibility (SEO)

---

## 2) Simple Website User Journey

Typical visitor flow:

1. Visits the home page
2. Checks Services / Work / About / Blog pages
3. Fills the Contact or Service Form
4. Gets redirected to the Thank You page
5. The team receives the lead/email (via EmailJS integration)

---

## 3) What Has Been Done for SEO? (Important)

The project already includes a strong SEO setup:

### A) On-Page SEO

- Every main page has a **unique title**
- Every page has a **meta description**
- Page-level **canonical URLs** are set (to avoid duplicate indexing issues)
- Heading structure (H1/H2/H3) is used properly
- Images include descriptive **alt text**

### B) Social SEO (Sharing)

- Open Graph tags (`og:title`, `og:description`, `og:image`, etc.)
- Twitter card tags
- This improves how links preview on WhatsApp, LinkedIn, Facebook, and X

### C) Structured Data (Schema)

JSON-LD schema is implemented across pages, including:

- `Organization`
- `WebSite`
- `BreadcrumbList`
- `Service`
- `FAQPage`
- `AboutPage`
- `CollectionPage`
- `BlogPosting`
- `LocalBusiness`

This helps search engines understand page context more accurately.

### D) Technical SEO

- `sitemap.xml` is available
- `robots.txt` is available
- `manifest.json` + service worker are configured (PWA + caching support)
- Responsive/mobile-friendly layout is implemented

---

## 4) Project Files/Folders - Easy Explanation

## Root Level (Main Project Files)

- `index.html`  
  Website home page.

- `css/style.css`  
  Overall visual design (colors, spacing, layout, responsive behavior).

- `js/script.js`  
  Website interactions: sliders, menu, accordions, animations, form validation, share links, etc.

- `manifest.json`  
  PWA/app-install behavior settings.

- `sw.js`  
  Service worker file for caching/offline-like behavior.

- `robots.txt`  
  Search engine crawl instructions.

- `sitemap.xml`  
  Search engine page map.

- `PROJECT_README.md`  
  Developer-focused technical overview.

- `PROJECT_DOCUMENTATION.md`  
  This non-technical project document.

- `encoding-fix-report.md`  
  Encoding cleanup report.

---

## `pages/` Folder

This is the main folder containing internal website pages.

### `pages/main/`

- `about.html` - Company introduction
- `services.html` - Services details
- `work.html` - Portfolio listing
- `faq.html` - Frequently asked questions
- `contact-page.html` - Contact details and office information

### `pages/blogs/`

- `blogs.html` - Blog listing page (all blog cards, no slider)
- `blog.html` - Blog article 1
- `blog-apple.html` - Blog article 2
- `blog-3.html` - Blog article 3
- `blog-4.html` - Blog article 4

### `pages/details/` (Case Study Detail Pages)

- `ab-pdp.html`
- `de-pdp.html`
- `gurukrupa-pdp.html`
- `manglam-pdp.html`
- `mecon-pdp.html`
- `morphico-pdp.html`
- `tictax-pdp.html`

Each of these is a full project/client case study page.

### `pages/system/`

- `service-form.html` - Lead capture form
- `thank-you-page.html` - Success page after form submission
- `admin-dashboard.html` - Dashboard UI page (presentation/demo style)

### `pages/legal/`

- `privacy-policy.html` - Privacy policy
- `term-condition.html` - Terms and conditions

---

## `assets/` Folder

This folder contains website media/design resources:

- logos
- icons
- banners
- thumbnails
- client images
- blog images
- UI mockups
- illustrations

Important:

- `assets/images/icons/` includes favicon/app icons
- `assets/images/others/webx-og-image.webp` is used for social sharing preview

---

## `videos/` Folder

- Hero/background video files
- Showreel video content

---

## `gif/` Folder

- Year/timeline related GIF files

---

## Other Support Folders

- `.vscode/` - Local editor settings
- `root/` - duplicate copies of robots/sitemap/manifest


---

## 5) Contact Form System (Non-Technical View)

Form flow:

1. User fills out the form
2. Client-side validation runs
3. reCAPTCHA verification is required
4. Message is sent through EmailJS
5. User is redirected to the thank-you page

This means the website can collect leads even with a static front-end setup.

---

## 6) Quick SEO Checklist for Content Team

For every new page/blog:

1. Add a unique page title
2. Add a meta description
3. Set canonical URL
4. Set OG + Twitter title/description/image
5. Keep H1 clear and relevant
6. Add meaningful image alt text
7. Add internal links
8. Update `sitemap.xml`
9. Add the post to blog listing (`pages/blogs/blogs.html`)

---

## 7) What Non-Developers Can Safely Update

Without backend coding, the team can safely update:

- Blog content and images
- Portfolio text and images
- Service descriptions
- Contact details
- SEO titles/descriptions/canonical values
- FAQ content
- Legal page content
