"""Variantes WebP angostas para teléfonos, hechas desde los WebP que ya publica el sitio.

Uso: python3 scripts/variantes_imagen.py [--comprobar]
Sin opciones: busca en public/*.html cada <picture> cuya fuente WebP no tiene descriptores de ancho y cuya imagen
mide 900 px o más. Crea public/img/<ruta>-640.webp (640 px de ancho) y reescribe el srcset con las dos versiones y un
sizes, de modo que un teléfono baja la pequeña. El WebP original y el PNG o JPG de respaldo no se tocan.
--comprobar no escribe nada: falla si falta una variante o si algún <picture> grande sigue sin srcset de anchos.
Requiere Pillow (scripts/requisitos-opcionales.txt). Las variantes ya hechas no se rehacen.
También crea el póster angosto de la portada (POSTERS).
"""
from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'public'
ANCHO = 640          # ancho de la variante, en píxeles
MIN_ANCHO = 900      # solo las imágenes que miden esto o más tienen variante
SIZES = '(max-width: 760px) 92vw, 680px'
# Pósters de video, que no admiten srcset, y el ancho con que se muestran (src/pages/index.astro: .hero-run mide 300 px).
POSTERS = {'img/mapa-crece-fija.webp': 360}
# <source srcset="ruta.webp" type="image/webp"> seguido de <img ... width="N" ...>, con la ruta sin descriptores.
PICTURE = re.compile(
    r'<source srcset="(?P<ruta>[^" ,]+\.webp)" type="image/webp">(?P<ruta_img><img [^>]*?width="(?P<ancho>\d+)")')


def variante(ruta, ancho=ANCHO):
    return re.sub(r'\.webp$', '-%d.webp' % ancho, ruta)


def pendientes():
    """(archivo html, ruta webp, ancho de la imagen) de cada <picture> grande sin srcset de anchos."""
    for html in sorted(PUB.glob('*.html')):
        for m in PICTURE.finditer(html.read_text(encoding='utf-8')):
            if int(m.group('ancho')) >= MIN_ANCHO:
                yield html, m.group('ruta'), int(m.group('ancho'))


def crear(ruta, ancho=ANCHO):
    from PIL import Image
    origen, destino = PUB / ruta, PUB / variante(ruta, ancho)
    if destino.exists():
        return
    with Image.open(origen) as im:
        if im.width <= ancho:
            raise SystemExit('%s mide %d px, no necesita variante' % (ruta, im.width))
        alto = round(im.height * ancho / im.width)
        im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB').resize((ancho, alto), Image.LANCZOS).save(
            destino, 'WEBP', quality=82, method=6)
    print('%s: %d KB' % (destino.relative_to(PUB), destino.stat().st_size // 1000))


def anchos_reales(ruta):
    from PIL import Image
    with Image.open(PUB / ruta) as im:
        return im.width


def principal():
    comprobar = '--comprobar' in sys.argv
    errores = []
    for html, ruta, _ in pendientes():
        if comprobar:
            errores.append('%s: %s sin srcset de anchos' % (html.name, ruta))
    # También en modo comprobación: toda variante que el HTML nombra debe existir.
    for html in sorted(PUB.glob('*.html')):
        for ruta in re.findall(r'srcset="([^" ,]+-%d\.webp) %dw' % (ANCHO, ANCHO), html.read_text(encoding='utf-8')):
            if not (PUB / ruta).is_file():
                errores.append('%s: falta %s' % (html.name, ruta))
    for ruta, ancho in POSTERS.items():
        if comprobar and not (PUB / variante(ruta, ancho)).is_file():
            errores.append('falta el póster %s' % variante(ruta, ancho))
    if comprobar:
        if errores:
            print('\n'.join(sorted(set(errores))))
            sys.exit(1)
        print('variantes_imagen: todas las imágenes grandes tienen su variante de %d px' % ANCHO)
        return
    for ruta, ancho in POSTERS.items():
        crear(ruta, ancho)
    vistas = {}
    for html, ruta, _ in pendientes():
        vistas.setdefault(ruta, set()).add(html)
    for ruta in sorted(vistas):
        crear(ruta)
        ancho = anchos_reales(ruta)
        for html in vistas[ruta]:
            texto = html.read_text(encoding='utf-8')
            viejo = '<source srcset="%s" type="image/webp">' % ruta
            nuevo = '<source srcset="%s %dw, %s %dw" sizes="%s" type="image/webp">' % (
                variante(ruta), ANCHO, ruta, ancho, SIZES)
            html.write_text(texto.replace(viejo, nuevo), encoding='utf-8', newline='\n')


if __name__ == '__main__':
    principal()
