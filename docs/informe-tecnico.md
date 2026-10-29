# Informe técnico de la revisión sobre 9407bbb

Esta revisión amplía la bibliografía de la tesis. Cada una de las 72 referencias conserva su línea de resumen y, al abrirla, se lee en cinco bloques: una ficha con los datos de publicación, de qué trata el documento en varios párrafos, qué toma la tesis de él y dónde, sus referencias relacionadas y su cita, con botones para copiarla o copiar su entrada BibTeX. Con ese texto la bibliografía pasó a su propia página, `bibliografia.html`, y los enlaces antiguos de Recursos llevan a ella. Las tablas experimentales no cambian. La tesis sigue en revisión por comité.

Base: `9407bbbb35f104d81eb28d97be6cdc4463d7226d` de `main`, con el árbol `933009a7ded185a3e1f24ad9785832790d165ada`, el mismo que dejan `5b93b7c` y `b89a38d`, así que no hizo falta aplicar el parche de la revisión anterior. Los commits están en `main` local, sobre esa base. El informe anterior está en `historial/informe-tecnico-ae42f52.md`.

## Qué cambió

1. **Página propia.** Con la ficha y la explicación extendida, `recursos.html` habría superado los 100 KB comprimidos. La bibliografía está ahora en `bibliografia.html`, con los mismos grupos plegables, la línea de resumen de cada referencia, el filtro y las anclas `#r-…`. `recursos.html#bibliografia` presenta la página, el mapa de sus 11 grupos y la descarga en BibTeX. Un script en la cabecera de `recursos.html` lleva `#bibliografia`, `#bib-…` y `#r-…` a la página nueva antes de dibujarse, y `js/sitio.js` hace lo mismo si el ancla cambia dentro de Recursos. La página figura en el menú, el índice lateral, el pie, el buscador y las listas de páginas de las pruebas, entre Recursos y la portada.
2. **Detalle de cada referencia.** La ficha reúne el título original y su traducción, la autoría completa, la fecha, el medio, volumen, número y páginas, la edición, los identificadores, los enlaces al documento y a su versión abierta, el idioma, el acceso, la revisión de pares, la versión consultada, las palabras clave, las partes que usa la tesis y de dónde sale el detalle. Va en dos columnas y bajo 560 px en una. De qué trata explica el problema, el método, la evaluación, los resultados y los límites que reconocen los autores. Relación con la tesis dice qué toma el trabajo y para qué, las secciones, anexos, tablas y figuras donde aparece, en qué se diferencia y, en 37 referencias, dónde se aplica en el código del proyecto. 43 referencias traen una cita textual breve con su página y su traducción. La explicación suma 31 744 palabras, entre 301 y 598 por referencia, y cada grupo explica en dos párrafos qué decisión respalda y cómo se relacionan sus referencias. Los bloques largos muestran sus primeros párrafos y pliegan el resto con «Seguir leyendo», que también se abre al imprimir.
3. **Datos y validación.** El esquema de `datos/bibliografia.json` suma la ficha, las partes, la relación en párrafos, la diferencia, el código, los elementos, las referencias relacionadas y la cita textual, y su campo `nota` lo describe. `herramientas/bibliografia.py`, que llama `datos.py`, valida el archivo y escribe la página, la presentación de Recursos y `datos/bibliografia.bib`. Se detiene si falta un dato obligatorio de la ficha, si un autor no se escribe «Apellido, Nombre» o «=Institución», si un enlace interno no existe, si una cita textual pasa de 30 palabras, si la explicación de una referencia no tiene entre 300 y 600 palabras o si un texto usa punto y coma o guiones como separadores. La ficha admite editores para las obras que solo los declaran, como la guía Eurachem.
4. **BibTeX.** `datos/bibliografia.bib` tiene las 72 entradas, para biblatex con biber, con la clave del identificador sin `r-`. El botón Copiar en BibTeX pide el archivo una sola vez y copia solo la entrada de esa referencia. Sin JavaScript, el archivo se descarga desde «Descargar y citar».
5. **Citas completas.** Cuatro citas abreviaban la autoría con «et al.» aunque la tesis la escribe completa: Kato et al. (2018), Liu et al. (2025), Placed et al. (2023) y Francis et al. (2025). Ahora siguen la bibliografía de la tesis.
6. **Buscador.** El índice tiene una entrada por referencia con su resumen, los datos clave de la ficha y la explicación. Deja fuera las filas de acceso, revisión y procedencia, y los subtítulos de bloque y las etiquetas de los plegables, que ensuciaban el extracto. La sección de bibliografía de Recursos se indexa completa.
7. **Filtro más liviano.** El filtro normalizaba al cargar el texto de cada elemento, unas 30 000 palabras en la bibliografía. Ahora lo hace al enfocar el campo o al escribir. En Lighthouse, el bloqueo del hilo principal en `bibliografia.html` bajó de 190 a 40 ms. El filtro del glosario usa la misma función.
8. **Redacción de la documentación.** `README.md` y `docs/decisiones.md` explican la página nueva y ya no usan punto y coma.

## Archivos

| Área | Archivos |
|---|---|
| Bibliografía | `bibliografia.html`, `datos/bibliografia.json`, `datos/bibliografia.bib`, `herramientas/bibliografia.py`, `herramientas/datos.py`, `recursos.html`, `css/estilo.css`, `js/sitio.js` |
| Buscador | `herramientas/indice.py`, `datos/indice.js` |
| Enlaces desde los temas | 13 páginas con lista de fuentes, que ahora enlazan `bibliografia.html` |
| Estado académico | `datos/academico.json`, `datos/proyecto.js`, `recursos.html` |
| Verificación | `herramientas/pruebas_navegador.py`, `herramientas/pruebas_experiencia_navegador.py` |
| Documentación | `README.md`, `docs/decisiones.md`, este informe |

## Procedencia y comprobación del contenido

Para las 39 referencias con copia en el proyecto se usó ese archivo. Para las demás, su página oficial, su resumen publicado o el registro de su DOI, revisados el 28 y 29 de octubre de 2026. La ficha dice en cada caso de dónde sale el detalle. Cuando la copia del proyecto es una versión previa, como las de arXiv de Francis et al. (2025) y Vincent et al. (2024), la ficha lo indica y toma los datos de la revista del registro del DOI.

No se pudieron leer en esta revisión, y su ficha lo declara: el modelo en Thingiverse, el preprint en ResearchGate, el video en YouTube, el anuncio del fin de Noetic en ros.org (se usó el mismo anuncio en discourse.openrobotics.org), el sitio de YARP (se usó icub.iit.it), el manual de Webots, que solo entregó menús (se usaron Wikipedia y el artículo de Michel), la guía de explore_lite en wiki.ros.org (se usaron el README y el código del port), el texto de Kato et al. (2018) en IEEE Xplore, ACM y Semantic Scholar (se usaron su resumen y los títulos de sus figuras) y la página del libro de Devore et al. en Springer (se usaron los metadatos del DOI).

Comprobaciones:

- Todas las cifras de los párrafos de relación con la tesis, diferencia y código se buscaron en el texto de la tesis y en `4_codigo.txt`. Coinciden todas salvo tres que no vienen de la tesis: dos resultados del artículo de Liu et al. (12,99 % y 19,69 %), comprobados en el artículo, y el 97,5 % de la diferencia de Vincent et al., que se deduce del intervalo de dos lados que usa el código.
- Las cifras estadísticas que la tesis cita se recalcularon con SciPy: el intervalo de 35,9 a 99,6 % para cinco exploraciones válidas en seis, el 78,2 % para 15 éxitos en 15, las 17 ejecuciones sin fallas para superar el 80 %, el valor p de 0,109375 y el factor t dividido por la raíz de n, de 1,24 con cinco repeticiones y 0,72 con diez.
- Diez referencias elegidas al azar se compararon de nuevo con su fuente: Wittenmark et al. (2002), Slamtec (2020), Sun et al. (2022), Mori et al. (2024), Shi y Eberhart (1998), Yamauchi (1997), Liu et al. (2025), el anuncio del fin de Noetic, Karaman y Frazzoli (2011) y Webots. Sus cifras coinciden. En Liu et al. se precisó que la mejora de 10 a 30 % que declara el resumen abarca las pruebas en simulación y en el mundo real.
- Los precios de los TurtleBot 3 y los promedios del dólar observado de 2024 se revisaron el 29 de octubre de 2026 y coinciden con la tesis.

La página explica, sin cambiar la tesis, varias diferencias entre ella y sus fuentes. Por ejemplo, Yamauchi (1997) define la celda de frontera como una celda libre vecina de una desconocida, mientras que la Sec. 3.11 usa la definición de explore_lite, una celda desconocida vecina de una libre. Ngoc et al. (2023) no tratan la deriva de la odometría por la que los cita la Sec. 3.8. La versión de CoppeliaSim que cita la tesis, 4.10.0, no aparece todavía en la página de versiones del manual, que llega a la 4.9.0.

## Pruebas ejecutadas

Entorno: Node 22.23.4, Python 3.13.18, Playwright 1.63.0 y Chrome for Testing 153.

| Verificación | Base | Revisión |
|---|---:|---:|
| Pruebas numéricas en Node, ocho archivos | 203 | 203 |
| `python3 herramientas/verificar_sitio.py` | 2 107 | 2 841 |
| `node herramientas/ejemplos_laboratorio.js --comprobar` | correcta | correcta |
| `node herramientas/diagramas_plano.js --comprobar` | correcta | correcta |
| `python3 herramientas/pruebas_control_navegador.py` | 325 | 325 |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 261 | 261 |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 | 214 |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 195 | 195 |
| `python3 herramientas/pruebas_robustez_navegador.py` | 71 | 71 |
| `python3 herramientas/pruebas_evidencia_navegador.py` | 131 | 131 |
| `python3 herramientas/pruebas_navegador.py` | 479 | 499 |
| `python3 herramientas/pruebas_experiencia_navegador.py` | 73 | 81 |

Las verificaciones estáticas suben porque la página nueva y las fichas agregan enlaces internos, y se comprueba cada enlace y su ancla. `pruebas_navegador.py` recorre ahora 17 páginas, comprueba la navegación de Recursos y de Bibliografía y el panel con seis complementos, y el plegado de una referencia desde un enlace interno y desde un cambio de ancla en Recursos. Su prueba de cobertura del índice excluye la ficha, como estaba previsto. `pruebas_experiencia_navegador.py` comprueba los cinco bloques y la extensión de cada referencia, los dos párrafos de cada grupo, la ausencia de separadores, el BibTeX con una entrada por referencia y la misma clave, la presentación en Recursos, el traslado de un enlace antiguo, el filtro, el plegado de un bloque largo, la ficha en una y en dos columnas, los botones para copiar la cita y su BibTeX, la lectura sin JavaScript y la impresión. Las ocho suites de navegador tardan unos seis minutos en este equipo.

Lighthouse en teléfono, con un servidor local que comprime con gzip como GitHub Pages:

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---:|---:|---:|---:|
| `bibliografia.html` | 97 | 100 | 100 | 100 |
| `recursos.html` | 95 a 97 | 100 | 96 | 100 |
| `index.html` | 99 | 100 | 100 | 100 |
| `resultados.html` | 97 | 100 | 100 | 100 |

Buenas prácticas queda en 96 en `recursos.html` porque el entorno de prueba no puede descargar las miniaturas de YouTube, como en la revisión anterior. Antes de preparar el filtro al primer uso, `bibliografia.html` marcaba 94 en rendimiento. Servida sin compresión marca 65, porque el HTML pesa 490 KB, así que el resultado publicado depende de la compresión de GitHub Pages.

axe-core 4.10 revisó las 17 páginas en escritorio y teléfono, en tema claro y oscuro, con las reglas de WCAG 2.0, 2.1 y 2.2 en sus niveles A y AA y todos los plegables abiertos, incluidas las 72 referencias con sus bloques plegados. No encontró infracciones en las 68 revisiones. Esto no reemplaza pruebas con lectores de pantalla.

Capturas de escritorio y de teléfono, en tema claro y oscuro, del comienzo de la página, de la presentación en Recursos y de las referencias de Macenski et al. (2022), Home Brew Robotics Club, Shanghai Slamtec (2020), Trejos et al. (2022), Nav2 Maintainers (2021), Coppelia Robotics (2025), Cantwell (2025) y Francis et al. (2025): sin errores de consola ni desborde horizontal entre 360 y 1366 px.

## Peso

| Archivo | Base | Revisión |
|---|---:|---:|
| `recursos.html` | 155 KB, 40 KB comprimido | 51 KB, 18 KB comprimido |
| `bibliografia.html` | no existía | 490 KB, 111 KB comprimido |
| `datos/indice.js` | 516 KB, 141 KB comprimido, 551 entradas | 757 KB, 209 KB comprimido, 636 entradas |
| `datos/bibliografia.json` | 75 KB | 374 KB |

El índice del buscador se descarga solo al abrir la búsqueda, así que no cambia la carga de las páginas. `datos/bibliografia.bib` pesa 29 KB y se descarga solo al pedirlo.

## Pendientes

- La sesión no tuvo permiso de escritura en el repositorio remoto. Los cambios se entregan como parche para `git am` y como ZIP del repositorio.
- Las fuentes que no se pudieron leer quedan declaradas en su ficha. Si vuelven a estar disponibles, conviene revisar en especial el video de YouTube, cuya duración y descripción no se comprobaron, y el texto completo de Kato et al. (2018).
- Las páginas de producto, de documentación y de datos pueden cambiar. Su ficha dice la fecha en que se revisaron.
- La tesis está en revisión por comité. Si cambia su bibliografía, basta editar `datos/bibliografia.json` y volver a generar con `herramientas/datos.py` y `herramientas/indice.py`.

## Cómo aplicar el parche

Con `main` en `9407bbb`:

```bash
git checkout main
git am bibliografia-extendida.patch
python3 herramientas/verificar_sitio.py
python3 herramientas/pruebas_experiencia_navegador.py
git push origin main
```

Si prefieres revisarlo antes, aplícalo en una rama propia, mira el resultado con `python3 -m http.server 8000` y después llévalo a `main`. GitHub Pages publica la rama `main` sin compilación, como antes.
