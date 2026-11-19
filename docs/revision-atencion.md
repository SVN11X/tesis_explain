# Revisión de atención de la portada y las páginas largas

Fecha: 2026-11-19

## Método

Revisión en un Chromium real del sitio publicado, a 360x780 y 1280x800, con y sin movimiento reducido. No se hicieron capturas versionadas ni se cambió nada en el sitio.

## Hallazgos, de mayor a menor

1. Portada, en ambos anchos: falta la acción «empieza la guía». Los dos botones son «Entra al laboratorio» (#laboratorio) y «Ver el robot real» (#video). «Guía completa» solo está en el menú, que a 360 está plegado.
2. Portada a 360: el robot 3D, la otra acción de la primera visita, queda cortado por el borde inferior y solo se ve el disco superior. Sus controles aparecen antes de que se entienda para qué sirven.
3. Portada: nada muestra al robot explorando solo. El titular lo dice, pero la imagen es un robot quieto (a 1280 el modelo gira, no explora) y no se dibuja ningún mapa. `img/mapa-crece.mp4` existe más abajo, sin reproducción automática.
4. Portada a 360: 27 pantallas de alto y 22 `<mark>`, el primero en la pantalla 0,6. El tramo más largo sin nada interactivo mide 16,6 pantallas, desde la pantalla 10,5.
5. control.html a 360: 56 pantallas de alto. El primer interactivo real es un vídeo en la pantalla 7,0 y el comparador deslizante está en la 33,4. El tramo de texto más largo mide 8,2 pantallas. Tiene 8 marcas: 4 en las primeras 3 pantallas y luego huecos de 5 a 17 pantallas.
6. mapeo.html a 360: 53 pantallas de alto. El primer elemento interactivo (ampliar imagen) está en 5,4, el primer vídeo en 23,1 y la primera animación en 35,0. El tramo de texto más largo mide 6,1 pantallas. 6 marcas, bien repartidas.
7. navegacion.html a 360: 24 pantallas. El primer elemento está en 3,3 y el tramo más largo mide 6,3. `costmap-crece.mp4` (8 s) y `exploracion-real.mp4` de mapeo se repiten al entrar en pantalla, con un botón Pausa visible. Cumple.
8. Portada a 1280: cuatro colores fuertes compiten en las pestañas del visor 3D (LiDAR verde azulado, Chasis amarillo, Electrónica verde, Ruedas rojo), junto al botón amarillo y las rayas amarillas del robot. A 360, la pantalla 1 es tranquila.
9. Movimiento: el texto y el modelo de la portada aparecen una vez con fundido (0,9 a 1 s, CSS). El modelo 3D gira de forma continua con control de pausa. Un spinner `.scan-loader` (1,8 s, infinito) seguía en el DOM y la revisión no pudo confirmar si se oculta. No parpadea nada en las capturas, aunque no se midió fotograma a fotograma.
10. Movimiento reducido: el modelo se detiene y las entradas son instantáneas, pero el botón de pausa del sensor desaparece, así que el giro no se puede reanudar. El spinner sigue con duración casi nula. Los vídeos siguen en pausa, lo cual es correcto.

Contraste: no se midió. Las etiquetas pequeñas en mayúsculas de gris claro de la portada a 360 («UNA TESIS QUE PUEDES EXPLORAR», «ARRASTRA PARA GIRAR») son las que más probablemente fallen. No hay desbordamiento horizontal.

## Lo que no se pudo probar

- Contraste medido.
- Parpadeo mediante análisis fotograma a fotograma.
- El visor 3D en una GPU real.
- Un dispositivo táctil real.
- Uso del teclado en los controles.
