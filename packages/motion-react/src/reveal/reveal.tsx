'use client';

import { forwardRef, useMemo } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { transitions } from '../transitions';
import { shapes, type VariantName } from '../variants/shapes';

export interface RevealProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  // Dropped: Motion's `motion.div` redefines these four with gesture/
  // animation-lifecycle signatures incompatible with the native DOM
  // event handlers of the same name.
  'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
> {
  /** Which entrance shape to play. @default 'slideUp' */
  variant?: VariantName;
  /** Delay, in seconds, before the entrance transition starts. @default 0 */
  delay?: number;
  /**
   * Fraction of the element that must be visible before it reveals
   * (forwarded to Motion's `viewport.amount`). @default 0.3
   */
  amount?: number;
  /**
   * Whether the reveal plays only once, the first time it scrolls into
   * view (forwarded to Motion's `viewport.once`). @default true
   */
  once?: boolean;
}

/**
 * Animates its children in the first time they scroll into view, using
 * `whileInView` under the hood (`initial="hidden"`, `whileInView="visible"`,
 * `viewport={{ once, amount }}`).
 *
 * Renders a single `<div>`. When the user prefers reduced motion
 * (`useReducedMotion`), it renders its children immediately, visible and
 * untransformed, instead of animating.
 */
export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { variant = 'slideUp', delay = 0, amount = 0.3, once = true, className, children, ...props },
  ref,
) {
  const shouldReduceMotion = useReducedMotion();
  const shape = shapes[variant];

  // Built per-instance (rather than reusing the `variants` export) so
  // `delay` can be merged into the transition: a variant's own baked-in
  // `transition` fully overrides — rather than merges with — any
  // `transition` prop set on the component itself.
  const resolvedVariants: Variants = useMemo(
    () => ({
      hidden: shape.hidden,
      visible: { ...shape.visible, transition: { ...transitions.normal, delay } },
    }),
    [shape, delay],
  );

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={resolvedVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Reveal.displayName = 'Reveal';
