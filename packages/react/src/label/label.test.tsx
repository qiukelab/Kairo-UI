import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Label } from './label';

describe('Label', () => {
  it('renders the given text content as a native label element', () => {
    render(<Label>Email address</Label>);
    const label = screen.getByText('Email address');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('associates with a control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email address</Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('associates with a wrapped control implicitly', () => {
    render(
      <Label>
        Email address
        <input />
      </Label>,
    );
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('merges a custom className with the base kairo-label class', () => {
    render(<Label className="extra-class">Email address</Label>);
    const label = screen.getByText('Email address');
    expect(label).toHaveClass('kairo-label');
    expect(label).toHaveClass('extra-class');
  });

  it('renders data-disabled when the disabled prop is true', () => {
    render(<Label disabled>Email address</Label>);
    const label = screen.getByText('Email address');
    expect(label).toHaveAttribute('data-disabled', 'true');
  });

  it('does not forward disabled as a raw DOM attribute', () => {
    render(<Label disabled>Email address</Label>);
    const label = screen.getByText('Email address');
    expect(label).not.toHaveAttribute('disabled');
  });

  it('forwards the ref to the underlying label element', () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Email address</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Label htmlFor="email">Email address</Label>
        <input id="email" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
