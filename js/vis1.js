/* Diagramas de marco teórico, navegación y exploración */
(function () {
  "use strict";
  var V = window.VISUALES, U = window.U;
  var OK = '<svg class="ico ok" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5"/><path d="M4.5 8.3l2.3 2.3 4.7-5"/></svg>';
  var NO = '<svg class="ico no" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5"/><path d="M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6"/></svg>';
  V.ICO = { OK: OK, NO: NO };

  /* Grafo de poses y cierre de lazo */
  V.lazo = function (el) {
    var N = 16, d = 60, eps = 1.3 * Math.PI / 180, esc = 1.0, X0 = 70, Y0 = 80;
    var rumbo = [];
    [[0, 5], [90, 3], [180, 5], [270, 3]].forEach(function (s) { for (var i = 0; i < s[1]; i++) rumbo.push(s[0] * Math.PI / 180); });
    var real = [[X0, Y0]], der = [[X0, Y0]];
    var xr = X0, yr = Y0, xd = X0, yd = Y0;
    for (var i = 0; i < N; i++) {
      xr += d * Math.cos(rumbo[i]); yr += d * Math.sin(rumbo[i]); real.push([xr, yr]);
      var h = rumbo[i] + (i + 1) * eps;
      xd += d * esc * Math.cos(h); yd += d * esc * Math.sin(h); der.push([xd, yd]);
    }
    var cor = der.map(function (p, k) { return [real[k][0] + 0.12 * (p[0] - real[k][0]) * (1 - k / N), real[k][1] + 0.12 * (p[1] - real[k][1]) * (1 - k / N)]; });
    var s = '<svg class="vsvg acotado" viewBox="0 0 430 330" role="img" aria-label="Grafo de poses con y sin cierre de lazo">';
    s += '<path class="k-muted" fill="none" stroke-dasharray="4 5" stroke-width="1.5" d="M' + real.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L') + '"/>';
    s += '<g class="lz-aristas"></g><line class="lz-cierre k-verde" stroke-width="2.5" stroke-dasharray="6 4" opacity="0"/>';
    s += '<g class="lz-nodos"></g>';
    s += '<text class="t-s" x="52" y="74" text-anchor="end">inicio</text>';
    s += '</svg>';
    el.innerHTML =
      '<div class="vctl"><button type="button" class="vbtn" data-a="cerrar">Cerrar el lazo</button><button type="button" class="vbtn sec" data-a="abrir">Ver la deriva</button><span class="vestado" aria-live="polite"></span></div>' + s +
      '<div class="vley"><span><i class="lin-disc"></i>recorrido real</span><span><i class="pt azul"></i>poses estimadas</span><span><i class="lin verde"></i>restricción de cierre de lazo</span></div>' +
      '<div class="cadena" aria-label="Cadena de marcos de referencia">' +
      '<div class="eslabon"><b>map</b></div><div class="union"><span>slam_toolbox</span><small>corrige la deriva</small></div>' +
      '<div class="eslabon"><b>odom</b></div><div class="union"><span>controlador diferencial</span><small>odometría de encoders</small></div>' +
      '<div class="eslabon"><b>base_link</b></div><div class="union"><span>fija</span><small>sale del URDF</small></div>' +
      '<div class="eslabon"><b>laser_frame</b></div></div>' +
      '<p class="vnota">Ejemplo ilustrativo. La corrección de map a odom es la que absorbe el sesgo de los encoders, por eso no llega al mapa.</p>';
    var gA = el.querySelector(".lz-aristas"), gN = el.querySelector(".lz-nodos"), cierre = el.querySelector(".lz-cierre"), estado = el.querySelector(".vestado");
    var t = 0, parar = null;
    function dibujar(k) {
      var p = der.map(function (a, i) { return [a[0] + (cor[i][0] - a[0]) * k, a[1] + (cor[i][1] - a[1]) * k]; });
      var a = "", n = "";
      for (var i = 0; i < N; i++) a += '<line class="k-azul" stroke-width="2" x1="' + p[i][0].toFixed(1) + '" y1="' + p[i][1].toFixed(1) + '" x2="' + p[i + 1][0].toFixed(1) + '" y2="' + p[i + 1][1].toFixed(1) + '"/>';
      for (var j = 0; j <= N; j++) n += '<circle class="' + (j === 0 ? 'f-verde' : 'f-azul') + '" r="' + (j === 0 || j === N ? 6 : 4.5) + '" cx="' + p[j][0].toFixed(1) + '" cy="' + p[j][1].toFixed(1) + '"/>';
      gA.innerHTML = a; gN.innerHTML = n;
      cierre.setAttribute("x1", p[N][0]); cierre.setAttribute("y1", p[N][1]); cierre.setAttribute("x2", p[0][0]); cierre.setAttribute("y2", p[0][1]);
      cierre.setAttribute("opacity", k > 0 ? 1 : 0);
      t = k;
    }
    function ir(meta) {
      if (parar) parar();
      var desde = t;
      estado.textContent = meta ? "El robot vuelve a ver el inicio y el error se reparte en todo el recorrido." : "Sin cierre de lazo, la última pose queda lejos del inicio.";
      parar = U.animar(900, function (k) { dibujar(desde + (meta - desde) * U.suave(k)); });
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return;
      ir(b.getAttribute("data-a") === "cerrar" ? 1 : 0);
    });
    dibujar(0);
    estado.textContent = "Sin cierre de lazo, la última pose queda lejos del inicio.";
  };

  /* A estrella frente a Dijkstra */
  V.astar = function (el) {
    var C = 24, R = 13, T = 16;
    var muro = {};
    for (var y = 2; y < 11; y++) muro[12 + "," + y] = 1;
    var A = [3, 6], B = [20, 6];
    function buscar(conH) {
      var g = {}, padre = {}, cerrado = {}, abiertos = [], orden = [];
      var k0 = A.join(",");
      g[k0] = 0; abiertos.push({ k: k0, x: A[0], y: A[1], f: 0, h: 0 });
      while (abiertos.length) {
        abiertos.sort(function (a, b) { return a.f - b.f || a.h - b.h; });
        var c = abiertos.shift();
        if (cerrado[c.k]) continue;
        cerrado[c.k] = 1; orden.push([c.x, c.y]);
        if (c.x === B[0] && c.y === B[1]) break;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (dd) {
          var nx = c.x + dd[0], ny = c.y + dd[1], nk = nx + "," + ny;
          if (nx < 0 || ny < 0 || nx >= C || ny >= R || muro[nk] || cerrado[nk]) return;
          var ng = g[c.k] + 1;
          if (g[nk] == null || ng < g[nk]) {
            g[nk] = ng; padre[nk] = c.k;
            var h = conH ? Math.abs(nx - B[0]) + Math.abs(ny - B[1]) : 0;
            abiertos.push({ k: nk, x: nx, y: ny, f: ng + h, h: h });
          }
        });
      }
      var camino = [], k = B.join(",");
      while (k) { var p = k.split(","); camino.unshift([+p[0], +p[1]]); k = padre[k]; }
      return { orden: orden, camino: camino };
    }
    var res = { d: buscar(false), a: buscar(true) };
    var s = '<svg class="vsvg" viewBox="0 0 ' + C * T + ' ' + R * T + '" role="img" aria-label="Celdas revisadas por Dijkstra y por A estrella">';
    for (var yy = 0; yy < R; yy++) for (var xx = 0; xx < C; xx++) {
      var m = muro[xx + "," + yy];
      s += '<rect data-c="' + xx + ',' + yy + '" x="' + (xx * T + .5) + '" y="' + (yy * T + .5) + '" width="' + (T - 1) + '" height="' + (T - 1) + '" rx="2" class="' + (m ? 'f-obst' : 'f-celda') + '"/>';
    }
    s += '<path class="as-camino k-azul" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d=""/>';
    s += '<circle class="f-verde" cx="' + (A[0] * T + T / 2) + '" cy="' + (A[1] * T + T / 2) + '" r="6"/><rect class="f-rojo" x="' + (B[0] * T + 2) + '" y="' + (B[1] * T + 2) + '" width="' + (T - 4) + '" height="' + (T - 4) + '" rx="2"/></svg>';
    el.innerHTML = '<div class="vctl"><button type="button" class="vbtn" data-a="d">Buscar con Dijkstra</button><button type="button" class="vbtn" data-a="a">Buscar con A estrella</button></div>' + s +
      '<div class="as-cuenta"><div><span>Dijkstra revisó</span><b class="num" data-n="d">' + res.d.orden.length + '</b><small>celdas</small></div><div><span>A estrella revisó</span><b class="num" data-n="a">' + res.a.orden.length + '</b><small>celdas</small></div><div><span>Largo de la ruta</span><b class="num">' + (res.a.camino.length - 1) + '</b><small>pasos, igual en las dos</small></div></div>' +
      '<div class="vley"><span><i class="pt verde"></i>robot</span><span><i class="cu rojo"></i>meta</span><span><i class="cu obst"></i>obstáculo</span><span><i class="cu azul-s"></i>celda revisada</span><span><i class="lin azul"></i>ruta</span></div>' +
      '<p class="vnota">Grilla de ejemplo con 4 vecinos. La h es la distancia en cuadras hasta la meta, que nunca estima más de lo que falta, así que es admisible.</p>';
    var rects = {}; el.querySelectorAll("rect[data-c]").forEach(function (r) { rects[r.getAttribute("data-c")] = r; });
    var camino = el.querySelector(".as-camino"), parar = null;
    function limpiar() {
      Object.keys(rects).forEach(function (k) { if (!muro[k]) rects[k].setAttribute("class", "f-celda"); });
      camino.setAttribute("d", "");
    }
    function correr(cual) {
      if (parar) parar();
      limpiar();
      var r = res[cual], n = r.orden.length, hechos = 0;
      el.querySelectorAll("[data-a]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-a") === cual ? "true" : "false"); });
      parar = U.animar(Math.min(2600, 9 * n), function (k) {
        var hasta = Math.round(k * n);
        for (var i = hechos; i < hasta; i++) rects[r.orden[i].join(",")].setAttribute("class", "f-azul-s");
        hechos = hasta;
      }, function () {
        camino.setAttribute("d", "M" + r.camino.map(function (p) { return (p[0] * T + T / 2) + " " + (p[1] * T + T / 2); }).join(" L"));
      });
    }
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (b) correr(b.getAttribute("data-a")); });
    /* estado inicial completo: muestra la búsqueda de A estrella ya hecha */
    res.a.orden.forEach(function (p) { rects[p.join(",")].setAttribute("class", "f-azul-s"); });
    camino.setAttribute("d", "M" + res.a.camino.map(function (p) { return (p[0] * T + T / 2) + " " + (p[1] * T + T / 2); }).join(" L"));
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

  /* Trejos y slam_toolbox */
  V.trejos = function (el) {
    el.innerHTML =
      '<div class="tj">' +
      '<div class="caja ancha"><span class="eyebrow">Lo que comparó Trejos, 2022</span><small>Simulación en Gazebo con un TurtleBot 3 Burger simulado</small>' +
      '<div class="algos"><span>Cartographer<small>mayor uso medio de CPU</small></span><span>GMapping</span><span>Hector</span><span class="gana">Karto<small>mejor opción global</small></span><span>RTAB Map</span></div></div>' +
      '<div class="flujo"><div class="caja verde"><b>Karto</b><small>la mejor opción global de Trejos</small></div><div class="flecha-d" aria-hidden="true"></div>' +
      '<div class="caja"><b>Open Karto</b><small>la base de Karto</small></div><div class="flecha-d" aria-hidden="true"></div>' +
      '<div class="caja azul"><b>slam_toolbox</b><small>se construye sobre Open Karto, según Macenski y Jambrecic. Trejos no lo evaluó.</small></div><div class="flecha-d" aria-hidden="true"></div>' +
      '<div class="caja"><b>El computador del proyecto</b><small>Intel Core i7 de clase portátil. CPU no medida.</small></div></div>' +
      '</div>' +
      '<div class="comparar tres"><div><b>GMapping</b><span>No detecta cierres de lazo y su paso a ROS 2 es más débil.</span></div><div><b>Hector SLAM</b><span>Exige un láser de alta tasa de barrido para contener la deriva.</span></div><div><b>Cartographer</b><span>Configuración compleja y el de mayor uso de CPU en Trejos.</span></div></div>' +
      '<p class="vnota">Las otras alternativas, tal como las compara la Tabla 1.2 de la tesis.</p>';
  };

  /* Reemplazo de metas */
  V.metas = function (el) {
    el.innerHTML = '<div class="vctl"><button type="button" class="vbtn" data-a="play">Reproducir 20 segundos</button><span class="vestado" aria-live="polite"></span></div><div class="mt-graf"></div>' +
      '<div class="vley"><span><i class="cu azul"></i>meta activa</span><span><i class="x-rojo"></i>Nav2 la cierra como abortada</span><span><i class="lin-disc"></i>el explorador vuelve a elegir</span></div>' +
      '<h4 class="vsub">Las 60 metas de las cinco corridas</h4><div class="waffle" role="img" aria-label="60 metas: 1 completada, 53 abortadas por reemplazo, 1 abortada sin clasificar y 5 con otro estado"></div>' +
      '<div class="vley"><span><i class="cu verde"></i>1 completada</span><span><i class="cu azul"></i>53 abortadas por reemplazo</span><span><i class="cu obst"></i>1 abortada sin clasificar</span><span><i class="cu gris"></i>5 ni completadas ni abortadas</span></div>' +
      '<p class="vnota">El tiempo mediano que cada meta estuvo activa fue 3,3 s, igual al período del explorador. Línea de tiempo de ejemplo con ese período.</p>';
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
            if (k === 0 && !chico) s += '<text class="t-m" x="' + (cx + 9) + '" y="' + (cy + 4) + '">abortada, aunque el robot no falló</text>';
          }
        }
      }
      s += '<line class="k-ink" stroke-width="2" x1="' + x(Tact) + '" x2="' + x(Tact) + '" y1="' + (mt - 10) + '" y2="' + (H - 24) + '"/>';
      cont.innerHTML = s + '</svg>';
      estado.textContent = "Enviadas " + env + ". Abortadas por reemplazo " + abo + ".";
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

  /* Cobertura */
  V.cobertura = function (el) {
    function grilla(cols, filas, libre, ocup, etiqueta) {
      var T = 20, s = '<svg class="vsvg mini-grid" style="max-width:' + cols * 26 + 'px" viewBox="0 0 ' + cols * T + ' ' + filas * T + '" role="img" aria-label="' + U.esc(etiqueta) + '">';
      for (var y = 0; y < filas; y++) for (var x = 0; x < cols; x++) {
        var c = libre(x, y) ? 'f-verde-s' : (ocup(x, y) ? 'f-obst' : 'f-desc');
        s += '<rect x="' + (x * T + .5) + '" y="' + (y * T + .5) + '" width="' + (T - 1) + '" height="' + (T - 1) + '" rx="2" class="' + c + '"/>';
      }
      return s + '</svg>';
    }
    var libre = function (x, y) { return x < 6 && y < 4; };
    var a = grilla(6, 5, libre, function (x, y) { return y === 4 && x === 5; }, "24 libres y 5 desconocidas");
    var b = grilla(9, 5, libre, function () { return false; }, "24 libres y 21 desconocidas");
    var it = [["1", 82.9, 3.510], ["3", 53.5, 3.540], ["4", 54.2, 3.478], ["5", 67.1, 3.483], ["6", 53.4, 3.478]];
    function barras(idx, max, fmt, unidad) {
      return '<div class="hbars">' + it.map(function (r) {
        return '<div class="hb"><span>It. ' + r[0] + '</span><i style="--w:' + (r[idx] / max * 100).toFixed(1) + '%"></i><b class="num">' + fmt(r[idx]) + unidad + '</b></div>';
      }).join("") + '</div>';
    }
    el.innerHTML =
      '<div class="formula"><span>índice</span><span class="eq">=</span><span class="frac"><span>libres</span><span>libres + desconocidas</span></span><small>Las celdas ocupadas no cuentan. Ec. 5.4.</small></div>' +
      '<div class="dos-pan"><figure><figcaption><b>Imagen chica</b><span>24 libres y 5 desconocidas</span></figcaption>' + a + '<p class="vnota big num">83 %</p></figure>' +
      '<figure><figcaption><b>Imagen grande</b><span>las mismas 24 libres y 21 desconocidas</span></figcaption>' + b + '<p class="vnota big num">53 %</p></figure></div>' +
      '<div class="vley"><span><i class="cu verde-s"></i>libre</span><span><i class="cu desc"></i>desconocida</span><span><i class="cu obst"></i>ocupada</span></div>' +
      '<h4 class="vsub">Las cinco corridas válidas, Tabla 5.4 de la tesis</h4>' +
      '<div class="dos-pan"><div><span class="eyebrow">Índice de cobertura libre</span>' + barras(1, 100, function (v) { return U.fmt(v, 1); }, " %") + '</div>' +
      '<div><span class="eyebrow">Área libre mapeada</span>' + barras(2, 4, function (v) { return U.fmt(v, 2); }, " m²") + '</div></div>' +
      '<p class="vnota">El índice salta de 53 a 83 %, pero el área libre queda casi fija. La iteración 2 no tiene mapa.</p>';
  };

  /* Alcance de la navegación */
  V.alcance = function (el) {
    el.innerHTML =
      '<div class="dos-pan"><div class="lista-ico"><span class="eyebrow">Lo que se evaluó</span>' +
      '<p>' + OK + 'Navegar hacia destinos que genera el explorador</p>' +
      '<p>' + OK + 'Cadena completa en el robot real, del láser al motor</p>' +
      '<p>' + OK + '5 de 6 corridas terminaron solas, sin fronteras</p></div>' +
      '<div class="lista-ico"><span class="eyebrow">Lo que exige medir con metas fijas</span>' +
      '<p>' + NO + 'Un mapa guardado</p>' +
      '<p>' + NO + 'AMCL activo y ajustado. Está con valores por defecto, sin ejecutar</p>' +
      '<p>' + NO + 'Puntos medidos en el recinto</p>' +
      '<p>' + NO + 'Script preparado, sin registros y sin error de posición final</p></div></div>' +
      '<h4 class="vsub">Cómo quedan los objetivos específicos</h4>' +
      '<ul class="oes">' +
      '<li class="ok"><b>OE1</b><span>Construcción y gemelo digital</span><em>Cumplido</em></li>' +
      '<li class="par"><b>OE2</b><span>Control de bajo nivel. Pedía un PID y opera como PI, evaluado en un solo punto</span><em>Parcial</em></li>' +
      '<li class="par"><b>OE3</b><span>Localización, mapeo y navegación. Sin indicador cuantitativo de navegación</span><em>Parcial</em></li>' +
      '<li class="ok"><b>OE4</b><span>Exploración autónoma por fronteras</span><em>Cumplido</em></li></ul>';
  };
})();
