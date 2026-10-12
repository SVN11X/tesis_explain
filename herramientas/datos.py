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
for path in sorted(ROOT.glob('*.html')):
    original = path.read_text(encoding='utf-8')
    text = original
    if 'ESTADO ACADEMICO:' in text:
        text = re.sub(r'<!-- ESTADO ACADEMICO:.*?<!-- FIN ESTADO ACADEMICO -->', lambda _: note, text, flags=re.S)
    else:
        text = text.replace('<div id="cabecera"></div>', '<div id="cabecera"></div>\n' + note + '\n' + fallback)
    if '<script src="datos/proyecto.js" defer></script>' not in text:
        text = text.replace('<script src="js/comun.js" defer></script>', '<script src="datos/proyecto.js" defer></script>\n<script src="js/comun.js" defer></script>')
    write(path, text)
print('Metadatos, CSV y HTML sincronizados' + (' (comprobación)' if CHECK else ''))
