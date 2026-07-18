import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
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
      // JSX rather than a bare string so the wordmark can carry its own type
      // scale — Fumadocs renders `nav.title` inside a `text-sm` wrapper, which
      // left the brand smaller than the sidebar links beneath it.
      title: <span className="text-lg font-semibold tracking-tight">Kairo</span>,
      url: locale === 'th' ? '/th' : '/',
      // The preset switcher used to hang here; it now lives in the nav bar
      // itself (`PresetToggleButton` in `components/nav-controls.tsx`),
      // alongside the theme, locale and GitHub controls.
      //
      // Note this whole `nav` object is only read by layouts that render
      // Fumadocs' stock header. The docs shell replaces that header wholesale
      // via `slots={{ header: DocsHeader }}`, and the landing page does not use
      // `HomeLayout` at all — `links`, `githubUrl` and `searchToggle` below are
      // still consumed by the sidebar, so the object stays.
    },
    links: navLinks(locale),
    githubUrl: GITHUB_REPO_URL,
    // Search moved into the sidebar banner (see `SidebarBanner`) — the
    // header's own trigger is turned off so it isn't offered twice.
    searchToggle: { enabled: false },
  };
}
