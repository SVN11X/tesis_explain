"""Panel de práctica de defensa oral en Chromium real, bajo /tesis_explain/.
Uso, desde la raíz del repositorio:
    pip install playwright beautifulsoup4 && python3 -m playwright install chromium
    python3 herramientas/pruebas_defensa_navegador.py

Comprueba, con la dirección del servicio vacía: que js/defensa-oral.js no se pida antes del primer clic, que el
diálogo se cierre con Escape y con Cerrar y devuelva el foco, que se conserven los filtros y el desplazamiento, los
modos Entrenar y Simular, la revisión antes de enviar, la guía cuando no hay servicio y que no salga ninguna
llamada a la red. Con un servicio simulado por Playwright comprueba cada respuesta del contrato (7.3 de
docs/defensa/especificacion.md). También prueba 320 px de ancho, el teclado solo y los dos temas.
datos/defensa/catalogo.json lo simula la prueba, porque lo genera otra unidad.
"""
import json
import re
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
API = 'https://api.test'
VERSION = 'v-prueba-1'
UNICA = ('3.63', 'p-dos-errores')       # una sola pregunta visible, con guía
NO_EVALUABLE = ('444643', 'p-costo')    # una sola pregunta visible, sin rúbrica aprobada en el catálogo simulado
CORS = {'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization',
        'access-control-allow-methods': 'GET, POST', 'access-control-expose-headers': 'Retry-After'}


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
count = 0

SOUP = BeautifulSoup((ROOT / 'preguntas.html').read_text(encoding='utf-8'), 'html.parser')
TARJETAS = SOUP.select('details.pregunta')
CATALOGO = {'version': VERSION, 'total': len(TARJETAS), 'pendientes': [],
            'preguntas': [{'id': d['id'], 'evaluable': d['data-respuesta'] == 'guia' and d['id'] != NO_EVALUABLE[1]} for d in TARJETAS]}
GUIA_UNICA = re.sub(r'\s+', ' ', SOUP.select_one('#' + UNICA[1] + ' .q-cuerpo p').get_text(' ')).strip()[:40]


def check(condition, name, detail=''):
    global count
    count += 1
    assert condition, name + ('  ' + str(detail) if detail else '')
    print('  ok   ' + name)


class Servicio:
    """Servicio simulado. Cada envío toma la siguiente respuesta de `envios`. Con `retener` la deja pendiente."""

    def __init__(self):
        self.peticiones = []
        self.envios = []
        self.sondeos = []
        self.retenidas = []

    def manejar(self, route, req):
        ruta = req.url[len(API):]
        self.peticiones.append({'metodo': req.method, 'ruta': ruta, 'cab': req.headers, 'cuerpo': req.post_data})
        if req.method == 'OPTIONS':
            return route.fulfill(status=204, headers=CORS)
        if ruta == '/v1/sesiones':
            return route.fulfill(status=201, headers=CORS, content_type='application/json', body=json.dumps({'token': 'id.firma', 'vence': 9999999999999}))
        lista = self.sondeos if req.method == 'GET' else self.envios
        r = lista.pop(0) if len(lista) > 1 or (lista and req.method == 'POST') else (lista[0] if lista else {'status': 500})
        if r.get('retener'):
            self.retenidas.append((route, r))
            return None
        return self.responder(route, r)

    def responder(self, route, r):
        if r.get('abortar'):
            return route.abort()
        cuerpo = r.get('texto') if 'texto' in r else json.dumps(r.get('json', {}))
        return route.fulfill(status=r.get('status', 200), headers=dict(CORS, **r.get('cab', {})), content_type='application/json', body=cuerpo)

    def liberar(self):
        route, r = self.retenidas.pop(0)
        self.responder(route, r)

    def envios_reales(self):
        return [q for q in self.peticiones if q['metodo'] == 'POST' and q['ruta'] == '/v1/evaluaciones']


def evaluada(**extra):
    d = {'estado': 'evaluada', 'veredicto': 'parcial', 'request_id': 'x', 'question_id': UNICA[1], 'version_catalogo': VERSION, 'version_rubrica': 1,
         'criterios': [{'id': 'C1', 'estado': 'presente', 'texto': 'El mapa quedó verificado.', 'fragmento': 'mapa', 'fuente': 'resultados.html#palabras'},
                       {'id': 'C2', 'estado': 'ausente', 'texto': 'Faltó medir la navegación.', 'fragmento': None, 'fuente': 'resultados.html#palabras'}],
         'acierto': 'C1', 'mejorar': 'C2', 'pista': 'Di cómo mediste el desempeño.'}
    d.update(extra)
    return {'json': d}


def no_evaluable(causa):
    return {'json': {'estado': 'no_evaluable', 'causa': causa, 'request_id': 'x', 'question_id': UNICA[1], 'version_catalogo': VERSION}}


def contexto(browser, api=None, catalogo=True, ancho=1280, alto=900, servicio=None, **kw):
    ctx = browser.new_context(viewport=dict(width=ancho, height=alto), **kw)
    ctx.route(re.compile(r'^https?://(?!localhost)(?!api\.test)'), lambda r: r.fulfill(status=200, body=''))
    if api:
        ctx.route('**/js/defensa-config.js', lambda r: r.fulfill(status=200, content_type='text/javascript',
                  body='window.DEFENSA_CONFIG = {api: "%s", sondeoMs: 100, plazoMs: 700};' % api))
        servicio = servicio or Servicio()
        ctx.route(API + '/**', servicio.manejar)
    if catalogo:
        ctx.route('**/datos/defensa/catalogo.json', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(CATALOGO)))
    else:
        ctx.route('**/datos/defensa/catalogo.json', lambda r: r.fulfill(status=404, body='no existe'))
    return ctx, servicio


def pagina(ctx):
    p = ctx.new_page()
    p.errores = []
    p.on('pageerror', lambda e: p.errores.append(str(e)))
    p.on('console', lambda m: p.errores.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    p.goto(BASE + '/preguntas.html')
    p.wait_for_selector('#q-defensa')
    return p


def filtrar(p, termino):
    p.fill('#q-buscar', termino)
    p.wait_for_timeout(300)


def abrir(p):
    p.click('#q-defensa')
    p.wait_for_selector('dialog.dv-dialogo[open] .dv-modos')


def boton(p, nombre):
    return p.locator('dialog.dv-dialogo').get_by_role('button', name=nombre, exact=True)


def escribir_y_enviar(p, texto):
    p.locator('dialog.dv-dialogo textarea:visible').fill(texto)
    boton(p, 'Revisar antes de enviar').click()
    boton(p, 'Confirmar').click()


def entrenar_con(p, termino, texto='Mi respuesta de prueba.'):
    filtrar(p, termino)
    abrir(p)
    boton(p, 'Entrenar').click()
    escribir_y_enviar(p, texto)


def resultado(p):
    p.wait_for_timeout(250)
    return p.locator('dialog.dv-dialogo .dv-resultado').inner_text() if p.locator('dialog.dv-dialogo .dv-resultado .dv-res').count() else ''


def esperar_resultado(p):
    p.wait_for_selector('dialog.dv-dialogo .dv-resultado .dv-res', timeout=5000)
    return p.locator('dialog.dv-dialogo .dv-resultado').inner_text()


def foco_llega(p, condicion, ms=3000):
    """El evento close del diálogo llega en la tarea siguiente: se espera la condición, no un tiempo fijo."""
    try:
        p.wait_for_function('() => { const e = document.activeElement; return !!e && (%s); }' % condicion, timeout=ms)
        return True
    except Exception:
        return False


def cerrar(p):
    p.keyboard.press('Escape')
    p.wait_for_selector('dialog.dv-dialogo:not([open])', state='attached')


def sin_desborde(p):
    return p.evaluate('''() => { const d = document.querySelector("dialog.dv-dialogo");
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1 && d.scrollWidth <= d.clientWidth + 1; }''')


with sync_playwright() as pw:
    browser = pw.chromium.launch()

    # 1. Sin servicio: carga diferida, cierre, foco, filtros y desplazamiento.
    print('Sin servicio: apertura y cierre')
    ctx, _ = contexto(browser)
    visto = []
    ctx.on('request', lambda r: visto.append(r.url))
    p = pagina(ctx)
    p.wait_for_timeout(300)
    check(not any('defensa-oral.js' in u for u in visto), 'js/defensa-oral.js no se pide antes del primer clic')
    check(not any('catalogo.json' in u for u in visto), 'el catálogo tampoco se pide antes del primer clic')
    check(p.locator('#q-defensa').inner_text() == 'Practicar defensa oral' and p.evaluate('!document.querySelector("#q-defensa").closest("[id^=descarga]")'),
          'el botón #q-defensa está en la fila de acciones')
    p.fill('#q-buscar', 'costo'); p.wait_for_timeout(300)
    p.click('#q-nivel button[data-n="tecnica"]')
    estado = p.evaluate("document.getElementById('q-herramientas').estadoPreguntas()")
    p.fill('#q-buscar', ''); p.wait_for_timeout(300)
    p.click('#q-nivel button[data-n="todos"]')
    p.evaluate('window.scrollTo(0, 1800)'); p.wait_for_timeout(200)
    p.click('#q-temas .chip[data-tema="control"]')
    antes = p.evaluate("document.getElementById('q-herramientas').estadoPreguntas()")
    p.evaluate('window.scrollTo(0, 1800)')
    y0 = p.evaluate('scrollY')
    p.evaluate("document.getElementById('q-defensa').click()")   # sin que Playwright desplace la página
    p.wait_for_selector('dialog.dv-dialogo[open] .dv-modos')
    check(any('defensa-oral.js' in u for u in visto), 'js/defensa-oral.js se pide al primer clic')
    check(p.evaluate('window.DefensaOral && typeof window.DefensaOral.abrir') == 'function', 'expone DefensaOral.abrir')
    d = p.locator('dialog.dv-dialogo')
    check(d.get_attribute('aria-labelledby') == 'dv-titulo' and p.inner_text('#dv-titulo') != '', 'el diálogo tiene su título enlazado con aria-labelledby')
    check(p.locator('dialog.dv-dialogo [role=status]').count() == 1, 'hay una región role=status')
    cerrar(p)
    check(foco_llega(p, 'e.id === "q-defensa"'), 'Escape cierra y el foco vuelve a #q-defensa')
    check(p.evaluate('scrollY') == y0, 'el desplazamiento no cambia al abrir y cerrar', (y0, p.evaluate('scrollY')))
    despues = p.evaluate("document.getElementById('q-herramientas').estadoPreguntas()")
    check(despues == antes and despues['tema'] == 'control', 'los filtros se conservan', (antes, despues))
    p.evaluate("document.getElementById('q-defensa').click()")
    p.wait_for_selector('dialog.dv-dialogo[open] .dv-modos')
    boton(p, 'Cerrar').click()
    p.wait_for_selector('dialog.dv-dialogo:not([open])', state='attached')
    check(foco_llega(p, 'e.id === "q-defensa"'), 'Cerrar cierra y el foco vuelve a #q-defensa')
    check(p.evaluate('scrollY') == y0, 'el desplazamiento se conserva tras Cerrar')
    p.evaluate("document.getElementById('q-defensa').click()")
    p.wait_for_selector('dialog.dv-dialogo[open] .dv-modos')
    check('11 preguntas' in p.locator('dialog.dv-dialogo .dv-cuerpo').inner_text(), 'cuenta las tarjetas visibles con guía', p.locator('dialog.dv-dialogo .dv-cuerpo').inner_text()[:120])
    check(p.locator('dialog.dv-dialogo .dv-nota').inner_text().startswith('Este panel no tiene corrector'), 'sin servicio lo avisa en el primer paso')
    check(not p.errores, 'sin errores de JavaScript', p.errores)
    ctx.close()

    # 2. Sin servicio: Entrenar, revisión exacta, guía y borrador, y ninguna llamada a la red.
    print('Sin servicio: Entrenar')
    ctx, _ = contexto(browser)
    externas = []
    ctx.on('request', lambda r: externas.append(r.url) if not r.url.startswith('http://localhost') else None)
    voz = []
    ctx.add_init_script('window.DefensaVoz = {montar: function (o) { (window.__voz = window.__voz || []).push({ta: o.textarea.tagName, e: o.enunciado, c: o.contenedor.className, vacio: o.contenedor.childElementCount}); }};')
    p = pagina(ctx)
    filtrar(p, UNICA[0])
    abrir(p)
    boton(p, 'Entrenar').click()
    check(p.locator('dialog.dv-dialogo label[for]').count() == 1 and p.locator('dialog.dv-dialogo textarea').count() == 1, 'cada pregunta tiene su textarea con su label')
    check(p.evaluate('window.__voz.length') == 1 and p.evaluate('window.__voz[0].c') == 'dv-voz' and p.evaluate('window.__voz[0].ta') == 'TEXTAREA' and p.evaluate('window.__voz[0].e').startswith('¿'),
          'llama a DefensaVoz.montar con textarea, enunciado y el contenedor .dv-voz', p.evaluate('window.__voz'))
    check(p.locator('dialog.dv-dialogo .dv-voz').count() == 1 and boton(p, 'Seguir solo con la guía').count() == 1, 'hay un .dv-voz vacío y «Seguir solo con la guía» junto al envío')
    boton(p, 'Revisar antes de enviar').click()
    check('Escribe tu respuesta' in p.inner_text('dialog.dv-dialogo .dv-estado'), 'no deja revisar un borrador vacío')
    texto = '  Primera línea con tilde: sí.\n\nSegunda <b>línea</b>  '
    p.locator('dialog.dv-dialogo textarea').fill(texto)
    boton(p, 'Revisar antes de enviar').click()
    check(p.locator('dialog.dv-dialogo .dv-texto').evaluate('e => e.textContent') == texto, 'la revisión muestra el texto exacto')
    boton(p, 'Seguir editando').click()
    check(p.locator('dialog.dv-dialogo textarea').input_value() == texto and p.evaluate('document.activeElement.tagName') == 'TEXTAREA', 'Seguir editando vuelve al textarea con el borrador')
    boton(p, 'Revisar antes de enviar').click()
    boton(p, 'Confirmar').click()
    p.wait_for_selector('dialog.dv-dialogo .dv-guia')
    check(GUIA_UNICA in re.sub(r'\s+', ' ', p.locator('dialog.dv-dialogo .dv-guia').inner_text()), 'sin servicio abre la guía de esa pregunta')
    check(p.locator('dialog.dv-dialogo textarea').input_value() == texto, 'el borrador se conserva')
    check(p.locator('dialog.dv-dialogo .dv-guia [id]').count() == 0 and p.locator('dialog.dv-dialogo .dv-guia a[href^="#"]').count() == 0, 'la copia de la guía no repite ids ni enlaces internos')
    check(p.evaluate('document.querySelectorAll("#' + UNICA[1] + ' .q-cuerpo").length') == 1, 'la tarjeta de la página no cambia')
    check(not externas, 'con api vacía no sale ninguna llamada a la red', externas)
    check(p.evaluate('JSON.stringify([localStorage, sessionStorage])').count('Primera') == 0, 'lo escrito no se guarda en el navegador')
    check(not p.errores, 'sin errores de JavaScript', p.errores)
    ctx.close()

    # 3. Sin servicio: Simular, menos de tres preguntas y tres preguntas.
    print('Sin servicio: Simular')
    ctx, _ = contexto(browser)
    p = pagina(ctx)
    p.click('#q-temas .chip[data-tema="movimiento"]')
    p.click('#q-nivel button[data-n="tecnica"]')
    abrir(p)
    boton(p, 'Simular').click()
    cuerpo = p.locator('dialog.dv-dialogo .dv-cuerpo').inner_text()
    check('hay 2' in cuerpo and boton(p, 'Ampliar a todos los temas').count() == 1 and boton(p, 'Practicar con 2').count() == 1 and boton(p, 'Seguir solo con la guía').count() == 1,
          'con menos de tres dice cuántas hay y ofrece sus tres salidas', cuerpo)
    boton(p, 'Seguir solo con la guía').click()
    check(p.locator('dialog.dv-dialogo .dv-guia').count() == 2, '«Seguir solo con la guía» muestra la guía de las dos')
    boton(p, 'Volver al inicio').click()
    boton(p, 'Simular').click()
    boton(p, 'Practicar con 2').click()
    check('Pregunta 1 de 2' in p.text_content('dialog.dv-dialogo .dv-paso'), 'Practicar con N hace una simulación de N')
    boton(p, 'Volver al inicio').count()
    cerrar(p)
    abrir(p)
    boton(p, 'Simular').click()
    boton(p, 'Ampliar a todos los temas').click()
    check('Pregunta 1 de 3' in p.text_content('dialog.dv-dialogo .dv-paso'), 'Ampliar a todos los temas quita solo el filtro de tema')
    ids = []
    for i in range(3):
        check(p.locator('dialog.dv-dialogo .dv-pregunta:visible').count() == 1, 'Simular muestra una pregunta a la vez (%d)' % (i + 1))
        ids.append(p.locator('dialog.dv-dialogo .dv-pregunta:visible .dv-enunciado').inner_text())
        escribir_y_enviar(p, 'Respuesta %d' % (i + 1))
    check(len(set(ids)) == 3, 'las tres preguntas son distintas', ids)
    p.wait_for_selector('dialog.dv-dialogo .dv-guia')
    check(p.locator('dialog.dv-dialogo .dv-guia').count() == 3 and '0 de 3' in p.inner_text('dialog.dv-dialogo .dv-cuerpo'), 'sin servicio muestra la guía de las tres')
    check(p.evaluate('document.activeElement.closest("dialog") !== null'), 'el foco sigue dentro del diálogo')
    check(p.evaluate('document.querySelector("#q-temas .chip[aria-pressed=true]").dataset.tema') == 'movimiento', 'la página conserva su filtro de tema')
    ctx.close()

    # 4. Con servicio simulado: Entrenar y cada respuesta del contrato.
    print('Con servicio: Entrenar y contrato')
    ctx, s = contexto(browser, api=API)
    p = pagina(ctx)
    s.envios = [dict(evaluada(), retener=True)]
    entrenar_con(p, UNICA[0], 'Respuesta con valor exacto.')
    for _ in range(40):
        if s.retenidas:
            break
        p.wait_for_timeout(50)
    check(len(s.retenidas) == 1 and boton(p, 'Confirmar').is_disabled(), 'el botón de envío está desactivado mientras espera')
    boton(p, 'Confirmar').click(force=True)
    p.wait_for_timeout(150)
    check(len(s.retenidas) == 1 and len(s.envios_reales()) == 1, 'un segundo clic no envía dos veces')
    s.liberar()
    txt = esperar_resultado(p)
    reales = s.envios_reales()
    cuerpo = json.loads(reales[0]['cuerpo'])
    check([q['ruta'] for q in s.peticiones if q['metodo'] == 'POST'][0] == '/v1/sesiones', 'crea la sesión antes del primer envío')
    check(set(cuerpo) == {'request_id', 'question_id', 'version_catalogo', 'modo', 'respuesta'} and cuerpo['question_id'] == UNICA[1] and cuerpo['modo'] == 'entrenar'
          and cuerpo['version_catalogo'] == VERSION and cuerpo['respuesta'] == 'Respuesta con valor exacto.'
          and re.fullmatch(r'[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', cuerpo['request_id']), 'el cuerpo cumple el contrato', cuerpo)
    check(reales[0]['cab'].get('authorization') == 'Bearer id.firma', 'envía el token como Bearer')
    check('Respuesta parcial' in txt and 'El mapa quedó verificado.' in txt and 'Faltó medir la navegación.' in txt and 'Di cómo mediste' in txt, '200 evaluada muestra veredicto, acierto, mejora y pista', txt)
    check(p.locator('dialog.dv-dialogo .dv-fuentes a[href="resultados.html#palabras"]').count() == 1, 'enlaza la fuente una sola vez')
    check('Intento 1 de 2' in p.text_content('dialog.dv-dialogo .dv-intento'), 'marca el intento 1 de 2')
    # segundo intento
    check(boton(p, 'Revisar antes de enviar').is_visible(), 'Entrenar permite un segundo intento')
    s.envios = [evaluada(veredicto='correcta', acierto='C1', mejorar=None)]
    escribir_y_enviar(p, 'Segundo intento.')
    p.wait_for_function('document.querySelector("dialog.dv-dialogo .dv-intento").textContent.includes("Intento 2")')
    check(json.loads(s.envios_reales()[1]['cuerpo'])['respuesta'] == 'Segundo intento.' and len(s.peticiones) and sum(1 for q in s.peticiones if q['ruta'] == '/v1/sesiones' and q['metodo'] == 'POST') == 1, 'el segundo envío reutiliza la sesión')
    check(not boton(p, 'Revisar antes de enviar').is_visible() and 'dos intentos' in p.inner_text('dialog.dv-dialogo .dv-resultado'), 'tras el segundo intento no hay un tercero')
    check('asistida' not in p.text_content('dialog.dv-dialogo .dv-resultado'), 'sin ver la guía, ningún intento es asistido')
    cerrar(p)

    # ver la guía marca los intentos siguientes
    s.envios = [evaluada()]
    entrenar_con(p, UNICA[0])
    esperar_resultado(p)
    boton(p, 'Ver la respuesta de la guía').click()
    check(p.locator('dialog.dv-dialogo .dv-guia').count() == 1, '«Ver la respuesta de la guía» revela la guía')
    s.envios = [evaluada()]
    escribir_y_enviar(p, 'Otro intento')
    p.wait_for_function('document.querySelector("dialog.dv-dialogo .dv-intento").textContent.includes("Intento 2")')
    check('práctica asistida' in p.text_content('dialog.dv-dialogo .dv-intento'), 'tras ver la guía el intento siguiente es práctica asistida')
    cerrar(p)

    # 200 no_evaluable, cada causa
    for causa, frase in [('disagreement', 'Las tres lecturas no coincidieron'), ('insufficient_evidence', 'evidencia suficiente'),
                         ('pending_guide', 'Pendiente de confirmación'), ('ai_unavailable', 'no está disponible'), ('quota_exhausted', 'cupo')]:
        s.envios = [no_evaluable(causa)]
        entrenar_con(p, UNICA[0])
        txt = esperar_resultado(p)
        check(frase in txt, '200 no_evaluable %s se explica en palabras' % causa, txt)
        check(boton(p, 'Ver la respuesta de la guía').count() == 1 or p.locator('dialog.dv-dialogo .dv-guia').count() == 1, 'no_evaluable %s ofrece la guía' % causa)
        check(boton(p, 'Revisar antes de enviar').is_visible(), 'no_evaluable %s permite reformular' % causa)
        cerrar(p)

    # 202 y sondeo
    s.envios = [{'status': 202, 'json': {'estado': 'en_curso'}}]
    s.sondeos = [{'status': 202, 'json': {'estado': 'en_curso'}}, evaluada(veredicto='incorrecta')]
    entrenar_con(p, UNICA[0])
    txt = esperar_resultado(p)
    gets = [q for q in s.peticiones if q['metodo'] == 'GET']
    rid = json.loads(s.envios_reales()[-1]['cuerpo'])['request_id']
    check('Respuesta incorrecta' in txt and len(gets) == 2 and gets[0]['ruta'] == '/v1/evaluaciones/' + rid and gets[0]['cab'].get('authorization') == 'Bearer id.firma', '202 consulta GET /v1/evaluaciones/<id> hasta tener resultado', [g['ruta'] for g in gets])
    cerrar(p)
    s.envios = [{'status': 202, 'json': {'estado': 'en_curso'}}]
    s.sondeos = [{'status': 202, 'json': {'estado': 'en_curso'}}]
    entrenar_con(p, UNICA[0], 'Borrador que sigue')
    txt = esperar_resultado(p)
    check('tarda más' in txt and p.locator('dialog.dv-dialogo .dv-guia').count() == 1 and p.locator('dialog.dv-dialogo textarea').input_value() == 'Borrador que sigue', '202 sin resultado dentro del plazo abre la guía y conserva el borrador', txt)
    cerrar(p)

    # 409, 410, 429
    casos = [({'status': 409, 'json': {'causa': 'version'}}, 'Recárgala', False), ({'status': 409, 'json': {'causa': 'contenido'}}, 'otro texto', False),
             ({'status': 410, 'json': {}}, 'La corrección caducó', False),
             ({'status': 429, 'json': {'estado': 'no_evaluable', 'causa': 'quota_exhausted'}, 'cab': {'Retry-After': '3600'}}, 'se reinicia a las', False)]
    for r, frase, guia in casos:
        s.envios = [r]
        entrenar_con(p, UNICA[0])
        txt = esperar_resultado(p)
        check(frase in txt, 'HTTP %d: %s' % (r['status'], frase), txt)
        check(p.locator('dialog.dv-dialogo .dv-guia').count() == 0 and p.locator('dialog.dv-dialogo textarea').input_value() == 'Mi respuesta de prueba.', 'HTTP %d conserva el borrador' % r['status'])
        cerrar(p)
    s.envios = [{'status': 429, 'json': {}}]
    entrenar_con(p, UNICA[0])
    check('Se agotó el cupo' in esperar_resultado(p) and 'se reinicia' not in p.inner_text('dialog.dv-dialogo .dv-resultado'), '429 sin Retry-After no inventa una hora')
    cerrar(p)

    # 5xx, red caída y JSON inválido: guía y borrador
    for nombre, r in [('5xx', {'status': 503, 'json': {'causa': 'ai_unavailable'}}), ('red caída', {'abortar': True}), ('JSON inválido', {'status': 200, 'texto': 'no es json'}),
                      ('estado desconocido', {'status': 200, 'json': {'estado': 'otra cosa'}})]:
        s.envios = [r]
        entrenar_con(p, UNICA[0], 'Mi borrador')
        p.wait_for_selector('dialog.dv-dialogo .dv-guia', timeout=5000)
        check(p.locator('dialog.dv-dialogo textarea').input_value() == 'Mi borrador' and GUIA_UNICA in re.sub(r'\s+', ' ', p.inner_text('dialog.dv-dialogo .dv-guia')), '%s abre la guía y conserva el borrador' % nombre)
        check(boton(p, 'Revisar antes de enviar').is_visible(), '%s permite volver a intentar' % nombre)
        cerrar(p)

    # pregunta no evaluable en el catálogo: sin envío
    previos = len(s.envios_reales())
    entrenar_con(p, NO_EVALUABLE[0])
    p.wait_for_selector('dialog.dv-dialogo .dv-guia')
    check('Pendiente de confirmación' in p.inner_text('dialog.dv-dialogo .dv-resultado') and len(s.envios_reales()) == previos, 'una pregunta no evaluable abre la guía sin enviar nada')
    cerrar(p)
    check(not p.errores, 'sin errores de JavaScript con servicio', p.errores)
    ctx.close()

    # 6. Con servicio: Simular y catálogo ausente.
    print('Con servicio: Simular y catálogo ausente')
    ctx, s = contexto(browser, api=API)
    p = pagina(ctx)
    s.envios = [evaluada(), no_evaluable('disagreement'), evaluada(veredicto='correcta')]
    p.click('#q-temas .chip[data-tema="control"]')
    abrir(p)
    boton(p, 'Simular').click()
    for i in range(3):
        escribir_y_enviar(p, 'Simulación %d' % (i + 1))
        if i < 2:
            p.wait_for_function('document.querySelector("dialog.dv-dialogo .dv-paso").textContent.includes("Pregunta %d")' % (i + 2))
            check(len(s.envios_reales()) == 0, 'Simular no envía nada antes de la tercera confirmación')
    p.wait_for_selector('dialog.dv-dialogo .dv-guia', timeout=5000)
    reales = s.envios_reales()
    check(len(reales) == 3 and all(json.loads(q['cuerpo'])['modo'] == 'simular' for q in reales) and len({json.loads(q['cuerpo'])['request_id'] for q in reales}) == 3, 'solicita las tres evaluaciones con modo simular y request_id distintos')
    txt = p.inner_text('dialog.dv-dialogo .dv-cuerpo')
    check('2 de 3' in txt and p.locator('dialog.dv-dialogo .dv-guia').count() == 1 and p.locator('dialog.dv-dialogo .dv-res').count() == 3, 'señala las evaluadas y ofrece la guía de las demás', txt[:200])
    ctx.close()

    ctx, s = contexto(browser, api=API, catalogo=False)
    p = pagina(ctx)
    entrenar_con(p, UNICA[0])
    p.wait_for_selector('dialog.dv-dialogo .dv-guia')
    check(len(s.peticiones) == 0 and not p.errores, 'sin catálogo trabaja solo con la guía y no llama al servicio', p.errores)
    ctx.close()

    # 7. 320 px sin desplazamiento horizontal.
    print('320 px')
    ctx, s = contexto(browser, api=API, ancho=320, alto=640)
    p = pagina(ctx)
    abrir(p)
    check(sin_desborde(p), '320 px: primer paso sin desplazamiento horizontal')
    boton(p, 'Entrenar').click()
    escribir_y_enviar(p, 'Una respuesta larga ' + 'x' * 300)
    p.wait_for_selector('dialog.dv-dialogo .dv-guia', timeout=5000)
    check(sin_desborde(p), '320 px: Entrenar con resultado y guía sin desplazamiento horizontal')
    s.envios = [evaluada()]
    cerrar(p)
    filtrar(p, UNICA[0])
    abrir(p)
    boton(p, 'Entrenar').click()
    p.locator('dialog.dv-dialogo textarea').fill('y' * 300)
    boton(p, 'Revisar antes de enviar').click()
    check(sin_desborde(p), '320 px: la revisión de un texto sin espacios no desborda')
    boton(p, 'Confirmar').click()
    esperar_resultado(p)
    check(sin_desborde(p), '320 px: el resultado sin desplazamiento horizontal')
    cerrar(p)
    p.fill('#q-buscar', ''); p.wait_for_timeout(300)
    abrir(p)
    boton(p, 'Simular').click()
    for i in range(3):
        escribir_y_enviar(p, 'z')
    p.wait_for_selector('dialog.dv-dialogo .dv-res', timeout=5000)
    check(sin_desborde(p), '320 px: el resumen de Simular sin desplazamiento horizontal')
    ok_botones = p.evaluate('''() => [...document.querySelectorAll("dialog.dv-dialogo button")].every(b => b.getBoundingClientRect().height >= 36 && b.getBoundingClientRect().right <= innerWidth + 1)''')
    check(ok_botones, '320 px: los botones caben y se pueden tocar')
    ctx.close()

    # 8. Solo teclado.
    print('Teclado')
    ctx, s = contexto(browser, api=API)
    p = pagina(ctx)
    filtrar(p, UNICA[0])
    s.envios = [evaluada()]
    p.focus('#q-defensa')
    p.keyboard.press('Enter')
    p.wait_for_selector('dialog.dv-dialogo[open] .dv-modos')
    check(p.evaluate('!!document.activeElement.closest("dialog")'), 'teclado: el foco entra en el diálogo')

    def tab_hasta(condicion, maximo=12):
        for _ in range(maximo):
            if p.evaluate(condicion):
                return True
            p.keyboard.press('Tab')
        return p.evaluate(condicion)
    check(tab_hasta('document.activeElement.textContent === "Entrenar"'), 'teclado: Tab llega a Entrenar')
    p.keyboard.press('Enter')
    check(tab_hasta('document.activeElement.tagName === "TEXTAREA"'), 'teclado: Tab llega al textarea')
    p.keyboard.type('Respuesta con el teclado')
    check(tab_hasta('document.activeElement.textContent === "Revisar antes de enviar"'), 'teclado: Tab llega a Revisar antes de enviar')
    p.keyboard.press('Enter')
    check(p.evaluate('document.activeElement.textContent') == 'Confirmar', 'teclado: la revisión pasa el foco a Confirmar')
    p.keyboard.press('Enter')
    esperar_resultado(p)
    check(json.loads(s.envios_reales()[0]['cuerpo'])['respuesta'] == 'Respuesta con el teclado', 'teclado: el envío lleva lo escrito')
    foco = p.evaluate('''() => { const e = document.activeElement; const c = getComputedStyle(e); return {dentro: !!e.closest("dialog"), contorno: c.outlineStyle !== "none" && parseFloat(c.outlineWidth) >= 2}; }''')
    check(foco['dentro'], 'teclado: tras el resultado el foco sigue dentro')
    p.keyboard.press('Tab')
    check(p.evaluate('(() => { const c = getComputedStyle(document.activeElement); return c.outlineStyle !== "none" && parseFloat(c.outlineWidth) >= 2; })()'), 'teclado: el foco tiene contorno visible')
    p.keyboard.press('Escape')
    p.wait_for_selector('dialog.dv-dialogo:not([open])', state='attached')
    check(foco_llega(p, 'e.id === "q-defensa"'), 'teclado: Escape devuelve el foco a #q-defensa')
    ctx.close()

    # 9. Los dos temas.
    print('Temas claro y oscuro')
    colores = {}
    for tema in ('light', 'dark'):
        ctx, _ = contexto(browser, color_scheme=tema)
        p = pagina(ctx)
        p.evaluate('document.documentElement.setAttribute("data-theme", "%s")' % tema)
        filtrar(p, UNICA[0])
        abrir(p)
        boton(p, 'Entrenar').click()
        escribir_y_enviar(p, 'Tema')
        p.wait_for_selector('dialog.dv-dialogo .dv-guia')
        c = p.evaluate('''() => { const d = document.querySelector("dialog.dv-dialogo"), g = getComputedStyle(d);
          const surface = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim();
          const t = getComputedStyle(d.querySelector("textarea"));
          return {fondo: g.backgroundColor, texto: g.color, surface: surface, area: t.backgroundColor, areaTexto: t.color}; }''')
        colores[tema] = c
        ctx.close()
    check(colores['light']['fondo'] != colores['dark']['fondo'] and colores['light']['texto'] != colores['dark']['texto'], 'el diálogo cambia de colores entre tema claro y oscuro', colores)
    check(colores['light']['fondo'] == 'rgb(248, 248, 242)' and colores['dark']['fondo'] == 'rgb(24, 33, 32)', 'usa --surface de cada tema', colores)
    check(colores['dark']['areaTexto'] != colores['dark']['area'] and colores['light']['areaTexto'] != colores['light']['area'], 'el borrador es legible en los dos temas')

    # 10. Voz (8 de la especificación) con simulacros: ni se descargan los 71 MB ni se usa un micrófono real.
    print('Voz: lectura, dictado externo y dictado privado')
    MANIFIESTO = {'bytes_total': 71127843, 'archivos': []}

    def fakes(sintesis=True, sr=True):
        return """
        (() => {
          const S = {voces: [], hablados: [], cancelados: 0, esc: {}};
          window.__S = S;
          if (%s) {
            const sy = {getVoices: () => S.voces,
              speak: u => { S.hablados.push({texto: u.text, voz: u.voice && u.voice.name}); S.ultimo = u; },
              cancel: () => { S.cancelados++; },
              addEventListener: (t, f) => { (S.esc[t] = S.esc[t] || []).push(f); },
              removeEventListener: (t, f) => { S.esc[t] = (S.esc[t] || []).filter(x => x !== f); }};
            Object.defineProperty(window, 'speechSynthesis', {value: sy, configurable: true});
            window.SpeechSynthesisUtterance = function (t) { this.text = t; };
            S.cambiar = v => { S.voces = v; (S.esc.voiceschanged || []).forEach(f => f(new Event('voiceschanged'))); };
          } else {
            Object.defineProperty(window, 'speechSynthesis', {value: undefined, configurable: true});
          }
          const R = {instancias: 0, starts: 0, stops: 0};
          window.__R = R;
          class SR { constructor() { R.instancias++; R.ultimo = this; } start() { R.starts++; } stop() { R.stops++; } }
          Object.defineProperty(window, 'SpeechRecognition', {value: %s ? SR : undefined, configurable: true});
          Object.defineProperty(window, 'webkitSpeechRecognition', {value: %s ? SR : undefined, configurable: true});
          const G = {llamadas: 0, pistasParadas: 0, negar: false};
          window.__G = G;
          Object.defineProperty(navigator, 'mediaDevices', {configurable: true, value: {getUserMedia: () => {
            G.llamadas++;
            if (G.negar) return Promise.reject(new DOMException('no', 'NotAllowedError'));
            return Promise.resolve({getTracks: () => [{stop: () => { G.pistasParadas++; }}]});
          }}});
          const A = {creados: 0, cerrados: 0};
          window.__A = A;
          class AC { constructor(o) { this.sampleRate = (o && o.sampleRate) || 48000; this.state = 'running'; this.destination = {}; A.creados++; }
            createMediaStreamSource() { return {connect() {}, disconnect() {}}; }
            createScriptProcessor() { const p = {connect() {}, disconnect() {}, onaudioprocess: null}; A.proc = p; return p; }
            close() { this.state = 'closed'; A.cerrados++; return Promise.resolve(); } resume() {} }
          window.AudioContext = AC; window.webkitAudioContext = AC;
          const W = {creados: [], mensajes: [], terminados: 0, retener: false, texto: 'texto privado'};
          window.__W = W;
          window.Worker = class {
            constructor(url, o) { this.url = String(url); W.creados.push({url: this.url, tipo: o && o.type}); W.ultimo = this; }
            listo() { if (!this.terminado && this.onmessage) this.onmessage({data: {tipo: 'listo', dispositivo: 'wasm'}}); }
            postMessage(m) {
              W.mensajes.push({tipo: m.tipo, total: m.total, dispositivo: m.dispositivo, largo: m.audio ? m.audio.length : null, buffer: m.audio ? m.audio.constructor.name : null});
              if (m.tipo === 'iniciar') {
                this.onmessage && this.onmessage({data: {tipo: 'progreso', cargado: 10000000, total: m.total}});
                if (W.reintentar && m.dispositivo !== 'wasm') setTimeout(() => this.onmessage && this.onmessage({data: {tipo: 'reintentar', dispositivo: 'wasm'}}), 20);
                else if (!W.retener) setTimeout(() => this.listo(), 20);
              } else if (m.tipo === 'transcribir') {
                setTimeout(() => { if (!this.terminado && this.onmessage) this.onmessage({data: {tipo: 'texto', texto: W.texto}}); }, 20);
              }
            }
            terminate() { this.terminado = true; W.terminados++; }
          };
        })();
        """ % ('true' if sintesis else 'false', 'true' if sr else 'false', 'true' if sr else 'false')

    def ctx_voz(manifiesto=True, **kw):
        c, _ = contexto(browser, **kw)
        c.add_init_script(fakes())
        if manifiesto:
            c.route('**/voz/manifiesto.json', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(MANIFIESTO)))
        else:
            c.route('**/voz/manifiesto.json', lambda r: r.fulfill(status=404, body='no existe'))
        return c

    def voz_p(c):
        pg = pagina(c)
        filtrar(pg, UNICA[0])
        abrir(pg)
        boton(pg, 'Entrenar').click()
        pg.wait_for_selector('dialog.dv-dialogo .dv-voz button', state='attached')
        return pg

    def mensaje_voz(pg):
        return pg.locator('dialog.dv-dialogo .dv-voz-estado').inner_text() + ' ' + pg.locator('dialog.dv-dialogo .dv-voz-aviso').inner_text()

    def ta_valor(pg):
        return pg.locator('dialog.dv-dialogo textarea').input_value()

    # 10a. Lectura en voz alta.
    ctx = ctx_voz()
    pg = voz_p(ctx)
    check(pg.evaluate('typeof window.DefensaVoz.montar') == 'function', 'js/defensa-voz.js se carga al mostrar la primera pregunta')
    check(not boton(pg, 'Escuchar pregunta').is_visible(), 'sin voces, «Escuchar pregunta» queda oculto')
    check(pg.locator('dialog.dv-dialogo .dv-enunciado').is_visible(), 'la pregunta sigue visible sin voz')
    pg.evaluate('''() => __S.cambiar([{name: 'Remota', lang: 'es-MX', localService: false}, {name: 'Inglesa', lang: 'en-US', localService: true}])''')
    check(not boton(pg, 'Escuchar pregunta').is_visible(), 'una voz en español remota o una local en otro idioma no bastan')
    pg.evaluate('''() => __S.cambiar([{name: 'Remota', lang: 'es-MX', localService: false}, {name: 'Local', lang: 'es-ES', localService: true}])''')
    check(boton(pg, 'Escuchar pregunta').is_visible(), 'la voz que llega después con voiceschanged muestra el botón')
    boton(pg, 'Escuchar pregunta').click()
    check(pg.evaluate('__S.hablados.length') == 1 and pg.evaluate('__S.hablados[0].voz') == 'Local' and pg.evaluate('__S.hablados[0].texto').startswith('¿'),
          'lee el enunciado con la voz en español de localService true', pg.evaluate('__S.hablados'))
    check(boton(pg, 'Detener lectura').is_visible(), 'mientras lee ofrece «Detener lectura»')
    c0 = pg.evaluate('__S.cancelados')
    boton(pg, 'Detener lectura').click()
    check(pg.evaluate('__S.cancelados') > c0 and boton(pg, 'Escuchar pregunta').is_visible(), '«Detener lectura» corta la voz')
    boton(pg, 'Escuchar pregunta').click()
    c0 = pg.evaluate('__S.cancelados')
    boton(pg, 'Dictado externo').click()
    check(pg.evaluate('__S.cancelados') > c0 and boton(pg, 'Escuchar pregunta').is_visible(), 'la lectura se detiene antes de cualquier dictado')
    ctx.close()

    # 10b. Dictado externo: aviso, rechazo sin reconocedor, aceptación y texto agregado.
    ctx = ctx_voz()
    pg = voz_p(ctx)
    pg.locator('dialog.dv-dialogo textarea').fill('Borrador previo')
    boton(pg, 'Dictado externo').click()
    aviso = pg.locator('dialog.dv-dialogo .dv-voz-aviso')
    check(aviso.locator('p').inner_text() == 'El audio puede procesarse en servidores del proveedor de tu navegador', 'el aviso del dictado externo dice exactamente lo acordado', aviso.inner_text())
    check(boton(pg, 'Aceptar y dictar').count() == 1 and boton(pg, 'Seguir escribiendo').count() == 1 and pg.evaluate('__R.instancias') == 0, 'ofrece Aceptar y dictar y Seguir escribiendo, sin crear el reconocedor')
    boton(pg, 'Seguir escribiendo').click()
    check(pg.evaluate('__R.instancias') == 0 and pg.evaluate('__R.starts') == 0, 'rechazar no crea ningún reconocedor')
    c = pg.evaluate('DefensaVoz.consentimiento()')
    check(c and c['aceptado'] is False and c['version'] == 1 and re.match(r'\d{4}-\d\d-\d\dT', c['hora']), 'la elección, la versión 1 y la hora quedan en memoria', c)
    check(pg.evaluate('JSON.stringify([localStorage, sessionStorage])') == '[{},{}]' and ta_valor(pg) == 'Borrador previo', 'nada se guarda en el navegador y el borrador sigue igual')
    boton(pg, 'Dictado externo').click()
    boton(pg, 'Aceptar y dictar').click()
    check(pg.evaluate('__R.instancias') == 1 and pg.evaluate('__R.starts') == 1, 'aceptar crea el reconocedor y lo inicia')
    pg.evaluate("() => { const r = [{transcript: 'dictado externo'}]; r.isFinal = true; __R.ultimo.onresult({resultIndex: 0, results: [r]}); }")
    check(ta_valor(pg) == 'Borrador previo dictado externo', 'el texto dictado se agrega al borrador y no lo reemplaza', ta_valor(pg))
    pg.evaluate("() => __R.ultimo.onerror({error: 'not-allowed'})")
    check(ta_valor(pg) == 'Borrador previo dictado externo' and 'no está permitido' in mensaje_voz(pg) and boton(pg, 'Dictado externo').is_enabled(), 'micrófono negado vuelve a texto sin recargar y conserva el borrador')
    boton(pg, 'Dictado externo').click()
    check(pg.evaluate('__R.instancias') == 2 and boton(pg, 'Aceptar y dictar').count() == 0, 'ya aceptado en esta sesión no vuelve a preguntar')
    s0 = pg.evaluate('__R.stops')
    cerrar(pg)
    check(pg.evaluate('__R.stops') > s0, 'al cerrar el panel se detiene el dictado externo')
    ctx.close()

    ctx, _ = contexto(browser)
    ctx.add_init_script(fakes(sintesis=False, sr=False))
    pg = pagina(ctx)
    filtrar(pg, UNICA[0]); abrir(pg); boton(pg, 'Entrenar').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-voz button', state='attached')
    check(boton(pg, 'Dictado externo').count() == 0 and not boton(pg, 'Escuchar pregunta').is_visible() and boton(pg, 'Dictar en este navegador').count() == 1,
          'sin SpeechRecognition ni speechSynthesis solo queda el dictado privado')
    check(not pg.errores, 'sin errores de JavaScript sin esas interfaces', pg.errores)
    ctx.close()

    # 10c. Dictado privado: confirmación, cancelación, grabación, red y limpieza.
    ctx = ctx_voz()
    todas = []
    ctx.on('request', lambda r: todas.append(r.url))
    pg = voz_p(ctx)
    pg.locator('dialog.dv-dialogo textarea').fill('Mi borrador')
    pg.evaluate('window.__marca = 1')
    boton(pg, 'Dictar en este navegador').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-voz-aviso:not([hidden])')
    check('71,1 MB' in mensaje_voz(pg), 'muestra el tamaño de voz/manifiesto.json (71,1 MB) antes de descargar', mensaje_voz(pg))
    voz_antes = [u for u in todas if '/voz/' in u and not u.endswith('manifiesto.json')]
    check(not voz_antes and pg.evaluate('__W.creados.length') == 0 and pg.evaluate('__G.llamadas') == 0,
          'sin confirmar no se pide nada más de voz/ ni se llama a getUserMedia', voz_antes)
    boton(pg, 'Seguir escribiendo').click()
    check(pg.evaluate('__W.creados.length') == 0 and ta_valor(pg) == 'Mi borrador', 'rechazar la descarga no crea el Worker y conserva el borrador')
    pg.evaluate('__W.retener = true')
    boton(pg, 'Dictar en este navegador').click()
    boton(pg, 'Descargar y dictar').click()
    pg.wait_for_function('__W.creados.length === 1')
    w = pg.evaluate('__W.creados[0]')
    check(w['url'].endswith('/js/defensa-whisper-worker.js') and w['tipo'] == 'module', 'crea el Worker de módulo bajo /tesis_explain/', w)
    check(pg.evaluate('__W.mensajes[0].tipo') == 'iniciar' and pg.evaluate('__G.llamadas') == 0, 'durante la descarga no pide el micrófono')
    check('10,0 MB de 71,1 MB' in mensaje_voz(pg), 'muestra el progreso de la descarga', mensaje_voz(pg))
    boton(pg, 'Cancelar').click()
    check(pg.evaluate('__W.terminados') == 1 and 'Descarga cancelada' in mensaje_voz(pg) and pg.evaluate('__G.llamadas') == 0, 'cancelar termina el Worker y no toca el micrófono', mensaje_voz(pg))
    check(ta_valor(pg) == 'Mi borrador' and pg.locator('dialog.dv-dialogo .dv-enunciado').is_visible() and pg.evaluate('window.__marca') == 1,
          'cancelar durante la descarga mantiene la pregunta y el borrador sin recargar')
    pg.evaluate('__W.retener = false')
    boton(pg, 'Dictar en este navegador').click()
    boton(pg, 'Descargar y dictar').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-voz button:has-text("Terminar dictado")')
    check(pg.evaluate('__G.llamadas') == 1 and pg.evaluate('__A.creados') == 1, 'solo al terminar la descarga pide el micrófono y abre el AudioContext')
    pg.evaluate("() => { const e = {inputBuffer: {getChannelData: () => new Float32Array(16000).fill(0.1)}}; __A.proc.onaudioprocess(e); __A.proc.onaudioprocess(e); }")
    boton(pg, 'Terminar dictado').click()
    check(pg.evaluate('__G.pistasParadas') == 1 and pg.evaluate('__A.cerrados') == 1, 'al terminar detiene las pistas y cierra el AudioContext')
    m = pg.evaluate('__W.mensajes[__W.mensajes.length - 1]')
    check(m['tipo'] == 'transcribir' and m['buffer'] == 'Float32Array' and m['largo'] == 32000, 'envía al Worker un Float32Array de 16 kHz', m)
    pg.wait_for_function("document.querySelector('dialog.dv-dialogo textarea').value.includes('texto privado')")
    check(ta_valor(pg) == 'Mi borrador texto privado', 'el texto dictado se agrega al borrador', ta_valor(pg))
    t0 = pg.evaluate('__W.terminados')
    cerrar(pg)
    check(pg.evaluate('__W.terminados') == t0 + 1, 'al cerrar el panel el Worker se termina')
    ajenas = [u for u in todas if not u.startswith('http://localhost')]
    check(not ajenas, 'durante el dictado privado no sale ninguna petición a otro host', ajenas)
    check(not pg.errores, 'sin errores de JavaScript en el dictado privado', pg.errores)
    ctx.close()

    # 10d. Micrófono negado y limpieza al cambiar de pregunta o cerrar durante la grabación.
    ctx = ctx_voz()
    pg = voz_p(ctx)
    pg.locator('dialog.dv-dialogo textarea').fill('Borrador B')
    pg.evaluate('window.__marca = 1; __G.negar = true')
    boton(pg, 'Dictar en este navegador').click(); boton(pg, 'Descargar y dictar').click()
    pg.wait_for_function('__G.llamadas === 1')
    pg.wait_for_function("document.querySelector('dialog.dv-dialogo .dv-voz-estado').textContent.includes('no está permitido')")
    check(ta_valor(pg) == 'Borrador B' and boton(pg, 'Dictar en este navegador').is_enabled() and pg.evaluate('window.__marca') == 1,
          'micrófono negado vuelve a texto sin recargar y conserva el borrador')
    check(pg.evaluate('__A.creados') == 0, 'con el micrófono negado no se crea ningún AudioContext')
    pg.evaluate('__G.negar = false')
    boton(pg, 'Dictar en este navegador').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-voz button:has-text("Terminar dictado")')
    check(pg.evaluate('__W.creados.length') == 1, 'con el Worker ya listo no vuelve a descargar ni a preguntar')
    boton(pg, 'Otra pregunta').click()
    check(pg.evaluate('__G.pistasParadas') == 1 and pg.evaluate('__A.cerrados') == 1 and pg.evaluate('__W.terminados') == 1, 'al cambiar de pregunta suelta pistas, AudioContext y Worker')
    pg.wait_for_selector('dialog.dv-dialogo .dv-voz button', state='attached')
    boton(pg, 'Dictar en este navegador').click(); boton(pg, 'Descargar y dictar').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-voz button:has-text("Terminar dictado")')
    boton(pg, 'Cerrar').click()
    pg.wait_for_selector('dialog.dv-dialogo:not([open])', state='attached')
    pg.wait_for_function('__G.pistasParadas === 2 && __A.cerrados === 2 && __W.terminados === 2', timeout=3000) if pg.evaluate('__W.creados.length') == 2 else None
    check(pg.evaluate('__G.pistasParadas') == 2 and pg.evaluate('__A.cerrados') == 2 and pg.evaluate('__W.terminados') == 2, 'al cerrar durante la grabación suelta pistas, AudioContext y Worker', pg.evaluate('[__G.pistasParadas, __A.cerrados, __W.terminados, __W.creados.length]'))
    ctx.close()

    # 10e. Copia del sitio sin voz/manifiesto.json.
    ctx = ctx_voz(manifiesto=False)
    pg = voz_p(ctx)
    boton(pg, 'Dictar en este navegador').click()
    pg.wait_for_function("document.querySelector('dialog.dv-dialogo .dv-voz-estado').textContent.includes('no está disponible en esta copia del sitio')")
    check(pg.evaluate('__W.creados.length') == 0 and pg.evaluate('__G.llamadas') == 0, 'sin manifiesto explica que no hay dictado y no descarga ni graba')
    escribir_y_enviar(pg, 'Sigue funcionando')
    pg.wait_for_selector('dialog.dv-dialogo .dv-guia')
    check(ta_valor(pg) == 'Sigue funcionando', 'el resto del panel sigue funcionando sin dictado privado')
    ctx.close()

    # 10e2. Si WebGPU falla, el respaldo wasm va en un Worker nuevo.
    ctx = ctx_voz()
    pg = voz_p(ctx)
    pg.evaluate('__W.reintentar = true')
    boton(pg, 'Dictar en este navegador').click(); boton(pg, 'Descargar y dictar').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-voz button:has-text("Terminar dictado")')
    check(pg.evaluate('__W.creados.length') == 2 and pg.evaluate('__W.terminados') == 1, 'ante «reintentar» termina el Worker y crea uno nuevo')
    check(pg.evaluate('__W.mensajes.filter(m => m.tipo === "iniciar").map(m => m.dispositivo)') == [None, 'wasm'], 'el segundo Worker se inicia con dispositivo wasm', pg.evaluate('__W.mensajes'))
    check(pg.evaluate('__G.llamadas') == 1, 'tras el respaldo wasm el flujo llega al micrófono')
    ctx.close()

    # 10f. 320 px y los dos temas con los controles de voz y el aviso abiertos.
    for tema in ('light', 'dark'):
        ctx = ctx_voz(ancho=320, alto=700, color_scheme=tema)
        pg = pagina(ctx)
        pg.evaluate('document.documentElement.setAttribute("data-theme", "%s")' % tema)
        filtrar(pg, UNICA[0]); abrir(pg); boton(pg, 'Entrenar').click()
        pg.wait_for_selector('dialog.dv-dialogo .dv-voz button', state='attached')
        pg.evaluate("__S.cambiar([{name: 'Local', lang: 'es-ES', localService: true}])")
        boton(pg, 'Dictar en este navegador').click()
        pg.wait_for_selector('dialog.dv-dialogo .dv-voz-aviso:not([hidden])')
        check(sin_desborde(pg), '320 px sin desplazamiento horizontal con la voz y el aviso (%s)' % tema)
        colores[tema + '-aviso'] = pg.evaluate('getComputedStyle(document.querySelector(".dv-voz-aviso")).backgroundColor')
        ctx.close()
    check(colores['light-aviso'] != colores['dark-aviso'], 'el aviso de voz cambia de color entre los dos temas', colores)

    # 11. Correcciones de la revisión de uso (api vacía, la configuración publicada).
    print('Revisión de uso: teclado, borradores, desplazamiento, mensajes, voz y botones táctiles')
    CAB = 'document.querySelector("dialog.dv-dialogo .dv-cab").getBoundingClientRect().bottom'

    # 11.1 Sin manifiesto, el foco no se pierde en BODY.
    ctx = ctx_voz(manifiesto=False)
    pg = voz_p(ctx)
    pg.locator('dialog.dv-dialogo textarea').focus()
    boton(pg, 'Dictar en este navegador').focus()
    pg.keyboard.press('Enter')
    pg.wait_for_function("document.querySelector('dialog.dv-dialogo .dv-voz-estado').textContent.includes('no está disponible en esta copia del sitio')")
    check(foco_llega(pg, '!!e.closest("dialog.dv-dialogo") && e !== document.body'), 'sin manifiesto el foco sigue dentro del diálogo', pg.evaluate('document.activeElement.tagName'))
    check(foco_llega(pg, 'e.textContent === "Dictar en este navegador"'), 'sin manifiesto el foco vuelve al botón de dictado')

    # 11.7 Cada aviso de voz reemplaza al anterior.
    boton(pg, 'Dictado externo').click()
    m = mensaje_voz(pg)
    check('no está disponible' not in m and 'servidores del proveedor' in m, 'el aviso del dictado externo reemplaza al mensaje anterior', m)
    boton(pg, 'Seguir escribiendo').click()
    check('no está disponible' not in mensaje_voz(pg) and 'servidores' not in mensaje_voz(pg), 'al decidir queda solo el mensaje nuevo', mensaje_voz(pg))
    ctx.close()

    # 11.5 Sin voz en español se explica por qué no hay «Escuchar pregunta».
    ctx = ctx_voz()
    pg = voz_p(ctx)
    check(pg.locator('dialog.dv-dialogo .dv-voz-nota').is_visible() and 'voz en español' in pg.locator('dialog.dv-dialogo .dv-voz-nota').inner_text(), 'sin voz en español explica por qué no hay lectura')
    pg.evaluate("__S.cambiar([{name: 'Inglesa', lang: 'en-US', localService: true}])")
    check(pg.locator('dialog.dv-dialogo .dv-voz-nota').is_visible() and not boton(pg, 'Escuchar pregunta').is_visible(), 'una voz que no es en español no la reemplaza')
    pg.evaluate("__S.cambiar([{name: 'Local', lang: 'es-ES', localService: true}])")
    check(not pg.locator('dialog.dv-dialogo .dv-voz-nota').is_visible() and boton(pg, 'Escuchar pregunta').is_visible(), 'con una voz en español la nota desaparece')
    ctx.close()

    # 11.2, 11.4, 11.6 Entrenar sin corrector.
    ctx, _ = contexto(browser, ancho=360, alto=640)
    pg = pagina(ctx)
    filtrar(pg, UNICA[0]); abrir(pg); boton(pg, 'Entrenar').click()
    boton(pg, 'Revisar antes de enviar').click()
    check('Escribe tu respuesta' in pg.inner_text('dialog.dv-dialogo .dv-estado'), 'con el borrador vacío avisa')
    borrador = 'Mi <i>borrador</i> & más'
    pg.locator('dialog.dv-dialogo textarea').fill(borrador)
    boton(pg, 'Revisar antes de enviar').click()
    check(pg.inner_text('dialog.dv-dialogo .dv-estado').strip() == '', 'con el texto válido se borra el aviso viejo', pg.inner_text('dialog.dv-dialogo .dv-estado'))
    boton(pg, 'Confirmar').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-guia')
    pg.wait_for_timeout(300)
    estado = pg.inner_text('dialog.dv-dialogo .dv-estado')
    check(estado == 'Sin corrector conectado: compara tu respuesta con la de la guía.', 'sin servicio el estado es neutro', estado)
    check('no se pudo completar' not in estado, 'sin servicio no dice que falló')
    check(pg.locator('dialog.dv-dialogo .dv-borrador pre').evaluate('e => e.textContent') == borrador and pg.locator('dialog.dv-dialogo .dv-borrador pre *').count() == 0, 'Entrenar muestra el borrador como texto plano junto a la guía')
    pos = pg.evaluate('''() => { const c = document.querySelector("dialog.dv-dialogo .dv-cab").getBoundingClientRect().bottom,
      g = document.querySelector("dialog.dv-dialogo .dv-guia").getBoundingClientRect(), b = document.querySelector("dialog.dv-dialogo .dv-borrador").getBoundingClientRect();
      return {c: c, gt: g.top, gb: g.bottom, bt: b.top, h: innerHeight}; }''')
    check(pos['bt'] >= pos['c'] - 1 and pos['gt'] < pos['h'], 'el borrador y el inicio de la guía quedan a la vista bajo la cabecera', pos)
    # 11.6 Las referencias de la copia conservan su formato.
    check(pg.locator('dialog.dv-dialogo .dv-guia .ref').count() > 0, 'la copia de la guía conserva las referencias con su clase')
    est = pg.evaluate('''() => { const r = document.querySelector("dialog.dv-dialogo .dv-guia .ref"), o = document.querySelector("#%s .q-cuerpo a.ref"),
      a = getComputedStyle(r), b = getComputedStyle(o); return [a.verticalAlign, a.fontSize, b.verticalAlign, b.fontSize]; }''' % UNICA[1])
    check(est[0] == 'super' and est[0] == est[2] and est[1] == est[3], 'las referencias de la copia se ven como en la página', est)
    ctx.close()

    # 11.2 y 11.3 Simular sin corrector a 360 px.
    ctx, _ = contexto(browser, ancho=360, alto=640)
    pg = pagina(ctx)
    abrir(pg)
    boton(pg, 'Simular').click()
    escritos = ['Primero <b>uno</b>', 'Segundo dos', 'Tercero tres']
    for i, t in enumerate(escritos):
        pg.locator('dialog.dv-dialogo textarea:visible').fill(t)
        boton(pg, 'Revisar antes de enviar').click()
        if i == 2:
            pg.evaluate('document.querySelector("dialog.dv-dialogo").scrollTop = 40')
        boton(pg, 'Confirmar').click()
    pg.wait_for_selector('dialog.dv-dialogo .dv-guia')
    pg.wait_for_timeout(300)
    textos = pg.locator('dialog.dv-dialogo .dv-borrador pre').evaluate_all('l => l.map(e => e.textContent)')
    check(textos == escritos, 'el resumen muestra cada borrador confirmado', textos)
    check(pg.locator('dialog.dv-dialogo .dv-borrador pre *').count() == 0, 'los borradores se muestran como texto plano')
    check(all(pg.locator('dialog.dv-dialogo .dv-pregunta').nth(i).locator('.dv-borrador + .dv-guia').count() == 1 for i in range(3)), 'cada borrador va junto a su guía')
    vis = pg.evaluate('''() => { const d = document.querySelector("dialog.dv-dialogo"), c = d.querySelector(".dv-cab").getBoundingClientRect().bottom,
      h = d.querySelector(".dv-h").getBoundingClientRect(), s = d.querySelector(".dv-estado").getBoundingClientRect();
      return {top: d.scrollTop, c: c, h: h.top, s: s.top, sb: s.bottom, foco: document.activeElement.className}; }''')
    check(vis['h'] >= vis['c'] - 1 and vis['s'] >= vis['c'] - 1, 'el título y el estado quedan visibles bajo la cabecera fija', vis)
    check('0 de 3 evaluadas' in pg.inner_text('dialog.dv-dialogo .dv-estado') and vis['foco'].startswith('dv-h'), 'el estado dice 0 de 3 y el foco está en el título')
    ctx.close()

    # 11.8 Botones de al menos 44 px de alto en pantallas angostas.
    for ancho in (360, 320):
        ctx = ctx_voz(ancho=ancho, alto=700)
        pg = voz_p(ctx)
        pg.evaluate("__S.cambiar([{name: 'Local', lang: 'es-ES', localService: true}])")
        pg.locator('dialog.dv-dialogo textarea').fill('Algo')
        pequenos = pg.evaluate('''() => [].filter.call(document.querySelectorAll("dialog.dv-dialogo button"), b => b.offsetParent && b.getBoundingClientRect().height < 43.5).map(b => b.textContent)''')
        check(not pequenos, 'a %d px todos los botones visibles miden 44 px o más (voz, Cerrar, Otra pregunta, Volver)' % ancho, pequenos)
        check(sin_desborde(pg), 'a %d px sigue sin desplazamiento horizontal' % ancho)
        ctx.close()
    ctx = ctx_voz(ancho=900, alto=700, has_touch=True, is_mobile=True)
    pg = voz_p(ctx)
    pequenos = pg.evaluate('''() => [].filter.call(document.querySelectorAll("dialog.dv-dialogo button"), b => b.offsetParent && b.getBoundingClientRect().height < 43.5).map(b => b.textContent)''')
    check(not pequenos, 'con puntero táctil los botones del panel miden 44 px o más', pequenos)
    ctx.close()

    browser.close()
server.shutdown()
print('\n%d comprobaciones del panel de defensa oral correctas' % count)
