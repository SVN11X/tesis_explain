#!/usr/bin/env node
// Métricas de la validación del piloto de defensa oral (especificación, apartado 9).
// Lee dos archivos JSONL que viven fuera del repositorio y escribe un JSON por la salida estándar.
// Nunca escribe archivos.
//
//   node scripts/validacion_defensa.mjs <etiquetas.jsonl> <salidas.jsonl>
//
// Etiquetas: {caso, question_id, clase, etiqueta}. Salidas: {caso, ronda, lecturas, resultado, ms}.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { votoUnico } from "../servicio/src/juez.mjs";

export const CLASES = Object.freeze(["parafrasis", "breve", "omision", "error_critico", "contradiccion_critica", "ambiguo"]);
export const CLASES_CRITICAS = Object.freeze(["error_critico", "contradiccion_critica"]);
const CAUSAS_NO_ADMITIDAS = Object.freeze(["quota_exhausted", "pending_guide"]);
const ABSTENCIONES = Object.freeze(["disagreement", "insufficient_evidence"]);

export const UMBRALES = Object.freeze({
  acuerdo: { meta: 102, de: 120 },
  criticasCorrectas: { meta: 0, de: 40 },
  ambiguosAbstenidos: { meta: 18, de: 20 },
  estables: { meta: 36, de: 40 },
  p95Ms: 15000,
  fallosTecnicos: 0.05,
});

const USO = `Uso: node scripts/validacion_defensa.mjs <etiquetas.jsonl> <salidas.jsonl>

  etiquetas.jsonl  una línea por caso: {"caso","question_id","clase","etiqueta"}
  salidas.jsonl    una línea por ronda: {"caso","ronda","lecturas","resultado","ms"}

Ambos archivos se guardan fuera del repositorio. La herramienta imprime las métricas en JSON
con su umbral y si se cumple. No escribe ningún archivo.`;

/** Lee un JSONL. Una línea inválida detiene la lectura con su número. */
export function leerJsonl(ruta) {
  const filas = [];
  readFileSync(ruta, "utf8")
    .split(/\r?\n/)
    .forEach((linea, i) => {
      if (!linea.trim()) return;
      try {
        filas.push(JSON.parse(linea));
      } catch {
        throw new Error(`${ruta}, línea ${i + 1}: JSON inválido`);
      }
    });
  return filas;
}

const estadoDe = (fila) => fila?.resultado?.estado ?? null;
/** Fallo técnico: el servicio no pudo evaluar (ai_unavailable). */
const esFalloTecnico = (fila) => estadoDe(fila) === "no_evaluable" && fila.resultado.causa === "ai_unavailable";
/** Admitida: el servicio reservó cupo. Las respuestas sin cupo o sin rúbrica aprobada no cuentan. */
const esAdmitida = (fila) => !(estadoDe(fila) === "no_evaluable" && CAUSAS_NO_ADMITIDAS.includes(fila.resultado.causa));
const esCompleta = (fila) => esAdmitida(fila) && !esFalloTecnico(fila);
const esAbstencion = (fila) => estadoDe(fila) === "no_evaluable" && ABSTENCIONES.includes(fila.resultado.causa);

/** Salida de una ronda como categoría de la matriz. */
function categoria(fila) {
  if (!fila || !esAdmitida(fila)) return "sin_admitir";
  if (esFalloTecnico(fila)) return "fallo_tecnico";
  if (esAbstencion(fila)) return "abstencion";
  if (estadoDe(fila) === "evaluada") return fila.resultado.veredicto;
  return "fallo_tecnico";
}

/** La salida coincide con la referencia humana. En un caso ambiguo, acertar es abstenerse. */
function coincide(clase, etiqueta, fila) {
  if (!fila || !esCompleta(fila)) return false;
  if (clase === "ambiguo") return esAbstencion(fila);
  return estadoDe(fila) === "evaluada" && fila.resultado.veredicto === etiqueta;
}

/** Percentil p por rango más cercano. */
export function percentil(valores, p) {
  if (valores.length === 0) return null;
  const orden = [...valores].sort((a, b) => a - b);
  return orden[Math.max(0, Math.ceil(p * orden.length) - 1)];
}

/** Clave de una ronda para comparar estabilidad: resultado y estado de cada criterio. */
function claveRonda(fila) {
  if (!fila || !esCompleta(fila)) return null; // un fallo técnico nunca es estable
  const r = fila.resultado;
  if (r.estado === "evaluada") {
    const crit = (r.observaciones ?? r.criterios ?? []).map((o) => `${o.criterio ?? o.id}:${o.estado}`).sort();
    return `evaluada|${r.veredicto}|${crit.join(",")}`;
  }
  return `no_evaluable|${r.causa}`;
}

const tasa = (a, b) => (b ? Number((a / b).toFixed(4)) : null);

/**
 * Calcula todas las métricas.
 * @param {object[]} etiquetas
 * @param {object[]} salidas
 * @param {{umbrales?: object}} [opciones] `umbrales` permite probar con tamaños pequeños.
 */
export function calcular(etiquetas, salidas, opciones = {}) {
  const U = { ...UMBRALES, ...(opciones.umbrales ?? {}) };
  const etiquetaDe = new Map(etiquetas.map((e) => [e.caso, e]));
  const rondasPorCaso = new Map();
  for (const s of salidas) {
    if (!rondasPorCaso.has(s.caso)) rondasPorCaso.set(s.caso, []);
    rondasPorCaso.get(s.caso).push(s);
  }
  for (const lista of rondasPorCaso.values()) lista.sort((a, b) => (a.ronda ?? 0) - (b.ronda ?? 0));

  // Primera ronda de cada caso etiquetado: es la que se compara con la referencia humana.
  const casos = [];
  for (const [caso, rondas] of rondasPorCaso) {
    const e = etiquetaDe.get(caso);
    if (e) casos.push({ ...e, primera: rondas[0], rondas });
  }
  const sinEtiqueta = [...rondasPorCaso.keys()].filter((c) => !etiquetaDe.has(c)).length;
  const sinSalida = etiquetas.filter((e) => !rondasPorCaso.has(e.caso)).length;

  // Acuerdo y matriz por clase.
  const matriz = {};
  for (const c of CLASES) matriz[c] = { casos: 0, acuerdos: 0, salidas: {} };
  let acuerdos = 0;
  for (const c of casos) {
    const m = (matriz[c.clase] ??= { casos: 0, acuerdos: 0, salidas: {} });
    const cat = categoria(c.primera);
    m.casos += 1;
    m.salidas[cat] = (m.salidas[cat] ?? 0) + 1;
    if (coincide(c.clase, c.etiqueta, c.primera)) {
      m.acuerdos += 1;
      acuerdos += 1;
    }
  }

  // Aprobaciones falsas en los casos críticos: cualquier ronda con `correcta` cuenta.
  const criticos = casos.filter((c) => CLASES_CRITICAS.includes(c.clase));
  const aprobacionesFalsas = criticos.reduce(
    (n, c) => n + c.rondas.filter((r) => estadoDe(r) === "evaluada" && r.resultado.veredicto === "correcta").length,
    0,
  );

  // Abstención en ambiguos: se abstiene quien completó la ronda sin dar veredicto.
  const ambiguos = casos.filter((c) => c.clase === "ambiguo");
  const ambiguosAbstenidos = ambiguos.filter((c) => esAbstencion(c.primera)).length;

  // Estabilidad: casos con al menos tres rondas, iguales entre sí y sin fallo técnico.
  const repetidos = [...rondasPorCaso.values()].filter((r) => r.length >= 3);
  const estables = repetidos.filter((r) => {
    const claves = r.slice(0, 3).map(claveRonda);
    return claves[0] !== null && claves.every((k) => k === claves[0]);
  }).length;

  // Latencia sobre rondas completas y fallos técnicos sobre admitidas.
  const admitidas = salidas.filter(esAdmitida);
  const tiempos = admitidas
    .filter(esCompleta)
    .map((r) => r.ms)
    .filter((x) => typeof x === "number" && Number.isFinite(x));
  const p95 = percentil(tiempos, 0.95);
  const fallos = admitidas.filter(esFalloTecnico).length;
  const tasaFallos = admitidas.length ? fallos / admitidas.length : null;

  // Por pregunta: cobertura, abstención por desacuerdo, exactitud y voto único a 0,2.
  const porPregunta = {};
  for (const c of casos) {
    const q = (porPregunta[c.question_id] ??= {
      casos: 0, admitidos: 0, evaluadas: 0, abstencion_disagreement: 0, aciertos_evaluadas: 0,
      voto_evaluadas: 0, voto_aciertos: 0, voto_abstenciones: 0,
    });
    q.casos += 1;
    const f = c.primera;
    if (esAdmitida(f)) q.admitidos += 1;
    if (estadoDe(f) === "evaluada") {
      q.evaluadas += 1;
      if (f.resultado.veredicto === c.etiqueta) q.aciertos_evaluadas += 1;
    }
    if (esAbstencion(f) && f.resultado.causa === "disagreement") q.abstencion_disagreement += 1;
    const voto = votoUnico(Array.isArray(f?.lecturas) ? f.lecturas[1] : null);
    if (voto === "indeterminada") q.voto_abstenciones += 1;
    else if (voto !== null) {
      q.voto_evaluadas += 1;
      if (voto === c.etiqueta) q.voto_aciertos += 1;
    }
  }
  for (const q of Object.values(porPregunta)) {
    q.cobertura = tasa(q.evaluadas, q.admitidos);
    q.tasa_disagreement = tasa(q.abstencion_disagreement, q.admitidos);
    q.exactitud_evaluadas = tasa(q.aciertos_evaluadas, q.evaluadas);
    q.voto_unico_cobertura = tasa(q.voto_evaluadas, q.admitidos);
    q.voto_unico_exactitud = tasa(q.voto_aciertos, q.voto_evaluadas);
  }

  const metricas = {
    acuerdo: {
      valor: acuerdos, total: casos.length, umbral: `>= ${U.acuerdo.meta} de ${U.acuerdo.de}`,
      cumple: casos.length === U.acuerdo.de && acuerdos >= U.acuerdo.meta,
    },
    aprobaciones_falsas_criticas: {
      valor: aprobacionesFalsas, total: criticos.length, umbral: `${U.criticasCorrectas.meta} en ${U.criticasCorrectas.de} casos`,
      cumple: criticos.length === U.criticasCorrectas.de && aprobacionesFalsas <= U.criticasCorrectas.meta,
    },
    abstencion_ambiguos: {
      valor: ambiguosAbstenidos, total: ambiguos.length, umbral: `>= ${U.ambiguosAbstenidos.meta} de ${U.ambiguosAbstenidos.de}`,
      cumple: ambiguos.length === U.ambiguosAbstenidos.de && ambiguosAbstenidos >= U.ambiguosAbstenidos.meta,
    },
    estabilidad: {
      valor: estables, total: repetidos.length, umbral: `>= ${U.estables.meta} de ${U.estables.de}`,
      cumple: repetidos.length === U.estables.de && estables >= U.estables.meta,
    },
    latencia_p95_ms: {
      valor: p95, total: tiempos.length, umbral: `<= ${U.p95Ms} ms, solo rondas completas`,
      cumple: p95 !== null && p95 <= U.p95Ms,
    },
    fallos_tecnicos: {
      valor: tasaFallos, total: admitidas.length, fallos, umbral: `< ${U.fallosTecnicos * 100} % de las admitidas`,
      cumple: tasaFallos !== null && tasaFallos < U.fallosTecnicos,
    },
  };

  return {
    metricas,
    cumple_todo: Object.values(metricas).every((m) => m.cumple),
    matriz_por_clase: matriz,
    por_pregunta: porPregunta,
    avisos: { salidas_sin_etiqueta: sinEtiqueta, etiquetas_sin_salida: sinSalida },
    no_calculado: [
      "comentario fiel (108 de 120): requiere lectura humana",
      "citas inventadas (0 permitidas): requiere lectura humana",
      "4 de 5 estudiantes: requiere a los estudiantes",
    ],
  };
}

function principal(argv) {
  if (argv.includes("--help") || argv.includes("-h") || argv.length === 0) {
    console.log(USO);
    return 0;
  }
  if (argv.length !== 2) {
    console.error(USO);
    return 2;
  }
  try {
    console.log(JSON.stringify(calcular(leerJsonl(argv[0]), leerJsonl(argv[1])), null, 2));
    return 0;
  } catch (e) {
    console.error(e.message);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = principal(process.argv.slice(2));
}
