"""Imagen para compartir enlaces del sitio (og:image), con el diseño común: img/social.png, de 1200 por 630.

Uso: python3 herramientas/imagen_social.py
Requiere playwright. Las fuentes, el logo y las fotos son los del sitio, así que la imagen se rehace igual
cada vez que cambia el marco o la marca.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def logo():
    cab = (ROOT / 'herramientas/plantillas/cabecera.html').read_text(encoding='utf-8')
    return re.search(r'<svg viewBox="0 0 32 32" aria-hidden="true">.*?</svg>', cab, re.S).group(0)


def pagina():
    f = (ROOT / 'fuentes').as_uri()
    img = (ROOT / 'img/fotos').as_uri()
    return '''<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; src: url('%(f)s/archivo-latin-variable.woff2'); font-weight: 500 800; }
@font-face { font-family: Atkinson; src: url('%(f)s/atkinson-hyperlegible-latin-400-normal.woff2'); font-weight: 400; }
@font-face { font-family: Plex; src: url('%(f)s/ibm-plex-mono-latin-400-normal.woff2'); font-weight: 400; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #f1f1e9; color: #182825; font-family: Atkinson, Arial, sans-serif; display: grid; grid-template-columns: 640px 560px; overflow: hidden; }
.texto { padding: 52px 56px 46px 64px; display: flex; flex-direction: column; border-right: 1px solid #ccd0c3; }
.marca { display: flex; align-items: center; gap: 14px; font: 700 17px/1.08 Archivo, Arial, sans-serif; letter-spacing: .025em; }
.marca svg { width: 46px; height: 46px; stroke: #182825; stroke-width: 1.4; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.marca svg .lidar-centro { fill: #182825; stroke: none; }
.marca svg .barrido, .punto { stroke: #769631; color: #769631; }
.ceja { font: 400 14px/1.6 Plex, monospace; letter-spacing: .14em; color: #4d6140; margin-top: 58px; }
h1 { font: 560 76px/.98 Archivo, Arial, sans-serif; letter-spacing: -.055em; margin-top: 18px; }
h1 span { color: #5f7a2a; }
.bajada { font-size: 23px; line-height: 1.4; color: #4f5c52; margin-top: 24px; max-width: 470px; }
.url { margin-top: auto; font: 400 15px Plex, monospace; letter-spacing: .06em; color: #58655c; }
.fotos { position: relative; background: #142222; }
.mapa { position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover; opacity: .92; }
.robot { position: absolute; left: 34px; bottom: 34px; width: 300px; background: #f1f1e9; border: 1px solid #ccd0c3; padding: 10px 10px 8px; }
.robot img { display: block; width: 100%%; mix-blend-mode: multiply; }
.robot p, .rotulo { font: 400 11px Plex, monospace; letter-spacing: .12em; color: #58655c; margin-top: 6px; }
.rotulo { position: absolute; top: 26px; right: 28px; background: #142222; color: #e8ecde; padding: 6px 10px; margin: 0; }
</style></head><body>
<div class="texto">
  <div class="marca">%(logo)s<span>ROBOT<br>EXPLORADOR<span class="punto">.</span></span></div>
  <p class="ceja">TESIS UTEM · ROS 2 · GUÍA ABIERTA</p>
  <h1>El mundo no viene con un <span>mapa.</span></h1>
  <p class="bajada">Un robot que entra a un lugar que no conoce, lo recorre solo y dibuja su plano.</p>
  <p class="url">svn11x.github.io/tesis_explain</p>
</div>
<div class="fotos">
  <img class="mapa" src="%(img)s/etapa-4-mapa.webp" alt="">
  <p class="rotulo">MAPA EN RVIZ DEL RECINTO DE PRUEBAS</p>
  <div class="robot"><img src="%(img)s/robot-lateral-800.webp" alt=""><p>EL ROBOT REAL</p></div>
</div>
</body></html>''' % {'f': f, 'img': img, 'logo': logo()}


def main():
    tmp = ROOT / 'build' / 'social.html'
    tmp.parent.mkdir(exist_ok=True)
    tmp.write_text(pagina(), encoding='utf-8')
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        p = nav.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
        p.goto(tmp.as_uri(), wait_until='load')
        p.evaluate('document.fonts.ready')
        p.wait_for_timeout(300)
        p.screenshot(path=str(ROOT / 'img/social.png'))
        nav.close()
    tmp.unlink()
    print('img/social.png, 1200 por 630')


if __name__ == '__main__':
    main()
