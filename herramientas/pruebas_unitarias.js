/*
  Pruebas unitarias de la geometría de la huella y del reloj de paso fijo.
  No requieren navegador. Uso, desde la raíz del repositorio:
      node herramientas/pruebas_unitarias.js
  Las pruebas de búsqueda, interacción y páginas están en herramientas/pruebas_navegador.py.
*/
"use strict";
var path = require("path"), fs = require("fs"), vm = require("vm");
var ctx = { window: {}, console: console, Math: Math };
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", "sims.js"), "utf8"), ctx);
var G = ctx.window.SIMS_PRUEBAS;
var fallos = 0, total = 0;
function ok(cond, nombre, detalle) {
  total++;
  if (cond) console.log("  ok   " + nombre);
  else { fallos++; console.log("  FALLA " + nombre + (detalle ? "  " + detalle : "")); }
}
function cerca(a, b, tol) { return Math.abs(a - b) <= tol; }

console.log("Geometría: polígono frente a celda");
var cuadro = [[0, 0], [1, 0], [1, 1], [0, 1]];
ok(G.poligonoTocaRect(cuadro, 0.5, 0.5, 2, 2), "solapamiento real");
ok(!G.poligonoTocaRect(cuadro, 1.001, 0, 2, 1), "separado por 1 mm, sin contacto");
ok(G.poligonoTocaRect(cuadro, 1, 0, 2, 1), "borde compartido cuenta como contacto");
ok(G.poligonoTocaRect(cuadro, 1, 1, 2, 2), "esquina con esquina cuenta como contacto");
/* rombo girado 45°: la celda queda cerca de su lado diagonal pero fuera; la caja que lo envuelve sí la cubre,
   así que una prueba por rectángulo envolvente daría un falso contacto */
var rombo = [[0, 0.5], [0.5, 0], [1, 0.5], [0.5, 1]];
ok(G.poligonoTocaRect(rombo, 0.8, 0.8, 0.95, 0.95) === false, "celda dentro de la caja del rombo pero fuera del rombo, sin contacto");
ok(G.poligonoTocaRect(rombo, 0.74, 0.74, 0.95, 0.95), "celda que alcanza el lado diagonal del rombo, contacto");
/* barra delgada que cruza la celda: ningún vértice de una figura queda dentro de la otra y ningún centro de celda se toca */
var flaco = [[-1, 0.49], [3, 0.49], [3, 0.51], [-1, 0.51]];
ok(G.poligonoTocaRect(flaco, 0, 0, 1, 1), "barra delgada atraviesa la celda sin pasar por su centro de vértices");
ok(!G.poligonoTocaRect(flaco, 0, 0.52, 1, 1.5), "barra delgada junto a la celda, sin contacto");

console.log("Geometría: caso de aceptación del simulador de inflación");
var RES = 0.05, C = 32, F = 18, ocup = new Uint8Array(C * F);
for (var x = 0; x < C; x++) { ocup[x] = 1; ocup[(F - 1) * C + x] = 1; }
for (var y = 0; y < 6; y++) for (var xx = 18; xx < 21; xx++) ocup[(F - 1 - y) * C + xx] = 1;
var HUELLA = [[0.20, 0.13], [-0.08, 0.13], [-0.08, -0.13], [0.20, -0.13]];
/* costo simple para la prueba: 254 en obstáculo, 100 a una celda de un obstáculo, 0 lejos */
function costoDe(i) {
  if (ocup[i]) return 254;
  var cx = i % C, cy = (i / C) | 0;
  for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
    var nx = cx + dx, ny = cy + dy;
    if (nx >= 0 && ny >= 0 && nx < C && ny < F && ocup[ny * C + nx]) return 100;
  }
  return 0;
}
var p = G.huellaEnMundo(HUELLA, 0.45, 0.61, 57);
var ymax = Math.max.apply(null, p.map(function (q) { return q[1]; }));
ok(ymax < 0.85, "la esquina más baja queda sobre el borde del obstáculo", "ymax=" + ymax.toFixed(4));
var ev = G.evaluarHuella(p, [0.45, 0.61], C, F, RES, ocup, costoDe);
ok(ev.fisico === false, "x 0,45, y 0,61, 57°: sin contacto físico");
ok(ev.margen === true, "x 0,45, y 0,61, 57°: la huella entra al margen");
var ev2 = G.evaluarHuella(G.huellaEnMundo(HUELLA, 0.45, 0.62, 57), [0.45, 0.62], C, F, RES, ocup, costoDe);
ok(ev2.fisico === true, "x 0,45, y 0,62, 57°: la esquina cruza el borde y hay contacto físico");
/* esquina exactamente sobre el borde inferior: y tal que ymax = 0,85 */
var yBorde = 0.85 - (ymax - 0.61);
var ev3 = G.evaluarHuella(G.huellaEnMundo(HUELLA, 0.45, yBorde, 57), [0.45, yBorde], C, F, RES, ocup, costoDe);
ok(ev3.fisico === true, "esquina apoyada justo en el borde de la celda ocupada cuenta como contacto");
var ev4 = G.evaluarHuella(G.huellaEnMundo(HUELLA, 0.45, 0.45, 0), [0.45, 0.45], C, F, RES, ocup, costoDe);
ok(!ev4.fisico && !ev4.margen && ev4.costoCentro === 0, "en el centro del pasillo no hay contacto ni margen");
var ev5 = G.evaluarHuella(G.huellaEnMundo(HUELLA, 0.80, 0.70, 0), [0.80, 0.70], C, F, RES, ocup, costoDe);
ok(ev5.fisico, "frente del robot dentro del mueble: contacto físico");

console.log("Reloj de paso fijo");
function simular(hz, vel, segundos, pausas) {
  var r = G.pasoFijo(1 / 30, 0.1), pasos = 0, n = Math.round(hz * segundos);
  for (var i = 0; i < n; i++) {
    var dt = 1 / hz;
    if (pausas && pausas[i]) dt = pausas[i];
    pasos += r.pasos(Math.min(0.1, dt), vel);
  }
  return pasos;
}
[1, 2, 4].forEach(function (v) {
  var esperado = 30 * 10 * v;
  [30, 60, 120, 144].forEach(function (hz) {
    var n = simular(hz, v, 10);
    ok(Math.abs(n - esperado) <= 1, v + "× a " + hz + " Hz: " + n + " pasos en 10 s, se esperaban " + esperado);
  });
});
var a1 = simular(60, 1, 10), a2 = simular(60, 2, 10), a4 = simular(60, 4, 10);
ok(cerca(a2 / a1, 2, 0.01) && cerca(a4 / a1, 4, 0.01), "2× y 4× avanzan el doble y el cuádruple que 1×");
var r = G.pasoFijo(1 / 30, 0.1);
ok(r.pasos(5, 4) === 12, "tras una pausa de 5 s solo se recuperan 0,1 s de tiempo real, 12 pasos a 4×");
ok(r.pasos(0, 4) === 0 && r.pasos(1 / 60, 0) === 0, "dt cero o velocidad cero no avanzan");
var r2 = G.pasoFijo(1 / 30, 0.1), suma = 0;
for (var k = 0; k < 120; k++) suma += r2.pasos(1 / 120, 1);
ok(suma === 30, "a 120 Hz y 1× las fracciones se conservan: 30 pasos en 1 s");
r2.reiniciar();
ok(r2.pendiente === 0, "reiniciar descarta la fracción pendiente");

console.log("\n" + (total - fallos) + " de " + total + " pruebas correctas");
process.exit(fallos ? 1 : 0);
