import { defineI18n } from 'fumadocs-core/i18n';

/**
 * `hideLocale: 'default-locale'` keeps English at the un-prefixed path
 * (`/docs/...`) while Thai is prefixed (`/th/docs/...`) — see
 * `src/lib/source.ts` (loader) and `src/routes/th.*.tsx` (routes).
 *
 * `parser` defaults to `'dot'`: localized content files sit *next to* their
 * English counterpart with a `.th.` suffix (`index.th.mdx`, `meta.th.json`)
 * instead of a parallel `th/` directory. Verified against
 * `fumadocs-core`'s loader source: each locale's virtual filesystem is built
 * by inheriting the default-language one and only overwriting entries that
 * have a translation — so untranslated pages automatically fall back to the
 * English file/content, at both the page-tree and MDX-body level.
 */
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'th'],
  hideLocale: 'default-locale',
});

export type Locale = (typeof i18n)['languages'][number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
};

/** Shape expected by `RootProvider`'s `i18n.locales` (see `routes/__root.tsx`). */
export const LOCALE_ITEMS = i18n.languages.map((locale) => ({
  locale,
  name: LOCALE_NAMES[locale],
}));

/** Thai is the only prefixed locale (see `hideLocale: 'default-locale'` above). */
export function localeFromPathname(pathname: string): Locale {
  return pathname === '/th' || pathname.startsWith('/th/') ? 'th' : 'en';
}

/** Mirror the current path into another locale, adding/removing the `/th` prefix. */
export function toLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'th') segments.shift();
  if (target === 'th') segments.unshift('th');
  return `/${segments.join('/')}`;
}
