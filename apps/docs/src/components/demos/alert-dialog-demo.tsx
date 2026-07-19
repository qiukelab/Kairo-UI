'use client';

import {
  Button,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from '@kairo-ui/react';

/**
 * Interactive demo for the AlertDialog docs page: a trigger button opens an
 * alert dialog that demands an explicit Cancel/Delete decision — clicking
 * the backdrop does nothing.
 */
export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline">Delete account</Button>} />
      <AlertDialogContent>
        <AlertDialogTitle>Delete account?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete your account and all of its data. This action cannot be
          undone.
        </AlertDialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
          <AlertDialogClose render={<Button>Delete</Button>} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
