"""Marco común del sitio: metadatos y script del tema, cabecera, aviso académico, pie y buscador, desde
herramientas/plantillas/.

datos.py lo inserta en cada página de la guía y escribe web/src/generado/marco.json para que la portada
y los laboratorios, compilados con Astro, usen exactamente el mismo marcado.
"""
from pathlib import Path
import html, json, re

ROOT = Path(__file__).resolve().parents[1]
PLANTILLAS = ROOT / 'herramientas/plantillas'
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
# Destino de la navegación principal que corresponde a cada página. Las demás partes de la guía marcan «Guía».
NAV = {'index': 'inicio', 'laboratorios': 'laboratorios', 'robot': 'robot', 'resultados': 'evidencia',
       'replicar': 'construir', 'recursos': 'recursos'}


def fecha(iso):
    if not iso or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', iso):
        return None
    y, m, d = (int(x) for x in iso.split('-'))
    return '%d de %s de %d' % (d, MESES[m - 1], y)


def rellenar(texto, academic):
    pdf = academic.get('tesis_pdf')
    valores = {
        'estado_texto': html.escape(academic['estado_texto']),
        'nota': html.escape(academic['nota']),
        'revision_iso': html.escape(academic.get('ultima_actualizacion_sitio') or ''),
        'revision_texto': html.escape(fecha(academic.get('ultima_actualizacion_sitio')) or 'sin fecha'),
        'version': html.escape(academic.get('version_documento') or 'pendiente de confirmación'),
        'tesis_pdf': (' <a href="%s">Descargar la tesis en PDF</a>.' % html.escape(pdf)) if pdf else '',
    }
    salida = re.sub(r'\{\{(\w+)\}\}', lambda m: valores[m.group(1)], texto)
    assert '{{' not in salida, 'plantilla con un campo sin valor'
    return salida


def plantillas(academic):
    return {nombre: rellenar((PLANTILLAS / (nombre + '.html')).read_text(encoding='utf-8').strip(), academic)
            for nombre in ('tema', 'cabecera', 'pie')}


def marcar(texto, pagina):
    """Marca el destino de la navegación que corresponde a la página."""
    destino = NAV.get(pagina, 'guia')
    valor = 'true' if destino == 'guia' else 'page'
    return texto.replace('data-nav="%s"' % destino, 'data-nav="%s" aria-current="%s"' % (destino, valor))


def json_astro(academic):
    return json.dumps(plantillas(academic), ensure_ascii=False, indent=1) + '\n'
