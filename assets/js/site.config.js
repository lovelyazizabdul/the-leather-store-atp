/* ==========================================================================
   The Leather Store — site.config.js
   ⚠️  THIS IS THE ONLY FILE YOU NEED TO EDIT FOR BUSINESS DETAILS.
   Replace every value marked TODO with your real information.
   ========================================================================== */
(function (global) {
  "use strict";

  global.TLS = global.TLS || {};

  global.TLS.SITE = {
    /* ---- Identity ---- */
    name: "The Leather Store",
    tagline: "Handpicked Leather & Lifestyle",
    shortName: "TLS",
    established: 2009,
    url: "https://www.theleatherstore.example", // TODO: your live domain
    description:
      "The Leather Store is a family-run boutique offering handpicked leather shoes, sandals, sneakers, sunglasses, wrist watches, handbags, wallets, travel bags and fine fragrances.",

    /* ---- Contact ---- */
    phoneDisplay: "+91 98765 43210", // TODO
    phone: "+919876543210", // TODO — E.164, used for tel: links
    whatsapp: "919876543210", // TODO — country code + number, NO plus sign
    email: "hello@theleatherstore.example", // TODO

    /* ---- Location (used for the map pin & schema.org) ---- */
    address: {
      line1: "Shop No. 12, Ground Floor, Heritage Arcade", // TODO
      line2: "Mahatma Gandhi Road", // TODO
      city: "Bengaluru", // TODO
      state: "Karnataka", // TODO
      postalCode: "560001", // TODO
      country: "India", // TODO
      countryCode: "IN"
    },
    geo: { lat: 12.9755, lng: 77.6045, zoom: 16 }, // TODO — exact shop coordinates

    /* ---- Opening hours (24h "HH:MM"; null = closed) ---- */
    hours: [
      { day: "Monday", open: "10:00", close: "20:30" },
      { day: "Tuesday", open: "10:00", close: "20:30" },
      { day: "Wednesday", open: "10:00", close: "20:30" },
      { day: "Thursday", open: "10:00", close: "20:30" },
      { day: "Friday", open: "10:00", close: "21:00" },
      { day: "Saturday", open: "10:00", close: "21:00" },
      { day: "Sunday", open: "11:00", close: "19:00" }
    ],

    /* ---- Social ---- */
    social: {
      instagram: "https://www.instagram.com/", // TODO
      facebook: "https://www.facebook.com/", // TODO
      telegram: "https://t.me/", // TODO
      whatsapp: "" // auto-generated from `whatsapp` above
    },

    /* ---- Owner bio (Contact page) ---- */
    owner: {
      name: "Rajesh Kumar", // TODO
      role: "Founder & Master Curator",
      photo: "", // TODO — e.g. "assets/img/owner.jpg" (leave blank for a monogram)
      bio: [
        "What began in 2009 as a single counter of hand-stitched wallets is today a two-floor destination for people who still believe in things made to last. I am {NAME}, and for over fifteen years I have travelled to tanneries in Chennai, Kanpur and Kolhapur, choosing hides by feel long before I choose them by price.",
        "Every pair of shoes, every handbag and every watch on our shelves has passed through my hands first. If a stitch is loose or a buckle sits wrong, it does not make it to the shop floor. That is the only quality certificate we have ever needed.",
        "Walk in and you will be greeted by name, not by a queue token. Try things on, ask hard questions, take your time. We would rather you leave with nothing than with something that is not right for you."
      ],
      signature: "Rajesh Kumar" // TODO
    },

    /* ---- Commerce behaviour ---- */
    currency: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    /* Catalog-only storefront: enquiries are handed off to WhatsApp. */
    enquiryMode: "whatsapp",

    /* ---- Demo media ----------------------------------------------------
       Product photos/videos are generated on the fly as elegant SVG art so
       the site looks finished before your real assets arrive.
       To use real media, add `images: [...]` / `video: "..."` to a product
       in products.js — see README.md ▸ "Adding your own photos".
    -------------------------------------------------------------------- */
    demoVideo:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",

    announcements: [
      "Free monogramming on every leather purchase",
      "New season arrivals in store now",
      "Genuine leather • 1-year craftsmanship warranty",
      "Visit us 7 days a week"
    ]
  };

  /* Derived values */
  var S = global.TLS.SITE;
  S.address.full = [
    S.address.line1,
    S.address.line2,
    S.address.city + ", " + S.address.state + " " + S.address.postalCode,
    S.address.country
  ]
    .filter(Boolean)
    .join(", ");

  S.social.whatsapp = "https://wa.me/" + S.whatsapp;
  S.mapsDirections =
    "https://www.google.com/maps/dir/?api=1&destination=" + S.geo.lat + "," + S.geo.lng;
  S.osmLink =
    "https://www.openstreetmap.org/?mlat=" + S.geo.lat + "&mlon=" + S.geo.lng + "#map=17/" + S.geo.lat + "/" + S.geo.lng;
})(window);
