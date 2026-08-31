import { capturePostHog, type PostHogClient } from './analytics';
import { bindOutboundLinkTracking } from './outbound';

const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
const main = document.querySelector<HTMLElement>('main.projects-page, main.project-page');

if (posthog && main) {
  if (main.matches('.projects-page')) {
    const cards = Array.from(main.querySelectorAll<HTMLAnchorElement>('.project-tile-link'));
    const projectCount = Number(main.dataset.projectCount ?? cards.length);

    capturePostHog(posthog, 'projects_index_viewed', { project_count: projectCount });

    main.addEventListener('click', (event) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('.project-tile-link');
      if (!link) return;

      capturePostHog(posthog, 'project_clicked', { slug: link.dataset.slug ?? '' });
    });
  }

  if (main.matches('.project-page')) {
    const slug = main.dataset.slug ?? '';
    const title = main.dataset.title ?? '';

    capturePostHog(posthog, 'project_viewed', { slug, title });
    bindOutboundLinkTracking(posthog, { root: main, slug });
  }
}
