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
            # Astro publica bajo el prefijo de proyecto de GitHub Pages.
            if target.startswith('/tesis_explain/'):
                target = target[len('/tesis_explain/'):] or 'index.html'
            elif target == '/tesis_explain':
                target = 'index.html'
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
        check((ROOT/'datos/secciones.js').exists() and (ROOT/'datos/secciones.js').read_text() == indice.js_secciones(indice.secciones()), 'secciones del índice lateral desactualizadas')
# La lista de temas de la portada tiene las 16 partes de la guía, en el orden y con los títulos de js/sitio.js
import re, struct
sitio = (ROOT/'js/sitio.js').read_text(encoding='utf-8')
secuencia = re.findall(r'\{ id: "([^"]+)", t: "([^"]+)"', sitio[sitio.index('var CAPS'):sitio.index('var SECUENCIA')])
filas = [(a['href'].rsplit('/', 1)[-1].replace('.html', ''), a.h4.get_text(strip=True)) for a in pages['index.html'].select('.chapter-row')]
check(len(secuencia) == 16 and filas == secuencia, 'portada: la lista de temas no coincide con las 16 partes de js/sitio.js %s' % filas)
check(all(a.get('data-pag') == a['href'].rsplit('/', 1)[-1].replace('.html', '') for a in pages['index.html'].select('.chapter-row')), 'portada: cada tema lleva su data-pag')

# Modelo del CAD: franjas amarillas en su propio nodo y materiales de dos caras (herramientas/modelo_robot.py)
glb = (ROOT/'modelos/robot.glb').read_bytes()
largo = struct.unpack_from('<I', glb, 12)[0]
gltf = json.loads(glb[20:20 + largo])
nodos = {n.get('name'): n for n in gltf['nodes']}
franja = nodos.get('cubierta__franjas')
check(franja is not None, 'modelo: falta el nodo de las franjas')
if franja is not None:
    mat = gltf['materials'][gltf['meshes'][franja['mesh']]['primitives'][0]['material']]
    r, g, b = mat['pbrMetallicRoughness']['baseColorFactor'][:3]
    check(r > .6 and g > .6 and b < .2, 'modelo: las franjas no son amarillas %s' % [r, g, b])
check(all(m.get('doubleSided') for m in gltf['materials']), 'modelo: hay materiales de una sola cara')
negros = [m['pbrMetallicRoughness']['baseColorFactor'] for m in gltf['materials'] if m['name'].startswith('cubierta_') and m['name'] != 'cubierta_franjas']
check(negros and all(max(c[:3]) < .05 for c in negros), 'modelo: la carcasa no es negra')

# Paleta de acentos: texto de color con 4,5:1 sobre el papel y sobre su propio fondo, en los dos temas
def luminancia(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]


def contraste(a, b):
    la, lb = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (la + .05) / (lb + .05)


marco_css = (ROOT/'css/marco.css').read_text(encoding='utf-8')
claro = marco_css[marco_css.index(':root {'):marco_css.index('@media (prefers-color-scheme: dark)')]
oscuro = marco_css[marco_css.index(':root[data-theme="dark"] {'):]
oscuro = oscuro[:oscuro.index('}')]
for nombre, bloque in (('claro', claro), ('oscuro', oscuro)):
    tokens = dict(re.findall(r'--([a-z-]+):\s*(#[0-9a-f]{6})\b', bloque))
    papel, tinta = tokens['paper'], tokens['ink']
    for color in ('verde', 'amarillo', 'naranja', 'azul', 'turquesa', 'violeta', 'frambuesa'):
        texto, fondo = tokens['c-' + color], tokens['c-%s-fondo' % color]
        check(contraste(texto, papel) >= 4.5 and contraste(texto, fondo) >= 4.5 and contraste(tinta, fondo) >= 4.5,
              'paleta %s: --c-%s no llega a 4,5:1 (%.2f sobre el papel, %.2f sobre su fondo)' % (nombre, color, contraste(texto, papel), contraste(texto, fondo)))
    check(contraste(tokens.get('sobre-robot', '#182825'), tokens.get('c-robot', '#efe36b')) >= 4.5, 'paleta %s: texto sobre el amarillo del robot' % nombre)

if failures:
    raise SystemExit('\n'.join(failures))
print('%d verificaciones estáticas correctas en %d páginas' % (checks, len(pages)))
