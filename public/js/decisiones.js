/*
  Comparador de decisiones del tema 1. Cada tarjeta de .decisiones trae en el HTML sus alternativas
  (data-alt) y las frases de su explicación marcadas con la elección o alternativa que justifican
  (data-razon). Este archivo convierte las alternativas en botones: al elegir una, se resalta la frase
  con la que la tesis la descarta y se atenúa el resto. El texto no cambia y sin JavaScript se lee
  completo, como antes.
*/
(function () {
  "use strict";
  function iniciar() {
    var tarjetas = document.querySelectorAll(".decision");
    var activas = 0;
    tarjetas.forEach(function (art) {
      var alt = art.querySelector(".d-alt"), razones = art.querySelectorAll("[data-razon]");
      if (!alt || !razones.length) return;
      activas++;
      var elegida = (art.querySelector("h3, h4") || {}).textContent || "esta opción";
      var opciones = [{ id: "elegida", t: "Por qué " + elegida, cls: "d-elegida" }];
      alt.querySelectorAll("[data-alt]").forEach(function (sp) { opciones.push({ id: sp.getAttribute("data-alt"), t: sp.textContent.trim() }); });
      var grupo = document.createElement("div");
      grupo.className = "d-alt d-botones";
      grupo.setAttribute("role", "group");
      grupo.setAttribute("aria-label", "Comparar " + elegida + " con sus alternativas");
      opciones.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "d-op" + (o.cls ? " " + o.cls : "");
        b.setAttribute("data-alt", o.id); b.setAttribute("aria-pressed", "false");
        b.textContent = o.t;
        grupo.appendChild(b);
      });
      alt.replaceWith(grupo);
      var estado = document.createElement("p");
      estado.className = "sr"; estado.setAttribute("aria-live", "polite");
      art.appendChild(estado);
      function mostrar(id) {
        var nombre = "";
        grupo.querySelectorAll("button").forEach(function (b) {
          var si = b.getAttribute("data-alt") === id;
          b.setAttribute("aria-pressed", si ? "true" : "false");
          if (si) nombre = b.textContent;
        });
        var frases = [];
        razones.forEach(function (r) {
          var es = id && (" " + r.getAttribute("data-razon") + " ").indexOf(" " + id + " ") >= 0;
          r.classList.toggle("razon-activa", !!es);
          r.classList.toggle("razon-elegida", !!es && id === "elegida");
          r.classList.toggle("razon-tenue", !!id && !es);
          if (es) frases.push(r.textContent.replace(/\s+/g, " ").trim());
        });
        art.classList.toggle("comparando", !!id);
        if (id) art.setAttribute("data-viendo", id); else art.removeAttribute("data-viendo");
        estado.textContent = id ? (id === "elegida" ? nombre + ": " : "Frente a " + nombre + ": ") + frases.join(" ") : "";
      }
      grupo.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-alt]");
        if (!b) return;
        mostrar(b.getAttribute("aria-pressed") === "true" ? null : b.getAttribute("data-alt"));
      });
      art.estadoDecision = function () {
        return { viendo: art.getAttribute("data-viendo") || null, activas: [].map.call(art.querySelectorAll(".razon-activa"), function (r) { return r.textContent.trim(); }) };
      };
    });
    var cont = document.querySelector(".decisiones");
    if (activas && cont && !cont.previousElementSibling.classList.contains("d-ayuda")) {
      var ayuda = document.createElement("p");
      ayuda.className = "d-ayuda";
      ayuda.textContent = "Elige una pieza o una de sus alternativas para resaltar la razón que da la tesis. El texto completo sigue a la vista.";
      cont.parentNode.insertBefore(ayuda, cont);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
