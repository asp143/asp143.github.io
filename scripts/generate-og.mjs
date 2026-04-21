import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/og.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#f5f1dc" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="#fdfbf0"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- card border -->
  <rect x="40" y="40" width="1120" height="550" fill="#fffdf3" stroke="#0a0a0a" stroke-width="3"/>
  <!-- hard shadow -->
  <rect x="46" y="46" width="1120" height="550" fill="none" stroke="#0a0a0a" stroke-width="3" opacity="0.08"/>

  <!-- shell bar -->
  <rect x="40" y="40" width="1120" height="52" fill="#f5f1dc" stroke="#0a0a0a" stroke-width="3"/>
  <circle cx="72" cy="66" r="7" fill="#ff6a1a"/>
  <circle cx="96" cy="66" r="7" fill="#0a0a0a" fill-opacity="0.15"/>
  <circle cx="120" cy="66" r="7" fill="#0a0a0a" fill-opacity="0.15"/>
  <text x="160" y="73" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="18" font-weight="600" fill="#3a3a3a">ralph@jonas:~ — portfolio.sh</text>

  <!-- prompt line -->
  <text x="90" y="180" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="24" fill="#6b6b66">
    <tspan fill="#ff6a1a" font-weight="700">$</tspan> whoami <tspan fill="#6b6b66">--verbose</tspan>
  </text>

  <!-- name -->
  <text x="90" y="300" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="108" font-weight="800" fill="#0a0a0a" letter-spacing="-4">Ralph Jonas<tspan fill="#ff6a1a">_</tspan></text>

  <!-- title -->
  <text x="90" y="370" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="28" font-weight="600" fill="#3a3a3a">full-stack developer &amp; ai integration specialist</text>

  <!-- tags -->
  <g font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="20" font-weight="600">
    <rect x="90" y="420" width="130" height="44" fill="#fdfbf0" stroke="#0a0a0a" stroke-width="2"/>
    <text x="105" y="449" fill="#0a0a0a">#typescript</text>

    <rect x="235" y="420" width="90" height="44" fill="#fdfbf0" stroke="#0a0a0a" stroke-width="2"/>
    <text x="250" y="449" fill="#0a0a0a">#node</text>

    <rect x="340" y="420" width="80" height="44" fill="#fdfbf0" stroke="#0a0a0a" stroke-width="2"/>
    <text x="355" y="449" fill="#0a0a0a">#gcp</text>

    <rect x="435" y="420" width="70" height="44" fill="#ff6a1a" stroke="#0a0a0a" stroke-width="2"/>
    <text x="450" y="449" fill="#0a0a0a">#ai</text>

    <rect x="520" y="420" width="100" height="44" fill="#fdfbf0" stroke="#0a0a0a" stroke-width="2"/>
    <text x="535" y="449" fill="#0a0a0a">#linux</text>
  </g>

  <!-- url footer -->
  <line x1="90" y1="520" x2="1110" y2="520" stroke="#0a0a0a" stroke-width="2"/>
  <text x="90" y="560" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="22" font-weight="600" fill="#0a0a0a">ralphjonas.com</text>
  <text x="1110" y="560" text-anchor="end" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="20" fill="#6b6b66">[philippines]</text>
</svg>
`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`og.png written to ${OUT}`);
