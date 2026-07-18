import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders with role status and a default accessible name', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('accepts a custom aria-label', () => {
    render(<Spinner aria-label="Loading results" />);
    expect(screen.getByRole('status', { name: 'Loading results' })).toBeInTheDocument();
  });

  it('defaults to size="md"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'md');
  });

  it('reflects the size prop as data-size', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'lg');
  });

  it('merges a custom className with the base kairo-spinner class', () => {
    render(<Spinner className="extra-class" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('kairo-spinner');
    expect(spinner).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
