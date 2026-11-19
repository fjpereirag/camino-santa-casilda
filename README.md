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

## Publicar en GitHub Pages
Crea el repositorio `camino-santa-casilda`, sube el contenido a la raíz y activa *Settings → Pages → main / (root)*.

## Técnica
HTML + CSS + JS sin compilación; Three.js r160 incluido en `js/`. Sin WebGL se muestra el mapa en SVG. Respeta `prefers-reduced-motion`. Paleta clara del cartel (crema, azul marino #13344A, terracota #A9402B), revisada con contraste WCAG AA en móvil.
