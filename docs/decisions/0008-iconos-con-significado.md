# 0008. Meaning icons: Phosphor regular, inline, one per topic and one per figure card

- Status: accepted
- Date: 2026-11-22
- Proposed by: AI tool, from the owner's complaint that icons are missing and the pages are hard to understand visually
- Accepted by: owner, 2026-11-22

## Context

The guide sidebar, the list "Las 16 partes de la guía" on the home page and the `.cifras-mini` figure cards had no icons. A reader had to read each label to tell topics apart or to know what a number measures. `AGENTS.md` asks for a written reason before using an icon set chosen for its look. Phosphor Icons (MIT, `LICENSE-iconos.txt`) is already used inline in `public/js/sitio.js`, `public/js/comun.js` and the page frame.

## Decision

1. Use only Phosphor Icons 2.1.1, weight regular, copied inline as one `<path>` in a 256 by 256 viewBox. No file is requested and no dependency is added. The set is already in the site, so one weight keeps one look.
2. Every icon is decorative: `aria-hidden="true"`, with the text next to it carrying the meaning. Size is 20 px in the sidebar, 22 px in the home list and 24 px in the figure cards.
3. The color is the part color of the topic (`--tema`, from `css/marco.css`), so the icon repeats what the number and the page already say.
4. The icon says what the figure measures, not what looks nice. The same quantity keeps the same icon everywhere.

Topic icons (same drawing in the sidebar, `ICONO_TEMA` in `public/js/sitio.js`, and in the home list, `chapterIcons` in `src/lib/home-content.ts`):

| Part | Icon | Why |
| --- | --- | --- |
| Autonomía en interiores | compass | orientation, what autonomy means |
| Anatomía del robot | robot | the machine |
| Moverse y medir el avance | path | the traveled path |
| Control de velocidad | sliders-horizontal | tuning gains |
| Ver y mapear | map-trifold | the map |
| Planificar con Nav2 | navigation-arrow | going to a goal |
| Explorar por fronteras | binoculars | looking for the unknown |
| El gemelo digital | cube | the simulated model |
| La evidencia | chart-bar | results |
| Constrúyelo tú | wrench | building |
| En el mundo real | globe-hemisphere-west | the world |
| Lecciones | lightbulb | lessons |
| Preguntas difíciles | question | questions |
| Laboratorio | flask | experiments |
| Recursos | books | materials |
| Bibliografía | book-open-text | references |

Figure card icons, by what the figure measures: percent (a percentage), timer (a time or duration), hourglass (a cycle time), wave-sine (a frequency), ruler (a length or a distance error), grid-four (a cell size), selection (an area), coins (a cost), nut (hardware), scales (a mass), lightning (a voltage), target (a residual or a goal count), angle (a phase margin), circle-notch (pulses per turn), chart-scatter (a dispersion), repeat (repetitions or stages), check-circle (runs that finished), flag-checkered (navigation goals), eraser (a list that was cleared), copy (one shared description), list-checks (acceptance criteria), arrows-clockwise (readings per turn), calendar-blank (a year), shield-check (safety layers), globe-hemisphere-west (cases around the world), map-pin (one highlighted case), puzzle-piece (problems to solve), list-numbers (steps or stages), circle-dashed (an inflation radius), crosshair (a tolerance around a goal), map-trifold (a map against a plan).

## Alternatives considered

- Emoji: they change with the system, carry no single meaning and are not under the site's color tokens.
- A sprite file or an icon font: one more request and, for the font, a new asset to load. About 40 small paths inline cost less.
- Another icon set: it would mix two drawing styles.

## Consequences

- Easier: a reader scans the sidebar and the numbers by icon and color.
- Harder: each new card needs an icon from the table, and the topic icons live in two places (`sitio.js` and `home-content.ts`).
- Weight: about 5 KB more in `sitio.js` (about 2 KB compressed) and about 300 bytes per card.
- Undo: delete the `svg` elements, the `ICONO_TEMA` map, `chapterIcons` and the `.ico-cifra`, `.gl-ico` and `.chapter-ico` rules.
