# Experiencia y rendimiento de la versión anterior

Este apartado documenta la revisión del 26 de octubre, previa a la portada Astro/Svelte y al diseño común. La paleta azul de la UTEM, el tema oscuro de entonces y la cabecera fija que describe ya no están. El tema oscuro actual es otro, común a todo el sitio.

La revisión del 26 de octubre de 2026 conserva el HTML, CSS y JavaScript sin compilación y suma una identidad de plano técnico: la rejilla de ocupación detrás de los títulos, los anillos del LiDAR alrededor del prototipo, paneles azul noche y la franja azul y verde de la UTEM. La simulación del ciclo en la portada se dibuja como una consola azul noche, las imágenes de los temas comparten un tono azul que recupera su color al apuntarlas y en un teléfono cada tema es una fila compacta.

- **Sin saltos al cargar.** Las fuentes críticas se precargan y las de respaldo tienen métricas ajustadas, así el texto no se mueve cuando llegan. El CLS en teléfono, que iba de 0,14 a 0,33 según la página, quedó cerca de 0. Desde el 27 de octubre el respaldo también se ajusta a Roboto, de Android, y a DejaVu Sans, de Linux. Con solo Roboto instalada, el CLS en teléfono bajó de 0,145 a 0,0001.
- **Menos peso al abrir.** Los archivos de interactivos se piden al acercarse a la pantalla, los videos en bucle y la portada de un video lejano esperan a que el navegador quede libre y los gráficos pasaron a WebP sin pérdida.
- **Navegación.** Transición suave entre páginas con la cabecera fija, en navegadores que la soportan, y precarga de la página siguiente al apuntar un enlace. En un teléfono, el menú suma las secciones de la página que se lee.
- **Interactivos nuevos.** Comparador de decisiones en `problema.html#estado-del-arte`, filtro del glosario en `recursos.html#glosario` y bibliografía de la tesis, hoy en `bibliografia.html`, en grupos y con filtro, donde cada referencia es una línea de resumen que se abre con su detalle. El buscador del sitio lleva directo a cada referencia abierta.
- **Movimiento con propósito.** Las tarjetas aparecen con un leve ascenso al desplazarse y el barrido del LiDAR de la portada dura menos de 5 s. Con movimiento reducido no hay animaciones.

Lighthouse local, con compresión gzip como GitHub Pages: rendimiento de 78 a 94 antes y de 95 a 99 después en teléfono, 100 en escritorio, accesibilidad 100 y SEO 100 en las 16 páginas. El detalle está en `docs/historial/informe-tecnico-a5bd066.md`.
