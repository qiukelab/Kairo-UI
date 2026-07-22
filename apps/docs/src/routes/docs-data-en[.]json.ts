import { createFileRoute } from '@tanstack/react-router';
import { buildDocsData } from '@/lib/docs-data.server';

/**
 * Build-time static docs data for the `en` locale — the serialized page tree
 * plus every page's `{ path, title, description }` — exported once during
 * prerendering (see the matching `pages` entry in `vite.config.ts`) into a
 * plain `docs-data-en.json` file.
 *
 * The `/docs/$` route loader reads `source` directly on the server (at
 * prerender time) but re-runs on the client for SPA navigation, where this
 * fully static site has no server to call. There it fetches this file instead
 * (see `fetchDocsData` in `lib/docs-data-client.ts`). Its Thai sibling lives
 * at `docs-data-th[.]json.ts`.
 */
export const Route = createFileRoute('/docs-data-en.json')({
  server: {
    handlers: {
      GET: async () => Response.json(await buildDocsData('en')),
    },
  },
});
