# Informe técnico de la entrega sobre a5bd066

Esta entrega mejora cómo se ve, se usa y carga el sitio, sin tocar el contenido académico. Suma una identidad visual propia, una portada más corta en el teléfono, un comparador de decisiones, un filtro del glosario y las secciones de cada página en el menú del teléfono. Corrige el salto de la página al llegar las fuentes, que dejaba el CLS sobre el umbral en las 16 páginas, y reduce lo que se descarga al abrir cada página. Las tablas experimentales no cambian. La tesis sigue en revisión por comité.

Base: `a5bd06659d190ec6a2fe7d48925e072a5ed07a7f` de `main`. Rama local: `mejora/experiencia-premium`. La entrega no modifica el remoto ni publica cambios en `main`. La auditoría de partida está en `auditoria-a5bd066.md` y el informe de la entrega anterior en `historial/informe-tecnico-b922205.md`.

## Errores corregidos

1. **La página saltaba al llegar las fuentes.** El aviso académico pasaba de tres a dos líneas y el título de la portada de cinco a cuatro. Las fuentes de respaldo ahora tienen el ancho y la altura de Archivo y Atkinson, y los anchos de lectura van en `em`, porque en `ch` cambiaban con la fuente. Con las fuentes 1,2 s tarde, el CLS medido es menor que 0,001 en la portada, en `control.html` y en `preguntas.html`.
2. **Orden de títulos.** Las tarjetas de decisión de `problema.html`, `robot.html` y `resultados.html` saltaban de `h2` a `h4`. Ahora usan `h3`.
3. **Tamaño de un control táctil.** En el esquema de conexiones de `robot.html`, en un teléfono, el botón Ampliar tapaba en parte el punto del LiDAR. Ahora va bajo la figura.
4. **Imágenes más pesadas que su respaldo.** Cuatro gráficos en WebP con pérdida pesaban más que su PNG. Pasaron a WebP sin pérdida: `odom-real.webp` bajó de 109 a 68 KB y `escalon-final.webp` de 42 a 21 KB, con líneas y textos nítidos.
5. **Dependencia oculta entre archivos.** `js/vis3.js` leía iconos que definía `js/vis1.js` y fallaba si una página cargaba solo el primero. Los iconos viven ahora en `js/comun.js`.

## Mejoras y funcionalidades nuevas

| Área | Archivos | Resultado |
|---|---|---|
| Identidad visual | `css/estilo.css` | Plano técnico: rejilla de ocupación detrás de los títulos, anillos y un barrido del LiDAR alrededor del prototipo, paneles azul noche en la banda del video, el laboratorio y el pie, y la franja azul y verde en rótulos, cifras y fichas. Botones, tarjetas y avisos con estados y sombras coherentes, en tema claro y oscuro. |
| Portada | `index.html`, `css/estilo.css`, `js/sims.js` | Título más grande, simulación del ciclo como consola azul noche, imágenes de los temas en un mismo tono que recuperan su color al apuntarlas, temas en filas compactas en el teléfono y un cierre en dos columnas con el laboratorio. En un teléfono la sección de temas mide 1 914 px, antes unos 4 200. |
| Movimiento | `css/estilo.css` | Transición entre páginas con la cabecera fija, aparición de tarjetas y figuras al desplazarse y microinteracciones en botones, menús y diálogos. Todo es una mejora progresiva y se anula con movimiento reducido. |
| Navegación | 16 páginas, `js/sitio.js` | Precarga de la página siguiente al apuntar un enlace, en Chrome y Edge. En el teléfono, el menú de la cabecera lista las secciones de la página y marca la actual. |
| Comparador de decisiones | `problema.html`, `js/decisiones.js` | Cada pieza y cada alternativa es un botón que resalta la frase con que la tesis la elige o la descarta. No agrega argumentos nuevos y sin JavaScript se lee el párrafo completo. |
| Glosario | `recursos.html`, `js/sitio.js` | Filtro sin tildes ni mayúsculas, con el número de coincidencias anunciado. |
| Carga de interactivos | `js/sitio.js`, 10 páginas | `MODULOS` dice qué archivo registra cada interactivo. Las páginas ya no los cargan al abrirse: se piden al acercarse. El JavaScript inicial comprimido bajó, por ejemplo, de 124 a 27 KB en `mapeo.html`, de 105 a 34 KB en `control.html` y de 84 a 25 KB en la portada. |
| Videos | 6 páginas, `js/sitio.js` | Sin descarga automática. Sin JavaScript muestran su portada y los controles del navegador. Con JavaScript, el archivo se pide cuando el navegador queda libre y el video se acerca. Portadas en WebP. |
| Imágenes | `img/` | WebP sin pérdida para los gráficos, nuevos WebP para el comparador del PSO y la figura de truncamiento, variantes de 800 y 900 px para las fotos de cabecera y la foto grande del robot visto desde arriba para ampliar en `gemelo.html`. Se quitaron tres portadas JPG que ya no se usaban. |
| Código | 6 páginas, `css/estilo.css` | Sin estilos en línea, sin `!important` en el panel de Temas y con las reglas de la portada en un solo bloque. |
| Estado académico | `datos/academico.json`, `recursos.html` | Historial con esta actualización de plataforma y revisión base. |
| Calidad | `herramientas/pruebas_experiencia_navegador.py`, `.github/workflows/verificar.yml` | 58 comprobaciones nuevas de lo anterior, incluidas en el flujo de verificación. |
| Documentación | `README.md`, `docs/` | Auditoría de esta revisión, decisiones e instrucciones para registrar interactivos y ajustar fuentes. |

## Decisiones técnicas

Se evaluaron Astro, React, TypeScript, GSAP, Motion, Three.js, React Three Fiber, Rive, WebAssembly y WebGPU. No se usó ninguno: el sitio ya era estático y estaba probado, sus interactivos son 2D y sus cálculos pequeños, y lo que se buscaba se logró con CSS y funciones nativas del navegador. No se agregaron dependencias para los visitantes ni un paso de compilación. Las razones completas están en `decisiones.md`.

## Pruebas ejecutadas

Entorno: Node 22.23.4, Python 3.13.17, Playwright 1.63.0 y Chromium 1243. Lighthouse 12.8.2, axe-core 4.10.2 y css-tree 2.3.1 se instalaron fuera del repositorio solo para medir.

| Verificación | Base | Entrega |
|---|---:|---:|
| Pruebas numéricas en Node, ocho archivos | 203 | 203 |
| `python3 herramientas/verificar_sitio.py` | 1 910 | 1 904 |
| `node herramientas/ejemplos_laboratorio.js --comprobar` | correcta | correcta |
| `node herramientas/diagramas_plano.js --comprobar` | correcta | correcta |
| `python3 herramientas/pruebas_control_navegador.py` | 325 | 325 |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 261 | 261 |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 | 214 |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 195 | 195 |
| `python3 herramientas/pruebas_robustez_navegador.py` | 71 | 71 |
| `python3 herramientas/pruebas_evidencia_navegador.py` | 131 | 131 |
| `python3 herramientas/pruebas_navegador.py` | 479 | 479 |
| `python3 herramientas/pruebas_experiencia_navegador.py` | No existía | 58 |

Totales de la entrega: **203 pruebas numéricas, 1 734 comprobaciones de navegador y 1 904 verificaciones estáticas, todas correctas**. Las verificaciones estáticas bajan porque las páginas ya no enlazan los archivos de interactivos. Todos los JavaScript pasan `node --check`, los scripts de Python compilan y las seis hojas de estilo se analizan sin errores con css-tree.

Lighthouse en teléfono, con el servidor local que comprime como GitHub Pages:

| Página | Rendimiento | LCP | CLS | Peso al abrir | Accesibilidad |
|---|---:|---:|---:|---:|---:|
| `index.html` | 78 → 95 | 2,7 → 2,8 s | 0,329 → 0,001 | 629 → 434 KB | 100 → 100 |
| `problema.html` | 89 → 97 | 2,6 → 2,4 s | 0,143 → 0,001 | 309 → 278 KB | 98 → 100 |
| `robot.html` | 88 → 98 | 2,7 → 2,3 s | 0,143 → 0,001 | 609 → 582 KB | 99 → 100 |
| `movimiento.html` | 85 → 97 | 3,3 → 2,6 s | 0,143 → 0,001 | 376 → 273 KB | 100 → 100 |
| `control.html` | 81 → 96 | 3,7 → 2,6 s | 0,143 → 0,001 | 408 → 244 KB | 100 → 100 |
| `mapeo.html` | 80 → 98 | 3,7 → 2,3 s | 0,143 → 0,001 | 1 163 → 292 KB | 100 → 100 |
| `navegacion.html` | 91 → 96 | 2,4 → 2,6 s | 0,144 → 0,001 | 625 → 554 KB | 100 → 100 |
| `exploracion.html` | 94 → 98 | 1,8 → 2,3 s | 0,144 → 0,001 | 504 → 429 KB | 100 → 100 |
| `gemelo.html` | 90 → 99 | 2,6 → 2,0 s | 0,143 → 0,001 | 436 → 378 KB | 100 → 100 |
| `resultados.html` | 88 → 97 | 2,9 → 2,4 s | 0,143 → 0,001 | 312 → 245 KB | 99 → 100 |
| `replicar.html` | 87 → 97 | 2,8 → 2,4 s | 0,143 → 0,001 | 327 → 230 KB | 100 → 100 |
| `mundo-real.html` | 94 → 99 | 1,8 → 2,0 s | 0,143 → 0,000 | 173 → 182 KB | 100 → 100 |
| `lecciones.html` | 94 → 99 | 1,8 → 2,1 s | 0,143 → 0,000 | 220 → 195 KB | 100 → 100 |
| `preguntas.html` | 90 → 98 | 2,4 → 2,0 s | 0,143 → 0,001 | 227 → 236 KB | 100 → 100 |
| `laboratorio.html` | 93 → 99 | 2,0 → 2,1 s | 0,143 → 0,018 | 197 → 206 KB | 100 → 100 |
| `recursos.html` | 82 → 98 | 2,4 → 2,4 s | 0,280 → 0,000 | 297 → 305 KB | 100 → 100 |

En escritorio el rendimiento quedó en 100 en las 16 páginas, antes entre 98 y 100, y el CLS máximo bajó de 0,096 a 0,002. SEO da 100 antes y después. Buenas prácticas da 100, salvo 96 en las cuatro páginas con miniaturas de YouTube, porque el entorno de prueba no tiene salida a internet. Lighthouse varía entre corridas en uno o dos puntos. En algunas páginas el LCP simulado sube unas décimas porque las dos fuentes precargadas compiten con la primera pintura. Se probó quitarlas: la portada mejora, pero `control.html` y `exploracion.html` empeoran y el promedio baja, así que se conservaron.

axe-core revisó las 16 páginas en escritorio claro, escritorio oscuro y teléfono de 390 px, con las reglas de WCAG 2.0, 2.1 y 2.2 en sus niveles A y AA, los plegables abiertos, los interactivos montados y el comparador activo. No encontró infracciones. En la base encontraba la del esquema de conexiones, que se corrigió. Esto no es una certificación completa de WCAG 2.2 AA ni reemplaza pruebas con lectores de pantalla.

Se revisaron capturas de las páginas en escritorio de 1440 px y en un teléfono de 390 px, en tema claro y oscuro y con movimiento reducido.

## Pendientes y riesgos

- La transición entre páginas y la aparición al desplazarse funcionan en Chrome y Edge, y la transición también en Safari 18.2 o posterior. En los demás navegadores el sitio se ve completo y sin movimiento.
- Un interactivo nuevo debe registrarse en `MODULOS` de `js/sitio.js`. `pruebas_experiencia_navegador.py` falla si falta alguno.
- Las cifras de rendimiento son de laboratorio. Los datos de visitantes reales de Core Web Vitals solo existirán con tráfico suficiente en el sitio publicado.

## Cómo aplicar el parche

```bash
git checkout -b mejora/experiencia-premium a5bd06659d190ec6a2fe7d48925e072a5ed07a7f
git am --keep-cr mejora-experiencia-premium.patch
python3 herramientas/verificar_sitio.py
python3 herramientas/pruebas_experiencia_navegador.py
```

Revisa el resultado en `python3 -m http.server 8000` antes de incorporarlo a `main`. GitHub Pages publica la rama `main` sin compilación, como antes.
