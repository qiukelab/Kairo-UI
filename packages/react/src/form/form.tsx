'use client';

import { forwardRef } from 'react';
import { Form as BaseForm } from '@base-ui/react/form';
import type { FormProps as BaseFormProps } from '@base-ui/react/form';

export interface FormProps extends BaseFormProps {}

/**
 * Kairo's Form: a native `<form>` that consolidates validation across every
 * `Field` inside it and can display validation errors handed back from a
 * server or a form action.
 *
 * Renders with `noValidate` set, so the browser's own validation-bubble UI
 * never appears — an invalid `Field` shows its message through its own
 * `FieldError` part instead, styled like the rest of the page.
 *
 * **Client-side validation** happens per `Field`, via that `Field`'s
 * `validate` function and native constraint attributes (`required`,
 * `pattern`, ...) on its control. `validationMode` decides *when* those
 * checks run for every `Field` that doesn't set its own:
 *
 * - `'onSubmit'` (default) — checked when the form is submitted; once a
 *   submit has been attempted, a field re-checks on every change so its
 *   error clears as soon as it's fixed.
 * - `'onBlur'` — checked as soon as the field loses focus.
 * - `'onChange'` — checked on every keystroke/change.
 *
 * Submitting with an invalid field cancels the submit, moves focus to the
 * first invalid field, and shows its error — neither `onSubmit` nor
 * `onFormSubmit` below fires.
 *
 * **Server-side (or otherwise external) errors** are Form's headline
 * feature: pass an `errors` object keyed by each control's `name` — typically
 * set from the response of whatever `onFormSubmit` (or your own `onSubmit`)
 * sent to a server or ran as a form action — and the matching `Field`'s
 * `FieldError` displays it automatically, no manual lookup required. A
 * `Field` also clears its own entry from `errors` the moment its value
 * changes, so a stale server error never lingers once the user starts
 * fixing it.
 *
 * Two ways to react to a valid submit, and they can be combined:
 *
 * - `onSubmit` — the plain native submit event, called after every field has
 *   validated successfully. Use this for a traditional submission (e.g. a
 *   `<form action="...">` post) that this component only gates on validity.
 * - `onFormSubmit` — called with the fields' values already collected into a
 *   plain object keyed by `name`, which additionally calls
 *   `preventDefault()` on the submit event so nothing is posted natively;
 *   use this to submit the values yourself (`fetch`, a server function, ...).
 *
 * `actionsRef` exposes a `validate(name?)` action to trigger validation
 * imperatively — every field when called with no argument, or a single named
 * one — without waiting for a submit.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { className, ...props },
  ref,
) {
  return (
    <BaseForm
      ref={ref}
      className={className ? `kairo-form ${className}` : 'kairo-form'}
      {...props}
    />
  );
});

Form.displayName = 'Form';

export type { FormValidationMode, FormActions } from '@base-ui/react/form';
