"""robot.html: resumen por sección con el detalle plegado, a 360 px de ancho.
Uso: python herramientas/pruebas_robot_navegador.py
Inicia su propio servidor local. Requiere Playwright/Chromium solo para las pruebas, no para el sitio.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import os, re, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
BASE = 'http://localhost:%d' % server.server_port
count = 0
ALTURA_ANTES = 22105  # alto de robot.html a 360 x 740 px antes de plegarlo, medido con el mismo recorrido
PALABRAS_ANTES = 3175  # palabras visibles de robot.html antes de plegarlo


def check(cond, text, detalle=None):
    global count
    count += 1
    assert cond, text + ('' if detalle is None else '  ' + str(detalle))
    print('  ok   ' + text)


PALABRAS = r"""() => { let n = 0; const it = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
  while (it.nextNode()) { const e = it.currentNode.parentElement;
    if (!e || ['SCRIPT', 'STYLE'].includes(e.tagName) || (e.closest('details:not([open])') && !e.closest('summary')) || e.getClientRects().length === 0) continue;
    n += it.currentNode.textContent.trim().split(/\s+/).filter(Boolean).length; } return n; }"""

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(viewport={'width': 360, 'height': 740}, is_mobile=True, has_touch=True)
    ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body=''))
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

    p.goto(BASE + '/robot.html')
    check(p.locator('main p.resumen').count() >= 10, '360 px: cada sección larga tiene un resumen corto')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => !d.open)"), '360 px: el detalle de cada resumen parte plegado')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => d.querySelector(':scope > summary').textContent.trim().startsWith('Ver el detalle:'))"), '360 px: cada detalle dice qué esconde')
    check(p.evaluate("[...document.querySelectorAll('main [data-vis], main table, main figure')].every(v => !v.closest('details.detalle[id^=d-]'))"), '360 px: ningún interactivo, tabla ni figura quedó dentro de un detalle de resumen')
    cerrada = altura(p)
    palabras = p.evaluate(PALABRAS)
    p.evaluate("document.querySelectorAll('main details.detalle').forEach(d => d.open = true)")
    p.wait_for_timeout(300)
    abierta = p.evaluate('document.documentElement.scrollHeight')
    print('  altura a 360 px: plegada %d px (%.1f pantallas, %.1f %% de antes), con todo abierto %d px, antes %d px' % (cerrada, cerrada / 740, 100.0 * cerrada / ALTURA_ANTES, abierta, ALTURA_ANTES))
    print('  palabras visibles plegada: %d, antes %d' % (palabras, PALABRAS_ANTES))
    check(cerrada < abierta, '360 px: plegada la página es más corta que con todo abierto')
    check(cerrada <= ALTURA_ANTES * 0.85, '360 px: plegada mide como mucho el 85 %% de antes (%d px contra %d px)' % (cerrada, ALTURA_ANTES))
    check(palabras <= PALABRAS_ANTES * 0.75, '360 px: plegada muestra como mucho el 75 %% de las palabras de antes (%d contra %d)' % (palabras, PALABRAS_ANTES))
    # un ancla hacia contenido plegado lo abre y lo muestra
    for destino in ('d-lidar', 'd-protocolo', 'd-costo'):
        p.goto(BASE + '/robot.html#' + destino)
        p.wait_for_timeout(700)
        r = p.evaluate("""(id) => { const el = document.getElementById(id), rc = el.getBoundingClientRect(), d = el.closest('details.detalle');
          return { abierto: !d || !!d.open, arriba: rc.top, alto: innerHeight }; }""", destino)
        check(r['abierto'] and r['arriba'] < r['alto'], '360 px: el ancla #%s abre el detalle plegado y lo deja a la vista' % destino)
    # un cambio de ancla en la misma página también lo abre
    p.goto(BASE + '/robot.html')
    p.wait_for_timeout(300)
    p.evaluate("location.hash = 'd-energia'")
    p.wait_for_timeout(500)
    check(p.evaluate("document.getElementById('d-energia').open"), '360 px: cambiar el ancla abre el detalle')
    # un resultado del buscador cuyo texto está plegado abre el detalle de su sección
    p.goto(BASE + '/robot.html')
    p.wait_for_timeout(300)
    check(not p.evaluate("document.getElementById('d-lidar').open"), '360 px: sin búsqueda el detalle sigue plegado')
    p.evaluate("document.querySelector('.search-trigger').click()")
    p.wait_for_selector('dialog.search-dialog[open]')
    p.fill('dialog.search-dialog input', 'Cada barrido lleva la hora en que se publicó')
    p.wait_for_timeout(600)
    p.locator('.search-results a[href*="robot.html#"]').first.click()
    p.wait_for_timeout(900)
    r = p.evaluate("() => ({ hash: location.hash, abierto: !!document.querySelector('main details.detalle[open]') })")
    check(r['abierto'], '360 px: un resultado del buscador abre el texto plegado de su sección (%s)' % r['hash'])
    ctx.close()
    # sin JavaScript el detalle se abre a mano y los interactivos siguen con su respaldo
    sin = browser.new_context(viewport={'width': 360, 'height': 740}, java_script_enabled=False)
    q = sin.new_page()
    q.goto(BASE + '/robot.html')
    q.locator('#d-lidar > summary').click()
    check(q.locator('#d-lidar').get_attribute('open') is not None, 'sin JavaScript: el detalle se abre a mano')
    check(q.locator('[data-vis=costo] .vis-fallback').is_visible(), 'sin JavaScript: el respaldo del gráfico de costo sigue visible')
    sin.close()
    # las cifras y referencias de la tesis siguen en la página, y los resúmenes no inventan ninguna
    cmp_ = subprocess.run([sys.executable, str(ROOT / 'herramientas' / 'comparar_resumen.py'), 'robot'], capture_output=True, text=True, encoding='utf-8', env=dict(os.environ, PYTHONUTF8='1'))
    lineas = cmp_.stdout.strip().splitlines()
    print('  ' + lineas[0])
    check(cmp_.returncode == 0, 'ninguna cifra ni referencia a la tesis desapareció y los resúmenes no inventan cifras: ' + lineas[-1])
    browser.close()
server.shutdown()
print('\n%d comprobaciones de robot.html correctas' % count)
