# Contenido y procedencia

`academico.json` es la fuente del estado académico, de la fecha de esta actualización de plataforma y de los pendientes. Los campos desconocidos se mantienen `null`; la fecha del sitio no se presenta como fecha del documento ni de los experimentos.

`parametros.json` centraliza valores **ya presentes en la revisión base** de la guía. Incluye su referencia y unidades; no son nuevas mediciones ni una validación del firmware. Las constantes de escenarios ilustrativos permanecen junto a sus modelos.

`analisis/*.csv` son tablas que la tesis calcula sobre esos ensayos: la estabilidad del lazo de velocidad, los intervalos de confianza y la comparación de los mapas con el plano medido. `herramientas/datos.py` las publica como `PROYECTO.analisis`. Su detalle está en `analisis/README.md`.

`ensayos/*.csv` son las tablas resumidas originales. No se modificaron ni se sustituyeron por series inventadas. Cada cálculo del laboratorio separa los valores declarados de los recalculados desde cifras redondeadas.

`proyecto.js` se genera desde los dos JSON y los CSV con `python3 herramientas/datos.py`. Es un módulo local sin descargas externas, importable en Node para pruebas; evita peticiones asíncronas antes de montar diagramas. El mismo comando actualiza el aviso **HTML estático**, legible sin JavaScript. Ejecuta luego `python3 herramientas/indice.py`.

No muevas indiscriminadamente los textos HTML aquí. Si el comité cambia un parámetro, confirma su nueva fuente, actualiza el JSON, las explicaciones y respaldos HTML que lo citan, regenera ambos módulos y revisa las pruebas numéricas. Un nuevo dato no autoriza publicar su registro original.

`parametros.json` también reúne los umbrales de intensidad con que la tesis clasifica la imagen PGM del mapa (Anexo 8.1), la geometría del plano del recinto de la Fig. A8.1, las ganancias originales del firmware y el Kd que evaluó el costo del PSO (Anexos 4.5 y 4.10), y los parámetros del explorador de la Tabla A5.4. El laboratorio los usa como valores por defecto y los muestra con su fuente.

`academico.json` guarda los pendientes como objetos `{texto, enlace}` y un `historial` de cambios del sitio. `herramientas/datos.py` los escribe como HTML estático en `recursos.html#estado-academico`. Un cambio de plataforma se registra con `tipo: plataforma` y uno de contenido académico, autorizado por el autor, con `tipo: contenido`.

`ejemplos/` contiene archivos **sintéticos** para probar el laboratorio. Se generan con `node herramientas/ejemplos_laboratorio.js` y no son datos del robot ni de la tesis.
