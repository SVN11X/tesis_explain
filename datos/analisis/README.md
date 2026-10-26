# Tablas del análisis

Valores transcritos de las tablas que la tesis calcula sobre los ensayos, en la versión de octubre de 2026 de *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* (Valderas Neculqueo, 2026). Usan punto decimal y una fila de encabezados. Los genera el autor con sus propios scripts. Aquí no se recalculan con datos crudos, que no están publicados.

| Archivo | Contenido | Tabla de origen |
|---|---|---|
| `estabilidad.csv` | Mayor magnitud de los polos, márgenes de fase, de ganancia y de retardo y sensibilidad máxima del lazo de velocidad, sin retardo y con 0,1 s | Tabla A4.5 |
| `intervalos.csv` | Media e intervalo de confianza al 95 % de cada indicador, con su método | Tabla A8.4 |
| `plano.csv` | Las once distancias del plano del recinto y las mismas distancias en los cinco mapas válidos | Tabla A8.3 |
| `plano-iteraciones.csv` | Distancia media y percentil 95 entre el plano y cada mapa, en ambos sentidos | Tabla A8.2 |

Notas para leerlas.

1. `estabilidad.csv` describe el modelo lineal del Anexo 4.12: el modelo de primer orden con retardo de cada rueda, discretizado a 33 ms, sin saturación, banda del error, zona muerta ni truncamientos enteros. No es una medición del robot. El escenario de 0,1 s es de sensibilidad y no una cota medida del retardo.
2. `herramientas/pruebas_estabilidad.js` comprueba que `js/estabilidad-modelo.js` reproduce cada fila de `estabilidad.csv` con el redondeo de la tesis.
3. `herramientas/pruebas_estadistica.js` recalcula cada intervalo de `intervalos.csv` con los valores por repetición de `datos/ensayos/` y de `plano-iteraciones.csv`.
4. En `plano.csv`, `diferencia_media_cm` es la media de los mapas menos el plano, con el redondeo de la tesis. La incertidumbre de la huincha y la del alineamiento no están incluidas.
5. `intervalos.csv` usa el método `t_student` para las medias y `clopper_pearson` para la proporción de exploraciones válidas.

Licencia CC BY 4.0, como el resto del contenido del sitio. Ver `LICENSE-contenido.md` en la raíz del repositorio.
