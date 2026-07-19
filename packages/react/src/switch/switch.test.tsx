import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also ./vitest-axe.d.ts
// for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Switch } from './switch';

describe('Switch', () => {
  it('renders with role switch', () => {
    render(<Switch aria-label="Airplane mode" />);
    expect(screen.getByRole('switch', { name: 'Airplane mode' })).toBeInTheDocument();
  });

  it('toggles on click when uncontrolled (defaultChecked)', () => {
    render(<Switch aria-label="Airplane mode" defaultChecked={false} />);
    const toggle = screen.getByRole('switch', { name: 'Airplane mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('respects the checked prop and fires onCheckedChange when controlled', () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Airplane mode" checked={false} onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole('switch', { name: 'Airplane mode' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    // Controlled: without the consumer updating `checked`, state doesn't change.
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('prevents toggling when disabled', () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        aria-label="Airplane mode"
        disabled
        defaultChecked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const toggle = screen.getByRole('switch', { name: 'Airplane mode' });
    fireEvent.click(toggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects checked state via data-checked/data-unchecked', () => {
    render(<Switch aria-label="Airplane mode" defaultChecked={false} />);
    const toggle = screen.getByRole('switch', { name: 'Airplane mode' });
    expect(toggle).toHaveAttribute('data-unchecked');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('data-checked');
  });

  it('merges a custom className with the base kairo-switch class', () => {
    render(<Switch aria-label="Airplane mode" className="extra-class" />);
    const toggle = screen.getByRole('switch', { name: 'Airplane mode' });
    expect(toggle).toHaveClass('kairo-switch');
    expect(toggle).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying root element', () => {
    const ref = createRef<HTMLElement>();
    render(<Switch aria-label="Airplane mode" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveAttribute('role', 'switch');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Switch aria-label="Airplane mode" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
