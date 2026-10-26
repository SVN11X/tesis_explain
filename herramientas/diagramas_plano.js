/*
  Genera el esquema estático del plano del recinto que respalda «Once distancias del plano y
  cinco mapas» cuando el interactivo no se monta. Usa la geometría de datos/parametros.json,
  la misma del interactivo, con las distancias medidas de la Tabla A8.3.
  Desde la raíz: node herramientas/diagramas_plano.js
  Con --comprobar no escribe nada: falla si la figura guardada no coincide con los datos.
  Solo utiliza módulos de Node, sin dependencias.
*/
"use strict";
var fs = require("fs"), path = require("path");
var D = require("../datos/proyecto.js");
var raiz = path.resolve(__dirname, ".."), destino = path.join(raiz, "img/diagramas/plano-recinto.svg");
var G = D.parametros.mapeo.plano_recinto, filas = D.analisis.plano;
/* rótulos que van al otro lado de su cota para no quedar sobre un muro */
var LADO = { "alto": "izquierda", "tabique-superior-largo": "abajo" };

function f(v, n) { return v.toFixed(n).replace(".", ","); }

function plano() {
  var W = 640, x0 = -0.36, x1 = G.ancho_m + 0.14, y0 = -0.12, y1 = G.alto_m + 0.12, k = (W - 16) / (x1 - x0);
  var H = Math.round((y1 - y0) * k) + 70;
  var X = function (x) { return 8 + (x - x0) * k; }, Y = function (y) { return H - 62 - (y - y0) * k; };
  function linea(a, b, extra) { return '<line x1="' + X(a[0]).toFixed(1) + '" y1="' + Y(a[1]).toFixed(1) + '" x2="' + X(b[0]).toFixed(1) + '" y2="' + Y(b[1]).toFixed(1) + '" ' + extra + '/>'; }
  var s = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
  G.muros.forEach(function (m) { s += linea(m[0], m[1], 'stroke="#1e2632" stroke-width="5" stroke-linecap="square"'); });
  s += linea(G.tabique_sin_largo[0], G.tabique_sin_largo[1], 'stroke="#1e2632" stroke-width="4" stroke-dasharray="6 4"');
  filas.forEach(function (r) {
    var c = G.cotas[r.id], a = c[0], b = c[1], hor = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]), t = 6;
    s += linea(a, b, 'stroke="#004eaa" stroke-width="1.6"');
    [a, b].forEach(function (q) {
      var px = X(q[0]), py = Y(q[1]);
      s += hor ? '<line x1="' + px.toFixed(1) + '" x2="' + px.toFixed(1) + '" y1="' + (py - t).toFixed(1) + '" y2="' + (py + t).toFixed(1) + '" stroke="#004eaa" stroke-width="1.6"/>'
        : '<line x1="' + (px - t).toFixed(1) + '" x2="' + (px + t).toFixed(1) + '" y1="' + py.toFixed(1) + '" y2="' + py.toFixed(1) + '" stroke="#004eaa" stroke-width="1.6"/>';
    });
    var mx = X((a[0] + b[0]) / 2), my = Y((a[1] + b[1]) / 2), lado = LADO[r.id];
    var tx = hor ? mx : lado === "izquierda" ? mx - 8 : mx + 8, ty = hor ? (lado === "abajo" ? my + 18 : my - 7) : my + 5, anc = hor ? "middle" : lado === "izquierda" ? "end" : "start";
    s += '<text x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" font-size="15" fill="#004eaa" text-anchor="' + anc + '" paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round">' + f(r.plano_m, 2) + ' m</text>';
  });
  var ly = H - 30;
  s += '<line x1="12" x2="46" y1="' + ly + '" y2="' + ly + '" stroke="#1e2632" stroke-width="5"/><text x="54" y="' + (ly + 5) + '" font-size="14">muro del plano</text>';
  s += '<line x1="176" x2="210" y1="' + ly + '" y2="' + ly + '" stroke="#1e2632" stroke-width="4" stroke-dasharray="6 4"/><text x="218" y="' + (ly + 5) + '" font-size="14">tabique de largo no medido</text>';
  s += '<line x1="418" x2="452" y1="' + ly + '" y2="' + ly + '" stroke="#004eaa" stroke-width="1.6"/><text x="460" y="' + (ly + 5) + '" font-size="14">distancia medida</text>';
  s += '<text x="12" y="' + (H - 8) + '" font-size="12" fill="#5a6371">Esquema de la Fig. A8.1 de la tesis, con las distancias de la Tabla A8.3. Celdas del mapa de 0,05 m.</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" role="img" aria-label="Plano del recinto de 2,14 por 1,91 m con tres pasillos y las once distancias medidas con huincha.">' + s + '</svg>\n';
}

var svg = plano();
if (process.argv.indexOf("--comprobar") >= 0) {
  var actual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
  if (actual !== svg) { console.error("img/diagramas/plano-recinto.svg no coincide con los datos. Ejecuta node herramientas/diagramas_plano.js"); process.exit(1); }
  console.log("Esquema del plano al día");
} else {
  fs.writeFileSync(destino, svg);
  console.log("Esquema del plano escrito en " + path.relative(raiz, destino));
}
