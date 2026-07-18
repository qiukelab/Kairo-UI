'use client';

import { Button, ToastProvider, useToast } from '@kairo-ui/react';

function ShowToastButton() {
  const toast = useToast();

  return (
    <Button
      variant="outline"
      onClick={() =>
        toast.add({
          title: 'Saved',
          description: 'Your changes have been saved.',
        })
      }
    >
      Show toast
    </Button>
  );
}

/**
 * Interactive demo for the Toast docs page: a `ToastProvider` wraps a button
 * that queues a toast via `useToast().add(...)` on click.
 */
export function ToastDemo() {
  return (
    <ToastProvider>
      <ShowToastButton />
    </ToastProvider>
  );
}
