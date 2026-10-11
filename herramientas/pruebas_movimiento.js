/*
  Pruebas del capítulo 3, sin navegador ni dependencias.
  Comprueban la cinemática diferencial, el centro de giro, la integración sobre arcos,
  los datos de la recta de 2 m, la calibración por un factor y el cuadrado en dos sentidos.
  Uso: node herramientas/pruebas_movimiento.js
*/
"use strict";
var assert = require("node:assert/strict"), fs = require("fs"), path = require("path");
var M = require("../js/movimiento-modelo.js"), C = require("../js/control-modelo.js");
var total = 0;
function comprobar(nombre, prueba) { prueba(); total++; console.log("  ok   " + nombre); }
function cerca(a, b, tol) { assert.ok(Math.abs(a - b) < (tol || 1e-9), a + " ≠ " + b); }

comprobar("v es el promedio de las ruedas y ω su diferencia dividida por 0,188 m", function () {
  var k = M.cinematica(0.10, 0.13);
  cerca(k.v, 0.115); cerca(k.w, 0.03 / 0.188); cerca(k.R, 0.115 / (0.03 / 0.188));
});
comprobar("la cinemática inversa devuelve las mismas velocidades de rueda", function () {
  [[0.10, 0.13], [-0.0329, 0.0329], [-0.08, -0.08], [0.13, 0.02]].forEach(function (p) {
    var k = M.cinematica(p[0], p[1]), r = M.ruedas(k.v, k.w);
    cerca(r.vl, p[0], 1e-12); cerca(r.vr, p[1], 1e-12);
  });
});
comprobar("ruedas iguales dan recta; opuestas giran en su lugar a unos 0,35 rad/s", function () {
  assert.equal(M.cinematica(0.13, 0.13).R, Infinity);
  var k = M.cinematica(-0.0329, 0.0329);
  cerca(k.v, 0); cerca(k.R, 0); cerca(k.w, 0.35, 0.001);
});
comprobar("cada rueda gira alrededor del centro de giro con la misma ω", function () {
  [[0.10, 0.13], [0.02, 0.13], [0.13, 0.05], [-0.05, -0.09]].forEach(function (p) {
    var k = M.cinematica(p[0], p[1]), rr = M.radiosRuedas(k.R);
    cerca(k.w * rr.izq, p[0], 1e-12); cerca(k.w * rr.der, p[1], 1e-12);
  });
});
comprobar("0,13 m/s son 40,76 ticks por ciclo, igual que en el capítulo 4", function () {
  cerca(M.ticksPorCiclo(0.13), C.REF * C.FACTOR, 1e-3);
});
comprobar("cuatro flancos por ciclo dan 0,106 mm por flanco; uno, 0,425 mm", function () {
  cerca(M.resolucion() * 1000, 0.10631, 1e-4); cerca(M.resolucion(1) * 1000, 0.42523, 1e-4);
  cerca(M.resolucion(1) / M.resolucion(), 4);
});
comprobar("una vuelta completa sobre el arco vuelve al punto de partida", function () {
  var k = M.cinematica(0.10, 0.13), p = { x: 0.3, y: -0.2, th: 0.4 }, n = 37, T = 2 * Math.PI / k.w, q = p;
  for (var i = 0; i < n; i++) q = M.avanzar(q, k.v, k.w, T / n);
  cerca(q.x, p.x, 1e-9); cerca(q.y, p.y, 1e-9); cerca(M.envolver(q.th - p.th), 0, 1e-9);
});
comprobar("dos medios pasos sobre el arco equivalen a un paso entero", function () {
  var p = { x: 0, y: 0, th: 1 }, a = M.avanzar(M.avanzar(p, 0.1, 0.4, 0.5), 0.1, 0.4, 0.5), b = M.avanzar(p, 0.1, 0.4, 1);
  cerca(a.x, b.x, 1e-12); cerca(a.y, b.y, 1e-12); cerca(a.th, b.th, 1e-12);
  var r = M.avanzar({ x: 1, y: 2, th: Math.PI / 2 }, 0.13, 0, 2);
  cerca(r.x, 1, 1e-12); cerca(r.y, 2.26, 1e-12);
});
comprobar("las medias de la tabla son 1,924 m, 1,856 m y 3,63 % con 0,44 % de dispersión", function () {
  var odo = M.estadistica(M.RECTA.map(function (r) { return r.odo; })).media, cinta = M.estadistica(M.RECTA.map(function (r) { return r.cinta; })).media;
  var e = M.estadistica(M.RECTA.map(function (r) { return r.error; }));
  cerca(odo, 1.924, 5e-4); cerca(cinta, M.CINTA_MEDIA, 5e-4); cerca(e.media, 3.63, 1e-9); cerca(e.desv, 0.44, 5e-3);
});
comprobar("cada error de la tabla es (odometría − cinta) / cinta, salvo el redondeo de las distancias", function () {
  M.RECTA.forEach(function (r) { assert.ok(Math.abs(M.errorPct(r.odo, r.cinta) - r.error) < 0.03, "prueba " + r.prueba); });
});
comprobar("el modelo usa los mismos valores que datos/ensayos/recta-2m-real.csv", function () {
  var filas = fs.readFileSync(path.join(__dirname, "..", "datos/ensayos/recta-2m-real.csv"), "utf8").trim().split("\n").slice(1);
  assert.equal(filas.length, M.RECTA.length);
  filas.forEach(function (f, i) {
    var c = f.split(",").map(Number), r = M.RECTA[i];
    assert.deepEqual([c[0], c[2], c[3], c[4]], [r.prueba, r.odo, r.cinta, r.error]);
  });
});
comprobar("dividir por 1,0363 deja el error medio en cero y conserva el orden de las pruebas", function () {
  var e = M.RECTA.map(function (r) { return r.error; }), f = M.factor(e), c = M.corregir(e, f);
  cerca(f, 1.0363, 1e-12);
  cerca(M.estadistica(c).media, 0, 1e-12);
  cerca(M.estadistica(c).desv, M.estadistica(e).desv / f, 1e-12);
  for (var i = 1; i < e.length; i++) cerca(c[i] - c[0], (e[i] - e[0]) / f, 1e-12);
  cerca(c[1], -0.724, 1e-3); cerca(c[0], 0.367, 1e-3);
});
comprobar("sin variación aleatoria, el factor de unas repeticiones corrige exacto las siguientes", function () {
  var a = M.repeticiones(2.5, 0, 3), b = M.repeticiones(2.5, 0, 99);
  a.forEach(function (x) { cerca(x, 2.5); });
  M.corregir(b, M.factor(a)).forEach(function (x) { cerca(x, 0, 1e-12); });
});
comprobar("la misma semilla repite las repeticiones; otra semilla las cambia", function () {
  assert.deepEqual(M.repeticiones(3.63, 0.44, 7), M.repeticiones(3.63, 0.44, 7));
  assert.notDeepEqual(M.repeticiones(3.63, 0.44, 7), M.repeticiones(3.63, 0.44, 8));
});
comprobar("con mucha variación, el error medio de repeticiones nuevas se aleja más de cero", function () {
  function promedioAbs(variacion) {
    var s = 0;
    for (var k = 0; k < 400; k++) {
      var f = M.factor(M.repeticiones(3.63, variacion, 10 + k)), n = M.corregir(M.repeticiones(3.63, variacion, 5000 + k), f);
      s += Math.abs(M.estadistica(n).media);
    }
    return s / 400;
  }
  var bajo = promedioAbs(0.1), alto = promedioAbs(1.2);
  assert.ok(alto > 5 * bajo, bajo + " " + alto);
});
comprobar("1976 y 1969 flancos frente a 1980: −0,35 % entre ruedas y +0,38 % de avance real", function () {
  var d = M.diferenciaDeConteos(1976, 1969);
  cerca(d.ruedas * 100, -0.3543, 1e-3); cerca(d.escala * 100, 0.3805, 1e-3);
  assert.ok(d.escala > 0, "con 1980 la odometría subestima, no sobrestima");
});
comprobar("el desvío lateral de una recta coincide con integrar las dos ruedas", function () {
  var dif = M.diferenciaDeConteos(1976, 1969).ruedas, d = M.desvioLateral(dif, 2), q = 1 + dif, p = { x: 0, y: 0, th: 0 };
  for (var i = 0; i < 200; i++) p = M.mover(p, 2 / 200 * 2 / (1 + q), 2 / 200 * 2 * q / (1 + q), M.B);
  cerca(p.y, d.lateral, 1e-9); cerca(p.th, d.giro, 1e-12);
  cerca(d.lateral * 100, -3.77, 0.01);
});
comprobar("con ruedas ideales los dos cuadrados cierran exacto", function () {
  var r = M.bidireccional({ dif: 0, sep: 0 });
  cerca(r.horario.error, 0, 1e-9); cerca(r.antihorario.error, 0, 1e-9); cerca(r.horario.giroEsquina, -Math.PI / 2, 1e-12);
});
comprobar("la separación mal estimada cambia cada giro de 90° a 90° / (1 + error)", function () {
  var r = M.bidireccional({ dif: 0, sep: 0.02 });
  cerca(Math.abs(r.horario.giroEsquina), Math.PI / 2 / 1.02, 1e-12); cerca(r.antihorario.giroEsquina, Math.PI / 2 / 1.02, 1e-12);
  cerca(r.horario.error, r.antihorario.error, 1e-9);
  cerca(r.horario.errorRumbo, -r.antihorario.errorRumbo, 1e-9);
});
comprobar("una diferencia entre ruedas curva cada tramo hacia el mismo lado en los dos sentidos", function () {
  var r = M.bidireccional({ dif: 0.005, sep: 0 });
  assert.ok(r.horario.giroTramo > 0 && r.antihorario.giroTramo > 0);
  cerca(r.horario.errorRumbo, r.antihorario.errorRumbo, 1e-9);
});
comprobar("las dos causas se compensan en un sentido y se suman en el otro", function () {
  var r = M.bidireccional({ dif: 0.0059, sep: 0.02 });
  assert.ok(r.antihorario.error < 0.0025 && r.horario.error > 0.15, r.antihorario.error + " " + r.horario.error);
  cerca(r.mayor, r.horario.error);
  var s = M.bidireccional({ dif: 0.0059, sep: -0.02 });
  assert.ok(s.horario.error < s.antihorario.error / 4, "al invertir la separación cambia el sentido que se compensa");
});
comprobar("con las ruedas distintas, girar en el lugar también desplaza un poco el centro", function () {
  var q = 1.01, fd = 2 * q / (1 + q), fi = 2 / (1 + q), arco = M.B / 2 * Math.PI / 2;
  var p = M.mover({ x: 0, y: 0, th: 0 }, -arco * fi, arco * fd, M.B);
  cerca(Math.hypot(p.x, p.y), arco * (fd - fi) / 2 * Math.sin(Math.PI / 4) / (Math.PI / 4), 1e-12);
});
comprobar("los textos de respaldo sin JavaScript repiten las cifras que calcula el modelo", function () {
  var html = fs.readFileSync(path.join(__dirname, "..", "movimiento.html"), "utf8");
  function respaldo(v) { var m = html.match(new RegExp('data-vis="' + v + '"><p class="vis-fallback">([^<]*)<')); assert.ok(m, v); return m[1]; }
  function f(v, d) { var t = Math.abs(v).toFixed(d).replace(".", ","); return (v < 0 && +t.replace(",", ".") !== 0 ? "−" : "") + t; }
  var e = M.RECTA.map(function (r) { return r.error; }), c = M.corregir(e, M.factor(e));
  assert.ok(respaldo("calibracion").indexOf(c.slice(0, 4).map(function (x) { return f(x, 2); }).join(", ") + " y " + f(c[4], 2) + " %") > 0, respaldo("calibracion"));
  var k = M.cinematica(0.10, 0.13), t = respaldo("cinematica");
  assert.ok(t.indexOf(f(k.v, 3) + " m/s") > 0 && t.indexOf(f(k.w, 2) + " rad/s") > 0 && t.indexOf(f(k.R, 2) + " m de radio") > 0, t);
  var r = M.bidireccional({ dif: 0.0059, sep: 0.02 });
  assert.ok(Math.round(r.horario.error * 100) === 18 && r.antihorario.error < 0.005 && respaldo("cuadrado").indexOf("unos 18 cm") > 0);
});
console.log("\n" + total + " pruebas del capítulo 3 correctas");
