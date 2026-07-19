'use client';

import { useState } from 'react';
import { RadioGroup, Radio } from '@kairo-ui/react';

/**
 * Interactive demo for the RadioGroup docs page: an uncontrolled group with a
 * default value, a controlled group driven by local state, a group with one
 * disabled option, and a fully disabled group.
 */
export function RadioGroupDemo() {
  const [plan, setPlan] = useState('pro');

  return (
    <div className="flex flex-wrap items-start gap-8">
      <RadioGroup aria-label="Plan (uncontrolled)" defaultValue="free">
        <label className="flex items-center gap-2">
          <Radio value="free" /> Free
        </label>
        <label className="flex items-center gap-2">
          <Radio value="pro" /> Pro
        </label>
        <label className="flex items-center gap-2">
          <Radio value="team" /> Team
        </label>
      </RadioGroup>

      <div className="flex flex-col gap-2">
        <RadioGroup aria-label="Plan (controlled)" value={plan} onValueChange={setPlan}>
          <label className="flex items-center gap-2">
            <Radio value="free" /> Free
          </label>
          <label className="flex items-center gap-2">
            <Radio value="pro" /> Pro
          </label>
          <label className="flex items-center gap-2">
            <Radio value="team" /> Team
          </label>
        </RadioGroup>
        <span className="text-sm" style={{ color: 'var(--kairo-muted-foreground)' }}>
          Selected: {plan}
        </span>
      </div>

      <RadioGroup aria-label="Plan (one option disabled)" defaultValue="free">
        <label className="flex items-center gap-2">
          <Radio value="free" /> Free
        </label>
        <label className="flex items-center gap-2">
          <Radio value="pro" disabled /> Pro (unavailable)
        </label>
        <label className="flex items-center gap-2">
          <Radio value="team" /> Team
        </label>
      </RadioGroup>

      <RadioGroup aria-label="Plan (disabled group)" defaultValue="pro" disabled>
        <label className="flex items-center gap-2">
          <Radio value="free" /> Free
        </label>
        <label className="flex items-center gap-2">
          <Radio value="pro" /> Pro
        </label>
        <label className="flex items-center gap-2">
          <Radio value="team" /> Team
        </label>
      </RadioGroup>
    </div>
  );
}
