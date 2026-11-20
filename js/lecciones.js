/* Lecciones de ingeniería: la meta abortada, paso a paso.
   Cada cifra sale de lecciones.html (sección «Qué significa una meta abortada»): 60 metas, 54 abortadas,
   53 de ellas coincidentes con reemplazos del explorador, un destino nuevo cada 3,3 s. Los 6 y el 1 restantes
   son las diferencias 60 - 54 y 54 - 53. */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  var TOTAL = 60, ABORT = 54, REEMP = 53, COLS = 10, PASO = 38, R = 12;

  /* Cada paso dice una frase, qué clase lleva cada punto y qué leyenda se muestra.
     La clase dice la forma y el color. foco marca los puntos que el paso quiere mirar. */
  var PASOS = [
    { t: "El ensayo de navegación tuvo 60 metas.", n: "60 metas",
      clase: function () { return "meta"; }, foco: function () { return true; },
      ley: [["meta", "meta", 60]] },
    { t: "54 de ellas quedaron abortadas. Leído a la ligera, el robot fallaba casi siempre.", n: "54 abortadas",
      clase: function (i) { return i < ABORT ? "abortada" : "meta"; }, foco: function (i) { return i < ABORT; },
      ley: [["abortada", "abortada", 54], ["meta", "no abortada", 6]] },
    { t: "Pero 53 de esos abortos coinciden en el tiempo con reemplazos del propio explorador, que cambia de destino cada 3,3 s.", n: "53 coinciden con reemplazos",
      clase: function (i) { return i < REEMP ? "reemplazo" : i < ABORT ? "abortada" : "meta"; }, foco: function (i) { return i < REEMP; },
      ley: [["reemplazo", "aborto que coincide con un reemplazo", 53], ["abortada", "abortada sin reemplazo coincidente", 1], ["meta", "no abortada", 6]] },
    { t: "Nav2 informa un reemplazo con la misma palabra que una falla: abortada.", n: "Nav2 lo llama abortada",
      clase: function (i) { return i < REEMP ? "nav2" : i < ABORT ? "abortada" : "meta"; }, foco: function (i) { return i < REEMP; },
      ley: [["nav2", "reemplazo que Nav2 informa como abortada", 53], ["abortada", "abortada sin reemplazo coincidente", 1], ["meta", "no abortada", 6]] },
    { t: "El límite: un criterio temporal no descarta que alguna falla haya ocurrido al mismo tiempo.", n: "Falla no descartada",
      clase: function (i) { return i < REEMP ? "duda" : i < ABORT ? "abortada" : "meta"; }, foco: function (i) { return i < REEMP; },
      ley: [["duda", "coincide en el tiempo, una falla simultánea no se descarta", 53], ["abortada", "abortada sin reemplazo coincidente", 1], ["meta", "no abortada", 6]] }
  ];

  function punto(cx, cy, d) {
    return '<g class="mq-p s-meta" data-i="' + d + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"/><rect x="' + (cx - R) + '" y="' + (cy - R) + '" width="' + 2 * R + '" height="' + 2 * R + '" rx="4"/></g>';
  }
  function mini(clase) {
    return '<svg class="mq-mini" viewBox="0 0 26 26" aria-hidden="true"><g class="mq-p s-' + clase + '"><circle cx="13" cy="13" r="9"/><rect x="4" y="4" width="18" height="18" rx="4"/></g></svg>';
  }

  V["metas-abortadas"] = function (el) {
    var k = 0, filas = Math.ceil(TOTAL / COLS), ancho = COLS * PASO, alto = filas * PASO, pts = "";
    for (var i = 0; i < TOTAL; i++) pts += punto(PASO / 2 + (i % COLS) * PASO, PASO / 2 + Math.floor(i / COLS) * PASO, i);
    el.innerHTML =
      '<div class="vctl mq-ctl"><button type="button" class="vbtn sec" data-a="atras">Anterior</button>' +
      '<button type="button" class="vbtn" data-a="sig">Siguiente</button><span class="mq-n num" data-o="n"></span></div>' +
      '<svg class="mq-svg" viewBox="0 0 ' + ancho + ' ' + alto + '" role="img" aria-label="">' + pts + '</svg>' +
      '<p class="mq-txt" data-o="txt" aria-live="polite" aria-atomic="true"></p>' +
      '<ul class="mq-ley" data-o="ley"></ul>' +
      '<p class="vnota">Cada punto es una de las 60 metas. Las cifras 6 y 1 salen de restar: 60 − 54 y 54 − 53.</p>';
    var atras = el.querySelector('[data-a="atras"]'), sig = el.querySelector('[data-a="sig"]'),
      svg = el.querySelector(".mq-svg"), gs = el.querySelectorAll(".mq-p[data-i]");

    function pintar() {
      var p = PASOS[k];
      for (var i = 0; i < gs.length; i++) {
        gs[i].setAttribute("class", "mq-p s-" + p.clase(i) + (p.foco(i) ? "" : " mq-tenue"));
      }
      svg.setAttribute("aria-label", "Paso " + (k + 1) + " de " + PASOS.length + ": " + p.n + ". 60 puntos, uno por meta.");
      el.querySelector('[data-o="n"]').textContent = "Paso " + (k + 1) + " de " + PASOS.length;
      el.querySelector('[data-o="txt"]').textContent = p.t;
      el.querySelector('[data-o="ley"]').innerHTML = p.ley.map(function (x) {
        return "<li>" + mini(x[0]) + "<span>" + U.esc(x[1]) + " · <b class=\"num\">" + x[2] + "</b></span></li>";
      }).join("");
      atras.disabled = k === 0; sig.disabled = k === PASOS.length - 1;
    }
    /* un botón que se desactiva con el foco puesto lo pierde: el foco pasa a su pareja */
    function ir(d) {
      var antes = document.activeElement;
      k = Math.max(0, Math.min(PASOS.length - 1, k + d));
      pintar();
      if (antes === atras && atras.disabled) sig.focus();
      else if (antes === sig && sig.disabled) atras.focus();
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-a]");
      if (b && !b.disabled) ir(b.getAttribute("data-a") === "sig" ? 1 : -1);
    });
    el.addEventListener("keydown", function (e) {
      if (e.target.closest && e.target.closest("button") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault(); ir(e.key === "ArrowRight" ? 1 : -1);
      }
    });
    pintar();
  };
})();
