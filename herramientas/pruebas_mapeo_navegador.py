"""Capítulo 05: interacción, lecturas, teclado, móvil, tema oscuro y movimiento reducido.
Uso: python3 herramientas/pruebas_mapeo_navegador.py
Sin argumento inicia su propio servidor local; con argumento usa esa URL base.
Requiere Playwright/Chromium solo para las pruebas, no para el sitio.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import re, sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = None
if len(sys.argv) > 1:
    BASE = sys.argv[1].rstrip('/')
else:
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    BASE = 'http://localhost:%d' % server.server_port
count = 0


def check(cond, text):
    global count
    count += 1
    assert cond, text
    print('  ok   ' + text)


def set_range(page, selector, value):
    page.locator(selector).evaluate('(el, v) => { el.value=v; el.dispatchEvent(new Event("input", {bubbles:true})); }', str(value))


def text_of(page, visual):
    return page.locator('[data-vis="%s"]' % visual).inner_text()


def lectura(page, visual, i):
    return page.locator('[data-vis="%s"] [data-read="%d"]' % (visual, i)).inner_text()


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    configurations = [
        ('escritorio', {'viewport': {'width': 1366, 'height': 900}}),
        ('móvil', {'viewport': {'width': 390, 'height': 844}, 'is_mobile': True, 'has_touch': True}),
        ('móvil pequeño', {'viewport': {'width': 320, 'height': 740}, 'is_mobile': True, 'has_touch': True}),
        ('movimiento reducido', {'viewport': {'width': 1280, 'height': 900}, 'reduced_motion': 'reduce'}),
        ('oscuro', {'viewport': {'width': 1366, 'height': 900}, 'color_scheme': 'dark'})
    ]
    visuales = ['lidar', 'rejilla', 'marcos-mapeo', 'barridos', 'lazo', 'rviz-colores', 'cobertura', 'plano-mapa', 'candidatos-slam', 'cola-slam']
    for name, options in configurations:
        ctx = browser.new_context(**options)
        ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page()
        errors = []
        p.on('pageerror', lambda e: errors.append(str(e)))
        p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        p.goto(BASE + '/mapeo.html')
        for v in visuales:
            p.locator('[data-vis="%s"]' % v).scroll_into_view_if_needed()
            p.wait_for_selector('[data-vis="%s"][data-montado="1"]' % v)
        check(not errors, name + ': los diez interactivos del capítulo montan sin errores')
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': no hay desborde horizontal')
        check(p.locator('[data-vis][data-montado] .vis-fallback').count() == 0, name + ': no quedan fallbacks visibles')
        check(p.locator('.vis svg style').count() == 0, name + ': los SVG en línea no traen estilos que afecten al resto de la página')

        # LiDAR: leyenda, teclado, casos y obstáculo que el láser no ve
        check(p.locator('[data-vis=lidar] .mp-legend').count() == 1 and 'punto medido' in text_of(p, 'lidar'), name + ': el LiDAR explica qué es cada punto y trazo')
        check(p.locator('[data-vis=lidar] .mp-robot').count() == 1 and '1 m' in p.locator('[data-vis=lidar] .mp-lidar-scene').inner_text(), name + ': el dibujo del LiDAR tiene robot y escala de 1 m')
        p.locator('[data-vis=lidar] .mp-lidar-scene').focus()
        p.keyboard.press('ArrowRight')
        check(p.locator('[data-out="mp-lidar-x"]').inner_text() == '1,08 m', name + ': las flechas mueven el robot 8 cm')
        p.locator('[data-vis=lidar] [data-reset]').click()
        p.locator('[data-vis=lidar] [data-caso=vidrio]').click()
        check(int(lectura(p, 'lidar', 1)) > 0, name + ': el vidrio produce sectores sin retorno')
        p.locator('[data-vis=lidar] [data-caso=altura]').click()
        set_range(p, '#mp-lidar-y', .45)
        set_range(p, '#mp-lidar-x', 2.4)
        estado = p.locator('[data-vis=lidar]').evaluate('el => el.estadoSim()')
        check(estado['robot']['x'] < 1.6 and 'detenido por un obstáculo' in text_of(p, 'lidar'), name + ': la caja baja detiene al robot aunque el láser no la vea')

        # Rejilla: lecturas de área e índice y navegación por teclado
        p.locator('[data-vis=rejilla] [data-fase="3"]').click()
        check(lectura(p, 'rejilla', 4) == '96,4 %' and lectura(p, 'rejilla', 3) == '0,265 m²', name + ': la rejilla calcula índice y área libre del ejemplo')
        p.locator('[data-vis=rejilla] [data-fase="1"]').click()
        check(lectura(p, 'rejilla', 4) == '5,0 %' and '8 / 159' in text_of(p, 'rejilla'), name + ': con un rayo el índice usa libres sobre libres más desconocidas')
        p.locator('[data-vis=rejilla] [data-cell="90"]').focus()
        p.keyboard.press('ArrowRight')
        check('Columna 11, fila 5' in text_of(p, 'rejilla'), name + ': las flechas recorren las celdas')

        # TF: la flecha de las ruedas conserva su largo; se mueve el origen de odom
        check('0,00 m + 2,08 m = 2,08 m' in text_of(p, 'marcos-mapeo'), name + ': sin corrección la pose en map hereda el error')
        p.locator('#mp-tf-activo').check()
        texto = text_of(p, 'marcos-mapeo')
        check('-0,08 m + 2,08 m = 2,00 m' in texto and '0,08 m hacia atrás' in texto and 'odom → base_link: 2,08 m' in texto, name + ': map → odom desplaza el origen de odom y conserva la odometría')
        set_range(p, '#mp-tf-sesgo', -10)
        check('0,20 m + 1,80 m = 2,00 m' in text_of(p, 'marcos-mapeo') and 'hacia adelante' in text_of(p, 'marcos-mapeo'), name + ': un error negativo se corrige hacia adelante')

        # Barridos: curva de desacuerdo y ajuste
        check(lectura(p, 'barridos', 3) == '700 cm²' and lectura(p, 'barridos', 0) == '40 cm', name + ': la estimación de las ruedas deja 700 cm² de desacuerdo')
        p.locator('[data-vis=barridos] [data-fit]').click()
        check(lectura(p, 'barridos', 3) == '0 cm²' and 'desacuerdo total es cero' in text_of(p, 'barridos'), name + ': el ajuste lleva el desacuerdo a cero en 30 cm')
        check(p.locator('[data-vis=barridos] [data-costo] svg').count() == 1, name + ': se dibuja la curva del desacuerdo')
        p.locator('[data-vis=barridos] [data-guess]').click()
        check(lectura(p, 'barridos', 1) == '40 cm', name + ': se puede volver a la estimación de las ruedas')

        # Grafo: el cierre sube el desacuerdo y optimizar lo baja
        check(lectura(p, 'lazo', 3) == '0', name + ': sin cierre las aristas no se contradicen')
        p.locator('[data-vis=lazo] [data-paso="1"]').click()
        check(lectura(p, 'lazo', 3) == '29,3', name + ': el cierre de lazo hace subir el desacuerdo')
        p.locator('[data-vis=lazo] [data-paso="2"]').click()
        check(lectura(p, 'lazo', 3) == '0,18' and lectura(p, 'lazo', 2) == '19,1 cm', name + ': optimizar baja el desacuerdo y deja intacta la odometría')
        p.locator('[data-vis=lazo] [data-paso="3"]').click()
        check('map → odom: x =' in text_of(p, 'lazo'), name + ': el paso 4 informa la transformación publicada')
        set_range(p, '#mp-pose', 0)
        check('Pose 0: x = 0,00 m' in text_of(p, 'lazo'), name + ': el origen queda fijo')

        # Peso del cierre: modifica el cálculo y se restablece junto con el resto
        p.locator('[data-vis=lazo] details').last.locator('summary').click()
        set_range(p, '#mp-grafo-peso', .2)
        weak = p.locator('[data-vis=lazo]').evaluate('el => Math.hypot(el.estadoSim().poses[12][0], el.estadoSim().poses[12][1])')
        set_range(p, '#mp-grafo-peso', 5)
        strong = p.locator('[data-vis=lazo]').evaluate('el => Math.hypot(el.estadoSim().poses[12][0], el.estadoSim().poses[12][1])')
        check(strong < weak and '2500, 2500, 1250' in text_of(p, 'lazo'), name + ': el peso del cierre cambia las poses y explica su escala')
        p.locator('[data-vis=lazo]').get_by_text('Experimentar con la deriva del ejemplo', exact=True).click()
        p.locator('[data-vis=lazo] [data-restablecer-grafo]').click()
        check(p.locator('#mp-grafo-peso').input_value() == '1' and lectura(p, 'lazo', 3) == '0', name + ': reiniciar recupera peso, fase y datos de ejemplo')

        # Candidato cercano, geometría incompatible, cadena reciente y reinicio
        candidates = p.locator('[data-vis=candidatos-slam]')
        candidates.locator('[data-etapa="2"]').click()
        check('Se acepta el cierre' in candidates.inner_text(), name + ': el candidato compatible se acepta')
        candidates.locator('[data-candidato="5"]').click()
        candidates.locator('[data-etapa="1"]').click()
        check(candidates.locator('[data-geometria]').is_visible() and '19,0 cm' in candidates.inner_text(), name + ': el pasillo parecido expone el desajuste geométrico')
        candidates.locator('[data-etapa="2"]').click()
        check('Se rechaza el cierre' in candidates.inner_text(), name + ': la proximidad sola no acepta el cierre')
        candidates.locator('[data-candidato="11"]').click()
        candidates.locator('[data-etapa="2"]').click()
        check('cadena reciente' in candidates.inner_text() and not candidates.locator('[data-geometria]').is_visible(), name + ': no se comprueba geometría de la cadena reciente')
        candidates.locator('[data-candidato="3"]').click()
        check('Fuera del radio' in candidates.inner_text(), name + ': el candidato lejano queda fuera')
        candidates.locator('[data-reset-candidatos]').click()
        candidates.locator('[data-etapa="1"]').focus()
        p.keyboard.press('Enter')
        check(candidates.locator('[data-geometria]').is_visible() and candidates.locator('[data-candidato="0"]').get_attribute('aria-pressed') == 'true', name + ': el reinicio y el teclado funcionan')

        # Misma llegada de barridos; espera frente a omisión
        queue = p.locator('[data-vis=cola-slam]')
        set_range(p, '#sp-tiempo', 500)
        state = queue.evaluate('el => el.estadoSim()')
        check(len(state['sincrono']['esperando']) == 2 and len(state['asincrono']['omitidos']) == 3, name + ': la cola muestra los conteos del respaldo')
        set_range(p, '#sp-calculo', 100)
        check(queue.locator('[data-estado="en cola"], [data-estado="omitido"]').count() == 0, name + ': el cálculo rápido elimina espera y omisiones')
        set_range(p, '#sp-tiempo', 1200)
        check(queue.locator('[data-avanzar-cola]').is_disabled(), name + ': el último paso no sobrepasa el tiempo máximo')
        queue.locator('[data-reset-cola]').click()
        queue.locator('[data-avanzar-cola]').focus()
        p.keyboard.press('Enter')
        check(queue.evaluate('el => el.estadoSim().ahora') == 100 and p.locator('#sp-calculo').input_value() == '150', name + ': la cola se reinicia y avanza con teclado')

        # RViz y cobertura
        p.locator('[data-vis=rviz-colores] [data-color=inscrito]').click()
        check('costo inscrito' in text_of(p, 'rviz-colores'), name + ': cada color de RViz tiene explicación')
        check('54,5 %' in text_of(p, 'cobertura') and '82,8 %' in text_of(p, 'cobertura'), name + ': el ejemplo de cobertura conserva la celda ocupada en ambas imágenes')
        set_range(p, '#cob-margen', 6)
        check('40,7 %' in text_of(p, 'cobertura') and '0,06 m²' in text_of(p, 'cobertura'), name + ': agrandar la imagen baja el índice y no cambia el área')
        set_range(p, '#cob-margen', 0)
        check(p.locator('[data-vis=cobertura] [data-o="indice"]').inner_text() == '82,8 %', name + ': sin margen ambas imágenes coinciden')

        if name == 'oscuro':
            fill = p.locator('[data-vis=lidar] .mp-svg text').first.evaluate('el => getComputedStyle(el).fill')
            check(fill != 'rgb(30, 38, 50)', name + ': los textos de los dibujos usan el color del tema oscuro')

        check(not errors, name + ': todos los cambios de controles terminaron sin errores')
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': sigue sin desborde después de interactuar')
        for v in visuales:
            dims = p.locator('[data-vis="%s"] svg' % v).evaluate_all('els => els.map(el => ({w:el.getBoundingClientRect().width, c:el.closest(".vis").getBoundingClientRect().width}))')
            check(all(d['w'] <= d['c'] + 1 for d in dims), name + ': dibujos contenidos en ' + v)
        ctx.close()
    browser.close()
if server:
    server.shutdown()
print('\n%d comprobaciones del capítulo 05 correctas' % count)
