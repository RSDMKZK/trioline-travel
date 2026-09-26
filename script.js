(() => {
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const mix = (a, b, t) => a + (b - a) * t;
  const seq = document.querySelector('.flight-sequence');
  const windowScene = document.querySelector('.window-scene');
  const jetScene = document.querySelector('.jet-scene');
  const heroCopy = document.querySelector('.hero-copy');
  const heroSide = document.querySelector('.hero-side');
  const heroBottom = document.querySelector('.hero-bottom');
  const caption = document.querySelector('.sequence-caption');
  const header = document.querySelector('.site-header');
  const book = document.querySelector('.floating-book');
  let queued = false;

  function updateScroll() {
    queued = false;
    const rect = seq.getBoundingClientRect();
    const distance = Math.max(1, seq.offsetHeight - window.innerHeight);
    const p = clamp(-rect.top / distance);
    const reveal = clamp((p - .30) / .48);
    const windowFade = clamp((p - .48) / .27);
    windowScene.style.transform = `scale(${mix(1.02, 5.3, clamp(p / .78))})`;
    windowScene.style.opacity = String(1 - windowFade);
    windowScene.style.filter = `brightness(${mix(.73, .52, p)}) saturate(${mix(.76,.52,p)})`;
    jetScene.style.opacity = String(reveal);
    jetScene.style.transform = `scale(${mix(1.22, 1, reveal)})`;
    heroCopy.style.opacity = String(1 - clamp(p / .19));
    heroCopy.style.transform = `translateY(${mix(0,-38,clamp(p / .2))}px)`;
    heroSide.style.opacity = String(1 - clamp(p / .15));
    heroBottom.style.opacity = String(1 - clamp(p / .14));
    caption.style.opacity = String(clamp((p - .67) / .14) * (1 - clamp((p - .86) / .12)));
    caption.style.transform = `translate(-50%, ${mix(12,0,clamp((p-.67)/.14))}px)`;
    header.classList.toggle('scrolled', window.scrollY > 40);
    book.style.opacity = String(window.scrollY > window.innerHeight * 1.5 ? .88 : .76);
  }
  function requestScrollUpdate() {
    if (!queued) { queued = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateScroll();

  const appear = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  }), { threshold: .14 });
  document.querySelectorAll('.interlude,.closing').forEach(el => appear.observe(el));

  const advantages = [...document.querySelectorAll('.advantage')];
  const advantageImage = document.querySelector('.advantage-image img');
  const advantageNumber = document.querySelector('.adv-image-number');
  const imageSources = ['./reference/window.png','./reference/jet.png','./reference/window.png','./reference/jet.png'];
  const imageDescriptions = [
    'Warm sunset and cloudscape through a private aircraft window',
    'Black private jet moving above the clouds',
    'A private aircraft window opening onto the sky',
    'Black private jet in flight'
  ];
  advantages.forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.index);
    advantages.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle('active', active);
      item.setAttribute('aria-expanded', String(active));
      item.querySelector('.adv-plus').textContent = active ? '−' : '+';
    });
    advantageImage.style.opacity = '0.2';
    window.setTimeout(() => {
      advantageImage.src = imageSources[index];
      advantageImage.alt = imageDescriptions[index];
      advantageNumber.textContent = `0${index + 1} / 04`;
      advantageImage.style.opacity = '1';
    }, 170);
  }));

  const origin = document.querySelector('.route-origin b');
  document.querySelectorAll('.destination').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.destination').forEach(item => item.classList.toggle('active', item === button));
    origin.textContent = button.dataset.city.toUpperCase();
  }));

  const menu = document.querySelector('.menu-toggle');
  menu.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    let panel = document.querySelector('.mobile-panel');
    if (!panel) {
      panel = document.createElement('nav');
      panel.className = 'mobile-panel';
      panel.innerHTML = '<a href="#story">The experience</a><a href="#fleet">The aircraft</a><a href="#advantages">Advantages</a><a href="#reach">Our reach</a><a href="#inquire">Plan your flight ↗</a>';
      document.body.appendChild(panel);
      panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        menu.classList.remove('open'); panel.classList.remove('open');
      }));
    }
    panel.classList.toggle('open', open);
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  const orb = document.querySelector('.pointer-orb');
  window.addEventListener('pointermove', event => {
    orb.style.left = `${event.clientX}px`;
    orb.style.top = `${event.clientY}px`;
  }, { passive: true });
  document.querySelectorAll('a,button').forEach(control => {
    control.addEventListener('pointerenter', () => orb.classList.add('visible'));
    control.addEventListener('pointerleave', () => orb.classList.remove('visible'));
  });
})();
