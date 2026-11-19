// Proveedores de IA y ronda de tres lecturas. Ver docs/defensa/especificacion.md, sección 5.
import { validarLectura } from "./juez.mjs";
import { construirMensajes, ESQUEMA_SALIDA } from "./prompt.mjs";

export const MODELO_PRINCIPAL = "@cf/ibm-granite/granite-4.0-h-micro";

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
    async evaluate({ mensajes, temperatura, maxTokens, esquema }) {
      const respuesta = await ai.run(modelo, {
        messages: mensajes,
        temperature: temperatura,
        max_tokens: maxTokens,
        response_format: { type: "json_schema", json_schema: esquema },
      });
      const r = respuesta?.response;
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
 * @param {{AI_PROVIDER?: string, AI?: object, FIXTURE_GUION?: any}} env
 * @returns {AIProvider}
 */
export function crearProveedor(env = {}) {
  switch (env.AI_PROVIDER) {
    case "workers_ai":
      return env.AI ? crearWorkersAI(env.AI) : crearDesactivado();
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
 * @returns {Promise<{lecturas: Array<object|null>, tecnico: {fallos: number, vencidas: number, malformadas: number}}>}
 */
export async function evaluarConProveedor(proveedor, { rubrica, pregunta, texto }, { temperaturas = [0.1, 0.2, 0.3], plazoMs = 20000 } = {}) {
  const mensajes = construirMensajes({ rubrica, pregunta, texto });
  const tecnico = { fallos: 0, vencidas: 0, malformadas: 0 };

  const una = async (temperatura) => {
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
      if (e && e.vencida === true) tecnico.vencidas++;
      else tecnico.fallos++;
      return null;
    } finally {
      clearTimeout(temporizador);
    }
    let salida;
    try {
      salida = JSON.parse(crudo);
    } catch {
      tecnico.malformadas++;
      return null;
    }
    return validarLectura(salida, rubrica, texto);
  };

  const lecturas = await Promise.all(temperaturas.map(una));
  return { lecturas, tecnico };
}
