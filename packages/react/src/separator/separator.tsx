import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Axis the separator divides content along. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether the separator is purely visual — e.g. a thin rule between menu
   * items — rather than a meaningful boundary between sections of content.
   * Decorative separators are hidden from the accessibility tree instead of
   * exposing `role="separator"`.
   * @default false
   */
  decorative?: boolean;
}

/**
 * Kairo's base Separator. Renders a native `<div>` styled via
 * `.kairo-separator` from `@kairo-ui/theme`, with orientation expressed as a
 * `data-*` attribute so the CSS (and any future non-React port) can key off
 * the DOM alone.
 *
 * Deliberately not a wrapper over `@base-ui/react/separator`: this component
 * has zero interaction, and every Base UI primitive is itself a client
 * component, so wrapping one here would drag a client boundary into RSC
 * trees for nothing. Per Kairo's rule — no interaction, no client boundary —
 * this stays a plain, RSC-safe component.
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={decorative ? undefined : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative ? true : undefined}
      data-orientation={orientation}
      className={className ? `kairo-separator ${className}` : 'kairo-separator'}
      {...props}
    />
  );
});

Separator.displayName = 'Separator';
