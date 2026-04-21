type PostHogCaptureProps = Record<string, number | string>;
type PostHogClient = {
  capture: (eventName: string, properties?: PostHogCaptureProps) => void;
};

const posthog = (window as Window & { posthog?: PostHogClient }).posthog;
const main = document.querySelector<HTMLElement>('main.now-page');

if (posthog && main) {
  const rows = Array.from(document.querySelectorAll<HTMLAnchorElement>('.now-project-row'));
  const projectCount = Number(main.dataset.projectCount ?? rows.length);

  posthog.capture('now_viewed', { project_count: projectCount });

  document.addEventListener('click', (ev) => {
    const link = (ev.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.href;

    if (link.matches('.now-project-row')) {
      const position = rows.indexOf(link) + 1;
      posthog.capture('now_project_clicked', {
        name: link.dataset.name ?? '',
        status: link.dataset.status ?? '',
        url: href,
        position
      });
      return;
    }

    if (link.matches('.post-nav-link')) {
      posthog.capture('now_nav_clicked', { href });
    }
  });
}
