/*
  Estructura común del sitio: cabecera, menú de la guía, pie, índice lateral,
  barra de progreso, tema claro u oscuro, video liviano, ampliación de imágenes,
  secuencia de etapas y carga diferida de los interactivos.

  Para agregar o renombrar un capítulo basta con editar la lista CAPS.
  Si la tesis se publica en PDF, pon su enlace en TESIS_PDF y aparecerá en el pie y en Recursos.
*/
(function () {
  "use strict";

  var TESIS_PDF = "";            /* ejemplo: "https://repositorio.utem.cl/..." */
  var REPO = "https://github.com/SVN11X/tesis_explain";
  var VIDEO_ID = "iTTC10eGDmc";

  var CAPS = [
    { id: "problema", t: "El problema", d: "Qué significa que un robot sea autónomo en interiores y qué alternativas existen.", nivel: "básico" },
    { id: "robot", t: "El robot por dentro", d: "Piezas, energía, ROS 2 y quién hace qué entre el robot y el computador.", nivel: "básico" },
    { id: "movimiento", t: "Moverse y medir el avance", d: "Tracción diferencial, encoders y odometría, con sus errores medidos.", nivel: "intermedio" },
    { id: "control", t: "Controlar cada rueda", d: "PID en tiempo discreto, el hallazgo del PI incremental y la sintonía con PSO.", nivel: "avanzado" },
    { id: "mapeo", t: "Ver y dibujar el mapa", d: "Cómo mide un LiDAR 2D y cómo SLAM arma el mapa y corrige la deriva.", nivel: "intermedio" },
    { id: "navegacion", t: "Planificar y seguir una ruta", d: "Mapas de costos, A estrella, ventana dinámica y recuperaciones en Nav2.", nivel: "intermedio" },
    { id: "exploracion", t: "Decidir a dónde ir", d: "Exploración por fronteras y por qué 53 de 54 metas abortadas no eran fallas.", nivel: "intermedio" },
    { id: "gemelo", t: "El gemelo digital", d: "Qué se puede comprobar en simulación y qué solo en el robot real.", nivel: "básico" },
    { id: "resultados", t: "Qué se demostró y qué no", d: "Verificar frente a validar, objetivos, limitaciones y dónde fallaría.", nivel: "básico" },
    { id: "replicar", t: "Constrúyelo tú", d: "Materiales, versiones, repositorios base y doce lecciones aprendidas.", nivel: "intermedio" }
  ];
  window.SITIO = { CAPS: CAPS, REPO: REPO, VIDEO_ID: VIDEO_ID, TESIS_PDF: TESIS_PDF };

  var pagina = document.body.getAttribute("data-pagina") || "";
  var esCap = CAPS.some(function (c) { return c.id === pagina; });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function n2(i) { return (i < 9 ? "0" : "") + (i + 1); }
  function leer(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function guardar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ICONO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 6h22v12a11 11 0 0 1-22 0z" fill="var(--azul)"/><circle cx="16" cy="17" r="5.2" fill="var(--surface)"/><circle cx="16" cy="17" r="2.4" fill="var(--verde)"/><rect x="21" y="8.5" width="4" height="3" rx=".8" fill="var(--verde)"/></svg>';
  var SVG = {
    sol: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    luna: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    git: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
    abajo: '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:14px;height:14px"><path d="M6 9l6 6 6-6"/></svg>'
  };

  /* ── Tema ── */
  var TEMAS = ["auto", "light", "dark"];
  var NOMBRE_TEMA = { auto: "automático", light: "claro", dark: "oscuro" };
  function temaActual() { return leer("tema", "auto"); }
  function aplicarTema(t) {
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
    guardar("tema", t === "auto" ? null : t);
    var b = document.getElementById("btn-tema");
    if (b) {
      b.innerHTML = t === "dark" ? SVG.luna : (t === "light" ? SVG.sol : SVG.auto);
      b.setAttribute("aria-label", "Tema " + NOMBRE_TEMA[t] + ". Cambiar tema");
      b.title = "Tema " + NOMBRE_TEMA[t];
    }
    document.dispatchEvent(new CustomEvent("temacambio"));
  }
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var avisar = function () { document.dispatchEvent(new CustomEvent("temacambio")); };
    if (mq.addEventListener) mq.addEventListener("change", avisar); else if (mq.addListener) mq.addListener(avisar);
  }

  /* ── Cabecera ── */
  function cabecera() {
    var cont = document.getElementById("cabecera");
    if (!cont) return;
    var menu = CAPS.map(function (c, i) {
      return '<a href="' + c.id + '.html"' + (c.id === pagina ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span><b>' + esc(c.t) + '</b><small>' + esc(c.d) + '</small></a>';
    }).join("");
    cont.innerHTML =
      '<div class="cab"><div class="wrap">' +
      '<a class="marca" href="index.html">' + ICONO + '<span>Robot explorador<small>Tesis de Ingeniería Civil Electrónica · UTEM</small></span></a>' +
      '<nav class="nav-principal" aria-label="Principal">' +
      '<a class="nav-texto" href="index.html"' + (pagina === "inicio" ? ' aria-current="page"' : '') + '>Inicio</a>' +
      '<div class="nav-guia nav-texto"><button type="button" class="nav-btn" aria-expanded="false" aria-controls="menu-guia">Guía ' + SVG.abajo + '</button><div class="menu-guia" id="menu-guia" hidden>' + menu + '</div></div>' +
      '<a class="nav-texto" href="preguntas.html"' + (pagina === "preguntas" ? ' aria-current="page"' : '') + '>Preguntas difíciles</a>' +
      '<a class="nav-texto" href="recursos.html"' + (pagina === "recursos" ? ' aria-current="page"' : '') + '>Recursos</a>' +
      '</nav>' +
      '<a class="btn-icono nav-texto" href="' + REPO + '" aria-label="Repositorio en GitHub" title="Repositorio en GitHub">' + SVG.git + '</a>' +
      '<button type="button" class="btn-icono" id="btn-tema"></button>' +
      '<button type="button" class="btn-icono btn-menu" id="btn-menu" aria-label="Abrir menú" aria-expanded="false" aria-controls="cajon">' + SVG.menu + '</button>' +
      '</div></div>' +
      '<div class="cajon" id="cajon" role="dialog" aria-modal="true" aria-label="Menú"><div class="cajon-fondo" data-cerrar></div><div class="cajon-panel">' +
      '<div class="cajon-cab"><a class="marca" href="index.html">' + ICONO + '<span>Robot explorador</span></a><button type="button" class="btn-icono" data-cerrar aria-label="Cerrar menú">' + SVG.cerrar + '</button></div>' +
      '<a href="index.html"' + (pagina === "inicio" ? ' aria-current="page"' : '') + '><span class="n">·</span>Inicio</a><hr>' +
      CAPS.map(function (c, i) { return '<a href="' + c.id + '.html"' + (c.id === pagina ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span>' + esc(c.t) + '</a>'; }).join("") +
      '<hr><a href="preguntas.html"' + (pagina === "preguntas" ? ' aria-current="page"' : '') + '><span class="n">?</span>Preguntas difíciles</a>' +
      '<a href="recursos.html"' + (pagina === "recursos" ? ' aria-current="page"' : '') + '><span class="n">↗</span>Recursos y glosario</a>' +
      '<a href="' + REPO + '"><span class="n">⌥</span>Código de este sitio</a>' +
      '</div></div>';
    aplicarTema(temaActual());
    document.getElementById("btn-tema").addEventListener("click", function () {
      var t = temaActual(), i = TEMAS.indexOf(t);
      aplicarTema(TEMAS[(i + 1) % TEMAS.length]);
    });
    var bg = cont.querySelector(".nav-btn"), mg = document.getElementById("menu-guia");
    function cerrarGuia() { mg.hidden = true; bg.setAttribute("aria-expanded", "false"); }
    bg.addEventListener("click", function (e) { e.stopPropagation(); var ab = mg.hidden; mg.hidden = !ab; bg.setAttribute("aria-expanded", String(ab)); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".nav-guia")) cerrarGuia(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { cerrarGuia(); cerrarCajon(); } });
    var cajon = document.getElementById("cajon"), bm = document.getElementById("btn-menu");
    function cerrarCajon() { if (!cajon.classList.contains("abierto")) return; cajon.classList.remove("abierto"); bm.setAttribute("aria-expanded", "false"); bm.focus(); }
    bm.addEventListener("click", function () { cajon.classList.add("abierto"); bm.setAttribute("aria-expanded", "true"); var a = cajon.querySelector("a,button"); if (a) a.focus(); });
    cajon.addEventListener("click", function (e) { if (e.target.closest("[data-cerrar]")) cerrarCajon(); });
  }

  /* ── Pie ── */
  function pie() {
    var cont = document.getElementById("pie");
    if (!cont) return;
    cont.innerHTML = '<footer class="pie"><div class="franja"></div><div class="wrap">' +
      '<div><h2>Sobre este sitio</h2><p>Guía abierta para entender, cuestionar y reproducir el trabajo de titulación <em>Navegación y exploración autónoma de interiores utilizando un robot móvil de tracción diferencial</em>, de Sebastián Valderas Neculqueo, con el profesor guía Patricio Galarce Acevedo. Ingeniería Civil Electrónica, Universidad Tecnológica Metropolitana, Santiago de Chile, 2026.</p>' +
      '<p>Las cifras citan la sección de la tesis donde aparecen. Los diagramas marcados como ilustrativos usan datos de ejemplo para explicar una idea y no son mediciones del robot.</p>' +
      (TESIS_PDF ? '<p><a href="' + esc(TESIS_PDF) + '">Descargar la tesis en PDF</a></p>' : '') + '</div>' +
      '<div><h2>Guía</h2><ul>' + CAPS.map(function (c, i) { return '<li><a href="' + c.id + '.html">' + n2(i) + ' · ' + esc(c.t) + '</a></li>'; }).join("") + '</ul></div>' +
      '<div><h2>Más</h2><ul><li><a href="preguntas.html">Preguntas difíciles</a></li><li><a href="recursos.html">Referencias y para aprender más</a></li><li><a href="recursos.html#glosario">Glosario</a></li><li><a href="recursos.html#citar">Cómo citar</a></li><li><a href="https://www.youtube.com/watch?v=' + VIDEO_ID + '">Video del robot en YouTube</a></li><li><a href="' + REPO + '">Código de este sitio</a></li><li><a href="' + REPO + '/issues">Reportar un error o sugerir una mejora</a></li></ul></div>' +
      '</div></footer>';
  }

  /* ── Capítulo: índice lateral, ayuda y navegación ── */
  function capitulo() {
    if (!esCap) return;
    var idx = CAPS.map(function (c) { return c.id; }).indexOf(pagina), c = CAPS[idx];
    var art = document.querySelector(".articulo");
    /* tiempo de lectura */
    if (art) {
      var palabras = (art.textContent || "").trim().split(/\s+/).length;
      var min = Math.max(3, Math.round(palabras / 190));
      document.querySelectorAll("[data-lectura]").forEach(function (el) { el.textContent = min + " min de lectura"; });
    }
    document.querySelectorAll("[data-cap-n]").forEach(function (el) { el.textContent = "Capítulo " + (idx + 1) + " de " + CAPS.length; });
    document.querySelectorAll("[data-nivel]").forEach(function (el) {
      var cls = c.nivel === "básico" ? "basico" : (c.nivel === "avanzado" ? "avanzado" : "intermedio");
      el.className = "etiqueta " + cls; el.textContent = "Nivel " + c.nivel;
    });
    /* anclas en títulos */
    if (art) art.querySelectorAll("h2[id], h3[id]").forEach(function (h) {
      if (h.querySelector(".ancla")) return;
      var a = document.createElement("a"); a.className = "ancla"; a.href = "#" + h.id; a.setAttribute("aria-label", "Enlace a esta sección"); a.textContent = "#";
      h.insertBefore(a, h.firstChild);
    });
    /* lateral */
    var lat = document.getElementById("lateral");
    if (lat && art) {
      var hs = Array.prototype.slice.call(art.querySelectorAll("section > h2[id]"));
      lat.innerHTML =
        '<nav class="guia-lista" aria-label="Capítulos de la guía"><h2>La guía</h2><ol>' + CAPS.map(function (x, i) {
          return '<li><a href="' + x.id + '.html"' + (x.id === pagina ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span><span>' + esc(x.t) + '</span></a></li>';
        }).join("") + '</ol></nav>' +
        (hs.length ? '<details class="en-pagina-cont" open><summary><h2>En esta página <span class="flecha">▾</span></h2></summary><nav class="en-pagina" aria-label="En esta página"><ul>' + hs.map(function (h) {
          var t = h.cloneNode(true); var an = t.querySelector(".ancla"); if (an) an.remove();
          return '<li><a href="#' + h.id + '" data-id="' + h.id + '">' + esc(t.textContent.trim()) + '</a></li>';
        }).join("") + '</ul></nav></details>' : '');
      if (window.matchMedia("(max-width: 1080px)").matches) { var d = lat.querySelector("details"); if (d) d.open = false; }
      if ("IntersectionObserver" in window && hs.length) {
        /* resalta en "En esta página" la sección que se está leyendo */
        var links = {}; lat.querySelectorAll(".en-pagina a").forEach(function (a) { links[a.getAttribute("data-id")] = a; });
        var visibles = new Map();
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (e) { visibles.set(e.target, e.isIntersecting); });
          for (var i = 0; i < hs.length; i++) {
            if (visibles.get(hs[i].parentElement)) {
              var activo = hs[i].id;
              hs.forEach(function (h) { var l = links[h.id]; if (l) l.classList.toggle("activo", h.id === activo); });
              break;
            }
          }
        }, { rootMargin: "-15% 0px -65% 0px" });
        hs.forEach(function (h) { io.observe(h.parentElement); });
      }
    }
    /* anterior y siguiente */
    var nc = document.getElementById("nav-cap");
    if (nc) {
      var ant = CAPS[idx - 1], sig = CAPS[idx + 1];
      nc.className = "nav-cap";
      nc.innerHTML = (ant ? '<a class="ant" href="' + ant.id + '.html"><span>← Capítulo anterior</span><b>' + esc(ant.t) + '</b></a>' : '<a class="ant" href="index.html"><span>← Volver</span><b>Inicio</b></a>') +
        (sig ? '<a class="sig" href="' + sig.id + '.html"><span>Capítulo siguiente →</span><b>' + esc(sig.t) + '</b></a>' : '<a class="sig" href="preguntas.html"><span>Para practicar →</span><b>Preguntas difíciles</b></a>');
    }
    var ay = document.getElementById("ayuda-pie");
    if (ay) ay.innerHTML = '¿Encontraste un error o algo no se entiende? <a href="' + REPO + '/issues/new?title=' + encodeURIComponent("Capítulo " + (idx + 1) + ": " + c.t) + '">Escríbelo en GitHub</a>. Las cifras se citan desde la tesis y las referencias externas están en <a href="recursos.html">Recursos</a>.';
  }

  /* ── Barra de progreso de lectura ── */
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

  /* ── Video liviano de YouTube ── */
  function videos() {
    document.querySelectorAll(".video[data-yt]").forEach(function (v) {
      var id = v.getAttribute("data-yt"), tit = v.getAttribute("data-titulo") || "Ver video", sub = v.getAttribute("data-sub") || "";
      var desde = v.getAttribute("data-desde");
      var portada = v.getAttribute("data-portada");
      var img = portada ? '<picture><source srcset="' + esc(portada) + '.webp" type="image/webp"><img src="' + esc(portada) + '.jpg" alt="" loading="lazy" decoding="async" width="1280" height="720"></picture>' : '<img src="https://i.ytimg.com/vi/' + esc(id) + '/hqdefault.jpg" alt="" loading="lazy" decoding="async" onerror="this.remove()">';
      v.innerHTML = '<button type="button" class="yt" aria-label="Reproducir video: ' + esc(tit) + '">' + img + '<span class="yt-play" aria-hidden="true"></span><span class="yt-tit">' + esc(tit) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></button>';
      v.querySelector("button").addEventListener("click", function () {
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0" + (desde ? "&start=" + parseInt(desde, 10) : "");
        f.title = tit; f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"; f.allowFullscreen = true;
        f.referrerPolicy = "strict-origin-when-cross-origin";
        v.innerHTML = ""; v.appendChild(f); f.focus();
      });
    });
  }

  /* ── Ampliar imágenes ── */
  function ampliar() {
    var imgs = document.querySelectorAll("figure.foto:not(.sin-zoom) img");
    if (!imgs.length || typeof HTMLDialogElement === "undefined") return;
    var dlg = document.createElement("dialog"); dlg.className = "lightbox";
    dlg.innerHTML = '<button type="button" aria-label="Cerrar">×</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    dlg.querySelector("button").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    imgs.forEach(function (img) {
      img.setAttribute("tabindex", "0"); img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.alt || "Imagen") + ". Ampliar");
      function abrir() {
        var im = dlg.querySelector("img"); im.src = img.getAttribute("data-grande") || img.currentSrc || img.src; im.alt = img.alt;
        var cap = img.closest("figure").querySelector("figcaption");
        dlg.querySelector("p").textContent = cap ? cap.textContent.trim() : "";
        dlg.showModal();
      }
      img.addEventListener("click", abrir);
      img.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
    });
  }

  /* ── Secuencia de etapas (cámara y mapa) ── */
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
      /* precarga */
      for (var n = 1; n <= btns.length; n++) { var a = new Image(); a.src = "img/fotos/etapa-" + n + "-mapa.jpg"; }
    });
  }

  /* ── Interactivos con carga diferida ── */
  function interactivos() {
    var els = document.querySelectorAll("[data-vis]");
    function montar(el) {
      if (el.getAttribute("data-montado")) return;
      var f = window.VISUALES && window.VISUALES[el.getAttribute("data-vis")];
      if (!f) return;
      el.setAttribute("data-montado", "1");
      try { f(el); } catch (e) { el.innerHTML = '<p class="vis-fallback">No se pudo cargar este interactivo en tu navegador.</p>'; if (window.console) console.error(e); }
    }
    if (!("IntersectionObserver" in window)) { els.forEach(montar); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { montar(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "400px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Resaltar el destino de un enlace interno ── */
  function destacarHash() {
    function marcar() {
      if (!location.hash) return;
      var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!el) return;
      if (el.tagName === "DETAILS") el.open = true;
      el.classList.add("destacar");
      setTimeout(function () { el.classList.remove("destacar"); }, 2400);
    }
    window.addEventListener("hashchange", marcar);
    setTimeout(marcar, 60);
  }

  function iniciar() {
    cabecera(); pie(); capitulo(); progreso(); videos(); ampliar(); etapas(); interactivos(); destacarHash();
    document.documentElement.classList.add("js");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
  window.SITIO.quieto = quieto;
})();
