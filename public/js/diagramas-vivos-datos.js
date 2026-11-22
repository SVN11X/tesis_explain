/* Datos de los diagramas animados: el ciclo del robot, el flujo de datos de Nav2 y las conexiones de energía y señales.
   Aquí solo hay datos (nodos, aristas, rutas y pasos). js/diagramas-vivos.js los dibuja y tests/diagramas-vivos.test.mjs
   comprueba que cada paso use aristas que existen y que ninguna ruta cruce un nodo ajeno.
   Cada vista (ancha o angosta) trae las posiciones de los nodos y la ruta de cada arista como lista de puntos [x, y]
   en unidades del viewBox. El primer punto cae dentro del nodo de origen y el último dentro del de destino. */
(function (raiz, fabrica) {
  var D = fabrica();
  if (typeof module !== "undefined" && module.exports) module.exports = D;
  else raiz.DIAGRAMAS_VIVOS = D;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* El ciclo del robot. Los hechos salen de problema.html: las ruedas se corrigen 30 veces por segundo y el destino se
     revisa cada 3,3 s. Los temas son los de la guía: 5, 3, 7, 6 y 4. */
  var CICLO = {
    etapas: [
      { id: "percibir", lineas: ["Percibir"], color: "turquesa", icono: "percibir",
        texto: "Un láser mide distancias en un plano.",
        enlaces: [{ t: "Tema 5", h: "mapeo.html" }] },
      { id: "estimar", lineas: ["Estimar la", "posición"], color: "naranja", icono: "estimar",
        texto: "Encoders y SLAM dicen dónde está.",
        enlaces: [{ t: "Tema 3", h: "movimiento.html" }, { t: "Tema 5", h: "mapeo.html" }] },
      { id: "decidir", lineas: ["Decidir"], color: "violeta", icono: "decidir",
        texto: "El explorador elige una frontera.",
        enlaces: [{ t: "Tema 7", h: "exploracion.html" }] },
      { id: "moverse", lineas: ["Planificar", "y moverse"], color: "azul", icono: "moverse",
        texto: "Nav2 traza la ruta y cada rueda sigue su velocidad.",
        enlaces: [{ t: "Tema 6", h: "navegacion.html" }, { t: "Tema 4", h: "control.html" }] }
    ],
    ritmos: {
      ruedasHz: 30,
      destinoS: 3.3,
      ruedas: "Las ruedas se corrigen 30 veces por segundo.",
      destino: "El destino se revisa cada 3,3 s."
    },
    vistas: {
      ancha: {
        vb: [700, 460], nodo: [210, 72], fs: 17,
        pos: { percibir: [190, 80], estimar: [510, 80], decidir: [510, 380], moverse: [190, 380] },
        anillo: { c: [350, 230], r: 52 }
      },
      angosta: {
        vb: [320, 420], nodo: [132, 80], fs: 13.5,
        pos: { percibir: [80, 56], estimar: [240, 56], decidir: [240, 364], moverse: [80, 364] },
        anillo: { c: [160, 210], r: 46 }
      }
    }
  };

  /* Flujo de datos de Nav2: figura 4.6 de la tesis simplificada. Los nombres y las flechas salen de la figura
     (autonomous-navigation-diagram.png) y del grafo ros-graph.png del repositorio del robot. Se dejaron fuera
     /map hacia el planificador, los tópicos de las acciones y los nodos de ciclo de vida. */
  var NAV2_NODOS = [
    { id: "rviz2", t: "RViz2", tipo: "operador", d: "Supervisión y visualización. Desde aquí se fija la meta que llega como /goal_pose." },
    { id: "joystick", t: "Joystick", tipo: "operador", d: "Teleoperación manual. Publica /cmd_vel_joy y twist_mux le da prioridad sobre Nav2." },
    { id: "rplidar", t: "RPLidar A1", tipo: "fisico", d: "LiDAR 2D del robot. Publica un barrido en /scan en cada vuelta." },
    { id: "slam", t: "slam_toolbox", tipo: "ros", d: "SLAM 2D basado en grafo de poses. Con los barridos construye el mapa y publica /map y la transformada map a odom." },
    { id: "costmaps", t: "Costmaps", tipo: "ros", d: "Mapas de costos global y local, con inflación y obstáculos. El global sirve para planificar y el local para esquivar." },
    { id: "bt", t: "bt_navigator", tipo: "ros", d: "Árbol de comportamiento. Pide la ruta al planificador, ordena seguirla y activa las recuperaciones." },
    { id: "planner", t: "planner_server", tipo: "ros", d: "Planificación global con NavFn y A estrella. Devuelve el plan global." },
    { id: "controller", t: "controller_server", tipo: "ros", d: "Control local con DWB. Elige velocidades que sigan la ruta sin chocar y las publica en /cmd_vel." },
    { id: "recoveries", t: "recoveries_server", tipo: "ros", d: "Comportamientos de recuperación para cuando el robot se atasca." },
    { id: "explore", t: "explore_server", tipo: "ros", d: "Exploración autónoma. Envía metas de exploración al árbol de comportamiento." },
    { id: "twist_mux", t: "twist_mux", tipo: "ros", d: "Arbitraje de comandos por prioridades. El mando manual gana al de Nav2." },
    { id: "ros2c", t: "ros2_control", tipo: "ros", d: "Control de la plataforma con diff_drive_controller. Reparte la velocidad entre las ruedas, habla con el Arduino por serial USB y publica /odom y TF." },
    { id: "arduino", t: "Arduino Nano", tipo: "fisico", d: "Control PI de velocidad de cada rueda. Recibe las órdenes por USB y lee los conteos de los encoders." },
    { id: "l298n", t: "Driver L298N", tipo: "fisico", d: "Driver de motores. Recibe PWM y dirección del Arduino y entrega la potencia a los motores." },
    { id: "motores", t: "Motores DC", tipo: "fisico", d: "Los dos motorreductores que mueven las ruedas." },
    { id: "encoders", t: "Encoders", tipo: "fisico", d: "Retroalimentación de velocidad: cuentan el giro de cada rueda." }
  ];
  var NAV2_ARISTAS = [
    { id: "scan_slam", de: "rplidar", a: "slam", t: "/scan" },
    { id: "scan_costmaps", de: "rplidar", a: "costmaps", t: "/scan" },
    { id: "map_costmaps", de: "slam", a: "costmaps", t: "/map y TF map→odom" },
    { id: "tf_rviz", de: "slam", a: "rviz2", t: "TF, /map y estado" },
    { id: "goal_bt", de: "rviz2", a: "bt", t: "/goal_pose" },
    { id: "explore_bt", de: "explore", a: "bt", t: "Metas de exploración" },
    { id: "costmap_planner", de: "costmaps", a: "planner", t: "/global_costmap" },
    { id: "meta", de: "bt", a: "planner", t: "Meta" },
    { id: "plan", de: "planner", a: "bt", t: "Plan global" },
    { id: "bt_ctrl", de: "bt", a: "controller", t: "FollowPath" },
    { id: "costmap_ctrl", de: "costmaps", a: "controller", t: "local_costmap" },
    { id: "bt_rec", de: "bt", a: "recoveries", t: "Recuperaciones" },
    { id: "ctrl_mux", de: "controller", a: "twist_mux", t: "/cmd_vel" },
    { id: "rec_mux", de: "recoveries", a: "twist_mux", t: "/cmd_vel" },
    { id: "joy_mux", de: "joystick", a: "twist_mux", t: "/cmd_vel_joy" },
    { id: "mux_r2c", de: "twist_mux", a: "ros2c", t: "/diff_cont/cmd_vel_unstamped" },
    { id: "serial_abajo", de: "ros2c", a: "arduino", t: "Serial USB: órdenes" },
    { id: "pwm", de: "arduino", a: "l298n", t: "PWM + DIR" },
    { id: "potencia", de: "l298n", a: "motores", t: "Potencia" },
    { id: "giro", de: "motores", a: "encoders", t: "Giro de la rueda" },
    { id: "conteos", de: "encoders", a: "arduino", t: "Conteos de encoder" },
    { id: "serial_arriba", de: "arduino", a: "ros2c", t: "Serial USB: conteos" },
    { id: "odom", de: "ros2c", a: "controller", t: "/odom y TF" }
  ];
  var NAV2_PASOS = [
    { id: "barrido", t: "Llega un barrido",
      texto: "El RPLidar A1 publica /scan. slam_toolbox lo usa para extender el mapa y publicar /map y la transformada map a odom. Los costmaps lo usan para marcar los obstáculos.",
      etapas: [["scan_slam", "scan_costmaps"], ["map_costmaps", "tf_rviz"]] },
    { id: "ruta", t: "Se planifica la ruta",
      texto: "RViz2 fija la meta en /goal_pose. bt_navigator se la pasa al planner_server, que calcula con A estrella sobre el costmap global y devuelve el plan. El árbol de comportamiento lo entrega al controlador.",
      etapas: [["costmap_planner", "goal_bt"], ["meta"], ["plan"], ["bt_ctrl"]] },
    { id: "velocidad", t: "Se envía la velocidad",
      texto: "controller_server elige una velocidad con el costmap local y la publica en /cmd_vel. twist_mux decide quién manda, ros2_control la reparte entre las ruedas, el Arduino la compara con los conteos y el L298N mueve los motores con PWM.",
      etapas: [["costmap_ctrl"], ["ctrl_mux"], ["mux_r2c"], ["serial_abajo"], ["pwm"], ["potencia"]] },
    { id: "odometria", t: "Vuelve la odometría",
      texto: "Al girar, las ruedas mueven los encoders. El Arduino cuenta los pulsos, los envía por serial y ros2_control los convierte en /odom y TF para el controlador local.",
      etapas: [["giro"], ["conteos"], ["serial_arriba"], ["odom"]] }
  ];
  var NAV2 = {
    nodos: NAV2_NODOS, aristas: NAV2_ARISTAS, pasos: NAV2_PASOS,
    vistas: {
      ancha: {
        vb: [820, 620], nodo: [170, 40], fs: 15,
        pos: {
          rviz2: [95, 40], rplidar: [505, 40], slam: [295, 135], costmaps: [505, 135],
          bt: [95, 230], planner: [505, 230], controller: [705, 230], explore: [95, 325], recoveries: [505, 325],
          joystick: [95, 420], twist_mux: [705, 420], ros2c: [705, 500], arduino: [505, 500], l298n: [295, 500],
          motores: [95, 500], encoders: [95, 580]
        },
        rutas: {
          scan_slam: [[470, 40], [295, 40], [295, 135]],
          scan_costmaps: [[505, 40], [505, 135]],
          map_costmaps: [[295, 135], [505, 135]],
          tf_rviz: [[280, 135], [130, 135], [130, 40]],
          goal_bt: [[70, 40], [70, 230]],
          explore_bt: [[95, 325], [95, 230]],
          costmap_planner: [[505, 135], [505, 230]],
          meta: [[150, 222], [505, 222]],
          plan: [[505, 238], [150, 238]],
          bt_ctrl: [[140, 230], [140, 275], [705, 275], [705, 230]],
          costmap_ctrl: [[560, 135], [705, 135], [705, 230]],
          bt_rec: [[165, 230], [165, 290], [505, 290], [505, 325]],
          ctrl_mux: [[740, 230], [740, 420]],
          rec_mux: [[540, 325], [540, 372], [670, 372], [670, 420]],
          joy_mux: [[95, 420], [705, 420]],
          mux_r2c: [[705, 420], [705, 500]],
          serial_abajo: [[705, 486], [505, 486]],
          serial_arriba: [[505, 514], [705, 514]],
          pwm: [[505, 500], [295, 500]],
          potencia: [[295, 500], [95, 500]],
          giro: [[95, 500], [95, 580]],
          conteos: [[95, 580], [505, 580], [505, 500]],
          odom: [[770, 500], [806, 500], [806, 215], [770, 215]]
        }
      },
      angosta: {
        vb: [344, 576], pad: 14, nodo: [136, 40], fs: 13.5,
        pos: {
          rviz2: [82, 30], rplidar: [246, 30], slam: [82, 100], costmaps: [246, 100],
          explore: [82, 170], planner: [246, 170], bt: [82, 256], controller: [246, 256],
          recoveries: [82, 326], twist_mux: [246, 326], joystick: [82, 396], ros2c: [246, 396],
          l298n: [82, 466], arduino: [246, 466], motores: [82, 536], encoders: [246, 536]
        },
        rutas: {
          scan_slam: [[200, 30], [200, 65], [100, 65], [100, 100]],
          scan_costmaps: [[290, 30], [290, 100]],
          map_costmaps: [[82, 100], [246, 100]],
          tf_rviz: [[60, 100], [60, 30]],
          goal_bt: [[30, 30], [0, 30], [0, 256], [30, 256]],
          explore_bt: [[82, 170], [82, 256]],
          costmap_planner: [[246, 100], [246, 170]],
          meta: [[130, 256], [130, 205], [205, 205], [205, 170]],
          plan: [[225, 170], [225, 221], [140, 221], [140, 256]],
          bt_ctrl: [[82, 256], [246, 256]],
          costmap_ctrl: [[290, 100], [326, 100], [326, 248], [290, 248]],
          bt_rec: [[82, 256], [82, 326]],
          ctrl_mux: [[246, 256], [246, 326]],
          rec_mux: [[82, 326], [246, 326]],
          joy_mux: [[120, 396], [120, 361], [205, 361], [205, 326]],
          mux_r2c: [[246, 326], [246, 396]],
          serial_abajo: [[215, 396], [215, 466]],
          serial_arriba: [[277, 466], [277, 396]],
          pwm: [[246, 466], [82, 466]],
          potencia: [[82, 466], [82, 536]],
          giro: [[82, 536], [246, 536]],
          conteos: [[290, 536], [290, 466]],
          odom: [[290, 396], [336, 396], [336, 264], [300, 264]]
        }
      }
    }
  };

  /* Conexiones del robot: sección 4.3 de la tesis y figura 4.5 (circuit-diagram.png). Es un bloque simplificado.
     Queda fuera, porque la figura no lo deja claro o no cambia el flujo: cómo se alimenta el Arduino (la sección
     dice que el riel de 5 V lo alimenta, pero la figura solo muestra su cable USB), la alimentación de los
     encoders, el visor de tensión y corriente de la cubierta y el pin de 5 V lógico del L298N. */
  var ENERGIA_NODOS = [
    { id: "bateria", t: "Batería 12 V", tipo: "potencia", d: "Batería de 12 V y 3000 mAh. Es la fuente de energía del robot." },
    { id: "fusible", t: "Fusible", tipo: "potencia", d: "Protege la entrada de la batería." },
    { id: "interruptor", t: "Interruptor", tipo: "potencia", d: "Interruptor de encendido, en el panel de control de la cubierta." },
    { id: "dist12", t: "Distribución 12 V", tipo: "potencia", d: "Reparte el bus de 12 V entre el driver de los motores y el regulador." },
    { id: "regulador", t: "Regulador 5 V", tipo: "logica", d: "Módulo reductor DC-DC de 25 W. Toma los 12 V y genera el riel regulado de 5 V." },
    { id: "dist5", t: "Distribución 5 V", tipo: "logica", d: "Reparte el riel de 5 V a la electrónica. Separarlo del bus de los motores reduce la interferencia sobre el control." },
    { id: "l298n", t: "Driver L298N", tipo: "potencia", d: "Aplica a los motores la tensión del bus de 12 V, modulada por las señales PWM del Arduino." },
    { id: "motores", t: "Motores y encoders", tipo: "potencia", d: "Dos motorreductores JGA25-370 de 12 V con encoder de cuadratura. Los canales del encoder llegan al Arduino." },
    { id: "arduino", t: "Arduino Nano", tipo: "logica", d: "Lee los encoders y controla la velocidad de cada rueda. Se comunica con la Raspberry Pi por USB serial." },
    { id: "pi", t: "Raspberry Pi 4", tipo: "logica", d: "Ejecuta ros2_control, recibe los barridos del LiDAR y se comunica con el computador." },
    { id: "lidar", t: "LiDAR RPLidar A1", tipo: "logica", d: "El sensor que percibe el entorno. Se conecta a un puerto serie UART de la Raspberry Pi." }
  ];
  var ENERGIA_ARISTAS = [
    { id: "bat_fus", de: "bateria", a: "fusible", t: "12 V" },
    { id: "fus_int", de: "fusible", a: "interruptor", t: "12 V" },
    { id: "int_d12", de: "interruptor", a: "dist12", t: "12 V" },
    { id: "d12_reg", de: "dist12", a: "regulador", t: "12 V" },
    { id: "d12_l298", de: "dist12", a: "l298n", t: "12 V" },
    { id: "reg_d5", de: "regulador", a: "dist5", t: "5 V" },
    { id: "d5_pi", de: "dist5", a: "pi", t: "5 V" },
    { id: "d5_lidar", de: "dist5", a: "lidar", t: "5 V" },
    { id: "l298_motor", de: "l298n", a: "motores", t: "12 V con PWM" },
    { id: "lidar_pi", de: "lidar", a: "pi", t: "UART: barridos" },
    { id: "pi_ard", de: "pi", a: "arduino", t: "USB: velocidades" },
    { id: "ard_pi", de: "arduino", a: "pi", t: "USB: conteos" },
    { id: "ard_l298", de: "arduino", a: "l298n", t: "PWM y dirección" },
    { id: "enc_ard", de: "motores", a: "arduino", t: "Canales del encoder" }
  ];
  var ENERGIA_FLUJOS = [
    { id: "energia", t: "Energía", color: "naranja", paquete: "circulo",
      texto: "La batería de 12 V pasa por el fusible y el interruptor hasta la distribución de 12 V. De ahí salen dos ramas: el L298N, que alimenta los motores, y el regulador, que baja a 5 V para la distribución que alimenta la Raspberry Pi y el LiDAR.",
      etapas: [["bat_fus"], ["fus_int"], ["int_d12"], ["d12_reg", "d12_l298"], ["reg_d5", "l298_motor"], ["d5_pi", "d5_lidar"]] },
    { id: "senales", t: "Señales", color: "azul", paquete: "rombo",
      texto: "El LiDAR envía los barridos a la Raspberry Pi por UART, y la Raspberry Pi manda las velocidades al Arduino por USB. El Arduino envía PWM y dirección al L298N, que mueve los motores. Los encoders devuelven sus canales al Arduino y este envía los conteos a la Raspberry Pi.",
      etapas: [["lidar_pi", "pi_ard"], ["ard_l298"], ["l298_motor"], ["enc_ard"], ["ard_pi"]] }
  ];
  var ENERGIA = {
    nodos: ENERGIA_NODOS, aristas: ENERGIA_ARISTAS, pasos: ENERGIA_FLUJOS,
    vistas: {
      ancha: {
        vb: [820, 400], nodo: [170, 44], fs: 15,
        pos: {
          bateria: [95, 40], fusible: [295, 40], interruptor: [505, 40], dist12: [705, 40],
          regulador: [505, 140], l298n: [705, 140], dist5: [505, 240], motores: [705, 240],
          lidar: [295, 340], pi: [505, 340], arduino: [705, 340]
        },
        rutas: {
          bat_fus: [[95, 40], [295, 40]],
          fus_int: [[295, 40], [505, 40]],
          int_d12: [[505, 40], [705, 40]],
          d12_reg: [[690, 40], [690, 90], [505, 90], [505, 140]],
          d12_l298: [[740, 40], [740, 140]],
          reg_d5: [[505, 140], [505, 240]],
          d5_pi: [[520, 240], [520, 340]],
          d5_lidar: [[470, 240], [295, 240], [295, 340]],
          l298_motor: [[705, 140], [705, 240]],
          lidar_pi: [[295, 340], [505, 340]],
          pi_ard: [[505, 326], [705, 326]],
          ard_pi: [[705, 354], [505, 354]],
          ard_l298: [[760, 340], [806, 340], [806, 140], [780, 140]],
          enc_ard: [[705, 240], [705, 340]]
        }
      },
      angosta: {
        vb: [344, 420], pad: 14, nodo: [136, 44], fs: 13.5,
        pos: {
          bateria: [82, 30], fusible: [246, 30], dist12: [82, 100], interruptor: [246, 100],
          l298n: [82, 170], regulador: [246, 170], motores: [82, 240], dist5: [246, 240],
          arduino: [82, 310], pi: [246, 310], lidar: [246, 380]
        },
        rutas: {
          bat_fus: [[82, 30], [246, 30]],
          fus_int: [[246, 30], [246, 100]],
          int_d12: [[246, 100], [82, 100]],
          d12_reg: [[110, 100], [110, 135], [225, 135], [225, 170]],
          d12_l298: [[60, 100], [60, 170]],
          reg_d5: [[246, 170], [246, 240]],
          d5_pi: [[230, 240], [230, 310]],
          d5_lidar: [[290, 240], [337, 240], [337, 380], [290, 380]],
          l298_motor: [[82, 170], [82, 240]],
          lidar_pi: [[262, 380], [262, 310]],
          pi_ard: [[246, 296], [82, 296]],
          ard_pi: [[82, 324], [246, 324]],
          ard_l298: [[30, 310], [0, 310], [0, 170], [30, 170]],
          enc_ard: [[82, 240], [82, 310]]
        }
      }
    }
  };

  /* Geometría compartida con el dibujo y con las pruebas. recortar deja la ruta entre los bordes de sus dos nodos y
     marcas dice dónde va la insignia numerada de cada arista: el punto medio del tramo más largo, o el primero
     de varios candidatos que no toque un nodo, otra arista ni otra insignia. */
  function salida(pts, c, w, h, hueco) {
    var hx = w / 2 + hueco, hy = h / 2 + hueco;
    for (var i = 0; i < pts.length - 1; i++) {
      var p = pts[i], q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], t = Infinity;
      if (dx > 0) t = Math.min(t, (c[0] + hx - p[0]) / dx); else if (dx < 0) t = Math.min(t, (c[0] - hx - p[0]) / dx);
      if (dy > 0) t = Math.min(t, (c[1] + hy - p[1]) / dy); else if (dy < 0) t = Math.min(t, (c[1] - hy - p[1]) / dy);
      if (t <= 1) return [[p[0] + dx * t, p[1] + dy * t]].concat(pts.slice(i + 1));
    }
    return pts;
  }
  function recortar(pts, cA, cB, w, h) {
    var a = salida(pts, cA, w, h, 1);
    return salida(a.slice().reverse(), cB, w, h, 3).reverse();
  }
  var RADIO_MARCA = 9;
  function cruzaCaja(c, r, a, b) {
    return Math.max(a[0], b[0]) >= c[0] - r && Math.min(a[0], b[0]) <= c[0] + r && Math.max(a[1], b[1]) >= c[1] - r && Math.min(a[1], b[1]) <= c[1] + r;
  }
  function marcas(G, V) {
    var w = V.nodo[0], h = V.nodo[1], r = RADIO_MARCA + 2, rutas = {}, puestas = {};
    G.aristas.forEach(function (a) { rutas[a.id] = recortar(V.rutas[a.id], V.pos[a.de], V.pos[a.a], w, h); });
    G.aristas.forEach(function (a) {
      var pts = rutas[a.id], segs = [], i;
      for (i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1], Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])]);
      segs.sort(function (x, y) { return y[2] - x[2]; });
      var elegido = null;
      segs.forEach(function (sg) {
        [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8].forEach(function (f) {
          if (elegido) return;
          var c = [sg[0][0] + (sg[1][0] - sg[0][0]) * f, sg[0][1] + (sg[1][1] - sg[0][1]) * f], bien = true;
          G.nodos.forEach(function (n) {
            var q = V.pos[n.id];
            if (c[0] + r > q[0] - w / 2 && c[0] - r < q[0] + w / 2 && c[1] + r > q[1] - h / 2 && c[1] - r < q[1] + h / 2) bien = false;
          });
          G.aristas.forEach(function (e) {
            if (e.id === a.id) return;
            for (var j = 0; j < rutas[e.id].length - 1; j++) if (cruzaCaja(c, r, rutas[e.id][j], rutas[e.id][j + 1])) bien = false;
          });
          Object.keys(puestas).forEach(function (k) { if (puestas[k] && Math.hypot(puestas[k][0] - c[0], puestas[k][1] - c[1]) < 2 * r) bien = false; });
          if (bien) elegido = c;
        });
      });
      puestas[a.id] = elegido;
    });
    return puestas;
  }

  return { ciclo: CICLO, nav2: NAV2, energia: ENERGIA, geo: { recortar: recortar, marcas: marcas, radioMarca: RADIO_MARCA } };
});
