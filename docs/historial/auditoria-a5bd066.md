# Auditoría de la revisión a5bd066: experiencia y rendimiento

Base: `a5bd06659d190ec6a2fe7d48925e072a5ed07a7f`, rama remota `main`, recuperada el 26 de octubre de 2026. Rama local de trabajo: `mejora/experiencia-premium`. La base ya incluía la actualización a la versión de octubre de 2026 de la tesis, auditada en `auditoria-b922205.md`.

Esta revisión no contrasta el contenido académico. Mide cómo se ve, se usa y carga el sitio, en escritorio y en un teléfono, y busca problemas de código que dificulten mantenerlo.

## Estado de partida

Todas las verificaciones documentadas pasaban antes de editar: 203 pruebas numéricas en Node, 1 910 verificaciones estáticas y 1 676 comprobaciones de navegador.

El rendimiento se midió con Lighthouse 12.8.2 y Chromium 1243 sobre un servidor local que comprime con gzip y envía `Cache-Control: max-age=600`, como GitHub Pages. El perfil de teléfono usa la red y la CPU simuladas de Lighthouse. Son mediciones de laboratorio, no datos de visitantes reales.

| Página | Rendimiento en teléfono | LCP | CLS | Accesibilidad |
|---|---:|---:|---:|---:|
| `index.html` | 78 | 2,7 s | 0,329 | 100 |
| `problema.html` | 89 | 2,6 s | 0,143 | 98 |
| `robot.html` | 88 | 2,7 s | 0,143 | 99 |
| `movimiento.html` | 85 | 3,3 s | 0,143 | 100 |
| `control.html` | 81 | 3,7 s | 0,143 | 100 |
| `mapeo.html` | 80 | 3,7 s | 0,143 | 100 |
| `navegacion.html` | 91 | 2,4 s | 0,144 | 100 |
| `exploracion.html` | 94 | 1,8 s | 0,144 | 100 |
| `gemelo.html` | 90 | 2,6 s | 0,143 | 100 |
| `resultados.html` | 88 | 2,9 s | 0,143 | 99 |
| `replicar.html` | 87 | 2,8 s | 0,143 | 100 |
| `mundo-real.html` | 94 | 1,8 s | 0,143 | 100 |
| `lecciones.html` | 94 | 1,8 s | 0,143 | 100 |
| `preguntas.html` | 90 | 2,4 s | 0,143 | 100 |
| `laboratorio.html` | 93 | 2,0 s | 0,143 | 100 |
| `recursos.html` | 82 | 2,4 s | 0,280 | 100 |

En escritorio el rendimiento iba de 98 a 100, con un CLS de hasta 0,096 en `resultados.html`. Buenas prácticas daba 96 en las páginas con miniaturas de YouTube porque el entorno de prueba no tiene salida a internet, no por un defecto del sitio.

## Hallazgos

| Clase | Ubicación | Evidencia | Gravedad | Acción |
|---|---|---|---|---|
| Rendimiento | Las 16 páginas, aviso académico y títulos | CLS de 0,14 a 0,33 en teléfono, sobre el umbral de 0,1. Con las fuentes retrasadas 1,5 s, el aviso pasaba de tres a dos líneas al llegar Atkinson y movía toda la página unos 20 px. El título de la portada pasaba de cinco a cuatro líneas. Las medidas de lectura en `ch` cambiaban de ancho porque el cero de Atkinson mide 0,648 em y el de Arial 0,556 | Alta | Fuentes de respaldo con métricas ajustadas, anchos en `em` y precarga de las dos fuentes de la primera vista |
| Rendimiento | Todas las páginas con interactivos | Cada página cargaba vis1, vis2, vis3 y sims, unos 150 KB sin comprimir, aunque usara uno o ningún interactivo. La cabecera se armaba recién después de esos archivos, porque `sitio.js` iba al final | Alta | Carga bajo demanda con un manifiesto en `sitio.js`, que además se carga antes |
| Rendimiento | `index.html`, `mapeo.html`, `exploracion.html`, `navegacion.html` | Los videos en bucle tenían `autoplay`: `mapeo.html` descargaba 478 KB de un video que está a mitad de la página, y la portada 208 KB junto con la primera pintura | Alta | Descarga diferida, portadas en WebP y la portada lejana de `mapeo.html` también diferida |
| Rendimiento | `control.html`, gráficos de la tesis | Las dos imágenes del comparador del PSO, 75 KB en PNG, se pedían al abrir aunque están lejos del inicio. Cuatro WebP con pérdida pesaban más que su PNG, entre ellos `odom-real.webp`, de 109 KB frente a 84 KB, que es la imagen principal de `movimiento.html` | Media | Carga diferida y WebP sin pérdida, que además conserva nítidas las líneas y los textos |
| Rendimiento | `js/sitio.js`, secuencia de etapas | Precargaba los cuatro mapas en JPG al abrir la página, aunque se mostraban en WebP | Baja | Precarga del formato que el navegador eligió, al acercarse la secuencia |
| Accesibilidad | `problema.html`, `robot.html`, `resultados.html` | Las tarjetas de decisión usaban `h4` justo después de un `h2`. Lighthouse marcaba orden de títulos y daba 98 y 99 | Media | Títulos `h3` |
| Accesibilidad | `robot.html`, esquema de conexiones en teléfono | axe con las reglas de WCAG 2.2 AA: el botón Ampliar tapaba en parte el punto 15, del LiDAR, que quedaba en 24 por 20 px | Media | Botón Ampliar bajo la figura en ese esquema |
| Experiencia | `index.html` en teléfono | La portada medía unos 16 200 px. Las diez tarjetas de temas, con imagen de 16:9 apiladas, ocupaban unos 4 200 px. La última sección, el laboratorio, no seguía la misma retícula que las demás y quedaban tres secciones de cierre con propósitos parecidos | Media | Temas en filas compactas, pasos con el icono al costado y un cierre en dos columnas |
| Experiencia | Capítulos largos en teléfono | El índice «En esta página» queda al inicio del artículo. En un tema de 40 minutos de lectura, para saltar de sección había que volver arriba | Media | Secciones de la página en el menú de la cabecera fija |
| Experiencia | `problema.html` | Las razones de cada decisión estaban en un párrafo que mezcla la elección y varias alternativas, sin forma de ver cuál descarta a cuál. Era la única página de contexto sin interactivos | Media | Comparador que resalta la frase de cada alternativa |
| Identidad visual | Todo el sitio | Diseño limpio y coherente con la paleta de la UTEM, pero sin un motivo propio. Las miniaturas de los temas mezclaban gráficos blancos, capturas oscuras y fotos. No había transición entre páginas | Media | Identidad de plano técnico, miniaturas en un mismo tono y transición entre páginas |
| Código | 6 páginas | 33 atributos `style` en el HTML | Baja | Clases equivalentes en `css/estilo.css` |
| Código | `css/estilo.css` | El panel de Temas se definía con dos columnas y se corregía con `!important` en otra sección. Las reglas de la portada estaban repartidas en cuatro secciones, una de ellas dentro del bloque de contenido plegado | Baja | Un bloque para la portada y especificidad en lugar de `!important` |
| Código | `js/vis3.js` | Leía unos iconos que definía `js/vis1.js`. Funcionaba solo porque todas las páginas cargaban ambos archivos | Baja | Iconos compartidos en `js/comun.js` |

## Lo que se conserva

URLs, anclas, textos, tablas experimentales, el estado académico, los 53 interactivos con `data-vis` y sus respaldos sin JavaScript, las 106 preguntas, el buscador, el glosario, el tema claro y oscuro, la licencia y las pruebas existentes, que siguen pasando sin cambios.
