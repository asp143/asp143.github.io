import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getContentFileEntries } from './scripts/lib/content-files.mjs';
import { NOW_UPDATED } from './src/data/site.mjs';
import { isNoindexPath } from './src/utils/seo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, 'src/content/blog');
const PROJECTS_DIR = join(__dirname, 'src/content/projects');
const SITE_URL = 'https://ralphjonas.com';

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

const blogDates = new Map();
let newestBlogDate = null;
for (const { slug, frontmatter } of getContentFileEntries(BLOG_DIR)) {
  const pub = toDate(frontmatter.pubDate);
  if (!pub || frontmatter.draft || pub.valueOf() > Date.now()) continue;

  const updated = toDate(frontmatter.updatedDate);
  const lastmod = updated ?? pub;
  blogDates.set(`/blog/${slug}/`, lastmod);
  if (!newestBlogDate || lastmod > newestBlogDate) newestBlogDate = lastmod;
}

const projectDates = new Map();
for (const { slug, frontmatter } of getContentFileEntries(PROJECTS_DIR)) {
  if (frontmatter.draft) continue;

  const updated = toDate(frontmatter.updatedDate);
  if (updated) projectDates.set(`/projects/${slug}/`, updated);
}

const staticDates = new Map([
  ...(newestBlogDate ? [['/', newestBlogDate], ['/blog/', newestBlogDate]] : []),
  ['/now/', new Date(`${NOW_UPDATED}T00:00:00Z`)]
]);

function resolveLastmod(url) {
  try {
    const { pathname } = new URL(url);
    if (blogDates.has(pathname)) return blogDates.get(pathname);
    if (projectDates.has(pathname)) return projectDates.get(pathname);
    if (staticDates.has(pathname)) return staticDates.get(pathname);
  } catch {
    /* ignore */
  }
  return null;
}

function isExternalHttpLink(element) {
  const href = element.properties.href;
  if (typeof href !== 'string') return false;

  try {
    const url = new URL(href, SITE_URL);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname !== 'ralphjonas.com' &&
      !url.hostname.endsWith('.ralphjonas.com')
    );
  } catch {
    return false;
  }
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  redirects: {
    '/sitemap.xml': '/sitemap-index.xml',
    '/feed.xml': '/rss.xml'
  },
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener'],
          test: isExternalHttpLink
        }
      ]
    ]
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  build: {
    format: 'directory'
  },
  integrations: [
    sitemap({
      filter: (page) => !isNoindexPath(new URL(page).pathname),
      changefreq: 'monthly',
      priority: 0.7,
      serialize(item) {
        const lastmod = resolveLastmod(item.url);
        return lastmod ? { ...item, lastmod: lastmod.toISOString() } : item;
      }
    })
  ],
  server: {
    host: '0.0.0.0'
  },
  preview: {
    host: '0.0.0.0'
  }
});
