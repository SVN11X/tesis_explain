/*
  Preguntas difíciles: búsqueda, filtros por tema y nivel, modo práctica y pregunta al azar.

  Sin JavaScript la página sigue completa: cada pregunta es un details legible y las
  herramientas quedan ocultas. La búsqueda usa la misma normalización del buscador del
  sitio, así que 3.63 encuentra 3,63, 444643 encuentra 444 643 y no importan las tildes.
  El estado de los filtros vive solo en memoria. Lo escrito en el modo práctica no se guarda.
*/
(function () {
  "use strict";

  function iniciar() {
    var caja = document.getElementById("q-herramientas");
    if (!caja) return;
    var preguntas = [].slice.call(document.querySelectorAll("details.pregunta"));
    var temas = [].slice.call(document.querySelectorAll("section.q-tema"));
    var entrada = document.getElementById("q-buscar"), seg = document.getElementById("q-nivel");
    var respaldo = document.getElementById('q-estado');
    var cajaChips = document.getElementById("q-temas"), conteo = document.getElementById("q-conteo");
    var sinRes = document.getElementById("q-sin"), practica = document.getElementById("q-practica");
    var limpiar = document.getElementById("q-limpiar"), azar = document.getElementById("q-azar");
    var B = window.SITIO && window.SITIO.busqueda;
    var norm = B ? B.norm : function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var tokens = B ? B.tokens : function (q) { return norm(q).split(/\s+/).filter(Boolean); };
    var aparece = B ? function (t, tok) { return B.posiciones(t, tok, 1).length > 0; } : function (t, tok) { return t.indexOf(tok) >= 0; };
    var quieto = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };

    var estado = { q: "", nivel: "todos", tema: "todos", respaldo: 'todos' };
    var datos = preguntas.map(function (d) {
      var sec = d.closest("section.q-tema");
      return { el: d, tema: sec ? sec.getAttribute("data-tema") : "", nivel: d.getAttribute("data-dificultad"), respaldo: d.getAttribute('data-respuesta'), texto: norm(d.textContent.replace(/\s+/g, " ")) };
    });

    /* Chips de tema, con el número de preguntas que quedan con la búsqueda y el nivel actuales */
    var chips = [{ id: "todos", t: "Todos los temas" }].concat(temas.map(function (s) {
      return { id: s.getAttribute("data-tema"), t: s.getAttribute("data-corto") || s.querySelector("h2").textContent.replace("#", "").trim() };
    }));
    var esc = window.U ? window.U.esc : function (s) { return String(s).replace(/[&<>"']/g, ""); };
    cajaChips.innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip" data-tema="' + esc(c.id) + '" aria-pressed="' + (c.id === "todos") + '">' + esc(c.t) + '<span class="c-n"></span></button>';
    }).join("");

    function coincide(d, ignorarTema) {
      if (estado.nivel !== "todos" && d.nivel !== estado.nivel) return false;
      if (estado.respaldo !== 'todos' && d.respaldo !== estado.respaldo) return false;
      if (!ignorarTema && estado.tema !== "todos" && d.tema !== estado.tema) return false;
      if (estado.q) {
        var ps = tokens(estado.q);
        for (var i = 0; i < ps.length; i++) if (!aparece(d.texto, ps[i])) return false;
      }
      return true;
    }

    var ultimoTexto = "";
    function aplicar() {
      var n = 0;
      datos.forEach(function (d) { var v = coincide(d); d.el.hidden = !v; if (v) n++; });
      temas.forEach(function (s) { s.hidden = !s.querySelector("details.pregunta:not([hidden])"); });
      /* conteo por tema sin aplicar el filtro de tema, para ver a dónde conviene ir */
      [].forEach.call(cajaChips.querySelectorAll(".chip"), function (b) {
        var id = b.getAttribute("data-tema");
        var k = datos.filter(function (d) { return coincide(d, true) && (id === "todos" || d.tema === id); }).length;
        b.querySelector(".c-n").textContent = ' ' + k;
        b.setAttribute("aria-pressed", String(id === estado.tema));
        b.classList.toggle("vacio", k === 0);
        b.setAttribute("aria-label", b.firstChild.textContent + " " + k + (k === 1 ? " pregunta" : " preguntas"));
      });
      [].forEach.call(seg.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-n") === estado.nivel)); });
      var filtrado = estado.q || estado.nivel !== "todos" || estado.tema !== "todos" || estado.respaldo !== 'todos';
      var txt = filtrado ? (n === 1 ? "Se muestra 1 de " : "Se muestran " + n + " de ") + datos.length + " preguntas." : datos.length + " preguntas. Ábrelas una por una o pide una al azar.";
      if (txt !== ultimoTexto) { conteo.textContent = txt; ultimoTexto = txt; }
      sinRes.hidden = n > 0;
      limpiar.hidden = !filtrado;
      azar.disabled = n === 0;
    }

    function quitarFiltros() {
      estado.q = ""; estado.nivel = "todos"; estado.tema = "todos"; estado.respaldo = 'todos'; respaldo.value = 'todos'; entrada.value = "";
      aplicar();
    }

    var espera = null;
    entrada.addEventListener("input", function () {
      clearTimeout(espera);
      espera = setTimeout(function () { estado.q = entrada.value.trim(); aplicar(); }, 120);
    });
    entrada.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); clearTimeout(espera); estado.q = entrada.value.trim(); aplicar(); }
    });
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      estado.nivel = b.getAttribute("data-n"); aplicar();
    });
    cajaChips.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      estado.tema = b.getAttribute("data-tema"); aplicar();
    });
    limpiar.addEventListener("click", function () { quitarFiltros(); entrada.focus(); });
    respaldo.addEventListener('change', function () { estado.respaldo = respaldo.value; aplicar(); });
    document.getElementById("q-abrir").addEventListener("click", function () {
      preguntas.forEach(function (d) { if (!d.hidden) d.open = true; });
    });
    document.getElementById("q-cerrar").addEventListener("click", function () {
      preguntas.forEach(function (d) { d.open = false; });
    });

    /* Modo práctica: cada pregunta muestra primero un espacio para responder */
    function velo(d) {
      var cuerpo = d.querySelector(".q-cuerpo");
      if (!cuerpo || cuerpo.querySelector(".q-velo")) return;
      var id = "tu-" + d.id;
      var v = document.createElement("div");
      v.className = "q-velo";
      v.innerHTML = '<p>Responde antes de mirar. Empieza por la respuesta directa, sigue con el dato que la respalda y termina con la limitación, si la hay.</p>' +
        '<label for="' + id + '">Tu respuesta, si quieres escribirla. No se guarda.</label><textarea id="' + id + '" rows="3"></textarea>' +
        '<button type="button" class="btn prim chico">Mostrar la respuesta</button>';
      cuerpo.insertBefore(v, cuerpo.firstChild);
      v.querySelector("button").addEventListener("click", function () { revelar(d); });
    }
    function revelar(d) {
      var cuerpo = d.querySelector(".q-cuerpo"), ta = cuerpo.querySelector("textarea");
      var previa = cuerpo.querySelector(".q-tu-respuesta");
      if (previa) previa.remove();
      if (ta && ta.value.trim()) {
        var tu = document.createElement("div");
        tu.className = "q-tu-respuesta";
        tu.innerHTML = "<b>Lo que respondiste</b>";
        tu.appendChild(document.createTextNode(ta.value.trim()));
        cuerpo.insertBefore(tu, cuerpo.querySelector(".q-velo").nextSibling);
      }
      d.classList.remove("velada");
      cuerpo.setAttribute("tabindex", "-1");
      cuerpo.focus({ preventScroll: true });
    }
    function modoPractica(on) {
      preguntas.forEach(function (d) {
        if (on) { velo(d); d.classList.add("velada"); }
        else d.classList.remove("velada");
      });
    }
    practica.addEventListener("change", function () { modoPractica(practica.checked); });

    /* Pregunta al azar entre las visibles, sin repetir la anterior */
    var anterior = null;
    azar.addEventListener("click", function () {
      var vis = preguntas.filter(function (d) { return !d.hidden; });
      if (!vis.length) return;
      var opciones = vis.length > 1 ? vis.filter(function (d) { return d !== anterior; }) : vis;
      var d = opciones[Math.floor(Math.random() * opciones.length)];
      anterior = d;
      if (practica.checked) {
        var tu = d.querySelector(".q-tu-respuesta"); if (tu) tu.remove();
        var ta = d.querySelector(".q-velo textarea"); if (ta) ta.value = "";
        d.classList.add("velada");
      }
      d.open = true;
      if (history.replaceState) history.replaceState(null, "", "#" + d.id);
      d.scrollIntoView({ behavior: quieto() ? "auto" : "smooth", block: "start" });
      d.querySelector("summary").focus({ preventScroll: true });
      d.classList.add("destacar");
      setTimeout(function () { d.classList.remove("destacar"); }, 2400);
    });

    /* Un enlace a una pregunta que quedó oculta por un filtro quita los filtros */
    function alAncla() {
      var id;
      try { id = decodeURIComponent((location.hash || "").slice(1)); } catch (e) { return; }
      var d = id && document.getElementById(id);
      if (!d || !d.classList.contains("pregunta")) return;
      if (d.hidden) quitarFiltros();
      d.open = true;
    }
    window.addEventListener("hashchange", alAncla);
    /* un enlace interno al mismo ancla que ya tiene la dirección no dispara hashchange */
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href^='#p-']");
      if (a && a.hash === location.hash) setTimeout(alAncla, 0);
    }, true);
    alAncla();

    window.addEventListener("beforeprint", function () {
      preguntas.forEach(function (d) { d.hidden = false; d.open = true; d.classList.remove("velada"); });
      temas.forEach(function (s) { s.hidden = false; });
    });
    window.addEventListener("afterprint", aplicar);

    caja.hidden = false;
    aplicar();

    /* para las pruebas */
    caja.estadoPreguntas = function () {
      return {
        q: estado.q, nivel: estado.nivel, tema: estado.tema,
        visibles: preguntas.filter(function (d) { return !d.hidden; }).map(function (d) { return d.id; }),
        temasVisibles: temas.filter(function (s) { return !s.hidden; }).map(function (s) { return s.getAttribute("data-tema"); }),
        veladas: preguntas.filter(function (d) { return d.classList.contains("velada"); }).length,
        abiertas: preguntas.filter(function (d) { return d.open; }).length,
        conteo: conteo.textContent
      };
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
