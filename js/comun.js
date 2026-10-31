/* Utilidades compartidas por la página y los diagramas */
(function () {
  "use strict";
  var U = {};
  U.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  U.fmt = function (v, dec) {
    if (dec == null) dec = 1;
    var f = Math.pow(10, dec);
    return (Math.round(v * f + 1e-9) / f).toFixed(dec).replace(".", ",");
  };
  U.quieto = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  /* redibujo al cambiar el ancho */
  var alAncho = [];
  U.alCambiarAncho = function (el, fn) {
    var w = el.clientWidth;
    alAncho.push({ el: el, fn: fn, w: w });
  };
  var t = null;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      alAncho.forEach(function (o) {
        var w = o.el.clientWidth;
        if (Math.abs(w - o.w) > 8) { o.w = w; o.fn(); }
      });
    }, 120);
  });
  /* animación simple de 0 a 1 */
  U.animar = function (ms, cada, fin) {
    if (U.quieto()) { cada(1); if (fin) fin(); return function () {}; }
    var t0 = null, vivo = true;
    function paso(ts) {
      if (!vivo) return;
      if (t0 == null) t0 = ts;
      var k = Math.min(1, (ts - t0) / ms);
      cada(k);
      if (k < 1) requestAnimationFrame(paso); else if (fin) fin();
    }
    requestAnimationFrame(paso);
    return function () { vivo = false; };
  };
  /* Iconos de cumple y no cumple. Viven aquí porque los usan interactivos de archivos distintos,
     y cada página carga solo los archivos de los interactivos que contiene. */
  U.ICO = {
    OK: '<svg class="ico ok" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5"/><path d="M4.5 8.3l2.3 2.3 4.7-5"/></svg>',
    NO: '<svg class="ico no" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5"/><path d="M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6"/></svg>'
  };
  window.U = U;
  window.VISUALES = window.VISUALES || {};
  window.VISUALES.ICO = U.ICO;
})();
