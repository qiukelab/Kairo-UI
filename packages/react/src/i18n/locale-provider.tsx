'use client';

import { createContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { defaultMessages } from './messages';
import type { KairoMessages } from './messages';

/** @internal */
export interface KairoLocaleContextValue {
  locale: string | undefined;
  messages: KairoMessages;
}

/** @internal Not exported from the package — read via {@link useKairoMessages}/{@link useKairoLocale}. */
export const KairoLocaleContext = createContext<KairoLocaleContextValue | undefined>(undefined);

export interface KairoLocaleProviderProps {
  /**
   * A BCP 47 language tag (e.g. `'th'`) forwarded as the `lang` attribute
   * onto the popup element of every portalled Kairo popup (Dialog, Tooltip,
   * Popover, Select, Toast) rendered beneath this provider — Base UI portals
   * those elements to `document.body`, outside any `lang` set further up the
   * tree, so CSS `:lang()` typography rules can't otherwise reach them.
   * Omit to render no `lang` attribute at all.
   */
  locale?: string;
  /** Overrides merged over {@link defaultMessages} for components rendered beneath this provider. */
  messages?: Partial<KairoMessages>;
  children: ReactNode;
}

/**
 * Supplies a locale and/or localised strings to every Kairo component
 * rendered beneath it. Mount once near the root of a localised subtree (or
 * the whole app):
 *
 * ```tsx
 * <KairoLocaleProvider locale="th" messages={{ toastDismissLabel: 'ปิดการแจ้งเตือน' }}>
 *   <App />
 * </KairoLocaleProvider>
 * ```
 *
 * Components read this via {@link useKairoMessages}/{@link useKairoLocale},
 * which fall back to {@link defaultMessages}/`undefined` respectively when no
 * provider is mounted — this provider is optional, not required.
 */
export function KairoLocaleProvider({ locale, messages, children }: KairoLocaleProviderProps) {
  const value = useMemo<KairoLocaleContextValue>(
    () => ({
      locale,
      messages: { ...defaultMessages, ...messages },
    }),
    [locale, messages],
  );

  return <KairoLocaleContext.Provider value={value}>{children}</KairoLocaleContext.Provider>;
}

KairoLocaleProvider.displayName = 'KairoLocaleProvider';
