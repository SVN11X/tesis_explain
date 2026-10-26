/* Pruebas del alcance estadístico (Sección 5.6, Anexo 8.6 y Tabla A8.4).
   Recalculan los intervalos con los valores por repetición publicados en datos/.
   Uso: node herramientas/pruebas_estadistica.js */
"use strict";
var assert = require("node:assert/strict");
var S = require("../js/estadistica-modelo.js"), D = require("../datos/proyecto.js");
var total = 0;
function comprobar(nombre, prueba) { prueba(); total++; console.log("  ok   " + nombre); }
function cerca(a, b, tol, que) { assert.ok(Math.abs(a - b) <= tol, (que || "") + " " + a + " ≠ " + b + " ± " + tol); }
var en = D.ensayos, validas = en.mapeo.filter(function (r) { return r.valida === "si"; });
var MUESTRAS = {
  error_odometrico: en["recta-2m-real"].map(function (r) { return r.error_odometrico_pct; }),
  error_seguimiento: en["recta-2m-real"].map(function (r) { return Math.abs(r.distancia_real_m - r.distancia_teorica_m) / r.distancia_teorica_m * 100; }),
  desviacion_angular: en["giro-real"].map(function (r) { return Math.abs(r.desviacion_grados); }),
  cobertura_libre: validas.map(function (r) { return r.cobertura_libre_pct; }),
  area_libre: validas.map(function (r) { return r.area_libre_m2; }),
  distancia_plano_mapa: D.analisis["plano-iteraciones"].map(function (r) { return r.plano_a_mapa_media_cm; })
};
var DEC = { error_odometrico: 2, error_seguimiento: 2, desviacion_angular: 1, cobertura_libre: 1, area_libre: 2, distancia_plano_mapa: 1 };

comprobar("los cuantiles t de Student coinciden con las tablas: 2,776 para 4 grados y 2,262 para 9", function () {
  cerca(S.tCuantil(0.975, 4), 2.7764451052, 1e-8); cerca(S.tCuantil(0.975, 9), 2.2621571628, 1e-8);
  cerca(S.tCuantil(0.5, 7), 0, 1e-12); cerca(S.tAcumulada(0, 3), 0.5, 1e-12);
});
comprobar("cada intervalo de la media de la Tabla A8.4 se recalcula desde sus repeticiones", function () {
  D.analisis.intervalos.filter(function (f) { return f.metodo === "t_student"; }).forEach(function (f) {
    var xs = MUESTRAS[f.indicador], r = S.intervaloMedia(xs), d = DEC[f.indicador], tol = Math.pow(10, -d) / 2 + 1e-9;
    assert.equal(xs.length, f.n, f.indicador + " n");
    cerca(r.media, f.media, tol, f.indicador + " media");
    cerca(r.inf, f.ic_inferior, tol, f.indicador + " inferior");
    cerca(r.sup, f.ic_superior, tol, f.indicador + " superior");
  });
});
comprobar("la distancia media al plano es 3,4 cm, con 3,55, 3,19, 3,72, 3,53 y 3,17 por iteración", function () {
  cerca(S.media(MUESTRAS.distancia_plano_mapa), 3.432, 1e-9);
});
comprobar("el área libre varía con un coeficiente de 0,8 %", function () {
  cerca(S.desviacion(MUESTRAS.area_libre) / S.media(MUESTRAS.area_libre) * 100, 0.77, 0.005);
});
comprobar("cinco exploraciones válidas de seis: Clopper y Pearson de 35,9 % a 99,6 %", function () {
  var f = D.analisis.intervalos.filter(function (x) { return x.indicador === "exploraciones_validas"; })[0];
  var c = S.clopperPearson(validas.length, en.mapeo.length);
  assert.equal(validas.length, 5); assert.equal(en.mapeo.length, 6);
  cerca(c.p * 100, f.media, 0.05); cerca(c.inf * 100, f.ic_inferior, 0.05); cerca(c.sup * 100, f.ic_superior, 0.05);
});
comprobar("la prueba binomial exacta de 5 de 6 frente a 50 % da p = 7/64 y solo 6 de 6 bajaría de 0,05", function () {
  cerca(S.binomialCola(5, 6, 0.5), 7 / 64, 1e-12); cerca(S.binomialCola(6, 6, 0.5), 1 / 64, 1e-12);
  assert.ok(S.binomialCola(5, 6, 0.5) > 0.05 && S.binomialCola(6, 6, 0.5) < 0.05);
});
comprobar("15 éxitos en 15 intentos permiten afirmar una tasa sobre el 78 %", function () {
  cerca(S.clopperPearson(15, 15).inf * 100, 78.2, 0.05);
});
comprobar("afirmar una tasa sobre el 80 % exige al menos 17 ejecuciones seguidas sin fallas", function () {
  assert.equal(S.exitosSinFallas(0.8), 17);
  assert.ok(S.clopperPearson(16, 16).inf < 0.8);
});
comprobar("con diez repeticiones y la misma dispersión la semiamplitud baja cerca de un 42 %", function () {
  cerca(S.tCuantil(0.975, 4) / Math.sqrt(5), 1.24, 0.005);
  cerca(S.tCuantil(0.975, 9) / Math.sqrt(10), 0.72, 0.005);
  cerca(1 - S.semiamplitud(1, 10) / S.semiamplitud(1, 5), 0.42, 0.005);
});
comprobar("reducir a la mitad el intervalo del error odométrico pide unas 13 repeticiones", function () {
  assert.equal(S.repeticionesPara(S.desviacion(MUESTRAS.error_odometrico), 5, 0.5), 13);
});
comprobar("la beta incompleta cumple su simetría y sus extremos", function () {
  [[0.3, 2, 5], [0.7, 0.5, 3], [0.05, 6, 1]].forEach(function (c) { cerca(S.betaInc(c[0], c[1], c[2]) + S.betaInc(1 - c[0], c[2], c[1]), 1, 1e-12); });
  assert.equal(S.betaInc(0, 2, 3), 0); assert.equal(S.betaInc(1, 2, 3), 1);
  cerca(S.betaCuantil(0.025, 15, 1), Math.pow(0.025, 1 / 15), 1e-10);
});
console.log("\n" + total + " pruebas estadísticas correctas");
