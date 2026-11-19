import { test } from "node:test";
import assert from "node:assert/strict";
import { crearRepositorioD1, costeReservado } from "../src/cuotas.mjs";
import { crearD1 } from "./sqlite-d1.mjs";

const T0 = Date.UTC(2026, 10, 18, 10, 0, 0);
const MIN = 60_000;

async function preparar(limites = {}, sesiones = ["s1"]) {
  const db = crearD1();
  const repo = crearRepositorioD1(db, limites);
  for (const id of sesiones) await repo.crearSesion({ id, ahora: T0, duracionMs: 60 * MIN });
  return { db, repo };
}

const pedido = (o = {}) => ({
  sessionId: "s1", requestId: "r1", questionId: "q1", contentHmac: "h1",
  modo: "entrenar", coste: 22.176, ahora: T0, ...o,
});

test("costeReservado(3000) es 22,176", () => {
  assert.ok(Math.abs(costeReservado(3000) - 22.176) < 1e-9);
});

test("admite y detecta duplicada, también en paralelo", async () => {
  const { repo } = await preparar();
  const [a, b] = await Promise.all([repo.reserve(pedido()), repo.reserve(pedido())]);
  assert.deepEqual([a.tipo, b.tipo].sort(), ["admitida", "duplicada"]);
  assert.equal([a, b].find((x) => x.tipo === "duplicada").estado, "en_curso");
});

test("mismo id con otro contenido da conflicto", async () => {
  const { repo } = await preparar();
  await repo.reserve(pedido());
  assert.deepEqual(await repo.reserve(pedido({ contentHmac: "otro" })), { tipo: "conflicto" });
});

test("sesión inexistente o vencida da sin_cupo sesion", async () => {
  const { repo } = await preparar();
  assert.deepEqual(await repo.reserve(pedido({ sessionId: "nadie" })), { tipo: "sin_cupo", motivo: "sesion" });
  assert.deepEqual(await repo.reserve(pedido({ ahora: T0 + 61 * MIN })), { tipo: "sin_cupo", motivo: "sesion" });
});

test("el último cupo del día lo gana uno solo", async () => {
  const { repo } = await preparar({ respuestasDia: 1 }, ["s1", "s2"]);
  const [a, b] = await Promise.all([
    repo.reserve(pedido()),
    repo.reserve(pedido({ sessionId: "s2", requestId: "r2" })),
  ]);
  assert.deepEqual([a, b].map((x) => x.tipo).sort(), ["admitida", "sin_cupo"]);
  assert.equal([a, b].find((x) => x.tipo === "sin_cupo").motivo, "dia");
});

test("el tope de Neurons del día se respeta", async () => {
  const { repo } = await preparar({ neuronsDia: 30 });
  assert.equal((await repo.reserve(pedido({ requestId: "a", questionId: "q1" }))).tipo, "admitida");
  assert.deepEqual(await repo.reserve(pedido({ requestId: "b", questionId: "q2" })), { tipo: "sin_cupo", motivo: "dia" });
});

test("un día UTC nuevo reinicia el cupo diario", async () => {
  const { repo } = await preparar({ respuestasDia: 1 });
  await repo.reserve(pedido());
  const otroDia = T0 + 24 * 60 * MIN;
  await repo.crearSesion({ id: "s3", ahora: otroDia, duracionMs: 60 * MIN });
  assert.equal((await repo.reserve(pedido({ sessionId: "s3", ahora: otroDia }))).tipo, "admitida");
});

test("Simular permite un intento por pregunta y Entrenar dos", async () => {
  const { repo } = await preparar();
  assert.equal((await repo.reserve(pedido({ requestId: "a", modo: "simular" }))).tipo, "admitida");
  assert.deepEqual(await repo.reserve(pedido({ requestId: "b", modo: "simular" })), { tipo: "sin_cupo", motivo: "pregunta" });
  assert.equal((await repo.reserve(pedido({ requestId: "c", questionId: "q2" }))).tipo, "admitida");
  assert.equal((await repo.reserve(pedido({ requestId: "d", questionId: "q2" }))).tipo, "admitida");
  assert.deepEqual(await repo.reserve(pedido({ requestId: "e", questionId: "q2" })), { tipo: "sin_cupo", motivo: "pregunta" });
});

test("el tope de respuestas por sesión se respeta", async () => {
  const { repo } = await preparar({ respuestasSesion: 2 });
  await repo.reserve(pedido({ requestId: "a", questionId: "q1" }));
  await repo.reserve(pedido({ requestId: "b", questionId: "q2" }));
  assert.deepEqual(await repo.reserve(pedido({ requestId: "c", questionId: "q3" })), { tipo: "sin_cupo", motivo: "sesion" });
});

test("complete guarda el resultado y duplicada lo devuelve", async () => {
  const { repo } = await preparar();
  await repo.reserve(pedido());
  await repo.complete({ sessionId: "s1", requestId: "r1", resultado: { veredicto: "cumple" }, ahora: T0 });
  assert.deepEqual(await repo.reserve(pedido()), { tipo: "duplicada", estado: "completa", resultado: { veredicto: "cumple" } });
});

test("marcarIndeterminada conserva la reserva y su coste", async () => {
  const { repo } = await preparar({ respuestasDia: 1 }, ["s1", "s2"]);
  await repo.reserve(pedido());
  await repo.marcarIndeterminada({ sessionId: "s1", requestId: "r1" });
  assert.equal((await repo.getResult({ sessionId: "s1", requestId: "r1" })).estado, "indeterminada");
  assert.equal((await repo.reserve(pedido({ sessionId: "s2", requestId: "x" }))).tipo, "sin_cupo");
});

test("getResult exige sesión e id de petición", async () => {
  const { repo } = await preparar();
  await repo.reserve(pedido());
  await repo.complete({ sessionId: "s1", requestId: "r1", resultado: { a: 1 }, ahora: T0 });
  assert.equal(await repo.getResult({ sessionId: "s1" }), null);
  assert.equal(await repo.getResult({ requestId: "r1" }), null);
  assert.equal(await repo.getResult({ sessionId: "s2", requestId: "r1" }), null);
  assert.deepEqual(await repo.getResult({ sessionId: "s1", requestId: "r1" }), { estado: "completa", resultado: { a: 1 } });
});

test("cleanupExpired purga a los 30 min sin liberar cupo y borra a las 48 h", async () => {
  const { repo } = await preparar({ respuestasDia: 3 });
  for (const id of ["a", "b", "c"]) {
    await repo.reserve(pedido({ requestId: id, questionId: id, modo: "simular" }));
    await repo.complete({ sessionId: "s1", requestId: id, resultado: { id }, ahora: T0 });
  }
  assert.deepEqual(await repo.cleanupExpired({ ahora: T0 + 29 * MIN, lote: 2 }), { purgadas: 0, borradas: 0 });
  assert.deepEqual(await repo.cleanupExpired({ ahora: T0 + 31 * MIN, lote: 2 }), { purgadas: 3, borradas: 0 });
  assert.deepEqual(await repo.getResult({ sessionId: "s1", requestId: "a" }), { estado: "purgada", resultado: null });
  const t = T0 + 32 * MIN;
  assert.deepEqual(await repo.reserve(pedido({ requestId: "a", questionId: "a", modo: "simular", ahora: t })), { tipo: "caducada" });
  assert.deepEqual(
    await repo.reserve(pedido({ requestId: "z", questionId: "a", modo: "simular", ahora: t })),
    { tipo: "sin_cupo", motivo: "pregunta" },
  );
  assert.deepEqual(
    await repo.reserve(pedido({ requestId: "y", questionId: "n", ahora: t })),
    { tipo: "sin_cupo", motivo: "dia" },
  );
  assert.deepEqual(await repo.cleanupExpired({ ahora: T0 + 49 * 60 * MIN, lote: 2 }), { purgadas: 0, borradas: 3 });
  assert.equal(await repo.getResult({ sessionId: "s1", requestId: "a" }), null);
});

test("un fallo de escritura lanza escritura_ambigua", async () => {
  const { db, repo } = await preparar();
  await repo.reserve(pedido());
  db.close();
  await assert.rejects(
    () => repo.complete({ sessionId: "s1", requestId: "r1", resultado: {}, ahora: T0 }),
    (e) => e instanceof Error && e.codigo === "escritura_ambigua",
  );
  await assert.rejects(
    () => repo.reserve(pedido({ requestId: "r2" })),
    (e) => e.codigo === "escritura_ambigua",
  );
});

test("completar una reserva inexistente es ambiguo", async () => {
  const { repo } = await preparar();
  await assert.rejects(
    () => repo.complete({ sessionId: "s1", requestId: "no", resultado: {}, ahora: T0 }),
    (e) => e.codigo === "escritura_ambigua",
  );
});

test("costeReservado usa la tarifa del modelo: Gemma 4 reserva 81,82 Neurons con 1.500 tokens de entrada", () => {
  assert.ok(Math.abs(costeReservado(3000, { entrada: 9091, salida: 27273 }) - 81.819) < 0.01);
  assert.ok(Math.abs(costeReservado(3000) - 22.176) < 0.001);
});
