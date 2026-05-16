/* ============================================================
   MÚSICA
   Los navegadores bloquean autoplay con sonido sin interacción.
   Solución: arranca silenciado (siempre permitido), se activa
   con el primer gesto del usuario sin que lo note.
   ============================================================ */
const musicBtn = document.getElementById('music-btn');
const bgMusic  = document.getElementById('bg-music');

window.addEventListener('load', () => {
  if (!bgMusic) return;

  bgMusic.volume = 0.65;
  bgMusic.muted  = true;   // silenciado → el navegador lo permite siempre

  bgMusic.play().then(() => {
    musicBtn.classList.add('playing');

    // Al primer gesto del usuario, activa el sonido
    const unmute = () => {
      bgMusic.muted = false;
    };
    ['click', 'touchstart', 'scroll', 'keydown'].forEach(e =>
      document.addEventListener(e, unmute, { once: true, passive: true })
    );
  }).catch(() => {
    // Si incluso el muted falla, espera primer clic
    const startOnClick = () => {
      bgMusic.muted = false;
      bgMusic.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
    };
    document.addEventListener('click', startOnClick, { once: true });
    document.addEventListener('touchstart', startOnClick, { once: true });
  });
});

/* ============================================================
   PETALS CANVAS
   ============================================================ */
(function () {
  const canvas = document.getElementById('petals-canvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#F5D1D3', '#EFC5C7', '#F9DBDD', '#E8B8BB', '#FDE4E6'];

  class Petal {
    constructor(randomY = false) { this.init(randomY); }
    init(randomY) {
      this.x      = Math.random() * canvas.width;
      this.y      = randomY ? Math.random() * canvas.height : -20;
      this.size   = Math.random() * 7 + 4;
      this.vy     = Math.random() * 1.2 + 0.5;
      this.vx     = (Math.random() - 0.5) * 0.8;
      this.angle  = Math.random() * Math.PI * 2;
      this.spin   = (Math.random() - 0.5) * 0.04;
      this.wobble = Math.random() * Math.PI * 2;
      this.wSpeed = Math.random() * 0.04 + 0.01;
      this.alpha  = Math.random() * 0.55 + 0.2;
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
      this.wobble += this.wSpeed;
      this.x += Math.sin(this.wobble) * 0.7 + this.vx;
      this.y += this.vy;
      this.angle += this.spin;
      if (this.y > canvas.height + 20 || this.x < -30 || this.x > canvas.width + 30) {
        this.init(false);
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: 40 }, () => new Petal(true));
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ============================================================
   NAVBAR
   ============================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('nav-hamburger');
const drawer    = document.getElementById('nav-drawer');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  drawer.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
});

drawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ============================================================
   COUNTDOWN
   ============================================================ */
const EVENT_DATE = new Date('2026-06-13T19:30:00');
const cdDays     = document.getElementById('cd-days');
const cdHours    = document.getElementById('cd-hours');
const cdMinutes  = document.getElementById('cd-minutes');
const cdSeconds  = document.getElementById('cd-seconds');

function pad(n) { return String(n).padStart(2, '0'); }

function animateFlip(el, newVal) {
  if (el.textContent === newVal) return;
  el.classList.add('flip-out');
  setTimeout(() => {
    el.textContent = newVal;
    el.classList.remove('flip-out');
    el.classList.add('flip-in');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('flip-in')));
  }, 140);
}

function tick() {
  const diff = EVENT_DATE - Date.now();
  if (diff <= 0) {
    document.querySelector('.countdown-wrapper').innerHTML =
      '<p style="font-family:var(--ff-script);font-size:2rem;color:#fff;letter-spacing:.1em">¡Hoy es el gran día! ✨</p>';
    return;
  }
  animateFlip(cdDays,    pad(Math.floor(diff / 86400000)));
  animateFlip(cdHours,   pad(Math.floor((diff % 86400000) / 3600000)));
  animateFlip(cdMinutes, pad(Math.floor((diff % 3600000)  / 60000)));
  animateFlip(cdSeconds, pad(Math.floor((diff % 60000)    / 1000)));
}
tick();
setInterval(tick, 1000);

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============================================================
   GALLERY LIGHTBOX
   ============================================================ */
const GALLERY_SRCS = [
  'Fotos/Img (1).jpeg',
  'Fotos/Img (3).jpeg',
  'Fotos/Img (4).jpeg',
  'Fotos/Img (5).jpeg',
];

let lbIndex    = 0;
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');

function openLightbox(idx) {
  lbIndex = ((idx % GALLERY_SRCS.length) + GALLERY_SRCS.length) % GALLERY_SRCS.length;
  lbImg.src = GALLERY_SRCS[lbIndex];
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.gallery-item').forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});
document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', () => openLightbox(lbIndex - 1));
document.getElementById('lb-next').addEventListener('click', () => openLightbox(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  openLightbox(lbIndex - 1);
  if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
});

/* ============================================================
   MUSIC BUTTON — pause / play directo sobre el audio HTML5
   ============================================================ */
musicBtn.addEventListener('click', () => {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.classList.remove('paused');
    musicBtn.classList.add('playing');
  } else {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    musicBtn.classList.add('paused');
  }
});

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  });
});
