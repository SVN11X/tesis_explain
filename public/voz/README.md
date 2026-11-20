# Dictado privado

Archivos que usa el dictado de la práctica de defensa oral cuando el estudiante pulsa «Dictar en este navegador». Se sirven desde el propio sitio, así el navegador no pide nada a terceros y el audio queda en la pestaña.

| Carpeta | Contenido | Versión | Licencia |
|---|---|---|---|
| `transformers/` | Transformers.js, compilación para navegador | 4.3.2 | Apache 2.0 |
| `ort/` | Motor ONNX Runtime Web, WebAssembly con WebGPU | 1.31.0-dev.20260914-8d85527a0 | MIT |
| `whisper-tiny/` | Whisper tiny multilingüe, pesos cuantizados a 8 bits | revisión `ff41770` de onnx-community/whisper-tiny | Apache 2.0 |

Los tres archivos de más de 5 MB (`ort/ort-wasm-simd-threaded.asyncify.wasm`, `whisper-tiny/onnx/decoder_model_merged_quantized.onnx` y `whisper-tiny/onnx/encoder_model_quantized.onnx`, unos 65 MB) no están en git: están en `.gitignore`. La publicación en Pages los descarga con `scripts/descargar_voz.py`, los guarda en caché según el hash de `manifiesto.json` y falla si alguna huella no coincide. El historial de git conserva las versiones antiguas. Los demás archivos de esta carpeta sí están versionados.

Para tenerlos en local, ejecuta en la raíz del repositorio `python scripts/descargar_voz.py`.

Son 71,1 MB. El panel graba al pulsar y descarga el modelo mientras el estudiante habla, mostrando el progreso. Después el navegador los guarda en su caché (`transformers-cache`) y las visitas siguientes no vuelven a descargarlos.

`voz/manifiesto.json` guarda el origen, el tamaño y la huella SHA-256 de cada archivo. Las huellas de los dos pesos coinciden con las que publica Hugging Face para esa revisión.

```bash
python scripts/descargar_voz.py --comprobar   # sin red, revisa que nada cambió
python scripts/descargar_voz.py               # repone lo que falte
```

Para cambiar de versión, edita las constantes de `scripts/descargar_voz.py`, ejecuta `python scripts/descargar_voz.py --manifiesto` y prueba el dictado en Edge, Chrome, Android y Safari antes de publicar. Los avisos de licencia están en `docs/licencias-web/`.
