/* Diagramas de ensayos, decisiones, gemelo digital y profesor externo */
(function () {
  "use strict";
  var V = window.VISUALES, U = window.U;
  var OK = V.ICO.OK, NO = V.ICO.NO;

  /* Recta de 2 metros */
  V.odometria = function (el) {
    el.innerHTML =
      '<div class="tres-datos"><div><b class="num">2,000 m</b><span>lo ordenado, 0,13 m/s durante 15,4 s</span></div><div class="az"><b class="num">1,924 m</b><span>lo que estiman los encoders</span></div><div class="ink"><b class="num">1,856 m</b><span>lo que avanzó de verdad, con cinta</span></div></div>' +
      '<div class="od-g"></div><p class="vnota">Promedio de 5 repeticiones en el robot real. Eje recortado para ver la diferencia.</p>';
    var cont = el.querySelector(".od-g");
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), H = 160, a = 1.83, b = 2.02, l = 16, r = 16, yL = 78;
      var x = function (v) { return l + (v - a) / (b - a) * (W - l - r); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Distancias de la recta de 2 metros">';
      s += '<line class="k-linea" stroke-width="2" x1="' + l + '" x2="' + (W - r) + '" y1="' + yL + '" y2="' + yL + '"/>';
      [1.85, 1.9, 1.95, 2.0].forEach(function (t) { s += '<line class="k-linea" x1="' + x(t) + '" x2="' + x(t) + '" y1="' + (yL - 4) + '" y2="' + (yL + 4) + '"/><text class="t-s" x="' + x(t) + '" y="' + (H - 4) + '" text-anchor="middle">' + U.fmt(t, 2) + ' m</text>'; });
      s += '<path class="k-rojo" fill="none" stroke-width="1.8" d="M' + x(1.856) + ' ' + (yL - 12) + ' V' + (yL - 30) + ' H' + x(2.0) + ' V' + (yL - 12) + '"/>';
      var chico = W < 520;
      s += '<text class="t-m t-b" style="fill:var(--rojo)" x="' + ((x(1.856) + x(2.0)) / 2) + '" y="' + (yL - 36) + '" text-anchor="middle">' + (chico ? '7,18 % seguimiento' : '7,18 % seguimiento, cinta frente a lo ordenado') + '</text>';
      s += '<path class="k-verde" fill="none" stroke-width="1.8" d="M' + x(1.856) + ' ' + (yL + 12) + ' V' + (yL + 28) + ' H' + x(1.924) + ' V' + (yL + 12) + '"/>';
      s += chico ? '<text class="t-m t-b" style="fill:var(--verde-texto)" x="' + ((x(1.856) + x(1.924)) / 2) + '" y="' + (yL + 44) + '" text-anchor="middle">3,63 % odometría</text>' : '<text class="t-m t-b" style="fill:var(--verde-texto)" x="' + (x(1.924) + 8) + '" y="' + (yL + 30) + '">3,63 % odometría, encoders frente a cinta</text>';
      s += '<circle class="f-ink" cx="' + x(1.856) + '" cy="' + yL + '" r="6"/><circle class="f-azul" cx="' + x(1.924) + '" cy="' + yL + '" r="6"/><circle class="f-sup k-ink" stroke-width="2" cx="' + x(2.0) + '" cy="' + yL + '" r="6"/>';
      cont.innerHTML = s + '</svg>';
    }
    dibujar();
    U.alCambiarAncho(cont, dibujar);
  };

  /* Iteración 2 */
  V.iteracion2 = function (el) {
    el.innerHTML =
      '<h4 class="vsub">Las señales de esa corrida</h4>' +
      '<div class="senales"><div class="sen az"><span class="eyebrow">Encoders</span><b class="num">3,851 m</b><span>la odometría sumó distancia</span></div>' +
      '<div class="sen ok"><span class="eyebrow">Láser y mapa</span><b>el mapa no creció</b><span>la señal estaba, pero el ensayo no la usa para detenerse</span></div>' +
      '<div class="sen ink"><span class="eyebrow">Posición real</span><b class="num">0 m</b><span>el robot no se movió de su posición inicial</span></div></div>' +
      '<h4 class="vsub">Por qué la red no lo explica</h4>' +
      '<div class="flujo"><div class="caja"><b>Encoder</b><small>pulsos de giro de la rueda</small></div><div class="flecha-d"></div>' +
      '<div class="caja"><b>Arduino</b><small>cuenta los pulsos</small></div><div class="flecha-d"></div>' +
      '<div class="caja azul"><b>Raspberry</b><small>calcula la odometría con sus propios conteos</small></div><div class="flecha-d punteada"><span>Wi-Fi</span></div>' +
      '<div class="caja"><b>Computador</b><small>la red queda después de la odometría</small></div></div>' +
      '<h4 class="vsub">El verificador de progreso tuvo tiempo de actuar</h4><div class="vp-g"></div>' +
      '<p class="vnota">14 metas en 5,09 minutos dan cerca de 22 s por meta. El verificador pide 5 cm cada 6 s. Si actuó o no, no está registrado y se puede revisar en el rosbag.</p>';
    var cont = el.querySelector(".vp-g");
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), H = 96, l = 12, r = 12, T = 22;
      var x = function (t) { return l + t / T * (W - l - r); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Una meta de 22 segundos frente a ventanas de 6 segundos">';
      s += '<rect class="f-azul-s" x="' + x(0) + '" y="16" width="' + (x(T) - x(0)) + '" height="20" rx="4"/><text class="t-m" x="' + (x(0) + 8) + '" y="30">una meta, unos 22 s en promedio</text>';
      for (var k = 0; k * 6 < T; k++) {
        var a = x(k * 6), b = x(Math.min(T, (k + 1) * 6));
        s += '<rect class="f-ambar-s k-ambar" x="' + (a + 1) + '" y="46" width="' + (b - a - 2) + '" height="20" rx="4"/>';
        if (b - a > 60) s += '<text class="t-s" x="' + ((a + b) / 2) + '" y="60" text-anchor="middle">6 s, 5 cm</text>';
      }
      [0, 6, 12, 18, 22].forEach(function (t) { s += '<text class="t-s" x="' + x(t) + '" y="' + (H - 6) + '" text-anchor="middle">' + t + ' s</text>'; });
      cont.innerHTML = s + '</svg>';
    }
    dibujar();
    U.alCambiarAncho(cont, dibujar);
  };

  /* Giro */
  V.giro = function (el) {
    el.innerHTML =
      '<div class="flujo"><div class="caja"><b>El script pide</b><small>0,4 rad/s durante 15,7 s, una vuelta a esa velocidad</small></div><div class="flecha-d"></div>' +
      '<div class="caja ambar"><b>El controlador limita</b><small>a 0,35 rad/s</small></div><div class="flecha-d"></div>' +
      '<div class="caja"><b>Máximo ideal</b><small>0,35 por 15,7 s da 5,5 rad, unos 315°</small></div></div>' +
      '<div class="gi-g"></div>' +
      '<div class="vley"><span><i class="lin ambar"></i>315°, límite ideal</span><span><i class="lin-disc"></i>360°, nominal</span><span><i class="pt azul"></i>cinco giros medidos en el robot</span></div>' +
      '<p class="vnota">Todos los giros superaron los 315°. La causa no se determinó. Los rosbag tienen /odom para revisarlo sin repetir el ensayo.</p>';
    var cont = el.querySelector(".gi-g"), med = [355.7, 340, 380, 370, 356];
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), H = 120, a = 300, b = 390, l = 16, r = 16, yL = 64;
      var x = function (v) { return l + (v - a) / (b - a) * (W - l - r); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ángulos medidos frente a 315 y 360 grados">';
      s += '<rect class="f-ambar-s" x="' + x(300) + '" y="' + (yL - 22) + '" width="' + (x(315) - x(300)) + '" height="44"/>';
      s += '<line class="k-linea" stroke-width="2" x1="' + l + '" x2="' + (W - r) + '" y1="' + yL + '" y2="' + yL + '"/>';
      for (var t = 300; t <= 390; t += 15) s += '<text class="t-s" x="' + x(t) + '" y="' + (H - 6) + '" text-anchor="middle">' + t + '°</text>';
      s += '<line class="k-ambar" stroke-width="2.5" x1="' + x(315) + '" x2="' + x(315) + '" y1="' + (yL - 30) + '" y2="' + (yL + 26) + '"/>';
      s += '<line class="k-muted" stroke-width="2" stroke-dasharray="4 4" x1="' + x(360) + '" x2="' + x(360) + '" y1="' + (yL - 30) + '" y2="' + (yL + 26) + '"/>';
      med.forEach(function (m, i) { s += '<circle class="f-azul" cx="' + x(m) + '" cy="' + (yL + (i % 2 ? 10 : -10)) + '" r="6"><title>' + U.fmt(m, 1) + '°</title></circle>'; });
      s += '<text class="t-s" x="' + (x(315) + 5) + '" y="' + (yL - 34) + '">315°</text><text class="t-s" x="' + (x(360) + 5) + '" y="' + (yL - 34) + '">360°</text>';
      cont.innerHTML = s + '</svg>';
    }
    dibujar();
    U.alCambiarAncho(cont, dibujar);
  };

  /* Robot y computador */
  V.arquitectura = function (el) {
    el.innerHTML =
      '<div class="arq">' +
      '<div class="lado"><span class="eyebrow">En el robot · rápido y crítico</span>' +
      '<div class="caja"><b>Arduino Nano</b><small>lee los encoders y controla la velocidad de cada rueda. Si no recibe comandos, para los motores</small></div>' +
      '<div class="caja"><b>Raspberry Pi 4</b><small>ros2_control, odometría y lectura del láser</small></div></div>' +
      '<div class="red"><div class="caja punteada"><b>Red Wi-Fi dedicada</b><small>router de viaje con IP fijas. ROS 2 sin maestro central</small></div></div>' +
      '<div class="lado"><span class="eyebrow">En el computador · cálculo pesado</span>' +
      '<div class="caja azul"><b>slam_toolbox</b><small>construye el mapa y estima la pose</small></div>' +
      '<div class="caja azul"><b>Nav2 y explorador</b><small>planifican y eligen fronteras</small></div>' +
      '<div class="caja"><b>RViz2</b><small>solo para supervisar</small></div></div>' +
      '</div>';
  };

  /* Versiones congeladas */
  V.versiones = function (el) {
    el.innerHTML =
      '<div class="pila"><span class="eyebrow">Congelado al inicio del proyecto</span>' +
      '<div class="capa">Paquetes base adaptados<small>articubot_one, diffdrive_arduino, explore_lite</small></div>' +
      '<div class="capa">Gazebo Classic y gazebo_ros2_control<small>los complementos disponibles para esta base</small></div>' +
      '<div class="capa az">ROS 2 Foxy y Nav2</div>' +
      '<div class="capa">Ubuntu 20.04</div></div>' +
      '<div class="comparar"><div><b>Sí fue criterio</b><span>Arquitectura distribuida sin maestro central y el ecosistema de Nav2.</span></div><div><b>No fue criterio</b><span>El fin de soporte de ROS 1, porque Foxy también está fuera de soporte.</span></div></div>' +
      '<div class="mejora"><b>Cómo se resuelve.</b> Migrar a mitad del proyecto obligaba a rehacer y volver a probar todo. El fin de vida es una limitación declarada y la migración es el trabajo futuro 3.</div>';
  };

  /* Gemelo digital */
  V.gemelo = function (el) {
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

  /* Costo */
  V.costo = function (el) {
    var max = 1619188;
    function pct(v) { return (v / max * 100).toFixed(2) + "%"; }
    function n(v) { return v.toLocaleString("es-CL").replace(/\./g, " "); }
    el.innerHTML =
      '<div class="costos">' +
      '<div class="ct"><span>Este robot</span><div class="ct-pista"><i class="c1" style="width:' + pct(250530) + '"></i><i class="c2" style="width:' + pct(194113) + '"></i></div><b class="num">$' + n(444643) + '</b><em>32 % menos que el Burger</em></div>' +
      '<div class="ct"><span>Proyecto completo</span><div class="ct-pista"><i class="c1" style="width:' + pct(250530) + '"></i><i class="c2" style="width:' + pct(194113) + '"></i><i class="c3" style="width:' + pct(137804) + '"></i></div><b class="num">$' + n(582447) + '</b><em>11 % menos que el Burger</em></div>' +
      '<div class="ct"><span>TurtleBot 3 Burger</span><div class="ct-pista"><i class="cb" style="width:' + pct(656092) + '"></i></div><b class="num">$' + n(656092) + '</b><em>trae IMU y actuadores integrados</em></div>' +
      '<div class="ct"><span>TurtleBot 3 Waffle Pi</span><div class="ct-pista"><i class="cb" style="width:' + pct(1619188) + '"></i></div><b class="num">$' + n(1619188) + '</b><em>agrega cámara y una base mayor</em></div></div>' +
      '<div class="vley"><span><i class="cu azul"></i>componentes principales, $250 530</span><span><i class="cu azul-m"></i>energía, montaje y cables, $194 113</span><span><i class="cu verde"></i>operación y desarrollo, $137 804</span><span><i class="cu gris"></i>precio de catálogo, sin envío ni impuestos</span></div>' +
      '<h4 class="vsub">Qué hay en los $137 804 de operación y desarrollo</h4>' +
      '<div class="items"><span>Router de viaje<b class="num">$22 140</b></span><span>Cables de red<b class="num">$8 376</b></span><span>Cargador de baterías<b class="num">$16 169</b></span><span>Baterías de repuesto<b class="num">$41 436</b></span><span>HDMI inalámbrico, cables y hub USB<b class="num">$49 683</b></span></div>' +
      '<p class="vnota">Tablas A1.1 y A1.2 de la tesis. Ningún monto incluye herramientas ni el computador.</p>';
  };

  /* Dónde fallaría */
  V.fallaria = function (el) {
    var lado = '<svg class="vsvg" viewBox="0 0 400 200" role="img" aria-label="Vista lateral del plano del láser">' +
      '<line class="k-ink" stroke-width="2" x1="10" y1="170" x2="390" y2="170"/>' +
      '<rect class="f-azul" x="30" y="138" width="56" height="30" rx="4"/><rect class="f-obst" x="50" y="124" width="16" height="14" rx="2"/>' +
      '<line class="k-rojo" stroke-width="2" stroke-dasharray="6 4" x1="66" y1="131" x2="390" y2="131"/>' +
      '<text class="t-s" x="100" y="124" style="fill:var(--rojo)">plano del láser</text>' +
      '<rect class="f-desc k-muted" x="190" y="78" width="110" height="10" rx="2"/><line class="k-muted" stroke-width="5" x1="198" y1="88" x2="198" y2="170"/><line class="k-muted" stroke-width="5" x1="292" y1="88" x2="292" y2="170"/>' +
      '<text class="t-m" x="245" y="70" text-anchor="middle">la cubierta no la ve</text>' +
      '<circle class="f-verde" cx="198" cy="131" r="5"/><circle class="f-verde" cx="292" cy="131" r="5"/><text class="t-s" x="245" y="150" text-anchor="middle">las patas sí</text>' +
      '<rect class="f-desc k-muted" x="330" y="150" width="40" height="20" rx="2"/><text class="t-m" x="350" y="192" text-anchor="middle">lo bajo, tampoco</text>' +
      '</svg>';
    var arriba = '<svg class="vsvg" viewBox="0 0 400 215" role="img" aria-label="Vista superior de un paso estrecho">' +
      '<rect class="f-obst" x="10" y="40" width="380" height="12"/>' +
      '<rect class="f-ambar-s" x="10" y="52" width="380" height="45"/>' +
      '<text class="t-s" x="386" y="80" text-anchor="end" style="fill:var(--ambar)">inflación 0,15 m</text>' +
      '<circle class="f-rojo-s k-rojo" fill-opacity=".45" stroke-width="1.5" stroke-dasharray="4 3" cx="160" cy="103" r="72"/>' +
      '<g transform="rotate(30 160 103)"><rect class="f-azul" fill-opacity=".8" x="102" y="61" width="116" height="84" rx="6"/></g>' +
      '<path class="k-rojo" stroke-width="4" d="M109 52 H211"/>' +
      '<text class="t-m t-b" x="160" y="30" text-anchor="middle" style="fill:var(--rojo)">la esquina llega a la pared</text>' +
      '<circle class="f-sup k-ink" stroke-width="2" cx="160" cy="103" r="5"/>' +
      '<path class="k-ink" stroke-width="1.2" fill="none" d="M165 106 L248 150"/>' +
      '<text class="t-m" x="252" y="154">centro, lo único que</text><text class="t-m" x="252" y="169">revisa el planificador</text>' +
      '<text class="t-s" x="160" y="200" text-anchor="middle" style="fill:var(--rojo)">alcance de la esquina, 0,24 m</text>' +
      '</svg>';
    el.innerHTML = '<div class="dos-pan"><figure><figcaption><b>Visto de lado</b><span>El láser mide en un solo plano</span></figcaption>' + lado + '</figure>' +
      '<figure><figcaption><b>Visto desde arriba</b><span>Un paso estrecho</span></figcaption>' + arriba + '</figure></div>' +
      '<div class="chips-no"><span>' + NO + 'vidrio y superficies muy reflectantes</span><span>' + NO + 'superficies muy absorbentes</span><span>' + NO + 'obstáculos rápidos</span><span>' + NO + 'suelos irregulares</span><span>' + NO + 'recorridos largos sin IMU</span></div>' +
      '<p class="vnota">Dibujos ilustrativos, no a escala exacta. El centro queda fuera de la zona de inflación, así que su costo es nulo, pero la esquina puede llegar a la pared. Su efecto no se cuantificó y es el trabajo futuro 4.</p>';
  };
})();
