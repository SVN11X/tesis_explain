// Contrato HTTP del Worker (especificación, apartado 6). Se prueba sin Workers: `manejar(request)`.
import { consenso } from "./juez.mjs";
import { evaluarConProveedor } from "./proveedores.mjs";
import { costeReservado } from "./cuotas.mjs";
import { construirMensajes } from "./prompt.mjs";
import { firmarToken, hmacBase64url, idAleatorio, verificarToken } from "./sesion.mjs";

export const MAX_CUERPO = 16 * 1024;
export const MAX_RESPUESTA = 4000;
const SESION_MS = 2 * 3_600_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const normalizar = (t) => String(t).replace(/\s+/g, " ").trim();

/** Nombre del proveedor según AI_PROVIDER: cualquier valor desconocido equivale a disabled. */
export function nombreProveedor(valor) {
  return valor === "workers_ai" || valor === "fixture" ? valor : "disabled";
}

/** Segundos hasta las 00:00 UTC siguientes. */
export function segundosHastaMedianoche(ahora) {
  const d = new Date(ahora);
  const siguiente = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return Math.max(1, Math.ceil((siguiente - ahora) / 1000));
}

/**
 * Pasa el resultado de `consenso` a lo que se guarda: solo códigos y posiciones, nunca el texto.
 * `rango` es [inicio, fin] dentro del texto con espacios normalizados.
 */
export function aGuardado(res, texto) {
  if (res.estado !== "evaluada") return { estado: "no_evaluable", causa: res.causa };
  const norm = normalizar(texto);
  return {
    estado: "evaluada",
    veredicto: res.veredicto,
    pista: res.pista ?? null,
    criterios: res.observaciones.map((o) => {
      const ini = o.evidencia ? norm.indexOf(normalizar(o.evidencia)) : -1;
      return {
        id: o.criterio,
        estado: o.estado,
        rango: ini >= 0 ? [ini, ini + normalizar(o.evidencia).length] : null,
      };
    }),
  };
}

export function crearApi({ repo, proveedor, catalogo, claves, config = {}, reloj = () => Date.now() }) {
  const origenes = (Array.isArray(config.origenes) ? config.origenes : String(config.origenes ?? "").split(","))
    .map((o) => o.trim())
    .filter(Boolean);
  const nombre = nombreProveedor(config.aiProvider);
  const admision = config.admision === "cerrada" ? "cerrada" : "abierta";
  const plazoMs = config.plazoMs ?? 20000;
  const sesionMs = config.sesionMs ?? SESION_MS;
  const porId = new Map(catalogo.preguntas.map((p) => [p.id, p]));

  function cabecerasCors(request) {
    const origen = request.headers.get("origin");
    if (!origen || !origenes.includes(origen)) return {};
    return {
      "Access-Control-Allow-Origin": origen,
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "content-type, authorization",
      "Access-Control-Expose-Headers": "Retry-After",
      "Access-Control-Max-Age": "600",
      Vary: "Origin",
    };
  }

  function json(request, estado, cuerpo, extra = {}, ids = {}) {
    const lleno = {
      ...cuerpo,
      request_id: ids.request_id ?? cuerpo.request_id ?? null,
      question_id: ids.question_id ?? cuerpo.question_id ?? null,
      version_catalogo: catalogo.version,
    };
    return new Response(JSON.stringify(lleno), {
      status: estado,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...cabecerasCors(request), ...extra },
    });
  }

  const noEvaluable = (causa, extra = {}) => ({ estado: "no_evaluable", causa, ...extra });

  /** Arma el cuerpo de 6.3 (o de un no_evaluable) desde lo guardado. `texto` puede faltar: sin él no hay fragmentos. */
  function cuerpoDesdeGuardado(g, pregunta, texto) {
    const base = { question_id: pregunta.id, version_rubrica: pregunta.rubrica?.version ?? null };
    if (g.estado !== "evaluada") return { ...base, estado: "no_evaluable", causa: g.causa };
    const rubrica = pregunta.rubrica;
    const norm = texto == null ? null : normalizar(texto);
    const info = new Map();
    for (const c of rubrica.criterios) info.set(c.id, { texto: c.texto, fuente: c.fuente ?? null, esencial: c.tipo === "esencial" });
    for (const x of rubrica.contradicciones_criticas ?? []) info.set(x.id, { texto: x.texto, fuente: x.fuente ?? null, esencial: false });
    const criterios = g.criterios.map((c) => ({
      id: c.id,
      estado: c.estado,
      texto: info.get(c.id)?.texto ?? null,
      fragmento: norm && c.rango ? norm.slice(c.rango[0], c.rango[1]) : null,
      fuente: info.get(c.id)?.fuente ?? null,
    }));
    const esencial = (c) => info.get(c.id)?.esencial === true;
    const acierto = criterios.find((c) => esencial(c) && c.estado === "presente")?.id ?? null;
    const mejorar =
      criterios.find((c) => (esencial(c) && c.estado !== "presente") || (!esencial(c) && c.estado === "contradicho"))?.id ?? null;
    return { ...base, estado: "evaluada", veredicto: g.veredicto, criterios, acierto, mejorar, pista: g.pista ?? null };
  }

  async function sesionDe(request) {
    const m = /^Bearer (\S+)$/.exec(request.headers.get("authorization") ?? "");
    const ahora = reloj();
    const t = await verificarToken(m?.[1], claves.sesion, ahora);
    if (!t) return null;
    if (!(await repo.sesionValida({ id: t.id, ahora }))) return null;
    return t.id;
  }

  const ambiguo = (e) => e && e.codigo === "escritura_ambigua";

  async function crearSesionHttp(request) {
    const ahora = reloj();
    const id = idAleatorio();
    const vence = ahora + sesionMs;
    try {
      await repo.crearSesion({ id, ahora, duracionMs: sesionMs });
    } catch (e) {
      if (ambiguo(e)) return json(request, 503, noEvaluable("ai_unavailable"));
      throw e;
    }
    return json(request, 201, { token: await firmarToken({ id, vence }, claves.sesion), vence });
  }

  async function evaluar(request) {
    // Paso 1: tamaño y forma del cuerpo.
    const declarado = Number(request.headers.get("content-length") ?? 0);
    if (declarado > MAX_CUERPO) return json(request, 413, { estado: "error", causa: "cuerpo_grande" });
    const crudo = await request.text();
    if (new TextEncoder().encode(crudo).length > MAX_CUERPO) return json(request, 413, { estado: "error", causa: "cuerpo_grande" });
    let cuerpo;
    try {
      cuerpo = JSON.parse(crudo);
    } catch {
      return json(request, 400, { estado: "error", causa: "json_invalido" });
    }
    const ids = {
      request_id: typeof cuerpo?.request_id === "string" && UUID.test(cuerpo.request_id) ? cuerpo.request_id : null,
      question_id: typeof cuerpo?.question_id === "string" ? cuerpo.question_id.slice(0, 80) : null,
    };
    const invalido = (detalle) => json(request, 400, { estado: "error", causa: "solicitud_invalida", detalle }, {}, ids);
    if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) return invalido("cuerpo");
    const { request_id, question_id, version_catalogo, modo, respuesta } = cuerpo;
    if (typeof question_id !== "string" || !question_id) return invalido("question_id");
    if (typeof version_catalogo !== "string" || !version_catalogo) return invalido("version_catalogo");
    if (modo !== "entrenar" && modo !== "simular") return invalido("modo");
    if (typeof request_id !== "string" || !UUID.test(request_id)) return invalido("request_id");
    if (typeof respuesta !== "string" || !respuesta.trim() || respuesta.length > MAX_RESPUESTA) return invalido("respuesta");

    // Paso 2: sesión.
    const sessionId = await sesionDe(request);
    if (!sessionId) return json(request, 401, { estado: "error", causa: "sesion" }, {}, ids);

    // Paso 3: pregunta y versión.
    const pregunta = porId.get(question_id);
    if (!pregunta) return json(request, 404, { estado: "error", causa: "pregunta" }, {}, ids);
    if (version_catalogo !== catalogo.version) {
      return json(request, 409, { estado: "error", causa: "version" }, {}, ids);
    }
    const ver = { version_rubrica: pregunta.rubrica?.version ?? null };

    // Paso 4: pregunta sin rúbrica aprobada.
    if (!pregunta.evaluable || !pregunta.rubrica) {
      return json(request, 200, noEvaluable("pending_guide", ver), {}, ids);
    }

    // Paso 5: IA apagada o admisión cerrada.
    if (nombre === "disabled" || admision === "cerrada") {
      return json(request, 200, noEvaluable("ai_unavailable", ver), {}, ids);
    }

    // Paso 6: reserva.
    const contenido = await hmacBase64url(claves.hmac, `${question_id}\n${version_catalogo}\n${respuesta}`);
    const mensajes = construirMensajes({ rubrica: pregunta.rubrica, pregunta: pregunta.enunciado, texto: respuesta });
    const coste = costeReservado(mensajes.reduce((n, m) => n + m.content.length, 0));
    const ahora = reloj();
    let reserva;
    try {
      reserva = await repo.reserve({ sessionId, requestId: request_id, questionId: question_id, contentHmac: contenido, modo, coste, ahora });
    } catch (e) {
      if (ambiguo(e)) return json(request, 503, noEvaluable("ai_unavailable", ver), {}, ids);
      throw e;
    }
    switch (reserva.tipo) {
      case "duplicada":
        if (reserva.estado === "completa" && reserva.resultado) {
          return json(request, 200, cuerpoDesdeGuardado(reserva.resultado, pregunta, respuesta), {}, ids);
        }
        if (reserva.estado === "indeterminada") return json(request, 200, noEvaluable("ai_unavailable", ver), {}, ids);
        return json(request, 202, { estado: "en_curso", ...ver }, {}, ids);
      case "caducada":
        return json(request, 410, { estado: "error", causa: "caducada" }, {}, ids);
      case "conflicto":
        return json(request, 409, { estado: "error", causa: "contenido" }, {}, ids);
      case "sin_cupo":
        return json(
          request,
          429,
          noEvaluable("quota_exhausted", { motivo: reserva.motivo, ...ver }),
          reserva.motivo === "dia" ? { "Retry-After": String(segundosHastaMedianoche(ahora)) } : {},
          ids,
        );
      case "admitida":
        break;
      default:
        return json(request, 503, noEvaluable("ai_unavailable", ver), {}, ids);
    }

    // Paso 7: una sola ronda de tres lecturas.
    let guardado;
    let vencida = false;
    const inicioRonda = Date.now();
    let registro = { tecnico: null, detalle: null };
    try {
      const { lecturas, tecnico, detalle } = await evaluarConProveedor(
        proveedor,
        { rubrica: pregunta.rubrica, pregunta: pregunta.enunciado, texto: respuesta },
        { plazoMs },
      );
      registro = { tecnico, detalle };
      vencida = tecnico.vencidas > 0;
      guardado = aGuardado(consenso(lecturas), respuesta);
    } catch (e) {
      registro.detalle = ["ronda: " + String((e && e.message) || e).slice(0, 160)];
      vencida = true;
      guardado = { estado: "no_evaluable", causa: "ai_unavailable" };
    }
    // Registro técnico de la ronda (propuesta: «el conteo técnico registra el fallo del proveedor o del esquema»).
    // Lleva solo identificadores, conteos y motivos fijos: nunca la respuesta del estudiante.
    console.log(JSON.stringify({
      evento: "ronda", request_id, question_id, version_catalogo, version_rubrica: ver.version_rubrica,
      ms: Date.now() - inicioRonda, ...registro, estado: guardado.estado, causa: guardado.causa ?? null, veredicto: guardado.veredicto ?? null,
    }));
    try {
      if (vencida) await repo.marcarIndeterminada({ sessionId, requestId: request_id });
      else await repo.complete({ sessionId, requestId: request_id, resultado: { ...guardado, question_id, version_catalogo, version_rubrica: ver.version_rubrica }, ahora: reloj() });
    } catch (e) {
      if (!ambiguo(e)) throw e;
      return json(request, 503, noEvaluable("ai_unavailable", ver), {}, ids);
    }
    if (vencida) return json(request, 200, noEvaluable("ai_unavailable", ver), {}, ids);
    return json(request, 200, cuerpoDesdeGuardado(guardado, pregunta, respuesta), {}, ids);
  }

  async function consultar(request, requestId) {
    if (!UUID.test(requestId)) return json(request, 400, { estado: "error", causa: "solicitud_invalida", detalle: "request_id" });
    const ids = { request_id: requestId };
    const sessionId = await sesionDe(request);
    if (!sessionId) return json(request, 401, { estado: "error", causa: "sesion" }, {}, ids);
    let fila;
    try {
      fila = await repo.getResult({ sessionId, requestId });
    } catch (e) {
      if (ambiguo(e)) return json(request, 503, noEvaluable("ai_unavailable"), {}, ids);
      throw e;
    }
    if (!fila) return json(request, 404, { estado: "error", causa: "evaluacion" }, {}, ids);
    if (fila.estado === "purgada") return json(request, 410, { estado: "error", causa: "caducada" }, {}, ids);
    if (fila.estado === "indeterminada") return json(request, 200, noEvaluable("ai_unavailable"), {}, ids);
    if (fila.estado === "en_curso" || !fila.resultado) return json(request, 200, { estado: "en_curso" }, {}, ids);
    const g = fila.resultado;
    const pregunta = porId.get(g.question_id);
    if (!pregunta || g.version_catalogo !== catalogo.version) {
      return json(request, 200, noEvaluable(g.causa ?? "ai_unavailable"), {}, { ...ids, question_id: g.question_id ?? null });
    }
    return json(request, 200, cuerpoDesdeGuardado(g, pregunta, null), {}, ids);
  }

  return {
    async manejar(request) {
      try {
        const { pathname } = new URL(request.url);
        if (request.method === "OPTIONS") {
          const cors = cabecerasCors(request);
          return new Response(null, { status: Object.keys(cors).length ? 204 : 403, headers: cors });
        }
        if (pathname === "/v1/salud" && request.method === "GET") {
          return json(request, 200, { proveedor: nombre, admision });
        }
        if (pathname === "/v1/sesiones" && request.method === "POST") return await crearSesionHttp(request);
        if (pathname === "/v1/evaluaciones" && request.method === "POST") return await evaluar(request);
        const m = /^\/v1\/evaluaciones\/([^/]+)$/.exec(pathname);
        if (m && request.method === "GET") return await consultar(request, m[1]);
        const conocida = pathname === "/v1/salud" || pathname === "/v1/sesiones" || pathname === "/v1/evaluaciones" || m;
        return json(request, conocida ? 405 : 404, { estado: "error", causa: conocida ? "metodo" : "ruta" });
      } catch {
        return json(request, 500, { estado: "error", causa: "interno" });
      }
    },
  };
}
