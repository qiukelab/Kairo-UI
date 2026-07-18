'use client';

import { forwardRef, useEffect } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { SpringOptions } from 'motion/react';

const defaultFormatter = new Intl.NumberFormat();

function defaultFormat(value: number): string {
  return defaultFormatter.format(Math.round(value));
}

export interface AnimatedNumberProps
  extends Omit<
    ComponentPropsWithoutRef<'span'>,
    // Dropped: Motion's `motion.span` redefines these four with gesture/
    // animation-lifecycle signatures incompatible with the native DOM
    // event handlers of the same name.
    'children' | 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
  > {
  /** The numeric value to display, and spring-animate towards on change. */
  value: number;
  /**
   * Formats the (possibly mid-spring, fractional) number for display.
   * @default a locale-aware integer formatter (`Intl.NumberFormat`).
   */
  format?: (value: number) => string;
  /** Spring options controlling how the number animates between values. */
  transition?: SpringOptions;
}

/**
 * Spring-animates its displayed text between numeric `value`s — the kind of
 * interpolated, in-between-integers motion CSS transitions can't produce.
 *
 * Renders a single `<span>`. On first paint it shows `format(value)`
 * directly (no animation, SSR-safe); on later `value` changes it springs the
 * displayed number from the old value to the new one. When the user prefers
 * reduced motion (`useReducedMotion`), it skips the spring and snaps
 * straight to the formatted value instead.
 */
export const AnimatedNumber = forwardRef<HTMLSpanElement, AnimatedNumberProps>(function AnimatedNumber(
  { value, format = defaultFormat, transition, className, ...props },
  ref,
) {
  const shouldReduceMotion = useReducedMotion();
  // `useSpring(value, ...)` seeds the returned `MotionValue` with the first
  // render's `value` and wires it to spring towards whatever it's next
  // `.set()` to — it does NOT automatically track later changes to the
  // `value` argument itself, hence the effect below.
  const spring = useSpring(value, transition);
  const display = useTransform(spring, format);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (shouldReduceMotion) {
    return (
      <span ref={ref} className={className} {...props}>
        {format(value)}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className} {...props}>
      {display}
    </motion.span>
  );
});

AnimatedNumber.displayName = 'AnimatedNumber';
