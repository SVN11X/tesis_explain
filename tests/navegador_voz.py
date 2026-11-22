"""Botón «Escuchar» de los resúmenes de la guía en Chromium real, bajo /tesis_explain/.
Uso, desde la raíz del repositorio (compila antes con npm run build):
    pip install playwright beautifulsoup4 && python3 -m playwright install chromium
    python3 tests/navegador_voz.py

Comprueba que cada p.resumen tenga su botón, que no se pida ningún audio ni el manifiesto antes de pulsar, que el audio
pregrabado suene, se pause y siga, que suene uno solo a la vez, que un resumen sin audio o un archivo ausente muestren un
error con salida, el teclado, 360 px, los dos temas y el movimiento reducido. Chromium de Playwright no decodifica AAC,
así que el elemento Audio se simula con una clase que pide el archivo de verdad y responde según su estado HTTP.
"""
import json
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from servidor import iniciar

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import voz_natural as voz

PAGINA = 'control.html'
count = 0

AUDIO_FALSO = """
(() => {
  const A = window.__AU = {reproducidos: [], creados: []};
  class FakeAudio extends EventTarget {
    constructor() { super(); this.paused = true; this.ended = false; this.currentTime = 0; this.duration = 10; this.src = ''; A.creados.push(this); }
    removeAttribute() { this.src = ''; }
    load() {}
    play() {
      this.paused = false;
      return fetch(this.src, {cache: 'no-store'}).then(r => {
        if (!r.ok) throw new Error('http ' + r.status);
        A.reproducidos.push(this.src);
        this.dispatchEvent(new Event('playing'));
        this.currentTime = 2.5;
        this.dispatchEvent(new Event('timeupdate'));
      }).catch(e => { this.paused = true; this.dispatchEvent(new Event('error')); throw e; });
    }
    pause() { if (this.paused) return; this.paused = true; this.dispatchEvent(new Event('pause')); }
    terminar() { this.paused = true; this.ended = true; this.dispatchEvent(new Event('ended')); }
  }
  window.Audio = FakeAudio;
})();
"""


def check(condition, name, detail=''):
    global count
    count += 1
    assert condition, name + ('  ' + str(detail) if detail else '')
    print('  ok   ' + name)


def clave_de(pagina_html, indice):
    from bs4 import BeautifulSoup
    sopa = BeautifulSoup((ROOT / 'public' / pagina_html).read_text(encoding='utf-8'), 'html.parser')
    p = sopa.select('p.resumen')[indice]
    for a in p.select('a.ref'):
        a.decompose()
    return 'r-' + voz.huella(voz.normalizar_visible(p.get_text()))


MANIFIESTO = json.loads((ROOT / 'public/audio/manifiesto.json').read_text(encoding='utf-8'))
server, BASE = iniciar()
pw_cm = sync_playwright()
pw = pw_cm.start()
browser = pw.chromium.launch()


def abrir(ctx):
    pg = ctx.new_page()
    pg.errores = []
    pg.on('pageerror', lambda e: pg.errores.append(str(e)))
    pg.goto(BASE + '/' + PAGINA)
    pg.wait_for_selector('.voz-fila', state='attached', timeout=15000)
    return pg


def contexto(**kw):
    ctx = browser.new_context(**kw)
    ctx.add_init_script(AUDIO_FALSO)
    return ctx


# 1. Botones, nada se pide antes de pulsar, reproducir, pausar y seguir.
ctx = contexto(viewport=dict(width=1280, height=900))
peticiones = []
ctx.on('request', lambda r: peticiones.append(r.url))
pg = abrir(ctx)
n_resumenes = pg.locator('p.resumen').count()
check(n_resumenes > 0 and pg.locator('.voz-fila .voz-boton').count() == n_resumenes, 'cada resumen tiene su botón Escuchar', n_resumenes)
check(not [u for u in peticiones if '/audio/' in u], 'al cargar la página no se pide ni el manifiesto ni ningún audio', [u for u in peticiones if '/audio/' in u])
check(pg.locator('.voz-fila .voz-nota:visible').count() == 1 and pg.locator('.voz-fila .voz-nota').first.inner_text() == 'Voz sintética, generada con Qwen3-TTS',
      'la página avisa una vez, junto al primer botón, que la voz es sintética')
clave = clave_de(PAGINA, 0)
check(clave in MANIFIESTO['entradas'], 'el primer resumen de control está en el piloto', clave)
b0 = pg.locator('.voz-fila .voz-boton').nth(0)
check(b0.inner_text().strip() == 'Escuchar' and b0.locator('svg.ph').count() == 1, 'el botón dice Escuchar y lleva el ícono de altavoz')
check(pg.locator('p.resumen').nth(0).locator('button').count() == 0, 'el botón no entra en el texto del resumen')
b0.click()
pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Pausar")')
check(pg.evaluate('__AU.reproducidos.length') == 1 and MANIFIESTO['entradas'][clave]['archivo'] in pg.evaluate('__AU.reproducidos[0]'), 'pulsar pide el archivo de ese resumen')
check('Voz sintética' in pg.locator('.voz-estado').first.inner_text(), 'mientras suena el resumen lo dice otra vez')
check(pg.evaluate('document.querySelectorAll(".voz-barra")[0].hidden') is False and pg.evaluate('document.querySelectorAll(".voz-barra")[0].value') > 0, 'muestra el avance')
b0.click()
pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Seguir")')
check(pg.locator('.voz-estado').first.inner_text() == 'En pausa', 'en pausa lo dice')
b0.click()
pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Pausar")')
pg.evaluate('__AU.creados[__AU.creados.length - 1].terminar()')
pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Escuchar")')
check(pg.evaluate('document.querySelectorAll(".voz-barra")[0].hidden'), 'al terminar vuelve a Escuchar y oculta el avance')
check(not pg.errores, 'sin errores de JavaScript', pg.errores)

# 2. Un resumen sin audio avisa. Con dos resúmenes con audio, suena uno solo a la vez.
clave1 = clave_de(PAGINA, 1)
check(clave1 not in MANIFIESTO['entradas'], 'el segundo resumen de control aún no tiene audio en el piloto')
b1 = pg.locator('.voz-fila .voz-boton').nth(1)
b1.click()
pg.wait_for_function('document.querySelectorAll(".voz-estado")[1].textContent.includes("todavía no tiene audio")')
check(b1.is_enabled() and not pg.errores, 'sin audio lo dice, el botón sigue disponible y no hay errores', pg.errores)
ctx.close()

ctx = contexto(viewport=dict(width=1280, height=900))
doble = json.loads(json.dumps(MANIFIESTO))
doble['entradas'][clave1] = doble['entradas'][clave]
ctx.route('**/audio/manifiesto.json', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(doble)))
pg = abrir(ctx)
b0 = pg.locator('.voz-fila .voz-boton').nth(0)
b1 = pg.locator('.voz-fila .voz-boton').nth(1)
b0.click()
pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Pausar")')
b1.click()
pg.wait_for_function('document.querySelectorAll(".voz-boton")[1].textContent.includes("Pausar")')
check(pg.evaluate('document.querySelectorAll(".voz-boton")[0].textContent.includes("Escuchar")'), 'al pedir otro audio el primero se detiene, suena uno solo')
check(pg.evaluate('__AU.creados.filter(a => !a.paused).length') == 1, 'solo un audio activo a la vez')
ctx.close()

# 3. Archivo ausente: error con salida, y al volver el archivo suena.
ctx = contexto(viewport=dict(width=1280, height=900))
ctx.route('**/audio/' + MANIFIESTO['entradas'][clave]['archivo'], lambda r: r.fulfill(status=404, body='no existe'))
pg = abrir(ctx)
b0 = pg.locator('.voz-fila .voz-boton').nth(0)
b0.click()
pg.wait_for_selector('.voz-fila.voz-error')
check('No se pudo reproducir' in pg.locator('.voz-estado').first.inner_text() and b0.inner_text().strip() == 'Reintentar' and b0.is_enabled(),
      'si el archivo falta dice qué pasó y ofrece Reintentar', pg.locator('.voz-estado').first.inner_text())
ctx.unroute('**/audio/' + MANIFIESTO['entradas'][clave]['archivo'])
b0.click()
pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Pausar")')
check(not pg.locator('.voz-fila.voz-error').count(), 'Reintentar funciona cuando el archivo vuelve')
ctx.close()

# 4. Manifiesto ausente: error con salida.
ctx = contexto(viewport=dict(width=1280, height=900))
ctx.route('**/audio/manifiesto.json', lambda r: r.fulfill(status=404, body='no existe'))
pg = abrir(ctx)
pg.locator('.voz-fila .voz-boton').nth(0).click()
pg.wait_for_selector('.voz-fila.voz-error')
check('No se pudo cargar el audio' in pg.locator('.voz-estado').first.inner_text(), 'sin manifiesto dice que no se pudo cargar el audio')
ctx.close()

# 5. Teclado, 360 px, temas y movimiento reducido.
for tema in ('light', 'dark'):
    ctx = contexto(viewport=dict(width=360, height=740), color_scheme=tema, reduced_motion='reduce')
    pg = abrir(ctx)
    b0 = pg.locator('.voz-fila .voz-boton').nth(0)
    b0.focus()
    outline = pg.evaluate('getComputedStyle(document.activeElement).outlineStyle')
    check(outline != 'none', 'el foco del botón se ve (%s)' % tema, outline)
    pg.keyboard.press('Enter')
    pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Pausar")')
    pg.keyboard.press('Space')
    pg.wait_for_function('document.querySelectorAll(".voz-boton")[0].textContent.includes("Seguir")')
    check(True, 'Enter inicia y Espacio pausa con el teclado (%s)' % tema)
    check(pg.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), 'sin desplazamiento horizontal a 360 px (%s)' % tema)
    caja = b0.bounding_box()
    check(caja['width'] >= 24 and caja['height'] >= 24, 'el botón mide 24 px o más (%s)' % tema, caja)
    ctx.close()

browser.close()
pw.stop()
server.shutdown()
print('\n%d comprobaciones del botón Escuchar correctas' % count)
