/* Datos de la página. Generado a partir de Banco_preguntas_defensa.docx (rondas 1 a 4, 29 sep 2026),
   Ensayo_Defensa_y_Repaso.docx (ronda 5, 5 oct 2026) y Guion_Defensa.md (frases a evitar).
   Para agregar una ronda nueva, suma una entrada en "rondas" y las notas en "notas" de cada pregunta. */
window.DATOS = {
 "rondas": [
  {
   "r": 1,
   "fecha": "2026-09-26",
   "nota": "Cerró la ronda después de la sexta pregunta. Presentación de 22 láminas y tesis sin el costo."
  },
  {
   "r": 2,
   "fecha": "2026-09-27",
   "nota": "Omitió A estrella, si exploró todo el recinto, la lógica del explorador y Yamauchi."
  },
  {
   "r": 3,
   "fecha": "2026-09-27",
   "nota": "Primera ronda con la presentación de 41 láminas. Omitió la resolución de la velocidad, el cierre de lazo y Trejos."
  },
  {
   "r": 4,
   "fecha": "2026-09-28",
   "nota": "Omitió 0,13 m/s, 1 de 60, el protocolo de giro y el camino de una orden. Además omitió siete repreguntas."
  },
  {
   "r": 5,
   "fecha": "2026-10-05",
   "nivel": 3,
   "nota": "Ensayo en nivel 3, el más exigente. Respondió las doce preguntas."
  }
 ],
 "areas": [
  {
   "id": "marco",
   "nombre": "Marco teórico y referencias",
   "resumen": "Son siete preguntas y cuatro se omitieron. Incluye A estrella en las rondas 2 y 4, el cierre de lazo en la ronda 3, Yamauchi en las rondas 2 y 4, y la elección de SLAM Toolbox con Trejos en las rondas 2 y 3. La única nota buena fue A estrella en la ronda 4, con 5,0. Corresponde a las preguntas 24 a 28, 32 y 33 del banco.",
   "partes": [
    {
     "t": "Qué repasar",
     "x": "La Sec. 3.8 sobre SLAM por grafos, en la página 30. La Sec. 3.10 sobre A estrella y DWB, en la página 32. La Sec. 3.11 sobre fronteras, en la página 33. En las referencias, las secciones 2.2 y 2.3 del artículo de Yamauchi, las conclusiones de Trejos y los párrafos de Macenski y Jambrecic sobre Open Karto y sobre procesadores Intel. Son pocas páginas y responden cinco preguntas."
    },
    {
     "t": "Qué preparar",
     "x": "Una respuesta de dos o tres frases para cada concepto. Grafo de poses, cierre de lazo, A estrella, heurística admisible, qué es una frontera para Yamauchi y para su explorador, y qué algoritmos comparó Trejos."
    }
   ]
  },
  {
   "id": "navexp",
   "nombre": "Navegación y exploración como resultado",
   "resumen": "Son seis preguntas y tres se omitieron. Incluye si se cumplió el objetivo general, la cifra de una meta completada de 60, por qué no ejecutó las metas fijas, cómo sabe que exploró todo, la lógica del explorador y por qué no corrigió el reemplazo de metas. Corresponde a las preguntas 1 a 4, 30 y 31.",
   "partes": [
    {
     "t": "Qué repasar",
     "x": "Alcances y limitaciones en la página 3. Las Sec. 5.3 y 5.4, en las páginas 69 a 75. El Alg. 4.4 en la página 59. La Tabla A7.1 en la página 124 y el Anexo 8.4 en la página 127. Las láminas 19, 27, 29, 35 y 41."
    },
    {
     "t": "Idea central",
     "x": "De 54 metas abortadas, 53 fueron reemplazos del propio explorador. Por eso una meta completada de 60 no es una tasa de éxito, y la prueba de que el robot se movió es que el mapa creció."
    }
   ]
  },
  {
   "id": "control",
   "nombre": "Control de bajo nivel",
   "resumen": "Son nueve preguntas y cuatro se omitieron. Incluye por qué la ley no es un PID, por qué no la reemplazó, el protocolo serial, el windup, el aporte del PSO, la resolución de la medición, la referencia única de 0,13 m/s y el camino de una orden hasta el motor. Corresponde a las preguntas 10 a 18.",
   "partes": [
    {
     "t": "Qué repasar",
     "x": "La Sec. 4.3.3 en la página 43, la Sec. 4.4.3 con la Ec. 4.1 en las páginas 48 a 50, la Sec. 4.4.5 en las páginas 51 a 53 y la Sec. 5.2 con la Tabla 5.3 en las páginas 65 a 69. Los Anexos 3.5, 4.3, 4.4 y 4.5, en las páginas 103 a 111. La lámina 26."
    },
    {
     "t": "Qué memorizar",
     "x": "El camino completo de una orden, las cifras de 41 ticks por ciclo a 0,13 m/s, el umbral de 14 ticks del integral izquierdo, las bandas muertas de 1 y 2 ticks y las ganancias originales del firmware, que eran Kp 20, Kd 12 y Ki 0."
    }
   ]
  },
  {
   "id": "ensayos",
   "nombre": "Ensayos y fallas",
   "resumen": "Son cinco preguntas y una se omitió. Incluye la iteración 2 en las cuatro rondas y el protocolo de giro en la ronda 4. Corresponde a las preguntas 19 a 23.",
   "partes": [
    {
     "t": "Qué repasar",
     "x": "La Sec. 5.1 en las páginas 62 a 64, el Anexo 6 en las páginas 121 a 123, el Anexo 7 en las páginas 123 a 125, la Tabla A5.1 en la página 117 y las láminas 28, 32 y 35."
    },
    {
     "t": "Regla",
     "x": "Cuando algo falló y la tesis dice que la causa no se determinó, diga eso. No proponga una causa nueva en la sala."
    }
   ]
  },
  {
   "id": "decisiones",
   "nombre": "Decisiones técnicas",
   "resumen": "Son dos preguntas, el uso de Foxy y Gazebo Classic en la ronda 1 y por qué construir en vez de comprar un TurtleBot en la ronda 3. Corresponde a las preguntas 34 y 39.",
   "partes": [
    {
     "t": "Qué repasar",
     "x": "La Sec. 2.1 en las páginas 15 y 16, Alcances y limitaciones, el Anexo 1.2 en la página 95 y las láminas 34 y 36."
    }
   ]
  },
  {
   "id": "gemelo",
   "nombre": "Gemelo digital",
   "resumen": "Son cuatro preguntas, una por ronda, y ninguna se omitió, pero ninguna pasó de 4,5. Corresponde a las preguntas 5 a 9.",
   "partes": [
    {
     "t": "Qué repasar",
     "x": "La Tabla A2.2 en la página 99, la Sec. 5.5 en la página 75, la conclusión del OE1 en la página 78 y las láminas 31, 32, 33 y 38."
    },
    {
     "t": "Qué evitar",
     "x": "Decir que simulación y robot se comportan igual, confundir RViz con Gazebo y mencionar el video."
    }
   ]
  },
  {
   "id": "externo",
   "nombre": "Preguntas del profesor externo",
   "resumen": "Son nueve preguntas y es su área más fuerte. Incluye la explicación simple, el costo, dónde fallaría en una oficina y qué pasaría en un espacio mayor. Corresponde a las preguntas 37, 38, 40 y 41. Lo que falta aquí es contestar todas las partes a la primera y no agregar argumentos que no están en la tesis.",
   "partes": []
  }
 ],
 "temas": [
  {
   "id": 1,
   "nombre": "Objetivos y cumplimiento"
  },
  {
   "id": 2,
   "nombre": "Gemelo digital y simulación"
  },
  {
   "id": 3,
   "nombre": "Control de bajo nivel"
  },
  {
   "id": 4,
   "nombre": "Odometría y ensayos de movimiento"
  },
  {
   "id": 5,
   "nombre": "La iteración 2"
  },
  {
   "id": 6,
   "nombre": "Mapeo y SLAM"
  },
  {
   "id": 7,
   "nombre": "Navegación y A estrella"
  },
  {
   "id": 8,
   "nombre": "Exploración por fronteras"
  },
  {
   "id": 9,
   "nombre": "Decisiones de hardware y software"
  },
  {
   "id": 10,
   "nombre": "Preguntas del profesor externo"
  }
 ],
 "preguntas": [
  {
   "id": "b1",
   "n": 1,
   "tema": 1,
   "area": "navexp",
   "corto": "¿Se cumplió el objetivo general?",
   "titulo": "¿Se cumplió el objetivo general y cómo sabe que el robot se movió?",
   "como": "Si el objetivo general se cumplió, dado que el OE3 quedó parcial, y con qué evidencia sabe que el robot realmente se desplazó.",
   "quien": "Profesor guía en la ronda 3. Nota 3,5.",
   "respuesta": "Para mapear y explorar, sí se cumplió. En cinco de las seis ejecuciones el robot construyó un mapa 2D y terminó solo, cuando el explorador ya no encontró fronteras. Sé que se desplazó porque el mapa creció en cada corrida, con coberturas de entre 53,4 y 82,9 %, y eso exige que el láser vea geometría nueva desde otras posiciones. La navegación funcionó de extremo a extremo y llevó al robot hacia las metas del explorador, pero no tengo un indicador cuantitativo de su desempeño. Por eso declaro cumplidos el OE1 y el OE4, y cumplidos en parte el OE2 y el OE3.",
   "repreguntan": "Si le dicen que la línea verde de la lámina 18 prueba el recorrido, corrija. Es la ruta que planifica Nav2 hacia la frontera, no el camino que hizo el robot. Si le preguntan si las 60 metas prueban movimiento, diga que no, porque en la iteración 2 hubo 14 metas y el robot no se movió.",
   "donde": "Conclusiones sobre los cuatro objetivos, páginas 78 y 79. Sec. 5.4, página 71. Tabla 5.5, página 74. Anexo 7, página 124. Láminas 19, 20, 21 y 35.",
   "costo": "Dijo mapeo 3D, presentó la línea verde como recorrido y usó las metas generadas como evidencia de movimiento. No separó lo que se cumple de lo que falta medir.",
   "extras": [],
   "notas": [
    {
     "r": 3,
     "p": "guia",
     "v": 3.5
    },
    {
     "r": 5,
     "p": "guia",
     "v": 5.5
    }
   ],
   "ensayo": [
    {
     "n": 4,
     "p": "guia",
     "tit": "Cumplimiento del objetivo tres",
     "pregunta": "El objetivo específico tres habla de implementar localización, mapeo y navegación autónoma. De 60 metas de navegación, una sola se completó. ¿En qué sentido considera cumplido ese objetivo?",
     "dijo": "Explicó que la exploración es por fronteras y que las metas terminan abortadas porque el explorador crea una nueva cada 3,3 segundos, lo que en un lugar estrecho genera muchas metas. Ante la repregunta sobre un indicador de llegada a una meta fija, defendió que las metas fijas no eran parte del objetivo. Finalmente aceptó que la navegación quedó verificada funcionalmente y no validada con datos.",
     "bien": "Defendió el alcance con razón, porque la tesis declara las metas fijas fuera del alcance. Lo más valioso fue aceptar con claridad la diferencia entre verificar que algo funciona y validarlo con números.",
     "falto": "Llegar a esa distinción sin que se la propusieran. Además, citó el área mapeada como evidencia, pero ese dato mide la exploración y el mapeo, no la navegación punto a punto.",
     "sugerida": "El objetivo tres se cumplió en mapeo y exploración, con indicadores. La navegación quedó verificada funcionalmente, no validada, porque la navegación hacia metas fijas está fuera del alcance declarado. Además, 53 de los 54 abortos fueron reemplazos hechos por el propio explorador, así que 1 de 60 no es una tasa de éxito.",
     "respaldo": "Alcances y limitaciones, Tabla 5.5 de estado por subsistema, sección 5.4 y Tabla A7.1 de la tesis.",
     "nota": 5.5
    }
   ]
  },
  {
   "id": "b2",
   "n": 2,
   "tema": 1,
   "area": "navexp",
   "corto": "1 de 60 destinos",
   "titulo": "Si de 60 destinos el robot llegó a uno, ¿cómo me convence de que sabe ir a donde se le pide?",
   "como": "",
   "quien": "Profesor externo en la ronda 4. Omitida, nota 1,0.",
   "respuesta": "Esa cifra no mide si el robot llega. El programa de exploración vuelve a elegir destino cada 3,3 segundos y manda el nuevo sin cancelar el anterior. Nav2, en la versión que usé, cierra el anterior como abortado. Revisé cada meta por su identificador y en 53 de los 54 abortos fue eso. Además, el tiempo mediano que cada meta estuvo activa fue 3,3 segundos, igual al período del explorador. Lo que muestra que el robot sí va hacia donde se le manda es que en cinco de seis corridas el mapa creció hasta que no quedaron fronteras. Lo que me falta es medirlo con destinos fijos, que es el trabajo futuro 1.",
   "repreguntan": "Por el aborto que no es reemplazo, diga que es la primera meta de la iteración 1, que ya figuraba abortada en el primer mensaje registrado y no se pudo clasificar. Con los datos registrados no identificó ningún aborto causado por una falla de Nav2, y tampoco puede saber si las metas reemplazadas habrían llegado.",
   "donde": "Sec. 5.4, páginas 71 a 73. Tabla A7.1, página 124. Anexo 8.4, página 127. Láminas 19, 27 y 41.",
   "costo": "La omitió aunque el guion tenía la respuesta lista en tres láminas. No diga solo una de 60 se completó como si fuera un fracaso.",
   "extras": [],
   "notas": [
    {
     "r": 4,
     "p": "externo",
     "v": 1.0,
     "om": true
    }
   ]
  },
  {
   "id": "b3",
   "n": 3,
   "tema": 1,
   "area": "navexp",
   "corto": "Por qué no ejecutó metas fijas",
   "titulo": "Si el script de metas fijas ya estaba preparado, ¿por qué no ejecutó ese ensayo?",
   "como": "",
   "quien": "Profesor guía en la ronda 2. Nota 2,5.",
   "respuesta": "No se ejecutó. Lo comprometido en el objetivo general es navegar hacia destinos generados por el explorador, y así se evaluó. Un protocolo con metas fijas exige un mapa guardado, AMCL activo y puntos medidos en el recinto, y esas condiciones no se configuraron. Por eso quedó fuera del alcance declarado. El script quedó preparado, pero su carpeta no tiene registros de salida, no mide el error de posición final y sus poses objetivo solo están definidas para el mundo simulado. Ejecutarlo es el trabajo futuro 1.",
   "repreguntan": "Si le preguntan si lo intentó, dé una sola versión. Si hizo intentos que no quedaron registrados, use una frase como la del guion, hice pruebas preliminares sin registros, pero el protocolo formal no se ejecutó.",
   "donde": "Alcances y limitaciones, página 3. Sec. 4.5.2, página 54. Sec. 5.4, página 73. Anexo 8.3, página 127. Lámina 29 y su guion.",
   "costo": "Dio tres versiones que se contradecían, dijo que hizo más de cinco pruebas sin captura de datos y que el profesor se había confundido. Nunca diga eso a la comisión.",
   "extras": [],
   "notas": [
    {
     "r": 2,
     "p": "guia",
     "v": 2.5
    }
   ]
  },
  {
   "id": "b4",
   "n": 4,
   "tema": 1,
   "area": "navexp",
   "corto": "¿Exploró todo el recinto?",
   "titulo": "Si la superficie del recinto no se midió aparte del mapa, ¿cómo sabe que el robot exploró todo?",
   "como": "",
   "quien": "Profesor informante en la ronda 2. Omitida, nota 1,0.",
   "respuesta": "No puedo afirmar que exploré todo el recinto, porque no medí su superficie aparte del mapa. Tengo dos evidencias. Las cinco corridas válidas terminaron solas porque el explorador ya no encontró fronteras en el mapa de costos. Y el área libre fue casi igual en las cinco, entre 3,478 y 3,540 metros cuadrados, con una dispersión de 0,03, lo que indica que todas llegaron al mismo espacio alcanzable. El índice de cobertura se calcula sobre la imagen del mapa y no sobre la sala, por eso varía tanto. Medir el recinto aparte del mapa queda como mejora pendiente.",
   "repreguntan": "Si le preguntan por qué la iteración 1 tiene 82,9 % y la 6 tiene 53,4 %, explique que el índice depende de cuántas celdas desconocidas quedan dentro de la imagen, no del área mapeada. Las dos tienen casi la misma área libre, 3,51 y 3,48 metros cuadrados.",
   "donde": "Sec. 5.3 y Tabla 5.4, páginas 69 y 70. Limitaciones, validez externa, página 80. Láminas 16 y 17. Respuesta corta del guion sobre cómo sabe que exploró todo el recinto.",
   "costo": "La omitió. No diga que el robot cubre el 62 % del recinto. Diga índice medio de cobertura libre de 62,2 %.",
   "extras": [],
   "notas": [
    {
     "r": 2,
     "p": "informante",
     "v": 1.0,
     "om": true
    }
   ]
  },
  {
   "id": "b5",
   "n": 5,
   "tema": 2,
   "area": "gemelo",
   "corto": "Criterio del OE1 y gemelo digital",
   "titulo": "¿Con qué criterio da por cumplido el OE1 y qué evidencia tiene de que la simulación y el robot se comportan igual?",
   "como": "",
   "quien": "Profesor guía en las cuatro rondas. Notas 4,5, 3,5, 3,5 y 4,0. Es la pregunta que más se repitió.",
   "respuesta": "El OE1 se cumplió con una verificación de funcionamiento, no con números. En Gazebo comprobé los cuatro criterios de la Tabla A2.2. La cadena de marcos está completa, sin marcos sueltos. El láser y la odometría se publican de forma estable en scan y odom. El robot avanza y gira como dice el modelo diferencial. Y el radio y la separación de ruedas son iguales a los del prototipo. Eso muestra que el gemelo reproduce los marcos, los sensores y los movimientos del prototipo, pero no reemplaza una medición. Lo que no tengo es una comparación sobre una misma variable, porque en simulación la pose verdadera de Gazebo no quedó registrada. Registrarla es el trabajo futuro 9.",
   "repreguntan": "",
   "donde": "Tabla A2.2 y Anexo 2.2, página 99. Sec. 4.2.4, página 40. Sec. 5.5, página 75. Conclusión del OE1, página 78. Trabajo futuro 9, página 82. Lámina 38.",
   "costo": "En la ronda 2 habló de una captura y no nombró los cuatro criterios. En la ronda 3 dijo que las capturas muestran el mismo comportamiento y trató a RViz como el gemelo. En la ronda 4 dijo bien los criterios, pero mencionó un video que no está en la tesis. Parta siempre por los cuatro criterios.",
   "extras": [
    {
     "t": "Ojo con la lámina 38",
     "x": "La lámina dice el mismo comportamiento en simulación y en el robot real. La tesis no sostiene esa frase. Use la del guion, reproduce los marcos, los sensores y los movimientos del prototipo."
    }
   ],
   "notas": [
    {
     "r": 1,
     "p": "guia",
     "v": 4.5
    },
    {
     "r": 2,
     "p": "guia",
     "v": 3.5
    },
    {
     "r": 3,
     "p": "guia",
     "v": 3.5
    },
    {
     "r": 4,
     "p": "guia",
     "v": 4.0
    },
    {
     "r": 5,
     "p": "guia",
     "v": 5.5
    }
   ],
   "ensayo": [
    {
     "n": 12,
     "p": "guia",
     "tit": "Para qué sirvió la simulación",
     "pregunta": "El mundo simulado en Gazebo no es el recinto real, así que no se pueden comparar los mapas. ¿Para qué le sirvió realmente la simulación?",
     "dijo": "Dijo que sirvió para validar el modelo URDF y los marcos de referencia, el desplazamiento, la cercanía a los obstáculos y el láser, y para ver posibles problemas antes de pasar al hardware, porque en hardware real cuesta mucho volver atrás.",
     "bien": "Aceptó la lectura correcta. La simulación sirve para equivocarse barato antes de construir.",
     "falto": "Ordenar la respuesta. Nombró varias cosas sueltas antes de llegar a la idea central.",
     "sugerida": "El gemelo digital verificó la cadena de marcos, la publicación estable del láser y la odometría, el movimiento según el modelo diferencial y las medidas de las ruedas, según la Tabla A2.2. Me permitió corregir errores antes de tocar el hardware. No sirve para validar mapas, porque el mundo simulado no es el recinto real.",
     "respaldo": "Tabla A2.2 de la tesis y lámina 9.",
     "nota": 5.5
    }
   ]
  },
  {
   "id": "b6",
   "n": 6,
   "tema": 2,
   "area": "gemelo",
   "corto": "Registro de lo observado en simulación",
   "titulo": "¿Dónde quedó registrado lo que usted observó, por ejemplo la frecuencia medida de odom y del láser?",
   "como": "",
   "quien": "Profesor guía, como repregunta en la ronda 4, omitida. En la ronda 3 respondió 30 Hz.",
   "respuesta": "No quedó registrado. El Anexo 2.2 dice que los criterios se confirmaron durante la puesta en marcha del modelo digital, pero no guardé los valores medidos ni la imagen del árbol de marcos de la simulación. Es una debilidad del registro. La corregiría agregando al anexo la frecuencia medida de scan y odom y la imagen del árbol de marcos.",
   "repreguntan": "",
   "donde": "Anexo 2.2, página 99. En el código, my_controllers.yaml y la carpeta test/verificacion_tf.",
   "costo": "",
   "extras": [
    {
     "t": "Por qué no dar una cifra",
     "x": "El valor de 30 Hz que dijo en la ronda 3 no está en la tesis. En el código, my_controllers.yaml pide publicar la odometría a 50 Hz mientras el ciclo del controlador corre a 30 Hz, y el script de verificación de marcos, que está hecho para el robot real, espera cerca de 50 Hz. Como nada quedó medido en simulación, lo correcto es decir que no lo registró."
    }
   ],
   "notas": []
  },
  {
   "id": "b7",
   "n": 7,
   "tema": 2,
   "area": "gemelo",
   "corto": "Lámina 18, simulación o robot real",
   "titulo": "La imagen de RViz de la lámina 18, ¿es la simulación o el robot real?",
   "como": "",
   "quien": "Profesor guía en las rondas 1 y 2.",
   "respuesta": "Es el robot real. A la izquierda hay una cámara desde arriba y a la derecha RViz, que es el programa donde se ven los datos que envía el robot real, con el mapa y la ruta planificada en verde. La simulación está en las láminas 9 y 33, que son capturas de Gazebo Classic. Por eso la lámina 18 no compara simulación con realidad, muestra la cadena completa funcionando en el robot.",
   "repreguntan": "",
   "donde": "Guion de las láminas 9, 18, 33 y 38. Fig. 5.5, página 73.",
   "costo": "En la ronda 1 dijo que esa imagen muestra que el robot se comporta como el gemelo. En la ronda 2 presentó la lámina 18 como el video de simulación y robot real.",
   "extras": [],
   "notas": []
  },
  {
   "id": "b8",
   "n": 8,
   "tema": 2,
   "area": "gemelo",
   "corto": "3,39 % frente a 7,18 %",
   "titulo": "¿El 3,39 % de simulación y el 7,18 % del robot miden lo mismo?",
   "como": "",
   "quien": "Profesor guía, como repregunta en las rondas 1 y 2.",
   "respuesta": "No miden lo mismo. En la recta de 2 metros, en simulación la distancia sale de la propia odometría, porque la pose verdadera de Gazebo no quedó registrada, y da 3,39 % frente a lo ordenado. En el robot la mido con cinta métrica y da 7,18 %. Una se mide consigo misma y la otra contra una referencia física. En el giro, los dos entornos se comparan con 360 grados nominales, 4,74 % en simulación y 3,24 % en el robot, y eso no mide error de odometría. Por eso no comparo números entre entornos.",
   "repreguntan": "Si le preguntan qué cifra del robot se parece al 3,39, es el 3,8 % que los encoders marcan por debajo de lo nominal, del mismo orden según la Sec. 5.1. Si le piden las dispersiones, son 2,04 % en la recta simulada, 0,43 % en la recta real, 1,61 % en el giro simulado y 2,22 % en el giro real.",
   "donde": "Tabla 5.1 y su nota, página 63. Sec. 5.1, páginas 62 a 64. Tabla 5.2, página 64. Sec. 5.5, página 75. Láminas 28 y 32.",
   "costo": "En la ronda 1 dio las cifras correctas, pero no dijo si medían lo mismo, que era lo que se preguntaba.",
   "extras": [],
   "notas": []
  },
  {
   "id": "b9",
   "n": 9,
   "tema": 2,
   "area": "gemelo",
   "corto": "El video de simulación y robot",
   "titulo": "¿Qué demuestra concretamente el video donde se ven en paralelo la simulación y el robot real?",
   "como": "",
   "quien": "Profesor guía en la ronda 2, nota 3,5. Usted mismo mencionó el video en la ronda 4.",
   "respuesta": "La evidencia del OE1 son los criterios de la Tabla A2.2, no un video. Un video puede mostrar al robot funcionando y al gemelo moviéndose, pero no reemplaza una medición y no compara una misma variable. La tesis dice que no se comparó una misma variable entre ambos entornos, y el mundo simulado no es el recinto real.",
   "repreguntan": "",
   "donde": "Plan de contingencia del guion. Sec. 5.5, página 75. Guion de la lámina 9.",
   "costo": "",
   "extras": [
    {
     "t": "Decisión pendiente",
     "x": "La tesis no cita ningún video. El plan de contingencia del guion dice que demo_tesis.mp4 no se muestra ni se menciona, y que solo se usa si la presentación no abre. Decida antes de la defensa si lo incorpora. Si lo usa, fije en una frase qué muestra y qué no demuestra. Si no lo usa, no lo nombre."
    }
   ],
   "notas": []
  },
  {
   "id": "b10",
   "n": 10,
   "tema": 3,
   "area": "control",
   "corto": "Por qué la ley no es un PID",
   "titulo": "El código tiene una ganancia llamada Kd cercana a 20. ¿Por qué dice que la ley no tiene acción derivativa?",
   "como": "",
   "quien": "Profesor informante en la ronda 1. Omitida, nota 1,0.",
   "respuesta": "El firmware no calcula la salida completa en cada ciclo. Calcula un aumento y lo suma a la salida anterior, y esa suma hace que cada término suba un orden de integración. Kp multiplica el error y, al acumularse, actúa como integral. Kd multiplica el cambio de la medición y, al acumularse, actúa como proporcional sobre la medición, así que deja de ser derivativo. Ki se acumula dos veces y actúa como una segunda integración. Sin Ki, la ley coincide con un PI incremental como el que describen Åström y Hägglund. Así opera la rueda derecha, porque su estado integral se guarda como entero y, con errores tan pequeños, el producto de Ki por el error nunca llega a una unidad. Por eso el objetivo pedía un PID, el resultado es un PI y el OE2 queda parcial.",
   "repreguntan": "",
   "donde": "Sec. 4.4.3 y Ec. 4.1, páginas 48 y 49. Anexo 4.4, página 110. Anexo 4.5, página 111. Sec. 5.2, página 68. Lámina 26. En el código, la función doPID de diff_controller.h.",
   "costo": "La omitió aunque la tenía escrita en la lámina de respaldo.",
   "extras": [
    {
     "t": "Término",
     "x": "PI incremental quiere decir que en cada ciclo el controlador calcula cuánto cambiar la salida, con una acción proporcional y una integral, sin acción derivativa."
    }
   ],
   "notas": [
    {
     "r": 1,
     "p": "informante",
     "v": 1.0,
     "om": true
    },
    {
     "r": 5,
     "p": "informante",
     "v": 4.5
    },
    {
     "r": 5,
     "p": "informante",
     "v": 4.5
    }
   ],
   "ensayo": [
    {
     "n": 7,
     "p": "informante",
     "tit": "Un PID que se comporta como PI",
     "pregunta": "El guion dice que el controlador opera como un PI incremental, pero el firmware lo llama PID. ¿Por qué un PID termina comportándose como un PI, y dónde quedó la acción derivativa?",
     "dijo": "Partió diciendo \"control P\" y corrigió a PI. Explicó que se usa la versión incremental y que por eso cambian los papeles de las constantes. Dijo que la integral se transforma en proporcional, la derivativa en integral y la integral en el error acumulado.",
     "bien": "Identificó la causa correcta, que es la forma incremental.",
     "falto": "El reparto de papeles quedó al revés. Lo correcto es que la ganancia rotulada como proporcional actúa como integral, la rotulada como derivativa actúa como proporcional sobre la medición y la rotulada como integral queda como una segunda integración casi nula. La parte 4 de este documento lo explica en detalle.",
     "sugerida": "El firmware suma cada aumento a la salida anterior, así que cada término sube un orden de integración. Kp actúa como integral, Kd como proporcional sobre la medición y Ki como segunda integración, sin derivativa efectiva. Por eso opera como un PI incremental.",
     "respaldo": "Resumen de la tesis, sección 4.4.3 y Algoritmo 4.2.",
     "nota": 4.5
    },
    {
     "n": 8,
     "p": "informante",
     "tit": "La integración en la forma incremental",
     "pregunta": "Se le aclaró que en la forma incremental no hay una variable que guarde el error acumulado, y se le pidió confirmar si veía la diferencia.",
     "dijo": "Tras la aclaración, reconoció que en la forma incremental se va sumando el incremento.",
     "bien": "Llegó a la idea correcta.",
     "falto": "Decirlo sin ayuda. La forma incremental no guarda el error acumulado. Guarda la última salida y le suma el cambio de cada ciclo, y en esa suma queda implícita la integración.",
     "sugerida": "La forma incremental calcula solo el cambio de la salida en cada ciclo y lo suma a la salida anterior. No guarda el error acumulado, la integración queda implícita en esa suma.",
     "respaldo": "Algoritmo 4.2 de la tesis.",
     "nota": 4.5
    }
   ],
   "figuras": [
    {
     "src": "img/ganancias.png",
     "cap": "Cómo cambia el papel de cada ganancia en el firmware incremental."
    },
    {
     "src": "img/ciclo-pid.png",
     "cap": "Un ciclo del PID del firmware con los tres puntos donde se cortan decimales. Números de ejemplo, salvo las ganancias de la rueda derecha."
    }
   ],
   "frases": [
    "El firmware suma cada aumento a la salida anterior, así que cada término sube un orden de integración. Kp actúa como integral, Kd como proporcional sobre la medición y Ki como segunda integración, sin derivativa efectiva. Por eso opera como un PI incremental."
   ]
  },
  {
   "id": "b11",
   "n": 11,
   "tema": 3,
   "area": "control",
   "corto": "Por qué no la reemplazó",
   "titulo": "Si ya sabía que no era un PID, ¿por qué no la reemplazó por un PID incremental estándar?",
   "como": "",
   "quien": "Profesor informante en las rondas 2 y 4. Notas 4,5 y 3,5.",
   "respuesta": "La conservé porque siguió la referencia en los ensayos y porque la forma incremental simplifica la protección contra el windup del integrador. No la elegí comparando su desempeño con otras leyes, y esa comparación con un PID incremental estándar es el trabajo futuro 6. Por eso mis ganancias caracterizan esta ley y no deben leerse por su nombre.",
   "repreguntan": "",
   "donde": "Sec. 4.4.3, páginas 49 y 50. Anexo 4.5, página 111. Limitaciones, ley de control, página 80. Trabajo futuro 6, página 81. Lámina 26.",
   "costo": "En la ronda 2 dijo primero que la ley se comporta igual que un PID con otro escalamiento, y que el control corre dentro de ROS 2. Las dos cosas contradicen la tesis. La ley corre en el Arduino. También mezcló las dos razones como si el protocolo facilitara el windup.",
   "extras": [
    {
     "t": "Corrección",
     "x": "La tesis da además la razón de que diffdrive_arduino usa el protocolo serial de este firmware. En la ronda 2 esa razón se sugirió como la primera, pero en las rondas 3 y 4 la comisión mostró que no se sostiene, porque el protocolo no depende de la fórmula. Si la menciona, prepárese para la pregunta 12."
    }
   ],
   "notas": [
    {
     "r": 2,
     "p": "informante",
     "v": 4.5
    },
    {
     "r": 4,
     "p": "informante",
     "v": 3.5
    }
   ]
  },
  {
   "id": "b12",
   "n": 12,
   "tema": 3,
   "area": "control",
   "corto": "El protocolo serial no obliga la fórmula",
   "titulo": "El protocolo serial solo transporta referencias y conteos de encoder. ¿Qué le impedía reescribir la función de control sin tocar la comunicación?",
   "como": "",
   "quien": "Profesor informante en la ronda 3, nota 2,5, y como repregunta en la ronda 4, omitida.",
   "respuesta": "Tiene razón, nada me lo impedía. La interfaz diffdrive_arduino solo envía un mensaje vacío al iniciar, las referencias con el comando m y la lectura de encoders con el comando e. Ninguno depende de la fórmula interna, y la función que cargaría ganancias existe pero no se usa. La ley está en diff_controller.h, separada del manejo de comandos. El protocolo justifica conservar los comandos, no la fórmula. Conservé la ley porque siguió la referencia y por la protección contra el windup, y reconozco que esa frase de la Sec. 4.4.3 hay que precisarla.",
   "repreguntan": "",
   "donde": "Sec. 4.3.3, página 44, donde dice que las ganancias no se transmiten en tiempo de ejecución. Alg. 4.1, página 45. Tabla A4.2, página 109. Anexo 4.5, página 111. En el código, arduino_comms.cpp, diff_controller.h y ROSArduinoBridge.ino.",
   "costo": "En la ronda 3 repitió las dos razones del guion sin contestar lo preguntado, y en la ronda 4 omitió la repregunta. Frente a una objeción que es correcta, conceda y diga cómo lo corregiría.",
   "extras": [],
   "notas": [
    {
     "r": 3,
     "p": "informante",
     "v": 2.5
    }
   ]
  },
  {
   "id": "b13",
   "n": 13,
   "tema": 3,
   "area": "control",
   "corto": "Qué es el windup",
   "titulo": "¿Qué es el windup y cómo lo evita su firmware?",
   "como": "",
   "quien": "Apareció dentro de las preguntas de la ley de control en las rondas 2 y 3, con una definición equivocada.",
   "respuesta": "El windup ocurre cuando el motor ya está al máximo y la parte integral del controlador sigue acumulando error. Cuando el error cambia de signo, esa acumulación tarda en descargarse y la respuesta se atrasa o se pasa. Mi firmware lo evita con integración condicional. El estado integral solo se actualiza cuando la salida no está saturada, es decir, cuando está entre menos 255 y 255.",
   "repreguntan": "",
   "donde": "Anexo 4.4, página 110, que cita a Åström y Hägglund, Sec. 3.5. Nota del guion en la lámina 26.",
   "costo": "Lo definió como que crece el error. Lo que crece es la parte integral, no el error.",
   "extras": [],
   "notas": [],
   "figuras": [
    {
     "src": "img/windup.png",
     "cap": "Simulación ilustrativa con la rueda trabada 3 segundos. No es una medición del robot."
    }
   ],
   "frases": [
    "El PI normal acumula el error en una variable que puede inflarse cuando el motor se satura, mientras que el incremental guarda la última salida ya limitada. Por eso no se infla y la respuesta al liberarse es más suave.",
    "El PI incremental con salida limitada se comporta como un PI con antiwindup, pero sin necesitar una lógica adicional, porque no guarda un acumulador que pueda inflarse."
   ],
   "links": [
    {
     "t": "Understanding PID Control, Part 2 (MathWorks)",
     "u": "https://www.mathworks.com/videos/understanding-pid-control-part-2-expanding-beyond-a-simple-integral-1528310418260.html",
     "d": "Video con animaciones sobre el integrador cuando el actuador se satura."
    },
    {
     "t": "Integral Windup and Bumpless Transfer (Notre Dame)",
     "u": "https://jckantor.github.io/cbe30338-book/notebooks/03.07-Integral-Windup-and-Bumpless-Transfer.html",
     "d": "El más recomendable para empezar. Compara el windup con el PI en forma de velocidad."
    },
    {
     "t": "Integral (Reset) Windup and the Velocity PI Form (Control Guru)",
     "u": "https://controlguru.com/integral-reset-windup-jacketing-logic-and-the-velocity-pi-form/",
     "d": "Explicación simple del windup y de la forma incremental."
    },
    {
     "t": "Proportional Integral Derivative (APMonitor)",
     "u": "https://apmonitor.com/pdc/index.php/Main/ProportionalIntegralDerivative",
     "d": "Forma posicional y de velocidad lado a lado."
    },
    {
     "t": "PID Control, capítulo 6 (Åström, Caltech)",
     "u": "https://www.cds.caltech.edu/~murray/courses/cds101/fa02/caltech/astrom-ch6.pdf",
     "d": "Diagrama del PID en forma de velocidad, del mismo autor que cita la tesis."
    },
    {
     "t": "The velocity of PID (Control Engineering)",
     "u": "https://www.controleng.com/the-velocity-of-pid/",
     "d": "De dónde sale la forma de velocidad a partir de la posicional."
    }
   ]
  },
  {
   "id": "b14",
   "n": 14,
   "tema": 3,
   "area": "control",
   "corto": "Qué aportó el PSO",
   "titulo": "¿Qué aportó realmente el PSO, si después del ajuste en el robot las ganancias cambiaron tanto?",
   "como": "",
   "quien": "Profesor guía en la ronda 3, nota 3,0. Profesor informante en la ronda 4, nota 4,0. También estaba preparada en la ronda 1.",
   "respuesta": "El PSO me dio un punto de partida para las tres ganancias a la vez, calculado sobre un modelo de primer orden con retardo identificado para cada rueda, en vez de partir por tanteo. No fue el ajuste final. Con esas ganancias apareció un error estacionario en la rueda izquierda y una detención en la derecha, que el modelo no anticipaba porque no representa la zona muerta del driver. Los corregí en el robot, subiendo Kp entre 28 y 63 %, bajando Kd entre 41 y 45 % y subiendo Ki en varios órdenes de magnitud. No lo comparé contra las ganancias originales del firmware, que eran Kp 20, Kd 12 y Ki 0, así que no afirmo que haya ahorrado tiempo. Tampoco hice un análisis de estabilidad. Lo que afirmo es que con las ganancias finales el robot siguió la referencia de 0,13 m/s sin sobreimpulso apreciable.",
   "repreguntan": "Si le preguntan por qué el PSO entregó Kd de 34,69 y 36,70 si la escala de búsqueda era 25, explique que la salida final se escala sin recortar, así que puede superar la escala aunque el costo se haya evaluado con una copia recortada. Además, la clase PSO no fija una semilla, así que al repetir el script los valores pueden cambiar.",
   "donde": "Sec. 2.1, página 16. Sec. 4.4.5, páginas 51 a 53. Sec. 5.2 con las Fig. 5.3 y 5.4, páginas 65 a 69. Anexo 4.5, página 111, con las ganancias originales. Anexo 4.8, página 114. Tabla A4.4, página 116. Limitaciones, página 80. Láminas 12, 15 y 25.",
   "costo": "En la ronda 3 dijo que el PSO entregó un sistema estable y que aceleró el ajuste. Ninguna de las dos cosas está medida, y la tesis declara que no hizo análisis de estabilidad. También entendió mal la repregunta sobre las ganancias originales y respondió que las ganancias eran de su propiedad.",
   "extras": [
    {
     "t": "Término",
     "x": "El modelo de primer orden con retardo, llamado FOPDT, resume cada rueda con tres números. Cuánto responde, qué tan rápido responde y con cuánto retardo."
    }
   ],
   "notas": [
    {
     "r": 3,
     "p": "guia",
     "v": 3.0
    },
    {
     "r": 4,
     "p": "informante",
     "v": 4.0
    },
    {
     "r": 5,
     "p": "guia",
     "v": 5.0
    }
   ],
   "ensayo": [
    {
     "n": 9,
     "p": "guia",
     "tit": "Por qué PSO y no un método clásico",
     "pregunta": "¿Por qué eligió optimización por enjambre de partículas, conocida como PSO, y no una sintonización clásica como el método de Ziegler y Nichols? ¿Qué ganó con esa decisión?",
     "dijo": "Explicó que PSO entregó las constantes y que se usó sobre un modelo con retardo. Después de una pista, agregó que el modelo era uno por rueda, lo que permitió obtener constantes distintas para cada una dentro de rangos definidos.",
     "bien": "Llegó al argumento de fondo. Las ruedas no son idénticas y PSO permite sintonizar cada una con su propio modelo.",
     "falto": "Partir directo con ese argumento y no necesitar pista. Las primeras respuestas decían qué hizo PSO, pero no por qué se eligió.",
     "sugerida": "Elegí PSO porque busca las ganancias que minimizan un criterio de error sobre un modelo de primer orden con retardo identificado para cada rueda. Mis ruedas no son idénticas, y una tabla fija como la de Ziegler y Nichols no resuelve eso.",
     "respaldo": "Algoritmo 4.3 y Figura A4.1 de la tesis.",
     "nota": 5.0
    }
   ]
  },
  {
   "id": "b15",
   "n": 15,
   "tema": 3,
   "area": "control",
   "corto": "El PSO como lo más original",
   "titulo": "Si el PSO no ahorró tiempo demostrado, ¿con qué criterio la lámina 12 lo presenta como lo más original?",
   "como": "",
   "quien": "Profesor informante, repregunta en la ronda 4. Omitida.",
   "respuesta": "Lo propio no es el PSO por sí solo, sino el procedimiento completo. Identifiqué un modelo por rueda, obtuve con PSO una semilla para las tres ganancias y la ajusté en el robot, documentando por qué el modelo falla, que es por la zona muerta del driver y la cuantización de los encoders. La lámina lo dice así, PSO como semilla y ganancias finales ajustadas en el robot, y la tesis lo describe como una semilla de búsqueda y no como un ajuste validado por sí solo.",
   "repreguntan": "",
   "donde": "Justificación, página 2. Sec. 2.1, página 16. Sec. 5.2, página 68. Lámina 12.",
   "costo": "",
   "extras": [],
   "notas": []
  },
  {
   "id": "b16",
   "n": 16,
   "tema": 3,
   "area": "control",
   "corto": "Resolución de 0,01 m/s",
   "titulo": "¿Cómo informa un error de 0,002 m/s si la resolución de la medición es 0,01 m/s? ¿Qué sobreimpulso podría quedar oculto?",
   "como": "",
   "quien": "Profesor informante en la ronda 3. Omitida dos veces, nota 1,0.",
   "respuesta": "El 0,128 m/s de la rueda izquierda es el promedio de las muestras tomadas desde los 7 segundos. Cada muestra viene en pasos de 0,01 m/s, pero al promediar valores que oscilan entre dos pasos el resultado queda entre ellos. Es un promedio, no una medición más fina. Por lo mismo, no puedo ver un sobreimpulso menor a un paso, que equivale a cerca del 8 % de la referencia. Por eso digo sin sobreimpulso apreciable dentro de la resolución de medida, y no informo tiempo de establecimiento al 2 %.",
   "repreguntan": "Si le preguntan de dónde sale esa resolución, diga que sale del formato con que el firmware imprime la velocidad al responder el comando j, que usa dos decimales. Un tick por ciclo equivale a unos 0,003 m/s, así que el encoder es más fino que el dato registrado. Si le preguntan por los sobreimpulsos de 10,7 a 15,6 %, aclare que vienen de una simulación ilustrativa sobre el modelo FOPDT y no de la captura real.",
   "donde": "Sec. 5.2 y Tabla 5.3, páginas 67 y 68. Anexo 4.11, página 116. Tabla A4.2, comando j, página 109. Factor de conversión en la Nomenclatura, Anexo 10. En el código, el comando j en ROSArduinoBridge.ino.",
   "costo": "",
   "extras": [],
   "notas": [
    {
     "r": 3,
     "p": "informante",
     "v": 1.0,
     "om": true
    }
   ]
  },
  {
   "id": "b17",
   "n": 17,
   "tema": 3,
   "area": "control",
   "corto": "Control evaluado solo a 0,13 m/s",
   "titulo": "Usted evaluó el control solo a 0,13 m/s. ¿Por qué ese punto y qué espera a velocidades más bajas, por ejemplo en los giros?",
   "como": "",
   "quien": "Profesor guía en la ronda 4. Omitida, nota 1,0. También estaba preparada en la ronda 1.",
   "respuesta": "Elegí 0,13 m/s porque [su razón real]. Coincide con el límite lineal del controlador diferencial y con la velocidad de la prueba de 2 metros. Es un solo punto de operación y por eso el OE2 es parcial. A velocidades bajas espero un seguimiento peor. A 0,13 m/s cada rueda cuenta unos 41 ticks por ciclo de control. En un giro sobre su eje a 0,35 rad/s, cada rueda va a unos 0,033 m/s, cerca de 10 ticks por ciclo. Ahí la banda muerta de 1 y 2 ticks pesa mucho más, y el término integral de la rueda izquierda casi no actúa, porque solo crece con errores de al menos 14 ticks. No lo medí. Extender la evaluación a otras referencias es el trabajo futuro 6.",
   "repreguntan": "",
   "donde": "Tabla 4.3, página 44. Sec. 5.2, página 68. Anexo 4.4, página 110. Nomenclatura, Anexo 10. Trabajo futuro 6, página 81.",
   "costo": "",
   "extras": [
    {
     "t": "Términos",
     "x": "Un tick es cada pulso del encoder y un ciclo de control dura unos 33 ms."
    },
    {
     "t": "De dónde salen las cifras",
     "x": "La velocidad de rueda en el giro sale de multiplicar 0,35 por la mitad de 0,188 m. Los ticks salen de multiplicar esa velocidad por el factor de 313,56 de la Nomenclatura. Con el mismo factor, 0,13 m/s da los 41 ticks que menciona la Sec. 5.2."
    }
   ],
   "notas": [
    {
     "r": 4,
     "p": "guia",
     "v": 1.0,
     "om": true
    }
   ],
   "figuras": [
    {
     "src": "img/truncamiento.png",
     "cap": "Salida acumulada en diez ciclos con un error fijo y las ganancias de la rueda derecha. El error se dejó fijo solo para ilustrar."
    }
   ],
   "frases": [
    "Las ganancias se aplican con decimales, pero los resultados intermedios se guardan como enteros y se truncan hacia cero. Eso crea una pequeña zona sin corrección y anula el Ki de la rueda derecha. Está documentado en el Anexo 4.4, y pasar esos estados a punto flotante queda como trabajo futuro."
   ]
  },
  {
   "id": "b18",
   "n": 18,
   "tema": 3,
   "area": "control",
   "corto": "Camino de una orden hasta el motor",
   "titulo": "Explíquenos cómo llega una orden de velocidad desde Nav2 hasta el motor.",
   "como": "",
   "quien": "Profesor guía en la ronda 4. Omitida, nota 1,0.",
   "respuesta": "Nav2 publica una velocidad lineal y una angular. El controlador local DWB puede pedir hasta 0,15 m/s. La orden pasa por twist_mux, que da prioridad al mando manual, y llega al controlador diferencial en la Raspberry. Ese controlador la limita a 0,13 m/s y 0,35 rad/s y, con el modelo cinemático, calcula la velocidad de cada rueda. La interfaz DiffDriveArduino la convierte a ticks por ciclo, la trunca a entero y la envía al Arduino con el comando m, en un ciclo de 30 Hz. En el Arduino, cada 33 ms el controlador compara esa referencia con los ticks que contaron las interrupciones del encoder, calcula el PWM, lo limita a 255 y lo aplica al driver L298N. Si pasan 2 segundos sin comandos, detiene los motores. De vuelta, la Raspberry pide los conteos con el comando e y con ellos calcula la odometría.",
   "repreguntan": "",
   "donde": "Sec. 4.3.3 a 4.3.5, páginas 43 a 46. Alg. 4.1, página 45, y Alg. 4.2, página 51. Ec. 3.5, página 25. Anexo 3.5, página 103. Tabla A3.5, página 105. Tabla A4.2, página 109. Tabla A5.1, página 117. En el código, ros2_control.xacro, diff_controller.h y ROSArduinoBridge.ino.",
   "costo": "",
   "extras": [],
   "notas": [
    {
     "r": 4,
     "p": "guia",
     "v": 1.0,
     "om": true
    }
   ]
  },
  {
   "id": "b19",
   "n": 19,
   "tema": 4,
   "area": "ensayos",
   "corto": "7,18 % y 3,63 % en la recta",
   "titulo": "¿Qué diferencia hay entre el 7,18 % y el 3,63 %?",
   "como": "",
   "quien": "No se preguntó sola, pero apareció en la ronda 1 y la lámina 28 existe para ella.",
   "respuesta": "Las dos cifras son del robot real y de la misma recta. Le ordené avanzar 2 metros a 0,13 m/s durante 15,4 segundos. Los encoders estimaron 1,924 metros y la cinta midió 1,856 metros, en promedio de cinco repeticiones. El 7,18 % es el error de seguimiento. Compara la cinta con lo ordenado y dice que el robot avanzó menos de lo pedido. Una parte de eso ya la registran los encoders, que marcan 3,8 % menos que lo nominal, y es compatible con el tiempo que tardan las ruedas en acelerar, porque la referencia se define por tiempo y no por posición. El 3,63 % es el error odométrico. Compara los encoders con la cinta y dice que el robot cree haber avanzado más de lo real. Su baja dispersión indica un sesgo sistemático, compatible con un error de escala en el radio de rueda o con deslizamiento, pero esas causas no las aislé.",
   "repreguntan": "",
   "donde": "Sec. 5.1 y Tabla 5.1, páginas 62 a 64. Tabla A6.2, página 122. Lámina 28.",
   "costo": "",
   "extras": [],
   "notas": [
    {
     "r": 5,
     "p": "informante",
     "v": 5.0
    },
    {
     "r": 5,
     "p": "informante",
     "v": 5.5
    }
   ],
   "ensayo": [
    {
     "n": 1,
     "p": "informante",
     "tit": "La cinta métrica como referencia",
     "pregunta": "La odometría es lo único validado con números, con un error medio de 3,63 por ciento en la recta de dos metros. Esa cifra compara los encoders contra la cinta métrica. ¿Cómo sabe que la cinta es más confiable que los encoders y no al revés?",
     "dijo": "Dijo que la cinta métrica es la verdad absoluta y que dejó andar el robot una distancia determinada.",
     "bien": "Tiene claro que necesita una referencia externa, independiente de los encoders.",
     "falto": "Reconocer que la medición con cinta también tiene su propia incertidumbre. Decir \"verdad absoluta\" frente a un informante abre la puerta a que se la discutan.",
     "sugerida": "La cinta es una referencia externa e independiente de los encoders. Tiene su propia incertidumbre, pero la considero pequeña frente al sesgo que medí.",
     "respaldo": "Sección 5.1 de la tesis y lámina de respaldo con los errores de 7,18 y 3,63 por ciento.",
     "nota": 5.0
    },
    {
     "n": 2,
     "p": "informante",
     "tit": "Cómo se tomó la medición",
     "pregunta": "¿Cuantificó la incertidumbre de la medición con cinta, por ejemplo el punto de referencia del chasis o el momento exacto en que el robot se detiene, o la asumió despreciable?",
     "dijo": "Explicó que tomó como referencia la posición de las ruedas y marcó un punto en la parte final del robot para medir desde el punto A hasta el punto B. Agregó que comandó una velocidad constante durante un tiempo calculado para recorrer dos metros, y reconoció incertidumbres físicas como el desgaste de las ruedas, la tracción y la fricción en superficies ásperas.",
     "bien": "El punto de referencia marcado en el chasis acota el error de medición. Reconocer causas físicas del error muestra criterio.",
     "falto": "Cuantificar esa incertidumbre. Además, en la repregunta apareció un dato que conviene tener muy claro. Se comandaron dos metros, la cinta midió 1,856 metros y los encoders estimaron 1,924 metros. O sea, el robot avanzó menos de lo ordenado y los encoders creyeron que avanzó más de lo que realmente avanzó.",
     "sugerida": "Marqué un punto de referencia en el chasis y medí desde el inicio hasta ese punto, lo que acota el error de medición. No cuantifiqué esa incertidumbre por separado.",
     "respaldo": "Sección 5.1 y Anexo 6 de la tesis.",
     "nota": 5.5
    }
   ]
  },
  {
   "id": "b20",
   "n": 20,
   "tema": 4,
   "area": "ensayos",
   "corto": "Protocolo de giro",
   "titulo": "En la prueba de giro su script ordena 0,4 rad/s, pero el controlador limita a 0,35. ¿Por qué diseñó así el ensayo y cómo midió físicamente el ángulo?",
   "como": "",
   "quien": "Profesor informante en la ronda 4. Omitida, nota 1,0. También estaba preparada en la ronda 1.",
   "respuesta": "Fue un error de diseño del ensayo. El script pide 0,4 rad/s durante el tiempo que tomaría una vuelta a esa velocidad, pero el controlador limita a 0,35, así que con un límite ideal el robot llegaría a 315 grados. Por eso la tesis no lo llama error de odometría sino desviación respecto de 360 grados nominales. Todos los giros superaron los 315 grados y la causa no la determiné. Los rosbag de cada prueba tienen la odometría y permiten revisar la velocidad angular que realmente se aplicó sin repetir el ensayo. El ángulo físico lo medí [método real]. Lo corregiría con un giro controlado a un ángulo fijo, que es el trabajo futuro 8.",
   "repreguntan": "",
   "donde": "Sec. 5.1 y Tabla 5.2, páginas 64 y 65. Anexo 6, página 121. Tablas A6.3 y A6.4, página 123. Trabajo futuro 8, página 82. En el código, prueba_giro.py y angulos_reales.txt. Lámina 32.",
   "costo": "",
   "extras": [
    {
     "t": "Lo que tiene que preparar",
     "x": "La tesis no describe cómo midió el ángulo físico. El script pide alinear el robot con una marca de inicio, y los valores registrados, 355,7, 340, 380, 370 y 356 grados, sugieren lecturas redondeadas a la decena en tres casos. Prepare una frase con el método real. Además, el script de hardware calcula el giro de la odometría, pero la Tabla A6.4 no lo informa. Con ese dato se podría calcular el error odométrico angular."
    }
   ],
   "notas": [
    {
     "r": 4,
     "p": "informante",
     "v": 1.0,
     "om": true
    }
   ]
  },
  {
   "id": "b21",
   "n": 21,
   "tema": 5,
   "area": "ensayos",
   "corto": "Iteración 2, qué pasó",
   "titulo": "En la iteración 2 el robot no se movió, pero la odometría sumó casi cuatro metros. ¿Qué cree que pasó?",
   "como": "",
   "quien": "Profesor guía en las rondas 1 y 2, notas 3,0 y 4,3. Profesor informante en la ronda 3, nota 4,0.",
   "respuesta": "La causa no la determiné, y así lo informa la tesis. La corrida duró 5,09 minutos, el explorador envió 14 metas y la odometría sumó 3,851 metros, pero el robot no se movió de su posición inicial. Eso es compatible con ruedas que giran sin avanzar, pero no lo comprobé. Los encoders miden el giro de las ruedas y no el avance real, así que por sí solos no distinguen ese caso. El láser sí daba una señal, porque si el robot no se mueve el mapa no crece, pero el ensayo no usa esa señal para detenerse. El explorador solo se detiene cuando no quedan fronteras, y si el robot no avanza las fronteras no se agotan. En esa corrida vació su lista de metas descartadas 13 veces y siguió enviando metas. La imagen del mapa tampoco quedó guardada, así que no pude calcular cobertura ni área. Por eso excluí la corrida y la informo como falla. En las otras cinco el mapa creció, y eso respalda su movimiento sin depender de los encoders.",
   "repreguntan": "",
   "donde": "Anexo 7, páginas 123 y 124. Sec. 5.4, página 71. Conclusión del OE4, página 79. Lámina 35 y su guion.",
   "costo": "En la ronda 1 la atribuyó a la latencia de internet y al reinicio de ROS 2. Una red lenta puede retrasar órdenes, pero no puede sumar conteos de encoder, porque la odometría se calcula en la Raspberry. En la ronda 2 dijo que sin IMU no podía detectarlo y luego que el láser sí lo permitía, lo que se contradice. En la ronda 3 dijo que las ruedas sumaron 3,851 metros. Lo que sumó esa distancia fue la odometría.",
   "extras": [],
   "notas": [
    {
     "r": 1,
     "p": "guia",
     "v": 3.0
    },
    {
     "r": 2,
     "p": "guia",
     "v": 4.3
    },
    {
     "r": 3,
     "p": "informante",
     "v": 4.0
    }
   ]
  },
  {
   "id": "b22",
   "n": 22,
   "tema": 5,
   "area": "ensayos",
   "corto": "Iteración 2, diagnóstico y datos",
   "titulo": "¿Qué hizo en ese momento para diagnosticarlo y qué datos conserva de esa corrida?",
   "como": "",
   "quien": "Repreguntas de las rondas 2 y 3.",
   "respuesta": "Constaté que el robot no se movía, pero no seguí un procedimiento de diagnóstico, y así lo informa la tesis. [Si hizo algo concreto, dígalo en una frase]. Conservo el rosbag de esa corrida, con la odometría y el flujo de estado de las 14 metas, porque la distancia de 3,851 metros se calculó sobre ese rosbag. Lo que no conservo es la imagen del mapa. Con el rosbag se puede revisar la falla sin repetir el ensayo.",
   "repreguntan": "",
   "donde": "Anexo 7, páginas 123 y 124. Sec. 5.4. Lámina 35.",
   "costo": "En la ronda 3 dijo que dejó correr la prueba para tener más datos y después que no se generó el mapa. Las dos frases juntas se contradicen. Mencione el rosbag.",
   "extras": [],
   "notas": []
  },
  {
   "id": "b23",
   "n": 23,
   "tema": 5,
   "area": "ensayos",
   "corto": "Verificador de progreso de Nav2",
   "titulo": "Nav2 tiene un verificador de progreso que exige 5 cm cada 6 segundos. ¿Por qué nada en el sistema detectó que el robot estaba detenido?",
   "como": "",
   "quien": "Profesor informante en la ronda 4. Nota 2,5.",
   "respuesta": "El verificador de progreso compara la posición que Nav2 estima para el robot. Esa posición sale de la cadena de marcos, donde slam_toolbox publica la corrección del mapa a la odometría y el controlador diferencial publica la odometría de encoders. No analicé si el verificador actuó en esa corrida. Las 13 metas abortadas de la iteración 2 no las clasifiqué, así que no sé si alguna terminó por el verificador o por reemplazo. Lo puedo revisar en el rosbag, comparando la pose en el mapa con la odometría y el orden de los estados de cada meta.",
   "repreguntan": "",
   "donde": "Tabla A5.1, página 117. Sec. 4.3.2, página 42. Anexo 7, página 123. Nota del guion en la lámina 35.",
   "costo": "",
   "extras": [
    {
     "t": "Corrección",
     "x": "En la ronda 4 la respuesta sugerida ofrecía una hipótesis concreta, que la odometría indicaba movimiento y por eso el verificador no veía el atasco. Es posible, pero no está verificada. También es posible que el verificador sí actuara y que el explorador descartara esas metas y siguiera, lo que coincidiría con los 13 avisos de lista agotada. Como la tesis no lo analiza, el guion de la lámina 35 recomienda no afirmar por qué no actuó. Si menciona una hipótesis, diga que es una hipótesis."
    },
    {
     "t": "Dato útil",
     "x": "En esa corrida hubo 14 metas en 5,09 minutos, cerca de 22 segundos por meta en promedio. Es más que los 6 segundos del verificador, así que el verificador tuvo tiempo de actuar. Si lo hizo o no, no está registrado."
    }
   ],
   "notas": [
    {
     "r": 4,
     "p": "informante",
     "v": 2.5
    }
   ]
  },
  {
   "id": "b24",
   "n": 24,
   "tema": 6,
   "area": "marco",
   "corto": "Cierre de lazo",
   "titulo": "¿Qué es un cierre de lazo y por qué en su tesis figura como no determinado?",
   "como": "",
   "quien": "Profesor informante en la ronda 3. Omitida, nota 1,0.",
   "respuesta": "En el SLAM por grafos, cada nodo es una pose del robot y cada arista es una restricción entre dos poses, que sale de la odometría o de alinear dos barridos del láser. Cuando el robot vuelve a ver una zona que ya conocía, se agrega una restricción de cierre de lazo. Al optimizar el grafo, el error acumulado se reparte a lo largo de toda la trayectoria y el mapa se corrige. En slam_toolbox el cierre de lazo estaba activado, pero mi análisis posterior no detecta automáticamente si ocurrió, y ese dato se ingresaba a mano. Por eso figura como no determinado, y la consistencia del mapa la evalué solo a la vista.",
   "repreguntan": "Si le preguntan por qué no lo midió, diga que el repositorio tiene scripts preparados para cierre de lazo, pero sus carpetas no tienen registros de salida, así que no aportan mediciones a la tesis.",
   "donde": "Sec. 3.8 y Fig. 3.4, página 30. Sec. 5.3, página 69. Tabla A5.3, página 119, donde el cierre de lazo figura activado. Anexo 8.1, página 126. Anexo 8.3, página 127.",
   "costo": "",
   "extras": [],
   "notas": [
    {
     "r": 3,
     "p": "informante",
     "v": 1.0,
     "om": true
    }
   ]
  },
  {
   "id": "b25",
   "n": 25,
   "tema": 6,
   "area": "marco",
   "corto": "Por qué slam_toolbox",
   "titulo": "¿Por qué eligió slam_toolbox y no otro algoritmo de SLAM?",
   "como": "",
   "quien": "Apareció dentro de las preguntas de SLAM en las rondas 2 y 3.",
   "respuesta": "Lo elegí por su integración nativa con ROS 2, su enfoque de grafo de poses y porque permite guardar y cargar mapas. Frente a las otras alternativas, GMapping no detecta cierres de lazo y su paso a ROS 2 es más débil, Hector SLAM exige un láser de alta tasa de barrido para contener la deriva, y Cartographer tiene una configuración compleja y en la comparación de Trejos fue el de mayor uso medio de CPU.",
   "repreguntan": "",
   "donde": "Tabla 1.2, página 8. Sec. 2.1, página 16. Sec. 4.5.1, página 54. Láminas 5 y 12.",
   "costo": "",
   "extras": [],
   "notas": []
  },
  {
   "id": "b26",
   "n": 26,
   "tema": 6,
   "area": "marco",
   "corto": "Trejos y el argumento de CPU",
   "titulo": "¿Trejos evaluó slam_toolbox? ¿Qué peso tiene el argumento de CPU si usted no lo midió?",
   "como": "",
   "quien": "Profesor informante en las rondas 2 y 3. Notas 2,5 y 1,0.",
   "respuesta": "No. Trejos comparó Cartographer, GMapping, Hector, Karto y RTAB Map, en simulación con Gazebo y un TurtleBot 3 Burger simulado. En su clasificación global, Karto resultó la mejor opción, porque equilibra uso de recursos y desempeño. slam_toolbox se construye sobre Open Karto, según Macenski y Jambrecic. Aun así, el argumento de CPU pesa poco en mi caso. slam_toolbox corre en el computador, que tiene un procesador Intel de clase portátil, no en la Raspberry, y no medí su consumo. La fuente dice que funciona bien con procesadores Intel móviles como los que llevan muchos robots, que es justamente el tipo que usé. Por eso lo elegí sobre todo por su integración, su grafo de poses y el manejo de mapas.",
   "repreguntan": "",
   "donde": "Tabla 1.2, página 8. Sec. 2.1, página 16. Sec. 4.5.1, página 54, que ya dice que el nodo corre en el computador y que la CPU no se midió. Tabla A3.2, página 101. Anexo 8.3, página 127. Referencia REF_Trejos_2022, en su resumen, la sección de experimentos y las conclusiones. Referencia REF_Macenski_Jambrecic_2021, en los párrafos sobre Open Karto y sobre procesadores Intel.",
   "costo": "En la ronda 2 dijo que la prueba de que funcionó sin medir la CPU eran las iteraciones y las pruebas de recta y giro. Las pruebas de recta y giro no usan SLAM, y que el sistema funcione no demuestra un consumo compatible con un embebido. En la ronda 3 la omitió.",
   "extras": [],
   "notas": [
    {
     "r": 2,
     "p": "informante",
     "v": 2.5
    },
    {
     "r": 3,
     "p": "informante",
     "v": 1.0,
     "om": true
    }
   ]
  },
  {
   "id": "n1",
   "n": null,
   "tema": 6,
   "area": "marco",
   "corto": "Sesgo de odometría y mapa",
   "titulo": "Si ese sesgo de la odometría se acumula durante una exploración completa, ¿qué efecto tiene sobre el mapa que construye SLAM Toolbox?",
   "como": "",
   "quien": "Profesor informante en la ronda 5. Nota 6,0.",
   "respuesta": "El 3,63 por ciento es una deriva local. SLAM Toolbox la corrige con el láser y publica esa corrección como la transformada de map a odom, por eso no se acumula en el mapa.",
   "repreguntan": "",
   "donde": "Capítulo de SLAM y Nav2 de la tesis y la norma REP 105 sobre los marcos map, odom y base_link.",
   "costo": "",
   "extras": [],
   "notas": [
    {
     "r": 5,
     "p": "informante",
     "v": 6.0
    }
   ],
   "ensayo": [
    {
     "n": 3,
     "p": "informante",
     "tit": "El sesgo de la odometría y el mapa",
     "pregunta": "Si ese sesgo de la odometría se acumula durante una exploración completa, ¿qué efecto tiene sobre el mapa que construye SLAM Toolbox?",
     "dijo": "Explicó que SLAM Toolbox va corrigiendo la odometría mientras el robot avanza, y que la odometría no fue perfecta, pero tampoco tan imperfecta como para generar errores grandes.",
     "bien": "Es el argumento correcto. El láser corrige la deriva y por eso el sesgo no llega al mapa final.",
     "falto": "Nombrar el mecanismo. SLAM Toolbox publica esa corrección como la transformada entre el marco map y el marco odom. También conviene no volver a explicar la exploración por fronteras cuando no es lo que se pregunta.",
     "sugerida": "El 3,63 por ciento es una deriva local. SLAM Toolbox la corrige con el láser y publica esa corrección como la transformada de map a odom, por eso no se acumula en el mapa.",
     "respaldo": "Capítulo de SLAM y Nav2 de la tesis y la norma REP 105 sobre los marcos map, odom y base_link.",
     "nota": 6.0
    }
   ]
  },
  {
   "id": "b27",
   "n": 27,
   "tema": 7,
   "area": "marco",
   "corto": "A estrella frente a Dijkstra",
   "titulo": "¿Cómo decide A estrella qué ruta tomar y qué cambia respecto de Dijkstra?",
   "como": "",
   "quien": "Profesor informante en la ronda 2, omitida. Profesor guía en la ronda 4, nota 5,0.",
   "respuesta": "A estrella recorre la rejilla del mapa de costos desde la posición del robot. A cada celda candidata le asigna la suma de dos cosas. Lo que ya cuesta llegar desde el origen hasta esa celda, y una estimación de lo que falta para llegar a la meta. Siempre avanza primero por la celda con la menor suma. Esa estimación orienta la búsqueda hacia la meta y evita revisar celdas en todas direcciones, como haría Dijkstra. En Nav2 lo activo con la opción use_astar del planificador NavFn. En la tesis no uso la optimalidad de la ruta como criterio, porque Nav2 agrega costos propios del mapa cuyo escalamiento no reconstruí. Lo que valido es que la ruta pueda ser seguida por el controlador local DWB.",
   "repreguntan": "",
   "donde": "Sec. 3.10 y Ec. 3.15, página 32. Tabla 4.5, página 56, con A estrella habilitado, espacio desconocido permitido y tolerancia de 0,5 m. Tabla A5.1, página 117. Lámina 39.",
   "costo": "",
   "extras": [
    {
     "t": "Si piden la fórmula",
     "x": "Es f igual a g más h, la Ec. 3.15. La g es el costo acumulado desde el origen y la h es la estimación del costo que falta."
    }
   ],
   "notas": [
    {
     "r": 2,
     "p": "informante",
     "v": 1.0,
     "om": true
    },
    {
     "r": 4,
     "p": "guia",
     "v": 5.0
    }
   ]
  },
  {
   "id": "b28",
   "n": 28,
   "tema": 7,
   "area": "marco",
   "corto": "Heurística admisible",
   "titulo": "¿Qué condición tiene que cumplir esa estimación para que A estrella garantice la ruta de menor costo?",
   "como": "",
   "quien": "Profesor guía, repregunta en la ronda 4. Omitida.",
   "respuesta": "Tiene que ser admisible, es decir, nunca debe estimar más de lo que realmente falta. Con una estimación admisible, A estrella encuentra la ruta de menor costo. En mi tesis no uso ni la admisibilidad ni la optimalidad como criterio de validación, porque Nav2 agrega costos propios del mapa cuyo escalamiento no reconstruí. Lo que valido es que DWB pueda seguir la ruta.",
   "repreguntan": "",
   "donde": "Sec. 3.10, página 32. Lámina 39.",
   "costo": "",
   "extras": [
    {
     "t": "Nota",
     "x": "La Sec. 3.10 menciona la admisibilidad, pero no la define. Conviene agregar esa definición en una línea."
    }
   ],
   "notas": []
  },
  {
   "id": "b29",
   "n": 29,
   "tema": 7,
   "area": "navexp",
   "corto": "Radio de inflación y esquina del robot",
   "titulo": "El radio de inflación es 0,15 m y la esquina del robot está a 0,24 m del centro. ¿Cómo asegura que la ruta no pase por donde el robot no cabe?",
   "como": "",
   "quien": "No se hizo como pregunta propia, pero estaba preparada en la ronda 1 y apareció en la evaluación de la oficina en las rondas 2 y 4.",
   "respuesta": "No lo garantizo, y la tesis lo declara. La esquina delantera del robot está a unos 0,24 metros del centro y el radio de inflación es 0,15 metros. Entre esas dos distancias el costo es nulo, aunque la esquina del robot pueda llegar ahí. El planificador trata al robot como un punto y el crítico de obstáculos de DWB solo revisa la celda bajo el centro, así que ninguno revisa el contorno completo. Su efecto en las corridas no se cuantificó. Evaluar la navegación en pasos estrechos con una configuración acorde es el trabajo futuro 4.",
   "repreguntan": "Si le preguntan por qué usó 0,15 m cuando Nav2 trae 0,55 m por defecto, dé su razón real. La tesis solo dice que es un valor menor que el de simulación, aplicado en un recinto reducido, y que su efecto no se evaluó por separado.",
   "donde": "Sec. 4.5.4, página 56. Sec. 5.4, página 73. Anexo 5.2, página 118. Referencia REF_Nav2_Inflacion, con el valor por defecto de 0,55 m. Trabajo futuro 4, página 81.",
   "costo": "",
   "extras": [
    {
     "t": "Término",
     "x": "El radio de inflación es la zona de seguridad que el mapa de costos agrega alrededor de cada obstáculo para que el robot no pase demasiado cerca."
    }
   ],
   "notas": []
  },
  {
   "id": "b30",
   "n": 30,
   "tema": 8,
   "area": "navexp",
   "corto": "Lógica del explorador y lista negra",
   "titulo": "Explíqueme la lógica de su explorador. ¿Cuándo manda una meta nueva y por qué aparece abortada aunque el robot no haya fallado?",
   "como": "",
   "quien": "Profesor informante en la ronda 2. Era una pregunta sobre el código. Omitida, nota 1,0.",
   "respuesta": "El explorador revisa el mapa de costos global cada 3,3 segundos, porque su frecuencia está configurada en 0,3 hercios. Busca las fronteras, las ordena con un puntaje que combina distancia y tamaño y toma la primera que no esté en la lista de metas descartadas. Si el punto elegido cambió un centímetro o más respecto de la meta anterior, manda una meta nueva a Nav2 sin cancelar la que está en curso. En la versión Foxy de Nav2, cuando llega una meta nueva mientras otra está activa, la anterior se cierra como abortada. Por eso el aborto registra reemplazos y no fallas. Hay un efecto extra. El explorador agrega a la lista de descartes toda meta abortada, incluso las que él mismo reemplazó, y cuando se queda sin candidatas vacía la lista y vuelve a intentar. La solución es cancelar la meta antes de enviar la siguiente, que es el trabajo futuro 5.",
   "repreguntan": "",
   "donde": "Sec. 4.5.6 y Alg. 4.4, páginas 58 y 59. Sec. 5.4, página 72. Tabla A5.4 y Anexo 5.6, página 120. Anexo 8.4, página 128, donde se indica cómo se verificó el comportamiento de Nav2. Lámina 41. En el código, explore.cpp y explore.yaml.",
   "costo": "",
   "extras": [],
   "notas": [
    {
     "r": 2,
     "p": "informante",
     "v": 1.0,
     "om": true
    },
    {
     "r": 5,
     "p": "informante",
     "v": 4.0
    }
   ],
   "ensayo": [
    {
     "n": 11,
     "p": "informante",
     "tit": "La lista negra del explorador",
     "pregunta": "Cuando el explorador no logra avanzar hacia una frontera, la agrega a una lista negra. ¿Qué problema resuelve esa lista y qué efecto secundario tuvo en sus resultados?",
     "dijo": "Dijo que la lista negra sirve para identificar lugares por donde el robot no debería volver a pasar. Ante la repregunta, explicó que el ciclo de 3,3 segundos crea muchas metas en espacios estrechos. Cuando se le planteó que fronteras válidas podían quedar descartadas, sostuvo que eso ayuda a identificar fronteras no válidas.",
     "bien": "Entiende el propósito de la lista negra.",
     "falto": "Presentarlo como limitación. Su tesis dice que el explorador anota toda meta abortada, también las que él mismo reemplazó, y que es un efecto de la integración entre explore_lite y Nav2 cuyo efecto sobre la duración no se cuantificó. Una frontera reemplazada no es una frontera inválida. La parte 5 de este documento lo explica en detalle.",
     "sugerida": "La lista negra evita que el robot insista en fronteras inalcanzables. Su limitación es que también tacha las metas que el propio explorador reemplaza, porque Nav2 las cierra como abortadas. No impidió terminar la exploración, pero no cuantifiqué cuánto alargó el recorrido.",
     "respaldo": "Sección 4.5.6, Algoritmo 4.4, sección 5.4 y trabajo futuro 5 de la tesis, y lámina 41 del guion.",
     "nota": 4.0
    }
   ],
   "figuras": [
    {
     "src": "img/lista-negra.png",
     "cap": "Arriba, cómo elige destino el explorador. Abajo, cómo un punto entra a la lista negra."
    }
   ],
   "frases": [
    "La lista negra evita que el robot insista en fronteras inalcanzables. Su limitación es que también tacha las metas que el propio explorador reemplaza, porque Nav2 las cierra como abortadas. No impidió terminar la exploración, pero no cuantifiqué cuánto alargó el recorrido. La mejora es cancelar la meta antes de enviar la siguiente, porque el código ya no anota las metas canceladas."
   ]
  },
  {
   "id": "b31",
   "n": 31,
   "tema": 8,
   "area": "navexp",
   "corto": "Por qué no corrigió el reemplazo de metas",
   "titulo": "Si el reemplazo de metas explica casi todos los abortos, ¿por qué no lo corrigió antes de los ensayos?",
   "como": "",
   "quien": "Profesor guía en la ronda 3. Nota 4,0.",
   "respuesta": "Lo detecté después de los ensayos, cuando reconstruí cada meta por su identificador, porque los contadores automáticos de la sesión contaban mensajes de estado y no metas. Corregirlo exige cancelar la meta en curso antes de enviar la siguiente, o conservar el registro de bt_navigator, y evaluar el efecto de la frecuencia del explorador, que es un parámetro de configuración. Es el trabajo futuro 5.",
   "repreguntan": "",
   "donde": "Limitaciones, registro de navegación e integración entre explorador y Nav2, páginas 80 y 81. Anexo 8.4, página 127. Trabajo futuro 5, página 81. Lámina 41. En el código, explore.cpp y explore.yaml.",
   "costo": "Dijo que no era de sus habilidades. Fue honesto, pero en una defensa conviene explicar cómo lo detectó y cómo se corrige.",
   "extras": [],
   "notas": [
    {
     "r": 3,
     "p": "guia",
     "v": 4.0
    }
   ]
  },
  {
   "id": "b32",
   "n": 32,
   "tema": 8,
   "area": "marco",
   "corto": "Yamauchi frente a su explorador",
   "titulo": "¿Qué criterio propone Yamauchi para elegir a qué frontera ir, y en qué se diferencia del criterio de su explorador?",
   "como": "",
   "quien": "Profesor guía en la ronda 2, omitida. Profesor informante en la ronda 4, nota 2,0 junto con la pregunta 33.",
   "respuesta": "Yamauchi propone que el robot vaya a la frontera accesible más cercana que todavía no haya visitado. Cuando llega, hace un barrido de 360 grados, actualiza el mapa y vuelve a buscar fronteras. Si no logra avanzar en cierto tiempo, marca esa frontera como inaccesible. Mi explorador toma la idea general, que son los bordes entre lo conocido y lo desconocido, y una lista de metas descartadas equivalente. Cambia en tres cosas. Elige con un puntaje que combina distancia y tamaño, vuelve a elegir cada 3,3 segundos sin esperar a llegar, y acepta fronteras mucho más pequeñas, porque Yamauchi exige un tamaño parecido al del robot. La segunda diferencia explica que 53 de los 54 abortos sean reemplazos hechos por el propio explorador.",
   "repreguntan": "",
   "donde": "Referencia REF_Yamauchi_1997, secciones 2.2 y 2.3. Tesis, Sec. 1.4.2, página 11, Sec. 3.11, página 33, Sec. 5.4, Tabla A5.4 y Anexo 5.6, página 120. Lámina 40.",
   "costo": "",
   "extras": [
    {
     "t": "Corrección",
     "x": "En la ronda 2 la respuesta sugerida decía mi explorador usa la misma idea de frontera, y el guion de la lámina 40 también lo dice. En la ronda 4 la comisión mostró que no es exacto. Yamauchi llama celda de frontera a una celda libre junto a una desconocida y agrupa esas celdas en regiones de tamaño parecido al del robot. Su explorador marca la celda desconocida junto a una libre y acepta una sola celda. Diga la misma idea general, con otra definición de celda y otro tamaño mínimo."
    }
   ],
   "notas": [
    {
     "r": 2,
     "p": "guia",
     "v": 1.0,
     "om": true
    },
    {
     "r": 4,
     "p": "informante",
     "v": 2.0
    }
   ]
  },
  {
   "id": "b33",
   "n": 33,
   "tema": 8,
   "area": "marco",
   "corto": "Frontera mínima de 5 cm",
   "titulo": "Usted configuró un tamaño mínimo de frontera de 5 cm, una sola celda. ¿Por qué, y qué consecuencia tiene sobre las metas?",
   "como": "",
   "quien": "Profesor informante, repregunta en la ronda 4. Omitida.",
   "respuesta": "Bajé el tamaño mínimo a 0,05 metros, mientras el archivo de ejemplo del paquete trae 0,75 metros, porque [su razón real]. Con celdas de 0,05 metros eso admite fronteras de una sola celda. La consecuencia es que el explorador puede elegir fronteras muy pequeñas, que pueden venir del ruido del láser o de rincones donde el robot no cabe. Eso puede alargar la exploración y llenar la lista de descartes. No lo cuantifiqué. Yamauchi usa un tamaño cercano al del robot justamente para descartar esas regiones.",
   "repreguntan": "",
   "donde": "Tabla A5.4 y Anexo 5.6, página 120. Referencia REF_Yamauchi_1997, sección 2.2. En el código, explore.yaml con 0,05 m y m-explore-ros2/explore/config/params.yaml con 0,75 m.",
   "costo": "",
   "extras": [
    {
     "t": "Dato adicional",
     "x": "El Anexo 5.6 explica que una frontera de una sola celda queda con costo infinito, pero puede seguir como candidata si no hay otra seleccionable."
    }
   ],
   "notas": []
  },
  {
   "id": "b34",
   "n": 34,
   "tema": 9,
   "area": "decisiones",
   "corto": "Foxy y Gazebo Classic sin soporte",
   "titulo": "Descartó ROS 1 porque su soporte terminó, pero usa ROS 2 Foxy y Gazebo Classic, que también están sin soporte. ¿No es contradictorio?",
   "como": "",
   "quien": "Profesor informante en la ronda 1. Nota 3,0.",
   "respuesta": "Es una contradicción aparente y la reconozco. Elegí ROS 2 por su arquitectura distribuida, sin maestro central, y por el ecosistema de Nav2, no por el soporte. La tesis dice que el fin de soporte de ROS 1 no se usó como criterio, justamente porque Foxy también está fuera de soporte. Foxy, Ubuntu 20.04 y Gazebo Classic los congelé al inicio para asegurar que toda la cadena de paquetes funcionara con mi hardware. Migrar a mitad del proyecto significaba rehacer y volver a probar todo. El fin de vida lo declaro como limitación y la migración es el trabajo futuro 3.",
   "repreguntan": "Si le preguntan por qué Gazebo Classic y no el Gazebo actual, diga que los complementos de simulación y de ros2_control del paquete base que adaptó están disponibles para Foxy sobre Ubuntu 20.04, y esa es la base del sistema.",
   "donde": "Alcances y limitaciones, página 3. Sec. 1.5, página 12. Sec. 2.1, páginas 15 y 16. Limitaciones, página 80. Trabajo futuro 3, página 81. Tabla A3.2, página 101. Lámina 36.",
   "costo": "Dijo que las versiones nuevas no permiten conectarse con RViz2 ni usar A estrella. Eso contradice la Sec. 1.4.1, que cita a Nav2 actual con los planificadores NavFn y Smac.",
   "extras": [],
   "notas": [
    {
     "r": 1,
     "p": "informante",
     "v": 3.0
    }
   ]
  },
  {
   "id": "b35",
   "n": 35,
   "tema": 9,
   "area": "decisiones",
   "corto": "¿Explora sin el computador?",
   "titulo": "¿Su robot podría explorar solo, sin el computador?",
   "como": "",
   "quien": "Profesor externo, repregunta de la ronda 1.",
   "respuesta": "No, el robot solo no explora. Es una arquitectura distribuida. En el robot va lo rápido y crítico. El Arduino lee los encoders y controla la velocidad de cada rueda, y si deja de recibir comandos detiene los motores. La Raspberry corre la interfaz con ros2_control, calcula la odometría y lee el láser. En el computador va lo que exige más cálculo, que es el mapeo con slam_toolbox, la navegación con Nav2 y el explorador. ROS 2 no tiene un maestro central, y los dos equipos se comunican por una red Wi-Fi dedicada.",
   "repreguntan": "",
   "donde": "Sec. 1.1, página 6. Sec. 3.2, página 21. Capítulo 2 y Fig. 2.1, páginas 14 y 15. Anexo 3.1, página 99. Lámina 10.",
   "costo": "Habló de un sistema maestro y esclavo. Eso choca con la Sec. 3.2, donde usted explica que ROS 2 funciona sin maestro central.",
   "extras": [
    {
     "t": "Apoyo opcional",
     "x": "Si quiere mostrar que repartir el cálculo es habitual, Yamauchi también ejecutaba la exploración en una estación de trabajo fuera del robot, comunicada por radio. Está en la sección 3 de su artículo. Úselo solo si está seguro de citarlo bien."
    }
   ],
   "notas": []
  },
  {
   "id": "b36",
   "n": 36,
   "tema": 9,
   "area": "decisiones",
   "corto": "La red y los ensayos",
   "titulo": "¿Cómo es la red entre el robot y el computador, y pudo afectar los ensayos?",
   "como": "",
   "quien": "Profesor guía, repregunta de la ronda 1 sobre la iteración 2.",
   "respuesta": "Es una red Wi-Fi dedicada, armada con un router de viaje y con IP fijas. El tráfico entre el robot y el computador va por la red local de ese router. Aunque la red fallara, no podría explicar que los encoders sumen distancia, porque la odometría se calcula en la Raspberry a partir de sus propios conteos. Una red lenta puede retrasar órdenes, pero no genera giro de rueda.",
   "repreguntan": "",
   "donde": "Anexo 3.1, página 99. Tabla A1.1, página 95, donde aparece el enrutador de viaje. Lámina 10. Nota del guion en la lámina 35.",
   "costo": "Habló de un internet compartido con la casa para explicar la iteración 2. Separe los dos temas. La red se describe como dedicada, y la iteración 2 tiene causa no determinada.",
   "extras": [],
   "notas": []
  },
  {
   "id": "b37",
   "n": 37,
   "tema": 10,
   "area": "externo",
   "corto": "Explicación simple",
   "titulo": "Explíqueme, como a alguien sin formación técnica, qué hace su robot y dónde podría servir.",
   "como": "",
   "quien": "Profesor externo en las rondas 1, 2 y 4. Notas 4,5, 6,3 y parte del 6,0.",
   "respuesta": "Es un robot que entra a un espacio interior que no conoce, decide solo hacia dónde avanzar y va dibujando el plano del lugar hasta que no le queda nada nuevo por mirar. Es un prototipo, no un producto terminado, y el cálculo pesado lo hace un computador que se comunica con el robot por red. Sirve para docencia e investigación, y la misma idea la usan robots de inspección o de logística en interiores. Lo probé en un recinto pequeño, así que el paso siguiente es un espacio mayor.",
   "repreguntan": "",
   "donde": "Sec. 1.1, páginas 5 y 6. Respuesta corta del guion sobre qué hace el robot. Limitaciones, validez externa, página 80.",
   "costo": "En la ronda 1 dijo que es un robot de mapeo y localización, y dejó fuera lo central, que decide solo a dónde ir. Desde la ronda 2 esta respuesta está bien.",
   "extras": [],
   "notas": [
    {
     "r": 1,
     "p": "externo",
     "v": 4.5
    },
    {
     "r": 2,
     "p": "externo",
     "v": 6.3
    }
   ]
  },
  {
   "id": "b38",
   "n": 38,
   "tema": 10,
   "area": "externo",
   "corto": "Costo del robot",
   "titulo": "¿Cuánto costó el robot y ese monto incluye todo lo necesario para que funcione?",
   "como": "",
   "quien": "Profesor externo en las cuatro rondas. Notas 4,5, 4,0, 4,5 y 6,0.",
   "respuesta": "Los materiales montados en el robot costaron 444 643 pesos. El proyecto completo llega a 582 447 pesos, porque suma el router de viaje, los cables de red, el cargador, las baterías de repuesto y los accesorios de desarrollo. Ningún monto incluye el computador, que es necesario porque ahí corren slam_toolbox, Nav2 y el explorador. Por eso el bajo costo se refiere a lo que va en el robot. Frente al TurtleBot 3 Burger, el robot cuesta un 32 % menos y el proyecto completo un 11 % menos. Pero no digo que ofrezca lo mismo más barato, porque el Burger trae IMU y actuadores con controlador integrado. Además sus precios son de catálogo, sin envío ni impuestos.",
   "repreguntan": "",
   "donde": "Sec. 4.1, página 35. Tabla A1.1, páginas 94 y 95. Anexo 1.2 y Tabla A1.2, páginas 95 y 96. Tabla A3.2, página 101. Lámina 34.",
   "costo": "En la ronda 1 dio 580 mil pesos cuando la tesis aún no tenía la cifra, y dijo que era más barato que los demás sin respaldo. En la ronda 2 dijo tres veces más barato, que sus precios incluían envío y que el gasto extra era cautín, estaño e impresora 3D. Nada de eso está en la tesis. En la ronda 3 tardó en aclarar que el computador no está incluido. Diga siempre a qué corresponde cada cifra, 32 % el robot y 11 % el proyecto.",
   "extras": [
    {
     "t": "Si le piden el costo del computador",
     "x": "Ese costo no aparece en los archivos. La Tabla A3.2 solo registra sus características, un Intel Core i7 10610U con 32 GB de memoria. Diga que no lo cuantificó."
    }
   ],
   "notas": [
    {
     "r": 1,
     "p": "externo",
     "v": 4.5
    },
    {
     "r": 2,
     "p": "externo",
     "v": 4.0
    },
    {
     "r": 3,
     "p": "externo",
     "v": 4.5
    },
    {
     "r": 4,
     "p": "externo",
     "v": 6.0
    },
    {
     "r": 5,
     "p": "externo",
     "v": 4.0
    },
    {
     "r": 5,
     "p": "externo",
     "v": 6.0
    }
   ],
   "ensayo": [
    {
     "n": 5,
     "p": "externo",
     "tit": "Utilidad real y costo",
     "pregunta": "Explicado en simple, ¿para qué sirve en la vida real un robot como el suyo y cuánto costó armarlo?",
     "dijo": "Dijo que sirve para exploración y logística, por ejemplo para obtener el mapa de una zona. Sobre el costo dijo que el robot costó aproximadamente mil pesos, y luego que con las herramientas seguía cerca de mil pesos.",
     "bien": "La aplicación quedó clara.",
     "falto": "La cifra de mil pesos es imposible para un robot con Raspberry Pi 4, RPLidar A1 y Arduino, y no aparece en la tesis. Costó varios intentos corregirla. Un error así frente al profesor externo es de los que más se notan.",
     "sugerida": "\"Sirve para mapear interiores, por ejemplo en logística o inspección. Frente a una alternativa comercial, ahorra un 32 por ciento en el robot y un 11 por ciento en el proyecto completo.\" Lleve también memorizado el monto total en pesos que aparece en su capítulo de costos.",
     "respaldo": "Capítulo de costos de la tesis.",
     "nota": 4.0,
     "ojo": "Los montos de la Tabla A1.1 son 444 643 pesos el robot y 582 447 pesos el proyecto completo. Ninguno incluye el computador."
    },
    {
     "n": 6,
     "p": "externo",
     "tit": "Por qué el proyecto ahorra menos que el robot",
     "pregunta": "¿Por qué el robot sale un 32 por ciento más barato, pero el proyecto completo ahorra solo un 11 por ciento?",
     "dijo": "Reconoció las cifras y explicó que el proyecto incluye herramientas como el cautín, la fuente de poder y otras necesarias para ensamblar el chasis.",
     "bien": "La explicación fue clara y simple, justo lo que necesita el profesor externo.",
     "falto": "Cerrar la idea. Las herramientas cuestan lo mismo las compre quien las compre, y por eso diluyen el ahorro.",
     "sugerida": "Las piezas del robot salen un 32 por ciento más baratas, pero las herramientas de taller cuestan igual en ambos casos. Al sumarlas, el ahorro del proyecto completo baja al 11 por ciento.",
     "respaldo": "Comparación de costos de la tesis.",
     "nota": 6.0,
     "ojo": "Esta respuesta sugerida no calza con la tesis, aunque la ronda le dio 6,0. Según la Tabla A1.1, lo que separa al robot del proyecto completo son 137 804 pesos de operación y desarrollo, que son el router de viaje, los cables de red, el cargador, las baterías de repuesto y los accesorios HDMI y USB. No hay cautín, fuente de poder, estaño ni impresora 3D, y el guion de la lámina 34 pide no nombrarlos. Versión que calza con la tesis. El robot cuesta 444 643 pesos, un 32 por ciento menos que el Burger, que vale 656 092. El proyecto completo suma la red dedicada, el cargador, las baterías de repuesto y los accesorios de desarrollo, llega a 582 447 y queda un 11 por ciento bajo el Burger."
    }
   ]
  },
  {
   "id": "b39",
   "n": 39,
   "tema": 10,
   "area": "decisiones",
   "corto": "Construir en vez de comprar",
   "titulo": "¿Por qué construir este robot en vez de comprar un TurtleBot 3 Burger?",
   "como": "",
   "quien": "Profesor externo en la ronda 3. Nota 3,5.",
   "respuesta": "El Burger trae IMU y actuadores con controlador integrado, así que no digo que el mío ofrezca lo mismo más barato. El robot cuesta un 32 % menos y el proyecto completo un 11 % menos, y los precios del Burger son de catálogo, sin envío ni impuestos. Lo que gana un estudiante es documentar y modificar cada capa, desde el firmware hasta la exploración. Un ejemplo concreto es que, al revisar el firmware, descubrí que la ley llamada PID opera en realidad como un PI incremental. Otro ejemplo es el nodo propio que escribí para leer el láser por puerto serie.",
   "repreguntan": "",
   "donde": "Justificación, páginas 1 y 2. Anexo 1.2 y Tabla A1.2, páginas 95 y 96. Anexo 4.5, página 111. Anexo 3.4, página 103. Láminas 30, 34 y 37.",
   "costo": "Dijo que el inglés es una barrera, pero eso no está en la tesis y la documentación de ROS 2 y Nav2 también está en inglés. No dio un ejemplo aunque se lo pidieron dos veces.",
   "extras": [],
   "notas": [
    {
     "r": 3,
     "p": "externo",
     "v": 3.5
    }
   ]
  },
  {
   "id": "b40",
   "n": 40,
   "tema": 10,
   "area": "externo",
   "corto": "Dónde fallaría en una oficina",
   "titulo": "Si llevo su robot a una oficina con sillas, mesas, ventanales y gente caminando, ¿dónde fallaría?",
   "como": "",
   "quien": "Profesor externo en las rondas 2, 3 y 4. Nota 4,5 en las tres.",
   "respuesta": "El láser mide en un solo plano horizontal, así que no ve lo que queda por encima o por debajo de ese plano, como la cubierta de una mesa o el asiento de una silla. También se degrada con superficies muy reflectantes, como el vidrio, o muy absorbentes. No está pensado para obstáculos rápidos ni suelos irregulares, y la odometría deriva en recorridos largos porque no hay IMU. Y en pasos estrechos la configuración no garantiza espacio para la esquina del robot, porque el radio de inflación es menor que la distancia a esa esquina.",
   "repreguntan": "",
   "donde": "Sec. 3.3.1, página 22. Alcances y limitaciones, páginas 3 y 4. Limitaciones, página 80. Anexo 5.2, página 118. Respuesta corta del guion sobre dónde fallaría en una oficina.",
   "costo": "En la ronda 2 dijo que con objetos opacos no habría problema, y eso es incorrecto. En las tres rondas olvidó los pasos estrechos.",
   "extras": [],
   "notas": [
    {
     "r": 2,
     "p": "externo",
     "v": 4.5
    },
    {
     "r": 3,
     "p": "externo",
     "v": 4.5
    },
    {
     "r": 4,
     "p": "externo",
     "v": 4.5
    },
    {
     "r": 5,
     "p": "externo",
     "v": 6.0
    }
   ],
   "ensayo": [
    {
     "n": 10,
     "p": "externo",
     "tit": "Cuándo fallaría el robot",
     "pregunta": "En simple, ¿en qué situación concreta de la vida real el robot fallaría o no podría hacer su trabajo?",
     "dijo": "Dijo que falla con superficies reflectantes como vidrios o paredes brillantes, porque el láser no detecta bien los obstáculos, y que por eso usó paredes opacas en sus pruebas. Agregó que el láser mide en un solo plano, así que los obstáculos más bajos o más altos que el láser no se detectan y el robot podría chocar.",
     "bien": "Respuesta clara, concreta y sin tecnicismos.",
     "falto": "Mencionar también las superficies muy absorbentes, que devuelven poca luz al láser. Ese matiz lo agregó la comisión.",
     "sugerida": "Falla con vidrios, superficies muy reflectantes o muy oscuras. Además, el láser ve un solo plano horizontal, así que no detecta obstáculos que estén por debajo o por encima de él.",
     "respaldo": "Limitaciones del capítulo de resultados de la tesis.",
     "nota": 6.0
    }
   ]
  },
  {
   "id": "b41",
   "n": 41,
   "tema": 10,
   "area": "externo",
   "corto": "Un espacio 30 veces mayor",
   "titulo": "Si el espacio fuera treinta veces más grande que su recinto, ¿qué le impide asegurar que lo exploraría completo?",
   "como": "",
   "quien": "Profesor externo, repreguntas de las rondas 3 y 4.",
   "respuesta": "No puedo asegurarlo. Probé un único recinto, con un área libre mapeada media de 3,50 metros cuadrados, y cinco corridas válidas de una misma sesión. En un espacio grande la odometría acumula más deriva porque no hay IMU. No medí la autonomía de la batería ni el uso de CPU, y la navegación no tiene un indicador medido. Además, en el robot el mapa de costos global es una ventana de 10 por 10 metros que se mueve con el robot, y el explorador busca fronteras en ese mapa, así que en un espacio mayor habría que revisar que no declare terminada la exploración antes de tiempo. Medir en un espacio mayor es el trabajo futuro 1.",
   "repreguntan": "",
   "donde": "Limitaciones, validez externa, deriva odométrica y espacio reducido, página 80. Anexo 8.3, página 127. Trabajos futuros 1, 2 y 4, página 81.",
   "costo": "En la ronda 3 dijo que en un espacio grande no habría pasos estrechos, una suposición sin respaldo. En la ronda 4 omitió esta repregunta.",
   "extras": [
    {
     "t": "Ojo",
     "x": "Lo de la ventana de 10 por 10 metros está en el código, en la sección global_costmap de nav2_params.yaml, pero no en la tesis. Agréguelo al Anexo 5.2 antes de usarlo, o no lo mencione."
    }
   ],
   "notas": []
  }
 ],
 "probables": [
  {
   "titulo": "Explique con sus palabras el control PID en tiempo discreto.",
   "respuesta": "El Arduino no trabaja en tiempo continuo. Toma una muestra cada 33 milisegundos, compara la velocidad de referencia con la medida, las dos en ticks por ciclo, y obtiene el error. En la forma clásica, la salida suma una parte proporcional al error, una parte proporcional a la acumulación del error y una parte proporcional a su variación. En mi firmware la ley es incremental. Calcula cuánto cambiar la salida, lo suma a la salida anterior, la limita a más o menos 255 y la aplica como PWM. Por esa suma cada término sube un orden, y la ley termina operando como un PI.",
   "donde": "Sec. 3.6 y Ec. 3.12, páginas 27 y 28. Sec. 4.4.3, página 48. Anexo 3.5, página 104. Anexo 4.4, página 110."
  },
  {
   "titulo": "¿Qué es AMCL y por qué no lo usó?",
   "respuesta": "AMCL es una localización con filtro de partículas sobre un mapa ya guardado. Cada partícula es una posible pose del robot. Las partículas se mueven con la odometría, se ponderan según qué tan bien calza el láser con el mapa y luego se remuestrean hacia las más probables. En mi trabajo la localización la hace slam_toolbox mientras construye el mapa. AMCL está en la pila con sus parámetros por defecto, pero no lo ajusté ni lo ejecuté, y queda fuera del alcance. Usarlo es el trabajo futuro 7.",
   "donde": "Sec. 3.9, página 31. Sec. 4.5.2, página 54. Anexo 5.1, página 118."
  },
  {
   "titulo": "¿Qué hace el controlador local DWB?",
   "respuesta": "Toma solo las velocidades que el robot puede alcanzar desde su estado actual, simula hacia adelante la trayectoria de cada una y la puntúa con criterios como la cercanía a obstáculos, la alineación con la ruta y el avance hacia la meta. Elige la de menor puntaje. En el robot trabaja a 8 Hz y puede pedir hasta 0,15 m/s, aunque el controlador diferencial limita a 0,13.",
   "donde": "Sec. 3.10 y Ec. 3.16, páginas 32 y 33. Tabla 4.5, página 56. Tabla A5.1, página 117."
  },
  {
   "titulo": "¿Qué marcos de referencia usa y quién publica cada uno?",
   "respuesta": "La cadena es map, odom, base_link y laser_frame. slam_toolbox publica de map a odom. El controlador diferencial publica de odom a base_link con la odometría de encoders. Y de base_link a laser_frame es una transformación fija que sale de la descripción del robot. Sigue las convenciones REP 103 y REP 105.",
   "donde": "Sec. 4.2.2, página 38. Sec. 4.3.2, página 42. Anexo 2.1, página 99."
  },
  {
   "titulo": "¿Qué programó usted y qué adaptó?",
   "respuesta": "articubot_one y diffdrive_arduino vienen de proyectos de Josh Newans, el firmware ROSArduinoBridge viene de la versión de Newans derivada del Home Brew Robotics Club, y explore_lite es el port a ROS 2 de Alvarez. Todos los modifiqué y configuré para este robot. Lo propio son los scripts de captura, identificación FOPDT y PSO, el nodo que lee el RPLidar por puerto serie, la integración completa y la parametrización del modelo.",
   "donde": "Justificación, página 2. Tabla A3.1, página 100. Anexo 3.4, página 103. Lámina 30."
  },
  {
   "titulo": "¿Por qué no simuló todo el sistema?",
   "respuesta": "La simulación tenía un propósito acotado, verificar el diseño antes de construir. Ahí sí comprobé la geometría, la cinemática, la cadena de marcos y la interfaz de control. Lo que no puede darme es el comportamiento real. En Gazebo los estados de las ruedas vienen del simulador y no de la ley del firmware, no hay zona muerta del driver, fricción real, ruido del láser ni latencias, y la pose verdadera no quedó registrada. Por eso el mapeo, la navegación y la exploración se midieron en el robot real.",
   "donde": "Sec. 4.2, página 37. Sec. 5.5, página 75. Limitaciones, fidelidad de la simulación, página 80. Lámina 31."
  },
  {
   "titulo": "¿Cómo lee el láser en el robot?",
   "respuesta": "No uso el programa del fabricante. Escribí un nodo propio que recibe las mediciones del RPLidar A1 por el puerto serie. Al arrancar revisa el estado del sensor y, si hay una falla, no publica. Luego junta las mediciones de cada vuelta, las divide en 230 partes y guarda la distancia más cercana de cada parte. Por eso el láser real entrega 230 sectores y el simulado 360 puntos sin ruido. Un límite conocido es que cada barrido lleva la hora de envío y no la de medición, y no medí cuánto afecta al mapa.",
   "donde": "Anexo 3.4, página 103. Anexo 2, página 97. Lámina 37."
  },
  {
   "titulo": "¿Por qué exploración por fronteras y no ganancia de información o active SLAM?",
   "respuesta": "Porque es de menor complejidad y se integra fácil con el mapa de ocupación y con Nav2. Los métodos de ganancia de información y de active SLAM pueden tomar decisiones más informadas, pero exigen modelos y cálculo adicionales.",
   "donde": "Sec. 1.4.2, página 11. Sec. 2.1, página 16. Lámina 12."
  },
  {
   "titulo": "¿Por qué un LIDAR 2D y no una cámara?",
   "respuesta": "Porque para interiores es suficiente y tiene menor costo y menor carga de procesamiento que una cámara RGB D o un LIDAR 3D. En robots de interiores el SLAM con LIDAR 2D es la alternativa predominante, según Ran y colaboradores.",
   "donde": "Sec. 1.3, páginas 7 y 8. Sec. 2.1, página 16."
  },
  {
   "titulo": "¿Cómo se alimenta el robot?",
   "respuesta": "Un bus de 12 volts mueve los motores a través del L298N, y un módulo reductor genera un riel de 5 volts para la Raspberry, el Arduino y el LIDAR. Separar los dos dominios reduce el ruido de los motores sobre la electrónica de control. La Raspberry y el Arduino se comunican por un enlace serial USB.",
   "donde": "Sec. 4.3.1, página 41. Fig. 4.5, página 43. Lámina 24."
  }
 ],
 "introProbables": "Estas preguntas no salieron en las cuatro rondas, pero corresponden a temas de su marco teórico o a láminas de respaldo que ya tiene. Cada una lleva una respuesta corta.",
 "solo": [
  {
   "t": "Por qué 0,13 m/s",
   "x": "Los archivos solo muestran que coincide con el límite lineal de la Tabla 4.3 y con la velocidad de la prueba recta. La razón de la elección no está escrita. Corresponde a la pregunta 17."
  },
  {
   "t": "Por qué 0,05 m de tamaño mínimo de frontera",
   "x": "La Tabla A5.4 da el valor, pero no lo justifica, y el archivo de ejemplo del paquete trae 0,75 m. Corresponde a la pregunta 33."
  },
  {
   "t": "Por qué 0,15 m de radio de inflación",
   "x": "La tesis dice que es menor que el de simulación y lo asocia al recinto reducido, pero no explica cómo se eligió. Corresponde a la pregunta 29."
  },
  {
   "t": "Cómo midió el ángulo físico del giro",
   "x": "El script pide alinear el robot con una marca de inicio, pero la tesis no describe el método. Corresponde a la pregunta 20."
  },
  {
   "t": "Qué hizo en el momento durante la iteración 2",
   "x": "La tesis no describe pasos de diagnóstico. Diga lo que realmente hizo, sin inventar un procedimiento. Corresponde a la pregunta 22."
  },
  {
   "t": "Si intentó el protocolo de metas fijas",
   "x": "La tesis dice que no se ejecutó. Si hubo intentos sin registro, fije una sola frase. Corresponde a la pregunta 3."
  },
  {
   "t": "El costo del computador",
   "x": "No aparece en ningún archivo. Si no lo cuantificó, dígalo así. Corresponde a la pregunta 38."
  },
  {
   "t": "El video",
   "x": "Decida si lo usa y qué dirá de él. Corresponde a la pregunta 9."
  }
 ],
 "diferencias": [
  {
   "t": "Razón del protocolo serial",
   "x": "La Sec. 4.4.3, en la página 49, la lámina 26 y su guion dicen que la ley se conservó porque diffdrive_arduino usa el protocolo serial del firmware. En el código, arduino_comms.cpp solo envía un mensaje vacío y los comandos e y m, y la función que carga ganancias existe pero nunca se llama. La ley está en diff_controller.h, separada de los comandos. Conviene decir que el protocolo justifica conservar el firmware y sus comandos, no la fórmula."
  },
  {
   "t": "Resolución de la velocidad",
   "x": "La Sec. 5.2, en la página 67, atribuye al firmware una resolución de 0,01 m/s. En ROSArduinoBridge.ino el comando j imprime la velocidad con dos decimales, que es el formato por defecto del Arduino, mientras que un tick por ciclo equivale a unos 0,003 m/s. Conviene aclararlo y señalar en la Tabla 5.3 que 0,128 m/s es el promedio de las muestras desde los 7 segundos. Esto se preguntó en la ronda 3."
  },
  {
   "t": "Registro del gemelo digital",
   "x": "La Tabla A2.2 y el Anexo 2.2, en la página 99, solo traen el resultado esperado de cada criterio. El script de verificación de marcos del repositorio está hecho para el robot real y no tiene salidas guardadas. Además, my_controllers.yaml pide publicar la odometría a 50 Hz con un ciclo de control de 30 Hz. Agregue los valores medidos, o declare explícitamente que no se registraron. Esto se preguntó en las rondas 3 y 4."
  },
  {
   "t": "Texto de la lámina 38",
   "x": "La lámina dice el mismo comportamiento en simulación y en el robot real, y su subtítulo dice que los criterios se confirmaron en Gazebo Classic. La Sec. 5.5 y la conclusión del OE1 dicen que no hubo comparación sobre una misma variable. Cambie la frase por la del guion, reproduce los marcos, los sensores y los movimientos del prototipo."
  },
  {
   "t": "El video",
   "x": "La tesis y las láminas no citan ningún video, y el plan de contingencia del guion dice que no se muestra ni se menciona. En la ronda 4 usted lo mencionó. Decida una versión."
  },
  {
   "t": "Definición de frontera",
   "x": "La Sec. 3.11, en la página 33, define la celda de frontera como una celda desconocida junto a espacio libre y la atribuye a Yamauchi. El artículo, en su sección 2.2, la define como una celda libre junto a una desconocida y exige un tamaño parecido al del robot. La definición de la tesis corresponde a la implementación del Anexo 5.6. Conviene decirlo así, y matizar la frase del guion de la lámina 40 que dice la misma idea de frontera."
  },
  {
   "t": "Tamaño mínimo de frontera",
   "x": "La Tabla A5.4 usa 0,05 m, que admite una sola celda, mientras el archivo de ejemplo del paquete, m-explore-ros2/explore/config/params.yaml, trae 0,75 m. La tesis no justifica el cambio."
  },
  {
   "t": "Lámina 12",
   "x": "Llama al PSO lo más original y lo presenta como alternativa a la prueba y error. La Sec. 5.2 lo describe como semilla, las ganancias finales salieron de un ajuste en el robot y no se comparó con las ganancias originales del firmware. Conviene hablar del procedimiento completo como lo más propio."
  },
  {
   "t": "Uso del término PID",
   "x": "El Capítulo 2 en la página 14, la Sec. 4.1.1 en la página 35, el título de la Tabla 4.4 en la página 50 y la conclusión del Capítulo 4 en la página 60 hablan de control PID, mientras la tesis concluye que opera como PI. Agregue en esos lugares la aclaración ley heredada que opera como PI."
  },
  {
   "t": "Lámina 4",
   "x": "El recuadro nombra percepción, control, mapeo y exploración como los cuatro subsistemas. El texto de la misma lámina y el guion dicen percepción, localización, control y planificación. Deje una sola lista."
  },
  {
   "t": "Plataforma comparable",
   "x": "La Sec. 4.1, en la página 35, habla de la plataforma comercial comparable más cercana, y el Anexo 1.2 de dos plataformas comparables. El mismo Anexo 1.2 termina diciendo que es la plataforma de entrada y que no ofrece las mismas prestaciones. Cambie comparable por de entrada."
  },
  {
   "t": "Lámina 37",
   "x": "Cita una Tabla A10.1 que no existe. El Anexo 10 es la Nomenclatura. La tabla de archivos es la Tabla A9.1."
  },
  {
   "t": "Mapa de costos global en el robot",
   "x": "En nav2_params.yaml el mapa de costos global es una ventana de 10 por 10 metros que se mueve con el robot, y el explorador busca fronteras en ese mapa según explore.yaml. En el recinto de prueba no influye, pero en un espacio mayor podría hacer que la exploración termine antes de tiempo. El Anexo 5.2 no lo menciona. Conviene verificarlo y declararlo."
  },
  {
   "t": "Protocolo angular",
   "x": "El script prueba_giro.py calcula también el giro de la odometría en el robot real, pero la Tabla A6.4 no lo informa. La tesis tampoco describe cómo se midió el ángulo físico."
  },
  {
   "t": "Detalles menores",
   "x": "El guion de la lámina 16 dice con el mapa recién actualizado, frase que la tesis no respalda. La conclusión del Capítulo 4, en la página 60, dice que el gemelo permitió validar la cinemática, cuando la conclusión del OE1 habla de verificación. La Sec. 3.8, en la página 31, dice que el SLAM por grafos es viable en plataformas de bajo costo, pero en su sistema corre en el computador y la CPU no se midió. La Sec. 3.10 menciona la admisibilidad de la heurística sin definirla."
  }
 ],
 "corregidas": [
  "Estas diferencias se señalaron en rondas anteriores y ya no aparecen. No hace falta volver a tocarlas, pero conviene saber que se corrigieron por si la comisión leyó una versión anterior.",
  "El costo ya está cuantificado en las Tablas A1.1 y A1.2 y en la lámina 34. Los anexos 9 y 10 ya no se repiten. Las láminas de respaldo de la 23 a la 41 ya están en el archivo. El nodo propio del láser ya está en el Anexo 3.4 y la lámina 37. Las paredes móviles ya no se mencionan. La lámina 5 ya no habla de cómputo acotado. El guion de la lámina 19 ya dice que no se identificaron abortos por fallas de Nav2 con los datos registrados. El guion de la lámina 16 ya dice 3,3 segundos.",
  "El Anexo 1.1 ya remite a la comparación del Anexo 1.2. La Sec. 4.5.1 ya dice que slam_toolbox corre en el computador y que la CPU no se midió. El Anexo 7 ya explica la cercanía entre los 3,851 y los 3,850 metros de las iteraciones 2 y 5. La lámina 19 ya usa la palabra abortada. El título de la lámina 14 ya no dice buen control. El guion de la lámina 10 ya no dice que el router tiene salida a internet.",
  "El Anexo 8.3 ya menciona los scripts sin registros y la tolerancia de 0,22 m del script de metas fijas. El Anexo 5.2 ya explica que la esquina del robot queda fuera del radio de inflación. La Tabla A5.1 ya informa la tolerancia de orientación de 3,14 rad, el verificador de progreso y las velocidades hacia atrás de DWB. La Sec. 5.5 ya aclara que en simulación se construyeron mapas sin calcular indicadores."
 ],
 "laminas": [
  {
   "t": "Camino de una orden de velocidad",
   "x": "De Nav2 al motor, con cada conversión, su límite y su frecuencia, y el camino de vuelta de los encoders. Responde a la pregunta 18."
  },
  {
   "t": "Resolución de la medición de velocidad",
   "x": "De dónde sale el paso de 0,01 m/s, qué representa el 0,128 y qué tamaño de sobreimpulso no se alcanza a ver. Responde a la pregunta 16."
  },
  {
   "t": "Control fuera de 0,13 m/s",
   "x": "Los 41 ticks por ciclo en recta frente a unos 10 en un giro, el peso de las bandas muertas y el umbral de 14 ticks del integral izquierdo. Responde a la pregunta 17."
  },
  {
   "t": "Cierre de lazo en una imagen",
   "x": "Una versión simple de la Fig. 3.4 y una línea que explique por qué quedó como no determinado. Responde a la pregunta 24."
  },
  {
   "t": "Qué evaluó cada referencia de SLAM",
   "x": "Qué algoritmos comparó Trejos, que lo hizo en simulación, la relación entre slam_toolbox y Karto, y que la CPU no se midió en su sistema. Responde a las preguntas 25 y 26."
  },
  {
   "t": "Frontera según Yamauchi y según su explorador",
   "x": "La definición de celda, el tamaño mínimo, 0,75 m en el paquete y 0,05 m en su configuración, y cada cuánto se elige. Puede ser una ampliación de la lámina 40. Responde a las preguntas 32 y 33."
  },
  {
   "t": "Protocolo angular",
   "x": "Los 0,4 rad/s pedidos frente a los 0,35 permitidos, los 315 grados teóricos, el método de medición y el trabajo futuro 8. Responde a la pregunta 20."
  },
  {
   "t": "Qué cambia en un espacio mayor",
   "x": "Validez externa, deriva sin IMU, mediciones que faltan y, si lo agrega a la tesis, la ventana de 10 por 10 metros del mapa de costos global. Responde a la pregunta 41."
  },
  {
   "t": "Cómo sé que el robot se movió",
   "x": "La secuencia de la Fig. A7.1 con el mapa creciendo, frente a la iteración 2, donde el mapa no creció. Puede sumarse a la lámina 35. Responde a las preguntas 1 y 21."
  },
  {
   "t": "Ampliación de la lámina 26",
   "x": "Qué comandos usa diffdrive_arduino y por qué el protocolo no condiciona la fórmula, la integración condicional y la definición correcta de windup. Responde a las preguntas 12 y 13."
  },
  {
   "t": "Ampliación de las láminas 15 o 25",
   "x": "Las ganancias del PSO, las definitivas y las originales del firmware, con sus porcentajes de cambio, y la aclaración de que no se comparó contra las originales ni se analizó la estabilidad. Responde a la pregunta 14."
  },
  {
   "t": "Corrección de la lámina 38",
   "x": "Cambiar la frase del mismo comportamiento y agregar los valores medidos si los tiene. Responde a las preguntas 5 y 6."
  }
 ],
 "orden": [
  {
   "t": "Primero, dejar de omitir",
   "x": "Es lo que más sube la nota. Practique en voz alta la fórmula para lo que no sabe, qué sí sé, qué no medí y qué trabajo futuro lo resuelve, hasta que le salga sin pensar."
  },
  {
   "t": "Segundo, el marco teórico y las referencias",
   "x": "Es el área más débil y la más corta de estudiar. Prepare las respuestas de las preguntas 24 a 28 y 32 a 33, y lea las secciones 2.2 y 2.3 de Yamauchi y las conclusiones de Trejos."
  },
  {
   "t": "Tercero, el control de bajo nivel",
   "x": "Ensaye las preguntas 10 a 18 en voz alta, sobre todo el camino de una orden y la resolución de la medición, que nunca respondió."
  },
  {
   "t": "Cuarto, la navegación y exploración como resultado",
   "x": "Ensaye las preguntas 1 a 4, 30 y 31. La idea que debe quedar clara es que 53 de 54 abortos fueron reemplazos y que la prueba del movimiento es el crecimiento del mapa."
  },
  {
   "t": "Quinto, completar lo que solo usted sabe",
   "x": "Escriba una frase para cada punto de la sección 6 y, si alcanza, agréguela a la tesis."
  },
  {
   "t": "Sexto, corregir el documento y las láminas",
   "x": "Siga la sección 7.1, empezando por la Sec. 4.4.3, la Sec. 5.2, la Tabla A2.2 y las láminas 12, 37 y 38."
  },
  {
   "t": "Séptimo, volver a simular",
   "x": "Use el comando repasar seguido de marco teórico, y luego de control de bajo nivel. Cuando ya no omita preguntas, pase al nivel 3 para practicar frente a contradicciones."
  }
 ],
 "forma": [
  {
   "t": "Omitir preguntas",
   "x": "Fueron doce omisiones completas. Su propio guion dice que nunca se debe pasar una pregunta. Una respuesta parcial con una frase como esto no lo medí vale mucho más que el silencio."
  },
  {
   "t": "Recitar el texto preparado aunque pregunten otra cosa",
   "x": "Pasó en la ronda 3 con el protocolo serial y el gemelo, y en la ronda 4 con Yamauchi, donde dijo la lámina 40 cuando le preguntaban por el tamaño mínimo de frontera. Escuche la pregunta completa y conteste primero lo que se pidió."
  },
  {
   "t": "Inventar explicaciones en el momento",
   "x": "En la ronda 1 atribuyó la iteración 2 a la latencia de internet y al reinicio de ROS 2, y dijo que las versiones nuevas no permiten usar A estrella ni RViz2. En la ronda 2 dijo que sus precios incluían envío. En la ronda 3 dijo que el inglés era una barrera y que en un espacio grande no hay pasos estrechos. Cada una abrió una repregunta."
  },
  {
   "t": "Usar términos imprecisos",
   "x": "Dijo mapeo 3D, sistema estable, maestro y esclavo, las ruedas sumaron, 30 Hz, tres veces más barato, y trató a RViz como el gemelo digital. En una defensa cada palabra imprecisa se convierte en la siguiente pregunta."
  },
  {
   "t": "Contestar solo una parte",
   "x": "En las preguntas compuestas, como costo y utilidad, respondió una sola parte y la comisión tuvo que pedir la otra."
  },
  {
   "t": "Cambiar de versión bajo presión",
   "x": "En la ronda 2 dio tres versiones sobre las metas fijas y dijo que el profesor se había confundido. Fije una sola versión de cada hecho antes de la defensa."
  },
  {
   "t": "Lo que sí funciona",
   "x": "Cuando usó las frases preparadas del guion, como en la iteración 2 y en A estrella, la nota subió. Cuando la comisión le mostró un error, se corrigió con claridad, como en la ley de control de la ronda 2. Y la explicación simple para el externo es su mejor respuesta."
  }
 ],
 "formulas": [
  {
   "t": "Para una pregunta normal",
   "x": "Primero la respuesta directa en una frase. Después el dato que la respalda y dónde está en la tesis. Al final la limitación, si la hay."
  },
  {
   "t": "Para algo que no midió o no sabe",
   "x": "Diga qué sí sabe, aclare qué no midió y nombre el trabajo futuro que lo resuelve. Por ejemplo, no medí el uso de CPU, así que no afirmo nada sobre su consumo, y medirlo es parte del trabajo futuro. Nunca pase la pregunta."
  }
 ],
 "ensayo": {
  "fecha": "2026-10-05",
  "nivel": 3,
  "resumen": "La suma de las doce notas da 61,5, lo que deja una nota promedio de 5,1 para la ronda de preguntas. Las mejores respuestas fueron las del profesor externo sobre las fallas del láser y el costo de las herramientas, y la del informante sobre la corrección de SLAM Toolbox. Las más bajas fueron el costo en pesos, los papeles de las ganancias del controlador y la lista negra.",
  "debiles": [
   {
    "t": "Costos y cifras del proyecto",
    "x": "Repase los porcentajes de ahorro, 32 por ciento en el robot y 11 por ciento en el proyecto completo, y el monto total en pesos de su capítulo de costos. No improvise cifras.",
    "ir": "b38"
   },
   {
    "t": "Teoría del control",
    "x": "Repase qué papel cumple cada ganancia en la forma incremental y por qué no hay derivativa efectiva.",
    "ir": "b10"
   },
   {
    "t": "La lista negra",
    "x": "Repásela como limitación de la integración entre explore_lite y Nav2, no como virtud.",
    "ir": "b30"
   }
  ],
  "diferencias": [
   "La cifra de mil pesos no aparece en ningún archivo. La tesis reporta ahorros porcentuales frente a una alternativa comercial.",
   "En la pregunta sobre el controlador dijo primero \"control P\". El documento habla de un PI incremental en todo momento.",
   "También dijo que la constante integral se transforma en proporcional y la derivativa en integral. El documento dice lo contrario. Kp actúa como integral, Kd como proporcional sobre la medición y Ki como segunda integración.",
   "Sobre la lista negra, sostuvo que tachar metas reemplazadas ayuda. La tesis lo describe como un efecto de la integración entre explore_lite y Nav2, en la sección 5.4."
  ],
  "codigo": "En la revisión del código no aparecieron contradicciones con el documento en los puntos repasados. La función del PID recorta la salida a 255 antes de guardarla, usa variables enteras y deja de acumular el término de Ki cuando la salida está en el tope, como describe el Anexo 4.4. El explorador usa 0,3 hercios, una tolerancia de un centímetro para considerar repetida una meta y 10 segundos sin avance para tachar una frontera, según explore.yaml. Coincide con el Algoritmo 4.4 y el guion.",
  "laminas": [
   {
    "t": "Tabla de costos",
    "x": "Con los porcentajes de ahorro y el monto total, para responder al profesor externo sin dudar."
   },
   {
    "t": "Reparto de las ganancias",
    "x": "El papel de cada ganancia en la forma incremental, o el ciclo del PID paso a paso."
   },
   {
    "t": "Ampliación de la lámina 41",
    "x": "Agregar que las metas canceladas no se anotan en la lista negra, porque eso explica por qué la mejora propuesta funciona."
   }
  ],
  "observaciones": [
   {
    "t": "Vuelve al argumento de las fronteras",
    "x": "Le pasó en las preguntas 3 y 4. Responda primero lo que le preguntan y use ese argumento solo si aporta."
   },
   {
    "t": "Defiende de más",
    "x": "Como en la lista negra. Cuando acepta el matiz, como hizo con verificado y validado, queda mucho mejor parado."
   },
   {
    "t": "Parte por el qué y no por el porqué",
    "x": "Como en la pregunta sobre PSO. Ante un por qué, parta con la razón."
   },
   {
    "t": "Respuestas con varias partes sin orden",
    "x": "Como en la simulación. Diga primero la idea principal en una frase y después los detalles."
   }
  ]
 },
 "trampas": [
  {
   "grupo": "Control de las ruedas",
   "items": [
    {
     "no": "Cero sobreimpulso.",
     "si": "Sin sobreimpulso apreciable dentro de la resolución de medida.",
     "lam": 26
    },
    {
     "no": "El control no es un PID.",
     "si": "Opera como un PI incremental heredado del firmware.",
     "lam": 26
    },
    {
     "no": "Se comporta igual que un PID, solo cambia el escalamiento.",
     "si": "Opera como un PI incremental, y sus ganancias no se leen por su nombre.",
     "lam": 26
    },
    {
     "no": "El control corre dentro de ROS 2.",
     "si": "La ley de control corre en el Arduino.",
     "lam": 26
    },
    {
     "no": "La simulación no captura la fricción.",
     "si": "El modelo FOPDT no anticipaba la zona muerta ni el error estacionario.",
     "lam": 15
    }
   ]
  },
  {
   "grupo": "Odometría",
   "items": [
    {
     "no": "La iteración 2 falló por la latencia de internet. O por el reset de ROS 2.",
     "si": "La causa no se determinó.",
     "lam": 35
    },
    {
     "no": "Sin IMU no podía detectarlo.",
     "si": "Los encoders solos no lo distinguen, y el ensayo no usa el láser para detenerse.",
     "lam": 35
    }
   ]
  },
  {
   "grupo": "Mapeo y exploración",
   "items": [
    {
     "no": "Cubre el 62 por ciento del espacio. O del recinto.",
     "si": "Índice medio de cobertura libre de 62.2 por ciento.",
     "lam": 16
    },
    {
     "no": "Exploración completa. O explora hasta agotar el entorno.",
     "si": "La exploración termina sola al no quedar fronteras.",
     "lam": 16
    },
    {
     "no": "Funcionó, así que el consumo es compatible con embebidos.",
     "si": "SLAM Toolbox corre en el PC y no medí la CPU.",
     "lam": 5
    }
   ]
  },
  {
   "grupo": "Navegación",
   "items": [
    {
     "no": "Solo una de 60 metas se completó, dicho como si fuera un fracaso.",
     "si": "53 de 54 abortos fueron reemplazos del explorador, así que no es una tasa de éxito.",
     "lam": 27
    },
    {
     "no": "Los abortos se deben al recinto reducido y a la inflación.",
     "si": "Los abortos vienen del reemplazo de metas que hace el explorador.",
     "lam": 27
    },
    {
     "no": "Ninguna interrupción vino de Nav2.",
     "si": "Con los datos registrados no identifiqué abortos por fallas de Nav2.",
     "lam": 27
    },
    {
     "no": "Interrumpida.",
     "si": "Abortada, que es el término de la tesis.",
     "lam": 27
    },
    {
     "no": "La navegación es limitada. O desempeño limitado.",
     "si": "La navegación funciona de extremo a extremo, pero no tiene un indicador cuantitativo.",
     "lam": 29
    },
    {
     "no": "La navegación a metas fijas quedó pendiente. O no alcancé a ejecutarla.",
     "si": "Quedó fuera del alcance declarado.",
     "lam": 29
    },
    {
     "no": "Nav2 ejecuta la ruta.",
     "si": "Nav2 lleva al robot hacia la frontera que elige el explorador.",
     "lam": 29
    }
   ]
  },
  {
   "grupo": "Simulación y gemelo digital",
   "items": [
    {
     "no": "El mismo láser que el robot real.",
     "si": "Un láser equivalente, pero ideal.",
     "lam": 32
    },
    {
     "no": "Mapeo y exploración solo se hicieron en el robot real.",
     "si": "Se midieron con indicadores solo en el robot real.",
     "lam": 32
    },
    {
     "no": "Validé el gemelo digital con números.",
     "si": "Lo verifiqué con los criterios de la Tabla A2.2.",
     "lam": 38
    },
    {
     "no": "La lámina 18 es simulación.",
     "si": "La 9 es una captura de Gazebo y la 18 es el robot real con RViz.",
     "lam": 38
    }
   ]
  },
  {
   "grupo": "Hardware y red",
   "items": [
    {
     "no": "Maestro y esclavo.",
     "si": "Arquitectura distribuida, el robot hace el control rápido y el PC el cálculo pesado.",
     "lam": 10
    },
    {
     "no": "Uso FastDDS.",
     "si": "El middleware registrado en la Tabla A3.2 es rmw_cyclonedds_cpp.",
     "lam": 10
    }
   ]
  },
  {
   "grupo": "Objetivos y aporte",
   "items": [
    {
     "no": "OE4 cumplido parcialmente.",
     "si": "Ahora está cumplido. Los parciales son OE2 y OE3.",
     "lam": 21
    },
    {
     "no": "SLAM validado.",
     "si": "Verificado en funcionamiento.",
     "lam": 19
    },
    {
     "no": "Hice ensayos de red, CPU y deslizamiento.",
     "si": "Esos scripts quedaron preparados, sin registros.",
     "lam": 19
    },
    {
     "no": "Desarrollé el firmware.",
     "si": "Adapté el firmware de un proyecto abierto.",
     "lam": 30
    }
   ]
  },
  {
   "grupo": "Costo, límites y uso",
   "items": [
    {
     "no": "Es más barato que los demás.",
     "si": "Un 32 por ciento menos que el TurtleBot 3 Burger, sin las mismas prestaciones.",
     "lam": 34
    },
    {
     "no": "Tres veces más barato.",
     "si": "32 por ciento menos el robot y 11 por ciento menos el proyecto.",
     "lam": 34
    },
    {
     "no": "Descarté ROS 1 porque no tiene soporte.",
     "si": "Elegí ROS 2 por su arquitectura distribuida y por Nav2.",
     "lam": 36
    },
    {
     "no": "Las versiones nuevas no permiten usar A* ni RViz2.",
     "si": "No decirlo. Nav2 actual trae NavFn y Smac.",
     "lam": 36
    },
    {
     "no": "Paredes móviles reconfigurables.",
     "si": "Un único recinto reducido.",
     "lam": 20
    },
    {
     "no": "Si es opaco no hay problema.",
     "si": "El láser ve un solo plano, y también le afectan las superficies muy absorbentes.",
     "lam": 20
    }
   ]
  },
  {
   "grupo": "Forma de responder",
   "items": [
    {
     "no": "Omito la respuesta.",
     "si": "Responde en parte y aclara lo que no está en la tesis."
    },
    {
     "no": "Creo que usted se confundió.",
     "si": "No lo digas nunca."
    }
   ]
  }
 ],
 "reglas": [
  "Nunca pases una pregunta. Di lo que sabes y aclara qué no está en la tesis, porque una respuesta parcial suma más que un silencio.",
  "Escucha la pregunta completa y responde primero lo que se pidió.",
  "Una respuesta corta lleva la afirmación y una razón que la respalde.",
  "Fija una sola versión de cada hecho antes de la defensa y no la cambies bajo presión.",
  "Si no puedes sostener un argumento, reconócelo y di cómo lo corregirías en el documento.",
  "Di cada cifra despacio, con su unidad y con lo que representa."
 ]
};
