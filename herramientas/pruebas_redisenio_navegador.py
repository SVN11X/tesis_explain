"""Regresiones de la nueva experiencia, sobre los archivos compilados de GitHub Pages.

Ejecutar en CI o local con Playwright instalado:
    python herramientas/pruebas_redisenio_navegador.py
La suite clásica sigue cubriendo los capítulos que todavía no han migrado.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def translate_path(self, path):
        if path.startswith('/tesis_explain/'):
            path = path[len('/tesis_explain'):]
        return super().translate_path(path)


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
BASE = 'http://localhost:%d/tesis_explain/' % server.server_port
count = 0


def check(condition, name):
    global count
    assert condition, name
    count += 1
    print('  ok   ' + name, flush=True)


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    # Probar ambas rutas a tamaño de teléfono, tableta y escritorio.
    for width in (320, 390, 768, 1366):
        ctx = browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce')
        for page in ('index.html', 'laboratorios.html'):
            p = ctx.new_page()
            errors, failed, pedidos = [], [], []
            p.on('request', lambda r: pedidos.append(r.url))
            p.on('pageerror', lambda e: errors.append(str(e)))
            p.on('response', lambda r: failed.append(r.url) if r.status >= 400 and r.url.startswith(BASE) else None)
            p.goto(BASE + page)
            p.locator('.lab-frame').scroll_into_view_if_needed()
            p.wait_for_function("document.querySelector('.world-canvas [data-renderer]') || document.querySelector('.scene-loading button')")
            check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'{page} a {width}px sin desborde')
            check(not errors and not failed, f'{page} a {width}px sin excepciones ni recursos rotos')
            if width < 641:
                p.get_by_role('button', name='Mapa 2D', exact=True).click()
                check(p.locator('.map-wrap').is_visible() and not p.locator('.world-canvas').is_visible(), 'las pestañas móviles cambian la vista')
            check(p.locator('.aviso-academico').count() == 1, 'el estado académico sigue disponible')
            if page == 'laboratorios.html' and width == 1366:
                check(not any('robot-cad' in u or u.endswith('/robot.glb') for u in pedidos),
                      'el laboratorio no descarga el modelo del CAD ni su cargador')
            p.close()
        ctx.close()

    ctx = browser.new_context(viewport={'width': 1366, 'height': 900}, reduced_motion='reduce')
    p = ctx.new_page()
    pedidos = []
    p.on('request', lambda r: pedidos.append(r.url))
    p.goto(BASE)
    expect(p.get_by_role('button', name='Despiece', exact=False)).to_be_enabled()
    if p.locator('.robot-stage canvas[data-renderer=webgl]').count():
        check('hecho a partir de su CAD' in (p.locator('.robot-stage').get_attribute('aria-label') or '')
              and any(u.endswith('/modelos/robot.glb') for u in pedidos), 'con WebGL la portada muestra el modelo del CAD')
    else:
        print('  aviso  este navegador no tiene WebGL: no se comprueba el modelo del CAD', flush=True)
    # Acercamiento: botones, teclado, Ctrl con la rueda y foco en la pieza elegida. La etiqueta ZOOM dice cuántas veces
    # está más cerca la cámara que en la vista completa.
    zoom = lambda: float(p.locator('.viewer-zoom').inner_text().split('×')[1].replace(',', '.'))
    expect(p.locator('.viewer-zoom')).to_have_text('ZOOM ×1,0')
    p.get_by_role('button', name='Acercar', exact=True).click()
    check(zoom() > 1.3, 'el botón Acercar acerca la cámara')
    p.get_by_role('button', name='Ver todo el robot').click()
    check(zoom() == 1.0, 'Ver todo el robot vuelve a la vista completa')
    for _ in range(12):
        if p.get_by_role('button', name='Acercar', exact=True).is_disabled():
            break
        p.get_by_role('button', name='Acercar', exact=True).click()
    check(p.get_by_role('button', name='Acercar', exact=True).is_disabled() and zoom() > 3, 'el acercamiento tiene un límite y el botón lo indica')
    p.get_by_role('button', name='Ver todo el robot').click()
    escenario = p.locator('.robot-stage')
    escenario.focus()
    p.keyboard.press('+')
    cerca = zoom()
    p.keyboard.press('ArrowLeft')
    p.keyboard.press('0')
    check(cerca > 1.1 and zoom() == 1.0, 'con el foco en el modelo, más acerca y cero vuelve a la vista completa')
    caja = escenario.bounding_box()
    p.mouse.move(caja['x'] + caja['width'] / 2, caja['y'] + caja['height'] / 2)
    antes = p.evaluate('scrollY')
    p.mouse.wheel(0, 300)
    aviso = p.locator('.wheel-hint').count() == 1
    # el desplazamiento puede tardar mientras el visor termina de girar por la inercia
    p.wait_for_function('scrollY > %d' % antes, timeout=8000)
    check(aviso and p.evaluate('scrollY') > antes and zoom() == 1.0, 'la rueda sola desplaza la página y avisa que el acercamiento va con Ctrl')
    p.evaluate('scrollTo(0, 0)')
    caja = escenario.bounding_box()
    p.mouse.move(caja['x'] + caja['width'] / 2, caja['y'] + caja['height'] / 2)
    p.keyboard.down('Control')
    p.mouse.wheel(0, -200)
    p.keyboard.up('Control')
    p.wait_for_timeout(250)
    check(zoom() > 1.0, 'Ctrl con la rueda acerca el modelo')
    p.get_by_role('button', name='Ver todo el robot').click()
    p.get_by_role('button', name='03 Electrónica').click()
    check(zoom() > 1.2 and escenario.get_attribute('data-carcasa') == ('transparente' if p.locator('.robot-stage canvas[data-renderer=webgl]').count() else 'opaca'),
          'elegir la electrónica acerca la cámara y, con el CAD, vuelve transparente la carcasa')
    p.get_by_role('button', name='01 LiDAR').click()
    check(escenario.get_attribute('data-carcasa') == 'opaca', 'con el LiDAR la carcasa vuelve a ser opaca')
    p.get_by_role('button', name='Ver todo el robot').click()
    p.get_by_role('button', name='Despiece', exact=False).click()
    expect(p.get_by_role('button', name='Ensamblar', exact=False)).to_have_attribute('aria-pressed', 'true')
    p.get_by_role('button', name='03 Electrónica').click()
    check('Raspberry Pi' in p.locator('.part-caption').inner_text(), 'el despiece permite seleccionar componentes')
    p.get_by_label('Punto de vista del robot').select_option('arriba')
    check(p.get_by_label('Punto de vista del robot').input_value() == 'arriba', 'la cámara tiene alternativa al gesto de arrastrar')
    expect(p.get_by_role('button', name='Animar el sensor')).to_have_attribute('aria-pressed', 'false')
    p.get_by_role('button', name='Buscar en la guía').click()
    p.get_by_placeholder('LiDAR, odometría, control…').fill('odometria')
    expect(p.locator('.search-results a').first).to_be_visible()
    p.keyboard.press('Escape')
    check(not p.locator('.search-dialog').is_visible(), 'buscar sin tilde devuelve enlaces y Escape cierra')
    p.get_by_role('link', name='Laboratorios', exact=True).click()
    p.get_by_label('Escenario del laboratorio').select_option('bajo')
    check('sin retorno' in p.locator('.range-field').nth(2).inner_text(), 'la caja baja no aparece con el láser a 24 cm')
    slider = p.get_by_label('Altura del láser en metros')
    slider.focus(); p.keyboard.press('Home')
    for _ in range(4):
        p.keyboard.press('ArrowRight')
    check('10 cm' in p.locator('.range-field').first.inner_text() and '0,80 m' in p.locator('.range-field').nth(2).inner_text(), 'a 10 cm la caja aparece a 0,80 m')
    p.get_by_role('button', name='Avanzar un barrido').click()
    p.get_by_label('Historial de barridos').focus(); p.keyboard.press('Home')
    check('BARRIDO 1' in p.locator('.lab-timeline').inner_text(), 'el historial restaura el barrido inicial')
    p.get_by_role('button', name='Copiar escena ↗').click()
    link = p.get_by_label('Enlace para compartir el escenario').input_value()
    check('/tesis_explain/laboratorios.html?' in link and 'altura=0.100' in link, 'el enlace respeta el prefijo de GitHub Pages')
    p.goto(link)
    expect(p.locator('.height-tag')).to_contain_text('LÁSER: 10 CM')
    check(p.get_by_label('Escenario del laboratorio').input_value() == 'bajo', 'el enlace reconstruye el experimento')
    with p.expect_download() as event:
        p.get_by_role('button', name='Exportar JSON ↓').click()
    import json
    export = json.loads(Path(event.value.path()).read_text())
    check(len(export['measurements']) == 230 and len(export['grid']['values']) == 3500, 'la exportación contiene medidas y mapa completo')
    p.get_by_role('button', name='Reiniciar experimento').click()
    check(p.get_by_label('Altura del láser en metros').input_value() == '0.24', 'reiniciar recupera los parámetros iniciales')
    ctx.close()

    # Respaldo sin GPU: misma geometría, giro, despiece y controles de laboratorio.
    ctx = browser.new_context(reduced_motion='reduce')
    ctx.add_init_script("const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args)}")
    pedidos = []
    p = ctx.new_page(); p.on('request', lambda r: pedidos.append(r.url)); p.goto(BASE)
    expect(p.locator('.robot-stage svg[data-renderer=svg]')).to_be_visible()
    check(p.locator('.robot-stage').get_attribute('aria-label') == 'Modelo 3D ilustrativo del robot'
          and not any(u.endswith('/robot.glb') for u in pedidos), 'sin GPU se usa el robot ilustrativo y no se descarga el modelo del CAD')
    p.get_by_role('button', name='Despiece', exact=False).click()
    check(p.get_by_role('button', name='Ensamblar', exact=False).is_enabled(), 'sin GPU se conserva el despiece 3D')
    ctx.close()

    ctx = browser.new_context(java_script_enabled=False, viewport={'width':390,'height':844})
    p = ctx.new_page(); p.goto(BASE)
    check(p.locator('.robot-poster').is_visible() and p.locator('.chapter-row').count() == 16, 'sin JavaScript hay fotografía y las 16 partes de la guía')
    check(p.locator('mark').count() >= 20 and not p.locator('html.resaltado-animado').count(), 'sin JavaScript los resaltados ya están puestos')
    check(p.locator('.no-script').is_visible(), 'el laboratorio explica cómo continuar sin JavaScript')
    ctx.close()

    # Resaltado de marcador: se dibuja cuando el texto llega a la pantalla, y con movimiento reducido ya está puesto
    tam = "(s) => getComputedStyle(document.querySelectorAll(s)[document.querySelectorAll(s).length - 1]).backgroundSize"
    for pagina, selector in (('index.html', 'main mark'), ('movimiento.html', '.articulo mark')):
        ctx = browser.new_context(viewport={'width': 1366, 'height': 900})
        p = ctx.new_page()
        p.goto(BASE + pagina)
        p.wait_for_timeout(300)
        antes = p.evaluate(tam, selector)
        p.locator(selector).last.scroll_into_view_if_needed()
        p.wait_for_timeout(2600)
        check(p.locator('html.resaltado-animado').count() == 1 and antes.startswith('0%') and p.evaluate(tam, selector).startswith('100%'),
              '%s: el resaltado se dibuja al llegar a la pantalla' % pagina)
        ctx.close()
        ctx = browser.new_context(viewport={'width': 1366, 'height': 900}, reduced_motion='reduce')
        p = ctx.new_page()
        p.goto(BASE + pagina)
        check(not p.locator('html.resaltado-animado').count() and p.evaluate(tam, selector).startswith('100%'), '%s: con movimiento reducido el resaltado ya está puesto' % pagina)
        ctx.close()
    browser.close()
server.shutdown()
print('%d comprobaciones de la nueva experiencia correctas' % count)
