import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuSeparator,
} from './context-menu';
import { KairoLocaleProvider } from '../i18n/locale-provider';

function Example({
  onOpenChange,
  onCopy,
  disabled,
}: {
  onOpenChange?: (open: boolean) => void;
  onCopy?: () => void;
  disabled?: boolean;
}) {
  return (
    <ContextMenu disabled={disabled} onOpenChange={onOpenChange}>
      <ContextMenuTrigger data-testid="trigger">Right-click this area</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onCopy}>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
        <ContextMenuItem disabled>Delete</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuGroupLabel>More</ContextMenuGroupLabel>
          <ContextMenuItem>Rename</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe('ContextMenu', () => {
  it('does not render the menu until a contextmenu event fires on the trigger', () => {
    render(<Example />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not open on a plain left click — only a contextmenu event opens it', () => {
    render(<Example />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu on a contextmenu (right-click) event and suppresses the native menu', async () => {
    render(<Example />);
    const trigger = screen.getByTestId('trigger');
    // `fireEvent` returns the boolean produced by the underlying
    // `EventTarget.dispatchEvent` call: `false` means some handler called
    // `preventDefault()` on this cancelable event. Base UI's
    // `ContextMenu.Trigger` does exactly that in its own `contextmenu`
    // handler, which is how the browser's native menu is suppressed so only
    // Kairo's popup appears — this assertion is the jsdom-visible proof of
    // that call, since jsdom has no real native context menu to observe.
    const notPrevented = fireEvent.contextMenu(trigger);
    expect(notPrevented).toBe(false);
    const menu = await screen.findByRole('menu');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('kairo-context-menu-popup');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
  });

  it('calls onOpenChange when opened', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    await screen.findByRole('menu');
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('activates an item on click, fires its handler, and closes the menu', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    const copy = await screen.findByRole('menuitem', { name: 'Copy' });
    fireEvent.click(copy);
    expect(onCopy).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('marks a disabled item with data-disabled and skips its handler on click', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    const deleteItem = await screen.findByRole('menuitem', { name: 'Delete' });
    expect(deleteItem).toHaveAttribute('data-disabled');
    fireEvent.click(deleteItem);
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Example />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    await screen.findByRole('menu');
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('supports keyboard navigation between items with ArrowDown', async () => {
    render(<Example />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    await screen.findByRole('menu');
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    // Whichever item (if any) is focused immediately after opening, pressing
    // ArrowDown enough times must cycle onto every enabled item — assert we
    // land on 'Paste' at some point without hard-coding how many presses the
    // initial auto-highlight already consumed.
    const names: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      names.push(document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent ?? '');
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
      await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    }
    expect(names).toContain('Copy');
    expect(names.some((name) => name === 'Paste')).toBe(true);
  });

  it('activates the highlighted item with Enter', async () => {
    const onCopy = vi.fn();
    render(<Example onCopy={onCopy} />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    await screen.findByRole('menu');
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    // Unlike Menu's own trigger, ContextMenuTrigger can't be opened via
    // ArrowDown (Base UI's `openOnArrowKeyDown` is off for context menus,
    // since the trigger wraps arbitrary content, not a focusable control) —
    // so a right-click open lands focus on the popup itself, not an item.
    // Establish the highlight with one ArrowDown first, matching how
    // Select/Menu's own "…with Enter" tests do it and how a real right-click
    // context menu behaves (nothing highlighted until you press an arrow
    // key), then activate it.
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Copy'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Enter' });
    expect(onCopy).toHaveBeenCalled();
  });

  it('renders a group label and a separator', async () => {
    render(<Example />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    await screen.findByRole('menu');
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(document.querySelector('.kairo-context-menu-separator')).toBeInTheDocument();
  });

  it('has no axe violations when the menu is open', async () => {
    const { baseElement } = render(<Example />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
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
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('lang', 'th');
  });

  it('renders no lang attribute on the popup without a KairoLocaleProvider', async () => {
    render(<Example />);
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    const menu = await screen.findByRole('menu');
    expect(menu).not.toHaveAttribute('lang');
  });

  it('portals the popup into a custom container element', async () => {
    const portalTarget = document.createElement('div');
    document.body.appendChild(portalTarget);
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right-click this area</ContextMenuTrigger>
        <ContextMenuContent container={portalTarget}>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId('trigger'));
    const menu = await screen.findByRole('menu');
    expect(portalTarget.contains(menu)).toBe(true);
    document.body.removeChild(portalTarget);
  });

  it('renders an enabled trigger with no data-disabled/aria-disabled', () => {
    render(<Example />);
    const trigger = screen.getByTestId('trigger');
    expect(trigger).not.toHaveAttribute('data-disabled');
    expect(trigger).not.toHaveAttribute('aria-disabled');
  });

  it('fans a disabled root out to the trigger as data-disabled/aria-disabled', () => {
    render(<Example disabled />);
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-disabled');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not open (and does not suppress the native menu) when the root is disabled', () => {
    render(<Example disabled />);
    const trigger = screen.getByTestId('trigger');
    // Base UI's own `handleContextMenu` bails out before calling
    // `stopEvent`/`preventDefault` when `disabled`, so — unlike the
    // non-disabled case above — this event is left uncancelled, meaning the
    // dispatch returns `true`. That's also the reason a disabled trigger was
    // *worse* than doing nothing before this fix: the browser's native menu
    // would still appear.
    const notPrevented = fireEvent.contextMenu(trigger);
    expect(notPrevented).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it("lets the trigger's own disabled prop override the root's for the visual affordance alone", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger" disabled>
          Right-click this area
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const trigger = screen.getByTestId('trigger');
    // Visually disabled…
    expect(trigger).toHaveAttribute('data-disabled');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    // …but the root itself was never told to disable, so the interaction
    // still works — this is the documented (discouraged) mismatch the
    // `disabled` prop's own doc comment warns about.
    const notPrevented = fireEvent.contextMenu(trigger);
    expect(notPrevented).toBe(false);
    expect(await screen.findByRole('menu')).toBeInTheDocument();
  });
});
