'use client';

import { forwardRef } from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type {
  CollapsibleRootProps,
  CollapsibleTriggerProps,
  CollapsiblePanelProps,
} from '@base-ui/react/collapsible';

export interface CollapsibleProps extends CollapsibleRootProps {}
export interface CollapsibleTriggerComponentProps extends CollapsibleTriggerProps {}
export interface CollapsiblePanelComponentProps extends CollapsiblePanelProps {}

/**
 * Kairo's Collapsible — a single trigger that shows/hides a single panel.
 * Thin wrappers over Base UI's `Collapsible.Root`/`Trigger`/`Panel` anatomy —
 * all interaction and accessibility logic (open/closed state, `aria-expanded`/
 * `aria-controls` wiring on the trigger, and the measured panel height
 * exposed as the `--collapsible-panel-height` CSS custom property during the
 * open/close transition) comes from `@base-ui/react`. Kairo only supplies the
 * `kairo-collapsible-*` classes (plus the height-transition CSS) so
 * `@kairo-ui/theme` can style everything purely off Base UI's data
 * attributes.
 *
 * Deliberately unopinionated, unlike `Accordion`: this is the primitive to
 * reach for when building custom disclosure UI around a single panel.
 * `Accordion` is the bordered, multi-item sibling built on this same Base UI
 * anatomy for a set of collapsible sections; reach for it instead of
 * composing several `Collapsible`s when that's the shape you need.
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { className, ...props },
  ref,
) {
  return (
    <BaseCollapsible.Root
      ref={ref}
      className={className ? `kairo-collapsible ${className}` : 'kairo-collapsible'}
      {...props}
    />
  );
});

Collapsible.displayName = 'Collapsible';

/** A button that opens and closes the panel. Renders a native `<button>`. */
export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerComponentProps>(
  function CollapsibleTrigger({ className, ...props }, ref) {
    return (
      <BaseCollapsible.Trigger
        ref={ref}
        className={
          className ? `kairo-collapsible-trigger ${className}` : 'kairo-collapsible-trigger'
        }
        {...props}
      />
    );
  },
);

CollapsibleTrigger.displayName = 'CollapsibleTrigger';

/**
 * The panel shown/hidden by the trigger. Unmounted from the DOM while closed
 * by default — pass `keepMounted` to keep it in the DOM (hidden via the
 * `hidden` attribute) instead.
 */
export const CollapsiblePanel = forwardRef<HTMLDivElement, CollapsiblePanelComponentProps>(
  function CollapsiblePanel({ className, ...props }, ref) {
    return (
      <BaseCollapsible.Panel
        ref={ref}
        className={className ? `kairo-collapsible-panel ${className}` : 'kairo-collapsible-panel'}
        {...props}
      />
    );
  },
);

CollapsiblePanel.displayName = 'CollapsiblePanel';
