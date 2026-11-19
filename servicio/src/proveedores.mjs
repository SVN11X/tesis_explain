// Proveedores de IA y ronda de tres lecturas. Ver docs/defensa/especificacion.md, sección 5.
import { validarLectura } from "./juez.mjs";
import { construirMensajes, ESQUEMA_SALIDA } from "./prompt.mjs";

export const MODELO_PRINCIPAL = "@cf/ibm-granite/granite-4.0-h-micro";

/**
 * Modelos que el dueño puede elegir con AI_MODELO, con su tarifa publicada en Neurons por millón de tokens
 * (developers.cloudflare.com/workers-ai/platform/pricing, consultada el 19 de noviembre de 2026).
 * Un ID fuera de esta lista desactiva la IA: nunca se cambia de modelo solo, y cada cambio exige repetir la validación.
 */
export const MODELOS = Object.freeze({
  "@cf/ibm-granite/granite-4.0-h-micro": Object.freeze({ entrada: 1542, salida: 10158 }),
  // Gemma 4 razona antes de responder y, con 500 tokens, se corta sin escribir la respuesta (fin: length).
  "@cf/google/gemma-4-26b-a4b-it": Object.freeze({ entrada: 9091, salida: 27273, opciones: Object.freeze({ chat_template_kwargs: { enable_thinking: false } }) }),
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast": Object.freeze({ entrada: 26668, salida: 204805 }),
});

/**
 * @typedef {object} AIProvider
 * @property {(p: {mensajes: object[], temperatura: number, maxTokens: number, esquema: object, senal?: AbortSignal}) => Promise<string>} evaluate
 *   Devuelve el texto de la respuesta del modelo.
 * @property {() => Promise<{ok: boolean, modelo: string|null}>} healthCheck
 */

function errorConCodigo(mensaje, codigo) {
  const e = new Error(mensaje);
  e.codigo = codigo;
  return e;
}

/**
 * Adaptador de Workers AI. Ningún otro modelo se elige solo si este falla.
 * @param {{run: Function}} ai Binding `AI` del Worker.
 * @param {string} [modelo]
 * @returns {AIProvider}
 */
export function crearWorkersAI(ai, modelo = MODELO_PRINCIPAL) {
  return {
    modelo,
    tarifa: MODELOS[modelo] ?? MODELOS[MODELO_PRINCIPAL],
    async evaluate({ mensajes, temperatura, maxTokens, esquema }) {
      const respuesta = await ai.run(modelo, {
        ...((MODELOS[modelo] || {}).opciones || {}),
        messages: mensajes,
        temperature: temperatura,
        max_tokens: maxTokens,
        response_format: { type: "json_schema", json_schema: esquema },
      });
      // Algunos modelos de Workers AI, como Granite 4.0, responden con el formato de OpenAI
      // (choices[0].message.content) y no con `response`. Se aceptan los dos.
      const eleccion = respuesta?.choices?.[0];
      const r = respuesta?.response ?? eleccion?.message?.content;
      if (r === undefined || r === null || r === "") {
        // Solo datos técnicos, sin contenido: por qué terminó, cuántos tokens usó y si hubo razonamiento aparte.
        const razonamiento = Boolean(eleccion?.message?.reasoning_content || eleccion?.message?.reasoning);
        throw new Error("respuesta del modelo sin texto (fin: " + (eleccion?.finish_reason ?? "?") + ", tokens de salida: "
          + (respuesta?.usage?.completion_tokens ?? "?") + ", razonamiento: " + (razonamiento ? "sí" : "no") + ")");
      }
      return typeof r === "string" ? r : JSON.stringify(r);
    },
    async healthCheck() {
      return { ok: typeof ai?.run === "function", modelo };
    },
  };
}

/**
 * Proveedor de pruebas sin red. `guion` se indexa por temperatura (0.1, 0.2, 0.3) o es una función
 * de la temperatura. Cada entrada es un texto, un objeto (se serializa), un `Error` (la llamada falla)
 * o `{demoraMs, respuesta}` para simular demora. La demora respeta la señal de cancelación.
 * @param {Record<string|number, any>|((t: number) => any)} guion
 * @returns {AIProvider}
 */
export function crearFixture(guion) {
  return {
    async evaluate({ temperatura, senal }) {
      let entrada = typeof guion === "function" ? guion(temperatura) : guion[temperatura];
      if (entrada === undefined) throw errorConCodigo("el guion no tiene respuesta para esa temperatura", "ai_unavailable");
      if (entrada && typeof entrada === "object" && "demoraMs" in entrada) {
        await new Promise((resolver, rechazar) => {
          const t = setTimeout(resolver, entrada.demoraMs);
          senal?.addEventListener("abort", () => { clearTimeout(t); rechazar(errorConCodigo("cancelada", "ai_unavailable")); }, { once: true });
        });
        entrada = entrada.respuesta;
      }
      if (entrada instanceof Error) throw entrada;
      return typeof entrada === "string" ? entrada : JSON.stringify(entrada);
    },
    async healthCheck() {
      return { ok: true, modelo: "fixture" };
    },
  };
}

/** Proveedor apagado: toda evaluación falla con `codigo = "ai_unavailable"`. @returns {AIProvider} */
export function crearDesactivado() {
  return {
    async evaluate() {
      throw errorConCodigo("la IA está desactivada", "ai_unavailable");
    },
    async healthCheck() {
      return { ok: false, modelo: null };
    },
  };
}

/**
 * Elige el proveedor por `env.AI_PROVIDER`: workers_ai, fixture o disabled. Cualquier otro valor equivale a disabled.
 * Con workers_ai, `env.AI_MODELO` elige uno de MODELOS (Granite por defecto). Un ID desconocido desactiva la IA.
 * @param {{AI_PROVIDER?: string, AI_MODELO?: string, AI?: object, FIXTURE_GUION?: any}} env
 * @returns {AIProvider}
 */
export function crearProveedor(env = {}) {
  switch (env.AI_PROVIDER) {
    case "workers_ai":
      if (!env.AI) return crearDesactivado();
      if (env.AI_MODELO && !MODELOS[env.AI_MODELO]) return crearDesactivado();
      return crearWorkersAI(env.AI, env.AI_MODELO || MODELO_PRINCIPAL);
    case "fixture":
      return crearFixture(env.FIXTURE_GUION ?? {});
    default:
      return crearDesactivado();
  }
}

/**
 * Ronda de tres lecturas en paralelo, una por temperatura y con el mismo prompt.
 * Una llamada que falla, vence o no devuelve JSON da `null`.
 * @param {AIProvider} proveedor
 * @param {{rubrica: object, pregunta: string, texto: string}} datos
 * @param {{temperaturas?: number[], plazoMs?: number}} [opciones]
 * @returns {Promise<{lecturas: Array<object|null>, tecnico: {fallos: number, vencidas: number, malformadas: number}, detalle: string[]}>}
 */
export async function evaluarConProveedor(proveedor, { rubrica, pregunta, texto }, { temperaturas = [0.1, 0.2, 0.3], plazoMs = 20000 } = {}) {
  const mensajes = construirMensajes({ rubrica, pregunta, texto });
  const tecnico = { fallos: 0, vencidas: 0, malformadas: 0 };
  // Motivo de cada lectura, sin el texto del estudiante: alimenta el registro técnico de la ronda.
  const detalle = temperaturas.map(() => "ok");

  const una = async (temperatura, i) => {
    const control = new AbortController();
    let temporizador;
    const vence = new Promise((_, rechazar) => {
      temporizador = setTimeout(() => {
        control.abort();
        rechazar({ vencida: true });
      }, plazoMs);
    });
    let crudo;
    try {
      crudo = await Promise.race([
        Promise.resolve().then(() => proveedor.evaluate({ mensajes, temperatura, maxTokens: 500, esquema: ESQUEMA_SALIDA, senal: control.signal })),
        vence,
      ]);
    } catch (e) {
      if (e && e.vencida === true) { tecnico.vencidas++; detalle[i] = "vencida"; }
      else { tecnico.fallos++; detalle[i] = "fallo: " + String((e && e.message) || e).slice(0, 160); }
      return null;
    } finally {
      clearTimeout(temporizador);
    }
    let salida;
    try {
      salida = JSON.parse(crudo);
    } catch {
      tecnico.malformadas++;
      const s = String(crudo).trim();
      // Solo la forma de la salida (largo y bordes), nunca su contenido.
      detalle[i] = "malformada: " + s.length + " caracteres, empieza " + JSON.stringify(s.slice(0, 1)) + ", termina " + JSON.stringify(s.slice(-1));
      return null;
    }
    const lectura = validarLectura(salida, rubrica, texto);
    if (!lectura.valida) detalle[i] = "invalida: " + lectura.motivo;
    else if (!lectura.coherente) detalle[i] = "ok (el modelo dijo " + lectura.veredictoModelo + ", las reglas " + lectura.veredicto + ")";
    return lectura;
  };

  const lecturas = await Promise.all(temperaturas.map(una));
  return { lecturas, tecnico, detalle };
}
