# Swiss/Brutalist Portfolio Redesign

**Date:** 2026-02-13
**Status:** Approved
**Branch:** feat/swiss-brutalist-redesign

## Overview

Redesign ralphjonas.com from its current dark portfolio aesthetic to a Swiss/Brutalist type-forward design. The site stays on Astro with all animations powered by Motion (vanilla JS). Dark background + signal red accent. Five sections retained, all visually redesigned.

## Design Decisions

### Aesthetic: Type-Forward Swiss
- Massive typography as the primary visual element
- Extreme negative space within a dark canvas
- Numbered sections (01, 02, 03, 04) for rhythm
- List-based layouts over cards
- Signal red (#ff3333) used surgically: active states, hover borders, accent periods

### Animation Library: Motion (vanilla JS)
- Package: `motion` from motion.dev
- Replaces all current CSS keyframe animations and IntersectionObserver JS
- Used for: text stagger reveals, scroll-triggered fades, hover interactions, parallax

### Typography
- Headings: **Space Grotesk** (Google Fonts) — geometric, Swiss DNA
- Body: **Inter** (Google Fonts) — clean, highly legible
- Hero name: 15-20vw, viewport-filling

### Color Palette
- Background: `#0a0a0a` (near-black)
- Text primary: `#fafafa` (near-white)
- Text secondary: `#666666` (muted gray)
- Accent: `#ff3333` (signal red)
- Borders/dividers: `#1a1a1a` (barely visible)

### Spacing
- Section vertical padding: 120-160px
- Content max-width: ~1200px
- Hero breaks out to full viewport width

## Section Designs

### 1. Hero

Name in massive type (~15-20vw) filling viewport width. "RALPH" on first line, "JONAS." on second — the period is signal red. Subtitle in smaller muted text below. Scroll indicator at bottom.

**Animation:** Letters stagger in on load (0.05s delay each), subtitle fades up after name completes.

### 2. Projects (01.)

Section number + title at top with horizontal rule. Projects as a clean list — each row has project name left-aligned (large) and tech stack right-aligned (small, muted), separated by thin dividers.

**Hover:** Row gets red left-border, description text slides in below name, subtle lift.

**Animation:** Rows stagger in from bottom (0.08s delay each) on scroll reveal.

Two tiers: featured projects first, then "Other Work" compact list.

### 3. About (02.)

Same section header pattern. Small avatar with red border on hover. Bio text in a single clean column. Focus areas (Backend Architecture, AI Integration, Cloud Infrastructure, Developer Tooling) as minimal bordered boxes in a row.

**Animation:** Content fades up on scroll, focus area boxes stagger in.

### 4. Blog / Writing (03.)

Renamed to "WRITING" for a more Swiss feel. Same list pattern as projects for consistency. Each row: date (YYYY.MM format) left, title center, arrow right. Hover: red accent, arrow slides right.

**Animation:** Staggered row reveal matching projects section.

### 5. Contact (04.)

Large CTA: "LET'S WORK / TOGETHER." with red period mirroring hero. Contact links (Email, LinkedIn, Upwork) as horizontal text with hover underline in red. Minimal footer integrated.

**Animation:** Text reveal on scroll, links fade in staggered.

## Removed Elements

- Decorative SVG shapes (triangles, circles, hexagons)
- Gradient overlays and radial glows
- Wave SVG animations
- Grid pattern backgrounds
- Diagonal clip-paths
- Scroll progress bar
- Section navigation dots (replaced by clean fixed nav or removed entirely)

## Technical Notes

- Astro framework retained (no React migration)
- `motion` package installed via npm
- All Motion code in `<script>` tags within Astro components
- Google Fonts loaded via `<link>` in BaseLayout
- Current SvgIcon.astro component retired
- CSS rewritten from scratch (home.css replaced)
- global.css updated for new font-face definitions
