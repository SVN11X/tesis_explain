# Informe técnico: tema oscuro común y el robot real, sobre 0e148bb

Esta revisión agrega un tema oscuro para todo el sitio, también para la portada y sus escenas 3D, y dibuja el robot con su forma real en las figuras. La portada muestra ahora el modelo 3D hecho a partir del CAD del prototipo. La búsqueda A estrella se puede editar y el capítulo de mapeo suma una vista 3D del plano del láser. Las cifras, fórmulas, citas, tablas experimentales, el estado académico y los pendientes del autor no cambian. La tesis sigue en revisión por comité.

Base: `0e148bb1fe281eac9de2349b1bc0ee25c6290122` de `main`. Son dos commits sobre `main`. El informe anterior está en `historial/informe-tecnico-b018ab8.md`.

## Qué cambió

1. **Tema oscuro común.** Las 18 páginas tienen tema claro y oscuro. Sin elección siguen al sistema. El botón de la cabecera, con una luna o un sol, cambia el tema, y en el teléfono está en el menú, como una fila con interruptor. La elección se guarda en el navegador con la clave `tema`. Si coincide con el sistema se borra, y el sitio vuelve a seguirlo. Un cambio en otra pestaña del sitio también se aplica.
2. **Sin parpadeo.** Un script en línea al inicio del `<head>` aplica la elección guardada antes de cargar los estilos. Sale de `herramientas/plantillas/tema.html`, que `datos.py` inserta en las 16 páginas de la guía y `Shell.astro` en la portada y los laboratorios, junto con `color-scheme` y el color de la barra del navegador. Durante el cambio se quitan las transiciones por dos cuadros, para que todo cambie a la vez.
3. **Paleta oscura.** Papel `#121a17`, tinta `#e6e9de` y el mismo acento lima `#dbea7b`, con el texto oscuro `#182825` encima. Los colores son variables. `css/marco.css` define la paleta común, `css/estilo.css` las superficies y los colores de los datos de la guía y `web/src/styles/experience.css` los de la portada. Cada hoja tiene dos bloques oscuros con los mismos valores, uno para el sistema y otro para el botón, y una prueba comprueba que coincidan. La tinta sobre el papel oscuro llega a 14,4:1 y el texto secundario a 7,3:1.
4. **Datos, simuladores y escenas 3D.** Los colores de los datos conservan su tono, para que «la curva azul» siga siendo azul, y las rejillas de ocupación conservan los grises de un mapa PGM, porque el texto los nombra. Cada cambio de tema avisa con el evento `temacambio`. Los simuladores en canvas se vuelven a dibujar con los colores nuevos, y en las escenas 3D la base y el aro se aclaran y sube la luz de contorno, para que el robot negro no se pierda en el fondo. Las fotos del robot se funden con el papel en el tema claro y se muestran tal cual en el oscuro.
5. **El robot real en las figuras.** El robot aparecía como un círculo, un punto o una U invertida según la figura. `U.robot`, en `js/comun.js`, dibuja la planta del CAD: la cubierta en U de 0,23 m de ancho, con el borde recto atrás, la curva adelante y el LiDAR 0,115 m delante del eje de las ruedas. La usan la figura del LiDAR, A estrella, las fronteras, la simulación de exploración, la cinemática y el mapa 2D de los laboratorios. La inflación y la ventana dinámica conservan la huella rectangular de Nav2, que es la que usa el planificador.
6. **Logo e ícono.** La versión anterior ponía el frente del robot en el borde recto. El CAD y la foto del frente muestran la cámara y la rueda loca en la curva, así que el logo, `img/icono.svg` y la imagen para compartir se dieron vuelta.
7. **Modelo 3D del CAD en la portada.** El cilindro ilustrativo se reemplazó por el prototipo convertido de su STEP, `modelos/robot.glb`, de 381 KB y 39 245 triángulos. `herramientas/modelo_robot.py` hace la conversión, agrupa las piezas para el despiece, quita el interior del LiDAR y los componentes de menos de 3,5 mm de las placas, pinta cada grupo como el prototipo y comprime con meshopt. El cabezal del LiDAR gira sobre su eje. El cargador del modelo va en su propio módulo, `web/src/lib/robot-cad.ts`, de 21 KB comprimido, y solo lo pide la portada, así que el laboratorio LiDAR no lo descarga. Sin WebGL, o si el archivo no carga, la portada usa el robot ilustrativo anterior, que el SVG puede dibujar. El laboratorio 3D de `laboratorios.html` conserva por ahora su robot ilustrativo, porque su LiDAR cambia de altura. El proceso y las medidas están en `modelos/README.md`.
8. **A estrella editable.** En `navegacion.html` la rejilla se edita con tres modos: Muros, Robot y Meta. Con el ratón se hace clic o se arrastra, con el dedo se toca, para que deslizar siga desplazando la página, y con el teclado las flechas mueven un marco y Enter o la barra espaciadora aplican lo elegido. Cada cambio recalcula Dijkstra y A estrella y muestra la ruta con sus cifras. Si los muros separan la meta del robot, la figura lo explica y no dibuja ruta. «Volver al ejemplo» restaura la rejilla original, con sus 291 y 111 celdas revisadas y la ruta de 27 pasos.
9. **Vista 3D del LiDAR.** En `mapeo.html#lidar` la figura lateral pasa a una vista 3D de la misma sala, dibujada en un canvas sin bibliotecas, que se gira arrastrando o con las flechas y tiene tres puntos de vista. Muestra el plano del láser a 20 cm cruzando las paredes y las patas de la mesa, pasando sobre la caja de 10 cm y bajo la cubierta de 70 cm. Son medidas de ejemplo, como dice la figura. Las paredes cercanas a la cámara se vuelven translúcidas para no tapar la escena. Sin JavaScript se ve la figura lateral.
10. **Tiempos de transición comunes.** Las transiciones usaban catorce tiempos escritos a mano y dos nombres para la misma curva. Ahora usan tres duraciones y una curva de `css/marco.css`, también en la portada.
11. **Textos de la portada.** Seis frases de la portada y los laboratorios usaban punto y coma. Pasaron a puntos y comas, sin cambiar su contenido. La indicación «Arrastra para girar» del visor 3D quedaba sobre la base del robot y no se leía, también en la base anterior. Ahora tiene fondo de papel y un gris más oscuro, de 5,4:1.
12. **CI.** `pruebas_navegador.py` prueba ahora los dos temas y tarda unos seis minutos. El tiempo límite del flujo sube de 15 a 25 minutos.
13. **Potree.** Se evaluó y no se usa. Dibuja nubes de puntos 3D de millones de puntos y exige convertirlas a su formato. Los barridos del robot son cientos de puntos en un plano, que el sitio ya dibuja. Tendría sentido si se publica una nube 3D, por ejemplo un escaneo del recinto.

## Archivos

| Área | Archivos |
|---|---|
| Tema | `herramientas/plantillas/tema.html`, `herramientas/plantillas/cabecera.html`, `herramientas/marco.py`, `herramientas/datos.py`, `css/marco.css`, `js/marco.js`, `web/src/layouts/Shell.astro`, `web/src/generado/marco.json`, las 16 páginas de la guía |
| Colores y transiciones | `css/estilo.css`, `css/evidencia.css`, `css/mapeo.css`, `css/preguntas.css`, `web/src/styles/experience.css` |
| Figuras e interactivos | `js/comun.js`, `js/sims.js`, `js/vis1.js`, `js/mapeo.js`, `img/diagramas/`, `web/src/components/LidarLab.svelte` |
| Modelo 3D | `modelos/robot.glb`, `herramientas/modelo_robot.py`, `herramientas/preparar-web.mjs`, `web/src/lib/robot-cad.ts`, `web/src/lib/robot-three.ts`, `web/src/components/RobotHero.svelte`, `docs/licencias-web/meshoptimizer-MIT.txt` |
| Logo y portada | `img/icono.svg`, `img/social.png`, `web/src/pages/index.astro`, `web/src/pages/laboratorios.astro`, `web/src/lib/home-content.ts` y las salidas compiladas |
| Verificación | `pruebas_navegador.py`, `pruebas_mapeo_navegador.py`, `pruebas_movimiento_navegador.py`, `pruebas_laboratorio_navegador.py`, `pruebas_redisenio_navegador.py`, `pruebas_unitarias.js`, `.github/workflows/verificar.yml` |
| Documentación | `README.md`, `docs/decisiones.md`, `docs/experiencia-v1.md`, `modelos/README.md`, este informe, `datos/academico.json` |

## Pruebas ejecutadas

Entorno: Node 22.23.4, Python 3.13, Playwright 1.63.0 con Chromium 153. Se ejecutaron los pasos de `verificar.yml` en su orden. La columna Base es el resultado sobre `0e148bb`.

| Verificación | Base | Revisión |
|---|---:|---:|
| `verificar_sitio.py` | 3 457 | 3 457 |
| `npm run check`, prueba LiDAR y compilación | correctas | correctas |
| `pruebas_compilacion.py` y `verificar_compilacion.py` | correctas | correctas |
| Ejemplos, figuras y PDF de preguntas al día | 5 de 5 | 5 de 5 |
| Pruebas numéricas en Node, ocho archivos | 203 | 207 |
| `pruebas_control_navegador.py` | 325 | 325 |
| `pruebas_mapeo_navegador.py` | 261 | 289 |
| `pruebas_movimiento_navegador.py` | 214 | 252 |
| `pruebas_laboratorio_navegador.py` | 227 | 233 |
| `pruebas_robustez_navegador.py` | 71 | 71 |
| `pruebas_evidencia_navegador.py` | 131 | 131 |
| `pruebas_navegador.py` | 552 | 654 |
| `pruebas_experiencia_navegador.py` | 69 | 69 |
| `pruebas_redisenio_navegador.py` | 41 | 44 |

Lo nuevo que comprueban:

- `pruebas_navegador.py`: que las 18 páginas apliquen el tema guardado antes de los estilos y declaren los dos esquemas, que el botón cambie el tema, lo marque y lo recuerde al cambiar de página, que volver al tema del sistema borre la elección, que el simulador PID se vuelva a dibujar y que los dos bloques oscuros de cada hoja coincidan, con el sistema claro y con el oscuro.
- `pruebas_movimiento_navegador.py`: la edición de A estrella con ratón, con toques en el teléfono y con teclado, el arrastre del robot, el recálculo de las dos búsquedas, la meta inalcanzable y la vuelta al ejemplo.
- `pruebas_mapeo_navegador.py`: la planta del robot en la figura del LiDAR, que la vista 3D dibuje la sala y el plano, qué cruza el plano y qué deja fuera, la vista desde arriba, el giro con las flechas y arrastrando, que quepa en su recuadro y el color de los textos de las figuras en el tema oscuro.
- `pruebas_unitarias.js`: A estrella y Dijkstra sobre una rejilla editada, con un hueco en el muro y con la meta encerrada, sin cambiar el ejemplo.
- `pruebas_laboratorio_navegador.py`: el recorrido del menú del teléfono con la fila del tema al final.
- `pruebas_redisenio_navegador.py`: que con WebGL la portada cargue el modelo del CAD, que sin WebGL use el robot ilustrativo sin descargar el modelo y que el laboratorio no descargue el modelo ni su cargador.

Además, fuera del flujo:

- axe-core 4.10 en las 18 páginas, a 390 y 1366 px, en el tema claro y en el oscuro, con los plegables abiertos y las reglas de WCAG 2.0, 2.1 y 2.2 en sus niveles A y AA: sin infracciones. La primera pasada encontró una en el tema oscuro: en los filtros de `preguntas.html`, la cifra del tema elegido quedaba clara sobre el lima, a 1,06:1. Ahora usa el texto oscuro de lo que va sobre lima. También se pasó axe después de usar los controles, en los dos temas: un filtro de preguntas, el modo Robot y la reproducción de A estrella, la vista lateral del LiDAR, el botón del tema y el despiece de la portada. Sin infracciones.
- Desborde horizontal en las 18 páginas a 320, 360, 390, 768, 1024 y 1366 px en el tema claro y a 320, 390, 768 y 1366 px en el oscuro: ninguno. Sin errores de JavaScript. Las únicas fallas de red son las miniaturas de YouTube, que este entorno no puede descargar.
- Lighthouse 12.8 en teléfono, con un servidor local que comprime como GitHub Pages y dos corridas por página. Portada: rendimiento 66 a 68 en la base y 67 en la revisión, LCP de 2,1 a 2,3 s y CLS 0 en ambas. El peso al abrir pasa de 362 a 775 KB por el modelo, de 382 KB, y su cargador, de 21 KB comprimido. `laboratorios.html`: 70 en la base y 69 a 70 en la revisión, de 317 a 327 KB. En este entorno no hay GPU, así que las escenas 3D se dibujan por software y el bloqueo del hilo principal decide la nota en las dos versiones. Las cifras sirven para comparar la base con la revisión, no para estimar un teléfono real.
- Revisión visual de la portada con el modelo del CAD, ensamblado y en despiece, de las figuras con el robot, de A estrella y de la vista 3D, en los dos temas, en escritorio y en teléfono.

## Sin verificar

- Teléfonos reales y lectores de pantalla.
- Chrome 156, el de CI, no se pudo descargar en este entorno. La siguiente ejecución de GitHub Actions lo confirmará.
- El modelo del CAD en equipos con poca memoria de video. Si WebGL pierde el contexto, la portada muestra la foto y ofrece reintentar, como antes.

## Confirmado por el autor

- El ensamblaje incluye modelos de componentes comerciales: el RPLidar A1, el Arduino Nano V3, el adaptador de bornes para Nano de Deek-Robot, el controlador L298N y la cámara V2.1. El autor confirmó que sus licencias permiten publicarlos. Si más adelante se agrega un modelo que no se pueda publicar, se quita poniendo su nombre en `EXCLUIR`, en `herramientas/modelo_robot.py`, y volviendo a generar el modelo. Con `'L298N'`, por ejemplo, el archivo baja a 357 KB.
- En el CAD los centros de las ruedas quedan a 186 mm, la medida de diseño. La pieza impresa en 3D quedó con 188 mm por un error de la impresora. La tesis y el sitio usan esa medida real, 188 mm, y el radio de 33,5 mm coincide con el CAD. La diferencia de 2 mm no se nota en el modelo de la portada, así que no se corrigió.

## Pendientes

- Siguen pendientes del autor el método de medida del giro físico, el motivo del tamaño mínimo de frontera, la autorización para publicar firmware y registros, los tres videos preparados y las notas en primera persona.
- El laboratorio 3D de `laboratorios.html` sigue con su robot ilustrativo.
- La portada conserva textos de 8 a 10 px en etiquetas y leyendas del visor 3D. Cumplen el contraste, pero conviene revisarlos con el diseño de la portada.

## Cómo aplicar el parche

Con `main` en `0e148bb`:

```bash
git checkout main
git am /ruta/tesis_explain-tema-oscuro-cad-0e148bb_cambios_git_am.patch
npm ci
npm run build
python3 herramientas/verificar_compilacion.py
git push origin main
```

Son dos commits: el primero trae el tema oscuro, el robot en las figuras, el modelo del CAD y las pruebas, y el segundo la documentación y el historial. El parche incluye `modelos/robot.glb` como binario, así que hay que aplicarlo con `git am` y no copiando el texto. GitHub Pages sigue publicando `main` desde la raíz.

Para volver a generar el modelo desde el CAD hacen falta el STEP del ensamblaje, que no va en el repositorio, y Node:

```bash
pip install cascadio==0.1.1 trimesh==5.2.0 numpy==2.5.3
python3 herramientas/modelo_robot.py RUTA/tesis_v2.stp
```
