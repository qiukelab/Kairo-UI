import { forwardRef } from 'react';
import type { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Marks this label as describing a disabled control, dimming it to match.
   * Only needed for the explicit `htmlFor` wiring style — wrapping a
   * disabled control dims the label automatically, with no prop required.
   * `disabled` isn't a valid `<label>` attribute, so it's never forwarded to
   * the DOM; it's only reflected as `data-disabled`.
   * @default false
   */
  disabled?: boolean;
}

/**
 * Kairo's Label. Renders a native `<label>` styled via `.kairo-label` from
 * `@kairo-ui/theme`. Associate it with a control either explicitly, by
 * passing `htmlFor` that matches the control's `id`, or implicitly, by
 * wrapping the control so no ids are needed at all — both work with any
 * native or Kairo form control (`Input`, `Checkbox`, `Switch`, `Radio`,
 * `NumberField`, `Slider`, `Meter`, …). `Field` generates and wires matching
 * ids automatically when you'd rather not manage them yourself.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, disabled, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      data-disabled={disabled || undefined}
      className={className ? `kairo-label ${className}` : 'kairo-label'}
      {...props}
    />
  );
});

Label.displayName = 'Label';
