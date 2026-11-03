# Robot explorador

Guía abierta sobre el trabajo de titulación **"Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial"**, de Sebastián Valderas Neculqueo, con el profesor guía Patricio Galarce Acevedo. Ingeniería Civil Electrónica, Universidad Tecnológica Metropolitana (UTEM), 2026.

**Estado académico: en revisión por comité. La tesis no está aprobada.** La guía sigue la versión de octubre de 2026 del documento. Las cifras pueden cambiar tras la revisión, sin que esta plataforma decida conclusiones académicas.

**Sitio:** https://svn11x.github.io/tesis_explain/

## Un solo diseño para todo el sitio

La portada, `laboratorios.html` y las 16 páginas de la guía comparten el mismo sistema visual: papel claro, tinta verde oscuro, un acento lima para lo que está activo, Archivo en los títulos, Atkinson Hyperlegible en el texto e IBM Plex Mono en las etiquetas. Los bordes son líneas finas y las esquinas, rectas.

## Color por tema y resaltado

Cada parte de la guía tiene un color, y el color dice de qué se habla: turquesa para percibir (LiDAR, mapeo y el gemelo digital), naranja para estimar el avance (movimiento y lecciones), violeta para decidir (exploración y bibliografía), azul para moverse (control, navegación y el laboratorio de análisis), amarillo para el robot (anatomía y constrúyelo tú), frambuesa para la evidencia (resultados y preguntas) y verde para el contexto. La paleta está en `css/marco.css` (`--c-verde`, `--c-turquesa` y los demás, con su fondo `--c-…-fondo`). Cada página toma su color de `data-pagina` y cada fila de la guía, de `data-pag`, en la variable `--tema`. Las clases `c-…` dan el color a una sección o a una palabra. El texto de color cumple 4,5:1 sobre el papel y sobre su fondo en los dos temas, y `verificar_sitio.py` lo comprueba. `--c-robot` es el amarillo de las franjas del prototipo, para el botón principal y el resaltado sobre texto oscuro.

En las páginas de la guía llevan el color del tema los términos con definición, las cifras, el número de cada parte en el índice lateral, la franja de la cabecera y la raya sobre cada sección. Las frases clave de los párrafos van en `<mark>`, y las negritas de los párrafos se resaltan igual. `js/marco.js` dibuja el resaltado de izquierda a derecha cuando el texto llega a la pantalla, como si alguien lo pasara con un marcador. Sin JavaScript, con movimiento reducido o al imprimir, el resaltado ya está puesto. El script del `<head>` marca la animación antes de pintar, y si `marco.js` no llega en tres segundos la quita.

## Tema claro y oscuro

Todo el sitio tiene tema claro y oscuro, también la portada y sus escenas 3D. Sin elección, sigue al sistema. El botón de la cabecera, con una luna o un sol, cambia el tema. En el teléfono está en el menú, como una fila con interruptor. La elección se guarda en el navegador de quien la hace, con la clave `tema`, y si coincide con el sistema se borra, así el sitio vuelve a seguirlo.

Un script en línea al inicio del `<head>` aplica la elección guardada antes de cargar los estilos, así la página no parpadea. Sale de `herramientas/plantillas/tema.html` y `datos.py` lo pone en las 18 páginas, junto con `color-scheme` y el color de la barra del navegador. Los colores son variables: `css/marco.css` define la paleta común, `css/estilo.css` las superficies y los colores de los datos de la guía y `web/src/styles/experience.css` los de la portada. Cada hoja tiene dos bloques oscuros con los mismos valores, uno para el sistema y otro para el botón, y `pruebas_navegador.py` comprueba que coincidan.

Cada cambio de tema avisa con el evento `temacambio`. Los simuladores dibujados en canvas y las escenas 3D lo escuchan y se vuelven a dibujar. Los colores de los datos conservan su tono en el tema oscuro, para que «la curva azul» siga siendo azul, y las rejillas de ocupación conservan los grises de un mapa PGM, porque el texto los nombra: blanco libre, negro ocupado y gris desconocido. Las fotos del robot se funden con el papel en el tema claro y se muestran tal cual en el oscuro.

## El robot, el mismo en todas partes

Las figuras de la guía dibujan el robot con su planta real, una U con la parte curva adelante y el LiDAR en la curva, con las medidas del CAD del prototipo. La función está en `js/comun.js` (`U.robot`) y la usan el LiDAR del capítulo 5, A estrella y las fronteras, el simulador de exploración y la cinemática. Donde importa la huella rectangular que usa Nav2, como en la inflación y la ventana dinámica, se dibuja esa huella. El logo y el ícono del sitio muestran la misma planta, con la curva hacia adelante.

La portada muestra el modelo 3D del prototipo, convertido de su CAD por `herramientas/modelo_robot.py` y guardado en `modelos/robot.glb`: carcasa negra con las cuatro franjas amarillas del frente y el panel plano de la cámara. El despiece separa la tracción, la electrónica, la cubierta y el LiDAR, cuyo cabezal gira. El visor se acerca con los botones más y menos, con Ctrl y la rueda del ratón, con el pellizco en pantallas táctiles y, con el foco en el modelo, con las teclas más y menos. Las flechas lo giran y cero vuelve a la vista completa. La rueda sola sigue desplazando la página y avisa que el acercamiento va con Ctrl. Al elegir una pieza, la cámara se acerca a ella, y con la electrónica o las ruedas la carcasa se vuelve transparente para mostrarlas. El piso son anillos de barrido que se desvanecen, sin un disco que se corte en el borde. El cargador del modelo está en `web/src/lib/robot-cad.ts` y solo lo pide la portada. Sin WebGL, el visor dibuja en SVG un robot ilustrativo más liviano. El laboratorio 3D de `laboratorios.html` conserva por ahora su robot ilustrativo. Véase [el detalle del modelo](modelos/README.md).

El marco de cada página es el mismo en todas: la cabecera con la marca del robot, la navegación y el buscador, el menú del teléfono, el aviso académico, el pie y la ventana de búsqueda. Su marcado vive en `herramientas/plantillas/`, sus estilos en `css/marco.css` y su comportamiento en `js/marco.js`. `python3 herramientas/datos.py` lo inserta en las páginas de la guía y escribe `web/src/generado/marco.json`, que la portada y los laboratorios usan al compilarse. Para cambiar el marco se edita la plantilla, se ejecuta `datos.py` y después `npm run build`. `pruebas_navegador.py` compara el marcado y los estilos del marco entre la portada y las páginas de la guía.

La portada y `laboratorios.html` usan Astro, Svelte, TypeScript, Three.js y GSAP, con un robot tridimensional con giro y despiece y un laboratorio de LiDAR con escenas 3D y mapa 2D sincronizados. El robot y los recintos son ilustrativos. Las mediciones publicadas de la tesis siguen en sus capítulos y archivos originales. No requiere servicios externos de pago ni claves. Los archivos compilados se incluyen en la raíz para seguir publicando con GitHub Pages desde `main` y `/ (root)`. No hay que subir `node_modules` ni cambiar el destino de publicación.

Para desarrollar, con Node.js 24:

```bash
npm ci
npm run dev
```

Abre `http://localhost:4321/tesis_explain/`. Edita las páginas en `web/src/pages`, los componentes en `web/src/components` y los estilos en `web/src/styles`. `index.html`, `laboratorios.html` y `_astro/` son salidas generadas: no se editan a mano.

Para compilar y verificar:

```bash
npm run check
npm run test:lidar
npm run build
python -m pip install beautifulsoup4
python herramientas/indice.py
python herramientas/verificar_sitio.py
python herramientas/pruebas_compilacion.py
python herramientas/verificar_compilacion.py
```

La verificación de compilación compara las salidas con Git y admite únicamente los identificadores internos `uid` de Astro que dependen de la ruta de trabajo. Los textos, atributos funcionales, scripts, estilos, índice y conjunto de recursos deben coincidir. Véase [la corrección de CI](docs/correccion-ci-astro.md).

El criterio editorial es conservar explicaciones, fuentes, unidades y límites al cambiar su presentación. Consulta [la trazabilidad del contenido de portada](docs/contenido-portada.md), [la guía de la portada Astro](docs/experiencia-v1.md) y [el informe del diseño común](docs/historial/informe-tecnico-b018ab8.md).

![Una corrida real: a la izquierda la cámara cenital, a la derecha el mapa que construye el robot en RViz](img/mapa-crece.gif)

## Qué es

Un robot de bajo costo, con ROS 2, que entra a un recinto que no conoce, lo recorre solo y dibuja su plano. La guía explica cada parte del trabajo con la idea, la evidencia medida, los límites y casos del mundo real. Cada afirmación lleva su fuente numerada.

## Contenido

| Página | Tema |
|---|---|
| `index.html` | Nueva experiencia visual, robot 3D desmontable y con acercamiento, ciclo, laboratorio de percepción, video real, evidencia y acceso a las 16 partes de la guía |
| `laboratorios.html` | LiDAR en 3D y mapa 2D, tres escenarios sintéticos, inspección de rayos, historial, enlace reproducible y exportación JSON |
| `problema.html` | Autonomía en interiores, estado del arte y un comparador que resalta por qué se descartó cada alternativa |
| `robot.html` | Piezas, energía, red, reparto entre Arduino, Raspberry Pi y computador, ROS 2 y costo |
| `movimiento.html` | Tracción diferencial y centro de giro, encoders, odometría, ensayos de recta y giro, qué corrige una calibración y el cuadrado en dos sentidos |
| `control.html` | El lazo de una rueda con sus unidades, PID en tiempo discreto, la ley heredada que opera como PI, windup, el modelo FOPDT, PSO y la estabilidad del lazo discreto con sus márgenes |
| `mapeo.html` | LiDAR 2D, rejilla de ocupación con área e índice, REP 103/105 y TF, ajuste de barridos con su curva de desacuerdo, grafo de poses, Ceres, capas de RViz, resultados de mapeo y comparación con el plano medido del recinto |
| `navegacion.html` | Mapas de costos, inflación, A estrella paso a paso, DWB y recuperaciones |
| `exploracion.html` | Exploración por fronteras y por qué 53 de 54 metas abortadas se asocian a reemplazos del propio explorador |
| `gemelo.html` | El modelo en Gazebo Classic y qué se compara con qué |
| `resultados.html` | Niveles de evidencia, los cuatro objetivos, intervalos de confianza y repeticiones, limitaciones y trabajo futuro |
| `replicar.html` | Materiales, conexiones, versiones, repositorios base y videos para aprender |
| `mundo-real.html` | Casos reales, de una aspiradora a la mina El Teniente y a Marte |
| `lecciones.html` | Lecciones de ingeniería que la tesis deja implícitas |
| `preguntas.html` | 106 preguntas difíciles en 15 temas y 3 niveles, con respuesta, repregunta probable, respaldo en la tesis y enlace al tema |
| `laboratorio.html` | Análisis local de CSV, de mapas de ocupación PGM y de registros de estados de metas, con métricas con fórmula, reglas transparentes, validación, procedencia y exportación JSON sin LLM |
| `recursos.html` | Glosario con filtro, presentación de la bibliografía con sus grupos, fuentes externas, materiales, cómo citar y créditos |
| `bibliografia.html` | Las 72 referencias de la tesis en 11 grupos, cada una con ficha, de qué trata, relación con la tesis, referencias relacionadas y cita para copiar, con filtro y descarga en BibTeX |

## Criterios del contenido

Las cifras y figuras del robot salen de la tesis y se citan con su sección, tabla o figura. Las fuentes externas se marcan por tipo y se reúnen en `recursos.html`. Los interactivos llevan la etiqueta **Datos de la tesis** cuando muestran mediciones, e **Interactivo** o **Ilustrativo** cuando usan datos de ejemplo, y lo que no se midió se dice de forma explícita.

## Estructura de archivos

```
├── *.html               páginas del sitio
├── css/marco.css        marco común: cabecera, menú del teléfono, aviso académico, pie y buscador
├── js/marco.js          menú del teléfono y buscador, en todas las páginas
├── css/estilo.css       diseño de las páginas de la guía, movimiento, impresión
├── js/sitio.js          índice lateral, secciones en el menú, citas, glosario, imágenes, videos
│                        y carga bajo demanda de los interactivos
├── js/decisiones.js     comparador de decisiones del tema 1
├── js/sims.js           simulaciones en canvas
├── js/vis1.js … vis3.js interactivos de cada tema
├── js/comun.js          utilidades compartidas
├── js/control-modelo.js cálculos verificables del capítulo de control
├── js/movimiento-modelo.js cálculos verificables del capítulo 3
├── js/movimiento.js     calibración de la recta y cuadrado en dos sentidos, en SVG
├── css/movimiento.css   estilos exclusivos del capítulo 3
├── js/mapeo.js          modelos y visualizaciones del capítulo 05
├── js/slam-proceso.js   candidatos de cierre y colas de procesamiento ilustrativas
├── css/mapeo.css        estilos exclusivos del capítulo 05
├── js/estabilidad-modelo.js análisis lineal del lazo de velocidad del Anexo 4.12, sin DOM
├── js/estadistica-modelo.js intervalos de confianza, Clopper y Pearson y prueba binomial, sin DOM
├── js/evidencia.js      interactivos de estabilidad, mapa frente al plano y repeticiones
├── css/evidencia.css    estilos de esos tres interactivos
├── js/analisis-modelo.js análisis de CSV y de registros de estados de metas, sin DOM
├── js/analisis-mapa.js  lectura de PGM y YAML, conteo de celdas y comparación de mapas, sin DOM
├── js/laboratorio.js    presentación del laboratorio
├── css/laboratorio.css  estilos exclusivos del laboratorio
├── js/preguntas.js      búsqueda, filtros, modo práctica y pregunta al azar de Preguntas difíciles
├── css/preguntas.css    estilos exclusivos de Preguntas difíciles
├── datos/indice.js      índice del buscador, generado
├── datos/academico.json estado académico, pendientes del autor e historial de cambios del sitio
├── datos/bibliografia.json referencias de la tesis: ficha, contenido, relación con la tesis, diferencias,
│                        código, referencias relacionadas, cita textual y dónde se citan
├── datos/bibliografia.bib la bibliografía en BibTeX para biblatex, generada desde el JSON
├── datos/parametros.json parámetros ya publicados en la guía, con su fuente
├── datos/proyecto.js    módulo generado desde los JSON y los CSV
├── datos/ensayos/       tablas de los ensayos en CSV, con su origen en la tesis
├── datos/analisis/      tablas que la tesis calcula sobre los ensayos: estabilidad, intervalos y plano
├── datos/ejemplos/      archivos SINTÉTICOS para probar el laboratorio, no son datos del robot
├── docs/                auditorías, informes, decisiones, trazabilidad y plantillas de revisión
├── herramientas/        generadores, índice del buscador y pruebas
├── herramientas/plantillas/ marcado del marco común, que datos.py inserta en cada página
├── web/src/             portada y laboratorios en Astro y Svelte
├── modelos/             modelo 3D del prototipo para la portada, generado desde el CAD
├── fuentes/             tipografías locales con su licencia OFL
└── img/                 fotos, figuras de la tesis, animaciones y miniaturas
```

Las páginas de la guía no tienen paso de compilación: son HTML estático. Solo la portada y los laboratorios se compilan con `npm run build`.

## Capítulo 3: centro de giro, sesgo y calibración

`movimiento.html` explica la tracción diferencial con el centro de giro: el simulador dibuja ese punto, el círculo que seguirá el robot y el de cada rueda, y escribe las fórmulas con los valores de los deslizadores. Cuando el círculo cabe, el robot parte de modo que su centro de giro quede al medio del dibujo. La animación se pausa con un botón y espera a que la persona la inicie si el sistema pide reducir el movimiento.

El encoder compara la cuenta con los cuatro flancos de A y B con la cuenta que usa solo las subidas de A, para ver la multiplicación por cuatro paso a paso. La resolución de 0,11 mm por flanco sale de 2π · 33,5 mm / 1980.

El interactivo de calibración usa los errores de la Tabla A6.2 y separa sesgo, el error medio de 3,63 %, de dispersión, la desviación estándar de 0,44 %. Dividir por 1,0363 deja el error medio en cero y no quita la dispersión. Es un cálculo sobre los datos publicados: la tesis no aplicó esa corrección. El modo de simulación, rotulado como tal, prueba el factor en repeticiones nuevas.

El cuadrado en dos sentidos ilustra el método UMBmark de Borenstein y Feng con una diferencia entre ruedas y una separación efectiva distinta de la configurada. Muestra que los dos errores pueden compensarse en un sentido y sumarse en el otro. Es ilustrativo: el robot no se ensayó así. El caso de los conteos medidos, 1976 y 1969 flancos por vuelta, supone radios iguales.

`js/movimiento-modelo.js` reúne esos cálculos para los interactivos y las pruebas, y lee los mismos valores de `datos/ensayos/recta-2m-real.csv`, que las pruebas comparan.

## Capítulo 6: A estrella paso a paso

El interactivo de búsqueda guarda cada paso de Dijkstra y de A estrella. Se puede reproducir, pausar, avanzar de a uno o ir a cualquier paso con un deslizador. En cada paso muestra la celda que se revisa, el camino que la alcanzó (g), la estimación hasta la meta (h), f = g + h y las celdas pendientes. Las cuentas finales, 291 y 111 celdas para una ruta de 27 pasos, quedan siempre a la vista.

La rejilla se puede editar. Con Muros, un clic o un arrastre levanta o derriba muros. Con Robot o Meta, tocar una celda los lleva ahí, y también se pueden arrastrar. Con el teclado, las flechas mueven un marco por la rejilla y Enter o la barra espaciadora aplican lo elegido. Cada cambio recalcula las dos búsquedas y muestra la ruta nueva con sus cifras. Si los muros separan la meta del robot, la figura lo explica y no dibuja una ruta. Volver al ejemplo restaura la rejilla original. En el teléfono, deslizar sobre la rejilla sigue desplazando la página: se edita tocando.

El simulador de la ventana dinámica dibuja la huella del robot, el rectángulo configurado en Nav2, translúcida y bajo las trayectorias. Antes iba opaca encima y tapaba las 105 candidatas, que avanzan a lo más 26 cm desde el centro de giro, y también la elegida, del mismo azul. Una segunda vista muestra 50 cm alrededor del robot, ampliados unas cuatro veces en un teléfono, con su escala de 10 cm. Los puntajes, los escenarios y la proyección de 1,7 s no cambian.

## Capítulo 4: control por ciclos y límites del firmware

`control.html` separa velocidad (m/s), conteo (ticks/ciclo), PWM e ITerm en la escala interna del numerador. Explica el error estacionario antes de usarlo, la diferencia entre 30 Hz nominales y el intervalo entero de 33 ms, y la separación entre tiempo continuo/discreto y forma posicional/incremental.

Los interactivos permiten aislar Kp, Kd y Ki, avanzar por ciclos, cancelar visualmente las diferencias de medición, distinguir el cambio de referencia del cambio de medición, inspeccionar truncamientos y comparar memoria y recuperación tras un bloqueo. El ejemplo de windup también permite proteger el integrador de un PI tradicional (PID con D=0 para aislar el fenómeno).

La comparación PSO/final muestra los seis pares de valores por rueda, con escalas explícitas e información sobre la validación. Los ejemplos de resolución separan el conteo del encoder, los dos decimales del registro y el promedio posterior. La recta está ensayada y el giro se identifica como estimación.

El simulador «Ajusta un PID» toma su modelo de `js/control-modelo.js` y agrega lecturas por regla. Cada lectura dice qué condición la activó y con qué cálculo se comprueba. Con solo P, por ejemplo, el error final coincide con referencia / (1 + K·P), y la lectura lo escribe con los números del gráfico. La figura de respaldo `img/diagramas/pid-respaldo.svg` se genera con el mismo modelo mediante `node herramientas/diagramas_control.js`, y una prueba compara sus cifras con el texto sin JavaScript.

El capítulo parte con un diagrama del lazo de una rueda que se recorre en cuatro etapas, medir, comparar, calcular y aplicar, con la unidad de cada señal: ticks/ciclo para lo pedido y lo medido, PWM para la orden y m/s para la rueda. El simulador PID deja la curva anterior en gris al cambiar las ganancias, para comparar error estacionario y sobreimpulso. El interactivo del modelo FOPDT dibuja las curvas de ambas ruedas con los parámetros de la Tabla A4.4 y marca dónde se leen la ganancia, la constante de tiempo y el retardo. Con PWM bajo advierte que el modelo no tiene zona muerta. El bloqueo dibuja cómo crece cada memoria y el windup informa cuánto sigue el motor en el tope después de liberar la rueda. El enjambre muestra la generación, el peso de inercia y la dispersión, con el eje vertical creciendo hacia arriba.

`js/control-modelo.js` reúne las ganancias y cálculos que usan los interactivos y las pruebas. Las simulaciones de bloqueo no son mediciones ni reproducen exactamente el encoder físico. El umbral de 60 PWM del ejemplo de zona muerta es supuesto y ajustable, no un valor medido del robot. Las ganancias y bandas adaptadas provienen de los datos ya publicados en la guía. El código adaptado no está disponible, mientras que el código base se enlaza como referencia independiente. Las consideraciones adicionales sobre conservar la ley se distinguen de los motivos documentados.

## Evidencia analítica: estabilidad, plano y repeticiones

La actualización del 26 de octubre de 2026 sigue la versión de octubre de 2026 de la tesis. Agrega tres secciones con su interactivo, sus tablas y su respaldo sin JavaScript.

- `control.html#estabilidad` explica el análisis del lazo discreto del Anexo 4.12, con la Tabla A4.5, los criterios de estabilidad, el barrido de 625 combinaciones, la banda en que la salida no cambia y la comparación entre las ganancias del PSO, las definitivas y las originales. El interactivo dibuja los polos y la curva de Nyquist de cada rueda y recalcula los márgenes al mover el retardo, la ganancia o la constante de tiempo de la planta. Cada cifra dice si es una fila de la tesis o un cálculo con el mismo modelo.
- `mapeo.html#exactitud` presenta la comparación de los cinco mapas con el plano medido con huincha, del Anexo 8.5, con el esquema del recinto, las once distancias de la Tabla A8.3 y la media y el percentil 95 por mapa en ambos sentidos.
- `resultados.html#confianza` presenta el alcance estadístico de la Sección 5.6 y del Anexo 8.6, con la Tabla A8.4, la prueba binomial exacta y el número de repeticiones que haría falta.

`js/estabilidad-modelo.js` es un port del análisis lineal de la tesis. `herramientas/pruebas_estabilidad.js` comprueba que reproduce cada fila de la Tabla A4.5 con el redondeo de la tesis, el barrido y las cifras del texto. `js/estadistica-modelo.js` calcula los intervalos, y `herramientas/pruebas_estadistica.js` recalcula la Tabla A8.4 con los valores por repetición de `datos/`. El esquema estático del plano, `img/diagramas/plano-recinto.svg`, se genera con `node herramientas/diagramas_plano.js` desde la misma geometría que usa el interactivo.

Los gráficos de todos los interactivos ahora se dibujan con el ancho real de su contenedor desde el primer montaje. Antes, los que medían su contenedor mientras se montaban leían un ancho de cero, se dibujaban a 600 px y en un teléfono quedaban reducidos.

## Marco común: cabecera, menú, aviso, pie y buscador

La cabecera es la misma en todas las páginas y no queda fija: así la lectura usa la pantalla completa. Sobre 640 px muestra la navegación completa, Inicio, Guía, Laboratorios, El robot y Evidencia, y marca la sección actual. Bajo ese ancho, el menú es un `details` que abre sin JavaScript. Con JavaScript se comporta como un diálogo: aísla el resto de la página, el foco circula dentro y Escape lo cierra. En las páginas de la guía suma las secciones de la página, con la actual marcada, y las 16 partes numeradas. El índice lateral de escritorio lleva las mismas 16 partes y despliega las secciones de cualquiera. Una barra fina en el borde superior de la pantalla avanza con la lectura.

El buscador se abre con su botón, con Control o Comando y K o con la barra. Vacío ofrece búsquedas sugeridas y las recientes de quien lo usa, guardadas solo en su navegador. Encuentra las cifras con coma o punto y resalta las coincidencias.

## Preguntas difíciles

`preguntas.html` reúne 106 preguntas en 15 temas, cada una en un `details` con ancla `#p-…`, legible sin JavaScript. Cada respuesta se redacta de forma impersonal, con la repregunta más probable, la sección de la tesis que la respalda y el tema de la guía que la explica. El nivel va en `data-dificultad` (`general`, `tecnica` o `exigente`), no en `data-nivel`, que `js/sitio.js` reserva para la etiqueta de nivel de cada tema.

`js/preguntas.js` agrega la búsqueda, con la misma normalización del buscador del sitio, los filtros por tema y nivel, el modo práctica, que muestra primero un espacio para responder, y la pregunta al azar. Lo escrito en el modo práctica no se guarda. Los cinco temas agregados con la versión de octubre de 2026 cubren la estabilidad del control, la exactitud de los mapas, las repeticiones y la confianza, las fuentes citadas y la implementación descrita en los anexos. Los datos que solo el autor puede completar, como el método de medida del giro, conservan su comentario `PENDIENTE AUTOR` y un aviso visible, sin completar la respuesta. Un filtro de respaldo permite ver las respuestas con confirmación pendiente. El buscador del sitio indexa cada pregunta por separado.

## Bibliografía de la tesis

`bibliografia.html` reúne las 72 referencias de la tesis, numeradas como en ella y agrupadas en 11 grupos según la decisión que respaldan. Cada grupo explica en dos párrafos qué respalda y cómo se relacionan sus referencias, y su lista se abre con «Ver las N referencias». Cada referencia es un `details` con ancla `#r-…`: la línea visible dice número, autor, tipo y de qué trata en una frase, y al abrirla se lee en cinco bloques. La ficha va en dos columnas y en el teléfono pasa a una. De qué trata explica en varios párrafos el problema, el método, cómo lo evaluaron, sus resultados y sus límites. Relación con la tesis dice qué toma el trabajo, dónde aparece, en qué se diferencia y, cuando corresponde, dónde se aplica en el código del proyecto. Referencias relacionadas enlaza otras de la lista. Cita trae la cita textual, cuando la hay, y la cita como en la tesis, con botones para copiarla o copiar su entrada BibTeX. Los bloques largos muestran sus primeros párrafos y pliegan el resto con «Seguir leyendo».

Las afirmaciones salen del propio documento cuando el proyecto guarda una copia, y si no de su página oficial o su resumen publicado, revisados en octubre de 2026. La ficha dice de dónde sale cada detalle, y cuando una fuente no se pudo abrir lo declara y usa solo lo que dice la tesis. Las cifras que la tesis toma de una fuente se compararon con esa fuente.

`recursos.html#bibliografia` presenta la página, sus grupos y la descarga en BibTeX. Un script en la cabecera de `recursos.html` lleva los enlaces antiguos, `recursos.html#bibliografia`, `#bib-…` y `#r-…`, a la nueva página, y `js/sitio.js` hace lo mismo si el ancla cambia dentro de Recursos. Sin JavaScript se lee todo, cada grupo y cada referencia se abren a mano y el archivo `.bib` se descarga desde «Descargar y citar». Al imprimir se abre completa. El buscador tiene una entrada por referencia, con su resumen, los datos clave de la ficha y el detalle, y el filtro de la página busca en todo el texto de cada una.

La página pesa 111 KB comprimida. Lighthouse en teléfono, con un servidor local que comprime como GitHub Pages, le da 97 en rendimiento y 100 en accesibilidad, buenas prácticas y SEO, y axe no encuentra infracciones con todos los plegables abiertos. El índice del buscador, que se descarga solo al abrir la búsqueda, pasa de 141 a 209 KB comprimido.

## Cómo editar

1. **Temas.** La lista vive en `CAPS`, al inicio de `js/sitio.js`. Las páginas complementarias están en `EXTRAS` y se numeran a continuación, del 11 al 16. El lateral de cada página muestra las 16 partes y despliega las secciones de cualquiera: las de la página actual salen de su HTML y las demás de `datos/secciones.js`, que `python3 herramientas/indice.py` regenera junto con el índice del buscador.
2. **Texto.** Cada página es HTML estático. Después de cambiar texto, regenera el buscador con `python3 herramientas/indice.py` (requiere `beautifulsoup4`) y sube `datos/indice.js` junto con las páginas.
3. **Citas.** `<a class="ref" href="#f3">3</a>` apunta a `<li id="f3">` en la lista de fuentes de la misma página.
4. **Glosario.** `<span class="term" data-def="Definición corta.">término</span>` muestra la definición al pasar el cursor, al enfocarlo o al tocarlo.
5. **Imágenes.** En `.webp` con respaldo `.jpg` o `.png`. Los gráficos van en WebP sin pérdida, que pesa menos que el PNG y conserva las líneas nítidas. Las fotos de cabecera tienen además una versión de 800 o 900 px en `srcset`. La versión grande va en `data-grande` y se abre con el botón Ampliar.
6. **Interactivos.** Un elemento con `data-vis="nombre"` se monta al acercarse a la pantalla con la función `window.VISUALES.nombre`. El archivo que la define se pide en ese momento: registra el nombre en `MODULOS`, al comienzo de los interactivos en `js/sitio.js`. Los modelos de cálculo, como `control-modelo.js` o `movimiento-modelo.js`, siguen en el HTML de su página porque esos archivos los leen al cargarse.
7. **Contenido pendiente.** Los bloques ocultos con `hidden` llevan un comentario `PENDIENTE AUTOR` que dice qué falta.
   Los videos preparados usan `data-src` y `data-poster`. Basta con agregar los archivos y quitar `hidden`.
8. **PDF de la tesis.** Solo cuando esté autorizado y disponible, registra una URL verificada en `tesis_pdf` de `datos/academico.json`.
9. **Estado y parámetros.** Edita `datos/academico.json`, `datos/parametros.json` y los CSV autorizados. Ejecuta `python3 herramientas/datos.py` y después `python3 herramientas/indice.py`. Actualiza el HTML relacionado. Los respaldos estáticos no se sustituyen por datos dinámicos. Consulta `datos/README.md` y `docs/trazabilidad.csv`.
10. **Bibliografía.** Cada referencia de la tesis vive en `datos/bibliografia.json`. Se ven sin abrirla su número en la tesis, su tipo, su autor y su línea de resumen, de hasta 80 caracteres. Al abrirla se leen su `ficha` (título original y en español, autores o editores escritos «Apellido, Nombre» o «=Institución», fecha, medio, volumen, número, páginas, edición, identificadores, enlaces, idioma, acceso, revisión de pares, versión consultada, palabras clave y de dónde sale el detalle), las `partes` que usa la tesis, de qué trata el documento (`contenido`, en párrafos), qué toma la tesis y para qué (`relacion`), en qué se diferencia el trabajo (`diferencia`), dónde se aplica en el código (`codigo`, opcional), las tablas o figuras donde aparece (`elementos`), las referencias relacionadas y una cita textual opcional de hasta 30 palabras con su página y su traducción. En los párrafos, `{r-id}` enlaza otra referencia. El campo `nota` del JSON describe el esquema completo. Después de editarla, ejecuta `python3 herramientas/datos.py` y luego `python3 herramientas/indice.py`. `herramientas/bibliografia.py` valida el archivo y escribe `bibliografia.html`, la presentación de la bibliografía en `recursos.html` y `datos/bibliografia.bib`. Se detiene si una referencia queda en dos grupos o en ninguno, si los números no van de 1 al total, si falta un dato obligatorio de la ficha, si una sección de la guía o una referencia enlazada no existe, si la explicación de una referencia no tiene entre 300 y 600 palabras, si un resumen pasa de 80 caracteres o si un texto usa punto y coma o guiones como separadores.
11. **Pendientes e historial.** Los pendientes del autor y el historial de cambios viven en `datos/academico.json`. `herramientas/datos.py` los escribe como HTML estático en `recursos.html#estado-academico`, entre los comentarios `ESTADO DETALLE`. Cada pendiente puede llevar un enlace a la pregunta o sección donde se nota.
12. **Tipografía.** Las fuentes de las páginas de la guía usan `font-display: optional`: si no llegan en el primer instante, la página sigue con el respaldo y nunca cambia de letra después de dibujarse, así el texto no se mueve. La página siguiente ya las trae de la caché. Los anchos de lectura van en `em` y no en `ch`, porque el cero de Atkinson Hyperlegible es mucho más ancho que el de las fuentes del sistema. Las familias `Archivo Respaldo` y `Atkinson Respaldo` de `css/estilo.css` usan una fuente del sistema escalada para ocupar el mismo ancho mientras llegan las fuentes: Arial o sus equivalentes de igual ancho en Windows, macOS, iOS, ChromeOS y Linux, y las variantes `Roboto` y `DejaVu` en Android y en Linux sin Arial. El `size-adjust` de `Archivo Respaldo` está ajustado al Chrome de GitHub Actions, que dibuja Liberation Sans cerca de un 1 % más ancha que Chrome 153: el comentario de `css/estilo.css` explica la medición. Si cambias una fuente o el navegador de CI, recalcula su `size-adjust` y revisa la prueba de títulos de `pruebas_experiencia_navegador.py`.
13. **Figuras y ejemplos generados.** `node herramientas/diagramas_control.js` regenera la figura de respaldo del PID, `node herramientas/diagramas_mapeo.js` las del capítulo 05, `node herramientas/diagramas_plano.js` el esquema del plano del recinto y `node herramientas/ejemplos_laboratorio.js` los archivos sintéticos del laboratorio. Con `--comprobar` no escriben nada y fallan si un archivo guardado quedó atrás de su modelo, que es como los ejecuta GitHub Actions. Si cambias un texto que también va en una figura, como la etiqueta de los candidatos de cierre, vuelve a generarla.
14. **Costos y carta Gantt.** `datos/costos.csv` guarda las 51 compras del registro del autor, ordenadas según las partidas de la Tabla A1.1, y `datos/planificacion.json` la carta Gantt de marzo a agosto de 2026. `python3 herramientas/datos.py` escribe con ellos el detalle de costos de `robot.html#gasto` y la carta de `problema.html#carta-gantt`, y se detiene si una partida no suma lo mismo que la tesis.
15. **PDF de las preguntas.** `python3 herramientas/descarga_preguntas.py` imprime con Chromium `descargas/preguntas-dificiles.pdf` desde `preguntas.html`, con las fuentes del sitio, y actualiza su botón de descarga. Requiere `playwright`. Con `--comprobar` revisa, sin navegador, que el PDF corresponda a las preguntas actuales. Regenéralo cada vez que cambie una pregunta, una respuesta o una fuente de esa página.
16. **Íconos, logo e imagen para compartir.** Los íconos son de Phosphor Icons, versión 2.1.1, en línea en `herramientas/plantillas/`, `js/marco.js`, `js/sitio.js`, `js/comun.js`, los componentes de la portada y las páginas, con la clase `ph`. Se agregan desde el paquete `@phosphor-icons/core`: se copia el contenido del SVG con `viewBox="0 0 256 256"`. Su licencia está en `LICENSE-iconos.txt`. La marca es el robot real visto desde arriba, con su chasis en D, en `herramientas/plantillas/cabecera.html` y en `img/icono.svg`. `python3 herramientas/imagen_social.py` rehace `img/social.png`, la imagen que aparece al compartir un enlace, con la marca y las fuentes del sitio. Requiere `playwright`.

## Ver los capítulos originales en tu computador

Para la nueva portada y el laboratorio usa `npm run dev`, como se indica al inicio.

```bash
python3 -m http.server 8000
```

Luego abre http://localhost:8000

## Pruebas

```bash
node herramientas/pruebas_unitarias.js
node herramientas/pruebas_control.js
node herramientas/pruebas_mapeo.js
node herramientas/pruebas_slam_proceso.js
node herramientas/pruebas_movimiento.js
python3 herramientas/pruebas_control_navegador.py
python3 herramientas/pruebas_mapeo_navegador.py
python3 herramientas/pruebas_movimiento_navegador.py
node herramientas/pruebas_analisis.js
node herramientas/pruebas_estabilidad.js
node herramientas/pruebas_estadistica.js
python3 herramientas/verificar_sitio.py
python3 herramientas/pruebas_laboratorio_navegador.py
python3 herramientas/pruebas_robustez_navegador.py
python3 herramientas/pruebas_evidencia_navegador.py
python3 herramientas/pruebas_navegador.py
python3 herramientas/pruebas_experiencia_navegador.py
python3 herramientas/pruebas_redisenio_navegador.py
node herramientas/ejemplos_laboratorio.js --comprobar
node herramientas/diagramas_plano.js --comprobar
node herramientas/diagramas_mapeo.js --comprobar
node herramientas/diagramas_control.js --comprobar
```

Las comprobaciones de desborde comparan el ancho del contenido con `document.documentElement.clientWidth` y no con `innerWidth`. En modo teléfono `innerWidth` crece junto con lo que desborda, así que la comparación anterior siempre se cumplía y no detectó que la cabecera se salía de la pantalla. `pruebas_navegador.py` recorre además las 17 páginas a 320 y 375 px con pantalla táctil.

`pruebas_experiencia_navegador.py` comprueba lo agregado en la revisión de experiencia: con las fuentes 1,2 s tarde el CLS queda bajo 0,02 y, si falla, el registro dice qué elemento se movió, ninguna página carga los archivos de interactivos al abrirse, el comparador de decisiones, el filtro del glosario, la bibliografía en su página, con el resumen y los cinco bloques de cada referencia, el plegado de los bloques largos, la ficha en una o dos columnas, los botones para copiar la cita y su BibTeX, el filtro, el teclado, la impresión y el traslado de los enlaces antiguos de Recursos, las secciones en el menú del teléfono, el movimiento reducido de los capítulos. También compara, entre 320 y 480 px, las líneas del título de cada tema con el respaldo y con Archivo, y comprueba que todas las fuentes web usen `font-display: optional`. Si el sistema no tiene ninguna fuente de respaldo compatible, omite esas mediciones y lo avisa.

`pruebas_robustez_navegador.py` bloquea `datos/proyecto.js` y quita `MediaQueryList.addEventListener` para comprobar que la cabecera, el pie y los interactivos sigan funcionando. También recorre con teclado las tablas anchas en un teléfono, mide la altura del aviso académico en móvil, revisa las lecturas por regla del PID, el mapa armado del grafo de poses, las fichas del concepto y el estado académico sin JavaScript.

`pruebas_navegador.py` también comprueba que la cabecera, el aviso, el pie y el buscador tengan el mismo marcado y los mismos estilos en la portada, los laboratorios y la guía, que la cabecera quepa entre 320 y 1920 px, que el menú del teléfono lleve la guía numerada, que las herramientas de Preguntas difíciles funcionen con y sin JavaScript y que un botón deshabilitado se vea apagado, sin la mano ni resaltado al pasar el ratón.

Las pruebas de Node revisan la geometría, el reloj y los casos numéricos de control. Las pruebas del capítulo 3 comprueban la cinemática y el centro de giro, la integración sobre arcos, los datos de la recta frente a su CSV, la calibración y el cuadrado en dos sentidos. Las pruebas unitarias incluyen además la búsqueda A estrella, con su h admisible. `pruebas_movimiento_navegador.py` recorre el capítulo 3 y A estrella en escritorio, móvil de 390 y 320 px, esquema oscuro del sistema y movimiento reducido. Las pruebas de mapeo añaden oclusión y colisiones del LiDAR, celdas no observadas, el índice de cobertura, la curva de desacuerdo de los barridos, transformaciones SE(2) y optimización del grafo. `pruebas_control_navegador.py` inicia un servidor local temporal y comprueba los interactivos del capítulo 4 en escritorio, móvil de 390 y 320 px, esquema oscuro del sistema y movimiento reducido. `pruebas_evidencia_navegador.py` recorre los interactivos de estabilidad, del plano y de las repeticiones en escritorio, en teléfonos de 390 y 320 px y en tema oscuro, y lee sus respaldos sin JavaScript. `pruebas_mapeo_navegador.py` hace lo mismo con los diez interactivos del capítulo 05: teclado, lecturas de área e índice, la cadena TF, la curva de los barridos, el desacuerdo del grafo y que los SVG en línea no traigan estilos. Requiere Playwright con Chromium instalado solo para desarrollo. `pruebas_navegador.py` usa Chromium con Playwright y recorre las páginas en escritorio, en teléfono y con movimiento reducido. Revisa errores, enlaces, anclas, el buscador, el glosario, los simuladores y el uso en teléfono. También prueba el tema: que cada página lo aplique antes de pintar, que el botón lo cambie y lo recuerde entre páginas, que los simuladores se vuelvan a dibujar y que los dos bloques oscuros de cada hoja coincidan.

## Capítulo 05: lo que mide cada interactivo

La ampliación del 22 de octubre de 2026 explica los cuatro componentes de SLAM por grafos, la selección y comprobación de candidatos, la covarianza y el costo ponderado. `js/slam-proceso.js` añade dos modelos locales: el selector con un pasillo compatible, otro parecido, una pose reciente y una lejana, y una comparación por eventos de colas síncronas y omisiones asíncronas. Ambos tienen controles por pasos, reinicio, respaldo sin JavaScript y supuestos explícitos. No ejecutan SLAM Toolbox ni usan registros experimentales. El grafo permite variar el peso del cierre manteniendo las mediciones, con los mismos resultados iniciales por defecto.

Se distinguen PGM/YAML y sesión serializada, mapeo, localización, continuación y lifelong mapping, con enlaces por minutos a ROSCon 2019. La tabla de parámetros separa lo declarado en la guía de los valores que no se publicaron: no copia valores predeterminados al prototipo. AMCL se presenta como una de las localizaciones posibles de un protocolo de metas fijas, junto con la de SLAM, y se precisan las descripciones de GMapping y del marco map en todas las páginas relacionadas. El estado académico y las tablas originales se conservan. Detalle y aplicación del parche en [docs/mejoras-slam-20261022.md](docs/mejoras-slam-20261022.md).

El LiDAR tiene leyenda, escala de 1 m y un robot que no se confunde con un botón. Bajo la vista superior, una vista 3D de la misma sala muestra el plano del láser a su altura: cruza las patas de la mesa y las paredes, pasa sobre la caja baja y bajo la cubierta. Está dibujada a mano en un canvas, sin bibliotecas, con las caras ordenadas de atrás hacia adelante y la escena partida a la altura del láser. Se gira arrastrando o con las flechas y tiene tres puntos de vista. Sus alturas son de ejemplo. La rejilla calcula el área libre y el índice de cobertura con la misma fórmula de los resultados. La cadena TF se dibuja en el marco map: al aplicar map → odom se mueve el origen de odom y la flecha de las ruedas conserva su largo. El ajuste de barridos muestra la curva del desacuerdo total, con mínimo en 30 cm frente a los 40 cm que estiman las ruedas. El grafo de poses informa el desacuerdo en cada paso: 0 sin cierre, 29,3 al añadirlo y 0,18 después de optimizar. El ejemplo de cobertura conserva la celda ocupada en ambas imágenes y permite agrandar el margen desconocido para ver que el índice baja mientras el área no cambia.

Los SVG en línea no llevan estilos propios, para que no afecten al resto de la página. Los archivos exportados a `img/diagramas/` sí los incluyen.

El grafo de poses también arma el mapa que forman las observaciones. Cada pose guarda lo que vio el láser en su propio marco, sin error en este ejemplo, y el mapa se dibuja donde dice la pose estimada. Antes del cierre, la pared vista al inicio y al regreso queda a 17,7 cm de sí misma. Después de optimizar coinciden, pero el mapa mide 2,15 m de ancho frente a 2,10 m del recinto del ejemplo: un mapa coherente puede conservar un error de escala. Es un recinto ilustrativo y no reemplaza una medición del prototipo.

Control, navegación y mapeo tienen una ficha del concepto plegable, con qué es, para qué sirve, cómo funciona, dónde verlo, un ejemplo numérico, cómo se usa en el robot y sus límites.

Los dibujos de respaldo del capítulo 05 se regeneran con `node herramientas/diagramas_mapeo.js`. Se guardan en `img/diagramas/` y permiten leer el capítulo sin JavaScript. Los modelos del capítulo están aislados en `js/mapeo.js`. No ejecutan SLAM Toolbox ni Ceres y no reemplazan las mediciones originales.

## Publicar en GitHub Pages

En Settings, Pages, elige "Deploy from a branch", rama `main` y carpeta `/ (root)`. Cada commit en `main` se publica en uno o dos minutos.

```bash
python3 herramientas/indice.py
git add -A
git commit -m "Describe el cambio"
git push origin main
```

## Experiencia y rendimiento de la versión anterior

Este apartado documenta la revisión del 26 de octubre, previa a la portada Astro/Svelte y al diseño común. La paleta azul de la UTEM, el tema oscuro de entonces y la cabecera fija que describe ya no están. El tema oscuro actual es otro, común a todo el sitio.

La revisión del 26 de octubre de 2026 conserva el HTML, CSS y JavaScript sin compilación y suma una identidad de plano técnico: la rejilla de ocupación detrás de los títulos, los anillos del LiDAR alrededor del prototipo, paneles azul noche y la franja azul y verde de la UTEM. La simulación del ciclo en la portada se dibuja como una consola azul noche, las imágenes de los temas comparten un tono azul que recupera su color al apuntarlas y en un teléfono cada tema es una fila compacta.

- **Sin saltos al cargar.** Las fuentes críticas se precargan y las de respaldo tienen métricas ajustadas, así el texto no se mueve cuando llegan. El CLS en teléfono, que iba de 0,14 a 0,33 según la página, quedó cerca de 0. Desde el 27 de octubre el respaldo también se ajusta a Roboto, de Android, y a DejaVu Sans, de Linux. Con solo Roboto instalada, el CLS en teléfono bajó de 0,145 a 0,0001.
- **Menos peso al abrir.** Los archivos de interactivos se piden al acercarse a la pantalla, los videos en bucle y la portada de un video lejano esperan a que el navegador quede libre y los gráficos pasaron a WebP sin pérdida.
- **Navegación.** Transición suave entre páginas con la cabecera fija, en navegadores que la soportan, y precarga de la página siguiente al apuntar un enlace. En un teléfono, el menú suma las secciones de la página que se lee.
- **Interactivos nuevos.** Comparador de decisiones en `problema.html#estado-del-arte`, filtro del glosario en `recursos.html#glosario` y bibliografía de la tesis, hoy en `bibliografia.html`, en grupos y con filtro, donde cada referencia es una línea de resumen que se abre con su detalle. El buscador del sitio lleva directo a cada referencia abierta.
- **Movimiento con propósito.** Las tarjetas aparecen con un leve ascenso al desplazarse y el barrido del LiDAR de la portada dura menos de 5 s. Con movimiento reducido no hay animaciones.

Lighthouse local, con compresión gzip como GitHub Pages: rendimiento de 78 a 94 antes y de 95 a 99 después en teléfono, 100 en escritorio, accesibilidad 100 y SEO 100 en las 16 páginas. El detalle está en `docs/historial/informe-tecnico-a5bd066.md`.

## Accesibilidad

Se comprueban los temas claro y oscuro, el del sistema y el elegido con el botón, movimiento reducido, navegación por teclado y respaldos. El menú móvil limita el foco y aísla el fondo, y el aviso académico y la navegación esencial funcionan sin JavaScript. Una tabla que no cabe en la pantalla se vuelve una región enfocable con nombre, para recorrerla con las flechas, y deja de serlo cuando vuelve a caber. Cada parte del arranque se inicia aislada: si una falla, las demás siguen. Las verificaciones automáticas y la revisión visual no son una certificación completa de WCAG 2.2 AA ni sustituyen pruebas con lectores de pantalla.

## Cómo citar

Valderas Neculqueo, S. (2026). *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* [Trabajo de titulación en revisión por comité, versión de octubre de 2026]. Universidad Tecnológica Metropolitana.

El formato BibTeX está en `recursos.html#citar`.

## Licencia

El código del sitio, es decir `js/`, `css/`, `herramientas/` y la estructura de las páginas HTML, usa la licencia MIT del archivo `LICENSE`. Los textos, diagramas, fotos, figuras propias y las tablas de `datos/ensayos/` y `datos/analisis/` usan CC BY 4.0, como detalla `LICENSE-contenido.md`. Las imágenes de productos de terceros quedan fuera de esa licencia, las tipografías de `fuentes/` se rigen por la licencia OFL y los íconos de Phosphor por la licencia MIT de `LICENSE-iconos.txt`. `modelos/robot.glb` incluye modelos de componentes comerciales que vienen en el ensamblaje del autor, como el RPLidar A1 y las placas. El autor confirmó que sus licencias permiten publicarlos, como indica `modelos/README.md`. Titular: Sebastián Valderas Neculqueo, 2026.

## Créditos de imágenes

Las fotos del prototipo, el recinto y las figuras técnicas son del autor y provienen de la tesis. Las imágenes de productos de terceros, como el RPLidar A1, el router GL.iNet, el Husky A300 y el LoCoBot, son de sus fabricantes y se usan para identificar los equipos. El detalle está en `recursos.html#creditos`.

## Laboratorio de análisis local

Elige una de las siete tablas ya disponibles o abre un CSV propio desde `laboratorio.html`. Se leen en memoria: no se suben, se guardan ni se procesan con IA. El análisis valida las columnas y unidades, distingue datos declarados de cálculos derivados y muestra condiciones y límites de cada regla. Se puede exportar JSON con procedencia, opciones y una huella local del texto UTF-8.

Las tablas actuales no permiten reconstruir trayectorias, rejillas ni el establecimiento del escalón. Un formato temporal opcional puede analizar registros propios, sin atribuirlos al robot.

También lee mapas de ocupación PGM, con su YAML si existe. Cuenta celdas libres, ocupadas y desconocidas con los umbrales de la tesis o los del YAML, calcula áreas y el índice de cobertura en la imagen completa y en el rectángulo observado, y compara dos mapas celda a celda solo si comparten tamaño, resolución y origen. Un registro de estados de metas, con una fila por meta en cada mensaje de estado, se clasifica por identificador como en el Anexo 8.4: completadas, abortadas asociadas a reemplazo, abortadas sin clasificar, canceladas y sin estado final. La asociación es temporal y no descarta fallas concurrentes. Los botones de ejemplo usan archivos sintéticos de `datos/ejemplos/`, rotulados como tales. Consulta `docs/laboratorio.md`. No se instalan modelos de IA ni servicios de inferencia.

## Documentación y revisión

- `docs/auditoria-inicial.md`, `docs/auditoria-e876140.md`, `docs/auditoria-b922205.md`, `docs/auditoria-a5bd066.md`, `docs/auditoria-ae42f52.md` y `docs/auditoria-3bae57b.md`: hallazgos y funcionalidades conservadas en cada revisión. La de b922205 contrasta el sitio con la versión de octubre de 2026 de la tesis, la de a5bd066 mide la experiencia y el rendimiento, la de ae42f52 revisa fallas y la bibliografía y la de 3bae57b revisa el estado completo en teléfonos, accesibilidad, interactivos y redacción.
- `docs/informe-tecnico.md`: cambios, pruebas, uso y entrega de la revisión más reciente. Los informes anteriores están en `docs/historial/`.
- `docs/informe-academico.md`: integridad del contenido y asuntos que requieren confirmación.
- `docs/decisiones.md`: razones de arquitectura y límites de la evolución.
- `docs/mejoras-slam-20261022.md`: explicaciones de SLAM agregadas el 22 de octubre de 2026.
- `docs/trazabilidad.csv`, `docs/observaciones-comite.csv`, `docs/inventario-publicacion.csv`: fuentes, plantilla de observaciones reales y autorización de material.

`.github/workflows/verificar.yml` comprueba modelos, datos generados, enlaces y navegador en GitHub Actions al abrir un PR o actualizar main. Si una comprobación falla, su nombre aparece como anotación en el resumen de la ejecución, sin abrir el registro. Las dependencias de pruebas solo son para desarrollo. No se agregaron dependencias al sitio ni se publicó automáticamente la rama de trabajo.

Para aplicar un parche, parte de la revisión base indicada en el informe técnico, crea una rama independiente y ejecuta `git am` con el archivo del parche. Revisa el resultado antes de incorporar los cambios a main.
