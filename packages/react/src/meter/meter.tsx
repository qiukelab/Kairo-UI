import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

/**
 * Where `value` falls relative to the `low`/`high`/`optimum` boundaries.
 * Exposed as `data-state` so `@kairo-ui/theme` can tint the indicator without
 * the consumer passing a color.
 */
export type MeterState = 'optimum' | 'suboptimum' | 'critical';

export interface MeterProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value of the meter. Clamped to the `[min, max]` range. */
  value: number;
  /** Minimum value of the range. @default 0 */
  min?: number;
  /** Maximum value of the range. @default 100 */
  max?: number;
  /**
   * Boundary below which `value` is considered too low to be optimal.
   * @default min
   */
  low?: number;
  /**
   * Boundary above which `value` is considered too high to be optimal.
   * @default max
   */
  high?: number;
  /**
   * The most desirable value in the range. Its position relative to
   * `low`/`high` decides which side of the range counts as "good" — see
   * {@link getMeterState}. @default the midpoint between `min` and `max`
   */
  optimum?: number;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Derives the gauge's `data-state` for a value given `low`/`high`/`optimum`
 * boundaries, following the HTML `<meter>` element's region algorithm
 * (https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element):
 *
 *  - If `optimum` sits inside `[low, high]`, that range IS the "good" zone:
 *    values inside it are `'optimum'`, values on either side are equally
 *    `'suboptimum'` — this shape never produces `'critical'`.
 *  - If `optimum` is below `low`, smaller values are better: `[min, low]` is
 *    `'optimum'`, `(low, high]` is `'suboptimum'`, and anything past `high` is
 *    `'critical'`.
 *  - If `optimum` is above `high`, larger values are better, mirroring the
 *    case above.
 *
 * `low`/`high` are assumed to already be clamped into `[min, max]` with
 * `low <= high`.
 */
export function getMeterState(value: number, low: number, high: number, optimum: number): MeterState {
  if (optimum >= low && optimum <= high) {
    return value >= low && value <= high ? 'optimum' : 'suboptimum';
  }
  if (optimum < low) {
    if (value <= low) return 'optimum';
    return value <= high ? 'suboptimum' : 'critical';
  }
  // optimum > high
  if (value >= high) return 'optimum';
  return value >= low ? 'suboptimum' : 'critical';
}

/**
 * Kairo's base Meter. A static, RSC-safe gauge for a known, bounded quantity
 * (disk usage, password strength, storage quota) — plain `<div>`s styled via
 * `.kairo-meter` from `@kairo-ui/theme`, with no interaction and therefore no
 * client boundary.
 *
 * This is deliberately NOT a wrapper over `@base-ui/react/meter`: every Base
 * UI primitive is itself a client component, so wrapping one would drag a
 * `'use client'` boundary into RSC trees for a widget that never needs to
 * respond to input.
 *
 * Meter is not Progress: a `progressbar` communicates a task advancing
 * toward completion (and can be indeterminate); a `meter` communicates where
 * a static value sits inside a known range, optionally with a notion of
 * "good"/"bad" regions via `low`/`high`/`optimum`. Follows the WAI-ARIA
 * `meter` pattern — `role="meter"` plus `aria-valuemin`/`aria-valuemax`/
 * `aria-valuenow`, and `aria-valuetext` for a human-readable readout (default:
 * the value's position in the range as a rounded percentage; pass your own
 * `aria-valuetext` to describe it differently, e.g. `"42 GB of 100 GB"`).
 * Like the native `<meter>` element, a meter always needs an accessible name —
 * pass `aria-label` or `aria-labelledby`.
 *
 * `low`/`high`/`optimum` are resolved through {@link getMeterState} into a
 * `data-state` of `'optimum' | 'suboptimum' | 'critical'`, which
 * `@kairo-ui/theme` maps to `--kairo-success`/`--kairo-warning`/
 * `--kairo-danger` so the fill tints itself without the consumer passing a
 * color. Without `low`/`high`/`optimum`, the whole range counts as "good" —
 * matching the native element's default — so the indicator renders in the
 * `'optimum'` tint.
 *
 * The fill width is communicated to CSS via the `--kairo-meter-value` custom
 * property (read by `.kairo-meter-indicator`) rather than an inline `width`.
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 100,
    low,
    high,
    optimum,
    className,
    'aria-valuetext': ariaValueText,
    ...props
  },
  ref,
) {
  const safeMax = max > min ? max : min;
  const clampedValue = clamp(value, min, safeMax);
  const range = safeMax - min;
  const percentage = range > 0 ? ((clampedValue - min) / range) * 100 : 0;

  // Clamp low/high into range and guard against an inverted pair so the
  // region algorithm never sees `low > high`.
  const rawLow = clamp(low ?? min, min, safeMax);
  const rawHigh = clamp(high ?? safeMax, min, safeMax);
  const resolvedLow = Math.min(rawLow, rawHigh);
  const resolvedHigh = Math.max(rawLow, rawHigh);
  const resolvedOptimum = clamp(optimum ?? (min + safeMax) / 2, min, safeMax);

  const state = getMeterState(clampedValue, resolvedLow, resolvedHigh, resolvedOptimum);
  const defaultValueText = `${Math.round(percentage)}%`;

  return (
    <div
      ref={ref}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={safeMax}
      aria-valuenow={clampedValue}
      aria-valuetext={ariaValueText ?? defaultValueText}
      data-state={state}
      className={className ? `kairo-meter ${className}` : 'kairo-meter'}
      {...props}
    >
      <div className="kairo-meter-track">
        <div
          className="kairo-meter-indicator"
          style={{ '--kairo-meter-value': `${percentage}%` } as CSSProperties}
        />
      </div>
    </div>
  );
});

Meter.displayName = 'Meter';
