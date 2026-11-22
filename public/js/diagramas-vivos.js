/* Diagramas animados de la guía: el ciclo del robot, el flujo de datos de Nav2 y las conexiones de energía y señales.
   Los datos están en js/diagramas-vivos-datos.js. Aquí solo se dibujan y se mueven.
   Cada diagrama tiene una vista ancha y otra angosta (vertical) según el ancho de su contenedor. El movimiento corre
   con U.bucle, que lo detiene fuera de pantalla y con la pestaña oculta. Con movimiento reducido todo queda quieto y
   se ve el paso completo. */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  var NS = "http://www.w3.org/2000/svg";
  var ANGOSTO = 700;

  var CSS = [
    ".dv { display: grid; gap: 12px; min-width: 0; }",
    ".dv-lienzo { display: flex; justify-content: center; min-width: 0; }",
    ".dv-svg { display: block; width: 100%; height: auto; }",
    ".dv-svg.dv-angosta { max-width: 460px; }",
    ".dv-pasos { gap: 6px; }",
    ".dv-nodo, .dv-etapa { cursor: pointer; }",
    ".dv-nodo:focus, .dv-etapa:focus { outline: none; }",
    ".dv-nodo .caja, .dv-etapa .caja { fill: var(--nf); stroke: var(--nc); stroke-width: 1.5; }",
    ".dv-nodo:hover .caja, .dv-etapa:hover .caja { stroke-width: 3; }",
    ".dv-nodo:active .caja, .dv-etapa:active .caja { stroke-width: 4.5; }",
    ".dv-nodo.toca .caja, .dv-etapa.act .caja { stroke-width: 3; }",
    ".dv-nodo[aria-pressed=\"true\"] .caja, .dv-etapa[aria-pressed=\"true\"] .caja { stroke-width: 4; }",
    ".dv-nodo .foco, .dv-etapa .foco { fill: none; stroke: var(--foco); stroke-width: 3; opacity: 0; pointer-events: none; }",
    ".dv-nodo:focus-visible .foco, .dv-etapa:focus-visible .foco { opacity: 1; }",
    ".dv-nodo text, .dv-etapa text { fill: var(--ink); font-family: var(--marco-titulo); font-weight: 600; pointer-events: none; user-select: none; }",
    ".dv-etapa .ico { stroke: var(--nc); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }",
    ".dv-ar .l { fill: none; stroke: var(--muted); stroke-width: 1.25; stroke-linejoin: round; }",
    ".dv-ar .p { fill: var(--muted); }",
    ".dv-ar.paso .l { stroke: var(--dv-color); stroke-width: 2; stroke-dasharray: 2 5; stroke-linecap: round; }",
    ".dv-ar.paso .p { fill: var(--dv-color); }",
    ".dv-ar.llega .l { stroke: var(--dv-color); stroke-width: 3.5; stroke-dasharray: none; }",
    ".dv-ar.llega .p { fill: var(--dv-color); }",
    ".dv-rombo .dv-ar.llega .l { stroke-dasharray: 9 5; }",
    ".dv-ar .t { opacity: 0; fill: var(--ink); font-family: var(--marco-titulo); font-weight: 600; paint-order: stroke; stroke: var(--paper); stroke-width: 5px; stroke-linejoin: round; pointer-events: none; }",
    ".dv-ar.llega .t { opacity: 1; }",
    ".dv-pq { fill: var(--dv-color); stroke: var(--paper); stroke-width: 1.5; }",
    ".dv-fondo { fill: none; stroke: var(--line-2); stroke-width: 1.5; stroke-dasharray: 4 5; }",
    ".dv-lazo { fill: none; stroke: var(--muted); stroke-width: 1.25; }",
    ".dv-lazo-p { fill: var(--muted); }",
    ".dv-anillo { fill: none; stroke: var(--c-azul); stroke-width: 2; stroke-dasharray: 3 5; }",
    ".dv-anillo-t { fill: var(--ink); font-family: var(--marco-titulo); font-weight: 600; text-anchor: middle; }",
    ".dv-rotulo { fill: var(--muted); font-family: var(--marco-titulo); font-weight: 600; text-anchor: middle; }",
    ".dv-token { fill: var(--ink); stroke: var(--paper); stroke-width: 2; }",
    ".dv-token-in { fill: var(--c-azul); stroke: var(--paper); stroke-width: 1.5; }",
    ".dv-info { padding: 10px 12px; border: 1px solid var(--line); border-left: 3px solid var(--dv-color, var(--tema)); background: var(--surface); display: grid; gap: 6px; min-height: 4.2em; }",
    ".dv-info p { margin: 0; font-size: var(--t-sm); max-width: none; }",
    ".dv-info .dv-nodo-info:empty { display: none; }",
    ".dv-leyenda { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 0; padding: 0; list-style: none; font-size: var(--t-xs); color: var(--muted); }",
    ".dv-leyenda li { display: inline-flex; align-items: center; gap: 6px; }",
    ".dv-leyenda i { width: 14px; height: 14px; border: 2px solid var(--nc); background: var(--nf); display: inline-block; }"
  ].join("\n");

  function estilos() {
    if (document.getElementById("dv-css")) return;
    var st = document.createElement("style");
    st.id = "dv-css"; st.textContent = CSS;
    document.head.appendChild(st);
  }
  var esperan = null;
  function datos(listo, fallo) {
    if (window.DIAGRAMAS_VIVOS) { listo(window.DIAGRAMAS_VIVOS); return; }
    if (esperan) { esperan.push([listo, fallo]); return; }
    esperan = [[listo, fallo]];
    var sc = document.createElement("script");
    sc.src = "js/diagramas-vivos-datos.js";
    sc.onload = function () { var l = esperan; esperan = null; l.forEach(function (f) { f[0](window.DIAGRAMAS_VIVOS); }); };
    sc.onerror = function () { sc.remove(); var l = esperan; esperan = null; l.forEach(function (f) { f[1](); }); };
    document.head.appendChild(sc);
  }

  function S(padre, tag, attrs, texto) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (texto != null) e.textContent = texto;
    if (padre) padre.appendChild(e);
    return e;
  }
  function vistaPara(el) { return el.clientWidth && el.clientWidth < ANGOSTO ? "angosta" : "ancha"; }
  function f1(n) { return Math.round(n * 10) / 10; }

  /* Recorta una ruta para que empiece en el borde del nodo de origen y termine en el del destino. */
  function salida(pts, c, w, h, hueco) {
    var hx = w / 2 + hueco, hy = h / 2 + hueco;
    for (var i = 0; i < pts.length - 1; i++) {
      var p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], t = Infinity;
      if (dx > 0) t = Math.min(t, (c[0] + hx - p[0]) / dx); else if (dx < 0) t = Math.min(t, (c[0] - hx - p[0]) / dx);
      if (dy > 0) t = Math.min(t, (c[1] + hy - p[1]) / dy); else if (dy < 0) t = Math.min(t, (c[1] - hy - p[1]) / dy);
      if (t <= 1) { return [[p[0] + dx * t, p[1] + dy * t]].concat(pts.slice(i + 1)); }
    }
    return pts;
  }
  function recortar(pts, cA, cB, w, h) {
    var a = salida(pts, cA, w, h, 1);
    var b = salida(a.slice().reverse(), cB, w, h, 3).reverse();
    return b;
  }
  function trazo(pts) { return "M" + pts.map(function (p) { return f1(p[0]) + " " + f1(p[1]); }).join(" L"); }
  function punta(pts, tam) {
    var p = pts[pts.length - 1], q = pts[pts.length - 2], dx = p[0] - q[0], dy = p[1] - q[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= l; dy /= l;
    var bx = p[0] - dx * tam, by = p[1] - dy * tam, nx = -dy * tam * 0.5, ny = dx * tam * 0.5;
    return "M" + f1(p[0]) + " " + f1(p[1]) + " L" + f1(bx + nx) + " " + f1(by + ny) + " L" + f1(bx - nx) + " " + f1(by - ny) + " Z";
  }

  /* Pictogramas propios en una rejilla de 24, sin relleno, con el color de la etapa. */
  var ICONOS = {
    percibir: '<circle cx="12" cy="12" r="2"/><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 7.5a6.4 6.4 0 0 1 0 9M4.5 4.5a10.6 10.6 0 0 0 0 15M19.5 4.5a10.6 10.6 0 0 1 0 15"/>',
    estimar: '<path d="M12 21s-6-5.6-6-10.5a6 6 0 0 1 12 0C18 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/>',
    decidir: '<path d="M12 21v-8M12 13L6.5 6.5M12 13l5.5-6.5M6.5 6.5h4M6.5 6.5v4M17.5 6.5h-4M17.5 6.5v4"/>',
    moverse: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4v6M12 14v6M4 12h6M14 12h6"/>'
  };

  function alActivar(g, fn) {
    g.addEventListener("click", fn);
    g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
  }
  function fallar(el) { el.dispatchEvent(new CustomEvent("dv:fallo")); }

  /* Botón de pausa común. Devuelve funciones para actualizar su texto. */
  function textoPausa(b, pausado, sel) {
    b.textContent = sel ? "Seguir el recorrido" : (pausado ? "Reanudar movimiento" : "Pausar movimiento");
    b.setAttribute("aria-pressed", String(pausado || !!sel));
  }

  /* ---------------------------------------------------------------- Flujos con aristas (Nav2 y conexiones) */
  function montarFlujo(el, cfg) {
    var D = cfg.D, N = {}, A = {};
    D.nodos.forEach(function (n) { N[n.id] = n; });
    D.aristas.forEach(function (a) { A[a.id] = a; });
    var resp = el.querySelector(".vis-fallback");
    var respaldo = resp ? resp.textContent : "";
    var SD = 0.9, ESPERA = 0.9;
    var est = { i: 0, sel: null, pausa: false, t: 0, k: Infinity, vista: null };
    var refs = null, paquetes = [];
    var botones = D.pasos.map(function (p, i) {
      return '<button type="button" class="vbtn sec" data-i="' + i + '" aria-pressed="' + (i === 0) + '">' + U.esc(cfg.rotulo(p, i)) + '</button>';
    }).join("");
    var leyenda = cfg.leyenda.map(function (l) { return '<li style="--nc:var(--c-' + l[0] + ');--nf:var(--c-' + l[0] + '-fondo)"><i></i>' + U.esc(l[1]) + '</li>'; }).join("");
    el.innerHTML = '<div class="dv ' + cfg.clase + '">' +
      '<div class="vctl dv-pasos" role="group" aria-label="' + U.esc(cfg.grupo) + '">' + botones + '</div>' +
      '<div class="vctl"><button type="button" class="vbtn dv-pausa" aria-pressed="false">Pausar movimiento</button>' + (cfg.extra || "") + '<span class="vestado dv-rm" hidden>Tu sistema pide menos movimiento: el diagrama se muestra quieto.</span></div>' +
      '<div class="dv-lienzo"></div>' +
      '<div class="dv-info" aria-live="polite"><p class="dv-paso"></p><p class="dv-nodo-info"></p></div>' +
      '<ul class="dv-leyenda" aria-label="Colores de los nodos">' + leyenda + '</ul>' +
      '<p class="vnota">' + cfg.nota + '</p>' +
      '<p class="vis-fallback">' + U.esc(respaldo) + '</p></div>';
    var raiz = el.querySelector(".dv"), lienzo = el.querySelector(".dv-lienzo"), pausaB = el.querySelector(".dv-pausa");
    var infoPaso = el.querySelector(".dv-paso"), infoNodo = el.querySelector(".dv-nodo-info"), avisoRM = el.querySelector(".dv-rm");
    var pasos = el.querySelectorAll(".dv-pasos .vbtn");

    function estatico() { return U.quieto() || est.pausa; }

    function dibujar(clave) {
      var vi = D.vistas[clave], w = vi.nodo[0], h = vi.nodo[1];
      est.vista = clave;
      lienzo.innerHTML = "";
      var svg = S(lienzo, "svg", { "class": "dv-svg dv-" + clave, viewBox: "0 0 " + vi.vb[0] + " " + vi.vb[1], role: "group", "aria-label": cfg.aria, focusable: "false" });
      S(svg, "title", {}, cfg.titulo);
      var gA = S(svg, "g", {}), gN = S(svg, "g", {}), gP = S(svg, "g", {});
      refs = { aristas: {}, nodos: {}, gP: gP };
      D.aristas.forEach(function (a) {
        var pts = recortar(vi.rutas[a.id], vi.pos[a.de], vi.pos[a.a], w, h);
        var g = S(gA, "g", { "class": "dv-ar", "data-id": a.id });
        var path = S(g, "path", { "class": "l", d: trazo(pts) });
        S(g, "path", { "class": "p", d: punta(pts, 9) });
        var lab = vi.etiquetas && vi.etiquetas[a.id];
        if (lab) S(g, "text", { "class": "t", x: lab[0], y: lab[1], "text-anchor": lab[2], "font-size": vi.fs - 0.5 }, a.t);
        refs.aristas[a.id] = { g: g, path: path };
      });
      D.nodos.forEach(function (n) {
        var c = vi.pos[n.id], col = cfg.color[n.tipo];
        var g = S(gN, "g", { "class": "dv-nodo", tabindex: "0", role: "button", "aria-pressed": String(est.sel === n.id), "aria-label": n.t, style: "--nc:var(--c-" + col + ");--nf:var(--c-" + col + "-fondo)" });
        S(g, "rect", { "class": "caja", x: c[0] - w / 2, y: c[1] - h / 2, width: w, height: h, rx: 6 });
        S(g, "rect", { "class": "foco", x: c[0] - w / 2 - 4, y: c[1] - h / 2 - 4, width: w + 8, height: h + 8, rx: 9 });
        S(g, "text", { x: c[0], y: c[1], "text-anchor": "middle", "dominant-baseline": "central", "font-size": vi.fs }, n.t);
        alActivar(g, function () { elegirNodo(n.id); });
        refs.nodos[n.id] = g;
      });
      pintar();
    }

    function clases() {
      var item = D.pasos[est.i], etapaDe = {}, tocan = {};
      item.etapas.forEach(function (et, k) { et.forEach(function (id) { etapaDe[id] = k; }); });
      D.aristas.forEach(function (a) {
        var r = refs.aristas[a.id], k = etapaDe[a.id], enItem = k !== undefined, llega = enItem && k <= est.k;
        r.g.classList.toggle("paso", enItem);
        r.g.classList.toggle("llega", llega);
        if (llega) { tocan[a.de] = 1; tocan[a.a] = 1; }
      });
      D.nodos.forEach(function (n) { refs.nodos[n.id].classList.toggle("toca", !!tocan[n.id]); });
    }
    function pintar() {
      var item = D.pasos[est.i];
      raiz.style.setProperty("--dv-color", "var(--c-" + item.color + ")");
      raiz.classList.toggle("dv-rombo", item.paquete === "rombo");
      clases();
      refs.gP.textContent = "";
      paquetes = [];
      if (!U.quieto()) item.etapas.forEach(function (et, k) {
        et.forEach(function (id) {
          var r = refs.aristas[id], len = r.path.getTotalLength ? r.path.getTotalLength() : 0, rombo = item.paquete === "rombo";
          var forma = function () { return rombo ? S(refs.gP, "rect", { "class": "dv-pq", width: 9, height: 9, x: -4.5, y: -4.5, opacity: 0 }) : S(refs.gP, "circle", { "class": "dv-pq", r: 5, opacity: 0 }); };
          paquetes.push({ k: k, path: r.path, len: len, a: forma(), b: forma(), rombo: rombo });
        });
      });
      infoPaso.innerHTML = '<b>' + U.esc(cfg.tituloPaso(item, est.i)) + '</b> ' + U.esc(item.texto);
      pasos.forEach(function (b, j) { b.setAttribute("aria-pressed", String(j === est.i)); });
    }

    function mover(p, e2, f) {
      if (f < 0 || f > 1 || !p.len) { e2.setAttribute("opacity", "0"); return; }
      var pt = p.path.getPointAtLength(p.len * f);
      e2.setAttribute("transform", "translate(" + f1(pt.x) + " " + f1(pt.y) + ")" + (p.rombo ? " rotate(45)" : ""));
      e2.setAttribute("opacity", "1");
    }
    function avance(dt) {
      var n = D.pasos[est.i].etapas.length, total = n * SD + ESPERA;
      est.t += dt;
      if (est.t >= total) est.t -= total;
      var k = Math.min(n, Math.floor(est.t / SD));
      if (k !== est.k) { est.k = k; clases(); }
      paquetes.forEach(function (p) {
        var f = k === p.k ? (est.t - p.k * SD) / SD : -1;
        mover(p, p.a, f);
        mover(p, p.b, f - 0.14);
        if (f - 0.14 >= 0 && f - 0.14 <= 1) p.b.setAttribute("opacity", "0.55");
      });
    }

    var bucle = U.bucle(lienzo, avance);
    function reiniciar() {
      est.t = 0;
      est.k = estatico() ? Infinity : -1;
    }
    function elegirPaso(i) {
      est.i = i;
      reiniciar();
      pintar();
    }
    function elegirNodo(id) {
      est.sel = id;
      Object.keys(refs.nodos).forEach(function (k) { refs.nodos[k].setAttribute("aria-pressed", String(k === id)); });
      infoNodo.innerHTML = '<b>' + U.esc(N[id].t) + '.</b> ' + U.esc(N[id].d);
    }
    pasos.forEach(function (b) { b.addEventListener("click", function () { elegirPaso(+b.getAttribute("data-i")); }); });
    pausaB.addEventListener("click", function () {
      est.pausa = !est.pausa;
      textoPausa(pausaB, est.pausa);
      if (est.pausa) { bucle.pausa(); } else { reiniciar(); pintar(); bucle.play(); }
    });
    function ajustarMovimiento() {
      var rm = U.quieto();
      pausaB.hidden = rm; avisoRM.hidden = !rm;
      if (rm) { bucle.pausa(); est.k = Infinity; if (refs) pintar(); }
    }
    U.alCambiarMovimiento(function (rm) {
      if (rm) ajustarMovimiento();
      else { est.pausa = false; textoPausa(pausaB, false); pausaB.hidden = false; avisoRM.hidden = true; reiniciar(); if (refs) pintar(); bucle.play(); }
    });
    U.alAncho(el, function () { var v = vistaPara(el); if (v !== est.vista) dibujar(v); });

    est.k = U.quieto() ? Infinity : -1;
    dibujar(vistaPara(el));
    ajustarMovimiento();
    if (!U.quieto()) bucle.play();
    el.estadoDiagrama = function () {
      return { vista: est.vista, paso: est.i, etapa: est.k, pausado: est.pausa, nodo: est.sel, paquetes: paquetes.length, llegan: lienzo.querySelectorAll(".dv-ar.llega").length, enPaso: lienzo.querySelectorAll(".dv-ar.paso").length };
    };
  }

  /* ---------------------------------------------------------------- Flujo de datos de Nav2 */
  V["flujo-nav2"] = function (el) {
    estilos();
    datos(function (DV) {
      var D = { nodos: DV.nav2.nodos, aristas: DV.nav2.aristas, vistas: DV.nav2.vistas,
        pasos: DV.nav2.pasos.map(function (p) { return Object.assign({ color: "azul", paquete: "circulo" }, p); }) };
      montarFlujo(el, {
        D: D, clase: "dv-nav2", grupo: "Escenario del flujo de datos de Nav2",
        aria: "Flujo de datos de Nav2, desde el LiDAR hasta los motores y de vuelta con la odometría",
        titulo: "Flujo de datos de Nav2",
        color: { operador: "violeta", ros: "verde", fisico: "azul" },
        leyenda: [["violeta", "Operador"], ["verde", "Componente ROS 2"], ["azul", "Componente físico"]],
        rotulo: function (p, i) { return (i + 1) + ". " + p.t; },
        tituloPaso: function (p, i) { return "Paso " + (i + 1) + ". " + p.t + "."; },
        nota: 'Simplificado de la Fig. 4.6 de la tesis. Faltan los tópicos de las acciones, el <code>/map</code> hacia el planificador y los nodos de ciclo de vida. Los paquetes que viajan son ilustrativos: no miden latencia ni frecuencia.',
        extra: '<a class="vbtn sec" href="#d-nav2-original">Ver la figura original de la tesis</a>'
      });
      var a = el.querySelector('a[href="#d-nav2-original"]');
      if (a) a.addEventListener("click", function () { var d = document.getElementById("d-nav2-original"); if (d) d.open = true; });
    }, function () { fallar(el); });
  };

  /* ---------------------------------------------------------------- Energía y señales del robot */
  V["energia-senales"] = function (el) {
    estilos();
    datos(function (DV) {
      montarFlujo(el, {
        D: DV.energia, clase: "dv-energia", grupo: "Flujo que se anima",
        aria: "Bloques de conexión del robot, con el flujo de energía o de señales animado a lo largo de sus cables",
        titulo: "Energía y señales del robot",
        color: { potencia: "naranja", logica: "turquesa" },
        leyenda: [["naranja", "Dominio de 12 V"], ["turquesa", "Dominio de 5 V y control"]],
        rotulo: function (p) { return p.t; },
        tituloPaso: function (p) { return p.t + "."; },
        nota: 'Bloques simplificados de la Fig. 4.5 y la sección 4.3 de la tesis. La energía va en línea continua con círculos. Las señales van en línea de trazos con rombos. Quedaron fuera, porque la figura no lo deja claro: cómo se alimenta el Arduino (la sección dice que el riel de 5 V, pero la figura solo muestra su cable USB), la alimentación de los encoders, el visor de tensión y corriente y el pin lógico de 5 V del L298N.'
      });
    }, function () { fallar(el); });
  };

  /* ---------------------------------------------------------------- Ciclo del robot */
  V["ciclo-robot"] = function (el) {
    estilos();
    datos(function (DV) {
      var C = DV.ciclo, E = C.etapas;
      var resp = el.querySelector(".vis-fallback");
      var respaldo = resp ? resp.textContent : E.map(function (e) { return e.lineas.join(" ") + ": " + e.texto; }).join(" ") + " Al moverse, el robot ve geometría nueva y el ciclo vuelve a empezar.";
      var DWELL = 0.5, VIAJE = 1, CICLO = DWELL + VIAJE, T_IN = 0.6;
      var est = { t: 0, sel: -1, pausa: false, vista: null, ang: 0 };
      var refs = null;
      el.innerHTML = '<div class="dv dv-ciclo">' +
        '<div class="vctl"><button type="button" class="vbtn dv-pausa" aria-pressed="false">Pausar movimiento</button><span class="vestado dv-rm" hidden>Tu sistema pide menos movimiento: el diagrama se muestra quieto.</span></div>' +
        '<div class="dv-lienzo"></div>' +
        '<div class="dv-info" aria-live="polite"><p class="dv-paso">Elige una etapa para detener el recorrido y leer su explicación.</p></div>' +
        '<p class="vnota">' + U.esc(C.ritmos.ruedas) + ' ' + U.esc(C.ritmos.destino) + ' Las dos vueltas no van a escala: en el robot son unas 100 correcciones de rueda por cada revisión del destino (30 por segundo por 3,3 s) y aquí se dibujan 10. Al moverse, el robot ve geometría nueva y el ciclo vuelve a empezar.</p>' +
        '<p class="vis-fallback">' + U.esc(respaldo) + '</p></div>';
      var lienzo = el.querySelector(".dv-lienzo"), pausaB = el.querySelector(".dv-pausa"), info = el.querySelector(".dv-paso"), avisoRM = el.querySelector(".dv-rm");

      function dibujar(clave) {
        var vi = C.vistas[clave], w = vi.nodo[0], h = vi.nodo[1], fs = vi.fs;
        est.vista = clave;
        lienzo.innerHTML = "";
        var svg = S(lienzo, "svg", { "class": "dv-svg dv-" + clave, viewBox: "0 0 " + vi.vb[0] + " " + vi.vb[1], role: "group", "aria-label": "Ciclo de un robot autónomo: percibir, estimar la posición, decidir, planificar y moverse, y vuelta a percibir", focusable: "false" });
        S(svg, "title", {}, "El ciclo de un robot autónomo");
        var cs = E.map(function (e) { return vi.pos[e.id]; });
        var gL = S(svg, "g", {}), gR = S(svg, "g", {}), gE = S(svg, "g", {}), gT = S(svg, "g", {});
        for (var i = 0; i < 4; i++) {
          var a = cs[i], b = cs[(i + 1) % 4], pts = recortar([a, b], a, b, w, h);
          S(gL, "path", { "class": "dv-lazo", "stroke-width": 2.5, d: trazo(pts) });
          S(gL, "path", { "class": "dv-lazo-p", d: punta(pts, 11) });
        }
        var an = vi.anillo;
        S(gR, "circle", { "class": "dv-anillo", cx: an.c[0], cy: an.c[1], r: an.r });
        S(gR, "text", { "class": "dv-anillo-t", x: an.c[0], y: an.c[1] - 6, "font-size": fs }, "Ruedas");
        S(gR, "text", { "class": "dv-anillo-t", x: an.c[0], y: an.c[1] + fs + 2, "font-size": fs }, "30 por s");
        var ext = clave === "ancha" ? [[350, 160, "Ciclo externo: destino cada 3,3 s"]] : [[160, 134, "Ciclo externo:"], [160, 134 + fs + 3, "destino cada 3,3 s"]];
        var inn = clave === "ancha" ? [[350, 312, "Ciclo interno: ruedas 30 veces por s"]] : [[160, 282, "Ciclo interno:"], [160, 282 + fs + 3, "ruedas 30 veces por s"]];
        ext.concat(inn).forEach(function (r) { S(gR, "text", { "class": "dv-rotulo", x: r[0], y: r[1], "font-size": fs }, r[2]); });
        refs = { etapas: [], cs: cs, w: w, h: h, an: an };
        E.forEach(function (e, i) {
          var c = cs[i];
          var g = S(gE, "g", { "class": "dv-etapa", tabindex: "0", role: "button", "aria-pressed": String(est.sel === i), "aria-label": e.lineas.join(" ") + ", " + e.texto, style: "--nc:var(--c-" + e.color + ");--nf:var(--c-" + e.color + "-fondo)" });
          S(g, "rect", { "class": "caja", x: c[0] - w / 2, y: c[1] - h / 2, width: w, height: h, rx: 8 });
          S(g, "rect", { "class": "foco", x: c[0] - w / 2 - 4, y: c[1] - h / 2 - 4, width: w + 8, height: h + 8, rx: 11 });
          var ico = S(g, "svg", { "class": "ico", x: c[0] - w / 2 + 10, y: c[1] - 14, width: 28, height: 28, viewBox: "0 0 24 24", "aria-hidden": "true" });
          ico.innerHTML = ICONOS[e.icono];
          var tx = c[0] - w / 2 + 46, ly = e.lineas.length === 1 ? [c[1]] : [c[1] - fs * 0.6, c[1] + fs * 0.75];
          e.lineas.forEach(function (l, k) { S(g, "text", { x: tx, y: ly[k], "dominant-baseline": "central", "font-size": fs }, l); });
          alActivar(g, function () { elegir(i); });
          refs.etapas.push(g);
        });
        refs.tok = S(gT, "circle", { "class": "dv-token", r: 9, cx: cs[0][0], cy: cs[0][1] });
        refs.tin = S(gT, "circle", { "class": "dv-token-in", r: 5, cx: an.c[0], cy: an.c[1] - an.r });
        colocar();
      }

      function suave(f) { return f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2; }
      function colocar() {
        if (!refs) return;
        var t = est.t % (4 * CICLO), s = Math.floor(t / CICLO), r = t - s * CICLO, a = refs.cs[s], b = refs.cs[(s + 1) % 4], x, y, act = -1;
        if (est.sel >= 0) { a = refs.cs[est.sel]; x = a[0]; y = a[1]; act = est.sel; }
        else if (r < DWELL) { x = a[0]; y = a[1]; act = s; }
        else { var f = suave((r - DWELL) / VIAJE); x = a[0] + (b[0] - a[0]) * f; y = a[1] + (b[1] - a[1]) * f; }
        refs.tok.setAttribute("transform", "translate(" + f1(x - refs.cs[0][0]) + " " + f1(y - refs.cs[0][1]) + ")");
        var an = refs.an, ang = est.ang;
        refs.tin.setAttribute("transform", "translate(" + f1(Math.sin(ang) * an.r) + " " + f1(an.r - Math.cos(ang) * an.r) + ")");
        refs.etapas.forEach(function (g, i) { g.classList.toggle("act", i === act); });
        est.act = act;
      }
      function avance(dt) {
        if (est.sel < 0) est.t += dt;
        est.ang = (est.ang + dt / T_IN * 2 * Math.PI) % (2 * Math.PI);
        colocar();
      }
      function elegir(i) {
        est.sel = i; est.t = i * CICLO;
        refs.etapas.forEach(function (g, j) { g.setAttribute("aria-pressed", String(j === i)); });
        var e = E[i];
        info.innerHTML = '<b>' + U.esc(e.lineas.join(" ")) + '.</b> ' + U.esc(e.texto) + ' ' + e.enlaces.map(function (l) { return '<a href="' + U.esc(l.h) + '">' + U.esc(l.t) + '</a>'; }).join(", ") + '.';
        colocar();
        textoPausa(pausaB, est.pausa, true);
      }
      var bucle = U.bucle(lienzo, avance);
      pausaB.addEventListener("click", function () {
        if (est.sel >= 0) {
          est.sel = -1; est.pausa = false;
          refs.etapas.forEach(function (g) { g.setAttribute("aria-pressed", "false"); });
          info.textContent = "Elige una etapa para detener el recorrido y leer su explicación.";
          textoPausa(pausaB, false, false);
          if (!U.quieto()) bucle.play();
          return;
        }
        est.pausa = !est.pausa;
        textoPausa(pausaB, est.pausa, false);
        if (est.pausa) bucle.pausa(); else bucle.play();
      });
      function ajustar() {
        var rm = U.quieto();
        pausaB.hidden = rm; avisoRM.hidden = !rm;
        if (rm) { bucle.pausa(); est.t = 0; est.ang = 0; if (refs) colocar(); }
      }
      U.alCambiarMovimiento(function (rm) {
        if (rm) ajustar();
        else { est.pausa = false; textoPausa(pausaB, false, est.sel >= 0); pausaB.hidden = false; avisoRM.hidden = true; if (est.sel < 0) bucle.play(); }
      });
      U.alAncho(el, function () { var v = vistaPara(el); if (v !== est.vista) dibujar(v); });
      dibujar(vistaPara(el));
      ajustar();
      if (!U.quieto()) bucle.play();
      el.estadoDiagrama = function () { return { vista: est.vista, etapa: est.act, seleccionada: est.sel, pausado: est.pausa, t: est.t, ang: est.ang }; };
    }, function () { fallar(el); });
  };
})();
