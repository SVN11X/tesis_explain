// Cuotas y duplicados sobre D1 (especificación, apartado 4).
// ESM puro, sin dependencias. Solo usa la API del binding D1.
// Todos los tiempos son milisegundos UTC y llegan como `ahora`.

const TARIFA_ENTRADA = 1542; // Neurons por millón de tokens de entrada
const TARIFA_SALIDA = 10158; // Neurons por millón de tokens de salida
const SALIDA_MAXIMA = 500;
const LLAMADAS = 3;

export const LIMITES_POR_DEFECTO = Object.freeze({
  respuestasDia: 100,
  neuronsDia: 7000,
  intentosEntrenar: 2,
  intentosSimular: 1,
  respuestasSesion: 6,
  rondaMs: 60_000,
  resultadoMs: 30 * 60_000,
  registroMs: 48 * 3_600_000,
});

/** Neurons que se reservan por respuesta (tres lecturas). */
export function costeReservado(caracteresPrompt) {
  const tokensEntrada = Math.ceil(caracteresPrompt / 2);
  return (LLAMADAS * (tokensEntrada * TARIFA_ENTRADA + SALIDA_MAXIMA * TARIFA_SALIDA)) / 1_000_000;
}

/** Día UTC en formato AAAA-MM-DD. */
export function diaUtc(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function errorAmbiguo(causa) {
  const e = new Error(`Escritura ambigua en D1: ${causa?.message ?? causa}`);
  e.codigo = "escritura_ambigua";
  e.cause = causa;
  return e;
}

// Una sola sentencia admite o no: todas las comprobaciones van en el WHERE.
const SQL_RESERVAR = `
INSERT INTO reservas
  (session_id, request_id, question_id, content_hmac, dia_utc, modo, estado,
   coste_reservado, llamadas_reservadas, creada, vence_ronda, vence_resultado, vence_registro, resultado)
SELECT ?1, ?2, ?3, ?4, ?5, ?6, 'en_curso', ?7, 3, ?8, ?9, NULL, ?10, NULL
WHERE EXISTS (SELECT 1 FROM sesiones WHERE id = ?1 AND vence > ?8)
  AND (SELECT COUNT(*) FROM reservas WHERE session_id = ?1 AND question_id = ?3) < ?11
  AND (SELECT COUNT(*) FROM reservas WHERE session_id = ?1) < ?12
  AND (SELECT COUNT(*) FROM reservas WHERE dia_utc = ?5) < ?13
  AND (SELECT COALESCE(SUM(coste_reservado), 0) FROM reservas WHERE dia_utc = ?5) + ?7 <= ?14
ON CONFLICT DO NOTHING
RETURNING request_id`;

export function crearRepositorioD1(db, limites = {}) {
  const lim = { ...LIMITES_POR_DEFECTO, ...limites };

  async function escribir(fn) {
    try {
      return await fn();
    } catch (e) {
      throw errorAmbiguo(e);
    }
  }

  async function contar(sql, ...valores) {
    const fila = await db.prepare(sql).bind(...valores).first();
    return Number(fila?.n ?? 0);
  }

  async function motivoSinCupo({ sessionId, questionId, modo, ahora }) {
    const sesion = await db
      .prepare("SELECT 1 AS ok FROM sesiones WHERE id = ?1 AND vence > ?2")
      .bind(sessionId, ahora)
      .first();
    if (!sesion) return "sesion";
    const enSesion = await contar("SELECT COUNT(*) AS n FROM reservas WHERE session_id = ?1", sessionId);
    if (enSesion >= lim.respuestasSesion) return "sesion";
    const intentos = await contar(
      "SELECT COUNT(*) AS n FROM reservas WHERE session_id = ?1 AND question_id = ?2",
      sessionId,
      questionId,
    );
    const maxIntentos = modo === "simular" ? lim.intentosSimular : lim.intentosEntrenar;
    if (intentos >= maxIntentos) return "pregunta";
    return "dia";
  }

  return {
    async reserve({ sessionId, requestId, questionId, contentHmac, modo, coste, ahora }) {
      const maxIntentos = modo === "simular" ? lim.intentosSimular : lim.intentosEntrenar;
      const fila = await escribir(() =>
        db
          .prepare(SQL_RESERVAR)
          .bind(
            sessionId, requestId, questionId, contentHmac, diaUtc(ahora), modo, coste, ahora,
            ahora + lim.rondaMs, ahora + lim.registroMs,
            maxIntentos, lim.respuestasSesion, lim.respuestasDia, lim.neuronsDia,
          )
          .first(),
      );
      if (fila) return { tipo: "admitida" };

      // Lo que sigue solo lee para clasificar el resultado.
      const previa = await db
        .prepare(
          "SELECT content_hmac, estado, resultado FROM reservas WHERE session_id = ?1 AND request_id = ?2",
        )
        .bind(sessionId, requestId)
        .first();
      if (previa) {
        if (previa.content_hmac !== contentHmac) return { tipo: "conflicto" };
        if (previa.estado === "purgada") return { tipo: "caducada" };
        return {
          tipo: "duplicada",
          estado: previa.estado,
          resultado: previa.resultado ? JSON.parse(previa.resultado) : null,
        };
      }
      return { tipo: "sin_cupo", motivo: await motivoSinCupo({ sessionId, questionId, modo, ahora }) };
    },

    async complete({ sessionId, requestId, resultado, ahora }) {
      const r = await escribir(() =>
        db
          .prepare(
            `UPDATE reservas SET resultado = ?3, estado = 'completa', vence_resultado = ?4
             WHERE session_id = ?1 AND request_id = ?2 AND estado <> 'purgada'`,
          )
          .bind(sessionId, requestId, JSON.stringify(resultado), ahora + lim.resultadoMs)
          .run(),
      );
      if (r?.meta?.changes !== 1) throw errorAmbiguo("la reserva no se actualizó");
    },

    async marcarIndeterminada({ sessionId, requestId }) {
      const r = await escribir(() =>
        db
          .prepare(
            `UPDATE reservas SET estado = 'indeterminada'
             WHERE session_id = ?1 AND request_id = ?2 AND estado = 'en_curso'`,
          )
          .bind(sessionId, requestId)
          .run(),
      );
      if (r?.meta?.changes !== 1) throw errorAmbiguo("la reserva no se actualizó");
    },

    async getResult({ sessionId, requestId } = {}) {
      if (!sessionId || !requestId) return null;
      const fila = await db
        .prepare("SELECT estado, resultado FROM reservas WHERE session_id = ?1 AND request_id = ?2")
        .bind(sessionId, requestId)
        .first();
      if (!fila) return null;
      return { estado: fila.estado, resultado: fila.resultado ? JSON.parse(fila.resultado) : null };
    },

    /** Purga resultados y borra registros vencidos, en lotes. Devuelve los totales. */
    async cleanupExpired({ ahora, lote = 100 }) {
      let purgadas = 0;
      let borradas = 0;
      for (;;) {
        const r = await escribir(() =>
          db
            .prepare(
              `UPDATE reservas SET estado = 'purgada', resultado = NULL
               WHERE rowid IN (SELECT rowid FROM reservas
                 WHERE vence_resultado IS NOT NULL AND vence_resultado <= ?1 AND estado <> 'purgada'
                 LIMIT ?2)`,
            )
            .bind(ahora, lote)
            .run(),
        );
        const n = r?.meta?.changes ?? 0;
        purgadas += n;
        if (n < lote) break;
      }
      for (;;) {
        const r = await escribir(() =>
          db
            .prepare(
              `DELETE FROM reservas
               WHERE rowid IN (SELECT rowid FROM reservas WHERE vence_registro <= ?1 LIMIT ?2)`,
            )
            .bind(ahora, lote)
            .run(),
        );
        const n = r?.meta?.changes ?? 0;
        borradas += n;
        if (n < lote) break;
      }
      return { purgadas, borradas };
    },

    async crearSesion({ id, ahora, duracionMs }) {
      await escribir(() =>
        db
          .prepare("INSERT INTO sesiones (id, creada, vence) VALUES (?1, ?2, ?3)")
          .bind(id, ahora, ahora + duracionMs)
          .run(),
      );
    },

    async sesionValida({ id, ahora }) {
      const fila = await db
        .prepare("SELECT 1 AS ok FROM sesiones WHERE id = ?1 AND vence > ?2")
        .bind(id, ahora)
        .first();
      return Boolean(fila);
    },
  };
}
