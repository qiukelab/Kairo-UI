import type { Target } from 'motion/react';

/**
 * The four entrance shapes Kairo ships, kept transition-less here so both
 * `variants` (below) and `<Reveal>` can attach their own `transition`.
 *
 * This split matters: Motion's `variants` resolve a target's own baked-in
 * `transition` in place of (not merged with) any `transition` prop set on
 * the component — see `resolveTransition` in `motion-dom`. `<Reveal>` needs
 * to merge in a per-instance `delay`, so it builds its `Variants` object
 * from these raw shapes rather than from the already-`transition`-attached
 * `variants` export.
 */
export const shapes = {
  fade: {
    hidden: { opacity: 0 } as Target,
    visible: { opacity: 1 } as Target,
  },
  slideUp: {
    hidden: { opacity: 0, y: 16 } as Target,
    visible: { opacity: 1, y: 0 } as Target,
  },
  slideDown: {
    hidden: { opacity: 0, y: -16 } as Target,
    visible: { opacity: 1, y: 0 } as Target,
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 } as Target,
    visible: { opacity: 1, scale: 1 } as Target,
  },
};

/** The names of Kairo's built-in entrance variants. */
export type VariantName = keyof typeof shapes;
