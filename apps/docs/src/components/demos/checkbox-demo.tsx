'use client';

import { useState } from 'react';
import { Checkbox } from '@kairo-ui/react';

/**
 * Interactive demo for the Checkbox docs page: an uncontrolled checkbox, a
 * controlled checkbox driven by local state, an indeterminate checkbox, and
 * a disabled checkbox.
 */
export function CheckboxDemo() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <label className="flex items-center gap-2">
        <Checkbox defaultChecked aria-label="Default (uncontrolled)" />
        <span className="text-sm">Default</span>
      </label>

      <label className="flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Controlled" />
        <span className="text-sm">Controlled ({checked ? 'checked' : 'unchecked'})</span>
      </label>

      <label className="flex items-center gap-2">
        <Checkbox indeterminate aria-label="Indeterminate" />
        <span className="text-sm">Indeterminate</span>
      </label>

      <label className="flex items-center gap-2">
        <Checkbox disabled defaultChecked aria-label="Disabled" />
        <span className="text-sm">Disabled</span>
      </label>
    </div>
  );
}
