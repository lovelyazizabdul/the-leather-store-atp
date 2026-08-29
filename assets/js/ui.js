/* ==========================================================================
   The Leather Store — ui.js
   Shared shell: helpers, header, footer, cards, scroll behaviours, toasts.
   Every string it renders comes from content/site.json.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var S = TLS.SITE; /* filled in place by content.js */
  var D = TLS.DATA; /* filled in place by catalog.js */
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
  var attr = esc;

  /** Escape, then turn {word} into an italic accent. */
  function rich(text, vars) {
    return esc(TLS.tpl(text, vars)).replace(/\{([^{}]+)\}/g, '<em class="hl">$1</em>');
  }

  var nf = null;
  function formatter() {
    if (nf !== null) return nf;
    try {
      nf = new Intl.NumberFormat(S.locale, {
        style: "currency",
        currency: S.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } catch (e) {
      nf = false;
    }
    return nf;
  }

  function money(n) {
    if (typeof n !== "number" || !isFinite(n)) return "";
    var f = formatter();
    if (f) return f.format(n);
    return S.currencySymbol + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function waLink(message, vars) {
    var base = "https://wa.me/" + S.whatsapp;
    if (!message) return base;
    return base + "?text=" + encodeURIComponent(TLS.tpl(message, vars));
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
    var c = S.common || {};
    var d = now || new Date();
    var idx = (d.getDay() + 6) % 7; /* site.json lists Monday first */
    var today = (S.hours || [])[idx] || { shifts: [] };
    var shifts = today.shifts || [];
    var mins = d.getHours() * 60 + d.getMinutes();
    var current = null;
    var next = null;

    for (var i = 0; i < shifts.length; i++) {
      if (mins >= shifts[i].openM && mins < shifts[i].closeM) {
        current = shifts[i];
        break;
      }
      if (!next && mins < shifts[i].openM) next = shifts[i];
    }

    /* Nothing open now and nothing left to open today. */
    if (!current && !next) {
      return { open: false, label: c.closedTodayLabel || "Closed today", today: today, index: idx };
    }

    return {
      open: !!current,
      label: TLS.tpl(current ? c.openNowTemplate : c.closedTemplate, {
        TIME: fmtTime(current ? current.close : next.open)
      }),
      today: today,
      index: idx
    };
  }

  function fmtTime(hhmm) {
    var p = String(hhmm).split(":");
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
    return '<span class="swatches" aria-label="' + attr(colors.join(", ")) + '">' + html + "</span>";
  }

  function productCardHTML(p) {
    var P = S.product || {};
    var img0 = TLS.art.product(p, 0);
    var img1 = TLS.art.product(p, 1);
    var off = TLS.tpl(P.discountBadgeTemplate, { PERCENT: p.discount });
    var flags = "";
    if (!p.inStock) flags += '<span class="badge badge--out">' + esc(P.soldOutBadge) + "</span>";
    else if (p.bestseller) flags += '<span class="badge badge--gold">' + esc(P.bestsellerBadge) + "</span>";
    else if (p.isNew) flags += '<span class="badge">' + esc(P.newBadge) + "</span>";
    if (p.discount >= 20) flags += '<span class="badge badge--sale">' + esc(off) + "</span>";

    return (
      '<article class="p-card" data-product="' + attr(p.id) + '" tabindex="0" role="button" aria-label="' + attr(p.name) + '">' +
      '<div class="p-card__media">' +
      '<img class="p-card__img" src="' + attr(img0) + '" alt="' + attr(p.name) + '" width="800" height="1000" loading="lazy" decoding="async">' +
      '<img class="p-card__img p-card__img--alt" src="' + attr(img1) + '" alt="" aria-hidden="true" width="800" height="1000" loading="lazy" decoding="async">' +
      (flags ? '<div class="p-card__flags">' + flags + "</div>" : "") +
      '<span class="p-card__quick">' + icon("eye") + esc(P.quickViewLabel) + "</span>" +
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
      (p.discount ? '<span class="price--off">' + esc(off) + "</span>" : "") +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

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
    var c = S.common || {};
    var img = cat.imageUrl || TLS.art.category(cat, 900, 700);
    return (
      '<a class="cat-tile" href="category.html?cat=' + attr(cat.id) + '" aria-label="' + attr(cat.name) + '">' +
      '<img class="cat-tile__img" src="' + attr(img) + '" alt="" width="900" height="700" loading="lazy" decoding="async">' +
      '<div class="cat-tile__body">' +
      '<span class="cat-tile__count">' + cat.count + " " + esc(c.productsSuffix) + "</span>" +
      '<h3 class="cat-tile__name">' + esc(cat.name) + "</h3>" +
      '<span class="cat-tile__cta">' + esc(c.shopNowLabel) + " " + icon("arrowRight") + "</span>" +
      "</div></a>"
    );
  }

  /* ====================== 8. Header ====================== */
  function socialLinksHTML(light) {
    var cls = light ? " social--light" : "";
    return [
      ["instagram", "Instagram", S.social.instagram],
      ["facebook", "Facebook", S.social.facebook],
      ["telegram", "Telegram", S.social.telegram],
      ["whatsapp", "WhatsApp", S.social.whatsapp]
    ]
      .filter(function (i) {
        return !!i[2];
      })
      .map(function (i) {
        return (
          '<a class="social social--' + i[0] + cls + '" href="' + attr(i[2]) +
          '" target="_blank" rel="noopener noreferrer" aria-label="' + i[1] + '">' + icon(i[0]) + "</a>"
        );
      })
      .join("");
  }

  function renderHeader() {
    var host = $("#site-header");
    if (!host) return;
    var H = S.header || {};
    var page = doc.body.getAttribute("data-page") || "";
    var activeCat = doc.body.getAttribute("data-cat") || "";

    var annItems = (S.announcements || [])
      .map(function (a) {
        return '<span class="announce__item">' + icon(a.icon || "sparkle") + esc(TLS.tpl(a.text)) + "</span>";
      })
      .join("");

    var megaLinks = D.CATEGORIES.map(function (c) {
      var thumb = c.imageUrl || TLS.art.category(c, 160, 160);
      return (
        '<a class="mega__link" href="category.html?cat=' + attr(c.id) + '">' +
        '<img class="mega__thumb" src="' + attr(thumb) + '" alt="" width="160" height="160" loading="lazy" decoding="async">' +
        "<span>" +
        '<span class="mega__name">' + esc(c.name) + "</span>" +
        '<span class="mega__count">' + esc(c.tagline) + "</span>" +
        "</span></a>"
      );
    }).join("");

    host.className = "site-header";
    host.innerHTML =
      (annItems ? '<div class="announce" aria-hidden="true"><div class="announce__track">' + annItems + annItems + "</div></div>" : "") +
      '<div class="container">' +
      '<nav class="navbar" aria-label="Primary">' +
      '<a class="brand" href="index.html" aria-label="' + attr(S.name) + '">' +
      TLS.art.logoSvg(140) +
      '<span class="sr-only">' + esc(S.name) + "</span></a>" +

      '<ul class="nav">' +
      '<li class="nav__item"><a class="nav__link" href="index.html"' + (page === "home" ? ' aria-current="page"' : "") + ">" + esc(H.homeLabel) + "</a></li>" +
      '<li class="nav__item">' +
      '<button class="nav__link" type="button" id="megaBtn" aria-expanded="false" aria-controls="megaMenu"' +
      (page === "categories" || page === "category" ? ' aria-current="page"' : "") + ">" +
      esc(H.categoriesLabel) + icon("chevronDown", "nav__caret") + "</button>" +
      '<div class="mega" id="megaMenu" role="menu" aria-labelledby="megaBtn">' +
      '<div class="mega__grid">' + megaLinks + "</div>" +
      '<div class="mega__foot">' +
      '<p class="muted" style="font-size:var(--fs-sm);margin:0">' + esc(TLS.tpl(H.megaNoteTemplate)) + "</p>" +
      '<a class="link-arrow" href="categories.html">' + esc(H.megaLinkLabel) + " " + icon("arrowRight") + "</a>" +
      "</div></div></li>" +
      '<li class="nav__item"><a class="nav__link" href="contact.html"' + (page === "contact" ? ' aria-current="page"' : "") + ">" + esc(H.contactLabel) + "</a></li>" +
      "</ul>" +

      '<div class="nav-actions">' +
      '<a class="btn btn--outline btn--sm" href="' + attr(waLink(H.ctaMessage)) + '" target="_blank" rel="noopener noreferrer">' +
      icon("whatsapp", "btn__icon") + esc(H.ctaLabel) + "</a>" +
      '<button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="mobileDrawer" aria-label="Open menu">' +
      "<span></span><span></span><span></span></button>" +
      "</div>" +
      "</nav></div>";

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
    var H = S.header || {};
    var F = S.floating || {};

    var overlay = doc.createElement("div");
    overlay.className = "overlay";
    overlay.id = "navOverlay";
    doc.body.appendChild(overlay);

    var drawer = doc.createElement("aside");
    drawer.className = "drawer";
    drawer.id = "mobileDrawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", H.menuLabel || "Menu");
    drawer.setAttribute("tabindex", "-1");

    var catLinks = D.CATEGORIES.map(function (c) {
      return (
        '<a class="m-acc__link" href="category.html?cat=' + attr(c.id) + '"' +
        (activeCat === c.id ? ' aria-current="page"' : "") + ">" +
        esc(c.name) + '<span class="opt__n" style="margin-left:auto">' + c.count + "</span></a>"
      );
    }).join("");

    var catsOpen = page === "category" || page === "categories";

    drawer.innerHTML =
      '<div class="drawer__head">' +
      '<span class="drawer__title">' + esc(H.menuLabel) + "</span>" +
      '<button class="icon-btn" type="button" id="drawerClose" aria-label="Close menu">' + icon("close") + "</button>" +
      "</div>" +
      '<div class="drawer__body">' +
      '<nav class="m-nav" aria-label="Mobile">' +
      '<a class="m-nav__link" href="index.html"' + (page === "home" ? ' aria-current="page"' : "") + ">" + esc(H.homeLabel) + icon("arrowRight") + "</a>" +
      '<button class="m-acc__btn" type="button" aria-expanded="' + (catsOpen ? "true" : "false") + '" aria-controls="mAccPanel">' +
      esc(H.categoriesLabel) + icon("chevronDown") + "</button>" +
      '<div class="m-acc__panel' + (catsOpen ? " is-open" : "") + '" id="mAccPanel">' + catLinks +
      '<a class="m-acc__link" href="categories.html"><strong>' + esc(H.viewAllLabel) + "</strong></a>" +
      "</div>" +
      '<a class="m-nav__link" href="contact.html"' + (page === "contact" ? ' aria-current="page"' : "") + ">" + esc(H.contactLabel) + icon("arrowRight") + "</a>" +
      "</nav>" +
      '<div class="drawer__socials">' + socialLinksHTML(false) + "</div>" +
      "</div>" +
      '<div class="drawer__foot">' +
      '<a class="btn btn--wa btn--block" href="' + attr(S.social.whatsapp) + '" target="_blank" rel="noopener noreferrer">' +
      icon("whatsapp", "btn__icon") + esc(F.chatLabel) + "</a>" +
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
    var F = S.footer || {};
    var half = Math.ceil(D.CATEGORIES.length / 2);

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
      '<a class="brand" href="index.html" aria-label="' + attr(S.name) + '">' +
      TLS.art.logoSvg(150) +
      '<span class="sr-only">' + esc(S.name) + "</span></a>" +
      "<p>" + esc(S.description) + "</p>" +
      '<div class="footer__socials">' + socialLinksHTML(true) + "</div>" +
      "</div>" +

      '<div><h2 class="footer__title">' + esc(F.shopHeading) + '</h2><ul class="footer__list">' +
      catList(D.CATEGORIES.slice(0, half)) + "</ul></div>" +

      '<div><h2 class="footer__title">' + esc(F.moreHeading) + '</h2><ul class="footer__list">' +
      catList(D.CATEGORIES.slice(half)) +
      '<li><a href="categories.html">' + esc(F.allCategoriesLabel) + "</a></li></ul></div>" +

      '<div><h2 class="footer__title">' + esc(F.contactHeading) + "</h2>" +
      '<div class="footer__contact">' +
      '<p class="footer__contact-item">' + icon("pin") + "<span>" + esc(S.address.full) + "</span></p>" +
      '<a class="footer__contact-item" href="tel:' + attr(S.phone) + '">' + icon("phone") + "<span>" + esc(S.phoneDisplay) + "</span></a>" +
      '<a class="footer__contact-item" href="mailto:' + attr(S.email) + '">' + icon("mail") + "<span>" + esc(S.email) + "</span></a>" +
      '<p class="footer__contact-item">' + icon("clock") +
      '<span><span class="status-dot ' + (st.open ? "status-dot--open" : "status-dot--closed") + '">' + esc(st.label) + "</span></span></p>" +
      "</div>" +
      '<a class="btn btn--gold btn--sm" style="margin-top:1.25rem" href="' + attr(S.mapsDirections) + '" target="_blank" rel="noopener noreferrer">' +
      icon("navigation", "btn__icon") + esc(F.directionsLabel) + "</a>" +
      "</div>" +

      "</div>" +
      '<div class="footer__bottom">' +
      "<p>" + esc(TLS.tpl(F.copyrightTemplate)) + "</p>" +
      '<nav class="footer__legal" aria-label="Legal">' +
      (F.legalLinks || [])
        .map(function (l) {
          return '<a href="' + attr(l.href) + '">' + esc(l.label) + "</a>";
        })
        .join("") +
      "</nav></div></div>";
  }

  /* ====================== 11. Floating actions ====================== */
  function mountFloatingActions() {
    if ($(".to-top")) return;
    var F = S.floating || {};

    var top = doc.createElement("button");
    top.type = "button";
    top.className = "to-top";
    top.setAttribute("aria-label", F.backToTopLabel || "Back to top");
    top.innerHTML = icon("arrowUp");
    top.addEventListener("click", function () {
      global.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    });
    doc.body.appendChild(top);

    var wa = doc.createElement("a");
    wa.className = "wa-fab";
    wa.href = waLink(F.whatsappMessage);
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    wa.setAttribute("aria-label", F.whatsappLabel || "WhatsApp");
    wa.innerHTML = icon("whatsapp") + '<span class="wa-fab__label">' + esc(F.whatsappLabel) + "</span>";
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
      openingHoursSpecification: (S.hours || []).reduce(function (acc, h) {
        (h.shifts || []).forEach(function (s) {
          acc.push({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAY_URI[h.day] || h.day,
            opens: s.open,
            closes: s.close
          });
        });
        return acc;
      }, []),
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

  /* ====================== 15. Shell boot ====================== */
  function bootShell() {
    doc.documentElement.classList.remove("no-js");
    var skip = $(".skip-link");
    if (skip && S.common && S.common.skipLink) skip.textContent = S.common.skipLink;
    renderHeader();
    renderFooter();
    mountFloatingActions();
    bindCards(doc);
    injectSchema();
  }

  /* ====================== Exports ====================== */
  TLS.$ = $;
  TLS.$$ = $$;
  TLS.esc = esc;
  TLS.attr = attr;
  TLS.rich = rich;
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
  TLS.bootShell = bootShell;
})(window, document);
