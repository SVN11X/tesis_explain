/* En el mundo real: los casos de mundo-real.html puestos sobre las mismas cuatro etapas del ciclo del robot.
   Cada frase sale de la tarjeta del caso en esa página y de su tabla «Lo que cambia con la escala».
   Donde la página no dice nada de una etapa, el interactivo lo dice en lugar de rellenar. */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;
  var ETAPAS = [["percibir", "Percibir"], ["estimar", "Estimar"], ["decidir", "Decidir"], ["moverse", "Moverse"]];
  var ROBOT = {
    percibir: "Un LiDAR 2D que gira.",
    estimar: "Encoders y SLAM, sin unidad inercial, con un mapa en rejilla de ocupación.",
    decidir: "Elige el próximo destino sin un plano previo, explorando por fronteras.",
    moverse: "Nav2 planifica sobre un mapa de costos y reacciona a los obstáculos, con un controlador local."
  };
  var CASOS = [
    { id: "aspiradoras", n: "Aspiradoras robot con LiDAR", lugar: "Hogares",
      percibir: "Un LiDAR 2D: una torre con un láser giratorio mide la casa.",
      estimar: "Guarda el plano en una rejilla de ocupación y lo reutiliza en cada limpieza." },
    { id: "el-teniente", n: "Elios 3 en la mina El Teniente", lugar: "Minería · Chile · 2026",
      percibir: "Un dron con LiDAR, en espacios confinados y sin GPS.",
      estimar: "Genera mapas 3D del interior." },
    { id: "apollo", n: "El vehículo lunar de Apollo", lugar: "La Luna · 1971 y 1972",
      percibir: "Un giroscopio para la dirección y odómetros en las ruedas para la distancia.",
      estimar: "Un computador calcula el rumbo y la distancia de regreso al módulo lunar." },
    { id: "tug", n: "Robots de reparto como TUG", lugar: "Hospitales",
      percibir: "Cámaras y láser.",
      estimar: "Se ubica en un mapa que ya conoce.",
      decidir: "Sigue rutas definidas digitalmente.",
      moverse: "Lleva insumos por los pasillos." },
    { id: "cerberus", n: "CERBERUS en el desafío de DARPA", lugar: "Subterráneo · Estados Unidos · 2021",
      estimar: "Mapea por su cuenta túneles y cuevas, sin GPS y con comunicación limitada.",
      decidir: "Explora por su cuenta hasta agotar lo desconocido.",
      moverse: "Robots con patas y aéreos navegan túneles, redes urbanas subterráneas y cuevas." },
    { id: "proteus", n: "Proteus, de Amazon", lugar: "Bodegas · Estados Unidos · 2022",
      percibir: "Varios sensores, entre ellos un LiDAR de alta precisión.",
      decidir: "Reacciona a los obstáculos.",
      moverse: "Planifica sobre un mapa de costos y circula entre trabajadores." },
    { id: "perseverance", n: "AutoNav, de Perseverance", lugar: "Marte · 2021",
      estimar: "Mantiene un mapa del terreno a su alrededor.",
      decidir: "Elige su camino.",
      moverse: "Replanifica para esquivar rocas. En el sol 200 recorrió por su cuenta 167 de 175 metros." }
  ];
  var SIN = "La página no dice nada de esta etapa.";

  V["casos-ciclo"] = function (el) {
    var nombre = "mr-caso-" + Math.floor(Math.random() * 1e6);
    var radios = CASOS.map(function (c, i) {
      return '<label class="mr-op"><input type="radio" name="' + nombre + '" value="' + i + '"' + (i === 0 ? " checked" : "") + '><span>' + U.esc(c.n) + '</span></label>';
    }).join("");
    el.innerHTML =
      '<fieldset class="mr-sel"><legend>Elige un caso</legend><div class="mr-ops">' + radios + '</div></fieldset>' +
      '<p class="mr-txt" data-o="txt" aria-live="polite" aria-atomic="true"></p>' +
      '<div class="mr-et" data-o="et"></div>' +
      '<p class="vnota">Solo se cuenta lo que dice la tarjeta de cada caso en esta página. Controlar y Probar antes no entran en este ciclo.</p>';
    var txt = el.querySelector('[data-o="txt"]'), et = el.querySelector('[data-o="et"]');

    function pintar(i) {
      var c = CASOS[i], con = 0;
      et.innerHTML = ETAPAS.map(function (e) {
        var t = c[e[0]];
        if (t) con++;
        return '<div class="mr-e"><h3>' + e[1] + '</h3>' +
          '<p><span class="mr-q">Robot explorador</span>' + U.esc(ROBOT[e[0]]) + '</p>' +
          '<p class="' + (t ? "" : "mr-sin") + '"><span class="mr-q">Este caso</span>' + U.esc(t || SIN) + '</p></div>';
      }).join("");
      txt.innerHTML = '<span class="mr-nom">' + U.esc(c.n) + '</span> · ' + U.esc(c.lugar) + '. La página dice algo en ' + con + ' de las 4 etapas. ' +
        '<a href="#' + c.id + '">Ver el caso</a>';
    }
    el.addEventListener("change", function (e) {
      if (e.target && e.target.type === "radio") pintar(+e.target.value);
    });
    pintar(0);
  };
})();
