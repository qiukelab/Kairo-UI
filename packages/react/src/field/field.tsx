'use client';

import { forwardRef } from 'react';
import { Field as BaseField } from '@base-ui/react/field';
import type {
  FieldRootProps,
  FieldLabelProps,
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
} from '@base-ui/react/field';

/**
 * Kairo's Field: groups a label, a form control, a description and an error
 * message, and wires the accessibility relationships between them
 * automatically — the label's `htmlFor`/the control's `id`, the control's
 * `aria-describedby` (pointing at whichever of the description/error are
 * currently mounted) and its `aria-invalid`. All of that comes from
 * `@base-ui/react`; Kairo only supplies the `kairo-field-*` classes so
 * `@kairo-ui/theme` can style everything purely off Base UI's data
 * attributes.
 *
 * **The control doesn't have to be `FieldControl`.** Any Kairo component that
 * is itself a thin wrapper over a Base UI root — `Checkbox`, `Switch`,
 * `Select`, `NumberField`, `Slider`, `RadioGroup` — already reads this same
 * field context internally, so nesting one of those directly inside `Field`
 * wires it up with no extra work:
 *
 * ```tsx
 * <Field>
 *   <FieldLabel>Notifications</FieldLabel>
 *   <Switch />
 * </Field>
 * ```
 *
 * Kairo's plain `Input`, on the other hand, renders a bare native `<input>`
 * with no Base UI wiring of its own, so give it to `FieldControl` through the
 * `render` prop instead of nesting it directly — Base UI merges the
 * generated `id`/`aria-*`/change handlers onto whatever element `render`
 * points at:
 *
 * ```tsx
 * <Field>
 *   <FieldLabel>Email</FieldLabel>
 *   <FieldControl render={<Input type="email" />} />
 *   <FieldDescription>We'll only use this to send a receipt.</FieldDescription>
 *   <FieldError />
 * </Field>
 * ```
 *
 * Validation runs through the `validate` prop, which returns an error string
 * (or array of strings) for an invalid value and `null` otherwise; `invalid`
 * lets an external source (e.g. a server response) mark the field invalid
 * directly. `validationMode` decides when `validate` re-runs: `'onSubmit'`
 * (the default) validates when a surrounding form submits and then keeps
 * re-validating on every change, `'onBlur'` validates when the control loses
 * focus, and `'onChange'` validates on every change (optionally debounced via
 * `validationDebounceTime`).
 */
export interface FieldComponentProps extends FieldRootProps {}

export const Field = forwardRef<HTMLDivElement, FieldComponentProps>(function Field(
  { className, ...props },
  ref,
) {
  return (
    <BaseField.Root
      ref={ref}
      className={className ? `kairo-field ${className}` : 'kairo-field'}
      {...props}
    />
  );
});

Field.displayName = 'Field';

export interface FieldLabelComponentProps extends FieldLabelProps {}

/**
 * An accessible label, automatically associated with the field's control
 * (via `htmlFor`, or `aria-labelledby` when the control isn't a native
 * `<label>`-able element). Renders a `<label>` element.
 */
export const FieldLabel = forwardRef<HTMLElement, FieldLabelComponentProps>(function FieldLabel(
  { className, ...props },
  ref,
) {
  return (
    <BaseField.Label
      ref={ref}
      className={className ? `kairo-field-label ${className}` : 'kairo-field-label'}
      {...props}
    />
  );
});

FieldLabel.displayName = 'FieldLabel';

export interface FieldControlComponentProps extends FieldControlProps {}

/**
 * The form control that the field labels and validates. Renders a plain
 * `<input>`, styled to match Kairo's `Input`, so it can be used on its own —
 * but it can also stand in for any input-like element via its `render` prop
 * (see the module doc comment above for composing it with Kairo's `Input`).
 *
 * Prefer nesting `Checkbox`/`Switch`/`Select`/`NumberField`/`Slider`/
 * `RadioGroup` directly instead of wrapping them in `FieldControl` — those
 * already read the surrounding field's context on their own.
 */
export const FieldControl = forwardRef<HTMLElement, FieldControlComponentProps>(
  function FieldControl({ className, ...props }, ref) {
    return (
      <BaseField.Control
        ref={ref}
        className={className ? `kairo-field-control ${className}` : 'kairo-field-control'}
        {...props}
      />
    );
  },
);

FieldControl.displayName = 'FieldControl';

export interface FieldDescriptionComponentProps extends FieldDescriptionProps {}

/**
 * A paragraph of supporting text for the field, automatically wired into the
 * control's `aria-describedby`. Renders a `<p>` element.
 */
export const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionComponentProps>(
  function FieldDescription({ className, ...props }, ref) {
    return (
      <BaseField.Description
        ref={ref}
        className={className ? `kairo-field-description ${className}` : 'kairo-field-description'}
        {...props}
      />
    );
  },
);

FieldDescription.displayName = 'FieldDescription';

export interface FieldErrorComponentProps extends FieldErrorProps {}

/**
 * The field's error message, also wired into the control's
 * `aria-describedby`. Renders a `<div>`, but only while there is something to
 * show: by default that's whenever the field's own validity (native
 * constraint validation plus the `validate` prop) is invalid, and `match`
 * narrows that to one specific `ValidityState` key (or forces it to always
 * show with `match={true}`, handing display control to whatever manages the
 * field's `invalid` state externally).
 *
 * Renders `children` verbatim when given; otherwise falls back to the
 * validation's own error message(s), so `<FieldError />` alone is enough to
 * surface native messages (e.g. "Please fill out this field") without
 * Kairo hardcoding any text of its own.
 */
export const FieldError = forwardRef<HTMLDivElement, FieldErrorComponentProps>(function FieldError(
  { className, ...props },
  ref,
) {
  return (
    <BaseField.Error
      ref={ref}
      className={className ? `kairo-field-error ${className}` : 'kairo-field-error'}
      {...props}
    />
  );
});

FieldError.displayName = 'FieldError';

/**
 * A headless escape hatch for rendering a fully custom message from the
 * field's validity state. Takes a function `children` receiving
 * `{ validity, value, error, errors, transitionStatus, ... }` and renders
 * whatever it returns — no element or `kairo-*` class of its own, since it
 * introduces no DOM. Most fields only need `FieldError`; reach for this when
 * the error UI needs more than a plain message (e.g. per-`ValidityState`-key
 * icons).
 */
export const FieldValidity = BaseField.Validity;

export type { FieldValidityData } from '@base-ui/react/field';
