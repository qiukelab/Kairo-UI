import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring lives in
// test/setup.ts).
import '@testing-library/jest-dom/vitest';
import { Reveal } from './reveal';

// jsdom has no `IntersectionObserver`, which Motion's `whileInView` needs at
// mount time — a minimal mock is installed in `test/setup.ts`.

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders a div by default', () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello').tagName).toBe('DIV');
  });

  it('accepts each built-in variant without throwing', () => {
    const names = ['fade', 'slideUp', 'slideDown', 'scale'] as const;
    for (const variant of names) {
      const { unmount } = render(<Reveal variant={variant}>{variant}</Reveal>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it('merges a custom className with the rendered element', () => {
    render(<Reveal className="extra-class">Hello</Reveal>);
    expect(screen.getByText('Hello')).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Reveal ref={ref}>Hello</Reveal>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
