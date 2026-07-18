/**
 * The strings Kairo renders internally (e.g. the Toast dismiss button's
 * `aria-label`, Spinner's default `aria-label`). Deliberately has no React
 * import and no `'use client'` directive so server components — including
 * {@link import('../spinner/spinner').Spinner}, which must stay renderable
 * with zero client-side JS — can read {@link defaultMessages} directly.
 */
export interface KairoMessages {
  /** Spinner's default accessible name. @default 'Loading' */
  spinnerLabel: string;
  /** The Toast dismiss button's default accessible name. @default 'Dismiss notification' */
  toastDismissLabel: string;
}

/** The English strings Kairo falls back to when no {@link KairoMessages} override is available. */
export const defaultMessages: KairoMessages = {
  spinnerLabel: 'Loading',
  toastDismissLabel: 'Dismiss notification',
};
