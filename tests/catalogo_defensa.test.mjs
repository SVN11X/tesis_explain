// Pruebas del catálogo de defensa. Ejecutan el script de Python con archivos temporales,
// nunca modifican los archivos versionados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(RAIZ, 'scripts', 'catalogo_defensa.py');
const CATALOGO = join(RAIZ, 'datos', 'defensa', 'catalogo.json');

function python(args) {
  const r = spawnSync('python', ['-I', SCRIPT, ...args], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  assert.equal(r.error, undefined, 'no se pudo ejecutar python');
  return r;
}

function carpeta() {
  const d = mkdtempSync(join(tmpdir(), 'catalogo-'));
  return { d, limpiar: () => rmSync(d, { recursive: true, force: true }) };
}

function tarjeta({ id, respaldo = 'guia', tema = 'objetivos' }) {
  return `<section class="q-tema" data-tema="${tema}">
  <details class="pregunta" id="${id}" data-respuesta="${respaldo}" data-dificultad="tecnica">
    <summary><span class="q-n">01</span><span class="q-t">Enunciado de ${id}</span></summary>
    <div class="q-cuerpo">
      <p>Cuerpo de   ${id}<a class="ref" href="#f1">1</a>.</p>
      <p class="q-respaldo"><b>Referencia.</b> Tabla 5.5 <a class="ref" href="#f1">1</a>.</p>
      <p class="q-ver"><a href="fuente.html#ancla">Ver</a></p>
    </div>
  </details>
</section>`;
}

const rubrica = (extra = {}) => ({
  estado: 'candidata', aprobada_por: null, fecha_aprobacion: null, version: 1,
  fuente: { referencia: 'x', enlace: 'fuente.html#ancla' },
  criterios: [{ id: 'C1', tipo: 'esencial', texto: 't', fuente: 'fuente.html#ancla' }],
  alternativas_validas: [], contradicciones_criticas: [], permite_incorrecta_ajena: true, ...extra,
});

// Prepara una carpeta con HTML y rúbricas, ejecuta el script y devuelve el resultado.
function ejecutar({ ids = ['p-a', 'p-b'], respaldos = {}, rubricas = {}, total, extra = [] }) {
  const { d, limpiar } = carpeta();
  try {
    const html = ids.map((id) => tarjeta({ id, respaldo: respaldos[id] })).join('\n');
    writeFileSync(join(d, 'preguntas.html'), `<html><body>${html}</body></html>`);
    writeFileSync(join(d, 'fuente.html'), '<html></html>');
    writeFileSync(join(d, 'rubricas.json'), JSON.stringify({ version_esquema: 1, rubricas }));
    const salida = join(d, 'salida', 'catalogo.json');
    const r = python(['--preguntas', join(d, 'preguntas.html'), '--rubricas', join(d, 'rubricas.json'), '--salida', salida,
      '--raiz', d, '--total', String(total ?? ids.length), ...extra]);
    let catalogo = null;
    try { catalogo = JSON.parse(readFileSync(salida, 'utf8')); } catch { /* no se escribió */ }
    return { r, catalogo };
  } finally { limpiar(); }
}

test('el catálogo real tiene 106 preguntas, dos pendientes y solo p-oe3-parcial evaluable', () => {
  const c = JSON.parse(readFileSync(CATALOGO, 'utf8'));
  assert.equal(c.total, 106);
  assert.equal(c.preguntas.length, 106);
  assert.deepEqual(c.pendientes, ['p-giro', 'p-frontera-minima']);
  assert.deepEqual(c.preguntas.filter((p) => p.evaluable).map((p) => p.id), ['p-oe3-parcial']);
  assert.match(c.version, /^[0-9a-f]{12}$/);
  assert.equal(c.preguntas.filter((p) => p.rubrica).length, 1);
  const p = c.preguntas.find((q) => q.id === 'p-oe3-parcial');
  assert.equal(p.rubrica.estado, 'aprobada');
  assert.ok(p.rubrica.aprobada_por && p.rubrica.fecha_aprobacion);
  assert.equal(p.tema, 'objetivos');
  assert.equal(p.dificultad, 'tecnica');
  assert.equal(p.respaldo, 'guia');
  assert.equal(p.referencia, 'Tabla 5.5 y Conclusiones, OE3 1.');
  assert.equal(p.enlace, 'resultados.html#palabras');
  assert.ok(p.guia.startsWith('Porque sus partes quedaron con distinto nivel de evidencia.'));
});

test('generar dos veces da bytes idénticos y coincide con el archivo versionado', () => {
  const { d, limpiar } = carpeta();
  try {
    const a = join(d, 'a.json');
    const b = join(d, 'b.json');
    assert.equal(python(['--salida', a]).status, 0);
    assert.equal(python(['--salida', b]).status, 0);
    assert.ok(readFileSync(a).equals(readFileSync(b)));
    // Git en Windows puede convertir los saltos de línea del archivo versionado.
    assert.equal(readFileSync(a, 'utf8'), readFileSync(CATALOGO, 'utf8').replace(/\r\n/g, '\n'));
    assert.equal(readFileSync(a, 'utf8').endsWith('}\n'), true);
  } finally { limpiar(); }
});

test('--comprobar termina en 0 con el catálogo versionado', () => {
  assert.equal(python(['--comprobar']).status, 0);
});

test('--comprobar termina en 1 con una copia desactualizada y no la escribe', () => {
  const { d, limpiar } = carpeta();
  try {
    const copia = join(d, 'catalogo.json');
    const original = readFileSync(CATALOGO, 'utf8');
    const viejo = original.replace('"total": 106', '"total": 105');
    assert.notEqual(viejo, original);
    writeFileSync(copia, viejo);
    const r = python(['--comprobar', '--salida', copia]);
    assert.equal(r.status, 1);
    assert.equal(readFileSync(copia, 'utf8'), viejo);
    assert.equal(python(['--comprobar', '--salida', join(d, 'no-existe.json')]).status, 1);
  } finally { limpiar(); }
});

test('entradas válidas generan el catálogo y marcan evaluable solo con rúbrica aprobada', () => {
  const ok = ejecutar({ rubricas: { 'p-a': rubrica({ estado: 'aprobada', aprobada_por: 'Persona', fecha_aprobacion: '2026-11-20' }), 'p-b': rubrica() } });
  assert.equal(ok.r.status, 0, ok.r.stderr);
  const [a, b] = ok.catalogo.preguntas;
  assert.equal(a.evaluable, true);
  assert.equal(b.evaluable, false);
  assert.equal(a.guia, 'Cuerpo de p-a1.');
  assert.equal(a.referencia, 'Tabla 5.5 1.');
});

test('el campo version cubre la rúbrica', () => {
  const a = ejecutar({ rubricas: { 'p-a': rubrica() } });
  const b = ejecutar({ rubricas: { 'p-a': rubrica({ version: 2 }) } });
  assert.notEqual(a.catalogo.version, b.catalogo.version);
});

test('una pregunta pendiente no es evaluable y figura en pendientes', () => {
  const { r, catalogo } = ejecutar({ respaldos: { 'p-b': 'pendiente' } });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(catalogo.pendientes, ['p-b']);
});

test('rechaza un ID duplicado', () => {
  const { r, catalogo } = ejecutar({ ids: ['p-a', 'p-a'] });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /duplicado: p-a/);
  assert.equal(catalogo, null);
});

test('rechaza la rúbrica de un ID que no existe', () => {
  const { r } = ejecutar({ rubricas: { 'p-fantasma': rubrica() } });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /p-fantasma no corresponde a ninguna pregunta/);
});

test('rechaza una rúbrica aprobada en una pregunta pendiente', () => {
  const { r } = ejecutar({
    respaldos: { 'p-b': 'pendiente' },
    rubricas: { 'p-b': rubrica({ estado: 'aprobada', aprobada_por: 'Persona', fecha_aprobacion: '2026-11-20' }) },
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /respaldo pendiente/);
});

test('rechaza una rúbrica aprobada sin aprobada_por o sin fecha', () => {
  for (const extra of [{ aprobada_por: null, fecha_aprobacion: '2026-11-20' }, { aprobada_por: 'Persona', fecha_aprobacion: null }]) {
    const { r } = ejecutar({ rubricas: { 'p-a': rubrica({ estado: 'aprobada', ...extra }) } });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /sin aprobada_por o sin fecha_aprobacion/);
  }
});

test('rechaza una fuente cuyo archivo no existe', () => {
  const casos = [
    { fuente: { referencia: 'x', enlace: 'nada.html#a' } },
    { criterios: [{ id: 'C1', tipo: 'esencial', texto: 't', fuente: 'nada.html#a' }] },
    { contradicciones_criticas: [{ id: 'X1', texto: 't', fuente: 'nada.html#a' }] },
  ];
  for (const extra of casos) {
    const { r } = ejecutar({ rubricas: { 'p-a': rubrica(extra) } });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /fuente que no existe: nada\.html#a/);
  }
});

test('rechaza un total distinto del esperado', () => {
  const { r } = ejecutar({ total: 106 });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Se esperaban 106 preguntas y hay 2/);
});

test('el total esperado por omisión es 106', () => {
  const { d, limpiar } = carpeta();
  try {
    mkdirSync(join(d, 'x'));
    writeFileSync(join(d, 'p.html'), `<html><body>${tarjeta({ id: 'p-a' })}</body></html>`);
    writeFileSync(join(d, 'r.json'), '{"version_esquema":1,"rubricas":{}}');
    const r = python(['--preguntas', join(d, 'p.html'), '--rubricas', join(d, 'r.json'), '--salida', join(d, 's.json')]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /Se esperaban 106 preguntas y hay 1/);
  } finally { limpiar(); }
});
