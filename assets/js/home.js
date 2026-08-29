/* ==========================================================================
   The Leather Store — home.js
   Landing page. Every heading, slide and paragraph comes from content/home.json.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var S = TLS.SITE;
  var D = TLS.DATA;

  var HERO_MS = 6000;

  /* Buttons described in JSON as { label, icon, action, href, style } */
  function actionButton(btn, extraClass) {
    var icon = TLS.icon;
    var esc = TLS.esc;
    var attr = TLS.attr;
    var styles = { gold: "btn--gold", light: "btn--ghost-light", outline: "btn--outline", solid: "" };
    var cls = "btn " + (styles[btn.style] || "") + " " + (extraClass || "");
    var href = btn.href || "#";
    var external = false;
    var label = btn.label || "";

    if (btn.action === "directions") {
      href = S.mapsDirections;
      external = true;
    } else if (btn.action === "phone") {
      href = "tel:" + S.phone;
      label = label || S.phoneDisplay;
    } else if (btn.action === "whatsapp") {
      href = TLS.waLink(btn.whatsappMessage);
      external = true;
    }

    return (
      '<a class="' + cls.replace(/\s+/g, " ").trim() + '" href="' + attr(href) + '"' +
      (external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" +
      (btn.icon ? icon(btn.icon, "btn__icon") : "") + esc(label) + "</a>"
    );
  }

  /* ====================== Hero carousel ====================== */
  function renderHero(page) {
    var host = TLS.$("#hero");
    var cfg = page.hero || {};
    var slides = cfg.slides || [];
    if (!host || !slides.length) return;

    var icon = TLS.icon;
    var esc = TLS.esc;
    var attr = TLS.attr;
    HERO_MS = cfg.intervalMs || 6000;

    host.className = "hero";
    host.setAttribute("role", "region");
    host.setAttribute("aria-roledescription", "carousel");
    host.setAttribute("aria-label", cfg.ariaLabel || "Featured");
    host.style.setProperty("--hero-duration", HERO_MS + "ms");

    var slidesHTML = slides
      .map(function (s, i) {
        var img = TLS.media(s.image, "heroImages") || TLS.art.hero(s.category, i);
        return (
          '<div class="hero__slide' + (i === 0 ? " is-active" : "") + '" role="group" ' +
          'aria-roledescription="slide" aria-label="' + (i + 1) + " of " + slides.length + '" ' +
          (i === 0 ? "" : 'aria-hidden="true" ') + 'data-slide="' + i + '">' +
          '<img class="hero__bg" src="' + attr(img) + '" alt="" width="1600" height="900" ' +
          (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">' +
          '<div class="hero__scrim"></div>' +
          '<div class="hero__inner"><div class="container"><div class="hero__content">' +
          '<span class="eyebrow hero__eyebrow">' + esc(TLS.tpl(s.eyebrow)) + "</span>" +
          '<h1 class="hero__title">' + TLS.rich(s.title) + "</h1>" +
          '<p class="hero__text">' + esc(TLS.tpl(s.text)) + "</p>" +
          '<div class="hero__actions">' +
          (s.primaryCta
            ? '<a class="btn btn--gold btn--lg" href="' + attr(s.primaryCta.href) + '">' +
              esc(s.primaryCta.label) + icon("arrowRight", "btn__icon") + "</a>"
            : "") +
          (s.secondaryCta
            ? '<a class="btn btn--ghost-light btn--lg" href="' + attr(s.secondaryCta.href) + '">' + esc(s.secondaryCta.label) + "</a>"
            : "") +
          "</div></div></div></div></div>"
        );
      })
      .join("");

    var dots = slides
      .map(function (s, i) {
        return (
          '<button class="hero__dot" type="button" role="tab" data-dot="' + i + '" ' +
          'aria-selected="' + (i === 0 ? "true" : "false") + '" aria-label="' + attr(s.eyebrow || "Slide " + (i + 1)) + '"></button>'
        );
      })
      .join("");

    host.innerHTML =
      '<div class="hero__viewport" id="heroViewport">' + slidesHTML + "</div>" +
      (slides.length > 1
        ? '<button class="hero__nav hero__nav--prev" type="button" data-hero="-1" aria-label="Previous slide">' + icon("chevronLeft") + "</button>" +
          '<button class="hero__nav hero__nav--next" type="button" data-hero="1" aria-label="Next slide">' + icon("chevronRight") + "</button>" +
          '<div class="hero__dots" role="tablist" aria-label="Choose slide">' + dots + "</div>"
        : "");

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

    host.addEventListener("mouseenter", function () {
      setPaused(true);
    });
    host.addEventListener("mouseleave", function () {
      setPaused(false);
    });
    host.addEventListener("focusin", function () {
      setPaused(true);
    });
    host.addEventListener("focusout", function (e) {
      if (!host.contains(e.relatedTarget)) setPaused(false);
    });
    host.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        show(i - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        show(i + 1);
      }
    });

    doc.addEventListener("visibilitychange", function () {
      setPaused(doc.hidden);
    });

    var x0 = null;
    var y0 = null;
    var vp = TLS.$("#heroViewport", host);
    vp.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
        setPaused(true);
      },
      { passive: true }
    );
    vp.addEventListener(
      "touchend",
      function (e) {
        if (x0 === null) {
          setPaused(false);
          return;
        }
        var t = e.changedTouches[0];
        var dx = t.clientX - x0;
        var dy = t.clientY - y0;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) show(i + (dx < 0 ? 1 : -1));
        x0 = y0 = null;
        setPaused(false);
      },
      { passive: true }
    );

    restart();
  }

  /* ====================== Marquee ====================== */
  function renderMarquee(page) {
    var host = TLS.$("#marquee");
    var words = page.marquee || [];
    if (!host || !words.length) return;
    var run = words
      .map(function (w) {
        return '<span class="marquee__item">' + TLS.esc(TLS.tpl(w)) + " <span>&#10022;</span></span>";
      })
      .join("");
    host.innerHTML = '<div class="marquee__track">' + run + run + "</div>";
  }

  /* ====================== Value props ====================== */
  function renderValues(page) {
    var host = TLS.$("#values");
    if (!host) return;
    host.innerHTML = (page.values || [])
      .map(function (v, n) {
        return (
          '<article class="value reveal" style="--reveal-delay:' + n * 80 + 'ms">' +
          '<span class="value__icon">' + TLS.icon(v.icon) + "</span>" +
          '<h3 class="value__title">' + TLS.esc(TLS.tpl(v.title)) + "</h3>" +
          '<p class="value__text">' + TLS.esc(TLS.tpl(v.text)) + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  /* ====================== Section headings ====================== */
  function fillSectionHead(prefix, cfg) {
    if (!cfg) return;
    var eyebrow = TLS.$("#" + prefix + "Eyebrow");
    var title = TLS.$("#" + prefix + "Title");
    var text = TLS.$("#" + prefix + "Text");
    var link = TLS.$("#" + prefix + "Link");
    if (eyebrow) eyebrow.textContent = TLS.tpl(cfg.eyebrow);
    if (title) title.innerHTML = TLS.rich(cfg.title);
    if (text) text.textContent = TLS.tpl(cfg.text);
    if (link) {
      if (cfg.linkLabel) {
        link.textContent = cfg.linkLabel;
        link.href = cfg.linkHref || "#";
      } else {
        link.remove();
      }
    }
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
  function renderCatalog(page) {
    var cfg = page.catalog || {};
    var tabsHost = TLS.$("#catalogTabs");
    var listHost = TLS.$("#catalogList");
    if (!listHost) return;
    var esc = TLS.esc;
    var attr = TLS.attr;

    if (tabsHost) {
      tabsHost.innerHTML =
        '<button class="tab" type="button" role="tab" data-tab="all" aria-selected="true">' +
        esc(cfg.allTabLabel) + '<span class="tab__n">' + D.PRODUCTS.length + "</span></button>" +
        D.CATEGORIES.map(function (c) {
          return (
            '<button class="tab" type="button" role="tab" data-tab="' + attr(c.id) + '" aria-selected="false">' +
            esc(c.name) + '<span class="tab__n">' + c.count + "</span></button>"
          );
        }).join("");
    }

    listHost.innerHTML = D.CATEGORIES.map(function (c) {
      var items = D.byCategory(c.id);
      var preview = items.slice(0, 4);
      return (
        '<section class="cat-block" id="cat-' + attr(c.id) + '" data-block="' + attr(c.id) + '" aria-labelledby="cbt-' + attr(c.id) + '">' +
        '<div class="cat-block__head">' +
        '<div class="cat-block__title">' +
        '<h3 id="cbt-' + attr(c.id) + '">' + esc(c.name) + "</h3>" +
        '<span class="cat-block__n">' + items.length + " " + esc(cfg.itemsSuffix) + "</span>" +
        "</div>" +
        '<a class="link-arrow" href="category.html?cat=' + attr(c.id) + '">' + esc(cfg.blockLinkLabel || "Show More") + " " + TLS.icon("arrowRight") + "</a>" +
        "</div>" +
        '<div class="card-grid">' +
        preview
          .map(function (p) {
            return TLS.productCardHTML(p);
          })
          .join("") +
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
  function renderStory(page) {
    var host = TLS.$("#story");
    var cfg = page.story;
    if (!host || !cfg) return;
    var esc = TLS.esc;
    var attr = TLS.attr;
    var years = new Date().getFullYear() - S.established;
    var img = TLS.media(cfg.image, "general") || TLS.art.story("craft", cfg.imageArtwork || "shoes");

    host.innerHTML =
      '<div class="split">' +
      '<div class="split__media reveal">' +
      '<img src="' + attr(img) + '" alt="' + attr(cfg.imageAlt) + '" width="1200" height="900" loading="lazy" decoding="async">' +
      '<div class="split__badge"><b>' + years + "</b><span>" + esc(cfg.badgeLabel) + "</span></div>" +
      "</div>" +
      '<div class="split__body reveal" style="--reveal-delay:120ms">' +
      '<span class="eyebrow">' + esc(TLS.tpl(cfg.eyebrow)) + "</span>" +
      '<h2 class="h-section">' + TLS.rich(cfg.title) + "</h2>" +
      (cfg.paragraphs || [])
        .map(function (t, i) {
          return "<p" + (i === 0 ? ' class="lede"' : "") + ">" + esc(TLS.tpl(t)) + "</p>";
        })
        .join("") +
      '<div class="stats">' +
      (cfg.stats || [])
        .map(function (s) {
          return '<div class="stat"><b>' + esc(TLS.tpl(s.value)) + "</b><span>" + esc(TLS.tpl(s.label)) + "</span></div>";
        })
        .join("") +
      "</div>" +
      (cfg.cta
        ? '<a class="btn btn--outline" href="' + attr(cfg.cta.href) + '">' + esc(cfg.cta.label) + TLS.icon("arrowRight", "btn__icon") + "</a>"
        : "") +
      "</div></div>";
  }

  /* ====================== Testimonials ====================== */
  function renderReviews(page) {
    var host = TLS.$("#reviews");
    var cfg = page.reviews || {};
    if (!host) return;
    var esc = TLS.esc;
    host.innerHTML = (cfg.items || [])
      .map(function (r, n) {
        var stars = "";
        for (var k = 0; k < (r.stars || 5); k++) stars += TLS.icon("star");
        return (
          '<figure class="quote reveal" style="--reveal-delay:' + n * 90 + 'ms;margin:0">' +
          '<div class="quote__stars" aria-label="' + (r.stars || 5) + ' out of 5">' + stars + "</div>" +
          '<blockquote class="quote__text" style="margin:0">&ldquo;' + esc(r.text) + "&rdquo;</blockquote>" +
          '<figcaption class="quote__by">' +
          '<span class="quote__avatar" aria-hidden="true">' + esc((r.name || "?").charAt(0)) + "</span>" +
          "<span><b>" + esc(r.name) + "</b><span>" + esc(r.note) + "</span></span>" +
          "</figcaption></figure>"
        );
      })
      .join("");
  }

  /* ====================== Visit CTA ====================== */
  function renderCta(page) {
    var host = TLS.$("#visitCta");
    var cfg = page.visitCta;
    if (!host || !cfg) return;
    var st = TLS.hoursStatus();

    host.innerHTML =
      '<span class="eyebrow eyebrow--center" style="color:var(--c-gold)">' + TLS.esc(TLS.tpl(cfg.eyebrow)) + "</span>" +
      "<h2>" + TLS.rich(cfg.title) + "</h2>" +
      (cfg.showAddressAndHours ? "<p>" + TLS.esc(S.address.full) + " &middot; " + TLS.esc(st.label) + "</p>" : "") +
      '<div class="cta-band__actions">' +
      (cfg.buttons || [])
        .map(function (b) {
          return actionButton(b, "btn--lg");
        })
        .join("") +
      "</div>";
  }

  /* ====================== Boot ====================== */
  TLS.start("home", function (page) {
    renderHero(page);
    renderMarquee(page);
    renderValues(page);
    fillSectionHead("cats", page.categoriesSection);
    fillSectionHead("catalog", page.catalog);
    fillSectionHead("rev", page.reviews);
    renderCategories();
    renderCatalog(page);
    renderStory(page);
    renderReviews(page);
    renderCta(page);
  });
})(window, document);
