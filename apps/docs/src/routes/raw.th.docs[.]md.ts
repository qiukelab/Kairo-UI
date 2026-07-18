import { createFileRoute } from '@tanstack/react-router';
import { source } from '@/lib/source';
import { pageToMarkdownResponse } from './-lib/raw-markdown';

/**
 * Thai counterpart of `raw.docs[.]md.ts` — raw markdown for the Thai docs
 * root page (`/th/docs`, empty slug).
 */
export const Route = createFileRoute('/raw/th/docs.md')({
  server: {
    handlers: {
      GET: () => pageToMarkdownResponse(source.getPage([], 'th')),
    },
  },
});
