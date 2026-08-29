/* ==========================================================================
   The Leather Store — categories.js
   Categories index page, driven by content/categories.json.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var D = TLS.DATA;

  function renderHead(page) {
    var host = TLS.$("#pageHead");
    var head = page.head || {};
    var crumb = page.breadcrumb || {};
    if (!host) return;

    host.innerHTML =
      '<div class="container">' +
      TLS.breadcrumbHTML([
        { label: crumb.home || "Home", href: "index.html" },
        { label: crumb.current || "Categories" }
      ]) +
      '<div class="page-head__inner" style="margin-top:1.1rem">' +
      '<div class="page-head__text">' +
      '<span class="eyebrow">' + TLS.esc(TLS.tpl(head.eyebrow)) + "</span>" +
      '<h1 class="page-head__title">' + TLS.rich(head.title) + "</h1>" +
      '<p class="lede">' + TLS.esc(TLS.tpl(head.text)) + "</p>" +
      "</div>" +
      (head.cta
        ? '<a class="btn btn--outline" href="' + TLS.attr(head.cta.href) + '">' +
          (head.cta.icon ? TLS.icon(head.cta.icon, "btn__icon") : "") + TLS.esc(head.cta.label) + "</a>"
        : "") +
      "</div></div>";
  }

  function renderPicks(page) {
    var cfg = page.picks || {};
    var head = TLS.$("#picksHead");
    var grid = TLS.$("#staffPicks");

    if (head) {
      head.innerHTML =
        '<div class="section-head__text reveal">' +
        '<span class="eyebrow">' + TLS.esc(TLS.tpl(cfg.eyebrow)) + "</span>" +
        '<h2 class="h-section">' + TLS.rich(cfg.title) + "</h2>" +
        '<p class="lede">' + TLS.esc(TLS.tpl(cfg.text)) + "</p>" +
        "</div>" +
        (cfg.linkLabel
          ? '<a class="link-arrow reveal" href="' + TLS.attr(cfg.linkHref || "#") + '">' + TLS.esc(cfg.linkLabel) + "</a>"
          : "");
    }

    if (grid) {
      var list = cfg.source === "new" ? D.newArrivals(cfg.limit) : D.bestsellers(cfg.limit);
      grid.innerHTML = list
        .map(function (p) {
          return TLS.productCardHTML(p);
        })
        .join("");
    }
  }

  TLS.start("categories", function (page) {
    renderHead(page);

    var grid = TLS.$("#categoriesGrid");
    if (grid) {
      grid.innerHTML = D.CATEGORIES.map(function (c, n) {
        return TLS.categoryTileHTML(c).replace(
          'class="cat-tile"',
          'class="cat-tile reveal" style="--reveal-delay:' + Math.min(n, 6) * 70 + 'ms"'
        );
      }).join("");
    }

    renderPicks(page);
  });
})(window, document);
