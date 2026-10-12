/* Análisis local de mapas de ocupación guardados como imagen PGM, con su YAML opcional.
   Sin DOM, red, inferencia ni dependencias. No ejecuta map_server ni SLAM Toolbox: lee los
   niveles de gris, los clasifica con umbrales declarados y cuenta celdas.
   Node: require('./analisis-mapa.js'); navegador: window.ANALISIS_MAPA. */
(function (root) {
  'use strict';
  var P = { VERSION: 1, MAX_BYTES: 8 * 1024 * 1024, MAX_CELDAS: 4000000, MAX_YAML: 64 * 1024 };
  var LIBRE = 0, OCUPADO = 1, DESCONOCIDO = 2;
  P.CLASES = { LIBRE: LIBRE, OCUPADO: OCUPADO, DESCONOCIDO: DESCONOCIDO };
  function fail(message) { throw new Error(message); }

  /* PGM P5 (binario) o P2 (texto), con comentarios. La fila 0 es el borde superior de la imagen. */
  P.leerPGM = function (bytes) {
    if (!(bytes instanceof Uint8Array)) fail('Se necesitan los bytes del archivo PGM.');
    if (bytes.length > P.MAX_BYTES) fail('El PGM supera 8 MiB.');
    var i = 0, tokens = [];
    function espacio(c) { return c === 32 || c === 9 || c === 10 || c === 13 || c === 11 || c === 12; }
    while (tokens.length < 4 && i < bytes.length) {
      var c = bytes[i];
      if (c === 35) { while (i < bytes.length && bytes[i] !== 10 && bytes[i] !== 13) i++; continue; }   // '#'
      if (espacio(c)) { i++; continue; }
      var ini = i;
      while (i < bytes.length && !espacio(bytes[i]) && bytes[i] !== 35) i++;
      tokens.push(String.fromCharCode.apply(null, bytes.subarray(ini, i)));
    }
    if (tokens.length < 4) fail('Encabezado PGM incompleto.');
    var magia = tokens[0];
    if (magia !== 'P5' && magia !== 'P2') fail('El archivo no es PGM (se esperaba P5 o P2).');
    var nums = tokens.slice(1).map(function (t) { if (!/^\d+$/.test(t)) fail('Encabezado PGM con un valor no entero: ' + t.slice(0, 12)); return Number(t); });
    var ancho = nums[0], alto = nums[1], maxval = nums[2];
    if (!ancho || !alto) fail('El PGM debe tener ancho y alto positivos.');
    if (ancho * alto > P.MAX_CELDAS) fail('El mapa supera 4 millones de celdas.');
    if (maxval < 1 || maxval > 65535) fail('El valor máximo de gris debe estar entre 1 y 65535.');
    var n = ancho * alto, datos = maxval < 256 ? new Uint8Array(n) : new Uint16Array(n);
    if (magia === 'P5') {
      if (!espacio(bytes[i])) fail('Falta el separador después del encabezado PGM.');
      var porMuestra = maxval < 256 ? 1 : 2;
      /* El formato pide un único separador. Un archivo guardado con fin de línea de Windows trae
         dos (CR LF); se acepta solo si sobra exactamente ese byte, para no desplazar la imagen. */
      i += bytes[i] === 13 && bytes[i + 1] === 10 && bytes.length - i - 2 === n * porMuestra ? 2 : 1;
      if (bytes.length - i < n * porMuestra) fail('El PGM tiene menos datos que ancho × alto.');
      for (var k = 0; k < n; k++) {
        var v = porMuestra === 1 ? bytes[i + k] : (bytes[i + 2 * k] << 8) | bytes[i + 2 * k + 1];
        if (v > maxval) fail('Hay un gris mayor que el máximo declarado.');
        datos[k] = v;
      }
    } else {
      var leidos = 0, actual = '';
      for (; i < bytes.length && leidos < n; i++) {
        var ch = bytes[i];
        if (ch === 35) { while (i < bytes.length && bytes[i] !== 10) i++; continue; }
        if (ch >= 48 && ch <= 57) actual += String.fromCharCode(ch);
        else if (espacio(ch)) { if (actual) { var val = Number(actual); if (val > maxval) fail('Hay un gris mayor que el máximo declarado.'); datos[leidos++] = val; actual = ''; } }
        else fail('El PGM de texto contiene un carácter no numérico.');
      }
      if (actual && leidos < n) { var ult = Number(actual); if (ult > maxval) fail('Hay un gris mayor que el máximo declarado.'); datos[leidos++] = ult; }
      if (leidos < n) fail('El PGM tiene menos datos que ancho × alto.');
    }
    return { ancho: ancho, alto: alto, maxval: maxval, datos: datos, formato: magia };
  };

  /* YAML de map_server: solo las claves conocidas, escritas como «clave: valor». No ejecuta etiquetas. */
  P.leerYAML = function (texto) {
    if (typeof texto !== 'string') fail('Se necesita el texto del YAML.');
    if (texto.length > P.MAX_YAML) fail('El YAML supera 64 KiB.');
    var out = {};
    texto.replace(/^﻿/, '').split(/\r\n?|\n/).forEach(function (linea, n) {
      var limpia = linea.replace(/\s+#.*$/, '').trim();
      if (!limpia || limpia[0] === '#') return;
      var m = /^([A-Za-z_]+)\s*:\s*(.*)$/.exec(limpia);
      if (!m) fail('Línea ' + (n + 1) + ' del YAML no tiene la forma clave: valor.');
      var clave = m[1], valor = m[2].trim().replace(/^["']|["']$/g, '');
      if (clave === 'origin') {
        var partes = valor.replace(/^\[|\]$/g, '').split(',').map(function (s) { return s.trim(); });
        if (partes.length !== 3 || partes.some(function (s) { return !/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(s); })) fail('origin debe ser [x, y, giro] con tres números.');
        out.origin = partes.map(Number);
      } else if (['resolution', 'occupied_thresh', 'free_thresh'].indexOf(clave) >= 0) {
        if (!/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(valor)) fail(clave + ' debe ser un número.');
        out[clave] = Number(valor);
      } else if (clave === 'negate') {
        if (!/^(0|1|true|false)$/i.test(valor)) fail('negate debe ser 0 o 1.');
        out.negate = /^(1|true)$/i.test(valor) ? 1 : 0;
      } else if (clave === 'image' || clave === 'mode') out[clave] = valor;
    });
    if (out.resolution !== undefined && !(out.resolution > 0 && Number.isFinite(out.resolution))) fail('resolution debe ser positiva.');
    ['occupied_thresh', 'free_thresh'].forEach(function (k) { if (out[k] !== undefined && !(out[k] >= 0 && out[k] <= 1)) fail(k + ' debe estar entre 0 y 1.'); });
    if (out.occupied_thresh !== undefined && out.free_thresh !== undefined && out.free_thresh >= out.occupied_thresh) fail('free_thresh debe ser menor que occupied_thresh.');
    if (out.mode && ['trinary', 'scale', 'raw'].indexOf(out.mode) < 0) fail('mode debe ser trinary, scale o raw.');
    return out;
  };

  /* Clasificación de cada celda.
     tesis: intensidad p llevada a 0–255; libre si p ≥ libre, ocupada si p ≤ ocupado, desconocida entre ambos.
     yaml: como map_server en modo trinario; ocupación = (255 − p)/255, o p/255 con negate = 1. */
  P.clasificar = function (pgm, criterio) {
    var n = pgm.datos.length, clases = new Uint8Array(n), esc = 255 / pgm.maxval;
    if (criterio.tipo === 'tesis') {
      if (!(criterio.libre > criterio.ocupado)) fail('El umbral libre debe ser mayor que el de ocupado.');
      for (var i = 0; i < n; i++) { var p = pgm.datos[i] * esc; clases[i] = p >= criterio.libre ? LIBRE : p <= criterio.ocupado ? OCUPADO : DESCONOCIDO; }
    } else if (criterio.tipo === 'yaml') {
      var occ = criterio.occupied_thresh, free = criterio.free_thresh, neg = criterio.negate ? 1 : 0;
      if (!(occ >= 0 && occ <= 1 && free >= 0 && free < occ)) fail('Los umbrales del YAML no son válidos o faltan.');
      for (var k = 0; k < n; k++) { var q = pgm.datos[k] / pgm.maxval, o = neg ? q : 1 - q; clases[k] = o > occ ? OCUPADO : o < free ? LIBRE : DESCONOCIDO; }
    } else fail('Criterio de clasificación desconocido.');
    return clases;
  };

  function contar(clases, ancho, x0, y0, x1, y1) {
    var c = [0, 0, 0];
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) c[clases[y * ancho + x]]++;
    return c;
  }
  /* Menor rectángulo que contiene todas las celdas observadas, libres u ocupadas. */
  P.rectanguloObservado = function (clases, ancho, alto) {
    var x0 = ancho, y0 = alto, x1 = -1, y1 = -1;
    for (var y = 0; y < alto; y++) for (var x = 0; x < ancho; x++) if (clases[y * ancho + x] !== DESCONOCIDO) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return x1 < 0 ? null : { x0: x0, y0: y0, x1: x1, y1: y1, ancho: x1 - x0 + 1, alto: y1 - y0 + 1 };
  };
  P.indice = function (libres, desconocidas) { return libres + desconocidas > 0 ? 100 * libres / (libres + desconocidas) : null; };

  function nuevo(tipo) { return { version: P.VERSION, tipo: tipo, filas: [], metricas: [], reglas: [], limitaciones: [], grafica: null }; }
  function metric(r, id, name, value, unit, formula, origin) {
    if (value !== null && !Number.isFinite(value)) fail('Resultado fuera del rango numérico: ' + name);
    r.metricas.push({ id: id, nombre: name, valor: value, unidad: unit, formula: formula, origen: origin || 'Calculado de la imagen' });
  }
  function rule(r, id, finding, condition, value, interpretation, suggestion, limit) {
    r.reglas.push({ id: id, hallazgo: finding, condicion: condition, evidencia: value, interpretacion: interpretation, sugerencia: suggestion, limitacion: limit });
  }
  function fmt(v, d) { return v === null ? 'no definido' : v.toFixed(d).replace('.', ','); }
  function criterioTexto(c) { return c.tipo === 'tesis' ? 'libre si gris ≥ ' + c.libre + ', ocupada si gris ≤ ' + c.ocupado + ', desconocida entre ambos (escala 0 a 255)' : 'umbrales del YAML: ocupada si ocupación > ' + c.occupied_thresh + ', libre si < ' + c.free_thresh + (c.negate ? ', con negate = 1' : ''); }
  function resolucionDe(opciones) {
    var r = opciones.yaml && opciones.yaml.resolution !== undefined ? opciones.yaml.resolution : opciones.resolucion;
    if (!(r > 0 && r <= 10 && Number.isFinite(r))) fail('La resolución debe ser un número positivo en m/celda, de hasta 10 m.');
    return { valor: r, origen: opciones.yaml && opciones.yaml.resolution !== undefined ? 'Declarada en el YAML' : 'Indicada por el usuario' };
  }

  /* Un mapa: conteos, áreas e índice de cobertura con la Ec. 5.4 de la guía, en la imagen completa
     y dentro del rectángulo observado, para mostrar cuánto depende el índice del marco elegido. */
  P.analizarMapa = function (pgm, opciones) {
    opciones = opciones || {};
    var res = resolucionDe(opciones), criterio = opciones.criterio, clases = P.clasificar(pgm, criterio);
    var r = nuevo('mapa-pgm'), n = pgm.ancho * pgm.alto, c = contar(clases, pgm.ancho, 0, 0, pgm.ancho - 1, pgm.alto - 1), a = res.valor * res.valor;
    var rect = P.rectanguloObservado(clases, pgm.ancho, pgm.alto), cr = rect ? contar(clases, pgm.ancho, rect.x0, rect.y0, rect.x1, rect.y1) : [0, 0, 0];
    metric(r, 'dimensiones', 'Tamaño de la imagen', n, 'celdas', 'ancho × alto = ' + pgm.ancho + ' × ' + pgm.alto);
    metric(r, 'resolucion', 'Resolución', res.valor, 'm/celda', 'lado de una celda', res.origen);
    metric(r, 'extension', 'Superficie de la imagen', n * a, 'm²', 'celdas × resolución²');
    metric(r, 'libres', 'Celdas libres', c[LIBRE], 'celdas', criterioTexto(criterio));
    metric(r, 'ocupadas', 'Celdas ocupadas', c[OCUPADO], 'celdas', criterioTexto(criterio));
    metric(r, 'desconocidas', 'Celdas desconocidas', c[DESCONOCIDO], 'celdas', criterioTexto(criterio));
    metric(r, 'area-libre', 'Área libre mapeada', c[LIBRE] * a, 'm²', 'celdas libres × resolución² (Ec. 5.5 de la guía)');
    metric(r, 'area-ocupada', 'Área ocupada', c[OCUPADO] * a, 'm²', 'celdas ocupadas × resolución²');
    metric(r, 'area-desconocida', 'Área desconocida dentro de la imagen', c[DESCONOCIDO] * a, 'm²', 'celdas desconocidas × resolución²');
    var indImg = P.indice(c[LIBRE], c[DESCONOCIDO]), indRect = rect ? P.indice(cr[LIBRE], cr[DESCONOCIDO]) : null;
    metric(r, 'indice-imagen', 'Índice de cobertura libre, imagen completa', indImg, '%', '100 · libres / (libres + desconocidas) (Ec. 5.4 de la guía). Las ocupadas no entran');
    metric(r, 'indice-rectangulo', 'Índice de cobertura libre, rectángulo observado', indRect, '%', 'misma fórmula dentro del menor rectángulo con celdas libres u ocupadas' + (rect ? ' (' + rect.ancho + ' × ' + rect.alto + ' celdas)' : ''));
    r.filas = [['libre', LIBRE], ['ocupada', OCUPADO], ['desconocida', DESCONOCIDO]].map(function (k) {
      return { clase: k[0], celdas: c[k[1]], area_m2: Number((c[k[1]] * a).toFixed(6)), porcentaje_de_la_imagen: Number((100 * c[k[1]] / n).toFixed(3)) };
    });
    r.grafica = { titulo: 'Celdas por clase', etiquetas: ['Libres', 'Ocupadas', 'Desconocidas'], series: [{ nombre: 'Celdas', valores: [c[LIBRE], c[OCUPADO], c[DESCONOCIDO]] }], unidad: 'celdas' };
    r.mapa = { ancho: pgm.ancho, alto: pgm.alto, resolucion: res.valor, formato: pgm.formato, maxval: pgm.maxval, rectangulo: rect, criterio: criterio, origen: opciones.yaml && opciones.yaml.origin ? opciones.yaml.origin : null };
    /* Tonos intermedios: map_saver en modo trinario escribe solo tres grises. Si hay muchos otros,
       la clase de esas celdas la deciden los umbrales y conviene revisarlos. */
    var orden = {}; for (var k = 0; k < n; k++) orden[pgm.datos[k]] = (orden[pgm.datos[k]] || 0) + 1;
    var tres = Object.keys(orden).map(Number).sort(function (x, y) { return orden[y] - orden[x]; }).slice(0, 3).reduce(function (s, g) { return s + orden[g]; }, 0);
    var otros = 100 * (n - tres) / n;
    metric(r, 'tonos', 'Tonos de gris distintos', Object.keys(orden).length, 'tonos', 'conteo de valores distintos en la imagen');
    if (otros > 1) rule(r, 'tonos-intermedios', 'La imagen tiene tonos fuera de los tres más frecuentes', 'celdas fuera de los tres grises más comunes > 1 %', fmt(otros, 1) + ' % de las celdas', 'Su clase depende de los umbrales elegidos, no de una marca explícita de libre, ocupada o desconocida.', 'Comparar el resultado con el otro criterio de umbrales y con el modo declarado en el YAML.', 'Con imágenes suavizadas o en escala de grises continua, los conteos cambian con los umbrales.');
    if (indImg !== null && indRect !== null && Math.abs(indImg - indRect) > 1) rule(r, 'indice-depende-marco', 'El índice depende del recorte de la imagen', '|índice imagen − índice rectángulo| > 1 punto', fmt(indImg, 1) + ' % en la imagen y ' + fmt(indRect, 1) + ' % en el rectángulo observado, con la misma área libre de ' + fmt(c[LIBRE] * a, 3) + ' m²', 'El denominador incluye celdas desconocidas cuyo número depende de dónde termina la imagen, no del recinto.', 'Comparar mapas por área libre o con un recorte común y declarado.', 'Ninguno de los dos índices es la fracción del recinto explorada sin una medida externa del recinto.');
    if (!c[LIBRE]) rule(r, 'sin-libres', 'No hay celdas libres', 'celdas libres = 0', '0 celdas', 'Con estos umbrales no se reconoce espacio libre.', 'Revisar umbrales, negate y el archivo elegido.', 'El índice de cobertura queda en 0 % o no definido.');
    if (opciones.yaml && opciones.yaml.mode && opciones.yaml.mode !== 'trinary') r.limitaciones.push('El YAML declara mode: ' + opciones.yaml.mode + '. Este análisis siempre reduce las celdas a tres clases.');
    r.limitaciones.push('El área libre es la de las celdas clasificadas como libres, no la superficie del recinto medida de forma independiente.');
    r.limitaciones.push('Sin una referencia geométrica externa no se puede estimar el error absoluto del mapa ni detectar un error de escala.');
    r.limitaciones.push('El origen y el marco del mapa ' + (r.mapa.origen ? 'se informan como datos del YAML, sin verificarlos.' : 'no se conocen: no hay YAML con origin.'));
    r.limitaciones.push('Las reglas son comprobables y limitadas. No identifican causas, no reemplazan al comité ni validan la tesis.');
    Object.defineProperty(r, 'clases', { value: clases, enumerable: false });   // para dibujar, fuera del JSON
    return r;
  };

  /* Dos mapas: solo se comparan celda a celda si comparten tamaño, resolución y, cuando hay YAML,
     el mismo origen. No se alinean ni se rotan: esa operación cambiaría lo que se está midiendo. */
  P.compararMapas = function (a, b, opciones) {
    opciones = opciones || {};
    var ra = P.analizarMapa(a, { resolucion: opciones.resolucion, yaml: opciones.yamlA, criterio: opciones.criterio });
    var rb = P.analizarMapa(b, { resolucion: opciones.resolucion, yaml: opciones.yamlB, criterio: opciones.criterio });
    var r = nuevo('mapa-pgm-comparacion'), resA = ra.mapa.resolucion, resB = rb.mapa.resolucion;
    function v(res, id) { return res.metricas.filter(function (m) { return m.id === id; })[0].valor; }
    metric(r, 'area-libre-a', 'Área libre, mapa A', v(ra, 'area-libre'), 'm²', 'celdas libres × resolución²');
    metric(r, 'area-libre-b', 'Área libre, mapa B', v(rb, 'area-libre'), 'm²', 'celdas libres × resolución²');
    metric(r, 'diferencia-area', 'Diferencia de área libre, B − A', v(rb, 'area-libre') - v(ra, 'area-libre'), 'm²', 'área libre B − área libre A');
    metric(r, 'indice-a', 'Índice de cobertura libre, mapa A', v(ra, 'indice-imagen'), '%', '100 · libres / (libres + desconocidas)');
    metric(r, 'indice-b', 'Índice de cobertura libre, mapa B', v(rb, 'indice-imagen'), '%', '100 · libres / (libres + desconocidas)');
    var motivos = [];
    if (a.ancho !== b.ancho || a.alto !== b.alto) motivos.push('tamaños distintos (' + a.ancho + ' × ' + a.alto + ' y ' + b.ancho + ' × ' + b.alto + ')');
    if (Math.abs(resA - resB) > 1e-12) motivos.push('resoluciones distintas');
    var oa = opciones.yamlA && opciones.yamlA.origin, ob = opciones.yamlB && opciones.yamlB.origin;
    if (oa && ob && oa.some(function (x, i) { return Math.abs(x - ob[i]) > 1e-9; })) motivos.push('orígenes distintos en los YAML');
    r.mapa = { a: ra.mapa, b: rb.mapa, celdaACelda: !motivos.length };
    if (motivos.length) {
      rule(r, 'no-comparable', 'No se comparan celda a celda', motivos.join(', '), 'Comparación limitada a áreas e índices', 'Las celdas con el mismo índice no representarían el mismo lugar.', 'Guardar ambos mapas en el mismo marco y con la misma resolución, o declarar una transformación medida.', 'No se alinea, rota ni recorta ningún mapa automáticamente.');
      r.grafica = { titulo: 'Área libre de cada mapa', etiquetas: ['A', 'B'], series: [{ nombre: 'Área libre', valores: [v(ra, 'area-libre'), v(rb, 'area-libre')] }], unidad: 'm²' };
      r.filas = [{ mapa: 'A', area_libre_m2: v(ra, 'area-libre'), indice_pct: v(ra, 'indice-imagen') }, { mapa: 'B', area_libre_m2: v(rb, 'area-libre'), indice_pct: v(rb, 'indice-imagen') }];
    } else {
      var ca = ra.clases, cb = rb.clases, n = ca.length, k = { ll: 0, oo: 0, lo: 0, ol: 0, soloA: 0, soloB: 0, dd: 0 }, dif = new Uint8Array(n);
      for (var i = 0; i < n; i++) {
        var x = ca[i], y = cb[i];
        if (x === DESCONOCIDO && y === DESCONOCIDO) { k.dd++; dif[i] = 0; }
        else if (x === DESCONOCIDO) { k.soloB++; dif[i] = 5; }
        else if (y === DESCONOCIDO) { k.soloA++; dif[i] = 4; }
        else if (x === y) { if (x === LIBRE) { k.ll++; dif[i] = 1; } else { k.oo++; dif[i] = 2; } }
        else { if (x === LIBRE) k.lo++; else k.ol++; dif[i] = 3; }
      }
      var conocidas = k.ll + k.oo + k.lo + k.ol, acuerdo = conocidas ? 100 * (k.ll + k.oo) / conocidas : null;
      metric(r, 'acuerdo', 'Acuerdo entre celdas observadas en ambos', acuerdo, '%', '100 · (libre en ambos + ocupada en ambos) / celdas observadas en ambos');
      metric(r, 'contradicciones', 'Celdas libres en un mapa y ocupadas en el otro', k.lo + k.ol, 'celdas', 'libre/ocupada + ocupada/libre');
      metric(r, 'solo-a', 'Observadas solo en A', k.soloA, 'celdas', 'conocida en A y desconocida en B');
      metric(r, 'solo-b', 'Observadas solo en B', k.soloB, 'celdas', 'conocida en B y desconocida en A');
      r.filas = [['libre en ambos', k.ll], ['ocupada en ambos', k.oo], ['libre en A, ocupada en B', k.lo], ['ocupada en A, libre en B', k.ol], ['observada solo en A', k.soloA], ['observada solo en B', k.soloB], ['desconocida en ambos', k.dd]].map(function (f) { return { categoria: f[0], celdas: f[1], area_m2: Number((f[1] * resA * resA).toFixed(6)) }; });
      r.grafica = { titulo: 'Comparación celda a celda', etiquetas: ['Acuerdo libre', 'Acuerdo ocupada', 'Contradicción', 'Solo A', 'Solo B'], series: [{ nombre: 'Celdas', valores: [k.ll, k.oo, k.lo + k.ol, k.soloA, k.soloB] }], unidad: 'celdas' };
      if (!oa || !ob) rule(r, 'marco-no-declarado', 'El marco común no está declarado', 'falta origin en al menos un YAML', 'Tamaño y resolución coinciden', 'La misma cuadrícula no garantiza que cada celda represente el mismo lugar.', 'Cargar el YAML de ambos mapas o confirmar que se guardaron en el mismo marco.', 'Un desplazamiento de pocas celdas aparece como contradicciones en los bordes.');
      if (k.lo + k.ol > 0) rule(r, 'contradicciones', 'Hay celdas que un mapa ve libres y el otro ocupadas', 'contradicciones > 0', (k.lo + k.ol) + ' celdas, ' + fmt((k.lo + k.ol) * resA * resA, 3) + ' m²', 'Pueden deberse a objetos movidos, a ruido o a una pequeña desalineación entre corridas.', 'Revisar dónde aparecen en la figura antes de atribuirles una causa.', 'El cálculo no distingue cambios del entorno de errores de pose.');
      Object.defineProperty(r, 'diferencias', { value: dif, enumerable: false });
    }
    Object.defineProperty(r, 'clasesA', { value: ra.clases, enumerable: false });
    Object.defineProperty(r, 'clasesB', { value: rb.clases, enumerable: false });
    r.limitaciones.push('Comparar área libre no dice cuál mapa es más exacto: ninguno tiene una referencia geométrica externa en este análisis.');
    r.limitaciones.push('Las reglas son comprobables y limitadas. No identifican causas, no reemplazan al comité ni validan la tesis.');
    return r;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = P;
  else root.ANALISIS_MAPA = P;
})(typeof globalThis !== 'undefined' ? globalThis : this);
