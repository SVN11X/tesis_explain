/*
  Lectura de las páginas de la guía: índice lateral, secciones en el menú del teléfono, barra de progreso,
  citas con vista previa, términos con definición, comparadores, videos en bucle, video liviano,
  ampliación de imágenes, secuencia de etapas y carga diferida de los interactivos. La cabecera, el pie,
  el menú y el buscador son el marco común: scripts/plantillas/ y js/marco.js.

  Para agregar o renombrar un tema basta con editar la lista CAPS.
  El PDF autorizado y los metadatos se editan en datos/academico.json; regenera con scripts/datos.py.
*/
(function () {
  "use strict";

  /* Si datos/proyecto.js no llega (bloqueado, caché corrupta o archivo ausente), los respaldos deben
     seguir funcionando. El aviso estático del HTML conserva el estado. */
  var ACADEMICO = (window.PROYECTO && window.PROYECTO.academico) || {
    estado_texto: "En proceso de defensa", tesis_pdf: null, version_documento: null, ultima_actualizacion_sitio: null, sinDatos: true
  };
  /* Sin un enlace verificado en tesis_pdf, el pie no ofrece el PDF y Recursos dice que la tesis no está publicada. */
  var TESIS_PDF = ACADEMICO.tesis_pdf || "";
  var REPO = "https://github.com/SVN11X/tesis_explain";
  var VIDEO_ID = "iTTC10eGDmc";

  var BLOQUES = { 1: "El contexto", 2: "Cómo funciona", 3: "Evidencia y práctica" };
  var CAPS = [
    { id: "problema", t: "Autonomía en interiores", d: "Qué significa que un robot sea autónomo, qué existía y qué decisiones se tomaron.", nivel: "básico", bloque: 1 },
    { id: "robot", t: "Anatomía del robot", d: "Piezas, energía, red, ROS 2 y el camino de una orden hasta el motor.", nivel: "básico", bloque: 1 },
    { id: "movimiento", t: "Moverse y medir el avance", d: "Tracción diferencial, encoders y odometría, con sus errores medidos.", nivel: "intermedio", bloque: 2 },
    { id: "control", t: "Control de velocidad de las ruedas", d: "PID en tiempo discreto, la ley heredada que opera como PI, la sintonía con PSO y su estabilidad.", nivel: "avanzado", bloque: 2 },
    { id: "mapeo", t: "Ver y mapear con LiDAR y SLAM", d: "Cómo mide el láser, cómo se arma el mapa, cómo se corrige la deriva y qué tan cerca queda del plano.", nivel: "intermedio", bloque: 2 },
    { id: "navegacion", t: "Planificar y seguir rutas con Nav2", d: "Mapas de costos, A estrella, ventana dinámica y recuperaciones.", nivel: "intermedio", bloque: 2 },
    { id: "exploracion", t: "Explorar por fronteras", d: "Cómo decide el robot a dónde ir y cómo leer las metas abortadas.", nivel: "intermedio", bloque: 2 },
    { id: "gemelo", t: "El gemelo digital", d: "Qué se comprueba en simulación y qué solo en el robot real.", nivel: "básico", bloque: 2 },
    { id: "resultados", t: "La evidencia: qué se demostró", d: "Verificar frente a validar, los cuatro objetivos, cuánto dicen las repeticiones, límites y trabajo futuro.", nivel: "básico", bloque: 3 },
    { id: "replicar", t: "Constrúyelo tú", d: "Materiales, versiones, repositorios base y lecciones de taller.", nivel: "intermedio", bloque: 3 }
  ];
  var EXTRAS = [
    { id: "mundo-real", t: "En el mundo real", d: "Dónde se usan estas mismas ideas, de una aspiradora a una mina chilena y a Marte." },
    { id: "lecciones", t: "Lecciones de ingeniería", d: "Temas que la tesis deja implícitos: unidades, seguridad, privacidad, reproducibilidad." },
    { id: "preguntas", t: "Preguntas difíciles", d: "Las preguntas de quien leyó la tesis con lupa, con su respuesta y su respaldo." },
    { id: "laboratorio", t: "Laboratorio de análisis", d: "Calcula métricas de tablas CSV localmente y consulta las reglas que las interpretan." },
    { id: "recursos", t: "Recursos", d: "Glosario, fuentes agregadas, material para aprender y cómo citar." },
    { id: "bibliografia", t: "Bibliografía de la tesis", d: "Las 72 referencias, cada una con su ficha, de qué trata y qué toma la tesis de ella." }
  ];
  /* Secuencia de lectura: los diez temas y, a continuación, los complementos, numerados del 11 al 16.
     Recursos y la bibliografía van al final, con su índice lateral y su navegación. */
  var SECUENCIA = CAPS.concat(EXTRAS);
  /* Un ícono de Phosphor Icons (MIT) por parte de la guía, el mismo que en la portada. Ver docs/decisions/0008. */
  var ICONO_TEMA = {
    "problema": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z",
    "robot": "M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16Zm-52-56H92a28,28,0,0,0,0,56h72a28,28,0,0,0,0-56Zm-24,16v24H116V152ZM80,164a12,12,0,0,1,12-12h8v24H92A12,12,0,0,1,80,164Zm84,12h-8V152h8a12,12,0,0,1,0,24ZM72,108a12,12,0,1,1,12,12A12,12,0,0,1,72,108Zm88,0a12,12,0,1,1,12,12A12,12,0,0,1,160,108Z",
    "movimiento": "M200,168a32.06,32.06,0,0,0-31,24H72a32,32,0,0,1,0-64h96a40,40,0,0,0,0-80H72a8,8,0,0,0,0,16h96a24,24,0,0,1,0,48H72a48,48,0,0,0,0,96h97a32,32,0,1,0,31-40Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,200,216Z",
    "control": "M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z",
    "mapeo": "M228.92,49.69a8,8,0,0,0-6.86-1.45L160.93,63.52,99.58,32.84a8,8,0,0,0-5.52-.6l-64,16A8,8,0,0,0,24,56V200a8,8,0,0,0,9.94,7.76l61.13-15.28,61.35,30.68A8.15,8.15,0,0,0,160,224a8,8,0,0,0,1.94-.24l64-16A8,8,0,0,0,232,200V56A8,8,0,0,0,228.92,49.69ZM104,52.94l48,24V203.06l-48-24ZM40,62.25l48-12v127.5l-48,12Zm176,131.5-48,12V78.25l48-12Z",
    "navegacion": "M237.33,106.21,61.41,41l-.16-.05A16,16,0,0,0,40.9,61.25a1,1,0,0,0,.05.16l65.26,175.92A15.77,15.77,0,0,0,121.28,248h.3a15.77,15.77,0,0,0,15-11.29l.06-.2,21.84-78,78-21.84.2-.06a16,16,0,0,0,.62-30.38ZM149.84,144.3a8,8,0,0,0-5.54,5.54L121.3,232l-.06-.17L56,56l175.82,65.22.16.06Z",
    "exploracion": "M237.2,151.87v0a47.1,47.1,0,0,0-2.35-5.45L193.26,51.8a7.82,7.82,0,0,0-1.66-2.44,32,32,0,0,0-45.26,0A8,8,0,0,0,144,55V80H112V55a8,8,0,0,0-2.34-5.66,32,32,0,0,0-45.26,0,7.82,7.82,0,0,0-1.66,2.44L21.15,146.4a47.1,47.1,0,0,0-2.35,5.45v0A48,48,0,1,0,112,168V96h32v72a48,48,0,1,0,93.2-16.13ZM76.71,59.75a16,16,0,0,1,19.29-1v73.51a47.9,47.9,0,0,0-46.79-9.92ZM64,200a32,32,0,1,1,32-32A32,32,0,0,1,64,200ZM160,58.74a16,16,0,0,1,19.29,1l27.5,62.58A47.9,47.9,0,0,0,160,132.25ZM192,200a32,32,0,1,1,32-32A32,32,0,0,1,192,200Z",
    "gemelo": "M223.68,66.15,135.68,18h0a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32h0l80.34,44L128,120,47.66,76ZM40,90l80,43.78v85.79L40,175.82Zm96,129.57V133.82L216,90v85.78Z",
    "resultados": "M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z",
    "replicar": "M226.76,69a8,8,0,0,0-12.84-2.88l-40.3,37.19-17.23-3.7-3.7-17.23,37.19-40.3A8,8,0,0,0,187,29.24,72,72,0,0,0,88,96,72.34,72.34,0,0,0,94,124.94L33.79,177c-.15.12-.29.26-.43.39a32,32,0,0,0,45.26,45.26c.13-.13.27-.28.39-.42L131.06,162A72,72,0,0,0,232,96,71.56,71.56,0,0,0,226.76,69ZM160,152a56.14,56.14,0,0,1-27.07-7,8,8,0,0,0-9.92,1.77L67.11,211.51a16,16,0,0,1-22.62-22.62L109.18,133a8,8,0,0,0,1.77-9.93,56,56,0,0,1,58.36-82.31l-31.2,33.81a8,8,0,0,0-1.94,7.1L141.83,108a8,8,0,0,0,6.14,6.14l26.35,5.66a8,8,0,0,0,7.1-1.94l33.81-31.2A56.06,56.06,0,0,1,160,152Z",
    "mundo-real": "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z",
    "lecciones": "M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z",
    "preguntas": "M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z",
    "laboratorio": "M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z",
    "recursos": "M231.65,194.55,198.46,36.75a16,16,0,0,0-19-12.39L132.65,34.42a16.08,16.08,0,0,0-12.3,19l33.19,157.8A16,16,0,0,0,169.16,224a16.25,16.25,0,0,0,3.38-.36l46.81-10.06A16.09,16.09,0,0,0,231.65,194.55ZM136,50.15c0-.06,0-.09,0-.09l46.8-10,3.33,15.87L139.33,66Zm6.62,31.47,46.82-10.05,3.34,15.9L146,97.53Zm6.64,31.57,46.82-10.06,13.3,63.24-46.82,10.06ZM216,197.94l-46.8,10-3.33-15.87L212.67,182,216,197.85C216,197.91,216,197.94,216,197.94ZM104,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,104,32ZM56,48h48V64H56Zm0,32h48v96H56Zm48,128H56V192h48v16Z",
    "bibliografia": "M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64ZM160,88h40a8,8,0,0,1,0,16H160a8,8,0,0,1,0-16Zm48,40a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,128Zm0,32a8,8,0,0,1-8,8H160a8,8,0,0,1,0-16h40A8,8,0,0,1,208,160Z"
  };
  /* js/marco.js puede haber creado SITIO antes, con el buscador y el menú */
  var SITIO = window.SITIO = window.SITIO || {};
  SITIO.CAPS = CAPS; SITIO.EXTRAS = EXTRAS; SITIO.REPO = REPO; SITIO.VIDEO_ID = VIDEO_ID; SITIO.TESIS_PDF = TESIS_PDF;

  var pagina = document.body.getAttribute("data-pagina") || "";
  var idxSec = SECUENCIA.map(function (c) { return c.id; }).indexOf(pagina);
  var esCap = CAPS.some(function (c) { return c.id === pagina; });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function n2(i) { return (i < 9 ? "0" : "") + (i + 1); }
  var esperaSecciones = null;
  function cargarSecciones(cb) {
    if (window.SECCIONES) { cb(); return; }
    if (esperaSecciones) { esperaSecciones.push(cb); return; }
    esperaSecciones = [cb];
    var sc = document.createElement("script"), fin = function () { var l = esperaSecciones; esperaSecciones = null; l.forEach(function (f) { f(); }); };
    sc.src = "datos/secciones.js"; sc.onload = fin; sc.onerror = function () { sc.remove(); fin(); };
    document.head.appendChild(sc);
  }
  /* lectura en vivo desde js/comun.js, que cada página carga antes que este archivo */
  var quieto = function () { return window.U.quieto(); };

  /* Íconos de Phosphor Icons (MIT, ver LICENSE-iconos.txt), en línea para no pedir archivos. */
  var SVG = {
    cerrar: '<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>',
    lupa: '<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/></svg>',
    arriba: '<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z"/></svg>',
    abajo: '<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>',
    ampliar: '<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M216,48V96a8,8,0,0,1-16,0V67.31l-42.34,42.35a8,8,0,0,1-11.32-11.32L188.69,56H160a8,8,0,0,1,0-16h48A8,8,0,0,1,216,48ZM98.34,146.34,56,188.69V160a8,8,0,0,0-16,0v48a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16H67.31l42.35-42.34a8,8,0,0,0-11.32-11.32ZM208,152a8,8,0,0,0-8,8v28.69l-42.34-42.35a8,8,0,0,0-11.32,11.32L188.69,200H160a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V160A8,8,0,0,0,208,152ZM67.31,56H96a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z"/></svg>',
  };

  /* Tema o complemento: índice lateral, etiquetas y navegación */
  function capitulo() {
    if (idxSec < 0) return;
    var c = SECUENCIA[idxSec];
    var art = document.querySelector(".articulo");
    if (art) {
      var palabras = (art.textContent || "").trim().split(/\s+/).length;
      var min = Math.max(3, Math.round(palabras / 200));
      document.querySelectorAll("[data-lectura]").forEach(function (el) { el.textContent = min + " min de lectura"; });
    }
    document.querySelectorAll("[data-cap-n]").forEach(function (el) { el.textContent = "Parte " + (idxSec + 1) + " de " + SECUENCIA.length; });
    document.querySelectorAll("[data-bloque]").forEach(function (el) { el.textContent = esCap ? "Tema " + n2(idxSec) + " · " + BLOQUES[c.bloque] : n2(idxSec) + " · Complemento de la guía"; });
    document.querySelectorAll("[data-nivel]").forEach(function (el) {
      if (!c.nivel) { el.remove(); return; }
      var cls = c.nivel === "básico" ? "basico" : (c.nivel === "avanzado" ? "avanzado" : "intermedio");
      el.className = "etiqueta " + cls; el.textContent = "Nivel " + c.nivel;
    });
    if (art) art.querySelectorAll("h2[id], h3[id]").forEach(function (h) {
      if (h.querySelector(".ancla")) return;
      var a = document.createElement("a"); a.className = "ancla"; a.href = "#" + h.id; a.setAttribute("aria-label", "Enlace a esta sección"); a.textContent = "#";
      h.insertBefore(a, h.firstChild);
    });
    var lat = document.getElementById("lateral");
    if (lat && art) {
      var hs = Array.prototype.slice.call(art.querySelectorAll("section > h2[id]"));
      var sinAncla = function (h) { var t = h.cloneNode(true); var an = t.querySelector(".ancla"); if (an) an.remove(); return t.textContent.trim(); };
      /* Las 16 partes van numeradas y cada una despliega sus secciones. La actual las trae abiertas, y las demás
         las piden a datos/secciones.js solo cuando alguien las despliega. */
      lat.innerHTML = '<details class="guia-cont" open><summary><h2>La guía <span class="gl-pos">' + n2(idxSec) + ' de ' + SECUENCIA.length + '</span>' + SVG.abajo + '</h2></summary>' +
        '<nav class="guia-lista" aria-label="Partes de la guía"><ol>' + SECUENCIA.map(function (x, i) {
          var actual = x.id === pagina, abierta = actual && hs.length > 0;
          return '<li class="gl-item' + (actual ? ' actual' : '') + (abierta ? ' abierto' : '') + '" data-pag="' + x.id + '"><div class="gl-fila">' +
            '<a href="' + x.id + '.html"' + (actual ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span><svg class="ph gl-ico" viewBox="0 0 256 256" aria-hidden="true"><path d="' + ICONO_TEMA[x.id] + '"/></svg><span>' + esc(x.t) + '</span></a>' +
            '<button type="button" class="gl-plegar" aria-expanded="' + abierta + '" aria-controls="gl-' + x.id + '" aria-label="Secciones de ' + esc(x.t) + '">' + SVG.abajo + '</button></div>' +
            '<div class="gl-secciones" id="gl-' + x.id + '">' + (actual ? '<ul class="en-pagina">' + hs.map(function (h) {
              return '<li><a href="#' + h.id + '" data-id="' + h.id + '">' + esc(sinAncla(h)) + '</a></li>';
            }).join("") + '</ul>' : '') + '</div></li>';
        }).join("") + '</ol></nav></details>';
      var cont = lat.querySelector(".guia-cont"), angosto = window.matchMedia("(max-width: 1080px)");
      if (angosto.matches) cont.open = false;
      var seccionesDe = function (li) {
        var caja = li.querySelector(".gl-secciones"), id = li.getAttribute("data-pag"), lista = (window.SECCIONES || {})[id];
        if (caja.firstChild) return;
        caja.innerHTML = lista ? '<ul>' + lista.map(function (s) { return '<li><a href="' + id + '.html#' + esc(s[0]) + '">' + esc(s[1]) + '</a></li>'; }).join("") + '</ul>'
          : '<p class="gl-error">No se pudieron cargar sus secciones. <a href="' + id + '.html">Abrir la página</a></p>';
      };
      lat.addEventListener("click", function (e) {
        var b = e.target.closest(".gl-plegar");
        if (!b) return;
        var li = b.closest(".gl-item"), abrir = !li.classList.contains("abierto");
        var cambiar = function () { li.classList.toggle("abierto", abrir); b.setAttribute("aria-expanded", String(abrir)); };
        if (!abrir || li.querySelector(".gl-secciones").firstChild) { cambiar(); return; }
        cargarSecciones(function () { seccionesDe(li); cambiar(); });
      });
      /* Con el lateral fijo, la parte actual queda a la vista aunque esté al final de la lista. */
      if (!angosto.matches) {
        var fila = lat.querySelector(".gl-item.actual");
        if (fila && fila.offsetTop > lat.clientHeight / 2) lat.scrollTop = fila.offsetTop - 60;
      }
      /* En el teléfono, el menú de la cabecera suma las secciones de esta página y la guía numerada. Así se
         salta a cualquier parte desde donde se esté leyendo, sin volver al inicio del tema. */
      var mp = SITIO.menu && SITIO.menu.panel;
      if (mp && !mp.querySelector(".menu-extra")) {
        var extra = document.createElement("div");
        extra.className = "menu-extra";
        extra.innerHTML = (hs.length ? '<p class="menu-grupo" id="menu-secciones-t">En esta página</p><nav class="menu-secciones" aria-labelledby="menu-secciones-t">' +
          hs.map(function (h) { return '<a href="#' + h.id + '" data-id="' + h.id + '">' + esc(sinAncla(h)) + '</a>'; }).join("") + '</nav>' : '') +
          '<p class="menu-grupo" id="menu-guia-t">La guía</p><nav class="menu-guia" aria-labelledby="menu-guia-t">' + SECUENCIA.map(function (x, i) {
            return '<a href="' + x.id + '.html" data-pag="' + x.id + '"' + (x.id === pagina ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span>' + esc(x.t) + '</a>';
          }).join("") + '</nav><p class="menu-grupo">El sitio</p>';
        mp.insertBefore(extra, mp.firstChild);
      }
      if ("IntersectionObserver" in window && hs.length) {
        var links = {};
        document.querySelectorAll(".en-pagina a, .menu-secciones a").forEach(function (a) { var k = a.getAttribute("data-id"); (links[k] = links[k] || []).push(a); });
        var visibles = new Map(), previo = null;
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (e) { visibles.set(e.target, e.isIntersecting); });
          for (var i = 0; i < hs.length; i++) {
            if (visibles.get(hs[i].parentElement)) {
              var activo = hs[i].id;
              hs.forEach(function (h) { (links[h.id] || []).forEach(function (l) { l.classList.toggle("activo", h.id === activo); if (h.id === activo) l.setAttribute("aria-current", "location"); else l.removeAttribute("aria-current"); }); });
              /* el enlace activo no se pierde bajo el borde del lateral fijo */
              var l = (links[activo] || [])[0];
              if (l && activo !== previo && lat.scrollHeight > lat.clientHeight + 4) {
                var rl = lat.getBoundingClientRect(), r = l.getBoundingClientRect();
                if (r.top < rl.top + 24 || r.bottom > rl.bottom - 24) lat.scrollTop += r.top - rl.top - rl.height / 3;
              }
              previo = activo;
              break;
            }
          }
        }, { rootMargin: "-15% 0px -65% 0px" });
        hs.forEach(function (h) { io.observe(h.parentElement); });
      }
    }
    var nc = document.getElementById("nav-cap");
    if (nc) {
      var ant = SECUENCIA[idxSec - 1], sig = SECUENCIA[idxSec + 1];
      nc.className = "nav-cap";
      nc.innerHTML = (ant ? '<a class="ant" href="' + ant.id + '.html"><span>← Anterior</span><b>' + esc(ant.t) + '</b></a>' : '<a class="ant" href="index.html"><span>← Volver</span><b>Inicio</b></a>') +
        (sig ? '<a class="sig" href="' + sig.id + '.html"><span>Siguiente →</span><b>' + esc(sig.t) + '</b></a>' : '<a class="sig" href="index.html"><span>Para terminar →</span><b>Volver al inicio</b></a>');
    }
    var ay = document.getElementById("ayuda-pie");
    if (ay) ay.innerHTML = '¿Encontraste un error o algo no se entiende? <a href="' + REPO + '/issues/new?title=' + encodeURIComponent(c.t) + '">Escríbelo en GitHub</a>. Toda contribución mejora la guía para quien venga después.';
  }

  /* Barra de progreso de lectura */
  function progreso() {
    var art = document.querySelector(".articulo");
    if (!art) return;
    var barra = document.createElement("div"); barra.className = "progreso-lectura"; barra.setAttribute("aria-hidden", "true");
    document.body.appendChild(barra);
    var pend = false;
    function act() {
      pend = false;
      var r = art.getBoundingClientRect(), h = art.offsetHeight - window.innerHeight * .6;
      var k = Math.min(1, Math.max(0, -r.top / Math.max(1, h)));
      barra.style.transform = "scaleX(" + k.toFixed(4) + ")";
    }
    window.addEventListener("scroll", function () { if (!pend) { pend = true; requestAnimationFrame(act); } }, { passive: true });
    act();
  }

  /* Botón para volver arriba */
  function arriba() {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn-arriba"; b.setAttribute("aria-label", "Volver al inicio de la página"); b.innerHTML = SVG.arriba;
    document.body.appendChild(b);
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: quieto() ? "auto" : "smooth" }); var s = document.querySelector(".skip-link"); if (s) s.focus({ preventScroll: true }); });
    /* con el pie a la vista el botón se retira: el pie ya tiene su enlace para volver arriba */
    var pend = false, pie = document.querySelector(".site-footer");
    window.addEventListener("scroll", function () {
      if (pend) return; pend = true;
      requestAnimationFrame(function () {
        pend = false;
        var enPie = pie && pie.getBoundingClientRect().top < window.innerHeight - 40;
        b.classList.toggle("visible", window.scrollY > window.innerHeight * 1.4 && !enPie);
      });
    }, { passive: true });
  }

  /* Video liviano de YouTube y Vimeo */
  function videos() {
    document.querySelectorAll(".video[data-yt], .video[data-vimeo]").forEach(function (v) {
      var yt = v.getAttribute("data-yt"), vm = v.getAttribute("data-vimeo");
      var tit = v.getAttribute("data-titulo") || "Ver video", sub = v.getAttribute("data-sub") || "";
      var desde = v.getAttribute("data-desde");
      var portada = v.getAttribute("data-portada");
      var img = portada ? '<picture><source srcset="' + esc(portada) + '.webp" type="image/webp"><img src="' + esc(portada) + '.jpg" alt="" loading="lazy" decoding="async" width="1280" height="720"></picture>'
        : (yt ? '<img src="https://i.ytimg.com/vi/' + esc(yt) + '/maxresdefault.jpg" alt="" loading="lazy" decoding="async">' : '');
      v.innerHTML = '<button type="button" class="yt" aria-label="Reproducir video: ' + esc(tit + (sub ? ' ' + sub : '')) + '">' + img + '<span class="yt-play" aria-hidden="true"></span><span class="yt-tit">' + esc(tit) + (sub ? ' <small>' + esc(sub) + '</small>' : '') + '</span></button>';
      var mini = !portada && yt && v.querySelector("img");
      if (mini) {
        /* maxres falta en muchos videos y YouTube devuelve entonces una imagen de 120x90: se baja a sddefault y luego a hqdefault. */
        var tams = ["sddefault", "hqdefault"];
        var ajustar = function () {
          if (mini.naturalWidth <= 120 && tams.length) { mini.src = "https://i.ytimg.com/vi/" + yt + "/" + tams.shift() + ".jpg"; return; }
          if (mini.naturalWidth > 120 && mini.naturalWidth < v.clientWidth) v.style.maxWidth = mini.naturalWidth + "px";
        };
        mini.addEventListener("load", ajustar);
        mini.addEventListener("error", function () { if (tams.length) mini.src = "https://i.ytimg.com/vi/" + yt + "/" + tams.shift() + ".jpg"; else mini.remove(); });
      }
      v.querySelector("button").addEventListener("click", function () {
        var f = document.createElement("iframe");
        f.src = yt ? "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(yt) + "?autoplay=1&rel=0" + (desde ? "&start=" + parseInt(desde, 10) : "")
          : "https://player.vimeo.com/video/" + encodeURIComponent(vm) + "?autoplay=1";
        f.title = tit; f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"; f.allowFullscreen = true;
        f.referrerPolicy = "strict-origin-when-cross-origin";
        v.innerHTML = ""; v.appendChild(f); f.focus();
      });
    });
  }

  /* Videos en bucle, con pausa y respeto por el movimiento reducido */
  function bucles() {
    /* Un bloque preparado lleva data-src y data-poster mientras espera su video. Al quitarle hidden
       se usan como src y poster, y así no se piden archivos que todavía no existen. */
    document.querySelectorAll(".bucle video source[data-src]").forEach(function (v) {
      if (v.closest("[hidden]")) return;
      v.setAttribute("src", v.getAttribute("data-src")); v.parentElement.load();
    });
    /* La portada de un video lejos del inicio también espera: data-poster pasa a poster al acercarse. */
    function ponerPortada(vid) { if (vid.hasAttribute("data-poster") && !vid.hasAttribute("poster")) vid.setAttribute("poster", vid.getAttribute("data-poster")); }
    /* El HTML trae portada, controles del navegador y preload="none": sin JavaScript se puede reproducir
       a mano y nadie descarga un video que no va a ver. Aquí los controles nativos se cambian por un
       botón propio, el archivo se pide al acercarse a la pantalla y la animación corre solo mientras se ve.
       La observación parte un momento después del evento load, cuando el navegador está libre, para no
       competir con la primera pintura: mientras tanto se ve la portada del video. */
    function trasCarga(fn) {
      function luego() { setTimeout(function () { if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 1500 }); else fn(); }, 1200); }
      if (document.readyState === "complete") luego(); else window.addEventListener("load", luego, { once: true });
    }
    document.querySelectorAll(".bucle video").forEach(function (vid) {
      if (vid.closest("[hidden]")) return;
      var caja = vid.parentElement;
      vid.removeAttribute("controls");
      var b = document.createElement("button"); b.type = "button"; b.className = "b-ctl";
      function marcar() { var p = vid.paused; b.textContent = p ? "▶ Reproducir" : "❚❚ Pausar"; b.setAttribute("aria-label", p ? "Reproducir animación" : "Pausar animación"); }
      function reproducir() { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
      b.addEventListener("click", function () { if (vid.paused) reproducir(); else vid.pause(); });
      vid.addEventListener("play", marcar); vid.addEventListener("pause", marcar);
      caja.appendChild(b);
      vid.muted = true; vid.setAttribute("playsinline", ""); vid.loop = true;
      if (quieto() || !("IntersectionObserver" in window)) ponerPortada(vid);
      if (quieto()) { vid.removeAttribute("autoplay"); vid.pause(); marcar(); return; }
      if ("IntersectionObserver" in window) {
        var cerca = new IntersectionObserver(function (ents) {
          if (ents.some(function (e) { return e.isIntersecting; })) { ponerPortada(vid); vid.preload = "auto"; cerca.disconnect(); }
        }, { rootMargin: "600px 0px" });
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (e) {
            if (e.isIntersecting) { if (!vid.dataset.pausadoUsuario) reproducir(); }
            else if (!vid.paused) vid.pause();
          });
        }, { threshold: .25 });
        trasCarga(function () { cerca.observe(vid); io.observe(vid); });
        b.addEventListener("click", function () { if (vid.paused) vid.dataset.pausadoUsuario = "1"; else delete vid.dataset.pausadoUsuario; });
      } else trasCarga(reproducir);
      marcar();
    });
  }

  /* Ampliar imágenes. Cada figura lleva un botón visible, también en pantallas táctiles,
     que abre el diálogo. La imagen sigue respondiendo al clic del ratón. */
  var dlgAmpliar = null, origenAmpliar = null;
  function dialogoAmpliar() {
    if (dlgAmpliar) return dlgAmpliar;
    var dlg = dlgAmpliar = document.createElement("dialog"); dlg.className = "lightbox";
    dlg.innerHTML = '<button type="button" aria-label="Cerrar">' + SVG.cerrar + '</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    dlg.querySelector("button").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (origenAmpliar) origenAmpliar.focus(); origenAmpliar = null; });
    return dlg;
  }
  /* también la usan los interactivos que dibujan una figura después de cargar la página */
  function hacerAmpliable(img) {
    var fig = img.closest("figure");
    if (typeof HTMLDialogElement === "undefined" || img.closest(".deslizar") || !fig || fig.querySelector(".b-ampliar")) return;
    var dlg = dialogoAmpliar();
    var b = document.createElement("button");
    b.type = "button"; b.className = "b-ampliar"; b.setAttribute("aria-label", "Ampliar imagen");
    b.innerHTML = SVG.ampliar + '<span aria-hidden="true">Ampliar</span>';
    function abrir() {
      var im = dlg.querySelector("img"); im.src = img.getAttribute("data-grande") || img.currentSrc || img.src; im.alt = img.alt;
      var cap = fig.querySelector("figcaption");
      dlg.querySelector("p").textContent = cap ? cap.textContent.trim() : "";
      origenAmpliar = b;
      dlg.showModal();
    }
    b.addEventListener("click", abrir);
    img.addEventListener("click", abrir);
    fig.classList.add("ampliable");
    fig.appendChild(b);
  }
  window.SITIO.ampliable = hacerAmpliable;
  function ampliar() {
    document.querySelectorAll("figure.foto:not(.sin-zoom) img, figure.fig:not(.sin-zoom) img, figure.tema-hero-fig img").forEach(hacerAmpliable);
  }

  /* Comparador antes y después */
  function comparadores() {
    document.querySelectorAll(".deslizar").forEach(function (c) {
      var r = c.querySelector("input[type=range]");
      if (!r) return;
      function act() { c.style.setProperty("--pos", r.value + "%"); }
      r.addEventListener("input", act); act();
    });
  }

  /* Burbuja compartida para citas y términos
     Estado único: qué elemento la muestra y si quedó fijada con clic, toque, Enter o Espacio.
     El foco y el paso del ratón la muestran sin fijarla. El primer clic o toque la fija, aunque
     el foco ya la hubiera mostrado, y el siguiente la cierra. Escape, un clic fuera o salir con
     el foco la cierran. No atrapa el foco: la burbuja no contiene elementos enfocables. */
  var burbuja = null, dueno = null, fijada = false;
  function crearBurbuja() {
    if (burbuja) return;
    burbuja = document.createElement("div"); burbuja.className = "burbuja"; burbuja.id = "burbuja"; burbuja.setAttribute("role", "tooltip");
    document.body.appendChild(burbuja);
  }
  function mostrar(el, html, fijar) {
    crearBurbuja();
    if (dueno && dueno !== el) soltar(dueno);
    burbuja.innerHTML = html;
    var r = el.getBoundingClientRect();
    burbuja.style.left = "0px"; burbuja.style.top = "0px"; burbuja.classList.add("visible");
    var w = burbuja.offsetWidth, h = burbuja.offsetHeight;
    var x = Math.min(Math.max(12, r.left + window.scrollX + r.width / 2 - w / 2), window.scrollX + document.documentElement.clientWidth - w - 12);
    var y = r.top + window.scrollY - h - 10;
    if (r.top - h - 10 < 70) y = r.bottom + window.scrollY + 10;
    burbuja.style.left = x + "px"; burbuja.style.top = y + "px";
    el.setAttribute("aria-describedby", "burbuja");
    if (el.classList.contains("term")) el.setAttribute("aria-expanded", "true");
    dueno = el; fijada = !!fijar;
  }
  function soltar(el) {
    if (!el) return;
    el.removeAttribute("aria-describedby");
    if (el.classList.contains("term")) el.setAttribute("aria-expanded", "false");
  }
  function ocultar(el) {
    if (el && dueno && el !== dueno) return;      /* otro elemento ya tomó la burbuja */
    if (burbuja) burbuja.classList.remove("visible");
    soltar(dueno); dueno = null; fijada = false;
  }
  function citasYTerminos() {
    document.querySelectorAll("a.ref").forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      var li = id && document.getElementById(id);
      if (!li) return;
      a.setAttribute("aria-label", "Fuente " + a.textContent.trim());
      var txt = esc(li.textContent.trim().replace(/\s+/g, " "));
      a.addEventListener("mouseenter", function () { if (!fijada) mostrar(a, txt); });
      a.addEventListener("focus", function () { if (!fijada || dueno !== a) mostrar(a, txt); });
      a.addEventListener("mouseleave", function () { if (!fijada) ocultar(a); });
      a.addEventListener("blur", function () { ocultar(a); });
      a.addEventListener("click", function () { ocultar(a); li.classList.add("destacar"); setTimeout(function () { li.classList.remove("destacar"); }, 2400); });
    });
    document.querySelectorAll(".term[data-def]").forEach(function (t) {
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "0");
      t.setAttribute("role", "button");
      t.setAttribute("aria-expanded", "false");
      if (!t.hasAttribute("aria-label")) t.setAttribute("aria-label", t.textContent.trim() + ", ver definición");
      var html = '<b>' + esc(t.getAttribute("data-t") || t.textContent.trim()) + '</b>' + esc(t.getAttribute("data-def"));
      function alternar() { if (dueno === t && fijada) ocultar(t); else mostrar(t, html, true); }
      t.addEventListener("mouseenter", function () { if (!fijada) mostrar(t, html); });
      t.addEventListener("mouseleave", function () { if (!fijada) ocultar(t); });
      t.addEventListener("focus", function () { if (dueno !== t) mostrar(t, html); });
      t.addEventListener("blur", function () { ocultar(t); });
      t.addEventListener("click", function (e) { e.preventDefault(); alternar(); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); alternar(); }
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && dueno) ocultar(); });
    /* un clic o toque fuera del término o de la burbuja la cierra */
    document.addEventListener("pointerdown", function (e) {
      if (!dueno) return;
      if (e.target.closest && (e.target.closest(".term, a.ref") || e.target.closest("#burbuja"))) return;
      ocultar();
    });
    window.addEventListener("resize", function () { if (dueno && !fijada) ocultar(); });
  }

  /* Secuencia de etapas (cámara y mapa) */
  function etapas() {
    document.querySelectorAll(".etapas").forEach(function (box) {
      var btns = box.querySelectorAll(".etapas-ctl button"), cam = box.querySelector(".cam img"), mapa = box.querySelector(".mapa img");
      var camS = box.querySelector(".cam source"), mapaS = box.querySelector(".mapa source");
      var play = box.querySelector("[data-play]"), timer = null, i = 0;
      function ir(k) {
        i = k;
        btns.forEach(function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
        var n = k + 1;
        if (camS) camS.srcset = "img/fotos/etapa-" + n + "-camara.webp";
        if (mapaS) mapaS.srcset = "img/fotos/etapa-" + n + "-mapa.webp";
        cam.src = "img/fotos/etapa-" + n + "-camara.jpg"; mapa.src = "img/fotos/etapa-" + n + "-mapa.jpg";
        cam.alt = "Cámara cenital, etapa " + n + " de 4"; mapa.alt = btns[k].getAttribute("data-alt") || ("Mapa en RViz, etapa " + n);
      }
      btns.forEach(function (b, j) { b.addEventListener("click", function () { parar(); ir(j); }); });
      function parar() { if (timer) { clearInterval(timer); timer = null; if (play) { play.textContent = "Reproducir secuencia"; play.setAttribute("aria-pressed", "false"); } } }
      if (play) play.addEventListener("click", function () {
        if (timer) { parar(); return; }
        play.textContent = "Pausar"; play.setAttribute("aria-pressed", "true");
        timer = setInterval(function () { ir((i + 1) % btns.length); }, 2600);
      });
      document.addEventListener("visibilitychange", function () { if (document.hidden) parar(); });
      window.U.alCambiarMovimiento(function (reducido) { if (reducido) parar(); });
      /* Precarga de los otros mapas en el formato que el navegador ya eligió para el primero, y solo
         cuando la secuencia se acerca a la pantalla. Antes se pedían los JPG al cargar la página
         aunque se mostraran los WebP. */
      function precargar() {
        var ext = /\.webp(\?|$)/.test(mapa.currentSrc || "") ? ".webp" : ".jpg";
        for (var n = 1; n <= btns.length; n++) { var a = new Image(); a.src = "img/fotos/etapa-" + n + "-mapa" + ext; }
      }
      if ("IntersectionObserver" in window) {
        var obs = new IntersectionObserver(function (ents) {
          if (!ents.some(function (e) { return e.isIntersecting; })) return;
          obs.disconnect();
          if (mapa.complete) precargar(); else mapa.addEventListener("load", precargar, { once: true });
        }, { rootMargin: "400px 0px" });
        obs.observe(box);
      }
    });
  }

  /* Interactivos con carga diferida.
     MODULOS dice qué archivo registra cada interactivo en window.VISUALES. Las páginas ya no cargan esos
     archivos al abrirse: cada uno se pide la primera vez que un interactivo suyo se acerca a la pantalla.
     La observación empieza con el evento load, con el primer desplazamiento o a los 3 s, lo que ocurra
     antes, para que los interactivos no compitan con la primera pintura. Los modelos de cálculo
     (control-modelo.js, movimiento-modelo.js y otros) siguen en el HTML porque estos archivos los leen
     al cargarse. Para agregar un interactivo, registra su nombre aquí. */
  var MODULOS = {
    "js/navegacion.js": "astar alcance inflacion dwb reto-navegacion",
    "js/exploracion.js": "frontera metas listanegra exploracion reto-exploracion",
    "js/control.js": "pid enjambre estacionario tiempo leyes papeles cancelacion ciclo truncamiento acumulador windup zonas pso resolucion lazo-rueda fopdt protocolo reto-control",
    "js/robot.js": "camino arquitectura costo vistas esquema reto-robot",
    "js/gemelo.js": "gemelo",
    "js/resultados.js": "fallaria reto-resultados",
    "js/mapeo.js": "lidar rejilla marcos-mapeo barridos lazo rviz-colores cobertura reto-mapeo",
    "js/movimiento.js": "calibracion cuadrado cinematica encoder odometria iteracion2 giro reto-movimiento",
    "js/evidencia.js": "estabilidad plano-mapa repeticiones",
    "js/slam-proceso.js": "candidatos-slam cola-slam",
    "js/lecciones.js": "metas-abortadas",
    "js/mundo-real.js": "casos-ciclo",
    "js/diagramas-vivos.js": "ciclo-robot flujo-nav2 energia-senales"
  };
  var MODULO_DE = {};
  Object.keys(MODULOS).forEach(function (src) { MODULOS[src].split(" ").forEach(function (n) { MODULO_DE[n] = src; }); });
  window.SITIO.MODULOS = MODULOS;
  var cargas = {};
  function cargarModulo(nombre, listo) {
    var src = MODULO_DE[nombre];
    if (!src || (window.VISUALES && window.VISUALES[nombre])) { listo(); return; }
    var c = cargas[src];
    if (!c) {
      c = cargas[src] = { hecho: false, esperan: [] };
      var s = document.createElement("script");
      s.src = src;
      var fin = function () { c.hecho = true; c.esperan.splice(0).forEach(function (f) { f(); }); };
      s.onload = fin;
      /* sin red el archivo se vuelve a pedir en el próximo intento */
      s.onerror = function () { s.remove(); delete cargas[src]; fin(); };
      document.head.appendChild(s);
    }
    if (c.hecho) listo(); else c.esperan.push(listo);
  }
  function interactivos() {
    var els = document.querySelectorAll("[data-vis]");
    function montar(el) {
      if (el.getAttribute("data-montado")) return;
      var f = window.VISUALES && window.VISUALES[el.getAttribute("data-vis")];
      if (!el.respaldoVis) el.respaldoVis = el.innerHTML;
      if (!f) { fallo(el, "El módulo de este interactivo no está disponible."); return; }
      /* El atributo va antes de montar. Mientras falta, el CSS centra el respaldo, y los gráficos que
         miden su contenedor al dibujarse leían un ancho de cero y quedaban a 600 px, reducidos en un teléfono.
         Si el montaje falla, fallo() lo quita. */
      try { el.setAttribute("data-montado", "1"); if (window.U && window.U.escenaAuto) window.U.escenaAuto(el); f(el); delete el.innerHTML; el.removeAttribute("data-error-vis"); }
      catch (e) { delete el.innerHTML; fallo(el, "No se pudo cargar este interactivo en tu navegador."); if (window.console) console.error(e); }
    }
    function pedir(el, despues) {
      if (el.getAttribute("data-montado")) { if (despues) despues(); return; }
      cargarModulo(el.getAttribute("data-vis"), function () { montar(el); if (despues) despues(); });
    }
    function fallo(el, message) {
      el.innerHTML = el.respaldoVis;
      el.removeAttribute("data-montado"); el.setAttribute("data-error-vis", "1");
      var p = document.createElement("p"); p.className = "vis-error"; p.setAttribute("role", "status"); p.textContent = message + " La explicación de respaldo permanece disponible. ";
      var b = document.createElement("button"); b.type = "button"; b.className = "vbtn sec"; b.textContent = "Reintentar";
      b.addEventListener("click", function () {
        var nombre = el.getAttribute("data-vis"), src = MODULO_DE[nombre];
        /* si el archivo llegó pero no registró el interactivo, se vuelve a pedir */
        if (src && cargas[src] && cargas[src].hecho && !(window.VISUALES && window.VISUALES[nombre])) delete cargas[src];
        pedir(el);
      });
      p.appendChild(b); el.appendChild(p);
    }
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { pedir(el); }); return; }
    /* Se montan con holgura, antes de que el lector llegue, para que el texto no salte al crecer cada interactivo. */
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); pedir(e.target); } });
    }, { rootMargin: "1200px 0px" });
    var activo = false;
    function activar() {
      if (activo) return;
      activo = true;
      window.removeEventListener("scroll", activar);
      els.forEach(function (el) { if (!el.getAttribute("data-montado")) io.observe(el); });
    }
    if (document.readyState === "complete") activar();
    else {
      window.addEventListener("load", activar, { once: true });
      window.addEventListener("scroll", activar, { passive: true });
      setTimeout(activar, 3000);
    }
    /* En un enlace a una sección, se montan primero los interactivos anteriores y luego se vuelve al destino. */
    function alDestino() {
      if (!location.hash) return;
      var dest = destinoDe(location.hash);
      if (!dest) return;
      /* los que siguen dentro de un details cerrado se montan al abrirlo, cuando ya tienen ancho */
      var antes = Array.prototype.filter.call(els, function (el) { return !el.getAttribute("data-montado") && (el.compareDocumentPosition(dest) & 4) && !el.closest("details:not([open])"); });
      if (!antes.length) return;
      var faltan = antes.length;
      antes.forEach(function (el) {
        io.unobserve(el);
        pedir(el, function () {
          if (--faltan === 0) requestAnimationFrame(function () { dest.scrollIntoView({ block: "start" }); });
        });
      });
    }
    alDestino();
    window.addEventListener("hashchange", alDestino);
  }

  /* Contenido plegado. Si el destino de un ancla está dentro de un details cerrado, se abre antes
     de desplazar la página. Cubre la carga con ancla, el cambio de ancla, el índice lateral, las
     citas y los resultados del buscador. Al abrir uno se avisa un cambio de tamaño para que los
     interactivos de adentro midan su ancho, y al imprimir se abren todos. */
  function destinoDe(hash) {
    if (!hash || hash.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
  }
  function abrirHasta(el) {
    var abrio = false;
    for (var d = el; d; d = d.parentElement) if (d.tagName === "DETAILS" && !d.open) { d.open = true; abrio = true; }
    return abrio;
  }
  /* Tras un resultado del buscador, el texto buscado puede estar plegado bajo el encabezado de destino. Se abren los
     detalles de esa sección, hasta el siguiente encabezado del mismo nivel o superior. La marca la deja marco.js y vence a los 8 s. */
  function buscadoReciente() {
    try {
      var t = Number(sessionStorage.getItem("buscado"));
      sessionStorage.removeItem("buscado");
      return t > 0 && Date.now() - t < 8000;
    } catch (e) { return false; }
  }
  function abrirSeccion(el) {
    if (!/^H[23]$/.test(el.tagName)) return false;
    var nivel = Number(el.tagName.charAt(1)), abrio = false, n = (el.closest(".widget-cab") || el).nextElementSibling;
    for (; n; n = n.nextElementSibling) {
      var m = /^H([23])$/.exec(n.tagName);
      if (m && Number(m[1]) <= nivel) break;
      if (n.matches && n.matches("details.detalle")) { if (!n.open) { n.open = true; abrio = true; } }
      else if (n.querySelectorAll) n.querySelectorAll("details.detalle:not([open])").forEach(function (d) { d.open = true; abrio = true; });
    }
    return abrio;
  }
  function plegados() {
    function alAncla() {
      var el = destinoDe(location.hash);
      if (!el) return;
      var abrio = abrirHasta(el);
      if (buscadoReciente() && abrirSeccion(el)) abrio = true;
      if (abrio) requestAnimationFrame(function () { el.scrollIntoView({ block: "start" }); });
    }
    alAncla();
    window.addEventListener("hashchange", alAncla);
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href*='#']");
      if (!a || a.pathname !== location.pathname) return;
      var el = destinoDe(a.hash);
      if (el) abrirHasta(el);
    }, true);
    document.querySelectorAll("details").forEach(function (d) {
      d.addEventListener("toggle", function () { if (d.open) window.dispatchEvent(new Event("resize")); });
    });
    window.addEventListener("beforeprint", function () { document.querySelectorAll("details.detalle, details.ficha-concepto, details.bib-ref, details.bib-mas").forEach(function (d) { d.open = true; }); });
  }

  /* Resaltar el destino de un enlace interno */
  function destacarHash() {
    function marcar() {
      if (!location.hash) return;
      var el = destinoDe(location.hash);
      if (!el) return;
      if (el.tagName === "DETAILS") el.open = true;
      el.classList.add("destacar");
      setTimeout(function () { el.classList.remove("destacar"); }, 2400);
    }
    window.addEventListener("hashchange", marcar);
    setTimeout(marcar, 60);
  }

  /* Tablas anchas. Una tabla que no cabe se desplaza dentro de .tabla-env; si ese contenedor no
     puede recibir el foco, quien usa teclado no puede recorrer las columnas ocultas (WCAG 2.1.1).
     Solo se vuelve enfocable cuando realmente desborda, con un nombre tomado de su caption. */
  function tablasDesplazables() {
    var envs = [].slice.call(document.querySelectorAll(".tabla-env"));
    if (!envs.length) return;
    function revisar() {
      envs.forEach(function (env) {
        if (env.hasAttribute("data-desplazable-fijo")) return;
        var desborda = env.scrollWidth > env.clientWidth + 1;
        if (desborda && !env.hasAttribute("data-desplazable")) {
          var cap = env.querySelector("caption"), nombre = cap ? cap.textContent.trim().replace(/\s+/g, " ") : "Tabla";
          env.setAttribute("data-desplazable", "1"); env.setAttribute("tabindex", "0"); env.setAttribute("role", "region");
          env.setAttribute("aria-label", nombre.slice(0, 140) + ". Desplazable horizontalmente");
        } else if (!desborda && env.hasAttribute("data-desplazable")) {
          ["data-desplazable", "tabindex", "role", "aria-label"].forEach(function (a) { env.removeAttribute(a); });
        }
      });
    }
    /* Las que ya declaran su región en el HTML se respetan tal cual. */
    envs.forEach(function (env) { if (env.hasAttribute("tabindex") && !env.hasAttribute("data-desplazable")) env.setAttribute("data-desplazable-fijo", "1"); });
    revisar();
    var t = null;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(revisar, 150); });
    document.querySelectorAll("details").forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) revisar(); }); });
  }

  /* Filtro de una lista larga. Muestra solo lo que contiene todas las palabras escritas, sin distinguir
     tildes ni mayúsculas, y anuncia cuántos elementos quedan. */
  function filtroLista(o) {
    var caja = document.createElement("div");
    caja.className = "filtro-lista";
    caja.innerHTML = '<label for="' + o.id + '">' + o.etiqueta + '</label><div class="campo-buscar">' + SVG.lupa + '<input id="' + o.id + '" type="search" autocomplete="off" spellcheck="false" placeholder="' + o.ejemplo + '"></div><p class="filtro-estado" role="status" aria-live="polite"></p>';
    o.antes.parentNode.insertBefore(caja, o.antes);
    var input = caja.querySelector("input"), estado = caja.querySelector(".filtro-estado");
    /* el texto de cada elemento se normaliza al primer uso, no al cargar: en la bibliografía son unas
       30 000 palabras y hacerlo de entrada bloquearía la página */
    var textos = null;
    /* la normalización es la del buscador, que js/marco.js deja en SITIO.busqueda */
    var B = SITIO.busqueda;
    function preparar() { if (!textos) textos = o.items.map(function (d) { return B.norm(d.textContent); }); }
    /* o.cargar trae, la primera vez, el texto que la lista no lleva en la página. El filtro espera a tenerlo. */
    var listo = !o.cargar;
    function traer() {
      if (listo) return Promise.resolve();
      return o.cargar().then(function () { listo = true; textos = null; });
    }
    input.addEventListener("focus", function () { traer().then(preparar, function () {}); });
    input.addEventListener("input", function () {
      if (listo) return filtrar();
      estado.textContent = "Cargando el texto de las referencias…";
      traer().then(filtrar, function () { estado.textContent = "No se pudo cargar el texto de las referencias. Prueba con el buscador del sitio."; });
    });
    function filtrar() {
      preparar();
      var ps = B.tokens(input.value), n = 0;
      o.items.forEach(function (d, i) {
        var ver = !ps.length || ps.every(function (p) { return textos[i].indexOf(p) >= 0; });
        d.hidden = !ver; if (ver) n++;
      });
      if (o.alFiltrar) o.alFiltrar(ps.length > 0);
      estado.textContent = !ps.length ? "" : (n ? n + " " + (n === 1 ? o.uno : o.varios) : o.ninguno);
    }
  }
  function glosario() {
    var dl = document.querySelector("dl.glosario");
    if (!dl) return;
    filtroLista({ antes: dl, id: "g-filtro", etiqueta: "Filtrar el glosario", ejemplo: "Por ejemplo: odometría, frontera o PID",
      items: [].filter.call(dl.children, function (d) { return d.tagName === "DIV"; }),
      uno: "término coincide.", varios: "términos coinciden.", ninguno: "Ningún término coincide. Prueba con el buscador del sitio." });
  }
  /* Bibliografía de la tesis: el filtro abre los grupos con coincidencias y oculta los demás.
     Al borrarlo, cada grupo vuelve a quedar abierto o cerrado como estaba. */
  function bibliografia() {
    var grupos = [].slice.call(document.querySelectorAll(".bib-grupo"));
    if (!grupos.length) return;
    var antes = null;
    var cargado = null;
    /* Cada referencia llega con su línea de resumen. Su detalle está en datos/bibliografia-referencias.html y se
       pide una sola vez: al abrir una referencia, al usar el filtro o, en una conexión buena, en un rato libre
       (así también se imprime completa). Cambia solo el contenido de cada detalle: la referencia, su estado
       abierto o cerrado y su ancla siguen siendo los mismos. */
    var puesto = false;
    function poner(t) {
      if (puesto) return;
      puesto = true;
      var doc = new DOMParser().parseFromString(t, "text/html");
      document.querySelectorAll("details.bib-ref").forEach(function (d) {
        var ligero = d.querySelector(".bib-detalle[data-ligero]"), full = doc.getElementById(d.id);
        if (!ligero || !full) return;
        ligero.replaceWith(document.importNode(full.querySelector(".bib-detalle"), true));
      });
      copiarCitas();
    }
    function cargarDetalle() {
      if (cargado) return cargado;
      cargado = fetch("datos/bibliografia-referencias.html").then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
        .then(poner, function (e) { cargado = null; throw e; });
      return cargado;
    }
    document.addEventListener("toggle", function (e) {
      var d = e.target;
      if (d.open && d.matches && d.matches("details.bib-ref") && d.querySelector(".bib-detalle[data-ligero]")) cargarDetalle().catch(function () {});
    }, true);
    var con = navigator.connection || {};
    if (!con.saveData && (!con.effectiveType || con.effectiveType === "4g")) {
      var libre = window.requestIdleCallback || function (f) { return setTimeout(f, 2500); };
      window.addEventListener("load", function () { libre(function () { cargarDetalle().catch(function () {}); }); }, { once: true });
    }
    /* Al imprimir no se puede esperar una respuesta: si el detalle aún no llegó, se pide en forma síncrona, solo aquí,
       para que la hoja salga completa. Este oyente va antes que el que abre todos los plegables. */
    window.addEventListener("beforeprint", function () {
      if (puesto) return;
      try {
        var x = new XMLHttpRequest();
        x.open("GET", "datos/bibliografia-referencias.html", false);
        x.send();
        if (x.status === 200) poner(x.responseText);
      } catch (e) {}
    });
    filtroLista({ antes: grupos[0], id: "b-filtro", cargar: cargarDetalle, etiqueta: "Filtrar la bibliografía", ejemplo: "Por ejemplo: Nav2, PSO o estadística",
      items: [].slice.call(document.querySelectorAll(".bib-grupo ol.bib > li")),
      uno: "referencia coincide.", varios: "referencias coinciden.", ninguno: "Ninguna referencia coincide. Prueba con el buscador del sitio.",
      alFiltrar: function (activo) {
        if (activo && !antes) antes = grupos.map(function (g) { return g.querySelector("details.detalle").open; });
        if (!antes) return;
        grupos.forEach(function (g, i) {
          var d = g.querySelector("details.detalle"), hay = !!g.querySelector("ol.bib > li:not([hidden])");
          g.hidden = activo && !hay;
          d.open = activo ? hay : antes[i];
        });
        if (!activo) antes = null;
      } });
  }

  /* Copiar la cita de una referencia tal como la escribe la tesis, o su entrada BibTeX. El archivo .bib se pide
     una sola vez, al presionar el primer botón, y de él se toma solo la entrada de esa referencia. Sin
     JavaScript la cita se puede seleccionar a mano y el archivo se descarga desde «Descargar y citar». */
  function copiarCitas() {
    var citas = [].slice.call(document.querySelectorAll(".bib-cita-tesis[data-clave]")).filter(function (p) {
      return !(p.nextElementSibling && p.nextElementSibling.classList.contains("bib-copiar"));
    });
    if (!citas.length) return;
    var bib = null, pedido = null;
    function pedirBib() {
      if (bib) return Promise.resolve(bib);
      if (!pedido) pedido = fetch("datos/bibliografia.bib").then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
        .then(function (t) { bib = t; return t; }, function (e) { pedido = null; throw e; });
      return pedido;
    }
    function entrada(t, clave) {
      var m = new RegExp("^@[a-z]+\\{" + clave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ",[\\s\\S]*?^\\}", "m").exec(t);
      return m ? m[0] : null;
    }
    function textoCita(span) {
      /* los enlaces de la cita muestran la dirección acortada; al copiar va completa */
      var c = span.cloneNode(true);
      c.querySelectorAll("a[href]").forEach(function (a) { if (!/^https?:/.test(a.textContent)) a.textContent = a.href; });
      return c.textContent.replace(/\s+/g, " ").trim();
    }
    function copiar(texto) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
      return new Promise(function (ok, mal) {
        var ta = document.createElement("textarea");
        ta.value = texto; ta.setAttribute("readonly", ""); ta.className = "sr";
        document.body.appendChild(ta); ta.select();
        var hecho = false;
        try { hecho = document.execCommand("copy"); } catch (e) {}
        ta.remove();
        if (hecho) ok(); else mal(new Error("sin portapapeles"));
      });
    }
    citas.forEach(function (p) {
      var clave = p.getAttribute("data-clave"), span = p.querySelector(".bib-cita-texto");
      var ref = p.closest(".bib-ref"), autor = ref && ref.querySelector(".bib-autor") ? ref.querySelector(".bib-autor").textContent : "";
      var caja = document.createElement("div");
      caja.className = "bib-copiar";
      caja.innerHTML = '<button type="button" class="btn chico" data-copiar="cita" aria-label="Copiar la cita de ' + esc(autor) + '">Copiar la cita</button>' +
        '<button type="button" class="btn chico" data-copiar="bibtex" aria-label="Copiar en BibTeX la entrada de ' + esc(autor) + '">Copiar en BibTeX</button>' +
        '<span class="bib-copia-estado" role="status" aria-live="polite"></span>';
      p.insertAdjacentElement("afterend", caja);
      var estado = caja.querySelector(".bib-copia-estado");
      caja.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-copiar]");
        if (!b) return;
        var que = b.getAttribute("data-copiar");
        estado.textContent = "";
        var listo = que === "cita" ? Promise.resolve(textoCita(span)) : pedirBib().then(function (t) {
          var x = entrada(t, clave); if (!x) throw new Error("sin entrada"); return x;
        });
        listo.then(function (texto) { return copiar(texto).then(function () { estado.textContent = que === "cita" ? "Cita copiada." : "Entrada BibTeX copiada."; }); })
          .catch(function () {
            estado.textContent = que === "cita" ? "No se pudo copiar. Selecciona la cita y cópiala a mano."
              : "No se pudo copiar la entrada. Descarga el archivo en Descargar y citar, al final de la página.";
          });
      });
    });
  }

  /* La bibliografía de la tesis pasó de recursos.html a bibliografia.html. Un script en la cabecera de
     recursos.html lleva los enlaces antiguos a la nueva página al cargar. Aquí se cubre el cambio de ancla
     dentro de Recursos: un grupo (#bib-…) o una referencia (#r-…) que ya no está en esta página. */
  function bibliografiaTrasladada() {
    if (pagina !== "recursos") return;
    window.addEventListener("hashchange", function () {
      var h = location.hash.slice(1);
      try { h = decodeURIComponent(h); } catch (e) {}
      if (/^(r|bib)-[a-z0-9-]+$/.test(h) && !document.getElementById(h)) location.replace("bibliografia.html#" + h);
    });
  }

  /* Estado del PDF de la tesis en Recursos */
  function materiales() {
    if (!TESIS_PDF) return;
    document.querySelectorAll("[data-tesis-pdf]").forEach(function (td) {
      td.innerHTML = '<span class="estado ok">Disponible</span> <a href="' + esc(TESIS_PDF) + '">Ver el PDF</a>';
    });
  }

  /* Movimiento con propósito: los bloques aparecen al llegar a ellos, las cifras clave cuentan hasta su valor y las
     barras crecen. Solo con movimiento permitido. Sin JavaScript o con movimiento reducido, todo queda quieto y visible. */
  var REVELA = ".caso, .decision, .articulo figure.fig, .articulo .widget, .articulo .callout, .articulo .galeria, .articulo .argumento, " +
    ".articulo .tabla-env, .articulo .cifras-mini > div, .nav-cap a";
  var CUENTA = ".cifras-mini b";
  function contar(b) {
    var it = document.createTreeWalker(b, NodeFilter.SHOW_TEXT, null), tn;
    while ((tn = it.nextNode()) && !/\d/.test(tn.nodeValue)) {}
    if (!tn) return;
    var orig = tn.nodeValue, m = orig.match(/\d{1,3}(?: \d{3})+(?:,\d+)?|\d+(?:,\d+)?/);
    if (!m) return;
    var dec = (m[0].split(",")[1] || "").length, miles = m[0].indexOf(" ") > 0, valor = parseFloat(m[0].replace(/ /g, "").replace(",", "."));
    if (!(valor > 0)) return;
    var fmt = function (v) { var p = v.toFixed(dec).split("."); if (miles) p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "); return p.join(","); };
    /* el número animado no ocupa más ni menos que el final, así no mueve el texto que lo sigue, y el lector de pantalla lee solo el valor real */
    var sr = document.createElement("span"), vis = document.createElement("span");
    sr.className = "sr"; sr.textContent = m[0];
    vis.className = "cuenta"; vis.setAttribute("aria-hidden", "true"); vis.textContent = m[0];
    var antes = document.createTextNode(orig.slice(0, m.index)), despues = document.createTextNode(orig.slice(m.index + m[0].length));
    var padre = tn.parentNode;
    [antes, sr, vis, despues].forEach(function (n) { padre.insertBefore(n, tn); });
    padre.removeChild(tn);
    vis.style.width = vis.getBoundingClientRect().width + "px";
    var ini = null, dur = 1100;
    function paso(t) {
      if (ini === null) ini = t;
      var k = Math.min(1, (t - ini) / dur), e = 1 - Math.pow(1 - k, 3);
      vis.textContent = fmt(valor * e);
      if (k < 1) { requestAnimationFrame(paso); return; }
      var final = document.createTextNode(orig);
      padre.insertBefore(final, antes); [antes, sr, vis, despues].forEach(function (n) { padre.removeChild(n); });
    }
    vis.textContent = fmt(0);
    requestAnimationFrame(paso);
  }
  function animaciones() {
    if (quieto() || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("anima");
    var porPadre = new Map();
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add("visible");
        if (e.target.matches(CUENTA)) contar(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    /* lo que ya se ve al arrancar queda como está: ni parpadea ni vuelve a contar */
    var aLaVista = function (el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
    document.querySelectorAll(REVELA).forEach(function (el) {
      var n = porPadre.get(el.parentNode) || 0; porPadre.set(el.parentNode, n + 1);
      el.classList.add("revela"); el.style.setProperty("--orden", Math.min(n, 4));
      if (aLaVista(el)) el.classList.add("visible", "ya"); else io.observe(el);
    });
    /* las barras crecen una tras otra */
    document.querySelectorAll(".barras li, .gantt td.g-barra").forEach(function (el) { var k = [].indexOf.call(el.closest(".barras, .gantt").querySelectorAll(el.tagName === "LI" ? "li" : "td.g-barra"), el); el.style.setProperty("--i", Math.min(k, 16)); });
    document.querySelectorAll(CUENTA + ", .barras, .gantt").forEach(function (el) { if (aLaVista(el)) el.classList.add("visible"); else io.observe(el); });
    window.addEventListener("beforeprint", function () { document.querySelectorAll(".revela, .barras, .gantt").forEach(function (el) { el.classList.add("visible"); }); });
  }

  /* Botón «Escuchar» de los resúmenes: js/voz-resumen.js se pide en reposo, tras el evento load. El audio no se pide hasta pulsarlo. */
  function vozResumen() {
    if (!document.querySelector("p.resumen")) return;
    function pedir() {
      var s = document.createElement("script");
      s.src = new URL("js/voz-resumen.js", document.baseURI).href;
      document.head.appendChild(s);
    }
    var libre = window.requestIdleCallback || function (f) { return setTimeout(f, 2500); };
    if (document.readyState === "complete") libre(pedir); else window.addEventListener("load", function () { libre(pedir); }, { once: true });
  }

  /* Cada parte arranca aislada: un fallo en una no impide montar las siguientes. */
  function iniciar(partes) {
    partes.forEach(function (f) {
      try { f(); } catch (e) { if (window.console) console.error("No se pudo iniciar " + (f.name || "una parte del sitio"), e); }
    });
  }
  /* sitio.js se carga antes que los archivos de interactivos. Las ayudas de lectura se arman en cuanto
     llega, sin esperar esos archivos. Los interactivos se montan después de
     DOMContentLoaded, cuando todos los scripts diferidos ya registraron sus funciones. */
  function alListo(fn) {
    var hecho = false;
    function una() { if (!hecho) { hecho = true; fn(); } }
    /* Las páginas de la guía cargan los scripts después del evento load (scripts/css_critico.py). Mientras falte
       alguno, __guiaPendiente vale 1 y el evento guia:scripts avisa cuando el último ya corrió. */
    if (window.__guiaPendiente) { document.addEventListener("guia:scripts", una, { once: true }); return; }
    if (document.readyState === "complete") { fn(); return; }
    document.addEventListener("DOMContentLoaded", una);
    window.addEventListener("load", una);
  }
  function arrancar() {
    iniciar([vozResumen, bibliografiaTrasladada, capitulo, progreso, arriba, videos, bucles, ampliar, comparadores, citasYTerminos, glosario, bibliografia, copiarCitas, materiales, etapas, plegados]);
    document.documentElement.classList.add("js");
    alListo(function () { iniciar([interactivos, destacarHash, tablasDesplazables, animaciones]); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();
})();
