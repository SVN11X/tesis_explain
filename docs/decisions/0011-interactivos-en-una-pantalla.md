# 0011. Interactives in one screen: drawing and controls side by side, notes folded

- Status: proposed
- Date: 2026-11-22
- Proposed by: AI tool, from the owner's complaint that some interactives do not fit and make the reader scroll to see what an action changed
- Accepted by: pending

## Context

On `mapeo.html` and `control.html` each interactive built one long column: controls, then the drawing, then readouts, then long notes. Measured at 1280 by 800 on `a610e82`, mapeo widgets reached 1,544 px and 1,794 px and control widgets reached 1,626 px, with 19 of 30 above one screen. A reader moved a slider and had to scroll to see the effect.

## Decision

1. One layout helper for the whole site: `U.escena` in `public/js/comun.js`, the one added in #91. It sorts the children of an interactive into drawing, controls, readouts and notes with the pure `U.repartir` (tested in `tests/pruebas_unitarias.js`) and builds the blocks `.v-dib`, `.v-ctl` and `.v-lec`.
2. The pages of #91 call it with explicit selectors and keep their layout: drawing and readouts on one side, controls on the other. `mapeo` and `control` call it through `U.escenaAuto`, which recognises the parts by class and turns on three options: `tira` (readouts in a strip under the drawing and the controls), `aparte` (a `details`, or an element with `data-plegar="Title"`, stays folded outside the stage) and `secciones` (one section at a time behind buttons when each `h4.vsub` opens one).
3. From a 700 px container the drawing sits beside the controls. Narrower, everything stacks with tighter spacing and readouts in three columns. The layout uses a container query on `.vis`.
4. Long explanatory notes, secondary readouts and fixed inputs go inside a folded `details` (`.v-mas`). Values, units, labels, resets and keyboard paths stay as they were.
5. `U.escenaAuto` runs as soon as an interactive writes its HTML, before it draws, so each chart measures its final width. One line in `public/js/sitio.js` installs it.
6. Interactives made of one block (`.mp-reto`, the LiDAR stage from #85) are left alone. Pages other than `mapeo` and `control` do not use `U.escenaAuto`.

## Consequences

- No calculation changed. The model files and their tests are as before.
- Charts now draw at the width of their column, so their text is larger than when they were drawn wide and scaled down. A chart that needs a lot of height (the stability plots, the three stacked windup charts, the plan comparison) can stay above 720 px. The pull request lists them.
- Content inside a folded `details` is not read by `inner_text` until opened. The browser tests open the details they read.
- No sticky drawing on phones. A pinned drawing covered the focused control and failed the focus-not-obscured rule of WCAG 2.2.
