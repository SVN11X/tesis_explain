# Explicaciones de SLAM a partir de ROSCon 2019

Base Git: `a92a333e1952ae0ea8ff763278254329162d8e6d` de `SVN11X/tesis_explain`.
Fecha de la revisión del sitio: 22 de octubre de 2026. Esta fecha no identifica
la versión del documento académico ni la fecha de las mediciones.

## Contenido

- Cuatro responsabilidades del SLAM por grafos: ajuste, grafo, selección de
  candidatos y optimización. Ejemplo de candidato cercano rechazado por su
  geometría, separado de una pose reciente y una fuera del radio.
- Incertidumbre, covarianza, residuos y costo ponderado. El peso del cierre se
  puede cambiar sin modificar las mediciones. El costo no es un error en cm ni
  se compara directamente entre escenarios que usan pesos diferentes.
- Cola síncrona frente a omisión asíncrona, con el mismo ritmo de adquisición.
  Modelo de eventos manual, con reinicio y tiempos ilustrativos.
- PGM/YAML frente a sesión serializada; mapeo, localización, continuación y
  lifelong mapping. La guía no acredita sesiones serializadas del prototipo.
- Parámetros de referencia para Foxy, sin atribuir valores predeterminados a
  la configuración original no publicada. Recorrido de la charla por minutos.
- Precisiones coherentes sobre AMCL, GMapping y el marco map. «Etapa final»
  sustituye a «Cierre» en las fotografías, pues no prueban un cierre de lazo.

Los modelos son sintéticos: el selector compara cinco pares ya alineados con
un RMS y un umbral ilustrativo. El modo asíncrono del ejemplo omite si está
ocupado. No reproducen el detector ni el planificador interno de SLAM Toolbox.
El grafo JavaScript tampoco ejecuta Ceres. No se añaden ensayos reales ni
resultados de CPU, latencia, cierres, localización o error absoluto del mapa.

## Archivos y verificaciones

`js/slam-proceso.js` incorpora los nuevos modelos y controles;
`js/mapeo.js` extiende el grafo. `herramientas/diagramas_mapeo.js` genera el
respaldo `img/diagramas/candidatos-cierre.svg` desde el mismo modelo.
Se regeneran metadatos e índice, y se amplían las pruebas de modelos y de
navegador del capítulo 05. Las pruebas previas seleccionan el desplegable de
deriva por su nombre, porque el grafo ahora tiene un segundo desplegable.

Se verifican casos límite, conservación de cada barrido en un solo estado,
causalidad temporal, rechazo de falsos candidatos, efecto del peso, controles
por teclado, reinicio, ausencia de desbordes y lectura sin JavaScript. Las
dependencias de desarrollo no se descargan al visitar el sitio.

Las tablas de `datos/ensayos/`, los parámetros experimentales, las imágenes
previas y los videos conservan sus bytes. El estado sigue en revisión por
comité y las fechas no confirmadas permanecen vacías.

Verificación ejecutada en esta entrega (Chromium 141, Playwright 1.56 para
desarrollo; el visitante no instala estas herramientas):

| Comprobación | Resultado |
| --- | ---: |
| Pruebas unitarias generales | 40 correctas |
| Modelos de control | 21 correctas |
| Modelos de mapeo existentes | 28 correctas |
| Movimiento | 23 correctas |
| Análisis del laboratorio | 57 correctas |
| Nuevos modelos de proceso SLAM | 10 correctas |
| Archivos, anclas, datos e índice | 1.489 comprobaciones correctas |
| Navegador: control | 320 correctas |
| Navegador: movimiento y A estrella | 214 correctas |
| Navegador: mapeo, incluidos los nuevos controles | 256 correctas |
| Navegador: laboratorio | 195 correctas |
| Navegador: robustez | 71 correctas |
| Navegador: sitio completo | 479 correctas |

Se inspeccionaron capturas de los dos widgets nuevos en escritorio y móvil,
y se comprobó su respaldo con JavaScript deshabilitado. Los ensayos de mapeo
también cubren 320 y 390 px, tema oscuro y movimiento reducido. Una comparación
SHA-256 confirma que 137 archivos previos de datos, parámetros, imágenes,
fuentes y licencias conservan sus bytes. Los ejemplos sintéticos del laboratorio
siguen al día. No quedan comprobaciones de esta lista pendientes.

## Aplicar el parche

En una copia Git con los cambios propios guardados, desde la carpeta del
repositorio y con la base anterior disponible, en PowerShell:

```powershell
git am "$env:USERPROFILE\Downloads\tesis-explain-mejoras-slam-20261022_cambios_git_am.patch"
```

El parche contiene un commit local y se valida con `git am` en una copia
limpia de la base, comparando el árbol resultante. El ZIP es una instantánea
de los archivos versionados resultantes, sin `.git` ni dependencias locales.
No hace falta aplicar ambos. No se ha escrito en el repositorio remoto.

Si una copia con otros cambios produce conflictos, `git am --abort` cancela
esa aplicación y recupera el estado anterior a iniciarla.

## Fuentes

- Macenski, S. (2019), *On Use of SLAM Toolbox*, ROSCon, y el material de
  contexto facilitado por el usuario (transcripción y capturas).
- SLAM Toolbox, README y configuración en `foxy-devel`, consultados el
  22 de octubre de 2026. La rama no acredita la revisión instalada en el robot.
- REP 105 y tutorial de SLAM por grafos de Grisetti y otros, ya citados por
  la guía. Sus enlaces se mantienen y se añaden los específicos de Foxy.
