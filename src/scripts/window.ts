/**
 * ralphOS window manager — loaded by BaseLayout on every page.
 * Progressive enhancement only: everything below upgrades markup that
 * already works without JS.
 *
 * Responsibilities:
 * - `.js-desktop` gate on <html> (≥1024px + fine pointer) — CSS switches
 *   floating windows from in-flow to absolute only when this is present.
 * - Auto-wires [data-draggable] elements (drag + focus/z-raise). Values:
 *   ""     → handle is the element's .win-bar (falls back to the element)
 *   "self" → whole element is the handle (sticky note)
 *   other  → CSS selector for the handle inside the element
 *   Constraint box = closest [data-desktop] ancestor, if any.
 * - Unhides + wires .win-btn--min (collapse) and [data-close-joke] buttons.
 * - Start menu (<details class="startmenu">): Esc + outside-click close.
 * - Taskbar active state: listens for `os:section-viewed` CustomEvent
 *   (detail: { id }) or call setActiveTaskbarApp(id) directly.
 * - showToast(message) — pixel toast at --z-toast.
 * - Restores persisted CRT mode (sudo easter egg, toggled on home) so it
 *   survives navigation to every page.
 */

import { makeDraggable, raiseWindow, canDrag, type DraggableController } from './draggable';

export { makeDraggable, raiseWindow, canDrag };

export const DESKTOP_GATE = '(min-width: 1024px) and (pointer: fine)';

const CLOSE_JOKES = [
  'this window pays my bills',
  'nice try',
  'permission denied'
];

let jokeIndex = 0;
let toastEl: HTMLElement | null = null;
let toastTimer: number | undefined;

const draggables = new Map<HTMLElement, DraggableController>();

export function showToast(message: string, duration = 2200): void {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'os-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  // restart the transition even for back-to-back toasts
  toastEl.classList.remove('is-visible');
  void toastEl.offsetWidth;
  toastEl.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl?.classList.remove('is-visible'), duration);
}

export function setActiveTaskbarApp(id: string | null): void {
  document.querySelectorAll<HTMLElement>('.taskbar-app').forEach((app) => {
    app.classList.toggle('is-active', app.getAttribute('data-target') === id);
  });
}

export function getDraggableController(el: HTMLElement): DraggableController | undefined {
  return draggables.get(el);
}

/* ── CRT easter egg (class + persistence; toggle UX lives in home.ts) ── */

export const CRT_STORAGE_KEY = 'ralphos-crt';

export function applyCrt(on: boolean): void {
  document.documentElement.classList.toggle('crt', on);
}

function initCrt(): void {
  try {
    if (localStorage.getItem(CRT_STORAGE_KEY) === '1') applyCrt(true);
  } catch {
    /* storage unavailable — CRT stays session-only */
  }
}

function initDesktopGate(): void {
  const query = window.matchMedia(DESKTOP_GATE);
  const apply = () =>
    document.documentElement.classList.toggle('js-desktop', query.matches);
  apply();
  query.addEventListener('change', apply);
}

function initDraggables(): void {
  document.querySelectorAll<HTMLElement>('[data-draggable]').forEach((el) => {
    const value = el.getAttribute('data-draggable') ?? '';
    let handle: HTMLElement = el;
    if (value === '' || value === 'win-bar') {
      handle = el.querySelector<HTMLElement>('.win-bar') ?? el;
    } else if (value !== 'self') {
      handle = el.querySelector<HTMLElement>(value) ?? el;
    }
    const constraint = el.closest<HTMLElement>('[data-desktop]');
    const controller = makeDraggable(el, handle, constraint);
    if (controller) draggables.set(el, controller);
  });
}

function initWindowControls(): void {
  document.querySelectorAll<HTMLButtonElement>('.win-btn--min').forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const win = btn.closest('.win');
      if (!win) return;
      const collapsed = win.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  });

  document
    .querySelectorAll<HTMLButtonElement>('button[data-close-joke]')
    .forEach((btn) => {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        // A page script may take over the button as a REAL close (home's
        // desktop window manager sets data-real-close at runtime).
        if (btn.dataset.realClose === '1') return;
        showToast(CLOSE_JOKES[jokeIndex % CLOSE_JOKES.length]);
        jokeIndex += 1;
      });
    });
}

function initStartMenus(): void {
  const menus = Array.from(
    document.querySelectorAll<HTMLDetailsElement>('details.startmenu')
  );
  if (!menus.length) return;

  document.addEventListener('click', (event) => {
    menus.forEach((menu) => {
      if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menus.forEach((menu) => {
      if (menu.open) {
        menu.open = false;
        menu.querySelector<HTMLElement>('summary')?.focus();
      }
    });
  });
}

function initTaskbarSync(): void {
  document.addEventListener('os:section-viewed', (event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id;
    if (id) setActiveTaskbarApp(id);
  });
}

function init(): void {
  initCrt();
  initDesktopGate();
  initDraggables();
  initWindowControls();
  initStartMenus();
  initTaskbarSync();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
