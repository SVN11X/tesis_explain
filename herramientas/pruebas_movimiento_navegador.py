"""Capítulo 3 y búsqueda A estrella del capítulo 6 en un navegador real.
Revisa montaje, cálculos visibles, controles, teclado, teléfono, tema oscuro y movimiento reducido.
Uso: python3 herramientas/pruebas_movimiento_navegador.py
Sin argumento inicia su propio servidor local; con argumento usa esa URL base.
Requiere Playwright con Chromium solo para las pruebas, no para el sitio.
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


VIS_MOV = ['cinematica', 'encoder', 'odometria', 'calibracion', 'giro', 'iteracion2', 'cuadrado']

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
        ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page()
        errors = []
        p.on('pageerror', lambda e: errors.append(str(e)))
        p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

        # ── Capítulo 3 ──
        p.goto(BASE + '/movimiento.html')
        for v in VIS_MOV:
            p.locator('[data-vis="%s"]' % v).scroll_into_view_if_needed()
            p.wait_for_selector('[data-vis="%s"][data-montado="1"]' % v)
        check(not errors, name + ': los siete interactivos del capítulo 3 montan sin errores', errors[:3])
        check(p.locator('[data-vis][data-montado] .vis-fallback').count() == 0, name + ': no quedan textos de respaldo visibles')
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': no hay desborde horizontal')

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
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': sigue sin desborde después de interactuar')
        fuera = contenidos(p, VIS_MOV)
        check(fuera is None, name + ': gráficos contenidos en su recuadro', fuera)
        term = p.locator('.term').filter(has_text=re.compile(r'^centro de giro$')).first
        term.focus()
        p.wait_for_selector('#burbuja.visible')
        check('gira el robot' in p.locator('#burbuja').inner_text(), name + ': centro de giro tiene definición accesible con teclado')
        p.keyboard.press('Escape')

        # ── A estrella en el capítulo 6 ──
        p.goto(BASE + '/navegacion.html')
        p.locator('[data-vis=astar]').scroll_into_view_if_needed()
        p.wait_for_selector('[data-vis=astar][data-montado="1"]')
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
        check(not errors, name + ': A estrella sin errores', errors[:3])
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': navegación sin desborde horizontal')
        ctx.close()
    browser.close()
if server:
    server.shutdown()
print('\n%d comprobaciones del capítulo 3 y de A estrella correctas' % count)
