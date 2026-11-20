"""Descarga y comprueba los archivos del dictado privado, servidos desde el propio sitio en voz/.

Uso, desde la raíz del repositorio:
    python scripts/descargar_voz.py                  # descarga lo que falte y comprueba las huellas
    python scripts/descargar_voz.py --comprobar      # solo comprueba, sin red
    python scripts/descargar_voz.py --manifiesto     # rehace voz/manifiesto.json tras cambiar una versión

Las versiones quedan fijadas aquí: la biblioteca Transformers.js, el motor ONNX Runtime Web y una revisión
exacta de los pesos de Whisper tiny multilingüe. El navegador nunca pide estos archivos a terceros.
"""
from pathlib import Path
import hashlib, io, json, sys, tarfile, urllib.request

ROOT = Path(__file__).resolve().parents[1]
VOZ = ROOT / 'public/voz'
MANIFIESTO = VOZ / 'manifiesto.json'

TRANSFORMERS = '4.3.2'
ORT = '1.31.0-dev.20260914-8d85527a0'
WHISPER = 'onnx-community/whisper-tiny'
REVISION = 'ff4177021cc41f7db950912b73ea4fdf7d01d8e7'

NPM = 'https://registry.npmjs.org/{p}/-/{n}-{v}.tgz'
PAQUETES = [
    (NPM.format(p='@huggingface/transformers', n='transformers', v=TRANSFORMERS), {
        'package/dist/transformers.min.js': 'transformers/transformers.min.js',
        'package/LICENSE': 'transformers/LICENSE',
    }),
    (NPM.format(p='onnxruntime-web', n='onnxruntime-web', v=ORT), {
        'package/dist/ort-wasm-simd-threaded.asyncify.mjs': 'ort/ort-wasm-simd-threaded.asyncify.mjs',
        'package/dist/ort-wasm-simd-threaded.asyncify.wasm': 'ort/ort-wasm-simd-threaded.asyncify.wasm',
    }),
]
PESOS = ['config.json', 'generation_config.json', 'preprocessor_config.json', 'tokenizer.json',
         'tokenizer_config.json', 'onnx/encoder_model_quantized.onnx', 'onnx/decoder_model_merged_quantized.onnx']
HF = f'https://huggingface.co/{WHISPER}/resolve/{REVISION}/' + '{f}'


def bajar(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'descargar-voz'}), timeout=120) as r:
        return r.read()


def huella(datos):
    return hashlib.sha256(datos).hexdigest()


def fuentes():
    """(ruta en voz/, origen, función que devuelve los bytes)."""
    for url, mapa in PAQUETES:
        for dentro, ruta in mapa.items():
            yield ruta, url + '#' + dentro, (lambda url=url, dentro=dentro: extraer(url, dentro))
    for f in PESOS:
        yield 'whisper-tiny/' + f, HF.format(f=f), (lambda f=f: bajar(HF.format(f=f)))


_tar = {}
def extraer(url, dentro):
    if url not in _tar:
        _tar[url] = tarfile.open(fileobj=io.BytesIO(bajar(url)), mode='r:gz')
    return _tar[url].extractfile(dentro).read()


def comprobar(manifiesto):
    malos = []
    for a in manifiesto['archivos']:
        p = VOZ / a['ruta']
        if not p.is_file() or p.stat().st_size != a['bytes'] or huella(p.read_bytes()) != a['sha256']:
            malos.append(a['ruta'])
    return malos


def main(args):
    if '--manifiesto' in args:
        archivos = []
        for ruta, origen, leer in fuentes():
            datos = leer()
            (VOZ / ruta).parent.mkdir(parents=True, exist_ok=True)
            (VOZ / ruta).write_bytes(datos)
            archivos.append({'ruta': ruta, 'origen': origen, 'bytes': len(datos), 'sha256': huella(datos)})
        m = {'transformers': TRANSFORMERS, 'onnxruntime_web': ORT, 'whisper': WHISPER, 'revision': REVISION,
             'bytes_total': sum(a['bytes'] for a in archivos), 'archivos': archivos}
        MANIFIESTO.write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
        print(f"Manifiesto con {len(archivos)} archivos, {m['bytes_total'] / 1e6:.1f} MB.")
        return 0
    m = json.loads(MANIFIESTO.read_text(encoding='utf-8'))
    if '--comprobar' in args:
        malos = comprobar(m)
        for r in malos:
            print('Falta o cambió:', r)
        print('Voz al día.' if not malos else f'{len(malos)} archivos no coinciden con el manifiesto.')
        return 1 if malos else 0
    origen = {ruta: leer for ruta, _, leer in fuentes()}
    for ruta in comprobar(m):
        a = next(x for x in m['archivos'] if x['ruta'] == ruta)
        datos = origen[ruta]()
        if huella(datos) != a['sha256']:
            print('La descarga no coincide con la huella fijada:', ruta)
            return 1
        (VOZ / ruta).parent.mkdir(parents=True, exist_ok=True)
        (VOZ / ruta).write_bytes(datos)
        print('Descargado', ruta)
    print('Voz al día.')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
