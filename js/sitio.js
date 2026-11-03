/*
  Lectura de las páginas de la guía: índice lateral, secciones en el menú del teléfono, barra de progreso,
  citas con vista previa, términos con definición, comparadores, videos en bucle, video liviano,
  ampliación de imágenes, secuencia de etapas y carga diferida de los interactivos. La cabecera, el pie,
  el menú y el buscador son el marco común: herramientas/plantillas/ y js/marco.js.

  Para agregar o renombrar un tema basta con editar la lista CAPS.
  El PDF autorizado y los metadatos se editan en datos/academico.json; regenera con herramientas/datos.py.
*/
(function () {
  "use strict";

  /* Si datos/proyecto.js no llega (bloqueado, caché corrupta o archivo ausente), los respaldos deben
     seguir funcionando. El aviso estático del HTML conserva el estado. */
  var ACADEMICO = (window.PROYECTO && window.PROYECTO.academico) || {
    estado_texto: "En revisión por comité", tesis_pdf: null, version_documento: null, ultima_actualizacion_sitio: null, sinDatos: true
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
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    document.querySelectorAll("[data-cap-n]").forEach(function (el) { el.textContent = esCap ? "Tema " + (idxSec + 1) + " de " + CAPS.length : "Complemento " + n2(idxSec); });
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
            '<a href="' + x.id + '.html"' + (actual ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span><span>' + esc(x.t) + '</span></a>' +
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
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" }); var s = document.querySelector(".skip-link"); if (s) s.focus({ preventScroll: true }); });
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
        : (yt ? '<img src="https://i.ytimg.com/vi/' + esc(yt) + '/hqdefault.jpg" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '');
      v.innerHTML = '<button type="button" class="yt" aria-label="Reproducir video: ' + esc(tit + (sub ? ' ' + sub : '')) + '">' + img + '<span class="yt-play" aria-hidden="true"></span><span class="yt-tit">' + esc(tit) + (sub ? ' <small>' + esc(sub) + '</small>' : '') + '</span></button>';
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
      if (quieto || !("IntersectionObserver" in window)) ponerPortada(vid);
      if (quieto) { vid.removeAttribute("autoplay"); vid.pause(); marcar(); return; }
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
      if (window.matchMedia) {
        /* Safari anterior a la versión 14 solo ofrece addListener; sin esta guarda, el error detenía el resto del arranque. */
        var mqm = window.matchMedia("(prefers-reduced-motion: reduce)"), alReducir = function (e) { if (e.matches) parar(); };
        if (mqm.addEventListener) mqm.addEventListener("change", alReducir); else if (mqm.addListener) mqm.addListener(alReducir);
      }
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
    "js/vis1.js": "astar frontera metas listanegra cobertura alcance",
    "js/vis2.js": "estacionario tiempo leyes papeles cancelacion ciclo truncamiento acumulador windup zonas pso resolucion lazo-rueda fopdt protocolo camino",
    "js/vis3.js": "odometria iteracion2 giro arquitectura versiones gemelo costo fallaria vistas esquema",
    "js/sims.js": "exploracion cinematica encoder pid enjambre inflacion dwb",
    "js/mapeo.js": "lidar rejilla marcos-mapeo barridos lazo rviz-colores",
    "js/movimiento.js": "calibracion cuadrado",
    "js/evidencia.js": "estabilidad plano-mapa repeticiones",
    "js/slam-proceso.js": "candidatos-slam cola-slam"
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
      try { el.setAttribute("data-montado", "1"); f(el); el.removeAttribute("data-error-vis"); }
      catch (e) { fallo(el, "No se pudo cargar este interactivo en tu navegador."); if (window.console) console.error(e); }
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
  function plegados() {
    function alAncla() {
      var el = destinoDe(location.hash);
      if (el && abrirHasta(el)) requestAnimationFrame(function () { el.scrollIntoView({ block: "start" }); });
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
    input.addEventListener("focus", preparar);
    input.addEventListener("input", function () {
      preparar();
      var ps = B.tokens(input.value), n = 0;
      o.items.forEach(function (d, i) {
        var ver = !ps.length || ps.every(function (p) { return textos[i].indexOf(p) >= 0; });
        d.hidden = !ver; if (ver) n++;
      });
      if (o.alFiltrar) o.alFiltrar(ps.length > 0);
      estado.textContent = !ps.length ? "" : (n ? n + " " + (n === 1 ? o.uno : o.varios) : o.ninguno);
    });
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
    filtroLista({ antes: grupos[0], id: "b-filtro", etiqueta: "Filtrar la bibliografía", ejemplo: "Por ejemplo: Nav2, PSO o estadística",
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
    var citas = [].slice.call(document.querySelectorAll(".bib-cita-tesis[data-clave]"));
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
      td.innerHTML = '<span class="estado ok">Disponible</span> <a href="' + esc(TESIS_PDF) + '">Descargar el PDF</a>';
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
    if (quieto || !("IntersectionObserver" in window)) return;
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
    if (document.readyState === "complete") { fn(); return; }
    var hecho = false;
    function una() { if (!hecho) { hecho = true; fn(); } }
    document.addEventListener("DOMContentLoaded", una);
    window.addEventListener("load", una);
  }
  function arrancar() {
    iniciar([bibliografiaTrasladada, capitulo, progreso, arriba, videos, bucles, ampliar, comparadores, citasYTerminos, glosario, bibliografia, copiarCitas, materiales, etapas, plegados]);
    document.documentElement.classList.add("js");
    alListo(function () { iniciar([interactivos, destacarHash, tablasDesplazables, animaciones]); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();
  window.SITIO.quieto = quieto;
})();
