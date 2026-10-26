/* Estabilidad del lazo de velocidad, Anexo 4.12 de la tesis. Sin DOM ni dependencias.
   Reproduce el análisis lineal de AnalisisEstabilidadPID.py: el modelo FOPDT de cada rueda
   discretizado con el período de 33 ms, el retenedor del PWM, la medición del firmware como
   velocidad media del ciclo anterior y la ley de doPID sin saturación, banda del error ni
   truncamientos. Es un modelo lineal: no prueba la estabilidad del programa no lineal.
   Node: require('./estabilidad-modelo.js'); navegador: window.ESTABILIDAD. */
(function () {
  "use strict";
  var datos = typeof module !== "undefined" && module.exports ? require("../datos/proyecto.js") : window.PROYECTO;
  if (!datos || !datos.parametros) { if (typeof console !== "undefined") console.warn("Faltan los parámetros de datos/proyecto.js; window.ESTABILIDAD no se define."); return; }
  var pc = datos.parametros.control, pm = datos.parametros.movimiento;
  var E = {};
  E.T = pc.periodo_planificador_s;                 // 33 ms programados en el firmware
  E.TCAP = pc.periodo_captura_s;                   // 0,1 s del ensayo de identificación
  E.KO = pc.ruedas.izq.Ko;
  E.KAPPA = pm.flancos_vuelta * E.T / (2 * Math.PI * pm.radio_m); // ticks por período para 1 m/s
  E.RUEDAS = pc.ruedas;
  E.PSO = {};
  pc.ganancias.forEach(function (g) { ["izq", "der"].forEach(function (r) { (E.PSO[r] = E.PSO[r] || {})[g.nombre] = g[r][0]; }); });
  E.KD_EVALUADO = pc.kd_evaluado_por_costo;
  E.ORIGINALES = pc.ganancias_originales_firmware;

  /* Polinomios como en numpy: coeficientes de la potencia mayor a la menor. */
  function mul(a, b) {
    var r = new Array(a.length + b.length - 1).fill(0);
    for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) r[i + j] += a[i] * b[j];
    return r;
  }
  function sumar(a, b) {
    var n = Math.max(a.length, b.length), r = new Array(n).fill(0);
    for (var i = 0; i < a.length; i++) r[n - a.length + i] += a[i];
    for (var j = 0; j < b.length; j++) r[n - b.length + j] += b[j];
    return r;
  }
  function escalar(a, k) { return a.map(function (v) { return v * k; }); }
  /* Evalúa un polinomio real en z = re + i·im con el método de Horner. */
  function evaluar(p, re, im) {
    var a = p[0], b = 0;
    for (var i = 1; i < p.length; i++) { var t = a * re - b * im + p[i]; b = a * im + b * re; a = t; }
    return [a, b];
  }
  function div(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function prod(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  E.mul = mul; E.sumar = sumar;

  /* Planta discreta de PWM a ticks por período: FOPDT con retenedor de orden cero, retardo
     Ld = (d + delta)·T y la medición como promedio del período anterior. */
  E.planta = function (Km, tau, Ld) {
    var T = E.T, K = Km * E.KAPPA, a = Math.exp(-T / tau), g = tau * (1 - a) / T;
    var q = Ld / T, d = Math.floor(q + 1e-12), de = q - d, ad = Math.pow(a, 1 - de);
    var cn = (1 - de) - (tau / T) * (1 - ad), co = de - (tau / T) * (ad - a);
    var N = sumar(mul([cn, co], [1, -a]), [g * (1 - ad), g * (ad - a)]);
    var den = mul([1, -a], [1].concat(new Array(d + 2).fill(0)));
    return { num: escalar(N, K), den: den, info: { K: K, a: a, gamma: g, d: d, delta: de } };
  };
  /* Ley de doPID linealizada. Sin Ki es un PI incremental; con Ki tratado como lineal agrega
     una segunda integración, el caso más desfavorable de la rueda izquierda. */
  E.controlador = function (Kp, Kd, Ki) {
    var kI = Kp / E.KO, kP = Kd / E.KO, kII = (Ki || 0) / E.KO;
    if (kII === 0) return { num: [kI + kP, -kP], den: [1, -1] };
    return { num: sumar(sumar(escalar([1, -1, 0], kI), escalar([1, -2, 1], kP)), escalar([0, 1, 0], kII)), den: [1, -2, 1] };
  };
  E.caracteristico = function (P, C, retardoExtra) {
    var denL = mul(mul(P.den, C.den), [1].concat(new Array(retardoExtra || 0).fill(0)));
    return sumar(denL, mul(P.num, C.num));
  };

  /* Raíces de un polinomio real con el método de Aberth y pulido de Newton.
     Las raíces exactas en cero se separan antes para no frenar la convergencia. */
  E.raices = function (coef) {
    var p = coef.slice();
    while (p.length && Math.abs(p[0]) < 1e-300) p.shift();
    var ceros = 0;
    while (p.length > 1 && p[p.length - 1] === 0) { p.pop(); ceros++; }
    var n = p.length - 1, out = [], k;
    for (k = 0; k < ceros; k++) out.push([0, 0]);
    if (n < 1) return out;
    var a0 = p[0];
    p = p.map(function (v) { return v / a0; });
    var dp = p.slice(0, -1).map(function (v, i) { return v * (n - i); });
    var R = 0;
    for (k = 1; k <= n; k++) R = Math.max(R, Math.pow(Math.abs(p[k]), 1 / k));
    R = Math.max(R * 2, 1e-3);
    var z = [];
    for (k = 0; k < n; k++) { var ang = 2 * Math.PI * k / n + 0.4; z.push([R * Math.cos(ang), R * Math.sin(ang)]); }
    for (var it = 0; it < 800; it++) {
      var mayor = 0;
      for (k = 0; k < n; k++) {
        var f = evaluar(p, z[k][0], z[k][1]), fp = evaluar(dp, z[k][0], z[k][1]);
        if (f[0] === 0 && f[1] === 0) continue;
        var cociente = div(f, fp), s = [0, 0];
        for (var j = 0; j < n; j++) if (j !== k) { var dz = [z[k][0] - z[j][0], z[k][1] - z[j][1]]; var inv = div([1, 0], dz); s[0] += inv[0]; s[1] += inv[1]; }
        var w = div(cociente, [1 - (cociente[0] * s[0] - cociente[1] * s[1]), -(cociente[0] * s[1] + cociente[1] * s[0])]);
        z[k] = [z[k][0] - w[0], z[k][1] - w[1]];
        mayor = Math.max(mayor, Math.hypot(w[0], w[1]) / Math.max(1, Math.hypot(z[k][0], z[k][1])));
      }
      if (mayor < 1e-15) break;
    }
    for (k = 0; k < n; k++) {
      for (var pulido = 0; pulido < 3; pulido++) {
        var fk = evaluar(p, z[k][0], z[k][1]), fpk = evaluar(dp, z[k][0], z[k][1]);
        if (fpk[0] === 0 && fpk[1] === 0) break;
        var paso = div(fk, fpk);
        z[k] = [z[k][0] - paso[0], z[k][1] - paso[1]];
      }
      out.push(z[k]);
    }
    return out;
  };
  E.polos = function (P, C, retardoExtra) { return E.raices(E.caracteristico(P, C, retardoExtra)); };
  E.poloMayor = function (P, C, retardoExtra) {
    return E.polos(P, C, retardoExtra).reduce(function (m, r) { return Math.max(m, Math.hypot(r[0], r[1])); }, 0);
  };
  E.estable = function (P, C, retardoExtra) { return E.poloMayor(P, C, retardoExtra) < 1; };

  /* Respuesta en frecuencia del lazo abierto L(e^{jωT}) para ω entre 1e-3 y casi π/T. */
  E.lazo = function (P, C, w) {
    var x = Math.cos(w * E.T), y = Math.sin(w * E.T);
    return prod(div(evaluar(P.num, x, y), evaluar(P.den, x, y)), div(evaluar(C.num, x, y), evaluar(C.den, x, y)));
  };
  function angulo(L) { return Math.atan2(L[1], L[0]); }
  function envolver(x) { return Math.atan2(Math.sin(x), Math.cos(x)); }
  /* Márgenes como en la función margenes() del script: primer cruce de |L| por 1 y primer
     cruce de la fase desenrollada por −π. Una malla gruesa ubica los cruces y una bisección
     los afina; la sensibilidad máxima se afina con una búsqueda de sección áurea. */
  E.margenes = function (P, C, n) {
    n = n || 20000;
    var w0 = 1e-3, w1 = Math.PI / E.T * 0.9999, h = (w1 - w0) / (n - 1);
    var ws = new Float64Array(n), mag = new Float64Array(n), fase = new Float64Array(n), S = new Float64Array(n);
    var previa = 0, acum = 0;
    for (var i = 0; i < n; i++) {
      var w = w0 + i * h, L = E.lazo(P, C, w), a = angulo(L);
      if (i) { var salto = a - previa; acum += Math.round(-salto / (2 * Math.PI)) * 2 * Math.PI; }
      previa = a;
      ws[i] = w; mag[i] = Math.hypot(L[0], L[1]); fase[i] = a + acum;
      S[i] = 1 / Math.hypot(1 + L[0], L[1]);
    }
    function faseEn(w, i) { return fase[i] + envolver(angulo(E.lazo(P, C, w)) - (fase[i] - 2 * Math.PI * Math.round(fase[i] / (2 * Math.PI)))); }
    function biseccion(fn, lo, hi) { for (var k = 0; k < 80; k++) { var m = 0.5 * (lo + hi); if (fn(m) > 0) lo = m; else hi = m; } return 0.5 * (lo + hi); }
    var r = { wc: NaN, pm: NaN, dm: NaN, w180: NaN, gm: NaN, gmDb: NaN, Ms: NaN };
    for (i = 0; i < n - 1; i++) if (mag[i] >= 1 && mag[i + 1] < 1) {
      var ic = i;
      r.wc = biseccion(function (w) { var L = E.lazo(P, C, w); return Math.hypot(L[0], L[1]) - 1; }, ws[ic], ws[ic + 1]);
      var fc = faseEn(r.wc, ic);
      r.pm = (Math.PI + fc) * 180 / Math.PI;
      r.dm = (Math.PI + fc) / r.wc;
      break;
    }
    for (i = 0; i < n - 1; i++) if (fase[i] > -Math.PI && fase[i + 1] <= -Math.PI) {
      var i2 = i;
      r.w180 = biseccion(function (w) { return faseEn(w, i2) + Math.PI; }, ws[i2], ws[i2 + 1]);
      var L180 = E.lazo(P, C, r.w180);
      r.gm = 1 / Math.hypot(L180[0], L180[1]);
      r.gmDb = 20 * Math.log10(r.gm);
      break;
    }
    var im = 0;
    for (i = 1; i < n; i++) if (S[i] > S[im]) im = i;
    var lo = ws[Math.max(0, im - 1)], hi = ws[Math.min(n - 1, im + 1)], g = (Math.sqrt(5) - 1) / 2;
    function sens(w) { var L = E.lazo(P, C, w); return 1 / Math.hypot(1 + L[0], L[1]); }
    for (var k = 0; k < 60; k++) { var x1 = hi - g * (hi - lo), x2 = lo + g * (hi - lo); if (sens(x1) > sens(x2)) hi = x2; else lo = x1; }
    r.Ms = Math.max(S[im], sens(0.5 * (lo + hi)));
    return r;
  };

  /* Ganancias de cada conjunto, en la escala interna del firmware. */
  E.ganancias = function (rueda, conjunto) {
    var g = E.RUEDAS[rueda];
    if (conjunto === "pso-evaluado") return { Kp: E.PSO[rueda].Kp, Kd: E.KD_EVALUADO, Ki: 0 };
    if (conjunto === "pso-informado") return { Kp: E.PSO[rueda].Kp, Kd: E.PSO[rueda].Kd, Ki: 0 };
    if (conjunto === "original") return { Kp: E.ORIGINALES.Kp, Kd: E.ORIGINALES.Kd, Ki: E.ORIGINALES.Ki };
    return { Kp: g.Kp, Kd: g.Kd, Ki: 0 };
  };
  /* Caso completo. o: { rueda, conjunto, Ld, kiLineal, multGanancia, tau }.
     Sin opciones, reproduce la fila sin retardo de la Tabla A4.5 para esa rueda. */
  E.analizar = function (o) {
    var g = E.RUEDAS[o.rueda], gan = E.ganancias(o.rueda, o.conjunto || "definitivas");
    var Ki = o.kiLineal && (o.conjunto || "definitivas") === "definitivas" ? g.Ki : gan.Ki;
    var tau = o.tau == null ? g.tau : o.tau, Km = g.K * (o.multGanancia == null ? 1 : o.multGanancia);
    var P = E.planta(Km, tau, o.Ld || 0), C = E.controlador(gan.Kp, gan.Kd, Ki);
    var polos = E.polos(P, C), mayor = polos.reduce(function (m, z) { return Math.max(m, Math.hypot(z[0], z[1])); }, 0);
    var m = E.margenes(P, C, o.n);
    return { P: P, C: C, Kp: gan.Kp, Kd: gan.Kd, Ki: Ki, tau: tau, Km: Km, Ld: o.Ld || 0, polos: polos, poloMayor: mayor, estable: mayor < 1,
      wc: m.wc, Twc: E.T * m.wc, pm: m.pm, dm: m.dm, w180: m.w180, gm: m.gm, gmDb: m.gmDb, Ms: m.Ms,
      retardoCritico: (o.Ld || 0) + m.dm, d: P.info.d, delta: P.info.delta };
  };
  /* PI incremental equivalente sin el término de Ki: Kc = Kd/Ko y Ti = T·Kd/Kp. */
  E.equivalente = function (rueda) {
    var g = E.RUEDAS[rueda];
    return { Kc: g.Kd / E.KO, KcTsobreTi: g.Kp / E.KO, Ti: E.T * g.Kd / g.Kp };
  };
  /* Multiplicador de la ganancia de la planta en que se pierde la estabilidad (bisección). */
  E.gananciaCritica = function (o, lo, hi) {
    lo = lo == null ? 0.1 : lo; hi = hi == null ? 500 : hi;
    var g = E.RUEDAS[o.rueda], gan = E.ganancias(o.rueda, o.conjunto || "definitivas");
    var Ki = o.kiLineal && (o.conjunto || "definitivas") === "definitivas" ? g.Ki : gan.Ki;
    var tau = o.tau == null ? g.tau : o.tau, C = E.controlador(gan.Kp, gan.Kd, Ki);
    function ok(m) { return E.estable(E.planta(g.K * m, tau, o.Ld || 0), C); }
    if (ok(hi)) return Infinity;
    if (!ok(lo)) return lo;
    for (var k = 0; k < 60; k++) { var mid = 0.5 * (lo + hi); if (ok(mid)) lo = mid; else hi = mid; }
    return lo;
  };
  /* Banda de insensibilidad: mayor error constante que no cambia la salida, con Iint = 0. */
  E.bandaInsensibilidad = function (Kp, I) {
    var e = 0;
    while (Math.trunc((Kp * (e + 1) + (I || 0)) / E.KO) === 0) e++;
    return e;
  };
  /* Puntos de la curva de Nyquist para dibujar, con ω en escala logarítmica. */
  E.nyquist = function (P, C, n) {
    n = n || 400;
    var a = Math.log(0.05), b = Math.log(Math.PI / E.T * 0.999), out = [];
    for (var i = 0; i < n; i++) { var w = Math.exp(a + (b - a) * i / (n - 1)); var L = E.lazo(P, C, w); out.push({ w: w, re: L[0], im: L[1] }); }
    return out;
  };

  if (typeof module !== "undefined" && module.exports) module.exports = E;
  else window.ESTABILIDAD = E;
})();
