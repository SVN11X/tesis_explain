"""Robustez, accesibilidad y objetos nuevos en Chromium real, bajo /tesis_explain/.
Uso: python3 herramientas/pruebas_robustez_navegador.py
Solo desarrollo: Playwright + Chromium. Sin dependencias de visitantes.

Comprueba: que la cabecera, el pie y los interactivos sobrevivan a un datos/proyecto.js
ausente y a un navegador sin MediaQueryList.addEventListener; que las tablas anchas se puedan
recorrer con teclado en un teléfono; que el aviso académico sea discreto en móvil; las lecturas
por regla del simulador PID; el mapa armado desde las poses del grafo; y los respaldos y el
estado académico generados sin JavaScript.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import re

ROOT = Path(__file__).resolve().parents[1]


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT.parent)))
Thread(target=server.serve_forever, daemon=True).start()
BASE = 'http://localhost:%d/%s' % (server.server_port, ROOT.name)
EXTERNO = re.compile(r'^https?://(?!localhost)')
count = 0


def check(condition, name, detail=''):
    global count
    count += 1
    assert condition, name + ('  ' + str(detail) if detail else '')
    print('  ok   ' + name)


def recorrer(p):
    """Baja por la página para que se monten los interactivos diferidos."""
    h = p.evaluate('document.body.scrollHeight'); y = 0
    while y < h:
        p.evaluate('window.scrollTo(0,%d)' % y); p.wait_for_timeout(40); y += 900
        h = p.evaluate('document.body.scrollHeight')
    p.wait_for_timeout(200)


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. Sin datos/proyecto.js: la navegación y los respaldos siguen ahí.
    ctx = browser.new_context(viewport=dict(width=1366, height=900), reduced_motion='reduce')
    ctx.route(EXTERNO, lambda r: r.fulfill(status=200, body=''))
    ctx.route('**/datos/proyecto.js', lambda r: r.fulfill(status=404, body=''))
    for pagina in ['index.html', 'control.html', 'mapeo.html', 'recursos.html']:
        p = ctx.new_page(); errores = []
        p.on('pageerror', lambda e: errores.append(str(e)))
        p.goto(BASE + '/' + pagina); recorrer(p)
        check(p.locator('#cabecera .cab').count() == 1 and p.locator('#pie footer').count() == 1, pagina + ' sin proyecto.js: cabecera y pie presentes')
        check(not errores, pagina + ' sin proyecto.js: sin excepciones sin capturar', errores)
        check(p.locator('.aviso-academico').is_visible(), pagina + ' sin proyecto.js: el aviso estático sigue visible')
        if pagina == 'control.html':
            check(p.locator('[data-vis=pid] .vis-error').count() == 1 and p.locator('[data-vis=pid] img[src$="pid-respaldo.svg"]').count() == 1,
                  'control.html sin proyecto.js: el simulador PID conserva su figura de respaldo y ofrece reintento')
        p.close()
    ctx.close()

    # 2. MediaQueryList sin addEventListener (Safari anterior a 14, donde no hereda de EventTarget):
    #    se simula envolviendo matchMedia en un objeto que solo ofrece addListener.
    ctx = browser.new_context(viewport=dict(width=1366, height=900))
    ctx.route(EXTERNO, lambda r: r.fulfill(status=200, body=''))
    ctx.add_init_script('''(() => { const orig = window.matchMedia.bind(window);
      window.matchMedia = q => { const m = orig(q); return { get matches() { return m.matches; }, media: m.media, addListener: f => m.addListener(f), removeListener: f => m.removeListener(f) }; }; })();''')
    for pagina in ['mapeo.html', 'navegacion.html', 'index.html']:
        p = ctx.new_page(); errores = []
        p.on('pageerror', lambda e: errores.append(str(e)))
        p.goto(BASE + '/' + pagina); recorrer(p)
        check(p.locator('[data-vis][data-montado]').count() == p.locator('[data-vis]').count() and p.locator('#cabecera .cab').count() == 1, pagina + ': sin addEventListener en MediaQueryList se montan cabecera e interactivos')
        check(not errores and p.locator('[data-error-vis]').count() == 0, pagina + ': sin addEventListener en MediaQueryList no hay excepciones ni respaldos por error', errores)
        p.close()
    ctx.close()

    # 3. Teléfono: tablas anchas desplazables con teclado y aviso académico discreto.
    ctx = browser.new_context(viewport=dict(width=390, height=844), is_mobile=True, has_touch=True)
    ctx.route(EXTERNO, lambda r: r.fulfill(status=200, body=''))
    p = ctx.new_page()
    for pagina in ['control.html', 'navegacion.html', 'robot.html', 'mapeo.html', 'resultados.html']:
        p.goto(BASE + '/' + pagina); recorrer(p)
        datos = p.evaluate('''() => [...document.querySelectorAll('.tabla-env')].filter(e => !e.closest('[hidden]') && e.offsetParent && e.scrollWidth > e.clientWidth + 1)
            .map(e => ({foco: e.tabIndex === 0, rol: e.getAttribute('role'), nombre: e.getAttribute('aria-label') || ''}))''')
        check(all(d['foco'] and d['rol'] == 'region' and d['nombre'] for d in datos), pagina + ': %d tablas desbordadas, todas enfocables y con nombre' % len(datos), datos)
        alto = p.evaluate("document.querySelector('.aviso-academico').getBoundingClientRect().height")
        check(alto <= 80, pagina + ': aviso académico discreto en teléfono (%d px)' % alto)
    p.goto(BASE + '/control.html'); recorrer(p)
    env = p.locator('.tabla-env[data-desplazable]').first
    env.scroll_into_view_if_needed(); env.focus(); p.keyboard.press('ArrowRight'); p.keyboard.press('ArrowRight'); p.wait_for_timeout(200)
    check(env.evaluate('e => e.scrollLeft') > 0, 'Con el foco en una tabla ancha, las flechas la desplazan')
    p.set_viewport_size(dict(width=1366, height=900)); p.wait_for_timeout(400)
    check(p.locator('.tabla-env[data-desplazable]').count() < p.evaluate("document.querySelectorAll('.tabla-env').length"), 'En escritorio las tablas que caben dejan de ser una parada de foco')
    ctx.close()

    # 4. Simulador PID: lecturas por regla con condición y cálculo.
    ctx = browser.new_context(viewport=dict(width=1366, height=900), reduced_motion='reduce')
    ctx.route(EXTERNO, lambda r: r.fulfill(status=200, body=''))
    p = ctx.new_page(); errores = []
    p.on('pageerror', lambda e: errores.append(str(e)))
    p.goto(BASE + '/control.html'); box = p.locator('[data-vis=pid]'); box.scroll_into_view_if_needed(); p.wait_for_selector('[data-vis=pid][data-montado]')
    reglas = box.evaluate('el => el.estadoSim().reglas')
    check(reglas == ['error-sin-integral', 'no-llega'], 'Solo P: lectura del error permanente', reglas)
    check('0,13 / (1 + 0,000913 · 1200) = 0,062 m/s' in box.locator('.pid-lectura').inner_text() and box.locator('[data-o=err]').inner_text() == '0,062 m/s', 'La fórmula de la lectura coincide con el error del gráfico')
    box.locator('[data-p=agr]').click()
    reglas = box.evaluate('el => el.estadoSim().reglas')
    check('integral-elimina' in reglas and 'sobreimpulso' in reglas, 'PI agresivo: la lectura explica el error nulo y el sobreimpulso', reglas)
    box.locator('[data-c=zona]').check()
    check('integral-elimina' in box.evaluate('el => el.estadoSim().reglas'), 'Con zona muerta la integral sigue anulando el error')
    box.locator('[data-p=p]').click()
    check(box.evaluate('el => el.estadoSim().reglas')[0] == 'zona-sin-integral', 'Solo P con zona muerta cambia de regla, porque la fórmula ya no aplica')
    check(box.locator('.pid-lectura li small').first.inner_text().startswith('Regla:'), 'Cada lectura muestra su condición')
    check(not errores, 'Simulador PID sin errores JavaScript', errores)
    ctx.close()

    # 5. Grafo de poses: mapa armado desde las poses, antes y después de optimizar.
    for nombre, opciones in [('escritorio', dict(viewport=dict(width=1366, height=900))), ('320px', dict(viewport=dict(width=320, height=740), is_mobile=True, has_touch=True)), ('oscuro', dict(viewport=dict(width=1366, height=900), color_scheme='dark'))]:
        ctx = browser.new_context(reduced_motion='reduce', **opciones)
        ctx.route(EXTERNO, lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page(); errores = []
        p.on('pageerror', lambda e: errores.append(str(e)))
        p.goto(BASE + '/mapeo.html'); box = p.locator('[data-vis=lazo]'); box.scroll_into_view_if_needed(); p.wait_for_selector('[data-vis=lazo][data-montado]')
        check(box.locator('.mp-obs-ini').count() > 10 and box.locator('.mp-obs-fin').count() > 10, nombre + ': el mapa muestra las paredes vistas desde la pose 0 y la 12')
        antes = box.evaluate('el => el.estadoSim().mapa')
        check(box.locator('[data-mapa-read="0"]').inner_text() == '17,7 cm' and 'Paredes dobladas' in box.locator('[data-mapa-info]').inner_text(), nombre + ': antes del cierre la misma pared aparece dos veces')
        box.locator('[data-paso="2"]').click()
        despues = box.evaluate('el => el.estadoSim().mapa')
        check(despues['inicioRegreso'] < antes['inicioRegreso'] and despues['dispersion'] < antes['dispersion'], nombre + ': optimizar junta las paredes y baja la dispersión')
        check(box.locator('[data-mapa-read="2"]').inner_text() == '2,15 m' and 'parece cerrado' in box.locator('[data-mapa-info]').inner_text(), nombre + ': el mapa cerrado conserva el error de escala y la lectura lo dice')
        check(box.locator('[data-read="2"]').inner_text() == '19,1 cm' and box.locator('[data-read="3"]').inner_text() == '0,18', nombre + ': las lecturas previas del grafo no cambian')
        box.locator('#mp-grafo-mapa').uncheck()
        check(box.locator('.mp-obs').count() == 0 and box.locator('[data-bloque-mapa]').is_hidden() and box.locator('[data-ley-mapa]').first.is_hidden(), nombre + ': ocultar el mapa quita puntos, lecturas y leyenda')
        box.get_by_text('Experimentar con la deriva del ejemplo', exact=True).click(); box.locator('[data-restablecer-grafo]').click()
        check(box.locator('#mp-grafo-mapa').is_checked() and box.evaluate('el => el.estadoSim().verMapa'), nombre + ': restablecer vuelve a mostrar el mapa')
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), nombre + ': sin desborde horizontal')
        check(not errores, nombre + ': grafo sin errores JavaScript', errores)
        ctx.close()

    # 6. Sin JavaScript: figura de respaldo del PID y estado académico generado desde JSON.
    ctx = browser.new_context(java_script_enabled=False, viewport=dict(width=390, height=844))
    p = ctx.new_page(); p.goto(BASE + '/control.html')
    img = p.locator('[data-vis=pid] img')
    img.scroll_into_view_if_needed(); p.wait_for_timeout(300)
    check(img.evaluate('i => i.complete && i.naturalWidth > 0') and '0,062 m/s' in p.locator('[data-respaldo-pid]').inner_text(), 'Sin JS: el PID muestra su figura y sus cifras')
    for pagina in ['control.html', 'navegacion.html', 'mapeo.html']:
        p.goto(BASE + '/' + pagina)
        ficha = p.locator('details.ficha-concepto')
        ficha.locator('summary').click()
        etiquetas = ficha.locator('dt').all_inner_texts()
        check(etiquetas == ['Qué es', 'Para qué sirve', 'Cómo funciona', 'Dónde verlo', 'Ejemplo numérico', 'En este robot', 'Límites'], 'Sin JS: ' + pagina + ' ofrece su ficha del concepto en siete pasos', etiquetas)
    p.goto(BASE + '/recursos.html#estado-academico')
    lista = p.locator('.estado-pendientes li')
    check(lista.count() >= 3 and p.locator('.estado-pendientes a[href="preguntas.html#p-giro"]').count() == 1, 'Sin JS: pendientes del autor enlazados a su pregunta')
    check(p.locator('.estado-historial li').count() >= 2 and p.locator('.estado-dl dd').first.inner_text().startswith('octubre de 2026'), 'Sin JS: historial y versión del documento visibles')
    ctx.close()

    browser.close()
server.shutdown()
print('\n%d comprobaciones de robustez y objetos nuevos correctas' % count)
