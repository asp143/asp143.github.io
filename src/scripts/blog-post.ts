type PostHogCaptureProps = Record<string, number | string>;
type PostHogClient = {
  capture: (eventName: string, properties?: PostHogCaptureProps) => void;
};

import { markPostRead } from './read-posts';
import { shouldRedirectToDesktop } from './media';

/* Desktop readers enter the ralphOS view on their first real interaction.
   Crawlers leave the article untouched because they do not interact. */
if (shouldRedirectToDesktop()) {
  const interactionEvents = ['pointermove', 'wheel', 'touchstart', 'keydown', 'scroll'] as const;
  const listenerOptions = { once: true, passive: true };
  let redirectStarted = false;

  const redirectToDesktop = () => {
    if (redirectStarted) return;
    redirectStarted = true;
    interactionEvents.forEach((eventName) => {
      window.removeEventListener(eventName, redirectToDesktop, listenerOptions);
    });

    const target = location.pathname + location.search + location.hash;
    location.replace('/?open=' + encodeURIComponent(target));
  };

  interactionEvents.forEach((eventName) => {
    window.addEventListener(eventName, redirectToDesktop, listenerOptions);
  });
}

const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
const main = document.querySelector<HTMLElement>('main.post-page');
const progressBar = document.querySelector<HTMLElement>('.post-progress-bar');

if (main?.dataset.slug) {
  markPostRead(main.dataset.slug);
}

/* ---------- Reading progress + scroll depth (single rAF-gated listener).
   The progress bar works even when PostHog is unavailable; depth events
   stay PostHog-gated. ---------- */
if (main && (progressBar || posthog)) {
  const slug = main.dataset.slug ?? '';
  const depthMarks = new Set<number>();
  let depthTicking = false;
  let docHeight = 0;

  const refreshDocHeight = () => {
    docHeight = document.documentElement.scrollHeight - window.innerHeight;
  };

  const paintProgress = (): number => {
    const ratio =
      docHeight > 0 ? Math.min(Math.max(window.scrollY / docHeight, 0), 1) : 0;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${ratio})`;
    }
    return ratio;
  };

  const onScrollDepth = () => {
    if (depthTicking) return;
    depthTicking = true;
    requestAnimationFrame(() => {
      const pct = Math.round(paintProgress() * 100);
      if (posthog) {
        [25, 50, 75, 100].forEach((mark) => {
          if (pct >= mark && !depthMarks.has(mark)) {
            depthMarks.add(mark);
            posthog.capture('blog_scroll_depth', { slug, percent: mark });
          }
        });
      }
      depthTicking = false;
    });
  };

  refreshDocHeight();
  const resizeObserver = new ResizeObserver(refreshDocHeight);
  resizeObserver.observe(document.documentElement);
  window.addEventListener('resize', refreshDocHeight, { passive: true });
  window.addEventListener('scroll', onScrollDepth, { passive: true });
  paintProgress(); // initial paint (deep links / restored scroll position)
}

if (posthog && main) {
  const slug = main.dataset.slug ?? '';
  const title = main.dataset.title ?? '';
  const tags = main.dataset.tags ?? '';
  const pubDate = main.dataset.pubDate ?? '';

  posthog.capture('blog_post_viewed', { slug, title, tags, pub_date: pubDate });

  /* ---------- Read time (active dwell, visibility-gated) ---------- */
  let activeMs = 0;
  let lastTick = Date.now();
  let isVisible = document.visibilityState === 'visible';

  const flushActive = () => {
    if (isVisible) activeMs += Date.now() - lastTick;
    lastTick = Date.now();
  };

  document.addEventListener('visibilitychange', () => {
    flushActive();
    isVisible = document.visibilityState === 'visible';
  });

  const readMarks = new Set<number>();
  const thresholds = [30, 60, 120, 300];
  const checkRead = () => {
    flushActive();
    const seconds = Math.floor(activeMs / 1000);
    thresholds.forEach((mark) => {
      if (seconds >= mark && !readMarks.has(mark)) {
        readMarks.add(mark);
        posthog.capture('blog_read_time', { slug, seconds: mark });
      }
    });
    if (readMarks.size === thresholds.length) clearInterval(intervalId);
  };
  const intervalId = window.setInterval(checkRead, 5000);

  /* ---------- Clicks ---------- */
  const slugFromHref = (href: string): string => {
    try {
      const path = new URL(href).pathname;
      const match = path.match(/^\/blog\/([^/]+)\/?$/);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  };

  document.addEventListener('click', (ev) => {
    const link = (ev.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.href;

    if (link.matches('.post-back')) {
      posthog.capture('blog_post_back_clicked', { from_slug: slug });
      return;
    }

    if (link.matches('.post-follow-cta')) {
      posthog.capture('blog_follow_x_clicked', { slug, href });
      return;
    }

    if (link.matches('.related-posts-link')) {
      posthog.capture('blog_related_clicked', {
        from_slug: slug,
        to_slug: slugFromHref(href),
        to_title: link.querySelector('.related-posts-link-title')?.textContent?.trim() ?? ''
      });
      return;
    }

    if (link.matches('.post-nav-link')) {
      const text = link.textContent?.trim() ?? '';
      let direction = 'other';
      if (text.startsWith('←')) direction = 'prev';
      else if (text.endsWith('→')) direction = 'next';
      else if (text.includes('cd ~/')) direction = 'home';
      posthog.capture('blog_post_nav_clicked', {
        from_slug: slug,
        direction,
        to_slug: slugFromHref(href),
        href
      });
      return;
    }

    if (link.closest('.post-content')) {
      try {
        const url = new URL(href);
        if (url.hostname && url.hostname !== location.hostname) {
          posthog.capture('blog_external_link_clicked', {
            slug,
            href,
            text: (link.textContent?.trim() ?? '').slice(0, 120)
          });
        }
      } catch {
        /* non-http href, ignore */
      }
    }
  });
}
