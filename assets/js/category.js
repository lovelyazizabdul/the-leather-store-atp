/* ==========================================================================
   The Leather Store — category.js
   Category listing: faceted filters (size, colour, gender, material, …),
   price range, sorting, URL state sync and a mobile filter drawer.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = global.TLS;
  var D = TLS.DATA;
  var icon = TLS.icon;
  var esc = TLS.esc;
  var attr = TLS.attr;
  var money = TLS.money;

  var ARRAY_KEYS = { sizes: true, colors: true };

  var SORTS = [
    { id: "featured", label: "Featured" },
    { id: "price-asc", label: "Price: low to high" },
    { id: "price-desc", label: "Price: high to low" },
    { id: "rating", label: "Top rated" },
    { id: "new", label: "Newest first" },
    { id: "name", label: "Name: A to Z" }
  ];

  var cat = null;
  var all = [];
  var facets = [];
  var bounds = { min: 0, max: 0 };
  var state = null;
  var collapsed = {};
  var els = {};

  /* ====================== Values helpers ====================== */
  function valuesOf(p, key) {
    var v = p[key];
    if (v == null) return [];
    return ARRAY_KEYS[key] || Array.isArray(v) ? [].concat(v) : [v];
  }

  function buildFacets() {
    return (cat.facets || [])
      .map(function (key) {
        var seen = [];
        all.forEach(function (p) {
          valuesOf(p, key).forEach(function (v) {
            if (seen.indexOf(v) === -1) seen.push(v);
          });
        });
        if (!seen.length) return null;
        if (key === "sizes") seen = sortSizes(seen);
        else seen.sort();
        return {
          key: key,
          label: D.FACET_LABELS[key] || key,
          pill: !!D.PILL_FACETS[key],
          swatch: key === "colors",
          options: seen
        };
      })
      .filter(Boolean);
  }

  function sortSizes(list) {
    return list.slice().sort(function (a, b) {
      var na = parseFloat(String(a).replace(/[^\d.]/g, ""));
      var nb = parseFloat(String(b).replace(/[^\d.]/g, ""));
      var aNum = !isNaN(na);
      var bNum = !isNaN(nb);
      if (aNum && bNum) return na - nb;
      if (aNum) return -1;
      if (bNum) return 1;
      var order = ["Small", "Cabin", "Medium", "Large"];
      var ia = order.indexOf(a);
      var ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      return String(a).localeCompare(String(b));
    });
  }

  /* ====================== State ↔ URL ====================== */
  function readState() {
    var st = { sel: {}, min: bounds.min, max: bounds.max, stock: false, sort: "featured" };

    facets.forEach(function (f) {
      var raw = TLS.param(f.key);
      st.sel[f.key] = raw
        ? raw
            .split(",")
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return f.options.indexOf(v) !== -1; })
        : [];
    });

    var mn = parseInt(TLS.param("min"), 10);
    var mx = parseInt(TLS.param("max"), 10);
    if (!isNaN(mn)) st.min = Math.min(Math.max(mn, bounds.min), bounds.max);
    if (!isNaN(mx)) st.max = Math.min(Math.max(mx, bounds.min), bounds.max);
    if (st.min > st.max) { var t = st.min; st.min = st.max; st.max = t; }

    st.stock = TLS.param("stock") === "1";

    var s = TLS.param("sort");
    if (s && SORTS.some(function (o) { return o.id === s; })) st.sort = s;

    return st;
  }

  function writeUrl(replace) {
    var parts = ["cat=" + encodeURIComponent(cat.id)];
    facets.forEach(function (f) {
      var v = state.sel[f.key];
      if (v && v.length) parts.push(f.key + "=" + encodeURIComponent(v.join(",")));
    });
    if (state.min !== bounds.min) parts.push("min=" + state.min);
    if (state.max !== bounds.max) parts.push("max=" + state.max);
    if (state.stock) parts.push("stock=1");
    if (state.sort !== "featured") parts.push("sort=" + state.sort);

    var url = global.location.pathname + "?" + parts.join("&");
    try {
      global.history[replace ? "replaceState" : "pushState"]({ tlsFilters: true }, "", url);
    } catch (e) { /* file:// — ignore */ }
  }

  /* ====================== Matching ====================== */
  function matchesFacet(p, key, selected) {
    if (!selected || !selected.length) return true;
    var vals = valuesOf(p, key);
    for (var i = 0; i < selected.length; i++) {
      if (vals.indexOf(selected[i]) !== -1) return true;
    }
    return false;
  }

  function matches(p, skipKey) {
    if (p.price < state.min || p.price > state.max) return false;
    if (state.stock && !p.inStock) return false;
    for (var i = 0; i < facets.length; i++) {
      var k = facets[i].key;
      if (k === skipKey) continue;
      if (!matchesFacet(p, k, state.sel[k])) return false;
    }
    return true;
  }

  function filtered() {
    return all.filter(function (p) { return matches(p, null); });
  }

  function sortList(list) {
    var l = list.slice();
    switch (state.sort) {
      case "price-asc": l.sort(function (a, b) { return a.price - b.price; }); break;
      case "price-desc": l.sort(function (a, b) { return b.price - a.price; }); break;
      case "rating": l.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; }); break;
      case "new": l.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.rating - a.rating; }); break;
      case "name": l.sort(function (a, b) { return a.name.localeCompare(b.name); }); break;
      default:
        l.sort(function (a, b) {
          return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0) || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.rating - a.rating;
        });
    }
    return l;
  }

  /** Number of products that would remain if `value` were added to `key`. */
  function optionCount(key, value) {
    var pool = all.filter(function (p) { return matches(p, key); });
    return pool.filter(function (p) { return valuesOf(p, key).indexOf(value) !== -1; }).length;
  }

  function activeCount() {
    var n = 0;
    facets.forEach(function (f) { n += (state.sel[f.key] || []).length; });
    if (state.min !== bounds.min || state.max !== bounds.max) n++;
    if (state.stock) n++;
    return n;
  }

  /* ====================== Rendering ====================== */
  function renderHead() {
    var host = TLS.$("#pageHead");
    if (!host) return;
    host.innerHTML =
      '<div class="container">' +
      TLS.breadcrumbHTML([
        { label: "Home", href: "index.html" },
        { label: "Categories", href: "categories.html" },
        { label: cat.name }
      ]) +
      '<div class="page-head__inner" style="margin-top:1.1rem">' +
      '<div class="page-head__text">' +
      '<span class="eyebrow">' + esc(cat.tagline) + "</span>" +
      '<h1 class="page-head__title">' + esc(cat.name) + "</h1>" +
      '<p class="lede">' + esc(cat.blurb) + "</p>" +
      "</div>" +
      '<a class="btn btn--outline" href="categories.html">' + icon("grid", "btn__icon") + "All categories</a>" +
      "</div></div>";
    doc.title = cat.name + " — " + TLS.SITE.name;
    var md = doc.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", cat.blurb);
  }

  function renderFilters() {
    var host = TLS.$("#filters");
    if (!host) return;

    var facetHTML = facets
      .map(function (f) {
        var panelId = "facet-" + f.key;
        var body;
        if (f.pill) {
          body = f.options
            .map(function (v) {
              var checked = state.sel[f.key].indexOf(v) !== -1;
              var n = optionCount(f.key, v);
              return (
                '<label class="pill-opt' + (checked ? " is-checked" : "") + (n === 0 && !checked ? " is-empty" : "") + '" title="' + n + ' products">' +
                '<input type="checkbox" data-facet="' + attr(f.key) + '" value="' + attr(v) + '"' + (checked ? " checked" : "") + ">" +
                "<span>" + esc(v) + "</span></label>"
              );
            })
            .join("");
          body = '<div class="facet__panel facet__panel--pills" id="' + panelId + '">' + body + "</div>";
        } else {
          body = f.options
            .map(function (v) {
              var checked = state.sel[f.key].indexOf(v) !== -1;
              var n = optionCount(f.key, v);
              var dot = f.swatch
                ? '<span class="opt__dot" style="background:' + (D.COLOR_HEX[v] || "#b9a894") + '"></span>'
                : "";
              return (
                '<label class="opt' + (n === 0 && !checked ? " is-empty" : "") + '">' +
                '<input type="checkbox" data-facet="' + attr(f.key) + '" value="' + attr(v) + '"' + (checked ? " checked" : "") + ">" +
                '<span class="opt__box"></span>' + dot +
                '<span class="opt__label">' + esc(v) + "</span>" +
                '<span class="opt__n">' + n + "</span></label>"
              );
            })
            .join("");
          body = '<div class="facet__panel" id="' + panelId + '">' + body + "</div>";
        }

        return (
          '<div class="facet">' +
          '<button class="facet__btn" type="button" data-facet-toggle="' + attr(f.key) + '" aria-expanded="' + (collapsed[f.key] ? "false" : "true") + '" aria-controls="' + panelId + '">' +
          esc(f.label) + icon("chevronDown") + "</button>" +
          (collapsed[f.key] ? body.replace('class="facet__panel', 'hidden class="facet__panel') : body) +
          "</div>"
        );
      })
      .join("");

    host.innerHTML =
      '<div class="filters__head">' +
      '<span class="filters__title">Filters</span>' +
      '<div style="display:flex;align-items:center;gap:.75rem">' +
      '<button class="filters__clear" type="button" id="clearAll">Clear all</button>' +
      '<button class="icon-btn filters__close" type="button" id="filtersClose" aria-label="Close filters">' + icon("close") + "</button>" +
      "</div></div>" +
      facetHTML +
      '<div class="facet">' +
      '<button class="facet__btn" type="button" data-facet-toggle="price" aria-expanded="' + (collapsed.price ? "false" : "true") + '" aria-controls="facet-price">Price' + icon("chevronDown") + "</button>" +
      '<div class="facet__panel" id="facet-price"' + (collapsed.price ? " hidden" : "") + ' style="max-height:none;overflow:visible">' +
      '<div class="range">' +
      '<div class="range__values"><span id="rangeLo">' + money(state.min) + '</span><span id="rangeHi">' + money(state.max) + "</span></div>" +
      '<label class="visually-hidden" for="priceMin">Minimum price</label>' +
      '<input class="range__input" type="range" id="priceMin" min="' + bounds.min + '" max="' + bounds.max + '" step="100" value="' + state.min + '">' +
      '<label class="visually-hidden" for="priceMax">Maximum price</label>' +
      '<input class="range__input" type="range" id="priceMax" min="' + bounds.min + '" max="' + bounds.max + '" step="100" value="' + state.max + '">' +
      "</div></div></div>" +
      '<div class="facet" style="border-bottom:0">' +
      '<label class="opt"><input type="checkbox" id="stockOnly"' + (state.stock ? " checked" : "") + ">" +
      '<span class="opt__box"></span><span class="opt__label">In stock only</span></label>' +
      "</div>" +
      '<div class="filters__mobile-foot">' +
      '<button class="btn btn--outline" type="button" id="mClear">Clear all</button>' +
      '<button class="btn" type="button" id="mApply">Show results</button>' +
      "</div>";
  }

  function renderChips() {
    var host = TLS.$("#activeChips");
    if (!host) return;
    var chips = [];

    facets.forEach(function (f) {
      (state.sel[f.key] || []).forEach(function (v) {
        chips.push(
          '<span class="chip">' + esc(f.label) + ": " + esc(v) +
          '<button class="chip__x" type="button" data-chip-facet="' + attr(f.key) + '" data-chip-value="' + attr(v) + '" aria-label="Remove filter ' + attr(f.label + " " + v) + '">&times;</button></span>'
        );
      });
    });

    if (state.min !== bounds.min || state.max !== bounds.max) {
      chips.push(
        '<span class="chip">' + money(state.min) + " – " + money(state.max) +
        '<button class="chip__x" type="button" data-chip-price="1" aria-label="Reset price filter">&times;</button></span>'
      );
    }
    if (state.stock) {
      chips.push('<span class="chip">In stock only<button class="chip__x" type="button" data-chip-stock="1" aria-label="Remove in-stock filter">&times;</button></span>');
    }

    host.innerHTML = chips.length
      ? chips.join("") + '<button class="filters__clear" type="button" id="chipClear" style="margin-left:.35rem">Clear all</button>'
      : "";
  }

  function renderToolbar(count) {
    var n = TLS.$("#resultCount");
    if (n) n.innerHTML = "<b>" + count + "</b> " + (count === 1 ? "product" : "products") + " in " + esc(cat.name);
    var badge = TLS.$("#filterCount");
    var a = activeCount();
    if (badge) {
      badge.textContent = a;
      badge.style.display = a ? "" : "none";
    }
  }

  function renderGrid() {
    var host = TLS.$("#productGrid");
    var empty = TLS.$("#emptyState");
    if (!host) return;

    var list = sortList(filtered());
    renderToolbar(list.length);

    if (!list.length) {
      host.innerHTML = "";
      host.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    host.hidden = false;
    if (empty) empty.hidden = true;
    host.innerHTML = list
      .map(function (p, i) {
        return TLS.productCardHTML(p).replace(
          'class="p-card"',
          'class="p-card reveal" style="--reveal-delay:' + Math.min(i, 8) * 45 + 'ms"'
        );
      })
      .join("");
    TLS.initReveal(host);
  }

  function renderRelated() {
    var host = TLS.$("#relatedCats");
    if (!host) return;
    var others = D.CATEGORIES.filter(function (c) { return c.id !== cat.id; }).slice(0, 4);
    host.innerHTML = others
      .map(function (c) {
        return TLS.categoryTileHTML(c);
      })
      .join("");
  }

  /* Re-render only the parts that depend on state */
  function refresh(pushUrl) {
    var af = doc.activeElement;
    var focusFacet = af && af.getAttribute ? af.getAttribute("data-facet") : null;
    var focusValue = focusFacet ? af.value : null;

    renderFilters();
    wireFilters();
    renderChips();
    renderGrid();
    writeUrl(!pushUrl);

    if (focusFacet) {
      var next = TLS.$('#filters [data-facet="' + focusFacet + '"][value="' + focusValue + '"]');
      if (next) {
        try { next.focus({ preventScroll: true }); } catch (e) { next.focus(); }
      }
    }
  }

  /* ====================== Wiring ====================== */
  function wireFilters() {
    var host = TLS.$("#filters");
    if (!host) return;

    host.addEventListener("change", onFilterChange);
    host.addEventListener("click", onFilterClick);
    host.addEventListener("input", onRangeInput);
  }

  function onFilterChange(e) {
    var input = e.target;
    if (input.id === "stockOnly") {
      state.stock = input.checked;
      refresh(true);
      return;
    }
    var key = input.getAttribute && input.getAttribute("data-facet");
    if (!key) return;
    var val = input.value;
    var arr = state.sel[key] || (state.sel[key] = []);
    var i = arr.indexOf(val);
    if (input.checked && i === -1) arr.push(val);
    else if (!input.checked && i !== -1) arr.splice(i, 1);
    refresh(true);
  }

  function onFilterClick(e) {
    var acc = e.target.closest(".facet__btn");
    if (acc) {
      var panel = doc.getElementById(acc.getAttribute("aria-controls"));
      var open = acc.getAttribute("aria-expanded") === "true";
      acc.setAttribute("aria-expanded", open ? "false" : "true");
      collapsed[acc.getAttribute("data-facet-toggle")] = open;
      if (panel) panel.hidden = open;
      return;
    }
    if (e.target.id === "clearAll" || e.target.id === "mClear") {
      clearAll();
      return;
    }
    if (e.target.id === "mApply" || e.target.closest("#filtersClose")) {
      closeFilterDrawer();
    }
  }

  var rangeCommit = null;
  function onRangeInput(e) {
    var lo = TLS.$("#priceMin");
    var hi = TLS.$("#priceMax");
    if (!lo || !hi || (e.target !== lo && e.target !== hi)) return;

    var a = parseInt(lo.value, 10);
    var b = parseInt(hi.value, 10);
    if (e.target === lo && a > b) { a = b; lo.value = a; }
    if (e.target === hi && b < a) { b = a; hi.value = b; }

    var loLabel = TLS.$("#rangeLo");
    var hiLabel = TLS.$("#rangeHi");
    if (loLabel) loLabel.textContent = money(a);
    if (hiLabel) hiLabel.textContent = money(b);

    state.min = a;
    state.max = b;

    clearTimeout(rangeCommit);
    rangeCommit = setTimeout(function () {
      renderChips();
      renderGrid();
      writeUrl(true);
    }, 180);
  }

  function clearAll() {
    facets.forEach(function (f) { state.sel[f.key] = []; });
    state.min = bounds.min;
    state.max = bounds.max;
    state.stock = false;
    refresh(true);
  }

  function wireChips() {
    var host = TLS.$("#activeChips");
    if (!host) return;
    host.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      if (btn.id === "chipClear") { clearAll(); return; }
      if (btn.hasAttribute("data-chip-price")) {
        state.min = bounds.min;
        state.max = bounds.max;
        refresh(true);
        return;
      }
      if (btn.hasAttribute("data-chip-stock")) {
        state.stock = false;
        refresh(true);
        return;
      }
      var k = btn.getAttribute("data-chip-facet");
      var v = btn.getAttribute("data-chip-value");
      if (!k) return;
      state.sel[k] = (state.sel[k] || []).filter(function (x) { return x !== v; });
      refresh(true);
    });
  }

  function wireSort() {
    var sel = TLS.$("#sortBy");
    if (!sel) return;
    sel.innerHTML = SORTS.map(function (o) {
      return '<option value="' + attr(o.id) + '"' + (o.id === state.sort ? " selected" : "") + ">" + esc(o.label) + "</option>";
    }).join("");
    sel.addEventListener("change", function () {
      state.sort = sel.value;
      renderGrid();
      writeUrl(true);
    });
  }

  /* ---- Mobile filter drawer ---- */
  var filterTrap = null;
  var filterOverlay = null;

  function openFilterDrawer() {
    var aside = TLS.$("#shopAside");
    if (!aside) return;
    aside.classList.add("is-open");
    filterOverlay.classList.add("is-open");
    TLS.lockScroll();
    if (!filterTrap) filterTrap = TLS.createTrap(aside);
    filterTrap.activate();
    var btn = TLS.$("#filterToggle");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  function closeFilterDrawer() {
    var aside = TLS.$("#shopAside");
    if (!aside || !aside.classList.contains("is-open")) return;
    aside.classList.remove("is-open");
    filterOverlay.classList.remove("is-open");
    TLS.unlockScroll();
    if (filterTrap) filterTrap.deactivate();
    var btn = TLS.$("#filterToggle");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function wireFilterDrawer() {
    filterOverlay = doc.createElement("div");
    filterOverlay.className = "overlay";
    filterOverlay.id = "filterOverlay";
    doc.body.appendChild(filterOverlay);
    filterOverlay.addEventListener("click", closeFilterDrawer);

    var btn = TLS.$("#filterToggle");
    if (btn) btn.addEventListener("click", openFilterDrawer);

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeFilterDrawer();
    });

    global.addEventListener(
      "resize",
      TLS.debounce(function () {
        if (global.innerWidth > 1023) closeFilterDrawer();
      }, 150)
    );
  }

  /* ====================== Boot ====================== */
  function notFound(id) {
    var main = TLS.$("#main");
    if (!main) return;
    main.innerHTML =
      '<div class="container nf">' +
      '<span class="nf__code">?</span>' +
      "<h1>We could not find that category</h1>" +
      '<p class="lede">' + (id ? "&ldquo;" + esc(id) + "&rdquo; is not one of our nine collections." : "No category was requested.") + "</p>" +
      '<div class="cta-band__actions"><a class="btn" href="categories.html">Browse all categories</a>' +
      '<a class="btn btn--outline" href="index.html">Back to home</a></div></div>';
    doc.title = "Category not found — " + TLS.SITE.name;
  }

  function init() {
    var id = TLS.param("cat");
    cat = id ? D.category(id) : null;
    if (!cat) { notFound(id); return; }

    doc.body.setAttribute("data-cat", cat.id);
    all = D.byCategory(cat.id);
    facets = buildFacets();
    bounds = D.priceRange(all);
    state = readState();

    var emptyCta = TLS.$("#emptyState .btn--wa");
    if (emptyCta) {
      emptyCta.href = TLS.waLink(
        "Hello " + TLS.SITE.name + "! I am looking for something in " + cat.name + ". Can you help?"
      );
    }

    renderHead();
    renderFilters();
    wireFilters();
    wireChips();
    wireSort();
    wireFilterDrawer();
    renderChips();
    renderGrid();
    renderRelated();
    writeUrl(true);

    global.addEventListener("popstate", function () {
      if (!global.location.hash) {
        state = readState();
        refresh(false);
      }
    });
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
