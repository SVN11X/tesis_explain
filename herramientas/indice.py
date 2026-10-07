"""Genera datos/indice.js, el índice del buscador, a partir de las páginas HTML del sitio.

Uso, desde la raíz del repositorio:
    pip install beautifulsoup4
    python3 herramientas/indice.py

Qué indexa:
  * Una entrada por cada sección con encabezado h2 con id, con todo su texto, incluidas tablas,
    listas y el texto alternativo de los interactivos (.vis-fallback).
  * Una entrada por cada h3 con id, con su texto y el de los elementos que le siguen hasta el
    próximo encabezado, para que el resultado lleve directo al bloque.
  * El resumen de cada tema y cada término del glosario.

No se recorta el texto buscable. Las secciones muy largas se dividen en partes de unos
LARGO_PARTE caracteres que se solapan, todas con el mismo enlace, para que el extracto que
muestra el buscador salga de la parte donde está la coincidencia. El recorte del extracto
visible se hace en js/sitio.js, no aquí.
"""
import json, os, re, sys
from bs4 import BeautifulSoup

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + os.sep
ORDEN = ['index', 'problema', 'robot', 'movimiento', 'control', 'mapeo', 'navegacion', 'exploracion',
         'gemelo', 'resultados', 'replicar', 'mundo-real', 'lecciones', 'recursos']
LARGO_PARTE = 2400      # caracteres por parte en secciones largas
SOLAPE = 300            # caracteres compartidos entre partes consecutivas
RUIDO = re.compile(r'\s*Necesita JavaScript\.?', re.I)


def limpio(t):
    return re.sub(r'\s+', ' ', RUIDO.sub('', t or '')).strip()


def partes(texto):
    """Divide un texto largo en partes solapadas, cortando en espacios."""
    if len(texto) <= LARGO_PARTE:
        return [texto]
    out, ini = [], 0
    while ini < len(texto):
        fin = min(len(texto), ini + LARGO_PARTE)
        if fin < len(texto):
            esp = texto.rfind(' ', ini + LARGO_PARTE // 2, fin)
            if esp > 0:
                fin = esp
        out.append(texto[ini:fin].strip())
        if fin >= len(texto):
            break
        nuevo = texto.rfind(' ', ini, fin - SOLAPE)
        ini = nuevo + 1 if nuevo > ini else fin - SOLAPE
    return out


def texto_h3(h):
    """Texto de un h3 y de los hermanos que le siguen hasta el próximo encabezado."""
    trozos = [limpio(h.get_text(' '))]
    cab = h.find_parent(class_='widget-cab')
    base = cab if cab else h
    for sib in base.find_next_siblings():
        if sib.name in ('h2', 'h3') or sib.find(['h2', 'h3']):
            break      # el bloque siguiente tiene su propia entrada
        trozos.append(limpio(sib.get_text(' ')))
    return ' '.join(t for t in trozos if t)


def generar():
    ent = []
    for pid in ORDEN:
        f = REPO + pid + '.html'
        s = BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
        titulo = limpio(s.find('h1').get_text(' ')) if pid != 'index' else 'Inicio'
        url = pid + '.html'
        for x in s.select('script, style, .fuentes-tema, nav, .lateral, #cabecera, #pie'):
            x.decompose()
        if pid == 'recursos':
            for g in s.select('[id^=g-]'):
                dt, dd = g.find('dt'), g.find('dd')
                if dt and dd:
                    ent.append(dict(u=url + '#' + g['id'], t=limpio(dt.get_text(' ')), p='Glosario', x=limpio(dd.get_text(' '))))
        # texto fuera de las secciones con encabezado: portada, presentación del tema y bloques sueltos
        sueltos = []
        hero = s.select_one('header.tema-hero .lead')
        if hero:
            sueltos.append(limpio(hero.get_text(' ')))
        cont = s.find('main') or s.body
        for x in cont.select('p, li, td, th, figcaption, dd, h1, h3, .cifra, .dato'):
            if x.find_parent(lambda t: t.name == 'section' and t.find('h2', id=True)):
                continue
            if x.find_parent(['li', 'td', 'p']) or x.find_parent(class_=['cifra', 'dato']):
                continue
            sueltos.append(limpio(x.get_text(' ')))
        vistos = []
        for t in sueltos:
            if t and t not in vistos:
                vistos.append(t)
        if vistos:
            for k, x in enumerate(partes(' '.join(vistos))):
                ent.append(dict(u=url, t=titulo, p='Portada' if pid == 'index' else 'Presentación', x=x, k=100 + k))
        for h in s.select('h2[id], h3[id]'):
            hid = h.get('id')
            if hid == 'fuentes':
                continue
            t = limpio(h.get_text(' '))
            sec = h.find_parent('section') or h.parent
            if hid == 't-breve':
                texto = limpio(sec.get_text(' '))
                ent.append(dict(u=url, t=titulo, p='Resumen', x=texto.replace(t, '', 1).strip()))
                continue
            texto = limpio(sec.get_text(' ')) if h.name == 'h2' else texto_h3(h)
            ancla = hid
            if pid == 'index' and h.name == 'h2' and sec.get('id'):
                ancla = sec['id']
            texto = texto.replace(t, '', 1).strip()
            if pid == 'recursos' and hid == 'glosario':
                # los términos ya tienen su propia entrada; aquí basta la introducción
                intro = sec.find('p')
                texto = limpio(intro.get_text(' ')) if intro else ''
            for k, x in enumerate(partes(texto)):
                ent.append(dict(u=url + '#' + ancla, t=t, p=titulo, x=x, k=k))
    vis, out = set(), []
    for e in ent:
        clave = (e['u'], e.get('k', 0))
        if clave in vis or not e['x']:
            continue
        vis.add(clave)
        e.pop('k', None)
        out.append(e)
    return out


def comprobar_anclas(out):
    """Cada enlace del índice debe apuntar a una página y a un id que existan."""
    errores = []
    cache = {}
    for e in out:
        pag, _, ancla = e['u'].partition('#')
        if pag not in cache:
            ruta = REPO + pag
            cache[pag] = open(ruta, encoding='utf-8').read() if os.path.exists(ruta) else None
        html = cache[pag]
        if html is None:
            errores.append('página inexistente: ' + e['u'])
        elif ancla and not re.search(r'id="' + re.escape(ancla) + '"', html):
            errores.append('ancla inexistente: ' + e['u'])
    return errores


if __name__ == '__main__':
    out = generar()
    errores = comprobar_anclas(out)
    if errores:
        print('\n'.join(errores))
        sys.exit(1)
    js = '/* Índice del buscador. Generado por herramientas/indice.py a partir de las páginas del sitio. No editar a mano. */\nwindow.INDICE = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(REPO + 'datos/indice.js', 'w', encoding='utf-8').write(js)
    print(len(out), 'entradas,', len(js) // 1024, 'KB')
