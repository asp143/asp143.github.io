# Scroll Dot Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the scroll dot as a clean state machine using Motion.js `animate()` for all movement — direct heading-to-heading falls with ease-in-out easing, scale pulse on landing, no detach model.

**Architecture:** Single fixed-positioned DOM element (`.scroll-dot`) driven by a 4-state machine (`hidden | animating | resting | rolled`). Scroll events + rAF detect active section via heading position in viewport. Motion.js handles all positional animation with `.stop()` for cancellation on fast scroll. Contact section retains the roll-into-period behavior.

**Tech Stack:** Vanilla TypeScript in `<script>` tag, Motion.js v12 (already loaded via CDN), CSS for static styles only (no transition-based animation classes)

---

### Task 1: Strip old scroll-dot CSS animation classes

**Files:**
- Modify: `src/styles/home.css:636-676`

**Step 1: Replace the entire Scroll Dot CSS section**

Replace lines 636-676 with:

```css
/* ===== Scroll Dot ===== */

.scroll-dot {
  position: fixed;
  width: 10px;
  height: 10px;
  background: var(--color-accent);
  border-radius: 50%;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
  box-shadow: 0 0 12px rgba(255, 51, 51, 0.4);
  transition: opacity 0.4s ease;
}

.scroll-dot--visible {
  opacity: 1;
}

.scroll-dot--rolling {
  transition: left 0.5s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s ease, opacity 0.4s ease;
}

.scroll-dot--settled {
  transition: opacity 0.3s ease;
}
```

Key changes from old code:
- Removed `left: 50%`, `transform: translateX(-50%)`, `top: 60px` — Motion.js sets these inline
- Removed `--falling`, `--detached` classes — Motion.js handles all movement
- Kept `--rolling` and `--settled` for the contact period CSS transition
- Simplified `will-change` to only `transform, opacity`

**Step 2: Verify build**

Run: `npx astro build`
Expected: Build succeeds (CSS is valid, JS still references old classes but will be replaced in Task 2)

**Step 3: Commit**

```bash
git add src/styles/home.css
git commit -m "refactor(scroll-dot): Strip old CSS animation classes for Motion.js rewrite"
```

---

### Task 2: Rewrite scroll dot JS with Motion.js

**Files:**
- Modify: `src/pages/index.astro:268-555` (the entire `if (scrollDot && hero && sections.length)` block through the `else if (scrollIndicator)` fallback)

**Step 1: Replace the scroll dot logic block**

Replace the block from line 268 (`if (scrollDot && hero && sections.length) {`) through line 555 (`}`) — that's the entire scroll dot + fallback block — with:

```typescript
      if (scrollDot && hero && sections.length) {
        // === State Machine ===
        type DotState = 'hidden' | 'animating' | 'resting' | 'rolled';
        let state: DotState = 'hidden';
        let currentIndex = -1;
        let ticking = false;
        let currentAnimation: ReturnType<typeof animate> | null = null;
        let rollTimeoutA: ReturnType<typeof setTimeout> | null = null;
        let rollTimeoutB: ReturnType<typeof setTimeout> | null = null;

        const DOT_SIZE = 10;
        const DOT_RADIUS = DOT_SIZE / 2;
        const DOT_SIDE_GAP = 12;
        const TRIGGER_FRACTION = 0.35; // heading must be in top 35% of viewport

        // --- Helpers ---

        function getDotTarget(index: number): { x: number; y: number } {
          const section = sections[index] as HTMLElement;
          const marker = section?.querySelector('.dot-target') as HTMLElement | null;
          if (marker) {
            const rect = marker.getBoundingClientRect();
            const heading = marker.closest('.section-heading, .contact-cta') as HTMLElement | null;
            let transformY = 0;
            if (heading) {
              const t = getComputedStyle(heading).transform;
              if (t && t !== 'none') {
                transformY = new DOMMatrix(t).m42;
              }
            }
            return {
              x: rect.right + DOT_SIDE_GAP + DOT_RADIUS,
              y: rect.top - transformY + rect.height * 0.5 - DOT_RADIUS,
            };
          }
          return { x: window.innerWidth / 2, y: 60 };
        }

        function getActiveIndex(): number {
          const threshold = window.innerHeight * TRIGGER_FRACTION;
          let active = 0;
          sections.forEach((section, i) => {
            const heading = (section as HTMLElement).querySelector('.dot-target') as HTMLElement | null;
            if (heading) {
              if (heading.getBoundingClientRect().top <= threshold) {
                active = i;
              }
            } else {
              if (window.scrollY + window.innerHeight >= (section as HTMLElement).offsetTop) {
                active = i;
              }
            }
          });
          return Math.min(active, sections.length - 1);
        }

        function cancelAnimation() {
          if (currentAnimation) {
            currentAnimation.stop();
            currentAnimation = null;
          }
        }

        function clearRollTimeouts() {
          if (rollTimeoutA) { clearTimeout(rollTimeoutA); rollTimeoutA = null; }
          if (rollTimeoutB) { clearTimeout(rollTimeoutB); rollTimeoutB = null; }
        }

        function resetRolling() {
          clearRollTimeouts();
          if (state === 'rolled') {
            scrollDot.classList.remove('scroll-dot--rolling', 'scroll-dot--settled');
            scrollDot.style.opacity = '';
            if (contactPeriod) contactPeriod.style.opacity = '';
          }
        }

        function positionDotAt(x: number, y: number) {
          scrollDot.style.left = `${x}px`;
          scrollDot.style.top = `${y}px`;
        }

        // --- Core: animate dot to a target heading ---

        function animateToHeading(targetIndex: number) {
          cancelAnimation();
          state = 'animating';
          currentIndex = targetIndex;

          if (targetIndex < sections.length - 1) resetRolling();

          const target = getDotTarget(targetIndex);
          const currentLeft = parseFloat(scrollDot.style.left) || window.innerWidth / 2;
          const currentTop = parseFloat(scrollDot.style.top) || 60;
          const distance = Math.abs(target.y - currentTop);
          const duration = Math.min(0.5, Math.max(0.22, 0.16 + distance * 0.00065));

          currentAnimation = animate(
            scrollDot,
            {
              left: [`${currentLeft}px`, `${target.x}px`],
              top: [`${currentTop}px`, `${target.y}px`],
            },
            { duration, easing: [0.45, 0, 0.55, 1] }
          );

          currentAnimation.finished.then(() => {
            currentAnimation = null;

            // Snap to precise position
            const landed = getDotTarget(currentIndex);
            positionDotAt(landed.x, landed.y);

            // Scale pulse on landing
            animate(scrollDot, { scale: [1, 1.2, 1] }, { duration: 0.3 });

            // Contact section: roll into period
            const isLastSection = currentIndex === sections.length - 1;
            if (isLastSection && contactPeriod) {
              rollTimeoutA = setTimeout(() => {
                const periodRect = contactPeriod.getBoundingClientRect();
                const periodCenterX = periodRect.left + periodRect.width / 2;
                const periodCenterY = periodRect.top + periodRect.height / 2;

                scrollDot.classList.add('scroll-dot--rolling');
                positionDotAt(periodCenterX, periodCenterY);

                rollTimeoutB = setTimeout(() => {
                  scrollDot.classList.add('scroll-dot--settled');
                  scrollDot.style.opacity = '0';
                  if (contactPeriod) contactPeriod.style.opacity = '1';
                  state = 'rolled';
                }, 550);
              }, 200);
              return;
            }

            state = 'resting';
          }).catch(() => {
            // Animation was cancelled — no-op, a new animation took over
          });
        }

        // --- Scroll handler ---

        const onScroll = () => {
          if (ticking) return;
          ticking = true;

          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const heroBottom = hero.offsetHeight * 0.7;

            // Fade scroll indicator
            if (scrollIndicator) {
              const fade = Math.max(1 - scrollY / (window.innerHeight * 0.3), 0);
              scrollIndicator.style.opacity = String(fade);
            }

            // === HIDDEN: in hero area ===
            if (scrollY <= heroBottom) {
              if (state !== 'hidden') {
                cancelAnimation();
                clearRollTimeouts();
                resetRolling();

                if (heroPeriod) {
                  // Animate dot back to hero period, then swap
                  const heroRect = heroPeriod.getBoundingClientRect();
                  const heroCenterX = heroRect.left + heroRect.width / 2;
                  const heroCenterY = heroRect.top + heroRect.height / 2;

                  const currentLeft = parseFloat(scrollDot.style.left) || heroCenterX;
                  const currentTop = parseFloat(scrollDot.style.top) || heroCenterY;
                  const dist = Math.abs(heroCenterY - currentTop);
                  const dur = Math.min(0.35, Math.max(0.15, dist * 0.0005));

                  heroPeriod.style.opacity = '0';

                  currentAnimation = animate(
                    scrollDot,
                    {
                      left: [`${currentLeft}px`, `${heroCenterX}px`],
                      top: [`${currentTop}px`, `${heroCenterY}px`],
                    },
                    { duration: dur, easing: [0.45, 0, 0.55, 1] }
                  );

                  currentAnimation.finished.then(() => {
                    currentAnimation = null;
                    scrollDot.classList.remove('scroll-dot--visible');
                    heroPeriod.style.opacity = '1';
                  }).catch(() => {});
                } else {
                  scrollDot.classList.remove('scroll-dot--visible');
                }

                state = 'hidden';
                currentIndex = -1;
                if (contactPeriod) contactPeriod.style.opacity = '';
              }
              ticking = false;
              return;
            }

            // Past hero — show dot
            scrollDot.classList.add('scroll-dot--visible');
            if (heroPeriod) heroPeriod.style.opacity = '0';

            const activeIndex = getActiveIndex();

            // === HIDDEN → first appearance ===
            if (state === 'hidden') {
              const target = getDotTarget(activeIndex);
              positionDotAt(target.x, target.y);
              currentIndex = activeIndex;
              state = 'resting';
              ticking = false;
              return;
            }

            // === RESTING: active section changed → animate ===
            if (state === 'resting' && activeIndex !== currentIndex) {
              animateToHeading(activeIndex);
            }

            // === ROLLED: scroll back from contact ===
            else if (state === 'rolled' && activeIndex < currentIndex) {
              resetRolling();
              scrollDot.classList.add('scroll-dot--visible');
              animateToHeading(activeIndex);
            }

            // === ANIMATING: target changed mid-flight → redirect ===
            else if (state === 'animating' && activeIndex !== currentIndex) {
              animateToHeading(activeIndex);
            }

            ticking = false;
          });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
      } else if (scrollIndicator) {
        // Fallback: just fade the scroll indicator
        window.addEventListener('scroll', () => {
          const fade = Math.max(1 - window.scrollY / (window.innerHeight * 0.3), 0);
          scrollIndicator.style.opacity = String(fade);
        }, { passive: true });
      }
```

**Step 2: Verify build**

Run: `npx astro build`
Expected: Build succeeds, no TypeScript errors

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(scroll-dot): Rewrite with Motion.js direct heading-to-heading animation

Full rewrite of scroll dot logic:
- 4-state machine (hidden, animating, resting, rolled)
- Motion.js animate() for all movement with ease-in-out easing
- Direct fall between headings (no detach model)
- Scale pulse (1 → 1.2 → 1) on landing
- Cancel in-flight animation on fast scroll
- Smooth hero period return animation"
```

---

### Task 3: Manual testing and tuning

**Step 1: Start dev server**

Run: `npx astro dev`

**Step 2: Test each behavior**

1. Page load → dot should NOT be visible in hero section
2. Scroll past hero → dot appears instantly at "Projects" heading (no animation on first appearance)
3. Continue scrolling → when "About" heading enters top 35% of viewport, dot animates from Projects to About with smooth ease-in-out
4. Continue to "Writing" → same smooth animation
5. Continue to "Contact" → dot falls to contact heading, then rolls into period
6. Scroll back up → dot rises from current heading to previous one (same easing, works in reverse)
7. Scroll all the way back to hero → dot animates back to hero period position, fades out, hero period reappears
8. Fast scroll from top to bottom → dot should skip intermediate headings, animate directly to correct one
9. Fast scroll back and forth → no jitter, animations cancel cleanly

**Step 3: Tune if needed**

Adjust these constants based on feel:
- `TRIGGER_FRACTION` (0.35) — when headings become "active"
- Duration formula coefficients — speed of animation
- Scale pulse magnitude (1.2) and duration (0.3s)

**Step 4: Commit tuning changes**

```bash
git add src/pages/index.astro src/styles/home.css
git commit -m "fix(scroll-dot): Tune animation timing and trigger threshold"
```
