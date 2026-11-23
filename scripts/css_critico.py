"""CSS crítico de las páginas de la guía y carga de hojas y scripts sin bloquear el primer pintado ni el evento load.

datos.py llama a `aplicar(texto, pub, en_linea=False)` por cada página, así que la página guardada
lleva `<style data-critico></style>` en lugar del CSS crítico. `python scripts/css_critico.py dist`
rellena ese marcador en el sitio compilado, y solo allí. Dos bloques marcados salen del <head>:

- ESTILOS: el CSS de la primera pantalla en un <style>, y las hojas completas con media="print" y
  onload (pasan a "all" al llegar), con su <link> normal dentro de <noscript>. Sin JavaScript la
  página se ve con las hojas completas, como antes.
- SCRIPTS: un cargador mínimo que inserta los scripts en orden después del primer pintado (con el evento load como respaldo). La lista
  vive en el atributo data-diferidos. js/sitio.js espera el evento "guia:scripts" para montar los
  interactivos, así sabe que los archivos de cada módulo ya registraron sus funciones.

css/fuentes.css (fuentes y respaldos) va entero y solo en línea. Dos veces la misma @font-face, una en línea y otra
en la hoja completa, crea dos fuentes y la página se recompone al llegar la segunda.

El CSS crítico son las reglas de las hojas cuyo selector solo usa clases, ids y etiquetas que están
en la página o que crean sus scripts compartidos. No se corta en la primera pantalla: el alto de la ventana
varía y cualquier elemento visible sin su regla se movería cuando llegue la hoja completa.
Las reglas con :hover o :active no se incluyen. El resto llega con la hoja completa, en el mismo orden.
"""
import posixpath
import re
import sys
from pathlib import Path

# Marcador que dejan las páginas guardadas en public/. El sitio compilado lo cambia por el CSS crítico.
PLACEHOLDER = '<style data-critico></style>'

# Clases que el script del <head> pone en <html> antes del primer pintado.
CLASES_CABEZA = {'resaltado-animado'}
LEGADO_HOJAS = re.compile(r'(?:<link rel="stylesheet" href="css/[^"]+">\n)+')
LEGADO_SCRIPTS = re.compile(r'(?:<script src="[^"]+" defer></script>\n)+')
BLOQUE_ESTILOS = re.compile(r'<!-- ESTILOS:[^>]*-->\n.*?<!-- FIN ESTILOS -->\n', re.S)
BLOQUE_SCRIPTS = re.compile(r'<!-- SCRIPTS:[^>]*-->\n.*?<!-- FIN SCRIPTS -->\n', re.S)

# Los scripts empiezan después del primer pintado (un cuadro de animación tras DOMContentLoaded) y no después del
# evento load. Las fuentes retrasan load, y cualquier cambio de estilo de los scripts con las fuentes ya llegadas
# hace que el navegador las use aunque sean optional, con lo que el texto saltaría. La clase js de <html> se pone
# aquí, antes del primer pintado, para que las reglas .js no aparezcan tarde.
CARGADOR = ('document.documentElement.classList.add("js");(function(){var l=document.currentScript.getAttribute("data-diferidos").split(" "),w=window,h=0;w.__guiaPendiente=1;'
            'function f(){if(h)return;h=1;var n=l.length,k=0;l.forEach(function(u){var s=document.createElement("script");s.src=u;s.async=false;'
            's.onload=s.onerror=function(){if(++k===n){w.__guiaPendiente=0;document.dispatchEvent(new Event("guia:scripts"))}};document.head.appendChild(s)})}'
            'function g(){requestAnimationFrame(function(){setTimeout(f,0)})}'
            'w.addEventListener("load",f);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",g);else g()})()')


def _sin_comentarios(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def _cadena(css, j):
    """Posición del cierre de la cadena que empieza en j."""
    q = css[j]
    j += 1
    while j < len(css) and css[j] != q:
        j += 2 if css[j] == '\\' else 1
    return j


def _bloques(css):
    """Parte el CSS en (preludio, cuerpo) de primer nivel. cuerpo es None en las reglas sin llaves."""
    i, n, salida = 0, len(css), []
    while i < n:
        j = i
        while j < n and css[j] not in '{;':
            j = _cadena(css, j) if css[j] in '"\'' else j
            j += 1
        if j >= n:
            break
        if css[j] == ';':
            salida.append((css[i:j].strip(), None))
            i = j + 1
            continue
        prof, k = 1, j + 1
        while k < n and prof:
            if css[k] in '"\'':
                k = _cadena(css, k)
            elif css[k] == '{':
                prof += 1
            elif css[k] == '}':
                prof -= 1
            k += 1
        salida.append((css[i:j].strip(), css[j + 1:k - 1]))
        i = k
    return salida


def _selectores(texto):
    partes, prof, ini = [], 0, 0
    for i, c in enumerate(texto):
        if c in '([':
            prof += 1
        elif c in ')]':
            prof -= 1
        elif c == ',' and not prof:
            partes.append(texto[ini:i].strip())
            ini = i + 1
    partes.append(texto[ini:].strip())
    return [p for p in partes if p]


def _vocabulario(region, js=''):
    """Clases, ids y etiquetas que existen en la página o que crean sus scripts. Los scripts de la guía (marco, sitio,
    comun) construyen la barra lateral, los botones de ampliar y el video; sus estilos también deben estar en línea, o
    esos elementos se moverían cuando llegue la hoja completa."""
    clases = set(CLASES_CABEZA)
    for m in re.finditer(r'\sclass="([^"]*)"', region):
        clases.update(m.group(1).split())
    ids = set(re.findall(r'\sid="([^"]+)"', region))
    etiquetas = {m.lower() for m in re.findall(r'<([a-zA-Z][\w-]*)', region)} | {'html', 'body'}
    palabras = set(re.findall(r'[A-Za-z][\w-]*', js))
    return clases | palabras, ids | palabras, etiquetas | {p.lower() for p in palabras}


def _coincide(selector, vocab):
    clases, ids, etiquetas = vocab
    if ':hover' in selector or ':active' in selector or '\\' in selector:
        return False
    s = re.sub(r'\[[^\]]*\]', '', selector)
    previo = None
    while previo != s:
        previo = s
        s = re.sub(r'::?[\w-]+\([^()]*\)', '', s)
    s = re.sub(r'::?[\w-]+', '', s)
    if not all(c in clases for c in re.findall(r'\.([\w-]+)', s)):
        return False
    if not all(i in ids for i in re.findall(r'#([\w-]+)', s)):
        return False
    resto = re.sub(r'[.#][\w-]+', ' ', s)
    return all(t.lower() in etiquetas for t in re.findall(r'[A-Za-z][\w-]*', resto))


def _filtrar(css, vocab, keyframes):
    """Reglas de css que sirven a la primera pantalla. Los @keyframes se guardan aparte."""
    salida = []
    for preludio, cuerpo in _bloques(css):
        if cuerpo is None:
            salida.append(preludio + ';')
        elif preludio.startswith('@font-face'):
            continue  # las fuentes viven en css/fuentes.css y van enteras en línea
        elif preludio.startswith(('@media', '@supports')):
            dentro = _filtrar(cuerpo, vocab, keyframes)
            if dentro:
                salida.append(preludio + '{' + dentro + '}')
        elif preludio.startswith('@keyframes'):
            keyframes[preludio.split()[-1]] = '@keyframes ' + preludio.split()[-1] + '{' + cuerpo + '}'
        elif preludio.startswith('@'):
            continue
        else:
            buenos = [s for s in _selectores(preludio) if _coincide(s, vocab)]
            if buenos:
                salida.append(','.join(buenos) + '{' + cuerpo.strip() + '}')
    return ''.join(salida)


def _rutas(css, hoja):
    """Las url() de una hoja son relativas a la hoja. En la página lo son a la página, así que se reescriben."""
    def una(m):
        ruta = m.group(2)
        if re.match(r'(data:|https?:|/|#)', ruta):
            return m.group(0)
        return 'url(%s%s%s)' % (m.group("q"), posixpath.normpath(posixpath.join(posixpath.dirname(hoja), ruta)), m.group("q"))
    return re.sub(r'''url\((?P<q>['"]?)([^)'"]+)(?P=q)\)''', una, css)


def _compactar(css):
    css = re.sub(r'\s+', ' ', css)
    return re.sub(r'\s*([{};,>])\s*', r'\1', css).replace(';}', '}').strip()


def critico(texto, hojas, pub):
    """CSS de la primera pantalla de una página, desde sus hojas en orden."""
    cuerpo = texto[texto.index('<body'):]
    js = ''.join((pub / 'js' / n).read_text(encoding='utf-8') for n in ('marco.js', 'sitio.js', 'comun.js'))
    vocab = _vocabulario(cuerpo, js)
    keyframes = {}
    css = ''.join(_filtrar(_rutas(_sin_comentarios((pub / h).read_text(encoding='utf-8')), h), vocab, keyframes) for h in hojas)
    # los @keyframes solo se llevan si algo del CSS crítico los usa
    css += ''.join(k for nombre, k in keyframes.items() if re.search(r'animation[^;}]*\b' + re.escape(nombre) + r'\b', css))
    return _compactar(css)


def fuentes(pub):
    """css/fuentes.css entero, con sus rutas relativas a la página."""
    return _compactar(_rutas(_sin_comentarios((pub / 'css/fuentes.css').read_text(encoding='utf-8')), 'css/fuentes.css'))


def bloque_estilos(texto, pub, en_linea=True):
    m = BLOQUE_ESTILOS.search(texto)
    if m:
        hojas = re.findall(r'<noscript><link rel="stylesheet" href="([^"]+)"></noscript>', m.group(0))
    else:
        m = LEGADO_HOJAS.search(texto)
        hojas = re.findall(r'href="([^"]+)"', m.group(0)) if m else []
    if not hojas:
        return None
    partes = ['<!-- ESTILOS: generado por scripts/datos.py. CSS de la primera pantalla en línea y hojas completas sin bloquear -->\n',
              # Las fuentes van en su propio <style>, antes del resto. Con las reglas en el mismo <style> el navegador usa
              # las fuentes optional que llegan tarde en cuanto la página se recompone (tests/navegador_experiencia.py).
              '<style>' + fuentes(pub) + '</style>\n',
              '<style>' + critico(texto, hojas, pub) + '</style>\n' if en_linea else PLACEHOLDER + '\n']
    partes += ['<link rel="stylesheet" href="%s" media="print" onload="this.media=\'all\'">\n' % h for h in hojas]
    partes += ['<noscript><link rel="stylesheet" href="%s"></noscript>\n' % h for h in hojas]
    partes.append('<!-- FIN ESTILOS -->\n')
    return ''.join(partes)


def bloque_scripts(texto):
    m = BLOQUE_SCRIPTS.search(texto)
    if m:
        lista = re.search(r'data-diferidos="([^"]+)"', m.group(0)).group(1).split()
    else:
        m = LEGADO_SCRIPTS.search(texto)
        if not m:
            return None
        lista = re.findall(r'src="([^"]+)"', m.group(0))
    if 'datos/proyecto.js' not in lista and 'js/comun.js' in lista:
        lista.insert(lista.index('js/comun.js'), 'datos/proyecto.js')
    return ('<!-- SCRIPTS: generado por scripts/datos.py. Se cargan en orden después del primer pintado -->\n'
            '<script data-diferidos="%s">%s</script>\n<!-- FIN SCRIPTS -->\n' % (' '.join(lista), CARGADOR))


def aplicar(texto, pub, en_linea=True):
    """Aplica los dos bloques a una página de la guía. Las demás páginas no tienen <main> y no cambian.
    Con en_linea=False deja <style data-critico></style> y el CSS crítico se rellena al compilar (rellenar)."""
    if '<main' not in texto:
        return texto
    scripts = bloque_scripts(texto)
    if scripts:
        texto = (BLOQUE_SCRIPTS if BLOQUE_SCRIPTS.search(texto) else LEGADO_SCRIPTS).sub(lambda _: scripts, texto, count=1)
    estilos = bloque_estilos(texto, pub, en_linea)
    if estilos:
        texto = (BLOQUE_ESTILOS if BLOQUE_ESTILOS.search(texto) else LEGADO_HOJAS).sub(lambda _: estilos, texto, count=1)
    return texto


def rellenar(carpeta):
    """Cambia el marcador del CSS crítico por el CSS en las páginas ya compiladas de carpeta (dist).
    Falla si una página de la guía se queda con el marcador vacío."""
    carpeta = Path(carpeta)
    rellenas, sin_critico = 0, []
    for path in sorted(carpeta.glob('*.html')):
        texto = path.read_text(encoding='utf-8')
        if PLACEHOLDER not in texto:
            continue
        m = BLOQUE_ESTILOS.search(texto)
        hojas = re.findall(r'<noscript><link rel="stylesheet" href="([^"]+)"></noscript>', m.group(0)) if m else []
        if not hojas:
            if '<main' in texto:
                sin_critico.append(path.name)
            continue
        texto = texto.replace(PLACEHOLDER, '<style>' + critico(texto, hojas, carpeta) + '</style>', 1)
        path.write_text(texto, encoding='utf-8', newline='\n')
        rellenas += 1
    print('%d páginas con el CSS crítico rellenado en %s' % (rellenas, carpeta))
    if sin_critico:
        raise SystemExit('CSS crítico sin rellenar: ' + ', '.join(sin_critico))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Uso: python scripts/css_critico.py <carpeta>')
    rellenar(sys.argv[1])

