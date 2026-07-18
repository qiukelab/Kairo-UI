import { createFileRoute } from '@tanstack/react-router';
import { source } from '@/lib/source';
import { pageToMarkdownResponse, slugsFromMdSplat } from './-lib/raw-markdown';

/**
 * Thai counterpart of `raw.docs.$.ts` — raw markdown for every non-root
 * `/th/docs/**` page. See that file for the reasoning behind the `/raw`
 * prefix and the `.md`-suffix-in-the-splat-value convention; the docs root
 * page (`/raw/th/docs.md`) is `raw.th.docs[.]md.ts`.
 *
 * Untranslated Thai pages fall back to the English `.mdx` file (see
 * `src/lib/i18n.ts`), so `source.getPage(slugs, 'th')` and thus
 * `getText('raw')` transparently return the English source for those.
 */
export const Route = createFileRoute('/raw/th/docs/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = slugsFromMdSplat(params._splat);
        if (!slugs) return new Response('Not found', { status: 404 });
        return pageToMarkdownResponse(source.getPage(slugs, 'th'));
      },
    },
  },
});
