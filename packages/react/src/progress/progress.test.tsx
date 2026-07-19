import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Progress } from './progress';

describe('Progress', () => {
  it('renders with role progressbar and the given value/max', () => {
    render(<Progress value={40} max={80} aria-label="Upload" />);
    const progress = screen.getByRole('progressbar', { name: 'Upload' });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '80');
    expect(progress).toHaveAttribute('aria-valuenow', '40');
  });

  it('defaults max to 100', () => {
    render(<Progress value={25} aria-label="Upload" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps a value above max down to max', () => {
    render(<Progress value={150} max={100} aria-label="Upload" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps a negative value up to 0', () => {
    render(<Progress value={-20} max={100} aria-label="Upload" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders as indeterminate with aria-valuenow absent when value is null', () => {
    render(<Progress value={null} aria-label="Upload" />);
    const progress = screen.getByRole('progressbar', { name: 'Upload' });
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('data-indeterminate');
  });

  it('is indeterminate by default when no value is passed', () => {
    render(<Progress aria-label="Upload" />);
    const progress = screen.getByRole('progressbar', { name: 'Upload' });
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('data-indeterminate');
  });

  it('does not set data-indeterminate for a determinate value', () => {
    render(<Progress value={40} aria-label="Upload" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('data-indeterminate');
  });

  it('derives the accessible name from a string label when no aria-label is passed', () => {
    render(<Progress value={40} label="Uploading files" />);
    expect(screen.getByRole('progressbar', { name: 'Uploading files' })).toBeInTheDocument();
  });

  it('renders a visible value readout when showValueLabel is set', () => {
    render(<Progress value={40} label="Uploading" showValueLabel aria-label="Uploading" />);
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('does not render a value readout while indeterminate', () => {
    render(<Progress value={null} showValueLabel aria-label="Uploading" />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('merges a custom className with the base kairo-progress class', () => {
    render(<Progress value={40} className="extra-class" aria-label="Upload" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveClass('kairo-progress');
    expect(progress).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress value={40} ref={ref} aria-label="Upload" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no axe violations when properly labelled', async () => {
    const { container } = render(<Progress value={40} label="Uploading files" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
