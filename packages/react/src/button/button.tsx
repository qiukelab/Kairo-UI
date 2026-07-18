import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. @default 'solid' */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Size of the button. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kairo's base Button. Renders a native `<button>` styled via `.kairo-btn`
 * from `@kairo-ui/theme`, with variant/size expressed as `data-*` attributes
 * so the CSS (and any future non-React port) can key off the DOM alone.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', size = 'md', type = 'button', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      data-size={size}
      className={className ? `kairo-btn ${className}` : 'kairo-btn'}
      {...props}
    />
  );
});

Button.displayName = 'Button';
