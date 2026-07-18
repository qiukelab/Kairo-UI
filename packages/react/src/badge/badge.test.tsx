import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders the given text content', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('defaults to variant="solid" and intent="default"', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge).toHaveAttribute('data-variant', 'solid');
    expect(badge).toHaveAttribute('data-intent', 'default');
  });

  it('reflects the variant prop as data-variant', () => {
    render(<Badge variant="outline">New</Badge>);
    expect(screen.getByText('New')).toHaveAttribute('data-variant', 'outline');
  });

  it('reflects the intent prop as data-intent', () => {
    render(<Badge intent="success">New</Badge>);
    expect(screen.getByText('New')).toHaveAttribute('data-intent', 'success');
  });

  it('merges a custom className with the base kairo-badge class', () => {
    render(<Badge className="extra-class">New</Badge>);
    const badge = screen.getByText('New');
    expect(badge).toHaveClass('kairo-badge');
    expect(badge).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>New</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Badge>New</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
