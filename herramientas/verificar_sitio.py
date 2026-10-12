"""Verificación estática de archivos, anclas, IDs, estado académico e índice.
Requiere BeautifulSoup solo durante desarrollo; no hace peticiones externas.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import unquote, urlsplit
import json, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
pages = {p.name: BeautifulSoup(p.read_text(encoding='utf-8'), 'html.parser') for p in ROOT.glob('*.html')}
failures, checks = [], 0


def check(condition, message):
    global checks
    checks += 1
    if not condition:
        failures.append(message)


for name, soup in pages.items():
    ids = [t['id'] for t in soup.select('[id]')]
    check(len(set(ids)) == len(ids), name + ': ID duplicado')
    check(soup.select_one('.aviso-academico') is not None, name + ': falta aviso estático')
    check(soup.select_one('.nav-estatica') is not None, name + ': falta navegación sin JS')
    for t in soup.select('a[href], script[src], link[href], img[src], source[srcset], source[src]'):
        value = t.get('href') or t.get('src') or t.get('srcset')
        for raw in (value.split(',') if t.has_attr('srcset') else [value]):
            u = urlsplit(raw.strip().split(' ')[0])
            if u.scheme or u.netloc:
                continue
            target = unquote(u.path) or name
            check((ROOT/target).exists(), name + ': recurso inexistente ' + raw)
            if u.fragment and target in pages:
                check(pages[target].find(id=unquote(u.fragment)) is not None, name + ': ancla inexistente ' + raw)
for step in ['datos.py', 'indice.py']:
    if step == 'datos.py':
        subprocess.run([sys.executable, str(ROOT/'herramientas'/step), '--comprobar'], check=True)
    else:
        sys.path.insert(0, str(ROOT/'herramientas'))
        import indice
        expected = indice.generar()
        check(not indice.comprobar_anclas(expected), 'índice: anclas inválidas')
        current = (ROOT/'datos/indice.js').read_text()
        check(json.loads(current.split('window.INDICE = ',1)[1].rsplit(';',1)[0]) == expected, 'índice desactualizado')
if failures:
    raise SystemExit('\n'.join(failures))
print('%d verificaciones estáticas correctas en %d páginas' % (checks, len(pages)))
