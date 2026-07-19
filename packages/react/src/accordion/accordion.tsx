'use client';

import { forwardRef } from 'react';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type {
  AccordionRootProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionPanelProps,
} from '@base-ui/react/accordion';

/**
 * Kairo's Accordion. Thin wrappers over Base UI's
 * `Accordion.Root`/`Item`/`Header`/`Trigger`/`Panel` anatomy — all
 * interaction and accessibility logic (`aria-expanded`/`aria-controls`
 * wiring between the trigger and its panel, `role="region"` on the panel,
 * single- vs. multiple-open items, controlled/uncontrolled value, and the
 * measured-height panel animation) comes from `@base-ui/react`. Kairo only
 * supplies the `.kairo-accordion-*` classes (plus a default chevron icon on
 * the trigger, and an inner padding wrapper around the panel's children — see
 * `AccordionPanel` below) so `@kairo-ui/theme` can style everything purely
 * off Base UI's data attributes.
 */

/*
 * The `any` default mirrors Base UI's own `AccordionRootProps<Value = any>`
 * signature verbatim. Narrowing it to `unknown` here would break assignability
 * for consumers: `onValueChange` is a function-typed property, so under
 * `strictFunctionTypes` a caller's `(value: string[]) => void` is not
 * assignable to `(value: unknown[]) => void`. Passing the type parameter
 * explicitly — `AccordionProps<string>` — recovers full type safety.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AccordionProps<Value = any> extends AccordionRootProps<Value> {}

/**
 * Groups the accordion's items. Renders Base UI's `Accordion.Root` (a
 * `<div>`). Only one item is open at a time by default — Base UI's
 * `multiple` prop defaults to `false`; pass `multiple` to allow several open
 * items at once.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { className, ...props },
  ref,
) {
  return (
    <BaseAccordion.Root
      ref={ref}
      className={className ? `kairo-accordion ${className}` : 'kairo-accordion'}
      {...props}
    />
  );
});

Accordion.displayName = 'Accordion';

export interface AccordionItemComponentProps extends AccordionItemProps {}

/**
 * A single section: an `AccordionHeader`/`AccordionTrigger` pair plus the
 * `AccordionPanel` it controls. Renders Base UI's `Accordion.Item` (a
 * `<div>`).
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemComponentProps>(
  function AccordionItem({ className, ...props }, ref) {
    return (
      <BaseAccordion.Item
        ref={ref}
        className={className ? `kairo-accordion-item ${className}` : 'kairo-accordion-item'}
        {...props}
      />
    );
  },
);

AccordionItem.displayName = 'AccordionItem';

export interface AccordionHeaderComponentProps extends AccordionHeaderProps {}

/**
 * The heading labeling an item's panel. Renders Base UI's `Accordion.Header`
 * (an `<h3>`) wrapping an `AccordionTrigger`.
 */
export const AccordionHeader = forwardRef<HTMLHeadingElement, AccordionHeaderComponentProps>(
  function AccordionHeader({ className, ...props }, ref) {
    return (
      <BaseAccordion.Header
        ref={ref}
        className={className ? `kairo-accordion-header ${className}` : 'kairo-accordion-header'}
        {...props}
      />
    );
  },
);

AccordionHeader.displayName = 'AccordionHeader';

export interface AccordionTriggerComponentProps extends AccordionTriggerProps {}

/**
 * A full-width button that opens and closes the corresponding
 * `AccordionPanel`. Renders Base UI's `Accordion.Trigger` (a `<button>`)
 * with `children` followed by a default chevron icon that rotates via CSS
 * off Base UI's `data-panel-open` attribute.
 */
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerComponentProps>(
  function AccordionTrigger({ className, children, ...props }, ref) {
    return (
      <BaseAccordion.Trigger
        ref={ref}
        className={className ? `kairo-accordion-trigger ${className}` : 'kairo-accordion-trigger'}
        {...props}
      >
        {children}
        <ChevronIcon />
      </BaseAccordion.Trigger>
    );
  },
);

AccordionTrigger.displayName = 'AccordionTrigger';

export interface AccordionPanelComponentProps extends AccordionPanelProps {}

/**
 * The collapsible region holding an item's content. Renders Base UI's
 * `Accordion.Panel` (a `<div>`, `role="region"`); its open/close height is
 * animated with a CSS `height` transition driven by Base UI's
 * `--accordion-panel-height` custom property, which the panel sets inline as
 * the measured pixel height (or `auto` once idle) — see `accordion.css`.
 *
 * `children` are wrapped in an internal, unstyled-by-Base-UI
 * `kairo-accordion-panel-content` `<div>` that carries the panel's visual
 * padding. This keeps the padding off the animated element itself: with
 * `box-sizing: border-box` (which `@kairo-ui/theme` applies to every
 * `kairo-*` element), an element's own padding puts a floor under how far its
 * `height` can collapse, so a padded panel would never fully reach `0` while
 * closing.
 */
export const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelComponentProps>(
  function AccordionPanel({ className, children, ...props }, ref) {
    return (
      <BaseAccordion.Panel
        ref={ref}
        className={className ? `kairo-accordion-panel ${className}` : 'kairo-accordion-panel'}
        {...props}
      >
        <div className="kairo-accordion-panel-content">{children}</div>
      </BaseAccordion.Panel>
    );
  },
);

AccordionPanel.displayName = 'AccordionPanel';

function ChevronIcon() {
  return (
    <svg
      className="kairo-accordion-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
