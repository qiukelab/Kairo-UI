import { createFileRoute } from '@tanstack/react-router';
import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

/**
 * Build-time static search index — exported once during prerendering (see
 * the matching `pages` entry in `vite.config.ts`) into a plain
 * `static-search-en.json` file, then fetched client-side by
 * `oramaStaticClient` (see `src/components/search-dialog.tsx`). There is no
 * search API route at request time on this fully static/prerendered site.
 *
 * The `-en` suffix keeps the door open for a per-locale sibling
 * (`static-search-th.json`, etc.) without restructuring this route or the
 * search client.
 */
const searchServer = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

export const Route = createFileRoute('/static-search-en.json')({
  server: {
    handlers: {
      GET: async () => searchServer.staticGET(),
    },
  },
});
