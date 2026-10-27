# Auditoría de la revisión ae42f52: fallas y bibliografía

Base: `ae42f525771c23e8581ddda6d968489a9fba44c4`, rama remota `main`, recuperada el 27 de octubre de 2026. Rama local de trabajo: `revision/fallas-referencias`. La base ya incluía la revisión de experiencia auditada en `auditoria-a5bd066.md`.

Esta revisión busca fallas del sitio publicado, de su verificación automática y de su contenido, y atiende una observación del autor: la bibliografía de la tesis no explicaba qué es cada documento ni para qué se usa.

## Estado de partida

Todas las pruebas pasaban en local: 203 numéricas en Node, 1 904 verificaciones estáticas y 1 734 comprobaciones de navegador. GitHub Pages ya servía la base, con el historial del 26 de octubre a la vista.

En GitHub Actions, el flujo «Verificar sitio» falló en `ae42f52` en el paso de navegador, después de pasar en `a5bd066`. La única anotación pública dice «Process completed with exit code 1», y el registro completo pide iniciar sesión. Por la línea en que termina el registro, 1754, la falla está con alta probabilidad en la primera medición de CLS con fuentes lentas de `pruebas_experiencia_navegador.py`. La etiqueta `ubuntu-latest` migra a Ubuntu 26 desde el 19 de octubre de 2026, según el aviso de la misma ejecución, y el conjunto de fuentes instaladas puede cambiar. Se reprodujo la condición en local: sin ninguna fuente de los anchos de Arial, con solo DejaVu Sans, el CLS de la portada en un teléfono es 0,091, sobre el umbral de 0,02 de esa prueba.

## Hallazgos

| Clase | Ubicación | Evidencia | Gravedad | Acción |
|---|---|---|---|---|
| Contenido | `recursos.html#bibliografia` | Las 72 referencias se listaban sin decir qué son ni para qué las usa la tesis. La tesis anota el papel de varias, como el firmware base, los precios de catálogo o el tipo de cambio, y esas notas no estaban en el sitio. Las referencias 29 a 31 tenían otro orden que en la tesis | Alta | Bibliografía en 11 grupos plegables, generada desde `datos/bibliografia.json`. Cada referencia es una línea con número de la tesis, autor, tipo y resumen, que se abre con de qué trata el documento, para qué lo usa la tesis, dónde aparece y la cita completa. Filtro, ancla por referencia y una entrada por referencia en el buscador |
| Rendimiento | Todas las páginas, Android | Con las fuentes 1,2 s tarde y solo Roboto instalada, como en Android, 18 de 32 mediciones en las 16 páginas, en teléfono y escritorio, superaban un CLS de 0,02, con un máximo de 0,186. El respaldo calibrado con Arial se aplicaba a Roboto, que es más angosta | Alta | Respaldo propio para Roboto |
| Rendimiento | Títulos de los temas | Con el respaldo, el título de `movimiento.html` ocupaba una línea y con Archivo dos, entre 364 y 480 px de ancho, y la página bajaba 33 px al llegar la fuente. En un teléfono de 390 px el CLS era 0,026 aun con Arial o equivalentes. Entre 320 y 480 px, 36 de 656 combinaciones de página y ancho cambiaban de número de líneas con Arial, 80 con Roboto y 208 con DejaVu Sans. El respaldo de los títulos estaba ajustado al de la portada, que es largo | Media | Respaldo propio para los títulos de los temas: queda 1 combinación distinta, en la portada |
| Rendimiento | Todas las páginas, Linux sin Arial | Con solo DejaVu Sans, 20 de 32 mediciones superaban 0,02, con un máximo de 0,260 en `lecciones.html` en escritorio | Media | Respaldo propio para DejaVu Sans, ajustado en las 16 páginas |
| Calidad | GitHub Actions | Falla de la ejecución de `ae42f52`, sin el nombre de la comprobación en el resumen. Las acciones de checkout, Node y Python usaban Node 20, obsoleto según el aviso de la ejecución | Alta | Prueba de fuentes que reconoce un sistema sin respaldo, anotaciones con el nombre de la comprobación que falla, salida sin búfer y acciones en versiones con Node 24 |
| Calidad | `pruebas_navegador.py`, encoder con movimiento reducido | La comprobación «si el sistema pasa a movimiento reducido, se detiene» esperaba 50 ms fijos y falló en una corrida con el equipo cargado | Media | Espera a que la simulación cambie de estado |
| Experiencia | `recursos.html`, `laboratorio.html` | Los enlaces a `docs/*.md`, `datos/*/README.md` y a los CSV de documentación abrían Markdown sin formato o descargaban el archivo | Baja | Enlaces a la vista de GitHub. Las tablas del laboratorio siguen como descarga |
| Redacción | `docs/informe-academico.md`, `README.md` | «según la instrucción del autor para esta entrega» y «no se ejecutó en GitHub durante esta entrega» | Baja | Frases corregidas |

## Revisado sin hallazgos

- El abstract del sitio coincide palabra por palabra con el de la tesis.
- Las 72 citas coinciden con la bibliografía de la tesis. Solo cambian detalles de formato, como la omisión de las fechas de consulta.
- Cada cifra con unidad de los temas y páginas complementarias aparece en la tesis o es una conversión, un cálculo o un ejemplo de la guía.
- La revisión ortográfica con el diccionario Hunspell de español no encontró errores. Las palabras no reconocidas son nombres propios y términos técnicos.
- Las listas de fuentes de las 13 páginas que las tienen no tienen fuentes sin citar, citas rotas ni números cruzados.
- El estado de los cuatro objetivos coincide con las conclusiones de la tesis.

## Lo que se conserva

URLs, anclas, textos de los temas, tablas experimentales, el estado académico, los interactivos, las 106 preguntas, el buscador, el glosario y las pruebas existentes. Los enlaces `recursos.html#r-…` a cada referencia siguen funcionando y abren su grupo y su detalle.
