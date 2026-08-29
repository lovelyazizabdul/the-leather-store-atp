/* ==========================================================================
   The Leather Store — catalog.js
   Turns content/products.json into the in-memory catalog used by every page.
   Adds ids, SKUs, discounts, resolved media paths and auto-written features.
   ========================================================================== */
(function (global) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});

  /* Mutated in place so other scripts may capture a reference early. */
  var DATA = (TLS.DATA = {
    COLOR_HEX: {},
    CATEGORIES: [],
    FACET_LABELS: {},
    PILL_FACETS: {},
    PRODUCTS: []
  });

  var byId = {};
  var byCategoryId = {};

  function slugify(s) {
    return String(s)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function pad(n) {
    return n < 10 ? "00" + n : n < 100 ? "0" + n : String(n);
  }

  /** "@shoesMen" resolves against products.json → sizePresets */
  function resolveSizes(value, presets) {
    if (typeof value === "string" && value.charAt(0) === "@") {
      return (presets && presets[value.slice(1)]) || [];
    }
    return Array.isArray(value) ? value.slice() : [];
  }

  function autoFeatures(p) {
    var cfg = (TLS.SITE.product && TLS.SITE.product.autoFeatures) || {};
    var out = [];
    if (cfg.material && p.material) out.push(TLS.tpl(cfg.material, { MATERIAL: p.material.toLowerCase() }));
    if (cfg.sizes && p.sizes.length > 1) out.push(TLS.tpl(cfg.sizes, { SIZES: p.sizes.length }));
    if (cfg.colours && p.colors.length > 1) {
      out.push(TLS.tpl(cfg.colours, { COLOURS: p.colors.join(" or ").toLowerCase() }));
    }
    var perCat = (cfg.byCategory && cfg.byCategory[p.category]) || [];
    out = out.concat(perCat);
    if (cfg.warranty) out.push(cfg.warranty);
    return out;
  }

  /* Attributes that become filter facets when present on a product. */
  var EXTRA_KEYS = ["shape", "lens", "movement", "strap", "family", "concentration"];

  TLS.applyCatalog = function (json) {
    var presets = json.sizePresets || {};

    DATA.COLOR_HEX = json.colors || {};
    delete DATA.COLOR_HEX._help;

    DATA.FACET_LABELS = json.facetLabels || {};
    delete DATA.FACET_LABELS._help;

    DATA.PILL_FACETS = {};
    (json.pillFacets || []).forEach(function (k) {
      DATA.PILL_FACETS[k] = true;
    });

    byCategoryId = {};
    DATA.CATEGORIES = (json.categories || []).map(function (c) {
      var cat = Object.assign({}, c);
      cat.slug = cat.id;
      cat.count = 0;
      cat.imageUrl = TLS.media(cat.image, "categoryImages");
      byCategoryId[cat.id] = cat;
      return cat;
    });

    var seq = {};
    byId = {};

    DATA.PRODUCTS = (json.products || [])
      .filter(function (r) {
        return r && r.name && byCategoryId[r.category];
      })
      .map(function (r) {
        var cat = byCategoryId[r.category];
        seq[r.category] = (seq[r.category] || 0) + 1;

        var p = {
          id: r.id || slugify(r.name),
          sku: r.sku || "TLS-" + r.category.slice(0, 3).toUpperCase() + "-" + pad(seq[r.category]),
          name: r.name,
          category: r.category,
          categoryName: cat.name,
          price: Number(r.price) || 0,
          mrp: r.mrp ? Number(r.mrp) : null,
          gender: r.gender || "Unisex",
          material: r.material || null,
          style: r.style || null,
          colors: Array.isArray(r.colors) ? r.colors.slice() : [],
          sizes: resolveSizes(r.sizes, presets),
          rating: Number(r.rating) || 4.5,
          inStock: r.inStock !== false,
          bestseller: !!r.bestseller,
          isNew: !!r["new"],
          images: TLS.mediaList(r.images, "productImages"),
          video: TLS.media(r.video, "productVideos"),
          description: r.description || ""
        };

        EXTRA_KEYS.forEach(function (k) {
          if (r[k]) p[k] = r[k];
        });

        p.discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
        p.reviews = 12 + ((seq[r.category] * 17 + p.price) % 180);

        if (!p.description) {
          p.description =
            p.name +
            " — finished in " +
            (p.material || "premium materials").toLowerCase() +
            " and quality-checked by hand before it reaches the shop floor.";
        }

        p.features = Array.isArray(r.features) && r.features.length ? r.features.slice() : autoFeatures(p);

        p.meta = [p.material, p.style || p.shape || p.movement || p.family].filter(Boolean).join(" • ");

        cat.count++;
        byId[p.id] = p;
        return p;
      });
  };

  /* ---------------- Queries ---------------- */

  DATA.category = function (id) {
    return byCategoryId[id] || null;
  };

  DATA.byCategory = function (id) {
    return DATA.PRODUCTS.filter(function (p) {
      return p.category === id;
    });
  };

  DATA.product = function (id) {
    return byId[id] || null;
  };

  DATA.bestsellers = function (limit) {
    var list = DATA.PRODUCTS.filter(function (p) {
      return p.bestseller;
    });
    return limit ? list.slice(0, limit) : list;
  };

  DATA.newArrivals = function (limit) {
    var list = DATA.PRODUCTS.filter(function (p) {
      return p.isNew;
    });
    return limit ? list.slice(0, limit) : list;
  };

  DATA.priceRange = function (list) {
    var arr = list && list.length ? list : DATA.PRODUCTS;
    var min = Infinity;
    var max = 0;
    arr.forEach(function (p) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    });
    if (!isFinite(min)) min = 0;
    return { min: Math.floor(min / 100) * 100, max: Math.ceil(max / 100) * 100 };
  };
})(window);
