'use client';

import { createContext, forwardRef, useContext } from 'react';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type {
  DrawerRootProps,
  DrawerTriggerProps,
  DrawerPortalProps,
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
 * The resolved value of the root's `modal` prop: `true` (focus trapped, page
 * scroll locked, outside pointer interaction disabled), `false` (the rest of
 * the document stays fully usable) or `'trap-focus'` (focus trapped, but page
 * scroll and outside pointer interaction stay enabled).
 */
type DrawerModality = NonNullable<DrawerRootProps['modal']>;

/**
 * Publishes the root's resolved `modal` value to `DrawerContent`, which needs
 * it to decide whether to render a backdrop and whether the (mandatory,
 * full-screen) viewport should let pointer events through — see
 * `DrawerContent`. Base UI keeps `modal` in an internal store and exposes it
 * neither as a context/hook nor as a data attribute on any part, so Kairo
 * carries it itself, exactly as it already carries `side` above. Defaults to
 * `true`, matching Base UI's own default.
 */
const DrawerModalityContext = createContext<DrawerModality>(true);

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
   * itself isn't exposed here, so the two are deliberately coupled and can't
   * drift out of sync. Decoupling them (e.g. a right-pinned drawer
   * dismissible only by an upward swipe) isn't currently supported — open an
   * issue if you need it.
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
 * `Drawer` wraps `Drawer.Root` in context providers so `DrawerContent` can
 * read back the resolved `side` (stamped onto the popup as `data-side`) and
 * the resolved `modal` (which decides whether a backdrop is rendered at all,
 * and whether the viewport captures pointer events); it still renders no DOM
 * element of its own.
 */
export function Drawer({ side = 'right', modal = true, ...props }: DrawerProps) {
  return (
    <DrawerSideContext.Provider value={side}>
      <DrawerModalityContext.Provider value={modal}>
        <BaseDrawer.Root {...props} modal={modal} swipeDirection={SWIPE_DIRECTION_BY_SIDE[side]} />
      </DrawerModalityContext.Provider>
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

export interface DrawerContentProps extends DrawerPopupProps {
  /**
   * A parent element to render the portal element into. Forwarded to Base
   * UI's `Drawer.Portal` (which `DrawerContent` renders internally, so it is
   * otherwise unreachable), unblocking shadow roots, iframe documents and
   * Fullscreen API containers — a drawer portalled to `document.body` is
   * invisible while another element is fullscreen. Defaults to `<body>`.
   */
  container?: DrawerPortalProps['container'];
}

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
 * component's DOM output deliberately flat, matching `DialogContent`; that
 * specific text-selection affordance isn't currently exposed by this wrapper
 * — open an issue if you need it.
 *
 * Base UI's `Drawer.Popup` sets `role="dialog"` (its root renders a Dialog
 * underneath) and, like Dialog, adds no `aria-modal` — and neither does Kairo.
 * Modality reaches assistive tech through `FloatingFocusManager` marking
 * everything outside the popup `aria-hidden`/inert, which screen readers
 * support better than the attribute and which, unlike the hardcoded
 * `aria-modal="true"` this used to set, tracks the root's actual `modal` prop.
 * See `DialogContent`'s comment for the full reasoning and the matching
 * precedent in Radix UI.
 *
 * Both full-screen layers Kairo renders here are made non-blocking when the
 * root isn't fully modal (`modal={false}` or `'trap-focus'`, both of which
 * leave the rest of the page interactive per Base UI's own docs):
 *   - the decorative `.kairo-drawer-backdrop` is not rendered at all — Base UI
 *     does its own pointer blocking with a separate internal backdrop that
 *     `Drawer.Portal` (which is `Dialog.Portal`) renders only when
 *     `modal === true`. Omitting it also *restores* outside-press dismissal
 *     under `'trap-focus'`: Base UI's `useDismiss` only accepts an outside
 *     press whose target is the backdrop when a backdrop exists, and accepts
 *     any outside press when none does.
 *   - the viewport can't be dropped the same way (Base UI needs it for swipe
 *     and touch-scroll handling) and is `position: fixed; inset: 0`, so it
 *     would keep swallowing every click on the page. Instead the resolved
 *     modality is stamped on it as Kairo's own `data-modal` attribute
 *     (`'true' | 'false' | 'trap-focus'`) and `drawer.css` turns off its
 *     `pointer-events` for the non-`true` values, re-enabling them on the open
 *     popup inside. Base UI's swipe listeners sit on the viewport but receive
 *     the popup's events by bubbling, so gestures are unaffected.
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
  function DrawerContent({ className, children, container, ...props }, ref) {
    const locale = useKairoLocale();
    const side = useContext(DrawerSideContext);
    const modal = useContext(DrawerModalityContext);
    return (
      <BaseDrawer.Portal container={container}>
        {modal === true && <BaseDrawer.Backdrop className="kairo-drawer-backdrop" />}
        <BaseDrawer.Viewport className="kairo-drawer-viewport" data-modal={String(modal)}>
          <BaseDrawer.Popup
            ref={ref}
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
