'use client';

import { forwardRef } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type {
  TooltipRootProps,
  TooltipPositionerProps,
  TooltipPortalProps,
} from '@base-ui/react/tooltip';
import { useKairoLocale } from '../i18n/use-kairo-messages';

export interface TooltipProps extends Omit<TooltipRootProps, 'children'> {
  /**
   * The trigger element. Base UI's `Tooltip.Trigger` renders this element
   * directly (via its `render` prop) and merges the hover/focus interaction
   * handlers onto it — no extra DOM wrapper is introduced around it.
   */
  children: ReactElement;
  /** The tooltip popup's content. */
  content: ReactNode;
  /** Which side of the trigger to render the popup against. @default 'top' */
  side?: TooltipPositionerProps['side'];
  /** How to align the popup relative to `side`. @default 'center' */
  align?: TooltipPositionerProps['align'];
  /** Distance in pixels between the trigger and the popup. @default 8 */
  sideOffset?: TooltipPositionerProps['sideOffset'];
  /** How long to wait before opening the tooltip, in ms. @default 600 */
  delay?: number;
  /** How long to wait before closing the tooltip, in ms. @default 0 */
  closeDelay?: number;
  /** Merged with the base `kairo-tooltip-popup` class on the popup element. */
  className?: string;
  /**
   * A parent element to render the popup's portal into, instead of the
   * default `document.body`. Needed to portal into a shadow DOM, an iframe,
   * or the currently active fullscreen element, where `document.body` isn't
   * reachable or isn't the right paint target.
   */
  container?: TooltipPortalProps['container'];
}

/**
 * Kairo's Tooltip. A convenience wrapper over Base UI's
 * `Tooltip.Root`/`Trigger`/`Portal`/`Positioner`/`Popup` anatomy — pass the
 * trigger as `children` and the popup contents as `content`. All interaction
 * and accessibility logic (hover/focus open, Escape/outside-press dismissal,
 * delay timing) comes from `@base-ui/react`. Kairo only supplies the
 * `.kairo-tooltip-popup` class so `@kairo-ui/theme` can style it purely off
 * the `data-starting-style`/`data-ending-style`/`data-open`/`data-closed`
 * attributes Base UI puts on the popup.
 *
 * `Tooltip.Root` groups the parts without a `TooltipProvider` fine for a
 * single tooltip; wrap a subtree once in the exported `TooltipProvider` if
 * you render many tooltips and want adjacent ones to share open/close delay
 * timing (so hovering from one trigger to the next opens instantly).
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it.
 */
export const Tooltip = forwardRef<HTMLButtonElement, TooltipProps>(function Tooltip(
  {
    children,
    content,
    side = 'top',
    align = 'center',
    sideOffset = 8,
    delay,
    closeDelay,
    className,
    container,
    ...rootProps
  },
  ref,
) {
  const locale = useKairoLocale();
  return (
    <BaseTooltip.Root {...rootProps}>
      <BaseTooltip.Trigger ref={ref} render={children} delay={delay} closeDelay={closeDelay} />
      <BaseTooltip.Portal container={container}>
        <BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset}>
          <BaseTooltip.Popup
            lang={locale}
            className={className ? `kairo-tooltip-popup ${className}` : 'kairo-tooltip-popup'}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
});

Tooltip.displayName = 'Tooltip';

/**
 * Groups multiple `Tooltip`s so they share open/close delay timing — once one
 * tooltip has opened, adjacent tooltips within the provider open instantly
 * while the group stays "active". Wrap your app (or a section of it) in this
 * once; it is not required for a single, standalone `Tooltip`.
 */
export const TooltipProvider = BaseTooltip.Provider;
