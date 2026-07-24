import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { fetchDocsData } from '@/lib/docs-data-client';
import { docsClientLoader, DocsPageBody } from '@/lib/docs-page';
import { source } from '@/lib/source';

// Deployed origin (see `apps/docs/wrangler.jsonc`'s Worker name and the
// matching constant in `routes/__root.tsx`) — the canonical link below must
// be absolute.
const SITE_URL = 'https://kairo-docs.quantumdevq.workers.dev';

// Kept as a direct, top-level `createServerFn(...).handler(...)` call (not
// factored into a shared helper) — see the note in `src/lib/docs-page.tsx`.
// This runs at prerender time; `source` (and the eager `collections/server`
// it pulls in) is stripped from the client bundle by TanStack's server-fn
// extraction. On the client we must NOT call it — a server function 404s
// against this static, Worker-less deploy — so the loader below fetches the
// prebuilt `docs-data-en.json` there instead.
const serverLoader = createServerFn({ method: 'GET' })
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs, 'en');
    if (!page) throw notFound();

    return {
      path: page.path,
      title: page.data.title,
      description: page.data.description,
      pageTree: await source.serializePageTree(source.getPageTree('en')),
    };
  });

// Client half of the loader: resolve the same `{ path, title, description,
// pageTree }` shape from the static JSON. `import.meta.env.SSR` is statically
// replaced per build, so this whole branch is dead-code-eliminated from the
// server bundle and the `serverLoader` branch from the client bundle.
async function clientLoader(slugs: string[]) {
  const data = await fetchDocsData('en');
  const meta = data.pages[slugs.join('/')];
  if (!meta) throw notFound();
  return { ...meta, pageTree: data.tree };
}

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = import.meta.env.SSR
      ? await serverLoader({ data: slugs })
      : await clientLoader(slugs);
    await docsClientLoader.preload(data.path);
    return data;
  },
  // `match.pathname` is this route's own resolved pathname — since `/docs/$`
  // is a leaf route, that's the exact current URL, used as-is for the
  // canonical link below (no need to reconstruct it from `params._splat`).
  head: ({ loaderData, match }) =>
    loaderData
      ? {
          meta: [
            { title: loaderData.title },
            ...(loaderData.description
              ? [{ name: 'description', content: loaderData.description }]
              : []),
            { property: 'og:title', content: loaderData.title },
            ...(loaderData.description
              ? [{ property: 'og:description', content: loaderData.description }]
              : []),
          ],
          links: [{ rel: 'canonical', href: `${SITE_URL}${match.pathname}` }],
        }
      : {},
});

function Page() {
  const { path, pageTree } = useFumadocsLoader(Route.useLoaderData());
  return <DocsPageBody path={path} pageTree={pageTree} locale="en" />;
}
