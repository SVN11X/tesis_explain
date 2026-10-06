/* Página de preguntas difíciles: búsqueda, filtros, modo práctica y pregunta al azar */
(function () {
  "use strict";
  var P = window.PREGUNTAS || [], T = window.TEMAS_FAQ || [];
  var NIVEL = { general: "Para todo público", tecnica: "Técnica", exigente: "Muy exigente" };
  var st = { q: "", tema: "todos", nivel: "todos", practica: false };
  var cont = document.getElementById("faq"), conteo = document.getElementById("conteo"), sinRes = document.getElementById("sin-res");
  if (!cont) return;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function leer() { try { return localStorage.getItem("sitio.practica") === "1"; } catch (e) { return false; } }
  function guardar(v) { try { localStorage.setItem("sitio.practica", v ? "1" : "0"); } catch (e) {} }

  /* filtros de tema */
  var chips = document.getElementById("chips-tema");
  chips.innerHTML = '<button type="button" class="chip" data-t="todos" aria-pressed="true">Todos los temas</button>' +
    T.map(function (t) { return '<button type="button" class="chip" data-t="' + t.id + '" aria-pressed="false">' + esc(t.t) + ' <span class="num">' + P.filter(function (p) { return p.tema === t.id; }).length + '</span></button>'; }).join("");

  function pasa(p) {
    if (st.tema !== "todos" && p.tema !== st.tema) return false;
    if (st.nivel !== "todos" && p.nivel !== st.nivel) return false;
    if (st.q) { var h = norm(p.q + " " + p.r + " " + p.donde); if (h.indexOf(norm(st.q)) < 0) return false; }
    return true;
  }
  function render() {
    var n = 0, html = "";
    T.forEach(function (t) {
      var ps = P.filter(function (p) { return p.tema === t.id && pasa(p); });
      if (!ps.length) return;
      n += ps.length;
      html += '<section class="grupo-faq" aria-labelledby="g-' + t.id + '"><h2 id="g-' + t.id + '">' + esc(t.t) + ' <a href="' + t.cap + '">Ir al capítulo</a></h2>' +
        ps.map(function (p) {
          var parr = p.r.split("\n\n").map(function (x) { return '<p>' + esc(x) + '</p>'; }).join("");
          return '<details class="faq" id="p-' + p.id + '"><summary><span class="q">' + esc(p.q) + '<small>' + NIVEL[p.nivel] + '</small></span><span class="mas" aria-hidden="true">+</span></summary>' +
            '<div class="resp">' +
            (st.practica ? '<div class="ocultar"><p>Modo práctica. Responde en voz alta, en dos o tres frases, y después compara.</p><button type="button" class="btn chico" data-ver>Mostrar la respuesta</button></div><div class="r-txt" hidden>' + parr + '</div>' : '<div class="r-txt">' + parr + '</div>') +
            '<div class="donde"><span><b>En la tesis:</b> ' + esc(p.donde) + '</span><a href="' + p.ver + '">Ver la explicación →</a><a href="#p-' + p.id + '" data-copiar>Enlace a esta pregunta</a></div>' +
            '</div></details>';
        }).join("") + '</section>';
    });
    cont.innerHTML = html;
    conteo.textContent = n + (n === 1 ? " pregunta" : " preguntas");
    sinRes.hidden = n > 0;
    abrirHash();
  }
  function abrirHash() {
    if (!location.hash || location.hash.indexOf("#p-") !== 0) return;
    var el = document.getElementById(location.hash.slice(1));
    if (el) { el.open = true; el.classList.add("destacar"); setTimeout(function () { el.classList.remove("destacar"); }, 2400); el.scrollIntoView({ block: "start" }); }
  }
  document.getElementById("buscar").addEventListener("input", function (e) { st.q = e.target.value.trim(); render(); });
  chips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-t]"); if (!b) return;
    st.tema = b.getAttribute("data-t");
    chips.querySelectorAll("[data-t]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    render();
  });
  document.getElementById("seg-nivel").addEventListener("click", function (e) {
    var b = e.target.closest("[data-n]"); if (!b) return;
    st.nivel = b.getAttribute("data-n");
    this.querySelectorAll("[data-n]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    render();
  });
  var prac = document.getElementById("practica");
  st.practica = leer(); prac.checked = st.practica;
  prac.addEventListener("change", function () { st.practica = prac.checked; guardar(st.practica); render(); });
  cont.addEventListener("click", function (e) {
    var v = e.target.closest("[data-ver]");
    if (v) { var r = v.closest(".resp"); r.querySelector(".r-txt").hidden = false; v.parentElement.remove(); }
    var c = e.target.closest("[data-copiar]");
    if (c && navigator.clipboard) { e.preventDefault(); navigator.clipboard.writeText(location.origin + location.pathname + c.getAttribute("href")).then(function () { c.textContent = "Enlace copiado"; setTimeout(function () { c.textContent = "Enlace a esta pregunta"; }, 1800); }, function () {}); history.replaceState(null, "", c.getAttribute("href")); }
  });
  document.getElementById("azar").addEventListener("click", function () {
    var vis = Array.prototype.slice.call(cont.querySelectorAll("details.faq"));
    if (!vis.length) return;
    vis.forEach(function (d) { d.open = false; });
    var d = vis[Math.floor(Math.random() * vis.length)];
    d.open = true; d.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    d.classList.add("destacar"); setTimeout(function () { d.classList.remove("destacar"); }, 2400);
    d.querySelector("summary").focus();
  });
  window.addEventListener("hashchange", abrirHash);
  render();
})();
