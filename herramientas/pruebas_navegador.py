"""Pruebas del sitio en un navegador real (Chromium con Playwright).

Uso, desde la raíz del repositorio:
    pip install playwright beautifulsoup4 && python3 -m playwright install chromium
    python3 -m http.server 8765 &
    python3 herramientas/pruebas_navegador.py [http://localhost:8765]

Comprueba: errores de consola y de carga en las 15 páginas, en escritorio y en móvil; que
todos los interactivos se monten; desborde horizontal en móvil; enlaces internos, anclas y
recursos locales; el buscador; las definiciones con ratón, toque y teclado; los simuladores
de inflación, DWB, exploración y encoder; la página de Recursos; el contenido plegado y sus
anclas; el botón Ampliar; el alto mínimo de los controles en un teléfono; el visor de fotos,
el esquema con puntos, la línea de tiempo y los bloques de video preparados.
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
        # videos preparados: sus archivos se exigen solo cuando el bloque deja de estar oculto
        for t in s.select('[data-src], [data-poster]'):
            if t.find_parent(attrs={'hidden': True}) is not None:
                continue
            for attr in ('data-src', 'data-poster'):
                if t.has_attr(attr):
                    n_rec += 1
                    if not os.path.exists(os.path.join(REPO, t[attr])):
                        recursos_malos.append(pag + ' → ' + t[attr])
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
    """El entorno de prueba no tiene salida a internet: las portadas de YouTube y cualquier otro
    recurso externo se responden vacíos para que no aparezcan como errores del sitio."""
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
            # los interactivos dentro de un details cerrado se montan al abrirlo, eso se prueba aparte
            info = p.evaluate("""() => ({
              vis: [...document.querySelectorAll('[data-vis]')].filter(e => !e.closest('details:not([open])')).length,
              montados: [...document.querySelectorAll('[data-vis][data-montado]')].filter(e => !e.closest('details:not([open])')).length,
              rotos: [...document.querySelectorAll('[data-vis] .vis-fallback')].filter(e => !e.closest('details:not([open])')).length,
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
        d.querySelectorAll('script, style, .fuentes-tema, nav, .lateral, #cabecera, #pie, [hidden]').forEach(x => x.remove());
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
        if nombre == 'escritorio':
            e = p.evaluate("""() => { const pie = document.querySelector('.pie'), ab = document.getElementById('abstract').closest('section');
              return { mit: !!pie.querySelector('a[href$="/LICENSE"]'), cc: !!pie.querySelector('a[href*="licenses/by/4.0"]'), rev: (pie.querySelector('time') || {}).textContent || '',
                       autor: !!pie.querySelector('a[href="recursos.html#autor"]'), versionOculta: [...pie.querySelectorAll('p[hidden]')].some(x => x.textContent.includes('Basado en la versión')),
                       lang: ab.getAttribute('lang'), abstract: ab.textContent.includes('Keywords'), ocultos: document.querySelectorAll('#autor ~ * [hidden], #autor ~ [hidden]').length }; }""")
            ok(e['mit'] and e['cc'] and e['rev'] and e['autor'] and e['versionOculta'], 'el pie muestra la licencia, la fecha de revisión y el enlace al autor, con la versión de la tesis pendiente y oculta', e)
            ok(e['lang'] == 'en' and e['abstract'] and e['ocultos'] >= 3, 'el abstract va en inglés y los datos pendientes del autor quedan ocultos', e)
        ctx.close()


def probar_plegados(nav):
    print('Contenido plegado y anclas')
    ctx = contexto(nav, viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
    p = ctx.new_page()
    p.goto(BASE + '/control.html#ciclo')
    p.wait_for_function("document.querySelector('[data-vis=ciclo]').getAttribute('data-montado')", polling=100)
    p.wait_for_timeout(300)
    r = p.evaluate("""() => { const h = document.getElementById('ciclo'), d = h.closest('details'), rc = h.getBoundingClientRect();
      return { abierto: d.open, arriba: Math.round(rc.top), alto: innerHeight }; }""")
    ok(r['abierto'] and 0 <= r['arriba'] < r['alto'], 'al cargar con un ancla plegada se abre el details y se llega al destino', r)
    plegado = p.evaluate("!document.querySelector('[data-vis=windup]').closest('details').open")
    ok(plegado, 'el otro bloque plegado sigue cerrado')
    p.evaluate("location.hash = 'sim-windup'")
    p.wait_for_function("document.querySelector('[data-vis=windup]').getAttribute('data-montado')", polling=100)
    p.wait_for_timeout(400)
    r = p.evaluate("""() => { const el = document.querySelector('[data-vis=windup]'), svg = el.querySelector('svg');
      return { abierto: el.closest('details').open, svg: svg ? svg.getBoundingClientRect().width : 0, caja: el.getBoundingClientRect().width,
               ancho: document.documentElement.scrollWidth - innerWidth }; }""")
    ok(r['abierto'], 'al cambiar el ancla a un bloque plegado, el details se abre')
    ok(0 < r['svg'] <= r['caja'] + 1 and r['ancho'] <= 1, 'el interactivo plegado toma el ancho de su contenedor al abrirse', r)
    # resultado del buscador hacia un bloque plegado de la misma página
    p.goto(BASE + '/control.html')
    p.wait_for_timeout(200)
    ok(p.evaluate("[...document.querySelectorAll('details.detalle')].every(d => !d.open)"), 'sin ancla, los bloques técnicos parten plegados')
    p.evaluate("document.getElementById('btn-buscar').click()")
    p.wait_for_selector('dialog.buscador[open]')
    p.fill('dialog.buscador input', 'Un ciclo del firmware')
    p.wait_for_timeout(500)
    p.keyboard.press('Enter')
    p.wait_for_timeout(400)
    ok(p.evaluate("location.hash === '#ciclo' && document.getElementById('ciclo').closest('details').open"), 'un resultado del buscador abre el bloque plegado de destino')
    # enlace interno, como el índice lateral o una cita, hacia algo plegado
    p.goto(BASE + '/recursos.html')
    p.wait_for_timeout(200)
    p.evaluate("""() => { const a = document.createElement('a'); a.href = '#r-yamauchi1997'; a.id = 'prueba-enlace'; a.textContent = 'x'; document.querySelector('main').prepend(a); }""")
    p.click('#prueba-enlace')
    p.wait_for_timeout(300)
    r = p.evaluate("""() => { const li = document.getElementById('r-yamauchi1997'), rc = li.getBoundingClientRect(); return { abierto: li.closest('details').open, arriba: rc.top, alto: innerHeight }; }""")
    ok(r['abierto'] and 0 <= r['arriba'] < r['alto'], 'un clic en un enlace interno abre la bibliografía plegada y muestra la referencia', r)
    s = p.locator('details.detalle > summary').first
    s.focus()
    ok(p.evaluate("document.activeElement.tagName === 'SUMMARY'"), 'el control para desplegar se alcanza con teclado')
    ctx.close()


def probar_ampliar(nav):
    print('Botón Ampliar')
    for nombre, kw in [('escritorio', {'viewport': {'width': 1280, 'height': 900}}), ('teléfono', {'viewport': {'width': 390, 'height': 844}, 'has_touch': True, 'is_mobile': True})]:
        ctx = contexto(nav, **kw)
        p = ctx.new_page()
        p.goto(BASE + '/replicar.html')
        p.wait_for_timeout(200)
        r = p.evaluate("""() => { const figs = document.querySelectorAll('figure.ampliable'), bs = document.querySelectorAll('.b-ampliar');
          const b = document.querySelector('figure img[data-grande*=circuito]').closest('figure').querySelector('.b-ampliar');
          const cs = getComputedStyle(b);
          return { figs: figs.length, botones: bs.length, etiqueta: b.getAttribute('aria-label'), texto: b.textContent.trim(), visible: cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.5 }; }""")
        ok(r['figs'] >= 2 and r['figs'] == r['botones'], '%s: cada figura ampliable tiene su botón (%d)' % (nombre, r['botones']), r)
        ok(r['etiqueta'] == 'Ampliar imagen' and r['texto'] == 'Ampliar' and r['visible'], '%s: el botón es visible, dice Ampliar y tiene etiqueta accesible' % nombre, r)
        b = p.locator('figure:has(img[data-grande*="circuito"]) .b-ampliar')
        b.scroll_into_view_if_needed()
        if nombre == 'teléfono':
            b.tap()
        else:
            b.focus(); p.keyboard.press('Enter')
        p.wait_for_timeout(150)
        r = p.evaluate("() => { const d = document.querySelector('dialog.lightbox'); return { abierto: d.open, src: d.querySelector('img').getAttribute('src') }; }")
        ok(r['abierto'] and r['src'].endswith('circuito.png'), '%s: el botón abre la imagen grande' % nombre, r)
        p.keyboard.press('Escape')
        p.wait_for_timeout(100)
        ok(p.evaluate("!document.querySelector('dialog.lightbox').open && document.activeElement.classList.contains('b-ampliar')"), '%s: Escape cierra y el foco vuelve al botón' % nombre)
        ok(len(re.findall(r'(?i)ha[zg]a? clic', p.evaluate("document.querySelector('main').innerText"))) == 0, '%s: las leyendas no piden hacer clic' % nombre)
        ctx.close()


def probar_tactil(nav):
    print('Controles en un teléfono de 390 por 844')
    ctx = contexto(nav, viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True, device_scale_factor=2)
    sel = '.lateral a, .miga a, .b-ctl, .cab button, .cab a.btn-icono, .b-ampliar, .vbtn, .chip, .segmento button, details.detalle > summary'
    for pag in ['index.html', 'robot.html', 'control.html', 'exploracion.html', 'resultados.html', 'recursos.html']:
        p = ctx.new_page()
        p.goto(BASE + '/' + pag)
        p.wait_for_timeout(250)
        p.evaluate("document.querySelectorAll('.lateral details').forEach(d => d.open = true)")
        alto = p.evaluate('document.body.scrollHeight')
        for y in range(0, alto + 800, 700):
            p.evaluate('window.scrollTo(0, %d)' % y)
            p.wait_for_timeout(10)
        p.wait_for_timeout(200)
        r = p.evaluate("""(sel) => { const out = [], n = { total: 0 };
          document.querySelectorAll(sel).forEach(el => { const rc = el.getBoundingClientRect(); if (!rc.width || !rc.height || el.closest('[hidden]')) return;
            n.total++; if (rc.height < 43.5) out.push((el.className || el.tagName) + ' ' + (el.textContent || '').trim().slice(0, 20) + ' ' + rc.height.toFixed(1)); });
          return { total: n.total, chicos: out, ancho: document.documentElement.scrollWidth - innerWidth }; }""", sel)
        ok(r['total'] > 3 and not r['chicos'], '%s: %d controles miden al menos 44 px de alto' % (pag, r['total']), r['chicos'][:6])
        ok(r['ancho'] <= 1, '%s: sin desborde horizontal en el teléfono' % pag, r['ancho'])
        p.close()
    ctx.close()
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900})
    p = ctx.new_page()
    p.goto(BASE + '/control.html')
    p.wait_for_timeout(200)
    h = p.evaluate("Math.round(document.querySelector('.miga a').getBoundingClientRect().height)")
    ok(h < 44, 'con ratón la ruta de navegación conserva su tamaño (%d px)' % h)
    ctx.close()


def probar_vistas(nav):
    print('Visor de fotos del prototipo')
    for nombre, kw in [('escritorio', {'viewport': {'width': 1280, 'height': 900}}), ('teléfono', {'viewport': {'width': 390, 'height': 844}, 'has_touch': True, 'is_mobile': True})]:
        ctx = contexto(nav, **kw)
        p = ctx.new_page()
        estatico = open(os.path.join(REPO, 'robot.html'), encoding='utf-8').read()
        ok(not re.search(r'robot-(frente|derecha|planta)\.(jpg|webp)', estatico) and 'data-vis="vistas"' in estatico,
           '%s: las fotos del visor no están en el HTML y se piden al montarlo, con la carga diferida del sitio' % nombre)
        sel = montar(p, 'robot.html', 'vistas')
        est = lambda: p.evaluate("s => document.querySelector(s).estadoVista()", sel)
        cab = p.evaluate("s => document.querySelector(s).closest('.widget').querySelector('.tipo').textContent", sel)
        ok(cab == 'Fotos del prototipo', '%s: el visor lleva la etiqueta Fotos del prototipo' % nombre, cab)
        botones = p.eval_on_selector_all(sel + ' .visor-ctl button', 'bs => bs.map(b => b.textContent)')
        ok(botones == ['Frente', 'Derecha', 'Lateral', 'Desde arriba'], '%s: botones Frente, Derecha, Lateral y Desde arriba' % nombre, botones)
        e = est()
        ok(e['id'] == 'frente' and e['src'].endswith('robot-frente.jpg') and len(e['alt']) > 40, '%s: parte en la vista de frente con texto alternativo' % nombre, e)
        if nombre == 'teléfono':
            p.locator(sel + ' .visor-ctl button', has_text='Desde arriba').tap()
        else:
            p.click(sel + ' .visor-ctl button:has-text("Desde arriba")')
        e = est()
        ok(e['id'] == 'planta' and 'visualizador de tensión' in e['alt'] and p.get_attribute(sel + ' .visor-ctl button:has-text("Desde arriba")', 'aria-pressed') == 'true', '%s: el botón cambia a la vista desde arriba' % nombre, e)
        p.focus(sel + ' .visor')
        p.keyboard.press('ArrowRight')
        ok(est()['id'] == 'frente', '%s: la flecha derecha avanza y vuelve al inicio' % nombre, est())
        p.keyboard.press('ArrowLeft')
        ok(est()['id'] == 'planta', '%s: la flecha izquierda retrocede' % nombre)
        caja = p.locator(sel + ' .visor-marco').bounding_box()
        y = caja['y'] + caja['height'] / 2
        p.evaluate("""([s, x0, x1, y]) => { const m = document.querySelector(s + ' .visor-marco');
          m.dispatchEvent(new PointerEvent('pointerdown', { clientX: x0, clientY: y, bubbles: true, pointerType: 'touch' }));
          m.dispatchEvent(new PointerEvent('pointerup', { clientX: x1, clientY: y, bubbles: true, pointerType: 'touch' })); }""",
                   [sel, caja['x'] + caja['width'] * 0.8, caja['x'] + caja['width'] * 0.2, y])
        ok(est()['id'] == 'frente', '%s: deslizar hacia la izquierda pasa a la vista siguiente' % nombre, est())
        p.mouse.move(caja['x'] + 40, y); p.mouse.down(); p.mouse.move(caja['x'] + 200, y, steps=5); p.mouse.up()
        ok(est()['id'] == 'planta', '%s: arrastrar hacia la derecha con el ratón vuelve a la anterior' % nombre, est())
        alts = p.evaluate("""s => { const el = document.querySelector(s), out = []; for (let k = 0; k < 4; k++) { el.querySelectorAll('.visor-ctl button')[k].click(); out.push(el.estadoVista().alt); } return out; }""", sel)
        ok(len(set(alts)) == 4 and all('negra' in a and ('LiDAR' in a) for a in alts), '%s: cada vista tiene su propio texto alternativo' % nombre, alts)
        ancho = p.evaluate('document.documentElement.scrollWidth - innerWidth')
        ok(ancho <= 1, '%s: el visor no desborda la página' % nombre, ancho)
        ctx.close()


def probar_esquema(nav):
    print('Esquema de conexiones con puntos')
    for nombre, kw in [('escritorio', {'viewport': {'width': 1280, 'height': 900}}), ('teléfono', {'viewport': {'width': 390, 'height': 844}, 'has_touch': True, 'is_mobile': True})]:
        ctx = contexto(nav, **kw)
        p = ctx.new_page()
        sel = montar(p, 'robot.html', 'esquema')
        p.wait_for_timeout(300)
        r = p.evaluate("""s => { const el = document.querySelector(s), img = el.querySelector('img'), ri = img.getBoundingClientRect();
          const pts = [...el.querySelectorAll('.punto')];
          return { n: pts.length, tipo: el.closest('.widget').querySelector('.tipo').textContent,
            enPorcentaje: pts.every(b => /%$/.test(b.style.left) && /%$/.test(b.style.top)),
            dentro: pts.every(b => { const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; return cx >= ri.left && cx <= ri.right && cy >= ri.top && cy <= ri.bottom; }),
            nombres: pts.map(b => b.getAttribute('aria-label')), ampliar: !!el.querySelector('.b-ampliar') }; }""", sel)
        ok(r['n'] >= 10 and r['tipo'] == 'Datos de la tesis', '%s: %d puntos sobre la figura, con la etiqueta Datos de la tesis' % (nombre, r['n']), r)
        ok(r['enPorcentaje'] and r['dentro'], '%s: los puntos van en porcentaje y quedan dentro de la imagen' % nombre, r)
        ok(all(x in r['nombres'] for x in ['Arduino Nano', 'Driver L298N', 'Regulador de tensión', 'Motor derecho con encoder']), '%s: hay puntos en el Arduino, el L298N, el regulador y los motores' % nombre, r['nombres'])
        ok(r['ampliar'], '%s: la figura del esquema también se puede ampliar' % nombre)
        b = p.locator(sel + ' .punto[aria-label="Arduino Nano"]')
        if nombre == 'teléfono':
            b.tap()
        else:
            b.click()
        e = p.evaluate("s => document.querySelector(s).estadoEsquema()", sel)
        ok('Arduino Nano' in e['texto'] and 'encoders' in e['texto'] and b.get_attribute('aria-pressed') == 'true', '%s: tocar un punto muestra su explicación' % nombre, e)
        p.focus(sel + ' .punto[aria-label="Driver L298N"]')
        p.keyboard.press('Enter')
        e = p.evaluate("s => document.querySelector(s).estadoEsquema()", sel)
        ok('L298N' in e['texto'] and 'PWM' in e['texto'], '%s: con el teclado se activa un punto' % nombre, e)
        ok(p.evaluate("s => document.querySelector(s + ' .esquema-info').getAttribute('aria-live')", sel) == 'polite', '%s: la explicación se anuncia a lectores de pantalla' % nombre)
        ctx.close()


def probar_preparados(nav):
    print('Línea de tiempo y bloques de video preparados')
    ctx = contexto(nav, viewport={'width': 1280, 'height': 900})
    p = ctx.new_page()
    pedidas = []
    p.on('request', lambda r: pedidas.append(r.url))
    for pag in ['movimiento.html', 'exploracion.html', 'gemelo.html']:
        p.goto(BASE + '/' + pag)
        p.wait_for_timeout(200)
        r = p.evaluate("""() => [...document.querySelectorAll('.bucle video')].filter(v => v.closest('[hidden]')).map(v => ({
          oculto: true, src: v.querySelector('source').getAttribute('data-src'), conSrc: v.querySelector('source').hasAttribute('src') || v.hasAttribute('poster'),
          ctl: !!v.parentElement.querySelector('.b-ctl'), muted: v.muted || v.hasAttribute('muted'), loop: v.hasAttribute('loop') }))""")
        ok(len(r) == 1 and not r[0]['conSrc'] and not r[0]['ctl'] and r[0]['muted'] and r[0]['loop'], '%s: el bloque de video espera oculto, mudo y en bucle, sin pedir archivos' % pag, r)
        html = open(os.path.join(REPO, pag), encoding='utf-8').read()
        ok('PENDIENTE AUTOR' in html and r and r[0]['src'] in html, '%s: el bloque lleva su comentario PENDIENTE AUTOR' % pag)
    malos = [u for u in pedidas if re.search(r'(falla-sin-avance|meta-reemplazada|sim-vs-real)', u)]
    ok(not malos, 'no se piden los videos que todavía no existen', malos)
    p.goto(BASE + '/problema.html#metodo')
    p.wait_for_timeout(300)
    r = p.evaluate("""() => { const lis = [...document.querySelectorAll('.linea.con-fotos > li')];
      return { n: lis.length, imgs: lis.filter(li => li.querySelector('img')).length, huecos: lis.filter(li => li.querySelector('.linea-proceso[hidden]')).length,
        tops: lis.map(li => Math.round(li.getBoundingClientRect().top)), fechas: document.querySelectorAll('.linea.con-fotos time').length }; }""")
    ok(r['n'] == 6 and r['imgs'] == 5 and r['huecos'] == 6 and r['fechas'] == 0, 'la línea de tiempo tiene seis etapas, cinco imágenes, un espacio oculto por etapa y ninguna fecha', r)
    ok(len(set(r['tops'])) == 1, 'en escritorio la línea de tiempo es horizontal', r['tops'])
    ctx.close()
    ctx = contexto(nav, viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
    p = ctx.new_page()
    p.goto(BASE + '/problema.html#metodo')
    p.wait_for_timeout(300)
    r = p.evaluate("""() => { const lis = [...document.querySelectorAll('.linea.con-fotos > li')]; return { tops: lis.map(li => Math.round(li.getBoundingClientRect().top)), lefts: lis.map(li => Math.round(li.getBoundingClientRect().left)) }; }""")
    ok(all(a < b for a, b in zip(r['tops'], r['tops'][1:])) and len(set(r['lefts'])) == 1, 'en el teléfono la línea de tiempo es vertical', r)
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
    probar_plegados(nav)
    probar_ampliar(nav)
    probar_tactil(nav)
    probar_vistas(nav)
    probar_esquema(nav)
    probar_preparados(nav)
    nav.close()

print('\n%d de %d comprobaciones correctas' % (total - len(fallos), total))
if fallos:
    print('Fallaron:\n  ' + '\n  '.join(fallos))
sys.exit(1 if fallos else 0)
