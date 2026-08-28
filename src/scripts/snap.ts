/**
 * Snap + maximize geometry for ralphOS floating windows.
 *
 * - Zone hit-testing runs against the POINTER, not the window. draggable.ts
 *   clamps windows inside the constraint box, so a window can never actually
 *   reach an edge — only the cursor can.
 * - Geometry is expressed in constraint-local coordinates: floating windows
 *   are position:absolute inside [data-desktop], so a snapped window's
 *   left/top are offsets from that box, not the viewport.
 * - Owns inline left/top/width/height on snapped windows and restores the
 *   exact strings it replaced. draggable.ts still owns z-index.
 * - Pure functions (zoneForPointer, rectForZone) carry the arithmetic so the
 *   fiddly part is readable without a DOM.
 */

import type { DragHooks } from './draggable';

export type SnapZone = 'left' | 'right' | 'max';

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SnapRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Depth of the edge bands, in px. */
export const EDGE = 24;

/**
 * Which zone the pointer is currently soliciting, or null.
 *
 * Side edges are full-height and tested first, so a top corner resolves to
 * the half rather than to maximize — predictable beats clever at 24px.
 */
export function zoneForPointer(x: number, y: number, box: Box): SnapZone | null {
  if (y < box.top || y > box.top + box.height) return null;
  if (x < box.left || x > box.left + box.width) return null;
  if (x <= box.left + EDGE) return 'left';
  if (x >= box.left + box.width - EDGE) return 'right';
  if (y <= box.top + EDGE) return 'max';
  return null;
}

/** Target geometry for a zone, in constraint-local coordinates. */
export function rectForZone(zone: SnapZone, box: Box): SnapRect {
  // floor, then give the remainder to the right half: on an odd width the two
  // halves meet on exactly one pixel line — no overlap, no seam.
  const half = Math.floor(box.width / 2);
  if (zone === 'left') return { left: 0, top: 0, width: half, height: box.height };
  if (zone === 'right') {
    return { left: half, top: 0, width: box.width - half, height: box.height };
  }
  return { left: 0, top: 0, width: box.width, height: box.height };
}

export function boxOf(el: HTMLElement): Box {
  const rect = el.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
}

/* ── snap state ────────────────────────────────────────────────────────── */

interface Restore {
  /** The inline strings we overwrote, replayed verbatim on restore. */
  left: string;
  top: string;
  width: string;
  height: string;
  right: string;
  bottom: string;
  /** Measured size, for re-placing a window dragged out of a snap. */
  width_px: number;
  height_px: number;
}

const restores = new WeakMap<HTMLElement, Restore>();

export function isSnapped(el: HTMLElement): boolean {
  return restores.has(el);
}

export function snappedZone(el: HTMLElement): SnapZone | null {
  return (el.dataset.snap as SnapZone | undefined) ?? null;
}

export function applySnap(el: HTMLElement, zone: SnapZone, box: Box): void {
  if (!restores.has(el)) {
    const rect = el.getBoundingClientRect();
    restores.set(el, {
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
      right: el.style.right,
      bottom: el.style.bottom,
      width_px: rect.width,
      height_px: rect.height
    });
  }

  const target = rectForZone(zone, box);
  el.style.left = `${target.left}px`;
  el.style.top = `${target.top}px`;
  el.style.width = `${target.width}px`;
  el.style.height = `${target.height}px`;
  el.style.right = 'auto';
  el.style.bottom = 'auto';
  el.dataset.snap = zone;
  el.classList.add('is-snapped');
}

/** Put back the pre-snap geometry. No-op if the window was never snapped. */
export function restore(el: HTMLElement): void {
  const prev = restores.get(el);
  if (!prev) return;
  el.style.left = prev.left;
  el.style.top = prev.top;
  el.style.width = prev.width;
  el.style.height = prev.height;
  el.style.right = prev.right;
  el.style.bottom = prev.bottom;
  restores.delete(el);
  delete el.dataset.snap;
  el.classList.remove('is-snapped');
}

/** Size the window had before it was snapped — for drag-out re-placement. */
export function restoreSize(el: HTMLElement): { width: number; height: number } | null {
  const prev = restores.get(el);
  return prev ? { width: prev.width_px, height: prev.height_px } : null;
}

/* ── drop preview ──────────────────────────────────────────────────────── */

let ghost: HTMLElement | null = null;

/**
 * Show the drop outline over `zone` inside `host` ([data-desktop]).
 * `below` is the window being dragged — the ghost sits one layer under it so
 * the dragged window stays on top of its own preview.
 */
export function showGhost(
  zone: SnapZone,
  box: Box,
  host: HTMLElement,
  below: HTMLElement
): void {
  if (!ghost) {
    ghost = document.createElement('div');
    ghost.className = 'snap-ghost';
    ghost.setAttribute('aria-hidden', 'true');
  }
  if (ghost.parentElement !== host) host.appendChild(ghost);

  const target = rectForZone(zone, box);
  ghost.style.left = `${target.left}px`;
  ghost.style.top = `${target.top}px`;
  ghost.style.width = `${target.width}px`;
  ghost.style.height = `${target.height}px`;
  ghost.style.zIndex = String(Math.max(0, Number(below.style.zIndex || 10) - 1));
  // inherit the dragged window's app tint so the outline reads as "this one"
  ghost.style.setProperty('--app', getComputedStyle(below).getPropertyValue('--app'));
  ghost.classList.add('is-visible');
}

export function hideGhost(): void {
  ghost?.classList.remove('is-visible');
}

/* ── wiring ────────────────────────────────────────────────────────────── */

const DESKTOP_WIDTH = '(min-width: 1024px)';

/** Snapping only means anything once floating layout is on. */
const floatingLayoutOn = () =>
  document.documentElement.classList.contains('js-desktop');

/**
 * Drag hooks that turn `el` into a snappable window inside `host`.
 * Returns empty hooks when there is no constraint box to snap against, so
 * callers can pass the result unconditionally.
 */
export function makeSnappable(el: HTMLElement, host: HTMLElement | null): DragHooks {
  if (!host) return {};

  let pending: SnapZone | null = null;

  // A snapped window must not carry its inline size into the mobile layout.
  const widthQuery = window.matchMedia(DESKTOP_WIDTH);
  widthQuery.addEventListener('change', () => restore(el));

  return {
    onDragStart(event, target) {
      if (!isSnapped(target)) return;
      const size = restoreSize(target);
      restore(target);
      if (!size) return;
      // Tear-off: re-place the restored window so the titlebar stays under the
      // cursor instead of snapping back to wherever it was before.
      const box = boxOf(host);
      target.style.left = `${event.clientX - box.left - size.width / 2}px`;
      target.style.top = `${event.clientY - box.top - 8}px`;
      target.style.right = 'auto';
      target.style.bottom = 'auto';
    },

    onDragMove(event, target, constraintRect) {
      if (!floatingLayoutOn()) return;
      const box = constraintRect ?? boxOf(host);
      pending = zoneForPointer(event.clientX, event.clientY, box);
      if (pending) showGhost(pending, box, host, target);
      else hideGhost();
    },

    onDragEnd(event, target, constraintRect) {
      hideGhost();
      if (!pending || !floatingLayoutOn()) {
        pending = null;
        return;
      }
      applySnap(target, pending, constraintRect ?? boxOf(host));
      syncMaxButton(target);
      pending = null;
    }
  };
}

/** Keep a window's maximize control in step with its actual state. */
export function syncMaxButton(el: HTMLElement): void {
  const btn = el.querySelector<HTMLButtonElement>('.win-btn--max');
  if (!btn) return;
  const max = snappedZone(el) === 'max';
  btn.setAttribute('aria-pressed', String(max));
  btn.setAttribute('aria-label', max ? 'restore' : 'maximize');
  btn.textContent = max ? '❐' : '□';
}

/**
 * Wire the maximize control and titlebar double-click for one window.
 * No-op for windows that were not declared `maximizable`.
 */
export function wireMaximize(el: HTMLElement, host: HTMLElement | null): void {
  const btn = el.querySelector<HTMLButtonElement>('.win-btn--max');
  if (!btn || !host) return;

  const toggle = () => {
    if (!floatingLayoutOn()) return;
    if (snappedZone(el) === 'max') restore(el);
    else applySnap(el, 'max', boxOf(host));
    syncMaxButton(el);
  };

  btn.hidden = false;
  btn.addEventListener('click', toggle);
  el.querySelector<HTMLElement>('.win-bar')?.addEventListener('dblclick', (event) => {
    if (event.target instanceof Element && event.target.closest('button, a')) return;
    toggle();
  });
}
