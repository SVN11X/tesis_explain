# Informe técnico: un solo diseño para todo el sitio, sobre b018ab8

La portada nueva, compilada con Astro, y las 16 páginas de la guía se veían como dos sitios distintos: otra paleta, otra letra, otra cabecera, otro pie, otro buscador y un tema oscuro que la portada no tiene. Esta revisión lleva las páginas de la guía al sistema de la portada, saca el marco a una sola fuente para que no vuelvan a separarse, incorpora las mejoras pedidas en la revisión anterior y corrige el fallo de CI de `control.html`. Las cifras, fórmulas, citas, tablas experimentales, el estado académico y los pendientes del autor no cambian. La tesis sigue en revisión por comité.

Base: `b018ab812c960ebd82b0d3b812c9f608423f198d` de `main`. Los commits están en la rama local `revision/sistema-unificado`. El informe anterior está en `informe-tecnico-3bae57b.md`, en esta misma carpeta.

## Qué cambió

1. **CI.** En GitHub Actions, con Chrome 156, el CLS de `control.html` en escritorio llegó a 0,053 con las fuentes 1,2 s tarde, sobre un límite de 0,02. En este entorno, con Chrome 153 y las mismas fuentes de respaldo que reporta el registro de CI, era 0,0004, también con las fuentes del sistema del ejecutor de Ubuntu 26.04 y con la CPU seis veces más lenta. El movimiento venía del cambio de letra después de dibujar y dependía de la versión del navegador. Las fuentes de la guía pasan a `font-display: optional`: si no llegan en el primer instante, la página sigue con el respaldo y no cambia de letra después. Con las fuentes 1,2 s tarde el CLS medido queda en 0,0000 en las tres páginas, en teléfono y escritorio. Si vuelve a fallar, la prueba muestra qué elemento se movió. Este cambio va solo en el primer commit, por si se quiere aplicar aparte.
2. **Un solo sistema visual.** Las páginas de la guía usan la paleta de la portada (papel `#f1f1e9`, tinta `#182825`, acento lima `#dbea7b`), Archivo en su ancho normal para los títulos, Atkinson Hyperlegible para el texto e IBM Plex Mono para las etiquetas. Los bordes son líneas finas, sin sombras, y las esquinas son rectas. Los botones principales son tinta sobre papel y lo activo se marca en lima, como en la portada.
3. **Marco común.** La cabecera, el aviso académico, el pie, el menú del teléfono y la ventana de búsqueda estaban escritos dos veces, en `web/src/layouts/Shell.astro` y en `js/sitio.js`. Ahora salen de `herramientas/plantillas/`. `herramientas/datos.py` los inserta como HTML estático en las páginas de la guía y escribe `web/src/generado/marco.json`, que usa `Shell.astro`. Sus estilos están en `css/marco.css` y su comportamiento en `js/marco.js`, que cargan las 18 páginas. La cabecera de la guía ya no la arma JavaScript al cargar: se lee sin JavaScript y no mueve la página al aparecer.
4. **Solo tema claro.** La portada no tiene tema oscuro, así que la guía tampoco. Con el esquema oscuro del sistema el sitio conserva su paleta clara, y las suites lo siguen comprobando. Las simulaciones ya no eligen colores oscuros según el sistema.
5. **Colores de los datos.** Las explicaciones nombran colores, como «la curva azul» o «los puntos rojos». Los enlaces, botones y estados activos pasaron a tinta y lima, y los colores de los datos conservan su tono, un poco menos saturado. Se revisó cada declaración que usaba el azul: 153 de la interfaz pasaron al acento, y las 39 reglas de `estilo.css` que dibujan datos o categorías siguieron azules, igual que los gráficos de cada página.
6. **Cabecera que no queda fija.** Como en la portada. El índice lateral sigue fijo en escritorio, el menú del teléfono lleva las secciones de la página y una barra fina en el borde superior muestra el avance de la lectura.
7. **Guía numerada.** El lateral y el menú del teléfono numeran las 16 partes, del 01 al 16, y cada una despliega sus secciones. Las de la página actual salen de su HTML y las demás de `datos/secciones.js`.
8. **Buscador.** Una sola implementación para todo el sitio, también la portada. Vacío ofrece doce búsquedas sugeridas y las seis recientes de quien lo usa, guardadas solo en su navegador. Se abre con Control o Comando y K o con la barra, y las flechas recorren los resultados.
9. **Íconos, logo e imagen para compartir.** Íconos de Phosphor Icons 2.1.1, con licencia MIT en `LICENSE-iconos.txt`, en todo el sitio. En la portada reemplazan los caracteres que hacían de íconos en los controles del robot y del laboratorio, como reproducir, pausar y reiniciar. La marca es el robot real visto desde arriba, como en la foto de planta: el chasis en D con el frente plano, las dos ruedas, la pantalla del medidor, el LiDAR y el arco de su barrido. También en `img/icono.svg`. La imagen que aparece al compartir un enlace, `img/social.png`, tenía el diseño azul anterior. Ahora la genera `herramientas/imagen_social.py` con el diseño común.
10. **Costos y carta Gantt.** `robot.html#gasto` detalla las 51 compras del registro del autor por partida, con un gráfico de cada partida y otro por año, y `problema.html#carta-gantt` muestra la planificación de marzo a agosto de 2026 en 24 semanas. Los totales coinciden con la Tabla A1.1: 444 643 CLP del robot y 582 447 CLP del proyecto.
11. **PDF de las preguntas.** `preguntas.html` ofrece las 106 preguntas con sus respuestas en un PDF de 48 páginas con el estilo del sitio. `herramientas/descarga_preguntas.py --comprobar` falla si el PDF no corresponde a las preguntas actuales, y el flujo de CI lo ejecuta.
12. **Movimiento.** Los bloques aparecen al llegar a ellos, las cifras cuentan hasta su valor y las barras de los costos y de la carta crecen. Con movimiento reducido todo queda quieto y visible.
13. **Accesibilidad de la portada.** Trece colores de etiquetas pequeñas no llegaban a 4,5:1 sobre el papel, en 43 elementos de la portada y los laboratorios. Pasaron a tonos más oscuros de la misma familia. Los dos contenedores de las escenas 3D tienen ahora un rol, que su nombre accesible necesitaba.

## Archivos

| Área | Archivos |
|---|---|
| Marco común | `herramientas/plantillas/`, `herramientas/marco.py`, `css/marco.css`, `js/marco.js`, `web/src/generado/marco.json`, `web/src/layouts/Shell.astro`, `web/src/lib/experience.ts` |
| Diseño de la guía | `css/estilo.css`, `css/evidencia.css`, `css/laboratorio.css`, `css/mapeo.css`, `css/movimiento.css`, `css/preguntas.css`, las 16 páginas de la guía |
| Comportamiento | `js/sitio.js`, `js/sims.js`, `js/comun.js`, `js/mapeo.js`, `js/laboratorio.js` |
| Portada | `web/src/styles/experience.css`, `web/src/components/LidarLab.svelte`, `web/src/components/RobotHero.svelte`, `web/src/pages/index.astro` y las salidas compiladas |
| Datos y generadores | `herramientas/datos.py`, `herramientas/indice.py`, `herramientas/planificacion.py`, `herramientas/descarga_preguntas.py`, `herramientas/imagen_social.py`, `img/social.png`, `datos/costos.csv`, `datos/planificacion.json`, `datos/secciones.js`, `descargas/` |
| Verificación | seis suites de navegador, `herramientas/verificar_sitio.py`, `.github/workflows/verificar.yml` |
| Documentación | `README.md`, `docs/decisiones.md`, `docs/experiencia-v1.md`, este informe, `datos/academico.json` |

## Pruebas ejecutadas

Entorno: Node 22.23.4, Python 3.13, Playwright 1.63.0 con Chromium 153. Se ejecutaron los pasos de `verificar.yml` en su orden. La columna Base es la última ejecución de CI sobre `b018ab8`, que se detuvo en `pruebas_experiencia_navegador.py`.

| Verificación | Base | Revisión |
|---|---:|---:|
| `verificar_sitio.py` | 2 925 | 3 457 |
| `npm run check`, prueba LiDAR y compilación | correctas | correctas |
| `pruebas_compilacion.py` y `verificar_compilacion.py` | correctas | correctas |
| Ejemplos, figuras y PDF de preguntas al día | 4 de 4 | 5 de 5 |
| Pruebas numéricas en Node, ocho archivos | 203 | 203 |
| `pruebas_control_navegador.py` | 325 | 325 |
| `pruebas_mapeo_navegador.py` | 261 | 261 |
| `pruebas_movimiento_navegador.py` | 214 | 214 |
| `pruebas_laboratorio_navegador.py` | 227 | 227 |
| `pruebas_robustez_navegador.py` | 71 | 71 |
| `pruebas_evidencia_navegador.py` | 131 | 131 |
| `pruebas_navegador.py` | 530 | 552 |
| `pruebas_experiencia_navegador.py` | falló en el CLS | 69 |
| `pruebas_redisenio_navegador.py` | no se ejecutó | 41 |

`pruebas_navegador.py` compara ahora el marcado y los estilos de la cabecera, el aviso, el pie y el buscador entre la portada, los laboratorios y tres páginas de la guía, comprueba que la cabecera quepa de 320 a 1920 px y que el menú del teléfono lleve la guía numerada, y prueba la guía, los íconos, las sugerencias, la descarga, los costos, la carta y las animaciones. Las pruebas del menú del teléfono recorren el nuevo `details` con Tab, Mayúscula y Tab y Escape, a 320, 390 y 640 px.

La prueba de los títulos con la fuente de respaldo admite ahora una diferencia de líneas en 336 casos, y exige además que todas las fuentes web usen `font-display: optional`. Con `optional` la letra no cambia después de dibujar, así que esa diferencia no mueve la página. Se buscó el ajuste del respaldo con menos diferencias, un caso de 336.

Además, fuera del flujo:

- axe-core 4.10 en las 18 páginas, a 390 px con el esquema oscuro del sistema y a 1366 px, con los plegables abiertos y las reglas de WCAG 2.0, 2.1 y 2.2 en sus niveles A y AA: sin infracciones. Antes de esta revisión la portada tenía 39 elementos con contraste insuficiente y los laboratorios 4.
- Desborde horizontal en las 18 páginas a 320, 390, 768, 1024 y 1366 px: ninguno. Sin errores de JavaScript.
- Revisión visual de la portada, los capítulos, el menú, el buscador, el pie, los costos, la carta Gantt y el PDF, en escritorio y en teléfono.

## Sin verificar

- Chrome 156, el de CI, no se pudo descargar en este entorno. La corrección del CLS se comprobó con Chrome 153: la siguiente ejecución de GitHub Actions lo confirmará.
- Teléfonos reales y lectores de pantalla.
- Lighthouse no se midió en esta revisión.

## Pendientes

- Siguen pendientes del autor el método de medida del giro físico, el motivo del tamaño mínimo de frontera, la autorización para publicar firmware y registros, los tres videos preparados y las notas en primera persona.
- La portada conserva textos de 8 a 10 px en etiquetas y leyendas del visor 3D. Cumplen el contraste, pero conviene revisarlos con el diseño de la portada.
- El robot 3D de la portada es un cilindro ilustrativo y el robot real tiene el chasis en D. Con el CAD o el URDF del robot se puede reemplazar sin rehacer la interfaz, como ya dice `docs/experiencia-v1.md`.
- Un tema oscuro común puede volver más adelante, para todo el sitio a la vez, incluida la iluminación de las escenas 3D.

## Cómo aplicar el parche

Con `main` en `b018ab8`:

```bash
git checkout main
git am /ruta/tesis_explain-diseno-comun-b018ab8_cambios_git_am.patch
npm ci
npm run build
python3 herramientas/verificar_compilacion.py
git push origin main
```

Son tres commits: el primero corrige solo el CLS de CI, el segundo trae el diseño común y las mejoras, y el tercero la documentación y el historial. GitHub Pages sigue publicando `main` desde la raíz.
