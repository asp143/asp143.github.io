import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../utils/blog';

export const prerender = true;

function markdownText(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/([\\[\]])/g, '\\$1')
    .trim();
}

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('Astro site URL is required to generate llms.txt');

  const posts = await getPublishedPosts();
  const projects = (await getCollection('projects', ({ data }) => !data.draft))
    .sort((a, b) => a.data.order - b.data.order);

  const blogLinks = posts.map(
    (post) =>
      `- [${markdownText(post.data.title)}](${new URL(`/blog/${post.id}/`, context.site)}): ${markdownText(post.data.description)}`
  );
  const projectLinks = projects.map(
    (project) =>
      `- [${markdownText(project.data.title)}](${new URL(`/projects/${project.id}/`, context.site)}): ${markdownText(project.data.description)}`
  );

  const markdown = [
    '# Ralph Jonas Mungcal\n\n> Portfolio, writing, and projects by Ralph Jonas Mungcal, a full-stack developer and AI integration specialist.',
    `## Blog\n${blogLinks.join('\n')}`,
    `## Projects\n${projectLinks.join('\n')}`
  ].join('\n\n');

  return new Response(`${markdown}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  });
}
