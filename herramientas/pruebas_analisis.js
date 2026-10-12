'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const A = require('../js/analisis-modelo.js');
const root = path.resolve(__dirname, '..');
let total = 0;
function test(name, f) { f(); total++; console.log('  ok   ' + name); }
function close(a, b, tolerance = 1e-9) { assert.ok(Math.abs(a - b) <= tolerance, `${a} ≠ ${b}`); }
function load(name) { return A.analizar(fs.readFileSync(path.join(root, 'datos/ensayos', name + '.csv'), 'utf8')); }
function value(result, id) { return result.metricas.find(m => m.id === id).valor; }
function series(points, reference = 1, pwm = 100) { return 'tiempo_s,referencia_m_s,velocidad_m_s,pwm\n' + points.map((y, i) => `${i},${reference},${y},${pwm}`).join('\n'); }

test('Las siete tablas existentes tienen esquema compatible y un gráfico', () => {
  for (const name of ['recta-2m-real', 'recta-2m-simulacion', 'giro-real', 'giro-simulacion', 'escalon', 'mapeo', 'metas']) {
    const r = load(name); assert.ok(r.metricas.length && r.grafica && r.limitaciones.length);
  }
});
test('Recta real separa diferencia en metros y porcentaje declarado', () => {
  const r = load('recta-2m-real'); close(value(r, 'sesgo-media'), .0674); close(value(r, 'tabla-media'), 3.63);
  assert.notEqual(value(r, 'tabla-media'), value(r, 'relativo-media'));
});
test('Desviación muestral usa n−1; una muestra no inventa dispersión cero', () => {
  close(A.estadistica([1, 2, 3]).desviacion, 1); assert.equal(A.estadistica([7]).desviacion, null);
});
test('La recta simulada no se declara error frente a medida física', () => {
  assert.ok(load('recta-2m-simulacion').limitaciones.some(x => x.includes('pose verdadera')));
});
test('Giro real conserva diferencias negativas y positivas', () => {
  const r = load('giro-real'); close(value(r, 'sesgo-media'), .34); close(value(r, 'absoluto-media'), 11.66);
});
test('Mapeo excluye una corrida vacía sin añadir un cero', () => {
  const r = load('mapeo'); assert.equal(value(r, 'validas'), 5); assert.equal(value(r, 'excluidas'), 1);
  close(value(r, 'area-media'), 3.4978); close(value(r, 'cobertura-media'), 62.22); assert.equal(r.filas[1].area_libre_m2, null);
});
test('La tabla de mapeo no fabrica áreas desconocidas u ocupadas', () => {
  const r = load('mapeo'); assert.equal(r.metricas.some(m => /desconocida|ocupada/.test(m.nombre)), false);
});
test('Metas conserva 60, 54, 53, 1, 1 y 5 sin interpretar el resto como fallas', () => {
  const r = load('metas'); ['generadas', 'abortadas', 'reemplazadas', 'sin-clasificar', 'exitosas', 'sin-terminal'].forEach((id, i) => assert.equal(value(r, id), [60, 54, 53, 1, 1, 5][i]));
  assert.equal(r.metricas.some(m => /tasa|falla|mediana/.test(m.id)), false);
});
test('Escalón resumido no transforma sobreimpulso cualitativo en 0 %', () => {
  const r = load('escalon'); close(value(r, 'rueda_izquierda-error'), .002);
  assert.equal(r.metricas.some(m => /sobreimpulso|establecimiento|saturacion/.test(m.id)), false);
});
test('Una referencia incompatible alerta, conservando el error declarado', () => {
  const r = A.analizar(fs.readFileSync(path.join(root, 'datos/ensayos/escalon.csv'), 'utf8'), { referencia: .14 });
  close(value(r, 'rueda_izquierda-error-tabla'), .002); assert.equal(r.reglas.length, 2);
});
test('Parser admite BOM, CRLF, columnas reordenadas y separador punto y coma', () => {
  const t = fs.readFileSync(path.join(root, 'datos/ensayos/giro-real.csv'), 'utf8');
  const r = A.analizar('\uFEFF' + t.replace(/,/g, ';').replace(/\n/g, '\r\n')); assert.equal(r.tipo, 'giro-real');
  const parsed = A.csv(t); const h = parsed.headers.reverse();
  assert.equal(A.analizar(h.join(',') + '\n' + parsed.rows.map(r => h.map(k => r[k]).join(',')).join('\n')).tipo, 'giro-real');
});
test('Parser conserva comillas escapadas y campos multilínea como texto', () => {
  const p = A.csv('a,b\n"a, b","dos ""comillas""\ny líneas"'); assert.equal(p.rows[0].a, 'a, b'); assert.ok(p.rows[0].b.includes('"comillas"'));
});
const valid = fs.readFileSync(path.join(root, 'datos/ensayos/metas.csv'), 'utf8');
const invalids = [
  ['archivo vacío', ''], ['solo encabezados', 'a,b\n'], ['columnas duplicadas', 'a,a\n1,2'], ['fila corta', 'a,b\n1'],
  ['comillas abiertas', 'a,b\n"x,2'], ['texto tras comillas', 'a,b\n"x"z,2'], ['comillas a mitad de campo', 'a,b\nx"y,2'],
  ['unidades no inferidas', 'distancia_cm,odometria_m\n2,2'],
  ['estado que no cuadra', valid.replace('1,18,17,16,0,1', '1,18,16,16,0,1')],
  ['reemplazos mayores que abortos', valid.replace('1,18,17,16', '1,18,17,18')],
  ['conteo fraccionario', valid.replace('1,18,17,16', '1,18,17,16.5')],
  ['identificador duplicado', valid.replace('\n3,', '\n1,')],
  ['Infinity', valid.replace('1,18,', '1,Infinity,')], ['NaN', valid.replace('1,18,', '1,NaN,')],
  ['celda numérica vacía', valid.replace('1,18,', '1,,')], ['fórmula en celda', valid.replace('1,18,', '1,=SUM(1),')],
  ['unidad incorrecta escalón', fs.readFileSync(path.join(root, 'datos/ensayos/escalon.csv'), 'utf8').replace('m/s', 'km/h')],
  ['cobertura fuera de rango', fs.readFileSync(path.join(root, 'datos/ensayos/mapeo.csv'), 'utf8').replace('82.9', '101')],
  ['métrica en corrida no válida', fs.readFileSync(path.join(root, 'datos/ensayos/mapeo.csv'), 'utf8').replace('2,no,,,,', '2,no,1,,,')],
  ['divisor cero recta', fs.readFileSync(path.join(root, 'datos/ensayos/recta-2m-real.csv'), 'utf8').replace('1.846', '0')],
  ['archivo mayor que límite', 'a'.repeat(A.MAX_BYTES + 1)],
  ['más filas que límite', 'a\n' + '1\n'.repeat(A.MAX_FILAS + 1)]
];
invalids.forEach(([name, input]) => test('Rechaza ' + name, () => assert.throws(() => A.analizar(input))));
test('Rechaza un formato elegido distinto de los encabezados', () => assert.throws(() => A.analizar(valid, { tipo: 'mapeo' })));
test('Estadística rechaza valores ausentes y desbordes numéricos', () => {
  assert.throws(() => A.estadistica([])); assert.throws(() => A.estadistica([Infinity])); assert.throws(() => A.estadistica([-1e308, 1e308]));
});
test('Serie ascendente: sobreimpulso observado y establecimiento con banda', () => {
  const r = A.analizar(series([0, .5, 1.1, 1.01, 1, 1, 1, 1, 1, 1, 1]));
  close(value(r, 'sobreimpulso'), 10); close(value(r, 'establecimiento'), 3); assert.equal(value(r, 'saturacion'), 0);
});
test('Serie descendente usa el signo de la amplitud', () => {
  const r = A.analizar(series([1, .5, -.1, -.01, 0, 0, 0], 0)); close(value(r, 'sobreimpulso'), 10); close(value(r, 'establecimiento'), 3);
});
test('La última muestra en banda no basta para afirmar establecimiento', () => {
  assert.equal(value(A.analizar(series([0, .1, .3, .8, 1])), 'establecimiento'), null);
});
test('Saturación cuenta muestras y no infiere windup', () => {
  const r = A.analizar(series([0, .4, .8, 1, 1, 1], 1, 255)); assert.equal(value(r, 'saturacion'), 100);
  assert.ok(r.reglas[0].interpretacion.includes('no demuestra windup'));
});
test('Promedio final no se etiqueta como error estacionario certificado', () => {
  const r = A.analizar(series(Array.from({length: 21}, (_, i) => i ? 1 : 0)));
  assert.ok(r.metricas.find(m => m.id === 'error-final-media').nombre.includes('no certificado'));
});
test('Series incompatibles rechazan tiempo repetido, referencia variable y PWM fuera de límite', () => {
  assert.throws(() => A.analizar(series([0, .2, .8, 1, 1]).replace('\n2,1,', '\n1,1,')));
  assert.throws(() => A.analizar(series([0, .2, .8, 1, 1]).replace('\n3,1,', '\n3,2,')));
  assert.throws(() => A.analizar(series([0, .2, .8, 1, 1], 1, 300)));
});
test('Cada regla incluye condición, evidencia, interpretación, sugerencia y límite', () => {
  for (const name of ['recta-2m-real', 'mapeo', 'metas']) for (const r of load(name).reglas) for (const key of ['condicion', 'evidencia', 'interpretacion', 'sugerencia', 'limitacion']) assert.ok(r[key]);
});
console.log(`\n${total} pruebas del laboratorio correctas`);
