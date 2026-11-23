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
  /* Reparto de los hijos de un interactivo. tipos[i] es "titulo", "dibujo", "lectura", "mando", "nota" u otro nombre de grupo.
     Un título abre una sección nueva. Devuelve [{ titulo, dibujo, mando, lectura, nota, ... }] con los índices de cada grupo. */
  U.repartir = function (tipos) {
    var secs = [], s = null;
    function nueva(t) { s = { titulo: t, dibujo: [], mando: [], lectura: [], nota: [] }; secs.push(s); }
    function vacia() { return Object.keys(s).every(function (k) { return k === "titulo" || !s[k].length; }); }
    tipos.forEach(function (t, i) {
      if (t === "titulo") { if (!s || s.titulo !== null || !vacia()) nueva(i); else s.titulo = i; return; }
      if (!s) nueva(null);
      (s[t] = s[t] || []).push(i);
    });
    return secs;
  };
  /* Nombres de las pestañas de cada interactivo en el teléfono, con las palabras del propio interactivo. m son los nombres de
     las pestañas de mandos: uno, o dos con corte, el número de mandos que van a la primera. Las notas y la leyenda van a una
     última pestaña, "Cómo leerlo", que también lleva los datos que no caben en la tira de valores clave ("Datos y notas").
     Un interactivo sin entrada aquí no usa pestañas. */
  U.PESTANAS = {
    cinematica: { m: ["Caso", "Ruedas"], corte: 1 }, encoder: { m: ["Giro del disco"] }, calibracion: { m: ["Ensayo", "Sesgo y azar"], corte: 1 },
    cuadrado: { m: ["Caso", "Ruedas"], corte: 1 },
    rejilla: { m: ["Observaciones"] }, "marcos-mapeo": { m: ["Avance y error"] }, barridos: { m: ["Traslación"] },
    "candidatos-slam": { m: ["Observación", "Etapas"], corte: 1 }, lazo: { m: ["Pasos", "Pose"], corte: 2 }, "cola-slam": { m: ["Tiempos"] },
    "rviz-colores": { m: ["Capas"] }, "plano-mapa": { m: ["Qué mostrar", "Recinto"], corte: 1 },
    inflacion: { m: ["Radio"] }, astar: { m: ["Algoritmo", "Celdas"], corte: 1 }, dwb: { m: ["Escenario", "Pesos"], corte: 1 },
    "lazo-rueda": { m: ["Etapa"] }, pid: { m: ["Ejemplos", "Ganancias"], corte: 1 }, tiempo: { m: ["Frecuencia", "Ciclos"], corte: 1 },
    papeles: { m: ["Ejemplo", "Ciclos"], corte: 3 }, cancelacion: { m: ["Medición", "Ciclos"], corte: 1 }, acumulador: { m: ["Rueda", "Bloqueo"], corte: 1 },
    truncamiento: { m: ["Ejemplos", "Error"], corte: 1 }, windup: { m: ["Bloqueo", "Momento"], corte: 3 }, zonas: { m: ["PWM y umbral"] },
    fopdt: { m: ["Rueda", "Escalón"], corte: 1 }, enjambre: { m: ["Búsqueda"] }, resolucion: { m: ["Operación"] },
    estabilidad: { m: ["Rueda", "Planta"], corte: 1 }, exploracion: { m: ["Explorar"] }, costo: { m: ["Montos"] }
  };
  /* Reparto de los mandos de un interactivo en pestañas para el teléfono. unidades[i] es { h, tipo }: la altura que ocupa y si
     es un "mando", un "dato" (lectura que no cabe en la tira de valores clave) o una "nota" (nota o leyenda). rot es su entrada de
     U.PESTANAS. Devuelve [{ indices, rotulo }] con tres grupos como máximo: uno o dos de mandos y uno de datos y notas. Si los mandos
     y las notas caben en tope px y no hay datos, devuelve un solo grupo y no hacen falta pestañas. Sin rot devuelve un solo grupo. */
  U.empacar = function (unidades, tope, rot) {
    var todos = unidades.map(function (u, i) { return i; });
    function de(tipos) { return todos.filter(function (i) { return tipos.indexOf(unidades[i].tipo) >= 0; }); }
    var mandos = de(["mando"]), datos = de(["dato"]), notas = de(["nota"]);
    function alto(ids) { return ids.reduce(function (t, i) { return t + (unidades[i].h || 0) + 8; }, -8); }
    if (!rot || !rot.m || !rot.m.length || (!datos.length && alto(mandos.concat(notas)) <= tope)) return todos.length ? [{ indices: todos, rotulo: rot && rot.m ? rot.m[0] : "" }] : [];
    var partes = rot.m.length > 1 && rot.corte > 0 && rot.corte < mandos.length ? [mandos.slice(0, rot.corte), mandos.slice(rot.corte)] : [mandos];
    var gs = partes.filter(function (g) { return g.length; }).map(function (g, k) { return { indices: g, rotulo: rot.m[k] }; });
    var resto = datos.concat(notas);
    if (resto.length) gs.push({ indices: resto, rotulo: datos.length ? "Datos y notas" : "Cómo leerlo" });
    return gs;
  };
  /* Escenario de un interactivo: el dibujo, las lecturas y los controles en tres bloques.
     o.dibujo y o.lecturas son selectores de hijos directos de el, y lo demás son controles. Desde 700 px de ancho
     el dibujo y las lecturas van a un lado y los controles al otro. Con menos, se apilan: dibujo, controles, lecturas.
     Las notas largas (.vnota) quedan plegadas en un details, sin quitar nada del texto. Cada grupo de o.plegar
     ({ sel, en, titulo }) va a un details dentro del bloque en ("dib", "ctl" o "lec") que se abre solo, sin su título, cuando
     hay ancho para verlo todo y se pliega en un teléfono.
     Opciones para las páginas de mapeo y control: o.tira pone las lecturas en una tira bajo el dibujo y los controles,
     o.aparte (selector) deja plegados fuera del escenario los details y los elementos con data-plegar="Título",
     y o.secciones muestra una sección a la vez, con botones, cuando cada h4.vsub abre una. */
  function plegable(el, titulo, abierto) {
    var det = document.createElement("details"), cuerpo = document.createElement("div"), s = document.createElement("summary");
    det.className = "v-mas"; cuerpo.className = "v-mas-cuerpo"; s.textContent = titulo;
    det.appendChild(s); det.appendChild(cuerpo);
    if (abierto) { var ancho = function () { var ok = el.clientWidth >= 740; det.open = ok; det.classList.toggle("v-libre", ok); }; ancho(); U.alAncho(el, ancho); }
    return { det: det, cuerpo: cuerpo };
  }
  /* Pestañas de mandos en el teléfono. Desde 740 px de ancho no hacen nada. Con menos, y si el interactivo tiene entrada en
     U.PESTANAS (o la pasa en o.pestanas), los mandos pasan a pestañas y el dibujo y los valores clave siguen a la vista.
     Los valores clave son las cuatro primeras tarjetas de la primera lectura. Se copian en una tira bajo el dibujo y la copia se
     actualiza sola. La lectura completa va a la última pestaña. Al ensancharse todo vuelve a su sitio. */
  var nPest = 0, TARJETAS = ".lecturas, .control-datos, .mp-readings, .ev-datos, .wu-res, .tr-datos, .ee-res, .fo-datos, .pa-datos, .ti-datos, .re-datos, .kd-datos, .as-cuenta", ESTADOS = ".mp-equation, p.mp-status, p.vestado, .control-conclusion, .ev-procedencia, .lr-estado, .zm-estado, .wu-estado, .pa-exp, .fo-aviso";
  function armarClave(esc, datos) {
    var fuente = datos.filter(function (u) { return u.matches(TARJETAS); })[0] || datos.filter(function (u) { return u.tagName === "P"; })[0];
    if (!fuente) return null;
    var tira = document.createElement("div"), pendiente = 0, obs;
    tira.className = "v-clave" + (fuente.matches(TARJETAS) ? " " + fuente.className : ""); tira.setAttribute("role", "group"); tira.setAttribute("aria-label", "Valores clave");
    function pintar() {
      pendiente = 0; tira.textContent = "";
      (fuente.matches(TARJETAS) ? [].slice.call(fuente.children, 0, 4) : [fuente]).forEach(function (c) {
        var cp = c.cloneNode(true);
        [cp].concat([].slice.call(cp.querySelectorAll("*"))).forEach(function (e) {
          e.removeAttribute("id");
          [].slice.call(e.attributes).forEach(function (a) { if (a.name.indexOf("data-") === 0) e.removeAttribute(a.name); });
        });
        tira.appendChild(cp);
      });
    }
    pintar();
    if (typeof MutationObserver !== "undefined") {
      obs = new MutationObserver(function () { if (!pendiente) pendiente = requestAnimationFrame(pintar); });
      obs.observe(fuente, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
    }
    esc.appendChild(tira);
    return function () { if (obs) obs.disconnect(); cancelAnimationFrame(pendiente); esc.removeChild(tira); };
  }
  function armarPestanas(esc, ctl, rot) {
    var lec = esc.querySelector(":scope > .v-lec"), dib = esc.querySelector(":scope > .v-dib");
    var datos = (lec && lec.offsetHeight > Math.round(window.innerHeight * 0.16) ? [].slice.call(lec.children) : []).concat([].filter.call(ctl.children, function (u) { return u.matches(ESTADOS); }));
    var notas = [].slice.call(ctl.children).filter(function (u) { return u.matches("[data-nota], .vnota"); });
    var leyendas = dib ? [].filter.call(dib.children, function (u) { return u.matches(".vley, .leyenda, .mp-legend, [data-nota]") && u.offsetHeight > 36; }) : [];
    var unidades = [].slice.call(ctl.children).filter(function (u) { return datos.indexOf(u) < 0; }).concat(datos, leyendas), pila = [], abiertas = [];
    var tipos = unidades.map(function (u) { return datos.indexOf(u) >= 0 ? "dato" : notas.indexOf(u) >= 0 || leyendas.indexOf(u) >= 0 ? "nota" : "mando"; });
    var grupos = U.empacar(unidades.map(function (u, i) { return { h: u.offsetHeight, tipo: tipos[i] }; }), Math.max(150, Math.round(window.innerHeight * 0.3)), rot);
    if (grupos.length < 2) return null;
    var quitarClave = datos.length ? armarClave(esc, datos) : null;
    var id = "vp" + (++nPest), lista = document.createElement("div"), paneles = [], botones = [];
    lista.className = "v-pestanas-mando"; lista.setAttribute("role", "tablist"); lista.setAttribute("aria-label", "Mandos del interactivo");
    function ir(k, foco) {
      botones.forEach(function (b, j) { b.setAttribute("aria-selected", String(j === k)); b.tabIndex = j === k ? 0 : -1; paneles[j].hidden = j !== k; });
      if (foco) botones[k].focus();
    }
    grupos.forEach(function (g, k) {
      var b = document.createElement("button"), pn = document.createElement("div");
      b.type = "button"; b.className = "v-pest"; b.id = id + "-t" + k; b.setAttribute("role", "tab"); b.setAttribute("aria-controls", id + "-p" + k);
      b.textContent = g.rotulo; b.title = g.rotulo;
      pn.className = "v-panel"; pn.id = id + "-p" + k; pn.setAttribute("role", "tabpanel"); pn.setAttribute("aria-labelledby", b.id);
      g.indices.forEach(function (i) {
        var u = unidades[i]; pila.push({ u: u, p: u.parentNode, r: u.nextSibling }); pn.appendChild(u);
        if (u.tagName === "DETAILS" && u.hasAttribute("data-nota")) { abiertas.push({ u: u, abierto: u.open, libre: u.classList.contains("v-libre") }); u.open = true; u.classList.add("v-libre"); }
      });
      b.addEventListener("click", function () { ir(k, false); });
      b.addEventListener("keydown", function (e) {
        var n = grupos.length, j = e.key === "ArrowRight" || e.key === "ArrowDown" ? (k + 1) % n : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (k + n - 1) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
        if (j < 0) return;
        e.preventDefault(); ir(j, true);
      });
      botones.push(b); paneles.push(pn); lista.appendChild(b);
    });
    ctl.appendChild(lista); paneles.forEach(function (pn) { ctl.appendChild(pn); });
    ir(0, false); esc.setAttribute("data-pest", "1");
    return function () {
      while (pila.length) { var o = pila.pop(); o.p.insertBefore(o.u, o.r); }
      abiertas.forEach(function (x) { x.u.open = x.abierto; x.u.classList.toggle("v-libre", x.libre); });
      if (quitarClave) quitarClave();
      ctl.removeChild(lista); paneles.forEach(function (pn) { ctl.removeChild(pn); });
      esc.removeAttribute("data-pest");
    };
  }
  function pestanas(el, esc, o) {
    var ctl = esc.querySelector(":scope > .v-ctl"), deshacer = null, rot = o.pestanas || U.PESTANAS[(el.closest("[data-vis]") || el).getAttribute("data-vis")];
    if (!ctl || !rot || typeof ResizeObserver === "undefined") return;
    function ajustar() {
      var visible = esc.offsetHeight > 0, telefono = el.clientWidth < 740;
      if (deshacer && !telefono) { deshacer(); deshacer = null; }
      else if (!deshacer && telefono && visible) deshacer = armarPestanas(esc, ctl, rot);
    }
    new ResizeObserver(function () { requestAnimationFrame(ajustar); }).observe(esc);
  }
  function armar(el, cont, hijos, s, o) {
    var esc = document.createElement("div"), b = {}, fuera = [];
    esc.className = "v-escena" + (o.tira ? " v-tira" : "");
    ["dib", "ctl", "lec"].forEach(function (k) { b[k] = document.createElement("div"); b[k].className = "v-" + k; esc.appendChild(b[k]); });
    var grupos = (o.plegar || []).map(function (g) { return { g: g, p: plegable(el, g.titulo, true) }; }), notas = plegable(el, o.titulo || "Cómo leerlo y supuestos", false);
    if (s.titulo !== null && !o.partes) cont.appendChild(hijos[s.titulo]);
    [["dibujo", "dib"], ["lectura", "lec"], ["mando", "ctl"]].forEach(function (g) { s[g[0]].forEach(function (i) { b[g[1]].appendChild(hijos[i]); }); });
    (s.plegable || []).forEach(function (i) { grupos.filter(function (x) { return hijos[i].matches(x.g.sel); })[0].p.cuerpo.appendChild(hijos[i]); });
    s.nota.forEach(function (i) { notas.cuerpo.appendChild(hijos[i]); });
    (s.aparte || []).forEach(function (i) {
      var h = hijos[i], t = h.getAttribute("data-plegar");
      if (t) { var p = plegable(el, t, false); p.cuerpo.appendChild(h); fuera.push(p.det); } else fuera.push(h);
    });
    notas.det.setAttribute("data-nota", "");
    grupos.forEach(function (x) { if (x.g.en === "dib") x.p.det.setAttribute("data-nota", ""); if (x.p.cuerpo.children.length) b[x.g.en || "ctl"].appendChild(x.p.det); });
    if (o.tira && (!b.dib.children.length || !b.ctl.children.length)) esc.setAttribute("data-una", "1");
    if (notas.cuerpo.children.length && !o.tira) b.ctl.appendChild(notas.det);
    cont.appendChild(esc);
    pestanas(el, esc, o);
    fuera.forEach(function (x) { cont.appendChild(x); });
    if (notas.cuerpo.children.length && o.tira) cont.appendChild(notas.det);
    return esc;
  }
  U.escena = function (el, o) {
    var hijos = Array.prototype.slice.call(el.children), grupos = o.plegar || [];
    var tipos = hijos.map(function (h) {
      if (o.secciones && h.matches("h4.vsub")) return "titulo";
      if (grupos.some(function (g) { return h.matches(g.sel); })) return "plegable";
      if (o.aparte && h.matches(o.aparte)) return "aparte";
      if (h.matches(o.dibujo)) return "dibujo";
      if (o.lecturas && h.matches(o.lecturas)) return "lectura";
      return h.classList.contains("vnota") ? "nota" : "mando";
    });
    var secs = U.repartir(tipos);
    while (el.firstChild) el.removeChild(el.firstChild);
    var partes = !!o.secciones && secs.length > 1 && secs.every(function (s) { return s.titulo !== null; });
    if (!partes) {
      var ultima = null;
      secs.forEach(function (s) {
        var cont = secs.length > 1 ? document.createElement("div") : el;
        if (cont !== el) { cont.className = "v-parte"; el.appendChild(cont); }
        ultima = armar(el, cont, hijos, s, o);
      });
      return ultima;
    }
    var barra = document.createElement("div"), cajas = [];
    barra.className = "v-partes"; barra.setAttribute("role", "group"); barra.setAttribute("aria-label", "Partes del interactivo");
    el.appendChild(barra);
    secs.forEach(function (s, k) {
      var caja = document.createElement("div"), b = document.createElement("button");
      caja.className = "v-parte"; caja.hidden = k !== 0; el.appendChild(caja); cajas.push(caja);
      armar(el, caja, hijos, s, Object.assign({}, o, { partes: true }));
      b.type = "button"; b.className = "vbtn sec"; b.textContent = hijos[s.titulo].textContent.trim(); b.setAttribute("aria-pressed", String(k === 0));
      b.addEventListener("click", function () {
        [].forEach.call(barra.children, function (x, j) { x.setAttribute("aria-pressed", String(j === k)); cajas[j].hidden = j !== k; });
      });
      barra.appendChild(b);
    });
    return el;
  };
  /* Los interactivos de mapeo y control no dicen qué es dibujo y qué es lectura: se reconoce por clase. */
  var ESCENA_AUTO = {
    dibujo: ".mp-chart, .mp-columns, .mp-3d, .control-graf, .lienzo, .pid-l, .pso-l, .lr-dibujo, .ev-paneles, .dos-pan, .control-par, .ee-barras, .kd-secuencia, .kd-cancelacion, .ticks-contados, .registro-bins, .re-muestras, .banda-celdas, .ley-comparar, .ganancias-pares, .vley, .mp-legend, .leyenda, .proto, .ev-fig, .mp-mapa-lect, .comparar, .formula, .zm-banda, .re-ticks, .re-registro",
    lecturas: ".control-datos, .lecturas, .mp-readings, .ev-datos, .wu-res, .tr-datos, .ee-res, .fo-datos, .pa-datos, .ti-datos, .re-datos, .kd-datos, .aw-par",
    aparte: "details, [data-plegar]", tira: true, secciones: true, titulo: "Ver el detalle y lo que supone el ejemplo"
  };
  /* Se aplica en cuanto el interactivo escribe su HTML, antes de que dibuje, para que sus gráficos midan el ancho final. */
  U.escenaAuto = function (vis) {
    var pagina = document.body && document.body.getAttribute("data-pagina");
    if (pagina !== "mapeo" && pagina !== "control") return;
    var nativo = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    Object.defineProperty(vis, "innerHTML", { configurable: true, get: function () { return nativo.get.call(this); }, set: function (v) {
      nativo.set.call(this, v);
      var host = this.children.length === 1 && this.firstElementChild.classList.contains("mp-panel") ? this.firstElementChild : this;
      if (host.children.length < 3 || host.querySelector(".mp-escenario, .mp-reto") || host.getAttribute("data-maqueta") === "no") return;
      host.classList.add("v-auto");
      U.escena(host, ESCENA_AUTO);
    } });
  };
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
