'use client';

import { useEffect, useState } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link, useRouterState } from '@tanstack/react-router';
import { baseOptions } from '@/lib/layout.shared';
import { localeFromPathname } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

interface NotFoundCopy {
  eyebrow: string;
  heading: string;
  description: string;
  homeCta: string;
  docsCta: string;
}

/**
 * `/docs/$` (en) or `/th/docs/$` (th) with an empty splat — the docs root has
 * no route of its own (see `routes/docs.$.tsx`), same construction as
 * `docsLink` in `components/home-page.tsx`.
 */
function docsHome(locale: Locale) {
  return locale === 'th'
    ? ({ to: '/th/docs/$', params: { _splat: '' } } as const)
    : ({ to: '/docs/$', params: { _splat: '' } } as const);
}

const NOT_FOUND_COPY: Record<Locale, NotFoundCopy> = {
  en: {
    eyebrow: '404',
    heading: 'Page not found',
    description:
      "The page you're looking for doesn't exist, moved, or was renamed. Check the URL, or pick up from one of these.",
    homeCta: 'Back to home',
    docsCta: 'Browse the docs',
  },
  th: {
    eyebrow: '404',
    heading: 'ไม่พบหน้านี้',
    description: 'หน้าที่คุณกำลังมองหาอาจถูกลบ ย้าย หรือเปลี่ยนชื่อไปแล้ว ลองตรวจสอบลิงก์อีกครั้ง หรือเริ่มต้นใหม่จากที่นี่',
    homeCta: 'กลับหน้าแรก',
    docsCta: 'ดูเอกสารทั้งหมด',
  },
};

/**
 * The router's `notFoundComponent` *and* the prerendered `/404` route (see
 * `routes/404.tsx`, which renders this directly so Cloudflare's
 * `not_found_handling: "404-page"` has a static `404.html` to serve).
 *
 * Locale is read from the current pathname rather than passed in as a prop —
 * a `notFoundComponent` is mounted by the router itself, not a page route, so
 * there is no loader data to thread a locale through. The prerendered `/404`
 * path itself has no `/th` prefix, so it (correctly) renders English; a
 * runtime 404 hit under `/th/...` re-renders this in Thai once
 * `useRouterState` reports the real location.
 */
export function NotFound() {
  // The static `404.html` is prerendered ONCE, in English (its prerender path
  // is `/404`, which `localeFromPathname` reads as `en`). On a fresh load at a
  // bad URL, Cloudflare's `not_found_handling` serves those same English bytes
  // under the original path — so the FIRST client paint must also be English,
  // or React tears down the tree with a hydration mismatch. `mounted` gates the
  // locale switch to after hydration: English on the first commit (matching the
  // prerender), then the real locale from the URL — Thai under `/th/...` — on
  // the next. A client-side navigation into a 404 was already correct; this
  // only fixes the cold-load-at-a-bad-Thai-URL case.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale: Locale = mounted ? localeFromPathname(pathname) : 'en';
  const copy = NOT_FOUND_COPY[locale];
  const homeTo = locale === 'th' ? '/th' : '/';

  return (
    <HomeLayout {...baseOptions(locale)}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
        <span className="text-6xl font-bold text-fd-muted-foreground">{copy.eyebrow}</span>
        <h1 className="text-2xl font-semibold text-fd-foreground">{copy.heading}</h1>
        <p className="max-w-md text-fd-muted-foreground">{copy.description}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link to={homeTo} className="kairo-btn" data-variant="solid" data-size="lg">
            {copy.homeCta}
          </Link>
          <Link {...docsHome(locale)} className="kairo-btn" data-variant="outline" data-size="lg">
            {copy.docsCta}
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}
