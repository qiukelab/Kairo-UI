'use client';

import { forwardRef } from 'react';
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type {
  ContextMenuTriggerProps,
  ContextMenuPositionerProps,
  ContextMenuPopupProps,
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
 * `ContextMenu.Root` renders no DOM element of its own, so it's re-exported
 * as-is — the same reasoning as `Select`/`Popover`.
 */
export const ContextMenu = BaseContextMenu.Root;

export interface ContextMenuTriggerComponentProps extends ContextMenuTriggerProps {}

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
 */
export const ContextMenuTrigger = forwardRef<HTMLDivElement, ContextMenuTriggerComponentProps>(
  function ContextMenuTrigger({ className, ...props }, ref) {
    return (
      <BaseContextMenu.Trigger
        ref={ref}
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
  function ContextMenuContent({ className, children, side, align, sideOffset, ...props }, ref) {
    const locale = useKairoLocale();
    return (
      <BaseContextMenu.Portal>
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
