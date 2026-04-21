import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, 'src/content/blog');
const NOW_UPDATED = '2026-04-22';
const BUILD_DATE = new Date();

function readFrontmatterDate(file, key) {
  const src = readFileSync(file, 'utf8');
  const fm = src.match(/^---([\s\S]*?)---/);
  if (!fm) return null;
  const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = fm[1].match(re);
  if (!match) return null;
  const raw = match[1].trim().replace(/^['"]|['"]$/g, '');
  const date = new Date(raw);
  return Number.isNaN(date.valueOf()) ? null : date;
}

const blogDates = new Map();
for (const entry of readdirSync(BLOG_DIR)) {
  if (!entry.endsWith('.md')) continue;
  const slug = entry.replace(/\.md$/, '');
  const full = join(BLOG_DIR, entry);
  const pub = readFrontmatterDate(full, 'pubDate');
  const updated = readFrontmatterDate(full, 'updatedDate');
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

export default defineConfig({
  site: 'https://ralphjonas.com',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [
    sitemap({
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
