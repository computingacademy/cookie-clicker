'use strict';

function fireworks(config) {
  var parentElement = config.parentElement || documnet.querySelector('body');
  var element = config.element;
  var number = config.number || 10;
  var delay = config.delay || 0;
  var duration = config.duration || 3000;
  var x = config.x || 0;
  var y = config.y || 0;
  var width = config.width || 25;
  var height = config.height || 25;
  var scale = config.scale || 1;

  var fireworkContainer = document.createElement('span');
  fireworkContainer.style.position = 'absolute';
  fireworkContainer.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
  parentElement.appendChild(fireworkContainer);

  for (var i = 0; i < number; i++) {
    var container = document.createElement('span');
    container.style.position = 'absolute';
    container.style.transform = 'translate(' + -width / 2 + 'px, ' + -height / 2 + 'px) rotate(' + i * 360 / number + 'deg)';
    fireworkContainer.append(container);

    var firework = document.createElement('span');
    container.appendChild(firework);
    firework.classList.add('firework');
    container.style.position = 'absolute';
    firework.style.animationDelay = delay + 'ms';
    firework.style.animationDuration = duration + 'ms';

    var newElement = element.cloneNode();
    firework.appendChild(newElement);
  }

  setTimeout(function () {
    fireworkContainer.remove();
  }, duration + 1);
}

function cookieFirework(parentElement, x, y, scale) {
  var cookie = document.createElement('img');
  var height = 25;
  cookie.src = 'images/choc-chip.png';
  cookie.style.height = height + 'px';

  fireworks({ parentElement: parentElement, element: cookie, number: 20, delay: 0, x: x, y: y, height: height, scale: scale });
  fireworks({ parentElement: parentElement, element: cookie, number: 15, delay: 200, x: x, y: y, height: height, scale: scale });
  fireworks({ parentElement: parentElement, element: cookie, number: 10, delay: 400, x: x, y: y, height: height, scale: scale });
  fireworks({ parentElement: parentElement, element: cookie, number: 5, delay: 500, x: x, y: y, height: height, scale: scale });
}

function screenCookieFirework(parentElement, x, y) {
  cookieFirework(parentElement, x, y, 3);
}