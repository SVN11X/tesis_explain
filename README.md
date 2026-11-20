# Robot explorador

## Qué es

Guía abierta sobre el trabajo de titulación **"Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial"**, de Sebastián Valderas Neculqueo, con el profesor guía Patricio Galarce Acevedo. Ingeniería Civil Electrónica, Universidad Tecnológica Metropolitana (UTEM), 2026. Explica la tesis por capítulos, con interactivos, figuras y respaldos que se leen sin JavaScript.

- Sitio: https://svn11x.github.io/tesis_explain/
- PDF de la tesis: https://github.com/SVN11X/tesis_explain/releases/tag/tesis-final

## Para quién

Para el comité evaluador, las personas que quieran entender el trabajo sin leer las 152 páginas del documento, y quien desee reutilizar los interactivos o los datos con la licencia indicada abajo.

## Estado

**En proceso de defensa. La tesis aún no está aprobada.** La guía sigue la versión de octubre de 2026 del documento. Las cifras pueden cambiar tras la defensa, sin que esta plataforma decida conclusiones académicas. El estado se guarda en `public/datos/academico.json`.

Las cifras y figuras del robot salen de la tesis y se citan con su sección, tabla o figura. Los interactivos llevan la etiqueta **Datos de la tesis** cuando muestran mediciones, e **Interactivo** o **Ilustrativo** cuando usan datos de ejemplo.

## Accesibilidad

Se comprueban los temas claro y oscuro, el movimiento reducido, la navegación por teclado y los respaldos sin JavaScript. Las verificaciones automáticas y la revisión visual no son una certificación completa de WCAG 2.2 AA ni sustituyen pruebas con lectores de pantalla. El detalle está en la [guía de edición](docs/guia-de-edicion.md).

## Uso y desarrollo

Requiere Node.js 24 y Python 3.11.

```bash
npm ci
npm run dev
```

Abre `http://localhost:4321/tesis_explain/`.

Los tres archivos de voz de más de 5 MB no están en git: la publicación los descarga y verifica sus huellas. Para probar el dictado en local, obtenlos con `python scripts/descargar_voz.py`.

Para compilar y probar:

```bash
python -m pip install -r scripts/requisitos.txt
npm run build
python scripts/verificar_sitio.py
npm test
```

- `npm run build` compila con Astro a `dist/` y después ejecuta `scripts/indice.py`, que genera el índice del buscador.
- Las pruebas de navegador (`python tests/navegador*.py`) necesitan `playwright` y compilar antes, porque sirven `dist/`.
- Las herramientas manuales, como `scripts/modelo_robot.py`, usan `scripts/requisitos-opcionales.txt`.
- La lista completa de comprobaciones y pruebas está en la [guía de edición](docs/guia-de-edicion.md).
- `npm run check` revisa los tipos de Svelte y `npm run test:lidar` prueba solo el LiDAR.
- Cada commit en `main` publica `dist/` con `.github/workflows/pages.yml`.

## Estructura

```
├── public/      páginas de la guía, css/, js/, img/, fuentes/, datos/, descargas/, modelos/, voz/
├── src/         portada y laboratorios (Astro, Svelte, TypeScript, Three.js)
├── scripts/     generadores, comprobaciones y herramientas
├── tests/       pruebas de Node y de navegador
├── servicio/    servicio auxiliar del sitio
├── docs/        documentación, decisiones e historial
└── dist/        salida compilada, no se versiona
```

## Documentación

- [Guía de edición](docs/guia-de-edicion.md): diseño, explicaciones por capítulo, cómo editar, pruebas y laboratorio.
- [Cómo funciona](docs/how-it-works.md) y [objetivos](docs/goals.md).
- [Decisiones](docs/decisiones.md) y [informe académico](docs/informe-academico.md).
- [Informe técnico](docs/informe-tecnico.md), con los anteriores y las auditorías en [docs/historial/](docs/historial/).
- [Experiencia y rendimiento de la versión anterior](docs/historial/experiencia-version-anterior.md).

## Cómo citar

Valderas Neculqueo, S. (2026). *Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial* [Trabajo de titulación en proceso de defensa, versión de octubre de 2026]. Universidad Tecnológica Metropolitana.

El formato BibTeX está en `recursos.html#citar`.

## Licencias

El código del sitio (`js/`, `css/`, `scripts/` y la estructura de las páginas HTML) usa la licencia MIT del archivo [LICENSE](LICENSE). Los textos, diagramas, fotos, figuras propias y las tablas de `datos/ensayos/` y `datos/analisis/` usan CC BY 4.0, como detalla [LICENSE-contenido.md](LICENSE-contenido.md). Las imágenes de productos de terceros quedan fuera de esa licencia, las tipografías de `fuentes/` se rigen por la licencia OFL y los íconos de Phosphor por la licencia MIT de [LICENSE-iconos.txt](LICENSE-iconos.txt). `modelos/robot.glb` incluye modelos de componentes comerciales, publicados con permiso de sus licencias. Titular: Sebastián Valderas Neculqueo, 2026.

Los créditos de imágenes están en `recursos.html#creditos`.
