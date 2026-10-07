/* Diagramas del control de bajo nivel */
(function () {
  "use strict";
  var V = window.VISUALES, U = window.U;

  /* Papel real de cada ganancia */
  V.papeles = function (el) {
    var med = [0, 2, 5, 6, 6, 4];
    function tabla(hasta) {
      var h = '<table class="pasos-tabla"><thead><tr><th scope="row">Ciclo</th>' + med.map(function (_, i) { return '<th>' + (i + 1) + '</th>'; }).join("") + '</tr></thead><tbody>';
      h += '<tr><th scope="row">Medición</th>' + med.map(function (m, i) { return '<td class="' + (i < hasta ? '' : 'oc') + '">' + m + '</td>'; }).join("") + '</tr>';
      h += '<tr><th scope="row">Cambio</th>' + med.map(function (m, i) { return '<td class="' + (i < hasta && i > 0 ? 'amb' : 'oc') + '">' + (i ? (m - med[i - 1] > 0 ? "+" : "") + (m - med[i - 1]) : "") + '</td>'; }).join("") + '</tr>';
      var suma = 0;
      h += '<tr><th scope="row">Suma de cambios</th>' + med.map(function (m, i) { if (i) suma += m - med[i - 1]; return '<td class="' + (i < hasta && i > 0 ? 'az' : 'oc') + '">' + (i ? suma : "") + '</td>'; }).join("") + '</tr>';
      return h + '</tbody></table>';
    }
    el.innerHTML =
      '<div class="roles">' +
      '<div class="rol"><div class="caja"><b>Kp</b><small>por el error de ahora</small></div><div class="flecha-d"><span>al sumarse ciclo a ciclo</span></div><div class="caja verde"><b>Integral</b><small>acumula el error</small></div></div>' +
      '<div class="rol"><div class="caja"><b>Kd</b><small>por el cambio de la medición</small></div><div class="flecha-d"><span>al sumarse ciclo a ciclo</span></div><div class="caja verde"><b>Proporcional</b><small>sobre la medición</small></div></div>' +
      '<div class="rol"><div class="caja"><b>Ki</b><small>error guardado aparte</small></div><div class="flecha-d"><span>se acumula dos veces</span></div><div class="caja punteada"><b>Segunda integración</b><small>casi nula, cero en la rueda derecha</small></div></div>' +
      '<div class="resultado">Resultado. PI incremental, sin acción derivativa efectiva</div></div>' +
      '<div class="formula-txt"><span class="eyebrow">Lo que hace doPID en cada ciclo</span><p>Aumento igual a Kp por el error, menos Kd por el cambio de la medición, más el integral, todo dividido por Ko.</p><p>Salida nueva igual a salida anterior más aumento, recortada a 255.</p></div>' +
      '<h4 class="vsub">Por qué Kd termina siendo proporcional</h4><div class="tabla-pasos"></div>' +
      '<div class="vctl"><button type="button" class="vbtn" data-a="paso">Ver ciclo a ciclo</button><span class="vestado" aria-live="polite">La suma de los cambios devuelve la medición misma.</span></div>';
    var cont = el.querySelector(".tabla-pasos"), est = el.querySelector(".vestado"), k = med.length;
    cont.innerHTML = tabla(k);
    el.querySelector('[data-a="paso"]').addEventListener("click", function () {
      k = k >= med.length ? 1 : k + 1;
      cont.innerHTML = tabla(k);
      this.textContent = k >= med.length ? "Ver ciclo a ciclo" : "Siguiente ciclo";
      est.textContent = k >= med.length ? "La suma de los cambios devuelve la medición misma." : (k === 1 ? "Ciclo 1. Todavía no hay cambio." : "La suma va " + med.slice(1, k).reduce(function (a, m, i) { return a + m - med[i]; }, 0) + ", igual a la medición " + med[k - 1] + ".");
    });
  };

  /* Un ciclo del firmware, con el código real */
  V.ciclo = function (el) {
    var RUEDA = {
      der: { n: "Rueda derecha", Kp: 16.42, Kd: 20.05, Ki: 0.001, Ko: 50, banda: 1 },
      izq: { n: "Rueda izquierda", Kp: 16.0, Kd: 20.3, Ki: 0.075, Ko: 50, banda: 2 }
    };
    var PRESETS = [
      { id: "ens", t: "Ejemplo del ensayo", ref: 62.71, ant: 58, act: 59, nota: "Referencia con decimales, como la del comando k de los scripts de captura." },
      { id: "k", t: "0,13 m/s con el comando k", ref: 40.76, ant: 40, act: 40, nota: "0,13 m/s por el factor 313,56 da 40,76 ticks por ciclo." },
      { id: "m", t: "0,13 m/s desde ROS 2", ref: 40, ant: 40, act: 39, nota: "La interfaz trunca a entero y envía 40 con el comando m." },
      { id: "giro", t: "Giro a 0,35 rad/s", ref: 10.32, ant: 10, act: 9, nota: "Cada rueda a unos 0,033 m/s, cerca de 10 ticks por ciclo." }
    ];
    var st = { r: "der", ref: 62.71, ant: 58, act: 59, sal: 150, iterm: 0, preset: "ens" };
    el.innerHTML =
      '<div class="ciclo-ctl">' +
      '<div class="segmento sm" role="group" aria-label="Rueda"><button type="button" data-r="der" aria-pressed="true">Rueda derecha</button><button type="button" data-r="izq" aria-pressed="false">Rueda izquierda</button></div>' +
      '<div class="chips sm" role="group" aria-label="Situación">' + PRESETS.map(function (p) { return '<button type="button" class="chip" data-p="' + p.id + '" aria-pressed="' + (p.id === st.preset) + '">' + U.esc(p.t) + '</button>'; }).join("") + '</div>' +
      '<div class="deslizadores">' +
      '<label for="cy-act">Medición de este ciclo<b class="num" data-v="act"></b><input id="cy-act" type="range" min="0" max="70" step="1" data-k="act"></label>' +
      '<label for="cy-ant">Medición del ciclo anterior<b class="num" data-v="ant"></b><input id="cy-ant" type="range" min="0" max="70" step="1" data-k="ant"></label>' +
      '<label for="cy-sal">Salida anterior, PWM<b class="num" data-v="sal"></b><input id="cy-sal" type="range" min="0" max="255" step="1" data-k="sal"></label>' +
      '</div></div>' +
      '<p class="vnota cy-nota"></p><ol class="cy-pasos"></ol><div class="cy-res"></div>' +
      '<p class="vnota">Ganancias y cortes tal como están en diff_controller.h. Las mediciones son de ejemplo, en ticks por ciclo de 33 ms.</p>';
    var pasos = el.querySelector(".cy-pasos"), res = el.querySelector(".cy-res"), nota = el.querySelector(".cy-nota");
    function f2(v) { return U.fmt(v, 2); }
    function calc() {
      var g = RUEDA[st.r];
      var input = st.act, perrRaw = st.ref - input, perr = Math.trunc(perrRaw);
      var enBanda = Math.abs(perr) <= g.banda;
      if (enBanda) perr = 0;
      var tP = g.Kp * perr, cambio = input - st.ant, tD = g.Kd * cambio;
      var num = tP - tD + st.iterm, aumRaw = num / g.Ko, aum = Math.trunc(aumRaw);
      var out = aum + st.sal, tope = false;
      if (out >= 255) { out = 255; tope = true; } else if (out <= -255) { out = -255; tope = true; }
      var itRaw = st.iterm + g.Ki * perr, itNuevo = tope ? st.iterm : Math.trunc(itRaw), kiTxt = String(g.Ki).replace('.', ',');
      function corte(perdido, dec) { return Math.abs(perdido) > 1e-9 ? '<span class="corte">corte, se pierden ' + U.fmt(Math.abs(perdido), dec || 2) + '</span>' : '<span class="sin-corte">sin pérdida</span>'; }
      var h = "";
      h += '<li><span class="cy-t">Error</span><span class="cy-c">referencia ' + f2(st.ref) + ' menos medición ' + input + ' da ' + f2(perrRaw) + '. Se guarda <b>' + Math.trunc(perrRaw) + '</b></span>' + corte(perrRaw - Math.trunc(perrRaw)) + '</li>';
      h += '<li><span class="cy-t">Banda muerta</span><span class="cy-c">' + (enBanda ? 'El error está dentro de ' + g.banda + (g.banda === 1 ? ' tick' : ' ticks') + ', así que pasa a <b>0</b>' : 'El error supera ' + g.banda + (g.banda === 1 ? ' tick' : ' ticks') + ' y se mantiene en <b>' + perr + '</b>') + '</span></li>';
      h += '<li><span class="cy-t">Términos</span><span class="cy-c">Kp por error ' + f2(g.Kp) + ' × ' + perr + ' = ' + f2(tP) + '. Kd por el cambio de la medición ' + f2(g.Kd) + ' × ' + cambio + ' = ' + f2(tD) + ', que se resta. Integral ' + st.iterm + '. Total <b>' + f2(num) + '</b></span></li>';
      h += '<li><span class="cy-t">Aumento</span><span class="cy-c">' + f2(num) + ' ÷ ' + g.Ko + ' = ' + f2(aumRaw) + '. Se guarda <b>' + aum + '</b></span>' + corte(aumRaw - aum) + '</li>';
      h += '<li><span class="cy-t">Salida</span><span class="cy-c">' + st.sal + (aum >= 0 ? ' + ' : ' − ') + Math.abs(aum) + ' = ' + (st.sal + aum) + (tope ? ', recortada a <b>' + out + '</b>' : '. Queda en <b>' + out + '</b>') + '</span></li>';
      h += '<li><span class="cy-t">Integral</span><span class="cy-c">' + (tope ? 'La salida tocó el tope, así que el integral no se actualiza. Integración condicional' : st.iterm + ' + ' + kiTxt + ' × ' + perr + ' = ' + U.fmt(itRaw, 3) + '. Se guarda <b>' + itNuevo + '</b>') + '</span>' + (tope ? '' : corte(itRaw - itNuevo, 3)) + '</li>';
      pasos.innerHTML = h;
      var dif = out - st.sal;
      res.innerHTML = '<div class="pwm"><span class="eyebrow">PWM al motor</span><div class="pwm-barra"><i class="ant" style="--x:' + (st.sal / 255 * 100) + '%"></i><i class="nue" style="--x:' + (Math.max(0, out) / 255 * 100) + '%"></i></div>' +
        '<p>' + (dif === 0 ? '<b>El motor no cambia.</b> ' + (Math.abs(aumRaw) > 0 && aum === 0 ? 'Había un aumento de ' + f2(aumRaw) + ', pero se perdió al guardarlo entero.' : (perr === 0 ? 'El error quedó en cero.' : '')) : '<b>El PWM ' + (dif > 0 ? 'sube ' : 'baja ') + Math.abs(dif) + '</b>, de ' + st.sal + ' a ' + out + '.') + '</p></div>';
      el.querySelectorAll("[data-v]").forEach(function (b) { b.textContent = st[b.getAttribute("data-v")]; });
      el.querySelectorAll("input[data-k]").forEach(function (i) { i.value = st[i.getAttribute("data-k")]; });
      var p = PRESETS.filter(function (x) { return x.id === st.preset; })[0];
      nota.textContent = (p ? p.nota + " " : "") + "Referencia " + f2(st.ref) + " ticks por ciclo. " + g.n + ", Kp " + f2(g.Kp) + ", Kd " + f2(g.Kd) + ", Ki " + String(g.Ki).replace(".", ",") + ", Ko " + g.Ko + ", banda muerta " + g.banda + ".";
    }
    el.addEventListener("click", function (e) {
      var r = e.target.closest("[data-r]");
      if (r) { st.r = r.getAttribute("data-r"); el.querySelectorAll("[data-r]").forEach(function (b) { b.setAttribute("aria-pressed", b === r); }); calc(); return; }
      var p = e.target.closest("[data-p]");
      if (p) {
        var pr = PRESETS.filter(function (x) { return x.id === p.getAttribute("data-p"); })[0];
        st.preset = pr.id; st.ref = pr.ref; st.ant = pr.ant; st.act = pr.act;
        el.querySelectorAll("[data-p]").forEach(function (b) { b.setAttribute("aria-pressed", b === p); });
        calc();
      }
    });
    el.addEventListener("input", function (e) {
      var k = e.target.getAttribute("data-k"); if (!k) return;
      st[k] = parseInt(e.target.value, 10); calc();
    });
    calc();
  };

  /* Windup con la rueda trabada */
  V.windup = function (el) {
    var L = 3;
    el.innerHTML = '<div class="vctl"><label class="desl-linea" for="wu-l">Tiempo con la rueda trabada <b class="num" data-v>3 s</b><input id="wu-l" type="range" min="1" max="4" step="1" value="3"></label></div>' +
      '<div class="wu-g"></div>' +
      '<div class="vley"><span><i class="lin rojo"></i>PI normal</span><span><i class="lin azul"></i>PI incremental con tope</span><span><i class="lin-disc"></i>velocidad pedida</span><span><i class="cu gris"></i>rueda trabada</span></div>' +
      '<p class="vnota">Simulación ilustrativa con un motor y ganancias de ejemplo. No es una medición del robot. Las dos leyes tienen las mismas ganancias y se comportan igual hasta que el motor se satura.</p>';
    var g = el.querySelector(".wu-g");
    function sim(tipo) {
      var dt = 0.033, tau = 0.25, G = 1.4, Kp = 0.35, Ki = 1.8, t1 = 1.5, T = 14;
      var y = 0, I = 0, u = 0, ep = 0, out = [];
      for (var t = 0; t < T; t += dt) {
        var e = 100 - y, ur;
        if (tipo === "pos") { I += Ki * e * dt; ur = Kp * e + I; u = Math.max(-100, Math.min(100, ur)); }
        else { ur = u + Kp * (e - ep) + Ki * e * dt; u = Math.max(-100, Math.min(100, ur)); }
        ep = e;
        if (t >= t1 && t < t1 + L) y = 0; else y += dt / tau * (G * u - y);
        out.push([t, y, ur, u]);
      }
      return out;
    }
    function dibujar() {
      var W = Math.max(300, g.clientWidth || 600), chico = W < 520;
      var ml = chico ? 34 : 44, mr = chico ? 18 : 24, T = 14;
      var a = sim("pos"), b = sim("inc");
      function panel(titulo, yMax, yTicks, serie, alto, etiqueta) {
        var mt = 22, mb = 24, H = alto;
        var x = function (t) { return ml + t / T * (W - ml - mr); };
        var yv = function (v) { return mt + (1 - Math.min(v, yMax) / yMax) * (H - mt - mb); };
        var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + U.esc(etiqueta) + '">';
        s += '<rect class="f-desc" x="' + x(1.5) + '" y="' + mt + '" width="' + (x(1.5 + L) - x(1.5)) + '" height="' + (H - mt - mb) + '"/>';
        yTicks.forEach(function (v) { s += '<line class="k-linea" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + yv(v) + '" y2="' + yv(v) + '"/><text class="t-s" x="' + (ml - 6) + '" y="' + (yv(v) + 4) + '" text-anchor="end">' + v + '</text>'; });
        for (var t = 0; t <= T; t += 2) s += '<text class="t-s" x="' + x(t) + '" y="' + (H - 6) + '" text-anchor="middle">' + t + ' s</text>';
        s += serie(x, yv);
        s += '<text class="t-m t-b" x="' + ml + '" y="14">' + titulo + '</text>';
        return s + '</svg>';
      }
      function linea(d, idx, cls, x, yv) { return '<polyline class="' + cls + '" fill="none" stroke-width="2.2" points="' + d.map(function (p) { return x(p[0]).toFixed(1) + ',' + yv(p[idx]).toFixed(1); }).join(" ") + '"/>'; }
      var v = panel("Velocidad de la rueda, % de lo pedido", 150, [0, 50, 100, 150], function (x, yv) {
        return '<line class="k-muted" stroke-dasharray="4 4" x1="' + x(0) + '" x2="' + x(14) + '" y1="' + yv(100) + '" y2="' + yv(100) + '"/>' + linea(a, 1, "k-rojo", x, yv) + linea(b, 1, "k-azul", x, yv);
      }, chico ? 190 : 220, "Velocidad con PI normal y con PI incremental");
      var u = panel("Señal pedida al motor, % del máximo", 400, [0, 100, 200, 300, 400], function (x, yv) {
        return '<line class="k-ink" stroke-dasharray="2 3" x1="' + x(0) + '" x2="' + x(14) + '" y1="' + yv(100) + '" y2="' + yv(100) + '"/><text class="t-s" x="' + (W - mr - 4) + '" y="' + (yv(100) - 5) + '" text-anchor="end">tope del motor</text>' +
          linea(a, 2, "k-rojo", x, yv) + linea(b, 2, "k-azul", x, yv);
      }, chico ? 170 : 190, "Señal pedida al motor");
      var post = a.filter(function (p) { return p[0] > 1.5 + L; }), arriba = post.filter(function (p) { return p[1] > 120; }).length * 0.033;
      var postb = b.filter(function (p) { return p[0] > 1.5 + L; }), maxb = Math.max.apply(null, postb.map(function (p) { return p[1]; }));
      g.innerHTML = v + u + '<div class="wu-res"><div><b class="num">' + U.fmt(arriba, 1) + ' s</b><span>el PI normal sigue a fondo, más de 20 puntos sobre lo pedido</span></div><div><b class="num">' + U.fmt(maxb - 100, 0) + ' puntos</b><span>se pasa el PI incremental y se acomoda rápido</span></div></div>';
    }
    el.querySelector("#wu-l").addEventListener("input", function (e) { L = parseInt(e.target.value, 10); el.querySelector("[data-v]").textContent = L + " s"; dibujar(); });
    dibujar();
    U.alCambiarAncho(g, dibujar);
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

  /* PSO como semilla */
  V.pso = function (el) {
    el.innerHTML =
      '<div class="flujo"><div class="caja"><b>Capturar</b><small>respuesta real de cada rueda</small></div><div class="flecha-d"></div>' +
      '<div class="caja"><b>Identificar FOPDT</b><small>un modelo por rueda, porque no son idénticas</small></div><div class="flecha-d"></div>' +
      '<div class="caja azul"><b>PSO</b><small>busca Kp, Kd y Ki a la vez. Es la semilla</small></div><div class="flecha-d"></div>' +
      '<div class="caja verde"><b>Ajuste en el robot</b><small>corrige lo que el modelo no tiene</small></div></div>' +
      '<h4 class="vsub">Cuánto cambió del PSO a las ganancias finales</h4>' +
      '<div class="cambios">' +
      '<div class="cb"><b>Kp</b><div class="cb-pista"><i class="sube" style="--w:31.5%;--s:44.4%"></i><span class="cero"></span></div><span class="num">sube 28 a 63 %</span></div>' +
      '<div class="cb"><b>Kd</b><div class="cb-pista"><i class="baja" style="--w:22.5%;--s:91.1%"></i><span class="cero"></span></div><span class="num">baja 41 a 45 %</span></div>' +
      '<div class="cb"><b>Ki</b><div class="cb-pista"><i class="lejos"></i><span class="cero"></span></div><span class="num">sube varios órdenes</span></div></div>' +
      '<p class="vnota">La raya negra es la ganancia que entregó el PSO. El tramo oscuro va del cambio menor al mayor entre las dos ruedas.</p>' +
      '<div class="comparar tres"><div><b>Lo que el modelo no tenía</b><span>La zona muerta del driver. Por eso aparecieron el error estacionario y la detención.</span></div>' +
      '<div><b>Finales en el código</b><span>Derecha Kp 16,42, Kd 20,05, Ki 0,001. Izquierda Kp 16,0, Kd 20,3, Ki 0,075.</span></div>' +
      '<div><b>Originales del firmware</b><span>Kp 20, Kd 12, Ki 0. No comparé contra ellas, así que no afirmo que el PSO ahorrara tiempo.</span></div></div>';
  };

  /* Resolución y velocidad única */
  V.resolucion = function (el) {
    el.innerHTML =
      '<h4 class="vsub">Ticks por ciclo de 33 ms</h4>' +
      '<div class="ticks">' +
      '<div class="tk"><span>Recta a 0,13 m/s</span><div class="tk-pista"><i style="--w:' + (41 / 45 * 100) + '%"></i><em class="u14" style="--x:' + (14 / 45 * 100) + '%"></em><em class="db" style="--x:' + (2 / 45 * 100) + '%"></em></div><b class="num">41</b></div>' +
      '<div class="tk"><span>Giro a 0,35 rad/s</span><div class="tk-pista"><i style="--w:' + (10 / 45 * 100) + '%"></i><em class="u14" style="--x:' + (14 / 45 * 100) + '%"></em><em class="db" style="--x:' + (2 / 45 * 100) + '%"></em></div><b class="num">≈ 10</b></div>' +
      '</div>' +
      '<div class="vley"><span><i class="cu azul"></i>ticks que cuenta cada rueda</span><span><i class="lin rojo"></i>14 ticks, error mínimo para que crezca el integral izquierdo</span><span><i class="lin ambar"></i>banda muerta, 1 tick derecha y 2 izquierda</span></div>' +
      '<p class="vnota">En el giro la rueda cuenta pocos ticks. La banda muerta pesa más y el error casi nunca llega a 14. No se midió.</p>' +
      '<h4 class="vsub">Cómo llega el dato de velocidad</h4><div class="regla"></div>' +
      '<div class="vley"><span><i class="lin" style="background:var(--muted)"></i>pasos de 0,01 m/s del dato registrado</span><span><i class="pt azul"></i>muestras de ejemplo</span><span><i class="lin ink"></i>promedio 0,128</span><span><i class="cu rojo-s"></i>un sobreimpulso aquí no se ve</span><span><i class="lin" style="background:var(--line);height:8px;width:2px"></i>rayas finas, un tick por ciclo, unos 0,003 m/s</span></div>';
    var cont = el.querySelector(".regla");
    function dibujar() {
      var W = Math.max(300, cont.clientWidth || 600), ml = 16, mr = 16, H = 150;
      var a = 0.115, b = 0.145, x = function (v) { return ml + (v - a) / (b - a) * (W - ml - mr); };
      var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Pasos de 0,01 m/s y promedio de 0,128">';
      s += '<rect class="f-rojo-s" x="' + x(0.13) + '" y="20" width="' + (x(0.14) - x(0.13)) + '" height="70" rx="3"/>';
      var chico = W < 520;
      s += '<text class="t-s" x="' + ((x(0.13) + x(0.14)) / 2) + '" y="34" text-anchor="middle" style="fill:var(--rojo)">' + (chico ? '8 %' : '8 % de la referencia') + '</text>';
      for (var v = 0.115; v <= 0.1451; v += 1 / 313.56) s += '<line class="k-linea" x1="' + x(v) + '" x2="' + x(v) + '" y1="86" y2="94"/>';
      [0.12, 0.13, 0.14].forEach(function (p) { s += '<line class="k-muted" stroke-width="2" x1="' + x(p) + '" x2="' + x(p) + '" y1="18" y2="100"/><text class="t-s" x="' + x(p) + '" y="116" text-anchor="middle">' + U.fmt(p, 2) + '</text>'; });
      var m = [0.13, 0.12, 0.13, 0.13, 0.13, 0.13, 0.12, 0.13, 0.13, 0.13], cuenta = {};
      m.forEach(function (p) { var k = cuenta[p] = (cuenta[p] || 0) + 1; s += '<circle class="f-azul" cx="' + x(p) + '" cy="' + (44 + (k - 1) * 6) + '" r="4"/>'; });
      s += '<line class="k-ink" stroke-width="2.5" x1="' + x(0.128) + '" x2="' + x(0.128) + '" y1="40" y2="100"/><text class="t-m t-b" x="' + (x(0.128) - 6) + '" y="140" text-anchor="end">promedio 0,128</text>';
      cont.innerHTML = s + '</svg>';
    }
    dibujar();
    U.alCambiarAncho(cont, dibujar);
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
