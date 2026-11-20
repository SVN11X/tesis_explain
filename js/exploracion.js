/* Exploración: frontera, reemplazo de metas y lista negra */
(function () {
  "use strict";
  var V = window.VISUALES, U = window.U;

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
})();
