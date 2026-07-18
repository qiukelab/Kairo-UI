import { createFileRoute } from '@tanstack/react-router';
import { createFromSource } from 'fumadocs-core/search/server';
import { sourceForLocale } from '@/lib/source';
import { createThaiTokenizer } from '@/lib/thai-tokenizer';

/**
 * Thai sibling of `static-search-en[.]json.ts` — same build-time static
 * index mechanism, scoped to `th` pages (translated content, or the English
 * fallback page when untranslated) via `sourceForLocale`.
 *
 * Uses a custom `Intl.Segmenter`-based tokenizer (see `lib/thai-tokenizer.ts`)
 * instead of `language: 'english'`/a built-in Orama stemmer — Thai has no
 * word delimiters and isn't one of Orama's supported stemmer languages, so
 * the default whitespace tokenizer would index each page as one giant token.
 * `search-dialog.tsx` must build its client-side db with the exact same
 * tokenizer for queries to match.
 */
const searchServer = createFromSource(sourceForLocale('th'), {
  tokenizer: createThaiTokenizer(),
});

export const Route = createFileRoute('/static-search-th.json')({
  server: {
    handlers: {
      GET: async () => searchServer.staticGET(),
    },
  },
});
