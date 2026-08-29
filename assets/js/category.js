/* ==========================================================================
   The Leather Store — category.js
   Category listing: faceted filters, price range, sorting, URL state sync
   and a mobile filter drawer. Wording comes from content/category.json,
   data from content/products.json.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var S = TLS.SITE;
  var D = TLS.DATA;

  var ARRAY_KEYS = { sizes: true, colors: true };

  var PAGE = {};
  var SORTS = [];
  var cat = null;
  var all = [];
  var facets = [];
  var bounds = { min: 0, max: 0 };
  var state = null;
  var collapsed = {};

  /* ====================== Values ====================== */
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
    var st = { sel: {}, min: bounds.min, max: bounds.max, stock: false, sort: SORTS.length ? SORTS[0].id : "featured" };

    facets.forEach(function (f) {
      var raw = TLS.param(f.key);
      st.sel[f.key] = raw
        ? raw
            .split(",")
            .map(function (v) {
              return v.trim();
            })
            .filter(function (v) {
              return f.options.indexOf(v) !== -1;
            })
        : [];
    });

    var mn = parseInt(TLS.param("min"), 10);
    var mx = parseInt(TLS.param("max"), 10);
    if (!isNaN(mn)) st.min = Math.min(Math.max(mn, bounds.min), bounds.max);
    if (!isNaN(mx)) st.max = Math.min(Math.max(mx, bounds.min), bounds.max);
    if (st.min > st.max) {
      var t = st.min;
      st.min = st.max;
      st.max = t;
    }

    st.stock = TLS.param("stock") === "1";

    var s = TLS.param("sort");
    if (
      s &&
      SORTS.some(function (o) {
        return o.id === s;
      })
    ) {
      st.sort = s;
    }

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
    if (SORTS.length && state.sort !== SORTS[0].id) parts.push("sort=" + state.sort);

    /* Keep any #p=<product> hash so product deep links survive the URL sync. */
    var url = global.location.pathname + "?" + parts.join("&") + (global.location.hash || "");
    try {
      global.history[replace ? "replaceState" : "pushState"]({ tlsFilters: true }, "", url);
    } catch (e) {
      /* file:// — ignore */
    }
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
    return all.filter(function (p) {
      return matches(p, null);
    });
  }

  function sortList(list) {
    var l = list.slice();
    switch (state.sort) {
      case "price-asc":
        l.sort(function (a, b) {
          return a.price - b.price;
        });
        break;
      case "price-desc":
        l.sort(function (a, b) {
          return b.price - a.price;
        });
        break;
      case "rating":
        l.sort(function (a, b) {
          return b.rating - a.rating || b.reviews - a.reviews;
        });
        break;
      case "new":
        l.sort(function (a, b) {
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.rating - a.rating;
        });
        break;
      case "name":
        l.sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
        break;
      default:
        l.sort(function (a, b) {
          return (
            (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0) ||
            (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) ||
            b.rating - a.rating
          );
        });
    }
    return l;
  }

  function optionCount(key, value) {
    return all.filter(function (p) {
      return matches(p, key) && valuesOf(p, key).indexOf(value) !== -1;
    }).length;
  }

  function activeCount() {
    var n = 0;
    facets.forEach(function (f) {
      n += (state.sel[f.key] || []).length;
    });
    if (state.min !== bounds.min || state.max !== bounds.max) n++;
    if (state.stock) n++;
    return n;
  }

  /* ====================== Rendering ====================== */
  function renderHead() {
    var host = TLS.$("#pageHead");
    if (!host) return;
    var crumb = PAGE.breadcrumb || {};
    var head = PAGE.head || {};

    host.innerHTML =
      '<div class="container">' +
      TLS.breadcrumbHTML([
        { label: crumb.home || "Home", href: "index.html" },
        { label: crumb.categories || "Categories", href: "categories.html" },
        { label: cat.name }
      ]) +
      '<div class="page-head__inner" style="margin-top:1.1rem">' +
      '<div class="page-head__text">' +
      '<span class="eyebrow">' + TLS.esc(cat.tagline) + "</span>" +
      '<h1 class="page-head__title">' + TLS.esc(cat.name) + "</h1>" +
      '<p class="lede">' + TLS.esc(cat.blurb) + "</p>" +
      "</div>" +
      (head.cta
        ? '<a class="btn btn--outline" href="' + TLS.attr(head.cta.href) + '">' +
          (head.cta.icon ? TLS.icon(head.cta.icon, "btn__icon") : "") + TLS.esc(head.cta.label) + "</a>"
        : "") +
      "</div></div>";

    doc.title = TLS.tpl((PAGE.meta && PAGE.meta.titleTemplate) || "{CATEGORY}", { CATEGORY: cat.name });
    var md = doc.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", cat.blurb);
  }

  function renderFilters() {
    var host = TLS.$("#filters");
    if (!host) return;
    var F = PAGE.filters || {};
    var esc = TLS.esc;
    var attr = TLS.attr;
    var icon = TLS.icon;

    var facetHTML = facets
      .map(function (f) {
        var panelId = "facet-" + f.key;
        var body;
        if (f.pill) {
          body =
            '<div class="facet__panel facet__panel--pills" id="' + panelId + '">' +
            f.options
              .map(function (v) {
                var checked = state.sel[f.key].indexOf(v) !== -1;
                var n = optionCount(f.key, v);
                return (
                  '<label class="pill-opt' + (checked ? " is-checked" : "") + (n === 0 && !checked ? " is-empty" : "") +
                  '" title="' + attr(TLS.tpl(F.optionCountTitle, { COUNT: n })) + '">' +
                  '<input type="checkbox" data-facet="' + attr(f.key) + '" value="' + attr(v) + '"' + (checked ? " checked" : "") + ">" +
                  "<span>" + esc(v) + "</span></label>"
                );
              })
              .join("") +
            "</div>";
        } else {
          body =
            '<div class="facet__panel" id="' + panelId + '">' +
            f.options
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
              .join("") +
            "</div>";
        }

        return (
          '<div class="facet">' +
          '<button class="facet__btn" type="button" data-facet-toggle="' + attr(f.key) + '" aria-expanded="' +
          (collapsed[f.key] ? "false" : "true") + '" aria-controls="' + panelId + '">' +
          esc(f.label) + icon("chevronDown") + "</button>" +
          (collapsed[f.key] ? body.replace('class="facet__panel', 'hidden class="facet__panel') : body) +
          "</div>"
        );
      })
      .join("");

    host.innerHTML =
      '<div class="filters__head">' +
      '<span class="filters__title">' + esc(F.title) + "</span>" +
      '<div style="display:flex;align-items:center;gap:.75rem">' +
      '<button class="filters__clear" type="button" id="clearAll">' + esc(F.clearLabel) + "</button>" +
      '<button class="icon-btn filters__close" type="button" id="filtersClose" aria-label="' + attr(F.closeLabel) + '">' + icon("close") + "</button>" +
      "</div></div>" +
      facetHTML +
      '<div class="facet">' +
      '<button class="facet__btn" type="button" data-facet-toggle="price" aria-expanded="' + (collapsed.price ? "false" : "true") +
      '" aria-controls="facet-price">' + esc(F.priceLabel) + icon("chevronDown") + "</button>" +
      '<div class="facet__panel" id="facet-price"' + (collapsed.price ? " hidden" : "") + ' style="max-height:none;overflow:visible">' +
      '<div class="range">' +
      '<div class="range__values"><span id="rangeLo">' + TLS.money(state.min) + '</span><span id="rangeHi">' + TLS.money(state.max) + "</span></div>" +
      '<label class="visually-hidden" for="priceMin">' + esc(F.minPriceLabel) + "</label>" +
      '<input class="range__input" type="range" id="priceMin" min="' + bounds.min + '" max="' + bounds.max + '" step="100" value="' + state.min + '">' +
      '<label class="visually-hidden" for="priceMax">' + esc(F.maxPriceLabel) + "</label>" +
      '<input class="range__input" type="range" id="priceMax" min="' + bounds.min + '" max="' + bounds.max + '" step="100" value="' + state.max + '">' +
      "</div></div></div>" +
      '<div class="facet" style="border-bottom:0">' +
      '<label class="opt"><input type="checkbox" id="stockOnly"' + (state.stock ? " checked" : "") + ">" +
      '<span class="opt__box"></span><span class="opt__label">' + esc(F.inStockLabel) + "</span></label>" +
      "</div>" +
      '<div class="filters__mobile-foot">' +
      '<button class="btn btn--outline" type="button" id="mClear">' + esc(F.clearLabel) + "</button>" +
      '<button class="btn" type="button" id="mApply">' + esc(F.applyLabel) + "</button>" +
      "</div>";
  }

  function renderChips() {
    var host = TLS.$("#activeChips");
    if (!host) return;
    var F = PAGE.filters || {};
    var esc = TLS.esc;
    var attr = TLS.attr;
    var chips = [];

    facets.forEach(function (f) {
      (state.sel[f.key] || []).forEach(function (v) {
        chips.push(
          '<span class="chip">' + esc(f.label) + ": " + esc(v) +
          '<button class="chip__x" type="button" data-chip-facet="' + attr(f.key) + '" data-chip-value="' + attr(v) +
          '" aria-label="Remove ' + attr(f.label + " " + v) + '">&times;</button></span>'
        );
      });
    });

    if (state.min !== bounds.min || state.max !== bounds.max) {
      chips.push(
        '<span class="chip">' + TLS.money(state.min) + " – " + TLS.money(state.max) +
        '<button class="chip__x" type="button" data-chip-price="1" aria-label="Reset price">&times;</button></span>'
      );
    }
    if (state.stock) {
      chips.push(
        '<span class="chip">' + esc(F.inStockLabel) +
        '<button class="chip__x" type="button" data-chip-stock="1" aria-label="Remove filter">&times;</button></span>'
      );
    }

    host.innerHTML = chips.length
      ? chips.join("") +
        '<button class="filters__clear" type="button" id="chipClear" style="margin-left:.35rem">' + esc(F.clearLabel) + "</button>"
      : "";
  }

  function renderToolbar(count) {
    var T = PAGE.toolbar || {};
    var n = TLS.$("#resultCount");
    if (n) {
      var text = TLS.tpl(T.countTemplate, {
        COUNT: "\u0000",
        NOUN: count === 1 ? T.nounSingular : T.nounPlural,
        CATEGORY: cat.name
      });
      n.innerHTML = TLS.esc(text).replace("\u0000", "<b>" + count + "</b>");
    }
    var badge = TLS.$("#filterCount");
    var a = activeCount();
    if (badge) {
      badge.textContent = a;
      badge.style.display = a ? "" : "none";
    }
  }

  function renderEmpty() {
    var host = TLS.$("#emptyState");
    var E = PAGE.empty || {};
    if (!host) return;
    host.className = "empty";
    host.innerHTML =
      '<svg viewBox="0 0 24 24" class="ico" style="width:54px;height:54px" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 7.8L12 2.9 3 7.8v8.4l9 4.9 9-4.9z"/><path d="M3.2 7.6l8.8 4.9 8.8-4.9M12 21.1v-8.6"/></svg>' +
      "<h3>" + TLS.esc(E.title) + "</h3>" +
      "<p>" + TLS.esc(E.text) + "</p>" +
      '<a class="btn btn--wa" href="' + TLS.attr(TLS.waLink(E.whatsappMessage, { CATEGORY: cat.name })) + '" target="_blank" rel="noopener noreferrer">' +
      TLS.esc(E.ctaLabel) + "</a>";
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
    var cfg = PAGE.related || {};
    var head = TLS.$("#relatedHead");
    var host = TLS.$("#relatedCats");

    if (head) {
      head.innerHTML =
        '<div class="section-head__text reveal">' +
        '<span class="eyebrow">' + TLS.esc(cfg.eyebrow) + "</span>" +
        '<h2 class="h-section">' + TLS.rich(cfg.title) + "</h2></div>" +
        (cfg.linkLabel
          ? '<a class="link-arrow reveal" href="' + TLS.attr(cfg.linkHref || "categories.html") + '">' + TLS.esc(cfg.linkLabel) + "</a>"
          : "");
    }

    if (host) {
      host.innerHTML = D.CATEGORIES.filter(function (c) {
        return c.id !== cat.id;
      })
        .slice(0, cfg.limit || 4)
        .map(function (c) {
          return TLS.categoryTileHTML(c);
        })
        .join("");
    }
  }

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
        try {
          next.focus({ preventScroll: true });
        } catch (e) {
          next.focus();
        }
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
    var arr = state.sel[key] || (state.sel[key] = []);
    var i = arr.indexOf(input.value);
    if (input.checked && i === -1) arr.push(input.value);
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
    if (e.target.id === "mApply" || e.target.closest("#filtersClose")) closeFilterDrawer();
  }

  var rangeCommit = null;
  function onRangeInput(e) {
    var lo = TLS.$("#priceMin");
    var hi = TLS.$("#priceMax");
    if (!lo || !hi || (e.target !== lo && e.target !== hi)) return;

    var a = parseInt(lo.value, 10);
    var b = parseInt(hi.value, 10);
    if (e.target === lo && a > b) {
      a = b;
      lo.value = a;
    }
    if (e.target === hi && b < a) {
      b = a;
      hi.value = b;
    }

    var loLabel = TLS.$("#rangeLo");
    var hiLabel = TLS.$("#rangeHi");
    if (loLabel) loLabel.textContent = TLS.money(a);
    if (hiLabel) hiLabel.textContent = TLS.money(b);

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
    facets.forEach(function (f) {
      state.sel[f.key] = [];
    });
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
      if (btn.id === "chipClear") {
        clearAll();
        return;
      }
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
      state.sel[k] = (state.sel[k] || []).filter(function (x) {
        return x !== v;
      });
      refresh(true);
    });
  }

  function wireSort() {
    var sel = TLS.$("#sortBy");
    if (!sel) return;
    var T = PAGE.toolbar || {};
    var label = TLS.$("#sortLabel");
    if (label) label.textContent = T.sortLabel || "Sort by";
    sel.setAttribute("aria-label", T.sortLabel || "Sort by");

    sel.innerHTML = SORTS.map(function (o) {
      return '<option value="' + TLS.attr(o.id) + '"' + (o.id === state.sort ? " selected" : "") + ">" + TLS.esc(o.label) + "</option>";
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
    if (btn) {
      var T = PAGE.toolbar || {};
      var lbl = TLS.$("#filterToggleLabel");
      if (lbl) lbl.textContent = T.filtersLabel || "Filters";
      btn.addEventListener("click", openFilterDrawer);
    }

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
    var NF = PAGE.notFound || {};
    if (!main) return;
    var previewCats = D.CATEGORIES.map(function (c) {
      var items = D.byCategory(c.id).slice(0, 4);
      return (
        '<section class="cat-block" id="cat-' + TLS.attr(c.id) + '" data-block="' + TLS.attr(c.id) + '" aria-labelledby="cbt-' + TLS.attr(c.id) + '">' +
        '<div class="cat-block__head">' +
        '<div class="cat-block__title">' +
        '<h3 id="cbt-' + TLS.attr(c.id) + '">' + TLS.esc(c.name) + "</h3>" +
        '<span class="cat-block__n">' + D.byCategory(c.id).length + " products</span>" +
        "</div>" +
        '<a class="link-arrow" href="category.html?cat=' + TLS.attr(c.id) + '">Show More ' + TLS.icon("arrowRight") + "</a>" +
        "</div>" +
        '<div class="card-grid">' +
        items
          .map(function (p) {
            return TLS.productCardHTML(p);
          })
          .join("") +
        "</div></section>"
      );
    }).join("");

    main.innerHTML =
      '<section class="page-head"><div class="container">' +
      TLS.breadcrumbHTML([
        { label: "Home", href: "index.html" },
        { label: "Categories", href: "categories.html" },
        { label: "Browse all" }
      ]) +
      '<div class="page-head__inner" style="margin-top:1.1rem">' +
      '<div class="page-head__text">' +
      '<span class="eyebrow">All collections</span>' +
      '<h1 class="page-head__title">Browse the store</h1>' +
      '<p class="lede">Pick a collection below to see every item in that category.</p>' +
      '</div>' +
      '</div></div></section>' +
      '<section class="section"><div class="container">' +
      '<div class="cats-index">' +
      D.CATEGORIES.map(function (c, n) {
        return TLS.categoryTileHTML(c).replace(
          'class="cat-tile"',
          'class="cat-tile reveal" style="--reveal-delay:' + Math.min(n, 6) * 70 + 'ms"'
        );
      }).join("") +
      '</div></div></section>' +
      '<section class="section section--alt"><div class="container">' +
      previewCats +
      '</div></section>';

    doc.title = TLS.tpl(PAGE.meta && PAGE.meta.fallbackTitle);
  }

  TLS.start("category", function (page) {
    PAGE = page;
    SORTS = page.sorts || [{ id: "featured", label: "Featured" }];

    var id = TLS.param("cat");
    cat = id ? D.category(id) : null;
    if (!cat) {
      notFound(id);
      return;
    }

    doc.body.setAttribute("data-cat", cat.id);
    all = D.byCategory(cat.id);
    facets = buildFacets();
    bounds = D.priceRange(all);
    state = readState();

    renderHead();
    renderEmpty();
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
  });
})(window, document);
