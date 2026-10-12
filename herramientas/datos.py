"""Sincroniza metadatos estáticos y un módulo local desde JSON/CSV.
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
trials = {}
for path in sorted((ROOT / 'datos/ensayos').glob('*.csv')):
    rows = []
    for row in csv.DictReader(path.open(encoding='utf-8', newline='')):
        rows.append({k: (None if v == '' else float(v) if re.fullmatch(r'-?\d+(?:\.\d+)?', v) else v) for k, v in row.items()})
    trials[path.stem] = rows
payload = json.dumps(dict(academico=academic, parametros=params, ensayos=trials), ensure_ascii=False, separators=(',', ':'))
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

for path in sorted(ROOT.glob('*.html')):
    original = path.read_text(encoding='utf-8')
    text = original
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
