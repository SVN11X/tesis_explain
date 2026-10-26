# Laboratorio local

Abre `laboratorio.html` desde GitHub Pages o un servidor HTTP local. Elige una de las siete tablas existentes o un CSV propio. No requiere cuenta ni clave. Se usa `File.text()`, cálculo JavaScript nativo y SVG. No hay LLM, descargas de modelos, almacenamiento de archivos ni cargas a un servidor.

La política de contenido de esta página limita las conexiones al mismo origen. Los capítulos que muestran videos externos conservan su funcionamiento existente; la política local del laboratorio no convierte todo el sitio en una aplicación sin conexiones externas.

## Esquemas

CSV UTF-8, hasta 2 MiB y 10 000 filas, coma o punto y coma como separador, punto decimal, encabezados únicos. Se admiten comillas escapadas, BOM y CRLF. Cada fila tiene el mismo número de columnas. Cambiar el orden de columnas es válido; cambiar sus nombres o unidades no lo es.

| Tipo | Encabezados obligatorios |
|---|---|
| recta-real | prueba, distancia_teorica_m, distancia_odometria_m, distancia_real_m, error_odometrico_pct |
| recta-simulacion | prueba, distancia_teorica_m, distancia_odometria_m, desviacion_pct |
| giro-real | prueba, referencia_nominal_grados, giro_fisico_medido_grados, desviacion_grados |
| giro-simulacion | prueba, referencia_nominal_grados, giro_acumulado_odom_grados, desviacion_grados, desviacion_normalizada_pct |
| mapeo | iteracion, valida, duracion_min, distancia_odometria_m, cobertura_libre_pct, area_libre_m2 |
| metas | iteracion, metas_generadas, abortadas, reemplazadas_por_explorador, exitosas, sin_estado_terminal, tiempo_activo_mediano_s |
| escalon | indicador, unidad, rueda_izquierda, rueda_derecha |
| serie-control, opcional | tiempo_s, referencia_m_s, velocidad_m_s, pwm |
| estados-metas, opcional | mensaje, meta_id, estado, aceptada_s |

Identificadores enteros positivos sin repetición; conteos enteros no negativos; todos los números finitos. Referencias nominales y distancia física positivas. Cobertura de 0 a 100 %. En mapeo, `valida` es `si` o `no`; una corrida `no` deja vacías las métricas, no ceros. Las filas sin datos se rechazan en los demás tipos.

En metas, `abortadas + exitosas + sin_estado_terminal = metas_generadas` y `reemplazadas_por_explorador ≤ abortadas`. Los abortos restantes quedan sin clasificar, nunca se convierten automáticamente en fallas. Las medianas por corrida no se combinan como una mediana global. Los nombres `reemplazadas_por_explorador` y `tiempo_activo_mediano_s` se conservan por compatibilidad con los archivos ya preparados. En la versión de octubre de 2026 de la tesis, la Tabla A7.1 llama a esas columnas «abortos asociados a reemplazos» y «mediana entre metas»: la asociación es temporal y no descarta fallas concurrentes, y la mediana se mide entre la aceptación de una meta y la de la siguiente.

El resumen de escalón requiere exactamente los cuatro indicadores de `escalon.csv`, sin repeticiones, con unidades `m/s`, `m/s`, `s` y vacío para el texto cualitativo de sobreimpulso. La opción de referencia es explícita; 0,13 m/s es la de la guía. El error declarado se conserva y el recalculado se informa aparte. Si difieren más de 0,0005 m/s se activa una regla de confirmación, basada en medio paso de la precisión de tres decimales de esa tabla. No es un umbral de desempeño físico.

La serie opcional requiere al menos cinco muestras, tiempo no negativo estrictamente creciente, referencia constante, amplitud no nula respecto de la primera velocidad y PWM aplicado entre −255 y 255. El usuario confirma que empieza al aplicar un único escalón. No se incluyeron registros temporales experimentales nuevos.

## Registro de estados de metas

Una fila por cada meta presente en cada mensaje de estado de la acción `NavigateToPose`. `mensaje` es un entero no negativo que ordena los mensajes. `meta_id` tiene de 1 a 64 letras, números, guiones o guiones bajos. `estado` es ACCEPTED, EXECUTING, CANCELING, SUCCEEDED, CANCELED o ABORTED, o su código de `action_msgs/GoalStatus`, de 1 a 6. `aceptada_s` es el sello de aceptación en segundos y no puede cambiar para una misma meta. Una meta no puede aparecer dos veces en el mismo mensaje.

El cálculo sigue la descripción del Anexo 8.4 de la tesis, implementado de nuevo para la guía. El script original del autor no está publicado.

1. Estado final por identificador, con prioridad SUCCEEDED, luego ABORTED, luego CANCELED. Sin ninguno de ellos, la meta queda sin estado terminal.
2. Las metas se ordenan por su sello de aceptación. Una abortada se asocia a un reemplazo si en algún mensaje la meta siguiente ya figura, en cualquier estado, mientras ella sigue ACCEPTED o EXECUTING.
3. Intervalo entre metas de una asociada a reemplazo: aceptación de la siguiente menos aceptación propia. Se informa la mediana. No es una medición de cuándo terminó la anterior.
4. Las abortadas que no cumplen la condición quedan sin clasificar. Nunca se cuentan como fallas.

No se calcula tasa de éxito. Si se conoce el período del explorador, la regla `periodo-explorador` compara la mediana con él; con los parámetros de la guía, 3,333 s según la Tabla A5.4. Una coincidencia no prueba la causa de cada reemplazo.

## Mapas de ocupación PGM

`js/analisis-mapa.js` lee imágenes PGM binarias (P5) o de texto (P2), hasta 8 MiB y 4 millones de celdas, con comentarios en el encabezado y grises de 8 o 16 bits. Del YAML de `map_saver` lee solo `image`, `mode`, `resolution`, `origin`, `negate`, `occupied_thresh` y `free_thresh`, escritos como `clave: valor`; no interpreta etiquetas ni ejecuta nada.

Dos criterios para clasificar cada gris, llevado a la escala de 0 a 255:

| Criterio | Libre | Ocupada | Desconocida |
|---|---|---|---|
| Tesis, Anexo 8.1 | gris ≥ 230 | gris ≤ 50 | entre ambos |
| YAML, como map_server trinario | ocupación < free_thresh | ocupación > occupied_thresh | entre ambos |

La ocupación es (255 − gris) / 255, o gris / 255 con `negate: 1`. Los umbrales de la tesis están en `datos/parametros.json` y quedan sujetos a la revisión del comité.

Métricas: celdas por clase, áreas como celdas × resolución², índice de cobertura libre 100 · libres / (libres + desconocidas) en la imagen completa y en el menor rectángulo que contiene las celdas libres u ocupadas, y número de tonos de gris. La resolución sale del YAML si existe; si no, la escribe el usuario y la procedencia lo dice. La regla `indice-depende-marco` se activa si los dos índices difieren en más de 1 punto: el área libre no cambia y el índice sí.

Comparación de dos mapas: solo celda a celda si coinciden tamaño, resolución y, cuando ambos YAML lo declaran, origen. Entonces informa acuerdo entre celdas observadas en ambos, contradicciones libre/ocupada y celdas observadas solo en uno. Si no coinciden, compara solo áreas e índices y lo explica. No se alinea, rota ni recorta ningún mapa. La exportación JSON no incluye las celdas, solo conteos, dimensiones, criterio y huellas SHA-256 de cada PGM.

Los archivos de `datos/ejemplos/` son sintéticos y sirven para probar el formato. Los mapas originales del prototipo no están publicados.

## Métricas y alcance

La desviación usa el denominador `n−1`; con una sola repetición se devuelve `null`. Los errores relativos de recta real usan la cinta como denominador. La simulación usa distancia ordenada y lo advierte. Los porcentajes originales de tablas se separan de los recalculados con distancias redondeadas.

Mapeo: media y dispersión de área e índice declarado, excluyendo la corrida sin mapa. El índice de la guía es `100 · libres / (libres + desconocidas)`. El CSV no permite recalcularlo, inferir áreas ocupadas/desconocidas ni verificar resolución, marco o geometría. La resolución reportada de 0,05 m permanece documentada como parámetro de la guía, no como contenido comprobado del archivo importado.

Control resumido: se leen velocidad y subida declaradas; no se inventan establecimiento, saturación ni sobreimpulso porcentual.

Serie temporal propia: sobreimpulso observado en sentido de la amplitud; establecimiento observado después de la última muestra fuera de la banda, con al menos dos muestras restantes; porcentaje de muestras en ±255. No se afirma estabilidad futura, no se interpola ni se pondera el promedio por tiempo. El error del último 20 % del intervalo se llama error final, sin certificar régimen estacionario. Una memoria integral no registrada impide demostrar windup.

El gráfico muestra hasta 30 barras o aproximadamente 1 500 puntos para mantener fluidez; la tabla visible muestra hasta 200 filas. Todas las métricas y la exportación usan todas las filas. Las unidades y los valores completos están disponibles en la tabla y en JSON, con series diferenciadas por trazo además de color.

## Interfaz para futuras extensiones

`ANALISIS_MAPA.analizarMapa(pgm, opciones)` y `ANALISIS_MAPA.compararMapas(a, b, opciones)` devuelven la misma estructura que `ANALISIS.analizar`, con un objeto `mapa` de dimensiones, resolución, criterio, origen y rectángulo observado. Las celdas clasificadas quedan en propiedades no enumerables, para dibujar, y no viajan en el JSON.

`ANALISIS.analizar(textoCSV, opciones)` es una función sin DOM ni red que devuelve:

```js
{
  version: 1,
  tipo: "metas",
  filas: [],
  metricas: [{id, nombre, valor, unidad, formula, origen}],
  reglas: [{id, hallazgo, condicion, evidencia, interpretacion, sugerencia, limitacion}],
  limitaciones: [],
  grafica: {titulo, etiquetas, series: [{nombre, valores}], unidad}
}
```

La UI añade procedencia, opciones exactas utilizadas, estado académico y SHA-256 del texto UTF-8 local cuando `crypto.subtle` está disponible. No es una firma del experimento. Al exportar se descarga un JSON local. Limpiar elimina referencias al texto y sus resultados del DOM y de la memoria de la aplicación; no promete borrado forense de la memoria del navegador.

Un adaptador futuro para trayectorias, rejillas o inferencia local debe recibir datos ya validados, declarar versión, unidades, marco, supuestos y producir la misma estructura. Las sugerencias de un modelo se añadirían como otro origen explícito y opcional, sin sobrescribir métricas ni reglas. No hay modelos, servicios de inferencia ni adaptadores activos en esta entrega.
