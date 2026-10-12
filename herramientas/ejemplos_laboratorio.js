/*
  Genera los archivos SINTÉTICOS de ejemplo del Laboratorio de análisis.
  No son datos del robot ni de la tesis: sirven para probar el formato y las reglas.
  Desde la raíz: node herramientas/ejemplos_laboratorio.js [--comprobar]
  Solo utiliza módulos de Node, sin dependencias.
*/
"use strict";
var fs = require("fs"), path = require("path");
var raiz = path.resolve(__dirname, ".."), destino = path.join(raiz, "datos/ejemplos"), comprobar = process.argv.indexOf("--comprobar") >= 0;
var LIBRE = 254, OCUPADO = 0, DESCONOCIDO = 205;   // grises que escribe map_saver en modo trinario

/* Recinto rectangular de 4 × 3 m con un tabique. B explora más que A y una caja cambió de lugar. */
function mapa(variante) {
  var W = 120, H = 90, d = new Uint8Array(W * H).fill(DESCONOCIDO);
  function rect(x0, y0, x1, y1, v) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) d[y * W + x] = v; }
  var limiteExplorado = variante === "a" ? 70 : 98;
  rect(21, 16, limiteExplorado, 73, LIBRE);                    // interior observado
  rect(20, 15, 99, 15, OCUPADO); rect(20, 74, 99, 74, OCUPADO); // paredes inferior y superior
  rect(20, 15, 20, 74, OCUPADO); rect(99, 15, 99, 74, OCUPADO); // paredes izquierda y derecha
  if (variante === "a") { rect(71, 15, 99, 15, DESCONOCIDO); rect(71, 74, 99, 74, DESCONOCIDO); rect(99, 15, 99, 74, DESCONOCIDO); }
  if (variante === "a") rect(57, 16, 70, 40, DESCONOCIDO);         // zona tras el tabique, aún sin observar
  rect(55, 16, 56, 45, OCUPADO);                                // tabique
  if (variante === "a") rect(35, 55, 40, 60, OCUPADO); else rect(42, 25, 47, 30, OCUPADO);   // caja movida
  var cab = Buffer.from("P5\n# Mapa sintetico de ejemplo, no es un mapa del robot\n" + W + " " + H + "\n255\n", "ascii");
  return Buffer.concat([cab, Buffer.from(d)]);
}
function yaml(nombre) {
  return "# Ejemplo sintético para el Laboratorio de análisis. No es un mapa del robot.\n" +
    "image: " + nombre + "\nmode: trinary\nresolution: 0.05\norigin: [-3.0, -2.25, 0.0]\nnegate: 0\noccupied_thresh: 0.65\nfree_thresh: 0.196\n";
}
/* Registro de estados: una meta que ya aparece abortada, reemplazos cada 3,3 s, una completada
   y la última sin estado final porque el registro se cierra durante su cancelación. */
function estados() {
  var filas = ["mensaje,meta_id,estado,aceptada_s"], m = 0;
  function msg(lista) { lista.forEach(function (x) { filas.push(m + "," + x[0] + "," + x[1] + "," + x[2].toFixed(1)); }); m++; }
  msg([["meta01", "ABORTED", 0.0]]);
  msg([["meta02", "ACCEPTED", 0.4]]);
  msg([["meta02", "EXECUTING", 0.4]]);
  msg([["meta02", "EXECUTING", 0.4], ["meta03", "ACCEPTED", 3.7]]);
  msg([["meta02", "ABORTED", 0.4], ["meta03", "EXECUTING", 3.7]]);
  msg([["meta03", "EXECUTING", 3.7], ["meta04", "ACCEPTED", 7.0]]);
  msg([["meta03", "ABORTED", 3.7], ["meta04", "EXECUTING", 7.0]]);
  msg([["meta04", "SUCCEEDED", 7.0]]);
  msg([["meta05", "ACCEPTED", 9.1]]);
  msg([["meta05", "EXECUTING", 9.1]]);
  msg([["meta05", "EXECUTING", 9.1], ["meta06", "ACCEPTED", 12.4]]);
  msg([["meta05", "ABORTED", 9.1], ["meta06", "EXECUTING", 12.4]]);
  msg([["meta06", "CANCELING", 12.4]]);
  return filas.join("\n") + "\n";
}
var archivos = {
  "mapa-sintetico-a.pgm": mapa("a"), "mapa-sintetico-a.yaml": yaml("mapa-sintetico-a.pgm"),
  "mapa-sintetico-b.pgm": mapa("b"), "mapa-sintetico-b.yaml": yaml("mapa-sintetico-b.pgm"),
  "estados-metas-sintetico.csv": estados()
};
fs.mkdirSync(destino, { recursive: true });
Object.keys(archivos).forEach(function (n) {
  var ruta = path.join(destino, n), contenido = Buffer.isBuffer(archivos[n]) ? archivos[n] : Buffer.from(archivos[n], "utf8");
  if (comprobar) { if (!fs.existsSync(ruta) || !fs.readFileSync(ruta).equals(contenido)) { console.error("Desactualizado: datos/ejemplos/" + n); process.exit(1); } }
  else { fs.writeFileSync(ruta, contenido); console.log("Generado datos/ejemplos/" + n); }
});
if (comprobar) console.log("Ejemplos sintéticos al día");
