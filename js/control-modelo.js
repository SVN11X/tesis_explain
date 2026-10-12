/* Cálculos del capítulo 4. Sin DOM, dependencias ni peticiones externas.
   Las simulaciones son didácticas: no sustituyen las capturas de la tesis. */
(function () {
  "use strict";
  var C = {};
  var datos = typeof module !== "undefined" && module.exports ? require("../datos/proyecto.js") : window.PROYECTO;
  /* Sin datos/proyecto.js no hay parámetros que mostrar: el módulo no se define y cada
     interactivo que lo necesita conserva su explicación de respaldo, con opción de reintentar. */
  if (!datos || !datos.parametros) { if (typeof console !== "undefined") console.warn("Faltan los parámetros de datos/proyecto.js; window.CONTROL no se define."); return; }
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
  /* Simulador PID ilustrativo de «Ajusta un PID». PID posicional con D sobre el error e
     integración condicional al saturar, sobre una planta de primer orden con la ganancia y la
     constante de tiempo del orden identificado para la rueda izquierda (Tabla A4.4). No es el
     firmware: su ley, su escala y sus enteros se tratan en los otros interactivos. */
  C.PID_ILUSTRATIVO = { REF: 0.13, DT: 1 / 30, T: 6, K: 0.000913, TAU: 0.33, ZONA: 60 };
  C.simularPID = function (c) {
    var S = C.PID_ILUSTRATIVO, y = 0, I = 0, ePrev = 0, out = [];
    for (var t = 0; t <= S.T + 1e-9; t += S.DT) {
      var e = S.REF - y;
      I += e * S.DT;
      var d = (e - ePrev) / S.DT; ePrev = e;
      var u = c.kp * e + c.ki * I + c.kd * d;
      var us = Math.max(-255, Math.min(255, u));
      if (us !== u && c.ki) I -= e * S.DT;          /* integración condicional al saturar */
      var efectivo = us;
      if (c.zona) efectivo = Math.abs(us) < S.ZONA ? 0 : us - Math.sign(us) * S.ZONA;
      y += S.DT / S.TAU * (S.K * efectivo * (c.zona ? 255 / (255 - S.ZONA) : 1) - y);
      out.push([t, y, us]);
    }
    return out;
  };
  /* Lecturas del gráfico: el último segundo (30 muestras) se toma como valor estabilizado. */
  C.medidasPID = function (d) {
    var S = C.PID_ILUSTRATIVO, finv = d.slice(-30).reduce(function (a, p) { return a + p[1]; }, 0) / 30, maxv = Math.max.apply(null, d.map(function (p) { return p[1]; }));
    var t10 = null, t90 = null; d.forEach(function (p) { if (t10 == null && p[1] >= .1 * S.REF) t10 = p[0]; if (t90 == null && p[1] >= .9 * S.REF) t90 = p[0]; });
    var tope = d.filter(function (p) { return Math.abs(p[2]) >= 255; }).length;
    return { fin: finv, err: Math.abs(S.REF - finv), os: maxv > S.REF * 1.005 ? (maxv - S.REF) / S.REF * 100 : 0, tr: (t10 != null && t90 != null) ? t90 - t10 : null, tope: tope * S.DT };
  };
  /* Interpretación por reglas. Cada lectura declara la condición que la activó y el cálculo
     que la respalda, para que se pueda comprobar con los números de la pantalla. */
  C.lecturaPID = function (c, m) {
    var S = C.PID_ILUSTRATIVO, out = [];
    function f(v, n) { return (Math.round(v * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n).replace(".", ","); }
    if (!c.kp && !c.ki) {
      out.push({ id: "sin-control", texto: "Sin P ni I no hay una orden sostenida: la rueda no sigue la referencia.", condicion: "P = 0 e I = 0", calculo: "Con el error estable, la derivada vale 0 y la orden también." });
      return out;
    }
    if (!c.ki && !c.zona) {
      var teo = S.REF / (1 + S.K * c.kp);
      out.push({ id: "error-sin-integral", texto: "Sin I queda un error permanente. Para sostener una velocidad v el motor necesita v/K PWM, y con solo P esa orden existe únicamente si queda error.",
        condicion: "I = 0 y sin zona muerta", calculo: "error = referencia / (1 + K·P) = " + f(S.REF, 2) + " / (1 + " + String(S.K).replace(".", ",") + " · " + c.kp + ") = " + f(teo, 3) + " m/s. El gráfico mide " + f(m.err, 3) + " m/s." });
    } else if (!c.ki && c.zona) {
      out.push({ id: "zona-sin-integral", texto: "Con zona muerta y sin I el error crece: los primeros " + S.ZONA + " PWM no mueven la rueda y la orden solo los supera con más error.", condicion: "I = 0 y zona muerta activa", calculo: "Error final medido: " + f(m.err, 3) + " m/s." });
    } else if (m.err < 0.001) {
      out.push({ id: "integral-elimina", texto: "La memoria integral sostiene la orden que necesita la rueda sin dejar error" + (c.zona ? ", aunque haya zona muerta" : "") + ".", condicion: "I > 0 y error final < 0,001 m/s", calculo: "Error final medido: " + f(m.err, 4) + " m/s." });
    } else {
      out.push({ id: "integral-lenta", texto: "La integral todavía no termina de corregir en los 6 s simulados.", condicion: "I > 0 y error final ≥ 0,001 m/s", calculo: "Error final medido: " + f(m.err, 3) + " m/s." });
    }
    if (m.os > 2) out.push({ id: "sobreimpulso", texto: "La rueda supera la referencia. " + (c.ki ? "La integral acumulada durante la subida solo se descarga con error negativo, es decir, pasándose." : "La derivada sobre el error empuja en el arranque."), condicion: "sobreimpulso > 2 %", calculo: "Máximo " + f(m.os, 0) + " % sobre 0,13 m/s." });
    if (m.tope > 0) out.push({ id: "saturacion", texto: "La orden llegó al tope de 255 PWM. Mientras está en el tope, subir P no acelera la respuesta.", condicion: "|orden| = 255 en alguna muestra", calculo: "Tiempo en el tope: " + f(m.tope, 2) + " s." });
    if (m.tr === null) out.push({ id: "no-llega", texto: "La velocidad no alcanza el 90 % de la referencia, así que no hay tiempo de subida.", condicion: "nunca llega a 0,117 m/s", calculo: "Velocidad final " + f(m.fin, 3) + " m/s." });
    return out;
  };
  C.registro = function (velocidad) { return Math.round((velocidad + 1e-10) * 100) / 100; };
  C.promedio = function (muestras) { return muestras.reduce(function (a, b) { return a + b; }, 0) / muestras.length; };
  if (typeof module !== "undefined" && module.exports) module.exports = C;
  else window.CONTROL = C;
})();
