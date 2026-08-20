import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getContentFileEntries } from './scripts/lib/content-files.mjs';
import { isNoindexPath } from './src/utils/seo.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, 'src/content/blog');
const SITE_URL = 'https://ralphjonas.com';
const NOW_UPDATED = '2026-04-22';
const BUILD_DATE = new Date();

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

const blogDates = new Map();
for (const { slug, frontmatter } of getContentFileEntries(BLOG_DIR)) {
  const pub = toDate(frontmatter.pubDate);
  const updated = toDate(frontmatter.updatedDate);
  blogDates.set(`/blog/${slug}/`, updated ?? pub ?? BUILD_DATE);
}

const staticDates = new Map([
  ['/', BUILD_DATE],
  ['/blog/', BUILD_DATE],
  ['/now/', new Date(`${NOW_UPDATED}T00:00:00Z`)]
]);

function resolveLastmod(url) {
  try {
    const { pathname } = new URL(url);
    if (blogDates.has(pathname)) return blogDates.get(pathname);
    if (staticDates.has(pathname)) return staticDates.get(pathname);
  } catch {
    /* ignore */
  }
  return BUILD_DATE;
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

function rehypeTargetBlank() {
  return function transform(tree) {
    function visit(node) {
      if (node.type === 'element' && node.tagName === 'a') {
        node.properties.target = '_blank';
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child);
      }
    }

    visit(tree);
  };
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          rel: ['noopener', 'noreferrer'],
          test: isExternalHttpLink
        }
      ],
      rehypeTargetBlank
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
        return {
          ...item,
          lastmod: resolveLastmod(item.url).toISOString()
        };
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
