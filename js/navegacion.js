/* Navegación: A estrella y alcance de la navegación */
(function () {
  "use strict";
  var V = window.VISUALES, U = window.U;

  /* A estrella frente a Dijkstra, paso a paso.
     La búsqueda se calcula una vez y se guarda cada paso: la celda que se revisa, su g, su h,
     el camino que la alcanzó y las celdas pendientes. Así se puede avanzar, retroceder y reproducir. */
  var AS = { C: 24, R: 13, A: [3, 6], B: [20, 6], muro: {} };
  for (var my = 2; my < 11; my++) AS.muro[12 + "," + my] = 1;
  /* h cuenta las cuadras hasta la meta como si no hubiera muros. esc es una rejilla editada por el lector,
     con su propio inicio A, meta B y muros; sin ella vale el ejemplo. */
  AS.h = function (x, y, B) { B = B || AS.B; return Math.abs(x - B[0]) + Math.abs(y - B[1]); };
  AS.buscar = function (conH, esc) {
    esc = esc || AS;
    var C = AS.C, R = AS.R, A = esc.A, B = esc.B, muro = esc.muro;
    var g = {}, padre = {}, cerrado = {}, abiertos = [], pasos = [];
    function hk(k) { if (!conH) return 0; var p = k.split(","); return AS.h(+p[0], +p[1], B); }
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
          var h = conH ? AS.h(nx, ny, B) : 0;
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
    var C = AS.C, R = AS.R, T = 16;
    var NOMBRE = { d: "Dijkstra", a: "A estrella" }, INICIO = 30;
    /* esc es la rejilla que se muestra: el ejemplo o la que editó el lector */
    function ejemplo() { var m = {}; Object.keys(AS.muro).forEach(function (k) { m[k] = 1; }); return { A: AS.A.slice(), B: AS.B.slice(), muro: m }; }
    var esc = ejemplo(), editada = false;
    function calcular() { return { d: AS.buscar(false, esc), a: AS.buscar(true, esc) }; }
    var res = calcular();
    var st = { alg: "a", k: INICIO, modo: "muro", cur: esc.A.slice() }, uid = "as" + Math.random().toString(36).slice(2, 7), anim = 0, tUlt = 0, acum = 0;
    var MODOS = { muro: "Muros", robot: "Robot", meta: "Meta" };
    var s = '<svg class="vsvg as-rejilla" viewBox="0 0 ' + C * T + ' ' + R * T + '" role="group" tabindex="0" aria-labelledby="' + uid + '-t" aria-describedby="' + uid + '-ed"><title id="' + uid + '-t">Rejilla de búsqueda</title>';
    for (var yy = 0; yy < R; yy++) for (var xx = 0; xx < C; xx++) {
      s += '<rect data-c="' + xx + ',' + yy + '" x="' + (xx * T + .5) + '" y="' + (yy * T + .5) + '" width="' + (T - 1) + '" height="' + (T - 1) + '" rx="2" class="f-celda"/>';
    }
    s += '<path class="as-h k-ambar" fill="none" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round" d=""/>';
    s += '<path class="as-g k-azul" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d=""/>';
    s += '<path class="as-camino k-azul" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d=""/>';
    s += '<g class="as-robot">' + U.robot.celda(0, 0, T) + '</g><rect class="f-rojo as-meta" x="2" y="2" width="' + (T - 4) + '" height="' + (T - 4) + '" rx="2"/>';
    s += '<rect class="as-cursor" x="0" y="0" width="' + T + '" height="' + T + '" rx="3" fill="none"/></svg>';
    el.innerHTML =
      '<div class="vctl"><div class="segmento" role="group" aria-label="Algoritmo"><button type="button" data-alg="d" aria-pressed="false">Dijkstra</button><button type="button" data-alg="a" aria-pressed="true">A estrella</button></div>' +
      '<button type="button" class="vbtn" data-a="play" aria-pressed="false">Reproducir</button><button type="button" class="vbtn sec" data-a="paso">Un paso</button><button type="button" class="vbtn sec" data-a="fin">Ver el final</button><button type="button" class="vbtn sec" data-a="cero">Desde el inicio</button></div>' +
      '<div class="vctl as-edicion"><span class="as-edicion-t" id="' + uid + '-m">Edita la rejilla:</span><div class="segmento" role="group" aria-labelledby="' + uid + '-m">' +
      Object.keys(MODOS).map(function (m) { return '<button type="button" data-modo="' + m + '" aria-pressed="' + (m === st.modo) + '">' + MODOS[m] + '</button>'; }).join("") +
      '</div><button type="button" class="vbtn sec" data-a="ejemplo" disabled>Volver al ejemplo</button></div>' +
      '<label class="desl-linea" for="' + uid + '-k">Celdas revisadas<b class="num" data-o="k"></b><input id="' + uid + '-k" type="range" min="0" step="1" data-k="k"></label>' +
      s +
      '<p class="vnota as-ayuda" id="' + uid + '-ed">Con Muros, haz clic o arrastra sobre las celdas para levantar o derribar muros. Con Robot o Meta, toca la celda donde lo quieres, o arrastra el robot o la meta. Con el teclado, las flechas mueven el marco dentro de la rejilla y Enter o la barra espaciadora aplican lo elegido.</p>' +
      '<div class="vley"><span>' + (window.U && window.U.robot ? window.U.robot.icono("verde") : '<i class="pt verde"></i>') + 'robot</span><span><i class="cu rojo"></i>meta</span><span><i class="cu obst"></i>muro</span><span><i class="cu as-rev"></i>revisada</span><span><i class="cu as-pend"></i>pendiente, en la cola</span><span><i class="cu azul"></i>la que revisa ahora</span>' +
      '<span><i class="lin azul"></i>g, el camino que la alcanzó</span><span><i class="lin" style="background:repeating-linear-gradient(90deg,var(--ambar) 0 5px,transparent 5px 9px)"></i>h, lo que estima que falta</span></div>' +
      '<div class="as-cuenta"><div><span>g, lo ya recorrido</span><b class="num" data-o="g"></b><small>pasos desde el robot</small></div><div><span>h, lo que estima que falta</span><b class="num" data-o="h"></b><small data-o="h-s"></small></div><div><span>f = g + h</span><b class="num" data-o="f"></b><small>se revisa primero la menor</small></div><div><span>Pendientes en la cola</span><b class="num" data-o="pend"></b><small>celdas por revisar</small></div></div>' +
      '<p class="vestado" aria-live="polite" data-o="msg"></p>' +
      '<div class="as-cuenta"><div><span>Dijkstra revisa</span><b class="num" data-o="cmp-d"></b><small data-o="cmp-d-s"></small></div><div><span>A estrella revisa</span><b class="num" data-o="cmp-a"></b><small data-o="cmp-a-s"></small></div><div><span>Largo de la ruta</span><b class="num" data-o="cmp-l"></b><small data-o="cmp-l-s"></small></div></div>' +
      '<p class="vnota">Grilla de ejemplo con 4 vecinos y cada paso de costo 1. La h cuenta las cuadras hasta la meta como si no hubiera obstáculos, por eso la línea discontinua puede cruzar el muro. Así nunca estima más de lo que falta, una h admisible, y A estrella encuentra la ruta más corta. Si dos celdas empatan en f, se revisa primero la de menor h.</p>';
    var svg = el.querySelector(".as-rejilla"), rects = {}; el.querySelectorAll("rect[data-c]").forEach(function (r) { rects[r.getAttribute("data-c")] = r; });
    var pg = el.querySelector(".as-g"), ph = el.querySelector(".as-h"), pc = el.querySelector(".as-camino"), rango = el.querySelector("input[data-k]"), estado = el.querySelector('[data-o="msg"]');
    var gRobot = el.querySelector(".as-robot"), rMeta = el.querySelector(".as-meta"), rCur = el.querySelector(".as-cursor"), bEjemplo = el.querySelector('[data-a="ejemplo"]');
    var bPlay = el.querySelector('[data-a="play"]'), aviso = "";
    function o(k) { return el.querySelector('[data-o="' + k + '"]'); }
    function d(pts) { return pts.length ? "M" + pts.map(function (p) { return (p[0] * T + T / 2) + " " + (p[1] * T + T / 2); }).join(" L") : ""; }
    function hA() { return AS.h(esc.A[0], esc.A[1], esc.B); }
    function comparar() {
      var lleg = res.a.llego && res.d.llego;
      o("cmp-d").textContent = res.d.pasos.length; o("cmp-a").textContent = res.a.pasos.length;
      o("cmp-d-s").textContent = lleg ? "celdas hasta la meta" : "celdas, sin llegar"; o("cmp-a-s").textContent = lleg ? "celdas hasta la meta" : "celdas, sin llegar";
      o("cmp-l").textContent = lleg ? res.a.camino.length - 1 : "sin ruta"; o("cmp-l-s").textContent = lleg ? "pasos, igual en las dos" : "la meta no se alcanza";
    }
    function dibujar() {
      var r = res[st.alg], n = r.pasos.length, k = Math.max(0, Math.min(n, st.k)), act = k ? r.pasos[k - 1] : null, fin = k === n;
      var clase = {};
      for (var i = 0; i < k; i++) clase[r.pasos[i].x + "," + r.pasos[i].y] = "as-rev";
      (act ? act.pend : [esc.A.join(",")]).forEach(function (q) { if (!clase[q]) clase[q] = "as-pend"; });
      if (act && !fin) clase[act.x + "," + act.y] = "as-act";
      Object.keys(rects).forEach(function (q) { rects[q].setAttribute("class", esc.muro[q] ? "f-obst" : (clase[q] || "f-celda")); });
      gRobot.setAttribute("transform", "translate(" + (esc.A[0] * T + T / 2) + " " + (esc.A[1] * T + T / 2) + ")");
      rMeta.setAttribute("x", esc.B[0] * T + 2); rMeta.setAttribute("y", esc.B[1] * T + 2);
      rCur.setAttribute("x", st.cur[0] * T); rCur.setAttribute("y", st.cur[1] * T);
      pc.setAttribute("d", fin && r.llego ? d(r.camino) : "");
      pg.setAttribute("d", act && !fin ? d(act.camino) : "");
      ph.setAttribute("d", act && !fin && st.alg === "a" ? d([[act.x, act.y], [esc.B[0], act.y], esc.B]) : "");
      o("k").textContent = k + " de " + n;
      o("g").textContent = act ? act.g : "0";
      o("h").textContent = st.alg === "a" ? (act ? act.h : hA()) : "0";
      o("h-s").textContent = st.alg === "a" ? "cuadras hasta la meta" : "Dijkstra no estima";
      o("f").textContent = act ? act.f : (st.alg === "a" ? hA() : 0);
      o("pend").textContent = act ? act.pend.length : 1;
      var msg, otro = st.alg === "d" ? res.a : res.d;
      if (!k) msg = "Todavía no revisa ninguna celda. En la cola solo está la del robot, con g = 0.";
      else if (fin && !r.llego) msg = NOMBRE[st.alg] + " revisó las " + n + " celdas que puede alcanzar y no llegó a la meta: los muros la separan del robot. Abre un hueco en el muro o mueve la meta.";
      else if (fin) msg = NOMBRE[st.alg] + " llegó a la meta después de revisar " + n + " celdas. La ruta tiene " + (r.camino.length - 1) + " pasos." + (st.alg === "d" ? " A estrella encuentra una igual de corta revisando " + otro.pasos.length + "." : " Dijkstra necesita revisar " + otro.pasos.length + " para encontrar una igual de corta.");
      else if (st.alg === "a") {
        msg = "Paso " + k + ". Revisa la celda marcada: llegar hasta ella costó g = " + act.g + " pasos y h estima " + act.h + " más hasta la meta, así que f = " + act.f + ". Tenía la menor f entre " + act.pendAntes + (act.pendAntes === 1 ? " celda pendiente" : " celdas pendientes") + (act.empates ? ", empatada con otras " + act.empates + "; entre ellas se elige la de menor h." : ".");
        msg = msg.replace("; entre ellas", ". Entre ellas");
        if (act.f > hA()) msg += " Como los muros cortan el camino directo, ya no quedan pendientes con f = " + hA() + ", la estimación desde el robot, y la búsqueda pasa a caminos más largos.";
      } else msg = "Paso " + k + ". Revisa la celda marcada, a g = " + act.g + " pasos del robot. Sin estimación, revisa primero las más cercanas al robot en todas las direcciones, aunque se alejen de la meta.";
      estado.textContent = (aviso ? aviso + " " : "") + msg; aviso = "";
      rango.max = n; if (document.activeElement !== rango) rango.value = k;
      U.marcar(el, "data-alg", st.alg);
      U.marcar(el, "data-modo", st.modo);
      bEjemplo.disabled = !editada;
      el.querySelector("title").textContent = "Búsqueda con " + NOMBRE[st.alg] + ", " + k + " de " + n + " celdas revisadas" + (fin ? (r.llego ? ", con la ruta encontrada." : ", sin ruta hasta la meta.") : ".");
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
    /* Edición. Cada cambio recalcula las dos búsquedas y muestra el final, con la ruta nueva y sus cifras. */
    function clave(c) { return c[0] + "," + c[1]; }
    function igual(a, b) { return a[0] === b[0] && a[1] === b[1]; }
    function recalcular(texto) {
      parar(); editada = true; res = calcular(); st.k = res[st.alg].pasos.length; aviso = texto; comparar(); dibujar(); marcar();
    }
    /* devuelve true si la celda cambió algo */
    function aplicar(c, modo, valor) {
      if (modo === "robot" || modo === "meta") {
        var cual = modo === "robot" ? "A" : "B", otra = modo === "robot" ? esc.B : esc.A;
        if (esc.muro[clave(c)] || igual(c, otra) || igual(c, esc[cual])) return false;
        esc[cual] = c.slice(); recalcular(modo === "robot" ? "Moviste el robot." : "Moviste la meta."); return true;
      }
      if (igual(c, esc.A) || igual(c, esc.B)) return false;
      var hay = !!esc.muro[clave(c)], quiere = valor == null ? !hay : valor;
      if (hay === quiere) return false;
      if (quiere) esc.muro[clave(c)] = 1; else delete esc.muro[clave(c)];
      recalcular(quiere ? "Levantaste un muro." : "Derribaste un muro.");
      return true;
    }
    function celda(e) {
      var r = svg.getBoundingClientRect();
      var cx = Math.floor((e.clientX - r.left) / r.width * C), cy = Math.floor((e.clientY - r.top) / r.height * R);
      return cx < 0 || cy < 0 || cx >= C || cy >= R ? null : [cx, cy];
    }
    /* Con ratón o lápiz se arrastra: el robot, la meta o una pasada de muros. Con el dedo, tocar una celda aplica
       el modo elegido y deslizar sigue desplazando la página. */
    var arrastre = null;
    svg.addEventListener("pointerdown", function (e) {
      if (e.button) return;
      var c = celda(e); if (!c) return;
      var que = igual(c, esc.A) ? "robot" : igual(c, esc.B) ? "meta" : st.modo;
      if (e.pointerType === "touch") { arrastre = { toque: true, c: c, que: que }; return; }
      e.preventDefault();
      arrastre = { que: que, valor: que === "muro" ? !esc.muro[clave(c)] : null, ult: c };
      if (svg.setPointerCapture) try { svg.setPointerCapture(e.pointerId); } catch (x) {}
      st.cur = c.slice();
      if (que === "muro") aplicar(c, "muro", arrastre.valor);
      else if (!igual(c, que === "robot" ? esc.A : esc.B)) aplicar(c, que);
      else dibujar();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!arrastre || arrastre.toque) return;
      var c = celda(e); if (!c || igual(c, arrastre.ult)) return;
      arrastre.ult = c; st.cur = c.slice();
      aplicar(c, arrastre.que, arrastre.valor);
    });
    function soltar(e) {
      if (arrastre && arrastre.toque && e.type === "pointerup") {
        var c = celda(e);
        if (c && igual(c, arrastre.c)) { st.cur = c.slice(); if (!aplicar(c, st.modo)) dibujar(); }
      }
      arrastre = null;
    }
    svg.addEventListener("pointerup", soltar); svg.addEventListener("pointercancel", soltar);
    svg.addEventListener("keydown", function (e) {
      var mov = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (mov) {
        e.preventDefault();
        st.cur = [Math.max(0, Math.min(C - 1, st.cur[0] + mov[0])), Math.max(0, Math.min(R - 1, st.cur[1] + mov[1]))];
        dibujar(); return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!aplicar(st.cur.slice(), st.modo)) { aviso = st.modo === "muro" ? "En esa celda está el robot o la meta." : "Esa celda está ocupada."; dibujar(); }
      }
    });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-alg]");
      if (b) { parar(); st.alg = b.getAttribute("data-alg"); st.k = 0; dibujar(); marcar(); return; }
      var m = e.target.closest("[data-modo]");
      if (m) { st.modo = m.getAttribute("data-modo"); dibujar(); return; }
      var a = e.target.closest("[data-a]"); if (!a) return;
      var k = a.getAttribute("data-a"), n = res[st.alg].pasos.length;
      if (k === "play") { reproducir(); return; }
      parar();
      if (k === "ejemplo") { esc = ejemplo(); editada = false; res = calcular(); st.k = INICIO; st.cur = esc.A.slice(); aviso = "Volviste a la rejilla del ejemplo."; comparar(); dibujar(); marcar(); return; }
      if (k === "paso") st.k = Math.min(n, st.k + 1);
      if (k === "fin") st.k = n;
      if (k === "cero") st.k = 0;
      dibujar(); marcar();
    });
    rango.addEventListener("input", function () { parar(); st.k = +rango.value; dibujar(); marcar(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) parar(); });
    U.alCambiarMovimiento(function (reducido) { if (reducido) parar(); });
    comparar(); dibujar(); marcar();
    el.estadoAstar = function () { var r = res[st.alg], act = st.k ? r.pasos[st.k - 1] : null; return { alg: st.alg, k: st.k, n: r.pasos.length, g: act && act.g, h: act && act.h, f: act && act.f, pend: act ? act.pend.length : 1, activo: !!anim, camino: el.querySelector(".as-camino").getAttribute("d") !== "", llego: r.llego, A: esc.A.slice(), B: esc.B.slice(), muros: Object.keys(esc.muro).length, modo: st.modo, cur: st.cur.slice(), editada: editada }; };
  };

  /* Alcance de la navegación */
  V.alcance = function (el) {
    var OK = U.ICO.OK, NO = U.ICO.NO;
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
