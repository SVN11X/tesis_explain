"""Pruebas del sitio en un navegador real (Chromium con Playwright).

Uso, desde la raíz del repositorio:
    pip install playwright beautifulsoup4 && python3 -m playwright install chromium
    python3 -m http.server 8765 &
    python3 herramientas/pruebas_navegador.py [http://localhost:8765]

Comprueba: errores de consola y de carga en las 15 páginas, en escritorio y en móvil; que
todos los interactivos se monten; desborde horizontal en móvil; enlaces internos, anclas y
recursos locales; el buscador; las definiciones con ratón, toque y teclado; los simuladores
de inflación, DWB, exploración y encoder; y la página de Recursos.
"""
import os, re, sys, json, glob
from urllib.parse import urlparse, unquote
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765').rstrip('/')
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PAGINAS = sorted(os.path.basename(p) for p in glob.glob(os.path.join(REPO, '*.html')))
fallos, total = [], 0


def ok(cond, nombre, detalle=''):
    global total
    total += 1
    print(('  ok    ' if cond else '  FALLA ') + nombre + ('' if cond else '  ' + str(detalle)))
    if not cond:
        fallos.append(nombre)


# ── 1. Enlaces internos, anclas y recursos locales, sobre el HTML estático ──
def ids_de(pagina, cache={}):
    if pagina not in cache:
        s = BeautifulSoup(open(os.path.join(REPO, pagina), encoding='utf-8').read(), 'html.parser')
        cache[pagina] = {t['id'] for t in s.select('[id]')}
    return cache[pagina]


def revisar_enlaces():
    print('Enlaces internos y recursos locales')
    malos, recursos_malos, n_enl, n_rec = [], [], 0, 0
    for pag in PAGINAS:
        s = BeautifulSoup(open(os.path.join(REPO, pag), encoding='utf-8').read(), 'html.parser')
        for a in s.select('a[href]'):
            h = a['href']
            if re.match(r'^(https?:|mailto:|tel:|//)', h):
                continue
            n_enl += 1
            ruta, _, ancla = h.partition('#')
            destino = ruta or pag
            if not os.path.exists(os.path.join(REPO, unquote(destino))):
                malos.append(pag + ' → ' + h)
            elif ancla and destino.endswith('.html') and ancla not in ids_de(destino):
                malos.append(pag + ' → ' + h + ' (ancla)')
        for el, attr in [('img', 'src'), ('img', 'data-grande'), ('source', 'srcset'), ('video', 'src'), ('video', 'poster'),
                         ('script', 'src'), ('link', 'href'), ('source', 'src')]:
            for t in s.select(el + '[' + attr + ']'):
                vals = [x.strip().split(' ')[0] for x in t[attr].split(',')] if attr == 'srcset' else [t[attr].strip()]
                for v in vals:
                    if not v or re.match(r'^(https?:|data:|//)', v):
                        continue
                    n_rec += 1
                    if not os.path.exists(os.path.join(REPO, unquote(v.split('#')[0].split('?')[0]))):
                        recursos_malos.append(pag + ' → ' + v)
        for t in s.select('[data-portada]'):
            for ext in ('.webp', '.jpg'):
                n_rec += 1
                if not os.path.exists(os.path.join(REPO, t['data-portada'] + ext)):
                    recursos_malos.append(pag + ' → ' + t['data-portada'] + ext)
    ok(not malos, '%d enlaces internos con destino y ancla válidos' % n_enl, malos[:10])
    ok(not recursos_malos, '%d recursos locales existen' % n_rec, recursos_malos[:10])


# Reloj de animación manual: permite simular 30, 60 o 120 Hz y ocultar la pestaña
RELOJ = """
(() => {
  window.__q = []; window.__t = 0; window.__oculto = false;
  window.requestAnimationFrame = cb => { window.__q.push(cb); return window.__q.length; };
  window.cancelAnimationFrame = () => {};
  window.__cuadros = (hz, seg) => {
    const n = Math.round(hz * seg);
    for (let i = 0; i < n; i++) { window.__t += 1000 / hz; const q = window.__q; window.__q = []; q.forEach(cb => cb(window.__t)); }
  };
  Object.defineProperty(document, 'hidden', { get: () => window.__oculto, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => window.__oculto ? 'hidden' : 'visible', configurable: true });
  window.__pestana = oculta => { window.__oculto = oculta; document.dispatchEvent(new Event('visibilitychange')); };
})();
"""


def externas(ctx):
    """El entorno de prueba no tiene salida a internet: las fuentes de Google y las portadas de
    YouTube se responden vacías para que no aparezcan como errores del sitio."""
    ctx.route(re.compile(r'^https?://(?!localhost)'), lambda r: r.fulfill(status=200, body='', content_type='text/css' if 'css' in r.request.url else 'image/gif'))


def contexto(nav, **kw):
    ctx = nav.new_context(**kw)
    externas(ctx)
    return ctx


def recorrer_paginas(nav, nombre, vista, extra):
    print('Páginas en ' + nombre)
    ctx = contexto(nav, viewport=vista, **extra)
    for pag in PAGINAS:
        p = ctx.new_page()
        errores = []
        p.on('console', lambda m: errores.append(m.text) if m.type == 'error' else None)
        p.on('pageerror', lambda e: errores.append(str(e)))
        p.on('requestfailed', lambda r: errores.append('falló ' + r.url + ' ' + str(r.failure)) if r.url.startswith(BASE) and 'ERR_ABORTED' not in str(r.failure) else None)
        p.on('response', lambda r: errores.append('%d %s' % (r.status, r.url)) if r.url.startswith(BASE) and r.status >= 400 else None)
        p.goto(BASE + '/' + pag, wait_until='load')
        p.wait_for_timeout(250)
        if pag != 'preguntas.html':
            # baja por la página para montar todos los interactivos
            alto = p.evaluate('document.body.scrollHeight')
            for y in range(0, alto + 800, 700):
                p.evaluate('window.scrollTo(0, %d)' % y)
                p.wait_for_timeout(15)
            p.wait_for_timeout(200)
            info = p.evaluate("""() => ({
              vis: document.querySelectorAll('[data-vis]').length,
              montados: document.querySelectorAll('[data-vis][data-montado]').length,
              rotos: document.querySelectorAll('[data-vis] .vis-fallback').length,
              ancho: document.documentElement.scrollWidth - window.innerWidth,
              lateral: (() => { const l = document.getElementById('lateral'); return l ? l.children.length : -1; })(),
              navcap: (() => { const n = document.getElementById('nav-cap'); return n ? n.querySelectorAll('a').length : -1; })()
            })""")
            ok(info['montados'] == info['vis'] and info['rotos'] == 0, '%s: %d de %d interactivos montados' % (pag, info['montados'], info['vis']), info)
            ok(info['ancho'] <= 1, '%s: sin desplazamiento horizontal' % pag, 'sobran %d px' % info['ancho'])
            if info['lateral'] >= 0:
                ok(info['lateral'] > 0, '%s: el índice lateral tiene contenido' % pag, info)
            if info['navcap'] >= 0:
                ok(info['navcap'] == 2, '%s: navegación anterior y siguiente completa' % pag, info)
        ok(not errores, '%s: sin errores de consola ni de carga' % pag, errores[:5])
        p.close()
    ctx.close()
    return


def probar_buscador(nav):
    print('Buscador')
    ctx0 = contexto(nav, )
    p = ctx0.new_page()
    p.goto(BASE + '/index.html')
    p.add_script_tag(url=BASE + '/datos/indice.js')
    r = p.evaluate("""() => {
      const B = SITIO.busqueda, I = window.INDICE;
      const urls = q => B.buscar(I, q, 50).map(r => r.e.u);
      const todo = I.map(e => e.x).join(' ');
      return {
        punto: urls('3.63'), coma: urls('3,63'), conEsp: urls('49 683'), sinEsp: urls('49683'),
        parcial: urls('3,6'), parcialDistinto: B.posiciones(B.norm('error de 3,63 %'), '3,6').length === 0 && B.posiciones(B.norm('vale 3,6 m'), '3,6').length === 1, trece: B.posiciones(B.norm('error de 13,63 %'), '3,63').length,
        decimalLargo: B.posiciones(B.norm('3,635'), '3,63').length,
        tilde: urls('odometria').length, conTilde: urls('odometría').length,
        resaltado: B.resaltar('error medio de 3,63 % frente a cinta', B.tokens('3.63')),
        resaltadoPrecio: B.resaltar('hub USB varios 49 683', B.tokens('49683')),
        resaltadoTilde: B.resaltar('La odometría quedó', B.tokens('odometria')),
        miles: B.norm('costó 444 643 pesos y 2 000'), anios: B.norm('entre 2024 y 2026'),
        entradas: I.length, largoMax: Math.max(...I.map(e => e.x.length)),
        tieneTabla: todo.includes('49 683') && todo.includes('Transmisor y receptor HDMI'),
        vacio: B.buscar(I, '   ').length
      };
    }""")
    ok(len(r['punto']) > 0 and r['punto'] == r['coma'], '3.63 y 3,63 dan los mismos resultados (%d)' % len(r['coma']), (r['punto'][:3], r['coma'][:3]))
    ok(any(u.startswith('replicar.html') for u in r['sinEsp']) and r['sinEsp'] == r['conEsp'], '49 683 y 49683 encuentran el precio en Constrúyelo tú', (r['conEsp'], r['sinEsp']))
    ok(r['trece'] == 0 and r['decimalLargo'] == 0, '3,63 no coincide dentro de 13,63 ni de 3,635')
    ok(r['parcialDistinto'], '3,6 no coincide con 3,63: se trata como otro número')
    ok(r['tilde'] > 0 and r['tilde'] == r['conTilde'], 'odometria y odometría dan los mismos resultados')
    ok('<mark>3,63</mark>' in r['resaltado'], 'el resaltado marca 3,63 al buscar 3.63', r['resaltado'])
    ok('<mark>49 683</mark>' in r['resaltadoPrecio'], 'el resaltado conserva el espacio de 49 683', r['resaltadoPrecio'])
    ok('<mark>odometría</mark>' in r['resaltadoTilde'], 'el resaltado conserva la tilde', r['resaltadoTilde'])
    ok(r['miles'] == 'costo 444643 pesos y 2000' and r['anios'] == 'entre 2024 y 2026', 'miles con espacio se unen y los años quedan separados', (r['miles'], r['anios']))
    ok(r['tieneTabla'], 'el índice incluye las filas completas de la tabla de materiales')
    ok(r['vacio'] == 0, 'una consulta vacía no devuelve resultados')
    # cobertura: cada párrafo, fila y elemento de lista de cada página aparece en el índice
    faltan = p.evaluate("""async (paginas) => {
      const B = SITIO.busqueda, por = {};
      INDICE.forEach(e => { const k = e.u.split('#')[0]; por[k] = (por[k] || '') + ' ' + B.norm(e.t) + ' ' + B.norm(e.x); });
      const out = [];
      for (const pg of paginas) {
        if (pg === 'preguntas.html') continue;
        const html = await (await fetch(pg)).text();
        const d = new DOMParser().parseFromString(html, 'text/html');
        d.querySelectorAll('script, style, .fuentes-tema, nav, .lateral, #cabecera, #pie').forEach(x => x.remove());
        d.querySelectorAll('main p, main li, main td, main th, main figcaption, main dd').forEach(x => {
          const t = B.norm(x.textContent).replace(/necesita javascript\\.?/g, '').replace(/\\s+/g, '');
          if (t.length < 20) return;
          const trozo = t.slice(0, 50);
          if (!(por[pg] || '').replace(/\\s+/g, '').includes(trozo)) out.push(pg + ': ' + trozo);
        });
      }
      return out;
    }""", PAGINAS)
    ok(not faltan, 'todo párrafo, fila y lista de las páginas está en el índice', faltan[:8])
    # enlaces de resultados válidos
    malos = []
    for u in sorted(set(p.evaluate("INDICE.map(e => e.u)"))):
        pag, _, ancla = u.partition('#')
        if not os.path.exists(os.path.join(REPO, pag)) or (ancla and ancla not in ids_de(pag)):
            malos.append(u)
    ok(not malos, 'todos los enlaces del índice existen', malos[:5])
    # interfaz
    p.goto(BASE + '/movimiento.html')
    p.keyboard.press('/')
    p.wait_for_selector('dialog.buscador[open]')
    p.fill('dialog.buscador input', '3.63')
    p.wait_for_timeout(400)
    marcas = p.eval_on_selector_all('dialog.buscador .bus-res mark', 'ms => ms.map(m => m.textContent)')
    ok('3,63' in marcas, 'la ventana del buscador resalta 3,63 al escribir 3.63', marcas[:5])
    estado = p.text_content('dialog.buscador .bus-estado')
    ok('resultado' in estado, 'el número de resultados se anuncia a lectores de pantalla', estado)
    p.keyboard.press('Escape')
    ok(p.evaluate("!document.querySelector('dialog.buscador').open"), 'Escape cierra el buscador')
    p.close()


def probar_terminos(nav):
    print('Definiciones emergentes')
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900})
    p = ctx.new_page()
    p.goto(BASE + '/movimiento.html')
    t = p.locator('.term[data-def]').first
    t.scroll_into_view_if_needed()
    vis = lambda: p.evaluate("!!document.querySelector('#burbuja.visible')")
    exp = lambda: t.get_attribute('aria-expanded')
    ok(t.get_attribute('role') == 'button', 'el término tiene rol de botón')
    t.click()
    p.wait_for_timeout(50)
    ok(vis() and exp() == 'true', 'el primer clic muestra la definición')
    p.mouse.move(5, 5)
    p.wait_for_timeout(50)
    ok(vis(), 'fijada con clic, sigue visible al retirar el ratón')
    t.click()
    p.wait_for_timeout(50)
    ok(not vis() and exp() == 'false', 'el segundo clic la cierra')
    t.click()
    p.mouse.click(5, 400)
    p.wait_for_timeout(50)
    ok(not vis(), 'un clic fuera la cierra')
    t.click()
    p.keyboard.press('Escape')
    ok(not vis(), 'Escape la cierra')
    # teclado
    p.evaluate("document.activeElement && document.activeElement.blur()")
    t.focus()
    p.wait_for_timeout(30)
    ok(vis(), 'al enfocar con Tab se muestra')
    p.keyboard.press('Enter')
    ok(vis() and exp() == 'true', 'Enter la deja fija')
    p.keyboard.press('Enter')
    ok(not vis(), 'otro Enter la cierra')
    p.keyboard.press(' ')
    ok(vis(), 'Espacio la abre')
    y0 = p.evaluate('scrollY')
    p.keyboard.press(' ')
    ok(not vis() and p.evaluate('scrollY') == y0, 'Espacio la cierra sin desplazar la página')
    p.keyboard.press('Tab')
    ok(t.evaluate("el => document.activeElement !== el"), 'Tab sale del término, sin trampa de foco')
    ok(not vis() or p.evaluate("document.activeElement.classList.contains('term') || document.activeElement.matches('a.ref')"), 'al salir con Tab la burbuja no queda huérfana')
    ctx.close()
    # toque
    ctx = contexto(nav, viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
    p = ctx.new_page()
    p.goto(BASE + '/movimiento.html')
    t = p.locator('.term[data-def]').first
    t.scroll_into_view_if_needed()
    t.tap()
    p.wait_for_timeout(60)
    ok(p.evaluate("!!document.querySelector('#burbuja.visible')"), 'el primer toque muestra la definición')
    t.tap()
    p.wait_for_timeout(60)
    ok(not p.evaluate("!!document.querySelector('#burbuja.visible')"), 'el segundo toque la cierra')
    t.tap()
    p.touchscreen.tap(20, 700)
    p.wait_for_timeout(60)
    ok(not p.evaluate("!!document.querySelector('#burbuja.visible')"), 'un toque fuera la cierra')
    ctx.close()


def montar(p, pagina, vis):
    p.goto(BASE + '/' + pagina)
    p.evaluate("sel => { const el = document.querySelector(sel); el.scrollIntoView({block: 'center'}); }", '[data-vis="%s"]' % vis)
    p.wait_for_function("sel => document.querySelector(sel).getAttribute('data-montado')", arg='[data-vis="%s"]' % vis, polling=100)
    p.wait_for_timeout(100)
    return '[data-vis="%s"]' % vis


def probar_inflacion(nav):
    print('Simulador de inflación')
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900})
    p = ctx.new_page()
    sel = montar(p, 'navegacion.html', 'inflacion')
    est = lambda: p.evaluate("s => document.querySelector(s).estadoSim()", sel)
    e = est()
    ok(e['st'] == {'x': 0.45, 'y': 0.61, 'ang': 57, 'infl': 0.15}, 'parte en x 0,45, y 0,61, 57° e inflación 0,15', e['st'])
    ok(e['fisico'] is False, 'caso de aceptación: sin contacto físico', e)
    ok(e['margen'] is True, 'caso de aceptación: el contacto con el margen se informa aparte', e)
    txt = p.text_content(sel + ' [data-o="fis"]') + ' | ' + p.text_content(sel + ' [data-o="mar"]') + ' | ' + p.text_content(sel + ' [data-o="msg"]')
    ok(txt.startswith('no | sí') and 'Sin contacto físico' in txt, 'el texto separa contacto físico y margen', txt)
    p.evaluate("s => document.querySelector(s).fijarSim({y: 0.62})", sel)
    ok(est()['fisico'] is True, 'en y 0,62 la esquina cruza el borde: contacto físico')
    p.evaluate("s => document.querySelector(s).fijarSim({x: 0.85, y: 0.70, ang: 0})", sel)
    ok(est()['fisico'] is True, 'frente dentro del mueble: contacto físico')
    p.evaluate("s => document.querySelector(s).fijarSim({x: 0.45, y: 0.45, ang: 0, infl: 0.05})", sel)
    e = est()
    ok(not e['fisico'] and not e['margen'], 'en el centro con inflación mínima: ni contacto ni margen', e)
    # controles sin arrastre
    n = p.locator(sel + ' input[type=range]').count()
    ok(n == 4, 'hay deslizadores para radio, ángulo, x e y (%d)' % n)
    etiquetas = p.evaluate("s => [...document.querySelectorAll(s + ' input[type=range]')].every(i => i.labels && i.labels.length && i.labels[0].textContent.trim().length > 3)", sel)
    ok(etiquetas, 'cada deslizador tiene etiqueta')
    p.fill(sel + ' input[data-k="x"]', '1.2')
    ok(abs(est()['st']['x'] - 1.2) < 1e-9, 'el deslizador x mueve el robot')
    cv = p.locator(sel + ' canvas')
    cv.focus()
    x0 = est()['st']['x']
    p.keyboard.press('ArrowLeft')
    p.keyboard.press('ArrowLeft')
    ok(abs(est()['st']['x'] - (x0 - 0.02)) < 1e-9, 'las flechas con el dibujo enfocado mueven el robot')
    ok(cv.get_attribute('tabindex') == '0' and cv.get_attribute('role') == 'img' and len(cv.get_attribute('aria-label') or '') > 30, 'el dibujo es enfocable y describe su estado')
    ok(p.evaluate("s => getComputedStyle(document.querySelector(s + ' canvas')).touchAction", sel) == 'none', 'el dibujo arrastrable captura el gesto táctil')
    ctx.close()


def probar_dwb(nav):
    print('Simulador DWB')
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900})
    p = ctx.new_page()
    sel = montar(p, 'navegacion.html', 'dwb')
    def con(o):
        return p.evaluate("([s, o]) => { const el = document.querySelector(s); el.fijarSim(o); return el.estadoSim(); }", [sel, o])
    cerca = {'x': 0.72, 'y': 0.72}
    a, b, c = con({'obs': cerca, 'obst': 0}), con({'obs': cerca, 'obst': 20}), con({'obs': cerca, 'obst': 64})
    ok(a['obs'] == cerca, 'el escenario inicial deja el obstáculo junto a la ruta')
    ok(len({(a['v'], a['w']), (b['v'], b['w']), (c['v'], c['w'])}) == 3, 'con el obstáculo cerca, pesos 0, 20 y 64 eligen trayectorias distintas',
       [(a['v'], a['w']), (b['v'], b['w']), (c['v'], c['w'])])
    ok(a['aporteObst'] == 0 and b['aporteObst'] > 0, 'con peso 0 el término de obstáculo no aporta, con peso 20 sí', (a['aporteObst'], b['aporteObst']))
    lejos = {'x': 0.95, 'y': 0.62}
    d, e = con({'obs': lejos, 'obst': 0}), con({'obs': lejos, 'obst': 64})
    ok((d['v'], d['w'], round(d['puntaje'], 9)) == (e['v'], e['w'], round(e['puntaje'], 9)) and e['aporteObst'] == 0, 'con el obstáculo fuera del alcance el peso no cambia nada')
    ok(d['dminTodas'] >= 0.35, 'fuera del alcance: ninguna candidata pasa a menos de 0,35 m', d['dminTodas'])
    msg = p.text_content(sel + ' [data-o="msg"]')
    ok('no aporta nada' in msg, 'el texto explica por qué el aporte es cero', msg)
    filas = p.locator(sel + ' [data-o="tabla"] tr').count()
    ok(filas == 4, 'la tabla muestra los tres términos y el total')
    p.click(sel + ' [data-e="cerca"]')
    ok(p.get_attribute(sel + ' [data-e="cerca"]', 'aria-pressed') == 'true', 'los escenarios predefinidos se marcan como activos')
    p.fill(sel + ' input[data-o-k="x"]', '1.5')
    ok(con({})['obs']['x'] == 1.5, 'el deslizador mueve el obstáculo sin arrastrar')
    p.locator(sel + ' canvas').focus()
    p.keyboard.press('ArrowUp')
    ok(abs(con({})['obs']['y'] - 0.71) < 1e-9, 'las flechas mueven el obstáculo')
    ok(p.get_attribute(sel + ' [data-e="cerca"]', 'aria-pressed') == 'false', 'al mover el obstáculo el escenario deja de marcarse')
    ctx.close()


def probar_exploracion(nav):
    print('Simulador de exploración, reloj simulado')
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900})
    ctx.add_init_script(RELOJ)
    p = ctx.new_page()
    p.goto(BASE + '/exploracion.html')
    sel = '.articulo [data-vis="exploracion"]'
    p.evaluate("s => document.querySelector(s).scrollIntoView({block: 'center'})", sel)
    p.wait_for_function("s => document.querySelector(s) && document.querySelector(s).getAttribute('data-montado')", arg=sel, polling=100)
    est = lambda: p.evaluate("s => document.querySelector(s).estadoSim()", sel)
    def corrida(vel, hz, seg):
        p.click(sel + ' [data-v="%d"]' % vel)
        p.click(sel + ' [data-a="reset"]')
        if not est()['activo']:
            p.click(sel + ' [data-a="play"]')
        p.evaluate("([hz, s]) => window.__cuadros(hz, s)", [hz, seg])
        e = est()
        p.click(sel + ' [data-a="play"]')   # pausa
        return e
    res = {}
    for v in (1, 2, 4):
        for hz in (30, 60, 120):
            res[(v, hz)] = corrida(v, hz, 6)
    for v in (1, 2, 4):
        ts = [res[(v, hz)]['t'] for hz in (30, 60, 120)]
        # el primer cuadro tras pulsar Explorar entrega dt = 0 a propósito, así que se pierde a lo más un cuadro
        ok(all(abs(t - 6 * v) <= v / 30 + 1 / 30 for t in ts), '%d×: 6 s reales dan %s s simulados a 30, 60 y 120 Hz' % (v, [round(t, 2) for t in ts]))
    ok(abs(res[(2, 60)]['t'] / res[(1, 60)]['t'] - 2) < 0.02 and abs(res[(4, 60)]['t'] / res[(1, 60)]['t'] - 4) < 0.02, '2× y 4× avanzan en proporción a 1×')
    a, b = res[(1, 30)], res[(1, 120)]
    ok(a['pasos'] == b['pasos'] and abs(a['x'] - b['x']) < 1e-9 and a['enviadas'] == b['enviadas'], 'mismo resultado a 30 y 120 Hz con igual tiempo simulado')
    c = corrida(1, 60, 12)
    d = corrida(2, 60, 6)
    ok(c['pasos'] == d['pasos'] and abs(c['x'] - d['x']) < 1e-9 and abs(c['y'] - d['y']) < 1e-9, '12 s a 1× y 6 s a 2× dejan al robot en el mismo punto')
    # pausa, reanudación, reinicio y pestaña oculta
    p.click(sel + ' [data-v="1"]'); p.click(sel + ' [data-a="reset"]')
    ok(est()['t'] == 0, 'reiniciar vuelve el tiempo a cero')
    p.click(sel + ' [data-a="play"]')
    p.evaluate("window.__cuadros(60, 2)")
    t1 = est()['t']
    p.click(sel + ' [data-a="play"]')
    p.evaluate("window.__cuadros(60, 3)")
    ok(est()['t'] == t1 and not est()['activo'], 'en pausa el tiempo no avanza')
    p.evaluate("window.__t += 60000")   # un minuto sin cuadros
    p.click(sel + ' [data-a="play"]')
    p.evaluate("window.__cuadros(60, 1)")
    ok(abs(est()['t'] - (t1 + 1)) <= 2 / 30, 'al reanudar no hay salto por el tiempo de pausa', (t1, est()['t']))
    t2 = est()['t']
    p.evaluate("window.__pestana(true)"); p.evaluate("window.__cuadros(60, 3)")
    ok(est()['t'] == t2, 'con la pestaña oculta el tiempo no avanza')
    p.evaluate("window.__t += 120000"); p.evaluate("window.__pestana(false)"); p.evaluate("window.__cuadros(60, 1)")
    ok(abs(est()['t'] - (t2 + 1)) <= 2 / 30, 'al volver a la pestaña no hay salto', (t2, est()['t']))
    ctx.close()


def probar_encoder(nav):
    print('Encoder con movimiento reducido')
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900}, reduced_motion='reduce')
    ctx.add_init_script(RELOJ)
    p = ctx.new_page()
    sel = montar(p, 'movimiento.html', 'encoder')
    est = lambda: p.evaluate("s => document.querySelector(s).estadoSim()", sel)
    e0 = est()
    p.evaluate("window.__cuadros(60, 2)")
    e1 = est()
    ok(not e0['activo'] and e1['ang'] == e0['ang'], 'con movimiento reducido no avanza solo')
    ok(e0['vel'] == e0['control'] and e0['etiqueta'] == '0,60', 'velocidad interna, control y etiqueta coinciden', e0)
    ok(p.text_content(sel + ' [data-a="anim"]') == 'Reproducir', 'ofrece reproducir')
    p.click(sel + ' [data-a="anim"]')
    p.evaluate("window.__cuadros(60, 1)")
    e2 = est()
    ok(e2['activo'] and e2['ang'] > e1['ang'], 'Reproducir inicia la animación')
    ok(p.get_attribute(sel + ' [data-a="anim"]', 'aria-pressed') == 'true' and p.text_content(sel + ' [data-a="anim"]') == 'Pausar', 'el botón refleja el estado')
    p.click(sel + ' [data-a="anim"]')
    a = est()['ang']; p.evaluate("window.__cuadros(60, 1)")
    ok(est()['ang'] == a and not est()['activo'], 'Pausar la detiene')
    c0 = est()['cuenta']; p.click(sel + ' [data-a="paso"]')
    ok(abs(est()['cuenta'] - c0) == 1, 'Avanzar un paso suma exactamente un flanco')
    p.fill(sel + ' #en-v', '1.2')
    e = est()
    ok(e['vel'] == 1.2 and e['etiqueta'] == '1,20', 'el control actualiza velocidad y etiqueta juntas', e)
    ctx.close()
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900})
    ctx.add_init_script(RELOJ)
    p = ctx.new_page()
    sel = montar(p, 'movimiento.html', 'encoder')
    p.evaluate("window.__cuadros(60, 0.5)")
    ok(est()['activo'], 'sin movimiento reducido arranca sola')
    p.emulate_media(reduced_motion='reduce')
    p.wait_for_timeout(50)
    a = est()['ang']; p.evaluate("window.__cuadros(60, 1)")
    ok(not est()['activo'] and est()['ang'] == a, 'si el sistema pasa a movimiento reducido, se detiene')
    p.emulate_media(reduced_motion='no-preference')
    p.wait_for_timeout(50)
    ok(est()['activo'], 'si vuelve a permitir movimiento, retoma')
    ctx.close()


def probar_recursos(nav):
    print('Recursos')
    for nombre, vista in [('escritorio', {'width': 1280, 'height': 900}), ('móvil', {'width': 390, 'height': 844})]:
        ctx = contexto(nav, viewport=vista)
        p = ctx.new_page()
        p.goto(BASE + '/recursos.html')
        p.wait_for_timeout(200)
        r = p.evaluate("""() => {
          const l = document.getElementById('lateral'), n = document.getElementById('nav-cap');
          const rl = l.getBoundingClientRect();
          return { lat: l.querySelectorAll('a').length, enPagina: l.querySelectorAll('.en-pagina a').length, alto: rl.height, ancho: rl.width,
                   nav: [...n.querySelectorAll('a')].map(a => a.getAttribute('href')), actual: !!l.querySelector('a[aria-current=page][href="recursos.html"]'),
                   numeros: [...l.querySelectorAll('.guia-lista .n')].map(x => x.textContent) };
        }""")
        ok(r['lat'] > 10 and r['enPagina'] >= 6 and r['alto'] > 40, '%s: el lateral de Recursos tiene índice útil' % nombre, r)
        ok(r['nav'] == ['lecciones.html', 'index.html'], '%s: navegación anterior y siguiente de Recursos' % nombre, r['nav'])
        ok(r['actual'], '%s: Recursos aparece como página actual' % nombre)
        ok(r['numeros'][:10] == ['%02d' % i for i in range(1, 11)] and r['numeros'][10:] == ['+', '+', '+'], '%s: la numeración de los temas no cambia' % nombre, r['numeros'])
        ctx.close()


with sync_playwright() as pw:
    nav = pw.chromium.launch()
    revisar_enlaces()
    recorrer_paginas(nav, 'escritorio', {'width': 1366, 'height': 900}, {})
    recorrer_paginas(nav, 'móvil', {'width': 390, 'height': 844}, {'has_touch': True, 'is_mobile': True, 'device_scale_factor': 2})
    recorrer_paginas(nav, 'movimiento reducido', {'width': 1280, 'height': 900}, {'reduced_motion': 'reduce'})
    probar_buscador(nav)
    probar_terminos(nav)
    probar_inflacion(nav)
    probar_dwb(nav)
    probar_exploracion(nav)
    probar_encoder(nav)
    probar_recursos(nav)
    nav.close()

print('\n%d de %d comprobaciones correctas' % (total - len(fallos), total))
if fallos:
    print('Fallaron:\n  ' + '\n  '.join(fallos))
sys.exit(1 if fallos else 0)
