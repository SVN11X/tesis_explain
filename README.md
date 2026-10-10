# Robot explorador

Guía abierta sobre el trabajo de titulación **"Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial"**, de Sebastián Valderas Neculqueo, con el profesor guía Patricio Galarce Acevedo. Ingeniería Civil Electrónica, Universidad Tecnológica Metropolitana (UTEM), 2026.

**Sitio:** https://svn11x.github.io/tesis_explain/

![Una corrida real: a la izquierda la cámara cenital, a la derecha el mapa que construye el robot en RViz](img/mapa-crece.gif)

## Qué es

Un robot de bajo costo, con ROS 2, que entra a un recinto que no conoce, lo recorre solo y dibuja su plano. La guía explica cada parte del trabajo con la idea, la evidencia medida, los límites y casos del mundo real. Cada afirmación lleva su fuente numerada.

## Contenido

| Página | Tema |
|---|---|
| `index.html` | Portada, video, el ciclo en cuatro pasos, temas, cifras, casos reales y rutas de lectura |
| `problema.html` | Autonomía en interiores, estado del arte y cada decisión frente a sus alternativas |
| `robot.html` | Piezas, energía, red, reparto entre Arduino, Raspberry Pi y computador, ROS 2 y costo |
| `movimiento.html` | Tracción diferencial, encoders, odometría y ensayos de recta y giro |
| `control.html` | PID en tiempo discreto, la ley heredada que opera como PI, windup, FOPDT y PSO |
| `mapeo.html` | LiDAR 2D, SLAM Toolbox, cierre de lazo, resultados de mapeo y privacidad |
| `navegacion.html` | Mapas de costos, inflación, A estrella, DWB y recuperaciones |
| `exploracion.html` | Exploración por fronteras y por qué 53 de 54 metas abortadas fueron reemplazos |
| `gemelo.html` | El modelo en Gazebo Classic y qué se compara con qué |
| `resultados.html` | Niveles de evidencia, los cuatro objetivos, limitaciones y trabajo futuro |
| `replicar.html` | Materiales, conexiones, versiones, repositorios base y videos para aprender |
| `mundo-real.html` | Casos reales, de una aspiradora a la mina El Teniente y a Marte |
| `lecciones.html` | Lecciones de ingeniería que la tesis deja implícitas |
| `recursos.html` | Glosario, bibliografía, fuentes externas, materiales, cómo citar y créditos |

`preguntas.html` solo redirige a `lecciones.html`.

## Criterios del contenido

Las cifras y figuras del robot salen de la tesis y se citan con su sección, tabla o figura. Las fuentes externas se marcan por tipo y se reúnen en `recursos.html`. Los interactivos llevan la etiqueta **Datos de la tesis** cuando muestran mediciones, e **Interactivo** o **Ilustrativo** cuando usan datos de ejemplo, y lo que no se midió se dice de forma explícita.

## Estructura de archivos

```
├── *.html               páginas del sitio
├── css/estilo.css       diseño, tema claro y oscuro, impresión
├── js/sitio.js          cabecera, menú, pie, índice lateral, buscador, citas, glosario, imágenes y videos
├── js/sims.js           simulaciones en canvas
├── js/vis1.js … vis3.js interactivos de cada tema
├── js/comun.js          utilidades compartidas
├── js/control-modelo.js cálculos verificables del capítulo de control
├── datos/indice.js      índice del buscador, generado
├── datos/ensayos/       tablas de los ensayos en CSV, con su origen en la tesis
├── herramientas/        índice del buscador y pruebas
├── fuentes/             tipografías locales con su licencia OFL
└── img/                 fotos, figuras de la tesis, animaciones y miniaturas
```

No hay dependencias ni paso de compilación.

## Capítulo 4: control por ciclos y límites del firmware

`control.html` separa velocidad (m/s), conteo (ticks/ciclo), PWM e ITerm en la escala interna del numerador. Explica el error estacionario antes de usarlo, la diferencia entre 30 Hz nominales y el intervalo entero de 33 ms, y la separación entre tiempo continuo/discreto y forma posicional/incremental.

Los interactivos permiten aislar Kp, Kd y Ki, avanzar por ciclos, cancelar visualmente las diferencias de medición, distinguir el cambio de referencia del cambio de medición, inspeccionar truncamientos y comparar memoria y recuperación tras un bloqueo. El ejemplo de windup también permite proteger el integrador de un PI tradicional (PID con D=0 para aislar el fenómeno).

La comparación PSO/final muestra los seis pares de valores por rueda, con escalas explícitas e información sobre la validación. Los ejemplos de resolución separan el conteo del encoder, los dos decimales del registro y el promedio posterior; la recta está ensayada y el giro se identifica como estimación.

`js/control-modelo.js` reúne las ganancias y cálculos que usan los interactivos y las pruebas. Las simulaciones de bloqueo no son mediciones ni reproducen exactamente el encoder físico. El umbral de 60 PWM del ejemplo de zona muerta es supuesto y ajustable, no un valor medido del robot. Las ganancias y bandas adaptadas provienen de los datos ya publicados en la guía; el código adaptado no está disponible, mientras que el código base se enlaza como referencia independiente. Las consideraciones adicionales sobre conservar la ley se distinguen de los motivos documentados.

## Cómo editar

1. **Temas.** La lista vive en `CAPS`, al inicio de `js/sitio.js`. Las páginas complementarias están en `EXTRAS`.
2. **Texto.** Cada página es HTML estático. Después de cambiar texto, regenera el buscador con `python3 herramientas/indice.py` (requiere `beautifulsoup4`) y sube `datos/indice.js` junto con las páginas.
3. **Citas.** `<a class="ref" href="#f3">3</a>` apunta a `<li id="f3">` en la lista de fuentes de la misma página.
4. **Glosario.** `<span class="term" data-def="Definición corta.">término</span>` muestra la definición al pasar el cursor, al enfocarlo o al tocarlo.
5. **Imágenes.** En `.webp` con respaldo `.jpg` o `.png`. La versión grande va en `data-grande` y se abre con el botón Ampliar.
6. **Interactivos.** Un elemento con `data-vis="nombre"` se monta al entrar en pantalla con la función `window.VISUALES.nombre`.
7. **Contenido pendiente.** Los bloques ocultos con `hidden` llevan un comentario `PENDIENTE AUTOR` que dice qué falta.
   Los videos preparados usan `data-src` y `data-poster`. Basta con agregar los archivos y quitar `hidden`.
8. **PDF de la tesis.** Cuando esté en el repositorio institucional, pon su enlace en `TESIS_PDF` dentro de `js/sitio.js`.

## Ver el sitio en tu computador

```bash
python3 -m http.server 8000
```

Luego abre http://localhost:8000

## Pruebas

```bash
node herramientas/pruebas_unitarias.js
node herramientas/pruebas_control.js
python3 herramientas/pruebas_control_navegador.py
python3 -m http.server 8765 &
python3 herramientas/pruebas_navegador.py
```

Las pruebas de Node revisan la geometría, el reloj y los casos numéricos de control. `pruebas_control_navegador.py` inicia un servidor local temporal y comprueba los interactivos del capítulo 4 en escritorio, móvil de 390 y 320 px, modo oscuro y movimiento reducido. Requiere Playwright con Chromium instalado solo para desarrollo. `pruebas_navegador.py` usa Chromium con Playwright y recorre las páginas en escritorio, en teléfono y con movimiento reducido. Revisa errores, enlaces, anclas, el buscador, el glosario, los simuladores y el uso en teléfono.

## Publicar en GitHub Pages

En Settings, Pages, elige "Deploy from a branch", rama `main` y carpeta `/ (root)`. Cada commit en `main` se publica en uno o dos minutos.

```bash
python3 herramientas/indice.py
git add -A
git commit -m "Describe el cambio"
git push origin main
```

## Accesibilidad

El sitio respeta el modo oscuro y el movimiento reducido, se recorre con teclado y cada interactivo tiene un texto que explica lo que muestra.

## Cómo citar

Valderas Neculqueo, S. (2026). *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* [Trabajo de titulación para optar al título de Ingeniero Civil Electrónico]. Universidad Tecnológica Metropolitana.

El formato BibTeX está en `recursos.html#citar`.

## Licencia

El código del sitio, es decir `js/`, `css/`, `herramientas/` y la estructura de las páginas HTML, usa la licencia MIT del archivo `LICENSE`. Los textos, diagramas, fotos, figuras propias y las tablas de `datos/ensayos/` usan CC BY 4.0, como detalla `LICENSE-contenido.md`. Las imágenes de productos de terceros quedan fuera de esa licencia y las tipografías de `fuentes/` se rigen por la licencia OFL. Titular: Sebastián Valderas Neculqueo, 2026.

## Créditos de imágenes

Las fotos del prototipo, el recinto y las figuras técnicas son del autor y provienen de la tesis. Las imágenes de productos de terceros, como el RPLidar A1, el router GL.iNet, el Husky A300 y el LoCoBot, son de sus fabricantes y se usan para identificar los equipos. El detalle está en `recursos.html#creditos`.
