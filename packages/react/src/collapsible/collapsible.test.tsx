import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from './collapsible';
import type { CollapsibleProps } from './collapsible';

function Example(props: Partial<CollapsibleProps>) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsiblePanel>Panel content</CollapsiblePanel>
    </Collapsible>
  );
}

/**
 * Simulates a keyboard user activating the focused trigger. Native
 * `<button>` elements fire a `click` event as their own default action when
 * Enter/Space is pressed while focused — real browsers do this regardless of
 * React or Base UI, but jsdom does not implement that default action, so the
 * resulting `click` is dispatched explicitly here to exercise the same code
 * path (Base UI's trigger has no bespoke keydown handling of its own; it
 * relies on native button semantics).
 */
function pressEnter(trigger: HTMLElement) {
  fireEvent.keyDown(trigger, { key: 'Enter' });
  fireEvent.click(trigger);
}

describe('Collapsible', () => {
  it('does not render the panel until the trigger is activated', () => {
    render(<Example />);
    expect(screen.queryByText('Panel content')).not.toBeInTheDocument();
  });

  it('expands the panel on trigger click', () => {
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('renders the panel open immediately with defaultOpen', () => {
    render(<Example defaultOpen />);
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('supports a controlled open state via open/onOpenChange', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    // Controlled: the panel doesn't open until the `open` prop does.
    expect(screen.queryByText('Panel content')).not.toBeInTheDocument();
    rerender(<Example open={true} onOpenChange={onOpenChange} />);
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('expands the panel via keyboard activation (Enter) on the trigger', () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    trigger.focus();
    pressEnter(trigger);
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('wires aria-expanded/aria-controls on the trigger to the panel', () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    fireEvent.click(trigger);
    const panel = screen.getByText('Panel content');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
  });

  it('merges a custom className with the base kairo-collapsible-* classes', () => {
    const { container } = render(
      <Collapsible className="extra-root" defaultOpen>
        <CollapsibleTrigger className="extra-trigger">Toggle</CollapsibleTrigger>
        <CollapsiblePanel className="extra-panel">Panel content</CollapsiblePanel>
      </Collapsible>,
    );
    expect(container.firstChild).toHaveClass('kairo-collapsible', 'extra-root');
    expect(screen.getByRole('button', { name: 'Toggle' })).toHaveClass(
      'kairo-collapsible-trigger',
      'extra-trigger',
    );
    expect(screen.getByText('Panel content')).toHaveClass('kairo-collapsible-panel', 'extra-panel');
  });

  it('forwards refs to the underlying DOM elements', () => {
    const rootRef = createRef<HTMLDivElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    const panelRef = createRef<HTMLDivElement>();
    render(
      <Collapsible ref={rootRef} defaultOpen>
        <CollapsibleTrigger ref={triggerRef}>Toggle</CollapsibleTrigger>
        <CollapsiblePanel ref={panelRef}>Panel content</CollapsiblePanel>
      </Collapsible>,
    );
    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(panelRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no axe violations when the panel is open', async () => {
    const { container } = render(<Example defaultOpen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
