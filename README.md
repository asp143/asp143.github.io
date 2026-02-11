# Ralph Jonas Mungcal - Astro Port

This repository now contains an Astro implementation of the original portfolio design.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deploy (GitHub Pages)

- The workflow is at `.github/workflows/deploy.yml`.
- Push to `main` or `master` to trigger deployment.
- In GitHub repo settings, set `Pages -> Source` to `GitHub Actions`.

## Project Structure

- `src/layouts/BaseLayout.astro` - global metadata/SEO and page shell
- `src/pages/index.astro` - main portfolio page
- `src/pages/404.astro` - not found page
- `src/components/SvgIcon.astro` - decorative SVG icon component
- `src/styles/global.css` - font-face + global reset/base styles
- `src/styles/home.css` - section styles and animations
- `public/` - static assets used by the Astro site

## Notes

- The original repository content was a compiled Gatsby output (not raw source files).
- The current Astro page preserves the same content, visual style, typography, and animated decorative elements.
