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
"""
import sys
from http.server import ThreadingHTTPServer


class ServidorEstable(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 1024

    def handle_error(self, request, client_address):
        if isinstance(sys.exc_info()[1], (ConnectionError, TimeoutError)):
            return
        super().handle_error(request, client_address)
