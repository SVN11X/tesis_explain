/* Cálculos del capítulo 4. Sin DOM, dependencias ni peticiones externas.
   Las simulaciones son didácticas: no sustituyen las capturas de la tesis. */
(function () {
  "use strict";
  var C = {};
  var datos = typeof module !== "undefined" && module.exports ? require("../datos/proyecto.js") : window.PROYECTO;
  var p = datos.parametros.control;
  C.TS = p.periodo_planificador_s;
  C.FACTOR = p.ticks_por_ciclo_por_m_s; // conversión nominal a 30 Hz, no medida del reloj real
  C.REF = p.referencia_m_s;
  C.MAX = p.pwm_max;
  C.RUEDAS = p.ruedas;
  C.GANANCIAS = p.ganancias;
  C.limitar = function (x) { return Math.max(-C.MAX, Math.min(C.MAX, x)); };
  /* Orden de doPID: error entero, banda, incremento entero, saturación,
     actualización de ITerm solo si NO se alcanzó el límite. */
  C.ciclo = function (g, s) {
    var bruto = s.ref - s.med, entero = Math.trunc(bruto);
    var enBanda = Math.abs(entero) <= g.banda, error = enBanda ? 0 : entero;
    var cambio = s.med - s.ant, p = g.Kp * error, d = g.Kd * cambio;
    var numerador = p - d + s.integral, deltaReal = numerador / g.Ko;
    var delta = Math.trunc(deltaReal), pedido = s.salida + delta;
    var saturado = Math.abs(pedido) >= C.MAX;
    var integralReal = s.integral + g.Ki * error;
    return { bruto: bruto, entero: entero, error: error, enBanda: enBanda, cambio: cambio,
      p: p, d: d, numerador: numerador, deltaReal: deltaReal, delta: delta,
      pedido: pedido, salida: C.limitar(pedido), saturado: saturado,
      integralReal: integralReal, integral: saturado ? s.integral : Math.trunc(integralReal) };
  };
  C.telescopio = function (med, n, ganancia) {
    var cambios = [], suma = 0;
    for (var i = 1; i <= n; i++) { var d = med[i] - med[i - 1]; cambios.push(d); suma += d; }
    return { cambios: cambios, suma: suma, diferencia: med[n] - med[0], pwm: -ganancia * suma };
  };
  C.papeles = function (g, termino, escenario) {
    var med = escenario === "constante" ? [36, 36, 36, 36, 36, 36, 36] : [0, 12, 25, 36, 40, 40, 40];
    var out = [], u = 0, integral = 0;
    for (var i = 0; i < med.length; i++) {
      var error = 40 - med[i], cambio = med[i] - (i ? med[i - 1] : med[0]);
      var delta = termino === "Kp" ? g.Kp * error / g.Ko : termino === "Kd" ? -g.Kd * cambio / g.Ko : integral / g.Ko;
      u += delta;
      out.push({ ciclo: i + 1, med: med[i], error: error, cambio: cambio, delta: delta, acumulado: u, integral: integral });
      integral += g.Ki * error;
    }
    return out;
  };
  /* Un ciclo completamente bloqueado: velocidad cero. Compara la memoria de
     un PI posicional con ganancias equivalentes y la del firmware descrito. */
  C.bloqueo = function (g, n) {
    var r = C.REF * C.FACTOR, integral = 0, salida = 0, it = 0, ult;
    for (var k = 0; k < n; k++) {
      integral += g.Kp / g.Ko * r;
      ult = C.ciclo(g, { ref: r, med: 0, ant: 0, integral: it, salida: salida });
      salida = ult.salida; it = ult.integral;
    }
    var pedido = g.Kd / g.Ko * r + integral;
    return { tradicional: { pedido: pedido, aplicado: C.limitar(pedido), integral: integral },
      firmware: { pedido: ult ? ult.pedido : 0, aplicado: salida, integral: it, saturado: !!ult && ult.saturado } };
  };
  /* PID tradicional con D=0 para aislar el windup. P e I equivalen a los
     coeficientes efectivos del firmware con Ki=0, referencia fija y sin
     enteros/bandas. Al habilitar la protección, se usa clamping direccional.
     El firmware conserva sus tres ganancias, enteros y bandas documentadas.
     El encoder se aproxima al tick más cercano; el bloqueo es hipotético. */
  C.windup = function (rueda, duracion, proteger) {
    var g = C.RUEDAS[rueda], dt = C.TS, inicio = 1.5, T = 12;
    var resultados = {};
    ["tradicional", "firmware"].forEach(function (tipo) {
      var velocidad = 0, integral = 0, salida = 0, anterior = 0, ordenes = [], datos = [];
      var atraso = Math.round(g.retardo / dt);
      for (var n = 0; n <= Math.round(T / dt); n++) {
        var t = n * dt, trabada = t >= inicio && t < inicio + duracion;
        if (trabada) velocidad = 0;
        var med = Math.round(velocidad * C.FACTOR), error = C.REF * C.FACTOR - med, pedido;
        if (tipo === "tradicional") {
          var nuevaI = integral + g.Kp / g.Ko * error;
          pedido = g.Kd / g.Ko * error + nuevaI;
          if (proteger && ((pedido > C.MAX && error > 0) || (pedido < -C.MAX && error < 0))) {
            pedido = g.Kd / g.Ko * error + integral;
          } else integral = nuevaI;
          salida = C.limitar(pedido);
        } else {
          var c = C.ciclo(g, { ref: C.REF * C.FACTOR, med: med, ant: anterior, integral: integral, salida: salida });
          pedido = c.pedido; salida = c.salida; integral = c.integral;
        }
        datos.push({ t: t, velocidad: velocidad, pedido: pedido, aplicado: salida, integral: integral, med: med, trabada: trabada });
        anterior = med; ordenes.push(salida);
        var alMotor = n >= atraso ? ordenes[n - atraso] : 0;
        if (!trabada) velocidad += dt / g.tau * (g.K * alMotor - velocidad);
      }
      resultados[tipo] = datos;
    });
    resultados.liberacion = inicio + duracion;
    return resultados;
  };
  /* Serie del bloqueo, ciclo a ciclo, para dibujar cómo crece cada memoria. */
  C.bloqueoSerie = function (g, N) {
    var r = C.REF * C.FACTOR, integral = 0, salida = 0, it = 0, out = [{ ciclo: 0, pedidoTradicional: 0, guardadoFirmware: 0, iterm: 0 }];
    for (var k = 1; k <= N; k++) {
      integral += g.Kp / g.Ko * r;
      var c = C.ciclo(g, { ref: r, med: 0, ant: 0, integral: it, salida: salida });
      salida = c.salida; it = c.integral;
      out.push({ ciclo: k, pedidoTradicional: g.Kd / g.Ko * r + integral, guardadoFirmware: salida, iterm: it });
    }
    return out;
  };
  /* Tiempo que la orden aplicada sigue en ±255 justo después de liberar la rueda. */
  C.tiempoEnTope = function (serie, liberacion) {
    var i = 0;
    while (i < serie.length && serie[i].t < liberacion - 1e-9) i++;
    var inicio = i;
    while (i < serie.length && Math.abs(serie[i].aplicado) >= C.MAX) i++;
    return (i - inicio) * C.TS;
  };
  /* Respuesta del modelo FOPDT a un escalón de PWM aplicado en t = 0.
     v(t) = 0 antes del retardo; después, K·PWM·(1 − e^(−(t − retardo)/tau)). */
  C.fopdt = function (g, pwm, t) {
    if (t < g.retardo) return 0;
    return g.K * pwm * (1 - Math.exp(-(t - g.retardo) / g.tau));
  };
  C.registro = function (velocidad) { return Math.round((velocidad + 1e-10) * 100) / 100; };
  C.promedio = function (muestras) { return muestras.reduce(function (a, b) { return a + b; }, 0) / muestras.length; };
  if (typeof module !== "undefined" && module.exports) module.exports = C;
  else window.CONTROL = C;
})();
