'use client';

import { forwardRef } from 'react';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import type { RadioGroupProps as BaseRadioGroupProps } from '@base-ui/react/radio-group';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import type { RadioRootProps } from '@base-ui/react/radio';

export interface RadioGroupProps<Value = unknown> extends BaseRadioGroupProps<Value> {}

/**
 * Kairo's RadioGroup. A thin wrapper over Base UI's `RadioGroup` — all
 * interaction and accessibility logic (`role="radiogroup"`, arrow-key roving
 * focus *and* selection between the radios it contains, controlled/
 * uncontrolled `value`, a hidden `<input type="radio">` per item for form
 * submission) comes from `@base-ui/react`. Kairo only supplies the
 * `.kairo-radio-group` class so `@kairo-ui/theme` can lay out the items in a
 * stack; `Radio` supplies the visible control and its dot.
 *
 * Written as a plain generic function rather than `forwardRef` so the
 * `<Value>` generic survives — `forwardRef` would erase it, the same
 * reasoning as `Select`, Kairo's other generic component. Base UI already
 * types `ref` as a regular (React 19 ref-as-prop) field on `RadioGroupProps`,
 * so it still flows straight through the `{...props}` spread into
 * `BaseRadioGroup`'s own `forwardRef`.
 *
 * `Value` defaults to `unknown` rather than Base UI's `any`. In practice the
 * default rarely applies — `value`/`defaultValue` infer it — and where it does
 * apply (e.g. only `onValueChange` is passed) `unknown` makes the callback
 * argument something the caller has to narrow or pin with an explicit
 * `<RadioGroup<string>>`, instead of silently handing back `any`.
 */
export function RadioGroup<Value = unknown>({ className, ...props }: RadioGroupProps<Value>) {
  return (
    <BaseRadioGroup
      className={className ? `kairo-radio-group ${className}` : 'kairo-radio-group'}
      {...props}
    />
  );
}

RadioGroup.displayName = 'RadioGroup';

export interface RadioProps extends RadioRootProps {}

/**
 * A single radio button, meant to be rendered inside a `RadioGroup`. A thin
 * wrapper over Base UI's `Radio.Root`/`Radio.Indicator` anatomy — all
 * interaction and accessibility logic (`role="radio"`, `aria-checked`,
 * joining the group's roving-tabindex composite, the hidden `<input>`) comes
 * from `@base-ui/react`. Kairo only supplies the
 * `.kairo-radio`/`.kairo-radio-indicator` classes — the indicator is a plain
 * `<span>` styled into a dot purely with CSS, no icon markup needed — so
 * `@kairo-ui/theme` can style everything purely off the
 * `data-checked`/`data-unchecked`/`data-disabled` attributes Base UI puts on
 * the DOM.
 */
export const Radio = forwardRef<HTMLElement, RadioProps>(function Radio(
  { className, ...props },
  ref,
) {
  return (
    <BaseRadio.Root
      ref={ref}
      className={className ? `kairo-radio ${className}` : 'kairo-radio'}
      {...props}
    >
      <BaseRadio.Indicator className="kairo-radio-indicator" keepMounted />
    </BaseRadio.Root>
  );
});

Radio.displayName = 'Radio';
