'use client';

import { forwardRef } from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import type { ToggleProps as BaseToggleProps } from '@base-ui/react/toggle';
import type { ToggleGroupProps as BaseToggleGroupProps } from '@base-ui/react/toggle-group';

/*
 * The `string` default mirrors how `AccordionProps<Value = any>` and Base
 * UI's own `Toggle.Props<TValue extends string = string>` already default
 * their generics elsewhere in this package — narrowing it further here would
 * only break assignability for consumers passing a literal union. Base UI's
 * `Toggle`/`ToggleGroup` are themselves generic function components (not
 * `Toggle.Root`/`Toggle.Item` namespaces), so — like `Select`'s `Root` — a
 * `forwardRef` wrapper necessarily narrows their `<Value>` type parameter to
 * whatever `ToggleProps`/`ToggleGroupProps` default to. Unlike `Select.Root`,
 * both of these render a real DOM element that needs a `.kairo-*` class
 * merged in, so re-exporting the Base UI component as-is (as `Select` does)
 * isn't an option here.
 */
export interface ToggleProps<Value extends string = string> extends BaseToggleProps<Value> {
  /**
   * Visual style of the toggle's unpressed state, on the same scale as
   * `Button`'s `variant` so a `Toggle` sits comfortably next to one.
   * @default 'outline'
   */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Size of the toggle, on the same scale as `Button`'s `size`. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kairo's Toggle: a two-state button that stays pressed. Renders Base UI's
 * `Toggle` — a native `<button>` with `aria-pressed`/`data-pressed` reflecting
 * its state — all interaction and accessibility logic (controlled/
 * uncontrolled `pressed`, keyboard activation) comes from `@base-ui/react`.
 *
 * Standalone, it needs no `value` prop and behaves like a self-contained
 * on/off button. Rendered inside a `ToggleGroup`, Base UI switches it to a
 * roving-focus composite item and its pressed state is derived from the
 * group's `value` array instead — give it a `value` matching one of the
 * group's in that case.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { variant = 'outline', size = 'md', className, ...props },
  ref,
) {
  return (
    <BaseToggle
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={className ? `kairo-toggle ${className}` : 'kairo-toggle'}
      {...props}
    />
  );
});

Toggle.displayName = 'Toggle';

export interface ToggleGroupProps<Value extends string = string>
  extends BaseToggleGroupProps<Value> {}

/**
 * Kairo's ToggleGroup: a set of related `Toggle`s that share pressed state.
 * Renders Base UI's `ToggleGroup` — a `<div role="group">` providing roving
 * `arrow`/`Home`/`End` keyboard focus across its `Toggle` children (via
 * context, not a separate "Item" part) and, through its `multiple` prop,
 * either single-select (only one child pressed at a time) or multi-select
 * (several children pressed at once) behavior.
 *
 * Note on semantics: even in single-select mode Base UI keeps `role="group"`
 * with `aria-pressed` toggle buttons rather than switching to
 * `role="radiogroup"`/`role="radio"` — this matches how a real toolbar
 * segmented control (e.g. bold/italic/underline) reads, not a radio button
 * set, so no `radiogroup` role is emulated here either.
 */
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  { className, ...props },
  ref,
) {
  return (
    <BaseToggleGroup
      ref={ref}
      className={className ? `kairo-toggle-group ${className}` : 'kairo-toggle-group'}
      {...props}
    />
  );
});

ToggleGroup.displayName = 'ToggleGroup';
