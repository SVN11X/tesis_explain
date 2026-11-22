/* Exploración: simulación del plano, frontera, reemplazo de metas y lista negra */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  var css = U.css, rgba = U.rgba, paleta = U.paleta, lienzo = U.lienzo, alTema = U.alTema, limitar = U.limitar, bucle = U.bucle, alCambiarMovimiento = U.alCambiarMovimiento;

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
      s += U.robot.celda(2 * T + T / 2, 5 * T + T / 2, T) + '</svg>';
      return { svg: s, acept: acept, rech: rech };
    }
    var a = panel(fy, 5, "Fronteras según Yamauchi"), b = panel(fe, 1, "Fronteras según explore_lite");
    el.innerHTML = '<div class="dos-pan">' +
      '<figure><figcaption><b>Yamauchi</b><span>Celda libre junto a una desconocida. Solo regiones de tamaño parecido al del robot.</span></figcaption>' + a.svg +
      '<p class="vnota">' + a.acept + ' región aceptada, ' + a.rech + ' descartada por chica.</p></figure>' +
      '<figure><figcaption><b>explore_lite, configurado en este robot</b><span>Celda desconocida junto a una libre. Mínimo 0,05 m, basta una celda.</span></figcaption>' + b.svg +
      '<p class="vnota">' + b.acept + ' regiones aceptadas, incluida la celda suelta del medio.</p></figure></div>' +
      '<div class="vley"><span><i class="cu sup"></i>libre</span><span><i class="cu desc"></i>desconocida</span><span><i class="cu obst"></i>ocupada</span><span><i class="cu ambar"></i>frontera aceptada</span><span><i class="cu rech"></i>frontera descartada</span><span>' + (window.U && window.U.robot ? window.U.robot.icono("verde") : '<i class="pt verde"></i>') + 'robot</span></div>' +
      '<p class="vnota">Mapa de ejemplo. La celda suelta del medio representa una lectura de ruido del láser.</p>';
  };

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
    U.alAncho(cont, dibujar);
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

  /* Paso fijo con acumulador. Se acumula el tiempo real multiplicado por la velocidad
     y se ejecutan tantos pasos de duración h como quepan, guardando la fracción pendiente.
     Así 1×, 2× y 4× avanzan en proporción con cualquier frecuencia de pantalla.
     maxDt limita la recuperación después de una pausa larga o de volver a la pestaña. */
  function pasoFijo(h, maxDt) {
    var acc = 0;
    return {
      pasos: function (dt, vel) {
        if (!(dt > 0) || !(vel > 0)) return 0;
        acc += Math.min(dt, maxDt) * vel;
        var n = Math.floor(acc / h + 1e-9);
        acc -= n * h;
        if (acc < 0) acc = 0;
        return n;
      },
      reiniciar: function () { acc = 0; },
      get pendiente() { return acc; }
    };
  }

  /* 1. Exploración por fronteras */
  function crearExploracion() {
    var C = 72, F = 46;                       /* columnas y filas de la rejilla */
    var mundo = new Uint8Array(C * F);        /* 1 = pared real */
    function muro(x0, y0, x1, y1) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (x >= 0 && y >= 0 && x < C && y < F) mundo[y * C + x] = 1; }
    /* plano inspirado en el recinto de pruebas: perímetro y tabiques interiores */
    muro(0, 0, C - 1, 0); muro(0, F - 1, C - 1, F - 1); muro(0, 0, 0, F - 1); muro(C - 1, 0, C - 1, F - 1);
    muro(0, 16, 33, 16);          /* tabique largo desde la izquierda */
    muro(21, 1, 21, 9);           /* separación de la bahía superior */
    muro(27, 29, C - 1, 29);      /* tabique largo desde la derecha */
    muro(55, 6, 55, 18); muro(55, 6, 64, 6);   /* rincón en L arriba a la derecha */
    muro(44, 10, 46, 12);         /* pilar */
    muro(12, 33, 14, 35);         /* caja abajo a la izquierda */
    muro(40, 37, 40, F - 1);      /* tabique corto abajo */
    var INICIO = { x: 7.5, y: 40.5, th: -Math.PI / 2 };
    var RANGO = 13, RAYOS = 120, RADIO = 1.25, MIN_FRONT = 2;
    var conoc, robot, ruta, meta, metaFr, lista, rastro, t, tUlt, est, terminado, fin, eventos;
    var rayosFin = [];

    function reiniciar() {
      conoc = new Int8Array(C * F).fill(-1);
      robot = { x: INICIO.x, y: INICIO.y, th: INICIO.th };
      ruta = []; meta = null; metaFr = null; lista = []; rastro = [[robot.x, robot.y]];
      t = 0; tUlt = -99; terminado = false; fin = 0; eventos = [];
      est = { enviadas: 0, reemplazadas: 0, alcanzadas: 0, tachadas: 0 };
      sensar();
      planificar(true);
    }
    function libreReal(x, y) { var i = Math.floor(y) * C + Math.floor(x); return x >= 0 && y >= 0 && x < C && y < F && !mundo[i]; }
    /* láser: marca libre lo que recorre cada rayo y ocupada la celda donde choca */
    function sensar() {
      rayosFin = [];
      for (var k = 0; k < RAYOS; k++) {
        var a = robot.th + k / RAYOS * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a), d = 0, hit = false, px = robot.x, py = robot.y;
        while (d < RANGO) {
          d += 0.25; px = robot.x + dx * d; py = robot.y + dy * d;
          var cx = Math.floor(px), cy = Math.floor(py);
          if (cx < 0 || cy < 0 || cx >= C || cy >= F) break;
          var i = cy * C + cx;
          if (mundo[i]) { conoc[i] = 1; hit = true; break; }
          if (conoc[i] !== 1) conoc[i] = 0;
        }
        rayosFin.push([px, py, hit]);
      }
    }
    /* distancia a la pared conocida más cercana, para el mapa de costos */
    var distOb = new Float32Array(C * F);
    function costos() {
      var INF = 1e9; distOb.fill(INF);
      var cola = [];
      for (var i = 0; i < C * F; i++) if (conoc[i] === 1) { distOb[i] = 0; cola.push(i); }
      for (var h = 0; h < cola.length; h++) {
        var j = cola[h], x = j % C, y = (j / C) | 0, dj = distOb[j];
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          var nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= C || ny >= F) continue;
          var n = ny * C + nx, nd = dj + (dx && dy ? 1.414 : 1);
          if (nd < distOb[n] && nd < 6) { distOb[n] = nd; cola.push(n); }
        }
      }
    }
    function costoCelda(i) {
      var d = distOb[i];
      if (d <= RADIO) return Infinity;
      var c = conoc[i] === -1 ? 3 : 1;          /* el espacio desconocido se permite, pero cuesta más */
      if (d < 4) c += 6 * Math.exp(-1.2 * (d - RADIO));
      return c;
    }
    /* A estrella sobre la rejilla con 8 vecinos */
    function aEstrella(sx, sy, gx, gy) {
      var s = sy * C + sx, g = gy * C + gx;
      if (!isFinite(costoCelda(g))) return null;
      var gS = new Float32Array(C * F).fill(Infinity), padre = new Int32Array(C * F).fill(-1), cerr = new Uint8Array(C * F);
      var abiertos = [s]; gS[s] = 0;
      function h(i) { var x = i % C, y = (i / C) | 0, ax = Math.abs(x - gx), ay = Math.abs(y - gy); return Math.max(ax, ay) + 0.414 * Math.min(ax, ay); }
      var f = {}; f[s] = h(s);
      var iter = 0;
      while (abiertos.length && iter++ < 20000) {
        var bi = 0; for (var q = 1; q < abiertos.length; q++) if (f[abiertos[q]] < f[abiertos[bi]]) bi = q;
        var c = abiertos[bi]; abiertos[bi] = abiertos[abiertos.length - 1]; abiertos.pop();
        if (c === g) break;
        if (cerr[c]) continue; cerr[c] = 1;
        var x = c % C, y = (c / C) | 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          var nx = x + dx, ny = y + dy; if (nx < 1 || ny < 1 || nx >= C - 1 || ny >= F - 1) continue;
          var n = ny * C + nx; if (cerr[n]) continue;
          var cc = costoCelda(n); if (!isFinite(cc)) continue;
          var ng = gS[c] + cc * (dx && dy ? 1.414 : 1);
          if (ng < gS[n]) { gS[n] = ng; padre[n] = c; f[n] = ng + h(n); abiertos.push(n); }
        }
      }
      if (padre[g] === -1 && g !== s) return null;
      var camino = [], k = g; while (k !== -1) { camino.unshift([(k % C) + 0.5, ((k / C) | 0) + 0.5]); if (k === s) break; k = padre[k]; }
      return camino;
    }
    /* fronteras: celdas desconocidas junto a una libre, agrupadas por vecindad */
    function fronteras() {
      var es = new Uint8Array(C * F), grupos = [];
      for (var y = 1; y < F - 1; y++) for (var x = 1; x < C - 1; x++) {
        var i = y * C + x; if (conoc[i] !== -1) continue;
        if (conoc[i - 1] === 0 || conoc[i + 1] === 0 || conoc[i - C] === 0 || conoc[i + C] === 0) es[i] = 1;
      }
      var vis = new Uint8Array(C * F);
      for (var j = 0; j < C * F; j++) {
        if (!es[j] || vis[j]) continue;
        var g = [], pila = [j]; vis[j] = 1;
        while (pila.length) {
          var p = pila.pop(); g.push(p);
          var px = p % C, py = (p / C) | 0;
          for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
            var n = (py + dy) * C + px + dx; if (es[n] && !vis[n]) { vis[n] = 1; pila.push(n); }
          }
        }
        grupos.push(g);
      }
      return { celdas: es, grupos: grupos };
    }
    function enLista(x, y) { return lista.some(function (b) { return Math.abs(b[0] - x) < 4 && Math.abs(b[1] - y) < 4; }); }
    function evento(txt) { eventos.unshift(U.fmt(t, 1) + " s · " + txt); if (eventos.length > 5) eventos.pop(); }
    /* el explorador: elige la frontera de menor puntaje (distancia y tamaño) cada 3,3 s */
    function planificar(forzar) {
      costos();
      var fr = fronteras(), cand = [];
      fr.grupos.forEach(function (g) {
        if (g.length < MIN_FRONT) return;
        var sx = 0, sy = 0, dmin = 1e9;
        g.forEach(function (i) { var x = i % C + .5, y = ((i / C) | 0) + .5; sx += x; sy += y; dmin = Math.min(dmin, Math.hypot(x - robot.x, y - robot.y)); });
        var cx = sx / g.length, cy = sy / g.length, mejor = g[0], md = 1e9;
        g.forEach(function (i) { var x = i % C + .5, y = ((i / C) | 0) + .5, d = Math.hypot(x - cx, y - cy); if (d < md) { md = d; mejor = i; } });
        var gx = mejor % C, gy = (mejor / C) | 0;
        cand.push({ x: gx, y: gy, costo: 3 * dmin - 1 * g.length, n: g.length });
      });
      cand.sort(function (a, b) { return a.costo - b.costo; });
      if (!cand.length) { terminar(); return; }
      var elegida = null;
      for (var k = 0; k < cand.length; k++) {
        var c = cand[k];
        if (enLista(c.x, c.y)) continue;
        var cam = aEstrella(Math.floor(robot.x), Math.floor(robot.y), c.x, c.y);
        if (!cam) { lista.push([c.x, c.y]); est.tachadas++; continue; }
        elegida = { c: c, cam: cam }; break;
      }
      if (!elegida) {
        if (lista.length) { lista = []; evento("todas las fronteras tachadas, se vacía la lista"); }
        return;
      }
      var nueva = !metaFr || Math.hypot(metaFr.x - elegida.c.x, metaFr.y - elegida.c.y) >= 1;
      if (nueva) {
        if (meta && !forzar) { est.reemplazadas++; evento("nueva meta, la anterior queda abortada"); }
        else if (meta) { est.reemplazadas++; }
        else evento("primera meta enviada");
        est.enviadas++;
      }
      metaFr = elegida.c; meta = [elegida.c.x + .5, elegida.c.y + .5]; ruta = elegida.cam;
    }
    function terminar() {
      if (terminado) return;
      terminado = true; ruta = []; meta = null; metaFr = null;
      evento("no quedan fronteras, fin de la exploración");
    }
    function chocaReal(x, y) {
      for (var a = 0; a < 8; a++) { var px = x + Math.cos(a * Math.PI / 4) * (RADIO - .25), py = y + Math.sin(a * Math.PI / 4) * (RADIO - .25); if (!libreReal(px, py)) return true; }
      return false;
    }
    function avanzar(dt) {
      t += dt;
      if (terminado) { fin += dt; return; }
      if (t - tUlt >= 3.3) { tUlt = t; planificar(false); }
      if (!ruta.length) { if (t - tUlt > 0.6) { tUlt = t - 3.3; } return; }
      /* sigue la ruta mirando un punto un poco más adelante */
      while (ruta.length > 1 && Math.hypot(ruta[0][0] - robot.x, ruta[0][1] - robot.y) < 1.6) ruta.shift();
      var obj = ruta[Math.min(1, ruta.length - 1)];
      if (ruta.length === 1 && Math.hypot(obj[0] - robot.x, obj[1] - robot.y) < 0.8) {
        ruta = []; est.alcanzadas++; evento("meta alcanzada"); meta = null; metaFr = null; tUlt = t - 3.3; return;
      }
      var ang = Math.atan2(obj[1] - robot.y, obj[0] - robot.x), err = Math.atan2(Math.sin(ang - robot.th), Math.cos(ang - robot.th));
      var w = limitar(3.2 * err, -2.2, 2.2), v = 3.6 * Math.max(0, Math.cos(err)) * (Math.abs(err) > 1 ? 0.15 : 1);
      var nth = robot.th + w * dt, nx = robot.x + Math.cos(nth) * v * dt, ny = robot.y + Math.sin(nth) * v * dt;
      robot.th = nth;
      if (!chocaReal(nx, ny)) { robot.x = nx; robot.y = ny; }
      else { tUlt = t - 3.3; }
      var u = rastro[rastro.length - 1];
      if (Math.hypot(u[0] - robot.x, u[1] - robot.y) > 0.5) rastro.push([robot.x, robot.y]);
      sensar();
      /* si la ruta cruza una pared recién descubierta, se replanifica */
      for (var k = 0; k < Math.min(ruta.length, 12); k++) { var i = Math.floor(ruta[k][1]) * C + Math.floor(ruta[k][0]); if (conoc[i] === 1) { tUlt = t - 3.3; break; } }
    }
    function cobertura() {
      var libres = 0, vistos = 0;
      for (var i = 0; i < C * F; i++) if (!mundo[i]) { libres++; if (conoc[i] === 0) vistos++; }
      return vistos / libres * 100;
    }
    /* Lo que el dibujo necesita leer. conoc, robot y los demás se reasignan al reiniciar, así que se piden cada vez. */
    function ver() {
      return { mundo: mundo, conoc: conoc, robot: robot, ruta: ruta, meta: meta, lista: lista, rastro: rastro, t: t, est: est,
        terminado: terminado, fin: fin, eventos: eventos, rayosFin: rayosFin, distOb: distOb };
    }
    return { C: C, F: F, RADIO: RADIO, reiniciar: reiniciar, avanzar: avanzar, costos: costos, fronteras: fronteras, cobertura: cobertura, ver: ver };
  }
  /* Reto de la sección «Metas abortadas asociadas a reemplazos». Las cifras son las de la página: 60 metas, 54 abortadas,
     53 asociadas a un reemplazo, mediana de 3,3 s entre metas y 10 s de la lista negra. Sin DOM, para probarse con Node. */
  function reto() {
    return [{
      pregunta: "De 60 metas, 54 quedaron abortadas y 53 de ellas coinciden con un reemplazo del explorador. ¿Qué dice el estado abortado?",
      opciones: [
        { texto: "No mide fallas de navegación: Nav2 también lo usa cuando el explorador reemplaza una meta en curso", ok: true, porque: "Al llegar una meta nueva mientras otra se ejecuta, Nav2 cierra la anterior como abortada. 53 de los 54 abortos coinciden con un reemplazo, aunque la coincidencia no descarta fallas de Nav2 ni las cuenta por separado." },
        { texto: "Que 54 de 60 metas fallaron", ok: false, porque: "Ese estado mezcla los reemplazos del explorador con las fallas de Nav2, y 53 de los 54 abortos coinciden con un reemplazo. No se puede leer como 54 fallas." },
        { texto: "Que el robot llegó a esas 54 metas", ok: false, porque: "Solo 1 de las 60 metas se completó. Abortada quiere decir que Nav2 cerró la meta antes de llegar, no que se alcanzó." }
      ],
      enlace: "#abortadas", enlaceTexto: "Metas abortadas asociadas a reemplazos"
    }, {
      pregunta: "El explorador vuelve a elegir destino cada 3,3 s. Si cada reevaluación reemplaza la meta en curso, ¿qué mediana se espera entre la aceptación de una meta y la de la siguiente?",
      opciones: [
        { texto: "3,3 s, como en las cinco corridas", ok: true, porque: "Es lo que se espera si cada reevaluación reemplaza la meta en curso, y es la mediana que se midió en las cinco corridas." },
        { texto: "10 s, el tiempo de la lista negra", ok: false, porque: "Los 10 s son el tiempo sin progreso con que un punto entra a la lista negra. No son el período del explorador, que es de 3,3 s." },
        { texto: "16,7 s, la espera de una meta completada", ok: false, porque: "16,7 s fue el máximo de la iteración 1, no la mediana. La mediana fue de 3,3 s en las cinco corridas." }
      ],
      enlace: "#como-se-separo", enlaceTexto: "Cómo se asoció cada aborto a un reemplazo"
    }];
  }
  function evaluarReto(i, j) {
    var q = reto()[i], o = q && q.opciones[j];
    return o ? { ok: o.ok, porque: o.porque, enlace: q.enlace, enlaceTexto: q.enlaceTexto } : null;
  }
  V["reto-exploracion"] = function (el) { U.reto(el, reto(), "ex-reto-", evaluarReto); };
  window.EXPLORACION_PRUEBAS = { exploracion: crearExploracion, pasoFijo: pasoFijo, reto: reto, evaluarReto: evaluarReto };

  /* 1. Exploración por fronteras: la interfaz y el dibujo. La simulación está en crearExploracion. */
  V.exploracion = function (el) {
    var S = crearExploracion(), C = S.C, F = S.F, RADIO = S.RADIO;
    var verLaser = true, verFront = true, verCostos = false, verMundo = false, vel = 2;
    /* interfaz */
    el.innerHTML =
      '<div class="vctl"><button type="button" class="vbtn" data-a="play">Explorar</button><button type="button" class="vbtn sec" data-a="reset">Reiniciar</button>' +
      '<div class="segmento" role="group" aria-label="Velocidad de la simulación"><button type="button" data-v="1" aria-pressed="false">1×</button><button type="button" data-v="2" aria-pressed="true">2×</button><button type="button" data-v="4" aria-pressed="false">4×</button></div></div>' +
      '<div class="casillas"><label><input type="checkbox" data-t="laser" checked>Láser</label><label><input type="checkbox" data-t="front" checked>Fronteras</label><label><input type="checkbox" data-t="costos">Mapa de costos</label><label><input type="checkbox" data-t="mundo">Mostrar el plano real</label></div>' +
      '<div class="ex-lienzo"></div>' +
      '<div class="lecturas"><div><span>Tiempo simulado</span><b data-o="t">0 s</b></div><div><span>Metas enviadas</span><b data-o="env">0</b></div><div><span>Reemplazadas antes de llegar</span><b data-o="rem">0</b></div><div><span>Alcanzadas</span><b data-o="alc">0</b></div><div><span>Plano descubierto</span><b data-o="cob">0 %</b></div></div>' +
        '<p class="vestado" aria-live="polite" data-o="ev"></p>';
    U.escena(el, { dibujo: ".ex-lienzo", lecturas: ".lecturas, .vestado" });
    var cont = el.querySelector(".ex-lienzo");
    var L = lienzo(cont, 16 / 10, function () { dibujar(); });
    var P = paleta(el);
    alTema(function () { P = paleta(el); dibujar(); });

    function dibujar() {
      var E = S.ver(), conoc = E.conoc, robot = E.robot, ruta = E.ruta, meta = E.meta, lista = E.lista, rastro = E.rastro,
        terminado = E.terminado, rayosFin = E.rayosFin, distOb = E.distOb, mundo = E.mundo;
      if (!conoc) return;
      var ctx = L.ctx, W = L.w, H = L.h, s = Math.min(W / C, H / F), ox = (W - C * s) / 2, oy = (H - F * s) / 2;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      /* desconocido con trama, libre claro y ocupado oscuro */
      ctx.fillStyle = P.oscuro ? rgba(P.desc, .55) : rgba(P.desc, .75);
      ctx.fillRect(ox, oy, C * s, F * s);
      ctx.save(); ctx.beginPath(); ctx.rect(ox, oy, C * s, F * s); ctx.clip();
      ctx.strokeStyle = P.oscuro ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.05)"; ctx.lineWidth = 1;
      for (var k = -F; k < C; k += 2) { ctx.beginPath(); ctx.moveTo(ox + k * s, oy); ctx.lineTo(ox + (k + F) * s, oy + F * s); ctx.stroke(); }
      ctx.restore();
      var fr = verFront && !terminado ? S.fronteras().celdas : null;
      for (var y = 0; y < F; y++) for (var x = 0; x < C; x++) {
        var i = y * C + x, v = conoc[i], px = ox + x * s, py = oy + y * s;
        if (v === 0) {
          ctx.fillStyle = P.sup; ctx.fillRect(px, py, s + .5, s + .5);
          if (verCostos && distOb[i] < 4) { var a = distOb[i] <= RADIO ? .55 : .42 * Math.exp(-1.1 * (distOb[i] - RADIO)); ctx.fillStyle = rgba(P.violeta, a); ctx.fillRect(px, py, s + .5, s + .5); }
        } else if (v === 1) { ctx.fillStyle = P.ink; ctx.fillRect(px, py, s + .5, s + .5); }
        else if (verMundo && mundo[i]) { ctx.fillStyle = rgba(P.ink, .22); ctx.fillRect(px, py, s + .5, s + .5); }
        if (fr && fr[i]) { ctx.fillStyle = rgba(P.ambar, .85); ctx.fillRect(px + s * .15, py + s * .15, s * .7, s * .7); }
      }
      /* lista negra */
      lista.forEach(function (b) { var px = ox + (b[0] + .5) * s, py = oy + (b[1] + .5) * s; ctx.strokeStyle = P.rojo; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - s, py - s); ctx.lineTo(px + s, py + s); ctx.moveTo(px + s, py - s); ctx.lineTo(px - s, py + s); ctx.stroke(); });
      /* rastro */
      ctx.strokeStyle = rgba(P.muted, .7); ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.beginPath();
      rastro.forEach(function (p, j) { var px = ox + p[0] * s, py = oy + p[1] * s; if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      ctx.lineTo(ox + robot.x * s, oy + robot.y * s); ctx.stroke(); ctx.setLineDash([]);
      /* láser */
      if (verLaser) {
        ctx.strokeStyle = rgba(P.azul, P.oscuro ? .22 : .16); ctx.lineWidth = 1;
        ctx.beginPath();
        rayosFin.forEach(function (r) { ctx.moveTo(ox + robot.x * s, oy + robot.y * s); ctx.lineTo(ox + r[0] * s, oy + r[1] * s); });
        ctx.stroke();
        ctx.fillStyle = P.rojo;
        rayosFin.forEach(function (r) { if (r[2]) { ctx.fillRect(ox + r[0] * s - 1.5, oy + r[1] * s - 1.5, 3, 3); } });
      }
      /* ruta planificada, en verde como en RViz */
      if (ruta.length) {
        ctx.strokeStyle = P.ruta; ctx.lineWidth = Math.max(2, s * .45); ctx.lineJoin = "round"; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(ox + robot.x * s, oy + robot.y * s);
        ruta.forEach(function (p) { ctx.lineTo(ox + p[0] * s, oy + p[1] * s); }); ctx.stroke();
      }
      /* meta */
      if (meta) {
        var mx = ox + meta[0] * s, my = oy + meta[1] * s, r = Math.max(5, s * 1.1);
        ctx.fillStyle = P.rojo; ctx.beginPath();
        for (var q = 0; q < 10; q++) { var rr = q % 2 ? r * .45 : r, aa = -Math.PI / 2 + q * Math.PI / 5; ctx.lineTo(mx + Math.cos(aa) * rr, my + Math.sin(aa) * rr); }
        ctx.closePath(); ctx.fill();
      }
      /* robot: la planta en U del prototipo (U.robot en js/comun.js), con la curva adelante como el robot real,
         su LiDAR y un triángulo que marca el rumbo */
      var R = RADIO * s, px = ox + robot.x * s, py = oy + robot.y * s, cR = Math.cos(robot.th), sR = Math.sin(robot.th), frente = R;
      ctx.fillStyle = P.azul; ctx.strokeStyle = P.sup; ctx.lineWidth = 1.5;
      if (U && U.robot) {
        var MR = U.robot.medidas, kR = R / MR.r, gR = U.robot.canvas(ctx, px, py, robot.th, kR, "centro");
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.sup; ctx.beginPath(); ctx.arc(gR.lidar[0], gR.lidar[1], Math.max(2, gR.lidarR), 0, Math.PI * 2); ctx.fill();
        frente = (MR.frente - MR.atras) / 2 * kR;
      } else { ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      var pR = function (a, b) { return [px + a * cR - b * sR, py + a * sR + b * cR]; }, t1 = pR(frente + R * .42, 0), t2 = pR(frente + R * .1, -R * .3), t3 = pR(frente + R * .1, R * .3);
      ctx.fillStyle = P.verdeV; ctx.beginPath(); ctx.moveTo(t1[0], t1[1]); ctx.lineTo(t2[0], t2[1]); ctx.lineTo(t3[0], t3[1]); ctx.closePath(); ctx.fill();
      /* aviso final */
      if (terminado) {
        var msg = "Exploración terminada: no quedan fronteras";
        ctx.font = "700 " + Math.max(12, Math.round(W / 46)) + "px " + css("--f-display").split(",")[0].replace(/"/g, "") + ", sans-serif";
        var tw = ctx.measureText(msg).width + 24, th = Math.max(30, W / 26);
        ctx.fillStyle = rgba(P.sup, .94); ctx.strokeStyle = P.verde; ctx.lineWidth = 2;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect((W - tw) / 2, H / 2 - th / 2, tw, th, 8); else ctx.rect((W - tw) / 2, H / 2 - th / 2, tw, th); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.verde; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(msg, W / 2, H / 2 + 1);
        ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
      }
      salidas();
    }
    function salidas() {
      var E = S.ver(), t = E.t, est = E.est, eventos = E.eventos;
      var o = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
      o("t").textContent = U.fmt(t, 0) + " s"; o("env").textContent = est.enviadas; o("rem").textContent = est.reemplazadas; o("alc").textContent = est.alcanzadas; o("cob").textContent = U.fmt(S.cobertura(), 0) + " %";
      o("ev").textContent = eventos.length ? eventos[0] : "";
    }
    /* paso fijo de 1/30 s de tiempo simulado; la velocidad 1×, 2× o 4× multiplica el tiempo real acumulado */
    var H_PASO = 1 / 30, reloj = pasoFijo(H_PASO, 0.1);
    var B = bucle(el, function (dt) {
      var pasos = reloj.pasos(dt, vel);
      for (var k = 0; k < pasos; k++) S.avanzar(H_PASO);
      if (pasos) dibujar();
    });
    function reiniciar() { S.reiniciar(); reloj.reiniciar(); }
    reiniciar(); dibujar();
    /* lectura del estado, usada por las pruebas automáticas */
    el.estadoSim = function () { var E = S.ver(), t = E.t, est = E.est, robot = E.robot; return { t: t, pasos: Math.round(t / H_PASO), enviadas: est.enviadas, reemplazadas: est.reemplazadas, alcanzadas: est.alcanzadas, terminado: E.terminado, x: robot.x, y: robot.y, activo: B.activo }; };
    function textoPlay() { var bp = el.querySelector('[data-a="play"]'); bp.textContent = B.activo ? "Pausar" : (S.ver().terminado ? "Explorar de nuevo" : "Explorar"); bp.setAttribute("aria-pressed", B.activo ? "true" : "false"); }
    /* el bucle se pausa solo con movimiento reducido, y el botón debe decirlo */
    alCambiarMovimiento(textoPlay);
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]");
      if (b) {
        if (b.getAttribute("data-a") === "play") { if (B.activo) B.pausa(); else { if (S.ver().terminado) reiniciar(); B.play(); } }
        if (b.getAttribute("data-a") === "reset") { reiniciar(); dibujar(); }
        textoPlay();
      }
      var v = e.target.closest("[data-v]");
      if (v) { vel = +v.getAttribute("data-v"); U.marcar(el, "data-v", v.getAttribute("data-v")); }
    });
    el.addEventListener("change", function (e) {
      var k = e.target.getAttribute("data-t"); if (!k) return;
      if (k === "laser") verLaser = e.target.checked; if (k === "front") verFront = e.target.checked;
      if (k === "costos") { verCostos = e.target.checked; S.costos(); } if (k === "mundo") verMundo = e.target.checked;
      dibujar();
    });
  };
})();
