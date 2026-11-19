import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { crearApi } from "../src/api.mjs";
import { crearRepositorioD1 } from "../src/cuotas.mjs";
import { crearFixture, crearDesactivado } from "../src/proveedores.mjs";
import { firmarToken } from "../src/sesion.mjs";
import construirApiDefecto, { construirApi } from "../src/index.mjs";
import { crearD1 } from "./sqlite-d1.mjs";

const catalogoReal = JSON.parse(readFileSync(new URL("../../datos/defensa/catalogo.json", import.meta.url), "utf8"));

const T0 = Date.UTC(2026, 10, 18, 10, 0, 0);
const CLAVES = { hmac: "clave-hmac-de-prueba", sesion: "clave-sesion-de-prueba" };
const ORIGEN = "https://svn11x.github.io";
const RUBRICA = {
  estado: "aprobada", aprobada_por: "dueño", fecha_aprobacion: "2026-11-18", version: 7,
  criterios: [
    { id: "C1", tipo: "esencial", texto: "Mapeo verificado.", fuente: "resultados.html#palabras" },
    { id: "C2", tipo: "esencial", texto: "Navegación sin medir.", fuente: "resultados.html#palabras" },
  ],
  alternativas_validas: [],
  contradicciones_criticas: [{ id: "X1", texto: "Afirmar error final medido.", fuente: "preguntas.html#p-metas-fijas" }],
  permite_incorrecta_ajena: true,
};
// Catálogo de prueba: el real, con una sola rúbrica aprobada.
const idEval = catalogoReal.preguntas.find((p) => p.respaldo === "guia").id;
const catalogoEval = {
  ...catalogoReal,
  version: "vtest00000001",
  preguntas: catalogoReal.preguntas.map((p) => (p.id === idEval ? { ...p, rubrica: RUBRICA, evaluable: true } : p)),
};

const F1 = "El mapeo quedó verificado en el robot real";
const TEXTO = `${F1}, pero la navegación no se midió con números. SECRETO-DEL-ESTUDIANTE`;
const obs = [
  { criterio: "C1", estado: "presente", evidencia: F1 },
  { criterio: "C2", estado: "ausente", evidencia: null },
  { criterio: "X1", estado: "ausente", evidencia: null },
];
const lectura = (pista = "Mide el desempeño.") => ({ veredicto: "parcial", observaciones: obs, pista });
const guionOk = () => ({ 0.1: lectura(), 0.2: lectura(), 0.3: lectura() });

let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

/** Envuelve un objeto contando las llamadas a cada método. */
function contar(objeto) {
  const cuentas = {};
  const p = new Proxy(objeto, {
    get(o, k) {
      const v = o[k];
      if (typeof v !== "function") return v;
      return (...a) => { cuentas[k] = (cuentas[k] ?? 0) + 1; return v.apply(o, a); };
    },
  });
  return { p, cuentas };
}

async function montar({ guion = guionOk(), limites, config = {}, catalogo = catalogoEval, proveedor, repoExtra } = {}) {
  const ctx = { ahora: T0 };
  const db = crearD1();
  const repoReal = crearRepositorioD1(db, limites);
  const r = contar(repoExtra ? { ...repoReal, ...repoExtra } : repoReal);
  const prov = contar(proveedor ?? crearFixture(guion));
  const api = crearApi({
    repo: r.p, proveedor: prov.p, catalogo, claves: CLAVES,
    config: { aiProvider: "fixture", admision: "abierta", origenes: ORIGEN, plazoMs: 2000, ...config },
    reloj: () => ctx.ahora,
  });
  const pedir = (ruta, init = {}) => api.manejar(new Request(`https://w.test${ruta}`, init));
  const sesion = async () => (await (await pedir("/v1/sesiones", { method: "POST" })).json()).token;
  const evaluar = async (token, cuerpo = {}, extra = {}) =>
    pedir("/v1/evaluaciones", {
      method: "POST",
      headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), "content-type": "application/json" },
      body: JSON.stringify({
        request_id: uuid(), question_id: idEval, version_catalogo: catalogo.version, modo: "entrenar", respuesta: TEXTO, ...cuerpo,
      }),
      ...extra,
    });
  return { api, ctx, db, pedir, sesion, evaluar, llamadas: () => prov.cuentas.evaluate ?? 0, reservas: () => r.cuentas.reserve ?? 0, repo: r.p };
}

/** Comprueba lo común de toda respuesta JSON y devuelve el cuerpo. */
async function leer(res, esperado) {
  assert.equal(res.status, esperado);
  const texto = await res.text();
  assert.ok(!texto.includes("SECRETO-DEL-ESTUDIANTE"), "la respuesta no debe contener el texto del estudiante");
  assert.ok(!texto.includes(TEXTO));
  const c = JSON.parse(texto);
  assert.ok("request_id" in c && "question_id" in c);
  assert.ok(typeof c.version_catalogo === "string");
  return c;
}

test("sesión: crea token, 201 y valida", async () => {
  const t = await montar();
  const c = await leer(await t.pedir("/v1/sesiones", { method: "POST" }), 201);
  assert.match(c.token, /^[0-9a-f]{32}\.\d+\.[A-Za-z0-9_-]+$/);
  assert.equal(c.vence, T0 + 2 * 3_600_000);
});

test("paso 1: 413 sobre 16 KiB y 400 en los casos inválidos", async () => {
  const t = await montar();
  const tk = await t.sesion();
  await leer(await t.evaluar(tk, { respuesta: "a".repeat(17 * 1024) }), 413);
  const crudo = (cuerpo) => t.pedir("/v1/evaluaciones", { method: "POST", headers: { authorization: `Bearer ${tk}` }, body: cuerpo });
  await leer(await crudo("{no json"), 400);
  await leer(await crudo("[]"), 400);
  for (const mal of [
    { request_id: "no-uuid" }, { request_id: undefined }, { question_id: undefined }, { version_catalogo: undefined },
    { modo: "otro" }, { modo: undefined }, { respuesta: "" }, { respuesta: "   " }, { respuesta: undefined }, { respuesta: "a".repeat(4001) },
  ]) {
    await leer(await t.evaluar(tk, mal), 400);
  }
  assert.equal(t.reservas(), 0);
  assert.equal(t.llamadas(), 0);
});

test("paso 2: 401 sin token, falsificado o vencido", async () => {
  const t = await montar();
  const tk = await t.sesion();
  await leer(await t.evaluar(null), 401);
  const [id, vence, firma] = tk.split(".");
  await leer(await t.evaluar(`${id}.${vence}.${firma.slice(0, -2)}AA`), 401);
  await leer(await t.evaluar(`${id}.${Number(vence) + 1}.${firma}`), 401);
  const ajeno = await firmarToken({ id: "f".repeat(32), vence: T0 + 3_600_000 }, CLAVES.sesion); // firma válida, sesión inexistente
  await leer(await t.evaluar(ajeno), 401);
  t.ctx.ahora = Number(vence) + 1;
  await leer(await t.evaluar(tk), 401);
  assert.equal(t.llamadas(), 0);
});

test("paso 3: 404 de pregunta desconocida y 409 de versión", async () => {
  const t = await montar();
  const tk = await t.sesion();
  await leer(await t.evaluar(tk, { question_id: "p-no-existe" }), 404);
  const c = await leer(await t.evaluar(tk, { version_catalogo: "vieja" }), 409);
  assert.equal(c.causa, "version");
  assert.equal(t.reservas(), 0);
});

test("paso 4: todas las preguntas del catálogo real son pending_guide, sin reservar ni invocar", async () => {
  const t = await montar({ catalogo: catalogoReal });
  const tk = await t.sesion();
  for (const p of catalogoReal.preguntas) {
    const c = await leer(await t.evaluar(tk, { question_id: p.id, version_catalogo: catalogoReal.version }), 200);
    assert.deepEqual([c.estado, c.causa, c.question_id], ["no_evaluable", "pending_guide", p.id]);
  }
  assert.equal(t.reservas(), 0);
  assert.equal(t.llamadas(), 0);
});

test("paso 5: IA desactivada o admisión cerrada dan ai_unavailable sin llamadas", async () => {
  for (const config of [{ aiProvider: "disabled" }, { aiProvider: "raro" }, { admision: "cerrada" }]) {
    const t = await montar({ config });
    const c = await leer(await t.evaluar(await t.sesion()), 200);
    assert.deepEqual([c.estado, c.causa], ["no_evaluable", "ai_unavailable"]);
    assert.equal(t.reservas(), 0);
    assert.equal(t.llamadas(), 0);
  }
  const t = await montar({ proveedor: crearDesactivado(), config: { aiProvider: "workers_ai" } });
  const c = await leer(await t.evaluar(await t.sesion()), 200);
  assert.equal(c.causa, "ai_unavailable");
});

test("paso 7: evaluada con tres llamadas, formato de 6.3 y sin texto del estudiante", async () => {
  const t = await montar();
  const c = await leer(await t.evaluar(await t.sesion()), 200);
  assert.equal(c.estado, "evaluada");
  assert.equal(c.veredicto, "parcial");
  assert.equal(c.version_rubrica, 7);
  assert.equal(c.question_id, idEval);
  assert.equal(c.acierto, "C1");
  assert.equal(c.mejorar, "C2");
  assert.equal(c.pista, "Mide el desempeño.");
  assert.equal(c.criterios.find((x) => x.id === "C1").fragmento, F1);
  assert.equal(c.criterios.find((x) => x.id === "C1").fuente, "resultados.html#palabras");
  assert.equal(t.llamadas(), 3);
});

test("duplicada completa devuelve el resultado guardado sin otra ronda, y GET lo lee solo en la misma sesión", async () => {
  const t = await montar();
  const tk = await t.sesion();
  const id = uuid();
  const a = await leer(await t.evaluar(tk, { request_id: id }), 200);
  const b = await leer(await t.evaluar(tk, { request_id: id }), 200);
  assert.deepEqual(b, a);
  assert.equal(t.llamadas(), 3);
  const g = await t.pedir(`/v1/evaluaciones/${id}`, { headers: { authorization: `Bearer ${tk}` } });
  const cg = await leer(g, 200);
  assert.equal(cg.veredicto, "parcial");
  assert.equal(cg.acierto, "C1");
  assert.equal(cg.question_id, idEval);
  const otra = await t.sesion();
  await leer(await t.pedir(`/v1/evaluaciones/${id}`, { headers: { authorization: `Bearer ${otra}` } }), 404);
  await leer(await t.pedir(`/v1/evaluaciones/${id}`), 401);
  await leer(await t.pedir("/v1/evaluaciones/xyz", { headers: { authorization: `Bearer ${tk}` } }), 400);
});

test("doble envío concurrente: una sola ronda de tres llamadas", async () => {
  const guion = { 0.1: { demoraMs: 30, respuesta: lectura() }, 0.2: { demoraMs: 30, respuesta: lectura() }, 0.3: { demoraMs: 30, respuesta: lectura() } };
  const t = await montar({ guion });
  const tk = await t.sesion();
  const id = uuid();
  const [a, b] = await Promise.all([t.evaluar(tk, { request_id: id }), t.evaluar(tk, { request_id: id })]);
  assert.deepEqual([a.status, b.status].sort(), [200, 202]);
  const enCurso = await leer(a.status === 202 ? a : b, 202);
  assert.equal(enCurso.estado, "en_curso");
  assert.equal(t.llamadas(), 3);
  // Mientras corre, GET dice en_curso. Después, el resultado.
  await new Promise((r) => setTimeout(r, 80));
  const g = await leer(await t.pedir(`/v1/evaluaciones/${id}`, { headers: { authorization: `Bearer ${tk}` } }), 200);
  assert.equal(g.estado, "evaluada");
});

test("GET de una evaluación en curso devuelve en_curso", async () => {
  const guion = { 0.1: { demoraMs: 200, respuesta: lectura() }, 0.2: { demoraMs: 200, respuesta: lectura() }, 0.3: { demoraMs: 200, respuesta: lectura() } };
  const t = await montar({ guion });
  const tk = await t.sesion();
  const id = uuid();
  const primera = t.evaluar(tk, { request_id: id });
  await new Promise((r) => setTimeout(r, 30));
  const g = await leer(await t.pedir(`/v1/evaluaciones/${id}`, { headers: { authorization: `Bearer ${tk}` } }), 200);
  assert.equal(g.estado, "en_curso");
  await primera;
});

test("conflicto de contenido 409 y caducada 410", async () => {
  const t = await montar();
  const tk = await t.sesion();
  const id = uuid();
  await leer(await t.evaluar(tk, { request_id: id }), 200);
  const c = await leer(await t.evaluar(tk, { request_id: id, respuesta: `${TEXTO} otra cosa` }), 409);
  assert.equal(c.causa, "contenido");
  t.ctx.ahora = T0 + 31 * 60_000;
  await t.repo.cleanupExpired({ ahora: t.ctx.ahora, lote: 10 });
  const tk2 = await t.sesion(); // la sesión original sigue viva (2 h), se reutiliza su token
  void tk2;
  const k = await leer(await t.evaluar(tk, { request_id: id }), 410);
  assert.equal(k.causa, "caducada");
  await leer(await t.pedir(`/v1/evaluaciones/${id}`, { headers: { authorization: `Bearer ${tk}` } }), 410);
});

test("429 por cupo del día con Retry-After hasta 00:00 UTC y cero llamadas", async () => {
  const t = await montar({ limites: { respuestasDia: 1 } });
  const tk = await t.sesion();
  await leer(await t.evaluar(tk), 200);
  const antes = t.llamadas();
  const res = await t.evaluar(await t.sesion(), { question_id: idEval });
  const c = await leer(res, 429);
  assert.deepEqual([c.estado, c.causa], ["no_evaluable", "quota_exhausted"]);
  assert.equal(res.headers.get("retry-after"), String(14 * 3600));
  assert.equal(t.llamadas(), antes);
});

test("429 por intentos de la pregunta no lleva Retry-After", async () => {
  const t = await montar();
  const tk = await t.sesion();
  await leer(await t.evaluar(tk, { modo: "simular" }), 200);
  const res = await t.evaluar(tk, { modo: "simular" });
  const c = await leer(res, 429);
  assert.equal(c.causa, "quota_exhausted");
  assert.equal(res.headers.get("retry-after"), null);
  assert.equal(t.llamadas(), 3);
});

test("503 ante escritura_ambigua, sin llamadas", async () => {
  const e = Object.assign(new Error("D1"), { codigo: "escritura_ambigua" });
  const t = await montar({ repoExtra: { reserve: async () => { throw e; } } });
  const c = await leer(await t.evaluar(await t.sesion()), 503);
  assert.equal(c.causa, "ai_unavailable");
  assert.equal(t.llamadas(), 0);
});

test("disagreement: 200 no_evaluable, nunca incorrecta y una sola ronda", async () => {
  const guion = { 0.1: lectura(), 0.2: { ...lectura(), veredicto: "correcta", observaciones: obs.map((o) => ({ ...o, estado: "presente", evidencia: F1 })) }, 0.3: lectura() };
  const t = await montar({ guion });
  const c = await leer(await t.evaluar(await t.sesion()), 200);
  assert.deepEqual([c.estado, c.causa], ["no_evaluable", "disagreement"]);
  assert.ok(!("veredicto" in c));
  assert.equal(t.llamadas(), 3);
});

test("fallo técnico (JSON roto o error) da ai_unavailable sin otra ronda", async () => {
  const guion = { 0.1: "no es json", 0.2: new Error("caído"), 0.3: lectura() };
  const t = await montar({ guion });
  const tk = await t.sesion();
  const id = uuid();
  const c = await leer(await t.evaluar(tk, { request_id: id }), 200);
  assert.equal(c.causa, "ai_unavailable");
  assert.ok(!("veredicto" in c));
  const d = await leer(await t.evaluar(tk, { request_id: id }), 200);
  assert.equal(d.causa, "ai_unavailable");
  assert.equal(t.llamadas(), 3);
});

test("ronda vencida: ai_unavailable y reserva indeterminada que se conserva", async () => {
  const lenta = { demoraMs: 5000, respuesta: lectura() };
  const t = await montar({ guion: { 0.1: lenta, 0.2: lenta, 0.3: lenta }, config: { plazoMs: 40 } });
  const tk = await t.sesion();
  const id = uuid();
  const c = await leer(await t.evaluar(tk, { request_id: id }), 200);
  assert.equal(c.causa, "ai_unavailable");
  const fila = await t.db.prepare("SELECT estado, coste_reservado FROM reservas WHERE request_id = ?1").bind(id).first();
  assert.equal(fila.estado, "indeterminada");
  assert.ok(fila.coste_reservado > 0);
  const d = await leer(await t.evaluar(tk, { request_id: id }), 200);
  assert.equal(d.causa, "ai_unavailable");
  assert.equal(t.llamadas(), 3);
  const g = await leer(await t.pedir(`/v1/evaluaciones/${id}`, { headers: { authorization: `Bearer ${tk}` } }), 200);
  assert.equal(g.causa, "ai_unavailable");
});

test("CORS: solo orígenes permitidos, expone Retry-After y OPTIONS funciona", async () => {
  const t = await montar({ config: { origenes: `${ORIGEN}, http://localhost:4321` } });
  const ok = await t.pedir("/v1/salud", { headers: { origin: ORIGEN } });
  assert.equal(ok.headers.get("access-control-allow-origin"), ORIGEN);
  assert.equal(ok.headers.get("access-control-expose-headers"), "Retry-After");
  const mal = await t.pedir("/v1/salud", { headers: { origin: "https://malo.example" } });
  assert.equal(mal.headers.get("access-control-allow-origin"), null);
  const op = await t.pedir("/v1/evaluaciones", { method: "OPTIONS", headers: { origin: "http://localhost:4321" } });
  assert.equal(op.status, 204);
  assert.equal(op.headers.get("access-control-allow-methods"), "GET, POST");
  assert.equal(op.headers.get("access-control-allow-headers"), "content-type, authorization");
  const opMal = await t.pedir("/v1/evaluaciones", { method: "OPTIONS", headers: { origin: "https://malo.example" } });
  assert.equal(opMal.headers.get("access-control-allow-origin"), null);
});

test("salud: proveedor, admisión y versión, y rutas desconocidas", async () => {
  const t = await montar({ config: { admision: "cerrada" } });
  const c = await leer(await t.pedir("/v1/salud"), 200);
  assert.deepEqual([c.proveedor, c.admision, c.version_catalogo], ["fixture", "cerrada", catalogoEval.version]);
  await leer(await t.pedir("/v1/nada"), 404);
  await leer(await t.pedir("/v1/sesiones"), 405);
});

test("index: construye la API desde env, atiende fetch y scheduled", async () => {
  const db = crearD1();
  const env = {
    DB: db, AI_PROVIDER: "disabled", ADMISION: "abierta", ORIGENES: ORIGEN, HMAC_CLAVE: "h", SESION_CLAVE: "s",
  };
  const res = await construirApiDefecto.fetch(new Request("https://w.test/v1/salud"), env);
  const c = await res.json();
  assert.deepEqual([res.status, c.proveedor, c.version_catalogo], [200, "disabled", catalogoReal.version]);
  assert.equal((await construirApiDefecto.fetch(new Request("https://w.test/v1/salud"), { ...env, HMAC_CLAVE: "" })).status, 503);
  await construirApiDefecto.scheduled({}, env);
  assert.equal(typeof construirApi, "function");
});
