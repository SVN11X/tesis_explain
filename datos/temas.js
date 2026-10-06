/*
  Temas explicados de forma visual.
  Cada tema junta las preguntas del banco que lo tocaron (preguntas), un diagrama (visual),
  las ideas clave en simple (claves), la frase para decir en la sala (frase),
  las frases a evitar (trampas) y dónde está el respaldo (respaldo).
  Fuentes: Banco_preguntas_defensa, Ensayo_Defensa_y_Repaso, Guion_Defensa, la tesis y el código.
*/
window.TEMAS = [

  /* ───────── Marco teórico y referencias ───────── */
  {
    id: "lazo", area: "marco", visual: "lazo",
    titulo: "El cierre de lazo y cómo SLAM corrige la odometría",
    costo: "Omitiste qué es un cierre de lazo en la ronda 3. En la ronda 5 explicaste bien que SLAM corrige la deriva, pero sin nombrar la transformada de map a odom.",
    preguntas: ["b24", "n1"],
    claves: [
      { t: "Un grafo de poses", x: "Cada punto es una pose del robot, o sea dónde estaba y hacia dónde miraba. Cada línea es una restricción entre dos poses, que sale de la odometría o de alinear dos barridos del láser." },
      { t: "La deriva se acumula", x: "La odometría tiene un sesgo pequeño en cada tramo. Sumado tramo a tramo, la trayectoria estimada se va abriendo." },
      { t: "El cierre de lazo", x: "Cuando el robot vuelve a ver una zona que ya conocía se agrega una restricción nueva. Al optimizar el grafo, el error se reparte en toda la trayectoria y el mapa se corrige." },
      { t: "Dónde queda la corrección", x: "slam_toolbox la publica como la transformada de map a odom. Por eso el 3,63 % de la odometría no se acumula en el mapa." },
      { t: "Por qué figura no determinado", x: "El cierre estaba activado, pero tu análisis no detecta si ocurrió y ese dato se ingresaba a mano. La consistencia del mapa la evaluaste a la vista." }
    ],
    frase: "El 3,63 % es una deriva local. SLAM Toolbox la corrige con el láser y publica esa corrección como la transformada de map a odom, por eso no se acumula en el mapa.",
    trampas: [{ no: "SLAM validado.", si: "Verificado en funcionamiento." }],
    respaldo: "Sec. 3.8 y Fig. 3.4, Sec. 5.3, Tabla A5.3, Anexos 8.1 y 8.3. Norma REP 105."
  },
  {
    id: "astar", area: "marco", visual: "astar",
    titulo: "A estrella frente a Dijkstra",
    costo: "La omitiste en la ronda 2. En la ronda 4 subiste a 5,0 usando la lámina 39, pero omitiste la repregunta sobre la heurística admisible.",
    preguntas: ["b27", "b28"],
    claves: [
      { t: "g, lo ya recorrido", x: "El costo acumulado desde la posición del robot hasta la celda que se está revisando." },
      { t: "h, lo que falta", x: "Una estimación del costo desde esa celda hasta la meta. Dijkstra no la usa y por eso revisa en todas direcciones." },
      { t: "f igual a g más h", x: "A estrella siempre avanza primero por la celda con la menor suma. Es la Ec. 3.15 de la tesis." },
      { t: "Heurística admisible", x: "La que nunca estima más de lo que realmente falta. Con ella A estrella encuentra la ruta de menor costo." },
      { t: "En tu tesis", x: "Lo activas con use_astar en el planificador NavFn. No usas la optimalidad como criterio, porque Nav2 agrega costos propios del mapa. Validas que DWB pueda seguir la ruta." }
    ],
    frase: "A estrella suma lo que ya cuesta llegar a cada celda y una estimación de lo que falta, y siempre avanza por la menor suma. Esa estimación orienta la búsqueda hacia la meta y evita revisar celdas en todas direcciones, como haría Dijkstra.",
    trampas: [],
    respaldo: "Sec. 3.10 y Ec. 3.15, Tabla 4.5, Tabla A5.1. Lámina 39."
  },
  {
    id: "frontera", area: "marco", visual: "frontera",
    titulo: "La frontera según Yamauchi y según tu explorador",
    costo: "Omitida en la ronda 2 y 2,0 en la ronda 4. Dijiste la lámina 40 cuando te preguntaban por el tamaño mínimo de frontera, y la frase de la misma idea de frontera no es exacta.",
    preguntas: ["b32", "b33"],
    claves: [
      { t: "Celda de frontera en Yamauchi", x: "Una celda libre que está junto a una desconocida. Las agrupa en regiones y solo acepta las que tienen un tamaño parecido al del robot." },
      { t: "Celda de frontera en tu explorador", x: "Una celda desconocida junto a una libre. Con un tamaño mínimo de 0,05 m acepta fronteras de una sola celda. El archivo de ejemplo del paquete trae 0,75 m." },
      { t: "Cómo elige", x: "Yamauchi va a la frontera accesible más cercana y al llegar barre 360 grados. Tu explorador usa un puntaje de distancia y tamaño, y vuelve a elegir cada 3,3 segundos sin esperar a llegar." },
      { t: "La consecuencia", x: "Fronteras muy pequeñas pueden venir del ruido del láser o de rincones donde el robot no cabe. Eso puede alargar la exploración. No lo cuantificaste." },
      { t: "Lo que solo tú sabes", x: "Por qué bajaste el tamaño mínimo a 0,05 m. La tesis no lo justifica, así que prepara una frase con tu razón real." }
    ],
    frase: "Mi explorador toma la idea general de Yamauchi, los bordes entre lo conocido y lo desconocido, pero con otra definición de celda, un tamaño mínimo de una sola celda y una nueva elección cada 3,3 segundos.",
    trampas: [{ no: "Mi explorador usa la misma idea de frontera.", si: "La misma idea general, con otra definición de celda y otro tamaño mínimo." }],
    respaldo: "REF_Yamauchi_1997, secciones 2.2 y 2.3. Sec. 3.11, Tabla A5.4, Anexo 5.6. explore.yaml. Lámina 40."
  },
  {
    id: "trejos", area: "marco", visual: "trejos",
    titulo: "Por qué slam_toolbox y qué comparó Trejos",
    costo: "2,5 en la ronda 2 y omitida en la ronda 3. Usaste las pruebas de recta y giro como prueba de CPU, pero esas pruebas no usan SLAM.",
    preguntas: ["b25", "b26"],
    claves: [
      { t: "Qué comparó Trejos", x: "Cartographer, GMapping, Hector, Karto y RTAB Map, en simulación con Gazebo y un TurtleBot 3 Burger simulado. No evaluó slam_toolbox." },
      { t: "Qué resultó", x: "En su clasificación global Karto fue la mejor opción, porque equilibra recursos y desempeño. Cartographer fue el de mayor uso medio de CPU." },
      { t: "El puente", x: "slam_toolbox se construye sobre Open Karto, según Macenski y Jambrecic." },
      { t: "El argumento de CPU pesa poco", x: "En tu sistema slam_toolbox corre en el computador, un Intel Core i7 de clase portátil, y no mediste su consumo." },
      { t: "Tu razón principal", x: "Integración nativa con ROS 2, enfoque de grafo de poses y que permite guardar y cargar mapas." }
    ],
    frase: "Trejos no evaluó slam_toolbox, pero sí Karto, que fue su mejor opción global, y slam_toolbox se construye sobre Open Karto. Como corre en el computador y no medí la CPU, lo elegí sobre todo por su integración, su grafo de poses y el manejo de mapas.",
    trampas: [{ no: "Funcionó, así que el consumo es compatible con embebidos.", si: "SLAM Toolbox corre en el PC y no medí la CPU." }],
    respaldo: "Tabla 1.2, Sec. 2.1, Sec. 4.5.1, Tabla A3.2. REF_Trejos_2022 y REF_Macenski_Jambrecic_2021. Láminas 5 y 12."
  },

  /* ───────── Navegación y exploración como resultado ───────── */
  {
    id: "metas", area: "navexp", visual: "metas",
    titulo: "Por qué 1 de 60 metas no es una tasa de éxito",
    costo: "Omitida en la ronda 4. En la ronda 5 la explicaste, pero tardaste en separar verificado de validado y usaste el área mapeada como prueba de la navegación.",
    preguntas: ["b2", "b1"],
    claves: [
      { t: "Cada 3,3 segundos", x: "El explorador vuelve a elegir destino y manda una meta nueva sin cancelar la anterior." },
      { t: "Nav2 cierra la anterior", x: "En la versión Foxy, si llega una meta nueva mientras otra está activa, la anterior queda abortada. Abortada no significa que el robot fallara." },
      { t: "53 de 54", x: "Revisaste cada meta por su identificador. En 53 de los 54 abortos la meta siguiente ya estaba en ejecución. El restante es la primera meta de la iteración 1 y no se pudo clasificar." },
      { t: "La prueba del movimiento", x: "El mapa creció en las cinco corridas válidas. Eso exige que el láser vea geometría nueva desde otras posiciones. Las metas generadas no prueban movimiento, en la iteración 2 hubo 14 y el robot no se movió." }
    ],
    frase: "Esa cifra no mide si el robot llega. 53 de los 54 abortos fueron reemplazos del propio explorador, y lo que muestra que el robot va hacia donde se le manda es que el mapa creció hasta que no quedaron fronteras.",
    trampas: [
      { no: "Solo una de 60 metas se completó, dicho como fracaso.", si: "53 de 54 abortos fueron reemplazos del explorador, así que no es una tasa de éxito." },
      { no: "Los abortos se deben al recinto reducido y a la inflación.", si: "Los abortos vienen del reemplazo de metas que hace el explorador." },
      { no: "Ninguna interrupción vino de Nav2.", si: "Con los datos registrados no identifiqué abortos por fallas de Nav2." },
      { no: "Interrumpida.", si: "Abortada, que es el término de la tesis." }
    ],
    respaldo: "Sec. 5.4, Tabla A7.1, Anexo 8.4. Láminas 19, 27 y 41."
  },
  {
    id: "listanegra", area: "navexp", visual: "listanegra",
    titulo: "La lista negra del explorador",
    costo: "Omitiste la lógica del explorador en la ronda 2. En la ronda 5 sacaste 4,0 porque defendiste que tachar metas reemplazadas ayuda, y la tesis lo trata como una limitación.",
    preguntas: ["b30", "b31"],
    claves: [
      { t: "Para qué existe", x: "Para que el robot no insista para siempre en una frontera inalcanzable. Es la idea de Yamauchi, que marcaba esas fronteras como inaccesibles." },
      { t: "Dos puertas de entrada", x: "Pasar 10 segundos sin acercarse a la frontera, o que Nav2 responda que la meta quedó abortada. Una meta cancelada no se anota." },
      { t: "El efecto secundario", x: "Las metas reemplazadas quedan abortadas, así que el explorador también las tacha aunque no fallaron. Tachar un punto tacha también sus alrededores, a menos de 5 celdas." },
      { t: "Cuánto pasó", x: "Cuando se queda sin candidatas vacía la lista y vuelve a intentar. Pasó 17 veces en las cinco corridas válidas, 11 de ellas en la iteración 1." },
      { t: "La mejora", x: "Cancelar la meta en curso antes de enviar la siguiente. Como el código no anota las canceladas, la lista recibiría solo fallas reales. Es el trabajo futuro 5." }
    ],
    frase: "La lista negra evita que el robot insista en fronteras inalcanzables. Su limitación es que también tacha las metas que el propio explorador reemplaza, porque Nav2 las cierra como abortadas. No impidió terminar la exploración, pero no cuantifiqué cuánto alargó el recorrido.",
    trampas: [{ no: "Tachar las metas reemplazadas ayuda a identificar fronteras no válidas.", si: "Una frontera reemplazada no es una frontera inválida. Es una limitación de la integración entre explore_lite y Nav2." }],
    respaldo: "Sec. 4.5.6 y Alg. 4.4, Sec. 5.4, Anexo 8.4, trabajo futuro 5. explore.cpp y explore.yaml. Lámina 41."
  },
  {
    id: "cobertura", area: "navexp", visual: "cobertura",
    titulo: "¿Exploraste todo el recinto?",
    costo: "La omitiste en la ronda 2. Es fácil decir que el robot cubre el 62 % del recinto, y eso no es lo que mide el índice.",
    preguntas: ["b4"],
    claves: [
      { t: "Qué mide el índice", x: "Celdas libres divididas por celdas libres más desconocidas, dentro de la imagen del mapa. Las ocupadas no cuentan. Es la Ec. 5.4." },
      { t: "Por qué varía tanto", x: "La imagen no está anclada al recinto. Cambia cuántas celdas desconocidas quedan alrededor, y con eso cambia el índice aunque el área libre sea la misma." },
      { t: "El dato estable", x: "El área libre fue casi igual en las cinco corridas, entre 3,478 y 3,540 m², con dispersión de 0,03. Todas llegaron al mismo espacio alcanzable." },
      { t: "Lo que no puedes afirmar", x: "Que exploraste todo el recinto, porque no mediste su superficie aparte del mapa. Queda como mejora pendiente." }
    ],
    frase: "No puedo afirmar que exploré todo el recinto. Tengo dos evidencias. Las cinco corridas válidas terminaron solas al no quedar fronteras, y el área libre fue casi igual en las cinco, cerca de 3,5 m².",
    trampas: [
      { no: "Cubre el 62 por ciento del espacio. O del recinto.", si: "Índice medio de cobertura libre de 62,2 por ciento." },
      { no: "Exploración completa. O explora hasta agotar el entorno.", si: "La exploración termina sola al no quedar fronteras." }
    ],
    respaldo: "Sec. 5.3, Ec. 5.4 y Tabla 5.4, Anexo 8.1, Limitaciones. Láminas 16 y 17."
  },
  {
    id: "alcance", area: "navexp", visual: "alcance",
    titulo: "Navegación sin indicador y metas fijas fuera del alcance",
    costo: "2,5 en la ronda 2. Diste tres versiones que se contradecían sobre las metas fijas y dijiste que el profesor se había confundido.",
    preguntas: ["b3"],
    claves: [
      { t: "Qué comprometía el objetivo", x: "Navegar hacia destinos generados por el explorador. Así se evaluó, y cinco de seis corridas terminaron solas." },
      { t: "Qué faltaba para metas fijas", x: "Un mapa guardado, AMCL activo y puntos medidos en el recinto. Esas condiciones no se configuraron. AMCL ubica al robot dentro de un mapa ya guardado." },
      { t: "El script", x: "Quedó preparado, pero sin registros de salida, sin medir el error de posición final y con poses definidas solo para el mundo simulado." },
      { t: "Una sola versión", x: "Si hiciste pruebas sin registro, dilo en una frase. Hice pruebas preliminares sin registros, pero el protocolo formal no se ejecutó." }
    ],
    frase: "La navegación funciona de extremo a extremo, pero no tiene un indicador cuantitativo. Las metas fijas quedaron fuera del alcance declarado y medirlas es el trabajo futuro 1.",
    trampas: [
      { no: "La navegación es limitada. O desempeño limitado.", si: "La navegación funciona de extremo a extremo, pero no tiene un indicador cuantitativo." },
      { no: "La navegación a metas fijas quedó pendiente. O no alcancé a ejecutarla.", si: "Quedó fuera del alcance declarado." },
      { no: "Nav2 ejecuta la ruta.", si: "Nav2 lleva al robot hacia la frontera que elige el explorador." },
      { no: "OE4 cumplido parcialmente.", si: "Está cumplido. Los parciales son OE2 y OE3." }
    ],
    respaldo: "Alcances y limitaciones, Sec. 4.5.2, Sec. 5.4, Anexo 8.3, conclusiones de los objetivos. Láminas 21 y 29."
  },

  /* ───────── Control de bajo nivel ───────── */
  {
    id: "papeles", area: "control", visual: "papeles",
    titulo: "Un PID que opera como PI incremental",
    costo: "Omitida en la ronda 1 y 4,5 en las rondas 2 y 5. En la ronda 5 empezaste diciendo control P y dejaste el reparto de papeles al revés.",
    preguntas: ["b10"],
    claves: [
      { t: "Incremental", x: "En cada ciclo el firmware no calcula la salida completa. Calcula cuánto subirla o bajarla y se lo suma a la salida anterior." },
      { t: "Sumar es integrar", x: "Todo lo que se suma ciclo tras ciclo se acumula. Por eso cada término sube un escalón de integración." },
      { t: "Kp actúa como integral", x: "Multiplica el error de ahora. Al sumarse ciclo a ciclo, la salida termina conteniendo el error acumulado." },
      { t: "Kd actúa como proporcional", x: "Multiplica el cambio de la medición. Sumar los cambios de algo devuelve ese algo, así que termina multiplicando la medición actual." },
      { t: "Ki casi no actúa", x: "Queda como una segunda integración. En la rueda derecha vale cero, porque su acumulador es entero y Ki por el error nunca llega a una unidad." }
    ],
    frase: "El firmware suma cada aumento a la salida anterior, así que cada término sube un orden de integración. Kp actúa como integral, Kd como proporcional sobre la medición y Ki como segunda integración, sin derivativa efectiva. Por eso opera como un PI incremental.",
    trampas: [
      { no: "El control no es un PID.", si: "Opera como un PI incremental heredado del firmware." },
      { no: "Se comporta igual que un PID, solo cambia el escalamiento.", si: "Opera como un PI incremental, y sus ganancias no se leen por su nombre." },
      { no: "La integral se transforma en proporcional y la derivativa en integral.", si: "Al revés. Kp actúa como integral, Kd como proporcional sobre la medición y Ki como segunda integración." }
    ],
    respaldo: "Sec. 4.4.3 y Ec. 4.1, Anexos 4.4 y 4.5, Sec. 5.2. diff_controller.h, función doPID. Lámina 26."
  },
  {
    id: "ciclo", area: "control", visual: "ciclo",
    titulo: "Un ciclo del firmware, con tus números",
    costo: "En la ronda 5 necesitaste ayuda para explicar dónde queda la integración. En la ronda 4 omitiste qué pasa a velocidades más bajas.",
    preguntas: ["b17"],
    claves: [
      { t: "Primer corte, el error", x: "El error se guarda entero. Si la referencia trae decimales, como con el comando k de los scripts de captura, esos decimales se pierden. Desde ROS 2 la referencia ya llega entera con el comando m." },
      { t: "Segundo corte, el aumento", x: "El aumento se calcula con decimales y se guarda entero antes de sumarlo. Si da 0,9 queda en 0 y la salida no se mueve." },
      { t: "Tercer corte, el integral", x: "El acumulador de Ki también es entero. En la rueda derecha, con Ki de 0,001, nunca llega a una unidad. En la izquierda necesita 14 ticks de error." },
      { t: "La protección del tope", x: "Si la salida llega a 255, el integral deja de acumular. Es la integración condicional que evita el windup." }
    ],
    frase: "Las ganancias se aplican con decimales, pero los resultados intermedios se guardan como enteros y se truncan hacia cero. Eso crea una pequeña zona sin corrección y anula el Ki de la rueda derecha. Está documentado en el Anexo 4.4, y pasar esos estados a punto flotante queda como trabajo futuro.",
    trampas: [{ no: "El control corre dentro de ROS 2.", si: "La ley de control corre en el Arduino." }],
    respaldo: "Anexo 4.4, Alg. 4.2, Sec. 5.2, trabajo futuro 6. diff_controller.h y ROSArduinoBridge.ino."
  },
  {
    id: "windup", area: "control", visual: "windup",
    titulo: "Windup, el integrador que se infla",
    costo: "Apareció dentro de la ley de control en las rondas 2 y 3. Lo definiste como que crece el error, y lo que crece es la parte integral.",
    preguntas: ["b13", "b11"],
    claves: [
      { t: "Qué es", x: "Con el motor al máximo, la parte integral sigue acumulando error. Cuando la rueda se libera, esa acumulación tarda en descargarse y la rueda se pasa de la velocidad pedida." },
      { t: "PI normal", x: "Guarda una cuenta de todo el error acumulado. Mientras la rueda está trabada esa cuenta crece sin parar." },
      { t: "PI incremental con tope", x: "Guarda la última salida ya recortada al máximo. No tiene una cuenta que pueda inflarse, así que al liberarse responde más suave." },
      { t: "Tu firmware", x: "Recorta la salida a 255 antes de guardarla y deja de acumular Ki cuando la salida está en el tope." }
    ],
    frase: "El PI normal acumula el error en una variable que puede inflarse cuando el motor se satura, mientras que el incremental guarda la última salida ya limitada. Por eso no se infla y la respuesta al liberarse es más suave.",
    trampas: [{ no: "El windup es que crece el error.", si: "Es que la parte integral sigue acumulándose con el motor al máximo." }],
    respaldo: "Anexo 4.4, Åström y Hägglund Sec. 3.5. Nota del guion en la lámina 26."
  },
  {
    id: "protocolo", area: "control", visual: "protocolo",
    titulo: "El protocolo serial no obliga la fórmula",
    costo: "2,5 en la ronda 3 y omitida la repregunta en la ronda 4. Repetiste las dos razones del guion sin contestar lo que se preguntaba.",
    preguntas: ["b12", "b11"],
    claves: [
      { t: "Qué viaja por el cable", x: "diffdrive_arduino manda un mensaje vacío al iniciar, las referencias con el comando m y pide los encoders con el comando e." },
      { t: "Dónde vive la ley", x: "En diff_controller.h, separada del manejo de comandos de ROSArduinoBridge.ino. La función que cargaría ganancias existe pero no se llama." },
      { t: "Entonces", x: "Se podía reescribir la ley sin tocar la comunicación. El protocolo justifica conservar los comandos, no la fórmula." },
      { t: "Por qué la conservaste", x: "Porque siguió la referencia en los ensayos y la forma incremental simplifica la protección contra el windup. Compararla con un PID incremental estándar es el trabajo futuro 6." }
    ],
    frase: "Tiene razón, nada me lo impedía. El protocolo justifica conservar los comandos, no la fórmula. Conservé la ley porque siguió la referencia y por la protección contra el windup, y esa frase de la Sec. 4.4.3 hay que precisarla.",
    trampas: [{ no: "Desarrollé el firmware.", si: "Adapté el firmware de un proyecto abierto." }],
    respaldo: "Sec. 4.3.3, Alg. 4.1, Tabla A4.2, Anexo 4.5. arduino_comms.cpp, diff_controller.h y ROSArduinoBridge.ino."
  },
  {
    id: "pso", area: "control", visual: "pso",
    titulo: "Qué aportó realmente el PSO",
    costo: "3,0 y 4,0 en las rondas 3 y 4, y 5,0 en la ronda 5. Contaste qué hizo el PSO antes de decir por qué lo elegiste, y dijiste que dio un sistema estable, lo que no mediste.",
    preguntas: ["b14", "b15"],
    claves: [
      { t: "Un modelo por rueda", x: "Identificaste un modelo de primer orden con retardo para cada rueda, llamado FOPDT. Resume la rueda con tres números. Cuánto responde, qué tan rápido y con cuánto retardo." },
      { t: "Por qué PSO", x: "Busca las tres ganancias a la vez minimizando el error sobre ese modelo, sin derivadas. Tus ruedas no son idénticas, y una tabla fija como la de Ziegler y Nichols no resuelve eso." },
      { t: "Fue una semilla", x: "Con esas ganancias apareció error estacionario en la rueda izquierda y una detención en la derecha. El modelo no tiene la zona muerta del driver." },
      { t: "Lo que no afirmas", x: "Que ahorró tiempo, porque no lo comparaste con las ganancias originales del firmware. Tampoco hiciste análisis de estabilidad." }
    ],
    frase: "Elegí PSO porque busca las ganancias que minimizan un criterio de error sobre un modelo de primer orden con retardo identificado para cada rueda. Mis ruedas no son idénticas. Lo usé como semilla y ajusté las ganancias finales en el robot.",
    trampas: [
      { no: "La simulación no captura la fricción.", si: "El modelo FOPDT no anticipaba la zona muerta ni el error estacionario." },
      { no: "El PSO entregó un sistema estable y aceleró el ajuste.", si: "Con las ganancias finales el robot siguió 0,13 m/s sin sobreimpulso apreciable. Estabilidad y tiempo no se midieron." }
    ],
    respaldo: "Sec. 4.4.5, Sec. 5.2 con Fig. 5.3 y 5.4, Anexos 4.5 y 4.8, Tabla A4.4, Alg. 4.3. Láminas 12, 15 y 25."
  },
  {
    id: "resolucion", area: "control", visual: "resolucion",
    titulo: "La resolución de la medición y el punto único de 0,13 m/s",
    costo: "Las dos las omitiste, la resolución en la ronda 3 y la velocidad única en la ronda 4. Nunca las has respondido.",
    preguntas: ["b16", "b17"],
    claves: [
      { t: "El dato viene en pasos de 0,01 m/s", x: "El firmware imprime la velocidad con dos decimales al responder el comando j. Un tick por ciclo equivale a unos 0,003 m/s, así que el encoder es más fino que el dato registrado." },
      { t: "0,128 es un promedio", x: "Promedia las muestras desde los 7 segundos. Si oscilan entre dos pasos, el promedio queda entre ellos." },
      { t: "Lo que no se ve", x: "Un sobreimpulso menor a un paso, cerca del 8 % de la referencia. Por eso dices sin sobreimpulso apreciable dentro de la resolución de medida." },
      { t: "A menor velocidad, peor", x: "A 0,13 m/s cada rueda cuenta unos 41 ticks por ciclo. En un giro a 0,35 rad/s, unos 10. Ahí la banda muerta pesa más y el integral izquierdo casi no actúa. No lo mediste." }
    ],
    frase: "Digo sin sobreimpulso apreciable dentro de la resolución de medida, porque el dato registrado viene en pasos de 0,01 m/s y un sobreimpulso menor a un paso no se alcanza a ver.",
    trampas: [{ no: "Cero sobreimpulso.", si: "Sin sobreimpulso apreciable dentro de la resolución de medida." }],
    respaldo: "Sec. 5.2 y Tabla 5.3, Anexo 4.11, Tabla A4.2 comando j, Tabla 4.3, Nomenclatura, trabajo futuro 6."
  },
  {
    id: "camino", area: "control", visual: "camino",
    titulo: "El camino de una orden, de Nav2 al motor",
    costo: "Omitida en la ronda 4. Es la única pregunta de control que nunca has contestado.",
    preguntas: ["b18"],
    claves: [
      { t: "Tres equipos", x: "Nav2 y twist_mux corren en el computador. El controlador diferencial y la interfaz con el Arduino corren en la Raspberry. La ley de control corre en el Arduino." },
      { t: "Tres límites", x: "DWB pide hasta 0,15 m/s, el controlador diferencial recorta a 0,13 m/s y 0,35 rad/s, y el Arduino recorta el PWM a 255." },
      { t: "Dos ritmos", x: "La Raspberry envía referencias a 30 Hz y el Arduino cierra el lazo cada 33 ms." },
      { t: "Seguridad", x: "Si pasan 2 segundos sin comandos, el Arduino detiene los motores." }
    ],
    frase: "Nav2 publica una velocidad, el controlador diferencial la limita y la reparte entre las ruedas, la interfaz la convierte a ticks por ciclo y la envía con el comando m, y el Arduino cierra el lazo cada 33 ms hasta el PWM del L298N. De vuelta, la Raspberry pide los conteos con el comando e y calcula la odometría.",
    trampas: [],
    respaldo: "Sec. 4.3.3 a 4.3.5, Alg. 4.1 y 4.2, Ec. 3.5, Anexo 3.5, Tablas A3.5, A4.2 y A5.1."
  },

  /* ───────── Ensayos y fallas ───────── */
  {
    id: "odometria", area: "ensayos", visual: "odometria",
    titulo: "7,18 % y 3,63 % miden cosas distintas",
    costo: "En la ronda 5 dijiste que la cinta es la verdad absoluta. Tiene su propia incertidumbre, aunque pequeña frente al sesgo medido.",
    preguntas: ["b19"],
    claves: [
      { t: "Tres distancias", x: "Ordenaste 2 m a 0,13 m/s durante 15,4 s. Los encoders estimaron 1,924 m y la cinta midió 1,856 m, en promedio de cinco repeticiones." },
      { t: "7,18 %, seguimiento", x: "Compara la cinta con lo ordenado. El robot avanzó menos de lo pedido, en parte por el tiempo que tardan las ruedas en acelerar." },
      { t: "3,63 %, odometría", x: "Compara los encoders con la cinta. El robot cree haber avanzado más de lo real. La baja dispersión indica un sesgo sistemático." },
      { t: "La cinta", x: "Es una referencia externa e independiente de los encoders. Marcaste un punto en el chasis, lo que acota el error, pero no cuantificaste esa incertidumbre por separado." }
    ],
    frase: "El 7,18 % es el error de seguimiento, cinta contra lo ordenado. El 3,63 % es el error odométrico, encoders contra cinta. Su baja dispersión indica un sesgo sistemático, compatible con un error de escala en el radio de rueda o con deslizamiento.",
    trampas: [{ no: "La cinta es la verdad absoluta.", si: "La cinta es una referencia externa con su propia incertidumbre, pequeña frente al sesgo medido." }],
    respaldo: "Sec. 5.1 y Tabla 5.1, Tabla A6.2, Anexo 6. Lámina 28."
  },
  {
    id: "iteracion2", area: "ensayos", visual: "iteracion2",
    titulo: "La iteración 2, odometría sin avance",
    costo: "3,0, 4,3 y 4,0 en las rondas 1 a 3, y 2,5 en la ronda 4 cuando la pregunta pasó al verificador de progreso. En la ronda 1 la atribuiste a la latencia de internet.",
    preguntas: ["b21", "b22", "b23"],
    claves: [
      { t: "Lo que pasó", x: "En 5,09 minutos el explorador envió 14 metas y la odometría sumó 3,851 m, pero el robot no se movió de su posición inicial. La causa no se determinó." },
      { t: "Por qué los encoders no lo ven", x: "Miden el giro de las ruedas, no el avance real. Ruedas que giran sin avanzar suman distancia igual." },
      { t: "El láser sí daba la señal", x: "Si el robot no se mueve, el mapa no crece. Pero el ensayo no usa esa señal para detenerse, y el explorador solo para cuando no quedan fronteras." },
      { t: "La red no lo explica", x: "La odometría se calcula en la Raspberry con sus propios conteos. Una red lenta retrasa órdenes, pero no suma giro de rueda." },
      { t: "El verificador de progreso", x: "Pide 5 cm cada 6 segundos y tuvo tiempo de actuar. No analizaste si actuó. Se puede revisar en el rosbag." }
    ],
    frase: "La causa no la determiné, y así lo informa la tesis. La odometría sumó 3,851 m sin avance real, algo compatible con ruedas que giran sin avanzar, pero no lo comprobé. Conservo el rosbag y con él se puede revisar sin repetir el ensayo.",
    trampas: [
      { no: "La iteración 2 falló por la latencia de internet. O por el reset de ROS 2.", si: "La causa no se determinó." },
      { no: "Sin IMU no podía detectarlo.", si: "Los encoders solos no lo distinguen, y el ensayo no usa el láser para detenerse." },
      { no: "Hice ensayos de red, CPU y deslizamiento.", si: "Esos scripts quedaron preparados, sin registros." }
    ],
    respaldo: "Anexo 7, Sec. 5.4, Tabla A5.1, Sec. 4.3.2. Lámina 35."
  },
  {
    id: "giro", area: "ensayos", visual: "giro",
    titulo: "El giro que el límite no dejaba completar",
    costo: "Omitida en la ronda 4. La tesis no describe cómo mediste el ángulo físico.",
    preguntas: ["b20"],
    claves: [
      { t: "El error de diseño", x: "El script pide 0,4 rad/s durante el tiempo de una vuelta a esa velocidad, unos 15,7 s. El controlador limita a 0,35 rad/s." },
      { t: "Lo que debía pasar", x: "Con el límite ideal el robot llegaría a 315 grados. Por eso la tesis no lo llama error de odometría sino desviación respecto de 360 nominales." },
      { t: "Lo que pasó", x: "Todos los giros superaron los 315 grados. La causa no la determinaste. Los rosbag tienen la odometría y permiten revisarlo." },
      { t: "Lo que solo tú sabes", x: "Cómo mediste el ángulo físico. Prepara una frase con el método real." }
    ],
    frase: "Fue un error de diseño del ensayo. Con el límite de 0,35 rad/s el robot llegaría a 315 grados, por eso la tesis habla de desviación respecto de 360 nominales y no de error de odometría. Lo corregiría con un giro controlado a un ángulo fijo, que es el trabajo futuro 8.",
    trampas: [],
    respaldo: "Sec. 5.1 y Tabla 5.2, Anexo 6, Tablas A6.3 y A6.4, trabajo futuro 8. prueba_giro.py. Lámina 32."
  },

  /* ───────── Decisiones técnicas ───────── */
  {
    id: "arquitectura", area: "decisiones", visual: "arquitectura",
    titulo: "Qué corre en el robot y qué corre en el computador",
    costo: "En la ronda 1 hablaste de maestro y esclavo, y de un internet compartido con la casa para explicar la iteración 2.",
    preguntas: ["b35", "b36"],
    claves: [
      { t: "El robot solo no explora", x: "Es una arquitectura distribuida. En el robot va lo rápido y crítico, en el computador lo que exige más cálculo." },
      { t: "Sin maestro central", x: "ROS 2 no tiene un nodo maestro. Los programas se encuentran entre sí por la red." },
      { t: "Red dedicada", x: "Un router de viaje con IP fijas. El tráfico entre robot y computador va por la red local de ese router, no por internet." }
    ],
    frase: "No, el robot solo no explora. En el robot va lo rápido y crítico, el control de las ruedas, la odometría y la lectura del láser. En el computador va el mapeo, la navegación y el explorador. ROS 2 no tiene un maestro central.",
    trampas: [
      { no: "Maestro y esclavo.", si: "Arquitectura distribuida, el robot hace el control rápido y el PC el cálculo pesado." },
      { no: "Uso FastDDS.", si: "El middleware registrado en la Tabla A3.2 es rmw_cyclonedds_cpp." }
    ],
    respaldo: "Sec. 1.1, Sec. 3.2, Capítulo 2 y Fig. 2.1, Anexo 3.1, Tabla A1.1. Lámina 10."
  },
  {
    id: "versiones", area: "decisiones", visual: "versiones",
    titulo: "Foxy y Gazebo Classic, congelados al inicio",
    costo: "3,0 en la ronda 1. Dijiste que las versiones nuevas no permiten usar A estrella ni RViz2, lo que contradice la Sec. 1.4.1.",
    preguntas: ["b34"],
    claves: [
      { t: "El criterio no fue el soporte", x: "Elegiste ROS 2 por su arquitectura distribuida y por Nav2. Foxy también está fuera de soporte, así que el fin de ROS 1 no fue el criterio." },
      { t: "Por qué congelar", x: "Para asegurar que toda la cadena de paquetes funcionara con tu hardware. Migrar a mitad del proyecto obligaba a rehacer y volver a probar todo." },
      { t: "Por qué Gazebo Classic", x: "Los complementos de simulación y de ros2_control del paquete base están disponibles para Foxy sobre Ubuntu 20.04." },
      { t: "Cómo lo cierras", x: "El fin de vida lo declaras como limitación y la migración es el trabajo futuro 3." }
    ],
    frase: "Es una contradicción aparente y la reconozco. Elegí ROS 2 por su arquitectura distribuida y por Nav2, no por el soporte. Las versiones las congelé al inicio para asegurar que toda la cadena funcionara con mi hardware, y migrar es el trabajo futuro 3.",
    trampas: [
      { no: "Descarté ROS 1 porque no tiene soporte.", si: "Elegí ROS 2 por su arquitectura distribuida y por Nav2." },
      { no: "Las versiones nuevas no permiten usar A* ni RViz2.", si: "No decirlo. Nav2 actual trae NavFn y Smac." }
    ],
    respaldo: "Alcances y limitaciones, Sec. 1.4.1, Sec. 1.5, Sec. 2.1, trabajo futuro 3, Tabla A3.2. Lámina 36."
  },

  /* ───────── Gemelo digital ───────── */
  {
    id: "gemelo", area: "gemelo", visual: "gemelo",
    titulo: "Qué verificó el gemelo digital y qué no",
    costo: "Te lo preguntaron en las cinco rondas y nunca pasó de 4,5 hasta la ronda 5. Cada vez apareció una frase sin respaldo, como el video, la lámina 18 como simulación o los 30 Hz.",
    preguntas: ["b5", "b6", "b7", "b8", "b9"],
    claves: [
      { t: "Se cumplió por verificación", x: "No con números. Partes siempre por los cuatro criterios de la Tabla A2.2." },
      { t: "Lo que no reproduce", x: "En Gazebo las ruedas no pasan por la ley del firmware. No hay zona muerta del driver, fricción real, ruido del láser ni latencias." },
      { t: "Lo que no quedó registrado", x: "La pose verdadera de Gazebo, la frecuencia medida de scan y odom, y la imagen del árbol de marcos. Dilo así, sin dar una cifra." },
      { t: "Dos cifras que no se comparan", x: "El 3,39 % de simulación sale de la propia odometría. El 7,18 % del robot sale de la cinta. Una se mide consigo misma y la otra contra algo físico." }
    ],
    frase: "El gemelo digital verificó la cadena de marcos, la publicación estable del láser y la odometría, el movimiento según el modelo diferencial y las medidas de las ruedas, según la Tabla A2.2. Me permitió corregir errores antes de tocar el hardware. No sirve para validar mapas, porque el mundo simulado no es el recinto real.",
    trampas: [
      { no: "Validé el gemelo digital con números.", si: "Lo verifiqué con los criterios de la Tabla A2.2." },
      { no: "La lámina 18 es simulación.", si: "La 9 es una captura de Gazebo y la 18 es el robot real con RViz." },
      { no: "El mismo láser que el robot real.", si: "Un láser equivalente, pero ideal." },
      { no: "Mapeo y exploración solo se hicieron en el robot real.", si: "Se midieron con indicadores solo en el robot real." }
    ],
    respaldo: "Tabla A2.2 y Anexo 2.2, Sec. 4.2.4, Sec. 5.5, conclusión del OE1, trabajo futuro 9. Láminas 9, 31, 32, 33 y 38."
  },

  /* ───────── Profesor externo ───────── */
  {
    id: "costo", area: "externo", visual: "costo",
    titulo: "Para qué sirve y cuánto costó",
    costo: "En la ronda 5 dijiste que el robot costó cerca de mil pesos y que el proyecto incluye herramientas como el cautín. Ninguna de las dos cosas está en la tesis.",
    preguntas: ["b37", "b38", "b39"],
    claves: [
      { t: "Para qué sirve", x: "Entra a un espacio interior que no conoce, decide solo hacia dónde avanzar y dibuja el plano. Sirve para docencia e investigación, y la idea la usan robots de inspección y logística." },
      { t: "Dos montos", x: "444 643 pesos lo que va montado en el robot. 582 447 pesos el proyecto completo. Ninguno incluye el computador." },
      { t: "Qué separa los dos montos", x: "137 804 pesos de operación y desarrollo, que son el router, los cables de red, el cargador, las baterías de repuesto y los accesorios HDMI y USB. No hay herramientas." },
      { t: "Frente al TurtleBot 3 Burger", x: "32 % menos el robot y 11 % menos el proyecto. No con las mismas prestaciones, porque el Burger trae IMU y actuadores con controlador integrado." }
    ],
    frase: "Los materiales del robot costaron 444 643 pesos y el proyecto completo 582 447, sin contar el computador. Frente al TurtleBot 3 Burger son un 32 y un 11 por ciento menos, pero no con las mismas prestaciones.",
    trampas: [
      { no: "Es más barato que los demás.", si: "Un 32 por ciento menos que el TurtleBot 3 Burger, sin las mismas prestaciones." },
      { no: "Tres veces más barato.", si: "32 por ciento menos el robot y 11 por ciento menos el proyecto." },
      { no: "El proyecto incluye herramientas como el cautín.", si: "Incluye red dedicada, cargador, baterías de repuesto y accesorios de desarrollo." }
    ],
    respaldo: "Sec. 4.1, Tablas A1.1 y A1.2, Anexo 1.2, Tabla A3.2. Láminas 11 y 34."
  },
  {
    id: "fallaria", area: "externo", visual: "fallaria",
    titulo: "Dónde fallaría el robot",
    costo: "4,5 en las rondas 2, 3 y 4, y 6,0 en la ronda 5. En la ronda 2 dijiste que con objetos opacos no habría problema, y en tres rondas olvidaste los pasos estrechos.",
    preguntas: ["b40", "b41", "b29"],
    claves: [
      { t: "Un solo plano", x: "El láser mide en un plano horizontal. No ve lo que queda arriba o abajo, como la cubierta de una mesa o el asiento de una silla." },
      { t: "Superficies difíciles", x: "Se degrada con superficies muy reflectantes, como el vidrio, y con superficies muy absorbentes, que devuelven poca luz." },
      { t: "Pasos estrechos", x: "La esquina del robot está a 0,24 m del centro y la zona de seguridad del mapa es de 0,15 m. El planificador trata al robot como un punto y no revisa su contorno." },
      { t: "Un espacio mayor", x: "Probaste un recinto de 3,5 m² de área libre. Sin IMU la odometría deriva más, y no mediste batería ni CPU." }
    ],
    frase: "Falla con vidrios y superficies muy reflectantes o muy oscuras. El láser ve un solo plano horizontal, así que no detecta lo que está arriba o abajo. Y en pasos estrechos la configuración no garantiza espacio para la esquina del robot.",
    trampas: [
      { no: "Si es opaco no hay problema.", si: "El láser ve un solo plano, y también le afectan las superficies muy absorbentes." },
      { no: "Paredes móviles reconfigurables.", si: "Un único recinto reducido." }
    ],
    respaldo: "Sec. 3.3.1, Alcances y limitaciones, Limitaciones, Sec. 4.5.4, Anexo 5.2, trabajos futuros 1 y 4."
  }
];

window.TRAMPAS_FORMA = [
  { no: "Omito la respuesta.", si: "Responde en parte y aclara lo que no está en la tesis." },
  { no: "Creo que usted se confundió.", si: "No lo digas nunca." }
];
