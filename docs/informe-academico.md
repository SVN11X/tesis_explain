# Informe académico y pendientes

La tesis está **en revisión por comité**, según la instrucción del autor para esta entrega. No se presenta como aprobada ni se publica el documento inédito. Base del sitio: `166d70e3f4d2b8e61daea9b1999fad859c28169b`. Esta auditoría se basa en la guía y sus tablas públicas; no se dispuso de la versión completa de la tesis para contrastar sus citas.

## Material conservado

Se conservaron los bytes de los siete CSV, imágenes, videos, fuentes y ambas licencias. No cambiaron resultados, ecuaciones del controlador, geometría experimental, conclusiones sobre objetivos ni resultados de navegación. Los nuevos controles de deriva pertenecen a un grafo sintético rotulado, no a un experimento ni a Ceres. El laboratorio produce cálculos derivados identificables, sin sustituir cifras de las tablas.

La actualización de plataforma del 12 de octubre de 2026 no se usa como fecha del documento o de los datos. Versión del documento, fecha y revisión de datos quedan nulas en `datos/academico.json`.

Las respuestas de práctica se redactaron en forma impersonal. Conservan la referencia que ya cita la guía, sin atribuir nuevas decisiones al investigador. Tres huecos existentes permanecen sin completar y ahora se ven como pendientes. Se señala también que los motivos de elegir la pila, conservar la ley o priorizar SLAM requieren contrastar su respaldo con el autor. Esto no declara falsas las explicaciones existentes.

## Confirmaciones necesarias

Tabla de la primera auditoría. La sección «Revisión sobre b922205» indica cuáles resolvió la versión de octubre de 2026.

| Asunto | Evidencia disponible | Confirmación requerida |
|---|---|---|
| Versión académica y procedencia | Referencias por sección, tabla y figura; sin documento público | Identificador y fecha de la versión que revisa el comité; versión o fecha de cada conjunto de datos |
| Medida del giro real | Tabla A6.4 y pregunta con comentario PENDIENTE AUTOR | Instrumento, procedimiento y resolución angular; no completar por conjetura |
| Referencia de 0,13 m/s | Coincide con límite lineal y ensayo de recta según la guía | Motivo documentado de elegirla; coincidencia no demuestra motivo |
| Frontera mínima de 0,05 m | Valor citado de Tabla A5.4 | Razón y efecto medido; no se cuantificó el efecto en el recorrido |
| Motivos de diseño | Explicaciones existentes de versiones, firmware y SLAM | Separar decisión documentada de consideración técnica posterior |
| Cierre de lazo real | Configuración habilitada; ocurrencia no determinada en análisis posterior | Registro por eventos si existe y está autorizado; el ejemplo interactivo no es evidencia del robot |
| Corrida excluida | Datos resumidos y explicación de fallo; sin mapa guardado | Causa sin determinar; no atribuirla automáticamente al verificador de progreso o a deslizamiento |
| Navegación | 60 metas, 54 abortadas, 53 reemplazos, 1 completada y 5 sin terminal en CSV | Abortada restante sin clasificar; no calcular tasa de éxito de metas fijas ni declarar falla sin registro |
| Cobertura | Porcentaje sobre imagen y área libre; no hay superficie física externa | No afirmar porcentaje del recinto ni exactitud absoluta del mapa |
| Control | Tabla de escalón resumida y resolución limitada | No afirmar 0 % de sobreimpulso ni establecimiento al 2 % sin señal adecuada |

El error porcentual de recta declarado usa valores anteriores al redondeo de distancias. Los nuevos recálculos pueden diferir: se muestran por separado, no se modifica la tabla para forzar coincidencia. Las respuestas que infieren movimiento a partir de mapa creciente deben conservar su carácter de inferencia y contrastarse con evidencia externa si se propone validación cuantitativa.

## Revisión sobre e876140

Esta revisión contrastó las siete tablas de `datos/ensayos/` y los parámetros de `datos/parametros.json` con una copia del documento facilitada por el autor. Coinciden valor por valor. El documento sigue inédito y en revisión, por eso el detalle del contraste se entregó al autor por separado y no se publica aquí.

Contenido que no se alteró: tablas experimentales, cifras de resultados, ecuaciones del controlador, conclusiones sobre los objetivos y resultados de navegación. Las respuestas pendientes de Preguntas difíciles siguen sin completar.

Dos frases se corrigieron porque contradecían o simplificaban el Anexo 7. En `mapeo.html` el sitio decía que el robot recorrió el recinto en seis ejecuciones, pero en la iteración 2 no se desplazó. En `exploracion.html` el motivo de exclusión de esa iteración ahora incluye que su mapa no quedó guardado. Ambas quedan en el historial de `recursos.html#estado-academico`.

Material nuevo y su carácter:

| Elemento | Carácter | Fuente o límite |
|---|---|---|
| Lecturas por regla del simulador PID | Ilustrativo | Modelo de primer orden con K y τ del orden de la Tabla A4.4. No es el firmware ni una medición. |
| Mapa armado en el grafo de poses | Ilustrativo | Recinto inventado de 2,10 m de ancho y láser sin error. No representa corridas ni a Ceres. |
| Fichas del concepto | Resumen de la guía | Cada afirmación ya estaba en el tema o cita su sección de la tesis. |
| Umbrales del PGM y parámetros del explorador | Parámetros transcritos | Anexo 8.1 y Tabla A5.4, sujetos a la revisión del comité. |
| Clasificación de registros de metas | Procedimiento reimplementado | Sigue la descripción del Anexo 8.4. El script del autor no está publicado. |
| Ejemplos de `datos/ejemplos/` | Sintéticos | No son datos del robot ni de la tesis. |

Asuntos que siguen requiriendo confirmación del autor: versión del documento y fecha de los datos, método de medida del giro físico, motivo de la referencia de 0,13 m/s, motivo del tamaño mínimo de frontera y autorización para publicar mapas, registros de estados y firmware. Si se autorizan mapas PGM o registros de estados, el laboratorio puede analizarlos sin cambios, pero deben publicarse en una carpeta propia con versión, fecha y procedencia.

## Revisión sobre b922205

Esta revisión contrastó el sitio con la versión de octubre de 2026 del documento, de 152 páginas, facilitada por el autor. Las siete tablas de `datos/ensayos/` coinciden valor por valor con ella. Las frases que habían quedado atrás y su corrección están en `auditoria-b922205.md`.

Ninguna cifra experimental cambió. Sí cambió la forma de leer cuatro resultados, y el sitio sigue la redacción de la tesis:

1. Los 53 abortos se presentan como asociados a reemplazos por un criterio temporal. Esa coexistencia no identifica la causa de cada aborto ni descarta fallas de Nav2 al mismo tiempo. La mediana de 3,3 s es entre aceptaciones sucesivas y es compatible con el período del explorador, no una prueba.
2. La exactitud de los mapas ya tiene una referencia externa, un plano medido con huincha. La comparación no incluye la incertidumbre de la huincha ni la del alineamiento, y el sitio no la presenta como exactitud global.
3. La estabilidad del lazo de velocidad se verificó sobre un modelo lineal. Ese análisis no incluye la saturación, la banda sin corrección, la zona muerta ni los truncamientos enteros, y el desempeño sigue medido en un solo punto de operación.
4. Las medias de cinco repeticiones llevan su intervalo de confianza, y la proporción de exploraciones válidas el de Clopper y Pearson. La tesis considera muy bajo el número de ensayos y propone de 6 a 10 repeticiones válidas por ensayo.

La versión de octubre resolvió estos pendientes: la versión del documento, la fecha de los datos de exploración y mapeo, el motivo de la referencia de 0,13 m/s y los motivos de fijar la combinación de versiones de ROS 2, de conservar la ley del firmware y del lugar de Trejos en la elección de SLAM. Las respuestas correspondientes de `preguntas.html` citan ahora la sección que las sostiene.

Siguen pendientes el método de medida del giro físico, el motivo del tamaño mínimo de frontera y la autorización para publicar firmware, registros y programas propios. También conviene que el autor confirme que la geometría del recinto de ensayo, transcrita de la Fig. A8.1, puede quedar pública, como indica `inventario-publicacion.csv`. La tesis no fecha los demás ensayos, y `revision_datos` sigue vacío en `datos/academico.json`.

Material nuevo y su carácter:

| Elemento | Carácter | Fuente o límite |
|---|---|---|
| Tablas de `datos/analisis/` | Transcritas | Tablas A4.5, A8.2, A8.3 y A8.4. No se recalculan con datos crudos, que no están publicados. |
| Modelo de estabilidad | Reimplementación de la guía | Reproduce la Tabla A4.5 y el barrido del Anexo 4.12. Fuera de esos casos, el interactivo rotula sus cifras como cálculo con el mismo modelo. Es un modelo lineal, no el firmware. |
| Plano del recinto | Esquema transcrito | Fig. A8.1 y Tabla A8.3. El tabique cuyo largo no se midió se dibuja aproximado. |
| Intervalos y proyección | Cálculo de la guía con datos de la tesis | Reproduce la Tabla A8.4. La proyección supone la misma media y la misma dispersión, y un ensayo nuevo puede cambiarlas. |
| Preguntas nuevas | Respuestas redactadas para la guía | Cada una cita la sección que la sostiene. No representan palabras del autor. |

## Mantenimiento fuera del código

1. Mantener el documento privado con versión identificable y registro de cambios. Conservar una copia del documento que sustenta cada release del sitio sin convertirla automáticamente en pública.
2. Registrar las observaciones reales del comité en `docs/observaciones-comite.csv`. Está vacío a propósito: no representa observaciones recibidas. Incluir texto literal, sección, decisión, evidencia y responsable.
3. Actualizar `docs/trazabilidad.csv` al cambiar resultados, figuras o parámetros. Vincular cada cálculo con tabla, versión y permiso, incluidos respaldos HTML y pruebas.
4. Completar `docs/inventario-publicacion.csv` con las autorizaciones reales. No equiparar un enlace a un proyecto base con autorización de publicar firmware adaptado, registros de interiores o documentos inéditos.
5. Después de cada revisión: confirmar datos, editar fuente y HTML relacionado, regenerar datos e índice, ejecutar pruebas y revisar la comparación Git. La revisión por comité no autoriza cambiar conclusiones automáticamente.
6. Antes de una versión aprobada, confirmar explícitamente el nuevo estado y sus evidencias; actualizar metadatos, citas, cambios y trazabilidad. No usar un cambio de estado del sitio como acta de aprobación.

## Comparaciones futuras propuestas, no ejecutadas

Proponer al comité un protocolo de metas fijas con referencia geométrica externa, conservación de estados por identificador y tiempos. Registrar pose verdadera de simulación y comparar la misma variable en ambos entornos. Evaluar más referencias de velocidad, resolución de medida, memoria y saturación antes de extender a todo el rango de operación lo que el análisis lineal dice sobre la estabilidad. Comparar mapas bajo marcos, resolución y región de interés compatibles. Valorar la calibración bidireccional con ensayo independiente de la muestra usada para obtener el factor.

Estas propuestas no son nuevos resultados ni compromisos aprobados. Publicación de firmware, rosbag, planos de interiores, videos nuevos o tesis requiere autorización del propietario y condiciones institucionales. Las licencias MIT y CC BY 4.0 existentes se mantienen: corresponde al autor confirmar que dispone de los permisos de cada pieza; no se cambia el régimen de contenido provisional sin autorización.
