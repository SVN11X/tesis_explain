"""Capítulo 4: interacción, unidades, teclado, móvil, tema oscuro y movimiento reducido.
Uso: python3 herramientas/pruebas_control_navegador.py
Sin argumento inicia su propio servidor local; con argumento usa esa URL base.
Requiere Playwright/Chromium y beautifulsoup4 solo para las pruebas, no para el sitio.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import math, re, sys
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
        ctx = browser.new_context(**options)
        ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page()
        errors = []
        p.on('pageerror', lambda e: errors.append(str(e)))
        p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        p.goto(BASE + '/control.html')
        p.locator('details').evaluate_all('nodes => nodes.forEach(n => n.open=true)')
        visuales = ['estacionario', 'tiempo', 'leyes', 'papeles', 'cancelacion', 'acumulador', 'ciclo', 'truncamiento', 'windup', 'zonas', 'pso', 'resolucion']
        for v in visuales:
            p.locator('[data-vis="%s"]' % v).scroll_into_view_if_needed()
            p.wait_for_selector('[data-vis="%s"][data-montado="1"]' % v)
        check(not errors, name + ': los doce interactivos del capítulo montan sin errores')
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': no hay desborde horizontal')
        check(p.locator('[data-vis][data-montado] .vis-fallback').count() == 0, name + ': no quedan errores de montaje o fallbacks visibles')
        check('0,002 m/s' in text_of(p, 'estacionario'), name + ': el error estacionario tiene magnitud y unidad')
        set_range(p, '#ee-v', .14)
        check('-0,010 m/s' in text_of(p, 'estacionario'), name + ': el error cambia de signo si la rueda queda más rápida')
        p.locator('[data-vis=tiempo] [data-hz="10"]').click()
        check('100,00 ms' in text_of(p, 'tiempo'), name + ': 10 Hz corresponde a 100 ms')
        p.locator('[data-vis=tiempo] [data-hz="30"]').click()
        check('33,33 ms' in text_of(p, 'tiempo') and '33 ms' in text_of(p, 'tiempo'), name + ': se diferencia el período ideal del entero programado')
        p.locator('[data-vis=tiempo] [data-a=paso]').click()
        check('66 ms' in text_of(p, 'tiempo'), name + ': avanzar un intervalo llega a 66 ms')
        p.locator('[data-vis=leyes] [data-caso=referencia]').click()
        check('sin antiwindup' not in text_of(p, 'leyes') and 'no añade el salto proporcional' in text_of(p, 'leyes'), name + ': se explica cambiar la referencia manteniendo la medición')
        p.locator('[data-vis=leyes] [data-caso=medicion]').click()
        check('reaccionan igual' in text_of(p, 'leyes'), name + ': con referencia fija se compara la misma acción proporcional')
        p.locator('[data-vis=papeles] [data-termino=Ki]').click()
        check('ITerm anterior' in text_of(p, 'papeles'), name + ': la segunda acumulación muestra la memoria del ciclo anterior')
        p.locator('[data-vis=papeles] [data-a=reiniciar]').click()
        p.locator('[data-vis=papeles] [data-a=paso]').focus()
        p.keyboard.press('Enter')
        check('2 de 7' in text_of(p, 'papeles'), name + ': se puede avanzar un ciclo con teclado')
        check(p.locator('[data-vis=cancelacion] .cancelado').count() == 4, name + ': los valores interiores se tachan y los extremos permanecen')
        p.locator('[data-vis=cancelacion] [data-base="0"]').click()
        check('10 − 0 = 10' in text_of(p, 'cancelacion'), name + ': la cancelación también permite una medición inicial cero')
        set_range(p, '#aw-n', 90)
        check('2970 ms' in text_of(p, 'acumulador') and '255 PWM' in text_of(p, 'acumulador'), name + ': la memoria del bloqueo mantiene unidades y tope')
        p.locator('[data-vis=ciclo] [data-preset=m]').click()
        check('ticks/ciclo' in text_of(p, 'ciclo') and 'u.int.' in text_of(p, 'ciclo') and 'PWM' in text_of(p, 'ciclo'), name + ': se distinguen conteos, numerador interno y PWM en el detalle')
        set_range(p, '#cy-sal', 255)
        p.locator('[data-vis=ciclo] [data-preset=arranque]').click()
        set_range(p, '#cy-sal', 255)
        check('ITerm se conserva' in text_of(p, 'ciclo'), name + ': el detalle congela la integral al saturarse')
        p.locator('[data-vis=truncamiento] [data-error="3"]').click()
        check('9,852 PWM' in text_of(p, 'truncamiento') and '0 PWM' in text_of(p, 'truncamiento'), name + ': diez ciclos distinguen fracción acumulada de fracción descartada')
        p.locator('[data-vis=truncamiento] [data-error="5"]').click()
        check('16,420 PWM' in text_of(p, 'truncamiento') and '10 PWM' in text_of(p, 'truncamiento'), name + ': cinco ticks dan diez PWM enteros tras diez ciclos')
        check(p.locator('[data-vis=windup] svg').count() == 3, name + ': windup muestra velocidad, señal pedida y señal aplicada')
        before = p.locator('[data-vis=windup] .wu-res').inner_text()
        p.locator('#wu-aw').check()
        after = p.locator('[data-vis=windup] .wu-res').inner_text()
        check(before != after, name + ': agregar antiwindup al PID tradicional cambia el pico tras liberar')
        p.locator('[data-vis=windup] [data-fase=bloqueo]').click()
        check('está bloqueada' in text_of(p, 'windup'), name + ': el cursor informa la fase de bloqueo')
        p.locator('[data-vis=windup] [data-fase=liberar]').click()
        check('ya está libre' in text_of(p, 'windup'), name + ': liberar cambia las lecturas y la fase')
        set_range(p, '#wu-l', 4)
        check('4 s' in text_of(p, 'windup') and 'ya está libre' in text_of(p, 'windup'), name + ': cambiar la duración recalcula las curvas y conserva la fase seleccionada')
        check('no se mueve' in text_of(p, 'zonas'), name + ': hay PWM sin movimiento dentro de la zona muerta física')
        set_range(p, '#zm-p', 100)
        check('empieza a responder' in text_of(p, 'zonas'), name + ': el motor de ejemplo responde al cruzar el umbral')
        p.locator('[data-vis=zonas] [data-rueda=izq]').click()
        check('2 → 0 ticks/ciclo' in text_of(p, 'zonas'), name + ': la izquierda ignora dos ticks de error')
        check(p.locator('[data-vis=pso] .ganancia-par').count() == 6 and '12,48' in text_of(p, 'pso') and '16,00' in text_of(p, 'pso') and '7500' in text_of(p, 'pso'), name + ': los seis pares incluyen los valores PSO y finales')
        p.locator('[data-vis=resolucion] [data-caso=giro]').click()
        check(p.locator('[data-vis=resolucion] .lleno').count() == 10 and '20,0 %' in text_of(p, 'resolucion'), name + ': el giro muestra diez ticks y el peso relativo de la banda')
        set_range(p, '#re-v', .135)
        check('Después · dos decimales\n0,14 m/s' in text_of(p, 'resolucion'), name + ': el dato publicado cambia al cruzar el umbral de redondeo')
        check(p.locator('[data-vis=resolucion] .re-muestras li').count() == 10 and '0,128 m/s' in text_of(p, 'resolucion'), name + ': se explica el promedio con diez muestras etiquetadas como ejemplo')
        check(not errors, name + ': todos los cambios de controles terminaron sin errores')
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': sigue sin desborde después de interactuar')
        for v in visuales:
            dims = p.locator('[data-vis="%s"] svg' % v).evaluate_all('els => els.map(el => ({w:el.getBoundingClientRect().width, c:el.closest(".vis").getBoundingClientRect().width}))')
            check(all(d['w'] <= d['c'] + 1 for d in dims), name + ': gráficos contenidos en ' + v)
        term = p.locator('.term').filter(has_text=re.compile(r'^windup$')).first
        term.focus()
        p.wait_for_selector('#burbuja.visible')
        check('integrador' in p.locator('#burbuja').inner_text(), name + ': windup tiene definición en su primera aparición, accesible con teclado')
        p.keyboard.press('Escape')
        check(not p.locator('#burbuja').evaluate('(el) => el.classList.contains("visible")'), name + ': Escape cierra la definición')
        ctx.close()
    browser.close()
if server:
    server.shutdown()
print('\n%d comprobaciones del capítulo 4 correctas' % count)
