'use client';

import {
  Button,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@kairo-ui/react';
import type { DrawerSide } from '@kairo-ui/react';

const sides: DrawerSide[] = ['top', 'right', 'bottom', 'left'];

/**
 * Interactive demo for the Drawer docs page: one trigger per side, each
 * opening a drawer pinned to (and sliding in from) that edge of the preview.
 */
export function DrawerDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      {sides.map((side) => (
        <Drawer key={side} side={side}>
          <DrawerTrigger render={<Button variant="outline">{capitalize(side)}</Button>} />
          <DrawerContent>
            <DrawerTitle>{capitalize(side)} drawer</DrawerTitle>
            <DrawerDescription>
              This panel is pinned to the {side} edge and slides in from there.
            </DrawerDescription>
            <div className="mt-6 flex justify-end">
              <DrawerClose render={<Button variant="ghost">Close</Button>} />
            </div>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
