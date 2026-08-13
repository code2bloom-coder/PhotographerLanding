/* =========================================================
   Maya Cohen Photography — Landing Page Behaviors
   Sections: header, mobile menu, scroll reveal, gallery
   filter + lightbox, testimonials carousel, contact form.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initGallery();
  initVisionBoard();
  initTestimonials();
  initContactForm();
  initBackToTop();
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

/* ---------------- Gallery data + rendering + filter + lightbox ---------------- */
const GALLERY_ITEMS = [
  { category: 'family', seed: 'gallery-family-1', tag: 'צילומי משפחה', alt: 'צילום משפחתי בטבע' },
  { category: 'newborn', seed: 'gallery-newborn-1', tag: 'ניו-בורן', alt: 'צילום תינוק רך' },
  { category: 'portrait', seed: 'gallery-portrait-1', tag: 'פורטרט', alt: 'פורטרט אמנותי באור טבעי' },
  { category: 'event', seed: 'gallery-event-1', tag: 'אירוע', alt: 'רגע מרגש מאירוע משפחתי' },
  { category: 'family', seed: 'gallery-family-2', tag: 'צילומי משפחה', alt: 'משפחה מחייכת בסטודיו' },
  { category: 'portrait', seed: 'gallery-portrait-2', tag: 'פורטרט', alt: 'פורטרט שחור-לבן' },
  { category: 'newborn', seed: 'gallery-newborn-2', tag: 'ניו-בורן', alt: 'תינוק ישן בעדינות' },
  { category: 'event', seed: 'gallery-event-2', tag: 'אירוע', alt: 'ריקוד באירוע חגיגי' },
  { category: 'family', seed: 'gallery-family-3', tag: 'צילומי משפחה', alt: 'הורים וילדים בחוץ' },
  { category: 'portrait', seed: 'gallery-portrait-3', tag: 'פורטרט', alt: 'פורטרט קרוב עם אור רך' },
  { category: 'event', seed: 'gallery-event-3', tag: 'אירוע', alt: 'חיבוק משפחתי חם' },
  { category: 'newborn', seed: 'gallery-newborn-3', tag: 'ניו-בורן', alt: 'ידיים קטנות של תינוק' },
];

let currentFilteredSrcs = [];
let currentLightboxIndex = 0;

function initGallery() {
  const grid = document.getElementById('gallery-grid');

  grid.innerHTML = GALLERY_ITEMS.map((item, i) => `
    <div class="gallery-item aspect-[4/5]" data-category="${item.category}" data-index="${i}">
      <img src="https://picsum.photos/seed/${item.seed}/700/900" alt="${item.alt}" class="photo-filter" loading="lazy">
      <span class="zoom-icon">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
        </svg>
      </span>
      <div class="gallery-overlay">
        <span class="gallery-tag">${item.tag}</span>
      </div>
    </div>
  `).join('');

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

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const visibleItems = Array.from(galleryItems()).filter((el) => !el.classList.contains('is-hidden'));
    currentFilteredSrcs = visibleItems.map((el) => ({
      src: el.querySelector('img').src,
      alt: el.querySelector('img').alt,
    }));
    currentLightboxIndex = visibleItems.indexOf(item);
    openLightbox();
  });

  initLightboxControls();
}

function initLightboxControls() {
  const lightbox = document.getElementById('lightbox');
  const backdrop = document.getElementById('lightbox-backdrop');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  // Grid is RTL: item 0 renders top-right, later items flow leftward.
  // So the right-side "prev" button/key steps to a lower index, and the
  // left-side "next" button/key steps to a higher index.
  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => stepLightbox(-1));
  nextBtn.addEventListener('click', () => stepLightbox(1));

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') stepLightbox(-1);
    if (e.key === 'ArrowLeft') stepLightbox(1);
  });
}

function openLightbox() {
  const lightbox = document.getElementById('lightbox');
  updateLightboxImage();
  lightbox.classList.add('is-open');
  document.body.classList.add('overflow-hidden');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('is-open');
  document.body.classList.remove('overflow-hidden');
}

function stepLightbox(dir) {
  const len = currentFilteredSrcs.length;
  currentLightboxIndex = (currentLightboxIndex + dir + len) % len;
  updateLightboxImage();
}

function updateLightboxImage() {
  const img = document.getElementById('lightbox-img');
  const current = currentFilteredSrcs[currentLightboxIndex];
  img.src = current.src;
  img.alt = current.alt;
}

/* ---------------- Vision Board / Moodboard Builder ---------------- */
const VISION_STYLES = [
  {
    id: 'sunset',
    label: 'תאורת שקיעה חמה',
    desc: 'אור זהוב ורך של שעת הזהב',
    moods: ['חם', 'רומנטי'],
    from: '#E8C99B', to: '#C97B4A',
    icon: '<circle cx="12" cy="15" r="4"/><path stroke-linecap="round" d="M3 19h18M12 3v3M5.6 8.6l1.4 1.4M18.4 8.6L17 10"/>',
  },
  {
    id: 'studio',
    label: 'סטודיו נקי ומינימליסטי',
    desc: 'רקע אחיד, קווים נקיים ואור מבוקר',
    moods: ['מסוגנן', 'נקי'],
    from: '#F2ECE0', to: '#C9BEA6',
    icon: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="3.2"/>',
  },
  {
    id: 'rustic',
    label: 'עיצוב כפרי ואביזרים',
    desc: 'עץ, פשתן וטקסטורות טבעיות',
    moods: ['כפרי', 'נוסטלגי'],
    from: '#B08968', to: '#6B4A32',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v14M12 3C9 5 7 7.5 7 10.5S9 15 12 15c3 0 5-1.5 5-4.5S15 5 12 3z"/><path stroke-linecap="round" d="M9 21h6"/>',
  },
  {
    id: 'candid',
    label: 'רגעים ספונטניים וטבעיים',
    desc: 'תיעוד אמיתי בלי פוזות מאולצות',
    moods: ['טבעי', 'אותנטי'],
    from: '#CBBF9C', to: '#8C9A5B',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-8-7.5-8-12a5 5 0 019-3 5 5 0 019 3c0 4.5-4 8-8 12z"/>',
  },
  {
    id: 'minimalist',
    label: 'מינימליזם וחלל ריק',
    desc: 'מעט אלמנטים, הרבה נשימה חזותית',
    moods: ['שקט', 'מאופק'],
    from: '#E7E3DA', to: '#A79E90',
    icon: '<circle cx="12" cy="12" r="3"/>',
  },
  {
    id: 'pastel',
    label: 'גווני פסטל רכים',
    desc: 'ורוד אבק, מנטה ולבנדר עדינים',
    moods: ['רך', 'חלומי'],
    from: '#F3D9DF', to: '#CBB8DE',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-4.5 7-10a7 7 0 00-14 0c0 5.5 7 10 7 10z"/>',
  },
  {
    id: 'bw',
    label: 'שחור-לבן קלאסי',
    desc: 'דרמה, ניגודיות וזמניות-על',
    moods: ['דרמטי', 'קלאסי'],
    from: '#2B2723', to: '#B7B2A9',
    icon: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
  },
  {
    id: 'outdoor',
    label: 'טבע וחוץ פתוח',
    desc: 'אור יום, ירוק ונופים פתוחים',
    moods: ['פתוח', 'רענן'],
    from: '#9CAF88', to: '#4F6F52',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 21l6-11 4 6 3-4 5 9H3z"/>',
  },
];

const VISION_MAX = 5;
let selectedVisionIds = [];

function initVisionBoard() {
  const grid = document.getElementById('vision-grid');
  if (!grid) return;

  grid.innerHTML = VISION_STYLES.map((style) => `
    <button type="button" class="style-tile" data-style-id="${style.id}" style="--tile-gradient: linear-gradient(160deg, ${style.from}, ${style.to});">
      <span class="tile-check">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
      </span>
      <span class="tile-icon">
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">${style.icon}</svg>
      </span>
      <span class="tile-title">${style.label}</span>
      <span class="tile-desc">${style.desc}</span>
    </button>
  `).join('');

  grid.addEventListener('click', (e) => {
    const tile = e.target.closest('.style-tile');
    if (!tile) return;
    toggleVisionStyle(tile.dataset.styleId, tile);
  });

  const clearBtn = document.getElementById('moodboard-clear');
  clearBtn.addEventListener('click', () => {
    selectedVisionIds = [];
    renderVisionBoard();
  });

  renderVisionBoard();
}

function toggleVisionStyle(id, tileEl) {
  const isSelected = selectedVisionIds.includes(id);

  if (!isSelected && selectedVisionIds.length >= VISION_MAX) {
    tileEl.classList.remove('is-shaking');
    void tileEl.offsetWidth;
    tileEl.classList.add('is-shaking');
    return;
  }

  selectedVisionIds = isSelected
    ? selectedVisionIds.filter((sid) => sid !== id)
    : [...selectedVisionIds, id];

  renderVisionBoard();
}

function joinHebrewList(words) {
  if (words.length === 0) return '';
  if (words.length === 1) return words[0];
  return `${words.slice(0, -1).join(', ')} ו${words[words.length - 1]}`;
}

function renderVisionBoard() {
  const grid = document.getElementById('vision-grid');
  const countEl = document.getElementById('vision-count');
  const emptyEl = document.getElementById('moodboard-empty');
  const filledEl = document.getElementById('moodboard-filled');
  const swatchesEl = document.getElementById('moodboard-swatches');
  const summaryEl = document.getElementById('vision-summary');
  const whatsappBtn = document.getElementById('vision-whatsapp');
  const whatsappSub = document.getElementById('vision-whatsapp-sub');

  const selectedStyles = selectedVisionIds
    .map((id) => VISION_STYLES.find((s) => s.id === id))
    .filter(Boolean);

  // Tile visual state
  grid.querySelectorAll('.style-tile').forEach((tile) => {
    const id = tile.dataset.styleId;
    const selected = selectedVisionIds.includes(id);
    tile.classList.toggle('is-selected', selected);
    tile.classList.toggle('is-disabled', !selected && selectedVisionIds.length >= VISION_MAX);
  });

  countEl.textContent = selectedVisionIds.length;

  if (selectedStyles.length === 0) {
    emptyEl.classList.remove('hidden');
    filledEl.classList.add('hidden');
    summaryEl.textContent = 'הסגנון שלכם עוד לא הצטייר — התחילו לבחור למעלה ✨';
    whatsappBtn.classList.add('is-disabled');
    whatsappBtn.removeAttribute('href');
    whatsappSub.textContent = 'בחרו סגנון אחד לפחות כדי לשלוח';
    return;
  }

  emptyEl.classList.add('hidden');
  filledEl.classList.remove('hidden');

  swatchesEl.innerHTML = selectedStyles.map((style, i) => `
    <div class="moodboard-swatch${i === 0 ? ' is-featured' : ''}" style="--tile-gradient: linear-gradient(160deg, ${style.from}, ${style.to}); animation-delay: ${i * 60}ms;">
      <span>${style.label}</span>
    </div>
  `).join('');

  const moods = [...new Set(selectedStyles.flatMap((s) => s.moods))].slice(0, 4);
  summaryEl.innerHTML = `הסגנון שלכם: <span class="text-gold font-medium">${joinHebrewList(moods)}</span>`;

  whatsappBtn.classList.remove('is-disabled');
  whatsappSub.textContent = `${selectedStyles.length} סגנונות נבחרו — לחצו לשליחה`;

  const styleList = selectedStyles.map((s) => `• ${s.label}`).join('\n');
  const message = `היי מאיה! 👋 בניתי לוח השראה אישי לצילומים שלי, אלה הסגנונות שדיברו אליי:\n\n${styleList}\n\nהסגנון שלי: ${joinHebrewList(moods)}\n\nאשמח לשמוע פרטים נוספים ולתאם צילומים! 📸`;
  whatsappBtn.href = `https://wa.me/972500000000?text=${encodeURIComponent(message)}`;
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
