import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';
import { KairoLocaleProvider } from '@kairo-ui/react';
import { RootProvider } from 'fumadocs-ui/provider/tanstack';
import { NotFound } from '@/components/not-found';
import { SearchDialog } from '@/components/search-dialog';
import { fumadocsI18n } from '@/lib/fumadocs-i18n';
import { LOCALE_ITEMS, localeFromPathname, toLocalePath } from '@/lib/i18n';
import appCss from '@/styles/app.css?url';

// Deployed origin (see `apps/docs/wrangler.jsonc`'s Worker name). Used to
// build absolute URLs for OG/Twitter images and the canonical link — both
// must be absolute, not site-relative, to be understood by link-preview
// crawlers and search engines.
const SITE_URL = 'https://kairo-docs.quantumdevq.workers.dev';
const SITE_TITLE = 'Kairo — Lightweight, themeable React components';
const SITE_DESCRIPTION =
  'Accessible React components with a CSS-first theme system. No Tailwind required. Built for Next.js and Vite.';
// Resolved sRGB value of the kairo-primary token from the default ("Black")
// preset at oklch(0.205 0 0) — see packages/theme/css/tokens.css and the
// matching comment in public/favicon.svg.
const BRAND_COLOR = '#171717';

export const Route = createRootRoute({
  // `matches` is the full current-navigation match stack (root through leaf)
  // — TanStack passes the SAME array to every matched route's `head()`, so
  // `matches.at(-1)` is the leaf route's own match, giving the true current
  // pathname here too. This (rather than a fixed site-root href) is what
  // makes the canonical link below byte-identical to the one `docs.$.tsx` /
  // `th.docs.$.tsx` compute from their own `match.pathname` for the same
  // navigation — head tags are deduped by exact equality, not by `rel`, so
  // if the two didn't match verbatim, BOTH would render (two conflicting
  // canonical tags). Pages that don't set their own (home, 404, …) just get
  // this one, correctly pointed at themselves.
  head: ({ matches }) => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      { name: 'theme-color', content: BRAND_COLOR },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Kairo' },
      { property: 'og:image', content: `${SITE_URL}/og-image.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_TITLE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: `${SITE_URL}/og-image.png` },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'canonical', href: `${SITE_URL}${matches.at(-1)?.pathname ?? '/'}` },
    ],
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
            // Spreads `{ locale, translations }` (Thai UI-chrome strings —
            // search dialog, TOC, pagination, "Edit on GitHub", 404 page,
            // etc. — see `lib/fumadocs-i18n.ts`) from the defined provider,
            // then overrides `locales`/`onLocaleChange` below: the provider's
            // own `locales` derives display names from `localeTranslations`,
            // which only carries an entry for `th` (English is left on
            // Fumadocs' defaults) — `LOCALE_ITEMS` already has the right
            // name for both.
            ...fumadocsI18n.provider(locale),
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
