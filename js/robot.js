/* Robot: el camino de una orden, arquitectura, costo, fotos del prototipo y esquema de conexiones */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;

  /* Camino de una orden */
  V.camino = function (el) {
    var E = [
      { eq: "Computador", t: "Nav2 y DWB", v: "velocidad lineal y angular, hasta 0,15 m/s" },
      { eq: "Computador", t: "twist_mux", v: "prioridad al mando manual, luego viaja por la red Wi-Fi" },
      { eq: "Raspberry Pi 4", t: "Controlador diferencial", v: "recorta a 0,13 m/s y 0,35 rad/s, reparte entre las ruedas" },
      { eq: "Raspberry Pi 4", t: "DiffDriveArduino", v: "pasa a ticks por ciclo, trunca a entero, comando m a 30 Hz" },
      { eq: "Arduino Nano", t: "doPID cada 33 ms", v: "compara con los ticks del encoder, PWM recortado a 255" },
      { eq: "Motor", t: "L298N y motorreductor", v: "la rueda gira" }
    ];
    el.innerHTML = '<div class="vctl"><button type="button" class="vbtn" data-a="enviar">Enviar una orden</button><span class="vestado" aria-live="polite"></span></div>' +
      '<ol class="camino">' + E.map(function (e, i) {
        return '<li data-i="' + i + '"><span class="eq">' + U.esc(e.eq) + '</span><b>' + U.esc(e.t) + '</b><small>' + U.esc(e.v) + '</small></li>';
      }).join("") + '</ol>' +
      '<div class="vuelta"><span class="eyebrow">De vuelta</span><p>El encoder cuenta pulsos con interrupciones. La Raspberry los pide con el comando e y calcula la odometría.</p></div>' +
      '<div class="seguro"><b>2 s sin comandos</b><span>el Arduino detiene los motores</span></div>';
    var lis = el.querySelectorAll(".camino li"), est = el.querySelector(".vestado"), timer = null;
    lis.forEach(function (li) { li.classList.add("on"); });
    el.querySelector('[data-a="enviar"]').addEventListener("click", function () {
      clearTimeout(timer);
      lis.forEach(function (li) { li.classList.remove("on", "act"); });
      var i = 0, paso = U.quieto() ? 0 : 650;
      (function sig() {
        if (i > 0) lis[i - 1].classList.remove("act");
        if (i >= lis.length) { est.textContent = "La orden llegó al motor."; return; }
        lis[i].classList.add("on", "act");
        est.textContent = E[i].t + ". " + E[i].v + ".";
        i++;
        timer = setTimeout(sig, paso);
      })();
    });
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

  /* Visor de fotos del prototipo. Se cambia de vista con los botones, deslizando la foto con el
     dedo o el ratón, o con las flechas cuando el visor tiene el foco. Sin animaciones. */
  V.vistas = function (el) {
    var VISTAS = [
      { id: "frente", t: "Frente", w: 1400, h: 1156, alt: "Frente del robot: carcasa negra curva impresa en 3D con dos franjas amarillas, un panel vertical al centro con un lente redondo y el LiDAR arriba.", cap: "Frente. El lente del panel frontal no forma parte del sistema evaluado." },
      { id: "derecha", t: "Derecha", w: 1400, h: 1133, alt: "El robot visto desde su costado derecho: carcasa negra impresa en 3D con dos franjas amarillas y el LiDAR sobre la cubierta.", cap: "Costado derecho, con los puertos de acceso atrás." },
      { id: "lateral", t: "Lateral", w: 1400, h: 1108, alt: "El robot visto de lado: carcasa negra impresa en 3D, dos franjas amarillas y el LiDAR sobre la cubierta.", cap: "Vista lateral. Fig. 4.1 de la tesis." },
      { id: "planta", t: "Desde arriba", w: 900, h: 958, alt: "El robot visto desde arriba: cubierta negra en forma de U, el LiDAR al centro y el visualizador de tensión en una esquina.", cap: "Vista en planta, con el láser al centro. Fig. 4.4 de la tesis." }
    ];
    var n = VISTAS.length, i = 0;
    el.innerHTML =
      '<div class="visor" tabindex="0" role="group" aria-roledescription="visor de fotos" aria-label="Fotos del prototipo. Usa las flechas izquierda y derecha para cambiar de vista.">' +
      '<div class="visor-marco"><picture><source type="image/webp"><img decoding="async"></picture></div>' +
      '<p class="visor-pie" aria-live="polite"></p></div>' +
      '<div class="segmento visor-ctl" role="group" aria-label="Elegir vista">' + VISTAS.map(function (v, k) { return '<button type="button" data-k="' + k + '" aria-pressed="false">' + v.t + '</button>'; }).join("") + '</div>' +
      '<p class="vnota">Fotografías del autor. Desliza la foto o usa las flechas del teclado para cambiar de vista.</p>';
    var visor = el.querySelector(".visor"), marco = el.querySelector(".visor-marco"), src = el.querySelector("source"), img = el.querySelector("img"), pie = el.querySelector(".visor-pie");
    var btns = el.querySelectorAll(".visor-ctl button");
    function ir(k) {
      i = (k + n) % n;
      var v = VISTAS[i], base = "img/fotos/robot-" + v.id;
      src.srcset = base + ".webp"; img.src = base + ".jpg"; img.alt = v.alt; img.width = v.w; img.height = v.h;
      pie.textContent = v.cap + " Vista " + (i + 1) + " de " + n + ".";
      btns.forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { ir(+b.getAttribute("data-k")); }); });
    visor.addEventListener("keydown", function (e) {
      var k = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: n - 1 }[e.key];
      if (k == null) return;
      e.preventDefault(); ir(k);
    });
    var x0 = null;
    marco.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    marco.addEventListener("pointercancel", function () { x0 = null; });
    marco.addEventListener("pointerup", function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) ir(dx < 0 ? i + 1 : i - 1);
    });
    marco.addEventListener("dragstart", function (e) { e.preventDefault(); });
    ir(0);
    /* las otras vistas se piden recién cuando el visor ya está en pantalla */
    VISTAS.forEach(function (v, k) { if (k) { var p = new Image(); p.src = "img/fotos/robot-" + v.id + (window.HTMLPictureElement ? ".webp" : ".jpg"); } });
    el.estadoVista = function () { return { k: i, id: VISTAS[i].id, alt: img.alt, src: img.getAttribute("src"), pie: pie.textContent }; };
  };

  /* Esquema de conexiones con un punto sobre cada componente rotulado en la figura.
     Las posiciones van en porcentaje del ancho y el alto de la imagen, así escalan con ella. */
  V.esquema = function (el) {
    var MOTOR = "Motorreductor JGA25-370 de 12 V con encoder incremental de cuadratura. Los canales del encoder llegan al Arduino, que cuenta el giro de la rueda.";
    var P = [
      { x: 11.3, y: 87.4, t: "Batería de 12 V", d: "Batería de 12 V y 3000 mAh. Es la fuente de energía del robot y alimenta el bus de 12 V." },
      { x: 5.0, y: 28.6, t: "Fusible", d: "Protege la entrada de la batería. Figura en la tabla de materiales junto con el interruptor, los conectores XT60 y el bloque de distribución." },
      { x: 12.8, y: 20.8, t: "Interruptor", d: "Interruptor de encendido, en el panel de control de la cubierta." },
      { x: 8.6, y: 50.5, t: "Distribución de 12 V", d: "Reparte el bus de 12 V de la batería entre el driver de los motores y el módulo reductor." },
      { x: 8.6, y: 62.5, t: "Distribución de 12 V", d: "Reparte el bus de 12 V de la batería entre el driver de los motores y el módulo reductor." },
      { x: 21.8, y: 59.7, t: "Multímetro", d: "Visualizador de tensión y corriente, en el panel de control de la cubierta." },
      { x: 16.4, y: 38.3, t: "Regulador de tensión", d: "Módulo reductor DC-DC de 25 W. Toma el bus de 12 V y genera el riel regulado de 5 V para la Raspberry Pi, el Arduino, el LiDAR y los periféricos." },
      { x: 22.7, y: 9.6, t: "Distribución de 5 V", d: "Reparte el riel regulado de 5 V. Separar la electrónica del bus de los motores reduce la interferencia eléctrica sobre el control." },
      { x: 22.7, y: 24.9, t: "Distribución de 5 V", d: "Reparte el riel regulado de 5 V. Separar la electrónica del bus de los motores reduce la interferencia eléctrica sobre el control." },
      { x: 35.0, y: 61.2, t: "Driver L298N", d: "Aplica a los motores las señales PWM del Arduino, con la tensión del bus de 12 V." },
      { x: 36.7, y: 39.3, t: "Motor derecho con encoder", d: MOTOR },
      { x: 36.7, y: 89.1, t: "Motor izquierdo con encoder", d: MOTOR },
      { x: 56.2, y: 61.7, t: "Arduino Nano", d: "Lee los encoders y ejecuta el control de velocidad de cada rueda. Se comunica con la Raspberry Pi por un enlace serial USB." },
      { x: 84.6, y: 73.8, t: "Raspberry Pi 4", d: "Ejecuta la interfaz de hardware con ROS 2, recibe los barridos del LiDAR y se comunica con la estación de trabajo." },
      { x: 86.7, y: 24.6, t: "LiDAR RPLidar A1", d: "El sensor que percibe el entorno. Se conecta a un puerto serie UART de la Raspberry Pi." }
    ];
    el.innerHTML =
      '<figure class="fig esquema"><div class="esquema-marco"><picture><source srcset="img/tesis/circuito-med.webp" type="image/webp"><img src="img/tesis/circuito-med.png" data-grande="img/tesis/circuito.png" width="1200" height="915" decoding="async" alt="Esquema de conexiones: batería de 12 V con fusible e interruptor, bloques de distribución de 12 V y de 5 V, regulador de tensión, multímetro, driver L298N conectado a los dos motores con encoder, Arduino Nano, Raspberry Pi y el LiDAR."></picture>' +
      P.map(function (p, k) { return '<button type="button" class="punto" data-k="' + k + '" style="left:' + p.x + '%;top:' + p.y + '%" aria-label="' + U.esc(p.t) + '" aria-pressed="false" aria-controls="esquema-info"><span aria-hidden="true">' + (k + 1) + '</span></button>'; }).join("") +
      '</div><figcaption>Los cables rojos y negros llevan energía, los de colores llevan señales de los encoders y del PWM. <small>Fig. 4.5 de la tesis, con explicaciones de la sección 4.3 y de la tabla de materiales.</small></figcaption></figure>' +
      '<div class="esquema-info" id="esquema-info" aria-live="polite"><p class="vnota">Toca un punto o recórrelos con la tecla Tab para ver qué hace cada componente.</p></div>';
    var info = el.querySelector(".esquema-info"), pts = el.querySelectorAll(".punto");
    function elegir(k) {
      pts.forEach(function (b, j) { b.setAttribute("aria-pressed", j === k ? "true" : "false"); });
      info.innerHTML = '<p><b>' + (k + 1) + '. ' + U.esc(P[k].t) + '.</b> ' + U.esc(P[k].d) + '</p>';
    }
    pts.forEach(function (b) { b.addEventListener("click", function () { elegir(+b.getAttribute("data-k")); }); });
    if (window.SITIO && window.SITIO.ampliable) window.SITIO.ampliable(el.querySelector("img"));
    el.estadoEsquema = function () { var a = el.querySelector('.punto[aria-pressed="true"]'); return { activo: a ? +a.getAttribute("data-k") : -1, texto: info.textContent }; };
  };
})();
