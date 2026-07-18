import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring lives in
// test/setup.ts).
import '@testing-library/jest-dom/vitest';
import { AnimatedNumber } from './animated-number';

describe('AnimatedNumber', () => {
  it('renders the formatted value on first paint', () => {
    render(<AnimatedNumber value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('applies a custom format function', () => {
    render(<AnimatedNumber value={0.5} format={(n) => `${Math.round(n * 100)}%`} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('animates to a new value when the value prop changes', async () => {
    const { rerender, container } = render(
      <AnimatedNumber value={0} transition={{ duration: 0.05 }} />,
    );
    expect(container).toHaveTextContent('0');

    rerender(<AnimatedNumber value={100} transition={{ duration: 0.05 }} />);

    await waitFor(() => expect(container).toHaveTextContent('100'), { timeout: 2000 });
  });

  it('merges a custom className with the rendered span', () => {
    render(<AnimatedNumber value={1} className="extra-class" />);
    expect(screen.getByText('1')).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying span element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<AnimatedNumber value={1} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
