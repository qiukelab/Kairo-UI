'use client';

import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  PopoverArrow,
} from '@kairo-ui/react';

/**
 * Interactive demo for the Popover docs page: a trigger button opens an
 * anchored popup with an arrow, a title, a description, and a close button.
 */
export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Share</Button>} />
      <PopoverContent>
        <PopoverArrow />
        <PopoverTitle>Share this document</PopoverTitle>
        <PopoverDescription>Anyone with the link will be able to view this.</PopoverDescription>
        <div className="mt-4 flex justify-end">
          <PopoverClose render={<Button variant="ghost">Done</Button>} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
