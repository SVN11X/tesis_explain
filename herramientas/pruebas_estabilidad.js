/* Pruebas del análisis de estabilidad del lazo de velocidad (Anexo 4.12).
   Comparan el modelo de js/estabilidad-modelo.js con la Tabla A4.5 de la tesis y con las
   cifras del texto. Uso: node herramientas/pruebas_estabilidad.js */
"use strict";
var assert = require("node:assert/strict");
var E = require("../js/estabilidad-modelo.js"), D = require("../datos/proyecto.js");
var total = 0;
function comprobar(nombre, prueba) { prueba(); total++; console.log("  ok   " + nombre); }
function cerca(a, b, tol, que) { assert.ok(Math.abs(a - b) <= tol, (que || "") + " " + a + " ≠ " + b + " ± " + tol); }
var CASOS = { izquierda_sin_ki: { rueda: "izq" }, izquierda_con_ki: { rueda: "izq", kiLineal: true }, derecha: { rueda: "der" } };

comprobar("la conversión del análisis usa 33 ms: 310,42 ticks por período para 1 m/s", function () {
  cerca(E.KAPPA, 310.42, 0.005);
});
comprobar("sin Ki la ley equivale a un PI incremental con Kc de 0,41 y 0,40 y Ti de 42 y 40 ms", function () {
  var i = E.equivalente("izq"), d = E.equivalente("der");
  cerca(i.Kc, 0.406, 1e-9); cerca(d.Kc, 0.401, 1e-9);
  cerca(i.Ti * 1000, 41.9, 0.05); cerca(d.Ti * 1000, 40.3, 0.05);
  assert.equal(Math.round(i.Ti * 1000), 42); assert.equal(Math.round(d.Ti * 1000), 40);
});
comprobar("el modelo reproduce cada fila de la Tabla A4.5, con el redondeo de la tesis", function () {
  assert.equal(D.analisis.estabilidad.length, 6);
  D.analisis.estabilidad.forEach(function (f) {
    var r = E.analizar(Object.assign({ Ld: f.retardo_s }, CASOS[f.caso])), que = f.caso + " Ld=" + f.retardo_s;
    cerca(r.poloMayor, f.polo_max, 0.0006, que + " polo");
    cerca(r.pm, f.margen_fase_grados, 0.051, que + " fase");
    cerca(r.gmDb, f.margen_ganancia_db, 0.051, que + " ganancia");
    cerca(r.dm, f.margen_retardo_s, 0.0051, que + " retardo");
    cerca(r.Ms, f.sensibilidad_maxima, 0.0051, que + " Ms");
    assert.ok(r.estable, que + " estable");
  });
});
comprobar("márgenes de fase de 53° a 57° sin retardo y de 41° a 44° con 0,1 s, Ms de 1,35 a 1,85", function () {
  var sin = Object.keys(CASOS).map(function (k) { return E.analizar(CASOS[k]); });
  var con = Object.keys(CASOS).map(function (k) { return E.analizar(Object.assign({ Ld: 0.1 }, CASOS[k])); });
  sin.forEach(function (r) { assert.ok(r.pm > 53 && r.pm < 57 && r.Ms > 1.34 && r.Ms < 1.40); });
  con.forEach(function (r) { assert.ok(r.pm > 40.5 && r.pm < 44.5 && r.Ms > 1.77 && r.Ms < 1.86); });
  var menor = Math.min.apply(null, sin.map(function (r) { return r.dm; }));
  cerca(menor, 0.42, 0.005, "menor margen de retardo sin retardo");
});
comprobar("el producto del período por la frecuencia de cruce es cercano a 0,07, dentro de 0,05 a 0,14", function () {
  ["izq", "der"].forEach(function (r) { var a = E.analizar({ rueda: r }); assert.ok(a.Twc > 0.07 && a.Twc < 0.075, a.Twc); });
});
comprobar("al subir el retardo de 0 a 0,1 s todos los márgenes empeoran de forma monótona", function () {
  ["izq", "der"].forEach(function (r) {
    var ant = null;
    for (var i = 0; i <= 10; i++) {
      var a = E.analizar({ rueda: r, Ld: i / 100 });
      if (ant) assert.ok(a.pm < ant.pm && a.gmDb < ant.gmDb && a.dm < ant.dm && a.Ms > ant.Ms, r + " " + i);
      ant = a;
    }
  });
});
comprobar("las ganancias del PSO dan 64° a 71° sin retardo, 53° a 62° con 0,1 s y Ms de 1,15 a 1,52", function () {
  var todos = [];
  ["izq", "der"].forEach(function (r) { ["pso-evaluado", "pso-informado"].forEach(function (c) { [0, 0.1].forEach(function (Ld) { todos.push({ Ld: Ld, a: E.analizar({ rueda: r, conjunto: c, Ld: Ld }) }); }); }); });
  var pm0 = todos.filter(function (x) { return x.Ld === 0; }).map(function (x) { return x.a.pm; });
  var pm1 = todos.filter(function (x) { return x.Ld === 0.1; }).map(function (x) { return x.a.pm; });
  var ms = todos.map(function (x) { return x.a.Ms; });
  cerca(Math.min.apply(null, pm0), 63.8, 0.05); cerca(Math.max.apply(null, pm0), 70.9, 0.05);
  cerca(Math.min.apply(null, pm1), 53.2, 0.05); cerca(Math.max.apply(null, pm1), 62.1, 0.05);
  cerca(Math.min.apply(null, ms), 1.150, 0.005); cerca(Math.max.apply(null, ms), 1.522, 0.005);
});
comprobar("las ganancias originales del firmware dan 49° a 50° sin retardo, 35° con 0,1 s y Ms de hasta 2,18", function () {
  var a = ["izq", "der"].map(function (r) { return [E.analizar({ rueda: r, conjunto: "original" }), E.analizar({ rueda: r, conjunto: "original", Ld: 0.1 })]; });
  a.forEach(function (p) { assert.ok(p[0].pm > 49 && p[0].pm < 50 && Math.round(p[1].pm) === 35); });
  cerca(Math.max(a[0][1].Ms, a[1][1].Ms), 2.18, 0.005);
});
comprobar("el barrido de la tesis: sin retardo no hay inestables, y con 0,1 s se pierde la estabilidad desde 4,4 veces, o 2,8 con Ki lineal", function () {
  function barrido(o) {
    var inest = 0, minimo = Infinity;
    for (var i = 0; i < 25; i++) {
      var tau = 0.05 + i * (3 - 0.05) / 24;
      minimo = Math.min(minimo, E.gananciaCritica(Object.assign({ tau: tau }, o)));
      for (var j = 0; j < 25; j++) {
        var mult = Math.pow(10, -1 + 2 * j / 24), g = E.RUEDAS[o.rueda], gan = E.ganancias(o.rueda, "definitivas");
        if (!E.estable(E.planta(g.K * mult, tau, o.Ld), E.controlador(gan.Kp, gan.Kd, o.kiLineal ? g.Ki : 0))) inest++;
      }
    }
    return { inest: inest, minimo: minimo };
  }
  var izq0 = barrido({ rueda: "izq", Ld: 0 }), der0 = barrido({ rueda: "der", Ld: 0 }), izq0ki = barrido({ rueda: "izq", Ld: 0, kiLineal: true });
  assert.equal(izq0.inest + der0.inest + izq0ki.inest, 0);
  var izq = barrido({ rueda: "izq", Ld: 0.1 }), der = barrido({ rueda: "der", Ld: 0.1 }), ki = barrido({ rueda: "izq", Ld: 0.1, kiLineal: true });
  assert.equal(izq.inest, 102); assert.equal(der.inest, 104); assert.equal(ki.inest, 143);
  cerca(izq.minimo, 4.40, 0.005); cerca(der.minimo, 4.41, 0.005); cerca(ki.minimo, 2.79, 0.005);
  cerca(E.gananciaCritica({ rueda: "izq", Ld: 0.1 }), 4.67, 0.005);
});
comprobar("la banda de insensibilidad deja sin corregir 3 ticks/ciclo con las definitivas y 4 con el PSO", function () {
  assert.equal(E.bandaInsensibilidad(16.00), 3); assert.equal(E.bandaInsensibilidad(16.42), 3);
  assert.equal(E.bandaInsensibilidad(12.48), 4); assert.equal(E.bandaInsensibilidad(10.10), 4);
  /* con el estado integral cargado el umbral cambia: (16·3 + 2)/50 = 1 */
  assert.equal(Math.trunc((16 * 3 + 2) / 50), 1);
});
comprobar("con el retardo del optimizador en la derecha, 0,0692 s, el margen de fase es 46,8°", function () {
  var a = E.analizar({ rueda: "der", Ld: 0.0692 });
  cerca(a.pm, 46.8, 0.05); cerca(a.gmDb, 17.1, 0.05); cerca(a.Ms, 1.650, 0.005);
});
comprobar("el modelo detecta la pérdida de estabilidad al superar la ganancia crítica", function () {
  var c = E.gananciaCritica({ rueda: "der", Ld: 0.1 });
  assert.ok(E.analizar({ rueda: "der", Ld: 0.1, multGanancia: c * 0.98 }).estable);
  var f = E.analizar({ rueda: "der", Ld: 0.1, multGanancia: c * 1.02 });
  assert.ok(!f.estable && f.poloMayor > 1);
});
comprobar("las raíces de un polinomio conocido se recuperan con precisión", function () {
  var p = E.mul(E.mul([1, -0.995], [1, -0.5]), E.mul([1, 0], [1, -1.9, 0.9064]));
  var r = E.raices(p).map(function (z) { return Math.hypot(z[0], z[1]); }).sort();
  cerca(r[0], 0, 1e-12); cerca(r[1], 0.5, 1e-10); cerca(r[r.length - 1], 0.995, 1e-10);
});
console.log("\n" + total + " pruebas de estabilidad correctas");
