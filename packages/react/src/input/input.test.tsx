import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders with role textbox', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('defaults to type="text"', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('type', 'text');
  });

  it('accepts a custom type', () => {
    render(<Input type="email" aria-label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('updates the value on change', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.change(input, { target: { value: 'Ada' } });
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('Ada');
  });

  it('respects the disabled attribute', () => {
    render(<Input aria-label="Name" disabled />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
  });

  it('reflects aria-invalid', () => {
    render(<Input aria-label="Name" aria-invalid="true" />);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('merges a custom className with the base kairo-input class', () => {
    render(<Input aria-label="Name" className="extra-class" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveClass('kairo-input');
    expect(input).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Input aria-label="Name" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
