'use client';

import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from '@kairo-ui/react';

/**
 * Interactive demo for the Collapsible docs page: a default (closed)
 * disclosure, one initially open via `defaultOpen`, and a disabled one —
 * stacked to show the height animation alongside the static states.
 */
export function CollapsibleDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Collapsible>
        <CollapsibleTrigger>What’s included in the free plan?</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className="px-3 pb-3 text-sm">
            Unlimited projects, up to 3 collaborators, and community support. Upgrade any time to
            unlock more seats and priority support.
          </p>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Can I cancel at any time?</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className="px-3 pb-3 text-sm">
            Yes — cancel from your account settings and you’ll keep access until the end of the
            current billing period.
          </p>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible disabled>
        <CollapsibleTrigger>Enterprise plan (coming soon)</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className="px-3 pb-3 text-sm">Not yet available.</p>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}
