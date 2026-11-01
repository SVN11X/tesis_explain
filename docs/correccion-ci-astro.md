# Corrección de la verificación de compilación entre entornos

## Fallo observado

El flujo «Verificar sitio» del commit `9728d788350a4061c349879aa50ef27b07c43b7d`, registrado en `logs_112063413767.zip`, llegó a compilar correctamente. Svelte/TypeScript no reportó errores ni advertencias y las siete pruebas del modelo LiDAR pasaron.

El paso se detuvo en `git diff --exit-code -- index.html laboratorios.html _astro datos/indice.js`. La comparación completa de las líneas del registro mostró diferencias únicamente en el atributo `uid` de los elementos `astro-island` de `index.html` y `laboratorios.html`.

En la versión fijada de Astro, `dist/runtime/server/render/component.js` calcula el identificador a partir de la exportación, la ruta fuente del componente, su HTML y sus propiedades. La ruta fuente difiere entre el checkout local y el runner de GitHub. `dist/runtime/server/hydration.js` identifica este atributo como metadato para HMR; las URLs de componentes y los atributos de hidratación se emiten por separado. No se trata de un error de las explicaciones o del modelo numérico.

## Solución

El flujo llama ahora a `herramientas/verificar_compilacion.py` después de construir las páginas y regenerar el índice. El comprobador lee la versión de los archivos registrada en `HEAD` y compara las salidas actuales.

Solo al comparar los dos HTML se normaliza el valor de `uid` cuando aparece como primer atributo en una etiqueta real `astro-island`, conforme al formato generado por Astro. Se usa un analizador HTML para evitar alterar coincidencias dentro de scripts, comentarios o texto escapado. Se conserva exactamente todo lo demás, incluidos espacios y saltos de línea. No se escriben ni se modifican archivos al verificar.

La comprobación sigue fallando ante cambios en:

- Texto, estructura, enlaces, atributos funcionales o propiedades de los componentes.
- Bytes de JavaScript, CSS o del índice de búsqueda.
- Recursos eliminados o recursos generados nuevos que aún no estén versionados.

La salida indica los archivos afectados, sin volcar líneas minificadas completas en el registro. No se añade `continue-on-error`, no se eliminan pruebas y no se descarta el directorio de recursos de la comparación.

## Validación realizada

- Diez pruebas automáticas del comprobador, con casos que deben aceptar y rechazar diferencias.
- Comparación de los pares de HTML reales extraídos del registro adjunto: idénticos salvo los UID permitidos.
- Compilación e índice regenerados desde una copia Git del mismo commit en otra ruta local: se reproduce la diferencia de UID y la nueva comprobación pasa sobre los 12 archivos de salida.
- Verificación de que los HTML y los recursos de la entrega no se modifican con esta corrección.
- Parche incremental preparado sobre `9728d788350a4061c349879aa50ef27b07c43b7d`, aplicado en una copia limpia y comparado con el árbol final.

El flujo adjunto se interrumpió antes de los pasos siguientes. Las pruebas de navegador siguen configuradas; su siguiente ejecución en GitHub es necesaria para confirmar el resultado del flujo completo. Este arreglo no certifica por sí solo el despliegue de GitHub Pages.

## Uso local

```bash
npm run build
python herramientas/indice.py
python herramientas/pruebas_compilacion.py
python herramientas/verificar_compilacion.py
```

Si aparece «Salida desactualizada», revisar el cambio y versionar sus salidas junto con sus fuentes. No cambiar el comprobador para ocultar una diferencia de contenido.
