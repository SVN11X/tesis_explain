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
/* ── Registro de estados de metas ── */
const ENC = 'mensaje,meta_id,estado,aceptada_s\n';
function metas(cuerpo, opciones) { return A.analizar(ENC + cuerpo, opciones); }
test('Estados de metas: una abortada activa junto a la siguiente cuenta como reemplazo, no como falla', () => {
  const r = metas('0,a,EXECUTING,0\n1,a,EXECUTING,0\n1,b,ACCEPTED,3.3\n2,a,ABORTED,0\n2,b,EXECUTING,3.3\n3,b,SUCCEEDED,3.3\n');
  assert.equal(value(r, 'reemplazadas'), 1); assert.equal(value(r, 'sin-clasificar'), 0); assert.equal(value(r, 'completadas'), 1);
  close(value(r, 'mediana-activo'), 3.3);
  assert.deepEqual(r.metas.map(m => [m.meta_id, m.estado_final, m.reemplazada]), [['a', 'ABORTED', true], ['b', 'SUCCEEDED', null]]);
  assert.ok(r.reglas.some(x => x.id === 'reemplazo-no-fallo'));
});
test('Estados de metas: una meta que ya aparece abortada queda sin clasificar', () => {
  const r = metas('0,a,ABORTED,0\n1,b,EXECUTING,2\n2,b,SUCCEEDED,2\n');
  assert.equal(value(r, 'reemplazadas'), 0); assert.equal(value(r, 'sin-clasificar'), 1);
  assert.ok(r.reglas.some(x => x.id === 'aborto-sin-clasificar'));
});
test('Estados de metas: prioridad éxito > aborto > cancelación y códigos numéricos equivalentes', () => {
  const r = metas('0,a,2,0\n1,a,6,0\n2,a,4,0\n3,b,EXECUTING,5\n4,b,CANCELING,5\n5,b,CANCELED,5\n6,c,EXECUTING,9\n');
  assert.deepEqual(r.metas.map(m => m.estado_final), ['SUCCEEDED', 'CANCELED', 'sin terminal']);
  assert.equal(value(r, 'canceladas'), 1); assert.equal(value(r, 'sin-terminal'), 1); assert.equal(value(r, 'mediana-activo'), null);
  const t = ['completadas', 'abortadas', 'canceladas', 'sin-terminal'].reduce((s, k) => s + value(r, k), 0);
  assert.equal(t, value(r, 'metas'));
});
test('Estados de metas: el ejemplo sintético coincide con lo que dice su README', () => {
  const r = A.analizar(fs.readFileSync(path.join(root, 'datos/ejemplos/estados-metas-sintetico.csv'), 'utf8'), { periodoExplorador: 3.333 });
  assert.equal(value(r, 'metas'), 6); assert.equal(value(r, 'reemplazadas'), 3); assert.equal(value(r, 'sin-clasificar'), 1);
  assert.equal(value(r, 'completadas'), 1); assert.equal(value(r, 'sin-terminal'), 1);
  assert.ok(r.reglas.some(x => x.id === 'periodo-explorador'));
});
test('Estados de metas: rechaza estados desconocidos, filas repetidas y aceptaciones que cambian', () => {
  assert.throws(() => metas('0,a,PERDIDA,0\n'), /estado desconocido/);
  assert.throws(() => metas('0,a,EXECUTING,0\n0,a,ABORTED,0\n'), /dos veces/);
  assert.throws(() => metas('0,a,EXECUTING,0\n1,a,ABORTED,1\n'), /cambia su tiempo/);
  assert.throws(() => metas('0,a b,EXECUTING,0\n'), /meta_id/);
  assert.throws(() => metas('0,a,9,0\n'), /código de estado/);
});
/* ── Mapas PGM ── */
const M = require('../js/analisis-mapa.js');
function pgm(ancho, alto, valores, texto) {
  if (texto) return new Uint8Array(Buffer.from('P2\n# comentario\n' + ancho + ' ' + alto + '\n255\n' + valores.join(' ') + '\n'));
  return new Uint8Array(Buffer.concat([Buffer.from('P5\n' + ancho + ' ' + alto + '\n255\n'), Buffer.from(valores)]));
}
const TESIS = { tipo: 'tesis', libre: 230, ocupado: 50 };
test('PGM: P5 y P2 dan la misma imagen; comentarios y encabezado se respetan', () => {
  const v = [254, 254, 205, 0, 254, 205];
  const a = M.leerPGM(pgm(3, 2, v)), b = M.leerPGM(pgm(3, 2, v, true));
  assert.deepEqual(Array.from(a.datos), v); assert.deepEqual(Array.from(b.datos), v); assert.equal(a.ancho, 3); assert.equal(b.alto, 2);
});
test('PGM: un fin de línea de Windows antes de los datos no desplaza la imagen', () => {
  const a = M.leerPGM(new Uint8Array(Buffer.concat([Buffer.from('P5\r\n2 1\r\n255\r\n'), Buffer.from([254, 0])])));
  assert.deepEqual(Array.from(a.datos), [254, 0]);
  /* 13 como primer gris sigue siendo un dato cuando no sobra ningún byte */
  const b = M.leerPGM(new Uint8Array(Buffer.concat([Buffer.from('P5\n2 1\n255\n'), Buffer.from([13, 10])])));
  assert.deepEqual(Array.from(b.datos), [13, 10]);
});
test('PGM: rechaza archivos truncados, encabezados raros y grises fuera de rango', () => {
  assert.throws(() => M.leerPGM(new Uint8Array(Buffer.from('P6\n1 1\n255\n\0'))), /no es PGM/);
  assert.throws(() => M.leerPGM(new Uint8Array(Buffer.concat([Buffer.from('P5\n4 4\n255\n'), Buffer.from([1, 2])]))), /menos datos/);
  assert.throws(() => M.leerPGM(new Uint8Array(Buffer.from('P2\n2 1\n100\n50 120\n'))), /mayor que el máximo/);
  assert.throws(() => M.leerPGM(new Uint8Array(Buffer.from('P5\n0 3\n255\n'))), /positivos/);
});
test('Mapa: conteos, áreas e índice siguen las Ec. 5.4 y 5.5 de la guía', () => {
  // 4 × 2: libres 4, ocupadas 2, desconocidas 2
  const r = M.analizarMapa(M.leerPGM(pgm(4, 2, [254, 254, 0, 205, 254, 254, 0, 205])), { resolucion: .05, criterio: TESIS });
  assert.equal(value(r, 'libres'), 4); assert.equal(value(r, 'ocupadas'), 2); assert.equal(value(r, 'desconocidas'), 2);
  close(value(r, 'area-libre'), 4 * .0025); close(value(r, 'indice-imagen'), 100 * 4 / 6);
  assert.equal(r.mapa.rectangulo.ancho, 3); close(value(r, 'indice-rectangulo'), 100);
});
test('Mapa: los umbrales de la tesis y los del YAML se aplican como se declaran', () => {
  const img = M.leerPGM(pgm(4, 1, [229, 230, 50, 51]));
  assert.deepEqual(Array.from(M.clasificar(img, TESIS)), [2, 0, 1, 2]);
  // occ = (255 − p) / 255: 254 → 0,004 libre; 205 → 0,196 desconocido con free_thresh 0,196; 0 → 1 ocupado
  const y = M.leerYAML('image: m.pgm\nresolution: 0.05\norigin: [-1, -2, 0]\nnegate: 0\noccupied_thresh: 0.65\nfree_thresh: 0.196\n');
  assert.deepEqual(y.origin, [-1, -2, 0]);
  const c = M.clasificar(M.leerPGM(pgm(3, 1, [254, 205, 0])), { tipo: 'yaml', occupied_thresh: y.occupied_thresh, free_thresh: y.free_thresh, negate: 0 });
  assert.deepEqual(Array.from(c), [0, 2, 1]);
  const neg = M.clasificar(M.leerPGM(pgm(2, 1, [254, 0])), { tipo: 'yaml', occupied_thresh: .65, free_thresh: .196, negate: 1 });
  assert.deepEqual(Array.from(neg), [1, 0]);
});
test('Mapa: el YAML se valida y la resolución del YAML manda sobre la escrita a mano', () => {
  assert.throws(() => M.leerYAML('resolution: -1\n'), /positiva/);
  assert.throws(() => M.leerYAML('origin: [1, 2]\n'), /tres números/);
  assert.throws(() => M.leerYAML('occupied_thresh: 0.2\nfree_thresh: 0.3\n'), /menor/);
  assert.throws(() => M.leerYAML('!!python/object: x\n'), /clave: valor/);
  const r = M.analizarMapa(M.leerPGM(pgm(1, 1, [254])), { resolucion: 1, yaml: { resolution: .1 }, criterio: TESIS });
  close(value(r, 'area-libre'), .01); assert.equal(r.metricas.find(m => m.id === 'resolucion').origen, 'Declarada en el YAML');
});
test('Mapa: el índice cambia con el recorte mientras el área libre no, y la regla lo dice', () => {
  const v = new Array(100).fill(205); [44, 45, 54, 55].forEach(i => { v[i] = 254; });
  const r = M.analizarMapa(M.leerPGM(pgm(10, 10, v)), { resolucion: .05, criterio: TESIS });
  close(value(r, 'indice-imagen'), 4); close(value(r, 'indice-rectangulo'), 100);
  assert.ok(r.reglas.some(x => x.id === 'indice-depende-marco'));
  assert.ok(!JSON.stringify(r).includes('"clases"'), 'la exportación no arrastra las celdas');
});
test('Comparación: misma rejilla da acuerdo y contradicciones; marcos distintos no se comparan celda a celda', () => {
  const a = M.leerPGM(pgm(3, 1, [254, 0, 205])), b = M.leerPGM(pgm(3, 1, [254, 254, 254]));
  const r = M.compararMapas(a, b, { resolucion: .05, criterio: TESIS, yamlA: { origin: [0, 0, 0] }, yamlB: { origin: [0, 0, 0] } });
  close(value(r, 'acuerdo'), 50); assert.equal(value(r, 'contradicciones'), 1); assert.equal(value(r, 'solo-b'), 1);
  const otro = M.compararMapas(a, b, { resolucion: .05, criterio: TESIS, yamlA: { origin: [0, 0, 0] }, yamlB: { origin: [.05, 0, 0] } });
  assert.ok(otro.reglas.some(x => x.id === 'no-comparable')); assert.ok(!otro.metricas.some(m => m.id === 'acuerdo'));
  const sinYaml = M.compararMapas(a, b, { resolucion: .05, criterio: TESIS });
  assert.ok(sinYaml.reglas.some(x => x.id === 'marco-no-declarado'));
});
test('Mapas sintéticos de ejemplo: B explora más que A y la caja movida aparece como contradicción', () => {
  const leer = n => M.leerPGM(new Uint8Array(fs.readFileSync(path.join(root, 'datos/ejemplos', n))));
  const y = M.leerYAML(fs.readFileSync(path.join(root, 'datos/ejemplos/mapa-sintetico-a.yaml'), 'utf8'));
  const r = M.compararMapas(leer('mapa-sintetico-a.pgm'), leer('mapa-sintetico-b.pgm'), { criterio: TESIS, yamlA: y, yamlB: y });
  assert.ok(value(r, 'diferencia-area') > 0); assert.equal(value(r, 'contradicciones'), 72); assert.equal(value(r, 'solo-a'), 0);
  for (const regla of r.reglas) for (const key of ['condicion', 'evidencia', 'interpretacion', 'sugerencia', 'limitacion']) assert.ok(regla[key]);
});
console.log(`\n${total} pruebas del laboratorio correctas`);
