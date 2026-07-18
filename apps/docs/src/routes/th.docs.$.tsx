import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { docsClientLoader, DocsPageBody } from '@/lib/docs-page';
import { source } from '@/lib/source';

// Kept as a direct, top-level `createServerFn(...).handler(...)` call (not
// factored into a shared helper) — see the note in `src/lib/docs-page.tsx`.
const serverLoader = createServerFn({ method: 'GET' })
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs, 'th');
    if (!page) throw notFound();

    return {
      path: page.path,
      title: page.data.title,
      description: page.data.description,
      pageTree: await source.serializePageTree(source.getPageTree('th')),
    };
  });

export const Route = createFileRoute('/th/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await docsClientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: loaderData.title },
            ...(loaderData.description ? [{ name: 'description', content: loaderData.description }] : []),
          ],
        }
      : {},
});

function Page() {
  const { path, pageTree } = useFumadocsLoader(Route.useLoaderData());
  return <DocsPageBody path={path} pageTree={pageTree} />;
}
