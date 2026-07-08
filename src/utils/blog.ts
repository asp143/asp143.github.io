import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogEntry[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

export function isNewPost(pubDate: Date, windowDays = 30): boolean {
  return Date.now() - pubDate.valueOf() < windowDays * 24 * 60 * 60 * 1000;
}

export function formatPubDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
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

export function getWordCount(body: string | undefined): number {
  if (!body) return 0;
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const words = text.match(/\b[\w'-]+\b/g);
  return words ? words.length : 0;
}

export function getReadingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 225));
}

export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getAllTags(): Promise<{ tag: string; slug: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const counts = new Map<string, { tag: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = tagToSlug(tag);
      const current = counts.get(slug);
      if (current) {
        current.count += 1;
      } else {
        counts.set(slug, { tag, count: 1 });
      }
    }
  }
  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, tag: value.tag, count: value.count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
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
