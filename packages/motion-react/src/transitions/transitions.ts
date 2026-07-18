import type { Transition } from 'motion/react';

/**
 * Motion `Transition` presets mirroring `@kairo-ui/theme`'s CSS motion
 * tokens (`--kairo-duration-*` / `--kairo-ease-*`, see
 * `packages/theme/css/tokens.css`) so JS-driven animations from this addon
 * stay in lockstep with Kairo's CSS-first components. Durations are the
 * token milliseconds converted to the seconds Motion's `duration` expects;
 * `ease` is the same cubic-bezier control points as the CSS custom
 * property, expressed as the 4-number array Motion's `ease` option accepts.
 */
export interface Transitions {
  /** Mirrors `--kairo-duration-fast` (150ms) + `--kairo-ease-standard`. */
  fast: Transition;
  /**
   * Mirrors `--kairo-duration-normal` (250ms) + `--kairo-ease-standard`.
   * The default transition baked into `variants`.
   */
  normal: Transition;
  /** Mirrors `--kairo-duration-slow` (400ms) + `--kairo-ease-standard`. */
  slow: Transition;
  /**
   * A physics-based spring standing in for `--kairo-ease-emphasized`, whose
   * overshoot-flavored curve doesn't translate to a fixed-duration tween as
   * cleanly as the other tokens — use this where an entrance/exit should
   * feel emphasized rather than merely timed.
   */
  emphasized: Transition;
}

export const transitions: Transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  normal: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  emphasized: { type: 'spring', stiffness: 300, damping: 30, mass: 1 },
};
