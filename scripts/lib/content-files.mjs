import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { slug as githubSlug } from 'github-slugger';

function generateContentSlug(relativePath, frontmatter) {
  if (frontmatter.slug) return frontmatter.slug;

  const extension = extname(relativePath);
  const withoutExtension = relativePath.replace(new RegExp(`${extension}$`), '');
  return withoutExtension
    .split(sep)
    .map((segment) => githubSlug(segment))
    .join('/')
    .replace(/\/index$/, '');
}

export function getContentFileEntries(contentDir) {
  return readdirSync(contentDir, { recursive: true })
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => {
      const filePath = join(contentDir, entry);
      const { frontmatter } = parseFrontmatter(readFileSync(filePath, 'utf8'));
      const relativePath = relative(contentDir, filePath);
      return {
        slug: generateContentSlug(relativePath, frontmatter),
        filePath,
        frontmatter
      };
    })
    .sort((a, b) => a.filePath.localeCompare(b.filePath));
}
