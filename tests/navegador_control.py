"""Capítulo 4: interacción, unidades, teclado, móvil, tema oscuro y movimiento reducido.
Uso: python3 tests/navegador_control.py
Sin argumento inicia su propio servidor local; con argumento usa esa URL base.
Requiere Playwright/Chromium y beautifulsoup4 solo para las pruebas, no para el sitio.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler
from servidor import iniciar, DIST
from functools import partial
from threading import Thread
import math, os, re, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = None
if len(sys.argv) > 1:
    BASE = sys.argv[1].rstrip('/')
else:
    server, BASE = iniciar()
count = 0
ALTURA_ANTES = 57075  # alto de control.html a 360 x 740 px antes de plegarlo, medido con el mismo recorrido
ALTURA_PRIMERA = 49612  # alto tras la primera pasada (resumen con todas las figuras a la vista)
# El reto de «Ajusta un PID» sube la página plegada de 41620 a 42386 px (+766 px) a 360 px: sigue bajo el 88 % de ALTURA_PRIMERA (43659 px).


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
        ctx.route(re.compile(r'^https?://(?!localhost|127\.0\.0\.1)'), lambda r: r.fulfill(status=200, body=''))
        p = ctx.new_page()
        errors = []
        p.on('pageerror', lambda e: errors.append(str(e)))
        p.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        p.goto(BASE + '/control.html')
        p.locator('main details').evaluate_all('nodes => nodes.forEach(n => n.open=true)')
        visuales = ['lazo-rueda', 'estacionario', 'tiempo', 'leyes', 'papeles', 'cancelacion', 'acumulador', 'ciclo', 'truncamiento', 'windup', 'zonas', 'fopdt', 'pso', 'resolucion', 'estabilidad']
        for v in visuales + ['pid', 'enjambre', 'reto-control']:
            p.locator('[data-vis="%s"]' % v).scroll_into_view_if_needed()
            p.wait_for_selector('[data-vis="%s"][data-montado="1"]' % v)
        check(not errors, name + ': los %d interactivos del capítulo montan sin errores' % (len(visuales) + 3))
        # ── Reto de «Ajusta un PID»: respuesta inmediata, teclado y regiones aria-live ──
        reto = '[data-vis=reto-control]'
        check(p.locator(reto + ' input[type=radio]').count() == 6 and p.locator(reto + ' [aria-live=polite]').count() == 3, name + ': el reto usa radios nativos y regiones aria-live')
        p.locator(reto + ' input[name=ct-reto-0]').nth(2).check()
        r0 = p.locator(reto + ' [data-reto-r="0"]')
        check(r0.get_attribute('data-ok') == 'false' and 'Todavía no' in r0.inner_text() and 'velocidad' in r0.inner_text(), name + ': confundir velocidad con error explica por qué')
        check(r0.locator('a[href="#sim-pid"]').count() == 1, name + ': la respuesta enlaza a la sección')
        p.locator(reto + ' input[name=ct-reto-0]').nth(0).check()
        check(r0.get_attribute('data-ok') == 'true' and 'Correcto' in r0.inner_text() and '0,13 / (1 + 0,000913 · 1200)' in r0.inner_text(), name + ': la respuesta correcta muestra la fórmula de la página')
        p.locator(reto + ' input[name=ct-reto-1]').nth(1).check()
        check(p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'false' and '1 de 2' in p.locator(reto + ' [data-reto-fin]').inner_text(), name + ': el resumen cuenta 1 de 2')
        p.locator(reto + ' input[name=ct-reto-1]').nth(0).check()
        check('2 de 2 correctas' in p.locator(reto + ' [data-reto-fin]').inner_text() and '0,27 s' in p.locator(reto + ' [data-reto-r="1"]').inner_text(), name + ': el reto resume 2 de 2 con las cifras de la página')
        check(p.locator('#reto-pid').evaluate("el => !el.closest('details')"), name + ': el reto está en la parte visible, no en un detalle plegado')
        check(p.evaluate("() => document.querySelector('#reto-pid').getBoundingClientRect().right <= document.documentElement.clientWidth + 1"), name + ': el reto cabe en el ancho')
        if not options.get('has_touch'):
            p.locator(reto + ' input[name=ct-reto-1]').nth(1).focus()
            p.keyboard.press('ArrowUp')
            check(p.locator(reto + ' input[name=ct-reto-1]').nth(0).is_checked() and p.locator(reto + ' [data-reto-r="1"]').get_attribute('data-ok') == 'true', name + ': con las flechas del teclado se responde y la respuesta queda escrita')
            check(p.locator(reto + ' input[name=ct-reto-1]').nth(0).evaluate("el => el.matches(':focus-visible')"), name + ': el foco del teclado es visible en el reto')
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), name + ': no hay desborde horizontal')
        check(p.locator('[data-vis][data-montado] .vis-fallback').count() == 0, name + ': no quedan errores de montaje o fallbacks visibles')
        ancho = p.locator('[data-vis="lazo-rueda"] .lr-dibujo').evaluate('el => el.clientWidth')
        check(p.locator('[data-vis="lazo-rueda"] .lr-angosto').count() == (1 if ancho < 620 else 0), name + ': el lazo usa la disposición %s' % ('vertical' if ancho < 620 else 'horizontal'))
        check(p.locator('[data-vis="lazo-rueda"] .lr-dim').count() == 0 and 'ticks/ciclo' in text_of(p, 'lazo-rueda') and 'PWM ±255' in text_of(p, 'lazo-rueda') and 'm/s' in text_of(p, 'lazo-rueda'), name + ': el lazo nombra la unidad de cada señal')
        p.locator('[data-vis="lazo-rueda"] [data-paso="2"]').click()
        check('40 − 36 = 4 ticks/ciclo' in text_of(p, 'lazo-rueda') and p.locator('[data-vis="lazo-rueda"] .lr-caja.lr-on').count() == 2 and p.locator('[data-vis="lazo-rueda"] .lr-dim').count() > 0, name + ': la etapa Comparar resalta referencia y suma, y atenúa el resto')
        p.locator('[data-vis="lazo-rueda"] [data-paso="4"]').click()
        check('L298N' in text_of(p, 'lazo-rueda') and p.locator('[data-vis="lazo-rueda"] [data-paso="4"][aria-pressed="true"]').count() == 1, name + ': la etapa Aplicar queda marcada como seleccionada')
        check(p.locator('[data-vis="pid"] [data-p="p"][aria-pressed="true"]').count() == 1 and p.locator('[data-vis="pid"] [data-o="ley-ant"]').is_hidden(), name + ': el PID parte de un ejemplo marcado y sin curva anterior')
        p.locator('[data-vis="pid"] [data-p="pi"]').click()
        check(p.locator('[data-vis="pid"] [data-o="ley-ant"]').is_visible() and 'antes: P 1200' in text_of(p, 'pid') and 'Comparado con la curva gris' in text_of(p, 'pid'), name + ': al cambiar de ejemplo queda la curva anterior con sus valores')
        estado = p.locator('[data-vis="pid"]').evaluate('el => el.estadoSim()')
        check(estado['actual']['err'] < estado['anterior']['err'], name + ': el PI reduce el error estacionario respecto de solo P')
        p.locator('[data-vis="pid"] [data-a="borrar"]').click()
        check(p.locator('[data-vis="pid"] [data-o="ley-ant"]').is_hidden(), name + ': se puede quitar la curva anterior')
        for _ in range(5):
            p.locator('[data-vis="enjambre"] [data-a="paso"]').click()
        check('5 de 60' in text_of(p, 'enjambre') and '0,92' in text_of(p, 'enjambre'), name + ': el enjambre informa generación y peso de inercia')
        p.locator('[data-vis="enjambre"] [data-a="reset"]').click()
        check('0 de 60' in text_of(p, 'enjambre') and '1,00' in text_of(p, 'enjambre'), name + ': reiniciar el enjambre restaura generación y peso')
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
        check(p.locator('[data-vis=acumulador] .aw-graf svg').count() == 1 and 'pedido 1221 PWM' in text_of(p, 'acumulador'), name + ': el bloqueo dibuja cómo crece cada memoria y marca el ciclo elegido')
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
        check('Sigue en ±255 PWM durante' in before, name + ': windup mide cuánto sigue el motor en el tope tras liberar')
        p.locator('#wu-aw').check()
        after = p.locator('[data-vis=windup] .wu-res').inner_text()
        check(before != after and 'Baja del tope en el mismo ciclo' in after, name + ': agregar antiwindup al PID tradicional cambia el pico y el tiempo en el tope')
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
        check('0,131 m/s' in text_of(p, 'fopdt') and '0,3291 s' in text_of(p, 'fopdt') and 'Prácticamente cero' in text_of(p, 'fopdt'), name + ': el modelo izquierdo muestra valor final, τ y retardo')
        p.locator('[data-vis=fopdt] [data-rueda=der]').click()
        check('0,127 m/s' in text_of(p, 'fopdt') and '0,0692 s' in text_of(p, 'fopdt') and '2,1 ciclos' in text_of(p, 'fopdt'), name + ': el modelo derecho expresa su retardo en ciclos de control')
        set_range(p, '#fo-pwm', 40)
        check('zona muerta' in p.locator('[data-vis=fopdt] .fo-aviso').inner_text(), name + ': con PWM bajo se advierte que el modelo no tiene zona muerta')
        check(p.locator('[data-vis=pso] .ganancia-par').count() == 6 and '12,48' in text_of(p, 'pso') and '16,00' in text_of(p, 'pso') and '7500' in text_of(p, 'pso'), name + ': los seis pares incluyen los valores PSO y finales')
        p.locator('[data-vis=resolucion] [data-caso=giro]').click()
        check(p.locator('[data-vis=resolucion] .lleno').count() == 10 and '20,0 %' in text_of(p, 'resolucion'), name + ': el giro muestra diez ticks y el peso relativo de la banda')
        set_range(p, '#re-v', .135)
        check('Después · dos decimales\n0,14 m/s' in text_of(p, 'resolucion'), name + ': el dato publicado cambia al cruzar el umbral de redondeo')
        check(p.locator('[data-vis=resolucion] .re-muestras li').count() == 10 and '0,128 m/s' in text_of(p, 'resolucion'), name + ': se explica el promedio con diez muestras etiquetadas como ejemplo')
        check(not errors, name + ': todos los cambios de controles terminaron sin errores')
        check(p.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), name + ': sigue sin desborde después de interactuar')
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

    p.goto(BASE + '/control.html')
    check(p.locator('main p.resumen').count() >= 15, '360 px: cada sección larga tiene un resumen corto')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => !d.open)"), '360 px: el detalle de cada resumen parte plegado')
    check(p.evaluate("[...document.querySelectorAll('main details.detalle[id^=d-]')].every(d => d.querySelector(':scope > summary').textContent.trim().startsWith('Ver el detalle:'))"), '360 px: cada detalle dice qué esconde')
    cerrada = altura(p)
    p.evaluate("document.querySelectorAll('main details.detalle').forEach(d => d.open = true)")
    p.wait_for_timeout(300)
    abierta = p.evaluate('document.documentElement.scrollHeight')
    print('  altura a 360 px: plegada %d px (%.1f pantallas), con todo abierto %d px' % (cerrada, cerrada / 740, abierta))
    check(cerrada < abierta, '360 px: plegada la página es más corta que con todo abierto')
    # el reto de control (#67) suma unos 800 px visibles a propósito, sobre el 74 % que dejó plegar las fuentes y «Mundo real»
    check(cerrada < ALTURA_PRIMERA * 0.77, '360 px: tras la segunda pasada, con el reto, la página mide menos del 77 %% de la primera (%d px contra %d px)' % (cerrada, ALTURA_PRIMERA))
    # un ancla hacia el contenido plegado lo abre y lo muestra
    for destino in ('d-no-lineal', 'windup-tecnico', 'ciclo'):
        p.goto(BASE + '/control.html#' + destino)
        p.wait_for_timeout(700)
        r = p.evaluate("""(id) => { const el = document.getElementById(id), rc = el.getBoundingClientRect();
          return { abierto: !!el.closest('details').open, arriba: rc.top, alto: innerHeight }; }""", destino)
        check(r['abierto'] and r['arriba'] < r['alto'], '360 px: el ancla #%s abre el detalle plegado y lo deja a la vista' % destino)
    # una cita #fN abre la lista de fuentes plegada y deja la entrada a la vista
    p.goto(BASE + '/control.html')
    p.wait_for_timeout(300)
    check(not p.evaluate("document.getElementById('lista-fuentes').open"), '360 px: la lista de fuentes parte plegada')
    p.evaluate("document.querySelector('a.ref[href=\"#f8\"]').click()")
    p.wait_for_timeout(700)
    r = p.evaluate("""() => { const el = document.getElementById('f8'), rc = el.getBoundingClientRect();
      return { abierto: document.getElementById('lista-fuentes').open, visible: rc.height > 0 && rc.top < innerHeight && rc.bottom > 0 }; }""")
    check(r['abierto'] and r['visible'], '360 px: una cita #f8 abre la lista de fuentes plegada y muestra la entrada')
    # otro cambio de ancla y un enlace de la página también lo abren
    p.goto(BASE + '/control.html')
    p.wait_for_timeout(300)
    p.evaluate("location.hash = 'd-barrido'")
    p.wait_for_timeout(500)
    check(p.evaluate("document.getElementById('d-barrido').open"), '360 px: cambiar el ancla abre el detalle')
    p.goto(BASE + '/control.html')
    p.wait_for_timeout(300)
    p.evaluate("""() => { const a = document.createElement('a'); a.href = '#d-pso-script'; a.id = 'prueba-enlace'; a.textContent = 'x'; document.querySelector('main').prepend(a); }""")
    p.evaluate("document.getElementById('prueba-enlace').click()")
    p.wait_for_timeout(500)
    check(p.evaluate("document.getElementById('d-pso-script').open"), '360 px: un enlace de la página abre el detalle')
    # un resultado del buscador cuyo texto está plegado abre el detalle de su sección
    p.goto(BASE + '/control.html')
    p.wait_for_timeout(300)
    check(not p.evaluate("document.getElementById('d-no-lineal').open"), '360 px: sin búsqueda el detalle sigue plegado')
    p.evaluate("document.querySelector('.search-trigger').click()")
    p.wait_for_selector('dialog.search-dialog[open]')
    p.fill('dialog.search-dialog input', 'estado integral cargado error de 3 e integral de 2')
    p.wait_for_timeout(600)
    p.locator('.search-results a[href$="control.html#no-lineal"]').first.click()
    p.wait_for_timeout(900)
    r = p.evaluate("() => ({ hash: location.hash, abierto: document.getElementById('d-no-lineal').open })")
    check(r['abierto'], '360 px: un resultado del buscador abre el texto plegado de su sección (%s)' % r['hash'])
    ctx.close()
    # sin JavaScript el detalle se abre a mano
    sin = browser.new_context(viewport={'width': 360, 'height': 740}, java_script_enabled=False)
    q = sin.new_page()
    q.goto(BASE + '/control.html')
    q.locator('#d-barrido > summary').click()
    check(q.locator('#d-barrido').get_attribute('open') is not None,'sin JavaScript: el detalle se abre a mano')
    check(q.locator('[data-vis=reto-control] .vis-fallback').is_visible() and not q.locator('[data-vis=reto-control] details p').is_visible(), 'sin JavaScript: el reto muestra la pregunta y esconde la respuesta')
    q.locator('[data-vis=reto-control] details > summary').click()
    check('0,13 / (1 + 0,000913 · 1200)' in q.locator('[data-vis=reto-control] details p').inner_text(), 'sin JavaScript: la respuesta del reto se abre en un details')
    sin.close()
    # las cifras y referencias de la tesis siguen en la página, y los resúmenes no inventan ninguna
    cmp_ = subprocess.run([sys.executable, str(ROOT / 'scripts' / 'comparar_resumen.py'), 'control'], capture_output=True, text=True, encoding='utf-8', env=dict(os.environ, PYTHONUTF8='1'))
    lineas = cmp_.stdout.strip().splitlines()
    print('  ' + lineas[0])
    check(cmp_.returncode == 0, 'ninguna cifra ni referencia a la tesis desapareció y los resúmenes no inventan cifras: ' + lineas[-1])
    browser.close()
if server:
    server.shutdown()
print('\n%d comprobaciones del capítulo 4 correctas' % count)
