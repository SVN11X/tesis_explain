"""Laboratorio y correcciones comunes en Chromium real, bajo /tesis_explain/.
Uso: python3 herramientas/pruebas_laboratorio_navegador.py
Solo desarrollo: Playwright + Chromium. Sin dependencias de visitantes.
EVIDENCIA_DIR opcional guarda capturas solicitadas de escritorio y móvil.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright, expect
import hashlib, json, os, re

ROOT = Path(__file__).resolve().parents[1]


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT.parent)))
Thread(target=server.serve_forever, daemon=True).start()
BASE = 'http://localhost:%d/%s' % (server.server_port, ROOT.name)
count = 0


def check(condition, name):
    global count
    count += 1
    assert condition, name
    print('  ok   ' + name)


with sync_playwright() as pw:
    browser = pw.chromium.launch()
    configs = [
        ('escritorio', dict(viewport=dict(width=1366, height=900))),
        ('movil', dict(viewport=dict(width=390, height=844), is_mobile=True, has_touch=True)),
        ('320px', dict(viewport=dict(width=320, height=740), is_mobile=True, has_touch=True)),
        ('oscuro', dict(viewport=dict(width=1366, height=900), color_scheme='dark')),
        ('movimiento-reducido', dict(viewport=dict(width=1280, height=900), reduced_motion='reduce'))
    ]
    for name, opts in configs:
        ctx = browser.new_context(**opts)
        # Las peticiones de la página del laboratorio deben ser todas locales.
        p = ctx.new_page()
        requests, errors = [], []
        p.on('request', lambda r: requests.append((r.method, r.url)))
        p.on('pageerror', lambda e: errors.append(str(e)))
        p.goto(BASE + '/laboratorio.html')
        check(p.locator('.aviso-academico').is_visible(), name + ': aviso académico visible')
        check(p.locator('#lab-controles').is_visible(), name + ': controles locales visibles')
        check(p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), name + ': sin desborde horizontal')
        for file in ['recta-2m-real.csv', 'recta-2m-simulacion.csv', 'giro-real.csv', 'giro-simulacion.csv', 'escalon.csv', 'mapeo.csv', 'metas.csv']:
            p.select_option('#lab-ejemplo', file)
            p.click('#lab-cargar')
            expect(p.locator('#lab-estado')).to_contain_text('Análisis listo')
            check(p.locator('#lab-resultados').is_visible(), name + ': analiza ' + file)
            check(p.locator('#lab-grafica svg').count() == 1, name + ': gráfico accesible de ' + file)
        check('53' in p.locator('#lab-metricas').inner_text() and 'sin clasificar' in p.locator('#lab-metricas').inner_text(), name + ': conserva reemplazos y abortos sin clasificar')
        check('tasa de éxito' in p.locator('#lab-limitaciones').inner_text(), name + ': no inventa tasa de éxito')
        with p.expect_download() as info:
            p.click('#lab-exportar')
        download = info.value
        data = json.loads(Path(download.path()).read_text())
        text = (ROOT / 'datos/ensayos/metas.csv').read_text()
        check(data['procedencia']['sha256_texto_utf8'] == hashlib.sha256(text.encode()).hexdigest(), name + ': exporta una huella verificable')
        check(data['estado_academico'] == 'en_revision_comite' and len(data['filas']) == 5, name + ': exporta origen, estado y filas completas')
        own = 'tiempo_s,referencia_m_s,velocidad_m_s,pwm\n0,1,0,255\n1,1,0.5,255\n2,1,1.1,100\n3,1,1.01,100\n4,1,1,100\n5,1,1,100'
        p.set_input_files('#lab-archivo', dict(name='registro-propio.csv', mimeType='text/csv', buffer=own.encode()))
        expect(p.locator('#lab-estado')).to_contain_text('serie-control')
        check('Archivo del usuario' in p.locator('#lab-procedencia').inner_text(), name + ': archivo propio no se atribuye a la tesis')
        check('Sobreimpulso observado' in p.locator('#lab-metricas').inner_text(), name + ': serie temporal produce métricas sustentadas')
        check(all(method == 'GET' and url.startswith(BASE.rsplit('/', 1)[0]) for method, url in requests), name + ': ningún envío de archivo ni solicitud externa')
        invalid = b'iteracion,metas_generadas,abortadas,reemplazadas_por_explorador,exitosas,sin_estado_terminal,tiempo_activo_mediano_s\n1,10,9,11,0,1,3.3'
        p.set_input_files('#lab-archivo', dict(name='invalido.csv', mimeType='text/csv', buffer=invalid))
        p.wait_for_selector('#lab-error:not([hidden])')
        check(p.locator('#lab-resultados').is_hidden() and p.locator('#lab-exportar').is_disabled(), name + ': dato inválido no deja resultado antiguo exportable')
        # Texto hostil no se inserta como HTML al presentar nombre ni dato cualitativo.
        p.set_input_files('#lab-archivo', dict(name='<img onerror=alert(1)>.csv', mimeType='text/csv', buffer=(ROOT/'datos/ensayos/escalon.csv').read_bytes()))
        expect(p.locator('#lab-estado')).to_contain_text('formato escalon')
        check(p.locator('#lab-procedencia img').count() == 0, name + ': nombre de archivo se muestra como texto')
        evidence = os.environ.get('EVIDENCIA_DIR')
        if evidence and name in ('escritorio', 'movil', 'oscuro'):
            out = Path(evidence); out.mkdir(parents=True, exist_ok=True)
            p.set_input_files('#lab-archivo', [])
            p.select_option('#lab-ejemplo', 'metas.csv'); p.click('#lab-cargar')
            expect(p.locator('#lab-estado')).to_contain_text('formato metas')
            p.evaluate("window.scrollTo({top:document.querySelector('#resultados-lab').getBoundingClientRect().top + scrollY - 100,behavior:'instant'})")
            p.screenshot(path=str(out / ('despues-laboratorio-' + name + '.png')), full_page=False)
        p.click('#lab-limpiar')
        check(p.locator('#lab-resultados').is_hidden() and p.locator('#lab-tabla').inner_text() == '', name + ': limpiar elimina datos de la presentación')
        check(not errors, name + ': sin errores JavaScript')
        ctx.close()

    # Navegación modal: foco, aislamiento, Escape y regreso al botón.
    ctx = browser.new_context(viewport=dict(width=390, height=844))
    ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body=''))
    p = ctx.new_page(); p.goto(BASE + '/index.html'); p.click('#btn-menu')
    check(p.locator('#contenido').evaluate('el => el.inert'), 'Menú móvil aísla el contenido de fondo')
    p.locator('#cajon a').last.focus(); p.keyboard.press('Tab')
    check(p.evaluate("document.activeElement === document.querySelector('#cajon a')"), 'Tab al final vuelve al primer control del diálogo')
    p.keyboard.press('Shift+Tab')
    check(p.evaluate("document.activeElement === [...document.querySelectorAll('#cajon a, #cajon button')].at(-1)"), 'Shift+Tab recorre en sentido inverso')
    p.keyboard.press('Escape')
    check(p.evaluate("document.activeElement.id === 'btn-menu' && !document.querySelector('#contenido').inert"), 'Escape restaura foco y contenido')
    ctx.close()

    ctx = browser.new_context(viewport=dict(width=1366, height=900), reduced_motion='reduce')
    ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body=''))
    p = ctx.new_page()
    p.goto(BASE + '/control.html'); box = p.locator('[data-vis=papeles]'); box.scroll_into_view_if_needed(); p.wait_for_selector('[data-vis=papeles][data-montado]')
    box.locator('[data-termino=Ki]').click(); box.locator('[data-rueda=izq]').click(); box.locator('[data-a=restablecer]').click()
    check(box.locator('[data-termino=Kp]').get_attribute('aria-pressed') == 'true' and box.locator('[data-rueda=der]').get_attribute('aria-pressed') == 'true', 'Restablecimiento de control restaura término y rueda')
    if os.environ.get('EVIDENCIA_DIR'): p.screenshot(path=str(Path(os.environ['EVIDENCIA_DIR'])/'despues-control.png'))
    p.goto(BASE + '/mapeo.html'); box = p.locator('[data-vis=lazo]'); box.scroll_into_view_if_needed(); p.wait_for_selector('[data-vis=lazo][data-montado]')
    box.locator('details summary').click()
    p.locator('#mp-grafo-giro').evaluate("el=>{el.value=0;el.dispatchEvent(new Event('input',{bubbles:true}));}")
    state = box.evaluate('el=>el.estadoSim()')
    check(abs(state['odom'][-1][0]) < 1e-10 and abs(state['odom'][-1][1]) < 1e-10, 'Error de escala sin giro cierra el recorrido sin garantizar longitudes')
    p.locator('#mp-grafo-escala').evaluate("el=>{el.value=-10;el.dispatchEvent(new Event('input',{bubbles:true}));}")
    p.locator('#mp-grafo-giro').evaluate("el=>{el.value=-3;el.dispatchEvent(new Event('input',{bubbles:true}));}")
    box.locator('[data-paso="2"]').click(); state = box.evaluate('el=>el.estadoSim()')
    check(state['costoFinal'] < state['costoInicial'], 'El optimizador reduce desacuerdo con deriva negativa extrema')
    box.locator('[data-restablecer-grafo]').click()
    check(box.evaluate('el=>el.estadoSim().fase') == 0 and p.locator('#mp-grafo-escala').input_value() == '4' and p.locator('#mp-grafo-giro').input_value() == '1', 'Restablecer grafo recupera parámetros, selección y etapa')
    if os.environ.get('EVIDENCIA_DIR'): p.screenshot(path=str(Path(os.environ['EVIDENCIA_DIR'])/'despues-mapeo.png'))
    p.goto(BASE + '/preguntas.html'); p.select_option('#q-estado', 'pendiente')
    check(p.locator('details.pregunta:not([hidden])').count() == 6, 'Filtro muestra seis respuestas con confirmación pendiente')
    p.check('#q-practica'); p.locator('details.pregunta:not([hidden]) summary').first.click()
    check(p.locator('details.pregunta:not([hidden])').first.locator('.q-velo').is_visible(), 'Modo práctica conserva velo con filtro de respaldo')
    ctx.close()

    # Fallo inducido: conserva la explicación original y reintenta tras recuperar módulo.
    ctx = browser.new_context()
    ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body=''))
    ctx.route('**/js/vis2.js', lambda route: route.fulfill(status=200, body=''))
    p = ctx.new_page(); p.goto(BASE + '/control.html#sim-estacionario'); p.locator('[data-vis=estacionario]').scroll_into_view_if_needed()
    check('error estacionario de 0,002' in p.locator('[data-vis=estacionario]').inner_text(), 'Módulo ausente conserva explicación original')
    p.add_script_tag(content=(ROOT/'js/vis2.js').read_text())
    p.locator('[data-vis=estacionario] .vis-error button').click()
    check(p.locator('[data-vis=estacionario][data-montado="1"]').count() == 1, 'Reintento monta el módulo recuperado')
    ctx.close()

    ctx = browser.new_context(java_script_enabled=False, viewport=dict(width=320, height=740))
    p = ctx.new_page(); p.goto(BASE + '/laboratorio.html')
    check(p.locator('.aviso-academico').is_visible() and p.locator('.nav-estatica').is_visible(), 'Sin JS: estado y navegación disponibles')
    check(p.locator('#formatos').is_visible() and p.locator('#lab-controles').is_hidden(), 'Sin JS: fórmulas y descargas, sin controles inertes')
    p.goto(BASE + '/preguntas.html'); p.locator('#p-solo-013 summary').click()
    check(p.locator('#p-solo-013 .q-pendiente').is_visible(), 'Sin JS: pendientes del autor accesibles')
    ctx.close(); browser.close()
server.shutdown()
print('\n%d comprobaciones nuevas de navegador correctas' % count)
