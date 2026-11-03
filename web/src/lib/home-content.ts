// Explicaciones de la portada original (fcb47bd), conservadas en el nuevo diseño. La lista de temas lleva las 16 partes
// de la guía en el orden de js/sitio.js, y herramientas/pruebas_redisenio_navegador.py comprueba que coincidan.
// Los datos de ensayo pertenecen a la tesis. El robot de la portada sale del CAD y el del laboratorio LiDAR es ilustrativo.
export const chapters = [
  ['01', 'Autonomía en interiores', 'Qué significa ser autónomo, qué alternativas existían y por qué se eligió cada pieza.', 'problema', 'básico'],
  ['02', 'Anatomía del robot', 'Piezas, energía, red, el reparto entre tres procesadores y el costo frente a plataformas comerciales.', 'robot', 'básico'],
  ['03', 'Moverse y medir el avance', 'Tracción diferencial, encoders y odometría, con los ensayos de recta y giro del robot real.', 'movimiento', 'intermedio'],
  ['04', 'Control de velocidad de las ruedas', 'PID en tiempo discreto, la ley heredada que opera como PI, la sintonía con un enjambre de partículas y su estabilidad.', 'control', 'avanzado'],
  ['05', 'Ver y mapear con LiDAR y SLAM', 'Cómo mide el láser, cómo se arma el mapa mientras se corrige la deriva y qué tan cerca queda del plano medido.', 'mapeo', 'intermedio'],
  ['06', 'Planificar y seguir rutas con Nav2', 'Mapas de costos, A estrella, la ventana dinámica y las recuperaciones cuando algo sale mal.', 'navegacion', 'intermedio'],
  ['07', 'Explorar por fronteras', 'Cómo decide el robot a dónde ir y por qué 53 de 54 metas abortadas coinciden con un reemplazo.', 'exploracion', 'intermedio'],
  ['08', 'El gemelo digital', 'El robot en Gazebo, qué se comprueba en simulación y qué solo en el robot real.', 'gemelo', 'básico'],
  ['09', 'La evidencia: qué se demostró', 'Verificar frente a validar, los cuatro objetivos, cuánto dicen cinco repeticiones, las limitaciones y el trabajo futuro.', 'resultados', 'básico'],
  ['10', 'Constrúyelo tú', 'Materiales, conexiones, versiones de software, repositorios base y lecciones de taller.', 'replicar', 'intermedio'],
  // Complementos, numerados como en el lateral y el menú de la guía (SECUENCIA en js/sitio.js)
  ['11', 'En el mundo real', 'Dónde se usan estas mismas ideas, de una aspiradora a una mina chilena y a Marte.', 'mundo-real', 'complemento'],
  ['12', 'Lecciones de ingeniería', 'Temas que la tesis deja implícitos: unidades, seguridad, privacidad y reproducibilidad.', 'lecciones', 'complemento'],
  ['13', 'Preguntas difíciles', 'Las preguntas de quien leyó la tesis con lupa, con su respuesta y su respaldo.', 'preguntas', 'complemento'],
  ['14', 'Laboratorio de análisis', 'Calcula métricas de tablas CSV en tu navegador y muestra las reglas que las interpretan.', 'laboratorio', 'complemento'],
  ['15', 'Recursos', 'Glosario, fuentes agregadas, material para aprender y cómo citar.', 'recursos', 'complemento'],
  ['16', 'Bibliografía de la tesis', 'Las 72 referencias, cada una con su ficha, de qué trata y qué toma la tesis de ella.', 'bibliografia', 'complemento'],
];
/** Encabezados de la lista de temas: índice de la primera parte de cada bloque */
export const chapterGroups: Record<number, string> = { 0: 'El contexto', 2: 'Cómo funciona', 8: 'Evidencia y práctica', 10: 'Para profundizar' };
// El último campo es el color del paso, el mismo de su tema en la guía (css/marco.css)
export const cycle = [
  ['01', '¿Qué hay alrededor?', 'Un láser gira y mide la distancia a las paredes en todas direcciones, en un plano horizontal.', 'Percibir', 'mapeo.html#lidar', 'turquesa'],
  ['02', '¿Dónde estoy?', 'Cuenta cuánto giró cada rueda para saber cuánto avanzó, y corrige ese cálculo con el láser.', 'Estimar', 'movimiento.html', 'naranja'],
  ['03', '¿Qué falta descubrir?', 'Busca los bordes entre lo conocido y lo desconocido, llamados fronteras, y elige uno como destino.', 'Decidir', 'exploracion.html', 'violeta'],
  ['04', '¿Por dónde voy?', 'Planifica una ruta que evita obstáculos y pide a cada rueda la velocidad justa para seguirla.', 'Moverse', 'navegacion.html', 'azul'],
];
export const lessons = [
  ['Unidades y convenciones de ROS', 'Metros, radianes y la convención de ejes de ROS.', 'unidades'],
  ['Verificar y validar', 'Que algo funcione no prueba que sirva para lo que se necesita.', 'verificar'],
  ['Leer el código antes de confiar en su nombre', 'Un archivo llamado PID que opera como PI.', 'codigo-heredado'],
  ['El tipo de dato también es diseño', 'Lo que se pierde al truncar a enteros.', 'tipos'],
  ['Qué significa una meta abortada', 'Por qué 53 de 54 abortos no miden fallas.', 'metricas'],
  ['Medir lo que uno cree medir', 'Diseñar un ensayo con repeticiones y referencia.', 'ensayos'],
  ['Reproducible de verdad', 'Versiones fijas, contenedores y datos guardados.', 'reproducibilidad'],
  ['La seguridad se diseña', 'Lo que exigen las normas para robots móviles.', 'seguridad'],
  ['Un mapa es un dato personal', 'Qué revela el plano de una casa o una oficina.', 'privacidad'],
  ['Declarar los límites', 'Por qué decir qué no se midió da confianza.', 'limites'],
];
export const questions = [
  ['Para todo público', 'Si de 60 destinos el robot llegó a uno, ¿cómo me convence de que sabe ir a donde se le pide?', 'p-una-de-sesenta', 'verde'],
  ['Técnica', '¿Qué diferencia hay entre el 7,18 % y el 3,63 % de la misma recta?', 'p-dos-errores', 'azul'],
  ['Exigente', 'Si el código tiene una ganancia llamada Kd, ¿por qué la ley no tiene acción derivativa?', 'p-kd', 'frambuesa'],
];
