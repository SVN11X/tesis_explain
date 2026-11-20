"""Capítulo 3 y búsqueda A estrella del capítulo 6 en un navegador real.
Revisa montaje, cálculos visibles, controles, teclado, teléfono, tema oscuro y movimiento reducido.
Uso: python3 herramientas/pruebas_movimiento_navegador.py
Sin argumento inicia su propio servidor local; con argumento usa esa URL base.
Requiere Playwright con Chromium solo para las pruebas, no para el sitio.
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
ALTURA_RETO = 650  # alto del reto de la calibración a 360 px, contenido visible a propósito que se suma al presupuesto
ALTURA_ANTES = 25831  # alto de movimiento.html a 360 x 740 px antes de plegarlo, medido con el mismo recorrido
count = 0


def check(cond, text, detail=''):
    global count
    count += 1
    assert cond, text + ('  ' + str(detail) if detail else '')
    print('  ok   ' + text)


def set_range(page, selector, value):
    page.locator(selector).evaluate('(el, v) => { el.value=v; el.dispatchEvent(new Event("input", {bubbles:true})); }', str(value))


def text_of(page, visual):
    return page.locator('[data-vis="%s"]' % visual).inner_text()


def estado(page, visual, fn):
    return page.evaluate('([v, f]) => document.querySelector(`[data-vis="${v}"]`)[f]()', [visual, fn])


def contenidos(page, visuales):
    for v in visuales:
        dims = page.locator('[data-vis="%s"] svg, [data-vis="%s"] canvas' % (v, v)).evaluate_all(
            'els => els.map(el => ({w: el.getBoundingClientRect().width, c: el.closest(".vis").getBoundingClientRect().width}))')
        if not all(d['w'] <= d['c'] + 1 for d in dims):
            return v
    return None


VIS_MOV = ['cinematica', 'encoder', 'odometria', 'calibracion', 'giro', 'iteracion2', 'cuadrado', 'reto-movimiento']

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    configurations = [
        ('escritorio', {'viewport': {'width': 1366, 'height': 900}}),
        ('móvil', {'viewport': {'width': 390, 'height': 844}, 'is_mobile': True, 'has_touch': True}),
        ('móvil pequeño', {'viewport': {'width': 320, 'height': 740}, 'is_mobile': True, 'has_touch': True}),
        ('movimiento reducido', {'viewport': {'width': 1280, 'height': 900}, 'reduced_motion': 'reduce'}),
        ('oscuro', {'viewport': {'width': 1366, 'height': 900}, 'color_scheme': 'dark'})
    ]
    for name, options in configurations:
        reducido = options.get('reduced_motion') == 'reduce'
        ctx = browser.new_context(**options)
        ctx.route(re.compile(r'^https?://(?!localhost|127\.0\.0\.1)'), lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page()
        errors = []
        p.on('pageerror', lambda e: errors.append(str(e)))
        p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        # ── Capítulo 3 ──
        p.goto(BASE + '/movimiento.html')
        for v in VIS_MOV:
            p.locator('[data-vis="%s"]' % v).scroll_into_view_if_needed()
            p.wait_for_selector('[data-vis="%s"][data-montado="1"]' % v)
        check(not errors, name + ': los interactivos del capítulo 3 montan sin errores', errors[:3])
        check(p.locator('[data-vis][data-montado] .vis-fallback').count() == 0, name + ': no quedan textos de respaldo visibles')
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), name + ': no hay desborde horizontal')

        # cinemática
        t = text_of(p, 'cinematica')
        check('0,72 m' in t and 'centro a la izquierda' in t and '0,63 y 0,81 m' in t, name + ': la curva suave muestra radio, lado del centro y círculo de cada rueda')
        check('(0,130 + 0,100) / 2 = 0,115 m/s' in t, name + ': la fórmula de v se muestra con los valores de los deslizadores')
        e = estado(p, 'cinematica', 'estadoSim')
        check(abs(e['centro']['x']) < 1e-9 and abs(e['centro']['y']) < 1e-9, name + ': si el círculo cabe, el centro de giro queda al centro del dibujo', e['centro'])
        check(e['activo'] == (not reducido), name + ': la animación ' + ('espera con movimiento reducido' if reducido else 'arranca sola'))
        boton = p.locator('[data-vis=cinematica] [data-a=mover]')
        check(boton.inner_text() == ('Mover' if reducido else 'Pausar'), name + ': el botón dice qué hará')
        boton.click()
        check(estado(p, 'cinematica', 'estadoSim')['activo'] == reducido and boton.get_attribute('aria-pressed') == str(reducido).lower(), name + ': el botón alterna y refleja el estado')
        p.locator('[data-vis=cinematica] [data-p="2"]').click()
        t = text_of(p, 'cinematica')
        check('gira en su lugar' in t and '0,35 rad/s' in t, name + ': ruedas opuestas giran en su lugar a 0,35 rad/s')
        set_range(p, '#ci-l', 0.13)
        set_range(p, '#ci-r', 0.13)
        e = estado(p, 'cinematica', 'estadoSim')
        check('recta' in text_of(p, 'cinematica') and e['centro'] is None, name + ': ruedas iguales van rectas y no hay centro de giro a la vista')
        p.locator('[data-vis=cinematica] [data-p="3"]').click()
        check('recortaría' in text_of(p, 'cinematica'), name + ': la curva cerrada advierte el límite de giro del robot real')

        # encoder
        enc = '[data-vis=encoder]'
        if estado(p, 'encoder', 'estadoSim')['activo']:
            p.locator(enc + ' [data-a=anim]').click()
        p.locator(enc + ' [data-a=cero]').click()
        for _ in range(4):
            p.locator(enc + ' [data-a=paso]').click()
        e = estado(p, 'encoder', 'estadoSim')
        check(e['cuenta'] == 4 and e['cuenta1'] == 1, name + ': cuatro flancos suman 4 con decodificación por cuatro y 1 con una', e)
        p.locator(enc + ' [data-s="-1"]').click()
        p.locator(enc + ' [data-a=paso]').focus()
        for _ in range(4):
            p.keyboard.press('Enter')
        e = estado(p, 'encoder', 'estadoSim')
        check(e['cuenta'] == 0 and e['cuenta1'] == 0 and 'atrás' in text_of(p, 'encoder'), name + ': hacia atrás, con teclado, las dos cuentas vuelven a cero', e)

        # calibración con los datos de la tesis
        t = text_of(p, 'calibracion')
        check('3,63 % → 0,00 %' in t and '0,44 % → 0,43 %' in t and '÷ 1,0363' in t, name + ': el ensayo real muestra sesgo, dispersión y factor')
        check('4,01 → 0,37' in t and '2,88 → −0,72' in t and 'Tabla A6.2' in t, name + ': cada prueba muestra su error antes y después')
        check('6,7 cm → 0,0 cm' in t, name + ': el sesgo también se expresa en centímetros de la recta')
        p.locator('[data-vis=calibracion] [data-modo=sim]').click()
        check('no son mediciones' in text_of(p, 'calibracion') and p.locator('[data-vis=calibracion] [data-k=sesgo]').is_visible(), name + ': la simulación se rotula como tal y muestra sus controles')
        set_range(p, '[data-vis=calibracion] [data-k=variacion]', 0)
        e = estado(p, 'calibracion', 'estadoCal')
        check(abs(e['nuevas']['media']) < 1e-9 and 'Sin variación aleatoria' in text_of(p, 'calibracion'), name + ': sin variación, el factor corrige exacto las repeticiones nuevas')
        set_range(p, '[data-vis=calibracion] [data-k=variacion]', 1.5)
        antes = estado(p, 'calibracion', 'estadoCal')['nuevas']['media']
        p.locator('[data-vis=calibracion] [data-a=sortear]').click()
        despues = estado(p, 'calibracion', 'estadoCal')['nuevas']['media']
        check(antes != despues and 'no bastan' in text_of(p, 'calibracion'), name + ': sortear cambia las repeticiones y con mucha variación se advierte')
        p.locator('[data-vis=calibracion] [data-a=ensayo]').click()
        e = estado(p, 'calibracion', 'estadoCal')
        check(e['sesgo'] == 3.63 and e['variacion'] == 0.44, name + ': se puede volver a los valores del ensayo')
        p.locator('[data-vis=calibracion] [data-modo=real]').click()
        check(not p.locator('[data-vis=calibracion] [data-k=sesgo]').is_visible(), name + ': al volver al ensayo real se ocultan los controles de simulación')

        # giro: valores visibles, sin depender del puntero
        t = p.locator('[data-vis=giro] svg').inner_html()
        check(all(v in t for v in ['340°', '355,7°', '356°', '370°', '380°']), name + ': los cinco giros medidos se leen junto a sus puntos')

        # cuadrado en los dos sentidos
        t = text_of(p, 'cuadrado')
        check('17,9 cm' in t and '0,0 cm' in t and 'casi se anulan' in t, name + ': en un sentido los errores se compensan y en el otro se suman')
        p.locator('[data-vis=cuadrado] [data-caso=ideal]').click()
        e = estado(p, 'cuadrado', 'estadoCuadrado')
        check(e['mayor'] < 1e-6 and 'cierran el cuadrado' in text_of(p, 'cuadrado'), name + ': ruedas ideales cierran el cuadrado')
        p.locator('[data-vis=cuadrado] [data-caso=conteos]').click()
        t = text_of(p, 'cuadrado')
        check('−0,35 %' in t and '5,4 cm' in t and '5,3 cm' in t, name + ': los conteos 1976 y 1969 dan −0,35 % entre ruedas y errores parecidos')
        p.locator('[data-vis=cuadrado] [data-caso=sep]').click()
        e = estado(p, 'cuadrado', 'estadoCuadrado')
        check(abs(e['horario'] - e['antihorario']) < 1e-9 and '88,24°' in text_of(p, 'cuadrado'), name + ': la separación mal estimada acorta cada giro y deja errores espejo')
        p.locator('[data-vis=cuadrado] [data-k=sep]').focus()
        p.keyboard.press('ArrowRight')
        e = estado(p, 'cuadrado', 'estadoCuadrado')
        check(abs(e['sep'] - 0.021) < 1e-9 and p.locator('[data-vis=cuadrado] [aria-pressed=true]').count() == 0, name + ': con el teclado se ajusta la separación y el caso deja de estar marcado', e)

        check(not errors, name + ': los cambios del capítulo 3 terminaron sin errores', errors[:3])
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), name + ': sigue sin desborde después de interactuar')
        fuera = contenidos(p, VIS_MOV)
        check(fuera is None, name + ': gráficos contenidos en su recuadro', fuera)
        p.evaluate("document.getElementById('d-traccion').open = true")  # la definición vive en el detalle plegado
        term = p.locator('.term').filter(has_text=re.compile(r'^centro de giro$')).first
        term.focus()
        p.wait_for_selector('#burbuja.visible')
        check('gira el robot' in p.locator('#burbuja').inner_text(), name + ': centro de giro tiene definición accesible con teclado')
        p.keyboard.press('Escape')

        # ── Reto de la calibración: respuesta inmediata, teclado y región aria-live ──
        reto = '[data-vis=reto-movimiento]'
        p.locator(reto).scroll_into_view_if_needed()
        p.wait_for_selector(reto + '[data-montado="1"]')
        check(p.locator(reto + ' input[type=radio]').count() == 5 and p.locator(reto + ' [aria-live=polite]').count() == 3, name + ': el reto usa radios nativos y regiones aria-live')
        p.locator(reto + ' input[name=mv-reto-0]').nth(1).check()
        r0 = p.locator(reto + ' [data-reto-r="0"]')
        check(r0.get_attribute('data-ok') == 'false' and 'Todavía no' in r0.inner_text() and '3,63 %' in r0.inner_text(), name + ': una respuesta errónea explica por qué')
        check(r0.locator('a[href="#sim-calibracion"]').count() == 1, name + ': la respuesta enlaza a la sección')
        p.locator(reto + ' input[name=mv-reto-0]').nth(0).check()
        check(r0.get_attribute('data-ok') == 'true' and 'Correcto' in r0.inner_text() and '0 %' in r0.inner_text(), name + ': la respuesta correcta se confirma')
        p.locator(reto + ' input[name=mv-reto-1]').nth(1).check()
        check(p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'false' and '1 de 2' in p.locator(reto + ' [data-reto-fin]').inner_text(), name + ': decir que las cinco quedan en 0 % es incorrecto')
        p.locator(reto + ' input[name=mv-reto-1]').nth(0).check()
        check('2 de 2 correctas' in p.locator(reto + ' [data-reto-fin]').inner_text() and '−0,72 %' in p.locator(reto + ' [data-reto-r="1"]').inner_text(), name + ': el reto resume 2 de 2 con las cifras de la página')
        check(p.locator('#reto-calibracion').evaluate("el => !el.closest('details')"), name + ': el reto está en la parte visible, no en un detalle plegado')
        check(p.evaluate("() => document.querySelector('#reto-calibracion').getBoundingClientRect().right <= document.documentElement.clientWidth + 1"), name + ': el reto cabe en el ancho')
        if not options.get('has_touch'):
            p.locator(reto + ' input[name=mv-reto-1]').nth(1).focus()
            p.keyboard.press('ArrowUp')
            check(p.locator(reto + ' input[name=mv-reto-1]').nth(0).is_checked() and p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'true', name + ': con las flechas del teclado se responde y la respuesta queda escrita')
            check(p.locator(reto + ' input[name=mv-reto-1]').nth(0).evaluate("el => el.matches(':focus-visible')"), name + ': el foco del teclado es visible en el reto')
        if reducido:
            check(p.evaluate("() => [...document.querySelectorAll('[data-vis=reto-movimiento] *')].every(e => { const c = getComputedStyle(e); return c.animationName === 'none' && parseFloat(c.transitionDuration) === 0; })"), name + ': el reto no anima')

        # ── A estrella en el capítulo 6 ──
        p.goto(BASE + '/navegacion.html')
        p.locator('[data-vis=astar]').scroll_into_view_if_needed()
        p.wait_for_selector('[data-vis=astar][data-montado="1"]')
        # ── Reto de A estrella: respuesta inmediata, teclado y región aria-live ──
        rn = '[data-vis=reto-navegacion]'
        p.locator(rn).scroll_into_view_if_needed()
        p.wait_for_selector(rn + '[data-montado="1"]')
        check(p.locator(rn + ' input[type=radio]').count() == 6 and p.locator(rn + ' [aria-live=polite]').count() == 3, name + ': el reto de navegación usa radios nativos y regiones aria-live')
        p.locator(rn + ' input[name=nv-reto-0]').nth(1).check()
        n0 = p.locator(rn + ' [data-reto-r="0"]')
        check(n0.get_attribute('data-ok') == 'false' and 'Todavía no' in n0.inner_text() and '111' in n0.inner_text() and n0.locator('a[href="#sim-astar"]').count() == 1, name + ': una respuesta errónea explica por qué y enlaza a la sección')
        p.locator(rn + ' input[name=nv-reto-0]').nth(0).check()
        check(n0.get_attribute('data-ok') == 'true' and 'Correcto' in n0.inner_text() and '291' in n0.inner_text(), name + ': la respuesta correcta se confirma con las cifras de la página')
        p.locator(rn + ' input[name=nv-reto-1]').nth(1).check()
        check(p.locator(rn + ' [data-reto-r="1"]').get_attribute('data-ok') == 'false' and '1 de 2' in p.locator(rn + ' [data-reto-fin]').inner_text(), name + ': decir que A estrella halla una ruta más corta es incorrecto')
        p.locator(rn + ' input[name=nv-reto-1]').nth(0).check()
        check('2 de 2 correctas' in p.locator(rn + ' [data-reto-fin]').inner_text(), name + ': el reto de navegación resume 2 de 2')
        check(p.locator('#reto-astar').evaluate("el => !el.closest('details')"), name + ': el reto de navegación está visible, no en un detalle plegado')
        check(p.evaluate("() => document.querySelector('#reto-astar').getBoundingClientRect().right <= document.documentElement.clientWidth + 1"), name + ': el reto de navegación cabe en el ancho')
        if not options.get('has_touch'):
            p.locator(rn + ' input[name=nv-reto-1]').nth(0).focus()
            p.keyboard.press('ArrowDown')
            check(p.locator(rn + ' input[name=nv-reto-1]').nth(1).is_checked() and p.locator(rn + ' [data-reto-r="1"]').get_attribute('data-ok') == 'false', name + ': con las flechas del teclado se responde en el reto de navegación')
        if reducido:
            check(p.evaluate("() => [...document.querySelectorAll('[data-vis=reto-navegacion] *')].every(e => { const c = getComputedStyle(e); return c.animationName === 'none' && parseFloat(c.transitionDuration) === 0; })"), name + ': el reto de navegación no anima')

        t = text_of(p, 'astar')
        e = estado(p, 'astar', 'estadoAstar')
        check(e['alg'] == 'a' and e['k'] == 30 and e['f'] == e['g'] + e['h'] and '30 de 111' in t, name + ': A estrella parte a mitad de búsqueda, con f = g + h', e)
        check('291' in t and '111' in t and '27' in t, name + ': la comparación de celdas revisadas queda siempre visible')
        p.locator('[data-vis=astar] [data-a=paso]').click()
        check(estado(p, 'astar', 'estadoAstar')['k'] == 31, name + ': Un paso revisa una celda más')
        p.locator('[data-vis=astar] [data-alg=d]').click()
        e = estado(p, 'astar', 'estadoAstar')
        check(e['alg'] == 'd' and e['k'] == 0 and '0 de 291' in text_of(p, 'astar') and 'Dijkstra no estima' in text_of(p, 'astar'), name + ': Dijkstra empieza desde cero y sin estimación')
        set_range(p, '[data-vis=astar] input[data-k=k]', 10)
        e = estado(p, 'astar', 'estadoAstar')
        check(e['k'] == 10 and e['h'] == 0 and e['f'] == e['g'], name + ': el deslizador lleva a un paso y en Dijkstra f = g', e)
        p.locator('[data-vis=astar] [data-a=fin]').click()
        e = estado(p, 'astar', 'estadoAstar')
        check(e['k'] == 291 and e['camino'] and 'La ruta tiene 27 pasos' in text_of(p, 'astar'), name + ': al final se dibuja la ruta')
        p.locator('[data-vis=astar] [data-alg=a]').click()
        p.locator('[data-vis=astar] [data-a=play]').click()
        e = estado(p, 'astar', 'estadoAstar')
        if reducido:
            check(e['k'] == 111 and not e['activo'], name + ': con movimiento reducido, Reproducir muestra el resultado sin animar', e)
        else:
            check(e['activo'], name + ': Reproducir anima la búsqueda')
            p.wait_for_timeout(400)
            p.locator('[data-vis=astar] [data-a=play]').click()
            k1 = estado(p, 'astar', 'estadoAstar')['k']
            p.wait_for_timeout(300)
            e = estado(p, 'astar', 'estadoAstar')
            check(0 < k1 < 111 and e['k'] == k1 and not e['activo'], name + ': Pausar detiene la búsqueda donde va', (k1, e))
        p.locator('[data-vis=astar] [data-a=cero]').click()
        p.locator('[data-vis=astar] [data-a=paso]').focus()
        p.keyboard.press('Enter')
        check(estado(p, 'astar', 'estadoAstar')['k'] == 1, name + ': con teclado se avanza un paso desde el inicio')

        # Rejilla editable: muros, meta, encierro, vuelta al ejemplo y teclado. En los teléfonos se toca.
        tactil = bool(options.get('has_touch'))
        rejilla = p.locator('[data-vis=astar] .as-rejilla')
        rejilla.scroll_into_view_if_needed()

        def tocar(cx, cy):
            caja = rejilla.bounding_box()
            x, y = caja['x'] + (cx + .5) * caja['width'] / 24, caja['y'] + (cy + .5) * caja['height'] / 13
            if tactil:
                p.touchscreen.tap(x, y)
            else:
                p.mouse.click(x, y)
        check(p.locator('[data-vis=astar] [data-a=ejemplo]').is_disabled(), name + ': sin cambios, Volver al ejemplo está desactivado')
        tocar(12, 6)
        e = estado(p, 'astar', 'estadoAstar')
        t = text_of(p, 'astar')
        check(e['muros'] == 8 and e['editada'] and e['k'] == 18 and e['camino'] and 'La ruta tiene 17 pasos' in t and '211' in t,
              name + ': abrir un hueco en el muro recalcula: A estrella revisa 18 celdas y Dijkstra 211 para una ruta de 17 pasos', e)
        check('Derribaste un muro' in t, name + ': el estado anuncia el cambio')
        p.locator('[data-vis=astar] [data-modo=meta]').click()
        tocar(5, 6)
        e = estado(p, 'astar', 'estadoAstar')
        check(e['B'] == [5, 6] and e['k'] == 3 and 'La ruta tiene 2 pasos' in text_of(p, 'astar'), name + ': con Meta se mueve la meta a la celda tocada', e)
        tocar(0, 0)
        p.locator('[data-vis=astar] [data-modo=muro]').click()
        tocar(1, 0)
        tocar(0, 1)
        e = estado(p, 'astar', 'estadoAstar')
        t = text_of(p, 'astar')
        check(e['B'] == [0, 0] and not e['llego'] and not e['camino'] and 'no llegó a la meta' in t and 'sin ruta' in t,
              name + ': con la meta encerrada no hay ruta y se explica por qué', e)
        p.locator('[data-vis=astar] [data-a=ejemplo]').click()
        e = estado(p, 'astar', 'estadoAstar')
        check(e['k'] == 30 and e['muros'] == 9 and e['A'] == [3, 6] and e['B'] == [20, 6] and not e['editada'] and '30 de 111' in text_of(p, 'astar'),
              name + ': Volver al ejemplo restaura la rejilla y sus cifras', e)
        rejilla.focus()
        for _ in range(3):
            p.keyboard.press('ArrowRight')
        p.keyboard.press('Enter')
        e = estado(p, 'astar', 'estadoAstar')
        check(e['cur'] == [6, 6] and e['muros'] == 10 and e['n'] == 110, name + ': con el teclado las flechas mueven el marco y Enter levanta un muro', e)
        if not tactil:
            caja = rejilla.bounding_box()
            punto = lambda cx, cy: (caja['x'] + (cx + .5) * caja['width'] / 24, caja['y'] + (cy + .5) * caja['height'] / 13)
            p.mouse.move(*punto(3, 6))
            p.mouse.down()
            p.mouse.move(*punto(4, 2), steps=8)
            p.mouse.up()
            e = estado(p, 'astar', 'estadoAstar')
            check(e['A'] == [4, 2] and e['muros'] == 10, name + ': el robot se arrastra a otra celda sin tocar los muros', e)
        check(not errors, name + ': A estrella sin errores', errors[:3])
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), name + ': navegación sin desborde horizontal')
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

    p.goto(BASE + '/movimiento.html')
    check(p.locator('main p.resumen').count() >= 10, '360 px: cada sección larga tiene un resumen corto')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => !d.open)"), '360 px: el detalle de cada resumen parte plegado')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => d.querySelector(':scope > summary').textContent.trim().startsWith('Ver el detalle:'))"), '360 px: cada detalle dice qué esconde')
    check(p.evaluate("[...document.querySelectorAll('main [data-vis], main .tabla-env')].every(v => !v.closest('details.detalle'))"), '360 px: ningún interactivo ni tabla quedó dentro de un detalle plegado')
    cerrada = altura(p)
    p.evaluate("document.querySelectorAll('main details.detalle').forEach(d => d.open = true)")
    p.wait_for_timeout(300)
    abierta = p.evaluate('document.documentElement.scrollHeight')
    print('  altura a 360 px: plegada %d px (%.1f pantallas), con todo abierto %d px, antes %d px (%.1f %%)' % (cerrada, cerrada / 740, abierta, ALTURA_ANTES, 100.0 * cerrada / ALTURA_ANTES))
    check(cerrada < abierta, '360 px: plegada la página es más corta que con todo abierto')
    check(cerrada <= ALTURA_ANTES * 0.7 + ALTURA_RETO, '360 px: la página mide como mucho el 70 %% de antes (%d px contra %d px)' % (cerrada, ALTURA_ANTES))
    # un ancla hacia el contenido plegado lo abre y lo muestra
    for destino in ('sesgo-dispersion', 'd-mejorar', 'd-recta'):
        p.goto(BASE + '/movimiento.html#' + destino)
        p.wait_for_timeout(700)
        r = p.evaluate("""(id) => { const el = document.getElementById(id), rc = el.getBoundingClientRect(), d = el.closest('details.detalle');
          return { abierto: !d || !!d.open, arriba: rc.top, alto: innerHeight }; }""", destino)
        check(r['abierto'] and r['arriba'] < r['alto'], '360 px: el ancla #%s abre el detalle plegado y lo deja a la vista' % destino)
    # un enlace de la página abre el detalle
    p.goto(BASE + '/movimiento.html')
    p.wait_for_timeout(300)
    p.evaluate("""() => { const a = document.createElement('a'); a.href = '#d-giro'; a.id = 'prueba-enlace'; a.textContent = 'x'; document.querySelector('main').prepend(a); }""")
    p.evaluate("document.getElementById('prueba-enlace').click()")
    p.wait_for_timeout(500)
    check(p.evaluate("document.getElementById('d-giro').open"), '360 px: un enlace de la página abre el detalle')
    # un resultado del buscador cuyo texto está plegado abre el detalle de su sección
    p.goto(BASE + '/movimiento.html')
    p.wait_for_timeout(300)
    check(not p.evaluate("document.getElementById('d-mejorar').open"), '360 px: sin búsqueda el detalle sigue plegado')
    p.evaluate("document.querySelector('.search-trigger').click()")
    p.wait_for_selector('dialog.search-dialog[open]')
    p.fill('dialog.search-dialog input', 'mejora barata para quien construya un robot parecido')
    p.wait_for_timeout(600)
    p.locator('.search-results a[href$="movimiento.html#mejorar"]').first.click()
    p.wait_for_timeout(900)
    check(p.evaluate("document.getElementById('d-mejorar').open"), '360 px: un resultado del buscador abre el texto plegado de su sección')
    ctx.close()
    # sin JavaScript el detalle se abre a mano y los interactivos siguen con su texto de respaldo
    sin = browser.new_context(viewport={'width': 360, 'height': 740}, java_script_enabled=False)
    q = sin.new_page()
    q.goto(BASE + '/movimiento.html')
    q.locator('#d-giro > summary').click()
    check(q.locator('#d-giro').get_attribute('open') is not None, 'sin JavaScript: el detalle se abre a mano')
    check(q.locator('[data-vis=cinematica] .vis-fallback').is_visible(), 'sin JavaScript: el texto de respaldo del primer interactivo sigue visible')
    check(q.locator('[data-vis=reto-movimiento] .vis-fallback').is_visible() and not q.locator('[data-vis=reto-movimiento] details p').is_visible(), 'sin JavaScript: el reto muestra la pregunta y esconde la respuesta')
    q.locator('[data-vis=reto-movimiento] details > summary').click()
    check('Calibrar quita el sesgo' in q.locator('[data-vis=reto-movimiento] details p').inner_text() and q.locator('[data-vis=reto-movimiento] details p').is_visible(), 'sin JavaScript: la respuesta del reto se abre en un details')
    q.goto(BASE + '/navegacion.html')
    check(q.locator('[data-vis=reto-navegacion] .vis-fallback').is_visible() and not q.locator('[data-vis=reto-navegacion] details p').is_visible(), 'sin JavaScript: el reto de navegación muestra la pregunta y esconde la respuesta')
    q.locator('[data-vis=reto-navegacion] details > summary').click()
    check('291' in q.locator('[data-vis=reto-navegacion] details p').inner_text() and q.locator('[data-vis=reto-navegacion] details p').is_visible(), 'sin JavaScript: la respuesta del reto de navegación se abre en un details')
    sin.close()
    # las cifras y referencias de la tesis siguen en la página, y los resúmenes no inventan ninguna
    cmp_ = subprocess.run([sys.executable, str(ROOT / 'herramientas' / 'comparar_resumen.py'), 'movimiento'], capture_output=True, text=True, encoding='utf-8', env=dict(os.environ, PYTHONUTF8='1'))
    lineas = cmp_.stdout.strip().splitlines()
    print('  ' + lineas[0])
    check(cmp_.returncode == 0, 'ninguna cifra ni referencia a la tesis desapareció y los resúmenes no inventan cifras: ' + lineas[-1])
    browser.close()
if server:
    server.shutdown()
print('\n%d comprobaciones del capítulo 3 y de A estrella correctas' % count)
