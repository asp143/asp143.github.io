import { getReadSlugs } from './read-posts';

const read = getReadSlugs();

const badges = document.querySelectorAll<HTMLElement>('.new-badge[data-slug]');
if (badges.length > 0) {
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

/* writing/ desktop icon: shake + "new" badge while any fresh post is unread */
const writingIcon = document.querySelector<HTMLElement>('[data-new-slugs]');
if (writingIcon) {
  const slugs = (writingIcon.dataset.newSlugs ?? '').split(',').filter(Boolean);
  if (slugs.some((slug) => !read.has(slug))) {
    writingIcon.querySelector<HTMLElement>('.desktop-icon-badge')?.removeAttribute('hidden');
    writingIcon.classList.add('desktop-icon--shake');
  }
}
