'use client';

import { useState } from 'react';
import { Toggle, ToggleGroup } from '@kairo-ui/react';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Star } from 'lucide-react';

/**
 * Interactive demo for the Toggle docs page: an uncontrolled toggle, a
 * controlled toggle driven by local state, and a disabled toggle.
 */
export function ToggleDemo() {
  const [pressed, setPressed] = useState(true);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Toggle defaultPressed aria-label="Default (uncontrolled)">
        Bold
      </Toggle>
      <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="Controlled">
        {pressed ? 'On' : 'Off'}
      </Toggle>
      <Toggle disabled defaultPressed aria-label="Disabled">
        Disabled
      </Toggle>
    </div>
  );
}

/**
 * Interactive demo for the Toggle docs page: a single-select `ToggleGroup`
 * (text alignment) where pressing one item unpresses the others.
 */
export function ToggleGroupSingleDemo() {
  return (
    <ToggleGroup defaultValue={['center']} aria-label="Text alignment">
      <Toggle value="left" aria-label="Align left">
        <AlignLeft aria-hidden className="h-4 w-4" />
      </Toggle>
      <Toggle value="center" aria-label="Align center">
        <AlignCenter aria-hidden className="h-4 w-4" />
      </Toggle>
      <Toggle value="right" aria-label="Align right">
        <AlignRight aria-hidden className="h-4 w-4" />
      </Toggle>
    </ToggleGroup>
  );
}

/**
 * Interactive demo for the Toggle docs page: a multi-select `ToggleGroup`
 * (text formatting) where several items can stay pressed at once.
 */
export function ToggleGroupMultipleDemo() {
  return (
    <ToggleGroup multiple defaultValue={['bold']} aria-label="Text formatting">
      <Toggle value="bold" aria-label="Bold">
        <Bold aria-hidden className="h-4 w-4" />
      </Toggle>
      <Toggle value="italic" aria-label="Italic">
        <Italic aria-hidden className="h-4 w-4" />
      </Toggle>
      <Toggle value="underline" aria-label="Underline">
        <Underline aria-hidden className="h-4 w-4" />
      </Toggle>
    </ToggleGroup>
  );
}

/**
 * Interactive demo for the Toggle docs page: a standalone icon-only toggle.
 * `Toggle` renders no visible text of its own, so an icon-only instance
 * always needs an `aria-label` to stay accessible.
 */
export function ToggleIconDemo() {
  return (
    <Toggle aria-label="Save to favorites">
      <Star aria-hidden className="h-4 w-4" />
    </Toggle>
  );
}
