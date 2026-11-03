# Informe técnico: robot negro y amarillo con acercamiento, color por tema y resaltado, sobre c1def7a

Esta revisión corrige la falla de GitHub Actions sobre `c1def7a`, muestra el robot 3D de la portada con sus colores reales y sin la X del panel de la cámara, le agrega acercamiento al visor, rehace la parte de abajo del visor, lista las 16 partes de la guía en la portada y da un color a cada parte para resaltar sus palabras clave en todo el sitio. Las frases clave de los párrafos se resaltan como con un marcador cuando llegan a la pantalla. Las cifras, fórmulas, citas, tablas experimentales, el estado académico y los pendientes del autor no cambian. La tesis sigue en revisión por comité.

Base: `c1def7a03ef3dce222bf8d6a2df21b093f020508` de `main`. Son tres commits sobre `main`. El informe anterior está en `historial/informe-tecnico-0e148bb.md`.

## Lo que pidió el autor

1. La portada mostraba solo 10 temas.
2. El robot 3D se veía gris y no negro con líneas amarillas, y donde va la cámara RGB el chasis mostraba una forma de X.
3. El sitio se veía apagado. Hacía falta más color para resaltar las palabras clave en todo el contenido.
4. La parte de abajo del modelo 3D se veía mal.
5. Faltaba acercamiento para observar las partes del modelo.
6. Durante el trabajo pidió además números más grandes en la lista de temas, un resaltado que se dibuje en los párrafos de todo el sitio y revisar los errores de la ejecución de GitHub Actions, que adjuntó.

## Errores de GitHub Actions

La ejecución sobre `c1def7a` corrió en Ubuntu 26.04 con Playwright 1.64.1 y Chrome for Testing 156.0.8078.4. Pasaron los datos, la compilación, los modelos numéricos y las suites de control, mapeo, movimiento, laboratorio, robustez, evidencia y la general, con sus 654 comprobaciones. Falló `pruebas_experiencia_navegador.py`, en la prueba de títulos con la fuente de respaldo:

> entre 320 y 480 px, el título de cada tema ocupa las mismas líneas con el respaldo (Archivo Respaldo) que con Archivo en 327 de 336 casos

La prueba bloquea las fuentes web, mide la altura del título de las 16 páginas cada 8 px entre 320 y 480 px y la compara con la de Archivo. Acepta hasta 3 diferencias. En CI hubo 9: `bibliografia.html` a 384 px, `exploracion.html` a 384, `movimiento.html` a 456, 464, 472 y 480, `preguntas.html` a 320, `problema.html` a 416 y `robot.html` a 328. En este entorno, con Chrome 153 y la misma Liberation Sans 2.1.5, había una sola, `robot.html` a 328.

Chrome 156 no se pudo descargar aquí: el proxy rechaza `cdn.playwright.dev` y `storage.googleapis.com`. Para encontrar la causa se repitió la medición en Chrome 153 variando el tamaño de cada fuente:

| Cambio simulado en Chrome 153 | Diferencias | Coincide con CI |
|---|---:|---|
| Ninguno, respaldo al 94,8 % | 1 | 1 de 9 |
| Archivo un 1,6 % más ancha | 9 | 7 de 9, con 2 que CI no tiene |
| Respaldo al 95,6 % | 6 | 6 de 9 |
| Respaldo al 95,8 % | 9 | los mismos 9 casos |
| Respaldo al 96,0 % | 10 | 9 de 9, con 1 que CI no tiene |

Con el respaldo al 95,8 % Chrome 153 da exactamente los 9 casos de CI. En el caso de `robot.html` a 328 px el respaldo ocupa dos líneas y Archivo una, la misma dirección. La conclusión es que en el Chrome de CI Liberation Sans Bold resulta cerca de un 1 % más ancha. El `size-adjust` de `Archivo Respaldo` bajó en esa proporción, de 94,8 % a 94 %, y las alturas se recalcularon con la regla del comentario: 93,4 % y 22,4 %. Con HarfBuzz, sin navegador, la razón entre Archivo de peso 560 y Liberation Sans Bold en los 16 títulos es 94,5 %, entre los dos valores. En Chrome 153 quedan 3 diferencias, en el límite. En CI se esperan una o dos: es lo que da Chrome 153 con el respaldo al 95 %, que equivale al 94 % en el navegador de CI. Lo confirmará la próxima ejecución.

La compilación además mostraba dos avisos, que no hacían fallar el flujo:

1. Vite no encontraba las tres fuentes de la portada en `experience.css`, escritas como `/tesis_explain/fuentes/…`. Ahora se escriben `/fuentes/…`, que Vite encuentra en `web/public` y publica con el prefijo. El CSS compilado no cambia.
2. Un fragmento pasaba de 500 kB: es three.js, de unos 700 kB minificado, en su propio fragmento y solo para los visores 3D. `astro.config.mjs` sube el límite del aviso a 760 kB.

Los avisos de Node sobre `punycode` y de Git sobre el nombre de la rama vienen de las acciones de GitHub, no del sitio.

## Qué cambió

1. **Las 16 partes en la portada.** La lista de temas mostraba los 10 capítulos y la guía numera 16 partes en su índice lateral y en el menú. La portada suma los seis complementos, del 11 al 16, en un bloque «Para profundizar», con el mismo orden y los mismos títulos de `js/sitio.js`. El índice de la portada dice «Las 16 partes de la guía». Los números de la lista son grandes, de 30 a 40 px, con el color de su tema, y el nivel va en una etiqueta. En el índice lateral de la guía los números también crecen y llevan su color.
2. **Robot negro con franjas amarillas.** Había dos causas. En el CAD las cuatro franjas del frente son cuerpos dentro del compuesto de la carcasa, y la conversión pintaba todo ese compuesto de negro. Además, el mapeo de tonos ACES y la luz del entorno aclaraban el PLA negro hasta verse gris. `modelo_robot.py` suma un retoque que deja las franjas en su propio nodo, `cubierta__franjas`, con el amarillo de las fotos. La escena de la portada usa el mapeo de tonos neutro de Three.js, menos luz de entorno y una luz principal desde adelante y arriba, y en el tema oscuro sube la luz de contorno para separar el robot del fondo.
3. **Panel de la cámara sin X.** La simplificación de la malla había unido las esquinas del panel con el fondo del avellanado del lente. La cara frontal quedó como un embudo de triángulos largos, y su sombreado dibujaba una X. El retoque devuelve esos vértices al plano del frente, a 0,195 m del eje, y el lente queda visible por el agujero. Después recalcula las normales de todo el modelo con grupos de suavizado de 35°, así también desaparecen las sombras en V que había al pie de la carcasa.
4. **Tapa sin huecos.** Parte de la tapa superior tenía las caras hacia adentro y, con una sola cara, desde arriba se veía el interior. Los materiales del modelo se marcan como de dos caras.
5. **Retoque reproducible.** El retoque corre sobre el modelo comprimido, así se puede aplicar sin el STEP con `python3 herramientas/modelo_robot.py --retoque` y da el mismo archivo que la conversión completa. Se ejecutó dos veces sobre el mismo archivo con resultado idéntico, byte a byte, y no se repite sobre un modelo ya retocado. El modelo pasa de 381 a 467 KB, por las normales separadas en las aristas vivas, y de 39 245 a 39 219 triángulos, porque se quitan 26 sin área.
6. **Acercamiento.** El visor acerca con los botones más y menos, con Ctrl y la rueda del ratón, que es también el pellizco de un panel táctil, con el gesto de Safari, con el pellizco en el teléfono y, con el foco en el modelo, con las teclas más y menos. Las flechas giran el modelo y cero vuelve a la vista completa, igual que el botón «Ver todo el robot». Acerca hacia el puntero y el centro de giro no se aleja más de 30 cm del robot. La rueda sola sigue desplazando la página y aparece un aviso que explica que el acercamiento va con Ctrl. La etiqueta de arriba dice cuántas veces está más cerca, de ×1,0 a ×5,1.
7. **La pieza elegida.** Elegir una pieza en las pestañas o tocándola en el modelo acerca la cámara a ella, desde un ángulo pensado para esa pieza. La electrónica y los motores quedan dentro de la carcasa: al elegir la electrónica o las ruedas, la carcasa se vuelve transparente y deja ver dónde va cada pieza. El aro de la pieza tiene el color de su pestaña. Los botones de acercamiento quedan encima del modelo, y un toque en ellos ya no elige la pieza que está debajo.
8. **La parte de abajo del visor.** El disco claro bajo el robot se cortaba contra el borde del lienzo y los botones quedaban encima. Ahora el piso son anillos de barrido que se desvanecen, con una sombra de contacto, y el lienzo se funde hacia abajo y hacia los lados, así nada se corta aunque se gire o se acerque. Despiece, punto de vista y pausa van en una sola barra. Las cuatro pestañas llevan el color de cada pieza, y la descripción suma dos datos de cada una, como «RPLidar A1» o «Radio de rueda 33,5 mm», que salen de la tesis, de `robot.html` y de las medidas del CAD.
9. **Color por tema.** `css/marco.css` define siete colores con su fondo, para el tema claro y el oscuro: turquesa percibir, naranja estimar el avance, violeta decidir, azul moverse, amarillo el robot, frambuesa la evidencia y verde el contexto. Cada página toma el suyo de `data-pagina` y cada fila de la guía, de `data-pag`. En la guía lo usan la franja de la cabecera del tema, la raya bajo el título y sobre cada sección, los términos con definición, las cifras, los números del índice lateral y del menú y la parte actual. En la portada cada sección tiene su color en el título, las cifras y los números, y los cuatro pasos del ciclo llevan los colores de sus temas. El botón principal usa el amarillo de las franjas. Los colores de los datos de las figuras no cambian, porque el texto los nombra. El texto de color llega a 4,5:1 o más sobre el papel y sobre su propio fondo en los dos temas.
10. **Resaltado que se dibuja al leer.** 80 frases clave de 15 páginas de la guía y 26 de la portada y los laboratorios van en `<mark>`. Solo se marcaron frases que ya estaban en el texto, sin cambiar una palabra. Las negritas de los párrafos se resaltan igual. `js/marco.js` dibuja el trazo de izquierda a derecha cuando el texto entra en la pantalla, línea por línea, y los de un mismo párrafo van uno tras otro. La bibliografía conserva sus negritas, que también se resaltan, porque su página se genera desde `datos/bibliografia.json`. El script del `<head>` marca la animación antes de pintar, y si `marco.js` no llega en tres segundos la quita. Sin JavaScript, con movimiento reducido o al imprimir, el resaltado ya está puesto.

## Archivos

| Área | Archivos |
|---|---|
| CI | `css/estilo.css`, `web/src/styles/experience.css`, `astro.config.mjs` |
| Modelo 3D | `herramientas/modelo_robot.py`, `modelos/robot.glb`, `modelos/README.md` |
| Visor de la portada | `web/src/lib/robot-three.ts`, `web/src/lib/robot-cad.ts`, `web/src/components/RobotHero.svelte`, `web/src/styles/experience.css` |
| Portada | `web/src/pages/index.astro`, `web/src/pages/laboratorios.astro`, `web/src/lib/home-content.ts` y las salidas compiladas en `index.html`, `laboratorios.html` y `_astro/` |
| Color y resaltado | `css/marco.css`, `css/estilo.css`, `js/marco.js`, `js/sitio.js`, `herramientas/plantillas/tema.html`, `web/src/generado/marco.json` y las 16 páginas de la guía |
| Datos | `datos/academico.json`, `datos/proyecto.js`, `datos/indice.js` |
| Verificación | `herramientas/verificar_sitio.py`, `herramientas/pruebas_redisenio_navegador.py` |
| Documentación | `README.md`, `docs/decisiones.md`, este informe |

## Pruebas ejecutadas

Entorno: Node 22.23.4, Python 3.13, Playwright 1.63.0 con Chromium 153. Se ejecutaron los pasos de `verificar.yml` en su orden, sobre el último commit. La columna Base repite la del informe anterior, medida sobre el mismo árbol de `c1def7a`.

| Verificación | Base | Revisión |
|---|---:|---:|
| `verificar_sitio.py` | 3 457 | 3 485 |
| `npm run check`, prueba LiDAR y compilación | correctas | correctas, sin avisos |
| `pruebas_compilacion.py` y `verificar_compilacion.py` | correctas | correctas |
| Ejemplos, figuras y PDF de preguntas al día | 5 de 5 | 5 de 5 |
| Pruebas numéricas en Node, ocho archivos | 207 | 207 |
| `pruebas_control_navegador.py` | 325 | 325 |
| `pruebas_mapeo_navegador.py` | 289 | 289 |
| `pruebas_movimiento_navegador.py` | 252 | 252 |
| `pruebas_laboratorio_navegador.py` | 233 | 233 |
| `pruebas_robustez_navegador.py` | 71 | 71 |
| `pruebas_evidencia_navegador.py` | 131 | 131 |
| `pruebas_navegador.py` | 654 | 654 |
| `pruebas_experiencia_navegador.py` | 69 | 69 |
| `pruebas_redisenio_navegador.py` | 44 | 57 |

Lo nuevo que comprueban:

- `verificar_sitio.py`: que la lista de la portada tenga las 16 partes con el orden y los títulos de `js/sitio.js`, cada una con su `data-pag`. Que el modelo tenga el nodo de las franjas en amarillo, la carcasa negra y todos sus materiales de dos caras. Que cada color de la paleta llegue a 4,5:1 sobre el papel y sobre su fondo, y la tinta sobre ese fondo, en los dos temas.
- `pruebas_redisenio_navegador.py`: que «Acercar» acerque, que «Ver todo el robot» vuelva a ×1,0, que el acercamiento tenga un límite y el botón se apague al llegar, que con el foco en el modelo más acerque y cero vuelva, que la rueda sola desplace la página y avise sin acercar, que Ctrl con la rueda acerque, que la electrónica acerque la cámara y vuelva transparente la carcasa del CAD y que el LiDAR la devuelva. Que sin JavaScript se vean las 16 partes y los resaltados puestos. Que en la portada y en `movimiento.html` el resaltado empiece vacío y se dibuje al llegar a la pantalla, y que con movimiento reducido ya esté puesto.
- `pruebas_experiencia_navegador.py`, sin cambios en la prueba: los títulos con el respaldo coinciden en 333 de 336 casos en Chrome 153, dentro del límite.

Además, fuera del flujo:

- axe-core 4.10.3 en las 18 páginas, a 390 y 1366 px, en el tema claro y en el oscuro, con los plegables abiertos y las reglas de WCAG 2.0, 2.1 y 2.2 en sus niveles A y AA: sin infracciones en las 72 combinaciones. También en la portada después de elegir la electrónica, acercar, usar la rueda, desmontar y elegir las ruedas, en los dos temas y a los dos anchos.
- La razón de anchos entre Archivo y Liberation Sans Bold en los 16 títulos, calculada con HarfBuzz, y la simulación del Chrome de CI descrita arriba.
- Revisión visual de la portada en los dos temas, en escritorio y teléfono: el modelo armado, de frente, desde arriba y en despiece, la electrónica y las ruedas con la carcasa transparente, la lista de temas, las secciones con color y el resaltado antes y después de dibujarse. Y de las páginas de mapeo, movimiento, robot, resultados, bibliografía, preguntas, recursos y laboratorios.

## Sin verificar

- Chrome 156, el de CI. La prueba de títulos debería pasar con margen, según la simulación. Lo confirmará la próxima ejecución de GitHub Actions.
- Teléfonos reales, el pellizco en una pantalla táctil real y lectores de pantalla.
- El gesto de acercar de Safari en macOS, que usa sus propios eventos.
- Lighthouse. El modelo pesa 86 KB más que antes y solo se descarga con WebGL.

## Notas para el autor

- El modelo sigue sin la pantalla del medidor de energía, que en la foto de arriba ocupa la ventana trasera derecha. El CAD trae la ventana pero no la pantalla, así que desde arriba se ve el interior por ese hueco.
- Las negritas de la bibliografía y de las preguntas que abren un párrafo, como «Dónde aparece.», llevan el color del tema sin resaltado, para que no se resalten cientos de etiquetas iguales.
