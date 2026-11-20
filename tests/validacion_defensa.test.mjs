// Pruebas de la herramienta de validación. Escriben JSONL sintético en la carpeta temporal del sistema.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calcular, percentil, leerJsonl } from '../scripts/validacion_defensa.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'validacion_defensa.mjs');

const evaluada = (veredicto, estado = 'presente') => ({
  estado: 'evaluada', veredicto, observaciones: [{ criterio: 'C1', estado, evidencia: null }], pista: null,
});
const noEval = (causa) => ({ estado: 'no_evaluable', causa });
const ronda = (caso, resultado, ms = 5000, n = 1, lecturas = []) => ({ caso, ronda: n, lecturas, resultado, ms });
const lectura = (veredicto) => ({ valida: true, veredicto, observaciones: [], pista: null });
const etiqueta = (caso, clase, etiqueta_ = 'correcta', question_id = 'p-a') => ({ caso, question_id, clase, etiqueta: etiqueta_ });

// Umbrales pequeños para probar los bordes con pocos casos.
const chico = (extra = {}) => ({
  umbrales: {
    acuerdo: { meta: 2, de: 3 }, criticasCorrectas: { meta: 0, de: 2 }, ambiguosAbstenidos: { meta: 1, de: 2 },
    estables: { meta: 1, de: 2 }, ...extra,
  },
});

test('percentil usa el rango más cercano', () => {
  assert.equal(percentil([], 0.95), null);
  assert.equal(percentil([10], 0.95), 10);
  const v = Array.from({ length: 20 }, (_, i) => (i + 1) * 1000);
  assert.equal(percentil(v, 0.95), 19000);
});

test('acuerdo: coincidencia con la etiqueta, y abstenerse en un ambiguo cuenta', () => {
  const et = [etiqueta('a', 'parafrasis'), etiqueta('b', 'omision', 'parcial'), etiqueta('c', 'ambiguo', 'indeterminada')];
  const sal = [ronda('a', evaluada('correcta')), ronda('b', evaluada('incorrecta')), ronda('c', noEval('disagreement'))];
  const r = calcular(et, sal, chico());
  assert.equal(r.metricas.acuerdo.valor, 2);
  assert.equal(r.metricas.acuerdo.cumple, true);
  assert.equal(r.matriz_por_clase.omision.salidas.incorrecta, 1);
  assert.equal(r.matriz_por_clase.ambiguo.salidas.abstencion, 1);
  const peor = calcular(et, [ronda('a', evaluada('parcial')), ronda('b', evaluada('incorrecta')), ronda('c', noEval('disagreement'))], chico());
  assert.equal(peor.metricas.acuerdo.valor, 1);
  assert.equal(peor.metricas.acuerdo.cumple, false);
});

test('el acuerdo exige el tamaño esperado del conjunto', () => {
  const r = calcular([etiqueta('a', 'parafrasis')], [ronda('a', evaluada('correcta'))]);
  assert.equal(r.metricas.acuerdo.total, 1);
  assert.equal(r.metricas.acuerdo.cumple, false);
});

test('una aprobación falsa crítica, en cualquier ronda, rompe la meta de cero', () => {
  const et = [etiqueta('x', 'error_critico', 'incorrecta'), etiqueta('y', 'contradiccion_critica', 'incorrecta')];
  const bien = calcular(et, [ronda('x', evaluada('incorrecta')), ronda('y', noEval('disagreement'))], chico());
  assert.equal(bien.metricas.aprobaciones_falsas_criticas.valor, 0);
  assert.equal(bien.metricas.aprobaciones_falsas_criticas.cumple, true);
  const mal = calcular(
    et,
    [ronda('x', evaluada('incorrecta')), ronda('y', evaluada('incorrecta')), ronda('y', evaluada('correcta'), 5000, 2)],
    chico(),
  );
  assert.equal(mal.metricas.aprobaciones_falsas_criticas.valor, 1);
  assert.equal(mal.metricas.aprobaciones_falsas_criticas.cumple, false);
});

test('abstención en ambiguos: un fallo técnico no es abstención', () => {
  const et = [etiqueta('a1', 'ambiguo', 'indeterminada'), etiqueta('a2', 'ambiguo', 'indeterminada')];
  const ok = calcular(et, [ronda('a1', noEval('insufficient_evidence')), ronda('a2', evaluada('parcial'))], chico());
  assert.equal(ok.metricas.abstencion_ambiguos.valor, 1);
  assert.equal(ok.metricas.abstencion_ambiguos.cumple, true);
  const mal = calcular(et, [ronda('a1', noEval('ai_unavailable')), ronda('a2', evaluada('parcial'))], chico());
  assert.equal(mal.metricas.abstencion_ambiguos.valor, 0);
  assert.equal(mal.metricas.abstencion_ambiguos.cumple, false);
});

test('estabilidad: tres rondas iguales son estables, un fallo técnico nunca', () => {
  const tres = (caso, res) => [1, 2, 3].map((n) => ronda(caso, res(n), 5000, n));
  const sal = [
    ...tres('e1', () => evaluada('parcial')),
    ...tres('e2', (n) => (n === 3 ? evaluada('correcta') : evaluada('parcial'))),
  ];
  const r = calcular([], sal, chico());
  assert.equal(r.metricas.estabilidad.total, 2);
  assert.equal(r.metricas.estabilidad.valor, 1);
  assert.equal(r.metricas.estabilidad.cumple, true);
  // Tres fallos técnicos idénticos no cuentan como estables.
  const fallos = calcular([], [...tres('f1', () => noEval('ai_unavailable')), ...tres('f2', () => evaluada('parcial'))], chico());
  assert.equal(fallos.metricas.estabilidad.valor, 1);
  // Mismo veredicto con otro estado de criterio tampoco es estable.
  const dist = calcular([], [...tres('g1', (n) => evaluada('parcial', n === 1 ? 'ausente' : 'presente')), ...tres('g2', () => evaluada('parcial'))], chico());
  assert.equal(dist.metricas.estabilidad.valor, 1);
  // Menos de tres rondas no es un caso de estabilidad.
  const corto = calcular([], [ronda('h', evaluada('parcial')), ronda('h', evaluada('parcial'), 5000, 2)], chico());
  assert.equal(corto.metricas.estabilidad.total, 0);
});

test('p95 usa solo las rondas completas y fallos técnicos se miden sobre admitidas', () => {
  const sal = [];
  for (let i = 1; i <= 19; i++) sal.push(ronda(`c${i}`, evaluada('parcial'), i * 100));
  sal.push(ronda('lenta', evaluada('parcial'), 15000));
  // Rondas que no deben influir en la latencia: un fallo técnico de 60 s y una ronda sin cupo.
  sal.push(ronda('fallo', noEval('ai_unavailable'), 60000));
  sal.push(ronda('sin_cupo', noEval('quota_exhausted'), 90000));
  sal.push(ronda('pendiente', noEval('pending_guide'), 90000));
  const r = calcular([], sal);
  assert.equal(r.metricas.latencia_p95_ms.total, 20);
  assert.equal(r.metricas.latencia_p95_ms.valor, 1900);
  assert.equal(r.metricas.latencia_p95_ms.cumple, true);
  // 21 admitidas, 1 fallo: 4,76 %, por debajo del 5 %. Sin cupo ni pendientes no cuentan como admitidas.
  assert.equal(r.metricas.fallos_tecnicos.total, 21);
  assert.equal(r.metricas.fallos_tecnicos.fallos, 1);
  assert.equal(r.metricas.fallos_tecnicos.cumple, true);
  const lenta = calcular([], [ronda('a', evaluada('parcial'), 15001)]);
  assert.equal(lenta.metricas.latencia_p95_ms.cumple, false);
  const justo = calcular([], [ronda('a', evaluada('parcial'), 15000)]);
  assert.equal(justo.metricas.latencia_p95_ms.cumple, true);
});

test('fallos técnicos: el 5 % exacto no cumple', () => {
  const sal = [ronda('f', noEval('ai_unavailable'))];
  for (let i = 0; i < 19; i++) sal.push(ronda(`c${i}`, evaluada('parcial')));
  const r = calcular([], sal);
  assert.equal(r.metricas.fallos_tecnicos.valor, 0.05);
  assert.equal(r.metricas.fallos_tecnicos.cumple, false);
  const sinDatos = calcular([], []);
  assert.equal(sinDatos.metricas.fallos_tecnicos.cumple, false);
  assert.equal(sinDatos.metricas.latencia_p95_ms.cumple, false);
});

test('por pregunta: cobertura, desacuerdo, exactitud y voto único a 0,2', () => {
  const et = [etiqueta('a', 'parafrasis'), etiqueta('b', 'breve', 'parcial'), etiqueta('c', 'omision', 'parcial')];
  const sal = [
    ronda('a', evaluada('correcta'), 1000, 1, [lectura('correcta'), lectura('correcta'), lectura('correcta')]),
    ronda('b', noEval('disagreement'), 1000, 1, [lectura('parcial'), lectura('parcial'), lectura('correcta')]),
    ronda('c', evaluada('parcial'), 1000, 1, [lectura('parcial'), lectura('incorrecta'), null]),
  ];
  const q = calcular(et, sal).por_pregunta['p-a'];
  assert.equal(q.casos, 3);
  assert.equal(q.cobertura, 0.6667);
  assert.equal(q.tasa_disagreement, 0.3333);
  assert.equal(q.exactitud_evaluadas, 1);
  // Lecturas a 0,2: correcta (acierta), parcial (acierta), incorrecta (falla).
  assert.equal(q.voto_unico_cobertura, 1);
  assert.equal(q.voto_unico_exactitud, 0.6667);
});

test('el voto único trata una lectura nula o inválida como sin voto', () => {
  const et = [etiqueta('a', 'parafrasis')];
  const sal = [ronda('a', evaluada('correcta'), 1000, 1, [lectura('correcta'), { valida: false, motivo: 'x' }, lectura('correcta')])];
  const q = calcular(et, sal).por_pregunta['p-a'];
  assert.equal(q.voto_unico_cobertura, 0);
  assert.equal(q.voto_unico_exactitud, null);
});

test('avisa de salidas sin etiqueta y de etiquetas sin salida', () => {
  const r = calcular([etiqueta('a', 'parafrasis'), etiqueta('b', 'breve')], [ronda('a', evaluada('correcta')), ronda('z', evaluada('correcta'))]);
  assert.deepEqual(r.avisos, { salidas_sin_etiqueta: 1, etiquetas_sin_salida: 1 });
});

// Prueba de extremo a extremo con tamaños reales: 120 + 40 casos y la CLI.
function escribir(dir, nombre, filas) {
  const ruta = join(dir, nombre);
  writeFileSync(ruta, filas.map((f) => JSON.stringify(f)).join('\n') + '\n');
  return ruta;
}

function conjuntoCompleto() {
  const clases = ['parafrasis', 'breve', 'omision', 'error_critico', 'contradiccion_critica', 'ambiguo'];
  const et = [];
  const sal = [];
  for (let i = 0; i < 120; i++) {
    const clase = clases[i % 6];
    const caso = `k${i}`;
    const esperada = clase === 'parafrasis' ? 'correcta' : clase === 'ambiguo' ? 'indeterminada' : clase === 'omision' || clase === 'breve' ? 'parcial' : 'incorrecta';
    et.push({ caso, question_id: `p-${i % 20}`, clase, etiqueta: esperada });
    sal.push(ronda(caso, clase === 'ambiguo' ? noEval('disagreement') : evaluada(esperada), 4000, 1, [lectura(esperada), lectura(esperada), lectura(esperada)]));
  }
  for (let i = 0; i < 40; i++) for (const n of [1, 2, 3]) sal.push(ronda(`s${i}`, evaluada('parcial'), 6000, n));
  return { et, sal };
}

test('CLI con el conjunto completo cumple todos los umbrales', () => {
  const dir = mkdtempSync(join(tmpdir(), 'validacion-'));
  try {
    const { et, sal } = conjuntoCompleto();
    const antes = readdirSync(dir).length;
    const r = spawnSync(process.execPath, [SCRIPT, escribir(dir, 'etiquetas.jsonl', et), escribir(dir, 'salidas.jsonl', sal)], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const out = JSON.parse(r.stdout);
    assert.equal(out.metricas.acuerdo.valor, 120);
    assert.equal(out.metricas.abstencion_ambiguos.cumple, true);
    assert.equal(out.metricas.aprobaciones_falsas_criticas.total, 40);
    assert.equal(out.metricas.estabilidad.cumple, true);
    assert.equal(out.cumple_todo, true);
    assert.equal(readdirSync(dir).length, antes + 2, 'la herramienta no debe escribir archivos');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('CLI: sin argumentos imprime el uso, con un archivo roto avisa la línea', () => {
  const uso = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(uso.status, 0);
  assert.match(uso.stdout, /Uso: node scripts\/validacion_defensa\.mjs/);
  const dir = mkdtempSync(join(tmpdir(), 'validacion-'));
  try {
    const mala = join(dir, 'mala.jsonl');
    writeFileSync(mala, '{"caso":"a"}\nno es json\n');
    assert.throws(() => leerJsonl(mala), /línea 2/);
    const r = spawnSync(process.execPath, [SCRIPT, mala, mala], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /línea 2/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
