import { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Toggle, ToggleGroup } from './toggle-group';
import type { ToggleGroupProps } from './toggle-group';

function SingleGroup(props: Partial<ToggleGroupProps>) {
  return (
    <ToggleGroup aria-label="Text alignment" {...props}>
      <Toggle value="left" aria-label="Left">
        L
      </Toggle>
      <Toggle value="center" aria-label="Center">
        C
      </Toggle>
      <Toggle value="right" aria-label="Right">
        R
      </Toggle>
    </ToggleGroup>
  );
}

function MultipleGroup(props: Partial<ToggleGroupProps>) {
  return (
    <ToggleGroup aria-label="Text formatting" multiple {...props}>
      <Toggle value="bold" aria-label="Bold">
        B
      </Toggle>
      <Toggle value="italic" aria-label="Italic">
        I
      </Toggle>
      <Toggle value="underline" aria-label="Underline">
        U
      </Toggle>
    </ToggleGroup>
  );
}

describe('Toggle (standalone)', () => {
  it('renders as a button with aria-pressed reflecting its state', () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).not.toHaveAttribute('data-pressed');
  });

  it('toggles pressed state on click and fires onPressedChange', () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAttribute('data-pressed');
    expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(onPressedChange).toHaveBeenCalledWith(false, expect.anything());
  });

  it('defaults to variant="outline" and size="md"', () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveAttribute('data-variant', 'outline');
    expect(toggle).toHaveAttribute('data-size', 'md');
  });

  it('starts pressed with defaultPressed', () => {
    render(
      <Toggle aria-label="Bold" defaultPressed>
        B
      </Toggle>,
    );
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not toggle or fire onPressedChange when disabled', () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" disabled onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toBeDisabled();
    fireEvent.click(toggle);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it('merges a custom className with the base kairo-toggle class', () => {
    render(
      <Toggle aria-label="Bold" className="extra-class">
        B
      </Toggle>,
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveClass('kairo-toggle');
    expect(toggle).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Toggle aria-label="Bold" ref={ref}>
        B
      </Toggle>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Toggle aria-label="Bold">B</Toggle>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ToggleGroup (single-select)', () => {
  it('renders a labelled group of buttons, not a radiogroup', () => {
    render(<SingleGroup />);
    expect(screen.getByRole('group', { name: 'Text alignment' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('allows only one item pressed at a time', () => {
    render(<SingleGroup defaultValue={['left']} />);
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('data-pressed');

    fireEvent.click(screen.getByRole('button', { name: 'Center' }));
    expect(screen.getByRole('button', { name: 'Center' })).toHaveAttribute('data-pressed');
    expect(screen.getByRole('button', { name: 'Left' })).not.toHaveAttribute('data-pressed');
    expect(screen.getByRole('button', { name: 'Right' })).not.toHaveAttribute('data-pressed');
  });

  it('supports a controlled value + onValueChange', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<SingleGroup value={['left']} onValueChange={onValueChange} />);
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('data-pressed');

    fireEvent.click(screen.getByRole('button', { name: 'Right' }));
    expect(onValueChange).toHaveBeenCalledWith(['right'], expect.anything());
    // Controlled: pressed state doesn't change until the prop does.
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('data-pressed');

    rerender(<SingleGroup value={['right']} onValueChange={onValueChange} />);
    expect(screen.getByRole('button', { name: 'Right' })).toHaveAttribute('data-pressed');
    expect(screen.getByRole('button', { name: 'Left' })).not.toHaveAttribute('data-pressed');
  });

  it('skips a disabled item on click', () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Text alignment" onValueChange={onValueChange}>
        <Toggle value="left" aria-label="Left">
          L
        </Toggle>
        <Toggle value="center" aria-label="Center" disabled>
          C
        </Toggle>
      </ToggleGroup>,
    );
    const center = screen.getByRole('button', { name: 'Center' });
    expect(center).toHaveAttribute('data-disabled');
    fireEvent.click(center);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('disables every item when the group itself is disabled', () => {
    render(<SingleGroup disabled />);
    for (const toggle of screen.getAllByRole('button')) {
      expect(toggle).toBeDisabled();
    }
  });

  it('supports arrow-key navigation between items (roving focus)', async () => {
    render(<SingleGroup />);
    const left = screen.getByRole('button', { name: 'Left' });
    const center = screen.getByRole('button', { name: 'Center' });
    const right = screen.getByRole('button', { name: 'Right' });

    left.focus();
    expect(left).toHaveFocus();
    // Base UI's composite navigation moves focus inside a `queueMicrotask`,
    // so the focus change lands a tick after the keydown handler runs.
    fireEvent.keyDown(left, { key: 'ArrowRight' });
    await waitFor(() => expect(center).toHaveFocus());
    fireEvent.keyDown(center, { key: 'ArrowRight' });
    await waitFor(() => expect(right).toHaveFocus());
    // Loops back to the first item past the end (loopFocus defaults to true).
    fireEvent.keyDown(right, { key: 'ArrowRight' });
    await waitFor(() => expect(left).toHaveFocus());
    fireEvent.keyDown(left, { key: 'End' });
    await waitFor(() => expect(right).toHaveFocus());
    fireEvent.keyDown(right, { key: 'Home' });
    await waitFor(() => expect(left).toHaveFocus());
  });

  it('merges a custom className with the base kairo-toggle-group class', () => {
    const { container } = render(<SingleGroup className="extra-class" />);
    expect(container.firstChild).toHaveClass('kairo-toggle-group');
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<SingleGroup ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<SingleGroup defaultValue={['left']} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ToggleGroup (multi-select)', () => {
  it('allows several items pressed at once', () => {
    render(<MultipleGroup defaultValue={['bold']} />);

    fireEvent.click(screen.getByRole('button', { name: 'Italic' }));
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('data-pressed');
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('data-pressed');
    expect(screen.getByRole('button', { name: 'Underline' })).not.toHaveAttribute('data-pressed');
  });

  it('unpresses an item on a second click without affecting the others', () => {
    render(<MultipleGroup defaultValue={['bold', 'italic']} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    expect(screen.getByRole('button', { name: 'Bold' })).not.toHaveAttribute('data-pressed');
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveAttribute('data-pressed');
  });

  it('reflects data-multiple on the group element', () => {
    const { container } = render(<MultipleGroup />);
    expect(container.firstChild).toHaveAttribute('data-multiple');
  });
});
