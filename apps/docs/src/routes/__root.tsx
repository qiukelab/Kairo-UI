import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { NotFound } from '@/components/not-found';
import { SearchDialog } from '@/components/search-dialog';
import appCss from '@/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'Kairo — Lightweight, themeable React components',
      },
      {
        name: 'description',
        content:
          "Accessible React components with a CSS-first theme system. No Tailwind required. Built for Next.js and Vite.",
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
});

function RootComponent() {
  return (
    // `attribute: 'class'` matches @kairo-ui/theme's `.dark` toggle convention (already the default, set explicitly for clarity).
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ attribute: 'class' }} search={{ SearchDialog }}>
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
