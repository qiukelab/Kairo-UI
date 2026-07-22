import { createFileRoute } from '@tanstack/react-router';
import { buildDocsData } from '@/lib/docs-data.server';

/**
 * Build-time static docs data for the `th` locale — the Thai sibling of
 * `docs-data-en[.]json.ts`. See that file for the full rationale; this one
 * backs client-side navigation of the `/th/docs/$` route.
 */
export const Route = createFileRoute('/docs-data-th.json')({
  server: {
    handlers: {
      GET: async () => Response.json(await buildDocsData('th')),
    },
  },
});
