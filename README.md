# El camino de las rosas · Santa Casilda, de Toledo a La Bureba

Itinerario de fe en once etapas, de la familia de «El paso»: mapa en relieve tipo atlas (Three.js), ruta que se dibuja al bajar, cita bíblica, eco, pregunta para la oración y botón para compartir por WhatsApp.

| Etapa | Lugar | Tema | Escritura |
|---|---|---|---|
| I | Toledo · El palacio | La caridad escondida | Mt 6, 3-4 |
| II | Toledo · Las rosas | El milagro de las rosas (pétalos en el 3D) | Mt 5, 16 |
| III | Toledo · La enfermedad | La herida que nadie cura | Mc 5, 27-28 |
| IV | El Tajo · La salida | Dejar la casa del padre | Gn 12, 1 |
| V | Carabanchel | El camino pasa por casa | Heb 12, 1 |
| VI | Somosierra | Cruzar la sierra | Sal 121, 1-2 |
| VII | Burgos | El bautismo | Gál 3, 27-28 |
| VIII | Lagos de San Vicente | La curación (las aguas brillan) | Mc 5, 34 |
| IX | La ermita | La vida escondida | Os 2, 16 |
| X | Briviesca | La romería | Sal 122, 1-2 |
| XI | El santuario | El final del camino | 2 Tim 4, 7 |

Lema y estética tomados del cartel de la peregrinación parroquial: «Del pan compartido a la vida entregada», «No somos turistas, somos peregrinos que aprenden a amar», paleta crema, azul marino y terracota, y la acuarela de la santa ante el santuario (`img/santa-casilda-acuarela.jpg`).

Antes del final, la sección **La peregrinación** recoge los datos del cartel: 8 y 9 de mayo de 2027, salida de Madrid a las 9:00, Hotel El Vallés (Briviesca), 150 €, 52 plazas (se realiza solo si se cubren), qué incluye, y un botón para descargar el cartel (`img/cartel-peregrinacion.jpg`). Inscripciones: «en la parroquia» (completar con teléfono o correo si se quiere).

Al final: oración a santa Casilda (composición propia), mapa 3D girable con las etapas e índice.

**Fuentes de la vida de la santa:** tradición hagiográfica (Archidiócesis de Madrid / Catholic.net), programa de las fiestas de Briviesca y descripciones del santuario. La ruta Toledo–Madrid–Somosierra–Burgos es orientativa: la tradición no fija el itinerario.

**Pendiente de revisar:** las citas bíblicas están escritas según la versión de la CEE, de memoria; conviene cotejarlas. Confirmar con la cofradía la fecha y el horario de la romería de Briviesca de 2027.

## Voz y música
Al final del prólogo, «Antes de empezar, elige cómo quieres vivirlo»: **Voz** y **Música** (se pueden activar las dos, una o ninguna). Al activarlas aparece un control flotante abajo a la derecha para encenderlas o apagarlas en cualquier momento.

- **Voz:** con la voz activada, cada etapa se lee sola al llegar a ella (nombre, título, texto, la Palabra de Dios y la pregunta para la oración); también el prólogo y el final con la oración a santa Casilda. Cada etapa tiene además un botón «Escuchar esta etapa». Usa la voz del propio navegador o del móvil (gratis, sin servicios externos), eligiendo una voz femenina en español cuando el dispositivo la tiene (Helena, Elvira, Laura, Mónica, Paulina…). El timbre depende del dispositivo.
- **Música:** `audio/musica-santa-casilda.mp3` (2 min 31 s, en bucle, con fundido). Mientras habla la voz, la música baja de volumen y vuelve a subir al terminar.
- Nada suena sin que la persona lo pida (los navegadores no lo permiten), y al cambiar de pestaña se pausa.

## Generar las locuciones en MP3 (voz de mujer)
La web ya funciona con la voz del navegador, pero suena mejor con locuciones grabadas. Para crearlas en tu ordenador:

1. Instala Python (https://www.python.org) si no lo tienes.
2. Haz doble clic en **`generar-audio.bat`** (en Windows). Instala `edge-tts` y crea un MP3 por pieza en `audio/voz/`: `prologo.mp3`, `etapa-1.mp3` … `etapa-11.mp3` y `final.mp3`, más `manifest.json`.
3. Sube la carpeta `audio/voz/` al repositorio. La web usa esos MP3 automáticamente; si falta alguno, ese tramo lo lee la voz del navegador.

Opciones (desde una consola en la carpeta del proyecto):
- `generar-audio.bat --voz es-ES-XimenaNeural` · otra voz femenina (también `es-ES-ElviraNeural`, la predeterminada, o `es-MX-DaliaNeural`).
- `generar-audio.bat --lista` · ver todas las voces femeninas en español.
- `generar-audio.bat --solo etapa-3` · rehacer solo una pieza.
- `generar-audio.bat --velocidad -12%` · leer más despacio.

Los textos que se leen están en `audio/narracion.json` (se generan desde los datos de la web: nombre de la etapa, título, texto, la Palabra de Dios y la pregunta para la oración). Usa las voces neuronales gratuitas de Microsoft Edge: no necesita clave, pero sí internet.

## Revisión con Hallmark
Aplicados los arreglos de la auditoría: títulos sin cursiva, un único antetítulo (el de la peregrinación), etiquetas en caja normal, titular sin palabra coloreada, botones en una sola línea, todos los colores del CSS como tokens con nombre en OKLCH (`--papel`, `--tinta`, `--terracota`, `--oro-viejo`…) y `overflow-x: clip`. Los colores de la escena 3D siguen en `js/main.js` porque son materiales de Three.js, no estilos.

## Publicar en GitHub Pages
Crea el repositorio `camino-santa-casilda`, sube el contenido a la raíz y activa *Settings → Pages → main / (root)*.

## Técnica
HTML + CSS + JS sin compilación; Three.js r160 incluido en `js/`. Sin WebGL se muestra el mapa en SVG. Respeta `prefers-reduced-motion`. Paleta clara del cartel (crema, azul marino #13344A, terracota #A9402B), revisada con contraste WCAG AA en móvil.
