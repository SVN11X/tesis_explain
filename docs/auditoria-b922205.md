# Auditoría de la revisión b922205

Base: `b9222051979bb092dbc16f850ac1e7e4169b212e`, rama remota `main`, recuperada el 23 de octubre de 2026. Rama local de trabajo: `actualiza/tesis-20261023`. La base ya incluía la entrega sobre e876140, auditada en `auditoria-e876140.md`, y las explicaciones de SLAM del 22 de octubre, descritas en `mejoras-slam-20261022.md`.

Referencia académica: la versión de octubre de 2026 del documento, de 152 páginas, facilitada por el autor. El sitio se había escrito sobre una versión anterior. Esta auditoría compara ambas.

## Estado de partida

Se ejecutaron todas las verificaciones documentadas antes de editar:

| Verificación | Resultado en la base |
|---|---:|
| `node herramientas/pruebas_unitarias.js` | 40 correctas |
| `node herramientas/pruebas_control.js` | 21 correctas |
| `node herramientas/pruebas_mapeo.js` | 28 correctas |
| `node herramientas/pruebas_slam_proceso.js` | 10 correctas |
| `node herramientas/pruebas_movimiento.js` | 23 correctas |
| `node herramientas/pruebas_analisis.js` | 57 correctas |
| `python3 herramientas/verificar_sitio.py` | 1 489 correctas |
| `python3 herramientas/pruebas_control_navegador.py` | 320 correctas |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 256 correctas |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 correctas |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 195 correctas |
| `python3 herramientas/pruebas_robustez_navegador.py` | 71 correctas |
| `python3 herramientas/pruebas_navegador.py` | 479 correctas |

Todas pasan. Estas pruebas comprueban que el sitio funciona y que sus cifras coinciden con sus propias tablas, pero no pueden detectar un texto que quedó atrás frente a una versión nueva del documento. Para eso se leyó completa la versión de octubre y se contrastó con ella cada tema del sitio. Además se midió, en un teléfono de 390 px, el ancho con que se dibuja cada gráfico.

## Hallazgos

| Clase | Ubicación | Evidencia | Gravedad | Acción |
|---|---|---|---|---|
| Información académica | `index.html`, `problema.html`, `exploracion.html`, `navegacion.html`, `lecciones.html`, `resultados.html`, `laboratorio.html`, `preguntas.html` | Se afirmaba que 53 de 54 abortos «fueron reemplazos hechos por el propio explorador», no fallas. La versión de octubre dice que cumplen un criterio temporal: la meta siguiente ya figura mientras la abortada sigue aceptada o en ejecución. Esa coexistencia no identifica la causa de cada aborto ni descarta fallas de Nav2 al mismo tiempo | Alta | Redacción como asociación temporal, con su límite, en todas las páginas |
| Información académica | `exploracion.html`, Tabla A7.1 y tarjetas, `js/vis1.js` | La columna «Tiempo activo mediano» y la frase «Una falla de navegación no tendría por qué durar siempre lo mismo» usaban la mediana como prueba. En la tesis es la mediana entre aceptaciones sucesivas, compatible con el período del explorador, con máximos de 16,7 s y 6,7 s | Media | Columna renombrada, máximos en la leyenda y lectura como compatibilidad, no como prueba |
| Información académica | `mapeo.html`, `resultados.html` | Decían que no se midió el error absoluto del mapa porque no hubo un plano del recinto. La versión de octubre compara los cinco mapas válidos con un plano medido con huincha: 3,4 cm de distancia media y 8,4 cm de percentil 95 | Alta | Nueva sección `mapeo.html#exactitud` con el plano, las once distancias y su lectura. Frases corregidas y paso 6 de `replicar.html` ampliado |
| Información académica | `resultados.html`, limitación del control | «Ley heredada sin análisis de estabilidad». La versión de octubre analiza el lazo discreto con el modelo de cada rueda: polos, márgenes, sensibilidad máxima y un barrido de ganancias (Anexo 4.12 y Tabla A4.5) | Alta | Nueva sección `control.html#estabilidad` con interactivo y con los límites del modelo lineal |
| Información académica | `navegacion.html`, `replicar.html`, `js/vis1.js` | El protocolo de metas fijas se describía con un mapa guardado y AMCL activo. La versión de octubre pide metas definidas, referencias físicas medidas, una localización coherente en el marco del mapa, por SLAM o por AMCL, y un registro independiente de la pose final. También precisa el script preparado: tres escenarios por cinco repeticiones y una tolerancia impresa de 0,22 m frente a los 0,10 m configurados | Media | Requisitos y estado del script según la Sección 5.4 y el Anexo 8.4, con el tamaño de muestra |
| Información académica | `movimiento.html`, `resultados.html`, `replicar.html` | Las medias de cinco repeticiones se daban sin intervalo y la proporción de exploraciones válidas sin su incertidumbre. La versión de octubre agrega intervalos t de Student, el de Clopper y Pearson y una prueba binomial (Anexo 8.6) | Media | Nueva sección `resultados.html#confianza` con interactivo, e intervalos junto a cada media |
| Información académica | `control.html`, PSO y Tabla A4.4 | El Kd del PSO se mostraba solo como 34,69 y 36,70. La tesis precisa que el costo los evaluó recortados a 25 y que el retardo ajustado se cuantiza a cero muestras con la captura de 0,1 s. Las razones para conservar la ley mezclaban motivos de la guía con criterios propios del sitio, y la Sección 4.4.3 ahora da tres | Media | Fila del Kd evaluado, tres razones por las que hubo que ajustar y las tres razones de la tesis para conservar la ley |
| Información académica | `recursos.html`, `datos/academico.json` | Versión del documento y fecha de los datos pendientes, cita con versión pendiente, resumen en inglés y 57 referencias de la versión anterior | Media | Versión de octubre de 2026, fecha del Anexo 7, resumen actual y 72 referencias |
| Información académica | `preguntas.html` | Cuatro respuestas marcadas como pendientes, sobre Foxy, conservar la ley, la referencia de 0,13 m/s y Trejos, ya tienen respaldo en la versión de octubre | Media | Respuestas completadas con la sección que las sostiene |
| Error reproducido | `js/sitio.js`, montaje de interactivos | En un teléfono de 390 px, 14 gráficos de 12 interactivos de Control, Movimiento y Exploración leían un ancho de cero al dibujarse. Quedaban a 600 px, reducidos a 332 px, con el texto a un 55 % de su tamaño | Media | El interactivo se marca como montado antes de dibujarse. En la entrega ninguno queda reducido |
| Mejora recomendada | `preguntas.html` | 54 preguntas en 10 temas, sin estabilidad, exactitud del mapa, alcance estadístico, fuentes citadas ni relación entre documento y código | Alta | 52 preguntas nuevas y 5 temas nuevos, 106 en total |
| Funcionalidad que conservar | Todo el sitio | 179 pruebas numéricas, 1 535 comprobaciones de navegador y 1 489 estáticas correctas | No aplica | Conservar modelos, controles, datos y pruebas |
| Información académica pendiente | `datos/academico.json` | Método de medida del giro físico, motivo del tamaño mínimo de frontera y autorización de material | No aplica | Siguen enlazados desde Recursos |

## Contraste con el documento

Las siete tablas de `datos/ensayos/` se contrastaron con las Tablas 5.3, 5.4, A6.1 a A6.4 y A7.1 de la versión de octubre. Coinciden valor por valor. En `metas.csv` cambió el nombre que la tesis da a dos columnas, pero no sus valores. Los encabezados del CSV se conservan por compatibilidad y su significado actual queda escrito en `datos/ensayos/README.md` y en `docs/laboratorio.md`.

Las cuatro tablas nuevas de `datos/analisis/` se transcribieron de las Tablas A4.5, A8.2, A8.3 y A8.4. Las pruebas de Node recalculan la Tabla A4.5 con un modelo propio de la guía y la Tabla A8.4 con los valores por repetición, con el redondeo de la tesis. La geometría del plano se tomó de la Fig. A8.1.

El contraste del texto fue manual, tema por tema, y no una comparación automática de todo el documento. Como el documento sigue inédito y en revisión, el sitio cita secciones, tablas y figuras sin reproducir su texto.

## Preservación

No cambiaron los valores de los CSV de ensayos, las imágenes y videos existentes, las tipografías ni las licencias. El historial de `recursos.html#estado-academico` resume esta actualización. Las preguntas anteriores conservan su identificador, para no romper enlaces externos.
