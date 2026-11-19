/*
  Web Worker de módulo del dictado privado (docs/defensa/especificacion.md, 8.2). Lo crea js/defensa-voz.js.

  Todo sale de voz/, en este mismo sitio: la biblioteca, el motor ONNX Runtime Web y los pesos de Whisper tiny.
  No se permite ningún modelo remoto, así el navegador no pide nada a terceros.

  Mensajes que recibe:  {tipo: "iniciar", total, dispositivo}  (con "wasm" omite WebGPU)  y  {tipo: "transcribir", audio: Float32Array a 16 kHz mono}
  Mensajes que envía:   {tipo: "progreso", cargado, total}, {tipo: "listo", dispositivo}, {tipo: "texto", texto},
                        {tipo: "reintentar", dispositivo: "wasm"} y {tipo: "error", mensaje}
*/
import { pipeline, env } from "../voz/transformers/transformers.min.js";

const RAIZ = new URL("../voz/", self.location.href).href;

env.allowRemoteModels = false;
env.allowLocalModels = true;
/* ruta desde la raíz del sitio: con una URL absoluta la biblioteca no comprueba los archivos locales */
env.localModelPath = new URL("../voz/", self.location.href).pathname;
env.backends.onnx.wasm.wasmPaths = {
  mjs: RAIZ + "ort/ort-wasm-simd-threaded.asyncify.mjs",
  wasm: RAIZ + "ort/ort-wasm-simd-threaded.asyncify.wasm"
};
/* GitHub Pages no aísla el origen, así que no hay hilos compartidos */
env.backends.onnx.wasm.numThreads = 1;

let reconocedor = null;
let iniciando = null;
let totalDeclarado = 0;
const archivos = new Map();

function avisarProgreso(evento) {
  if (!evento || typeof evento.file !== "string") return;
  if (evento.status === "progress" || evento.status === "done") {
    const total = evento.total > 0 ? evento.total : (archivos.get(evento.file) || {}).total || 0;
    const cargado = evento.status === "done" ? total : evento.loaded || 0;
    archivos.set(evento.file, { cargado, total });
  }
  let cargado = 0, total = 0;
  archivos.forEach((a) => { cargado += a.cargado; total += a.total; });
  self.postMessage({ tipo: "progreso", cargado, total: Math.max(total, totalDeclarado) });
}

async function crear(dispositivo) {
  return pipeline("automatic-speech-recognition", "whisper-tiny", {
    dtype: "q8",
    device: dispositivo,
    progress_callback: avisarProgreso
  });
}

async function hayAdaptadorWebGPU() {
  try {
    return !!(self.navigator && self.navigator.gpu && (await self.navigator.gpu.requestAdapter()));
  } catch (e) {
    return false;
  }
}

async function iniciar(dispositivo) {
  if (dispositivo !== "wasm" && (await hayAdaptadorWebGPU())) {
    try {
      reconocedor = await crear("webgpu");
      self.postMessage({ tipo: "listo", dispositivo: "webgpu" });
      return;
    } catch (e) {
      /* la biblioteca memoiza la carga fallida, así que el respaldo va en un Worker nuevo */
      self.postMessage({ tipo: "reintentar", dispositivo: "wasm" });
      return;
    }
  }
  reconocedor = await crear("wasm");
  self.postMessage({ tipo: "listo", dispositivo: "wasm" });
}

self.onmessage = async (evento) => {
  const msg = evento.data || {};
  try {
    if (msg.tipo === "iniciar") {
      totalDeclarado = msg.total > 0 ? msg.total : 0;
      if (!iniciando) iniciando = iniciar(msg.dispositivo);
      await iniciando;
    } else if (msg.tipo === "transcribir") {
      if (!reconocedor) throw new Error("El modelo aún no está listo");
      const salida = await reconocedor(msg.audio, { language: "spanish", task: "transcribe", chunk_length_s: 30 });
      self.postMessage({ tipo: "texto", texto: String((salida && salida.text) || "").trim() });
    }
  } catch (e) {
    self.postMessage({ tipo: "error", mensaje: String((e && e.message) || e) });
  }
};
