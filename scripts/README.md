# scripts

Generators, checks and build helpers. Run them from the repository root. Page and data paths below are inside `public/`, except `indice.py` and `verificar_sitio.py`, which read the built site in `dist/` (run `npm run build` first).

- `bibliografia.py`: validates `datos/bibliografia.json` and builds the bibliography blocks and `.bib`.
- `catalogo_defensa.py`: builds `datos/defensa/catalogo.json` from `preguntas.html` (`--comprobar` checks it).
- `cifras_*_antes.json`: figures of each page before folding, read by `comparar_resumen.py`.
- `comparar_resumen.py`: compares a page's figures with its saved list.
- `css_critico.py`: writes the head of the guide pages: inline fonts, the `<style data-critico></style>` marker, non-blocking full sheets and the script loader (used by `datos.py`). `python scripts/css_critico.py dist` replaces that marker with the critical CSS in the built pages.
- `datos.py`: writes `datos/proyecto.js` and the static HTML blocks from JSON and CSV (`--comprobar`).
- `descarga_preguntas.py`: builds the questions PDF, its manifest and the download button (`--comprobar`).
- `descargar_voz.py`: downloads and checks the voice assets (`--comprobar`, `--manifiesto`).
- `diagramas_control.js`, `diagramas_mapeo.js`, `diagramas_plano.js`: regenerate the fallback SVG diagrams (`--comprobar`).
- `ejemplos_laboratorio.js`: regenerates the synthetic laboratory examples (`--comprobar`).
- `imagen_social.py`: renders the social preview image `public/img/social.png` (`--comprobar` checks its size).
- `voz_natural.py`: pre-generates the natural voice of the questions and summaries into `public/audio/` with Qwen3-TTS on a GPU. `--comprobar` needs no GPU. Reference voice: `voz-referencia.wav` and `.txt`.
- `variantes_imagen.py`: makes the 640 px WebP variants for phones and the narrow home poster, and writes their `srcset` in `public/*.html` (`--comprobar`).
- `indice.py`: builds `dist/datos/indice.js` and `dist/datos/secciones.js` from the built pages (`--comprobar`). `npm run build` runs it.
- `marco.py`: applies the shared header, footer and theme templates to the pages.
- `modelo_robot.py`: prepares the robot CAD model from a STEP file.
- `planificacion.py`: builds the costs and Gantt blocks, used by `datos.py`.
- `plantillas/`: HTML templates (`cabecera.html`, `pie.html`, `tema.html`) used by `marco.py`.
- `validacion_defensa.mjs`: computes metrics from labelled defense runs (JSONL).
- `verificar_sitio.py`: checks data, index, links and anchors of the built site in `dist/`.
- `subconjunto_fuentes.py`: rebuilds `public/fuentes/*.woff2` from the originals in `fuentes-origen/`, keeping only the characters the site uses and the normal width of Archivo (`--comprobar` fails if a used character is missing). Needs `fonttools` and `brotli`. Run it again when a page uses a character that is not in the fonts.
- `fuentes-origen/`: the original, unsubsetted woff2 files and their source.
- `requisitos.txt`: pinned Python dependencies that CI installs.
- `requisitos-opcionales.txt`: dependencies of the tools run by hand, such as `modelo_robot.py`.
