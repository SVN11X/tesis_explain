/* Utilidades compartidas por la página y los diagramas */
(function () {
  "use strict";
  var U = {};
  U.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  /* marca los datos que solo el estudiante puede completar, escritos entre corchetes */
  U.txt = function (s) {
    return U.esc(s).replace(/\[([^\]]+)\]/g, '<mark class="completar" title="Dato que solo tú puedes completar">[$1]</mark>');
  };
  U.r1 = function (v) { return Math.round(v * 10 + 1e-9) / 10; };
  U.fmt = function (v, dec) {
    if (dec == null) dec = 1;
    var f = Math.pow(10, dec);
    return (Math.round(v * f + 1e-9) / f).toFixed(dec).replace(".", ",");
  };
  U.nivel = function (v, om) { return om ? "omit" : (v < 4 ? "baja" : (v < 5.5 ? "media" : "alta")); };
  U.prom = function (a) { if (!a.length) return null; var s = 0; a.forEach(function (x) { s += x; }); return s / a.length; };
  U.quieto = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  U.guardar = function (k, v) { try { localStorage.setItem("defensa3." + k, JSON.stringify(v)); } catch (e) {} };
  U.leer = function (k, d) { try { var v = localStorage.getItem("defensa3." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
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
  U.suave = function (k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
  window.U = U;
  window.VISUALES = window.VISUALES || {};
})();
