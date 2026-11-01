# Contenido de la portada: conservación y trazabilidad

La revisión V1.1 responde a la petición explícita de mantener las explicaciones durante la mejora visual. La fuente recuperada es `index.html` del commit `fcb47bdc0dc5c453e2576ddeda2f86d64991fb0d`.

## Criterio editorial

Cambiar la composición, la jerarquía y las interacciones debe conservar las ideas, las explicaciones, las cifras con sus denominadores, sus limitaciones y los enlaces a las fuentes. Una tarjeta o un objeto 3D complementa la explicación. Antes de retirar una explicación por motivos visuales, hay que encontrar una ubicación legible dentro de la experiencia y comprobar que siga accesible.

Los textos se renderizan en HTML estático. No requieren JavaScript, un gesto sobre el modelo 3D, abrir un acordeón o descargar otro documento. El índice permite llegar directamente a las secciones. Los modelos de percepción siguen identificados como ilustrativos y sus métricas no se presentan como resultados de la tesis.

## Ubicación del contenido recuperado

| Contenido anterior | Ubicación actual | Matiz conservado |
|---|---|---|
| Propósito de la guía, título de tesis y autoría | `#experiencia`, `#guia-abierta` | Robot de bajo costo, ROS 2, evidencia y fuentes |
| Percibir, estimar, decidir y moverse | `#ciclo` | Plano horizontal, ruedas a 30 Hz, revisión de destino cada 3,3 s |
| Definiciones que antes usaban ventanas emergentes | `#guia-abierta`, `#ciclo`, nota de software en `#video` | ROS 2, odometría, frontera, LiDAR, Nav2 y explore_lite |
| Reparto entre procesadores y figura 2.1 | `#ciclo` | Trabajo a bordo, estación de trabajo y red Wi-Fi; nota sobre el bloque PID que opera como PI |
| Explicación de la simulación completa de exploración | Final de `#ciclo` | Enlace a `exploracion.html#simulador`; no confundir con el laboratorio de percepción nuevo |
| Video del prototipo y lectura de RViz | `#video` | Demostración real y significado de la ruta verde; enlace a YouTube |
| 5 de 6 exploraciones | `#video` | Finalizar al no quedar fronteras; no equivale a éxito al navegar a destinos fijos |
| 3,63 % de odometría | `#video` | Comparación con cinta, recta de dos metros, cinco repeticiones |
| 444 643 pesos y comparación de costo | `#video` | Materiales montados, 32 % menos, prestaciones diferentes; comparación histórica de la tesis |
| Software del robot | `#video` | ROS 2, SLAM Toolbox, Nav2, explore_lite y Gazebo; enlace de replicación |
| Crecimiento del mapa y 3,50 m² | `#video` | Video original; área libre mapeada media de los ensayos |
| 2/4 objetivos, 62,2 % de cobertura, 53/54 abortos y 7,18 % de déficit | `#cifras` | Objetivos parciales, dependencia del tamaño de imagen, reemplazo de metas y distinción entre errores |
| Lo que no se midió | `#cifras` | Destinos fijos y localización sobre mapa guardado; falta de indicador cuantitativo propio |
| Diez capítulos | `#temas` | Títulos, descripciones completas, niveles y tres grupos |
| Mina El Teniente, CERBERUS y Perseverance | `#mundo` | Explicaciones y enlaces a los casos y sus fuentes originales |
| Diez lecciones de ingeniería | `#lecciones` | Título y explicación de cada una |
| Tres preguntas destacadas | `#preguntas` | Niveles y enlaces a respuestas; acceso a las 106 preguntas |
| Cuatro rutas de lectura | `#rutas` | Secuencia según tiempo, estudio, construcción o evaluación |
| Propósito, fuentes, citación y abstract | `#sobre` | Procedencia y enlaces originales |
| Laboratorio de análisis de CSV | `#sobre` | Cálculo local, fórmulas, condiciones y límites de interpretación |

## Archivos editables

- `web/src/pages/index.astro`: textos, figuras, cifras y composición de la portada.
- `web/src/lib/home-content.ts`: descripciones de capítulos, ciclo, lecciones y preguntas.
- `web/src/styles/experience.css`: presentación y adaptación a distintos anchos.
- `web/src/layouts/Shell.astro`: navegación compartida y pie.

Tras editar, ejecutar `npm run build`, regenerar `datos/indice.js` con `python herramientas/indice.py` y comprobar con `python herramientas/verificar_sitio.py`. El archivo `index.html` de la raíz es una salida generada.
