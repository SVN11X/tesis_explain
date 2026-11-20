/* Control: respuesta de una rueda con P, I y D, y enjambre de partículas */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  var rgba = U.rgba, paleta = U.paleta, lienzo = U.lienzo, alTema = U.alTema, limitar = U.limitar, bucle = U.bucle, alCambiarMovimiento = U.alCambiarMovimiento;

  /* 5. PID de una rueda. Al cambiar las ganancias queda dibujada la curva anterior, para comparar. */
  V.pid = function (el) {
    /* El modelo y sus lecturas viven en js/control-modelo.js, donde se prueban en Node. */
    var CM = window.CONTROL;
    if (!CM || !CM.simularPID) throw new Error("Falta el modelo del capítulo 4");
    var P = paleta(), REF = CM.PID_ILUSTRATIVO.REF, T = CM.PID_ILUSTRATIVO.T;
    var PRE = { p: [1200, 0, 0], pi: [600, 2600, 0], agr: [1500, 9000, 0], pid: [1500, 9000, 25] };
    var NOMBRE = { p: "Solo P", pi: "PI equilibrado", agr: "PI agresivo", pid: "PID, con D que amortigua" };
    var st = { kp: 1200, ki: 0, kd: 0, zona: false, accion: false }, confirmado = copia(st), anterior = null, editando = false;
    function copia(o) { return { kp: o.kp, ki: o.ki, kd: o.kd, zona: o.zona }; }
    function igual(a, b) { return a && b && a.kp === b.kp && a.ki === b.ki && a.kd === b.kd && a.zona === b.zona; }
    function rotulo(o) { return "P " + o.kp + " · I " + o.ki + " · D " + o.kd + (o.zona ? " · con zona muerta" : ""); }
    el.innerHTML = '<div class="chips" role="group" aria-label="Ejemplos">' + Object.keys(PRE).map(function (k) { return '<button type="button" class="chip" data-p="' + k + '" aria-pressed="' + (k === "p") + '">' + NOMBRE[k] + '</button>'; }).join("") + '</div>' +
      '<div class="deslizadores">' +
      '<label for="pid-p">P, reacciona al error de ahora<b class="num" data-v="kp"></b><input id="pid-p" type="range" min="0" max="3000" step="20" data-k="kp"></label>' +
      '<label for="pid-i">I, acumula el error pasado<b class="num" data-v="ki"></b><input id="pid-i" type="range" min="0" max="12000" step="100" data-k="ki"></label>' +
      '<label for="pid-d">D, mira hacia dónde va<b class="num" data-v="kd"></b><input id="pid-d" type="range" min="0" max="60" step="1" data-k="kd"></label></div>' +
      '<div class="casillas"><label><input type="checkbox" data-c="zona">Agregar zona muerta del driver</label><label><input type="checkbox" data-c="accion">Mostrar la señal al motor</label></div>' +
      '<div class="pid-l"></div>' +
      '<div class="vley"><span><i class="lin" style="background:var(--s1)"></i>velocidad con los valores actuales</span><span data-o="ley-ant" hidden><i class="lin" style="background:var(--muted);opacity:.6;height:4px"></i><span data-o="ant"></span></span><span><i class="lin-disc" style="border-color:var(--ink)"></i>referencia 0,13 m/s</span></div>' +
      '<div class="lecturas"><div><span>Velocidad al final</span><b data-o="fin"></b></div><div><span>Error estacionario</span><b data-o="err"></b></div><div><span>Sobreimpulso</span><b data-o="os"></b></div><div><span>Tiempo de subida, 10 a 90 %</span><b data-o="tr"></b></div></div>' +
      '<p class="vestado" aria-live="polite" data-o="cmp"></p>' +
      '<div class="pid-lectura" data-o="lectura"><h4>Qué dice esta curva</h4><ul></ul></div>' +
      '<div class="vctl"><button type="button" class="vbtn sec" data-a="borrar" disabled>Quitar la curva anterior</button></div>' +
      '<p class="vnota">Modelo ilustrativo de una rueda con un retardo de primer orden, una ganancia y una constante de tiempo del orden de las que identifiqué, y el PWM limitado a 255. Unidades de este simulador: P en PWM por cada m/s de error. I en PWM por cada m/s de error sostenido durante 1 s. D en PWM por cada m/s de error que cambia en 1 s. Estas ganancias no son las del firmware, que usa otra escala y otra ley. Las lecturas usan el último segundo como valor estabilizado.</p>';
    var cont = el.querySelector(".pid-l"), L = lienzo(cont, function (w) { return w < 520 ? 4 / 3 : 16 / 7; }, function () { dibujar(); });
    alTema(function () { P = paleta(); dibujar(); });
    function sim(c) { return CM.simularPID(c); }
    function medidas(d) { return CM.medidasPID(d); }
    function dibujar() {
      var d = sim(st), ctx = L.ctx, W = L.w, H = L.h, angosto = W < 420, ml = angosto ? 40 : 52, mr = st.accion ? (angosto ? 34 : 44) : 14, mt = angosto ? 24 : 14, mb = 26;
      var x = function (t) { return ml + t / T * (W - ml - mr); }, y = function (v) { return mt + (1 - v / 0.2) * (H - mt - mb); };
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      ctx.font = (angosto ? "10px" : "11px") + " IBM Plex Mono, monospace"; ctx.fillStyle = P.muted; ctx.strokeStyle = P.linea; ctx.lineWidth = 1;
      [0, 0.05, 0.1, 0.15, 0.2].forEach(function (v) { ctx.beginPath(); ctx.moveTo(ml, y(v)); ctx.lineTo(W - mr, y(v)); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(U.fmt(v, 2), ml - 6, y(v) + 4); });
      ctx.textAlign = "center"; for (var t = 0; t <= T; t += angosto ? 2 : 1) ctx.fillText(t + " s", x(t), H - 8); ctx.textAlign = "start";
      if (angosto) { ctx.textAlign = "right"; ctx.fillText("m/s", ml - 6, 11); ctx.textAlign = "start"; }
      else { ctx.save(); ctx.translate(11, mt + (H - mt - mb) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("m/s", 0, 0); ctx.restore(); }
      ctx.setLineDash([5, 4]); ctx.strokeStyle = P.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ml, y(REF)); ctx.lineTo(W - mr, y(REF)); ctx.stroke(); ctx.setLineDash([]);
      if (st.accion) {
        ctx.strokeStyle = rgba(P.s2, .8); ctx.lineWidth = 1.5; ctx.beginPath();
        d.forEach(function (p, i) { var yy = mt + (1 - (p[2] + 255) / 510) * (H - mt - mb); if (i) ctx.lineTo(x(p[0]), yy); else ctx.moveTo(x(p[0]), yy); }); ctx.stroke();
        ctx.fillStyle = P.s2; ctx.textAlign = "left"; ctx.fillText("PWM", W - mr + 4, mt + 10); ctx.fillText("255", W - mr + 4, mt + 24); ctx.fillText("0", W - mr + 4, mt + (H - mt - mb) / 2 + 4);
      }
      var hayAnterior = anterior && !igual(anterior, st);
      if (hayAnterior) {
        ctx.strokeStyle = rgba(P.muted, .6); ctx.lineWidth = 3; ctx.beginPath();
        sim(anterior).forEach(function (p, i) { if (i) ctx.lineTo(x(p[0]), y(p[1])); else ctx.moveTo(x(p[0]), y(p[1])); }); ctx.stroke();
      }
      ctx.strokeStyle = P.s1; ctx.lineWidth = 2.6; ctx.beginPath();
      d.forEach(function (p, i) { if (i) ctx.lineTo(x(p[0]), y(p[1])); else ctx.moveTo(x(p[0]), y(p[1])); }); ctx.stroke();
      var m = medidas(d), o = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
      o("fin").textContent = U.fmt(m.fin, 3) + " m/s"; o("err").textContent = U.fmt(m.err, 3) + " m/s";
      o("os").textContent = m.os > 0 ? U.fmt(m.os, 0) + " %" : "no hay";
      o("tr").textContent = m.tr != null ? U.fmt(m.tr, 2) + " s" : "no llega";
      o("ley-ant").hidden = !hayAnterior; o("ant").textContent = hayAnterior ? "antes: " + rotulo(anterior) : "";
      el.querySelector('[data-a="borrar"]').disabled = !hayAnterior;
      if (hayAnterior) {
        var a = medidas(sim(anterior)), partes = [];
        partes.push("Error estacionario " + U.fmt(a.err, 3) + " → " + U.fmt(m.err, 3) + " m/s");
        partes.push("sobreimpulso " + (a.os > 0 ? U.fmt(a.os, 0) + " %" : "no hay") + " → " + (m.os > 0 ? U.fmt(m.os, 0) + " %" : "no hay"));
        o("cmp").textContent = "Comparado con la curva gris: " + partes.join("; ") + ".";
      } else o("cmp").textContent = "Cambia un valor o elige otro ejemplo: la curva actual quedará en gris para comparar.";
      /* Lecturas por regla: texto, condición que la activó y cálculo que la respalda. */
      o("lectura").querySelector("ul").innerHTML = CM.lecturaPID(st, m).map(function (r) {
        return '<li data-regla="' + r.id + '">' + U.esc(r.texto) + '<small>Regla: ' + U.esc(r.condicion) + '. ' + U.esc(r.calculo) + '</small></li>';
      }).join("");
      el.querySelectorAll("[data-v]").forEach(function (b) { b.textContent = st[b.getAttribute("data-v")]; });
      el.querySelectorAll("input[data-k]").forEach(function (i) { i.value = st[i.getAttribute("data-k")]; });
      el.querySelectorAll("input[data-c]").forEach(function (i) { i.checked = !!st[i.getAttribute("data-c")]; });
    }
    el.addEventListener("input", function (e) {
      var k = e.target.getAttribute("data-k"); if (!k) return;
      if (!editando) { anterior = copia(confirmado); editando = true; }
      st[k] = parseFloat(e.target.value); U.marcar(el, "data-p", ""); dibujar();
    });
    el.addEventListener("change", function (e) {
      if (e.target.getAttribute("data-k")) { editando = false; confirmado = copia(st); return; }
      var c = e.target.getAttribute("data-c"); if (!c) return;
      if (c === "zona") { anterior = copia(st); st.zona = e.target.checked; confirmado = copia(st); } else st[c] = e.target.checked;
      dibujar();
    });
    el.addEventListener("click", function (e) {
      if (e.target.closest('[data-a="borrar"]')) { anterior = null; dibujar(); return; }
      var p = e.target.closest("[data-p]"); if (!p) return; var v = PRE[p.getAttribute("data-p")];
      var antes = copia(st); st.kp = v[0]; st.ki = v[1]; st.kd = v[2];
      if (!igual(antes, st)) anterior = antes;
      confirmado = copia(st); editando = false;
      U.marcar(el, "data-p", p.getAttribute("data-p")); dibujar();
    });
    el.estadoSim = function () { var m = medidas(sim(st)); return { actual: m, anterior: anterior ? medidas(sim(anterior)) : null, ganancias: copia(st), reglas: CM.lecturaPID(st, m).map(function (r) { return r.id; }) }; };
    dibujar();
  };

  /* 6. Enjambre de partículas */
  V.enjambre = function (el) {
    var P = paleta(), N = 24, GMAX = 60, ZETA = 0.7298, C1 = 2.05, C2 = 2.05;
    var parts, gBest, gCost, gen, semilla = 1;
    function rnd() { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; }
    /* costo ilustrativo con un mínimo global y varios locales, en un cuadrado de 0 a 1 */
    function costo(x, y) {
      var a = Math.pow(x - 0.68, 2) + Math.pow(y - 0.32, 2);
      return 3 * a + 0.18 * (2 - Math.cos(14 * x) - Math.cos(14 * y)) + 0.25 * Math.exp(-((x - .25) * (x - .25) + (y - .7) * (y - .7)) / .01) * -1;
    }
    var mapa = null;
    function reset() {
      semilla = 12345; gen = 0; parts = []; gCost = Infinity; gBest = null;
      for (var i = 0; i < N; i++) {
        var p = { x: rnd(), y: rnd(), vx: (rnd() - .5) * .1, vy: (rnd() - .5) * .1 };
        p.c = costo(p.x, p.y); p.bx = p.x; p.by = p.y; p.bc = p.c; p.tr = [[p.x, p.y]];
        if (p.c < gCost) { gCost = p.c; gBest = [p.x, p.y]; }
        parts.push(p);
      }
    }
    function generacion() {
      if (gen >= GMAX) return false;
      gen++;
      var w = (GMAX - gen) / GMAX;   /* peso de inercia que baja de 1 a 0 */
      parts.forEach(function (p) {
        p.vx = ZETA * (w * p.vx + C1 * rnd() * (p.bx - p.x) + C2 * rnd() * (gBest[0] - p.x));
        p.vy = ZETA * (w * p.vy + C1 * rnd() * (p.by - p.y) + C2 * rnd() * (gBest[1] - p.y));
        p.x = limitar(p.x + p.vx, 0, 1); p.y = limitar(p.y + p.vy, 0, 1);
        p.c = costo(p.x, p.y); p.tr.push([p.x, p.y]); if (p.tr.length > 6) p.tr.shift();
        if (p.c < p.bc) { p.bc = p.c; p.bx = p.x; p.by = p.y; }
      });
      parts.forEach(function (p) { if (p.bc < gCost) { gCost = p.bc; gBest = [p.bx, p.by]; } });
      return true;
    }
    el.innerHTML = '<div class="vctl"><button type="button" class="vbtn" data-a="play">Buscar</button><button type="button" class="vbtn sec" data-a="paso">Una generación</button><button type="button" class="vbtn sec" data-a="reset">Reiniciar</button><span class="vestado" aria-live="polite" data-o="e"></span></div>' +
      '<div class="pso-l"></div>' +
      '<div class="vley"><span><i class="pt" style="background:var(--ink)"></i>partícula, un conjunto de ganancias</span><span><i class="pt rojo"></i>mejor de todo el enjambre</span><span><i class="cu" style="background:var(--s1)"></i>más oscuro, menor costo</span></div>' +
      '<div class="lecturas"><div><span>Generación</span><b data-o="gen"></b></div><div><span>Peso de inercia w</span><b data-o="w"></b></div><div><span>Dispersión del enjambre</span><b data-o="disp"></b></div><div><span>Mejor costo encontrado</span><b data-o="costo"></b></div></div>' +
      '<p class="vnota">El peso de inercia dice cuánto conserva cada partícula de su velocidad anterior: alto al comienzo, para explorar, y bajo al final, para afinar cerca de lo mejor encontrado. La dispersión es la distancia media de las partículas al mejor punto, en porcentaje del lado del dibujo. El costo de este dibujo es ilustrativo y no tiene unidad.</p>' +
      '<p class="vnota">Ilustración en dos dimensiones para poder dibujarla. En el script de sintonía cada partícula tiene tres coordenadas, Kp, Kd y Ki, y su costo se calcula simulando el modelo de cada rueda. Se usan los mismos parámetros del script, factor de constricción 0,7298, coeficientes 2,05 y peso de inercia que baja de 1 a 0.</p>';
    var cont = el.querySelector(".pso-l"), L = lienzo(cont, 16 / 9, function () { mapa = null; dibujar(); });
    alTema(function () { P = paleta(); mapa = null; dibujar(); });
    function fondo(W, H) {
      var c = document.createElement("canvas"); c.width = 160; c.height = 90; var cx = c.getContext("2d"), img = cx.createImageData(160, 90);
      var mn = Infinity, mx = -Infinity, vals = [];
      for (var j = 0; j < 90; j++) for (var i = 0; i < 160; i++) { var v = costo(i / 159, 1 - j / 89); vals.push(v); mn = Math.min(mn, v); mx = Math.max(mx, v); }
      var base = P.s1.replace("#", ""), n = parseInt(base, 16), br = (n >> 16) & 255, bgc = (n >> 8) & 255, bb = n & 255;
      var sup = P.sup.replace("#", ""), m = parseInt(sup, 16), sr = (m >> 16) & 255, sg = (m >> 8) & 255, sb = m & 255;
      vals.forEach(function (v, k) {
        var a = Math.pow(1 - (v - mn) / (mx - mn), 2.2) * .85;
        img.data[k * 4] = sr + (br - sr) * a; img.data[k * 4 + 1] = sg + (bgc - sg) * a; img.data[k * 4 + 2] = sb + (bb - sb) * a; img.data[k * 4 + 3] = 255;
      });
      cx.putImageData(img, 0, 0); return c;
    }
    function dibujar() {
      if (!parts) return;
      var ctx = L.ctx, W = L.w, H = L.h;
      if (!mapa) mapa = fondo(W, H);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(mapa, 0, 0, W, H);
      /* El eje vertical crece hacia arriba, como indica su flecha: en pantalla se invierte y. */
      var X = function (v) { return v * W; }, Y = function (v) { return (1 - v) * H; };
      parts.forEach(function (p) {
        ctx.strokeStyle = rgba(P.ink, .25); ctx.lineWidth = 1; ctx.beginPath();
        p.tr.forEach(function (q, i) { if (i) ctx.lineTo(X(q[0]), Y(q[1])); else ctx.moveTo(X(q[0]), Y(q[1])); }); ctx.stroke();
        ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = P.sup; ctx.lineWidth = 1.5; ctx.stroke();
      });
      if (gBest) { ctx.fillStyle = P.rojo; ctx.strokeStyle = P.sup; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(gBest[0]), Y(gBest[1]), 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      ctx.font = "11px IBM Plex Mono, monospace"; ctx.fillStyle = rgba(P.sup, .85); ctx.fillRect(W - 98, H - 22, 94, 18); ctx.fillRect(2, H - 112, 18, 90); ctx.fillStyle = P.ink; ctx.fillText("ganancia 1 →", W - 92, H - 8); ctx.save(); ctx.translate(15, H - 26); ctx.rotate(-Math.PI / 2); ctx.fillText("ganancia 2 →", 0, 0); ctx.restore();
      var w = Math.max(0, (GMAX - gen) / GMAX), disp = parts.reduce(function (a, p) { return a + Math.hypot(p.x - gBest[0], p.y - gBest[1]); }, 0) / parts.length;
      el.querySelector('[data-o="e"]').textContent = gen >= GMAX ? "Búsqueda terminada. El enjambre convergió cerca del mejor punto." : gen === 0 ? "Partículas al azar: todavía no han compartido lo que encontraron." : w > .5 ? "Explorando: las partículas todavía se mueven mucho." : "Convergiendo: las partículas se acercan al mejor punto.";
      el.querySelector('[data-o="gen"]').textContent = gen + " de " + GMAX;
      el.querySelector('[data-o="w"]').textContent = U.fmt(w, 2);
      el.querySelector('[data-o="disp"]').textContent = U.fmt(disp * 100, 1) + " %";
      el.querySelector('[data-o="costo"]').textContent = U.fmt(gCost, 3);
    }
    var acum = 0;
    var B = bucle(el, function (dt) { acum += dt; if (acum > 0.12) { acum = 0; if (!generacion()) { B.pausa(); var b = el.querySelector('[data-a="play"]'); b.textContent = "Buscar de nuevo"; b.setAttribute("aria-pressed", "false"); } dibujar(); } });
    el.addEventListener("click", function (e) {
      var a = e.target.closest("[data-a]"); if (!a) return; var k = a.getAttribute("data-a"), bp = el.querySelector('[data-a="play"]');
      if (k === "play") { if (B.activo) { B.pausa(); bp.textContent = "Seguir"; bp.setAttribute("aria-pressed", "false"); } else { if (gen >= GMAX) reset(); B.play(); bp.textContent = "Pausar"; bp.setAttribute("aria-pressed", "true"); } }
      if (k === "paso") { B.pausa(); bp.textContent = "Seguir"; bp.setAttribute("aria-pressed", "false"); generacion(); dibujar(); }
      if (k === "reset") { B.pausa(); bp.textContent = "Buscar"; bp.setAttribute("aria-pressed", "false"); reset(); dibujar(); }
    });
    /* el bucle se pausa solo con movimiento reducido, y el botón debe decirlo */
    alCambiarMovimiento(function (reducido) { if (!reducido) return; var bp = el.querySelector('[data-a="play"]'); bp.textContent = "Seguir"; bp.setAttribute("aria-pressed", "false"); });
    reset(); dibujar();
  };
})();
