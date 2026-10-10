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
console.log("\n" + total + " pruebas de control correctas");
