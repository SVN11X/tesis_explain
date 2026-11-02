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
    OK: '<svg class="ph ico ok" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity=".2"/><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>',
    NO: '<svg class="ph ico no" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity=".2"/><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>'
  };
  /* Planta del robot real, la misma en todas las figuras, con las medidas del CAD del prototipo. La cubierta es una U
     de 0,23 m de ancho: borde recto atrás, curva adelante y el LiDAR en la parte curva. Desde el centro de giro, en el
     eje de las ruedas, llega 0,195 m hacia adelante y 0,055 m hacia atrás; el centro del LiDAR queda 0,115 m adelante. */
  var CU = { r: 0.115, atras: -0.055, curva: 0.08, lidar: 0.115, lidarR: 0.035 };
  CU.frente = CU.curva + CU.r;
  var ANCLA = { giro: 0, centro: (CU.atras + CU.frente) / 2, lidar: CU.lidar };
  /* (x, y) es el ancla en px, th el rumbo en la pantalla (0 hacia la derecha, creciendo en el sentido del
     reloj) y k los px por metro. El ancla es el centro de giro, el centro del cuerpo o el LiDAR. */
  function aPantalla(x, y, th, k, ancla) {
    var d = ANCLA[ancla || "giro"], c = Math.cos(th), s = Math.sin(th);
    return function (u, v) { u -= d; return [x + (u * c - v * s) * k, y + (u * s + v * c) * k]; };
  }
  U.robot = {
    medidas: CU,
    svg: function (x, y, th, k, ancla) {
      var P = aPantalla(x, y, th, k, ancla), r = (CU.r * k).toFixed(2);
      var f = function (p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); };
      return {
        cuerpo: "M" + f(P(CU.atras, -CU.r)) + "L" + f(P(CU.curva, -CU.r)) + "A" + r + " " + r + " 0 0 1 " + f(P(CU.curva, CU.r)) + "L" + f(P(CU.atras, CU.r)) + "Z",
        lidar: P(CU.lidar, 0), lidarR: CU.lidarR * k
      };
    },
    /* deja el contorno como trazado actual del contexto, y quien llama elige relleno y borde */
    canvas: function (ctx, x, y, th, k, ancla) {
      var d = ANCLA[ancla || "giro"];
      ctx.save(); ctx.translate(x, y); ctx.rotate(th); ctx.translate(-d * k, 0);
      ctx.beginPath(); ctx.moveTo(CU.atras * k, -CU.r * k); ctx.lineTo(CU.curva * k, -CU.r * k);
      ctx.arc(CU.curva * k, 0, CU.r * k, -Math.PI / 2, Math.PI / 2, false);
      ctx.lineTo(CU.atras * k, CU.r * k); ctx.closePath();
      ctx.restore();
      return { lidar: aPantalla(x, y, th, k, ancla)(CU.lidar, 0), lidarR: CU.lidarR * k };
    },
    /* ícono para las leyendas, mirando a la derecha */
    icono: function (clase) {
      var g = U.robot.svg(0, 13, 0, 100, "giro");
      return '<svg class="ley-robot' + (clase ? " " + clase : "") + '" viewBox="-6 1 26 24" aria-hidden="true"><path d="' + g.cuerpo + '"/><circle cx="' + g.lidar[0].toFixed(1) + '" cy="' + g.lidar[1].toFixed(1) + '" r="' + g.lidarR.toFixed(1) + '"/></svg>';
    }
  };
  window.U = U;
  window.VISUALES = window.VISUALES || {};
  window.VISUALES.ICO = U.ICO;
})();
