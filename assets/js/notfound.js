/* ==========================================================================
   The Leather Store — notfound.js
   404 page, driven by content/not-found.json.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var D = TLS.DATA;

  TLS.start("not-found", function (page) {
    var host = TLS.$("#nf");
    if (host) {
      host.innerHTML =
        '<span class="nf__code">' + TLS.esc(page.code) + "</span>" +
        '<h1 class="display-2">' + TLS.rich(page.title) + "</h1>" +
        '<p class="lede" style="max-width:52ch">' + TLS.esc(TLS.tpl(page.text)) + "</p>" +
        '<div class="cta-band__actions">' +
        (page.buttons || [])
          .map(function (b) {
            return (
              '<a class="btn btn--lg ' + (b.style === "outline" ? "btn--outline" : "") + '" href="' + TLS.attr(b.href) + '">' +
              TLS.esc(b.label) + "</a>"
            );
          })
          .join("") +
        "</div>";
    }

    var head = TLS.$("#nfSectionHead");
    var sec = page.section || {};
    if (head) {
      head.innerHTML =
        '<div class="section-head__text">' +
        '<span class="eyebrow eyebrow--center">' + TLS.esc(sec.eyebrow) + "</span>" +
        '<h2 class="h-section">' + TLS.rich(sec.title) + "</h2></div>";
    }

    var grid = TLS.$("#categoriesGrid");
    if (grid) {
      grid.innerHTML = D.CATEGORIES.map(function (c) {
        return TLS.categoryTileHTML(c);
      }).join("");
    }
  });
})(window, document);
