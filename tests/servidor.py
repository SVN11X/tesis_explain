"""Servidor HTTP local compartido por las pruebas de navegador.

Cambios frente a ThreadingHTTPServer sin ajustar, que fallaba a veces en Windows bajo carga:
- cola de conexiones pendientes de 1024 (el valor por defecto es 5): una página con muchos
  recursos en paralelo desborda 5 y Windows rechaza la conexión (ERR_CONNECTION_REFUSED);
- hilos daemon, para que un hilo colgado no impida terminar la prueba;
- los cortes del navegador (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)
  no imprimen traza, porque son normales cuando una página se cierra a medias.

Se escucha solo en 127.0.0.1 con puerto 0 (lo asigna el sistema), así que dos pruebas en paralelo
no chocan. Las pruebas deben abrir http://127.0.0.1:<puerto> y no localhost, que en Windows puede
resolverse primero a ::1, donde este servidor no escucha. El socket ya escucha al terminar el
constructor, de modo que no hace falta esperar a que arranque.

Importarlo parchea Page.goto (ver _esperar_scripts). iniciar() sirve dist/ bajo /tesis_explain/, igual que GitHub Pages: lo de fuera del prefijo da 404. Hay que
compilar antes con npm run build.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

DIST = Path(__file__).resolve().parents[1] / 'dist'
PREFIJO = '/tesis_explain'


class ServidorEstable(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 1024

    def handle_error(self, request, client_address):
        if isinstance(sys.exc_info()[1], (ConnectionError, TimeoutError)):
            return
        super().handle_error(request, client_address)


class ManejadorDist(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def translate_path(self, path):
        base = path.split('?', 1)[0].split('#', 1)[0]
        if base != PREFIJO and not base.startswith(PREFIJO + '/'):
            return str(DIST / '__fuera_del_prefijo__')   # no existe: 404, como en GitHub Pages
        return super().translate_path(path[len(PREFIJO):] or '/')

    def handle(self):
        # El navegador corta descargas al cambiar de página; no es un fallo del sitio.
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass


def iniciar():
    """Arranca el servidor de dist/ en un hilo y devuelve (servidor, URL base sin barra final)."""
    if not (DIST / 'index.html').exists():
        raise SystemExit('Falta dist/index.html. Ejecuta antes npm run build.')
    servidor = ServidorEstable(('127.0.0.1', 0), partial(ManejadorDist, directory=str(DIST)))
    Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor, 'http://127.0.0.1:%d%s' % (servidor.server_port, PREFIJO)


def _esperar_scripts():
    """Las páginas de la guía cargan sus scripts después del evento load (scripts/css_critico.py). Playwright
    devuelve goto() en ese evento, así que cada prueba esperaba scripts que aún no estaban. Este parche hace que
    goto() espere además a que el último script corra, que es lo que una persona espera antes de usar la página.
    También muestra todos los paneles de pestañas del teléfono (js/comun.js, pestanas): las pruebas de cada interactivo
    leen y mueven mandos de cualquier grupo sin cambiar de pestaña. La prueba de las pestañas quita esta hoja (#prueba-paneles)."""
    try:
        from playwright.sync_api import Error, Page
    except ImportError:
        return
    goto = Page.goto

    def goto_con_scripts(self, url, **kw):
        respuesta = goto(self, url, **kw)
        if kw.get('wait_until', 'load') in ('load', 'networkidle'):
            try:
                self.wait_for_function('!window.__guiaPendiente', timeout=20000)
            except Error:
                pass
            try:
                self.add_style_tag(content='[role=tabpanel][hidden] { display: grid !important; }').evaluate('e => { e.id = "prueba-paneles"; }')
            except Error:
                pass
        return respuesta
    Page.goto = goto_con_scripts


_esperar_scripts()
