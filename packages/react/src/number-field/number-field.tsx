'use client';

import { forwardRef } from 'react';
import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import type {
  NumberFieldRootProps,
  NumberFieldGroupProps,
  NumberFieldInputProps,
  NumberFieldIncrementProps,
  NumberFieldDecrementProps,
} from '@base-ui/react/number-field';
import { useKairoLocale } from '../i18n/use-kairo-messages';

/**
 * Kairo's NumberField. Thin wrappers over Base UI's `NumberField.Root`/
 * `Group`/`Input`/`Increment`/`Decrement` anatomy — all interaction and
 * accessibility logic (clamping to `min`/`max`, `step`/`smallStep`/`largeStep`
 * keyboard and button stepping, locale-aware parsing/formatting of the typed
 * text via `Intl.NumberFormat`, the hidden native `<input type="number">`
 * used for form submission and native validation) comes from `@base-ui/react`.
 * Kairo only supplies the `kairo-number-field-*` classes (plus default
 * plus/minus icons on the stepper buttons) so `@kairo-ui/theme` can style
 * everything purely off Base UI's data attributes.
 *
 * Base UI's `NumberField.Input` renders a plain `<input type="text">` with
 * `aria-roledescription="Number field"` rather than `role="spinbutton"` —
 * deliberately, since the visible text is locale-formatted (e.g. `"1,234"`,
 * `"๑,๒๓๔"` in Thai digits, `"1.234,56 €"`) and the native spinbutton role
 * expects assistive tech to announce a raw numeric `aria-valuenow`, which
 * would fight the formatted text. The accessible name still comes from
 * whatever labels the input (`aria-label`, or a `<label htmlFor>`/
 * `aria-labelledby` pointing at it) same as `Input`.
 *
 * Base UI's `NumberField.Root` accepts a `locale` prop (`Intl.LocalesArgument`,
 * defaulting to the JS runtime's own locale — *not* the document's `lang`
 * attribute) that drives both parsing and formatting. This forwards the
 * nearest `KairoLocaleProvider`'s `locale` there by default, so `<NumberField>`
 * mounted under `<KairoLocaleProvider locale="th">` formats/parses with Thai
 * numbering conventions without any extra wiring; pass `locale` explicitly to
 * override.
 */
export interface NumberFieldComponentProps extends NumberFieldRootProps {}

export const NumberField = forwardRef<HTMLDivElement, NumberFieldComponentProps>(
  function NumberField({ className, locale, ...props }, ref) {
    const contextLocale = useKairoLocale();
    return (
      <BaseNumberField.Root
        ref={ref}
        locale={locale ?? contextLocale}
        className={className ? `kairo-number-field ${className}` : 'kairo-number-field'}
        {...props}
      />
    );
  },
);

NumberField.displayName = 'NumberField';

export interface NumberFieldGroupComponentProps extends NumberFieldGroupProps {}

/**
 * Groups the input with the increment/decrement buttons into a single
 * bordered control that visually matches `.kairo-input` (same min-height,
 * border and focus ring — the ring shows here, via `:focus-within`, since the
 * input inside is the only focusable part of the group).
 */
export const NumberFieldGroup = forwardRef<HTMLDivElement, NumberFieldGroupComponentProps>(
  function NumberFieldGroup({ className, ...props }, ref) {
    return (
      <BaseNumberField.Group
        ref={ref}
        className={className ? `kairo-number-field-group ${className}` : 'kairo-number-field-group'}
        {...props}
      />
    );
  },
);

NumberFieldGroup.displayName = 'NumberFieldGroup';

export interface NumberFieldInputComponentProps extends NumberFieldInputProps {}

/** The formatted, editable text input. See the module doc comment above for why this is a `textbox`, not a `spinbutton`. */
export const NumberFieldInput = forwardRef<HTMLInputElement, NumberFieldInputComponentProps>(
  function NumberFieldInput({ className, ...props }, ref) {
    return (
      <BaseNumberField.Input
        ref={ref}
        className={className ? `kairo-number-field-input ${className}` : 'kairo-number-field-input'}
        {...props}
      />
    );
  },
);

NumberFieldInput.displayName = 'NumberFieldInput';

export interface NumberFieldIncrementComponentProps extends NumberFieldIncrementProps {}

/**
 * A button that increases the value by `step` (or `smallStep`/`largeStep`
 * with Alt/Shift held). Renders a default plus icon when no `children` are
 * given.
 *
 * Base UI gives this button a built-in `aria-label="Increase"` (see
 * `useNumberFieldButton` in `@base-ui/react`) so it's accessible out of the
 * box, but that string is hardcoded English inside Base UI itself — it is
 * not read from Kairo's `KairoMessages` (`packages/react/src/i18n/messages.ts`),
 * which has no `numberField*` entry yet. Pass `aria-label` explicitly to
 * localize it (it overrides Base UI's default) until that wiring exists.
 */
export const NumberFieldIncrement = forwardRef<
  HTMLButtonElement,
  NumberFieldIncrementComponentProps
>(function NumberFieldIncrement({ className, children, ...props }, ref) {
  return (
    <BaseNumberField.Increment
      ref={ref}
      className={
        className ? `kairo-number-field-increment ${className}` : 'kairo-number-field-increment'
      }
      {...props}
    >
      {children ?? <PlusIcon />}
    </BaseNumberField.Increment>
  );
});

NumberFieldIncrement.displayName = 'NumberFieldIncrement';

export interface NumberFieldDecrementComponentProps extends NumberFieldDecrementProps {}

/**
 * A button that decreases the value by `step` (or `smallStep`/`largeStep`
 * with Alt/Shift held). Renders a default minus icon when no `children` are
 * given.
 *
 * Same built-in-but-unlocalized `aria-label="Decrease"` caveat as
 * {@link NumberFieldIncrement} — see its doc comment.
 */
export const NumberFieldDecrement = forwardRef<
  HTMLButtonElement,
  NumberFieldDecrementComponentProps
>(function NumberFieldDecrement({ className, children, ...props }, ref) {
  return (
    <BaseNumberField.Decrement
      ref={ref}
      className={
        className ? `kairo-number-field-decrement ${className}` : 'kairo-number-field-decrement'
      }
      {...props}
    >
      {children ?? <MinusIcon />}
    </BaseNumberField.Decrement>
  );
});

NumberFieldDecrement.displayName = 'NumberFieldDecrement';

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

export type {
  NumberFieldRootChangeEventReason,
  NumberFieldRootChangeEventDetails,
  NumberFieldRootCommitEventReason,
  NumberFieldRootCommitEventDetails,
} from '@base-ui/react/number-field';
