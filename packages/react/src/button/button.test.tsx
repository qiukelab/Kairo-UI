import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also ./vitest-axe.d.ts
// for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders with role button and an accessible name', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('defaults to variant="solid" and size="md"', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveAttribute('data-variant', 'solid');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('reflects the variant prop as data-variant', () => {
    render(<Button variant="outline">Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveAttribute(
      'data-variant',
      'outline',
    );
  });

  it('reflects the size prop as data-size', () => {
    render(<Button size="lg">Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveAttribute('data-size', 'lg');
  });

  it('merges a custom className with the base kairo-btn class', () => {
    render(<Button className="extra-class">Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('kairo-btn');
    expect(button).toHaveClass('extra-class');
  });

  it('prevents onClick from firing when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards the ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('defaults to type="button"', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveAttribute('type', 'button');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
