/* Robot: el camino de una orden desde el computador hasta el motor */
(function () {
  "use strict";
  var V = window.VISUALES = window.VISUALES || {}, U = window.U;

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
