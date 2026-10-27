# Informe técnico de la revisión sobre ae42f52

Esta revisión explica la bibliografía de la tesis y corrige fallas encontradas en el sitio publicado y en su verificación automática. Cada una de las 72 referencias se ve como una línea con su número, su autor, su tipo y un resumen, y al presionarla se abre el detalle: de qué trata el documento, para qué lo usa la tesis, dónde aparece y la cita completa. Además, la página ya no salta al cargar en Android ni en Linux sin Arial, el flujo de GitHub Actions identifica la comprobación que falla y los documentos del repositorio se abren con formato. Las tablas experimentales no cambian. La tesis sigue en revisión por comité.

Base: `ae42f525771c23e8581ddda6d968489a9fba44c4` de `main`. Rama local: `revision/fallas-referencias`. La auditoría de partida está en `auditoria-ae42f52.md` y el informe anterior en `historial/informe-tecnico-a5bd066.md`.

## Fallas corregidas

1. **Bibliografía sin explicación.** La lista de 72 referencias no decía qué es cada documento ni para qué se usa, y había perdido las notas que la tesis pone a varias. Ahora se genera desde `datos/bibliografia.json`, agrupada en 11 temas plegables. Cada referencia es una línea de resumen que se abre con de qué trata el documento, para qué lo usa la tesis, las secciones donde se cita, los enlaces a la guía y la cita completa. El contenido de las 37 referencias de las que había copia se tomó del propio documento, y el de las otras 35, de su página oficial o de su resumen publicado. Un filtro busca en todo el texto de cada referencia, el enlace `recursos.html#r-…` abre su grupo y su detalle, y el buscador del sitio tiene una entrada por referencia. El orden de las referencias 29 a 31 sigue el de la tesis.
2. **Salto al cargar en Android.** Con las fuentes 1,2 s tarde y solo Roboto instalada, 18 de las 32 mediciones de las 16 páginas, en teléfono y escritorio, superaban el CLS de 0,02, con un máximo de 0,186. Roboto tiene ahora su propio respaldo y el máximo queda en 0,0010. En Android 12 o posterior Roboto es variable: si su negrita no tiene nombre propio, se usa la regular con peso 700 y ancho normal, comprobado con la fuente variable.
3. **Salto al cargar en Linux sin Arial.** Con solo DejaVu Sans, 20 de las 32 mediciones superaban 0,02, con un máximo de 0,260 en `lecciones.html` en escritorio. DejaVu Sans tiene su propio respaldo, ajustado en las 16 páginas, y el máximo queda en 0,0012.
4. **Títulos de los temas que cambiaban de línea.** El respaldo de los títulos estaba ajustado al de la portada. El de `movimiento.html` ocupaba una línea con el respaldo y dos con Archivo entre 364 y 480 px de ancho, y la página bajaba al llegar la fuente, con un CLS de 0,026 en teléfono aun con Arial. Los títulos de los temas tienen ahora su propio respaldo. Entre 320 y 480 px, las combinaciones de página y ancho en que el título cambia de número de líneas bajan de 36 a 1 con Arial, de 80 a 1 con Roboto y de 208 a 1 con DejaVu Sans.
5. **Flujo de GitHub Actions en rojo.** La ejecución de `ae42f52` falló, con alta probabilidad en la primera medición de CLS, como se describe en la auditoría. La prueba ahora reporta qué respaldo usó, omite la medición con un aviso si el sistema no tiene ninguna fuente compatible y, si algo falla, deja el nombre de la comprobación como anotación en el resumen de la ejecución. El flujo escribe la salida sin búfer y usa las versiones de las acciones que corren en Node 24.
6. **Comprobación inestable.** «si el sistema pasa a movimiento reducido, se detiene» esperaba 50 ms fijos. Ahora espera a que la simulación cambie de estado, con hasta 3 s de margen.
7. **Documentos sin formato.** Los enlaces a Markdown y CSV del repositorio desde Recursos y el Laboratorio abrían texto plano o descargaban el archivo. Ahora abren la vista de GitHub.
8. **Redacción.** Dos frases de `docs/informe-academico.md` y del README hablaban de una «entrega». Se corrigieron.

## Archivos

| Área | Archivos |
|---|---|
| Bibliografía | `datos/bibliografia.json`, `herramientas/datos.py`, `recursos.html`, `css/estilo.css`, `js/sitio.js`, `herramientas/indice.py`, `datos/indice.js` |
| Aviso en cada tema | 13 páginas con lista de fuentes, que enlazan la bibliografía explicada |
| Fuentes de respaldo | `css/estilo.css` |
| Enlaces a documentos | `recursos.html`, `laboratorio.html`, `datos/academico.json` |
| Estado académico | `datos/academico.json`, `datos/proyecto.js`, `recursos.html` |
| Verificación | `.github/workflows/verificar.yml`, `herramientas/pruebas_experiencia_navegador.py`, `herramientas/pruebas_navegador.py` |
| Documentación | `README.md`, `docs/decisiones.md`, `docs/informe-academico.md`, `docs/auditoria-ae42f52.md` |

## Pruebas ejecutadas

Entorno: Node 22.23.4, Python 3.13.17, Playwright 1.63.0 y Chrome for Testing 153. El paso de navegador también se corrió con Python 3.12, como en GitHub Actions.

| Verificación | Base | Revisión |
|---|---:|---:|
| Pruebas numéricas en Node, ocho archivos | 203 | 203 |
| `python3 herramientas/verificar_sitio.py` | 1 904 | 2 107 |
| `node herramientas/ejemplos_laboratorio.js --comprobar` | correcta | correcta |
| `node herramientas/diagramas_plano.js --comprobar` | correcta | correcta |
| `python3 herramientas/pruebas_control_navegador.py` | 325 | 325 |
| `python3 herramientas/pruebas_mapeo_navegador.py` | 261 | 261 |
| `python3 herramientas/pruebas_movimiento_navegador.py` | 214 | 214 |
| `python3 herramientas/pruebas_laboratorio_navegador.py` | 195 | 195 |
| `python3 herramientas/pruebas_robustez_navegador.py` | 71 | 71 |
| `python3 herramientas/pruebas_evidencia_navegador.py` | 131 | 131 |
| `python3 herramientas/pruebas_navegador.py` | 479 | 479 |
| `python3 herramientas/pruebas_experiencia_navegador.py` | 58 | 73 |

Las verificaciones estáticas suben porque la bibliografía y el aviso al pie de cada tema agregan enlaces internos, y se comprueba cada enlace y su ancla. Las 15 comprobaciones nuevas de navegador cubren la bibliografía, con el resumen y el detalle de cada referencia, su filtro, el teclado, los enlaces a una referencia y la lectura sin JavaScript, y los títulos de los temas antes y después de llegar la fuente web.

`pruebas_experiencia_navegador.py` pasa también con tres conjuntos de fuentes del sistema, montados con fontconfig: solo DejaVu Sans, Roboto estática con DejaVu Sans y Roboto variable con DejaVu Sans.

CLS con las fuentes 1,2 s tarde en las 16 páginas, en teléfono y en escritorio, 32 mediciones por fila:

| Fuentes del sistema | Base, máximo | Base, sobre 0,02 | Revisión, máximo | Revisión, sobre 0,02 |
|---|---:|---:|---:|---:|
| Arial o equivalente | 0,0256 | 1 | 0,0011 | 0 |
| Solo Roboto | 0,1858 | 18 | 0,0010 | 0 |
| Roboto variable | 0,1858 | 19 | 0,0010 | 0 |
| Solo DejaVu Sans | 0,2602 | 20 | 0,0012 | 0 |

Lighthouse en teléfono, con el servidor local que comprime como GitHub Pages y dos corridas por página, da lo mismo que la base dentro de la variación entre corridas: la portada marca 94 a 96 en la base y 96 en la revisión, y `recursos.html`, 89 a 97 en la base y 97 a 98 en la revisión. Buenas prácticas queda en 96 en `recursos.html` en ambas, porque el entorno de prueba no puede descargar las miniaturas de YouTube. La bibliografía con el detalle de cada referencia suma 17 KB comprimidos a `recursos.html`. El índice del buscador, que se descarga al abrir la búsqueda, pasa de 472 a 551 entradas y de 454 a 516 KB sin comprimir, 141 KB comprimido.

axe-core revisó las 16 páginas en escritorio claro, escritorio oscuro y teléfono, con las reglas de WCAG 2.0, 2.1 y 2.2 en sus niveles A y AA y todos los plegables abiertos, incluidas las 72 referencias. No encontró infracciones. Esto no reemplaza pruebas con lectores de pantalla.

## Pendientes

- El registro completo de la ejecución fallida de GitHub Actions pide iniciar sesión, así que la causa se dedujo de la línea en que terminó y se reprodujo en local. La próxima ejecución mostrará, si algo falla, el nombre de la comprobación en el resumen.
- El comportamiento de las fuentes en Android se reprodujo con Roboto en Chromium para Linux. Falta medirlo en un teléfono real.
- Tres fuentes no se pudieron abrir durante la revisión: el modelo en Thingiverse, el preprint en ResearchGate y el video en YouTube. Su detalle describe lo que dice de ellas la tesis.

## Cómo aplicar el parche

```bash
git checkout -b revision/fallas-referencias ae42f525771c23e8581ddda6d968489a9fba44c4
git am revision-fallas-referencias.patch
python3 herramientas/verificar_sitio.py
python3 herramientas/pruebas_experiencia_navegador.py
```

Revisa el resultado con `python3 -m http.server 8000` antes de incorporarlo a `main`. GitHub Pages publica la rama `main` sin compilación, como antes.
