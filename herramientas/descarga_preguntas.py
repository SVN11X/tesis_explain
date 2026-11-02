"""Genera descargas/preguntas-dificiles.pdf con las preguntas de preguntas.html y sus respuestas.

Uso, desde la raíz del repositorio:
    pip install beautifulsoup4 playwright
    python3 herramientas/descarga_preguntas.py              # genera el PDF, su manifiesto y el botón
    python3 herramientas/descarga_preguntas.py --comprobar  # solo revisa que estén al día, sin navegador

El PDF lo imprime Chromium desde una plantilla propia, con las fuentes del sitio. El manifiesto guarda la huella
del contenido de las preguntas: si cambia una pregunta, una respuesta o una fuente, la comprobación falla hasta
regenerar el PDF. El botón de descarga se escribe en preguntas.html, entre los comentarios DESCARGA PREGUNTAS.
"""
from pathlib import Path
import hashlib, html, json, re, sys, tempfile
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'descargas/preguntas-dificiles.pdf'
MANIFIESTO = ROOT / 'descargas/preguntas-dificiles.json'
SITIO = 'https://svn11x.github.io/tesis_explain/'
VERSION_PLANTILLA = '3'
NIVELES = {'general': 'Para todo público', 'tecnica': 'Técnica', 'exigente': 'Exigente'}
ICONO_DESCARGA = ('<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/></svg>')


def absolutos(nodo):
    """Los enlaces a otras páginas pasan a direcciones completas. Los de las fuentes quedan dentro del PDF."""
    for a in nodo.find_all('a', href=True):
        h = a['href']
        if h.startswith('#'):
            continue
        if not re.match(r'^[a-z]+:', h):
            a['href'] = SITIO + h
    for x in nodo.find_all(['svg', 'script']) + nodo.select('[hidden]'):
        x.decompose()
    return nodo


def contenido():
    s = BeautifulSoup((ROOT / 'preguntas.html').read_text(encoding='utf-8'), 'html.parser')
    temas = []
    for h in s.select('.articulo section > h2[id]'):
        sec = h.find_parent('section')
        qs = sec.select('details.pregunta')
        if not qs:
            continue
        preguntas = []
        for q in qs:
            cuerpo = absolutos(q.select_one('.q-cuerpo'))
            preguntas.append({'id': q['id'], 'n': q.select_one('.q-n').get_text(strip=True), 'titulo': q.select_one('.q-t').get_text(' ', strip=True),
                              'nivel': NIVELES[q['data-dificultad']], 'cuerpo': cuerpo.decode_contents().strip()})
        temas.append({'id': h['id'], 'titulo': h.get_text(' ', strip=True), 'preguntas': preguntas})
    metodo = absolutos(s.find('h2', id='como-responder').find_parent('section'))
    metodo.find('h2').decompose()
    fuentes = absolutos(s.find('h2', id='fuentes').find_parent('section').select_one('ol.refs-lista'))
    academico = json.loads((ROOT / 'datos/academico.json').read_text(encoding='utf-8'))
    return temas, metodo.decode_contents().strip(), str(fuentes), academico


def cuerpo_html(temas, metodo, fuentes, academico):
    total = sum(len(t['preguntas']) for t in temas)
    out = ['<section class="portada"><p class="sobre">Robot explorador · Guía abierta de una tesis de la UTEM</p><h1>Preguntas difíciles</h1>',
           '<p class="bajada">%d preguntas sobre la tesis, cada una con su respuesta, la repregunta más probable y la sección que la respalda.</p>' % total,
           '<dl><div><dt>Tesis</dt><dd><i>Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial</i></dd></div>',
           '<div><dt>Autor</dt><dd>Sebastián Valderas Neculqueo</dd></div><div><dt>Profesor guía</dt><dd>Patricio Galarce Acevedo</dd></div>',
           '<div><dt>Versión de la tesis</dt><dd>%s</dd></div><div><dt>Estado</dt><dd>%s. %s</dd></div>' % (
               html.escape(academico['version_documento']), html.escape(academico['estado_texto']), html.escape(academico['nota'])),
           '<div><dt>En línea</dt><dd><a href="%spreguntas.html">%spreguntas.html</a></dd></div></dl>' % (SITIO, SITIO.replace('https://', '')),
           '<p class="niveles"><b>Niveles.</b> Para todo público: qué hace el robot y para qué sirve. Técnica: cómo funciona cada pieza. '
           'Exigente: busca el punto débil de una cifra o de una decisión.</p>',
           '</section><section class="contenido"><h2 class="indice-tit">Contenido</h2><ol class="indice">']
    for t in temas:
        out.append('<li><a href="#%s">%s</a><span>preguntas %s a %s</span></li>' % (t['id'], html.escape(t['titulo']), t['preguntas'][0]['n'], t['preguntas'][-1]['n']))
    out.append('<li><a href="#como-responder">Cómo responder una pregunta difícil</a></li><li><a href="#fuentes">Fuentes</a></li></ol></section>')
    for i, t in enumerate(temas, 1):
        out.append('<section class="tema"><h2 id="%s"><span>%02d</span>%s</h2>' % (t['id'], i, html.escape(t['titulo'])))
        for q in t['preguntas']:
            out.append('<article class="pregunta"><h3><span class="n">%s</span>%s <span class="nivel">%s</span></h3>%s</article>' % (
                q['n'], html.escape(q['titulo']), q['nivel'], q['cuerpo']))
        out.append('</section>')
    out.append('<section class="anexo"><h2 id="como-responder">Cómo responder una pregunta difícil</h2>%s</section>' % metodo)
    out.append('<section class="anexo"><h2 id="fuentes">Fuentes</h2>%s</section>' % fuentes)
    return '\n'.join(out), total


ESTILO = """
@page { size: A4; margin: 18mm 17mm 20mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Atkinson Hyperlegible', Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: #182825; }
h1, h2, h3 { font-family: 'Archivo', Arial, sans-serif; font-weight: 560; letter-spacing: -.02em; line-height: 1.15; color: #182825; }
a { color: #182825; }
.contenido { page-break-before: always; }
.sobre { font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: .12em; font-size: 8pt; color: #58655c; margin: 0 0 40mm; }
h1 { font-size: 36pt; letter-spacing: -.045em; line-height: 1.02; margin: 0 0 6mm; }
.bajada { font-size: 13pt; max-width: 34em; margin: 0 0 10mm; }
dl { margin: 0 0 8mm; display: grid; gap: 2.5mm; }
dl div { display: grid; grid-template-columns: 38mm 1fr; gap: 4mm; }
dt { font-weight: 700; color: #58655c; }
dd { margin: 0; }
.niveles { font-size: 9.5pt; color: #33433d; border-left: 3px solid #769631; padding-left: 4mm; margin: 0 0 10mm; }
.indice-tit { font-size: 20pt; margin: 0 0 6mm; }
.indice { margin: 0; padding-left: 7mm; font-size: 11pt; }
.indice li { padding: 1.6mm 0; }
.indice span { color: #58655c; margin-left: 3mm; font-size: 9pt; }
.tema { page-break-before: always; }
.tema > h2 { font-size: 18pt; margin: 0 0 5mm; padding-bottom: 2mm; border-bottom: 1px solid #182825; }
.tema > h2 span { font-family: 'IBM Plex Mono', monospace; font-weight: 400; letter-spacing: 0; font-size: 11pt; color: #58655c; margin-right: 3mm; }
.pregunta { break-inside: avoid; margin: 0 0 5mm; padding: 0 0 4mm; border-bottom: 1px solid #ccd0c3; }
.pregunta h3 { font-size: 11.5pt; margin: 0 0 2mm; }
.pregunta h3 .n { font-family: 'IBM Plex Mono', monospace; font-weight: 400; letter-spacing: 0; font-size: 9pt; color: #182825; background: #e0e6c9; padding: 0 1.5mm; margin-right: 2mm; }
.pregunta h3 .nivel { font-family: 'IBM Plex Mono', monospace; font-weight: 400; letter-spacing: .06em; text-transform: uppercase; font-size: 7pt; color: #58655c; border: 1px solid #b4bdab; padding: 0 2mm; margin-left: 1.5mm; white-space: nowrap; }
.pregunta p { margin: 0 0 2mm; }
.q-sigue { margin: 2mm 0; padding: 2mm 3mm; background: #f1f1e9; border-left: 2px solid #b4bdab; }
.q-sigue .q-rot { font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: .08em; font-size: 7.5pt; color: #58655c; margin-bottom: 1mm; }
.q-pendiente { color: #8A4B00; font-size: 9.5pt; }
.q-respaldo, .q-ver { font-size: 9pt; color: #33433d; }
.q-ver::before { content: "En la guía: "; }
.ref { font-size: 7.5pt; vertical-align: super; text-decoration: none; }
.anexo { page-break-before: always; }
.anexo h2 { font-size: 16pt; margin: 0 0 4mm; }
.anexo .callout { margin: 0 0 5mm; padding: 3mm 4mm; border-left: 3px solid #769631; background: #f1f1e9; break-inside: avoid; }
.anexo .c-tit { font-weight: 700; margin-bottom: 1mm; }
.refs-lista { padding-left: 7mm; font-size: 9pt; }
.refs-lista li { margin-bottom: 2mm; break-inside: avoid; }
.tipo-ref { display: inline-block; font-family: 'IBM Plex Mono', monospace; font-size: 7pt; text-transform: uppercase; letter-spacing: .08em; color: #58655c; margin-right: 2mm; }
"""


def fuentes_css():
    f = (ROOT / 'fuentes').as_uri()
    return ("@font-face { font-family: 'Atkinson Hyperlegible'; src: url('%s/atkinson-hyperlegible-latin-400-normal.woff2'); font-weight: 400; }\n"
            "@font-face { font-family: 'Atkinson Hyperlegible'; src: url('%s/atkinson-hyperlegible-latin-700-normal.woff2'); font-weight: 700; }\n"
            "@font-face { font-family: 'Atkinson Hyperlegible'; src: url('%s/atkinson-hyperlegible-latin-400-italic.woff2'); font-weight: 400; font-style: italic; }\n"
            "@font-face { font-family: 'Archivo'; src: url('%s/archivo-latin-variable.woff2'); font-weight: 500 800; font-stretch: 62%% 125%%; }\n"
            "@font-face { font-family: 'IBM Plex Mono'; src: url('%s/ibm-plex-mono-latin-400-normal.woff2'); font-weight: 400; }\n") % (f, f, f, f, f)


def huella(cuerpo):
    return hashlib.sha256((VERSION_PLANTILLA + '\n' + cuerpo).encode('utf-8')).hexdigest()


def boton(m):
    mb = ('%.1f' % (m['bytes'] / 1048576)).replace('.', ',')
    return ('<!-- DESCARGA PREGUNTAS: generado por herramientas/descarga_preguntas.py -->\n'
            '<p class="q-descarga"><a class="btn" href="descargas/preguntas-dificiles.pdf" download="preguntas-dificiles-robot-explorador.pdf">%s'
            'Descargar las %d preguntas en PDF</a><small>Con respuestas, repreguntas y respaldo. %d páginas, %s MB.</small></p>\n'
            '<!-- FIN DESCARGA PREGUNTAS -->') % (ICONO_DESCARGA, m['preguntas'], m['paginas'], mb)


def escribir_boton(m, comprobar):
    p = ROOT / 'preguntas.html'
    t = p.read_text(encoding='utf-8')
    nuevo = re.sub(r'<!-- DESCARGA PREGUNTAS:.*?<!-- FIN DESCARGA PREGUNTAS -->', lambda _: boton(m), t, flags=re.S)
    if comprobar:
        return nuevo == t
    p.write_text(nuevo, encoding='utf-8')
    return True


def main():
    comprobar = '--comprobar' in sys.argv
    temas, metodo, fuentes, academico = contenido()
    cuerpo, total = cuerpo_html(temas, metodo, fuentes, academico)
    h = huella(cuerpo)
    if comprobar:
        if not PDF.exists() or not MANIFIESTO.exists():
            raise SystemExit('Falta el PDF de preguntas. Ejecuta: python3 herramientas/descarga_preguntas.py')
        m = json.loads(MANIFIESTO.read_text(encoding='utf-8'))
        if m['huella'] != h or m['preguntas'] != total:
            raise SystemExit('El PDF de preguntas quedó atrás de preguntas.html. Ejecuta: python3 herramientas/descarga_preguntas.py')
        if PDF.stat().st_size != m['bytes']:
            raise SystemExit('El PDF de preguntas no corresponde a su manifiesto. Regenéralo.')
        if not escribir_boton(m, True):
            raise SystemExit('El botón de descarga de preguntas.html no coincide con el PDF. Regenéralo.')
        print('PDF de preguntas al día: %d preguntas, %d páginas' % (m['preguntas'], m['paginas']))
        return
    from playwright.sync_api import sync_playwright
    documento = ('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Preguntas difíciles: Robot explorador</title>'
                 '<style>' + fuentes_css() + ESTILO + '</style></head><body>' + cuerpo + '</body></html>')
    pie = ('<div style="width:100%;font:8px Arial,sans-serif;color:#58655c;padding:0 17mm;display:flex;justify-content:space-between">'
           '<span>Preguntas difíciles · Robot explorador</span><span><span class="pageNumber"></span> de <span class="totalPages"></span></span></div>')
    PDF.parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        ruta = Path(tmp) / 'preguntas.html'
        ruta.write_text(documento, encoding='utf-8')
        with sync_playwright() as pw:
            nav = pw.chromium.launch()
            pag = nav.new_page()
            pag.goto(ruta.as_uri(), wait_until='load')
            pag.evaluate('document.fonts.ready')
            datos = pag.pdf(format='A4', print_background=True, display_header_footer=True, header_template='<span></span>', footer_template=pie,
                            margin={'top': '18mm', 'bottom': '20mm', 'left': '17mm', 'right': '17mm'})
            nav.close()
    PDF.write_bytes(datos)
    paginas = len(re.findall(rb'/Type\s*/Page[^s]', datos))
    m = {'archivo': 'descargas/preguntas-dificiles.pdf', 'preguntas': total, 'temas': len(temas), 'paginas': paginas, 'bytes': len(datos),
         'huella': h, 'version_tesis': academico['version_documento'], 'plantilla': VERSION_PLANTILLA}
    MANIFIESTO.write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    escribir_boton(m, False)
    print('PDF de preguntas: %d preguntas, %d páginas, %d KB' % (total, paginas, len(datos) // 1024))


if __name__ == '__main__':
    main()
