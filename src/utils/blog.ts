import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogEntry[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

export function formatPubDate(date: Date): string {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatPubDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getRelatedPosts(
  current: BlogEntry,
  all: BlogEntry[],
  limit = 3
): BlogEntry[] {
  const currentTags = new Set(current.data.tags);
  if (currentTags.size === 0) return [];

  const scored = all
    .filter((p) => p.id !== current.id)
    .map((p) => {
      const shared = p.data.tags.filter((t) => currentTags.has(t)).length;
      return { post: p, shared };
    })
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
    });

  return scored.slice(0, limit).map((entry) => entry.post);
}
