'use client';

import type { ComponentProps } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useNotebookLayout } from 'fumadocs-ui/layouts/notebook';
import { PanelLeft } from 'lucide-react';
import {
  GithubCap,
  LocaleToggleButton,
  NAV_TAB,
  NAV_TAB_ACTIVE,
  NAV_TAB_IDLE,
  PresetToggleButton,
  ThemeToggleButton,
} from '@/components/nav-controls';
import { HOME_COPY } from '@/lib/home-copy';
import { localeFromPathname } from '@/lib/i18n';

/**
 * Replacement for the notebook layout's own header, so the docs chrome reads
 * as the same bar as the landing page's `HomeNav`.
 *
 * Installed via `slots={{ header: DocsHeader }}` — the slot hands us the
 * layout's props, and two things from the original MUST be carried over or the
 * shell breaks:
 *
 *   - `layout:[--fd-header-height:--spacing(14)]` — the grid computes every row
 *     offset (`--fd-docs-row-2/3`, the sidebar and TOC heights) from this
 *     variable. Drop it and the sidebar and TOC size themselves against a
 *     zero-height header and overlap the content.
 *   - `slots.sidebar.trigger` — below `md` the sidebar is `hidden`, and this is
 *     the only control that opens it. Without it the docs have no navigation
 *     at all on a phone.
 *
 * The locale is read from the pathname rather than passed in: a slot is typed
 * as `FC<ComponentProps<'header'>>`, so there is nowhere to thread an extra
 * prop, and closing over one in the layout call would remount the header on
 * every render.
 */
export function DocsHeader(props: ComponentProps<'header'>) {
  const { slots } = useNotebookLayout();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = localeFromPathname(pathname);
  const copy = HOME_COPY[locale];
  const prefix = locale === 'th' ? '/th' : '';

  const links = [
    { label: copy.nav.docs, to: `${prefix}/docs`, match: (p: string) => !p.includes('/docs/') },
    {
      label: copy.nav.components,
      to: `${prefix}/docs/components/button`,
      match: (p: string) => p.includes('/docs/components/'),
    },
    {
      label: copy.nav.theming,
      to: `${prefix}/docs/theming`,
      match: (p: string) => p.endsWith('/theming'),
    },
  ];

  return (
    <header
      id="nd-subnav"
      {...props}
      // `min-w-0` is load-bearing. This header spans the main, TOC and trailing
      // gutter columns, and a grid item's automatic minimum size makes every
      // track it crosses grow to fit its min-content. The bar's tabs are
      // `whitespace-nowrap` and its end cap is fixed-width, so that minimum ran
      // to roughly 790px — the capped main column could not absorb it and the
      // trailing gutter inflated to swallow it, which starved the leading
      // gutter to zero and stopped the whole layout from centring.
      className={`sticky top-(--fd-docs-row-1) z-10 flex h-14 min-w-0 items-stretch border-b border-fd-border bg-fd-background/85 backdrop-blur-sm [grid-area:header] layout:[--fd-header-height:--spacing(14)] ${props.className ?? ''}`}
    >
      {/* Sidebar toggle. `md:hidden` mirrors the sidebar's own `max-md:hidden`
          so the control exists exactly when the sidebar is collapsed away. */}
      {slots.sidebar ? (
        <slots.sidebar.trigger
          className="flex items-center border-e border-fd-border px-4 text-fd-muted-foreground transition-colors hover:text-fd-foreground md:hidden"
          aria-label={copy.nav.overview}
        >
          <PanelLeft className="size-4" aria-hidden />
        </slots.sidebar.trigger>
      ) : null}

      {/* `min-w-0` again, one level down: the tabs are `whitespace-nowrap`, so
          without it they refuse to shrink and re-impose the same floor on the
          header that `min-w-0` above just removed. */}
      <Link
        to={prefix === '' ? '/' : '/th'}
        className={`${NAV_TAB} ${NAV_TAB_IDLE} min-w-0 flex-1`}
      >
        {copy.nav.overview}
      </Link>
      {links.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`${NAV_TAB} ${active ? NAV_TAB_ACTIVE : NAV_TAB_IDLE} min-w-0 flex-1`}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}

      <div className="flex items-stretch">
        <PresetToggleButton locale={locale} />
        <ThemeToggleButton locale={locale} />
        <LocaleToggleButton locale={locale} />
        <GithubCap locale={locale} />
      </div>
    </header>
  );
}
