'use client';

import { useState } from 'react';
import { Button } from '@kairo-ui/react';
import { AnimatedNumber, Reveal } from '@kairo-ui/motion-react';

/**
 * Interactive demo for the Motion docs page: a button that bumps a number
 * spring-animated by `<AnimatedNumber>`, and a `<Reveal>` that animates its
 * children in the first time they scroll into view.
 */
export function MotionDemo() {
  const [value, setValue] = useState(1280);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <AnimatedNumber value={value} className="text-3xl font-semibold tabular-nums" />
        <Button variant="outline" onClick={() => setValue((current) => current + 137)}>
          Add 137
        </Button>
      </div>

      <Reveal
        variant="slideUp"
        className="rounded-md border p-4 text-sm"
        style={{ borderColor: 'var(--kairo-border)' }}
      >
        I animate in the first time I scroll into view.
      </Reveal>
    </div>
  );
}
