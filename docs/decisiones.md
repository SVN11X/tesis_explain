# Decisiones de plataforma

| Decisión | Motivo y alcance |
|---|---|
| Conservar HTML/CSS/JS nativos | El sitio ya pasa pruebas y Pages sirve archivos estáticos. No se justifica una reescritura ni un framework nuevo. |
| Conservar modelos existentes | Las 102 pruebas numéricas de la base pasan; las diferencias de la ley heredada ya están explicitadas. |
| Datos en JSON/CSV y módulo generado local | Evita repetir parámetros entre modelos y tablas. JSON/CSV son las fuentes editables; el módulo permite cargar sin una carrera de fetch. |
| Aviso académico estático generado | Debe estar disponible sin JavaScript; desconocidos nulos, fecha de plataforma distinta de versión académica. |
| Ayudas progresivas junto a los objetos | Mantiene controles ya útiles y facilita explorar una causa por vez, con límites y restablecimiento. |
| CSV estricto antes de interpretar | Unidades en encabezados, números finitos, filas compatibles, validación de conteos y faltantes. No se adivinan formatos. |
| Gráficos SVG y tabla completa exportable | Sin librerías remotas. Tabla accesible y signos/trazos además de color. Vista acotada para rendimiento. |
| Motor independiente del DOM | Se prueban métricas y reglas en Node; una futura extensión local es opcional y no altera cálculos documentados. |
| Sin inferencia en esta versión | Los datos actuales permiten estadísticas y reglas. No se instala IA para explicar lo que puede calcularse directamente. |
| ZIP y parche con Git local | Entrega revisable, reversible y verificada contra la base; ningún push a main ni publicación automática. |
| Arranque aislado por partes | Un fallo en una parte, por ejemplo un módulo de datos ausente o una API antigua del navegador, ya no impide montar la cabecera, el pie ni los interactivos. Los módulos de modelo no se definen si faltan sus datos y cada interactivo conserva su respaldo. |
| Lecturas por regla en el modelo, no en la vista | `lecturaPID` vive en `js/control-modelo.js`, junto al simulador, para probar en Node que cada frase coincide con el cálculo que la respalda. |
| Mapa armado con observaciones exactas | El grafo de ejemplo aísla el efecto de la pose sobre el mapa. Añadir ruido de láser mezclaría dos causas y haría menos legible la lección sobre el error de escala. |
| Módulo de mapas separado | `js/analisis-mapa.js` trabaja con bytes y no con CSV. Separarlo mantiene `analisis-modelo.js` acotado y permite cargarlo solo en el laboratorio. |
| Comparación de mapas sin alineación automática | Alinear o rotar mapas cambiaría lo que se mide y podría ocultar diferencias. Solo se compara celda a celda con tamaño, resolución y origen comunes. |
| Ejemplos sintéticos rotulados | Permiten probar formatos sin publicar registros del prototipo. Su nombre, su carpeta, su README y la procedencia en pantalla dicen que son sintéticos. |
| Fichas del concepto plegables | La progresión qué es, para qué sirve, cómo funciona, dónde verlo, ejemplo, robot y límites se aplicó a tres conceptos difíciles, sin reorganizar los temas ni repetir la estructura en todas las secciones. |
| Estado académico generado | Pendientes e historial salen de `datos/academico.json` hacia HTML estático, para que no diverjan de los metadatos y se lean sin JavaScript. |

La generación se ejecuta durante edición, no al visitar el sitio. No elimina contenido estático ni exige Node/Python a los visitantes. Se conservaron las tipografías y referencias existentes. Los módulos del laboratorio solo se cargan en su página; no se cargan en los capítulos.

No se movieron todos los modelos de mapeo o simulaciones a una nueva estructura: el aislamiento actual ya permite probar su geometría. Una separación más amplia puede hacerse después de tener una razón y pruebas de regresión, sin cambiar simultáneamente el significado científico.
