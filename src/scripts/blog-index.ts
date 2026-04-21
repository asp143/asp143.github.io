type PostHogCaptureProps = Record<string, number | string>;
type PostHogClient = {
  capture: (eventName: string, properties?: PostHogCaptureProps) => void;
};

const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
const main = document.querySelector<HTMLElement>('main.blog-page');

if (posthog && main) {
  const items = Array.from(document.querySelectorAll<HTMLAnchorElement>('.blog-list-link'));
  posthog.capture('blog_index_viewed', { post_count: items.length });

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

    if (link.matches('.blog-list-link')) {
      const position = items.indexOf(link) + 1;
      posthog.capture('blog_post_clicked', {
        slug: slugFromHref(href),
        title: link.querySelector('.blog-list-title')?.textContent?.trim() ?? '',
        position
      });
      return;
    }

    if (link.matches('.post-nav-link') && href.endsWith('/rss.xml')) {
      posthog.capture('blog_rss_clicked');
    }
  });
}
