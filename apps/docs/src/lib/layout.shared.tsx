import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ThemePresetSwitcher } from '@/components/theme-preset-switcher';
import type { Locale } from '@/lib/i18n';

export const GITHUB_REPO_URL = 'https://github.com/qiukelab/Kairo-UI';

/**
 * Top-level header nav.
 *
 * These are plain links rather than Fumadocs' derived sidebar tabs. Tabs are
 * built from *child folders* marked `root: true`, so the loose top-level pages
 * (Installation / Theming / Motion) can never form a tab of their own — the
 * only tab that could exist was a lone "Components", which also duplicated the
 * folder already shown in the sidebar. A single tab is worse than none, and
 * foldering the guides purely to manufacture a second tab would churn every
 * `/docs/*` URL. Links give the same header row honestly.
 */
function navLinks(locale: Locale): NonNullable<BaseLayoutProps['links']> {
  const prefix = locale === 'th' ? '/th' : '';
  return [
    { text: locale === 'th' ? 'เอกสาร' : 'Docs', url: `${prefix}/docs` },
    {
      text: locale === 'th' ? 'คอมโพเนนต์' : 'Components',
      url: `${prefix}/docs/components/button`,
    },
  ];
}

export function baseOptions(locale: Locale = 'en'): BaseLayoutProps {
  return {
    nav: {
      title: 'Kairo',
      url: locale === 'th' ? '/th' : '/',
      children: <ThemePresetSwitcher />,
    },
    links: navLinks(locale),
    githubUrl: GITHUB_REPO_URL,
  };
}
