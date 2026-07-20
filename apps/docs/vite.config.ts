import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import mdx from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';

// Read at build time so the version chip in the sidebar can never go stale
// against what changesets actually released. Read off disk rather than
// resolved through the package: `@kairo-ui/react` deliberately does not export
// `./package.json`, and widening its public exports map for a docs-build
// detail would be the wrong trade.
const kairoVersion: string = JSON.parse(
  readFileSync(new URL('../../packages/react/package.json', import.meta.url), 'utf8'),
).version;

/**
 * Raw-markdown endpoints backing the "Copy Markdown" / "Open in AI" buttons.
 *
 * Nothing links to these, so `crawlLinks` can never discover them — each one
 * has to be seeded explicitly. Generated from the slug list rather than typed
 * out so adding a page is a one-line change here.
 */
const COMPONENT_SLUGS = [
  'accordion',
  'alert-dialog',
  'avatar',
  'badge',
  'button',
  'card',
  'checkbox',
  'collapsible',
  'combobox',
  'context-menu',
  'dialog',
  'drawer',
  'input',
  'menu',
  'meter',
  'number-field',
  'popover',
  'progress',
  'radio-group',
  'select',
  'separator',
  'slider',
  'spinner',
  'switch',
  'tabs',
  'toast',
  'toggle-group',
  'tooltip',
] as const;

const DOC_SLUGS = [
  '',
  'theming',
  'motion',
  'components',
  ...COMPONENT_SLUGS.map((s) => `components/${s}`),
];

const RAW_MARKDOWN_PAGES = (['docs', 'th/docs'] as const).flatMap((base) =>
  DOC_SLUGS.map((slug) => ({ path: slug ? `/raw/${base}/${slug}.md` : `/raw/${base}.md` })),
);

export default defineConfig({
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        // Fully static output: every route below (plus anything discovered
        // by crawling <a> links from them, e.g. every sidebar entry under
        // `/docs`) is rendered to a static HTML/JSON file at build time —
        // there is no server runtime at request time (see wrangler.jsonc).
        enabled: true,
        crawlLinks: true,
      },
      pages: [
        // Seeded explicitly (not just relying on auto-discovery) so the
        // crawl always has a starting point even if that heuristic changes.
        { path: '/' },
        // The Thai home page is otherwise unreachable by crawling: the
        // language switcher (`fumadocs-ui`'s `LanguageSelect`) changes
        // locale via an `onClick` handler, not a real `<a href>`, so there is
        // no link anywhere for the crawler to follow. Seeding this one page
        // is enough, though — from there, `crawlLinks` discovers every
        // `/th/docs/...` page through the (real, `<a href>`-based) sidebar
        // links rendered by the Thai page tree.
        { path: '/th' },
        // Seeded explicitly for the same reason as `/` above: the header nav
        // and sidebar links to this page are the only route in, so a future
        // change to either would silently drop it from the crawl.
        { path: '/docs/components' },
        { path: '/th/docs/components' },
        // Has no `component` (server-route-only), so it is never picked up
        // by automatic static-path discovery or link crawling.
        { path: '/static-search-en.json' },
        { path: '/static-search-th.json' },
        // Prerendered as `404.html` (not `404/index.html`) so Cloudflare's
        // `not_found_handling: "404-page"` can serve it for any unmatched path.
        { path: '/404', prerender: { autoSubfolderIndex: false } },
        // LLM-facing plain-text indexes. Server-route-only, so never crawled.
        { path: '/llms.txt' },
        { path: '/llms-full.txt' },
        ...RAW_MARKDOWN_PAGES,
      ],
    }),
    viteReact(),
  ],
  define: {
    __KAIRO_VERSION__: JSON.stringify(kairoVersion),
  },
  resolve: {
    tsconfigPaths: true,
    // MDX content (compiled outside the normal .ts/.tsx resolution context
    // that `tsconfigPaths` covers) imports demo components via `@/...`, e.g.
    // `content/docs/components/tabs.mdx` importing
    // `@/components/demos/tabs-demo` — an explicit alias makes sure that
    // resolves too.
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
