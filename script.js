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
  let copyTimer;
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('smartarjun045@gmail.com');
      copy.textContent = 'Copied!';
      document.getElementById('copy-status').textContent = 'Email address copied to clipboard.';
      clearTimeout(copyTimer); copyTimer = setTimeout(() => { copy.textContent = 'Copy email'; }, 2500);
    } catch { document.getElementById('copy-status').textContent = 'Unable to copy. Select the email address, or use the email link to open your mail app.'; copy.textContent = 'Select email to copy'; }
  });
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
    motionButton.innerHTML = paused ? 'Motion paused <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
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

  // A projected 3D torus: no framework, WebGL runtime or network assets required.
  const canvas = document.getElementById('orb');
  const context = canvas.getContext('2d');
  if (!context) { updateMotion(); return; }
  canvas.parentElement.classList.add('canvas-ready');
  let width = 0, height = 0, phase = 0, lastFrame = 0, raf = 0, inView = true;
  let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
  const points = [];
  for (let ring = 0; ring < 100; ring++) {
    const u = ring / 100 * Math.PI * 2;
    for (let tube = 0; tube < 34; tube++) {
      const v = tube / 34 * Math.PI * 2;
      const radius = 1.35 + .54 * Math.cos(v);
      points.push({ x: radius * Math.cos(u), y: radius * Math.sin(u), z: .54 * Math.sin(v), band: tube % 3 === 0 });
    }
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    const rx = .85 + currentY * .3, ry = -.35 + currentX * .35, rz = -.48 + phase;
    const sx = Math.sin(rx), cx = Math.cos(rx), sy = Math.sin(ry), cy = Math.cos(ry), sz = Math.sin(rz), cz = Math.cos(rz);
    const scale = Math.min(width, height) * .225;
    const projected = points.map(p => {
      const x1 = p.x * cz - p.y * sz, y1 = p.x * sz + p.y * cz;
      const y2 = y1 * cx - p.z * sx, z2 = y1 * sx + p.z * cx;
      const x3 = x1 * cy + z2 * sy, z3 = -x1 * sy + z2 * cy;
      const perspective = 5 / (5 - z3);
      return { x: width / 2 + x3 * scale * perspective, y: height / 2 + y2 * scale * perspective, z: z3, band: p.band, size: perspective };
    }).sort((a,b) => a.z - b.z);
    for (const p of projected) {
      const brightness = (p.z + 2) / 4;
      const opacity = .16 + brightness * .72;
      context.fillStyle = `rgba(${Math.round(172 + brightness * 73)},${Math.round(104 + brightness * 69)},${Math.round(67 + brightness * 61)},${opacity})`;
      context.beginPath(); context.arc(p.x, p.y, (p.band ? 1.1 : .7) * p.size, 0, Math.PI * 2); context.fill();
    }
    context.strokeStyle = '#b58b6925'; context.lineWidth = .7;
    context.beginPath(); context.ellipse(width/2, height/2, Math.min(width,height)*.44, Math.min(width,height)*.38, -.5, 0, Math.PI*2); context.stroke();
    context.fillStyle = '#e9a17b'; context.beginPath(); context.arc(width*.8,height*.2,2,0,Math.PI*2); context.fill();
  }
  function resize() { const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr); context.setTransform(dpr,0,0,dpr,0,0); draw(); }
  function frame(time) {
    raf = 0;
    if (paused || !inView || document.hidden) return;
    if (time - lastFrame >= 32) { const delta = Math.min(time-lastFrame,64); phase += delta*.0001; currentX += (pointerX-currentX)*.07; currentY += (pointerY-currentY)*.07; draw(); lastFrame = time; }
    raf = requestAnimationFrame(frame);
  }
  startAnimation = () => { if (!raf && !paused && inView && !document.hidden) { lastFrame = performance.now(); raf = requestAnimationFrame(frame); } };
  renderStatic = () => { cancelAnimationFrame(raf); raf = 0; draw(); };
  canvas.addEventListener('pointermove', event => { if (paused || event.pointerType === 'touch') return; const rect = canvas.getBoundingClientRect(); pointerX = (event.clientX-rect.left)/rect.width*2-1; pointerY = (event.clientY-rect.top)/rect.height*2-1; }, { passive: true });
  canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize, { passive:true });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; if (inView) startAnimation(); else { cancelAnimationFrame(raf); raf=0; } }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf=0; } else startAnimation(); });
  if (window.matchMedia('(pointer: coarse)').matches) document.querySelector('.interaction-hint').textContent = 'A STUDY IN FORM & MOTION';
  resize(); updateMotion();
})();
