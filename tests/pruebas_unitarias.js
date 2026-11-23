/*
  Pruebas unitarias de la huella, del reloj de paso fijo, de la búsqueda A estrella, del registro de interactivos y de la exploración.
  No requieren navegador. Uso, desde la raíz del repositorio:
      node tests/pruebas_unitarias.js
  Las pruebas de búsqueda, interacción y páginas están en tests/navegador.py.
*/
"use strict";
var path = require("path"), fs = require("fs"), vm = require("vm");
var RAIZ = path.join(__dirname, "..", "public");
/* SITIO.MODULOS, leído de js/sitio.js: archivo -> nombres de interactivo que registra */
var MODULOS = {};
(function () {
  var bloque = /var MODULOS = \{([\s\S]*?)\n  \};/.exec(fs.readFileSync(path.join(RAIZ, "js", "sitio.js"), "utf8"))[1], re = /"(js\/[^"]+\.js)":\s*"([^"]+)"/g, m;
  while ((m = re.exec(bloque))) MODULOS[m[1]] = m[2].split(" ");
})();
function archivoDe(nombre) { return Object.keys(MODULOS).filter(function (f) { return MODULOS[f].indexOf(nombre) >= 0; })[0]; }
function cargar(contexto, archivo) { vm.runInContext(fs.readFileSync(path.join(RAIZ, archivo), "utf8"), contexto); }
function nuevoContexto() {
  var c = { window: { addEventListener: function () {} }, console: console, Math: Math };
  c.window.window = c.window;
  return vm.createContext(c);
}
var ctx = nuevoContexto();
/* los archivos de interactivos usan el kit de js/comun.js (U.limitar), así que se carga primero */
cargar(ctx, "js/comun.js");
cargar(ctx, archivoDe("exploracion"));
/* la geometría de la huella está en js/navegacion.js y el reloj de paso fijo en js/exploracion.js */
var ctxN = nuevoContexto();
cargar(ctxN, "js/comun.js");
cargar(ctxN, archivoDe("inflacion"));
var G = Object.assign({}, ctxN.window.NAVEGACION_PRUEBAS, { pasoFijo: ctx.window.EXPLORACION_PRUEBAS.pasoFijo });
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

console.log("A estrella y Dijkstra, paso a paso");
var ctxA = { window: { VISUALES: {}, U: {} }, Math: Math };
vm.createContext(ctxA);
cargar(ctxA, archivoDe("astar"));
var AS = ctxA.window.NAVEGACION_PRUEBAS.astar, bA = AS.buscar(true), bD = AS.buscar(false);
ok(bA.llego && bD.llego && bA.camino.length - 1 === 27 && bD.camino.length - 1 === 27, "las dos búsquedas llegan con una ruta de 27 pasos");
ok(bA.pasos.length === 111 && bD.pasos.length === 291, "A estrella revisa 111 celdas y Dijkstra 291", bA.pasos.length + " " + bD.pasos.length);
/* distancia real hasta la meta, rodeando el muro, para comprobar que h nunca la supera */
var real = {}, cola = [AS.B.join(",")];
real[cola[0]] = 0;
for (var qi = 0; qi < cola.length; qi++) {
  var pq = cola[qi].split(",").map(Number);
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (dd) {
    var nx = pq[0] + dd[0], ny = pq[1] + dd[1], nk = nx + "," + ny;
    if (nx < 0 || ny < 0 || nx >= AS.C || ny >= AS.R || AS.muro[nk] || real[nk] != null) return;
    real[nk] = real[cola[qi]] + 1; cola.push(nk);
  });
}
ok(Object.keys(real).every(function (k) { var c = k.split(",").map(Number); return AS.h(c[0], c[1]) <= real[k]; }), "h nunca supera la distancia real: es admisible");
ok(bA.pasos.every(function (p) { return p.f === p.g + p.h && p.g === p.camino.length - 1; }), "en cada paso f = g + h y g es el largo del camino guardado");
ok(bA.pasos.every(function (p, i) { return !i || p.f >= bA.pasos[i - 1].f; }), "A estrella revisa con f que nunca baja");
ok(bD.pasos.every(function (p, i) { return p.h === 0 && (!i || p.g >= bD.pasos[i - 1].g); }), "Dijkstra no estima y revisa por distancia al robot");
ok(bA.pasos.every(function (p) { return p.pendAntes >= 1 + p.empates; }), "las celdas empatadas son parte de las pendientes");
/* rejilla editada por el lector: un hueco en el muro y una meta encerrada */
function murosEjemplo() { var m = {}; Object.keys(AS.muro).forEach(function (k) { m[k] = 1; }); return m; }
var conHueco = { A: [3, 6], B: [20, 6], muro: murosEjemplo() }; delete conHueco.muro["12,6"];
var hA = AS.buscar(true, conHueco), hD = AS.buscar(false, conHueco);
ok(hA.llego && hA.camino.length - 1 === 17 && hA.pasos.length === 18 && hD.pasos.length === 211, "con un hueco en el muro la ruta baja a 17 pasos y A estrella revisa 18 celdas", hA.pasos.length + " " + hD.pasos.length);
ok(AS.buscar(true).pasos.length === 111, "editar una copia no cambia el ejemplo");
var encerrada = { A: [3, 6], B: [0, 0], muro: murosEjemplo() }; encerrada.muro["1,0"] = 1; encerrada.muro["0,1"] = 1;
var eA = AS.buscar(true, encerrada);
ok(!eA.llego && eA.pasos.length === 300, "con la meta encerrada no hay ruta y se revisan todas las celdas alcanzables", eA.pasos.length);
ok(AS.h(0, 0, [5, 6]) === 11 && AS.h(3, 6) === 17, "h usa la meta de la rejilla editada");
ok(bA.camino.every(function (c, i) { var a = bA.camino[i - 1]; return !AS.muro[c.join(",")] && (!i || Math.abs(c[0] - a[0]) + Math.abs(c[1] - a[1]) === 1); }) &&
  bA.camino[0].join(",") === AS.A.join(",") && bA.camino[bA.camino.length - 1].join(",") === AS.B.join(","), "la ruta va del robot a la meta por celdas vecinas y libres");

console.log("Cada archivo registra exactamente los interactivos de SITIO.MODULOS");
Object.keys(MODULOS).forEach(function (archivo) {
  var c = nuevoContexto();
  cargar(c, "js/comun.js"); cargar(c, archivo);
  var reales = Object.keys(c.window.VISUALES).sort().join(" "), previstos = MODULOS[archivo].slice().sort().join(" ");
  ok(reales === previstos, archivo + " registra lo que dice SITIO.MODULOS", reales + " | " + previstos);
});

console.log("Exploración por fronteras, sin DOM y con paso fijo");
function exploracion(pasos) {
  var S = ctx.window.EXPLORACION_PRUEBAS.exploracion();
  S.reiniciar();
  for (var i = 0; i < pasos; i++) S.avanzar(1 / 30);
  return S;
}
var ex0 = exploracion(0), v0 = ex0.ver();
ok(v0.est.enviadas === 1 && v0.ruta.length > 0 && v0.meta && v0.t === 0, "al reiniciar envía la primera meta con una ruta", JSON.stringify(v0.est));
ok(cerca(ex0.cobertura(), 9.81, 0.01), "el primer barrido del láser descubre cerca del 9,8 % del plano", ex0.cobertura());
var ex30 = exploracion(30), v30 = ex30.ver();
ok(cerca(v30.t, 1, 1e-9) && cerca(v30.robot.x, 7.5, 1e-6) && cerca(v30.robot.y, 36.9, 0.01), "tras 1 s simulado avanza recto hacia la meta, de y 40,5 a 36,9", v30.robot.x + " " + v30.robot.y);
ok(ex30.cobertura() > ex0.cobertura(), "al moverse descubre más plano");
var e1 = exploracion(300).ver(), e2 = exploracion(300).ver();
ok(e1.robot.x === e2.robot.x && e1.robot.y === e2.robot.y && e1.est.enviadas === 4 && e1.est.reemplazadas === 3 && e2.est.enviadas === 4, "dos corridas iguales dan lo mismo: 4 metas enviadas, 3 reemplazadas a los 10 s", JSON.stringify(e1.est));
var exF = exploracion(9000);
ok(exF.ver().terminado && cerca(exF.cobertura(), 100, 0.01), "a los 300 s termina sola sin fronteras y con el plano completo", exF.cobertura());
var rf = ex0.fronteras();
ok(rf.grupos.length > 0 && rf.grupos.every(function (g) { return g.length > 0; }), "hay fronteras al empezar");

console.log("\nReto de exploracion.html");
var RE = ctx.window.EXPLORACION_PRUEBAS, htmlE = fs.readFileSync(path.join(RAIZ, "exploracion.html"), "utf8"), qsE = RE.reto();
function anclaEnPagina(a) { return htmlE.indexOf('id="' + a.slice(1) + '"') >= 0; }
ok(qsE.length === 2 && qsE[0].opciones[0].ok && !qsE[0].opciones[1].ok && !qsE[0].opciones[2].ok && qsE[1].opciones[0].ok && !qsE[1].opciones[1].ok && !qsE[1].opciones[2].ok, "el reto tiene una respuesta correcta por pregunta");
ok(RE.evaluarReto(0, 0).ok && !RE.evaluarReto(0, 1).ok && RE.evaluarReto(1, 0).ok && RE.evaluarReto(2, 0) === null && RE.evaluarReto(0, 9) === null, "evaluarReto corrige cada opción y rechaza las que no existen");
ok(qsE.every(function (q, i) { return q.opciones.every(function (o, j) { return RE.evaluarReto(i, j).porque.length > 10 && anclaEnPagina(RE.evaluarReto(i, j).enlace); }); }), "cada respuesta explica por qué y enlaza a un ancla de la página");
ok(["54 quedaron abortadas", "53", "3,3 s", "16,7 s", "10 s"].every(function (c) { return htmlE.indexOf(c) >= 0; }), "las cifras del reto están en la página");
ok(htmlE.split('data-vis="reto-exploracion"')[1].split("</div>")[0].indexOf("<details>") >= 0, "el reto trae su respaldo sin JavaScript");

console.log("\nReparto de un interactivo en dibujo y mandos");
var rp = ctx.window.U.repartir(["mando", "dibujo", "dibujo", "mando", "nota", "lectura"]);
ok(rp.length === 1 && rp[0].titulo === null && rp[0].dibujo.join() === "1,2" && rp[0].mando.join() === "0,3" && rp[0].nota.join() === "4" && rp[0].lectura.join() === "5", "una sola sección reparte dibujo, mandos, lecturas y nota");
var rp2 = ctx.window.U.repartir(["titulo", "mando", "dibujo", "titulo", "mando", "nota"]);
ok(rp2.length === 2 && rp2[0].titulo === 0 && rp2[1].titulo === 3 && rp2[1].mando.join() === "4" && rp2[1].nota.join() === "5", "cada título abre una sección");
var rp3 = ctx.window.U.repartir(["mando", "titulo", "dibujo"]);
ok(rp3.length === 2 && rp3[0].titulo === null && rp3[1].titulo === 1 && rp3[1].dibujo.join() === "2", "el contenido antes del primer título forma una sección sin título");
ok(ctx.window.U.repartir([]).length === 0, "sin hijos no hay secciones");

console.log("\nPestañas de mandos en el teléfono");
var emp = ctx.window.U.empacar, PEST = ctx.window.U.PESTANAS;
var rot2 = { m: ["Caso", "Ruedas"], corte: 1 };
var e1 = emp([{ h: 80, tipo: "mando" }, { h: 60, tipo: "mando" }, { h: 40, tipo: "nota" }], 237, rot2);
ok(e1.length === 1 && e1[0].indices.join() === "0,1,2", "si los mandos y las notas caben en una pantalla no hay pestañas");
var e2 = emp([{ h: 150, tipo: "mando" }, { h: 100, tipo: "mando" }, { h: 60, tipo: "mando" }, { h: 40, tipo: "nota" }, { h: 300, tipo: "dato" }], 237, rot2);
ok(e2.length === 3 && e2[0].indices.join() === "0" && e2[1].indices.join() === "1,2" && e2[0].rotulo === "Caso" && e2[1].rotulo === "Ruedas", "los mandos se cortan donde dice la entrada y cada pestaña lleva su nombre");
ok(e2[2].indices.join() === "4,3" && e2[2].rotulo === "Datos y notas", "los datos y las notas van juntos en la última pestaña");
var e3 = emp([{ h: 200, tipo: "mando" }, { h: 100, tipo: "nota" }], 237, { m: ["Pasos"] });
ok(e3.length === 2 && e3[0].rotulo === "Pasos" && e3[1].rotulo === "Cómo leerlo" && e3[1].indices.join() === "1", "sin datos la última pestaña se llama Cómo leerlo");
var e4 = emp([{ h: 200, tipo: "mando" }, { h: 200, tipo: "mando" }, { h: 200, tipo: "mando" }, { h: 100, tipo: "nota" }, { h: 100, tipo: "dato" }], 237, rot2);
ok(e4.length <= 3, "nunca hay más de tres pestañas");
ok(emp([{ h: 500, tipo: "mando" }], 237, null).length === 1, "sin entrada no hay pestañas");
var GENERICOS = ["mandos", "valores", "opciones", "acciones", "lecturas", "notas", "leyenda", "datos", "controles"];
var malas = [];
Object.keys(PEST).forEach(function (id) {
  var m = PEST[id].m, todos = m.concat(["Cómo leerlo", "Datos y notas"]);
  if (m.length > 2 || (m.length === 2 && !(PEST[id].corte > 0))) malas.push(id + " tiene mal sus pestañas de mandos");
  todos.forEach(function (n, k) {
    if (n.length > 14 || /\d/.test(n) || GENERICOS.indexOf(n.toLowerCase()) >= 0 || todos.indexOf(n) !== k) malas.push(id + ": " + n);
  });
});
ok(Object.keys(PEST).length >= 25 && !malas.length, "ninguna pestaña tiene un nombre genérico, numerado, repetido o de más de 14 letras", malas.join("; "));

console.log("\n" + (total - fallos) + " de " + total + " pruebas correctas");
process.exit(fallos ? 1 : 0);
