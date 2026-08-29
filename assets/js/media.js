/* ==========================================================================
   The Leather Store — media.js
   Generates on-brand SVG artwork (as data URIs) for products, categories and
   hero slides, so the site is complete and offline-safe before real photos
   exist. Any product that defines `images: [...]` uses those instead.
   See README.md ▸ "Adding your own photos".
   ========================================================================== */
(function (global) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});

  /* ---------- Palettes ---------- */
  var PALETTES = [
    ["#4A3226", "#241812"],
    ["#6B4423", "#33200F"],
    ["#C08552", "#7E4F27"],
    ["#54382A", "#241812"],
    ["#7D6B5D", "#40352C"],
    ["#B8873B", "#6B4A18"],
    ["#33463F", "#18211E"],
    ["#8A5A30", "#3C2413"],
    ["#3A3F4B", "#1B1F27"],
    ["#7A3F3F", "#361A1A"]
  ];

  /* ---------- Silhouettes (drawn in a 400 × 300 art space) ---------- */
  var ART = {
    shoes:
      '<path d="M56 232C48 214 50 186 62 176C74 166 92 162 112 158C140 152 166 142 192 128C216 115 240 100 262 92C282 85 302 88 314 100C326 112 330 130 336 146C342 162 356 176 362 194C368 212 356 232 336 236L80 240C66 241 60 238 56 232Z"/>' +
      '<rect x="46" y="230" width="330" height="24" rx="12" fill="none"/>' +
      '<path d="M298 94C310 118 316 148 318 176" fill="none"/>' +
      '<path d="M168 152L200 138M194 166L226 152M220 180L252 166" fill="none"/>',
    sandals:
      '<path d="M62 216C56 202 68 190 88 188L318 178C342 176 356 188 352 204C348 220 330 230 306 232L96 236C76 237 66 230 62 216Z"/>' +
      '<path d="M118 192C148 150 200 148 228 188" fill="none"/>' +
      '<path d="M206 184C236 148 282 150 306 182" fill="none"/>' +
      '<circle cx="332" cy="194" r="9"/>',
    sneakers:
      '<path d="M48 216C44 196 56 178 76 172C102 164 124 154 148 138C172 122 196 106 218 98C238 91 254 96 262 110C270 124 274 140 288 152C306 167 336 174 352 188C366 200 368 214 362 224L52 228Z"/>' +
      '<rect x="42" y="212" width="336" height="32" rx="16" fill="none"/>' +
      '<path d="M118 178C158 170 194 152 224 130" fill="none"/>' +
      '<path d="M328 190C334 176 338 164 342 152" fill="none"/>',
    sunglasses:
      '<rect x="66" y="108" width="136" height="98" rx="32"/>' +
      '<rect x="212" y="108" width="136" height="98" rx="32"/>' +
      '<path d="M202 132C205 121 209 121 212 132" fill="none"/>' +
      '<path d="M66 126L22 106M348 126L392 106" fill="none"/>',
    watches:
      '<path d="M156 100L150 24C149 14 155 8 165 8L235 8C245 8 251 14 250 24L244 100Z"/>' +
      '<path d="M156 200L150 276C149 286 155 292 165 292L235 292C245 292 251 286 250 276L244 200Z"/>' +
      '<circle cx="200" cy="150" r="64"/>' +
      '<circle cx="200" cy="150" r="47" fill="none"/>' +
      '<path d="M200 150L200 116M200 150L229 163" fill="none"/>' +
      '<rect x="263" y="139" width="15" height="22" rx="5"/>',
    handbags:
      '<path d="M96 132L304 132L326 264C328 276 320 284 308 284L92 284C80 284 72 276 74 264Z"/>' +
      '<path d="M146 132C146 80 174 56 200 56C226 56 254 80 254 132" fill="none"/>' +
      '<rect x="183" y="122" width="34" height="28" rx="7"/>' +
      '<path d="M76 180L324 180" fill="none" opacity="0.55"/>',
    wallets:
      '<rect x="76" y="98" width="248" height="166" rx="18"/>' +
      '<path d="M76 181L324 181" fill="none"/>' +
      '<rect x="198" y="70" width="110" height="66" rx="10" fill="none"/>' +
      '<path d="M110 218L190 218" fill="none"/>',
    "travel-bags":
      '<rect x="58" y="128" width="284" height="140" rx="58"/>' +
      '<path d="M154 132C154 106 176 94 200 94C224 94 246 106 246 132" fill="none"/>' +
      '<path d="M88 158L312 158" fill="none" opacity="0.6"/>' +
      '<path d="M118 268C118 302 282 302 282 268" fill="none"/>',
    perfumes:
      '<rect x="132" y="128" width="136" height="152" rx="22"/>' +
      '<rect x="178" y="98" width="44" height="34"/>' +
      '<rect x="169" y="50" width="62" height="50" rx="11"/>' +
      '<rect x="156" y="172" width="88" height="66" rx="7" fill="none"/>' +
      '<circle cx="240" cy="68" r="8"/>',
    _default:
      '<rect x="90" y="96" width="220" height="160" rx="20"/>' +
      '<path d="M90 176L310 176" fill="none"/>'
  };

  /* ---------- Helpers ---------- */
  function hash(str) {
    var h = 2166136261;
    str = String(str);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function toDataUri(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /**
   * Build a branded artwork tile.
   * @param {object} o
   *   w,h            canvas size
   *   art            category id used to pick the silhouette
   *   seed           string/number controlling palette + decor
   *   label          small uppercase caption (optional)
   *   title          large display caption (optional)
   *   artScale       silhouette scale multiplier (default fits width)
   *   align          "center" | "right"
   */
  function tile(o) {
    var w = o.w || 800;
    var h = o.h || 1000;
    var seed = hash(o.seed == null ? o.art || "tls" : o.seed);
    var pal = PALETTES[seed % PALETTES.length];
    var angle = seed % 2 ? "0,0 1,1" : "0,1 1,0";
    var x1 = angle.split(" ")[0].split(",")[0];
    var y1 = angle.split(" ")[0].split(",")[1];
    var x2 = angle.split(" ")[1].split(",")[0];
    var y2 = angle.split(" ")[1].split(",")[1];

    var artBody = ART[o.art] || ART._default;

    /* Fit the 400×300 art space into the canvas */
    var align = o.align || "center";
    var base = align === "right" ? (w * 0.62) / 400 : (w * 0.82) / 400;
    var s = base * (o.artScale || 1);
    var artW = 400 * s;
    var artH = 300 * s;
    var tx = align === "right" ? w - artW - w * 0.06 : (w - artW) / 2;
    var ty = (h - artH) / 2 + (o.artShiftY || 0) * h;

    /* Decorative blobs, deterministic per seed */
    var d1x = (seed % 60) / 100 + 0.08;
    var d1y = ((seed >> 3) % 60) / 100 + 0.1;
    var d2x = ((seed >> 6) % 70) / 100 + 0.2;
    var d2y = ((seed >> 9) % 70) / 100 + 0.15;

    /* Trailing letter-spacing offsets a text-anchor="middle" run, so nudge back */
    var monoTrack = Math.round(w * 0.02);
    var mono =
      '<text x="' +
      (w / 2 - monoTrack / 2) +
      '" y="' +
      h * 0.62 +
      '" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" ' +
      'font-size="' +
      Math.round(Math.min(w, h) * 0.46) +
      '" font-weight="600" fill="#ffffff" opacity="0.045" letter-spacing="' +
      monoTrack +
      '">TLS</text>';

    var caption = "";
    if (o.title) {
      caption +=
        '<text x="' +
        w * 0.5 +
        '" y="' +
        h * 0.9 +
        '" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="' +
        Math.round(w * 0.075) +
        '" fill="#ffffff" opacity="0.9">' +
        esc(o.title) +
        "</text>";
    }
    if (o.label) {
      caption +=
        '<text x="' +
        w * 0.5 +
        '" y="' +
        h * 0.955 +
        '" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="' +
        Math.round(Math.max(11, w * 0.026)) +
        '" font-weight="600" letter-spacing="' +
        Math.max(2, Math.round(w * 0.008)) +
        '" fill="#ffffff" opacity="0.5">' +
        esc(String(o.label).toUpperCase()) +
        "</text>";
    }

    var strokeW = Math.max(2, Math.round(3 / s));

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      w +
      " " +
      h +
      '" width="' +
      w +
      '" height="' +
      h +
      '" role="img">' +
      "<defs>" +
      '<linearGradient id="g" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '">' +
      '<stop offset="0" stop-color="' + pal[0] + '"/>' +
      '<stop offset="1" stop-color="' + pal[1] + '"/>' +
      "</linearGradient>" +
      '<radialGradient id="s" cx="0.28" cy="0.2" r="0.9">' +
      '<stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>' +
      '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>' +
      "</radialGradient>" +
      "</defs>" +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g)"/>' +
      '<circle cx="' + Math.round(w * d1x) + '" cy="' + Math.round(h * d1y) + '" r="' + Math.round(w * 0.34) + '" fill="#ffffff" opacity="0.045"/>' +
      '<circle cx="' + Math.round(w * (1 - d2x)) + '" cy="' + Math.round(h * (1 - d2y)) + '" r="' + Math.round(w * 0.26) + '" fill="#000000" opacity="0.07"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#s)"/>' +
      mono +
      '<g transform="translate(' + tx.toFixed(1) + "," + ty.toFixed(1) + ") scale(" + s.toFixed(4) + ')" ' +
      'fill="#ffffff" fill-opacity="0.16" stroke="#ffffff" stroke-opacity="0.62" stroke-width="' + strokeW + '" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      artBody +
      "</g>" +
      caption +
      "</svg>";

    return toDataUri(svg);
  }

  /* ---------- Public API ---------- */
  var art = {
    tile: tile,

    /** Product image. `variant` 0..n gives distinct gallery angles. */
    product: function (p, variant) {
      if (p.images && p.images.length) {
        return p.images[Math.min(variant || 0, p.images.length - 1)];
      }
      var v = variant || 0;
      return tile({
        w: 800,
        h: 1000,
        art: p.category,
        seed: p.id + "::" + v,
        label: p.categoryName,
        artScale: [1, 0.86, 1.1, 0.94][v % 4],
        artShiftY: [0, -0.03, 0.03, 0][v % 4]
      });
    },

    /** How many gallery images a product has. */
    productImageCount: function (p) {
      return p.images && p.images.length ? p.images.length : 4;
    },

    /** Category tile / mega-menu thumbnail. */
    category: function (cat, w, h) {
      return tile({
        w: w || 900,
        h: h || 700,
        art: cat.id,
        seed: "cat::" + cat.id,
        artScale: 0.82
      });
    },

    /** Wide hero background. */
    hero: function (catId, seed) {
      return tile({
        w: 1600,
        h: 900,
        art: catId,
        seed: "hero::" + (seed || catId),
        align: "right",
        artScale: 1.05
      });
    },

    /** Editorial / story image. */
    story: function (seed, artId) {
      return tile({
        w: 1200,
        h: 900,
        art: artId || "shoes",
        seed: "story::" + seed,
        artScale: 0.9
      });
    },

    /** Circular monogram avatar from a person's name. */
    avatar: function (name, size) {
      var sz = size || 520;
      var seed = hash(name || "TLS");
      var pal = PALETTES[seed % PALETTES.length];
      var initials = String(name || "TLS")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (w) {
          return w.charAt(0).toUpperCase();
        })
        .join("");
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + sz + " " + sz + '" width="' + sz + '" height="' + sz + '" role="img">' +
        '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/>' +
        "</linearGradient></defs>" +
        '<rect width="' + sz + '" height="' + sz + '" fill="url(#a)"/>' +
        '<circle cx="' + sz * 0.28 + '" cy="' + sz * 0.24 + '" r="' + sz * 0.36 + '" fill="#ffffff" opacity="0.07"/>' +
        '<text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="' +
        Math.round(sz * 0.4) +
        '" fill="#ffffff" opacity="0.92" letter-spacing="' + Math.round(sz * 0.02) + '">' +
        esc(initials) +
        "</text></svg>";
      return toDataUri(svg);
    },

    /** Brand mark used in the header, footer and favicon. */
    logoSvg: function (size) {
      var s = size || 42;
      return (
        '<svg class="brand__mark" viewBox="0 0 64 64" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
        "<defs><linearGradient id='tlsLogo' x1='0' y1='0' x2='1' y2='1'>" +
        "<stop offset='0' stop-color='#C08552'/><stop offset='1' stop-color='#8A5A30'/>" +
        "</linearGradient></defs>" +
        "<rect x='2' y='2' width='60' height='60' rx='16' fill='#241812'/>" +
        "<rect x='6' y='6' width='52' height='52' rx='13' fill='none' stroke='url(#tlsLogo)' stroke-width='1.6'/>" +
        "<path d='M18 23h28' stroke='#E0B973' stroke-width='2.4' stroke-linecap='round'/>" +
        "<path d='M32 23v22' stroke='#E0B973' stroke-width='2.4' stroke-linecap='round'/>" +
        "<path d='M22 45c4-3 6-7 6-11M42 45c-4-3-6-7-6-11' stroke='#C08552' stroke-width='2.2' stroke-linecap='round' fill='none'/>" +
        "</svg>"
      );
    }
  };

  TLS.art = art;
  TLS.hash = hash;
})(window);
