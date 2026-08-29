# The Leather Store — storefront website

A fast, responsive, accessible catalogue website for an offline leather-goods
boutique. **No build step, no framework, no dependencies** — it is plain HTML,
CSS and JavaScript, so it can be dropped onto any host that serves static files.

---

## 1. Run it locally

Pick whichever you already have installed:

```powershell
# Node
npm run dev            # http://localhost:5173

# Python
python -m http.server 5173
```

Then open <http://localhost:5173>.

> You can also just double-click `index.html`. Everything works from `file://`
> except the "copy to clipboard" buttons and history-based deep links, which
> browsers restrict on local files.

---

## 2. Make it yours — the 5-minute checklist

Everything business-specific lives in **one file**:
[`assets/js/site.config.js`](assets/js/site.config.js). Search it for `TODO`.

| # | What to change | Where |
| - | -------------- | ----- |
| 1 | Phone, WhatsApp number, email | `site.config.js` → `phone`, `whatsapp`, `email` |
| 2 | Shop address | `site.config.js` → `address` |
| 3 | **Map pin coordinates** | `site.config.js` → `geo.lat` / `geo.lng` |
| 4 | Opening hours | `site.config.js` → `hours` |
| 5 | Instagram / Facebook / Telegram links | `site.config.js` → `social` |
| 6 | Your bio, name, photo | `site.config.js` → `owner` |
| 7 | Live domain | `site.config.js` → `url`, plus `<link rel="canonical">` in each `.html`, `robots.txt` and `sitemap.xml` |
| 8 | Demo product video | `site.config.js` → `demoVideo` (see `assets/video/README.md`) |

### Finding your exact coordinates

1. Open <https://www.openstreetmap.org> (or Google Maps).
2. Right-click your shop → **Show address** / **What's here?**
3. Copy the two numbers, e.g. `12.9755, 77.6045`.
4. Paste them into `geo: { lat: 12.9755, lng: 77.6045, zoom: 16 }`.

### Products

The whole catalogue lives in
[`assets/js/data/products.js`](assets/js/data/products.js). Each product is one
object; the shorthand keys are documented at the top of the file.

- **Add a product:** copy any line in the `RAW` array and edit it.
- **Add a category:** add an entry to `CATEGORIES` and add an artwork
  silhouette with the same `id` in `assets/js/media.js` (`ART` object).
- **Add photos/videos:** see `assets/img/products/README.md`.

Product IDs, SKUs, discounts, review counts and feature bullets are all derived
automatically — you only supply the essentials.

---

## 3. Deploying to a domain

The site is a folder of static files. Upload it as-is.

<details>
<summary><b>Netlify</b> (easiest — drag & drop)</summary>

1. Go to <https://app.netlify.com/drop>
2. Drag the whole `the-leather-store` folder onto the page.
3. **Site settings → Domain management → Add custom domain.**
4. At your registrar, point the domain at Netlify's nameservers (or add the
   `CNAME`/`A` records Netlify shows you).

`netlify.toml` already sets caching, security headers and the 404 page.
</details>

<details>
<summary><b>Vercel</b></summary>

```bash
npx vercel --prod
```

Choose "Other" as the framework preset and `.` as the output directory.
`vercel.json` supplies headers and redirects.
</details>

<details>
<summary><b>GitHub Pages</b></summary>

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.**
3. Add a `CNAME` file containing your domain if you use a custom one.

Note: GitHub Pages ignores `.htaccess`, `netlify.toml` and `vercel.json`, so
security headers must be set at your CDN instead.
</details>

<details>
<summary><b>cPanel / shared hosting / any Apache server</b></summary>

1. Zip the folder, upload it in **File Manager**, and extract it into
   `public_html`.
2. `.htaccess` (already included) enables gzip, caching, pretty URLs, the 404
   page and security headers.
3. Enable the free **Let's Encrypt** SSL certificate, then uncomment the
   HTTPS-redirect block near the top of `.htaccess`.
</details>

<details>
<summary><b>Cloudflare Pages</b></summary>

Connect the repo, leave the build command empty and set the output directory to
`/`. Add the headers from `netlify.toml` in a `_headers` file if you want them.
</details>

---

## 4. What is in the box

```
the-leather-store/
├── index.html            Landing page — hero carousel + full catalog
├── categories.html       All nine collections
├── category.html         Filtered category listing (?cat=shoes)
├── contact.html          Map, bio, hours, enquiry form, policies
├── 404.html              Styled not-found page
├── assets/
│   ├── css/
│   │   ├── base.css          Design tokens, reset, typography, utilities
│   │   ├── components.css    Header, footer, cards, carousel, modal, filters
│   │   └── pages.css         Page-level compositions + responsive rules
│   ├── js/
│   │   ├── site.config.js    ← ALL business details live here
│   │   ├── data/products.js  ← The catalogue
│   │   ├── icons.js          Inline SVG icon set
│   │   ├── media.js          Generates on-brand placeholder artwork
│   │   ├── ui.js             Shared header, footer, cards, helpers, SEO schema
│   │   ├── modal.js          Product modal: gallery + video + enquiry
│   │   ├── home.js           Landing page
│   │   ├── categories.js     Categories index
│   │   ├── category.js       Faceted filtering + sorting + URL state
│   │   └── contact.js        Map, hours, bio, form validation
│   ├── img/                  Favicon, social image, your product photos
│   └── video/                Your product videos
├── .htaccess  netlify.toml  vercel.json    Hosting configs
├── robots.txt  sitemap.xml  site.webmanifest
└── package.json  .gitignore  README.md
```

---

## 5. Features

**Layout & navigation**
- Shared header and footer rendered from a single source, so they never drift
  between pages
- Sticky header with a desktop mega-menu and a mobile slide-in drawer
- Breadcrumbs on every inner page
- Back-to-top and floating WhatsApp buttons

**Landing page**
- Auto-playing hero carousel — swipe, arrows, dots with progress, keyboard
  arrows, pauses on hover/focus/tab-blur, and respects `prefers-reduced-motion`
- The complete store catalogue below the fold, grouped by category, with quick
  category tabs

**Category pages**
- Faceted filters: size, colour (with swatches), gender, material, style, frame
  shape, lens, movement, strap, fragrance family, concentration — whichever
  apply to that category
- Live option counts, dual price slider, in-stock toggle, six sort orders
- Removable filter chips and a "clear all" action
- Filter state is written to the URL, so a filtered view can be bookmarked and
  shared
- Filters collapse into a proper drawer on tablet and mobile

**Product modal**
- Multi-image gallery with thumbnails, arrows, swipe and keyboard navigation
- Product video with a poster frame, `playsinline` (no fullscreen hijack on
  iOS) and `preload="none"` so it costs nothing until played
- Full specs, sizes, colours, features and pricing
- Deep-linkable (`#p=product-id`), shareable via the native share sheet
- One-tap "Enquire on WhatsApp" with the product pre-filled

**Contact page**
- Leaflet + OpenStreetMap — free, open source, **no API key and no billing
  account required**, with a branded pin, popup and directions link
- Graceful fallback card if the map library cannot load
- Live "open now / closed" status derived from your opening hours
- Bio section, store policies, and a validated enquiry form that hands off to
  WhatsApp (no backend, nothing stored)

**Quality**
- Responsive from 320 px phones to ultra-wide desktops; fluid type and spacing
- iOS/Android safe-area insets, `100svh` units, no rubber-band scroll leaks
  behind modals
- Keyboard accessible throughout: focus traps, `aria-expanded`, `aria-current`,
  live regions, skip link, visible focus rings
- Honours `prefers-reduced-motion`
- `LocalBusiness`/`ClothingStore` JSON-LD, Open Graph and Twitter cards,
  sitemap, robots.txt and a web app manifest
- Zero third-party trackers

---

## 6. Browser support

Tested against evergreen Chrome, Edge, Firefox and Safari, plus iOS Safari 13+
and Android Chrome. There is no build step, so nothing is transpiled — the code
deliberately sticks to widely supported ES5/ES2017 syntax.

---

## 7. Notes & good hygiene

- **OpenStreetMap tiles** are free but rate-limited. If the site starts getting
  heavy traffic, swap the tile URL in `assets/js/contact.js` for a provider such
  as MapTiler, Stadia Maps or Thunderforest (all have free tiers).
- **Prices** are rendered with `Intl.NumberFormat` using `locale` and `currency`
  from `site.config.js` — change those two values for a different market.
- **The contact form has no server.** It builds a WhatsApp message. If you later
  want emailed submissions, point the form at Formspree, Basin or a Netlify
  Form; nothing else needs to change.
- **Content Security Policy** in the hosting configs currently allows inline
  styles and scripts (used by the JSON-LD block and a few inline `style`
  attributes). Tighten it with hashes if your host supports it.
- Replace `assets/img/og-image.svg` with a 1200 × 630 **JPG or PNG** before
  launch — some social networks do not render SVG previews.
