type PostHogCaptureProps = Record<string, number | string>;
type PostHogClient = {
  capture: (eventName: string, properties?: PostHogCaptureProps) => void;
};

const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
const main = document.querySelector<HTMLElement>('main.post-page');

if (posthog && main) {
  const slug = main.dataset.slug ?? '';
  const title = main.dataset.title ?? '';
  const tags = main.dataset.tags ?? '';
  const pubDate = main.dataset.pubDate ?? '';

  posthog.capture('blog_post_viewed', { slug, title, tags, pub_date: pubDate });

  /* ---------- Scroll depth ---------- */
  const depthMarks = new Set<number>();
  let depthTicking = false;
  const onScrollDepth = () => {
    if (depthTicking) return;
    depthTicking = true;
    requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.round((window.scrollY / docHeight) * 100);
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
  window.addEventListener('scroll', onScrollDepth, { passive: true });

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
      if (text.startsWith('\u2190')) direction = 'prev';
      else if (text.endsWith('\u2192')) direction = 'next';
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
