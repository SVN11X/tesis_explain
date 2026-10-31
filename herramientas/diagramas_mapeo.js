/*
  Regenera las figuras estáticas que respaldan los interactivos del capítulo 05.
  Desde la raíz: node herramientas/diagramas_mapeo.js
  Con --comprobar no escribe nada: falla si alguna figura guardada no coincide con los modelos.
  Solo utiliza módulos de Node, sin dependencias.
*/
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var raiz = path.resolve(__dirname, ".."), ctx = { window: {}, Math: Math };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, "js/mapeo.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, "js/slam-proceso.js"), "utf8"), ctx);
var M = ctx.window.MAPEO, destino = path.join(raiz, "img/diagramas");
/* Los archivos sueltos necesitan sus estilos, porque no cargan css/mapeo.css. */
M.svgEstatico = true;
var comprobar = process.argv.indexOf("--comprobar") >= 0, atrasadas = [];
var figuras = {
  "candidatos-cierre.svg": ctx.window.SLAM_PROCESO.candidatosSVG(0, true),
  "lidar-plano.svg": M.lidarLateralSVG(),
  "rejilla-ocupacion.svg": M.rejillaSVG(M.rejilla(2), null, false),
  "trejos-karto.svg": M.trejosSVG(),
  "rviz-colores.svg": M.rvizSVG(true, null)
};
if (!comprobar) fs.mkdirSync(destino, { recursive: true });
Object.keys(figuras).forEach(function (nombre) {
  var ruta = path.join(destino, nombre), svg = figuras[nombre] + "\n";
  if (comprobar) { if (!fs.existsSync(ruta) || fs.readFileSync(ruta, "utf8") !== svg) atrasadas.push(nombre); }
  else { fs.writeFileSync(ruta, svg); console.log("Generada " + nombre); }
});
if (comprobar) {
  if (atrasadas.length) { console.error("No coinciden con los modelos: img/diagramas/" + atrasadas.join(", img/diagramas/") + ". Ejecuta node herramientas/diagramas_mapeo.js"); process.exit(1); }
  console.log("Figuras del capítulo 05 al día");
}
