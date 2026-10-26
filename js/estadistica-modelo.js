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

  if (typeof module !== "undefined" && module.exports) module.exports = S;
  else window.ESTADISTICA = S;
})();
