/* Interactivos del control de velocidad. Todas las unidades se muestran en pantalla. */
(function () {
  "use strict";
  var V = window.VISUALES, U = window.U, C = window.CONTROL;
  function f(v, d) { return U.fmt(v, d == null ? 2 : d); }
  function signo(v, d) { return (v > 0 ? "+" : "") + f(v, d); }
  function botones(items, atributo, actual, titulo) {
    return '<div class="chips" role="group" aria-label="' + titulo + '">' + items.map(function (x) {
      return '<button type="button" class="chip" ' + atributo + '="' + x[0] + '" aria-pressed="' + (x[0] === actual) + '">' + x[1] + '</button>';
    }).join("") + '</div>';
  }
  function marcar(el, attr, valor) {
    el.querySelectorAll('[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(valor))); });
  }
  function ruedaBotones() { return botones([["der", "Rueda derecha"], ["izq", "Rueda izquierda"]], "data-rueda", "der", "Rueda del ejemplo"); }
  function pasoBotones() { return '<div class="vctl"><button type="button" class="vbtn sec" data-a="atras">Ciclo anterior</button><button type="button" class="vbtn" data-a="paso">Siguiente ciclo</button><button type="button" class="vbtn sec" data-a="reiniciar">Reiniciar</button></div>'; }
  function tarjetas(items) {
    return '<div class="control-datos">' + items.map(function (x) { return '<div><span>' + x[0] + '</span><b class="num">' + x[1] + '</b><small>' + (x[2] || '') + '</small></div>'; }).join("") + '</div>';
  }
  /* SVG con ejes comunes, etiquetas de unidades y escala explícita. */
  var idGrafico = 0;
  function grafico(cont, o) {
    var W = Math.max(260, cont.clientWidth || 600), H = o.alto || 218, ml = W < 450 ? 47 : 57, mr = 16, mt = 32, mb = 45;
    var x = function (v) { return ml + v / o.xMax * (W - ml - mr); };
    var y = function (v) { return mt + (o.yMax - v) / (o.yMax - o.yMin) * (H - mt - mb); };
    var clip = "control-graf-" + (++idGrafico);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + U.esc(o.alt || o.titulo) + '"><title>' + U.esc(o.alt || o.titulo) + '</title><defs><clipPath id="' + clip + '"><rect x="' + ml + '" y="' + mt + '" width="' + (W - ml - mr) + '" height="' + (H - mt - mb) + '"/></clipPath></defs>';
    s += '<text class="t-m t-b" x="' + (W < 450 ? 8 : ml) + '" y="17">' + U.esc(o.titulo) + '</text>';
    if (o.sombra) s += '<rect class="f-desc" x="' + x(o.sombra[0]) + '" y="' + mt + '" width="' + (x(o.sombra[1]) - x(o.sombra[0])) + '" height="' + (H - mt - mb) + '"/>';
    o.yTicks.forEach(function (v) { s += '<line class="k-linea" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="t-s" x="' + (ml - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + f(v, o.decY || 0) + '</text>'; });
    (o.xTicks || [0, o.xMax / 4, o.xMax / 2, o.xMax * 3 / 4, o.xMax]).forEach(function (v) { s += '<text class="t-s" x="' + x(v) + '" y="' + (H - mb + 18) + '" text-anchor="middle">' + f(v, o.decX || 0) + '</text>'; });
    s += '<text class="t-s" x="' + ((ml + W - mr) / 2) + '" y="' + (H - 7) + '" text-anchor="middle">' + U.esc(o.ejeX) + '</text><g clip-path="url(#' + clip + ')">';
    if (o.limite != null) s += '<line class="k-ink" stroke-dasharray="3 3" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y(o.limite) + '" y2="' + y(o.limite) + '"/>';
    o.series.forEach(function (a) {
      s += '<polyline class="' + a.clase + '" fill="none" stroke-width="2.5"' + (a.discontinua ? ' stroke-dasharray="6 3"' : '') + ' points="' + a.puntos.map(function (p) { return x(p[0]).toFixed(2) + ',' + y(p[1]).toFixed(2); }).join(' ') + '"/>';
      if (a.puntosVisibles) a.puntos.forEach(function (p) { s += '<circle class="' + a.clase + '" fill="var(--surface)" stroke-width="2" r="3" cx="' + x(p[0]) + '" cy="' + y(p[1]) + '"/>'; });
    });
    if (o.cursor != null) s += '<line class="k-ink" stroke-width="1.5" stroke-dasharray="2 3" x1="' + x(o.cursor) + '" x2="' + x(o.cursor) + '" y1="' + mt + '" y2="' + (H - mb) + '"/>';
    return s + '</g></svg>';
  }
  function alAncho(cont, pintar) { pintar(); U.alCambiarAncho(cont, pintar); }

  V.estacionario = function (el) {
    el.innerHTML = '<label class="desl-linea" for="ee-v">Velocidad que queda al estabilizarse <b class="num" data-v></b><input id="ee-v" type="range" min="0.100" max="0.150" step="0.001" value="0.128"></label><div class="ee-barras"></div><div class="ee-res" aria-live="polite"></div><p class="vnota">0,128 m/s es el promedio estacionario de la rueda izquierda en la tesis. Los otros valores que elijas son ejemplos. El error estacionario se evalúa después del arranque, cuando la respuesta ya se estabilizó.</p>';
    function pintar() {
      var v = +el.querySelector('input').value, e = C.REF - v;
      el.querySelector('[data-v]').textContent = f(v, 3) + ' m/s';
      el.querySelector('.ee-barras').innerHTML = '<div class="control-bar"><span>Referencia</span><div><i style="width:' + (C.REF / .15 * 100) + '%"></i></div><b>0,130 m/s</b></div><div class="control-bar"><span>Promedio medido</span><div><i class="barra-med" style="width:' + (v / .15 * 100) + '%"></i></div><b>' + f(v, 3) + ' m/s</b></div>';
      el.querySelector('.ee-res').innerHTML = tarjetas([["Referencia − promedio", '0,130 − ' + f(v, 3) + ' = ' + f(e, 3) + ' m/s', e > 0 ? 'La rueda queda más lenta que lo pedido.' : e < 0 ? 'La rueda queda más rápida que lo pedido.' : 'No queda diferencia en este ejemplo.']]);
    }
    el.addEventListener('input', pintar); pintar();
  };

  V.tiempo = function (el) {
    var hz = 30, k = 1;
    el.innerHTML = botones([[10, "10 Hz"], [30, "30 Hz · robot"], [60, "60 Hz"]], "data-hz", hz, "Frecuencia de cálculo") + '<div class="ti-datos"></div><div class="control-graf ti-graf"></div><div class="vley"><span><i class="lin rojo"></i>continua, valor en cualquier instante</span><span><i class="lin azul"></i>discreta, cálculo y mantenimiento entre muestras</span></div>' + pasoBotones() + '<p class="vestado" aria-live="polite"></p><p class="vnota">Representación de una misma señal PWM de ejemplo. Entre dos cálculos, el Arduino mantiene la última orden; el motor sigue moviéndose. La frecuencia de cálculo del control es distinta de la frecuencia de conmutación del PWM.</p>';
    var cont = el.querySelector('.ti-graf');
    function valor(t) { return 80 + 70 * (1 - Math.exp(-t / 60)); }
    function pintar() {
      var ts = hz === 30 ? 33 : 1000 / hz, xmax = 4 * ts, a = [], b = [];
      for (var i = 0; i <= 200; i++) { var t = i * xmax / 200; a.push([t, valor(t)]); }
      for (var j = 0; j < 4; j++) { b.push([j * ts, valor(j * ts)], [(j + 1) * ts, valor(j * ts)]); }
      b.push([xmax, valor(xmax)]);
      cont.innerHTML = grafico(cont, { titulo: 'Orden al motor · PWM', ejeX: 'Tiempo transcurrido · ms', xMax: xmax, xTicks: [0, ts, 2 * ts, 3 * ts, 4 * ts], decX: hz === 60 ? 1 : 0, yMin: 60, yMax: 160, yTicks: [80, 100, 120, 140, 160], cursor: k * ts, series: [{ clase: 'k-rojo', puntos: a, discontinua: true }, { clase: 'k-azul', puntos: b }], alt: 'Una señal continua suave y la misma señal muestreada, mantenida en escalones entre los cálculos.' });
      el.querySelector('.ti-datos').innerHTML = tarjetas([["Frecuencia nominal", hz + ' Hz', hz + ' cálculos por segundo.'], ["Período ideal · 1/f", f(1000 / hz, 2) + ' ms', 'Tiempo entre cálculos.'], ["Intervalo del dibujo", f(ts, hz === 60 ? 2 : 0) + ' ms', hz === 30 ? '1000/30 se guarda como entero: 33 ms (≈30,30 Hz si el reloj fuera exacto).' : 'En este ejemplo se conserva el período ideal.']]);
      el.querySelector('.vestado').textContent = (k === 1 ? 'Ha pasado 1 intervalo: ' : 'Han pasado ' + k + ' intervalos: ') + f(k * ts, hz === 60 ? 1 : 0) + ' ms desde el inicio. Se lee la medición, se calcula la corrección y se actualiza el PWM. Eso es un ciclo de control.';
      el.querySelector('[data-a=atras]').disabled = k === 0; el.querySelector('[data-a=paso]').disabled = k === 4;
    }
    el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-hz')) { hz = +b.getAttribute('data-hz'); k = 1; marcar(el, 'data-hz', hz); } else if (b.dataset.a === 'paso') k = Math.min(4, k + 1); else if (b.dataset.a === 'atras') k = Math.max(0, k - 1); else if (b.dataset.a === 'reiniciar') k = 0; pintar(); });
    alAncho(cont, pintar);
  };

  V.leyes = function (el) {
    var caso = 'referencia';
    el.innerHTML = botones([["referencia", "Cambia solo la referencia"], ["medicion", "Cambia solo la medición"]], "data-caso", caso, "Qué cambia entre ciclos") + '<div class="ley-entrada"></div><div class="ley-comparar"></div><p class="vnota">Se aísla un PI tradicional (D=0) con coeficientes equivalentes: P=Kd/Ko, I por ciclo=Kp/Ko, en ticks/ciclo. En esta comparación algebraica Ki del firmware=0, sin enteros ni saturación. No son dos ensayos reales.</p>';
    function pintar() {
      var g = C.RUEDAS.der, r0 = caso === 'referencia' ? .10 : .13, r1 = .13, m0 = .10, m1 = caso === 'medicion' ? .11 : .10;
      var dr = (r1 - r0) * C.FACTOR, dm = (m1 - m0) * C.FACTOR, err = (r1 - m1) * C.FACTOR;
      var pNormal = g.Kd / g.Ko * (dr - dm), pUsado = -g.Kd / g.Ko * dm, i = g.Kp / g.Ko * err;
      el.querySelector('.ley-entrada').innerHTML = tarjetas([["Referencia anterior → nueva", f(r0, 2) + ' → ' + f(r1, 2) + ' m/s'], ["Medición anterior → nueva", f(m0, 2) + ' → ' + f(m1, 2) + ' m/s']]);
      el.querySelector('.ley-comparar').innerHTML = '<div class="control-par"><article><h4>PI tradicional · P sobre el error</h4><p>El cambio de P mira <b>Δreferencia − Δmedición</b>.</p><b class="num">' + signo(pNormal) + ' PWM</b><p>Corrección integral: ' + signo(i) + ' PWM.<br>Cambio total: <b>' + signo(pNormal + i) + ' PWM</b>.</p></article><article><h4>Firmware · P sobre la medición</h4><p>El cambio de P mira <b>−Δmedición</b>.</p><b class="num">' + signo(pUsado) + ' PWM</b><p>Corrección integral: ' + signo(i) + ' PWM.<br>Cambio total: <b>' + signo(pUsado + i) + ' PWM</b>.</p></article></div><p class="control-conclusion" aria-live="polite">' + (caso === 'referencia' ? 'La referencia cambia, pero la rueda todavía no: el firmware no añade el salto proporcional de la referencia. Sí comienza a corregir el error mediante su acción integral efectiva.' : 'Con referencia fija, ambos términos proporcionales reaccionan igual al cambio de la medición. Esto no introduce una acción derivativa efectiva en el firmware.') + '</p>';
    }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-caso]'); if (!b) return; caso = b.dataset.caso; marcar(el, 'data-caso', caso); pintar(); }); pintar();
  };

  V.papeles = function (el) {
    var termino = 'Kp', k = 3, rueda = 'der', escenario = 'constante';
    var textos = {
      Kp: ['Suma simple del error', 'Δu = (Kp/Ko) × error actual', 'Cada nuevo error añade otra corrección a la salida. Un error constante produce una rampa de PWM: esa es la acción integral efectiva.'],
      Kd: ['Proporcional a la medición', 'Δu = −(Kd/Ko) × cambio de medición', 'Solo hay corrección si cambia la medición. Al sumar los cambios, la contribución total depende de la medición actual menos la inicial. Si deja de cambiar, esta contribución deja de crecer.'],
      Ki: ['Una segunda acumulación', 'ITerm nuevo = ITerm anterior + Ki × error; Δu = ITerm anterior/Ko', 'Primero se guarda error en ITerm. En el siguiente ciclo se añade ese ITerm a la salida. Con error constante, los incrementos van creciendo: la salida se curva, en vez de subir a ritmo constante.']
    };
    el.innerHTML = botones([["Kp", "Kp · suma el error"], ["Kd", "Kd · resta cambios"], ["Ki", "Ki · acumula dos veces"]], 'data-termino', termino, 'Aislar una ganancia') + ruedaBotones() + botones([["constante", "Error constante de 4 ticks/ciclo"], ["arranque", "La medición alcanza la referencia"]], 'data-escenario', escenario, 'Secuencia de ejemplo') + '<div class="pa-formula"></div><div class="control-graf pa-graf"></div><div class="vley"><span><i class="lin ambar"></i>lo añadido en un solo ciclo · ΔPWM</span><span><i class="lin azul"></i>lo acumulado en la salida · PWM</span></div>' + pasoBotones() + '<div class="pa-datos" aria-live="polite"></div><p class="pa-exp control-conclusion"></p><p class="vnota">Se usan las ganancias finales de la rueda elegida, aislando un término cada vez. Para entender su forma, se conservan decimales y se omiten banda y tope. Cada gráfico ajusta su escala: compara la forma, no la altura entre términos. El interactivo de truncamiento muestra lo que se pierde en el firmware real.</p>';
    var cont = el.querySelector('.pa-graf');
    function pintar() {
      var g = C.RUEDAS[rueda], datos = C.papeles(g, termino, escenario), p = datos[k - 1];
      var min = Math.min(0, p.acumulado, ...datos.map(function (q) { return Math.min(q.delta, q.acumulado); })), max = Math.max(.0001, ...datos.map(function (q) { return Math.max(q.delta, q.acumulado); }));
      var margen = (max - min) * .12; min -= margen; max += margen;
      cont.innerHTML = grafico(cont, { titulo: textos[termino][0] + ' · PWM', ejeX: 'Ciclo de control · 33 ms por intervalo', xMax: 7, xTicks: [1, 3, 5, 7], yMin: min, yMax: max, yTicks: [min, 0, max], decY: termino === 'Ki' ? 3 : 1, cursor: k, series: [{ clase: 'k-ambar', discontinua: true, puntos: datos.slice(0, k).map(function (q) { return [q.ciclo, q.delta]; }), puntosVisibles: true }, { clase: 'k-azul', puntos: datos.slice(0, k).map(function (q) { return [q.ciclo, q.acumulado]; }), puntosVisibles: true }] });
      el.querySelector('.pa-formula').innerHTML = '<p class="control-formula"><b>' + textos[termino][1] + '</b><small>' + g.nombre + ' · ' + termino + '=' + f(g[termino], termino === 'Ki' ? 3 : 2) + ', Ko=50 · referencia 40 ticks/ciclo.</small></p>';
      el.querySelector('.pa-datos').innerHTML = tarjetas([["Ciclo seleccionado", k + ' de 7', 'Medición ' + p.med + '; error ' + p.error + ' ticks/ciclo.'], ["Incremento de este ciclo", signo(p.delta, 4) + ' PWM', termino === 'Ki' ? 'ITerm anterior: ' + f(p.integral, 3) + ' unidades internas.' : 'Cambio de medición: ' + signo(p.cambio, 0) + ' ticks/ciclo.'], ["Contribución acumulada", signo(p.acumulado, 4) + ' PWM', 'Se suman los incrementos desde el primer ciclo.']]);
      el.querySelector('.pa-exp').textContent = textos[termino][2];
      el.querySelector('[data-a=atras]').disabled = k === 1; el.querySelector('[data-a=paso]').disabled = k === 7;
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.termino) { termino = b.dataset.termino; marcar(el, 'data-termino', termino); escenario = termino === 'Kd' ? 'arranque' : 'constante'; marcar(el, 'data-escenario', escenario); k = 3; }
      else if (b.dataset.rueda) { rueda = b.dataset.rueda; marcar(el, 'data-rueda', rueda); }
      else if (b.dataset.escenario) { escenario = b.dataset.escenario; marcar(el, 'data-escenario', escenario); k = 1; }
      else if (b.dataset.a === 'paso') k = Math.min(7, k + 1); else if (b.dataset.a === 'atras') k = Math.max(1, k - 1); else if (b.dataset.a === 'reiniciar') k = 1;
      pintar();
    }); alAncho(cont, pintar);
  };

  V.cancelacion = function (el) {
    var base = 30, n = 3;
    el.innerHTML = botones([[30, "Medición inicial: 30 ticks/ciclo"], [0, "Medición inicial: 0 ticks/ciclo"]], 'data-base', base, 'Medición al inicio') + pasoBotones() + '<ol class="kd-secuencia" aria-label="Mediciones por ciclo"></ol><p class="vnota">Se resta cada medición anterior de la nueva. Los valores interiores tachados se cancelan al sumar; los extremos permanecen.</p><div class="kd-cancelacion" aria-label="Suma de diferencias"></div><div class="kd-datos" aria-live="polite"></div><p class="control-conclusion">Σ(m[k] − m[k−1]) = m[último] − m[inicial]. Por eso la contribución de Kd es proporcional al cambio total de medición respecto del inicio. Solo coincide con la medición actual cuando la inicial es cero.</p><p class="vnota">Ejemplo algebraico con Kd=20,05 y Ko=50 (rueda derecha), sin truncamiento ni saturación. La contribución entra con signo menos: cuando aumenta la medición, reduce el PWM.</p>';
    function pintar() {
      var med = [0, 4, 8, 10, 10, 9].map(function (v) { return v + base; }), r = C.telescopio(med, n, C.RUEDAS.der.Kd / 50);
      el.querySelector('.kd-secuencia').innerHTML = med.map(function (v, i) { return '<li class="' + (i === n ? 'actual' : '') + '"><small>' + (i === 0 ? 'Inicial m[0]' : 'm[' + i + ']') + '</small><b>' + v + '</b><small>ticks/ciclo</small></li>'; }).join('');
      el.querySelector('.kd-cancelacion').innerHTML = r.cambios.map(function (_, i) {
        var j = i + 1;
        return '<span class="kd-par">' + (i ? '+ ' : '') + '(<span class="' + (j < n ? 'cancelado' : 'extremo') + '">' + '<b>' + med[j] + '</b><small>m[' + j + ']</small></span> − <span class="' + (j > 1 ? 'cancelado' : 'extremo') + '">' + '<b>' + med[j - 1] + '</b><small>m[' + (j - 1) + ']</small></span>)</span>';
      }).join('');
      el.querySelector('.kd-datos').innerHTML = tarjetas([["Suma de los cambios", r.cambios.map(function (v) { return signo(v, 0); }).join(' ') + ' = ' + r.suma, 'ticks/ciclo'], ["Solo quedan los extremos", med[n] + ' − ' + base + ' = ' + r.diferencia, 'ticks/ciclo · igual a la suma'], ["Contribución a la salida", f(-20.05 / 50, 3) + ' × ' + r.suma + ' = ' + f(r.pwm, 3) + ' PWM', 'Se resta al PWM de partida.']]);
      el.querySelector('[data-a=atras]').disabled = n === 1; el.querySelector('[data-a=paso]').disabled = n === 5;
    }
    el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-base')) { base = +b.dataset.base; marcar(el, 'data-base', base); } else if (b.dataset.a === 'paso') n = Math.min(5, n + 1); else if (b.dataset.a === 'atras') n = Math.max(1, n - 1); else if (b.dataset.a === 'reiniciar') n = 1; pintar(); }); pintar();
  };

  V.ciclo = function (el) {
    var presets = [
      { id: 'arranque', t: 'Arranque a 0,13 m/s', ref: 40.76, med: 0, ant: 0, salida: 0 },
      { id: 'k', t: '0,13 m/s · comando k', ref: 40.76, med: 40, ant: 40, salida: 146 },
      { id: 'm', t: '0,13 m/s · ROS 2', ref: 40, med: 39, ant: 40, salida: 146 },
      { id: 'giro', t: 'Giro a 0,35 rad/s', ref: 10.32, med: 9, ant: 10, salida: 37 }
    ];
    var rueda = 'der', preset = 'arranque', st = { ref: 40.76, med: 0, ant: 0, salida: 0, integral: 0 };
    el.innerHTML = ruedaBotones() + botones(presets.map(function (p) { return [p.id, p.t]; }), 'data-preset', preset, 'Situación del ciclo') + '<div class="deslizadores"><label for="cy-act">Medición de este ciclo · ticks/ciclo<b class="num" data-v="med"></b><input id="cy-act" type="range" min="0" max="70" step="1" data-k="med"></label><label for="cy-ant">Medición anterior · ticks/ciclo<b class="num" data-v="ant"></b><input id="cy-ant" type="range" min="0" max="70" step="1" data-k="ant"></label><label for="cy-sal">Salida anterior · PWM<b class="num" data-v="salida"></b><input id="cy-sal" type="range" min="-255" max="255" step="1" data-k="salida"></label><label for="cy-i">ITerm anterior · unidades internas<b class="num" data-v="integral"></b><input id="cy-i" type="range" min="0" max="100" step="1" data-k="integral"></label></div><p class="cy-nota vnota"></p><ol class="cy-pasos"></ol><div class="cy-res" aria-live="polite"></div><p class="vnota">Una unidad interna (u.int.) es la escala del numerador, antes de dividir por Ko=50. Así, 50 u.int. corresponden a 1 PWM. Kp, Kd y Ki convierten ticks/ciclo a esta escala; no son ganancias de velocidad en m/s. ITerm se usa antes de actualizarlo.</p>';
    function corte(valor, unidad, dec) { return Math.abs(valor) < 1e-9 ? '<span class="sin-corte">sin pérdida</span>' : '<span class="corte">se pierden ' + f(Math.abs(valor), dec == null ? 3 : dec) + ' ' + unidad + '</span>'; }
    function fila(t, txt, aviso) { return '<li><span class="cy-t">' + t + '</span><span class="cy-c">' + txt + '</span>' + (aviso || '') + '</li>'; }
    function pintar() {
      var g = C.RUEDAS[rueda], r = C.ciclo(g, st), h = '';
      h += fila('Error', f(st.ref) + ' ticks/ciclo − ' + st.med + ' ticks/ciclo = ' + f(r.bruto) + ' ticks/ciclo. Entero: <b>' + r.entero + ' ticks/ciclo</b>.', corte(r.bruto - r.entero, 'ticks/ciclo'));
      h += fila('Banda del error', '|error entero| ' + (r.enBanda ? '≤' : '>') + ' ' + g.banda + ' ticks/ciclo. Error usado: <b>' + r.error + ' ticks/ciclo</b>.');
      h += fila('Kp', f(g.Kp) + ' u.int./(tick/ciclo) × ' + r.error + ' ticks/ciclo = <b>' + f(r.p) + ' u.int.</b>.');
      h += fila('Kd', 'Cambio de medición: ' + st.med + ' − ' + st.ant + ' = ' + r.cambio + ' ticks/ciclo. ' + f(g.Kd) + ' u.int./(tick/ciclo) × ' + r.cambio + ' ticks/ciclo = <b>' + f(r.d) + ' u.int.</b>, que se resta.');
      h += fila('Numerador', f(r.p) + ' − (' + f(r.d) + ') + ITerm ' + st.integral + ' = <b>' + f(r.numerador) + ' u.int.</b>.');
      h += fila('Incremento', f(r.numerador) + ' u.int. ÷ 50 = ' + f(r.deltaReal, 3) + ' PWM. Entero: <b>' + r.delta + ' PWM</b>.', corte(r.deltaReal - r.delta, 'PWM'));
      h += fila('Salida', st.salida + ' PWM + (' + r.delta + ' PWM) = ' + r.pedido + ' PWM. ' + (r.saturado ? 'Se limita y se guarda ' : 'Se guarda ') + '<b>' + r.salida + ' PWM</b>.');
      h += fila('ITerm nuevo', r.saturado ? 'Salida en el tope ±255 PWM: ITerm se conserva en <b>' + st.integral + ' u.int.</b>.' : st.integral + ' u.int. + ' + f(g.Ki, 3) + ' u.int./(tick/ciclo) × ' + r.error + ' ticks/ciclo = ' + f(r.integralReal, 3) + ' u.int. Entero: <b>' + r.integral + ' u.int.</b>. Se usará en el siguiente ciclo.', r.saturado ? '' : corte(r.integralReal - r.integral, 'u.int.'));
      el.querySelector('.cy-pasos').innerHTML = h;
      el.querySelector('.cy-nota').textContent = 'Referencia ' + f(st.ref) + ' ticks/ciclo ≈ ' + f(st.ref / C.FACTOR, 3) + ' m/s. ' + g.nombre + '. Las mediciones son valores de ejemplo. El comando m usa una referencia entera; el comando k del ensayo admite decimales.';
      el.querySelector('.cy-res').innerHTML = tarjetas([["PWM anterior → nuevo", st.salida + ' → ' + r.salida + ' PWM', r.salida === st.salida ? 'La orden al motor no cambia en este ciclo.' : 'El signo del PWM indica el sentido.'], ["Velocidad medida", f(st.med / C.FACTOR, 3) + ' m/s', st.med + ' ticks/ciclo · esta es la medición, no el PWM.']]);
      el.querySelectorAll('[data-v]').forEach(function (b) { var key = b.dataset.v; b.textContent = st[key] + (key === 'med' || key === 'ant' ? ' ticks/ciclo' : key === 'salida' ? ' PWM' : ' u.int.'); });
      el.querySelectorAll('input[data-k]').forEach(function (i) { i.value = st[i.dataset.k]; });
    }
    el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.rueda) { rueda = b.dataset.rueda; marcar(el, 'data-rueda', rueda); } else if (b.dataset.preset) { var p = presets.filter(function (a) { return a.id === b.dataset.preset; })[0]; preset = p.id; st = { ref: p.ref, med: p.med, ant: p.ant, salida: p.salida, integral: 0 }; marcar(el, 'data-preset', preset); } pintar(); });
    el.addEventListener('input', function (e) { if (!e.target.dataset.k) return; st[e.target.dataset.k] = +e.target.value; marcar(el, 'data-preset', ''); pintar(); }); pintar();
  };

  V.truncamiento = function (el) {
    var error = 3, ciclos = 10;
    el.innerHTML = botones([[3, 'Error de 3 ticks/ciclo'], [5, 'Error de 5 ticks/ciclo']], 'data-error', error, 'Ejemplos de truncamiento') + '<div class="deslizadores"><label for="tr-e">Error constante · ticks/ciclo<b class="num" data-v="error"></b><input id="tr-e" type="range" min="0" max="10" step="1" value="3"></label><label for="tr-n">Número de ciclos<b class="num" data-v="ciclos"></b><input id="tr-n" type="range" min="1" max="30" step="1" value="10"></label></div><div class="tr-datos" aria-live="polite"></div><div class="control-graf tr-graf"></div><div class="vley"><span><i class="lin azul"></i>conservando decimales</span><span><i class="lin rojo"></i>cortando cada incremento hacia cero</span></div><p class="vnota">Solo Kp de la rueda derecha, Kp/Ko=16,42/50; medición constante, Kd y Ki sin aporte. Se parte de 0 PWM para comparar la suma, sin simular el movimiento. Un ciclo dura 33 ms: 10 ciclos son 330 ms. La memoria entera no guarda la fracción descartada para otro ciclo.</p>';
    var cont = el.querySelector('.tr-graf');
    function pintar() {
      var delta = 16.42 / 50 * error, entero = Math.trunc(delta), a = [], b = [], max = Math.max(1, Math.ceil(delta * ciclos * 1.1));
      for (var k = 0; k <= ciclos; k++) { a.push([k, delta * k]); b.push([k, entero * k]); }
      cont.innerHTML = grafico(cont, { titulo: 'PWM acumulado desde cero', ejeX: 'Ciclos de control · 33 ms cada uno', xMax: ciclos, yMin: 0, yMax: max, yTicks: [0, max / 2, max], decY: 1, decX: 1, series: [{ clase: 'k-azul', puntos: a }, { clase: 'k-rojo', puntos: b, discontinua: true }] });
      el.querySelector('.tr-datos').innerHTML = tarjetas([["En un ciclo", f(delta, 3) + ' → ' + entero + ' PWM', f(delta - entero, 3) + ' PWM se descartan cada vez.'], ["Con decimales · después de " + ciclos + " ciclos", f(delta * ciclos, 3) + ' PWM'], ["Con enteros · después de " + ciclos + " ciclos", entero * ciclos + ' PWM', ciclos * 33 + ' ms transcurridos.']]);
      el.querySelector('[data-v=error]').textContent = error + ' ticks/ciclo'; el.querySelector('[data-v=ciclos]').textContent = ciclos + ' ciclos · ' + ciclos * 33 + ' ms';
      el.querySelector('#tr-e').value = error;
    }
    el.addEventListener('input', function (e) { if (e.target.id === 'tr-e') { error = +e.target.value; marcar(el, 'data-error', error); } else if (e.target.id === 'tr-n') ciclos = +e.target.value; pintar(); });
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-error]'); if (!b) return; error = +b.dataset.error; marcar(el, 'data-error', error); pintar(); }); alAncho(cont, pintar);
  };

  V.acumulador = function (el) {
    var n = 30, rueda = 'der';
    el.innerHTML = ruedaBotones() + '<label class="desl-linea" for="aw-n">Ciclos con la rueda bloqueada <b class="num" data-v></b><input id="aw-n" type="range" min="1" max="90" step="1" value="30"></label><div class="aw-par" aria-live="polite"></div><p class="vnota">Referencia 0,13 m/s y velocidad 0 m/s desde el inicio de este ejemplo. En el PID tradicional se fija D=0 (PI) y se usan P e I equivalentes, sin antiwindup. El firmware usa sus ganancias finales y cortes enteros. Es una demostración de memoria durante el bloqueo, no un ensayo del robot.</p>';
    function pintar() {
      var g = C.RUEDAS[rueda], r = C.bloqueo(g, n), a = r.tradicional, b = r.firmware;
      el.querySelector('[data-v]').textContent = n + ' ciclos · ' + n * 33 + ' ms';
      el.querySelector('.aw-par').innerHTML = '<div class="control-par"><article><h4>PID tradicional · sin antiwindup</h4><p>La memoria integral sigue sumando el error aunque el PWM aplicado no pueda subir más.</p>' + tarjetas([["Pedido interno", f(a.pedido, 1) + ' PWM'], ["Aplicado al motor", f(a.aplicado, 0) + ' PWM'], ["Memoria integral", f(a.integral, 1) + ' PWM', 'Habrá que descargar esta acumulación al liberar la rueda.']]) + '</article><article><h4>Firmware · con sus topes</h4><p>La salida guardada nunca supera ±255. ITerm deja de actualizarse cuando se toca el tope.</p>' + tarjetas([["Candidato antes del tope", b.pedido + ' PWM'], ["Aplicado y guardado", b.aplicado + ' PWM'], ["ITerm guardado", b.integral + ' u.int.', b.saturado ? 'Congelado: el exceso de la salida se descarta.' : 'Todavía no se alcanza el tope.']]) + '</article></div>';
    }
    el.addEventListener('input', function (e) { n = +e.target.value; pintar(); }); el.addEventListener('click', function (e) { var b = e.target.closest('[data-rueda]'); if (!b) return; rueda = b.dataset.rueda; marcar(el, 'data-rueda', rueda); pintar(); }); pintar();
  };

  V.windup = function (el) {
    var duracion = 3, rueda = 'der', proteger = false, instante = 3, datos;
    el.innerHTML = ruedaBotones() + '<div class="deslizadores"><label for="wu-l">Duración del bloqueo<b class="num" data-v="duracion"></b><input id="wu-l" type="range" min="1" max="4" step="1" value="3"></label><label for="wu-t">Instante que quieres inspeccionar<b class="num" data-v="instante"></b><input id="wu-t" type="range" min="0" max="12" step="0.033" value="3"></label></div><div class="casillas"><label><input type="checkbox" id="wu-aw">Agregar antiwindup al PID tradicional</label></div>' + botones([['antes', 'Antes del bloqueo'], ['bloqueo', 'Durante el bloqueo'], ['liberar', 'Al liberar'], ['final', 'Al final']], 'data-fase', 'bloqueo', 'Inspeccionar un momento') + '<div class="wu-estado control-conclusion" aria-live="polite"></div><div class="wu-g control-graf"></div><div class="vley"><span><i class="lin rojo"></i>PID tradicional · D=0</span><span><i class="lin azul"></i>firmware de este capítulo</span><span><i class="cu gris"></i>intervalo de bloqueo</span><span><i class="lin-disc"></i>referencia o tope, según el panel</span></div><div class="wu-datos"></div><div class="wu-res"></div><p class="vnota">Simulación ilustrativa: modelos FOPDT y ganancias finales de la tabla de esta página, a 33 ms, referencia 0,13 m/s (comando k), PWM entre −255 y 255. Encoder aproximado al tick más cercano; el bloqueo y la liberación se imponen al modelo. El PID tradicional se deja en PI (D=0) con P e I efectivos equivalentes para aislar el windup. El firmware conserva Ki, enteros y bandas; por eso las curvas no son iguales ni se prometen los resultados del ensayo real. Activar antiwindup muestra que un PID tradicional también puede protegerse.</p>';
    var cont = el.querySelector('.wu-g');
    function pintar() {
      datos = C.windup(rueda, duracion, proteger);
      var a = datos.tradicional, b = datos.firmware;
      function series(campo) { return [{ clase: 'k-rojo', discontinua: true, puntos: a.map(function (p) { return [p.t, p[campo]]; }) }, { clase: 'k-azul', puntos: b.map(function (p) { return [p.t, p[campo]]; }) }]; }
      var reqMax = Math.max(255, ...a.map(function (p) { return p.pedido; }), ...b.map(function (p) { return p.pedido; }));
      var reqMin = Math.min(0, ...a.map(function (p) { return p.pedido; }), ...b.map(function (p) { return p.pedido; }));
      var techo = Math.ceil(reqMax / 255) * 255, piso = reqMin < 0 ? -255 : 0;
      var comun = { xMax: 12, xTicks: [0, 3, 6, 9, 12], ejeX: 'Tiempo desde el arranque · s', sombra: [1.5, datos.liberacion], cursor: instante, alto: 225 };
      cont.innerHTML = '<p class="control-panel-exp"><b>1. Lo que observas:</b> la velocidad de la rueda, en m/s. La línea de referencia es 0,13 m/s.</p>' + grafico(cont, Object.assign({}, comun, { titulo: 'Velocidad · m/s', yMin: -.05, yMax: .26, yTicks: [0, .065, .13, .195, .26], decY: 3, limite: .13, series: series('velocidad') })) +
        '<p class="control-panel-exp"><b>2. Lo que calcula el controlador:</b> el PWM pedido antes de limitarlo. Una petición de 1000 PWM no implica que el motor reciba 1000: el tope sigue siendo 255.</p>' + grafico(cont, Object.assign({}, comun, { titulo: 'Pedido interno · PWM', yMin: piso, yMax: techo, yTicks: piso < 0 ? [piso, 0, 255, techo] : [0, 255, techo], limite: 255, series: series('pedido') })) +
        '<p class="control-panel-exp"><b>3. Lo que recibe el motor:</b> el PWM aplicado después del tope, limitado a ±255. Su signo indica el sentido.</p>' + grafico(cont, Object.assign({}, comun, { titulo: 'Orden aplicada · PWM', yMin: -255, yMax: 285, yTicks: [-255, 0, 255], limite: 255, series: series('aplicado') }));
      var idx = Math.min(a.length - 1, Math.round(instante / C.TS)), pa = a[idx], pb = b[idx];
      el.querySelector('.wu-estado').textContent = 'Instante ' + f(pa.t, 2) + ' s: ' + (pa.trabada ? 'la rueda está bloqueada y su velocidad se fuerza a cero. El error persiste, aunque el motor llegue a su tope.' : pa.t >= datos.liberacion ? 'la rueda ya está libre. Observa cuánto tarda cada orden en bajar del tope.' : 'la rueda gira antes del bloqueo, que comienza a los 1,5 s.');
      el.querySelector('.wu-datos').innerHTML = tarjetas([["Tradicional · velocidad", f(pa.velocidad, 3) + ' m/s', 'Pedido ' + f(pa.pedido, 1) + ' PWM → aplicado ' + f(pa.aplicado, 1) + ' PWM.'], ["Firmware · velocidad", f(pb.velocidad, 3) + ' m/s', 'Pedido ' + pb.pedido + ' PWM → aplicado ' + pb.aplicado + ' PWM.']]);
      var maxA = Math.max(...a.filter(function (p) { return p.t >= datos.liberacion; }).map(function (p) { return p.velocidad; })), maxB = Math.max(...b.filter(function (p) { return p.t >= datos.liberacion; }).map(function (p) { return p.velocidad; }));
      el.querySelector('.wu-res').innerHTML = tarjetas([["Pico tras liberar · tradicional", f(maxA, 3) + ' m/s', 'Sobre la referencia: ' + f(Math.max(0, maxA - C.REF), 3) + ' m/s.'], ["Pico tras liberar · firmware", f(maxB, 3) + ' m/s', 'Limitar la memoria reduce el windup; no garantiza cero sobreimpulso.']]);
      el.querySelector('[data-v=duracion]').textContent = duracion + ' s'; el.querySelector('[data-v=instante]').textContent = f(instante, 2) + ' s'; el.querySelector('#wu-t').value = instante;
    }
    el.addEventListener('input', function (e) { if (e.target.id === 'wu-l') { duracion = +e.target.value; var fase = el.querySelector('[data-fase][aria-pressed=true]'); if (fase) instante = { antes: 1.2, bloqueo: 1.5 + duracion / 2, liberar: 1.5 + duracion + .3, final: 11.9 }[fase.dataset.fase]; } else if (e.target.id === 'wu-t') { instante = +e.target.value; marcar(el, 'data-fase', ''); } else return; pintar(); });
    el.querySelector('#wu-aw').addEventListener('change', function (e) { proteger = e.target.checked; pintar(); });
    el.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.dataset.rueda) { rueda = b.dataset.rueda; marcar(el, 'data-rueda', rueda); } else if (b.dataset.fase) { instante = { antes: 1.2, bloqueo: 1.5 + duracion / 2, liberar: 1.5 + duracion + .3, final: 11.9 }[b.dataset.fase]; marcar(el, 'data-fase', b.dataset.fase); } pintar(); }); alAncho(cont, pintar);
  };

  V.zonas = function (el) {
    var pwm = 30, umbral = 60, error = 2, rueda = 'der';
    el.innerHTML = '<h4 class="vsub">A. Zona muerta del conjunto driver y motor</h4><p>Hay señal PWM, pero el motor no vence el roce. La entrada de este gráfico es PWM; la salida es velocidad.</p><div class="deslizadores"><label for="zm-p">PWM aplicado<b class="num" data-v="pwm"></b><input id="zm-p" type="range" min="0" max="255" step="1" value="30"></label><label for="zm-u">Umbral supuesto · PWM<b class="num" data-v="umbral"></b><input id="zm-u" type="range" min="0" max="100" step="1" value="60"></label></div><div class="control-graf zm-graf"></div><p class="zm-estado control-conclusion" aria-live="polite"></p><p class="vnota">60 PWM es un umbral de ejemplo ajustable: no se midió ese valor en el robot. Se ilustra v=0,000890 × máximo(0, PWM−umbral), en m/s. Esa curva no es el modelo FOPDT identificado ni una curva medida del driver.</p><h4 class="vsub">B. Banda muerta del error en el firmware</h4><p>Aquí la rueda sí puede girar. El software decide tratar errores pequeños como cero para evitar correcciones continuas por pocos ticks.</p>' + ruedaBotones() + '<label class="desl-linea" for="zm-e">Error entero antes de la banda · ticks/ciclo<b class="num" data-v="error"></b><input id="zm-e" type="range" min="-6" max="6" step="1" value="2"></label><div class="zm-banda"></div><p class="vnota">Derecha: |error|≤1 tick/ciclo. Izquierda: |error|≤2 ticks/ciclo. Esta banda actúa sobre el término del error; Kd todavía puede reaccionar si cambia la medición. No es la fricción del motor.</p>';
    var cont = el.querySelector('.zm-graf');
    function pintar() {
      var velocidad = C.RUEDAS.der.K * Math.max(0, pwm - umbral), banda = C.RUEDAS[rueda].banda, usado = Math.abs(error) <= banda ? 0 : error;
      cont.innerHTML = grafico(cont, { titulo: 'Respuesta de ejemplo · m/s', ejeX: 'Entrada al motor · PWM', xMax: 255, xTicks: [0, 85, 170, 255], yMin: 0, yMax: .24, yTicks: [0, .08, .16, .24], decY: 2, sombra: [0, umbral], cursor: pwm, series: [{ clase: 'k-azul', puntos: [[0, 0], [umbral, 0], [255, .000890 * (255 - umbral)]] }] });
      el.querySelector('.zm-estado').textContent = pwm + ' PWM aplicados → ' + f(velocidad, 3) + ' m/s en este ejemplo. ' + (pwm <= umbral ? 'Dentro de la zona sombreada: la rueda no se mueve.' : 'Fuera de la zona muerta: la rueda empieza a responder.');
      el.querySelector('.zm-banda').innerHTML = '<div class="banda-celdas" aria-label="Error antes y después de la banda">' + Array.from({ length: 13 }, function (_, i) { var e = i - 6; return '<div class="' + (Math.abs(e) <= banda ? 'dentro ' : '') + (e === error ? 'elegido' : '') + '"><b>' + e + '</b><small>→ ' + (Math.abs(e) <= banda ? 0 : e) + '</small></div>'; }).join('') + '</div>' + tarjetas([["Error antes → después", error + ' → ' + usado + ' ticks/ciclo', 'Banda de ±' + banda + ' ticks/ciclo ≈ ±' + f(banda / C.FACTOR, 4) + ' m/s.']]);
      ['pwm', 'umbral', 'error'].forEach(function (key) { el.querySelector('[data-v=' + key + ']').textContent = { pwm: pwm, umbral: umbral, error: error }[key] + (key === 'error' ? ' ticks/ciclo' : ' PWM'); });
    }
    el.addEventListener('input', function (e) { if (e.target.id === 'zm-p') pwm = +e.target.value; else if (e.target.id === 'zm-u') umbral = +e.target.value; else if (e.target.id === 'zm-e') error = +e.target.value; pintar(); });
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-rueda]'); if (!b) return; rueda = b.dataset.rueda; marcar(el, 'data-rueda', rueda); pintar(); }); alAncho(cont, pintar);
  };

  V.pso = function (el) {
    var h = '<p class="vnota">Cada par compara la misma ganancia y la misma rueda: PSO en gris, ajuste final en azul. Kp y Kd usan una escala común de 0 a 40; Ki necesita su propia escala, de 0 a 0,075. Las etiquetas muestran el valor exacto aunque la barra sea diminuta.</p><div class="ganancias-pares">';
    C.GANANCIAS.forEach(function (g) {
      ['izq', 'der'].forEach(function (rueda) {
        var valores = g[rueda], cambio = (valores[1] / valores[0] - 1) * 100, max = g.nombre === 'Ki' ? .075 : 40;
        var decFinal = g.nombre === 'Ki' ? 3 : 2;
        h += '<article class="ganancia-par"><h4>' + g.nombre + ' · ' + (rueda === 'izq' ? 'izquierda' : 'derecha') + '</h4><p class="ganancia-valores"><span>PSO <b class="num">' + f(valores[0], g.dec) + '</b></span><span aria-hidden="true">→</span><span>Final <b class="num">' + f(valores[1], decFinal) + '</b></span><strong>' + (g.nombre === 'Ki' ? '×' + f(valores[1] / valores[0], 0) : signo(cambio, 1) + ' %') + '</strong></p><div class="ganancia-pistas" aria-hidden="true"><div><i class="antes" style="width:' + valores[0] / max * 100 + '%"></i></div><div><i class="despues" style="width:' + valores[1] / max * 100 + '%"></i></div></div></article>';
      });
    });
    el.innerHTML = h + '</div><p class="vnota">Ko se mantuvo en 50 en ambas ruedas. Las ganancias son de la escala interna del firmware, no de un PID convencional en m/s.</p><div class="comparar tres"><div><b>Una búsqueda necesita un modelo suficiente</b><span>El modelo usado no incluía la zona muerta ni los cortes enteros. Un buen costo simulado no aseguraba la misma respuesta física.</span></div><div><b>El ajuste se comprobó en el robot</b><span>Los ensayos permitieron corregir la detención de la derecha y acercar la izquierda a la referencia. La validación viene de esas capturas.</span></div><div><b>El alcance sigue siendo una sola velocidad</b><span>No se comparó con las ganancias originales ni se validaron otros puntos de operación. No se puede afirmar superioridad general o ahorro de tiempo.</span></div></div>';
  };

  V.resolucion = function (el) {
    var caso = 'recta', real = .132;
    el.innerHTML = '<h4 class="vsub">1. ¿Cuántos ticks caben en un ciclo?</h4>' + botones([['recta', 'Recta · 0,13 m/s · ensayada'], ['giro', 'Giro · 0,35 rad/s · estimación']], 'data-caso', caso, 'Punto de operación') + '<div class="re-ticks"></div><div class="re-datos"></div><p class="vnota">Conversión usada: ticks/ciclo = velocidad de rueda × 313,56. En el giro sobre el eje, |v|=0,35 rad/s × 0,188 m / 2 ≈0,0329 m/s. Las ruedas llevan sentidos opuestos. Se muestran magnitudes para comparar la resolución; el control del giro no se validó con este ensayo.</p><h4 class="vsub">2. Contar ticks y publicar decimales son dos límites distintos</h4><div class="control-par"><article><h4>Encoder durante el ciclo</h4><b class="num">1 tick/ciclo ≈0,00319 m/s</b><p>Es el escalón de la velocidad estimada a partir del conteo. No es el paso del dato publicado.</p></article><article><h4>Dato de velocidad registrado</h4><b class="num">0,01 m/s por paso</b><p>Al escribir dos decimales, se pierde información adicional. El promedio posterior no recupera los valores descartados.</p></article></div><label class="desl-linea" for="re-v">Velocidad de ejemplo antes de escribir dos decimales<b class="num" data-v></b><input id="re-v" type="range" min="0.115" max="0.144" step="0.001" value="0.132"></label><div class="re-registro" aria-live="polite"></div><p class="vnota">Esta entrada es un ejemplo de redondeo del registro, no una captura real ni una simulación del conteo. Por ejemplo, 0,132 m/s se escribe como 0,13 m/s: un exceso de 0,002 m/s puede quedar oculto. Otros valores pequeños sí pueden cruzar al siguiente escalón.</p><h4 class="vsub">3. ¿Cómo puede un promedio dar 0,128 si se registran dos decimales?</h4><p>Estas diez muestras son un ejemplo que produce el mismo promedio informado para la izquierda; no reconstruyen la serie original.</p><ol class="re-muestras" aria-label="Diez muestras de ejemplo"></ol><p class="control-formula">(8 × 0,13 + 2 × 0,12) / 10 = <b>0,128 m/s</b><small>Un promedio entre dos escalones. No equivale a haber medido cada muestra con tres decimales.</small></p>';
    function pintar() {
      var v = caso === 'recta' ? .13 : .35 * .188 / 2, ticks = v * C.FACTOR, enviado = Math.trunc(ticks), escrito = C.registro(real);
      el.querySelector('.re-ticks').innerHTML = '<div class="ticks-contados" aria-label="' + enviado + ' ticks enteros de referencia">' + Array.from({ length: 45 }, function (_, i) { return '<i class="' + (i < enviado ? 'lleno' : '') + '" aria-hidden="true"></i>'; }).join('') + '</div><p class="vnota">Cada casilla azul equivale a 1 tick/ciclo en la referencia entera del comando m. El total es <b>' + enviado + '</b>; la conversión antes de truncar da <b>' + f(ticks) + '</b>.</p>';
      el.querySelector('.re-datos').innerHTML = tarjetas([["Velocidad por rueda", f(v, 4) + ' m/s', caso === 'recta' ? 'Referencia ensayada.' : 'Estimación del giro, no ensayo de control.'], ["Banda de 1 tick · derecha", f(100 / enviado, 1) + ' % de la referencia entera', '1 tick/ciclo del error se trata como cero.'], ["Banda de 2 ticks · izquierda", f(200 / enviado, 1) + ' % de la referencia entera', 'Al bajar los ticks pedidos, la misma banda pesa más.']]);
      el.querySelector('[data-v]').textContent = f(real, 3) + ' m/s';
      el.querySelector('.re-registro').innerHTML = '<div class="registro-bins">' + [.12, .13, .14].map(function (b) { return '<div class="' + (Math.abs(b - escrito) < 1e-8 ? 'activo' : '') + '"><small>Desde ' + f(b - .005, 3) + ' hasta &lt;' + f(b + .005, 3) + '</small><b>se registra ' + f(b, 2) + ' m/s</b></div>'; }).join('') + '</div>' + tarjetas([["Antes de escribir", f(real, 3) + ' m/s'], ["Después · dos decimales", f(escrito, 2) + ' m/s', 'Diferencia descartada: ' + signo(real - escrito, 3) + ' m/s.']]);
      el.querySelector('.re-muestras').innerHTML = [.13, .12, .13, .13, .13, .13, .12, .13, .13, .13].map(function (v, i) { return '<li><small>' + (i + 1) + '</small><b>' + f(v, 2) + '</b></li>'; }).join('');
    }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-caso]'); if (!b) return; caso = b.dataset.caso; marcar(el, 'data-caso', caso); pintar(); }); el.addEventListener('input', function (e) { real = +e.target.value; pintar(); }); pintar();
  };

  /* El protocolo serial y la ley */
  V.protocolo = function (el) {
    el.innerHTML =
      '<div class="proto">' +
      '<div class="equipo"><span class="eyebrow">Raspberry Pi 4</span><div class="caja"><b>diffdrive_arduino</b><small>arduino_comms.cpp</small></div><p class="gris-txt">setPidValues existe, pero nunca se llama</p></div>' +
      '<div class="cable"><span class="eyebrow">Cable serie USB</span>' +
      '<div class="msg"><b>mensaje vacío</b><small>una vez, al iniciar</small></div>' +
      '<div class="msg"><b>m 40 40</b><small>referencias en ticks por ciclo</small></div>' +
      '<div class="msg ret"><b>e</b><small>pide los encoders y vuelven los conteos</small></div></div>' +
      '<div class="equipo"><span class="eyebrow">Arduino Nano</span>' +
      '<div class="caja"><b>ROSArduinoBridge.ino</b><small>lee los comandos</small></div>' +
      '<div class="caja verde punteada-v"><b>diff_controller.h</b><small>doPID, la ley de control</small><em>se puede reescribir sin tocar el cable</em></div></div>' +
      '</div>' +
      '<div class="comparar"><div><b>Lo que justifica el protocolo</b><span>Conservar el firmware y sus comandos m y e, que diffdrive_arduino ya sabe usar.</span></div><div><b>Lo que no justifica</b><span>La fórmula de doPID. Ningún comando depende de ella.</span></div></div>';
  };

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
})();
