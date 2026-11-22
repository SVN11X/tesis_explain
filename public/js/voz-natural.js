/*
  Voz natural pregrabada (docs/decisions/0010-voz-natural-pregenerada.md). Lo cargan js/voz-resumen.js y
  js/defensa-voz.js solo cuando se pulsa un botón de escuchar. Nada se descarga antes.
  - audio/manifiesto.json da el archivo de cada texto. Se pide la primera vez que hace falta.
  - Un solo audio suena a la vez en la página. Nada arranca solo.
  Expone window.VozNatural.{entrada, huella, reproducir, detener}.
*/
(function () {
  "use strict";

  var manifiesto = null;
  var actual = null;

  function ruta(nombre) { return new URL("audio/" + nombre, document.baseURI).href; }

  function leerManifiesto() {
    if (!manifiesto) {
      manifiesto = fetch(ruta("manifiesto.json")).then(function (r) {
        if (!r.ok) throw new Error("manifiesto");
        return r.json();
      }).catch(function (e) { manifiesto = null; throw e; });
    }
    return manifiesto;
  }

  /* Entrada del manifiesto para una clave, o null si no hay audio de ese texto. */
  function entrada(clave) {
    return leerManifiesto().then(function (m) { return (m.entradas && m.entradas[clave]) || null; });
  }

  /* Primeros 16 caracteres hexadecimales del SHA-256, igual que scripts/voz_natural.py. */
  function huella(texto) {
    var s = window.crypto && window.crypto.subtle;
    if (!s) return Promise.reject(new Error("sin crypto"));
    return s.digest("SHA-256", new TextEncoder().encode(texto)).then(function (buf) {
      return Array.prototype.slice.call(new Uint8Array(buf), 0, 8).map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }

  function detener() {
    if (!actual) return;
    var a = actual; actual = null;
    a.audio.pause();
    a.audio.removeAttribute("src");
    a.audio.load();
    a.aviso({ tipo: "detenido" });
  }

  /*
    Reproduce un archivo. `aviso` recibe {tipo}: cargando, sonando, pausa, progreso (con t y total), fin, error o
    detenido. Devuelve {alternar} para pausar y seguir. Si otro audio sonaba, lo detiene.
  */
  function reproducir(archivo, aviso) {
    detener();
    var audio = new Audio();
    audio.preload = "auto";
    var mio = { audio: audio, aviso: aviso };
    actual = mio;
    function lanzar(d) { if (actual === mio) aviso(d); }
    var acabado = false;
    function terminar(d) { if (acabado || actual !== mio) return; acabado = true; actual = null; aviso(d); }
    audio.addEventListener("waiting", function () { lanzar({ tipo: "cargando" }); });
    audio.addEventListener("playing", function () { lanzar({ tipo: "sonando" }); });
    audio.addEventListener("pause", function () { if (!audio.ended) lanzar({ tipo: "pausa" }); });
    audio.addEventListener("timeupdate", function () { lanzar({ tipo: "progreso", t: audio.currentTime, total: audio.duration }); });
    audio.addEventListener("ended", function () { terminar({ tipo: "fin" }); });
    audio.addEventListener("error", function () { terminar({ tipo: "error" }); });
    audio.src = ruta(archivo);
    lanzar({ tipo: "cargando" });
    var p = audio.play();
    if (p && p.catch) p.catch(function (e) { if (e && e.name === "AbortError") return; terminar({ tipo: "error" }); });
    return {
      alternar: function () {
        if (actual !== mio) return;
        if (audio.paused) { var q = audio.play(); if (q && q.catch) q.catch(function () { terminar({ tipo: "error" }); }); }
        else audio.pause();
      }
    };
  }

  window.VozNatural = { entrada: entrada, huella: huella, reproducir: reproducir, detener: detener };
})();
