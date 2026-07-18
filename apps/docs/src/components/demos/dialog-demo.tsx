'use client';

import { Button, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@kairo-ui/react';

/**
 * Interactive demo for the Dialog docs page: a trigger button opens a modal
 * with a title, description, and a close button.
 */
export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Edit profile</Button>} />
      <DialogContent>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you&apos;re done.
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <DialogClose render={<Button>Save changes</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
