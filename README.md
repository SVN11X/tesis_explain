# Robot explorador

Guía abierta sobre el trabajo de titulación **"Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial"**, de Sebastián Valderas Neculqueo, con el profesor guía Patricio Galarce Acevedo. Ingeniería Civil Electrónica, Universidad Tecnológica Metropolitana (UTEM), 2026.

**Estado académico: en revisión por comité; la tesis no está aprobada.** La versión del documento y la fecha de los datos deben confirmarse con el autor. Las cifras pueden cambiar sin que esta plataforma decida conclusiones académicas.

**Sitio:** https://svn11x.github.io/tesis_explain/

![Una corrida real: a la izquierda la cámara cenital, a la derecha el mapa que construye el robot en RViz](img/mapa-crece.gif)

## Qué es

Un robot de bajo costo, con ROS 2, que entra a un recinto que no conoce, lo recorre solo y dibuja su plano. La guía explica cada parte del trabajo con la idea, la evidencia medida, los límites y casos del mundo real. Cada afirmación lleva su fuente numerada.

## Contenido

| Página | Tema |
|---|---|
| `index.html` | Portada, video, el ciclo en cuatro pasos, temas, cifras, casos reales, una muestra de preguntas y rutas de lectura |
| `problema.html` | Autonomía en interiores, estado del arte y cada decisión frente a sus alternativas |
| `robot.html` | Piezas, energía, red, reparto entre Arduino, Raspberry Pi y computador, ROS 2 y costo |
| `movimiento.html` | Tracción diferencial y centro de giro, encoders, odometría, ensayos de recta y giro, qué corrige una calibración y el cuadrado en dos sentidos |
| `control.html` | El lazo de una rueda con sus unidades, PID en tiempo discreto, la ley heredada que opera como PI, windup, el modelo FOPDT y PSO |
| `mapeo.html` | LiDAR 2D, rejilla de ocupación con área e índice, REP 103/105 y TF, ajuste de barridos con su curva de desacuerdo, grafo de poses, Ceres, capas de RViz y resultados de mapeo |
| `navegacion.html` | Mapas de costos, inflación, A estrella paso a paso, DWB y recuperaciones |
| `exploracion.html` | Exploración por fronteras y por qué 53 de 54 metas abortadas fueron reemplazos |
| `gemelo.html` | El modelo en Gazebo Classic y qué se compara con qué |
| `resultados.html` | Niveles de evidencia, los cuatro objetivos, limitaciones y trabajo futuro |
| `replicar.html` | Materiales, conexiones, versiones, repositorios base y videos para aprender |
| `mundo-real.html` | Casos reales, de una aspiradora a la mina El Teniente y a Marte |
| `lecciones.html` | Lecciones de ingeniería que la tesis deja implícitas |
| `preguntas.html` | 54 preguntas difíciles en 10 temas y 3 niveles, con respuesta, repregunta probable, respaldo en la tesis y enlace al tema |
| `laboratorio.html` | Análisis local de CSV, de mapas de ocupación PGM y de registros de estados de metas, con métricas con fórmula, reglas transparentes, validación, procedencia y exportación JSON sin LLM |
| `recursos.html` | Glosario, bibliografía, fuentes externas, materiales, cómo citar y créditos |

## Criterios del contenido

Las cifras y figuras del robot salen de la tesis y se citan con su sección, tabla o figura. Las fuentes externas se marcan por tipo y se reúnen en `recursos.html`. Los interactivos llevan la etiqueta **Datos de la tesis** cuando muestran mediciones, e **Interactivo** o **Ilustrativo** cuando usan datos de ejemplo, y lo que no se midió se dice de forma explícita.

## Estructura de archivos

```
├── *.html               páginas del sitio
├── css/estilo.css       diseño, tema claro y oscuro, impresión
├── js/sitio.js          cabecera fija, menú, pie, índice lateral, buscador, citas, glosario, imágenes y videos
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
├── js/analisis-modelo.js análisis de CSV y de registros de estados de metas, sin DOM
├── js/analisis-mapa.js  lectura de PGM y YAML, conteo de celdas y comparación de mapas, sin DOM
├── js/laboratorio.js    presentación del laboratorio
├── css/laboratorio.css  estilos exclusivos del laboratorio
├── js/preguntas.js      búsqueda, filtros, modo práctica y pregunta al azar de Preguntas difíciles
├── css/preguntas.css    estilos exclusivos de Preguntas difíciles
├── datos/indice.js      índice del buscador, generado
├── datos/academico.json estado académico, pendientes del autor e historial de cambios del sitio
├── datos/parametros.json parámetros ya publicados en la guía, con su fuente
├── datos/proyecto.js    módulo generado desde los JSON y los CSV
├── datos/ensayos/       tablas de los ensayos en CSV, con su origen en la tesis
├── datos/ejemplos/      archivos SINTÉTICOS para probar el laboratorio, no son datos del robot
├── docs/                auditorías, informes, decisiones, trazabilidad y plantillas de revisión
├── herramientas/        generadores, índice del buscador y pruebas
├── fuentes/             tipografías locales con su licencia OFL
└── img/                 fotos, figuras de la tesis, animaciones y miniaturas
```

No hay dependencias ni paso de compilación.

## Capítulo 3: centro de giro, sesgo y calibración

`movimiento.html` explica la tracción diferencial con el centro de giro: el simulador dibuja ese punto, el círculo que seguirá el robot y el de cada rueda, y escribe las fórmulas con los valores de los deslizadores. Cuando el círculo cabe, el robot parte de modo que su centro de giro quede al medio del dibujo. La animación se pausa con un botón y espera a que la persona la inicie si el sistema pide reducir el movimiento.

El encoder compara la cuenta con los cuatro flancos de A y B con la cuenta que usa solo las subidas de A, para ver la multiplicación por cuatro paso a paso. La resolución de 0,11 mm por flanco sale de 2π · 33,5 mm / 1980.

El interactivo de calibración usa los errores de la Tabla A6.2 y separa sesgo, el error medio de 3,63 %, de dispersión, la desviación estándar de 0,44 %. Dividir por 1,0363 deja el error medio en cero y no quita la dispersión. Es un cálculo sobre los datos publicados: la tesis no aplicó esa corrección. El modo de simulación, rotulado como tal, prueba el factor en repeticiones nuevas.

El cuadrado en dos sentidos ilustra el método UMBmark de Borenstein y Feng con una diferencia entre ruedas y una separación efectiva distinta de la configurada. Muestra que los dos errores pueden compensarse en un sentido y sumarse en el otro. Es ilustrativo: el robot no se ensayó así. El caso de los conteos medidos, 1976 y 1969 flancos por vuelta, supone radios iguales.

`js/movimiento-modelo.js` reúne esos cálculos para los interactivos y las pruebas, y lee los mismos valores de `datos/ensayos/recta-2m-real.csv`, que las pruebas comparan.

## Capítulo 6: A estrella paso a paso

El interactivo de búsqueda guarda cada paso de Dijkstra y de A estrella. Se puede reproducir, pausar, avanzar de a uno o ir a cualquier paso con un deslizador. En cada paso muestra la celda que se revisa, el camino que la alcanzó (g), la estimación hasta la meta (h), f = g + h y las celdas pendientes. Las cuentas finales, 291 y 111 celdas para una ruta de 27 pasos, quedan siempre a la vista.

## Capítulo 4: control por ciclos y límites del firmware

`control.html` separa velocidad (m/s), conteo (ticks/ciclo), PWM e ITerm en la escala interna del numerador. Explica el error estacionario antes de usarlo, la diferencia entre 30 Hz nominales y el intervalo entero de 33 ms, y la separación entre tiempo continuo/discreto y forma posicional/incremental.

Los interactivos permiten aislar Kp, Kd y Ki, avanzar por ciclos, cancelar visualmente las diferencias de medición, distinguir el cambio de referencia del cambio de medición, inspeccionar truncamientos y comparar memoria y recuperación tras un bloqueo. El ejemplo de windup también permite proteger el integrador de un PI tradicional (PID con D=0 para aislar el fenómeno).

La comparación PSO/final muestra los seis pares de valores por rueda, con escalas explícitas e información sobre la validación. Los ejemplos de resolución separan el conteo del encoder, los dos decimales del registro y el promedio posterior; la recta está ensayada y el giro se identifica como estimación.

El simulador «Ajusta un PID» toma su modelo de `js/control-modelo.js` y agrega lecturas por regla. Cada lectura dice qué condición la activó y con qué cálculo se comprueba. Con solo P, por ejemplo, el error final coincide con referencia / (1 + K·P), y la lectura lo escribe con los números del gráfico. La figura de respaldo `img/diagramas/pid-respaldo.svg` se genera con el mismo modelo mediante `node herramientas/diagramas_control.js`, y una prueba compara sus cifras con el texto sin JavaScript.

El capítulo parte con un diagrama del lazo de una rueda que se recorre en cuatro etapas, medir, comparar, calcular y aplicar, con la unidad de cada señal: ticks/ciclo para lo pedido y lo medido, PWM para la orden y m/s para la rueda. El simulador PID deja la curva anterior en gris al cambiar las ganancias, para comparar error estacionario y sobreimpulso. El interactivo del modelo FOPDT dibuja las curvas de ambas ruedas con los parámetros de la Tabla A4.4 y marca dónde se leen la ganancia, la constante de tiempo y el retardo. Con PWM bajo advierte que el modelo no tiene zona muerta. El bloqueo dibuja cómo crece cada memoria y el windup informa cuánto sigue el motor en el tope después de liberar la rueda. El enjambre muestra la generación, el peso de inercia y la dispersión, con el eje vertical creciendo hacia arriba.

`js/control-modelo.js` reúne las ganancias y cálculos que usan los interactivos y las pruebas. Las simulaciones de bloqueo no son mediciones ni reproducen exactamente el encoder físico. El umbral de 60 PWM del ejemplo de zona muerta es supuesto y ajustable, no un valor medido del robot. Las ganancias y bandas adaptadas provienen de los datos ya publicados en la guía; el código adaptado no está disponible, mientras que el código base se enlaza como referencia independiente. Las consideraciones adicionales sobre conservar la ley se distinguen de los motivos documentados.

## Cabecera fija y panel de Temas

La cabecera queda arriba al bajar por cualquier página. El elemento fijo es el contenedor `#cabecera`, porque un elemento `sticky` solo se queda pegado dentro de su padre. Al bajar se marca con una sombra y la barra de lectura corre por su borde inferior. Una franja azul y verde en el borde superior repite la del pie.

El panel de Temas cuelga de la cabecera completa y se centra en ella, con un ancho máximo de 1000 px y un alto que no supera la pantalla. Así no queda cortado aunque el botón esté lejos del borde o el navegador tenga zoom. Entre 861 y 1180 px, En el mundo real y Lecciones salen de la barra y quedan en la fila de complementos del panel. Bajo 861 px la navegación pasa al menú lateral. En un tema, el botón Temas se marca como sección actual.

## Preguntas difíciles

`preguntas.html` reúne 54 preguntas en 10 temas, cada una en un `details` con ancla `#p-…`, legible sin JavaScript. Cada respuesta se redacta de forma impersonal, con la repregunta más probable, la sección de la tesis que la respalda y el tema de la guía que la explica. El nivel va en `data-dificultad` (`general`, `tecnica` o `exigente`), no en `data-nivel`, que `js/sitio.js` reserva para la etiqueta de nivel de cada tema.

`js/preguntas.js` agrega la búsqueda, con la misma normalización del buscador del sitio, los filtros por tema y nivel, el modo práctica, que muestra primero un espacio para responder, y la pregunta al azar. Lo escrito en el modo práctica no se guarda. Los datos que solo el autor puede completar, como la razón de elegir 0,13 m/s, conservan su comentario `PENDIENTE AUTOR` y un aviso visible, sin completar la respuesta. Un filtro de respaldo permite ver las respuestas con confirmación pendiente. El buscador del sitio indexa cada pregunta por separado.

## Cómo editar

1. **Temas.** La lista vive en `CAPS`, al inicio de `js/sitio.js`. Las páginas complementarias están en `EXTRAS`.
2. **Texto.** Cada página es HTML estático. Después de cambiar texto, regenera el buscador con `python3 herramientas/indice.py` (requiere `beautifulsoup4`) y sube `datos/indice.js` junto con las páginas.
3. **Citas.** `<a class="ref" href="#f3">3</a>` apunta a `<li id="f3">` en la lista de fuentes de la misma página.
4. **Glosario.** `<span class="term" data-def="Definición corta.">término</span>` muestra la definición al pasar el cursor, al enfocarlo o al tocarlo.
5. **Imágenes.** En `.webp` con respaldo `.jpg` o `.png`. La versión grande va en `data-grande` y se abre con el botón Ampliar.
6. **Interactivos.** Un elemento con `data-vis="nombre"` se monta al entrar en pantalla con la función `window.VISUALES.nombre`.
7. **Contenido pendiente.** Los bloques ocultos con `hidden` llevan un comentario `PENDIENTE AUTOR` que dice qué falta.
   Los videos preparados usan `data-src` y `data-poster`. Basta con agregar los archivos y quitar `hidden`.
8. **PDF de la tesis.** Solo cuando esté autorizado y disponible, registra una URL verificada en `tesis_pdf` de `datos/academico.json`.
9. **Estado y parámetros.** Edita `datos/academico.json`, `datos/parametros.json` y los CSV autorizados. Ejecuta `python3 herramientas/datos.py` y después `python3 herramientas/indice.py`. Actualiza el HTML relacionado; los respaldos estáticos no se sustituyen por datos dinámicos. Consulta `datos/README.md` y `docs/trazabilidad.csv`.
10. **Pendientes e historial.** Los pendientes del autor y el historial de cambios viven en `datos/academico.json`. `herramientas/datos.py` los escribe como HTML estático en `recursos.html#estado-academico`, entre los comentarios `ESTADO DETALLE`. Cada pendiente puede llevar un enlace a la pregunta o sección donde se nota.
11. **Figuras y ejemplos generados.** `node herramientas/diagramas_control.js` regenera la figura de respaldo del PID y `node herramientas/ejemplos_laboratorio.js` los archivos sintéticos del laboratorio; con `--comprobar` solo verifica que estén al día.

## Ver el sitio en tu computador

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
python3 herramientas/verificar_sitio.py
python3 herramientas/pruebas_laboratorio_navegador.py
python3 herramientas/pruebas_robustez_navegador.py
python3 herramientas/pruebas_navegador.py
node herramientas/ejemplos_laboratorio.js --comprobar
```

`pruebas_robustez_navegador.py` bloquea `datos/proyecto.js` y quita `MediaQueryList.addEventListener` para comprobar que la cabecera, el pie y los interactivos sigan funcionando. También recorre con teclado las tablas anchas en un teléfono, mide la altura del aviso académico en móvil, revisa las lecturas por regla del PID, el mapa armado del grafo de poses, las fichas del concepto y el estado académico sin JavaScript.

`pruebas_navegador.py` también comprueba que la cabecera quede fija al bajar, que el panel de Temas quepa en la pantalla entre 862 y 1920 px y que las herramientas de Preguntas difíciles funcionen con y sin JavaScript.

Las pruebas de Node revisan la geometría, el reloj y los casos numéricos de control. Las pruebas del capítulo 3 comprueban la cinemática y el centro de giro, la integración sobre arcos, los datos de la recta frente a su CSV, la calibración y el cuadrado en dos sentidos. Las pruebas unitarias incluyen además la búsqueda A estrella, con su h admisible. `pruebas_movimiento_navegador.py` recorre el capítulo 3 y A estrella en escritorio, móvil de 390 y 320 px, modo oscuro y movimiento reducido. Las pruebas de mapeo añaden oclusión y colisiones del LiDAR, celdas no observadas, el índice de cobertura, la curva de desacuerdo de los barridos, transformaciones SE(2) y optimización del grafo. `pruebas_control_navegador.py` inicia un servidor local temporal y comprueba los interactivos del capítulo 4 en escritorio, móvil de 390 y 320 px, modo oscuro y movimiento reducido. `pruebas_mapeo_navegador.py` hace lo mismo con los nueve interactivos del capítulo 05: teclado, lecturas de área e índice, la cadena TF, la curva de los barridos, el desacuerdo del grafo y que los SVG en línea no traigan estilos. Requiere Playwright con Chromium instalado solo para desarrollo. `pruebas_navegador.py` usa Chromium con Playwright y recorre las páginas en escritorio, en teléfono y con movimiento reducido. Revisa errores, enlaces, anclas, el buscador, el glosario, los simuladores y el uso en teléfono.

## Capítulo 05: lo que mide cada interactivo

La ampliación del 22 de octubre de 2026 explica los cuatro componentes de SLAM por grafos, la selección y comprobación de candidatos, la covarianza y el costo ponderado. `js/slam-proceso.js` añade dos modelos locales: el selector con un pasillo compatible, otro parecido, una pose reciente y una lejana; y una comparación por eventos de colas síncronas y omisiones asíncronas. Ambos tienen controles por pasos, reinicio, respaldo sin JavaScript y supuestos explícitos. No ejecutan SLAM Toolbox ni usan registros experimentales. El grafo permite variar el peso del cierre manteniendo las mediciones, con los mismos resultados iniciales por defecto.

Se distinguen PGM/YAML y sesión serializada, mapeo, localización, continuación y lifelong mapping, con enlaces por minutos a ROSCon 2019. La tabla de parámetros separa lo declarado en la guía de los valores que no se publicaron: no copia valores predeterminados al prototipo. AMCL se presenta como la opción del protocolo pendiente y se precisan las descripciones de GMapping y del marco map en todas las páginas relacionadas. El estado académico y las tablas originales se conservan. Detalle y aplicación del parche en [docs/mejoras-slam-20261022.md](docs/mejoras-slam-20261022.md).

El LiDAR tiene leyenda, escala de 1 m y un robot que no se confunde con un botón. La rejilla calcula el área libre y el índice de cobertura con la misma fórmula de los resultados. La cadena TF se dibuja en el marco map: al aplicar map → odom se mueve el origen de odom y la flecha de las ruedas conserva su largo. El ajuste de barridos muestra la curva del desacuerdo total, con mínimo en 30 cm frente a los 40 cm que estiman las ruedas. El grafo de poses informa el desacuerdo en cada paso: 0 sin cierre, 29,3 al añadirlo y 0,18 después de optimizar. El ejemplo de cobertura conserva la celda ocupada en ambas imágenes y permite agrandar el margen desconocido para ver que el índice baja mientras el área no cambia.

Los SVG en línea no llevan estilos propios, para que no afecten al resto de la página ni al tema oscuro. Los archivos exportados a `img/diagramas/` sí los incluyen.

El grafo de poses también arma el mapa que forman las observaciones. Cada pose guarda lo que vio el láser en su propio marco, sin error en este ejemplo, y el mapa se dibuja donde dice la pose estimada. Antes del cierre, la pared vista al inicio y al regreso queda a 17,7 cm de sí misma. Después de optimizar coinciden, pero el mapa mide 2,15 m de ancho frente a 2,10 m del recinto del ejemplo: un mapa coherente puede conservar un error de escala. Es un recinto ilustrativo y no reemplaza una medición del prototipo.

Control, navegación y mapeo tienen una ficha del concepto plegable, con qué es, para qué sirve, cómo funciona, dónde verlo, un ejemplo numérico, cómo se usa en el robot y sus límites.

Los dibujos de respaldo del capítulo 05 se regeneran con `node herramientas/diagramas_mapeo.js`. Se guardan en `img/diagramas/` y permiten leer el capítulo sin JavaScript. Los modelos del capítulo están aislados en `js/mapeo.js`; no ejecutan SLAM Toolbox ni Ceres y no reemplazan las mediciones originales.

## Publicar en GitHub Pages

En Settings, Pages, elige "Deploy from a branch", rama `main` y carpeta `/ (root)`. Cada commit en `main` se publica en uno o dos minutos.

```bash
python3 herramientas/indice.py
git add -A
git commit -m "Describe el cambio"
git push origin main
```

## Accesibilidad

Se comprueban tema oscuro, movimiento reducido, navegación por teclado y respaldos. El menú móvil limita el foco y aísla el fondo; el aviso académico y la navegación esencial funcionan sin JavaScript. Una tabla que no cabe en la pantalla se vuelve una región enfocable con nombre, para recorrerla con las flechas, y deja de serlo cuando vuelve a caber. Cada parte del arranque se inicia aislada: si una falla, las demás siguen. Las verificaciones automáticas y la revisión visual no son una certificación completa de WCAG 2.2 AA ni sustituyen pruebas con lectores de pantalla.

## Cómo citar

Valderas Neculqueo, S. (2026). *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* [Trabajo de titulación en revisión por comité; versión del documento pendiente de confirmación]. Universidad Tecnológica Metropolitana.

El formato BibTeX está en `recursos.html#citar`.

## Licencia

El código del sitio, es decir `js/`, `css/`, `herramientas/` y la estructura de las páginas HTML, usa la licencia MIT del archivo `LICENSE`. Los textos, diagramas, fotos, figuras propias y las tablas de `datos/ensayos/` usan CC BY 4.0, como detalla `LICENSE-contenido.md`. Las imágenes de productos de terceros quedan fuera de esa licencia y las tipografías de `fuentes/` se rigen por la licencia OFL. Titular: Sebastián Valderas Neculqueo, 2026.

## Créditos de imágenes

Las fotos del prototipo, el recinto y las figuras técnicas son del autor y provienen de la tesis. Las imágenes de productos de terceros, como el RPLidar A1, el router GL.iNet, el Husky A300 y el LoCoBot, son de sus fabricantes y se usan para identificar los equipos. El detalle está en `recursos.html#creditos`.

## Laboratorio de análisis local

Elige una de las siete tablas ya disponibles o abre un CSV propio desde `laboratorio.html`. Se leen en memoria: no se suben, se guardan ni se procesan con IA. El análisis valida las columnas y unidades, distingue datos declarados de cálculos derivados y muestra condiciones y límites de cada regla. Se puede exportar JSON con procedencia, opciones y una huella local del texto UTF-8.

Las tablas actuales no permiten reconstruir trayectorias, rejillas ni el establecimiento del escalón. Un formato temporal opcional puede analizar registros propios, sin atribuirlos al robot.

También lee mapas de ocupación PGM, con su YAML si existe. Cuenta celdas libres, ocupadas y desconocidas con los umbrales de la tesis o los del YAML, calcula áreas y el índice de cobertura en la imagen completa y en el rectángulo observado, y compara dos mapas celda a celda solo si comparten tamaño, resolución y origen. Un registro de estados de metas, con una fila por meta en cada mensaje de estado, se clasifica por identificador como en el Anexo 8.4: completadas, abortadas por reemplazo, abortadas sin clasificar, canceladas y sin estado final. Los botones de ejemplo usan archivos sintéticos de `datos/ejemplos/`, rotulados como tales. Consulta `docs/laboratorio.md`. No se instalan modelos de IA ni servicios de inferencia.

## Documentación y revisión

- `docs/auditoria-inicial.md` y `docs/auditoria-e876140.md`: hallazgos y funcionalidades conservadas en cada revisión.
- `docs/informe-tecnico.md`: cambios, pruebas, uso y entrega de la revisión más reciente. Los informes anteriores están en `docs/historial/`.
- `docs/informe-academico.md`: integridad del contenido y asuntos que requieren confirmación.
- `docs/decisiones.md`: razones de arquitectura y límites de la evolución.
- `docs/trazabilidad.csv`, `docs/observaciones-comite.csv`, `docs/inventario-publicacion.csv`: fuentes, plantilla de observaciones reales y autorización de material.

`.github/workflows/verificar.yml` comprueba modelos, datos generados, enlaces y navegador al abrir un PR o actualizar main. Su ejecución hospedada depende de habilitar Actions; no se ejecutó en GitHub durante esta entrega. Las dependencias de pruebas solo son para desarrollo. No se agregaron dependencias al sitio ni se publicó automáticamente la rama de trabajo.

Para aplicar el parche, parte de la revisión base indicada en el informe, crea una rama independiente y ejecuta `git am tesis_explain.patch`. Revisa el PR y el resultado antes de incorporar cambios a main; el ZIP contiene todos los archivos versionados y carece de historia Git y dependencias temporales.
