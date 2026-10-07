"""Genera datos/indice.js, el índice del buscador, a partir de las páginas HTML del sitio.
Uso: python3 herramientas/indice.py   (requiere: pip install beautifulsoup4)"""
import json, re, os
from bs4 import BeautifulSoup
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + os.sep
ORDEN = ['index','problema','robot','movimiento','control','mapeo','navegacion','exploracion','gemelo','resultados','replicar','mundo-real','lecciones','recursos']
def limpio(t): return re.sub(r'\s+', ' ', t).strip()
ent = []
for pid in ORDEN:
    f = REPO + pid + '.html'
    s = BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
    titulo = limpio(s.find('h1').get_text()) if pid != 'index' else 'Inicio'
    url = pid + '.html'
    for x in s.select('script, style, .vis-fallback, .fuentes-tema, nav, .lateral'): x.decompose()
    if pid == 'recursos':
        for g in s.select('[id^=g-]'):
            dt, dd = g.find('dt'), g.find('dd')
            if dt and dd: ent.append(dict(u=url + '#' + g['id'], t=limpio(dt.get_text()), p='Glosario', x=limpio(dd.get_text())))
    # una entrada por h2 con id (y por h3 con id dentro de la sección cuando es un bloque grande)
    for h in s.select('h2[id], h3[id]'):
        if h.get('id') in ('t-breve', 'fuentes'): 
            if h.get('id') == 't-breve':
                sec = h.find_parent('section')
                ent.append(dict(u=url, t=titulo, p='Resumen', x=limpio(sec.get_text(' ')).replace(limpio(h.get_text()), '', 1).strip()[:700]))
            continue
        if h.name == 'h3' and not h.find_parent(class_=re.compile('widget|seccion')) and pid != 'index':
            # h3 sueltos: subtítulos de lectura
            pass
        sec = h.find_parent('section') or h.parent
        if h.name == 'h2':
            texto = limpio(sec.get_text(' '))
        else:
            # texto del h3 y los hermanos siguientes hasta el próximo encabezado
            partes = [limpio(h.get_text())]
            cont = h.find_parent(class_='widget-cab')
            base = cont if cont else h
            for sib in base.find_next_siblings():
                if sib.name in ('h2', 'h3'): break
                partes.append(limpio(sib.get_text(' ')))
                if sum(len(p) for p in partes) > 900: break
            texto = ' '.join(partes)
        t = limpio(h.get_text())
        if pid == 'recursos' and h.get('id') == 'glosario': texto = texto[:300]
        ancla = h['id']
        if pid == 'index' and h.name == 'h2' and sec.get('id'): ancla = sec['id']
        ent.append(dict(u=url + '#' + ancla, t=t, p=titulo, x=texto.replace(t, '', 1).strip()[:900]))
# sin duplicados de url
vis, out = set(), []
for e in ent:
    if e['u'] in vis or not e['x']: continue
    e['x'] = limpio(e['x']); vis.add(e['u']); out.append(e)
js = '/* Índice del buscador. Generado a partir de las páginas del sitio. */\nwindow.INDICE = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(REPO + 'datos/indice.js', 'w', encoding='utf-8').write(js)
print(len(out), 'entradas,', len(js) // 1024, 'KB')
