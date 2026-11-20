/* Gemelo digital: criterios de aprobación y lo que Gazebo no reproduce */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;

  /* Gemelo digital */
  V.gemelo = function (el) {
    var OK = U.ICO.OK, NO = U.ICO.NO;
    el.innerHTML =
      '<h4 class="vsub">Los cuatro criterios de la Tabla A2.2</h4>' +
      '<div class="criterios">' +
      '<div>' + OK + '<b>Cadena de marcos completa</b><small>sin marcos sueltos</small></div>' +
      '<div>' + OK + '<b>Láser y odometría estables</b><small>se publican en scan y odom</small></div>' +
      '<div>' + OK + '<b>Se mueve como el modelo</b><small>avanza y gira según el modelo diferencial</small></div>' +
      '<div>' + OK + '<b>Mismas ruedas</b><small>radio y separación iguales al prototipo</small></div></div>' +
      '<h4 class="vsub">Lo que Gazebo no reproduce</h4>' +
      '<div class="chips-no"><span>' + NO + 'la ley del firmware</span><span>' + NO + 'la zona muerta del driver</span><span>' + NO + 'la fricción real</span><span>' + NO + 'el ruido del láser</span><span>' + NO + 'las latencias</span></div>' +
      '<h4 class="vsub">Cifras que no se comparan</h4>' +
      '<div class="mide"><div class="m-fila"><span class="eyebrow">Simulación</span><div class="m-cmp"><span class="caja">lo ordenado</span><span class="vs">frente a</span><span class="caja">su propia odometría</span></div><b class="num">3,39 %</b></div>' +
      '<div class="m-fila"><span class="eyebrow">Robot real</span><div class="m-cmp"><span class="caja">lo ordenado</span><span class="vs">frente a</span><span class="caja ink">la cinta métrica</span></div><b class="num">7,18 %</b></div></div>' +
      '<p class="vnota">La pose verdadera de Gazebo no quedó registrada, así que en simulación no hay una referencia independiente. La cifra del robot que se parece al 3,39 es el 3,8 % de los encoders frente a lo ordenado.</p>' +
      '<div class="comparar"><div><b>Capturas de Gazebo Classic</b><span>Simulación. El robot y el mundo son modelos.</span></div><div><b>Cámara cenital junto a RViz</b><span>Robot real. RViz solo muestra los datos que envía el robot.</span></div></div>';
  };
})();
