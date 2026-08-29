/* ==========================================================================
   The Leather Store — categories.js
   Categories index page.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = global.TLS;
  var D = TLS.DATA;
  var icon = TLS.icon;
  var esc = TLS.esc;

  function init() {
    var head = TLS.$("#pageHead");
    if (head) {
      head.innerHTML =
        '<div class="container">' +
        TLS.breadcrumbHTML([{ label: "Home", href: "index.html" }, { label: "Categories" }]) +
        '<div class="page-head__inner" style="margin-top:1.1rem">' +
        '<div class="page-head__text">' +
        '<span class="eyebrow">' + D.PRODUCTS.length + " products in store</span>" +
        '<h1 class="page-head__title">Shop by category</h1>' +
        '<p class="lede">Nine collections, every one of them stocked on the shop floor today. Pick a category to filter by size, colour, gender and more.</p>' +
        "</div>" +
        '<a class="btn btn--outline" href="index.html#catalog">' + icon("grid", "btn__icon") + "See the full catalog</a>" +
        "</div></div>";
    }

    var grid = TLS.$("#categoriesGrid");
    if (grid) {
      grid.innerHTML = D.CATEGORIES.map(function (c, n) {
        return TLS.categoryTileHTML(c).replace(
          'class="cat-tile"',
          'class="cat-tile reveal" style="--reveal-delay:' + Math.min(n, 6) * 70 + 'ms"'
        );
      }).join("");
    }

    var picks = TLS.$("#staffPicks");
    if (picks) {
      picks.innerHTML = D.bestsellers(8)
        .map(function (p) { return TLS.productCardHTML(p); })
        .join("");
    }

    TLS.initReveal();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
