/*
  Voz de la práctica de defensa oral (docs/defensa/especificacion.md, apartado 8). Lo carga js/defensa-oral.js la
  primera vez que se muestra una pregunta y expone window.DefensaVoz.montar({textarea, enunciado, contenedor}).

  Agrega tres controles a cada pregunta:
  - «Escuchar pregunta»: speechSynthesis con una voz en español que funcione sin red (localService).
  - «Dictar en este navegador»: Whisper tiny dentro de un Web Worker, con los archivos de voz/ servidos por este sitio.
    Antes de descargar muestra el tamaño de voz/manifiesto.json y pide confirmar. El micrófono se pide al terminar.
  - «Dictado externo»: SpeechRecognition del navegador, solo tras aceptar el aviso de que el audio puede salir.

  El dictado agrega texto al borrador, nunca lo reemplaza. Nada se guarda en el navegador. La elección sobre el
  aviso del dictado externo vive solo en memoria. Al cerrar el panel o cambiar de pregunta, todo se detiene.
*/
(function () {
  "use strict";

  var AVISO_VERSION = 1;
  var AVISO_EXTERNO = "El audio puede procesarse en servidores del proveedor de tu navegador";
  var MAX_SEGUNDOS = 120;      /* tope de una grabación: acota la memoria */
  var PLAZO_TRANSCRIBIR_MS = 90000;
  var HZ = 16000;
  var TEXTO_FALLO = "No se pudo dictar en este navegador. Tu pregunta y lo escrito siguen aquí. Puedes escribir o usar el dictado externo.";

  var instancias = [];
  var consentimiento = null;   /* {aceptado, version, hora}, solo en memoria */
  var manifiesto = null;

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function boton(texto, clase, alPulsar) {
    var b = el("button", "btn chico " + (clase || ""), texto);
    b.type = "button";
    b.addEventListener("click", alPulsar);
    return b;
  }
  function megas(bytes) { return (bytes / 1e6).toFixed(1).replace(".", ",") + " MB"; }
  function reconocimiento() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }

  /* voz/manifiesto.json da el tamaño real. Si falta, esta copia del sitio no trae el dictado privado. */
  function leerManifiesto() {
    if (manifiesto) return Promise.resolve(manifiesto);
    return fetch(new URL("voz/manifiesto.json", document.baseURI).href, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("manifiesto");
      return r.json();
    }).then(function (m) {
      if (!m || typeof m.bytes_total !== "number" || !(m.bytes_total > 0)) throw new Error("manifiesto");
      manifiesto = m;
      return m;
    });
  }

  /* Junta los trozos grabados y los lleva a 16 kHz mono por interpolación lineal si el contexto no dio 16 kHz. */
  function unir(trozos, tasa) {
    var n = 0, i, j;
    for (i = 0; i < trozos.length; i++) n += trozos[i].length;
    var todo = new Float32Array(n), pos = 0;
    for (i = 0; i < trozos.length; i++) { todo.set(trozos[i], pos); pos += trozos[i].length; }
    if (tasa === HZ || !n) return todo;
    var m = Math.floor(n * HZ / tasa), sal = new Float32Array(m), paso = tasa / HZ;
    for (j = 0; j < m; j++) {
      var x = j * paso, a = Math.floor(x), f = x - a, b = a + 1 < n ? a + 1 : a;
      sal[j] = todo[a] * (1 - f) + todo[b] * f;
    }
    return sal;
  }

  function montar(opc) {
    var ta = opc.textarea, caja = opc.contenedor, enunciado = String(opc.enunciado || "");
    if (!ta || !caja || caja.getAttribute("data-voz-montada")) return;
    caja.setAttribute("data-voz-montada", "1");

    var inst = { contenedor: caja };
    var voz = null;                  /* voz en español sin red */
    var leyendo = false;
    var externo = null;              /* instancia de SpeechRecognition */
    var estado = "reposo";           /* reposo, consulta, confirmando, descargando, micro, grabando, transcribiendo */
    var worker = null, trabajadorListo = false, temporizador = null;
    var flujo = null, ctx = null, proc = null, fuente = null, trozos = null, muestras = 0;
    var gen = 0;                     /* invalida los pasos asíncronos de una acción ya cancelada */

    var estadoEl = el("p", "dv-voz-estado");
    estadoEl.setAttribute("aria-live", "polite");
    var area = el("div", "dv-voz-aviso");
    area.hidden = true;
    var bEscuchar = boton("Escuchar pregunta", "", alternarLectura);
    bEscuchar.hidden = true;
    var bPrivado = boton("Dictar en este navegador", "", alPulsarPrivado);
    var bExterno = reconocimiento() ? boton("Dictado externo", "", alPulsarExterno) : null;
    var bCancelar = boton("Cancelar", "", cancelar);
    bCancelar.hidden = true;
    [bEscuchar, bPrivado, bExterno, bCancelar, area, estadoEl].forEach(function (n) { if (n) caja.appendChild(n); });

    function decir(t) { estadoEl.textContent = t; }
    function pintar() {
      var ocupado = estado !== "reposo" && estado !== "grabando";
      bPrivado.textContent = estado === "grabando" ? "Terminar dictado" : "Dictar en este navegador";
      bPrivado.disabled = ocupado;
      if (bExterno) {
        bExterno.textContent = externo ? "Detener dictado externo" : "Dictado externo";
        bExterno.disabled = estado !== "reposo";
      }
      bEscuchar.textContent = leyendo ? "Detener lectura" : "Escuchar pregunta";
      bCancelar.hidden = !(estado === "consulta" || estado === "descargando" || estado === "micro" || estado === "transcribiendo");
    }
    function limpiarAviso() { area.textContent = ""; area.hidden = true; }

    /* ── texto: siempre se agrega al final del borrador ── */
    function agregar(t) {
      t = String(t || "").replace(/\s+/g, " ").trim();
      if (!t || ta.readOnly) return false;
      var v = ta.value, sep = v && !/\s$/.test(v) ? " " : "";
      var nuevo = v + sep + t;
      if (ta.maxLength > 0 && nuevo.length > ta.maxLength) nuevo = nuevo.slice(0, ta.maxLength);
      ta.value = nuevo;
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }

    /* ── lectura en voz alta ── */
    function elegirVoz() {
      voz = null;
      if (!window.speechSynthesis || typeof speechSynthesis.getVoices !== "function") return;
      var lista = speechSynthesis.getVoices() || [];
      for (var i = 0; i < lista.length; i++) {
        if (lista[i] && /^es([-_]|$)/i.test(lista[i].lang || "") && lista[i].localService === true) { voz = lista[i]; break; }
      }
      bEscuchar.hidden = !voz;
      if (!voz && leyendo) detenerLectura();
    }
    function detenerLectura() {
      if (!leyendo) return;
      leyendo = false;
      try { speechSynthesis.cancel(); } catch (e) { /* nada que detener */ }
      pintar();
    }
    function alternarLectura() {
      if (leyendo) { detenerLectura(); decir("Lectura detenida."); return; }
      if (!voz) return;
      detenerDictados();
      var u = new SpeechSynthesisUtterance(enunciado);
      u.voice = voz; u.lang = voz.lang || "es";
      var fin = function () { if (leyendo && u.__activa) { leyendo = false; pintar(); } };
      u.__activa = true;
      u.onend = fin; u.onerror = fin;
      leyendo = true;
      try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { leyendo = false; }
      pintar();
    }
    if (window.speechSynthesis && typeof speechSynthesis.addEventListener === "function") {
      speechSynthesis.addEventListener("voiceschanged", elegirVoz);
    }
    elegirVoz();

    /* ── dictado externo ── */
    function detenerExterno() {
      if (!externo) return;
      var r = externo; externo = null;
      r.onresult = r.onerror = r.onend = null;
      try { r.stop(); } catch (e) { /* ya parado */ }
      pintar();
    }
    function alPulsarExterno() {
      if (externo) { detenerExterno(); decir("Dictado externo detenido."); return; }
      detenerLectura();
      if (consentimiento && consentimiento.aceptado && consentimiento.version === AVISO_VERSION) { iniciarExterno(); return; }
      area.textContent = "";
      area.appendChild(el("p", "", AVISO_EXTERNO));
      var fila = el("div", "dv-acciones");
      var si = boton("Aceptar y dictar", "prim", function () {
        consentimiento = { aceptado: true, version: AVISO_VERSION, hora: new Date().toISOString() };
        limpiarAviso();
        iniciarExterno();
      });
      var no = boton("Seguir escribiendo", "", function () {
        consentimiento = { aceptado: false, version: AVISO_VERSION, hora: new Date().toISOString() };
        limpiarAviso();
        decir("Seguirás escribiendo. No se usó ningún micrófono.");
        ta.focus();
      });
      fila.appendChild(si); fila.appendChild(no);
      area.appendChild(fila);
      area.hidden = false;
      si.focus();
    }
    function iniciarExterno() {
      var Clase = reconocimiento();
      if (!Clase) return;
      var r;
      try { r = new Clase(); } catch (e) { decir("No se pudo iniciar el dictado externo. Sigue escribiendo."); return; }
      r.lang = "es-ES"; r.continuous = true; r.interimResults = false;
      r.onresult = function (ev) {
        for (var i = ev.resultIndex || 0; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) agregar(ev.results[i][0] && ev.results[i][0].transcript);
        }
      };
      r.onerror = function (ev) {
        if (externo !== r) return;
        externo = null; pintar();
        var negado = ev && (ev.error === "not-allowed" || ev.error === "service-not-allowed");
        decir(negado ? "El micrófono no está permitido. Sigue escribiendo, el borrador no cambió." :
          "El dictado externo se interrumpió. Sigue escribiendo, el borrador no cambió.");
        ta.focus();
      };
      r.onend = function () { if (externo === r) { externo = null; pintar(); decir("Dictado externo terminado."); } };
      externo = r;
      try { r.start(); } catch (e) { externo = null; decir("No se pudo iniciar el dictado externo. Sigue escribiendo."); }
      pintar();
      if (externo) decir("Escuchando. Habla y pulsa «Detener dictado externo» al terminar.");
    }

    /* ── dictado privado ── */
    function terminarWorker() {
      if (temporizador) { clearTimeout(temporizador); temporizador = null; }
      if (worker) { worker.onmessage = null; worker.onerror = null; try { worker.terminate(); } catch (e) { /* ya cerrado */ } }
      worker = null; trabajadorListo = false;
    }
    function liberarCaptura() {
      if (proc) { proc.onaudioprocess = null; try { proc.disconnect(); } catch (e) { /* suelto */ } }
      if (fuente) { try { fuente.disconnect(); } catch (e) { /* suelto */ } }
      if (flujo) { try { flujo.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { /* sin pistas */ } }
      if (ctx && ctx.state !== "closed") { try { var c = ctx.close(); if (c && c.catch) c.catch(function () {}); } catch (e) { /* cerrado */ } }
      proc = fuente = flujo = ctx = null; trozos = null; muestras = 0;
    }
    function fallo(mensaje) {
      gen++;
      liberarCaptura(); terminarWorker(); limpiarAviso();
      estado = "reposo"; pintar();
      decir(mensaje || TEXTO_FALLO);
    }
    function detenerPrivado(silencio) {
      if (estado === "reposo" && !worker) return;
      gen++;
      liberarCaptura(); terminarWorker(); limpiarAviso();
      estado = "reposo"; pintar();
      if (!silencio) decir("");
    }
    function detenerDictados() { detenerExterno(); detenerPrivado(true); }

    function cancelar() {
      var antes = estado;
      detenerPrivado(true);
      decir(antes === "descargando" ? "Descarga cancelada. Tu pregunta y tu borrador siguen aquí. Puedes escribir o usar el dictado externo." :
        "Dictado cancelado. Tu pregunta y tu borrador siguen aquí.");
      bPrivado.focus();
    }
    function alPulsarPrivado() {
      if (estado === "grabando") { terminarGrabacion(); return; }
      if (estado !== "reposo") return;
      detenerLectura(); detenerExterno();
      limpiarAviso();
      if (worker && trabajadorListo) { pedirMicro(); return; }
      var g = ++gen;
      estado = "consulta"; pintar();
      decir("Comprobando el dictado en este navegador…");
      leerManifiesto().then(function (m) {
        if (g !== gen) return;
        confirmarDescarga(m, g);
      }, function () {
        if (g !== gen) return;
        estado = "reposo"; pintar();
        decir("El dictado en este navegador no está disponible en esta copia del sitio. Puedes escribir o usar el dictado externo.");
      });
    }
    function confirmarDescarga(m, g) {
      estado = "confirmando"; pintar();
      area.textContent = "";
      area.appendChild(el("p", "", "El dictado en este navegador descarga " + megas(m.bytes_total) + " desde este mismo sitio, una sola vez por sesión. El audio no sale de tu equipo. ¿Descargar ahora?"));
      var fila = el("div", "dv-acciones");
      var si = boton("Descargar y dictar", "prim", function () { limpiarAviso(); descargar(m, g); });
      var no = boton("Seguir escribiendo", "", function () {
        gen++; limpiarAviso(); estado = "reposo"; pintar();
        decir("Seguirás escribiendo. No se descargó nada.");
        ta.focus();
      });
      fila.appendChild(si); fila.appendChild(no);
      area.appendChild(fila);
      area.hidden = false;
      decir("");
      si.focus();
    }
    function descargar(m, g) {
      if (g !== gen) return;
      estado = "descargando"; pintar();
      decir("Descargando el modelo de voz: 0 de " + megas(m.bytes_total));
      try {
        worker = new Worker(new URL("js/defensa-whisper-worker.js", document.baseURI).href, { type: "module" });
      } catch (e) { fallo(); return; }
      var w = worker;
      w.onerror = function () { if (w === worker) fallo(); };
      w.onmessage = function (ev) {
        if (w !== worker) return;
        var d = ev.data || {};
        if (d.tipo === "progreso") {
          var total = d.total > 0 ? d.total : m.bytes_total;
          decir("Descargando el modelo de voz: " + megas(Math.min(d.cargado, total)) + " de " + megas(total));
        } else if (d.tipo === "listo") {
          trabajadorListo = true;
          pedirMicro();
        } else if (d.tipo === "texto") {
          if (temporizador) { clearTimeout(temporizador); temporizador = null; }
          estado = "reposo"; pintar();
          decir(agregar(d.texto) ? "Texto agregado al final de tu respuesta. Revísalo y corrígelo antes de confirmar." : "No se entendió nada. Inténtalo otra vez o escribe.");
          ta.focus();
        } else if (d.tipo === "error") {
          fallo();
        }
      };
      w.postMessage({ tipo: "iniciar", total: m.bytes_total });
    }
    function pedirMicro() {
      var g = ++gen;
      estado = "micro"; pintar();
      decir("Modelo listo. Pidiendo el micrófono…");
      var md = navigator.mediaDevices;
      if (!md || typeof md.getUserMedia !== "function") { volverATexto("Este navegador no permite usar el micrófono aquí. Sigue escribiendo."); return; }
      md.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }).then(function (s) {
        if (g !== gen) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        iniciarCaptura(s);
      }, function () {
        if (g !== gen) return;
        volverATexto("El micrófono no está permitido. Sigue escribiendo, el borrador no cambió.");
      });
    }
    function volverATexto(mensaje) {
      liberarCaptura();
      estado = "reposo"; pintar();
      decir(mensaje);
      ta.focus();
    }
    function iniciarCaptura(s) {
      flujo = s;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        try { ctx = new AC({ sampleRate: HZ }); } catch (e) { ctx = new AC(); }
        if (ctx.state === "suspended" && ctx.resume) ctx.resume();
        fuente = ctx.createMediaStreamSource(s);
        proc = ctx.createScriptProcessor(4096, 1, 1);
        trozos = []; muestras = 0;
        proc.onaudioprocess = function (ev) {
          if (!trozos) return;
          var d = ev.inputBuffer.getChannelData(0), copia = new Float32Array(d.length);
          copia.set(d);
          trozos.push(copia); muestras += copia.length;
          if (muestras / ctx.sampleRate >= MAX_SEGUNDOS) terminarGrabacion();
        };
        fuente.connect(proc); proc.connect(ctx.destination);
      } catch (e) { volverATexto("No se pudo grabar el audio en este navegador. Sigue escribiendo."); return; }
      estado = "grabando"; pintar();
      decir("Grabando. Pulsa «Terminar dictado» cuando acabes.");
      bPrivado.focus();
    }
    function terminarGrabacion() {
      if (estado !== "grabando") return;
      var tasa = ctx ? ctx.sampleRate : HZ, partes = trozos || [];
      liberarCaptura();
      var audio = unir(partes, tasa);
      partes = null;
      if (audio.length < HZ * 0.3) { volverATexto("No se oyó nada. Inténtalo otra vez o escribe."); return; }
      var g = ++gen;
      estado = "transcribiendo"; pintar();
      decir("Transcribiendo en tu navegador…");
      temporizador = setTimeout(function () {
        if (g === gen) fallo("El dictado está tardando demasiado. Tu borrador sigue aquí. Puedes escribir o usar el dictado externo.");
      }, PLAZO_TRANSCRIBIR_MS);
      try { worker.postMessage({ tipo: "transcribir", audio: audio }, [audio.buffer]); } catch (e) { fallo(); }
    }

    /* ── cierre ── */
    inst.detener = function () { detenerLectura(); detenerExterno(); detenerPrivado(true); };
    inst.destruir = function () {
      inst.detener();
      if (window.speechSynthesis && typeof speechSynthesis.removeEventListener === "function") speechSynthesis.removeEventListener("voiceschanged", elegirVoz);
    };
    inst.estado = function () { return estado; };
    instancias.push(inst);
    pintar();
  }

  /* Para lectura y dictados. Sin `conservar` además suelta las instancias (el panel cerró o cambió de vista). */
  function detenerTodo(conservar) {
    instancias.forEach(function (i) { i.detener(); });
    if (!conservar) { instancias.forEach(function (i) { i.destruir(); }); instancias = []; }
  }

  window.DefensaVoz = {
    montar: montar,
    detenerTodo: detenerTodo,
    consentimiento: function () { return consentimiento ? { aceptado: consentimiento.aceptado, version: consentimiento.version, hora: consentimiento.hora } : null; }
  };
})();
