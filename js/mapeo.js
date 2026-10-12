/*
  Capítulo 05: modelos didácticos locales, sin dependencias.
  Los escenarios y el optimizador JavaScript son ilustrativos: no ejecutan
  SLAM Toolbox ni Ceres, ni reproducen registros del prototipo.
*/
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  var M = window.MAPEO = {}, TAU = 2 * Math.PI;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(n, d) { return U ? U.fmt(n, d) : n.toFixed(d == null ? 2 : d).replace(".", ","); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function wrap(x) { return Math.atan2(Math.sin(x), Math.cos(x)); }
  /* Las figuras exportadas a img/diagramas llevan sus propios estilos. En la página no se incluyen:
     un <style> dentro de un SVG en línea no queda aislado y afectaría a todo el documento,
     también en el tema oscuro. Allí los colores vienen de css/mapeo.css. */
  M.svgEstatico = false;
  function svg(w, h, title, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" class="mp-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(title) + '">' +
      (M.svgEstatico ? '<style>text{font-family:Arial,sans-serif;fill:#1e2632}.mp-bg{fill:#fff}.mp-room{fill:#eef2f8}.mp-beam{stroke:#004eaa;stroke-width:1;opacity:.15}.mp-border{stroke:#cbd3de}.mp-muted{fill:#5a6371}.mp-blue{stroke:#004eaa}.mp-green{stroke:#3a6b0e}.mp-orange{stroke:#9a4505}.mp-node{fill:#004eaa;stroke:#fff;stroke-width:1.2}.mp-selected{fill:#3a6b0e;stroke:#1e2632;stroke-width:2}</style>' : '') +
      '<rect class="mp-bg" width="' + w + '" height="' + h + '"/>' + body + '</svg>';
  }
  function txt(x, y, s, size, cls) { return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 14) + '" class="' + (cls || "mp-ink") + '">' + esc(s) + '</text>'; }
  function line(x1, y1, x2, y2, cls, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + cls + '" stroke-width="2"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; }
  function range(id, label, min, max, step, val) { return '<label for="' + id + '">' + label + '<output data-out="' + id + '" for="' + id + '"></output><input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></label>'; }
  function readings(names) { return '<div class="mp-readings">' + names.map(function (n, i) { return '<div><span>' + n + '</span><b data-read="' + i + '"></b></div>'; }).join("") + '</div>'; }
  function pressed(el, attr, selected) { el.querySelectorAll("[" + attr + "]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute(attr) === String(selected))); }); }

  /* Geometría LiDAR: una medición ideal termina en el primer impacto. */
  M.interseccion = function (o, d, s) {
    var ex = s[2] - s[0], ey = s[3] - s[1], den = d.x * ey - d.y * ex;
    if (Math.abs(den) < 1e-9) return null;
    var ax = s[0] - o.x, ay = s[1] - o.y;
    var t = (ax * ey - ay * ex) / den, u = (ax * d.y - ay * d.x) / den;
    return t > 1e-8 && u >= -1e-9 && u <= 1 + 1e-9 ? t : null;
  };
  function rectSeg(x, y, w, h, tipo) { return [[x, y, x + w, y, tipo], [x + w, y, x + w, y + h, tipo], [x + w, y + h, x, y + h, tipo], [x, y + h, x, y, tipo]]; }
  M.segmentosLidar = function () {
    var s = [[0, 0, 4, 0, "pared"], [4, 0, 4, 2.6, "pared"], [0, 2.6, 4, 2.6, "pared"],
      [0, 0, 0, 1, "pared"], [0, 1, 0, 1.9, "vidrio"], [0, 1.9, 0, 2.6, "pared"],
      [2.6, 0, 2.6, 0.9, "pared"], [-0.6, 0.8, -0.6, 2.1, "exterior"]];
    s = s.concat(rectSeg(3, 1.6, .8, .8, "oscuro"));
    [[1.7, 1.75], [2.5, 1.75], [1.7, 2.35], [2.5, 2.35]].forEach(function (p) { s = s.concat(rectSeg(p[0] - .025, p[1] - .025, .05, .05, "pata")); });
    return s;
  };
  M.rayoLidar = function (o, a, segmentos, caso, k) {
    var d = { x: Math.cos(a), y: Math.sin(a) }, impactos = [];
    segmentos.forEach(function (s) { var t = M.interseccion(o, d, s); if (t !== null) impactos.push({ d: t, tipo: s[4] }); });
    impactos.sort(function (a, b) { return a.d - b.d; });
    if (!impactos.length) return { a: a, d: null, motivo: "sin retorno" };
    var hit = impactos[0], motivo = "primer impacto";
    if (caso === "vidrio" && hit.tipo === "vidrio") {
      /* Tres respuestas posibles, alternadas para ilustrarlas; no probabilidades. */
      if (k % 3 === 2) return { a: a, d: null, motivo: "vidrio sin retorno" };
      if (k % 3 === 1) {
        hit = impactos.filter(function (p) { return p.tipo !== "vidrio"; })[0];
        if (!hit) return { a: a, d: null, motivo: "vidrio sin retorno" };
        motivo = "retorno detrás del vidrio";
      } else motivo = "retorno del vidrio";
    }
    if (caso === "oscuro" && hit.tipo === "oscuro" && k % 2 === 0) return { a: a, d: null, motivo: "absorción ilustrativa" };
    if (hit.d < .15 || hit.d > 12) return { a: a, d: null, motivo: "fuera de rango" };
    return { a: a, d: hit.d, tipo: hit.tipo, motivo: motivo };
  };
  M.barridoLidar = function (o, caso) {
    var s = M.segmentosLidar(), out = [];
    for (var k = 0; k < 230; k++) out.push(M.rayoLidar(o, (k + .5) / 230 * TAU, s, caso, k));
    return out;
  };
  function distanciaSegmento(o, s) {
    var dx = s[2] - s[0], dy = s[3] - s[1], t = clamp(((o.x - s[0]) * dx + (o.y - s[1]) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(o.x - s[0] - t * dx, o.y - s[1] - t * dy);
  }
  M.poseLidarValida = function (p) {
    if (p.x < .15 || p.x > 3.85 || p.y < .15 || p.y > 2.45) return false;
    if (p.x > 3 - .14 && p.x < 3.8 + .14 && p.y > 1.6 - .14 && p.y < 2.4 + .14) return false;
    /* La caja baja es un obstáculo físico aunque el láser pase por encima. */
    if (p.x > 1.6 - .14 && p.x < 1.9 + .14 && p.y > .35 - .14 && p.y < .60 + .14) return false;
    return !M.segmentosLidar().some(function (s) { return s[4] !== "exterior" && distanciaSegmento(p, s) < .14; });
  };
  M.moverLidar = function (p, q) {
    var n = Math.max(1, Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / .025)), out = { x: p.x, y: p.y };
    for (var i = 1; i <= n; i++) {
      var r = { x: p.x + (q.x - p.x) * i / n, y: p.y + (q.y - p.y) * i / n };
      if (!M.poseLidarValida(r)) return { x: out.x, y: out.y, bloqueado: true };
      out = r;
    }
    return out;
  };
  M.lidarLateralSVG = function () {
    var s = line(20, 160, 340, 160, "mp-border") + '<rect x="125" y="40" width="125" height="10" fill="#b4bcc8"/><rect x="135" y="50" width="8" height="110" fill="#3b4250"/><rect x="235" y="50" width="8" height="110" fill="#3b4250"/><rect x="287" y="138" width="35" height="22" fill="#eda100"/>';
    s += '<rect x="33" y="118" width="54" height="42" rx="8" fill="#004eaa"/>';
    s += line(65, 110, 338, 110, "mp-blue", "6 4") + txt(15, 18, "Solo un plano de altura", 16) + txt(148, 35, "cubierta", 13) + txt(151, 83, "patas", 13) + txt(277, 132, "caja", 13) + txt(88, 104, "láser", 13);
    return svg(360, 185, "El láser cruza las patas, pasa bajo la cubierta de la mesa y sobre una caja baja", s);
  };
  M.lidarSVG = function (rob, caso, solo, rays) {
    var X = function (x) { return 82 + x * 94; }, Y = function (y) { return 30 + y * 94; }, b = "";
    if (!solo) {
      b += '<rect x="' + X(0) + '" y="' + Y(0) + '" width="376" height="244.4" class="mp-room"/>';
      b += '<rect x="' + X(1.62) + '" y="' + Y(1.67) + '" width="90.2" height="71.4" fill="#cdd3dc" fill-opacity=".35" stroke="' + (caso === "altura" ? "#004eaa" : "#5a6371") + '" stroke-width="' + (caso === "altura" ? 3 : 1) + '" stroke-dasharray="5 4"/>';
      b += '<rect x="' + X(1.6) + '" y="' + Y(.35) + '" width="28.2" height="23.5" fill="#eda100" fill-opacity=".35" stroke="#9a4505" stroke-width="' + (caso === "altura" ? 3 : 1) + '" stroke-dasharray="5 4"/>';
      M.segmentosLidar().forEach(function (s) {
        var color = s[4] === "vidrio" ? "#2a78d6" : "#3b4250", dash = s[4] === "vidrio" ? ' stroke-dasharray="6 4"' : "";
        b += '<line x1="' + X(s[0]) + '" y1="' + Y(s[1]) + '" x2="' + X(s[2]) + '" y2="' + Y(s[3]) + '" class="' + (s[4] === "vidrio" ? "mp-glass" : "mp-wall") + '" stroke="' + color + '" stroke-width="' + (s[4] === "pata" ? 3 : 4) + '"' + dash + '/>';
      });
      b += txt(X(1.62), Y(1.58), "mesa", 16) + txt(X(1.6), Y(.25), "caja baja", 16) + txt(X(3.06), Y(2.05), "oscuro", 16);
      /* Rótulos verticales: «vidrio» junto al tramo de vidrio y «exterior» junto a la pared de afuera. */
      b += '<text class="mp-ink" font-size="15" text-anchor="middle" transform="translate(' + (X(0) - 9) + ' ' + Y(1.45) + ') rotate(-90)">vidrio</text>';
      b += '<text class="mp-muted" font-size="13" text-anchor="middle" transform="translate(' + (X(-.6) - 8) + ' ' + Y(1.45) + ') rotate(-90)">exterior</text>';
      rays.forEach(function (p) { if (p.d !== null) b += line(X(rob.x), Y(rob.y), X(rob.x + Math.cos(p.a) * p.d), Y(rob.y + Math.sin(p.a) * p.d), "mp-beam"); });
    }
    rays.forEach(function (p) { if (p.d !== null) b += '<circle cx="' + X(rob.x + Math.cos(p.a) * p.d) + '" cy="' + Y(rob.y + Math.sin(p.a) * p.d) + '" r="2.4" class="mp-return" fill="#b42318"/>'; });
    /* El robot: un círculo azul con el LiDAR al centro. El sensor mide en 360°, por eso no se dibuja una dirección. */
    b += '<circle cx="' + X(rob.x) + '" cy="' + Y(rob.y) + '" r="13" class="mp-robot"/><circle cx="' + X(rob.x) + '" cy="' + Y(rob.y) + '" r="4.5" class="mp-sensor"/>';
    /* Escala gráfica de 1 m, igual en las dos vistas. */
    b += '<path d="M' + X(3) + ' 300v-7M' + X(3) + ' 296.5H' + X(4) + 'M' + X(4) + ' 300v-7" class="mp-escala" fill="none" stroke-width="2"/>' + '<text class="mp-ink" font-size="14" text-anchor="middle" x="' + X(3.5) + '" y="316">1 m</text>';
    b += txt(16, 316, solo ? "Solo puntos de este barrido · no es un mapa" : "Vista superior · escenario de ejemplo", 16);
    return svg(490, 324, "Barrido LiDAR y robot. Controles de posición debajo del dibujo", b);
  };
  V.lidar = function (el) {
    var rob = { x: 1, y: 1.3 }, caso = "ideal", solo = false, aviso = "";
    var casos = { ideal: "Ideal y sombras", altura: "Mesa y caja baja", vidrio: "Vidrio", oscuro: "Superficie oscura" };
    var notas = {
      ideal: "Cada rayo devuelve el primer impacto válido. Detrás de un obstáculo queda una sombra que este barrido no observa.",
      altura: "A esta altura se detectan las patas, pero no la cubierta ni la caja baja. No aparecer en el barrido no significa que el robot pueda pasar.",
      vidrio: "Ejemplos posibles: retorno en el vidrio, retorno detrás de él o lectura ausente. Se alternan para enseñar el problema; no representan tasas medidas.",
      oscuro: "Se ilustran retornos débiles o ausentes en una superficie oscura. El comportamiento real depende del material, la distancia y el ángulo; no hay una probabilidad calibrada."
    };
    el.innerHTML = '<div class="mp-panel"><div class="mp-cases" role="group" aria-label="Casos del LiDAR">' + Object.keys(casos).map(function (k) { return '<button class="vbtn sec" type="button" data-caso="' + k + '" aria-pressed="' + (k === caso) + '">' + casos[k] + '</button>'; }).join("") + '</div>' +
      '<div class="mp-controls" role="group" aria-label="Vista del barrido"><button class="vbtn sec" type="button" data-vista="sala" aria-pressed="true">Sala y láser</button><button class="vbtn sec" type="button" data-vista="puntos" aria-pressed="false">Solo puntos</button><button class="vbtn sec" type="button" data-reset>Restablecer posición</button></div>' +
      '<div class="mp-chart mp-lidar-scene" tabindex="0" role="group" aria-label="Mover el robot con las flechas o arrastrar en el dibujo"></div>' +
      '<div class="mp-legend"><span><i class="mp-dot mp-dot-rojo" aria-hidden="true"></i>punto medido: donde volvió el láser</span><span><i class="mp-raya" aria-hidden="true"></i>rayo que llegó a un obstáculo</span><span><i class="mp-dot mp-dot-azul" aria-hidden="true"></i>robot con el LiDAR al centro</span><span><i class="mp-contorno" aria-hidden="true"></i>objeto fuera de la altura del láser</span><span><i class="mp-raya mp-raya-vidrio" aria-hidden="true"></i>vidrio</span></div>' +
      '<div class="mp-ranges">' + range("mp-lidar-x", "Posición horizontal", .15, 3.85, .01, rob.x) + range("mp-lidar-y", "Posición vertical en el dibujo", .15, 2.45, .01, rob.y) + '</div>' +
      readings(["Sectores con retorno", "Sectores sin retorno"]) +
      '<p class="mp-status" aria-live="polite"></p><figure class="mp-fig mp-lateral">' + M.lidarLateralSVG() + '<figcaption>Vista lateral de ejemplo. El plano cruza las patas; no cruza la cubierta ni la caja. No representa las cotas del prototipo.</figcaption></figure>' +
      '<p class="vnota">230 sectores por vuelta, rango 0,15–12 m, según el nodo descrito en la tesis. La escena es un modelo idealizado, sin ruido ni movimiento durante el barrido. La posición del robot se conoce en esta ilustración; el LiDAR solo no resuelve su localización. Los dos dibujos usan la misma referencia para comparar.</p></div>';
    var chart = el.querySelector(".mp-lidar-scene");
    function draw() {
      var rays = M.barridoLidar(rob, caso), n = rays.filter(function (r) { return r.d !== null; }).length;
      chart.innerHTML = M.lidarSVG(rob, caso, solo, rays);
      el.querySelector("#mp-lidar-x").value = rob.x; el.querySelector("#mp-lidar-y").value = rob.y;
      el.querySelector('[data-out="mp-lidar-x"]').textContent = fmt(rob.x, 2) + " m";
      el.querySelector('[data-out="mp-lidar-y"]').textContent = fmt(rob.y, 2) + " m";
      el.querySelector('[data-read="0"]').textContent = n + " / 230";
      el.querySelector('[data-read="1"]').textContent = 230 - n;
      el.querySelector(".mp-status").textContent = notas[caso] + (aviso ? " " + aviso : "");
    }
    function move(x, y) {
      var p = M.moverLidar(rob, { x: clamp(x, .15, 3.85), y: clamp(y, .15, 2.45) });
      aviso = p.bloqueado ? "Movimiento detenido por un obstáculo físico." : "";
      rob = { x: p.x, y: p.y }; draw();
    }
    var dragging = false;
    function point(e) {
      var r = chart.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0)) return;
      move(((e.clientX - r.left) / r.width * 490 - 82) / 94, ((e.clientY - r.top) / r.height * 324 - 30) / 94);
    }
    chart.addEventListener("pointerdown", function (e) { dragging = true; chart.focus(); if (chart.setPointerCapture) chart.setPointerCapture(e.pointerId); point(e); });
    chart.addEventListener("pointermove", function (e) { if (dragging) point(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) { chart.addEventListener(name, function () { dragging = false; }); });
    chart.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: [-.08, 0], ArrowRight: [.08, 0], ArrowUp: [0, -.08], ArrowDown: [0, .08] }[e.key];
      if (d) { e.preventDefault(); move(rob.x + d[0], rob.y + d[1]); }
    });
    el.addEventListener("input", function (e) {
      if (e.target.id === "mp-lidar-x") move(+e.target.value, rob.y);
      if (e.target.id === "mp-lidar-y") move(rob.x, +e.target.value);
    });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-caso], [data-vista], [data-reset]"); if (!b) return;
      if (b.hasAttribute("data-caso")) { caso = b.getAttribute("data-caso"); aviso = ""; pressed(el, "data-caso", caso); }
      if (b.hasAttribute("data-vista")) { solo = b.getAttribute("data-vista") === "puntos"; pressed(el, "data-vista", solo ? "puntos" : "sala"); }
      if (b.hasAttribute("data-reset")) { rob = { x: 1, y: 1.3 }; aviso = ""; }
      draw();
    });
    el.estadoSim = function () { return { robot: rob, caso: caso, solo: solo, barrido: M.barridoLidar(rob, caso) }; };
    draw();
  };

  /* Rejilla: recorrido discreto de un rayo, detenido en la primera pared. */
  M.rayoCeldas = function (x0, y0, x1, y1) {
    var out = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (;;) {
      out.push([x0, y0]); if (x0 === x1 && y0 === y1) return out;
      var e = 2 * err; if (e >= dy) { err += dy; x0 += sx; } if (e <= dx) { err += dx; y0 += sy; }
    }
  };
  M.rejilla = function (fase) {
    var C = 16, F = 10, data = new Array(C * F).fill(-1), wall = new Array(C * F).fill(false);
    for (var y = 0; y < F; y++) for (var x = 0; x < C; x++) wall[y * C + x] = x === 0 || y === 0 || x === C - 1 || y === F - 1 || (x === 10 && y >= 2 && y <= 7);
    function ray(x, y, tx, ty) {
      var cells = M.rayoCeldas(x, y, tx, ty);
      for (var k = 0; k < cells.length; k++) { var i = cells[k][1] * C + cells[k][0]; data[i] = wall[i] ? 100 : 0; if (wall[i]) break; }
    }
    function scan(x, y) {
      for (var col = 0; col < C; col++) { ray(x, y, col, 0); ray(x, y, col, F - 1); }
      for (var row = 0; row < F; row++) { ray(x, y, 0, row); ray(x, y, C - 1, row); }
    }
    if (fase >= 1) ray(2, 5, 15, 5);
    if (fase >= 2) scan(2, 5);
    if (fase >= 3) scan(13, 5);
    return { C: C, F: F, data: data, fase: fase, origen: fase >= 3 ? [13, 5] : [2, 5] };
  };
  /* Índice de cobertura libre de la tesis (Ec. 5.4): las celdas ocupadas no cuentan. */
  M.indiceCobertura = function (libres, desconocidas) { return libres + desconocidas > 0 ? libres / (libres + desconocidas) : 0; };
  M.rejillaSVG = function (g, selected, interactive) {
    var s = "", colors = { "-1": "#aeb6c2", "0": "#fff", "100": "#222831" };
    for (var i = 0; i < g.data.length; i++) {
      var val = g.data[i], col = i % g.C, row = Math.floor(i / g.C);
      s += '<rect x="' + (20 + 20 * col) + '" y="' + (20 + 20 * row) + '" width="20" height="20" fill="' + colors[val] + '" stroke="#8794a8" stroke-width=".6"' +
        (interactive ? ' class="mp-grid-cell" data-cell="' + i + '" role="button" tabindex="' + (i === selected ? 0 : -1) + '" aria-pressed="' + (i === selected) + '" aria-label="Columna ' + col + ', fila ' + row + ': ' + (val === -1 ? "desconocida" : val === 0 ? "libre" : "ocupada") + ', valor ' + val + '"' : "") + '/>';
    }
    if (selected != null) s += '<rect x="' + (20 + 20 * (selected % g.C)) + '" y="' + (20 + 20 * Math.floor(selected / g.C)) + '" width="20" height="20" fill="none" stroke="#004eaa" stroke-width="3" pointer-events="none"/>';
    if (g.fase === 1) s += '<line x1="70" y1="130" x2="230" y2="130" stroke="#004eaa" stroke-width="2" pointer-events="none"/>';
    if (g.data.some(function (v) { return v !== -1; })) s += '<circle cx="' + (30 + 20 * g.origen[0]) + '" cy="' + (30 + 20 * g.origen[1]) + '" r="6" fill="#004eaa" stroke="#fff" pointer-events="none"/>';
    s += txt(20, 242, "Cada celda: 5 × 5 cm", 14) + txt(20, 264, "16 columnas × 10 filas · ejemplo ampliado", 13);
    return svg(360, 280, "Rejilla de ocupación: blanco libre, negro ocupado, gris desconocido", s).replace('role="img"', 'role="' + (interactive ? "group" : "img") + '"');
  };
  V.rejilla = function (el) {
    var fase = 0, selected = 5 * 16 + 10, g;
    var labels = ["0 · Sin observaciones", "1 · Un rayo", "2 · Un barrido", "3 · Otra posición"];
    var notes = ["Todo es desconocido: todavía no hay evidencia.", "El rayo atraviesa espacio libre y termina en la pared. Detrás de la pared no hay evidencia de este rayo.", "Los rayos del mismo barrido observan más celdas, pero el tabique oculta parte del sector derecho.", "El robot llegó al otro lado rodeando el tabique. Un segundo barrido descubre celdas que antes estaban ocultas."];
    el.innerHTML = '<div class="mp-panel"><div class="mp-steps" role="group" aria-label="Observaciones acumuladas">' + labels.map(function (s, i) { return '<button class="mp-step" type="button" data-fase="' + i + '" aria-pressed="' + (i === 0) + '">' + s + '</button>'; }).join("") +
      '</div><div class="mp-chart"></div><div class="mp-legend"><span><i class="mp-swatch" style="background:#fff"></i>0 · libre</span><span><i class="mp-swatch" style="background:#222831"></i>100 · ocupado</span><span><i class="mp-swatch" style="background:#aeb6c2"></i>−1 · desconocido</span></div>' +
      '<p class="mp-status" aria-live="polite"></p><p class="mp-status" data-cell-info aria-live="polite"></p>' + readings(["Celdas libres", "Celdas ocupadas", "Celdas desconocidas", "Área libre del ejemplo", "Índice de cobertura libre"]) +
      '<p class="mp-status" data-indice></p>' +
      '<p class="vnota">Toca una celda o recorre la rejilla con las flechas. La celda seleccionada tiene un borde azul. El punto azul indica dónde se toma el barrido. Se usa una clasificación ideal para enseñar el proceso; el mapa real fusiona observaciones con incertidumbre.</p></div>';
    var chart = el.querySelector(".mp-chart");
    function info() {
      var v = g.data[selected];
      el.querySelector("[data-cell-info]").textContent = "Columna " + (selected % 16) + ", fila " + Math.floor(selected / 16) + ": " + (v === -1 ? "desconocida; no equivale a libre" : v === 0 ? "libre según lo observado" : "ocupada según el impacto") + ". Valor " + v + ". Área de una celda: 0,0025 m².";
    }
    function draw() {
      g = M.rejilla(fase); chart.innerHTML = M.rejillaSVG(g, selected, true);
      el.querySelector(".mp-status").textContent = notes[fase]; info();
      var n = [0, 100, -1].map(function (v, i) { var c = g.data.filter(function (d) { return d === v; }).length; el.querySelector('[data-read="' + i + '"]').textContent = c; return c; });
      var ind = M.indiceCobertura(n[0], n[2]);
      el.querySelector('[data-read="3"]').textContent = fmt(n[0] * .0025, 3) + " m²";
      el.querySelector('[data-read="4"]').textContent = fmt(ind * 100, 1) + " %";
      el.querySelector("[data-indice]").textContent = "Si esta rejilla fuera la imagen guardada: área libre = " + n[0] + " × 0,0025 m² = " + fmt(n[0] * .0025, 3) + " m². Índice = libres / (libres + desconocidas) = " + n[0] + " / " + (n[0] + n[2]) + " = " + fmt(ind * 100, 1) + " %. Son las mismas dos medidas de los resultados de mapeo, más abajo.";
    }
    function select(i, focus) {
      selected = clamp(i, 0, 159);
      chart.querySelectorAll("[data-cell]").forEach(function (r) { var on = +r.getAttribute("data-cell") === selected; r.setAttribute("aria-pressed", String(on)); r.setAttribute("tabindex", on ? "0" : "-1"); });
      /* El borde de selección se recoloca sin reemplazar el nodo enfocado. */
      var rect = chart.querySelector('rect[pointer-events="none"]');
      rect.setAttribute("x", 20 + 20 * (selected % 16)); rect.setAttribute("y", 20 + 20 * Math.floor(selected / 16));
      info(); if (focus) chart.querySelector('[data-cell="' + selected + '"]').focus();
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-fase], [data-cell]"); if (!b) return;
      if (b.hasAttribute("data-fase")) { fase = +b.getAttribute("data-fase"); pressed(el, "data-fase", fase); draw(); }
      else select(+b.getAttribute("data-cell"), false);
    });
    chart.addEventListener("keydown", function (e) {
      var b = e.target.closest("[data-cell]"); if (!b) return;
      var i = +b.getAttribute("data-cell"), col = i % 16, row = Math.floor(i / 16), next = i;
      if (e.key === "ArrowLeft") next = row * 16 + Math.max(0, col - 1);
      else if (e.key === "ArrowRight") next = row * 16 + Math.min(15, col + 1);
      else if (e.key === "ArrowUp") next = Math.max(0, row - 1) * 16 + col;
      else if (e.key === "ArrowDown") next = Math.min(9, row + 1) * 16 + col;
      else if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault(); select(next, true);
    });
    el.estadoSim = function () { return { fase: fase, seleccion: selected, rejilla: g }; };
    draw();
  };

  /* Composición SE(2), útil para explicar TF y verificar la corrección completa. */
  M.componer = function (a, b) {
    var c = Math.cos(a[2]), s = Math.sin(a[2]);
    return [a[0] + c * b[0] - s * b[1], a[1] + s * b[0] + c * b[1], wrap(a[2] + b[2])];
  };
  M.invertir = function (a) {
    var c = Math.cos(a[2]), s = Math.sin(a[2]);
    return [-c * a[0] - s * a[1], s * a[0] - c * a[1], -a[2]];
  };
  M.correccionTF = function (mapBase, odomBase) { return M.componer(mapBase, M.invertir(odomBase)); };
  M.tfRecta = function (d, sesgo, activo) {
    var odom = d * (1 + sesgo / 100), correction = activo ? d - odom : 0;
    return { odom: odom, correccion: correction, mapa: odom + correction };
  };
  /* Pequeños ejes de un marco: origen, x hacia la derecha e y hacia arriba en el dibujo. */
  function ejesMarco(x, y, cls, nombre, abajo) {
    return '<path d="M' + x + ' ' + y + 'h24M' + x + ' ' + y + 'v-20" class="' + cls + '" stroke-width="2.5" fill="none"/><path d="M' + (x + 24) + ' ' + (y - 4) + 'l6 4-6 4z" class="' + cls + '-f"/><circle cx="' + x + '" cy="' + y + '" r="3.5" class="' + cls + '-f"/>' +
      '<text x="' + x + '" y="' + (abajo ? y + 21 : y - 26) + '" font-size="15" text-anchor="middle" class="mp-ink">' + esc(nombre) + '</text>';
  }
  function flechaH(x1, x2, y, cls) {
    if (Math.abs(x2 - x1) < 2) return '<circle cx="' + x1 + '" cy="' + y + '" r="3" class="' + cls + '-f"/>';
    var dir = x2 > x1 ? 1 : -1;
    return '<path d="M' + x1 + ' ' + y + 'H' + (x2 - dir * 6) + '" class="' + cls + '" stroke-width="3" fill="none"/><path d="M' + x2 + ' ' + y + 'l' + (-dir * 8) + ' -5v10z" class="' + cls + '-f"/>';
  }
  V["marcos-mapeo"] = function (el) {
    var d = 2, bias = 4, active = false;
    el.innerHTML = '<div class="mp-panel"><div class="mp-ranges">' + range("mp-tf-distancia", "Avance real del robot en el ejemplo", 0, 2, .05, d) + range("mp-tf-sesgo", "Error de escala simulado de la odometría", -10, 10, .5, bias) +
      '</div><div class="mp-controls"><label><input id="mp-tf-activo" type="checkbox">Aplicar map → odom estimado por SLAM</label></div><div class="mp-chart"></div>' +
      '<div class="mp-legend"><span><i class="mp-raya mp-raya-verde" aria-hidden="true"></i>map → odom · lo publica SLAM</span><span><i class="mp-raya mp-raya-ambar" aria-hidden="true"></i>odom → base_link · lo calculan las ruedas</span><span><i class="mp-raya mp-raya-disc" aria-hidden="true"></i>posición real del ejemplo</span></div>' +
      readings(["odom → base_link", "map → odom", "Pose en map"]) + '<div class="mp-equation"></div><p class="mp-status" aria-live="polite"></p>' +
      '<p class="vnota">Ejemplo rectilíneo sin giro. Se supone que el láser aporta una referencia exacta para aislar el efecto de TF. El 4 % es un parámetro didáctico, no el 3,63 % medido en la tesis. En un robot real la corrección también tiene incertidumbre y puede incluir giro.</p></div>';
    function draw() {
      /* En un teléfono se usa un lienzo más angosto para que los textos no se achiquen demasiado. */
      var chart = el.querySelector(".mp-chart"), angosto = (chart.clientWidth || 460) < 440, W = angosto ? 340 : 460, F = angosto ? 15 : 13;
      var t = M.tfRecta(d, bias, active), X = function (v) { return (angosto ? 34 : 52) + (v + .3) / 2.8 * (W - (angosto ? 58 : 80)); }, b = "";
      b += txt(14, 22, "Todo dibujado en el marco map", F + 3);
      /* Posición real del ejemplo: línea discontinua vertical. */
      var xr = X(d), ladoReal = xr > W * .72 ? "end" : xr < W * .26 ? "start" : "middle";
      b += line(xr, 50, xr, 104, "mp-real", "4 3") + '<text x="' + xr + '" y="44" font-size="' + F + '" text-anchor="' + ladoReal + '" class="mp-muted">posición real</text>';
      /* Regla en metros del marco map. */
      b += line(X(-.3), 104, X(2.5), 104, "mp-border");
      [0, .5, 1, 1.5, 2].forEach(function (v) { b += line(X(v), 100, X(v), 108, "mp-border") + '<text x="' + X(v) + '" y="' + (120 + F / 3) + '" font-size="' + F + '" text-anchor="middle" class="mp-muted">' + fmt(v, 1) + (v === 0 ? " m" : "") + '</text>'; });
      var xb = X(t.mapa), izq = xb > W * .72;
      b += '<circle cx="' + xb + '" cy="78" r="9" class="mp-pose"/><text x="' + (xb + (izq ? -14 : 14)) + '" y="83" font-size="' + (F + 1) + '" text-anchor="' + (izq ? "end" : "start") + '" class="mp-ink">base_link</text>';
      /* Orígenes de los marcos y la cadena map → odom → base_link. */
      b += flechaH(X(0), X(t.correccion), 150, "mp-flecha-verde");
      b += '<text x="' + (X(0) + 34) + '" y="155" font-size="' + F + '" class="mp-ink">map → odom: ' + fmt(t.correccion, 2) + ' m</text>';
      b += ejesMarco(X(0), 186, "mp-eje-map", "map", true);
      b += ejesMarco(X(t.correccion), 236, "mp-eje-odom", "odom", true);
      b += line(xb, 88, xb, 98, "mp-border", "3 4") + line(xb, 132, xb, 258, "mp-border", "3 4");
      b += flechaH(X(t.correccion), xb, 266, "mp-flecha-ambar");
      b += '<text x="' + Math.max(W * .3, Math.min(W * .7, (X(t.correccion) + xb) / 2)) + '" y="290" font-size="' + F + '" text-anchor="middle" class="mp-ink">odom → base_link: ' + fmt(t.odom, 2) + ' m</text>';
      chart.innerHTML = svg(W, 300, "Cadena de transformaciones en el marco map: el origen de odom se desplaza con la corrección y la flecha de las ruedas conserva su largo", b);
      [t.odom, t.correccion, t.mapa].forEach(function (v, i) { el.querySelector('[data-read="' + i + '"]').textContent = fmt(v, 2) + " m"; });
      el.querySelector(".mp-equation").textContent = "map → odom + odom → base_link = pose en map: " + fmt(t.correccion, 2) + " m + " + fmt(t.odom, 2) + " m = " + fmt(t.mapa, 2) + " m";
      el.querySelector(".mp-status").textContent = active ? "SLAM movió el origen de odom " + fmt(Math.abs(t.correccion), 2) + " m hacia " + (t.correccion < 0 ? "atrás" : t.correccion > 0 ? "adelante" : "ningún lado") + ". La flecha de las ruedas conserva su largo, " + fmt(t.odom, 2) + " m: los encoders no cambiaron. Ahora base_link queda sobre la posición real del ejemplo." : "Sin corrección, el origen de odom coincide con el de map y la pose en map hereda el error de las ruedas: " + fmt(t.odom, 2) + " m en vez de " + fmt(d, 2) + " m. Activa map → odom para ver dónde se compensa.";
      el.querySelector('[data-out="mp-tf-distancia"]').textContent = fmt(d, 2) + " m";
      el.querySelector('[data-out="mp-tf-sesgo"]').textContent = fmt(bias, 1) + " %";
    }
    el.addEventListener("input", function (e) { if (e.target.id === "mp-tf-distancia") d = +e.target.value; if (e.target.id === "mp-tf-sesgo") bias = +e.target.value; draw(); });
    el.querySelector("#mp-tf-activo").addEventListener("change", function (e) { active = e.target.checked; draw(); });
    el.estadoSim = function () { return M.tfRecta(d, bias, active); }; draw();
    if (U && U.alCambiarAncho) U.alCambiarAncho(el.querySelector(".mp-chart"), draw);
  };
  /* Dos observaciones locales de una esquina estática, con 30 cm de avance. */
  M.esquina = [[-.3, .8], [0, .8], [.3, .8], [.6, .8], [.9, .8], [.9, .5], [.9, .2]];
  M.barridos = function (dx) {
    return {
      a: M.esquina.map(function (p) { return p.slice(); }),
      b: M.esquina.map(function (p) { return [p[0] - .3, p[1]]; }),
      ajuste: .3, error: Math.abs(dx - .3)
    };
  };
  /* Desacuerdo total: suma de las distancias al cuadrado entre puntos comunes, en m².
     Es la cantidad que un ajuste por mínimos cuadrados intenta reducir. */
  M.costoBarridos = function (dx) {
    var data = M.barridos(dx);
    return data.a.reduce(function (s, p, i) { var q = data.b[i]; return s + Math.pow(q[0] + dx - p[0], 2) + Math.pow(q[1] - p[1], 2); }, 0);
  };
  M.ODOM_BARRIDOS = .4; // avance que sugieren las ruedas en el ejemplo
  function marcaBarrido(x, y, b) { return b ? '<path d="M' + x + ' ' + (y - 5) + 'l5 9h-10z" class="mp-b-f"/>' : '<circle cx="' + x + '" cy="' + y + '" r="4.5" class="mp-a-f"/>'; }
  function puntosBarrido(points, shift, triangle, X, Y) {
    return points.map(function (p) { return marcaBarrido(X(p[0] + shift), Y(p[1]), triangle); }).join("");
  }
  function barridoLocal(points, title, esB) {
    var X = function (x) { return 125 + x * 110; }, Y = function (y) { return 155 - y * 110; };
    var b = txt(16, 25, title, 16) + line(26, 155, 259, 155, "mp-border") + line(125, 45, 125, 176, "mp-border");
    b += puntosBarrido(points, 0, esB, X, Y) + (esB ? '<path d="M125 147l7 13h-14z" class="mp-b-f"/>' : '<circle cx="125" cy="155" r="7" class="mp-a-f"/>') + txt(139, 176, "sensor " + (esB ? "B" : "A"), 14) + txt(236, 150, "x", 14) + txt(130, 49, "y", 14);
    return svg(280, 190, title + ". El sensor es el origen del marco local", b);
  }
  function curvaCosto(dx) {
    var X = function (v) { return 60 + (v - .1) / .4 * 370; }, cmax = M.costoBarridos(.5) * 1e4, Y = function (c) { return 150 - c / cmax * 115; }, b = "", pts = [];
    for (var v = .1; v <= .5001; v += .01) pts.push(X(v).toFixed(1) + " " + Y(M.costoBarridos(v) * 1e4).toFixed(1));
    b += txt(14, 22, "Desacuerdo total según la traslación probada", 18);
    b += line(60, 150, 430, 150, "mp-border") + line(60, 30, 60, 150, "mp-border");
    [.1, .2, .3, .4, .5].forEach(function (v) { b += '<text x="' + X(v) + '" y="172" font-size="16" text-anchor="middle" class="mp-muted">' + fmt(v * 100, 0) + '</text>'; });
    b += '<text x="245" y="194" font-size="16" text-anchor="middle" class="mp-muted">traslación aplicada a B · cm</text>';
    b += '<text x="54" y="' + (Y(cmax) + 5) + '" font-size="15" text-anchor="end" class="mp-muted">' + fmt(cmax, 0) + '</text><text x="54" y="155" font-size="15" text-anchor="end" class="mp-muted">0</text><text x="54" y="' + (Y(cmax) + 22) + '" font-size="15" text-anchor="end" class="mp-muted">cm²</text>';
    b += '<path d="M' + pts.join(" L") + '" fill="none" class="mp-blue" stroke-width="2.5"/>';
    b += line(X(.3), 34, X(.3), 150, "mp-green", "4 3") + '<text x="' + (X(.3) + 6) + '" y="46" font-size="16" class="mp-ink">mínimo · 30 cm</text>';
    b += line(X(M.ODOM_BARRIDOS), 60, X(M.ODOM_BARRIDOS), 150, "mp-orange", "2 3") + '<text x="' + (X(M.ODOM_BARRIDOS) + 6) + '" y="74" font-size="15" class="mp-muted">ruedas</text>';
    b += '<circle cx="' + X(dx) + '" cy="' + Y(M.costoBarridos(dx) * 1e4) + '" r="7" class="mp-b-f" stroke="var(--surface)" stroke-width="2"/>';
    return svg(460, 204, "Curva del desacuerdo total: baja hasta un mínimo en 30 cm y vuelve a subir. El punto marca la traslación elegida.", b);
  }
  V.barridos = function (el) {
    var dx = M.ODOM_BARRIDOS, data = M.barridos(dx);
    el.innerHTML = '<div class="mp-panel"><div class="mp-columns"><figure><figcaption>A · antes de avanzar</figcaption>' + barridoLocal(data.a, "Coordenadas respecto de A", false) +
      '</figure><figure><figcaption>B · después de avanzar</figcaption>' + barridoLocal(data.b, "Coordenadas respecto de B", true) + '</figure></div>' +
      '<div class="mp-ranges">' + range("mp-barrido-dx", "Traslación aplicada a B para llevarlo al marco de A", .1, .5, .01, dx) + '</div>' +
      '<div class="mp-controls"><button class="vbtn" type="button" data-fit>Ajustar barridos</button><button class="vbtn sec" type="button" data-guess>Volver a lo que dicen las ruedas · 40 cm</button></div>' +
      '<div class="mp-chart" data-superpuesto></div><div class="mp-legend"><span><i class="mp-dot mp-dot-azul" aria-hidden="true"></i>barrido A</span><span><i class="mp-tri" aria-hidden="true"></i>barrido B trasladado</span><span><i class="mp-raya mp-raya-ambar" aria-hidden="true"></i>distancia entre un punto de A y el mismo punto en B</span></div>' +
      readings(["Las ruedas estimaron", "Traslación probada", "Desajuste de cada punto", "Desacuerdo total"]) + '<div class="mp-chart" data-costo></div><p class="mp-status" aria-live="polite"></p>' +
      '<p class="vnota">Ejemplo con traslación de 30 cm, sin giro ni ruido, y correspondencias conocidas. El desacuerdo total suma las distancias al cuadrado de los siete puntos comunes. Elevar al cuadrado deja un mínimo claro y castiga más los desajustes grandes. El ajuste real busca coincidencias con incertidumbre y también estima orientación. Ver una pared nueva por sí sola no implica un cierre de lazo.</p></div>';
    function draw() {
      data = M.barridos(dx);
      var X = function (x) { return 140 + x * 240; }, Y = function (y) { return 236 - y * 200; };
      var b = txt(16, 28, "B expresado en el marco de A", 18) + line(30, 236, 440, 236, "mp-border");
      data.a.forEach(function (p, i) { b += line(X(p[0]), Y(p[1]), X(data.b[i][0] + dx), Y(data.b[i][1]), "mp-orange"); });
      b += puntosBarrido(data.a, 0, false, X, Y) + puntosBarrido(data.b, dx, true, X, Y);
      b += '<circle cx="' + X(0) + '" cy="236" r="7" class="mp-a-f"/><path d="M' + X(dx) + ' 230l6 11h-12z" class="mp-b-f"/>';
      b += txt(X(0) - 7, 266, "A", 18) + txt(X(dx) - 7, 266, "B", 18);
      el.querySelector("[data-superpuesto]").innerHTML = svg(460, 284, "Superposición de barridos de la misma esquina. Las líneas unen puntos comunes", b);
      el.querySelector("[data-costo]").innerHTML = curvaCosto(dx);
      var costo = M.costoBarridos(dx) * 1e4;
      el.querySelector('[data-read="0"]').textContent = fmt(M.ODOM_BARRIDOS * 100, 0) + " cm";
      el.querySelector('[data-read="1"]').textContent = fmt(dx * 100, 0) + " cm";
      el.querySelector('[data-read="2"]').textContent = fmt(data.error * 100, 0) + " cm";
      el.querySelector('[data-read="3"]').textContent = fmt(costo, 0) + " cm²";
      el.querySelector('[data-out="mp-barrido-dx"]').textContent = fmt(dx * 100, 0) + " cm";
      el.querySelector("#mp-barrido-dx").value = dx;
      el.querySelector(".mp-status").textContent = data.error < 1e-8 ? "Los puntos comunes coinciden: el desacuerdo total es cero y el avance estimado es 30 cm, no los 40 cm de las ruedas. El robot se movió; la esquina permaneció fija." : "Con " + fmt(dx * 100, 0) + " cm, cada punto de B queda a " + fmt(data.error * 100, 0) + " cm del mismo punto de A. Siete puntos × (" + fmt(data.error * 100, 0) + " cm)² = " + fmt(costo, 0) + " cm². El ajuste busca la traslación donde la curva de abajo llega a su mínimo.";
    }
    el.addEventListener("input", function (e) { if (e.target.id === "mp-barrido-dx") { dx = +e.target.value; draw(); } });
    el.addEventListener("click", function (e) { if (e.target.closest("[data-fit]")) { dx = .3; draw(); } if (e.target.closest("[data-guess]")) { dx = M.ODOM_BARRIDOS; draw(); } });
    el.estadoSim = function () { return { desplazamiento: dx, desajuste: data.error, costo: M.costoBarridos(dx) }; }; draw();
  };

  /* Grafo SE(2) pequeño. Los residuos comparan movimientos relativos medidos
     con los que implican las poses. Se fija la pose 0 para eliminar el gauge. */
  M.grafoEjemplo = function (options) {
    options = options || {};
    var escalaPct = options.escalaPct == null ? 4 : options.escalaPct, giroDeg = options.giroDeg == null ? 1 : options.giroDeg;
    if (!Number.isFinite(escalaPct) || Math.abs(escalaPct) > 10 || !Number.isFinite(giroDeg) || Math.abs(giroDeg) > 3) throw new Error('Parámetros ilustrativos fuera de rango');
    var real = [[0, 0, 0]], edges = [], raw = [[0, 0, 0]];
    for (var k = 1; k <= 12; k++) {
      var side = Math.floor((k - 1) / 3), prev = real[k - 1], step = side % 2 ? 1 / 3 : .5;
      var heading = side * Math.PI / 2;
      var pose = [prev[0] + step * Math.cos(heading), prev[1] + step * Math.sin(heading), wrap(Math.floor(k / 3) * Math.PI / 2)];
      real.push(pose);
      var z = M.componer(M.invertir(prev), pose);
      z[0] *= 1 + escalaPct / 100; z[1] *= 1 + escalaPct / 100; z[2] = wrap(z[2] + giroDeg * Math.PI / 180);
      edges.push({ i: k - 1, j: k, z: z, w: [100, 100, 50] });
      raw.push(M.componer(raw[k - 1], z));
    }
    return { real: real, odom: raw, edges: edges, cierre: { i: 0, j: 12, z: [0, 0, 0], w: [500, 500, 250] } };
  };
  function residual(p, edge) {
    var a = p[edge.i], b = p[edge.j], c = Math.cos(a[2]), s = Math.sin(a[2]), dx = b[0] - a[0], dy = b[1] - a[1];
    var px = c * dx + s * dy, py = -s * dx + c * dy;
    return { r: [px - edge.z[0], py - edge.z[1], wrap(b[2] - a[2] - edge.z[2])],
      ja: [[-c, -s, py], [s, -c, -px], [0, 0, -1]], jb: [[c, s, 0], [-s, c, 0], [0, 0, 1]] };
  }
  M.costoGrafo = function (poses, edges) {
    return edges.reduce(function (sum, e) { var r = residual(poses, e).r; return sum + r.reduce(function (s, v, k) { return s + e.w[k] * v * v; }, 0); }, 0);
  };
  function sistemaLineal(A, b) {
    var n = b.length, a = A.map(function (r, i) { return r.slice().concat([b[i]]); });
    for (var k = 0; k < n; k++) {
      var pivot = k;
      for (var i = k + 1; i < n; i++) if (Math.abs(a[i][k]) > Math.abs(a[pivot][k])) pivot = i;
      var swap = a[k]; a[k] = a[pivot]; a[pivot] = swap;
      if (Math.abs(a[k][k]) < 1e-12) throw new Error("Grafo sin ancla o sistema singular");
      for (var row = k + 1; row < n; row++) {
        var f = a[row][k] / a[k][k];
        for (var col = k; col <= n; col++) a[row][col] -= f * a[k][col];
      }
    }
    var x = new Array(n).fill(0);
    for (var r = n - 1; r >= 0; r--) {
      var sum = a[r][n]; for (var j = r + 1; j < n; j++) sum -= a[r][j] * x[j]; x[r] = sum / a[r][r];
    }
    return x;
  }
  M.optimizarGrafo = function (initial, edges) {
    var poses = initial.map(function (p) { return p.slice(); }), n = (poses.length - 1) * 3, history = [M.costoGrafo(poses, edges)];
    for (var iter = 0; iter < 30; iter++) {
      var H = new Array(n).fill(0).map(function () { return new Array(n).fill(0); }), grad = new Array(n).fill(0);
      edges.forEach(function (e) {
        var R = residual(poses, e);
        for (var row = 0; row < 3; row++) {
          var entries = [];
          if (e.i > 0) for (var a = 0; a < 3; a++) entries.push([(e.i - 1) * 3 + a, R.ja[row][a]]);
          if (e.j > 0) for (var b = 0; b < 3; b++) entries.push([(e.j - 1) * 3 + b, R.jb[row][b]]);
          entries.forEach(function (x) {
            grad[x[0]] += e.w[row] * x[1] * R.r[row];
            entries.forEach(function (y) { H[x[0]][y[0]] += e.w[row] * x[1] * y[1]; });
          });
        }
      });
      for (var d = 0; d < n; d++) H[d][d] += 1e-6;
      var step = sistemaLineal(H, grad.map(function (g) { return -g; })), accepted = false, candidate, cost;
      for (var scale = 1; scale >= 1 / 128; scale /= 2) {
        candidate = poses.map(function (p, i) { return i === 0 ? p.slice() : [p[0] + scale * step[(i - 1) * 3], p[1] + scale * step[(i - 1) * 3 + 1], wrap(p[2] + scale * step[(i - 1) * 3 + 2])]; });
        cost = M.costoGrafo(candidate, edges);
        if (cost <= history[history.length - 1]) { accepted = true; break; }
      }
      if (!accepted) break;
      poses = candidate; history.push(cost);
      if (Math.max.apply(null, step.map(Math.abs)) * scale < 1e-7) break;
    }
    return { poses: poses, costos: history };
  };
  M.grafoSVG = function (graph, poses, phase, selected) {
    var all = graph.real.concat(graph.odom).concat(poses), xs = all.map(function (p) { return p[0]; }), ys = all.map(function (p) { return p[1]; });
    var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs), miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    var scale = Math.min(330 / (maxx - minx), 210 / (maxy - miny));
    var X = function (x) { return 64 + (x - minx) * scale; }, Y = function (y) { return 270 - (y - miny) * scale; }, b = "";
    function path(points, cls, dash) { return '<path d="M' + points.map(function (p) { return X(p[0]) + " " + Y(p[1]); }).join(" L") + '" fill="none" class="' + cls + '" stroke-width="2"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>'; }
    b += path(graph.real, "mp-border", "3 4") + path(graph.odom, "mp-orange", "7 5");
    b += path(poses, "mp-blue");
    if (phase >= 1) b += line(X(poses[0][0]), Y(poses[0][1]), X(poses[12][0]), Y(poses[12][1]), "mp-green", "5 3");
    poses.forEach(function (p, i) {
      var x = X(p[0]), y = Y(p[1]);
      b += line(x, y, x + 15 * Math.cos(p[2]), y - 15 * Math.sin(p[2]), "mp-blue");
      if (i === selected) b += '<circle cx="' + x + '" cy="' + y + '" r="11" class="mp-anillo" fill="none" stroke-width="2.5"/>';
      b += '<circle cx="' + x + '" cy="' + y + '" r="' + (i === selected ? 6 : 4.5) + '" class="mp-node" data-node="' + i + '"/>';
      if (i > 0 && i < 12) b += txt(x + 8, y - 9, String(i), 14);
    });
    b += txt(16, 24, phase >= 2 ? "Poses reajustadas · odometría conservada" : "Poses iniciales con deriva simulada", 17);
    b += txt(16, 310, "0 · origen fijo", 15);
    b += txt(X(poses[0][0]) - 16, Y(poses[0][1]) - 10, "0", 14);
    b += txt(X(poses[12][0]) + 8, Y(poses[12][1]) + 25, "12", 15);
    b += txt(290, 310, "12 · regreso", 15);
    if (phase === 3) b += line(X(graph.odom[12][0]), Y(graph.odom[12][1]), X(poses[12][0]), Y(poses[12][1]), "mp-green");
    return svg(460, 320, "Grafo de trece poses. Línea naranja: odometría original. Azul: poses estimadas. Verde: cierre de lazo", b);
  };
  /* Desacuerdo total en cada paso: sin cierre nada se contradice; el cierre lo hace subir; optimizar lo baja. */
  M.desacuerdoPorPaso = function (graph, opt) {
    var todas = graph.edges.concat([graph.cierre]);
    return [M.costoGrafo(graph.odom, graph.edges), M.costoGrafo(graph.odom, todas), M.costoGrafo(opt.poses, todas), M.costoGrafo(opt.poses, todas)];
  };
  V.lazo = function (el) {
    var escalaPct = 4, giroDeg = 1, graph, edges, opt, costos, iteraciones;
    function calcular() { graph = M.grafoEjemplo({ escalaPct: escalaPct, giroDeg: giroDeg }); edges = graph.edges.concat([graph.cierre]); opt = M.optimizarGrafo(graph.odom, edges); costos = M.desacuerdoPorPaso(graph, opt); iteraciones = opt.costos.length - 1; }
    calcular();
    var phase = 0, selected = 12;
    var steps = ["1 · Acumular deriva", "2 · Reconocer el inicio", "3 · Optimizar las poses", "4 · Publicar map → odom"];
    var notes = [
      "Los nodos guardan x, y y θ. Los errores pequeños de movimiento se acumulan y el regreso estimado no coincide con el inicio.",
      "El láser reconoce una observación compatible con el inicio. La línea verde añade una restricción entre las poses 0 y 12; las poses todavía no se han corregido.",
      "El optimizador reajusta posiciones y orientaciones para reducir el desacuerdo entre las restricciones. La trayectoria naranja de odometría conserva su deriva; se actualizan los nodos del grafo.",
      "SLAM usa la pose actual optimizada y la pose odométrica actual para calcular map → odom. Esta transformación lleva la estimación de odom a la de map sin recalibrar los encoders ni reescribir odom."
    ];
    el.innerHTML = '<div class="mp-panel"><div class="mp-steps" role="group" aria-label="Pasos del cierre de lazo">' + steps.map(function (s, i) { return '<button class="mp-step" type="button" data-paso="' + i + '" aria-pressed="' + (i === 0) + '">' + s + '</button>'; }).join("") + '</div>' +
      '<div class="mp-chart"></div><div class="vley"><span><i class="lin-disc"></i>recorrido de referencia del ejemplo</span><span><i class="lin ambar"></i>odometría original (trazos)</span><span><i class="pt azul"></i>poses del grafo</span><span><i class="lin verde"></i>cierre / corrección actual</span></div>' +
      '<p class="mp-status" data-stage-info aria-live="polite"></p>' +
      readings(["Separación del regreso en el grafo", "Giro residual en el regreso", "Separación en odom, sin cambiar", "Desacuerdo total del grafo"]) +
      '<p class="mp-status" data-costo-info></p><p class="mp-status" data-tf-info></p>' +
      '<div class="mp-ranges">' + range("mp-pose", "Inspeccionar pose", 0, 12, 1, selected) + '</div><p class="mp-status" data-pose-info></p>' +
      '<details class="guia-vis"><summary>Experimentar con la deriva del ejemplo</summary><p>Conserva el recorrido de referencia y cambia un error a la vez. Con giro de 0° y solo error de escala, el rectángulo puede cerrar y conservar longitudes incorrectas: cerrar no garantiza un mapa exacto.</p><div class="mp-ranges">' + range('mp-grafo-escala', 'Error de escala ilustrativo · %', -10, 10, 1, escalaPct) + range('mp-grafo-giro', 'Error angular por tramo · °', -3, 3, 0.25, giroDeg) + '</div><button type="button" class="vbtn sec" data-restablecer-grafo>Restablecer ejemplo</button></details>' +
      '<p class="vnota" data-grafo-nota></p></div>';
    function draw() {
      var poses = phase >= 2 ? opt.poses : graph.odom, p = poses[selected], end = poses[12], raw = graph.odom[12];
      el.querySelector(".mp-chart").innerHTML = M.grafoSVG(graph, poses, phase, selected);
      el.querySelector("#mp-pose").value = selected;
      el.querySelector('#mp-grafo-escala').value = escalaPct; el.querySelector('#mp-grafo-giro').value = giroDeg;
      el.querySelector('[data-out="mp-grafo-escala"]').textContent = fmt(escalaPct, 0) + ' %'; el.querySelector('[data-out="mp-grafo-giro"]').textContent = fmt(giroDeg, 2) + '°';
      el.querySelector('[data-grafo-nota]').textContent = 'Grafo sintético: escala odométrica ' + fmt(escalaPct, 0) + ' % y error angular ' + fmt(giroDeg, 2) + '° por tramo. El optimizador de mínimos cuadrados JavaScript no ejecuta Ceres ni reproduce los ensayos de la tesis. La referencia solo es conocida en este ejemplo. Una restricción de regreso no garantiza todas las longitudes exactas.';
      el.querySelector('[data-out="mp-pose"]').textContent = selected + " de 12";
      el.querySelector("[data-pose-info]").textContent = "Pose " + selected + ": x = " + fmt(p[0], 2) + " m, y = " + fmt(p[1], 2) + " m, θ = " + fmt(p[2] * 180 / Math.PI, 1) + "°. La flecha de cada nodo representa su orientación.";
      var gap = Math.hypot(end[0], end[1]) * 100;
      el.querySelector('[data-read="0"]').textContent = gap > 0 && gap < .1 ? "< 0,1 cm" : fmt(gap, 1) + " cm";
      el.querySelector('[data-read="1"]').textContent = fmt(Math.abs(end[2]) * 180 / Math.PI, 1) + "°";
      el.querySelector('[data-read="2"]').textContent = fmt(Math.hypot(raw[0], raw[1]) * 100, 1) + " cm";
      el.querySelector('[data-read="3"]').textContent = costos[phase] < 1e-6 ? "0" : fmt(costos[phase], costos[phase] < 1 ? 2 : 1);
      el.querySelector("[data-costo-info]").textContent = [
        "Desacuerdo total: cada arista compara el movimiento medido con el que implican las poses. Esas diferencias se elevan al cuadrado, se multiplican por un peso y se suman. Sin cierre, las poses se armaron con las mismas mediciones y no se contradicen: el total es 0.",
        "La nueva restricción dice «el regreso coincide con el inicio», pero las poses dicen que quedaron a " + fmt(Math.hypot(raw[0], raw[1]) * 100, 1) + " cm. El desacuerdo total sube de 0 a " + fmt(costos[1], 1) + ".",
        "El optimizador repartió la corrección entre todas las poses en " + iteraciones + " iteraciones: el desacuerdo bajó de " + fmt(costos[1], 1) + " a " + fmt(costos[2], 2) + ". No llega a cero porque las mediciones de las ruedas y el cierre no pueden cumplirse todos a la vez.",
        "La corrección se publica sin volver a optimizar: el desacuerdo sigue en " + fmt(costos[3], 2) + ". Lo que cambia es la transformación que relaciona odom con map."
      ][phase];
      el.querySelector("[data-stage-info]").textContent = notes[phase];
      var tfText;
      if (phase === 3) {
        var tf = M.correccionTF(end, raw), mapped = M.componer(tf, raw);
        tfText = "map → odom: x = " + fmt(tf[0], 3) + " m, y = " + fmt(tf[1], 3) + " m, giro = " + fmt(tf[2] * 180 / Math.PI, 1) + "°. Al componerla con odom → base_link, la pose actual en map resulta (" + fmt(mapped[0], 3) + ", " + fmt(mapped[1], 3) + " m; " + fmt(mapped[2] * 180 / Math.PI, 1) + "°).";
      } else tfText = "La actualización de map → odom se muestra en el paso 4. El grafo reajusta cada pose histórica; TF publica una transformación rígida para relacionar las referencias actuales.";
      el.querySelector("[data-tf-info]").textContent = tfText;
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-paso], [data-node], [data-restablecer-grafo]"); if (!b) return;
      if (b.hasAttribute('data-restablecer-grafo')) { escalaPct = 4; giroDeg = 1; selected = 12; phase = 0; calcular(); pressed(el, 'data-paso', phase); }
      else if (b.hasAttribute("data-paso")) { phase = +b.getAttribute("data-paso"); pressed(el, "data-paso", phase); }
      else selected = +b.getAttribute("data-node");
      draw();
    });
    el.addEventListener("input", function (e) {
      if (e.target.id === "mp-pose") { selected = +e.target.value; draw(); }
      else if (e.target.id === 'mp-grafo-escala' || e.target.id === 'mp-grafo-giro') {
        escalaPct = +el.querySelector('#mp-grafo-escala').value; giroDeg = +el.querySelector('#mp-grafo-giro').value;
        phase = 0; calcular(); pressed(el, 'data-paso', phase); draw();
      }
    });
    el.estadoSim = function () { var p = phase >= 2 ? opt.poses : graph.odom; return { fase: phase, poses: p, odom: graph.odom, costoInicial: opt.costos[0], costoFinal: opt.costos[opt.costos.length - 1], desacuerdo: costos[phase], tf: phase === 3 ? M.correccionTF(p[12], graph.odom[12]) : [0, 0, 0] }; };
    draw();
  };
  /* Open Karto es una base compartida, no una equivalencia de resultados. */
  M.trejosSVG = function () {
    var b = '<rect x="92" y="20" width="276" height="52" rx="9" fill="#eef2f8" stroke="#8794a8"/>';
    b += txt(169, 52, "Open Karto", 19);
    b += line(152, 73, 119, 135, "mp-blue") + line(308, 73, 340, 135, "mp-blue");
    b += txt(29, 103, "Base de Karto SLAM", 13) + txt(280, 103, "Base de SLAM Toolbox", 13);
    b += '<rect x="16" y="137" width="205" height="93" rx="9" fill="#edf6e2" stroke="#3a6b0e"/><rect x="239" y="137" width="205" height="93" rx="9" fill="#e5edf8" stroke="#004eaa"/>';
    b += txt(55, 166, "Karto SLAM", 18) + txt(26, 191, "Evaluado por Trejos (2022)", 14) + txt(29, 213, "En simulación controlada", 13);
    b += txt(276, 166, "SLAM Toolbox", 18) + txt(260, 191, "Usado en este prototipo", 14) + txt(260, 213, "No evaluado por Trejos", 13);
    b += txt(42, 265, "Misma base ≠ mismas métricas o prestaciones", 16);
    return svg(460, 287, "Open Karto es una base compartida por Karto SLAM y SLAM Toolbox. Trejos evaluó solo Karto SLAM", b);
  };

  /* Paleta de la captura, con capas que se pueden inspeccionar por separado. */
  M.capasRviz = [
    { id: "obstaculo", color: "#ff00ff", label: "Magenta · obstáculo", text: "Celdas de obstáculo con costo letal. En esta escena representan una pared; no un tipo de material.", nav: false },
    { id: "inscrito", color: "#00ffff", label: "Celeste · costo inscrito", text: "Franja de costo inscrito: el centro del robot demasiado cerca de un obstáculo puede implicar colisión por el tamaño de su huella. No es una pared adicional.", nav: true },
    { id: "inflacion", color: "#6f087f", label: "Rojo/violeta · inflación", text: "Costos que disminuyen al alejarse del obstáculo. Invitan al planificador a dejar separación; no representan nuevos objetos ni distancias medidas por el láser.", nav: true },
    { id: "libre", color: "#30312e", label: "Oscuro · libre", text: "Dentro de la rejilla: espacio libre sin costo añadido. El fondo de RViz fuera de la rejilla también puede ser oscuro; allí el color no describe ocupación.", nav: false },
    { id: "desconocido", color: "#657a77", label: "Gris · desconocido", text: "Celdas para las que todavía no hay suficiente información. No son espacio libre confirmado.", nav: false },
    { id: "ruta", color: "#6bff00", label: "Verde · ruta", text: "Ruta planificada hacia el objetivo actual. Es una propuesta para avanzar, no un registro del camino recorrido.", nav: true },
    { id: "robot", color: "#ff6400", label: "Naranja · robot", text: "Modelo o huella del robot superpuesto en su pose estimada. No es una celda ocupada del mapa.", nav: true }
  ];
  M.rvizSVG = function (nav, selected) {
    function layer(id, shape) {
      var item = M.capasRviz.filter(function (c) { return c.id === id; })[0];
      if (!nav && item.nav) return "";
      return '<g data-layer="' + id + '" opacity="' + (!selected || selected === id ? 1 : .18) + '">' + shape + '</g>';
    }
    var b = '<rect x="10" y="38" width="440" height="249" rx="8" fill="#1d262d"/>';
    b += layer("desconocido", '<rect x="24" y="51" width="412" height="222" fill="#657a77"/>');
    b += layer("libre", '<path d="M50 242V82H290V202H385V242Z" fill="#30312e"/>');
    b += layer("inflacion", '<path d="M50 242V82H290V202H385V242M167 102V185" fill="none" stroke="#520078" stroke-width="53"/><path d="M50 242V82H290V202H385V242M167 102V185" fill="none" stroke="#870934" stroke-width="37"/><path d="M50 242V82H290V202H385V242M167 102V185" fill="none" stroke="#bd1630" stroke-width="25"/>');
    b += layer("inscrito", '<path d="M50 242V82H290V202H385V242M167 102V185" fill="none" stroke="#00ffff" stroke-width="18"/>');
    b += layer("obstaculo", '<path d="M50 242V82H290V202H385V242M167 102V185" fill="none" stroke="#ff00ff" stroke-width="9"/>');
    b += layer("ruta", '<path d="M243 225L219 216L207 181L224 151L235 118L252 100" stroke="#6bff00" stroke-width="5" fill="none"/>');
    b += layer("robot", '<rect x="229" y="209" width="30" height="30" transform="rotate(20 244 224)" fill="#ff6400"/><circle cx="244" cy="224" r="5" fill="#111"/>');
    b += txt(16, 25, nav ? "Capas de la vista de navegación" : "Sin márgenes, ruta ni modelo del robot", 15);
    b += txt(20, 310, "Esquema ilustrativo, inspirado en las capturas", 14);
    return svg(460, 328, "Esquema de colores y capas de RViz. Selecciona un color con los botones de la leyenda", b);
  };
  V["rviz-colores"] = function (el) {
    var nav = true, selected = null;
    el.innerHTML = '<div class="mp-panel"><div class="mp-controls"><label><input id="mp-rviz-nav" type="checkbox" checked>Mostrar capas de navegación y robot</label><button class="vbtn sec" type="button" data-todas>Ver todos los colores</button></div>' +
      '<div class="mp-chart"></div><div class="mp-layer-controls" role="group" aria-label="Leyenda de RViz">' + M.capasRviz.map(function (c) { return '<button class="mp-layer" type="button" data-color="' + c.id + '" aria-pressed="false"><i class="mp-swatch" style="background:' + c.color + '" aria-hidden="true"></i>' + c.label + '</button>'; }).join("") +
      '</div><p class="mp-status" aria-live="polite"></p><p class="vnota">Los colores se tomaron de las capturas del proyecto. El dibujo resume su significado; no es un mapa medido ni aplica necesariamente a otras configuraciones de RViz.</p></div>';
    function draw() {
      el.querySelector(".mp-chart").innerHTML = M.rvizSVG(nav, selected);
      var item = M.capasRviz.filter(function (c) { return c.id === selected; })[0];
      el.querySelector(".mp-status").textContent = item ? item.text + (!nav && item.nav ? " Esta capa está oculta: activa las capas de navegación para verla." : "") : nav ? "Elige un color para resaltarlo. Magenta y gris describen ocupación; los márgenes de colores, la ruta verde y el modelo naranja son capas añadidas para navegar." : "Se ocultaron las capas añadidas. Quedan los obstáculos, lo libre y lo desconocido; una rejilla de ocupación se guarda normalmente en escala de grises.";
      pressed(el, "data-color", selected || "");
    }
    el.querySelector("#mp-rviz-nav").addEventListener("change", function (e) { nav = e.target.checked; draw(); });
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-color], [data-todas]"); if (!b) return; selected = b.hasAttribute("data-todas") ? null : b.getAttribute("data-color"); draw(); });
    el.estadoSim = function () { return { navegacion: nav, seleccion: selected }; }; draw();
  };
})();
