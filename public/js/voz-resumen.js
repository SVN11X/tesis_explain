/*
  Botón «Escuchar» de cada resumen de tema (p.resumen). Lo carga js/sitio.js cuando la página tiene resúmenes.
  El audio es una voz sintética pregrabada (docs/decisions/0010-voz-natural-pregenerada.md). Aquí solo se arma el
  botón. js/voz-natural.js y el audio se piden al pulsarlo, y nada suena sin que la persona lo pida.
  El audio se busca por la huella del texto visible sin las citas, la misma que calcula scripts/voz_natural.py.
*/
(function () {
  "use strict";

  var ICONOS = {
    voz: "M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32ZM144,207.64,88,164.09V91.91l56-43.55Zm54-106.08a40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.58,24,24,0,0,0,0-31.72,8,8,0,0,1,12-10.58ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z",
    pausa: "M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z",
    seguir: "M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"
  };
  var cargaNucleo = null;
  var AVISO_VOZ = "Voz sintética, generada con Qwen3-TTS";

  function icono(clave) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "ph"); s.setAttribute("viewBox", "0 0 256 256"); s.setAttribute("aria-hidden", "true");
    s.setAttribute("fill", "currentColor");
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", ICONOS[clave]);
    s.appendChild(p);
    return s;
  }

  function cargar(archivo, tipo) {
    return new Promise(function (ok, mal) {
      var e = document.createElement(tipo === "css" ? "link" : "script");
      if (tipo === "css") { e.rel = "stylesheet"; e.href = new URL("css/" + archivo, document.baseURI).href; }
      else e.src = new URL("js/" + archivo, document.baseURI).href;
      e.onload = ok;
      e.onerror = function () { e.remove(); mal(new Error(archivo)); };
      document.head.appendChild(e);
    });
  }
  function nucleo() {
    if (window.VozNatural) return Promise.resolve();
    if (!cargaNucleo) cargaNucleo = cargar("voz-natural.js").catch(function (e) { cargaNucleo = null; throw e; });
    return cargaNucleo;
  }

  function textoVisible(p) {
    var c = p.cloneNode(true);
    c.querySelectorAll("a.ref").forEach(function (a) { a.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim().replace(/\s+([.,;:])/g, "$1");
  }
  function mmss(s) {
    s = Math.max(0, Math.round(s || 0));
    return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
  }

  function montar(p, primera) {
    var fila = document.createElement("div");
    fila.className = "voz-fila";
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn chico voz-boton";
    var txt = document.createElement("span");
    var barra = document.createElement("progress");
    barra.className = "voz-barra"; barra.max = 1; barra.value = 0; barra.hidden = true;
    barra.setAttribute("aria-label", "Avance del audio");
    var nota = document.createElement("span");
    nota.className = "voz-nota";
    nota.textContent = AVISO_VOZ;
    nota.hidden = !primera;
    var estado = document.createElement("span");
    estado.className = "voz-estado"; estado.setAttribute("role", "status");
    fila.appendChild(b); fila.appendChild(barra); fila.appendChild(estado); fila.appendChild(nota);
    p.insertAdjacentElement("afterend", fila);

    var control = null, ocupado = false;
    function pintar(clave, etiqueta, deshabilitado) {
      b.textContent = ""; b.appendChild(icono(clave)); txt.textContent = etiqueta; b.appendChild(txt);
      /* aria-disabled y no disabled: un botón desactivado pierde el foco y el teclado se queda sin lugar */
      b.setAttribute("aria-disabled", deshabilitado ? "true" : "false");
      b.setAttribute("aria-busy", deshabilitado ? "true" : "false");
    }
    function reposo(mensaje) {
      control = null; ocupado = false;
      barra.hidden = true; barra.value = 0;
      pintar("voz", mensaje ? "Reintentar" : "Escuchar");
      estado.textContent = mensaje || "";
      fila.classList.toggle("voz-error", !!mensaje);
    }
    function alAviso(d) {
      if (d.tipo === "cargando") { pintar("voz", "Cargando", true); estado.textContent = "Cargando el audio…"; }
      else if (d.tipo === "sonando") { pintar("pausa", "Pausar"); barra.hidden = false; estado.textContent = AVISO_VOZ; }
      else if (d.tipo === "pausa") { pintar("seguir", "Seguir"); estado.textContent = "En pausa"; }
      else if (d.tipo === "progreso") {
        if (d.total > 0) { barra.value = d.t / d.total; barra.setAttribute("aria-valuetext", mmss(d.t) + " de " + mmss(d.total)); }
      }
      else if (d.tipo === "fin" || d.tipo === "detenido") reposo("");
      else if (d.tipo === "error") reposo("No se pudo reproducir el audio. Revisa tu conexión e inténtalo otra vez.");
    }
    reposo("");

    b.addEventListener("click", function () {
      if (control) { control.alternar(); return; }
      if (ocupado) return;
      ocupado = true;
      pintar("voz", "Cargando", true); estado.textContent = "Cargando el audio…"; fila.classList.remove("voz-error");
      nucleo().then(function () {
        return window.VozNatural.huella(textoVisible(p)).then(function (h) { return window.VozNatural.entrada("r-" + h); });
      }).then(function (e) {
        if (!e) { reposo("Este resumen todavía no tiene audio."); return; }
        control = window.VozNatural.reproducir(e.archivo, alAviso);
      }, function () { reposo("No se pudo cargar el audio. Revisa tu conexión e inténtalo otra vez."); });
    });
  }

  function iniciar() {
    var lista = document.querySelectorAll("p.resumen");
    if (!lista.length) return;
    cargar("voz.css", "css").catch(function () { /* los botones usan el estilo base de .btn */ });
    lista.forEach(function (p, i) { montar(p, i === 0); });
  }
  iniciar();
})();
