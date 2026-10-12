/* Presentación del laboratorio. File.text y SHA-256 locales; solo se solicitan
   tablas de la propia guía. Ninguna fila se envía, persiste ni evalúa como código. */
(function () {
  'use strict';
  var A = window.ANALISIS, U = window.U;
  function start() {
    var controls = document.getElementById('lab-controles');
    if (!controls || !A) return;
    var $ = function (id) { return document.getElementById('lab-' + id); };
    var current = null, result = null, version = 0;
    var fmt = function (n) { return n === null ? 'No definido' : n.toLocaleString('es-CL', { maximumFractionDigits: 5 }); };
    function unit(m) { return Math.abs(m.valor) === 1 ? ({ metas: 'meta', corridas: 'corrida' }[m.unidad] || m.unidad) : m.unidad; }
    function status(message) { $('estado').textContent = message; }
    function busy(on) { controls.setAttribute('aria-busy', String(on)); $('exportar').disabled = on || !result; $('recalcular').disabled = on || !current; }
    function clearResult() { result = null; $('resultados').hidden = true; $('exportar').disabled = true; }
    function error(message) { clearResult(); $('error').textContent = message; $('error').hidden = false; status('No se calculó un resultado. Revisa el archivo o las opciones.'); }
    function options() { return { referencia: Number($('referencia').value), bandaPct: Number($('banda').value) }; }
    async function fingerprint(text) {
      if (!window.crypto || !window.crypto.subtle) return null;
      var digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    }
    async function analyze(text, source, token) {
      var opts = options(), computed = A.analizar(text, opts);
      var sha = await fingerprint(text);
      if (token !== version) return;
      current = { texto: text, fuente: source };
      result = computed;
      result.procedencia = Object.assign({}, source, { sha256_texto_utf8: sha });
      result.opciones = opts;
      result.estado_academico = window.PROYECTO.academico.estado;
      render();
      status('Análisis listo: ' + computed.filas.length + ' filas, formato ' + computed.tipo + '. Revisa los resultados y sus límites.');
      busy(false);
    }
    async function perform(load, source) {
      var token = ++version;
      clearResult(); $('error').hidden = true; busy(true); status('Leyendo y validando los datos…');
      try { var text = await load(); if (token === version) await analyze(text, source, token); }
      catch (e) { if (token === version) { current = null; error(e.message || 'No se pudo analizar el archivo.'); busy(false); } }
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
      $('procedencia').textContent = result.procedencia.tipo === 'guia' ? 'Tabla transcrita: ' + result.procedencia.nombre + '. Tesis en revisión; versión del documento y fecha de los datos pendientes.' : 'Archivo del usuario: ' + result.procedencia.nombre + '. Origen experimental y unidades físicas pendientes de confirmar.';
      $('metricas').innerHTML = result.metricas.map(function (m) { return '<article class="lab-metrica"><h3>' + U.esc(m.nombre) + '</h3><b>' + U.esc(fmt(m.valor)) + '</b> ' + U.esc(unit(m)) + '<small>' + U.esc(m.formula) + '</small><small>' + U.esc(m.origen) + '</small></article>'; }).join('');
      chart(result.grafica);
      var headers = Object.keys(result.filas[0]);
      $('tabla').innerHTML = '<caption>Filas de entrada validadas · ' + result.filas.length + ' en total</caption><thead><tr>' + headers.map(function (h) { return '<th scope="col">' + U.esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + result.filas.slice(0, 200).map(function (r) { return '<tr>' + headers.map(function (h, i) { var tag = i ? 'td' : 'th'; return '<' + tag + (i ? '' : ' scope="row"') + '>' + U.esc(r[h] === null ? 'Sin dato' : r[h]) + '</' + tag + '>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
      $('filastruncadas').textContent = result.filas.length > 200 ? 'Vista limitada a las primeras 200 filas. La exportación incluye todas las filas y las métricas usan el archivo completo.' : 'Se muestran todas las filas. Los valores declarados no se sustituyen por sus recálculos.';
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
    $('archivo').addEventListener('change', function () {
      var file = this.files && this.files[0]; if (!file) return;
      perform(async function () {
        if (file.size > A.MAX_BYTES) throw new Error('El archivo supera 2 MiB.');
        return file.text();
      }, { tipo: 'usuario', nombre: file.name });
    });
    $('recalcular').addEventListener('click', function () { if (current) { var previous = current; perform(function () { return previous.texto; }, previous.fuente); } });
    $('limpiar').addEventListener('click', function () {
      version++; current = null; clearResult(); busy(false); $('archivo').value = ''; $('error').hidden = true;
      $('referencia').value = window.PROYECTO.parametros.control.referencia_m_s; $('banda').value = 2;
      // Elimina también del DOM los datos, no solo su visibilidad.
      ['metricas', 'grafica', 'leyenda', 'tabla', 'reglas', 'limitaciones', 'procedencia'].forEach(function (id) { $(id).textContent = ''; });
      status('Datos limpiados. Elige una tabla o abre otro archivo.');
    });
    $('exportar').addEventListener('click', function () {
      if (!result) return;
      var url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }));
      var a = document.createElement('a'); a.href = url; a.download = 'analisis-' + result.tipo + '.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    $('referencia').value = window.PROYECTO.parametros.control.referencia_m_s;
    U.alCambiarAncho($('grafica'), function () { if (result) chart(result.grafica); });
    controls.hidden = false; status('Listo. Elige una tabla de la guía o abre tu archivo CSV.');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
