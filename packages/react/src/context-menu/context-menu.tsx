'use client';

import { createContext, forwardRef, useContext } from 'react';
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type {
  ContextMenuRootProps,
  ContextMenuTriggerProps,
  ContextMenuPositionerProps,
  ContextMenuPopupProps,
  ContextMenuPortalProps,
  ContextMenuItemProps,
  ContextMenuGroupProps,
  ContextMenuGroupLabelProps,
} from '@base-ui/react/context-menu';
import type { SeparatorProps } from '@base-ui/react/separator';
import { useKairoLocale } from '../i18n/use-kairo-messages';

/**
 * Kairo's ContextMenu (a right-click/long-press menu). Thin wrappers over
 * Base UI's `ContextMenu.Root`/`Trigger`/`Portal`/`Positioner`/`Popup`/`Item`/
 * `Group`/`GroupLabel` anatomy (plus the generic `Separator`, reused the same
 * way `Select`/`Combobox` reuse it) — all interaction and accessibility logic
 * (suppressing the browser's native menu, opening on right click or a
 * touch/long press, `role="menu"`/`"menuitem"`, roving-focus keyboard
 * navigation, Escape/outside-press dismissal) comes from `@base-ui/react`.
 * Kairo only supplies the `kairo-context-menu-*` classes so `@kairo-ui/theme`
 * can style everything purely off Base UI's data attributes.
 *
 * **Cursor positioning, not trigger positioning.** Unlike `Select`/`Popover`,
 * a context menu has no element for its popup to point at — it opens at
 * wherever the pointer was when the user right-clicked (or where their
 * finger was on a long press). Base UI's `ContextMenu.Trigger` records that
 * point as a virtual "anchor" (a 0×0 — or, on touch, 10×10 — rect at the
 * cursor's coordinates) on `ContextMenu.Root`'s context and hands it to
 * `ContextMenu.Positioner` automatically; `ContextMenuContent` below never
 * passes an explicit `anchor` prop, it just relies on this. Because of that,
 * `ContextMenuContent`'s `side`/`align`/`sideOffset` are left **fully
 * undefined by default** rather than given Kairo defaults the way
 * `SelectContent`'s are: passing an explicit default (as `SelectContent` does
 * for a trigger-anchored popup) would override Base UI's own
 * context-menu-aware defaults — `align: 'start'`, `sideOffset: -5`,
 * `alignOffset: 2` — which exist specifically to snug the popup's corner up
 * against the cursor instead of floating a visible gap away from it the way
 * a trigger-anchored popup wants. Only pass these props to override that
 * cursor-hugging behavior.
 *
 * **No arrow.** `Select`/`Popover` render an arrow pointing back at their
 * trigger; a context menu has no trigger element to point at (only a cursor
 * position, which disappears the instant the menu opens), so Kairo does not
 * expose a `ContextMenuArrow` part at all.
 *
 * **Disabling.** `disabled` is genuinely honoured by Base UI's underlying
 * `Menu.Root` — `ContextMenu.Trigger`'s `handleContextMenu`/`handleTouchStart`
 * bail out early when it's set, so right-clicking/long-pressing a disabled
 * trigger does nothing (verified against `@base-ui/react@1.6.0`'s installed
 * source). But Base UI gives no visual affordance for that: its
 * `ContextMenuTriggerState` is exactly `{ open: boolean }`, and
 * `ContextMenuTriggerProps` has no `disabled` prop at all, so nothing is ever
 * stamped on the trigger element. Left alone, a disabled trigger still shows
 * the `context-menu` cursor and, worse, a right-click on it pops the
 * *browser's* native menu instead of doing nothing — since Base UI's own
 * `disabled` short-circuit runs before it would otherwise suppress that
 * native event. Rather than send consumers digging through Base UI for an
 * attribute that doesn't exist, Kairo closes the gap itself: `ContextMenu`
 * wraps `Menu.Root`'s `disabled` in a context provider (the same technique
 * `Drawer` uses for `side`/`modal` and `Dialog` uses for `modal`, since Base
 * UI's `Menu.Root` likewise keeps `disabled` in an internal store with no
 * context/hook of its own to read it back from) and fans it out to
 * `ContextMenuTrigger`, which stamps its own `data-disabled`/`aria-disabled`
 * — see `ContextMenuTrigger`'s doc comment for the fan-out and
 * `context-menu.css` for the resulting `cursor: not-allowed`/dimmed styling.
 *
 * Unlike Base UI's root (which this used to re-export as-is), `ContextMenu`
 * therefore renders a context provider around it; it still renders no DOM
 * element of its own.
 */
export interface ContextMenuProps extends ContextMenuRootProps {}

/**
 * Whether the nearest `ContextMenu` root is `disabled`, fanned out so
 * `ContextMenuTrigger` can pick it up as its own default without the
 * consumer having to set `disabled` twice — see `ContextMenu`'s doc comment
 * above for why this exists at all. Defaults to `false`, matching Base UI's
 * own default for `Menu.Root`'s `disabled`.
 */
const ContextMenuDisabledContext = createContext(false);

export function ContextMenu({ disabled = false, ...props }: ContextMenuProps) {
  return (
    <ContextMenuDisabledContext.Provider value={disabled}>
      <BaseContextMenu.Root disabled={disabled} {...props} />
    </ContextMenuDisabledContext.Provider>
  );
}

export interface ContextMenuTriggerComponentProps extends ContextMenuTriggerProps {
  /**
   * Marks the trigger's visual affordance disabled: swaps its cursor to
   * `not-allowed` and dims it via `.kairo-context-menu-trigger[data-disabled]`
   * (see `context-menu.css`), and sets `aria-disabled="true"`. This is
   * entirely Kairo's own invention — Base UI's `ContextMenu.Trigger` exposes
   * no `disabled` prop or state at all (see `ContextMenu`'s doc comment).
   *
   * Left unset, this automatically mirrors the nearest `ContextMenu` root's
   * `disabled` prop (fanned out via context), which is what actually gates
   * the interaction — so for the common case, setting `disabled` on the root
   * is enough; you do not need to also pass it here. Pass it explicitly here
   * only to decouple the *visual* affordance from the root (e.g. previewing
   * the disabled look without disabling the interaction) — doing so without
   * also disabling the root reproduces the exact mismatch this prop exists
   * to fix, so prefer the root's `disabled` for anything user-facing.
   */
  disabled?: boolean;
}

/**
 * The area that becomes right-clickable (or long-press-able on touch) —
 * wrap whatever content should own the menu in this (a row, a card, an
 * image, a whole panel). Renders Base UI's `ContextMenu.Trigger`, a `<div>`.
 *
 * Unlike `SelectTrigger`/`PopoverTrigger`, this is **not a control that opens
 * on click** — it stays visually unstyled beyond a `context-menu` cursor
 * hint, since it wraps arbitrary consumer content that Kairo shouldn't
 * impose a background/border on. It only reacts to a native `contextmenu`
 * event (right click) or a touch long-press, and Base UI calls
 * `preventDefault` on that `contextmenu` event itself (both on this element
 * and, via a document-level listener, on Kairo's own popup/backdrop) so the
 * browser's native menu never appears alongside Kairo's.
 *
 * `data-disabled`/`aria-disabled` are stamped whenever the resolved
 * `disabled` (own prop, defaulting to the nearest `ContextMenu` root's own
 * `disabled` fanned out via context) is true — see `disabled`'s doc comment
 * above and `ContextMenu`'s for why. Neither is forwarded to Base UI's
 * `ContextMenu.Trigger`, which has no `disabled` prop to receive it (the
 * actual interaction is gated by the root's `disabled` alone).
 */
export const ContextMenuTrigger = forwardRef<HTMLDivElement, ContextMenuTriggerComponentProps>(
  function ContextMenuTrigger({ className, disabled, ...props }, ref) {
    const rootDisabled = useContext(ContextMenuDisabledContext);
    const isDisabled = disabled ?? rootDisabled;
    return (
      <BaseContextMenu.Trigger
        ref={ref}
        data-disabled={isDisabled || undefined}
        aria-disabled={isDisabled ? true : undefined}
        className={className ? `kairo-context-menu-trigger ${className}` : 'kairo-context-menu-trigger'}
        {...props}
      />
    );
  },
);

ContextMenuTrigger.displayName = 'ContextMenuTrigger';

export interface ContextMenuContentProps extends ContextMenuPopupProps {
  /**
   * Which side of the cursor to render the popup against. Left undefined,
   * Base UI is free to pick whichever of the four sides has room in the
   * viewport, hugging the corner nearest the click. See the note on cursor
   * positioning above for why this has no Kairo-supplied default.
   */
  side?: ContextMenuPositionerProps['side'];
  /**
   * How to align the popup relative to `side`. Base UI defaults this to
   * `'start'` for a context menu (a dropdown instead defaults to `'center'`)
   * so a corner of the popup lines up with the cursor. Only pass this to
   * override that default.
   */
  align?: ContextMenuPositionerProps['align'];
  /**
   * Distance in pixels between the cursor and the popup along `side`. Base
   * UI defaults this to a small negative offset so the popup overlaps the
   * cursor slightly instead of leaving a visible gap. Only pass this to
   * override that default.
   */
  sideOffset?: ContextMenuPositionerProps['sideOffset'];
  /**
   * A parent element to render the popup's portal into, instead of the
   * default `document.body`. Needed to portal into a shadow DOM, an iframe,
   * or the currently active fullscreen element, where `document.body` isn't
   * reachable or isn't the right paint target.
   */
  container?: ContextMenuPortalProps['container'];
}

/**
 * Composes Base UI's `ContextMenu.Portal` > `ContextMenu.Positioner` +
 * `ContextMenu.Popup` in one call. The forwarded ref attaches to the popup
 * element. No arrow is rendered — see the doc block above.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent(
    { className, children, side, align, sideOffset, container, ...props },
    ref,
  ) {
    const locale = useKairoLocale();
    return (
      <BaseContextMenu.Portal container={container}>
        <BaseContextMenu.Positioner side={side} align={align} sideOffset={sideOffset}>
          <BaseContextMenu.Popup
            ref={ref}
            lang={locale}
            className={className ? `kairo-context-menu-popup ${className}` : 'kairo-context-menu-popup'}
            {...props}
          >
            {children}
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    );
  },
);

ContextMenuContent.displayName = 'ContextMenuContent';

export interface ContextMenuItemComponentProps extends ContextMenuItemProps {}

/**
 * An individual command. Renders `children` directly (no built-in indicator,
 * unlike `SelectItem`'s check mark — a menu item is a command, not a
 * selection) inside Base UI's `ContextMenu.Item`, a `<div role="menuitem">`.
 * Lay out an icon and/or a keyboard-shortcut hint as flex children of it —
 * `.kairo-context-menu-item` is a flex row with `justify-content:
 * space-between` for exactly that.
 */
export const ContextMenuItem = forwardRef<HTMLElement, ContextMenuItemComponentProps>(
  function ContextMenuItem({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Item
        ref={ref}
        className={className ? `kairo-context-menu-item ${className}` : 'kairo-context-menu-item'}
        {...props}
      />
    );
  },
);

ContextMenuItem.displayName = 'ContextMenuItem';

export interface ContextMenuGroupComponentProps extends ContextMenuGroupProps {}

/** Groups related items with a `ContextMenuGroupLabel`. */
export const ContextMenuGroup = forwardRef<HTMLDivElement, ContextMenuGroupComponentProps>(
  function ContextMenuGroup({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Group
        ref={ref}
        className={className ? `kairo-context-menu-group ${className}` : 'kairo-context-menu-group'}
        {...props}
      />
    );
  },
);

ContextMenuGroup.displayName = 'ContextMenuGroup';

export interface ContextMenuGroupLabelComponentProps extends ContextMenuGroupLabelProps {}

/** An accessible label for a `ContextMenuGroup`, automatically associated with it. */
export const ContextMenuGroupLabel = forwardRef<HTMLDivElement, ContextMenuGroupLabelComponentProps>(
  function ContextMenuGroupLabel({ className, ...props }, ref) {
    return (
      <BaseContextMenu.GroupLabel
        ref={ref}
        className={
          className ? `kairo-context-menu-group-label ${className}` : 'kairo-context-menu-group-label'
        }
        {...props}
      />
    );
  },
);

ContextMenuGroupLabel.displayName = 'ContextMenuGroupLabel';

export interface ContextMenuSeparatorComponentProps extends SeparatorProps {}

/**
 * A visual divider between items/groups in the popup. Renders Base UI's
 * generic `Separator` (ContextMenu has no separator part of its own, the same
 * as `Select`).
 *
 * Unlike `SelectSeparator`, this is **not** hidden from the accessibility
 * tree by default: the `menu` role (unlike `listbox`) explicitly permits a
 * `separator` child, so exposing Base UI's default `role="separator"` here
 * is valid ARIA. Pass `aria-hidden` to opt back out.
 */
export const ContextMenuSeparator = forwardRef<HTMLDivElement, ContextMenuSeparatorComponentProps>(
  function ContextMenuSeparator({ className, ...props }, ref) {
    return (
      <BaseSeparator
        ref={ref}
        className={className ? `kairo-context-menu-separator ${className}` : 'kairo-context-menu-separator'}
        {...props}
      />
    );
  },
);

ContextMenuSeparator.displayName = 'ContextMenuSeparator';
