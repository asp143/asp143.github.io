# Scroll Dot: Falling Ball Between Floors

**Date:** 2026-02-19
**Branch:** feat/scroll-dot-animation

## Goal

Make the scroll dot feel like a falling ball between floors, where each section header is a floor. The fall triggers the moment the next section header enters the bottom edge of the viewport.

## Changes

### 1. Trigger: viewport entry (not 40% scroll threshold)

Update `getActiveIndex()` in `src/pages/index.astro` to check whether each section heading has entered the viewport bottom, i.e. `heading.getBoundingClientRect().top <= window.innerHeight`. Replace the current calculation `window.scrollY + window.innerHeight * TRIGGER_RATIO >= section.offsetTop`.

The DETACHED state's fall trigger already delegates to `getActiveIndex()`, so this single change cascades to all fall triggers correctly.

### 2. Easing: gravity-like acceleration

Replace the `.scroll-dot--falling` CSS transition curve in `src/styles/home.css` from:

```
cubic-bezier(0.24, 0.9, 0.34, 1)   // decelerates — starts fast, coasts to stop
```

to:

```
cubic-bezier(0.55, 0, 0.9, 0.2)    // accelerates — starts slow, builds speed, arrives with momentum
```

The existing bounce keyframe plays on landing, giving the "impact" feel. Together: slow release → acceleration → bounce on landing.

## What stays the same

- State machine structure (hidden → falling → resting → detached → falling → ...)
- Dynamic fall duration calculation (scales with fall distance)
- Bounce keyframe animation
- Rolling-into-contact-period behavior
- Scroll-back/re-attach behavior
