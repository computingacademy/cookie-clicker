function fireworks(config) {
  let parentElement = config.parentElement || documnet.querySelector('body');
  let element = config.element;
  let number = config.number || 10;
  let delay = config.delay || 0;
  let duration = config.duration || 3000;
  let x = config.x || 0;
  let y = config.y || 0;
  let width = config.width || 25;
  let height = config.height || 25;
  let scale = config.scale || 1;

  let fireworkContainer = document.createElement('span');
  fireworkContainer.style.position = 'absolute';
  fireworkContainer.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  parentElement.appendChild(fireworkContainer);

  for (var i=0; i<number; i++) {
    let container = document.createElement('span');
    container.style.position = 'absolute';
    container.style.transform = `translate(${-width/2}px, ${-height/2}px) rotate(${i*360/number}deg)`;
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
  cookie.src = 'images/mini-cookie-full.png';
  cookie.style.height = `${height}px`;

  fireworks({parentElement: parentElement, element: cookie, number: 20, delay: 0, x: x, y: y, height: height, scale: scale});
  fireworks({parentElement: parentElement, element: cookie, number: 15, delay: 200, x: x, y: y, height: height, scale: scale});
  fireworks({parentElement: parentElement, element: cookie, number: 10, delay: 400, x: x, y: y, height: height, scale: scale});
  fireworks({parentElement: parentElement, element: cookie, number: 5, delay: 500, x: x, y: y, height: height, scale: scale});
}

function screenCookieFirework(parentElement, x, y) {
  cookieFirework(parentElement, x, y, 3);
}
