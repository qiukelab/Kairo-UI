'use client';

import { useState } from 'react';
import {
  Button,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuSub,
  MenuSubmenuTrigger,
} from '@kairo-ui/react';
import { FilePlus2, Pencil, Trash2, Mail, Link2 } from 'lucide-react';

/**
 * Interactive demo for the Menu docs page: a "File" menu with icon items, a
 * disabled item, a checkbox item, a labelled radio group and a submenu, plus
 * a second menu whose open state is driven by local state.
 */
export function MenuDemo() {
  const [wordWrap, setWordWrap] = useState(true);
  const [theme, setTheme] = useState('system');
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <Menu>
        <MenuTrigger render={<Button variant="outline">File</Button>} />
        <MenuContent>
          <MenuItem>
            <span className="flex items-center gap-2">
              <FilePlus2 aria-hidden className="h-4 w-4" />
              New file
            </span>
          </MenuItem>
          <MenuItem>
            <span className="flex items-center gap-2">
              <Pencil aria-hidden className="h-4 w-4" />
              Rename
            </span>
          </MenuItem>
          <MenuItem disabled>
            <span className="flex items-center gap-2">
              <Trash2 aria-hidden className="h-4 w-4" />
              Delete
            </span>
          </MenuItem>
          <MenuSeparator />
          <MenuCheckboxItem checked={wordWrap} onCheckedChange={setWordWrap}>
            Word wrap
          </MenuCheckboxItem>
          <MenuGroup>
            <MenuGroupLabel>Theme</MenuGroupLabel>
            <MenuRadioGroup value={theme} onValueChange={setTheme}>
              <MenuRadioItem value="light">Light</MenuRadioItem>
              <MenuRadioItem value="dark">Dark</MenuRadioItem>
              <MenuRadioItem value="system">System</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
          <MenuSeparator />
          <MenuSub>
            <MenuSubmenuTrigger>Share</MenuSubmenuTrigger>
            <MenuContent>
              <MenuItem>
                <span className="flex items-center gap-2">
                  <Mail aria-hidden className="h-4 w-4" />
                  Email
                </span>
              </MenuItem>
              <MenuItem>
                <span className="flex items-center gap-2">
                  <Link2 aria-hidden className="h-4 w-4" />
                  Copy link
                </span>
              </MenuItem>
            </MenuContent>
          </MenuSub>
        </MenuContent>
      </Menu>

      <div className="flex flex-col gap-2">
        <Menu open={open} onOpenChange={setOpen}>
          <MenuTrigger
            render={<Button variant="outline">{open ? 'Close menu' : 'Open menu'}</Button>}
          />
          <MenuContent>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Sign out</MenuItem>
          </MenuContent>
        </Menu>
        <span className="text-sm" style={{ color: 'var(--kairo-muted-foreground)' }}>
          Open: {open ? 'true' : 'false'}
        </span>
      </div>
    </div>
  );
}
