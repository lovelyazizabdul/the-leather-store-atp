/* ==========================================================================
   The Leather Store — modal.js
   Product detail modal: image gallery, product video, specs, enquiry CTA.
   Deep-linkable via #p=<product-id>.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var S = TLS.SITE;
  var D = TLS.DATA;
  var icon = TLS.icon;
  var esc = TLS.esc;
  var attr = TLS.attr;
  var money = TLS.money;

  var root = null;
  var trap = null;
  var current = null;
  var slides = [];
  var index = 0;
  var didPush = false;
  var isOpen = false;

  /* ---------------- Markup shell ---------------- */
  function build() {
    if (root) return root;

    root = doc.createElement("div");
    root.className = "modal";
    root.id = "productModal";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "pmTitle");
    root.innerHTML =
      '<div class="modal__backdrop" data-close></div>' +
      '<div class="modal__dialog" role="document">' +
      '<button class="modal__close" type="button" data-close aria-label="Close product details">' + icon("close") + "</button>" +
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
              'poster="' + s.poster + '" aria-label="Product video for ' + attr(p.name) + '">' +
              '<source src="' + attr(s.src) + '" type="video/mp4">' +
              "Your browser does not support embedded video." +
              "</video>"
            );
          }
          return (
            '<img class="pv__media" data-i="' + i + '" src="' + s.src + '" ' +
            'alt="' + attr(p.name + " — view " + (i + 1)) + '" width="800" height="1000" decoding="async">'
          );
        })
        .join("") +
      '<button class="pv__nav pv__nav--prev" type="button" data-nav="-1" aria-label="Previous image">' + icon("chevronLeft") + "</button>" +
      '<button class="pv__nav pv__nav--next" type="button" data-nav="1" aria-label="Next image">' + icon("chevronRight") + "</button>";

    thumbs.innerHTML = slides
      .map(function (s, i) {
        var img = s.type === "video" ? s.poster : s.src;
        return (
          '<button class="pv__thumb' + (s.type === "video" ? " pv__thumb--video" : "") + '" type="button" role="tab" ' +
          'data-i="' + i + '" aria-selected="' + (i === 0 ? "true" : "false") + '" ' +
          'aria-label="' + (s.type === "video" ? "Play product video" : "View image " + (i + 1)) + '">' +
          '<img src="' + img + '" alt="" width="128" height="128" loading="lazy" decoding="async"></button>'
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
    if (!value) return "";
    return '<div class="pi__spec"><dt>' + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  function renderInfo(p) {
    var info = TLS.$("#pmInfo", root);

    var flags = "";
    if (!p.inStock) flags += '<span class="badge badge--out">Sold out</span>';
    else flags += '<span class="badge badge--soft">In stock at the store</span>';
    if (p.bestseller) flags += '<span class="badge badge--gold">Bestseller</span>';
    if (p.isNew) flags += '<span class="badge">New in</span>';
    if (p.discount) flags += '<span class="badge badge--sale">' + p.discount + "% off</span>";

    var sizes = p.sizes && p.sizes.length
      ? '<div class="pi__group"><span class="pi__label">' + (p.category === "perfumes" ? "Bottle size" : "Available sizes") + '</span>' +
        '<div class="pi__pills">' +
        p.sizes.map(function (s) { return '<span class="pi__pill">' + esc(s) + "</span>"; }).join("") +
        "</div></div>"
      : "";

    var colors = p.colors && p.colors.length
      ? '<div class="pi__group"><span class="pi__label">Colours</span><div class="pi__pills">' +
        p.colors
          .map(function (c) {
            var hex = D.COLOR_HEX[c] || "#b9a894";
            return '<span class="pi__pill"><span class="swatch" style="background:' + hex + '"></span>' + esc(c) + "</span>";
          })
          .join("") +
        "</div></div>"
      : "";

    var specs =
      '<dl class="pi__specs">' +
      specRow("SKU", p.sku) +
      specRow("Category", p.categoryName) +
      specRow("Material", p.material) +
      specRow("Style", p.style) +
      specRow("Frame shape", p.shape) +
      specRow("Lens", p.lens) +
      specRow("Movement", p.movement) +
      specRow("Strap", p.strap) +
      specRow("Fragrance family", p.family) +
      specRow("Concentration", p.concentration) +
      specRow("Suited to", p.gender) +
      specRow("Availability", p.inStock ? "In store" : "Ask us to reserve") +
      "</dl>";

    var features =
      '<div class="pi__features">' +
      p.features
        .map(function (f) {
          return '<p class="pi__feature">' + icon("check") + "<span>" + esc(f) + "</span></p>";
        })
        .join("") +
      "</div>";

    var msg =
      "Hello " + S.name + "!\n\nI am interested in this product:\n" +
      "• " + p.name + " (" + p.sku + ")\n" +
      "• Category: " + p.categoryName + "\n" +
      "• Price: " + money(p.price) + "\n\n" +
      "Is it available? Could you share more details?";

    info.innerHTML =
      (flags ? '<div class="pi__flags">' + flags + "</div>" : "") +
      '<span class="pi__cat">' + esc(p.categoryName) + "</span>" +
      '<h2 class="pi__name" id="pmTitle">' + esc(p.name) + "</h2>" +
      '<div class="pi__pricing">' +
      '<span class="price">' + money(p.price) + "</span>" +
      (p.mrp ? '<span class="price--old">' + money(p.mrp) + "</span>" : "") +
      (p.discount ? '<span class="price--off">Save ' + money(p.mrp - p.price) + "</span>" : "") +
      '<span class="rating" style="margin-left:auto">' + icon("star") + p.rating.toFixed(1) + " · " + p.reviews + " in-store reviews</span>" +
      "</div>" +
      '<p class="pi__desc">' + esc(p.description) + "</p>" +
      sizes +
      colors +
      specs +
      features +
      '<div class="pi__actions">' +
      '<a class="btn btn--wa" href="' + attr(TLS.waLink(msg)) + '" target="_blank" rel="noopener noreferrer">' +
      icon("whatsapp", "btn__icon") + "Enquire on WhatsApp</a>" +
      '<button class="btn btn--outline" type="button" id="pmShare" aria-label="Share this product">' +
      icon("share", "btn__icon") + "Share</button>" +
      "</div>" +
      '<p class="pi__note">Prices are inclusive of taxes. Colours may vary slightly on screen — visit the store to see the real finish.</p>';

    var shareBtn = TLS.$("#pmShare", info);
    if (shareBtn) shareBtn.addEventListener("click", function () { share(p); });
  }

  function share(p) {
    var url = global.location.origin + global.location.pathname + global.location.search + "#p=" + p.id;
    var data = { title: p.name + " — " + S.name, text: p.name + " at " + S.name, url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () { /* user dismissed */ });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () { TLS.toast("Product link copied", "copy"); },
        function () { TLS.toast("Could not copy the link", "close"); }
      );
      return;
    }
    global.prompt("Copy this product link:", url);
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
      try { v.pause(); } catch (e) { /* noop */ }
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
        } catch (e) { /* noop */ }
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

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", initFromUrl);
  } else {
    initFromUrl();
  }
})(window, document);
