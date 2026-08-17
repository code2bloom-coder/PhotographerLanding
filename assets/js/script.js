/* =========================================================
   Maya Cohen Photography — Landing Page Behaviors
   Sections: header, mobile menu, scroll reveal, gallery filter,
   testimonials carousel, contact form.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initHeroCamera();
  initGallery();
  initTestimonials();
  initContactForm();
  initBackToTop();
  initSourceProtection();
  document.getElementById('year').textContent = new Date().getFullYear();

  const dateField = document.getElementById('date');
  if (dateField) dateField.min = new Date().toISOString().split('T')[0];
});

/* ---------------- Header: solid background on scroll ---------------- */
function initHeader() {
  const header = document.getElementById('site-header');
  const toggleState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  toggleState();
  window.addEventListener('scroll', toggleState, { passive: true });
}

/* ---------------- Mobile menu ---------------- */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
  };
  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden');
  };

  toggle.addEventListener('click', () => {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

/* ---------------- Scroll reveal animations ---------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => entry.target.classList.add('is-revealed'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------------- Hero camera: tap fallback for the shutter animation ----------------
   :hover already opens the aperture on pointer devices; this just gives
   touch screens (no hover) a tap-triggered replay of the same CSS transition. */
function initHeroCamera() {
  const lens = document.querySelector('.hc-lens-group');
  if (!lens) return;

  lens.addEventListener('click', () => {
    lens.classList.remove('is-open');
    void lens.offsetWidth;
    lens.classList.add('is-open');
    clearTimeout(lens._hcTimer);
    lens._hcTimer = setTimeout(() => lens.classList.remove('is-open'), 900);
  });
}

/* ---------------- Gallery data + rendering + filter ---------------- */
/* No real photos yet, so each slot renders a category-coded gradient
   placeholder instead. Swap in real <img> tags once photos are ready. */
const GALLERY_CATEGORY_META = {
  family: {
    label: 'צילומי משפחה',
    from: '#8C7B63', to: '#4A443D',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  },
  newborn: {
    label: 'ניו-בורן',
    from: '#F3E4D7', to: '#D9BEA8',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3a5 5 0 015 5c0 3-2 4-2 7H9c0-3-2-4-2-7a5 5 0 015-5z"/><path stroke-linecap="round" d="M9 19h6"/>',
  },
  portrait: {
    label: 'פורטרטים',
    from: '#C9A66B', to: '#8C6B3F',
    icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13.5" r="3.2"/>',
  },
  event: {
    label: 'אירועים',
    from: '#B4894F', to: '#2B2723',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 2l1.8 4.6L18 8l-3.6 2.9L15.5 15 12 12.6 8.5 15l1.1-4.1L6 8l4.2-1.4L12 2z"/>',
  },
};

const GALLERY_ITEMS = [
  'family', 'newborn', 'portrait', 'event',
  'family', 'portrait', 'newborn', 'event',
  'family', 'portrait', 'event', 'newborn',
];

function initGallery() {
  const grid = document.getElementById('gallery-grid');

  grid.innerHTML = GALLERY_ITEMS.map((category) => {
    const meta = GALLERY_CATEGORY_META[category];
    return `
    <div class="gallery-item aspect-[4/5]" data-category="${category}">
      <div class="photo-placeholder" style="--ph-gradient: linear-gradient(155deg, ${meta.from}, ${meta.to});">
        <svg class="ph-icon" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">${meta.icon}</svg>
        <span class="gallery-tag">${meta.label}</span>
      </div>
    </div>
  `;
  }).join('');

  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = () => grid.querySelectorAll('.gallery-item');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;

      galleryItems().forEach((el) => {
        const match = filter === 'all' || el.dataset.category === filter;
        el.classList.toggle('is-hidden', !match);
      });
    });
  });
}

/* ---------------- Testimonials carousel ---------------- */
function initTestimonials() {
  const track = document.getElementById('testimonial-slides');
  const slides = track.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.getElementById('testimonial-dots');
  let index = 0;
  let autoplayTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `שקופית ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-index * 100}%)`;
    dotsContainer.querySelectorAll('button').forEach((d, di) => {
      d.classList.toggle('is-active', di === index);
    });
    resetAutoplay();
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goTo(index + 1), 6000);
  }

  // Note: track direction is row (LTR-agnostic translateX); RTL container
  // still lays out children left-to-right within the flex track itself.
  track.style.direction = 'ltr';
  track.querySelectorAll('.testimonial-slide').forEach((s) => (s.style.direction = 'rtl'));

  resetAutoplay();

  // Basic swipe support
  let startX = 0;
  track.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) < 40) return;
    diff > 0 ? goTo(index - 1) : goTo(index + 1);
  });
}

/* ---------------- Contact form ---------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');

  const validators = {
    name: (v) => v.trim().length >= 2,
    phone: (v) => /^0\d{1,2}-?\d{7}$/.test(v.replace(/\s/g, '')),
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    'event-type': (v) => v.trim().length > 0,
  };

  const errorMessages = {
    name: 'נא להזין שם מלא (לפחות 2 תווים)',
    phone: 'נא להזין מספר טלפון תקין',
    email: 'נא להזין כתובת אימייל תקינה',
    'event-type': 'נא לבחור סוג צילום',
  };

  function validateField(field) {
    const name = field.name;
    if (!validators[name]) return true;
    const isValid = validators[name](field.value);
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    field.classList.toggle('is-invalid', !isValid);
    if (errorEl) errorEl.textContent = isValid ? '' : errorMessages[name];
    return isValid;
  }

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    if (field) {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;
    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      if (field && !validateField(field)) allValid = false;
    });

    if (!allValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // No backend wired up yet — simulate a successful submission.
    // Replace with a real fetch()/API call when a backend endpoint exists.
    successMsg.classList.remove('hidden');
    form.reset();
    setTimeout(() => successMsg.classList.add('hidden'), 6000);
  });
}

/* ---------------- Back to top ---------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener(
    'scroll',
    () => btn.classList.toggle('is-visible', window.scrollY > 500),
    { passive: true }
  );
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------------- Source protection (deterrent only — not real security) ---------------- */
function initSourceProtection() {
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const isDevToolsCombo =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
      (e.ctrlKey && key === 'u');
    if (isDevToolsCombo) e.preventDefault();
  });

  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });
}
