/* Pruebas de propiedades y casos numéricos del capítulo 4.
   Uso: node herramientas/pruebas_control.js */
"use strict";
var assert = require("node:assert/strict"), C = require("../js/control-modelo.js");
var total = 0;
function comprobar(nombre, prueba) { prueba(); total++; console.log("  ok   " + nombre); }
function cerca(a, b) { assert.ok(Math.abs(a - b) < 1e-9, a + " ≠ " + b); }
function ciclo(rueda, valores) {
  return C.ciclo(C.RUEDAS[rueda], Object.assign({ ref: 40, med: 36, ant: 36, integral: 0, salida: 100 }, valores));
}
comprobar("0,13 m/s se convierte a 40,7628 ticks/ciclo y ROS trunca a 40", function () {
  cerca(C.REF * C.FACTOR, 40.7628); assert.equal(Math.trunc(C.REF * C.FACTOR), 40);
  cerca(.35 * .188 / 2 * C.FACTOR, 10.316124);
});
comprobar("Error estacionario no confunde promedio con resolución", function () {
  cerca(.13 - .128, .002); cerca(C.promedio([.13,.12,.13,.13,.13,.13,.12,.13,.13,.13]), .128);
});
comprobar("Sumar diferencias deja final menos inicial, también con inicio distinto de cero", function () {
  [0, 30, -12].forEach(function (base) {
    var med = [0,4,8,10,10,9].map(function (v) { return base + v; });
    for (var n = 1; n < med.length; n++) { var r = C.telescopio(med, n, .401); cerca(r.suma, med[n] - base); cerca(r.pwm, -.401 * (med[n] - base)); }
  });
});
comprobar("Kp acumula un error constante a ritmo constante", function () {
  var datos = C.papeles(C.RUEDAS.der, "Kp", "constante");
  datos.forEach(function (p, i) { cerca(p.delta, 1.3136); cerca(p.acumulado, (i + 1) * 1.3136); });
});
comprobar("Kd deja de crecer si la medición deja de cambiar", function () {
  var d = C.papeles(C.RUEDAS.der, "Kd", "arranque");
  cerca(d[4].acumulado, -20.05 / 50 * 40); cerca(d[5].delta, 0); cerca(d[6].acumulado, d[4].acumulado);
});
comprobar("Ki añade la memoria anterior: doble suma y un ciclo de demora", function () {
  var d = C.papeles(C.RUEDAS.izq, "Ki", "constante");
  d.forEach(function (p, i) { cerca(p.delta, .075 * 4 * i / 50); cerca(p.acumulado, .075 * 4 / 50 * i * (i + 1) / 2); });
});
comprobar("Incrementos de 0,9852 y 1,642 PWM se guardan como 0 y 1", function () {
  var a = ciclo("der", { med: 37, ant: 37 }), b = ciclo("der", { med: 35, ant: 35 });
  cerca(a.deltaReal, .9852); assert.equal(a.delta, 0); cerca(b.deltaReal, 1.642); assert.equal(b.delta, 1);
});
comprobar("La banda cambia con la rueda; truncar hacia cero es anterior a la banda", function () {
  assert.equal(ciclo("der", { med: 38, ant: 38 }).error, 2);
  assert.equal(ciclo("izq", { med: 38, ant: 38 }).error, 0);
  assert.equal(ciclo("der", { ref: 40.76, med: 39, ant: 39 }).error, 0);
});
comprobar("ITerm izquierdo crece desde cero con 14 ticks positivos, no con 13", function () {
  assert.equal(ciclo("izq", { med: 27, ant: 27 }).integral, 0);
  assert.equal(ciclo("izq", { med: 26, ant: 26 }).integral, 1);
  assert.equal(ciclo("der", { med: 0, ant: 0 }).integral, 0);
});
comprobar("Un ITerm no nulo puede decrecer por una fracción negativa", function () {
  assert.equal(ciclo("izq", { med: 43, ant: 43, integral: 5 }).integral, 4);
});
comprobar("Ambos topes congelan ITerm y guardan PWM limitado, incluyendo igualdad", function () {
  [[255,40,40],[255,0,0],[-255,80,80]].forEach(function (v) {
    var r = ciclo("izq", { salida: v[0], med: v[1], ant: v[2], integral: 0 });
    assert.ok(r.saturado); assert.equal(r.integral, 0); assert.ok(Math.abs(r.salida) === 255);
  });
});
comprobar("Bloquear más ciclos infla la memoria tradicional sin superar el PWM aplicado", function () {
  var a = C.bloqueo(C.RUEDAS.der, 30), b = C.bloqueo(C.RUEDAS.der, 90);
  assert.ok(b.tradicional.pedido > a.tradicional.pedido);
  assert.equal(a.firmware.aplicado, 255); assert.equal(b.firmware.aplicado, 255);
  assert.equal(a.firmware.pedido, b.firmware.pedido); assert.equal(a.firmware.integral, b.firmware.integral);
});
comprobar("Simulación finita, bloqueo visible y topes físicos para ambas ruedas", function () {
  ["der", "izq"].forEach(function (rueda) { [1,2,3,4].forEach(function (duracion) {
    var r = C.windup(rueda, duracion, false);
    ["tradicional", "firmware"].forEach(function (tipo) {
      r[tipo].forEach(function (p) { assert.ok(Number.isFinite(p.velocidad) && Number.isFinite(p.pedido)); assert.ok(Math.abs(p.aplicado) <= 255); if (p.trabada) assert.equal(p.velocidad, 0); });
    });
  }); });
});
comprobar("Un PID tradicional también puede proteger su memoria y reducir el pico", function () {
  ["der", "izq"].forEach(function (rueda) {
    var sin = C.windup(rueda, 3, false), con = C.windup(rueda, 3, true);
    function pico(r) { return Math.max(...r.tradicional.filter(function (p) { return p.t > r.liberacion; }).map(function (p) { return p.velocidad; })); }
    assert.ok(pico(con) < pico(sin));
    assert.ok(Math.max(...sin.tradicional.map(function (p) { return p.pedido; })) > 1000);
    assert.ok(Math.max(...con.tradicional.map(function (p) { return p.pedido; })) <= 255);
  });
});
comprobar("Redondear dos decimales puede ocultar 0,132 m/s, pero cambia al cruzar 0,135", function () {
  assert.equal(C.registro(.132), .13); assert.equal(C.registro(.134), .13); assert.equal(C.registro(.135), .14);
});
comprobar("El modelo FOPDT llega a K·PWM, cruza el 63 % en retardo + τ y no se mueve antes del retardo", function () {
  ["izq", "der"].forEach(function (rueda) {
    var g = C.RUEDAS[rueda];
    cerca(C.fopdt(g, 143, 50), g.K * 143);
    assert.ok(Math.abs(C.fopdt(g, 143, g.retardo + g.tau) - (1 - Math.exp(-1)) * g.K * 143) < 1e-12);
    assert.equal(C.fopdt(g, 143, g.retardo / 2), 0);
    cerca(C.fopdt(g, 0, 1), 0);
    cerca(C.fopdt(g, 200, 1) / C.fopdt(g, 100, 1), 2); // lineal: sin zona muerta
  });
  assert.ok(Math.abs(C.fopdt(C.RUEDAS.izq, 143, 50) - .1306) < 5e-4 && Math.abs(C.fopdt(C.RUEDAS.der, 143, 50) - .1273) < 5e-4);
});
comprobar("Durante el bloqueo, el pedido tradicional crece sin límite y la salida del firmware se queda en 255", function () {
  ["der", "izq"].forEach(function (rueda) {
    var g = C.RUEDAS[rueda], s = C.bloqueoSerie(g, 90);
    assert.equal(s.length, 91);
    for (var k = 1; k < s.length; k++) {
      assert.ok(s[k].pedidoTradicional > s[k - 1].pedidoTradicional);
      assert.ok(s[k].guardadoFirmware <= 255 && s[k].guardadoFirmware >= s[k - 1].guardadoFirmware);
    }
    assert.equal(s[90].guardadoFirmware, 255);
    var b = C.bloqueo(g, 30); cerca(s[30].pedidoTradicional, b.tradicional.pedido); assert.equal(s[30].guardadoFirmware, b.firmware.aplicado);
  });
  assert.equal(C.bloqueoSerie(C.RUEDAS.der, 90)[90].iterm, 0); // Ki 0,001 no alcanza a guardar nada
});
comprobar("Tras liberar, el PI sin protección sigue más tiempo en el tope que el firmware y que el PI protegido", function () {
  ["der", "izq"].forEach(function (rueda) {
    [1, 2, 3, 4].forEach(function (d) {
      var sin = C.windup(rueda, d, false), con = C.windup(rueda, d, true);
      var tSin = C.tiempoEnTope(sin.tradicional, sin.liberacion), tFw = C.tiempoEnTope(sin.firmware, sin.liberacion), tCon = C.tiempoEnTope(con.tradicional, con.liberacion);
      assert.ok(tSin > tFw && tSin > tCon && tSin > 1, rueda + " " + d + " s");
    });
  });
  var corto = C.windup("der", 1, false), largo = C.windup("der", 4, false);
  assert.ok(C.tiempoEnTope(largo.tradicional, largo.liberacion) > C.tiempoEnTope(corto.tradicional, corto.liberacion));
});
comprobar("Simulador PID ilustrativo: con solo P el error final coincide con referencia / (1 + K·P)", function () {
  var S = C.PID_ILUSTRATIVO;
  [300, 1200, 2400, 3000].forEach(function (kp) {
    var d = C.simularPID({ kp: kp, ki: 0, kd: 0, zona: false }), m = C.medidasPID(d);
    assert.ok(Math.abs(m.err - S.REF / (1 + S.K * kp)) < 5e-4, "P = " + kp + ": " + m.err);
    /* la fórmula vale porque en el último segundo la orden ya no está en el tope */
    assert.ok(d.slice(-30).every(function (p) { return Math.abs(p[2]) < 255; }), "sin saturación al final con P = " + kp);
  });
  /* D no cambia el valor final cuando el error ya no varía */
  var conD = C.medidasPID(C.simularPID({ kp: 1200, ki: 0, kd: 40, zona: false })), sinD = C.medidasPID(C.simularPID({ kp: 1200, ki: 0, kd: 0, zona: false }));
  assert.ok(Math.abs(conD.err - sinD.err) < 5e-4);
});
comprobar("Lecturas por regla: cada ejemplo activa reglas con condición y cálculo comprobables", function () {
  function ids(c) { var m = C.medidasPID(C.simularPID(c)); return C.lecturaPID(c, m).map(function (r) { assert.ok(r.texto && r.condicion && r.calculo); return r.id; }); }
  assert.deepEqual(ids({ kp: 1200, ki: 0, kd: 0, zona: false }), ["error-sin-integral", "no-llega"]);
  assert.deepEqual(ids({ kp: 600, ki: 2600, kd: 0, zona: false }), ["integral-elimina"]);
  assert.ok(ids({ kp: 1500, ki: 9000, kd: 0, zona: false }).indexOf("sobreimpulso") >= 0);
  assert.ok(ids({ kp: 1500, ki: 9000, kd: 25, zona: false }).indexOf("saturacion") >= 0);
  assert.deepEqual(ids({ kp: 1200, ki: 0, kd: 0, zona: true }).slice(0, 1), ["zona-sin-integral"]);
  assert.deepEqual(ids({ kp: 0, ki: 0, kd: 10, zona: false }), ["sin-control"]);
  /* El texto del cálculo repite el valor que muestra el gráfico */
  var c = { kp: 1200, ki: 0, kd: 0, zona: false }, m = C.medidasPID(C.simularPID(c));
  assert.ok(C.lecturaPID(c, m)[0].calculo.indexOf("= 0,062 m/s") > 0);
});
comprobar("El respaldo sin JavaScript de «Ajusta un PID» repite las cifras del modelo y su figura está al día", function () {
  var fs = require("fs"), path = require("path"), D = require("./diagramas_control.js");
  var html = fs.readFileSync(path.join(__dirname, "../control.html"), "utf8");
  var texto = html.split("data-respaldo-pid>")[1].split("</p>")[0];
  function f(v, n) { return (Math.round(v * Math.pow(10, n) + 1e-9) / Math.pow(10, n)).toFixed(n).replace(".", ","); }
  var c = D.cifras();
  [f(c[0].fin, 3) + " m/s", f(c[0].err, 3) + " m/s", f(c[1].tr, 2) + " s", f(c[2].tr, 2) + " s", f(c[2].os, 1) + " %"].forEach(function (cifra) {
    assert.ok(texto.indexOf(cifra) >= 0, "falta " + cifra + " en el respaldo");
  });
  assert.ok(c[1].err < 1e-4 && c[2].err < 1e-4 && c[0].tr === null);
  assert.equal(fs.readFileSync(path.join(__dirname, "../img/diagramas/pid-respaldo.svg"), "utf8"), D.pidRespaldo() + "\n", "regenera con node herramientas/diagramas_control.js");
});
console.log("\n" + total + " pruebas de control correctas");
