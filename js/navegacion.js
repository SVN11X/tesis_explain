/* Navegación: A estrella, alcance, inflación con la huella del robot y ventana dinámica */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  var rgba = U.rgba, paleta = U.paleta, lienzo = U.lienzo, alTema = U.alTema, limitar = U.limitar;

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

  /* Geometría de la huella, usada por el simulador de inflación */
  /* ¿Se superponen un polígono convexo y un rectángulo alineado con los ejes?
     Prueba de ejes separadores: hay contacto si en ningún eje queda un hueco mayor que eps.
     El contacto en un borde o en una esquina, con hueco cero, cuenta como contacto. */
  function poligonoTocaRect(poly, x0, y0, x1, y1, eps) {
    if (eps == null) eps = 1e-9;
    var rect = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    var ejes = [[1, 0], [0, 1]];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length], ex = b[0] - a[0], ey = b[1] - a[1], n = Math.hypot(ex, ey);
      if (n > 0) ejes.push([-ey / n, ex / n]);
    }
    for (var k = 0; k < ejes.length; k++) {
      var ax = ejes[k][0], ay = ejes[k][1], pmin = Infinity, pmax = -Infinity, rmin = Infinity, rmax = -Infinity;
      poly.forEach(function (p) { var d = p[0] * ax + p[1] * ay; if (d < pmin) pmin = d; if (d > pmax) pmax = d; });
      rect.forEach(function (p) { var d = p[0] * ax + p[1] * ay; if (d < rmin) rmin = d; if (d > rmax) rmax = d; });
      if (pmax < rmin - eps || rmax < pmin - eps) return false;
    }
    return true;
  }
  function huellaEnMundo(huella, x, y, angGrados) {
    var a = angGrados * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return huella.map(function (p) { return [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c]; });
  }
  /* celdas de una rejilla de C por F, de lado res, que la huella toca */
  function celdasTocadas(poly, C, F, res) {
    var xs = poly.map(function (p) { return p[0]; }), ys = poly.map(function (p) { return p[1]; });
    var cx0 = Math.max(0, Math.floor(Math.min.apply(null, xs) / res) - 1), cx1 = Math.min(C - 1, Math.floor(Math.max.apply(null, xs) / res) + 1);
    var cy0 = Math.max(0, Math.floor(Math.min.apply(null, ys) / res) - 1), cy1 = Math.min(F - 1, Math.floor(Math.max.apply(null, ys) / res) + 1);
    var out = [];
    for (var y = cy0; y <= cy1; y++) for (var x = cx0; x <= cx1; x++) {
      if (poligonoTocaRect(poly, x * res, y * res, (x + 1) * res, (y + 1) * res)) out.push(y * C + x);
    }
    return out;
  }
  /* Separa los tres conceptos: contacto físico con celdas ocupadas, entrada al margen inflado
     y costo de la celda bajo el centro. ocup es la rejilla de obstáculos reales y costoDe(i) el costo de cada celda. */
  function evaluarHuella(poly, centro, C, F, res, ocup, costoDe) {
    var toc = celdasTocadas(poly, C, F, res), fisicas = [], margen = [], inscritas = 0;
    toc.forEach(function (i) {
      if (ocup[i]) fisicas.push(i);
      else { var c = costoDe(i); if (c > 0) { margen.push(i); if (c >= 253) inscritas++; } }
    });
    var ci = U.limitar(Math.floor(centro[1] / res), 0, F - 1) * C + U.limitar(Math.floor(centro[0] / res), 0, C - 1);
    return { fisico: fisicas.length > 0, celdasFisicas: fisicas, margen: margen.length > 0, celdasMargen: margen, inscritas: inscritas, costoCentro: costoDe(ci), celdaCentro: ci };
  }

  /* 7. Inflación y huella del robot */
  V.inflacion = function (el) {
    var P = paleta(), RES = 0.05, Wm = 1.6, Hm = 0.9, C = Math.round(Wm / RES), F = Math.round(Hm / RES);
    var st = { infl: 0.15, ang: 57, x: 0.45, y: 0.61 }, BETA = 5.0, INSC = 0.08;
    var LIM = { x: [0.1, Wm - 0.1], y: [0.1, Hm - 0.1] };
    var HUELLA = [[0.20, 0.13], [-0.08, 0.13], [-0.08, -0.13], [0.20, -0.13]];
    var ocup = new Uint8Array(C * F);
    for (var x = 0; x < C; x++) { ocup[x] = 1; ocup[(F - 1) * C + x] = 1; }
    for (var y = 0; y < 6; y++) for (var xx = 18; xx < 21; xx++) ocup[(F - 1 - y) * C + xx] = 1;   /* esquina de un mueble */
    var uid = "in" + Math.random().toString(36).slice(2, 7);
    el.innerHTML = '<div class="deslizadores">' +
      '<label for="' + uid + '-r">Radio de inflación<b class="num" data-v="infl"></b><input id="' + uid + '-r" type="range" min="0.05" max="0.55" step="0.01" data-k="infl"></label>' +
      '<label for="' + uid + '-a">Ángulo del robot<b class="num" data-v="ang"></b><input id="' + uid + '-a" type="range" min="0" max="90" step="1" data-k="ang"></label>' +
      '<label for="' + uid + '-x">Posición a lo largo del pasillo, x<b class="num" data-v="x"></b><input id="' + uid + '-x" type="range" min="' + LIM.x[0] + '" max="' + LIM.x[1] + '" step="0.01" data-k="x"></label>' +
      '<label for="' + uid + '-y">Posición a lo ancho del pasillo, y<b class="num" data-v="y"></b><input id="' + uid + '-y" type="range" min="' + LIM.y[0] + '" max="' + LIM.y[1] + '" step="0.01" data-k="y"></label></div>' +
      '<div class="chips" role="group" aria-label="Valores del radio de inflación"><button type="button" class="chip" data-r="0.15" aria-pressed="true">0,15 m, el robot real</button><button type="button" class="chip" data-r="0.24" aria-pressed="false">0,24 m, alcance de la esquina</button><button type="button" class="chip" data-r="0.55" aria-pressed="false">0,55 m, valor por defecto de Nav2</button></div>' +
      '<div class="in-l"></div>' +
      '<div class="lecturas"><div><span>¿Contacto físico con un obstáculo?</span><b data-o="fis"></b></div><div><span>¿La huella entra en el margen inflado?</span><b data-o="mar"></b></div><div><span>Costo bajo el centro</span><b data-o="cc"></b></div><div><span>Radio inscrito</span><b>0,08 m</b></div><div><span>Radio circunscrito</span><b>0,24 m</b></div></div>' +
      '<div class="vley"><span><i class="cu" style="background:var(--ink)"></i>obstáculo real, costo 254</span><span><i class="cu" style="background:var(--violeta)"></i>radio inscrito, 253</span><span><i class="cu" style="background:var(--violeta);opacity:.35"></i>inflación, el costo decae con la distancia</span><span><i class="cu sup"></i>costo 0</span><span><i class="cu" style="background:none;border:2px solid var(--rojo)"></i>celda ocupada que la huella toca</span></div>' +
      '<p class="vestado" aria-live="polite" data-o="msg"></p>' +
      '<p class="vnota" id="' + uid + '-ayuda">Celdas de 5 cm y factor de decaimiento 5,0, como en el robot. La huella es el rectángulo configurado en Nav2. El contacto físico se calcula entre el contorno de la huella y el área completa de cada celda ocupada, incluidos bordes y esquinas. El margen inflado es una zona de seguridad del mapa de costos, no un obstáculo. Mueve el robot con los deslizadores, arrastrándolo, o con las flechas del teclado cuando el dibujo tiene el foco. Con Mayúsculas y las flechas izquierda y derecha cambia el ángulo.</p>';
    var cont = el.querySelector(".in-l"), L = lienzo(cont, Wm / Hm, function () { dibujar(); });
    L.cv.classList.add("arrastrable"); L.cv.tabIndex = 0; L.cv.setAttribute("role", "img");
    L.cv.setAttribute("aria-describedby", uid + "-ayuda");
    alTema(function () { P = paleta(); dibujar(); });
    var dist = new Float32Array(C * F);
    function distancias() {
      for (var i = 0; i < C * F; i++) {
        var x = i % C, y = (i / C) | 0, m = 1e9;
        for (var j = 0; j < C * F; j++) if (ocup[j]) { var dx = (j % C) - x, dy = ((j / C) | 0) - y, d = dx * dx + dy * dy; if (d < m) m = d; }
        dist[i] = Math.sqrt(m) * RES;
      }
    }
    function costo(d) {
      if (d <= 1e-9) return 254;
      if (d <= INSC) return 253;
      if (d <= st.infl) return Math.round(252 * Math.exp(-BETA * (d - INSC)));
      return 0;
    }
    function costoCelda(i) { return ocup[i] ? 254 : costo(dist[i]); }
    function evaluar() { return evaluarHuella(huellaEnMundo(HUELLA, st.x, st.y, st.ang), [st.x, st.y], C, F, RES, ocup, costoCelda); }
    function dibujar() {
      var ctx = L.ctx, W = L.w, H = L.h, s = Math.min(W / C, H / F), ox = (W - C * s) / 2, oy = (H - F * s) / 2;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      var poly = huellaEnMundo(HUELLA, st.x, st.y, st.ang), ev = evaluar();
      for (var i = 0; i < C * F; i++) {
        var x = i % C, y = (i / C) | 0, cst = costoCelda(i), px = ox + x * s, py = oy + y * s;
        if (cst === 254) ctx.fillStyle = P.ink;
        else if (cst === 253) ctx.fillStyle = P.violeta;
        else if (cst > 0) ctx.fillStyle = rgba(P.violeta, 0.12 + 0.5 * cst / 252);
        else ctx.fillStyle = P.sup;
        ctx.fillRect(px, py, s + .5, s + .5);
      }
      ctx.strokeStyle = P.linea; ctx.lineWidth = .5;
      for (var gx = 0; gx <= C; gx++) { ctx.beginPath(); ctx.moveTo(ox + gx * s, oy); ctx.lineTo(ox + gx * s, oy + F * s); ctx.stroke(); }
      for (var gy = 0; gy <= F; gy++) { ctx.beginPath(); ctx.moveTo(ox, oy + gy * s); ctx.lineTo(ox + C * s, oy + gy * s); ctx.stroke(); }
      /* celdas ocupadas que la huella toca */
      ctx.strokeStyle = P.rojo; ctx.lineWidth = 2;
      ev.celdasFisicas.forEach(function (i) { ctx.strokeRect(ox + (i % C) * s + 1, oy + ((i / C) | 0) * s + 1, s - 2, s - 2); });
      var colHuella = ev.fisico ? P.rojo : (ev.margen ? P.ambar : P.azul);
      ctx.fillStyle = rgba(P.azul, .25); ctx.strokeStyle = colHuella; ctx.lineWidth = 2.5;
      if (ev.margen && !ev.fisico) ctx.setLineDash([6, 3]);
      ctx.beginPath(); poly.forEach(function (p, k) { var X = ox + p[0] / RES * s, Y = oy + p[1] / RES * s; if (k) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.setLineDash([4, 4]); ctx.strokeStyle = P.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ox + st.x / RES * s, oy + st.y / RES * s, 0.24 / RES * s, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      var cx = ox + st.x / RES * s, cy = oy + st.y / RES * s;
      ctx.fillStyle = P.sup; ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      var o = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
      var cc = ev.costoCentro;
      o("cc").textContent = cc;
      o("fis").textContent = ev.fisico ? "sí, " + ev.celdasFisicas.length + (ev.celdasFisicas.length === 1 ? " celda" : " celdas") : "no";
      o("fis").style.color = ev.fisico ? "var(--rojo)" : "var(--verde-texto)";
      o("mar").textContent = ev.margen ? (ev.inscritas ? "sí, hasta 253" : "sí") : "no";
      o("mar").style.color = ev.margen ? "var(--ambar)" : "var(--verde-texto)";
      var msg;
      if (ev.fisico) msg = "Contacto físico: el contorno de la huella se superpone con " + ev.celdasFisicas.length + (ev.celdasFisicas.length === 1 ? " celda ocupada" : " celdas ocupadas") + ", marcadas en rojo. " + (cc < 253 ? "Aun así, el centro está en una celda de costo " + cc + ". Un criterio que mira solo el centro no lo detectaría." : "El centro también está en zona prohibida.");
      else if (ev.margen) msg = "Sin contacto físico. La huella entra en el margen inflado" + (ev.inscritas ? ", incluidas celdas de costo 253," : "") + " que es una zona de seguridad del mapa de costos, no un obstáculo. El centro está en una celda de costo " + cc + ".";
      else msg = cc > 0 ? "Sin contacto físico y sin entrar al margen con la huella. El centro paga un costo " + cc + " por estar cerca de un obstáculo." : "Ni el centro ni la huella tocan obstáculos ni el margen inflado.";
      o("msg").textContent = msg;
      L.cv.setAttribute("aria-label", "Mapa de costos visto desde arriba. Robot en x " + U.fmt(st.x, 2) + " m, y " + U.fmt(st.y, 2) + " m, ángulo " + st.ang + " grados. " + msg);
      el.querySelectorAll("[data-v]").forEach(function (b) { var k = b.getAttribute("data-v"); b.textContent = k === "ang" ? st.ang + "°" : U.fmt(st[k], 2) + " m"; });
      el.querySelectorAll("input[data-k]").forEach(function (inp) { if (document.activeElement !== inp) inp.value = st[inp.getAttribute("data-k")]; });
    }
    function mover(e) {
      var r = L.cv.getBoundingClientRect(), W = L.w, H = L.h, s = Math.min(W / C, H / F), ox = (W - C * s) / 2, oy = (H - F * s) / 2;
      var kx = W / Math.max(1, r.width), ky = H / Math.max(1, r.height);
      st.x = Math.round(limitar(((e.clientX - r.left) * kx - ox) / s * RES, LIM.x[0], LIM.x[1]) * 100) / 100;
      st.y = Math.round(limitar(((e.clientY - r.top) * ky - oy) / s * RES, LIM.y[0], LIM.y[1]) * 100) / 100;
      dibujar();
    }
    var arr = false;
    L.cv.addEventListener("pointerdown", function (e) { arr = true; try { L.cv.setPointerCapture(e.pointerId); } catch (er) {} mover(e); });
    L.cv.addEventListener("pointermove", function (e) { if (arr) mover(e); });
    L.cv.addEventListener("pointerup", function () { arr = false; });
    L.cv.addEventListener("pointercancel", function () { arr = false; });
    L.cv.addEventListener("keydown", function (e) {
      var paso = e.altKey ? 0.05 : 0.01;
      if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { e.preventDefault(); st.ang = limitar(st.ang + (e.key === "ArrowRight" ? 1 : -1), 0, 90); dibujar(); return; }
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
      e.preventDefault();
      st.x = Math.round(limitar(st.x + d[0] * paso, LIM.x[0], LIM.x[1]) * 100) / 100;
      st.y = Math.round(limitar(st.y + d[1] * paso, LIM.y[0], LIM.y[1]) * 100) / 100;
      dibujar();
    });
    el.addEventListener("input", function (e) { var k = e.target.getAttribute("data-k"); if (!k) return; st[k] = parseFloat(e.target.value); if (k === "infl") el.querySelectorAll("[data-r]").forEach(function (x) { x.setAttribute("aria-pressed", String(Math.abs(parseFloat(x.getAttribute("data-r")) - st.infl) < 1e-9)); }); dibujar(); });
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-r]"); if (!b) return; st.infl = parseFloat(b.getAttribute("data-r")); U.marcar(el, "data-r", b.getAttribute("data-r")); dibujar(); });
    distancias(); dibujar();
    el.estadoSim = function () { var ev = evaluar(); return { st: { x: st.x, y: st.y, ang: st.ang, infl: st.infl }, fisico: ev.fisico, margen: ev.margen, inscritas: ev.inscritas, costoCentro: ev.costoCentro, celdasFisicas: ev.celdasFisicas.length }; };
    el.fijarSim = function (o) { Object.keys(o).forEach(function (k) { st[k] = o[k]; }); dibujar(); };
  };

  /* 8. Ventana dinámica (DWB) */
  V.dwb = function (el) {
    var P = paleta(), Wm = 2.0, Hm = 1.4, SIMT = 1.7, VMAX = 0.15, WMAX = 0.35;
    var D_INFL = 0.35, D_CHOQUE = 0.12;   /* parámetros de esta demostración, no de la configuración real */
    var ESCENAS = { cerca: { x: 0.72, y: 0.72 }, lejos: { x: 0.95, y: 0.62 } };
    var obs = { x: ESCENAS.cerca.x, y: ESCENAS.cerca.y, r: 0.1 }, rob = { x: 0.25, y: 1.05, th: -0.55 };
    var st = { ruta: 32, meta: 24, obst: 20 };
    var ruta = []; for (var k = 0; k <= 40; k++) { var tt = k / 40; ruta.push([0.25 + 1.55 * tt, 1.05 - 0.75 * Math.sin(tt * Math.PI / 2)]); }
    var uid = "dw" + Math.random().toString(36).slice(2, 7);
    el.innerHTML = '<div class="chips" role="group" aria-label="Escenarios del obstáculo"><button type="button" class="chip" data-e="cerca" aria-pressed="true">Obstáculo junto a la ruta</button><button type="button" class="chip" data-e="lejos" aria-pressed="false">Obstáculo fuera del alcance de las candidatas</button></div>' +
      '<div class="deslizadores">' +
      '<label for="' + uid + '-r">Peso de seguir la ruta<b class="num" data-v="ruta"></b><input id="' + uid + '-r" type="range" min="0" max="64" step="1" data-k="ruta"></label>' +
      '<label for="' + uid + '-m">Peso de acercarse a la meta<b class="num" data-v="meta"></b><input id="' + uid + '-m" type="range" min="0" max="64" step="1" data-k="meta"></label>' +
      '<label for="' + uid + '-o">Peso de alejarse de obstáculos<b class="num" data-v="obst"></b><input id="' + uid + '-o" type="range" min="0" max="64" step="1" data-k="obst"></label>' +
      '<label for="' + uid + '-ox">Obstáculo, posición x<b class="num" data-v="ox"></b><input id="' + uid + '-ox" type="range" min="0.1" max="' + (Wm - 0.1) + '" step="0.01" data-o-k="x"></label>' +
      '<label for="' + uid + '-oy">Obstáculo, posición y<b class="num" data-v="oy"></b><input id="' + uid + '-oy" type="range" min="0.1" max="' + (Hm - 0.1) + '" step="0.01" data-o-k="y"></label></div>' +
      '<div class="dw-l"></div><div class="dw-z"></div>' +
      '<div class="vley"><span><i class="lin" style="background:var(--ruta)"></i>ruta global</span><span><i class="cu huella"></i>huella del robot configurada en Nav2, con su centro de giro</span><span><i class="lin azul"></i>trayectoria elegida</span><span><i class="lin" style="background:var(--line-2)"></i>candidatas, más marcadas cuanto mejor es su puntaje</span><span><i class="lin rojo"></i>descartadas por chocar</span><span><i class="cu" style="background:none;border:1px dashed var(--muted);border-radius:50%"></i>zona donde el obstáculo penaliza</span></div>' +
      '<div class="tabla-env"><table class="tabla dw-tabla"><caption>Puntaje de la trayectoria elegida, menor es mejor. Cada término es peso por medida.</caption><thead><tr><th>Criterio</th><th class="n">Medida</th><th class="n">Peso</th><th class="n">Aporte</th></tr></thead><tbody data-o="tabla"></tbody></table></div>' +
      '<p class="vestado" aria-live="polite" data-o="msg"></p>' +
      '<p class="vnota" id="' + uid + '-ayuda">Ilustrativo. Se prueban 7 velocidades lineales entre 0 y 0,15 m/s y 15 de giro entre ±0,35 rad/s, los límites que DWB tiene configurados en el robot real. Aquí cada candidata se proyecta 1,7 s hacia adelante para que el dibujo se lea, la configuración del robot real usa 3,5 s. Los pesos, la zona de 0,35 m donde el obstáculo penaliza y el margen de choque de 0,12 m son propios de esta demostración y no equivalen a las escalas de los críticos del robot real. El obstáculo aparece después de planificar la ruta global, por eso la ruta lo atraviesa. Muévelo con los deslizadores, arrastrándolo o con las flechas del teclado cuando el dibujo tiene el foco.</p>';
    var cont = el.querySelector(".dw-l"), L = lienzo(cont, Wm / Hm, function () { dibujar(); });
    L.cv.classList.add("arrastrable"); L.cv.tabIndex = 0; L.cv.setAttribute("role", "img"); L.cv.setAttribute("aria-describedby", uid + "-ayuda");
    /* Las candidatas ocupan unos 26 cm y en la escena completa se ven diminutas en un teléfono: una segunda vista
       muestra 50 cm de ancho alrededor del robot. */
    var ANCHO_ZOOM = 0.5, LZ = lienzo(el.querySelector(".dw-z"), 1.8, function () { dibujar(); });
    LZ.cv.setAttribute("role", "img"); LZ.cv.setAttribute("aria-label", "Vista ampliada alrededor del robot: las trayectorias candidatas, las descartadas y la elegida");
    alTema(function () { P = paleta(); dibujar(); });
    function evaluarCandidatas() {
      var out = [];
      for (var i = 0; i < 7; i++) for (var j = 0; j < 15; j++) {
        var v = VMAX * i / 6, w = -WMAX + 2 * WMAX * j / 14, x = rob.x, y = rob.y, th = rob.th, pts = [[x, y]], choca = false, dmin = 9;
        for (var t = 0; t < SIMT; t += 0.05) {
          th += w * 0.05; x += v * Math.cos(th) * 0.05; y += v * Math.sin(th) * 0.05; pts.push([x, y]);
          var d = Math.hypot(x - obs.x, y - obs.y) - obs.r; dmin = Math.min(dmin, d); if (d < D_CHOQUE) choca = true;
        }
        var dr = 9; ruta.forEach(function (p) { dr = Math.min(dr, Math.hypot(p[0] - x, p[1] - y)); });
        var meta = ruta[ruta.length - 1], dm = Math.hypot(meta[0] - x, meta[1] - y);
        var cObs = dmin < D_INFL ? (D_INFL - dmin) * 3 : 0;
        var partes = { ruta: st.ruta * dr, meta: st.meta * dm * 0.5, obst: st.obst * cObs };
        out.push({ v: v, w: w, pts: pts, choca: choca, dmin: dmin, dr: dr, dm: dm, cObs: cObs, partes: partes, s: partes.ruta + partes.meta + partes.obst });
      }
      return out;
    }
    /* Dibuja en el lienzo Lz con k píxeles por metro y el punto (x0, y0) del mundo en la esquina superior izquierda.
       e trae las candidatas ya evaluadas. Con rótulo es la vista ampliada, que además lleva su escala. */
    function escena(Lz, k, x0, y0, e, rotulo) {
      var ctx = Lz.ctx, W = Lz.w, H = Lz.h, ampliada = !!rotulo, paso = ampliada ? .05 : .1;
      function X(x) { return (x - x0) * k; } function Y(y) { return (y - y0) * k; }
      function trazo(pts) { ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.stroke(); }
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.linea; ctx.lineWidth = 1;
      for (var gx = Math.ceil(x0 / paso - 1e-9) * paso; X(gx) <= W + .5; gx += paso) { ctx.beginPath(); ctx.moveTo(X(gx), 0); ctx.lineTo(X(gx), H); ctx.stroke(); }
      for (var gy = Math.ceil(y0 / paso - 1e-9) * paso; Y(gy) <= H + .5; gy += paso) { ctx.beginPath(); ctx.moveTo(0, Y(gy)); ctx.lineTo(W, Y(gy)); ctx.stroke(); }
      ctx.strokeStyle = P.ruta; ctx.lineWidth = 3; trazo(ruta);
      /* zona de influencia del obstáculo en esta demostración */
      ctx.setLineDash([4, 4]); ctx.strokeStyle = P.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(obs.x), Y(obs.y), (obs.r + D_INFL) * k, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      var rObs = obs.r * k;
      ctx.fillStyle = P.obst; ctx.beginPath(); ctx.arc(X(obs.x), Y(obs.y), rObs, 0, Math.PI * 2); ctx.fill();
      ctx.font = "700 11px Atkinson Hyperlegible, sans-serif"; ctx.textAlign = "center";
      /* en un teléfono el círculo es más angosto que la palabra: entonces va debajo, en el color del texto */
      if (ctx.measureText("obstáculo").width <= 2 * rObs - 6) { ctx.fillStyle = P.sup; ctx.fillText("obstáculo", X(obs.x), Y(obs.y) + 4); }
      else { ctx.fillStyle = P.ink; ctx.fillText("obstáculo", X(obs.x), Y(obs.y) + rObs + 13); }
      ctx.textAlign = "start";
      /* La huella y el rumbo van debajo de las trayectorias: la huella mide 0,28 m y las candidatas avanzan a lo
         más 0,26 m desde el centro de giro, así que dibujadas encima las tapaban casi enteras. */
      var ala = ampliada ? 0.02 * k : 6;
      ctx.save(); ctx.translate(X(rob.x), Y(rob.y)); ctx.rotate(rob.th);
      ctx.fillStyle = rgba(P.azul, .12); ctx.strokeStyle = rgba(P.azul, .7); ctx.lineWidth = 1.5;
      ctx.fillRect(-0.08 * k, -0.13 * k, 0.28 * k, 0.26 * k); ctx.strokeRect(-0.08 * k, -0.13 * k, 0.28 * k, 0.26 * k);
      ctx.fillStyle = ampliada ? rgba(P.verdeV, .45) : P.verdeV; ctx.beginPath(); ctx.moveTo(0.24 * k, 0); ctx.lineTo(0.16 * k, -ala); ctx.lineTo(0.16 * k, ala); ctx.fill();
      ctx.restore();
      e.cs.forEach(function (c) {
        if (c === e.mejor) return;
        if (c.choca) { ctx.strokeStyle = rgba(P.rojo, .45); ctx.lineWidth = 1; ctx.setLineDash([3, 3]); }
        else { var q = 1 - (c.s - e.mn) / Math.max(1e-9, e.mx - e.mn); ctx.strokeStyle = rgba(P.ink, 0.08 + 0.45 * q * q); ctx.lineWidth = ampliada ? 1.6 : 1.2; ctx.setLineDash([]); }
        trazo(c.pts);
      });
      ctx.setLineDash([]);
      if (e.mejor) { ctx.lineCap = "round"; ctx.strokeStyle = P.sup; ctx.lineWidth = 7; trazo(e.mejor.pts); ctx.strokeStyle = P.azul; ctx.lineWidth = 4; trazo(e.mejor.pts); ctx.lineCap = "butt"; }
      ctx.fillStyle = P.sup; ctx.strokeStyle = P.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(rob.x), Y(rob.y), 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      var meta = ruta[ruta.length - 1]; ctx.fillStyle = P.rojo; ctx.beginPath(); ctx.arc(X(meta[0]), Y(meta[1]), 6, 0, Math.PI * 2); ctx.fill();
      if (ampliada) {
        var e10 = 0.1 * k;
        ctx.fillStyle = rgba(P.sup, .85); ctx.fillRect(6, 6, ctx.measureText(rotulo).width + 12, 20); ctx.fillRect(6, H - 30, e10 + 12, 24);
        ctx.fillStyle = P.ink; ctx.fillText(rotulo, 12, 20);
        ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, H - 12); ctx.lineTo(12 + e10, H - 12); ctx.stroke();
        ctx.font = "11px IBM Plex Mono, monospace"; ctx.fillText("10 cm", 12, H - 17);
      }
    }
    function dibujar() {
      var cs = evaluarCandidatas(), val = cs.filter(function (c) { return !c.choca; }), mn = Infinity, mx = -Infinity;
      val.forEach(function (c) { mn = Math.min(mn, c.s); mx = Math.max(mx, c.s); });
      var mejor = null; val.forEach(function (c) { if (!mejor || c.s < mejor.s) mejor = c; });
      var e = { cs: cs, mejor: mejor, mn: mn, mx: mx }, esc = Math.min(L.w / Wm, L.h / Hm), kz = LZ.w / ANCHO_ZOOM;
      escena(L, esc, 0, 0, e, "");
      /* la vista ampliada se centra 10 cm por delante del centro de giro, donde están las candidatas */
      var zx = rob.x + 0.1 * Math.cos(rob.th), zy = rob.y + 0.1 * Math.sin(rob.th), veces = kz / esc;
      escena(LZ, kz, zx - LZ.w / 2 / kz, zy - LZ.h / 2 / kz, e, "Vista ampliada " + (Math.abs(veces - Math.round(veces)) < .05 ? Math.round(veces) : U.fmt(veces, 1)) + " veces");
      /* lecturas */
      var dminTodas = Math.min.apply(null, cs.map(function (c) { return c.dmin; }));
      var influyen = cs.filter(function (c) { return !c.choca && c.cObs > 0; }).length;
      var msg;
      if (!mejor) msg = "Todas las candidatas chocan. Nav2 activaría una recuperación.";
      else {
        msg = "Elige " + U.fmt(mejor.v, 3) + " m/s y " + U.fmt(mejor.w, 2) + " rad/s. " + (cs.length - val.length) + " de " + cs.length + " candidatas quedan descartadas por chocar. ";
        if (dminTodas >= D_INFL) msg += "El obstáculo no aporta nada: ninguna candidata se acerca a menos de " + U.fmt(dminTodas, 2) + " m de su borde, y solo penaliza a menos de " + U.fmt(D_INFL, 2) + " m. En 1,7 s a 0,15 m/s el robot recorre como máximo " + U.fmt(VMAX * SIMT, 2) + " m, así que cambiar su peso no altera la elección.";
        else if (!influyen) msg += "Las candidatas que se acercan al obstáculo quedan descartadas por chocar. Las válidas no reciben penalización, así que su peso no cambia la elección.";
        else msg += influyen + " candidatas válidas pasan a menos de " + U.fmt(D_INFL, 2) + " m del obstáculo y pagan por ello. Con más peso, la elección tiende a alejarse del obstáculo o a frenar.";
      }
      el.querySelector('[data-o="msg"]').textContent = msg;
      L.cv.setAttribute("aria-label", "Trayectorias candidatas de la ventana dinámica. Obstáculo en x " + U.fmt(obs.x, 2) + " m, y " + U.fmt(obs.y, 2) + " m. " + msg);
      el.querySelector('[data-o="tabla"]').innerHTML = mejor ?
        '<tr><th>Distancia a la ruta al final</th><td class="n">' + U.fmt(mejor.dr, 3) + ' m</td><td class="n">' + st.ruta + '</td><td class="n">' + U.fmt(mejor.partes.ruta, 2) + '</td></tr>' +
        '<tr><th>Distancia a la meta al final, por 0,5</th><td class="n">' + U.fmt(mejor.dm, 3) + ' m</td><td class="n">' + st.meta + '</td><td class="n">' + U.fmt(mejor.partes.meta, 2) + '</td></tr>' +
        '<tr><th>Cercanía al obstáculo, ' + U.fmt(D_INFL, 2) + ' m menos la distancia mínima, por 3</th><td class="n">' + (mejor.cObs > 0 ? U.fmt(mejor.cObs, 3) : '0, a ' + U.fmt(mejor.dmin, 2) + ' m') + '</td><td class="n">' + st.obst + '</td><td class="n">' + U.fmt(mejor.partes.obst, 2) + '</td></tr>' +
        '<tr class="destacada"><th>Total</th><td></td><td></td><td class="n">' + U.fmt(mejor.s, 2) + '</td></tr>' : '<tr><td colspan="4">Sin trayectoria válida.</td></tr>';
      el.querySelectorAll("[data-v]").forEach(function (b) { var k = b.getAttribute("data-v"); b.textContent = k === "ox" ? U.fmt(obs.x, 2) + " m" : (k === "oy" ? U.fmt(obs.y, 2) + " m" : st[k]); });
      el.querySelectorAll("input[data-k]").forEach(function (i) { if (document.activeElement !== i) i.value = st[i.getAttribute("data-k")]; });
      el.querySelectorAll("input[data-o-k]").forEach(function (i) { if (document.activeElement !== i) i.value = obs[i.getAttribute("data-o-k")]; });
      return { mejor: mejor, dminTodas: dminTodas, influyen: influyen };
    }
    function marcarEscena() {
      el.querySelectorAll("[data-e]").forEach(function (b) { var e = ESCENAS[b.getAttribute("data-e")]; b.setAttribute("aria-pressed", String(Math.abs(e.x - obs.x) < 1e-6 && Math.abs(e.y - obs.y) < 1e-6)); });
    }
    var arr = false;
    function mover(e) {
      var r = L.cv.getBoundingClientRect(), esc = Math.min(L.w / Wm, L.h / Hm), kx = L.w / Math.max(1, r.width), ky = L.h / Math.max(1, r.height);
      obs.x = Math.round(limitar((e.clientX - r.left) * kx / esc, 0.1, Wm - 0.1) * 100) / 100; obs.y = Math.round(limitar((e.clientY - r.top) * ky / esc, 0.1, Hm - 0.1) * 100) / 100;
      marcarEscena(); dibujar();
    }
    L.cv.addEventListener("pointerdown", function (e) { arr = true; try { L.cv.setPointerCapture(e.pointerId); } catch (er) {} mover(e); });
    L.cv.addEventListener("pointermove", function (e) { if (arr) mover(e); });
    L.cv.addEventListener("pointerup", function () { arr = false; });
    L.cv.addEventListener("pointercancel", function () { arr = false; });
    L.cv.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
      e.preventDefault(); var paso = e.shiftKey ? 0.05 : 0.01;
      obs.x = Math.round(limitar(obs.x + d[0] * paso, 0.1, Wm - 0.1) * 100) / 100; obs.y = Math.round(limitar(obs.y + d[1] * paso, 0.1, Hm - 0.1) * 100) / 100;
      marcarEscena(); dibujar();
    });
    el.addEventListener("input", function (e) {
      var k = e.target.getAttribute("data-k"), ok = e.target.getAttribute("data-o-k");
      if (k) st[k] = parseFloat(e.target.value);
      else if (ok) { obs[ok] = parseFloat(e.target.value); marcarEscena(); }
      else return;
      dibujar();
    });
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-e]"); if (!b) return; var sc = ESCENAS[b.getAttribute("data-e")]; obs.x = sc.x; obs.y = sc.y; marcarEscena(); dibujar(); });
    dibujar();
    el.estadoSim = function () { var r = dibujar(); return { obs: { x: obs.x, y: obs.y }, pesos: { ruta: st.ruta, meta: st.meta, obst: st.obst }, v: r.mejor && r.mejor.v, w: r.mejor && r.mejor.w, puntaje: r.mejor && r.mejor.s, aporteObst: r.mejor && r.mejor.partes.obst, dminTodas: r.dminTodas, influyen: r.influyen }; };
    el.fijarSim = function (o) { if (o.obs) { obs.x = o.obs.x; obs.y = o.obs.y; } ["ruta", "meta", "obst"].forEach(function (k) { if (o[k] != null) st[k] = o[k]; }); marcarEscena(); dibujar(); };
  };

  window.NAVEGACION_PRUEBAS = { astar: AS, poligonoTocaRect: poligonoTocaRect, huellaEnMundo: huellaEnMundo, celdasTocadas: celdasTocadas, evaluarHuella: evaluarHuella };

  /* Reto de la sección «A estrella». Las cifras son las de la página: 111 y 291 celdas revisadas para una ruta de 27 pasos.
     Los datos viven aparte del DOM; la lógica de mostrar la respuesta es la de U.reto. */
  var RETO = [{
    pregunta: "En la grilla de ejemplo con un muro, ¿cuántas celdas revisa A estrella para encontrar la ruta de 27 pasos?",
    opciones: [
      { texto: "111, menos que las 291 de Dijkstra", ok: true, porque: "Dijkstra revisa 291 celdas y A estrella 111 para la misma ruta de 27 pasos." },
      { texto: "291, las mismas que Dijkstra", ok: false, porque: "291 es lo que revisa Dijkstra. A estrella revisa solo 111 para la misma ruta." },
      { texto: "27, solo las de la ruta", ok: false, porque: "Los 27 pasos son el largo de la ruta final. Para hallarla hay que revisar más celdas: 111 con A estrella y 291 con Dijkstra." }
    ],
    enlace: "#sim-astar", enlaceTexto: "A estrella frente a Dijkstra"
  }, {
    pregunta: "¿Por qué A estrella revisa menos celdas que Dijkstra?",
    opciones: [
      { texto: "Ordena por f = g + h y estima con h lo que falta hasta la meta", ok: true, porque: "Revisa primero la celda con menor f = g + h. Dijkstra no estima h y por eso se expande en todas direcciones." },
      { texto: "Encuentra una ruta más corta que Dijkstra", ok: false, porque: "Las dos encuentran la misma ruta de 27 pasos. Cambia cuántas celdas revisan, no el resultado." },
      { texto: "Ignora el muro y atraviesa las celdas ocupadas", ok: false, porque: "Ninguna atraviesa el muro. A estrella lo rodea igual, pero revisa primero las celdas que parecen más prometedoras." }
    ],
    enlace: "#astar", enlaceTexto: "A estrella: buscar la ruta"
  }];
  V["reto-navegacion"] = function (el) {
    U.reto(el, RETO, "nv-reto-", function (i, j) {
      var q = RETO[i], o = q && q.opciones[j];
      return o ? { ok: o.ok, porque: o.porque, enlace: q.enlace, enlaceTexto: q.enlaceTexto } : null;
    });
  };
})();
