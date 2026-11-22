"""Evidencia analítica: estabilidad del lazo, mapa frente al plano y repeticiones.
Comprueba en un navegador real que los tres interactivos nuevos muestran las cifras de las
Tablas A4.5, A8.2, A8.3 y A8.4, reaccionan a sus controles, caben en un teléfono, funcionan en
tema oscuro y dejan una explicación legible sin JavaScript. También comprueba que los gráficos
que miden su contenedor al montarse usan el ancho real del teléfono.
Uso: python3 tests/navegador_evidencia.py [http://127.0.0.1:8765]
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler
from servidor import iniciar, DIST
from functools import partial
from threading import Thread
import re, sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = None
if len(sys.argv) > 1:
    BASE = sys.argv[1].rstrip('/')
else:
    server, BASE = iniciar()
count = 0


def check(cond, text, detalle=''):
    global count
    count += 1
    assert cond, text + ('  ' + str(detalle) if detalle != '' else '')
    print('  ok   ' + text)


def rango(page, selector, valor):
    page.locator(selector).evaluate('(el, v) => { el.value = v; el.dispatchEvent(new Event("input", {bubbles: true})); }', str(valor))


def montar(page, vis):
    page.locator('[data-vis="%s"]' % vis).scroll_into_view_if_needed()
    page.wait_for_selector('[data-vis="%s"][data-montado="1"]' % vis)
    return page.locator('[data-vis="%s"]' % vis)


def dato(caja, titulo):
    """Valor de la tarjeta cuyo rótulo es titulo."""
    return caja.locator('.control-datos > div').filter(has=caja.page.locator('span', has_text=re.compile('^' + re.escape(titulo)))).first.locator('b').inner_text()


CONFIG = [
    ('escritorio', {'viewport': {'width': 1366, 'height': 900}}),
    ('móvil', {'viewport': {'width': 390, 'height': 844}, 'is_mobile': True, 'has_touch': True, 'device_scale_factor': 2}),
    ('móvil pequeño', {'viewport': {'width': 320, 'height': 740}, 'is_mobile': True, 'has_touch': True}),
    ('oscuro', {'viewport': {'width': 1366, 'height': 900}, 'color_scheme': 'dark'}),
]

with sync_playwright() as pw:
    nav = pw.chromium.launch()
    for nombre, opciones in CONFIG:
        print(nombre)
        ctx = nav.new_context(**opciones)
        ctx.route(re.compile(r'^https?://(?!localhost|127\.0\.0\.1)'), lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page()
        errores = []
        p.on('pageerror', lambda e: errores.append(str(e)))
        p.on('console', lambda m: errores.append(m.text) if m.type == 'error' else None)

        # ── Estabilidad del lazo de velocidad ──
        p.goto(BASE + '/control.html')
        caja = montar(p, 'estabilidad')
        est = lambda: caja.evaluate('el => el.estadoEstabilidad()')
        check(est() == {'rueda': 'izq', 'conjunto': 'definitivas', 'kiLineal': False, 'Ld': 0, 'exp': 0, 'tau': None, 'zoom': False}, nombre + ': parte en la rueda izquierda con las ganancias definitivas y sin retardo')
        check(dato(caja, 'Estabilidad') == 'Estable' and dato(caja, 'Margen de fase') == '56,9°' and dato(caja, 'Sensibilidad máxima Ms') == '1,35', nombre + ': muestra la fila de la Tabla A4.5 sin retardo', dato(caja, 'Margen de fase'))
        check('Datos de la tesis' in caja.locator('[data-o="procedencia"]').inner_text(), nombre + ': dice que esa cifra es de la tesis')
        caja.locator('[data-rueda="der"]').click()
        rango(p, '#ev-ld', 0.1)
        check(dato(caja, 'Margen de fase') == '42,9°' and dato(caja, 'Sensibilidad máxima Ms') == '1,81' and 'Tabla A4.5' in caja.locator('[data-o="procedencia"]').inner_text(), nombre + ': derecha con 0,1 s reproduce 42,9° y 1,81')
        check(caja.locator('#ev-ki').is_disabled(), nombre + ': Ki lineal solo se ofrece en la rueda izquierda')
        caja.locator('[data-rueda="izq"]').click()
        caja.locator('#ev-ki').check()
        check(dato(caja, 'Margen de fase') == '40,7°' and '0,9950' in caja.locator('[data-o="polos"]').inner_text(), nombre + ': con Ki lineal aparece el polo de 0,995 y 40,7°')
        caja.locator('#ev-ki').uncheck()
        rango(p, '#ev-km', 0.7)
        check(dato(caja, 'Estabilidad') == 'Inestable' and caja.locator('[data-o="polos"] .ev-polo.fuera').count() >= 1, nombre + ': sobre la ganancia crítica el polo sale del círculo y se marca')
        check('Cálculo con el mismo modelo' in caja.locator('[data-o="procedencia"]').inner_text(), nombre + ': lo que no es una fila de la tesis se rotula como cálculo')
        caja.locator('[data-a="zoom"]').click()
        check(caja.locator('[data-a="zoom"]').get_attribute('aria-pressed') == 'true' and est()['zoom'], nombre + ': el acercamiento a z = 1 se anuncia como botón presionado')
        caja.locator('[data-a="tesis"]').click()
        e = est()
        check(e['Ld'] == 0 and e['exp'] == 0 and e['rueda'] == 'izq' and e['zoom'] and dato(caja, 'Margen de fase') == '56,9°', nombre + ': Volver al caso de la tesis restablece sin perder el acercamiento')
        caja.locator('[data-conj="original"]').click()
        rango(p, '#ev-ld', 0.1)
        check(dato(caja, 'Sensibilidad máxima Ms') == '2,18' and 'Anexo 4.12' in caja.locator('[data-o="procedencia"]').inner_text(), nombre + ': las ganancias originales con 0,1 s llegan a Ms 2,18, como dice el anexo')
        check(caja.locator('label[for="ev-ld"]').count() == 1 and caja.locator('label[for="ev-km"]').count() == 1 and caja.locator('label[for="ev-tau"]').count() == 1, nombre + ': cada deslizador tiene su etiqueta')
        dims = caja.locator('svg').evaluate_all('els => els.map(el => el.getBoundingClientRect().width <= el.closest(".vis").getBoundingClientRect().width + 1)')
        check(all(dims) and len(dims) == 2, nombre + ': los dos gráficos caben en el interactivo')
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), nombre + ': control.html sin desborde horizontal')
        # el gráfico FOPDT mide el ancho real al montarse, también en un teléfono
        fo = montar(p, 'fopdt')
        w = fo.locator('svg').first.evaluate('el => [+el.getAttribute("viewBox").split(" ")[2], el.closest(".control-graf").clientWidth]')
        check(abs(w[0] - max(260, w[1])) <= 1, nombre + ': el gráfico FOPDT se dibuja con el ancho de su contenedor', w)

        # ── El mapa frente al plano ──
        p.goto(BASE + '/mapeo.html#exactitud')
        caja = montar(p, 'plano-mapa')
        e = caja.evaluate('el => el.estadoPlano()')
        check(e['sel'] == 'pasillo-3' and abs(e['pasillos'] - 11.7) < 1e-9 and e['dentro'] == 7, nombre + ': los pasillos suman 11,7 cm y 7 de 11 distancias quedan dentro de una celda', e)
        check(dato(caja, 'Diferencia media') == '+5,2 cm' and caja.locator('[data-o="plano"] .ev-cota-sel').count() == 3, nombre + ': el tercer pasillo se marca en el plano con +5,2 cm')
        caja.locator('[data-fila="tabique-inferior"]').click()
        check(dato(caja, 'Diferencia media') == '+9,3 cm' and dato(caja, 'Plano, medido con huincha') == '0,61 m' and 'no se midió' in caja.locator('[data-o="lectura"]').text_content(), nombre + ': el tabique inferior muestra +9,3 cm y advierte que su largo no se midió')
        check(caja.locator('[data-fila="tabique-inferior"]').get_attribute('aria-pressed') == 'true', nombre + ': la distancia elegida queda marcada')
        caja.locator('[data-v="iteraciones"]').click()
        check(caja.locator('[data-o="plano"]').is_hidden() and dato(caja, 'Media de los cinco mapas') == '3,43 cm' and dato(caja, 'Intervalo al 95 %') == '3,1 a 3,7 cm', nombre + ': por mapa, la media es 3,43 cm con el intervalo de la Tabla A8.4')
        caja.locator('[data-sentido="mapa"]').click()
        check(dato(caja, 'Media de los cinco mapas') == '4,37 cm' and dato(caja, 'Percentil 95') == '9,7 a 12,2 cm', nombre + ': del mapa al plano las medias son mayores, Tabla A8.2')
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), nombre + ': mapeo.html sin desborde horizontal')
        w = caja.locator('[data-o="graf"] svg').evaluate('el => [+el.getAttribute("viewBox").split(" ")[2], el.parentElement.clientWidth]')
        check(abs(w[0] - max(300, w[1])) <= 1, nombre + ': el gráfico del plano usa el ancho real de su contenedor', w)

        # ── Cuánto dicen cinco repeticiones ──
        p.goto(BASE + '/resultados.html#confianza')
        caja = montar(p, 'repeticiones')
        rep = lambda: caja.evaluate('el => el.estadoRepeticiones()')
        check(rep() == {'ind': 'error_odometrico', 'n': 5, 'k': 5, 'total': 6}, nombre + ': parte en el error odométrico y en 5 de 6')
        check(dato(caja, 'Intervalo al 95 %, n = 5') == '3,08 a 4,18 %', nombre + ': el error odométrico va de 3,08 a 4,18 %')
        rango(p, '#ev-n', 10)
        check('42 % más angosto' in caja.locator('[data-o="datos-m"]').inner_text() and caja.locator('.ev-ic-proy').count() == 1, nombre + ': con 10 repeticiones el intervalo se angosta 42 % y se dibuja la proyección')
        caja.locator('[data-ind="area_libre"]').click()
        check(dato(caja, 'Intervalo al 95 %, n = 5') == '3,464 a 3,531 m²', nombre + ': el área libre queda entre 3,46 y 3,53 m²', dato(caja, 'Intervalo al 95 %, n = 5'))
        check(dato(caja, 'Intervalo exacto al 95 %') == '35,9 a 99,6 %' and dato(caja, 'Prueba binomial frente a 50 %') == 'p = 0,109', nombre + ': 5 de 6 da 35,9 a 99,6 % y p = 0,109')
        caja.locator('[data-pre="15-15"]').click()
        check(dato(caja, 'Lo que se puede afirmar') == 'más de 78,2 %' and '17 intentos' in caja.locator('[data-o="lectura-p"]').inner_text(), nombre + ': 15 de 15 permite afirmar más de 78,2 % y faltan 17 para pasar del 80 %')
        caja.locator('#ev-t').fill('4'); caja.locator('#ev-k').fill('9'); caja.locator('#ev-k').dispatch_event('change')
        e = rep()
        check(e['total'] == 4 and e['k'] == 4, nombre + ': los éxitos no pueden superar los intentos', e)
        # ── Reto de las repeticiones ──
        reto = '[data-vis=reto-resultados]'
        montar(p, 'reto-resultados')
        check(p.locator(reto + ' input[type=radio]').count() == 6 and p.locator(reto + ' [aria-live=polite]').count() == 3, nombre + ': el reto usa radios nativos y regiones aria-live')
        p.locator(reto + ' input[name=rs-reto-0]').nth(2).check()
        r0 = p.locator(reto + ' [data-reto-r="0"]')
        check(r0.get_attribute('data-ok') == 'false' and '0,109375' in r0.inner_text(), nombre + ': decir que supera el 50 % es incorrecto y se explica con la prueba binomial')
        p.locator(reto + ' input[name=rs-reto-0]').nth(0).check()
        check(r0.get_attribute('data-ok') == 'true' and '35,9 % a 99,6 %' in r0.inner_text() and r0.locator('a[href="#sim-repeticiones"]').count() == 1, nombre + ': que supera el 35,9 % es correcto, con el intervalo y el enlace')
        p.locator(reto + ' input[name=rs-reto-1]').nth(1).check()
        check(p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'false' and '1 de 2' in p.locator(reto + ' [data-reto-fin]').inner_text(), nombre + ': diez intentos seguidos no bastan')
        p.locator(reto + ' input[name=rs-reto-1]').nth(2).check()
        check('2 de 2 correctas' in p.locator(reto + ' [data-reto-fin]').inner_text() and '80 %' in p.locator(reto + ' [data-reto-r="1"]').inner_text(), nombre + ': el reto resume 2 de 2 con 17 intentos')
        check(p.locator('#reto-repeticiones').evaluate("el => !el.closest('details')"), nombre + ': el reto está en la parte visible, no en un detalle plegado')
        check(p.evaluate("() => document.querySelector('#reto-repeticiones').getBoundingClientRect().right <= document.documentElement.clientWidth + 1"), nombre + ': el reto cabe en el ancho')
        if not opciones.get('is_mobile'):
            p.locator(reto + ' input[name=rs-reto-1]').nth(2).focus()
            p.keyboard.press('ArrowUp')
            check(p.locator(reto + ' input[name=rs-reto-1]').nth(1).is_checked() and p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'false', nombre + ': con las flechas del teclado se responde y la respuesta queda escrita')
            check(p.locator(reto + ' input[name=rs-reto-1]').nth(1).evaluate("el => el.matches(':focus-visible')"), nombre + ': el foco del teclado es visible en el reto')
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), nombre + ': resultados.html sin desborde horizontal')
        check(not errores, nombre + ': sin errores de consola', errores[:3])
        ctx.close()

    # ── Sin JavaScript queda una explicación con las cifras ──
    ctx = nav.new_context(java_script_enabled=False, viewport={'width': 390, 'height': 844})
    p = ctx.new_page()
    p.goto(BASE + '/control.html')
    check('56,9°' in p.locator('[data-vis="estabilidad"]').inner_text() and p.locator('table caption', has_text='Tabla A4.5').count() == 1, 'sin JavaScript: la estabilidad tiene texto de respaldo y la Tabla A4.5 completa')
    p.goto(BASE + '/mapeo.html')
    check('+9,3 cm' in p.locator('[data-vis="plano-mapa"]').inner_text() and p.locator('[data-vis="plano-mapa"] img[src$="plano-recinto.svg"]').count() == 1, 'sin JavaScript: el plano y las diferencias se leen en el respaldo')
    p.goto(BASE + '/resultados.html')
    check('35,9 %' in p.locator('[data-vis="repeticiones"]').inner_text() and p.locator('table caption', has_text='Tabla A8.4').count() == 1, 'sin JavaScript: las repeticiones tienen respaldo y la Tabla A8.4 completa')
    check(p.locator('[data-vis="reto-resultados"] .vis-fallback').is_visible() and not p.locator('[data-vis="reto-resultados"] details p').is_visible(), 'sin JavaScript: el reto muestra la pregunta y esconde la respuesta')
    p.locator('[data-vis="reto-resultados"] details > summary').click()
    check('17' in p.locator('[data-vis="reto-resultados"] details p').inner_text() and p.locator('[data-vis="reto-resultados"] details p').is_visible(), 'sin JavaScript: la respuesta del reto se abre en un details')
    ctx.close()
    nav.close()
if server:
    server.shutdown()
print('\n%d comprobaciones de la evidencia analítica correctas' % count)
