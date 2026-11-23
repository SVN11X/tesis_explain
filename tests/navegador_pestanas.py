"""Pestañas de mandos de los interactivos en el teléfono (js/comun.js, pestanas): reparto, teclado, ARIA, ancho de 320 a 1280,
movimiento reducido y tema oscuro. Uso: python3 tests/navegador_pestanas.py
Sin argumento inicia su propio servidor local; con argumento usa esa URL base.
"""
from servidor import iniciar
import sys
from playwright.sync_api import sync_playwright

server = None
if len(sys.argv) > 1:
    BASE = sys.argv[1].rstrip('/')
else:
    server, BASE = iniciar()
count = 0
CASOS = [('mapeo.html', 'lazo'), ('control.html', 'estabilidad'), ('movimiento.html', 'cinematica'), ('navegacion.html', 'dwb')]


def check(cond, text, detail=''):
    global count
    count += 1
    assert cond, text + ('  ' + str(detail) if detail else '')
    print('  ok   ' + text)


def abrir(ctx, pagina, visual):
    pg = ctx.new_page()
    errores = []
    pg.on('pageerror', lambda e: errores.append(str(e)))
    pg.goto(BASE + '/' + pagina)
    pg.evaluate('() => document.getElementById("prueba-paneles") && document.getElementById("prueba-paneles").remove()')
    sel = '[data-vis="%s"]' % visual
    pg.locator(sel).scroll_into_view_if_needed()
    pg.wait_for_selector(sel + ' .v-escena', timeout=15000)
    pg.wait_for_timeout(500)
    return pg, sel, errores


with sync_playwright() as pw:
    nav = pw.chromium.launch()
    for tema in ('light', 'dark'):
        ctx = nav.new_context(viewport={'width': 360, 'height': 740}, is_mobile=True, has_touch=True, reduced_motion='reduce', color_scheme=tema)
        for pagina, visual in CASOS:
            nombre = '%s %s (%s)' % (pagina, visual, tema)
            pg, sel, errores = abrir(ctx, pagina, visual)
            tabs = pg.locator(sel + ' [role=tab]')
            n = tabs.count()
            check(n >= 2, nombre + ': los mandos van en pestañas en 360 px', n)
            check(pg.locator(sel + ' [role=tablist]').count() >= 1 and pg.locator(sel + ' [role=tabpanel]:visible').count() == 1, nombre + ': hay un solo panel visible')
            check(all(tabs.nth(i).get_attribute('aria-controls') and pg.locator('#' + tabs.nth(i).get_attribute('aria-controls')).get_attribute('aria-labelledby') == tabs.nth(i).get_attribute('id') for i in range(n)), nombre + ': cada pestaña y su panel se nombran entre sí')
            check([tabs.nth(i).get_attribute('tabindex') for i in range(n)].count('0') == 1, nombre + ': solo la pestaña activa entra en el orden de tabulación')
            check(all(tabs.nth(i).bounding_box()['height'] >= 24 and tabs.nth(i).bounding_box()['width'] >= 24 for i in range(n)), nombre + ': cada pestaña mide 24 px o más')
            check(not pg.evaluate('document.documentElement.scrollWidth > innerWidth'), nombre + ': sin desborde horizontal')
            esc = pg.locator(sel + ' .v-escena').first
            dib = pg.locator(sel + ' .v-dib').first.bounding_box()
            check(dib['y'] < pg.locator(sel + ' [role=tablist]').first.bounding_box()['y'], nombre + ': el dibujo queda sobre los mandos, no en otra pestaña')
            tabs.first.focus()
            pg.keyboard.press('ArrowRight')
            check(tabs.nth(1).get_attribute('aria-selected') == 'true' and pg.evaluate('document.activeElement.getAttribute("role")') == 'tab', nombre + ': la flecha derecha pasa a la siguiente pestaña')
            pg.keyboard.press('End')
            check(tabs.nth(n - 1).get_attribute('aria-selected') == 'true', nombre + ': Fin va a la última pestaña')
            pg.keyboard.press('Home')
            check(tabs.nth(0).get_attribute('aria-selected') == 'true', nombre + ': Inicio va a la primera pestaña')
            pg.keyboard.press('ArrowLeft')
            check(tabs.nth(n - 1).get_attribute('aria-selected') == 'true', nombre + ': la flecha izquierda da la vuelta')
            if tema == 'light':
                pg.set_viewport_size({'width': 1280, 'height': 800})
                pg.wait_for_timeout(500)
                check(pg.locator(sel + ' [role=tab]').count() == 0 and pg.locator(sel + ' [role=tabpanel]').count() == 0, nombre + ': en 1280 px no hay pestañas')
                pg.set_viewport_size({'width': 320, 'height': 700})
                pg.wait_for_timeout(500)
                check(pg.locator(sel + ' [role=tab]').count() >= 2 and not pg.evaluate('document.documentElement.scrollWidth > innerWidth'), nombre + ': al volver a 320 px vuelven las pestañas sin desborde')
            check(not errores, nombre + ': sin errores de página', errores)
            pg.close()
        ctx.close()
    ctx = nav.new_context(viewport={'width': 1280, 'height': 800})
    for pagina, visual in CASOS:
        pg, sel, errores = abrir(ctx, pagina, visual)
        check(pg.locator('[role=tablist]').count() == 0, pagina + ': en escritorio la página no tiene pestañas de mandos')
        pg.close()
    ctx.close()
    ctx = nav.new_context(viewport={'width': 360, 'height': 740}, is_mobile=True, has_touch=True)
    pg, sel, errores = abrir(ctx, 'movimiento.html', 'cinematica')
    pg.locator(sel + ' [role=tab]:has-text("Valores")').first.click()
    ranges = pg.locator(sel + ' [role=tabpanel]:visible input[type=range]')
    check(ranges.count() >= 1, 'cinematica: el panel Valores trae sus deslizadores a la vista')
    antes = pg.locator(sel + ' .v-escena').first.inner_html()
    ranges.first.focus()
    pg.keyboard.press('ArrowRight')
    pg.keyboard.press('ArrowRight')
    check(pg.locator(sel + ' .v-escena').first.inner_html() != antes, 'cinematica: mover un deslizador con el teclado cambia el dibujo o la lectura')
    ctx.close()
    nav.close()

print('Pestañas de mandos: %d comprobaciones, todas ok' % count)
if server:
    server.shutdown()
