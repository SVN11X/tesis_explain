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
CASOS = [('mapeo.html', 'lazo'), ('control.html', 'pid'), ('movimiento.html', 'cinematica'), ('navegacion.html', 'dwb'), ('navegacion.html', 'astar')]


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
            check(2 <= n <= 3, nombre + ': los mandos van en 2 o 3 pestañas en 360 px', n)
            nombres = tabs.all_inner_texts()
            check(len(set(nombres)) == n and not any(any(c.isdigit() for c in t) or t in ('Mandos', 'Valores', 'Opciones', 'Acciones', 'Lecturas', 'Notas', 'Leyenda') for t in nombres), nombre + ': ninguna pestaña tiene un nombre genérico, numerado o repetido', nombres)
            check(len({round(tabs.nth(i).bounding_box()['y']) for i in range(n)}) == 1, nombre + ': las pestañas caben en una sola fila')
            check(all(tabs.nth(i).evaluate('e => e.scrollWidth <= e.clientWidth + 1') for i in range(n)), nombre + ': ningún nombre de pestaña queda cortado')
            check(pg.locator(sel + ' .v-clave').count() == 1 and pg.locator(sel + ' .v-clave').first.bounding_box()['y'] > pg.locator(sel + ' .v-dib').first.bounding_box()['y'], nombre + ': los valores clave siguen a la vista bajo el dibujo')
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
                t320 = pg.locator(sel + ' [role=tab]')
                check(len({round(t320.nth(i).bounding_box()['y']) for i in range(t320.count())}) == 1, nombre + ': a 320 px las pestañas siguen en una sola fila')
            check(not errores, nombre + ': sin errores de página', errores)
            pg.close()
        ctx.close()
    for ancho in (320, 360):
        ctx = nav.new_context(viewport={'width': ancho, 'height': 740}, is_mobile=True, has_touch=True, reduced_motion='reduce')
        total = 0
        for pagina in ('movimiento.html', 'mapeo.html', 'navegacion.html', 'control.html', 'exploracion.html', 'robot.html'):
            pg = ctx.new_page()
            pg.goto(BASE + '/' + pagina)
            pg.evaluate('() => document.getElementById("prueba-paneles") && document.getElementById("prueba-paneles").remove()')
            for i in range(pg.locator('.vis').count()):
                pg.locator('.vis').nth(i).scroll_into_view_if_needed()
                pg.wait_for_timeout(250)
            pg.wait_for_timeout(800)
            cortes = pg.evaluate("""() => [...document.querySelectorAll('.v-clave')].flatMap(t => [t, ...t.querySelectorAll('*')].filter(e => {
                const c = getComputedStyle(e);
                return c.textOverflow === 'ellipsis' || e.scrollWidth > e.clientWidth + 1 || (e.scrollHeight > e.clientHeight + 1 && c.overflow !== 'visible');
            }).map(e => (t.closest('[data-vis]') || t).getAttribute('data-vis') + ' ' + e.tagName));""")
            total += pg.locator('.v-clave').count()
            check(not cortes, '%s a %d px: ninguna tira de valores clave corta su texto' % (pagina, ancho), cortes)
            pg.close()
        check(total >= 5, 'a %d px hay tiras de valores clave en las páginas probadas' % ancho, total)
        ctx.close()
    APILADOS = [('control.html', 'estabilidad'), ('control.html', 'windup'), ('movimiento.html', 'cuadrado'), ('control.html', 'pso'), ('mapeo.html', 'barridos'), ('control.html', 'papeles')]
    for ancho in (360, 320):
        ctx = nav.new_context(viewport={'width': ancho, 'height': 740}, is_mobile=True, has_touch=True, reduced_motion='reduce')
        for pagina, visual in APILADOS:
            nombre = '%s a %d px' % (visual, ancho)
            pg, sel, errores = abrir(ctx, pagina, visual)
            for i in range(pg.locator('.vis').count()):
                pg.locator('.vis').nth(i).scroll_into_view_if_needed()
                pg.wait_for_timeout(150)
            pg.locator(sel).scroll_into_view_if_needed()
            pg.wait_for_timeout(600)
            alto = pg.locator(sel + ' .v-escena').first.bounding_box()['height']
            check(alto <= 740, nombre + ': el escenario cabe en una pantalla de 740 px', round(alto))
            check(not pg.evaluate('document.documentElement.scrollWidth > innerWidth'), nombre + ': sin desborde horizontal')
            barra = pg.locator(sel + ' .v-vista')
            if barra.count():
                botones = barra.locator('button')
                n = botones.count()
                check(n >= 2, nombre + ': un grupo de botones elige el gráfico', n)
                antes = pg.locator(sel + ' .v-clave').inner_text() if pg.locator(sel + ' .v-clave').count() else ''
                estado = pg.evaluate("s => [...document.querySelectorAll(s + ' input[type=range], ' + s + ' input[type=checkbox]')].map(e => e.type === 'checkbox' ? e.checked : e.value).join()", sel)
                botones.first.focus()
                pg.keyboard.press('ArrowRight')
                check(botones.nth(1).get_attribute('aria-pressed') == 'true', nombre + ': la flecha derecha pasa al segundo gráfico')
                pg.keyboard.press('End')
                check(botones.nth(n - 1).get_attribute('aria-pressed') == 'true', nombre + ': Fin pasa al último gráfico')
                pg.keyboard.press('Home')
                check(botones.first.get_attribute('aria-pressed') == 'true', nombre + ': Inicio vuelve al primer gráfico')
                botones.nth(1).click()
                pg.wait_for_timeout(300)
                despues = pg.locator(sel + ' .v-clave').inner_text() if pg.locator(sel + ' .v-clave').count() else ''
                estado2 = pg.evaluate("s => [...document.querySelectorAll(s + ' input[type=range], ' + s + ' input[type=checkbox]')].map(e => e.type === 'checkbox' ? e.checked : e.value).join()", sel)
                check(estado == estado2 and antes == despues, nombre + ': al cambiar de gráfico los valores y los mandos quedan igual')
                check(pg.locator(sel + ' .v-oculto').count() >= 1, nombre + ': los demás gráficos quedan escondidos')
            cortes = pg.evaluate("""s => [...document.querySelectorAll(s + ' .v-clave, ' + s + ' .v-vista')].flatMap(t => [t, ...t.querySelectorAll('*')].filter(e => getComputedStyle(e).textOverflow === 'ellipsis' || e.scrollWidth > e.clientWidth + 1 || (e.scrollHeight > e.clientHeight + 1 && getComputedStyle(e).overflow !== 'visible')).map(e => e.tagName))""", sel)
            check(not cortes, nombre + ': ni la tira ni los botones cortan su texto', cortes)
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
    pg.locator(sel + ' [role=tab]:has-text("Ruedas")').first.click()
    ranges = pg.locator(sel + ' [role=tabpanel]:visible input[type=range]')
    check(ranges.count() >= 1, 'cinematica: el panel Ruedas trae sus deslizadores a la vista')
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
