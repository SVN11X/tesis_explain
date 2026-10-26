# Informe técnico de la entrega sobre e876140

Esta entrega hace más robusto el arranque del sitio, cierra los problemas de accesibilidad que detectó axe, agrega interpretación por reglas al simulador PID, muestra cómo cambia el mapa al optimizar un grafo de poses, añade fichas del concepto y amplía el laboratorio a mapas de ocupación y registros de estados de metas. Las tablas experimentales no cambian. La tesis sigue en revisión por comité.

Base: `e876140d3e9a31041289536dede50bc2d12e450e` de `main`. Rama local: `mejora/evolucion-2026-10-12`. La entrega no modifica el remoto ni publica cambios en `main`. La auditoría de partida está en `auditoria-e876140.md` y el informe de la entrega anterior en `historial/informe-tecnico-166d70e.md`.

## Errores corregidos

1. **Sitio sin datos.** Si `datos/proyecto.js` no llegaba, `js/sitio.js` fallaba en su primera línea y la página quedaba sin cabecera, sin pie y sin interactivos. Ahora usa valores de respaldo para el estado académico y arranca cada parte aislada. Los módulos de modelo no se definen si faltan sus datos, y cada interactivo conserva su explicación con un botón de reintento.
2. **Navegadores sin `MediaQueryList.addEventListener`.** En Safari anterior a la versión 14, la secuencia de etapas detenía el arranque de `mapeo.html` y A estrella caía a su respaldo. Ahora se usa `addListener` cuando hace falta.
3. **Atributo ARIA no permitido.** La cuadrícula de ticks de control tenía `aria-label` sin rol. Ahora es una imagen con nombre.
4. **Tablas anchas sin teclado.** En teléfono, 18 tablas de 11 páginas se desplazaban solo con el dedo o el ratón. Ahora cada tabla que desborda es una región enfocable con el nombre de su título, y deja de serlo cuando vuelve a caber.

## Mejoras y funcionalidades nuevas

| Área | Archivos | Resultado |
|---|---|---|
| Aviso académico | `css/estilo.css`, `datos/academico.json`, las 16 páginas | En teléfono ocupa una línea corrida de 71 px, antes 131 px, sin repetir el estado. |
| Estado y procedencia | `herramientas/datos.py`, `recursos.html`, `datos/academico.json` | Versión, fechas, pendientes enlazados a su pregunta e historial de cambios se generan como HTML estático desde el JSON. |
| Simulador PID | `js/control-modelo.js`, `js/sims.js`, `control.html` | El modelo pasa a `control-modelo.js` y agrega lecturas por regla, cada una con su condición y su cálculo. Con solo P la lectura escribe referencia / (1 + K·P) con los números del gráfico. |
| Respaldos sin JavaScript | `control.html`, `navegacion.html`, `exploracion.html`, `index.html`, `img/diagramas/pid-respaldo.svg`, `herramientas/diagramas_control.js` | Siete respaldos dicen ahora qué muestra el interactivo y con qué cifras. El del PID incluye una figura generada con el mismo modelo. |
| Grafo de poses | `js/mapeo.js`, `css/mapeo.css`, `mapeo.html` | El mapa que forman las observaciones se dibuja sobre el grafo. Tres lecturas: la misma pared vista al inicio y al regreso, la dispersión de cada pared y el ancho del recinto en el mapa. Con la deriva por defecto pasan de 17,7 cm, 4,1 cm y 2,11 m a 0,2 cm, 1,8 cm y 2,15 m, frente a 2,10 m reales del ejemplo. |
| Fichas del concepto | `control.html`, `navegacion.html`, `mapeo.html`, `css/estilo.css` | Ley de control del firmware, A estrella y SLAM por grafo de poses, en siete pasos y plegadas. |
| Laboratorio, mapas | `js/analisis-mapa.js`, `js/laboratorio.js`, `laboratorio.html`, `css/laboratorio.css` | PGM P5 y P2 con YAML opcional. Umbrales de la tesis o del YAML, áreas, índice en la imagen y en el rectángulo observado, comparación celda a celda solo con marco compatible, dibujo en lienzo con alternativa textual. |
| Laboratorio, metas | `js/analisis-modelo.js` | Registro con una fila por meta en cada mensaje de estado. Estado final por identificador, reemplazos según el Anexo 8.4, abortos sin clasificar, metas sin estado final y tiempo activo mediano. |
| Ejemplos sintéticos | `datos/ejemplos/`, `herramientas/ejemplos_laboratorio.js` | Dos mapas y un registro inventados para probar formatos, rotulados como sintéticos. |
| Parámetros | `datos/parametros.json` | Umbrales del Anexo 8.1 y parámetros del explorador de la Tabla A5.4, con su fuente. |
| Calidad | `herramientas/pruebas_robustez_navegador.py`, pruebas de Node, `.github/workflows/verificar.yml` | Fallos inducidos, teclado en tablas, aviso en móvil, lecturas del PID, mapa del grafo, fichas, respaldos y estado sin JavaScript. |
| Documentación | `README.md`, `docs/` | Auditoría de esta revisión, decisiones, laboratorio, trazabilidad y datos. |

Dos frases cambiaron para coincidir con el Anexo 7 de la tesis: en la iteración 2 el robot no se desplazó, así que el sitio ya no dice que recorrió el recinto seis veces. No cambió ninguna cifra ni conclusión.

## Decisiones técnicas

No se agregaron frameworks, compiladores ni dependencias para visitantes. Las lecturas del PID viven en el modelo y no en la vista, para probarlas en Node. El mapa del grafo usa observaciones exactas, para aislar el efecto de la pose. El módulo de mapas es separado porque trabaja con bytes. Los mapas no se alinean automáticamente, porque eso cambiaría lo que se mide. Las razones completas están en `decisiones.md`.

## Pruebas ejecutadas

Entorno: Node 22.22.0, Python 3.13.16, Playwright 1.56.0 y Chromium 141.0.7390.37. axe-core 4.10.2 se instaló fuera del repositorio solo para la auditoría.

| Verificación | Base | Entrega |
|---|---:|---:|
| `node herramientas/pruebas_unitarias.js` | 40 | 40 |
| `node herramientas/pruebas_control.js` | 18 | 21 |
| `node herramientas/pruebas_mapeo.js` | 24 | 28 |
| `node herramientas/pruebas_movimiento.js` | 23 | 23 |
| `node herramientas/pruebas_analisis.js` | 43 | 57 |
| `python3 herramientas/verificar_sitio.py` | 1 432 | 1 454 |
| `node herramientas/ejemplos_laboratorio.js --comprobar` | No existía | correcta |
| `python3 herramientas/pruebas_control_navegador.py` | 320 | 320 |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 186 | 186 |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 | 214 |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 155 | 195 |
| `python3 herramientas/pruebas_robustez_navegador.py` | No existía | 71 |
| `python3 herramientas/pruebas_navegador.py` | 479 | 479 |

Totales de la entrega: **169 pruebas numéricas, 1 465 comprobaciones de navegador y 1 454 verificaciones estáticas, todas correctas**. Todos los JavaScript pasan `node --check` y todos los scripts de Python compilan.

axe-core revisó las 16 páginas con los interactivos montados, en escritorio claro, escritorio oscuro y teléfono de 390 px, y el laboratorio con resultados de mapas y metas en claro y oscuro. En la base encontró una infracción grave repetida en tres escenarios y 18 regiones desplazables sin foco. En la entrega no encontró infracciones. Esto no es una certificación completa de WCAG 2.2 AA ni reemplaza pruebas con lectores de pantalla.

Los fallos se reprodujeron en la base y se comprobaron corregidos en la rama: con `datos/proyecto.js` bloqueado, `control.html` pasó de 0 a 4 interactivos montados, con cabecera y pie. Otros 12 muestran su respaldo con un botón de reintento y el último, dentro de un bloque plegado, hace lo mismo al abrirlo. Con el `matchMedia` de Safari anterior a 14, `mapeo.html` pasó de 0 a 7 de 7. Se inspeccionaron capturas de escritorio, teléfono y tema oscuro de los objetos cambiados; las pareadas antes y después acompañan la entrega como evidencia.

## Uso y despliegue

Para aplicar la entrega en una copia limpia:

```bash
git switch -c mejora/evolucion-2026-10-12 e876140d3e9a31041289536dede50bc2d12e450e
git am /ruta/tesis_explain-evolucion.patch
```

Para revisar el sitio localmente, desde la raíz: `python3 -m http.server 8000` y abrir `http://localhost:8000`. Después de editar texto o datos: `python3 herramientas/datos.py`, `python3 herramientas/indice.py` y las pruebas del README. GitHub Pages sigue publicando desde `main` y la raíz. Corresponde al propietario revisar la rama o el PR y decidir si la incorpora. No se comprobó una ejecución hospedada de Actions.

## Lo pendiente

1. La versión del documento, la fecha de los datos y los motivos señalados en Recursos siguen pendientes del autor.
2. No hay mapas, registros de estados ni series de control originales publicados. El laboratorio los puede analizar cuando el autor los autorice, pero no los reemplaza con los ejemplos sintéticos.
3. No se probaron Safari ni Firefox reales, ni lectores de pantalla. El caso de Safari anterior a 14 se simuló en Chromium.
4. La descripción y los temas del repositorio en GitHub se editan a mano. Propuesta: «Guía educativa de robótica móvil con ROS 2: tesis en revisión, simulaciones y análisis local de datos», con `robotics`, `ros2`, `slam`, `nav2`, `pid-control`, `education` y `github-pages`.
