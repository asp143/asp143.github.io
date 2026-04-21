import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../public/logo.png');
const FAVICONS = resolve(__dirname, '../public/favicons');

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

for (const { size, name } of sizes) {
  await sharp(SRC)
    .resize(size, size, { fit: 'contain', background: { r: 253, g: 251, b: 240, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(resolve(FAVICONS, name));
  console.log(`generated ${name} (${size}x${size})`);
}
