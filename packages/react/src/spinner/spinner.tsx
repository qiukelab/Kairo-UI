import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { defaultMessages } from '../i18n/messages';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kairo's base Spinner. Renders a `<span role="status">` styled via
 * `.kairo-spinner` from `@kairo-ui/theme` — a spinning ring built from a
 * `currentColor` border with a transparent top segment, so it always
 * matches the surrounding text color. Carries no visible text; the loading
 * state is only announced via `aria-label` (defaults to
 * {@link defaultMessages}'s `spinnerLabel`, `'Loading'`, but can be
 * overridden for context, e.g. `aria-label="Loading results"`).
 *
 * Deliberately stays a Server Component: it reads its default label straight
 * from the React-free `messages.ts` module instead of `KairoLocaleProvider`'s
 * context, so it renders with zero client-side JS. Consumers localising it
 * from a Server Component should pass `aria-label` explicitly.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', className, 'aria-label': ariaLabel = defaultMessages.spinnerLabel, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      data-size={size}
      className={className ? `kairo-spinner ${className}` : 'kairo-spinner'}
      {...props}
    />
  );
});

Spinner.displayName = 'Spinner';
