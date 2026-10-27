"""Sincroniza metadatos estáticos y un módulo local desde JSON/CSV de datos/ensayos y datos/analisis.
python3 herramientas/datos.py [--comprobar]
No transforma documentos ni conclusiones; no requiere bibliotecas externas.
"""
from pathlib import Path
import csv, html, json, re, sys

ROOT = Path(__file__).resolve().parents[1]
CHECK = '--comprobar' in sys.argv


def write(path, content):
    if CHECK:
        if not path.exists() or path.read_text(encoding='utf-8') != content:
            raise SystemExit('Desactualizado: ' + str(path.relative_to(ROOT)))
    else:
        path.write_text(content, encoding='utf-8')


academic = json.loads((ROOT / 'datos/academico.json').read_text())
params = json.loads((ROOT / 'datos/parametros.json').read_text())
def tablas(carpeta):
    out = {}
    for path in sorted((ROOT / carpeta).glob('*.csv')):
        rows = []
        for row in csv.DictReader(path.open(encoding='utf-8', newline='')):
            rows.append({k: (None if v == '' else float(v) if re.fullmatch(r'-?\d+(?:\.\d+)?', v) else v) for k, v in row.items()})
        out[path.stem] = rows
    return out


# ensayos: tablas resumidas de los ensayos. analisis: tablas que la tesis calcula sobre ellos.
trials = tablas('datos/ensayos')
analysis = tablas('datos/analisis')
payload = json.dumps(dict(academico=academic, parametros=params, ensayos=trials, analisis=analysis), ensure_ascii=False, separators=(',', ':'))
module = ('/* Generado por herramientas/datos.py desde JSON y CSV; no editar a mano. */\n'
          '(function(r){"use strict";var d=' + payload + ';'
          'if(typeof module!=="undefined"&&module.exports)module.exports=d;else r.PROYECTO=d;'
          '})(typeof globalThis!=="undefined"?globalThis:this);\n')
write(ROOT / 'datos/proyecto.js', module)

note = ('<!-- ESTADO ACADEMICO: generado por herramientas/datos.py -->\n'
        '<aside class="aviso-academico" aria-label="Estado de la investigación"><div class="wrap">'
        '<b>' + html.escape(academic['estado_texto']) + '</b><span>' + html.escape(academic['nota']) + '</span>'
        '<a href="recursos.html#estado-academico">Estado y procedencia</a></div></aside>\n'
        '<!-- FIN ESTADO ACADEMICO -->')
fallback = ('<noscript><nav class="nav-estatica wrap" aria-label="Navegación sin JavaScript">'
            '<a href="index.html#temas">Índice de temas</a> · <a href="preguntas.html">Preguntas</a> · '
            '<a href="laboratorio.html">Laboratorio</a> · <a href="recursos.html">Recursos y glosario</a>'
            '</nav></noscript>')
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


def fecha(iso):
    if not iso or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', iso):
        return None
    y, m, d = (int(x) for x in iso.split('-'))
    return '%d de %s de %d' % (d, MESES[m - 1], y)


def dato(valor, pendiente='Pendiente de confirmación del autor.'):
    return html.escape(str(valor)) if valor not in (None, '') else pendiente


def pendiente_html(p):
    # Admite el formato anterior (texto) y el actual ({texto, enlace}).
    texto, enlace = (p, None) if isinstance(p, str) else (p.get('texto', ''), p.get('enlace'))
    if enlace:
        return '<li><a href="%s">%s</a></li>' % (html.escape(enlace), html.escape(texto))
    return '<li>%s</li>' % html.escape(texto)


actualizado = fecha(academic.get('ultima_actualizacion_sitio'))
detalle = ('<!-- ESTADO DETALLE: generado por herramientas/datos.py desde datos/academico.json -->\n'
           '<dl class="estado-dl">'
           '<dt>Versión del documento de referencia</dt><dd>' + dato(academic.get('version_documento')) + '</dd>'
           '<dt>Fecha de los datos experimentales</dt><dd>' + dato(academic.get('fecha_datos')) + '</dd>'
           '<dt>Revisión de los datos</dt><dd>' + dato(academic.get('revision_datos')) + '</dd>'
           '<dt>Actualización de la plataforma</dt><dd>' + (actualizado + '. Es la fecha de esta actualización del sitio, distinta de la fecha del documento y de los experimentos.' if actualizado else 'Sin fecha registrada.') + '</dd>'
           '</dl>\n'
           '<h3 id="estado-pendientes">Pendiente de confirmación del autor</h3>\n'
           '<ul class="estado-pendientes">' + ''.join(pendiente_html(p) for p in academic.get('pendientes', [])) + '</ul>\n'
           '<h3 id="estado-historial">Historial de cambios del sitio</h3>\n'
           '<ol class="estado-historial" reversed>' + ''.join(
               '<li><time datetime="%s">%s</time> · %s. %s</li>' % (html.escape(h['fecha']), fecha(h['fecha']) or html.escape(h['fecha']),
                                                                    'Plataforma' if h.get('tipo') == 'plataforma' else 'Contenido académico' if h.get('tipo') == 'contenido' else html.escape(h.get('tipo', 'Cambio')),
                                                                    html.escape(h['cambio']))
               for h in reversed(academic.get('historial', []))) + '</ol>\n'
           '<!-- FIN ESTADO DETALLE -->')

# Bibliografía de la tesis en recursos.html. Cada referencia es una línea con su número, autor, tipo y
# resumen que se abre con el detalle: de qué trata el documento, para qué lo usa la tesis, dónde lo cita
# el documento, dónde lo explica esta guía y la cita completa. Los grupos siguen los temas de la guía.
bib = json.loads((ROOT / 'datos/bibliografia.json').read_text(encoding='utf-8'))
TEMAS = ['problema', 'robot', 'movimiento', 'control', 'mapeo', 'navegacion', 'exploracion', 'gemelo', 'resultados', 'replicar']
EXTRAS = {'mundo-real': 'En el mundo real', 'lecciones': 'Lecciones de ingeniería'}
titulos_h2 = {}


def destino(href):
    """Enlace a una sección de la guía con su número de tema y su título. Falla si el ancla no existe."""
    pag, _, ancla = href.partition('#')
    nombre = pag[:-5]
    if nombre not in TEMAS and nombre not in EXTRAS:
        raise SystemExit('bibliografia.json: página no admitida ' + href)
    if pag not in titulos_h2:
        texto = (ROOT / pag).read_text(encoding='utf-8')
        titulos_h2[pag] = {m.group(1): html.unescape(re.sub(r'<[^>]+>', '', m.group(2))).strip()
                           for m in re.finditer(r'<h2 id="([^"]+)"[^>]*>(.*?)</h2>', texto, re.S)}
    if ancla not in titulos_h2[pag]:
        raise SystemExit('bibliografia.json: sección inexistente ' + href)
    tema = 'tema %d' % (TEMAS.index(nombre) + 1) if nombre in TEMAS else EXTRAS[nombre]
    return '<a href="%s">%s</a> (%s)' % (html.escape(href), html.escape(titulos_h2[pag][ancla]), tema)


def serie(xs):
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' y ' + xs[-1]


def en_tesis(lugares):
    """['Introducción', '4.4.3', 'A3.1', 'A4.5'] -> 'Introducción. Sección 4.4.3. Anexos 3.1 y 4.5.'"""
    secs = [x for x in lugares if x[0].isdigit()]
    anexos = [x[1:] for x in lugares if x.startswith('A')]
    partes = ['Introducción'] if 'Introducción' in lugares else []
    if secs:
        partes.append(('Sección ' if len(secs) == 1 else 'Secciones ') + serie(secs))
    if anexos:
        partes.append(('Anexo ' if len(anexos) == 1 else 'Anexos ') + serie(anexos))
    return '. '.join(partes) + '.'


refs = bib['referencias']
en_grupos = [r for g in bib['grupos'] for r in g['referencias']]
if sorted(en_grupos) != sorted(refs) or len(set(en_grupos)) != len(en_grupos):
    raise SystemExit('bibliografia.json: cada referencia debe estar en un solo grupo')
if sorted(r['n'] for r in refs.values()) != list(range(1, len(refs) + 1)):
    raise SystemExit('bibliografia.json: los números deben ir de 1 a %d sin repetirse' % len(refs))
CAMPOS = ('tipo', 'autor', 'resumen', 'cita', 'contenido', 'uso', 'tesis')
for rid, r in refs.items():
    if any(not r.get(c) for c in CAMPOS):
        raise SystemExit('bibliografia.json: faltan datos en ' + rid)
    for c in ('autor', 'resumen', 'contenido', 'uso'):
        if ';' in r[c] or re.search(r'\s[-–—]\s|–|—', r[c]):
            raise SystemExit('bibliografia.json: ' + rid + ' usa punto y coma o guiones como separadores en ' + c)
    if len(r['resumen']) > 80:
        raise SystemExit('bibliografia.json: el resumen de ' + rid + ' supera los 80 caracteres')


def ref_html(rid, r):
    """Una línea de resumen que, al presionarla, abre el detalle de la referencia."""
    donde = '<span>En la tesis: ' + en_tesis(r['tesis']) + '</span>'
    if r['guia']:
        donde += ' <span>En esta guía: ' + serie([destino(h) for h in r['guia']]) + '.</span>'
    return ('<li><details class="bib-ref" id="%s"><summary><span class="bib-num"><span class="sr">Referencia </span>%d</span>'
            '<span class="bib-linea"><span class="bib-autor">%s</span> <span class="tipo-ref">%s</span> '
            '<span class="bib-resumen">%s</span></span></summary>\n'
            '<div class="bib-detalle"><p class="bib-contenido"><b>De qué trata.</b> %s</p>'
            '<p class="bib-uso"><b>Para qué la usa la tesis.</b> %s</p>'
            '<p class="bib-donde"><b>Dónde aparece.</b> %s</p>'
            '<p class="bib-cita"><b>Referencia completa.</b> %s</p></div></details></li>'
            % (rid, r['n'], html.escape(r['autor']), html.escape(r['tipo']), html.escape(r['resumen']),
               html.escape(r['contenido']), html.escape(r['uso']), donde, r['cita']))


bibliografia = ('<!-- BIBLIOGRAFIA: generado por herramientas/datos.py desde datos/bibliografia.json -->\n'
                '<p>Las %d referencias de la tesis, agrupadas según para qué las usa. Cada una muestra su autor, el tipo de '
                'documento y una línea de resumen. Al presionarla se abre el detalle: de qué trata el documento, para qué lo usa '
                'la tesis, dónde lo cita y, cuando corresponde, dónde lo explica esta guía. El número es el de la bibliografía '
                'de la tesis, y la cita sigue a la de la tesis, sin las fechas de consulta.</p>\n'
                % len(refs) +
                '<nav aria-label="Grupos de la bibliografía"><ul class="bib-mapa">' + ''.join(
                    '<li><a href="#%s">%s <span class="bib-n">%d<span class="sr"> referencias</span></span></a></li>'
                    % (g['id'], html.escape(g['titulo']), len(g['referencias'])) for g in bib['grupos']) + '</ul></nav>\n' +
                '\n'.join(
                    '<div class="bib-grupo"><h3 id="%s">%s</h3><p class="bib-desc">%s <span class="bib-tema">En la guía: %s.</span></p>\n'
                    '<details class="detalle"><summary>Ver %s</summary>\n<ol class="bib">\n%s\n</ol>\n</details></div>'
                    % (g['id'], html.escape(g['titulo']), html.escape(g['descripcion']), destino(g['tema']),
                       'la referencia' if len(g['referencias']) == 1 else 'las %d referencias' % len(g['referencias']),
                       '\n'.join(ref_html(r, refs[r]) for r in g['referencias']))
                    for g in bib['grupos']) +
                '\n<!-- FIN BIBLIOGRAFIA -->')

for path in sorted(ROOT.glob('*.html')):
    original = path.read_text(encoding='utf-8')
    text = original
    if 'BIBLIOGRAFIA:' in text:
        text = re.sub(r'<!-- BIBLIOGRAFIA:.*?<!-- FIN BIBLIOGRAFIA -->', lambda _: bibliografia, text, flags=re.S)
    if 'ESTADO DETALLE:' in text:
        text = re.sub(r'<!-- ESTADO DETALLE:.*?<!-- FIN ESTADO DETALLE -->', lambda _: detalle, text, flags=re.S)
    if 'ESTADO ACADEMICO:' in text:
        text = re.sub(r'<!-- ESTADO ACADEMICO:.*?<!-- FIN ESTADO ACADEMICO -->', lambda _: note, text, flags=re.S)
    else:
        text = text.replace('<div id="cabecera"></div>', '<div id="cabecera"></div>\n' + note + '\n' + fallback)
    if '<script src="datos/proyecto.js" defer></script>' not in text:
        text = text.replace('<script src="js/comun.js" defer></script>', '<script src="datos/proyecto.js" defer></script>\n<script src="js/comun.js" defer></script>')
    write(path, text)
print('Metadatos, CSV y HTML sincronizados' + (' (comprobación)' if CHECK else ''))
