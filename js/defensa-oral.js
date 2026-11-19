/*
  Práctica de defensa oral. Lo carga js/preguntas.js la primera vez que se pulsa «Practicar defensa oral».

  Abre un diálogo con dos modos: Entrenar (una pregunta, hasta dos intentos) y Simular (tres preguntas distintas,
  un envío por cada una). Con la dirección del servicio vacía en js/defensa-config.js nunca toca la red: el
  estudiante escribe y compara con la guía. Con servicio, sigue el contrato de docs/defensa/especificacion.md (7.3).
  Lo escrito vive solo en memoria. Nunca se guarda en el navegador.
*/
(function () {
  "use strict";

  var CFG = window.DEFENSA_CONFIG || {};
  var API = String(CFG.api || "").replace(/\/+$/, "");
  var SONDEO_MS = CFG.sondeoMs > 0 ? CFG.sondeoMs : 2000;
  var PLAZO_MS = CFG.plazoMs > 0 ? CFG.plazoMs : 30000;
  var MAX = 4000;

  var CAUSAS = {
    disagreement: "Las tres lecturas no coincidieron, así que no hay una evaluación fiable.",
    insufficient_evidence: "Tu respuesta no tiene evidencia suficiente para evaluarla. Prueba con más detalle.",
    pending_guide: "Pendiente de confirmación. Esta pregunta aún no tiene una rúbrica aprobada.",
    ai_unavailable: "El corrector no está disponible ahora.",
    quota_exhausted: "Se agotó el cupo de correcciones."
  };
  var VEREDICTOS = { correcta: "Respuesta correcta", parcial: "Respuesta parcial", incorrecta: "Respuesta incorrecta", indeterminada: "Sin veredicto" };

  var dlg, cuerpo, estadoEl, origen, entrada, catalogo, evaluables;
  var generacion = 0, contador = 0, token = null, sesionEnCurso = null, scrollAlAbrir = null;

  /* ── utilidades ── */
  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function boton(texto, clase, alPulsar) {
    var b = el("button", "btn " + (clase || ""), texto);
    b.type = "button";
    b.addEventListener("click", alPulsar);
    return b;
  }
  function anunciar(t) { estadoEl.textContent = t; }
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    var h = [].map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    return h.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
  }
  function aleatorias(lista, n) {
    var c = lista.slice(), r = [];
    while (r.length < n && c.length) r.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
    return r;
  }
  function pregunta(d) {
    var t = d.querySelector(".q-t");
    return { id: d.id, el: d, enunciado: t ? t.textContent.trim() : d.id };
  }
  function elegibles(tarjetas) {
    return tarjetas.filter(function (d) { return d.getAttribute("data-respuesta") === "guia"; }).map(pregunta);
  }
  function fuenteSegura(h) { return typeof h === "string" && h && !/^[a-z][a-z0-9+.-]*:/i.test(h) && h.indexOf("//") !== 0; }

  /* ── diálogo ── */
  function crearDialogo() {
    if (dlg) return;
    dlg = el("dialog", "dv-dialogo");
    dlg.setAttribute("aria-labelledby", "dv-titulo");
    var cab = el("div", "dv-cab");
    var h = el("h2", "", "Práctica de defensa oral");
    h.id = "dv-titulo";
    cab.appendChild(h);
    cab.appendChild(boton("Cerrar", "chico dv-cerrar", function () { dlg.close(); }));
    estadoEl = el("p", "dv-estado");
    estadoEl.setAttribute("role", "status");
    estadoEl.setAttribute("aria-live", "polite");
    cuerpo = el("div", "dv-cuerpo");
    dlg.appendChild(cab);
    dlg.appendChild(estadoEl);
    dlg.appendChild(cuerpo);
    dlg.addEventListener("close", function () {
      generacion++;
      if (scrollAlAbrir && (window.scrollX !== scrollAlAbrir.x || window.scrollY !== scrollAlAbrir.y)) window.scrollTo(scrollAlAbrir.x, scrollAlAbrir.y);
      if (origen) origen.focus({ preventScroll: true });
    });
    document.body.appendChild(dlg);
  }
  function vista(nodos, enfocar) {
    generacion++;
    cuerpo.textContent = "";
    nodos.forEach(function (n) { cuerpo.appendChild(n); });
    anunciar("");
    if (enfocar) { enfocar.setAttribute("tabindex", "-1"); enfocar.focus({ preventScroll: true }); }
  }
  function titulo3(t) { var h = el("h3", "dv-h", t); h.id = "dv-h" + (++contador); return h; }

  /* ── catálogo: versión y evaluables. Si falta, el panel trabaja solo con la guía ── */
  function leerCatalogo() {
    catalogo = null; evaluables = {};
    if (!window.fetch) return Promise.resolve();
    return fetch(new URL("datos/defensa/catalogo.json", document.baseURI).href, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("catálogo");
      return r.json();
    }).then(function (c) {
      if (!c || typeof c.version !== "string" || !Array.isArray(c.preguntas)) throw new Error("catálogo");
      catalogo = c;
      c.preguntas.forEach(function (p) { if (p && p.evaluable === true) evaluables[p.id] = true; });
    }).catch(function () { catalogo = null; evaluables = {}; });
  }

  /* ── cliente del contrato (7.3) ── */
  function aviso(mensaje, guia) { return { tipo: "aviso", mensaje: mensaje, guia: !!guia }; }
  var FALLA = function () { return aviso("No se pudo obtener la corrección. Tu borrador sigue aquí y puedes comparar con la guía.", true); };

  function conSesion() {
    if (token) return Promise.resolve(token);
    if (!sesionEnCurso) sesionEnCurso = fetch(API + "/v1/sesiones", { method: "POST" }).then(function (r) {
      if (r.status !== 201 && r.status !== 200) throw new Error("sesión");
      return r.json();
    }).then(function (j) {
      if (!j || typeof j.token !== "string") throw new Error("sesión");
      token = j.token; sesionEnCurso = null; return token;
    }, function (e) { sesionEnCurso = null; throw e; });
    return sesionEnCurso;
  }
  function cabeceras(tk, json) {
    var h = { authorization: "Bearer " + tk };
    if (json) h["content-type"] = "application/json";
    return h;
  }
  function horaReinicio(r) {
    var s = parseInt(r.headers.get("Retry-After"), 10);
    if (!(s > 0)) return "";
    var h = new Date(Date.now() + s * 1000).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
    return " El cupo se reinicia a las " + h + ".";
  }
  function interpretar(r, c) {
    if (c.gen !== generacion) return { tipo: "cancelado" };
    var s = r.status;
    if (s === 401 && !c.reintento) { token = null; return evaluar(c.q, c.texto, c.modo, true, c); }
    if (s === 202) return sondear(c);
    if (s === 410) return aviso("La corrección caducó. Envía tu respuesta otra vez.");
    if (s === 429) return aviso("Se agotó el cupo de correcciones." + horaReinicio(r));
    if (s === 409) return r.json().catch(function () { return {}; }).then(function (j) {
      return aviso(j && j.causa === "version" ?
        "La guía cambió desde que abriste la página. Recárgala para practicar con la versión nueva." :
        "Ese envío ya existe con otro texto. Vuelve a enviar tu respuesta.");
    });
    if (s !== 200) return FALLA();
    return r.json().then(function (j) {
      if (!j || typeof j !== "object") return FALLA();
      if (j.estado === "en_curso") return sondear(c);
      if (j.estado === "evaluada" && typeof j.veredicto === "string") return { tipo: "evaluada", data: j };
      if (j.estado === "no_evaluable") return { tipo: "no_evaluable", causa: j.causa, data: j };
      return FALLA();
    });
  }
  function sondear(c) {
    return esperar(SONDEO_MS).then(function () {
      if (c.gen !== generacion) return { tipo: "cancelado" };
      if (Date.now() - c.inicio >= PLAZO_MS) return aviso("La corrección tarda más de lo normal. Puedes seguir con la guía mientras tanto.", true);
      return fetch(API + "/v1/evaluaciones/" + c.rid, { headers: cabeceras(c.token, false) }).then(function (r) { return interpretar(r, c); });
    });
  }
  function evaluar(q, texto, modo, reintento, previo) {
    var c = { q: q, texto: texto, modo: modo, reintento: !!reintento, rid: uuid(), gen: previo ? previo.gen : generacion, inicio: Date.now(), token: null };
    return conSesion().then(function (tk) {
      c.token = tk;
      return fetch(API + "/v1/evaluaciones", {
        method: "POST", headers: cabeceras(tk, true),
        body: JSON.stringify({ request_id: c.rid, question_id: q.id, version_catalogo: catalogo.version, modo: modo, respuesta: texto })
      });
    }).then(function (r) { return interpretar(r, c); }).catch(FALLA);
  }
  /* Punto único de envío. Sin servicio, sin catálogo o con la pregunta no evaluable, no hay red. */
  function enviar(q, texto, modo) {
    if (!API) return Promise.resolve(aviso("Este panel no tiene corrector conectado. Compara tu borrador con la guía.", true));
    if (!catalogo) return Promise.resolve(aviso("No se pudo leer el catálogo de la práctica. Compara tu borrador con la guía.", true));
    if (!evaluables[q.id]) return Promise.resolve({ tipo: "no_evaluable", causa: "pending_guide", data: {}, guia: true });
    return evaluar(q, texto, modo, false, null);
  }

  /* ── guía y resultado ── */
  function nodoGuia(q) {
    var caja = el("div", "dv-guia");
    var h = el("h4", "", "Respuesta de la guía");
    h.setAttribute("tabindex", "-1");
    caja.appendChild(h);
    var orig = q.el.querySelector(".q-cuerpo");
    if (orig) {
      var copia = orig.cloneNode(true);
      [].forEach.call(copia.querySelectorAll(".q-velo, .q-tu-respuesta"), function (n) { n.remove(); });
      [].forEach.call(copia.querySelectorAll("[id]"), function (n) { n.removeAttribute("id"); });
      [].forEach.call(copia.querySelectorAll("a[href^='#']"), function (a) { a.replaceWith(el("span", "", a.textContent)); });
      copia.removeAttribute("tabindex");
      copia.className = "dv-guia-texto";
      caja.appendChild(copia);
    }
    return caja;
  }
  function criterio(data, id) {
    var l = (data && data.criterios) || [];
    for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i];
    return null;
  }
  function nodoResultado(res, extra) {
    var caja = el("div", "dv-res");
    if (extra) caja.appendChild(el("p", "dv-intento", extra));
    if (res.tipo === "evaluada") {
      var d = res.data, v = /^(correcta|parcial|incorrecta|indeterminada)$/.test(d.veredicto) ? d.veredicto : "indeterminada";
      caja.classList.add("dv-v-" + v);
      caja.appendChild(el("p", "dv-veredicto", VEREDICTOS[v]));
      var fuentes = [];
      function fila(rotulo, id) {
        var c = id && criterio(d, id);
        if (!c) return;
        var p = el("p", "dv-fila");
        p.appendChild(el("b", "", rotulo + " "));
        p.appendChild(document.createTextNode(String(c.texto || c.id)));
        caja.appendChild(p);
        if (fuenteSegura(c.fuente) && fuentes.indexOf(c.fuente) < 0) fuentes.push(c.fuente);
      }
      fila("Lo que acertaste:", d.acierto);
      fila("Para mejorar:", d.mejorar);
      if (typeof d.pista === "string" && d.pista) {
        var pp = el("p", "dv-fila");
        pp.appendChild(el("b", "", "Pista: "));
        pp.appendChild(document.createTextNode(d.pista));
        caja.appendChild(pp);
      }
      if (fuentes.length) {
        var ul = el("ul", "dv-fuentes");
        fuentes.forEach(function (f) {
          var li = el("li"), a = el("a", "", "Leer la fuente: " + f);
          a.href = f; a.target = "_blank"; a.rel = "noopener";
          li.appendChild(a); ul.appendChild(li);
        });
        caja.appendChild(ul);
      }
    } else if (res.tipo === "no_evaluable") {
      caja.classList.add("dv-v-aviso");
      caja.appendChild(el("p", "dv-veredicto", "No se pudo evaluar"));
      caja.appendChild(el("p", "dv-fila", CAUSAS[res.causa] || "No se pudo evaluar esta respuesta."));
    } else {
      caja.classList.add("dv-v-aviso");
      caja.appendChild(el("p", "dv-fila", res.mensaje));
    }
    return caja;
  }

  /* ── un bloque de pregunta: enunciado, borrador, revisión y envío ── */
  function crearBloque(q, cfg) {
    var n = ++contador, b = { q: q, guiaVista: false, intentos: 0 };
    var raiz = el("section", "dv-pregunta");
    var h = el("h3", "dv-enunciado", q.enunciado);
    h.id = "dv-e" + n;
    raiz.setAttribute("aria-labelledby", h.id);
    var lab = el("label", "", "Tu respuesta. No se guarda en el navegador.");
    lab.setAttribute("for", "dv-t" + n);
    var ta = el("textarea");
    ta.id = "dv-t" + n; ta.rows = 6; ta.maxLength = MAX;
    var voz = el("div", "dv-voz");
    var acciones = el("div", "dv-acciones");
    var revisar = boton("Revisar antes de enviar", "prim", function () {
      var t = ta.value;
      if (!t.trim()) { anunciar("Escribe tu respuesta antes de revisarla."); ta.focus(); return; }
      if (t.length > MAX) { anunciar("La respuesta pasa de " + MAX + " caracteres."); ta.focus(); return; }
      pre.textContent = t;
      ta.readOnly = true;
      acciones.hidden = true; rev.hidden = false;
      confirmar.focus();
    });
    var soloGuia = function () { return boton("Seguir solo con la guía", "", function () { cfg.soloGuia(b); }); };
    acciones.appendChild(revisar); acciones.appendChild(soloGuia());
    var rev = el("div", "dv-revision");
    rev.hidden = true;
    rev.appendChild(el("p", "", "Esto es lo que se enviará, tal como lo escribiste."));
    var pre = el("pre", "dv-texto");
    rev.appendChild(pre);
    var fila = el("div", "dv-acciones");
    var confirmar = boton("Confirmar", "prim", function () {
      b.ocupado(true);
      anunciar("Enviando tu respuesta…");
      Promise.resolve(cfg.confirmar(ta.value, b)).then(function () { b.ocupado(false); });
    });
    var editar = boton("Seguir editando", "", function () { b.editar(); });
    fila.appendChild(confirmar); fila.appendChild(editar); fila.appendChild(soloGuia());
    rev.appendChild(fila);
    var resultado = el("div", "dv-resultado");
    var guia = el("div", "dv-guia-lugar");
    [h, lab, ta, voz, acciones, rev, resultado, guia].forEach(function (n2) { raiz.appendChild(n2); });

    b.raiz = raiz; b.ta = ta; b.titulo = h; b.resultado = resultado; b.acciones = acciones; b.revisar = revisar;
    b.ocupado = function (si) {
      raiz.setAttribute("aria-busy", String(si));
      [].forEach.call(rev.querySelectorAll("button"), function (x) { x.disabled = si; });
    };
    b.editar = function () {
      ta.readOnly = false; rev.hidden = true; acciones.hidden = false; ta.focus();
    };
    b.mostrarGuia = function (enfocar) {
      if (!b.guiaVista) { guia.appendChild(nodoGuia(q)); b.guiaVista = true; }
      if (enfocar) guia.querySelector("h4").focus({ preventScroll: false });
    };
    b.mostrarResultado = function (res, extra) {
      resultado.textContent = "";
      resultado.appendChild(nodoResultado(res, extra));
      rev.hidden = true;
    };
    if (window.DefensaVoz && typeof window.DefensaVoz.montar === "function") {
      try { window.DefensaVoz.montar({ textarea: ta, enunciado: q.enunciado, contenedor: voz }); } catch (e) { /* el panel sigue con texto */ }
    }
    return b;
  }

  /* ── pasos ── */
  function cargando() { vista([el("p", "", "Cargando…")]); }

  function inicio() {
    var lista = elegibles(entrada.preguntas);
    var h = titulo3("¿Cómo quieres practicar?");
    var nodos = [h];
    nodos.push(el("p", "", lista.length === 1 ? "Hay 1 pregunta con guía en tu selección actual." : "Hay " + lista.length + " preguntas con guía en tu selección actual. Los filtros de la página deciden cuáles."));
    if (!API) nodos.push(el("p", "dv-nota", "Este panel no tiene corrector conectado. Escribe tu respuesta y compárala con la guía."));
    else if (!catalogo) nodos.push(el("p", "dv-nota", "No se pudo leer el catálogo de la práctica. Solo podrás comparar con la guía."));
    var modos = el("div", "dv-modos");
    [["Entrenar", "Una pregunta. Puedes intentarlo dos veces y ver la guía cuando quieras.", function () { entrenar(null); }],
     ["Simular", "Tres preguntas distintas. Un envío por pregunta y los comentarios al final.", function () { simular(); }]].forEach(function (m) {
      var caja = el("div", "dv-modo");
      caja.appendChild(boton(m[0], "prim", m[2]));
      caja.appendChild(el("p", "", m[1]));
      modos.appendChild(caja);
    });
    nodos.push(modos);
    vista(nodos, h);
  }
  function volver() { return boton("Volver al inicio", "chico", inicio); }

  function sinPreguntas() {
    var h = titulo3("No hay preguntas para practicar");
    vista([h, el("p", "", "Ninguna pregunta visible tiene guía. Quita algún filtro de la página, o elige otro respaldo, y vuelve a abrir el panel."), volver()], h);
  }

  /* Entrenar */
  function entrenar(previa) {
    var lista = elegibles(entrada.preguntas);
    if (!lista.length) return sinPreguntas();
    var otras = lista.length > 1 && previa ? lista.filter(function (x) { return x.id !== previa; }) : lista;
    var q = aleatorias(otras, 1)[0];
    var bloque;
    bloque = crearBloque(q, {
      confirmar: function (texto, b) {
        var asistida = b.guiaVista, gen = generacion;
        return enviar(q, texto, "entrenar").then(function (res) {
          if (res.tipo === "cancelado" || gen !== generacion) return;
          var delServicio = res.tipo !== "aviso" && !res.guia;
          if (delServicio) b.intentos++;
          var rotulo = delServicio ? "Intento " + b.intentos + " de 2" + (asistida ? ", práctica asistida" : "") : null;
          b.mostrarResultado(res, rotulo);
          if (res.guia) b.mostrarGuia(false);
          anunciar(res.tipo === "evaluada" ? VEREDICTOS[res.data.veredicto] || "Corrección lista." : "La corrección no se pudo completar.");
          botonesResultado(b);
          if (b.intentos >= 2) { b.acciones.hidden = true; b.ta.readOnly = true; b.resultado.appendChild(el("p", "dv-nota", "Usaste tus dos intentos con esta pregunta.")); }
          else { b.editar(); }
        });
      },
      soloGuia: function (b) {
        b.editar();
        b.acciones.hidden = true;
        b.mostrarGuia(true);
        anunciar("Guía abierta. Sigues solo con la guía.");
      }
    });
    function botonesResultado(b) {
      if (b.guiaVista) return;
      var ver = boton("Ver la respuesta de la guía", "chico", function () {
        b.mostrarGuia(true); ver.remove();
        anunciar("Guía abierta. Los intentos siguientes cuentan como práctica asistida.");
      });
      b.resultado.appendChild(ver);
    }
    var nav = el("div", "dv-nav");
    nav.appendChild(boton("Otra pregunta", "chico", function () { entrenar(q.id); }));
    nav.appendChild(volver());
    vista([bloque.raiz, nav], bloque.titulo);
  }

  /* Simular */
  function simular(tarjetas) {
    var base = Array.isArray(tarjetas) ? tarjetas : entrada.preguntas;
    var lista = elegibles(base);
    if (lista.length < 3) return pocasPreguntas(lista, base);
    iniciarSimulacion(aleatorias(lista, 3));
  }
  function pocasPreguntas(lista, base) {
    var h = titulo3("Faltan preguntas para simular");
    var n = lista.length;
    var nodos = [h, el("p", "", "Simular pide tres preguntas distintas con guía. En tu selección " + (n === 1 ? "hay 1." : n === 0 ? "no hay ninguna." : "hay " + n + "."))];
    var fila = el("div", "dv-acciones");
    var todas = typeof entrada.ampliadas === "function" ? entrada.ampliadas() : [];
    if (elegibles(todas).length > n) fila.appendChild(boton("Ampliar a todos los temas", "prim", function () { simular(todas); }));
    if (n > 0) fila.appendChild(boton("Practicar con " + n, "", function () { iniciarSimulacion(aleatorias(lista, n)); }));
    fila.appendChild(boton("Seguir solo con la guía", "", function () { soloGuiaLista(lista); }));
    nodos.push(fila); nodos.push(volver());
    vista(nodos, h);
  }
  function soloGuiaLista(lista) {
    var h = titulo3("Guía de las preguntas");
    var nodos = [h];
    if (!lista.length) nodos.push(el("p", "", "No hay preguntas con guía en esta selección."));
    lista.slice(0, 3).forEach(function (q) { nodos.push(el("h4", "dv-enunciado", q.enunciado)); nodos.push(nodoGuia(q)); });
    nodos.push(volver());
    vista(nodos, h);
  }
  function iniciarSimulacion(qs) {
    var items = [], actual = 0, enviando = false;
    var cab = el("p", "dv-paso");
    var cajas = el("div", "dv-bloques");
    var gen = (vista([cab, cajas]), generacion);
    function mostrar() {
      cab.textContent = "Pregunta " + (actual + 1) + " de " + qs.length;
      items.forEach(function (it, i) { it.b.raiz.hidden = i !== actual; });
      var b = items[actual].b;
      b.titulo.setAttribute("tabindex", "-1"); b.titulo.focus({ preventScroll: true });
      anunciar(cab.textContent);
    }
    function avanzar() {
      if (actual < qs.length - 1) { actual++; mostrar(); return Promise.resolve(); }
      return terminar();
    }
    qs.forEach(function (q, i) {
      var it = { q: q, texto: null, omitida: false };
      it.b = crearBloque(q, {
        confirmar: function (texto) { it.texto = texto; return avanzar(); },
        soloGuia: function () { it.omitida = true; it.texto = null; avanzar(); }
      });
      if (i === qs.length - 1) it.b.raiz.insertBefore(el("p", "dv-nota", "Es la última pregunta. Al confirmar se piden las evaluaciones de todas."), it.b.titulo.nextSibling);
      items.push(it); cajas.appendChild(it.b.raiz);
    });
    function terminar() {
      if (enviando) return Promise.resolve();
      enviando = true;
      var pend = items.filter(function (it) { return it.texto != null; });
      return Promise.all(pend.map(function (it) {
        return enviar(it.q, it.texto, "simular").then(function (r) { it.res = r; });
      })).then(function () {
        if (gen !== generacion) return;
        resumen(items);
      });
    }
    mostrar();
  }
  function resumen(items) {
    var h = titulo3("Comentarios de la simulación");
    var nodos = [h];
    var evaluadas = items.filter(function (it) { return it.res && it.res.tipo === "evaluada"; }).length;
    nodos.push(el("p", "", evaluadas === items.length ? "Las " + items.length + " preguntas recibieron evaluación." :
      evaluadas + " de " + items.length + " preguntas recibieron evaluación. De las demás se muestra la guía."));
    items.forEach(function (it) {
      var s = el("section", "dv-pregunta");
      s.appendChild(el("h4", "dv-enunciado", it.q.enunciado));
      var res = it.res;
      if (!res) s.appendChild(el("p", "dv-nota", "Sin enviar. Elegiste seguir solo con la guía."));
      else s.appendChild(nodoResultado(res));
      if (!res || res.tipo !== "evaluada") s.appendChild(nodoGuia(it.q));
      nodos.push(s);
    });
    var nav = el("div", "dv-nav");
    nav.appendChild(boton("Simular otra vez", "chico", function () { simular(); }));
    nav.appendChild(volver());
    nodos.push(nav);
    vista(nodos, h);
    anunciar("Simulación terminada. " + evaluadas + " de " + items.length + " evaluadas.");
  }

  /* ── entrada pública ── */
  function abrir(opciones) {
    crearDialogo();
    entrada = opciones || { preguntas: [] };
    origen = entrada.origen || document.getElementById("q-defensa");
    scrollAlAbrir = { x: window.scrollX, y: window.scrollY };
    token = null; sesionEnCurso = null;
    if (!dlg.open) dlg.showModal();
    cargando();
    var g = generacion;
    leerCatalogo().then(function () { if (g === generacion && dlg.open) inicio(); });
  }

  window.DefensaOral = { abrir: abrir };
})();
