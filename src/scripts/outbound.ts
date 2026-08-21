type PostHogClient = {
  capture: (eventName: string, properties?: Record<string, number | string>) => void;
};

type OutboundLinkOptions = {
  root?: Document | HTMLElement;
  selector?: string;
  slug?: string;
};

export function bindOutboundLinkTracking(
  posthog: PostHogClient,
  { root = document, selector = 'a[href]', slug }: OutboundLinkOptions = {}
) {
  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[href]');
    if (!link || !link.matches(selector)) return;

    try {
      const url = new URL(link.href, location.href);
      if (!['http:', 'https:'].includes(url.protocol) || url.host === location.host) return;

      const properties: Record<string, string> = {
        href: url.href,
        host: url.host
      };
      if (slug) properties.slug = slug;

      const linkText = link.textContent?.replace(/\s+/g, ' ').trim().slice(0, 120);
      if (linkText) properties.link_text = linkText;

      posthog.capture('outbound_link_clicked', properties);
    } catch {
      /* non-URL href, ignore */
    }
  });
}
