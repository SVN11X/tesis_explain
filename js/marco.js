/* Comportamiento del marco común (herramientas/plantillas/): el tema, el menú del teléfono y el buscador.
   Lo cargan todas las páginas, también la portada y los laboratorios compilados con Astro. */
(function () {
  "use strict";
  var S = window.SITIO = window.SITIO || {};

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function leer(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function guardar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  /* Ícono de Phosphor Icons (MIT, ver LICENSE-iconos.txt) */
  var RECIENTE = '<svg class="ph" viewBox="0 0 256 256" aria-hidden="true"><path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"/></svg>';

  /* Tema claro u oscuro. Sin una elección guardada sigue al sistema. El script en línea del <head>
     (herramientas/plantillas/tema.html) aplica la elección guardada antes de pintar, así la página no parpadea.
     Cada cambio avisa con el evento temacambio para que los dibujos en canvas y las escenas 3D se repinten. */
  var COLOR_TEMA = { light: "#f1f1e9", dark: "#121a17" };
  function tema() {
    var raiz = document.documentElement;
    var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    var botones = [].slice.call(document.querySelectorAll("[data-tema-alternar]"));
    function sistema() { return mq && mq.matches ? "dark" : "light"; }
    function elegido() { var t = raiz.getAttribute("data-theme"); return t === "dark" || t === "light" ? t : null; }
    function efectivo() { return elegido() || sistema(); }
    function pintar() {
      var t = efectivo();
      botones.forEach(function (b) { b.setAttribute("aria-pressed", String(t === "dark")); b.classList.add("listo"); });
      /* la barra del navegador del teléfono toma el color del tema elegido, no solo el del sistema */
      [].forEach.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) { m.setAttribute("content", COLOR_TEMA[t]); });
    }
    function avisar() { pintar(); document.dispatchEvent(new CustomEvent("temacambio", { detail: { tema: efectivo() } })); }
    function aplicar(t) {
      /* el cambio es inmediato: sin transiciones durante dos cuadros, para que no se vea un fundido a medias */
      raiz.classList.add("tema-cambiando");
      /* si la elección coincide con el sistema no se guarda, y el sitio vuelve a seguirlo */
      if (t === sistema()) { raiz.removeAttribute("data-theme"); guardar("tema", null); }
      else { raiz.setAttribute("data-theme", t); guardar("tema", t); }
      avisar();
      requestAnimationFrame(function () { requestAnimationFrame(function () { raiz.classList.remove("tema-cambiando"); }); });
    }
    botones.forEach(function (b) { b.addEventListener("click", function () { aplicar(efectivo() === "dark" ? "light" : "dark"); }); });
    if (mq) {
      var alSistema = function () { if (elegido()) pintar(); else avisar(); };
      if (mq.addEventListener) mq.addEventListener("change", alSistema); else if (mq.addListener) mq.addListener(alSistema);
    }
    /* el tema cambió en otra pestaña del sitio */
    window.addEventListener("storage", function (e) {
      if (e.key !== "tema") return;
      if (e.newValue === "dark" || e.newValue === "light") raiz.setAttribute("data-theme", e.newValue); else raiz.removeAttribute("data-theme");
      avisar();
    });
    S.tema = { efectivo: efectivo, aplicar: aplicar };
    pintar();
  }

  /* Menú del teléfono. Es un details, así que abre sin JavaScript. Con JavaScript se comporta como un
     diálogo: aísla el resto de la página, el foco circula dentro y Escape lo cierra. */
  function menu() {
    var det = document.querySelector(".mobile-menu");
    if (!det) return;
    var sum = det.querySelector("summary"), panel = det.querySelector(".menu-panel");
    var aislados = [], overflowAnterior = "";
    function aislar() {
      /* todo lo que no contiene al menú queda inerte, desde el menú hacia arriba hasta el body */
      for (var el = det; el && el !== document.body; el = el.parentElement) {
        [].forEach.call(el.parentElement ? el.parentElement.children : [], function (h) {
          if (h === el || h.tagName === "SCRIPT" || h.tagName === "DIALOG") return;
          aislados.push({ el: h, inert: h.inert }); h.inert = true;
        });
      }
      overflowAnterior = document.body.style.overflow; document.body.style.overflow = "hidden";
    }
    function liberar() {
      aislados.forEach(function (o) { o.el.inert = o.inert; }); aislados = [];
      document.body.style.overflow = overflowAnterior;
    }
    function cerrar(volver) { if (!det.open) return; det.open = false; if (volver) sum.focus(); }
    det.addEventListener("toggle", function () {
      /* sobre 640 px el menú no se muestra: si algo lo abre igual, por ejemplo un script que abre todos los
         details para imprimir, se vuelve a cerrar sin aislar la página */
      if (det.open && !sum.getClientRects().length) { det.open = false; return; }
      sum.setAttribute("aria-expanded", String(det.open));
      if (det.open) aislar(); else liberar();
    });
    sum.setAttribute("aria-expanded", "false");
    det.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && det.open) { e.preventDefault(); cerrar(true); return; }
      if (e.key !== "Tab" || !det.open) return;
      var c = [sum].concat([].slice.call(panel.querySelectorAll("a[href], button:not([disabled])")).filter(function (x) { return x.offsetParent !== null; }));
      var first = c[0], last = c[c.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    /* un enlace del menú cierra el panel antes de navegar o de desplazarse a una sección */
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) cerrar(false); });
    document.addEventListener("click", function (e) { if (det.open && !det.contains(e.target)) cerrar(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 640) cerrar(false); });
    S.menu = { panel: panel, cerrar: cerrar };
  }

  /* Normalización y coincidencias del buscador. Funciones puras, expuestas en SITIO.busqueda para
     probarlas. norm quita mayúsculas y tildes, une los miles escritos con espacio (49 683 → 49683) y
     usa coma decimal (3.63 → 3,63). Cada carácter normalizado guarda la posición del original, así el
     resaltado marca el texto tal como se escribió en la página. */
  var BUS = (function () {
    var ESPACIOS = /[    ]/;
    function normMap(s) {
      s = String(s == null ? "" : s);
      var cs = [], ix = [];
      for (var i = 0; i < s.length; i++) {
        var ch = s[i];
        if (ESPACIOS.test(ch)) ch = " ";
        var d = ch.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        for (var k = 0; k < d.length; k++) { cs.push(d[k]); ix.push(i); }
      }
      var t = cs.join(""), borrar = {};
      /* miles separados por espacio: 1 a 3 cifras y luego grupos de exactamente 3 cifras */
      var re = /(^|[^0-9,.])(\d{1,3}(?: \d{3})+)(?![0-9])/g, m;
      while ((m = re.exec(t))) {
        var ini = m.index + m[1].length, grupo = m[2];
        for (var j = 0; j < grupo.length; j++) if (grupo[j] === " ") borrar[ini + j] = 1;
      }
      var cs2 = [], ix2 = [];
      for (var q = 0; q < cs.length; q++) if (!borrar[q]) { cs2.push(cs[q]); ix2.push(ix[q]); }
      /* punto decimal entre cifras se escribe como coma */
      for (var r = 1; r < cs2.length - 1; r++) if (cs2[r] === "." && /\d/.test(cs2[r - 1]) && /\d/.test(cs2[r + 1])) cs2[r] = ",";
      return { t: cs2.join(""), map: ix2 };
    }
    function norm(s) { return normMap(s).t; }
    function esNumero(tok) { return /^\d+(,\d+)?$/.test(tok); }
    function tokens(q) {
      return norm(q).split(/\s+/).map(function (p) { return p.replace(/^[^0-9a-zñ]+|[^0-9a-zñ]+$/g, ""); }).filter(Boolean);
    }
    function dig(c) { return c != null && c >= "0" && c <= "9"; }
    /* posiciones donde aparece tok en t. Un número debe coincidir completo: 3,63 no aparece en 13,63 ni en 3,635 */
    function posiciones(t, tok, max) {
      var out = [], desde = 0, num = esNumero(tok);
      while (out.length < (max || 1e9)) {
        var p = t.indexOf(tok, desde);
        if (p < 0) break;
        desde = p + 1;
        if (num) {
          var a = t[p - 1], b = t[p + tok.length];
          if (dig(a) || (a === "," && dig(t[p - 2]))) continue;
          if (dig(b) || (b === "," && dig(t[p + tok.length + 1]))) continue;
        }
        out.push(p);
      }
      return out;
    }
    function aparece(t, tok) { return posiciones(t, tok, 1).length > 0; }
    function buscar(indice, q, max) {
      var ps = tokens(q);
      if (!ps.length) return [];
      return indice.map(function (e, n) {
        var tt = e._t || (e._t = norm(e.t)), tx = e._x || (e._x = norm(e.x)), puntos = 0;
        for (var i = 0; i < ps.length; i++) {
          var enT = aparece(tt, ps[i]), enX = aparece(tx, ps[i]);
          if (!enT && !enX) return null;
          puntos += (enT ? 10 : 0) + (enX ? 2 : 0);
        }
        return { e: e, p: puntos, n: n };
      }).filter(Boolean).sort(function (a, b) { return b.p - a.p || a.n - b.n; })
        /* una sección larga puede tener varias partes: se muestra solo la primera que coincide */
        .filter(function (r, i, arr) { for (var k = 0; k < i; k++) if (arr[k].e.u === r.e.u) return false; return true; })
        .slice(0, max || 14);
    }
    /* devuelve HTML escapado con <mark> en cada coincidencia, sobre el texto original */
    function resaltar(txt, ps) {
      var nm = normMap(txt), rangos = [];
      ps.forEach(function (p) {
        if (p.length < 3 && !esNumero(p)) return;
        posiciones(nm.t, p).forEach(function (i) { rangos.push([nm.map[i], nm.map[i + p.length - 1] + 1]); });
      });
      rangos.sort(function (a, b) { return a[0] - b[0]; });
      var out = "", cur = 0;
      rangos.forEach(function (r) {
        if (r[1] <= cur) return;
        var ini = Math.max(cur, r[0]);
        out += esc(txt.slice(cur, ini)) + "<mark>" + esc(txt.slice(ini, r[1])) + "</mark>";
        cur = r[1];
      });
      return out + esc(txt.slice(cur));
    }
    /* fragmento del texto original alrededor de la primera coincidencia */
    function extracto(x, ps, largo) {
      largo = largo || 170;
      var nm = normMap(x), pos = -1;
      for (var i = 0; i < ps.length && pos < 0; i++) { var p = posiciones(nm.t, ps[i], 1); if (p.length) pos = nm.map[p[0]]; }
      if (pos < 0) pos = 0;
      var ini = Math.max(0, pos - 60);
      if (ini > 0) { var esp = x.lastIndexOf(" ", ini); if (esp > ini - 20) ini = esp + 1; }
      var fin = Math.min(x.length, ini + largo);
      if (fin < x.length) { var e2 = x.indexOf(" ", fin); if (e2 > 0 && e2 < fin + 20) fin = e2; }
      return { texto: x.slice(ini, fin), antes: ini > 0, despues: fin < x.length };
    }
    return { normMap: normMap, norm: norm, tokens: tokens, posiciones: posiciones, buscar: buscar, resaltar: resaltar, extracto: extracto };
  })();
  S.busqueda = BUS;

  /* Sin datos de uso del sitio, el buscador vacío ofrece temas que suelen preguntarse en una defensa y las
     búsquedas recientes de quien lo usa, guardadas solo en su navegador. */
  var SUGERIDAS = ["PID discreto", "A estrella", "SLAM", "AMCL", "odometría", "fronteras", "metas abortadas", "PSO", "gemelo digital", "costo", "3,63", "ventana dinámica"];

  function buscador() {
    var dlg = document.querySelector(".search-dialog"), botones = [].slice.call(document.querySelectorAll("[data-search-open]"));
    if (!dlg || typeof dlg.showModal !== "function") return;
    var input = dlg.querySelector("input"), lista = dlg.querySelector(".search-results"), estado = dlg.querySelector(".search-status"), sug = dlg.querySelector(".search-suggest");
    var indice = null, cargando = false, origen = null;
    function recientes() { try { var l = JSON.parse(leer("busquedas", "[]")); return Array.isArray(l) ? l.filter(function (x) { return typeof x === "string" && x; }).slice(0, 6) : []; } catch (e) { return []; } }
    function recordar(q) {
      q = q.trim(); if (!q) return;
      var l = recientes().filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); }); l.unshift(q);
      guardar("busquedas", JSON.stringify(l.slice(0, 6)));
    }
    function chips(l, reciente) { return '<ul>' + l.map(function (q) { return '<li><button type="button" class="chip' + (reciente ? ' reciente' : '') + '" data-q="' + esc(q) + '">' + esc(q) + '</button></li>'; }).join("") + '</ul>'; }
    function vacio() {
      var r = recientes();
      lista.innerHTML = "";
      sug.innerHTML = (r.length ? '<section><h2><span>' + RECIENTE + 'Tus búsquedas recientes</span><button type="button" class="borrar" data-borrar>Borrar</button></h2>' + chips(r, true) + '</section>' : '') +
        '<section><h2><span>Búsquedas sugeridas</span></h2>' + chips(SUGERIDAS, false) + '</section>';
      sug.hidden = false;
      estado.textContent = "Escribe al menos dos caracteres o elige una búsqueda.";
    }
    function cargar(cb) {
      if (indice) { cb(); return; }
      if (window.INDICE) { indice = window.INDICE; cb(); return; }
      if (cargando) return; cargando = true;
      estado.textContent = "Cargando el índice de búsqueda…";
      var s = document.createElement("script"); s.src = "datos/indice.js";
      s.onload = function () { cargando = false; indice = window.INDICE || []; cb(); };
      s.onerror = function () {
        cargando = false; s.remove();
        estado.innerHTML = 'No se pudo cargar el índice. <button type="button" class="borrar" data-reintentar>Reintentar</button> o consulta la <a href="index.html#temas">guía completa</a>.';
      };
      document.head.appendChild(s);
    }
    function buscar() {
      var q = input.value.trim();
      if (q.length < 2) { vacio(); return; }
      sug.hidden = true;
      var ps = BUS.tokens(q), res = BUS.buscar(indice, q, 14);
      if (!res.length) { lista.innerHTML = ""; estado.innerHTML = 'Sin resultados para «' + esc(q) + '». Prueba con un término más general o revisa el <a href="recursos.html#glosario">glosario</a>.'; return; }
      estado.textContent = res.length + (res.length === 1 ? " sección encontrada." : " secciones encontradas.");
      lista.innerHTML = res.map(function (r, i) {
        var e = r.e, ex = BUS.extracto(e.x, ps, 170);
        return '<li><a href="' + esc(e.u) + '"' + (i === 0 ? ' class="sel"' : '') + '><span>' + esc(e.p) + '</span><strong>' + BUS.resaltar(e.t, ps) + '</strong><p>' + (ex.antes ? "…" : "") + BUS.resaltar(ex.texto, ps) + (ex.despues ? "…" : "") + '</p></a></li>';
      }).join("");
    }
    function abrir(e) {
      origen = (e && e.currentTarget) || document.activeElement;
      dlg.showModal(); input.focus(); input.select();
      cargar(buscar);
    }
    botones.forEach(function (b) { b.classList.add("listo"); b.addEventListener("click", abrir); });
    dlg.querySelector("[data-search-close]").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) {
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
    });
    dlg.addEventListener("close", function () { if (origen && origen.focus && document.contains(origen)) origen.focus(); });
    var t = null;
    input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { if (indice) buscar(); }, 90); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        clearTimeout(t); if (indice) buscar();
        var a = lista.querySelector("a");
        if (a) { e.preventDefault(); recordar(input.value); var h = a.getAttribute("href"); dlg.close(); location.href = h; }
      }
      /* un campo de búsqueda con texto gasta el primer Escape en borrarlo: aquí cierra de inmediato */
      if (e.key === "Escape") { e.preventDefault(); dlg.close(); }
    });
    dlg.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      var as = [].slice.call(sug.hidden ? lista.querySelectorAll("a") : sug.querySelectorAll("button")), i = as.indexOf(document.activeElement);
      if (document.activeElement === input) { if (e.key === "ArrowDown" && as.length) { e.preventDefault(); as[0].focus(); } return; }
      if (i < 0) return;
      e.preventDefault();
      if (e.key === "ArrowDown" && i < as.length - 1) as[i + 1].focus();
      if (e.key === "ArrowUp") { if (i > 0) as[i - 1].focus(); else input.focus(); }
    });
    /* al recorrer los resultados con el teclado, solo el enfocado queda marcado */
    lista.addEventListener("focusin", function (e) { var a = e.target.closest("a"); if (!a) return; [].forEach.call(lista.querySelectorAll("a.sel"), function (x) { if (x !== a) x.classList.remove("sel"); }); });
    dlg.addEventListener("click", function (e) {
      if (e.target.closest(".search-results a")) { recordar(input.value); dlg.close(); return; }
      var c = e.target.closest("[data-q]");
      if (c) { input.value = c.getAttribute("data-q"); cargar(buscar); input.focus(); return; }
      if (e.target.closest("[data-borrar]")) { guardar("busquedas", null); vacio(); input.focus(); return; }
      if (e.target.closest("[data-reintentar]")) cargar(buscar);
    });
    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      var atajo = (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k";
      if (atajo || (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(tag))) {
        if (dlg.open) { if (atajo) { e.preventDefault(); dlg.close(); } return; }
        e.preventDefault(); abrir();
      }
    });
  }

  /* Resaltado de marcador en todo el sitio: los <mark>, los .resalta y las negritas de los párrafos de la guía.
     El trazo se dibuja de izquierda a derecha cuando el texto llega a la pantalla, como si alguien lo pasara con
     un marcador, y los de un mismo párrafo van uno tras otro. El script del <head> marca resaltado-animado antes
     de pintar. Sin JavaScript, con movimiento reducido o si este archivo no llega, el resaltado ya está puesto. */
  var RESALTABLES = "mark, .resalta, .articulo :is(p, li, dd) > :is(b, strong):not(.bib-donde > b, .bib-cita-tesis > b, .bib-diferencia > b, .bib-codigo > b, .q-respaldo > b)";
  function resaltados() {
    var raiz = document.documentElement;
    if (!raiz.classList.contains("resaltado-animado")) return;
    window.__resaltado = true;
    var lista;
    try { lista = document.querySelectorAll(RESALTABLES); } catch (e) { raiz.classList.remove("resaltado-animado"); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("resaltado-listo"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -15% 0px" });
    var porParrafo = typeof Map === "function" ? new Map() : null;
    [].forEach.call(lista, function (el) {
      var p = el.parentElement, orden = porParrafo ? (porParrafo.get(p) || 0) : 0;
      if (porParrafo) porParrafo.set(p, orden + 1);
      var largo = (el.textContent || "").length;
      el.style.setProperty("--resalta-dur", Math.min(1.5, Math.max(.5, largo * .03)).toFixed(2) + "s");
      el.style.setProperty("--resalta-retraso", (orden * .4).toFixed(2) + "s");
      el.classList.add("resaltable");
      io.observe(el);
    });
    S.resaltar = function (contenedor) {
      [].forEach.call((contenedor || document).querySelectorAll(RESALTABLES), function (el) { if (!el.classList.contains("resaltable")) { el.classList.add("resaltable"); io.observe(el); } });
    };
  }

  function arrancar() {
    [tema, menu, buscador, resaltados].forEach(function (f) { try { f(); } catch (e) { if (window.console) console.error(e); } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();
})();
