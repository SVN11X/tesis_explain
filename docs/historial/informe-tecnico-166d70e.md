# Informe técnico de la entrega sobre 166d70e

La plataforma incorpora análisis local verificable, más posibilidades de explorar el grafo de poses, mejoras de accesibilidad y un estado académico explícito. Conserva las mediciones, el controlador particular y los recursos de la guía; la tesis sigue en revisión por comité.

Base: `166d70e3f4d2b8e61daea9b1999fad859c28169b` de `main`. Rama local: `mejora/auditoria-laboratorio-2026-10-12`. Fecha de actualización de plataforma: 12 de octubre de 2026. El HTML de la portada publicada coincidió byte por byte con la portada de esa base. La entrega no modifica el remoto ni publica cambios en main.

## Cambios

| Área | Archivos | Resultado |
|---|---|---|
| Estado académico | 16 páginas HTML; datos/academico.json; herramientas/datos.py; js/sitio.js | Aviso estático en revisión por comité; fecha de plataforma separada; documento y fecha de datos desconocidos permanecen nulos |
| Datos compartidos | datos/parametros.json; datos/proyecto.js; datos/README.md; js/control-modelo.js; js/movimiento-modelo.js; js/vis1.js | Parámetros existentes y tablas CSV se centralizan; generación sin dependencias; modelos siguen dando sus resultados originales |
| Control | control.html; js/vis2.js | Guías progresivas y restablecimiento completo del ejemplo de contribuciones, conservando ley heredada, enteros, bandas y simulaciones |
| SLAM | mapeo.html; js/mapeo.js | Deriva de escala y giro ajustables en grafo sintético; recalcula poses y costo, reinicia etapa al cambiar causa y restaura parámetros/selección |
| Movimiento | movimiento.html | Ayuda para separar sesgo, dispersión y corrección hipotética; no se afirma calibración efectuada |
| Preguntas | preguntas.html; js/preguntas.js; css/preguntas.css | 54 preguntas preservadas, redacción impersonal, seis respuestas con confirmación pendiente y filtro de respaldo; modo práctica conservado |
| Navegación y recuperación | js/sitio.js; js/vis1.js; css/estilo.css | Foco e aislamiento del menú, Escape y restauración; pausas al ocultar pestaña; anclas malformadas protegidas; respaldo de interactivos conservado y reintento |
| Accesibilidad | index.html; js/sitio.js; js/preguntas.js; css/estilo.css | Rol de figura válido, nombres accesibles incluyen texto visible, enlaces del pie subrayados; evita enlaces del lateral parcialmente tapados al salir del artículo |
| Laboratorio | laboratorio.html; js/analisis-modelo.js; js/laboratorio.js; css/laboratorio.css | Siete esquemas CSV existentes y un esquema temporal opcional; validación estricta, métricas, reglas, gráficos, tabla, procedencia y exportación JSON local |
| Índice y portada | index.html; datos/indice.js; herramientas/indice.py | Entrada al laboratorio y navegación como quinto complemento; 356 entradas de búsqueda regeneradas |
| Calidad | herramientas/pruebas_analisis.js; pruebas_laboratorio_navegador.py; verificar_sitio.py; pruebas_mapeo.js; pruebas_navegador.py; .github/workflows/verificar.yml; .gitignore | Nuevas pruebas, servidor temporal de navegador, recorrido determinista de widgets, verificaciones en PR y exclusión de cachés |
| Fuera del código | README.md; docs/auditoria-inicial.md; decisiones.md; laboratorio.md; informe-academico.md; trazabilidad.csv; observaciones-comite.csv; inventario-publicacion.csv | Fuentes, decisiones y límites documentados; plantilla de observaciones vacía y permisos de publicación pendientes |

El listado completo de archivos cambiados acompaña el ZIP de evidencia y también figura en el encabezado del parche Git. Los cambios forman una evolución incremental: no se incorporó framework, compilador, servicio de pago, modelo de IA ni dependencia para visitantes.

## Errores y deficiencias corregidas

El menú móvil declaraba comportamiento modal sin impedir el foco en el fondo. Un fallo de montaje reemplazaba la explicación original. Dos lecturas de ancla podían lanzar una excepción al decodificar una URL malformada. La secuencia de imágenes y A estrella seguían activos al ocultar la pestaña. Un fallo del índice carecía de acción de reintento y anuncio de estado. Se detectaron además nombres accesibles distintos del texto visible y enlaces del pie sin otra distinción que color.

La auditoría inicial diferencia estas deficiencias de los objetos ya correctos. Las pruebas de la base estaban aprobadas: los fallos inducidos y las pruebas ampliadas permitieron comprobar casos que ese conjunto inicial no cubría.

## Laboratorio: uso y límites

Abre `laboratorio.html` desde Pages o un servidor HTTP. Selecciona una tabla de la guía y pulsa Analizar, o abre un CSV propio con columnas compatibles. Cada métrica tiene fórmula y origen. Cada regla tiene condición, evidencia, interpretación limitada, sugerencia y limitación. Un archivo inválido retira el resultado anterior y bloquea su exportación. Limpiar elimina referencias al texto y a sus resultados del DOM.

No hay envío de archivos, persistencia, cuentas, claves ni LLM. La página limita conexiones al mismo origen. La exportación JSON incluye filas completas, opciones usadas, procedencia, estado académico y SHA-256 del texto UTF-8 cuando el navegador lo admite. Esto permite comprobar el cálculo, no certificar un experimento.

El porcentaje original de recta y el recálculo desde distancias redondeadas quedan separados. Las corridas sin mapa se excluyen sin convertir faltantes en ceros. Los reemplazos no se convierten en fallas ni en una tasa de éxito de navegación. El CSV de escalón no produce tiempos o sobreimpulsos que no contiene. La serie temporal opcional solo describe el intervalo observado; no certifica error estacionario ni estabilidad física.

## Pruebas ejecutadas

Entorno local: Node 24.19.0, Python 3.12.14, Playwright 1.63.0, Chromium 153.0.8010.0 y axe-core 4.14.0. Las herramientas de QA se instalaron fuera del repositorio y no están en el ZIP del sitio. El instalador estándar de Chromium no pudo descargar su archivo en este entorno; se usó un ejecutable local de Chromium de la misma generación, probado por Playwright. No se sustituye una prueba de navegador por una revisión de DOM.

| Verificación | Antes | Entrega |
|---|---:|---:|
| node herramientas/pruebas_unitarias.js | 40 | 40 |
| node herramientas/pruebas_control.js | 18 | 18 |
| node herramientas/pruebas_mapeo.js | 21 | 24 |
| node herramientas/pruebas_movimiento.js | 23 | 23 |
| node herramientas/pruebas_analisis.js | No existía | 43 |
| python3 herramientas/pruebas_control_navegador.py | 320 | 320 |
| python3 herramientas/pruebas_mapeo_navegador.py | 186 | 186 |
| python3 herramientas/pruebas_movimiento_navegador.py | 214 | 214 |
| python3 herramientas/pruebas_navegador.py | 464 | 479 |
| python3 herramientas/pruebas_laboratorio_navegador.py | No existía | 155 |
| python3 herramientas/verificar_sitio.py | No existía | 1 432 |

Totales finales: **148 pruebas numéricas y 1 354 comprobaciones de navegador correctas**, además de las 1 432 verificaciones estáticas en las 16 páginas. Todos los JavaScript pasaron `node --check`; `git diff --check` no detectó errores de formato.

Las pruebas recorren escritorio, móviles de 390 y 320 px, tema oscuro, movimiento reducido, teclado, lectura esencial sin JavaScript, recursos y anclas, buscador, widgets y exportación. El laboratorio se verifica bajo un prefijo de proyecto equivalente a `/tesis_explain/`. Sus peticiones observadas fueron GET al origen local, sin solicitudes de envío ni conexiones externas. Se probó la recuperación de un módulo ausente y se preservó su explicación.

Se verificaron extremos de deriva del grafo, reducción del desacuerdo y el caso de escala incorrecta que cierra sin corregir longitudes. El recorrido general de QA visita explícitamente los objetos tras cambios de altura: el desplazamiento suave o el crecimiento de un widget no pueden hacer que el test se salte otro. Se actualizaron las expectativas de navegación para el quinto complemento, conservando la numeración de los diez temas.

Axe revisó nueve escenarios: ocho páginas (portada, movimiento, control, mapeo, navegación, preguntas, laboratorio y recursos), incluyendo laboratorio claro/oscuro. No detectó infracciones automatizadas en esos escenarios tras las correcciones. Se inspeccionaron capturas de escritorio, móvil, oscuro y los objetos de control y SLAM. Esto no es una certificación completa de WCAG ni una prueba con lectores de pantalla. El reflow se ensayó por anchos de viewport; no se ejecutó una revisión manual exhaustiva del zoom nativo del navegador.

**Preservación:** 134 archivos de tablas, imágenes, videos, tipografías y licencias coinciden por SHA-256 con la base. Se mantienen los espacios y comentarios de material experimental pendiente, sin archivos ficticios. El estado científico completo permanece en el informe académico separado.

## Entrega, aplicación y despliegue

El ZIP contiene todos los archivos versionados del sitio, con su estructura; no incluye `.git`, dependencias de QA, cachés, secretos ni carpetas temporales. El parche es un correo Git producido con `git format-patch --full-index --binary`, para `git am`. La verificación de entrega aplica el parche en una copia limpia de la base y compara el árbol Git resultante con el árbol entregado. El comprobante se incluye en la evidencia.

Para aplicarlo en una copia limpia:

```bash
git switch -c mejora/tesis-explain 166d70e3f4d2b8e61daea9b1999fad859c28169b
git am /ruta/tesis_explain.patch
```

Para probar localmente el ZIP descomprimido:

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000`. Para editar, confirma metadatos y fuentes, actualiza el HTML relacionado, ejecuta `python3 herramientas/datos.py`, `python3 herramientas/indice.py` y las verificaciones. El flujo de Pages indicado por el proyecto sigue siendo rama main y raíz; corresponde al propietario revisar el PR y decidir su incorporación. La configuración efectiva de Settings y una ejecución hospedada de Actions no se modificaron ni comprobaron en GitHub.

Descripción propuesta para GitHub, a revisar manualmente: «Guía educativa de robótica móvil con ROS 2: tesis en revisión, simulaciones y análisis local de datos». Temas sugeridos: `robotics`, `ros2`, `slam`, `nav2`, `control`, `education`, `github-pages`. No se editaron estos campos del remoto.

## Lo pendiente

No están disponibles el documento completo de referencia, firmware adaptado, señales crudas, trayectorias sincronizadas ni rejillas originales autorizadas. Sin esos archivos no se reconstruyen ni validan esos experimentos. La ocurrencia de cierre de lazo real, el método angular y los motivos señalados al autor siguen pendientes. La inferencia local futura solo tiene una interfaz documentada; no se instaló IA.

Las pruebas interceptaron recursos externos de video para revisar el sitio sin depender de terceros; no certifican disponibilidad o reproducción de proveedores externos. Tampoco se efectuaron nuevas mediciones físicas, una evaluación prolongada de CPU/memoria ni pruebas exhaustivas con todos los navegadores y lectores de pantalla.
