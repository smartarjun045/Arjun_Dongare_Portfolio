'use strict';
(() => {
  const menu = document.getElementById('navigation');
  const menuToggle = document.getElementById('menu-toggle');
  function closeMenu() { menu.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }
  menuToggle.addEventListener('click', () => { const open = menuToggle.getAttribute('aria-expanded') !== 'true'; menuToggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('open', open); });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuToggle.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  const cards = [...document.querySelectorAll('[data-category]')];
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    let visible = 0;
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) { visible++; card.classList.add('visible'); } });
    document.getElementById('project-count').textContent = `${visible} projects`;
  }));

  const copy = document.getElementById('copy-email');
  const dockCopy = document.getElementById('dock-copy');
  const toast = document.getElementById('watermelon-toast');
  let copyTimer;
  let toastTimer;

  async function copyEmailHandler() {
    let success = false;
    try {
      await navigator.clipboard.writeText('smartarjun045@gmail.com');
      success = true;
    } catch {
      try {
        const input = document.createElement('textarea');
        input.value = 'smartarjun045@gmail.com';
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.focus();
        input.select();
        success = document.execCommand('copy');
        document.body.removeChild(input);
      } catch {
        success = false;
      }
    }

    if (copy) copy.textContent = success ? 'Copied!' : 'smartarjun045@gmail.com';
    if (dockCopy) dockCopy.classList.toggle('copied', success);
    const copyStatus = document.getElementById('copy-status');
    if (copyStatus) copyStatus.textContent = success ? 'Email address copied to clipboard.' : 'Email: smartarjun045@gmail.com';

    if (toast) {
      toast.querySelector('.toast-title').textContent = success ? 'Copied To Clipboard' : 'Email Address';
      toast.querySelector('.toast-desc').textContent = 'smartarjun045@gmail.com';
      toast.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.classList.remove('visible'); }, 3200);
    }

    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      if (copy) copy.textContent = 'Copy Email';
      if (dockCopy) dockCopy.classList.remove('copied');
    }, 2500);
  }

  if (copy) copy.addEventListener('click', copyEmailHandler);
  if (dockCopy) dockCopy.addEventListener('click', copyEmailHandler);
  document.getElementById('year').textContent = String(new Date().getFullYear());

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.getElementById('motion-toggle');
  let userPaused = false;
  try { userPaused = localStorage.getItem('portfolio-motion') === 'paused'; } catch { /* Storage is optional. */ }
  let paused = userPaused || reducedMotion.matches;
  let renderStatic = () => {};
  let startAnimation = () => {};
  function updateMotion() {
    paused = userPaused || reducedMotion.matches;
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.innerHTML = paused ? 'Motion Paused <span aria-hidden="true">▷</span>' : 'Pause Motion <span aria-hidden="true">Ⅱ</span>';
    motionButton.disabled = reducedMotion.matches;
    motionButton.title = reducedMotion.matches ? 'Reduced motion is enabled in your device settings' : 'Toggle the animated 3D sculpture';
    if (paused) renderStatic(); else startAnimation();
  }
  motionButton.addEventListener('click', () => { userPaused = !userPaused; try { localStorage.setItem('portfolio-motion', userPaused ? 'paused' : 'playing'); } catch { /* Storage is optional. */ } updateMotion(); });
  reducedMotion.addEventListener('change', updateMotion);

  if ('IntersectionObserver' in window && !paused) {
    const reveal = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveal.unobserve(entry.target); } }); }, { threshold: .07 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('will-reveal'); reveal.observe(el); });
  }

  // A projected 3D torus: batched depth buckets for <1.5ms per frame, zero runtime deps.
  const canvas = document.getElementById('orb');
  const context = canvas.getContext('2d');
  if (!context) { updateMotion(); return; }
  canvas.parentElement.classList.add('canvas-ready');
  let width = 0, height = 0, phase = 0, lastFrame = 0, raf = 0, inView = true, autoSpinActive = false;
  let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
  const RINGS = 40, TUBES = 14;
  const points = [];
  for (let ring = 0; ring < RINGS; ring++) {
    const u = ring / RINGS * Math.PI * 2;
    const cu = Math.cos(u), su = Math.sin(u);
    for (let tube = 0; tube < TUBES; tube++) {
      const v = tube / TUBES * Math.PI * 2;
      const radius = 1.35 + .54 * Math.cos(v);
      points.push({ x: radius * cu, y: radius * su, z: .54 * Math.sin(v), band: tube % 3 === 0 });
    }
  }
  const BUCKETS = 5;
  const baseBins = Array.from({ length: BUCKETS }, () => []);
  const bandBins = Array.from({ length: BUCKETS }, () => []);
  const BASE_STYLES = ['rgba(20,75,135,0.28)','rgba(22,95,165,0.46)','rgba(26,115,190,0.65)','rgba(30,130,210,0.82)','rgba(35,148,225,0.96)'];
  const BAND_STYLES = ['rgba(2,132,199,0.52)','rgba(2,132,199,0.68)','rgba(2,132,199,0.84)','rgba(2,132,199,0.95)','rgba(2,132,199,1)'];
  const TAU = Math.PI * 2;

  function draw() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    for (let b = 0; b < BUCKETS; b++) { baseBins[b].length = 0; bandBins[b].length = 0; }
    const rx = .85 + currentY * .3, ry = -.35 + currentX * .35, rz = -.48 + phase;
    const sx = Math.sin(rx), cx = Math.cos(rx), sy = Math.sin(ry), cy = Math.cos(ry), sz = Math.sin(rz), cz = Math.cos(rz);
    const minDim = Math.min(width, height);
    const scale = minDim * .225;
    const hx = width * .5, hy = height * .5;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x1 = p.x * cz - p.y * sz, y1 = p.x * sz + p.y * cz;
      const y2 = y1 * cx - p.z * sx, z2 = y1 * sx + p.z * cx;
      const x3 = x1 * cy + z2 * sy, z3 = -x1 * sy + z2 * cy;
      const perspective = 5 / (5 - z3);
      let bin = ((z3 + 1.95) * 1.28) | 0;
      if (bin < 0) bin = 0; else if (bin >= BUCKETS) bin = BUCKETS - 1;
      const list = p.band ? bandBins[bin] : baseBins[bin];
      list.push(hx + x3 * scale * perspective, hy + y2 * scale * perspective, (p.band ? 1.35 : 0.9) * perspective);
    }

    for (let b = 0; b < BUCKETS; b++) {
      const base = baseBins[b];
      if (base.length) {
        context.fillStyle = BASE_STYLES[b];
        context.beginPath();
        for (let i = 0; i < base.length; i += 3) {
          const px = base[i], py = base[i + 1], r = base[i + 2];
          context.moveTo(px + r, py);
          context.arc(px, py, r, 0, TAU);
        }
        context.fill();
      }
      const band = bandBins[b];
      if (band.length) {
        context.fillStyle = BAND_STYLES[b];
        context.beginPath();
        for (let i = 0; i < band.length; i += 3) {
          const px = band[i], py = band[i + 1], r = band[i + 2];
          context.moveTo(px + r, py);
          context.arc(px, py, r, 0, TAU);
        }
        context.fill();
      }
    }

    context.strokeStyle = 'rgba(2, 132, 199, 0.28)';
    context.lineWidth = .8;
    context.beginPath();
    context.ellipse(hx, hy, minDim * .44, minDim * .38, -.5, 0, TAU);
    context.stroke();
    context.fillStyle = '#0284c7';
    context.beginPath();
    context.arc(width * .8, height * .2, 2.5, 0, TAU);
    context.fill();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.5 : 2);
    const nw = Math.round(width * dpr), nh = Math.round(height * dpr);
    if (canvas.width !== nw || canvas.height !== nh) { canvas.width = nw; canvas.height = nh; }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function frame(time) {
    raf = 0;
    if (paused || !inView || document.hidden || !autoSpinActive) return;
    if (time - lastFrame >= 32) { const delta = Math.min(time - lastFrame, 64); phase += delta * .0001; currentX += (pointerX - currentX) * .07; currentY += (pointerY - currentY) * .07; draw(); lastFrame = time; }
    raf = requestAnimationFrame(frame);
  }
  startAnimation = () => { if (autoSpinActive && !raf && !paused && inView && !document.hidden) { lastFrame = performance.now(); raf = requestAnimationFrame(frame); } };
  renderStatic = () => { cancelAnimationFrame(raf); raf = 0; draw(); };
  function activateSpin() { if (!autoSpinActive) { autoSpinActive = true; startAnimation(); } }
  ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(evt => window.addEventListener(evt, activateSpin, { once: true, passive: true }));
  setTimeout(activateSpin, 6000);
  canvas.addEventListener('pointermove', event => { if (paused || event.pointerType === 'touch') return; const rect = canvas.getBoundingClientRect(); pointerX = (event.clientX - rect.left) / rect.width * 2 - 1; pointerY = (event.clientY - rect.top) / rect.height * 2 - 1; activateSpin(); }, { passive: true });
  canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (inView) startAnimation(); else { cancelAnimationFrame(raf); raf = 0; } }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else startAnimation(); });
  if (window.matchMedia('(pointer: coarse)').matches) document.querySelector('.interaction-hint').textContent = 'A STUDY IN FORM & MOTION';
  resize();
  updateMotion();

  // Watermelon UI: Card Spotlight cursor tracking
  const spotlightCards = document.querySelectorAll('.project-card, .skill-column');
  spotlightCards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  });

  // Watermelon UI: Dock Scroll Spy via IntersectionObserver (zero forced reflow)
  const dock = document.querySelector('.watermelon-dock');
  const dockItems = document.querySelectorAll('.dock-item[data-dock]');
  if (dock && dockItems.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          dockItems.forEach(item => item.classList.toggle('active', item.dataset.dock === id));
        }
      }
    }, { rootMargin: '-25% 0px -55% 0px' });
    ['home', 'projects', 'services', 'about', 'experience', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }
})();
