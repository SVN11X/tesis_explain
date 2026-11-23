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
7. Phones (owner decision of 2026-11-22, reworked after review). Below 740 px of container the controls of an interactive go into at most three ARIA tabs, all on one row from 320 px, when they do not fit beside the drawing. The drawing stays above, at most 38 % of the screen height, and is never split from the controls. A strip of key values (the first four cards of the first readout, copied and kept in sync) sits right under the drawing. The tabs are one or two of controls and a last one, "Cómo leerlo" (notes and legend) or "Datos y notas" (also the full readouts and status text). Each tab is named with the widget's own words in `U.PESTANAS` in `public/js/comun.js` (an interactive without an entry uses no tabs). The pure `U.empacar` applies the entry, and a Node test rejects generic, numbered, repeated or long names. Keys: arrows, Home and End, with a roving tab stop. From 740 px the tabs and the strip are undone and the desktop layout is untouched. Nothing animates, so decision 0005 has no new row.

## Consequences

- No calculation changed. The model files and their tests are as before.
- Charts now draw at the width of their column, so their text is larger than when they were drawn wide and scaled down. A chart that needs a lot of height (the stability plots, the three stacked windup charts, the plan comparison) can stay above 720 px. The pull request lists them.
- Content inside a folded `details` is not read by `inner_text` until opened. The browser tests open the details they read.
- No sticky drawing on phones. A pinned drawing covered the focused control and failed the focus-not-obscured rule of WCAG 2.2.
- Phones: a drawing made of several charts, captions or cards (the stability plots, the three windup charts, the gain pairs, the law comparison) is not compacted and can stay above one screen. Interactives that do not call `U.escena` (flow diagrams, lists of steps, the real-world cases) have no tabs. The pull request lists both.
