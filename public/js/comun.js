/* Utilidades compartidas por la página y los diagramas */
(function () {
  "use strict";
  var U = {};
  U.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  U.fmt = function (v, dec) {
    if (dec == null) dec = 1;
    var f = Math.pow(10, dec);
    return (Math.round(v * f + 1e-9) / f).toFixed(dec).replace(".", ",");
  };
  U.quieto = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  /* Preferencia de movimiento reducido, con aviso cuando cambia. fn recibe true si ahora se pide menos movimiento.
     addListener cubre Safari anterior a la versión 14, donde MediaQueryList no tiene addEventListener. */
  U.alCambiarMovimiento = function (fn) {
    if (!window.matchMedia) return;
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var f = function () { fn(mq.matches); };
    if (mq.addEventListener) mq.addEventListener("change", f); else if (mq.addListener) mq.addListener(f);
  };
  /* Redibujo al cambiar el ancho del contenedor: una sola lista y un solo oyente de resize.
     Las entradas cuyo elemento ya no está en la página se descartan al repintar. */
  var anchos = [];
  U.alAncho = function (el, fn) {
    anchos.push({ el: el, fn: fn, w: el.clientWidth });
  };
  var t = null;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      anchos = anchos.filter(function (o) { return o.el.isConnected !== false; });
      anchos.forEach(function (o) {
        var w = o.el.clientWidth;
        if (Math.abs(w - o.w) > 8) { o.w = w; o.fn(); }
      });
    }, 120);
  });
  /* Ayudas de marcado que comparten los interactivos. Todo texto que entra en el HTML se escapa. */
  /* aria-pressed en los botones que llevan attr: true solo en el que vale valor */
  U.marcar = function (el, attr, valor) {
    el.querySelectorAll("[" + attr + "]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute(attr) === String(valor))); });
  };
  /* grupo de chips; items son pares [valor, rótulo] */
  U.chips = function (items, attr, actual, titulo) {
    return '<div class="chips" role="group" aria-label="' + U.esc(titulo) + '">' + items.map(function (x) {
      return '<button type="button" class="chip" ' + attr + '="' + U.esc(x[0]) + '" aria-pressed="' + (String(x[0]) === String(actual)) + '">' + U.esc(x[1]) + '</button>';
    }).join("") + '</div>';
  };
  /* tarjetas de datos; items son [rótulo, valor, nota]. Un cuarto elemento "t" marca un valor de texto,
     que no usa la tipografía de cifras. Los textos ya traen su marcado y no se escapan. */
  U.tarjetas = function (items) {
    return items.map(function (x) { return '<div><span>' + x[0] + '</span><b' + (x[3] === "t" ? '' : ' class="num"') + '>' + x[1] + '</b><small>' + (x[2] || "") + '</small></div>'; }).join("");
  };
  /* animación simple de 0 a 1 */
  U.animar = function (ms, cada, fin) {
    if (U.quieto()) { cada(1); if (fin) fin(); return function () {}; }
    var t0 = null, vivo = true;
    function paso(ts) {
      if (!vivo) return;
      if (t0 == null) t0 = ts;
      var k = Math.min(1, (ts - t0) / ms);
      cada(k);
      if (k < 1) requestAnimationFrame(paso); else if (fin) fin();
    }
    requestAnimationFrame(paso);
    return function () { vivo = false; };
  };
  /* Iconos de cumple y no cumple. Viven aquí porque los usan interactivos de archivos distintos,
     y cada página carga solo los archivos de los interactivos que contiene. */
  U.ICO = {
    OK: '<svg class="ph ico ok" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity=".2"/><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>',
    NO: '<svg class="ph ico no" viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity=".2"/><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>'
  };
  /* Planta del robot real, la misma en todas las figuras, con las medidas del CAD del prototipo. La cubierta es una U
     de 0,23 m de ancho: borde recto atrás, curva adelante y el LiDAR en la parte curva. Desde el centro de giro, en el
     eje de las ruedas, llega 0,195 m hacia adelante y 0,055 m hacia atrás; el centro del LiDAR queda 0,115 m adelante. */
  var CU = { r: 0.115, atras: -0.055, curva: 0.08, lidar: 0.115, lidarR: 0.035 };
  CU.frente = CU.curva + CU.r;
  var ANCLA = { giro: 0, centro: (CU.atras + CU.frente) / 2, lidar: CU.lidar };
  /* (x, y) es el ancla en px, th el rumbo en la pantalla (0 hacia la derecha, creciendo en el sentido del
     reloj) y k los px por metro. El ancla es el centro de giro, el centro del cuerpo o el LiDAR. */
  function aPantalla(x, y, th, k, ancla) {
    var d = ANCLA[ancla || "giro"], c = Math.cos(th), s = Math.sin(th);
    return function (u, v) { u -= d; return [x + (u * c - v * s) * k, y + (u * s + v * c) * k]; };
  }
  U.robot = {
    medidas: CU,
    svg: function (x, y, th, k, ancla) {
      var P = aPantalla(x, y, th, k, ancla), r = (CU.r * k).toFixed(2);
      var f = function (p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); };
      return {
        cuerpo: "M" + f(P(CU.atras, -CU.r)) + "L" + f(P(CU.curva, -CU.r)) + "A" + r + " " + r + " 0 0 1 " + f(P(CU.curva, CU.r)) + "L" + f(P(CU.atras, CU.r)) + "Z",
        lidar: P(CU.lidar, 0), lidarR: CU.lidarR * k
      };
    },
    /* deja el contorno como trazado actual del contexto, y quien llama elige relleno y borde */
    canvas: function (ctx, x, y, th, k, ancla) {
      var d = ANCLA[ancla || "giro"];
      ctx.save(); ctx.translate(x, y); ctx.rotate(th); ctx.translate(-d * k, 0);
      ctx.beginPath(); ctx.moveTo(CU.atras * k, -CU.r * k); ctx.lineTo(CU.curva * k, -CU.r * k);
      ctx.arc(CU.curva * k, 0, CU.r * k, -Math.PI / 2, Math.PI / 2, false);
      ctx.lineTo(CU.atras * k, CU.r * k); ctx.closePath();
      ctx.restore();
      return { lidar: aPantalla(x, y, th, k, ancla)(CU.lidar, 0), lidarR: CU.lidarR * k };
    },
    /* ícono para las leyendas, mirando a la derecha */
    icono: function (clase) {
      var g = U.robot.svg(0, 13, 0, 100, "giro");
      return '<svg class="ley-robot' + (clase ? " " + clase : "") + '" viewBox="-6 1 26 24" aria-hidden="true"><path d="' + g.cuerpo + '"/><circle cx="' + g.lidar[0].toFixed(1) + '" cy="' + g.lidar[1].toFixed(1) + '" r="' + g.lidarR.toFixed(1) + '"/></svg>';
    }
  };
  /* Kit de lienzo compartido por las simulaciones (todos los módulos interactivos). Vive aquí porque
     cada página carga solo los módulos que usa, y así no se copia en cada uno. */
  /* utilidades de color y lienzo */
  function css(nombre, el) { return getComputedStyle(el || document.documentElement).getPropertyValue(nombre).trim() || "#888"; }
  function rgba(hex, a) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(hex, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  /* Los colores salen de las variables CSS del elemento, que cambian con el tema. Un contenedor con
     data-paleta="oscura" redefine esas variables y se dibuja como en el tema oscuro en cualquier tema. */
  function paleta(el) {
    var c = function (n) { return css(n, el); };
    return {
      bg: c("--bg"), sup: c("--surface"), sup2: c("--surface-2"), linea: c("--line"), linea2: c("--line-2"),
      ink: c("--ink"), muted: c("--muted"), azul: c("--azul"), verde: c("--verde-texto"), verdeV: c("--verde"),
      rojo: c("--rojo"), ambar: c("--ambar"), violeta: c("--violeta"), desc: c("--desc"), obst: c("--obst"),
      s1: c("--s1"), s2: c("--s2"), s3: c("--s3"), s4: c("--s4"), ruta: c("--ruta"),
      oscuro: !!(el && el.closest && el.closest('[data-paleta="oscura"]')) || document.documentElement.getAttribute("data-theme") === "dark" ||
        (document.documentElement.getAttribute("data-theme") !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    };
  }
  /* crea un canvas nítido en pantallas de alta densidad y lo redimensiona con su contenedor.
     proporcion puede ser un número (ancho/alto) o una función del ancho, para dar más alto en un teléfono. */
  function lienzo(padre, proporcion, alDimensionar) {
    var cv = document.createElement("canvas");
    cv.className = "lienzo";
    padre.appendChild(cv);
    var ctx = cv.getContext("2d"), o = { cv: cv, ctx: ctx, w: 0, h: 0 }, listo = false;
    function medir() {
      var w = Math.max(260, Math.round(padre.clientWidth || cv.parentNode.clientWidth || 600));
      var h = Math.round(w / (typeof proporcion === "function" ? proporcion(w) : proporcion));
      if (w === o.w && h === o.h) return;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.aspectRatio = w + " / " + h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.w = w; o.h = h;
      if (listo && alDimensionar) alDimensionar();
    }
    o.medir = medir;
    medir();
    listo = true;
    if ("ResizeObserver" in window) new ResizeObserver(function () { medir(); }).observe(padre);
    return o;
  }
  function alTema(fn) { document.addEventListener("temacambio", function () { setTimeout(fn, 30); }); }
  function limitar(v, a, b) { return Math.max(a, Math.min(b, v)); }
  /* bucle que corre solo cuando el elemento está a la vista y la pestaña está visible.
     El primer cuadro después de arrancar o de volver a la vista entrega dt = 0, para no saltar. */
  function bucle(el, paso) {
    var activo = false, enVista = true, pestana = !document.hidden, ult = 0, id = 0;
    function puede() { return activo && enVista && pestana; }
    function tick(ts) {
      if (!puede()) { id = 0; return; }
      var dt = ult ? Math.min(0.1, Math.max(0, (ts - ult) / 1000)) : 0;
      ult = ts;
      paso(dt);
      id = requestAnimationFrame(tick);
    }
    function arrancar() { if (!id && puede()) { ult = 0; id = requestAnimationFrame(tick); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { enVista = es[es.length - 1].isIntersecting; arrancar(); }, { threshold: 0.05 }).observe(el);
    }
    document.addEventListener("visibilitychange", function () { pestana = !document.hidden; arrancar(); });
    /* si se pide movimiento reducido con el bucle en marcha, se pausa solo. Volver a arrancarlo queda a cargo de quien lo usa. */
    U.alCambiarMovimiento(function (reducido) { if (reducido) { activo = false; if (id) { cancelAnimationFrame(id); id = 0; } } });
    return {
      play: function () { activo = true; arrancar(); },
      pausa: function () { activo = false; if (id) { cancelAnimationFrame(id); id = 0; } },
      get activo() { return activo; }
    };
  }
  U.css = css; U.rgba = rgba; U.paleta = paleta; U.lienzo = lienzo; U.alTema = alTema; U.limitar = limitar; U.bucle = bucle;
  /* El robot en una rejilla SVG: la planta en U centrada en su celda y mirando a la derecha. */
  U.robot.celda = function (cx, cy, T) {
    var g = U.robot.svg(cx, cy, 0, T * 1.15 / (2 * U.robot.medidas.r), "centro");
    return '<g class="robot-planta verde"><path class="cuerpo" d="' + g.cuerpo + '"/><circle class="lidar" cx="' + g.lidar[0].toFixed(2) + '" cy="' + g.lidar[1].toFixed(2) + '" r="' + g.lidarR.toFixed(2) + '"/></g>';
  };
  /* Reto de elegir una respuesta con radios nativos y respuesta inmediata. preguntas: [{pregunta, opciones:[{texto}]}],
     evaluar(i, j) devuelve { ok, porque, enlace, enlaceTexto } o null. La lógica de cada reto vive en su módulo. */
  U.reto = function (el, preguntas, prefijo, evaluar) {
    var hechas = {};
    el.innerHTML = '<div class="mp-reto">' + preguntas.map(function (q, i) {
      return '<fieldset class="mp-reto-q"><legend>Pregunta ' + (i + 1) + '. ' + U.esc(q.pregunta) + '</legend>' +
        q.opciones.map(function (o, j) { return '<label><input type="radio" name="' + prefijo + i + '" value="' + j + '"><span>' + U.esc(o.texto) + '</span></label>'; }).join("") +
        '<p class="mp-reto-r" data-reto-r="' + i + '" role="status" aria-live="polite"></p></fieldset>';
    }).join("") + '<p class="mp-reto-fin" data-reto-fin role="status" aria-live="polite"></p></div>';
    el.addEventListener("change", function (e) {
      var t = e.target;
      if (!t.matches || !t.matches('input[type="radio"]')) return;
      var i = +t.name.slice(prefijo.length), r = evaluar(i, +t.value);
      if (!r) return;
      var box = el.querySelector('[data-reto-r="' + i + '"]');
      box.setAttribute("data-ok", String(r.ok));
      box.innerHTML = '<b>' + (r.ok ? "Correcto." : "Todavía no.") + '</b> ' + U.esc(r.porque) + ' <a href="' + r.enlace + '">' + U.esc(r.enlaceTexto) + '</a>';
      hechas[i] = r.ok;
      var bien = preguntas.filter(function (_, k) { return hechas[k]; }).length;
      el.querySelector("[data-reto-fin]").textContent = Object.keys(hechas).length === preguntas.length ? "Reto: " + bien + " de " + preguntas.length + " correctas. Puedes cambiar una respuesta." : "";
    });
    el.estadoSim = function () { return { respondidas: hechas }; };
  };
  window.U = U;
  window.VISUALES = window.VISUALES || {};
})();
