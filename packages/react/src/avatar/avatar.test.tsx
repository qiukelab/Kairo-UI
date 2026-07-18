import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Avatar } from './avatar';

describe('Avatar', () => {
  it('renders the fallback when no src is provided', () => {
    render(<Avatar alt="Jane Doe" fallback="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows fallback text when no src is provided (image never mounts)', () => {
    render(<Avatar alt="Jane Doe" fallback="JD" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('defaults to size="md" and reflects the size prop as data-size', () => {
    const { rerender, container } = render(<Avatar fallback="JD" />);
    expect(container.firstChild).toHaveAttribute('data-size', 'md');
    rerender(<Avatar fallback="JD" size="lg" />);
    expect(container.firstChild).toHaveAttribute('data-size', 'lg');
  });

  it('merges a custom className with the base kairo-avatar class', () => {
    const { container } = render(<Avatar fallback="JD" className="extra-class" />);
    expect(container.firstChild).toHaveClass('kairo-avatar');
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying root element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar fallback="JD" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Avatar alt="Jane Doe" fallback="JD" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
