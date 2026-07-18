'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { Languages, Moon, Palette, Sun } from 'lucide-react';
import { themes } from '@kairo-ui/theme';
import { HOME_COPY, PRESET_NAMES } from '@/lib/home-copy';
import { toLocalePath, type Locale } from '@/lib/i18n';
import { GITHUB_REPO_URL } from '@/lib/layout.shared';
import { usePreset } from '@/lib/use-preset';

/**
 * Shared chrome for the landing page's nav bar and the docs header, so the two
 * stay identical by construction rather than by two sets of copied classes
 * drifting apart.
 *
 * Labels come from `HOME_COPY[locale].nav` — it is the only place these strings
 * are translated, and duplicating them for the docs header would just create a
 * second thing to keep in sync.
 */

/** One segment of the nav bar. Callers add `flex-1` and the active colours. */
export const NAV_TAB =
  'flex items-center justify-center border-b-2 px-5 text-xs font-medium tracking-widest whitespace-nowrap uppercase transition-colors';

export const NAV_TAB_IDLE = 'border-transparent text-fd-muted-foreground hover:text-fd-foreground';
export const NAV_TAB_ACTIVE = 'border-fd-primary text-fd-foreground';

/**
 * Icon buttons sit shoulder to shoulder with only a hairline between them, so
 * horizontal padding is the only thing separating one target from the next —
 * `px-3` left them reading as a single cramped cluster and put the tap targets
 * under the 44px comfortable minimum.
 */
export const NAV_ICON_BUTTON =
  'flex min-w-11 items-center justify-center border-s border-fd-border px-4 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground';

/**
 * GitHub's mark, inlined — `lucide-react` v1 dropped its brand icons, so there
 * is no `Github` export to import any more.
 */
export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function ThemeToggleButton({ locale }: { locale: Locale }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={HOME_COPY[locale].nav.toggleTheme}
      className={NAV_ICON_BUTTON}
    >
      {/* `resolvedTheme` is undefined until next-themes hydrates; rendering the
          sun until then keeps server and client markup identical. */}
      {resolvedTheme === 'dark' ? (
        <Moon className="size-4.5" aria-hidden />
      ) : (
        <Sun className="size-4.5" aria-hidden />
      )}
    </button>
  );
}

export function LocaleToggleButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const next: Locale = locale === 'th' ? 'en' : 'th';
  return (
    <button
      type="button"
      onClick={() => router.navigate({ href: toLocalePath(router.state.location.pathname, next) })}
      aria-label={HOME_COPY[locale].nav.toggleLocale}
      className={NAV_ICON_BUTTON}
    >
      <Languages className="size-4.5" aria-hidden />
    </button>
  );
}

/**
 * Theme-preset picker, as a menu button in the nav bar.
 *
 * It used to float in the bottom-right corner; folding it into the bar puts
 * every appearance control in one place instead of two, and stops it covering
 * page content.
 *
 * Every entry is named in text, not identified by colour alone: a bare swatch
 * is unreadable with a colour-vision deficiency, and "the pink one" is not a
 * name a user can act on.
 */
export function PresetToggleButton({ locale }: { locale: Locale }) {
  const { active, choose } = usePreset();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const copy = HOME_COPY[locale];

  // The panel overlays the page, so it dismisses like a popover: Escape, or a
  // click anywhere outside it.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  function select(id: string) {
    choose(id);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex items-stretch">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={copy.nav.togglePreset}
        onClick={() => setOpen((value) => !value)}
        className={NAV_ICON_BUTTON}
      >
        <Palette className="size-4.5" aria-hidden />
      </button>

      {open ? (
        <div
          role="radiogroup"
          aria-label={copy.nav.togglePreset}
          className="absolute end-0 top-full z-50 flex w-44 flex-col border border-fd-border bg-fd-popover p-1 shadow-lg"
        >
          {themes.map((preset) => {
            const selected = active === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => select(preset.id)}
                className={`flex items-center gap-2 p-2 text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground ${
                  selected ? 'bg-fd-accent text-fd-accent-foreground' : 'text-fd-foreground'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 border border-fd-border"
                  style={{ backgroundColor: preset.swatch }}
                />
                <span>{PRESET_NAMES[locale][preset.id] ?? preset.label}</span>
                {/* A checkmark, not just the highlight: `aria-checked` covers
                    assistive tech, but a sighted user comparing tinted rows
                    needs a non-colour cue too. */}
                <span aria-hidden="true" className="ms-auto text-xs">
                  {selected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** The bar's emphasised end cap. */
export function GithubCap({ locale }: { locale: Locale }) {
  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={HOME_COPY[locale].nav.github}
      className="flex items-center gap-2.5 bg-fd-foreground px-6 text-xs font-medium tracking-widest whitespace-nowrap text-fd-background uppercase"
    >
      <GithubMark className="size-4.5" />
      <span className="max-sm:sr-only">{HOME_COPY[locale].nav.github}</span>
    </a>
  );
}
