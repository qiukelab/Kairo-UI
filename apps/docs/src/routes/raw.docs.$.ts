import { createFileRoute } from '@tanstack/react-router';
import { source } from '@/lib/source';
import { pageToMarkdownResponse, slugsFromMdSplat } from './-lib/raw-markdown';

/**
 * Raw markdown for every non-root `/docs/**` page (e.g.
 * `/raw/docs/components/button.md`), backing the docs site's "Copy
 * Markdown" / "Open in AI" affordance. The docs root page itself
 * (`/raw/docs.md`) is a separate fixed-path route — see `raw.docs[.]md.ts`
 * — since it isn't reachable through this splat (there's no `/docs/`
 * prefix to splat under).
 *
 * Lives under a `/raw` prefix (not `/docs/**.md`) so it never collides with
 * `docs.$.tsx`'s own `/docs/$` route — both would otherwise be splat routes
 * on the exact same path. See `slugsFromMdSplat` for why the `.md` suffix is
 * validated/stripped in code rather than folded into the route path itself.
 *
 * The page's raw MDX source is read via `page.data.getText('raw')` — a
 * method fumadocs-mdx generates on every doc entry (see
 * `fumadocs-mdx/dist/runtime/server.js`) that reads the original file off
 * disk (`fs.readFile(info.fullPath, ...)`) at call time. That's the same
 * "read the .mdx file from disk" fallback the task describes, just exposed
 * as an official API instead of re-deriving the file path ourselves; it only
 * ever runs here at prerender time, never at request time (see
 * `vite.config.ts`: `prerender.enabled`). `page.data.content` does not
 * exist — fumadocs-core's `PageData` only carries `icon` / `title` /
 * `description` / `structuredData`.
 *
 * Not linked from any page UI (out of scope here), so `crawlLinks` cannot
 * discover these paths on its own — each concrete `/raw/docs/<slug>.md` path
 * needs its own explicit entry in `vite.config.ts`'s `pages` list.
 */
export const Route = createFileRoute('/raw/docs/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = slugsFromMdSplat(params._splat);
        if (!slugs) return new Response('Not found', { status: 404 });
        return pageToMarkdownResponse(source.getPage(slugs, 'en'));
      },
    },
  },
});
