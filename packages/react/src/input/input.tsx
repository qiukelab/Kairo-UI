import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * Kairo's base Input. Renders a native `<input>` styled via `.kairo-input`
 * from `@kairo-ui/theme`. All state (disabled, invalid, focus) is expressed
 * through native attributes (`disabled`, `aria-invalid`, `:focus-visible`)
 * so the CSS can key off the DOM alone.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = 'text', className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={className ? `kairo-input ${className}` : 'kairo-input'}
      {...props}
    />
  );
});

Input.displayName = 'Input';
