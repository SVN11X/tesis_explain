# 0010. Interactives in one screen: drawing and controls side by side, notes folded

- Status: proposed
- Date: 2026-11-22
- Proposed by: AI tool, from the owner's complaint that some interactives do not fit and make the reader scroll to see what an action changed
- Accepted by: pending

## Context

On `mapeo.html` and `control.html` each interactive built one long column: controls, then the drawing, then readouts, then long notes. Measured at 1280 by 800 on `a610e82`, mapeo widgets reached 1,544 px and 1,794 px and control widgets reached 1,626 px, with 19 of 30 above one screen. A reader moved a slider and had to scroll to see the effect.

## Decision

1. `U.maquetar` in `public/js/comun.js` sorts the children each interactive writes into five groups and builds the layout from them: drawing (charts, canvases, legends), controls, readouts, folded notes and section titles. `U.repartir` is the pure sorting step and has its own test in `tests/pruebas_unitarias.js`.
2. From a 700 px container the drawing sits beside the controls and the readouts run in one strip below. Narrower, everything stacks with tighter spacing and readouts in three columns. The layout uses a container query on `.vis`, not the window width.
3. Long explanatory notes, secondary readouts and fixed inputs go inside a `details` element, folded by default. Values, units, labels, resets and keyboard paths stay as they were. An element with `data-plegar="Title"` is folded under that title.
4. An interactive with several titled sections (`h4.vsub`) shows one section at a time behind buttons with `aria-pressed`, because the sections do not act on each other.
5. `U.alMaquetar` runs the sorting as soon as an interactive writes its HTML, before it draws, so each chart measures its final width.
6. Interactives made of one block (`.mp-reto`, the LiDAR stage from #85) are left alone. Pages other than `mapeo` and `control` are not touched.

## Consequences

- No calculation changed. The model files and their tests are as before.
- Charts now draw at the width of their column, so their text is larger than when they were drawn wide and scaled down. A chart that needs a lot of height (the stability plots, the three stacked windup charts, the plan comparison) can stay above 720 px. The pull request lists them.
- Content inside a folded `details` is not read by `inner_text` until opened. The browser tests open the details they read.
- No sticky drawing on phones. A pinned drawing covered the focused control and failed the focus-not-obscured rule of WCAG 2.2.
