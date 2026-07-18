import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import mdx from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';

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
        // Has no `component` (server-route-only), so it is never picked up
        // by automatic static-path discovery or link crawling.
        { path: '/static-search-en.json' },
        // Prerendered as `404.html` (not `404/index.html`) so Cloudflare's
        // `not_found_handling: "404-page"` can serve it for any unmatched path.
        { path: '/404', prerender: { autoSubfolderIndex: false } },
      ],
    }),
    viteReact(),
  ],
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
