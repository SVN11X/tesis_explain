/* Modelos didácticos de selección y carga de trabajo. No ejecutan SLAM Toolbox.
   Sin dependencias ni temporizadores: cada paso lo elige el visitante. */
(function () {
  "use strict";
  var S = window.SLAM_PROCESO = {}, V = window.VISUALES = window.VISUALES || {};
  function fmt(n, d) { return n.toFixed(d == null ? 2 : d).replace(".", ","); }
  var actual = [[0, 0], [.4, 0], [.8, 0], [.8, .4], [.8, .8]];
  S.candidatos = function () {
    return [
      { id: 0, nombre: "Lugar compatible", distancia: .4, reciente: false, puntos: actual.map(function (p) { return [p[0] + .02, p[1]]; }) },
      { id: 5, nombre: "Pasillo parecido", distancia: .45, reciente: false, puntos: [[0, 0], [.4, 0], [.8, 0], [1.1, .4], [1.1, .8]] },
      { id: 11, nombre: "Cadena reciente", distancia: .1, reciente: true, puntos: actual.map(function (p) { return p.slice(); }) },
      { id: 3, nombre: "Lugar lejano", distancia: 3, reciente: false, puntos: actual.map(function (p) { return p.slice(); }) }
    ];
  };
  S.evaluarCandidato = function (id) {
    var c = S.candidatos().filter(function (p) { return p.id === id; })[0];
    if (!c) throw new Error("Candidato inexistente");
    var espacial = c.distancia <= 1 && !c.reciente;
    var rms = Math.sqrt(c.puntos.reduce(function (sum, p, i) { return sum + Math.pow(p[0] - actual[i][0], 2) + Math.pow(p[1] - actual[i][1], 2); }, 0) / actual.length);
    return { candidato: c, espacial: espacial, rms: rms, aceptado: espacial && rms <= .06,
      motivo: c.reciente ? "Pertenece a la cadena reciente" : c.distancia > 1 ? "Fuera del radio de 1 m" : rms > .06 ? "Geometría incompatible" : "Coincidencia aceptada en el modelo" };
  };
  S.candidatosSVG = function (id, estatico) {
    var c = S.evaluarCandidato(id).candidato, X = function (x) { return 45 + x * 220; }, Y = function (y) { return 195 - y * 170; };
    var b = '<svg xmlns="http://www.w3.org/2000/svg" class="mp-svg" viewBox="0 0 340 240" role="img" aria-label="Comparación de cinco pares de puntos en el mismo marco; círculos de la observación actual y cuadrados de la pose ' + id + '">';
    if (estatico) b += '<style>text{font-family:Arial,sans-serif;fill:#1e2632}.mp-bg{fill:white}.mp-border{stroke:#8794a8}.mp-a-f{fill:#004eaa}.mp-b-f{fill:#9a4505}.mp-orange{stroke:#9a4505}</style>';
    b += '<rect class="mp-bg" width="340" height="240"/><path d="M35 20V195H315" class="mp-border" fill="none"/>';
    [0, .5, 1].forEach(function (v) { b += '<text x="' + X(v) + '" y="217" font-size="15" text-anchor="middle">' + fmt(v, 1) + '</text>'; });
    b += '<text x="292" y="235" font-size="15">x · m</text><text x="8" y="18" font-size="15">y · m</text><text x="29" y="63" text-anchor="end" font-size="15">0,8</text>';
    actual.forEach(function (p, i) {
      var q = c.puntos[i];
      b += '<path class="mp-orange" d="M' + X(p[0]) + ' ' + Y(p[1]) + 'L' + X(q[0]) + ' ' + Y(q[1]) + '" fill="none" stroke-width="2"/>';
      b += '<rect class="mp-b-f" x="' + (X(q[0]) - 5) + '" y="' + (Y(q[1]) - 5) + '" width="10" height="10"/>';
      b += '<circle class="mp-a-f" cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4"/>';
    });
    return (b + '</svg>').replace(/<text /g, '<text class="mp-ink" ');
  };
  V["candidatos-slam"] = function (el) {
    var id = 0, fase = 0, labels = ["1 · Filtrar cercanía", "2 · Comparar geometría", "3 · Decidir"];
    el.innerHTML = '<div class="mp-panel"><div class="mp-cases" role="group" aria-label="Observación anterior a comprobar">' + S.candidatos().map(function (c) { return '<button type="button" class="vbtn sec" data-candidato="' + c.id + '" aria-pressed="' + (c.id === id) + '">Pose ' + c.id + ' · ' + c.nombre + '</button>'; }).join('') + '</div>' +
      '<div class="mp-steps" role="group" aria-label="Etapas de selección de cierre">' + labels.map(function (s, i) { return '<button type="button" class="mp-step" data-etapa="' + i + '" aria-pressed="' + (i === 0) + '">' + s + '</button>'; }).join('') + '</div>' +
      '<p class="mp-status" data-filtro></p><div data-geometria><div class="mp-chart"></div><p class="vnota">Círculos: observación actual. Cuadrados: observación anterior. Segmentos: desajuste entre pares ya alineados, en el mismo marco.</p></div>' +
      '<p class="mp-status" data-resultado aria-live="polite"></p><button type="button" class="vbtn sec" data-reset-candidatos>Restablecer ejemplo</button>' +
      '<p class="vnota">Modelo sintético: pose actual 12, radio de 1 m y umbral de 6 cm. El RMS es la raíz del promedio de distancias al cuadrado de cinco pares conocidos; no es una probabilidad. SLAM Toolbox busca el ajuste y aplica sus propios criterios de respuesta y covarianza. Aquí no se ejecuta su detector ni se identifica un cierre del robot.</p></div>';
    function draw() {
      var e = S.evaluarCandidato(id), c = e.candidato;
      el.querySelectorAll('[data-candidato]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-candidato') === id)); });
      el.querySelectorAll('[data-etapa]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-etapa') === fase)); });
      el.querySelector('[data-filtro]').textContent = 'Pose ' + id + ': distancia estimada de ' + fmt(c.distancia) + ' m. ' + (e.espacial ? 'Pasa el filtro espacial.' + (fase === 0 ? ' Falta comprobar su geometría.' : '') : e.motivo + '; se excluye como candidato de cierre.');
      el.querySelector('[data-geometria]').hidden = fase === 0 || !e.espacial;
      el.querySelector('.mp-chart').innerHTML = S.candidatosSVG(id, false);
      var text = fase === 0 ? 'Ser candidato todavía no añade una restricción al grafo.' : !e.espacial ? 'No se intenta el ajuste de cierre: ' + e.motivo.toLowerCase() + '.' : 'Desajuste RMS: ' + fmt(e.rms * 100, 1) + ' cm; umbral ilustrativo: 6 cm.';
      if (fase === 2 && e.espacial) text += e.aceptado ? ' Se acepta el cierre y se puede añadir su restricción al grafo. Optimizar es el paso posterior.' : ' Se rechaza el cierre. El parecido del pasillo y su cercanía no bastan; no se añade una restricción.';
      el.querySelector('[data-resultado]').textContent = text;
    }
    el.addEventListener('click', function (event) {
      var b = event.target.closest('[data-candidato], [data-etapa], [data-reset-candidatos]'); if (!b) return;
      if (b.hasAttribute('data-candidato')) { id = +b.getAttribute('data-candidato'); fase = 0; }
      else if (b.hasAttribute('data-etapa')) fase = +b.getAttribute('data-etapa');
      else { id = 0; fase = 0; }
      draw();
    });
    el.estadoSim = function () { return { fase: fase, evaluacion: S.evaluarCandidato(id) }; }; draw();
  };

  /* Eventos de llegada y finalización en milisegundos. Un servidor, sin filtros
     de entrada; el caso asíncrono omite al llegar ocupado. Es una abstracción. */
  S.cola = function (modo, ahora, duracion) {
    if ((modo !== 'sincrono' && modo !== 'asincrono') || !Number.isFinite(ahora) || ahora < 0 || ahora > 1200 || !Number.isFinite(duracion) || duracion < 50 || duracion > 250) throw new Error('Escenario de cola fuera de rango');
    var esperando = [], terminados = [], omitidos = [], activo = null, llegados = [];
    function iniciar(scan, t) { activo = { id: scan.id, llegada: scan.llegada, inicio: t, fin: t + duracion }; }
    function completar(hasta) {
      while (activo && activo.fin <= hasta) {
        var t = activo.fin; terminados.push(activo); activo = null;
        if (esperando.length) iniciar(esperando.shift(), t);
      }
    }
    for (var t = 0, id = 0; t <= ahora; t += 100, id++) {
      completar(t);
      var scan = { id: id, llegada: t }; llegados.push(scan);
      if (!activo) iniciar(scan, t);
      else if (modo === 'sincrono') esperando.push(scan);
      else omitidos.push(scan);
    }
    completar(ahora);
    return { llegados: llegados, terminados: terminados, activo: activo, esperando: esperando, omitidos: omitidos,
      edadUltimo: terminados.length ? terminados[terminados.length - 1].fin - terminados[terminados.length - 1].llegada : null };
  };
  V["cola-slam"] = function (el) {
    var ahora = 0, duracion = 150;
    el.innerHTML = '<div class="mp-panel"><div class="mp-ranges"><label for="sp-tiempo">Instante del ejemplo · ms<output for="sp-tiempo" data-tiempo></output><input id="sp-tiempo" type="range" min="0" max="1200" step="100" value="0"></label>' +
      '<label for="sp-calculo">Cálculo de un barrido · ms<output for="sp-calculo" data-duracion></output><input id="sp-calculo" type="range" min="50" max="250" step="50" value="150"></label></div>' +
      '<div class="mp-controls"><button type="button" class="vbtn" data-avanzar-cola>Avanzar 100 ms</button><button type="button" class="vbtn sec" data-reset-cola>Restablecer ejemplo</button></div>' +
      '<div class="mp-columns"><article data-cola="sincrono"><h4>Síncrono · conserva la cola</h4><div data-cuentas></div><ol class="sp-barridos" aria-label="Estado de los barridos en el caso síncrono"></ol></article>' +
      '<article data-cola="asincrono"><h4>Asíncrono · omite si está ocupado</h4><div data-cuentas></div><ol class="sp-barridos" aria-label="Estado de los barridos en el caso asíncrono"></ol></article></div>' +
      '<p class="mp-status" data-lectura-cola aria-live="polite"></p><p class="vnota">Llega un barrido cada 100 ms. La finalización en un instante se atiende antes de una llegada simultánea. Los tiempos son supuestos y no incluyen filtros, comunicación, otras tareas ni paralelismo. «Edad al terminar» es el tiempo desde la adquisición hasta que terminó su cálculo, no una medición de latencia de SLAM Toolbox.</p></div>';
    function draw() {
      var a = S.cola('sincrono', ahora, duracion), b = S.cola('asincrono', ahora, duracion);
      [a, b].forEach(function (s, i) {
        var panel = el.querySelector('[data-cola="' + (i ? 'asincrono' : 'sincrono') + '"]');
        panel.querySelector('[data-cuentas]').innerHTML = '<p>Llegaron: <b>' + s.llegados.length + '</b> · Terminados: <b>' + s.terminados.length + '</b><br>Procesándose: <b>' + (s.activo ? 1 : 0) + '</b> · En cola: <b>' + s.esperando.length + '</b> · Omitidos: <b>' + s.omitidos.length + '</b><br>Edad al terminar del último completado: <b>' + (s.edadUltimo == null ? 'sin completar' : s.edadUltimo + ' ms') + '</b></p>';
        panel.querySelector('ol').innerHTML = s.llegados.map(function (scan) {
          var estado = s.terminados.some(function (q) { return q.id === scan.id; }) ? 'terminado' : s.omitidos.some(function (q) { return q.id === scan.id; }) ? 'omitido' : s.activo && s.activo.id === scan.id ? 'en cálculo' : 'en cola';
          return '<li data-estado="' + estado + '"><b>B' + scan.id + '</b> · ' + estado + '</li>';
        }).join('');
      });
      el.querySelector('#sp-tiempo').value = ahora; el.querySelector('#sp-calculo').value = duracion;
      el.querySelector('[data-tiempo]').textContent = ahora + ' ms'; el.querySelector('[data-duracion]').textContent = duracion + ' ms';
      el.querySelector('[data-avanzar-cola]').disabled = ahora >= 1200;
      el.querySelector('[data-lectura-cola]').textContent = 'A los ' + ahora + ' ms: el caso síncrono conserva ' + a.esperando.length + ' barridos esperando y el asíncrono ha omitido ' + b.omitidos.length + '. ' + (duracion <= 100 ? 'En este modelo el cálculo alcanza a terminar antes de la siguiente llegada; no hacen falta omisiones ni cola.' : 'Si el cálculo tarda más que las llegadas, conservar todo acumula espera y omitir pierde observaciones.');
    }
    el.addEventListener('input', function (event) { if (event.target.id === 'sp-tiempo') ahora = +event.target.value; else if (event.target.id === 'sp-calculo') duracion = +event.target.value; else return; draw(); });
    el.addEventListener('click', function (event) { if (event.target.closest('[data-avanzar-cola]')) ahora = Math.min(1200, ahora + 100); else if (event.target.closest('[data-reset-cola]')) { ahora = 0; duracion = 150; } else return; draw(); });
    el.estadoSim = function () { return { ahora: ahora, duracion: duracion, sincrono: S.cola('sincrono', ahora, duracion), asincrono: S.cola('asincrono', ahora, duracion) }; }; draw();
  };
})();
