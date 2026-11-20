"""Genera datos/defensa/catalogo.json con las preguntas de preguntas.html y sus rúbricas.

Uso, desde la raíz del repositorio:
    python scripts/catalogo_defensa.py              # escribe el catálogo
    python scripts/catalogo_defensa.py --comprobar  # solo revisa que esté al día, sin escribir

Opciones para pruebas (por omisión usan los archivos reales):
    --preguntas RUTA  --rubricas RUTA  --salida RUTA  --raiz CARPETA  --total N
"""
from pathlib import Path
import argparse, copy, hashlib, json, re, sys
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PREGUNTAS = ROOT / 'public/preguntas.html'
RUBRICAS = ROOT / 'public/datos/defensa/rubricas.json'
SALIDA = ROOT / 'public/datos/defensa/catalogo.json'
TOTAL_ESPERADO = 106
ESTADOS = ('candidata', 'aprobada', 'suspendida')


def _texto(nodo):
    return re.sub(r'\s+', ' ', nodo.get_text()).strip()


def leer_tarjetas(soup):
    """Devuelve, en el orden de la página, una tarjeta por cada details.pregunta. No modifica el soup."""
    tarjetas = []
    for q in soup.select('details.pregunta'):
        sec = q.find_parent('section', class_='q-tema')
        cuerpo = copy.copy(q.select_one('.q-cuerpo'))
        respaldo = q.select_one('.q-respaldo')
        referencia = None
        if respaldo is not None:
            r = copy.copy(respaldo)
            for b in r.find_all('b', limit=1):
                b.decompose()
            referencia = _texto(r)
        for x in cuerpo.select('.q-respaldo, .q-ver'):
            x.decompose()
        ver = q.select_one('.q-ver a[href]')
        tarjetas.append({
            'id': q['id'],
            'tema': sec['data-tema'] if sec is not None else None,
            'enunciado': q.select_one('.q-t').get_text(' ', strip=True),
            'dificultad': q['data-dificultad'],
            'respaldo': q['data-respuesta'],
            'referencia': referencia,
            'guia': _texto(cuerpo),
            'enlace': ver['href'] if ver is not None else None,
        })
    return tarjetas


def validar(tarjetas, rubricas, raiz, total):
    """Devuelve la lista de errores. Vacía si todo está en orden."""
    errores = []
    vistos, repetidos = set(), []
    for t in tarjetas:
        if t['id'] in vistos and t['id'] not in repetidos:
            repetidos.append(t['id'])
        vistos.add(t['id'])
    for i in repetidos:
        errores.append('ID de pregunta duplicado: %s' % i)
    respaldo = {t['id']: t['respaldo'] for t in tarjetas}
    for i, r in rubricas.items():
        if i not in respaldo:
            errores.append('La rúbrica %s no corresponde a ninguna pregunta' % i)
            continue
        estado = r.get('estado')
        if estado not in ESTADOS:
            errores.append('La rúbrica %s tiene un estado desconocido: %s' % (i, estado))
        if estado == 'aprobada':
            if respaldo[i] == 'pendiente':
                errores.append('La rúbrica %s está aprobada pero la pregunta tiene respaldo pendiente' % i)
            if not r.get('aprobada_por') or not r.get('fecha_aprobacion'):
                errores.append('La rúbrica %s está aprobada sin aprobada_por o sin fecha_aprobacion' % i)
        fuentes = [(r.get('fuente') or {}).get('enlace')]
        fuentes += [c.get('fuente') for c in r.get('criterios', [])]
        fuentes += [c.get('fuente') for c in r.get('contradicciones_criticas', [])]
        for f in fuentes:
            if f and not (raiz / f.split('#')[0]).is_file():
                errores.append('La rúbrica %s cita una fuente que no existe: %s' % (i, f))
    if len(tarjetas) != total:
        errores.append('Se esperaban %d preguntas y hay %d' % (total, len(tarjetas)))
    return errores


def construir(tarjetas, rubricas):
    preguntas = []
    for t in tarjetas:
        r = rubricas.get(t['id'])
        p = dict(t)
        p['rubrica'] = r
        p['evaluable'] = t['respaldo'] == 'guia' and r is not None and r.get('estado') == 'aprobada'
        preguntas.append(p)
    canonico = json.dumps(preguntas, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    return {'version': hashlib.sha256(canonico.encode('utf-8')).hexdigest()[:12], 'total': len(preguntas),
            'pendientes': [t['id'] for t in tarjetas if t['respaldo'] == 'pendiente'], 'preguntas': preguntas}


def serializar(catalogo):
    return json.dumps(catalogo, ensure_ascii=False, indent=1) + '\n'


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--comprobar', action='store_true', help='no escribe: falla si el catálogo está desactualizado')
    ap.add_argument('--preguntas', type=Path, default=PREGUNTAS)
    ap.add_argument('--rubricas', type=Path, default=RUBRICAS)
    ap.add_argument('--salida', type=Path, default=SALIDA)
    ap.add_argument('--raiz', type=Path, default=ROOT / 'public', help='carpeta donde se buscan los archivos de las fuentes')
    ap.add_argument('--total', type=int, default=TOTAL_ESPERADO)
    a = ap.parse_args(argv)
    tarjetas = leer_tarjetas(BeautifulSoup(a.preguntas.read_text(encoding='utf-8'), 'html.parser'))
    rubricas = json.loads(a.rubricas.read_text(encoding='utf-8')).get('rubricas', {})
    errores = validar(tarjetas, rubricas, a.raiz, a.total)
    if errores:
        for e in errores:
            print('Error: ' + e, file=sys.stderr)
        return 1
    texto = serializar(construir(tarjetas, rubricas))
    if a.comprobar:
        # Git en Windows puede convertir los saltos de línea al sacar el archivo: no cuentan como diferencia.
        actual = a.salida.read_bytes().decode('utf-8').replace('\r\n', '\n') if a.salida.exists() else None
        if actual != texto:
            print('El catálogo de defensa quedó atrás. Ejecuta: python scripts/catalogo_defensa.py', file=sys.stderr)
            return 1
        print('Catálogo de defensa al día: %d preguntas' % len(tarjetas))
        return 0
    a.salida.parent.mkdir(parents=True, exist_ok=True)
    with a.salida.open('w', encoding='utf-8', newline='\n') as f:
        f.write(texto)
    print('Catálogo de defensa: %d preguntas' % len(tarjetas))
    return 0


if __name__ == '__main__':
    sys.exit(main())
