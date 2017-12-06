function fireworks(config) {
  let parentElement = config.parentElement || documnet.querySelector('body');
  let element = config.element;
  let number = config.number || 10;
  let delay = config.delay || 0;
  let duration = config.duration || 3000;
  let x = config.x || 0;
  let y = config.y || 0;
  let scale = config.scale || 1;

  let fireworkContainer = document.createElement('span');
  fireworkContainer.style.position = 'absolute';
  fireworkContainer.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  parentElement.appendChild(fireworkContainer);

  for (var i=0; i<number; i++) {
    let container = document.createElement('span');
    container.style.position = 'absolute';
    container.style.transform = `rotate(${i*360/number}deg)`;
    fireworkContainer.append(container);

    let firework = document.createElement('span');
    container.appendChild(firework);
    firework.classList.add('firework');
    container.style.position = 'absolute';
    firework.style.animationDelay = `${delay}ms`;
    firework.style.animationDuration = `${duration}ms`;

    let newElement = element.cloneNode();
    firework.appendChild(newElement);
  }

  setTimeout(function() {
    fireworkContainer.remove();
  }, duration+1);
}

function cookieFirework(parentElement, x, y, scale) {
  let cookie = document.createElement('img');
  let height = 25;
  cookie.src = 'images/choc-chip.png';
  cookie.style.height = `${height}px`;

  fireworks({parentElement: parentElement, element: cookie, number: 20, delay: 0, x: x, y: y, scale: scale});
  fireworks({parentElement: parentElement, element: cookie, number: 15, delay: 200, x: x, y: y, scale: scale});
  fireworks({parentElement: parentElement, element: cookie, number: 10, delay: 400, x: x, y: y, scale: scale});
  fireworks({parentElement: parentElement, element: cookie, number: 5, delay: 500, x: x, y: y, scale: scale});
}

function screenCookieFirework(parentElement) {
  cookieFirework(parentElement, window.screen.width/2, window.screen.availHeight/3, 3);
}
