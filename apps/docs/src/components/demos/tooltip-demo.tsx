'use client';

import { Button, Tooltip, TooltipProvider } from '@kairo-ui/react';

/**
 * Interactive demo for the Tooltip docs page: a few tooltips positioned on
 * different sides, all sharing a single `TooltipProvider` so hovering from
 * one trigger to the next opens the next tooltip instantly.
 */
export function TooltipDemo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-6">
        <Tooltip content="Saved to your library">
          <Button variant="outline">Top (default)</Button>
        </Tooltip>

        <Tooltip content="Deletes this item permanently" side="bottom">
          <Button variant="outline">Bottom</Button>
        </Tooltip>

        <Tooltip content="Opens in a new tab" side="right">
          <Button variant="outline">Right</Button>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
