"""Capítulo 05: interacción, lecturas, teclado, móvil, tema oscuro y movimiento reducido.
Uso: python3 herramientas/pruebas_mapeo_navegador.py
Sin argumento inicia su propio servidor local; con argumento usa esa URL base.
Requiere Playwright/Chromium solo para las pruebas, no para el sitio.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler
from servidor_pruebas import ServidorEstable
from functools import partial
from threading import Thread
import os, re, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = None
if len(sys.argv) > 1:
    BASE = sys.argv[1].rstrip('/')
else:
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ServidorEstable(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    BASE = 'http://127.0.0.1:%d' % server.server_port
count = 0
ALTURA_ANTES = 51628  # alto de mapeo.html a 360 x 740 px antes de plegarlo, medido con el mismo recorrido
ALTURA_RETO = 650  # alto del reto de los barridos a 360 px, contenido visible a propósito que se suma al presupuesto


def check(cond, text, detalle=None):
    global count
    count += 1
    assert cond, text + ('' if detalle is None else '  ' + str(detalle))
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
    visuales = ['lidar', 'rejilla', 'marcos-mapeo', 'barridos', 'lazo', 'rviz-colores', 'cobertura', 'plano-mapa', 'candidatos-slam', 'cola-slam', 'reto-mapeo']
    for name, options in configurations:
        ctx = browser.new_context(**options)
        ctx.route(re.compile(r'^https?://(?!localhost|127\.0\.0\.1)'), lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page()
        errors = []
        p.on('pageerror', lambda e: errors.append(str(e)))
        p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        p.goto(BASE + '/mapeo.html')
        for v in visuales:
            p.locator('[data-vis="%s"]' % v).scroll_into_view_if_needed()
            p.wait_for_selector('[data-vis="%s"][data-montado="1"]' % v)
        check(not errors, name + ': los once interactivos del capítulo montan sin errores', errors)
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), name + ': no hay desborde horizontal')
        check(p.locator('[data-vis][data-montado] .vis-fallback').count() == 0, name + ': no quedan fallbacks visibles')
        check(p.locator('.vis svg style').count() == 0, name + ': los SVG en línea no traen estilos que afecten al resto de la página')

        # Reto de los barridos: respuesta inmediata, teclado, región aria-live y sin animación
        reto = '[data-vis=reto-mapeo]'
        check(p.locator(reto + ' input[type=radio]').count() == 5 and p.locator(reto + ' [aria-live=polite]').count() == 3, name + ': el reto usa radios nativos y regiones aria-live')
        p.locator(reto + ' input[name=mp-reto-0]').nth(0).check()
        r0 = p.locator(reto + ' [data-reto-r="0"]')
        check(r0.get_attribute('data-ok') == 'false' and 'Todavía no' in r0.inner_text() and 'solo ocurre en el mínimo' in r0.inner_text(), name + ': una respuesta incorrecta explica por qué')
        check(r0.locator('a[href="#sim-barridos"]').count() == 1, name + ': la respuesta enlaza con la sección que lo explica')
        p.locator(reto + ' input[name=mp-reto-0]').nth(2).check()
        check(r0.get_attribute('data-ok') == 'true' and 'Correcto' in r0.inner_text() and '700 cm²' in r0.inner_text(), name + ': la respuesta correcta da 700 cm² al instante')
        p.locator(reto + ' input[name=mp-reto-1]').nth(1).check()
        check('2 de 2 correctas' in p.locator(reto + ' [data-reto-fin]').inner_text(), name + ': el reto resume 2 de 2')
        p.locator(reto + ' input[name=mp-reto-1]').nth(0).check()
        check('1 de 2' in p.locator(reto + ' [data-reto-fin]').inner_text() and p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'false', name + ': cambiar a la respuesta de las ruedas da 1 de 2')
        check(p.locator('#reto-barridos').evaluate("el => !el.closest('details')"), name + ': el reto está en la parte visible, no en un detalle plegado')
        check(p.evaluate("() => document.querySelector('#reto-barridos').getBoundingClientRect().right <= document.documentElement.clientWidth + 1"), name + ': el reto cabe en el ancho')
        if name == 'escritorio':
            p.locator(reto + ' input[name=mp-reto-1]').nth(0).focus()
            p.keyboard.press('ArrowDown')
            check(p.locator(reto + ' input[name=mp-reto-1]').nth(1).is_checked() and p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'true', name + ': con las flechas del teclado se responde y la respuesta queda escrita')
            check(p.locator(reto + ' input[name=mp-reto-1]').nth(1).evaluate("el => el.matches(':focus-visible')"), name + ': el foco del teclado es visible en el reto')
        if name == 'movimiento reducido':
            check(p.evaluate("() => [...document.querySelectorAll('[data-vis=reto-mapeo] *')].every(e => { const c = getComputedStyle(e); return c.animationName === 'none' && parseFloat(c.transitionDuration) === 0; })"), name + ': el reto no anima')

        # LiDAR: leyenda, teclado, casos y obstáculo que el láser no ve
        check(p.locator('[data-vis=lidar] .mp-legend').count() == 1 and 'punto medido' in text_of(p, 'lidar'), name + ': el LiDAR explica qué es cada punto y trazo')
        check(p.locator('[data-vis=lidar] .mp-lidar-scene .robot-planta').count() == 1 and '1 m' in p.locator('[data-vis=lidar] .mp-lidar-scene').inner_text(), name + ': el dibujo del LiDAR tiene el robot con su planta en U y escala de 1 m')
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

        # Vista 3D del mismo barrido: se dibuja, explica las alturas, cambia de punto de vista y gira
        v3 = p.locator('[data-vis=lidar] .mp-3d-lienzo')
        v3.scroll_into_view_if_needed()
        vista = lambda: p.locator('[data-vis=lidar]').evaluate('el => el.estadoSim().vista3d')
        pintado = v3.evaluate("c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0, t = 0; for (let i = 0; i < d.length; i += 4 * 97) { t++; if (d[i] !== d[0] || d[i + 1] !== d[1] || d[i + 2] !== d[2]) n++; } return n / t; }")
        check(pintado > .25, name + ': la vista 3D dibuja la sala, el robot y el plano del láser', pintado)
        cruza = p.evaluate("['pared', 'pata', 'caja', 'tablero'].map(t => window.MAPEO.cruzaPlano3D(t))")
        check(cruza == [True, True, False, False] and '20 cm' in p.locator('#mp-3d-desc').inner_text(), name + ': en 3D el plano cruza paredes y patas y deja fuera la caja baja y la cubierta, como dice el texto', cruza)
        p.locator('[data-vis=lidar] [data-v3=arriba]').click()
        if name != 'movimiento reducido':
            p.wait_for_timeout(500)
        v = vista()
        check(abs(v['pitch'] - 1.45) < 1e-6 and p.locator('[data-vis=lidar] [data-v3=arriba]').get_attribute('aria-pressed') == 'true', name + ': Desde arriba mira el plano desde arriba' + (' sin animar' if name == 'movimiento reducido' else ''), v)
        v3.focus()
        p.keyboard.press('ArrowRight')
        check(abs(vista()['yaw'] - v['yaw'] - .14) < 1e-6, name + ': las flechas giran la vista 3D')
        if not options.get('has_touch'):
            caja = v3.bounding_box()
            y0 = vista()['yaw']
            p.mouse.move(caja['x'] + caja['width'] / 2, caja['y'] + caja['height'] / 2)
            p.mouse.down()
            p.mouse.move(caja['x'] + caja['width'] / 2 + 100, caja['y'] + caja['height'] / 2 - 40, steps=5)
            p.mouse.up()
            v = vista()
            check(abs(v['yaw'] - y0 - .9) < 1e-6 and v['pitch'] < 1.45, name + ': arrastrar gira e inclina la vista 3D', v)
        check(v3.evaluate('c => c.getBoundingClientRect().width <= c.closest(".vis").getBoundingClientRect().width + 1'), name + ': la vista 3D cabe en su recuadro')

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
            check(fill == 'rgb(230, 233, 222)', name + ': los textos de los dibujos usan el color del tema oscuro', fill)

        check(not errors, name + ': todos los cambios de controles terminaron sin errores')
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), name + ': sigue sin desborde después de interactuar')
        for v in visuales:
            dims = p.locator('[data-vis="%s"] svg' % v).evaluate_all('els => els.map(el => ({w:el.getBoundingClientRect().width, c:el.closest(".vis").getBoundingClientRect().width}))')
            check(all(d['w'] <= d['c'] + 1 for d in dims), name + ': dibujos contenidos en ' + v)
        ctx.close()
    # Resumen por sección con el detalle plegado, a 360 px de ancho
    ctx = browser.new_context(viewport={'width': 360, 'height': 740}, is_mobile=True, has_touch=True)
    ctx.route(re.compile(r'^https?://(?!localhost|127\.0\.0\.1)'), lambda r: r.fulfill(status=200, body=''))
    p = ctx.new_page()

    def altura(pagina):
        pagina.wait_for_timeout(800)
        alto = pagina.evaluate('document.documentElement.scrollHeight')
        for y in range(0, alto, 600):
            pagina.evaluate('window.scrollTo(0,%d)' % y)
            pagina.wait_for_timeout(100)
        pagina.evaluate('window.scrollTo(0,0)')
        pagina.wait_for_timeout(400)
        return pagina.evaluate('document.documentElement.scrollHeight')

    p.goto(BASE + '/mapeo.html')
    check(p.locator('main p.resumen').count() >= 20, '360 px: cada sección larga tiene un resumen corto')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => !d.open)"), '360 px: el detalle de cada resumen parte plegado')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => d.querySelector(':scope > summary').textContent.trim().startsWith('Ver el detalle:'))"), '360 px: cada detalle dice qué esconde')
    check(p.evaluate("[...document.querySelectorAll('main [data-vis]')].every(v => !v.closest('details'))"), '360 px: ningún interactivo quedó dentro de un detalle plegado')
    cerrada = altura(p)
    primero = p.evaluate("document.querySelector('main [data-vis]').getBoundingClientRect().top + scrollY")
    check(primero < 4 * 740, '360 px: el primer interactivo empieza dentro de las 4 primeras pantallas (%.1f pantallas)' % (primero / 740))
    p.evaluate("document.querySelectorAll('main details.detalle').forEach(d => d.open = true)")
    p.wait_for_timeout(300)
    abierta = p.evaluate('document.documentElement.scrollHeight')
    print('  altura a 360 px: plegada %d px (%.1f pantallas), con todo abierto %d px, antes %d px' % (cerrada, cerrada / 740, abierta, ALTURA_ANTES))
    check(cerrada < abierta, '360 px: plegada la página es más corta que con todo abierto')
    check(cerrada <= ALTURA_ANTES * 0.6 + ALTURA_RETO, '360 px: la página mide como mucho el 60 %% de antes más el reto (%d px contra %d px, %.1f %%)' % (cerrada, ALTURA_ANTES, 100.0 * cerrada / ALTURA_ANTES))
    # un ancla hacia el contenido plegado lo abre y lo muestra
    for destino in ('trejos', 'd-ceres', 'sim-rviz'):
        p.goto(BASE + '/mapeo.html#' + destino)
        p.wait_for_timeout(700)
        r = p.evaluate("""(id) => { const el = document.getElementById(id), rc = el.getBoundingClientRect(), d = el.closest('details.detalle');
          return { abierto: !d || !!d.open, arriba: rc.top, alto: innerHeight }; }""", destino)
        check(r['abierto'] and r['arriba'] < r['alto'], '360 px: el ancla #%s abre el detalle plegado y lo deja a la vista' % destino)
    # otro cambio de ancla y un enlace de la página también lo abren
    p.goto(BASE + '/mapeo.html')
    p.wait_for_timeout(300)
    p.evaluate("location.hash = 'd-roscon'")
    p.wait_for_timeout(500)
    check(p.evaluate("document.getElementById('d-roscon').open"), '360 px: cambiar el ancla abre el detalle')
    p.goto(BASE + '/mapeo.html')
    p.wait_for_timeout(300)
    p.evaluate("""() => { const a = document.createElement('a'); a.href = '#d-capacidades'; a.id = 'prueba-enlace'; a.textContent = 'x'; document.querySelector('main').prepend(a); }""")
    p.evaluate("document.getElementById('prueba-enlace').click()")
    p.wait_for_timeout(500)
    check(p.evaluate("document.getElementById('d-capacidades').open"), '360 px: un enlace de la página abre el detalle')
    # un resultado del buscador cuyo texto está plegado abre el detalle de su sección
    p.goto(BASE + '/mapeo.html')
    p.wait_for_timeout(300)
    check(not p.evaluate("document.getElementById('d-capacidades').open"), '360 px: sin búsqueda el detalle sigue plegado')
    p.evaluate("document.querySelector('.search-trigger').click()")
    p.wait_for_selector('dialog.search-dialog[open]')
    p.fill('dialog.search-dialog input', 'lifelong mapping retira nodos antiguos o redundantes')
    p.wait_for_timeout(600)
    p.locator('.search-results a[href$="mapeo.html#mapeo-localizacion"]').first.click()
    p.wait_for_timeout(900)
    r = p.evaluate("() => ({ hash: location.hash, abierto: document.getElementById('d-capacidades').open })")
    check(r['abierto'], '360 px: un resultado del buscador abre el texto plegado de su sección (%s)' % r['hash'])
    ctx.close()
    # sin JavaScript el detalle se abre a mano y los interactivos siguen con su imagen
    sin = browser.new_context(viewport={'width': 360, 'height': 740}, java_script_enabled=False)
    q = sin.new_page()
    q.goto(BASE + '/mapeo.html')
    q.locator('#d-roscon > summary').click()
    check(q.locator('#d-roscon').get_attribute('open') is not None, 'sin JavaScript: el detalle se abre a mano')
    check(q.locator('[data-vis=lidar] img').first.is_visible(), 'sin JavaScript: la imagen del primer interactivo sigue visible')
    check(q.locator('[data-vis=reto-mapeo] .vis-fallback').is_visible() and not q.locator('[data-vis=reto-mapeo] details p').is_visible(), 'sin JavaScript: el reto muestra la pregunta y esconde la respuesta')
    q.locator('[data-vis=reto-mapeo] details > summary').click()
    check('700 cm²' in q.locator('[data-vis=reto-mapeo] details p').inner_text() and q.locator('[data-vis=reto-mapeo] details p').is_visible(), 'sin JavaScript: la respuesta del reto se abre en un details')
    sin.close()
    # las cifras y referencias de la tesis siguen en la página, y los resúmenes no inventan ninguna
    cmp_ = subprocess.run([sys.executable, str(ROOT / 'herramientas' / 'comparar_resumen.py'), 'mapeo'], capture_output=True, text=True, encoding='utf-8', env=dict(os.environ, PYTHONUTF8='1'))
    lineas = cmp_.stdout.strip().splitlines()
    print('  ' + lineas[0])
    check(cmp_.returncode == 0, 'ninguna cifra ni referencia a la tesis desapareció y los resúmenes no inventan cifras: ' + lineas[-1])
    browser.close()
if server:
    server.shutdown()
print('\n%d comprobaciones del capítulo 05 correctas' % count)
