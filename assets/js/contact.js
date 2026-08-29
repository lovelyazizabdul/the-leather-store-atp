/* ==========================================================================
   The Leather Store — contact.js
   Contact page: info cards, Leaflet/OpenStreetMap map, opening hours,
   owner bio, enquiry form and store policies.
   Wording from content/contact.json, data from content/site.json.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});
  var S = TLS.SITE;
  var PAGE = {};

  /* ====================== Page head ====================== */
  function renderHead() {
    var host = TLS.$("#pageHead");
    if (!host) return;
    var head = PAGE.head || {};
    var crumb = PAGE.breadcrumb || {};
    var st = TLS.hoursStatus();

    host.innerHTML =
      '<div class="container">' +
      TLS.breadcrumbHTML([
        { label: crumb.home || "Home", href: "index.html" },
        { label: crumb.current || "Contact Us" }
      ]) +
      '<div class="page-head__inner" style="margin-top:1.1rem">' +
      '<div class="page-head__text">' +
      '<span class="eyebrow">' + TLS.esc(TLS.tpl(head.eyebrow)) + "</span>" +
      '<h1 class="page-head__title">' + TLS.rich(head.title) + "</h1>" +
      '<p class="lede">' + TLS.esc(TLS.tpl(head.text)) + "</p>" +
      '<p><span class="status-dot ' + (st.open ? "status-dot--open" : "status-dot--closed") + '">' + TLS.esc(st.label) + "</span></p>" +
      "</div>" +
      (head.cta
        ? '<a class="btn btn--wa" href="' + TLS.attr(TLS.waLink(head.cta.whatsappMessage)) + '" target="_blank" rel="noopener noreferrer">' +
          TLS.icon("whatsapp", "btn__icon") + TLS.esc(head.cta.label) + "</a>"
        : "") +
      "</div></div>";
  }

  /* ====================== Info cards ====================== */
  function renderInfo() {
    var host = TLS.$("#infoCards");
    if (!host) return;
    var st = TLS.hoursStatus();

    var resolve = {
      address: { value: S.address.full, href: S.mapsDirections, external: true },
      phone: { value: S.phoneDisplay, href: "tel:" + S.phone },
      email: { value: S.email, href: "mailto:" + S.email },
      hours: { value: st.label, href: "#hours" }
    };

    host.innerHTML = (PAGE.infoCards || [])
      .map(function (c, n) {
        var r = resolve[c.type] || { value: "", href: null };
        return (
          '<article class="info-card reveal" style="--reveal-delay:' + n * 70 + 'ms">' +
          '<span class="info-card__icon">' + TLS.icon(c.icon) + "</span>" +
          '<span class="info-card__label">' + TLS.esc(c.label) + "</span>" +
          (r.href
            ? '<a class="info-card__value" href="' + TLS.attr(r.href) + '"' +
              (r.external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + TLS.esc(r.value) + "</a>"
            : '<span class="info-card__value">' + TLS.esc(r.value) + "</span>") +
          '<span class="muted" style="font-size:var(--fs-xs)">' + TLS.esc(c.cta) + "</span>" +
          "</article>"
        );
      })
      .join("");
  }

  /* ====================== Opening hours ====================== */
  function renderHours() {
    var host = TLS.$("#hoursList");
    var title = TLS.$("#hoursTitle");
    var cfg = PAGE.hours || {};
    if (title) title.textContent = cfg.title || "Opening hours";
    if (!host) return;

    var st = TLS.hoursStatus();
    host.innerHTML = (S.hours || [])
      .map(function (h, i) {
        var shifts = h.shifts || [];
        var when = shifts.length
          ? shifts
              .map(function (s) {
                return TLS.esc(TLS.fmtTime(s.open) + " – " + TLS.fmtTime(s.close));
              })
              .join("<br>")
          : TLS.esc(S.common.closedTodayLabel || "Closed");
        return (
          '<div class="hours__row' + (i === st.index ? " is-today" : "") + '">' +
          "<span>" + TLS.esc(h.day) + (i === st.index && cfg.todaySuffix ? ' <span class="hours__today">• ' + TLS.esc(cfg.todaySuffix) + "</span>" : "") +
          '</span><span class="hours__time">' + when + "</span></div>"
        );
      })
      .join("");
  }

  /* ====================== Map ====================== */
  function renderMap() {
    var card = TLS.$("#mapCard");
    var node = TLS.$("#map");
    var cfg = PAGE.map || {};
    if (!card || !node) return;

    node.setAttribute("aria-label", cfg.ariaLabel || "Map");

    card.querySelector(".map-card__foot").innerHTML =
      '<p class="map-card__addr">' + TLS.icon("pin") + " " + TLS.esc(S.address.full) + "</p>" +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
      '<button class="btn btn--outline btn--sm" type="button" id="copyAddr">' + TLS.icon("copy", "btn__icon") + TLS.esc(cfg.copyLabel) + "</button>" +
      '<a class="btn btn--sm" href="' + TLS.attr(S.mapsDirections) + '" target="_blank" rel="noopener noreferrer">' +
      TLS.icon("navigation", "btn__icon") + TLS.esc(cfg.directionsLabel) + "</a>" +
      "</div>";

    var copy = TLS.$("#copyAddr");
    if (copy) {
      copy.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(S.address.full).then(
            function () {
              TLS.toast(S.common.toastAddressCopied, "copy");
            },
            function () {
              TLS.toast(S.common.toastCopyFailed, "close");
            }
          );
        } else {
          global.prompt(S.common.toastAddressCopied, S.address.full);
        }
      });
    }

    var fallback = TLS.$(".map__fallback", card);
    if (fallback) {
      fallback.innerHTML =
        TLS.icon("pin") +
        "<h3>" + TLS.esc(S.name) + "</h3>" +
        '<p class="muted">' + TLS.esc(S.address.full) + "</p>" +
        '<a class="btn btn--sm" href="' + TLS.attr(S.osmLink) + '" target="_blank" rel="noopener noreferrer">' +
        TLS.esc(cfg.fallbackCtaLabel) + "</a>";
    }

    if (typeof global.L === "undefined") {
      card.classList.add("is-failed");
      return;
    }

    try {
      var map = global.L.map(node, {
        center: [S.geo.lat, S.geo.lng],
        zoom: S.geo.zoom,
        scrollWheelZoom: false,
        /* one-finger drag should scroll the page, not pan the map */
        dragging: !global.L.Browser.mobile,
        tap: false
      });

      global.L.tileLayer(S.geo.tileUrl, {
        maxZoom: S.geo.maxZoom || 19,
        attribution: S.geo.tileAttribution || ""
      }).addTo(map);

      var pin = global.L.divIcon({
        className: "",
        html: '<span class="pin" role="img" aria-label="' + TLS.attr(S.name) + '"></span>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      global.L.marker([S.geo.lat, S.geo.lng], { icon: pin, title: S.name, alt: S.name })
        .addTo(map)
        .bindPopup(
          "<b>" + TLS.esc(S.name) + "</b>" +
          TLS.esc(S.address.full) +
          '<br><a href="' + TLS.attr(S.mapsDirections) + '" target="_blank" rel="noopener noreferrer">' +
          TLS.esc(cfg.popupDirectionsLabel) + "</a>"
        )
        .openPopup();

      map.on("click", function () {
        map.scrollWheelZoom.enable();
      });
      map.on("mouseout", function () {
        map.scrollWheelZoom.disable();
      });

      setTimeout(function () {
        map.invalidateSize();
      }, 250);
      global.addEventListener(
        "resize",
        TLS.debounce(function () {
          map.invalidateSize();
        }, 200)
      );
    } catch (e) {
      card.classList.add("is-failed");
    }
  }

  /* ====================== Bio ====================== */
  function renderBio() {
    var host = TLS.$("#bio");
    var head = TLS.$("#bioHead");
    var cfg = PAGE.bio || {};
    var o = S.owner || {};

    if (head) {
      head.innerHTML =
        '<div class="section-head__text">' +
        '<span class="eyebrow eyebrow--center">' + TLS.esc(cfg.eyebrow) + "</span>" +
        '<h2 class="h-section">' + TLS.rich(cfg.title) + "</h2></div>";
    }
    if (!host) return;

    var photo = TLS.media(o.photo, "general") || TLS.art.avatar(o.name, 520);
    var paras = (o.bio || [])
      .map(function (t) {
        return "<p>" + TLS.esc(TLS.tpl(t, { NAME: o.name })) + "</p>";
      })
      .join("");

    host.innerHTML =
      '<div class="bio">' +
      '<div class="bio__portrait reveal"><img src="' + TLS.attr(photo) + '" alt="' + TLS.attr(o.name + ", " + o.role) +
      '" width="520" height="520" loading="lazy" decoding="async"></div>' +
      '<div class="bio__body reveal" style="--reveal-delay:120ms">' +
      '<span class="bio__role">' + TLS.esc(o.role) + "</span>" +
      '<h2 class="bio__name">' + TLS.esc(o.name) + "</h2>" +
      paras +
      (o.signature ? '<p class="bio__sign">— ' + TLS.esc(o.signature) + "</p>" : "") +
      '<div style="display:flex;gap:.6rem;flex-wrap:wrap">' + TLS.socialLinksHTML(false) + "</div>" +
      "</div></div>";
  }

  /* ====================== Enquiry form ====================== */
  var FIELDS = ["name", "phone", "email", "message"];

  function setError(name, msg) {
    var field = TLS.$('[data-field="' + name + '"]');
    if (!field) return;
    field.classList.toggle("has-error", !!msg);
    var err = TLS.$(".field__error", field);
    if (err) err.textContent = msg || "";
    var input = TLS.$("input, textarea", field);
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate(values) {
    var f = (PAGE.form && PAGE.form.fields) || {};
    var ok = true;
    FIELDS.forEach(function (n) {
      setError(n, "");
    });

    if (!values.name || values.name.trim().length < 2) {
      setError("name", f.name && f.name.error);
      ok = false;
    }
    var digits = (values.phone || "").replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setError("phone", f.phone && f.phone.error);
      ok = false;
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      setError("email", f.email && f.email.error);
      ok = false;
    }
    if (!values.message || values.message.trim().length < 10) {
      setError("message", f.message && f.message.error);
      ok = false;
    }
    return ok;
  }

  function field(name, label, control) {
    return (
      '<div class="field" data-field="' + TLS.attr(name) + '">' +
      '<label for="f-' + TLS.attr(name) + '">' + TLS.esc(label) + "</label>" +
      control +
      '<span class="field__error" id="e-' + TLS.attr(name) + '" role="alert"></span>' +
      "</div>"
    );
  }

  function renderForm() {
    var intro = TLS.$("#formIntro");
    var host = TLS.$("#enquiryForm");
    var cfg = PAGE.form || {};
    var f = cfg.fields || {};

    if (intro) {
      intro.innerHTML =
        '<span class="eyebrow">' + TLS.esc(cfg.eyebrow) + "</span>" +
        '<h2 class="h-section">' + TLS.rich(cfg.title) + "</h2>" +
        '<p class="lede">' + TLS.esc(TLS.tpl(cfg.text)) + "</p>" +
        '<p class="muted" style="font-size:var(--fs-sm)">' + TLS.esc(cfg.privacyNote) + "</p>" +
        '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.5rem">' + TLS.socialLinksHTML(false) + "</div>";
    }

    if (!host) return;

    host.innerHTML =
      '<div class="form__row">' +
      field("name", f.name.label, '<input type="text" id="f-name" name="name" autocomplete="name" placeholder="' + TLS.attr(f.name.placeholder) + '" required maxlength="80" aria-describedby="e-name">') +
      field("phone", f.phone.label, '<input type="tel" id="f-phone" name="phone" autocomplete="tel" inputmode="tel" placeholder="' + TLS.attr(f.phone.placeholder) + '" required maxlength="20" aria-describedby="e-phone">') +
      "</div>" +
      '<div class="form__row">' +
      field("email", f.email.label, '<input type="email" id="f-email" name="email" autocomplete="email" inputmode="email" placeholder="' + TLS.attr(f.email.placeholder) + '" maxlength="120" aria-describedby="e-email">') +
      field(
        "topic",
        f.topic.label,
        '<select id="f-topic" name="topic">' +
          (cfg.topics || [])
            .map(function (t) {
              return '<option value="' + TLS.attr(t) + '">' + TLS.esc(t) + "</option>";
            })
            .join("") +
          "</select>"
      ) +
      "</div>" +
      field("message", f.message.label, '<textarea id="f-message" name="message" placeholder="' + TLS.attr(f.message.placeholder) + '" required maxlength="1000" aria-describedby="e-message"></textarea>') +
      '<button class="btn btn--wa btn--lg btn--block" type="submit">' + TLS.icon("whatsapp", "btn__icon") + TLS.esc(cfg.submitLabel) + "</button>" +
      '<p class="form__note">' + TLS.esc(cfg.footnote) +
      ' <a href="mailto:' + TLS.attr(S.email) + '" style="color:var(--c-brass);font-weight:600">' + TLS.esc(S.email) + "</a>.</p>";

    host.setAttribute("novalidate", "novalidate");
    host.addEventListener("submit", onSubmit);

    FIELDS.forEach(function (n) {
      var input = TLS.$("#f-" + n);
      if (!input) return;
      input.addEventListener("input", function () {
        var wrap = input.closest(".field");
        if (wrap && wrap.classList.contains("has-error")) setError(n, "");
      });
    });
  }

  function val(id) {
    var n = doc.getElementById(id);
    return n ? n.value : "";
  }

  function onSubmit(e) {
    e.preventDefault();
    var cfg = PAGE.form || {};
    var v = {
      name: val("f-name"),
      phone: val("f-phone"),
      email: val("f-email"),
      topic: val("f-topic"),
      message: val("f-message")
    };

    if (!validate(v)) {
      var firstErr = TLS.$(".field.has-error input, .field.has-error textarea");
      if (firstErr) firstErr.focus();
      TLS.toast(cfg.toastInvalid, "close");
      return;
    }

    var url = TLS.waLink(cfg.whatsappMessage, {
      NAME: v.name,
      PHONE: v.phone,
      EMAIL_LINE: v.email ? "Email: " + v.email + "\n" : "",
      TOPIC: v.topic,
      MESSAGE: v.message
    });

    global.open(url, "_blank", "noopener,noreferrer");
    TLS.toast(cfg.toastSending, "whatsapp");
  }

  /* ====================== Policies ====================== */
  function renderPolicies() {
    var cfg = PAGE.policies || {};
    var section = TLS.$("#policiesSection");
    var head = TLS.$("#policiesHead");
    var host = TLS.$("#policies");

    if (section && cfg.anchorId) section.id = cfg.anchorId;
    if (head) {
      head.innerHTML =
        '<div class="section-head__text">' +
        '<span class="eyebrow eyebrow--center">' + TLS.esc(cfg.eyebrow) + "</span>" +
        '<h2 class="h-section">' + TLS.rich(cfg.title) + "</h2></div>";
    }
    if (!host) return;

    host.innerHTML = (cfg.items || [])
      .map(function (v, n) {
        return (
          '<article class="value reveal" style="--reveal-delay:' + Math.min(n, 5) * 70 + 'ms">' +
          '<span class="value__icon">' + TLS.icon(v.icon) + "</span>" +
          '<h3 class="value__title">' + TLS.esc(TLS.tpl(v.title)) + "</h3>" +
          '<p class="value__text">' + TLS.esc(TLS.tpl(v.text)) + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  /* ====================== Boot ====================== */
  TLS.start("contact", function (page) {
    PAGE = page;
    renderHead();
    renderInfo();
    renderHours();
    renderMap();
    renderBio();
    renderForm();
    renderPolicies();
  });
})(window, document);
