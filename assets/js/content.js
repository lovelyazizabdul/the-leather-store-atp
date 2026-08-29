/* ==========================================================================
   The Leather Store — content.js
   Loads every piece of copy, pricing and media from the /content/*.json files
   and boots the page. This is the only file that talks to the JSON.

   Load order matters: this script must come first on every page.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});

  /* These objects are mutated in place (never reassigned) so the other
     scripts can hold a reference to them before the JSON has arrived. */
  TLS.SITE = {};
  TLS.PAGE = {};
  TLS.CONTENT_DIR = "content/";

  /* ====================== Template placeholders ====================== */

  /** Replace {KEY} placeholders. Unknown keys are left untouched. */
  function tpl(text, vars) {
    if (text == null) return "";
    var all = TLS.vars(vars);
    return String(text).replace(/\{([A-Z_]+)\}/g, function (match, key) {
      return Object.prototype.hasOwnProperty.call(all, key) ? String(all[key]) : match;
    });
  }

  TLS.vars = function (extra) {
    var S = TLS.SITE;
    var D = TLS.DATA || {};
    var base = {
      STORE: S.name || "",
      TAGLINE: S.tagline || "",
      ESTABLISHED: S.established || "",
      YEAR: new Date().getFullYear(),
      PHONE: S.phoneDisplay || "",
      EMAIL: S.email || "",
      CITY: (S.address && S.address.city) || "",
      STREET: (S.address && S.address.line1) || (S.address && S.address.line2) || "",
      ADDRESS: (S.address && S.address.full) || "",
      PRODUCTS: (D.PRODUCTS && D.PRODUCTS.length) || 0,
      CATEGORIES: (D.CATEGORIES && D.CATEGORIES.length) || 0
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        base[k] = extra[k];
      });
    }
    return base;
  };

  TLS.tpl = tpl;

  /* ====================== Media paths ====================== */

  /**
   * Resolve a media reference from the JSON.
   *   ""                       -> null  (caller falls back to generated art)
   *   "shoe-1.jpg"             -> assets/img/products/shoe-1.jpg   (kind based)
   *   "assets/img/x.jpg"       -> used as-is
   *   "https://…" / "data:…"   -> used as-is
   * @param {string} path
   * @param {string} [kind] key of site.json → media (default "general")
   */
  TLS.media = function (path, kind) {
    if (!path || typeof path !== "string") return null;
    var p = path.trim();
    if (!p) return null;
    if (/^(https?:)?\/\//i.test(p) || /^data:/i.test(p) || p.charAt(0) === "/") return p;
    if (p.indexOf("assets/") === 0 || p.indexOf("./") === 0 || p.indexOf("../") === 0) return p;
    var media = TLS.SITE.media || {};
    var base = media[kind || "general"] || media.general || "assets/img/";
    return base + p;
  };

  /** Resolve a whole list, dropping empties. Returns null when nothing usable. */
  TLS.mediaList = function (list, kind) {
    if (!list || !list.length) return null;
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var url = TLS.media(list[i], kind);
      if (url) out.push(url);
    }
    return out.length ? out : null;
  };

  /* ====================== Fetching ====================== */

  var cache = {};

  function loadJson(name) {
    if (cache[name]) return cache[name];
    var url = TLS.CONTENT_DIR + name + ".json";
    cache[name] = fetch(url, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error(url + " returned HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(url + " is not valid JSON — " + e.message + ". Check for a trailing comma or a missing quote.");
        }
      });
    return cache[name];
  }

  TLS.load = function (names) {
    return Promise.all(names.map(loadJson)).then(function (list) {
      var out = {};
      names.forEach(function (n, i) {
        out[n] = list[i];
      });
      return out;
    });
  };

  /* ====================== site.json → TLS.SITE ====================== */

  function applySite(j) {
    var S = TLS.SITE;
    var brand = j.brand || {};
    var contact = j.contact || {};
    var commerce = j.commerce || {};

    S.name = brand.name || "Store";
    S.tagline = brand.tagline || "";
    S.established = brand.established || new Date().getFullYear();
    S.url = brand.url || "";
    S.description = brand.description || "";

    S.phoneDisplay = contact.phoneDisplay || "";
    S.phone = contact.phone || "";
    S.whatsapp = String(contact.whatsapp || "").replace(/\D/g, "");
    S.email = contact.email || "";

    S.address = Object.assign({}, j.address);
    var cityLine = [S.address.city, S.address.state].filter(Boolean).join(", ");
    if (S.address.postalCode) cityLine = (cityLine + " " + S.address.postalCode).trim();
    S.address.full = [S.address.line1, S.address.line2, cityLine, S.address.country].filter(Boolean).join(", ");

    S.geo = Object.assign({ lat: 0, lng: 0, zoom: 15 }, j.map);
    S.hours = normalizeHours(j.hours);

    S.social = Object.assign({}, j.social);
    S.social.whatsapp = S.whatsapp ? "https://wa.me/" + S.whatsapp : "";

    S.owner = Object.assign({}, j.owner);
    S.currency = commerce.currency || "INR";
    S.currencySymbol = commerce.currencySymbol || "₹";
    S.locale = commerce.locale || "en-IN";

    S.media = Object.assign({ general: "assets/img/" }, j.media);
    S.demoVideo = TLS.media(S.media.demoVideo, "productVideos");

    S.announcements = j.announcements || [];
    S.header = j.header || {};
    S.footer = j.footer || {};
    S.floating = j.floating || {};
    S.product = j.product || {};
    S.common = j.common || {};

    S.mapsDirections =
      S.geo.directionsUrl || "https://www.google.com/maps/dir/?api=1&destination=" + S.geo.lat + "," + S.geo.lng;
    S.osmLink =
      "https://www.openstreetmap.org/?mlat=" + S.geo.lat + "&mlon=" + S.geo.lng + "#map=17/" + S.geo.lat + "/" + S.geo.lng;
  }

  /* ====================== Opening hours ====================== */

  /**
   * Turn site.json hours into { day, shifts:[{open,close,openM,closeM}] }.
   * Accepts "HH:MM-HH:MM" strings, and still understands the older
   * single-window { open, close } shape.
   */
  function normalizeHours(list) {
    return (list || []).map(function (h) {
      var raw = h.shifts || (h.open ? [h.open + "-" + h.close] : []);
      var shifts = [];
      raw.forEach(function (win) {
        var parts = String(win).split("-");
        if (parts.length !== 2) return;
        var open = parts[0].trim();
        var close = parts[1].trim();
        if (!open || !close) return;
        shifts.push({ open: open, close: close, openM: toMinutes(open), closeM: toMinutes(close) });
      });
      return { day: h.day, shifts: shifts };
    });
  }

  function toMinutes(hhmm) {
    var p = String(hhmm).split(":");
    return (+p[0] || 0) * 60 + (+p[1] || 0);
  }

  /* ====================== Page <head> ====================== */

  function applyMeta(meta) {
    if (!meta) return;
    if (meta.title) doc.title = tpl(meta.title);
    if (meta.description) {
      var m = doc.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", tpl(meta.description));
      var og = doc.querySelector('meta[property="og:description"]');
      if (og) og.setAttribute("content", tpl(meta.description));
    }
  }

  TLS.applyMeta = applyMeta;

  /* ====================== Failure screen ====================== */

  function fail(err) {
    var isFile = global.location.protocol === "file:";
    var host = doc.getElementById("main") || doc.body;
    var header = doc.getElementById("site-header");
    var footer = doc.getElementById("site-footer");
    if (header) header.remove();
    if (footer) footer.remove();

    host.innerHTML =
      '<div class="container nf" style="min-height:70svh">' +
      '<span class="nf__code">!</span>' +
      "<h1>The site content could not be loaded</h1>" +
      '<p class="lede" style="max-width:60ch">' +
      (isFile
        ? "This page was opened straight from the file system, and browsers block reading local JSON files that way."
        : "One of the files in the <code>content/</code> folder could not be read.") +
      "</p>" +
      '<pre style="max-width:70ch;text-align:left;white-space:pre-wrap;background:var(--c-cream);border:1px solid var(--c-line);border-radius:var(--r-md);padding:1rem;font-size:.85rem;color:var(--c-danger)">' +
      String(err && err.message ? err.message : err).replace(/[<>&]/g, function (c) {
        return { "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c];
      }) +
      "</pre>" +
      (isFile
        ? '<p class="muted" style="max-width:60ch">Start a small local server from the project folder and open <strong>http://localhost:5173</strong> instead:</p>' +
          '<pre style="text-align:left;background:var(--c-espresso);color:var(--c-sand);border-radius:var(--r-md);padding:1rem;font-size:.85rem">npm run dev\n\n# or, if you have Python\npython -m http.server 5173</pre>'
        : '<p class="muted">Check the file exists and that the JSON is valid — a stray comma is the usual cause.</p>') +
      "</div>";

    doc.documentElement.classList.remove("no-js");
    if (global.console) global.console.error(err);
  }

  /* ====================== Boot ====================== */

  /**
   * Load the shared content plus one page file, then render.
   * @param {string|null} pageName file name in /content without .json
   * @param {function} [init] called with the page JSON once the shell is up
   */
  TLS.start = function (pageName, init) {
    var names = ["site", "products"];
    if (pageName) names.push(pageName);

    var run = function () {
      TLS.load(names)
        .then(function (c) {
          applySite(c.site);
          TLS.applyCatalog(c.products);
          TLS.PAGE = (pageName && c[pageName]) || {};
          applyMeta(TLS.PAGE.meta);
          TLS.bootShell();
          if (typeof init === "function") init(TLS.PAGE);
          TLS.initReveal();
          if (TLS.modal) TLS.modal.initFromUrl();
        })
        .catch(fail);
    };

    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", run);
    else run();
  };
})(window, document);
