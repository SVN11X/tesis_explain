import { test } from "node:test";
import assert from "node:assert/strict";
import { validarLectura, veredictoPorReglas, consenso, votoUnico } from "../src/juez.mjs";

const rubrica = {
  estado: "candidata",
  criterios: [
    { id: "C1", tipo: "esencial", texto: "Mapeo y localización verificados." },
    { id: "C2", tipo: "esencial", texto: "Navegación solo verificada en funcionamiento." },
  ],
  alternativas_validas: [],
  contradicciones_criticas: [{ id: "X1", texto: "Afirmar error final medido." }],
  permite_incorrecta_ajena: true,
};
const TEXTO = "El mapeo y la localizacion  quedaron\nverificados en el robot real, pero Nav2 no se midio.";
const F1 = "El mapeo y la localizacion quedaron verificados";
const F2 = "Nav2 no se midio";

const obs = (c1, c2, x1 = ["ausente", null]) => [
  { criterio: "C1", estado: c1[0], evidencia: c1[1] },
  { criterio: "C2", estado: c2[0], evidencia: c2[1] },
  { criterio: "X1", estado: x1[0], evidencia: x1[1] },
];
const salida = (veredicto, observaciones, pista = null) => ({ veredicto, observaciones, pista });
const P1 = ["presente", F1];
const P2 = ["presente", F2];
const A = ["ausente", null];
const parcial = () => salida("parcial", obs(P1, A), "pista");
const lectura = (s) => validarLectura(s, rubrica, TEXTO);

test("veredictoPorReglas: reglas 1 a 4", () => {
  assert.equal(veredictoPorReglas(obs(P1, P2, ["contradicho", "x"]), rubrica, true), "incorrecta");
  assert.equal(veredictoPorReglas(obs(P1, P2), rubrica, true), "correcta");
  assert.equal(veredictoPorReglas(obs(P1, A), rubrica, true), "parcial");
  assert.equal(veredictoPorReglas(obs(P1, ["contradicho", F2]), rubrica, true), "parcial");
  assert.equal(veredictoPorReglas(obs(A, A), rubrica, true), "parcial");
  assert.equal(veredictoPorReglas(obs(A, A), { ...rubrica, permite_incorrecta_ajena: false }, false), "indeterminada");
});

test("respuesta ajena: incorrecta si la rúbrica lo permite, si no indeterminada", () => {
  const sin = { ...rubrica, permite_incorrecta_ajena: false };
  assert.equal(veredictoPorReglas(obs(A, A), rubrica, false), "incorrecta");
  assert.equal(veredictoPorReglas(obs(A, A), sin, false), "indeterminada");
});

test("un esencial contradicho con evidencia y nada presente da parcial", () => {
  assert.equal(veredictoPorReglas(obs(["contradicho", F1], A), rubrica), "parcial");
  assert.equal(lectura(salida("parcial", obs(["contradicho", F1], A))).valida, true);
});

test("el modelo puede abstenerse con indeterminada aunque las reglas den correcta", () => {
  const s = salida("indeterminada", obs(P1, P2));
  const l = lectura(s);
  assert.equal(l.valida, true);
  assert.deepEqual(consenso([l, l, l]), { estado: "no_evaluable", causa: "insufficient_evidence" });
  assert.equal(lectura({ ...s, veredicto: "incorrecta" }).valida, false);
});

test("una contradicción crítica sin evidencia no cuenta", () => {
  assert.equal(veredictoPorReglas(obs(P1, P2, ["contradicho", null]), rubrica, true), "correcta");
});

test("validarLectura acepta una lectura correcta", () => {
  const r = lectura(parcial());
  assert.equal(r.valida, true);
  assert.equal(r.veredicto, "parcial");
});

test("validarLectura rechaza estructura inválida", () => {
  const ok = parcial();
  const casos = [
    null,
    [],
    { veredicto: "parcial", observaciones: ok.observaciones },
    { ...ok, extra: 1 },
    { ...ok, veredicto: "bien" },
    { ...ok, pista: 3 },
    { ...ok, observaciones: "x" },
    { ...ok, observaciones: ok.observaciones.slice(0, 2) },
    { ...ok, observaciones: [...ok.observaciones, { criterio: "C9", estado: "ausente", evidencia: null }] },
    { ...ok, observaciones: [...ok.observaciones, ok.observaciones[0]] },
    { ...ok, observaciones: ok.observaciones.map((o) => ({ ...o, estado: "quizas" })) },
    { ...ok, observaciones: ok.observaciones.map((o) => ({ ...o, otra: 1 })) },
  ];
  for (const c of casos) assert.equal(lectura(c).valida, false);
});

test("evidencia: literal tras normalizar espacios, máximo 300, no nula si presente", () => {
  assert.equal(lectura(salida("parcial", obs(["presente", "El  mapeo y la\tlocalizacion"], A))).valida, true);
  assert.equal(lectura(salida("parcial", obs(["presente", "El mapeo fue perfecto"], A))).valida, false);
  assert.equal(lectura(salida("parcial", obs(["presente", null], A))).valida, false);
  assert.equal(lectura(salida("parcial", obs(P1, ["contradicho", null]))).valida, false);
  const largo = "palabra ".repeat(50).trim();
  assert.ok(largo.length > 300);
  assert.equal(validarLectura(salida("parcial", obs(["presente", largo], A)), rubrica, largo).valida, false);
});

test("un veredicto distinto al de las reglas es inválido", () => {
  assert.equal(lectura(salida("correcta", obs(P1, A))).valida, false);
});

test("contradicción crítica respaldada da incorrecta aunque estén los esenciales", () => {
  const s = salida("incorrecta", obs(P1, P2, ["contradicho", F2]));
  assert.equal(lectura(s).veredicto, "incorrecta");
  assert.equal(lectura({ ...s, veredicto: "correcta" }).valida, false);
});

test("consenso: null o inválida da ai_unavailable", () => {
  const l = lectura(parcial());
  const esperado = { estado: "no_evaluable", causa: "ai_unavailable" };
  assert.deepEqual(consenso([l, l, null]), esperado);
  assert.deepEqual(consenso([l, l, { valida: false, motivo: "x" }]), esperado);
  assert.deepEqual(consenso([l, l]), esperado);
});

test("consenso: veredictos distintos dan disagreement", () => {
  const c = lectura(salida("correcta", obs(P1, P2)));
  assert.deepEqual(consenso([c, c, lectura(parcial())]), { estado: "no_evaluable", causa: "disagreement" });
  assert.deepEqual(consenso([c, lectura(parcial()), c]), { estado: "no_evaluable", causa: "disagreement" });
});

test("consenso: tres indeterminada dan insufficient_evidence", () => {
  const r = { ...rubrica, permite_incorrecta_ajena: false };
  const l = validarLectura(salida("indeterminada", obs(A, A)), r, TEXTO);
  assert.equal(l.valida, true);
  assert.deepEqual(consenso([l, l, l]), { estado: "no_evaluable", causa: "insufficient_evidence" });
});

test("consenso: mismo veredicto con estados incompatibles da disagreement", () => {
  const a = lectura(salida("parcial", obs(P1, A)));
  const b = lectura(salida("parcial", obs(A, P2)));
  assert.deepEqual(consenso([a, b, a]), { estado: "no_evaluable", causa: "disagreement" });
});

test("consenso: tres parcial con la misma omisión es evaluada con datos de la lectura a 0,2", () => {
  const a = lectura(salida("parcial", obs(["presente", "El mapeo"], A), "pista 0,1"));
  const b = lectura(salida("parcial", obs(["presente", F1], A), "pista 0,2"));
  const c = lectura(salida("parcial", obs(["presente", "localizacion"], A), "pista 0,3"));
  const r = consenso([a, b, c]);
  assert.equal(r.estado, "evaluada");
  assert.equal(r.veredicto, "parcial");
  assert.equal(r.pista, "pista 0,2");
  assert.equal(r.observaciones.find((o) => o.criterio === "C1").evidencia, F1);
  assert.equal(r.observaciones.find((o) => o.criterio === "C2").estado, "ausente");
});

test("consenso: dos correcta y una parcial dan disagreement", () => {
  const c = lectura(salida("correcta", obs(P1, P2)));
  assert.deepEqual(consenso([c, c, lectura(parcial())]), { estado: "no_evaluable", causa: "disagreement" });
});

test("consenso: dos válidas y una inválida o ausente dan ai_unavailable", () => {
  const l = lectura(parcial());
  const mala = validarLectura({ basura: true }, rubrica, TEXTO);
  assert.equal(consenso([l, l, mala]).causa, "ai_unavailable");
  assert.equal(consenso([null, l, l]).causa, "ai_unavailable");
});

test("votoUnico devuelve el veredicto de una lectura", () => {
  assert.equal(votoUnico(lectura(parcial())), "parcial");
  assert.equal(votoUnico(null), null);
  assert.equal(votoUnico({ valida: false, motivo: "x" }), null);
});
