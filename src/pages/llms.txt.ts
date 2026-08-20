import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const prerender = true;

const SITE_URL = 'https://ralphjonas.com';

function markdownText(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/([\\[\]])/g, '\\$1')
    .trim();
}

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const projects = (await getCollection('projects', ({ data }) => !data.draft))
    .sort((a, b) => a.data.order - b.data.order);

  const blogLinks = posts.map(
    (post) =>
      `- [${markdownText(post.data.title)}](${SITE_URL}/blog/${post.id}/): ${markdownText(post.data.description)}`
  );
  const projectLinks = projects.map(
    (project) =>
      `- [${markdownText(project.data.title)}](${SITE_URL}/projects/${project.id}/): ${markdownText(project.data.description)}`
  );

  const markdown = [
    '# Ralph Jonas Mungcal',
    '> Portfolio, writing, and projects by Ralph Jonas Mungcal, a full-stack developer and AI integration specialist.',
    '## Blog',
    ...blogLinks,
    '## Projects',
    ...projectLinks
  ].join('\n\n');

  return new Response(`${markdown}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  });
};
