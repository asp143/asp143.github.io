# Scroll Dot: Full Rewrite with Motion.js

**Date:** 2026-02-25
**Branch:** feat/scroll-dot-animation

## Goal

Rewrite the scroll dot as a clean state machine using Motion.js for all animations. Remove the detach model — the dot falls directly from one heading to the next. Smooth ease-in-out easing, scale pulse on landing.

## State Machine

Four states: `hidden | animating | resting | rolled`

- **hidden** — dot invisible, user in hero section
- **animating** — Motion.js moving dot between headings
- **resting** — dot sitting next to active heading, stationary
- **rolled** — dot rolled into contact period (terminal until scroll-back)

## Trigger Logic

`getActiveIndex()` uses scroll + rAF. A heading is "active" when `heading.getBoundingClientRect().top <= window.innerHeight * 0.35` (top ~35% of viewport).

## Animation (Motion.js)

- **Fall/rise:** `animate(dot, { top, left }, { duration: scaled, easing: [0.45, 0, 0.55, 1] })`
- **Scale pulse on land:** `animate(dot, { scale: [1, 1.2, 1] }, { duration: 0.3 })`
- **Duration:** Scales with distance: `Math.min(0.5, Math.max(0.22, 0.16 + distance * 0.00065))` seconds
- **Fast scroll:** Cancel in-flight animation via `.stop()`, animate directly to correct target

## Hero Period Swap

- Scroll past hero: hide hero period, show dot, animate to first active heading
- Scroll back into hero: animate dot to hero period position, fade dot, show period

## Contact Roll

Keep existing behavior: after fall lands on contact section, dot rolls horizontally into the period character and fades out. Uses CSS transition for the horizontal roll.

## CSS

Strip all animation state classes. Keep only:
- `.scroll-dot` — base styles (fixed, size, color, glow, opacity 0)
- `.scroll-dot--visible` — opacity 1
- `.scroll-dot--rolling` — transition for horizontal roll into contact period
- `.scroll-dot--settled` — fade out after roll

## Edge Cases

- **Page load:** Place dot at correct heading instantly, no animation
- **Fast scroll:** Cancel in-flight, animate directly to new target
- **Scroll-back from contact:** Reset rolling state, animate up to previous heading
- **Reduced motion:** Show dot at correct position, no animations
