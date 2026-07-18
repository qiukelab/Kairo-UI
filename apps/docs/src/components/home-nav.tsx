'use client';

import { Link } from '@tanstack/react-router';
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
import type { Locale } from '@/lib/i18n';

/**
 * The landing page's top bar.
 *
 * The page does not use `HomeLayout`, so this carries everything that layout's
 * header used to: section links plus the theme, locale and repository
 * controls. Keeping the layout only for its header meant GitHub appeared twice
 * — once in the header, once as the bar's end cap — and the brand was
 * duplicated against the pinned pane's own wordmark.
 *
 * The segments are plain links, not tab panels: they navigate to other pages
 * rather than swapping content in place, so real anchors keep them crawlable
 * and middle-clickable.
 */
export function HomeNav({ locale }: { locale: Locale }) {
  const copy = HOME_COPY[locale];
  const prefix = locale === 'th' ? '/th' : '';

  const links = [
    { label: copy.nav.docs, to: `${prefix}/docs` },
    { label: copy.nav.components, to: `${prefix}/docs/components/button` },
    { label: copy.nav.theming, to: `${prefix}/docs/theming` },
  ];

  return (
    <nav
      aria-label={copy.overviewLabel}
      className="sticky top-0 z-10 flex h-14 items-stretch overflow-x-auto border-b border-fd-border bg-fd-background/85 backdrop-blur-sm"
    >
      {/* Current page: no href, so it is announced as the location rather than
          offered as somewhere to go. */}
      <span aria-current="page" className={`${NAV_TAB} ${NAV_TAB_ACTIVE} flex-1`}>
        {copy.nav.overview}
      </span>
      {links.map((link) => (
        <Link key={link.to} to={link.to} className={`${NAV_TAB} ${NAV_TAB_IDLE} flex-1`}>
          {link.label}
        </Link>
      ))}

      <div className="flex items-stretch">
        <PresetToggleButton locale={locale} />
        <ThemeToggleButton locale={locale} />
        <LocaleToggleButton locale={locale} />
        <GithubCap locale={locale} />
      </div>
    </nav>
  );
}
