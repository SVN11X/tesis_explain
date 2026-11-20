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

Read from the site's CSS on 2026-11-20 (`public/css/marco.css`, `public/css/estilo.css`, `src/styles/experience.css`, and the page files `evidencia.css`, `laboratorio.css`, `mapeo.css`, `movimiento.css` and `preguntas.css`, which declare no custom properties). `marco.css` loads first on every page, so its tokens are the shared base. Counts are uses of `var(--token)` across all CSS files.

### Spacing

- `--marco-gutter`: `clamp(22px, 4.6vw, 80px)`, side margin of the frame. It is 22px under 900px wide and 17px under 480px (`:root` overrides in `marco.css`). `estilo.css` aliases it as `--gutter`.
- `--lectura`: `45.4em`, reading column width (7 uses).
- There is no spacing scale. Margins, paddings and gaps are literal pixels (see the candidates below).

### Type sizes

`estilo.css` defines the scale. Body is `--t-base` with `line-height: 1.65`, headings use `line-height: 1.12`.

| Token | Value | Uses |
| --- | --- | --- |
| `--t-xs` | `.8rem` | 99 |
| `--t-sm` | `.9rem` | 107 |
| `--t-base` | `1.0625rem` | 9 |
| `--t-md` | `1.15rem` | 10 |
| `--t-lg` | `1.4rem` | 6 |
| `--t-xl` | `1.85rem` | 1 |
| `--t-2xl` | `clamp(2.1rem, 5.2vw, 3.4rem)` | 0 |

Families: `--f-display` (Archivo with its fallbacks, aliased `--f-titular` and `--f-tema`), `--f-body` (Atkinson Hyperlegible with its fallbacks), `--f-data` (IBM Plex Mono) and, in `marco.css`, `--marco-titulo` and `--marco-mono`.

### Radii

`--r: 2px` (138 uses), `--r-lg: 2px` (1 use) and `--r-xl: 2px` (0 uses), all in `estilo.css`. The site is square-cornered on purpose, so the three are the same value today.

### Durations

In `marco.css`: `--dur-1: .16s` (43 uses), `--dur-2: .28s` (31 uses) and `--dur-3: .55s` (3 uses). The home page reads them too.

### Easing

One token: `--curva: cubic-bezier(.2, .65, .25, 1)` in `marco.css` (36 uses).

### Color

By reference, not copied:

- `marco.css`: the frame palette (`--paper`, `--ink`, `--muted`, `--line`, `--acid`, `--night`, `--oliva`, `--foco`, the `--marco-*` family and `--pie-fondo`), the seven part colors with their backgrounds (`--c-verde`, `--c-amarillo`, `--c-naranja`, `--c-azul`, `--c-turquesa`, `--c-violeta`, `--c-frambuesa` and `--c-*-fondo`), `--c-robot`, and the page theme pair `--tema` and `--tema-fondo`. The dark theme overrides all of them under `prefers-color-scheme: dark` and `:root[data-theme="dark"]`.
- `estilo.css`: the guide palette (`--bg`, `--surface`, `--surface-2`, `--line-2`, `--ink-2`, `--acento*`, `--azul*`, `--verde*`, `--rojo*`, `--ambar*`, `--violeta*`, the map colors `--vacio`, `--desc`, `--obst`, `--ruta`, the plan colors `--plano*` and the series colors `--s1` to `--s4`), and the shadows `--sombra` and `--sombra-alta`.
- `src/styles/experience.css`: about 40 home page colors named `--h-*`, many of them near duplicates of the `marco.css` and `estilo.css` colors (for example `--h-linea-2: #b4bdab` equals `--line-2`, `--h-resalte: #e0e6c9` equals `--marco-resalte`, `--h-boton-hover: #35483c` equals `--acento-hover`).

### Values used often without a token

Counted with a throwaway script over the 7,911 declarations in the CSS above (comments removed, each length in a shorthand counted once). It changes no CSS.

| Group | Top literal values (uses) | Closest token |
| --- | --- | --- |
| Spacing (`margin`, `padding`, `gap`) | `10px` (158), `12px` (136), `8px` (133), `6px` (91), `14px` (81), `20px` (61), `16px` (59), `18px` (54), `4px` (53), `22px` (44), `2px` (43), `25px` (41) | none |
| Font size | `11px` (39), `12px` (33), `13px` (33), `10px` (30), `15px` (29), `9px` (28), `.6875rem` (24), `8px` (21), `14px` (19), `16px` (16) | `--t-xs` (99) and `--t-sm` (107) exist, but sizes below them are literal |
| Radius | `999px` (21, pills), `50%` (20, circles), `2px` (9, same as `--r`) | `--r` |
| Duration | `.7s` (3), `.9s` (3), `1.8s` (2), `0s` (3), `160ms` (1), `260ms` (1) | `--dur-1` is `.16s`, so `160ms` repeats it |
| Easing | `ease` (27), `linear` (2), `ease-out`, `ease-in`, `ease-in-out` and `cubic-bezier(.55, .1, .35, 1)` (1 each) | `--curva` (36) |

Candidates to tokenize, in order of gain, if the owner wants them:

1. A spacing scale around the six values that cover most uses: `4px`, `6px`, `8px`, `10px`, `12px`, `16px`, plus `14px`, `18px` and `20px` as the next tier. The odd steps (`10px`, `14px`, `18px`, `22px`, `25px`) show there is no scale yet.
2. A small type step below `--t-xs`: `.6875rem` (11px) is used 24 times and the pixel sizes `9px` to `13px` about 150 times.
3. Radius `--r-pill: 999px` and `--r-round: 50%`.
4. `ease` in 27 places, to be replaced with `--curva` if the owner accepts the small change in feel.
5. Home page colors `--h-*` that duplicate another token.

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
