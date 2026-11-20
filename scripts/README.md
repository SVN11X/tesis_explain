# scripts

Generators, checks and build helpers. Run them from the repository root.

- `bibliografia.py`: validates `datos/bibliografia.json` and builds the bibliography blocks and `.bib`.
- `catalogo_defensa.py`: builds `datos/defensa/catalogo.json` from `preguntas.html` (`--comprobar` checks it).
- `cifras_*_antes.json`: figures of each page before folding, read by `comparar_resumen.py`.
- `comparar_resumen.py`: compares a page's figures with its saved list.
- `datos.py`: writes `datos/proyecto.js` and the static HTML blocks from JSON and CSV (`--comprobar`).
- `descarga_preguntas.py`: builds the questions PDF, its manifest and the download button (`--comprobar`).
- `descargar_voz.py`: downloads and checks the voice assets (`--comprobar`, `--manifiesto`).
- `diagramas_control.js`, `diagramas_mapeo.js`, `diagramas_plano.js`: regenerate the fallback SVG diagrams (`--comprobar`).
- `ejemplos_laboratorio.js`: regenerates the synthetic laboratory examples (`--comprobar`).
- `imagen_social.py`: renders the social preview image.
- `indice.py`: builds `datos/indice.js` and `datos/secciones.js`.
- `marco.py`: applies the shared header, footer and theme templates to the pages.
- `modelo_robot.py`: prepares the robot CAD model from a STEP file.
- `planificacion.py`: builds the costs and Gantt blocks, used by `datos.py`.
- `plantillas/`: HTML templates (`cabecera.html`, `pie.html`, `tema.html`) used by `marco.py`.
- `preparar-web.mjs`, `publicar-web.mjs`: steps around `astro build` (see `package.json`).
- `validacion_defensa.mjs`: computes metrics from labelled defense runs (JSONL).
- `verificar_compilacion.py`: compares the build output with the committed files.
- `verificar_sitio.py`: checks data, index, links and anchors.
