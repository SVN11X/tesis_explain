"""Bloques HTML del detalle de costos (robot.html) y de la carta Gantt (problema.html).

Los escribe herramientas/datos.py desde datos/costos.csv y datos/planificacion.json. Los montos deben sumar
lo mismo que cada partida de la Tabla A1.1 de la tesis. Si no, el generador se detiene.
"""
from pathlib import Path
import csv, html, json

ROOT = Path(__file__).resolve().parents[1]
MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
# Partidas y totales de la Tabla A1.1 de la tesis, en pesos chilenos.
TABLA_A11 = {
    'Raspberry Pi 4 Modelo B de 8 GB, carcasa de aluminio y microSD de 64 GB': 91759,
    'RPLidar A1': 83324,
    'Arduino Nano V3 y placa base con bornes de tornillo': 8000,
    'Motorreductor JGA25-370 de 12 V con encoder y rueda': 18038,
    'Driver L298N': 3000,
    'Módulo reductor DC-DC de 25 W': 18858,
    'Batería de 12 V y 3000 mAh con adaptador de montaje': 25658,
    'Rueda loca': 1893,
    'Interruptor, portafusible, conectores XT60 y bloque de distribución': 9547,
    'Filamento PLA+ de 1 kg': 13353,
    'Tornillería, separadores y tuercas de inserción térmica': 127234,
    'Cables, conectores y terminales': 43979,
    'Enrutador de viaje GL.iNet GL-MT300N-V2': 22140,
    'Cables de red RJ45 Cat-6': 8376,
    'Cargador de baterías de 12 V': 16169,
    'Baterías de 12 V de repuesto': 41436,
    'Transmisor y receptor HDMI inalámbrico, cables micro HDMI y hub USB': 49683,
}
TOTAL_ROBOT, TOTAL_PROYECTO = 444643, 582447
GRUPOS = [('Componentes principales del robot', 'principal'), ('Energía, montaje y cableado del robot', 'montaje'),
          ('Operación y desarrollo, fuera del robot', 'operacion')]


def miles(n, sep=' '):
    return '{:,}'.format(int(round(n))).replace(',', sep)


def clp(n):
    """Monto para el texto corrido: sin cortes de línea dentro de la cifra."""
    return miles(n, '\u00a0') + '\u00a0CLP'


def pct(n, d, dec=0):
    return ('{:.%df}' % dec).format(100 * n / d).replace('.', ',') + ' %'


def fecha_corta(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return '%d %s %d' % (d, MESES_CORTOS[m - 1], y)


def leer_costos():
    filas = list(csv.DictReader((ROOT / 'datos/costos.csv').open(encoding='utf-8', newline='')))
    for f in filas:
        f['cantidad'] = int(f['cantidad']); f['precio_unitario_clp'] = int(f['precio_unitario_clp']); f['total_clp'] = int(f['total_clp'])
        if f['cantidad'] * f['precio_unitario_clp'] != f['total_clp']:
            raise SystemExit('costos.csv: total mal calculado en ' + f['elemento'])
    partidas = {}
    for f in filas:
        partidas.setdefault(f['partida'], {'grupo': f['grupo'], 'monto': 0, 'filas': []})
        partidas[f['partida']]['monto'] += f['total_clp']
        partidas[f['partida']]['filas'].append(f)
    if set(partidas) != set(TABLA_A11):
        raise SystemExit('costos.csv: las partidas no coinciden con la Tabla A1.1')
    for nombre, monto in TABLA_A11.items():
        if partidas[nombre]['monto'] != monto:
            raise SystemExit('costos.csv: %s suma %d y la Tabla A1.1 dice %d' % (nombre, partidas[nombre]['monto'], monto))
    robot = sum(p['monto'] for p in partidas.values() if p['grupo'] != GRUPOS[2][0])
    if robot != TOTAL_ROBOT or sum(f['total_clp'] for f in filas) != TOTAL_PROYECTO:
        raise SystemExit('costos.csv: los totales no coinciden con la Tabla A1.1')
    return filas, partidas


def barras(items, maximo, total, clase=''):
    """Lista de barras horizontales: el texto lleva el dato y la barra solo lo dibuja."""
    out = ['<ol class="barras%s">' % (' ' + clase if clase else '')]
    for etiqueta, monto, grupo in items:
        out.append('<li class="g-%s"><span class="b-txt">%s</span><span class="b-num">%s <small>%s</small></span>'
                   '<svg class="b-barra" width="100%%" height="10" aria-hidden="true" focusable="false"><rect class="b-fondo" width="100%%" height="10" rx="5"/>'
                   '<rect class="b-valor" width="%.2f%%" height="10" rx="5"/></svg></li>'
                   % (grupo, html.escape(etiqueta), miles(monto), pct(monto, total, 1 if monto < total / 100 else 0), 100 * monto / maximo))
    out.append('</ol>')
    return ''.join(out)


def bloque_costos():
    filas, partidas = leer_costos()
    clase = dict(GRUPOS)
    orden = sorted(partidas.items(), key=lambda kv: -kv[1]['monto'])
    por_anio = {}
    for f in filas:
        por_anio[f['fecha_compra'][:4]] = por_anio.get(f['fecha_compra'][:4], 0) + f['total_clp']
    compras = len({(f['elemento'], f['fecha_compra'], f['precio_unitario_clp']) for f in filas})
    unidades = sum(f['cantidad'] for f in filas)
    lidar, rpi = TABLA_A11['RPLidar A1'], TABLA_A11['Raspberry Pi 4 Modelo B de 8 GB, carcasa de aluminio y microSD de 64 GB']
    torn = partidas['Tornillería, separadores y tuercas de inserción térmica']
    kit_mayor = max(torn['filas'], key=lambda f: f['total_clp'])
    primera, ultima = min(f['fecha_compra'] for f in filas), max(f['fecha_compra'] for f in filas)
    out = ['<!-- COSTOS DETALLE: generado por herramientas/datos.py desde datos/costos.csv -->']
    out.append('<h3 id="gasto">En qué se fue el dinero</h3>')
    out.append('<p>El registro de compras del autor detalla cada partida de la Tabla A1.1: %d compras y %d unidades, entre %s y %s. '
               'Las dos piezas que dan la autonomía, el LiDAR y la Raspberry Pi con su carcasa y su tarjeta, suman %s, el %s del robot. '
               'La tornillería pesa casi lo mismo. Sus seis kits suman %s, el %s del robot, y el de tuercas M5 y M6 cuesta %s, '
               'casi lo mismo que el LiDAR. La tesis cuenta cada kit completo, aunque se usó solo una parte.</p>'
               % (compras, unidades, fecha_corta(primera), fecha_corta(ultima), clp(lidar + rpi), pct(lidar + rpi, TOTAL_ROBOT),
                  clp(torn['monto']), pct(torn['monto'], TOTAL_ROBOT), clp(kit_mayor['total_clp'])))
    out.append('<div class="widget"><div class="widget-cab"><h3 id="grafico-partidas">Costo de cada partida</h3><span class="tipo datos">Registro de compras</span>'
               '<p>Las 17 partidas de la Tabla A1.1, de mayor a menor, con su parte del proyecto completo.</p></div>'
               '<div class="vis-cuerpo"><ul class="leyenda-grupos">' +
               ''.join('<li class="g-%s"><i aria-hidden="true"></i>%s</li>' % (c, html.escape(g)) for g, c in GRUPOS) + '</ul>' +
               barras([(k, v['monto'], clase[v['grupo']]) for k, v in orden], orden[0][1]['monto'], TOTAL_PROYECTO) + '</div></div>')
    anios = sorted(por_anio.items())
    out.append('<div class="widget"><div class="widget-cab"><h3 id="grafico-anios">Cuándo se pagó</h3><span class="tipo datos">Registro de compras</span>'
               '<p>Gasto de cada año, en pesos nominales. El tipo de cambio de la comparación sale del año en que se gastó más.</p></div>'
               '<div class="vis-cuerpo">' + barras([(a, v, 'anio') for a, v in anios], max(por_anio.values()), TOTAL_PROYECTO, 'anios') + '</div></div>')
    filas_html = []
    for g, c in GRUPOS:
        filas_html.append('<tr><th colspan="5" class="fila-grupo">%s</th></tr>' % html.escape(g))
        for nombre, p in partidas.items():
            if p['grupo'] != g:
                continue
            varias = len(p['filas']) > 1
            if varias:
                filas_html.append('<tr class="partida"><th colspan="3">%s</th><td class="n">%s</td><td></td></tr>' % (html.escape(nombre), miles(p['monto'])))
            for f in p['filas']:
                filas_html.append('<tr%s><td>%s</td><td class="n">%d</td><td class="n">%s</td><td class="n">%s</td><td class="n">%s</td></tr>'
                                  % (' class="item"' if varias else '', html.escape(f['elemento']), f['cantidad'], miles(f['precio_unitario_clp']),
                                     miles(f['total_clp']), fecha_corta(f['fecha_compra'])))
        if c == 'montaje':
            filas_html.append('<tr class="total"><th colspan="3">Total del robot</th><td class="n">%s</td><td></td></tr>' % miles(TOTAL_ROBOT))
    filas_html.append('<tr class="total"><th colspan="3">Total del proyecto</th><td class="n">%s</td><td></td></tr>' % miles(TOTAL_PROYECTO))
    out.append('<details class="detalle"><summary>Ver las %d compras, una por una</summary><div class="tabla-env"><table class="tabla tabla-compras">'
               '<thead><tr><th>Elemento</th><th class="n">Cantidad</th><th class="n">Precio unitario (CLP)</th><th class="n">Total (CLP)</th><th class="n">Compra</th></tr></thead>'
               '<tbody>%s</tbody><caption>Registro de compras del autor, ordenado según la Tabla A1.1. Las tres baterías se compraron juntas: '
               'una va montada en el robot y dos son de repuesto.</caption></table></div></details>' % (compras, ''.join(filas_html)))
    out.append('<!-- FIN COSTOS DETALLE -->')
    return '\n'.join(out)


def bloque_gantt():
    plan = json.loads((ROOT / 'datos/planificacion.json').read_text(encoding='utf-8'))
    spm, meses = plan['semanas_por_mes'], plan['meses']
    n = spm * len(meses)
    hitos = {h['semana']: h for h in plan.get('hitos', [])}
    cols = '<colgroup><col class="g-c-act">' + ''.join('<col%s>' % (' class="g-mes"' if k % spm == 0 else '') for k in range(n)) + '</colgroup>'
    cab1 = '<tr><th scope="col" rowspan="2" class="g-act">Actividad</th>' + ''.join(
        '<th scope="colgroup" colspan="%d">%s</th>' % (spm, m.capitalize()) for m in meses) + '</tr>'
    cab2 = '<tr>' + ''.join('<th scope="col" class="g-sem%s">%d</th>' % (' g-hito' if (k + 1) in hitos else '', k % spm + 1) for k in range(n)) + '</tr>'
    cuerpo = []
    for e_i, e in enumerate(plan['etapas']):
        cuerpo.append('<tr class="g-etapa"><th scope="rowgroup" colspan="%d"><span class="n">%d</span>%s</th></tr>' % (n + 1, e_i + 1, html.escape(e['nombre'])))
        for a in e['actividades']:
            d, h = a['desde'], a['hasta']
            m1, s1, m2, s2 = meses[(d - 1) // spm], (d - 1) % spm + 1, meses[(h - 1) // spm], (h - 1) % spm + 1
            cuando = ('semana %d de %s' % (s1, m1) if d == h else
                      'semanas %d a %d de %s' % (s1, s2, m1) if m1 == m2 else 'semana %d de %s a semana %d de %s' % (s1, m1, s2, m2))
            celdas = ''.join('<td></td>' for _ in range(d - 1))
            celdas += '<td colspan="%d" class="g-barra"><span class="sr">%s</span><i aria-hidden="true"></i></td>' % (h - d + 1, cuando)
            celdas += ''.join('<td></td>' for _ in range(n - h))
            cuerpo.append('<tr><th scope="row" class="g-act">%s</th>%s</tr>' % (html.escape(a['nombre']), celdas))
    for sem, hit in sorted(hitos.items()):
        celdas = ''.join('<td></td>' for _ in range(sem - 1)) + '<td class="g-marca"><span class="sr">%s</span><i aria-hidden="true"></i></td>' % fecha_hito(hit['fecha']) + ''.join('<td></td>' for _ in range(n - sem))
        cuerpo.append('<tr class="g-real"><th scope="row" class="g-act">%s (%s)</th>%s</tr>' % (html.escape(hit['texto']), html.escape(hit['fuente']), celdas))
    total = sum(len(e['actividades']) for e in plan['etapas'])
    return ('<!-- CARTA GANTT: generado por herramientas/datos.py desde datos/planificacion.json -->\n'
            '<div class="widget"><div class="widget-cab"><h3 id="carta-gantt">El plan, semana a semana</h3><span class="tipo datos">Planificación del autor</span>'
            '<p>Carta Gantt de %s a %s de 2026: %d etapas y %d actividades. Cada mes se divide en cuatro semanas.</p></div>'
            '<div class="tabla-env gantt-env"><table class="tabla gantt">' + cols + '<thead>%s%s</thead><tbody>%s</tbody>'
            '<caption>%s</caption></table></div></div>\n'
            '<!-- FIN CARTA GANTT -->') % (meses[0], meses[-1], len(plan['etapas']), total, cab1, cab2, ''.join(cuerpo), html.escape(plan['nota']))


def fecha_hito(iso):
    y, m, d = (int(x) for x in iso.split('-'))
    return '%d %s' % (d, MESES_CORTOS[m - 1])
