# Robot explorador

Guía abierta sobre el trabajo de titulación **"Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial"**, de Sebastián Valderas Neculqueo, con el profesor guía Patricio Galarce Acevedo. Ingeniería Civil Electrónica, Universidad Tecnológica Metropolitana (UTEM), 2026.

**Sitio:** https://svn11x.github.io/tesis_explain/

![Una corrida real: a la izquierda la cámara cenital, a la derecha el mapa que construye el robot en RViz](img/mapa-crece.gif)

## Qué es

Un robot de bajo costo, con ROS 2, que entra a un recinto que no conoce, lo recorre solo y dibuja su plano. La guía explica cada parte del trabajo como un artículo de divulgación técnica: la idea, los argumentos, la evidencia medida, los límites y los casos del mundo real donde se usa lo mismo. Cada afirmación lleva su fuente numerada.

Está pensada para cuatro tipos de lectores:

1. Quien quiere entender la idea en diez minutos, sin conocimientos previos.
2. Quien estudia ingeniería o robótica y quiere el detalle de cada capa, con sus fuentes.
3. Quien quiere construir uno, con materiales, versiones y lecciones de taller.
4. Quien va a exponer o evaluar el trabajo y necesita el argumento completo con su respaldo.

## Contenido

La guía tiene diez temas en tres bloques y tres páginas complementarias.

| Página | Bloque | Tema |
|---|---|---|
| `index.html` | | Portada, video del robot, el ciclo en cuatro pasos, temas, cifras, casos reales y rutas de lectura |
| `problema.html` | El contexto | Qué es la autonomía en interiores, el estado del arte y cada decisión frente a sus alternativas |
| `robot.html` | El contexto | Piezas, energía, red, reparto entre Arduino, Raspberry Pi y computador, ROS 2 y costo |
| `movimiento.html` | Cómo funciona | Tracción diferencial, encoders, odometría y los ensayos de recta y giro |
| `control.html` | Cómo funciona | PID en tiempo discreto, la ley heredada que opera como PI, windup y sintonía con FOPDT y PSO |
| `mapeo.html` | Cómo funciona | LiDAR 2D, SLAM Toolbox, cierre de lazo, resultados de mapeo y privacidad |
| `navegacion.html` | Cómo funciona | Mapas de costos, inflación, A estrella, DWB, árbol de comportamiento y recuperaciones |
| `exploracion.html` | Cómo funciona | Exploración por fronteras y por qué 53 de 54 metas abortadas fueron reemplazos |
| `gemelo.html` | Cómo funciona | El modelo en Gazebo Classic, la brecha con la realidad y qué se compara con qué |
| `resultados.html` | Evidencia y práctica | Verificar frente a validar, los cuatro objetivos, limitaciones y trabajo futuro |
| `replicar.html` | Evidencia y práctica | Materiales, conexiones, versiones, repositorios base y videos para aprender |
| `mundo-real.html` | Complemento | Doce casos reales, de una aspiradora a la mina El Teniente y a Marte |
| `lecciones.html` | Complemento | Diez lecciones de ingeniería que la tesis deja implícitas |
| `recursos.html` | Complemento | Material para aprender, videos, glosario, bibliografía, fuentes externas y cómo citar |

`preguntas.html` solo redirige a `lecciones.html`. Las respuestas que tenía se integraron a los temas.

Cada tema sigue la misma estructura:

1. Un encabezado con una figura de la tesis o una foto del prototipo.
2. **En pocas palabras**, con la idea central y sus cifras clave.
3. Secciones con argumentos, figuras ampliables, animaciones, comparadores y simuladores.
4. **En el mundo real**, con casos donde se usa la misma idea.
5. **Fuentes de esta página**, numeradas. Al pasar sobre un número se ve la fuente sin salir del texto.

## Criterios del contenido

1. Las cifras y figuras del robot salen de la tesis y se citan con su sección, tabla o figura.
2. Las fuentes externas se marcan por tipo (artículo, documentación, prensa, video) y se reúnen en `recursos.html`.
3. Los interactivos llevan una etiqueta: **Datos de la tesis** cuando muestran mediciones, **Interactivo** o **Ilustrativo** cuando usan datos de ejemplo para explicar una idea.
4. Lo que no se midió se dice de forma explícita.
5. El texto evita el punto y coma y las rayas como separadores, y explica cada término técnico la primera vez que aparece. Los términos subrayados con puntos muestran su definición al pasar el cursor o al tocarlos.

## Estructura de archivos

```
├── *.html               páginas del sitio, contenido estático para buscadores
├── css/estilo.css       diseño, tema claro y oscuro, impresión
├── js/sitio.js          cabecera, menú, pie, índice lateral, buscador, citas, glosario emergente,
│                        comparadores, videos en bucle, ampliación de imágenes
├── js/sims.js           simulaciones en canvas (exploración, cinemática, encoder, lidar, PID, PSO, inflación, DWB)
├── js/vis1.js           interactivos de mapeo, A estrella, fronteras y metas
├── js/vis2.js           interactivos del firmware, el control y la sintonía
├── js/vis3.js           interactivos de odometría, arquitectura, costos y gemelo digital
├── js/comun.js          utilidades compartidas
├── datos/indice.js      índice del buscador, generado
├── herramientas/indice.py  regenera el índice del buscador
└── img/
    ├── fotos/           prototipo, recinto, componentes y plataformas comerciales
    ├── tesis/           figuras de la tesis, animaciones en MP4 y sus portadas
    └── miniaturas/      imágenes de las tarjetas de cada tema
```

No hay dependencias ni paso de compilación. Todo es HTML, CSS y JavaScript sin librerías.

## Cómo editar

**Temas.** La lista vive en `CAPS`, al inicio de `js/sitio.js`. De ahí salen el menú, el pie, el número de cada tema y la navegación anterior y siguiente. Las páginas complementarias están en `EXTRAS`.

**Texto.** Cada página es HTML estático y se edita directamente. Después de cambiar texto, regenera el buscador:

```bash
pip install beautifulsoup4
python3 herramientas/indice.py
```

**Citas.** Dentro del texto, una cita es `<a class="ref" href="#f3">3</a>` y apunta al elemento `<li id="f3">` de la lista de fuentes al final de la misma página.

**Términos del glosario.** `<span class="term" data-def="Definición corta.">término</span>` muestra la definición al pasar el cursor, al enfocarlo con teclado o al tocarlo.

**Imágenes.** Se guardan en `.webp` con respaldo `.jpg` o `.png`, con un ancho de 900 a 1600 px. Las figuras grandes tienen una versión `-med` para la página y la original en `data-grande`, que se abre al hacer clic. Cada imagen lleva texto alternativo y una leyenda con su figura en la tesis.

**Animaciones.** Se usan videos MP4 cortos en bucle en lugar de GIF, porque pesan diez veces menos. Se pausan solos si el sistema pide movimiento reducido y tienen un botón para detenerlos.

**Comparador.** Un bloque `.deslizar` con dos imágenes del mismo tamaño muestra un antes y después con una barra que se arrastra o se mueve con las flechas del teclado.

**Interactivos.** Un elemento con `data-vis="nombre"` se monta cuando entra en pantalla, usando la función registrada en `window.VISUALES.nombre`.

**PDF de la tesis.** Cuando la tesis esté publicada, pon su enlace en `TESIS_PDF` dentro de `js/sitio.js` y aparecerá en el pie y en Recursos.

## Ver el sitio en tu computador

```bash
python3 -m http.server 8000
```

Luego abre http://localhost:8000

## Publicar en GitHub Pages

En Settings, Pages, elige "Deploy from a branch", rama `main` y carpeta `/ (root)`. Los cambios quedan publicados uno o dos minutos después de cada commit en `main`.

## Accesibilidad

El sitio respeta el modo oscuro del sistema y la preferencia de movimiento reducido, se puede recorrer con teclado y tiene un enlace para saltar al contenido. El buscador se abre con la tecla `/`. Cada interactivo tiene un texto que explica lo que muestra, y los videos de YouTube y Vimeo se cargan solo cuando se presiona reproducir.

## Cómo citar

Valderas Neculqueo, S. (2026). *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* [Trabajo de titulación para optar al título de Ingeniero Civil Electrónico]. Universidad Tecnológica Metropolitana.

En `recursos.html#citar` está también el formato BibTeX.

## Créditos de imágenes

Las fotos del prototipo, el recinto y las figuras técnicas son del autor y provienen de la tesis. Las imágenes de productos de terceros, como el RPLidar A1, el router GL.iNet, el Husky A300 y el LoCoBot, son de sus fabricantes y se usan para identificar los equipos. El detalle está en `recursos.html#creditos`.
