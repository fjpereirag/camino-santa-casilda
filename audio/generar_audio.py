"""
Generar audio · El camino de las rosas
Crea un MP3 con voz de mujer para el prólogo, cada etapa y el final,
a partir de audio/narracion.json. Usa las voces neuronales gratuitas de Microsoft Edge
(paquete edge-tts; no necesita clave ni cuenta, sí conexión a internet).

Uso (desde la carpeta del proyecto o desde esta carpeta):
    python audio/generar_audio.py                    # voz Elvira (España)
    python audio/generar_audio.py --voz es-ES-XimenaNeural
    python audio/generar_audio.py --solo etapa-3     # rehacer solo una pieza
    python audio/generar_audio.py --lista            # ver voces femeninas en español

Los MP3 quedan en audio/voz/ junto con manifest.json; la web los usa automáticamente
y, si falta alguno, recurre a la voz del navegador.
"""
import argparse, asyncio, json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
TEXTOS = os.path.join(AQUI, 'narracion.json')
SALIDA = os.path.join(AQUI, 'voz')
VOCES_SUGERIDAS = ['es-ES-ElviraNeural', 'es-ES-XimenaNeural', 'es-MX-DaliaNeural', 'es-ES-AbrilNeural']

try:
    import edge_tts
except ImportError:
    sys.exit('Falta el paquete edge-tts. Instálalo con:  python -m pip install edge-tts')


async def listar():
    voces = await edge_tts.list_voices()
    for v in voces:
        if v['Locale'].startswith('es-') and v['Gender'] == 'Female':
            print(f"{v['ShortName']:28} {v['Locale']}")


async def generar(clave, texto, voz, velocidad, tono):
    destino = os.path.join(SALIDA, f'{clave}.mp3')
    com = edge_tts.Communicate(texto, voz, rate=velocidad, pitch=tono)
    await com.save(destino)
    return destino


async def main():
    ap = argparse.ArgumentParser(description='Genera los MP3 de la narración')
    ap.add_argument('--voz', default='es-ES-ElviraNeural', help='voz de edge-tts (por defecto es-ES-ElviraNeural)')
    ap.add_argument('--velocidad', default='-8%', help='por ejemplo -10%%, +0%%')
    ap.add_argument('--tono', default='+0Hz', help='por ejemplo -2Hz, +0Hz')
    ap.add_argument('--solo', help='generar solo una clave (prologo, etapa-1…etapa-11, final)')
    ap.add_argument('--lista', action='store_true', help='listar voces femeninas en español')
    a = ap.parse_args()
    if a.lista:
        return await listar()
    textos = json.load(open(TEXTOS, encoding='utf-8'))
    os.makedirs(SALIDA, exist_ok=True)
    claves = [a.solo] if a.solo else list(textos)
    hechos = []
    for i, k in enumerate(claves, 1):
        if k not in textos:
            print(f'No existe la clave «{k}». Claves: {", ".join(textos)}'); continue
        print(f'[{i}/{len(claves)}] {k} …', end=' ', flush=True)
        try:
            await generar(k, textos[k], a.voz, a.velocidad, a.tono)
            hechos.append(k); print('hecho')
        except Exception as e:
            print(f'error: {e}')
    # manifest: qué piezas hay, para que la web sepa cuáles usar
    existentes = sorted(f[:-4] for f in os.listdir(SALIDA) if f.endswith('.mp3'))
    json.dump({'voz': a.voz, 'piezas': existentes}, open(os.path.join(SALIDA, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'\nListo: {len(hechos)} MP3 nuevos en {SALIDA}')
    print('Sube la carpeta audio/voz al repositorio junto con el resto de la web.')

if __name__ == '__main__':
    asyncio.run(main())
