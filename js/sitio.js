/*
  Estructura común del sitio: cabecera, menú de temas, pie, índice lateral,
  barra de progreso, tema claro u oscuro, buscador, citas con vista previa,
  términos con definición, comparadores, videos en bucle, video liviano,
  ampliación de imágenes, secuencia de etapas y carga diferida de los interactivos.

  Para agregar o renombrar un tema basta con editar la lista CAPS.
  Si la tesis se publica en PDF, pon su enlace en TESIS_PDF y aparecerá en el pie y en Recursos.
*/
(function () {
  "use strict";

  var TESIS_PDF = "";            /* ejemplo: "https://repositorio.utem.cl/..." */
  var REPO = "https://github.com/SVN11X/tesis_explain";
  var VIDEO_ID = "iTTC10eGDmc";

  var BLOQUES = { 1: "El contexto", 2: "Cómo funciona", 3: "Evidencia y práctica" };
  var CAPS = [
    { id: "problema", t: "Autonomía en interiores", d: "Qué significa que un robot sea autónomo, qué existía y qué decisiones se tomaron.", nivel: "básico", bloque: 1 },
    { id: "robot", t: "Anatomía del robot", d: "Piezas, energía, red, ROS 2 y el camino de una orden hasta el motor.", nivel: "básico", bloque: 1 },
    { id: "movimiento", t: "Moverse y medir el avance", d: "Tracción diferencial, encoders y odometría, con sus errores medidos.", nivel: "intermedio", bloque: 2 },
    { id: "control", t: "Control de velocidad de las ruedas", d: "PID en tiempo discreto, la ley heredada que opera como PI y la sintonía con PSO.", nivel: "avanzado", bloque: 2 },
    { id: "mapeo", t: "Ver y mapear con LiDAR y SLAM", d: "Cómo mide el láser, cómo se arma el mapa y cómo se corrige la deriva.", nivel: "intermedio", bloque: 2 },
    { id: "navegacion", t: "Planificar y seguir rutas con Nav2", d: "Mapas de costos, A estrella, ventana dinámica y recuperaciones.", nivel: "intermedio", bloque: 2 },
    { id: "exploracion", t: "Explorar por fronteras", d: "Cómo decide el robot a dónde ir y cómo leer las metas abortadas.", nivel: "intermedio", bloque: 2 },
    { id: "gemelo", t: "El gemelo digital", d: "Qué se comprueba en simulación y qué solo en el robot real.", nivel: "básico", bloque: 2 },
    { id: "resultados", t: "La evidencia: qué se demostró", d: "Verificar frente a validar, los cuatro objetivos, límites y trabajo futuro.", nivel: "básico", bloque: 3 },
    { id: "replicar", t: "Constrúyelo tú", d: "Materiales, versiones, repositorios base y lecciones de taller.", nivel: "intermedio", bloque: 3 }
  ];
  var EXTRAS = [
    { id: "mundo-real", t: "En el mundo real", d: "Dónde se usan estas mismas ideas, de una aspiradora a una mina chilena y a Marte." },
    { id: "lecciones", t: "Lecciones de ingeniería", d: "Temas que la tesis deja implícitos: unidades, seguridad, privacidad, reproducibilidad." },
    { id: "recursos", t: "Recursos", d: "Glosario, bibliografía, material para aprender y cómo citar." }
  ];
  var SECUENCIA = CAPS.concat(EXTRAS.slice(0, 2));
  window.SITIO = { CAPS: CAPS, EXTRAS: EXTRAS, REPO: REPO, VIDEO_ID: VIDEO_ID, TESIS_PDF: TESIS_PDF };

  var pagina = document.body.getAttribute("data-pagina") || "";
  var idxSec = SECUENCIA.map(function (c) { return c.id; }).indexOf(pagina);
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
    lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
    arriba: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    git: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.8 2.8 5.8 3.1 5.8 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
    abajo: '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:14px;height:14px"><path d="M6 9l6 6 6-6"/></svg>'
  };

  /* ── Tema claro u oscuro ── */
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

  function enlace(id, texto, extra) { return '<a href="' + id + '.html"' + (id === pagina ? ' aria-current="page"' : '') + (extra || '') + '>' + texto + '</a>'; }

  /* ── Cabecera ── */
  function cabecera() {
    var cont = document.getElementById("cabecera");
    if (!cont) return;
    var cols = [1, 2, 3].map(function (b) {
      return '<div class="mg-col"><span>' + BLOQUES[b] + '</span>' + CAPS.map(function (c, i) {
        if (c.bloque !== b) return "";
        return '<a href="' + c.id + '.html"' + (c.id === pagina ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span><b>' + esc(c.t) + '</b><small>' + esc(c.d) + '</small></a>';
      }).join("") + '</div>';
    }).join("");
    var extra = '<div class="mg-extra">' + EXTRAS.map(function (e) { return enlace(e.id, esc(e.t)); }).join("") + '</div>';
    cont.innerHTML =
      '<div class="cab"><div class="wrap">' +
      '<a class="marca" href="index.html">' + ICONO + '<span>Robot explorador<small>Guía abierta de una tesis de la UTEM</small></span></a>' +
      '<nav class="nav-principal" aria-label="Principal">' +
      '<a class="nav-texto" href="index.html"' + (pagina === "inicio" ? ' aria-current="page"' : '') + '>Inicio</a>' +
      '<div class="nav-guia nav-texto"><button type="button" class="nav-btn" aria-expanded="false" aria-controls="menu-guia">Temas ' + SVG.abajo + '</button><div class="menu-guia" id="menu-guia" hidden>' + cols + extra + '</div></div>' +
      '<span class="nav-texto">' + enlace("mundo-real", "En el mundo real") + '</span>' +
      '<span class="nav-texto">' + enlace("lecciones", "Lecciones") + '</span>' +
      '<span class="nav-texto">' + enlace("recursos", "Recursos") + '</span>' +
      '</nav>' +
      '<button type="button" class="btn-buscar" id="btn-buscar" aria-label="Buscar en el sitio">' + SVG.lupa + '<span class="bb-txt">Buscar</span><kbd>/</kbd></button>' +
      '<a class="btn-icono nav-texto" href="' + REPO + '" aria-label="Repositorio en GitHub" title="Repositorio en GitHub">' + SVG.git + '</a>' +
      '<button type="button" class="btn-icono" id="btn-tema"></button>' +
      '<button type="button" class="btn-icono btn-menu" id="btn-menu" aria-label="Abrir menú" aria-expanded="false" aria-controls="cajon">' + SVG.menu + '</button>' +
      '</div></div>' +
      '<div class="cajon" id="cajon" role="dialog" aria-modal="true" aria-label="Menú"><div class="cajon-fondo" data-cerrar></div><div class="cajon-panel">' +
      '<div class="cajon-cab"><a class="marca" href="index.html">' + ICONO + '<span>Robot explorador</span></a><button type="button" class="btn-icono" data-cerrar aria-label="Cerrar menú">' + SVG.cerrar + '</button></div>' +
      '<a href="index.html"' + (pagina === "inicio" ? ' aria-current="page"' : '') + '><span class="n">·</span>Inicio</a><hr>' +
      CAPS.map(function (c, i) { return '<a href="' + c.id + '.html"' + (c.id === pagina ? ' aria-current="page"' : '') + '><span class="n">' + n2(i) + '</span>' + esc(c.t) + '</a>'; }).join("") +
      '<hr>' + EXTRAS.map(function (e) { return '<a href="' + e.id + '.html"' + (e.id === pagina ? ' aria-current="page"' : '') + '><span class="n">+</span>' + esc(e.t) + '</a>'; }).join("") +
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
      '<p>Los datos del robot vienen de la tesis y se citan con su sección. Los ejemplos del mundo real y los temas transversales se apoyan en fuentes externas, enlazadas en cada página.</p>' +
      (TESIS_PDF ? '<p><a href="' + esc(TESIS_PDF) + '">Descargar la tesis en PDF</a></p>' : '') + '</div>' +
      '<div><h2>Temas</h2><ul>' + CAPS.map(function (c, i) { return '<li><a href="' + c.id + '.html">' + n2(i) + ' · ' + esc(c.t) + '</a></li>'; }).join("") + '</ul></div>' +
      '<div><h2>Más</h2><ul>' + EXTRAS.map(function (e) { return '<li><a href="' + e.id + '.html">' + esc(e.t) + '</a></li>'; }).join("") + '<li><a href="recursos.html#glosario">Glosario</a></li><li><a href="recursos.html#citar">Cómo citar</a></li><li><a href="https://www.youtube.com/watch?v=' + VIDEO_ID + '">Video del robot en YouTube</a></li><li><a href="' + REPO + '">Código de este sitio</a></li><li><a href="' + REPO + '/issues">Reportar un error o sugerir una mejora</a></li></ul></div>' +
      '</div></footer>';
  }

  /* ── Tema o complemento: índice lateral, etiquetas y navegación ── */
  function capitulo() {
    if (idxSec < 0) return;
    var c = SECUENCIA[idxSec];
    var art = document.querySelector(".articulo");
    if (art) {
      var palabras = (art.textContent || "").trim().split(/\s+/).length;
      var min = Math.max(3, Math.round(palabras / 200));
      document.querySelectorAll("[data-lectura]").forEach(function (el) { el.textContent = min + " min de lectura"; });
    }
    document.querySelectorAll("[data-cap-n]").forEach(function (el) { el.textContent = esCap ? "Tema " + (idxSec + 1) + " de " + CAPS.length : "Complemento"; });
    document.querySelectorAll("[data-bloque]").forEach(function (el) { el.textContent = esCap ? "Tema " + n2(idxSec) + " · " + BLOQUES[c.bloque] : "Complemento de la guía"; });
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
      lat.innerHTML =
        '<nav class="guia-lista" aria-label="Temas de la guía"><h2>La guía</h2><ol>' + SECUENCIA.map(function (x, i) {
          return '<li><a href="' + x.id + '.html"' + (x.id === pagina ? ' aria-current="page"' : '') + '><span class="n">' + (i < CAPS.length ? n2(i) : "+") + '</span><span>' + esc(x.t) + '</span></a></li>';
        }).join("") + '</ol></nav>' +
        (hs.length ? '<details class="en-pagina-cont" open><summary><h2>En esta página <span class="flecha">▾</span></h2></summary><nav class="en-pagina" aria-label="En esta página"><ul>' + hs.map(function (h) {
          var t = h.cloneNode(true); var an = t.querySelector(".ancla"); if (an) an.remove();
          return '<li><a href="#' + h.id + '" data-id="' + h.id + '">' + esc(t.textContent.trim()) + '</a></li>';
        }).join("") + '</ul></nav></details>' : '');
      if (window.matchMedia("(max-width: 1080px)").matches) { var d = lat.querySelector("details"); if (d) d.open = false; }
      if ("IntersectionObserver" in window && hs.length) {
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
    var nc = document.getElementById("nav-cap");
    if (nc) {
      var ant = SECUENCIA[idxSec - 1], sig = SECUENCIA[idxSec + 1];
      nc.className = "nav-cap";
      nc.innerHTML = (ant ? '<a class="ant" href="' + ant.id + '.html"><span>← Anterior</span><b>' + esc(ant.t) + '</b></a>' : '<a class="ant" href="index.html"><span>← Volver</span><b>Inicio</b></a>') +
        (sig ? '<a class="sig" href="' + sig.id + '.html"><span>Siguiente →</span><b>' + esc(sig.t) + '</b></a>' : '<a class="sig" href="recursos.html"><span>Para seguir →</span><b>Recursos y glosario</b></a>');
    }
    var ay = document.getElementById("ayuda-pie");
    if (ay) ay.innerHTML = '¿Encontraste un error o algo no se entiende? <a href="' + REPO + '/issues/new?title=' + encodeURIComponent(c.t) + '">Escríbelo en GitHub</a>. Toda contribución mejora la guía para quien venga después.';
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

  /* ── Botón para volver arriba ── */
  function arriba() {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn-arriba"; b.setAttribute("aria-label", "Volver al inicio de la página"); b.innerHTML = SVG.arriba;
    document.body.appendChild(b);
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" }); var s = document.querySelector(".saltar"); if (s) s.focus({ preventScroll: true }); });
    var pend = false;
    window.addEventListener("scroll", function () {
      if (pend) return; pend = true;
      requestAnimationFrame(function () { pend = false; b.classList.toggle("visible", window.scrollY > window.innerHeight * 1.4); });
    }, { passive: true });
  }

  /* ── Video liviano de YouTube y Vimeo ── */
  function videos() {
    document.querySelectorAll(".video[data-yt], .video[data-vimeo]").forEach(function (v) {
      var yt = v.getAttribute("data-yt"), vm = v.getAttribute("data-vimeo");
      var tit = v.getAttribute("data-titulo") || "Ver video", sub = v.getAttribute("data-sub") || "";
      var desde = v.getAttribute("data-desde");
      var portada = v.getAttribute("data-portada");
      var img = portada ? '<picture><source srcset="' + esc(portada) + '.webp" type="image/webp"><img src="' + esc(portada) + '.jpg" alt="" loading="lazy" decoding="async" width="1280" height="720"></picture>'
        : (yt ? '<img src="https://i.ytimg.com/vi/' + esc(yt) + '/hqdefault.jpg" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : '');
      v.innerHTML = '<button type="button" class="yt" aria-label="Reproducir video: ' + esc(tit) + '">' + img + '<span class="yt-play" aria-hidden="true"></span><span class="yt-tit">' + esc(tit) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></button>';
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

  /* ── Videos en bucle, con pausa y respeto por el movimiento reducido ── */
  function bucles() {
    document.querySelectorAll(".bucle video").forEach(function (vid) {
      var caja = vid.parentElement;
      var b = document.createElement("button"); b.type = "button"; b.className = "b-ctl";
      function marcar() { var p = vid.paused; b.textContent = p ? "▶ Reproducir" : "❚❚ Pausar"; b.setAttribute("aria-label", p ? "Reproducir animación" : "Pausar animación"); }
      b.addEventListener("click", function () { if (vid.paused) vid.play(); else vid.pause(); });
      vid.addEventListener("play", marcar); vid.addEventListener("pause", marcar);
      caja.appendChild(b);
      vid.muted = true; vid.setAttribute("playsinline", ""); vid.loop = true;
      if (quieto) { vid.removeAttribute("autoplay"); vid.pause(); marcar(); return; }
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (e) {
            if (e.isIntersecting) { if (!vid.dataset.pausadoUsuario) { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); } }
            else if (!vid.paused) vid.pause();
          });
        }, { threshold: .25 });
        io.observe(vid);
        b.addEventListener("click", function () { if (vid.paused) vid.dataset.pausadoUsuario = "1"; else delete vid.dataset.pausadoUsuario; });
      }
      marcar();
    });
  }

  /* ── Ampliar imágenes ── */
  function ampliar() {
    var imgs = document.querySelectorAll("figure.foto:not(.sin-zoom) img, figure.fig:not(.sin-zoom) img, figure.tema-hero-fig img");
    if (!imgs.length || typeof HTMLDialogElement === "undefined") return;
    var dlg = document.createElement("dialog"); dlg.className = "lightbox";
    dlg.innerHTML = '<button type="button" aria-label="Cerrar">×</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    dlg.querySelector("button").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    imgs.forEach(function (img) {
      if (img.closest(".deslizar")) return;
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

  /* ── Comparador antes y después ── */
  function comparadores() {
    document.querySelectorAll(".deslizar").forEach(function (c) {
      var r = c.querySelector("input[type=range]");
      if (!r) return;
      function act() { c.style.setProperty("--pos", r.value + "%"); }
      r.addEventListener("input", act); act();
    });
  }

  /* ── Burbuja compartida para citas y términos ── */
  var burbuja = null;
  function mostrar(el, html) {
    if (!burbuja) { burbuja = document.createElement("div"); burbuja.className = "burbuja"; burbuja.id = "burbuja"; burbuja.setAttribute("role", "tooltip"); document.body.appendChild(burbuja); }
    burbuja.innerHTML = html;
    var r = el.getBoundingClientRect();
    burbuja.style.left = "0px"; burbuja.style.top = "0px"; burbuja.classList.add("visible");
    var w = burbuja.offsetWidth, h = burbuja.offsetHeight;
    var x = Math.min(Math.max(12, r.left + window.scrollX + r.width / 2 - w / 2), window.scrollX + document.documentElement.clientWidth - w - 12);
    var y = r.top + window.scrollY - h - 10;
    if (r.top - h - 10 < 70) y = r.bottom + window.scrollY + 10;
    burbuja.style.left = x + "px"; burbuja.style.top = y + "px";
    el.setAttribute("aria-describedby", "burbuja");
  }
  function ocultar(el) { if (burbuja) burbuja.classList.remove("visible"); if (el) el.removeAttribute("aria-describedby"); }
  function citasYTerminos() {
    document.querySelectorAll("a.ref").forEach(function (a) {
      var id = (a.getAttribute("href") || "").replace("#", "");
      var li = id && document.getElementById(id);
      if (!li) return;
      a.setAttribute("aria-label", "Fuente " + a.textContent.trim());
      var txt = esc(li.textContent.trim().replace(/\s+/g, " "));
      a.addEventListener("mouseenter", function () { mostrar(a, txt); });
      a.addEventListener("focus", function () { mostrar(a, txt); });
      a.addEventListener("mouseleave", function () { ocultar(a); });
      a.addEventListener("blur", function () { ocultar(a); });
      a.addEventListener("click", function () { ocultar(a); li.classList.add("destacar"); setTimeout(function () { li.classList.remove("destacar"); }, 2400); });
    });
    document.querySelectorAll(".term[data-def]").forEach(function (t) {
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "0");
      var html = '<b>' + esc(t.getAttribute("data-t") || t.textContent.trim()) + '</b>' + esc(t.getAttribute("data-def"));
      t.addEventListener("mouseenter", function () { mostrar(t, html); });
      t.addEventListener("focus", function () { mostrar(t, html); });
      t.addEventListener("mouseleave", function () { ocultar(t); });
      t.addEventListener("blur", function () { ocultar(t); });
      t.addEventListener("click", function () { if (burbuja && burbuja.classList.contains("visible")) ocultar(t); else mostrar(t, html); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") ocultar(); });
    window.addEventListener("scroll", function () { ocultar(); }, { passive: true });
  }

  /* ── Buscador ── */
  function buscador() {
    var btn = document.getElementById("btn-buscar");
    if (!btn || typeof HTMLDialogElement === "undefined") { if (btn) btn.remove(); return; }
    var dlg = document.createElement("dialog"); dlg.className = "buscador"; dlg.setAttribute("aria-label", "Buscar en el sitio");
    dlg.innerHTML = '<div class="bus-cab">' + SVG.lupa + '<input type="search" placeholder="Busca un tema, una cifra o un concepto" aria-label="Buscar" autocomplete="off"><button type="button" class="btn-icono" aria-label="Cerrar buscador">' + SVG.cerrar + '</button></div>' +
      '<ul class="bus-res" role="list"></ul><div class="bus-pie"><span>Enter abre el primer resultado</span><span>Esc cierra</span><span>Prueba con: odometría, A estrella, costo, fronteras</span></div>';
    document.body.appendChild(dlg);
    var input = dlg.querySelector("input"), lista = dlg.querySelector(".bus-res");
    var indice = null, cargando = false;
    function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function cargar(cb) {
      if (indice) { cb(); return; }
      if (window.INDICE) { indice = window.INDICE; cb(); return; }
      if (cargando) return; cargando = true;
      var s = document.createElement("script"); s.src = "datos/indice.js";
      s.onload = function () { indice = window.INDICE || []; cb(); };
      s.onerror = function () { lista.innerHTML = '<li class="bus-vacio">No se pudo cargar el índice de búsqueda.</li>'; };
      document.head.appendChild(s);
    }
    function marcarTxt(txt, palabras) {
      var t = esc(txt);
      palabras.forEach(function (p) {
        if (p.length < 3) return;
        var re = new RegExp("(" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
        t = t.replace(re, "<mark>$1</mark>");
      });
      return t;
    }
    function buscar() {
      var q = norm(input.value.trim());
      if (!q) { lista.innerHTML = '<li class="bus-vacio">Escribe al menos una palabra.</li>'; return; }
      var ps = q.split(/\s+/).filter(Boolean);
      var res = indice.map(function (e) {
        var tt = norm(e.t), tx = norm(e.x), puntos = 0;
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i], enT = tt.indexOf(p) >= 0, enX = tx.indexOf(p) >= 0;
          if (!enT && !enX) return null;
          puntos += (enT ? 10 : 0) + (enX ? 2 : 0);
        }
        return { e: e, p: puntos };
      }).filter(Boolean).sort(function (a, b) { return b.p - a.p; }).slice(0, 14);
      if (!res.length) { lista.innerHTML = '<li class="bus-vacio">Sin resultados para «' + esc(input.value) + '». Revisa el <a href="recursos.html#glosario">glosario</a>.</li>'; return; }
      var crudas = input.value.trim().split(/\s+/);
      lista.innerHTML = res.map(function (r, i) {
        var e = r.e, x = e.x, pos = norm(x).indexOf(ps[0]);
        var ini = Math.max(0, pos - 60), frag = (ini > 0 ? "…" : "") + x.slice(ini, ini + 170) + (x.length > ini + 170 ? "…" : "");
        return '<li><a href="' + esc(e.u) + '"' + (i === 0 ? ' class="sel"' : '') + '><small>' + esc(e.p) + '</small><b>' + marcarTxt(e.t, crudas) + '</b><span>' + marcarTxt(frag, crudas) + '</span></a></li>';
      }).join("");
    }
    function abrir() { cargar(function () { buscar(); }); dlg.showModal(); input.focus(); input.select(); }
    btn.addEventListener("click", abrir);
    dlg.querySelector(".bus-cab button").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    var t = null;
    input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { if (indice) buscar(); }, 90); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); dlg.close(); btn.focus(); return; }
      if (e.key === "Enter") { var a = lista.querySelector("a"); if (a) { e.preventDefault(); location.href = a.getAttribute("href"); dlg.close(); } }
      if (e.key === "ArrowDown") { var f = lista.querySelector("a"); if (f) { e.preventDefault(); f.focus(); } }
    });
    lista.addEventListener("keydown", function (e) {
      var as = Array.prototype.slice.call(lista.querySelectorAll("a")), i = as.indexOf(document.activeElement);
      if (e.key === "ArrowDown" && i < as.length - 1) { e.preventDefault(); as[i + 1].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); if (i > 0) as[i - 1].focus(); else input.focus(); }
    });
    lista.addEventListener("click", function (e) { if (e.target.closest("a")) dlg.close(); });
    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag) && !dlg.open) { e.preventDefault(); abrir(); }
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
    /* Se montan con holgura, antes de que el lector llegue, para que el texto no salte al crecer cada interactivo. */
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { montar(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "1200px 0px" });
    els.forEach(function (el) { io.observe(el); });
    /* En un enlace a una sección, se montan primero los interactivos anteriores y luego se vuelve al destino. */
    function alDestino() {
      if (!location.hash) return;
      var dest = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!dest) return;
      var antes = Array.prototype.filter.call(els, function (el) { return !el.getAttribute("data-montado") && (el.compareDocumentPosition(dest) & 4); });
      if (!antes.length) return;
      antes.forEach(function (el) { montar(el); io.unobserve(el); });
      requestAnimationFrame(function () { dest.scrollIntoView({ block: "start" }); });
    }
    alDestino();
    window.addEventListener("hashchange", alDestino);
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
    cabecera(); pie(); capitulo(); progreso(); arriba(); videos(); bucles(); ampliar(); comparadores(); citasYTerminos(); buscador(); etapas(); interactivos(); destacarHash();
    document.documentElement.classList.add("js");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
  window.SITIO.quieto = quieto;
})();
