'use client';

import { createContext, forwardRef, useContext } from 'react';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type {
  DrawerRootProps,
  DrawerTriggerProps,
  DrawerPopupProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
  DrawerCloseProps,
} from '@base-ui/react/drawer';
import { useKairoLocale } from '../i18n/use-kairo-messages';

/**
 * Which edge of the viewport a `Drawer` is pinned to and slides in from.
 *
 * Base UI's Drawer (verified against `@base-ui/react@1.6.0`'s installed
 * types/source, not assumed) has no "side"/"placement" prop of its own —
 * only `swipeDirection` (default `'down'`), which names the *dismiss
 * gesture's* axis, not a resting position. Base UI's own docs put layout
 * entirely on the consumer: "Positioning is handled by your styles." So
 * `side` is Kairo's own addition, and it drives two independent things:
 *   - Kairo's own `data-side` attribute on the popup (read by
 *     `@kairo-ui/theme` — see `drawer.css` — to position/size/animate it;
 *     deliberately decoupled from Base UI's gesture internals);
 *   - Base UI's `swipeDirection`, mapped from `side` (see
 *     `SWIPE_DIRECTION_BY_SIDE` below — the two enums don't share names, e.g.
 *     `side="top"` needs `swipeDirection="up"`), so swiping the panel back
 *     toward the edge it rests against is what dismisses it.
 * `'left'`/`'right'` are treated as logical `inline-start`/`inline-end`
 * (see `drawer.css`'s header comment for the exact RTL strategy), so they
 * flip under `dir="rtl"`; `'top'`/`'bottom'` are block sides and unaffected
 * by text direction.
 */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

const DrawerSideContext = createContext<DrawerSide>('right');

/**
 * Base UI's `swipeDirection` names an axis of travel (`'up' | 'down' | 'left'
 * | 'right'`), not an edge, so it can't just be handed a {@link DrawerSide}
 * as-is (`'top'`/`'bottom'` in particular have no `SwipeDirection`
 * counterpart of the same name). This maps each side to the direction that
 * swipes the panel back toward the edge it's pinned to — `'top'` dismisses on
 * an upward swipe, `'bottom'` on a downward one, `'left'`/`'right'` on a
 * swipe toward that same edge.
 *
 * `SwipeDirection` itself isn't part of `@base-ui/react/drawer`'s public
 * exports, so it's pulled out of `DrawerRootProps['swipeDirection']` instead
 * of reaching into Base UI's internals.
 */
const SWIPE_DIRECTION_BY_SIDE: Record<DrawerSide, NonNullable<DrawerRootProps['swipeDirection']>> = {
  top: 'up',
  right: 'right',
  bottom: 'down',
  left: 'left',
};

export interface DrawerProps extends Omit<DrawerRootProps, 'swipeDirection'> {
  /**
   * Which edge the drawer is pinned to and slides in from. Also sets Base
   * UI's `swipeDirection` to match (see {@link DrawerSide}) — `swipeDirection`
   * itself isn't exposed here so the two can't drift out of sync; drop down
   * to `@base-ui/react/drawer` directly if you need to decouple them (e.g. a
   * right-pinned drawer dismissible only by an upward swipe).
   * @default 'right'
   */
  side?: DrawerSide;
}

/**
 * Kairo's Drawer (an edge-pinned "side sheet"). Thin wrapper over Base UI's
 * `Drawer.Root`/`Trigger`/`Portal`/`Backdrop`/`Viewport`/`Popup`/`Title`/
 * `Description`/`Close` anatomy. Base UI's Drawer is built directly on top of
 * its Dialog (`Drawer.Root` renders a `Dialog.Root` underneath), so focus
 * trapping, scroll locking, Escape/outside-press dismissal and `role="dialog"`
 * all come from the same place Dialog's do — plus swipe-to-dismiss gestures,
 * which Base UI's Drawer ships on top and Dialog doesn't.
 *
 * Unlike Dialog's root (which renders no DOM and is re-exported as-is),
 * `Drawer` wraps `Drawer.Root` in a context provider so `DrawerContent` can
 * read back the resolved `side` and stamp it onto the popup as `data-side`;
 * it still renders no DOM element of its own.
 */
export function Drawer({ side = 'right', ...props }: DrawerProps) {
  return (
    <DrawerSideContext.Provider value={side}>
      <BaseDrawer.Root {...props} swipeDirection={SWIPE_DIRECTION_BY_SIDE[side]} />
    </DrawerSideContext.Provider>
  );
}

export interface DrawerTriggerComponentProps extends DrawerTriggerProps {}

/**
 * A button that opens the drawer. Renders a native `<button>` (or composes
 * with another element via its `render` prop).
 */
export const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerComponentProps>(
  function DrawerTrigger({ className, ...props }, ref) {
    return (
      <BaseDrawer.Trigger
        ref={ref}
        className={className ? `kairo-drawer-trigger ${className}` : 'kairo-drawer-trigger'}
        {...props}
      />
    );
  },
);

DrawerTrigger.displayName = 'DrawerTrigger';

export interface DrawerContentProps extends DrawerPopupProps {}

/**
 * Composes Base UI's `Drawer.Portal` > `Drawer.Backdrop` + `Drawer.Viewport`
 * > `Drawer.Popup` so consumers write less: `<DrawerContent>` renders the
 * backdrop, the swipe/scroll-aware viewport, and the popup's contents in one
 * go. The forwarded ref attaches to the popup element.
 *
 * `Drawer.Viewport` is required here — Base UI logs a dev-only console
 * warning if `Drawer.Popup` is ever rendered outside it ("Omitting the
 * viewport disables drawer swipe handling and touch scroll locking"), so
 * `DrawerContent` always supplies one. Base UI's own additional `Drawer.Content`
 * inner-wrapper part (which exists upstream only to let mouse text-selection
 * opt out of swipe handling) is intentionally omitted here to keep this
 * component's DOM output flat, matching `DialogContent`; reach for
 * `@base-ui/react/drawer`'s `Drawer.Content` directly around your children if
 * you need that specific text-selection affordance.
 *
 * Base UI's `Drawer.Popup` sets `role="dialog"` (its root renders a Dialog
 * underneath) but, like Dialog, doesn't add `aria-modal` itself — Kairo adds
 * `aria-modal="true"` here for the common modal case; pass `aria-modal={false}`
 * explicitly if you set the root's `modal` prop to `false`/`'trap-focus'`.
 *
 * `data-side` (Kairo's own, not Base UI's — see `drawer.tsx`'s `DrawerSide`
 * doc comment) is read from the nearest `Drawer` via context and stamped on
 * the popup so `@kairo-ui/theme` can position, size and animate it — see
 * `drawer.css`.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent({ className, children, ...props }, ref) {
    const locale = useKairoLocale();
    const side = useContext(DrawerSideContext);
    return (
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="kairo-drawer-backdrop" />
        <BaseDrawer.Viewport className="kairo-drawer-viewport">
          <BaseDrawer.Popup
            ref={ref}
            aria-modal="true"
            lang={locale}
            data-side={side}
            className={className ? `kairo-drawer-popup ${className}` : 'kairo-drawer-popup'}
            {...props}
          >
            {children}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    );
  },
);

DrawerContent.displayName = 'DrawerContent';

export interface DrawerTitleComponentProps extends DrawerTitleProps {}

/** A heading that labels the drawer. Renders an `<h2>` element. */
export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleComponentProps>(
  function DrawerTitle({ className, ...props }, ref) {
    return (
      <BaseDrawer.Title
        ref={ref}
        className={className ? `kairo-drawer-title ${className}` : 'kairo-drawer-title'}
        {...props}
      />
    );
  },
);

DrawerTitle.displayName = 'DrawerTitle';

export interface DrawerDescriptionComponentProps extends DrawerDescriptionProps {}

/** A paragraph with additional information about the drawer. Renders a `<p>` element. */
export const DrawerDescription = forwardRef<HTMLParagraphElement, DrawerDescriptionComponentProps>(
  function DrawerDescription({ className, ...props }, ref) {
    return (
      <BaseDrawer.Description
        ref={ref}
        className={className ? `kairo-drawer-description ${className}` : 'kairo-drawer-description'}
        {...props}
      />
    );
  },
);

DrawerDescription.displayName = 'DrawerDescription';

export interface DrawerCloseComponentProps extends DrawerCloseProps {}

/** A button that closes the drawer. Renders a native `<button>` element. */
export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseComponentProps>(
  function DrawerClose({ className, ...props }, ref) {
    return (
      <BaseDrawer.Close
        ref={ref}
        className={className ? `kairo-drawer-close ${className}` : 'kairo-drawer-close'}
        {...props}
      />
    );
  },
);

DrawerClose.displayName = 'DrawerClose';
