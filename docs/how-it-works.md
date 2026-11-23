# How it works

Status: draft for the owner to confirm in the pull request. Written from the understanding the owner confirmed on 2026-11-19.

## From start to finish

1. A visitor opens a page of the guide on GitHub Pages. Nearly everything then runs in the visitor's browser: the static guide pages, the interactives, the local CSV laboratory and the Whisper dictation that loads its files from `public/voz/`.
2. The home page and `laboratorios.html` are Astro and Svelte sources in `src/`. `npm run build` compiles them into `dist`, copies `public/` into it unchanged, fills the inline critical CSS of the guide pages there and then builds the search index. `dist` is not committed.
3. In the oral-defense practice, the only step that leaves the browser is the AI correction. It goes to a Cloudflare Worker in `servicio/`, which uses Workers AI and a D1 database. The Worker is deployed apart from the site.

## Parts

- `src/`: Astro and Svelte source of the home page and `laboratorios.html`.
- `public/`: the guide pages and their `public/css/`, `public/js/`, `public/img/`, `public/fuentes/`, `public/datos/`, `public/descargas/`, `public/modelos/` and `public/voz/`. Astro copies it to `dist` with the same paths, so public URLs do not change.
- `dist`: build output, the only thing published. Not committed.
- `servicio/`: the Cloudflare Worker for the oral-defense correction.
- `scripts/datos.py`: generates the shared frame.
- `scripts/indice.py`: reads the built pages in `dist` and writes `indice.js` and `secciones.js` into the data folder of the build output.
- `scripts/css_critico.py`: reads the built guide pages in `dist` and replaces the `<style data-critico></style>` marker that the committed pages carry with their inline critical CSS.
- `scripts/bibliografia.py`: generates the bibliography.
- `public/voz/`: model and runtime files for private Whisper dictation. The three files over 5 MB are not in git: the Pages build downloads them with `scripts/descargar_voz.py` (cached by the manifest hash) and fails on a hash mismatch. Locally, run `python scripts/descargar_voz.py`.
- `.github/workflows/verificar.yml`: CI that runs Node and Playwright browser tests on every pull request.

## Where to start reading

Open `src/` for the home page and the laboratories, and `scripts/verificar_sitio.py` to see what the site must satisfy.

## Run it and check it

- `npm run build` compiles the Astro site into `dist`, fills the critical CSS of the guide pages there and builds the search index (needs `beautifulsoup4`).
- The generators (`datos.py`, `descarga_preguntas.py`, `imagen_social.py`, `indice.py`) accept `--comprobar` and run after the build.
- `voz_natural.py --comprobar` checks that every question and topic summary has its pre-generated audio in `public/audio/`, with no GPU. `python scripts/voz_natural.py` generates the missing audio and needs a GPU (see `docs/decisions/0010-voz-natural-pregenerada.md`). The site plays the file on press: `public/js/voz-natural.js` is the player, `public/js/voz-resumen.js` adds the Escuchar button to each summary and `public/js/defensa-voz.js` plays the question audio, with `speechSynthesis` as the fallback.
- `npm test` runs the tests.
- `python scripts/verificar_sitio.py` checks the built site in `dist`.
- The browser tests serve `dist` under `/tesis_explain/`, so build first.

`.github/workflows/pages.yml` builds the site and publishes `dist` to GitHub Pages on every push to `main`.

## Not covered

TODO(owner): What is out of scope or does not work yet.
