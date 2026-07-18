'use client';

import { useState } from 'react';
import { Switch } from '@kairo-ui/react';

/**
 * Interactive demo for the Switch docs page: an uncontrolled switch, a
 * controlled switch driven by local state, and a disabled switch.
 */
export function SwitchDemo() {
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <label className="flex items-center gap-2">
        <Switch defaultChecked aria-label="Default (uncontrolled)" />
        <span className="text-sm">Default</span>
      </label>

      <label className="flex items-center gap-2">
        <Switch checked={checked} onCheckedChange={setChecked} aria-label="Controlled" />
        <span className="text-sm">Controlled ({checked ? 'on' : 'off'})</span>
      </label>

      <label className="flex items-center gap-2">
        <Switch disabled defaultChecked aria-label="Disabled" />
        <span className="text-sm">Disabled</span>
      </label>
    </div>
  );
}
