import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ralphjonas.com',
  server: {
    host: '0.0.0.0'
  },
  preview: {
    host: '0.0.0.0'
  }
});
