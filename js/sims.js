/*
  Simulaciones interactivas nuevas del sitio, dibujadas en canvas.
  Todas son ilustrativas: explican una idea con un modelo simple y no reemplazan
  las mediciones del robot real, que se citan desde la tesis en cada capítulo.

  exploracion  robot que explora un plano desconocido por fronteras (portada y capítulo 7)
  cinematica   dos velocidades de rueda y la trayectoria que resulta (capítulo 3)
  encoder      canales en cuadratura y conteo por cuatro (capítulo 3)
  lidar        lo que ve un láser 2D, y lo que no ve (capítulo 5)
  pid          respuesta de una rueda con P, I y D (capítulo 4)
  enjambre     optimización por enjambre de partículas sobre un costo (capítulo 4)
  inflacion    mapa de costos, radio de inflación y huella del robot (capítulo 6)
  dwb          ventana dinámica: trayectorias candidatas y su puntaje (capítulo 6)
*/
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {};
  var U = window.U;

  /* ── utilidades de color y lienzo ── */
  function css(nombre) { return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim() || "#888"; }
  function rgba(hex, a) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(hex, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function paleta() {
    return {
      bg: css("--bg"), sup: css("--surface"), sup2: css("--surface-2"), linea: css("--line"), linea2: css("--line-2"),
      ink: css("--ink"), muted: css("--muted"), azul: css("--azul"), verde: css("--verde-texto"), verdeV: css("--verde"),
      rojo: css("--rojo"), ambar: css("--ambar"), violeta: css("--violeta"), desc: css("--desc"), obst: css("--obst"),
      s1: css("--s1"), s2: css("--s2"), s3: css("--s3"), s4: css("--s4"),
      oscuro: document.documentElement.getAttribute("data-theme") === "dark" ||
        (document.documentElement.getAttribute("data-theme") !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    };
  }
  /* crea un canvas nítido en pantallas de alta densidad y lo redimensiona con su contenedor */
  function lienzo(padre, proporcion, alDimensionar) {
    var cv = document.createElement("canvas");
    cv.className = "lienzo";
    padre.appendChild(cv);
    var ctx = cv.getContext("2d"), o = { cv: cv, ctx: ctx, w: 0, h: 0 }, listo = false;
    function medir() {
      var w = Math.max(260, Math.round(padre.clientWidth || cv.parentNode.clientWidth || 600));
      var h = Math.round(w / proporcion);
      if (w === o.w && h === o.h) return;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.aspectRatio = w + " / " + h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.w = w; o.h = h;
      if (listo && alDimensionar) alDimensionar();
    }
    o.medir = medir;
    medir();
    listo = true;
    if ("ResizeObserver" in window) new ResizeObserver(function () { medir(); }).observe(padre);
    return o;
  }
  function alTema(fn) { document.addEventListener("temacambio", function () { setTimeout(fn, 30); }); }
  function quieto() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function fmt(v, d) { return U ? U.fmt(v, d) : v.toFixed(d).replace(".", ","); }
  function limitar(v, a, b) { return Math.max(a, Math.min(b, v)); }
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
  /* bucle que corre solo cuando el elemento está a la vista y la pestaña está visible.
     El primer cuadro después de arrancar o de volver a la vista entrega dt = 0, para no saltar. */
  function bucle(el, paso) {
    var activo = false, enVista = true, pestana = !document.hidden, ult = 0, id = 0;
    function puede() { return activo && enVista && pestana; }
    function tick(ts) {
      if (!puede()) { id = 0; return; }
      var dt = ult ? Math.min(0.1, Math.max(0, (ts - ult) / 1000)) : 0;
      ult = ts;
      paso(dt);
      id = requestAnimationFrame(tick);
    }
    function arrancar() { if (!id && puede()) { ult = 0; id = requestAnimationFrame(tick); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { enVista = es[es.length - 1].isIntersecting; arrancar(); }, { threshold: 0.05 }).observe(el);
    }
    document.addEventListener("visibilitychange", function () { pestana = !document.hidden; arrancar(); });
    return {
      play: function () { activo = true; arrancar(); },
      pausa: function () { activo = false; if (id) { cancelAnimationFrame(id); id = 0; } },
      get activo() { return activo; }
    };
  }
  /* preferencia de movimiento reducido, con aviso cuando cambia */
  function alCambiarMovimiento(fn) {
    if (!window.matchMedia) return;
    var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var f = function () { fn(mq.matches); };
    if (mq.addEventListener) mq.addEventListener("change", f); else if (mq.addListener) mq.addListener(f);
  }

  /* ── Geometría de la huella, usada por el simulador de inflación ── */
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
    var ci = limitar(Math.floor(centro[1] / res), 0, F - 1) * C + limitar(Math.floor(centro[0] / res), 0, C - 1);
    return { fisico: fisicas.length > 0, celdasFisicas: fisicas, margen: margen.length > 0, celdasMargen: margen, inscritas: inscritas, costoCentro: costoDe(ci), celdaCentro: ci };
  }
  window.SIMS_PRUEBAS = { pasoFijo: pasoFijo, poligonoTocaRect: poligonoTocaRect, huellaEnMundo: huellaEnMundo, celdasTocadas: celdasTocadas, evaluarHuella: evaluarHuella };

  /* ═══════════════════════════════════════════════════════════
     1. Exploración por fronteras
     ═══════════════════════════════════════════════════════════ */
  V.exploracion = function (el) {
    var hero = el.getAttribute("data-modo") === "hero";
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
    var RANGO = 13, RAYOS = hero ? 96 : 120, RADIO = 1.25, MIN_FRONT = 2;
    var conoc, robot, ruta, meta, metaFr, lista, rastro, t, tUlt, est, terminado, fin, eventos;
    var verLaser = true, verFront = true, verCostos = false, verMundo = false, vel = hero ? 2.4 : 2;
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
    function evento(txt) { eventos.unshift(fmt(t, 1) + " s · " + txt); if (eventos.length > 5) eventos.pop(); }
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

    /* ── interfaz ── */
    el.innerHTML = (hero ? '' :
      '<div class="vctl"><button type="button" class="vbtn" data-a="play">Explorar</button><button type="button" class="vbtn sec" data-a="reset">Reiniciar</button>' +
      '<div class="segmento" role="group" aria-label="Velocidad de la simulación"><button type="button" data-v="1" aria-pressed="false">1×</button><button type="button" data-v="2" aria-pressed="true">2×</button><button type="button" data-v="4" aria-pressed="false">4×</button></div></div>' +
      '<div class="casillas"><label><input type="checkbox" data-t="laser" checked>Láser</label><label><input type="checkbox" data-t="front" checked>Fronteras</label><label><input type="checkbox" data-t="costos">Mapa de costos</label><label><input type="checkbox" data-t="mundo">Mostrar el plano real</label></div>') +
      '<div class="ex-lienzo"></div>' +
      (hero ? '' : '<div class="lecturas"><div><span>Tiempo simulado</span><b data-o="t">0 s</b></div><div><span>Metas enviadas</span><b data-o="env">0</b></div><div><span>Reemplazadas antes de llegar</span><b data-o="rem">0</b></div><div><span>Alcanzadas</span><b data-o="alc">0</b></div><div><span>Plano descubierto</span><b data-o="cob">0 %</b></div></div>' +
        '<p class="vestado" aria-live="polite" data-o="ev"></p>');
    var cont = el.querySelector(".ex-lienzo");
    var L = lienzo(cont, hero ? 16 / 10.5 : 16 / 10, function () { dibujar(); });
    var P = paleta();
    alTema(function () { P = paleta(); dibujar(); });

    function dibujar() {
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
      var fr = verFront && !terminado ? fronteras().celdas : null;
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
        ctx.strokeStyle = P.oscuro ? "#5BE07A" : "#13A538"; ctx.lineWidth = Math.max(2, s * .45); ctx.lineJoin = "round"; ctx.lineCap = "round";
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
      /* robot: cuerpo en forma de U como el prototipo, con el láser al centro */
      ctx.save(); ctx.translate(ox + robot.x * s, oy + robot.y * s); ctx.rotate(robot.th + Math.PI / 2);
      var R = RADIO * s;
      ctx.fillStyle = P.azul; ctx.strokeStyle = P.sup; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-R, -R * .9); ctx.lineTo(R, -R * .9); ctx.lineTo(R, R * .1); ctx.arc(0, R * .1, R, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.sup; ctx.beginPath(); ctx.arc(0, R * .15, R * .42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.verdeV; ctx.beginPath(); ctx.moveTo(0, -R * 1.25); ctx.lineTo(R * .32, -R * .85); ctx.lineTo(-R * .32, -R * .85); ctx.closePath(); ctx.fill();
      ctx.restore();
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
    function cobertura() {
      var libres = 0, vistos = 0;
      for (var i = 0; i < C * F; i++) if (!mundo[i]) { libres++; if (conoc[i] === 0) vistos++; }
      return vistos / libres * 100;
    }
    function salidas() {
      if (hero) { if (heroEst) heroEst.textContent = terminado ? "Terminó sola, sin fronteras" : (ruta.length ? "Va hacia la frontera elegida" : "Eligiendo frontera"); return; }
      var o = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
      o("t").textContent = fmt(t, 0) + " s"; o("env").textContent = est.enviadas; o("rem").textContent = est.reemplazadas; o("alc").textContent = est.alcanzadas; o("cob").textContent = fmt(cobertura(), 0) + " %";
      o("ev").textContent = eventos.length ? eventos[0] : "";
    }
    var heroEst = null;
    /* paso fijo de 1/30 s de tiempo simulado; la velocidad 1×, 2× o 4× multiplica el tiempo real acumulado */
    var H_PASO = 1 / 30, reloj = pasoFijo(H_PASO, 0.1);
    var B = bucle(el, function (dt) {
      var pasos = reloj.pasos(dt, vel);
      for (var k = 0; k < pasos; k++) avanzar(H_PASO);
      if (terminado && fin > (hero ? 4 : 1e9)) { reiniciar(); reloj.reiniciar(); }
      if (pasos) dibujar();
    });
    var reiniciarBase = reiniciar;
    reiniciar = function () { reiniciarBase(); reloj.reiniciar(); };
    reiniciar(); dibujar();
    /* lectura del estado, usada por las pruebas automáticas */
    el.estadoSim = function () { return { t: t, pasos: Math.round(t / H_PASO), enviadas: est.enviadas, reemplazadas: est.reemplazadas, alcanzadas: est.alcanzadas, terminado: terminado, x: robot.x, y: robot.y, activo: B.activo }; };
    if (hero) {
      var barra = document.querySelector('[data-sim-barra="' + (el.id || "") + '"]');
      if (barra) {
        heroEst = barra.querySelector("[data-estado]");
        var bp = barra.querySelector("[data-a=play]");
        var setTxt = function () { bp.textContent = B.activo ? "Pausar" : "Reproducir"; bp.setAttribute("aria-pressed", B.activo ? "true" : "false"); };
        var pausadoUsuario = false;
        bp.addEventListener("click", function () { if (B.activo) { B.pausa(); pausadoUsuario = true; } else { B.play(); pausadoUsuario = false; } setTxt(); });
        if (!quieto()) B.play();
        setTxt();
        alCambiarMovimiento(function (reducido) { if (reducido) B.pausa(); else if (!pausadoUsuario) B.play(); setTxt(); });
      } else if (!quieto()) B.play();
      return;
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]");
      if (b) {
        if (b.getAttribute("data-a") === "play") { if (B.activo) B.pausa(); else { if (terminado) reiniciar(); B.play(); } }
        if (b.getAttribute("data-a") === "reset") { reiniciar(); dibujar(); }
        var bp = el.querySelector('[data-a="play"]'); bp.textContent = B.activo ? "Pausar" : (terminado ? "Explorar de nuevo" : "Explorar"); bp.setAttribute("aria-pressed", B.activo ? "true" : "false");
      }
      var v = e.target.closest("[data-v]");
      if (v) { vel = +v.getAttribute("data-v"); el.querySelectorAll("[data-v]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === v)); }); }
    });
    el.addEventListener("change", function (e) {
      var k = e.target.getAttribute("data-t"); if (!k) return;
      if (k === "laser") verLaser = e.target.checked; if (k === "front") verFront = e.target.checked;
      if (k === "costos") { verCostos = e.target.checked; costos(); } if (k === "mundo") verMundo = e.target.checked;
      dibujar();
    });
  };

  /* ═══════════════════════════════════════════════════════════
     2. Cinemática diferencial
     ═══════════════════════════════════════════════════════════ */
  V.cinematica = function (el) {
    var r = 0.0335, b = 0.188, NE = 1980, F = 30;
    var st = { vl: 0.10, vr: 0.13 }, pose, rastro, P = paleta();
    var PRE = [["Recto a 0,13 m/s", 0.13, 0.13], ["Curva suave", 0.10, 0.13], ["Giro sobre su eje", -0.0329, 0.0329], ["Curva cerrada", 0.02, 0.13], ["Retroceso", -0.08, -0.08]];
    el.innerHTML =
      '<div class="chips" role="group" aria-label="Casos de ejemplo">' + PRE.map(function (p, i) { return '<button type="button" class="chip" data-p="' + i + '" aria-pressed="' + (i === 1) + '">' + p[0] + '</button>'; }).join("") + '</div>' +
      '<div class="deslizadores"><label for="ci-l">Rueda izquierda<b class="num" data-v="vl"></b><input id="ci-l" type="range" min="-0.15" max="0.15" step="0.001" data-k="vl"></label>' +
      '<label for="ci-r">Rueda derecha<b class="num" data-v="vr"></b><input id="ci-r" type="range" min="-0.15" max="0.15" step="0.001" data-k="vr"></label></div>' +
      '<div class="ci-l"></div>' +
      '<div class="lecturas"><div><span>Velocidad del robot</span><b data-o="v"></b></div><div><span>Giro del robot</span><b data-o="w"></b></div><div><span>Radio de la curva</span><b data-o="R"></b></div><div><span>Ticks por ciclo, izquierda</span><b data-o="tl"></b></div><div><span>Ticks por ciclo, derecha</span><b data-o="tr"></b></div></div>' +
      '<p class="vestado" aria-live="polite" data-o="aviso"></p>' +
      '<div class="vctl"><button type="button" class="vbtn sec" data-a="reset">Volver al centro</button></div>';
    var cont = el.querySelector(".ci-l"), L = lienzo(cont, 16 / 8, function () { dibujar(); });
    alTema(function () { P = paleta(); dibujar(); });
    var VIEW = 2.4;  /* metros visibles de ancho */
    function reset() { pose = { x: 0, y: 0, th: 0 }; rastro = [[0, 0]]; }
    function calc() {
      var v = (st.vr + st.vl) / 2, w = (st.vr - st.vl) / b;
      var tl = st.vl / (2 * Math.PI * r) * NE / F, tr = st.vr / (2 * Math.PI * r) * NE / F;
      var o = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
      o("v").textContent = fmt(v, 3) + " m/s"; o("w").textContent = fmt(w, 2) + " rad/s";
      o("R").textContent = Math.abs(w) < 1e-4 ? "recta" : (Math.abs(v) < 1e-4 ? "gira en su lugar" : fmt(Math.abs(v / w), 2) + " m");
      o("tl").textContent = fmt(tl, 1); o("tr").textContent = fmt(tr, 1);
      var av = [];
      if (Math.abs(v) > 0.13 + 1e-9) av.push("la velocidad pasa de 0,13 m/s");
      if (Math.abs(w) > 0.35 + 1e-9) av.push("el giro pasa de 0,35 rad/s");
      o("aviso").textContent = av.length ? "En el robot real, el controlador diferencial recortaría esta orden porque " + av.join(" y ") + "." : "Dentro de los límites del controlador diferencial del robot real, 0,13 m/s y 0,35 rad/s.";
      el.querySelectorAll("[data-v]").forEach(function (x) { x.textContent = fmt(st[x.getAttribute("data-v")], 3) + " m/s"; });
      el.querySelectorAll("input[data-k]").forEach(function (i) { i.value = st[i.getAttribute("data-k")]; });
      return { v: v, w: w };
    }
    function dibujar() {
      if (!pose) return;
      var ctx = L.ctx, W = L.w, H = L.h, esc = W / VIEW, cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.linea; ctx.lineWidth = 1;
      for (var g = -10; g <= 10; g++) { var gx = cx + g * 0.25 * esc, gy = cy + g * 0.25 * esc; ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      ctx.fillStyle = P.muted; ctx.font = "11px " + "IBM Plex Mono, monospace"; ctx.fillText("cuadrícula de 25 cm", 8, H - 8);
      function X(x) { return cx + x * esc; } function Y(y) { return cy - y * esc; }
      ctx.strokeStyle = P.azul; ctx.lineWidth = 2; ctx.beginPath();
      rastro.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.stroke();
      ctx.save(); ctx.translate(X(pose.x), Y(pose.y)); ctx.rotate(-pose.th);
      var L1 = 0.20 * esc, L2 = 0.08 * esc, A = 0.13 * esc, rw = r * esc, bw = b / 2 * esc;
      ctx.fillStyle = rgba(P.azul, .18); ctx.strokeStyle = P.azul; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.rect(-L2, -A, L1 + L2, 2 * A); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.ink;
      ctx.fillRect(-rw, -bw - 0.012 * esc, 2 * rw, 0.024 * esc); ctx.fillRect(-rw, bw - 0.012 * esc, 2 * rw, 0.024 * esc);
      ctx.fillStyle = P.verde; ctx.beginPath(); ctx.moveTo(L1 + 6, 0); ctx.lineTo(L1 - 4, -6); ctx.lineTo(L1 - 4, 6); ctx.closePath(); ctx.fill();
      /* flechas de velocidad de rueda */
      function flecha(y, v, col) { var len = v / 0.15 * 0.22 * esc; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(len, y); ctx.stroke(); if (Math.abs(len) > 6) { var sgn = len > 0 ? 1 : -1; ctx.beginPath(); ctx.moveTo(len + sgn * 7, y); ctx.lineTo(len - sgn * 2, y - 5); ctx.lineTo(len - sgn * 2, y + 5); ctx.closePath(); ctx.fill(); } }
      flecha(-bw, st.vl, P.s2); flecha(bw, st.vr, P.s3);
      ctx.restore();
      ctx.font = "12px Atkinson Hyperlegible, sans-serif"; ctx.fillStyle = P.s2; ctx.fillText("● rueda izquierda", 8, 16); ctx.fillStyle = P.s3; ctx.fillText("● rueda derecha", 8, 32);
    }
    function paso(dt) {
      var k = calc(), sub = 4;
      for (var i = 0; i < sub; i++) {
        var h = dt / sub;
        pose.x += k.v * Math.cos(pose.th) * h; pose.y += k.v * Math.sin(pose.th) * h; pose.th += k.w * h;
      }
      var u = rastro[rastro.length - 1];
      if (Math.hypot(u[0] - pose.x, u[1] - pose.y) > 0.01) rastro.push([pose.x, pose.y]);
      if (rastro.length > 900) rastro.shift();
      if (Math.abs(pose.x) > VIEW / 2 + .2 || Math.abs(pose.y) > VIEW / 4 + .2) reset();
      dibujar();
    }
    reset(); calc(); dibujar();
    var B = bucle(el, function (dt) { paso(dt * 1.5); });
    if (!quieto()) B.play();
    else { var bb = document.createElement("button"); bb.type = "button"; bb.className = "vbtn"; bb.textContent = "Mover"; bb.setAttribute("data-a", "mover"); el.querySelector(".vctl").prepend(bb); }
    el.addEventListener("input", function (e) { var k = e.target.getAttribute("data-k"); if (!k) return; st[k] = parseFloat(e.target.value); el.querySelectorAll("[data-p]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); calc(); dibujar(); });
    el.addEventListener("click", function (e) {
      var p = e.target.closest("[data-p]");
      if (p) { var d = PRE[+p.getAttribute("data-p")]; st.vl = d[1]; st.vr = d[2]; el.querySelectorAll("[data-p]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === p)); }); reset(); calc(); dibujar(); }
      var a = e.target.closest("[data-a]");
      if (a && a.getAttribute("data-a") === "reset") { reset(); dibujar(); }
      if (a && a.getAttribute("data-a") === "mover") { if (B.activo) { B.pausa(); a.textContent = "Mover"; } else { B.play(); a.textContent = "Detener"; } }
    });
  };

  /* ═══════════════════════════════════════════════════════════
     3. Encoder de cuadratura
     ═══════════════════════════════════════════════════════════ */
  V.encoder = function (el) {
    var P = paleta(), ang = 0, sentido = 1, VEL0 = 0.6, vel = VEL0, cuenta = 0, hist = [], prevA = null, prevB = null, polos = 6;
    el.innerHTML = '<div class="vctl"><button type="button" class="vbtn" data-a="anim" aria-pressed="false">Reproducir</button><div class="segmento" role="group" aria-label="Sentido de giro"><button type="button" data-s="1" aria-pressed="true">Adelante</button><button type="button" data-s="-1" aria-pressed="false">Atrás</button></div>' +
      '<label class="desl-linea" for="en-v">Velocidad<b class="num" data-o="vel"></b><input id="en-v" type="range" min="0" max="1.5" step="0.05" value="' + VEL0 + '"></label><button type="button" class="vbtn sec" data-a="paso">Avanzar un paso</button><button type="button" class="vbtn sec" data-a="cero">Contador a cero</button></div>' +
      '<div class="en-l"></div>' +
      '<div class="lecturas"><div><span>Flancos contados</span><b data-o="c">0</b></div><div><span>Orden de los flancos</span><b data-o="ord">A antes que B</b></div><div><span>Sentido detectado</span><b data-o="sen">adelante</b></div></div>' +
      '<p class="vestado" aria-live="polite" data-o="estado"></p>' +
      '<p class="vnota">Ilustración con un imán de 6 pares de polos y la rueda girando muy lento. En el robot, cada vuelta de la rueda produce cerca de 1980 flancos, porque el sensor está en el eje del motor, antes de la caja reductora, y se cuentan los cuatro flancos de cada ciclo.</p>';
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
        el.querySelector('[data-o="ord"]').textContent = adelante ? "A antes que B" : "B antes que A";
        el.querySelector('[data-o="sen"]').textContent = adelante ? "adelante" : "atrás";
      }
      prevA = A; prevB = Bv;
      hist.push([A, Bv]); if (hist.length > 360) hist.shift();
      el.querySelector('[data-o="c"]').textContent = cuenta;
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
      ctx.fillStyle = P.muted; ctx.fillText("cada marca verde es un flanco contado", x0, H * .95);
    }
    /* llena el historial para que las señales se vean completas desde el inicio */
    (function () { for (var k = 0; k < 360; k++) { ang += VEL0 / 60; hist.push([canal(ang, 0), canal(ang, -Math.PI / 2)]); } prevA = hist[359][0]; prevB = hist[359][1]; dibujar(); })();
    var B = bucle(el, paso), bAnim = el.querySelector('[data-a="anim"]'), pausadoUsuario = false;
    function marcar() {
      var on = B.activo;
      bAnim.textContent = on ? "Pausar" : "Reproducir"; bAnim.setAttribute("aria-pressed", String(on));
      el.querySelector('[data-o="estado"]').textContent = on ? "Animación en marcha." : (quieto() && !pausadoUsuario ? "Imagen fija porque el sistema pide reducir el movimiento. Usa Reproducir o Avanzar un paso." : "Animación en pausa.");
    }
    function velTxt() { el.querySelector('[data-o="vel"]').textContent = fmt(vel, 2); }
    /* sin movimiento reducido arranca sola; con movimiento reducido queda fija hasta que la persona la inicie */
    if (!quieto()) B.play();
    velTxt(); marcar();
    alCambiarMovimiento(function (reducido) { if (reducido) B.pausa(); else if (!pausadoUsuario) B.play(); marcar(); });
    el.addEventListener("click", function (e) {
      var s = e.target.closest("[data-s]"); if (s) { sentido = +s.getAttribute("data-s"); el.querySelectorAll("[data-s]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === s)); }); }
      var a = e.target.closest("[data-a]"); if (!a) return;
      var k = a.getAttribute("data-a");
      if (k === "cero") { cuenta = 0; el.querySelector('[data-o="c"]').textContent = 0; }
      if (k === "anim") { if (B.activo) { B.pausa(); pausadoUsuario = true; } else { B.play(); pausadoUsuario = false; } marcar(); }
      if (k === "paso") { if (B.activo) { B.pausa(); pausadoUsuario = true; marcar(); } avanzarAng(sentido * Math.PI / (2 * polos) * 1.0001); dibujar(); }
    });
    el.addEventListener("input", function (e) { if (e.target.id === "en-v") { vel = parseFloat(e.target.value); velTxt(); } });
    el.estadoSim = function () { return { activo: B.activo, vel: vel, control: parseFloat(el.querySelector("#en-v").value), etiqueta: el.querySelector('[data-o="vel"]').textContent, ang: ang, cuenta: cuenta }; };
  };

  /* ═══════════════════════════════════════════════════════════
     4. Qué ve un LiDAR 2D
     ═══════════════════════════════════════════════════════════ */
  V.lidar = function (el) {
    var P = paleta(), SECT = 230, RMIN = 0.15, RMAX = 12;
    var Wm = 4.0, Hm = 2.6;   /* sala de 4 por 2,6 m */
    var rob = { x: 1.0, y: 1.3 }, soloLaser = false, semilla = 7;
    /* segmentos: [x0,y0,x1,y1,tipo]  tipo: pared, vidrio, oscuro */
    var seg = [
      [0, 0, 4, 0, "pared"], [4, 0, 4, 2.6, "pared"], [0, 2.6, 4, 2.6, "pared"], [0, 0, 0, 1.0, "pared"], [0, 1.0, 0, 1.9, "vidrio"], [0, 1.9, 0, 2.6, "pared"],
      [2.6, 0.0, 2.6, 0.9, "pared"],
      [3.0, 1.6, 3.8, 1.6, "oscuro"], [3.8, 1.6, 3.8, 2.4, "oscuro"], [3.0, 2.4, 3.8, 2.4, "oscuro"], [3.0, 1.6, 3.0, 2.4, "oscuro"]
    ];
    var patas = [[1.7, 1.75], [2.5, 1.75], [1.7, 2.35], [2.5, 2.35]];   /* mesa: solo las patas cortan el plano */
    patas.forEach(function (p) { var d = 0.025; seg.push([p[0] - d, p[1] - d, p[0] + d, p[1] - d, "pata"], [p[0] + d, p[1] - d, p[0] + d, p[1] + d, "pata"], [p[0] - d, p[1] + d, p[0] + d, p[1] + d, "pata"], [p[0] - d, p[1] - d, p[0] - d, p[1] + d, "pata"]); });
    var exterior = [[-0.9, 1.2, -0.9, 1.7, "pared"]];  /* pared detrás del vidrio, fuera de la sala */
    seg = seg.concat(exterior);
    el.innerHTML = '<div class="vctl"><div class="segmento" role="group" aria-label="Vista"><button type="button" data-m="0" aria-pressed="true">Sala y láser</button><button type="button" data-m="1" aria-pressed="false">Solo lo que ve el láser</button></div></div>' +
      '<div class="li-l"></div>' +
      '<div class="vley"><span><i class="cu" style="background:var(--ink)"></i>pared</span><span><i class="cu" style="background:var(--s1);opacity:.5"></i>vidrio</span><span><i class="cu" style="background:var(--obst)"></i>superficie muy oscura</span><span><i class="cu rech"></i>cubierta de mesa, sobre el plano</span><span><i class="cu ambar-s"></i>caja baja, bajo el plano</span><span><i class="pt rojo"></i>punto medido</span></div>' +
      '<p class="vestado" aria-live="polite" data-o="info"></p>' +
      '<p class="vnota">Arrastra el robot, o usa las flechas del teclado con el dibujo enfocado. 230 sectores por vuelta, de 1,57° cada uno, entre 0,15 y 12 m, como el nodo de lectura escrito para este trabajo. El vidrio, la superficie oscura y la mesa son ilustrativos.</p>';
    var cont = el.querySelector(".li-l"), L = lienzo(cont, Wm / Hm * 1.0, function () { dibujar(); });
    L.cv.classList.add("arrastrable"); L.cv.tabIndex = 0; L.cv.setAttribute("role", "img"); L.cv.setAttribute("aria-label", "Sala vista desde arriba con el robot y su barrido láser");
    alTema(function () { P = paleta(); dibujar(); });
    function azar(i) { var x = Math.sin(i * 12.9898 + semilla * 78.233) * 43758.5453; return x - Math.floor(x); }
    function inter(ox, oy, dx, dy, s) {
      var x1 = s[0], y1 = s[1], x2 = s[2], y2 = s[3], ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) return null;
      var tt = ((x1 - ox) * ey - (y1 - oy) * ex) / den, u = ((x1 - ox) * dy - (y1 - oy) * dx) / den;
      if (tt > 1e-6 && u >= 0 && u <= 1) return tt; return null;
    }
    function barrer() {
      var pts = [], perd = 0, vid = 0;
      for (var k = 0; k < SECT; k++) {
        var a = (k + .5) / SECT * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a), mejor = RMAX + 1, tipo = null;
        seg.forEach(function (s) { if (s[4] === "vidrio") return; var tt = inter(rob.x, rob.y, dx, dy, s); if (tt !== null && tt < mejor) { mejor = tt; tipo = s[4]; } });
        var cruzaVidrio = seg.some(function (s) { if (s[4] !== "vidrio") return false; var tt = inter(rob.x, rob.y, dx, dy, s); return tt !== null && tt < mejor; });
        if (cruzaVidrio) vid++;
        if (tipo === "oscuro" && azar(k) < 0.6) { perd++; pts.push([a, null, "perdido"]); continue; }
        if (mejor < RMIN || mejor > RMAX) { pts.push([a, null, "fuera"]); continue; }
        pts.push([a, mejor, tipo, cruzaVidrio]);
      }
      return { pts: pts, perd: perd, vid: vid };
    }
    function dibujar() {
      var ctx = L.ctx, W = L.w, H = L.h, m = 14, esc = Math.min((W - 2 * m) / Wm, (H - 2 * m) / Hm), ox = (W - Wm * esc) / 2, oy = (H - Hm * esc) / 2;
      function X(x) { return ox + x * esc; } function Y(y) { return oy + y * esc; }
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = soloLaser ? P.bg : P.sup; ctx.fillRect(0, 0, W, H);
      var b = barrer();
      if (!soloLaser) {
        /* mesa y caja baja, que no cortan el plano del láser */
        ctx.fillStyle = rgba(P.muted, .12); ctx.strokeStyle = P.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2;
        ctx.fillRect(X(1.62), Y(1.67), 0.96 * esc, 0.76 * esc); ctx.strokeRect(X(1.62), Y(1.67), 0.96 * esc, 0.76 * esc);
        ctx.fillStyle = rgba(P.ambar, .18); ctx.strokeStyle = P.ambar; ctx.fillRect(X(1.6), Y(0.35), 0.3 * esc, 0.25 * esc); ctx.strokeRect(X(1.6), Y(0.35), 0.3 * esc, 0.25 * esc);
        ctx.setLineDash([]);
        ctx.font = "11px Atkinson Hyperlegible, sans-serif"; ctx.fillStyle = P.muted;
        ctx.fillText("cubierta de mesa", X(1.68), Y(2.05)); ctx.fillText("caja baja", X(1.6), Y(0.3));
        ctx.fillText("vidrio", X(0.06), Y(1.48)); ctx.fillText("sofá oscuro", X(3.05), Y(2.02));
        seg.forEach(function (s) {
          ctx.lineCap = "round";
          if (s[4] === "vidrio") { ctx.strokeStyle = rgba(P.s1, .55); ctx.lineWidth = 6; }
          else if (s[4] === "oscuro") { ctx.strokeStyle = P.obst; ctx.lineWidth = 5; }
          else if (s[4] === "pata") { ctx.strokeStyle = P.ink; ctx.lineWidth = 3; }
          else { ctx.strokeStyle = P.ink; ctx.lineWidth = 5; }
          ctx.beginPath(); ctx.moveTo(X(s[0]), Y(s[1])); ctx.lineTo(X(s[2]), Y(s[3])); ctx.stroke();
        });
        ctx.strokeStyle = rgba(P.azul, P.oscuro ? .14 : .1); ctx.lineWidth = 1; ctx.beginPath();
        b.pts.forEach(function (p) { var d = p[1] == null ? 1.2 : p[1]; ctx.moveTo(X(rob.x), Y(rob.y)); ctx.lineTo(X(rob.x + Math.cos(p[0]) * d), Y(rob.y + Math.sin(p[0]) * d)); });
        ctx.stroke();
      }
      ctx.fillStyle = P.rojo;
      b.pts.forEach(function (p) { if (p[1] == null) return; var x = X(rob.x + Math.cos(p[0]) * p[1]), y = Y(rob.y + Math.sin(p[0]) * p[1]); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = P.azul; ctx.beginPath(); ctx.arc(X(rob.x), Y(rob.y), 0.14 * esc, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.sup; ctx.beginPath(); ctx.arc(X(rob.x), Y(rob.y), 0.05 * esc, 0, Math.PI * 2); ctx.fill();
      var medidos = b.pts.filter(function (p) { return p[1] != null; }).length;
      el.querySelector('[data-o="info"]').textContent = medidos + " de 230 sectores con medición. " + (b.perd ? b.perd + " se perdieron en la superficie oscura. " : "") + (b.vid ? b.vid + " atravesaron el vidrio y midieron lo que hay detrás. " : "") + "La cubierta de la mesa y la caja baja no aparecen.";
    }
    function mover(ev) {
      var r = L.cv.getBoundingClientRect(), W = L.w, H = L.h, m = 14, esc = Math.min((W - 2 * m) / Wm, (H - 2 * m) / Hm), ox = (W - Wm * esc) / 2, oy = (H - Hm * esc) / 2;
      rob.x = limitar((ev.clientX - r.left - ox) / esc, 0.2, Wm - 0.2); rob.y = limitar((ev.clientY - r.top - oy) / esc, 0.2, Hm - 0.2); dibujar();
    }
    var arr = false;
    L.cv.addEventListener("pointerdown", function (e) { arr = true; L.cv.setPointerCapture(e.pointerId); mover(e); });
    L.cv.addEventListener("pointermove", function (e) { if (arr) mover(e); });
    L.cv.addEventListener("pointerup", function () { arr = false; });
    L.cv.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
      e.preventDefault(); rob.x = limitar(rob.x + d[0] * 0.08, 0.2, Wm - 0.2); rob.y = limitar(rob.y + d[1] * 0.08, 0.2, Hm - 0.2); dibujar();
    });
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-m]"); if (!b) return; soloLaser = b.getAttribute("data-m") === "1"; el.querySelectorAll("[data-m]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); dibujar(); });
    dibujar();
  };

  /* ═══════════════════════════════════════════════════════════
     5. PID de una rueda
     ═══════════════════════════════════════════════════════════ */
  V.pid = function (el) {
    var P = paleta(), REF = 0.13, DT = 1 / 30, T = 6, K = 0.000913, TAU = 0.33;
    var st = { kp: 600, ki: 0, kd: 0, zona: false, accion: false };
    var PRE = { p: [1200, 0, 0], pi: [600, 2600, 0], agr: [1500, 9000, 0], pid: [1500, 9000, 25] };
    el.innerHTML = '<div class="chips" role="group" aria-label="Ejemplos">' +
      '<button type="button" class="chip" data-p="p" aria-pressed="false">Solo P</button><button type="button" class="chip" data-p="pi" aria-pressed="false">PI equilibrado</button><button type="button" class="chip" data-p="agr" aria-pressed="false">PI agresivo</button><button type="button" class="chip" data-p="pid" aria-pressed="false">PID, con D que amortigua</button></div>' +
      '<div class="deslizadores">' +
      '<label for="pid-p">P, reacciona al error de ahora<b class="num" data-v="kp"></b><input id="pid-p" type="range" min="0" max="3000" step="20" data-k="kp"></label>' +
      '<label for="pid-i">I, acumula el error pasado<b class="num" data-v="ki"></b><input id="pid-i" type="range" min="0" max="12000" step="100" data-k="ki"></label>' +
      '<label for="pid-d">D, mira hacia dónde va<b class="num" data-v="kd"></b><input id="pid-d" type="range" min="0" max="60" step="1" data-k="kd"></label></div>' +
      '<div class="casillas"><label><input type="checkbox" data-c="zona">Agregar zona muerta del driver</label><label><input type="checkbox" data-c="accion">Mostrar la señal al motor</label></div>' +
      '<div class="pid-l"></div>' +
      '<div class="lecturas"><div><span>Velocidad al final</span><b data-o="fin"></b></div><div><span>Error que queda</span><b data-o="err"></b></div><div><span>Sobreimpulso</span><b data-o="os"></b></div><div><span>Tiempo de subida</span><b data-o="tr"></b></div></div>' +
      '<p class="vnota">Modelo ilustrativo de una rueda con un retardo de primer orden, una ganancia y una constante de tiempo del orden de las identificadas en la tesis, y el PWM limitado a 255. Las ganancias de este simulador no son las del firmware, que usa otra escala y otra ley.</p>';
    var cont = el.querySelector(".pid-l"), L = lienzo(cont, 16 / 7, function () { dibujar(); });
    alTema(function () { P = paleta(); dibujar(); });
    function sim() {
      var y = 0, I = 0, ePrev = 0, out = [];
      for (var t = 0; t <= T + 1e-9; t += DT) {
        var e = REF - y;
        I += e * DT;
        var d = (e - ePrev) / DT; ePrev = e;
        var u = st.kp * e + st.ki * I + st.kd * d;
        var us = limitar(u, -255, 255);
        if (us !== u && st.ki) I -= e * DT;          /* integración condicional al saturar */
        var efectivo = us;
        if (st.zona) efectivo = Math.abs(us) < 60 ? 0 : us - Math.sign(us) * 60;
        y += DT / TAU * (K * efectivo * (st.zona ? 255 / 195 : 1) - y);
        out.push([t, y, us]);
      }
      return out;
    }
    function dibujar() {
      var d = sim(), ctx = L.ctx, W = L.w, H = L.h, ml = 52, mr = st.accion ? 44 : 14, mt = 14, mb = 26;
      var x = function (t) { return ml + t / T * (W - ml - mr); }, y = function (v) { return mt + (1 - v / 0.2) * (H - mt - mb); };
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      ctx.font = "11px IBM Plex Mono, monospace"; ctx.fillStyle = P.muted; ctx.strokeStyle = P.linea; ctx.lineWidth = 1;
      [0, 0.05, 0.1, 0.15, 0.2].forEach(function (v) { ctx.beginPath(); ctx.moveTo(ml, y(v)); ctx.lineTo(W - mr, y(v)); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(fmt(v, 2), ml - 6, y(v) + 4); });
      ctx.textAlign = "center"; for (var t = 0; t <= T; t++) ctx.fillText(t + " s", x(t), H - 8); ctx.textAlign = "start";
      ctx.save(); ctx.translate(12, mt + (H - mt - mb) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText("m/s", 0, 0); ctx.restore();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = P.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ml, y(REF)); ctx.lineTo(W - mr, y(REF)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = P.muted; ctx.fillText("referencia 0,13 m/s", W - mr - 128, y(REF) - 6);
      if (st.accion) {
        ctx.strokeStyle = rgba(P.s2, .8); ctx.lineWidth = 1.5; ctx.beginPath();
        d.forEach(function (p, i) { var yy = mt + (1 - (p[2] + 255) / 510) * (H - mt - mb); if (i) ctx.lineTo(x(p[0]), yy); else ctx.moveTo(x(p[0]), yy); }); ctx.stroke();
        ctx.fillStyle = P.s2; ctx.textAlign = "left"; ctx.fillText("PWM", W - mr + 6, mt + 10); ctx.fillText("255", W - mr + 6, mt + 24); ctx.fillText("0", W - mr + 6, mt + (H - mt - mb) / 2 + 4);
      }
      ctx.strokeStyle = P.s1; ctx.lineWidth = 2.4; ctx.beginPath();
      d.forEach(function (p, i) { if (i) ctx.lineTo(x(p[0]), y(p[1])); else ctx.moveTo(x(p[0]), y(p[1])); }); ctx.stroke();
      var finv = d.slice(-30).reduce(function (a, p) { return a + p[1]; }, 0) / 30, maxv = Math.max.apply(null, d.map(function (p) { return p[1]; }));
      var t10 = null, t90 = null; d.forEach(function (p) { if (t10 == null && p[1] >= .1 * REF) t10 = p[0]; if (t90 == null && p[1] >= .9 * REF) t90 = p[0]; });
      var o = function (k) { return el.querySelector('[data-o="' + k + '"]'); };
      o("fin").textContent = fmt(finv, 3) + " m/s"; o("err").textContent = fmt(Math.abs(REF - finv), 3) + " m/s";
      o("os").textContent = maxv > REF * 1.005 ? fmt((maxv - REF) / REF * 100, 0) + " %" : "no hay";
      o("tr").textContent = (t10 != null && t90 != null) ? fmt(t90 - t10, 2) + " s" : "no llega";
      el.querySelectorAll("[data-v]").forEach(function (b) { b.textContent = st[b.getAttribute("data-v")]; });
      el.querySelectorAll("input[data-k]").forEach(function (i) { i.value = st[i.getAttribute("data-k")]; });
    }
    el.addEventListener("input", function (e) { var k = e.target.getAttribute("data-k"); if (!k) return; st[k] = parseFloat(e.target.value); el.querySelectorAll("[data-p]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); dibujar(); });
    el.addEventListener("change", function (e) { var c = e.target.getAttribute("data-c"); if (!c) return; st[c] = e.target.checked; dibujar(); });
    el.addEventListener("click", function (e) { var p = e.target.closest("[data-p]"); if (!p) return; var v = PRE[p.getAttribute("data-p")]; st.kp = v[0]; st.ki = v[1]; st.kd = v[2]; el.querySelectorAll("[data-p]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === p)); }); dibujar(); });
    dibujar();
  };

  /* ═══════════════════════════════════════════════════════════
     6. Enjambre de partículas
     ═══════════════════════════════════════════════════════════ */
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
      '<p class="vnota">Ilustración en dos dimensiones para poder dibujarla. En la tesis cada partícula tiene tres coordenadas, Kp, Kd y Ki, y su costo se calcula simulando el modelo de cada rueda. Se usan los mismos parámetros del script, factor de constricción 0,7298, coeficientes 2,05 y peso de inercia que baja de 1 a 0.</p>';
    var cont = el.querySelector(".pso-l"), L = lienzo(cont, 16 / 9, function () { mapa = null; dibujar(); });
    alTema(function () { P = paleta(); mapa = null; dibujar(); });
    function fondo(W, H) {
      var c = document.createElement("canvas"); c.width = 160; c.height = 90; var cx = c.getContext("2d"), img = cx.createImageData(160, 90);
      var mn = Infinity, mx = -Infinity, vals = [];
      for (var j = 0; j < 90; j++) for (var i = 0; i < 160; i++) { var v = costo(i / 159, j / 89); vals.push(v); mn = Math.min(mn, v); mx = Math.max(mx, v); }
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
      parts.forEach(function (p) {
        ctx.strokeStyle = rgba(P.ink, .25); ctx.lineWidth = 1; ctx.beginPath();
        p.tr.forEach(function (q, i) { if (i) ctx.lineTo(q[0] * W, q[1] * H); else ctx.moveTo(q[0] * W, q[1] * H); }); ctx.stroke();
        ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = P.sup; ctx.lineWidth = 1.5; ctx.stroke();
      });
      if (gBest) { ctx.fillStyle = P.rojo; ctx.strokeStyle = P.sup; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gBest[0] * W, gBest[1] * H, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      ctx.font = "11px IBM Plex Mono, monospace"; ctx.fillStyle = rgba(P.sup, .85); ctx.fillRect(W - 98, H - 22, 94, 18); ctx.fillRect(2, 8, 18, 90); ctx.fillStyle = P.ink; ctx.fillText("ganancia 1 →", W - 92, H - 8); ctx.save(); ctx.translate(15, 92); ctx.rotate(-Math.PI / 2); ctx.fillText("ganancia 2 →", 0, 0); ctx.restore();
      el.querySelector('[data-o="e"]').textContent = "Generación " + gen + " de " + GMAX + ". Mejor costo " + fmt(gCost, 3) + ".";
    }
    var acum = 0;
    var B = bucle(el, function (dt) { acum += dt; if (acum > 0.12) { acum = 0; if (!generacion()) { B.pausa(); var b = el.querySelector('[data-a="play"]'); b.textContent = "Buscar de nuevo"; b.setAttribute("aria-pressed", "false"); } dibujar(); } });
    el.addEventListener("click", function (e) {
      var a = e.target.closest("[data-a]"); if (!a) return; var k = a.getAttribute("data-a"), bp = el.querySelector('[data-a="play"]');
      if (k === "play") { if (B.activo) { B.pausa(); bp.textContent = "Seguir"; bp.setAttribute("aria-pressed", "false"); } else { if (gen >= GMAX) reset(); B.play(); bp.textContent = "Pausar"; bp.setAttribute("aria-pressed", "true"); } }
      if (k === "paso") { B.pausa(); bp.textContent = "Seguir"; bp.setAttribute("aria-pressed", "false"); generacion(); dibujar(); }
      if (k === "reset") { B.pausa(); bp.textContent = "Buscar"; bp.setAttribute("aria-pressed", "false"); reset(); dibujar(); }
    });
    reset(); dibujar();
  };

  /* ═══════════════════════════════════════════════════════════
     7. Inflación y huella del robot
     ═══════════════════════════════════════════════════════════ */
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
      L.cv.setAttribute("aria-label", "Mapa de costos visto desde arriba. Robot en x " + fmt(st.x, 2) + " m, y " + fmt(st.y, 2) + " m, ángulo " + st.ang + " grados. " + msg);
      el.querySelectorAll("[data-v]").forEach(function (b) { var k = b.getAttribute("data-v"); b.textContent = k === "ang" ? st.ang + "°" : fmt(st[k], 2) + " m"; });
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
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-r]"); if (!b) return; st.infl = parseFloat(b.getAttribute("data-r")); el.querySelectorAll("[data-r]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); dibujar(); });
    distancias(); dibujar();
    el.estadoSim = function () { var ev = evaluar(); return { st: { x: st.x, y: st.y, ang: st.ang, infl: st.infl }, fisico: ev.fisico, margen: ev.margen, inscritas: ev.inscritas, costoCentro: ev.costoCentro, celdasFisicas: ev.celdasFisicas.length }; };
    el.fijarSim = function (o) { Object.keys(o).forEach(function (k) { st[k] = o[k]; }); dibujar(); };
  };

  /* ═══════════════════════════════════════════════════════════
     8. Ventana dinámica (DWB)
     ═══════════════════════════════════════════════════════════ */
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
      '<div class="dw-l"></div>' +
      '<div class="vley"><span><i class="lin" style="background:#13A538"></i>ruta global</span><span><i class="lin azul"></i>trayectoria elegida</span><span><i class="lin" style="background:var(--line-2)"></i>candidatas, más oscuras si tienen mejor puntaje</span><span><i class="lin rojo"></i>descartadas por chocar</span><span><i class="cu" style="background:none;border:1px dashed var(--muted);border-radius:50%"></i>zona donde el obstáculo penaliza</span></div>' +
      '<div class="tabla-env"><table class="tabla dw-tabla"><caption>Puntaje de la trayectoria elegida, menor es mejor. Cada término es peso por medida.</caption><thead><tr><th>Criterio</th><th class="n">Medida</th><th class="n">Peso</th><th class="n">Aporte</th></tr></thead><tbody data-o="tabla"></tbody></table></div>' +
      '<p class="vestado" aria-live="polite" data-o="msg"></p>' +
      '<p class="vnota" id="' + uid + '-ayuda">Ilustrativo. Se prueban 7 velocidades lineales entre 0 y 0,15 m/s y 15 de giro entre ±0,35 rad/s, los límites que DWB tiene configurados en el robot real. Aquí cada candidata se proyecta 1,7 s hacia adelante para que el dibujo se lea, la configuración del robot real usa 3,5 s. Los pesos, la zona de 0,35 m donde el obstáculo penaliza y el margen de choque de 0,12 m son propios de esta demostración y no equivalen a las escalas de los críticos del robot real. El obstáculo aparece después de planificar la ruta global, por eso la ruta lo atraviesa. Muévelo con los deslizadores, arrastrándolo o con las flechas del teclado cuando el dibujo tiene el foco.</p>';
    var cont = el.querySelector(".dw-l"), L = lienzo(cont, Wm / Hm, function () { dibujar(); });
    L.cv.classList.add("arrastrable"); L.cv.tabIndex = 0; L.cv.setAttribute("role", "img"); L.cv.setAttribute("aria-describedby", uid + "-ayuda");
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
    function dibujar() {
      var ctx = L.ctx, W = L.w, H = L.h, esc = Math.min(W / Wm, H / Hm);
      function X(x) { return x * esc; } function Y(y) { return y * esc; }
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.sup; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = P.linea; ctx.lineWidth = 1; for (var g = 0; g <= 20; g++) { ctx.beginPath(); ctx.moveTo(X(g * .1), 0); ctx.lineTo(X(g * .1), H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, Y(g * .1)); ctx.lineTo(W, Y(g * .1)); ctx.stroke(); }
      ctx.strokeStyle = P.oscuro ? "#5BE07A" : "#13A538"; ctx.lineWidth = 3; ctx.beginPath(); ruta.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.stroke();
      var cs = evaluarCandidatas(), val = cs.filter(function (c) { return !c.choca; }), mn = Infinity, mx = -Infinity;
      val.forEach(function (c) { mn = Math.min(mn, c.s); mx = Math.max(mx, c.s); });
      var mejor = null; val.forEach(function (c) { if (!mejor || c.s < mejor.s) mejor = c; });
      cs.forEach(function (c) {
        if (c === mejor) return;
        if (c.choca) { ctx.strokeStyle = rgba(P.rojo, .45); ctx.lineWidth = 1; ctx.setLineDash([3, 3]); }
        else { var k = 1 - (c.s - mn) / Math.max(1e-9, mx - mn); ctx.strokeStyle = rgba(P.ink, 0.08 + 0.45 * k * k); ctx.lineWidth = 1.2; ctx.setLineDash([]); }
        ctx.beginPath(); c.pts.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.stroke();
      });
      ctx.setLineDash([]);
      if (mejor) { ctx.strokeStyle = P.azul; ctx.lineWidth = 4; ctx.beginPath(); mejor.pts.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.stroke(); }
      /* zona de influencia del obstáculo en esta demostración */
      ctx.setLineDash([4, 4]); ctx.strokeStyle = P.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(obs.x), Y(obs.y), (obs.r + D_INFL) * esc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = P.obst; ctx.beginPath(); ctx.arc(X(obs.x), Y(obs.y), obs.r * esc, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.sup; ctx.font = "700 11px Atkinson Hyperlegible, sans-serif"; ctx.textAlign = "center"; ctx.fillText("obstáculo", X(obs.x), Y(obs.y) + 4); ctx.textAlign = "start";
      ctx.save(); ctx.translate(X(rob.x), Y(rob.y)); ctx.rotate(rob.th); ctx.fillStyle = P.azul; ctx.fillRect(-0.08 * esc, -0.13 * esc, 0.28 * esc, 0.26 * esc); ctx.fillStyle = P.verdeV; ctx.beginPath(); ctx.moveTo(0.24 * esc, 0); ctx.lineTo(0.16 * esc, -6); ctx.lineTo(0.16 * esc, 6); ctx.fill(); ctx.restore();
      var meta = ruta[ruta.length - 1]; ctx.fillStyle = P.rojo; ctx.beginPath(); ctx.arc(X(meta[0]), Y(meta[1]), 6, 0, Math.PI * 2); ctx.fill();
      /* lecturas */
      var dminTodas = Math.min.apply(null, cs.map(function (c) { return c.dmin; }));
      var influyen = cs.filter(function (c) { return !c.choca && c.cObs > 0; }).length;
      var msg;
      if (!mejor) msg = "Todas las candidatas chocan. Nav2 activaría una recuperación.";
      else {
        msg = "Elige " + fmt(mejor.v, 3) + " m/s y " + fmt(mejor.w, 2) + " rad/s. " + (cs.length - val.length) + " de " + cs.length + " candidatas quedan descartadas por chocar. ";
        if (dminTodas >= D_INFL) msg += "El obstáculo no aporta nada: ninguna candidata se acerca a menos de " + fmt(dminTodas, 2) + " m de su borde, y solo penaliza a menos de " + fmt(D_INFL, 2) + " m. En 1,7 s a 0,15 m/s el robot recorre como máximo " + fmt(VMAX * SIMT, 2) + " m, así que cambiar su peso no altera la elección.";
        else if (!influyen) msg += "Las candidatas que se acercan al obstáculo quedan descartadas por chocar. Las válidas no reciben penalización, así que su peso no cambia la elección.";
        else msg += influyen + " candidatas válidas pasan a menos de " + fmt(D_INFL, 2) + " m del obstáculo y pagan por ello. Con más peso, la elección tiende a alejarse del obstáculo o a frenar.";
      }
      el.querySelector('[data-o="msg"]').textContent = msg;
      L.cv.setAttribute("aria-label", "Trayectorias candidatas de la ventana dinámica. Obstáculo en x " + fmt(obs.x, 2) + " m, y " + fmt(obs.y, 2) + " m. " + msg);
      el.querySelector('[data-o="tabla"]').innerHTML = mejor ?
        '<tr><th>Distancia a la ruta al final</th><td class="n">' + fmt(mejor.dr, 3) + ' m</td><td class="n">' + st.ruta + '</td><td class="n">' + fmt(mejor.partes.ruta, 2) + '</td></tr>' +
        '<tr><th>Distancia a la meta al final, por 0,5</th><td class="n">' + fmt(mejor.dm, 3) + ' m</td><td class="n">' + st.meta + '</td><td class="n">' + fmt(mejor.partes.meta, 2) + '</td></tr>' +
        '<tr><th>Cercanía al obstáculo, ' + fmt(D_INFL, 2) + ' m menos la distancia mínima, por 3</th><td class="n">' + (mejor.cObs > 0 ? fmt(mejor.cObs, 3) : '0, a ' + fmt(mejor.dmin, 2) + ' m') + '</td><td class="n">' + st.obst + '</td><td class="n">' + fmt(mejor.partes.obst, 2) + '</td></tr>' +
        '<tr class="destacada"><th>Total</th><td></td><td></td><td class="n">' + fmt(mejor.s, 2) + '</td></tr>' : '<tr><td colspan="4">Sin trayectoria válida.</td></tr>';
      el.querySelectorAll("[data-v]").forEach(function (b) { var k = b.getAttribute("data-v"); b.textContent = k === "ox" ? fmt(obs.x, 2) + " m" : (k === "oy" ? fmt(obs.y, 2) + " m" : st[k]); });
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
})();
