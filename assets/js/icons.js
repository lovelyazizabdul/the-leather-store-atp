/* ==========================================================================
   The Leather Store — icons.js
   Lightweight inline SVG icon set (no icon-font, no external requests).
   Usage: TLS.icon("phone", "btn__icon")
   ========================================================================== */
(function (global) {
  "use strict";

  var TLS = (global.TLS = global.TLS || {});

  var STROKE = {
    chevronDown: '<path d="M6 9l6 6 6-6"/>',
    chevronUp: '<path d="M18 15l-6-6-6 6"/>',
    chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
    chevronRight: '<path d="M9 18l6-6-6-6"/>',
    arrowRight: '<path d="M4 12h15M13 5.5l6.5 6.5-6.5 6.5"/>',
    arrowLeft: '<path d="M20 12H5M11 5.5L4.5 12 11 18.5"/>',
    arrowUp: '<path d="M12 19.5V5M5.5 11.5L12 5l6.5 6.5"/>',
    close: '<path d="M18.5 5.5l-13 13M5.5 5.5l13 13"/>',
    check: '<path d="M20 6.5L9.2 17.3 4 12.1"/>',
    phone:
      '<path d="M21.5 16.9v2.8a2 2 0 01-2.2 2 19.6 19.6 0 01-8.5-3 19.3 19.3 0 01-6-6 19.6 19.6 0 01-3-8.6A2 2 0 013.8 2h2.8a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L7.6 9.8a15.9 15.9 0 006 6l1.2-1.2a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.8 2z"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 7l9 6.2L21 7"/>',
    pin: '<path d="M20 10.4c0 5.8-8 11.6-8 11.6s-8-5.8-8-11.6a8 8 0 0116 0z"/><circle cx="12" cy="10.2" r="2.9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/>',
    truck:
      '<rect x="1.5" y="6" width="12.5" height="10" rx="2"/><path d="M14 9.5h3.6L21 13v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
    shield: '<path d="M12 2.5l8 3.3v5.7c0 4.9-3.4 9-8 10.1-4.6-1.1-8-5.2-8-10.1V5.8z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    gift:
      '<rect x="3" y="9.5" width="18" height="11.5" rx="2"/><path d="M3 13.6h18M12 9.5V21"/><path d="M12 9.5S10.6 3.5 8.2 3.5a2.5 2.5 0 000 5H12zM12 9.5s1.4-6 3.8-6a2.5 2.5 0 010 5H12z"/>',
    award: '<circle cx="12" cy="8.8" r="5.8"/><path d="M8.6 13.9L7.2 21.5 12 18.6l4.8 2.9-1.4-7.6"/>',
    sliders:
      '<path d="M4 6.5h8M17.5 6.5H20M4 12h3.5M13 12h7M4 17.5h8M17.5 17.5H20"/><circle cx="14.5" cy="6.5" r="2.2"/><circle cx="10" cy="12" r="2.2"/><circle cx="14.5" cy="17.5" r="2.2"/>',
    box: '<path d="M21 7.8L12 2.9 3 7.8v8.4l9 4.9 9-4.9z"/><path d="M3.2 7.6l8.8 4.9 8.8-4.9M12 21.1v-8.6"/>',
    eye: '<path d="M2.2 12S5.8 5.2 12 5.2 21.8 12 21.8 12 18.2 18.8 12 18.8 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3"/>',
    share:
      '<circle cx="18" cy="5.5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="18" cy="18.5" r="2.8"/><path d="M8.5 13.4l7 3.7M15.5 6.9l-7 3.7"/>',
    sparkle:
      '<path d="M11.5 3l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6L5.1 9.4l4.6-1.8z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    navigation: '<path d="M21 3L3 10.8l8 2.4 2.4 8z"/>',
    copy: '<rect x="8.5" y="8.5" width="12.5" height="12.5" rx="2.5"/><path d="M5.5 15.5H5a2 2 0 01-2-2v-9a2 2 0 012-2h9a2 2 0 012 2v.5"/>',
    home: '<path d="M3.2 10.6L12 3.2l8.8 7.4V20a1.2 1.2 0 01-1.2 1.2h-4.4v-6.4H8.8v6.4H4.4A1.2 1.2 0 013.2 20z"/>',
    grid:
      '<rect x="3" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8"/>',
    instagram:
      '<rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
    ruler: '<path d="M3.5 14.5L14.5 3.5l6 6-11 11z"/><path d="M7 11l2 2M10 8l2 2M13 5l2 2"/>',
    refresh: '<path d="M20.5 12a8.5 8.5 0 11-2.6-6.1"/><path d="M20.5 4.2V9h-4.8"/>',
    heart: '<path d="M12 20.5S3.5 15.4 3.5 9.5A4.5 4.5 0 0112 7a4.5 4.5 0 018.5 2.5c0 5.9-8.5 11-8.5 11z"/>',
    tag: '<path d="M20.6 12.6l-8 8a2 2 0 01-2.8 0l-7-7a2 2 0 01-.6-1.4V4.5a2 2 0 012-2h7.7a2 2 0 011.4.6l7.3 7.3a2 2 0 010 2.2z"/><circle cx="8" cy="8" r="1.4"/>'
  };

  var FILLED = {
    star: '<path d="M12 2.4l2.9 5.9 6.5 1-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-1z"/>',
    play: '<path d="M7.5 4.6l12 7.4-12 7.4z"/>',
    whatsapp:
      '<path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.1c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.8.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z"/>' +
      '<path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.1 8.1 0 013.8 12c0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z"/>',
    facebook:
      '<path d="M13.6 21.5v-8.3h2.8l.4-3.2h-3.2V7.9c0-.9.3-1.6 1.6-1.6h1.7V3.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.4v3.2h2.8v8.3z"/>',
    telegram:
      '<path d="M21.6 4.1L3.2 11.2c-1.2.5-1.2 2.1.1 2.5l4.5 1.4 1.7 5.3c.3.9 1.5 1.1 2.1.4l2.5-2.7 4.5 3.3c.8.6 1.9.1 2.1-.9l3-13.9c.2-1.1-.9-2-2.1-1.5zM9.6 15l8.5-5.3-6.7 6.2-.3 3.5z"/>'
  };

  /**
   * Return an inline SVG icon.
   * @param {string} name
   * @param {string} [cls] optional extra class(es)
   */
  TLS.icon = function (name, cls) {
    var filled = Object.prototype.hasOwnProperty.call(FILLED, name);
    var body = filled ? FILLED[name] : STROKE[name];
    if (!body) return "";
    return (
      '<svg viewBox="0 0 24 24" class="ico' + (cls ? " " + cls : "") + '" ' +
      (filled
        ? 'fill="currentColor" stroke="none"'
        : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"') +
      ' aria-hidden="true" focusable="false">' +
      body +
      "</svg>"
    );
  };

  TLS.iconNames = Object.keys(STROKE).concat(Object.keys(FILLED));
})(window);
