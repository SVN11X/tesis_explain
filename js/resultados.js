/* Resultados: el plano del láser y los pasos estrechos */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;

  /* Dónde fallaría */
  V.fallaria = function (el) {
    var OK = U.ICO.OK, NO = U.ICO.NO;
    var lado = '<svg class="vsvg" viewBox="0 0 400 200" role="img" aria-label="Vista lateral del plano del láser">' +
      '<line class="k-ink" stroke-width="2" x1="10" y1="170" x2="390" y2="170"/>' +
      '<rect class="f-azul" x="30" y="138" width="56" height="30" rx="4"/><rect class="f-obst" x="50" y="124" width="16" height="14" rx="2"/>' +
      '<line class="k-rojo" stroke-width="2" stroke-dasharray="6 4" x1="66" y1="131" x2="390" y2="131"/>' +
      '<text class="t-s" x="100" y="124" style="fill:var(--rojo)">plano del láser</text>' +
      '<rect class="f-desc k-muted" x="190" y="78" width="110" height="10" rx="2"/><line class="k-muted" stroke-width="5" x1="198" y1="88" x2="198" y2="170"/><line class="k-muted" stroke-width="5" x1="292" y1="88" x2="292" y2="170"/>' +
      '<text class="t-m" x="245" y="70" text-anchor="middle">la cubierta no la ve</text>' +
      '<circle class="f-verde" cx="198" cy="131" r="5"/><circle class="f-verde" cx="292" cy="131" r="5"/><text class="t-s" x="245" y="150" text-anchor="middle">las patas sí</text>' +
      '<rect class="f-desc k-muted" x="330" y="150" width="40" height="20" rx="2"/><text class="t-m" x="350" y="192" text-anchor="middle">lo bajo, tampoco</text>' +
      '</svg>';
    var arriba = '<svg class="vsvg" viewBox="0 0 400 215" role="img" aria-label="Vista superior de un paso estrecho">' +
      '<rect class="f-obst" x="10" y="40" width="380" height="12"/>' +
      '<rect class="f-ambar-s" x="10" y="52" width="380" height="45"/>' +
      '<text class="t-s" x="386" y="80" text-anchor="end" style="fill:var(--ambar)">inflación 0,15 m</text>' +
      '<circle class="f-rojo-s k-rojo" fill-opacity=".45" stroke-width="1.5" stroke-dasharray="4 3" cx="160" cy="103" r="72"/>' +
      '<g transform="rotate(30 160 103)"><rect class="f-azul" fill-opacity=".8" x="102" y="61" width="116" height="84" rx="6"/></g>' +
      '<path class="k-rojo" stroke-width="4" d="M109 52 H211"/>' +
      '<text class="t-m t-b" x="160" y="30" text-anchor="middle" style="fill:var(--rojo)">la esquina llega a la pared</text>' +
      '<circle class="f-sup k-ink" stroke-width="2" cx="160" cy="103" r="5"/>' +
      '<path class="k-ink" stroke-width="1.2" fill="none" d="M165 106 L248 150"/>' +
      '<text class="t-m" x="252" y="154">centro, lo único que</text><text class="t-m" x="252" y="169">revisa el planificador</text>' +
      '<text class="t-s" x="160" y="200" text-anchor="middle" style="fill:var(--rojo)">alcance de la esquina, 0,24 m</text>' +
      '</svg>';
    el.innerHTML = '<div class="dos-pan"><figure><figcaption><b>Visto de lado</b><span>El láser mide en un solo plano</span></figcaption>' + lado + '</figure>' +
      '<figure><figcaption><b>Visto desde arriba</b><span>Un paso estrecho</span></figcaption>' + arriba + '</figure></div>' +
      '<div class="chips-no"><span>' + NO + 'vidrio y superficies muy reflectantes</span><span>' + NO + 'superficies muy absorbentes</span><span>' + NO + 'obstáculos rápidos</span><span>' + NO + 'suelos irregulares</span><span>' + NO + 'recorridos largos sin IMU</span></div>' +
      '<p class="vnota">Dibujos ilustrativos, no a escala exacta. El centro queda fuera de la zona de inflación, así que su costo es nulo, pero la esquina puede llegar a la pared. Su efecto no se cuantificó y es el trabajo futuro 4.</p>';
  };
})();
