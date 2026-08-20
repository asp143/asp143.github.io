import {
  showToast,
  setActiveTaskbarApp,
  getDraggableController,
  makeDraggable,
  raiseWindow,
  applyCrt,
  CRT_STORAGE_KEY,
  DESKTOP_GATE
} from './window';

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
  const speed = 18;
  const initialDelay = 350;
  let elapsed = 0;
  let lastFrame: number | null = null;
  let renderedChars = 0;
  let frameId = 0;

  const step = (now: number) => {
    if (document.hidden) {
      lastFrame = null;
      return;
    }

    if (lastFrame !== null) elapsed += now - lastFrame;
    lastFrame = now;

    const chars = Math.min(
      full.length,
      Math.floor(Math.max(0, elapsed - initialDelay) / speed)
    );
    if (chars !== renderedChars) {
      renderedChars = chars;
      textSpan.textContent = full.slice(0, renderedChars);
    }

    if (renderedChars < full.length) {
      frameId = requestAnimationFrame(step);
    } else {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
      lastFrame = null;
    } else {
      frameId = requestAnimationFrame(step);
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  if (!document.hidden) frameId = requestAnimationFrame(step);
}

/* ---------- Pause idle CSS motion in background tabs ---------- */
function wireAnimationVisibility() {
  const apply = () => {
    document.documentElement.classList.toggle('is-document-hidden', document.hidden);
  };
  apply();
  document.addEventListener('visibilitychange', apply);
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
    const anim = el.animate(
      [
        { opacity: 0, transform: 'translateY(40%)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      { duration: 400, delay: i * 40, fill: 'forwards', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
    // Release the fill-forwards lock once done so CSS hover/keyframe
    // transforms aren't permanently overridden by the WAAPI effect
    anim.addEventListener('finish', () => {
      anim.cancel();
      el.style.opacity = '';
      el.style.transform = '';
    });
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
        const anim = el.animate(
          [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          { duration: 360, delay: i * 40, fill: 'forwards', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
        );
        anim.addEventListener('finish', () => {
          anim.cancel();
          el.style.opacity = '';
          el.style.transform = '';
        });
      });
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.home-sections .win--section').forEach((s) => observer.observe(s));
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

/* ---------- Desktop window manager (PostHog-style) ----------
   Under the js-desktop gate the home page stops scrolling: section windows
   hide until opened from a desktop icon / taskbar app / g-key / #hash,
   then float on the desktop — draggable, closable, focus-raised. Flow
   layout (mobile / no-JS / coarse pointer) is untouched; window.ts's
   joke-close is overridden into a real close via data-real-close. */
interface DesktopController {
  isDesktop(): boolean;
  openWin(id: string): void;
  raiseHero(): void;
}

function initDesktopWindows(): DesktopController {
  const gate = window.matchMedia(DESKTOP_GATE);
  const isDesktop = () => gate.matches;

  const wins = new Map<string, HTMLElement>();
  ['about', 'projects', 'side-projects', 'writing', 'contact'].forEach((id) => {
    const el = document.querySelector<HTMLElement>(`.home-sections #${id}.win`);
    if (el) wins.set(id, el);
  });
  const heroTerminal = document.querySelector<HTMLElement>('.hero-window');
  const constraint = document.querySelector<HTMLElement>('main[data-desktop]');
  const taskbarApp = (id: string) =>
    document.querySelector<HTMLElement>(`.taskbar-app[data-target="${id}"]`);

  const raiseHero = () => {
    if (heroTerminal) {
      raiseWindow(heroTerminal);
      setActiveTaskbarApp(null);
    }
  };

  const focusWin = (el: HTMLElement) => {
    raiseWindow(el);
    setActiveTaskbarApp(el.id);
    el.focus({ preventScroll: true });
  };

  const topOpenWin = (except?: HTMLElement): HTMLElement | undefined =>
    [...wins.values()]
      .filter((el) => el !== except && el.classList.contains('is-open'))
      .sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))[0];

  const openWin = (id: string) => {
    const el = wins.get(id);
    if (!el) return;
    el.classList.add('is-open');
    taskbarApp(id)?.classList.add('is-open');
    focusWin(el);
  };

  const closeWin = (el: HTMLElement) => {
    el.classList.remove('is-open', 'is-focused');
    taskbarApp(el.id)?.classList.remove('is-open');
    const next = topOpenWin(el);
    if (next) focusWin(next);
    else setActiveTaskbarApp(null);
  };

  /* wire each window once: drag by titlebar, raise on pointerdown,
     real close (overrides window.ts's joke handler) */
  let dragWired = false;
  const wireDrag = () => {
    if (dragWired) return;
    dragWired = true;
    wins.forEach((el) => {
      const bar = el.querySelector<HTMLElement>('.win-bar');
      makeDraggable(el, bar ?? el, constraint);
    });
  };

  wins.forEach((el) => {
    el.tabIndex = -1;
    el.addEventListener('pointerdown', () => {
      if (isDesktop() && el.classList.contains('is-open')) focusWin(el);
    });
    const closeBtn = el.querySelector<HTMLButtonElement>('button[data-close-joke]');
    closeBtn?.addEventListener('click', () => {
      if (isDesktop()) closeWin(el);
    });
  });
  heroTerminal?.addEventListener('pointerdown', () => {
    if (isDesktop()) raiseHero();
  });

  /* ── in-desktop browser: internal page links open here ── */
  const browser = document.getElementById('browser-win');
  const browserFrame = document.getElementById('browser-frame') as HTMLIFrameElement | null;
  const browserTitle = document.getElementById('browser-title');
  const browserAddress = document.getElementById('browser-address');
  const browserOpenTab = document.getElementById('browser-open-tab') as HTMLAnchorElement | null;
  let browserDragWired = false;

  const setBrowserLocation = (path: string, docTitle?: string) => {
    if (browserTitle) browserTitle.textContent = docTitle || `browser — ${path}`;
    if (browserAddress) browserAddress.textContent = `ralphjonas.com${path}`;
    if (browserOpenTab) browserOpenTab.href = path;
  };

  const openBrowser = (url: URL) => {
    if (!browser || !browserFrame) {
      window.location.href = url.href;
      return;
    }
    const path = url.pathname + url.search + url.hash;
    browser.classList.add('is-open');
    if (!browserDragWired) {
      browserDragWired = true;
      browser.tabIndex = -1;
      makeDraggable(browser, browser.querySelector<HTMLElement>('.win-bar') ?? browser, constraint);
      browser.addEventListener('pointerdown', () => {
        if (browser.classList.contains('is-open')) raiseWindow(browser);
      });
    }
    if (browserFrame.getAttribute('src') !== path) {
      setBrowserLocation(path); // provisional — the load handler refines it
      browserFrame.src = path;
    }
    raiseWindow(browser);
    browser.focus({ preventScroll: true });
    (window as Window & { posthog?: PostHogClient }).posthog?.capture('browser_window_opened', { path });
  };

  const closeBrowser = () => {
    if (!browser) return;
    browser.classList.remove('is-open', 'is-focused');
    browserFrame?.setAttribute('src', 'about:blank'); // stop playback/loading
    // the address bar mirrors the pane while it's open — restore home
    if (window.location.pathname !== '/') history.replaceState(null, '', '/');
    const next = topOpenWin();
    if (next) focusWin(next);
    else setActiveTaskbarApp(null);
  };

  document.getElementById('browser-close')?.addEventListener('click', closeBrowser);

  /* keep the address bar honest when the user browses inside the frame */
  browserFrame?.addEventListener('load', () => {
    try {
      const loc = browserFrame.contentWindow?.location;
      if (!loc || loc.href === 'about:blank') return;
      if (loc.origin !== window.location.origin) return;
      setBrowserLocation(
        loc.pathname + loc.search,
        browserFrame.contentDocument?.title?.split('—')[0]?.trim().toLowerCase()
      );
      // mirror the pane in the real address bar so any pane page is sharable
      if (loc.pathname !== '/') history.replaceState(null, '', loc.pathname + loc.search);
    } catch {
      /* cross-origin frame — leave the chrome as-is */
    }
  });

  /* intercept EVERY internal page link on the home desktop (icons, window
     rows, keycaps, sticky note, start menu entries like now/tags) — they
     all open in the browser window. Only external/_blank links and xml
     feeds keep their normal behavior. */
  document.addEventListener('click', (ev) => {
    if (!isDesktop()) return;
    const a = (ev.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!a || a.target === '_blank') return;
    if (a.closest('#browser-win')) return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname) return; // #hash links → window manager
    if (url.pathname.endsWith('.xml')) return; // rss/sitemap are real navigations
    ev.preventDefault();
    // a start-menu link keeps its <details> open after preventDefault
    document
      .querySelectorAll<HTMLDetailsElement>('details.startmenu[open]')
      .forEach((menu) => { menu.open = false; });
    openBrowser(url);
  });

  /* ── shared-link entry: post pages bounce desktop visitors here as
     /?open=/blog/<slug>/ — open the path in the browser pane and put the
     canonical URL back in the address bar. Small screens (someone shares
     the /?open= form directly) go straight to the real page. ── */
  const openParam = new URLSearchParams(window.location.search).get('open');
  if (openParam && /^\/[^/]/.test(openParam)) {
    if (isDesktop()) {
      const url = new URL(openParam, window.location.origin);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
      openBrowser(url);
    } else {
      window.location.replace(openParam);
    }
  }

  const syncMode = () => {
    if (isDesktop()) {
      wireDrag();
      wins.forEach((el) => {
        const closeBtn = el.querySelector<HTMLButtonElement>('button[data-close-joke]');
        if (closeBtn) closeBtn.dataset.realClose = '1';
        // restore taskbar indicators for windows opened before a mode switch
        taskbarApp(el.id)?.classList.toggle('is-open', el.classList.contains('is-open'));
      });
    } else {
      wins.forEach((el) => {
        const closeBtn = el.querySelector<HTMLButtonElement>('button[data-close-joke]');
        if (closeBtn) delete closeBtn.dataset.realClose;
        taskbarApp(el.id)?.classList.remove('is-open');
      });
      closeBrowser(); // flow mode navigates for real — no in-desktop browser
    }
  };
  syncMode();
  gate.addEventListener('change', syncMode);

  /* desktop icons + taskbar apps + start menu "shut down" all point at
     #section hashes — in desktop mode they open windows instead */
  document.addEventListener('click', (ev) => {
    if (!isDesktop()) return;
    const a = (ev.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, window.location.href);
    if (url.pathname !== window.location.pathname) return;
    const id = decodeURIComponent(url.hash.slice(1));
    if (id === 'hero') {
      ev.preventDefault();
      raiseHero();
      return;
    }
    const el = wins.get(id);
    if (!el) return;
    ev.preventDefault();
    if (a.classList.contains('taskbar-app') && el.classList.contains('is-open')) {
      // taskbar: focused → close (minimize), unfocused → bring to front
      if (el.classList.contains('is-focused')) closeWin(el);
      else focusWin(el);
    } else {
      openWin(id);
    }
  });

  /* hash deep links (/#contact from other pages, hand-typed anchors) */
  const openFromHash = () => {
    if (!isDesktop()) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (wins.has(id)) openWin(id);
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();

  /* Esc closes the focused window — capture phase so the start-menu Esc
     handler (which closes menus) hasn't run yet and we can defer to it */
  document.addEventListener(
    'keydown',
    (ev) => {
      if (ev.key !== 'Escape' || !isDesktop()) return;
      if (document.querySelector('details.startmenu[open]')) return;
      if (document.querySelector('dialog[open]')) return;
      if (browser?.classList.contains('is-focused') && browser.classList.contains('is-open')) {
        closeBrowser();
        return;
      }
      const focused = [...wins.values()].find(
        (el) => el.classList.contains('is-focused') && el.classList.contains('is-open')
      );
      if (focused) closeWin(focused);
    },
    true
  );

  return { isDesktop, openWin, raiseHero };
}

/* ---------- sudo → CRT mode (easter egg) ----------
   applyCrt / CRT_STORAGE_KEY live in window.ts, which also restores the
   persisted state on every page — only the toggle UX is home-only. */
function toggleCrt() {
  const on = !document.documentElement.classList.contains('crt');
  applyCrt(on);
  try {
    localStorage.setItem(CRT_STORAGE_KEY, on ? '1' : '0');
  } catch {
    /* storage unavailable — session-only toggle */
  }
  showToast(on ? 'root access granted' : 'root session closed');
  (window as Window & { posthog?: PostHogClient }).posthog?.capture('crt_toggled', { on: on ? 1 : 0 });
}

function wireKeyboardNav(desktop: DesktopController) {
  const toast = document.getElementById('kbd-toast');
  let prefixActive = false;
  let prefixTimer: number | null = null;
  let sudoBuffer = '';

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

    // 'sudo' typed anywhere (outside inputs) toggles CRT mode
    if (!prefixActive && key.length === 1 && key >= 'a' && key <= 'z') {
      sudoBuffer = (sudoBuffer + key).slice(-4);
      if (sudoBuffer === 'sudo') {
        sudoBuffer = '';
        toggleCrt();
        return;
      }
    }

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
      if (desktop.isDesktop()) {
        // desktop mode: open the window instead of scrolling
        if (id === 'hero') desktop.raiseHero();
        else desktop.openWin(id);
        (window as Window & { posthog?: PostHogClient }).posthog?.capture('keyboard_nav', { section: id });
      } else {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
          (window as Window & { posthog?: PostHogClient }).posthog?.capture('keyboard_nav', { section: id });
        }
      }
    }
    endPrefix();
  });
}

/* ---------- Trash dialog (easter egg) ---------- */
function wireTrash() {
  const dialog = document.querySelector<HTMLDialogElement>('#trash-modal');
  const openBtn = document.querySelector<HTMLButtonElement>('#open-trash');
  if (!dialog || !openBtn) return;

  const closeBtn = dialog.querySelector<HTMLButtonElement>('.trash-close');
  const emptyBtn = dialog.querySelector<HTMLButtonElement>('#empty-trash');

  openBtn.addEventListener('click', () => {
    // re-center in case a previous drag moved it
    getDraggableController(dialog)?.reset();
    dialog.showModal();
    (window as Window & { posthog?: PostHogClient }).posthog?.capture('trash_opened');
  });

  closeBtn?.addEventListener('click', () => dialog.close());

  // click on the backdrop (the dialog element itself) closes it
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  emptyBtn?.addEventListener('click', () => {
    if (!prefersReducedMotion) {
      dialog.classList.remove('trash-shake');
      void dialog.offsetWidth; // restart the animation
      dialog.classList.add('trash-shake');
    }
    showToast('permission denied');
  });
}

/* ---------- Section observer: taskbar active state + analytics ----------
   ONE observer serves both concerns (zero new observers rule): every
   intersection updates the taskbar pressed-in state; the first
   intersection per section also fires the section_viewed capture. */
function wireSectionObserver(desktop: DesktopController) {
  const sectionIds = ['hero', 'about', 'projects', 'side-projects', 'writing', 'contact'];
  const viewedSections = new Set<string>();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      // Flow mode: scroll position drives the taskbar ('hero' matches no
      // app → clears). Desktop mode: the window manager owns the taskbar,
      // but the observer still fires analytics when a window first opens.
      if (!desktop.isDesktop()) setActiveTaskbarApp(id);
      if (viewedSections.has(id)) return;
      viewedSections.add(id);
      (window as Window & { posthog?: PostHogClient }).posthog?.capture('section_viewed', { section: id });
    });
  }, { threshold: 0.3 });

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });
}

/* ---------- Bootstrap ---------- */
wireAnimationVisibility();
const supportsAnimate = typeof Element.prototype.animate === 'function';
if (!prefersReducedMotion && supportsAnimate) {
  runEntranceAnimations();
  runTypewriter();
  runStatCounter();
} else {
  revealStaticContent();
  setStatValuesFinal();
}

const desktop = initDesktopWindows();
wireKeyboardNav(desktop);
wireTrash();
wireSectionObserver(desktop);

/* ---------- PostHog ---------- */
const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
if (posthog) {
  const scrollDepthMarks = [25, 50, 75, 100];
  const depthMarks = new Set<number>();
  let depthTicking = false;
  let docHeight = 0;

  const refreshDocHeight = () => {
    docHeight = document.documentElement.scrollHeight - window.innerHeight;
  };

  const resizeObserver = new ResizeObserver(refreshDocHeight);

  const stopScrollDepthTracking = () => {
    window.removeEventListener('scroll', onScrollDepth);
    window.removeEventListener('resize', refreshDocHeight);
    resizeObserver.disconnect();
  };

  const onScrollDepth = () => {
    if (depthTicking) return;
    depthTicking = true;
    requestAnimationFrame(() => {
      if (docHeight > 0) {
        const pct = Math.round((window.scrollY / docHeight) * 100);
        scrollDepthMarks.forEach((mark) => {
          if (pct >= mark && !depthMarks.has(mark)) {
            depthMarks.add(mark);
            posthog.capture('scroll_depth', { percent: mark });
          }
        });
      }
      depthTicking = false;
      if (depthMarks.size === scrollDepthMarks.length) stopScrollDepthTracking();
    });
  };

  refreshDocHeight();
  resizeObserver.observe(document.documentElement);
  window.addEventListener('resize', refreshDocHeight, { passive: true });
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
