/*
  Regenera las figuras estáticas que respaldan los interactivos del capítulo 05.
  Desde la raíz: node herramientas/diagramas_mapeo.js
  Solo utiliza módulos de Node, sin dependencias.
*/
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var raiz = path.resolve(__dirname, ".."), ctx = { window: {}, Math: Math };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, "js/mapeo.js"), "utf8"), ctx);
var M = ctx.window.MAPEO, destino = path.join(raiz, "img/diagramas");
fs.mkdirSync(destino, { recursive: true });
var figuras = {
  "lidar-plano.svg": M.lidarLateralSVG(),
  "rejilla-ocupacion.svg": M.rejillaSVG(M.rejilla(2), null, false),
  "trejos-karto.svg": M.trejosSVG(),
  "rviz-colores.svg": M.rvizSVG(true, null)
};
Object.keys(figuras).forEach(function (nombre) {
  fs.writeFileSync(path.join(destino, nombre), figuras[nombre] + "\n");
  console.log("Generada " + nombre);
});
