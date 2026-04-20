type PostHogCaptureProps = Record<string, number | string>;
type PostHogClient = {
  capture: (eventName: string, properties?: PostHogCaptureProps) => void;
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealStaticContent() {
  document.querySelectorAll<HTMLElement>('.hero-name-letter, .motion-fade, .motion-stagger').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

function setStatValuesFinal() {
  document.querySelectorAll<HTMLElement>('.about-stat-number[data-count]').forEach((el) => {
    el.textContent = `${el.dataset.count ?? '0'}+`;
  });
}

/* ---------- Typewriter hero subtitle ---------- */
function runTypewriter() {
  const el = document.querySelector<HTMLElement>('.hero-subtitle');
  const textSpan = el?.querySelector<HTMLElement>('.hero-subtitle-text');
  if (!el || !textSpan) return;

  const full = el.dataset.typewriter ?? textSpan.textContent ?? '';
  if (prefersReducedMotion) {
    textSpan.textContent = full;
    return;
  }

  textSpan.textContent = '';
  let i = 0;
  const speed = 18;
  const tick = () => {
    if (i <= full.length) {
      textSpan.textContent = full.slice(0, i);
      i += 1;
      window.setTimeout(tick, speed);
    }
  };
  // Small delay so it feels like the shell booted
  window.setTimeout(tick, 350);
}

/* ---------- Stat counter ---------- */
function runStatCounter() {
  if (prefersReducedMotion) {
    setStatValuesFinal();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      entry.target.querySelectorAll<HTMLElement>('.about-stat-number[data-count]').forEach((el) => {
        const target = Number.parseInt(el.dataset.count ?? '0', 10);
        const duration = 1000;
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(eased * target)}+`;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.25 });

  const about = document.getElementById('about');
  if (about) observer.observe(about);
}

/* ---------- Section entrance stagger (subtle) ---------- */
function runEntranceAnimations() {
  if (prefersReducedMotion) {
    revealStaticContent();
    return;
  }

  // Hero letters cascade
  document.querySelectorAll<HTMLElement>('.hero-name-letter').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40%)';
    el.animate(
      [
        { opacity: 0, transform: 'translateY(40%)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      { duration: 400, delay: i * 40, fill: 'forwards', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  });

  // Section stagger/fade on scroll-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const targets = entry.target.querySelectorAll<HTMLElement>('.motion-fade, .motion-stagger');
      targets.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        el.animate(
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          { duration: 360, delay: i * 40, fill: 'forwards', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
      });
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.section').forEach((s) => observer.observe(s));
}

/* ---------- Signature: vim-style keyboard nav ---------- */
type SectionKey = 'h' | 'a' | 'p' | 's' | 'w' | 'c';
const SECTION_MAP: Record<SectionKey, string> = {
  h: 'hero',
  a: 'about',
  p: 'projects',
  s: 'side-projects',
  w: 'writing',
  c: 'contact'
};

function wireKeyboardNav() {
  const toast = document.getElementById('kbd-toast');
  let prefixActive = false;
  let prefixTimer: number | null = null;

  const showToast = () => {
    if (!toast) return;
    toast.classList.add('kbd-toast--visible');
  };
  const hideToast = () => {
    if (!toast) return;
    toast.classList.remove('kbd-toast--visible');
  };

  const endPrefix = () => {
    prefixActive = false;
    hideToast();
    if (prefixTimer !== null) {
      window.clearTimeout(prefixTimer);
      prefixTimer = null;
    }
  };

  window.addEventListener('keydown', (ev) => {
    const target = ev.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

    const key = ev.key.toLowerCase();

    if (!prefixActive) {
      if (key === 'g') {
        prefixActive = true;
        showToast();
        prefixTimer = window.setTimeout(endPrefix, 1500);
      }
      return;
    }

    // prefixActive === true
    if (key in SECTION_MAP) {
      ev.preventDefault();
      const id = SECTION_MAP[key as SectionKey];
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        (window as Window & { posthog?: PostHogClient }).posthog?.capture('keyboard_nav', { section: id });
      }
    }
    endPrefix();
  });
}

/* ---------- Bootstrap ---------- */
const supportsAnimate = typeof Element.prototype.animate === 'function';
if (!prefersReducedMotion && supportsAnimate) {
  runEntranceAnimations();
  runTypewriter();
  runStatCounter();
} else {
  revealStaticContent();
  setStatValuesFinal();
}

wireKeyboardNav();

/* ---------- PostHog ---------- */
const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
if (posthog) {
  const sectionIds = ['hero', 'about', 'projects', 'side-projects', 'writing', 'contact'];
  const viewedSections = new Set<string>();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (viewedSections.has(id)) return;
      viewedSections.add(id);
      sectionObserver.unobserve(entry.target);
      posthog.capture('section_viewed', { section: id });
    });
  }, { threshold: 0.3 });

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  const depthMarks = new Set<number>();
  let depthTicking = false;
  const onScrollDepth = () => {
    if (depthTicking) return;
    depthTicking = true;
    requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.round((window.scrollY / docHeight) * 100);
        [25, 50, 75, 100].forEach((mark) => {
          if (pct >= mark && !depthMarks.has(mark)) {
            depthMarks.add(mark);
            posthog.capture('scroll_depth', { percent: mark });
          }
        });
      }
      depthTicking = false;
    });
  };
  window.addEventListener('scroll', onScrollDepth, { passive: true });

  document.addEventListener('click', (ev) => {
    const link = (ev.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.href;

    if (link.closest('#contact')) {
      posthog.capture('contact_clicked', {
        method: link.textContent?.trim().toLowerCase() || href,
        href
      });
      return;
    }
    if (link.closest('#writing')) {
      posthog.capture('writing_clicked', {
        title: link.querySelector('.writing-title')?.textContent?.trim() || href,
        href
      });
      return;
    }
    if (link.closest('#side-projects')) {
      posthog.capture('side_project_clicked', {
        name: link.querySelector('.side-project-name')?.textContent?.trim() || href,
        href
      });
    }
  });
}
