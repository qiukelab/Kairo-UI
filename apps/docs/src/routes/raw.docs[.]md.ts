import { createFileRoute } from '@tanstack/react-router';
import { source } from '@/lib/source';
import { pageToMarkdownResponse } from './-lib/raw-markdown';

/**
 * Raw markdown for the docs root page (`/docs`, empty slug) — split out
 * from `raw.docs.$.ts`'s splat since that route only ever matches under a
 * `/raw/docs/` prefix and can't also match the bare `/raw/docs.md`. Fixed
 * path, escaped the same way `static-search-en[.]json.ts` escapes a literal
 * dot in a non-splat route file name.
 */
export const Route = createFileRoute('/raw/docs.md')({
  server: {
    handlers: {
      GET: () => pageToMarkdownResponse(source.getPage([], 'en')),
    },
  },
});
