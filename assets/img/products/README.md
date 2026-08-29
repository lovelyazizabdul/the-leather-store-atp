# Product photos

Drop your real product photos in this folder, then point to them from
`assets/js/data/products.js`.

## How it works

Until a product has its own `images`, the site draws an elegant, on-brand SVG
illustration for it automatically (see `assets/js/media.js`). Nothing is broken
and nothing is missing — it just is not a photograph yet.

## Adding photos to a product

1. Save 3–5 photos per product here, e.g.

   ```
   assets/img/products/wexford-cap-toe-oxford-1.jpg
   assets/img/products/wexford-cap-toe-oxford-2.jpg
   assets/img/products/wexford-cap-toe-oxford-3.jpg
   ```

2. Open `assets/js/data/products.js`, find the product, and add an `images`
   array (the first image is the one used on the card):

   ```js
   { c: "shoes", n: "Wexford Cap-Toe Oxford", p: 5499, m: 7999, /* … */,
     images: [
       "assets/img/products/wexford-cap-toe-oxford-1.jpg",
       "assets/img/products/wexford-cap-toe-oxford-2.jpg",
       "assets/img/products/wexford-cap-toe-oxford-3.jpg"
     ],
     video: "assets/video/wexford-cap-toe-oxford.mp4"
   }
   ```

3. Refresh. That product now uses your photos everywhere — cards, gallery,
   thumbnails and the modal.

## Recommended specs

| Use              | Size          | Ratio | Format        | Target weight |
| ---------------- | ------------- | ----- | ------------- | ------------- |
| Product photo    | 1000 × 1250   | 4:5   | `.webp`/`.jpg` | under 180 KB  |
| Owner portrait   | 800 × 800     | 1:1   | `.webp`/`.jpg` | under 120 KB  |
| Social share img | 1200 × 630    | 1.91:1| `.jpg`         | under 250 KB  |

Tips
- Shoot on a plain, light background with a single soft light source.
- Keep the product in the same position across the set so the gallery does not
  jump between images.
- Compress with [Squoosh](https://squoosh.app) before uploading.
