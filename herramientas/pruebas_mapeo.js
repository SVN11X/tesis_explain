/*
  Pruebas del capítulo 05, sin navegador ni dependencias.
  Comprueban oclusión, colisiones, celdas sin observar, SE(2) y optimización.
  Uso: node herramientas/pruebas_mapeo.js
*/
"use strict";
var assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
var ctx = { window: {}, Math: Math };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js/mapeo.js"), "utf8"), ctx);
var M = ctx.window.MAPEO, total = 0;
function test(name, fn) { fn(); total++; console.log("  ok   " + name); }
function near(a, b, tol) { assert(Math.abs(a - b) < (tol || 1e-8), a + " ≠ " + b); }
test("un rayo termina en la primera pared, no en la de atrás", function () {
  var p = M.rayoLidar({ x: 1, y: 1 }, 0, [[3, 0, 3, 2, "pared"], [2, 0, 2, 2, "pared"]], "ideal", 0);
  near(p.d, 1);
});
test("un rayo paralelo al segmento no inventa un retorno", function () {
  assert.strictEqual(M.interseccion({ x: 1, y: 1 }, { x: 1, y: 0 }, [0, 2, 4, 2]), null);
});
test("un impacto bajo el rango mínimo no permite ver a través del obstáculo", function () {
  var p = M.rayoLidar({ x: 1, y: 1 }, 0, [[1.1, 0, 1.1, 2, "pared"], [3, 0, 3, 2, "pared"]], "ideal", 0);
  assert.strictEqual(p.d, null);
});
test("los tres ejemplos de vidrio distinguen retorno, transmisión y ausencia", function () {
  var s = [[0, .8, 0, 2, "vidrio"], [-.6, .8, -.6, 2, "exterior"]], o = { x: 1, y: 1.3 };
  near(M.rayoLidar(o, Math.PI, s, "vidrio", 0).d, 1);
  near(M.rayoLidar(o, Math.PI, s, "vidrio", 1).d, 1.6);
  assert.strictEqual(M.rayoLidar(o, Math.PI, s, "vidrio", 2).d, null);
});
test("absorción ilustrativa deja una lectura ausente, no una pared posterior", function () {
  assert.strictEqual(M.rayoLidar({ x: 1, y: 1 }, 0, [[2, 0, 2, 2, "oscuro"], [3, 0, 3, 2, "pared"]], "oscuro", 0).d, null);
});
test("un barrido conserva 230 sectores y solo distancias válidas", function () {
  ["ideal", "altura", "vidrio", "oscuro"].forEach(function (caso) {
    var rays = M.barridoLidar({ x: 1, y: 1.3 }, caso);
    assert.strictEqual(rays.length, 230);
    assert(rays.every(function (r) { return r.d === null || (r.d >= .15 && r.d <= 12); }));
  });
});
test("el robot no atraviesa una caja baja que el láser no detecta", function () {
  var p = M.moverLidar({ x: 1.1, y: .45 }, { x: 2.4, y: .45 });
  assert(p.bloqueado && p.x < 1.6);
  assert(M.poseLidarValida(p));
});
test("el robot no puede entrar dentro del mueble oscuro ni atravesar el tabique", function () {
  assert(!M.poseLidarValida({ x: 3.4, y: 2 }));
  var p = M.moverLidar({ x: 2.2, y: .3 }, { x: 3.3, y: .3 });
  assert(p.bloqueado && p.x < 2.6);
});
test("la rejilla empieza desconocida y conserva las celdas detrás del impacto", function () {
  assert(M.rejilla(0).data.every(function (v) { return v === -1; }));
  var g = M.rejilla(1);
  assert.strictEqual(g.data[5 * 16 + 9], 0);
  assert.strictEqual(g.data[5 * 16 + 10], 100);
  assert.strictEqual(g.data[5 * 16 + 11], -1);
});
test("otro punto de observación revela una celda antes oculta", function () {
  assert.strictEqual(M.rejilla(2).data[5 * 16 + 11], -1);
  assert.strictEqual(M.rejilla(3).data[5 * 16 + 11], 0);
});
test("acumular barridos conserva la evidencia anterior y el total de celdas", function () {
  for (var phase = 0; phase < 3; phase++) {
    var before = M.rejilla(phase).data, after = M.rejilla(phase + 1).data;
    assert.strictEqual(after.length, 160);
    assert(after.every(function (v) { return v === -1 || v === 0 || v === 100; }));
    before.forEach(function (v, i) { if (v !== -1) assert.strictEqual(after[i], v); });
  }
});
test("dos barridos de una esquina se alinean con el avance de 30 cm", function () {
  var scan = M.barridos(.3);
  near(scan.error, 0);
  scan.a.forEach(function (p, i) { near(scan.b[i][0] + .3, p[0]); near(scan.b[i][1], p[1]); });
  near(M.barridos(.4).error, .1);
});
test("la corrección rectilínea compensa errores positivos, negativos y cero", function () {
  [-10, 0, 4, 10].forEach(function (bias) {
    var t = M.tfRecta(2, bias, true); near(t.mapa, 2); near(t.odom + t.correccion, 2);
    near(M.tfRecta(2, bias, false).mapa, t.odom);
  });
  near(M.tfRecta(0, 10, true).mapa, 0);
});
test("la inversión SE(2) incluye el giro, no solo resta coordenadas", function () {
  var a = [1.2, -.4, Math.PI / 2], id = M.componer(a, M.invertir(a));
  id.forEach(function (v) { near(v, 0); });
});
test("map → odom compuesto con odom → base_link reproduce la pose SLAM", function () {
  var odom = [2.1, -.5, .6], map = [1.9, .2, -.2], tf = M.correccionTF(map, odom), actual = M.componer(tf, odom);
  actual.forEach(function (v, i) { near(v, map[i]); });
});
test("el cierre reduce el costo y la separación sin modificar la odometría", function () {
  var graph = M.grafoEjemplo(), original = JSON.stringify(graph.odom), out = M.optimizarGrafo(graph.odom, graph.edges.concat([graph.cierre]));
  assert(out.costos[out.costos.length - 1] < out.costos[0] / 10);
  out.costos.forEach(function (c, i) { if (i) assert(c <= out.costos[i - 1]); });
  assert(Math.hypot(out.poses[12][0], out.poses[12][1]) < Math.hypot(graph.odom[12][0], graph.odom[12][1]));
  assert.strictEqual(JSON.stringify(graph.odom), original);
  out.poses[0].forEach(function (v) { near(v, 0); });
  assert(out.costos[out.costos.length - 1] > 0); // no se promete error cero
});
test("las poses optimizadas permanecen finitas y TF relaciona los extremos", function () {
  var graph = M.grafoEjemplo(), out = M.optimizarGrafo(graph.odom, graph.edges.concat([graph.cierre]));
  assert(out.poses.every(function (p) { return p.every(Number.isFinite); }));
  var end = out.poses[12], actual = M.componer(M.correccionTF(end, graph.odom[12]), graph.odom[12]);
  actual.forEach(function (v, i) { near(v, end[i]); });
});
test("el índice de cobertura ignora las ocupadas y baja si se agregan desconocidas", function () {
  near(M.indiceCobertura(24, 5), 24 / 29);
  near(M.indiceCobertura(24, 20), 24 / 44);
  assert(M.indiceCobertura(24, 20) < M.indiceCobertura(24, 5));
  near(M.indiceCobertura(0, 0), 0);
  var g = M.rejilla(3), libres = g.data.filter(function (v) { return v === 0; }).length, desc = g.data.filter(function (v) { return v === -1; }).length;
  near(M.indiceCobertura(libres, desc), libres / (libres + desc));
});
test("el desacuerdo de los barridos es mínimo y cero en 30 cm, y crece hacia ambos lados", function () {
  near(M.costoBarridos(.3), 0, 1e-20);
  near(M.costoBarridos(.4), 7 * .01);
  near(M.costoBarridos(.2), M.costoBarridos(.4));
  for (var v = .1; v < .29; v += .01) assert(M.costoBarridos(v) > M.costoBarridos(v + .01));
  for (var w = .31; w <= .5; w += .01) assert(M.costoBarridos(w) > M.costoBarridos(w - .01));
});
test("el cierre de lazo hace subir el desacuerdo y la optimización lo baja sin llegar a cero", function () {
  var graph = M.grafoEjemplo(), opt = M.optimizarGrafo(graph.odom, graph.edges.concat([graph.cierre])), c = M.desacuerdoPorPaso(graph, opt);
  near(c[0], 0, 1e-12);
  assert(c[1] > 1 && c[2] < c[1] / 100 && c[2] > 0);
  near(c[3], c[2]);
});
test("los SVG de la página no incluyen estilos que se filtren al documento; los exportados sí", function () {
  var antes = M.svgEstatico;
  M.svgEstatico = false; assert(M.trejosSVG().indexOf("<style>") < 0);
  M.svgEstatico = true; assert(M.trejosSVG().indexOf("<style>") > 0);
  M.svgEstatico = antes;
});
test("escala sin error angular puede cerrar conservando longitudes incorrectas", function () {
  var graph = M.grafoEjemplo({ escalaPct: 10, giroDeg: 0 }), fin = graph.odom[12];
  near(fin[0], 0); near(fin[1], 0); near(fin[2], 0);
  assert(Math.abs(graph.odom[3][0] - graph.real[3][0]) > .1);
});
test("los extremos de deriva producen poses finitas y optimización reduce el costo", function () {
  [-10, 10].forEach(function (escala) { [-3, 3].forEach(function (giro) {
    var graph = M.grafoEjemplo({ escalaPct: escala, giroDeg: giro }), opt = M.optimizarGrafo(graph.odom, graph.edges.concat([graph.cierre]));
    assert(opt.costos[opt.costos.length - 1] < opt.costos[0]);
    assert(opt.poses.every(function (p) { return p.every(Number.isFinite); }));
  }); });
});
test("el grafo rechaza deriva no finita o fuera del rango declarado", function () {
  assert.throws(function () { M.grafoEjemplo({ escalaPct: Infinity }); });
  assert.throws(function () { M.grafoEjemplo({ giroDeg: 4 }); });
});
test("mapa del grafo: con las poses reales las observaciones de cada pared coinciden y el ancho es el del recinto", function () {
  var par = M.paredesGrafo(), g = M.grafoEjemplo(), obs = M.observacionesGrafo(g.real, par), m = M.metricasMapa(M.mapaDesdePoses(g.real, obs), par, 12);
  near(m.inicioRegreso, 0, 1e-9); near(m.dispersion, 0, 1e-9); near(m.ancho, m.anchoReal, 1e-9);
  assert(m.paredesComunes > 10, "la pose 0 y la 12 ven paredes en común");
});
test("mapa del grafo: la isla tapa lo que está detrás y nada queda fuera del alcance", function () {
  var par = M.paredesGrafo(), g = M.grafoEjemplo(), obs = M.observacionesGrafo(g.real, par), isla = M.recintoGrafo.isla;
  obs.forEach(function (o) { assert(Math.hypot(o.z[0], o.z[1]) <= M.recintoGrafo.alcance + 1e-9); });
  /* desde la pose 0, en (0, 0), la cara superior de la isla queda oculta por la propia isla */
  var tapadas = par.map(function (w, j) { return j; }).filter(function (j) { return par[j].pared === "isla" && Math.abs(par[j].p[1] - isla[3]) < 1e-9; });
  assert(tapadas.every(function (j) { return !obs.some(function (o) { return o.i === 0 && o.j === j; }); }));
});
test("mapa del grafo: optimizar junta la pared vista al inicio y al regreso, pero no corrige un error de escala", function () {
  var par = M.paredesGrafo(), g = M.grafoEjemplo(), obs = M.observacionesGrafo(g.real, par);
  var opt = M.optimizarGrafo(g.odom, g.edges.concat([g.cierre]));
  var antes = M.metricasMapa(M.mapaDesdePoses(g.odom, obs), par, 12), despues = M.metricasMapa(M.mapaDesdePoses(opt.poses, obs), par, 12);
  assert(antes.inicioRegreso > .15 && despues.inicioRegreso < .005, antes.inicioRegreso + " → " + despues.inicioRegreso);
  assert(despues.dispersion < antes.dispersion);
  assert(despues.ancho - despues.anchoReal > .03, "el mapa coherente queda más ancho: " + despues.ancho);
  /* solo escala: el cierre ya se cumple y la optimización no cambia nada */
  var e = M.grafoEjemplo({ escalaPct: 4, giroDeg: 0 }), oe = M.optimizarGrafo(e.odom, e.edges.concat([e.cierre]));
  var me = M.metricasMapa(M.mapaDesdePoses(oe.poses, M.observacionesGrafo(e.real, par)), par, 12);
  near(me.inicioRegreso, 0, 1e-6); assert(me.ancho - me.anchoReal > .04);
});
test("el respaldo sin JavaScript del grafo repite las cifras del mapa calculado", function () {
  var html = fs.readFileSync(path.join(__dirname, "..", "mapeo.html"), "utf8");
  var texto = html.split('data-vis="lazo"><p class="vis-fallback">')[1].split("</p>")[0];
  var par = M.paredesGrafo(), g = M.grafoEjemplo(), obs = M.observacionesGrafo(g.real, par), opt = M.optimizarGrafo(g.odom, g.edges.concat([g.cierre]));
  var antes = M.metricasMapa(M.mapaDesdePoses(g.odom, obs), par, 12), despues = M.metricasMapa(M.mapaDesdePoses(opt.poses, obs), par, 12);
  function f(v, n) { return (Math.round(v * Math.pow(10, n) + 1e-9) / Math.pow(10, n)).toFixed(n).replace(".", ","); }
  [f(antes.inicioRegreso * 100, 1) + " cm", f(despues.ancho, 2) + " m", f(despues.anchoReal, 2) + " m"].forEach(function (c) { assert(texto.indexOf(c) >= 0, "falta " + c); });
});
console.log("\n" + total + " pruebas de mapeo correctas");
