# Dictado privado

Archivos que usa el dictado de la práctica de defensa oral cuando el estudiante pulsa «Dictar en este navegador». Se sirven desde el propio sitio, así el navegador no pide nada a terceros y el audio queda en la pestaña.

| Carpeta | Contenido | Versión | Licencia |
|---|---|---|---|
| `transformers/` | Transformers.js, compilación para navegador | 4.3.2 | Apache 2.0 |
| `ort/` | Motor ONNX Runtime Web, WebAssembly con WebGPU | 1.31.0-dev.20260914-8d85527a0 | MIT |
| `whisper-tiny/` | Whisper tiny multilingüe, pesos cuantizados a 8 bits | revisión `ff41770` de onnx-community/whisper-tiny | Apache 2.0 |

Son 71,1 MB. El panel muestra ese tamaño antes de descargar y antes de pedir el micrófono.

`voz/manifiesto.json` guarda el origen, el tamaño y la huella SHA-256 de cada archivo. Las huellas de los dos pesos coinciden con las que publica Hugging Face para esa revisión.

```bash
python herramientas/descargar_voz.py --comprobar   # sin red, revisa que nada cambió
python herramientas/descargar_voz.py               # repone lo que falte
```

Para cambiar de versión, edita las constantes de `herramientas/descargar_voz.py`, ejecuta `python herramientas/descargar_voz.py --manifiesto` y prueba el dictado en Edge, Chrome, Android y Safari antes de publicar. Los avisos de licencia están en `docs/licencias-web/`.
