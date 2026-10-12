/* Presentación del laboratorio. File.text, File.arrayBuffer y SHA-256 locales; solo se
   solicitan tablas y ejemplos de la propia guía. Ninguna fila ni celda se envía, persiste
   ni evalúa como código. */
(function () {
  'use strict';
  var A = window.ANALISIS, AM = window.ANALISIS_MAPA, U = window.U;
  var PARAM = (window.PROYECTO && window.PROYECTO.parametros) || {};
  function start() {
    var controls = document.getElementById('lab-controles');
    if (!controls || !A) return;
    var $ = function (id) { return document.getElementById('lab-' + id); };
    var current = null, result = null, version = 0;
    var fmt = function (n, d) { return n === null ? 'No definido' : n.toLocaleString('es-CL', { maximumFractionDigits: d === undefined ? 5 : d }); };
    /* Decimales de la tarjeta según la unidad; la tabla y el JSON conservan el valor completo. */
    var DECIMALES = { '%': 2, 'm²': 3, 'm': 4, 'm/s': 4, 's': 3, '°': 2, 'm/celda': 4, 'celdas': 0, 'metas': 0, 'corridas': 0, 'mensajes': 0, 'tonos': 0, 'min': 2 };
    function unit(m) { return Math.abs(m.valor) === 1 ? ({ metas: 'meta', corridas: 'corrida' }[m.unidad] || m.unidad) : m.unidad; }
    function status(message) { $('estado').textContent = message; }
    function busy(on) { controls.setAttribute('aria-busy', String(on)); $('exportar').disabled = on || !result; $('recalcular').disabled = on || !current; }
    function clearResult() { result = null; $('resultados').hidden = true; $('exportar').disabled = true; }
    function error(message) { clearResult(); $('error').textContent = message; $('error').hidden = false; status('No se calculó un resultado. Revisa el archivo o las opciones.'); }
    function options() {
      var o = { referencia: Number($('referencia').value), bandaPct: Number($('banda').value) };
      if (PARAM.exploracion && PARAM.exploracion.periodo_efectivo_s) o.periodoExplorador = PARAM.exploracion.periodo_efectivo_s;
      return o;
    }
    async function fingerprint(data) {
      if (!window.crypto || !window.crypto.subtle) return null;
      var digest = await window.crypto.subtle.digest('SHA-256', typeof data === 'string' ? new TextEncoder().encode(data) : data);
      return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    function estadoAcademico() { return window.PROYECTO && window.PROYECTO.academico ? window.PROYECTO.academico.estado : 'desconocido'; }
    /* Criterio de clasificación de grises. Los umbrales de la tesis vienen de datos/parametros.json. */
    function criterioMapa(yaml) {
      if ($('criterio').value === 'yaml') {
        if (!yaml || yaml.occupied_thresh === undefined || yaml.free_thresh === undefined) throw new Error('Para usar los umbrales del YAML, carga un YAML con occupied_thresh y free_thresh, o elige los umbrales de la tesis.');
        return { tipo: 'yaml', occupied_thresh: yaml.occupied_thresh, free_thresh: yaml.free_thresh, negate: yaml.negate || 0 };
      }
      var m = PARAM.mapeo || {};
      return { tipo: 'tesis', libre: m.umbral_libre_pgm || 230, ocupado: m.umbral_ocupado_pgm || 50 };
    }
    function mapOptions() { return { resolucion: Number($('resolucion').value), criterioElegido: $('criterio').value }; }
    async function analyze(data, source, token) {
      var opts, computed, sha;
      if (data.mapa) {
        opts = mapOptions();
        var a = AM.leerPGM(data.mapa.a.bytes), ya = data.mapa.a.yaml ? AM.leerYAML(data.mapa.a.yaml) : null;
        var b = data.mapa.b ? AM.leerPGM(data.mapa.b.bytes) : null, yb = data.mapa.b && data.mapa.b.yaml ? AM.leerYAML(data.mapa.b.yaml) : null;
        var crit = criterioMapa(ya);
        if (b && $('criterio').value === 'yaml') { var cb = criterioMapa(yb); if (cb.occupied_thresh !== crit.occupied_thresh || cb.free_thresh !== crit.free_thresh || cb.negate !== crit.negate) throw new Error('Los YAML declaran umbrales distintos: elige los umbrales de la tesis para clasificar ambos mapas igual.'); }
        computed = b ? AM.compararMapas(a, b, { resolucion: opts.resolucion, yamlA: ya, yamlB: yb, criterio: crit }) : AM.analizarMapa(a, { resolucion: opts.resolucion, yaml: ya, criterio: crit });
        opts.criterio = crit;
        sha = { a: await fingerprint(data.mapa.a.bytes), b: b ? await fingerprint(data.mapa.b.bytes) : null };
        source = Object.assign({}, source, { sha256_pgm_a: sha.a, sha256_pgm_b: sha.b });
      } else {
        opts = options(); computed = A.analizar(data, opts);
        sha = await fingerprint(data);
        source = Object.assign({}, source, { sha256_texto_utf8: sha });
      }
      if (token !== version) return;
      current = { datos: data, fuente: source };
      result = computed;
      result.procedencia = source;
      result.opciones = opts;
      result.estado_academico = estadoAcademico();
      render();
      status('Análisis listo: ' + (data.mapa ? (computed.tipo === 'mapa-pgm' ? 'un mapa' : 'dos mapas') : computed.filas.length + ' filas') + ', formato ' + computed.tipo + '. Revisa los resultados y sus límites.');
      busy(false);
    }
    async function perform(load, source) {
      var token = ++version;
      clearResult(); $('error').hidden = true; busy(true); status('Leyendo y validando los datos…');
      try { var data = await load(); if (token === version) await analyze(data, source, token); }
      catch (e) { if (token === version) { current = null; error(e.message || 'No se pudo analizar el archivo.'); busy(false); } }
    }
    /* Dibujo de mapas: una imagen por píxel de celda, ampliada sin suavizar. Los colores son
       fijos para que el mapa se lea igual en tema claro u oscuro, y se explican en la leyenda. */
    var COLORES_CLASE = [[250, 250, 250], [30, 38, 50], [154, 165, 180]];
    var COLORES_DIF = [[200, 206, 215], [250, 250, 250], [30, 38, 50], [198, 40, 40], [0, 78, 170], [178, 107, 0]];
    function lienzoMapa(ancho, alto, valores, colores, rect, resolucion, etiqueta) {
      var cv = document.createElement('canvas'), escala = Math.max(1, Math.min(6, Math.floor(1200 / Math.max(ancho, alto))));
      cv.width = ancho * escala; cv.height = alto * escala;
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', etiqueta);
      var base = document.createElement('canvas'); base.width = ancho; base.height = alto;
      var bctx = base.getContext('2d'), img = bctx.createImageData(ancho, alto);
      for (var i = 0; i < valores.length; i++) { var c = colores[valores[i]]; img.data[4 * i] = c[0]; img.data[4 * i + 1] = c[1]; img.data[4 * i + 2] = c[2]; img.data[4 * i + 3] = 255; }
      bctx.putImageData(img, 0, 0);
      var ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(base, 0, 0, cv.width, cv.height);
      if (rect) { ctx.strokeStyle = '#004eaa'; ctx.lineWidth = Math.max(2, escala); ctx.setLineDash([6, 4]); ctx.strokeRect(rect.x0 * escala, rect.y0 * escala, rect.ancho * escala, rect.alto * escala); ctx.setLineDash([]); }
      var celdasMetro = 1 / resolucion;
      if (celdasMetro * escala < cv.width * .6) {   // barra de 1 m, si cabe
        var x0 = 10, y0 = cv.height - 12, largo = celdasMetro * escala;
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(x0 - 6, y0 - 22, largo + 40, 30);
        ctx.strokeStyle = '#1e2632'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + largo, y0); ctx.stroke();
        ctx.fillStyle = '#1e2632'; ctx.font = Math.max(12, Math.round(escala * 4)) + 'px sans-serif'; ctx.fillText('1 m', x0 + largo + 6, y0 + 4);
      }
      return cv;
    }
    function leyenda(items) { return '<ul class="lab-mapa-ley">' + items.map(function (it) { return '<li><i style="background:rgb(' + it[0].join(',') + ')"></i>' + U.esc(it[1]) + '</li>'; }).join('') + '</ul>'; }
    function figuraMapa(cv, titulo) { var f = document.createElement('figure'); f.appendChild(cv); var c = document.createElement('figcaption'); c.textContent = titulo; f.appendChild(c); return f; }
    function dibujarMapa() {
      var cont = $('mapa'); cont.textContent = '';
      if (!result || !result.mapa) { cont.hidden = true; return; }
      cont.hidden = false;
      var paneles = document.createElement('div'); paneles.className = 'lab-mapa-paneles';
      var claseLey = leyenda([[COLORES_CLASE[0], 'libre'], [COLORES_CLASE[1], 'ocupada'], [COLORES_CLASE[2], 'desconocida']]);
      if (result.tipo === 'mapa-pgm') {
        var m = result.mapa;
        paneles.appendChild(figuraMapa(lienzoMapa(m.ancho, m.alto, result.clases, COLORES_CLASE, m.rectangulo, m.resolucion, 'Mapa clasificado de ' + m.ancho + ' por ' + m.alto + ' celdas. Los conteos están en la tabla de respaldo.'), 'Mapa clasificado. Trazo azul: rectángulo observado.'));
        cont.appendChild(paneles); cont.insertAdjacentHTML('beforeend', claseLey);
      } else if (result.mapa.celdaACelda) {
        var a = result.mapa.a;
        paneles.appendChild(figuraMapa(lienzoMapa(a.ancho, a.alto, result.diferencias, COLORES_DIF, null, a.resolucion, 'Comparación celda a celda de dos mapas de ' + a.ancho + ' por ' + a.alto + ' celdas. Los conteos por categoría están en la tabla de respaldo.'), 'Comparación celda a celda, en el marco común.'));
        cont.appendChild(paneles);
        cont.insertAdjacentHTML('beforeend', leyenda([[COLORES_DIF[1], 'libre en ambos'], [COLORES_DIF[2], 'ocupada en ambos'], [COLORES_DIF[3], 'libre en uno y ocupada en el otro'], [COLORES_DIF[4], 'observada solo en A'], [COLORES_DIF[5], 'observada solo en B'], [COLORES_DIF[0], 'desconocida en ambos']]));
      } else {
        [['a', 'clasesA', 'Mapa A'], ['b', 'clasesB', 'Mapa B']].forEach(function (k) {
          var mm = result.mapa[k[0]];
          paneles.appendChild(figuraMapa(lienzoMapa(mm.ancho, mm.alto, result[k[1]], COLORES_CLASE, mm.rectangulo, mm.resolucion, k[2] + ' clasificado, ' + mm.ancho + ' por ' + mm.alto + ' celdas.'), k[2] + '. No comparten marco: se muestran por separado.'));
        });
        cont.appendChild(paneles); cont.insertAdjacentHTML('beforeend', claseLey);
      }
    }
    function chart(g) {
      var W = Math.max(260, Math.round($('grafica').clientWidth || 640)), H = 300, left = 68, right = 24, top = 24, bottom = g.temporal ? 45 : 70;
      var flat = g.series.reduce(function (a, s) { return a.concat(s.valores); }, []), min = Math.min(0, ...flat), max = Math.max(0, ...flat);
      if (max === min) max = min + 1;
      var x = function (i) { return left + (i + .5) / g.etiquetas.length * (W - left - right); };
      var y = function (v) { return top + (max - v) / (max - min) * (H - top - bottom); };
      var colors = ['var(--azul)', 'var(--verde-texto)'];
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="lab-svg-title lab-svg-desc"><title id="lab-svg-title">' + U.esc(g.titulo) + '</title><desc id="lab-svg-desc">Valores completos en la tabla de respaldo. Unidad: ' + U.esc(g.unidad) + '. La escala incluye cero; series identificadas por color y trazo.</desc>';
      for (var k = 0; k <= 4; k++) {
        var v = min + (max - min) * k / 4;
        svg += '<line x1="' + left + '" x2="' + (W - right) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line)"/><text x="' + (left - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="13">' + fmt(v) + '</text>';
      }
      if (g.temporal) {
        var times = g.etiquetas.map(Number), t0 = times[0], t1 = times[times.length - 1], X = function (i) { return left + (times[i] - t0) / (t1 - t0) * (W - left - right); };
        g.series.forEach(function (s, j) {
          // El recorte solo reduce puntos del dibujo, nunca el cálculo ni la exportación.
          var stride = Math.max(1, Math.ceil(times.length / 1500)), points = [];
          s.valores.forEach(function (v, i) { if (i % stride === 0 || i === times.length - 1) points.push(X(i) + ',' + y(v)); });
          svg += '<polyline fill="none" stroke="' + colors[j] + '" stroke-width="2.5"' + (j ? ' stroke-dasharray="8 4"' : '') + ' points="' + points.join(' ') + '"/>';
        });
        for (var n = 0; n <= 4; n++) svg += '<text x="' + (left + n / 4 * (W - left - right)) + '" y="' + (H - bottom + 20) + '" text-anchor="middle" font-size="13">' + fmt(t0 + n / 4 * (t1 - t0)) + '</text>';
        svg += '<text x="' + W / 2 + '" y="295" text-anchor="middle" font-size="13">Tiempo · s</text>';
      } else {
        var total = g.etiquetas.length, strideBar = Math.max(1, Math.ceil(total / 30));
        for (var i = 0; i < total; i += strideBar) {
          var width = Math.min(24, (W - left - right) / Math.min(total, 30) / (g.series.length + 1));
          var xb = left + (i / strideBar + .5) / Math.ceil(total / strideBar) * (W - left - right);
          g.series.forEach(function (s, j) { svg += '<rect x="' + (xb + (j - g.series.length / 2) * width) + '" y="' + Math.min(y(0), y(s.valores[i])) + '" width="' + (width - 2) + '" height="' + Math.abs(y(0) - y(s.valores[i])) + '" fill="' + colors[j] + '"' + (j ? ' fill-opacity=".6" stroke="' + colors[j] + '" stroke-dasharray="3 2"' : '') + '/>'; });
          if (Math.ceil(total / strideBar) <= 8) svg += '<text x="' + xb + '" y="' + (H - bottom + 22) + '" text-anchor="middle" font-size="12">' + U.esc(g.etiquetas[i].length > 8 ? String(i + 1) : g.etiquetas[i]) + '</text>';
        }
        svg += '<text x="' + W / 2 + '" y="287" text-anchor="middle" font-size="13">' + (total > 30 ? 'Muestra del gráfico' : 'Repetición / categoría') + '</text>';
      }
      svg += '<text x="' + left + '" y="15" font-size="12">' + U.esc(g.unidad) + '</text></svg>';
      $('grafica').innerHTML = svg;
      $('leyenda').textContent = g.titulo + '. ' + g.series.map(function (s, i) { return s.nombre + (i ? ': verde, trazo discontinuo.' : ': azul, trazo continuo.'); }).join(' ') + (!g.temporal && g.etiquetas.some(function (s) { return s.length > 8; }) ? ' Categorías: ' + g.etiquetas.map(function (s, i) { return (i + 1) + ' = ' + s; }).join('; ') + '.' : '') + (g.temporal && g.etiquetas.length > 1500 ? ' El dibujo reduce puntos para lectura; las métricas usan todas las muestras.' : '');
    }
    function render() {
      $('resultados').hidden = false;
      $('procedencia').textContent = result.procedencia.tipo === 'guia' ? 'Tabla transcrita: ' + result.procedencia.nombre + '. Tesis en revisión. Versión del documento y fecha de los datos pendientes.'
        : result.procedencia.tipo === 'sintetico' ? 'Ejemplo sintético: ' + result.procedencia.nombre + '. No son datos del robot ni de la tesis.'
        : 'Archivo del usuario: ' + result.procedencia.nombre + '. Origen experimental y unidades físicas pendientes de confirmar.';
      $('metricas').innerHTML = result.metricas.map(function (m) { return '<article class="lab-metrica"><h3>' + U.esc(m.nombre) + '</h3><b title="' + U.esc(m.valor === null ? '' : String(m.valor)) + '">' + U.esc(fmt(m.valor, DECIMALES[m.unidad])) + '</b> ' + U.esc(unit(m)) + '<small>' + U.esc(m.formula) + '</small><small>' + U.esc(m.origen) + '</small></article>'; }).join('');
      dibujarMapa();
      chart(result.grafica);
      /* En un registro de metas se muestra una fila por meta; la exportación conserva además las filas de entrada. */
      var filas = result.metas || result.filas, headers = Object.keys(filas[0]);
      var titulo = result.metas ? 'Estado final de cada meta · ' + filas.length + ' metas' : result.mapa ? 'Conteos que respaldan el gráfico' : 'Filas de entrada validadas · ' + filas.length + ' en total';
      $('tabla').innerHTML = '<caption>' + U.esc(titulo) + '</caption><thead><tr>' + headers.map(function (h) { return '<th scope="col">' + U.esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + filas.slice(0, 200).map(function (r) { return '<tr>' + headers.map(function (h, i) { var tag = i ? 'td' : 'th'; var v = r[h]; return '<' + tag + (i ? '' : ' scope="row"') + '>' + U.esc(v === null ? 'Sin dato' : v === true ? 'sí' : v === false ? 'no' : v) + '</' + tag + '>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
      $('filastruncadas').textContent = filas.length > 200 ? 'Vista limitada a las primeras 200 filas. La exportación incluye todas las filas y las métricas usan el archivo completo.' : 'Se muestran todas las filas. Los valores declarados no se sustituyen por sus recálculos.';
      $('reglas').innerHTML = result.reglas.length ? result.reglas.map(function (r) { return '<article class="lab-regla"><h4>' + U.esc(r.hallazgo) + '</h4><dl>' + [['Condición', r.condicion], ['Evidencia', r.evidencia], ['Interpretación', r.interpretacion], ['Sugerencia', r.sugerencia], ['Límite', r.limitacion]].map(function (x) { return '<dt>' + U.esc(x[0]) + '</dt><dd>' + U.esc(x[1]) + '</dd>'; }).join('') + '</dl></article>'; }).join('') : '<p>No se activó una regla adicional. Esto no implica ausencia de problemas ni validación científica.</p>';
      $('limitaciones').innerHTML = result.limitaciones.map(function (s) { return '<li>' + U.esc(s) + '</li>'; }).join('');
    }
    $('cargar').addEventListener('click', function () {
      var name = $('ejemplo').value;
      perform(async function () {
        var response = await fetch('datos/ensayos/' + name, { credentials: 'same-origin' });
        if (!response.ok) throw new Error('No se pudo leer la tabla. Abre el sitio desde un servidor local o GitHub Pages y vuelve a intentar.');
        return response.text();
      }, { tipo: 'guia', nombre: name, ruta: 'datos/ensayos/' + name });
    });
    async function leerTexto(ruta) {
      var response = await fetch(ruta, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('No se pudo leer ' + ruta + '. Abre el sitio desde un servidor local o GitHub Pages.');
      return response.text();
    }
    async function leerBytes(ruta) {
      var response = await fetch(ruta, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('No se pudo leer ' + ruta + '. Abre el sitio desde un servidor local o GitHub Pages.');
      return new Uint8Array(await response.arrayBuffer());
    }
    $('ejemplo-metas').addEventListener('click', function () {
      perform(function () { return leerTexto('datos/ejemplos/estados-metas-sintetico.csv'); }, { tipo: 'sintetico', nombre: 'estados-metas-sintetico.csv', ruta: 'datos/ejemplos/estados-metas-sintetico.csv' });
    });
    $('ejemplo-mapa').addEventListener('click', function () {
      perform(async function () {
        if (!AM) throw new Error('El módulo de mapas no está disponible.');
        return { mapa: {
          a: { bytes: await leerBytes('datos/ejemplos/mapa-sintetico-a.pgm'), yaml: await leerTexto('datos/ejemplos/mapa-sintetico-a.yaml') },
          b: { bytes: await leerBytes('datos/ejemplos/mapa-sintetico-b.pgm'), yaml: await leerTexto('datos/ejemplos/mapa-sintetico-b.yaml') } } };
      }, { tipo: 'sintetico', nombre: 'mapa-sintetico-a.pgm y mapa-sintetico-b.pgm', ruta: 'datos/ejemplos/' });
    });
    $('analizar-mapa').addEventListener('click', function () {
      var fa = $('pgm-a').files && $('pgm-a').files[0];
      if (!fa) { error('Elige primero la imagen PGM del mapa A.'); return; }
      var fya = $('yaml-a').files && $('yaml-a').files[0], fb = $('pgm-b').files && $('pgm-b').files[0], fyb = $('yaml-b').files && $('yaml-b').files[0];
      perform(async function () {
        if (!AM) throw new Error('El módulo de mapas no está disponible.');
        [fa, fb].forEach(function (f) { if (f && f.size > AM.MAX_BYTES) throw new Error('El archivo ' + f.name + ' supera 8 MiB.'); });
        [fya, fyb].forEach(function (f) { if (f && f.size > AM.MAX_YAML) throw new Error('El archivo ' + f.name + ' supera 64 KiB.'); });
        return { mapa: {
          a: { bytes: new Uint8Array(await fa.arrayBuffer()), yaml: fya ? await fya.text() : null },
          b: fb ? { bytes: new Uint8Array(await fb.arrayBuffer()), yaml: fyb ? await fyb.text() : null } : null } };
      }, { tipo: 'usuario', nombre: fa.name + (fb ? ' y ' + fb.name : '') });
    });
    $('archivo').addEventListener('change', function () {
      var file = this.files && this.files[0]; if (!file) return;
      perform(async function () {
        if (file.size > A.MAX_BYTES) throw new Error('El archivo supera 2 MiB.');
        return file.text();
      }, { tipo: 'usuario', nombre: file.name });
    });
    $('recalcular').addEventListener('click', function () { if (current) { var previous = current; perform(function () { return previous.datos; }, previous.fuente); } });
    $('limpiar').addEventListener('click', function () {
      version++; current = null; clearResult(); busy(false); $('error').hidden = true;
      ['archivo', 'pgm-a', 'yaml-a', 'pgm-b', 'yaml-b'].forEach(function (id) { $(id).value = ''; });
      $('referencia').value = referenciaInicial(); $('banda').value = 2; $('resolucion').value = resolucionInicial(); $('criterio').value = 'tesis';
      // Elimina también del DOM los datos, no solo su visibilidad.
      ['metricas', 'grafica', 'leyenda', 'tabla', 'reglas', 'limitaciones', 'procedencia', 'mapa'].forEach(function (id) { $(id).textContent = ''; });
      $('mapa').hidden = true;
      status('Datos limpiados. Elige una tabla o abre otro archivo.');
    });
    $('exportar').addEventListener('click', function () {
      if (!result) return;
      var url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }));
      var a = document.createElement('a'); a.href = url; a.download = 'analisis-' + result.tipo + '.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    function referenciaInicial() { return PARAM.control ? PARAM.control.referencia_m_s : 0.13; }
    function resolucionInicial() { return PARAM.mapeo ? PARAM.mapeo.resolucion_reportada_m : 0.05; }
    $('referencia').value = referenciaInicial(); $('resolucion').value = resolucionInicial();
    U.alCambiarAncho($('grafica'), function () { if (result) chart(result.grafica); });
    if (!AM) { $('analizar-mapa').disabled = true; $('ejemplo-mapa').disabled = true; }
    controls.hidden = false; status('Listo. Elige una tabla de la guía, abre tu archivo CSV o un mapa PGM.');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
