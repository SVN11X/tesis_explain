# 0007. Performance budget: 170 KB of critical path, measured on `dist/`

- Status: accepted
- Date: 2026-11-20
- Proposed by: AI tool, from the improvement plan item on the performance budget
- Accepted by: owner, by approving that item in `docs/improvement-plan.md` (the web profile rule sets the numbers)

## Context

The web profile asks that the critical path of each page (HTML, CSS, JavaScript and fonts above the fold) stays under 170 KB compressed, and that each page is interactive in under 5 s on a Moto G4 class phone over slow 3G. The site is built with Astro into `dist/` and published from there, so the budget can be measured on the real output. Until now only the font weights were counted (`docs/medicion-fuentes.md`), not the whole path.

## Decision

1. The budget is the one in the profile: critical path under 170 KB compressed per page, interactive in under 5 s.
2. The critical path is counted two ways, both from transferred bytes:
   - Render-blocking: the HTML, the stylesheets in `<head>`, the classic scripts without `defer` or `async`, and the fonts preloaded in `<head>`.
   - Critical path (the number compared with the budget): the above plus every script, stylesheet and font that finished loading before the `load` event. It includes the `defer` scripts, because the guide pages need them to work. Chunks that arrive after `load` (the three.js viewers of the home page and of `laboratorios.html`) are listed apart as "after load".
3. This record states the budget and the measurement. It changes no page. The pages that break it are listed below as the base for later items.

## Method

- Build: `npm ci` and `npm run build` in a copy of the repository outside `.claude/worktrees` (the build fails inside a worktree). It gives `dist/` with 18 pages: the home page, `laboratorios.html` and 16 guide pages.
- Server: a small Python server (about 25 lines, not kept in the repository) that serves `dist/` under `/tesis_explain/` as Pages does and compresses `html`, `css`, `js`, `json` and `svg` with gzip level 6. `woff2` goes as is, since it is already compressed. Brotli is not used.
- Browser: Playwright with Chromium, a 360 by 640 viewport with touch, cache disabled, a new context per run.
- Throttling through the Chrome DevTools Protocol: CPU 4x slower, and two DevTools network profiles. Fast 3G is 1.6 Mbit/s down, 750 kbit/s up and 562.5 ms latency (with the usual 0.9 factor). Slow 3G is 400 kbit/s both ways and 2000 ms latency.
- Bytes: `encodedDataLength` of each request, which includes response headers. Sizes are in KB of 1,000 bytes.
- Timings: LCP, CLS and long tasks from `PerformanceObserver`, read 4 s (Fast 3G) or 6 s (Slow 3G) after the `load` event. "Load" is the `load` event time since navigation start.
- One run per page and profile. No repetition and no median.

## Results

Bytes are from the Fast 3G run. Columns: render-blocking KB, critical path KB, over 170 KB, KB after `load`, total KB of the first load. Then Fast 3G with 4x CPU: LCP in ms, CLS and load in ms. Then Slow 3G with 4x CPU: LCP and load in ms.

| Page | Blocking | Critical | Over 170 | After load | Total | LCP | CLS | Load | Slow LCP | Slow load |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `index` | 125.9 | 139.1 | no | 224.4 | 619.0 | 1864 | 0 | 2807 | 5860 | 7870 |
| `bibliografia` | 237.8 | 312.2 | yes | 0.0 | 312.2 | 2244 | 0 | 2559 | 7060 | 9707 |
| `control` | 150.9 | 251.4 | yes | 0.0 | 272.9 | 2308 | 0 | 3042 | 6800 | 10471 |
| `exploracion` | 133.6 | 223.7 | yes | 0.0 | 251.6 | 2380 | 0 | 2784 | 6944 | 9878 |
| `gemelo` | 131.4 | 205.7 | yes | 0.0 | 406.6 | 2296 | 0 | 2772 | 7144 | 16113 |
| `laboratorio` | 130.8 | 230.1 | yes | 0.0 | 230.1 | 2088 | 0 | 2902 | 6472 | 9979 |
| `laboratorios` | 116.2 | 124.5 | no | 216.2 | 340.6 | 1792 | 0 | 2123 | 5804 | 6692 |
| `lecciones` | 131.2 | 187.9 | yes | 0.0 | 201.4 | 2196 | 0 | 2483 | 6864 | 8991 |
| `mapeo` | 152.1 | 245.5 | yes | 0.0 | 258.8 | 2444 | 0 | 3532 | 7380 | 11760 |
| `movimiento` | 136.8 | 231.3 | yes | 0.0 | 301.2 | 2256 | 0 | 2956 | 6632 | 10528 |
| `mundo-real` | 133.7 | 208.0 | yes | 2.3 | 230.7 | 2196 | 0 | 2551 | 6564 | 9514 |
| `navegacion` | 135.0 | 209.3 | yes | 0.0 | 323.1 | 2236 | 0 | 2902 | 6616 | 10360 |
| `preguntas` | 169.1 | 263.8 | yes | 0.0 | 263.8 | 2240 | 0 | 3333 | 6784 | 11574 |
| `problema` | 136.8 | 228.6 | yes | 0.0 | 252.6 | 2404 | 0 | 3232 | 7288 | 11789 |
| `recursos` | 142.4 | 216.7 | yes | 0.0 | 312.1 | 2444 | 0 | 3348 | 7204 | 11854 |
| `replicar` | 133.6 | 223.7 | yes | 0.0 | 256.4 | 2276 | 0.0036 | 3586 | 7048 | 14080 |
| `resultados` | 137.1 | 230.5 | yes | 0.0 | 272.5 | 2176 | 0 | 3014 | 6656 | 10779 |
| `robot` | 137.7 | 227.8 | yes | 0.0 | 247.2 | 2428 | 0 | 3065 | 7096 | 11041 |

### Pages over budget

16 of 18 pages exceed 170 KB on the critical path. From the heaviest: `bibliografia` (312.2 KB), `preguntas` (263.8), `control` (251.4), `mapeo` (245.5), `movimiento` (231.3), `laboratorio` (230.1), `resultados` (230.5), `problema` (228.6), `robot` (227.8), `exploracion` (223.7), `replicar` (223.7), `recursos` (216.7), `navegacion` (209.3), `mundo-real` (208.0), `gemelo` (205.7) and `lecciones` (187.9). Only `index` (139.1) and `laboratorios` (124.5) fit. By the narrower render-blocking count only `bibliografia` (237.8) breaks the budget, and `preguntas` (169.1) is just under it.

Why:

- Fonts are the biggest fixed cost. Every page preloads Archivo (56.0 KB), Atkinson Hyperlegible (17.2 KB) and IBM Plex Mono (14.7 KB), 87.9 KB in total, which is 52 % of the budget before any HTML. This is the weight already described in `DESIGN.md` and `docs/medicion-fuentes.md`.
- The shared CSS and scripts add about 31.7 KB of CSS (`marco.css` 6.2, `estilo.css` 25.4) and about 37.3 KB of shared `defer` scripts (`datos/proyecto.js` 6.0, `js/comun.js` 5.4, `js/marco.js` 8.0, `js/sitio.js` 17.9). With the fonts, the shared parts sum about 157 KB, so only about 13 KB are left for the HTML and the page's own files.
- Each guide page then adds its HTML (17 to 44 KB compressed on most pages) and its own scripts and CSS (for example `js/control.js` is 78.6 KB raw).
- `bibliografia.html` is the outlier on HTML: 117.1 KB compressed (509.6 KB raw), because the full reference list is in the page.
- The home page fits because it does not load `estilo.css` or the page scripts. It then loads about 224 KB of three.js and viewer code after `load`, and `laboratorios` about 216 KB.

Timings:

- Fast 3G: load between 2,123 and 3,586 ms and LCP between 1,792 and 2,444 ms. All 18 pages are under 5 s.
- CLS is at most 0.0036 on Fast 3G (`replicar`) and at most 0.0182 on Slow 3G (`preguntas`), far below 0.1.
- Slow 3G with 2000 ms latency: load between 6,692 and 16,113 ms and LCP between 5,804 and 7,380 ms. No page reaches 5 s on this profile. With a 2 s round trip, the chain HTML, then CSS and fonts, then scripts costs at least three round trips (6 s), so the profile fails any page that is not a single file. The result says the profile is very harsh and the pages are heavy, and the run cannot tell how much of the failure is each.

## What could not be measured

- Time to Interactive is not measured, and Lighthouse was not used. The "interactive in under 5 s" rule has only proxies: the `load` event, LCP and total blocking time from long tasks. Blocking time is 2.3 s on the home page and 2.8 s on `laboratorios` (three.js viewers) and at most 0.2 s on the guide pages.
- No real Moto G4 was used. A 4x CPU slowdown on desktop Chromium is the usual approximation, and its accuracy depends on this machine.
- The server is local. GitHub Pages serves over HTTP/2 or HTTP/3 with its own compression (codec and level not checked), so bytes can differ by a few percent and the real round trips differ from the throttled ones. Headers are counted in the bytes, about 300 to 500 bytes per request.
- Single runs. Differences of a few hundred milliseconds between pages are noise.
- Pages were not scrolled and no interaction was measured, so CLS and long tasks after the first paint are not covered.
- "Above the fold" is approximated by "loaded before the `load` event". The `defer` scripts are counted entirely, even those that only serve content below the fold.

## Alternatives considered

Count only the render-blocking resources. Simpler, and only `bibliografia` fails, but it hides 30 to 130 KB of scripts that the guide pages need to work, so it stays as a second column and not as the budget. A looser budget such as 250 KB. Rejected for now: it is not the rule of the profile.

## Consequences

The site has a number to defend and a method to repeat. Sixteen pages break the critical path budget as measured, so the budget is a target with a known gap and not yet a passing check. Candidate fixes, each its own item and none done here: render the bibliography list on demand, drop the Plex preload (14.7 KB) or the Archivo preload as `DESIGN.md` already suggests, split `js/sitio.js` and the page scripts so that only what is above the fold is critical, and measure again. To undo this record, delete this file. Nothing else depends on it.
