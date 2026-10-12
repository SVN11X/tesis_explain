# Contenido y procedencia

`academico.json` es la fuente del estado académico, de la fecha de esta actualización de plataforma y de los pendientes. Los campos desconocidos se mantienen `null`; la fecha del sitio no se presenta como fecha del documento ni de los experimentos.

`parametros.json` centraliza valores **ya presentes en la revisión base** de la guía. Incluye su referencia y unidades; no son nuevas mediciones ni una validación del firmware. Las constantes de escenarios ilustrativos permanecen junto a sus modelos.

`ensayos/*.csv` son las tablas resumidas originales. No se modificaron ni se sustituyeron por series inventadas. Cada cálculo del laboratorio separa los valores declarados de los recalculados desde cifras redondeadas.

`proyecto.js` se genera desde los dos JSON y los CSV con `python3 herramientas/datos.py`. Es un módulo local sin descargas externas, importable en Node para pruebas; evita peticiones asíncronas antes de montar diagramas. El mismo comando actualiza el aviso **HTML estático**, legible sin JavaScript. Ejecuta luego `python3 herramientas/indice.py`.

No muevas indiscriminadamente los textos HTML aquí. Si el comité cambia un parámetro, confirma su nueva fuente, actualiza el JSON, las explicaciones y respaldos HTML que lo citan, regenera ambos módulos y revisa las pruebas numéricas. Un nuevo dato no autoriza publicar su registro original.
