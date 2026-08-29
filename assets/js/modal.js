/* ==========================================================================
   The Leather Store — modal.js
   Product detail modal: image gallery, product video, specs, enquiry CTA.
   All wording comes from content/site.json → "product".
   Deep-linkable via #p=<product-id>.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var S = TLS.SITE;
  var D = TLS.DATA;

  var root = null;
  var trap = null;
  var current = null;
  var slides = [];
  var index = 0;
  var didPush = false;
  var isOpen = false;

  function P() {
    return S.product || {};
  }

  /* ---------------- Markup shell ---------------- */
  function build() {
    if (root) return root;
    var icon = TLS.icon;

    root = doc.createElement("div");
    root.className = "modal";
    root.id = "productModal";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "pmTitle");
    root.innerHTML =
      '<div class="modal__backdrop" data-close></div>' +
      '<div class="modal__dialog" role="document">' +
      '<button class="modal__close" type="button" data-close aria-label="' + TLS.attr(P().closeLabel || "Close") + '">' +
      icon("close") + "</button>" +
      '<div class="modal__body">' +
      '<div class="pv">' +
      '<div class="pv__stage" id="pmStage" aria-live="polite"></div>' +
      '<div class="pv__thumbs no-scrollbar" id="pmThumbs" role="tablist" aria-label="Product media"></div>' +
      "</div>" +
      '<div class="pi" id="pmInfo"></div>' +
      "</div></div>";

    doc.body.appendChild(root);
    trap = TLS.createTrap(root);

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) close();
    });

    doc.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        go(index - 1);
      } else if (e.key === "ArrowRight") {
        go(index + 1);
      }
    });

    wireSwipe(TLS.$("#pmStage", root));
    return root;
  }

  /* ---------------- Gallery ---------------- */
  function buildSlides(p) {
    var out = [];
    var count = TLS.art.productImageCount(p);
    for (var i = 0; i < count; i++) {
      out.push({ type: "image", src: TLS.art.product(p, i) });
    }
    var video = p.video || S.demoVideo;
    if (video) out.push({ type: "video", src: video, poster: TLS.art.product(p, 0) });
    return out;
  }

  function renderGallery(p) {
    var icon = TLS.icon;
    var attr = TLS.attr;
    var stage = TLS.$("#pmStage", root);
    var thumbs = TLS.$("#pmThumbs", root);
    slides = buildSlides(p);
    index = 0;

    stage.innerHTML =
      slides
        .map(function (s, i) {
          if (s.type === "video") {
            return (
              '<video class="pv__media" data-i="' + i + '" playsinline webkit-playsinline preload="none" controls ' +
              'poster="' + attr(s.poster) + '" aria-label="' + attr(p.name) + '">' +
              '<source src="' + attr(s.src) + '" type="video/mp4">' +
              "Your browser does not support embedded video.</video>"
            );
          }
          return (
            '<img class="pv__media" data-i="' + i + '" src="' + attr(s.src) + '" ' +
            'alt="' + attr(p.name + " — view " + (i + 1)) + '" width="800" height="1000" decoding="async">'
          );
        })
        .join("") +
      '<button class="pv__nav pv__nav--prev" type="button" data-nav="-1" aria-label="Previous image">' + icon("chevronLeft") + "</button>" +
      '<button class="pv__nav pv__nav--next" type="button" data-nav="1" aria-label="Next image">' + icon("chevronRight") + "</button>";

    thumbs.innerHTML = slides
      .map(function (s, i) {
        var img = s.type === "video" ? s.poster : s.src;
        var label = s.type === "video" ? P().videoTabLabel || "Play video" : "View image " + (i + 1);
        return (
          '<button class="pv__thumb' + (s.type === "video" ? " pv__thumb--video" : "") + '" type="button" role="tab" ' +
          'data-i="' + i + '" aria-selected="' + (i === 0 ? "true" : "false") + '" aria-label="' + attr(label) + '">' +
          '<img src="' + attr(img) + '" alt="" width="128" height="128" loading="lazy" decoding="async"></button>'
        );
      })
      .join("");

    stage.addEventListener("click", onNavClick);
    thumbs.addEventListener("click", onThumbClick);
    go(0);
  }

  function onNavClick(e) {
    var btn = e.target.closest("[data-nav]");
    if (!btn) return;
    go(index + parseInt(btn.getAttribute("data-nav"), 10));
  }

  function onThumbClick(e) {
    var btn = e.target.closest(".pv__thumb");
    if (!btn) return;
    go(parseInt(btn.getAttribute("data-i"), 10));
  }

  function go(i) {
    if (!slides.length) return;
    var n = slides.length;
    index = ((i % n) + n) % n;

    TLS.$$(".pv__media", root).forEach(function (node) {
      var active = parseInt(node.getAttribute("data-i"), 10) === index;
      node.classList.toggle("is-active", active);
      if (node.tagName === "VIDEO" && !active && !node.paused) node.pause();
    });

    TLS.$$(".pv__thumb", root).forEach(function (t) {
      t.setAttribute("aria-selected", parseInt(t.getAttribute("data-i"), 10) === index ? "true" : "false");
    });
  }

  function wireSwipe(node) {
    var x0 = null;
    var y0 = null;
    node.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
      },
      { passive: true }
    );
    node.addEventListener(
      "touchend",
      function (e) {
        if (x0 === null) return;
        var t = e.changedTouches[0];
        var dx = t.clientX - x0;
        var dy = t.clientY - y0;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1));
        x0 = y0 = null;
      },
      { passive: true }
    );
  }

  /* ---------------- Info panel ---------------- */
  function specRow(label, value) {
    if (!value || !label) return "";
    return '<div class="pi__spec"><dt>' + TLS.esc(label) + "</dt><dd>" + TLS.esc(value) + "</dd></div>";
  }

  function renderInfo(p) {
    var icon = TLS.icon;
    var esc = TLS.esc;
    var attr = TLS.attr;
    var money = TLS.money;
    var c = P();
    var L = c.specLabels || {};

    var off = TLS.tpl(c.discountBadgeTemplate, { PERCENT: p.discount });
    var flags = "";
    flags += p.inStock
      ? '<span class="badge badge--soft">' + esc(c.inStockBadge) + "</span>"
      : '<span class="badge badge--out">' + esc(c.soldOutBadge) + "</span>";
    if (p.bestseller) flags += '<span class="badge badge--gold">' + esc(c.bestsellerBadge) + "</span>";
    if (p.isNew) flags += '<span class="badge">' + esc(c.newBadge) + "</span>";
    if (p.discount) flags += '<span class="badge badge--sale">' + esc(off) + "</span>";

    var sizes =
      p.sizes && p.sizes.length
        ? '<div class="pi__group"><span class="pi__label">' +
          esc(p.category === "perfumes" ? c.bottleSizeLabel : c.sizesLabel) +
          '</span><div class="pi__pills">' +
          p.sizes
            .map(function (s) {
              return '<span class="pi__pill">' + esc(s) + "</span>";
            })
            .join("") +
          "</div></div>"
        : "";

    var colors =
      p.colors && p.colors.length
        ? '<div class="pi__group"><span class="pi__label">' + esc(c.coloursLabel) + '</span><div class="pi__pills">' +
          p.colors
            .map(function (col) {
              var hex = D.COLOR_HEX[col] || "#b9a894";
              return '<span class="pi__pill"><span class="swatch" style="background:' + hex + '"></span>' + esc(col) + "</span>";
            })
            .join("") +
          "</div></div>"
        : "";

    var specs =
      '<dl class="pi__specs">' +
      specRow(L.sku, p.sku) +
      specRow(L.category, p.categoryName) +
      specRow(L.material, p.material) +
      specRow(L.style, p.style) +
      specRow(L.shape, p.shape) +
      specRow(L.lens, p.lens) +
      specRow(L.movement, p.movement) +
      specRow(L.strap, p.strap) +
      specRow(L.family, p.family) +
      specRow(L.concentration, p.concentration) +
      specRow(L.gender, p.gender) +
      specRow(L.availability, p.inStock ? c.availabilityInStore : c.availabilityReserve) +
      "</dl>";

    var features =
      '<div class="pi__features">' +
      (p.features || [])
        .map(function (f) {
          return '<p class="pi__feature">' + icon("check") + "<span>" + esc(f) + "</span></p>";
        })
        .join("") +
      "</div>";

    var enquiry = TLS.waLink(c.enquiryMessage, {
      NAME: p.name,
      SKU: p.sku,
      CATEGORY: p.categoryName,
      PRICE: money(p.price)
    });

    TLS.$("#pmInfo", root).innerHTML =
      (flags ? '<div class="pi__flags">' + flags + "</div>" : "") +
      '<span class="pi__cat">' + esc(p.categoryName) + "</span>" +
      '<h2 class="pi__name" id="pmTitle">' + esc(p.name) + "</h2>" +
      '<div class="pi__pricing">' +
      '<span class="price">' + money(p.price) + "</span>" +
      (p.mrp ? '<span class="price--old">' + money(p.mrp) + "</span>" : "") +
      (p.discount ? '<span class="price--off">' + esc(TLS.tpl(c.saveTemplate, { AMOUNT: money(p.mrp - p.price) })) + "</span>" : "") +
      '<span class="rating" style="margin-left:auto">' + icon("star") +
      esc(TLS.tpl(c.reviewsTemplate, { RATING: p.rating.toFixed(1), COUNT: p.reviews })) + "</span>" +
      "</div>" +
      '<p class="pi__desc">' + esc(p.description) + "</p>" +
      sizes +
      colors +
      specs +
      features +
      '<div class="pi__actions">' +
      '<a class="btn btn--wa" href="' + attr(enquiry) + '" target="_blank" rel="noopener noreferrer">' +
      icon("whatsapp", "btn__icon") + esc(c.enquireLabel) + "</a>" +
      '<button class="btn btn--outline" type="button" id="pmShare">' + icon("share", "btn__icon") + esc(c.shareLabel) + "</button>" +
      "</div>" +
      '<p class="pi__note">' + esc(c.footnote) + "</p>";

    var shareBtn = TLS.$("#pmShare", root);
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        share(p);
      });
    }
  }

  function share(p) {
    var url = global.location.origin + global.location.pathname + global.location.search + "#p=" + p.id;
    var data = { title: p.name + " — " + S.name, text: p.name + " at " + S.name, url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () {
          TLS.toast(S.common.toastCopied, "copy");
        },
        function () {
          TLS.toast(S.common.toastCopyFailed, "close");
        }
      );
      return;
    }
    global.prompt(S.common.toastCopied, url);
  }

  /* ---------------- Open / close ---------------- */
  function open(id, fromHistory) {
    var p = D.product(id);
    if (!p) return;
    build();

    current = p;
    renderGallery(p);
    renderInfo(p);

    root.classList.add("is-open");
    isOpen = true;
    TLS.lockScroll();
    trap.activate(TLS.$(".modal__close", root));

    if (!fromHistory) {
      try {
        global.history.pushState({ tlsProduct: id }, "", "#p=" + id);
        didPush = true;
      } catch (e) {
        didPush = false;
      }
    }
  }

  function close(fromHistory) {
    if (!isOpen || !root) return;

    TLS.$$("video", root).forEach(function (v) {
      try {
        v.pause();
      } catch (e) {}
    });

    root.classList.remove("is-open");
    isOpen = false;
    current = null;
    TLS.unlockScroll();
    trap.deactivate();

    if (!fromHistory) {
      if (didPush) {
        didPush = false;
        global.history.back();
      } else {
        try {
          global.history.replaceState(null, "", global.location.pathname + global.location.search);
        } catch (e) {}
      }
    } else {
      didPush = false;
    }
  }

  /* ---------------- History / deep links ---------------- */
  function hashProductId() {
    var h = global.location.hash || "";
    return h.indexOf("#p=") === 0 ? decodeURIComponent(h.slice(3)) : null;
  }

  global.addEventListener("popstate", function () {
    var id = hashProductId();
    if (id) {
      if (!isOpen || !current || current.id !== id) open(id, true);
    } else if (isOpen) {
      close(true);
    }
  });

  function initFromUrl() {
    var id = hashProductId();
    if (id && D.product(id)) {
      didPush = false;
      open(id, true);
    }
  }

  TLS.modal = { open: open, close: close, initFromUrl: initFromUrl };
})(window, document);
