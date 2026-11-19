# Design direction

<!-- Written by the owner. AI tools may ask questions and format the answers, never invent them. Replace every TODO(owner) line. -->
<!-- Transcribed from the owner's answers of 2026-11-19. -->

## Identity

An open guide to a low-cost ROS 2 robot that enters a room it does not know, explores it on its own and draws its map. The impression it should leave: the idea is understood by playing with it.

## Audience

The author preparing the defense, the thesis committee, and students and the public who want to learn mobile robotics, including people who find it hard to keep their attention on long texts. On phones and on desktops, with the keyboard too.

## Expression

expressive. Motion, 3D and striking transitions are welcome across the site, as long as they explain. Reduced motion still turns them off.

## Personality

It should feel warm and didactic, technical and precise, and playful. It must not feel dense or boring.

## Palette

Keep the current palette, and review whether anything distracts or tires the eyes of people with attention difficulties. Light paper, dark green ink, a lime accent for what is active, and one color per part of the guide, because the color says what is being talked about: turquoise to perceive, orange to estimate motion, violet to decide, blue to move, yellow for the robot, raspberry for the evidence and green for the context. The values live in `css/marco.css`.

## Typography

Keep the current fonts, under the same review: Archivo for titles, Atkinson Hyperlegible for text and IBM Plex Mono for labels. Three families need a written reason under the standard, and the measurement in `docs/medicion-fuentes.md` gives it.

Decision (measured): keep the three families, each with one role.

- Atkinson Hyperlegible carries the reading: most of the visible characters (76 % on the home page, 89 to 91 % on guide pages). It is the accessibility choice and it has `tnum`, so figures inside running text align without another family.
- Archivo is the voice of titles, big figures and the footer title. It is the heaviest file (56,044 bytes, one variable file for every weight) for about 2,000 to 8,800 characters per page, so it is the first candidate if weight ever matters more than identity. Headings would fall back to Atkinson 700, which is already loaded, and nothing else changes.
- IBM Plex Mono marks labels, units, numbered chips, code, formulas and `kbd`, 257 to 463 elements per page. It costs 14,708 bytes on the home page and 30,328 bytes on guide pages (two weights). Its role is the "this is a label or a measurement" signal, which no other family gives.

First visit, cold cache, bytes of woff2 files: home 87,960 (Archivo 56,044, Atkinson 17,208, Plex 14,708) and guide pages 139,396 (Archivo 56,044, Atkinson 53,024, Plex 30,328). Removing a family would not break the `font-display: optional` rule or its metric-matched fallbacks on the guide pages, because each family has its own fallback block in `css/estilo.css`. It would only delete that block. The home page is the exception: `web/src/styles/experience.css` uses `font-display: swap` and no metric-matched fallbacks, which the README does not say. No CSS was changed.

## Motion

Expressive. Today the site draws the highlight like a marker, shows the 3D robot with its exploded view, sweeps the LiDAR, raises cards on scroll and uses view transitions between pages. Everything stops with reduced motion.

## Tokens

The current values live in `css/marco.css`, `css/estilo.css` and `web/src/styles/experience.css`. Listing them here is an item of `docs/improvement-plan.md`.

## First visit

A robot that explores a room on its own and draws its map. Two actions: start the guide, and play with the 3D robot.

## States

Playful, with the robot: the drawn robot goes with the message, for example sweeping with its LiDAR while something loads. Each state still says what happened and offers the next action.

## Audience evidence

- Fact (owner's experience): the committee has little time and looks for figures and sources to check against the thesis.
- Fact (owner's experience): students arrive with little background in robotics, and from their phones.
- Fact (owner's experience): people with attention difficulties leave a page when they meet a wall of text.

## References

Explorable explanations, like Bartosz Ciechanowski or Red Blob Games: the idea is understood by playing with the drawing.

## Examples

Right, the way the whole site should be:

- A* step by step (`navegacion.html`): play it, advance one step at a time and edit the walls.
- The 3D robot with its exploded view (home page): turn it, zoom in and separate its parts.
- The PID simulator (`control.html`): move the gains and compare with the previous curve in gray.
- The oral-defense practice (`preguntas.html`): answer, dictate and get feedback.

Wrong:

- Long guide pages, such as `mapeo.html` or `control.html`, with a lot of text between the interactives. The detail stays, but it shows only when the visitor asks for it.

## Dials

Not set: antislop is not installed on this machine (checked on 2026-11-19).
