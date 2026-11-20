# How it works

Status: draft for the owner to confirm in the pull request. Written from the understanding the owner confirmed on 2026-11-19.

## From start to finish

1. A visitor opens a page of the guide on GitHub Pages. Nearly everything then runs in the visitor's browser: the static guide pages, the interactives, the local CSV laboratory and the Whisper dictation that loads its files from `public/voz/`.
2. The home page and `laboratorios.html` are Astro and Svelte sources in `src/`. `npm run build` compiles them into `dist`, copies `public/` into it unchanged and then builds the search index there. `dist` is not committed.
3. In the oral-defense practice, the only step that leaves the browser is the AI correction. It goes to a Cloudflare Worker in `servicio/`, which uses Workers AI and a D1 database. The Worker is deployed apart from the site.

## Parts

- `src/`: Astro and Svelte source of the home page and `laboratorios.html`.
- `public/`: the guide pages and their `public/css/`, `public/js/`, `public/img/`, `public/fuentes/`, `public/datos/`, `public/descargas/`, `public/modelos/` and `public/voz/`. Astro copies it to `dist` with the same paths, so public URLs do not change.
- `dist`: build output, the only thing published. Not committed.
- `servicio/`: the Cloudflare Worker for the oral-defense correction.
- `scripts/datos.py`: generates the shared frame.
- `scripts/indice.py`: reads the built pages in `dist` and writes `indice.js` and `secciones.js` into the data folder of the build output.
- `scripts/bibliografia.py`: generates the bibliography.
- `public/voz/`: model and runtime files for private Whisper dictation. The three files over 5 MB are not in git: the Pages build downloads them with `scripts/descargar_voz.py` (cached by the manifest hash) and fails on a hash mismatch. Locally, run `python scripts/descargar_voz.py`.
- `.github/workflows/verificar.yml`: CI that runs Node and Playwright browser tests on every pull request.

## Where to start reading

Open `src/` for the home page and the laboratories, and `scripts/verificar_sitio.py` to see what the site must satisfy.

## Run it and check it

- `npm run build` compiles the Astro site into `dist` and builds the search index there (needs `beautifulsoup4`).
- The generators (`datos.py`, `descarga_preguntas.py`, `imagen_social.py`, `indice.py`) accept `--comprobar` and run after the build.
- `npm test` runs the tests.
- `python scripts/verificar_sitio.py` checks the built site in `dist`.
- The browser tests serve `dist` under `/tesis_explain/`, so build first.

`.github/workflows/pages.yml` builds the site and publishes `dist` to GitHub Pages on every push to `main`.

## Not covered

TODO(owner): What is out of scope or does not work yet.
