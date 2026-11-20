"""Comprueba que el resumen por sección de una página larga no perdió ninguna cifra ni referencia a la tesis.

Uso:
  python scripts/comparar_resumen.py PAGINA            compara PAGINA.html con la lista guardada
  python scripts/comparar_resumen.py PAGINA --guardar ARCHIVO.html
                                                            guarda las cifras y referencias de ese HTML

La lista guardada (scripts/cifras_PAGINA_antes.json) sale de la página antes de plegarla.
Se comprueban dos cosas:
  1. Todo número y toda referencia (sección, tabla, figura, anexo) del texto de antes sigue en la página,
     ya sea en un resumen o en un detalle plegado, porque el texto original se movió completo.
  2. Todo número y toda referencia de un resumen (p.resumen) aparece también fuera de los resúmenes,
     es decir, en el texto que el resumen resume. Un resumen no inventa cifras.
Requiere beautifulsoup4 solo para esta prueba.
"""
import json
import re
import sys
from pathlib import Path
from bs4 import BeautifulSoup

RAIZ = Path(__file__).resolve().parents[1]
NUM = re.compile(r'\d+(?:[.,]\d+)*')
REF = re.compile(r'(secci[oó]n|secciones|tablas?|figuras?|figs?\.|anexos?)\s+([A-Za-z]?\d[\d.]*)', re.I)


def norm_ref(m):
    clase = m.group(1).lower().rstrip('.')
    clase = {'secciones': 'sección', 'sección': 'sección', 'seccion': 'sección', 'tablas': 'tabla', 'figuras': 'figura', 'figs': 'figura', 'fig': 'figura', 'anexos': 'anexo'}.get(clase, clase)
    return clase + ' ' + m.group(2).rstrip('.')


def extraer(html, quitar_resumenes=False, solo_resumenes=False):
    s = BeautifulSoup(html, 'html.parser')
    main = s.find('main') or s
    for x in main.select('script, style'):
        x.decompose()
    if solo_resumenes:
        partes = []
        for p in main.select('p.resumen'):
            for a in p.select('a.ref'):
                a.decompose()
            partes.append(p.get_text(' '))
        texto = ' '.join(partes)
    else:
        if quitar_resumenes:
            for p in main.select('p.resumen'):
                p.decompose()
        texto = main.get_text(' ')
    texto = re.sub(r'\s+', ' ', texto)
    return set(NUM.findall(texto)), {norm_ref(m) for m in REF.finditer(texto)}


def main():
    args = sys.argv[1:]
    if not args or args[0].startswith('-'):
        print('uso: comparar_resumen.py PAGINA [--guardar ARCHIVO.html]')
        return 2
    pagina = args[0].removesuffix('.html')
    fijo = Path(__file__).resolve().with_name('cifras_%s_antes.json' % pagina)
    if len(args) == 3 and args[1] == '--guardar':
        nums, refs = extraer(Path(args[2]).read_text(encoding='utf-8'))
        fijo.write_text(json.dumps({'numeros': sorted(nums), 'referencias': sorted(refs)}, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print('guardado: %d números y %d referencias' % (len(nums), len(refs)))
        return 0
    antes = json.loads(fijo.read_text(encoding='utf-8'))
    html = (RAIZ / 'public' / (pagina + '.html')).read_text(encoding='utf-8')
    nums, refs = extraer(html)
    fallas = []
    for n in antes['numeros']:
        if n not in nums:
            fallas.append('número perdido: ' + n)
    for r in antes['referencias']:
        if r not in refs:
            fallas.append('referencia perdida: ' + r)
    fuera_n, fuera_r = extraer(html, quitar_resumenes=True)
    res_n, res_r = extraer(html, solo_resumenes=True)
    for n in sorted(res_n - fuera_n):
        fallas.append('número del resumen que no está en el texto: ' + n)
    for r in sorted(res_r - fuera_r):
        fallas.append('referencia del resumen que no está en el texto: ' + r)
    resumenes = len(BeautifulSoup(html, 'html.parser').select('p.resumen'))
    if not resumenes:
        fallas.append('no hay resúmenes en %s.html' % pagina)
    print('%d números y %d referencias de antes, %d resúmenes con %d números y %d referencias' % (len(antes['numeros']), len(antes['referencias']), resumenes, len(res_n), len(res_r)))
    for f in fallas:
        print('FALLA ' + f)
    print('ok' if not fallas else 'con fallas')
    return 1 if fallas else 0


if __name__ == '__main__':
    sys.exit(main())
