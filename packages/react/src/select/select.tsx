'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type {
  SelectTriggerProps,
  SelectValueProps,
  SelectPositionerProps,
  SelectPopupProps,
  SelectItemProps,
  SelectGroupProps,
  SelectGroupLabelProps,
} from '@base-ui/react/select';
import type { SeparatorProps } from '@base-ui/react/separator';
import { useKairoLocale } from '../i18n/use-kairo-messages';

/**
 * Kairo's Select (dropdown listbox). Thin wrappers over Base UI's
 * `Select.Root`/`Trigger`/`Value`/`Icon`/`Portal`/`Positioner`/`Popup`/`Item`/
 * `ItemText`/`ItemIndicator`/`Group`/`GroupLabel`/`Separator` anatomy — all
 * interaction and accessibility logic (`role="combobox"` on the trigger,
 * `role="listbox"`/`"option"` in the popup, keyboard navigation & typeahead,
 * controlled/uncontrolled value, hidden `<input>` for form submission) comes
 * from `@base-ui/react`. Kairo only supplies the `kairo-select-*` classes
 * (plus a default chevron icon on the trigger and a check icon on the item
 * indicator) so `@kairo-ui/theme` can style everything purely off Base UI's
 * data attributes.
 *
 * `Select.Root` renders no DOM element of its own, so it's re-exported as-is
 * — this also preserves its `<Value, Multiple>` generic signature, which a
 * `forwardRef` wrapper would erase.
 */
export const Select = BaseSelect.Root;

export interface SelectTriggerComponentProps extends SelectTriggerProps {}

/**
 * A button that opens the select popup. Renders `children` (typically a
 * `SelectValue`) followed by a default chevron icon wrapped in Base UI's
 * `Select.Icon`, so consumers don't need to import an icon themselves.
 */
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerComponentProps>(
  function SelectTrigger({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Trigger
        ref={ref}
        className={className ? `kairo-select-trigger ${className}` : 'kairo-select-trigger'}
        {...props}
      >
        {children}
        <BaseSelect.Icon className="kairo-select-icon">
          <ChevronIcon />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
    );
  },
);

SelectTrigger.displayName = 'SelectTrigger';

export interface SelectValueComponentProps extends SelectValueProps {}

/** The trigger's label: the selected item's text, or the `placeholder`. */
export const SelectValue = forwardRef<HTMLSpanElement, SelectValueComponentProps>(
  function SelectValue({ className, ...props }, ref) {
    return (
      <BaseSelect.Value
        ref={ref}
        className={className ? `kairo-select-value ${className}` : 'kairo-select-value'}
        {...props}
      />
    );
  },
);

SelectValue.displayName = 'SelectValue';

export interface SelectContentProps extends SelectPopupProps {
  /** Which side of the trigger to render the popup against. */
  side?: SelectPositionerProps['side'];
  /** How to align the popup relative to `side`. */
  align?: SelectPositionerProps['align'];
  /** Distance in pixels between the trigger and the popup. @default 4 */
  sideOffset?: SelectPositionerProps['sideOffset'];
  /**
   * Whether the popup overlaps the trigger so the selected item's text lines
   * up with the trigger's value text (Base UI's special select positioning
   * behavior). @default true
   */
  alignItemWithTrigger?: SelectPositionerProps['alignItemWithTrigger'];
}

/**
 * Composes Base UI's `Select.Portal` > `Select.Positioner` + `Select.Popup`
 * so consumers write less. The forwarded ref attaches to the popup element.
 *
 * Base UI's `Select.Popup` assumes `role="listbox"` automatically as long as
 * no `Select.List` is rendered inside it — Kairo's items are direct children
 * of the popup (no `Select.List` wrapper), so this applies here.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  { className, children, side, align, sideOffset = 4, alignItemWithTrigger, ...props },
  ref,
) {
  const locale = useKairoLocale();
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignItemWithTrigger={alignItemWithTrigger}
      >
        <BaseSelect.Popup
          ref={ref}
          lang={locale}
          className={className ? `kairo-select-popup ${className}` : 'kairo-select-popup'}
          {...props}
        >
          {children}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
});

SelectContent.displayName = 'SelectContent';

export interface SelectItemComponentProps extends Omit<SelectItemProps, 'children'> {
  children?: ReactNode;
}

/**
 * An individual option. Wraps `children` in Base UI's `Select.ItemText` and
 * renders a check-mark `Select.ItemIndicator` before it (only present in the
 * DOM for the selected item; the `.kairo-select-item` grid reserves its
 * column regardless so unselected items stay aligned with it).
 */
export const SelectItem = forwardRef<HTMLElement, SelectItemComponentProps>(function SelectItem(
  { className, children, ...props },
  ref,
) {
  return (
    <BaseSelect.Item
      ref={ref}
      className={className ? `kairo-select-item ${className}` : 'kairo-select-item'}
      {...props}
    >
      <BaseSelect.ItemIndicator className="kairo-select-item-indicator">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className="kairo-select-item-text">{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
});

SelectItem.displayName = 'SelectItem';

export interface SelectGroupComponentProps extends SelectGroupProps {}

/** Groups related items with a `SelectGroupLabel`. */
export const SelectGroup = forwardRef<HTMLDivElement, SelectGroupComponentProps>(
  function SelectGroup({ className, ...props }, ref) {
    return (
      <BaseSelect.Group
        ref={ref}
        className={className ? `kairo-select-group ${className}` : 'kairo-select-group'}
        {...props}
      />
    );
  },
);

SelectGroup.displayName = 'SelectGroup';

export interface SelectGroupLabelComponentProps extends SelectGroupLabelProps {}

/** An accessible label for a `SelectGroup`, automatically associated with it. */
export const SelectGroupLabel = forwardRef<HTMLDivElement, SelectGroupLabelComponentProps>(
  function SelectGroupLabel({ className, ...props }, ref) {
    return (
      <BaseSelect.GroupLabel
        ref={ref}
        className={className ? `kairo-select-group-label ${className}` : 'kairo-select-group-label'}
        {...props}
      />
    );
  },
);

SelectGroupLabel.displayName = 'SelectGroupLabel';

export interface SelectSeparatorComponentProps extends SeparatorProps {}

/**
 * A visual divider between items/groups in the popup. Renders Base UI's
 * generic `Separator` (Select has no separator part of its own).
 *
 * Hidden from the accessibility tree (`aria-hidden="true"`) by default: the
 * `listbox` role only permits `option`/`group` children, so exposing a
 * `role="separator"` node inside it is invalid ARIA (and purely decorative
 * here anyway). Pass `aria-hidden={false}` to opt back into exposing it.
 */
export const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorComponentProps>(
  function SelectSeparator({ className, 'aria-hidden': ariaHidden = true, ...props }, ref) {
    return (
      <BaseSeparator
        ref={ref}
        aria-hidden={ariaHidden}
        className={className ? `kairo-select-separator ${className}` : 'kairo-select-separator'}
        {...props}
      />
    );
  },
);

SelectSeparator.displayName = 'SelectSeparator';

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
      <path d="m6 9 6 6 6-6" />
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
