"""
Generar audio · El camino de las rosas  (versión 2: con pausas y pruebas de voz)

Crea un MP3 con voz de mujer para el prólogo, cada etapa y el final, a partir de
audio/narracion.json. Cada pieza está dividida en bloques (encabezado, título, párrafos,
la Palabra de Dios y la pregunta) y entre bloques se inserta un silencio real, para que
la lectura respire: pausa larga antes de la Palabra y unos segundos de silencio al final
para rezar.

Usa las voces neuronales gratuitas de Microsoft Edge (paquete edge-tts): no necesita
clave ni cuenta, sí conexión a internet. No hace falta ffmpeg.

Uso (doble clic en generar-audio.bat, o desde una consola en la carpeta del proyecto):
    generar-audio.bat                         # todas las piezas con la voz por defecto
    generar-audio.bat --muestras              # una muestra breve con cada voz femenina en español
    generar-audio.bat --voz es-MX-DaliaNeural # usar otra voz
    generar-audio.bat --velocidad -14% --tono -2Hz
    generar-audio.bat --solo etapa-3          # rehacer una sola pieza
    generar-audio.bat --pausas 1.3            # alargar (o acortar) todas las pausas
"""
import argparse, asyncio, json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
TEXTOS = os.path.join(AQUI, 'narracion.json')
SALIDA = os.path.join(AQUI, 'voz')
MUESTRAS = os.path.join(AQUI, 'muestras')
SILENCIO = os.path.join(AQUI, 'silencio.mp3')   # silencio en el mismo formato que edge-tts (24 kHz, mono, 48 kbps)
FRASE_MUESTRA = ('Etapa dos. Toledo. Las rosas. Un día la sorprenden. Su padre le cierra el paso: ¿qué llevas en el halda? '
                 'Casilda, con el corazón en la boca, responde: rosas. Y al abrir el vestido, el pan se ha convertido en rosas.')

try:
    import edge_tts
except ImportError:
    sys.exit('Falta el paquete edge-tts. Instálalo con:  python -m pip install edge-tts')


async def sintetizar(texto, voz, velocidad, tono):
    """Devuelve los bytes MP3 de un texto."""
    com = edge_tts.Communicate(texto, voz, rate=velocidad, pitch=tono)
    datos = bytearray()
    async for trozo in com.stream():
        if trozo['type'] == 'audio':
            datos += trozo['data']
    if not datos:
        raise RuntimeError('el servicio no devolvió audio')
    return bytes(datos)


def tramas(mp3):
    """Separa un MP3 en tramas (MPEG-1/2 capa III) para poder medir el silencio exacto."""
    BR = {3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]}
    SR = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000]}
    i, out = 0, []
    while i + 4 <= len(mp3):
        h = mp3[i:i + 4]
        if h[0] != 0xFF or (h[1] & 0xE0) != 0xE0: i += 1; continue
        ver = (h[1] >> 3) & 3; ver = 3 if ver == 3 else 2
        br = BR[ver][(h[2] >> 4) & 15] * 1000; sr = SR[ver][(h[2] >> 2) & 3]; pad = (h[2] >> 1) & 1
        if not br: i += 1; continue
        n = (144 if ver == 3 else 72) * br // sr + pad
        out.append(mp3[i:i + n]); i += n
    return out


def silencio(segundos, base):
    """base: lista de tramas de silencio de 24 ms (576 muestras a 24 kHz)."""
    k = max(0, round(segundos / .024))
    cuerpo = base[2:-2] or base
    return b''.join(cuerpo[j % len(cuerpo)] for j in range(k))


async def pieza(clave, bloques, a, base):
    sonido = bytearray(silencio(.4, base))          # un respiro al empezar
    for b in bloques:
        sonido += await sintetizar(b['t'], a.voz, a.velocidad, a.tono)
        sonido += silencio(b['p'] * a.pausas, base)
    with open(os.path.join(SALIDA, f'{clave}.mp3'), 'wb') as f:
        f.write(sonido)


async def muestras(a):
    os.makedirs(MUESTRAS, exist_ok=True)
    voces = [v for v in await edge_tts.list_voices() if v['Locale'].startswith('es-') and v['Gender'] == 'Female']
    voces.sort(key=lambda v: (v['Locale'] != 'es-ES', v['Locale'], v['ShortName']))
    print(f'Creando {len(voces)} muestras en {MUESTRAS} …')
    for v in voces:
        nombre = v['ShortName']
        try:
            mp3 = await sintetizar(FRASE_MUESTRA, nombre, a.velocidad, a.tono)
            open(os.path.join(MUESTRAS, f'{nombre}.mp3'), 'wb').write(mp3)
            print('  ✓', nombre)
        except Exception as e:
            print('  ✗', nombre, e)
    print('\nEscúchalas y elige. Después:  generar-audio.bat --voz NOMBRE_DE_LA_VOZ')


async def main():
    ap = argparse.ArgumentParser(description='Genera los MP3 de la narración con pausas')
    ap.add_argument('--voz', default='es-ES-ElviraNeural')
    ap.add_argument('--velocidad', default='-10%', help='por ejemplo -14%%, -5%%, +0%%')
    ap.add_argument('--tono', default='-1Hz', help='por ejemplo -3Hz, +0Hz')
    ap.add_argument('--pausas', type=float, default=1.0, help='multiplica todas las pausas (1.3 = 30%% más largas)')
    ap.add_argument('--solo', help='generar solo una pieza (prologo, etapa-1 … etapa-11, final)')
    ap.add_argument('--muestras', action='store_true', help='crear una muestra con cada voz femenina en español')
    a = ap.parse_args()
    if a.muestras:
        return await muestras(a)
    textos = json.load(open(TEXTOS, encoding='utf-8'))
    base = tramas(open(SILENCIO, 'rb').read())
    os.makedirs(SALIDA, exist_ok=True)
    claves = [a.solo] if a.solo else list(textos)
    hechos = 0
    for i, k in enumerate(claves, 1):
        if k not in textos:
            print(f'No existe «{k}». Piezas: {", ".join(textos)}'); continue
        print(f'[{i}/{len(claves)}] {k} …', end=' ', flush=True)
        try:
            await pieza(k, textos[k], a, base); hechos += 1; print('hecho')
        except Exception as e:
            print(f'error: {e}')
    existentes = sorted(f[:-4] for f in os.listdir(SALIDA) if f.endswith('.mp3'))
    json.dump({'voz': a.voz, 'velocidad': a.velocidad, 'tono': a.tono, 'piezas': existentes},
              open(os.path.join(SALIDA, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'\nListo: {hechos} MP3 en {SALIDA}')
    print('Sube la carpeta audio/voz al repositorio junto con el resto de la web.')

if __name__ == '__main__':
    asyncio.run(main())
