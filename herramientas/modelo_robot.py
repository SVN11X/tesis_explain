"""Modelo 3D del prototipo para la portada: modelos/robot.glb, desde el STEP que exporta Fusion.

Uso: python3 herramientas/modelo_robot.py RUTA/tesis_v2.stp
Requiere: pip install cascadio==0.1.1 trimesh==5.2.0 numpy==2.5.3, y Node para npx @gltf-transform/cli.

El STEP no va en el repositorio: pesa unos 45 MB. El script lo convierte a triángulos, agrupa las piezas como el
despiece de la portada, quita lo que no se ve, pinta cada grupo como el prototipo y comprime el resultado.
Grupos: cubierta (carcasa, paneles y soporte del LiDAR), traccion (base, ruedas, motores y rueda loca),
electronica (placas, cámara y separadores) y el LiDAR en dos partes, laser_base y laser_cabezal, que es la que gira.
"""
import collections, os, subprocess, sys, tempfile
import numpy as np
import cascadio
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
    subprocess.run(GLTF + [str(a) for a in args], check=True, stdout=subprocess.DEVNULL, cwd=RAIZ)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
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
        resultado, caras = trimesh.load(final), collections.Counter()
        for n in resultado.graph.nodes_geometry:
            caras[str(n).split('__')[0]] += len(resultado.geometry[resultado.graph[n][1]].faces)
        os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
        gltf('meshopt', final, SALIDA, '--level', 'medium')
    print('modelos/robot.glb: %d KB, %d triángulos %s' % (os.path.getsize(SALIDA) // 1024, sum(caras.values()), dict(caras)))


if __name__ == '__main__':
    main()
