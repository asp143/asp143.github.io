import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../utils/blog';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: 'Ralph Jonas Mungcal — Writing',
    description:
      'Notes on software engineering, AI integration, career, and craft by Ralph Jonas Mungcal.',
    site: context.site ?? 'https://ralphjonas.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags
    })),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData:
      '<language>en</language><atom:link href="https://ralphjonas.com/rss.xml" rel="self" type="application/rss+xml"/>'
  });
}
