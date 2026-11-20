/* Alcance estadístico de los ensayos, Sección 5.6 y Anexo 8.6 de la tesis. Sin DOM ni dependencias.
   Intervalo de confianza de la media con la distribución t de Student, intervalo exacto de
   Clopper y Pearson para una proporción y prueba binomial exacta unilateral.
   Node: require('./estadistica-modelo.js'); navegador: window.ESTADISTICA. */
(function () {
  "use strict";
  var S = {};
  /* Logaritmo de la función gamma, aproximación de Lanczos (g = 7). */
  var LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  S.lnGamma = function (x) {
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - S.lnGamma(1 - x);
    x -= 1;
    var a = LANCZOS[0], t = x + 7.5;
    for (var i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  /* Fracción continua de la beta incompleta, método de Lentz modificado. */
  function fraccion(a, b, x) {
    var MIN = 1e-300, c = 1, d = 1 - (a + b) * x / (a + 1);
    if (Math.abs(d) < MIN) d = MIN;
    d = 1 / d;
    var h = d;
    for (var m = 1; m <= 500; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN; c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN; d = 1 / d; h *= d * c;
      aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
      d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN; c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN; d = 1 / d;
      var del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }
  /* Beta incompleta regularizada I_x(a, b). */
  S.betaInc = function (x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var ln = S.lnGamma(a + b) - S.lnGamma(a) - S.lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
    if (x < (a + 1) / (a + b + 2)) return Math.exp(ln) * fraccion(a, b, x) / a;
    return 1 - Math.exp(ln) * fraccion(b, a, 1 - x) / b;
  };
  function biseccion(f, lo, hi) { for (var k = 0; k < 200; k++) { var m = 0.5 * (lo + hi); if (f(m)) hi = m; else lo = m; } return 0.5 * (lo + hi); }
  /* Distribución t de Student con gl grados de libertad. */
  S.tAcumulada = function (t, gl) {
    var cola = 0.5 * S.betaInc(gl / (gl + t * t), gl / 2, 0.5);
    return t >= 0 ? 1 - cola : cola;
  };
  S.tCuantil = function (p, gl) {
    if (p === 0.5) return 0;
    if (p < 0.5) return -S.tCuantil(1 - p, gl);
    return biseccion(function (t) { return S.tAcumulada(t, gl) >= p; }, 0, 1e4);
  };
  S.betaCuantil = function (p, a, b) { return biseccion(function (x) { return S.betaInc(x, a, b) >= p; }, 0, 1); };
  S.media = function (xs) { return xs.reduce(function (s, x) { return s + x; }, 0) / xs.length; };
  /* Desviación estándar muestral, con n − 1 en el denominador. */
  S.desviacion = function (xs) {
    var m = S.media(xs);
    return Math.sqrt(xs.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (xs.length - 1));
  };
  /* Semiamplitud t·s/√n del intervalo de la media, Ec. A8.2. */
  S.semiamplitud = function (s, n, nivel) {
    nivel = nivel || 0.95;
    return S.tCuantil(1 - (1 - nivel) / 2, n - 1) * s / Math.sqrt(n);
  };
  S.intervaloMedia = function (xs, nivel) {
    nivel = nivel || 0.95;
    if (xs.length < 2) throw new Error("El intervalo de la media necesita al menos dos repeticiones.");
    var n = xs.length, m = S.media(xs), s = S.desviacion(xs), t = S.tCuantil(1 - (1 - nivel) / 2, n - 1), h = t * s / Math.sqrt(n);
    return { n: n, media: m, s: s, t: t, semi: h, inf: m - h, sup: m + h };
  };
  /* Intervalo exacto de Clopper y Pearson para k éxitos en n intentos. */
  S.clopperPearson = function (k, n, nivel) {
    nivel = nivel || 0.95;
    var a = (1 - nivel) / 2;
    return { k: k, n: n, p: k / n, inf: k === 0 ? 0 : S.betaCuantil(a, k, n - k + 1), sup: k === n ? 1 : S.betaCuantil(1 - a, k + 1, n - k) };
  };
  /* P(X ≥ k) para X binomial con n intentos y probabilidad p: prueba exacta unilateral. */
  S.binomialCola = function (k, n, p) {
    var suma = 0;
    for (var i = k; i <= n; i++) suma += Math.exp(S.lnGamma(n + 1) - S.lnGamma(i + 1) - S.lnGamma(n - i + 1) + i * Math.log(p) + (n - i) * Math.log(1 - p));
    return Math.min(1, suma);
  };
  /* Menor n que reduce la semiamplitud a una fracción de la actual, con la misma dispersión. */
  S.repeticionesPara = function (s, n0, fraccionObjetivo, nivel) {
    var h0 = S.semiamplitud(s, n0, nivel);
    for (var n = n0; n < 1000; n++) if (S.semiamplitud(s, n, nivel) <= fraccionObjetivo * h0 + 1e-12) return n;
    return Infinity;
  };
  /* Menor número de éxitos seguidos, sin fallas, para que el límite inferior supere un valor. */
  S.exitosSinFallas = function (limite, nivel) {
    for (var n = 1; n < 10000; n++) if (S.clopperPearson(n, n, nivel).inf >= limite) return n;
    return Infinity;
  };

  /* Reto de la sección «Cuánto dicen cinco repeticiones». Las cifras salen de 5 éxitos en 6 intentos (Tabla A8.4) y del
     límite de 0,80. Vive en el modelo, sin DOM, para probarse con Node. */
  function coma(v, d) { return v.toFixed(d).replace(".", ","); }
  S.reto = function () {
    var cp = S.clopperPearson(5, 6), p = S.binomialCola(5, 6, 0.5), inf = coma(cp.inf * 100, 1) + " %", sup = coma(cp.sup * 100, 1) + " %", n80 = S.exitosSinFallas(0.8);
    return [{
      pregunta: "Cinco de seis exploraciones fueron válidas, un 83,3 %. ¿Qué se puede afirmar de la tasa de éxito?",
      opciones: [
        { id: "limite", texto: "Que supera el " + inf, ok: true, porque: "El intervalo exacto al 95 % va de " + inf + " a " + sup + ", y su límite inferior es lo único que se puede afirmar con seis intentos." },
        { id: "exacta", texto: "Que es 83,3 %", ok: false, porque: "83,3 % es lo observado en estos seis intentos. El intervalo al 95 % va de " + inf + " a " + sup + ", así que la tasa verdadera puede ser mucho menor." },
        { id: "mitad", texto: "Que supera el 50 %", ok: false, porque: "La prueba binomial da p = " + coma(p, 6) + ", mayor que 0,05, y no basta para descartar una tasa de 50 %. El límite inferior, " + inf + ", queda bajo el 50 %." }
      ],
      enlace: "#sim-repeticiones", enlaceTexto: "Intervalos de confianza con los datos de la tesis"
    }, {
      pregunta: "¿Cuántas ejecuciones seguidas sin fallas harían falta para afirmar que la tasa supera el 80 %?",
      opciones: [
        { id: "seis", texto: "6", ok: false, porque: "Con seis de seis el límite inferior es " + coma(S.clopperPearson(6, 6).inf * 100, 1) + " %, lejos del 80 %. Seis de seis solo bastaría para descartar una moneda, con p = 1/64." },
        { id: "diez", texto: "10", ok: false, porque: "Diez es el objetivo de repeticiones por condición, pero diez de diez dan un límite inferior de " + coma(S.clopperPearson(10, 10).inf * 100, 1) + " %, todavía bajo el 80 %." },
        { id: "diecisiete", texto: String(n80), ok: true, porque: "Con " + (n80 - 1) + " éxitos seguidos el límite inferior es " + coma(S.clopperPearson(n80 - 1, n80 - 1).inf * 100, 1) + " %, y con " + n80 + " pasa a " + coma(S.clopperPearson(n80, n80).inf * 100, 1) + " %, ya sobre el 80 %." }
      ],
      enlace: "#cuantas-repeticiones", enlaceTexto: "¿Cuántas repeticiones harían falta?"
    }];
  };
  /* Respuesta a la opción j de la pregunta i, o null si no existe. */
  S.evaluarReto = function (i, j) {
    var q = S.reto()[i], o = q && q.opciones[j];
    return o ? { ok: o.ok, porque: o.porque, enlace: q.enlace, enlaceTexto: q.enlaceTexto } : null;
  };

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else window.ESTADISTICA = S;
})();
