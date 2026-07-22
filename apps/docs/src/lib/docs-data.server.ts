import type { DocsData, DocsPageMeta } from '@/lib/docs-data-client';
import type { Locale } from '@/lib/i18n';
import { source } from '@/lib/source';

/**
 * Build a locale's {@link DocsData} straight from `source`. Server-only: it
 * pulls in `collections/server` (the eager, whole-corpus collection), so it
 * must never reach the client bundle — it is imported exclusively by the
 * `docs-data-<locale>.json` server routes, which prerender it to a static
 * file. The client reads that file via `fetchDocsData` instead.
 */
export async function buildDocsData(locale: Locale): Promise<DocsData> {
  const pages: Record<string, DocsPageMeta> = {};
  for (const page of source.getPages(locale)) {
    pages[page.slugs.join('/')] = {
      path: page.path,
      title: page.data.title,
      description: page.data.description,
    };
  }

  return {
    tree: await source.serializePageTree(source.getPageTree(locale)),
    pages,
  };
}
