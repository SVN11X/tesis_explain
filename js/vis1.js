/* Diagramas de marco teórico, navegación y exploración */
(function () {
  "use strict";
  var V = window.VISUALES, U = window.U;
  /* Iconos compartidos, definidos en js/comun.js */
  var ICO = V.ICO || (U && U.ICO) || { OK: "", NO: "" }, OK = ICO.OK, NO = ICO.NO;

  /* El capítulo 05 implementa esta visualización en js/mapeo.js. */

  /* A estrella frente a Dijkstra, paso a paso.
     La búsqueda se calcula una vez y se guarda cada paso: la celda que se revisa, su g, su h,
     el camino que la alcanzó y las celdas pendientes. Así se puede avanzar, retroceder y reproducir. */
  var AS = { C: 24, R: 13, A: [3, 6], B: [20, 6], muro: {} };
  for (var my = 2; my < 11; my++) AS.muro[12 + "," + my] = 1;
  AS.h = function (x, y) { return Math.abs(x - AS.B[0]) + Math.abs(y - AS.B[1]); };
  AS.buscar = function (conH) {
    var C = AS.C, R = AS.R, A = AS.A, B = AS.B, muro = AS.muro;
    var g = {}, padre = {}, cerrado = {}, abiertos = [], pasos = [];
    function hk(k) { if (!conH) return 0; var p = k.split(","); return AS.h(+p[0], +p[1]); }
    function pendientes() { var u = {}; abiertos.forEach(function (a) { if (!cerrado[a.k]) u[a.k] = 1; }); return Object.keys(u); }
    function camino(k) { var out = []; while (k) { var p = k.split(","); out.unshift([+p[0], +p[1]]); k = padre[k]; } return out; }
    var k0 = A.join(",");
    g[k0] = 0; abiertos.push({ k: k0, x: A[0], y: A[1], f: 0, h: 0 });
    while (abiertos.length) {
      /* menor f; con empate, menor h. El orden de llegada decide los empates restantes */
      abiertos.sort(function (a, b) { return a.f - b.f || a.h - b.h; });
      var antes = pendientes(), c = abiertos.shift();
      if (cerrado[c.k]) continue;
      cerrado[c.k] = 1;
      var hc = hk(c.k), fc = g[c.k] + hc;
      var paso = { x: c.x, y: c.y, g: g[c.k], h: hc, f: fc, pendAntes: antes.length,
        empates: antes.filter(function (k) { return k !== c.k && g[k] + hk(k) === fc; }).length, camino: camino(c.k) };
      pasos.push(paso);
      if (c.x === B[0] && c.y === B[1]) { paso.pend = pendientes(); break; }
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (dd) {
        var nx = c.x + dd[0], ny = c.y + dd[1], nk = nx + "," + ny;
        if (nx < 0 || ny < 0 || nx >= C || ny >= R || muro[nk] || cerrado[nk]) return;
        var ng = g[c.k] + 1;
        if (g[nk] == null || ng < g[nk]) {
          g[nk] = ng; padre[nk] = c.k;
          var h = conH ? AS.h(nx, ny) : 0;
          abiertos.push({ k: nk, x: nx, y: ny, f: ng + h, h: h });
        }
      });
      paso.pend = pendientes();
    }
    var ultimo = pasos[pasos.length - 1];
    return { pasos: pasos, camino: ultimo.camino, llego: ultimo.x === B[0] && ultimo.y === B[1] };
  };
  window.ASTAR_PRUEBAS = AS;

  V.astar = function (el) {
    var C = AS.C, R = AS.R, T = 16, A = AS.A, B = AS.B, muro = AS.muro;
    var res = { d: AS.buscar(false), a: AS.buscar(true) };
    var NOMBRE = { d: "Dijkstra", a: "A estrella" }, INICIO = 30;
    var st = { alg: "a", k: INICIO }, uid = "as" + Math.random().toString(36).slice(2, 7), anim = 0, tUlt = 0, acum = 0;
    var s = '<svg class="vsvg" viewBox="0 0 ' + C * T + ' ' + R * T + '" role="img" aria-labelledby="' + uid + '-t"><title id="' + uid + '-t">Rejilla de búsqueda</title>';
    for (var yy = 0; yy < R; yy++) for (var xx = 0; xx < C; xx++) {
      s += '<rect data-c="' + xx + ',' + yy + '" x="' + (xx * T + .5) + '" y="' + (yy * T + .5) + '" width="' + (T - 1) + '" height="' + (T - 1) + '" rx="2" class="' + (muro[xx + "," + yy] ? 'f-obst' : 'f-celda') + '"/>';
    }
    s += '<path class="as-h k-ambar" fill="none" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round" d=""/>';
    s += '<path class="as-g k-azul" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d=""/>';
    s += '<path class="as-camino k-azul" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d=""/>';
    s += '<circle class="f-verde" cx="' + (A[0] * T + T / 2) + '" cy="' + (A[1] * T + T / 2) + '" r="6"/><rect class="f-rojo" x="' + (B[0] * T + 2) + '" y="' + (B[1] * T + 2) + '" width="' + (T - 4) + '" height="' + (T - 4) + '" rx="2"/></svg>';
    el.innerHTML =
      '<div class="vctl"><div class="segmento" role="group" aria-label="Algoritmo"><button type="button" data-alg="d" aria-pressed="false">Dijkstra</button><button type="button" data-alg="a" aria-pressed="true">A estrella</button></div>' +
      '<button type="button" class="vbtn" data-a="play" aria-pressed="false">Reproducir</button><button type="button" class="vbtn sec" data-a="paso">Un paso</button><button type="button" class="vbtn sec" data-a="fin">Ver el final</button><button type="button" class="vbtn sec" data-a="cero">Desde el inicio</button></div>' +
      '<label class="desl-linea" for="' + uid + '-k">Celdas revisadas<b class="num" data-o="k"></b><input id="' + uid + '-k" type="range" min="0" step="1" data-k="k"></label>' +
      s +
      '<div class="vley"><span><i class="pt verde"></i>robot</span><span><i class="cu rojo"></i>meta</span><span><i class="cu obst"></i>obstáculo</span><span><i class="cu as-rev"></i>revisada</span><span><i class="cu as-pend"></i>pendiente, en la cola</span><span><i class="cu azul"></i>la que revisa ahora</span>' +
      '<span><i class="lin azul"></i>g, el camino que la alcanzó</span><span><i class="lin" style="background:repeating-linear-gradient(90deg,var(--ambar) 0 5px,transparent 5px 9px)"></i>h, lo que estima que falta</span></div>' +
      '<div class="as-cuenta"><div><span>g, lo ya recorrido</span><b class="num" data-o="g"></b><small>pasos desde el robot</small></div><div><span>h, lo que estima que falta</span><b class="num" data-o="h"></b><small data-o="h-s"></small></div><div><span>f = g + h</span><b class="num" data-o="f"></b><small>se revisa primero la menor</small></div><div><span>Pendientes en la cola</span><b class="num" data-o="pend"></b><small>celdas por revisar</small></div></div>' +
      '<p class="vestado" aria-live="polite" data-o="msg"></p>' +
      '<div class="as-cuenta"><div><span>Dijkstra revisa</span><b class="num">' + res.d.pasos.length + '</b><small>celdas hasta la meta</small></div><div><span>A estrella revisa</span><b class="num">' + res.a.pasos.length + '</b><small>celdas hasta la meta</small></div><div><span>Largo de la ruta</span><b class="num">' + (res.a.camino.length - 1) + '</b><small>pasos, igual en las dos</small></div></div>' +
      '<p class="vnota">Grilla de ejemplo con 4 vecinos y cada paso de costo 1. La h cuenta las cuadras hasta la meta como si no hubiera obstáculos, por eso la línea discontinua puede cruzar el muro. Así nunca estima más de lo que falta, una h admisible, y A estrella encuentra la ruta más corta. Si dos celdas empatan en f, se revisa primero la de menor h.</p>';
    var rects = {}; el.querySelectorAll("rect[data-c]").forEach(function (r) { rects[r.getAttribute("data-c")] = r; });
    var pg = el.querySelector(".as-g"), ph = el.querySelector(".as-h"), pc = el.querySelector(".as-camino"), rango = el.querySelector("input[data-k]"), estado = el.querySelector('[data-o="msg"]');
    var bPlay = el.querySelector('[data-a="play"]');
    function o(k) { return el.querySelector('[data-o="' + k + '"]'); }
    function d(pts) { return pts.length ? "M" + pts.map(function (p) { return (p[0] * T + T / 2) + " " + (p[1] * T + T / 2); }).join(" L") : ""; }
    function dibujar() {
      var r = res[st.alg], n = r.pasos.length, k = Math.max(0, Math.min(n, st.k)), act = k ? r.pasos[k - 1] : null, fin = k === n;
      var clase = {};
      for (var i = 0; i < k; i++) clase[r.pasos[i].x + "," + r.pasos[i].y] = "as-rev";
      (act ? act.pend : [A.join(",")]).forEach(function (q) { if (!clase[q]) clase[q] = "as-pend"; });
      if (act && !fin) clase[act.x + "," + act.y] = "as-act";
      Object.keys(rects).forEach(function (q) { if (!muro[q]) rects[q].setAttribute("class", clase[q] || "f-celda"); });
      pc.setAttribute("d", fin ? d(r.camino) : "");
      pg.setAttribute("d", act && !fin ? d(act.camino) : "");
      ph.setAttribute("d", act && !fin && st.alg === "a" ? d([[act.x, act.y], [B[0], act.y], B]) : "");
      o("k").textContent = k + " de " + n;
      o("g").textContent = act ? act.g : "0";
      o("h").textContent = st.alg === "a" ? (act ? act.h : AS.h(A[0], A[1])) : "0";
      o("h-s").textContent = st.alg === "a" ? "cuadras hasta la meta" : "Dijkstra no estima";
      o("f").textContent = act ? act.f : (st.alg === "a" ? AS.h(A[0], A[1]) : 0);
      o("pend").textContent = act ? act.pend.length : 1;
      var msg;
      if (!k) msg = "Todavía no revisa ninguna celda. En la cola solo está la del robot, con g = 0.";
      else if (fin) msg = NOMBRE[st.alg] + " llegó a la meta después de revisar " + n + " celdas. La ruta tiene " + (r.camino.length - 1) + " pasos." + (st.alg === "d" ? " A estrella encuentra una igual de corta revisando " + res.a.pasos.length + "." : " Dijkstra necesita revisar " + res.d.pasos.length + " para encontrar una igual de corta.");
      else if (st.alg === "a") {
        msg = "Paso " + k + ". Revisa la celda marcada: llegar hasta ella costó g = " + act.g + " pasos y h estima " + act.h + " más hasta la meta, así que f = " + act.f + ". Tenía la menor f entre " + act.pendAntes + (act.pendAntes === 1 ? " celda pendiente" : " celdas pendientes") + (act.empates ? ", empatada con otras " + act.empates + "; entre ellas se elige la de menor h." : ".");
        msg = msg.replace("; entre ellas", ". Entre ellas");
        if (act.f > AS.h(A[0], A[1])) msg += " Como el muro corta el camino directo, ya no quedan pendientes con f = " + AS.h(A[0], A[1]) + ", la estimación desde el robot, y la búsqueda pasa a caminos más largos.";
      } else msg = "Paso " + k + ". Revisa la celda marcada, a g = " + act.g + " pasos del robot. Sin estimación, revisa primero las más cercanas al robot en todas las direcciones, aunque se alejen de la meta.";
      estado.textContent = msg;
      rango.max = n; if (document.activeElement !== rango) rango.value = k;
      el.querySelectorAll("[data-alg]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-alg") === st.alg)); });
      el.querySelector("title").textContent = "Búsqueda con " + NOMBRE[st.alg] + ", " + k + " de " + n + " celdas revisadas" + (fin ? ", con la ruta encontrada." : ".");
    }
    function marcar() {
      bPlay.textContent = anim ? "Pausar" : (st.k >= res[st.alg].pasos.length ? "Reproducir de nuevo" : "Reproducir");
      bPlay.setAttribute("aria-pressed", String(!!anim));
      estado.setAttribute("aria-live", anim ? "off" : "polite");
    }
    function parar() { if (anim) { cancelAnimationFrame(anim); anim = 0; } marcar(); }
    /* 30 celdas por segundo en los dos algoritmos: la diferencia de duración refleja la diferencia de trabajo */
    function cuadro(ts) {
      var dt = tUlt ? Math.min(0.1, (ts - tUlt) / 1000) : 0; tUlt = ts; acum += dt * 30;
      var n = res[st.alg].pasos.length, avance = Math.floor(acum);
      if (avance) { acum -= avance; st.k = Math.min(n, st.k + avance); dibujar(); }
      if (st.k >= n) { anim = 0; marcar(); dibujar(); return; }
      anim = requestAnimationFrame(cuadro);
    }
    function reproducir() {
      if (anim) { parar(); return; }
      if (st.k >= res[st.alg].pasos.length) st.k = 0;
      if (U.quieto()) { st.k = res[st.alg].pasos.length; dibujar(); marcar(); return; }
      tUlt = 0; acum = 0; anim = requestAnimationFrame(cuadro); marcar();
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-alg]");
      if (b) { parar(); st.alg = b.getAttribute("data-alg"); st.k = 0; dibujar(); marcar(); return; }
      var a = e.target.closest("[data-a]"); if (!a) return;
      var k = a.getAttribute("data-a"), n = res[st.alg].pasos.length;
      if (k === "play") { reproducir(); return; }
      parar();
      if (k === "paso") st.k = Math.min(n, st.k + 1);
      if (k === "fin") st.k = n;
      if (k === "cero") st.k = 0;
      dibujar(); marcar();
    });
    rango.addEventListener("input", function () { parar(); st.k = +rango.value; dibujar(); marcar(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) parar(); });
    if (window.matchMedia) {
      /* addListener cubre Safari anterior a la versión 14, donde MediaQueryList no tiene addEventListener */
      var mqr = window.matchMedia("(prefers-reduced-motion: reduce)"), alReducir = function (e) { if (e.matches) parar(); };
      if (mqr.addEventListener) mqr.addEventListener("change", alReducir); else if (mqr.addListener) mqr.addListener(alReducir);
    }
    dibujar(); marcar();
    el.estadoAstar = function () { var r = res[st.alg], act = st.k ? r.pasos[st.k - 1] : null; return { alg: st.alg, k: st.k, n: r.pasos.length, g: act && act.g, h: act && act.h, f: act && act.f, pend: act ? act.pend.length : 1, activo: !!anim, camino: el.querySelector(".as-camino").getAttribute("d") !== "" }; };
  };

  /* Frontera según Yamauchi y según explore_lite */
  V.frontera = function (el) {
    var M = [
      "222222221111",
      "200000001111",
      "200000000111",
      "200010000111",
      "200000000111",
      "200000001111",
      "200000001111",
      "200000022222",
      "222222222222"
    ].map(function (r) { return r.split("").map(Number); });
    var R = M.length, C = M[0].length, T = 18;
    function v4(x, y) { return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[0] < C && p[1] < R; }); }
    function regiones(celdas) {
      var vis = {}, out = [];
      celdas.forEach(function (c) {
        var k = c.join(","); if (vis[k]) return;
        var reg = [], pila = [c]; vis[k] = 1;
        while (pila.length) {
          var p = pila.pop(); reg.push(p);
          for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
            var q = [p[0] + dx, p[1] + dy], kq = q.join(",");
            if (!vis[kq] && celdas.some(function (z) { return z[0] === q[0] && z[1] === q[1]; })) { vis[kq] = 1; pila.push(q); }
          }
        }
        out.push(reg);
      });
      return out;
    }
    var fy = [], fe = [];
    for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) {
      if (M[y][x] === 0 && v4(x, y).some(function (p) { return M[p[1]][p[0]] === 1; })) fy.push([x, y]);
      if (M[y][x] === 1 && v4(x, y).some(function (p) { return M[p[1]][p[0]] === 0; })) fe.push([x, y]);
    }
    function panel(front, minimo, titulo) {
      var regs = regiones(front);
      var s = '<svg class="vsvg" viewBox="0 0 ' + C * T + ' ' + R * T + '" role="img" aria-label="' + U.esc(titulo) + '">';
      for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) {
        var m = M[y][x];
        s += '<rect x="' + (x * T + .5) + '" y="' + (y * T + .5) + '" width="' + (T - 1) + '" height="' + (T - 1) + '" rx="2" class="' + (m === 2 ? 'f-obst' : (m === 1 ? 'f-desc' : 'f-celda')) + '"/>';
      }
      var acept = 0, rech = 0;
      regs.forEach(function (reg) {
        var ok = reg.length >= minimo;
        if (ok) acept++; else rech++;
        reg.forEach(function (p) {
          s += '<rect x="' + (p[0] * T + 2.5) + '" y="' + (p[1] * T + 2.5) + '" width="' + (T - 5) + '" height="' + (T - 5) + '" rx="2" class="' + (ok ? 'f-ambar' : 'f-rech') + '"/>';
          if (!ok) s += '<path class="k-ink" stroke-width="1.6" d="M' + (p[0] * T + 5) + ' ' + (p[1] * T + 5) + ' l' + (T - 10) + ' ' + (T - 10) + ' M' + (p[0] * T + T - 5) + ' ' + (p[1] * T + 5) + ' l-' + (T - 10) + ' ' + (T - 10) + '"/>';
        });
      });
      s += '<circle class="f-verde" cx="' + (2 * T + T / 2) + '" cy="' + (5 * T + T / 2) + '" r="6"/></svg>';
      return { svg: s, acept: acept, rech: rech };
    }
    var a = panel(fy, 5, "Fronteras según Yamauchi"), b = panel(fe, 1, "Fronteras según explore_lite");
    el.innerHTML = '<div class="dos-pan">' +
      '<figure><figcaption><b>Yamauchi</b><span>Celda libre junto a una desconocida. Solo regiones de tamaño parecido al del robot.</span></figcaption>' + a.svg +
      '<p class="vnota">' + a.acept + ' región aceptada, ' + a.rech + ' descartada por chica.</p></figure>' +
      '<figure><figcaption><b>explore_lite, configurado en este robot</b><span>Celda desconocida junto a una libre. Mínimo 0,05 m, basta una celda.</span></figcaption>' + b.svg +
      '<p class="vnota">' + b.acept + ' regiones aceptadas, incluida la celda suelta del medio.</p></figure></div>' +
      '<div class="vley"><span><i class="cu sup"></i>libre</span><span><i class="cu desc"></i>desconocida</span><span><i class="cu obst"></i>ocupada</span><span><i class="cu ambar"></i>frontera aceptada</span><span><i class="cu rech"></i>frontera descartada</span><span><i class="pt verde"></i>robot</span></div>' +
      '<p class="vnota">Mapa de ejemplo. La celda suelta del medio representa una lectura de ruido del láser.</p>';
  };

  /* El capítulo 05 implementa esta visualización en js/mapeo.js. */

  /* Reemplazo de metas */
  V.metas = function (el) {
    el.innerHTML = '<div class="vctl"><button type="button" class="vbtn" data-a="play">Reproducir 20 segundos</button><span class="vestado" aria-live="polite"></span></div><div class="mt-graf"></div>' +
      '<div class="vley"><span><i class="cu azul"></i>meta activa</span><span><i class="x-rojo"></i>Nav2 la cierra como abortada</span><span><i class="lin-disc"></i>el explorador vuelve a elegir</span></div>' +
      '<h4 class="vsub">Las 60 metas de las cinco corridas</h4><div class="waffle" role="img" aria-label="60 metas: 1 completada, 53 abortadas asociadas a un reemplazo, 1 abortada sin clasificar y 5 sin estado terminal"></div>' +
      '<div class="vley"><span><i class="cu verde"></i>1 completada</span><span><i class="cu azul"></i>53 abortadas asociadas a un reemplazo</span><span><i class="cu obst"></i>1 abortada sin clasificar</span><span><i class="cu gris"></i>5 sin estado terminal</span></div>' +
      '<p class="vnota">La mediana entre la aceptación de una meta y la de la siguiente fue 3,3 s en las cinco corridas, igual al período del explorador. La línea de tiempo de arriba es un ejemplo con ese período. La asociación es temporal: no descarta fallas de Nav2 al mismo tiempo.</p>';
    var w = "";
    w += '<i class="w-ok"></i>';
    for (var i = 0; i < 53; i++) w += '<i class="w-rem"></i>';
    w += '<i class="w-sc"></i>';
    for (var j = 0; j < 5; j++) w += '<i></i>';
    el.querySelector(".waffle").innerHTML = w;
    var cont = el.querySelector(".mt-graf"), estado = el.querySelector(".vestado");
    var P = 3.3, TT = 20, n = Math.floor(TT / P) + 1, Tact = TT, parar = null;
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), chico = W < 520;
      var ml = chico ? 50 : 70, mr = 14, mt = 22, fila = chico ? 20 : 24, H = mt + n * fila + 30;
      var x = function (t) { return ml + t / TT * (W - ml - mr); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Metas que el explorador envía y reemplaza cada 3,3 segundos">';
      for (var t = 0; t <= TT; t += 5) s += '<line class="k-linea" x1="' + x(t) + '" x2="' + x(t) + '" y1="' + (mt - 6) + '" y2="' + (H - 24) + '"/><text class="t-s" x="' + x(t) + '" y="' + (H - 8) + '" text-anchor="middle">' + t + ' s</text>';
      var env = 0, abo = 0;
      for (var k = 0; k < n; k++) {
        var t0 = k * P, t1 = Math.min((k + 1) * P, TT), y = mt + k * fila;
        s += '<text class="t-s" x="' + (ml - 8) + '" y="' + (y + fila / 2 + 4) + '" text-anchor="end">meta ' + (k + 1) + '</text>';
        s += '<line class="k-muted" stroke-dasharray="2 3" x1="' + x(t0) + '" x2="' + x(t0) + '" y1="' + (mt - 6) + '" y2="' + (H - 24) + '"/>';
        if (Tact >= t0) {
          env++;
          var tf = Math.min(Tact, t1);
          s += '<rect class="f-azul" x="' + x(t0) + '" y="' + (y + 4) + '" width="' + Math.max(1, x(tf) - x(t0)) + '" height="' + (fila - 8) + '" rx="3"/>';
          if (Tact >= (k + 1) * P && (k + 1) * P <= TT) {
            abo++;
            var cx = x((k + 1) * P), cy = y + fila / 2;
            s += '<path class="k-rojo" stroke-width="2.4" d="M' + (cx - 5) + ' ' + (cy - 5) + ' l10 10 M' + (cx + 5) + ' ' + (cy - 5) + ' l-10 10"/>';
            if (k === 0 && !chico) s += '<text class="t-m" x="' + (cx + 9) + '" y="' + (cy + 4) + '">abortada al llegar la siguiente</text>';
          }
        }
      }
      s += '<line class="k-ink" stroke-width="2" x1="' + x(Tact) + '" x2="' + x(Tact) + '" y1="' + (mt - 10) + '" y2="' + (H - 24) + '"/>';
      cont.innerHTML = s + '</svg>';
      estado.textContent = "Enviadas " + env + ". Abortadas al llegar la siguiente " + abo + ".";
    }
    el.addEventListener("click", function (e) {
      if (!e.target.closest('[data-a="play"]')) return;
      if (parar) parar();
      parar = U.animar(7000, function (k) { Tact = k * TT; dibujar(); });
    });
    dibujar();
    U.alCambiarAncho(cont, dibujar);
  };

  /* Lista negra */
  V.listanegra = function (el) {
    el.innerHTML =
      '<h4 class="vsub">Cada 3,3 segundos el explorador elige destino</h4>' +
      '<div class="flujo"><div class="caja"><b>Buscar fronteras</b><small>bordes sin explorar</small></div><div class="flecha-d"></div>' +
      '<div class="caja"><b>Ordenar</b><small>cercanía y tamaño</small></div><div class="flecha-d"></div>' +
      '<div class="caja"><b>Saltar las tachadas</b><small>las de la lista negra</small></div><div class="flecha-d"></div>' +
      '<div class="caja azul"><b>Enviar meta</b><small>sin cancelar la anterior</small></div></div>' +
      '<div class="ramas"><div class="rama"><span>Si no quedan fronteras</span><div class="caja verde"><b>Fin de la exploración</b><small>así terminaron 5 de 6 corridas</small></div></div>' +
      '<div class="rama"><span>Si todas están tachadas</span><div class="caja ambar"><b>Vaciar la lista y volver a intentar</b><small>17 veces en las corridas válidas, 11 en la iteración 1</small></div></div></div>' +
      '<h4 class="vsub">Cómo entra un punto a la lista</h4>' +
      '<div class="entradas"><div class="caja"><b>10 s sin acercarse</b><small>falla real, bien tachada</small></div>' +
      '<div class="caja ambar"><b>Nav2 responde abortada</b><small>también cuando fue reemplazada por la siguiente meta</small></div>' +
      '<div class="caja punteada"><b>Nav2 responde cancelada</b><small>no se anota</small></div></div>' +
      '<div class="embudo"><div class="flecha-b"></div><div class="caja rojo ancha"><b>Lista negra</b><small>tacha el punto y sus alrededores, a menos de 5 celdas. Rojas en RViz.</small></div></div>' +
      '<div class="mejora"><b>La mejora, trabajo futuro 5.</b> Cancelar la meta antes de enviar la siguiente. Los reemplazos llegarían como canceladas y la lista solo recibiría fallas reales.</div>';
  };

  /* Cobertura. Arriba, un ejemplo ilustrativo con el mismo mapa en una imagen que se agranda;
     abajo, los valores de la Tabla 5.4. */
  V.cobertura = function (el) {
    var LIBRES = 24, margen = 3;
    function grilla(cols, filas, libre, ocup, etiqueta) {
      var T = 20, s = '<svg class="vsvg mini-grid" style="max-width:' + cols * 26 + 'px" viewBox="0 0 ' + cols * T + ' ' + filas * T + '" role="img" aria-label="' + U.esc(etiqueta) + '">';
      for (var y = 0; y < filas; y++) for (var x = 0; x < cols; x++) {
        var c = libre(x, y) ? 'f-verde-s' : (ocup(x, y) ? 'f-obst' : 'f-desc');
        s += '<rect x="' + (x * T + .5) + '" y="' + (y * T + .5) + '" width="' + (T - 1) + '" height="' + (T - 1) + '" rx="2" class="' + c + '"/>';
      }
      return s + '</svg>';
    }
    /* El mismo contenido en ambas imágenes: 24 celdas libres y una ocupada. Solo cambia el margen desconocido. */
    var libre = function (x, y) { return x < 6 && y < 4; }, ocupada = function (x, y) { return y === 4 && x === 5; };
    function conteo(cols) { var total = cols * 5, desc = total - LIBRES - 1; return { desc: desc, indice: LIBRES / (LIBRES + desc) }; }
    var base = conteo(6);
    var it = window.PROYECTO.ensayos.mapeo.filter(function (r) { return r.valida === "si"; }).map(function (r) { return [String(r.iteracion), r.cobertura_libre_pct, r.area_libre_m2]; });
    function barras(idx, max, fmt, unidad) {
      return '<div class="hbars">' + it.map(function (r) {
        return '<div class="hb"><span>It. ' + r[0] + '</span><i style="--w:' + (r[idx] / max * 100).toFixed(1) + '%"></i><b class="num">' + fmt(r[idx]) + unidad + '</b></div>';
      }).join("") + '</div>';
    }
    el.innerHTML =
      '<div class="formula"><span>índice</span><span class="eq">=</span><span class="frac"><span>libres</span><span>libres + desconocidas</span></span><small>Las celdas ocupadas no cuentan. Ec. 5.4.</small></div>' +
      '<h4 class="vsub">Ejemplo ilustrativo: el mismo mapa en dos imágenes</h4>' +
      '<div class="dos-pan"><figure><figcaption><b>Imagen ajustada al mapa</b><span>24 libres, 1 ocupada y ' + base.desc + ' desconocidas</span></figcaption>' + grilla(6, 5, libre, ocupada, "24 libres, 1 ocupada y " + base.desc + " desconocidas") + '<p class="vnota big num">' + U.fmt(base.indice * 100, 1) + ' %</p></figure>' +
      '<figure><figcaption><b>Imagen con margen</b><span data-o="desc-txt"></span></figcaption><div data-o="grilla"></div><p class="vnota big num" data-o="indice"></p></figure></div>' +
      '<label class="desl-linea" for="cob-margen">Columnas desconocidas agregadas a la imagen <b class="num" data-o="margen"></b><input id="cob-margen" type="range" min="0" max="6" step="1" value="3"></label>' +
      '<div class="vley"><span><i class="cu verde-s"></i>libre</span><span><i class="cu desc"></i>desconocida</span><span><i class="cu obst"></i>ocupada</span></div>' +
      '<p class="control-conclusion" data-o="cob-txt" aria-live="polite"></p>' +
      '<h4 class="vsub">Las cinco corridas válidas, Tabla 5.4 de la tesis</h4>' +
      '<div class="dos-pan"><div><span class="eyebrow">Índice de cobertura libre</span>' + barras(1, 100, function (v) { return U.fmt(v, 1); }, " %") + '</div>' +
      '<div><span class="eyebrow">Área libre mapeada</span>' + barras(2, 4, function (v) { return U.fmt(v, 2); }, " m²") + '</div></div>' +
      '<p class="vnota">El índice salta de 53 a 83 %, pero el área libre queda casi fija. La iteración 2 no tiene mapa. Las barras de cada columna parten de cero.</p>';
    function pintar() {
      var cols = 6 + margen, c = conteo(cols);
      el.querySelector('[data-o="grilla"]').innerHTML = grilla(cols, 5, libre, ocupada, "24 libres, 1 ocupada y " + c.desc + " desconocidas");
      el.querySelector('[data-o="desc-txt"]').textContent = "las mismas 24 libres y 1 ocupada, con " + c.desc + " desconocidas";
      el.querySelector('[data-o="indice"]').textContent = U.fmt(c.indice * 100, 1) + " %";
      el.querySelector('[data-o="margen"]').textContent = margen + (margen === 1 ? " columna" : " columnas");
      el.querySelector('[data-o="cob-txt"]').textContent = "Índice = 24 / (24 + " + c.desc + ") = " + U.fmt(c.indice * 100, 1) + " %. Área libre = 24 × 0,0025 m² = 0,06 m² en ambas imágenes: agrandar la imagen cambia el índice, no el espacio libre.";
    }
    el.addEventListener("input", function (e) { if (e.target.id !== "cob-margen") return; margen = +e.target.value; pintar(); });
    pintar();
  };

  /* Alcance de la navegación */
  V.alcance = function (el) {
    el.innerHTML =
      '<div class="dos-pan"><div class="lista-ico"><span class="eyebrow">Lo que se evaluó</span>' +
      '<p>' + OK + 'Navegar hacia destinos que genera el explorador</p>' +
      '<p>' + OK + 'Cadena completa en el robot real, del láser al motor</p>' +
      '<p>' + OK + '5 de 6 corridas terminaron solas, sin fronteras</p></div>' +
      '<div class="lista-ico"><span class="eyebrow">Lo que exigiría medir con metas fijas</span>' +
      '<p>' + NO + 'Metas definidas y referencias físicas medidas en el recinto</p>' +
      '<p>' + NO + 'Una localización coherente en el marco del mapa, con SLAM mientras mapea o con AMCL sobre un mapa guardado</p>' +
      '<p>' + NO + 'Registrar aparte la pose final y, por meta, el resultado, el error de posición, el tiempo y el largo recorrido</p>' +
      '<p>' + NO + 'El script preparado tiene 3 escenarios con 5 repeticiones, pero no mide el error final, sus metas solo existen en el mundo simulado y no tiene registros</p></div></div>' +
      '<h4 class="vsub">Cómo quedan los objetivos específicos</h4>' +
      '<ul class="oes">' +
      '<li class="ok"><b>OE1</b><span>Construcción y gemelo digital</span><em>Cumplido</em></li>' +
      '<li class="par"><b>OE2</b><span>Control de bajo nivel. Estabilidad verificada sobre un modelo lineal y desempeño medido en un solo punto</span><em>Parcial</em></li>' +
      '<li class="par"><b>OE3</b><span>Localización, mapeo y navegación. Sin indicador cuantitativo de navegación</span><em>Parcial</em></li>' +
      '<li class="ok"><b>OE4</b><span>Exploración autónoma por fronteras</span><em>Cumplido</em></li></ul>';
  };
})();
