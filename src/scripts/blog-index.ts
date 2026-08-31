import { capturePostHog, type PostHogClient } from './analytics';
import { slugFromHref } from './blog-url';

const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
const main = document.querySelector<HTMLElement>('main.blog-page');

if (posthog && main) {
  const items = Array.from(document.querySelectorAll<HTMLAnchorElement>('.blog-list-link'));
  capturePostHog(posthog, 'blog_index_viewed', { post_count: items.length });

  document.addEventListener('click', (ev) => {
    const link = (ev.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.href;

    if (link.matches('.blog-list-link')) {
      const position = items.indexOf(link) + 1;
      capturePostHog(posthog, 'blog_post_clicked', {
        slug: slugFromHref(href),
        title: link.querySelector('.blog-list-title')?.textContent?.trim() ?? '',
        position
      });
      return;
    }

    if (link.matches('.post-nav-link') && href.endsWith('/rss.xml')) {
      capturePostHog(posthog, 'blog_rss_clicked');
    }
  });
}
