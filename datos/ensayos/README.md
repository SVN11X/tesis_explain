# Tablas de los ensayos

Valores transcritos de las tablas de la tesis *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* (Valderas Neculqueo, 2026). Usan punto decimal y una fila de encabezados. No incluyen registros crudos, que todavía no están publicados.

| Archivo | Contenido | Tabla de origen |
|---|---|---|
| `recta-2m-real.csv` | Recta de 2 m en el robot real, por repetición: odometría, cinta métrica y error odométrico | Tabla A6.2 |
| `recta-2m-simulacion.csv` | Recta de 2 m en Gazebo Classic, por repetición: odometría y desviación respecto de los 2 m | Tabla A6.1 |
| `giro-real.csv` | Protocolo de giro en el robot real, por repetición: giro físico medido y desviación respecto de 360° | Tabla A6.4 |
| `giro-simulacion.csv` | Protocolo de giro en simulación, por repetición: giro acumulado de la odometría y desviación respecto de 360° | Tabla A6.3 |
| `escalon.csv` | Indicadores de la respuesta al escalón de 0,13 m/s en el robot real | Tabla 5.3 |
| `mapeo.csv` | Indicadores de mapeo por iteración en el robot real, con celdas de 0,05 m | Tabla 5.4 |
| `metas.csv` | Resultado de las metas de navegación por iteración de exploración | Tabla A7.1 |

Notas para leerlas.

1. En simulación la pose verdadera de Gazebo Classic no quedó registrada, así que `recta-2m-simulacion.csv` compara la odometría con los 2 m ordenados y no con una medición externa. No se compara con el error odométrico del robot real.
2. La iteración 2 de `mapeo.csv` quedó incompleta y sin mapa, por eso sus valores están vacíos. La Tabla 5.4 la excluye de las medias.
3. `metas.csv` no incluye la iteración 2, igual que la Tabla A7.1. Los totales de la tesis son 60 metas, 54 abortadas, 53 reemplazadas por el explorador, 1 exitosa y 5 sin estado terminal.
4. Las medias calculadas con estos valores pueden diferir en el último decimal de las que informa la tesis, porque la tesis las calcula antes de redondear cada repetición.

Licencia CC BY 4.0, como el resto del contenido del sitio. Ver `LICENSE-contenido.md` en la raíz del repositorio.
