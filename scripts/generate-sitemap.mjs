// Regenerates `apps/docs/public/sitemap.xml`.
//
// Run from the repo root: `node scripts/generate-sitemap.mjs`
//
// Reads `COMPONENT_SLUGS` straight out of `apps/docs/vite.config.ts` (as
// text, not a TS import — this is a plain .mjs script) so the sitemap can
// never drift from the list that actually drives the prerendered component
// pages. The rest of the URL set is the fixed list of non-component pages
// that get prerendered (see the `pages` array in that same file): the two
// locale homes, the two docs indexes, the Theming/Motion guides (EN + the
// Thai fallback routes, both prerendered), and the two components-index pages.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const viteConfigPath = path.join(repoRoot, 'apps/docs/vite.config.ts');
const viteConfigSource = readFileSync(viteConfigPath, 'utf8');

const match = viteConfigSource.match(/const COMPONENT_SLUGS = \[([\s\S]*?)\] as const;/);
if (!match) {
  throw new Error(
    'Could not find `COMPONENT_SLUGS` in apps/docs/vite.config.ts — did it move or get renamed?',
  );
}
const COMPONENT_SLUGS = [...match[1].matchAll(/'([a-z0-9-]+)'/g)].map(([, slug]) => slug);
if (COMPONENT_SLUGS.length === 0) {
  throw new Error(
    'Parsed zero component slugs out of vite.config.ts — the regex above likely needs updating.',
  );
}

const SITE_URL = 'https://kairo-docs.quantumdevq.workers.dev';

const urls = [
  '/',
  '/th',
  '/docs',
  '/th/docs',
  '/docs/theming',
  '/th/docs/theming',
  '/docs/motion',
  '/th/docs/motion',
  '/docs/components',
  '/th/docs/components',
  ...COMPONENT_SLUGS.map((slug) => `/docs/components/${slug}`),
  ...COMPONENT_SLUGS.map((slug) => `/th/docs/components/${slug}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${SITE_URL}${url}</loc>\n  </url>`).join('\n')}
</urlset>
`;

const outPath = path.join(repoRoot, 'apps/docs/public/sitemap.xml');
writeFileSync(outPath, xml);
console.log(`Wrote ${path.relative(repoRoot, outPath)} (${urls.length} URLs)`);
