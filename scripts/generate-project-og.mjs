import sharp from 'sharp';
import { readdirSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = resolve(__dirname, '../src/content/projects');
const OUT_DIR = resolve(__dirname, '../public/og/projects');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function readFrontmatter(file) {
  const src = readFileSync(file, 'utf8');
  const match = src.match(/^---([\s\S]*?)---/);
  if (!match) return {};
  const data = {};
  let listKey = null;
  for (const line of match[1].split('\n')) {
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && listKey) {
      data[listKey].push(item[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, raw] = m;
    if (raw.trim() === '') {
      data[key] = [];
      listKey = key;
    } else {
      data[key] = raw.trim().replace(/^['"]|['"]$/g, '');
      listKey = null;
    }
  }
  return data;
}

function wrapLines(title, maxChars, maxLines) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = candidate;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxChars - 1
      ? `${last.slice(0, maxChars - 1)}…`
      : `${last}…`;
  }
  return lines;
}

function buildSvg({ slug, title, stack }) {
  const safeTitle = escapeXml(title);
  const lines = wrapLines(safeTitle, 26, 3);
  const titleY = 290;
  const lineHeight = 78;
  const chips = stack.slice(0, 4).map((s) => s.toLowerCase());

  const titleTspans = lines
    .map((line, i) => {
      const cursor = i === lines.length - 1
        ? `${line}<tspan fill="#ff6a1a">_</tspan>`
        : line;
      return `<tspan x="90" y="${titleY + i * lineHeight}">${cursor}</tspan>`;
    })
    .join('');

  let chipX = 90;
  const chipSvg = chips
    .map((chip) => {
      const width = Math.max(80, chip.length * 14 + 30);
      const block = `
        <rect x="${chipX}" y="500" width="${width}" height="44" fill="#fdfbf0" stroke="#0a0a0a" stroke-width="2"/>
        <text x="${chipX + 15}" y="529" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="20" font-weight="600" fill="#0a0a0a">${escapeXml(chip)}</text>`;
      chipX += width + 14;
      return block;
    })
    .join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#f5f1dc" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="#fdfbf0"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <rect x="40" y="40" width="1120" height="550" fill="#fffdf3" stroke="#0a0a0a" stroke-width="3"/>
  <rect x="46" y="46" width="1120" height="550" fill="none" stroke="#0a0a0a" stroke-width="3" opacity="0.08"/>

  <rect x="40" y="40" width="1120" height="52" fill="#f5f1dc" stroke="#0a0a0a" stroke-width="3"/>
  <circle cx="72" cy="66" r="7" fill="#ff6a1a"/>
  <circle cx="96" cy="66" r="7" fill="#0a0a0a" fill-opacity="0.15"/>
  <circle cx="120" cy="66" r="7" fill="#0a0a0a" fill-opacity="0.15"/>
  <text x="160" y="73" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="18" font-weight="600" fill="#3a3a3a">ralph@jonas:~/projects/${escapeXml(slug)} — readme.md</text>

  <text x="90" y="180" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="22" fill="#6b6b66">
    <tspan fill="#ff6a1a" font-weight="700">$</tspan> cat readme.md
  </text>

  <text font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="64" font-weight="800" fill="#0a0a0a" letter-spacing="-2">
    ${titleTspans}
  </text>

  ${chipSvg}

  <line x1="90" y1="585" x2="1110" y2="585" stroke="#0a0a0a" stroke-width="2"/>
  <text x="90" y="568" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="20" font-weight="600" fill="#0a0a0a">ralphjonas.com/projects</text>
</svg>
`;
}

const entries = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith('.md'));
let count = 0;
for (const entry of entries) {
  const slug = entry.replace(/\.md$/, '');
  const fm = readFrontmatter(join(PROJECTS_DIR, entry));
  if (fm.draft === 'true') continue;
  const title = fm.title ?? slug;
  const stack = Array.isArray(fm.stack) ? fm.stack : [];
  const svg = buildSvg({ slug, title, stack });
  const out = join(OUT_DIR, `${slug}.png`);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  count += 1;
}

console.log(`generated ${count} project OG images → ${OUT_DIR}`);
