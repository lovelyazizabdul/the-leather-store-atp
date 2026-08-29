# The Leather Store — storefront website

A fast, responsive, accessible catalogue website for an offline leather-goods
boutique.

**Every word, price, image and video on the site comes from the JSON files in
the `content/` folder.** You never need to touch HTML, CSS or JavaScript to
update the shop.

No build step, no framework, no dependencies — plain HTML, CSS and JS that can
be dropped onto any host that serves static files.

---

## 1. Run it locally

```powershell
# Node
npm run dev            # http://localhost:5173

# or Python
python -m http.server 5173
```

Then open <http://localhost:5173>.

> **A local server is required.** Double-clicking `index.html` will not work,
> because browsers block reading local JSON files from `file://`. If you try,
> the page tells you exactly what to run.

---

## 2. The content folder — this is all you edit

| File | What it controls | How often you'll touch it |
| ---- | ---------------- | ------------------------- |
| `content/products.json` | **Your whole stock list** + categories, colours, size presets | Every time stock changes |
| `content/site.json` | Shop name, phone, WhatsApp, email, address, map pin, opening hours, social links, your bio, header, footer, product pop-up wording | Rarely |
| `content/home.json` | Landing page: hero slides, marquee, promises, section headings, story, reviews, closing call-to-action | Occasionally |
| `content/categories.json` | The "Shop by category" page wording | Rarely |
| `content/category.json` | Product-listing page wording: filter labels, sort options, empty-state message | Rarely |
| `content/contact.json` | Contact page wording: info cards, form labels, store policies | Rarely |
| `content/not-found.json` | The 404 page | Almost never |

Every file starts with a `"_help"` line explaining what it does. Save the file,
refresh the browser — that's the whole workflow.

> **Tip:** JSON is picky. A missing quote or a comma after the *last* item in a
> list will break the file. If something goes wrong the site shows you the exact
> file, line and reason instead of a blank page. Paste the file into
> <https://jsonlint.com> if you get stuck.

---

## 3. Adding new stock

### Step 1 — drop your files in

```
assets/img/products/oxford-black-1.jpg     ← product photos
assets/img/products/oxford-black-2.jpg
assets/video/oxford-black.mp4              ← product video
```

### Step 2 — add the product to `content/products.json`

Copy any existing block inside `"products"` and change it:

```json
{
  "name": "Oxford Black Cap-Toe",
  "category": "shoes",
  "price": 5499,
  "mrp": 7999,
  "images": ["oxford-black-1.jpg", "oxford-black-2.jpg"],
  "video": "oxford-black.mp4",
  "description": "A closed-lacing oxford with a crisp cap toe…",
  "colors": ["Black", "Cognac"],
  "sizes": "@shoesMen",
  "gender": "Men",
  "material": "Full-Grain Leather",
  "style": "Formal",
  "rating": 4.8,
  "inStock": true,
  "bestseller": true,
  "new": true
}
```

Save, refresh. The product appears on the home page, in its category, in the
filters, in the search counts and in the pop-up — with your photos and video.

### The product fields

| Field | Meaning |
| ----- | ------- |
| `name` | **Required.** Also becomes the product's web address (`#p=oxford-black-cap-toe`) |
| `category` | **Required.** Must match an `id` in the `categories` list |
| `price` | **Required.** Number only — no symbols, no commas. `5499` |
| `mrp` | Struck-through "before" price. The % off badge is worked out for you |
| `images` | File names from `assets/img/products/`. First one is the card photo. `[]` = generated artwork |
| `video` | File name from `assets/video/`. `""` = the shared demo clip |
| `description` | Shown in the pop-up |
| `colors` | Names from the `colors` list at the top of the file. Drives the colour filter and swatches |
| `sizes` | A list, or `"@shoesMen"` / `"@shoesWomen"` / `"@bags"` to reuse a preset |
| `gender` | `Men`, `Women` or `Unisex` — drives the gender filter |
| `material`, `style` | Free text — they become filter options automatically |
| `rating` | 0–5, shown on the card |
| `inStock` | `false` shows a **Sold out** badge and changes the pop-up wording |
| `bestseller`, `new` | `true` shows a **Bestseller** / **New in** badge and feeds the "Counter favourites" row |
| `features` | Optional bullet list. Leave it out and sensible bullets are written for you |
| Extras | `shape`, `lens` (sunglasses), `movement`, `strap` (watches), `family`, `concentration` (perfumes) — each becomes a filter |

`id`, `sku`, the discount %, the review count and the filter lists are all
generated automatically. You never maintain them.

### Everyday jobs

| I want to… | Do this |
| ---------- | ------- |
| Change a price | Edit `price` (and `mrp`) on that product |
| Mark something sold out | `"inStock": false` |
| Flag new arrivals | `"new": true` |
| Add real photos | Copy files into `assets/img/products/`, list the names in `images` |
| Add a video | Copy the file into `assets/video/`, put the name in `video` |
| Add a whole new category | Add a block to `categories`, then give products that `category` id |
| Add a new colour | Add `"Teal": "#0f6f6a"` to the `colors` list, then use `"Teal"` on products |
| Change a heading anywhere | Find the page's JSON file and edit the text |
| Change phone / address / hours | `content/site.json` |

### Image and video specs

| Use | Size | Format | Target |
| --- | ---- | ------ | ------ |
| Product photo | 1000 × 1250 (4:5) | `.webp` / `.jpg` | under 180 KB |
| Category tile | 900 × 700 | `.webp` / `.jpg` | under 200 KB |
| Hero slide | 1600 × 900 | `.webp` / `.jpg` | under 300 KB |
| Owner portrait | 800 × 800 | `.webp` / `.jpg` | under 120 KB |
| Product video | 1080 × 1080, 8–20 s | `.mp4` (H.264) | under 4 MB |

Compress with <https://squoosh.app>. For video:

```bash
ffmpeg -i input.mov -vf "scale=1080:-2" -c:v libx264 -crf 26 -preset slow \
       -movflags +faststart -c:a aac -b:a 96k output.mp4
```

Anything you leave empty falls back to on-brand generated artwork, so the site
is never broken while you gather photos.

---

## 4. Go-live checklist

Open `content/site.json` and replace these:

- [ ] `brand.name`, `brand.tagline`, `brand.url`
- [ ] `contact.phoneDisplay`, `contact.phone`, `contact.whatsapp`, `contact.email`
- [ ] `address` (all lines)
- [ ] **`map.lat` / `map.lng`** — right-click your shop on
      <https://www.openstreetmap.org> → *Show address*, copy the two numbers
- [ ] `map.directionsUrl` — paste a share link from Google Maps; every
      "Get directions" button uses it
- [ ] `hours` — each day lists its open windows as `"HH:MM-HH:MM"` in 24-hour
      time. Add a second window for a lunch break, e.g.
      `"shifts": ["10:00-14:30", "17:00-21:30"]`, or use `"shifts": []` for a
      closed day. The live "Open now / Closed" badge follows this automatically.
- [ ] `social.instagram`, `social.facebook`, `social.telegram`
- [ ] `owner` — your name, role, bio and photo
- [ ] `media.demoVideo` — replace with one of your own clips
- [ ] `commerce.currency` / `locale` if you are not selling in ₹

Then, outside the content folder:

- [ ] `<link rel="canonical">` in each `.html`
- [ ] Your domain in `robots.txt` and `sitemap.xml`
- [ ] Replace `assets/img/og-image.svg` with a 1200 × 630 **JPG or PNG** (some
      social networks do not render SVG previews)

---

## 5. Deploying to a domain

The site is a folder of static files. Upload it as-is — including `content/`.

<details>
<summary><b>Netlify</b> (easiest — drag & drop)</summary>

1. Go to <https://app.netlify.com/drop>
2. Drag the whole `the-leather-store` folder onto the page.
3. **Site settings → Domain management → Add custom domain.**

`netlify.toml` already sets caching, security headers and the 404 page, and
marks `content/*.json` as never-cached so your edits go live immediately.
</details>

<details>
<summary><b>Vercel</b></summary>

```bash
npx vercel --prod
```

Framework preset "Other", output directory `.`. `vercel.json` supplies headers.
</details>

<details>
<summary><b>GitHub Pages</b></summary>

Push the folder, then **Settings → Pages → Deploy from a branch → `main` /
`(root)`**. Note: GitHub Pages ignores `.htaccess` / `netlify.toml` /
`vercel.json`, so security headers must come from your CDN instead.
</details>

<details>
<summary><b>cPanel / shared hosting / Apache</b></summary>

1. Zip the folder, upload in **File Manager**, extract into `public_html`.
2. `.htaccess` handles gzip, caching, pretty URLs, the 404 page and headers.
3. Enable the free **Let's Encrypt** certificate, then uncomment the HTTPS
   redirect near the top of `.htaccess`.
</details>

**Updating content after launch:** edit the JSON file, re-upload just that one
file. Nothing else needs to change and no rebuild is required.

---

## 6. What is in the box

```
the-leather-store/
├── content/                  ← EVERYTHING YOU EDIT LIVES HERE
│   ├── site.json                 Shop details, header, footer, product pop-up
│   ├── products.json             Categories + your stock list
│   ├── home.json                 Landing page
│   ├── categories.json           Categories page
│   ├── category.json             Product listing page
│   ├── contact.json              Contact page
│   └── not-found.json            404 page
├── index.html                Landing page — hero carousel + full catalog
├── categories.html           All nine collections
├── category.html             Filtered listing (?cat=shoes)
├── contact.html              Map, bio, hours, enquiry form, policies
├── 404.html                  Styled not-found page
├── assets/
│   ├── css/  base · components · pages
│   ├── js/
│   │   ├── content.js            Loads the JSON, resolves media paths, boots
│   │   ├── catalog.js            Turns products.json into the live catalog
│   │   ├── icons.js              Inline SVG icon set
│   │   ├── media.js              Generated placeholder artwork
│   │   ├── ui.js                 Header, footer, cards, helpers, SEO schema
│   │   ├── modal.js              Product pop-up: gallery + video + enquiry
│   │   └── home / categories / category / contact / notfound .js
│   ├── img/products/         ← your product photos
│   ├── img/categories/       ← optional category tile photos
│   ├── img/hero/             ← optional hero slide photos
│   └── video/                ← your product videos
├── .htaccess  netlify.toml  vercel.json
├── robots.txt  sitemap.xml  site.webmanifest
└── package.json  .gitignore  README.md
```

### Icon names you can use in the JSON

`award` `box` `check` `chevronDown` `chevronLeft` `chevronRight` `chevronUp`
`clock` `copy` `eye` `gift` `grid` `heart` `home` `mail` `navigation` `phone`
`pin` `play` `refresh` `ruler` `share` `shield` `sliders` `sparkle` `star`
`tag` `truck` `instagram` `facebook` `telegram` `whatsapp`

### Text placeholders you can use in the JSON

`{STORE}` `{TAGLINE}` `{ESTABLISHED}` `{YEAR}` `{PHONE}` `{EMAIL}` `{CITY}`
`{STREET}` `{ADDRESS}` `{PRODUCTS}` `{CATEGORIES}`

Wrap a word in `{curly braces}` inside any **title** to make it italic gold —
for example `"Leather that {remembers} you"`.

---

## 7. Features

**Layout & navigation** — shared header/footer from a single source, sticky
header with a desktop mega-menu and mobile drawer, breadcrumbs, back-to-top and
a floating WhatsApp button.

**Landing page** — auto-playing hero carousel (swipe, arrows, progress dots,
keyboard, pauses on hover/focus/tab-blur, respects `prefers-reduced-motion`),
plus the complete catalogue grouped by category with quick tabs.

**Category pages** — faceted filters with live option counts, dual price
slider, in-stock toggle, six sort orders, removable chips, and filter state
written to the URL so a filtered view can be bookmarked and shared. Filters
collapse into a drawer on tablet and mobile.

**Product pop-up** — multi-image gallery with thumbnails, arrows, swipe and
keyboard; product video with poster frame, `playsinline` and `preload="none"`;
full specs; deep-linkable (`#p=product-id`); native share; one-tap WhatsApp
enquiry with the product pre-filled.

**Contact page** — Leaflet + OpenStreetMap (free, **no API key**), branded pin
and directions link, graceful fallback if the map library cannot load, live
open/closed status, bio, policies, and a validated enquiry form that hands off
to WhatsApp (no backend, nothing stored).

**Quality** — responsive from 320 px to ultra-wide with fluid type; iOS/Android
safe-area insets and `svh` units; keyboard accessible throughout with focus
traps and live regions; `LocalBusiness` JSON-LD, Open Graph, sitemap, robots and
a web app manifest; zero third-party trackers.

---

## 8. Notes

- **OpenStreetMap tiles** are free but rate-limited. Under heavy traffic, swap
  `map.tileUrl` in `content/site.json` for MapTiler, Stadia Maps or
  Thunderforest (all have free tiers).
- **The contact form has no server.** It builds a WhatsApp message. To receive
  emails instead, point the form at Formspree, Basin or a Netlify Form.
- **Content Security Policy** in the hosting configs allows inline styles and
  scripts (used by the JSON-LD block and a few inline `style` attributes).
  Tighten it with hashes if your host supports it.
- Tested on evergreen Chrome, Edge, Firefox and Safari, plus iOS Safari 13+ and
  Android Chrome. Nothing is transpiled — the code sticks to widely supported
  syntax.
