import { createElement } from 'react';
import { docs } from 'collections/server';
import { loader } from 'fumadocs-core/source';
import {
  AppWindow,
  Bell,
  ChevronsUpDown,
  CircleDot,
  CircleUser,
  Download,
  Gauge,
  Hash,
  Info,
  LayoutPanelTop,
  ListCollapse,
  LoaderCircle,
  Menu,
  MessageSquare,
  MousePointerClick,
  Palette,
  PanelBottom,
  Rows3,
  SeparatorHorizontal,
  SlidersHorizontal,
  Sparkles,
  SquareCheck,
  SquareMousePointer,
  SquarePercent,
  Tag,
  TextCursorInput,
  TextSearch,
  ToggleLeft,
  ToggleRight,
  TriangleAlert,
  UnfoldVertical,
} from 'lucide-react';
import { i18n, type Locale } from '@/lib/i18n';

/**
 * Sidebar icons, resolved from the `icon:` name in each page's frontmatter.
 *
 * Imported one-by-one into an explicit map rather than looked up off the
 * `lucide-react` barrel (`icons[name]`) — the dynamic form defeats
 * tree-shaking and pulls the entire icon set into the bundle.
 */
const icons = {
  AppWindow,
  Bell,
  ChevronsUpDown,
  CircleDot,
  CircleUser,
  Download,
  Gauge,
  Hash,
  Info,
  LayoutPanelTop,
  ListCollapse,
  LoaderCircle,
  Menu,
  MessageSquare,
  MousePointerClick,
  Palette,
  PanelBottom,
  Rows3,
  SeparatorHorizontal,
  SlidersHorizontal,
  Sparkles,
  SquareCheck,
  SquareMousePointer,
  SquarePercent,
  Tag,
  TextCursorInput,
  TextSearch,
  ToggleLeft,
  ToggleRight,
  TriangleAlert,
  UnfoldVertical,
} as const;

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
  icon(name) {
    if (!name) return;
    const Icon = icons[name as keyof typeof icons];
    // An unknown name renders nothing rather than throwing — a typo in
    // frontmatter should not take down the page tree.
    return Icon ? createElement(Icon) : undefined;
  },
});

/**
 * Presents `source` as a single-locale (non-i18n) loader, scoped to one
 * language's pages. Used to build one flat static search index per locale
 * (`static-search-en.json`, `static-search-th.json`) — `createFromSource`
 * auto-detects `source._i18n` and would otherwise always produce a single
 * *combined* multi-locale export, which the static Orama client can't filter
 * by locale (see `components/search-dialog.tsx`).
 */
export function sourceForLocale(locale: Locale): typeof source {
  return {
    ...source,
    _i18n: undefined,
    getPages: (language) => source.getPages(language ?? locale),
  };
}
