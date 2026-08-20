/**
 * Shared pointer-capture drag for ralphOS floating windows and dialogs.
 *
 * - Owns ONLY inline `left` / `top` / `z-index` on the element. Entrance
 *   animations on draggable elements must animate opacity, never transform.
 * - Guarded behind (pointer: fine): makeDraggable() is a no-op (returns
 *   null) on coarse pointers. Drag stays ENABLED under reduced motion —
 *   it is user-initiated movement, not an animation.
 * - Resets inline position when the 1024px breakpoint is crossed so mobile
 *   layouts never inherit desktop drag offsets.
 */

const FINE_POINTER = '(pointer: fine)';
const DESKTOP_WIDTH = '(min-width: 1024px)';

let zCounter = 10; // matches --z-float
let focusedEl: HTMLElement | null = null;

export interface DraggableController {
  /** Clear inline position/z-index (e.g. before re-showing a dialog). */
  reset(): void;
  /** Remove all listeners. */
  destroy(): void;
}

export function canDrag(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(FINE_POINTER).matches;
}

/** Raise an element above its floating siblings and mark it focused. */
export function raiseWindow(el: HTMLElement): void {
  zCounter += 1;
  el.style.zIndex = String(zCounter);
  if (focusedEl && focusedEl !== el) focusedEl.classList.remove('is-focused');
  el.classList.add('is-focused');
  focusedEl = el;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), Math.max(min, max));

export function makeDraggable(
  el: HTMLElement,
  handle: HTMLElement = el,
  constraint: HTMLElement | null = null
): DraggableController | null {
  if (!canDrag()) return null;

  let dragging = false;
  let pointerId = -1;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let minLeft = -Infinity;
  let maxLeft = Infinity;
  let minTop = -Infinity;
  let maxTop = Infinity;

  const isInteractive = (target: EventTarget | null): boolean =>
    target instanceof Element &&
    Boolean(target.closest('a, button, input, textarea, select, summary, label'));

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    raiseWindow(el);
    if (isInteractive(event.target)) return;

    const rect = el.getBoundingClientRect();
    const parent = el.offsetParent instanceof HTMLElement ? el.offsetParent : null;
    const parentRect = parent?.getBoundingClientRect();
    const originX = parentRect ? parentRect.left - parent!.scrollLeft : 0;
    const originY = parentRect ? parentRect.top - parent!.scrollTop : 0;

    startLeft = rect.left - originX;
    startTop = rect.top - originY;
    startX = event.clientX;
    startY = event.clientY;

    if (constraint) {
      const c = constraint.getBoundingClientRect();
      minLeft = c.left - originX;
      minTop = c.top - originY;
      maxLeft = minLeft + c.width - rect.width;
      maxTop = minTop + c.height - rect.height;
    } else {
      minLeft = -Infinity;
      maxLeft = Infinity;
      minTop = -Infinity;
      maxTop = Infinity;
    }

    dragging = true;
    pointerId = event.pointerId;
    handle.setPointerCapture(event.pointerId);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    event.preventDefault();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const left = clamp(startLeft + (event.clientX - startX), minLeft, maxLeft);
    const top = clamp(startTop + (event.clientY - startY), minTop, maxTop);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    // once we own left/top, neutralize authored right/bottom offsets
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  };

  const endDrag = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    pointerId = -1;
  };

  const reset = () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    if (dragging && handle.hasPointerCapture(pointerId)) {
      handle.releasePointerCapture(pointerId);
    }
    dragging = false;
    pointerId = -1;
    el.style.left = '';
    el.style.top = '';
    el.style.right = '';
    el.style.bottom = '';
    el.style.zIndex = '';
    el.classList.remove('is-focused');
    if (focusedEl === el) focusedEl = null;
  };

  // Mobile must never inherit desktop drag offsets.
  const widthQuery = window.matchMedia(DESKTOP_WIDTH);
  const onBreakpointChange = () => reset();
  widthQuery.addEventListener('change', onBreakpointChange);

  handle.addEventListener('pointerdown', onPointerDown);

  const destroy = () => {
    reset();
    widthQuery.removeEventListener('change', onBreakpointChange);
    handle.removeEventListener('pointerdown', onPointerDown);
  };

  return { reset, destroy };
}
