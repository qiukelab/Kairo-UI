import { Suspense } from 'react';
import type { Root } from 'fumadocs-core/page-tree';
// IMPORTANT: the layout and the page primitives MUST come from the same
// module. Every `fumadocs-ui/layouts/*` variant exports an identically-named
// `DocsLayout` + `DocsPage` pair, but they are not interchangeable — `DocsPage`
// reads a layout context via `useDocsLayout()`, so mixing (e.g. notebook's
// layout with `layouts/docs/page`) throws "Please use <DocsPage /> under
// <DocsLayout />" and blanks every docs page at runtime. That failure does NOT
// fail the build: prerender logs the error per page and still exits 0.
import { DocsLayout as NotebookLayout } from 'fumadocs-ui/layouts/notebook';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import browserCollections from 'collections/browser';
import { getMDXComponents } from '@/components/mdx';
import { VersionBadge } from '@/components/version-badge';
import { baseOptions, GITHUB_REPO_URL } from '@/lib/layout.shared';
import type { Locale } from '@/lib/i18n';

/**
 * URL of a page's raw markdown, backing the copy/AI buttons.
 *
 * `path` is the content-relative file path (`components/button.mdx`, or
 * `components/button.th.mdx` for a Thai page). The `/raw/...` shape is defined
 * by the route files `routes/raw.docs.$.ts` / `routes/raw.th.docs.$.ts`, and
 * every resulting URL is seeded into the prerender list in `vite.config.ts` —
 * keep those three in sync when adding pages.
 */
function rawMarkdownUrl(path: string, locale: Locale): string {
  const slug = path.replace(/\.(th\.)?mdx?$/, '');
  const base = locale === 'th' ? '/raw/th/docs' : '/raw/docs';
  return slug === 'index' ? `${base}.md` : `${base}/${slug}.md`;
}

function githubSourceUrl(path: string): string {
  return `${GITHUB_REPO_URL}/blob/main/apps/docs/content/docs/${path}`;
}

// MDX bodies are lazily code-split per page via `collections/browser` — this
// is kept out of each route's server-loader closure the same way the
// original single-locale route did, and is shared across locales since the
// browser glob covers both `*.mdx` and `*.th.mdx` files alike.
//
// NOTE: the server loader itself (`createServerFn(...).handler(...)`) is
// intentionally *not* factored out into a shared helper like this one —
// TanStack Start's compiler needs to statically find that call directly in
// the route file that uses it to split it into a server-only chunk; wrapping
// it in a cross-file factory function silently breaks that (the loader
// resolves to `undefined` at runtime instead of the handler's return value).
// See `routes/docs.$.tsx` / `routes/th.docs.$.tsx`.
/** Per-render props threaded through `useContent(path, props)`. */
interface DocsContentProps {
  markdownUrl: string;
  githubUrl: string;
}

export const docsClientLoader = browserCollections.docs.createClientLoader<DocsContentProps>({
  component({ toc, frontmatter, default: MDX }, { markdownUrl, githubUrl }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        {/* Copy-as-markdown / open-in-AI, the way better-auth's docs expose
            them. Both URLs are site-relative: the copy button fetches
            same-origin so it works today, while the AI deep-links only become
            useful once the site is deployed under a public origin. */}
        <div className="flex flex-row items-center gap-2 border-b pb-4">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
        </div>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

/**
 * Renders the deserialized `{ path, pageTree }` pair produced by
 * `useFumadocsLoader(Route.useLoaderData())` in each locale's route file —
 * called there directly (not inside this shared helper) so its generic
 * return type is resolved against each route's own concrete loader data,
 * rather than a loosely-typed generic here.
 */
export function DocsPageBody({
  path,
  pageTree,
  locale,
}: {
  path: string;
  pageTree: Root;
  locale: Locale;
}) {
  return (
    // Notebook (rather than the plain docs layout): its full-width header
    // carrying brand + nav + search, with the sidebar starting beneath it and
    // flush to the viewport edge, is the shell this site's design targets.
    <NotebookLayout
      {...baseOptions(locale)}
      tree={pageTree}
      sidebar={{ collapsible: true, banner: <VersionBadge locale={locale} /> }}
    >
      <Suspense>
        {docsClientLoader.useContent(path, {
          markdownUrl: rawMarkdownUrl(path, locale),
          githubUrl: githubSourceUrl(path),
        })}
      </Suspense>
    </NotebookLayout>
  );
}
