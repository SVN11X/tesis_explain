#!/usr/bin/env python3
"""Regenerates public/fuentes/*.woff2 from the original files in scripts/fuentes-origen/.

Each output keeps the same file name, the same family name and the same hinting as its original. It only drops what the
site does not use:
  - the glyphs of characters that appear in no page, script, data file or style (Basic Latin, the Spanish letters and
    marks and a short list of typographic marks are always kept);
  - the width axis (wdth) of Archivo, which no style uses (the site only asks for the normal width);
  - the layout features other than kerning, ligatures, contextual forms and mark positioning.

Usage (from the repository root, needs fonttools and brotli: pip install fonttools brotli):
    python scripts/subconjunto_fuentes.py             # writes public/fuentes/*.woff2
    python scripts/subconjunto_fuentes.py --comprobar # fails if a used character is missing from an output
"""
import glob
import io
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
ORIGEN = ROOT / 'scripts' / 'fuentes-origen'
DESTINO = ROOT / 'public' / 'fuentes'
# Where the site's text lives. A character that appears in any of these files is kept.
TEXTOS = ('public/*.html', 'public/js/*.js', 'public/datos/*.js', 'public/datos/**/*.json', 'public/css/*.css',
          'src/**/*.astro', 'src/**/*.svelte', 'src/**/*.ts', 'src/generado/*.json', 'scripts/plantillas/*')
# Always kept: Basic Latin, the no-break space, the Spanish letters and marks, and common typographic marks. Any other
# character is kept only if the site uses it.
BASE = set(range(0x20, 0x7F)) | {0xA0, 0xA1, 0xAB, 0xB0, 0xB7, 0xBB, 0xBF} | {ord(c) for c in 'áéíóúüñÁÉÍÓÚÜÑ'} | {
    0x131, 0x2007, 0x2009, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x202F, 0x20AC, 0x2122,
    0x2190, 0x2191, 0x2192, 0x2193, 0x2212, 0x2215, 0xFEFF}
FEATURES = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk']


def caracteres_usados():
    usados = set()
    for patron in TEXTOS:
        for f in glob.glob(str(ROOT / patron), recursive=True):
            try:
                usados |= {ord(c) for c in Path(f).read_text(encoding='utf-8')}
            except (UnicodeDecodeError, OSError):
                pass
    return usados


def cubiertos(ruta):
    return set(TTFont(str(ruta)).getBestCmap())


def generar(origen, destino, unicodes):
    fuente = TTFont(str(origen))
    if 'fvar' in fuente and any(a.axisTag == 'wdth' for a in fuente['fvar'].axes):
        fuente = instancer.instantiateVariableFont(fuente, {'wdth': 100})
        tmp = io.BytesIO()
        fuente.save(tmp)
        tmp.seek(0)
        fuente = TTFont(tmp)
    opciones = subset.Options()
    opciones.flavor = 'woff2'
    opciones.layout_features = FEATURES
    opciones.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    opciones.notdef_outline = True
    opciones.hinting = True
    sub = subset.Subsetter(opciones)
    sub.populate(unicodes=sorted(unicodes))
    sub.subset(fuente)
    fuente.flavor = 'woff2'
    fuente.save(str(destino))


def main():
    comprobar = '--comprobar' in sys.argv
    pedidos = BASE | caracteres_usados()
    malos = 0
    DESTINO.mkdir(parents=True, exist_ok=True)
    for origen in sorted(ORIGEN.glob('*.woff2')):
        destino = DESTINO / origen.name
        en_origen = cubiertos(origen)
        if comprobar:
            if not destino.exists():
                print('FALTA', destino.name)
                malos += 1
                continue
            perdidos = sorted((pedidos & en_origen) - cubiertos(destino))
            if perdidos:
                malos += 1
                print('FALLA %s: faltan %s' % (destino.name, ' '.join('U+%04X' % c for c in perdidos)))
            else:
                print('ok %s (%d bytes)' % (destino.name, destino.stat().st_size))
            continue
        generar(origen, destino, pedidos & en_origen)
        print('%s: %d -> %d bytes' % (origen.name, origen.stat().st_size, destino.stat().st_size))
    sys.exit(1 if malos else 0)


if __name__ == '__main__':
    main()
