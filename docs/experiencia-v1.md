# Experiencia visual y laboratorio de percepción · V1

## Qué cambia

La portada se reconstruye con una composición editorial de robótica: tipografía grande, colores industriales, un robot manipulable, el ciclo de percepción y decisión, un laboratorio integrado y acceso directo a los ensayos y a los diez capítulos. La nueva página `laboratorios.html` ofrece el mismo experimento con explicaciones y sin el resto de la portada.

El robot se puede girar, desmontar y ensamblar. Hay cámaras de frente, superior y perspectiva, selección de cuatro componentes y un control para detener el movimiento del sensor. Es geometría propia y procedural, no el CAD ni el URDF del robot. La ubicación de los elementos internos es ilustrativa. El radio de rueda de 33,5 mm y la separación de 188 mm provienen de los parámetros publicados.

El laboratorio incluye tres escenarios: recinto, esquina y caja baja. Usa 230 rayos, primer impacto geométrico, un plano de medida ajustable y una rejilla de 70 × 50 celdas de 8 cm. Se puede arrastrar el robot, tocar el mapa o introducir posición y rumbo. Altura, alcance y rayo seleccionado tienen controles de teclado. La historia conserva hasta 240 barridos; al retroceder y editar se abre una nueva secuencia desde ese punto.

«Recorrer» reproduce una ruta prefijada a 0,13 m/s, con velocidad de reproducción seleccionable. No ejecuta un algoritmo de navegación ni SLAM. Los mapas son ejemplos sintéticos con pose conocida y sin ruido. Cambiar el plano o el alcance reinicia el mapa para evitar mezclar experimentos. La caja mide 12 cm: al bajar el láser a 10 cm se detecta, aunque era invisible a 24 cm. La colisión física se comprueba a ambas alturas.

«Copiar escena» conserva escenario, posición, rumbo, altura y alcance en un enlace. El receptor inicia un mapa nuevo desde ese barrido; no recibe todo el historial. «Exportar JSON» incluye geometría, medidas, pose, rejilla, unidades y procedencia sintética. Todo se calcula localmente.

## Aplicar el parche a tu repositorio

El parche parte del commit `fcb47bdc0dc5c453e2576ddeda2f86d64991fb0d`. Está pensado para aplicarse sobre esa versión, sin cambios locales pendientes.

```bash
git switch -c redisenio/experiencia-v1 fcb47bdc0dc5c453e2576ddeda2f86d64991fb0d
git am /ruta/tesis_explain_ux3d_v1_cambios_git_am.patch
npm ci
npm run dev
```

En Windows, reemplaza `/ruta/` por la ubicación del archivo descargado. Abre `http://localhost:4321/tesis_explain/`. También puedes extraer el ZIP completo y ejecutar los dos comandos de npm en su carpeta. La nueva portada necesita un servidor HTTP: abrir el HTML directamente con `file://` no inicia los módulos.

Si `main` recibió cambios después del commit base, conserva esa rama y revisa la integración antes de fusionar. Para cancelar una aplicación con conflictos, `git am --abort` vuelve al estado previo. El parche y el ZIP representan el mismo árbol de archivos, sin dependencias instaladas.

La entrega local no se ha subido a GitHub ni se ha publicado. Para actualizar el sitio, revisa la rama, fusiónala en tu rama de publicación y súbela mediante tu flujo habitual. Los HTML y `_astro/` ya están compilados, y `.nojekyll` permite servir la carpeta de recursos.

## Archivos y compilación

| Ubicación | Función |
|---|---|
| `web/src/pages/` | Portada y página de laboratorio en Astro |
| `web/src/layouts/Shell.astro` | Navegación, metadatos, búsqueda y pie |
| `web/src/components/` | Interfaz reactiva en Svelte |
| `web/src/lib/lidar-model.ts` | Modelo numérico independiente del navegador |
| `web/src/lib/robot-three.ts` | Robot procedural, escena y cámaras |
| `web/src/lib/lidar-three.ts` | Recinto 3D y mapa vinculados al modelo |
| `web/src/styles/experience.css` | Sistema visual y adaptación a pantallas pequeñas |
| `web/tests/` | Pruebas del modelo LiDAR |
| `herramientas/pruebas_redisenio_navegador.py` | Regresiones de interacción para CI |
| `index.html`, `laboratorios.html`, `_astro/` | Publicación estática generada |

`npm run build` prepara los recursos, compila las dos páginas y actualiza solamente sus salidas en la raíz. Después de editar textos, regenera `datos/indice.js` con `python herramientas/indice.py`. El resto de los HTML sigue siendo la fuente editable de sus capítulos. Las rutas públicas conservan el prefijo `/tesis_explain/`.

Las dependencias están fijadas con `package-lock.json`. Las fuentes se sirven localmente. Three.js y GSAP se solicitan como módulos separados; el laboratorio de portada se hidrata al acercarse a la pantalla. El trabajo de dibujo se pausa fuera de la vista y al ocultar la pestaña. Se respeta la preferencia de movimiento reducido y no se sustituye el desplazamiento nativo del navegador.

WebGL añade materiales, iluminación de entorno y sombras. Si no está disponible, una proyección SVG de la misma geometría mantiene el giro, el despiece y el experimento. Ese modo reduce la frecuencia de dibujo y no reproduce los efectos de materiales de WebGL. Si ambos visores fallan, quedan la fotografía y el mapa 2D. Sin JavaScript se puede leer la portada, seguir los capítulos y ver la explicación alternativa del sensor.

## Verificación de esta entrega

- `npm run check`: TypeScript y Svelte, sin errores ni advertencias.
- 203 comprobaciones de los modelos originales y 7 pruebas nuevas de LiDAR: correctas.
- 2.813 comprobaciones estáticas de recursos, anclas, estado académico e índice, sobre 18 páginas.
- Compilación repetida: los HTML, el índice y los recursos generados coinciden byte a byte.
- Revisión de interfaz en navegador: despiece, selección de componentes, cámaras, escenario de caja baja, altura con teclado, avance, historial, pestañas móviles, búsqueda, recorrido, enlace de escenario y descarga JSON con 230 rayos y 3.500 celdas.
- La vista móvil se revisó dentro de un viewport de 390 px, con 375 px útiles por la barra de desplazamiento del entorno. No equivale a una prueba de rendimiento en Android físico.
- El navegador de revisión tenía WebGL desactivado: la revisión visual e interactiva se hizo con el respaldo SVG. La calidad de materiales y el rendimiento de WebGL quedan por verificar en un equipo con GPU.
- La suite Playwright nueva queda configurada en GitHub Actions; no se ejecutó desde este entorno. Las suites anteriores siguen cubriendo los 16 capítulos y complementos que no usan la nueva interfaz.

La entrega incluye el repositorio completo y un parche `git am`, generado con índices completos y soporte binario. La herramienta de entrega aplica el parche en una copia limpia de la base, compara el árbol resultante y verifica cada archivo del ZIP.

## Alcance de la siguiente entrega

Esta es la primera sección funcional de la reconstrucción: portada, objeto 3D y laboratorio de percepción. Los diez capítulos, el laboratorio de datos, las preguntas y la bibliografía siguen accesibles con su diseño previo. Aún no se ha convertido todo el sitio al nuevo sistema visual.

Los próximos módulos pueden usar este patrón para movimiento diferencial, control de las ruedas y navegación. El CAD/URDF real, registros de ensayo y precisiones del autor permitirán sustituir las aproximaciones identificadas sin rehacer la interfaz. No se han creado mediciones, credenciales, servicios de pago ni afirmaciones de aprobación académica.

## Licencias

Astro, Svelte y Three.js se distribuyen bajo MIT. GSAP usa su licencia estándar sin cargo; no se debe presentar como MIT. Se incluyen los avisos de las dependencias principales en `docs/licencias-web/`. Las imágenes, las fuentes y los datos originales conservan sus créditos existentes. No se incorporaron modelos 3D ni fotografías de terceros.
