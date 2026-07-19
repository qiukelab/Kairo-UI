import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders with role="separator" by default', () => {
    render(<Separator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('defaults to orientation="horizontal"', () => {
    render(<Separator />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('reflects orientation="vertical" as data-orientation and aria-orientation', () => {
    render(<Separator orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('hides a decorative separator from the accessibility tree', () => {
    render(<Separator decorative data-testid="decorative-separator" />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    const separator = screen.getByTestId('decorative-separator');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    // Still carries the orientation as a data attribute for styling, even
    // though it no longer exposes ARIA separator semantics.
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).not.toHaveAttribute('role');
  });

  it('merges a custom className with the base kairo-separator class', () => {
    render(<Separator className="extra-class" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('kairo-separator');
    expect(separator).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no axe violations when used as a meaningful boundary inside a landmark', async () => {
    // A bare separator with nothing around it is a degenerate case for axe —
    // wrap it in a real landmark with content on both sides so the scan is
    // actually exercising the separator's semantics rather than trivially
    // passing on an empty document.
    const { container } = render(
      <main>
        <p>Section one</p>
        <Separator />
        <p>Section two</p>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
