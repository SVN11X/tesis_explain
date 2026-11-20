# Improvement plan

Approved by the owner on 2026-11-19 after a review by deep-reviewer. The owner asked Claude to open and merge every pull request. One pull request per item unless an item says otherwise. Light from the traffic light in AGENTS.md. "workflow" means the pull request edits a GitHub workflow, so the owner reviews and merges it.

## Stand-alone fixes

- [x] (green) Line endings: add `* text=auto eol=lf` to .gitattributes, keep `voz/** -text`, renormalize. The laboratory hash test fails on Windows because core.autocrlf turns datos/ensayos/*.csv into CRLF.
- [x] (green) Private dictation: a recording under 0.3 s ends the model download (js/defensa-voz.js:381 calls volverATexto, line 348 ends the worker). Keep the download going, with a browser test.
- [ ] (green) Update astro 7.4.4 to 7.4.13 (moderate npm audit advisory) and commit the rebuilt _astro/, index.html and laboratorios.html so verificar_compilacion.py passes.
- [ ] (red, workflow) Pinned requirements file for CI (beautifulsoup4, playwright) and an optional one for modelo_robot.py (trimesh, numpy, cascadio). CI installs it with pip -r. README.md points to both.
- [ ] (green) Python tools and tests read and write files as UTF-8 explicitly. On Windows without PYTHONUTF8=1, the laboratory test and verificar_sitio.py fail reading with cp1252.

## Structure

- [x] (green) Standard documents: goals.md, DESIGN.md, this plan, decisions 0001 and 0002, CHANGELOG.md, issue and pull request templates, .editorconfig.
- [x] (green) In the same pull request: a draft docs/how-it-works.md from the confirmed understanding, for the owner to confirm.
- [ ] (red, workflow) pages.yml uploads today's committed site from an explicit file list, without a build. Diff it with what is served now. docs/, herramientas/, servicio/ and README.md stop being served.
- [ ] BLOCKED: Merge pages.yml and switch Settings, Pages, Source to GitHub Actions in the same minute (owner). Every later structure item waits for this.
- [ ] (yellow, workflow) Regenerate the move plan with build npm, then part (a): herramientas/ to scripts/, its 19 pruebas_* and 2 *.test.mjs to tests/ with clearer names. Fix imports, CI and README.md.
- [ ] (yellow, workflow) Part (b), one pull request: guide pages, css, js, img, fuentes, datos, descargas, modelos and voz to public/ with the same paths, and web/src to src/ with Astro defaults and dist/.
- [ ] (yellow, workflow) Same pull request as part (b): datos.py, descarga_preguntas.py, imagen_social.py, indice.py and verificar_sitio.py follow the pages, read or write dist/ after the build, and pass --comprobar.
- [ ] (yellow, workflow) Same pull request as part (b): remove preparar-web.mjs, publicar-web.mjs, verificar_compilacion.py, pruebas_compilacion.py and all committed build output. datos/indice.js is built into dist/.
- [ ] (yellow, workflow) Same pull request as part (b): browser tests serve dist/ under /tesis_explain/, and pages.yml builds and uploads dist/.
- [ ] (green) Declare servicio/ in extra_folders with its reason. Every other folder has a place after part (b).
- [ ] (yellow, workflow) Take the three voice files over 5 MB out of git: the Pages build downloads them with descargar_voz.py, caches them on voz/manifiesto.json and fails on a hash mismatch. History is not rewritten.
- [ ] (yellow, workflow) Once the check can pass: .standard.yml (three_d core, github.description), AGENTS.md, CLAUDE.md and standard.yml with gitleaks. The commit guard blocks .standard.yml before that.

## Thesis content

- [x] (green) Academic notice: the thesis is in its defense process (owner, 2026-11-19), no longer under committee review. Update README.md and datos/academico.json, then run datos.py and indice.py.
- [ ] (yellow) Inventory of differences between the site and the final thesis (169 pages, the site follows the 152-page October one): figures and section, table and figure numbers, using docs/trazabilidad.csv.
- [x] (yellow) Fix the differences, one pull request per chapter, plus one each for the bibliography, the data CSVs and the questions. A change to preguntas.html regenerates its PDF and catalogo.json and rechecks the approved rubric.
- [ ] (yellow) After the fixes, publish the final PDF (9.5 MB) as a Release asset or compressed under 5 MB, with a clear name, checked metadata, and version_documento and tesis_pdf updated in datos/academico.json.

## Learning and attention

- [x] (yellow) control.html (8,287 words, 15 % folded): a short summary per section that keeps figures and thesis references visible, the rest folded. Search results and #anchors open the folded part, with a test.
- [x] (yellow) control.html second pass: only key figures in each summary, the rest folded, page at most 60 % of its height at 360 px. Reached 84 % (49,612 to 41,620 px): the 17 interactives alone are about 25,000 px, so 60 % needs folding them or the source list.
- [x] (yellow) control.html: an interactive inside the first 4 screens at 360 px (first video now at screen 7.0, comparison slider at 33.4; revision-atencion 5).
- [x] (yellow) mapeo.html (7,116 words, 10 % folded): the same treatment and the same test, with an interactive inside the first 4 screens at 360 px.
- [ ] (yellow) The same for robot, movimiento and resultados, one page per pull request. Then the owner reviews before problema, navegacion, exploracion and replicar.
- [ ] (yellow) A short challenge with instant feedback in one example chapter, using data the page already shows. The owner decides whether it spreads.
- [ ] (yellow) A step-by-step diagram or interactive for lecciones, then mundo-real, which have none today. One page per pull request. lecciones done.
- [x] (yellow) Playful states: one drawn SVG robot for search without results, as the example, with its reason recorded for a decorative illustration. Each state says what happened and the next action.
- [x] (green) Motion rich: record the purpose of each animation in docs/decisions/, and give a pause control to anything that moves for more than 5 s.
- [x] (green) Review palette and motion for what distracts or tires people with attention difficulties, and check the home page's first screen at 360 and 1280 px. Report with screenshots, change nothing.
- [x] (yellow) Home first screen: primary button «Empieza la guía» to the guide and secondary «Juega con el robot 3D» to the viewer, with the 3D robot fully visible at 360 px (docs/revision-atencion.md 1 and 2).
- [ ] (yellow) Home first screen shows the robot exploring and the map growing, reusing img/mapa-crece.mp4 or the existing LiDAR scene, so a first visit sees what the robot does (revision-atencion 3).
- [x] (green) Home 3D viewer: only the active tab keeps its topic color, the others stay neutral (revision-atencion 8). Confirm that the .scan-loader spinner hides after loading (the spinner belongs to another pull request, not touched here).
- [x] (green) Measure the contrast of the small gray uppercase labels on the home page at 360 px and fix anything under 4.5:1.
- [x] (green) Home page fonts use font-display: swap without metric-matched fallbacks, unlike the guide pages. Align them with the guide pages (docs/medicion-fuentes.md).
- [x] (green) Measure the weight and use of Archivo, Atkinson Hyperlegible and IBM Plex Mono, and record the font decision in DESIGN.md.
- [ ] (green) After part (b): list the current tokens (spacing, type sizes, radii, durations, easing) in DESIGN.md from the site's CSS.
- [ ] (green) After part (b): record the performance budget in docs/decisions/, measured on dist/, with each page's critical path against 170 KB compressed.

## Documentation and code

- [ ] (green) docs/decisiones.md: mark rows 5 (native HTML only), 13 (no inference) and 14 (no automatic publishing) as superseded, and record the Astro, AI correction and Actions decisions in docs/decisions/.
- [x] (green) Deep maintainability review of js/ (sims.js 1,157 lines, mapeo.js 945, sitio.js 854). Its findings become new items here.
- [ ] (green) Move the canvas kit (sims.js:20-117: css, rgba, paleta, lienzo, alTema, quieto, fmt, limitar, bucle) and robotCelda (vis1.js:57) into comun.js as U.*, so the split does not copy it four times.
- [x] (green) Shared helpers in comun.js: U.marcar (aria-pressed, 11 copies), U.chips, U.tarjetas and one U.alAncho for redraw on resize (comun.js:17-31, sims.js:62 and inline copies). Same pull request as the kit if small.
- [x] (green) One reduced-motion path: U.quieto and one U.alCambiarMovimiento. bucle pauses pid, enjambre and exploracion when reduced motion turns on mid-run, as cinematica and encoder already do.
- [x] (green) Remove dead code: the sims.js hero mode (no page uses data-modo="hero"), ICO stored in VISUALES (comun.js:92), stale notes (vis1.js:8, :323, sims.js:9, :711) and SITIO.quieto (sitio.js:853).
- [x] (green) Tests before the split: list files from SITIO.MODULOS instead of hardcoded names, check that each file registers exactly its MODULOS names, and add a Node test for the exploration simulation.
- [ ] (yellow) Split vis1, vis2, vis3 and sims.js by chapter: navegacion, exploracion, control, robot, plus mapeo (cobertura) and movimiento. Consider static HTML for versiones, gemelo and fallaria. (vis1, sims done)
- [ ] (green) After part (b): shorten README.md (364 lines) to what it is, for whom, use, status, layout and license. The audit reports go to docs/historial/ with every link fixed.

## Presentation

- [ ] (yellow) GitHub settings: About description, website and topics, wiki and projects off, delete branches on merge, squash only, Dependabot security updates. The owner applies them with standard.py github . --apply.

## Owner

- [ ] BLOCKED: Human validation of the oral-defense correction: 120 answers labeled by two reviewers and 5 students, as docs/defensa/README.md describes.
- [ ] BLOCKED: Try private dictation with a real microphone on preguntas.html, after the short-recording fix.
