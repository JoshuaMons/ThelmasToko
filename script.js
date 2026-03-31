/* ============================================================
   Thelma's Toko — script.js
   Landing page interactivity
============================================================ */

'use strict';

/* ── Helpers ────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── DOM refs ───────────────────────────────────────────── */
const navbar     = $('#navbar');
const hamburger  = $('#hamburger');
const navLinks   = $('#nav-links');
const navOverlay = $('#nav-overlay');
const backToTop  = $('#back-to-top');
const footerYear = $('#footer-year');
const allNavLinks = $$('.nav-link');
const sections    = $$('section[id]');

/* ── Footer year ────────────────────────────────────────── */
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────────────────
   NAVBAR — scroll behaviour
───────────────────────────────────────────────────────── */
function onScroll() {
  const y = window.scrollY;

  /* Scrolled style */
  if (navbar) navbar.classList.toggle('scrolled', y > 60);

  /* Back-to-top visibility */
  if (backToTop) {
    backToTop.classList.toggle('visible', y > 400);
  }

  /* Active nav link based on current section */
  highlightActiveSection(y);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); /* run once on load */

/* ─────────────────────────────────────────────────────────
   ACTIVE NAV LINK — scroll spy
───────────────────────────────────────────────────────── */
function highlightActiveSection(scrollY) {
  const offset = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--navbar-h')) || 80;

  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - offset - 8;
    if (scrollY >= top) {
      current = section.id;
    }
  });

  allNavLinks.forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

/* ─────────────────────────────────────────────────────────
   HAMBURGER — mobile nav
───────────────────────────────────────────────────────── */
function openNav() {
  hamburger.classList.add('open');
  navLinks.classList.add('open');
  navOverlay.classList.add('visible');
  navOverlay.removeAttribute('aria-hidden');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeNav() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('visible');
  navOverlay.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeNav() : openNav();
  });
}

if (navOverlay) {
  navOverlay.addEventListener('click', closeNav);
}

/* Close on nav link click (mobile) */
allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) {
      closeNav();
    }
  });
});

/* Close on Escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    closeNav();
    hamburger.focus();
  }
});

/* ─────────────────────────────────────────────────────────
   SMOOTH SCROLL — internal anchor links
───────────────────────────────────────────────────────── */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = $(this.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    const navbarH = navbar?.offsetHeight ?? 70;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navbarH;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
});

/* ─────────────────────────────────────────────────────────
   BACK TO TOP button
───────────────────────────────────────────────────────── */
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────────────────
   INTERSECTION OBSERVER — reveal animations
───────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        /* Stagger delay for siblings */
        const siblings = $$('.reveal', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.1}s`;

        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

/* Apply .reveal to key elements */
const revealTargets = [
  ...$$('.service-card'),
  ...$$('.review-card'),
  ...$$('.gallery-item'),
  ...$$('.contact-list li'),
  ...$$('.about-content > *'),
  ...$$('.about-image-wrap'),
];

revealTargets.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ─────────────────────────────────────────────────────────
   GALLERY — lightbox (click to expand)
───────────────────────────────────────────────────────── */
function buildLightbox() {
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Afbeelding vergroot');
  lb.innerHTML = `
    <div class="lb-backdrop"></div>
    <div class="lb-content">
      <button class="lb-close" aria-label="Sluiten"><i class="fa-solid fa-xmark"></i></button>
      <img class="lb-img" src="" alt="" />
      <p class="lb-caption"></p>
    </div>
  `;
  document.body.appendChild(lb);

  /* Styles injected dynamically to keep CSS file clean */
  const style = document.createElement('style');
  style.textContent = `
    #lightbox {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 999;
      align-items: center;
      justify-content: center;
    }
    #lightbox.open { display: flex; }
    .lb-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.88);
      backdrop-filter: blur(6px);
      cursor: zoom-out;
    }
    .lb-content {
      position: relative;
      z-index: 1;
      max-width: min(900px, 95vw);
      max-height: 95vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .75rem;
    }
    .lb-img {
      width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 24px 80px rgba(0,0,0,.6);
      animation: lbIn .3s cubic-bezier(.4,0,.2,1);
    }
    @keyframes lbIn {
      from { opacity: 0; transform: scale(.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    .lb-caption {
      color: rgba(255,255,255,.8);
      font-size: .88rem;
      font-family: 'Poppins', sans-serif;
    }
    .lb-close {
      position: absolute;
      top: -2.5rem;
      right: 0;
      background: rgba(255,255,255,.15);
      border: none;
      color: #fff;
      font-size: 1.1rem;
      width: 2.2rem;
      height: 2.2rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: background .2s;
      font-family: inherit;
    }
    .lb-close:hover { background: rgba(255,255,255,.3); }
  `;
  document.head.appendChild(style);

  const lbImg     = lb.querySelector('.lb-img');
  const lbCaption = lb.querySelector('.lb-caption');
  const lbClose   = lb.querySelector('.lb-close');
  const lbBackdrop = lb.querySelector('.lb-backdrop');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lbCaption.textContent = alt;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';

    /* Focus trap */
    lbClose.focus();
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('open')) closeLightbox();
  });

  /* Attach to gallery images */
  $$('.gallery-item img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });
  });
}

buildLightbox();

/* ─────────────────────────────────────────────────────────
   HOVER parallax on hero (mouse movement)
───────────────────────────────────────────────────────── */
const heroBg = $('.hero-bg-img img');
if (heroBg) {
  const hero = $('.hero');
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
    heroBg.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    heroBg.style.transform = 'scale(1.06) translate(0,0)';
  });
}

/* ─────────────────────────────────────────────────────────
   CONSOLE SIGNATURE
───────────────────────────────────────────────────────── */
console.log(
  '%c🌶️ Thelma\'s Toko — Tilburg',
  'color: #c8382a; font-weight: bold; font-size: 14px;'
);
