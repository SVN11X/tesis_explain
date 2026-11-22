"""Diagramas animados: el ciclo del robot (problema.html), el flujo de datos de Nav2 (navegacion.html) y la
energía y las señales (robot.html). Revisa montaje, pasos, pausa, teclado, vista angosta, movimiento reducido,
tema oscuro y la figura original de la tesis.
Uso: python3 tests/navegador_diagramas.py
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
    pg.wait_for_load_state('load')
    sel = '[data-vis="%s"]' % visual
    pg.locator(sel).scroll_into_view_if_needed()
    pg.wait_for_selector(sel + ' svg.dv-svg', timeout=15000)
    return pg, sel, errores


def estado(pg, sel):
    return pg.evaluate('s => document.querySelector(s).estadoDiagrama()', sel)


def sin_desborde(pg):
    return pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth')


with sync_playwright() as pw:
    nav = pw.chromium.launch()
    for nombre, opts in (('escritorio', {'viewport': {'width': 1280, 'height': 800}}),
                         ('teléfono', {'viewport': {'width': 360, 'height': 740}}),
                         ('oscuro', {'viewport': {'width': 1280, 'height': 800}, 'color_scheme': 'dark'})):
        print('Diagramas animados, ' + nombre)
        ctx = nav.new_context(**opts)
        vista = 'angosta' if opts['viewport']['width'] < 700 else 'ancha'

        pg, sel, errores = abrir(ctx, 'problema.html', 'ciclo-robot')
        check(estado(pg, sel)['vista'] == vista, '%s: el ciclo usa la vista %s' % (nombre, vista))
        check(pg.locator(sel + ' .dv-etapa').count() == 4, '%s: el ciclo tiene cuatro etapas' % nombre)
        check(pg.locator(sel + ' .vis-fallback').count() == 1, '%s: el ciclo conserva el párrafo de texto' % nombre)
        t0 = estado(pg, sel)['t']
        pg.wait_for_timeout(700)
        check(estado(pg, sel)['t'] > t0, '%s: el recorrido avanza solo' % nombre)
        pg.locator(sel + ' .dv-etapa').nth(2).focus()
        pg.keyboard.press('Enter')
        e = estado(pg, sel)
        t1 = e['t']
        pg.wait_for_timeout(500)
        check(e['seleccionada'] == 2 and estado(pg, sel)['t'] == t1, '%s: elegir una etapa con el teclado detiene el recorrido en ella' % nombre)
        check('El explorador elige una frontera' in pg.locator(sel + ' .dv-info').inner_text(), '%s: se muestra la explicación de la etapa' % nombre)
        check(pg.locator(sel + ' .dv-info a[href="exploracion.html"]').count() == 1, '%s: la etapa enlaza a su tema' % nombre)
        check(pg.locator(sel + ' .dv-pausa').inner_text() == 'Seguir el recorrido', '%s: el botón ofrece seguir el recorrido' % nombre)
        pg.locator(sel + ' .dv-pausa').click()
        pg.wait_for_timeout(400)
        check(estado(pg, sel)['seleccionada'] == -1 and estado(pg, sel)['t'] > t1, '%s: seguir el recorrido lo reanuda' % nombre)
        pg.locator(sel + ' .dv-pausa').click()
        t2 = estado(pg, sel)['t']
        pg.wait_for_timeout(500)
        check(estado(pg, sel)['pausado'] and estado(pg, sel)['t'] == t2, '%s: la pausa detiene el movimiento' % nombre)
        check(sin_desborde(pg), '%s: problema.html no tiene desplazamiento horizontal' % nombre)
        check(not errores, '%s: problema.html sin errores de JavaScript' % nombre, errores)

        pg, sel, errores = abrir(ctx, 'navegacion.html', 'flujo-nav2')
        check(estado(pg, sel)['vista'] == vista, '%s: Nav2 usa la vista %s' % (nombre, vista))
        check(pg.locator(sel + ' .dv-nodo').count() == 16, '%s: Nav2 dibuja los 16 componentes' % nombre)
        check(pg.locator(sel + ' .dv-pasos .vbtn').count() == 4, '%s: Nav2 tiene los cuatro pasos' % nombre)
        pg.wait_for_timeout(2500)
        e = estado(pg, sel)
        check(e['paquetes'] > 0 and e['llegan'] > 0 and e['llegan'] <= e['enPaso'], '%s: viajan paquetes y se iluminan las aristas del paso' % nombre, e)
        pg.locator(sel + ' .dv-pasos .vbtn').nth(2).click()
        check('Se envía la velocidad' in pg.locator(sel + ' .dv-paso').inner_text(), '%s: el paso 3 narra el envío de la velocidad' % nombre)
        check(estado(pg, sel)['enPaso'] == 6, '%s: el paso 3 enciende seis aristas' % nombre)
        pg.locator(sel + ' .dv-nodo').nth(7).focus()
        pg.keyboard.press('Space')
        check('controller_server' in pg.locator(sel + ' .dv-nodo-info').inner_text(), '%s: un componente elegido con el teclado explica qué hace' % nombre)
        pg.locator(sel + ' .dv-pausa').click()
        pg.locator(sel + ' .dv-pasos .vbtn').nth(3).click()
        e = estado(pg, sel)
        check(e['pausado'] and e['llegan'] == e['enPaso'] == 4, '%s: en pausa el paso se ve completo y quieto' % nombre, e)
        check(pg.locator('#d-nav2-original').evaluate('d => d.open') is False, '%s: la figura original empieza plegada' % nombre)
        pg.locator(sel + ' a[href="#d-nav2-original"]').click()
        check(pg.locator('#d-nav2-original').evaluate('d => d.open') is True, '%s: el enlace abre la figura original de la tesis' % nombre)
        check(sin_desborde(pg), '%s: navegacion.html no tiene desplazamiento horizontal' % nombre)
        check(not errores, '%s: navegacion.html sin errores de JavaScript' % nombre, errores)

        pg, sel, errores = abrir(ctx, 'robot.html', 'energia-senales')
        check(estado(pg, sel)['vista'] == vista, '%s: las conexiones usan la vista %s' % (nombre, vista))
        botones = pg.locator(sel + ' .dv-pasos .vbtn')
        check(botones.count() == 2 and botones.nth(0).inner_text() == 'Energía' and botones.nth(1).inner_text() == 'Señales', '%s: el interruptor Energía / Señales existe' % nombre)
        check(estado(pg, sel)['enPaso'] == 9, '%s: la energía enciende nueve cables' % nombre)
        botones.nth(1).click()
        check(estado(pg, sel)['paso'] == 1 and estado(pg, sel)['enPaso'] == 6, '%s: las señales encienden seis cables' % nombre)
        check(pg.locator('#esquema, [data-vis="esquema"]').count() >= 1 and pg.locator('[data-vis="esquema"]').count() == 1, '%s: la figura de Fritzing con sus puntos sigue en la página' % nombre)
        check(sin_desborde(pg), '%s: robot.html no tiene desplazamiento horizontal' % nombre)
        check(not errores, '%s: robot.html sin errores de JavaScript' % nombre, errores)
        ctx.close()

    print('Diagramas animados, movimiento reducido')
    ctx = nav.new_context(viewport={'width': 1280, 'height': 800}, reduced_motion='reduce')
    pg, sel, errores = abrir(ctx, 'navegacion.html', 'flujo-nav2')
    pg.wait_for_timeout(1500)
    e = estado(pg, sel)
    check(e['paquetes'] == 0 and e['llegan'] == e['enPaso'] > 0, 'reducido: Nav2 muestra el paso completo y sin paquetes', e)
    check(pg.locator(sel + ' .dv-pausa').is_hidden(), 'reducido: no hay botón de pausa porque nada se mueve')
    pg, sel, errores = abrir(ctx, 'problema.html', 'ciclo-robot')
    t0 = estado(pg, sel)['t']
    pg.wait_for_timeout(1200)
    check(estado(pg, sel)['t'] == t0 == 0, 'reducido: el ciclo queda quieto')
    pg.locator(sel + ' .dv-etapa').nth(1).click()
    check(estado(pg, sel)['seleccionada'] == 1, 'reducido: se puede elegir una etapa y leerla')
    ctx.close()
    nav.close()

print('Diagramas animados: %d comprobaciones, todas ok' % count)
if server:
    server.shutdown()
