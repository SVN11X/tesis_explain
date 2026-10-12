/* Análisis determinista de tablas CSV. Sin DOM, red, inferencia ni dependencias.
   Las reglas describen los datos disponibles; no certifican una investigación.
   Node: require('./analisis-modelo.js'); navegador: window.ANALISIS. */
(function (root) {
  'use strict';
  var A = { VERSION: 1, MAX_BYTES: 2 * 1024 * 1024, MAX_FILAS: 10000 };
  var schemas = {
    'recta-real': ['prueba', 'distancia_teorica_m', 'distancia_odometria_m', 'distancia_real_m', 'error_odometrico_pct'],
    'recta-simulacion': ['prueba', 'distancia_teorica_m', 'distancia_odometria_m', 'desviacion_pct'],
    'giro-real': ['prueba', 'referencia_nominal_grados', 'giro_fisico_medido_grados', 'desviacion_grados'],
    'giro-simulacion': ['prueba', 'referencia_nominal_grados', 'giro_acumulado_odom_grados', 'desviacion_grados', 'desviacion_normalizada_pct'],
    mapeo: ['iteracion', 'valida', 'duracion_min', 'distancia_odometria_m', 'cobertura_libre_pct', 'area_libre_m2'],
    metas: ['iteracion', 'metas_generadas', 'abortadas', 'reemplazadas_por_explorador', 'exitosas', 'sin_estado_terminal', 'tiempo_activo_mediano_s'],
    escalon: ['indicador', 'unidad', 'rueda_izquierda', 'rueda_derecha'],
    'serie-control': ['tiempo_s', 'referencia_m_s', 'velocidad_m_s', 'pwm'],
    'estados-metas': ['mensaje', 'meta_id', 'estado', 'aceptada_s']
  };
  /* Estados de action_msgs/GoalStatus. Se aceptan los nombres o sus códigos numéricos. */
  var ESTADOS = { ACCEPTED: 1, EXECUTING: 2, CANCELING: 3, SUCCEEDED: 4, CANCELED: 5, ABORTED: 6 };
  var CODIGOS = Object.keys(ESTADOS).reduce(function (o, k) { o[ESTADOS[k]] = k; return o; }, {});
  A.ESTADOS_META = ESTADOS;
  A.ESQUEMAS = schemas;
  function fail(message) { throw new Error(message); }
  function finite(value, name, row) {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) fail('Fila ' + row + ': ' + name + ' requiere un número con punto decimal.');
    var n = Number(value);
    if (!Number.isFinite(n)) fail('Fila ' + row + ': ' + name + ' no es finito.');
    return n;
  }
  function positive(n, name, row, zero) {
    if (zero ? n < 0 : n <= 0) fail('Fila ' + row + ': ' + name + ' debe ser ' + (zero ? 'no negativo.' : 'positivo.'));
    return n;
  }
  function count(n, name, row, zero) {
    positive(n, name, row, zero);
    if (!Number.isSafeInteger(n)) fail('Fila ' + row + ': ' + name + ' debe ser un entero seguro.');
    return n;
  }
  A.estadistica = function (values) {
    if (!values.length || values.some(function (v) { return !Number.isFinite(v); })) fail('La estadística necesita valores finitos.');
    // Welford evita restar dos sumas grandes casi iguales.
    var mean = 0, m2 = 0;
    values.forEach(function (v, i) { var d = v - mean; mean += d / (i + 1); m2 += d * (v - mean); });
    var out = { n: values.length, media: mean, desviacion: values.length > 1 ? Math.sqrt(Math.max(0, m2) / (values.length - 1)) : null };
    if (!Number.isFinite(out.media) || (out.desviacion !== null && !Number.isFinite(out.desviacion))) fail('Valores fuera del rango numérico calculable.');
    return out;
  };
  A.csv = function (input) {
    if (typeof input !== 'string') fail('Se necesita texto CSV.');
    if (new TextEncoder().encode(input).length > A.MAX_BYTES) fail('El archivo supera 2 MiB.');
    var text = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    var head = text.split('\n')[0], delimiter = head.indexOf(';') >= 0 && head.indexOf(',') < 0 ? ';' : ',';
    var rows = [], row = [], field = '', quoted = false, closed = false;
    function endField() { row.push(field.trim()); field = ''; closed = false; }
    function endRow() {
      endField();
      if (row.some(function (v) { return v !== ''; })) rows.push(row);
      row = [];
      if (rows.length > A.MAX_FILAS + 1) fail('El CSV supera 10 000 filas de datos.');
    }
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') { quoted = false; closed = true; }
        else field += c;
      } else if (c === delimiter) endField();
      else if (c === '\n') endRow();
      else if (c === '"') {
        if (field || closed) fail('Comillas inesperadas en el CSV.');
        quoted = true;
      } else {
        if (closed && !/\s/.test(c)) fail('Texto después de cerrar comillas.');
        if (!closed) field += c;
      }
    }
    if (quoted) fail('El CSV tiene comillas sin cerrar.');
    if (field || row.length || closed) endRow();
    if (rows.length < 2) fail('El CSV necesita encabezados y al menos una fila.');
    var headers = rows.shift();
    if (new Set(headers).size !== headers.length || headers.some(function (h) { return !h; })) fail('Encabezados vacíos o duplicados.');
    rows.forEach(function (r, i) { if (r.length !== headers.length) fail('Fila ' + (i + 2) + ': cantidad de columnas incorrecta.'); });
    return { headers: headers, rows: rows.map(function (r) { var o = Object.create(null); headers.forEach(function (h, i) { o[h] = r[i]; }); return o; }) };
  };
  A.analizar = function (input, options) {
    options = options || {};
    var parsed = A.csv(input), kind = Object.keys(schemas).find(function (id) {
      return schemas[id].length === parsed.headers.length && schemas[id].every(function (k) { return parsed.headers.indexOf(k) >= 0; });
    });
    if (!kind) fail('Encabezados no compatibles. Consulta los formatos admitidos; no se adivinan unidades ni columnas.');
    if (options.tipo && options.tipo !== kind) fail('El formato seleccionado no coincide con los encabezados.');
    var rows = parsed.rows, ids = new Set();
    rows.forEach(function (r, index) {
      var line = index + 2;
      if (kind === 'escalon' || kind === 'estados-metas') return;
      if (kind === 'mapeo' && !/^(si|no)$/.test(r.valida)) fail('Fila ' + line + ': valida debe ser si o no.');
      parsed.headers.forEach(function (key) {
        if (key === 'valida') return;
        if (kind === 'mapeo' && r.valida === 'no' && key !== 'iteracion') {
          if (r[key] !== '') fail('Fila ' + line + ': una corrida no válida debe dejar vacías sus métricas.');
          r[key] = null; return;
        }
        var n = finite(r[key], key, line);
        if (key === 'prueba' || key === 'iteracion') {
          count(n, key, line, false);
          if (ids.has(n)) fail('Fila ' + line + ': identificador repetido.');
          ids.add(n);
        } else if (kind === 'metas' && key !== 'tiempo_activo_mediano_s') count(n, key, line, true);
        else if (key.indexOf('distancia_') === 0 || key === 'area_libre_m2') positive(n, key, line, key !== 'distancia_teorica_m' && key !== 'distancia_real_m');
        else if (key === 'referencia_nominal_grados' || key === 'duracion_min' || key === 'tiempo_activo_mediano_s') positive(n, key, line, false);
        else if (key === 'giro_fisico_medido_grados' || key === 'giro_acumulado_odom_grados' || /^(error_odometrico_pct|desviacion_pct|desviacion_normalizada_pct)$/.test(key)) {
          // Error odométrico puede tener signo; las desviaciones normalizadas son magnitudes.
          if (key !== 'error_odometrico_pct') positive(n, key, line, true);
        } else if (key === 'cobertura_libre_pct' && (n < 0 || n > 100)) fail('Fila ' + line + ': cobertura debe estar entre 0 y 100 %.');
        else if (key === 'tiempo_s') positive(n, key, line, true);
        else if (key === 'pwm' && Math.abs(n) > 255) fail('Fila ' + line + ': PWM debe estar entre −255 y 255.');
        r[key] = n;
      });
      if (kind === 'metas') {
        if (r.reemplazadas_por_explorador > r.abortadas) fail('Fila ' + line + ': reemplazos supera abortadas.');
        if (r.abortadas + r.exitosas + r.sin_estado_terminal !== r.metas_generadas) fail('Fila ' + line + ': los estados no suman las metas generadas.');
      }
    });
    var result = { version: A.VERSION, tipo: kind, filas: rows, metricas: [], reglas: [], limitaciones: [], grafica: null };
    function metric(id, name, value, unit, formula, origin) {
      if (value !== null && !Number.isFinite(value)) fail('Resultado fuera del rango numérico: ' + name);
      result.metricas.push({ id: id, nombre: name, valor: value, unidad: unit, formula: formula, origen: origin || 'Calculado del CSV' });
    }
    function rule(id, finding, condition, value, interpretation, suggestion, limit) {
      result.reglas.push({ id: id, hallazgo: finding, condicion: condition, evidencia: value, interpretacion: interpretation, sugerencia: suggestion, limitacion: limit });
    }
    function stats(key, name, values, unit) {
      var s = A.estadistica(values);
      metric(key + '-media', name + ' · promedio', s.media, unit, 'Σx / n');
      metric(key + '-sd', name + ' · desviación muestral', s.desviacion, unit, '√(Σ(x − promedio)² / (n − 1)); no definida si n < 2');
      return s;
    }
    function bars(title, labels, series, unit) { result.grafica = { titulo: title, etiquetas: labels, series: series, unidad: unit }; }
    var labels = rows.map(function (r) { return String(r.prueba || r.iteracion); });
    if (kind.indexOf('recta-') === 0 || kind.indexOf('giro-') === 0) {
      var isRect = kind.indexOf('recta-') === 0, measured = kind === 'recta-real' || kind === 'giro-real';
      var ref = isRect ? (measured ? 'distancia_real_m' : 'distancia_teorica_m') : 'referencia_nominal_grados';
      var val = isRect ? 'distancia_odometria_m' : (measured ? 'giro_fisico_medido_grados' : 'giro_acumulado_odom_grados');
      var unit = isRect ? 'm' : '°', error = rows.map(function (r) { return r[val] - r[ref]; });
      var rel = rows.map(function (r, i) { return error[i] / r[ref] * 100; });
      var signed = stats('sesgo', 'Diferencia con signo', error, unit);
      stats('absoluto', 'Error absoluto', error.map(Math.abs), unit);
      stats('relativo', 'Diferencia relativa con signo', rel, '%');
      bars(isRect ? 'Odómetro y referencia por repetición' : 'Giro y referencia por repetición', labels, [
        { nombre: isRect ? 'Odómetro' : (measured ? 'Giro físico' : 'Giro odométrico'), valores: rows.map(function (r) { return r[val]; }) },
        { nombre: isRect && measured ? 'Cinta métrica' : 'Referencia nominal', valores: rows.map(function (r) { return r[ref]; }) }
      ], unit);
      if (kind === 'recta-real') {
        stats('tabla', 'Error porcentual declarado en tabla', rows.map(function (r) { return r.error_odometrico_pct; }), '%');
        result.limitaciones.push('El porcentaje de la tabla usa valores previos al redondeo. El recálculo desde distancias redondeadas se informa por separado.');
      }
      if (signed.media !== 0) rule('diferencia-con-signo', 'La diferencia media tiene signo ' + (signed.media > 0 ? 'positivo' : 'negativo'), 'promedio(valor − referencia) ≠ 0', signed.media + ' ' + unit,
        'Describe la dirección media de la diferencia en estas repeticiones; no identifica su causa.', 'Comprobar unidades y referencia; valorar nuevas repeticiones y una calibración independiente.', 'No es una prueba de significancia ni una calibración aplicada al robot.');
      if (!isRect || !measured) result.limitaciones.push(isRect ? 'La referencia es la distancia ordenada, no la pose verdadera de Gazebo. No estima el error odométrico real ni valida una trayectoria.' : 'La comparación es con 360° nominales en el protocolo, no entre una trayectoria odométrica y una referencia física sincronizada.');
      result.limitaciones.push('Son repeticiones resumidas: no se puede reconstruir ni comparar trayectorias temporales.');
    } else if (kind === 'mapeo') {
      var valid = rows.filter(function (r) { return r.valida === 'si'; });
      if (!valid.length) fail('No hay corridas válidas con métricas de mapeo.');
      metric('validas', 'Corridas válidas', valid.length, 'corridas', 'conteo(valida = si)');
      metric('excluidas', 'Corridas excluidas', rows.length - valid.length, 'corridas', 'conteo(valida = no)');
      stats('area', 'Área libre', valid.map(function (r) { return r.area_libre_m2; }), 'm²');
      stats('cobertura', 'Índice de cobertura libre declarado', valid.map(function (r) { return r.cobertura_libre_pct; }), '%');
      stats('duracion', 'Duración', valid.map(function (r) { return r.duracion_min; }), 'min');
      bars('Área libre de corridas válidas', valid.map(function (r) { return String(r.iteracion); }), [{ nombre: 'Área libre', valores: valid.map(function (r) { return r.area_libre_m2; }) }], 'm²');
      if (rows.length !== valid.length) rule('corridas-excluidas', 'Se excluyeron corridas sin mapa', 'valida = no', rows.length - valid.length + ' corridas', 'No se convierten las celdas vacías en ceros.', 'Revisar el motivo de exclusión en el registro autorizado.', 'El CSV no permite reconstruir la corrida excluida.');
      rule('cobertura-denominador', 'La cobertura declarada no es superficie del recinto', 'CSV incluye cobertura_libre_pct sin conteos de celdas', 'Índice: 100 · libres / (libres + desconocidas), según Ec. 5.4 de la guía', 'Se resume el porcentaje declarado; no se recalcula desde una imagen.', 'Comparar mapas con igual resolución, marco y región de interés si se dispone de archivos autorizados.', 'No hay áreas ocupada/desconocida, dimensiones, geometría ni resolución verificable dentro de este CSV.');
      result.limitaciones.push('No se infieren áreas desconocidas ni ocupadas a partir de porcentajes redondeados. No se valida la geometría ni la exactitud del mapa.');
    } else if (kind === 'metas') {
      function sum(key) { return rows.reduce(function (n, r) { return n + r[key]; }, 0); }
      var totals = {}, keys = ['metas_generadas', 'abortadas', 'reemplazadas_por_explorador', 'exitosas', 'sin_estado_terminal'];
      keys.forEach(function (k) { totals[k] = sum(k); if (!Number.isSafeInteger(totals[k])) fail('El total de metas excede el rango entero seguro.'); });
      metric('generadas', 'Metas generadas', totals.metas_generadas, 'metas', 'Σmetas_generadas');
      metric('abortadas', 'Abortadas registradas', totals.abortadas, 'metas', 'Σabortadas');
      metric('reemplazadas', 'Reemplazos documentados', totals.reemplazadas_por_explorador, 'metas', 'Σreemplazadas_por_explorador');
      metric('sin-clasificar', 'Abortadas sin clasificar', totals.abortadas - totals.reemplazadas_por_explorador, 'metas', 'abortadas − reemplazadas');
      metric('exitosas', 'Completadas registradas', totals.exitosas, 'metas', 'Σexitosas');
      metric('sin-terminal', 'Sin estado terminal', totals.sin_estado_terminal, 'metas', 'Σsin_estado_terminal');
      bars('Estados de metas documentados', ['Reemplazadas', 'Abortadas sin clasificar', 'Completadas', 'Sin terminal'], [{ nombre: 'Metas', valores: [totals.reemplazadas_por_explorador, totals.abortadas - totals.reemplazadas_por_explorador, totals.exitosas, totals.sin_estado_terminal] }], 'metas');
      if (totals.reemplazadas_por_explorador) rule('reemplazo-no-fallo', 'Hay abortos explicados por reemplazo', 'reemplazadas_por_explorador > 0', totals.reemplazadas_por_explorador + ' de ' + totals.abortadas + ' abortadas', 'Un reemplazo no demuestra una falla de navegación.', 'Separar evaluación de metas fijas y reemplazos del explorador.', 'Las abortadas restantes no se clasifican automáticamente como fallas.');
      result.limitaciones.push('No se calcula tasa de éxito de navegación con metas reemplazadas. No se promedian las medianas por corrida ni se reconstruyen tiempos totales sin marcas temporales.');
    } else if (kind === 'escalon') {
      var expected = { velocidad_estacionaria_desde_7_s: 'm/s', error_estacionario: 'm/s', tiempo_de_subida_10_a_90: 's', sobreimpulso_maximo: '' };
      if (rows.length !== 4) fail('El resumen del escalón necesita los cuatro indicadores documentados.');
      var seen = new Set(), vals = {}, reference = options.referencia === undefined ? 0.13 : options.referencia;
      if (!Number.isFinite(reference) || reference <= 0) fail('La referencia del escalón debe ser positiva en m/s.');
      rows.forEach(function (r, i) {
        if (!Object.prototype.hasOwnProperty.call(expected, r.indicador) || seen.has(r.indicador)) fail('Indicador del escalón desconocido o repetido.');
        seen.add(r.indicador);
        if (r.unidad !== expected[r.indicador]) fail('Unidad incorrecta para ' + r.indicador + '.');
        if (r.indicador === 'sobreimpulso_maximo') {
          if (!r.rueda_izquierda || !r.rueda_derecha) fail('El indicador cualitativo de sobreimpulso no puede estar vacío.');
        } else {
          ['rueda_izquierda', 'rueda_derecha'].forEach(function (k) {
            r[k] = finite(r[k], k, i + 2);
            if (r.indicador === 'tiempo_de_subida_10_a_90') positive(r[k], k, i + 2, true);
          });
        }
        vals[r.indicador] = r;
      });
      ['rueda_izquierda', 'rueda_derecha'].forEach(function (k) {
        var wheel = k === 'rueda_izquierda' ? 'Izquierda' : 'Derecha';
        var v = vals.velocidad_estacionaria_desde_7_s[k], e = reference - v;
        metric(k + '-vel', wheel + ' · velocidad estacionaria declarada', v, 'm/s', 'dato del CSV, ventana desde 7 s', 'Declarado en tabla');
        metric(k + '-error', wheel + ' · error recalculado', e, 'm/s', 'referencia − velocidad declarada');
        metric(k + '-error-tabla', wheel + ' · error declarado', vals.error_estacionario[k], 'm/s', 'dato del CSV', 'Declarado en tabla');
        metric(k + '-subida', wheel + ' · tiempo de subida declarado', vals.tiempo_de_subida_10_a_90[k], 's', 'dato del CSV, 10 a 90 %', 'Declarado en tabla');
        if (Math.abs(e - vals.error_estacionario[k]) > 0.0005) rule(k + '-inconsistencia', 'Error declarado y recálculo no coinciden', '|referencia − velocidad − error declarado| > 0,0005 m/s', 'Referencia usada: ' + reference + ' m/s', 'La diferencia supera medio paso de la precisión de tres decimales de esta tabla.', 'Confirmar la referencia y los valores antes de interpretar.', 'No se modifica el valor original ni se prueba la estabilidad sin señal temporal.');
      });
      bars('Velocidad estacionaria declarada', ['Izquierda', 'Derecha'], [{ nombre: 'Promedio declarado', valores: [vals.velocidad_estacionaria_desde_7_s.rueda_izquierda, vals.velocidad_estacionaria_desde_7_s.rueda_derecha] }, { nombre: 'Referencia', valores: [reference, reference] }], 'm/s');
      result.limitaciones.push('Sobreimpulso cualitativo: izquierda «' + vals.sobreimpulso_maximo.rueda_izquierda + '»; derecha «' + vals.sobreimpulso_maximo.rueda_derecha + '». No equivale a 0 % medido.');
      result.limitaciones.push('No hay señal temporal: no se recalculan tiempo de establecimiento, sobreimpulso, saturación ni estabilidad. La ventana desde 7 s es declarada en tabla.');
    } else if (kind === 'serie-control') {
      if (rows.length < 5) fail('Se necesitan al menos cinco muestras temporales.');
      rows.forEach(function (r, i) {
        if (i && r.tiempo_s <= rows[i - 1].tiempo_s) fail('Los tiempos deben ser estrictamente crecientes.');
        if (Math.abs(r.referencia_m_s - rows[0].referencia_m_s) > 1e-12) fail('Esta versión necesita una referencia constante; separa los escalones.');
      });
      var r0 = rows[0].referencia_m_s, amplitude = r0 - rows[0].velocidad_m_s;
      if (Math.abs(amplitude) < 1e-12) fail('La señal debe empezar en el inicio del escalón con una amplitud distinta de cero.');
      var errors = rows.map(function (r) { return r.referencia_m_s - r.velocidad_m_s; });
      stats('error-muestras', 'Error entre muestras', errors, 'm/s');
      var overshoot = Math.max(0, Math.max.apply(null, rows.map(function (r) { return (r.velocidad_m_s - r0) / amplitude * 100; })));
      metric('sobreimpulso', 'Sobreimpulso observado', overshoot, '%', 'max(0, (y − referencia) / (referencia − y inicial) · 100)');
      var bandPct = options.bandaPct === undefined ? 2 : options.bandaPct;
      if (!Number.isFinite(bandPct) || bandPct <= 0 || bandPct > 20) fail('La banda debe estar entre 0 y 20 %, sin incluir 0.');
      var band = Math.abs(amplitude) * bandPct / 100, lastOutside = -1;
      errors.forEach(function (e, i) { if (Math.abs(e) > band + 1e-12) lastOutside = i; });
      var first = lastOutside + 1;
      var settled = first < rows.length - 1 ? rows[first].tiempo_s - rows[0].tiempo_s : null;
      metric('establecimiento', 'Establecimiento observado en la ventana', settled, 's', 'primera muestra después de la última fuera de ±' + bandPct + '% de amplitud; requiere al menos dos muestras restantes');
      var saturated = rows.filter(function (r) { return Math.abs(r.pwm) === 255; }).length;
      metric('saturacion', 'Muestras en el tope PWM', saturated / rows.length * 100, '% de muestras', '100 · conteo(|PWM| = 255) / n; no es porcentaje de tiempo');
      // Una ventana numérica estable no basta para certificar el error estacionario físico.
      var tailStart = rows[0].tiempo_s + 0.8 * (rows[rows.length - 1].tiempo_s - rows[0].tiempo_s);
      var tail = rows.filter(function (r) { return r.tiempo_s >= tailStart; });
      if (tail.length >= 3) stats('error-final', 'Error en el 20 % final de tiempo (no certificado estacionario)', tail.map(function (r) { return r.referencia_m_s - r.velocidad_m_s; }), 'm/s');
      bars('Respuesta temporal del archivo', rows.map(function (r) { return String(r.tiempo_s); }), [{ nombre: 'Velocidad', valores: rows.map(function (r) { return r.velocidad_m_s; }) }, { nombre: 'Referencia', valores: rows.map(function (r) { return r.referencia_m_s; }) }], 'm/s');
      result.grafica.temporal = true;
      if (saturated) rule('tope-observado', 'Hay muestras en el límite de PWM', '|PWM| = 255', saturated + ' / ' + rows.length + ' muestras', 'Se observa saturación de la orden aplicada; no demuestra windup.', 'Comparar referencia, orden solicitada y memoria del integrador si existen registros autorizados.', 'La orden solicitada y la memoria interna no están en este CSV.');
      result.limitaciones.push('El usuario debe confirmar que el archivo empieza al aplicar un único escalón y documentar origen, resolución y sensor. Los promedios son entre muestras, sin ponderar por tiempo.');
      result.limitaciones.push('El establecimiento solo describe el intervalo observado y depende del muestreo y la banda. No certifica estabilidad futura ni error estacionario; no interpola entre muestras.');
    }
    else if (kind === 'estados-metas') A.clasificarMetas(rows, options, result, metric, rule, bars);
    result.limitaciones.push('Las reglas son comprobables y limitadas; no identifican causas, no reemplazan al comité ni validan la tesis.');
    return result;
  };
  /* Registro de estados de la acción de navegación: una fila por meta presente en cada mensaje
     de estado. Sigue el procedimiento que describe el Anexo 8.4 de la tesis, implementado aquí
     de forma independiente: agrupar por identificador, tomar el estado terminal con prioridad
     éxito > aborto > cancelación, y clasificar una abortada como reemplazada cuando en algún
     mensaje la meta siguiente ya figura mientras la abortada sigue aceptada o en ejecución. */
  A.clasificarMetas = function (rows, options, result, metric, rule, bars) {
    var metas = Object.create(null), mensajes = Object.create(null), lista = [];
    rows.forEach(function (r, index) {
      var line = index + 2;
      var m = finite(r.mensaje, 'mensaje', line); count(m, 'mensaje', line, true);
      var id = r.meta_id;
      if (!/^[0-9A-Za-z_-]{1,64}$/.test(id)) fail('Fila ' + line + ': meta_id debe tener de 1 a 64 letras, números, guiones o guiones bajos.');
      var e = String(r.estado).trim().toUpperCase();
      if (/^\d+$/.test(e)) { if (!CODIGOS[e]) fail('Fila ' + line + ': código de estado desconocido ' + e + '.'); e = CODIGOS[e]; }
      if (!ESTADOS[e]) fail('Fila ' + line + ': estado desconocido. Usa ACCEPTED, EXECUTING, CANCELING, SUCCEEDED, CANCELED, ABORTED o sus códigos 1 a 6.');
      var t = finite(r.aceptada_s, 'aceptada_s', line); positive(t, 'aceptada_s', line, true);
      if (!metas[id]) { metas[id] = { id: id, aceptada: t, estados: Object.create(null), primerMensaje: m }; lista.push(metas[id]); }
      else if (Math.abs(metas[id].aceptada - t) > 1e-9) fail('Fila ' + line + ': la meta ' + id + ' cambia su tiempo de aceptación.');
      metas[id].estados[e] = true;
      var msg = mensajes[m] = mensajes[m] || Object.create(null);
      if (msg[id]) fail('Fila ' + line + ': la meta ' + id + ' aparece dos veces en el mensaje ' + m + '.');
      msg[id] = e;
      r.mensaje = m; r.estado = e; r.aceptada_s = t;
    });
    lista.sort(function (a, b) { return a.aceptada - b.aceptada || a.primerMensaje - b.primerMensaje; });
    var ACTIVA = { ACCEPTED: 1, EXECUTING: 1 }, nums = Object.keys(mensajes).map(Number);
    var c = { metas: lista.length, ejecutadas: 0, completadas: 0, abortadas: 0, reemplazadas: 0, sinClasificar: 0, canceladas: 0, sinTerminal: 0 }, tiempos = [];
    lista.forEach(function (g, k) {
      var est = g.estados;
      g.terminal = est.SUCCEEDED ? 'SUCCEEDED' : est.ABORTED ? 'ABORTED' : est.CANCELED ? 'CANCELED' : null;
      if (est.EXECUTING) c.ejecutadas++;
      if (g.terminal === 'SUCCEEDED') c.completadas++;
      else if (g.terminal === 'CANCELED') c.canceladas++;
      else if (!g.terminal) c.sinTerminal++;
      else {
        c.abortadas++;
        var sig = lista[k + 1];
        g.reemplazada = !!sig && nums.some(function (m) { var msg = mensajes[m]; return msg[sig.id] && ACTIVA[msg[g.id]]; });
        if (g.reemplazada) { c.reemplazadas++; tiempos.push(sig.aceptada - g.aceptada); } else c.sinClasificar++;
      }
    });
    function mediana(v) { var s = v.slice().sort(function (a, b) { return a - b; }), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; }
    metric('metas', 'Metas únicas', c.metas, 'metas', 'conteo de meta_id distintos');
    metric('mensajes', 'Mensajes de estado', nums.length, 'mensajes', 'conteo de valores distintos de mensaje');
    metric('ejecutadas', 'Llegaron a ejecución', c.ejecutadas, 'metas', 'metas con EXECUTING en algún mensaje');
    metric('completadas', 'Completadas', c.completadas, 'metas', 'estado terminal SUCCEEDED');
    metric('abortadas', 'Abortadas', c.abortadas, 'metas', 'estado terminal ABORTED, sin SUCCEEDED');
    metric('reemplazadas', 'Abortadas por reemplazo', c.reemplazadas, 'metas', 'abortada activa en un mensaje donde ya figura la meta siguiente');
    metric('sin-clasificar', 'Abortadas sin clasificar', c.sinClasificar, 'metas', 'abortadas − reemplazadas');
    metric('canceladas', 'Canceladas', c.canceladas, 'metas', 'estado terminal CANCELED, sin SUCCEEDED ni ABORTED');
    metric('sin-terminal', 'Sin estado terminal', c.sinTerminal, 'metas', 'sin SUCCEEDED, ABORTED ni CANCELED en el registro');
    metric('mediana-activo', 'Tiempo activo mediano de las reemplazadas', mediana(tiempos), 's', 'mediana de (aceptación de la siguiente − aceptación propia). No definida sin reemplazos');
    bars('Estado final de cada meta', ['Completadas', 'Reemplazadas', 'Abortadas sin clasificar', 'Canceladas', 'Sin terminal'], [{ nombre: 'Metas', valores: [c.completadas, c.reemplazadas, c.sinClasificar, c.canceladas, c.sinTerminal] }], 'metas');
    result.metas = lista.map(function (g) { return { meta_id: g.id, aceptada_s: g.aceptada, estado_final: g.terminal || 'sin terminal', reemplazada: g.terminal === 'ABORTED' ? g.reemplazada : null }; });
    if (c.reemplazadas) rule('reemplazo-no-fallo', 'Hay metas abortadas porque llegó la siguiente', 'abortada aún activa cuando ya figura la meta siguiente', c.reemplazadas + ' de ' + c.abortadas + ' abortadas', 'Nav2 informa como abortada la meta que se reemplaza; eso no es una falla de navegación.', 'Para medir éxito, ensayar metas fijas o cancelar la meta en curso antes de enviar otra.', 'No se sabe si las metas reemplazadas habrían llegado a completarse.');
    if (c.sinClasificar) rule('aborto-sin-clasificar', 'Hay abortos que este registro no explica', 'abortada sin mensaje que la muestre activa junto a la siguiente', c.sinClasificar + (c.sinClasificar === 1 ? ' meta' : ' metas'), 'No se cuentan como fallas ni como reemplazos.', 'Revisar el registro de bt_navigator o del controlador alrededor de su aceptación.', 'Una meta que ya aparece abortada en el primer mensaje no puede clasificarse.');
    if (c.sinTerminal) rule('sin-terminal', 'El registro termina con metas activas', 'sin estado terminal', c.sinTerminal + (c.sinTerminal === 1 ? ' meta' : ' metas'), 'Su resultado es desconocido, por ejemplo si el registro se cerró durante una cancelación.', 'Cerrar el registro después de que la última meta informe su estado final.', 'No se completan con supuestos.');
    var periodo = options.periodoExplorador;
    if (periodo && tiempos.length) {
      var med = mediana(tiempos);
      if (Math.abs(med - periodo) <= 0.1 * periodo) rule('periodo-explorador', 'El tiempo activo típico coincide con el período del explorador', '|mediana − período| ≤ 10 % del período', 'mediana ' + med.toFixed(3).replace('.', ',') + ' s y período configurado ' + periodo.toFixed(3).replace('.', ',') + ' s', 'Es compatible con reemplazos periódicos del explorador.', 'Confirmar con el registro del explorador cuándo envía cada meta.', 'La coincidencia no prueba la causa de cada reemplazo.');
    }
    result.limitaciones.push('No se calcula tasa de éxito: las metas reemplazadas y las sin terminal no tienen un resultado propio.');
    result.limitaciones.push('El análisis confía en el orden de los mensajes y en los tiempos de aceptación del archivo. No corrige relojes distintos entre equipos.');
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = A;
  else root.ANALISIS = A;
})(typeof globalThis !== 'undefined' ? globalThis : this);
