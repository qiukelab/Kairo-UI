'use client';

import { forwardRef } from 'react';
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import type { FieldsetRootProps, FieldsetLegendProps } from '@base-ui/react/fieldset';

/**
 * Kairo's Fieldset (groups related fields under a shared caption). Thin
 * wrappers over Base UI's `Fieldset.Root`/`Legend` anatomy — associating the
 * legend's id to the fieldset via `aria-labelledby`, and propagating
 * `disabled` down through context to any nested Kairo `Field`s — comes from
 * `@base-ui/react`. Kairo only supplies the `kairo-fieldset`/
 * `kairo-fieldset-legend` classes so `@kairo-ui/theme` can style everything
 * purely off Base UI's data attributes.
 *
 * `Fieldset` renders a native `<fieldset>` element, so setting `disabled`
 * natively disables every focusable control nested inside it (buttons,
 * inputs, selects, …) — no extra wiring is needed on each control, and this
 * holds even for controls Kairo doesn't know about.
 */
export interface FieldsetComponentProps extends FieldsetRootProps {}

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetComponentProps>(function Fieldset(
  { className, ...props },
  ref,
) {
  return (
    <BaseFieldset.Root
      ref={ref}
      className={className ? `kairo-fieldset ${className}` : 'kairo-fieldset'}
      {...props}
    />
  );
});

Fieldset.displayName = 'Fieldset';

export interface FieldsetLegendComponentProps extends FieldsetLegendProps {}

/**
 * The fieldset's caption. Renders a plain `<div>`, not a native `<legend>` —
 * this is Base UI's own design choice (see the doc comment on `.kairo-fieldset-legend`
 * in `@kairo-ui/theme`'s `fieldset.css` for why), and it's associated back to
 * the `Fieldset` for assistive tech via `aria-labelledby` rather than the
 * native fieldset/legend pairing. Must be a direct child of `Fieldset` (or
 * nested only inside plain wrapper elements) for that association to be set
 * up correctly.
 */
export const FieldsetLegend = forwardRef<HTMLDivElement, FieldsetLegendComponentProps>(
  function FieldsetLegend({ className, ...props }, ref) {
    return (
      <BaseFieldset.Legend
        ref={ref}
        className={className ? `kairo-fieldset-legend ${className}` : 'kairo-fieldset-legend'}
        {...props}
      />
    );
  },
);

FieldsetLegend.displayName = 'FieldsetLegend';
