import { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { RadioGroup, Radio } from './radio-group';
import type { RadioGroupProps } from './radio-group';

function Example(props: Partial<RadioGroupProps<string>>) {
  return (
    <RadioGroup aria-label="Fruit" {...props}>
      <Radio value="apple" aria-label="Apple" />
      <Radio value="banana" aria-label="Banana" />
      <Radio value="cherry" aria-label="Cherry" disabled />
    </RadioGroup>
  );
}

describe('RadioGroup / Radio', () => {
  it('renders a radiogroup containing radio items', () => {
    render(<Example />);
    expect(screen.getByRole('radiogroup', { name: 'Fruit' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('only one radio in the group is selected at a time', () => {
    render(<Example defaultValue="apple" />);
    const apple = screen.getByRole('radio', { name: 'Apple' });
    const banana = screen.getByRole('radio', { name: 'Banana' });
    expect(apple).toHaveAttribute('aria-checked', 'true');
    expect(banana).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(banana);
    expect(apple).toHaveAttribute('aria-checked', 'false');
    expect(banana).toHaveAttribute('aria-checked', 'true');
  });

  it('selects a radio on click and fires onValueChange', () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const banana = screen.getByRole('radio', { name: 'Banana' });
    expect(banana).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(banana);
    expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
    expect(banana).toHaveAttribute('aria-checked', 'true');
    expect(banana).toHaveAttribute('data-checked');
  });

  it('supports an uncontrolled defaultValue', () => {
    render(<Example defaultValue="banana" />);
    expect(screen.getByRole('radio', { name: 'Banana' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Apple' })).toHaveAttribute('aria-checked', 'false');
  });

  it('supports a controlled value', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Example value="apple" onValueChange={onValueChange} />);
    const apple = screen.getByRole('radio', { name: 'Apple' });
    const banana = screen.getByRole('radio', { name: 'Banana' });
    expect(apple).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(banana);
    expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
    // Controlled: the checked radio doesn't change until the prop does.
    expect(apple).toHaveAttribute('aria-checked', 'true');
    expect(banana).toHaveAttribute('aria-checked', 'false');
    rerender(<Example value="banana" onValueChange={onValueChange} />);
    expect(banana).toHaveAttribute('aria-checked', 'true');
    expect(apple).toHaveAttribute('aria-checked', 'false');
  });

  it('does not select a disabled radio', () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const cherry = screen.getByRole('radio', { name: 'Cherry' });
    expect(cherry).toHaveAttribute('data-disabled');
    fireEvent.click(cherry);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(cherry).toHaveAttribute('aria-checked', 'false');
  });

  it('supports arrow-key roving focus between radios, moving the selection with it', async () => {
    const onValueChange = vi.fn();
    render(<Example defaultValue="apple" onValueChange={onValueChange} />);
    const apple = screen.getByRole('radio', { name: 'Apple' });
    const banana = screen.getByRole('radio', { name: 'Banana' });
    apple.focus();
    expect(apple).toHaveFocus();
    // Base UI's composite navigation moves focus inside a `queueMicrotask`,
    // so the focus change lands a tick after the keydown handler runs.
    fireEvent.keyDown(apple, { key: 'ArrowDown' });
    await waitFor(() => expect(banana).toHaveFocus());
    // Unlike a checkbox group, arrow-key navigation in a radio group also
    // selects the newly focused item (native `<input type="radio">`
    // behavior) — this is the behavior that distinguishes it from a set of
    // independently-toggled checkboxes.
    await waitFor(() => expect(banana).toHaveAttribute('aria-checked', 'true'));
    expect(apple).toHaveAttribute('aria-checked', 'false');
    expect(onValueChange).toHaveBeenCalledWith('banana', expect.anything());
    fireEvent.keyDown(banana, { key: 'ArrowUp' });
    await waitFor(() => expect(apple).toHaveFocus());
    await waitFor(() => expect(apple).toHaveAttribute('aria-checked', 'true'));
  });

  it('merges a custom className with the base kairo-radio-group class', () => {
    render(<Example className="extra-group" />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveClass('kairo-radio-group');
    expect(group).toHaveClass('extra-group');
  });

  it('merges a custom className with the base kairo-radio class', () => {
    render(
      <RadioGroup aria-label="Fruit">
        <Radio value="apple" aria-label="Apple" className="extra-radio" />
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Apple' });
    expect(radio).toHaveClass('kairo-radio');
    expect(radio).toHaveClass('extra-radio');
  });

  it('forwards the ref to the underlying Radio root element', () => {
    const ref = createRef<HTMLElement>();
    render(
      <RadioGroup aria-label="Fruit">
        <Radio value="apple" aria-label="Apple" ref={ref} />
      </RadioGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveAttribute('role', 'radio');
  });

  it('forwards the ref to the underlying RadioGroup root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<RadioGroup aria-label="Fruit" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'radiogroup');
  });

  it('has no axe violations for a properly labelled group', async () => {
    const { container } = render(<Example defaultValue="apple" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
