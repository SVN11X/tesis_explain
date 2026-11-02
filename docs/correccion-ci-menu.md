# Corrección de las pruebas del menú móvil · V1.3

El registro `logs_112104990237 (1).zip`, correspondiente al commit
`f70a2aba290a3df3975554399db35b00dcf195e7`, falla en
`herramientas/pruebas_laboratorio_navegador.py` con:

```text
AssertionError: Menú móvil aísla el contenido de fondo
```

## Causa

La prueba original del menú se trasladó a `problema.html` al reconstruir la
portada. Allí `#contenido` está dentro de `.cap-layout`. `js/sitio.js` aplica
`inert` al contenedor exterior, de modo que el artículo y sus enlaces quedan
aislados. Sin embargo, `HTMLElement.inert` refleja el atributo propio del elemento,
no el aislamiento aplicado por sus ancestros. Por eso consultar únicamente
`#contenido.inert` produce un falso fallo.

El [estándar HTML, subárboles inertes](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees)
define que el aislamiento alcanza a los descendientes. Estas páginas usan DOM
normal, sin Shadow DOM ni diálogos nativos que escapen de ese aislamiento.

## Cambios

- La comprobación usa `closest('[inert]')` para reconocer el elemento o su
  contenedor aislado. La comprobación inversa al cerrar también considera los
  ancestros, incluida la navegación a una sección en la suite de experiencia.
- Se comprueba un enlace visible del artículo antes de abrir, durante el menú
  y después de cerrarlo. Los enlaces de ancla de títulos ocultos en móvil no
  sirven como referencia de foco y se excluyen con `:visible`.
- Se conserva la comprobación del ciclo de Tab, Mayús+Tab y Escape, y se verifica
  `aria-expanded` junto con el regreso del foco al botón.
- Se prueban `problema.html` y `laboratorio.html` a 320, 390 y 768 px.

No se cambia `js/sitio.js`, la portada, los capítulos, las explicaciones, el
laboratorio 3D ni las salidas compiladas. No se omiten pruebas ni se permite que
el flujo continúe como exitoso ante una aserción fallida.

## Evidencia y límites

El registro adjunto confirma que pasaron la compilación, sus 10 pruebas y la
comparación de salidas, además de 325 comprobaciones de control, 261 de mapeo y
214 de movimiento en navegador. La suite del laboratorio llegó hasta el menú;
las suites posteriores no se ejecutaron en ese flujo.

La revisión dirigida en Chromium comprobó las seis combinaciones de página y
ancho mediante una página temporal de prueba: aislamiento heredado, rechazo del
foco del fondo, Tab en ambos sentidos, cierre con Escape y recuperación del foco.
También se comprobó que un enlace a una sección cierra el menú y deja su título
visible. La página temporal se retiró antes de la entrega.

La sintaxis de los dos archivos Python, las 10 pruebas del comprobador y las
2.925 comprobaciones estáticas pasaron. Los 12 archivos compilados coinciden
con Git. Los parches se verifican con `git am` en copias limpias y el ZIP se
compara con el árbol final.

La suite completa de Playwright no se ejecutó desde este entorno. No se afirma
que el flujo completo de GitHub Actions esté aprobado: debe terminar en la
siguiente ejecución, después de que el usuario aplique y suba el parche.

## Aplicación

Sobre la versión `f70a2ab`, con el repositorio sin cambios locales pendientes:

```powershell
git am "$env:USERPROFILE\Downloads\tesis_explain_corregir_pruebas_menu_cambios_git_am.patch"
if ($LASTEXITCODE -eq 0) { git push }
```

El parche acumulativo del rediseño parte de `fcb47bd`; no debe reaplicarse sobre
la versión que ya tiene el rediseño instalado. Las instrucciones completas están
en [experiencia-v1.md](experiencia-v1.md).
