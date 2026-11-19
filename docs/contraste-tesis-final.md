# Contraste entre el sitio y la versión final de la tesis

Inventario de diferencias entre este sitio y la versión final de la tesis, hecho el 19 de noviembre de 2026. No se corrigió ninguna página: este documento solo lista qué coincide, qué cambió y qué necesita una decisión.

## Qué se comparó

- **Versión final:** PDF de 169 páginas entregado por el autor (`Trabajo de titulo Sebastian Valderas_vf_CORREGIDO_v2.pdf`), creado el 23 de octubre de 2026. El PDF no se guarda en el repositorio. Las páginas que se citan aquí son las del PDF. La numeración impresa va 17 páginas detrás (la Sec. 1.1 está en la p. 22 del PDF y en la p. 5 impresa).
- **Sitio:** las 18 páginas `*.html` de la raíz, `datos/*.json` (menos `bibliografia.json`, que se revisó aparte), `datos/ensayos/*.csv`, `datos/analisis/*.csv` y `datos/costos.csv`.
- **Método:** se extrajeron con un script, fuera del repositorio, las referencias («Sec.», «Tabla», «Fig.», «Anexo», «Capítulo», «Algoritmo», «Ec.») y las cifras con unidad, porcentajes, conteos y valores de tabla. Cada una se buscó en el texto del PDF (`pdftotext -layout`). Se comprobó también el número, la cita y las secciones de las 72 referencias bibliográficas, los 11 CSV celda por celda, los valores de `parametros.json`, los nombres de archivo y parámetros, y las frases del sitio que afirman que algo «no está publicado» o «no se midió».
- **Clases:** las cinco pedidas (igual, referencia cambiada, cifra distinta, ya no está en la versión final, no encontrado) más tres que hicieron falta. «Texto distinto» es una frase del sitio que contradice o ha quedado corta frente al PDF sin que cambie una cifra. «Igual (coincidencia débil)» es una cifra que aparece en el PDF pero que, por ser un entero corto o una unidad que el PDF escribe distinto, no se pudo atar al contexto. «Cálculo o dato ajeno a la tesis» es un ejemplo, un cálculo de la guía o un dato de otra fuente (NASA, ISO, documentación de Nav2).

## Resumen

La versión final coincide con el sitio en todas las cifras medidas. Las 11 tablas de datos coinciden celda por celda con las Tablas 5.3, 5.4, A4.5, A6.1 a A6.4, A7.1, A8.2, A8.3 y A8.4. Las 72 referencias bibliográficas, sus números y las secciones que las citan coinciden. No hay ninguna referencia a sección, tabla, figura, algoritmo o anexo que haya cambiado de número o desaparecido. Las diferencias reales están en frases del sitio que afirman que algo no está publicado y que la versión final sí publica, o que lo dicen con otras palabras (ver «Diferencias que necesitan decisión»).

### Conteo por clase

Cada referencia distinta por línea, cada cifra distinta por línea, cada celda de CSV, cada valor de JSON y cada ficha bibliográfica cuenta como un elemento.

| Clase | Elementos |
|---|---:|
| igual | 2029 |
| igual (coincidencia débil) | 764 |
| referencia cambiada | 0 |
| cifra distinta | 0 |
| ya no está en la versión final | 0 |
| texto distinto | 6 |
| no encontrado | 105 |
| cálculo o dato ajeno a la tesis | 69 |
| **Total** | **2973** |

### Conteo por página

| Página | igual | débil | ref. cambiada | cifra distinta | ya no está | texto distinto | no encontrado | cálculo/ajeno | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `bibliografia.html` | 310 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 310 |
| `control.html` | 167 | 133 | 0 | 0 | 0 | 0 | 0 | 24 | 324 |
| `exploracion.html` | 51 | 30 | 0 | 0 | 0 | 0 | 0 | 0 | 81 |
| `gemelo.html` | 34 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 38 |
| `index.html` | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| `laboratorio.html` | 21 | 4 | 0 | 0 | 0 | 0 | 0 | 1 | 26 |
| `laboratorios.html` | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| `lecciones.html` | 16 | 5 | 0 | 0 | 0 | 0 | 0 | 1 | 22 |
| `mapeo.html` | 113 | 93 | 0 | 0 | 0 | 4 | 0 | 15 | 225 |
| `movimiento.html` | 90 | 42 | 0 | 0 | 0 | 0 | 0 | 9 | 141 |
| `mundo-real.html` | 7 | 6 | 0 | 0 | 0 | 0 | 0 | 2 | 15 |
| `navegacion.html` | 63 | 21 | 0 | 0 | 0 | 0 | 0 | 6 | 90 |
| `preguntas.html` | 488 | 314 | 0 | 0 | 0 | 0 | 0 | 7 | 809 |
| `problema.html` | 14 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 25 |
| `recursos.html` | 30 | 34 | 0 | 0 | 0 | 0 | 1 | 1 | 66 |
| `replicar.html` | 65 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 79 |
| `resultados.html` | 85 | 33 | 0 | 0 | 0 | 2 | 0 | 0 | 120 |
| `robot.html` | 58 | 20 | 0 | 0 | 0 | 0 | 1 | 3 | 82 |
| `datos/academico.json` | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| `datos/analisis/estabilidad.csv` | 36 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 36 |
| `datos/analisis/intervalos.csv` | 28 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 28 |
| `datos/analisis/plano-iteraciones.csv` | 25 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 |
| `datos/analisis/plano.csv` | 55 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 55 |
| `datos/costos.csv` | 20 | 0 | 0 | 0 | 0 | 0 | 102 | 0 | 122 |
| `datos/ensayos/escalon.csv` | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 6 |
| `datos/ensayos/giro-real.csv` | 20 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 20 |
| `datos/ensayos/giro-simulacion.csv` | 25 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 |
| `datos/ensayos/mapeo.csv` | 26 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 26 |
| `datos/ensayos/metas.csv` | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 35 |
| `datos/ensayos/recta-2m-real.csv` | 25 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 |
| `datos/ensayos/recta-2m-simulacion.csv` | 20 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 20 |
| `datos/parametros.json` | 80 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 81 |
| `datos/planificacion.json` | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 |
| **Total** | **2029** | **764** | **0** | **0** | **0** | **6** | **105** | **69** | **2973** |

Quedaron fuera del conteo 27 referencias a secciones de obras externas que las notas al pie de `control.html`, `gemelo.html`, `lecciones.html`, `movimiento.html`, `navegacion.html`, `preguntas.html`, `recursos.html` y `resultados.html` dan para libros y artículos (por ejemplo «Åström y Hägglund, Secciones 3.4 a 3.6» o «NASA, Sec. 2.4»). Coinciden por casualidad con números de la tesis pero no la citan.

## Diferencias que necesitan decisión

1. **Parámetros de slam_toolbox (texto distinto, 4 frases).** `mapeo.html` (l. 259 a 267, sección «Conectar la explicación con la configuración del robot») dice que el YAML, el lanzamiento y los valores de `minimum_travel_distance` y `minimum_travel_heading` no están publicados y que los nombres de marcos deben contrastarse. La versión final los publica: el Anexo 5.4 (p. 146) nombra el nodo `async_slam_toolbox_node` y el archivo `mapper_params_online_async.yaml`, y la Tabla A5.3 (p. 147) da `odom_frame` odom, `map_frame` map, `base_frame` base_link, `scan_topic` /scan, `minimum_travel_distance` 0.05 m, `minimum_travel_heading` 0.05 rad, `map_update_interval` 1.0 s, `transform_publish_period` 0.02 s y `max_laser_range` 10.0 m. El archivo YAML completo sí sigue sin estar en el repositorio, así que la frase correcta sería «los valores principales están en la tesis, el archivo no se publica». `loop_search_maximum_distance` y `loop_match_minimum_response_fine` siguen sin aparecer en la tesis.
2. **Estados de la Tabla 5.5 (texto distinto, 2 frases).** `resultados.html` (l. 128 y 130) escribe SLAM como «Verificado y caracterizado cuantitativamente» y Exploración como «Verificada funcionalmente». La Tabla 5.5 (p. 93) dice «Verificado funcionalmente y caracterizado cuantitativamente» y «Verificada funcionalmente en hardware real».
3. **Archivo `twist_mux.yaml` (no encontrado).** `recursos.html` (l. 248) lo presenta entre los archivos que cita el Anexo 9. La Tabla A9.1 (pp. 161 a 163) no lo lista. `twist_mux` aparece solo como paquete en la p. 125.
4. **Desglose de costos por compra (no encontrado).** `datos/costos.csv` y los gráficos de `robot.html` (l. 233 a 236) usan los montos de cada compra. La Tabla A1.1 (p. 118) solo trae los montos por partida. Las 17 partidas, los 3 subtotales y los 2 totales (444 643 y 582 447 CLP) coinciden. Los montos por compra vienen del registro del autor y no se pueden verificar en el PDF.
5. **Dimensiones del plano del recinto (no encontrado).** `datos/parametros.json` guarda un ancho de 2.14 m y las coordenadas de muros y cotas. Salen del dibujo de la Fig. A8.1 (p. 157), no de una cifra escrita. El alto de 1.91 m y las distancias de la Tabla A8.3 sí coinciden. Hay que contrastar el dibujo contra la figura.
6. **«152 páginas» (igual, con aclaración).** El pie de todas las páginas y `datos/academico.json` dicen «octubre de 2026, 152 páginas». El PDF final tiene 169 páginas porque suma 17 preliminares sin numeración arábiga. La última página numerada es la 152, así que el texto es correcto si se entiende como páginas numeradas. Conviene decidir si el sitio debe decir «152 páginas numeradas» o «169 páginas».

## Cifras clave verificadas en el PDF

Búsqueda dirigida de las cifras que el sitio repite más veces. Las páginas son las del PDF donde aparece la cifra.

| Cifra del sitio | Páginas del PDF donde aparece | Clase |
|---|---|---|
| Error odométrico medio 3,63 % (n = 5) | 16, 17, 81, 93, 95, 96 | igual |
| Intervalo de confianza del error odométrico, 3,08 a 4,18 % | 93, 94 | igual |
| Error de seguimiento físico 7,18 % | 81, 96 | igual |
| Desviación simulada 3,39 % | 81, 96 | igual |
| Cobertura libre media 62,2 % | 16, 17, 90, 93, 95, 97, 98 | igual |
| Área libre media 3,50 m² | 16, 17, 90, 93, 95, 98, 100 | igual |
| Distancia media al plano 3,4 cm | 16, 17, 89, 93, 95, 97, 157 | igual |
| 60 metas generadas | 16, 90, 97, 98, 152 | igual |
| 54 abortadas | 16, 91, 93, 97, 98, 99 | igual |
| 53 asociadas a reemplazos | 16, 91, 93, 97, 98, 99, 145 | igual |
| 59 metas ejecutadas y 21,9 m | 93 | igual |
| Una meta completada | 16, 90, 97 | igual |
| Cinco metas sin estado terminal | 16 | igual |
| Cinco de seis ejecuciones con mapa válido | 16, 90, 92, 98 | igual |
| Reevaluación del explorador cada 3,3 s | 16, 17, 90, 91, 97 | igual |
| Referencia 0,13 m/s | 16, 17, 60, 70, 80, 83, 84, 85… | igual |
| Error estacionario de 0,002 m/s | 86, 143 | igual |
| Subida 10 a 90 %: 0,8 s y 1,4 s | 86, 89, 144, 146, 159 | igual |
| 1980 flancos por vuelta | 52, 53, 82, 129 | igual |
| Promedios de 1976 y 1969 pulsos | 129 | igual |
| Radio de rueda 0,0335 m | 53, 128 | igual |
| Separación 0,188 m | 53, 128 | igual |
| Giro máximo 0,35 rad/s | 60, 82, 128, 143, 144, 150 | igual |
| Margen de fase sin retardo, 56,9 grados | 142 | igual |
| Margen de fase en el escenario de 0,1 s: 44,1 | 142 | igual |
| Intervalo de la desviación angular, 1,8 a 21,6 | 94, 160 | igual |
| Exploraciones válidas 83,3 % (35,9 a 99,6) | 82, 94, 160 | igual |
| Costo del robot 444 643 CLP | 51, 118, 119 | igual |
| Costo del proyecto 582 447 CLP | 51, 118, 119 | igual |
| 68 % del gasto en 2024 | 118 | igual |
| Hasta 16,7 s entre metas en la iteración 1 | 152 | igual |
| Iteración 2 excluida: 5,09 min, 3,851 m, 14 metas | 151 | igual |
| Mínimo de 6 a 10 repeticiones válidas | 95, 102, 160 | igual |
| 72 referencias bibliográficas (la n.º 72 cierra la lista) | 114, 161 | igual |

## Novedades de la versión final sin presencia en el sitio

El proyecto no conserva el PDF de octubre, así que no se puede separar lo que es nuevo de lo que el sitio nunca cubrió. La lista contiene lo que la versión final tiene y el sitio no menciona con número. La tabla de contenido, el índice de tablas, el de ilustraciones y el de algoritmos de la versión final no traen capítulos, anexos ni tablas que el sitio contradiga: sus números coinciden con los que el sitio usa.

**Tablas sin referencia numerada en el sitio:** A2.1 «Resumen de elementos cinemáticos del modelo» (p. 122), A3.3 «Nodos iniciados por el lanzamiento en hardware real» (p. 125), A3.5 «Correspondencia entre parámetros del cuerpo e identificadores del código» (p. 128), A4.1 «Muestras del número de ticks por revolución» (p. 129), A9.1 «Localización y función de los archivos citados» (pp. 161 a 163). La Tabla A5.3 la cita el sitio solo desde la bibliografía y desde la pregunta sobre el cierre de lazo, no desde `mapeo.html`.

**Figuras sin referencia:** 3.1 publicación y suscripción (p. 37), 3.2 canales en cuadratura (p. 39), 3.3 lazo genérico de velocidad con PID (p. 43), A8.2 mapas de las cinco iteraciones alineados con el plano (p. 158).

**Algoritmos sin referencia:** 3.1 construcción del modelo URDF/xacro (p. 36) y 4.3 sintonización híbrida por identificación FOPDT y PSO (p. 69).

**Anexos sin referencia:** 1.1 costo de los materiales (p. 117), 3.2 nodos del lanzamiento (p. 124), 3.3 pines y dispositivos (p. 125), 3.6 identificadores de código (p. 127), 5.3 acciones de recuperación de Nav2 (p. 146), 5.5 parámetros y flujo de exploración (p. 148), 6.1 trayectoria rectilínea (p. 150), 6.2 protocolo angular (p. 151), 7.1 exploración por iteración (p. 152), 8.2 comparación cualitativa de mapas (p. 154). Varios de estos los cubre el sitio por su tabla (por ejemplo A6.x, A7.1, A5.2), solo que sin citar el anexo.

**Secciones sin referencia:** 3.1.1, 3.3.3, 3.4.1, 4.1.2, 4.2.4, 4.3.1, 4.3.4, 4.4.1, 4.4.2, 4.4.4 y 4.5.7.

**Cifras de la versión final que el sitio no recoge:** las desviaciones estándar de las Tablas 5.1 y 5.2 (2.04 % y 0.43 % en seguimiento, 5.8 con 1.61 % y 8.0 con 2.22 % en el giro, p. 81 y 82), la descomposición 0.067 m, 3.4 % de la referencia en la simulación (p. 81), la distancia de 3.851 m de la iteración excluida (p. 151), la frecuencia efectiva de 0.30003 Hz (pp. 148 y 149), el relleno de 20 a 30 % de la impresión 3D (p. 120) y el factor 2/1980 = 0.003173 rad/tick (p. 129).

## Tablas por página

Cada fila agrupa los elementos de una misma línea del HTML. «Ubicación» da la página, el ancla más cercana y la línea. Las filas con diferencia van primero. En las cifras, «p. N» es la página del PDF donde aparece el número. Cuando el número aparece en varias páginas se dan hasta tres.

### `bibliografia.html`

Elementos: igual 310.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| bibliografia.html#r-macenski2022 | Macenski et al. (2022): la tesis la cita en 1.1, 1.2, 2.1, 3.2 | N.º 29 en la bibliografía (p. 107)  Citada en 1.1, 1.2, 2.1, 3.2 | igual |
| bibliografia.html#r-noetic | Open Robotics (2025b): la tesis la cita en 1.2, 1.4.1, 2.1 | N.º 48 en la bibliografía (p. 110)  Citada en 1.2, 1.4.1, 2.1 | igual |
| bibliografia.html#r-yarp | YARP Developers (s.f.): la tesis la cita en 1.2 | N.º 72 en la bibliografía (p. 114)  Citada en 1.2 | igual |
| bibliografia.html#r-orocos | The Orocos Project (s.f.): la tesis la cita en 1.2 | N.º 63 en la bibliografía (p. 112)  Citada en 1.2 | igual |
| bibliografia.html#r-lcm | LCM Project (s.f.): la tesis la cita en 1.2 | N.º 26 en la bibliografía (p. 107)  Citada en 1.2 | igual |
| bibliografia.html#r-newans2023 | Newans (2023): la tesis la cita en intro, A3.1 | N.º 42 en la bibliografía (p. 109)  Citada en A3.1, Introducción | igual |
| bibliografia.html#r-newans2022a | Newans (2022a): la tesis la cita en intro, 4.3.3, 4.4.3, A3.1 | N.º 40 en la bibliografía (p. 109)  Citada en 4.3.3, 4.4.3, A3.1, Introducción | igual |
| bibliografia.html#r-newans2022b | Newans (2022b): la tesis la cita en 4.4, 4.4.3, A3.1, A4.5 | N.º 41 en la bibliografía (p. 109)  Citada en 4.4, 4.4.3, A3.1, A4.5 | igual |
| bibliografia.html#r-hbrc | Home Brew Robotics Club (s.f.): la tesis la cita en intro, 4.4.3, A3.1, A4.5 | N.º 19 en la bibliografía (p. 106)  Citada en 4.4.3, A3.1, A4.5, Introducción | igual |
| bibliografia.html#r-ros2control | ros-controls (s.f.): la tesis la cita en 4.3.3 | N.º 56 en la bibliografía (p. 111)  Citada en 4.3.3 | igual |
| bibliografia.html#r-amadi2024 | Amadi et al. (2024): la tesis la cita en A3.1 | N.º 2 en la bibliografía (p. 103)  Citada en A3.1 | igual |
| bibliografia.html#r-marcuslanzoni | marcuslanzoni (2020): la tesis la cita en 4.1.1 | N.º 32 en la bibliografía (p. 108)  Citada en 4.1.1 | igual |
| bibliografia.html#r-corke2023 | Corke (2023): la tesis la cita en 1.1, 3.1, 3.3.1, 3.4 | N.º 10 en la bibliografía (p. 104)  Citada en 1.1, 3.1, 3.3.1, 3.4 | igual |
| bibliografia.html#r-ferreira2023 | Ferreira et al. (2023): la tesis la cita en 1.1, 3.4 | N.º 13 en la bibliografía (p. 105)  Citada en 1.1, 3.4 | igual |
| bibliografia.html#r-rep103 | Foote y Purvis (2010): la tesis la cita en 3.1, 4.2.2 | N.º 14 en la bibliografía (p. 105)  Citada en 3.1, 4.2.2 | igual |
| bibliografia.html#r-rep105 | Meeussen (2010): la tesis la cita en 3.1, 4.2.2 | N.º 34 en la bibliografía (p. 108)  Citada en 3.1, 4.2.2 | igual |
| bibliografia.html#r-slamtec2020 | Shanghai Slamtec (2020): la tesis la cita en 3.3.1 | N.º 58 en la bibliografía (p. 112)  Citada en 3.3.1 | igual |
| bibliografia.html#r-astrom2009 | Åström y Hägglund (2006/2009): la tesis la cita en 3.6, 4.4.3, A4.4, A4.5, A4.6, A4.12 | N.º 3 en la bibliografía (p. 103)  Citada en 3.6, 4.4.3, A4.12, A4.4, A4.5, A4.6 | igual |
| bibliografia.html#r-wittenmark2002 | Wittenmark et al. (2002): la tesis la cita en 4.4.3, A4.12 | N.º 69 en la bibliografía (p. 113)  Citada en 4.4.3, A4.12 | igual |
| bibliografia.html#r-maxim2023 | Maxim y De Keyser (2023): la tesis la cita en 3.5, A4.6 | N.º 33 en la bibliografía (p. 108)  Citada en 3.5, A4.6 | igual |
| bibliografia.html#r-iqbal2023 | Iqbal (2023): la tesis la cita en A4.6 | N.º 21 en la bibliografía (p. 106)  Citada en A4.6 | igual |
| bibliografia.html#r-sundstrom2024 | Sundström et al. (2024): la tesis la cita en 4.4.3 | N.º 62 en la bibliografía (p. 112)  Citada en 4.4.3 | igual |
| bibliografia.html#r-raj2024 | Raj y Kos (2024): la tesis la cita en 4.4.3 | N.º 51 en la bibliografía (p. 111)  Citada en 4.4.3 | igual |
| bibliografia.html#r-bitria2022 | Bitriá y Palacín (2022): la tesis la cita en 4.4.3 | N.º 5 en la bibliografía (p. 103)  Citada en 4.4.3 | igual |
| bibliografia.html#r-casini2010 | Casini et al. (2010): la tesis la cita en 4.4.3 | N.º 7 en la bibliografía (p. 104)  Citada en 4.4.3 | igual |
| bibliografia.html#r-ma2024 | Ma et al. (2024): la tesis la cita en 4.4.3 | N.º 28 en la bibliografía (p. 107)  Citada en 4.4.3 | igual |
| bibliografia.html#r-mori2024 | Mori et al. (2024): la tesis la cita en 4.4.3 | N.º 36 en la bibliografía (p. 108)  Citada en 4.4.3 | igual |
| bibliografia.html#r-wu2026 | Wu et al. (2026): la tesis la cita en 4.4.3 | N.º 70 en la bibliografía (p. 113)  Citada en 4.4.3 | igual |
| bibliografia.html#r-sun2022 | Sun et al. (2022): la tesis la cita en 4.4.3 | N.º 61 en la bibliografía (p. 112)  Citada en 4.4.3 | igual |
| bibliografia.html#r-gokce2021 | Gökçe et al. (2021): la tesis la cita en 3.7.1, A4.10 | N.º 16 en la bibliografía (p. 105)  Citada en 3.7.1, A4.10 | igual |
| bibliografia.html#r-clerc2002 | Clerc y Kennedy (2002): la tesis la cita en 3.7.1, A4.8 | N.º 8 en la bibliografía (p. 104)  Citada en 3.7.1, A4.8 | igual |
| bibliografia.html#r-shi1998 | Shi y Eberhart (1998): la tesis la cita en 3.7.1 | N.º 59 en la bibliografía (p. 112)  Citada en 3.7.1 | igual |
| bibliografia.html#r-ran2025 | Ran et al. (2025): la tesis la cita en 1.3, 3.3.1 | N.º 52 en la bibliografía (p. 111)  Citada en 1.3, 3.3.1 | igual |
| bibliografia.html#r-tourani2022 | Tourani et al. (2022): la tesis la cita en 1.3 | N.º 65 en la bibliografía (p. 113)  Citada en 1.3 | igual |
| bibliografia.html#r-grisetti2007 | Grisetti et al. (2007): la tesis la cita en 1.3 | N.º 17 en la bibliografía (p. 105)  Citada en 1.3 | igual |
| bibliografia.html#r-kohlbrecher2011 | Kohlbrecher et al. (2011): la tesis la cita en 1.3 | N.º 24 en la bibliografía (p. 107)  Citada en 1.3 | igual |
| bibliografia.html#r-hess2016 | Hess et al. (2016): la tesis la cita en 1.3 | N.º 18 en la bibliografía (p. 105)  Citada en 1.3 | igual |
| bibliografia.html#r-macenski2021 | Macenski y Jambrecic (2021): la tesis la cita en 1.3, 2.1, 3.8, 4.5.1 | N.º 30 en la bibliografía (p. 107)  Citada en 1.3, 2.1, 3.8, 4.5.1 | igual |
| bibliografia.html#r-ngoc2023 | Ngoc et al. (2023): la tesis la cita en 1.3, 3.8, A8.3 | N.º 43 en la bibliografía (p. 109)  Citada en 1.3, 3.8, A8.3 | igual |
| bibliografia.html#r-trejos2022 | Trejos et al. (2022): la tesis la cita en 1.3, 5.3, A8.5, A8.6 | N.º 66 en la bibliografía (p. 113)  Citada en 1.3, 5.3, A8.5, A8.6 | igual |
| bibliografia.html#r-thrun2005 | Thrun et al. (2005): la tesis la cita en 3.8, 3.9 | N.º 64 en la bibliografía (p. 113)  Citada en 3.8, 3.9 | igual |
| bibliografia.html#r-macenski2023 | Macenski et al. (2023): la tesis la cita en 1.1, 1.3, 1.4, 2.1, 3.10 | N.º 31 en la bibliografía (p. 107)  Citada en 1.1, 1.3, 1.4, 2.1, 3.10 | igual |
| bibliografia.html#r-lavalle2006 | LaValle (2006): la tesis la cita en 1.4, 3.10 | N.º 25 en la bibliografía (p. 107)  Citada en 1.4, 3.10 | igual |
| bibliografia.html#r-karaman2011 | Karaman y Frazzoli (2011): la tesis la cita en 1.4 | N.º 22 en la bibliografía (p. 106)  Citada en 1.4 | igual |
| bibliografia.html#r-nav2docs | Nav2 Maintainers (2025): la tesis la cita en 1.4.1, 3.10 | N.º 39 en la bibliografía (p. 109)  Citada en 1.4.1, 3.10 | igual |
| bibliografia.html#r-nav2foxy | Nav2 Maintainers (2021): la tesis la cita en 5.4, A8.4 | N.º 38 en la bibliografía (p. 109)  Citada en 5.4, A8.4 | igual |
| bibliografia.html#r-nav2bringup | Nav2 Maintainers (s.f.): la tesis la cita en A8.3 | N.º 37 en la bibliografía (p. 108)  Citada en A8.3 | igual |
| bibliografia.html#r-kato2018 | Kato et al. (2018): la tesis la cita en 1.4.1 | N.º 23 en la bibliografía (p. 106)  Citada en 1.4.1 | igual |
| bibliografia.html#r-autoware | Autoware Foundation (2026): la tesis la cita en 1.4.1 | N.º 4 en la bibliografía (p. 103)  Citada en 1.4.1 | igual |
| bibliografia.html#r-ompl | Open Motion Planning Library Project (2026): la tesis la cita en 1.4.1 | N.º 45 en la bibliografía (p. 110)  Citada en 1.4.1 | igual |
| bibliografia.html#r-sucan2012 | Şucan et al. (2012): la tesis la cita en 1.4.1 | N.º 60 en la bibliografía (p. 112)  Citada en 1.4.1 | igual |
| bibliografia.html#r-yamauchi1997 | Yamauchi (1997): la tesis la cita en 1.4.2, 3.11 | N.º 71 en la bibliografía (p. 114)  Citada en 1.4.2, 3.11 | igual |
| bibliografia.html#r-liu2025 | Liu et al. (2025): la tesis la cita en 3.11, A8.6 | N.º 27 en la bibliografía (p. 107)  Citada en 3.11, A8.6 | igual |
| bibliografia.html#r-placed2023 | Placed et al. (2023): la tesis la cita en 1.4.2, 2.1, A8.6 | N.º 50 en la bibliografía (p. 110)  Citada en 1.4.2, 2.1, A8.6 | igual |
| bibliografia.html#r-alvarez2021 | Alvarez (2021): la tesis la cita en 1.4.2, 2.1, A3.1 | N.º 1 en la bibliografía (p. 103)  Citada en 1.4.2, 2.1, A3.1 | igual |
| bibliografia.html#r-horner2017 | Hörner (2017): la tesis la cita en 1.4.2, A3.1 | N.º 20 en la bibliografía (p. 106)  Citada en 1.4.2, A3.1 | igual |
| bibliografia.html#r-gazebo-classic | Open Source Robotics Foundation (2025): la tesis la cita en 1.5, 3.1.2 | N.º 49 en la bibliografía (p. 110)  Citada en 1.5, 3.1.2 | igual |
| bibliografia.html#r-gazebo | Open Robotics (2024): la tesis la cita en 1.5 | N.º 46 en la bibliografía (p. 110)  Citada en 1.5 | igual |
| bibliografia.html#r-gazebo-mig | Open Robotics (2025a): la tesis la cita en 1.5 | N.º 47 en la bibliografía (p. 110)  Citada en 1.5 | igual |
| bibliografia.html#r-webots | Cyberbotics (2025): la tesis la cita en 1.5 | N.º 11 en la bibliografía (p. 104)  Citada en 1.5 | igual |
| bibliografia.html#r-michel2004 | Michel (2004): la tesis la cita en 1.5 | N.º 35 en la bibliografía (p. 108)  Citada en 1.5 | igual |
| bibliografia.html#r-coppelia | Coppelia Robotics (2025): la tesis la cita en 1.5 | N.º 9 en la bibliografía (p. 104)  Citada en 1.2, 1.4.1, 1.5, 2.1, 3.1.2 | igual |
| bibliografia.html#r-rohmer2013 | Rohmer et al. (2013): la tesis la cita en 1.5 | N.º 55 en la bibliografía (p. 111)  Citada en 1.5 | igual |
| bibliografia.html#r-isaac | NVIDIA (2025): la tesis la cita en 1.5 | N.º 44 en la bibliografía (p. 110)  Citada en 1.5 | igual |
| bibliografia.html#r-devore2021 | Devore et al. (2021): la tesis la cita en 5.6, A8.6 | N.º 12 en la bibliografía (p. 104)  Citada en 5.6, A8.6 | igual |
| bibliografia.html#r-vincent2024 | Vincent et al. (2024): la tesis la cita en 5.6, A8.3, A8.6 | N.º 68 en la bibliografía (p. 113)  Citada en 5.6, A8.3, A8.6 | igual |
| bibliografia.html#r-cantwell2025 | Cantwell (2025): la tesis la cita en 5.6, A8.6 | N.º 6 en la bibliografía (p. 103)  Citada en 5.6, A8.6 | igual |
| bibliografia.html#r-francis2025 | Francis et al. (2025): la tesis la cita en A8.3 | N.º 15 en la bibliografía (p. 105)  Citada en A8.3 | igual |
| bibliografia.html#r-video | Valderas Neculqueo (2026): la tesis la cita en 5.4 | N.º 67 en la bibliografía (p. 113)  Citada en 5.4 | igual |
| bibliografia.html#r-tb3burger | ROBOTIS (2026a): la tesis la cita en A1.2 | N.º 53 en la bibliografía (p. 111)  Citada en A1.2 | igual |
| bibliografia.html#r-tb3waffle | ROBOTIS (2026b): la tesis la cita en A1.2 | N.º 54 en la bibliografía (p. 111)  Citada en A1.2 | igual |
| bibliografia.html#r-sii2024 | Servicio de Impuestos Internos (2024): la tesis la cita en A1.2 | N.º 57 en la bibliografía (p. 111)  Citada en A1.2 | igual |
| bibliografia.html (72 fichas) | Número y texto de la cita de las 72 referencias (datos/bibliografia.json) | Las 72 entradas existen con el mismo número en las pp. 103 a 114. En 9 el sitio omite la fecha de consulta o el mes, como declara su nota. | igual |
| bibliografia.html (fichas) | 107 menciones de Tablas, Figuras, Algoritmos, Anexos y Ecuaciones en las fichas | Todas existen en la versión final con el mismo número | igual |

### `control.html`

Elementos: igual 167, igual (coincidencia débil) 133, cálculo o dato ajeno a la tesis 24.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| control.html#sim-pid (l. 125) | «…simulador. Son ilustrativas, no mediciones del robot. Con solo P = 1200 la rueda se estabiliza en 0,068 m/s y…» [1200, 0,068 m/s, 0,062 m/s, 600, 2600, 0,83 s, 1500, 9000, +2 más] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| control.html#que-es-ciclo (l. 139) | «…hay entre ellos. Son inversos: T = 1/f. A 30 Hz, T = 1/30 s = 0,03333 s = 33,33…» [0,03333 s, 33,33 ms] | 0,03333 s: cálculo de la guía a partir de 30 Hz / 33,33 ms: cálculo de la guía a partir de 30 Hz, y la tesis da 33 ms | cálculo o dato ajeno a la tesis |
| control.html#hallazgo (l. 175) | «…de cada ganancia . Ejemplo numérico A 0,13 m/s la referencia es 40,76 ticks por ciclo y ROS 2 envía…» [40,76 ticks] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| control.html#enteros (l. 249) | «…recortan hacia cero al guardarse 1 . Si el incremento calculado es 0,9 PWM, se guarda 0 PWM: la orden…» [0,9 PWM, 0,9] | ejemplo numérico de la guía | cálculo o dato ajeno a la tesis |
| control.html#sim-truncamiento (l. 258) | «…error constante de 3 ticks/ciclo se calcula 0,9852 PWM por ciclo y se guarda 0. En diez ciclos, conservar» [0,9852 PWM, 9,852 PWM] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| control.html#sim-fopdt (l. 309) | «…143 PWM, el modelo de la rueda izquierda llega a 0,131 m/s y alcanza el 63 % de ese valor…» [0,131 m/s, 0,33 s, 0,127 m/s] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| control.html#resolucion (l. 382) | «…la velocidad con dos decimales, en pasos de 0,01 m/s, cerca de un 7,7 % de la referencia. Un sobreimpulso…» [7,7 %] | 0,01 m/s sobre 0,13 m/s, cálculo de la guía | cálculo o dato ajeno a la tesis |
| control.html#ticks (l. 385) | «…0,13 m/s la conversión da 40,76 ticks/ciclo y ROS 2 envía 40 al truncar. En el giro sobre el» [40,76 ticks, 10,32 ticks] | 40,76 ticks: 0,13 m/s por 313,56 ticks por ciclo y por m/s, cálculo de la guía / 10,32 ticks: cálculo de la guía | cálculo o dato ajeno a la tesis |
| control.html#criterios-estabilidad (l. 434) | «…lineal es un modo muy lento, con una constante de tiempo de unos 6,6 s a 33 ms por ciclo,…» [6,6 s] | 33 ms dividido por 1 menos 0,995, cálculo de la guía | cálculo o dato ajeno a la tesis |
| control.html (l. 83) | «…a una rueda que gire a 0,13 m/s no basta. Hay que medir, comparar y corregir decenas de» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html (l. 88) | «…de ambas ruedas del robot real a una referencia de 0,13 m/s, con las ganancias finales. Fig. 5.4 de la» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html#t-breve (l. 97) | «…Un PI que sigue 0,13 m/s» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html#t-breve (l. 98) | «…terminé de ajustar en el robot real. Con ellas, ambas ruedas siguen 0,13 m/s sin sobreimpulso apreciable dentro de lo…» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html#t-breve (l. 101) | «…y 1,4 s tiempo de subida de cada rueda, del 10 al 90» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| control.html#t-breve (l. 102) | «…a 57° margen de fase del modelo lineal sin retardo, con» [53, 57 °] | 53: p. 68, 70, 91 / 57 °: p. 68, 74, 96 | igual (coincidencia débil) |
| control.html#t-breve (l. 103) | «…ms por ciclo de control · unos 30 cálculos por» [33 ms, 30] | 33 ms: p. 64, 68, 127 / 30: p. 47, 53, 77 | igual (coincidencia débil) |
| control.html#error-estacionario (l. 117) | «…0,002 m/s de error. En la tesis ese promedio se calcula desde los 7 s 1 . La acción integral…» [7 s] | 7 s: p. 86, 136, 138 | igual (coincidencia débil) |
| control.html#sim-pid (l. 125) | «…0,068 m/s y queda un error de 0,062 m/s, el mismo que da la fórmula 0,13 / (1 + 0,000913…» [0,13, 10] | 0,13: p. 60, 70, 80 / 10: p. 27, 36, 40 | igual (coincidencia débil) |
| control.html#que-es-ciclo (l. 139) | «…dice cuánto tiempo hay entre ellos. Son inversos: T = 1/f. A 30 Hz, T = 1/30 s = 0,03333…» [30 Hz, 30, 33 ms, 10] | 30 Hz: p. 53, 127, 128 / 30: p. 47, 53, 77 / 33 ms: p. 64, 68, 127 / 10: p. 27, 36, 40 | igual (coincidencia débil) |
| control.html#que-es-ciclo (l. 144) | «…de la rueda Actualiza la corrección y el PWM, a 30 Hz nominales 33 ms» [30 Hz, 33 ms] | 30 Hz: p. 53, 127, 128 / 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| control.html#que-es-ciclo (l. 145) | «…para identificar el modelo Registra una muestra del ensayo, a 10 Hz 100 ms = 0,1» [100 ms, 0,1 s] | 100 ms: p. 80, 81, 87 / 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#que-es-ciclo (l. 146) | «…para regular la tensión media Otro reloj, distinto del ciclo de 33» [33 ms] | 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| control.html#continuo-discreto (l. 160) | «…para no confundirlas con las variables Kp, Ki y Kd del firmware 12» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| control.html#hallazgo (l. 168) | «…que mirar la ecuación y la memoria para saber qué acción producen 10 . Primero calcula una corrección y después…» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| control.html#hallazgo (l. 175) | «…es La regla con que el Arduino calcula, en cada ciclo programado de 33 ms, la orden PWM de cada…» [33 ms, 50, 0,13 m/s, 40] | 33 ms: p. 64, 68, 127 / 50: p. 67, 95, 110 / 0,13 m/s: p. 60, 70, 80 / 40: p. 57, 67, 109 | igual (coincidencia débil) |
| control.html#papeles (l. 200) | «…una suma de errores Si cada ciclo añade 1 PWM por un error que persiste, la contribución guardada va 1,» [1 PWM] | 1 PWM: p. 18, 19, 20 | igual (coincidencia débil) |
| control.html#kd-proporcional (l. 219) | «…ganancias definitivas, la ganancia proporcional equivalente es de 0,41 PWM por tick/ciclo en la izquierda y 0,40 en la derecha,…» [0,41 PWM, 42] | 0,41 PWM: p. 67, 141, 159 / 42: p. 59, 67, 104 | igual (coincidencia débil) |
| control.html#por-que-se-conservo (l. 226) | «…de control más usado en robótica, también en robots móviles 2 13 14 . La forma incremental se usa en…» [13, 14, 15, 16, 17, 18, 19] | 13: p. 30, 36, 61 / 14: p. 31, 36, 61 / 15: p. 32, 36, 61 / 16: p. 33, 36, 61 / 17: p. 34, 36, 61 / 18: p. 35, 36, 61 / 19: p. 36, 61, 77 | igual (coincidencia débil) |
| control.html#por-que-se-conservo (l. 227) | «…y concentrar el desarrollo en la navegación y la exploración 22 . Mantener un algoritmo por compatibilidad con el equipo» [22] | 22: p. 39, 61, 77 | igual (coincidencia débil) |
| control.html#por-que-se-conservo (l. 228) | «…eso también se adopta en implementaciones de referencia del PID 2 20 . Un PID posicional también puede tener esas» [20] | 20: p. 36, 37, 61 | igual (coincidencia débil) |
| control.html#por-que-se-conservo (l. 230) | «…4.4.3 de la tesis. La elección no responde a una comparación» [4.4] | 4.4: p. 44, 57, 58 | igual (coincidencia débil) |
| control.html#sim-memoria-windup (l. 238) | «…del manejo de la memoria, no de llamar «incremental» al controlador 11 . Más abajo puedes liberar la rueda y…» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| control.html#enteros (l. 249) | «…al guardarse 1 . Si el incremento calculado es 0,9 PWM, se guarda 0 PWM: la orden al motor no…» [0 PWM] | 0 PWM: p. 44, 45, 46 | igual (coincidencia débil) |
| control.html#ciclo (l. 253) | «…cada ciclo programado de 33 ms el firmware lee los encoders y calcula el error como» [33 ms, 50, 255 PWM] | 33 ms: p. 64, 68, 127 / 50: p. 67, 95, 110 / 255 PWM: p. 64, 129, 132 | igual (coincidencia débil) |
| control.html#sim-truncamiento (l. 257) | «…decimales o perderlos cada vez Ilustrativo Compara errores de 3 y 5 ticks/ciclo. Cambia el número de ciclos para ver…» [5 ticks] | 5 ticks: p. 22, 36, 37 | igual (coincidencia débil) |
| control.html#sim-truncamiento (l. 262) | «…con decimales, el estado integral siguió siendo un entero de 16 bits, y ahí aparecieron las pérdidas. Es un error…» [16] | 16: p. 33, 36, 61 | igual (coincidencia débil) |
| control.html#windup (l. 268) | «…motor puede recibir como máximo ±255 PWM. Si la rueda está trabada, sigue habiendo error de» [255 PWM] | 255 PWM: p. 64, 129, 132 | igual (coincidencia débil) |
| control.html#sim-windup (l. 272) | «…antes del tope y PWM aplicado limitado a ±255. La referencia es 0,13» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html#windup-tecnico (l. 277) | «…de los topes. Esto es integración condicional en ese estado aparte 10» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| control.html#windup-tecnico (l. 278) | «…entre la señal pedida y la aplicada para limitar su memoria 11» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| control.html#modelo (l. 293) | «…de PWM de 143 sin control y se registraron los encoders cada 0,1 s durante 10 s. Con esa respuesta…» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#modelo (l. 299) | «…de tiempo, qué tan rápido 0,3291 s 0,3485» [0,3291 s, 0,3485 s] | 0,3291 s: p. 139 / 0,3485 s: p. 139 | igual (coincidencia débil) |
| control.html#modelo (l. 302) | «…Los retardos estimados son menores que el período de captura de 0,1 s, así que se cuantizan a cero muestras:…» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#modelo (l. 306) | «…estudiar escenarios de retardo en el análisis de estabilidad 3 23 . Cualquier retardo menor que 0,1 s da el…» [23, 0,1 s] | 23: p. 40, 61, 77 / 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#sim-fopdt (l. 309) | «…143 PWM, el modelo de la rueda izquierda llega a 0,131 m/s y» [143 PWM, 0,07 s, 0,1 s] | 143 PWM: p. 138, 140, 160 / 0,07 s: p. 68 / 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#sim-enjambre (l. 325) | «…las generaciones, mecanismo propuesto por Shi y Eberhart 6 . Usa 50 partículas y 150 generaciones. El costo de cada…» [50] | 50: p. 67, 95, 110 | igual (coincidencia débil) |
| control.html#semilla (l. 336) | «…referencia de 0,13 m/s y mismo protocolo en el robot real. Con las ganancias» [0,13 m/s, 5.3, 5.4] | 0,13 m/s: p. 60, 70, 80 / 5.3: p. 70, 72, 80 / 5.4: p. 74, 76, 84 | igual (coincidencia débil) |
| control.html#cambios (l. 340) | «…sube entre 28 y 63 %, Kd baja entre 41 y 45 % y Ki sube varios órdenes» [28, 41] | 28: p. 45, 61, 77 / 41: p. 58, 68, 86 | igual (coincidencia débil) |
| control.html#por-que-ajustar (l. 345) | «…modelo Se identificó con un único escalón de 143 PWM y una estructura lineal que no tiene la zona muerta…» [143 PWM] | 143 PWM: p. 138, 140, 160 | igual (coincidencia débil) |
| control.html#por-que-ajustar (l. 347) | «…34,69 y 36,70, no son los que evaluó el costo, que los recortó a 25 en ambas ruedas. Según la…» [25] | 25: p. 42, 51, 57 | igual (coincidencia débil) |
| control.html#por-que-ajustar (l. 358) | «…Ko 50 50 50 50» [50] | 50: p. 67, 95, 110 | igual (coincidencia débil) |
| control.html#por-que-ajustar (l. 360) | «…mientras que el costo evalúa una copia recortada a la cota de» [25] | 25: p. 42, 51, 57 | igual (coincidencia débil) |
| control.html#resultado (l. 368) | «…las ganancias finales, ambas ruedas alcanzan la referencia de 0,13 m/s en el robot real, y la referencia se alcanza…» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html#resultado (l. 373) | «…estacionaria medida, desde los 7 s 0,128 m/s 0,130» [7 s] | 7 s: p. 86, 136, 138 | igual (coincidencia débil) |
| control.html#resultado (l. 375) | «…de subida del 10 al 90 % 0,8 s 1,4» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| control.html#resultado (l. 378) | «…5.3 de la tesis, calculada sobre la captura real con referencia de 0,13» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html#resolucion (l. 382) | «…medida. Por lo mismo no se informa un tiempo de establecimiento al 2 %. El 0,128 de la rueda izquierda…» [2 %] | 2 %: p. 18, 19, 20 | igual (coincidencia débil) |
| control.html#ticks (l. 385) | «…0,13 m/s la conversión da 40,76 ticks/ciclo y ROS 2 envía 40 al» [0,13 m/s, 40, 10] | 0,13 m/s: p. 60, 70, 80 / 40: p. 57, 67, 109 / 10: p. 27, 36, 40 | igual (coincidencia débil) |
| control.html#ticks (l. 387) | «…el control en un solo punto de operación, 0,13 m/s. En los giros sobre su eje, la referencia de cada…» [0,13 m/s, 41, 10, 40, 2 pulsos] | 0,13 m/s: p. 60, 70, 80 / 41: p. 58, 68, 86 / 10: p. 27, 36, 40 / 40: p. 57, 67, 109 / 2 pulsos: p. 18, 19, 20 | igual (coincidencia débil) |
| control.html#estabilidad (l. 398) | «…las ruedas sigan 0,13 m/s en una prueba muestra que el control funciona en ese» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| control.html#estabilidad (l. 399) | «…que su estabilidad es la de un PI clásico con iguales ganancias 2 21 . Un PI es adecuado para…» [21, 33 ms, 0,05] | 21: p. 38, 61, 77 / 33 ms: p. 64, 68, 127 / 0,05: p. 68, 88, 89 | igual (coincidencia débil) |
| control.html#criterios-estabilidad (l. 406) | «…veces podría crecer la ganancia del lazo? Se da en decibeles. 20 dB son 10 veces y 40 dB, 100» [20 dB, 10, 40 dB] | 20 dB: p. 36, 37, 61 / 10: p. 27, 36, 40 / 40 dB: p. 57, 67, 109 | igual (coincidencia débil) |
| control.html#criterios-estabilidad (l. 408) | «…Resume la robustez en un número. Sus valores típicos están entre 1,2 y 2,0, y 1 dividido por Ms es…» [1,2] | 1,2: p. 23, 25, 32 | igual (coincidencia débil) |
| control.html#criterios-estabilidad (l. 413) | «…sobre el retardo que conviene tener claro. Como la captura de 0,1 s no lo resuelve, el análisis se hizo…» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#criterios-estabilidad (l. 420) | «…Margen de fase 56,9° 53,4° 55,5°» [56,9 °, 53,4 °, 55,5 °] | 56,9 °: p. 142 / 53,4 °: p. 88, 90, 142 / 55,5 °: p. 142 | igual (coincidencia débil) |
| control.html#criterios-estabilidad (l. 424) | «…de sensibilidad con 0,1 s de» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#criterios-estabilidad (l. 426) | «…Margen de fase 44,1° 40,7° 42,9°» [44,1 °, 40,7 °, 42,9 °] | 44,1 °: p. 142 / 40,7 °: p. 142 / 42,9 °: p. 142 | igual (coincidencia débil) |
| control.html#criterios-estabilidad (l. 434) | «…es un modo muy lento, con una constante de tiempo de unos 6,6 s a 33 ms por ciclo, pero…» [33 ms] | 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| control.html#sim-estabilidad (l. 437) | «…la derecha, dentro del círculo de radio 1. Los márgenes de fase son 56,9° y 55,5°, los de ganancia 38,9…» [56,9 °, 55,5 °, 0,1 s, 44,1 °, 42,9 °] | 56,9 °: p. 142 / 55,5 °: p. 142 / 0,1 s: p. 68, 69, 70 / 44,1 °: p. 142 / 42,9 °: p. 142 | igual (coincidencia débil) |
| control.html#sim-estabilidad (l. 438) | «…Con la rueda izquierda y las definitivas, lleva el retardo de 0 a 0,1 s. Los polos siguen dentro del…» [0,1 s, 56,9 °, 44,1 °] | 0,1 s: p. 68, 69, 70 / 56,9 °: p. 142 / 44,1 °: p. 142 | igual (coincidencia débil) |
| control.html#barrido (l. 441) | «…rejilla de 625 combinaciones, con la ganancia de la planta entre 0,1 y 10 veces la identificada y su constante…» [0,1, 10, 0,05, 0,1 s, 4,4] | 0,1: p. 68, 69, 70 / 10: p. 27, 36, 40 / 0,05: p. 68, 88, 89 / 0,1 s: p. 68, 69, 70 / 4,4: p. 44, 57, 58 | igual (coincidencia débil) |
| control.html#barrido (l. 442) | «…En operación, el controlador diferencial limita la base a 0,13 m/s y 0,35 rad/s, así que cada rueda llega a…» [0,13 m/s, 0,25 m/s²] | 0,13 m/s: p. 60, 70, 80 / 0,25 m/s²: p. 143, 144 | igual (coincidencia débil) |
| control.html#no-lineal (l. 447) | «…está cargado El umbral cambia y puede ser asimétrico. Con Kp = 16, error de 3 e integral de 2,…» [16, 50, 14] | 16: p. 33, 36, 61 / 50: p. 67, 95, 110 / 14: p. 31, 36, 61 | igual (coincidencia débil) |
| control.html#tres-conjuntos (l. 453) | «…de ganancias Margen de fase sin retardo Margen de fase con 0,1 s Sensibilidad» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| control.html#tres-conjuntos (l. 455) | «…por el PSO 64° a 71° 53° a 62° 1,15 a» [64 °, 71 °, 53 °, 62 °] | 64 °: p. 81, 113, 118 / 71 °: p. 88, 114, 143 / 53 °: p. 68, 70, 91 / 62 °: p. 79, 112, 143 | igual (coincidencia débil) |
| control.html#tres-conjuntos (l. 456) | «…tras el ajuste en el robot 53° a 57° 41° a 44° 1,35 a» [53 °, 57 °, 41 °, 44 °] | 53 °: p. 68, 70, 91 / 57 °: p. 68, 74, 96 / 41 °: p. 58, 68, 86 / 44 °: p. 61, 68, 96 | igual (coincidencia débil) |
| control.html#tres-conjuntos (l. 457) | «…del firmware, Kp 20, Kd 12 y Ki 0 49° a 50° 35° hasta» [20, 12, 49 °, 50 °, 35 °] | 20: p. 36, 37, 61 / 12: p. 29, 36, 51 / 49 °: p. 66, 110, 118 / 50 °: p. 67, 95, 110 / 35 °: p. 52, 70, 71 | igual (coincidencia débil) |
| control.html#tres-conjuntos (l. 459) | «…la sensibilidad máxima queda fuera del intervalo típico de 1,2 a» [1,2] | 1,2: p. 23, 25, 32 | igual (coincidencia débil) |
| control.html (l. 88) | «…de ambas ruedas del robot real a una referencia de 0,13 m/s, con las ganancias finales. Fig. 5.4 de la» [Figura 5.4] | Figura 5.4 «Respuesta experimental en lazo cerrado del robot real con…» p. 85 | igual |
| control.html#modelo (l. 302) | «…A4.4 de la tesis. Los retardos estimados son menores que el período de captura de» [Tabla A4.4] | Tabla A4.4 «Salida registrada de una ejecución de SintonizacionAutomatica.py: modelo FOPDT…» p. 139 | igual |
| control.html#sim-fopdt (l. 313) | «…presento solo como ilustración porque el modelo no tiene la zona muerta ni los tipos enteros del firmware. Fig. A4.1 de la» [Figura A4.1] | Figura A4.1 «Identificación de los modelos FOPDT de ambas ruedas en…» p. 131 | igual |
| control.html#por-que-ajustar (l. 360) | «…A4.4 y 4.4 de la tesis. Las ganancias están en la escala interna del firmware. El script» [Tabla A4.4, Tabla 4.4] | Tabla A4.4 «Salida registrada de una ejecución de SintonizacionAutomatica.py: modelo FOPDT…» p. 139 / Tabla 4.4 «Ganancias definitivas del controlador codificadas en el firmware.» p. 67 | igual |
| control.html#resultado (l. 378) | «…5.3 de la tesis, calculada sobre la captura real con referencia de 0,13» [Tabla 5.3] | Tabla 5.3 «Indicadores de la respuesta al escalón en lazo cerrado,…» p. 86 | igual |
| control.html#criterios-estabilidad (l. 410) | «…del Anexo 4.12 de la tesis, con los valores típicos de Wittenmark, Åström y» [Anexo 4.12] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| control.html#criterios-estabilidad (l. 431) | «…A4.5 de la tesis, con las ganancias definitivas. En la izquierda se informa el» [Tabla A4.5] | Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 | igual |
| control.html#tres-conjuntos (l. 459) | «…4.12 de la tesis. Los rangos del PSO incluyen el Kd informado y el evaluado por el» [Anexo 4.12] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| control.html#f1 (l. 487) | «…Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Secciones 3.5 a 3.7, 4.4 y 5.2,…» [Sec. 3.5, Sec. 3.7, Sec. 4.4, Sec. 5.2, Anexo 4.2, Anexo 4.12, Tabla A4.5] | Sec. 3.5 «Identificación FOPDT» p. 42 / Sec. 3.7 «Sintonización de controladores PID mediante PSO» p. 44 / Sec. 4.4 «Firmware de bajo nivel en Arduino Nano» p. 62 / Sec. 5.2 «Evaluación del control de velocidad» p. 83 / Anexo 4.2 «Comparación ilustrativa entre PSO y sintonización Lambda» p. 129 / +2 más | igual |
| control.html#t-breve (l. 100) | «…m/s error estacionario máximo, en la rueda» [0,002 m/s] | 0,002 m/s: p. 86 | igual |
| control.html#t-breve (l. 101) | «…y 1,4 s tiempo de subida de cada rueda, del 10 al 90» [0,8, 1,4 s, 90 %] | 0,8: p. 86, 89, 144 / 1,4 s: p. 86 / 90 %: p. 86 | igual |
| control.html#sim-lazo-rueda (l. 113) | «…→ error en ticks/ciclo → doPID en el Arduino → orden PWM entre −255 y 255 → driver L298N y…» [255] | 255: p. 64, 129, 132 | igual |
| control.html#error-estacionario (l. 117) | «…rueda se estabiliza , no el error grande del arranque. Si se piden 0,130 m/s y el promedio final es…» [0,130 m/s, 0,128 m/s, 0,002 m/s] | 0,130 m/s: p. 86 / 0,128 m/s: p. 86 / 0,002 m/s: p. 86 | igual |
| control.html#sim-estacionario (l. 120) | «…0,130 m/s menos promedio 0,128 m/s: error estacionario de 0,002» [0,130 m/s, 0,128 m/s, 0,002 m/s] | 0,130 m/s: p. 86 / 0,128 m/s: p. 86 / 0,002 m/s: p. 86 | igual |
| control.html#sim-pid (l. 125) | «…queda un error de 0,062 m/s, el mismo que da la fórmula 0,13 / (1 + 0,000913 · 1200). Con…» [0,000913, 90 %] | 0,000913: p. 139 / 90 %: p. 86 | igual |
| control.html#que-es-ciclo (l. 139) | «…A 30 Hz, T = 1/30 s = 0,03333 s = 33,33 ms. El firmware calcula 1000 / 30 como…» [1000] | 1000: p. 86 | igual |
| control.html#que-es-ciclo (l. 145) | «…para identificar el modelo Registra una muestra del ensayo, a 10 Hz 100 ms = 0,1» [10 Hz] | 10 Hz: p. 120 | igual |
| control.html#hallazgo (l. 171) | «…u[k] = limitar(u[k−1] + Δu[k], −255,» [255] | 255: p. 64, 129, 132 | igual |
| control.html#hallazgo (l. 175) | «…por Ko = 50, la suma a la orden anterior y limita el resultado a ±255. Dónde verlo Un ciclo…» [255, 0,075, 14 ticks] | 255: p. 64, 129, 132 / 0,075: p. 67, 71, 86 / 14 ticks: p. 86 | igual |
| control.html#kd-proporcional (l. 219) | «…equivalente es de 0,41 PWM por tick/ciclo en la izquierda y 0,40 en la derecha, y el tiempo integral equivalente,…» [0,40, 40 ms] | 0,40: p. 67, 141, 157 / 40 ms: p. 67, 141 | igual |
| control.html#sim-truncamiento (l. 258) | «…error constante de 3 ticks/ciclo se calcula 0,9852 PWM por ciclo y se guarda 0. En» [3 ticks] | 3 ticks: p. 143 | igual |
| control.html#sim-truncamiento (l. 261) | «…tiene un efecto directo sobre Ki. En la rueda derecha, con Ki de 0,001, el producto de Ki por el…» [0,001, 1000 ticks, 0,075, 14 ticks, 0,045 m/s] | 0,001: p. 67, 71, 86 / 1000 ticks: p. 86 / 0,075: p. 67, 71, 86 / 14 ticks: p. 86 / 0,045 m/s: p. 86 | igual |
| control.html#sim-truncamiento (l. 263) | «…pequeño puede bajar esa memoria al truncar hacia cero. El umbral de 14 ticks describe el crecimiento desde cero con…» [14 ticks] | 14 ticks: p. 86 | igual |
| control.html#sim-windup (l. 272) | «…en m/s, PWM pedido antes del tope y PWM aplicado limitado a ±255. La referencia es 0,13» [255] | 255: p. 64, 129, 132 | igual |
| control.html#windup-tecnico (l. 277) | «…limita la nueva salida a ±255 antes de guardarla, de modo que el exceso calculado no» [255] | 255: p. 64, 129, 132 | igual |
| control.html#modelo (l. 293) | «…identificó un modelo de cada rueda. Se aplicó un escalón de PWM de 143 sin control y se registraron los…» [143, 10 s] | 143: p. 138, 140, 160 / 10 s: p. 69, 144, 148 | igual |
| control.html#modelo (l. 298) | «…cuánto responde (m/s por unidad de PWM) 0,000913» [0,000913, 0,000890] | 0,000913: p. 139 / 0,000890: p. 139 | igual |
| control.html#modelo (l. 300) | «…cuánta demora 0,0001 s 0,0692» [0,0001 s, 0,0692 s] | 0,0001 s: p. 70, 136 / 0,0692 s: p. 70, 136 | igual |
| control.html#modelo (l. 305) | «…estabiliza. La constante de tiempo es lo que tarda en recorrer el 63 % del camino hacia ese valor. El…» [63 %] | 63 %: p. 86, 140 | igual |
| control.html#modelo (l. 306) | «…0,1 s da el mismo costo de ajuste, y por eso el optimizador entregó 0,0692 s para la derecha y…» [0,0692 s, 0,0845 s] | 0,0692 s: p. 70, 136 / 0,0845 s: p. 136 | igual |
| control.html#sim-fopdt (l. 309) | «…PWM, el modelo de la rueda izquierda llega a 0,131 m/s y alcanza el 63 % de ese valor a…» [63 %, 0,42 s] | 63 %: p. 86, 140 / 0,42 s: p. 68, 142 | igual |
| control.html#sim-enjambre (l. 323) | «…la atracción hacia la mejor del enjambre. El factor de constricción 0,7298 y los coeficientes 2,05 son los del script…» [0,7298, 2,05] | 0,7298: p. 137, 138, 167 / 2,05: p. 138 | igual |
| control.html#sim-enjambre (l. 325) | «…escribí combina dos mejoras conocidas. Un factor de constricción de 0,7298, el valor que entrega la fórmula de Clerc y…» [0,7298, 2,05, 150] | 0,7298: p. 137, 138, 167 / 2,05: p. 138 / 150: p. 138, 167 | igual |
| control.html#semilla (l. 327) | «…y la derecha subía por tramos, con una detención cerca de 0,11 m/s. La explicación propuesta es que el modelo…» [0,11 m/s] | 0,11 m/s: p. 84 | igual |
| control.html#cambios (l. 340) | «…sube entre 28 y 63 %, Kd baja entre 41 y 45 % y Ki sube varios órdenes de» [63 %, 45 %] | 63 %: p. 86, 140 / 45 %: p. 86, 140 | igual |
| control.html#cambios (l. 342) | «…todo durante el arranque, cuando el error positivo alcanza al menos 14 ticks/ciclo, así que no se puede atribuir la…» [14 ticks] | 14 ticks: p. 86 | igual |
| control.html#por-que-ajustar (l. 345) | «…decimales, así que no reproduce la banda de insensibilidad de hasta 4 ticks/ciclo que tienen las ganancias» [4 ticks] | 4 ticks: p. 140 | igual |
| control.html#por-que-ajustar (l. 347) | «…su salida final ni fija una semilla. Por eso los Kd informados, 34,69 y 36,70, no son los que evaluó…» [34,69, 36,70] | 34,69: p. 137, 139, 140 / 36,70: p. 137, 139, 140 | igual |
| control.html#por-que-ajustar (l. 354) | «…Kp 12,48 16,00 10,10 16,42» [12,48, 16,00, 10,10, 16,42] | 12,48: p. 139 / 16,00: p. 67, 71 / 10,10: p. 139 / 16,42: p. 67, 71 | igual |
| control.html#por-que-ajustar (l. 355) | «…informado y cargado 34,69 20,30 36,70» [34,69, 20,30, 36,70, 20,05] | 34,69: p. 137, 139, 140 / 20,30: p. 67, 71 / 36,70: p. 137, 139, 140 / 20,05: p. 67, 71 | igual |
| control.html#por-que-ajustar (l. 356) | «…evaluado por el costo 25,00 no aplica 25,00 no» [25,00] | 25,00: p. 139 | igual |
| control.html#por-que-ajustar (l. 357) | «…Ki 0,00001 0,075 0,00001 0,001» [0,00001, 0,075, 0,001] | 0,00001: p. 139 / 0,075: p. 67, 71, 86 / 0,001: p. 67, 71, 86 | igual |
| control.html#resultado (l. 373) | «…estacionaria medida, desde los 7 s 0,128 m/s 0,130» [0,128 m/s, 0,130 m/s] | 0,128 m/s: p. 86 / 0,130 m/s: p. 86 | igual |
| control.html#resultado (l. 374) | «…Error estacionario 0,002 m/s 0,000 m/s» [0,002 m/s, 0,000 m/s] | 0,002 m/s: p. 86 / 0,000 m/s: p. 86, 143 | igual |
| control.html#resultado (l. 375) | «…de subida del 10 al 90 % 0,8 s 1,4» [90 %, 0,8 s, 1,4 s] | 90 %: p. 86 / 0,8 s: p. 86 / 1,4 s: p. 86 | igual |
| control.html#resolucion (l. 382) | «…firmware informa la velocidad con dos decimales, en pasos de 0,01 m/s, cerca de un 7,7 % de la referencia.…» [0,01 m/s, 0,128] | 0,01 m/s: p. 84, 85, 143 / 0,128: p. 86 | igual |
| control.html#ticks (l. 385) | «…ticks/ciclo y ROS 2 envía 40 al truncar. En el giro sobre el eje a 0,35 rad/s, la magnitud estimada…» [0,35 rad/s] | 0,35 rad/s: p. 60, 82, 128 | igual |
| control.html#ticks (l. 387) | «…En los giros sobre su eje, la referencia de cada rueda es de unos 10 ticks/ciclo en vez de unos…» [10 ticks] | 10 ticks: p. 143 | igual |
| control.html#ticks (l. 391) | «…En esa simulación las ganancias finales muestran sobreimpulsos de 10,7 % a 15,6 %. Esos números vienen de un modelo…» [10,7 %, 15,6 %] | 10,7 %: p. 85, 99 / 15,6 %: p. 85, 99 | igual |
| control.html#estabilidad (l. 399) | «…33 ms multiplicado por la frecuencia de cruce del lazo da cerca de 0,07, dentro del intervalo de 0,05 a…» [0,07, 0,14] | 0,07: p. 68 / 0,14: p. 68 | igual |
| control.html#criterios-estabilidad (l. 406) | «…ganancia del lazo? Se da en decibeles. 20 dB son 10 veces y 40 dB, 100» [100] | 100: p. 80, 81, 87 | igual |
| control.html#criterios-estabilidad (l. 408) | «…la robustez en un número. Sus valores típicos están entre 1,2 y 2,0, y 1 dividido por Ms es la…» [2,0] | 2,0: p. 68, 137, 138 | igual |
| control.html#criterios-estabilidad (l. 419) | «…magnitud de los polos 0,947 0,995» [0,947, 0,995, 0,950] | 0,947: p. 142 / 0,995: p. 142 / 0,950: p. 142 | igual |
| control.html#criterios-estabilidad (l. 421) | «…de ganancia 38,9 dB 38,9 dB 39,4» [38,9 dB, 39,4 dB] | 38,9 dB: p. 142 / 39,4 dB: p. 142 | igual |
| control.html#criterios-estabilidad (l. 422) | «…de retardo 0,45 s 0,42 s 0,44» [0,45 s, 0,42 s, 0,44 s] | 0,45 s: p. 142 / 0,42 s: p. 68, 142 / 0,44 s: p. 142 | igual |
| control.html#criterios-estabilidad (l. 423) | «…Sensibilidad máxima Ms 1,35 1,39 1,38» [1,35, 1,39, 1,38] | 1,35: p. 68, 142 / 1,39: p. 137, 142 / 1,38: p. 142 | igual |
| control.html#criterios-estabilidad (l. 425) | «…magnitud de los polos 0,961 0,995» [0,961, 0,995, 0,964] | 0,961: p. 142 / 0,995: p. 142 / 0,964: p. 142 | igual |
| control.html#criterios-estabilidad (l. 427) | «…de ganancia 13,4 dB 13,1 dB 13,3» [13,4 dB, 13,1 dB, 13,3 dB] | 13,4 dB: p. 142 / 13,1 dB: p. 142 / 13,3 dB: p. 142 | igual |
| control.html#criterios-estabilidad (l. 428) | «…de retardo 0,35 s 0,32 s 0,34» [0,35 s, 0,32 s, 0,34 s] | 0,35 s: p. 142 / 0,32 s: p. 142 / 0,34 s: p. 142 | igual |
| control.html#criterios-estabilidad (l. 429) | «…Sensibilidad máxima Ms 1,78 1,85 1,81» [1,78, 1,85, 1,81] | 1,78: p. 142 / 1,85: p. 68, 142 / 1,81: p. 142 | igual |
| control.html#criterios-estabilidad (l. 434) | «…dentro del círculo, con y sin retardo, y la sensibilidad máxima, de 1,35 a 1,85, queda dentro del intervalo típico.…» [1,35, 1,85, 0,995] | 1,35: p. 68, 142 / 1,85: p. 68, 142 / 0,995: p. 142 | igual |
| control.html#sim-estabilidad (l. 437) | «…y sin retardo, el polo más lejano del origen tiene magnitud 0,947 en la izquierda y 0,950 en la derecha,…» [0,947, 0,950, 38,9, 39,4 dB, 1,35, 1,38, 1,78, 1,81, +1 más] | 0,947: p. 142 / 0,950: p. 142 / 38,9: p. 142 / 39,4 dB: p. 142 / 1,35: p. 68, 142 / 1,38: p. 142 / 1,78: p. 142 / 1,81: p. 142 / +1 más | igual |
| control.html#sim-estabilidad (l. 438) | «…se acerca al punto −1. Marca Ki como lineal. Aparece un polo en 0,995, casi sobre el círculo: es lento,…» [0,995, 4,7, 2,18] | 0,995: p. 142 / 4,7: p. 74, 75, 129 / 2,18: p. 144 | igual |
| control.html#barrido (l. 441) | «…script también recorre una rejilla de 625 combinaciones, con la ganancia de la planta entre 0,1 y 10 veces la» [625 combinaciones, 3 s, 2,8] | 625 combinaciones: p. 142 / 3 s: p. 143 / 2,8: p. 143 | igual |
| control.html#barrido (l. 442) | «…operación, el controlador diferencial limita la base a 0,13 m/s y 0,35 rad/s, así que cada rueda llega a unos…» [0,35 rad/s, 0,16 m/s, 51 ticks, 180, 255] | 0,35 rad/s: p. 60, 82, 128 / 0,16 m/s: p. 143 / 51 ticks: p. 143 / 180: p. 126, 143 / 255: p. 64, 129, 132 | igual |
| control.html#no-lineal (l. 446) | «…el estado integral en cero, eso deja sin corregir errores de hasta 3 ticks/ciclo con las ganancias definitivas y de…» [3 ticks, 0,01 m/s, 0,002, 0,000 m/s] | 3 ticks: p. 143 / 0,01 m/s: p. 84, 85, 143 / 0,002: p. 86, 143 / 0,000 m/s: p. 86, 143 | igual |
| control.html#no-lineal (l. 448) | «…baja velocidad pesa más En un giro sobre el eje a 0,35 rad/s cada rueda opera cerca de 10 ticks/ciclo.…» [0,35 rad/s, 10 ticks, 30 %] | 0,35 rad/s: p. 60, 82, 128 / 10 ticks: p. 143 / 30 %: p. 120, 143 | igual |
| control.html#tres-conjuntos (l. 455) | «…por el PSO 64° a 71° 53° a 62° 1,15 a» [1,15, 1,52] | 1,15: p. 143 / 1,52: p. 143 | igual |
| control.html#tres-conjuntos (l. 456) | «…tras el ajuste en el robot 53° a 57° 41° a 44° 1,35 a» [1,35, 1,85] | 1,35: p. 68, 142 / 1,85: p. 68, 142 | igual |
| control.html#tres-conjuntos (l. 457) | «…del firmware, Kp 20, Kd 12 y Ki 0 49° a 50° 35° hasta» [2,18] | 2,18: p. 144 | igual |
| control.html#tres-conjuntos (l. 459) | «…la sensibilidad máxima queda fuera del intervalo típico de 1,2 a» [2,0] | 2,0: p. 68, 137, 138 | igual |
| control.html#tres-conjuntos (l. 462) | «…sintonía, que no aplica el retardo, predice con ellas una subida de 0,8 y 1,1 s. En el robot, la…» [0,8, 1,1 s, 0,12 m/s, 6 s, 10 %, 16 %] | 0,8: p. 86, 89, 144 / 1,1 s: p. 144 / 0,12 m/s: p. 84, 144 / 6 s: p. 84, 144, 145 / 10 %: p. 86, 144 / 16 %: p. 144 | igual |
| control.html#ayuda-pie (l. 535) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| control.html#ayuda-pie (l. 536) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| control.html#search-results (l. 546) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `exploracion.html`

Elementos: igual 51, igual (coincidencia débil) 30.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| exploracion.html#t-breve (l. 95) | «…sin cancelar la anterior , que Nav2 cierra como abortada. Por eso 53 de las 54 metas abortadas cumplen un…» [53] | 53: p. 68, 70, 91 | igual (coincidencia débil) |
| exploracion.html#t-breve (l. 98) | «…de 54 metas abortadas coinciden en el tiempo con un» [53] | 53: p. 68, 70, 91 | igual (coincidencia débil) |
| exploracion.html#t-breve (l. 100) | «…veces que el explorador vació su lista negra en las» [17] | 17: p. 34, 36, 61 | igual (coincidencia débil) |
| exploracion.html#explore-lite (l. 126) | «…Descarta las menores de 0,05 m, o sea, basta una» [0,05 m] | 0,05 m: p. 88, 89, 144 | igual (coincidencia débil) |
| exploracion.html#dos-fronteras (l. 134) | «…acepta solo regiones de tamaño parecido al robot. Con un mínimo de 0,05 m se acepta incluso una celda» [0,05 m] | 0,05 m: p. 88, 89, 144 | igual (coincidencia débil) |
| exploracion.html#abortadas (l. 153) | «…las cinco exploraciones válidas se generaron 60 metas. A primera vista el resultado es alarmante. 54 quedaron» [60 metas, 54] | 60 metas: p. 90, 97, 98 / 54: p. 71, 90, 91 | igual (coincidencia débil) |
| exploracion.html#abortadas (l. 156) | «…las 60 metas de las cinco corridas válidas, 54 quedaron registradas» [60 metas, 54] | 60 metas: p. 90, 97, 98 / 54: p. 71, 90, 91 | igual (coincidencia débil) |
| exploracion.html#reemplazo (l. 161) | «…se ve un reemplazo en el tiempo Interactivo Reproduce 20 segundos con el período del explorador. Abajo, el» [20, 60 metas] | 20: p. 36, 37, 61 / 60 metas: p. 90, 97, 98 | igual (coincidencia débil) |
| exploracion.html#reemplazo (l. 162) | «…3,3 s se envía una meta nueva y la anterior queda abortada. De 60 metas, 53 quedaron abortadas en coincidencia…» [60 metas, 53] | 60 metas: p. 90, 97, 98 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 170) | «…meta de navegación tiene un identificador único de 16 bytes. Reconstruí el historial de cada una a partir del» [16] | 16: p. 33, 36, 61 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 176) | «…18 17 16 0 1 3,3» [18, 17, 16] | 18: p. 35, 36, 61 / 17: p. 34, 36, 61 / 16: p. 33, 36, 61 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 178) | «…12 11 11 0 1 3,3» [12, 11] | 12: p. 29, 36, 51 / 11: p. 21, 28, 29 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 179) | «…11 9 9 1 1 3,3» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 180) | «…10 9 9 0 1 3,3» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 181) | «…60 54 53 1 5 no» [60, 54, 53] | 60: p. 77, 90, 91 / 54: p. 71, 90, 91 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 187) | «…que se observó En 53 de 54 abortos hubo un mensaje en que la meta siguiente ya» [53, 54] | 53: p. 68, 70, 91 / 54: p. 71, 90, 91 | igual (coincidencia débil) |
| exploracion.html#como-se-separo (l. 191) | «…terminara. Entonces, ¿qué significa una meta completada de 60? Indica cuántas veces el robot llegó a menos de 10 cm…» [60, 10 cm] | 60: p. 77, 90, 91 / 10 cm: p. 27, 36, 40 | igual (coincidencia débil) |
| exploracion.html#flujo-lista (l. 201) | «…tachadas, el explorador vacía la lista y vuelve a intentar. Ocurrió 17 veces en las cinco corridas válidas, 11 de…» [17, 11] | 17: p. 34, 36, 61 / 11: p. 21, 28, 29 | igual (coincidencia débil) |
| exploracion.html (l. 85) | «…de principio a fin, en bucle. El mapa crece hasta que el explorador se queda sin fronteras. Capturas de la Fig. A7.1…» [Figura A7.1] | Figura A7.1 «Secuencia de una ejecución representativa de exploración por» p. 153 | igual |
| exploracion.html#dos-fronteras (l. 145) | «…basada en Yamauchi (1997), secciones 2.2 y 2.3, y en la Tabla A5.4 y el Anexo 5.6 de la» [Tabla A5.4, Anexo 5.6] | Tabla A5.4 «Parámetros principales del explorador de fronteras.» p. 148 / Anexo 5.6 «Particularidades del explorador de fronteras» p. 148 | igual |
| exploracion.html#como-se-separo (l. 183) | «…A7.1 de la tesis. La iteración 2 se excluyó: el robot no se desplazó y su mapa no» [Tabla A7.1] | Tabla A7.1 «Resultado de las metas de navegación de la exploración,…» p. 152 | igual |
| exploracion.html#fin (l. 217) | «…la izquierda la cámara cenital y a la derecha el mapa en RViz, con la ruta verde hacia la última frontera. Fig.…» [Figura A7.1] | Figura A7.1 «Secuencia de una ejecución representativa de exploración por» p. 153 | igual |
| exploracion.html#f1 (l. 242) | «…Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Secciones 3.11, 4.5.6 y 5.4, Algoritmo 4.4,…» [Sec. 3.11, Sec. 4.5.6, Sec. 5.4, Algoritmo 4.4, Tabla A5.4, Tabla A7.1, Anexo 5.6, Anexo 7 +1] | Sec. 3.11 «Exploración autónoma basada en fronteras» p. 49 / Sec. 4.5.6 «Exploración autónoma de fronteras» p. 75 / Sec. 5.4 «Navegación autónoma y exploración» p. 89 / Algoritmo 4.4 «Integración operativa de explore_lite con Nav2.» p. 77 / Tabla A5.4 «Parámetros principales del explorador de fronteras.» p. 148 / +4 más | igual |
| exploracion.html#t-breve (l. 95) | «…solas por ese criterio. El explorador vuelve a elegir destino cada 3,3 s y manda la nueva meta sin cancelar…» [3,3 s, 54 metas] | 3,3 s: p. 90, 91, 97 / 54 metas: p. 90 | igual |
| exploracion.html#t-breve (l. 98) | «…de 54 metas abortadas coinciden en el tiempo con un reemplazo del» [54 metas] | 54 metas: p. 90 | igual |
| exploracion.html#t-breve (l. 99) | «…s período con que el explorador vuelve a elegir» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#fronteras (l. 106) | «…robot elige la frontera accesible más cercana, hace un barrido de 360° al llegar, y si no logra avanzar en…» [360 °] | 360 °: p. 82 | igual |
| exploracion.html#simulador (l. 113) | «…y se mueve. Igual que el explorador del robot, vuelve a elegir cada 3,3 s, y cuenta las metas que…» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#sim-exploracion (l. 116) | «…y tamaño, planifica con A estrella y avanza. Vuelve a elegir cada 3,3 s, como explore_lite, y cuenta las metas…» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#sim-exploracion (l. 118) | «…en el recinto de pruebas. La regla de puntaje y el período de 3,3 s imitan a explore_lite. La dinámica…» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#explore-lite (l. 129) | «…Si el punto cambió 1 cm o más, manda una meta» [1 cm] | 1 cm: p. 157 | igual |
| exploracion.html#explore-lite (l. 130) | «…Cada 3333 ms, a 0,3» [3333 ms, 0,3 Hz] | 3333 ms: p. 148, 149 / 0,3 Hz: p. 148, 149 | igual |
| exploracion.html#dos-fronteras (l. 141) | «…vuelve a elegir Al llegar, después de un barrido de 360° Cada 3,3 s, sin esperar a» [360 °, 3,3 s] | 360 °: p. 82 / 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#dos-fronteras (l. 142) | «…mínimo Parecido al del robot Una celda de 5» [5 cm] | 5 cm: p. 157 | igual |
| exploracion.html#dos-fronteras (l. 145) | «…basada en Yamauchi (1997), secciones 2.2 y 2.3, y en la Tabla A5.4 y el Anexo 5.6 de la» [2.2, 2.3] | 2.2: p. 57, 97, 122 / 2.3: p. 88, 159 | igual |
| exploracion.html#abortadas (l. 159) | «…estado abortado 6 . Y el explorador vuelve a elegir destino cada 3,3 s y manda una meta nueva cada…» [3,3 s, 1 cm] | 3,3 s: p. 90, 91, 97 / 1 cm: p. 157 | igual |
| exploracion.html#reemplazo (l. 162) | «…3,3 s se envía una meta nueva y la anterior queda abortada. De» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#reemplazo (l. 167) | «…meta reemplazada. El explorador envía un destino nuevo cada 3,3 s y Nav2 cierra la meta anterior como abortada. Video…» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#como-se-separo (l. 176) | «…18 17 16 0 1 3,3» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#como-se-separo (l. 177) | «…9 8 8 0 1 3,3» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#como-se-separo (l. 178) | «…12 11 11 0 1 3,3» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#como-se-separo (l. 179) | «…11 9 9 1 1 3,3» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#como-se-separo (l. 180) | «…10 9 9 0 1 3,3» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#como-se-separo (l. 183) | «…independiente de cuándo terminó la anterior. Su máximo fue de 16,7 s en la iteración 1 y de 6,7 s…» [16,7 s, 6,7 s] | 16,7 s: p. 152 / 6,7 s: p. 152 | igual |
| exploracion.html#como-se-separo (l. 188) | «…La mediana entre la aceptación de una meta y la de la siguiente fue 3,3 s en las cinco corridas,…» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| exploracion.html#como-se-separo (l. 191) | «…En las cinco corridas válidas, Nav2 condujo al robot durante 12,7 min y 21,9 m de recorrido odométrico, sin intervención…» [12,7 min, 21,9 m] | 12,7 min: p. 92 / 21,9 m: p. 92, 93, 98 | igual |
| exploracion.html#lista-negra (l. 196) | «…la misma idea de Yamauchi. Un punto entra a la lista si pasan 10 s sin acercarse a él o…» [10 s] | 10 s: p. 69, 144, 148 | igual |
| exploracion.html#flujo-lista (l. 199) | «…punto entra a la lista por falta de progreso en 10 s o por una respuesta de meta abortada, incluso…» [10 s] | 10 s: p. 69, 144, 148 | igual |
| exploracion.html#ayuda-pie (l. 275) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| exploracion.html#ayuda-pie (l. 276) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| exploracion.html#search-results (l. 286) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |
| exploracion.html (l. 214) y preguntas.html#p-exploro-todo (l. 192) | «su superficie no se midió aparte del mapa» | Sec. 5.3 (p. 88): los límites de la imagen «no están anclados al recinto físico» y el índice «no es una fracción absoluta del área del recinto». Mismo sentido con otras palabras. | igual |

### `gemelo.html`

Elementos: igual 34, igual (coincidencia débil) 4.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| gemelo.html#t-breve (l. 99) | «…vs 230 mediciones por vuelta del láser simulado frente al» [360] | 360: p. 38, 80, 81 | igual (coincidencia débil) |
| gemelo.html#no-se-comparan (l. 183) | «…la recta de 2 m, la desviación en simulación fue de 3,39 % y en el robot» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| gemelo.html#no-se-comparan (l. 185) | «…simulación, 3,39 % Odometría simulada frente a los 2 m ordenados. No hay referencia» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| gemelo.html#no-se-comparan (l. 186) | «…el robot, 7,18 % Cinta métrica frente a los 2 m ordenados. Es el error de seguimiento» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| gemelo.html (l. 85) | «…medidas del gemelo digital, las mismas del robot real. Fig. A2.1 de la» [Figura A2.1] | Figura A2.1 «Dimensiones del modelo del robot (gemelo digital): vistas lateral,…» p. 121 | igual |
| gemelo.html#que-es (l. 110) | «…gemelo en Gazebo Classic: un chasis simple, dos ruedas, una rueda loca y el láser. Fig. 4.2 de la» [Figura 4.2] | Figura 4.2 «Modelo del robot (gemelo digital) cargado en Gazebo Classic.» p. 54 | igual |
| gemelo.html#que-es (l. 114) | «…robot real, con el mismo radio de rueda, separación y posición del láser. Fig. 4.4 de la» [Figura 4.4] | Figura 4.4 «Vista en planta del prototipo construido.» p. 58 | igual |
| gemelo.html#estructura (l. 134) | «…con las mismas interfaces, una orden de velocidad por rueda y su posición y velocidad como estado. Tabla 4.2 de la» [Tabla 4.2] | Tabla 4.2 «Plugin de ros2_control según entorno de ejecución.» p. 56 | igual |
| gemelo.html#estructura (l. 145) | «…láser simulado en el mundo de prueba, con sombras detrás de cada obstáculo. Fig. 4.3 de la» [Figura 4.3] | Figura 4.3 «Barrido del LIDAR 2D simulado en el mundo de…» p. 56 | igual |
| gemelo.html#laser-simulado (l. 158) | «…2 y 3.4 de la» [Anexo 2, Anexo 3.4] | Anexo 2 «Gemelo digital y verificación estructural» p. 120 / Anexo 3.4 «Nodo de adquisición del RPLidar A1» p. 126 | igual |
| gemelo.html#f1 (l. 232) | «…Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Secciones 1.5, 2.1, 3.1, 4.2, 5.1 y…» [Sec. 1.5, Sec. 2.1, Sec. 3.1, Sec. 4.2, Sec. 5.1, Sec. 5.5, Tabla 4.2, Tabla 5.1 +3] | Sec. 1.5 «Simulación de robots móviles» p. 28 / Sec. 2.1 «Selección de tecnologías» p. 32 / Sec. 3.1 «El robot móvil: estructura, marcos de referencia y rotaciones» p. 34 / Sec. 4.2 «Gemelo digital del robot» p. 53 / Sec. 5.1 «Evaluación de odometría y control diferencial» p. 80 / +6 más | igual |
| gemelo.html#t-breve (l. 99) | «…vs 230 mediciones por vuelta del láser simulado frente al» [230] | 230: p. 120, 126, 154 | igual |
| gemelo.html#laser-simulado (l. 153) | «…por vuelta 360 muestras 230» [360 muestras, 230] | 360 muestras: p. 120 / 230: p. 120, 126, 154 | igual |
| gemelo.html#laser-simulado (l. 154) | «…Distancia mínima 0,08 m 0,15 m» [0,08 m, 0,15 m] | 0,08 m: p. 120, 145 / 0,15 m: p. 74, 92, 120 | igual |
| gemelo.html#laser-simulado (l. 155) | «…Distancia máxima 12 m 12 m» [12 m] | 12 m: p. 120, 126 | igual |
| gemelo.html#no-se-comparan (l. 183) | «…la recta de 2 m, la desviación en simulación fue de 3,39 % y en el robot real de 7,18…» [3,39 %, 7,18 %] | 3,39 %: p. 81, 96 / 7,18 %: p. 81, 96 | igual |
| gemelo.html#no-se-comparan (l. 185) | «…simulación, 3,39 % Odometría simulada frente a los 2 m ordenados. No hay» [3,39 %] | 3,39 %: p. 81, 96 | igual |
| gemelo.html#no-se-comparan (l. 186) | «…el robot, 7,18 % Cinta métrica frente a los 2 m ordenados. Es el error de» [7,18 %] | 7,18 %: p. 81, 96 | igual |
| gemelo.html#no-se-comparan (l. 187) | «…cifra que sí se parece En el robot, los encoders marcaron 3,8 % menos que lo ordenado, del mismo orden…» [3,8 %] | 3,8 %: p. 81 | igual |
| gemelo.html#gazebo (l. 202) | «…del paquete base adaptado, disponibles para ROS 2 Foxy sobre Ubuntu 20.04 1 . Gazebo Classic llegó al fin de…» [20.04] | 20.04: p. 21, 33 | igual |
| gemelo.html#ayuda-pie (l. 264) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| gemelo.html#ayuda-pie (l. 265) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| gemelo.html#search-results (l. 275) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `index.html`

Elementos: igual 5.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| index.html#about-title (l. 36) | «…y la estación de trabajo ejecuta el mapeo, la navegación y la exploración. Ver el reparto de tareas ↗ Fig. 2.1 de…» [Figura 2.1] | Figura 2.1 «Diagrama de bloques simplificado de la solución implementada.» p. 31 | igual |
| index.html (l. 52) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| index.html (l. 53) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| index.html#search-results (l. 63) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `laboratorio.html`

Elementos: igual 21, igual (coincidencia débil) 4, cálculo o dato ajeno a la tesis 1.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| laboratorio.html#lab-limite (l. 104) | «…2 MiB y 10 000 filas. Encabezados y unidades deben coincidir con un» [10000] | límite de la herramienta del sitio | cálculo o dato ajeno a la tesis |
| laboratorio.html#lab-criterio-ayuda (l. 118) | «…del YAML (map_server) Tesis: libre desde 230 y ocupado hasta 50, en grises de 0 a 255. YAML: occupied_thresh y» [50] | 50: p. 67, 95, 110 | igual (coincidencia débil) |
| laboratorio.html#lab-ejemplo-mapa (l. 125) | «…del escalón, confirma la referencia: la tabla de la guía usa 0,13 m/s. En una serie temporal se usa la…» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| laboratorio.html#formatos (l. 162) | «…promedio del error en el 20 % final de tiempo se presenta como error final, sin» [20 %] | 20 %: p. 36, 37, 61 | igual (coincidencia débil) |
| laboratorio.html#formatos (l. 166) | «…llevado a la escala de 0 a 255 es libre desde 230, ocupado hasta 50 y desconocido entre ambos. Con…» [50] | 50: p. 67, 95, 110 | igual (coincidencia débil) |
| laboratorio.html#lab-ejemplo (l. 91) | «…· robot real · Tabla» [Tabla A6.2] | Tabla A6.2 «Error de odometría en trayectoria rectilínea de 2 m…» p. 150 | igual |
| laboratorio.html#lab-ejemplo (l. 92) | «…Recta · simulación · Tabla A6.1» [Tabla A6.1] | Tabla A6.1 «Desviación de la odometría simulada respecto de la referencia…» p. 150 | igual |
| laboratorio.html#lab-ejemplo (l. 93) | «…· robot real · Tabla» [Tabla A6.4] | Tabla A6.4 «Desviación angular física respecto de la referencia nominal de…» p. 151 | igual |
| laboratorio.html#lab-ejemplo (l. 94) | «…Giro · simulación · Tabla A6.3» [Tabla A6.3] | Tabla A6.3 «Desviación del giro acumulado de /odom respecto de la…» p. 151 | igual |
| laboratorio.html#lab-ejemplo (l. 95) | «…· resumen del escalón · Tabla» [Tabla 5.3] | Tabla 5.3 «Indicadores de la respuesta al escalón en lazo cerrado,…» p. 86 | igual |
| laboratorio.html#lab-ejemplo (l. 96) | «…Mapeo · corridas · Tabla 5.4» [Tabla 5.4] | Tabla 5.4 «Indicadores de mapeo en hardware real por iteración (resolución» p. 88 | igual |
| laboratorio.html#lab-ejemplo (l. 97) | «…Navegación · metas · Tabla A7.1» [Tabla A7.1] | Tabla A7.1 «Resultado de las metas de navegación de la exploración,…» p. 152 | igual |
| laboratorio.html#lab-criterio-ayuda (l. 118) | «…clasificar cada gris Umbrales de la tesis (Anexo 8.1) Umbrales del YAML (map_server) Tesis: libre desde 230 y ocupado hasta 50, en» [Anexo 8.1] | Anexo 8.1 «Procedencia de los indicadores de mapeo» p. 154 | igual |
| laboratorio.html#formatos (l. 171) | «…procedimiento sigue la descripción del Anexo 8.4 de la tesis, implementado de nuevo para esta guía: estado final con prioridad» [Anexo 8.4] | Anexo 8.4 «Limitaciones de los contadores de exploración» p. 155 | igual |
| laboratorio.html#lab-criterio-ayuda (l. 118) | «…tesis (Anexo 8.1) Umbrales del YAML (map_server) Tesis: libre desde 230 y ocupado hasta 50, en grises de 0 a…» [230, 255] | 230: p. 120, 126, 154 / 255: p. 64, 129, 132 | igual |
| laboratorio.html#formatos (l. 149) | «…− cinta). Error absoluto = \|odómetro − cinta\|. Relativo = 100 · diferencia / cinta. El porcentaje declarado se informa» [100] | 100: p. 80, 81, 87 | igual |
| laboratorio.html#formatos (l. 155) | «…con umbrales declarados. Área = celdas × resolución². Índice = 100 · libres / (libres + desconocidas), en la imagen…» [100] | 100: p. 80, 81, 87 | igual |
| laboratorio.html#formatos (l. 160) | «…al menos cinco muestras, referencia constante, PWM entre −255 y 255. No se incluyen registros reales nuevos en esta» [255] | 255: p. 64, 129, 132 | igual |
| laboratorio.html#formatos (l. 161) | «…(velocidad − referencia) / (referencia − velocidad inicial) · 100). Funciona para escalones de subida y bajada.» [100] | 100: p. 80, 81, 87 | igual |
| laboratorio.html#formatos (l. 166) | «…los umbrales de la tesis, un gris llevado a la escala de 0 a 255 es libre desde 230, ocupado…» [255, 230] | 255: p. 64, 129, 132 / 230: p. 120, 126, 154 | igual |
| laboratorio.html#ayuda-pie (l. 194) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| laboratorio.html#ayuda-pie (l. 195) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| laboratorio.html#search-results (l. 205) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `laboratorios.html`

Elementos: igual 4.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| laboratorios.html (l. 52) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| laboratorios.html (l. 53) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| laboratorios.html#search-results (l. 63) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `lecciones.html`

Elementos: igual 16, igual (coincidencia débil) 5, cálculo o dato ajeno a la tesis 1.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| lecciones.html#seguridad (l. 151) | «…la industria estas ideas se formalizan. La norma ISO 3691-4 fija los requisitos de seguridad de los vehículos» [3691] | norma ISO externa | cálculo o dato ajeno a la tesis |
| lecciones.html#tipos (l. 123) | «…con decimales, el término integral siguió siendo un entero de 16 bits, y los productos menores que uno empezaron a» [16] | 16: p. 33, 36, 61 | igual (coincidencia débil) |
| lecciones.html#tipos (l. 124) | «…en el mismo firmware. Los contadores de los encoders son enteros de 32 bits, y en un Arduino Nano leer…» [32] | 32: p. 49, 77, 108 | igual (coincidencia débil) |
| lecciones.html#metricas (l. 130) | «…60 metas de navegación, 54 quedaron abortadas. Leído a la ligera,» [60 metas, 54, 53] | 60 metas: p. 90, 97, 98 / 54: p. 71, 90, 91 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| lecciones.html#f4 (l. 174) | «…de tracción diferencial . UTEM. Alcances y limitaciones, secciones 4.3.5, 4.4, 5.1 a 5.4, Conclusiones y Anexos 3.4, 4.1, 4.4, 4.5, 4.10,…» [Anexo 3.4, Anexo 4.1, Anexo 4.4, Anexo 4.5, Anexo 4.10, Anexo 6, Anexo 8.4] | Anexo 3.4 «Nodo de adquisición del RPLidar A1» p. 126 / Anexo 4.1 «Ticks por vuelta y ganancias finales» p. 128 / Anexo 4.4 «Ecuaciones y estados internos del PI incremental embebido» p. 133 / Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 / Anexo 4.10 «Resultados de la ejecución PSO empleada» p. 139 / +2 más | igual |
| lecciones.html#metricas (l. 130) | «…hechos por el propio explorador, que cambia de destino cada 3,3 s, y Nav2 informa ese reemplazo con la misma…» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| lecciones.html#ensayos (l. 137) | «…ensayo de giro pidió 0,4 rad/s cuando el controlador estaba limitado a 0,35 rad/s, así» [0,4 rad/s, 0,35 rad/s] | 0,4 rad/s: p. 149 / 0,35 rad/s: p. 60, 82, 128 | igual |
| lecciones.html#ensayos (l. 139) | «…la mitad de las veces. Por eso la tesis propone un mínimo de 6 a 10 repeticiones válidas por ensayo.…» [10 repeticiones] | 10 repeticiones: p. 95, 102, 160 | igual |
| lecciones.html#reproducibilidad (l. 145) | «…versiones de software son la otra mitad del problema. Ubuntu 20.04, ROS 2 Foxy y Gazebo Classic se congelaron al…» [20.04] | 20.04: p. 21, 33 | igual |
| lecciones.html#ayuda-pie (l. 203) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| lecciones.html#ayuda-pie (l. 204) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| lecciones.html#search-results (l. 214) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `mapeo.html`

Elementos: igual 113, igual (coincidencia débil) 93, texto distinto 4, cálculo o dato ajeno a la tesis 15.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| mapeo.html#configuracion-slam (l. 259) | «El YAML original de SLAM Toolbox no está publicado en este repositorio.» | El Anexo 5.4 nombra el nodo async_slam_toolbox_node y el archivo mapper_params_online_async.yaml, y la Tabla A5.3 (p. 147) transcribe los parámetros principales. El archivo como tal sigue sin publicarse. | texto distinto |
| mapeo.html#configuracion-slam (l. 263) | «Se declara mapeo asíncrono en línea en el computador. Lanzamiento y YAML originales no publicados.» | Tabla A5.3 (p. 147): mode = mapping, solver_plugin = CeresSolver. Anexo 5.4 (p. 146): nodo y archivo de parámetros nombrados. | texto distinto |
| mapeo.html#configuracion-slam (l. 266) | «Los nombres literales deben contrastarse con el YAML y URDF originales» (map_frame, odom_frame, base_frame, scan_topic) | Tabla A5.3 (p. 147): odom_frame = odom, map_frame = map, base_frame = base_link, scan_topic = /scan. | texto distinto |
| mapeo.html#configuracion-slam (l. 267) | «minimum_travel_distance, minimum_travel_heading: valores del prototipo no publicados aquí» | Tabla A5.3 (p. 147): minimum_travel_distance = 0.05 m y minimum_travel_heading = 0.05 rad. También publica map_update_interval 1.0 s, transform_publish_period 0.02 s y max_laser_range 10.0 m. | texto distinto |
| mapeo.html#sim-tf (l. 155) | «…rectilíneo: odom estima 2,08 m y SLAM estima 2,00 m. La corrección map → odom es −0,08» [2,08 m, 2,08] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| mapeo.html#slam (l. 168) | «…En el grafo de ejemplo, el cierre sube el desacuerdo de 0 a 29,3 y optimizar lo baja a 0,18.…» [29,3, 0,18, 17,7 cm] | 29,3: cálculo o ejemplo propio de la guía / 0,18: grafo de ejemplo del sitio / 17,7 cm: grafo de ejemplo del sitio | cálculo o dato ajeno a la tesis |
| mapeo.html#sim-barridos (l. 173) | «…cada punto queda a 10 cm de su par y el desacuerdo total es 700 cm². Con 30 cm los…» [700] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| mapeo.html#sim-lazo (l. 199) | «…a las demás: en este ejemplo el desacuerdo total pasa de 0 a 29,3. Optimizar cambia las poses del grafo…» [29,3, 0,18, 17,7 cm, 2,15 m, 2,10 m] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| mapeo.html#sim-cola (l. 230) | «…con un barrido cada 100 ms y 150 ms de cálculo por barrido. A los 500 ms llegaron seis: el…» [500 ms] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| mapeo.html#cobertura (l. 345) | «…24 celdas libres, 1 ocupada y 5 desconocidas dan un índice de 82,8 %. La misma zona en una imagen…» [82,8 %, 54,5 %, 0,06 m²] | ejemplo de celdas del sitio | cálculo o dato ajeno a la tesis |
| mapeo.html#t-breve (l. 102) | «…m² área libre mapeada en promedio, con dispersión de solo 0,03» [0,03 m²] | 0,03 m²: p. 88 | igual (coincidencia débil) |
| mapeo.html#t-breve (l. 105) | «…de 6 ejecuciones que produjeron un mapa» [6 ejecuciones] | 6 ejecuciones: p. 23, 36, 61 | igual (coincidencia débil) |
| mapeo.html#sim-rejilla (l. 131) | «…En este ejemplo usamos 0 = libre, 100 = ocupado y −1 = desconocido 17 . El mapeo real combina…» [17] | 17: p. 34, 36, 61 | igual (coincidencia débil) |
| mapeo.html#sim-tf (l. 155) | «…rectilíneo: odom estima 2,08 m y SLAM estima 2,00 m. La corrección map → odom es −0,08 m: el origen…» [2,00 m, 8 cm] | 2,00 m: p. 150 / 8 cm: p. 25, 36, 61 | igual (coincidencia débil) |
| mapeo.html#dos-barridos (l. 170) | «…coincidir sus partes comunes. Así estima cuánto se movió el robot 1 18» [18] | 18: p. 35, 36, 61 | igual (coincidencia débil) |
| mapeo.html#sim-barridos (l. 173) | «…observa una esquina. Tras avanzar 30 cm, B ve la misma esquina 30 cm más cerca. Las ruedas» [30 cm, 40 cm, 10 cm] | 30 cm: p. 47, 53, 77 / 40 cm: p. 57, 67, 109 / 10 cm: p. 27, 36, 40 | igual (coincidencia débil) |
| mapeo.html#componentes-slam (l. 179) | «…charla de Macenski distingue cuatro componentes 10 . Separarlos permite entender quién propone una» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| mapeo.html#componentes-slam (l. 189) | «…y la construcción del grafo. Ceres es el resolvedor utilizado aquí 21 . El ejemplo anterior de siete puntos conserva» [21] | 21: p. 38, 61, 77 | igual (coincidencia débil) |
| mapeo.html#sim-candidatos (l. 192) | «…y su desajuste es de 2 cm, menor que el umbral ilustrativo de 6 cm. La pose 5, a 0,45…» [6 cm, 0,45 m, 19 cm, 11] | 6 cm: p. 23, 36, 61 / 0,45 m: p. 142 / 19 cm: p. 36, 61, 77 / 11: p. 21, 28, 29 | igual (coincidencia débil) |
| mapeo.html#sim-lazo (l. 200) | «…la pose 0, con los cuadrados violeta, la misma pared vista desde la 12. Luego deja el giro en 0°…» [12, 0 °, 4 %] | 12: p. 29, 36, 51 / 0 °: p. 44, 45, 46 / 4 %: p. 18, 20, 21 | igual (coincidencia débil) |
| mapeo.html#sim-lazo (l. 202) | «…rígida actual no deforma por sí sola todo el recorrido pasado 6 18 . El tutorial de Grisetti y otros…» [18] | 18: p. 35, 36, 61 | igual (coincidencia débil) |
| mapeo.html#ceres (l. 207) | «…reducir la suma ponderada de las discrepancias, llamadas residuos 18 19 . En el interactivo del grafo esa suma aparece…» [18, 19] | 18: p. 35, 36, 61 / 19: p. 36, 61, 77 | igual (coincidencia débil) |
| mapeo.html#ceres (l. 216) | «…de SLAM Toolbox explica por qué lo diseñó y cómo se usa. Fuente» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| mapeo.html#ceres (l. 220) | «…del mismo autor de los paquetes en que se basa este robot. Fuente» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| mapeo.html#modos-procesamiento (l. 227) | «…No garantiza carga nula ni cualquier plazo de tiempo real 10 21» [10, 21] | 10: p. 27, 36, 40 / 21: p. 38, 61, 77 | igual (coincidencia débil) |
| mapeo.html#sim-cola (l. 229) | «…de procesamiento Interactivo · ilustrativo Avanza de 100 en 100 ms. Compara conservar todos los barridos admitidos con» [100 ms] | 100 ms: p. 80, 81, 87 | igual (coincidencia débil) |
| mapeo.html#sim-cola (l. 230) | «…con un barrido cada 100 ms y 150 ms de cálculo por barrido. A los 500 ms llegaron» [100 ms, 150 ms] | 100 ms: p. 80, 81, 87 / 150 ms: p. 138, 167 | igual (coincidencia débil) |
| mapeo.html#guardar-sesion (l. 237) | «…para recuperarlas después. No consiste en tomar una captura de RViz 21» [21] | 21: p. 38, 61, 77 | igual (coincidencia débil) |
| mapeo.html#mapeo-localizacion (l. 254) | «…alternativa a AMCL, con necesidades de ajuste y odometría propias 21 . Por eso navegar sobre un mapa previo no…» [21] | 21: p. 38, 61, 77 | igual (coincidencia débil) |
| mapeo.html#configuracion-slam (l. 259) | «…con la documentación y el ejemplo de configuración de Foxy 21 22 . Un valor predeterminado del paquete no demuestra…» [22] | 22: p. 39, 61, 77 | igual (coincidencia débil) |
| mapeo.html#configuracion-slam (l. 269) | «…No es la resolución del ajuste de barridos ni un error de posición. 0,05 m por celda, según la Tabla…» [0,05 m] | 0,05 m: p. 88, 89, 144 | igual (coincidencia débil) |
| mapeo.html#guia-roscon (l. 279) | «…· Continuación y lifelong mapping. ¿Qué» [11, 33, 13, 44] | 11: p. 21, 28, 29 / 33: p. 50, 64, 68 / 13: p. 30, 36, 61 / 44: p. 61, 68, 96 | igual (coincidencia débil) |
| mapeo.html#guia-roscon (l. 280) | «…· Configuración. ¿Qué parámetro corresponde a» [15, 38, 17, 27] | 15: p. 32, 36, 61 / 38: p. 55, 109, 115 / 17: p. 34, 36, 61 / 27: p. 44, 61, 77 | igual (coincidencia débil) |
| mapeo.html#por-que-slam-toolbox (l. 299) | «…compararon cinco algoritmos en condiciones de simulación comunes 12 . Su conclusión favoreció a Karto por su equilibrio entre» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| mapeo.html#sim-rviz (l. 337) | «…robot, y el degradado de rojo a violeta añade un costo por cercanía 20 . No son paredes de distintos…» [20] | 20: p. 36, 37, 61 | igual (coincidencia débil) |
| mapeo.html#cobertura (l. 345) | «…24 celdas libres, 1 ocupada y 5 desconocidas dan un índice de 82,8» [24 celdas, 20, 3,478 m²] | 24 celdas: p. 41, 61, 77 / 20: p. 36, 37, 61 / 3,478 m²: p. 88, 90 | igual (coincidencia débil) |
| mapeo.html#exactitud (l. 355) | «…en cinco pasos, con la métrica de exactitud que usan Trejos y otros 12» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| mapeo.html#exactitud (l. 361) | «…el robot pudo observar, los que tienen una celda libre a menos de 10 cm. Son entre el 92 y…» [10 cm, 92] | 10 cm: p. 27, 36, 40 / 92: p. 109, 157 | igual (coincidencia débil) |
| mapeo.html#exactitud (l. 363) | «…de 5 cm, pero la resolución no es una cota del error: el percentil 95 conjunto, la distancia que solo…» [95] | 95: p. 89, 93, 94 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 365) | «…Cambia a la vista por mapa para comparar la media y el percentil 95 en los dos» [95] | 95: p. 89, 93, 94 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 366) | «…medias entre los cinco mapas y el plano: alto del recinto −1,7 cm, pasillos +4,1, +2,4 y +5,2 cm, pasos…» [1,7 cm, 4,1, 5,2 cm, 0,8 cm, 9,3 cm, 3,72 cm, 95, 9,6 cm] | 1,7 cm: p. 91, 159 / 4,1: p. 22, 51, 52 / 5,2 cm: p. 66, 71, 75 / 0,8 cm: p. 86, 89, 144 / 9,3 cm: p. 158, 159 / 3,72 cm: p. 151, 157, 158 / 95: p. 89, 93, 94 / 9,6 cm: p. 158 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 374) | «…interior del recinto 1,91 m 1,89 m 1,89 a 1,90 m −1,7» [1,89 m, 1,90 m, 1,7 cm] | 1,89 m: p. 159 / 1,90 m: p. 159 / 1,7 cm: p. 91, 159 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 375) | «…del primer pasillo 0,58 m 0,62 m 0,61 a 0,64 m +4,1» [0,62 m, 0,64 m, 4,1 cm] | 0,62 m: p. 159 / 0,64 m: p. 159 / 4,1 cm: p. 22, 51, 52 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 376) | «…del segundo pasillo 0,58 m 0,60 m 0,59 a 0,61 m +2,4» [0,60 m, 2,4 cm] | 0,60 m: p. 159 / 2,4 cm: p. 43, 135, 159 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 377) | «…del tercer pasillo 0,98 m 1,03 m 1,02 a 1,05 m +5,2» [1,03 m, 1,05 m, 5,2 cm] | 1,03 m: p. 159 / 1,05 m: p. 159 / 5,2 cm: p. 66, 71, 75 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 378) | «…sobre el primer muro largo 0,68 m 0,69 m 0,68 a 0,69 m +0,5» [0,69 m, 0,5 cm] | 0,69 m: p. 159 / 0,5 cm: p. 74, 137, 138 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 379) | «…bajo el segundo muro largo 0,68 m 0,67 m 0,67 a 0,68 m −0,8» [0,67 m, 0,8 cm] | 0,67 m: p. 159 / 0,8 cm: p. 86, 89, 144 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 380) | «…del tabique unido al segundo muro largo 0,40 m 0,34 m 0,32 a 0,38 m −6,1» [0,34 m, 0,38 m, 6,1 cm] | 0,34 m: p. 142, 159 / 0,38 m: p. 159 / 6,1 cm: p. 40, 150, 159 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 381) | «…de ese tabique sobre el extremo del muro 0,40 m 0,39 m 0,38 a 0,40 m −0,5» [0,39 m, 0,5 cm] | 0,39 m: p. 159 / 0,5 cm: p. 74, 137, 138 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 382) | «…del tabique superior del tercer pasillo al muro superior 0,40 m 0,32 m 0,31 a 0,34 m −7,8» [0,32 m, 0,34 m, 7,8 cm] | 0,32 m: p. 142, 159 / 0,34 m: p. 142, 159 / 7,8 cm: p. 159 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 383) | «…del tabique superior del tercer pasillo 0,40 m 0,38 m 0,34 a 0,41 m −2,3» [0,38 m, 0,41 m, 2,3 cm] | 0,38 m: p. 159 / 0,41 m: p. 67, 141, 159 / 2,3 cm: p. 88, 159 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 384) | «…del tabique corto inferior al muro derecho 0,61 m 0,70 m 0,69 a 0,71 m +9,3» [0,70 m, 0,71 m, 9,3 cm] | 0,70 m: p. 159 / 0,71 m: p. 159 / 9,3 cm: p. 158, 159 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 386) | «…de cada muro, después de alinear el plano con cada mapa. Celdas de 0,05» [0,05 m] | 0,05 m: p. 88, 89, 144 | igual (coincidencia débil) |
| mapeo.html#sim-plano (l. 390) | «…y no son intervalos de confianza. El intervalo entre corridas, de 3,1 a 3,7 cm con cinco mapas, tampoco incluye…» [3,1] | 3,1: p. 19, 34, 35 | igual (coincidencia débil) |
| mapeo.html#privacidad (l. 401) | «…la empresa aclaró que no vendería los datos de sus clientes 13 . En 2022 se conoció que imágenes tomadas…» [13, 14] | 13: p. 30, 36, 61 / 14: p. 31, 36, 61 | igual (coincidencia débil) |
| mapeo.html#mundo-real (l. 415) | «…Fuentes 15 16» [15, 16] | 15: p. 32, 36, 61 / 16: p. 33, 36, 61 | igual (coincidencia débil) |
| mapeo.html#sim-lidar (l. 119) | «…Esa zona puede descubrirse después desde otra posición. Un solo barrido no contiene el mapa completo. Fig. 4.3 de la» [Figura 4.3] | Figura 4.3 «Barrido del LIDAR 2D simulado en el mundo de…» p. 56 | igual |
| mapeo.html#configuracion-slam (l. 269) | «…de celda. No es la resolución del ajuste de barridos ni un error de posición. 0,05 m por celda, según la Tabla…» [Tabla 5.4] | Tabla 5.4 «Indicadores de mapeo en hardware real por iteración (resolución» p. 88 | igual |
| mapeo.html#por-que-slam-toolbox (l. 296) | «…1.2 de la tesis, con base en Ran y otros, Trejos y otros, y Macenski y» [Tabla 1.2] | Tabla 1.2 «Comparación general de alternativas para SLAM 2D.» p. 25 | igual |
| mapeo.html#como-crece (l. 316) | «…en cuatro capturas, en bucle. A la izquierda de cada panel, la cámara cenital, y a la derecha RViz. Fig. A7.1 de…» [Figura A7.1] | Figura A7.1 «Secuencia de una ejecución representativa de exploración por» p. 153 | igual |
| mapeo.html#exactitud (l. 357) | «…mapa se recupera la clase de cada celda de 5 cm, con los umbrales del índice. Los conteos reproducen la Tabla 5.4…» [Tabla 5.4] | Tabla 5.4 «Indicadores de mapeo en hardware real por iteración (resolución» p. 88 | igual |
| mapeo.html#sim-plano (l. 366) | «…de la Fig. A8.1 de la tesis. El tabique inferior se dibuja aproximado, porque su largo no se» [Figura A8.1] | Figura A8.1 «Plano del recinto de ensayo, con las distancias entre…» p. 157 | igual |
| mapeo.html#sim-plano (l. 369) | «…Ver la Tabla A8.3 completa» [Tabla A8.3] | Tabla A8.3 «Distancias del plano del recinto y las mismas distancias…» p. 159 | igual |
| mapeo.html#sim-plano (l. 386) | «…A8.3 de la tesis. Las distancias de los mapas se miden entre las celdas ocupadas» [Tabla A8.3] | Tabla A8.3 «Distancias del plano del recinto y las mismas distancias…» p. 159 | igual |
| mapeo.html#f1 (l. 425) | «…Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Secciones 1.3, 3.1, 3.3.1, 3.8, 4.2.2, 4.5.1…» [Sec. 1.3, Sec. 3.1, Sec. 3.3.1, Sec. 3.8, Sec. 4.2.2, Sec. 4.5.1, Sec. 5.3, Anexo 3.4 +6] | Sec. 1.3 «Percepción y mapeo del entorno» p. 24 / Sec. 3.1 «El robot móvil: estructura, marcos de referencia y rotaciones» p. 34 / Sec. 3.3.1 «Sensor láser LIDAR 2D» p. 38 / Sec. 3.8 «SLAM basado en grafos» p. 46 / Sec. 4.2.2 «Estructura URDF/xacro y marcos de referencia» p. 54 / +9 más | igual |
| mapeo.html#t-breve (l. 98) | «…produjeron mapas válidos: en ellas quedó registrado un promedio de 3,50 m² de espacio libre , entre 3,478 y 3,540…» [3,50 m², 3,478, 3,540 m²] | 3,50 m²: p. 90, 93, 95 / 3,478: p. 88, 90 / 3,540 m²: p. 90 | igual |
| mapeo.html#t-breve (l. 100) | «…menor, aunque contenga casi los mismos metros cuadrados libres. El 62,2 % no significa que el robot haya visto el…» [62,2 %] | 62,2 %: p. 90, 93, 95 | igual |
| mapeo.html#t-breve (l. 102) | «…m² área libre mapeada en promedio, con dispersión de solo» [3,50 m²] | 3,50 m²: p. 90, 93, 95 | igual |
| mapeo.html#t-breve (l. 103) | «…% índice medio de cobertura libre, un indicador relativo a» [62,2 %] | 62,2 %: p. 90, 93, 95 | igual |
| mapeo.html#t-breve (l. 104) | «…cm lado de cada celda del» [5 cm] | 5 cm: p. 157 | igual |
| mapeo.html#rejilla (l. 125) | «…es una rejilla de ocupación . El plano se divide en celdas, aquí de 5 cm por lado, y cada…» [5 cm] | 5 cm: p. 157 | igual |
| mapeo.html#sim-rejilla (l. 128) | «…de rejilla de ocupación. Cada cuadrado representa 5 × 5 cm, aunque se dibuja» [5 cm] | 5 cm: p. 157 | igual |
| mapeo.html#sim-rejilla (l. 131) | «…del programa que publica el mapa. En este ejemplo usamos 0 = libre, 100 = ocupado y −1 = desconocido…» [100] | 100: p. 80, 81, 87 | igual |
| mapeo.html#marcos (l. 137) | «…que medimos posiciones. Aquí seguimos dos convenciones de ROS: REP 103 define unidades SI y ejes en un sistema de…» [103, 105] | 103: p. 35, 55, 105 / 105: p. 35, 55, 108 | igual |
| mapeo.html#cadena-tf (l. 151) | «…conceptual según REP 105 y la arquitectura descrita en la tesis. El árbol real» [105] | 105: p. 35, 55, 108 | igual |
| mapeo.html#sim-tf (l. 155) | «…estima 2,08 m y SLAM estima 2,00 m. La corrección map → odom es −0,08 m: el origen de odom…» [0,08 m, 0,08] | 0,08 m: p. 120, 145 / 0,08: p. 120, 145 | igual |
| mapeo.html#sim-tf (l. 157) | «…3,63 % no es un sesgo identificado del encoder. Es el error» [3,63 %] | 3,63 %: p. 81, 93, 95 | igual |
| mapeo.html#sim-candidatos (l. 192) | «…después de alinear los barridos. Ejemplo: la pose 0, antigua y a 0,40 m, pasa el filtro espacial y su…» [0,40 m, 2 cm, 1 m] | 0,40 m: p. 157 / 2 cm: p. 156 / 1 m: p. 146 | igual |
| mapeo.html#sim-cola (l. 229) | «…dos decisiones de procesamiento Interactivo · ilustrativo Avanza de 100 en 100 ms. Compara conservar todos los barridos admitidos» [100] | 100: p. 80, 81, 87 | igual |
| mapeo.html#cobertura (l. 345) | «…y el área libre sigue siendo 0,06 m². Datos de la tesis: índices de 82,9, 53,5, 54,2, 67,1 y 53,4…» [82,9, 53,5, 54,2, 67,1, 53,4 %, 3,510, 3,540, 3,478, +1 más] | 82,9: p. 88, 90, 92 / 53,5: p. 88 / 54,2: p. 88 / 67,1: p. 88 / 53,4 %: p. 90, 152 / 3,510: p. 88 / 3,540: p. 88, 90 / 3,478: p. 88, 90 / +1 más | igual |
| mapeo.html#cobertura (l. 347) | «…área libre fue casi la misma en las cinco corridas, entre 3,478 y 3,540 m². El índice de cobertura, en…» [3,478, 3,540 m², 53,4 %, 82,9 %] | 3,478: p. 88, 90 / 3,540 m²: p. 90 / 53,4 %: p. 90, 152 / 82,9 %: p. 90, 92, 152 | igual |
| mapeo.html#cobertura (l. 349) | «…los dos mide la exactitud del mapa. El área libre varió apenas un 0,8 % entre corridas, y eso habla…» [0,8 %] | 0,8 %: p. 89 | igual |
| mapeo.html#exactitud (l. 355) | «…entre muros medidas a mano con huincha. Sus muros tienen menos de 2 cm de espesor y se dibujaron como…» [2 cm] | 2 cm: p. 156 | igual |
| mapeo.html#exactitud (l. 357) | «…De la imagen de cada mapa se recupera la clase de cada celda de 5 cm, con los umbrales del…» [5 cm] | 5 cm: p. 157 | igual |
| mapeo.html#exactitud (l. 359) | «…Se toma un punto cada 1 cm a lo largo de los muros del» [1 cm] | 1 cm: p. 157 | igual |
| mapeo.html#exactitud (l. 361) | «…que tienen una celda libre a menos de 10 cm. Son entre el 92 y el 93 % del» [93 %] | 93 %: p. 157 | igual |
| mapeo.html#exactitud (l. 363) | «…la distancia media entre el plano y el mapa es de 3,4 cm, con 3,55, 3,19, 3,72, 3,53 y 3,17…» [3,4 cm, 3,55, 3,19, 3,72, 3,53, 3,17 cm, 5 cm, 8,4 cm] | 3,4 cm: p. 89, 93, 95 / 3,55: p. 157, 158 / 3,19: p. 157, 158 / 3,72: p. 151, 157, 158 / 3,53: p. 94, 157, 158 / 3,17 cm: p. 157 / 5 cm: p. 157 / 8,4 cm: p. 89, 159 | igual |
| mapeo.html#sim-plano (l. 366) | «…cinco mapas y el plano: alto del recinto −1,7 cm, pasillos +4,1, +2,4 y +5,2 cm, pasos entre muros +0,5…» [2,4, 0,5, 6,1, 7,8, 2,3, 5 cm, 3,17, 6,8] | 2,4: p. 43, 135, 159 / 0,5: p. 74, 137, 138 / 6,1: p. 40, 150, 159 / 7,8: p. 159 / 2,3: p. 88, 159 / 5 cm: p. 157 / 3,17: p. 157, 158 / 6,8: p. 38, 158 | igual |
| mapeo.html#sim-plano (l. 368) | «…pasos que dejan los muros largos coinciden con diferencias de −2 a +4 cm, menores que una celda. El tercer…» [4 cm, 5 cm, 12 cm, 9 cm] | 4 cm: p. 157 / 5 cm: p. 157 / 12 cm: p. 89, 99, 157 / 9 cm: p. 89, 158 | igual |
| mapeo.html#sim-plano (l. 374) | «…interior del recinto 1,91 m 1,89 m 1,89 a 1,90 m −1,7» [1,91 m, 1,89] | 1,91 m: p. 157 / 1,89: p. 159 | igual |
| mapeo.html#sim-plano (l. 375) | «…del primer pasillo 0,58 m 0,62 m 0,61 a 0,64 m +4,1» [0,58 m, 0,61] | 0,58 m: p. 157 / 0,61: p. 157, 159 | igual |
| mapeo.html#sim-plano (l. 376) | «…del segundo pasillo 0,58 m 0,60 m 0,59 a 0,61 m +2,4» [0,58 m, 0,59, 0,61 m] | 0,58 m: p. 157 / 0,59: p. 159 / 0,61 m: p. 157 | igual |
| mapeo.html#sim-plano (l. 377) | «…del tercer pasillo 0,98 m 1,03 m 1,02 a 1,05 m +5,2» [0,98 m, 1,02] | 0,98 m: p. 157 / 1,02: p. 159 | igual |
| mapeo.html#sim-plano (l. 378) | «…sobre el primer muro largo 0,68 m 0,69 m 0,68 a 0,69 m +0,5» [0,68 m, 0,68] | 0,68 m: p. 157 / 0,68: p. 157, 159 | igual |
| mapeo.html#sim-plano (l. 379) | «…bajo el segundo muro largo 0,68 m 0,67 m 0,67 a 0,68 m −0,8» [0,68 m, 0,67] | 0,68 m: p. 157 / 0,67: p. 159 | igual |
| mapeo.html#sim-plano (l. 380) | «…del tabique unido al segundo muro largo 0,40 m 0,34 m 0,32 a 0,38 m −6,1» [0,40 m, 0,32] | 0,40 m: p. 157 / 0,32: p. 142, 159 | igual |
| mapeo.html#sim-plano (l. 381) | «…de ese tabique sobre el extremo del muro 0,40 m 0,39 m 0,38 a 0,40 m −0,5» [0,40 m, 0,38] | 0,40 m: p. 157 / 0,38: p. 159 | igual |
| mapeo.html#sim-plano (l. 382) | «…del tabique superior del tercer pasillo al muro superior 0,40 m 0,32 m 0,31 a 0,34 m −7,8» [0,40 m, 0,31] | 0,40 m: p. 157 / 0,31: p. 159 | igual |
| mapeo.html#sim-plano (l. 383) | «…del tabique superior del tercer pasillo 0,40 m 0,38 m 0,34 a 0,41 m −2,3» [0,40 m, 0,34] | 0,40 m: p. 157 / 0,34: p. 142, 159 | igual |
| mapeo.html#sim-plano (l. 384) | «…del tabique corto inferior al muro derecho 0,61 m 0,70 m 0,69 a 0,71 m +9,3» [0,61 m, 0,69] | 0,61 m: p. 157 / 0,69: p. 159 | igual |
| mapeo.html#sim-plano (l. 390) | «…ocupada hasta el muro más cercano del plano. Ahí las medias van de 4,09 a 4,94 cm. Ese sentido solo…» [4,09, 4,94 cm, 3,7 cm] | 4,09: p. 89, 158 / 4,94 cm: p. 89 / 3,7 cm: p. 94 | igual |
| mapeo.html#sim-plano (l. 392) | «…que muestra Que los muros del mapa quedan, en promedio, a unos 3,4 cm de donde los pone el plano,…» [3,4 cm] | 3,4 cm: p. 89, 93, 95 | igual |
| mapeo.html#sim-plano (l. 393) | «…tiene su propio error, el alineamiento también, y la diferencia de 12 cm en los pasillos no tiene una causa» [12 cm] | 12 cm: p. 89, 99, 157 | igual |
| mapeo.html#ayuda-pie (l. 472) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| mapeo.html#ayuda-pie (l. 473) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| mapeo.html#search-results (l. 483) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |
| mapeo.html#configuracion-slam (l. 268) | «loop_search_maximum_distance, loop_match_minimum_response_fine: valores del prototipo no publicados aquí» | Ninguno de los dos aparece en la Tabla A5.3 ni en el resto del documento. | igual |

### `movimiento.html`

Elementos: igual 90, igual (coincidencia débil) 42, cálculo o dato ajeno a la tesis 9.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| movimiento.html#sim-cinematica (l. 111) | «…dónde queda el centro de giro. El dibujo usa el radio de rueda de 3,35 cm y la separación de…» [3,35 cm, 18,8 cm] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| movimiento.html#sim-cinematica (l. 112) | «…la rueda izquierda a 0,100 m/s y la derecha a 0,130 m/s, el robot avanza a 0,115 m/s,» [0,100 m/s, 0,115 m/s] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| movimiento.html#sesgo-dispersion (l. 197) | «…marca en promedio 3,63 % de más, basta dividir lo que mide por 1,0363, lo que en la práctica se…» [1,0363] | 1 más 3,63 %, cálculo de la guía | cálculo o dato ajeno a la tesis |
| movimiento.html#sim-calibracion (l. 200) | «…dividir la odometría por 1,0363, el error medio pasa de 3,63 % a 0 %, pero las cinco» [1,0363, 0,37, 0,23] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| movimiento.html#giro (l. 208) | «…el tiempo que tomaría una vuelta completa a esa velocidad, unos 15,7 s. El detalle es que el controlador diferencial…» [15,7 s] | 2 pi dividido por 0,4 rad/s, cálculo de la guía | cálculo o dato ajeno a la tesis |
| movimiento.html (l. 87) | «…de odometría en cinco rectas de 2 m del robot real, medido con cinta métrica. Fig. 5.2 b de» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| movimiento.html#t-breve (l. 97) | «…. En el robot real esa cuenta se equivocó un 3,63 % en una recta de 2 m , con…» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| movimiento.html#t-breve (l. 101) | «…pulsos del encoder por vuelta de» [1980 pulsos] | 1980 pulsos: p. 52, 53, 82 | igual (coincidencia débil) |
| movimiento.html#t-breve (l. 102) | «…repeticiones por ensayo, en simulación y en el robot» [5 repeticiones] | 5 repeticiones: p. 22, 36, 37 | igual (coincidencia débil) |
| movimiento.html#sim-cinematica (l. 112) | «…m/s y la derecha a 0,130 m/s, el robot avanza a 0,115 m/s, gira a 0,16 rad/s y recorre un…» [0,16 rad/s, 0,72 m] | 0,16 rad/s: p. 143 / 0,72 m: p. 161 | igual (coincidencia débil) |
| movimiento.html#sim-cinematica (l. 115) | «…debe girar cada rueda. En el robot real limita la velocidad a 0,13 m/s y el giro a 0,35 rad/s,…» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| movimiento.html#sim-encoder (l. 139) | «…cada rueda una vuelta completa diez veces y obtuve promedios de 1976 pulsos en la derecha y 1969 en la…» [1976 pulsos] | 1976 pulsos: p. 129 | igual (coincidencia débil) |
| movimiento.html#recta (l. 158) | «…script ordenó al robot avanzar a 0,13 m/s durante 15,4 s, el tiempo para recorrer 2 m a esa» [0,13 m/s, 2 m] | 0,13 m/s: p. 60, 70, 80 / 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| movimiento.html#tres-distancias (l. 165) | «…parte ya la registran los encoders, que marcan 3,8 % menos que los 2 m, y es compatible con el…» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| movimiento.html#tres-distancias (l. 166) | «…encoders con la cinta. Dice que el robot cree haber avanzado unos 7 cm más de lo real. Esta es…» [7 cm] | 7 cm: p. 24, 36, 61 | igual (coincidencia débil) |
| movimiento.html#tres-distancias (l. 169) | «…ensayos independientes, pero sí puedo descartar una. El valor de 1980 pulsos por vuelta es mayor que los promedios medidos,…» [1980 pulsos] | 1980 pulsos: p. 52, 53, 82 | igual (coincidencia débil) |
| movimiento.html#tres-distancias (l. 177) | «…odometría frente a los 2 m teóricos. No mide lo mismo que la figura de la izquierda.» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| movimiento.html#tres-distancias (l. 192) | «…A6.2 de la tesis. Distancia ordenada, 2,00 m en todas las» [2,00 m] | 2,00 m: p. 150 | igual (coincidencia débil) |
| movimiento.html#sesgo-dispersion (l. 196) | «…a la media. En la recta del ensayo, de 1,856 m, equivalen a unos 6,7 cm y 0,8 cm. Con…» [6,7 cm, 0,8 cm, 95 %] | 6,7 cm: p. 152 / 0,8 cm: p. 86, 89, 144 / 95 %: p. 93, 94, 155 | igual (coincidencia débil) |
| movimiento.html#sim-calibracion (l. 200) | «…dividir la odometría por 1,0363, el error medio pasa de 3,63 % a 0 %, pero las cinco pruebas siguen…» [0 %, 0,02 %] | 0 %: p. 44, 45, 46 / 0,02 %: p. 147 | igual (coincidencia débil) |
| movimiento.html#giro (l. 208) | «…rad/s. Con ese límite aplicado de forma ideal, el robot llegaría a 315°, no a 360° 1» [315 °] | 315 °: p. 82, 150 | igual (coincidencia débil) |
| movimiento.html#giros (l. 210) | «…giros medidos frente a 315° y 360° Datos de la» [315 °] | 315 °: p. 82, 150 | igual (coincidencia débil) |
| movimiento.html#giros (l. 211) | «…medidos de 355,7°, 340°, 380°, 370° y» [355,7 °, 340 °, 380 °, 370 °, 356 °] | 355,7 °: p. 151 / 340 °: p. 82, 151 / 380 °: p. 82, 151 / 370 °: p. 51, 112, 118 / 356 °: p. 151 | igual (coincidencia débil) |
| movimiento.html#giros (l. 213) | «…los giros superaron los 315°, tanto en simulación, entre 335,9° y 347,4°, como en el» [315 °, 335,9 °, 347,4 °, 340 °, 380 °, 11,7 °, 95 %, 21,6 °] | 315 °: p. 82, 150 / 335,9 °: p. 82 / 347,4 °: p. 82, 151 / 340 °: p. 82, 151 / 380 °: p. 82, 151 / 11,7 °: p. 82, 95, 160 / 95 %: p. 93, 94, 155 / 21,6 °: p. 94, 160 | igual (coincidencia débil) |
| movimiento.html#tres-senales (l. 244) | «…externa, y eso es lo que importa para medir un sesgo de unos 7» [7 cm] | 7 cm: p. 24, 36, 61 | igual (coincidencia débil) |
| movimiento.html#mejorar (l. 250) | «…separarlos propusieron UMBmark. El robot recorre un cuadrado de 4 m guiándose solo por su odometría, cinco veces en sentido» [4 m] | 4 m: p. 18, 20, 21 | igual (coincidencia débil) |
| movimiento.html#sim-cuadrado (l. 259) | «…la rueda derecha avanza 0,59 % más que la izquierda con el mismo conteo y la separación» [0,59 %, 2 %, 18 cm] | 0,59 %: p. 159 / 2 %: p. 18, 19, 20 / 18 cm: p. 35, 36, 61 | igual (coincidencia débil) |
| movimiento.html#sim-cuadrado (l. 261) | «…fueran iguales, con el mismo conteo la rueda derecha avanzaría 0,35 % menos que la izquierda, y en la recta…» [0,35 %, 2 m] | 0,35 %: p. 60, 82, 128 / 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| movimiento.html (l. 87) | «…de odometría en cinco rectas de 2 m del robot real, medido con cinta métrica. Fig. 5.2 b de la» [Figura 5.2] | Figura 5.2 «Resultados por repetición de las pruebas rectilíneas y angulares…» p. 83 | igual |
| movimiento.html#sim-cinematica (l. 127) | «…3.3 a 3.8 de la tesis, según Corke 2 y Ferreira y otros 3» [Ec. 3.3, Ec. 3.4, Ec. 3.5, Ec. 3.6, Ec. 3.7, Ec. 3.8] | Ec. (3.3) p. 41 / Ec. (3.4) p. 41 / Ec. (3.5) p. 41 / Ec. (3.6) p. 41 / Ec. (3.7) p. 41 / +1 más | igual |
| movimiento.html#tres-distancias (l. 173) | «…real: odometría frente a la cinta métrica. Fig. 5.2 b de la» [Figura 5.2] | Figura 5.2 «Resultados por repetición de las pruebas rectilíneas y angulares…» p. 83 | igual |
| movimiento.html#tres-distancias (l. 177) | «…odometría frente a los 2 m teóricos. No mide lo mismo que la figura de la izquierda. Fig. 5.2 a de la» [Figura 5.2] | Figura 5.2 «Resultados por repetición de las pruebas rectilíneas y angulares…» p. 83 | igual |
| movimiento.html#tres-distancias (l. 192) | «…A6.2 de la tesis. Distancia ordenada, 2,00 m en todas las» [Tabla A6.2] | Tabla A6.2 «Error de odometría en trayectoria rectilínea de 2 m…» p. 150 | igual |
| movimiento.html#giros (l. 217) | «…real: desviación física medida, con sobregiros y subgiros. Fig. 5.2 d de la» [Figura 5.2] | Figura 5.2 «Resultados por repetición de las pruebas rectilíneas y angulares…» p. 83 | igual |
| movimiento.html#giros (l. 221) | «…giro acumulado de la odometría frente a 360°. Fig. 5.2 c de la» [Figura 5.2] | Figura 5.2 «Resultados por repetición de las pruebas rectilíneas y angulares…» p. 83 | igual |
| movimiento.html#f1 (l. 286) | «…Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Secciones 3.3.2, 3.4, 4.3.3, 5.1 y 5.6,…» [Sec. 3.3.2, Sec. 3.4, Sec. 4.3.3, Sec. 5.1, Sec. 5.6, Tabla 4.3, Tabla 5.1, Tabla 5.2 +5] | Sec. 3.3.2 «Encoders incrementales de cuadratura» p. 38 / Sec. 3.4 «Cinemática diferencial y odometría» p. 40 / Sec. 4.3.3 «Control diferencial e interfaz de hardware» p. 59 / Sec. 5.1 «Evaluación de odometría y control diferencial» p. 80 / Sec. 5.6 «Alcance estadístico de los ensayos» p. 94 / +8 más | igual |
| movimiento.html#t-breve (l. 97) | «…error con cada metro . En el robot real esa cuenta se equivocó un 3,63 % en una recta de…» [3,63 %] | 3,63 %: p. 81, 93, 95 | igual |
| movimiento.html#t-breve (l. 99) | «…% error medio de la odometría frente a una cinta» [3,63 %] | 3,63 %: p. 81, 93, 95 | igual |
| movimiento.html#t-breve (l. 100) | «…% dispersión entre repeticiones, la firma de un sesgo» [0,44 %] | 0,44 %: p. 81 | igual |
| movimiento.html#traccion (l. 109) | «…entre ambas ruedas dividida por la distancia que las separa, 18,8 cm en este robot 1 . Con esas dos…» [18,8 cm] | 18,8 cm: 0,188 m en la Tabla 4.1 (p. 53), distinta unidad | igual |
| movimiento.html#sim-cinematica (l. 112) | «…la rueda izquierda a 0,100 m/s y la derecha a 0,130 m/s, el robot avanza a 0,115 m/s, gira a…» [0,130 m/s] | 0,130 m/s: p. 86 | igual |
| movimiento.html#sim-cinematica (l. 115) | «…rueda. En el robot real limita la velocidad a 0,13 m/s y el giro a 0,35 rad/s, valores prudentes para…» [0,35 rad/s] | 0,35 rad/s: p. 60, 82, 128 | igual |
| movimiento.html#sim-encoder (l. 139) | «…usa un único valor de 1980, que introduce un error sistemático de 0,20 % y 0,56 % respectivamente 1» [0,20 %, 0,56 %] | 0,20 %: p. 129 / 0,56 %: p. 129 | igual |
| movimiento.html#recta (l. 158) | «…script ordenó al robot avanzar a 0,13 m/s durante 15,4 s, el tiempo para recorrer 2 m a esa velocidad,…» [15,4 s] | 15,4 s: p. 80 | igual |
| movimiento.html#tres-distancias (l. 161) | «…2,000 m. Encoders 1,924 m. Cinta 1,856» [2,000 m, 1,924 m, 1,856 m] | 2,000 m: distancia teórica 2.00 m, Tabla A6.2 (p. 150) / 1,924 m: p. 81 / 1,856 m: p. 81 | igual |
| movimiento.html#tres-distancias (l. 165) | «…de seguimiento, 7,18 % Compara la cinta con lo ordenado. Dice que el robot» [7,18 %, 3,8 %] | 7,18 %: p. 81, 96 / 3,8 %: p. 81 | igual |
| movimiento.html#tres-distancias (l. 166) | «…odométrico, 3,63 % Compara los encoders con la cinta. Dice que el robot cree» [3,63 %] | 3,63 %: p. 81, 93, 95 | igual |
| movimiento.html#tres-distancias (l. 167) | «…que revela la dispersión El error odométrico varió solo 0,44 % entre repeticiones. Un error tan parejo es la firma…» [0,44 %] | 0,44 %: p. 81 | igual |
| movimiento.html#tres-distancias (l. 180) | «…registrada y la distancia salió de la propia odometría, así que el 3,39 % simulado compara la odometría con lo…» [3,39 %] | 3,39 %: p. 81, 96 | igual |
| movimiento.html#tres-distancias (l. 185) | «…1 1,920 1,846 4,01 %» [1,920, 1,846, 4,01 %] | 1,920: p. 150 / 1,846: p. 150 / 4,01 %: p. 150 | igual |
| movimiento.html#tres-distancias (l. 186) | «…2 1,922 1,868 2,88 %» [1,922, 1,868, 2,88 %] | 1,922: p. 150 / 1,868: p. 150 / 2,88 %: p. 150 | igual |
| movimiento.html#tres-distancias (l. 187) | «…3 1,923 1,851 3,87 %» [1,923, 1,851, 3,87 %] | 1,923: p. 150 / 1,851: p. 150 / 3,87 %: p. 150 | igual |
| movimiento.html#tres-distancias (l. 188) | «…4 1,926 1,856 3,78 %» [1,926, 1,856, 3,78 %] | 1,926: p. 150 / 1,856: p. 81, 150 / 3,78 %: p. 150 | igual |
| movimiento.html#tres-distancias (l. 189) | «…5 1,928 1,861 3,61 %» [1,928, 1,861, 3,61 %] | 1,928: p. 150 / 1,861: p. 150 / 3,61 %: p. 150 | igual |
| movimiento.html#tres-distancias (l. 190) | «…Media 1,924 1,856 3,63 %» [1,924, 1,856, 3,63 %] | 1,924: p. 81 / 1,856: p. 81, 150 / 3,63 %: p. 81, 93, 95 | igual |
| movimiento.html#sesgo-dispersion (l. 196) | «…conviene separar dos cifras. El sesgo es el error medio, 3,63 %: cuánto se equivoca la odometría en promedio, y…» [3,63 %, 0,44 %, 1,856 m, 3,08, 4,18 %] | 3,63 %: p. 81, 93, 95 / 0,44 %: p. 81 / 1,856 m: p. 81 / 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 | igual |
| movimiento.html#sesgo-dispersion (l. 197) | «…sesgo se corrige calibrando. Si la odometría marca en promedio 3,63 % de más, basta dividir lo que mide por…» [3,63 %] | 3,63 %: p. 81, 93, 95 | igual |
| movimiento.html#sim-calibracion (l. 200) | «…dividir la odometría por 1,0363, el error medio pasa de 3,63 % a 0 %, pero las cinco pruebas siguen…» [3,63 %, 0,72, 0,14] | 3,63 %: p. 81, 93, 95 / 0,72: p. 161 / 0,14: p. 68 | igual |
| movimiento.html#giro (l. 208) | «…el giro, un script pidió 0,4 rad/s durante el tiempo que tomaría una vuelta completa a esa» [0,4 rad/s, 0,35 rad/s, 360 °] | 0,4 rad/s: p. 149 / 0,35 rad/s: p. 60, 82, 128 / 360 °: p. 82 | igual |
| movimiento.html#giros (l. 210) | «…giros medidos frente a 315° y 360° Datos de la» [360 °] | 360 °: p. 82 | igual |
| movimiento.html#giros (l. 213) | «…causa no se determinó. Por eso informo una desviación respecto de 360° nominales, de 3,24 % en el robot real…» [360 °, 3,24 %, 4,74 %, 1,8] | 360 °: p. 82 / 3,24 %: p. 82 / 4,74 %: p. 82 / 1,8: p. 94, 160 | igual |
| movimiento.html#giros (l. 221) | «…giro acumulado de la odometría frente a 360°. Fig. 5.2 c de la» [360 °] | 360 °: p. 82 | igual |
| movimiento.html#iteracion-2 (l. 229) | «…las seis ejecuciones de exploración, una se excluyó. Durante 5,09 minutos el explorador envió 14 metas y la odometría sumó» [5,09, 14 metas, 3,851 m] | 5,09: p. 151 / 14 metas: p. 151 / 3,851 m: p. 151 | igual |
| movimiento.html#iteracion-2 (l. 232) | «…la iteración 2 la odometría sumó 3,851 m mientras el robot seguía en su posición» [3,851 m] | 3,851 m: p. 151 | igual |
| movimiento.html#tres-senales (l. 237) | «…3,851 m. Mapa sin crecimiento. Posición real sin» [3,851 m] | 3,851 m: p. 151 | igual |
| movimiento.html#tres-senales (l. 242) | «…iteración 2 de la exploración. La odometría sumó 3,851 m, pero el robot no se movió de su posición inicial.…» [3,851 m] | 3,851 m: p. 151 | igual |
| movimiento.html#sim-cuadrado (l. 259) | «…efectiva es 2 % mayor que la configurada, en un cuadrado de 1 m el recorrido antihorario vuelve casi exacto…» [1 m] | 1 m: p. 146 | igual |
| movimiento.html#sim-cuadrado (l. 261) | «…que la izquierda, y en la recta de 2 m el robot se desviaría unos 4 cm hacia la derecha.…» [4 cm] | 4 cm: p. 157 | igual |
| movimiento.html#ayuda-pie (l. 317) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| movimiento.html#ayuda-pie (l. 318) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| movimiento.html#search-results (l. 328) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `mundo-real.html`

Elementos: igual 7, igual (coincidencia débil) 6, cálculo o dato ajeno a la tesis 2.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| mundo-real.html#perseverance (l. 191) | «…elige su camino y replanifica para esquivar rocas. En el sol 200 de la misión recorrió por su cuenta 167…» [200, 175] | dato de la NASA, no de la tesis | cálculo o dato ajeno a la tesis |
| mundo-real.html#t-breve (l. 96) | «…casos con su fuente, de Chile a» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| mundo-real.html#control-crucero (l. 210) | «…Fuente 10» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| mundo-real.html#marlin (l. 220) | «…Fuente 11» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| mundo-real.html#px4 (l. 230) | «…Fuente 12» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| mundo-real.html#optimism (l. 246) | «…Fuente 13» [13] | 13: p. 30, 36, 61 | igual (coincidencia débil) |
| mundo-real.html#subt-virtual (l. 256) | «…Fuente 14» [14] | 14: p. 31, 36, 61 | igual (coincidencia débil) |
| mundo-real.html#perseverance (l. 191) | «…esquivar rocas. En el sol 200 de la misión recorrió por su cuenta 167 de 175 metros. El video de…» [167] | 167: p. 104 | igual |
| mundo-real.html#escala (l. 271) | «…Un recinto de 3,50 m² de área libre Casas, bodegas, minas, cuevas y» [3,50 m²] | 3,50 m²: p. 90, 93, 95 | igual |
| mundo-real.html#escala (l. 272) | «…Hombre muerto, prioridad manual y detención a los 2 s Normas de seguridad funcional y» [2 s] | 2 s: p. 146 | igual |
| mundo-real.html#ayuda-pie (l. 324) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| mundo-real.html#ayuda-pie (l. 325) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| mundo-real.html#search-results (l. 335) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `navegacion.html`

Elementos: igual 63, igual (coincidencia débil) 21, cálculo o dato ajeno a la tesis 6.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| navegacion.html#sim-inflacion (l. 135) | «…costo 0 cerca de una pared. El simulador compara 0,15 m, 0,24 m y 0,55 m, el valor por defecto…» [0,55 m] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| navegacion.html#por-que-no-subir (l. 140) | «…valor por defecto de Nav2 es de 0,55 m. En un recinto pequeño, con pasillos angostos, un radio» [0,55 m] | valor por defecto de Nav2 según su documentación | cálculo o dato ajeno a la tesis |
| navegacion.html#astar (l. 146) | «…numérico En la grilla de ejemplo con un muro, Dijkstra revisa 291 celdas y A estrella 111 para encontrar la…» [291 celdas] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| navegacion.html#sim-astar (l. 149) | «…de ejemplo con un muro entre el robot y la meta, Dijkstra revisa 291 celdas y A estrella 111 para…» [291 celdas] | cálculo o ejemplo propio de la guía | cálculo o dato ajeno a la tesis |
| navegacion.html#mundo-real (l. 218) | «…elige su camino y replanifica para esquivar rocas. En el sol 200 de la misión recorrió por su cuenta 167…» [200, 175] | dato de la NASA, no de la tesis | cálculo o dato ajeno a la tesis |
| navegacion.html#sim-inflacion (l. 137) | «…el robot real la huella configurada es un rectángulo que va de 8 cm detrás del centro a 20 cm…» [8 cm, 20 cm, 13 cm, 0,15] | 8 cm: p. 25, 36, 61 / 20 cm: p. 36, 37, 61 / 13 cm: p. 30, 36, 61 / 0,15: p. 74, 92, 120 | igual (coincidencia débil) |
| navegacion.html#astar (l. 146) | «…revisa 291 celdas y A estrella 111 para encontrar la misma ruta de 27 pasos. En este robot NavFn con…» [27] | 27: p. 44, 61, 77 | igual (coincidencia débil) |
| navegacion.html#sim-astar (l. 149) | «…revisa 291 celdas y A estrella 111 para encontrar la misma ruta de 27 pasos. Necesita JavaScript para avanzar paso…» [27] | 27: p. 44, 61, 77 | igual (coincidencia débil) |
| navegacion.html#sim-dwb (l. 160) | «…puntaje. El simulador prueba 7 velocidades entre 0 y 0,15 m/s y 15 giros entre −0,35 y 0,35 rad/s, los…» [15, 0,35] | 15: p. 32, 36, 61 / 0,35: p. 60, 82, 128 | igual (coincidencia débil) |
| navegacion.html#sim-dwb (l. 168) | «…de DWB 0,15 m/s Luego el controlador diferencial la recorta a 0,13» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| navegacion.html#sim-dwb (l. 170) | «…de llegada 0,10 m La meta se da por alcanzada a menos de 10» [10 cm] | 10 cm: p. 27, 36, 40 | igual (coincidencia débil) |
| navegacion.html#sim-dwb (l. 172) | «…de progreso 0,05 m en 6 s Si el robot no avanza 5 cm en 6 s, se declara una» [0,05 m] | 0,05 m: p. 88, 89, 144 | igual (coincidencia débil) |
| navegacion.html#amcl (l. 194) | «…la localización de Monte Carlo adaptativa, un filtro de partículas 10 . Cada partícula es una hipótesis de dónde está…» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| navegacion.html#evaluacion (l. 200) | «…sin intervención manual , y 59 metas llegaron a ejecutarse. De los 54 abortos, 53 cumplen el criterio temporal de…» [54, 53] | 54: p. 71, 90, 91 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| navegacion.html#alcance-nav (l. 205) | «…→ odom, y su lanzador para Foxy permite elegir entre ambos modos 13 . Por cada meta y repetición debería…» [13, 14, 15] | 13: p. 30, 36, 61 / 14: p. 31, 36, 61 / 15: p. 32, 36, 61 | igual (coincidencia débil) |
| navegacion.html#alcance-nav (l. 207) | «…repeticiones bastarían? Con esas tres metas y cinco repeticiones, 15 éxitos en 15 intentos permitirían afirmar con 95 % de» [15, 95 %] | 15: p. 32, 36, 61 / 95 %: p. 93, 94, 155 | igual (coincidencia débil) |
| navegacion.html#mundo-real (l. 220) | «…Fuentes 11 12» [11, 12] | 11: p. 21, 28, 29 / 12: p. 29, 36, 51 | igual (coincidencia débil) |
| navegacion.html (l. 85) | «…mapa de costos global durante una exploración real, en bucle. La línea verde es la ruta que planifica Nav2. Fig. 4.7 de…» [Figura 4.7] | Figura 4.7 «Evolución del mapa de costos global durante una ejecución…» p. 75 | igual |
| navegacion.html#nav2 (l. 109) | «…se conectan los componentes de la navegación, desde el láser hasta los motores. Fig. 4.6 de la» [Figura 4.6] | Figura 4.6 «Interacción entre los componentes de la navegación autónoma.» p. 73 | igual |
| navegacion.html#costos (l. 122) | «…detectadas en la fase inicial. Fig. 4.7» [Figura 4.7] | Figura 4.7 «Evolución del mapa de costos global durante una ejecución…» p. 75 | igual |
| navegacion.html#costos (l. 126) | «…planificada por Nav2 hacia una meta. Fig. 4.7» [Figura 4.7] | Figura 4.7 «Evolución del mapa de costos global durante una ejecución…» p. 75 | igual |
| navegacion.html#costos (l. 130) | «…avanzada del recinto. Fig. 4.7» [Figura 4.7] | Figura 4.7 «Evolución del mapa de costos global durante una ejecución…» p. 75 | igual |
| navegacion.html#sim-dwb (l. 174) | «…Tabla A5.1 de la tesis.» [Tabla A5.1] | Tabla A5.1 «Parámetros principales de Nav2 y DWB.» p. 144 | igual |
| navegacion.html#f1 (l. 230) | «…Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Secciones 3.9, 3.10, 4.5.2 a 4.5.5 y…» [Sec. 3.9, Sec. 3.10, Sec. 4.5.2, Sec. 4.5.5, Sec. 5.4, Tabla 4.5, Tabla A5.1, Tabla A5.2 +3] | Sec. 3.9 «Localización en mapas conocidos» p. 47 / Sec. 3.10 «Planificación de rutas y control local» p. 48 / Sec. 4.5.2 «Localización sobre un mapa conocido con AMCL» p. 72 / Sec. 4.5.5 «Árbol de comportamiento y recuperación» p. 74 / Sec. 5.4 «Navegación autónoma y exploración» p. 89 / +6 más | igual |
| navegacion.html#t-breve (l. 97) | «…metas del explorador que Nav2 llegó a ejecutar en el robot» [59 metas] | 59 metas: p. 93 | igual |
| navegacion.html#t-breve (l. 98) | «…m radio de inflación en el robot real, frente a 0,24 m de» [0,15 m, 0,24 m] | 0,15 m: p. 74, 92, 120 / 0,24 m: p. 145 | igual |
| navegacion.html#t-breve (l. 99) | «…Hz frecuencia con que el controlador local elige» [8 Hz] | 8 Hz: p. 144 | igual |
| navegacion.html#t-breve (l. 100) | «…m distancia a la que una meta se da por» [0,10 m] | 0,10 m: p. 91, 144, 155 | igual |
| navegacion.html#costos (l. 118) | «…Las celdas del obstáculo tienen el costo máximo, que en Nav2 es 254. Las que están a menos del radio…» [254, 253] | 254: p. 145 / 253: p. 145 | igual |
| navegacion.html#sim-inflacion (l. 135) | «…un pasillo de ejemplo con celdas de 5 cm, la celda del obstáculo vale 254, las celdas a menos del» [5 cm, 254, 0,08 m, 253, 0,15 m, 0,24 m] | 5 cm: p. 157 / 254: p. 145 / 0,08 m: p. 120, 145 / 253: p. 145 / 0,15 m: p. 74, 92, 120 / 0,24 m: p. 145 | igual |
| navegacion.html#sim-inflacion (l. 137) | «…cm por delante, con 13 cm a cada lado. Su radio inscrito es de unos 0,08 m y su esquina…» [0,08 m, 0,24 m, 0,15 m] | 0,08 m: p. 120, 145 / 0,24 m: p. 145 / 0,15 m: p. 74, 92, 120 | igual |
| navegacion.html#astar (l. 146) | «…de ejemplo con un muro, Dijkstra revisa 291 celdas y A estrella 111 para encontrar la misma ruta de 27…» [111, 0,5 m] | 111: p. 128 / 0,5 m: p. 74, 144 | igual |
| navegacion.html#sim-astar (l. 149) | «…entre el robot y la meta, Dijkstra revisa 291 celdas y A estrella 111 para encontrar la misma ruta de…» [111] | 111: p. 128 | igual |
| navegacion.html#sim-astar (l. 151) | «…planificar a través de espacio desconocido y acepta llegar hasta 0,5 m de la meta 1» [0,5 m] | 0,5 m: p. 74, 144 | igual |
| navegacion.html#sim-dwb (l. 160) | «…la de menor puntaje. El simulador prueba 7 velocidades entre 0 y 0,15 m/s y 15 giros entre −0,35 y…» [0,15 m/s, 0,35 rad/s] | 0,15 m/s: p. 144 / 0,35 rad/s: p. 60, 82, 128 | igual |
| navegacion.html#sim-dwb (l. 167) | «…del controlador 8 Hz Elige nuevas velocidades ocho veces por» [8 Hz] | 8 Hz: p. 144 | igual |
| navegacion.html#sim-dwb (l. 168) | «…lineal máxima de DWB 0,15 m/s Luego el controlador diferencial la recorta a 0,13» [0,15 m/s] | 0,15 m/s: p. 144 | igual |
| navegacion.html#sim-dwb (l. 169) | «…máximo 0,35 rad/s Igual al límite del controlador» [0,35 rad/s] | 0,35 rad/s: p. 60, 82, 128 | igual |
| navegacion.html#sim-dwb (l. 170) | «…de llegada 0,10 m La meta se da por alcanzada a menos de 10» [0,10 m] | 0,10 m: p. 91, 144, 155 | igual |
| navegacion.html#sim-dwb (l. 171) | «…de orientación 3,14 rad No exige una orientación final, solo la» [3,14 rad] | 3,14 rad: p. 120, 144 | igual |
| navegacion.html#sim-dwb (l. 172) | «…de progreso 0,05 m en 6 s Si el robot no avanza 5 cm en 6 s, se declara una…» [6 s, 5 cm] | 6 s: p. 84, 144, 145 / 5 cm: p. 157 | igual |
| navegacion.html#recuperacion (l. 183) | «…global Borra el mapa de costos en 1,5» [1,5 m] | 1,5 m: p. 146 | igual |
| navegacion.html#recuperacion (l. 184) | «…local Borra el mapa local en 1,0» [1,0 m] | 1,0 m: p. 146 | igual |
| navegacion.html#recuperacion (l. 185) | «…0,15 m a 0,05 m/s, máximo 8» [0,15 m, 0,05 m/s, 8 s] | 0,15 m: p. 74, 92, 120 / 0,05 m/s: p. 146 / 8 s: p. 146 | igual |
| navegacion.html#recuperacion (l. 186) | «…0,8 rad para ver otra» [0,8 rad] | 0,8 rad: p. 146 | igual |
| navegacion.html#recuperacion (l. 187) | «…Esperar 2 s antes de reintentar.» [2 s] | 2 s: p. 146 | igual |
| navegacion.html#evaluacion (l. 200) | «…las metas del explorador en las cinco ejecuciones válidas, durante 12,7 min y 21,9 m de recorrido, sin intervención manual…» [12,7 min, 21,9 m, 59 metas] | 12,7 min: p. 92 / 21,9 m: p. 92, 93, 98 / 59 metas: p. 93 | igual |
| navegacion.html#alcance-nav (l. 206) | «…del mundo simulado, y la tolerancia que imprime para el modo real, 0,22 m, no coincide con los 0,10 m…» [0,22 m, 0,10 m] | 0,22 m: p. 155 / 0,10 m: p. 91, 144, 155 | igual |
| navegacion.html#mundo-real (l. 218) | «…esquivar rocas. En el sol 200 de la misión recorrió por su cuenta 167 de 175» [167] | 167: p. 104 | igual |
| navegacion.html#ayuda-pie (l. 271) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| navegacion.html#ayuda-pie (l. 272) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| navegacion.html#search-results (l. 282) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `preguntas.html`

Elementos: igual 488, igual (coincidencia débil) 314, cálculo o dato ajeno a la tesis 7.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| preguntas.html#p-cinta (l. 372) | «…entre encoders y cinta se repitió en las cinco pruebas, entre 5,4 y 7,4 cm, y eso apunta a un…» [7,4 cm] | diferencia entre odometría y cinta calculada con la Tabla A6.2 | cálculo o dato ajeno a la tesis |
| preguntas.html#p-resolucion (l. 472) | «…la pregunta sigue Un pulso por ciclo equivale a unos 0,003 m/s, así que el encoder es más fino que…» [0,003 m/s] | cálculo de la guía | cálculo o dato ajeno a la tesis |
| preguntas.html#p-solo-013 (l. 482) | «…control. En un giro sobre su eje a 0,35 rad/s, cada rueda va a unos 0,033 m/s, cerca de 10…» [0,033 m/s] | cálculo de la guía | cálculo o dato ajeno a la tesis |
| preguntas.html#p-decimales (l. 503) | «…y la rueda girando pareja, un error de 3 pulsos da un aumento de 0,99, que se corta a cero,…» [0,99] | cálculo de la guía con las ganancias de la Tabla 4.4 | cálculo o dato ajeno a la tesis |
| preguntas.html#p-decimales (l. 504) | «…de la guía a la tesis. Anexos 4.4, 4.5 y 4.12 y Sección 5.2. El 0,99 es un cálculo con…» [0,99] | cálculo de la guía con las ganancias de la Tabla 4.4 | cálculo o dato ajeno a la tesis |
| preguntas.html#p-ki-lineal (l. 835) | «…Con 33 ms por ciclo equivale a una constante de tiempo de unos 6,6» [6,6 s] | cálculo de la guía | cálculo o dato ajeno a la tesis |
| preguntas.html#p-ki-lineal (l. 837) | «…de la guía a la tesis. Anexo 4.12 y Tabla A4.5. Los 6,6 s son un cálculo con el polo…» [6,6 s] | cálculo de la guía | cálculo o dato ajeno a la tesis |
| preguntas.html (l. 84) | «…Lectura 106 preguntas en 15 temas» [15] | 15: p. 32, 36, 61 | igual (coincidencia débil) |
| preguntas.html#t-breve (l. 109) | «…las 106 preguntas en PDF Con respuestas, repreguntas y respaldo. 48 páginas, 0,5» [48 páginas] | 48 páginas: p. 65, 110 | igual (coincidencia débil) |
| preguntas.html#p-oe3-parcial (l. 160) | «…cinco corridas válidas, con 21,9 m de recorrido autónomo. De los 54 abortos, 53 cumplen el criterio temporal de asociación…» [54, 53] | 54: p. 71, 90, 91 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| preguntas.html#p-una-de-sesenta (l. 168) | «…Si de 60 destinos el robot llegó a uno, ¿cómo me convence de que» [60] | 60: p. 77, 90, 91 | igual (coincidencia débil) |
| preguntas.html#p-una-de-sesenta (l. 170) | «…llega. El programa de exploración vuelve a elegir destino cada 3,3 segundos y manda el nuevo sin cancelar el anterior.…» [3,3, 53, 54] | 3,3: p. 38, 40, 41 / 53: p. 68, 70, 91 / 54: p. 71, 90, 91 | igual (coincidencia débil) |
| preguntas.html#p-una-de-sesenta (l. 173) | «…de la guía a la tesis. Sección 5.4, Tabla A7.1 y Anexo 8.4 1» [5.4] | 5.4: p. 74, 76, 84 | igual (coincidencia débil) |
| preguntas.html#p-metas-fijas (l. 183) | «…antes de usarlo. Con esas tres metas y cinco repeticiones, 15 éxitos en 15 permitirían afirmar una tasa de éxito…» [15] | 15: p. 32, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-metas-fijas (l. 184) | «…de la guía a la tesis. Alcances y limitaciones, Sección 5.4 y Anexo 8.3 1» [5.4] | 5.4: p. 74, 76, 84 | igual (coincidencia débil) |
| preguntas.html#p-exploro-todo (l. 192) | «…las cinco, entre 3,478 y 3,540 m², con una desviación estándar de 0,03 m², lo que indica que todas llegaron…» [0,03 m², 92, 10 cm] | 0,03 m²: p. 88 / 92: p. 109, 157 / 10 cm: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-exploro-todo (l. 193) | «…índice medio de cobertura libre de 62,2 %, no que el robot cubre el 62 % del» [62 %] | 62 %: p. 79, 112, 143 | igual (coincidencia débil) |
| preguntas.html#p-exploro-todo (l. 195) | «…de la guía a la tesis. Sección 5.3, Tabla 5.4, Anexo 8.5 y Limitaciones, validez externa 1» [5.3] | 5.3: p. 70, 72, 80 | igual (coincidencia débil) |
| preguntas.html#p-oe2-parcial (l. 204) | «…enteros, y el desempeño se midió en un único punto de operación, 0,13 m/s. Por eso queda en» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| preguntas.html#p-oe2-parcial (l. 206) | «…de la guía a la tesis. Sección 4.4.3, Sección 5.2 y Conclusiones, OE2 1» [4.4, 5.2] | 4.4: p. 44, 57, 58 / 5.2: p. 66, 71, 75 | igual (coincidencia débil) |
| preguntas.html#p-aporte (l. 215) | «…leer el sistema. La ley llamada PID opera como un PI incremental, y 53 de los 54 abortos de metas…» [53, 54] | 53: p. 68, 70, 91 / 54: p. 71, 90, 91 | igual (coincidencia débil) |
| preguntas.html#p-en-simple (l. 232) | «…de la guía a la tesis. Sección 1.1 y Limitaciones, validez externa 1» [1.1] | 1.1: p. 22, 23, 24 | igual (coincidencia débil) |
| preguntas.html#p-costo (l. 242) | «…sus características, un procesador Intel Core i7-10610U con 32 GB de» [32] | 32: p. 49, 77, 108 | igual (coincidencia débil) |
| preguntas.html#p-costo (l. 243) | «…de la guía a la tesis. Sección 4.1, Tabla A1.1, Anexo 1.2 con la Tabla A1.2 y Tabla A3.2 1» [4.1] | 4.1: p. 22, 51, 52 | igual (coincidencia débil) |
| preguntas.html#p-ahorro (l. 249) | «…¿Por qué el robot sale un 32 % más barato, pero el» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-comprar (l. 258) | «…¿Por qué construir este robot en vez de comprar un» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| preguntas.html#p-sin-computador (l. 268) | «…¿El robot podría explorar solo, sin el computador? Para» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| preguntas.html#p-sin-computador (l. 273) | «…de la guía a la tesis. Capítulo 2, Sección 3.2, Sección 4.5.3 y Anexo 3.1 1» [3.2, 4.5] | 3.2: p. 37, 38, 39 / 4.5: p. 58, 59, 65 | igual (coincidencia débil) |
| preguntas.html#p-estable-simple (l. 279) | «…Sin matemáticas, ¿qué significa que el control de las» [13] | 13: p. 30, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-estable-simple (l. 282) | «…holgura queda. Sin retardo, la ganancia del lazo podría crecer unas 88 veces antes de oscilar, y con un retardo…» [88, 0,1 s] | 88: p. 105 / 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-estable-simple (l. 284) | «…de la guía a la tesis. Sección 4.4.3, Anexo 4.12 y Tabla A4.5. Las 88 y 4,7 veces convierten» [4.4, 88] | 4.4: p. 44, 57, 58 / 88: p. 105 | igual (coincidencia débil) |
| preguntas.html#p-exactitud-simple (l. 290) | «…¿Qué tan parecido es el mapa que hizo el robot al lugar» [14] | 14: p. 31, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-exactitud-simple (l. 294) | «…de la guía a la tesis. Sección 5.3 y Anexo 8.5, con las Tablas A8.2 y A8.3 1» [5.3] | 5.3: p. 70, 72, 80 | igual (coincidencia débil) |
| preguntas.html#p-foxy (l. 305) | «…Descartó ROS 1 porque su soporte terminó, pero usa ROS 2» [15] | 15: p. 32, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-fronteras-vs (l. 316) | «…¿Por qué exploración por fronteras y no un método de» [16] | 16: p. 33, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-adaptado (l. 325) | «…¿Qué programó usted y qué adaptó de otros proyectos?» [17] | 17: p. 34, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-energia (l. 335) | «…¿Cómo se alimenta el robot?» [18] | 18: p. 35, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-energia (l. 338) | «…de la guía a la tesis. Sección 4.3.1 y Figura 4.5 1» [4.3] | 4.3: p. 45, 52, 56 | igual (coincidencia débil) |
| preguntas.html#p-red (l. 344) | «…¿Cómo es la red entre el robot y el computador, y pudo» [19] | 19: p. 36, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-dos-errores (l. 358) | «…¿Qué diferencia hay entre el 7,18 % y el 3,63 %?» [20] | 20: p. 36, 37, 61 | igual (coincidencia débil) |
| preguntas.html#p-dos-errores (l. 360) | «…del robot real y de la misma recta. Le ordené avanzar 2 metros a 0,13 m/s durante 15,4 segundos. Los…» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| preguntas.html#p-dos-errores (l. 363) | «…de la guía a la tesis. Sección 5.1, Tabla 5.1 y Tabla A6.2 1» [5.1] | 5.1: p. 79, 80, 81 | igual (coincidencia débil) |
| preguntas.html#p-cinta (l. 369) | «…¿Cómo sabe que la cinta métrica es más confiable que los» [21] | 21: p. 38, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-cinta (l. 372) | «…entre encoders y cinta se repitió en las cinco pruebas, entre 5,4 y 7,4 cm, y eso apunta a un…» [5,4] | 5,4: p. 74, 76, 84 | igual (coincidencia débil) |
| preguntas.html#p-cinta (l. 373) | «…de la guía a la tesis. Sección 5.1 y Tabla A6.2. Las diferencias por prueba son un cálculo» [5.1] | 5.1: p. 79, 80, 81 | igual (coincidencia débil) |
| preguntas.html#p-sesgo-mapa (l. 379) | «…Si ese sesgo de la odometría se acumula durante una» [22] | 22: p. 39, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-giro (l. 389) | «…En la prueba de giro el script ordena 0,4 rad/s, pero el» [23, 0,35] | 23: p. 40, 61, 77 / 0,35: p. 60, 82, 128 | igual (coincidencia débil) |
| preguntas.html#p-giro (l. 391) | «…tomaría una vuelta a esa velocidad, pero el controlador limita a 0,35, así que con un límite ideal el robot…» [0,35, 315 grados] | 0,35: p. 60, 82, 128 / 315 grados: p. 82, 150 | igual (coincidencia débil) |
| preguntas.html#p-giro (l. 392) | «…los giros superaron los 315 grados y la causa no la determiné. Los registros de cada prueba» [315 grados] | 315 grados: p. 82, 150 | igual (coincidencia débil) |
| preguntas.html#p-giro (l. 394) | «…de la guía a la tesis. Sección 5.1, Tabla 5.2, Anexo 6 y Tabla A6.4 1» [5.1] | 5.1: p. 79, 80, 81 | igual (coincidencia débil) |
| preguntas.html#p-pid-discreto (l. 405) | «…Explique con sus palabras el control PID en tiempo» [24] | 24: p. 41, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-pid-discreto (l. 407) | «…Arduino no trabaja en tiempo continuo. Cada 33 milisegundos compara la velocidad pedida con la medida,» [33] | 33: p. 50, 64, 68 | igual (coincidencia débil) |
| preguntas.html#p-kd (l. 415) | «…El código tiene una ganancia llamada Kd cercana a 20.» [25, 20] | 25: p. 42, 51, 57 / 20: p. 36, 37, 61 | igual (coincidencia débil) |
| preguntas.html#p-kd (l. 418) | «…de 0,41 y 0,40 PWM por tick/ciclo y a tiempos integrales de 42 y 40 ms. La tesis la llama…» [42] | 42: p. 59, 67, 104 | igual (coincidencia débil) |
| preguntas.html#p-kd (l. 420) | «…de la guía a la tesis. Sección 4.4.3 con la Ecuación 4.1, Tabla 4.4 y Anexos 4.4, 4.5 y 4.12» [4.4] | 4.4: p. 44, 57, 58 | igual (coincidencia débil) |
| preguntas.html#p-no-reemplazo (l. 426) | «…Si ya sabía que no era un PID, ¿por qué no la reemplazó» [26] | 26: p. 43, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-no-reemplazo (l. 431) | «…de la guía a la tesis. Sección 4.4.3, Anexo 4.5 y Limitaciones, ley de control 1» [4.4] | 4.4: p. 44, 57, 58 | igual (coincidencia débil) |
| preguntas.html#p-windup (l. 437) | «…¿Qué es el windup y cómo lo evita el firmware?» [27] | 27: p. 44, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-windup (l. 441) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.4 1» [4.4] | 4.4: p. 44, 57, 58 | igual (coincidencia débil) |
| preguntas.html#p-por-que-pso (l. 447) | «…¿Por qué usó PSO y no una sintonía clásica, como Ziegler» [28] | 28: p. 45, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-aporte-pso (l. 457) | «…¿Qué aportó realmente el PSO, si después del ajuste en el» [29] | 29: p. 46, 77, 107 | igual (coincidencia débil) |
| preguntas.html#p-aporte-pso (l. 459) | «…muerta del driver. Se corrigieron en el robot, subiendo Kp entre 28 y 63 %, bajando Kd entre 41 y…» [28, 41] | 28: p. 45, 61, 77 / 41: p. 58, 68, 86 | igual (coincidencia débil) |
| preguntas.html#p-aporte-pso (l. 460) | «…no se compararon con las ganancias originales del firmware, Kp 20, Kd 12 y Ki 0, así que no se…» [20, 12] | 20: p. 36, 37, 61 / 12: p. 29, 36, 51 | igual (coincidencia débil) |
| preguntas.html#p-resolucion (l. 468) | «…¿Cómo informa un error de 0,002 m/s si la resolución de» [30] | 30: p. 47, 53, 77 | igual (coincidencia débil) |
| preguntas.html#p-resolucion (l. 471) | «…un sobreimpulso menor a un paso, que equivale a cerca del 8 % de la referencia. Por eso la guía…» [8 %, 2 %] | 8 %: p. 25, 36, 61 / 2 %: p. 18, 19, 20 | igual (coincidencia débil) |
| preguntas.html#p-resolucion (l. 473) | «…de la guía a la tesis. Sección 5.2, Tabla 5.3, Tabla A4.2, Anexo 4.11 y Nomenclatura 1» [5.2] | 5.2: p. 66, 71, 75 | igual (coincidencia débil) |
| preguntas.html#p-solo-013 (l. 479) | «…Evaluó el control solo a 0,13 m/s. ¿Qué espera a» [31, 0,13 m/s] | 31: p. 48, 77, 105 / 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| preguntas.html#p-solo-013 (l. 481) | «…0,13 m/s es el límite de velocidad lineal que impone el» [0,13 m/s, 0,25 m/s²] | 0,13 m/s: p. 60, 70, 80 / 0,25 m/s²: p. 143, 144 | igual (coincidencia débil) |
| preguntas.html#p-solo-013 (l. 482) | «…0,13 m/s cada rueda cuenta unos 41 pulsos por ciclo de control. En» [0,13 m/s, 41 pulsos, 10 pulsos, 2 pulsos, 14 pulsos] | 0,13 m/s: p. 60, 70, 80 / 41 pulsos: p. 58, 68, 86 / 10 pulsos: p. 27, 36, 40 / 2 pulsos: p. 18, 19, 20 / 14 pulsos: p. 31, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-solo-013 (l. 483) | «…de la guía a la tesis. Tabla 4.3, Sección 5.2, Anexos 4.4 y 4.12, Tabla A5.1 y Nomenclatura, con el» [5.2, 313,56 pulsos] | 5.2: p. 66, 71, 75 / 313,56 pulsos: p. 165 | igual (coincidencia débil) |
| preguntas.html#p-camino-orden (l. 489) | «…Explíquenos cómo llega una orden de velocidad desde Nav2» [32] | 32: p. 49, 77, 108 | igual (coincidencia débil) |
| preguntas.html#p-camino-orden (l. 491) | «…diferencial en la Raspberry Pi. Ese controlador la limita a 0,13 m/s y 0,35 rad/s y, con el modelo cinemático,…» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| preguntas.html#p-camino-orden (l. 492) | «…a entero y la envía al Arduino con el comando m, en un ciclo de 30 Hz. En el Arduino,…» [30 Hz, 33 ms] | 30 Hz: p. 53, 127, 128 / 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| preguntas.html#p-decimales (l. 500) | «…¿Dónde se pierden decimales en el firmware y qué efecto» [33] | 33: p. 50, 64, 68 | igual (coincidencia débil) |
| preguntas.html#p-decimales (l. 503) | «…de la rueda derecha y la rueda girando pareja, un error de 3 pulsos da un aumento de 0,99, que…» [3 pulsos] | 3 pulsos: p. 20, 24, 25 | igual (coincidencia débil) |
| preguntas.html#p-decimales (l. 504) | «…de la guía a la tesis. Anexos 4.4, 4.5 y 4.12 y Sección 5.2. El 0,99 es un cálculo con…» [5.2] | 5.2: p. 66, 71, 75 | igual (coincidencia débil) |
| preguntas.html#p-pi-adecuado (l. 510) | «…¿Es razonable un PI, sin acción derivativa, para» [34] | 34: p. 51, 77, 105 | igual (coincidencia débil) |
| preguntas.html#p-pi-adecuado (l. 514) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.6 1 5 20 15» [4.4, 20, 15] | 4.4: p. 44, 57, 58 / 20: p. 36, 37, 61 / 15: p. 32, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-slam-toolbox (l. 525) | «…¿Por qué eligió slam_toolbox y no otro algoritmo de SLAM?» [35] | 35: p. 52, 70, 71 | igual (coincidencia débil) |
| preguntas.html#p-trejos (l. 534) | «…¿Trejos evaluó slam_toolbox? ¿Qué peso tiene el argumento» [36] | 36: p. 53, 77, 108 | igual (coincidencia débil) |
| preguntas.html#p-cierre-lazo (l. 545) | «…¿Qué es un cierre de lazo y por qué en su tesis figura» [37] | 37: p. 54, 108 | igual (coincidencia débil) |
| preguntas.html#p-marcos (l. 556) | «…¿Qué marcos de referencia usa y quién publica cada uno?» [38] | 38: p. 55, 109, 115 | igual (coincidencia débil) |
| preguntas.html#p-lidar-2d (l. 565) | «…¿Por qué un LiDAR 2D y no una cámara?» [39] | 39: p. 56, 108, 109 | igual (coincidencia débil) |
| preguntas.html#p-lee-laser (l. 574) | «…¿Cómo lee el robot el láser?» [40] | 40: p. 57, 67, 109 | igual (coincidencia débil) |
| preguntas.html#p-lee-laser (l. 576) | «…cada uno. Por eso el láser real entrega 230 sectores y el simulado 360 puntos sin» [360 puntos] | 360 puntos: p. 38, 80, 81 | igual (coincidencia débil) |
| preguntas.html#p-astar (l. 589) | «…¿Cómo decide A estrella qué ruta tomar y qué cambia» [41] | 41: p. 58, 68, 86 | igual (coincidencia débil) |
| preguntas.html#p-astar (l. 593) | «…de la guía a la tesis. Sección 3.10 con la Ecuación 3.15, Tabla 4.5 y Tabla A5.1 1» [3.10] | 3.10: p. 39, 42, 48 | igual (coincidencia débil) |
| preguntas.html#p-admisible (l. 599) | «…¿Qué condición tiene que cumplir esa estimación para que» [42] | 42: p. 59, 67, 104 | igual (coincidencia débil) |
| preguntas.html#p-admisible (l. 602) | «…de la guía a la tesis. Sección 3.10 1» [3.10] | 3.10: p. 39, 42, 48 | igual (coincidencia débil) |
| preguntas.html#p-inflacion (l. 608) | «…El radio de inflación es 0,15 m y la esquina del robot» [43] | 43: p. 60, 109, 115 | igual (coincidencia débil) |
| preguntas.html#p-inflacion (l. 610) | «…de inflación es menor que la distancia a la esquina, así que entre 0,15 y 0,24 m de un obstáculo…» [0,15] | 0,15: p. 74, 92, 120 | igual (coincidencia débil) |
| preguntas.html#p-dwb (l. 618) | «…¿Qué hace el controlador local DWB?» [44] | 44: p. 61, 68, 96 | igual (coincidencia débil) |
| preguntas.html#p-dwb (l. 620) | «…pedir hasta 0,15 m/s, aunque el controlador diferencial limita a» [0,13] | 0,13: p. 60, 70, 80 | igual (coincidencia débil) |
| preguntas.html#p-dwb (l. 621) | «…de la guía a la tesis. Sección 3.10 con la Ecuación 3.16, Tabla 4.5 y Tabla A5.1 1» [3.10] | 3.10: p. 39, 42, 48 | igual (coincidencia débil) |
| preguntas.html#p-amcl (l. 627) | «…¿Qué es AMCL y por qué no lo usó?» [45] | 45: p. 62, 86, 110 | igual (coincidencia débil) |
| preguntas.html#p-logica-explorador (l. 642) | «…Explíqueme la lógica de su explorador. ¿Cuándo manda una» [46] | 46: p. 63, 105, 110 | igual (coincidencia débil) |
| preguntas.html#p-logica-explorador (l. 644) | «…explorador revisa el mapa de costos global cada 3,3 segundos, porque su frecuencia está configurada en 0,3» [3,3] | 3,3: p. 38, 40, 41 | igual (coincidencia débil) |
| preguntas.html#p-logica-explorador (l. 646) | «…de la guía a la tesis. Sección 4.5.6 con el Algoritmo 4.4, Sección 5.4, Tabla A5.4 y Anexo» [4.5, 5.4] | 4.5: p. 58, 59, 65 / 5.4: p. 74, 76, 84 | igual (coincidencia débil) |
| preguntas.html#p-lista-negra (l. 652) | «…¿Qué problema resuelve la lista negra del explorador y» [47] | 47: p. 64, 110 | igual (coincidencia débil) |
| preguntas.html#p-lista-negra (l. 654) | «…que no puede alcanzar. Un punto entra a la lista si el robot pasa 10 segundos sin progreso hacia él…» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-lista-negra (l. 655) | «…queda sin candidatas, vacía la lista y vuelve a intentar. Eso pasó 17 veces en las cinco iteraciones válidas, 11…» [17, 11] | 17: p. 34, 36, 61 / 11: p. 21, 28, 29 | igual (coincidencia débil) |
| preguntas.html#p-lista-negra (l. 657) | «…de la guía a la tesis. Sección 3.11, Algoritmo 4.4, Sección 5.4 y Anexo 5.6 1» [5.4] | 5.4: p. 74, 76, 84 | igual (coincidencia débil) |
| preguntas.html#p-no-corrigio (l. 663) | «…Si el reemplazo de metas explica casi todos los abortos,» [48] | 48: p. 65, 110 | igual (coincidencia débil) |
| preguntas.html#p-yamauchi (l. 672) | «…¿Qué criterio propone Yamauchi para elegir a qué frontera» [49] | 49: p. 66, 110, 118 | igual (coincidencia débil) |
| preguntas.html#p-yamauchi (l. 675) | «…con un puntaje que combina distancia y tamaño, vuelve a elegir cada 3,3 segundos sin esperar a llegar, y acepta…» [3,3] | 3,3: p. 38, 40, 41 | igual (coincidencia débil) |
| preguntas.html#p-frontera-minima (l. 683) | «…Configuró un tamaño mínimo de frontera de 5 cm, una sola» [50] | 50: p. 67, 95, 110 | igual (coincidencia débil) |
| preguntas.html#p-frontera-minima (l. 685) | «…celdas de 0,05 m, ese valor admite fronteras de una sola celda. El» [0,05 m] | 0,05 m: p. 88, 89, 144 | igual (coincidencia débil) |
| preguntas.html#p-oe1 (l. 699) | «…¿Con qué criterio da por cumplido el OE1, y qué evidencia» [51] | 51: p. 68, 111, 143 | igual (coincidencia débil) |
| preguntas.html#p-oe1 (l. 703) | «…de la guía a la tesis. Sección 4.2.4, Tabla A2.2, Sección 5.5 y Conclusiones, OE1 1» [4.2, 5.5] | 4.2: p. 44, 53, 54 / 5.5: p. 82, 88, 91 | igual (coincidencia débil) |
| preguntas.html#p-registro-gemelo (l. 709) | «…¿Dónde quedó registrado lo que observó, por ejemplo la» [52] | 52: p. 69, 111 | igual (coincidencia débil) |
| preguntas.html#p-339-718 (l. 718) | «…¿El 3,39 % de simulación y el 7,18 % del robot miden lo» [53] | 53: p. 68, 70, 91 | igual (coincidencia débil) |
| preguntas.html#p-339-718 (l. 723) | «…de la guía a la tesis. Sección 5.1, Tablas 5.1 y 5.2, y Sección 5.5 1» [5.1, 5.5] | 5.1: p. 79, 80, 81 / 5.5: p. 82, 88, 91 | igual (coincidencia débil) |
| preguntas.html#p-para-que-sim (l. 729) | «…Si el mundo simulado no es el recinto real, ¿para qué le» [54] | 54: p. 71, 90, 91 | igual (coincidencia débil) |
| preguntas.html#p-video (l. 739) | «…¿Qué demuestra el video del robot y qué no? Para todo» [55] | 55: p. 72, 111, 120 | igual (coincidencia débil) |
| preguntas.html#p-video (l. 743) | «…de la guía a la tesis. Sección 5.4 con la Figura 5.5, y Figura A7.1 1» [5.4] | 5.4: p. 74, 76, 84 | igual (coincidencia débil) |
| preguntas.html#p-iteracion-2 (l. 754) | «…En la iteración 2 el robot no se movió, pero la odometría» [56] | 56: p. 73, 111, 115 | igual (coincidencia débil) |
| preguntas.html#p-iteracion-2 (l. 759) | «…de la guía a la tesis. Anexo 7, Sección 5.4 y Conclusiones, OE4 1» [5.4] | 5.4: p. 74, 76, 84 | igual (coincidencia débil) |
| preguntas.html#p-verificador (l. 765) | «…Nav2 tiene un verificador de progreso que exige 5 cm cada» [57] | 57: p. 68, 74, 96 | igual (coincidencia débil) |
| preguntas.html#p-verificador (l. 768) | «…13 metas abortadas de esa corrida no se clasificaron, así que no» [13 metas] | 13 metas: p. 30, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-verificador (l. 769) | «…sigue En esa corrida hubo 14 metas en 5,09 minutos, cerca de 22 segundos por meta en promedio. Es más…» [22] | 22: p. 39, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-verificador (l. 770) | «…de la guía a la tesis. Tabla A5.1, Sección 4.3.2 y Anexo 7. Los 22 segundos son un cálculo con…» [4.3, 22] | 4.3: p. 45, 52, 56 / 22: p. 39, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-oficina (l. 776) | «…Si llevo su robot a una oficina con sillas, mesas,» [58] | 58: p. 75, 104, 112 | igual (coincidencia débil) |
| preguntas.html#p-oficina (l. 780) | «…de la guía a la tesis. Sección 3.3.1, Alcances y limitaciones, Limitaciones y Anexo 5.2 1» [3.3] | 3.3: p. 38, 40, 41 | igual (coincidencia débil) |
| preguntas.html#p-espacio-mayor (l. 786) | «…Si el espacio fuera treinta veces más grande que su» [59] | 59: p. 76, 90, 93 | igual (coincidencia débil) |
| preguntas.html#p-estable-como (l. 800) | «…¿Cómo verificó que el lazo de velocidad es estable?» [60] | 60: p. 77, 90, 91 | igual (coincidencia débil) |
| preguntas.html#p-estable-como (l. 802) | «…de cada rueda se discretizó de forma exacta con el período de 33 ms, incluyendo el retenedor que mantiene el…» [33 ms] | 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| preguntas.html#p-estable-como (l. 803) | «…las ganancias definitivas lo son, sin retardo y con un retardo de 0,1 s. Los márgenes de fase van de…» [0,1 s, 53 °, 57 °, 41 °, 44 °, 1,2] | 0,1 s: p. 68, 69, 70 / 53 °: p. 68, 70, 91 / 57 °: p. 68, 74, 96 / 41 °: p. 58, 68, 86 / 44 °: p. 61, 68, 96 / 1,2: p. 23, 25, 32 | igual (coincidencia débil) |
| preguntas.html#p-estable-como (l. 805) | «…de la guía a la tesis. Sección 4.4.3, Anexo 4.12 y Tabla A4.5 1 7» [4.4] | 4.4: p. 44, 57, 58 | igual (coincidencia débil) |
| preguntas.html#p-margenes (l. 811) | «…¿Qué indica cada margen y por qué informa también la» [61] | 61: p. 78, 107, 112 | igual (coincidencia débil) |
| preguntas.html#p-margenes (l. 814) | «…que el lazo pasa cerca de oscilar. Sus valores típicos están entre 1,2 y» [1,2] | 1,2: p. 23, 25, 32 | igual (coincidencia débil) |
| preguntas.html#p-margenes (l. 815) | «…sigue Con las ganancias originales del firmware, en el escenario de 0,1 s, la sensibilidad máxima llega a 2,18, fuera…» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-retardo-escenario (l. 822) | «…Si el retardo identificado es de 0,0001 y 0,0692 s, ¿de» [62, 0,1 s] | 62: p. 79, 112, 143 / 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-retardo-escenario (l. 824) | «…datos se capturaron cada 0,1 s, y al simular el modelo el retardo se convierte en un» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-retardo-escenario (l. 825) | «…sin retardo, que es el modelo efectivamente ajustado, y con 0,1 s como escenario de sensibilidad, sin presentarlo como una» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-retardo-escenario (l. 826) | «…Los datos no lo descartan ni lo confirman. En el escenario de 0,1 s, el margen de retardo, de 0,32…» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-retardo-escenario (l. 827) | «…de la guía a la tesis. Anexos 4.6, 4.10 y 4.12, y Tabla A4.4 1 12» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| preguntas.html#p-ki-lineal (l. 833) | «…En la rueda izquierda aparece un polo de 0,995. ¿No está» [63] | 63: p. 80, 86, 112 | igual (coincidencia débil) |
| preguntas.html#p-ki-lineal (l. 835) | «…uno, así que el modelo es estable, pero es un modo muy lento. Con 33 ms por ciclo equivale a…» [33 ms] | 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| preguntas.html#p-ki-lineal (l. 836) | «…Aun en el caso desfavorable, los márgenes de fase son de 53,4° sin retardo y 40,7° con 0,1 s, y…» [53,4 °, 40,7 °, 0,1 s] | 53,4 °: p. 88, 90, 142 / 40,7 °: p. 142 / 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-ki-lineal (l. 837) | «…A4.5. Los 6,6 s son un cálculo con el polo de 0,995 y el período de 33 ms 1» [33 ms] | 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| preguntas.html#p-no-lineal (l. 843) | «…Su análisis es lineal. ¿Qué parte del firmware deja fuera» [64] | 64: p. 81, 113, 118 | igual (coincidencia débil) |
| preguntas.html#p-barrido (l. 854) | «…¿Cuánto podría diferir la rueda real del modelo antes de» [65] | 65: p. 82, 105, 113 | igual (coincidencia débil) |
| preguntas.html#p-barrido (l. 856) | «…script recorre 625 combinaciones de la ganancia de la planta, entre 0,1 y 10 veces la identificada, y de su…» [0,1, 10, 0,05, 0,1 s, 4,4] | 0,1: p. 68, 69, 70 / 10: p. 27, 36, 40 / 0,05: p. 68, 88, 89 / 0,1 s: p. 68, 69, 70 / 4,4: p. 44, 57, 58 | igual (coincidencia débil) |
| preguntas.html#p-otras-velocidades (l. 864) | «…Si los márgenes no dependen de la velocidad, ¿el control» [66] | 66: p. 83, 107, 113 | igual (coincidencia débil) |
| preguntas.html#p-otras-velocidades (l. 867) | «…eso el desempeño se informa solo a 0,13 m/s, el límite lineal del controlador diferencial. Extender» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| preguntas.html#p-pso-mas-margen (l. 874) | «…Si las ganancias del PSO tienen más margen que las» [67] | 67: p. 84, 113 | igual (coincidencia débil) |
| preguntas.html#p-pso-mas-margen (l. 877) | «…en el robot no aparecen. Las definitivas tienen menos margen, de 53° a 57° frente a 64° a 71°, pero…» [53 °, 57 °, 64 °, 71 °] | 53 °: p. 68, 70, 91 / 57 °: p. 68, 74, 96 / 64 °: p. 81, 113, 118 / 71 °: p. 88, 114, 143 | igual (coincidencia débil) |
| preguntas.html#p-pso-mas-margen (l. 878) | «…de la guía a la tesis. Sección 5.2, Figura 5.3 y Anexo 4.12 1» [5.2] | 5.2: p. 66, 71, 75 | igual (coincidencia débil) |
| preguntas.html#p-originales (l. 884) | «…¿Cómo se comparan sus ganancias con las que traía el» [68] | 68: p. 85, 113, 118 | igual (coincidencia débil) |
| preguntas.html#p-originales (l. 886) | «…firmware original usaba Kp 20, Kd 12, Ki 0 y Ko 50, enteras y comunes a ambas ruedas.» [20, 12, 50, 49 °, 50 °, 35 °, 0,1 s, 53 °, +3 más] | 20: p. 36, 37, 61 / 12: p. 29, 36, 51 / 50: p. 67, 95, 110 / 49 °: p. 66, 110, 118 / 50 °: p. 67, 95, 110 / 35 °: p. 52, 70, 71 / 0,1 s: p. 68, 69, 70 / 53 °: p. 68, 70, 91 / +3 más | igual (coincidencia débil) |
| preguntas.html#p-incremental-estable (l. 894) | «…¿Por qué la estabilidad de un PI incremental es la de un» [69] | 69: p. 86, 112, 113 | igual (coincidencia débil) |
| preguntas.html#p-incremental-estable (l. 897) | «…eso da 0,41 y 0,40 PWM por tick/ciclo y tiempos integrales de 42 y 40» [42] | 42: p. 59, 67, 104 | igual (coincidencia débil) |
| preguntas.html#p-incremental-estable (l. 898) | «…qué no diseñó en tiempo continuo y lo discretizó? El período de 33 ms por la frecuencia de cruce da…» [33 ms, 0,05] | 33 ms: p. 64, 68, 127 / 0,05: p. 68, 88, 89 | igual (coincidencia débil) |
| preguntas.html#p-incremental-estable (l. 899) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.12, Ecuación A4.1 1 5 7» [4.4] | 4.4: p. 44, 57, 58 | igual (coincidencia débil) |
| preguntas.html#p-plano-como (l. 910) | «…¿Cómo midió la exactitud de los mapas?» [70] | 70: p. 87, 111, 112 | igual (coincidencia débil) |
| preguntas.html#p-plano-como (l. 913) | «…el robot pudo observar, los que tienen una celda libre a menos de 10 cm, entre el 92 y el…» [10 cm, 92, 3,72 cm] | 10 cm: p. 27, 36, 40 / 92: p. 109, 157 / 3,72 cm: p. 151, 157, 158 | igual (coincidencia débil) |
| preguntas.html#p-plano-como (l. 914) | «…de la guía a la tesis. Sección 5.3 y Anexo 8.5 1 3» [5.3] | 5.3: p. 70, 72, 80 | igual (coincidencia débil) |
| preguntas.html#p-repetible-exacto (l. 920) | «…¿Por qué no bastaba con que el área libre fuera casi» [71] | 71: p. 88, 114, 143 | igual (coincidencia débil) |
| preguntas.html#p-repetible-exacto (l. 924) | «…de la guía a la tesis. Sección 5.3 y Anexo 8.5 1» [5.3] | 5.3: p. 70, 72, 80 | igual (coincidencia débil) |
| preguntas.html#p-huincha (l. 930) | «…¿No es débil usar como referencia un plano medido con» [72] | 72: p. 89, 112, 114 | igual (coincidencia débil) |
| preguntas.html#p-huincha (l. 933) | «…instrumento de mayor precisión y repetir la comparación es el punto 10 del trabajo» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-12cm (l. 940) | «…Los pasillos salen 12 cm más anchos en los mapas. ¿A qué» [73] | 73: p. 90, 104, 112 | igual (coincidencia débil) |
| preguntas.html#p-12cm (l. 943) | «…partes, el primer pasillo sale 4,1 cm más ancho, el segundo 2,4 cm y el tercero 5,2 cm. Los dos» [4,1 cm, 2,4 cm, 5,2 cm] | 4,1 cm: p. 22, 51, 52 / 2,4 cm: p. 43, 135, 159 / 5,2 cm: p. 66, 71, 75 | igual (coincidencia débil) |
| preguntas.html#p-12cm (l. 944) | «…de los pasillos. En la otra dirección, el alto del recinto sale 1,7 cm más corto, así que no se…» [1,7 cm] | 1,7 cm: p. 91, 159 | igual (coincidencia débil) |
| preguntas.html#p-sin-escala (l. 951) | «…¿Por qué alineó los mapas sin ajustar su escala? ¿No» [74] | 74: p. 91, 105 | igual (coincidencia débil) |
| preguntas.html#p-tabiques (l. 960) | «…¿Por qué las mayores diferencias aparecen en los tabiques» [75] | 75: p. 92 | igual (coincidencia débil) |
| preguntas.html#p-tabiques (l. 962) | «…de muy pocas mediciones. Las diferencias llegan a −6,1, −7,8 y +9,3 cm, entre una y dos celdas, mientras el…» [9,3 cm, 5,2 cm] | 9,3 cm: p. 158, 159 / 5,2 cm: p. 66, 71, 75 | igual (coincidencia débil) |
| preguntas.html#p-tabiques (l. 963) | «…se compara su posición, a 0,61 m del muro derecho en el plano y a 0,70 m en los mapas,…» [0,70 m] | 0,70 m: p. 159 | igual (coincidencia débil) |
| preguntas.html#p-percentil (l. 970) | «…¿Qué diferencia hay entre el percentil 95 de 8,4 cm y el» [76, 95, 3,1] | 76: p. 93 / 95: p. 89, 93, 94 / 3,1: p. 19, 34, 35 | igual (coincidencia débil) |
| preguntas.html#p-percentil (l. 972) | «…preguntas distintas. El percentil 95 describe cómo se reparten las distancias de todos los» [95] | 95: p. 89, 93, 94 | igual (coincidencia débil) |
| preguntas.html#p-percentil (l. 973) | «…la incertidumbre de la huincha o del alineamiento. Y el percentil 95 conjunto no es el promedio de los percentiles…» [95, 9,6 cm] | 95: p. 89, 93, 94 / 9,6 cm: p. 158 | igual (coincidencia débil) |
| preguntas.html#p-dos-sentidos (l. 980) | «…¿Por qué la distancia del mapa al plano da más que la del» [77] | 77: p. 94 | igual (coincidencia débil) |
| preguntas.html#p-dos-sentidos (l. 984) | «…de la guía a la tesis. Sección 5.3, Anexo 8.5 y Tabla A8.2 1» [5.3] | 5.3: p. 70, 72, 80 | igual (coincidencia débil) |
| preguntas.html#p-mas-fino (l. 990) | «…Si cada celda mide 5 cm, ¿cómo puede informar una» [78] | 78: p. 95, 155 | igual (coincidencia débil) |
| preguntas.html#p-mas-fino (l. 993) | «…La resolución no es una cota del error geométrico: el percentil 95 llega a 8,4 cm, y una de las…» [95, 9,3 cm] | 95: p. 89, 93, 94 / 9,3 cm: p. 158, 159 | igual (coincidencia débil) |
| preguntas.html#p-observados (l. 1000) | «…¿Por qué dejó fuera los puntos del plano que el robot no» [79] | 79: p. 96, 115 | igual (coincidencia débil) |
| preguntas.html#p-observados (l. 1002) | «…punto del plano cuenta si tiene una celda libre del mapa a menos de 10» [10 cm] | 10 cm: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-observados (l. 1003) | «…importante es que se informa cuántos quedan fuera. Cuentan entre el 92 y el 93 % de los puntos, y…» [92] | 92: p. 109, 157 | igual (coincidencia débil) |
| preguntas.html#p-cinco-bastan (l. 1015) | «…¿Cinco repeticiones bastan para sacar conclusiones?» [80] | 80: p. 97, 161 | igual (coincidencia débil) |
| preguntas.html#p-cinco-bastan (l. 1017) | «…%, el área libre entre 3,46 y 3,53 m² y la distancia al plano entre 3,1 y 3,7 cm. La…» [3,1, 21,6 °] | 3,1: p. 19, 34, 35 / 21,6 °: p. 94, 160 | igual (coincidencia débil) |
| preguntas.html#p-cinco-bastan (l. 1019) | «…de la guía a la tesis. Sección 5.6, Anexo 8.6 y Tabla A8.4 1 8» [5.6] | 5.6: p. 50, 76, 77 | igual (coincidencia débil) |
| preguntas.html#p-intervalo-simple (l. 1025) | «…¿Qué quiere decir que el error de la odometría esté entre» [81] | 81: p. 98 | igual (coincidencia débil) |
| preguntas.html#p-intervalo-simple (l. 1028) | «…95 % indica la confianza del método: si el ensayo se repitiera» [95 %, 95] | 95 %: p. 93, 94, 155 / 95: p. 89, 93, 94 | igual (coincidencia débil) |
| preguntas.html#p-intervalo-simple (l. 1029) | «…de la guía a la tesis. Sección 5.6, Ecuación A8.2 y Tabla A8.4 1 8» [5.6] | 5.6: p. 50, 76, 77 | igual (coincidencia débil) |
| preguntas.html#p-binomial (l. 1035) | «…Cinco de seis exploraciones salieron bien. ¿Por qué no» [82, 83 %] | 82: p. 99, 112 / 83 %: p. 100, 115, 118 | igual (coincidencia débil) |
| preguntas.html#p-binomial (l. 1038) | «…cinco éxitos o más en seis ocurriría con probabilidad 7/64, unas 11 veces de cada 100, y eso no permite…» [11, 0,05] | 11: p. 21, 28, 29 / 0,05: p. 68, 88, 89 | igual (coincidencia débil) |
| preguntas.html#p-binomial (l. 1039) | «…de la guía a la tesis. Sección 5.6 y Anexo 8.6 1 8 9» [5.6] | 5.6: p. 50, 76, 77 | igual (coincidencia débil) |
| preguntas.html#p-cuantas (l. 1045) | «…¿Cuántas repeticiones habría necesitado y con qué» [83] | 83: p. 100, 115, 118 | igual (coincidencia débil) |
| preguntas.html#p-cuantas (l. 1047) | «…admisible un mínimo de 6 a 10 repeticiones válidas por ensayo, con 10 por condición como objetivo de partida y…» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-cuantas (l. 1049) | «…una desviación estándar y señala que a menudo se recomiendan 10, aunque no se refiere a ensayos» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-cuantas (l. 1050) | «…de la guía a la tesis. Sección 5.6, Anexo 8.6 y trabajo futuro 1 10» [5.6, 10] | 5.6: p. 50, 76, 77 / 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-control-una (l. 1066) | «…En el control hay una sola captura por conjunto de» [85] | 85: p. 102 | igual (coincidencia débil) |
| preguntas.html#p-cobertura-ancha (l. 1076) | «…¿Por qué el intervalo de la cobertura es tan ancho y el» [86] | 86: p. 103, 124 | igual (coincidencia débil) |
| preguntas.html#p-cobertura-ancha (l. 1078) | «…mapa, que no está anclada al recinto. Su desviación estándar es de 12,9 puntos y su intervalo va de 46,2…» [12,9 puntos, 0,03 m²] | 12,9 puntos: p. 95, 97 / 0,03 m²: p. 88 | igual (coincidencia débil) |
| preguntas.html#p-cobertura-ancha (l. 1080) | «…de la guía a la tesis. Sección 5.3, Tabla 5.4 y Tabla A8.4 1» [5.3] | 5.3: p. 70, 72, 80 | igual (coincidencia débil) |
| preguntas.html#p-15-de-15 (l. 1086) | «…Si ejecutara el protocolo de metas fijas preparado, ¿qué» [87] | 87: p. 104 | igual (coincidencia débil) |
| preguntas.html#p-15-de-15 (l. 1090) | «…de la guía a la tesis. Anexo 8.3 1 9 21 22» [21, 22] | 21: p. 38, 61, 77 / 22: p. 39, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-literatura (l. 1096) | «…¿Cómo se compara su número de ensayos con la literatura?» [88] | 88: p. 105 | igual (coincidencia débil) |
| preguntas.html#p-literatura (l. 1100) | «…de la guía a la tesis. Anexo 8.6 1 18 3 19» [18, 19] | 18: p. 35, 36, 61 / 19: p. 36, 61, 77 | igual (coincidencia débil) |
| preguntas.html#p-angular (l. 1106) | «…La desviación angular va de 1,8 a 21,6°. ¿Qué se puede» [89, 21,6 °] | 89: p. 106 / 21,6 °: p. 94, 160 | igual (coincidencia débil) |
| preguntas.html#p-angular (l. 1108) | «…un límite de 0,35 rad/s. Con ese límite ideal el robot llegaría a 315°, pero todos los giros lo superaron…» [315 °] | 315 °: p. 82, 150 | igual (coincidencia débil) |
| preguntas.html#p-angular (l. 1110) | «…de la guía a la tesis. Sección 5.1, Tabla 5.2, Anexo 6 y Tabla A8.4 1» [5.1] | 5.1: p. 79, 80, 81 | igual (coincidencia débil) |
| preguntas.html#p-ref-astrom (l. 1121) | «…¿Qué toma de Åström y Hägglund y cómo calza su ley con el» [90] | 90: p. 38, 86, 107 | igual (coincidencia débil) |
| preguntas.html#p-ref-astrom (l. 1125) | «…a la tesis. Secciones 3.6 y 4.4.3 y Anexo 4.12, con las secciones 3.4, 3.6, 13.1 y 13.4 del libro…» [3.4, 3.6, 13.4] | 3.4: p. 39, 40, 41 / 3.6: p. 41, 43, 52 / 13.4: p. 44, 65, 66 | igual (coincidencia débil) |
| preguntas.html#p-ref-wittenmark (l. 1131) | «…¿Para qué cita a Wittenmark, Åström y Årzén?» [91] | 91: p. 108, 118 | igual (coincidencia débil) |
| preguntas.html#p-ref-wittenmark (l. 1133) | «…estabilidad. Los valores típicos de la sensibilidad máxima, entre 1,2 y 2,0. El intervalo de 0,05 a 0,14 para el…» [1,2, 0,05] | 1,2: p. 23, 25, 32 / 0,05: p. 68, 88, 89 | igual (coincidencia débil) |
| preguntas.html#p-ref-wittenmark (l. 1135) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.12 1 7» [4.4] | 4.4: p. 44, 57, 58 | igual (coincidencia débil) |
| preguntas.html#p-ref-gokce (l. 1141) | «…Gökçe y otros también usaron PSO para un robot móvil. ¿En» [92] | 92: p. 109, 157 | igual (coincidencia débil) |
| preguntas.html#p-ref-gokce (l. 1145) | «…de la guía a la tesis. Sección 3.7.1 y Anexo 4.10 1 11» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| preguntas.html#p-ref-trejos-metrica (l. 1151) | «…¿Qué tomó de Trejos y otros, si ellos no evaluaron» [93] | 93: p. 110, 157 | igual (coincidencia débil) |
| preguntas.html#p-ref-vincent (l. 1161) | «…¿Por qué cita un trabajo sobre políticas de aprendizaje» [94] | 94: p. 111 | igual (coincidencia débil) |
| preguntas.html#p-ref-vincent (l. 1164) | «…qué permitiría afirmar el protocolo de metas fijas, más de 78 % con 15 éxitos en» [15] | 15: p. 32, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-ref-vincent (l. 1165) | «…de la guía a la tesis. Sección 5.6 y Anexos 8.3 y 8.6 1 9» [5.6] | 5.6: p. 50, 76, 77 | igual (coincidencia débil) |
| preguntas.html#p-ref-eurachem (l. 1171) | «…La guía Eurachem es de química analítica. ¿Por qué la usa» [95] | 95: p. 89, 93, 94 | igual (coincidencia débil) |
| preguntas.html#p-ref-eurachem (l. 1173) | «…una desviación estándar y señala que a menudo se recomiendan 10. La tesis la usa para mostrar que su mínimo…» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-ref-eurachem (l. 1175) | «…de la guía a la tesis. Sección 5.6 y Anexo 8.6 1 10» [5.6, 10] | 5.6: p. 50, 76, 77 / 10: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-ref-maxim (l. 1181) | «…¿Por qué un modelo de primer orden con retardo? ¿Qué» [96] | 96: p. 113 | igual (coincidencia débil) |
| preguntas.html#p-ref-maxim (l. 1185) | «…de la guía a la tesis. Sección 3.5 y Anexo 4.6 1 12 20» [3.5, 12, 20] | 3.5: p. 41, 42, 44 / 12: p. 29, 36, 51 / 20: p. 36, 37, 61 | igual (coincidencia débil) |
| preguntas.html#p-ref-pso (l. 1191) | «…¿Qué toma de Clerc y Kennedy y de Shi y Eberhart en su» [97] | 97: p. 114 | igual (coincidencia débil) |
| preguntas.html#p-ref-pso (l. 1193) | «…de su fórmula cuando los coeficientes cognitivo y social suman 4,1, con 2,05 cada uno. De Shi y Eberhart, la…» [4,1] | 4,1: p. 22, 51, 52 | igual (coincidencia débil) |
| preguntas.html#p-ref-pso (l. 1195) | «…3.7.1 con las Ecuaciones 3.13 y 3.14, Tabla A4.3 y Anexo 4.8 1 13 14» [13, 14] | 13: p. 30, 36, 61 / 14: p. 31, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-ref-uso-pi (l. 1201) | «…Afirma que el PI incremental es de los controladores más» [98] | 98: p. 115 | igual (coincidencia débil) |
| preguntas.html#p-ref-uso-pi (l. 1205) | «…de la guía a la tesis. Sección 4.4.3. Las demás fuentes de esta lista están en el tema de» [4.4, 15, 16, 17] | 4.4: p. 44, 57, 58 / 15: p. 32, 36, 61 / 16: p. 33, 36, 61 / 17: p. 34, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-impl-estabilidad (l. 1216) | «…¿Cómo calcula el script de estabilidad los polos y los» [99] | 99: p. 116 | igual (coincidencia débil) |
| preguntas.html#p-impl-plano (l. 1228) | «…más cercana, solo en los puntos con una celda libre a menos de 10» [10 cm] | 10 cm: p. 27, 36, 40 | igual (coincidencia débil) |
| preguntas.html#p-impl-plano (l. 1229) | «…ocupadas de una franja alrededor de los muros, los percentiles 95 y el intervalo entre corridas. Sus resultados quedaron en» [95] | 95: p. 89, 93, 94 | igual (coincidencia débil) |
| preguntas.html#p-impl-metas (l. 1238) | «…agrupa los mensajes por el identificador de 16 bytes de cada meta, conserva su primer estado terminal y» [16] | 16: p. 33, 36, 61 | igual (coincidencia débil) |
| preguntas.html#p-impl-kd25 (l. 1246) | «…el PSO informa Kd de 34,69 y 36,70 si el costo nunca evaluó más de 25?» [25] | 25: p. 42, 51, 57 | igual (coincidencia débil) |
| preguntas.html#p-impl-kd25 (l. 1248) | «…al intervalo de 0,0001 a 1 y la escala, y para Kd la escala es 25. Al final, el script…» [25] | 25: p. 42, 51, 57 | igual (coincidencia débil) |
| preguntas.html#p-impl-kd25 (l. 1249) | «…de Kd terminó en 1,39 y 1,47, así que el costo evaluó Kd = 25 en ambas ruedas y el…» [25, 12] | 25: p. 42, 51, 57 / 12: p. 29, 36, 51 | igual (coincidencia débil) |
| preguntas.html#p-impl-captura (l. 1256) | «…¿Las capturas cada 0,1 s registran siempre una medición nueva?» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-impl-captura (l. 1259) | «…la velocidad se calcula dividiendo por el período nominal de 0,1 s y no por el tiempo real entre lecturas.…» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| preguntas.html#p-impl-atomica (l. 1268) | «…contadores de los encoders son variables de 32 bits que actualizan las interrupciones. La rutina que los» [32] | 32: p. 49, 77, 108 | igual (coincidencia débil) |
| preguntas.html#p-impl-semilla (l. 1279) | «…y no la cifra del PSO. Fijar la semilla es parte del punto 12 del trabajo» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| preguntas.html#p-impl-planta-pso (l. 1288) | «…la consigna del promedio de la respuesta en lazo abierto desde los 7 s, cuantiza solo la medición que entra…» [7 s] | 7 s: p. 86, 136, 138 | igual (coincidencia débil) |
| preguntas.html#p-objetivo-general (l. 152) | «…de la guía a la tesis. Secciones 5.4 y 5.6, Tabla 5.5, Anexos 7 y 8.5 y Conclusiones 1» [Sec. 5.4, Sec. 5.6, Tabla 5.5, Anexo 7, Anexo 8.5] | Sec. 5.4 «Navegación autónoma y exploración» p. 89 / Sec. 5.6 «Alcance estadístico de los ensayos» p. 94 / Tabla 5.5 «Estado de validación por subsistema.» p. 93 / Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 / Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-oe3-parcial (l. 162) | «…de la guía a la tesis. Tabla 5.5 y Conclusiones, OE3 1» [Tabla 5.5] | Tabla 5.5 «Estado de validación por subsistema.» p. 93 | igual |
| preguntas.html#p-una-de-sesenta (l. 173) | «…de la guía a la tesis. Sección 5.4, Tabla A7.1 y Anexo 8.4 1» [Tabla A7.1, Anexo 8.4] | Tabla A7.1 «Resultado de las metas de navegación de la exploración,…» p. 152 / Anexo 8.4 «Limitaciones de los contadores de exploración» p. 155 | igual |
| preguntas.html#p-metas-fijas (l. 184) | «…de la guía a la tesis. Alcances y limitaciones, Sección 5.4 y Anexo 8.3 1» [Anexo 8.3] | Anexo 8.3 «Mediciones no incluidas en los ensayos» p. 155 | igual |
| preguntas.html#p-exploro-todo (l. 195) | «…de la guía a la tesis. Sección 5.3, Tabla 5.4, Anexo 8.5 y Limitaciones, validez externa 1» [Tabla 5.4, Anexo 8.5] | Tabla 5.4 «Indicadores de mapeo en hardware real por iteración (resolución» p. 88 / Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-aporte (l. 216) | «…de hardware no se escribieron desde cero. Vienen de proyectos abiertos, y su origen se declara en el Anexo 3.1. Decirlo deja…» [Anexo 3.1] | Anexo 3.1 «Entorno de ejecución y workspace» p. 122 | igual |
| preguntas.html#p-aporte (l. 217) | «…de la guía a la tesis. Introducción, Anexo 3.1 y Conclusiones 1» [Anexo 3.1] | Anexo 3.1 «Entorno de ejecución y workspace» p. 122 | igual |
| preguntas.html#p-costo (l. 243) | «…de la guía a la tesis. Sección 4.1, Tabla A1.1, Anexo 1.2 con la Tabla A1.2 y Tabla A3.2 1» [Tabla A1.1, Anexo 1.2, Tabla A1.2, Tabla A3.2] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 / Anexo 1.2 «» p. 117 / Tabla A1.2 «Comparación de costo con plataformas comerciales.» p. 119 / Tabla A3.2 «Equipamiento de la estación de trabajo y versiones del…» p. 124 | igual |
| preguntas.html#p-ahorro (l. 252) | «…de la guía a la tesis. Tablas A1.1 y A1.2 1» [Tabla A1.1, Tabla A1.2] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 / Tabla A1.2 «Comparación de costo con plataformas comerciales.» p. 119 | igual |
| preguntas.html#p-comprar (l. 262) | «…de la guía a la tesis. Justificación, Anexo 1.2, Anexo 3.4 y Anexo 4.5 1» [Anexo 1.2, Anexo 3.4, Anexo 4.5] | Anexo 1.2 «» p. 117 / Anexo 3.4 «Nodo de adquisición del RPLidar A1» p. 126 / Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 | igual |
| preguntas.html#p-sin-computador (l. 273) | «…de la guía a la tesis. Capítulo 2, Sección 3.2, Sección 4.5.3 y Anexo 3.1 1» [Capítulo 2, Anexo 3.1] | Capítulo 2 «SOLUCIÓN IMPLEMENTADA Este capítulo describe, de forma general, la…» p. 31 / Anexo 3.1 «Entorno de ejecución y workspace» p. 122 | igual |
| preguntas.html#p-estable-simple (l. 284) | «…de la guía a la tesis. Sección 4.4.3, Anexo 4.12 y Tabla A4.5. Las 88 y 4,7 veces convierten a veces los…» [Anexo 4.12, Tabla A4.5] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 | igual |
| preguntas.html#p-exactitud-simple (l. 294) | «…de la guía a la tesis. Sección 5.3 y Anexo 8.5, con las Tablas A8.2 y A8.3 1» [Anexo 8.5, Tabla A8.2, Tabla A8.3] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Tabla A8.2 «Distancias geométricas en ambos sentidos y percentil 95, transcritos…» p. 158 / Tabla A8.3 «Distancias del plano del recinto y las mismas distancias…» p. 159 | igual |
| preguntas.html#p-foxy (l. 310) | «…de la guía a la tesis. Alcances y limitaciones, Sección 2.1, Limitaciones y Tabla A3.2 1» [Tabla A3.2] | Tabla A3.2 «Equipamiento de la estación de trabajo y versiones del…» p. 124 | igual |
| preguntas.html#p-fronteras-vs (l. 319) | «…de la guía a la tesis. Secciones 1.4.2 y 2.1 1» [Sec. 1.4.2, Sec. 2.1] | Sec. 1.4.2 «Exploración autónoma» p. 28 / Sec. 2.1 «Selección de tecnologías» p. 32 | igual |
| preguntas.html#p-adaptado (l. 329) | «…de la guía a la tesis. Introducción, Tabla A3.1 y Anexos 3.1 y 3.4 1» [Tabla A3.1, Anexo 3.1, Anexo 3.4] | Tabla A3.1 «Paquetes principales del workspace.» p. 123 / Anexo 3.1 «Entorno de ejecución y workspace» p. 122 / Anexo 3.4 «Nodo de adquisición del RPLidar A1» p. 126 | igual |
| preguntas.html#p-energia (l. 338) | «…de la guía a la tesis. Sección 4.3.1 y Figura 4.5 1» [Figura 4.5] | Figura 4.5 «Esquema de conexiones eléctricas y de datos del robot…» p. 59 | igual |
| preguntas.html#p-red (l. 347) | «…de la guía a la tesis. Anexo 3.1 y Tabla A1.1 1» [Anexo 3.1, Tabla A1.1] | Anexo 3.1 «Entorno de ejecución y workspace» p. 122 / Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 | igual |
| preguntas.html#p-dos-errores (l. 363) | «…de la guía a la tesis. Sección 5.1, Tabla 5.1 y Tabla A6.2 1» [Tabla 5.1, Tabla A6.2] | Tabla 5.1 «Métricas diferenciadas de seguimiento y odometría en la trayectoria…» p. 81 / Tabla A6.2 «Error de odometría en trayectoria rectilínea de 2 m…» p. 150 | igual |
| preguntas.html#p-cinta (l. 373) | «…de la guía a la tesis. Sección 5.1 y Tabla A6.2. Las diferencias por prueba son un cálculo sobre esa tabla 1» [Tabla A6.2] | Tabla A6.2 «Error de odometría en trayectoria rectilínea de 2 m…» p. 150 | igual |
| preguntas.html#p-sesgo-mapa (l. 383) | «…de la guía a la tesis. Secciones 3.8, 4.3.2 y 5.3, Tabla 5.5 y Anexo 8.5 1» [Sec. 3.8, Sec. 4.3.2, Sec. 5.3, Tabla 5.5, Anexo 8.5] | Sec. 3.8 «SLAM basado en grafos» p. 46 / Sec. 4.3.2 «Integración con ROS 2» p. 58 / Sec. 5.3 «Resultados de mapeo con slam_toolbox» p. 87 / Tabla 5.5 «Estado de validación por subsistema.» p. 93 / Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-giro (l. 394) | «…de la guía a la tesis. Sección 5.1, Tabla 5.2, Anexo 6 y Tabla A6.4 1» [Tabla 5.2, Anexo 6, Tabla A6.4] | Tabla 5.2 «Desviación angular respecto de la referencia nominal de 360…» p. 82 / Anexo 6 «Detalle de validación de odometría» p. 149 / Tabla A6.4 «Desviación angular física respecto de la referencia nominal de…» p. 151 | igual |
| preguntas.html#p-pid-discreto (l. 409) | «…de la guía a la tesis. Secciones 3.6 y 4.4.3, y Anexos 3.5 y 4.4 1» [Sec. 3.6, Sec. 4.4.3, Anexo 3.5, Anexo 4.4] | Sec. 3.6 «Control PID» p. 43 / Sec. 4.4.3 «Control de velocidad en el firmware» p. 64 / Anexo 3.5 «Temporalidad y ciclo de la interfaz DiffDriveArduino» p. 126 / Anexo 4.4 «Ecuaciones y estados internos del PI incremental embebido» p. 133 | igual |
| preguntas.html#p-kd (l. 420) | «…de la guía a la tesis. Sección 4.4.3 con la Ecuación 4.1, Tabla 4.4 y Anexos 4.4, 4.5 y 4.12 1» [Ec. 4.1, Tabla 4.4, Anexo 4.4, Anexo 4.5, Anexo 4.12] | Ec. (4.1) p. 64 / Tabla 4.4 «Ganancias definitivas del controlador codificadas en el firmware.» p. 67 / Anexo 4.4 «Ecuaciones y estados internos del PI incremental embebido» p. 133 / Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-no-reemplazo (l. 431) | «…de la guía a la tesis. Sección 4.4.3, Anexo 4.5 y Limitaciones, ley de control 1» [Anexo 4.5] | Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 | igual |
| preguntas.html#p-windup (l. 441) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.4 1» [Anexo 4.4] | Anexo 4.4 «Ecuaciones y estados internos del PI incremental embebido» p. 133 | igual |
| preguntas.html#p-por-que-pso (l. 451) | «…de la guía a la tesis. Secciones 2.1, 3.7 y 4.4.5, y Anexos 4.2 y 4.8 1» [Sec. 2.1, Sec. 3.7, Sec. 4.4.5, Anexo 4.2, Anexo 4.8] | Sec. 2.1 «Selección de tecnologías» p. 32 / Sec. 3.7 «Sintonización de controladores PID mediante PSO» p. 44 / Sec. 4.4.5 «Sintonización del controlador asistida por PSO» p. 69 / Anexo 4.2 «Comparación ilustrativa entre PSO y sintonización Lambda» p. 129 / Anexo 4.8 «Particularidades de la implementación PSO» p. 136 | igual |
| preguntas.html#p-aporte-pso (l. 462) | «…de la guía a la tesis. Secciones 4.4.5 y 5.2, Anexos 4.5, 4.10 y 4.12, y Limitaciones 1» [Sec. 4.4.5, Sec. 5.2, Anexo 4.5, Anexo 4.10, Anexo 4.12] | Sec. 4.4.5 «Sintonización del controlador asistida por PSO» p. 69 / Sec. 5.2 «Evaluación del control de velocidad» p. 83 / Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 / Anexo 4.10 «Resultados de la ejecución PSO empleada» p. 139 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-resolucion (l. 473) | «…de la guía a la tesis. Sección 5.2, Tabla 5.3, Tabla A4.2, Anexo 4.11 y Nomenclatura 1» [Tabla 5.3, Tabla A4.2, Anexo 4.11] | Tabla 5.3 «Indicadores de la respuesta al escalón en lazo cerrado,…» p. 86 / Tabla A4.2 «Comandos del protocolo serial implementado en el firmware.» p. 132 / Anexo 4.11 «Captura de la respuesta en lazo cerrado» p. 140 | igual |
| preguntas.html#p-solo-013 (l. 483) | «…de la guía a la tesis. Tabla 4.3, Sección 5.2, Anexos 4.4 y 4.12, Tabla A5.1 y Nomenclatura, con el factor de» [Tabla 4.3, Anexo 4.4, Anexo 4.12, Tabla A5.1] | Tabla 4.3 «Parámetros principales del controlador diferencial.» p. 60 / Anexo 4.4 «Ecuaciones y estados internos del PI incremental embebido» p. 133 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla A5.1 «Parámetros principales de Nav2 y DWB.» p. 144 | igual |
| preguntas.html#p-camino-orden (l. 494) | «…de la guía a la tesis. Secciones 4.3.3 a 4.3.5, Algoritmos 4.1 y 4.2, Anexo 3.5 y Tablas A4.2 y A5.1 1» [Sec. 4.3.3, Sec. 4.3.5, Algoritmo 4.1, Algoritmo 4.2, Anexo 3.5, Tabla A4.2, Tabla A5.1] | Sec. 4.3.3 «Control diferencial e interfaz de hardware» p. 59 / Sec. 4.3.5 «Teleoperación y multiplexación de comandos» p. 62 / Algoritmo 4.1 «Ciclo ejecutado por la interfaz DiffDriveArduino.» p. 61 / Algoritmo 4.2 «Rutinas de reinicio y actualización del controlador discreto ejecutadas…» p. 67 / Anexo 3.5 «Temporalidad y ciclo de la interfaz DiffDriveArduino» p. 126 / +2 más | igual |
| preguntas.html#p-decimales (l. 504) | «…de la guía a la tesis. Anexos 4.4, 4.5 y 4.12 y Sección 5.2. El 0,99 es un cálculo con las ganancias…» [Anexo 4.4, Anexo 4.5, Anexo 4.12, Tabla 4.4] | Anexo 4.4 «Ecuaciones y estados internos del PI incremental embebido» p. 133 / Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla 4.4 «Ganancias definitivas del controlador codificadas en el firmware.» p. 67 | igual |
| preguntas.html#p-pi-adecuado (l. 514) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.6 1 5 20 15» [Anexo 4.6] | Anexo 4.6 «Procesamiento FOPDT usado por los scripts» p. 135 | igual |
| preguntas.html#p-slam-toolbox (l. 528) | «…de la guía a la tesis. Tabla 1.2 y Secciones 2.1 y 4.5.1 1» [Tabla 1.2, Sec. 2.1, Sec. 4.5.1] | Tabla 1.2 «Comparación general de alternativas para SLAM 2D.» p. 25 / Sec. 2.1 «Selección de tecnologías» p. 32 / Sec. 4.5.1 «Mapeo con slam_toolbox» p. 71 | igual |
| preguntas.html#p-trejos (l. 539) | «…de la guía a la tesis. Tabla 1.2, Secciones 2.1 y 4.5.1, Tabla A3.2 y Anexos 8.3 y 8.5 1» [Tabla 1.2, Sec. 2.1, Sec. 4.5.1, Tabla A3.2, Anexo 8.3, Anexo 8.5] | Tabla 1.2 «Comparación general de alternativas para SLAM 2D.» p. 25 / Sec. 2.1 «Selección de tecnologías» p. 32 / Sec. 4.5.1 «Mapeo con slam_toolbox» p. 71 / Tabla A3.2 «Equipamiento de la estación de trabajo y versiones del…» p. 124 / Anexo 8.3 «Mediciones no incluidas en los ensayos» p. 155 / +1 más | igual |
| preguntas.html#p-cierre-lazo (l. 550) | «…de la guía a la tesis. Secciones 3.8 y 5.3, Tabla A5.3 y Anexos 8.1 y 8.3 1» [Sec. 3.8, Sec. 5.3, Tabla A5.3, Anexo 8.1, Anexo 8.3] | Sec. 3.8 «SLAM basado en grafos» p. 46 / Sec. 5.3 «Resultados de mapeo con slam_toolbox» p. 87 / Tabla A5.3 «Parámetros principales de slam_toolbox cargados en hardware real.» p. 147 / Anexo 8.1 «Procedencia de los indicadores de mapeo» p. 154 / Anexo 8.3 «Mediciones no incluidas en los ensayos» p. 155 | igual |
| preguntas.html#p-marcos (l. 559) | «…de la guía a la tesis. Secciones 3.1, 4.2.2 y 4.3.2, y Anexo 2.1 1» [Sec. 3.1, Sec. 4.2.2, Sec. 4.3.2, Anexo 2.1] | Sec. 3.1 «El robot móvil: estructura, marcos de referencia y rotaciones» p. 34 / Sec. 4.2.2 «Estructura URDF/xacro y marcos de referencia» p. 54 / Sec. 4.3.2 «Integración con ROS 2» p. 58 / Anexo 2.1 «Validación estructural del URDF» p. 121 | igual |
| preguntas.html#p-lidar-2d (l. 568) | «…de la guía a la tesis. Secciones 1.3 y 2.1 1» [Sec. 1.3, Sec. 2.1] | Sec. 1.3 «Percepción y mapeo del entorno» p. 24 / Sec. 2.1 «Selección de tecnologías» p. 32 | igual |
| preguntas.html#p-lee-laser (l. 578) | «…de la guía a la tesis. Anexo 3.4 y Anexo 2 1» [Anexo 3.4, Anexo 2] | Anexo 3.4 «Nodo de adquisición del RPLidar A1» p. 126 / Anexo 2 «Gemelo digital y verificación estructural» p. 120 | igual |
| preguntas.html#p-astar (l. 593) | «…de la guía a la tesis. Sección 3.10 con la Ecuación 3.15, Tabla 4.5 y Tabla A5.1 1» [Ec. 3.15, Tabla 4.5, Tabla A5.1] | Ec. (3.15) p. 48 / Tabla 4.5 «Configuración de los planificadores global y local utilizados.» p. 74 / Tabla A5.1 «Parámetros principales de Nav2 y DWB.» p. 144 | igual |
| preguntas.html#p-inflacion (l. 612) | «…de la guía a la tesis. Secciones 4.5.4 y 5.4, y Anexo 5.2 1» [Sec. 4.5.4, Sec. 5.4, Anexo 5.2] | Sec. 4.5.4 «Mapas de costos» p. 74 / Sec. 5.4 «Navegación autónoma y exploración» p. 89 / Anexo 5.2 «Geometría del costmap e inflación» p. 145 | igual |
| preguntas.html#p-dwb (l. 621) | «…de la guía a la tesis. Sección 3.10 con la Ecuación 3.16, Tabla 4.5 y Tabla A5.1 1» [Ec. 3.16, Tabla 4.5, Tabla A5.1] | Ec. (3.16) p. 49 / Tabla 4.5 «Configuración de los planificadores global y local utilizados.» p. 74 / Tabla A5.1 «Parámetros principales de Nav2 y DWB.» p. 144 | igual |
| preguntas.html#p-amcl (l. 631) | «…de la guía a la tesis. Secciones 3.9 y 4.5.2, y Anexo 5.1 1» [Sec. 3.9, Sec. 4.5.2, Anexo 5.1] | Sec. 3.9 «Localización en mapas conocidos» p. 47 / Sec. 4.5.2 «Localización sobre un mapa conocido con AMCL» p. 72 / Anexo 5.1 «Lanzamiento de la localización con AMCL» p. 145 | igual |
| preguntas.html#p-logica-explorador (l. 646) | «…de la guía a la tesis. Sección 4.5.6 con el Algoritmo 4.4, Sección 5.4, Tabla A5.4 y Anexo 5.6 1» [Algoritmo 4.4, Tabla A5.4, Anexo 5.6] | Algoritmo 4.4 «Integración operativa de explore_lite con Nav2.» p. 77 / Tabla A5.4 «Parámetros principales del explorador de fronteras.» p. 148 / Anexo 5.6 «Particularidades del explorador de fronteras» p. 148 | igual |
| preguntas.html#p-lista-negra (l. 657) | «…de la guía a la tesis. Sección 3.11, Algoritmo 4.4, Sección 5.4 y Anexo 5.6 1» [Algoritmo 4.4, Anexo 5.6] | Algoritmo 4.4 «Integración operativa de explore_lite con Nav2.» p. 77 / Anexo 5.6 «Particularidades del explorador de fronteras» p. 148 | igual |
| preguntas.html#p-no-corrigio (l. 666) | «…de la guía a la tesis. Limitaciones, registro de navegación e integración entre explorador y Nav2, y Anexo 8.4 1» [Anexo 8.4] | Anexo 8.4 «Limitaciones de los contadores de exploración» p. 155 | igual |
| preguntas.html#p-yamauchi (l. 677) | «…de la guía a la tesis. Secciones 1.4.2 y 3.11, Tabla A5.4 y Anexo 5.6 1 , junto con las secciones 2.2…» [Sec. 1.4.2, Sec. 3.11, Tabla A5.4, Anexo 5.6] | Sec. 1.4.2 «Exploración autónoma» p. 28 / Sec. 3.11 «Exploración autónoma basada en fronteras» p. 49 / Tabla A5.4 «Parámetros principales del explorador de fronteras.» p. 148 / Anexo 5.6 «Particularidades del explorador de fronteras» p. 148 | igual |
| preguntas.html#p-frontera-minima (l. 688) | «…de la guía a la tesis. Tabla A5.4 y Anexo 5.6 1» [Tabla A5.4, Anexo 5.6] | Tabla A5.4 «Parámetros principales del explorador de fronteras.» p. 148 / Anexo 5.6 «Particularidades del explorador de fronteras» p. 148 | igual |
| preguntas.html#p-oe1 (l. 703) | «…de la guía a la tesis. Sección 4.2.4, Tabla A2.2, Sección 5.5 y Conclusiones, OE1 1» [Tabla A2.2] | Tabla A2.2 «Criterios mínimos de aceptación del gemelo digital.» p. 122 | igual |
| preguntas.html#p-registro-gemelo (l. 712) | «…de la guía a la tesis. Anexo 2.2 1» [Anexo 2.2] | Anexo 2.2 «Criterios de aceptación del gemelo digital» p. 122 | igual |
| preguntas.html#p-339-718 (l. 723) | «…de la guía a la tesis. Sección 5.1, Tablas 5.1 y 5.2, y Sección 5.5 1» [Tabla 5.1, Tabla 5.2] | Tabla 5.1 «Métricas diferenciadas de seguimiento y odometría en la trayectoria…» p. 81 / Tabla 5.2 «Desviación angular respecto de la referencia nominal de 360…» p. 82 | igual |
| preguntas.html#p-para-que-sim (l. 733) | «…de la guía a la tesis. Secciones 1.5, 4.2 y 5.5, Tabla A2.2 y Limitaciones, fidelidad de la simulación 1» [Sec. 1.5, Sec. 4.2, Sec. 5.5, Tabla A2.2] | Sec. 1.5 «Simulación de robots móviles» p. 28 / Sec. 4.2 «Gemelo digital del robot» p. 53 / Sec. 5.5 «Coherencia entre simulación y hardware» p. 94 / Tabla A2.2 «Criterios mínimos de aceptación del gemelo digital.» p. 122 | igual |
| preguntas.html#p-video (l. 741) | «…RViz, con el mapa que crece y, en verde, la ruta planificada hacia la frontera elegida. Las capturas de la Figura 5.5…» [Figura 5.5] | Figura 5.5 «Ejecución de navegación autónoma y exploración por fronteras» p. 92 | igual |
| preguntas.html#p-video (l. 742) | «…entre simulación y robot, y no reemplaza las mediciones. La evidencia del OE1 son los criterios de la Tabla A2.2, y la…» [Tabla A2.2] | Tabla A2.2 «Criterios mínimos de aceptación del gemelo digital.» p. 122 | igual |
| preguntas.html#p-video (l. 743) | «…de la guía a la tesis. Sección 5.4 con la Figura 5.5, y Figura A7.1 1» [Figura 5.5, Figura A7.1] | Figura 5.5 «Ejecución de navegación autónoma y exploración por fronteras» p. 92 / Figura A7.1 «Secuencia de una ejecución representativa de exploración por» p. 153 | igual |
| preguntas.html#p-iteracion-2 (l. 759) | «…de la guía a la tesis. Anexo 7, Sección 5.4 y Conclusiones, OE4 1» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| preguntas.html#p-verificador (l. 770) | «…de la guía a la tesis. Tabla A5.1, Sección 4.3.2 y Anexo 7. Los 22 segundos son un cálculo con esos datos…» [Tabla A5.1, Anexo 7] | Tabla A5.1 «Parámetros principales de Nav2 y DWB.» p. 144 / Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| preguntas.html#p-oficina (l. 780) | «…de la guía a la tesis. Sección 3.3.1, Alcances y limitaciones, Limitaciones y Anexo 5.2 1» [Anexo 5.2] | Anexo 5.2 «Geometría del costmap e inflación» p. 145 | igual |
| preguntas.html#p-espacio-mayor (l. 789) | «…de la guía a la tesis. Limitaciones, validez externa, deriva odométrica y espacio reducido, y Anexo 8.3 1» [Anexo 8.3] | Anexo 8.3 «Mediciones no incluidas en los ensayos» p. 155 | igual |
| preguntas.html#p-estable-como (l. 805) | «…de la guía a la tesis. Sección 4.4.3, Anexo 4.12 y Tabla A4.5 1 7» [Anexo 4.12, Tabla A4.5] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 | igual |
| preguntas.html#p-margenes (l. 816) | «…de la guía a la tesis. Anexo 4.12, criterios de estabilidad, y Tabla A4.5 1 7» [Anexo 4.12, Tabla A4.5] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 | igual |
| preguntas.html#p-retardo-escenario (l. 827) | «…de la guía a la tesis. Anexos 4.6, 4.10 y 4.12, y Tabla A4.4 1 12» [Anexo 4.6, Anexo 4.10, Anexo 4.12, Tabla A4.4] | Anexo 4.6 «Procesamiento FOPDT usado por los scripts» p. 135 / Anexo 4.10 «Resultados de la ejecución PSO empleada» p. 139 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla A4.4 «Salida registrada de una ejecución de SintonizacionAutomatica.py: modelo FOPDT…» p. 139 | igual |
| preguntas.html#p-ki-lineal (l. 837) | «…de la guía a la tesis. Anexo 4.12 y Tabla A4.5. Los 6,6 s son un cálculo con el polo de 0,995…» [Anexo 4.12, Tabla A4.5] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 | igual |
| preguntas.html#p-no-lineal (l. 848) | «…de la guía a la tesis. Anexo 4.12, condiciones de operación y efectos no incluidos en el análisis lineal 1» [Anexo 4.12] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-barrido (l. 858) | «…de la guía a la tesis. Anexo 4.12 1» [Anexo 4.12] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-otras-velocidades (l. 868) | «…de la guía a la tesis. Anexo 4.12, Limitaciones, ley de control, y trabajo futuro 1» [Anexo 4.12] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-pso-mas-margen (l. 878) | «…de la guía a la tesis. Sección 5.2, Figura 5.3 y Anexo 4.12 1» [Figura 5.3, Anexo 4.12] | Figura 5.3 «Respuesta en lazo cerrado del robot real con las…» p. 84 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-originales (l. 888) | «…de la guía a la tesis. Anexos 4.5 y 4.12 1» [Anexo 4.5, Anexo 4.12] | Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-incremental-estable (l. 899) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.12, Ecuación A4.1 1 5 7» [Anexo 4.12, Ec. A4.1] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Ec. (A4.1) p. 141 | igual |
| preguntas.html#p-plano-como (l. 914) | «…de la guía a la tesis. Sección 5.3 y Anexo 8.5 1 3» [Anexo 8.5] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-repetible-exacto (l. 924) | «…de la guía a la tesis. Sección 5.3 y Anexo 8.5 1» [Anexo 8.5] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-huincha (l. 934) | «…de la guía a la tesis. Anexo 8.5, Limitaciones, exactitud de los mapas, y trabajo futuro 1» [Anexo 8.5] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-12cm (l. 945) | «…de la guía a la tesis. Anexo 8.5, Tabla A8.3 y Limitaciones 1» [Anexo 8.5, Tabla A8.3] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Tabla A8.3 «Distancias del plano del recinto y las mismas distancias…» p. 159 | igual |
| preguntas.html#p-sin-escala (l. 954) | «…de la guía a la tesis. Anexo 8.5 1» [Anexo 8.5] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-tabiques (l. 964) | «…de la guía a la tesis. Anexo 8.5 y Tabla A8.3 1» [Anexo 8.5, Tabla A8.3] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Tabla A8.3 «Distancias del plano del recinto y las mismas distancias…» p. 159 | igual |
| preguntas.html#p-percentil (l. 974) | «…de la guía a la tesis. Anexo 8.5 y Tablas A8.2 y A8.4 1» [Anexo 8.5, Tabla A8.2, Tabla A8.4] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Tabla A8.2 «Distancias geométricas en ambos sentidos y percentil 95, transcritos…» p. 158 / Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 | igual |
| preguntas.html#p-dos-sentidos (l. 984) | «…de la guía a la tesis. Sección 5.3, Anexo 8.5 y Tabla A8.2 1» [Anexo 8.5, Tabla A8.2] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Tabla A8.2 «Distancias geométricas en ambos sentidos y percentil 95, transcritos…» p. 158 | igual |
| preguntas.html#p-mas-fino (l. 994) | «…de la guía a la tesis. Anexo 8.5 1» [Anexo 8.5] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-observados (l. 1004) | «…de la guía a la tesis. Anexo 8.5 1» [Anexo 8.5] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-cinco-bastan (l. 1019) | «…de la guía a la tesis. Sección 5.6, Anexo 8.6 y Tabla A8.4 1 8» [Anexo 8.6, Tabla A8.4] | Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 / Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 | igual |
| preguntas.html#p-intervalo-simple (l. 1029) | «…de la guía a la tesis. Sección 5.6, Ecuación A8.2 y Tabla A8.4 1 8» [Ec. A8.2, Tabla A8.4] | Ec. (A8.2) p. 160 / Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 | igual |
| preguntas.html#p-binomial (l. 1039) | «…de la guía a la tesis. Sección 5.6 y Anexo 8.6 1 8 9» [Anexo 8.6] | Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 | igual |
| preguntas.html#p-cuantas (l. 1050) | «…de la guía a la tesis. Sección 5.6, Anexo 8.6 y trabajo futuro 1 10» [Anexo 8.6] | Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 | igual |
| preguntas.html#p-clopper (l. 1060) | «…de la guía a la tesis. Anexos 8.3 y 8.6 1 9» [Anexo 8.3, Anexo 8.6] | Anexo 8.3 «Mediciones no incluidas en los ensayos» p. 155 / Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 | igual |
| preguntas.html#p-control-una (l. 1070) | «…de la guía a la tesis. Secciones 5.2 y 5.6 y Tabla 5.3 1» [Sec. 5.2, Sec. 5.6, Tabla 5.3] | Sec. 5.2 «Evaluación del control de velocidad» p. 83 / Sec. 5.6 «Alcance estadístico de los ensayos» p. 94 / Tabla 5.3 «Indicadores de la respuesta al escalón en lazo cerrado,…» p. 86 | igual |
| preguntas.html#p-cobertura-ancha (l. 1080) | «…de la guía a la tesis. Sección 5.3, Tabla 5.4 y Tabla A8.4 1» [Tabla 5.4, Tabla A8.4] | Tabla 5.4 «Indicadores de mapeo en hardware real por iteración (resolución» p. 88 / Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 | igual |
| preguntas.html#p-15-de-15 (l. 1090) | «…de la guía a la tesis. Anexo 8.3 1 9 21 22» [Anexo 8.3] | Anexo 8.3 «Mediciones no incluidas en los ensayos» p. 155 | igual |
| preguntas.html#p-literatura (l. 1100) | «…de la guía a la tesis. Anexo 8.6 1 18 3 19» [Anexo 8.6] | Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 | igual |
| preguntas.html#p-angular (l. 1110) | «…de la guía a la tesis. Sección 5.1, Tabla 5.2, Anexo 6 y Tabla A8.4 1» [Tabla 5.2, Anexo 6, Tabla A8.4] | Tabla 5.2 «Desviación angular respecto de la referencia nominal de 360…» p. 82 / Anexo 6 «Detalle de validación de odometría» p. 149 / Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 | igual |
| preguntas.html#p-ref-astrom (l. 1125) | «…de la guía a la tesis. Secciones 3.6 y 4.4.3 y Anexo 4.12, con las secciones 3.4, 3.6, 13.1 y 13.4 del…» [Sec. 3.6, Sec. 4.4.3, Anexo 4.12] | Sec. 3.6 «Control PID» p. 43 / Sec. 4.4.3 «Control de velocidad en el firmware» p. 64 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-ref-wittenmark (l. 1135) | «…de la guía a la tesis. Sección 4.4.3 y Anexo 4.12 1 7» [Anexo 4.12] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 | igual |
| preguntas.html#p-ref-gokce (l. 1145) | «…de la guía a la tesis. Sección 3.7.1 y Anexo 4.10 1 11» [Anexo 4.10] | Anexo 4.10 «Resultados de la ejecución PSO empleada» p. 139 | igual |
| preguntas.html#p-ref-trejos-metrica (l. 1155) | «…de la guía a la tesis. Tabla 1.2 y Anexos 8.5 y 8.6 1 3» [Tabla 1.2, Anexo 8.5, Anexo 8.6] | Tabla 1.2 «Comparación general de alternativas para SLAM 2D.» p. 25 / Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 | igual |
| preguntas.html#p-ref-vincent (l. 1165) | «…de la guía a la tesis. Sección 5.6 y Anexos 8.3 y 8.6 1 9» [Anexo 8.3, Anexo 8.6] | Anexo 8.3 «Mediciones no incluidas en los ensayos» p. 155 / Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 | igual |
| preguntas.html#p-ref-eurachem (l. 1175) | «…de la guía a la tesis. Sección 5.6 y Anexo 8.6 1 10» [Anexo 8.6] | Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 | igual |
| preguntas.html#p-ref-maxim (l. 1185) | «…de la guía a la tesis. Sección 3.5 y Anexo 4.6 1 12 20» [Anexo 4.6] | Anexo 4.6 «Procesamiento FOPDT usado por los scripts» p. 135 | igual |
| preguntas.html#p-ref-pso (l. 1195) | «…de la guía a la tesis. Sección 3.7.1 con las Ecuaciones 3.13 y 3.14, Tabla A4.3 y Anexo 4.8 1 13 14» [Ec. 3.13, Ec. 3.14, Tabla A4.3, Anexo 4.8] | Ec. (3.13) p. 45 / Ec. (3.14) p. 46 / Tabla A4.3 «Configuración de la sintonización por PSO (qué se optimiza…» p. 138 / Anexo 4.8 «Particularidades de la implementación PSO» p. 136 | igual |
| preguntas.html#p-impl-estabilidad (l. 1218) | «…script AnalisisEstabilidadPID.py usa solo parámetros publicados en las Tablas 4.1, 4.4 y A4.4. Arma la planta discreta de cada rueda con el…» [Tabla 4.1, Tabla 4.4, Tabla A4.4] | Tabla 4.1 «Parámetros físicos y temporales empleados en la implementación.» p. 53 / Tabla 4.4 «Ganancias definitivas del controlador codificadas en el firmware.» p. 67 / Tabla A4.4 «Salida registrada de una ejecución de SintonizacionAutomatica.py: modelo FOPDT…» p. 139 | igual |
| preguntas.html#p-impl-estabilidad (l. 1219) | «…la comparación con las ganancias del PSO y con las originales, y los intervalos de confianza de la Tabla A8.4, salvo el…» [Tabla A8.4, Anexo 8.5] | Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 / Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 | igual |
| preguntas.html#p-impl-estabilidad (l. 1220) | «…de la guía a la tesis. Anexos 4.12, 8.6 y 9 1» [Anexo 4.12, Anexo 8.6, Anexo 9] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 / Anexo 9 «Convención de rutas y localización del software» p. 161 | igual |
| preguntas.html#p-impl-plano (l. 1228) | «…clase de cada celda de las imágenes de cobertura, con los umbrales del índice, y esos conteos reproducen la Tabla 5.4 con…» [Tabla 5.4] | Tabla 5.4 «Indicadores de mapeo en hardware real por iteración (resolución» p. 88 | igual |
| preguntas.html#p-impl-plano (l. 1229) | «…95 y el intervalo entre corridas. Sus resultados quedaron en un informe que la tesis transcribe en la Tabla A8.2, sin agregar» [Tabla A8.2] | Tabla A8.2 «Distancias geométricas en ambos sentidos y percentil 95, transcritos…» p. 158 | igual |
| preguntas.html#p-impl-plano (l. 1230) | «…de la guía a la tesis. Anexos 8.5 y 9 y Tabla A8.2 1» [Anexo 8.5, Anexo 9, Tabla A8.2] | Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Anexo 9 «Convención de rutas y localización del software» p. 161 / Tabla A8.2 «Distancias geométricas en ambos sentidos y percentil 95, transcritos…» p. 158 | igual |
| preguntas.html#p-impl-metas (l. 1240) | «…de la guía a la tesis. Anexo 8.4 y Tabla A7.1 1» [Anexo 8.4, Tabla A7.1] | Anexo 8.4 «Limitaciones de los contadores de exploración» p. 155 / Tabla A7.1 «Resultado de las metas de navegación de la exploración,…» p. 152 | igual |
| preguntas.html#p-impl-kd25 (l. 1250) | «…de la guía a la tesis. Anexos 4.8 y 4.10 y Tabla A4.4 1» [Anexo 4.8, Anexo 4.10, Tabla A4.4] | Anexo 4.8 «Particularidades de la implementación PSO» p. 136 / Anexo 4.10 «Resultados de la ejecución PSO empleada» p. 139 / Tabla A4.4 «Salida registrada de una ejecución de SintonizacionAutomatica.py: modelo FOPDT…» p. 139 | igual |
| preguntas.html#p-impl-captura (l. 1260) | «…de la guía a la tesis. Anexos 4.9 y 4.11 1» [Anexo 4.9, Anexo 4.11] | Anexo 4.9 «Protocolos de captura, identificación y sintonización» p. 138 / Anexo 4.11 «Captura de la respuesta en lazo cerrado» p. 140 | igual |
| preguntas.html#p-impl-atomica (l. 1270) | «…de la guía a la tesis. Anexos 4.1 y 4.5, y Limitaciones 1» [Anexo 4.1, Anexo 4.5] | Anexo 4.1 «Ticks por vuelta y ganancias finales» p. 128 / Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 | igual |
| preguntas.html#p-impl-semilla (l. 1278) | «…es la salida exacta de la ejecución usada, con el modelo identificado y las ganancias sugeridas, en la Tabla» [Tabla A4.4] | Tabla A4.4 «Salida registrada de una ejecución de SintonizacionAutomatica.py: modelo FOPDT…» p. 139 | igual |
| preguntas.html#p-impl-semilla (l. 1280) | «…de la guía a la tesis. Anexo 4.10 y Limitaciones 1» [Anexo 4.10] | Anexo 4.10 «Resultados de la ejecución PSO empleada» p. 139 | igual |
| preguntas.html#p-impl-planta-pso (l. 1290) | «…de la guía a la tesis. Anexos 4.7 y 4.10 1» [Anexo 4.7, Anexo 4.10] | Anexo 4.7 «Planta utilizada durante la sintonización del controlador» p. 136 / Anexo 4.10 «Resultados de la ejecución PSO empleada» p. 139 | igual |
| preguntas.html#f1 (l. 1324) | «…utilizando un robot móvil de tracción diferencial . UTEM. Versión de octubre de 2026. Introducción, Capítulos 1 a 5, Conclusiones con limitaciones…» [Capítulo 1, Capítulo 5, Anexo 1, Anexo 10] | Capítulo 1 «ESTADO DEL ARTE» p. 22 / Capítulo 5 «RESULTADOS EXPERIMENTALES Este capítulo presenta los resultados obtenidos durant» p. 79 / Anexo 1 «Construcción, componentes y montaje» p. 117 / Anexo 10 «Nomenclatura» p. 163 | igual |
| preguntas.html (l. 84) | «…Lectura 106 preguntas en 15 temas» [106] | 106: p. 115, 123, 135 | igual |
| preguntas.html#t-breve (l. 109) | «…las 106 preguntas en PDF Con respuestas, repreguntas y respaldo.» [106, 0,5] | 106: p. 115, 123, 135 / 0,5: p. 74, 137, 138 | igual |
| preguntas.html#p-objetivo-general (l. 149) | «…porque el mapa creció en cada corrida, con coberturas de entre 53,4 y 82,9 %, y eso exige que el…» [53,4, 82,9 %] | 53,4: p. 88, 90, 142 / 82,9 %: p. 90, 92, 152 | igual |
| preguntas.html#p-objetivo-general (l. 150) | «…y cumplidos en parte el OE2 y el OE3. Los mapas, además, quedan a 3,4 cm en promedio de un…» [3,4 cm] | 3,4 cm: p. 89, 93, 95 | igual |
| preguntas.html#p-objetivo-general (l. 151) | «…metas generadas no prueban movimiento. En la corrida excluida hubo 14 metas y el robot no se movió. Tampoco lo…» [14 metas] | 14 metas: p. 151 | igual |
| preguntas.html#p-oe3-parcial (l. 160) | «…hacia las metas del explorador en las cinco corridas válidas, con 21,9 m de recorrido autónomo. De los 54 abortos,…» [21,9 m] | 21,9 m: p. 92, 93, 98 | igual |
| preguntas.html#p-una-de-sesenta (l. 171) | «…seis corridas el mapa creció hasta que no quedaron fronteras, con 21,9 m recorridos sin intervención manual. Medirlo con destinos» [21,9 m] | 21,9 m: p. 92, 93, 98 | igual |
| preguntas.html#p-metas-fijas (l. 183) | «…sigue La tolerancia que el script imprime para el modo real, 0,22 m, no coincide con los 0,10 m configurados…» [0,22 m, 0,10 m, 78 %] | 0,22 m: p. 155 / 0,10 m: p. 91, 144, 155 / 78 %: p. 155 | igual |
| preguntas.html#p-exploro-todo (l. 192) | «…mapa de costos. Y el área libre fue casi igual en las cinco, entre 3,478 y 3,540 m², con una…» [3,478, 3,540 m², 93 %] | 3,478: p. 88, 90 / 3,540 m²: p. 90 / 93 %: p. 157 | igual |
| preguntas.html#p-exploro-todo (l. 193) | «…corridas. Lo correcto es decir índice medio de cobertura libre de 62,2 %, no que el robot cubre el 62…» [62,2 %] | 62,2 %: p. 90, 93, 95 | igual |
| preguntas.html#p-exploro-todo (l. 194) | «…la pregunta sigue La iteración 1 tiene 82,9 % y la 6 tiene 53,4 %, pero casi la misma área…» [82,9 %, 53,4 %, 3,51, 3,48 m²] | 82,9 %: p. 90, 92, 152 / 53,4 %: p. 90, 152 / 3,51: p. 88 / 3,48 m²: 3.478 y 3.483 m2 en la Tabla 5.4 (p. 88), redondeado | igual |
| preguntas.html#p-costo (l. 240) | «…materiales montados en el robot costaron 444 643 pesos. El proyecto completo llega a 582 447 pesos,» [444643, 582447] | 444643: p. 51, 118, 119 / 582447: p. 51, 118, 119 | igual |
| preguntas.html#p-costo (l. 241) | «…al TurtleBot 3 Burger, el robot cuesta un 32 % menos y el proyecto completo un 11 % menos, con…» [32 %, 11 %] | 32 %: p. 119 / 11 %: p. 119 | igual |
| preguntas.html#p-ahorro (l. 249) | «…¿Por qué el robot sale un 32 % más barato, pero el proyecto completo ahorra solo un 11» [32 %, 11 %] | 32 %: p. 119 / 11 %: p. 119 | igual |
| preguntas.html#p-ahorro (l. 251) | «…el proyecto suma 137 804 pesos en cosas que no van montadas en el robot, como la» [137804] | 137804: p. 118 | igual |
| preguntas.html#p-estable-simple (l. 282) | «…88 veces antes de oscilar, y con un retardo extra de 0,1 s, unas 4,7 veces. Es un cálculo sobre…» [4,7] | 4,7: p. 74, 75, 129 | igual |
| preguntas.html#p-estable-simple (l. 284) | «…guía a la tesis. Sección 4.4.3, Anexo 4.12 y Tabla A4.5. Las 88 y 4,7 veces convierten a veces los…» [4,7, 38,9, 13,4 dB] | 4,7: p. 74, 75, 129 / 38,9: p. 142 / 13,4 dB: p. 142 | igual |
| preguntas.html#p-exactitud-simple (l. 292) | «…se comparó con cada mapa. En promedio, los muros del mapa quedan a 3,4 cm de donde los pone el…» [3,4 cm, 5 cm] | 3,4 cm: p. 89, 93, 95 / 5 cm: p. 157 | igual |
| preguntas.html#p-exactitud-simple (l. 293) | «…mayores diferencias, de 6 a 9 cm, están en los tabiques cortos, que el mapa dibuja con» [9 cm, 12 cm] | 9 cm: p. 89, 158 / 12 cm: p. 89, 99, 157 | igual |
| preguntas.html#p-foxy (l. 308) | «…Ubuntu 20.04 y Gazebo Classic se congelaron al inicio del proyecto» [20.04] | 20.04: p. 21, 33 | igual |
| preguntas.html#p-foxy (l. 309) | «…del paquete base adaptado están disponibles para Foxy sobre Ubuntu 20.04, y esa es la base del» [20.04] | 20.04: p. 21, 33 | igual |
| preguntas.html#p-foxy (l. 310) | «…de la guía a la tesis. Alcances y limitaciones, Sección 2.1, Limitaciones y Tabla A3.2 1» [2.1] | 2.1: p. 31, 32, 54 | igual |
| preguntas.html#p-energia (l. 337) | «…batería de 12 V alimenta un bus que mueve los motores a través del driver» [12 V, 25 W, 5 V] | 12 V: p. 51, 57, 118 / 25 W: p. 57, 118 / 5 V: p. 57 | igual |
| preguntas.html#p-dos-errores (l. 358) | «…¿Qué diferencia hay entre el 7,18 % y el 3,63 %?» [7,18 %, 3,63 %] | 7,18 %: p. 81, 96 / 3,63 %: p. 81, 93, 95 | igual |
| preguntas.html#p-dos-errores (l. 360) | «…y de la misma recta. Le ordené avanzar 2 metros a 0,13 m/s durante 15,4 segundos. Los encoders estimaron 1,924…» [15,4, 1,924, 1,856] | 15,4: p. 80 / 1,924: p. 81 / 1,856: p. 81, 150 | igual |
| preguntas.html#p-dos-errores (l. 361) | «…7,18 % es el error de seguimiento. Compara la cinta con lo» [7,18 %, 3,8 %] | 7,18 %: p. 81, 96 / 3,8 %: p. 81 | igual |
| preguntas.html#p-dos-errores (l. 362) | «…3,63 % es el error odométrico. Compara los encoders con la cinta» [3,63 %, 0,44 %] | 3,63 %: p. 81, 93, 95 / 0,44 %: p. 81 | igual |
| preguntas.html#p-sesgo-mapa (l. 382) | «…alineándolo sin ajustar su escala. Sus muros quedan en promedio a 3,4 cm del plano, y los pasillos salen en…» [3,4 cm, 12 cm] | 3,4 cm: p. 89, 93, 95 / 12 cm: p. 89, 99, 157 | igual |
| preguntas.html#p-giro (l. 389) | «…En la prueba de giro el script ordena 0,4 rad/s, pero el controlador limita a 0,35. ¿Por qué diseñó así» [0,4 rad/s] | 0,4 rad/s: p. 149 | igual |
| preguntas.html#p-giro (l. 391) | «…un error de diseño del ensayo. El script pide 0,4 rad/s durante el tiempo que tomaría una vuelta a esa…» [0,4 rad/s, 360 grados] | 0,4 rad/s: p. 149 / 360 grados: p. 82 | igual |
| preguntas.html#p-pid-discreto (l. 408) | «…cambiar la orden, lo suma a la orden anterior, la limita entre −255 y 255 y la aplica como PWM.…» [255] | 255: p. 64, 129, 132 | igual |
| preguntas.html#p-kd (l. 418) | «…las ganancias definitivas equivale a una ganancia proporcional de 0,41 y 0,40 PWM por tick/ciclo y a tiempos integrales de…» [0,41, 0,40 PWM, 40 ms] | 0,41: p. 67, 141, 159 / 0,40 PWM: p. 67, 141 / 40 ms: p. 67, 141 | igual |
| preguntas.html#p-windup (l. 440) | «…firmware lo limita de dos maneras. Guarda la orden ya recortada a 255, así que la memoria de la forma…» [255] | 255: p. 64, 129, 132 | igual |
| preguntas.html#p-aporte-pso (l. 459) | «…del driver. Se corrigieron en el robot, subiendo Kp entre 28 y 63 %, bajando Kd entre 41 y 45…» [63 %, 45 %] | 63 %: p. 86, 140 / 45 %: p. 86, 140 | igual |
| preguntas.html#p-resolucion (l. 468) | «…¿Cómo informa un error de 0,002 m/s si la resolución de la medición es 0,01 m/s?» [0,002 m/s, 0,01 m/s] | 0,002 m/s: p. 86 / 0,01 m/s: p. 84, 85, 143 | igual |
| preguntas.html#p-resolucion (l. 470) | «…0,128 m/s de la rueda izquierda es el promedio de las muestras» [0,128 m/s, 0,01 m/s] | 0,128 m/s: p. 86 / 0,01 m/s: p. 84, 85, 143 | igual |
| preguntas.html#p-resolucion (l. 472) | «…más fino que el dato que entrega el firmware. Los sobreimpulsos de 10,7 a 15,6 % que aparecen en la…» [10,7, 15,6 %] | 10,7: p. 85, 99 / 15,6 %: p. 85, 99 | igual |
| preguntas.html#p-solo-013 (l. 482) | «…unos 41 pulsos por ciclo de control. En un giro sobre su eje a 0,35 rad/s, cada rueda va a…» [0,35 rad/s, 30 %] | 0,35 rad/s: p. 60, 82, 128 / 30 %: p. 120, 143 | igual |
| preguntas.html#p-camino-orden (l. 491) | «…lineal y una angular. El controlador local DWB puede pedir hasta 0,15 m/s. La orden pasa por twist_mux, que da…» [0,15 m/s, 0,35 rad/s] | 0,15 m/s: p. 144 / 0,35 rad/s: p. 60, 82, 128 | igual |
| preguntas.html#p-camino-orden (l. 492) | «…las interrupciones del encoder, calcula el PWM, lo limita a 255 y lo aplica al driver L298N. Si pasan 2…» [255] | 255: p. 64, 129, 132 | igual |
| preguntas.html#p-decimales (l. 503) | «…estado integral en cero, la salida no cambia ante errores de hasta 3 ticks/ciclo con las ganancias definitivas, cerca de…» [3 ticks, 0,01 m/s] | 3 ticks: p. 143 / 0,01 m/s: p. 84, 85, 143 | igual |
| preguntas.html#p-marcos (l. 558) | «…descripción del robot. La organización sigue las convenciones REP 103 y REP 105 de» [103, 105] | 103: p. 35, 55, 105 / 105: p. 35, 55, 108 | igual |
| preguntas.html#p-lee-laser (l. 576) | «…publica. Luego junta las mediciones de cada vuelta, las reparte en 230 sectores y guarda la distancia más cercana de…» [230] | 230: p. 120, 126, 154 | igual |
| preguntas.html#p-inflacion (l. 608) | «…El radio de inflación es 0,15 m y la esquina del robot está a 0,24 m del centro. ¿Cómo» [0,15 m, 0,24 m] | 0,15 m: p. 74, 92, 120 / 0,24 m: p. 145 | igual |
| preguntas.html#p-inflacion (l. 610) | «…es menor que la distancia a la esquina, así que entre 0,15 y 0,24 m de un obstáculo el costo…» [0,24 m] | 0,24 m: p. 145 | igual |
| preguntas.html#p-dwb (l. 620) | «…hacia la meta. Elige la de menor puntaje. En el robot trabaja a 8 Hz y puede pedir hasta 0,15…» [8 Hz, 0,15 m/s] | 8 Hz: p. 144 / 0,15 m/s: p. 144 | igual |
| preguntas.html#p-logica-explorador (l. 644) | «…global cada 3,3 segundos, porque su frecuencia está configurada en 0,3 Hz. Busca las fronteras, las ordena con un puntaje…» [0,3 Hz] | 0,3 Hz: p. 148, 149 | igual |
| preguntas.html#p-lista-negra (l. 657) | «…de la guía a la tesis. Sección 3.11, Algoritmo 4.4, Sección 5.4 y Anexo 5.6 1» [3.11] | 3.11: p. 42, 49, 70 | igual |
| preguntas.html#p-yamauchi (l. 674) | «…que todavía no haya visitado. Cuando llega, hace un barrido de 360 grados, actualiza el mapa y vuelve a buscar…» [360 grados] | 360 grados: p. 82 | igual |
| preguntas.html#p-yamauchi (l. 677) | «…1.4.2 y 3.11, Tabla A5.4 y Anexo 5.6 1 , junto con las secciones 2.2 y 2.3 de Yamauchi 2» [2.2, 2.3] | 2.2: p. 57, 97, 122 / 2.3: p. 88, 159 | igual |
| preguntas.html#p-frontera-minima (l. 683) | «…Configuró un tamaño mínimo de frontera de 5 cm, una sola celda. ¿Qué consecuencia tiene sobre las metas?» [5 cm] | 5 cm: p. 157 | igual |
| preguntas.html#p-339-718 (l. 718) | «…¿El 3,39 % de simulación y el 7,18 % del robot miden lo mismo?» [3,39 %, 7,18 %] | 3,39 %: p. 81, 96 / 7,18 %: p. 81, 96 | igual |
| preguntas.html#p-339-718 (l. 720) | «…porque la pose verdadera de Gazebo no quedó registrada, y da 3,39 % frente a lo ordenado. En el robot…» [3,39 %, 7,18 %] | 3,39 %: p. 81, 96 / 7,18 %: p. 81, 96 | igual |
| preguntas.html#p-339-718 (l. 721) | «…el giro, los dos entornos se comparan con 360 grados nominales, 4,74 % en simulación y 3,24 % en el…» [360 grados, 4,74 %, 3,24 %] | 360 grados: p. 82 / 4,74 %: p. 82 / 3,24 %: p. 82 | igual |
| preguntas.html#p-339-718 (l. 722) | «…la pregunta sigue La cifra del robot que se parece al 3,39 % es el 3,8 % que los encoders…» [3,39 %, 3,8 %] | 3,39 %: p. 81, 96 / 3,8 %: p. 81 | igual |
| preguntas.html#p-iteracion-2 (l. 756) | «…causa no se determinó, y así lo informa la tesis. La corrida duró 5,09 minutos, el explorador envió 14 metas…» [5,09, 14 metas, 3,851] | 5,09: p. 151 / 14 metas: p. 151 / 3,851: p. 151 | igual |
| preguntas.html#p-iteracion-2 (l. 758) | «…el registro de esa corrida, con la odometría y el estado de las 14 metas, porque la distancia de 3,851…» [14 metas, 3,851] | 14 metas: p. 151 / 3,851: p. 151 | igual |
| preguntas.html#p-verificador (l. 765) | «…Nav2 tiene un verificador de progreso que exige 5 cm cada 6 segundos. ¿Por qué nada en el sistema detectó…» [5 cm] | 5 cm: p. 157 | igual |
| preguntas.html#p-verificador (l. 769) | «…la pregunta sigue En esa corrida hubo 14 metas en 5,09 minutos, cerca de 22 segundos por meta en» [14 metas, 5,09] | 14 metas: p. 151 / 5,09: p. 151 | igual |
| preguntas.html#p-espacio-mayor (l. 788) | «…Se probó un único recinto, con un área libre mapeada media de 3,50 m², y cinco corridas válidas de una…» [3,50 m²] | 3,50 m²: p. 90, 93, 95 | igual |
| preguntas.html#p-estable-como (l. 803) | «…sin retardo y de 41° a 44° con 0,1 s, y la sensibilidad máxima, de 1,35 a 1,85, queda dentro…» [1,35, 1,85, 2,0] | 1,35: p. 68, 142 / 1,85: p. 68, 142 / 2,0: p. 68, 137, 138 | igual |
| preguntas.html#p-margenes (l. 813) | «…atraso a segundos, y el menor, en el modelo sin retardo, es de unos 0,42» [0,42 s] | 0,42 s: p. 68, 142 | igual |
| preguntas.html#p-margenes (l. 814) | «…lazo pasa cerca de oscilar. Sus valores típicos están entre 1,2 y» [2,0] | 2,0: p. 68, 137, 138 | igual |
| preguntas.html#p-margenes (l. 815) | «…firmware, en el escenario de 0,1 s, la sensibilidad máxima llega a 2,18, fuera de ese intervalo. Es una de…» [2,18] | 2,18: p. 144 | igual |
| preguntas.html#p-retardo-escenario (l. 822) | «…Si el retardo identificado es de 0,0001 y 0,0692 s, ¿de dónde sale el escenario de 0,1 s?» [0,0001, 0,0692 s] | 0,0001: p. 70, 136, 139 / 0,0692 s: p. 70, 136 | igual |
| preguntas.html#p-retardo-escenario (l. 824) | «…en cualquier valor de ese intervalo. Por eso un script entregó 0,0692 s para la derecha y otro 0,0845 s,…» [0,0692 s, 0,0845 s] | 0,0692 s: p. 70, 136 / 0,0845 s: p. 136 | igual |
| preguntas.html#p-retardo-escenario (l. 826) | «…ni lo confirman. En el escenario de 0,1 s, el margen de retardo, de 0,32 a 0,35 s, indica cuánto…» [0,32, 0,35 s] | 0,32: p. 142, 159 / 0,35 s: p. 142 | igual |
| preguntas.html#p-ki-lineal (l. 833) | «…En la rueda izquierda aparece un polo de 0,995. ¿No está peligrosamente cerca de la inestabilidad?» [0,995] | 0,995: p. 142 | igual |
| preguntas.html#p-ki-lineal (l. 836) | «…estado integral de la izquierda solo crece con errores de al menos 14 ticks/ciclo, sobre todo al arrancar, y por…» [14 ticks, 1,85] | 14 ticks: p. 86 / 1,85: p. 68, 142 | igual |
| preguntas.html#p-ki-lineal (l. 837) | «…Anexo 4.12 y Tabla A4.5. Los 6,6 s son un cálculo con el polo de 0,995 y el período de…» [0,995] | 0,995: p. 142 | igual |
| preguntas.html#p-no-lineal (l. 845) | «…de los transitorios: a la velocidad máxima de cada rueda, unos 0,16 m/s, el modelo pide cerca de 180 de…» [0,16 m/s, 180, 255] | 0,16 m/s: p. 143 / 180: p. 126, 143 / 255: p. 64, 129, 132 | igual |
| preguntas.html#p-no-lineal (l. 846) | «…el estado integral en cero, eso deja sin corregir errores de hasta 3 ticks/ciclo con las ganancias definitivas y de…» [3 ticks, 0,01 m/s] | 3 ticks: p. 143 / 0,01 m/s: p. 84, 85, 143 | igual |
| preguntas.html#p-no-lineal (l. 847) | «…velocidad pesa más. En un giro sobre el eje cada rueda va a unos 10 ticks/ciclo, donde esa banda es…» [10 ticks, 30 %] | 10 ticks: p. 143 / 30 %: p. 120, 143 | igual |
| preguntas.html#p-barrido (l. 856) | «…script recorre 625 combinaciones de la ganancia de la planta, entre 0,1 y 10 veces la» [625 combinaciones, 3 s, 2,8] | 625 combinaciones: p. 142 / 3 s: p. 143 / 2,8: p. 143 | igual |
| preguntas.html#p-pso-mas-margen (l. 876) | «…no siguieron la referencia. La rueda izquierda se estabilizó en 0,12 m/s, con un error cercano a 0,01 m/s, y…» [0,12 m/s, 0,01 m/s, 0,11 m/s, 6 s] | 0,12 m/s: p. 84, 144 / 0,01 m/s: p. 84, 85, 143 / 0,11 m/s: p. 84 / 6 s: p. 84, 144, 145 | igual |
| preguntas.html#p-pso-mas-margen (l. 877) | «…real. Su rutina predice con las ganancias del PSO una subida de 0,8 y 1,1 s, y con las definitivas,…» [0,8, 1,1 s, 10 %, 16 %] | 0,8: p. 86, 89, 144 / 1,1 s: p. 144 / 10 %: p. 86, 144 / 16 %: p. 144 | igual |
| preguntas.html#p-originales (l. 886) | «…sin retardo y de 35° con 0,1 s, y una sensibilidad máxima de hasta 2,18, fuera del intervalo típico. Las…» [2,18] | 2,18: p. 144 | igual |
| preguntas.html#p-incremental-estable (l. 897) | «…solo en el término integral. Con las ganancias definitivas eso da 0,41 y 0,40 PWM por tick/ciclo y tiempos integrales…» [0,41, 0,40 PWM, 40 ms] | 0,41: p. 67, 141, 159 / 0,40 PWM: p. 67, 141 / 40 ms: p. 67, 141 | igual |
| preguntas.html#p-incremental-estable (l. 898) | «…El período de 33 ms por la frecuencia de cruce da cerca de 0,07, dentro del intervalo de 0,05 a…» [0,07, 0,14] | 0,07: p. 68 / 0,14: p. 68 | igual |
| preguntas.html#p-plano-como (l. 912) | «…y un traslado, sin ajustar su escala. Luego se tomó un punto cada 1 cm a lo largo de los…» [1 cm] | 1 cm: p. 157 | igual |
| preguntas.html#p-plano-como (l. 913) | «…los que tienen una celda libre a menos de 10 cm, entre el 92 y el 93 % del total.…» [93 %, 3,4 cm, 3,17, 5 cm] | 93 %: p. 157 / 3,4 cm: p. 89, 93, 95 / 3,17: p. 157, 158 / 5 cm: p. 157 | igual |
| preguntas.html#p-repetible-exacto (l. 922) | «…eso mide repetibilidad, no exactitud. El área libre varió apenas un 0,8 % entre corridas, pero una distorsión que se…» [0,8 %] | 0,8 %: p. 89 | igual |
| preguntas.html#p-huincha (l. 932) | «…incertidumbre de la huincha o del alineamiento. Por eso la cifra de 3,4 cm no se presenta como una medida…» [3,4 cm] | 3,4 cm: p. 89, 93, 95 | igual |
| preguntas.html#p-12cm (l. 940) | «…Los pasillos salen 12 cm más anchos en los mapas. ¿A qué se debe?» [12 cm] | 12 cm: p. 89, 99, 157 | igual |
| preguntas.html#p-12cm (l. 942) | «…entre muros, así que el espesor de los dos muros largos, menos de 2 cm cada uno, explica a lo…» [2 cm, 4 cm] | 2 cm: p. 156 / 4 cm: p. 157 | igual |
| preguntas.html#p-tabiques (l. 962) | «…el mapa depende de muy pocas mediciones. Las diferencias llegan a −6,1, −7,8 y +9,3 cm, entre una y dos…» [6,1, 7,8, 1,7] | 6,1: p. 40, 150, 159 / 7,8: p. 159 / 1,7: p. 91, 159 | igual |
| preguntas.html#p-tabiques (l. 963) | «…tabique corto unido al muro inferior solo se compara su posición, a 0,61 m del muro derecho en el plano…» [0,61 m] | 0,61 m: p. 157 | igual |
| preguntas.html#p-percentil (l. 970) | «…¿Qué diferencia hay entre el percentil 95 de 8,4 cm y el intervalo de 3,1 a 3,7 cm?» [8,4 cm, 3,7 cm] | 8,4 cm: p. 89, 159 / 3,7 cm: p. 94 | igual |
| preguntas.html#p-percentil (l. 972) | «…todos los puntos comparados: solo uno de cada veinte queda a más de 8,4 cm. El intervalo de confianza habla…» [8,4 cm] | 8,4 cm: p. 89, 159 | igual |
| preguntas.html#p-percentil (l. 973) | «…no es el promedio de los percentiles de cada mapa, que van de 6,8 a 9,6» [6,8] | 6,8: p. 38, 158 | igual |
| preguntas.html#p-dos-sentidos (l. 982) | «…cada celda ocupada corresponde a un muro, y ahí las medias van de 4,09 a 4,94 cm. Una celda ocupada…» [4,09, 4,94 cm] | 4,09: p. 89, 158 / 4,94 cm: p. 89 | igual |
| preguntas.html#p-mas-fino (l. 990) | «…Si cada celda mide 5 cm, ¿cómo puede informar una distancia media de 3,4 cm?» [5 cm, 3,4 cm] | 5 cm: p. 157 / 3,4 cm: p. 89, 93, 95 | igual |
| preguntas.html#p-mas-fino (l. 993) | «…no es una cota del error geométrico: el percentil 95 llega a 8,4 cm, y una de las distancias del…» [8,4 cm] | 8,4 cm: p. 89, 159 | igual |
| preguntas.html#p-observados (l. 1003) | «…es que se informa cuántos quedan fuera. Cuentan entre el 92 y el 93 % de los puntos, y eso…» [93 %] | 93 %: p. 157 | igual |
| preguntas.html#p-cinco-bastan (l. 1017) | «…quedan bien acotados aun con cinco: el error odométrico entre 3,08 y 4,18 %, el área libre entre 3,46 y…» [3,08, 4,18 %, 3,46, 3,53 m², 3,7 cm, 46,2, 78,3 %, 1,8] | 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 / 3,46: p. 94, 160 / 3,53 m²: p. 94 / 3,7 cm: p. 94 / 46,2: p. 94, 160 / 78,3 %: p. 94 / 1,8: p. 94, 160 | igual |
| preguntas.html#p-cinco-bastan (l. 1018) | «…como valores que se puedan generalizar, y propone un mínimo de 6 a 10 repeticiones válidas por» [10 repeticiones] | 10 repeticiones: p. 95, 102, 160 | igual |
| preguntas.html#p-intervalo-simple (l. 1025) | «…¿Qué quiere decir que el error de la odometría esté entre 3,08 y 4,18 %? Para todo» [3,08, 4,18 %] | 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 | igual |
| preguntas.html#p-intervalo-simple (l. 1028) | «…del método: si el ensayo se repitiera muchas veces, 95 de cada 100 franjas calculadas así contendrían el valor» [100] | 100: p. 80, 81, 87 | igual |
| preguntas.html#p-binomial (l. 1037) | «…95 % de confianza solo se puede afirmar que la proporción supera el 35,9» [35,9 %] | 35,9 %: p. 94, 160 | igual |
| preguntas.html#p-binomial (l. 1038) | «…más en seis ocurriría con probabilidad 7/64, unas 11 veces de cada 100, y eso no permite descartarlo al nivel…» [100] | 100: p. 80, 81, 87 | igual |
| preguntas.html#p-cuantas (l. 1047) | «…tesis considera admisible un mínimo de 6 a 10 repeticiones válidas por ensayo, con 10 por condición como objetivo de» [10 repeticiones, 42 %] | 10 repeticiones: p. 95, 102, 160 / 42 %: p. 161 | igual |
| preguntas.html#p-cuantas (l. 1048) | «…a la mitad el intervalo del error odométrico requeriría unas 13 repeticiones, y afirmar una tasa de éxito sobre el…» [13 repeticiones, 80 %, 17 ejecuciones] | 13 repeticiones: p. 161 / 80 %: p. 161 / 17 ejecuciones: p. 161 | igual |
| preguntas.html#p-cuantas (l. 1049) | «…es coherente con la guía Eurachem, que considera necesarias de 6 a 15 repeticiones para estimar una desviación estándar y…» [15 repeticiones] | 15 repeticiones: p. 95, 160 | igual |
| preguntas.html#p-control-una (l. 1066) | «…por conjunto de ganancias. ¿Qué confianza tiene en el error de 0,002 m/s?» [0,002 m/s] | 0,002 m/s: p. 86 | igual |
| preguntas.html#p-control-una (l. 1068) | «…con repeticiones. Además, la velocidad se informa en pasos de 0,01 m/s, y el 0,002 es el promedio de muestras…» [0,01 m/s, 0,002] | 0,01 m/s: p. 84, 85, 143 / 0,002: p. 86, 143 | igual |
| preguntas.html#p-control-una (l. 1069) | «…protocolo. Con las ganancias del PSO quedaba un error cercano a 0,01 m/s en la izquierda, y con las definitivas…» [0,01 m/s] | 0,01 m/s: p. 84, 85, 143 | igual |
| preguntas.html#p-cobertura-ancha (l. 1078) | «…Su desviación estándar es de 12,9 puntos y su intervalo va de 46,2 a 78,3 %. El área libre cuenta…» [46,2, 78,3 %, 0,8 %] | 46,2: p. 94, 160 / 78,3 %: p. 94 / 0,8 %: p. 89 | igual |
| preguntas.html#p-15-de-15 (l. 1088) | «…afirmar con 95 % de confianza que la tasa de éxito supera el 78 %. Una sola falla bajaría bastante…» [78 %] | 78 %: p. 155 | igual |
| preguntas.html#p-angular (l. 1106) | «…La desviación angular va de 1,8 a 21,6°. ¿Qué se puede concluir del ensayo de giro?» [1,8] | 1,8: p. 94, 160 | igual |
| preguntas.html#p-angular (l. 1108) | «…lo dice. El intervalo es muy amplio, la desviación es respecto de 360° nominales y no un error de odometría…» [360 °, 0,4 rad/s, 0,35 rad/s] | 360 °: p. 82 / 0,4 rad/s: p. 149 / 0,35 rad/s: p. 60, 82, 128 | igual |
| preguntas.html#p-ref-astrom (l. 1125) | «…Secciones 3.6 y 4.4.3 y Anexo 4.12, con las secciones 3.4, 3.6, 13.1 y 13.4 del libro 1 5» [13.1] | 13.1: p. 66, 142 | igual |
| preguntas.html#p-ref-wittenmark (l. 1133) | «…Los valores típicos de la sensibilidad máxima, entre 1,2 y 2,0. El intervalo de 0,05 a 0,14 para el período…» [2,0, 0,14, 0,07] | 2,0: p. 68, 137, 138 / 0,14: p. 68 / 0,07: p. 68 | igual |
| preguntas.html#p-ref-gokce (l. 1145) | «…de la guía a la tesis. Sección 3.7.1 y Anexo 4.10 1 11» [3.7] | 3.7: p. 41, 44, 69 | igual |
| preguntas.html#p-ref-vincent (l. 1164) | «…usa en dos lugares: para la proporción de exploraciones válidas, de 35,9 a 99,6 %, y para estimar qué permitiría…» [35,9, 99,6 %, 78 %] | 35,9: p. 94, 160 / 99,6 %: p. 160 / 78 %: p. 155 | igual |
| preguntas.html#p-ref-eurachem (l. 1173) | «…de criterio, no de método. La guía considera necesarias de 6 a 15 repeticiones para estimar una desviación estándar y…» [15 repeticiones, 10 repeticiones] | 15 repeticiones: p. 95, 160 / 10 repeticiones: p. 95, 102, 160 | igual |
| preguntas.html#p-ref-pso (l. 1193) | «…Clerc y Kennedy, el factor de constricción de 0,7298, que es el valor de su fórmula cuando los coeficientes» [0,7298, 2,05, 1,4] | 0,7298: p. 137, 138, 167 / 2,05: p. 138 / 1,4: p. 26, 33, 46 | igual |
| preguntas.html#p-ref-pso (l. 1195) | «…de la guía a la tesis. Sección 3.7.1 con las Ecuaciones 3.13 y 3.14, Tabla A4.3 y Anexo 4.8» [3.7] | 3.7: p. 41, 44, 69 | igual |
| preguntas.html#p-impl-estabilidad (l. 1219) | «…mismo script hace el barrido de 625 combinaciones, la comparación con las ganancias del PSO y con las» [625 combinaciones] | 625 combinaciones: p. 142 | igual |
| preguntas.html#p-impl-plano (l. 1226) | «…¿Cómo compara el script cada mapa con el plano?» [100] | 100: p. 80, 81, 87 | igual |
| preguntas.html#p-impl-plano (l. 1228) | «…el mapa con el plano con un giro y un traslado, toma un punto cada 1 cm en los muros…» [1 cm] | 1 cm: p. 157 | igual |
| preguntas.html#p-impl-metas (l. 1236) | «…Si los contadores automáticos fallaban, ¿cómo reconstruyó» [101] | 101: p. 115, 118 | igual |
| preguntas.html#p-impl-kd25 (l. 1246) | «…¿Por qué el PSO informa Kd de 34,69 y 36,70 si el costo» [102, 34,69, 36,70] | 102: p. 119 / 34,69: p. 137, 139, 140 / 36,70: p. 137, 139, 140 | igual |
| preguntas.html#p-impl-kd25 (l. 1248) | «…función de costo recorta una copia de cada posición al intervalo de 0,0001 a 1 y la escala, y para…» [0,0001] | 0,0001: p. 70, 136, 139 | igual |
| preguntas.html#p-impl-kd25 (l. 1249) | «…la ejecución usada, la componente de Kd terminó en 1,39 y 1,47, así que el costo evaluó Kd = 25…» [1,39, 1,47, 34,69, 36,70] | 1,39: p. 137, 142 / 1,47: p. 137 / 34,69: p. 137, 139, 140 / 36,70: p. 137, 139, 140 | igual |
| preguntas.html#p-impl-captura (l. 1256) | «…¿Las capturas cada 0,1 s registran siempre una medición» [103] | 103: p. 35, 55, 105 | igual |
| preguntas.html#p-impl-atomica (l. 1266) | «…¿Qué es la lectura no atómica de los encoders y por qué» [104] | 104: p. 121 | igual |
| preguntas.html#p-impl-semilla (l. 1276) | «…Si el PSO no fija una semilla, ¿cómo puede otra persona» [105] | 105: p. 35, 55, 108 | igual |
| preguntas.html#p-impl-planta-pso (l. 1286) | «…¿La planta con que el PSO evaluó las ganancias es la» [106] | 106: p. 115, 123, 135 | igual |
| preguntas.html#p-impl-planta-pso (l. 1288) | «…sus estados con decimales. Además usa una banda muerta común de 2 ticks/ciclo para ambas ruedas, mientras el firmware final…» [2 ticks] | 2 ticks: p. 133, 136 | igual |
| preguntas.html#ayuda-pie (l. 1371) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| preguntas.html#ayuda-pie (l. 1372) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| preguntas.html#search-results (l. 1382) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `problema.html`

Elementos: igual 14, igual (coincidencia débil) 11.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| problema.html#ciclo (l. 115) | «…Cada caja tiene su tema en esta guía. Las ruedas se corrigen 30 veces por segundo y el destino se…» [30] | 30: p. 47, 53, 77 | igual (coincidencia débil) |
| problema.html#estado-del-arte (l. 192) | «…hoy a dos programas. Gazebo Classic, cuya última versión es la 11, y su sucesor, que se desarrolló como Ignition…» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| problema.html#comprar-o-construir (l. 197) | «…un controlador con unidad inercial y motores con encoder integrado 10 . Hay otras pensadas para tareas distintas, como bases» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| problema.html#comprar-o-construir (l. 201) | «…base de investigación para exteriores. Imagen de Clearpath Robotics 11» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| problema.html#comprar-o-construir (l. 205) | «…navegación y manipulación. Imagen de Interbotix, Trossen Robotics 12» [12] | 12: p. 29, 36, 51 | igual (coincidencia débil) |
| problema.html#aporte (l. 213) | «…de código abierto, y el paquete del robot partió de uno existente 13 . Decir el origen de cada pieza…» [13] | 13: p. 30, 36, 61 | igual (coincidencia débil) |
| problema.html#aporte (l. 217) | «…PID opera como un PI incremental, estable en su modelo lineal. Y 53 de las 54 metas abortadas durante la…» [53] | 53: p. 68, 70, 91 | igual (coincidencia débil) |
| problema.html#carta-gantt (l. 235) | «…del autor Carta Gantt de marzo a agosto de 2026: 6 etapas y 17 actividades. Cada mes se divide en…» [17, 22] | 17: p. 34, 36, 61 / 22: p. 39, 61, 77 | igual (coincidencia débil) |
| problema.html#mundo-real (l. 249) | «…Fuentes 14 15» [14, 15] | 14: p. 31, 36, 61 / 15: p. 32, 36, 61 | igual (coincidencia débil) |
| problema.html (l. 86) | «…recinto donde se hicieron todas las pruebas con el robot real. Fotografía del autor, Fig. 5.1 de la» [Figura 5.1] | Figura 5.1 «Entorno utilizado para las pruebas experimentales en hardware real.» p. 79 | igual |
| problema.html#ciclo (l. 129) | «…control de bajo nivel, el computador del robot y la estación de trabajo que mapea, navega y explora. Fig. 2.1 de la» [Figura 2.1] | Figura 2.1 «Diagrama de bloques simplificado de la solución implementada.» p. 31 | igual |
| problema.html#carta-gantt (l. 235) | «…final y entrega del manuscrito semana 4 de agosto Sesión de exploración y mapeo registrada en la tesis (Anexo 7) 22 jun…» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| problema.html#f1 (l. 260) | «…móvil de tracción diferencial . Universidad Tecnológica Metropolitana. Introducción, capítulos 1 y 2, y Anexo» [Anexo 1.2] | Anexo 1.2 «» p. 117 | igual |
| problema.html#ciclo (l. 115) | «…ruedas se corrigen 30 veces por segundo y el destino se revisa cada 3,3» [3,3 s] | 3,3 s: p. 90, 91, 97 | igual |
| problema.html#estado-del-arte (l. 189) | «…los complementos del paquete base para ROS 2 Foxy en Ubuntu 20.04. Llegó al fin de soporte en enero de…» [20.04] | 20.04: p. 21, 33 | igual |
| problema.html#comprar-o-construir (l. 197) | «…a este proyecto es el TurtleBot 3 Burger, que trae un LiDAR de 360°, una Raspberry Pi 4, un controlador…» [360 °] | 360 °: p. 82 | igual |
| problema.html#comprar-o-construir (l. 208) | «…al Burger, los materiales montados en este robot costaron un 32 % menos, y el proyecto completo un 11 %…» [32 %, 11 %] | 32 %: p. 119 / 11 %: p. 119 | igual |
| problema.html#aporte (l. 217) | «…como un PI incremental, estable en su modelo lineal. Y 53 de las 54 metas abortadas durante la exploración coinciden…» [54 metas] | 54 metas: p. 90 | igual |
| problema.html#ayuda-pie (l. 300) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| problema.html#ayuda-pie (l. 301) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| problema.html#search-results (l. 311) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `recursos.html`

Elementos: igual 30, igual (coincidencia débil) 34, no encontrado 1, cálculo o dato ajeno a la tesis 1.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| recursos.html#materiales (l. 248) | «articubot_one/config/ … my_controllers.yaml y twist_mux.yaml» como archivos que cita el Anexo 9 | La Tabla A9.1 (pp. 161 a 163) lista my_controllers.yaml, nav2_params.yaml, mapper_params_online_async.yaml y explore.yaml, pero no twist_mux.yaml. twist_mux aparece solo como paquete en la p. 125. | no encontrado |
| recursos.html#estado-historial (l. 268) | «…ya no se sale de la pantalla en teléfonos angostos, como los de 320 y 375 px, y las pruebas…» [320] | ancho de pantalla, dato del sitio | cálculo o dato ajeno a la tesis |
| recursos.html (l. 83) | «…esta guía, para verificar cada afirmación o seguir aprendiendo. Las 72 de la tesis tienen su propia página, con una…» [72] | 72: p. 89, 112, 114 | igual (coincidencia débil) |
| recursos.html#g-gazebo (l. 142) | «…Classic Simulador 3D de robots, versión 11, con fin de soporte en enero de 2025. Su sucesor se llama» [11] | 11: p. 21, 28, 29 | igual (coincidencia débil) |
| recursos.html#g-intervalo (l. 146) | «…con la media, la dispersión y el número de repeticiones. Al 95 %, el método acierta 95 de cada 100…» [95 %, 95] | 95 %: p. 93, 94, 155 / 95: p. 89, 93, 94 | igual (coincidencia débil) |
| recursos.html#g-percentil (l. 154) | «…95 Valor que solo supera uno de cada veinte datos. En la» [95] | 95: p. 89, 93, 94 | igual (coincidencia débil) |
| recursos.html#g-sensibilidad (l. 165) | «…curva del lazo y el punto crítico. Sus valores típicos están entre 1,2 y 2,0. Tema 4» [1,2] | 1,2: p. 23, 25, 32 | igual (coincidencia débil) |
| recursos.html#g-ticks (l. 169) | «…por ciclo Pulsos de encoder contados en un ciclo de control. A 0,13 m/s, cada rueda cuenta unos» [0,13 m/s, 41] | 0,13 m/s: p. 60, 70, 80 / 41: p. 58, 68, 86 | igual (coincidencia débil) |
| recursos.html#bibliografia (l. 182) | «…72 referencias de la tesis tienen su propia página, agrupadas según para» [72 referencias] | 72 referencias: p. 89, 112, 114 | igual (coincidencia débil) |
| recursos.html#bibliografia (l. 184) | «…de software 5 referencias Proyectos de los que parte el robot 7 referencias» [5 referencias, 7 referencias, 12 referencias, 3 referencias, 9 referencias, 10 referencias, 8 referencias] | 5 referencias: p. 22, 36, 37 / 7 referencias: p. 24, 36, 61 / 12 referencias: p. 29, 36, 51 / 3 referencias: p. 20, 24, 25 / 9 referencias: p. 26, 36, 54 / 10 referencias: p. 27, 36, 40 / 8 referencias: p. 25, 36, 61 | igual (coincidencia débil) |
| recursos.html#materiales (l. 243) | «…de los ensayos en CSV Disponibles Recta de 2 m, giros, respuesta al escalón, mapeo por iteración y metas» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| recursos.html#estado-academico (l. 264) | «…152 páginas Fecha de los datos experimentales Exploración y mapeo, 22 de junio de 2026 (Anexo 7). La tesis no…» [22] | 22: p. 39, 61, 77 | igual (coincidencia débil) |
| recursos.html#estado-historial (l. 268) | «…y la rueda, con el pellizco y con el teclado. La portada lista las 16 partes de la guía. Cada…» [16, 51, 31, 29, 72 referencias, 27, 11, 26, +3 más] | 16: p. 33, 36, 61 / 51: p. 68, 111, 143 / 31: p. 48, 77, 105 / 29: p. 46, 77, 107 / 72 referencias: p. 89, 112, 114 / 27: p. 44, 61, 77 / 11: p. 21, 28, 29 / 26: p. 43, 61, 77 / +3 más | igual (coincidencia débil) |
| recursos.html#abstract (l. 294) | «…trajectories on real hardware. Speed control, evaluated at 0.13 m/s, reaches a near-zero steady-state error and shows no» [0.13 m/s, 60, 54, 53] | 0.13 m/s: p. 60, 70, 80 / 60: p. 77, 90, 91 / 54: p. 71, 90, 91 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| recursos.html#creditos (l. 320) | «…en la carpeta fuentes/ con su licencia SIL Open Font License» [1.1] | 1.1: p. 22, 23, 24 | igual (coincidencia débil) |
| recursos.html (l. 88) | «…sistema completo, con cada pieza enlazada a su tema. Fig. 2.1 de la» [Figura 2.1] | Figura 2.1 «Diagrama de bloques simplificado de la solución implementada.» p. 31 | igual |
| recursos.html#materiales (l. 237) | «…no está publicado, y la tabla dice cuál es cada uno. Los nombres de archivo son los que cita la tesis en…» [Anexo 9] | Anexo 9 «Convención de rutas y localización del software» p. 161 | igual |
| recursos.html#materiales (l. 244) | «…del lazo de velocidad, intervalos de confianza y comparación de los mapas con el plano, transcritas de las Tablas A4.5, A8.2, A8.3…» [Tabla A4.5, Tabla A8.2, Tabla A8.3, Tabla A8.4] | Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 / Tabla A8.2 «Distancias geométricas en ambos sentidos y percentil 95, transcritos…» p. 158 / Tabla A8.3 «Distancias del plano del recinto y las mismas distancias…» p. 159 / Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 | igual |
| recursos.html#estado-academico (l. 264) | «…octubre de 2026, 152 páginas Fecha de los datos experimentales Exploración y mapeo, 22 de junio de 2026 (Anexo 7). La tesis…» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| recursos.html#estado-historial (l. 268) | «…de poses, análisis local de mapas PGM y de registros de metas. Dos frases corregidas para coincidir con el Anexo 7 de…» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| recursos.html#aprender (l. 107) | «…105 La convención de marcos map, odom y base_link que usan» [105] | 105: p. 35, 55, 108 | igual |
| recursos.html#g-clopper (l. 131) | «…la distribución binomial. Con 5 de 6 exploraciones válidas va de 35,9 a 99,6 %. Cuánto dicen cinco repeticiones» [35,9, 99,6 %] | 35,9: p. 94, 160 / 99,6 %: p. 160 | igual |
| recursos.html#g-intervalo (l. 146) | «…y el número de repeticiones. Al 95 %, el método acierta 95 de cada 100 veces. Tema 9» [100] | 100: p. 80, 81, 87 | igual |
| recursos.html#g-percentil (l. 154) | «…supera uno de cada veinte datos. En la comparación con el plano, 8,4 cm: describe cómo se reparten las distancias,…» [8,4 cm] | 8,4 cm: p. 89, 159 | igual |
| recursos.html#g-binomial (l. 159) | «…la tasa verdadera fuera un valor supuesto. Con 5 de 6 frente a un 50 %, da p = 7/64,…» [50 %] | 50 %: p. 95, 160 | igual |
| recursos.html#g-pwm (l. 161) | «…el motor encendiéndolo y apagándolo muy rápido. Aquí va de 0 a» [255] | 255: p. 64, 129, 132 | igual |
| recursos.html#g-resolucion (l. 162) | «…a mostrar. La velocidad de este firmware se informa en pasos de 0,01» [0,01 m/s] | 0,01 m/s: p. 84, 85, 143 | igual |
| recursos.html#g-sensibilidad (l. 165) | «…del lazo y el punto crítico. Sus valores típicos están entre 1,2 y 2,0. Tema 4» [2,0] | 2,0: p. 68, 137, 138 | igual |
| recursos.html#estado-academico (l. 264) | «…del documento de referencia octubre de 2026, 152 páginas Fecha de los datos experimentales Exploración y mapeo, 22» [152 páginas] | 152 páginas: p. 169 | igual |
| recursos.html#estado-historial (l. 268) | «…el detalle de las 51 compras, la carta Gantt y el PDF de las 106 preguntas. Los íconos son de…» [106, 375] | 106: p. 115, 123, 135 / 375: p. 112 | igual |
| recursos.html#abstract (l. 294) | «…shows a mean error of 3.63 % in straight-line trajectories on real hardware. Speed» [3.63 %, 62.2 %, 3.50 m², 3.3 s, 3.4 cm] | 3.63 %: p. 81, 93, 95 / 62.2 %: p. 90, 93, 95 / 3.50 m²: p. 90, 93, 95 / 3.3 s: p. 90, 91, 97 / 3.4 cm: p. 89, 93, 95 | igual |
| recursos.html#creditos (l. 322) | «…textos, diagramas, fotos y figuras propias se publican bajo CC BY 4.0 , como detalla LICENSE-contenido.md . Quedan fuera de…» [4.0] | 4.0: p. 151 | igual |
| recursos.html#nav-cap (l. 347) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| recursos.html#nav-cap (l. 348) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| recursos.html#search-results (l. 358) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `replicar.html`

Elementos: igual 65, igual (coincidencia débil) 14.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| replicar.html#t-breve (l. 98) | «…234 CLP en tornillería y kits, el gasto más fácil de» [127234 CLP] | 127234 CLP: p. 118 | igual (coincidencia débil) |
| replicar.html#materiales (l. 111) | «…Pi 4 Modelo B de 8 GB, carcasa de aluminio y microSD de 64 GB 1 91» [64] | 64: p. 81, 113, 118 | igual (coincidencia débil) |
| replicar.html#materiales (l. 137) | «…precio y la fecha de cada una de las 51 compras, con el peso de cada partida en el costo…» [51] | 51: p. 68, 111, 143 | igual (coincidencia débil) |
| replicar.html#impresion (l. 153) | «…Relleno 20 a 30 %» [20] | 20: p. 36, 37, 61 | igual (coincidencia débil) |
| replicar.html#impresion (l. 156) | «…de cama 55 a 60» [55, 60] | 55: p. 72, 111, 120 / 60: p. 77, 90, 91 | igual (coincidencia débil) |
| replicar.html#versiones (l. 202) | «…nav2_bringup 0.4.7» [0.4] | 0.4: p. 67, 120, 129 | igual (coincidencia débil) |
| replicar.html#versiones (l. 204) | «…Intel Core i7-10610U, 4 núcleos, 32 GB de» [32] | 32: p. 49, 77, 108 | igual (coincidencia débil) |
| replicar.html#orden (l. 263) | «…reales. Realizado Diez vueltas por rueda, con promedios de 1976 y 1969 pulsos. El firmware usa un valor único de…» [1969 pulsos] | 1969 pulsos: p. 129 | igual (coincidencia débil) |
| replicar.html#orden (l. 265) | «…la odometría Contra una cinta, con repeticiones. Validado Recta de 2 m repetida cinco veces, con error medio de 3,63…» [2 m, 95 %] | 2 m: p. 80, 81, 93 / 95 %: p. 93, 94, 155 | igual (coincidencia débil) |
| replicar.html#orden (l. 273) | «…evidencia . Y en cualquier paso, repite cada ensayo al menos de 6 a 10 veces: con 15 éxitos en…» [10, 15] | 10: p. 27, 36, 40 / 15: p. 32, 36, 61 | igual (coincidencia débil) |
| replicar.html#lecciones (l. 284) | «…los tipos de datos cuando cambias un cálculo. Un entero de 16 bits anuló el término integral de una rueda.…» [16] | 16: p. 33, 36, 61 | igual (coincidencia débil) |
| replicar.html#materiales (l. 134) | «…A1.1 de la tesis. Pesos chilenos pagados entre abril de 2024 y julio de 2026. Los» [Tabla A1.1] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 | igual |
| replicar.html#impresion (l. 160) | «…Tabla A1.3 de la tesis.» [Tabla A1.3] | Tabla A1.3 «Parámetros generales de impresión 3D.» p. 120 | igual |
| replicar.html#conexiones (l. 170) | «…completo de energía y datos. Fig. 4.5 de la» [Figura 4.5] | Figura 4.5 «Esquema de conexiones eléctricas y de datos del robot…» p. 59 | igual |
| replicar.html#conexiones (l. 185) | «…Tabla A3.4 de la tesis.» [Tabla A3.4] | Tabla A3.4 «Asignación resumida de pines entre Arduino, L298N y encoders.» p. 125 | igual |
| replicar.html#f1 (l. 299) | «…exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Metodología, y Tablas A1.1, A1.3, A3.2 y» [Tabla A1.1, Tabla A1.3, Tabla A3.2, Tabla A3.4] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 / Tabla A1.3 «Parámetros generales de impresión 3D.» p. 120 / Tabla A3.2 «Equipamiento de la estación de trabajo y versiones del…» p. 124 / Tabla A3.4 «Asignación resumida de pines entre Arduino, L298N y encoders.» p. 125 | igual |
| replicar.html#t-breve (l. 95) | «…materiales montados en el robot costaron 444 643 pesos, y 582 447 con los accesorios de operación. Falta» [444643, 582447] | 444643: p. 51, 118, 119 / 582447: p. 51, 118, 119 | igual |
| replicar.html#t-breve (l. 97) | «…447 CLP costo total del proyecto, sin el» [582447 CLP] | 582447 CLP: p. 51 | igual |
| replicar.html#t-breve (l. 99) | «…kg de filamento PLA+ para el chasis y las» [1 kg] | 1 kg: p. 118 | igual |
| replicar.html#materiales (l. 111) | «…Pi 4 Modelo B de 8 GB, carcasa de aluminio y microSD de 64 GB 1 91» [91759] | 91759: p. 118 | igual |
| replicar.html#materiales (l. 112) | «…RPLidar A1 1 83 324» [83324] | 83324: p. 118 | igual |
| replicar.html#materiales (l. 113) | «…Nano V3 y placa base con bornes de tornillo 1 8» [8000] | 8000: p. 118 | igual |
| replicar.html#materiales (l. 114) | «…JGA25-370 de 12 V con encoder y rueda 2 18» [12 V, 18038] | 12 V: p. 51, 57, 118 / 18038: p. 118 | igual |
| replicar.html#materiales (l. 115) | «…Driver L298N 1 3 000» [3000] | 3000: p. 61, 118, 127 | igual |
| replicar.html#materiales (l. 116) | «…reductor DC-DC de 25 W 1 18» [25 W, 18858] | 25 W: p. 57, 118 / 18858: p. 118 | igual |
| replicar.html#materiales (l. 117) | «…de 12 V y 3000 mAh con adaptador de montaje 1 25» [12 V, 3000, 25658] | 12 V: p. 51, 57, 118 / 3000: p. 61, 118, 127 / 25658: p. 118 | igual |
| replicar.html#materiales (l. 118) | «…Rueda loca 1 1 893» [1893] | 1893: p. 118 | igual |
| replicar.html#materiales (l. 119) | «…Subtotal componentes principales 250 530» [250530] | 250530: p. 118 | igual |
| replicar.html#materiales (l. 121) | «…portafusible, conectores XT60 y bloque de distribución varios 9» [9547] | 9547: p. 118 | igual |
| replicar.html#materiales (l. 122) | «…PLA+ de 1 kg 1 13» [1 kg, 13353] | 1 kg: p. 118 / 13353: p. 118 | igual |
| replicar.html#materiales (l. 123) | «…separadores y tuercas de inserción térmica 6 kits 127» [127234] | 127234: p. 118 | igual |
| replicar.html#materiales (l. 124) | «…conectores y terminales varios 43» [43979] | 43979: p. 118 | igual |
| replicar.html#materiales (l. 125) | «…Total del robot 444 643» [444643] | 444643: p. 51, 118, 119 | igual |
| replicar.html#materiales (l. 127) | «…de viaje GL.iNet GL-MT300N-V2 1 22» [22140] | 22140: p. 118 | igual |
| replicar.html#materiales (l. 128) | «…de red RJ45 Cat-6 3 8» [8376] | 8376: p. 118 | igual |
| replicar.html#materiales (l. 129) | «…de baterías de 12 V 1 16» [12 V, 16169] | 12 V: p. 51, 57, 118 / 16169: p. 118 | igual |
| replicar.html#materiales (l. 130) | «…de 12 V de repuesto 2 41» [12 V, 41436] | 12 V: p. 51, 57, 118 / 41436: p. 118 | igual |
| replicar.html#materiales (l. 131) | «…y receptor HDMI inalámbrico, cables micro HDMI y hub USB varios 49» [49683] | 49683: p. 118 | igual |
| replicar.html#materiales (l. 132) | «…Total del proyecto 582 447» [582447] | 582447: p. 51, 118, 119 | igual |
| replicar.html#materiales (l. 138) | «…tornillería, los separadores y las tuercas de inserción suman 127 234 pesos, más que la Raspberry Pi o que el…» [127234] | 127234: p. 118 | igual |
| replicar.html#impresion (l. 152) | «…Altura de capa 0,2 mm» [0,2 mm] | 0,2 mm: p. 120 | igual |
| replicar.html#impresion (l. 153) | «…Relleno 20 a 30 %» [30 %] | 30 %: p. 120, 143 | igual |
| replicar.html#impresion (l. 155) | «…de boquilla 205 a 215» [205, 215] | 205: p. 120 / 215: p. 120 | igual |
| replicar.html#impresion (l. 157) | «…Velocidad de impresión 50 mm/s» [50 mm] | 50 mm: p. 120 | igual |
| replicar.html#impresion (l. 158) | «…de ensamblaje 0,2 a 0,4» [0,2, 0,4 mm] | 0,2: p. 82, 120, 129 / 0,4 mm: p. 120 | igual |
| replicar.html#versiones (l. 197) | «…Sistema operativo Ubuntu 20.04.6 LTS» [20.04] | 20.04: p. 21, 33 | igual |
| replicar.html#versiones (l. 200) | «…Simulador Gazebo Classic 11.11.0» [11.11] | 11.11: Gazebo Classic 11.11.0 en la Tabla A3.2 (p. 124) | igual |
| replicar.html#versiones (l. 201) | «…slam_toolbox 2.4.1» [2.4] | 2.4: p. 43, 135, 159 | igual |
| replicar.html#versiones (l. 203) | «…ros2_control 0.11.0» [0.11] | 0.11: p. 84 | igual |
| replicar.html#congelado (l. 210) | «…20.04, ROS 2 Foxy, Gazebo Classic y los paquetes base se» [20.04] | 20.04: p. 21, 33 | igual |
| replicar.html#orden (l. 262) | «…energía de motores y electrónica. Realizado Dos rieles separados, 12 V para motores y 5 V para electrónica. Ver el…» [12 V, 5 V] | 12 V: p. 51, 57, 118 / 5 V: p. 57 | igual |
| replicar.html#orden (l. 265) | «…Validado Recta de 2 m repetida cinco veces, con error medio de 3,63 % frente a la cinta e intervalo…» [3,63 %, 3,08, 4,18 %] | 3,63 %: p. 81, 93, 95 / 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 | igual |
| replicar.html#orden (l. 266) | «…seis dieron un mapa válido, con área libre casi igual en todas y a 3,4 cm en promedio del plano…» [3,4 cm] | 3,4 cm: p. 89, 93, 95 | igual |
| replicar.html#orden (l. 273) | «…con 15 éxitos en 15 intentos se puede afirmar una tasa sobre el 78 %, y con 5 de 6…» [78 %, 35,9 %] | 78 %: p. 155 / 35,9 %: p. 94, 160 | igual |
| replicar.html#lecciones (l. 287) | «…de tu instrumento antes de informar decimales. Con pasos de 0,01 m/s, un sobreimpulso pequeño no se ve. Ver la…» [0,01 m/s] | 0,01 m/s: p. 84, 85, 143 | igual |
| replicar.html#ayuda-pie (l. 328) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| replicar.html#ayuda-pie (l. 329) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| replicar.html#search-results (l. 339) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

### `resultados.html`

Elementos: igual 85, igual (coincidencia débil) 33, texto distinto 2.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| resultados.html#subsistemas (l. 128) | SLAM: «Verificado y caracterizado cuantitativamente» | Tabla 5.5 (p. 93): «Verificado funcionalmente y caracterizado cuantitativamente». | texto distinto |
| resultados.html#subsistemas (l. 130) | Exploración: «Verificada funcionalmente» | Tabla 5.5 (p. 93): «Verificada funcionalmente en hardware real». | texto distinto |
| resultados.html#t-breve (l. 104) | «…metas de navegación generadas sin» [60 metas] | 60 metas: p. 90, 97, 98 | igual (coincidencia débil) |
| resultados.html#palabras (l. 113) | «…pero en un caso particular. Ejemplo, el control de velocidad a 0,13» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| resultados.html#subsistemas (l. 126) | «…Validada cuantitativamente Recta de 2 m, cinco repeticiones, error medio de 3,63 % frente a» [2 m, 95 %] | 2 m: p. 80, 81, 93 / 95 %: p. 93, 94, 155 | igual (coincidencia débil) |
| resultados.html#subsistemas (l. 127) | «…y verificado analíticamente Captura real en lazo cerrado a 0,13 m/s, error estacionario de 0,002 m/s o menos, sin» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| resultados.html#subsistemas (l. 129) | «…Ejecutó 59 metas del explorador durante 21,9 m de recorrido. De los 54 abortos, 53 cumplen el criterio temporal de…» [54, 53] | 54: p. 71, 90, 91 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| resultados.html#objetivos (l. 159) | «…cinco ejecuciones válidas, con 21,9 m de recorrido autónomo. De los 54 abortos, 53 cumplen el criterio temporal de asociación…» [54, 53] | 54: p. 71, 90, 91 / 53: p. 68, 70, 91 | igual (coincidencia débil) |
| resultados.html#objetivos (l. 160) | «…Exploración autónoma. Generó 60 metas sin intervención y cinco de seis ejecuciones terminaron» [60 metas] | 60 metas: p. 90, 97, 98 | igual (coincidencia débil) |
| resultados.html#cifras (l. 168) | «…% error odométrico medio en la recta de 2 m, con desviación de 0,44 % en cinco» [2 m] | 2 m: p. 80, 81, 93 | igual (coincidencia débil) |
| resultados.html#cifras (l. 170) | «…m/s error estacionario de la rueda izquierda a 0,13 m/s, y 0 en la» [0,13 m/s] | 0,13 m/s: p. 60, 70, 80 | igual (coincidencia débil) |
| resultados.html#cifras (l. 171) | «…m² área libre mapeada media, con desviación de 0,03» [0,03 m²] | 0,03 m²: p. 88 | igual (coincidencia débil) |
| resultados.html#cifras (l. 173) | «…de 54 abortos que cumplen el criterio temporal de» [53, 54] | 53: p. 68, 70, 91 / 54: p. 71, 90, 91 | igual (coincidencia débil) |
| resultados.html#cifras (l. 174) | «…cm distancia media del plano medido a los mapas, con 3,17 a 3,72 cm según la» [3,72 cm] | 3,72 cm: p. 151, 157, 158 | igual (coincidencia débil) |
| resultados.html#cifras (l. 177) | «…apresuradas que conviene evitar. Decir que el robot cubre el 62 % del recinto, cuando ese índice depende del tamaño…» [62 %, 53, 54, 83 %] | 62 %: p. 79, 112, 143 / 53: p. 68, 70, 91 / 54: p. 71, 90, 91 / 83 %: p. 100, 115, 118 | igual (coincidencia débil) |
| resultados.html#confianza (l. 182) | «…media verdadera. Es una estimación, y su intervalo de confianza al 95 % dice entre qué valores es razonable que…» [95 %] | 95 %: p. 93, 94, 155 | igual (coincidencia débil) |
| resultados.html#confianza (l. 185) | «…n Media Intervalo al 95» [95 %] | 95 %: p. 93, 94, 155 | igual (coincidencia débil) |
| resultados.html#confianza (l. 188) | «…de seguimiento 5 7,18 % 6,65 a 7,71» [7,71 %] | 7,71 %: p. 160 | igual (coincidencia débil) |
| resultados.html#confianza (l. 189) | «…angular respecto de 360° 5 11,7° 1,8 a» [11,7 °, 21,6 °] | 11,7 °: p. 82, 95, 160 / 21,6 °: p. 94, 160 | igual (coincidencia débil) |
| resultados.html#confianza (l. 192) | «…media del plano al mapa 5 3,4 cm 3,1 a 3,7» [3,1] | 3,1: p. 19, 34, 35 | igual (coincidencia débil) |
| resultados.html#confianza (l. 193) | «…válidas 6 83,3 % 35,9 a 99,6» [83,3 %] | 83,3 %: p. 160 | igual (coincidencia débil) |
| resultados.html#sim-repeticiones (l. 201) | «…que supera el 78 %, y para pasar del 80 % harían falta al menos 17 intentos seguidos sin» [17] | 17: p. 34, 36, 61 | igual (coincidencia débil) |
| resultados.html#prueba-binomial (l. 204) | «…intentos? La prueba binomial exacta responde que pasaría 7 de cada 64 veces, p = 0,109375. Eso no basta para…» [64, 0,05] | 64: p. 81, 113, 118 / 0,05: p. 68, 88, 89 | igual (coincidencia débil) |
| resultados.html#cuantas-repeticiones (l. 206) | «…admisible un mínimo de 6 a 10 repeticiones válidas por ensayo, con 10 por condición como objetivo de partida y…» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| resultados.html#limitaciones (l. 224) | «…Modelo y sintonía La captura de 0,1 s no resuelve el retardo, el único escalón no representa la» [0,1 s] | 0,1 s: p. 68, 69, 70 | igual (coincidencia débil) |
| resultados.html#futuro (l. 258) | «…al mínimo de 6 a 10 repeticiones válidas por ensayo, con 10 por condición como punto de partida, y ajustar…» [10] | 10: p. 27, 36, 40 | igual (coincidencia débil) |
| resultados.html#subsistemas (l. 127) | «…o menos, sin sobreimpulso apreciable. Estabilidad y márgenes verificados con el modelo identificado, en la Tabla A4.5. Un solo punto de» [Tabla A4.5] | Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 | igual |
| resultados.html#subsistemas (l. 133) | «…Tabla 5.5 de la tesis.» [Tabla 5.5] | Tabla 5.5 «Estado de validación por subsistema.» p. 93 | igual |
| resultados.html#video (l. 144) | «…temprana, en un pasillo estrecho. Fig. A7.1 a de la» [Figura A7.1] | Figura A7.1 «Secuencia de una ejecución representativa de exploración por» p. 153 | igual |
| resultados.html#video (l. 148) | «…amplia, con la ruta planificada activa. Fig. A7.1 c de la» [Figura A7.1] | Figura A7.1 «Secuencia de una ejecución representativa de exploración por» p. 153 | igual |
| resultados.html#objetivos (l. 157) | «…gemelo con el backend de ros2_control en Gazebo Classic, según los cuatro criterios de funcionamiento de la Tabla A2.2. No incluyó una…» [Tabla A2.2] | Tabla A2.2 «Criterios mínimos de aceptación del gemelo digital.» p. 122 | igual |
| resultados.html#confianza (l. 195) | «…A8.4 de la tesis. Intervalos de la media con la t de Student, salvo la proporción» [Tabla A8.4] | Tabla A8.4 «Intervalos de confianza al 95 % de los indicadores…» p. 160 | igual |
| resultados.html#limitaciones (l. 223) | «…Métricas que no se mezclan Los indicadores de la Tabla 5.3 vienen de la captura real. Los sobreimpulsos de 10,7 a 15,6…» [Tabla 5.3] | Tabla 5.3 «Indicadores de la respuesta al escalón en lazo cerrado,…» p. 86 | igual |
| resultados.html#f1 (l. 268) | «…exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Introducción, Capítulo 5 con la Tabla 5.5 y la…» [Capítulo 5, Tabla 5.5, Anexo 4.12, Anexo 8.5, Anexo 8.6, Tabla A8.4] | Capítulo 5 «RESULTADOS EXPERIMENTALES Este capítulo presenta los resultados obtenidos durant» p. 79 / Tabla 5.5 «Estado de validación por subsistema.» p. 93 / Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Anexo 8.5 «Comparación de los mapas con el plano del recinto» p. 156 / Anexo 8.6 «Intervalos de confianza de los indicadores» p. 159 / +1 más | igual |
| resultados.html#t-breve (l. 98) | «…verificados en funcionamiento. Los mapas, además, quedaron a 3,4 cm en promedio de un plano medido del recinto . Dos» [3,4 cm] | 3,4 cm: p. 89, 93, 95 | igual |
| resultados.html#t-breve (l. 102) | «…% error de la odometría frente a la cinta, con intervalo de» [3,63 %, 3,08, 4,18 %] | 3,63 %: p. 81, 93, 95 / 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 | igual |
| resultados.html#t-breve (l. 103) | «…cm distancia media entre los muros del mapa y los del plano» [3,4 cm] | 3,4 cm: p. 89, 93, 95 | igual |
| resultados.html#subsistemas (l. 126) | «…cuantitativamente Recta de 2 m, cinco repeticiones, error medio de 3,63 % frente a cinta, con intervalo de confianza al…» [3,63 %, 3,08, 4,18 %] | 3,63 %: p. 81, 93, 95 / 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 | igual |
| resultados.html#subsistemas (l. 127) | «…Captura real en lazo cerrado a 0,13 m/s, error estacionario de 0,002 m/s o menos, sin sobreimpulso apreciable. Estabilidad y» [0,002 m/s] | 0,002 m/s: p. 86 | igual |
| resultados.html#subsistemas (l. 128) | «…con el plano medido del recinto, con una distancia media de 3,4» [3,4 cm] | 3,4 cm: p. 89, 93, 95 | igual |
| resultados.html#subsistemas (l. 129) | «…Verificada funcionalmente Ejecutó 59 metas del explorador durante 21,9 m de recorrido. De los 54» [59 metas, 21,9 m] | 59 metas: p. 93 / 21,9 m: p. 92, 93, 98 | igual |
| resultados.html#subsistemas (l. 130) | «…sin intervención y con mapa válido. Cobertura libre media de 62,2 % y área libre media de 3,50» [62,2 %, 3,50 m²] | 62,2 %: p. 90, 93, 95 / 3,50 m²: p. 90, 93, 95 | igual |
| resultados.html#objetivos (l. 159) | «…las metas del explorador en las cinco ejecuciones válidas, con 21,9 m de recorrido autónomo. De los 54 abortos, 53…» [21,9 m] | 21,9 m: p. 92, 93, 98 | igual |
| resultados.html#cifras (l. 168) | «…% error odométrico medio en la recta de 2 m, con desviación» [3,63 %, 0,44 %] | 3,63 %: p. 81, 93, 95 / 0,44 %: p. 81 | igual |
| resultados.html#cifras (l. 169) | «…% error de seguimiento, cinta frente a lo ordenado, en la» [7,18 %] | 7,18 %: p. 81, 96 | igual |
| resultados.html#cifras (l. 170) | «…m/s error estacionario de la rueda izquierda a 0,13 m/s, y 0» [0,002 m/s] | 0,002 m/s: p. 86 | igual |
| resultados.html#cifras (l. 171) | «…m² área libre mapeada media, con desviación de 0,03» [3,50 m²] | 3,50 m²: p. 90, 93, 95 | igual |
| resultados.html#cifras (l. 172) | «…% índice medio de cobertura libre, relativo a la imagen del» [62,2 %] | 62,2 %: p. 90, 93, 95 | igual |
| resultados.html#cifras (l. 174) | «…cm distancia media del plano medido a los mapas, con 3,17 a» [3,4 cm, 3,17] | 3,4 cm: p. 89, 93, 95 / 3,17: p. 157, 158 | igual |
| resultados.html#cifras (l. 175) | «…m recorridos por Nav2 en las cinco corridas válidas,» [21,9 m, 12,7 min] | 21,9 m: p. 92, 93, 98 / 12,7 min: p. 92 | igual |
| resultados.html#cifras (l. 177) | «…%, cuando con seis ejecuciones solo se puede afirmar que supera el 35,9» [35,9 %] | 35,9 %: p. 94, 160 | igual |
| resultados.html#confianza (l. 182) | «…de la distribución t de Student, que con cinco repeticiones vale 2,776 4 . Para una proporción, como cinco exploraciones…» [2,776] | 2,776: p. 160, 168 | igual |
| resultados.html#confianza (l. 187) | «…odométrico 5 3,63 % 3,08 a 4,18» [3,63 %, 3,08, 4,18 %] | 3,63 %: p. 81, 93, 95 / 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 | igual |
| resultados.html#confianza (l. 188) | «…de seguimiento 5 7,18 % 6,65 a 7,71» [7,18 %, 6,65] | 7,18 %: p. 81, 96 / 6,65: p. 160 | igual |
| resultados.html#confianza (l. 189) | «…angular respecto de 360° 5 11,7° 1,8 a» [360 °, 1,8] | 360 °: p. 82 / 1,8: p. 94, 160 | igual |
| resultados.html#confianza (l. 190) | «…de cobertura libre 5 62,2 % 46,2 a 78,3» [62,2 %, 46,2, 78,3 %] | 62,2 %: p. 90, 93, 95 / 46,2: p. 94, 160 / 78,3 %: p. 94 | igual |
| resultados.html#confianza (l. 191) | «…libre mapeada 5 3,50 m² 3,46 a 3,53» [3,50 m², 3,46, 3,53 m²] | 3,50 m²: p. 90, 93, 95 / 3,46: p. 94, 160 / 3,53 m²: p. 94 | igual |
| resultados.html#confianza (l. 192) | «…media del plano al mapa 5 3,4 cm 3,1 a 3,7» [3,4 cm, 3,7 cm] | 3,4 cm: p. 89, 93, 95 / 3,7 cm: p. 94 | igual |
| resultados.html#confianza (l. 193) | «…válidas 6 83,3 % 35,9 a 99,6» [35,9, 99,6 %] | 35,9: p. 94, 160 / 99,6 %: p. 160 | igual |
| resultados.html#sim-repeticiones (l. 201) | «…cinco repeticiones, el error odométrico queda entre 3,08 y 4,18 %. Con diez y la misma dispersión, la semiamplitud» [3,08, 4,18 %, 42 %, 1,24, 0,72, 35,9 %, 78 %, 80 %] | 3,08: p. 93, 94, 160 / 4,18 %: p. 93, 94 / 42 %: p. 161 / 1,24: p. 161 / 0,72: p. 161 / 35,9 %: p. 94, 160 / 78 %: p. 155 / 80 %: p. 161 | igual |
| resultados.html#prueba-binomial (l. 204) | «…que el sistema fuera una moneda, con 50 % de probabilidad de dar un mapa válido. ¿Qué tan raro» [50 %, 0,109375] | 50 %: p. 95, 160 / 0,109375: p. 95, 160 | igual |
| resultados.html#cuantas-repeticiones (l. 206) | «…tesis considera admisible un mínimo de 6 a 10 repeticiones válidas por ensayo, con 10 por condición como objetivo de» [10 repeticiones, 15 repeticiones] | 10 repeticiones: p. 95, 102, 160 / 15 repeticiones: p. 95, 160 | igual |
| resultados.html#cuantas-repeticiones (l. 208) | «…dispersión, los intervalos de la media se angostarían cerca de un 42 %, porque el factor t dividido por la…» [42 %, 1,24, 0,72] | 42 %: p. 161 / 1,24: p. 161 / 0,72: p. 161 | igual |
| resultados.html#cuantas-repeticiones (l. 209) | «…Reducir a la mitad el intervalo del error odométrico pediría unas 13 repeticiones. Afirmar una tasa de éxito sobre el…» [13 repeticiones, 80 %, 17 ejecuciones] | 13 repeticiones: p. 161 / 80 %: p. 161 / 17 ejecuciones: p. 161 | igual |
| resultados.html#limitaciones (l. 222) | «…se midió a mano. El espesor de los muros explica a lo sumo 4 de los 12 cm en que…» [12 cm] | 12 cm: p. 89, 99, 157 | igual |
| resultados.html#limitaciones (l. 223) | «…de la Tabla 5.3 vienen de la captura real. Los sobreimpulsos de 10,7 a 15,6 % vienen de una simulación…» [10,7, 15,6 %] | 10,7: p. 85, 99 / 15,6 %: p. 85, 99 | igual |
| resultados.html#limitaciones (l. 228) | «…externa Pocas repeticiones Un único recinto, de 3,50 m² de área libre media, y cinco iteraciones. Los intervalos» [3,50 m²] | 3,50 m²: p. 90, 93, 95 | igual |
| resultados.html#futuro (l. 258) | «…al mínimo de 6 a 10 repeticiones válidas por ensayo, con 10 por condición como punto de» [10 repeticiones] | 10 repeticiones: p. 95, 102, 160 | igual |
| resultados.html#ayuda-pie (l. 302) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| resultados.html#ayuda-pie (l. 303) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| resultados.html#search-results (l. 313) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |
| resultados.html#subsistemas (l. 126, 127, 129, 131) | Odometría validada cuantitativamente, control evaluado y verificado analíticamente, Nav2 y localización verificadas funcionalmente | Tabla 5.5 (p. 93): mismos estados y mismas observaciones, con 59 metas, 21.9 m, 54 abortos y 53 asociados. | igual |

### `robot.html`

Elementos: igual 58, igual (coincidencia débil) 20, no encontrado 1, cálculo o dato ajeno a la tesis 3.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| robot.html#gasto (l. 233) | «…suman 127 234 CLP, el 29 % del robot, y el de tuercas M5 y M6 cuesta 78 990 CLP,…» [78990 CLP] | precio de un kit sin desglose en la Tabla A1.1, y viene del registro de compras del autor | no encontrado |
| robot.html#seguridad (l. 201) | «…estas ideas se formalizan en normas de seguridad, como la ISO 3691-4 para vehículos industriales sin conductor. El tema se» [3691] | norma ISO externa | cálculo o dato ajeno a la tesis |
| robot.html#costo (l. 217) | «…L298N y rueda loca 4» [4893] | 3 000 más 1 893 CLP de la Tabla A1.1, suma de la guía | cálculo o dato ajeno a la tesis |
| robot.html#gasto (l. 233) | «…el LiDAR y la Raspberry Pi con su carcasa y su tarjeta, suman 175 083 CLP, el 39 % del…» [175083 CLP] | suma de dos partidas de la Tabla A1.1, cálculo de la guía | cálculo o dato ajeno a la tesis |
| robot.html#t-breve (l. 99) | «…Hz ritmo del ciclo entre ROS 2 y el» [30 Hz] | 30 Hz: p. 53, 127, 128 | igual (coincidencia débil) |
| robot.html#vistas (l. 112) | «…es 0,0335 m, la separación entre ruedas 0,188 m, el encoder entrega 1980 pulsos por vuelta de rueda y la…» [1980 pulsos, 30] | 1980 pulsos: p. 52, 53, 82 / 30: p. 47, 53, 77 | igual (coincidencia débil) |
| robot.html#red (l. 146) | «…de viaje GL.iNet GL-MT300N-V2, de 22 140 CLP. Imagen del fabricante. Tabla A1.1 de la» [22140 CLP] | 22140 CLP: p. 118 | igual (coincidencia débil) |
| robot.html#orden (l. 159) | «…orden de velocidad, paso a paso Interactivo Basado en las secciones 4.3.3 a 4.3.5, los algoritmos 4.1 y 4.2 y…» [4.3, 4.1, 4.2] | 4.3: p. 45, 52, 56 / 4.1: p. 22, 51, 52 / 4.2: p. 44, 53, 54 | igual (coincidencia débil) |
| robot.html#orden (l. 162) | «…interfaz de la Raspberry Pi envía referencias y pide los encoders 30 veces por segundo. El firmware del Arduino programa…» [30, 33 ms] | 30: p. 47, 53, 77 / 33 ms: p. 64, 68, 127 | igual (coincidencia débil) |
| robot.html#lidar (l. 189) | «…al menos 180 mediciones. Luego la reparte en 230 sectores de unos 1,57°, guarda la distancia más corta de cada…» [1,57 °, 0,15] | 1,57 °: p. 126 / 0,15: p. 74, 92, 120 | igual (coincidencia débil) |
| robot.html#grafico-costo (l. 228) | «…444 643 CLP. Proyecto completo 582 447 CLP. TurtleBot 3 Burger 656 092 CLP. TurtleBot 3 Waffle Pi 1 619…» [656092 CLP, 1619188 CLP] | 656092 CLP: p. 119 / 1619188 CLP: p. 119 | igual (coincidencia débil) |
| robot.html#gasto (l. 233) | «…de compras del autor detalla cada partida de la Tabla A1.1: 51 compras y 56 unidades, entre 30 abr 2024…» [51, 56, 30, 31, 39 %, 127234 CLP, 29 %] | 51: p. 68, 111, 143 / 56: p. 73, 111, 115 / 30: p. 47, 53, 77 / 31: p. 48, 77, 105 / 39 %: p. 56, 108, 109 / 127234 CLP: p. 118 / 29 %: p. 46, 77, 107 | igual (coincidencia débil) |
| robot.html (l. 85) | «…prototipo construido. Fotografía del autor, Fig. 4.1 de la» [Figura 4.1] | Figura 4.1 «Vista lateral del prototipo construido.» p. 52 | igual |
| robot.html#esquema (l. 123) | «…de conexiones eléctricas y de datos, Fig. 4.5 de la tesis. La batería de 12 V pasa por un fusible y un…» [Figura 4.5] | Figura 4.5 «Esquema de conexiones eléctricas y de datos del robot…» p. 59 | igual |
| robot.html#red (l. 146) | «…de viaje GL.iNet GL-MT300N-V2, de 22 140 CLP. Imagen del fabricante. Tabla A1.1 de la» [Tabla A1.1] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 | igual |
| robot.html#orden (l. 159) | «…de velocidad, paso a paso Interactivo Basado en las secciones 4.3.3 a 4.3.5, los algoritmos 4.1 y 4.2 y el Anexo 3.5…» [Anexo 3.5] | Anexo 3.5 «Temporalidad y ciclo de la interfaz DiffDriveArduino» p. 126 | igual |
| robot.html#protocolo (l. 176) | «…de la Tabla A4.2 de la» [Tabla A4.2] | Tabla A4.2 «Comandos del protocolo serial implementado en el firmware.» p. 132 | igual |
| robot.html#costo (l. 223) | «…de la Tabla A1.1 de la» [Tabla A1.1] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 | igual |
| robot.html#gasto (l. 233) | «…registro de compras del autor detalla cada partida de la Tabla A1.1: 51 compras y 56 unidades, entre 30 abr 2024 y…» [Tabla A1.1] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 | igual |
| robot.html#grafico-partidas (l. 234) | «…de cada partida Registro de compras Las 17 partidas de la Tabla A1.1, de mayor a menor, con su parte del proyecto…» [Tabla A1.1] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 | igual |
| robot.html#grafico-anios (l. 236) | «…10 cm 1 1 817 1 817 28 mar 2025 Total del proyecto 582 447 Registro de compras del autor, ordenado según…» [Tabla A1.1] | Tabla A1.1 «Costo de los materiales del prototipo.» p. 118 | igual |
| robot.html#adaptado (l. 253) | «…en la Tabla A3.1 y el Anexo 3.4 de la» [Tabla A3.1, Anexo 3.4] | Tabla A3.1 «Paquetes principales del workspace.» p. 123 / Anexo 3.4 «Nodo de adquisición del RPLidar A1» p. 126 | igual |
| robot.html#f1 (l. 279) | «…Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial . UTEM. Secciones 3.2, 4.1 y 4.3 a 4.4,…» [Sec. 3.2, Sec. 4.1, Sec. 4.3, Sec. 4.4, Anexo 1, Anexo 3, Anexo 4.3] | Sec. 3.2 «ROS 2: nodos, tópicos y comunicación» p. 37 / Sec. 4.1 «Componentes y parámetros del prototipo» p. 51 / Sec. 4.3 «Construcción de hardware y comunicación con ROS 2» p. 57 / Sec. 4.4 «Firmware de bajo nivel en Arduino Nano» p. 62 / Anexo 1 «Construcción, componentes y montaje» p. 117 / +2 más | igual |
| robot.html#t-breve (l. 97) | «…643 CLP en materiales montados en el robot, sin contar el» [444643 CLP] | 444643 CLP: p. 51 | igual |
| robot.html#t-breve (l. 98) | «…V y 5 V dos rieles de energía separados, motores y» [12 V, 5 V] | 12 V: p. 51, 57, 118 / 5 V: p. 57 | igual |
| robot.html#t-breve (l. 100) | «…s sin órdenes y el firmware detiene los» [2 s] | 2 s: p. 146 | igual |
| robot.html#vistas (l. 110) | «…locomoción usa dos motorreductores JGA25-370 de 12 V, cada uno con un encoder de cuadratura que cuenta su» [12 V] | 12 V: p. 51, 57, 118 | igual |
| robot.html#vistas (l. 112) | «…y aparecen una y otra vez en esta guía. El radio de rueda es 0,0335 m, la separación entre ruedas…» [0,0335 m, 0,188 m] | 0,0335 m: p. 53, 128 / 0,188 m: p. 53, 128 | igual |
| robot.html#energia (l. 119) | «…dominio de potencia usa el bus de 12 V de la batería para mover los motores a través del L298N.» [12 V, 25 W, 5 V] | 12 V: p. 51, 57, 118 / 25 W: p. 57, 118 / 5 V: p. 57 | igual |
| robot.html#esquema (l. 123) | «…eléctricas y de datos, Fig. 4.5 de la tesis. La batería de 12 V pasa por un fusible y un…» [12 V, 5 V] | 12 V: p. 51, 57, 118 / 5 V: p. 57 | igual |
| robot.html#lidar (l. 183) | «…trabajo, en lugar del controlador del fabricante. Se comunica a 115 200 baudios por el puerto serie de la Raspberry…» [115200] | 115200: p. 126 | igual |
| robot.html#lidar (l. 189) | «…50 ms lee lo que llegó, descarta los paquetes que no pasan la» [50 ms, 180, 230, 12 m] | 50 ms: p. 126 / 180: p. 126, 143 / 230: p. 120, 126, 154 / 12 m: p. 120, 126 | igual |
| robot.html#costo (l. 211) | «…Pi 4 de 8 GB, carcasa y microSD 91» [91759] | 91759: p. 118 | igual |
| robot.html#costo (l. 212) | «…RPLidar A1 83 324» [83324] | 83324: p. 118 | igual |
| robot.html#costo (l. 213) | «…de 12 V y 3000 mAh 25» [12 V, 3000, 25658] | 12 V: p. 51, 57, 118 / 3000: p. 61, 118, 127 / 25658: p. 118 | igual |
| robot.html#costo (l. 214) | «…reductor DC-DC de 25 W 18» [25 W, 18858] | 25 W: p. 57, 118 / 18858: p. 118 | igual |
| robot.html#costo (l. 215) | «…motorreductores con encoder y rueda 18» [18038] | 18038: p. 118 | igual |
| robot.html#costo (l. 216) | «…Nano con placa base 8» [8000] | 8000: p. 118 | igual |
| robot.html#costo (l. 218) | «…montaje, filamento y cableado 194» [194113] | 194113: p. 118 | igual |
| robot.html#costo (l. 219) | «…Total del robot 444 643» [444643] | 444643: p. 51, 118, 119 | igual |
| robot.html#costo (l. 220) | «…cargador, baterías de repuesto y accesorios 137» [137804] | 137804: p. 118 | igual |
| robot.html#costo (l. 221) | «…Total del proyecto 582 447» [582447] | 582447: p. 51, 118, 119 | igual |
| robot.html#grafico-costo (l. 227) | «…Datos de la tesis Precios comerciales de catálogo convertidos a 963 CLP por dólar, sin envío ni» [963 CLP] | 963 CLP: p. 118, 119 | igual |
| robot.html#grafico-costo (l. 228) | «…444 643 CLP. Proyecto completo 582 447 CLP. TurtleBot 3 Burger 656» [444643 CLP, 582447 CLP] | 444643 CLP: p. 51 / 582447 CLP: p. 51 | igual |
| robot.html#grafico-costo (l. 230) | «…del dólar observado de octubre a diciembre de 2024, porque el 68 % del gasto se hizo ese año. Con…» [68 %, 32 %, 11 %] | 68 %: p. 118 / 32 %: p. 119 / 11 %: p. 119 | igual |
| robot.html#ayuda-pie (l. 313) | «…bajo licencia MIT y contenido bajo CC BY 4.0 , salvo las excepciones indicadas en Créditos» [4.0] | 4.0: p. 151 | igual |
| robot.html#ayuda-pie (l. 314) | «…de 2026 . Versión del documento de referencia: octubre de 2026, 152» [152 páginas] | 152 páginas: p. 169 | igual |
| robot.html#search-results (l. 324) | «…Enter abre el primero · las cifras se encuentran con coma o punto: 3,63 o» [3,63, 3.63] | 3,63: p. 81, 93, 95 / 3.63: p. 81, 93, 95 | igual |

## Archivos de datos

### `datos/academico.json`

Elementos: igual 4.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/academico.json (l. 6) | «…"Exploración y mapeo, 22 de junio de 2026 (Anexo 7). La tesis no fecha los demás» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| datos/academico.json (l. 34) | «…"Arranque tolerante a fallos, tablas desplazables con teclado, lecturas con regla en el simulador PID, mapa reconstruido en el grafo de poses,…» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| datos/academico.json | version_documento «octubre de 2026, 152 páginas» | La numeración llega a la página 152. El PDF final tiene 169 páginas con las 17 preliminares (portada a índices). | igual |
| datos/academico.json | fecha_datos «22 de junio de 2026 (Anexo 7)» | Anexo 7 (p. 151): «sesión realizada el 22 de junio de 2026». La versión final no fecha otros ensayos. | igual |

### `datos/parametros.json`

Elementos: igual 80, no encontrado 1.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/parametros.json#plano_recinto | ancho_m = 2.14 y coordenadas de muros y cotas | El ancho de 2.14 m y las coordenadas salen del dibujo de la Fig. A8.1 (p. 157), no de una cifra del texto. Alto 1.91 m coincide con la Tabla A8.3. Hay que revisarlo contra la figura. | no encontrado |
| datos/parametros.json (l. 14) | «…"Tesis: sección 4.3.3, Tablas 4.1, 4.3 y A6.2 y Anexo» [Tabla 4.1, Tabla 4.3, Tabla A6.2, Anexo 4.1] | Tabla 4.1 «Parámetros físicos y temporales empleados en la implementación.» p. 53 / Tabla 4.3 «Parámetros principales del controlador diferencial.» p. 60 / Tabla A6.2 «Error de odometría en trayectoria rectilínea de 2 m…» p. 150 / Anexo 4.1 «Ticks por vuelta y ganancias finales» p. 128 | igual |
| datos/parametros.json (l. 84) | «…"Tesis: Tablas 4.3, 4.4, 5.3 y A4.4 y Anexos 4.5, 4.8 y 4.10. Firmware adaptado no» [Tabla 4.3, Tabla 4.4, Tabla 5.3, Tabla A4.4, Anexo 4.5, Anexo 4.8, Anexo 4.10] | Tabla 4.3 «Parámetros principales del controlador diferencial.» p. 60 / Tabla 4.4 «Ganancias definitivas del controlador codificadas en el firmware.» p. 67 / Tabla 5.3 «Indicadores de la respuesta al escalón en lazo cerrado,…» p. 86 / Tabla A4.4 «Salida registrada de una ejecución de SintonizacionAutomatica.py: modelo FOPDT…» p. 139 / Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 / +2 más | igual |
| datos/parametros.json (l. 90) | «…"Anexo 4.5: ganancias enteras del firmware original, comunes a ambas» [Anexo 4.5] | Anexo 4.5 «Origen de la ley de control y cambios respecto…» p. 134 | igual |
| datos/parametros.json (l. 93) | «…"Anexo 4.12 y Tabla A4.5: lazo discreto con el modelo FOPDT de cada rueda a 33 ms, sin saturación, banda del error,…» [Anexo 4.12, Tabla A4.5] | Anexo 4.12 «Análisis de estabilidad del lazo de velocidad» p. 141 / Tabla A4.5 «Estabilidad y robustez de los modelos lineales del lazo…» p. 142 | igual |
| datos/parametros.json (l. 99) | «…"Tesis: Tabla 5.4 y Anexo 8.1 (umbrales de intensidad de la imagen PGM). CSV resumido sin dimensiones de» [Tabla 5.4, Anexo 8.1] | Tabla 5.4 «Indicadores de mapeo en hardware real por iteración (resolución» p. 88 / Anexo 8.1 «Procedencia de los indicadores de mapeo» p. 154 | igual |
| datos/parametros.json (l. 307) | «…"Fig. A8.1 y Tabla A8.3 de la tesis: distancias entre muros medidas con huincha, con los muros dibujados como líneas. El largo…» [Figura A8.1, Tabla A8.3] | Figura A8.1 «Plano del recinto de ensayo, con las distancias entre…» p. 157 / Tabla A8.3 «Distancias del plano del recinto y las mismas distancias…» p. 159 | igual |
| datos/parametros.json (l. 317) | «…"Tesis: Tabla A5.4 y Anexo 5.6. El período efectivo de 3333 ms sale de truncar 1/0,3 s a milisegundos» [Tabla A5.4, Anexo 5.6] | Tabla A5.4 «Parámetros principales del explorador de fronteras.» p. 148 / Anexo 5.6 «Particularidades del explorador de fronteras» p. 148 | igual |
| datos/parametros.json | 61 valores numéricos (ganancias, K, tau, retardo, resolución, umbrales, explorador) | Tablas 4.1, 4.3, 4.4, A4.4, A5.4 y Anexos 4.1, 4.5, 8.1: coinciden. Período del planificador 0.033 s equivale a los 33 ms de la tesis y 3.333 s a los 3333 ms de la Tabla A5.4. | igual |

### `datos/planificacion.json`

Elementos: igual 3.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/planificacion.json (l. 140) | «…"fuente": "Anexo 7"» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| datos/planificacion.json (l. 143) | «…"Es la planificación, no un registro de fechas. La tesis sitúa la sesión de exploración y mapeo el 22 de junio de…» [Anexo 7] | Anexo 7 «Resultados complementarios de exploración y mapeo» p. 151 | igual |
| datos/planificacion.json | seis etapas de la Metodología | Introducción, Metodología (p. 21): seis etapas con los mismos nombres. | igual |

### `datos/costos.csv`

Elementos: igual 20, no encontrado 102.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/costos.csv | 102 montos por compra (precio unitario y total de cada línea) | La Tabla A1.1 solo muestra montos por partida. El desglose por compra no está en el documento. | no encontrado |
| datos/costos.csv | Montos por partida y totales (17 partidas, 3 grupos, total del robot 444 643 CLP, total del proyecto 582 447 CLP) | Tabla A1.1 (p. 118): las 17 partidas, los 3 subtotales y los 2 totales coinciden | igual |

### `datos/analisis/estabilidad.csv`

Elementos: igual 36.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/analisis/estabilidad.csv | 36 celdas numéricas | Tabla A4.5 (p. 142, 143): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/analisis/intervalos.csv`

Elementos: igual 28.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/analisis/intervalos.csv | 28 celdas numéricas | Tabla A8.4 (p. 160): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/analisis/plano-iteraciones.csv`

Elementos: igual 25.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/analisis/plano-iteraciones.csv | 25 celdas numéricas | Tabla A8.2 (p. 158): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/analisis/plano.csv`

Elementos: igual 55.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/analisis/plano.csv | 55 celdas numéricas | Tabla A8.3 (p. 159): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/ensayos/escalon.csv`

Elementos: igual 6.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/ensayos/escalon.csv | 6 celdas numéricas | Tabla 5.3 (p. 86, 87): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/ensayos/giro-real.csv`

Elementos: igual 20.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/ensayos/giro-real.csv | 20 celdas numéricas | Tabla A6.4 (p. 151): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/ensayos/giro-simulacion.csv`

Elementos: igual 25.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/ensayos/giro-simulacion.csv | 25 celdas numéricas | Tabla A6.3 (p. 151): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/ensayos/mapeo.csv`

Elementos: igual 26.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/ensayos/mapeo.csv | 26 celdas numéricas | Tabla 5.4 (p. 88): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/ensayos/metas.csv`

Elementos: igual 35.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/ensayos/metas.csv | 35 celdas numéricas | Tabla A7.1 (p. 152): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/ensayos/recta-2m-real.csv`

Elementos: igual 25.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/ensayos/recta-2m-real.csv | 25 celdas numéricas | Tabla A6.2 (p. 150): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

### `datos/ensayos/recta-2m-simulacion.csv`

Elementos: igual 20.

| Ubicación | Texto del sitio | Versión final (texto y página del PDF) | Clase |
|---|---|---|---|
| datos/ensayos/recta-2m-simulacion.csv | 20 celdas numéricas | Tabla A6.1 (p. 150): todas coinciden (se compara el conjunto de valores de la tabla, no el orden de las celdas) | igual |

## Límites de esta comparación

- La comparación de cifras busca el número en el texto del PDF, no su posición exacta. Un número que ya estaba y cambió de lugar aparecería como «igual». Las 764 coincidencias débiles son enteros cortos o unidades que `pdftotext` escribe distinto (por ejemplo «83.3 %» partido en columnas de una tabla). Las cifras clave y los 11 CSV se verificaron contra la tabla concreta, no solo contra el texto.
- `pdftotext -layout` desordena las celdas de varias tablas (A6.1 a A6.4, A7.1, A8.4). Por eso los CSV se comparan como conjunto de valores por tabla.
- Las citas a secciones de la bibliografía se comprobaron buscando autor y año dentro de cada sección del PDF. La Ş de Şucan se pierde en el texto extraído y se verificó a mano.
- No se comparó el significado de cada frase del sitio con el PDF. Se revisaron las que afirman que algo no está publicado, no se midió o está pendiente, y los estados de la Tabla 5.5 y de los cuatro objetivos específicos.
- No existe copia de la versión de octubre en el repositorio. Lo «nuevo» solo puede darse como lo que el sitio no cita.
- Pendientes del autor que la versión final no resuelve: el método de medida del ángulo físico del giro y el motivo del tamaño mínimo de frontera siguen sin aparecer en el PDF.
