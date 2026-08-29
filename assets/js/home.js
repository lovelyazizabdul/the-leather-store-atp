/* ==========================================================================
   The Leather Store — home.js
   Landing page: hero carousel, category showcase and the full store catalog.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = global.TLS;
  var S = TLS.SITE;
  var D = TLS.DATA;
  var icon = TLS.icon;
  var esc = TLS.esc;
  var attr = TLS.attr;

  var HERO_MS = 6000;

  /* ====================== Hero carousel ====================== */
  function renderHero() {
    var host = TLS.$("#hero");
    if (!host) return;

    host.className = "hero";
    host.setAttribute("role", "region");
    host.setAttribute("aria-roledescription", "carousel");
    host.setAttribute("aria-label", "Featured collections");
    host.style.setProperty("--hero-duration", HERO_MS + "ms");

    var slidesHTML = D.SLIDES.map(function (s, i) {
      var cat = D.category(s.cat);
      return (
        '<div class="hero__slide' + (i === 0 ? " is-active" : "") + '" role="group" ' +
        'aria-roledescription="slide" aria-label="' + (i + 1) + " of " + D.SLIDES.length + '" ' +
        (i === 0 ? "" : 'aria-hidden="true" ') + 'data-slide="' + i + '">' +
        '<img class="hero__bg" src="' + TLS.art.hero(s.cat, i) + '" alt="" width="1600" height="900" ' +
        (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">' +
        '<div class="hero__scrim"></div>' +
        '<div class="hero__inner"><div class="container"><div class="hero__content">' +
        '<span class="eyebrow hero__eyebrow">' + esc(s.eyebrow) + "</span>" +
        '<h1 class="hero__title">' + s.title + "</h1>" +
        '<p class="hero__text">' + esc(s.text) + "</p>" +
        '<div class="hero__actions">' +
        '<a class="btn btn--gold btn--lg" href="' + attr(s.cta.href) + '">' + esc(s.cta.label) + icon("arrowRight", "btn__icon") + "</a>" +
        (s.cta2
          ? '<a class="btn btn--ghost-light btn--lg" href="' + attr(s.cta2.href) + '">' + esc(s.cta2.label) + "</a>"
          : cat
          ? '<a class="btn btn--ghost-light btn--lg" href="category.html?cat=' + attr(cat.id) + '">' + cat.count + " products</a>"
          : "") +
        "</div></div></div></div></div>"
      );
    }).join("");

    var dots = D.SLIDES.map(function (s, i) {
      return (
        '<button class="hero__dot" type="button" role="tab" data-dot="' + i + '" ' +
        'aria-selected="' + (i === 0 ? "true" : "false") + '" aria-label="Go to slide ' + (i + 1) + ': ' + attr(s.eyebrow) + '"></button>'
      );
    }).join("");

    host.innerHTML =
      '<div class="hero__viewport" id="heroViewport">' + slidesHTML + "</div>" +
      '<button class="hero__nav hero__nav--prev" type="button" data-hero="-1" aria-label="Previous slide">' + icon("chevronLeft") + "</button>" +
      '<button class="hero__nav hero__nav--next" type="button" data-hero="1" aria-label="Next slide">' + icon("chevronRight") + "</button>" +
      '<div class="hero__dots" role="tablist" aria-label="Choose slide">' + dots + "</div>";

    wireHero(host);
  }

  function wireHero(host) {
    var slides = TLS.$$(".hero__slide", host);
    var dots = TLS.$$(".hero__dot", host);
    var i = 0;
    var timer = null;
    var paused = false;
    var reduced = TLS.prefersReducedMotion();

    function show(next) {
      var n = slides.length;
      i = ((next % n) + n) % n;
      slides.forEach(function (sl, k) {
        var active = k === i;
        sl.classList.toggle("is-active", active);
        if (active) sl.removeAttribute("aria-hidden");
        else sl.setAttribute("aria-hidden", "true");
      });
      dots.forEach(function (d, k) {
        d.setAttribute("aria-selected", k === i ? "true" : "false");
      });
      restart();
    }

    function restart() {
      clearTimeout(timer);
      if (reduced || paused || slides.length < 2) return;
      timer = setTimeout(function () {
        show(i + 1);
      }, HERO_MS);
    }

    function setPaused(v) {
      paused = v;
      host.classList.toggle("is-paused", v);
      if (v) clearTimeout(timer);
      else restart();
    }

    host.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-hero]");
      if (nav) {
        show(i + parseInt(nav.getAttribute("data-hero"), 10));
        return;
      }
      var dot = e.target.closest("[data-dot]");
      if (dot) show(parseInt(dot.getAttribute("data-dot"), 10));
    });

    host.addEventListener("mouseenter", function () { setPaused(true); });
    host.addEventListener("mouseleave", function () { setPaused(false); });
    host.addEventListener("focusin", function () { setPaused(true); });
    host.addEventListener("focusout", function (e) {
      if (!host.contains(e.relatedTarget)) setPaused(false);
    });

    host.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(i - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(i + 1); }
    });

    doc.addEventListener("visibilitychange", function () {
      setPaused(doc.hidden);
    });

    /* Touch swipe */
    var x0 = null, y0 = null;
    var vp = TLS.$("#heroViewport", host);
    vp.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
      setPaused(true);
    }, { passive: true });
    vp.addEventListener("touchend", function (e) {
      if (x0 === null) { setPaused(false); return; }
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) show(i + (dx < 0 ? 1 : -1));
      x0 = y0 = null;
      setPaused(false);
    }, { passive: true });

    restart();
  }

  /* ====================== Marquee ====================== */
  function renderMarquee() {
    var host = TLS.$("#marquee");
    if (!host) return;
    var words = [
      "Full-grain leather",
      "Hand-finished",
      "Fitted in store",
      "1-year warranty",
      "Free monogramming",
      "Since " + S.established
    ];
    var run = words
      .map(function (w) {
        return '<span class="marquee__item">' + esc(w) + " <span>&#10022;</span></span>";
      })
      .join("");
    host.innerHTML = '<div class="marquee__track">' + run + run + "</div>";
  }

  /* ====================== Value props ====================== */
  function renderValues() {
    var host = TLS.$("#values");
    if (!host) return;
    var items = [
      { i: "award", t: "Genuine leather, always", d: "Every hide is sourced from certified tanneries and checked by hand before it enters the shop." },
      { i: "ruler", t: "Fitted in person", d: "Shoes sized on both feet, watch straps adjusted, frames bent to your face — free, for life." },
      { i: "shield", t: "1-year craftsmanship warranty", d: "Stitching, hardware and soles are covered. Bring it back and we will make it right." },
      { i: "gift", t: "Free monogramming", d: "Add initials to any leather purchase in gold or blind deboss while you wait." }
    ];
    host.innerHTML = items
      .map(function (v, n) {
        return (
          '<article class="value reveal" style="--reveal-delay:' + n * 80 + 'ms">' +
          '<span class="value__icon">' + icon(v.i) + "</span>" +
          '<h3 class="value__title">' + esc(v.t) + "</h3>" +
          '<p class="value__text">' + esc(v.d) + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  /* ====================== Category showcase ====================== */
  function renderCategories() {
    var host = TLS.$("#categoryGrid");
    if (!host) return;
    host.innerHTML = D.CATEGORIES.map(function (c, n) {
      return TLS.categoryTileHTML(c).replace(
        'class="cat-tile"',
        'class="cat-tile reveal" style="--reveal-delay:' + Math.min(n, 5) * 70 + 'ms"'
      );
    }).join("");
  }

  /* ====================== Full catalog ====================== */
  function renderCatalog() {
    var tabsHost = TLS.$("#catalogTabs");
    var listHost = TLS.$("#catalogList");
    if (!listHost) return;

    if (tabsHost) {
      tabsHost.innerHTML =
        '<button class="tab" type="button" role="tab" data-tab="all" aria-selected="true">All products' +
        '<span class="tab__n">' + D.PRODUCTS.length + "</span></button>" +
        D.CATEGORIES.map(function (c) {
          return (
            '<button class="tab" type="button" role="tab" data-tab="' + attr(c.id) + '" aria-selected="false">' +
            esc(c.name) + '<span class="tab__n">' + c.count + "</span></button>"
          );
        }).join("");
    }

    listHost.innerHTML = D.CATEGORIES.map(function (c) {
      var items = D.byCategory(c.id);
      return (
        '<section class="cat-block" id="cat-' + attr(c.id) + '" data-block="' + attr(c.id) + '" aria-labelledby="cbt-' + attr(c.id) + '">' +
        '<div class="cat-block__head">' +
        '<div class="cat-block__title">' +
        '<h3 id="cbt-' + attr(c.id) + '">' + esc(c.name) + "</h3>" +
        '<span class="cat-block__n">' + items.length + " items</span>" +
        "</div>" +
        '<a class="link-arrow" href="category.html?cat=' + attr(c.id) + '">Filter &amp; view all ' + icon("arrowRight") + "</a>" +
        "</div>" +
        '<div class="card-grid">' +
        items.map(function (p) { return TLS.productCardHTML(p); }).join("") +
        "</div></section>"
      );
    }).join("");

    if (tabsHost) {
      tabsHost.addEventListener("click", function (e) {
        var tab = e.target.closest("[data-tab]");
        if (!tab) return;
        var id = tab.getAttribute("data-tab");
        TLS.$$(".tab", tabsHost).forEach(function (t) {
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        TLS.$$(".cat-block", listHost).forEach(function (b) {
          b.hidden = id !== "all" && b.getAttribute("data-block") !== id;
        });
      });
    }
  }

  /* ====================== Story ====================== */
  function renderStory() {
    var host = TLS.$("#story");
    if (!host) return;
    var years = new Date().getFullYear() - S.established;
    host.innerHTML =
      '<div class="split">' +
      '<div class="split__media reveal">' +
      '<img src="' + TLS.art.story("craft", "wallets") + '" alt="Hand-finished leather goods on the workbench" width="1200" height="900" loading="lazy" decoding="async">' +
      '<div class="split__badge"><b>' + years + "</b><span>Years</span></div>" +
      "</div>" +
      '<div class="split__body reveal" style="--reveal-delay:120ms">' +
      '<span class="eyebrow">Our story</span>' +
      '<h2 class="h-section">A shop built on <em style="font-style:italic;color:var(--c-brass)">touch</em>, not on trends</h2>' +
      '<p class="lede">We started in ' + S.established + " with one counter and one rule: nothing leaves the shop that we would not carry ourselves.</p>" +
      "<p>Today " + esc(S.name) + " spans nine categories — footwear, eyewear, timepieces, bags, wallets and fragrance — but the rule has not changed. " +
      "Every item is inspected by hand, sized on a real person, and backed by a warranty we honour across the counter, not through a call centre.</p>" +
      '<div class="stats">' +
      '<div class="stat"><b>' + D.PRODUCTS.length + '+</b><span>Products in store</span></div>' +
      '<div class="stat"><b>' + D.CATEGORIES.length + '</b><span>Categories</span></div>' +
      '<div class="stat"><b>12k+</b><span>Happy customers</span></div>' +
      "</div>" +
      '<a class="btn btn--outline" href="contact.html">Visit the store' + icon("arrowRight", "btn__icon") + "</a>" +
      "</div></div>";
  }

  /* ====================== Testimonials ====================== */
  function renderReviews() {
    var host = TLS.$("#reviews");
    if (!host) return;
    host.innerHTML = D.REVIEWS.map(function (r, n) {
      var stars = "";
      for (var k = 0; k < r.stars; k++) stars += icon("star");
      return (
        '<figure class="quote reveal" style="--reveal-delay:' + n * 90 + 'ms;margin:0">' +
        '<div class="quote__stars" aria-label="' + r.stars + ' out of 5">' + stars + "</div>" +
        '<blockquote class="quote__text" style="margin:0">&ldquo;' + esc(r.text) + "&rdquo;</blockquote>" +
        '<figcaption class="quote__by">' +
        '<span class="quote__avatar" aria-hidden="true">' + esc(r.name.charAt(0)) + "</span>" +
        "<span><b>" + esc(r.name) + "</b><span>" + esc(r.note) + "</span></span>" +
        "</figcaption></figure>"
      );
    }).join("");
  }

  /* ====================== CTA band ====================== */
  function renderCta() {
    var host = TLS.$("#visitCta");
    if (!host) return;
    var st = TLS.hoursStatus();
    host.innerHTML =
      '<span class="eyebrow eyebrow--center" style="color:var(--c-gold)">Come and see for yourself</span>' +
      "<h2>Everything on this page is on the shelf, today</h2>" +
      "<p>" + esc(S.address.full) + " &middot; " + esc(st.label) + "</p>" +
      '<div class="cta-band__actions">' +
      '<a class="btn btn--gold btn--lg" href="' + attr(S.mapsDirections) + '" target="_blank" rel="noopener noreferrer">' +
      icon("navigation", "btn__icon") + "Get directions</a>" +
      '<a class="btn btn--ghost-light btn--lg" href="tel:' + attr(S.phone) + '">' + icon("phone", "btn__icon") + esc(S.phoneDisplay) + "</a>" +
      '<a class="btn btn--ghost-light btn--lg" href="contact.html">Contact us</a>' +
      "</div>";
  }

  /* ====================== Boot ====================== */
  function init() {
    renderHero();
    renderMarquee();
    renderValues();
    renderCategories();
    renderCatalog();
    renderStory();
    renderReviews();
    renderCta();
    TLS.initReveal();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
