// Juez: validación de cada lectura del modelo y consenso de tres lecturas.
// Funciones puras, sin dependencias ni entrada/salida. Ver docs/defensa/especificacion.md, sección 3.

export const VEREDICTOS = Object.freeze(["correcta", "parcial", "incorrecta", "indeterminada"]);
export const ESTADOS_CRITERIO = Object.freeze(["presente", "ausente", "contradicho"]);
export const MAX_EVIDENCIA = 300;

const CLAVES_SALIDA = ["veredicto", "observaciones", "pista"];
const CLAVES_OBSERVACION = ["criterio", "estado", "evidencia"];

const esObjeto = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const normalizar = (s) => s.replace(/\s+/g, " ").trim();
const mismasClaves = (obj, claves) => {
  const k = Object.keys(obj);
  return k.length === claves.length && claves.every((c) => k.includes(c));
};

/** Los criterios esenciales de la rúbrica. */
function esenciales(rubrica) {
  return (rubrica.criterios || []).filter((c) => c.tipo === "esencial");
}

/** IDs que exige el juez: esenciales y contradicciones críticas. */
function idsEsperados(rubrica) {
  return [
    ...esenciales(rubrica).map((c) => c.id),
    ...(rubrica.contradicciones_criticas || []).map((x) => x.id),
  ];
}

/**
 * Valida la salida de una lectura del modelo.
 * @param {unknown} salida Objeto ya convertido desde el JSON del modelo.
 * @param {object} rubrica Rúbrica aprobada de la pregunta.
 * @param {string} textoConfirmado Respuesta confirmada del estudiante.
 * @returns {{valida: true, veredicto: string, observaciones: object[], pista: string|null}|{valida: false, motivo: string}}
 */
export function validarLectura(salida, rubrica, textoConfirmado) {
  const no = (motivo) => ({ valida: false, motivo });
  if (!esObjeto(salida)) return no("la salida no es un objeto");
  if (!mismasClaves(salida, CLAVES_SALIDA)) return no("faltan o sobran claves en la salida");
  if (!VEREDICTOS.includes(salida.veredicto)) return no("veredicto fuera de lo permitido");
  if (salida.pista !== null && typeof salida.pista !== "string") return no("pista inválida");
  if (!Array.isArray(salida.observaciones)) return no("observaciones no es una lista");

  const esperados = idsEsperados(rubrica);
  const vistos = new Set();
  const texto = normalizar(String(textoConfirmado ?? ""));

  for (const o of salida.observaciones) {
    if (!esObjeto(o) || !mismasClaves(o, CLAVES_OBSERVACION)) return no("observación mal formada");
    if (typeof o.criterio !== "string" || !esperados.includes(o.criterio)) return no("criterio que no está en la rúbrica");
    if (vistos.has(o.criterio)) return no("criterio repetido");
    vistos.add(o.criterio);
    if (!ESTADOS_CRITERIO.includes(o.estado)) return no("estado fuera de lo permitido");
    if (o.evidencia === null) {
      if (o.estado !== "ausente") return no("evidencia nula con estado presente o contradicho");
    } else {
      if (typeof o.evidencia !== "string") return no("evidencia inválida");
      if (o.evidencia.length > MAX_EVIDENCIA) return no("evidencia de más de 300 caracteres");
      const frag = normalizar(o.evidencia);
      if (frag === "") return no("evidencia vacía");
      if (!texto.includes(frag)) return no("evidencia que no es texto literal de la respuesta");
    }
  }
  if (esperados.some((id) => !vistos.has(id))) return no("falta la observación de un criterio");

  const hay = salida.observaciones.some((o) => o.evidencia !== null);
  const esperado = veredictoPorReglas(salida.observaciones, rubrica, hay);
  // El modelo siempre puede abstenerse con `indeterminada`. Cualquier otro veredicto debe coincidir con las reglas.
  if (salida.veredicto !== "indeterminada" && esperado !== salida.veredicto) return no("el veredicto del modelo no coincide con las reglas");

  return {
    valida: true,
    veredicto: salida.veredicto,
    observaciones: salida.observaciones.map((o) => ({ criterio: o.criterio, estado: o.estado, evidencia: o.evidencia })),
    pista: salida.pista,
  };
}

/**
 * Calcula el veredicto que dictan las reglas de la rúbrica, en este orden:
 * contradicción crítica con evidencia, todos los esenciales presentes, algún esencial presente
 * o contenido pertinente con algo faltante, y nada pertinente (`incorrecta` si la rúbrica lo permite,
 * si no `indeterminada`). Un esencial contradicho cuenta como ausente.
 * @param {object[]} observaciones
 * @param {object} rubrica
 * @param {boolean} [hayContenidoPertinente] Por defecto, si alguna observación tiene evidencia.
 * @returns {"correcta"|"parcial"|"incorrecta"|"indeterminada"}
 */
export function veredictoPorReglas(observaciones, rubrica, hayContenidoPertinente) {
  const hay = hayContenidoPertinente ?? observaciones.some((o) => o.evidencia !== null && o.evidencia !== undefined);
  const porId = new Map(observaciones.map((o) => [o.criterio, o]));

  const criticas = (rubrica.contradicciones_criticas || []).map((x) => porId.get(x.id));
  if (criticas.some((o) => o && o.estado === "contradicho" && o.evidencia)) return "incorrecta";

  const ess = esenciales(rubrica).map((c) => porId.get(c.id));
  const presentes = ess.filter((o) => o && o.estado === "presente").length;
  if (ess.length > 0 && presentes === ess.length) return "correcta";
  if (presentes > 0 || hay) return "parcial";
  return rubrica.permite_incorrecta_ajena ? "incorrecta" : "indeterminada";
}

const noEvaluable = (causa) => ({ estado: "no_evaluable", causa });

/**
 * Consenso de tres lecturas (resultado de validarLectura o null), en el orden de temperatura
 * 0,1, 0,2 y 0,3. En `evaluada`, evidencia y pista salen de la lectura a 0,2 (la segunda).
 * @param {Array<object|null>} lecturas
 * @returns {{estado: "evaluada", veredicto: string, observaciones: object[], pista: string|null}|{estado: "no_evaluable", causa: string}}
 */
export function consenso(lecturas) {
  if (!Array.isArray(lecturas) || lecturas.length !== 3 || lecturas.some((l) => !l || l.valida !== true)) {
    return noEvaluable("ai_unavailable");
  }
  const [a, b, c] = lecturas;
  if (a.veredicto !== b.veredicto || b.veredicto !== c.veredicto) return noEvaluable("disagreement");
  if (a.veredicto === "indeterminada") return noEvaluable("insufficient_evidence");

  const estados = (l) => new Map(l.observaciones.map((o) => [o.criterio, o.estado]));
  const [ea, eb, ec] = [estados(a), estados(b), estados(c)];
  if (ea.size !== eb.size || ec.size !== eb.size) return noEvaluable("disagreement");
  for (const [id, estado] of eb) {
    if (ea.get(id) !== estado || ec.get(id) !== estado) return noEvaluable("disagreement");
  }

  return {
    estado: "evaluada",
    veredicto: b.veredicto,
    observaciones: b.observaciones.map((o) => ({ criterio: o.criterio, estado: o.estado, evidencia: o.evidencia })),
    pista: b.pista,
  };
}

/**
 * Veredicto de una sola lectura, para la comparación de la validación con el voto a 0,2.
 * @param {object|null} lectura Resultado de validarLectura o null.
 * @returns {string|null} El veredicto, o null si la lectura falta o es inválida.
 */
export function votoUnico(lectura) {
  return lectura && lectura.valida === true ? lectura.veredicto : null;
}
