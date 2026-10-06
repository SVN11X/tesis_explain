# Robot explorador

Guía abierta sobre el trabajo de titulación **"Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial"**, de Sebastián Valderas Neculqueo, con el profesor guía Patricio Galarce Acevedo. Ingeniería Civil Electrónica, Universidad Tecnológica Metropolitana (UTEM), 2026.

**Sitio:** https://svn11x.github.io/tesis_explain/

![Una corrida real: a la izquierda la cámara cenital, a la derecha el mapa que construye el robot en RViz](img/mapa-crece.gif)

## Qué es

Un robot de bajo costo, con ROS 2, que entra a un recinto que no conoce, lo recorre solo y dibuja su plano. Esta guía explica cómo se construyó, cómo decide y qué se pudo demostrar, con simulaciones interactivas, fotos del prototipo y los datos medidos en la tesis.

Está pensada para tres tipos de lectores:

1. Quien quiere entender la idea en diez minutos, sin conocimientos previos.
2. Quien estudia ingeniería o robótica y quiere el detalle de cada capa, con sus fuentes.
3. Quien quiere construir uno, con materiales, versiones y lecciones aprendidas.

## Contenido

| Página | Tema |
|---|---|
| `index.html` | Portada, el ciclo en cuatro pasos, resultados y usos en la vida real |
| `problema.html` | Qué es la autonomía en interiores y qué alternativas existen |
| `robot.html` | Piezas, energía, costo y arquitectura ROS 2 |
| `movimiento.html` | Tracción diferencial, encoders y odometría |
| `control.html` | PID en tiempo discreto, el PI incremental, windup y sintonía con PSO |
| `mapeo.html` | LiDAR 2D, SLAM, cierre de lazo e índice de cobertura |
| `navegacion.html` | Mapas de costos, inflación, A estrella y DWB en Nav2 |
| `exploracion.html` | Exploración por fronteras y la lectura correcta de las metas abortadas |
| `gemelo.html` | Qué se comprueba en simulación y qué solo en el robot real |
| `resultados.html` | Objetivos, verificación frente a validación y limitaciones |
| `replicar.html` | Materiales, versiones, repositorios base y lecciones |
| `preguntas.html` | Preguntas difíciles con respuesta argumentada y modo práctica |
| `recursos.html` | Referencias de la tesis, fuentes externas, glosario y cómo citar |

Cada capítulo sigue la misma estructura: lo esencial en tres ideas, la explicación con un interactivo o una figura, la sección de la tesis que lo respalda, ejemplos de la vida real y los malentendidos más comunes.

## Criterios del contenido

1. Las cifras y figuras del robot salen de la tesis y se citan con su sección, tabla o figura.
2. Las fuentes externas, como ejemplos industriales o material de estudio, se marcan y se listan en `recursos.html`.
3. Los interactivos llevan una etiqueta: **Datos de la tesis** cuando muestran mediciones, **Interactivo** o **Ilustrativo** cuando usan datos de ejemplo para explicar una idea.
4. Lo que no se midió se dice de forma explícita.

## Estructura de archivos

```
├── *.html            páginas del sitio, contenido estático para buscadores
├── css/estilo.css    diseño, tema claro y oscuro, impresión
├── js/sitio.js       cabecera, menú, pie, índice lateral y lista de capítulos
├── js/sims.js        simulaciones en canvas (exploración, cinemática, encoder, lidar, PID, PSO, inflación, DWB)
├── js/vis1.js        interactivos de mapeo, A estrella, fronteras y metas
├── js/vis2.js        interactivos del firmware, el control y la sintonía
├── js/vis3.js        interactivos de odometría, arquitectura, costos y gemelo digital
├── js/comun.js       utilidades compartidas
├── js/preguntas.js   búsqueda, filtros y modo práctica de las preguntas
├── datos/preguntas.js  banco de preguntas difíciles
└── img/              fotos del prototipo, animación del mapa e imagen para redes
```

No hay dependencias ni paso de compilación. Todo es HTML, CSS y JavaScript sin librerías.

## Cómo editar

**Capítulos.** La lista de capítulos vive en `CAPS`, al inicio de `js/sitio.js`. De ahí salen el menú, el pie y la navegación anterior y siguiente.

**PDF de la tesis.** Cuando la tesis esté publicada, pon su enlace en `TESIS_PDF` dentro de `js/sitio.js` y aparecerá en el pie y en Recursos.

**Preguntas.** Cada pregunta en `datos/preguntas.js` tiene este formato:

```js
{
  id: "odometria-vs-seguimiento",   // se usa en el enlace preguntas.html#p-<id>
  tema: "odometria",                 // uno de los temas de window.TEMAS_FAQ
  nivel: "tecnica",                  // general, tecnica o exigente
  q: "La pregunta",
  r: "Primer párrafo.\n\nSegundo párrafo.",
  donde: "Sec. 5.1 y Tabla 5.1",     // respaldo en la tesis
  ver: "movimiento.html#odometria"   // capítulo que lo explica
}
```

**Fotos.** Se guardan en `img/fotos/` en dos formatos, `.webp` y `.jpg` como respaldo, con un ancho de 900 a 1400 px. Cada foto lleva texto alternativo y una leyenda con su figura en la tesis.

**Interactivos.** Un elemento con `data-vis="nombre"` se monta cuando entra en pantalla, usando la función registrada en `window.VISUALES.nombre`.

## Ver el sitio en tu computador

```bash
python3 -m http.server 8000
```

Luego abre http://localhost:8000

## Publicar en GitHub Pages

En Settings, Pages, elige "Deploy from a branch", rama `main` y carpeta `/ (root)`. Los cambios quedan publicados uno o dos minutos después de cada commit en `main`.

## Accesibilidad

El sitio respeta el modo oscuro del sistema y la preferencia de movimiento reducido, se puede recorrer con teclado, y cada interactivo tiene un texto que explica lo que muestra. El video de YouTube se carga solo cuando se presiona reproducir.

## Cómo citar

Valderas Neculqueo, S. (2026). *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* [Trabajo de titulación para optar al título de Ingeniero Civil Electrónico]. Universidad Tecnológica Metropolitana.

En `recursos.html#citar` está también el formato BibTeX.
