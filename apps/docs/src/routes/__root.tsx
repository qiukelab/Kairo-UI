import { createRootRoute, HeadContent, Outlet, Scripts, useRouter, useRouterState } from '@tanstack/react-router';
import { KairoLocaleProvider } from '@kairo-ui/react';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { NotFound } from '@/components/not-found';
import { SearchDialog } from '@/components/search-dialog';
import { LOCALE_ITEMS, localeFromPathname, toLocalePath } from '@/lib/i18n';
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
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPathname(pathname);

  return (
    // `attribute: 'class'` matches @kairo-ui/theme's `.dark` toggle convention (already the default, set explicitly for clarity).
    // `lang` reflects the active locale — `@kairo-ui/theme`'s `:lang(th)` typography rules only apply when this is set correctly.
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{ attribute: 'class' }}
          search={{ SearchDialog }}
          i18n={{
            locale,
            locales: LOCALE_ITEMS,
            // Fumadocs' own default redirect assumes every locale (including
            // the default one) is always prefixed, which doesn't hold here
            // (`hideLocale: 'default-locale'`, see `lib/i18n.ts`) — so it's
            // overridden to mirror the current path into the target locale.
            onLocaleChange: (target) => {
              router.navigate({ href: toLocalePath(pathname, target as 'en' | 'th') });
            },
          }}
        >
          {/*
            `<html lang>` above is not enough for Kairo's popups: Base UI
            portals them to `document.body`, so they sit outside this tree and
            `:lang(th)` typography rules never reach them. This provider is what
            stamps `lang` onto each portalled popup element itself. Dropping it
            regresses silently — the pages still look right, only the portalled
            Thai text loses its typography.
          */}
          <KairoLocaleProvider locale={locale}>
            <Outlet />
          </KairoLocaleProvider>
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
