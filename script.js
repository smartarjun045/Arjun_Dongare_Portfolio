const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- THEME TOGGLE ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
function setTheme(t){
  root.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'light' ? '☀️' : '🌙';
}
setTheme('dark');
themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  setTheme(next);
});

/* ---------- CURSOR GLOW ---------- */
if(!reduceMotion){
  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mx', e.clientX + 'px');
    document.documentElement.style.setProperty('--my', e.clientY + 'px');
  });
}

/* ---------- TYPING EFFECT ---------- */
const promptEl = document.querySelector('.prompt-line');
const phrases = ["$ whoami", "> aspiring data scientist", "> full-stack developer in progress"];
let pi = 0, ci = 0, deleting = false;
function type(){
  const current = phrases[pi];
  if(!deleting){
    ci++;
    if(ci > current.length){ deleting = true; setTimeout(type, 1400); return; }
  } else {
    ci--;
    if(ci < 0){ deleting = false; pi = (pi+1) % phrases.length; ci = 0; }
  }
  promptEl.innerHTML = current.slice(0, ci) + '<span class="caret"></span>';
  setTimeout(type, deleting ? 35 : 55);
}
if(promptEl) type();

/* ---------- REVEAL ON SCROLL ---------- */
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } });
}, {threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

/* ---------- MOBILE NAV ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', ()=> navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> navLinks.classList.remove('open')));

/* ---------- 3D TILT (profile photo + project + cert cards) ---------- */
function attachTilt(el, {max = 10, glare = false} = {}){
  if(reduceMotion) return;
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max;
    const ry = (px - 0.5) * max;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    if(glare){
      el.style.setProperty('--px', `${px*100}%`);
      el.style.setProperty('--py', `${py*100}%`);
    }
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}
document.querySelectorAll('.profile-card').forEach(el => attachTilt(el, {max:14}));
document.querySelectorAll('.proj-card').forEach(el => attachTilt(el, {max:8, glare:true}));
document.querySelectorAll('.cert-card').forEach(el => attachTilt(el, {max:8}));

/* ---------- CERT SCROLLER ARROWS ---------- */
const scroller = document.getElementById('certScroller');
document.querySelectorAll('.scroll-arrow').forEach(btn => {
  btn.addEventListener('click', () => {
    const dir = btn.classList.contains('left') ? -1 : 1;
    scroller.scrollBy({left: dir * 300, behavior:'smooth'});
  });
});

/* ---------- LIGHTBOX ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.querySelectorAll('[data-cert-img]').forEach(el => {
  el.addEventListener('click', () => {
    lightboxImg.src = el.getAttribute('data-cert-img');
    lightbox.classList.add('open');
  });
});
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if(e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') lightbox.classList.remove('open'); });

/* ---------- PARTICLE NETWORK (hero background) ---------- */
const canvas = document.getElementById('particles');
if(canvas && !reduceMotion){
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const COUNT = 46;

  function resize(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function init(){
    particles = Array.from({length: COUNT}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.35, vy: (Math.random()-0.5)*0.35,
      isData: Math.random() > 0.5
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
    });
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if(d < 130){
          ctx.strokeStyle = `rgba(150,170,185,${(1 - d/130) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      ctx.fillStyle = p.isData ? 'rgba(232,163,61,0.75)' : 'rgba(69,184,172,0.75)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', () => { resize(); });
  resize(); init(); step();
}
