/*
  Capítulo 03: interactivos de movimiento. Los de calibración se dibujan en SVG y los dos primeros, en canvas.
  cinematica   dos velocidades de rueda y la trayectoria que resulta
  encoder      canales en cuadratura y conteo por cuatro
  calibracion  error de las cinco rectas del robot real (Tabla A6.2) antes y después de dividir
               por un factor, y repeticiones simuladas para ver qué corrige y qué no
  cuadrado     cuadrado recorrido en los dos sentidos según la propia odometría, como en el
               método de Borenstein y Feng. Ilustrativo: el robot no se ensayó así
  odometria    distancias de la recta de 2 metros: ordenada, de los encoders y medida con cinta
  iteracion2   resultados de la iteración 2
  giro         giros medidos frente al ordenado
  Los cálculos están en js/movimiento-modelo.js y se prueban en herramientas/pruebas_movimiento.js.
*/
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U, M = window.MOVIMIENTO;
  var rgba = U.rgba, paleta = U.paleta, lienzo = U.lienzo, alTema = U.alTema, bucle = U.bucle, alCambiarMovimiento = U.alCambiarMovimiento;
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
      st.modo = m; U.marcar(el, "data-modo", m);
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
    U.alAncho(cont, dibujar);
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
      U.marcar(el, "data-caso", caso || "");
      return res;
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-caso]"); if (!b) return;
      var c = CASOS[b.getAttribute("data-caso")]; st.dif = c.dif; st.sep = c.sep; dibujar();
    });
    el.addEventListener("input", function (e) { var k = e.target.getAttribute("data-k"); if (!k) return; st[k] = parseFloat(e.target.value) / 100; dibujar(); });
    dibujar();
    U.alAncho(el, dibujar);
    el.estadoCuadrado = function () { var r = M.bidireccional({ dif: st.dif, sep: st.sep }); return { dif: st.dif, sep: st.sep, horario: r.horario.error, antihorario: r.antihorario.error, mayor: r.mayor }; };
  };

  /* 2. Cinemática diferencial. Los cálculos están en js/movimiento-modelo.js. */
  V.cinematica = function (el) {
    var MV = window.MOVIMIENTO, r = MV.R, b = MV.B;
    var st = { vl: 0.10, vr: 0.13 }, pose, rastro, P = paleta();
    var PRE = [["Recto a 0,13 m/s", 0.13, 0.13], ["Curva suave", 0.10, 0.13], ["Giro sobre su eje", -0.0329, 0.0329], ["Curva cerrada", 0.02, 0.13], ["Retroceso", -0.08, -0.08]];
    el.innerHTML =
      '<div class="chips" role="group" aria-label="Casos de ejemplo">' + PRE.map(function (p, i) { return '<button type="button" class="chip" data-p="' + i + '" aria-pressed="' + (i === 1) + '">' + p[0] + '</button>'; }).join("") + '</div>' +
      '<div class="deslizadores"><label for="ci-l">Rueda izquierda<b class="num" data-v="vl"></b><input id="ci-l" type="range" min="-0.15" max="0.15" step="0.001" data-k="vl"></label>' +
      '<label for="ci-r">Rueda derecha<b class="num" data-v="vr"></b><input id="ci-r" type="range" min="-0.15" max="0.15" step="0.001" data-k="vr"></label></div>' +
      '<div class="vctl"><button type="button" class="vbtn" data-a="mover" aria-pressed="false">Mover</button><button type="button" class="vbtn sec" data-a="reset">Volver a empezar</button></div>' +
      '<div class="ci-l"></div>' +
      '<div class="vley"><span><i class="lin azul"></i>recorrido del centro del robot</span><span><i class="lin-disc"></i>círculo que seguirá con estas velocidades</span><span><i class="pt" style="background:none;border:2px solid var(--ink)"></i>centro de giro</span></div>' +
      '<div class="lecturas"><div><span>Velocidad del robot</span><b data-o="v"></b></div><div><span>Giro del robot</span><b data-o="w"></b></div><div><span>Radio de la curva</span><b data-o="R"></b></div><div><span>Círculo de cada rueda</span><b data-o="Rr"></b><small data-o="Rr-s"></small></div><div><span>Ticks por ciclo, izquierda</span><b data-o="tl"></b></div><div><span>Ticks por ciclo, derecha</span><b data-o="tr"></b></div></div>' +
      '<p class="ci-formula" data-o="formula"></p>' +
      '<p class="vestado" aria-live="polite" data-o="aviso"></p>' +
      '<p class="vnota" id="ci-nota">El centro de giro es el punto alrededor del cual el robot gira en ese instante. Está sobre la línea que une las dos ruedas, del lado de la rueda más lenta. Cada rueda recorre su propio círculo alrededor de ese punto, y la de afuera va más rápido porque su círculo es más largo. Ticks por ciclo son los flancos de encoder que se cuentan en cada rueda durante 1/30 s, la unidad con que trabaja el control del capítulo 4. La animación avanza 1,5 veces más rápido que el robot real.</p>';
    var cont = el.querySelector(".ci-l"), L = lienzo(cont, 16 / 10, function () { dibujar(); });
    L.cv.setAttribute("role", "img"); L.cv.setAttribute("aria-describedby", "ci-nota");
    alTema(function () { P = paleta(); dibujar(); });
    var VIEW = 3.2, VIEW_H = VIEW / 1.6;  /* metros visibles de ancho y de alto */
    /* Si el círculo cabe, el robot parte de modo que su centro de giro quede al centro del dibujo
       y da vueltas sin salirse. Si no cabe o va recto, parte desde un costado. */
    function reset() {
      var k = MV.cinematica(st.vl, st.vr);
      if (isFinite(k.R) && Math.abs(k.R) + b / 2 + 0.1 < VIEW_H / 2) pose = { x: 0, y: -k.R, th: 0 };
      /* con el centro de giro a la izquierda la curva sube, avance o retroceda; se parte desde abajo */
      else pose = { x: k.v >= 0 ? -VIEW / 2 + 0.2 : VIEW / 2 - 0.2, y: isFinite(k.R) ? (k.R > 0 ? -VIEW_H / 2 + 0.2 : VIEW_H / 2 - 0.2) : 0, th: 0 };
      rastro = [[pose.x, pose.y]];
    }
    function centroGiro(k) {
      if (!isFinite(k.R)) return null;
      return { x: pose.x - k.R * Math.sin(pose.th), y: pose.y + k.R * Math.cos(pose.th) };
    }
    function calc() {
      var k = MV.cinematica(st.vl, st.vr), v = k.v, w = k.w;
      var tl = MV.ticksPorCiclo(st.vl), tr = MV.ticksPorCiclo(st.vr);
      var o = function (n) { return el.querySelector('[data-o="' + n + '"]'); };
      o("v").textContent = U.fmt(v, 3) + " m/s"; o("w").textContent = U.fmt(w, 2) + " rad/s";
      var recta = Math.abs(w) < 1e-4, enSitio = !recta && Math.abs(v) < 1e-4;
      o("R").textContent = recta ? "recta" : (enSitio ? "0 m, gira en su lugar" : U.fmt(Math.abs(k.R), 2) + " m");
      var rr = MV.radiosRuedas(k.R);
      o("Rr").textContent = recta ? "rectas" : U.fmt(Math.abs(rr.izq), 2) + " y " + U.fmt(Math.abs(rr.der), 2) + " m";
      o("Rr-s").textContent = recta ? "las dos ruedas avanzan en línea recta" : "radio de la izquierda y de la derecha";
      o("tl").textContent = U.fmt(tl, 1); o("tr").textContent = U.fmt(tr, 1);
      o("formula").innerHTML = "v = (v<sub>der</sub> + v<sub>izq</sub>) / 2 = (" + U.fmt(st.vr, 3) + " + " + U.fmt(st.vl, 3) + ") / 2 = <b>" + U.fmt(v, 3) + " m/s</b><br>" +
        "ω = (v<sub>der</sub> − v<sub>izq</sub>) / b = (" + U.fmt(st.vr, 3) + " − " + U.fmt(st.vl, 3) + ") / 0,188 = <b>" + U.fmt(w, 2) + " rad/s</b>" +
        (recta || enSitio ? "" : "<br>R = v / ω = " + U.fmt(v, 3) + " / " + U.fmt(w, 2) + " = <b>" + U.fmt(k.R, 2) + " m</b>" + (k.R > 0 ? ", centro a la izquierda" : ", centro a la derecha"));
      var av = [];
      if (Math.abs(v) > MV.VMAX + 1e-9) av.push("la velocidad pasa de 0,13 m/s");
      if (Math.abs(w) > MV.WMAX + 1e-9) av.push("el giro pasa de 0,35 rad/s");
      o("aviso").textContent = av.length ? "En el robot real, el controlador diferencial recortaría esta orden porque " + av.join(" y ") + "." : "Dentro de los límites del controlador diferencial del robot real, 0,13 m/s y 0,35 rad/s.";
      L.cv.setAttribute("aria-label", "Robot visto desde arriba. Rueda izquierda " + U.fmt(st.vl, 3) + " m/s, derecha " + U.fmt(st.vr, 3) + " m/s. " + (recta ? "Va en línea recta." : (enSitio ? "Gira en su lugar." : "Sigue un círculo de " + U.fmt(Math.abs(k.R), 2) + " m de radio, con el centro a la " + (k.R > 0 ? "izquierda." : "derecha."))));
      el.querySelectorAll("[data-v]").forEach(function (x) { x.textContent = U.fmt(st[x.getAttribute("data-v")], 3) + " m/s"; });
      el.querySelectorAll("input[data-k]").forEach(function (i) { if (document.activeElement !== i) i.value = st[i.getAttribute("data-k")]; });
      return k;
    }
    function dibujar() {
      if (!pose) return;
      var ctx = L.ctx, W = L.w, H = L.h, esc = W / VIEW, cx = W / 2, cy = H / 2, k = MV.cinematica(st.vl, st.vr);
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.linea; ctx.lineWidth = 1;
      for (var g = -10; g <= 10; g++) { var gx = cx + g * 0.25 * esc, gy = cy + g * 0.25 * esc; ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      ctx.fillStyle = P.muted; ctx.font = "11px " + "IBM Plex Mono, monospace"; ctx.fillText("cuadrícula de 25 cm", 8, H - 8);
      function X(x) { return cx + x * esc; } function Y(y) { return cy - y * esc; }
      /* centro de giro y círculos que seguirán el robot y cada rueda */
      var c = centroGiro(k);
      if (c && Math.abs(k.R) < 6) {
        var rr = MV.radiosRuedas(k.R);
        ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
        [[rr.izq, P.s2], [rr.der, P.s3]].forEach(function (q) { ctx.strokeStyle = rgba(q[1], .55); ctx.beginPath(); ctx.arc(X(c.x), Y(c.y), Math.abs(q[0]) * esc, 0, Math.PI * 2); ctx.stroke(); });
        ctx.strokeStyle = P.muted; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.arc(X(c.x), Y(c.y), Math.abs(k.R) * esc, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        /* radio del centro del robot al centro de giro */
        ctx.strokeStyle = rgba(P.ink, .5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(pose.x), Y(pose.y)); ctx.lineTo(X(c.x), Y(c.y)); ctx.stroke();
        ctx.fillStyle = P.sup; ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(c.x), Y(c.y), 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (Math.abs(k.R) > 0.05) { ctx.fillStyle = P.ink; ctx.font = "12px Atkinson Hyperlegible, sans-serif"; ctx.fillText("centro de giro", X(c.x) + 9, Y(c.y) - 7); }
      }
      ctx.strokeStyle = P.azul; ctx.lineWidth = 2; ctx.beginPath();
      rastro.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.stroke();
      ctx.save(); ctx.translate(X(pose.x), Y(pose.y)); ctx.rotate(-pose.th);
      var L1 = 0.20 * esc, L2 = 0.08 * esc, A = 0.13 * esc, rw = r * esc, bw = b / 2 * esc;
      ctx.fillStyle = rgba(P.azul, .18); ctx.strokeStyle = P.azul; ctx.lineWidth = 1.5;
      /* la planta en U del prototipo, con las medidas del CAD (U.robot en js/comun.js) */
      if (U && U.robot) U.robot.canvas(ctx, 0, 0, 0, esc, "giro"); else { ctx.beginPath(); ctx.rect(-L2, -A, L1 + L2, 2 * A); }
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.ink;
      ctx.fillRect(-rw, -bw - 0.012 * esc, 2 * rw, 0.024 * esc); ctx.fillRect(-rw, bw - 0.012 * esc, 2 * rw, 0.024 * esc);
      ctx.fillStyle = P.verde; ctx.beginPath(); ctx.moveTo(L1 + 6, 0); ctx.lineTo(L1 - 4, -6); ctx.lineTo(L1 - 4, 6); ctx.closePath(); ctx.fill();
      /* flechas de velocidad de rueda */
      function flecha(y, v, col) { var len = v / 0.15 * 0.22 * esc; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(len, y); ctx.stroke(); if (Math.abs(len) > 6) { var sgn = len > 0 ? 1 : -1; ctx.beginPath(); ctx.moveTo(len + sgn * 7, y); ctx.lineTo(len - sgn * 2, y - 5); ctx.lineTo(len - sgn * 2, y + 5); ctx.closePath(); ctx.fill(); } }
      flecha(-bw, st.vl, P.s2); flecha(bw, st.vr, P.s3);
      ctx.restore();
      ctx.font = "12px Atkinson Hyperlegible, sans-serif"; ctx.fillStyle = P.s2; ctx.fillText("● rueda izquierda", 8, 16); ctx.fillStyle = P.s3; ctx.fillText("● rueda derecha", 8, 32);
    }
    var kAct = null;
    /* avance exacto sobre el arco; la orden solo cambia con los controles */
    function paso(dt) {
      pose = MV.avanzar(pose, kAct.v, kAct.w, dt);
      var u = rastro[rastro.length - 1];
      if (Math.hypot(u[0] - pose.x, u[1] - pose.y) > 0.01) rastro.push([pose.x, pose.y]);
      if (rastro.length > 900) rastro.shift();
      if (Math.abs(pose.x) > VIEW / 2 + .2 || Math.abs(pose.y) > VIEW_H / 2 + .2) reset();
      dibujar();
    }
    kAct = calc(); reset(); dibujar();
    var B = bucle(el, function (dt) { paso(dt * 1.5); }), bMover = el.querySelector('[data-a="mover"]'), pausadoUsuario = false;
    function marcar() { bMover.textContent = B.activo ? "Pausar" : "Mover"; bMover.setAttribute("aria-pressed", String(B.activo)); }
    /* sin movimiento reducido arranca sola; con movimiento reducido espera a que la persona lo pida */
    if (!U.quieto()) B.play();
    marcar();
    alCambiarMovimiento(function (reducido) { if (!reducido && !pausadoUsuario) B.play(); marcar(); });
    el.addEventListener("input", function (e) { var k = e.target.getAttribute("data-k"); if (!k) return; st[k] = parseFloat(e.target.value); U.marcar(el, "data-p", ""); kAct = calc(); dibujar(); });
    el.addEventListener("click", function (e) {
      var p = e.target.closest("[data-p]");
      if (p) { var d = PRE[+p.getAttribute("data-p")]; st.vl = d[1]; st.vr = d[2]; U.marcar(el, "data-p", p.getAttribute("data-p")); kAct = calc(); reset(); dibujar(); }
      var a = e.target.closest("[data-a]");
      if (a && a.getAttribute("data-a") === "reset") { reset(); dibujar(); }
      if (a && a.getAttribute("data-a") === "mover") { if (B.activo) { B.pausa(); pausadoUsuario = true; } else { B.play(); pausadoUsuario = false; } marcar(); }
    });
    el.estadoSim = function () { var c = centroGiro(kAct); return { activo: B.activo, vl: st.vl, vr: st.vr, v: kAct.v, w: kAct.w, R: kAct.R, pose: { x: pose.x, y: pose.y, th: pose.th }, centro: c }; };
  };

  /* 3. Encoder de cuadratura */
  V.encoder = function (el) {
    var P = paleta(), ang = 0, sentido = 1, VEL0 = 0.6, vel = VEL0, cuenta = 0, cuenta1 = 0, hist = [], prevA = null, prevB = null, polos = 6;
    el.innerHTML = '<div class="vctl"><button type="button" class="vbtn" data-a="anim" aria-pressed="false">Reproducir</button><div class="segmento" role="group" aria-label="Sentido de giro"><button type="button" data-s="1" aria-pressed="true">Adelante</button><button type="button" data-s="-1" aria-pressed="false">Atrás</button></div>' +
      '<label class="desl-linea" for="en-v">Velocidad de giro del disco<b class="num"><span data-o="vel"></span> rad/s</b><input id="en-v" type="range" min="0" max="1.5" step="0.05" value="' + VEL0 + '"></label><button type="button" class="vbtn sec" data-a="paso">Avanzar un paso</button><button type="button" class="vbtn sec" data-a="cero">Contador a cero</button></div>' +
      '<div class="en-l"></div>' +
      '<div class="lecturas"><div><span>Cuenta con los cuatro flancos de A y B</span><b data-o="c">0</b></div><div><span>Cuenta solo con las subidas de A</span><b data-o="c1">0</b></div><div><span>Orden de los flancos</span><b data-o="ord">A antes que B</b></div><div><span>Sentido detectado</span><b data-o="sen">adelante</b></div></div>' +
      '<p class="vestado" aria-live="polite" data-o="estado"></p>' +
      '<p class="vnota">Ilustración con un imán de 6 pares de polos y la rueda girando muy lento. Usa Avanzar un paso: la primera cuenta sube en cada flanco y la segunda solo en uno de cada cuatro. Esa es la multiplicación por cuatro. En el robot, contar los cuatro flancos da 1980 por vuelta de rueda, unos 0,11 mm de avance por flanco, porque el sensor está en el eje del motor, antes de la caja reductora. Contando solo las subidas de A serían 495 por vuelta, unos 0,43 mm cada una.</p>';
    var cont = el.querySelector(".en-l"), L = lienzo(cont, 16 / 7, function () { dibujar(); });
    L.cv.setAttribute("role", "img"); L.cv.setAttribute("aria-label", "Disco magnético del encoder y las señales de los canales A y B en el tiempo");
    alTema(function () { P = paleta(); dibujar(); });
    function canal(a, desfase) { return Math.sin(polos * a + desfase) >= 0 ? 1 : 0; }
    function avanzarAng(da) {
      ang += da;
      var A = canal(ang, 0), Bv = canal(ang, -Math.PI / 2);
      if (prevA !== null && (A !== prevA || Bv !== prevB)) {
        /* decodificación por cuatro: cada cambio suma o resta según el otro canal */
        var adelante = (A !== prevA) ? (A !== Bv) : (A === Bv);
        cuenta += adelante ? 1 : -1;
        /* decodificación por uno: solo la subida de A cuenta, y B dice el sentido */
        if (A === 1 && prevA === 0) cuenta1 += Bv === 0 ? 1 : -1;
        el.querySelector('[data-o="ord"]').textContent = adelante ? "A antes que B" : "B antes que A";
        el.querySelector('[data-o="sen"]').textContent = adelante ? "adelante" : "atrás";
      }
      prevA = A; prevB = Bv;
      hist.push([A, Bv]); if (hist.length > 360) hist.shift();
      el.querySelector('[data-o="c"]').textContent = cuenta;
      el.querySelector('[data-o="c1"]').textContent = cuenta1;
    }
    function paso(dt) { avanzarAng(sentido * vel * dt); dibujar(); }
    function dibujar() {
      var ctx = L.ctx, W = L.w, H = L.h; ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      var R = Math.min(H * .36, W * .14), cx = R + 24, cy = H / 2;
      for (var k = 0; k < polos * 2; k++) {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, ang + k * Math.PI / polos, ang + (k + 1) * Math.PI / polos); ctx.closePath();
        ctx.fillStyle = k % 2 ? rgba(P.rojo, .75) : rgba(P.azul, .75); ctx.fill();
      }
      ctx.fillStyle = P.sup; ctx.beginPath(); ctx.arc(cx, cy, R * .35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.ink; ctx.font = "700 12px IBM Plex Mono, monospace"; ctx.textAlign = "center";
      var sA = [cx + R + 12, cy], sB = [cx, cy - R - 12];
      ctx.fillStyle = P.s1; ctx.fillRect(sA[0] - 6, sA[1] - 6, 12, 12); ctx.fillStyle = P.s2; ctx.fillRect(sB[0] - 6, sB[1] - 6, 12, 12);
      ctx.fillStyle = P.ink; ctx.fillText("A", sA[0] + 14, sA[1] + 4); ctx.fillText("B", sB[0] + 14, sB[1] + 4); ctx.textAlign = "start";
      var x0 = cx + R + 50, x1 = W - 14, w = x1 - x0, filas = [[P.s1, "A", 0], [P.s2, "B", 1]];
      filas.forEach(function (f, j) {
        var yb = H * (j ? .80 : .40), hh = H * .2;
        ctx.strokeStyle = P.linea; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
        ctx.fillStyle = P.muted; ctx.font = "11px IBM Plex Mono, monospace"; ctx.fillText("canal " + f[1], x0, yb - hh - 6);
        ctx.strokeStyle = f[0]; ctx.lineWidth = 2.2; ctx.beginPath();
        hist.forEach(function (hv, i) { var x = x0 + i / 359 * w, y = yb - hv[f[2]] * hh; if (i) { var py = yb - hist[i - 1][f[2]] * hh; if (py !== y) ctx.lineTo(x, py); ctx.lineTo(x, y); } else ctx.moveTo(x, y); });
        ctx.stroke();
      });
      /* marca de flancos */
      ctx.fillStyle = rgba(P.verde, .9);
      hist.forEach(function (hv, i) { if (i && (hv[0] !== hist[i - 1][0] || hv[1] !== hist[i - 1][1])) { var x = x0 + i / 359 * w; ctx.fillRect(x - 1, H * .45, 2, H * .08); } });
      /* en un teléfono la nota no cabe junto al disco: baja al borde izquierdo y, si aún no cabe, se abrevia */
      var nota = "cada marca verde es un flanco contado", xn = x0;
      if (xn + ctx.measureText(nota).width > W - 8) xn = 14;
      if (xn + ctx.measureText(nota).width > W - 8) nota = "marca verde: flanco contado";
      ctx.fillStyle = P.muted; ctx.fillText(nota, xn, H * .95);
    }
    /* llena el historial para que las señales se vean completas desde el inicio */
    (function () { for (var k = 0; k < 360; k++) { ang += VEL0 / 60; hist.push([canal(ang, 0), canal(ang, -Math.PI / 2)]); } prevA = hist[359][0]; prevB = hist[359][1]; dibujar(); })();
    var B = bucle(el, paso), bAnim = el.querySelector('[data-a="anim"]'), pausadoUsuario = false;
    function marcar() {
      var on = B.activo;
      bAnim.textContent = on ? "Pausar" : "Reproducir"; bAnim.setAttribute("aria-pressed", String(on));
      el.querySelector('[data-o="estado"]').textContent = on ? "Animación en marcha." : (U.quieto() && !pausadoUsuario ? "Imagen fija porque el sistema pide reducir el movimiento. Usa Reproducir o Avanzar un paso." : "Animación en pausa.");
    }
    function velTxt() { el.querySelector('[data-o="vel"]').textContent = U.fmt(vel, 2); }
    /* sin movimiento reducido arranca sola; con movimiento reducido queda fija hasta que la persona la inicie */
    if (!U.quieto()) B.play();
    velTxt(); marcar();
    alCambiarMovimiento(function (reducido) { if (!reducido && !pausadoUsuario) B.play(); marcar(); });
    el.addEventListener("click", function (e) {
      var s = e.target.closest("[data-s]"); if (s) { sentido = +s.getAttribute("data-s"); U.marcar(el, "data-s", s.getAttribute("data-s")); }
      var a = e.target.closest("[data-a]"); if (!a) return;
      var k = a.getAttribute("data-a");
      if (k === "cero") { cuenta = 0; cuenta1 = 0; el.querySelector('[data-o="c"]').textContent = 0; el.querySelector('[data-o="c1"]').textContent = 0; }
      if (k === "anim") { if (B.activo) { B.pausa(); pausadoUsuario = true; } else { B.play(); pausadoUsuario = false; } marcar(); }
      if (k === "paso") { if (B.activo) { B.pausa(); pausadoUsuario = true; marcar(); } avanzarAng(sentido * Math.PI / (2 * polos) * 1.0001); dibujar(); }
    });
    el.addEventListener("input", function (e) { if (e.target.id === "en-v") { vel = parseFloat(e.target.value); velTxt(); } });
    el.estadoSim = function () { return { activo: B.activo, vel: vel, control: parseFloat(el.querySelector("#en-v").value), etiqueta: el.querySelector('[data-o="vel"]').textContent, ang: ang, cuenta: cuenta, cuenta1: cuenta1 }; };
  };

  /* Recta de 2 metros */
  V.odometria = function (el) {
    el.innerHTML =
      '<div class="tres-datos"><div><b class="num">2,000 m</b><span>lo ordenado, 0,13 m/s durante 15,4 s</span></div><div class="az"><b class="num">1,924 m</b><span>lo que estiman los encoders</span></div><div class="ink"><b class="num">1,856 m</b><span>lo que avanzó de verdad, con cinta</span></div></div>' +
      '<div class="od-g"></div><p class="vnota">Promedio de 5 repeticiones en el robot real. Eje recortado para ver la diferencia.</p>';
    var cont = el.querySelector(".od-g");
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), H = 160, a = 1.83, b = 2.02, l = 16, r = 16, yL = 78;
      var x = function (v) { return l + (v - a) / (b - a) * (W - l - r); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Distancias de la recta de 2 metros">';
      s += '<line class="k-linea" stroke-width="2" x1="' + l + '" x2="' + (W - r) + '" y1="' + yL + '" y2="' + yL + '"/>';
      [1.85, 1.9, 1.95, 2.0].forEach(function (t) { s += '<line class="k-linea" x1="' + x(t) + '" x2="' + x(t) + '" y1="' + (yL - 4) + '" y2="' + (yL + 4) + '"/><text class="t-s" x="' + x(t) + '" y="' + (H - 4) + '" text-anchor="middle">' + U.fmt(t, 2) + ' m</text>'; });
      s += '<path class="k-rojo" fill="none" stroke-width="1.8" d="M' + x(1.856) + ' ' + (yL - 12) + ' V' + (yL - 30) + ' H' + x(2.0) + ' V' + (yL - 12) + '"/>';
      var chico = W < 520;
      s += '<text class="t-m t-b" style="fill:var(--rojo)" x="' + ((x(1.856) + x(2.0)) / 2) + '" y="' + (yL - 36) + '" text-anchor="middle">' + (chico ? '7,18 % seguimiento' : '7,18 % seguimiento, cinta frente a lo ordenado') + '</text>';
      s += '<path class="k-verde" fill="none" stroke-width="1.8" d="M' + x(1.856) + ' ' + (yL + 12) + ' V' + (yL + 28) + ' H' + x(1.924) + ' V' + (yL + 12) + '"/>';
      s += chico ? '<text class="t-m t-b" style="fill:var(--verde-texto)" x="' + ((x(1.856) + x(1.924)) / 2) + '" y="' + (yL + 44) + '" text-anchor="middle">3,63 % odometría</text>' : '<text class="t-m t-b" style="fill:var(--verde-texto)" x="' + (x(1.924) + 8) + '" y="' + (yL + 30) + '">3,63 % odometría, encoders frente a cinta</text>';
      s += '<circle class="f-ink" cx="' + x(1.856) + '" cy="' + yL + '" r="6"/><circle class="f-azul" cx="' + x(1.924) + '" cy="' + yL + '" r="6"/><circle class="f-sup k-ink" stroke-width="2" cx="' + x(2.0) + '" cy="' + yL + '" r="6"/>';
      cont.innerHTML = s + '</svg>';
    }
    dibujar();
    U.alAncho(cont, dibujar);
  };

  /* Iteración 2 */
  V.iteracion2 = function (el) {
    el.innerHTML =
      '<h4 class="vsub">Las señales de esa corrida</h4>' +
      '<div class="senales"><div class="sen az"><span class="eyebrow">Encoders</span><b class="num">3,851 m</b><span>la odometría sumó distancia</span></div>' +
      '<div class="sen ok"><span class="eyebrow">Láser y mapa</span><b>el mapa no creció</b><span>la señal estaba, pero el ensayo no la usa para detenerse</span></div>' +
      '<div class="sen ink"><span class="eyebrow">Posición real</span><b class="num">0 m</b><span>el robot no se movió de su posición inicial</span></div></div>' +
      '<h4 class="vsub">Por qué la red no lo explica</h4>' +
      '<div class="flujo"><div class="caja"><b>Encoder</b><small>pulsos de giro de la rueda</small></div><div class="flecha-d"></div>' +
      '<div class="caja"><b>Arduino</b><small>cuenta los pulsos</small></div><div class="flecha-d"></div>' +
      '<div class="caja azul"><b>Raspberry</b><small>calcula la odometría con sus propios conteos</small></div><div class="flecha-d punteada"><span>Wi-Fi</span></div>' +
      '<div class="caja"><b>Computador</b><small>la red queda después de la odometría</small></div></div>' +
      '<h4 class="vsub">El verificador de progreso tuvo tiempo de actuar</h4><div class="vp-g"></div>' +
      '<p class="vnota">14 metas en 5,09 minutos dan cerca de 22 s por meta. El verificador pide 5 cm cada 6 s. Si actuó o no, no está registrado y se puede revisar en el rosbag.</p>';
    var cont = el.querySelector(".vp-g");
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), H = 96, l = 12, r = 12, T = 22;
      var x = function (t) { return l + t / T * (W - l - r); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Una meta de 22 segundos frente a ventanas de 6 segundos">';
      s += '<rect class="f-azul-s" x="' + x(0) + '" y="16" width="' + (x(T) - x(0)) + '" height="20" rx="4"/><text class="t-m" x="' + (x(0) + 8) + '" y="30">una meta, unos 22 s en promedio</text>';
      for (var k = 0; k * 6 < T; k++) {
        var a = x(k * 6), b = x(Math.min(T, (k + 1) * 6));
        s += '<rect class="f-ambar-s k-ambar" x="' + (a + 1) + '" y="46" width="' + (b - a - 2) + '" height="20" rx="4"/>';
        if (b - a > 60) s += '<text class="t-s" x="' + ((a + b) / 2) + '" y="60" text-anchor="middle">6 s, 5 cm</text>';
      }
      [0, 6, 12, 18, 22].forEach(function (t) { s += '<text class="t-s" x="' + x(t) + '" y="' + (H - 6) + '" text-anchor="middle">' + t + ' s</text>'; });
      cont.innerHTML = s + '</svg>';
    }
    dibujar();
    U.alAncho(cont, dibujar);
  };

  /* Giro */
  V.giro = function (el) {
    el.innerHTML =
      '<div class="flujo"><div class="caja"><b>El script pide</b><small>0,4 rad/s durante 15,7 s, una vuelta a esa velocidad</small></div><div class="flecha-d"></div>' +
      '<div class="caja ambar"><b>El controlador limita</b><small>a 0,35 rad/s</small></div><div class="flecha-d"></div>' +
      '<div class="caja"><b>Máximo ideal</b><small>0,35 por 15,7 s da 5,5 rad, unos 315°</small></div></div>' +
      '<div class="gi-g"></div>' +
      '<div class="vley"><span><i class="lin ambar"></i>315°, límite ideal</span><span><i class="lin-disc"></i>360°, nominal</span><span><i class="pt azul"></i>cinco giros medidos en el robot</span></div>' +
      '<p class="vnota">Todos los giros superaron los 315°. La causa no se determinó. Los rosbag tienen /odom para revisarlo sin repetir el ensayo.</p>';
    var cont = el.querySelector(".gi-g"), med = [355.7, 340, 380, 370, 356];
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), H = 150, a = 300, b = 390, l = 16, r = 16, yL = 76;
      var x = function (v) { return l + (v - a) / (b - a) * (W - l - r); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ángulos medidos de 340, 355,7, 356, 370 y 380 grados, frente a 315 y 360 grados">';
      s += '<rect class="f-ambar-s" x="' + x(300) + '" y="' + (yL - 22) + '" width="' + (x(315) - x(300)) + '" height="44"/>';
      s += '<line class="k-linea" stroke-width="2" x1="' + l + '" x2="' + (W - r) + '" y1="' + yL + '" y2="' + yL + '"/>';
      for (var t = 300; t <= 390; t += 15) s += '<text class="t-s" x="' + x(t) + '" y="' + (H - 6) + '" text-anchor="middle">' + t + '°</text>';
      s += '<line class="k-ambar" stroke-width="2.5" x1="' + x(315) + '" x2="' + x(315) + '" y1="' + (yL - 20) + '" y2="' + (yL + 28) + '"/>';
      s += '<line class="k-muted" stroke-width="2" stroke-dasharray="4 4" x1="' + x(360) + '" x2="' + x(360) + '" y1="' + (yL - 20) + '" y2="' + (yL + 28) + '"/>';
      /* cada valor queda escrito junto a su punto, alternando arriba y abajo en orden creciente */
      med.slice().sort(function (p, q) { return p - q; }).forEach(function (m, i) {
        var arriba = i % 2 === 0, cy = yL + (arriba ? -10 : 10);
        s += '<circle class="f-azul" cx="' + x(m) + '" cy="' + cy + '" r="6"/>';
        s += '<text class="t-s" style="fill:var(--azul)" x="' + x(m) + '" y="' + (arriba ? cy - 12 : cy + 20) + '" text-anchor="middle">' + U.fmt(m, m % 1 ? 1 : 0) + '°</text>';
      });
      s += '<text class="t-s" x="' + (x(315) - 5) + '" y="' + (yL + 40) + '" text-anchor="end">315°</text><text class="t-s" x="' + (x(360) + 5) + '" y="' + (yL + 40) + '">360°</text>';
      cont.innerHTML = s + '</svg>';
    }
    dibujar();
    U.alAncho(cont, dibujar);
  };
  V["reto-movimiento"] = function (el) { U.reto(el, M.reto(), "mv-reto-", M.evaluarReto); };
})();
