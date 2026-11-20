# How it works

Status: draft for the owner to confirm in the pull request. Written from the understanding the owner confirmed on 2026-11-19.

## From start to finish

1. A visitor opens a page of the guide on GitHub Pages. Nearly everything then runs in the visitor's browser: the static guide pages, the interactives, the local CSV laboratory and the Whisper dictation that loads its files from `voz/`.
2. The home page and `laboratorios.html` are Astro and Svelte sources in `web/`. `npm run build` compiles them into the repository root.
3. In the oral-defense practice, the only step that leaves the browser is the AI correction. It goes to a Cloudflare Worker in `servicio/`, which uses Workers AI and a D1 database. The Worker is deployed apart from the site.

## Parts

- `web/`: Astro and Svelte source of the home page and `laboratorios.html`.
- `servicio/`: the Cloudflare Worker for the oral-defense correction.
- `scripts/datos.py`: generates the shared frame.
- `scripts/indice.py`: generates the search index.
- `scripts/bibliografia.py`: generates the bibliography.
- `voz/`: model and runtime files for private Whisper dictation.
- `.github/workflows/verificar.yml`: CI that runs Node and Playwright browser tests on every pull request.

## Where to start reading

Open `web/` for the home page and the laboratories, and `scripts/verificar_sitio.py` to see what the site must satisfy.

## Run it and check it

- `npm run build` compiles the Astro site into the root.
- `npm test` runs the tests.
- `python scripts/verificar_sitio.py` checks the built site.

GitHub Pages publishes from the root of `main` today.

## Not covered

TODO(owner): What is out of scope or does not work yet.
