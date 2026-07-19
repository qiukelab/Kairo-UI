'use client';

import { forwardRef } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverPopupProps,
  PopoverPositionerProps,
  PopoverPortalProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
  PopoverArrowProps,
} from '@base-ui/react/popover';
import { useKairoLocale } from '../i18n/use-kairo-messages';

export interface PopoverProps extends PopoverRootProps {}

/**
 * Kairo's Popover. Thin wrappers over Base UI's
 * `Popover.Root`/`Trigger`/`Portal`/`Positioner`/`Popup`/`Title`/
 * `Description`/`Close`/`Arrow` anatomy — all interaction and accessibility
 * logic (click/hover/focus open, Escape/outside-press dismissal, anchored
 * positioning, `role="dialog"`, `aria-labelledby`/`aria-describedby` wiring)
 * comes from `@base-ui/react`. Kairo only supplies the
 * `.kairo-popover-popup`/`.kairo-popover-arrow` classes (via `PopoverContent`/
 * `PopoverArrow`, below) so `@kairo-ui/theme` can style them purely off Base
 * UI's `data-starting-style`/`data-ending-style`/`data-open`/`data-closed`
 * attributes.
 *
 * `Popover.Root` renders no DOM element of its own, so it's re-exported as-is.
 */
export const Popover = BasePopover.Root;

export interface PopoverTriggerComponentProps extends PopoverTriggerProps {}

/**
 * A button that opens the popover. Renders a native `<button>` (or composes
 * with another element via its `render` prop).
 */
export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerComponentProps>(
  function PopoverTrigger({ className, ...props }, ref) {
    return (
      <BasePopover.Trigger
        ref={ref}
        className={className ? `kairo-popover-trigger ${className}` : 'kairo-popover-trigger'}
        {...props}
      />
    );
  },
);

PopoverTrigger.displayName = 'PopoverTrigger';

export interface PopoverContentProps extends PopoverPopupProps {
  /** Which side of the trigger to render the popup against. @default 'bottom' */
  side?: PopoverPositionerProps['side'];
  /** How to align the popup relative to `side`. @default 'center' */
  align?: PopoverPositionerProps['align'];
  /** Distance in pixels between the trigger and the popup. @default 8 */
  sideOffset?: PopoverPositionerProps['sideOffset'];
  /**
   * A parent element to render the popup's portal into, instead of the
   * default `document.body`. Needed to portal into a shadow DOM, an iframe,
   * or the currently active fullscreen element, where `document.body` isn't
   * reachable or isn't the right paint target.
   */
  container?: PopoverPortalProps['container'];
}

/**
 * Composes Base UI's `Popover.Portal` > `Popover.Positioner` + `Popover.Popup`
 * so consumers write less: `<PopoverContent>` renders the anchored popup in
 * one go. The forwarded ref attaches to the popup element. Place a
 * `<PopoverArrow>` among its children to render a pointer back to the
 * trigger (Base UI positions it correctly regardless of nesting depth inside
 * the popup, since absolutely-positioned elements resolve their containing
 * block to the nearest positioned ancestor — the Positioner).
 *
 * Base UI's `Popover.Popup` sets `role="dialog"` and wires
 * `aria-labelledby`/`aria-describedby` to any `PopoverTitle`/
 * `PopoverDescription` rendered inside automatically.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    { className, children, side = 'bottom', align = 'center', sideOffset = 8, container, ...props },
    ref,
  ) {
    const locale = useKairoLocale();
    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset}>
          <BasePopover.Popup
            ref={ref}
            lang={locale}
            className={className ? `kairo-popover-popup ${className}` : 'kairo-popover-popup'}
            {...props}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

PopoverContent.displayName = 'PopoverContent';

export interface PopoverTitleComponentProps extends PopoverTitleProps {}

/** A heading that labels the popover. Renders an `<h2>` element. */
export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleComponentProps>(
  function PopoverTitle({ className, ...props }, ref) {
    return (
      <BasePopover.Title
        ref={ref}
        className={className ? `kairo-popover-title ${className}` : 'kairo-popover-title'}
        {...props}
      />
    );
  },
);

PopoverTitle.displayName = 'PopoverTitle';

export interface PopoverDescriptionComponentProps extends PopoverDescriptionProps {}

/** A paragraph with additional information about the popover. Renders a `<p>` element. */
export const PopoverDescription = forwardRef<HTMLParagraphElement, PopoverDescriptionComponentProps>(
  function PopoverDescription({ className, ...props }, ref) {
    return (
      <BasePopover.Description
        ref={ref}
        className={className ? `kairo-popover-description ${className}` : 'kairo-popover-description'}
        {...props}
      />
    );
  },
);

PopoverDescription.displayName = 'PopoverDescription';

export interface PopoverCloseComponentProps extends PopoverCloseProps {}

/** A button that closes the popover. Renders a native `<button>` element. */
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseComponentProps>(
  function PopoverClose({ className, ...props }, ref) {
    return (
      <BasePopover.Close
        ref={ref}
        className={className ? `kairo-popover-close ${className}` : 'kairo-popover-close'}
        {...props}
      />
    );
  },
);

PopoverClose.displayName = 'PopoverClose';

export interface PopoverArrowComponentProps extends PopoverArrowProps {}

/**
 * An optional pointer rendered between the popup and its trigger. Place it
 * among `PopoverContent`'s children; Base UI positions it automatically via
 * inline styles, and `@kairo-ui/theme` draws the rotated-square pointer,
 * orienting its visible edges off the `data-side` attribute Base UI sets on
 * it.
 */
export const PopoverArrow = forwardRef<HTMLDivElement, PopoverArrowComponentProps>(
  function PopoverArrow({ className, ...props }, ref) {
    return (
      <BasePopover.Arrow
        ref={ref}
        className={className ? `kairo-popover-arrow ${className}` : 'kairo-popover-arrow'}
        {...props}
      />
    );
  },
);

PopoverArrow.displayName = 'PopoverArrow';
