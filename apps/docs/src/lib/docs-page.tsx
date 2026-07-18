import { Suspense } from 'react';
import type { Root } from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import browserCollections from 'collections/browser';
import { getMDXComponents } from '@/components/mdx';
import { baseOptions } from '@/lib/layout.shared';

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
export const docsClientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
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
export function DocsPageBody({ path, pageTree }: { path: string; pageTree: Root }) {
  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      <Suspense>{docsClientLoader.useContent(path)}</Suspense>
    </DocsLayout>
  );
}
