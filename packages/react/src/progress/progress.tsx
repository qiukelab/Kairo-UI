import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Current progress value. `null` renders an indeterminate progress bar —
   * use it when the task's completion percentage isn't knowable yet (e.g. a
   * request is in flight but hasn't reported any progress).
   * @default null
   */
  value?: number | null;
  /** The value that represents 100% completion. @default 100 */
  max?: number;
  /**
   * Optional visible caption rendered above the bar. If it's a plain string
   * and no explicit `aria-label`/`aria-labelledby` is passed, it also becomes
   * the progress bar's accessible name — pass `aria-label`/`aria-labelledby`
   * yourself if the accessible name needs to differ from the visible text,
   * or if the label is already rendered elsewhere on the page.
   */
  label?: ReactNode;
  /**
   * Render a numeric value readout (e.g. `"40%"`) alongside the label. Marked
   * `aria-hidden` since the value is already exposed to assistive tech via
   * `aria-valuenow`. Ignored while indeterminate. @default false
   */
  showValueLabel?: boolean;
}

/**
 * Kairo's base Progress. A static, RSC-safe task-completion indicator —
 * plain `<div>`s styled via `.kairo-progress` from `@kairo-ui/theme`, with no
 * interaction and therefore no client boundary.
 *
 * Follows the WAI-ARIA `progressbar` pattern
 * (https://www.w3.org/WAI/ARIA/apg/patterns/meter/ shares the same range
 * widget shape; progressbar specifics: `role="progressbar"` plus
 * `aria-valuemin`/`aria-valuemax`/`aria-valuenow`): `aria-valuenow` is
 * clamped to `[0, max]` when `value` is a number, and is **omitted entirely**
 * (not set to `0`) when `value` is `null`, which is how a screen reader
 * distinguishes "0% complete" from "completion unknown".
 *
 * The fill width is communicated to CSS via the `--kairo-progress-value`
 * custom property (read by `.kairo-progress-indicator`) rather than an
 * inline `width`, and the indeterminate state is exposed as `data-indeterminate`
 * so `@kairo-ui/theme` can key its own looping keyframe animation off the DOM
 * alone. That animation is neutralized under `prefers-reduced-motion` by the
 * global rule in `base.css` scoped to `[class*="kairo-"]` — no extra handling
 * needed here.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = null,
    max = 100,
    label,
    showValueLabel = false,
    className,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const safeMax = max > 0 ? max : 100;
  const indeterminate = value == null;
  const clampedValue = indeterminate ? null : Math.min(Math.max(value, 0), safeMax);
  const percentage = clampedValue === null ? null : (clampedValue / safeMax) * 100;
  const valueText = percentage === null ? null : `${Math.round(percentage)}%`;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clampedValue ?? undefined}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      data-indeterminate={indeterminate || undefined}
      className={className ? `kairo-progress ${className}` : 'kairo-progress'}
      {...props}
    >
      {label !== undefined || (showValueLabel && valueText !== null) ? (
        <div className="kairo-progress-label">
          {label !== undefined ? <span>{label}</span> : null}
          {showValueLabel && valueText !== null ? (
            <span aria-hidden="true">{valueText}</span>
          ) : null}
        </div>
      ) : null}
      <div className="kairo-progress-track">
        <div
          className="kairo-progress-indicator"
          style={
            percentage === null
              ? undefined
              : ({ '--kairo-progress-value': `${percentage}%` } as CSSProperties)
          }
        />
      </div>
    </div>
  );
});

Progress.displayName = 'Progress';
