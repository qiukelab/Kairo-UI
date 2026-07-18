/**
 * Shared by the raw-markdown routes (`raw.docs*.ts` / `raw.th.docs*.ts`) and
 * `llms-full[.]txt.ts`. Lives in a `-`-prefixed directory so TanStack
 * Router's file-based route generator ignores it entirely (default
 * `routeFileIgnorePrefix: '-'`, left unset — so the default applies — in
 * this app's `tanstackStart()` config) — this is a plain helper module, not
 * a route.
 */

// Matches a leading YAML frontmatter block (`--- ... ---`) as written by
// every `content/docs/**/*.mdx` file in this repo (delimiters on their own
// line, immediately at the top of the file).
const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

/**
 * Strips a leading YAML frontmatter block from raw MDX source, keeping the
 * Markdown body intact. Also trims the blank line frontmatter conventionally
 * leaves behind, so the returned text starts directly at the first line of
 * real content.
 */
export function stripFrontmatter(raw: string): string {
  return raw.replace(FRONTMATTER_RE, '').trimStart();
}

/**
 * A loaded fumadocs page, narrowed to just the bit these routes need
 * (`getText` — see the `raw.docs.$.ts` doc comment for what it does and why
 * it's used over reading the filesystem directly).
 */
interface MarkdownPage {
  data: { getText: (type: 'raw' | 'processed') => Promise<string> };
}

/**
 * Turns a loaded page into the `text/markdown` response every raw-markdown
 * route serves, or a 404 `Response` if the page lookup came back empty.
 */
export async function pageToMarkdownResponse(page: MarkdownPage | undefined): Promise<Response> {
  if (!page) return new Response('Not found', { status: 404 });

  const raw = await page.data.getText('raw');
  return new Response(stripFrontmatter(raw), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
}

/**
 * Recovers the page's slug segments from a `$` splat value, e.g.
 * `"components/button.md"` -> `["components", "button"]`.
 *
 * Requires (and strips) a trailing `.md` rather than baking it into the
 * route path pattern itself: TanStack Router's flat-file convention uses
 * dots as path *separators*, so a literal `.md` suffix attached directly to
 * a `$` splat segment can't be expressed by the file name the same way
 * `static-search-en[.]json.ts` escapes a literal dot in a fixed (non-splat)
 * path. Checking/stripping it here instead keeps the route path itself a
 * plain, unambiguous splat (`/raw/docs/$`) while still requiring `.md` on
 * every URL this app actually serves — which also gives every prerendered
 * output file a real `.md` extension, so static hosting (no runtime here to
 * honor a `Content-Type` response header — see `wrangler.jsonc`) infers the
 * right content type from the extension alone.
 *
 * A trailing slash (`"components/button.md/"`) is tolerated and stripped
 * before the `.md` check — unlike a fixed route, TanStack Router doesn't
 * redirect a splat's trailing slash away on its own (the slash is captured
 * as literal splat content), and the prerenderer's own crawler always
 * requests every page with a trailing slash appended first (see
 * `@tanstack/start-plugin-core`'s `withTrailingSlash(...)` in its
 * `prerender.js`), so without this the prerender build fails outright.
 *
 * Returns `undefined` if the splat is missing or doesn't end in `.md`.
 */
export function slugsFromMdSplat(splat: string | undefined): string[] | undefined {
  const trimmed = splat?.replace(/\/$/, '');
  if (!trimmed?.endsWith('.md')) return undefined;
  return trimmed.slice(0, -'.md'.length).split('/');
}
