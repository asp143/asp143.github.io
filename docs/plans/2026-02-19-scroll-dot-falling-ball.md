# Scroll Dot Falling Ball Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the scroll dot fall to the next section heading the moment that heading enters the bottom edge of the viewport, with gravity-like acceleration.

**Architecture:** Two surgical changes — update `getActiveIndex()` to use viewport-entry detection instead of a scroll ratio threshold, and update the CSS fall easing from deceleration to acceleration. No structural changes to the state machine.

**Tech Stack:** Vanilla TypeScript in `src/pages/index.astro`, CSS transitions in `src/styles/home.css`

---

### Task 1: Update fall trigger to viewport-entry detection

**Files:**
- Modify: `src/pages/index.astro:308-317`

**Step 1: Replace `getActiveIndex()`**

The current function fires when `scrollY + viewportHeight * 0.4 >= section.offsetTop`. Replace it so it fires when the section's `.dot-target` heading has entered the viewport bottom (`heading.getBoundingClientRect().top <= window.innerHeight`).

Replace lines 308–317:

```typescript
function getActiveIndex(): number {
  let active = 0;
  sections.forEach((section, i) => {
    const heading = (section as HTMLElement).querySelector('.dot-target') as HTMLElement | null;
    if (heading) {
      if (heading.getBoundingClientRect().top <= window.innerHeight) {
        active = i;
      }
    } else {
      // fallback: section offsetTop
      if (window.scrollY + window.innerHeight >= (section as HTMLElement).offsetTop) {
        active = i;
      }
    }
  });
  return Math.min(active, sections.length - 1);
}
```

Note: `TRIGGER_RATIO` is no longer used. Leave it defined — it's harmless — or delete it (line 280: `const TRIGGER_RATIO = 0.4;`). Deleting is cleaner.

**Step 2: Delete the now-unused `TRIGGER_RATIO` constant**

Remove line 280:
```typescript
const TRIGGER_RATIO = 0.4;
```

**Step 3: Manual test**

Run `npx astro dev`. Scroll slowly from the hero. The dot should **not** fall until the "Projects." heading is visible at the bottom of the screen. Verify for each section.

**Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "fix(scroll-dot): Trigger fall on heading viewport entry, not scroll ratio"
```

---

### Task 2: Update CSS easing to gravity-like acceleration

**Files:**
- Modify: `src/styles/home.css:661-663`

**Step 1: Replace the fall easing**

Current (line 662):
```css
transition: top var(--dot-fall-duration, 320ms) cubic-bezier(0.24, 0.9, 0.34, 1), left var(--dot-fall-duration, 320ms) cubic-bezier(0.24, 0.9, 0.34, 1), opacity 0.4s ease;
```

The curve `cubic-bezier(0.24, 0.9, 0.34, 1)` decelerates (starts fast, coasts). A falling ball accelerates. Replace with `cubic-bezier(0.55, 0, 0.9, 0.2)` — starts slow, builds speed, arrives with momentum. The bounce keyframe plays after landing to give the impact feel.

Replace line 660–663:
```css
/* Falling: gravity-like acceleration for landing impact */
.scroll-dot--falling {
  transition: top var(--dot-fall-duration, 320ms) cubic-bezier(0.55, 0, 0.9, 0.2), left var(--dot-fall-duration, 320ms) cubic-bezier(0.55, 0, 0.9, 0.2), opacity 0.4s ease;
}
```

**Step 2: Manual test**

Scroll down through all sections. The dot should feel like it's being released from rest and picking up speed as it falls, then bouncing on landing. Compare before/after by toggling the curve.

**Step 3: Commit**

```bash
git add src/styles/home.css
git commit -m "fix(scroll-dot): Use gravity-like acceleration easing for falls"
```
