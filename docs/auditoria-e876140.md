# Auditoría de la revisión e876140

Base: `e876140d3e9a31041289536dede50bc2d12e450e`, rama remota `main`, recuperada el 12 de octubre de 2026. Rama local de trabajo: `mejora/evolucion-2026-10-12`. Esta revisión ya incluía el estado académico, el laboratorio, la trazabilidad y el flujo de verificación de la entrega anterior, cuya auditoría está en `auditoria-inicial.md`.

## Estado de partida

Se ejecutaron todas las verificaciones documentadas antes de editar:

| Verificación | Resultado en la base |
|---|---:|
| `node herramientas/pruebas_unitarias.js` | 40 correctas |
| `node herramientas/pruebas_control.js` | 18 correctas |
| `node herramientas/pruebas_mapeo.js` | 24 correctas |
| `node herramientas/pruebas_movimiento.js` | 23 correctas |
| `node herramientas/pruebas_analisis.js` | 43 correctas |
| `python3 herramientas/verificar_sitio.py` | 1 432 correctas |
| `python3 herramientas/pruebas_control_navegador.py` | 320 correctas |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 186 correctas |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 correctas |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 155 correctas |
| `python3 herramientas/pruebas_navegador.py` | 479 correctas |

Las pruebas existentes no cubrían un módulo de datos ausente, un navegador sin `MediaQueryList.addEventListener` ni la accesibilidad automática de todas las páginas. Para eso se ejecutaron fallos inducidos en Chromium y axe-core en las 16 páginas, con todos los interactivos montados, en escritorio claro, escritorio oscuro y teléfono de 390 px.

## Hallazgos

| Clase | Ubicación | Evidencia | Gravedad | Acción |
|---|---|---|---|---|
| Error reproducido | `js/sitio.js`, primera línea de datos | Con `datos/proyecto.js` bloqueado, `index.html` y `control.html` quedan sin cabecera, sin pie y sin ningún interactivo montado: «Cannot read properties of undefined (reading 'academico')» | Alta | Valores de respaldo para el estado académico y arranque aislado por partes |
| Error reproducido | `js/control-modelo.js`, `js/movimiento-modelo.js` | Sin `datos/proyecto.js` lanzan una excepción al cargar | Media | No definir el módulo si faltan sus datos; cada interactivo conserva su respaldo y su botón de reintento |
| Error reproducido | `js/sitio.js`, `etapas()`; `js/vis1.js`, A estrella | Con un `matchMedia` como el de Safari anterior a 14, sin `addEventListener`, `mapeo.html` monta 0 de 7 interactivos y A estrella cae a su respaldo | Media | Usar `addListener` cuando `addEventListener` no existe, como ya hacía otra parte del sitio |
| Error reproducido | `js/vis2.js`, resolución de la referencia | axe `aria-prohibited-attr`, grave: `aria-label` en un `div` sin rol | Media | `role="img"` en la cuadrícula de ticks |
| Deficiencia demostrable | `.tabla-env` en 11 páginas | axe `scrollable-region-focusable`, grave, 18 casos a 390 px: una tabla que no cabe no se puede desplazar con teclado | Media | Región enfocable con nombre solo mientras desborda, recalculada al cambiar el ancho |
| Deficiencia demostrable | Aviso académico, todas las páginas | Mide 131 px de alto en un teléfono de 390 px y repite «en revisión por comité» | Baja | Una línea corrida en móvil, 71 px, y nota sin repetición |
| Deficiencia demostrable | Siete interactivos | Su respaldo sin JavaScript decía solo «Necesita JavaScript»: PID, enjambre, ciclo del firmware, inflación, DWB y exploración en dos páginas | Media | Respaldo con la idea, las cifras y, en el PID, una figura generada con el mismo modelo |
| Deficiencia demostrable | `recursos.html#estado-academico` | Fecha y pendientes escritos a mano, duplicando `datos/academico.json`; el historial no se veía | Baja | Bloque generado por `herramientas/datos.py`, con pendientes enlazados e historial |
| Información académica | `mapeo.html`, resumen | «El robot recorrió el mismo recinto en seis ejecuciones», pero según el Anexo 7 en la iteración 2 no se desplazó | Baja | Redacción corregida: seis ejecuciones en el mismo recinto, cinco con mapa válido |
| Información académica | `exploracion.html`, tabla de metas | «Se excluyó porque el robot no se movió» simplifica el motivo del Anexo 7 | Baja | «El robot no se desplazó y su mapa no quedó guardado» |
| Mejora recomendada | `control.html#sim-pid` | Las lecturas mostraban números sin explicar qué regla los interpreta | Media | Lecturas por regla con condición y cálculo, probadas en Node |
| Mejora recomendada | `mapeo.html#sim-lazo` | El grafo mostraba poses, pero no cómo cambia el mapa al optimizar ni por qué un mapa coherente puede tener error métrico | Media | Mapa armado con las observaciones de cada pose, con tres lecturas comprobables |
| Mejora recomendada | Laboratorio | No había formato para rejillas ni para estados por meta | Media | Lectura de PGM y YAML, comparación compatible, clasificación de metas según el Anexo 8.4 |
| Mejora recomendada | Control, navegación y mapeo | Conceptos difíciles sin una progresión resumida | Baja | Fichas plegables de siete pasos en tres conceptos |
| Mejora recomendada | `herramientas/pruebas_navegador.py` | El registro de pruebas mostraba trazas de `BrokenPipeError` del servidor local | Baja | El servidor de prueba ignora cortes de conexión del navegador |
| Funcionalidad que conservar | Todo el sitio | 148 pruebas numéricas, 1 354 comprobaciones de navegador y 1 432 estáticas correctas | — | Conservar modelos, controles, textos, datos y pruebas |
| Información académica pendiente | `datos/academico.json` | Versión del documento, fecha de datos, método angular, motivos de 0,13 m/s y de la frontera mínima, autorización de material | — | Sin completar; ahora enlazados desde Recursos |

## Contraste con el documento

Las siete tablas de `datos/ensayos/` y los parámetros de `datos/parametros.json` se contrastaron con una copia del documento facilitada por el autor. Coinciden valor por valor. También se revisaron a mano las cifras con unidad de once temas, en su contexto. No se encontraron otras diferencias aparte de las dos redacciones de la tabla anterior. Fue una revisión manual, no una comparación automática de todo el texto. El detalle del contraste se entregó al autor por separado, porque el documento sigue inédito y en revisión.

## Preservación

No cambiaron los CSV de ensayos, las imágenes existentes, los videos, las tipografías ni las licencias. Los nuevos archivos de `datos/ejemplos/` son sintéticos y se rotulan así en su nombre, su carpeta, su README y la pantalla.
