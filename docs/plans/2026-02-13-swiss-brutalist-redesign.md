# Swiss/Brutalist Portfolio Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign ralphjonas.com from decorative dark portfolio to a Type-Forward Swiss/Brutalist aesthetic with Motion (vanilla JS) animations.

**Architecture:** Single-page Astro site. Replace all CSS and markup. Add `motion` package for scroll-triggered and stagger animations. Remove decorative SVG components. Keep BaseLayout structure intact but update fonts/meta.

**Tech Stack:** Astro 5, Motion (vanilla JS via CDN ESM import), Google Fonts (Space Grotesk + Inter), pure CSS (no framework)

---

### Task 1: Install Motion & Update BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Step 1: Add Google Fonts and update meta in BaseLayout.astro**

In `src/layouts/BaseLayout.astro`, inside `<head>`, add Google Fonts preconnect and stylesheet links. Update theme-color meta tag.

Add after the viewport meta tag:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

Change the theme-color meta from `#6574cd` to `#0a0a0a`.

Also remove the legacy `gatsby-starter` meta tag since this is no longer a Gatsby project.

**Step 2: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts, no errors. Page loads (will look broken until CSS is updated).

**Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(layout): Add Google Fonts and update theme-color for Swiss redesign"
```

---

### Task 2: Rewrite global.css

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Replace global.css with new fonts and reset**

Replace the entire contents of `src/styles/global.css` with:

```css
/* ===== CSS Custom Properties ===== */
:root {
  --color-bg: #0a0a0a;
  --color-text: #fafafa;
  --color-text-muted: #666666;
  --color-accent: #ff3333;
  --color-border: #1a1a1a;
  --color-surface: #111111;

  --font-heading: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --max-width: 1200px;
  --section-padding-y: clamp(80px, 12vh, 160px);
  --section-padding-x: clamp(1.5rem, 5vw, 6rem);
}

/* ===== Reset ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  scroll-behavior: smooth;
  background-color: var(--color-bg);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

html,
body {
  width: 100%;
  min-height: 100%;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.6;
}

a {
  color: var(--color-text);
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 500;
  line-height: 1.1;
}
```

**Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): Rewrite global.css with Swiss design tokens and reset"
```

---

### Task 3: Rewrite home.css — Complete Swiss/Brutalist Stylesheet

**Files:**
- Modify: `src/styles/home.css`

**Step 1: Replace home.css entirely**

Replace the entire contents of `src/styles/home.css` with the Swiss/Brutalist stylesheet. This is the largest single file change.

```css
/* ===== Base Layout ===== */

.portfolio-page {
  position: relative;
}

.section {
  position: relative;
  width: 100%;
  padding: var(--section-padding-y) var(--section-padding-x);
}

.section-inner {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ===== Section Header Pattern ===== */

.section-number {
  font-family: var(--font-heading);
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  font-weight: 300;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.section-heading {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.section-rule {
  width: 100%;
  height: 1px;
  background: var(--color-border);
  border: none;
  margin-bottom: clamp(2rem, 4vw, 3.5rem);
}

/* ===== Hero ===== */

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--section-padding-x);
}

.hero-inner {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
}

.hero-name {
  font-family: var(--font-heading);
  font-size: clamp(4rem, 15vw, 12rem);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--color-text);
  margin: 0;
}

.hero-name-line {
  display: block;
  overflow: hidden;
}

.hero-name-letter {
  display: inline-block;
}

.hero-period {
  color: var(--color-accent);
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 400;
  color: var(--color-text-muted);
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
  max-width: 45ch;
  line-height: 1.6;
}

.hero-scroll {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.hero-scroll-text {
  font-family: var(--font-heading);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.hero-scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--color-text-muted), transparent);
}

/* ===== Project List ===== */

.project-list {
  list-style: none;
}

.project-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1rem, 2vw, 1.5rem) 0;
  border-bottom: 1px solid var(--color-border);
  cursor: default;
  position: relative;
  transition: padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 768px) {
  .project-row {
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    gap: 2rem;
  }
}

.project-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: var(--color-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-row:hover::before {
  width: 3px;
}

.project-row:hover {
  padding-left: 1.25rem;
}

.project-name {
  font-family: var(--font-heading);
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.project-row:hover .project-name {
  color: var(--color-accent);
}

.project-tech {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.project-desc {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 55ch;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
}

.project-row:hover .project-desc {
  max-height: 100px;
  opacity: 1;
}

@media (min-width: 768px) {
  .project-desc {
    position: absolute;
    left: 1.25rem;
    top: 100%;
    width: 60%;
  }

  .project-row:hover {
    padding-bottom: calc(clamp(1rem, 2vw, 1.5rem) + 2rem);
  }
}

/* Other projects subheading */
.other-heading {
  font-family: var(--font-heading);
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: clamp(2.5rem, 4vw, 4rem);
  margin-bottom: 1rem;
}

.compact-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: clamp(0.75rem, 1.5vw, 1rem) 0;
  border-bottom: 1px solid var(--color-border);
  transition: padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

@media (min-width: 768px) {
  .compact-row {
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    gap: 2rem;
  }
}

.compact-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: var(--color-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.compact-row:hover::before {
  width: 2px;
}

.compact-row:hover {
  padding-left: 1rem;
}

.compact-name {
  font-family: var(--font-heading);
  font-size: clamp(0.9375rem, 1.5vw, 1.125rem);
  font-weight: 500;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.compact-row:hover .compact-name {
  color: var(--color-accent);
}

.compact-tech {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

/* ===== About ===== */

.about-grid {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3rem);
}

.about-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  transition: border-color 0.3s ease;
  object-fit: cover;
}

.about-avatar:hover {
  border-color: var(--color-accent);
}

.about-bio {
  font-family: var(--font-body);
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  color: var(--color-text-muted);
  line-height: 1.7;
  max-width: 60ch;
}

.focus-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
}

.focus-item {
  font-family: var(--font-heading);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: 0.03em;
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--color-border);
  transition: border-color 0.3s ease, color 0.3s ease;
}

.focus-item:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* ===== Writing (Blog) ===== */

.writing-list {
  list-style: none;
}

.writing-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1rem, 2vw, 1.25rem) 0;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  transition: padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

@media (min-width: 768px) {
  .writing-row {
    flex-direction: row;
    align-items: baseline;
    gap: 2rem;
  }
}

.writing-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: var(--color-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.writing-row:hover::before {
  width: 3px;
}

.writing-row:hover {
  padding-left: 1.25rem;
}

.writing-date {
  font-family: var(--font-heading);
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
  flex-shrink: 0;
  min-width: 7ch;
}

.writing-title {
  font-family: var(--font-heading);
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  transition: color 0.3s ease;
}

.writing-row:hover .writing-title {
  color: var(--color-accent);
}

.writing-arrow {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  transition: transform 0.3s ease, color 0.3s ease;
  margin-left: auto;
  display: none;
}

@media (min-width: 768px) {
  .writing-arrow {
    display: block;
  }
}

.writing-row:hover .writing-arrow {
  transform: translateX(6px);
  color: var(--color-accent);
}

.writing-view-all {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: clamp(1.5rem, 3vw, 2rem);
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
  text-decoration: none;
  transition: color 0.3s ease, gap 0.3s ease;
}

.writing-view-all:hover {
  color: var(--color-accent);
  gap: 0.75rem;
}

/* ===== Contact ===== */

.contact-cta {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: clamp(2rem, 4vw, 3rem);
}

.contact-period {
  color: var(--color-accent);
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.contact-link {
  font-family: var(--font-heading);
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  position: relative;
  letter-spacing: 0.02em;
  transition: color 0.3s ease;
}

.contact-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.contact-link:hover {
  color: var(--color-accent);
}

.contact-link:hover::after {
  width: 100%;
}

/* ===== Footer ===== */

.site-footer {
  padding: clamp(2rem, 4vw, 3rem) var(--section-padding-x);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.03em;
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ===== Motion Initial States ===== */
/* These get animated by Motion JS. Set initial hidden state. */

.motion-fade {
  opacity: 0;
  transform: translateY(20px);
}

.motion-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(100%);
}

.motion-stagger {
  opacity: 0;
  transform: translateY(16px);
}

/* ===== Reduced Motion ===== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .motion-fade,
  .motion-letter,
  .motion-stagger {
    opacity: 1;
    transform: none;
  }
}
```

**Step 2: Commit**

```bash
git add src/styles/home.css
git commit -m "feat(styles): Rewrite home.css with Swiss/Brutalist design system"
```

---

### Task 4: Rewrite index.astro — New HTML Structure

**Files:**
- Modify: `src/pages/index.astro`
- Delete: `src/components/SvgIcon.astro`

**Step 1: Replace index.astro with new Swiss/Brutalist markup**

Replace the entire contents of `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import '../styles/home.css';

const currentYear = new Date().getFullYear();
---

<BaseLayout>
  <main class="portfolio-page">
    <!-- Hero -->
    <section class="hero" id="hero">
      <div class="hero-inner">
        <h1 class="hero-name" aria-label="Ralph Jonas">
          <span class="hero-name-line">
            {'RALPH'.split('').map(letter => (
              <span class="hero-name-letter motion-letter">{letter}</span>
            ))}
          </span>
          <span class="hero-name-line">
            {'JONAS'.split('').map(letter => (
              <span class="hero-name-letter motion-letter">{letter}</span>
            ))}
            <span class="hero-name-letter motion-letter hero-period">.</span>
          </span>
        </h1>
        <p class="hero-subtitle motion-fade">
          Full-Stack Developer &amp; AI Integration Specialist building scalable, practical software.
        </p>
      </div>

      <div class="hero-scroll motion-fade" aria-hidden="true">
        <span class="hero-scroll-text">Scroll</span>
        <span class="hero-scroll-line"></span>
      </div>
    </section>

    <!-- 01. Projects -->
    <section class="section" id="projects">
      <div class="section-inner">
        <span class="section-number motion-fade">01.</span>
        <h2 class="section-heading motion-fade">Projects</h2>
        <hr class="section-rule" />

        <ul class="project-list">
          <li class="project-row motion-stagger">
            <span class="project-name">Flight Rewards Search Platform</span>
            <span class="project-tech">Node.js · TypeScript · PostgreSQL · GCP</span>
            <p class="project-desc">Technical lead for a UK-based SaaS platform that helps users find and compare reward flight availability across major airlines.</p>
          </li>
          <li class="project-row motion-stagger">
            <span class="project-name">Billing &amp; Payment Platform</span>
            <span class="project-tech">Node.js · TypeScript · GCP · Event-Driven</span>
            <p class="project-desc">Multi-gateway payment orchestration platform with unified subscription billing, dunning management, and smart retry logic.</p>
          </li>
          <li class="project-row motion-stagger">
            <span class="project-name">Airline Data Aggregation Bots</span>
            <span class="project-tech">TypeScript · Puppeteer · BullMQ</span>
            <p class="project-desc">Automated scrapers collecting flight availability data from multiple airline sources on scheduled intervals.</p>
          </li>
          <li class="project-row motion-stagger">
            <span class="project-name">Remote MCP Server</span>
            <span class="project-tech">TypeScript · Node.js · Docker</span>
            <p class="project-desc">Model Context Protocol server accessible via URL, enabling AI assistants to interact with custom tools through SSE transport.</p>
          </li>
          <li class="project-row motion-stagger">
            <span class="project-name">Home Infrastructure Lab</span>
            <span class="project-tech">Docker · Linux · TrueNAS · Tailscale</span>
            <p class="project-desc">Multi-node self-hosted services ecosystem including NAS, media streaming, workflow automation, and monitoring dashboards.</p>
          </li>
        </ul>

        <h3 class="other-heading motion-fade">Other Work</h3>

        <ul class="project-list">
          <li class="compact-row motion-stagger">
            <span class="compact-name">Airline Route Mapping Service</span>
            <span class="compact-tech">TypeScript · Node.js</span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">Loyalty Points Transfer Engine</span>
            <span class="compact-tech">Node.js · TypeScript · React</span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">Subscription Service Architecture</span>
            <span class="compact-tech">Node.js · GCP · Pub/Sub</span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">AI Development Workflow Standards</span>
            <span class="compact-tech"></span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">Local AI Inference Server</span>
            <span class="compact-tech">Linux · AI/ML Inference</span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">Accident Detection Device</span>
            <span class="compact-tech">Raspberry Pi · Python</span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">Accident Detection Control Panel</span>
            <span class="compact-tech">MongoDB · Express · Angular · Node.js</span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">Audit &amp; Report Generator</span>
            <span class="compact-tech">Angular · Node.js · SQL · AWS</span>
          </li>
          <li class="compact-row motion-stagger">
            <span class="compact-name">Freelance Projects</span>
            <span class="compact-tech">Upwork</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- 02. About -->
    <section class="section" id="about">
      <div class="section-inner">
        <span class="section-number motion-fade">02.</span>
        <h2 class="section-heading motion-fade">About</h2>
        <hr class="section-rule" />

        <div class="about-grid">
          <img
            src="/static/avatar-ae5df907c692f3513038ff216a008c83.png"
            alt="Ralph Jonas Mungcal"
            class="about-avatar motion-fade"
          />
          <p class="about-bio motion-fade">
            Full-stack developer and AI integration specialist. I build products end-to-end and integrate AI to automate workflows and solve real problems.
          </p>

          <div class="focus-list">
            <span class="focus-item motion-stagger">Backend Architecture</span>
            <span class="focus-item motion-stagger">AI Integration</span>
            <span class="focus-item motion-stagger">Cloud Infrastructure</span>
            <span class="focus-item motion-stagger">Developer Tooling</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 03. Writing -->
    <section class="section" id="writing">
      <div class="section-inner">
        <span class="section-number motion-fade">03.</span>
        <h2 class="section-heading motion-fade">Writing</h2>
        <hr class="section-rule" />

        <ul class="writing-list">
          <li>
            <a href="https://ralphdev.bearblog.dev/gcp-secrets/" class="writing-row motion-stagger" target="_blank" rel="noopener noreferrer">
              <time class="writing-date">2026.01</time>
              <span class="writing-title">Secure your cloud build secrets</span>
              <span class="writing-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </li>
          <li>
            <a href="https://ralphdev.bearblog.dev/what-is-a-tech-lead/" class="writing-row motion-stagger" target="_blank" rel="noopener noreferrer">
              <time class="writing-date">2024.04</time>
              <span class="writing-title">What is a Tech lead?</span>
              <span class="writing-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </li>
          <li>
            <a href="https://ralphdev.bearblog.dev/discipline-over-motivation/" class="writing-row motion-stagger" target="_blank" rel="noopener noreferrer">
              <time class="writing-date">2023.02</time>
              <span class="writing-title">Discipline over Motivation</span>
              <span class="writing-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </li>
          <li>
            <a href="https://ralphdev.bearblog.dev/google-cloud-developer-certification-guide/" class="writing-row motion-stagger" target="_blank" rel="noopener noreferrer">
              <time class="writing-date">2022.10</time>
              <span class="writing-title">Google Cloud Developer Certification Guide</span>
              <span class="writing-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </li>
        </ul>

        <a href="https://ralphdev.bearblog.dev/" class="writing-view-all motion-fade" target="_blank" rel="noopener noreferrer">
          View all posts <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </section>

    <!-- 04. Contact -->
    <section class="section" id="contact">
      <div class="section-inner">
        <span class="section-number motion-fade">04.</span>
        <h2 class="contact-cta motion-fade">
          Let's work<br />together<span class="contact-period">.</span>
        </h2>
        <hr class="section-rule" />

        <div class="contact-links">
          <a href="mailto:ralphmungcal09@gmail.com" class="contact-link motion-stagger">Email</a>
          <a href="https://www.linkedin.com/in/ralphjonasmungcal" class="contact-link motion-stagger" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.upwork.com/o/profiles/users/_~01108375a06953763f/" class="contact-link motion-stagger" target="_blank" rel="noopener noreferrer">Upwork</a>
        </div>
      </div>

      <footer class="site-footer">
        Ralph Jonas Mungcal &copy; {currentYear}
      </footer>
    </section>
  </main>

  <script>
    import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@12/+esm";

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Hero: Stagger letters in
      const heroLetters = document.querySelectorAll('.hero-name-letter');
      animate(
        heroLetters,
        { opacity: [0, 1], transform: ['translateY(100%)', 'translateY(0)'] },
        { duration: 0.6, delay: stagger(0.05), easing: [0.16, 1, 0.3, 1] }
      );

      // Hero subtitle + scroll indicator fade in after name
      const heroFades = document.querySelectorAll('.hero .motion-fade');
      animate(
        heroFades,
        { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
        { duration: 0.8, delay: stagger(0.15, { start: 0.8 }), easing: [0.16, 1, 0.3, 1] }
      );

      // Fade out scroll indicator on scroll
      const scrollIndicator = document.querySelector('.hero-scroll');
      if (scrollIndicator) {
        window.addEventListener('scroll', () => {
          const fade = Math.max(1 - window.scrollY / (window.innerHeight * 0.3), 0);
          (scrollIndicator as HTMLElement).style.opacity = String(fade);
        }, { passive: true });
      }

      // Section headers: fade in on scroll
      document.querySelectorAll('.section').forEach((section) => {
        inView(section, () => {
          const fades = section.querySelectorAll('.motion-fade');
          animate(
            fades,
            { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
            { duration: 0.6, delay: stagger(0.1), easing: [0.16, 1, 0.3, 1] }
          );
        }, { amount: 0.1 });
      });

      // Staggered list items: project rows, writing rows, focus items, contact links
      document.querySelectorAll('.section').forEach((section) => {
        inView(section, () => {
          const items = section.querySelectorAll('.motion-stagger');
          animate(
            items,
            { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'] },
            { duration: 0.5, delay: stagger(0.06), easing: [0.16, 1, 0.3, 1] }
          );
        }, { amount: 0.05 });
      });
    } else {
      // Reduced motion: just show everything
      document.querySelectorAll('.motion-fade, .motion-letter, .motion-stagger').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
    }
  </script>
</BaseLayout>
```

**Step 2: Delete SvgIcon component (no longer needed)**

Delete `src/components/SvgIcon.astro` since decorative SVG shapes are removed in the Swiss redesign.

**Step 3: Verify dev server**

Run: `npm run dev`
Expected: Page loads with new Swiss/Brutalist design. No console errors. All sections visible. Animations fire on scroll.

**Step 4: Commit**

```bash
git add src/pages/index.astro
git rm src/components/SvgIcon.astro
git commit -m "feat(home): Rewrite index.astro with Swiss/Brutalist markup and Motion animations

Remove decorative SVG shapes, adopt list-based layouts, add Motion
scroll-triggered animations with letter stagger on hero."
```

---

### Task 5: Build Verification & Responsive Check

**Files:** None (verification only)

**Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors. Output in `dist/`.

**Step 2: Preview production build**

Run: `npm run preview`
Expected: Site loads correctly at preview URL. All animations work. No broken images or fonts.

**Step 3: Check responsive breakpoints**

Open in browser and verify at these widths:
- 375px (mobile)
- 768px (tablet)
- 1200px (desktop)
- 1600px (large desktop)

Expected: All sections readable, no horizontal overflow, hero name scales down gracefully via clamp().

**Step 4: Verify reduced motion**

In browser devtools, emulate `prefers-reduced-motion: reduce`.
Expected: All elements visible immediately, no animations play.

**Step 5: Final commit if any fixes needed**

Only commit if adjustments are needed from verification.

---

### Task 6: Clean Up Static Font Files

**Files:**
- Delete: All `.woff` and `.woff2` files in `public/static/` that were for Cantata One and Open Sans fonts

**Step 1: Identify old font files**

The old global.css loaded Cantata One and Open Sans from local `.woff`/`.woff2` files. Since we now use Google Fonts CDN for Space Grotesk and Inter, the old font files are unused. List them:

```
public/static/cantata-one-latin-400-*.woff2
public/static/cantata-one-latin-400-*.woff
public/static/open-sans-latin-*
```

**Step 2: Delete old font files**

Remove all Cantata One and Open Sans woff/woff2 files from `public/static/`.

**Step 3: Verify build still works**

Run: `npm run build`
Expected: Builds cleanly with no missing asset errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: Remove unused Cantata One and Open Sans font files"
```
