# fuentes-origen

The original woff2 files of the three font families, before subsetting. `scripts/subconjunto_fuentes.py` reads them and writes the smaller files that the site serves from `public/fuentes/`. The files here are not served and are not copied to `dist/`.

- Families: Archivo (variable, titles), Atkinson Hyperlegible (400, 700 and 400 italic, text) and IBM Plex Mono (400 and 600, labels).
- Source: the Latin subsets of the Fontsource packages, as the file names show (`<family>-latin-<weight>-<style>.woff2`). The package version was not recorded when they were added, so it is unknown.
- License: SIL Open Font License 1.1. The license texts are in `public/fuentes/OFL-*.txt` and stay with the served files.
- Do not edit or rename them. To change the subset, edit `scripts/subconjunto_fuentes.py` and run it again.
