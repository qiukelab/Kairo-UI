import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import {
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
} from './menu';
import { KairoLocaleProvider } from '../i18n/locale-provider';

function Example({
  onOpenChange,
  onCopy,
  onBoldChange,
  onFontChange,
  onShare,
}: {
  onOpenChange?: (open: boolean) => void;
  onCopy?: () => void;
  onBoldChange?: (checked: boolean, details: unknown) => void;
  onFontChange?: (value: string, details: unknown) => void;
  onShare?: () => void;
}) {
  const [bold, setBold] = useState(false);
  const [font, setFont] = useState('sans');

  return (
    <Menu onOpenChange={onOpenChange}>
      <MenuTrigger>Options</MenuTrigger>
      <MenuContent>
        <MenuItem onClick={onCopy}>Copy</MenuItem>
        <MenuItem disabled>Paste</MenuItem>
        <MenuSeparator />
        <MenuCheckboxItem
          checked={bold}
          onCheckedChange={(checked, details) => {
            setBold(checked);
            onBoldChange?.(checked, details);
          }}
        >
          Bold
        </MenuCheckboxItem>
        <MenuRadioGroup
          value={font}
          onValueChange={(value, details) => {
            setFont(value as string);
            onFontChange?.(value as string, details);
          }}
        >
          <MenuRadioItem value="sans">Sans</MenuRadioItem>
          <MenuRadioItem value="serif">Serif</MenuRadioItem>
        </MenuRadioGroup>
        <MenuGroup>
          <MenuGroupLabel>More</MenuGroupLabel>
          <MenuSub>
            <MenuSubmenuTrigger>Share</MenuSubmenuTrigger>
            <MenuContent>
              <MenuItem onClick={onShare}>Slack</MenuItem>
            </MenuContent>
          </MenuSub>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}

describe('Menu', () => {
  it('does not render the menu until the trigger is activated', () => {
    render(<Example />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders the trigger with its accessible name', () => {
    render(<Example />);
    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument();
  });

  it('opens the menu on trigger click', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('kairo-menu-popup');
    // Copy, Paste (disabled) and the Share submenu trigger all carry
    // role="menuitem" — the checkbox/radio items below have their own
    // distinct roles and are asserted separately.
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('calls onOpenChange when opened', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('activates an item on click, fires its handler, and closes the menu', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const copy = await screen.findByRole('menuitem', { name: 'Copy' });
    fireEvent.click(copy);
    expect(onCopy).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('marks a disabled item with data-disabled and skips its handler on click', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const paste = await screen.findByRole('menuitem', { name: 'Paste' });
    expect(paste).toHaveAttribute('data-disabled');
    fireEvent.click(paste);
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('supports keyboard navigation between items with ArrowDown', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    // Whichever item is focused immediately after opening, pressing
    // ArrowDown enough times must cycle onto every item — assert we land on
    // both a plain item and the checkbox item at some point without
    // hard-coding how many presses the initial auto-highlight consumed.
    const seen: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      seen.push(document.activeElement?.textContent ?? '');
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
      await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    }
    expect(seen).toContain('Copy');
    expect(seen).toContain('Bold');
  });

  it('opens the menu with ArrowDown and activates the highlighted item with Enter', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    const trigger = screen.getByRole('button', { name: 'Options' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    await screen.findByRole('menu');
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Copy'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Enter' });
    expect(onCopy).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('toggles a checkbox item on click without closing the menu, reflecting state via aria-checked/data-checked', async () => {
    const onBoldChange = vi.fn();
    render(<Example onBoldChange={onBoldChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const bold = await screen.findByRole('menuitemcheckbox', { name: 'Bold' });
    expect(bold).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(bold);
    expect(onBoldChange).toHaveBeenCalledWith(true, expect.anything());
    expect(bold).toHaveAttribute('aria-checked', 'true');
    expect(bold).toHaveAttribute('data-checked');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('selects a radio item on click without closing the menu, and only one radio item is checked at a time', async () => {
    const onFontChange = vi.fn();
    render(<Example onFontChange={onFontChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const sans = await screen.findByRole('menuitemradio', { name: 'Sans' });
    const serif = screen.getByRole('menuitemradio', { name: 'Serif' });
    expect(sans).toHaveAttribute('aria-checked', 'true');
    expect(serif).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(serif);
    expect(onFontChange).toHaveBeenCalledWith('serif', expect.anything());
    expect(serif).toHaveAttribute('aria-checked', 'true');
    expect(sans).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens a submenu with ArrowRight, and clicking a submenu item fires its handler and closes the whole menu tree', async () => {
    const onShare = vi.fn();
    render(<Example onShare={onShare} />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    // Cycle with ArrowDown until the "Share" submenu trigger is highlighted —
    // don't hard-code how many presses the initial auto-highlight consumed.
    for (let i = 0; i < 6 && document.activeElement?.textContent !== 'Share'; i += 1) {
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
      await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    }
    expect(document.activeElement?.textContent).toBe('Share');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    const slack = await screen.findByRole('menuitem', { name: 'Slack' });
    fireEvent.click(slack);
    expect(onShare).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(0));
  });

  it('renders a group label and a separator', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(document.querySelector('.kairo-menu-separator')).toBeInTheDocument();
  });

  it('forwards a ref to the popup element', async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Menu open>
        <MenuTrigger>Options</MenuTrigger>
        <MenuContent ref={ref}>
          <MenuItem>Copy</MenuItem>
        </MenuContent>
      </Menu>,
    );
    const menu = await screen.findByRole('menu');
    expect(ref.current).toBe(menu);
  });

  it('has no axe violations when the menu is open', async () => {
    const { baseElement } = render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    // `region` (all page content must be contained by a landmark) is a
    // best-practice, page-layout rule, not a WCAG A/AA requirement — it's
    // irrelevant here since this test renders an isolated trigger/menu
    // fragment, not a full page with header/main/nav landmarks.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });

  it('sets lang on the popup when wrapped in a KairoLocaleProvider with a locale', async () => {
    render(
      <KairoLocaleProvider locale="th">
        <Example />
      </KairoLocaleProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Options' }));
    const menu = await screen.findByRole('menu');
    expect(menu).not.toHaveAttribute('lang');
  });
});
