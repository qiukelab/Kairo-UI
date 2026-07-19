'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type {
  MenuTriggerProps,
  MenuPositionerProps,
  MenuPopupProps,
  MenuPortalProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuGroupProps,
  MenuGroupLabelProps,
  MenuSubmenuTriggerProps,
} from '@base-ui/react/menu';
import type { SeparatorProps } from '@base-ui/react/separator';
import { useKairoLocale } from '../i18n/use-kairo-messages';

/**
 * Kairo's Menu (dropdown menu). Thin wrappers over Base UI's
 * `Menu.Root`/`Trigger`/`Portal`/`Positioner`/`Popup`/`Item`/`CheckboxItem`/
 * `CheckboxItemIndicator`/`RadioGroup`/`RadioItem`/`RadioItemIndicator`/
 * `Group`/`GroupLabel`/`SubmenuRoot`/`SubmenuTrigger`/generic `Separator`
 * anatomy — all interaction and accessibility logic (`role="menu"`/
 * `"menuitem"`/`"menuitemcheckbox"`/`"menuitemradio"`, keyboard navigation &
 * typeahead, submenu open-on-hover with a close delay, controlled/
 * uncontrolled checked/value state) comes from `@base-ui/react`. Kairo only
 * supplies the `kairo-menu-*` classes (plus check/dot indicators on the
 * checkbox/radio items and a chevron on submenu triggers) so
 * `@kairo-ui/theme` can style everything purely off Base UI's data
 * attributes.
 *
 * `Menu.Root` renders no DOM element of its own, so it's re-exported as-is —
 * this also preserves its `<Payload>` generic signature (used to pass data
 * from a trigger through to the menu content), which a `forwardRef` wrapper
 * would erase.
 */
export const Menu = BaseMenu.Root;

export interface MenuTriggerComponentProps extends MenuTriggerProps {}

/**
 * A button that opens the menu. Renders a native `<button>` (or composes
 * with another element via its `render` prop, e.g. a Kairo `Button`).
 *
 * Unlike `SelectTrigger`, this renders no default icon: a menu trigger is
 * usually a button the consumer already styles (an icon button, a `Button`
 * with a label), not a form-control look-alike.
 *
 * `Menu.Trigger`'s type signature is generic over a `<Payload>` handed to the
 * menu when it opens; that generic is erased here by `forwardRef` (same
 * trade-off Base UI itself accepts for most of its non-Root parts) — pass
 * `payload` through `props` and read it back via a render-function child of
 * `Menu`/`MenuContent` if you need it.
 *
 * Typed `HTMLButtonElement` for the ref, matching `Select.Trigger`,
 * `Dialog.Trigger` and `Popover.Trigger`: Base UI's `MenuTriggerProps` pulls
 * in a `<button>`'s native `ComponentPropsWithRef<'button'>` (via
 * `BaseUIComponentProps<'button', ...>`), so its ref is really
 * `Ref<HTMLButtonElement>` intersected with the generic call signature's own
 * `RefAttributes<HTMLElement>` — only a `Ref<HTMLButtonElement>` satisfies
 * both halves.
 */
export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerComponentProps>(
  function MenuTrigger({ className, ...props }, ref) {
    return (
      <BaseMenu.Trigger
        ref={ref}
        className={className ? `kairo-menu-trigger ${className}` : 'kairo-menu-trigger'}
        {...props}
      />
    );
  },
);

MenuTrigger.displayName = 'MenuTrigger';

export interface MenuContentProps extends MenuPopupProps {
  /**
   * Which side of the trigger to render the popup against.
   *
   * Left unset by default so Base UI can pick the right default itself: it
   * uses `'bottom'` for a top-level menu, but `'inline-end'` when this
   * `MenuContent` is rendered inside a `MenuSub` (a submenu popping out to
   * the side of its trigger).
   */
  side?: MenuPositionerProps['side'];
  /** How to align the popup relative to `side`. @default 'start' */
  align?: MenuPositionerProps['align'];
  /** Distance in pixels between the trigger and the popup. @default 8 */
  sideOffset?: MenuPositionerProps['sideOffset'];
  /**
   * A parent element to render the popup's portal into, instead of the
   * default `document.body`. Needed to portal into a shadow DOM, an iframe,
   * or the currently active fullscreen element, where `document.body` isn't
   * reachable or isn't the right paint target.
   */
  container?: MenuPortalProps['container'];
}

/**
 * Composes Base UI's `Menu.Portal` > `Menu.Positioner` + `Menu.Popup` so
 * consumers write less. The forwarded ref attaches to the popup element.
 *
 * Reused as-is for submenus: render it as the second child of a `MenuSub`
 * (after a `MenuSubmenuTrigger`) and Base UI's nested-menu context supplies
 * the different default `side`/positioning automatically.
 *
 * Base UI's `Menu.Popup` sets `role="menu"` automatically.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  { className, children, side, align = 'start', sideOffset = 8, container, ...props },
  ref,
) {
  const locale = useKairoLocale();
  return (
    <BaseMenu.Portal container={container}>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset}>
        <BaseMenu.Arrow className="kairo-menu-arrow">
          <ArrowIcon />
        </BaseMenu.Arrow>
        <BaseMenu.Popup
          ref={ref}
          lang={locale}
          className={className ? `kairo-menu-popup ${className}` : 'kairo-menu-popup'}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
});

MenuContent.displayName = 'MenuContent';

export interface MenuItemComponentProps extends Omit<MenuItemProps, 'children'> {
  children?: ReactNode;
}

/** An individual, clickable action in the menu. Closes the menu on click by default. */
export const MenuItem = forwardRef<HTMLElement, MenuItemComponentProps>(function MenuItem(
  { className, ...props },
  ref,
) {
  return (
    <BaseMenu.Item
      ref={ref}
      className={className ? `kairo-menu-item ${className}` : 'kairo-menu-item'}
      {...props}
    />
  );
});

MenuItem.displayName = 'MenuItem';

export interface MenuCheckboxItemComponentProps extends Omit<MenuCheckboxItemProps, 'children'> {
  children?: ReactNode;
}

/**
 * A menu item that toggles a setting on or off. Renders `children` next to a
 * check-mark `Menu.CheckboxItemIndicator` (only present in the DOM while
 * checked; the `.kairo-menu-checkbox-item` grid reserves its column
 * regardless so unchecked items still line up with a checked one). Does not
 * close the menu on click by default, unlike `MenuItem`.
 */
export const MenuCheckboxItem = forwardRef<HTMLElement, MenuCheckboxItemComponentProps>(
  function MenuCheckboxItem({ className, children, ...props }, ref) {
    return (
      <BaseMenu.CheckboxItem
        ref={ref}
        className={
          className
            ? `kairo-menu-item kairo-menu-checkbox-item ${className}`
            : 'kairo-menu-item kairo-menu-checkbox-item'
        }
        {...props}
      >
        <BaseMenu.CheckboxItemIndicator className="kairo-menu-item-indicator">
          <CheckIcon />
        </BaseMenu.CheckboxItemIndicator>
        <span className="kairo-menu-item-text">{children}</span>
      </BaseMenu.CheckboxItem>
    );
  },
);

MenuCheckboxItem.displayName = 'MenuCheckboxItem';

export interface MenuRadioGroupComponentProps extends MenuRadioGroupProps {}

/** Groups related `MenuRadioItem`s so only one of them can be selected at a time. */
export const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupComponentProps>(
  function MenuRadioGroup({ className, ...props }, ref) {
    return (
      <BaseMenu.RadioGroup
        ref={ref}
        className={className ? `kairo-menu-radio-group ${className}` : 'kairo-menu-radio-group'}
        {...props}
      />
    );
  },
);

MenuRadioGroup.displayName = 'MenuRadioGroup';

export interface MenuRadioItemComponentProps extends Omit<MenuRadioItemProps, 'children'> {
  children?: ReactNode;
}

/**
 * A menu item that works like a radio button within a `MenuRadioGroup`.
 * Renders `children` next to a dot `Menu.RadioItemIndicator` (only present in
 * the DOM for the selected item; see `MenuCheckboxItem` for why the grid
 * reserves that column regardless). Does not close the menu on click by
 * default, unlike `MenuItem`.
 */
export const MenuRadioItem = forwardRef<HTMLElement, MenuRadioItemComponentProps>(
  function MenuRadioItem({ className, children, ...props }, ref) {
    return (
      <BaseMenu.RadioItem
        ref={ref}
        className={
          className
            ? `kairo-menu-item kairo-menu-radio-item ${className}`
            : 'kairo-menu-item kairo-menu-radio-item'
        }
        {...props}
      >
        <BaseMenu.RadioItemIndicator className="kairo-menu-item-indicator">
          <DotIcon />
        </BaseMenu.RadioItemIndicator>
        <span className="kairo-menu-item-text">{children}</span>
      </BaseMenu.RadioItem>
    );
  },
);

MenuRadioItem.displayName = 'MenuRadioItem';

export interface MenuGroupComponentProps extends MenuGroupProps {}

/** Groups related items with a `MenuGroupLabel`. */
export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupComponentProps>(function MenuGroup(
  { className, ...props },
  ref,
) {
  return (
    <BaseMenu.Group
      ref={ref}
      className={className ? `kairo-menu-group ${className}` : 'kairo-menu-group'}
      {...props}
    />
  );
});

MenuGroup.displayName = 'MenuGroup';

export interface MenuGroupLabelComponentProps extends MenuGroupLabelProps {}

/** An accessible label for a `MenuGroup`, automatically associated with it. */
export const MenuGroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelComponentProps>(
  function MenuGroupLabel({ className, ...props }, ref) {
    return (
      <BaseMenu.GroupLabel
        ref={ref}
        className={className ? `kairo-menu-group-label ${className}` : 'kairo-menu-group-label'}
        {...props}
      />
    );
  },
);

MenuGroupLabel.displayName = 'MenuGroupLabel';

export interface MenuSeparatorComponentProps extends SeparatorProps {}

/**
 * A visual divider between items/groups in the popup. Renders Base UI's
 * generic `Separator` (Menu has no separator part of its own).
 *
 * Hidden from the accessibility tree (`aria-hidden="true"`) by default: the
 * `menu` role only permits `menuitem`/`menuitemcheckbox`/`menuitemradio`/
 * `group` children, so exposing a `role="separator"` node inside it is
 * invalid ARIA (and purely decorative here anyway). Pass `aria-hidden={false}`
 * to opt back into exposing it.
 */
export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorComponentProps>(
  function MenuSeparator({ className, 'aria-hidden': ariaHidden = true, ...props }, ref) {
    return (
      <BaseSeparator
        ref={ref}
        aria-hidden={ariaHidden}
        className={className ? `kairo-menu-separator ${className}` : 'kairo-menu-separator'}
        {...props}
      />
    );
  },
);

MenuSeparator.displayName = 'MenuSeparator';

/**
 * Groups all parts of a submenu — pair it with a `MenuSubmenuTrigger` and a
 * `MenuContent`. Renders no DOM element of its own, so it's re-exported as-is
 * (same reasoning as `Menu`, though this part isn't generic over a payload).
 */
export const MenuSub = BaseMenu.SubmenuRoot;

export interface MenuSubmenuTriggerComponentProps extends Omit<
  MenuSubmenuTriggerProps,
  'children'
> {
  children?: ReactNode;
}

/**
 * A menu item that opens a submenu when hovered, focused, or activated.
 * Renders `children` followed by a default chevron pointing at the side the
 * submenu will open on.
 */
export const MenuSubmenuTrigger = forwardRef<HTMLElement, MenuSubmenuTriggerComponentProps>(
  function MenuSubmenuTrigger({ className, children, ...props }, ref) {
    return (
      <BaseMenu.SubmenuTrigger
        ref={ref}
        className={
          className
            ? `kairo-menu-item kairo-menu-submenu-trigger ${className}`
            : 'kairo-menu-item kairo-menu-submenu-trigger'
        }
        {...props}
      >
        <span className="kairo-menu-item-text">{children}</span>
        <span className="kairo-menu-submenu-trigger-icon">
          <ChevronIcon />
        </span>
      </BaseMenu.SubmenuTrigger>
    );
  },
);

MenuSubmenuTrigger.displayName = 'MenuSubmenuTrigger';

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/**
 * The arrow tying the popup back to its trigger. Only the two slanted edges
 * are stroked — stroking the base as well would draw a line across the seam
 * where the arrow meets the popup's own border.
 *
 * Fill and stroke are left to CSS rather than set as presentation attributes:
 * `var()` is only substituted in CSS declarations, so `fill="var(--x)"` on the
 * element would not resolve and the arrow would paint black.
 */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 6" width={12} height={6} aria-hidden="true">
      <path className="kairo-menu-arrow-fill" d="M6 0 12 6H0z" />
      <path className="kairo-menu-arrow-edge" d="M0 6 6 0l6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}
