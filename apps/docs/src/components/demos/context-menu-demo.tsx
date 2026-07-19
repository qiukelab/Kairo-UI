'use client';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuSeparator,
} from '@kairo-ui/react';
import { Copy, Clipboard, Pencil, Trash2 } from 'lucide-react';

/**
 * Interactive demo for the ContextMenu docs page: a clearly labelled target
 * area that opens a menu (right click, or long-press on touch) with
 * icon + keyboard-shortcut items, a disabled item, and a labelled group
 * separated from the rest.
 */
export function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="flex h-32 w-full max-w-sm items-center justify-center rounded-md border border-dashed p-4 text-center text-sm"
        style={{ borderColor: 'var(--kairo-border)', color: 'var(--kairo-muted-foreground)' }}
      >
        Right-click (or long-press on touch) this area to open the menu
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <span className="flex items-center gap-2">
            <Copy aria-hidden className="h-4 w-4" />
            Copy
          </span>
          <span className="text-xs" style={{ color: 'var(--kairo-muted-foreground)' }}>
            Ctrl+C
          </span>
        </ContextMenuItem>
        <ContextMenuItem>
          <span className="flex items-center gap-2">
            <Clipboard aria-hidden className="h-4 w-4" />
            Paste
          </span>
          <span className="text-xs" style={{ color: 'var(--kairo-muted-foreground)' }}>
            Ctrl+V
          </span>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          <span className="flex items-center gap-2">
            <Trash2 aria-hidden className="h-4 w-4" />
            Delete
          </span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuGroupLabel>More</ContextMenuGroupLabel>
          <ContextMenuItem>
            <span className="flex items-center gap-2">
              <Pencil aria-hidden className="h-4 w-4" />
              Rename
            </span>
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
