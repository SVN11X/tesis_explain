"""Experiencia y rendimiento: comprueba en un navegador real lo agregado en la revisión de experiencia.

Fuentes con respaldo ajustado que no mueven la página, interactivos que se piden al acercarse,
videos diferidos, portada compacta en teléfono, simulación en azul noche, barrido del LiDAR breve y
quieto con movimiento reducido, comparador de decisiones del tema 1, filtro del glosario, bibliografía
filtrable con un resumen y un detalle por referencia, secciones de la página en el menú del teléfono y
páginas sin estilos en línea.
Uso: python3 herramientas/pruebas_experiencia_navegador.py [http://localhost:8765]
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import os, re, sys, time
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = None
if len(sys.argv) > 1:
    BASE = sys.argv[1].rstrip('/')
else:
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def handle(self):
            try:
                super().handle()
            except (BrokenPipeError, ConnectionResetError):
                pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    BASE = 'http://localhost:%d' % server.server_port
count = 0
EN_GITHUB = os.environ.get('GITHUB_ACTIONS') == 'true'
PAGINAS = sorted(p.name for p in ROOT.glob('*.html'))
MODULOS_VIS = ['vis1.js', 'vis2.js', 'vis3.js', 'sims.js', 'mapeo.js', 'movimiento.js', 'evidencia.js', 'slam-proceso.js']
MOVIL = {'viewport': {'width': 390, 'height': 844}, 'is_mobile': True, 'has_touch': True, 'device_scale_factor': 2}
ESCRITORIO = {'viewport': {'width': 1366, 'height': 900}}
OBSERVADOR_CLS = """
window.__cls = 0;
new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
  .observe({ type: 'layout-shift', buffered: true });
"""


def check(cond, text, detalle=''):
    global count
    count += 1
    if not cond:
        msg = text + ('  ' + str(detalle) if detalle != '' else '')
        if EN_GITHUB:
            # anotación visible en el resumen de la ejecución, sin abrir el registro
            print('::error title=pruebas_experiencia_navegador::' + msg.replace('\n', ' '), flush=True)
        raise AssertionError(msg)
    print('  ok   ' + text, flush=True)


def omitir(text):
    print('  --   ' + text, flush=True)
    if EN_GITHUB:
        print('::warning title=pruebas_experiencia_navegador::' + text, flush=True)


def contexto(nav, **kw):
    ctx = nav.new_context(**kw)
    # sin salida a internet: los recursos externos, como las portadas de YouTube, se responden vacíos
    ctx.route(re.compile(r'^https?://(?!localhost|127\.0\.0\.1)'), lambda r: r.fulfill(status=200, body=''))
    return ctx


def estatico():
    print('HTML de las 16 páginas')
    sin_estilo, sin_precarga, con_modulo, videos_mal, titulos = [], [], [], [], []
    for pag in PAGINAS:
        html = (ROOT / pag).read_text(encoding='utf-8')
        s = BeautifulSoup(html, 'html.parser')
        if s.select('[style]'):
            sin_estilo.append(pag)
        precargas = {l.get('href') for l in s.select('link[rel=preload][as=font]')}
        if not {'fuentes/archivo-latin-variable.woff2', 'fuentes/atkinson-hyperlegible-latin-400-normal.woff2'} <= precargas \
                or not s.select_one('meta[name=color-scheme]') or not s.select_one('script[type=speculationrules]'):
            sin_precarga.append(pag)
        for sc in s.select('script[src]'):
            if sc['src'].split('/')[-1] in MODULOS_VIS:
                con_modulo.append(pag + ' ' + sc['src'])
        for v in s.select('.bucle video'):
            if v.has_attr('autoplay') or v.get('preload') != 'none' or not v.has_attr('controls'):
                videos_mal.append(pag)
        for art in s.select('article.decision'):
            if art.find('h4'):
                titulos.append(pag)
    check(not sin_estilo, 'ninguna página usa estilos en línea', sin_estilo)
    check(not sin_precarga, 'todas precargan Archivo y Atkinson, declaran color-scheme y precargan páginas al apuntar', sin_precarga)
    check(not con_modulo, 'ninguna página carga los archivos de interactivos al abrirse', con_modulo)
    check(not videos_mal, 'los videos en bucle no se descargan solos y tienen controles sin JavaScript', videos_mal)
    check(not titulos, 'las tarjetas de decisión usan h3 bajo el h2 de su sección', titulos)
    hero = BeautifulSoup((ROOT / 'index.html').read_text(encoding='utf-8'), 'html.parser').select_one('.foto-robot source')
    check('robot-lateral-800.webp 800w' in hero.get('srcset', '') and hero.get('sizes'), 'la foto de la portada ofrece una versión de 800 px con sizes')
    deslizar = BeautifulSoup((ROOT / 'control.html').read_text(encoding='utf-8'), 'html.parser').select('.deslizar img')
    check(len(deslizar) == 2 and all(i.get('loading') == 'lazy' for i in deslizar), 'el comparador del PSO carga sus imágenes al acercarse')
    # bibliografía de la tesis: cada referencia es una línea de resumen que se abre con su detalle
    rec = BeautifulSoup((ROOT / 'recursos.html').read_text(encoding='utf-8'), 'html.parser')
    bib = rec.find('h2', id='bibliografia').find_parent('section')
    grupos = bib.select('.bib-grupo')
    refs = bib.select('ol.bib > li > details.bib-ref[id^="r-"]')
    nums = sorted(int(d.select_one('summary .bib-num').get_text().replace('Referencia', '').strip()) for d in refs)
    check(len(grupos) == 11 and len(refs) == 72 and nums == list(range(1, 73)),
          'la bibliografía tiene 72 referencias numeradas como en la tesis, en 11 grupos', (len(grupos), len(refs)))

    def resumida(d):
        s = d.find('summary', recursive=False)
        res = s and s.select_one('.bib-resumen')
        return bool(s and s.select_one('.bib-autor') and s.select_one('.tipo-ref') and res
                    and 10 < len(res.get_text(strip=True)) <= 80 and not s.select_one('.bib-detalle'))

    def detallada(d):
        det = d.select_one(':scope > .bib-detalle')
        return bool(det and len(det.select_one('.bib-contenido').get_text(strip=True)) > 60
                    and len(det.select_one('.bib-uso').get_text(strip=True)) > 40
                    and 'En la tesis:' in det.select_one('.bib-donde').get_text() and det.select_one('.bib-cita'))
    check(not [d['id'] for d in refs if not resumida(d)],
          'cada referencia se resume en una línea con su autor, su tipo y de qué trata', [d['id'] for d in refs if not resumida(d)])
    check(not [d['id'] for d in refs if not detallada(d)],
          'al abrirla, cada referencia dice de qué trata, para qué la usa la tesis, dónde aparece y su cita completa',
          [d['id'] for d in refs if not detallada(d)])
    check(all(g.find('h3', id=True) and g.select_one('.bib-desc') and g.select_one('details.detalle > summary') for g in grupos),
          'cada grupo tiene título con ancla, para qué sirve y la lista plegable')
    textos = ' '.join(d.select_one(c).get_text() for d in refs for c in ('.bib-resumen', '.bib-contenido', '.bib-uso'))
    check(';' not in textos and not re.search(r'\s[-–—]\s|–|—', textos), 'los resúmenes y las explicaciones no usan punto y coma ni guiones como separadores')


def manifiesto(nav):
    print('Interactivos bajo demanda')
    ctx = contexto(nav, **ESCRITORIO)
    p = ctx.new_page()
    faltan = []
    p.goto(BASE + '/index.html')
    modulos = p.evaluate('window.SITIO.MODULOS')
    registrados = {n for lista in modulos.values() for n in lista.split()}
    for pag in PAGINAS:
        for n in re.findall(r'data-vis="([a-z0-9-]+)"', (ROOT / pag).read_text(encoding='utf-8')):
            if n not in registrados:
                faltan.append(pag + ' ' + n)
    check(not faltan, 'cada data-vis de las páginas está registrado en SITIO.MODULOS', faltan)
    # control.html: al terminar de cargar no se pidió ningún archivo de interactivos antes de DOMContentLoaded
    pedidos = []
    p.on('request', lambda r: pedidos.append(r.url))
    p.goto(BASE + '/control.html', wait_until='load')
    r = p.evaluate("""() => { const dcl = performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd;
      return performance.getEntriesByType('resource').filter(e => /\\/js\\/(vis1|vis2|vis3|sims|mapeo|movimiento|evidencia|slam-proceso)\\.js/.test(e.name))
        .map(e => ({ n: e.name.split('/').pop(), antes: e.startTime < dcl })); }""")
    check(not any(x['antes'] for x in r), 'control.html no pide archivos de interactivos antes de DOMContentLoaded', r)
    p.locator('[data-vis="estabilidad"]').scroll_into_view_if_needed()
    p.wait_for_selector('[data-vis="estabilidad"][data-montado="1"]', timeout=10000)
    p.locator('[data-vis="windup"]').evaluate('el => { const d = el.closest("details"); if (d) d.open = true; }')
    p.locator('[data-vis="windup"]').scroll_into_view_if_needed()
    p.wait_for_selector('[data-vis="windup"][data-montado="1"]', timeout=10000)
    vis2 = [u for u in pedidos if u.endswith('/js/vis2.js')]
    check(len(vis2) == 1, 'cada archivo de interactivos se pide una sola vez aunque lo usen varios', len(vis2))
    ctx.close()


def fuentes_y_cls(nav):
    print('Fuentes lentas sin desplazamientos')
    for nombre, kw in [('teléfono', MOVIL), ('escritorio', ESCRITORIO)]:
        for pag in ['index.html', 'control.html', 'preguntas.html']:
            ctx = contexto(nav, **kw)
            ctx.add_init_script(OBSERVADOR_CLS)

            def lenta(route):
                time.sleep(1.2)
                route.continue_()
            ctx.route('**/*.woff2', lenta)
            p = ctx.new_page()
            p.goto(BASE + '/' + pag, wait_until='load')
            p.wait_for_timeout(600)
            cls = p.evaluate('window.__cls')
            familia = p.evaluate("getComputedStyle(document.querySelector('h1')).fontFamily")
            usados = p.evaluate("[...document.fonts].filter(f => f.family.includes('Respaldo') && f.status === 'loaded').map(f => f.family)")
            if not usados:
                # sin Arial ni equivalentes, Roboto o DejaVu Sans no hay respaldo que medir: el CLS dependería de la fuente
                # que elija el sistema, no del sitio
                omitir('%s, %s: el sistema no tiene ninguna fuente de respaldo compatible, se omite el CLS (%.4f)' % (pag, nombre, cls))
                ctx.close()
                continue
            check(cls < 0.02, '%s, %s: con las fuentes 1,2 s tarde el CLS es %.4f (respaldo: %s)' % (pag, nombre, cls, ', '.join(sorted(set(f.strip('"') for f in usados)))), cls)
            check('Respaldo' in familia, '%s, %s: el título tiene una fuente de respaldo con métricas ajustadas' % (pag, nombre), familia)
            ctx.close()


def titulos(nav):
    print('Títulos de los temas con la fuente de respaldo')
    temas = [p for p in PAGINAS if p != 'index.html']
    anchos = list(range(320, 481, 8))

    def alturas(bloquear):
        out, usados = {}, set()
        for pag in temas:
            ctx = contexto(nav, viewport={'width': 390, 'height': 844}, is_mobile=True, device_scale_factor=2)
            if bloquear:
                ctx.route('**/*.woff2', lambda r: r.abort())
            p = ctx.new_page()
            p.goto(BASE + '/' + pag, wait_until='load')
            p.wait_for_timeout(200)
            if bloquear:
                usados |= set(p.evaluate("[...document.fonts].filter(f => f.family.includes('Respaldo Tema') && f.status === 'loaded').map(f => f.family)"))
            fila = []
            for w in anchos:
                p.set_viewport_size({'width': w, 'height': 844})
                p.wait_for_timeout(20)
                fila.append(p.evaluate("Math.round(document.querySelector('h1').getBoundingClientRect().height)"))
            out[pag] = fila
            ctx.close()
        return out, usados
    respaldo, usados = alturas(True)
    if not usados:
        omitir('el sistema no tiene ninguna fuente de respaldo compatible para los títulos, se omite la comparación')
        return
    web, _ = alturas(False)
    distintos = ['%s a %d px' % (pag, w) for pag in temas for w, a, b in zip(anchos, respaldo[pag], web[pag]) if a != b]
    check(not distintos, 'entre 320 y 480 px, el título de cada tema ocupa las mismas líneas con el respaldo (%s) que con Archivo'
          % ', '.join(sorted(f.strip('"') for f in usados)), distintos[:10])


def portada(nav):
    print('Portada')
    ctx = contexto(nav, **MOVIL)
    p = ctx.new_page()
    pedidos = []
    p.on('request', lambda r: pedidos.append((time.time(), r.url)))
    t0 = time.time()
    p.goto(BASE + '/index.html', wait_until='load')
    t_load = time.time()
    r = p.evaluate("""() => { const t = [...document.querySelectorAll('.tarjeta-tema')].map(a => a.getBoundingClientRect());
      const s = document.getElementById('temas').getBoundingClientRect();
      const v = document.querySelector('.portada-media video');
      return { alto: Math.max(...t.map(x => x.height)), filas: t.every(x => x.width > 300), temas: s.height,
               poster: v.getAttribute('poster'), controles: v.hasAttribute('controls'), ancho: document.documentElement.scrollWidth - innerWidth }; }""")
    check(r['alto'] < 190 and r['filas'], 'teléfono: cada tema es una fila compacta de menos de 190 px (%d)' % r['alto'], r)
    check(r['temas'] < 2300, 'teléfono: la sección de temas mide %d px, antes unos 4 200' % r['temas'], r)
    check(r['poster'].endswith('.webp') and not r['controles'], 'el video de la portada muestra su portada WebP y usa el botón propio', r)
    check(r['ancho'] <= 1, 'teléfono: la portada no desborda', r['ancho'])
    temprano = [u for (t, u) in pedidos if u.endswith('.mp4') and t < t_load + 0.5]
    check(not temprano, 'el video de la portada no se descarga junto con la página', temprano)
    p.locator('.portada-media .inset').scroll_into_view_if_needed()
    p.wait_for_function("() => { const v = document.querySelector('.portada-media video'); return v && !v.paused; }", timeout=12000)
    check(True, 'el video de la portada corre cuando está a la vista y el navegador quedó libre')
    # simulación del ciclo en azul noche
    p.locator('#sim-hero').scroll_into_view_if_needed()
    p.wait_for_selector('#sim-hero[data-montado="1"]', timeout=10000)
    p.wait_for_timeout(400)
    fondo = p.evaluate("""() => { const c = document.querySelector('#sim-hero canvas'), x = c.getContext('2d');
      const d = x.getImageData(4, 4, 1, 1).data; return [d[0], d[1], d[2]]; }""")
    check(sum(fondo) < 200 and fondo[2] > fondo[0], 'la simulación de la portada se dibuja con el fondo azul noche', fondo)
    barrido = p.evaluate("""() => { const s = getComputedStyle(document.querySelector('.portada-media .escaneo'), '::after');
      return { dur: parseFloat(s.animationDuration) + parseFloat(s.animationDelay), veces: s.animationIterationCount, nombre: s.animationName }; }""")
    check(barrido['nombre'] == 'barrer' and barrido['dur'] <= 5 and barrido['veces'] == '1', 'el barrido del LiDAR dura menos de 5 s y no se repite', barrido)
    ctx.close()
    ctx = contexto(nav, reduced_motion='reduce', **MOVIL)
    p = ctx.new_page()
    p.goto(BASE + '/index.html', wait_until='load')
    p.wait_for_timeout(1800)
    r = p.evaluate("""() => { const v = document.querySelector('.portada-media video');
      return { pausado: v.paused, poster: v.getAttribute('poster'), barrido: getComputedStyle(document.querySelector('.portada-media .escaneo'), '::after').animationName,
               aparicion: getComputedStyle(document.querySelector('.tarjeta-tema')).animationName }; }""")
    check(r['pausado'] and r['poster'] and r['barrido'] == 'none' and r['aparicion'] == 'none', 'con movimiento reducido no hay barrido, aparición ni video en marcha', r)
    ctx.close()
    ctx = contexto(nav, java_script_enabled=False, **MOVIL)
    p = ctx.new_page()
    p.goto(BASE + '/index.html')
    r = p.evaluate("""() => { const v = document.querySelector('.portada-media video');
      return { controles: v.hasAttribute('controls'), poster: !!v.getAttribute('poster'), visibles: [...document.querySelectorAll('.tarjeta-tema')].every(a => a.getBoundingClientRect().height > 0) }; }""")
    check(r['controles'] and r['poster'] and r['visibles'], 'sin JavaScript el video se puede reproducir a mano y los temas se ven', r)
    ctx.close()


def decisiones(nav):
    print('Comparador de decisiones')
    for nombre, kw in [('escritorio', ESCRITORIO), ('teléfono', MOVIL)]:
        ctx = contexto(nav, **kw)
        p = ctx.new_page()
        p.goto(BASE + '/problema.html#estado-del-arte', wait_until='load')
        arts = p.locator('article.decision')
        r = p.evaluate("""() => [...document.querySelectorAll('article.decision')].map(a => ({
          botones: [...a.querySelectorAll('.d-botones button')].map(b => b.textContent), presionados: a.querySelectorAll('[aria-pressed=true]').length }))""")
        check(len(r) == 6 and all(len(x['botones']) >= 3 and x['botones'][0].startswith('Por qué') and x['presionados'] == 0 for x in r),
              '%s: seis decisiones con un botón por la elección y uno por alternativa, ninguno activo al cargar' % nombre, r)
        slam = arts.nth(2)
        b = slam.locator('button[data-alt="cartographer"]')
        if nombre == 'teléfono':
            b.tap()
        else:
            b.click()
        e = slam.evaluate('a => a.estadoDecision()')
        check(e['viendo'] == 'cartographer' and len(e['activas']) == 1 and 'Cartographer' in e['activas'][0], '%s: Cartographer resalta la frase que lo descarta' % nombre, e)
        tenues = slam.evaluate("a => [...a.querySelectorAll('.razon-tenue')].map(r => getComputedStyle(r).color)")
        check(len(tenues) >= 3, '%s: el resto de la explicación queda atenuado, no oculto' % nombre, tenues)
        aviso = slam.locator('p[aria-live]').inner_text()
        check(aviso.startswith('Frente a Cartographer:') and 'CPU' in aviso, '%s: un lector de pantalla oye la razón resaltada' % nombre, aviso)
        b.focus()
        p.keyboard.press('Enter')
        e = slam.evaluate('a => a.estadoDecision()')
        check(e['viendo'] is None and not e['activas'], '%s: Enter sobre el botón activo vuelve al texto completo' % nombre, e)
        ros = arts.nth(0)
        ros.locator('button[data-alt="elegida"]').click()
        e = ros.evaluate('a => a.estadoDecision()')
        check(e['viendo'] == 'elegida' and any('nodo maestro' in t for t in e['activas']), '%s: Por qué ROS 2 resalta las razones de la elección' % nombre, e)
        ancho = p.evaluate('document.documentElement.scrollWidth - innerWidth')
        check(ancho <= 1, '%s: el comparador no desborda' % nombre, ancho)
        ctx.close()
    ctx = contexto(nav, java_script_enabled=False, **ESCRITORIO)
    p = ctx.new_page()
    p.goto(BASE + '/problema.html')
    r = p.evaluate("""() => ({ botones: document.querySelectorAll('article.decision button').length,
      texto: document.querySelector('article.decision p').innerText })""")
    check(r['botones'] == 0 and 'YARP, Orocos y LCM' in r['texto'], 'sin JavaScript se leen las razones completas, sin botones inertes', r)
    ctx.close()


def glosario_y_menu(nav):
    print('Glosario y menú del teléfono')
    ctx = contexto(nav, **MOVIL)
    p = ctx.new_page()
    p.goto(BASE + '/recursos.html#glosario', wait_until='load')
    total = p.locator('dl.glosario > div').count()
    p.fill('#g-filtro', 'odometria')
    p.wait_for_timeout(100)
    vis = p.evaluate("[...document.querySelectorAll('dl.glosario > div')].filter(d => !d.hidden).map(d => d.querySelector('dt').textContent)")
    check('Odometría' in vis and len(vis) < total, 'el filtro encuentra Odometría sin escribir la tilde (%d de %d)' % (len(vis), total), vis)
    check('coinciden' in p.text_content('.filtro-estado'), 'el número de coincidencias se anuncia')
    p.fill('#g-filtro', 'xyzw')
    check('Ningún término' in p.text_content('.filtro-estado'), 'sin coincidencias sugiere el buscador del sitio')
    p.fill('#g-filtro', '')
    check(p.evaluate("[...document.querySelectorAll('dl.glosario > div')].every(d => !d.hidden)"), 'al borrar el filtro vuelven todos los términos')
    alto = p.locator('#g-filtro').evaluate('el => el.closest(".campo-buscar").getBoundingClientRect().height')
    check(alto >= 44, 'el campo del filtro mide al menos 44 px de alto (%d)' % alto)
    p.goto(BASE + '/control.html', wait_until='load')
    secciones = p.evaluate("document.querySelectorAll('.articulo > section > h2[id]').length")
    p.evaluate('window.scrollTo(0, 5000)')
    p.wait_for_timeout(300)
    p.click('#btn-menu')
    r = p.evaluate("""() => ({ enlaces: document.querySelectorAll('.cajon-secciones a').length,
      activo: !!document.querySelector('.cajon-secciones a.activo[aria-current=location]'),
      chicos: [...document.querySelectorAll('.cajon-secciones a')].filter(a => a.getBoundingClientRect().height < 43.5).length })""")
    check(r['enlaces'] == secciones and r['activo'], 'el menú del teléfono lista las %d secciones y marca la actual' % secciones, r)
    check(r['chicos'] == 0, 'cada sección del menú mide al menos 44 px de alto', r)
    destino = p.locator('.cajon-secciones a').nth(4)
    ancla = destino.get_attribute('href')
    destino.tap()
    p.wait_for_timeout(400)
    r = p.evaluate("""a => ({ hash: location.hash, abierto: document.getElementById('cajon').classList.contains('abierto'),
      arriba: document.querySelector(a).getBoundingClientRect().top, alto: innerHeight, inerte: document.getElementById('contenido').inert })""", ancla)
    check(r['hash'] == ancla and not r['abierto'] and not r['inerte'] and 0 <= r['arriba'] < r['alto'], 'una sección del menú cierra el menú y lleva a su título', r)
    ctx.close()


def bibliografia(nav):
    print('Bibliografía de la tesis')
    ctx = contexto(nav, **MOVIL)
    p = ctx.new_page()
    p.goto(BASE + '/recursos.html#r-hess2016', wait_until='load')
    p.wait_for_timeout(500)
    r = p.evaluate("""() => { const d = document.getElementById('r-hess2016'), r = d.getBoundingClientRect();
      return { ref: d.open, grupo: d.closest('details.detalle').open, arriba: r.top, alto: innerHeight,
               cab: document.getElementById('cabecera').getBoundingClientRect().bottom,
               cerrados: [...document.querySelectorAll('.bib-grupo > details.detalle')].filter(d => !d.open).length,
               otras: [...document.querySelectorAll('details.bib-ref')].filter(d => d.open).length }; }""")
    check(r['ref'] and r['grupo'] and r['cab'] - 1 <= r['arriba'] < r['alto'] and r['cerrados'] == 10 and r['otras'] == 1,
          'un enlace a una referencia abre su grupo y su detalle, y la deja bajo la cabecera', r)
    p.fill('#b-filtro', 'pso')
    p.wait_for_timeout(100)
    r = p.evaluate("""() => ({ visibles: [...document.querySelectorAll('ol.bib > li')].filter(li => !li.hidden).map(li => li.firstElementChild.id),
      grupos: [...document.querySelectorAll('.bib-grupo')].filter(g => !g.hidden).map(g => [g.querySelector('h3').id, g.querySelector('details.detalle').open]),
      estado: document.querySelector('#b-filtro').closest('.filtro-lista').querySelector('.filtro-estado').textContent })""")
    check(sorted(r['visibles']) == ['r-clerc2002', 'r-gokce2021', 'r-shi1998'] and r['grupos'] == [['bib-pso', True]] and r['estado'] == '3 referencias coinciden.',
          'el filtro deja las tres referencias del PSO, abre su grupo, oculta los demás y lo anuncia', r)
    resumen = p.locator('#r-shi1998 > summary')
    antes = p.evaluate("document.querySelector('#r-shi1998 .bib-contenido').checkVisibility()")
    alto_resumen = resumen.evaluate('el => el.getBoundingClientRect().height')
    resumen.click()
    p.wait_for_timeout(100)
    despues = p.evaluate("""() => { const d = document.getElementById('r-shi1998'), c = d.querySelector('.bib-contenido');
      return { abierto: d.open, visible: c.checkVisibility(), texto: c.textContent }; }""")
    check(not antes and alto_resumen >= 44 and despues['abierto'] and despues['visible'] and 'peso de inercia' in despues['texto'],
          'al presionar la línea de resumen se abre el detalle del contenido (resumen de %d px)' % alto_resumen, despues)
    resumen.focus()
    p.keyboard.press('Enter')
    p.wait_for_timeout(100)
    check(not p.evaluate("document.getElementById('r-shi1998').open"), 'con el teclado, Enter vuelve a cerrar el detalle')
    p.fill('#b-filtro', 'clopper')
    p.wait_for_timeout(100)
    r = p.evaluate("""() => ({ visibles: [...document.querySelectorAll('ol.bib > li')].filter(li => !li.hidden).map(li => li.firstElementChild.id),
      abiertas: [...document.querySelectorAll('details.bib-ref')].filter(d => d.open).map(d => d.id) })""")
    check(r['visibles'] == ['r-vincent2024'] and r['abiertas'] == ['r-hess2016'],
          'el filtro busca también en el detalle de cada referencia sin abrirlo', r)
    p.fill('#b-filtro', 'xyzw')
    check('Ninguna referencia' in p.evaluate("document.querySelector('#b-filtro').closest('.filtro-lista').querySelector('.filtro-estado').textContent"),
          'sin coincidencias sugiere el buscador del sitio')
    p.fill('#b-filtro', '')
    p.wait_for_timeout(100)
    r = p.evaluate("""() => ({ ocultos: document.querySelectorAll('ol.bib > li[hidden], .bib-grupo[hidden]').length,
      abiertos: [...document.querySelectorAll('.bib-grupo > details.detalle')].filter(d => d.open).map(d => d.closest('.bib-grupo').querySelector('h3').id) })""")
    check(r['ocultos'] == 0 and r['abiertos'] == ['bib-mapeo'], 'al borrar el filtro todo vuelve y cada grupo queda como estaba', r)
    p.evaluate("""() => { const d = document.getElementById('r-astrom2009'); d.closest('details.detalle').open = true; d.open = true; }""")
    p.wait_for_timeout(100)
    alto = p.locator('#b-filtro').evaluate('el => el.closest(".campo-buscar").getBoundingClientRect().height')
    ancho = p.evaluate('document.documentElement.scrollWidth - innerWidth')
    check(alto >= 44 and ancho <= 1, 'teléfono: el filtro mide al menos 44 px y un detalle abierto no desborda la página (%d)' % alto, ancho)
    ctx.close()
    ctx = contexto(nav, java_script_enabled=False, **ESCRITORIO)
    p = ctx.new_page()
    p.goto(BASE + '/recursos.html#bibliografia')
    r = p.evaluate("""() => ({ grupos: document.querySelectorAll('.bib-grupo > details.detalle').length,
      refs: document.querySelectorAll('details.bib-ref > summary').length, filtro: !!document.getElementById('b-filtro'),
      desc: [...document.querySelectorAll('.bib-desc')].every(d => d.getBoundingClientRect().height > 0) })""")
    check(r['grupos'] == 11 and r['refs'] == 72 and not r['filtro'] and r['desc'],
          'sin JavaScript se ven los grupos con su explicación, y grupos y referencias se abren a mano', r)
    ctx.close()


def tema_oscuro(nav):
    print('Tema oscuro e identidad')
    ctx = contexto(nav, color_scheme='dark', **ESCRITORIO)
    p = ctx.new_page()
    p.goto(BASE + '/index.html', wait_until='load')
    r = p.evaluate("""() => { const c = s => getComputedStyle(document.querySelector(s));
      return { banda: c('.banda').backgroundColor, pie: c('.pie').backgroundColor, lab: c('.cierre-lab').backgroundColor,
               vt: c('#cabecera').viewTransitionName, ancho: document.documentElement.scrollWidth - innerWidth }; }""")
    check(r['banda'] == r['lab'] == r['pie'] and r['banda'] != 'rgba(0, 0, 0, 0)', 'la banda, el laboratorio y el pie comparten el azul noche', r)
    check(r['vt'] == 'cabecera', 'la cabecera queda fija durante la transición entre páginas', r)
    check(r['ancho'] <= 1, 'tema oscuro: sin desborde horizontal', r)
    ctx.close()


with sync_playwright() as pw:
    estatico()
    nav = pw.chromium.launch()
    for prueba in (manifiesto, fuentes_y_cls, titulos, portada, decisiones, glosario_y_menu, bibliografia, tema_oscuro):
        prueba(nav)
    nav.close()
if server:
    server.shutdown()
print('\n%d comprobaciones de experiencia y rendimiento correctas' % count)
