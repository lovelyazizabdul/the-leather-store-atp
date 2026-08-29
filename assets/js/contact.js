/* ==========================================================================
   The Leather Store — contact.js
   Contact page: info cards, OpenStreetMap/Leaflet map with a pinned location,
   opening hours, owner bio and an enquiry form that hands off to WhatsApp.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  var TLS = global.TLS;
  var S = TLS.SITE;
  var icon = TLS.icon;
  var esc = TLS.esc;
  var attr = TLS.attr;

  /* ====================== Page head ====================== */
  function renderHead() {
    var host = TLS.$("#pageHead");
    if (!host) return;
    var st = TLS.hoursStatus();
    host.innerHTML =
      '<div class="container">' +
      TLS.breadcrumbHTML([{ label: "Home", href: "index.html" }, { label: "Contact Us" }]) +
      '<div class="page-head__inner" style="margin-top:1.1rem">' +
      '<div class="page-head__text">' +
      '<span class="eyebrow">We are a real shop, with real people</span>' +
      '<h1 class="page-head__title">Come and say hello</h1>' +
      '<p class="lede">Find us on ' + esc(S.address.line2) + ", " + esc(S.address.city) +
      ". Call ahead, message us on WhatsApp, or simply walk in — someone will always be at the counter.</p>" +
      '<p><span class="status-dot ' + (st.open ? "status-dot--open" : "status-dot--closed") + '">' + esc(st.label) + "</span></p>" +
      "</div>" +
      '<a class="btn btn--wa" href="' + attr(TLS.waLink("Hello " + S.name + "! I would like to visit the store.")) + '" target="_blank" rel="noopener noreferrer">' +
      icon("whatsapp", "btn__icon") + "Message us</a>" +
      "</div></div>";
  }

  /* ====================== Info cards ====================== */
  function renderInfo() {
    var host = TLS.$("#infoCards");
    if (!host) return;
    var st = TLS.hoursStatus();

    var cards = [
      {
        i: "pin",
        label: "Visit the store",
        value: S.address.full,
        href: S.mapsDirections,
        external: true,
        cta: "Get directions"
      },
      { i: "phone", label: "Call us", value: S.phoneDisplay, href: "tel:" + S.phone, cta: "Tap to call" },
      { i: "mail", label: "Email us", value: S.email, href: "mailto:" + S.email, cta: "We reply within a day" },
      { i: "clock", label: "Opening hours", value: st.label, href: "#hours", cta: "See full week" }
    ];

    host.innerHTML = cards
      .map(function (c, n) {
        var inner =
          '<span class="info-card__icon">' + icon(c.i) + "</span>" +
          '<span class="info-card__label">' + esc(c.label) + "</span>" +
          (c.href
            ? '<a class="info-card__value" href="' + attr(c.href) + '"' +
              (c.external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + esc(c.value) + "</a>"
            : '<span class="info-card__value">' + esc(c.value) + "</span>") +
          '<span class="muted" style="font-size:var(--fs-xs)">' + esc(c.cta) + "</span>";
        return '<article class="info-card reveal" style="--reveal-delay:' + n * 70 + 'ms">' + inner + "</article>";
      })
      .join("");
  }

  /* ====================== Opening hours ====================== */
  function renderHours() {
    var host = TLS.$("#hoursList");
    if (!host) return;
    var st = TLS.hoursStatus();
    host.innerHTML = S.hours
      .map(function (h, i) {
        var when = h.open ? TLS.fmtTime(h.open) + " – " + TLS.fmtTime(h.close) : "Closed";
        return (
          '<div class="hours__row' + (i === st.index ? " is-today" : "") + '">' +
          "<span>" + esc(h.day) + "</span><span>" + esc(when) + "</span></div>"
        );
      })
      .join("");
  }

  /* ====================== Map ====================== */
  function renderMap() {
    var card = TLS.$("#mapCard");
    var node = TLS.$("#map");
    if (!card || !node) return;

    card.querySelector(".map-card__foot").innerHTML =
      '<p class="map-card__addr">' + icon("pin") + " " + esc(S.address.full) + "</p>" +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
      '<button class="btn btn--outline btn--sm" type="button" id="copyAddr">' + icon("copy", "btn__icon") + "Copy address</button>" +
      '<a class="btn btn--sm" href="' + attr(S.mapsDirections) + '" target="_blank" rel="noopener noreferrer">' +
      icon("navigation", "btn__icon") + "Directions</a>" +
      "</div>";

    var copy = TLS.$("#copyAddr");
    if (copy) {
      copy.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(S.address.full).then(
            function () { TLS.toast("Address copied to clipboard", "copy"); },
            function () { TLS.toast("Could not copy — please select the text", "close"); }
          );
        } else {
          global.prompt("Copy the store address:", S.address.full);
        }
      });
    }

    var fallback = TLS.$(".map__fallback", card);
    if (fallback) {
      fallback.innerHTML =
        icon("pin") +
        "<h3>" + esc(S.name) + "</h3>" +
        '<p class="muted">' + esc(S.address.full) + "</p>" +
        '<a class="btn btn--sm" href="' + attr(S.osmLink) + '" target="_blank" rel="noopener noreferrer">Open in OpenStreetMap</a>';
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
        // Prevents the map from swallowing one-finger page scrolling on mobile
        dragging: !global.L.Browser.mobile,
        tap: false
      });

      global.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
      }).addTo(map);

      var pin = global.L.divIcon({
        className: "",
        html: '<span class="pin" role="img" aria-label="' + attr(S.name) + '"></span>',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      global.L
        .marker([S.geo.lat, S.geo.lng], { icon: pin, title: S.name, alt: S.name })
        .addTo(map)
        .bindPopup(
          "<b>" + esc(S.name) + "</b>" +
          esc(S.address.full) +
          '<br><a href="' + attr(S.mapsDirections) + '" target="_blank" rel="noopener noreferrer">Get directions &rarr;</a>'
        )
        .openPopup();

      map.on("click", function () { map.scrollWheelZoom.enable(); });
      map.on("mouseout", function () { map.scrollWheelZoom.disable(); });

      /* Re-measure after layout settles (fonts, images) */
      setTimeout(function () { map.invalidateSize(); }, 250);
      global.addEventListener("resize", TLS.debounce(function () { map.invalidateSize(); }, 200));
    } catch (e) {
      card.classList.add("is-failed");
    }
  }

  /* ====================== Bio ====================== */
  function renderBio() {
    var host = TLS.$("#bio");
    if (!host) return;
    var o = S.owner;
    var photo = o.photo || TLS.art.avatar(o.name, 520);
    var paras = o.bio
      .map(function (t) {
        return "<p>" + esc(t.replace(/\{NAME\}/g, o.name)) + "</p>";
      })
      .join("");

    host.innerHTML =
      '<div class="bio">' +
      '<div class="bio__portrait reveal"><img src="' + attr(photo) + '" alt="' + attr(o.name) + ', ' + attr(o.role) + '" width="520" height="520" loading="lazy" decoding="async"></div>' +
      '<div class="bio__body reveal" style="--reveal-delay:120ms">' +
      '<span class="bio__role">' + esc(o.role) + "</span>" +
      '<h2 class="bio__name">' + esc(o.name) + "</h2>" +
      paras +
      '<p class="bio__sign">— ' + esc(o.signature) + "</p>" +
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
    var ok = true;
    FIELDS.forEach(function (f) { setError(f, ""); });

    if (!values.name || values.name.trim().length < 2) {
      setError("name", "Please tell us your name.");
      ok = false;
    }
    var digits = (values.phone || "").replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setError("phone", "Enter a valid phone number (8–15 digits).");
      ok = false;
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      setError("email", "That email address does not look right.");
      ok = false;
    }
    if (!values.message || values.message.trim().length < 10) {
      setError("message", "Please add a few more details (at least 10 characters).");
      ok = false;
    }
    return ok;
  }

  function renderForm() {
    var host = TLS.$("#enquiryForm");
    if (!host) return;

    host.innerHTML =
      '<div class="form__row">' +
      field("name", "Your name", '<input type="text" id="f-name" name="name" autocomplete="name" placeholder="e.g. Ananya Sharma" required maxlength="80" aria-describedby="e-name">') +
      field("phone", "Phone / WhatsApp", '<input type="tel" id="f-phone" name="phone" autocomplete="tel" inputmode="tel" placeholder="e.g. +91 98765 43210" required maxlength="20" aria-describedby="e-phone">') +
      "</div>" +
      '<div class="form__row">' +
      field("email", "Email (optional)", '<input type="email" id="f-email" name="email" autocomplete="email" inputmode="email" placeholder="you@example.com" maxlength="120" aria-describedby="e-email">') +
      field("topic", "What is it about?",
        '<select id="f-topic" name="topic">' +
        ["General enquiry", "Product availability", "Bulk / corporate gifting", "Repair or warranty", "Custom monogramming"]
          .map(function (t) { return '<option value="' + attr(t) + '">' + esc(t) + "</option>"; })
          .join("") +
        "</select>") +
      "</div>" +
      field("message", "Your message", '<textarea id="f-message" name="message" placeholder="Tell us what you are looking for — size, colour, budget, anything helps." required maxlength="1000" aria-describedby="e-message"></textarea>') +
      '<button class="btn btn--wa btn--lg btn--block" type="submit">' + icon("whatsapp", "btn__icon") + "Send via WhatsApp</button>" +
      '<p class="form__note">This form opens WhatsApp with your message ready to send — nothing is stored on this website. ' +
      'Prefer email? Write to <a href="mailto:' + attr(S.email) + '" style="color:var(--c-brass);font-weight:600">' + esc(S.email) + "</a>.</p>";

    host.setAttribute("novalidate", "novalidate");
    host.addEventListener("submit", onSubmit);

    FIELDS.forEach(function (f) {
      var input = TLS.$("#f-" + f);
      if (input) {
        input.addEventListener("input", function () {
          var wrap = input.closest(".field");
          if (wrap && wrap.classList.contains("has-error")) setError(f, "");
        });
      }
    });
  }

  function field(name, label, control) {
    var id = "f-" + name;
    return (
      '<div class="field" data-field="' + attr(name) + '">' +
      '<label for="' + id + '">' + esc(label) + "</label>" +
      control +
      '<span class="field__error" id="e-' + attr(name) + '" role="alert"></span>' +
      "</div>"
    );
  }

  function onSubmit(e) {
    e.preventDefault();
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
      TLS.toast("Please check the highlighted fields", "close");
      return;
    }

    var text =
      "Hello " + S.name + "!\n\n" +
      "Name: " + v.name + "\n" +
      "Phone: " + v.phone + "\n" +
      (v.email ? "Email: " + v.email + "\n" : "") +
      "Topic: " + v.topic + "\n\n" +
      v.message;

    global.open(TLS.waLink(text), "_blank", "noopener,noreferrer");
    TLS.toast("Opening WhatsApp with your message…", "whatsapp");
  }

  function val(id) {
    var n = doc.getElementById(id);
    return n ? n.value : "";
  }

  /* ====================== Policies ====================== */
  function renderPolicies() {
    var host = TLS.$("#policies");
    if (!host) return;
    var items = [
      { i: "shield", t: "1-year craftsmanship warranty", d: "Covers stitching, hardware, soles and movements. Bring the item and the bill to the counter." },
      { i: "refresh", t: "7-day exchange", d: "Unused, unworn items in original packaging can be exchanged within 7 days. Fragrances must be sealed." },
      { i: "ruler", t: "Free fitting & alteration", d: "Shoe stretching, watch strap sizing and frame adjustment are free for life on anything bought here." },
      { i: "gift", t: "Gift wrapping & monogram", d: "Complimentary on every purchase. Monogramming takes about 20 minutes in store." },
      { i: "truck", t: "Local delivery", d: "Free within " + esc(S.address.city) + " on orders above " + TLS.money(5000) + ". Ask us on WhatsApp." },
      { i: "tag", t: "Transparent pricing", d: "The price on the tag is the price you pay. All taxes included, no hidden charges." }
    ];
    host.innerHTML = items
      .map(function (v, n) {
        return (
          '<article class="value reveal" style="--reveal-delay:' + Math.min(n, 5) * 70 + 'ms">' +
          '<span class="value__icon">' + icon(v.i) + "</span>" +
          '<h3 class="value__title">' + v.t + "</h3>" +
          '<p class="value__text">' + v.d + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  /* ====================== Boot ====================== */
  function init() {
    renderHead();
    renderInfo();
    renderHours();
    renderMap();
    renderBio();
    renderForm();
    renderPolicies();

    var socials = TLS.$("#contactSocials");
    if (socials) socials.innerHTML = TLS.socialLinksHTML(false);

    TLS.initReveal();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
