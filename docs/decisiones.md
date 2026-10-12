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

La generación se ejecuta durante edición, no al visitar el sitio. No elimina contenido estático ni exige Node/Python a los visitantes. Se conservaron las tipografías y referencias existentes. Los módulos del laboratorio solo se cargan en su página; no se cargan en los capítulos.

No se movieron todos los modelos de mapeo o simulaciones a una nueva estructura: el aislamiento actual ya permite probar su geometría. Una separación más amplia puede hacerse después de tener una razón y pruebas de regresión, sin cambiar simultáneamente el significado científico.
