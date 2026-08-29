/* ==========================================================================
   The Leather Store — ui.js
   Shared shell: helpers, header, footer, drawer, scroll behaviours, toasts,
   and the product-card renderer used by every page.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var S = TLS.SITE;
  var D = TLS.DATA;
  var icon = TLS.icon;

  /* ====================== 1. Helpers ====================== */
  function $(sel, root) {
    return (root || doc).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function attr(str) {
    return esc(str);
  }

  var nf;
  try {
    nf = new Intl.NumberFormat(S.locale, {
      style: "currency",
      currency: S.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } catch (e) {
    nf = null;
  }

  function money(n) {
    if (typeof n !== "number" || !isFinite(n)) return "";
    if (nf) return nf.format(n);
    return S.currencySymbol + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function waLink(message) {
    var base = "https://wa.me/" + S.whatsapp;
    return message ? base + "?text=" + encodeURIComponent(message) : base;
  }

  function param(name, search) {
    var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(search || global.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait || 150);
    };
  }

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ====================== 2. Scroll lock ====================== */
  var lockCount = 0;
  var savedY = 0;

  function lockScroll() {
    if (lockCount++ > 0) return;
    savedY = global.scrollY || global.pageYOffset || 0;
    var sbw = global.innerWidth - doc.documentElement.clientWidth;
    if (sbw > 0) doc.body.style.paddingRight = sbw + "px";
    doc.body.style.top = -savedY + "px";
    doc.body.classList.add("is-locked");
  }

  function unlockScroll() {
    if (lockCount === 0) return;
    if (--lockCount > 0) return;
    doc.body.classList.remove("is-locked");
    doc.body.style.top = "";
    doc.body.style.paddingRight = "";
    global.scrollTo(0, savedY);
  }

  /* ====================== 3. Focus trap ====================== */
  var FOCUSABLE =
    'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),' +
    "select:not([disabled]),textarea:not([disabled]),iframe,video[controls],[tabindex]:not([tabindex='-1'])";

  function createTrap(container) {
    var lastFocused = null;

    function onKey(e) {
      if (e.key !== "Tab") return;
      var items = $$(FOCUSABLE, container).filter(function (n) {
        return n.offsetParent !== null || n === doc.activeElement;
      });
      if (!items.length) {
        e.preventDefault();
        return;
      }
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    return {
      activate: function (focusTarget) {
        lastFocused = doc.activeElement;
        doc.addEventListener("keydown", onKey, true);
        var t =
          focusTarget ||
          $$(FOCUSABLE, container).filter(function (n) {
            return n.offsetParent !== null;
          })[0];
        if (t) {
          try {
            t.focus({ preventScroll: true });
          } catch (e) {
            t.focus();
          }
        }
      },
      deactivate: function () {
        doc.removeEventListener("keydown", onKey, true);
        if (lastFocused && typeof lastFocused.focus === "function") {
          try {
            lastFocused.focus({ preventScroll: true });
          } catch (e) {
            lastFocused.focus();
          }
        }
      }
    };
  }

  /* ====================== 4. Toasts ====================== */
  var toastWrap;

  function toast(message, iconName) {
    if (!toastWrap) {
      toastWrap = doc.createElement("div");
      toastWrap.className = "toast-wrap";
      toastWrap.setAttribute("role", "status");
      toastWrap.setAttribute("aria-live", "polite");
      doc.body.appendChild(toastWrap);
    }
    var t = doc.createElement("div");
    t.className = "toast";
    t.innerHTML = icon(iconName || "check") + "<span>" + esc(message) + "</span>";
    toastWrap.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-out");
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 320);
    }, 2800);
  }

  /* ====================== 5. Opening hours ====================== */
  function hoursStatus(now) {
    var d = now || new Date();
    var idx = (d.getDay() + 6) % 7; /* config starts on Monday */
    var today = S.hours[idx];
    if (!today || !today.open) return { open: false, label: "Closed today", today: today, index: idx };
    var mins = d.getHours() * 60 + d.getMinutes();
    var o = today.open.split(":");
    var c = today.close.split(":");
    var openM = +o[0] * 60 + +o[1];
    var closeM = +c[0] * 60 + +c[1];
    var isOpen = mins >= openM && mins < closeM;
    return {
      open: isOpen,
      label: isOpen ? "Open now · until " + fmtTime(today.close) : "Closed · opens " + fmtTime(today.open),
      today: today,
      index: idx
    };
  }

  function fmtTime(hhmm) {
    var p = hhmm.split(":");
    var h = +p[0];
    var m = p[1];
    var ap = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m === "00" ? "" : ":" + m) + " " + ap;
  }

  /* ====================== 6. Product card ====================== */
  function swatchesHTML(colors) {
    if (!colors || !colors.length) return "";
    var shown = colors.slice(0, 4);
    var html = shown
      .map(function (c) {
        var hex = D.COLOR_HEX[c] || "#b9a894";
        return '<span class="swatch" style="background:' + hex + '" title="' + attr(c) + '"></span>';
      })
      .join("");
    if (colors.length > shown.length) {
      html += '<span class="swatch--more">+' + (colors.length - shown.length) + "</span>";
    }
    return '<span class="swatches" aria-label="Available colours: ' + attr(colors.join(", ")) + '">' + html + "</span>";
  }

  function productCardHTML(p) {
    var img0 = TLS.art.product(p, 0);
    var img1 = TLS.art.product(p, 1);
    var flags = "";
    if (!p.inStock) flags += '<span class="badge badge--out">Sold out</span>';
    else if (p.bestseller) flags += '<span class="badge badge--gold">Bestseller</span>';
    else if (p.isNew) flags += '<span class="badge">New in</span>';
    if (p.discount >= 20) flags += '<span class="badge badge--sale">' + p.discount + "% off</span>";

    return (
      '<article class="p-card" data-product="' + attr(p.id) + '" tabindex="0" role="button" ' +
      'aria-label="View details for ' + attr(p.name) + '">' +
      '<div class="p-card__media">' +
      '<img class="p-card__img" src="' + img0 + '" alt="' + attr(p.name) + '" width="800" height="1000" loading="lazy" decoding="async">' +
      '<img class="p-card__img p-card__img--alt" src="' + img1 + '" alt="" aria-hidden="true" width="800" height="1000" loading="lazy" decoding="async">' +
      (flags ? '<div class="p-card__flags">' + flags + "</div>" : "") +
      '<span class="p-card__quick">' + icon("eye") + "Quick view</span>" +
      "</div>" +
      '<div class="p-card__body">' +
      '<span class="p-card__cat">' + esc(p.categoryName) + "</span>" +
      '<h3 class="p-card__name">' + esc(p.name) + "</h3>" +
      (p.meta ? '<p class="p-card__meta">' + esc(p.meta) + "</p>" : "") +
      '<div class="p-card__sub">' +
      swatchesHTML(p.colors) +
      '<span class="rating">' + icon("star") + p.rating.toFixed(1) + "</span>" +
      "</div>" +
      '<div class="p-card__foot">' +
      '<span class="price">' + money(p.price) + "</span>" +
      (p.mrp ? '<span class="price--old">' + money(p.mrp) + "</span>" : "") +
      (p.discount ? '<span class="price--off">' + p.discount + "% off</span>" : "") +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  /** Delegate card activation (click + keyboard) to the modal. */
  function bindCards(root) {
    var host = root || doc;
    if (host.__tlsCardsBound) return;
    host.__tlsCardsBound = true;

    host.addEventListener("click", function (e) {
      var card = e.target.closest ? e.target.closest(".p-card") : null;
      if (!card || !host.contains(card)) return;
      if (TLS.modal) TLS.modal.open(card.getAttribute("data-product"));
    });

    host.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      var card = e.target.closest ? e.target.closest(".p-card") : null;
      if (!card || !host.contains(card)) return;
      e.preventDefault();
      if (TLS.modal) TLS.modal.open(card.getAttribute("data-product"));
    });
  }

  /* ====================== 7. Category tile ====================== */
  function categoryTileHTML(cat) {
    return (
      '<a class="cat-tile" href="category.html?cat=' + attr(cat.id) + '" aria-label="' + attr(cat.name) + ' — ' + cat.count + ' products">' +
      '<img class="cat-tile__img" src="' + TLS.art.category(cat, 900, 700) + '" alt="" width="900" height="700" loading="lazy" decoding="async">' +
      '<div class="cat-tile__body">' +
      '<span class="cat-tile__count">' + cat.count + " products</span>" +
      '<h3 class="cat-tile__name">' + esc(cat.name) + "</h3>" +
      '<span class="cat-tile__cta">Shop now ' + icon("arrowRight") + "</span>" +
      "</div>" +
      "</a>"
    );
  }

  /* ====================== 8. Header ====================== */
  function socialLinksHTML(light) {
    var cls = light ? " social--light" : "";
    return (
      '<a class="social social--instagram' + cls + '" href="' + attr(S.social.instagram) + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' + icon("instagram") + "</a>" +
      '<a class="social social--facebook' + cls + '" href="' + attr(S.social.facebook) + '" target="_blank" rel="noopener noreferrer" aria-label="Facebook">' + icon("facebook") + "</a>" +
      '<a class="social social--telegram' + cls + '" href="' + attr(S.social.telegram) + '" target="_blank" rel="noopener noreferrer" aria-label="Telegram">' + icon("telegram") + "</a>" +
      '<a class="social social--whatsapp' + cls + '" href="' + attr(S.social.whatsapp) + '" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">' + icon("whatsapp") + "</a>"
    );
  }

  function renderHeader() {
    var host = $("#site-header");
    if (!host) return;
    var page = doc.body.getAttribute("data-page") || "";
    var activeCat = doc.body.getAttribute("data-cat") || "";

    var annItems = S.announcements
      .map(function (a) {
        return '<span class="announce__item">' + icon("sparkle") + esc(a) + "</span>";
      })
      .join("");

    var megaLinks = D.CATEGORIES.map(function (c) {
      return (
        '<a class="mega__link" href="category.html?cat=' + attr(c.id) + '">' +
        '<img class="mega__thumb" src="' + TLS.art.category(c, 160, 160) + '" alt="" width="160" height="160" loading="lazy" decoding="async">' +
        "<span>" +
        '<span class="mega__name">' + esc(c.name) + "</span>" +
        '<span class="mega__count">' + esc(c.tagline) + "</span>" +
        "</span></a>"
      );
    }).join("");

    host.className = "site-header";
    host.innerHTML =
      '<div class="announce" aria-hidden="true"><div class="announce__track">' + annItems + "</div></div>" +
      '<div class="container">' +
      '<nav class="navbar" aria-label="Primary">' +
      '<a class="brand" href="index.html" aria-label="' + attr(S.name) + ' — home">' +
      TLS.art.logoSvg(42) +
      '<span class="brand__text">' +
      '<span class="brand__name">' + esc(S.name) + "</span>" +
      '<span class="brand__tag">' + esc(S.tagline) + "</span>" +
      "</span></a>" +

      '<ul class="nav">' +
      '<li class="nav__item"><a class="nav__link" href="index.html"' + (page === "home" ? ' aria-current="page"' : "") + ">Home</a></li>" +
      '<li class="nav__item">' +
      '<button class="nav__link" type="button" id="megaBtn" aria-expanded="false" aria-controls="megaMenu"' +
      (page === "categories" || page === "category" ? ' aria-current="page"' : "") +
      ">Categories" + icon("chevronDown", "nav__caret") + "</button>" +
      '<div class="mega" id="megaMenu" role="menu" aria-labelledby="megaBtn">' +
      '<div class="mega__grid">' + megaLinks + "</div>" +
      '<div class="mega__foot">' +
      '<p class="muted" style="font-size:var(--fs-sm);margin:0">' + D.PRODUCTS.length + " products across " + D.CATEGORIES.length + " categories, all in stock at the shop.</p>" +
      '<a class="link-arrow" href="categories.html">Browse all categories ' + icon("arrowRight") + "</a>" +
      "</div></div></li>" +
      '<li class="nav__item"><a class="nav__link" href="contact.html"' + (page === "contact" ? ' aria-current="page"' : "") + ">Contact Us</a></li>" +
      "</ul>" +

      '<div class="nav-actions">' +
      '<a class="btn btn--outline btn--sm" href="' + attr(waLink("Hello " + S.name + ", I would like to know more about your collection.")) + '" target="_blank" rel="noopener noreferrer">' +
      icon("whatsapp", "btn__icon") + "Enquire</a>" +
      '<button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="mobileDrawer" aria-label="Open menu">' +
      "<span></span><span></span><span></span></button>" +
      "</div>" +
      "</nav></div>";

    /* Duplicate the announcement items so the marquee can loop seamlessly */
    var track = $(".announce__track", host);
    if (track) track.innerHTML += annItems;

    buildDrawer(page, activeCat);
    wireMega();
    wireStickyHeader();
  }

  function wireMega() {
    var btn = $("#megaBtn");
    var menu = $("#megaMenu");
    if (!btn || !menu) return;
    var item = btn.parentNode;
    var closeTimer;

    function open() {
      clearTimeout(closeTimer);
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
    function close() {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
    function delayedClose() {
      closeTimer = setTimeout(close, 180);
    }

    btn.addEventListener("click", function () {
      menu.classList.contains("is-open") ? close() : open();
    });
    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", delayedClose);
    menu.addEventListener("mouseenter", function () {
      clearTimeout(closeTimer);
    });
    menu.addEventListener("mouseleave", delayedClose);
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        close();
        btn.focus();
      }
    });
    doc.addEventListener("click", function (e) {
      if (!item.contains(e.target)) close();
    });
  }

  function wireStickyHeader() {
    var header = $("#site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", (global.scrollY || global.pageYOffset) > 8);
    };
    onScroll();
    global.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ====================== 9. Mobile drawer ====================== */
  function buildDrawer(page, activeCat) {
    if ($("#mobileDrawer")) return;

    var overlay = doc.createElement("div");
    overlay.className = "overlay";
    overlay.id = "navOverlay";
    doc.body.appendChild(overlay);

    var drawer = doc.createElement("aside");
    drawer.className = "drawer";
    drawer.id = "mobileDrawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Site menu");
    drawer.setAttribute("tabindex", "-1");

    var catLinks = D.CATEGORIES.map(function (c) {
      return (
        '<a class="m-acc__link" href="category.html?cat=' + attr(c.id) + '"' +
        (activeCat === c.id ? ' aria-current="page"' : "") +
        ">" + esc(c.name) + '<span class="opt__n" style="margin-left:auto">' + c.count + "</span></a>"
      );
    }).join("");

    drawer.innerHTML =
      '<div class="drawer__head">' +
      '<span class="drawer__title">Menu</span>' +
      '<button class="icon-btn" type="button" id="drawerClose" aria-label="Close menu">' + icon("close") + "</button>" +
      "</div>" +
      '<div class="drawer__body">' +
      '<nav class="m-nav" aria-label="Mobile">' +
      '<a class="m-nav__link" href="index.html"' + (page === "home" ? ' aria-current="page"' : "") + ">Home" + icon("arrowRight") + "</a>" +
      '<button class="m-acc__btn" type="button" aria-expanded="' + (page === "category" || page === "categories" ? "true" : "false") + '" aria-controls="mAccPanel">Categories' + icon("chevronDown") + "</button>" +
      '<div class="m-acc__panel' + (page === "category" || page === "categories" ? " is-open" : "") + '" id="mAccPanel">' + catLinks +
      '<a class="m-acc__link" href="categories.html"><strong>View all categories</strong></a>' +
      "</div>" +
      '<a class="m-nav__link" href="contact.html"' + (page === "contact" ? ' aria-current="page"' : "") + ">Contact Us" + icon("arrowRight") + "</a>" +
      "</nav>" +
      '<div class="drawer__socials">' + socialLinksHTML(false) + "</div>" +
      "</div>" +
      '<div class="drawer__foot">' +
      '<a class="btn btn--wa btn--block" href="' + attr(S.social.whatsapp) + '" target="_blank" rel="noopener noreferrer">' + icon("whatsapp", "btn__icon") + "Chat on WhatsApp</a>" +
      '<a class="btn btn--outline btn--block" href="tel:' + attr(S.phone) + '">' + icon("phone", "btn__icon") + esc(S.phoneDisplay) + "</a>" +
      "</div>";

    doc.body.appendChild(drawer);

    var burger = $("#burger");
    var trap = createTrap(drawer);

    function openDrawer() {
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      if (burger) {
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "Close menu");
      }
      lockScroll();
      trap.activate($("#drawerClose", drawer));
    }

    function closeDrawer() {
      if (!drawer.classList.contains("is-open")) return;
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
      if (burger) {
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open menu");
      }
      unlockScroll();
      trap.deactivate();
    }

    if (burger) {
      burger.addEventListener("click", function () {
        drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
      });
    }
    $("#drawerClose", drawer).addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
    $$("a", drawer).forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });

    var acc = $(".m-acc__btn", drawer);
    var panel = $("#mAccPanel", drawer);
    acc.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      acc.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* Close automatically when resizing up to desktop */
    global.addEventListener(
      "resize",
      debounce(function () {
        if (global.innerWidth > 1024) closeDrawer();
      }, 150)
    );

    TLS.closeDrawer = closeDrawer;
  }

  /* ====================== 10. Footer ====================== */
  function renderFooter() {
    var host = $("#site-footer");
    if (!host) return;

    var half = Math.ceil(D.CATEGORIES.length / 2);
    var colA = D.CATEGORIES.slice(0, half);
    var colB = D.CATEGORIES.slice(half);

    function catList(list) {
      return list
        .map(function (c) {
          return '<li><a href="category.html?cat=' + attr(c.id) + '">' + esc(c.name) + "</a></li>";
        })
        .join("");
    }

    var st = hoursStatus();

    host.className = "site-footer";
    host.innerHTML =
      '<div class="container">' +
      '<div class="footer__grid">' +

      '<div class="footer__about">' +
      '<a class="brand" href="index.html" aria-label="' + attr(S.name) + ' — home">' +
      TLS.art.logoSvg(44) +
      '<span class="brand__text"><span class="brand__name" style="color:#FDFBF8">' + esc(S.name) + "</span>" +
      '<span class="brand__tag">' + esc(S.tagline) + "</span></span></a>" +
      "<p>" + esc(S.description) + "</p>" +
      '<div class="footer__socials">' + socialLinksHTML(true) + "</div>" +
      "</div>" +

      '<div><h2 class="footer__title">Shop</h2><ul class="footer__list">' + catList(colA) + "</ul></div>" +
      '<div><h2 class="footer__title">More</h2><ul class="footer__list">' + catList(colB) +
      '<li><a href="categories.html">All categories</a></li></ul></div>' +

      '<div><h2 class="footer__title">Visit &amp; contact</h2>' +
      '<div class="footer__contact">' +
      '<p class="footer__contact-item">' + icon("pin") + "<span>" + esc(S.address.full) + "</span></p>" +
      '<a class="footer__contact-item" href="tel:' + attr(S.phone) + '">' + icon("phone") + "<span>" + esc(S.phoneDisplay) + "</span></a>" +
      '<a class="footer__contact-item" href="mailto:' + attr(S.email) + '">' + icon("mail") + "<span>" + esc(S.email) + "</span></a>" +
      '<p class="footer__contact-item">' + icon("clock") +
      '<span><span class="status-dot ' + (st.open ? "status-dot--open" : "status-dot--closed") + '">' + esc(st.label) + "</span></span></p>" +
      "</div>" +
      '<a class="btn btn--gold btn--sm" style="margin-top:1.25rem" href="' + attr(S.mapsDirections) + '" target="_blank" rel="noopener noreferrer">' +
      icon("navigation", "btn__icon") + "Get directions</a>" +
      "</div>" +

      "</div>" +
      '<div class="footer__bottom">' +
      "<p>&copy; <span id=\"tlsYear\"></span> " + esc(S.name) + ". All rights reserved.</p>" +
      '<nav class="footer__legal" aria-label="Legal">' +
      '<a href="index.html">Home</a>' +
      '<a href="categories.html">Categories</a>' +
      '<a href="contact.html">Contact Us</a>' +
      '<a href="contact.html#store-policies">Store policies</a>' +
      "</nav>" +
      "</div></div>";

    var y = $("#tlsYear", host);
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ====================== 11. Floating actions ====================== */
  function mountFloatingActions() {
    if ($(".to-top")) return;

    var top = doc.createElement("button");
    top.type = "button";
    top.className = "to-top";
    top.setAttribute("aria-label", "Back to top");
    top.innerHTML = icon("arrowUp");
    top.addEventListener("click", function () {
      global.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
    doc.body.appendChild(top);

    var wa = doc.createElement("a");
    wa.className = "wa-fab";
    wa.href = waLink("Hello " + S.name + "! I have a question about a product.");
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    wa.setAttribute("aria-label", "Chat with us on WhatsApp");
    wa.innerHTML = icon("whatsapp") + '<span class="wa-fab__label">WhatsApp us</span>';
    doc.body.appendChild(wa);

    var onScroll = function () {
      top.classList.toggle("is-visible", (global.scrollY || global.pageYOffset) > 600);
    };
    onScroll();
    global.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ====================== 12. Reveal on scroll ====================== */
  function initReveal(root) {
    var nodes = $$(".reveal:not(.is-visible)", root || doc);
    if (!nodes.length) return;
    if (!("IntersectionObserver" in global) || prefersReducedMotion()) {
      nodes.forEach(function (n) {
        n.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  /* ====================== 13. Breadcrumbs ====================== */
  function breadcrumbHTML(trail) {
    var sep = icon("chevronRight");
    return (
      '<nav class="crumbs" aria-label="Breadcrumb"><ol style="display:contents;list-style:none;margin:0;padding:0">' +
      trail
        .map(function (item, i) {
          var last = i === trail.length - 1;
          var inner = last
            ? '<span aria-current="page">' + esc(item.label) + "</span>"
            : '<a href="' + attr(item.href) + '">' + (i === 0 ? icon("home") : "") + esc(item.label) + "</a>";
          return '<li style="display:inline-flex;align-items:center;gap:.6rem">' + inner + (last ? "" : sep) + "</li>";
        })
        .join("") +
      "</ol></nav>"
    );
  }

  /* ====================== 14. Structured data (SEO) ====================== */
  var DAY_URI = {
    Monday: "https://schema.org/Monday",
    Tuesday: "https://schema.org/Tuesday",
    Wednesday: "https://schema.org/Wednesday",
    Thursday: "https://schema.org/Thursday",
    Friday: "https://schema.org/Friday",
    Saturday: "https://schema.org/Saturday",
    Sunday: "https://schema.org/Sunday"
  };

  function injectSchema() {
    if (doc.getElementById("tlsSchema")) return;
    var data = {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      name: S.name,
      description: S.description,
      url: S.url,
      telephone: S.phone,
      email: S.email,
      priceRange: "$$",
      currenciesAccepted: S.currency,
      foundingDate: String(S.established),
      address: {
        "@type": "PostalAddress",
        streetAddress: [S.address.line1, S.address.line2].filter(Boolean).join(", "),
        addressLocality: S.address.city,
        addressRegion: S.address.state,
        postalCode: S.address.postalCode,
        addressCountry: S.address.countryCode
      },
      geo: { "@type": "GeoCoordinates", latitude: S.geo.lat, longitude: S.geo.lng },
      openingHoursSpecification: S.hours
        .filter(function (h) {
          return h.open;
        })
        .map(function (h) {
          return {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAY_URI[h.day] || h.day,
            opens: h.open,
            closes: h.close
          };
        }),
      sameAs: [S.social.instagram, S.social.facebook, S.social.telegram, S.social.whatsapp].filter(Boolean),
      department: D.CATEGORIES.map(function (c) {
        return { "@type": "ClothingStore", name: c.name, url: S.url + "/category.html?cat=" + c.id };
      })
    };

    var s = doc.createElement("script");
    s.type = "application/ld+json";
    s.id = "tlsSchema";
    s.textContent = JSON.stringify(data);
    doc.head.appendChild(s);
  }

  /* ====================== 15. Boot ====================== */
  function boot() {
    doc.documentElement.classList.remove("no-js");
    renderHeader();
    renderFooter();
    mountFloatingActions();
    bindCards(doc);
    injectSchema();
    initReveal();
  }

  /* ====================== Exports ====================== */
  TLS.$ = $;
  TLS.$$ = $$;
  TLS.esc = esc;
  TLS.attr = attr;
  TLS.money = money;
  TLS.waLink = waLink;
  TLS.param = param;
  TLS.debounce = debounce;
  TLS.prefersReducedMotion = prefersReducedMotion;
  TLS.lockScroll = lockScroll;
  TLS.unlockScroll = unlockScroll;
  TLS.createTrap = createTrap;
  TLS.toast = toast;
  TLS.hoursStatus = hoursStatus;
  TLS.fmtTime = fmtTime;
  TLS.productCardHTML = productCardHTML;
  TLS.categoryTileHTML = categoryTileHTML;
  TLS.swatchesHTML = swatchesHTML;
  TLS.bindCards = bindCards;
  TLS.initReveal = initReveal;
  TLS.breadcrumbHTML = breadcrumbHTML;
  TLS.socialLinksHTML = socialLinksHTML;
  TLS.boot = boot;

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window, document);
