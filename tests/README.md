# tests

Tests of the site. Run them from the repository root. `npm test` runs only the `*.test.mjs` files.

- `catalogo_defensa.test.mjs`, `validacion_defensa.test.mjs`: Node tests for the defense catalog and validation scripts.
- `compilacion.py`: unit tests of `scripts/verificar_compilacion.py`.
- `pruebas_analisis.js`, `pruebas_control.js`, `pruebas_estabilidad.js`, `pruebas_estadistica.js`, `pruebas_mapeo.js`, `pruebas_movimiento.js`, `pruebas_slam_proceso.js`, `pruebas_unitarias.js`: numeric model checks, run with `node tests/<file>`.
- `servidor.py`: local web server shared by the browser tests.
- `navegador.py`: main browser test (search, interaction, pages, robot, navigation).
- `navegador_control.py`, `navegador_defensa.py`, `navegador_evidencia.py`, `navegador_experiencia.py`, `navegador_laboratorio.py`, `navegador_mapeo.py`, `navegador_movimiento.py`, `navegador_redisenio.py`, `navegador_robustez.py`: browser tests of one page or area each (Playwright).
