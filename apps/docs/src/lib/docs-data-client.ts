import type { SerializedPageTree } from 'fumadocs-core/source/client';
import type { Locale } from '@/lib/i18n';

/** Per-page metadata a docs route needs before its MDX body streams in. */
export interface DocsPageMeta {
  /** Content-relative file path, e.g. `components/button.mdx`. */
  path: string;
  title: string;
  description?: string;
}

/**
 * A locale's serialized page tree plus per-page metadata, emitted as a static
 * `docs-data-<locale>.json` file at build time (see
 * `routes/docs-data-en[.]json.ts` / `routes/docs-data-th[.]json.ts`).
 *
 * The docs route loader runs on the server during prerender (reading `source`
 * directly) but also re-runs on the client for SPA navigation — where this
 * fully static site has no server to call. Fetching this prebuilt JSON is how
 * the client half of that loader gets the same data without a request-time
 * server function (which would 404 against the static deploy).
 */
export interface DocsData {
  tree: SerializedPageTree;
  /** Keyed by the page's slug path joined with `/` (the index page is `''`). */
  pages: Record<string, DocsPageMeta>;
}

const cache = new Map<Locale, Promise<DocsData>>();

/**
 * Fetch and cache a locale's static docs-data JSON. Cached per locale so
 * navigating between pages of the same language fetches the tree only once.
 */
export function fetchDocsData(locale: Locale): Promise<DocsData> {
  let pending = cache.get(locale);
  if (!pending) {
    pending = fetch(`/docs-data-${locale}.json`).then((res) => {
      if (!res.ok) throw new Error(`docs-data-${locale}.json: ${res.status}`);
      return res.json() as Promise<DocsData>;
    });
    cache.set(locale, pending);
  }
  return pending;
}
