# Auditoría de la revisión 3bae57b: estado completo, teléfonos e interactivos

Base: `3bae57b72f8bd1c7b85a2f48e26038b6993cf7ac`, rama remota `main`, clonada el 31 de octubre de 2026. Rama local de trabajo: `revision/auditoria-3bae57b`. La base ya incluía la bibliografía extendida.

Esta revisión audita el estado completo del sitio y no solo el último cambio: funcionamiento, explicaciones, interactivos, accesibilidad, navegación y uso en teléfonos. Se contrastaron las cifras con la tesis de octubre de 2026 y con el código del proyecto.

## Estado de partida

Los 19 pasos de `verificar.yml` pasaban en local: 203 pruebas numéricas en Node, 2 841 verificaciones estáticas y 1 777 comprobaciones de navegador. axe-core 4.10 no encontró infracciones de WCAG 2.2 en los niveles A y AA en las 17 páginas, a 390 px en tema oscuro y a 1366 px, con los plegables abiertos. Una prueba que acciona cada control de los 53 interactivos a 390 px no produjo errores de JavaScript.

No se pudo consultar el estado de GitHub Actions ni de GitHub Pages: la sesión no tenía acceso a la API del repositorio.

## Hallazgos

| Clase | Ubicación | Evidencia | Gravedad | Acción |
|---|---|---|---|---|
| Teléfono | Cabecera de las 17 páginas | Con pantalla táctil cada botón mide 44 px. El borde derecho del botón del menú quedaba en 331 px hasta 360 px de ancho y en 383 px entre 361 y 420 px, donde aparece el icono del repositorio. Las 17 páginas se desplazaban de lado entre 320 y 330 px y entre 361 y 382 px: 11 px a 320 px, 22 px a 361 px y 8 px a 375 px, el ancho del iPhone SE y de los mini | Alta | El contenedor vacío de la navegación se oculta bajo 861 px, el repositorio queda en el menú y en el pie bajo 421 px y la marca puede pasar a dos líneas. Sin desborde entre 320 y 1366 px |
| Calidad | Seis suites de navegador | En modo teléfono `innerWidth` crece con lo que desborda: a 320 px valía 331. Por eso las 24 comprobaciones `scrollWidth <= innerWidth + 1` no podían fallar | Alta | Comparación con `document.documentElement.clientWidth` y recorrido de las 17 páginas a 320 y 375 px. Con la base, la prueba corregida del capítulo 4 falla en «móvil pequeño» |
| Interactivo | `navegacion.html`, ventana dinámica | La huella se pintaba opaca y del mismo azul después de las trayectorias. Mide 0,28 m y las 105 candidatas avanzan a lo más 0,26 m desde el centro de giro, así que quedaban tapadas, igual que la elegida. A 1280 px el dibujo tenía unos 12 000 píxeles de azul pleno, casi todos de la huella | Media | Huella translúcida debajo, trayectoria elegida con contorno, centro de giro marcado y una vista ampliada de 50 cm. La leyenda nombra la huella y dice «más marcadas», porque en tema oscuro las mejores candidatas son más claras |
| Teléfono | `index.html`, `laboratorio.html` | `.btn` no partía su texto: «Ver las 106 preguntas, con modo práctica» y «Probar con un registro sintético de metas» se salían 17 y 35 px a 320 px | Media | Bajo 481 px los botones parten su texto |
| Accesibilidad | Buscador | Al bajar con las flechas, el primer resultado seguía marcado igual que el enfocado y ninguno tenía borde. El campo de búsqueda no mostraba el foco. Mientras llegaba el índice, de 776 KB sin comprimir, la lista quedaba vacía | Media | Solo el resultado enfocado queda marcado, con un borde de 3 px. Foco visible en el campo. Aviso de carga, también para lectores de pantalla |
| Accesibilidad | Anclas `#` de los subtítulos, escritorio | Los h3 no tenían `position: relative`, así que su `#` aparecía en x = −25 px, fuera de la pantalla, también al recibir el foco con el teclado. Eran 12 anclas en `control.html` y 10 en `mapeo.html`, entre otras | Media | Los h3 del artículo tienen posición relativa. Las 43 anclas de Control y las 36 de Mapeo quedan junto a su título |
| Táctil | Índice «En esta página» y otros enlaces, teléfono | El summary que abre el índice medía 15 px de alto dentro de una caja de 37 px. La marca medía 26 px, los enlaces de las cifras de la portada 21 px y las etiquetas que enlazan secciones de Recursos y Bibliografía 27 px | Baja | El summary ocupa toda la caja, con 44 px, y su flecha gira al abrir. Mínimo de 44 px con pantalla táctil para los demás |
| Interactivo | `movimiento.html`, encoder | El deslizador «Velocidad» mostraba 0,60 sin unidad. A 390 px la nota «cada marca verde es un flanco contado» se cortaba | Baja | «Velocidad de giro del disco», en rad/s. La nota baja al borde izquierdo y se abrevia si aún no cabe |
| Interactivo | `navegacion.html`, ventana dinámica, teléfono | La palabra «obstáculo» no cabía en el círculo de 33 px y se cortaba | Baja | Cuando no cabe, va debajo del círculo |
| Redacción | 7 páginas y 5 archivos de interactivos | 67 punto y coma en el texto visible de las páginas y 44 en mensajes de los interactivos, contra la regla que ya regía la bibliografía y la documentación | Baja | Puntos, comas o conjunciones, sin tocar cifras, fórmulas ni citas. Se conservan las dos entradas antiguas del historial de `datos/academico.json`, los mensajes de error para desarrolladores y el atributo `allow` del video |
| Calidad | `diagramas_mapeo.js`, `diagramas_control.js` | No tenían `--comprobar` y el flujo no verificaba sus figuras. El texto de un interactivo de `slam-proceso.js` también va en `img/diagramas/candidatos-cierre.svg` y la figura habría quedado atrás sin aviso | Baja | `--comprobar` en ambos generadores y en el flujo. La figura se regeneró |
| Código | `js/comun.js`, `js/sitio.js`, `js/sims.js` | Siete utilidades sin uso: `U.txt`, `U.r1`, `U.nivel`, `U.prom`, `U.guardar`, `U.leer` y `U.suave`. Un comentario del filtro duplicado, el del PDF separado de su variable, un «PENDIENTE AUTOR» ya resuelto que dejaba un párrafo oculto en el pie y la palabra «nuevas» en la descripción de las simulaciones | Baja | Utilidades retiradas y comentarios corregidos, sin cambiar el comportamiento |

## Revisado sin hallazgos

- 439 cifras con unidad de 12 páginas, entre ellas la portada, los temas 3 a 7 y 9, Problema, Constrúyelo tú y el laboratorio, se buscaron en el texto de la tesis. Las que no aparecen son cálculos o ejemplos de la guía: 40,76 y 10,32 ticks/ciclo salen del factor de conversión, 15,7 s de 2π / 0,4, 18,8 cm de 0,188 m, y las del simulador PID y del grafo de poses son ilustrativas y están rotuladas así. El único valor externo, el radio de inflación de 0,55 m que trae Nav2 por defecto, coincide con su documentación.
- La huella de 0,28 por 0,26 m, los 3,5 s de proyección de DWB, los límites de 0,15 m/s y 0,35 rad/s y el radio de rueda de 0,0335 m coinciden con la configuración y el firmware del proyecto.
- El estado de los cuatro objetivos coincide con las conclusiones de la tesis: OE1 y OE4 cumplidos, OE2 y OE3 cumplidos en parte. También las 60 metas generadas, de las que 59 llegaron a ejecutarse, los 21,9 m, los 3,4 cm de distancia al plano y los 3,3 s del explorador.
- Los conteos que cita el sitio coinciden con el contenido: 106 preguntas, 72 referencias en 11 grupos, 12 casos del mundo real y 53 interactivos.
- Toda imagen tiene dimensiones y texto alternativo, y los videos tienen dimensiones.
- La revisión de comentarios no encontró separadores decorativos, narración paso a paso, emojis ni tareas vagas.

## Sin verificar

- El estado de GitHub Actions y de GitHub Pages, por falta de acceso a la API.
- Teléfonos reales: las pruebas emulan pantallas táctiles de 320, 375 y 390 px en Chromium.
- Lectores de pantalla: axe y las pruebas automáticas no los reemplazan.
- Lighthouse no se midió en esta revisión, y el video de YouTube no se pudo cargar desde el entorno de prueba.

## Lo que se conserva

URLs, anclas, textos académicos, cifras, unidades, fórmulas, citas, referencias, el estado académico y los pendientes del autor, las tablas experimentales, los interactivos con sus modelos y escenarios, las 106 preguntas, la bibliografía, el buscador y las pruebas existentes.
