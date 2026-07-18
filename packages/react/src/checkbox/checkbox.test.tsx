import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('renders with role checkbox', () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
  });

  it('toggles on click when uncontrolled (defaultChecked)', () => {
    render(<Checkbox aria-label="Accept terms" defaultChecked={false} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('respects the checked prop and fires onCheckedChange when controlled', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox aria-label="Accept terms" checked={false} onCheckedChange={onCheckedChange} />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    // Controlled: without the consumer updating `checked`, state doesn't change.
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('prevents toggling when disabled', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        aria-label="Accept terms"
        disabled
        defaultChecked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    fireEvent.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects checked state via data-checked/data-unchecked', () => {
    render(<Checkbox aria-label="Accept terms" defaultChecked={false} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toHaveAttribute('data-unchecked');
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('data-checked');
  });

  it('reflects the indeterminate prop via data-indeterminate and aria-checked="mixed"', () => {
    render(<Checkbox aria-label="Accept terms" indeterminate defaultChecked={false} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toHaveAttribute('data-indeterminate');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('merges a custom className with the base kairo-checkbox class', () => {
    render(<Checkbox aria-label="Accept terms" className="extra-class" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toHaveClass('kairo-checkbox');
    expect(checkbox).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying root element', () => {
    const ref = createRef<HTMLElement>();
    render(<Checkbox aria-label="Accept terms" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveAttribute('role', 'checkbox');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Checkbox aria-label="Accept terms" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
