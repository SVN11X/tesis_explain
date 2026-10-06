# Temas críticos de la defensa

Página de estudio para la defensa de título "Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial" (Ingeniería Civil Electrónica, UTEM).

Explica de forma visual cada tema que costó en las cinco rondas de simulación con la comisión. Cada tema trae un diagrama o un gráfico interactivo, las ideas clave en simple, la frase para decir en la sala, las frases a evitar y las preguntas para practicar.

## Secciones

- Resumen de las cinco rondas y áreas más débiles.
- Mapa de temas problemáticos, coloreado por nota.
- Temas explicados, 23 módulos visuales ordenados desde el área más débil.
- Cómo respondes, los patrones que bajaron la nota.
- Practicar, las preguntas con la respuesta oculta.
- Antes del día, listas de lo que falta decidir, corregir y preparar. Las casillas se guardan en el navegador.

## Archivos

- `index.html` es la página.
- `css/estilo.css` tiene el diseño.
- `js/` tiene la lógica de la página (`app.js`) y los diagramas (`vis1.js`, `vis2.js`, `vis3.js`).
- `datos/datos.js` tiene las rondas, las notas y el banco de preguntas.
- `datos/temas.js` tiene el texto de cada tema explicado.
- `img/` tiene las figuras del ensayo del 5 de octubre.

## Publicar en GitHub Pages desde el navegador

1. Entra a https://github.com/new, ponle de nombre `defensa-temas`, déjalo como Public y crea el repositorio.
2. En el repositorio vacío elige "uploading an existing file". Arrastra todo el contenido de esta carpeta, es decir `index.html`, `README.md` y las carpetas `css`, `js`, `datos` e `img`. Presiona "Commit changes".
3. Ve a Settings, luego Pages. En "Build and deployment" elige "Deploy from a branch", rama `main` y carpeta `/ (root)`. Guarda.
4. En uno o dos minutos la página queda en https://svn11x.github.io/defensa-temas/

Si ya habías subido la versión anterior, sube estos archivos encima y borra en GitHub los que ya no estén en esta carpeta.

## Publicar con git

```
git clone https://github.com/SVN11X/defensa-temas.git
cd defensa-temas
# copia aquí index.html, README.md, css/, js/, datos/ e img/
git add .
git commit -m "Temas críticos de la defensa"
git push
```

## Agregar una ronda nueva

Abre `datos/datos.js`.

1. Suma la ronda en la lista `rondas`, por ejemplo `{"r": 6, "fecha": "2026-10-12", "nota": "Texto corto"}`.
2. En cada pregunta que salió, agrega su nota en la lista `notas`, por ejemplo `{"r": 6, "p": "informante", "v": 5.5}`. Si se omitió, usa `"v": 1.0, "om": true`. Los profesores van como `guia`, `informante` o `externo`.

Los gráficos, el mapa de temas y los promedios se recalculan solos.

## Privacidad

En una cuenta gratuita de GitHub, Pages solo funciona con repositorios públicos, así que cualquiera con el enlace puede ver la página. La página le pide a los buscadores que no la indexen, pero eso no la oculta.
