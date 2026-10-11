/* Cálculos del capítulo 3. Sin DOM, dependencias ni peticiones externas.
   Las mediciones son las de la tesis (Tabla A6.2 y sección 4.3.3). Las trayectorias
   simuladas son didácticas: ruedas sin deslizamiento, giros ideales y sin ruido salvo que se pida.
   En Node: var M = require("../js/movimiento-modelo.js"). En el navegador: window.MOVIMIENTO. */
(function () {
  "use strict";
  var M = {};
  M.R = 0.0335;   // radio de rueda configurado, m
  M.B = 0.188;    // separación entre ruedas configurada, m
  M.NE = 1980;    // flancos por vuelta de rueda que usa el firmware
  M.HZ = 30;      // ciclos por segundo de la interfaz con ROS 2
  M.VMAX = 0.13;  // límite de velocidad del controlador diferencial, m/s
  M.WMAX = 0.35;  // límite de giro del controlador diferencial, rad/s
  M.CONTEO = { der: 1976, izq: 1969 };   // promedios medidos en diez vueltas por rueda

  /* Ensayo de la recta de 2 m en el robot real. Tabla A6.2. El error odométrico de cada
     prueba se toma de la tabla, que lo calcula antes de redondear las distancias. */
  M.RECTA = [
    { prueba: 1, odo: 1.920, cinta: 1.846, error: 4.01 },
    { prueba: 2, odo: 1.922, cinta: 1.868, error: 2.88 },
    { prueba: 3, odo: 1.923, cinta: 1.851, error: 3.87 },
    { prueba: 4, odo: 1.926, cinta: 1.856, error: 3.78 },
    { prueba: 5, odo: 1.928, cinta: 1.861, error: 3.61 }
  ];
  M.CINTA_MEDIA = 1.856;

  function envolver(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
  M.envolver = envolver;

  /* Cinemática directa. vl y vr en m/s, b en m. R con signo: positivo si el centro de giro
     queda a la izquierda del robot (giro antihorario), Infinity si va recto. */
  M.cinematica = function (vl, vr, b) {
    b = b || M.B;
    var v = (vr + vl) / 2, w = (vr - vl) / b;
    return { v: v, w: w, R: Math.abs(w) < 1e-12 ? Infinity : v / w };
  };
  /* Cinemática inversa, la que aplica el controlador diferencial. */
  M.ruedas = function (v, w, b) {
    b = b || M.B;
    return { vl: v - w * b / 2, vr: v + w * b / 2 };
  };
  /* Distancia de cada rueda al centro de giro, con signo igual al de R. */
  M.radiosRuedas = function (R, b) {
    b = b || M.B;
    return { izq: R - b / 2, der: R + b / 2 };
  };
  M.ticksPorCiclo = function (vRueda) { return vRueda / (2 * Math.PI * M.R) * M.NE / M.HZ; };
  /* Avance de una rueda por cada flanco, en metros, contando los cuatro flancos o solo uno por ciclo. */
  M.resolucion = function (porCiclo) { return 2 * Math.PI * M.R / (porCiclo === 1 ? M.NE / 4 : M.NE); };

  /* Avance exacto con v y w constantes durante dt, sobre un arco de circunferencia. */
  M.avanzar = function (p, v, w, dt) {
    var th = p.th, nth = th + w * dt;
    if (Math.abs(w) < 1e-12) return { x: p.x + v * dt * Math.cos(th), y: p.y + v * dt * Math.sin(th), th: th };
    var R = v / w;
    return { x: p.x + R * (Math.sin(nth) - Math.sin(th)), y: p.y - R * (Math.cos(nth) - Math.cos(th)), th: nth };
  };
  /* Mueve la pose según el avance real de cada rueda, dl y dr en metros, con separación b. */
  M.mover = function (p, dl, dr, b) {
    return M.avanzar(p, (dl + dr) / 2, (dr - dl) / b, 1);
  };

  M.estadistica = function (xs) {
    var n = xs.length, media = 0, s = 0;
    xs.forEach(function (x) { media += x; });
    media /= n;
    xs.forEach(function (x) { s += (x - media) * (x - media); });
    return { n: n, media: media, desv: n > 1 ? Math.sqrt(s / (n - 1)) : 0 };
  };
  /* Error odométrico en %, (odometría − cinta) / cinta. */
  M.errorPct = function (odo, cinta) { return (odo - cinta) / cinta * 100; };
  /* Factor que deja en cero el error medio de esas repeticiones: dividir la odometría por él. */
  M.factor = function (errores) { return 1 + M.estadistica(errores).media / 100; };
  M.corregir = function (errores, factor) {
    return errores.map(function (e) { return ((1 + e / 100) / factor - 1) * 100; });
  };

  /* Números pseudoaleatorios repetibles, para que la misma semilla dé las mismas repeticiones. */
  M.azar = function (semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  M.normal = function (rnd) {
    var u = 0, v = 0;
    while (u <= 1e-12) u = rnd();
    v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  /* Repeticiones simuladas: el mismo sesgo en todas y una variación aleatoria distinta en cada una. */
  M.repeticiones = function (sesgo, variacion, semilla, n) {
    var rnd = M.azar(semilla), out = [];
    for (var i = 0; i < (n || 5); i++) out.push(sesgo + variacion * M.normal(rnd));
    return out;
  };

  /* Diferencia entre ruedas que produce contar distinto por vuelta. Con radios iguales y el mismo
     conteo en las dos ruedas, cada rueda avanza en proporción inversa a sus flancos por vuelta. */
  M.diferenciaDeConteos = function (nDer, nIzq, nConf) {
    nConf = nConf || M.NE;
    return {
      ruedas: nIzq / nDer - 1,                          // avance derecha / avance izquierda − 1
      escala: nConf * (1 / nDer + 1 / nIzq) / 2 - 1      // avance real medio / odometría − 1
    };
  };
  /* Desvío lateral al final de un tramo que la odometría cree recto, por una diferencia entre ruedas. */
  M.desvioLateral = function (dif, largo, b) {
    b = b || M.B;
    var q = 1 + dif, giro = 2 * largo * (q - 1) / ((1 + q) * b);
    if (Math.abs(giro) < 1e-12) return { giro: 0, lateral: 0 };
    return { giro: giro, lateral: largo / giro * (1 - Math.cos(giro)) };
  };

  /* Cuadrado recorrido según la propia odometría, como en el método de Borenstein y Feng.
     dif: la rueda derecha avanza (1 + dif) veces lo que la izquierda por el mismo conteo,
     con el promedio igual al configurado. sep: la separación efectiva es (1 + sep) veces 18,8 cm.
     sentido: +1 antihorario, −1 horario. Cada tramo y cada giro se integran en pasos cortos. */
  M.cuadrado = function (o) {
    var lado = o.lado || 1, sentido = o.sentido || 1, q = 1 + (o.dif || 0), bReal = M.B * (1 + (o.sep || 0)), N = o.pasos || 60;
    var fd = 2 * q / (1 + q), fi = 2 / (1 + q);            // avance real por metro que cree la odometría
    var p = { x: 0, y: 0, th: sentido > 0 ? 0 : Math.PI / 2 }, th0 = p.th, real = [[0, 0]], odo = [[0, 0]];
    var giroTramo = 0, giroEsquina = 0;
    function trozo(dl, dr) {
      var a = p.th;
      for (var i = 0; i < N; i++) { p = M.mover(p, dl / N, dr / N, bReal); real.push([p.x, p.y]); }
      return p.th - a;
    }
    var q0 = { x: 0, y: 0, th: th0 };
    for (var k = 0; k < 4; k++) {
      giroTramo = trozo(lado * fi, lado * fd);
      q0 = M.avanzar(q0, lado, 0, 1); odo.push([q0.x, q0.y]);
      var arco = sentido * (M.B / 2) * (Math.PI / 2);          // lo que la odometría manda a cada rueda
      giroEsquina = trozo(-arco * fi, arco * fd);
      q0 = { x: q0.x, y: q0.y, th: q0.th + sentido * Math.PI / 2 };
    }
    var dx = p.x, dy = p.y;
    return {
      real: real, odo: odo, fin: p, dx: dx, dy: dy, error: Math.hypot(dx, dy),
      errorRumbo: envolver(p.th - th0),
      giroTramo: giroTramo, giroEsquina: giroEsquina
    };
  };
  /* Resultado del método en los dos sentidos. El indicador del método es el mayor de los dos errores. */
  M.bidireccional = function (o) {
    var h = M.cuadrado(Object.assign({}, o, { sentido: -1 })), a = M.cuadrado(Object.assign({}, o, { sentido: 1 }));
    return { horario: h, antihorario: a, mayor: Math.max(h.error, a.error) };
  };

  if (typeof module !== "undefined" && module.exports) module.exports = M;
  else window.MOVIMIENTO = M;
})();
