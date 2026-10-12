/*
  Regenera la figura estática que respalda «Ajusta un PID» cuando el interactivo no se monta.
  Usa el mismo modelo ilustrativo de js/control-modelo.js, así la figura no puede contradecir
  las lecturas del simulador. Desde la raíz: node herramientas/diagramas_control.js
  Solo utiliza módulos de Node, sin dependencias.
*/
"use strict";
var fs = require("fs"), path = require("path");
var C = require("../js/control-modelo.js");
var raiz = path.resolve(__dirname, ".."), destino = path.join(raiz, "img/diagramas");

/* Los tres ejemplos que el texto de respaldo describe, con los valores de los botones del simulador. */
var CASOS = [
  { nombre: "Solo P (P 1200)", c: { kp: 1200, ki: 0, kd: 0, zona: false }, color: "#004eaa", trazo: "" },
  { nombre: "PI equilibrado (P 600, I 2600)", c: { kp: 600, ki: 2600, kd: 0, zona: false }, color: "#3a6b0e", trazo: "8 4" },
  { nombre: "PI agresivo (P 1500, I 9000)", c: { kp: 1500, ki: 9000, kd: 0, zona: false }, color: "#9a4505", trazo: "2 3" }
];

function f(v, n) { return v.toFixed(n).replace(".", ","); }

function pidRespaldo() {
  var W = 640, H = 330, ml = 58, mr = 18, mt = 34, mb = 92, S = C.PID_ILUSTRATIVO;
  var x = function (t) { return ml + t / S.T * (W - ml - mr); }, y = function (v) { return mt + (1 - v / 0.2) * (H - mt - mb); };
  var b = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
  b += '<text x="' + ml + '" y="22" font-size="15" font-weight="700">Respuesta del modelo ilustrativo a 0,13 m/s</text>';
  [0, 0.05, 0.1, 0.15, 0.2].forEach(function (v) {
    b += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#e5e7eb"/>';
    b += '<text x="' + (ml - 6) + '" y="' + (y(v) + 4) + '" font-size="12" text-anchor="end" fill="#5a6371">' + f(v, 2) + '</text>';
  });
  for (var t = 0; t <= S.T; t++) b += '<text x="' + x(t) + '" y="' + (H - mb + 18) + '" font-size="12" text-anchor="middle" fill="#5a6371">' + t + ' s</text>';
  b += '<text x="14" y="' + (mt + (H - mt - mb) / 2) + '" font-size="12" fill="#5a6371" transform="rotate(-90 14 ' + (mt + (H - mt - mb) / 2) + ')" text-anchor="middle">m/s</text>';
  b += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y(S.REF) + '" y2="' + y(S.REF) + '" stroke="#1e2632" stroke-dasharray="5 4"/>';
  CASOS.forEach(function (k, i) {
    var d = C.simularPID(k.c);
    b += '<path d="M' + d.map(function (p) { return x(p[0]).toFixed(1) + " " + y(p[1]).toFixed(1); }).join(" L") + '" fill="none" stroke="' + k.color + '" stroke-width="2.6"' + (k.trazo ? ' stroke-dasharray="' + k.trazo + '"' : "") + '/>';
    var ly = H - mb + 40 + i * 17;
    b += '<line x1="' + ml + '" x2="' + (ml + 34) + '" y1="' + (ly - 4) + '" y2="' + (ly - 4) + '" stroke="' + k.color + '" stroke-width="2.6"' + (k.trazo ? ' stroke-dasharray="' + k.trazo + '"' : "") + '/>';
    b += '<text x="' + (ml + 42) + '" y="' + ly + '" font-size="12">' + k.nombre + '</text>';
  });
  b += '<line x1="' + (W - 210) + '" x2="' + (W - 176) + '" y1="' + (H - mb + 36) + '" y2="' + (H - mb + 36) + '" stroke="#1e2632" stroke-dasharray="5 4"/><text x="' + (W - 170) + '" y="' + (H - mb + 40) + '" font-size="12">referencia 0,13 m/s</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Tres respuestas del modelo ilustrativo: solo P queda bajo la referencia, PI la alcanza sin pasarse y PI agresivo sube más rápido y se pasa"><style>text{font-family:Arial,sans-serif;fill:#1e2632}</style>' + b + '</svg>';
}

/* Cifras del texto de respaldo, para que la prueba compare página y modelo. */
function cifras() {
  return CASOS.map(function (k) { var m = C.medidasPID(C.simularPID(k.c)); return { nombre: k.nombre, fin: m.fin, err: m.err, os: m.os, tr: m.tr }; });
}

if (require.main === module) {
  fs.mkdirSync(destino, { recursive: true });
  fs.writeFileSync(path.join(destino, "pid-respaldo.svg"), pidRespaldo() + "\n");
  console.log("Generada pid-respaldo.svg");
  cifras().forEach(function (c) { console.log("  " + c.nombre + ": final " + f(c.fin, 3) + " m/s, error " + f(c.err, 3) + ", sobreimpulso " + f(c.os, 1) + " %, subida " + (c.tr == null ? "no llega" : f(c.tr, 2) + " s")); });
}
module.exports = { pidRespaldo: pidRespaldo, cifras: cifras };
