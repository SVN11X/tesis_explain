/* Lógica de la página */
(function () {
  "use strict";
  var U = window.U, D = window.DATOS, TEMAS = window.TEMAS || [];
  if (!D) { document.querySelector("main").innerHTML = '<p class="sin-res">No se pudo cargar datos/datos.js.</p>'; return; }
  var esc = U.esc, txt = U.txt, fmt = U.fmt, nivel = U.nivel, prom = U.prom;
  var PROF = { guia: "Profesor guía", informante: "Profesor informante", externo: "Profesor externo" };
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function fechaCorta(f) { var p = f.split("-"); return parseInt(p[2], 10) + " " + MESES[parseInt(p[1], 10) - 1]; }

  var P = D.preguntas, porId = {};
  P.forEach(function (p) { porId[p.id] = p; });
  var areaPorId = {}; D.areas.forEach(function (a) { areaPorId[a.id] = a; });
  var temaBanco = {}; D.temas.forEach(function (t) { temaBanco[t.id] = t; });
  var NOTAS = []; P.forEach(function (p) { p.notas.forEach(function (n) { NOTAS.push({ p: p, n: n }); }); });
  var rondasIds = D.rondas.map(function (r) { return r.r; });
  var ultima = rondasIds[rondasIds.length - 1];
  function notasRonda(r) { return NOTAS.filter(function (x) { return x.n.r === r; }); }
  var antiguas = NOTAS.filter(function (x) { return x.n.r <= 4; });
  function chip(n, conRonda) {
    return '<span class="nota ' + nivel(n.v, n.om) + '" title="' + esc((PROF[n.p] || "") + ", ronda " + n.r + (n.om ? ", omitida, nota 1,0" : ", nota " + fmt(n.v))) + '">' + (conRonda ? '<b>R' + n.r + '</b>' : '') + (n.om ? "omitida" : fmt(n.v)) + '</span>';
  }
  /* tema visual que explica cada pregunta */
  var temaDePregunta = {};
  TEMAS.forEach(function (t) { t.preguntas.forEach(function (id) { if (!temaDePregunta[id]) temaDePregunta[id] = t; }); });
  function notasTema(t) {
    var out = [];
    t.preguntas.forEach(function (id) { var p = porId[id]; if (p) p.notas.forEach(function (n) { out.push(n); }); });
    return out.sort(function (a, b) { return a.r - b.r; });
  }
  var areasOrden = D.areas.map(function (a) {
    var ant = antiguas.filter(function (x) { return x.p.area === a.id; });
    return { a: a, pm: ant.length ? prom(ant.map(function (x) { return x.n.v; })) : 99 };
  }).sort(function (a, b) { return a.pm - b.pm; });

  /* ── cabecera ── */
  var omit = NOTAS.filter(function (x) { return x.n.om; }).length;
  document.getElementById("cifrasTop").innerHTML = [
    [D.rondas.length, "rondas de simulación"],
    [TEMAS.length, "temas explicados con un diagrama"],
    [omit, "preguntas omitidas"],
    [fmt(prom(antiguas.map(function (x) { return x.n.v; }))) + '<small>→</small>' + fmt(prom(notasRonda(ultima).map(function (x) { return x.n.v; }))), "promedio rondas 1 a 4, y ronda " + ultima]
  ].map(function (c) { return '<div><dt>' + esc(c[1]) + '</dt><dd class="num">' + c[0] + '</dd></div>'; }).join("");

  /* ── evolución ── */
  function dibujarEvo() {
    var cont = document.getElementById("graficoEvo");
    var W = Math.max(300, Math.round(cont.clientWidth || 760)), chico = W < 600;
    var ml = chico ? 52 : 120, mr = chico ? 62 : 170, mt = 34, fila = chico ? 62 : 58, H = mt + D.rondas.length * fila + 30;
    var x = function (v) { return ml + (v - 1) / 6 * (W - ml - mr); };
    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Notas por pregunta en cada ronda">';
    for (var k = 1; k <= 7; k++) {
      s += '<line class="k-linea" x1="' + x(k) + '" x2="' + x(k) + '" y1="' + (mt - 8) + '" y2="' + (H - 26) + '"/>';
      s += '<text class="t-s" x="' + x(k) + '" y="' + (H - 9) + '" text-anchor="middle">' + (chico ? k : k + ',0') + '</text>';
    }
    s += '<line class="k-rojo" stroke-dasharray="4 4" stroke-width="1.3" x1="' + x(4) + '" x2="' + x(4) + '" y1="' + (mt - 14) + '" y2="' + (H - 26) + '"/>';
    s += '<text class="t-s" style="fill:var(--rojo)" x="' + (x(4) + 5) + '" y="' + (mt - 16) + '">4,0' + (chico ? '' : ' aprobación') + '</text>';
    var pts = [], cuerpo = "", rr = chico ? 4.5 : 6, paso = chico ? 8 : 10;
    D.rondas.forEach(function (r, i) {
      var cy = mt + i * fila + fila / 2, ns = notasRonda(r.r);
      var pm = prom(ns.map(function (q) { return q.n.v; })), om = ns.filter(function (q) { return q.n.om; }).length;
      pts.push([x(pm), cy]);
      cuerpo += '<text class="t-m t-b" x="' + (ml - (chico ? 10 : 16)) + '" y="' + (cy - 2) + '" text-anchor="end">' + (chico ? 'R' + r.r : 'Ronda ' + r.r) + '</text>';
      cuerpo += '<text class="t-s" x="' + (ml - (chico ? 10 : 16)) + '" y="' + (cy + 13) + '" text-anchor="end">' + fechaCorta(r.fecha) + '</text>';
      if (r.nivel && !chico) cuerpo += '<text class="t-s" x="' + (ml - 16) + '" y="' + (cy + 26) + '" text-anchor="end">nivel ' + r.nivel + '</text>';
      var pila = {};
      ns.slice().sort(function (a, b) { return a.n.v - b.n.v; }).forEach(function (q) {
        var key = q.n.v.toFixed(1), k2 = pila[key] = (pila[key] || 0) + 1;
        var off = (k2 % 2 === 0 ? -1 : 1) * Math.floor(k2 / 2) * paso;
        var cls = q.n.om ? "f-sup k-rojo" : ("f-" + { baja: "rojo", media: "ambar", alta: "verde" }[nivel(q.n.v)]);
        cuerpo += '<circle class="' + cls + '"' + (q.n.om ? ' stroke-width="2"' : '') + ' cx="' + x(q.n.v).toFixed(1) + '" cy="' + (cy + off) + '" r="' + (q.n.om ? rr - .5 : rr) + '"><title>' + esc(q.p.corto + ". " + (PROF[q.n.p] || "") + ". " + (q.n.om ? "Omitida, 1,0" : "Nota " + fmt(q.n.v))) + '</title></circle>';
      });
      cuerpo += '<line class="k-ink" stroke-width="3" stroke-linecap="round" x1="' + x(pm) + '" x2="' + x(pm) + '" y1="' + (cy - 20) + '" y2="' + (cy + 20) + '"/>';
      var xr = W - mr + (chico ? 10 : 18);
      cuerpo += '<text class="t-d" x="' + xr + '" y="' + (cy - 1) + '">' + (chico ? '' : 'prom. ') + fmt(pm) + '</text>';
      cuerpo += '<text class="t-s" x="' + xr + '" y="' + (cy + 14) + '">' + (chico ? om + ' omit.' : ns.length + ' preg. · ' + om + (om === 1 ? ' omitida' : ' omitidas')) + '</text>';
    });
    s += '<polyline class="k-azul" fill="none" stroke-width="2" opacity=".45" points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1]; }).join(" ") + '"/>';
    cont.innerHTML = s + cuerpo + '</svg>';
  }
  dibujarEvo();
  U.alCambiarAncho(document.getElementById("graficoEvo"), dibujarEvo);
  document.getElementById("rondas").innerHTML = D.rondas.map(function (r) {
    var ns = notasRonda(r.r);
    return '<div class="ronda"><strong><span>Ronda ' + r.r + ' · ' + fechaCorta(r.fecha) + '</span><span class="num">' + fmt(prom(ns.map(function (q) { return q.n.v; }))) + '</span></strong>' + esc(r.nota) + '</div>';
  }).join("");

  /* ── áreas ── */
  (function () {
    var pos = function (v) { return ((v - 1) / 6 * 100).toFixed(2) + "%"; };
    var html = areasOrden.filter(function (o) { return o.pm < 99; }).map(function (o) {
      var a = o.a, ant = antiguas.filter(function (x) { return x.p.area === a.id; });
      var ult = notasRonda(ultima).filter(function (x) { return x.p.area === a.id; });
      var p5 = prom(ult.map(function (x) { return x.n.v; })), om = ant.filter(function (x) { return x.n.om; }).length;
      var temas = TEMAS.filter(function (t) { return t.area === a.id; });
      return '<details class="area-fila"><summary>' +
        '<span class="area-nombre"><strong>' + esc(a.nombre) + '</strong><span>' + ant.length + ' preguntas · ' + om + (om === 1 ? ' omitida' : ' omitidas') + '</span></span>' +
        '<span class="pista" aria-hidden="true"><span class="relleno ' + nivel(o.pm) + '" style="width:' + pos(o.pm) + '"></span><span class="aprob"></span>' +
        (p5 != null ? '<span class="r5m" style="left:' + pos(p5) + '"></span>' : '') + '</span>' +
        '<span class="area-val"><b class="num">' + fmt(o.pm) + '</b>' + (p5 != null ? '<span>R' + ultima + ' ' + fmt(p5) + '</span>' : '<span class="muted">sin R' + ultima + '</span>') + '</span>' +
        '</summary><div class="area-det"><p>' + esc(a.resumen) + '</p>' +
        a.partes.map(function (pt) { return '<p>' + (pt.t ? '<strong>' + esc(pt.t) + '.</strong> ' : '') + txt(pt.x) + '</p>'; }).join("") +
        '<p class="ver">Temas explicados: ' + temas.map(function (t) { return '<a href="#t-' + t.id + '" data-tema="' + t.id + '">' + esc(t.titulo) + '</a>'; }).join(" · ") + '</p></div></details>';
    }).join("");
    html += '<div class="eje-areas" aria-hidden="true"><span class="vacio-col"></span><span class="marcas">' + [1, 2, 3, 4, 5, 6, 7].map(function (k) { return '<span style="left:' + pos(k) + '">' + k + '</span>'; }).join("") + '</span><span class="vacio-val"></span></div>';
    document.getElementById("areasLista").innerHTML = html;
  })();

  /* ── ronda 5 ── */
  (function () {
    var E = D.ensayo;
    document.getElementById("r5").innerHTML =
      '<div class="panel"><h3>Ronda ' + ultima + ', los tres temas más débiles</h3><ul class="lista-r5">' + E.debiles.map(function (d) {
        var t = temaDePregunta[d.ir];
        return '<li><strong>' + esc(d.t) + '</strong><span>' + esc(d.x) + '</span>' + (t ? '<a href="#t-' + t.id + '" data-tema="' + t.id + '">Ver la explicación visual</a>' : '') + '</li>';
      }).join("") + '</ul></div>' +
      '<div class="panel"><h3>Ronda ' + ultima + ', lo que no calzó con los archivos</h3><ul class="lista-r5">' + E.diferencias.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join("") +
      '<li class="alerta"><strong>Revisado contra la tesis.</strong> En la pregunta 6 dijiste que el proyecto incluye herramientas como el cautín y la respuesta sugerida lo repitió. La Tabla A1.1 no tiene herramientas. <a href="#t-costo" data-tema="costo">Ver costo</a></li></ul></div>';
  })();

  /* ── mapa de calor (plegado) ── */
  (function () {
    var h = '<table class="calor"><thead><tr><th scope="col">Pregunta</th>' + rondasIds.map(function (r) { return '<th scope="col" class="c">R' + r + '</th>'; }).join("") + '</tr></thead><tbody>';
    areasOrden.forEach(function (o) {
      var filas = P.filter(function (p) { return p.area === o.a.id && p.notas.length; });
      if (!filas.length) return;
      h += '<tr class="g"><th colspan="' + (rondasIds.length + 1) + '">' + esc(o.a.nombre) + (o.pm < 99 ? '<span>prom. ' + fmt(o.pm) + '</span>' : '') + '</th></tr>';
      filas.forEach(function (p) {
        h += '<tr><th scope="row"><a href="#p-' + p.id + '" data-ir="' + p.id + '">' + esc(p.corto) + '</a></th>';
        rondasIds.forEach(function (r) {
          var ns = p.notas.filter(function (n) { return n.r === r; });
          h += '<td>' + (ns.length ? ns.map(function (n) { return '<span class="celda ' + nivel(n.v, n.om) + '">' + (n.om ? "omitió" : fmt(n.v)) + '</span>'; }).join("") : '<span class="celda vacia"></span>') + '</td>';
        });
        h += '</tr>';
      });
    });
    document.getElementById("calor").innerHTML = h + '</tbody></table>';
  })();

  /* ── mapa de temas ── */
  (function () {
    var html = areasOrden.map(function (o) {
      var ts = TEMAS.filter(function (t) { return t.area === o.a.id; });
      if (!ts.length) return "";
      return '<div class="fila-area"><h3>' + esc(o.a.nombre) + (o.pm < 99 ? ' <span class="num">' + fmt(o.pm) + '</span>' : '') + '</h3><div class="teselas">' +
        ts.map(function (t) {
          var ns = notasTema(t), pm = ns.length ? prom(ns.map(function (n) { return n.v; })) : null;
          var cls = pm == null ? "nivel-nada" : { baja: "nivel-alto", media: "nivel-medio", alta: "nivel-bien" }[nivel(pm)];
          return '<a class="tesela ' + cls + '" href="#t-' + t.id + '" data-tema="' + t.id + '"><strong>' + esc(t.titulo) + '</strong>' +
            '<span class="meta"><span class="puntitos" aria-label="Notas en orden de ronda">' + ns.map(function (n) { return '<i class="' + nivel(n.v, n.om) + '" title="R' + n.r + ' ' + (n.om ? 'omitida' : fmt(n.v)) + '"></i>'; }).join("") + '</span>' +
            (pm != null ? '<b class="num">' + fmt(pm) + '</b>' : '<span>repregunta sin nota</span>') + '</span></a>';
        }).join("") + '</div></div>';
    }).join("");
    document.getElementById("mapaTemas").innerHTML = html;
  })();

  /* ── temas explicados ── */
  (function () {
    var cont = document.getElementById("modulos");
    var html = areasOrden.map(function (o) {
      var ts = TEMAS.filter(function (t) { return t.area === o.a.id; });
      if (!ts.length) return "";
      return '<div class="grupo-mod"><h3 class="grupo-tit">' + esc(o.a.nombre) + (o.pm < 99 ? ' <span class="nota ' + nivel(o.pm) + '">' + fmt(o.pm) + '</span>' : '') + '</h3>' + ts.map(function (t) {
        var ns = notasTema(t);
        return '<article class="mod" id="t-' + t.id + '">' +
          '<div class="mod-cab"><span class="eyebrow">' + esc(o.a.nombre) + '</span>' + (ns.length ? ns.map(function (n) { return chip(n, true); }).join("") : '<span class="nota gris">repregunta sin nota</span>') + '</div>' +
          '<h4>' + esc(t.titulo) + '</h4>' +
          '<p class="mod-costo"><b>Lo que costó.</b> ' + txt(t.costo) + '</p>' +
          '<div class="mod-cuerpo"><div class="vis" data-vis="' + t.visual + '"></div>' +
          '<div class="claves">' + t.claves.map(function (c) { return '<div class="clave"><b>' + esc(c.t) + '</b><p>' + txt(c.x) + '</p></div>'; }).join("") + '</div></div>' +
          '<div class="mod-pie">' +
          '<div class="sala"><span class="eyebrow">Para decir en la sala</span><p>' + txt(t.frase) + '</p></div>' +
          (t.trampas.length ? '<div><span class="eyebrow">Frases a evitar</span><ul class="trampas">' + t.trampas.map(function (x) { return '<li><span class="no">' + esc(x.no) + '</span><span class="si">' + esc(x.si) + '</span></li>'; }).join("") + '</ul></div>' : '') +
          '<div class="rel"><span class="eyebrow">Practica estas preguntas</span><ul>' + t.preguntas.map(function (id) {
            var p = porId[id]; if (!p) return "";
            return '<li><a href="#p-' + id + '" data-ir="' + id + '">' + esc(p.corto) + '</a> ' + p.notas.map(function (n) { return chip(n, true); }).join(" ") + '</li>';
          }).join("") + '</ul><p class="donde"><strong>Respaldo.</strong> ' + esc(t.respaldo) + '</p></div>' +
          '</div></article>';
      }).join("") + '</div>';
    }).join("");
    cont.innerHTML = html;
    cont.querySelectorAll("[data-vis]").forEach(function (v) {
      var f = window.VISUALES[v.getAttribute("data-vis")];
      try { if (f) f(v); else v.innerHTML = '<p class="vnota">Diagrama no disponible.</p>'; }
      catch (e) { v.innerHTML = '<p class="vnota">No se pudo dibujar este diagrama.</p>'; if (window.console) console.error(e); }
    });
  })();

  /* ── cómo respondes ── */
  (function () {
    var omPorRonda = D.rondas.map(function (r) { return [r.r, notasRonda(r.r).filter(function (q) { return q.n.om; }).length]; });
    var maxOm = Math.max.apply(null, omPorRonda.map(function (x) { return x[1]; })) || 1;
    var mini = '<div class="mini-omit" aria-label="Omisiones por ronda">' + omPorRonda.map(function (x) {
      return '<div><i class="' + (x[1] ? "" : "cero") + '" style="height:' + Math.max(3, Math.round(x[1] / maxOm * 40)) + 'px"></i>' + x[1] + '<span>R' + x[0] + '</span></div>';
    }).join("") + '</div>';
    var html = D.forma.map(function (f, i) {
      var bien = /sí funciona/i.test(f.t);
      return '<article class="patron' + (bien ? ' bien' : '') + '"><h4>' + esc(f.t) + '</h4><p>' + esc(f.x) + '</p>' + (i === 0 ? mini : '') + '</article>';
    }).join("") + D.ensayo.observaciones.map(function (o) {
      return '<article class="patron"><span class="eyebrow">Ronda ' + ultima + '</span><h4>' + esc(o.t) + '</h4><p>' + esc(o.x) + '</p></article>';
    }).join("");
    document.getElementById("patrones").innerHTML = html;
    var pasos = [
      { t: "Para una pregunta normal", p: ["Respuesta directa en una frase", "El dato que la respalda y dónde está en la tesis", "La limitación, si la hay"] },
      { t: "Para algo que no mediste o no sabes", p: ["Lo que sí sabes", "Lo que no mediste", "El trabajo futuro que lo resuelve"], ej: "No medí el uso de CPU, así que no afirmo nada sobre su consumo, y medirlo es parte del trabajo futuro. Nunca pases la pregunta." }
    ];
    document.getElementById("formulas").innerHTML = pasos.map(function (f) {
      return '<div class="panel"><h3>' + esc(f.t) + '</h3><ol class="pasos">' + f.p.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ol>' + (f.ej ? '<p class="vnota" style="margin-top:10px">Ejemplo. ' + esc(f.ej) + '</p>' : '') + '</div>';
    }).join("") +
      '<div class="panel"><h3>Reglas del guion</h3><ol class="reglas">' + D.reglas.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join("") + '</ol>' +
      '<ul class="trampas" style="margin-top:12px">' + (window.TRAMPAS_FORMA || []).map(function (x) { return '<li><span class="no">' + esc(x.no) + '</span><span class="si">' + esc(x.si) + '</span></li>'; }).join("") + '</ul></div>';
  })();

  /* ── practicar ── */
  var PROB = D.probables.map(function (q, i) {
    return { id: "x" + (i + 1), n: null, tema: "prob", corto: q.titulo.replace(/[¿?.]/g, "").trim(), titulo: q.titulo, respuesta: q.respuesta, donde: q.donde, notas: [], extras: [] };
  });
  PROB.forEach(function (p) { porId[p.id] = p; });
  temaBanco.prob = { id: "prob", nombre: "Probables que aún no salen" };
  function ensayoHTML(e) {
    return '<div class="ens"><div class="ens-cab"><strong>Ronda ' + ultima + ' · ' + esc(PROF[e.p] || "") + ' · ' + esc(e.tit) + '</strong>' + chip({ r: ultima, p: e.p, v: e.nota }, false) + '</div>' +
      '<dl><dt>La pregunta</dt><dd>' + txt(e.pregunta) + '</dd><dt>Lo que dijiste</dt><dd>' + txt(e.dijo) + '</dd><dt>Lo que faltó</dt><dd>' + txt(e.falto) + '</dd>' +
      '<dt>Respuesta sugerida</dt><dd class="sug">' + txt(e.sugerida) + '</dd><dt>Respaldo</dt><dd class="muted">' + txt(e.respaldo) + '</dd></dl>' +
      (e.ojo ? '<div class="extra correccion"><span class="eyebrow">Ojo, revisado contra la tesis</span><p>' + txt(e.ojo) + '</p></div>' : '') + '</div>';
  }
  function cartaHTML(p) {
    var tb = temaBanco[p.tema], tv = temaDePregunta[p.id];
    var izq = '<div class="col"><div class="bloque"><span class="eyebrow">Respuesta correcta</span><p class="respuesta">' + txt(p.respuesta) + '</p></div>' +
      (p.repreguntan ? '<div class="bloque"><span class="eyebrow">Si te repreguntan</span><p>' + txt(p.repreguntan) + '</p></div>' : '') +
      (p.extras || []).map(function (e) { return '<div class="bloque extra' + (/correcci|ojo|decisi/i.test(e.t) ? ' correccion' : '') + '"><span class="eyebrow">' + esc(e.t) + '</span><p>' + txt(e.x) + '</p></div>'; }).join("") + '</div>';
    var der = '<div class="col">' + (p.costo ? '<div class="bloque costo"><span class="eyebrow">Lo que costó</span><p>' + txt(p.costo) + '</p></div>' : '') +
      (p.figuras || []).map(function (f) { return '<figure class="fig"><img src="' + esc(f.src) + '" alt="' + esc(f.cap) + '" loading="lazy"><figcaption>' + esc(f.cap) + '</figcaption></figure>'; }).join("") +
      (p.links ? '<div class="bloque"><span class="eyebrow">Para estudiar, en inglés</span><ul class="links">' + p.links.map(function (l) { return '<li><a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.t) + '</a><span>' + esc(l.d) + '</span></li>'; }).join("") + '</ul></div>' : '') +
      (p.donde ? '<p class="donde"><strong>Dónde está.</strong> ' + txt(p.donde) + '</p>' : '') + '</div>';
    return '<article class="carta" id="p-' + p.id + '" data-id="' + p.id + '">' +
      '<div class="carta-cab"><span class="eyebrow">' + (p.n ? 'Pregunta ' + p.n + ' · ' : '') + esc(tb ? tb.nombre : "") + '</span>' + (p.notas.length ? p.notas.map(function (n) { return chip(n, true); }).join("") : '<span class="nota gris">sin nota</span>') + '</div>' +
      '<p class="pregunta">' + txt(p.titulo) + '</p>' + (p.quien ? '<p class="quien">' + txt(p.quien) + '</p>' : '') +
      '<div class="carta-acc"><button type="button" class="btn" data-revelar>Ver respuesta</button>' + (tv ? '<a class="btn sec" href="#t-' + tv.id + '" data-tema="' + tv.id + '">Ver explicación visual</a>' : '') + '</div>' +
      '<div class="cuerpo">' + izq + der + (p.ensayo ? '<div class="ens-fila">' + p.ensayo.map(ensayoHTML).join("") + '</div>' : '') + '</div></article>';
  }
  var grupos = D.temas.map(function (t) { return { t: t, ps: P.filter(function (p) { return p.tema === t.id; }) }; });
  grupos.push({ t: temaBanco.prob, ps: PROB });
  document.getElementById("cartas").innerHTML = grupos.map(function (g) {
    return '<div class="grupo-banco" data-grupo="' + g.t.id + '"><h3>' + esc(g.t.nombre) + ' <span class="eyebrow">' + g.ps.length + (g.ps.length === 1 ? ' pregunta' : ' preguntas') + '</span></h3>' + g.ps.map(cartaHTML).join("") + '</div>';
  }).join("");
  var chips = document.getElementById("chipsTema");
  chips.innerHTML = '<button type="button" class="chip" data-t="todos" aria-pressed="true">Todos los temas</button>' + grupos.map(function (g) { return '<button type="button" class="chip" data-t="' + g.t.id + '" aria-pressed="false">' + esc(g.t.nombre) + '</button>'; }).join("");
  var est = { tema: "todos", filtro: "todas", texto: "" };
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var indice = {};
  Object.keys(porId).forEach(function (id) {
    var p = porId[id];
    indice[id] = norm([p.corto, p.titulo, p.quien, p.respuesta, p.repreguntan, p.costo, p.donde].concat((p.extras || []).map(function (e) { return e.x; })).join(" "));
  });
  function pasa(p) {
    if (est.tema !== "todos" && String(p.tema) !== String(est.tema)) return false;
    if (est.filtro === "bajo4" && !p.notas.some(function (n) { return n.v < 4; })) return false;
    if (est.filtro === "omit" && !p.notas.some(function (n) { return n.om; })) return false;
    if (est.filtro === "r5" && !p.notas.some(function (n) { return n.r === ultima; })) return false;
    if (est.filtro === "sin" && p.notas.length) return false;
    if (est.texto) return est.texto.split(/\s+/).every(function (w) { return indice[p.id].indexOf(w) !== -1; });
    return true;
  }
  function filtrar() {
    var vis = 0, tot = 0;
    grupos.forEach(function (g) {
      var hay = 0;
      g.ps.forEach(function (p) { tot++; var ok = pasa(p); if (ok) { hay++; vis++; } document.getElementById("p-" + p.id).classList.toggle("oculto", !ok); });
      document.querySelector('[data-grupo="' + g.t.id + '"]').classList.toggle("oculto", !hay);
    });
    document.getElementById("conteo").textContent = "Mostrando " + vis + " de " + tot;
    document.getElementById("sinRes").hidden = vis > 0;
  }
  chips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-t]"); if (!b) return;
    est.tema = b.getAttribute("data-t");
    chips.querySelectorAll("[data-t]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    filtrar();
  });
  var seg = document.getElementById("segFiltro");
  seg.addEventListener("click", function (e) {
    var b = e.target.closest("[data-f]"); if (!b) return;
    est.filtro = b.getAttribute("data-f");
    seg.querySelectorAll("[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    filtrar();
  });
  document.getElementById("buscar").addEventListener("input", function (e) { est.texto = norm(e.target.value.trim()); filtrar(); });
  function abrir(c, si) {
    c.classList.toggle("abierta", si);
    var b = c.querySelector("[data-revelar]"); if (b) b.textContent = si ? "Ocultar respuesta" : "Ver respuesta";
  }
  document.getElementById("cartas").addEventListener("click", function (e) {
    var b = e.target.closest("[data-revelar]"); if (!b) return;
    var c = b.closest(".carta"); abrir(c, !c.classList.contains("abierta"));
  });

  /* ── navegación interna ── */
  function destacar(elx) { elx.classList.add("destacar"); setTimeout(function () { elx.classList.remove("destacar"); }, 1800); }
  function irPregunta(id, abrirla) {
    var c = document.getElementById("p-" + id); if (!c) return;
    if (c.classList.contains("oculto")) {
      est.tema = "todos"; est.filtro = "todas"; est.texto = ""; document.getElementById("buscar").value = "";
      chips.querySelectorAll("[data-t]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-t") === "todos" ? "true" : "false"); });
      seg.querySelectorAll("[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-f") === "todas" ? "true" : "false"); });
      filtrar();
    }
    if (abrirla) abrir(c, true);
    c.scrollIntoView({ behavior: U.quieto() ? "auto" : "smooth", block: "start" });
    destacar(c);
    try { history.replaceState(null, "", "#p-" + id); } catch (e) {}
  }
  function irTema(id) {
    var m = document.getElementById("t-" + id); if (!m) return;
    m.scrollIntoView({ behavior: U.quieto() ? "auto" : "smooth", block: "start" });
    destacar(m);
    try { history.replaceState(null, "", "#t-" + id); } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-ir]");
    if (a) { e.preventDefault(); irPregunta(a.getAttribute("data-ir"), false); return; }
    var t = e.target.closest("[data-tema]");
    if (t) { e.preventDefault(); irTema(t.getAttribute("data-tema")); }
  });
  document.getElementById("azar").addEventListener("click", function () {
    var vis = Array.prototype.filter.call(document.querySelectorAll(".carta"), function (c) { return !c.classList.contains("oculto"); });
    if (!vis.length) return;
    vis.forEach(function (c) { abrir(c, false); });
    irPregunta(vis[Math.floor(Math.random() * vis.length)].getAttribute("data-id"), false);
  });

  /* ── antes del día ── */
  function enlaces(s) {
    return txt(s).replace(/(preguntas? )(\d+)( y (\d+))?/g, function (m, pre, a, y, b) {
      var out = pre + '<a href="#p-b' + a + '" data-ir="b' + a + '">' + a + '</a>';
      if (b) out += ' y <a href="#p-b' + b + '" data-ir="b' + b + '">' + b + '</a>';
      return out;
    });
  }
  function lista(id, items, clave) {
    var hechos = U.leer("chk." + clave, {}), ul = document.getElementById(id);
    function prog() { document.getElementById("prog-" + clave).textContent = Object.keys(hechos).filter(function (k) { return hechos[k]; }).length + " de " + items.length; }
    ul.innerHTML = items.map(function (it, i) {
      return '<li><label><input type="checkbox" id="chk-' + clave + '-' + i + '" data-i="' + i + '"' + (hechos[i] ? " checked" : "") + '><span><strong>' + esc(it.t) + '</strong>' + enlaces(it.x) + '</span></label></li>';
    }).join("");
    ul.addEventListener("change", function (e) { var i = e.target.getAttribute("data-i"); if (i == null) return; hechos[i] = e.target.checked; U.guardar("chk." + clave, hechos); prog(); });
    prog();
  }
  lista("lista-solo", D.solo, "solo");
  lista("lista-dif", D.diferencias, "dif");
  lista("lista-lam", D.laminas.concat(D.ensayo.laminas.map(function (l) { return { t: l.t + " (ronda " + ultima + ")", x: l.x }; })), "lam");
  document.getElementById("orden").innerHTML = D.orden.map(function (o) { return '<li><strong>' + esc(o.t) + '</strong>' + enlaces(o.x) + '</li>'; }).join("");
  document.getElementById("corregidas").innerHTML = D.corregidas.map(function (c) { return '<p>' + esc(c) + '</p>'; }).join("");

  /* ── inicio ── */
  filtrar();
  var h = location.hash;
  if (/^#p-[a-z]\d+$/.test(h)) setTimeout(function () { irPregunta(h.slice(3), true); }, 80);
  else if (/^#t-[a-z0-9]+$/.test(h)) setTimeout(function () { irTema(h.slice(3)); }, 80);
})();
