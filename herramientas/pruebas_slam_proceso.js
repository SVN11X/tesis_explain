/* Propiedades de los ejemplos nuevos. Sin DOM, paquetes ni datos experimentales. */
"use strict";
var assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
var ctx = { window: {}, Math: Math }; vm.createContext(ctx);
['mapeo.js', 'slam-proceso.js'].forEach(function (name) { vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', name), 'utf8'), ctx); });
var S = ctx.window.SLAM_PROCESO, M = ctx.window.MAPEO, total = 0;
function test(name, f) { f(); total++; console.log('  ok   ' + name); }
test('la cercanía no acepta por sí sola una coincidencia geométrica falsa', function () {
  var good = S.evaluarCandidato(0), bad = S.evaluarCandidato(5);
  assert(good.espacial && bad.espacial && good.aceptado && !bad.aceptado);
  assert(Math.abs(good.rms - .02) < 1e-10 && bad.rms > .06);
});
test('se excluyen la cadena reciente y los candidatos fuera del radio aun si sus puntos coinciden', function () {
  [11, 3].forEach(function (id) { var e = S.evaluarCandidato(id); assert.strictEqual(e.rms, 0); assert(!e.espacial && !e.aceptado); });
  assert.throws(function () { S.evaluarCandidato(99); });
});
test('las llamadas no comparten observaciones mutables', function () {
  var c = S.candidatos(); c[0].puntos[0][0] = 100;
  assert(Math.abs(S.evaluarCandidato(0).rms - .02) < 1e-10);
});
test('el respaldo del candidato usa el mismo dibujo y mantiene los estilos fuera del SVG en línea', function () {
  var expected = S.candidatosSVG(0, true) + '\n';
  assert.strictEqual(fs.readFileSync(path.join(__dirname, '../img/diagramas/candidatos-cierre.svg'), 'utf8'), expected);
  assert(!S.candidatosSVG(0, false).includes('<style>'));
});
test('los seis barridos a 500 ms reproducen los conteos explicados sin JavaScript', function () {
  var a = S.cola('sincrono', 500, 150), b = S.cola('asincrono', 500, 150);
  assert(a.llegados.length === 6 && a.terminados.length === 3 && a.esperando.length === 2 && a.activo);
  assert(b.llegados.length === 6 && b.terminados.length === 2 && b.omitidos.length === 3 && b.activo);
  assert(a.edadUltimo === 250 && b.edadUltimo === 150);
});
test('cada llegada tiene exactamente un estado y ninguna finalización usa datos futuros', function () {
  ['sincrono', 'asincrono'].forEach(function (modo) {
    [50, 100, 150, 200, 250].forEach(function (duracion) {
      for (var t = 0; t <= 1200; t += 25) {
        var s = S.cola(modo, t, duracion), all = s.terminados.concat(s.esperando, s.omitidos, s.activo ? [s.activo] : []);
        assert.strictEqual(all.length, s.llegados.length);
        assert.strictEqual(new Set(all.map(function (p) { return p.id; })).size, all.length);
        assert(s.terminados.every(function (p) { return p.fin <= t && p.inicio >= p.llegada; }));
        if (s.activo) assert(s.activo.fin > t && s.activo.inicio <= t);
        if (modo === 'asincrono') assert.strictEqual(s.esperando.length, 0);
        else assert.strictEqual(s.omitidos.length, 0);
      }
    });
  });
});
test('si el cálculo termina antes o justo al llegar el siguiente barrido no hay cola ni omisiones', function () {
  ['sincrono', 'asincrono'].forEach(function (modo) {
    [50, 100].forEach(function (duracion) {
      var s = S.cola(modo, 1200, duracion); assert(s.esperando.length === 0 && s.omitidos.length === 0 && s.terminados.length === 12);
    });
  });
});
test('la cola síncrona aumenta la edad de los resultados cuando el servicio es más lento', function () {
  assert(S.cola('sincrono', 1200, 150).edadUltimo > S.cola('sincrono', 300, 150).edadUltimo);
});
test('las entradas imposibles de la cola se rechazan', function () {
  [['x', 0, 150], ['sincrono', -1, 150], ['sincrono', Infinity, 150], ['asincrono', 1201, 150], ['sincrono', 0, 0], ['sincrono', 0, NaN]].forEach(function (args) { assert.throws(function () { S.cola.apply(null, args); }); });
});
test('dar más peso al mismo cierre reduce su residuo sin modificar las mediciones', function () {
  var gaps = [.2, 1, 5].map(function (peso) {
    var g = M.grafoEjemplo({ pesoCierre: peso }), before = JSON.stringify(g), out = M.optimizarGrafo(g.odom, g.edges.concat([g.cierre]));
    assert.strictEqual(JSON.stringify(g), before);
    assert(out.costos[out.costos.length - 1] <= out.costos[0]);
    assert.strictEqual(g.edges[0].w[0], 100);
    return Math.hypot(out.poses[12][0], out.poses[12][1]);
  });
  assert(gaps[0] > gaps[1] && gaps[1] > gaps[2]);
  [0, -1, 6, Infinity, NaN].forEach(function (p) { assert.throws(function () { M.grafoEjemplo({ pesoCierre: p }); }); });
});
console.log('\n' + total + ' pruebas del proceso SLAM correctas');
