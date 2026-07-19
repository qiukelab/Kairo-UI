import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from './number-field';
import type { NumberFieldComponentProps } from './number-field';

function Example(props: Partial<NumberFieldComponentProps>) {
  return (
    <NumberField {...props}>
      <NumberFieldGroup>
        <NumberFieldDecrement aria-label="Decrease quantity" />
        <NumberFieldInput aria-label="Quantity" />
        <NumberFieldIncrement aria-label="Increase quantity" />
      </NumberFieldGroup>
    </NumberField>
  );
}

describe('NumberField', () => {
  it('renders a labelled, formatted text input (not a native spinbutton)', () => {
    // Base UI's `NumberField.Input` is a plain `<input type="text">` with
    // `aria-roledescription="Number field"`, not `role="spinbutton"` — see
    // the doc comment on `NumberFieldInput` in `number-field.tsx` for why
    // (the visible text is locale-formatted, which the native spinbutton
    // role's raw-number semantics would fight).
    render(<Example defaultValue={5} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    expect(input).toHaveAttribute('aria-roledescription', 'Number field');
    expect(input).toHaveValue('5');
  });

  it('increments the value when the increment button is clicked', () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue={5} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onValueChange).toHaveBeenCalledWith(6, expect.anything());
  });

  it('decrements the value when the decrement button is clicked', () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue={5} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onValueChange).toHaveBeenCalledWith(4, expect.anything());
  });

  it('steps by the given `step`', () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue={0} step={5} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onValueChange).toHaveBeenCalledWith(5, expect.anything());
  });

  it('clamps at `max` and disables the increment button at the boundary', () => {
    const onValueChange = vi.fn();
    render(<Example value={10} max={10} onValueChange={onValueChange} />);
    const increment = screen.getByRole('button', { name: 'Increase quantity' });
    expect(increment).toHaveAttribute('data-disabled');
    fireEvent.click(increment);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('clamps at `min` and disables the decrement button at the boundary', () => {
    const onValueChange = vi.fn();
    render(<Example value={0} min={0} onValueChange={onValueChange} />);
    const decrement = screen.getByRole('button', { name: 'Decrease quantity' });
    expect(decrement).toHaveAttribute('data-disabled');
    fireEvent.click(decrement);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('supports a controlled value', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value={5} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    expect(input).toHaveValue('5');
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onValueChange).toHaveBeenCalledWith(6, expect.anything());
    // Controlled: the displayed value doesn't change until the prop does.
    expect(input).toHaveValue('5');
    rerender(<Example value={6} onValueChange={onValueChange} />);
    expect(input).toHaveValue('6');
  });

  it('steps the value with ArrowUp/ArrowDown on the input', () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue={5} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onValueChange).toHaveBeenCalledWith(6, expect.anything());
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(onValueChange).toHaveBeenCalledWith(5, expect.anything());
  });

  it('renders the input and both buttons as disabled when the field is disabled', () => {
    render(<Example defaultValue={5} disabled />);
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toHaveAttribute(
      'data-disabled',
    );
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toHaveAttribute(
      'data-disabled',
    );
  });

  it('ignores unparseable typed text', () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue={5} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('merges a custom className on the group with its base class', () => {
    const { container } = render(
      <NumberField defaultValue={5}>
        <NumberFieldGroup className="extra-group-class">
          <NumberFieldDecrement aria-label="Decrease quantity" />
          <NumberFieldInput aria-label="Quantity" />
          <NumberFieldIncrement aria-label="Increase quantity" />
        </NumberFieldGroup>
      </NumberField>,
    );
    const group = container.querySelector('.kairo-number-field-group');
    expect(group).toHaveClass('kairo-number-field-group');
    expect(group).toHaveClass('extra-group-class');
  });

  it('merges a custom className with the base kairo-number-field class', () => {
    const { container } = render(
      <NumberField className="extra-class" defaultValue={5}>
        <NumberFieldGroup>
          <NumberFieldDecrement aria-label="Decrease quantity" />
          <NumberFieldInput aria-label="Quantity" />
          <NumberFieldIncrement aria-label="Increase quantity" />
        </NumberFieldGroup>
      </NumberField>,
    );
    const root = container.querySelector('.kairo-number-field');
    expect(root).toHaveClass('kairo-number-field');
    expect(root).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <NumberField defaultValue={5}>
        <NumberFieldGroup>
          <NumberFieldDecrement aria-label="Decrease quantity" />
          <NumberFieldInput aria-label="Quantity" ref={ref} />
          <NumberFieldIncrement aria-label="Increase quantity" />
        </NumberFieldGroup>
      </NumberField>,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has no axe violations on a labelled field', async () => {
    const { container } = render(<Example defaultValue={5} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
