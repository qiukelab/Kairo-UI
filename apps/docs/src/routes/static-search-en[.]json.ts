import { createFileRoute } from '@tanstack/react-router';
import { createFromSource } from 'fumadocs-core/search/server';
import { sourceForLocale } from '@/lib/source';

/**
 * Build-time static search index — exported once during prerendering (see
 * the matching `pages` entry in `vite.config.ts`) into a plain
 * `static-search-en.json` file, then fetched client-side by
 * `oramaStaticClient` (see `src/components/search-dialog.tsx`). There is no
 * search API route at request time on this fully static/prerendered site.
 *
 * Scoped to `en` via `sourceForLocale` — its Thai sibling lives at
 * `static-search-th[.]json.ts` as a separate index (not a combined
 * multi-locale export), each queried by the client based on the active
 * locale.
 */
const searchServer = createFromSource(sourceForLocale('en'), {
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
