import { getReadSlugs } from './read-posts';

const badges = document.querySelectorAll<HTMLElement>('.new-badge[data-slug]');
if (badges.length > 0) {
  const read = getReadSlugs();
  badges.forEach((badge) => {
    if (!read.has(badge.dataset.slug ?? '')) {
      badge.hidden = false;
    }
  });
}
