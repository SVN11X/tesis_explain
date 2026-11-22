# 0005. Every animation has a purpose, and motion longer than 5 s has a pause

- Status: accepted
- Date: 2026-11-19
- Proposed by: AI tool, from the web profile rule for rich motion
- Accepted by: owner, through the expressive motion choice in `DESIGN.md` (section Motion), 2026-11-19

## Context

`DESIGN.md` sets the expression to expressive: motion, 3D and striking transitions are welcome as long as they explain. The web profile asks, for rich motion, to record why each animation exists and to give a pause control to anything that moves for more than 5 s without the user asking. `docs/revision-atencion.md` (findings 7, 9 and 10) reviewed attention and flagged the `.scan-loader` spinner (1.8 s, infinite) as the one thing that could stay in the DOM.

## Decision

1. Every animation must explain something or give feedback. It is listed below with its purpose.
2. Anything that moves for more than 5 s without the user asking has a visible pause control. Motion the user starts, and motion that lasts under 5 s once, needs none.
3. Reduced motion (`prefers-reduced-motion: reduce`) stops or removes all of it. Where the motion needs the user to ask, it waits for the user.
4. A new animation adds a row to this inventory in the same pull request.

## Inventory

Loop means it repeats without end. RM is what reduced motion does.

| # | Element | Where | Trigger | Duration | Loop | Purpose | RM | Pause |
|---|---|---|---|---|---|---|---|---|
| 1 | Marker highlight (`.resaltado-listo`) | `css/marco.css`, `js/marco.js` | Text reaches the viewport | 0.9 s, once per mark | No | Draws the eye to the key phrase as a marker would | Already drawn, no transition | Not needed |
| 2 | Reveal on scroll (`revelar`, bars of `.barras` and `.gantt`) | `css/estilo.css` | Element enters the viewport | 0.7 to 0.9 s, once | No | Shows that content is new and orders the reading | animation and transition set to none | Not needed |
| 3 | Dialog and lightbox (`emerger`, `fundir`) | `css/estilo.css` | Open a dialog | var(--dur-2), once | No | Feedback that a layer opened | None | Not needed |
| 4 | View transitions between pages | `css/estilo.css`, `web/src/styles/experience.css` | Page navigation | 120 to 260 ms | No | Continuity between pages | None | Not needed |
| 5 | Hover, focus and accordion transitions | `css/estilo.css`, `css/marco.css`, `css/preguntas.css` | Pointer, focus, toggle | Mostly under 300 ms | No | Feedback of a state change | transition none | Not needed |
| 6 | Home hero entrance (`enter`) and `.will-reveal` | `web/src/styles/experience.css` | Page load, scroll | 0.7 to 1 s, once | No | Orders the first view | Reduced to 0.001 ms | Not needed |
| 7 | Wheel hint (`aviso-rueda`) | `web/src/styles/experience.css` | Wheel over the 3D robot | 1.8 s, once | No | Says zoom needs Ctrl so the page still scrolls | 0.001 ms | Not needed |
| 8 | `.scan-loader` spinner | `web/src/styles/experience.css`, `LidarLab.svelte` | Lab load | 1.8 s per turn | Yes, only while loading | Shows that the 3D scene is preparing | One iteration, 0.001 ms | Removed from the DOM when the scene loads (`{#if !loaded}`), not shown on failure. Checked in the browser |
| 9 | Hero 3D robot spin | `web/src/lib/robot-three.ts`, `RobotHero.svelte` | Starts on load | Continuous | Yes | Shows the robot from every side | Off at start | Yes, button «Pausar movimiento del sensor» |
| 10 | Hero 3D camera and exploded view (GSAP) | `robot-three.ts` | Zoom, view and explode buttons | Under 2 s, once | No | Explains how the parts fit | Shorter | Not needed |
| 11 | LiDAR lab sweep and route | `LidarLab.svelte`, `lidar-three.ts` | User presses «Recorrer» | Until paused | Yes | Shows how the sensor builds the map | Stops on change to reduce | Yes, the same button reads «Pausar» |
| 12 | LiDAR camera view change (GSAP) | `lidar-three.ts` | User picks a view | Under 2 s, once | No | Shows top and perspective views | None | Not needed |
| 13 | Exploration simulation (`js/exploracion.js`, `U.bucle`) | Guide pages | Starts when in view | Continuous | Yes | Shows frontier exploration | Waits for the user | Yes, «Pausar» |
| 14 | Motion simulation «Mover» (`js/movimiento.js`) | Motion pages | Starts when in view | Continuous | Yes | Shows pose from speed and turn rate | Waits for the user | Yes, «Pausar» |
| 15 | Signals animation (`data-a="anim"`) | Control pages | Starts when in view | Continuous | Yes | Shows the phase of two signals | Still image, waits for the user | Yes, «Pausar» |
| 16 | Search generations (`data-a="play"`) | Pages with the search simulation | User presses play | Until done | Ends by itself | Shows how a search converges | Waits for the user | Yes, «Pausar» |
| 17 | Algorithm player (`js/vis1.js`) | Control chapter | User presses play | Until done | Ends by itself | Steps through the algorithm | Waits for the user | Yes, «Pausar» |
| 18 | Stage sequence (`js/sitio.js`, 2.6 s interval) | Replication pages | User presses «Reproducir secuencia» | Until paused | Yes | Walks the four mapping stages | Stops on change to reduce | Yes, «Pausar» |
| 19 | Looping videos (`.bucle video`) | exploracion, gemelo, mapeo, movimiento, navegacion | Enter the viewport | Clip length, loops | Yes | Shows a real run that text cannot | Poster only, no autoplay | Yes, `.b-ctl` button. Checked in the browser |
| 20 | Home video `img/mapa-crece.mp4` | `web/src/pages/index.astro` | User presses play | Clip length | No autoplay | Shows the map growing | Not autoplayed | Native controls |
| 21 | `img/mapa-crece.gif` | `README.md` only | Opened on GitHub | Loops | Yes | Preview for the repository page | Not on the site | Not on the site |
| 22 | Robot in search without results (`.robot-busca`) | `js/marco.js`, `css/marco.css` | A search finds nothing | 1.3 s, 3 times (3.9 s) | No | Shows that the robot looked and found nothing (see 0006) | Still image | Not needed |
| 23 | Step change in «metas-abortadas» (`js/lecciones.js`, `.mq-p` in `css/estilo.css`) | `lecciones.html` | User presses «Anterior» or «Siguiente» | var(--dur-1), once per step | No | Shows which points change meaning in each step | transition none | Not needed |
| 24 | Home hero real run (`.hero-run`, `img/mapa-crece.mp4`) | `web/src/pages/index.astro`, `web/src/styles/experience.css` | Starts by itself after the page loads and goes idle | 7.3 s clip | Yes | Shows the robot exploring and the map growing on the first screen, as a real run | Poster only, waits for the user | Yes, visible button «Pausar» over the video. Checked in the browser |
| 25 | Ciclo del robot (`js/diagramas-vivos.js`, `ciclo-robot`) | `problema.html` | Starts when in view | 6 s per outer lap, 0.6 s per inner lap | Yes | A token walks Percibir, Estimar, Decidir, Planificar y moverse and pauses on each, and a faster inner ring shows that the wheels are corrected far more often than the destination is reviewed | Token and ring stay still, a stage can still be chosen and read | Yes, visible button «Pausar movimiento». Choosing a stage also stops it, and «Seguir el recorrido» resumes. Checked in the browser |
| 26 | Nav2 data flow (`flujo-nav2`) | `navegacion.html` | Starts when in view, restarts on each step button | 0.9 s per stage, a 0.9 s rest, loops | Yes | Packets travel along the arrows of the chosen scenario so the reader sees the order in which /scan, the plan, /cmd_vel and the odometry move | No packets, the whole step is lit at once | Yes, visible button «Pausar movimiento», hidden when reduced motion is on. Checked in the browser |
| 27 | Energy and signals (`energia-senales`) | `robot.html` | Starts when in view, restarts on each toggle | 0.9 s per stage, a 0.9 s rest, loops | Yes | Circles along solid wires show where energy goes, diamonds along dashed wires show where signals go, over the same blocks | No packets, the whole flow is lit at once | Yes, visible button «Pausar movimiento», hidden when reduced motion is on. Checked in the browser |

Row 23 does not exist on purpose: the feedback of the challenge in `mapeo.html` (`reto-mapeo`) is text, a colored edge and a status message that appear at once. It has no animation or transition, so there is nothing to pause or to switch off with reduced motion.

Rows 9, 11 to 15, 18, 19 and 24 to 27 run longer than 5 s. All of them already had a pause, so this record adds none to the code.

## Alternatives considered

A single global pause button for the whole page. Rejected because each loop already has its own control next to what it moves, and one button would hide which motion it stops. Doing nothing was not enough because the rule asks for the purposes to be written down.

## Consequences

Reviewing motion is now a table to check instead of a search through the code. The browser check in `tests/navegador_redisenio.py` fails if a CSS animation runs forever after the lab loads, if the spinner stays in the DOM, if the hero 3D robot cannot be paused, or if a looping video has no working pause. To undo it, mark this record superseded by a newer one.
