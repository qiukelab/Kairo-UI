import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import { i18n, type Locale } from '@/lib/i18n';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
});

/**
 * Presents `source` as a single-locale (non-i18n) loader, scoped to one
 * language's pages. Used to build one flat static search index per locale
 * (`static-search-en.json`, `static-search-th.json`) — `createFromSource`
 * auto-detects `source._i18n` and would otherwise always produce a single
 * *combined* multi-locale export, which the static Orama client can't filter
 * by locale (see `components/search-dialog.tsx`).
 */
export function sourceForLocale(locale: Locale): typeof source {
  return {
    ...source,
    _i18n: undefined,
    getPages: (language) => source.getPages(language ?? locale),
  };
}
