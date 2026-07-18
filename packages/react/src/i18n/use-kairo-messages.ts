'use client';

import { useContext } from 'react';
import { KairoLocaleContext } from './locale-provider';
import { defaultMessages } from './messages';
import type { KairoMessages } from './messages';

/**
 * Returns the localised messages supplied by the nearest {@link KairoLocaleProvider},
 * merged over {@link defaultMessages}. Falls back to {@link defaultMessages} entirely
 * when no provider is mounted, so components using this hook keep working unwrapped.
 */
export function useKairoMessages(): KairoMessages {
  const context = useContext(KairoLocaleContext);
  return context ? context.messages : defaultMessages;
}

/**
 * Returns the locale (e.g. `'th'`) supplied to the nearest {@link KairoLocaleProvider},
 * or `undefined` when no provider is mounted or no `locale` was given.
 */
export function useKairoLocale(): string | undefined {
  const context = useContext(KairoLocaleContext);
  return context?.locale;
}
