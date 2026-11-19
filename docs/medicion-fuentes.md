# Medición de las tres familias tipográficas

Medido el 2026-11-19 sobre `main` (12ded43), con Playwright (Chromium) y un servidor local en `/tesis_explain/`, contexto nuevo por página (caché vacía). Los bytes son los del cuerpo de cada respuesta `.woff2` y el servidor no recomprime, igual que el archivo en disco (woff2 ya está comprimido). No se midió `gzip` ni red real.

## 1. Peso

Archivos en `fuentes/`:

| Archivo | Bytes |
|---|---|
| archivo-latin-variable.woff2 | 56.044 |
| atkinson-hyperlegible-latin-400-normal.woff2 | 17.208 |
| atkinson-hyperlegible-latin-400-italic.woff2 | 18.292 |
| atkinson-hyperlegible-latin-700-normal.woff2 | 17.524 |
| ibm-plex-mono-latin-400-normal.woff2 | 14.708 |
| ibm-plex-mono-latin-600-normal.woff2 | 15.620 |

Primera visita, bytes descargados por familia:

| Página | Archivo | Atkinson | Plex Mono | Total |
|---|---|---|---|---|
| index.html | 56.044 (1 archivo) | 17.208 (1) | 14.708 (1) | 87.960 |
| control.html | 56.044 (1) | 53.024 (3) | 30.328 (2) | 139.396 |
| preguntas.html | 56.044 (1) | 53.024 (3) | 30.328 (2) | 139.396 |

Precarga (`rel="preload"`): control.html y preguntas.html precargan los tres archivos de peso 400 (Archivo, Atkinson 400, Plex 400). index.html precarga solo Archivo. El resto (Atkinson 700 y cursiva, Plex 600) se descarga al usarse. La portada solo usa un peso de Atkinson y uno de Plex.

## 2. Uso

Líneas de CSS con `font-family` que nombran la familia (`grep -c`, no son selectores únicos):

| Archivo CSS | Archivo (títulos) | Atkinson (texto) | Plex Mono (etiquetas) |
|---|---|---|---|
| css/estilo.css | 26 | 6 | 58 |
| css/marco.css | 3 | 0 | 6 |
| css/preguntas.css | 3 | 0 | 10 |
| css/mapeo.css | 1 | 1 | 4 |
| css/movimiento.css | 1 | 0 | 2 |
| css/evidencia.css | 1 | 2 | 1 |
| css/laboratorio.css | 0 | 1 | 0 |
| web/src/styles/experience.css | 2 | 2 | 2 |

Atkinson es la fuente por defecto de `body` y `:root`, por eso tiene pocas líneas explícitas.

Nodos de texto visibles, elementos y caracteres que calculan a cada familia (`getComputedStyle` del elemento padre, primera familia de la pila):

| Página | Familia | Nodos | Elementos | Caracteres |
|---|---|---|---|---|
| index.html | Atkinson | 301 | 268 | 11.040 |
| | Archivo | 129 | 120 | 2.128 |
| | Plex Mono | 118 | 108 | 1.325 |
| control.html | Atkinson | 558 | 440 | 45.013 |
| | Archivo | 117 | 114 | 2.061 |
| | Plex Mono | 257 | 257 | 2.309 |
| preguntas.html | Atkinson | 940 | 770 | 88.624 |
| | Archivo | 151 | 150 | 8.771 |
| | Plex Mono | 463 | 463 | 2.299 |

Bytes por cada 1.000 caracteres en control.html: Archivo 27,2 KB, Plex Mono 13,1 KB, Atkinson 1,2 KB.

## 3. Función de Plex Mono

En `css/estilo.css` y los demás: etiquetas en mayúsculas (`.eyebrow`, `.etiqueta`, `.estado`, `.tipo`), migas, numeración (`.n`, `.q-n`, `.bib-n`), lecturas y unidades (`.lecturas b`, `.lr-unidad`, `.mp-readings b`), fórmulas (`.formula-bloque`, `.mp-equation`), `kbd` y `code`, tablas de pasos y marcadores `+` de los desplegables.

Cifras tabulares, prueba con anchos renderizados a 20 px (`111`, `000`):

| Familia | normal 111 / 000 | tabular-nums 111 / 000 |
|---|---|---|
| Atkinson | 24,1 / 38,9 | 38,3 / 38,3 |
| Plex Mono | 28,5 / 30,0 | 28,5 / 30,0 |
| Archivo | 27,8 / 30,0 | 27,8 / 27,8 en ambos (sin cambio al activar) |

Atkinson sí tiene cifras tabulares (`tnum`): con `tabular-nums` el ancho de `111` y `000` se iguala. Plex Mono es monoespaciada, siempre iguales. Archivo no cambia al activarlo, así que no tiene `tnum`. No se inspeccionó con fontTools porque falta el módulo brotli para leer woff2.

Conclusión: las cifras alineadas no justifican por sí solas a Plex Mono, porque Atkinson ya las alinea con `tabular-nums`. Lo que solo da Plex Mono es el aspecto de código, fórmula y etiqueta técnica.

## 4. Riesgo de CLS

El README dice que las fuentes de las páginas de la guía usan `font-display: optional` con respaldos de métrica ajustada. Se comprobó: `css/estilo.css` tiene 6 `@font-face` con `font-display: optional` y bloques de respaldo para Archivo y Atkinson (Arial, Roboto, DejaVu). Plex Mono no tiene respaldo ajustado, cae a `ui-monospace`.

Dos hallazgos:

- `web/src/styles/experience.css` (portada) declara las tres con `font-display: swap`, sin respaldo ajustado. El README no lo dice.
- Quitar una familia no cambia la regla `optional`. Solo se borraría su `@font-face` y su bloque de respaldo. Quitar Archivo pasaría los títulos a Atkinson 700, que ya está cargada, y habría que revisar el CLS con `pruebas_experiencia_navegador.py`.

## Decisión

Mantener las tres familias. La razón escrita está en la sección Tipografía de `DESIGN.md`. No se cambió ningún CSS. No se midió CLS con las fuentes quitadas.
