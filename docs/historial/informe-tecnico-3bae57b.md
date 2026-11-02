# Informe técnico de la revisión sobre 3bae57b

Esta revisión audita el estado completo del sitio, no solo el último cambio, y corrige lo que encontró en teléfonos, accesibilidad, interactivos, redacción y verificación automática. El detalle de cada hallazgo, con su evidencia, está en `auditoria-3bae57b.md`. Las cifras, fórmulas, citas, tablas experimentales, el estado académico y los pendientes del autor no cambian. La tesis sigue en revisión por comité.

Base: `3bae57b72f8bd1c7b85a2f48e26038b6993cf7ac` de `main`. Los commits están en la rama local `revision/auditoria-3bae57b`, sobre esa base. El informe anterior está en `historial/informe-tecnico-9407bbb.md`.

## Qué cambió

1. **Cabecera en teléfonos.** Con pantalla táctil cada botón de la cabecera mide 44 px. A anchos de 320 a 330 px y de 361 a 382 px, que incluyen los 375 px del iPhone SE y de los mini, el botón del menú quedaba fuera de la pantalla en las 17 páginas, que se desplazaban de lado. Bajo 861 px el contenedor de la navegación se oculta completo, bajo 421 px el enlace al repositorio queda en el menú y en el pie, y la marca puede pasar a dos líneas antes de empujar los botones. Los botones con texto largo, como «Ver las 106 preguntas, con modo práctica», parten su texto bajo 481 px.
2. **Pruebas de desborde.** En modo teléfono `innerWidth` crece con lo que desborda, así que las 24 comprobaciones `scrollWidth <= innerWidth` no podían fallar. Ahora comparan con `document.documentElement.clientWidth`, y `pruebas_navegador.py` recorre las 17 páginas a 320 y 375 px con pantalla táctil. Con el CSS de la base, la prueba corregida del capítulo 4 falla, como debe.
3. **Ventana dinámica.** La huella del robot se dibujaba opaca y del mismo azul encima de las 105 trayectorias candidatas, que avanzan a lo más 26 cm desde el centro de giro, y las tapaba junto con la elegida. Ahora va translúcida debajo, la trayectoria elegida lleva contorno, el centro de giro queda marcado y una segunda vista muestra 50 cm alrededor del robot con una escala de 10 cm. La palabra «obstáculo» va bajo el círculo cuando no cabe en él. El dibujo se hace con una sola función para ambas vistas. Los puntajes, los escenarios y la proyección de 1,7 s no cambian.
4. **Buscador.** Avisa mientras llega el índice, el campo muestra el foco y, al bajar con las flechas, solo el resultado enfocado queda marcado, con un borde de 3 px.
5. **Anclas de los subtítulos.** Los h3 del artículo tienen posición relativa. Antes su `#` aparecía fuera de la pantalla, también al recibir el foco con el teclado.
6. **Objetivos táctiles.** El índice «En esta página» se abre tocando toda su caja, de 44 px, y su flecha gira al abrirlo. Con pantalla táctil también miden 44 px la marca, los enlaces de las cifras de la portada y las etiquetas que llevan a secciones de Recursos y Bibliografía.
7. **Cursor y botones deshabilitados.** «Quitar la curva anterior», «Recalcular archivo actual» y «Exportar resultado JSON» se veían activos cuando no se podían usar, mostraban la mano y se resaltaban al pasar el ratón. Ahora un control deshabilitado se ve apagado, con el cursor de prohibido, y los 70 controles habilitados que mostraban la flecha o el cursor de texto, entre ellos 45 deslizadores, muestran la mano. Los botones habilitados se ven igual que antes.
8. **Encoder.** El deslizador dice «Velocidad de giro del disco» y su valor lleva la unidad, rad/s. La nota del dibujo baja al borde izquierdo en un teléfono y se abrevia si aún no cabe.
9. **Redacción.** 67 punto y coma del texto visible de 7 páginas y 44 de los mensajes de 5 archivos de interactivos pasaron a puntos, comas o conjunciones. Un mensaje del análisis de estabilidad ya no tiene una raya de respaldo. Se conservan las dos entradas antiguas del historial, los mensajes de error para desarrolladores y el atributo `allow` del video.
10. **Figuras generadas.** `diagramas_mapeo.js` y `diagramas_control.js` aceptan `--comprobar` y el flujo de verificación los ejecuta. `img/diagramas/candidatos-cierre.svg` se regeneró porque lleva la etiqueta de un interactivo que cambió.
11. **Código.** Se retiraron siete utilidades sin uso de `js/comun.js` y se corrigieron comentarios duplicados, desubicados o que ya no correspondían en `js/sitio.js` y `js/sims.js`. El pie ya no inserta un párrafo oculto con un «PENDIENTE AUTOR» resuelto.
12. **Documentación.** Esta auditoría, este informe, decisiones nuevas en `decisiones.md`, el README y una entrada de plataforma en el historial del estado académico, con la fecha de actualización del sitio.

## Archivos

| Área | Archivos |
|---|---|
| Teléfonos, foco, cursor y objetivos táctiles | `css/estilo.css` |
| Interactivos | `js/sims.js`, `js/mapeo.js`, `js/slam-proceso.js`, `js/vis2.js`, `js/analisis-modelo.js`, `js/laboratorio.js`, `js/evidencia.js` |
| Buscador y código común | `js/sitio.js`, `js/comun.js` |
| Redacción | `control.html`, `mapeo.html`, `laboratorio.html`, `movimiento.html`, `navegacion.html`, `problema.html`, `recursos.html` |
| Generados | `datos/indice.js`, `datos/proyecto.js`, `datos/bibliografia.bib`, `recursos.html`, `img/diagramas/candidatos-cierre.svg` |
| Verificación | las ocho suites de navegador, `diagramas_mapeo.js`, `diagramas_control.js`, `.github/workflows/verificar.yml` |
| Documentación | `README.md`, `docs/decisiones.md`, `docs/auditoria-3bae57b.md`, este informe, `datos/academico.json` |

## Pruebas ejecutadas

Entorno: Node 22.23.4, Python 3.13.18, Playwright 1.63.0 y Chromium. Se ejecutaron los pasos de `verificar.yml` en el orden del flujo.

| Verificación | Base | Revisión |
|---|---:|---:|
| Pruebas numéricas en Node, ocho archivos | 203 | 203 |
| `python3 herramientas/verificar_sitio.py` | 2 841 | 2 841 |
| Ejemplos sintéticos y figuras generadas al día | 2 de 2 | 4 de 4 |
| `python3 herramientas/pruebas_control_navegador.py` | 325 | 325 |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 261 | 261 |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 | 214 |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 195 | 195 |
| `python3 herramientas/pruebas_robustez_navegador.py` | 71 | 71 |
| `python3 herramientas/pruebas_evidencia_navegador.py` | 131 | 131 |
| `python3 herramientas/pruebas_navegador.py` | 499 | 541 |
| `python3 herramientas/pruebas_experiencia_navegador.py` | 81 | 81 |

Las suites del capítulo 4, el capítulo 05, el capítulo 3, el laboratorio, la robustez y la evidencia conservan su número de comprobaciones, pero sus comprobaciones de desborde ahora pueden fallar. `pruebas_navegador.py` suma 34 páginas a 320 y 375 px, el estado de carga y el foco del buscador, la visibilidad de las candidatas en la ventana dinámica, el alto táctil del índice, la marca y los enlaces de las cifras y de las etiquetas, también en `bibliografia.html`, y el cursor de los controles y el aspecto de un botón deshabilitado.

Además, fuera del flujo:

- axe-core 4.10 en las 17 páginas, a 390 px en tema oscuro y a 1366 px en tema oscuro, con los plegables abiertos y las reglas de WCAG 2.0, 2.1 y 2.2 en sus niveles A y AA: sin infracciones, igual que en la base.
- Desborde horizontal medido con `clientWidth` en las 17 páginas a 320, 360, 390, 768, 1024 y 1366 px, con pantalla táctil bajo 500 px: ninguno. En la base, las 17 páginas desbordaban 11 px a 320 px, 22 px a 361 px y 8 px a 375 px. La cabecera también cabe a 862, 900, 980, 1041, 1100, 1180, 1181 y 1250 px con ratón y en tabletas táctiles de 600 a 1180 px.
- El cursor de los 4 220 controles visibles de las 17 páginas a 1366 px, con los interactivos montados: todos muestran la mano, o el cursor de prohibido si están deshabilitados, salvo los 119 términos del glosario, con el de ayuda, y el comparador de Control, con el de arrastre lateral. En la base no lo hacían 73.
- Un recorrido de lo que cambió: a 320 y 375 px el menú se abre al tocarlo y Escape lo cierra y devuelve el foco, el índice «En esta página» se abre tocando el borde de su caja, el buscador llega a un resultado con las flechas y Enter, las dos vistas de la ventana dinámica responden al deslizador del obstáculo y a las flechas del teclado, el encoder muestra su valor en rad/s y las 30 anclas de Control quedan dentro de la pantalla al recibir el foco.
- Una prueba que acciona cada botón, deslizador, casilla y selector de los 53 interactivos a 390 px, con movimiento reducido: sin errores de JavaScript.
- Capturas en escritorio y en teléfono, en tema claro y oscuro, de la cabecera a 320 y 375 px, del buscador al bajar con las flechas, de la ventana dinámica con su vista ampliada, del encoder, del índice «En esta página» y de las etiquetas de Recursos.

Lighthouse no se midió en esta revisión. Los cambios no agregan archivos, fuentes ni imágenes a la carga de las páginas.

## Pendientes

- La sesión no tuvo acceso a la API de GitHub, así que no se pudo revisar la última ejecución de Actions ni el estado de Pages. Los cambios se entregan como parche para `git am` y como ZIP del repositorio.
- Conviene probar la cabecera en un teléfono real de 320 o 375 px, y el sitio con un lector de pantalla.
- `js/sims.js` tiene 1 152 líneas y `js/sitio.js` 1 056. Separar las simulaciones del capítulo 6 en su propio módulo, con las utilidades de lienzo compartidas, y reunir el servidor y las comprobaciones comunes de las ocho suites de navegador en un módulo propio reduciría ambos archivos. Requiere cambiar el manifiesto de interactivos y el arnés de pruebas, por eso quedó para una revisión aparte.
- Siguen pendientes del autor el método de medida del giro físico, el motivo del tamaño mínimo de frontera, la autorización para publicar firmware y registros, los tres videos preparados y las notas en primera persona.

## Cómo aplicar el parche

Con `main` en `3bae57b`:

```bash
git checkout main
git am /ruta/tesis_explain-auditoria-3bae57b_cambios_git_am.patch
python3 herramientas/verificar_sitio.py
python3 herramientas/pruebas_navegador.py
git push origin main
```

Si prefieres revisarlo antes, aplícalo en una rama propia, mira el resultado con `python3 -m http.server 8000` y después llévalo a `main`. GitHub Pages publica la rama `main` sin compilación, como antes.
