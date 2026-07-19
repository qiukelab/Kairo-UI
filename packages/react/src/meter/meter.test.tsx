import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Side-effect import so the jest-dom matcher types are visible to `tsc`,
// which only type-checks `src` (the actual runtime wiring for both jest-dom
// and vitest-axe matchers lives in test/setup.ts; see also
// ../button/vitest-axe.d.ts for the vitest-axe matcher types).
import '@testing-library/jest-dom/vitest';
import { Meter, getMeterState } from './meter';

describe('Meter', () => {
  it('renders with role meter and the given value/min/max', () => {
    render(<Meter value={40} min={0} max={80} aria-label="Disk usage" />);
    const meter = screen.getByRole('meter', { name: 'Disk usage' });
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '80');
    expect(meter).toHaveAttribute('aria-valuenow', '40');
  });

  it('defaults min to 0 and max to 100', () => {
    render(<Meter value={25} aria-label="Disk usage" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps a value above max down to max', () => {
    render(<Meter value={150} max={100} aria-label="Disk usage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps a value below min up to min', () => {
    render(<Meter value={-20} min={0} aria-label="Disk usage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  });

  it('sets a default aria-valuetext as a rounded percentage of the range', () => {
    render(<Meter value={30} min={0} max={200} aria-label="Disk usage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '15%');
  });

  it('lets a consumer override aria-valuetext', () => {
    render(<Meter value={42} aria-valuetext="42 GB of 100 GB" aria-label="Disk usage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '42 GB of 100 GB');
  });

  it('defaults to data-state="optimum" when no low/high/optimum is given', () => {
    render(<Meter value={5} aria-label="Disk usage" />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'optimum');
  });

  describe('when optimum sits inside [low, high]', () => {
    // low=30, high=70, optimum=50: the middle band is "good", both tails are
    // equally "suboptimum" — this shape never produces "critical".
    const props = { min: 0, max: 100, low: 30, high: 70, optimum: 50 };

    it('is optimum at the low boundary', () => {
      render(<Meter value={30} {...props} aria-label="Score" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'optimum');
    });

    it('is optimum at the high boundary', () => {
      render(<Meter value={70} {...props} aria-label="Score" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'optimum');
    });

    it('is suboptimum just below the low boundary', () => {
      render(<Meter value={29} {...props} aria-label="Score" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'suboptimum');
    });

    it('is suboptimum just above the high boundary', () => {
      render(<Meter value={71} {...props} aria-label="Score" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'suboptimum');
    });

    it('never reaches critical, even at the extremes of the range', () => {
      render(<Meter value={0} {...props} aria-label="Score" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'suboptimum');
    });
  });

  describe('when optimum is below low (lower values are better)', () => {
    // e.g. disk usage: low=60, high=90, optimum=0.
    const props = { min: 0, max: 100, low: 60, high: 90, optimum: 0 };

    it('is optimum below the low boundary', () => {
      render(<Meter value={0} {...props} aria-label="Disk usage" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'optimum');
    });

    it('is optimum exactly at the low boundary', () => {
      render(<Meter value={60} {...props} aria-label="Disk usage" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'optimum');
    });

    it('is suboptimum just above the low boundary', () => {
      render(<Meter value={61} {...props} aria-label="Disk usage" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'suboptimum');
    });

    it('is suboptimum exactly at the high boundary', () => {
      render(<Meter value={90} {...props} aria-label="Disk usage" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'suboptimum');
    });

    it('is critical just above the high boundary', () => {
      render(<Meter value={91} {...props} aria-label="Disk usage" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'critical');
    });
  });

  describe('when optimum is above high (higher values are better)', () => {
    // e.g. password strength: low=30, high=70, optimum=100.
    const props = { min: 0, max: 100, low: 30, high: 70, optimum: 100 };

    it('is optimum above the high boundary', () => {
      render(<Meter value={100} {...props} aria-label="Password strength" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'optimum');
    });

    it('is optimum exactly at the high boundary', () => {
      render(<Meter value={70} {...props} aria-label="Password strength" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'optimum');
    });

    it('is suboptimum just below the high boundary', () => {
      render(<Meter value={69} {...props} aria-label="Password strength" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'suboptimum');
    });

    it('is suboptimum exactly at the low boundary', () => {
      render(<Meter value={30} {...props} aria-label="Password strength" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'suboptimum');
    });

    it('is critical just below the low boundary', () => {
      render(<Meter value={29} {...props} aria-label="Password strength" />);
      expect(screen.getByRole('meter')).toHaveAttribute('data-state', 'critical');
    });
  });

  describe('getMeterState', () => {
    it('exposes the same region algorithm the component uses internally', () => {
      expect(getMeterState(50, 30, 70, 50)).toBe('optimum');
      expect(getMeterState(60, 60, 90, 0)).toBe('optimum');
      expect(getMeterState(91, 60, 90, 0)).toBe('critical');
      expect(getMeterState(29, 30, 70, 100)).toBe('critical');
    });
  });

  it('merges a custom className with the base kairo-meter class', () => {
    render(<Meter value={40} className="extra-class" aria-label="Disk usage" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveClass('kairo-meter');
    expect(meter).toHaveClass('extra-class');
  });

  it('forwards the ref to the underlying div element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Meter value={40} ref={ref} aria-label="Disk usage" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('has no axe violations when properly labelled', async () => {
    const { container } = render(<Meter value={40} aria-label="Disk usage" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
