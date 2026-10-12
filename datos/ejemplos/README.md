# Ejemplos sintéticos del laboratorio

Estos archivos **no son datos del robot ni de la tesis**. Se generan con `node herramientas/ejemplos_laboratorio.js` para probar los formatos del [Laboratorio de análisis](../../laboratorio.html) y sus reglas.

| Archivo | Qué representa |
|---|---|
| `mapa-sintetico-a.pgm` y `.yaml` | Recinto rectangular de 4 × 3 m inventado, explorado en parte, con un tabique y una caja. Formato de `map_saver` en modo trinario: 254 libre, 0 ocupado y 205 desconocido. |
| `mapa-sintetico-b.pgm` y `.yaml` | El mismo marco y la misma resolución, más explorado y con la caja en otro lugar, para la comparación celda a celda. |
| `estados-metas-sintetico.csv` | Registro inventado de estados de `NavigateToPose`: una meta que ya aparece abortada, reemplazos cada 3,3 s, una completada y una sin estado final. |

Los mapas y registros originales del prototipo no están publicados. Cuando se autoricen, deben ir en otra carpeta, con su procedencia, versión y fecha, y no reemplazar estos ejemplos.

Licencia CC BY 4.0, como el resto del contenido del sitio.
