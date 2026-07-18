import type { Variants } from 'motion/react';
import { transitions } from '../transitions';
import { shapes, type VariantName } from './shapes';

function withTransition(shape: (typeof shapes)[VariantName]): Variants {
  return {
    hidden: shape.hidden,
    visible: { ...shape.visible, transition: transitions.normal },
  };
}

/**
 * Reusable Motion `Variants` with `hidden`/`visible` states, token-consistent
 * (each uses `transitions.normal` by default) and ready to drop onto any
 * `motion.*` element's `variants` prop alongside `initial`/`animate` (or
 * `whileInView`, as `<Reveal>` does).
 *
 * ```tsx
 * import { motion } from 'motion/react';
 * import { variants } from '@kairo-ui/motion-react/variants';
 *
 * <motion.div initial="hidden" animate="visible" variants={variants.fade} />
 * ```
 */
export const variants: Record<VariantName, Variants> = {
  fade: withTransition(shapes.fade),
  slideUp: withTransition(shapes.slideUp),
  slideDown: withTransition(shapes.slideDown),
  scale: withTransition(shapes.scale),
};

export type { VariantName };
