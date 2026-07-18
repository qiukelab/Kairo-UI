'use client';

import { forwardRef } from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { SwitchRootProps } from '@base-ui/react/switch';

export interface SwitchProps extends SwitchRootProps {}

/**
 * Kairo's Switch. A thin wrapper over Base UI's `Switch.Root`/`Switch.Thumb`
 * anatomy — all interaction and accessibility logic (role="switch", keyboard
 * toggling, controlled/uncontrolled state, hidden `<input>` for form
 * submission) comes from `@base-ui/react`. Kairo only supplies the
 * `.kairo-switch`/`.kairo-switch-thumb` classes so `@kairo-ui/theme` can style
 * it purely off the `data-checked`/`data-unchecked`/`data-disabled`
 * attributes Base UI puts on the DOM.
 */
export const Switch = forwardRef<HTMLElement, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <BaseSwitch.Root
      ref={ref}
      className={className ? `kairo-switch ${className}` : 'kairo-switch'}
      {...props}
    >
      <BaseSwitch.Thumb className="kairo-switch-thumb" />
    </BaseSwitch.Root>
  );
});

Switch.displayName = 'Switch';
