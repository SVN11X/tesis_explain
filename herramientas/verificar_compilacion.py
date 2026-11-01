"""Compara las salidas compiladas con HEAD, salvo el UID interno de Astro.

Ejecutar después de npm run build y herramientas/indice.py. Astro 7 calcula
ese UID con la ruta fuente del componente, distinta en cada checkout. El
resto del HTML, todos los recursos y el índice se comparan byte a byte.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML = frozenset({'index.html', 'laboratorios.html'})
SALIDAS = HTML | {'datos/indice.js'}
# Formato emitido por generateHydrateScript en la versión fijada de Astro.
# Se limita al primer atributo de una etiqueta real, nunca a texto o scripts.
UID = re.compile(r'^(<astro-island\s+uid=")([A-Za-z0-9]*)(")')


def normalizar_uids_astro(contenido: bytes) -> bytes:
    texto = contenido.decode('utf-8')
    lineas = [0] + [m.end() for m in re.finditer('\n', texto)]
    reemplazos = []

    class Islas(HTMLParser):
        def handle_starttag(self, tag, attrs):
            if tag != 'astro-island':
                return
            match = UID.match(self.get_starttag_text())
            if match:
                fila, columna = self.getpos()
                inicio = lineas[fila - 1] + columna
                reemplazos.append((inicio + match.start(2), inicio + match.end(2)))

    parser = Islas(convert_charrefs=False)
    parser.feed(texto)
    parser.close()
    for inicio, fin in reversed(reemplazos):
        texto = texto[:inicio] + '__ASTRO_UID__' + texto[fin:]
    return texto.encode('utf-8')


def es_salida(nombre: str) -> bool:
    return nombre in SALIDAS or nombre.startswith('_astro/')


def comparar(esperados: dict[str, bytes], raiz: Path) -> tuple[list[str], list[str]]:
    actuales = {p for p in SALIDAS if (raiz / p).is_file()}
    actuales.update(p.relative_to(raiz).as_posix()
                    for p in (raiz / '_astro').rglob('*') if p.is_file())
    errores = [f'Falta el archivo compilado: {p}' for p in sorted(esperados.keys() - actuales)]
    errores += [f'Recurso nuevo sin versionar: {p}' for p in sorted(actuales - esperados.keys())]
    uids = []
    for nombre in sorted(esperados.keys() & actuales):
        antes, despues = esperados[nombre], (raiz / nombre).read_bytes()
        if antes == despues:
            continue
        if nombre in HTML and normalizar_uids_astro(antes) == normalizar_uids_astro(despues):
            uids.append(nombre)
        else:
            errores.append(f'Salida desactualizada: {nombre}')
    return errores, uids


def main() -> int:
    nombres = subprocess.check_output(
        ['git', 'ls-tree', '-r', '--name-only', '-z', 'HEAD'], cwd=ROOT
    ).decode('utf-8').split('\0')
    esperados = {nombre: subprocess.check_output(['git', 'show', f'HEAD:{nombre}'], cwd=ROOT)
                 for nombre in nombres if es_salida(nombre)}
    if not SALIDAS <= esperados.keys() or not any(p.startswith('_astro/') for p in esperados):
        print('ERROR: HEAD no contiene todas las salidas de la experiencia.', file=sys.stderr)
        return 1
    errores, uids = comparar(esperados, ROOT)
    if errores:
        for error in errores:
            print(f'ERROR: {error}', file=sys.stderr)
        print('Regenera con npm run build y python herramientas/indice.py; '
              'revisa y versiona las salidas junto con sus fuentes.', file=sys.stderr)
        return 1
    print(f'{len(esperados)} archivos compilados al día; contenido y recursos coinciden con HEAD.')
    if uids:
        print('Solo varían los UID internos de Astro entre entornos: ' + ', '.join(uids))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
