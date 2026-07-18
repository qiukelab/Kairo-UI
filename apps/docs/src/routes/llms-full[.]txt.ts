import { createFileRoute } from '@tanstack/react-router';
import { i18n } from '@/lib/i18n';
import { source } from '@/lib/source';
import { stripFrontmatter } from './-lib/raw-markdown';

/**
 * `llms-full.txt` — the full raw Markdown of every docs page, both locales,
 * concatenated. fumadocs-core's `llms()` helper (see `llms[.]txt.ts`) only
 * generates the short outline (`index()`); there is no `full()`-style export
 * in the installed `fumadocs-core@16.11.5` to build this from, so it's
 * assembled directly from `source.getPages(locale)` plus each page's
 * `getText('raw')` (see `raw.docs.$.ts` for why that's the dependable way to
 * get a page's raw source).
 *
 * Untranslated Thai pages fall back to the English `.mdx` file (see
 * `src/lib/i18n.ts`), so they intentionally appear twice here — once per
 * locale's URL — same as they do as two distinct prerendered pages.
 */
async function buildLlmsFull(): Promise<string> {
  const sections: string[] = [];
  for (const locale of i18n.languages) {
    for (const page of source.getPages(locale)) {
      const raw = await page.data.getText('raw');
      sections.push(`# ${page.data.title ?? page.url}\n\nURL: ${page.url}\n\n${stripFrontmatter(raw)}`);
    }
  }
  return sections.join('\n\n---\n\n');
}

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: async () =>
        new Response(await buildLlmsFull(), {
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        }),
    },
  },
});
