/*
  Capítulo 03: interactivos de calibración de la odometría, dibujados en SVG.
  calibracion  error de las cinco rectas del robot real (Tabla A6.2) antes y después de dividir
               por un factor, y repeticiones simuladas para ver qué corrige y qué no
  cuadrado     cuadrado recorrido en los dos sentidos según la propia odometría, como en el
               método de Borenstein y Feng. Ilustrativo: el robot no se ensayó así
  Los cálculos están en js/movimiento-modelo.js y se prueban en herramientas/pruebas_movimiento.js.
*/
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U, M = window.MOVIMIENTO;
  var MENOS = "−";
  function fmt(v, d) { return U.fmt(v, d).replace("-", MENOS); }
  /* con signo explícito; un valor que se redondea a cero se escribe sin signo */
  function fmtS(v, d) {
    var t = U.fmt(Math.abs(v), d);
    if (/^0,?0*$/.test(t)) return t;
    return (v < 0 ? MENOS : "+") + t;
  }
  function attrs(o) { return Object.keys(o).map(function (k) { return k + '="' + o[k] + '"'; }).join(" "); }
  function t(x, y, s, cls, extra) { return '<text ' + attrs(Object.assign({ x: x.toFixed(1), y: y.toFixed(1), class: cls || "t-s" }, extra || {})) + '>' + U.esc(s) + '</text>'; }
  function ln(x1, y1, x2, y2, cls, extra) { return '<line ' + attrs(Object.assign({ x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), class: cls }, extra || {})) + '/>'; }
  /* cada lectura tiene un rótulo, un valor y, si hace falta, una aclaración breve debajo */
  function lecturas(items) { return '<div class="lecturas">' + items.map(function (it) { return '<div><span>' + it[0] + '</span><b data-o="' + it[1] + '"></b>' + (it[2] ? '<small data-o="' + it[1] + '-s"></small>' : '') + '</div>'; }).join("") + '</div>'; }
  function marcar(el, attr, val) { el.querySelectorAll("[" + attr + "]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute(attr) === String(val))); }); }

  /* ── Sesgo, dispersión y calibración de la recta ── */
  V.calibracion = function (el) {
    var uid = "cal" + Math.random().toString(36).slice(2, 7);
    var REAL = M.RECTA.map(function (r) { return r.error; });
    var INI = { sesgo: 3.63, variacion: 0.44 };
    var st = { modo: "real", sesgo: INI.sesgo, variacion: INI.variacion, semilla: 7 };
    el.innerHTML =
      '<div class="vctl"><div class="segmento" role="group" aria-label="Qué repeticiones mostrar">' +
      '<button type="button" data-modo="real" aria-pressed="true">Ensayo real</button><button type="button" data-modo="sim" aria-pressed="false">Simular repeticiones</button></div>' +
      '<span class="cal-origen" data-o="origen"></span></div>' +
      '<div class="deslizadores" data-sim hidden>' +
      '<label for="' + uid + '-s">Sesgo sistemático, igual en todas<b class="num" data-v="sesgo"></b><input id="' + uid + '-s" type="range" min="-5" max="5" step="0.01" data-k="sesgo"></label>' +
      '<label for="' + uid + '-v">Variación aleatoria entre repeticiones<b class="num" data-v="variacion"></b><input id="' + uid + '-v" type="range" min="0" max="1.5" step="0.01" data-k="variacion"></label></div>' +
      '<div class="vctl" data-sim hidden><button type="button" class="vbtn" data-a="sortear">Sortear otras repeticiones</button><button type="button" class="vbtn sec" data-a="ensayo">Volver a los valores del ensayo</button></div>' +
      '<div class="cal-g"></div>' +
      '<div class="vley"><span><i class="pt" style="background:none;border:2px solid var(--ink)"></i>sin calibrar</span><span><i class="pt azul"></i>calibrada, dividida por el factor</span><span><i class="lin ink"></i>0 %, la odometría coincide con la cinta</span><span><i class="lin-disc"></i>media sin calibrar</span><span><i class="lin-disc" style="border-top-color:var(--azul)"></i>media calibrada</span></div>' +
      lecturas([["Sesgo, el error medio", "media", 1], ["Dispersión entre repeticiones", "desv", 1], ["Factor de calibración", "factor", 1]]) +
      '<div class="lecturas" data-sim hidden><div><span>Repeticiones nuevas, tras calibrar</span><b data-o="nmedia"></b><small>error medio con el factor anterior</small></div><div><span>Su dispersión</span><b data-o="ndesv"></b><small>sigue presente</small></div></div>' +
      '<p class="vestado" aria-live="polite" data-o="msg"></p>' +
      '<p class="vnota" id="' + uid + '-nota">El error de cada prueba es (odometría − cinta) / cinta, tomado de la Tabla A6.2. La dispersión es la desviación estándar de las cinco pruebas: cuánto se separan entre sí. Calibrar aquí significa dividir lo que mide la odometría por un factor, 1 + error medio. La tesis no aplicó esta corrección. El cálculo muestra qué cambiaría. En la simulación, el sesgo y la variación los eliges tú y no son mediciones.</p>';
    var cont = el.querySelector(".cal-g");
    function o(k) { return el.querySelector('[data-o="' + k + '"]'); }

    function datos() {
      var antes = st.modo === "real" ? REAL : M.repeticiones(st.sesgo, st.variacion, st.semilla, 5);
      var f = M.factor(antes), despues = M.corregir(antes, f);
      var r = { antes: antes, despues: despues, factor: f, a: M.estadistica(antes), d: M.estadistica(despues) };
      if (st.modo === "sim") {
        r.nuevas = M.repeticiones(st.sesgo, st.variacion, st.semilla + 1000, 5);
        r.nuevasCorr = M.corregir(r.nuevas, f);
        r.n = M.estadistica(r.nuevasCorr);
      }
      return r;
    }
    function dibujar() {
      var r = datos(), W = Math.max(280, cont.clientWidth || 600), chico = W < 520;
      var todos = r.antes.concat(r.despues, r.nuevas || [], r.nuevasCorr || []);
      /* el eje se mantiene de −1 a 5 % mientras quepan los puntos; si no, se amplía de a 1 % */
      var x0 = Math.min(-1, Math.floor(Math.min.apply(null, todos) - 0.15)), x1 = Math.max(5, Math.ceil(Math.max.apply(null, todos) + 0.15));
      var ml = chico ? 26 : 92, mr = chico ? 106 : 118, mt = 26, fila = 24;
      var grupos = [{ tit: st.modo === "real" ? "Las cinco pruebas del ensayo" : "Repeticiones con las que se calcula el factor", a: r.antes, d: r.despues, et: function (i) { return (chico ? "" : (st.modo === "real" ? "Prueba " : "Repetición ")) + (i + 1); } }];
      if (r.nuevas) grupos.push({ tit: "Repeticiones nuevas, con el mismo factor", a: r.nuevas, d: r.nuevasCorr, et: function (i) { return (chico ? "" : "Nueva ") + (i + 1); } });
      var H = mt + grupos.length * (fila * 5 + 30) + 20;
      var X = function (v) { return ml + (v - x0) / (x1 - x0) * (W - ml - mr); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="' + uid + '-t" aria-describedby="' + uid + '-nota"><title id="' + uid + '-t"></title>';
      for (var v = x0; v <= x1; v++) if (!chico || v % 2 === 0 || v === 0) s += t(X(v), H - 6, fmt(v, 0) + " %", "t-s", { "text-anchor": "middle" });
      s += t(chico ? 4 : ml, 14, chico ? "error" : "error odométrico de cada repetición", "t-s") + t(W - 4, 14, "antes → después", "t-s", { "text-anchor": "end" });
      var y = mt;
      grupos.forEach(function (g) {
        s += t(4, y + 12, g.tit, "t-m t-b");
        var y0 = y + 22, ma = M.estadistica(g.a).media, md = M.estadistica(g.d).media;
        /* la rejilla se dibuja solo bajo el título de cada grupo, para no cruzarlo */
        for (var v = x0; v <= x1; v++) s += ln(X(v), y0 - 6, X(v), y0 + fila * 5 - 2, v === 0 ? "k-ink" : "k-linea", { "stroke-width": v === 0 ? 2 : 1 });
        s += ln(X(ma), y0 - 4, X(ma), y0 + fila * 5 - 4, "k-muted", { "stroke-dasharray": "4 4", "stroke-width": 1.5 });
        s += ln(X(md), y0 - 4, X(md), y0 + fila * 5 - 4, "k-azul", { "stroke-dasharray": "4 4", "stroke-width": 1.5 });
        g.a.forEach(function (e, i) {
          var yy = y0 + i * fila + fila / 2 - 4, xa = X(e), xd = X(g.d[i]);
          s += t(chico ? 4 : ml - 10, yy + 4, g.et(i), "t-s", chico ? {} : { "text-anchor": "end" });
          s += ln(xa, yy, xd + (xa > xd ? 7 : -7), yy, "k-linea2", { "stroke-width": 1.5 });
          s += '<circle cx="' + xa.toFixed(1) + '" cy="' + yy + '" r="5.5" class="f-sup k-ink" stroke-width="2"/>';
          s += '<circle cx="' + xd.toFixed(1) + '" cy="' + yy + '" r="5.5" class="f-azul"/>';
          s += t(W - mr + 8, yy + 4, fmt(e, 2) + " → " + fmt(g.d[i], 2), "t-s");
        });
        y = y0 + fila * 5 + 8;
      });
      cont.innerHTML = s + '</svg>';
      cont.querySelector("title").textContent = "Error de cada repetición antes y después de dividir por " + fmt(r.factor, 4) + ". Media " + fmt(r.a.media, 2) + " % antes y " + fmt(r.d.media, 2) + " % después.";
      /* lecturas */
      o("origen").textContent = st.modo === "real" ? "Mediciones de la Tabla A6.2" : "Simulación ilustrativa, no son mediciones";
      o("origen").className = "cal-origen " + (st.modo === "real" ? "datos" : "ilus");
      o("media").textContent = fmt(r.a.media, 2) + " % → " + fmt(r.d.media, 2) + " %";
      o("desv").textContent = fmt(r.a.desv, 2) + " % → " + fmt(r.d.desv, 2) + " %";
      o("factor").textContent = "÷ " + fmt(r.factor, 4);
      o("factor-s").textContent = "1 + " + fmt(r.a.media, 2) + " / 100, el error medio";
      o("media-s").textContent = fmt(r.a.media / 100 * M.CINTA_MEDIA * 100, 1) + " cm → " + fmt(r.d.media / 100 * M.CINTA_MEDIA * 100, 1) + " cm en la recta de 1,856 m";
      o("desv-s").textContent = fmt(r.a.desv / 100 * M.CINTA_MEDIA * 100, 1) + " cm → " + fmt(r.d.desv / 100 * M.CINTA_MEDIA * 100, 1) + " cm en la recta de 1,856 m";
      var msg;
      if (st.modo === "real") {
        msg = "Las cinco pruebas sobrestiman entre 2,88 y 4,01 %. Dividir por " + fmt(r.factor, 4) + " corre todos los puntos la misma distancia: el error medio pasa a 0 %, pero las pruebas siguen separadas, de " + fmt(Math.min.apply(null, r.despues), 2) + " a " + fmt(Math.max.apply(null, r.despues), 2) + " %. La calibración quita el sesgo, pero la dispersión se queda. Para comprobarla habría que medir repeticiones nuevas, lo que no se hizo.";
      } else {
        o("nmedia").textContent = fmt(r.n.media, 2) + " %";
        o("ndesv").textContent = fmt(r.n.desv, 2) + " %";
        msg = "Con el factor calculado en las primeras cinco, las repeticiones nuevas quedan con un error medio de " + fmt(r.n.media, 2) + " %, no exactamente 0. ";
        msg += st.variacion > 0.9 ? "Con tanta variación, cinco repeticiones no bastan para estimar bien el sesgo." :
          (st.variacion < 0.05 ? "Sin variación aleatoria, la calibración deja todo en 0 %: solo había sesgo." : "Cuanto mayor es la variación, más se aleja ese error medio de 0 y menos confiable es el factor.");
      }
      o("msg").textContent = msg;
      el.querySelectorAll("[data-v]").forEach(function (b) { var k = b.getAttribute("data-v"); b.textContent = (k === "sesgo" ? fmtS(st[k], 2) : fmt(st[k], 2)) + " %"; });
      el.querySelectorAll("input[data-k]").forEach(function (i) { if (document.activeElement !== i) i.value = st[i.getAttribute("data-k")]; });
      return r;
    }
    function modo(m) {
      st.modo = m; marcar(el, "data-modo", m);
      el.querySelectorAll("[data-sim]").forEach(function (x) { x.hidden = m !== "sim"; });
      dibujar();
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-modo]"); if (b) { modo(b.getAttribute("data-modo")); return; }
      var a = e.target.closest("[data-a]"); if (!a) return;
      if (a.getAttribute("data-a") === "sortear") { st.semilla = (st.semilla * 7919 + 13) % 100003; dibujar(); }
      if (a.getAttribute("data-a") === "ensayo") { st.sesgo = INI.sesgo; st.variacion = INI.variacion; st.semilla = 7; dibujar(); }
    });
    el.addEventListener("input", function (e) { var k = e.target.getAttribute("data-k"); if (!k) return; st[k] = parseFloat(e.target.value); dibujar(); });
    modo("real");
    U.alCambiarAncho(cont, dibujar);
    el.estadoCal = function () { var r = datos(); return { modo: st.modo, factor: r.factor, antes: r.a, despues: r.d, nuevas: r.n || null, sesgo: st.sesgo, variacion: st.variacion }; };
  };

  /* ── Cuadrado en los dos sentidos ── */
  V.cuadrado = function (el) {
    var uid = "cua" + Math.random().toString(36).slice(2, 7);
    var conteo = M.diferenciaDeConteos(M.CONTEO.der, M.CONTEO.izq);
    var CASOS = {
      ideal: { t: "Ruedas ideales", dif: 0, sep: 0 },
      conteos: { t: "Conteos medidos: 1976 y 1969", dif: conteo.ruedas, sep: 0 },
      sep: { t: "Solo separación 2 % mayor", dif: 0, sep: 0.02 },
      juntas: { t: "Las dos: se compensan en un sentido", dif: 0.0059, sep: 0.02 }
    };
    var st = { dif: CASOS.juntas.dif, sep: CASOS.juntas.sep };
    el.innerHTML =
      '<div class="chips" role="group" aria-label="Casos de ejemplo">' + Object.keys(CASOS).map(function (k) { return '<button type="button" class="chip" data-caso="' + k + '" aria-pressed="false">' + CASOS[k].t + '</button>'; }).join("") + '</div>' +
      '<div class="deslizadores">' +
      '<label for="' + uid + '-d">Rueda derecha frente a la izquierda, por el mismo conteo<b class="num" data-v="dif"></b><input id="' + uid + '-d" type="range" min="-1" max="1" step="0.01" data-k="dif"></label>' +
      '<label for="' + uid + '-b">Separación efectiva frente a los 18,8 cm configurados<b class="num" data-v="sep"></b><input id="' + uid + '-b" type="range" min="-4" max="4" step="0.1" data-k="sep"></label></div>' +
      '<div class="dos-pan cu-pan"><figure><figcaption><b>El recorrido</b><span>Cuadrado de 1 m. La odometría cree recorrer el trazo gris.</span></figcaption><div class="cu-g"></div></figure>' +
      '<figure><figcaption><b>La llegada, ampliada</b><span>Dónde termina el robot respecto de donde partió.</span></figcaption><div class="cu-z"></div></figure></div>' +
      '<div class="vley"><span><i class="lin-disc"></i>lo que cree la odometría</span><span><i class="lin azul"></i>antihorario y su llegada <i class="pt azul"></i></span><span><i class="lin" style="background:repeating-linear-gradient(90deg,var(--ambar) 0 6px,transparent 6px 9px)"></i>horario y su llegada <i class="cu ambar"></i></span><span><i class="pt" style="background:none;border:2px solid var(--ink)"></i>punto de partida</span></div>' +
      lecturas([["Antihorario", "ccw", 1], ["Horario", "cw", 1], ["Indicador del método", "max", 1], ["Giro real en cada esquina", "esq", 1], ["Desvío en cada tramo recto", "tramo", 1]]) +
      '<p class="vestado" aria-live="polite" data-o="msg"></p>' +
      '<p class="vnota" id="' + uid + '-nota">Ilustrativo: el robot de la tesis no se ensayó con este método. El robot sigue su propia odometría sin error de control, así que cree volver exacto al inicio. Lo dibujado es dónde termina de verdad. Sin ruido aleatorio. Borenstein y Feng usan un cuadrado de 4 m y cinco vueltas por sentido. Aquí se usa 1 m, para que quepa en un recinto pequeño. El caso de los conteos supone radios iguales y solo considera los 1976 y 1969 flancos por vuelta medidos.</p>';
    var g = el.querySelector(".cu-g"), z = el.querySelector(".cu-z");
    function o(k) { return el.querySelector('[data-o="' + k + '"]'); }
    function camino(pts, X, Y) { return pts.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(""); }
    function marcadores(xc, yc, horario, r) {
      /* el cuadrado del horario es más grande y el círculo del antihorario se dibuja encima con borde,
         para que los dos se vean aunque terminen en el mismo lugar */
      return horario ? '<rect x="' + (xc - r).toFixed(1) + '" y="' + (yc - r).toFixed(1) + '" width="' + 2 * r + '" height="' + 2 * r + '" class="f-ambar"/>' :
        '<circle cx="' + xc.toFixed(1) + '" cy="' + yc.toFixed(1) + '" r="' + r + '" class="f-azul k-sup" stroke-width="1.5"/>';
    }
    function dibujar() {
      var res = M.bidireccional({ dif: st.dif, sep: st.sep }), h = res.horario, a = res.antihorario;
      /* panel completo: misma escala en x e y, con margen para lo que se sale del cuadrado */
      var W = Math.max(240, g.clientWidth || 400), pts = h.real.concat(a.real, [[0, 0], [1, 1]]);
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var bx0 = Math.min.apply(null, xs) - 0.12, bx1 = Math.max.apply(null, xs) + 0.12, by0 = Math.min.apply(null, ys) - 0.12, by1 = Math.max.apply(null, ys) + 0.12;
      var sc = W / (bx1 - bx0), H = Math.round((by1 - by0) * sc);
      var X = function (x) { return (x - bx0) * sc; }, Y = function (y) { return (by1 - y) * sc; };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Trayectorias reales de los dos sentidos sobre el cuadrado de 1 m que cree recorrer la odometría">';
      s += '<path d="' + camino(a.odo, X, Y) + 'Z" fill="none" class="k-muted" stroke-width="2" stroke-dasharray="5 5"/>';
      s += '<path d="' + camino(a.real, X, Y) + '" fill="none" class="k-azul" stroke-width="2.5" stroke-linejoin="round"/>';
      s += '<path d="' + camino(h.real, X, Y) + '" fill="none" class="k-ambar" stroke-width="2.5" stroke-dasharray="7 4" stroke-linejoin="round"/>';
      /* sentido de partida de cada recorrido */
      s += '<path d="M' + X(0.42) + ' ' + (Y(0) - 7) + 'l10 7-10 7z" class="f-azul"/>';
      s += '<path d="M' + (X(0) - 7) + ' ' + Y(0.42) + 'l7 -10 7 10z" class="f-ambar"/>';
      s += '<circle cx="' + X(0) + '" cy="' + Y(0) + '" r="6" class="f-sup k-ink" stroke-width="2"/>';
      s += marcadores(X(h.fin.x), Y(h.fin.y), true, 5.5) + marcadores(X(a.fin.x), Y(a.fin.y), false, 4);
      g.innerHTML = s + '</svg>';
      /* recuadro ampliado alrededor del inicio, con una escala que se ajusta al error mayor */
      var Wz = Math.max(240, z.clientWidth || 400), Hz = Math.round(Wz * 0.75), media = Math.max(0.05, Math.ceil(res.mayor * 1.3 / 0.05) * 0.05);
      var sz = Math.min(Wz, Hz) / (2 * media), cx = Wz / 2, cy = Hz / 2, paso = media > 0.15 ? 0.05 : (media > 0.06 ? 0.02 : 0.01);
      var Xz = function (x) { return cx + x * sz; }, Yz = function (y) { return cy - y * sz; };
      var sz2 = '<svg width="' + Wz + '" height="' + Hz + '" viewBox="0 0 ' + Wz + ' ' + Hz + '" role="img" aria-label="Llegada ampliada: el antihorario termina a ' + fmt(a.error * 100, 1) + ' cm y el horario a ' + fmt(h.error * 100, 1) + ' cm del inicio">';
      for (var k = -Math.ceil(media * 2 / paso); k <= Math.ceil(media * 2 / paso); k++) {
        var v = k * paso, gx = Xz(v), gy = Yz(v);
        if (gx >= 0 && gx <= Wz) sz2 += ln(gx, 0, gx, Hz, "k-linea");
        if (gy >= 0 && gy <= Hz) sz2 += ln(0, gy, Wz, gy, "k-linea");
      }
      sz2 += ln(10, Hz - 12, 10 + paso * sz, Hz - 12, "k-ink", { "stroke-width": 2 }) + t(14 + paso * sz, Hz - 8, U.fmt(paso * 100, 0) + " cm", "t-s");
      sz2 += '<circle cx="' + cx + '" cy="' + cy + '" r="7" class="f-sup k-ink" stroke-width="2"/>';
      [[h, true], [a, false]].forEach(function (par) {
        var r = par[0], xe = Xz(r.fin.x), ye = Yz(r.fin.y), dx = xe - cx, dy = ye - cy, n = Math.hypot(dx, dy);
        if (n > 8) sz2 += ln(cx, cy, xe, ye, par[1] ? "k-ambar" : "k-azul", { "stroke-width": 1.5, "stroke-dasharray": par[1] ? "5 3" : "none" });
        sz2 += marcadores(xe, ye, par[1], par[1] ? 6 : 4.5);
        /* el rótulo sigue la dirección de la llegada, más allá del punto; si casi coincide con el inicio,
           va a un costado fijo. Si se saldría del recuadro, pasa al otro lado. */
        var ux = n > 8 ? dx / n : (par[1] ? 0.7 : -0.7), uy = n > 8 ? dy / n : (par[1] ? -0.7 : 0.7);
        var lx = xe + ux * 14, ly = ye + uy * 14 + 4, ancla = ux >= 0 ? "start" : "end", txt = (par[1] ? "horario " : "antihorario ") + fmt(r.error * 100, 1) + " cm", largo = txt.length * 6.7;
        if (ancla === "start" && lx + largo > Wz - 4) { ancla = "end"; lx = xe - 12; }
        if (ancla === "end" && lx - largo < 4) { ancla = "start"; lx = xe + 12; }
        ly = Math.max(14, Math.min(Hz - 22, ly));
        sz2 += t(lx, ly, txt, "t-s", { "text-anchor": ancla, style: "fill:var(--" + (par[1] ? "ambar" : "azul") + ")" });
      });
      z.innerHTML = sz2 + '</svg>';
      /* lecturas */
      o("ccw").textContent = fmt(a.error * 100, 1) + " cm"; o("ccw-s").textContent = "de distancia al inicio";
      o("cw").textContent = fmt(h.error * 100, 1) + " cm"; o("cw-s").textContent = "de distancia al inicio";
      o("max").textContent = fmt(res.mayor * 100, 1) + " cm"; o("max-s").textContent = "el mayor de los dos sentidos";
      o("esq").textContent = fmt(Math.abs(h.giroEsquina) * 180 / Math.PI, 2) + "°"; o("esq-s").textContent = "cuando la odometría pide 90°";
      o("tramo").textContent = fmt(Math.abs(h.giroTramo) * 180 / Math.PI, 2) + "°";
      o("tramo-s").textContent = Math.abs(h.giroTramo) < 1e-9 ? "el tramo es recto" : "curva hacia la " + (h.giroTramo > 0 ? "izquierda" : "derecha") + ", en los dos sentidos";
      var msg;
      if (res.mayor < 0.0005) msg = "Sin errores sistemáticos, los dos recorridos cierran el cuadrado y vuelven al inicio.";
      else {
        var chico = Math.min(a.error, h.error), grande = Math.max(a.error, h.error), cual = a.error < h.error ? "antihorario" : "horario", otro = a.error < h.error ? "horario" : "antihorario";
        if (chico < grande * 0.25) msg = "En sentido " + cual + " los dos errores casi se anulan y el robot vuelve a " + fmt(chico * 100, 1) + " cm del inicio. En sentido " + otro + " se suman y termina a " + fmt(grande * 100, 1) + " cm. Una prueba en un solo sentido podría dar un resultado engañosamente bueno.";
        else if (Math.abs(st.sep) < 1e-9) msg = "Una rueda avanza más que la otra con el mismo conteo, así que cada tramo que la odometría cree recto es una curva leve. El error es parecido en los dos sentidos: " + fmt(a.error * 100, 1) + " y " + fmt(h.error * 100, 1) + " cm.";
        else if (Math.abs(st.dif) < 1e-9) msg = "Con la separación mal estimada, cada giro de 90° queda en " + fmt(Math.abs(h.giroEsquina) * 180 / Math.PI, 2) + "°. En los dos sentidos el robot gira de menos o de más, y los errores quedan como espejos: " + fmt(a.error * 100, 1) + " y " + fmt(h.error * 100, 1) + " cm.";
        else msg = "Los dos errores se combinan distinto según el sentido: " + fmt(a.error * 100, 1) + " cm en antihorario y " + fmt(h.error * 100, 1) + " cm en horario. Comparar ambos permite separar las dos causas.";
      }
      o("msg").textContent = msg;
      var ds = { dif: st.dif * 100, sep: st.sep * 100 };
      el.querySelector('[data-v="dif"]').textContent = Math.abs(ds.dif) < 0.005 ? "iguales" : fmtS(ds.dif, 2) + " %";
      el.querySelector('[data-v="sep"]').textContent = fmtS(ds.sep, 1) + " %, " + fmt(M.B * (1 + st.sep) * 100, 2) + " cm";
      el.querySelectorAll("input[data-k]").forEach(function (i) { if (document.activeElement !== i) i.value = ds[i.getAttribute("data-k")]; });
      var caso = Object.keys(CASOS).filter(function (k) { return Math.abs(CASOS[k].dif - st.dif) < 5e-5 && Math.abs(CASOS[k].sep - st.sep) < 5e-5; })[0];
      marcar(el, "data-caso", caso || "");
      return res;
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-caso]"); if (!b) return;
      var c = CASOS[b.getAttribute("data-caso")]; st.dif = c.dif; st.sep = c.sep; dibujar();
    });
    el.addEventListener("input", function (e) { var k = e.target.getAttribute("data-k"); if (!k) return; st[k] = parseFloat(e.target.value) / 100; dibujar(); });
    dibujar();
    U.alCambiarAncho(el, dibujar);
    el.estadoCuadrado = function () { var r = M.bidireccional({ dif: st.dif, sep: st.sep }); return { dif: st.dif, sep: st.sep, horario: r.horario.error, antihorario: r.antihorario.error, mayor: r.mayor }; };
  };
})();
