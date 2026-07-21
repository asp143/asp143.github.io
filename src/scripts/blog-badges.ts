import { getReadSlugs } from './read-posts';

const badges = document.querySelectorAll<HTMLElement>('.new-badge[data-slug]');
if (badges.length > 0) {
  const read = getReadSlugs();
  let unread = 0;
  badges.forEach((badge) => {
    if (!read.has(badge.dataset.slug ?? '')) {
      badge.hidden = false;
      unread += 1;
    }
  });

  /* blog index statusbar: "{n} unread" (SSR renders the span empty) */
  const counter = document.querySelector<HTMLElement>('[data-unread-count]');
  if (counter && unread > 0) {
    counter.textContent = `${unread} unread`;
  }
}
