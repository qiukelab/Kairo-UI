import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style of the badge. @default 'solid' */
  variant?: 'solid' | 'soft' | 'outline';
  /** Semantic color/intent of the badge. @default 'default' */
  intent?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

/**
 * Kairo's base Badge. Renders a native `<span>` styled via `.kairo-badge`
 * from `@kairo-ui/theme`, with variant/intent expressed as `data-*`
 * attributes so the CSS (and any future non-React port) can key off the DOM
 * alone.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'solid', intent = 'default', className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-intent={intent}
      className={className ? `kairo-badge ${className}` : 'kairo-badge'}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';
