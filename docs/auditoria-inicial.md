# Auditoría de la base

Base: `166d70e3f4d2b8e61daea9b1999fad859c28169b`, rama remota `main`, recuperada el 12 de octubre de 2026. Rama local de trabajo: `mejora/auditoria-laboratorio-2026-10-12`.

Se inventariaron las 15 páginas, 11 módulos JavaScript, 4 hojas de estilo, 7 tablas CSV, figuras, tipografías, licencias y herramientas. El sitio no requiere compilación; el README indica Pages desde la raíz de `main`. No hay workflow ni instrucciones AGENTS.md en la base. La configuración efectiva de Settings no es accesible desde la copia Git. El sitio público respondió HTTP 200.

Antes de editar: 40 pruebas unitarias, 18 de control, 21 de mapeo y 23 de movimiento correctas (102). Las pruebas de navegador se ejecutan por separado; los registros de la entrega distinguen sus resultados de esta comprobación numérica.

| Clase | Ubicación | Evidencia | Gravedad | Acción |
|---|---|---|---|---|
| Funcionalidad que conservar | control.html; js/control-modelo.js; js/vis2.js | Ley heredada, truncamiento, 33 ms, FOPDT y comparaciones con pruebas numéricas correctas | — | Conservar modelo y controles, añadir ayudas reutilizables |
| Funcionalidad que conservar | mapeo.html; js/mapeo.js | Siete objetos, composición SE(2), oclusión, grafo y cobertura con pruebas correctas | — | Conservar geometría, mejorar recorrido y recuperación |
| Funcionalidad que conservar | movimiento.html; js/movimiento-modelo.js | Cinemática y calibración hipotética claramente separadas, 23 pruebas correctas | — | Conservar y centralizar las tablas repetidas |
| Deficiencia demostrable | todas las páginas; js/sitio.js: metadatos y pie | No existe aviso común del estado en comité; versión de tesis vacía | Alta | Metadatos explícitos con campos desconocidos nulos y aviso estático |
| Deficiencia demostrable | preguntas.html: cuerpos de respuestas | «Elegí», «mi firmware», «Lo probé», «No medí» atribuyen una voz al investigador | Alta | Redacción impersonal, respaldo en la guía y pendientes visibles |
| Información académica pendiente | preguntas.html: tres comentarios PENDIENTE AUTOR | Método de medida angular, motivo de 0,13 m/s y tamaño mínimo de frontera sin confirmar | Alta | Conservar placeholders y señalar el pendiente sin completarlo |
| Error reproducible por fallo inducido | js/sitio.js: montar | catch reemplaza todo innerHTML por un mensaje y destruye la explicación original | Media | Restaurar respaldo y ofrecer reintento |
| Deficiencia demostrable | js/sitio.js: cajón móvil | role=dialog/aria-modal sin aislamiento ni recorrido circular de foco | Media | inert, foco limitado, Escape y restauración |
| Deficiencia demostrable | js/sitio.js: alDestino y destacarHash | decodeURIComponent sin guardia ante ancla malformada | Media | Reutilizar destinoDe, que ya maneja este caso |
| Deficiencia demostrable | js/sitio.js: etapas; js/vis1.js: A estrella | Secuencia temporal y A estrella no se detienen al ocultar la pestaña | Media | Pausa explícita y conservación de etapa |
| Deficiencia demostrable | js/sitio.js: buscador | Un error de carga deja un mensaje sin botón de reintento ni anuncio de estado | Media | Ofrecer reintento, liberar el estado de carga y anunciar el fallo |
| Deficiencia demostrable | datos/ensayos/; js/movimiento-modelo.js; js/vis1.js | Tablas CSV repetidas como arrays JavaScript | Media | Generar un módulo local desde CSV y parámetros documentados |
| Mejora recomendada | laboratorio nuevo | Tablas resumidas disponibles, sin registros crudos | Media | Análisis determinista, validación de esquemas y límites explícitos |
| Mejora recomendada | herramientas; .github/workflows | Sin verificaciones automáticas en PR | Media | Workflow de pruebas, índice, datos y navegador |
| Información académica pendiente | gemelo.html#criterios | «Cómo se aprobó el gemelo» describe verificación del modelo, no aprobación de la tesis | Baja | Aclarar el vocabulario preservando el ancla |
| Información académica pendiente | datos/ensayos/README.md | Documento de referencia, fechas de datos y registros crudos no disponibles | Alta | No afirmar contrastación con tesis completa ni publicar archivos nuevos |

Las cifras de la base son el material disponible para la auditoría; no se certifica su exactitud respecto de un documento inédito. Se conservan bytes de CSV, imágenes y licencias y se comparan al finalizar. Las nuevas interpretaciones son reglas limitadas con fórmula, condición y fuente, no nuevos resultados experimentales.
