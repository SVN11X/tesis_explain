# Informe técnico de la entrega sobre b922205

Esta entrega pone el sitio al día con la versión de octubre de 2026 de la tesis. Agrega tres temas que el documento desarrolla y el sitio no tenía: la estabilidad del lazo de velocidad, la comparación de los mapas con un plano medido del recinto y el alcance estadístico de los ensayos. Corrige las frases que habían quedado atrás, amplía las preguntas de práctica de 54 a 106 y arregla un error de montaje que dejaba reducidos 14 gráficos en los teléfonos. Las tablas experimentales no cambian. La tesis sigue en revisión por comité.

Base: `b9222051979bb092dbc16f850ac1e7e4169b212e` de `main`. Rama local: `actualiza/tesis-20261023`. La entrega no modifica el remoto ni publica cambios en `main`. La auditoría de partida está en `auditoria-b922205.md` y el informe de la entrega anterior en `historial/informe-tecnico-e876140.md`.

## Errores corregidos

1. **Gráficos reducidos en teléfono.** `js/sitio.js` marcaba un interactivo como montado después de dibujarlo. Mientras faltaba esa marca, el CSS centraba el contenido, y los gráficos que miden su contenedor al dibujarse leían un ancho de cero y usaban 600 px. En un teléfono de 390 px quedaban 14 gráficos de 12 interactivos de Control, Movimiento y Exploración a 332 px, con el texto a un 55 % de su tamaño. Ahora la marca se pone antes de dibujar y se quita si el montaje falla. Ningún gráfico queda reducido.
2. **Textos atrasados frente a la versión de octubre.** Son los nueve hallazgos de información académica de `auditoria-b922205.md`. Los principales: los 53 abortos se presentaban como reemplazos y no como una asociación temporal, se decía que no hubo plano del recinto ni análisis de estabilidad, y el protocolo de metas fijas aparecía atado a AMCL.

## Mejoras y funcionalidades nuevas

| Área | Archivos | Resultado |
|---|---|---|
| Estabilidad del lazo | `control.html#estabilidad`, `js/estabilidad-modelo.js`, `js/evidencia.js`, `css/evidencia.css` | Port propio del análisis lineal del Anexo 4.12: la ley escrita como PI en forma de velocidad, el modelo de cada rueda discretizado a 33 ms con retenedor de orden cero y medición promediada, polos, márgenes de ganancia, fase y retardo, y sensibilidad máxima. Reproduce cada fila de la Tabla A4.5 y el barrido de 625 combinaciones. |
| Interactivo de estabilidad | `js/evidencia.js` | Rueda, cuatro conjuntos de ganancias (definitivas, PSO con el Kd evaluado, PSO con el Kd informado y firmware original), retardo, ganancia y constante de tiempo de la planta, Ki tratado como lineal y acercamiento a z = 1. Dibuja los polos y la curva de Nyquist con el círculo de distancia 1/Ms, y una nota dice si las cifras son de la tesis o un cálculo con el mismo modelo. |
| Mapa frente al plano | `mapeo.html#exactitud`, `datos/parametros.json`, `herramientas/diagramas_plano.js`, `img/diagramas/plano-recinto.svg` | Plano del recinto de la Fig. A8.1 con sus once cotas, la diferencia media de cada distancia y la distancia de cada mapa en ambos sentidos. El esquema estático se genera con la misma geometría que el interactivo. |
| Repeticiones y confianza | `resultados.html#confianza`, `js/estadistica-modelo.js` | Media e intervalo t de Student de seis indicadores, intervalo proyectado al cambiar el número de repeticiones y el intervalo de Clopper y Pearson para una proporción, con los casos 5 de 6, 15 de 15 y 17 de 17. |
| Tablas del análisis | `datos/analisis/`, `herramientas/datos.py` | Cuatro CSV transcritos de las Tablas A4.5, A8.2, A8.3 y A8.4, publicados como `PROYECTO.analisis`, con su README. |
| Textos | 13 páginas | Asociación temporal de los abortos, mediana entre aceptaciones, requisitos del protocolo de metas fijas y estado de su script, intervalos junto a cada media, Kd evaluado por el costo, tres razones de la tesis para conservar la ley, versión del documento, resumen y 72 referencias. |
| Preguntas | `preguntas.html` | 52 preguntas nuevas, 106 en total, y cinco temas nuevos: estabilidad, exactitud de los mapas, repeticiones y confianza, las fuentes que cita y del documento al código. Cuatro respuestas pendientes quedaron respaldadas por la versión de octubre. |
| Estado académico | `datos/academico.json`, `recursos.html` | Versión y fecha de los datos, tres pendientes en lugar de cinco e historial de esta actualización. |
| Calidad | `herramientas/pruebas_estabilidad.js`, `herramientas/pruebas_estadistica.js`, `herramientas/pruebas_evidencia_navegador.py`, pruebas existentes, `.github/workflows/verificar.yml` | Cifras de las Tablas A4.5 y A8.4 recalculadas en Node, interactivos nuevos en escritorio, teléfono, tema oscuro y sin JavaScript, ancho real de los gráficos al montarse y esquema del plano al día. |
| Documentación | `README.md`, `datos/`, `docs/` | Auditoría de esta revisión, decisiones, informe académico, trazabilidad y datos. |

## Decisiones técnicas

No se agregaron frameworks, compiladores ni dependencias para visitantes. El análisis de estabilidad se reimplementó en JavaScript para que la página calcule lo que muestra y para probarlo en Node contra la Tabla A4.5, sin publicar el script del autor. Los temas nuevos son secciones dentro de los capítulos que ya los trataban, no páginas aparte. Los encabezados de `metas.csv` se conservan aunque la tesis renombró esas columnas. Las razones completas están en `decisiones.md`.

## Pruebas ejecutadas

Entorno: Node 22.22.0, Python 3.13.17, Playwright 1.63.0 y Chromium 153.0.8010.12. axe-core 4.10.2 se instaló fuera del repositorio solo para la auditoría.

| Verificación | Base | Entrega |
|---|---:|---:|
| `node herramientas/pruebas_unitarias.js` | 40 | 40 |
| `node herramientas/pruebas_control.js` | 21 | 21 |
| `node herramientas/pruebas_mapeo.js` | 28 | 28 |
| `node herramientas/pruebas_slam_proceso.js` | 10 | 10 |
| `node herramientas/pruebas_movimiento.js` | 23 | 23 |
| `node herramientas/pruebas_analisis.js` | 57 | 57 |
| `node herramientas/pruebas_estabilidad.js` | No existía | 13 |
| `node herramientas/pruebas_estadistica.js` | No existía | 11 |
| `python3 herramientas/verificar_sitio.py` | 1 489 | 1 910 |
| `node herramientas/ejemplos_laboratorio.js --comprobar` | correcta | correcta |
| `node herramientas/diagramas_plano.js --comprobar` | No existía | correcta |
| `python3 herramientas/pruebas_control_navegador.py` | 320 | 325 |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 256 | 261 |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 | 214 |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 195 | 195 |
| `python3 herramientas/pruebas_robustez_navegador.py` | 71 | 71 |
| `python3 herramientas/pruebas_evidencia_navegador.py` | No existía | 131 |
| `python3 herramientas/pruebas_navegador.py` | 479 | 479 |

Totales de la entrega: **203 pruebas numéricas, 1 676 comprobaciones de navegador y 1 910 verificaciones estáticas, todas correctas**. Todos los JavaScript pasan `node --check` y todos los scripts de Python compilan.

axe-core revisó las 16 páginas en escritorio claro, escritorio oscuro y teléfono de 390 px, con todos los bloques plegables abiertos y todos los interactivos montados. No encontró infracciones de reglas WCAG A ni AA, ni en la base ni en la entrega. Informa además cuatro recomendaciones de buenas prácticas, `region`, `heading-order`, `landmark-unique` y `landmark-complementary-is-top-level`, que son las mismas en ambas. Esto no es una certificación completa de WCAG 2.2 AA ni reemplaza pruebas con lectores de pantalla.

El error de montaje se reprodujo en la base y se comprobó corregido en la rama, midiendo en un teléfono de 390 px el ancho de cada gráfico frente al de su contenedor en las 16 páginas. Se inspeccionaron capturas de escritorio, teléfono y tema oscuro de los tres interactivos nuevos.

## Uso y despliegue

Para aplicar la entrega en una copia limpia:

```bash
git switch -c actualiza/tesis-20261023 b9222051979bb092dbc16f850ac1e7e4169b212e
git am /ruta/tesis_explain-actualiza-tesis-20261023.patch
```

Para revisar el sitio localmente, desde la raíz: `python3 -m http.server 8000` y abrir `http://localhost:8000`. Después de editar texto o datos: `python3 herramientas/datos.py`, `python3 herramientas/indice.py` y las pruebas del README. GitHub Pages sigue publicando desde `main` y la raíz. Corresponde al propietario revisar la rama o el PR y decidir si la incorpora. No se comprobó una ejecución hospedada de Actions.

## Lo pendiente

1. El método de medida del giro físico y el motivo del tamaño mínimo de frontera siguen pendientes del autor. La versión de octubre no describe el método ni el motivo.
2. No hay mapas, registros de estados ni series de control originales publicados. Las tablas de `datos/analisis/` son transcripciones y los programas que las calculan siguen sin publicar. La geometría del recinto de ensayo se publica transcrita de la Fig. A8.1, y el autor debe confirmar que puede quedar pública.
3. No se probaron Safari ni Firefox reales, ni lectores de pantalla.
4. Las cuatro recomendaciones de buenas prácticas de axe vienen de revisiones anteriores y pueden atenderse en una entrega de plataforma.
