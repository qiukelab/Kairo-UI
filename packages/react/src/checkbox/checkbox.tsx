'use client';

import { forwardRef } from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type { CheckboxRootProps } from '@base-ui/react/checkbox';

export interface CheckboxProps extends CheckboxRootProps {}

/**
 * Kairo's Checkbox. A thin wrapper over Base UI's
 * `Checkbox.Root`/`Checkbox.Indicator` anatomy — all interaction and
 * accessibility logic (role="checkbox", keyboard toggling, controlled/
 * uncontrolled state, indeterminate state, hidden `<input>` for form
 * submission) comes from `@base-ui/react`. Kairo only supplies the
 * `.kairo-checkbox`/`.kairo-checkbox-indicator` classes plus the check/dash
 * icon markup, so `@kairo-ui/theme` can style everything purely off the
 * `data-checked`/`data-unchecked`/`data-indeterminate`/`data-disabled`
 * attributes Base UI puts on the DOM.
 */
export const Checkbox = forwardRef<HTMLElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <BaseCheckbox.Root
      ref={ref}
      className={className ? `kairo-checkbox ${className}` : 'kairo-checkbox'}
      {...props}
    >
      <BaseCheckbox.Indicator className="kairo-checkbox-indicator" keepMounted>
        <svg
          className="kairo-checkbox-icon-check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <svg
          className="kairo-checkbox-icon-indeterminate"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
        </svg>
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
});

Checkbox.displayName = 'Checkbox';
