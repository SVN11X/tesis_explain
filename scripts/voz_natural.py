"""Genera la voz natural pregrabada de las preguntas de defensa y de los resúmenes de la guía.

Uso, desde la raíz del repositorio:
    python scripts/voz_natural.py --comprobar        # sin GPU ni torch: compara el manifiesto con los textos
    python scripts/voz_natural.py --texto            # muestra el texto que se dirá, sin generar
    python scripts/voz_natural.py                    # genera lo que falta o cambió (necesita GPU)
    python scripts/voz_natural.py --solo 10p,5r      # piloto: 10 preguntas y 5 resúmenes
    python scripts/voz_natural.py --lote 4 --medir   # mide un tamaño de lote sin escribir nada

La generación usa Qwen3-TTS 1.7B Base (Apache 2.0) que clona la voz de referencia de VOZ_REFERENCIA. Hace falta
torch con CUDA, qwen-tts, soundfile y beautifulsoup4, el modelo en la caché de Hugging Face (HF_HOME) y ffmpeg. Los audios
quedan en public/audio/ como AAC mono en .m4a, que suena en todos los navegadores, y public/audio/manifiesto.json
guarda para cada uno la huella del texto de origen. Si cambia un texto o la tabla de pronunciación, la
comprobación falla hasta regenerar. Ver docs/decisions/0010-voz-natural-pregenerada.md.
"""
from pathlib import Path
import argparse, hashlib, json, os, re, subprocess, sys, tempfile, time

ROOT = Path(__file__).resolve().parents[1]
SALIDA = ROOT / 'public/audio'
MANIFIESTO = SALIDA / 'manifiesto.json'
CATALOGO = ROOT / 'public/datos/defensa/catalogo.json'
VOZ_REFERENCIA = ROOT / 'scripts/voz-referencia'
MODELO = 'Qwen/Qwen3-TTS-12Hz-1.7B-Base'
VERSION = 1
BITRATE = '48k'

# ── Texto de origen ──────────────────────────────────────────────────────────────────────────────────────────────


def normalizar_visible(texto):
    """Lo que ve la persona, sin las citas. js/voz-resumen.js calcula lo mismo para buscar el audio."""
    t = re.sub(r'\s+', ' ', texto).strip()
    return re.sub(r'\s+([.,;:])', r'\1', t)


def huella(texto):
    return hashlib.sha256(texto.encode('utf-8')).hexdigest()[:16]


def fuentes():
    """Lista de {clave, tipo, texto}: las preguntas del catálogo y los párrafos .resumen de la guía."""
    from bs4 import BeautifulSoup
    salida = []
    catalogo = json.loads(CATALOGO.read_text(encoding='utf-8'))['preguntas']
    vistos = set()
    for q in catalogo:
        texto = normalizar_visible(q['enunciado'])
        clave = 'q-' + huella(texto)
        if clave in vistos:
            continue
        vistos.add(clave)
        salida.append({'clave': clave, 'tipo': 'pregunta', 'texto': texto, 'id': q['id']})
    for pagina in sorted((ROOT / 'public').glob('*.html')):
        sopa = BeautifulSoup(pagina.read_text(encoding='utf-8'), 'html.parser')
        for p in sopa.select('p.resumen'):
            for a in p.select('a.ref'):
                a.decompose()
            texto = normalizar_visible(p.get_text())
            clave = 'r-' + huella(texto)
            if clave in vistos:
                continue
            vistos.add(clave)
            salida.append({'clave': clave, 'tipo': 'resumen', 'texto': texto})
    return salida


# ── Pronunciación: solo para el habla, nunca para lo que se ve ───────────────────────────────────────────────────

UNIDADES = [
    (r'\bticks?/ciclo\b', 'ticks por ciclo'), (r'\brad/s\b', 'radianes por segundo'), (r'\bm/s\b', 'metros por segundo'),
    (r'\bm²', 'metros cuadrados'), (r'\bkm\b', 'kilómetros'), (r'\bcm\b', 'centímetros'), (r'\bmm\b', 'milímetros'),
    (r'\bms\b', 'milisegundos'), (r'\bHz\b', 'hercios'), (r'(?<=\d) s\b', ' segundos'), (r'(?<=\d) m\b', ' metros'),
    (r'(?<=\d) V\b', ' voltios'), (r'(?<=\d) g\b', ' gramos'), (r'(?<=\d) A\b', ' amperios'),
    (r'\bCLP\b', 'pesos chilenos'), (r'°', ' grados'), (r'%', ' por ciento'),
]
SIGLAS = [
    (r'\bOE(\d)\b', r'objetivo específico \1'), (r'\bLiDAR\b', 'láidar'), (r'\bRPLidar\b', 'ar pe láidar'),
    (r'\bSLAM\b', 'eslam'), (r'\bslam_toolbox\b', 'eslam toolbox'), (r'\bROS 2\b', 'ros dos'), (r'\bROSCon\b', 'ros con'),
    (r'\bROS\b', 'ros'), (r'\bNav2\b', 'nav dos'), (r'\bNavFn\b', 'nav efe ene'), (r'\bPWM\b', 'pe uve doble eme'),
    (r'\bPID\b', 'pe i de'), (r'\bPI\b', 'pe i'), (r'\bPSO\b', 'pe ese o'), (r'\bPLA\+', 'pe ele a'),
    (r'\bFOPDT\b', 'efe o pe de te'), (r'\bAMCL\b', 'a eme ce ele'), (r'\bDWB\b', 'de uve doble be'),
    (r'\bRViz\b', 'ar vis'), (r'\bREP (\d+)', r'rep \1'), (r'\bSI\b', 'ese i'), (r'\bPGM\b', 'pe ge eme'),
    (r'\bYAML\b', 'yámel'), (r'\bIP\b', 'i pe'), (r'\bCPU\b', 'ce pe u'), (r'\bCycloneDDS\b', 'cíclon de de ese'),
    (r'\bUMBmark\b', 'u eme be mark'), (r'\bA\*', 'a estrella'), (r'\b2D\b', 'dos de'), (r'\b3D\b', 'tres de'),
    (r'\bKp\b', 'ka pe'), (r'\bKi\b', 'ka i'), (r'\bKd\b', 'ka de'), (r'\bKo\b', 'ka o'), (r'\bITerm\b', 'i term'),
    (r'\bΔ', 'delta '), (r'\bFigs\.', 'figuras'), (r'\bTabla ([A-Z])(\d)', r'tabla \1 \2'),
    (r'\b([AB])(\d)\b', r'\1 \2'), (r'\bu\[k\]', 'u de ka'),
]
SIMBOLOS = [
    (r'\s*→\s*', ', '), (r'±', 'más menos '), (r'[−–](?=\d)', 'menos '), (r' = ', ' igual a '), (r' \+ ', ' más '),
    (r'(?<=\d) / (?=\d)', ' dividido por '), (r'/dev/', 'dev '), (r'_', ' '), (r'\bÅ', 'O'),
]

UNI = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece',
       'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós',
       'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
DEC = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
CEN = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos',
       'ochocientos', 'novecientos']


def palabras(n):
    """Entero de 0 a 999 999 999 en español."""
    if n < 30:
        return UNI[n]
    if n < 100:
        d, u = divmod(n, 10)
        return DEC[d] + (' y ' + UNI[u] if u else '')
    if n < 1000:
        c, r = divmod(n, 100)
        if n == 100:
            return 'cien'
        return CEN[c] + (' ' + palabras(r) if r else '')
    if n < 1_000_000:
        m, r = divmod(n, 1000)
        cab = 'mil' if m == 1 else palabras(m) + ' mil'
        return cab + (' ' + palabras(r) if r else '')
    m, r = divmod(n, 1_000_000)
    cab = 'un millón' if m == 1 else palabras(m) + ' millones'
    return cab + (' ' + palabras(r) if r else '')


def tras_coma(cifras):
    """Parte decimal: de una o dos cifras se dice como número, de más cifras se deletrea."""
    if len(cifras) <= 2 and not cifras.startswith('0'):
        return palabras(int(cifras))
    return ' '.join(palabras(int(c)) for c in cifras)


def numeros(texto):
    texto = re.sub(r'(?<=\d) (?=\d{3}\b)', '', texto)                  # 115 200 -> 115200
    texto = re.sub(r'\b(\d+),(\d+)\b', lambda m: palabras(int(m[1])) + ' coma ' + tras_coma(m[2]), texto)
    texto = re.sub(r'\b(\d+(?:\.\d+)+)\b', lambda m: ' punto '.join(
        tras_coma(p) if len(p) > 1 and p.startswith('0') else palabras(int(p)) for p in m[1].split('.')), texto)
    return re.sub(r'\b\d+\b', lambda m: palabras(int(m[0])), texto)


def hablado(texto):
    """El texto tal como se dice. Cambia la forma de las siglas, las unidades y las cifras, no el sentido."""
    for patron, reemplazo in SIGLAS + UNIDADES + SIMBOLOS:
        texto = re.sub(patron, reemplazo, texto)
    texto = numeros(texto)
    return re.sub(r'\s+', ' ', texto).replace(' ,', ',').strip()


# ── Manifiesto ───────────────────────────────────────────────────────────────────────────────────────────────────


def leer_manifiesto():
    if MANIFIESTO.exists():
        return json.loads(MANIFIESTO.read_text(encoding='utf-8'))
    return {'version': VERSION, 'modelo': MODELO, 'formato': 'audio/mp4', 'entradas': {}}


def escribir_manifiesto(m):
    m['entradas'] = dict(sorted(m['entradas'].items()))
    MANIFIESTO.write_text(json.dumps(m, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')


def al_dia(entrada, fuente):
    return (entrada and entrada['texto'] == huella(fuente['texto']) and entrada['habla'] == huella(hablado(fuente['texto']))
            and (SALIDA / entrada['archivo']).exists())


def comprobar():
    m = leer_manifiesto()
    fuera = []
    srcs = fuentes()
    claves = {f['clave'] for f in srcs}
    for f in srcs:
        e = m['entradas'].get(f['clave'])
        if not e:
            fuera.append(f"falta el audio de {f['clave']}")
        elif e['texto'] != huella(f['texto']) or e['habla'] != huella(hablado(f['texto'])):
            fuera.append(f"el texto de {f['clave']} cambió")
        elif not (SALIDA / e['archivo']).exists():
            fuera.append(f"falta el archivo {e['archivo']}")
    for clave, e in m['entradas'].items():
        if clave not in claves:
            fuera.append(f'el audio {clave} ya no tiene texto de origen')
    if fuera:
        print('La voz natural no está al día. Ejecuta: python scripts/voz_natural.py')
        for linea in fuera[:15]:
            print(' -', linea)
        if len(fuera) > 15:
            print(f' ... y {len(fuera) - 15} más')
        return 1
    print(f'Voz natural al día: {len(srcs)} audios.')
    return 0


# ── Generación ───────────────────────────────────────────────────────────────────────────────────────────────────


def codificar(wav, destino):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(wav), '-ac', '1', '-c:a', 'aac', '-b:a', BITRATE,
                    '-movflags', '+faststart', str(destino)], check=True)


def cargar_modelo():
    import torch
    from qwen_tts import Qwen3TTSModel
    modelo = Qwen3TTSModel.from_pretrained(MODELO, device_map='cuda:0', dtype=torch.float16, attn_implementation='sdpa')
    ref = VOZ_REFERENCIA.with_suffix('.wav')
    texto_ref = VOZ_REFERENCIA.with_suffix('.txt').read_text(encoding='utf-8').strip()
    prompt = modelo.create_voice_clone_prompt(ref_audio=str(ref), ref_text=texto_ref)
    return modelo, prompt


def sintetizar(modelo, prompt, textos):
    import torch
    with torch.inference_mode():
        wavs, sr = modelo.generate_voice_clone(text=textos, language=['Spanish'] * len(textos), voice_clone_prompt=prompt)
    return wavs, sr


def generar(args):
    import soundfile as sf
    import torch
    srcs = fuentes()
    if args.solo:
        n_p, n_r = (int(x[:-1]) for x in args.solo.split(','))
        pre = [f for f in srcs if f['tipo'] == 'pregunta'][:n_p]
        res = [f for f in srcs if f['tipo'] == 'resumen'][::max(1, len([f for f in srcs if f['tipo'] == 'resumen']) // n_r)][:n_r]
        srcs = pre + res
    m = leer_manifiesto()
    pendientes = [f for f in srcs if args.medir or not al_dia(m['entradas'].get(f['clave']), f)]
    if not pendientes:
        print('Nada que generar.')
        return 0
    SALIDA.mkdir(parents=True, exist_ok=True)
    pendientes.sort(key=lambda f: len(f['texto']))
    modelo, prompt = cargar_modelo()
    t_total, s_total = time.time(), 0.0
    for i in range(0, len(pendientes), args.lote):
        grupo = pendientes[i:i + args.lote]
        t0 = time.time()
        wavs, sr = sintetizar(modelo, prompt, [hablado(f['texto']) for f in grupo])
        dt = time.time() - t0
        seg = sum(len(w) / sr for w in wavs)
        s_total += seg
        print(f'lote {i // args.lote + 1}: {len(grupo)} textos, {seg:.1f} s de audio en {dt:.1f} s '
              f'({dt / seg:.1f} s de GPU por s de audio), memoria {torch.cuda.max_memory_allocated() / 1e9:.1f} GB', flush=True)
        if args.medir:
            continue
        for f, w in zip(grupo, wavs):
            with tempfile.TemporaryDirectory() as tmp:
                wav = Path(tmp) / 'a.wav'
                sf.write(wav, w, sr)
                archivo = f"{f['clave']}.m4a"
                codificar(wav, SALIDA / archivo)
            m['entradas'][f['clave']] = {'archivo': archivo, 'segundos': round(len(w) / sr, 2), 'tipo': f['tipo'], 'id': f.get('id'),
                                         'texto': huella(f['texto']), 'habla': huella(hablado(f['texto']))}
        escribir_manifiesto(m)
    print(f'Total: {s_total:.0f} s de audio en {time.time() - t_total:.0f} s '
          f'({(time.time() - t_total) / max(s_total, 1):.1f} s de GPU por s de audio)')
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--comprobar', action='store_true', help='falla si el manifiesto no coincide con los textos')
    ap.add_argument('--texto', action='store_true', help='imprime el texto hablado de cada fuente')
    ap.add_argument('--solo', help='piloto, por ejemplo 10p,5r')
    ap.add_argument('--lote', type=int, default=8, help='textos por llamada a la GPU')
    ap.add_argument('--medir', action='store_true', help='mide la velocidad sin escribir audios')
    args = ap.parse_args()
    for flujo in (sys.stdout, sys.stderr):
        flujo.reconfigure(encoding='utf-8')
    if args.comprobar:
        return comprobar()
    if args.texto:
        for f in fuentes():
            print(f"{f['clave']}\t{hablado(f['texto'])}")
        return 0
    os.environ.setdefault('HF_HOME', str(Path.home() / '.cache/huggingface'))
    return generar(args)


if __name__ == '__main__':
    sys.exit(main())
