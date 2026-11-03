"""Modelo 3D del prototipo para la portada: modelos/robot.glb, desde el STEP que exporta Fusion.

Uso: python3 herramientas/modelo_robot.py RUTA/tesis_v2.stp
     python3 herramientas/modelo_robot.py --retoque
Requiere: pip install cascadio==0.1.1 trimesh==5.2.0 numpy==2.5.3, y Node para npx @gltf-transform/cli.
El retoque solo no necesita cascadio.

El STEP no va en el repositorio: pesa unos 45 MB. El script lo convierte a triángulos, agrupa las piezas como el
despiece de la portada, quita lo que no se ve, pinta cada grupo como el prototipo y comprime el resultado.
Grupos: cubierta (carcasa, paneles y soporte del LiDAR), traccion (base, ruedas, motores y rueda loca),
electronica (placas, cámara y separadores) y el LiDAR en dos partes, laser_base y laser_cabezal, que es la que gira.

Al final aplica un retoque sobre el modelo comprimido: pinta de amarillo las franjas del frente, deja plano el panel
de la cámara, recalcula las normales y marca los materiales como visibles por las dos caras. Con --retoque se aplica
solo ese paso al modelos/robot.glb actual, sin el STEP. Un modelo ya retocado no se vuelve a retocar.
"""
import collections, os, subprocess, sys, tempfile
import numpy as np
import trimesh

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'modelos', 'robot.glb')
GLTF = ['npx', '--yes', '@gltf-transform/cli@4.1.1']
# Tolerancia de cada grupo al simplificar, como fracción del tamaño de la malla. La carcasa se ve de cerca;
# las placas solo en el despiece.
TOLERANCIA = {'cubierta': 0.0012, 'laser_cabezal': 0.0015, 'laser_base': 0.0025, 'traccion': 0.0015, 'electronica': 0.008}
# Centro del eje de las ruedas en el CAD, en metros, y altura del piso. El modelo web pone ahí el origen, con Y
# hacia arriba y Z hacia el frente curvo del robot.
EJE = np.array([0.075, 0.145, -0.010])
# Interior del LiDAR que queda oculto bajo su carcasa
OCULTO_LIDAR = ('stand-8x2', 'stand_15x2', 'connector-', 'motor-board', 'devboard', 'motherboard', 'bottom-lid', 'detector',
                'laser-mount', 'laser:1', 'Woodscrews', 'wheel:1', 'motor:1')
CABEZAL = ('head:1', 'head-base:1')
PLACAS = ('NanoV3', 'PCB', 'Arduino NANO', 'L298N', 'Body1', 'Cam V2.1')
CUERPOS = {'COMPOUND_1': ('cubierta', 'paneles'), 'COMPOUND_2': ('cubierta', 'carcasa'), 'COMPOUND_3': ('traccion', 'base'),
           'COMPOUND_4': ('traccion', 'motores'), 'COMPOUND_5': ('cubierta', 'soporte_lidar')}
# Piezas que no se publican, por su nombre en el ensamblaje, como 'L298N'. Sirve para quitar un modelo de terceros
# cuya licencia no permita redistribuirlo.
EXCLUIR = ()


def a_web(v):
    x, y, z = v[:, 0] - EJE[0], v[:, 1] - EJE[1], v[:, 2] - EJE[2]
    return np.column_stack([x, z, -y])


def color_de(geo):
    c = getattr(getattr(geo.visual, 'material', None), 'baseColorFactor', None)
    return tuple(int(x) for x in c[:3]) if c is not None else (128, 128, 128)


def clasificar(escena):
    G = escena.graph
    padres, raiz = G.transforms.parents, G.base_frame

    def ruta(n):
        c = [n]
        while c[-1] in padres and padres[c[-1]] != raiz:
            c.append(padres[c[-1]])
        return ' / '.join(str(x) for x in c[::-1])
    piezas = collections.defaultdict(list)
    for n in G.nodes_geometry:
        T, nombre_geo = G[n]
        geo = escena.geometry[nombre_geo]
        r = ruta(n)
        if any(k in r for k in EXCLUIR):
            continue
        m = geo.copy()
        m.apply_transform(T)
        m = trimesh.Trimesh(vertices=a_web(m.vertices), faces=m.faces, process=False)
        col = color_de(geo)
        if 'RP-lidar' in r:
            if not any(k in r for k in OCULTO_LIDAR):
                piezas['laser_cabezal' if any(k in r for k in CABEZAL) else 'laser_base'].append(('lidar', m, col))
        elif any(k in r for k in PLACAS):
            piezas['electronica'].append(('placa', m, col))
        elif nombre_geo == 'COMPOUND':
            # Un compuesto reúne ruedas, rueda loca, la caja que representa la Raspberry Pi y el panel trasero
            for comp in m.split(only_watertight=False):
                b = comp.bounds
                cx, _, cz = (b[0] + b[1]) / 2
                if abs(cx) > 0.08 and b[1][1] < 0.07:
                    piezas['traccion'].append(('rueda', comp, col))
                elif cz > 0.13 and b[1][1] < 0.015:
                    piezas['traccion'].append(('rueda_loca', comp, col))
                elif abs(cx) < 0.04 and b[0][1] > 0.035 and b[1][1] < 0.075 and cz > 0.05:
                    piezas['electronica'].append(('raspberry', comp, col))
                else:
                    piezas['cubierta'].append(('panel_trasero', comp, col))
        elif nombre_geo in CUERPOS:
            grupo, nombre = CUERPOS[nombre_geo]
            piezas[grupo].append((nombre, m, col))
        else:
            piezas['cubierta'].append((nombre_geo, m, col))
    return piezas


# Colores del prototipo: PLA negro, ruedas de goma y motores metálicos. Las placas conservan los de sus modelos.
NEGROS = {'carcasa': (28, 32, 36), 'paneles': (35, 40, 44), 'base': (22, 25, 28), 'soporte_lidar': (42, 47, 51), 'panel_trasero': (31, 35, 39)}


def pintar(grupo, nombre, col):
    if nombre in NEGROS:
        return NEGROS[nombre], .72, .05
    if nombre == 'rueda':
        return (24, 26, 28), .92, 0
    if nombre == 'rueda_loca':
        return (150, 156, 160), .35, .8
    if nombre == 'motores':
        return (168, 172, 170), .4, .7
    if nombre == 'raspberry':
        return (36, 92, 58), .6, .1
    return col, .55, .15 if grupo.startswith('laser') else .2


def lineal(c):
    """glTF guarda el color base en valores lineales. Los colores de arriba están en sRGB, como en el CAD."""
    f = np.array(c, dtype=float) / 255
    return list(np.round(np.where(f <= 0.04045, f / 12.92, ((f + 0.055) / 1.055) ** 2.4) * 255).astype(int))


def sin_menudencias(m):
    """Quita de las placas las piezas de menos de 3,5 mm: resistencias, ledes y serigrafía no se distinguen en la
    portada y son la mayor parte de los triángulos."""
    comps = [c for c in m.split(only_watertight=False) if np.linalg.norm(c.extents) >= 0.0035]
    return trimesh.util.concatenate(comps) if comps else None


def escenas_por_grupo(piezas):
    mezcla = collections.defaultdict(list)
    for g, lista in piezas.items():
        for nombre, m, col in lista:
            c, rug, met = pintar(g, nombre, col)
            if g == 'electronica':
                m = sin_menudencias(m)
            if m is not None:
                mezcla[(g, c, rug, met)].append(m)
    grupos = collections.defaultdict(trimesh.Scene)
    for i, ((g, c, rug, met), mallas) in enumerate(sorted(mezcla.items(), key=lambda kv: kv[0][0])):
        m = trimesh.util.concatenate(mallas)
        m.merge_vertices(merge_tex=True, merge_norm=True)
        # normales suaves en las curvas y aristas vivas sobre 35 grados
        m = trimesh.graph.smooth_shade(m, angle=np.radians(35))
        m.metadata = {}
        m.visual = trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(
            name='%s_%d' % (g, i), baseColorFactor=[*lineal(c), 255], roughnessFactor=rug, metallicFactor=met))
        grupos[g].add_geometry(m, node_name='%s__%d' % (g, i), geom_name='%s_%d' % (g, i))
    return grupos


def gltf(*args):
    subprocess.run(GLTF + [str(a) for a in args], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=RAIZ)


# Retoque final. Corre sobre el modelo ya comprimido: así da el mismo resultado con el STEP o sin él, a partir del
# robot.glb que dejaba la versión anterior de este script.
# Amarillo de las franjas impresas del prototipo, en sRGB, tomado de las fotografías de img/fotos/
FRANJA = (236, 224, 92)
# Ángulo entre caras, en grados, desde el que una arista queda viva. Bajo ese ángulo la superficie se ve suave.
PLIEGUE = 35
# Panel de la cámara: ancho, profundidad de su cara frontal y plano del frente, en metros
PANEL_CAMARA = {'x': 0.0151, 'z': (0.1905, 0.1951), 'plano': 0.195}
MARCA_RETOQUE = 'cubierta__franjas'


def es_franja(lo, hi):
    """Las franjas son cuatro tiras de 5 mm de alto y 10 cm de largo, dos a cada lado del panel de la cámara. En el
    CAD son cuerpos propios dentro de la carcasa y la conversión las pintaba de negro."""
    ext = hi - lo
    return 0.003 <= ext[1] <= 0.007 and ext[0] >= 0.05 and hi[2] >= 0.17 and 0.03 <= (lo[1] + hi[1]) / 2 <= 0.10


def soldar(v, f):
    """Une los vértices de igual posición. Las aristas vivas los duplican, uno por normal."""
    pos, inv = np.unique(np.round(np.asarray(v, dtype=float), 7), axis=0, return_inverse=True)
    return pos, inv.reshape(-1)[np.asarray(f)]


def cuerpos(pos, caras):
    """Etiqueta las caras por pieza: dos caras son de la misma pieza si comparten un vértice."""
    padre = np.arange(len(pos))

    def raiz(i):
        while padre[i] != i:
            padre[i] = padre[padre[i]]
            i = padre[i]
        return i
    for a, b, c in caras:
        ra, rb, rc = raiz(a), raiz(b), raiz(c)
        padre[rb] = ra
        padre[raiz(rc)] = ra
    return np.array([raiz(a) for a in caras[:, 0]])


def aplanar_panel_camara(pos, caras):
    """La simplificación unió las esquinas del panel de la cámara con el fondo del avellanado del lente. La cara
    frontal quedó como un embudo, que se veía como una X. El panel impreso es plano: sus vértices frontales vuelven
    al plano del frente y el agujero del lente queda abierto."""
    p = pos[caras]
    n = np.cross(p[:, 1] - p[:, 0], p[:, 2] - p[:, 0])
    z0, z1 = PANEL_CAMARA['z']
    frente = ((np.abs(p[:, :, 0]).max(axis=1) <= PANEL_CAMARA['x']) & (p[:, :, 2].min(axis=1) >= z0)
              & (p[:, :, 2].max(axis=1) <= z1) & (n[:, 2] > 0.3 * np.linalg.norm(n, axis=1)))
    vertices = np.unique(caras[frente])
    pos = pos.copy()
    pos[vertices, 2] = PANEL_CAMARA['plano']
    return pos, int(frente.sum())


def normales_con_pliegue(pos, caras, angulo=PLIEGUE):
    """Normales por vértice y grupo de suavizado. En cada vértice, las caras que difieren en menos de `angulo` de
    una vecina forman un grupo, y el grupo comparte la normal promedio de sus caras, pesada por el ángulo de cada
    cara en ese vértice. Así los triángulos largos que deja la simplificación no tuercen el sombreado de las caras
    planas. Quita las caras sin área. Devuelve vértices, caras y normales."""
    p = pos[caras]
    fn = np.cross(p[:, 1] - p[:, 0], p[:, 2] - p[:, 0])
    largo = np.linalg.norm(fn, axis=1)
    sana = largo > 1e-12
    caras, p, fn = caras[sana], p[sana], fn[sana] / largo[sana][:, None]

    def angulo_en(a, b, c):
        u, w = b - a, c - a
        cos = np.einsum('ij,ij->i', u, w) / np.maximum(np.linalg.norm(u, axis=1) * np.linalg.norm(w, axis=1), 1e-30)
        return np.arccos(np.clip(cos, -1, 1))
    peso = np.stack([angulo_en(p[:, 0], p[:, 1], p[:, 2]), angulo_en(p[:, 1], p[:, 2], p[:, 0]),
                     angulo_en(p[:, 2], p[:, 0], p[:, 1])], axis=1).reshape(-1)
    limite = np.cos(np.radians(angulo))
    vertice, cara = caras.reshape(-1), np.repeat(np.arange(len(caras)), 3)
    orden = np.argsort(vertice, kind='stable')
    normal = np.zeros((len(vertice), 3))
    for grupo in np.split(orden, np.flatnonzero(np.diff(vertice[orden])) + 1):
        n = fn[cara[grupo]]
        cerca = (n @ n.T) >= limite
        # grupos de suavizado: cierre transitivo de «cerca» entre las caras del vértice
        etiqueta = np.arange(len(grupo))
        while True:
            nueva = np.where(cerca, etiqueta[None, :], len(grupo)).min(axis=1)
            if np.array_equal(nueva, etiqueta):
                break
            etiqueta = nueva
        mismo = etiqueta[:, None] == etiqueta[None, :]
        suma = (mismo * peso[grupo][None, :]) @ n
        lg = np.linalg.norm(suma, axis=1)
        normal[grupo] = np.where(lg[:, None] > 1e-12, suma / np.maximum(lg, 1e-12)[:, None], n)
    unicos, nuevo = np.unique(np.column_stack([vertice, np.round(normal, 4)]), axis=0, return_inverse=True)
    normales = unicos[:, 1:] / np.linalg.norm(unicos[:, 1:], axis=1)[:, None]
    return pos[unicos[:, 0].astype(int)], nuevo.reshape(-1, 3), normales


def material(base, **cambios):
    datos = {'name': base.name, 'baseColorFactor': base.baseColorFactor, 'roughnessFactor': base.roughnessFactor,
             'metallicFactor': base.metallicFactor, 'doubleSided': True}
    datos.update(cambios)
    return trimesh.visual.material.PBRMaterial(**datos)


def retocar(entrada, salida):
    """Franjas amarillas, panel de la cámara plano, normales con pliegue y materiales de dos caras. Las piezas del CAD
    no traen todas sus caras orientadas hacia afuera, y con una sola cara la tapa superior se veía hueca."""
    with tempfile.TemporaryDirectory() as tmp:
        plano = os.path.join(tmp, 'plano.glb')
        gltf('dequantize', entrada, plano)
        escena = trimesh.load(plano, process=False)
        nodos = sorted(escena.graph.nodes_geometry, key=lambda n: (int(n.split('__')[1]) if n.split('__')[1].isdigit() else 10 ** 6, n))
        if MARCA_RETOQUE in nodos:
            print('%s ya tiene el retoque' % os.path.relpath(entrada, RAIZ))
            if os.path.abspath(entrada) != os.path.abspath(salida):
                subprocess.run(['cp', entrada, salida], check=True)
            return
        carcasa, paneles = lineal(NEGROS['carcasa']), lineal(NEGROS['paneles'])
        nueva, franjas, aplanadas = trimesh.Scene(), 0, 0
        for nodo in nodos:
            T, nombre = escena.graph[nodo]
            geo = escena.geometry[nombre].copy()
            geo.apply_transform(T)
            mat = geo.visual.material
            # glTF omite el color base cuando es el blanco por defecto
            color = [int(c) for c in mat.baseColorFactor[:3]] if mat.baseColorFactor is not None else [255, 255, 255]
            pos, caras = soldar(geo.vertices, geo.faces)
            partes = [(nodo, nombre, caras, material(mat))]
            if nodo.startswith('cubierta__') and color == paneles:
                pos, aplanadas = aplanar_panel_camara(pos, caras)
            if nodo.startswith('cubierta__') and color == carcasa:
                pieza = cuerpos(pos, caras)
                es = np.zeros(len(caras), bool)
                for e in np.unique(pieza):
                    sel = pieza == e
                    vs = pos[caras[sel]].reshape(-1, 3)
                    if es_franja(vs.min(axis=0), vs.max(axis=0)):
                        es |= sel
                franjas = int(es.sum())
                if franjas:
                    amarillo = material(mat, name='cubierta_franjas', baseColorFactor=[*lineal(FRANJA), 255], roughnessFactor=.5, metallicFactor=0)
                    partes = [(nodo, nombre, caras[~es], material(mat)), (MARCA_RETOQUE, 'cubierta_franjas', caras[es], amarillo)]
            for n, g, cs, m in partes:
                v, c, normales = normales_con_pliegue(pos, cs)
                malla = trimesh.Trimesh(vertices=v, faces=c, vertex_normals=normales, process=False)
                malla.visual = trimesh.visual.TextureVisuals(material=m)
                nueva.add_geometry(malla, node_name=n, geom_name=g)
        retocado, limpio, podado = (os.path.join(tmp, x) for x in ('retocado.glb', 'limpio.glb', 'podado.glb'))
        nueva.export(retocado, include_normals=True)
        gltf('dedup', retocado, limpio)
        gltf('prune', limpio, podado)
        gltf('meshopt', podado, salida, '--level', 'medium')
    print('retoque: %d caras de franjas en amarillo, %d caras del panel de la cámara en su plano' % (franjas, aplanadas))


def resumen(ruta):
    with tempfile.TemporaryDirectory() as tmp:
        plano = os.path.join(tmp, 'plano.glb')
        gltf('dequantize', ruta, plano)
        resultado, caras = trimesh.load(plano, process=False), collections.Counter()
        for n in resultado.graph.nodes_geometry:
            caras[str(n).split('__')[0]] += len(resultado.geometry[resultado.graph[n][1]].faces)
    print('modelos/robot.glb: %d KB, %d triángulos %s' % (os.path.getsize(ruta) // 1024, sum(caras.values()), dict(caras)))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    if sys.argv[1] == '--retoque':
        retocar(SALIDA, SALIDA)
        resumen(SALIDA)
        return
    import cascadio
    with tempfile.TemporaryDirectory() as tmp:
        bruto = os.path.join(tmp, 'bruto.glb')
        cascadio.step_to_glb(sys.argv[1], bruto, tol_linear=0.6, tol_angular=0.6)
        grupos = escenas_por_grupo(clasificar(trimesh.load(bruto)))
        simplificados = []
        for g, escena in grupos.items():
            a, b, c = (os.path.join(tmp, '%s_%s.glb' % (g, x)) for x in ('a', 'b', 'c'))
            escena.export(a, include_normals=True)
            gltf('weld', a, b)
            gltf('simplify', b, c, '--ratio', 0, '--error', TOLERANCIA[g])
            simplificados.append(c)
        unido, limpio, final = (os.path.join(tmp, x) for x in ('unido.glb', 'limpio.glb', 'final.glb'))
        gltf('merge', *simplificados, unido, '--merge-scenes')
        gltf('dedup', unido, limpio)
        gltf('prune', limpio, final)
        os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
        comprimido = os.path.join(tmp, 'comprimido.glb')
        gltf('meshopt', final, comprimido, '--level', 'medium')
        retocar(comprimido, SALIDA)
    resumen(SALIDA)


if __name__ == '__main__':
    main()
