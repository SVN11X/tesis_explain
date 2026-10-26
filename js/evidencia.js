/* Interactivos de la evidencia analítica de la tesis:
   estabilidad del lazo de velocidad (Anexo 4.12), mapa frente al plano medido (Anexo 8.5)
   y alcance de las repeticiones (Sección 5.6 y Anexo 8.6).
   Los cálculos viven en js/estabilidad-modelo.js y js/estadistica-modelo.js. */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  function f(v, d) { return U.fmt(v, d == null ? 2 : d); }
  function signo(v, d) { return (v > 0 ? "+" : v < 0 ? "−" : "") + f(Math.abs(v), d); }
  /* rótulo de eje: signo menos tipográfico y sin signo más */
  function rotulo(v, d) { return (v < 0 ? "−" : "") + f(Math.abs(v), d); }
  function esc(s) { return U.esc(s); }
  function chips(items, attr, actual, titulo) {
    return '<div class="chips" role="group" aria-label="' + esc(titulo) + '">' + items.map(function (x) {
      return '<button type="button" class="chip" ' + attr + '="' + esc(x[0]) + '" aria-pressed="' + (String(x[0]) === String(actual)) + '">' + esc(x[1]) + '</button>';
    }).join("") + '</div>';
  }
  function marcar(el, attr, valor) {
    el.querySelectorAll("[" + attr + "]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute(attr) === String(valor))); });
  }
  function tarjetas(items) {
    /* un cuarto elemento "t" marca un valor de texto, que no usa la tipografía de cifras */
    return items.map(function (x) { return '<div><span>' + x[0] + '</span><b' + (x[3] === "t" ? '' : ' class="num"') + '>' + x[1] + '</b><small>' + (x[2] || "") + '</small></div>'; }).join("");
  }
  /* Recorta un segmento a un rectángulo (Liang y Barsky). Devuelve null si queda fuera. */
  function recortar(x0, y0, x1, y1, r) {
    var t0 = 0, t1 = 1, dx = x1 - x0, dy = y1 - y0, p = [-dx, dx, -dy, dy], q = [x0 - r.x0, r.x1 - x0, y0 - r.y0, r.y1 - y0];
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return null; continue; }
      var t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; } else { if (t < t0) return null; if (t < t1) t1 = t; }
    }
    return [x0 + t0 * dx, y0 + t0 * dy, x0 + t1 * dx, y0 + t1 * dy];
  }
  function marcasEje(min, max, n) {
    var paso = Math.pow(10, Math.floor(Math.log10((max - min) / n))), err = (max - min) / n / paso;
    paso *= err >= 5 ? 5 : err >= 2 ? 2 : 1;
    var out = [];
    for (var v = Math.ceil(min / paso) * paso; v <= max + paso * 1e-9; v += paso) out.push(Math.abs(v) < paso * 1e-9 ? 0 : v);
    return { valores: out, paso: paso };
  }
  function decimalesPaso(paso) { return Math.max(0, -Math.floor(Math.log10(paso) + 1e-9)); }

  /* ---------- 1. Estabilidad del lazo de velocidad ---------- */
  V.estabilidad = function (el) {
    var E = window.ESTABILIDAD;
    if (!E) throw new Error("Falta el modelo de estabilidad.");
    var INICIAL = { rueda: "izq", conjunto: "definitivas", kiLineal: false, Ld: 0, exp: 0, tau: null, zoom: false };
    var st = JSON.parse(JSON.stringify(INICIAL));
    var CONJ = [["definitivas", "Definitivas"], ["pso-evaluado", "PSO, Kd evaluado = 25"], ["pso-informado", "PSO, Kd informado"], ["original", "Firmware original"]];
    el.innerHTML =
      '<div class="ev-controles">' +
        '<div class="ev-grupo"><span>Rueda</span>' + chips([["izq", "Izquierda"], ["der", "Derecha"]], "data-rueda", st.rueda, "Rueda del modelo") + '</div>' +
        '<div class="ev-grupo"><span>Ganancias</span>' + chips(CONJ, "data-conj", st.conjunto, "Conjunto de ganancias") + '</div>' +
      '</div>' +
      '<div class="ev-controles">' +
        '<label class="desl-linea" for="ev-ld">Retardo del modelo, Ld <b class="num" data-o="ld"></b><input id="ev-ld" type="range" min="0" max="0.1" step="0.005" value="0"></label>' +
        '<label class="desl-linea" for="ev-km">Ganancia de la planta, en veces la identificada <b class="num" data-o="km"></b><input id="ev-km" type="range" min="-1" max="1" step="0.01" value="0"></label>' +
        '<label class="desl-linea" for="ev-tau">Constante de tiempo de la planta, τ <b class="num" data-o="tau"></b><input id="ev-tau" type="range" min="0.05" max="3" step="0.01" value="0.33"></label>' +
      '</div>' +
      '<div class="ev-acciones"><div class="casillas"><label><input type="checkbox" id="ev-ki"> Tratar el término de Ki como lineal, el caso más desfavorable de la izquierda</label></div>' +
        '<button type="button" class="vbtn sec" data-a="zoom" aria-pressed="false">Acercar a z = 1</button>' +
        '<button type="button" class="vbtn sec" data-a="tesis">Volver al caso de la tesis</button></div>' +
      '<div class="ev-paneles">' +
        '<figure class="ev-fig"><figcaption><b>Polos del lazo cerrado</b><span>Estable si todos quedan dentro del círculo de radio 1.</span></figcaption><div data-o="polos"></div></figure>' +
        '<figure class="ev-fig"><figcaption><b>Curva de Nyquist cerca de −1</b><span>L = planta × controlador, para cada frecuencia entre 0,05 rad/s y la mitad del muestreo.</span></figcaption><div data-o="nyquist"></div></figure>' +
      '</div>' +
      '<div class="vley"><span><i class="lin azul"></i>curva del lazo abierto</span><span><i class="pt rojo"></i>punto crítico −1</span><span><i class="lin-disc"></i>círculo de radio 1</span><span><i class="lin verde"></i>margen de fase</span><span><i class="lin ambar"></i>círculo de distancia 1/Ms</span><span><i class="anillo"></i>cruce de |L| = 1</span><span><i class="anillo ambar"></i>cruce con el eje real negativo</span></div>' +
      '<div class="control-datos ev-datos" data-o="datos"></div>' +
      '<p class="control-conclusion" data-o="lectura" aria-live="polite"></p>' +
      '<p class="ev-procedencia" data-o="procedencia"></p>' +
      '<p class="vnota">Modelo lineal del Anexo 4.12: FOPDT de cada rueda discretizado a 33 ms, retenedor del PWM y medición como velocidad media del ciclo anterior. No incluye la saturación, la banda del error, la zona muerta ni los truncamientos enteros, así que no prueba la estabilidad del firmware real. El escenario de 0,1 s es de sensibilidad, no una cota medida del retardo.</p>';
    var inp = { ld: el.querySelector("#ev-ld"), km: el.querySelector("#ev-km"), tau: el.querySelector("#ev-tau"), ki: el.querySelector("#ev-ki") };
    var out = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
    function tauActual() { return st.tau == null ? E.RUEDAS[st.rueda].tau : st.tau; }
    function procedencia() {
      var base = st.exp === 0 && st.tau == null, borde = st.Ld === 0 || st.Ld === 0.1;
      if (base && borde && st.conjunto === "definitivas" && !(st.rueda === "der" && st.kiLineal)) return '<b>Datos de la tesis.</b> Es una fila de la Tabla A4.5' + (st.Ld === 0 ? ', sin retardo, el modelo efectivamente ajustado.' : ', en el escenario de sensibilidad de 0,1 s.');
      if (base && borde) return '<b>Datos de la tesis.</b> Son las cifras que el Anexo 4.12 informa para este conjunto de ganancias.';
      if (base && st.conjunto === "definitivas" && st.rueda === "der" && Math.abs(st.Ld - 0.07) < 1e-9) return '<b>Cálculo con el mismo modelo.</b> Cerca del retardo de 0,0692 s que entregó el optimizador para la derecha. El Anexo 4.6 explica que ese valor no se distingue de cero con captura cada 0,1 s.';
      return '<b>Cálculo con el mismo modelo.</b> No es una fila de la tesis: sirve para ver hacia dónde se mueven los márgenes.';
    }
    function polosSVG(r) {
      /* el área de dibujo es cuadrada para que el círculo unitario se vea redondo */
      var W = 310, H = 300, ml = 36, mr = 26, mt = 26, mb = 26, vista = st.zoom ? { x0: 0.80, x1: 1.05, y0: -0.125, y1: 0.125 } : { x0: -1.25, x1: 1.25, y0: -1.25, y1: 1.25 };
      var sx = (W - ml - mr) / (vista.x1 - vista.x0), X = function (x) { return ml + (x - vista.x0) * sx; }, Y = function (y) { return H - mb - (y - vista.y0) * sx; };
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc("Polos del lazo cerrado. El mayor tiene magnitud " + f(r.poloMayor, 4) + (r.estable ? ", dentro del círculo unitario." : ", fuera del círculo unitario.")) + '"><defs><clipPath id="ev-clip-polos"><rect x="' + ml + '" y="' + mt + '" width="' + (W - ml - mr) + '" height="' + (H - mt - mb) + '"/></clipPath></defs>';
      var mk = marcasEje(vista.x0, vista.x1, st.zoom ? 5 : 4), dec = decimalesPaso(mk.paso);
      mk.valores.forEach(function (v) { s += '<line class="ev-rejilla" x1="' + X(v) + '" x2="' + X(v) + '" y1="' + mt + '" y2="' + (H - mb) + '"/><text class="ev-t" x="' + X(v) + '" y="' + (H - mb + 15) + '" text-anchor="middle">' + rotulo(v, dec) + '</text>'; });
      marcasEje(vista.y0, vista.y1, 4).valores.forEach(function (v) { s += '<line class="ev-rejilla" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="ev-t" x="' + (ml - 4) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + rotulo(v, dec) + '</text>'; });
      s += '<g clip-path="url(#ev-clip-polos)">';
      if (vista.y0 < 0 && vista.y1 > 0) s += '<line class="ev-eje" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
      if (vista.x0 < 0 && vista.x1 > 0) s += '<line class="ev-eje" x1="' + X(0) + '" x2="' + X(0) + '" y1="' + mt + '" y2="' + (H - mb) + '"/>';
      s += '<circle class="ev-circulo" cx="' + X(0) + '" cy="' + Y(0) + '" r="' + sx + '"/>';
      r.polos.forEach(function (z) {
        var cx = X(z[0]), cy = Y(z[1]), d = 6, fuera = Math.hypot(z[0], z[1]) >= 1;
        s += '<path class="ev-polo' + (fuera ? ' fuera' : '') + '" d="M' + (cx - d) + ' ' + (cy - d) + 'L' + (cx + d) + ' ' + (cy + d) + 'M' + (cx + d) + ' ' + (cy - d) + 'L' + (cx - d) + ' ' + (cy + d) + '"/>';
      });
      s += '</g><text class="ev-tb" x="' + ml + '" y="16">|z| máx = ' + f(r.poloMayor, 4) + (r.estable ? ', dentro' : ', fuera') + '</text>';
      if (st.zoom) {
        var fueraVista = r.polos.filter(function (z) { return z[0] < vista.x0 || z[0] > vista.x1 || z[1] < vista.y0 || z[1] > vista.y1; }).length;
        if (fueraVista) s += '<text class="ev-t" x="' + (W - mr) + '" y="16" text-anchor="end">' + fueraVista + (fueraVista === 1 ? ' polo fuera de la vista' : ' polos fuera de la vista') + '</text>';
      }
      return s + '</svg>';
    }
    function nyquistSVG(r) {
      var W = 300, H = 300, m = 26, v = { x0: -2, x1: 1, y0: -2, y1: 1 }, sx = (W - 2 * m) / 3;
      var X = function (x) { return m + (x - v.x0) * sx; }, Y = function (y) { return H - m - (y - v.y0) * sx; };
      var puntos = E.nyquist(r.P, r.C, 500), tramos = [], actual = "";
      for (var i = 1; i < puntos.length; i++) {
        var c = recortar(puntos[i - 1].re, puntos[i - 1].im, puntos[i].re, puntos[i].im, v);
        if (!c) { if (actual) { tramos.push(actual); actual = ""; } continue; }
        if (!actual) actual = "M" + X(c[0]).toFixed(1) + " " + Y(c[1]).toFixed(1);
        actual += "L" + X(c[2]).toFixed(1) + " " + Y(c[3]).toFixed(1);
        var fin = c[2] !== puntos[i].re || c[3] !== puntos[i].im;
        if (fin) { tramos.push(actual); actual = ""; }
      }
      if (actual) tramos.push(actual);
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc("Curva de Nyquist. " + (r.estable ? "No rodea al punto −1. " : "Rodea al punto −1. ") + (isFinite(r.pm) ? "Margen de fase de " + f(r.pm, 1) + " grados" : "Sin cruce de magnitud uno") + (isFinite(r.Ms) ? ", sensibilidad máxima " + f(r.Ms, 2) + "." : ".")) + '"><defs><clipPath id="ev-clip-nyq"><rect x="' + m + '" y="' + m + '" width="' + (W - 2 * m) + '" height="' + (H - 2 * m) + '"/></clipPath></defs>';
      [-2, -1, 0, 1].forEach(function (t) {
        s += '<line class="ev-rejilla" x1="' + X(t) + '" x2="' + X(t) + '" y1="' + m + '" y2="' + (H - m) + '"/><text class="ev-t" x="' + X(t) + '" y="' + (H - m + 15) + '" text-anchor="middle">' + rotulo(t, 0) + '</text>';
        s += '<line class="ev-rejilla" x1="' + m + '" x2="' + (W - m) + '" y1="' + Y(t) + '" y2="' + Y(t) + '"/><text class="ev-t" x="' + (m - 4) + '" y="' + (Y(t) + 4) + '" text-anchor="end">' + rotulo(t, 0) + '</text>';
      });
      s += '<g clip-path="url(#ev-clip-nyq)"><line class="ev-eje" x1="' + m + '" x2="' + (W - m) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/><line class="ev-eje" x1="' + X(0) + '" x2="' + X(0) + '" y1="' + m + '" y2="' + (H - m) + '"/>';
      s += '<circle class="ev-circulo" cx="' + X(0) + '" cy="' + Y(0) + '" r="' + sx + '"/>';
      if (isFinite(r.Ms) && r.Ms > 0) s += '<circle class="ev-ms" cx="' + X(-1) + '" cy="' + Y(0) + '" r="' + (sx / r.Ms) + '"/>';
      tramos.forEach(function (d) { s += '<path class="ev-curva" d="' + d + '"/>'; });
      if (isFinite(r.wc)) {
        var Lc = E.lazo(r.P, r.C, r.wc), ang = Math.atan2(Lc[1], Lc[0]), a0 = Math.PI, a1 = ang < 0 ? ang + 2 * Math.PI : ang;
        var paso = (a1 - a0) / 24, d = "";
        for (var k = 0; k <= 24; k++) { var a = a0 + k * paso; d += (k ? "L" : "M") + X(Math.cos(a)).toFixed(1) + " " + Y(Math.sin(a)).toFixed(1); }
        if (r.pm > 0) s += '<path class="ev-arco" d="' + d + '"/>';
        s += '<circle class="ev-marca" r="5" cx="' + X(Lc[0]) + '" cy="' + Y(Lc[1]) + '"/>';
      }
      if (isFinite(r.w180)) { var L1 = E.lazo(r.P, r.C, r.w180); if (Math.hypot(L1[0], L1[1]) > 0.06) s += '<circle class="ev-marca gm" r="4.5" cx="' + X(L1[0]) + '" cy="' + Y(L1[1]) + '"/>'; }
      s += '<circle class="ev-critico" r="4.5" cx="' + X(-1) + '" cy="' + Y(0) + '"/></g><text class="ev-t" x="' + (X(-1) - 6) + '" y="' + (Y(0) - 8) + '" text-anchor="end">−1</text>';
      s += '<text class="ev-tb" x="' + m + '" y="16">' + (isFinite(r.pm) ? 'margen de fase ' + f(r.pm, 1) + '°' : 'sin cruce de |L| = 1') + '</text>';
      return s + '</svg>';
    }
    function pintar() {
      var kiPosible = st.rueda === "izq" && st.conjunto === "definitivas";
      if (!kiPosible) st.kiLineal = false;
      inp.ki.disabled = !kiPosible; inp.ki.checked = st.kiLineal;
      var mult = Math.pow(10, st.exp), tau = tauActual();
      var r = E.analizar({ rueda: st.rueda, conjunto: st.conjunto, kiLineal: st.kiLineal, Ld: st.Ld, multGanancia: mult, tau: tau });
      var crit = E.gananciaCritica({ rueda: st.rueda, conjunto: st.conjunto, kiLineal: st.kiLineal, Ld: st.Ld, tau: tau });
      out("ld").textContent = f(st.Ld, 3) + " s";
      out("km").textContent = "× " + f(mult, 2);
      out("tau").textContent = f(tau, st.tau == null ? 4 : 2) + " s";
      out("polos").innerHTML = polosSVG(r);
      out("nyquist").innerHTML = nyquistSVG(r);
      var gmVeces = isFinite(r.gm) ? r.gm : NaN;
      out("datos").innerHTML = tarjetas([
        ["Estabilidad", '<span class="ev-estado ' + (r.estable ? 'ok">Estable' : 'no">Inestable') + '</span>', "Polo más lejano, |z| = " + f(r.poloMayor, 4) + (r.estable ? ". Todas las raíces dentro del círculo unitario." : ". Al menos una raíz fuera del círculo: la oscilación crecería.")],
        ["Margen de fase", isFinite(r.pm) ? f(r.pm, 1) + "°" : "no aplica", "Atraso extra que tolera donde |L| = 1."],
        ["Margen de ganancia", isFinite(gmVeces) ? f(r.gmDb, 1) + " dB = " + f(gmVeces, gmVeces < 10 ? 1 : 0) + " veces" : "no aplica", "Cuánto puede crecer la ganancia del lazo."],
        ["Margen de retardo", isFinite(r.dm) ? f(r.dm, 3) + " s" : "no aplica", "Retardo adicional que admite."],
        ["Sensibilidad máxima Ms", isFinite(r.Ms) ? f(r.Ms, 2) : "no aplica", "Valores típicos entre 1,2 y 2,0."],
        ["Período × cruce", isFinite(r.Twc) ? f(r.Twc, 3) : "no aplica", "Recomendado entre 0,05 y 0,14."],
        ["Ganancia crítica de la planta", isFinite(crit) ? "× " + f(crit, crit < 10 ? 2 : 1) : "sin pérdida hasta × 500", "Con este retardo y esta τ."]
      ]);
      var t = "";
      if (r.estable) {
        t = "Estable. El polo más lejano del origen tiene magnitud " + f(r.poloMayor, 4) + ". El lazo tolera " + f(r.dm, 3) + " s más de retardo y su ganancia podría crecer " + (isFinite(crit) ? f(crit / mult, crit / mult < 10 ? 2 : 1) + " veces" : "más de lo que explora el modelo") + " antes de perder la estabilidad.";
        if (r.poloMayor > 0.99) t += " Un polo tan cerca de 1 es un modo muy lento: con 33 ms, unos " + f(-E.T / Math.log(r.poloMayor), 1) + " s de constante de tiempo.";
        if (r.Ms > 2) t += " La sensibilidad máxima, " + f(r.Ms, 2) + ", queda sobre el intervalo típico de 1,2 a 2,0.";
      } else {
        t = "Inestable. Un polo queda fuera del círculo unitario, con magnitud " + f(r.poloMayor, 4) + ". Con este retardo y esta constante de tiempo, el modelo pierde la estabilidad desde " + (isFinite(crit) ? f(crit, 2) : "—") + " veces la ganancia identificada.";
      }
      out("lectura").textContent = t;
      out("procedencia").innerHTML = procedencia();
      inp.ld.value = st.Ld; inp.km.value = st.exp; inp.tau.value = (st.tau == null ? E.RUEDAS[st.rueda].tau : st.tau).toFixed(2);
      el.querySelector('[data-a="zoom"]').setAttribute("aria-pressed", String(st.zoom));
    }
    el.addEventListener("input", function (e) {
      if (e.target === inp.ld) st.Ld = Math.round(+inp.ld.value * 1000) / 1000;
      else if (e.target === inp.km) st.exp = Math.round(+inp.km.value * 100) / 100;
      else if (e.target === inp.tau) st.tau = Math.round(+inp.tau.value * 100) / 100;
      else if (e.target === inp.ki) st.kiLineal = inp.ki.checked;
      else return;
      pintar();
    });
    el.addEventListener("change", function (e) { if (e.target === inp.ki) { st.kiLineal = inp.ki.checked; pintar(); } });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.hasAttribute("data-rueda")) { st.rueda = b.getAttribute("data-rueda"); marcar(el, "data-rueda", st.rueda); }
      else if (b.hasAttribute("data-conj")) { st.conjunto = b.getAttribute("data-conj"); marcar(el, "data-conj", st.conjunto); }
      else if (b.dataset.a === "zoom") st.zoom = !st.zoom;
      else if (b.dataset.a === "tesis") { var z = st.zoom; st = JSON.parse(JSON.stringify(INICIAL)); st.zoom = z; marcar(el, "data-rueda", st.rueda); marcar(el, "data-conj", st.conjunto); }
      else return;
      pintar();
    });
    el.estadoEstabilidad = function () { return JSON.parse(JSON.stringify(st)); };
    pintar();
  };

  /* ---------- 2. El mapa frente al plano medido ---------- */
  var CORTO = {
    "alto": "Alto del recinto", "pasillo-1": "Pasillo 1", "pasillo-2": "Pasillo 2", "pasillo-3": "Pasillo 3",
    "paso-1": "Paso sobre el muro 1", "paso-2": "Paso bajo el muro 2", "tabique-largo": "Tabique del muro 2, largo",
    "tabique-altura": "Tabique del muro 2, altura", "tabique-superior-distancia": "Tabique superior, al muro",
    "tabique-superior-largo": "Tabique superior, largo", "tabique-inferior": "Tabique inferior, al muro derecho"
  };
  V["plano-mapa"] = function (el) {
    var D = window.PROYECTO, S = window.ESTADISTICA;
    if (!D || !D.analisis || !D.analisis.plano) throw new Error("Faltan las tablas del plano.");
    var filas = D.analisis.plano, its = D.analisis["plano-iteraciones"];
    var st = { vista: "distancias", sel: "pasillo-3", sentido: "plano" };
    var pasillos = filas.filter(function (r) { return r.tipo === "pasillo"; }).reduce(function (s, r) { return s + r.diferencia_media_cm; }, 0);
    var dentro = filas.filter(function (r) { return Math.abs(r.diferencia_media_cm) <= 5; }).length;
    el.innerHTML =
      '<div class="segmento" role="group" aria-label="Qué mostrar"><button type="button" data-v="distancias" aria-pressed="true">Cada distancia</button><button type="button" data-v="iteraciones" aria-pressed="false">Cada mapa</button></div>' +
      '<div data-o="sub"></div>' +
      '<figure class="ev-fig ev-plano" data-o="plano"></figure>' +
      '<div class="ev-graf" data-o="graf"></div>' +
      '<div data-o="ley"></div>' +
      '<div class="control-datos ev-datos" data-o="datos" aria-live="polite"></div>' +
      '<p class="control-conclusion" data-o="lectura"></p>' +
      '<p class="vnota">Datos de la tesis: Tabla A8.3 para las distancias y Tabla A8.2 para cada mapa. Cada mapa se alineó con el plano solo girándolo y trasladándolo, sin escalarlo. El plano se midió con huincha. Su incertidumbre no está incluida en estas cifras.</p>';
    var out = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
    /* Plano del recinto con la distancia elegida. La geometría sale de la Fig. A8.1 de la tesis. */
    function planoSVG(cont) {
      var G = D.parametros && D.parametros.mapeo && D.parametros.mapeo.plano_recinto;
      if (!G) return "";
      var r = filas.filter(function (f) { return f.id === st.sel; })[0], c = G.cotas[st.sel];
      var W = Math.min(520, Math.max(300, cont.clientWidth || 460)), x0 = -0.34, x1 = G.ancho_m + 0.1, y0 = -0.1, y1 = G.alto_m + 0.16;
      var k = (W - 8) / (x1 - x0), H = Math.round((y1 - y0) * k) + 8;
      var X = function (x) { return 4 + (x - x0) * k; }, Y = function (y) { return H - 4 - (y - y0) * k; };
      function linea(cls, a, b) { return '<line class="' + cls + '" x1="' + X(a[0]).toFixed(1) + '" y1="' + Y(a[1]).toFixed(1) + '" x2="' + X(b[0]).toFixed(1) + '" y2="' + Y(b[1]).toFixed(1) + '"/>'; }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc("Plano del recinto, de " + f(G.ancho_m, 2) + " por " + f(G.alto_m, 2) + " m. La distancia elegida, " + r.distancia.toLowerCase() + ", mide " + f(r.plano_m, 2) + " m en el plano y " + f(r.media_mapas_m, 2) + " m en promedio en los cinco mapas.") + '">';
      Object.keys(G.cotas).forEach(function (id) { if (id !== st.sel) s += linea("ev-cota", G.cotas[id][0], G.cotas[id][1]); });
      G.muros.forEach(function (m) { s += linea("ev-muro", m[0], m[1]); });
      if (G.tabique_sin_largo) s += linea("ev-muro sin-largo", G.tabique_sin_largo[0], G.tabique_sin_largo[1]);
      /* la distancia elegida, con marcas en sus extremos y su rótulo */
      var a = c[0], b = c[1], horizontal = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]), t = 6;
      s += linea("ev-cota-sel", a, b);
      [a, b].forEach(function (q) {
        var px = X(q[0]), py = Y(q[1]);
        s += horizontal ? '<line class="ev-cota-sel" x1="' + px + '" x2="' + px + '" y1="' + (py - t) + '" y2="' + (py + t) + '"/>' : '<line class="ev-cota-sel" x1="' + (px - t) + '" x2="' + (px + t) + '" y1="' + py + '" y2="' + py + '"/>';
      });
      var mx = X((a[0] + b[0]) / 2), my = Y((a[1] + b[1]) / 2), txt = f(r.plano_m, 2) + " m · mapas " + f(r.media_mapas_m, 2) + " m", ancho = txt.length * 6.6;
      var tx, ty, anc;
      if (st.sel === "alto") { tx = X(a[0]) - 4; ty = Y(G.alto_m) - 9; anc = "start"; }
      else if (horizontal) { tx = Math.max(ancho / 2 + 4, Math.min(W - ancho / 2 - 4, mx)); ty = st.sel === "tabique-superior-largo" ? my + 18 : my - 9; anc = "middle"; }
      else { var cabe = mx + 10 + ancho <= W - 4; tx = cabe ? mx + 10 : mx - 10; ty = my + 4; anc = cabe ? "start" : "end"; }
      s += '<text class="ev-tb ev-halo ev-cota-txt" x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="' + anc + '">' + txt + '</text>';
      return s + '</svg>';
    }
    function graficoDistancias(cont) {
      var W = Math.max(300, cont.clientWidth || 640), chico = W < 560, ml = chico ? 8 : 214, mr = 54, mt = 30, fila = chico ? 34 : 26, H = mt + filas.length * fila + 34;
      var x = function (v) { return ml + (v + 10) / 20 * (W - ml - mr); };
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc("Diferencia media entre los mapas y el plano para cada distancia, en centímetros. " + dentro + " de " + filas.length + " quedan dentro de una celda de 5 cm. Los tres pasillos suman " + signo(pasillos, 1) + " cm.") + '">';
      s += '<rect class="ev-banda" x="' + x(-5) + '" y="' + (mt - 6) + '" width="' + (x(5) - x(-5)) + '" height="' + (filas.length * fila + 8) + '"/>';
      [-10, -5, 0, 5, 10].forEach(function (v) { s += '<line class="ev-rejilla" x1="' + x(v) + '" x2="' + x(v) + '" y1="' + (mt - 6) + '" y2="' + (mt + filas.length * fila + 2) + '"/><text class="ev-t" x="' + x(v) + '" y="' + (H - 16) + '" text-anchor="middle">' + signo(v, 0) + '</text>'; });
      s += '<text class="ev-t" x="' + ((x(-10) + x(10)) / 2) + '" y="' + (H - 2) + '" text-anchor="middle">mapa − plano · cm</text>';
      s += '<text class="ev-t" x="' + x(0) + '" y="' + (mt - 12) + '" text-anchor="middle">± una celda de 5 cm</text>';
      filas.forEach(function (r, i) {
        var y0 = mt + i * fila, yc = y0 + fila / 2 + (chico ? 6 : 0), dif = r.diferencia_media_cm, sel = r.id === st.sel;
        var lo = (r.minimo_mapas_m - r.plano_m) * 100, hi = (r.maximo_mapas_m - r.plano_m) * 100;
        if (sel) s += '<rect class="ev-sel" x="0" y="' + y0 + '" width="' + W + '" height="' + fila + '"/>';
        if (chico) s += '<text class="ev-etq' + (sel ? ' sel' : '') + '" x="' + ml + '" y="' + (y0 + 11) + '">' + esc(CORTO[r.id]) + '</text>';
        else s += '<text class="ev-etq' + (sel ? ' sel' : '') + '" x="' + (ml - 8) + '" y="' + (yc + 4) + '" text-anchor="end">' + esc(CORTO[r.id]) + '</text>';
        s += '<rect class="ev-barra ' + esc(r.tipo) + '" x="' + Math.min(x(0), x(dif)) + '" y="' + (yc - 6) + '" width="' + Math.abs(x(dif) - x(0)) + '" height="12" rx="2"/>';
        s += '<line class="ev-rango" x1="' + x(Math.max(-10, lo)) + '" x2="' + x(Math.min(10, hi)) + '" y1="' + yc + '" y2="' + yc + '"/>';
        /* la cifra va en una columna a la derecha, para no cruzarse con la barra ni con el rango */
        s += '<text class="ev-t' + (sel ? ' ev-tsel' : '') + '" x="' + (W - 6) + '" y="' + (yc + 4) + '" text-anchor="end">' + signo(dif, 1) + '</text>';
      });
      s += '<line class="ev-cero" x1="' + x(0) + '" x2="' + x(0) + '" y1="' + (mt - 6) + '" y2="' + (mt + filas.length * fila + 2) + '"/>';
      return s + '</svg>';
    }
    function graficoIteraciones(cont) {
      var W = Math.max(300, cont.clientWidth || 640), ml = 74, mr = 16, mt = 16, fila = 42, H = mt + its.length * fila + 34, xMax = 14;
      var x = function (v) { return ml + v / xMax * (W - ml - mr); };
      var kMed = st.sentido === "plano" ? "plano_a_mapa_media_cm" : "mapa_a_plano_media_cm", kP = st.sentido === "plano" ? "plano_a_mapa_p95_cm" : "mapa_a_plano_p95_cm";
      var medias = its.map(function (r) { return r[kMed]; }), media = medias.reduce(function (a, b) { return a + b; }, 0) / medias.length;
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc("Distancia media y percentil 95 de cada mapa, " + (st.sentido === "plano" ? "del plano al mapa" : "del mapa al plano") + ". Media de las cinco: " + f(media, 2) + " cm.") + '">';
      s += '<rect class="ev-banda" x="' + x(0) + '" y="' + (mt - 6) + '" width="' + (x(5) - x(0)) + '" height="' + (its.length * fila + 8) + '"/>';
      [0, 2, 4, 6, 8, 10, 12, 14].forEach(function (v) { s += '<line class="ev-rejilla" x1="' + x(v) + '" x2="' + x(v) + '" y1="' + (mt - 6) + '" y2="' + (mt + its.length * fila + 2) + '"/><text class="ev-t" x="' + x(v) + '" y="' + (H - 16) + '" text-anchor="middle">' + v + '</text>'; });
      s += '<text class="ev-t" x="' + ((x(0) + x(xMax)) / 2) + '" y="' + (H - 2) + '" text-anchor="middle">distancia · cm</text>';
      s += '<line class="ev-media-linea" x1="' + x(media) + '" x2="' + x(media) + '" y1="' + (mt - 6) + '" y2="' + (mt + its.length * fila + 2) + '"/>';
      its.forEach(function (r, i) {
        var y0 = mt + i * fila;
        /* las cifras van sobre las barras, para que quepan también en un teléfono */
        s += '<text class="ev-t ev-halo" x="' + (x(0) + 2) + '" y="' + (y0 + 11) + '">media ' + f(r[kMed], 2) + ' cm, p95 ' + f(r[kP], 1) + ' cm</text>';
        s += '<text class="ev-etq" x="' + (ml - 8) + '" y="' + (y0 + 30) + '" text-anchor="end">Iteración ' + r.iteracion + '</text>';
        s += '<rect class="ev-barra p95" x="' + x(0) + '" y="' + (y0 + 15) + '" width="' + (x(r[kP]) - x(0)) + '" height="' + (fila - 19) + '" rx="2"/>';
        s += '<rect class="ev-barra pasillo" x="' + x(0) + '" y="' + (y0 + 20) + '" width="' + (x(r[kMed]) - x(0)) + '" height="' + (fila - 29) + '" rx="2"/>';
      });
      return s + '</svg>';
    }
    function pintar() {
      el.querySelectorAll("[data-v]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === st.vista)); });
      var cont = out("graf");
      var fig = out("plano");
      if (st.vista === "distancias") {
        fig.hidden = false;
        fig.innerHTML = '<figcaption><b>El plano medido con huincha</b><span>Esquema de la Fig. A8.1. El tabique inferior se dibuja aproximado, porque su largo no se midió.</span></figcaption>' + planoSVG(fig) +
          '<div class="vley"><span><i class="lin ink"></i>muro del plano</span><span><i class="lin-disc"></i>tabique de largo no medido</span><span><i class="lin azul"></i>distancia elegida</span></div>';
        out("sub").innerHTML = '<div class="ev-filas" role="group" aria-label="Elegir una distancia del plano">' + filas.map(function (r) { return '<button type="button" class="chip" data-fila="' + esc(r.id) + '" aria-pressed="' + (r.id === st.sel) + '">' + esc(CORTO[r.id]) + '</button>'; }).join("") + '</div>';
        cont.innerHTML = graficoDistancias(cont);
        out("ley").innerHTML = '<div class="vley"><span><i class="cu azul"></i>pasillo</span><span><i class="cu verde"></i>paso entre muros</span><span><i class="cu ambar"></i>tabique</span><span><i class="cu gris"></i>recinto</span><span><i class="lin ink"></i>rango de los cinco mapas</span><span><i class="cu verde-s"></i>dentro de una celda</span></div>';
        var r = filas.filter(function (x) { return x.id === st.sel; })[0], txt;
        out("datos").innerHTML = tarjetas([
          ["Distancia", esc(r.distancia), r.tipo === "tabique" ? "Tabique corto, dibujado con pocas celdas." : r.tipo === "pasillo" ? "Ancho libre entre dos muros." : r.tipo === "paso" ? "Hueco que deja un muro largo." : "Alto interior del recinto.", "t"],
          ["Plano, medido con huincha", f(r.plano_m, 2) + " m", "Fig. A8.1 de la tesis."],
          ["Los cinco mapas", f(r.media_mapas_m, 2) + " m", "De " + f(r.minimo_mapas_m, 2) + " a " + f(r.maximo_mapas_m, 2) + " m."],
          ["Diferencia media", signo(r.diferencia_media_cm, 1) + " cm", Math.abs(r.diferencia_media_cm) <= 5 ? "Menor que una celda de 5 cm." : "Mayor que una celda de 5 cm."]
        ]);
        if (r.tipo === "pasillo") txt = "Los tres pasillos suman " + signo(pasillos, 1) + " cm en los mapas, los 12 cm que informa la tesis. Como el plano registra distancias libres entre muros, el espesor de los dos muros largos explica a lo sumo 4 cm. El resto puede venir de la huincha o de una distorsión del mapa, y estos datos no permiten separarlos.";
        else if (r.tipo === "tabique") txt = "Las mayores diferencias, de 6 a 9 cm, están en los tabiques cortos, que quedan representados por pocas celdas ocupadas." + (r.id === "tabique-inferior" ? " El largo de este tabique no se midió, así que solo se compara su posición." : "");
        else txt = "Coincide con el plano con una diferencia menor que una celda. " + dentro + " de las " + filas.length + " distancias quedan dentro de ±5 cm.";
        out("lectura").textContent = txt;
      } else {
        fig.hidden = true; fig.innerHTML = "";
        out("sub").innerHTML = '<div class="chips" role="group" aria-label="Sentido de la distancia"><button type="button" class="chip" data-sentido="plano" aria-pressed="' + (st.sentido === "plano") + '">Del plano al mapa</button><button type="button" class="chip" data-sentido="mapa" aria-pressed="' + (st.sentido === "mapa") + '">Del mapa al plano</button></div>';
        cont.innerHTML = graficoIteraciones(cont);
        out("ley").innerHTML = '<div class="vley"><span><i class="cu azul"></i>distancia media</span><span><i class="cu azul-s"></i>percentil 95</span><span><i class="lin-disc"></i>media de los cinco mapas</span><span><i class="cu verde-s"></i>menos de una celda</span></div>';
        var kMed = st.sentido === "plano" ? "plano_a_mapa_media_cm" : "mapa_a_plano_media_cm", xs = its.map(function (r) { return r[kMed]; });
        var ic = S ? S.intervaloMedia(xs) : null, mn = Math.min.apply(null, xs), mx = Math.max.apply(null, xs);
        out("datos").innerHTML = tarjetas([
          ["Media de los cinco mapas", f(xs.reduce(function (a, b) { return a + b; }, 0) / xs.length, 2) + " cm", "De " + f(mn, 2) + " a " + f(mx, 2) + " cm según la iteración."],
          ["Intervalo al 95 %", ic ? f(ic.inf, 1) + " a " + f(ic.sup, 1) + " cm" : "no disponible", st.sentido === "plano" ? "Es el de la Tabla A8.4, con n = 5." : "Cálculo de esta guía con el mismo método."],
          ["Percentil 95", st.sentido === "plano" ? "8,4 cm" : "9,7 a 12,2 cm", st.sentido === "plano" ? "En conjunto, con las distancias de todos los puntos incluidos. No es el promedio de los percentiles." : "Por mapa, Tabla A8.2."],
          ["Puntos que se comparan", st.sentido === "plano" ? "92 a 93 %" : "celdas cerca del recinto", st.sentido === "plano" ? "Solo los del muro con una celda libre a menos de 10 cm." : "Solo las ocupadas dentro de la franja evaluada."]
        ]);
        out("lectura").textContent = st.sentido === "plano" ? "Cada punto del muro del plano, tomado cada 1 cm, se mide hasta la celda ocupada más cercana del mapa. La media es del orden de una celda de 5 cm, pero la resolución no es una cota del error: el percentil 95 llega a 8,4 cm." : "En el sentido inverso, cada celda ocupada se mide hasta el muro más cercano del plano. Las medias, de 4,09 a 4,94 cm, son algo mayores. Los percentiles describen cómo se reparten las distancias, no son intervalos de confianza.";
      }
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.hasAttribute("data-v")) st.vista = b.getAttribute("data-v");
      else if (b.hasAttribute("data-fila")) st.sel = b.getAttribute("data-fila");
      else if (b.hasAttribute("data-sentido")) st.sentido = b.getAttribute("data-sentido");
      else return;
      pintar();
      if (b.hasAttribute("data-fila") || b.hasAttribute("data-sentido")) { var igual = el.querySelector('[' + (b.hasAttribute("data-fila") ? 'data-fila="' + st.sel : 'data-sentido="' + st.sentido) + '"]'); if (igual) igual.focus(); }
    });
    el.estadoPlano = function () { return { vista: st.vista, sel: st.sel, sentido: st.sentido, pasillos: pasillos, dentro: dentro }; };
    pintar();
    U.alCambiarAncho(out("graf"), pintar);
  };

  /* ---------- 3. Cuánto dicen cinco repeticiones ---------- */
  V.repeticiones = function (el) {
    var D = window.PROYECTO, S = window.ESTADISTICA;
    if (!D || !D.ensayos || !S) throw new Error("Faltan los datos o el modelo estadístico.");
    var en = D.ensayos, val = en.mapeo.filter(function (r) { return r.valida === "si"; });
    var IND = [
      { id: "error_odometrico", t: "Error odométrico", u: "%", d: 2, x: en["recta-2m-real"].map(function (r) { return r.error_odometrico_pct; }), et: "Prueba", n: en["recta-2m-real"].map(function (r) { return r.prueba; }), src: "Tabla A6.2" },
      { id: "error_seguimiento", t: "Error de seguimiento", u: "%", d: 2, x: en["recta-2m-real"].map(function (r) { return Math.abs(r.distancia_real_m - r.distancia_teorica_m) / r.distancia_teorica_m * 100; }), et: "Prueba", n: en["recta-2m-real"].map(function (r) { return r.prueba; }), src: "Tabla A6.2, cinta frente a 2 m" },
      { id: "desviacion_angular", t: "Desviación angular", u: "°", d: 1, x: en["giro-real"].map(function (r) { return Math.abs(r.desviacion_grados); }), et: "Prueba", n: en["giro-real"].map(function (r) { return r.prueba; }), src: "Tabla A6.4, en valor absoluto" },
      { id: "cobertura_libre", t: "Índice de cobertura libre", u: "%", d: 1, x: val.map(function (r) { return r.cobertura_libre_pct; }), et: "Iteración", n: val.map(function (r) { return r.iteracion; }), src: "Tabla 5.4" },
      { id: "area_libre", t: "Área libre mapeada", u: "m²", d: 3, x: val.map(function (r) { return r.area_libre_m2; }), et: "Iteración", n: val.map(function (r) { return r.iteracion; }), src: "Tabla 5.4" },
      { id: "distancia_plano_mapa", t: "Distancia al plano", u: "cm", d: 2, x: D.analisis["plano-iteraciones"].map(function (r) { return r.plano_a_mapa_media_cm; }), et: "Iteración", n: D.analisis["plano-iteraciones"].map(function (r) { return r.iteracion; }), src: "Tabla A8.2" }
    ];
    var st = { ind: "error_odometrico", n: 5, k: val.length, total: en.mapeo.length };
    el.innerHTML =
      '<h4 class="vsub">La media y su intervalo de confianza al 95 %</h4>' +
      chips(IND.map(function (i) { return [i.id, i.t]; }), "data-ind", st.ind, "Indicador") +
      '<div class="ev-graf" data-o="recta"></div>' +
      '<label class="desl-linea" for="ev-n">Repeticiones, suponiendo la misma media y la misma dispersión <b class="num" data-o="n"></b><input id="ev-n" type="range" min="3" max="20" step="1" value="5"></label>' +
      '<div class="vley"><span><i class="pt azul"></i>cada repetición</span><span><i class="cu azul-s"></i>intervalo con las cinco</span><span><i class="lin ambar"></i>intervalo proyectado</span></div>' +
      '<div class="control-datos ev-datos" data-o="datos-m" aria-live="polite"></div>' +
      '<h4 class="vsub">Una proporción de éxitos: intervalo de Clopper y Pearson</h4>' +
      chips([["5-6", "5 de 6 · exploraciones válidas"], ["15-15", "15 de 15 · protocolo propuesto"], ["17-17", "17 de 17"]], "data-pre", "5-6", "Casos de ejemplo") +
      '<div class="ev-nums"><label for="ev-k">Éxitos<input id="ev-k" type="number" min="0" max="40" step="1" value="5"></label><label for="ev-t">Intentos<input id="ev-t" type="number" min="1" max="40" step="1" value="6"></label></div>' +
      '<div class="ev-graf" data-o="prop"></div>' +
      '<div class="control-datos ev-datos" data-o="datos-p" aria-live="polite"></div>' +
      '<p class="control-conclusion" data-o="lectura-p"></p>' +
      '<p class="vnota">Intervalos de la media con la distribución t de Student (Ec. A8.2) y de la proporción con el método exacto de Clopper y Pearson, como en la Tabla A8.4. Lo proyectado es un cálculo: un ensayo nuevo puede cambiar la media y la dispersión.</p>';
    var out = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
    var inN = el.querySelector("#ev-n"), inK = el.querySelector("#ev-k"), inT = el.querySelector("#ev-t");
    function ind() { return IND.filter(function (i) { return i.id === st.ind; })[0]; }
    function pintarMedia() {
      var I = ind(), ic = S.intervaloMedia(I.x), h3 = S.semiamplitud(ic.s, 3), hn = S.semiamplitud(ic.s, st.n);
      var lo = Math.min(Math.min.apply(null, I.x), ic.media - h3), hi = Math.max(Math.max.apply(null, I.x), ic.media + h3), pad = (hi - lo) * 0.06;
      lo -= pad; hi += pad;
      var cont = out("recta"), W = Math.max(300, cont.clientWidth || 640), ml = 18, mr = 18, H = 166, yb = 70;
      var x = function (v) { return ml + (v - lo) / (hi - lo) * (W - ml - mr); };
      var mk = marcasEje(lo, hi, W < 480 ? 4 : 7), dec = decimalesPaso(mk.paso);
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(I.t + ": media " + f(ic.media, I.d) + " " + I.u + ", intervalo al 95 % de " + f(ic.inf, I.d) + " a " + f(ic.sup, I.d) + ". Con " + st.n + " repeticiones y la misma dispersión: más o menos " + f(hn, I.d) + ".") + '">';
      mk.valores.forEach(function (v) { s += '<line class="ev-rejilla" x1="' + x(v) + '" x2="' + x(v) + '" y1="18" y2="' + (H - 38) + '"/><text class="ev-t" x="' + x(v) + '" y="' + (H - 22) + '" text-anchor="middle">' + rotulo(v, dec) + '</text>'; });
      s += '<text class="ev-etq" x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle">' + esc(I.t) + ', en ' + esc(I.u) + '</text>';
      s += '<rect class="ev-ic" x="' + x(ic.inf) + '" y="' + (yb - 18) + '" width="' + (x(ic.sup) - x(ic.inf)) + '" height="36" rx="4"/>';
      if (st.n !== 5) s += '<rect class="ev-ic-proy" x="' + x(ic.media - hn) + '" y="' + (yb - 26) + '" width="' + (x(ic.media + hn) - x(ic.media - hn)) + '" height="52" rx="4"/>';
      s += '<line class="ev-media" x1="' + x(ic.media) + '" x2="' + x(ic.media) + '" y1="' + (yb - 24) + '" y2="' + (yb + 24) + '"/>';
      var orden = I.x.map(function (v, i) { return { v: v, n: I.n[i] }; }).sort(function (a, b) { return a.v - b.v; }), previo = -Infinity, nivel = 0;
      orden.forEach(function (p) {
        var px = x(p.v);
        nivel = px - previo < 18 ? nivel + 1 : 0; previo = px;
        s += '<circle class="ev-punto" r="5.5" cx="' + px + '" cy="' + yb + '"/><text class="ev-t" x="' + px + '" y="' + (yb - 30 - nivel * 11) + '" text-anchor="middle">' + p.n + '</text>';
      });
      s += '<text class="ev-t" x="' + x(ic.media) + '" y="' + (yb + 40) + '" text-anchor="middle">media ' + f(ic.media, I.d) + '</text>';
      cont.innerHTML = s + '</svg>';
      out("n").textContent = st.n + (st.n === 5 ? " · las de la tesis" : " · proyección");
      var red = 1 - hn / ic.semi;
      out("datos-m").innerHTML = tarjetas([
        ["Media de las cinco", f(ic.media, I.d) + " " + I.u, I.src + "."],
        ["Desviación estándar", f(ic.s, I.d + 1) + " " + I.u, "Con n − 1 en el denominador."],
        ["Intervalo al 95 %, n = 5", f(ic.inf, I.d) + " a " + f(ic.sup, I.d) + " " + I.u, "t = " + f(ic.t, 3) + " con 4 grados de libertad."],
        ["Con n = " + st.n + " y la misma dispersión", "± " + f(hn, I.d) + " " + I.u, st.n === 5 ? "Es el intervalo de la tesis." : (red > 0 ? f(red * 100, 0) + " % más angosto que con cinco." : f(-red * 100, 0) + " % más ancho que con cinco.")]
      ]);
    }
    function pintarProp() {
      var c = S.clopperPearson(st.k, st.total), p = S.binomialCola(st.k, st.total, 0.5);
      var cont = out("prop"), W = Math.max(300, cont.clientWidth || 640), ml = 18, mr = 18, H = 96, yb = 42;
      var x = function (v) { return ml + v * (W - ml - mr); };
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(st.k + " de " + st.total + ": intervalo al 95 % de " + f(c.inf * 100, 1) + " % a " + f(c.sup * 100, 1) + " %.") + '">';
      [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function (v) { s += '<line class="ev-rejilla" x1="' + x(v) + '" x2="' + x(v) + '" y1="14" y2="' + (H - 26) + '"/><text class="ev-t" x="' + x(v) + '" y="' + (H - 10) + '" text-anchor="middle">' + Math.round(v * 100) + ' %</text>'; });
      [0.5, 0.8].forEach(function (v) { s += '<line class="ev-umbral" x1="' + x(v) + '" x2="' + x(v) + '" y1="10" y2="' + (H - 26) + '"/><text class="ev-t" x="' + (x(v) + 4) + '" y="12">' + Math.round(v * 100) + ' %</text>'; });
      s += '<rect class="ev-prop" x="' + x(c.inf) + '" y="' + (yb - 12) + '" width="' + Math.max(2, x(c.sup) - x(c.inf)) + '" height="24" rx="4"/><circle class="ev-prop-p" r="5" cx="' + x(c.p) + '" cy="' + yb + '"/>';
      cont.innerHTML = s + '</svg>';
      out("datos-p").innerHTML = tarjetas([
        ["Proporción observada", st.k + " de " + st.total + " = " + f(c.p * 100, 1) + " %", ""],
        ["Intervalo exacto al 95 %", f(c.inf * 100, 1) + " a " + f(c.sup * 100, 1) + " %", "Clopper y Pearson."],
        ["Lo que se puede afirmar", "más de " + f(c.inf * 100, 1) + " %", "Es el límite inferior del intervalo."],
        ["Prueba binomial frente a 50 %", "p = " + f(p, p < 0.001 ? 5 : 3), p < 0.05 ? "Se rechaza un 50 % al nivel de 0,05." : "No permite rechazar un 50 % al nivel de 0,05."]
      ]);
      var t = "Con " + st.k + " de " + st.total + " solo se puede afirmar, con 95 % de confianza, que la tasa supera el " + f(c.inf * 100, 1) + " %.";
      if (st.k === st.total) { var n80 = S.exitosSinFallas(0.8); t += st.total < n80 ? " Para pasar del 80 % harían falta al menos " + n80 + " intentos seguidos sin fallas." : " Supera el 80 %, porque son al menos " + n80 + " intentos sin fallas."; }
      else t += " Una sola falla pesa mucho cuando hay pocos intentos.";
      out("lectura-p").textContent = t;
    }
    function pintar() { pintarMedia(); pintarProp(); }
    function leerProp() {
      var t = Math.max(1, Math.min(40, Math.round(+inT.value || 1))), k = Math.max(0, Math.min(t, Math.round(+inK.value || 0)));
      st.total = t; st.k = k; inK.max = t;
      var pre = st.k + "-" + st.total;
      marcar(el, "data-pre", ["5-6", "15-15", "17-17"].indexOf(pre) >= 0 ? pre : "");
    }
    el.addEventListener("input", function (e) {
      if (e.target === inN) { st.n = +inN.value; pintarMedia(); }
      else if (e.target === inK || e.target === inT) { leerProp(); pintarProp(); }
    });
    el.addEventListener("change", function (e) { if (e.target === inK || e.target === inT) { inT.value = st.total; inK.value = st.k; } });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.hasAttribute("data-ind")) { st.ind = b.getAttribute("data-ind"); marcar(el, "data-ind", st.ind); pintarMedia(); }
      else if (b.hasAttribute("data-pre")) { var v = b.getAttribute("data-pre").split("-"); inK.value = v[0]; inT.value = v[1]; leerProp(); pintarProp(); }
    });
    el.estadoRepeticiones = function () { return { ind: st.ind, n: st.n, k: st.k, total: st.total }; };
    pintar();
    U.alCambiarAncho(out("recta"), pintar);
  };
})();
