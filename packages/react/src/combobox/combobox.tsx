'use client';

import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type {
  ComboboxInputProps,
  ComboboxInputGroupProps,
  ComboboxTriggerProps,
  ComboboxClearProps,
  ComboboxPositionerProps,
  ComboboxPopupProps,
  ComboboxPortalProps,
  ComboboxListProps,
  ComboboxItemProps,
  ComboboxEmptyProps,
  ComboboxGroupProps,
  ComboboxGroupLabelProps,
} from '@base-ui/react/combobox';
import type { SeparatorProps } from '@base-ui/react/separator';
import { useKairoLocale } from '../i18n/use-kairo-messages';

/**
 * Kairo's Combobox (a text input paired with a filtered listbox). Thin wrappers
 * over Base UI's `Combobox.Root`/`InputGroup`/`Input`/`Trigger`/`Icon`/`Clear`/
 * `Portal`/`Positioner`/`Arrow`/`Popup`/`List`/`Item`/`ItemIndicator`/`Empty`/
 * `Group`/`GroupLabel` anatomy — all interaction and accessibility logic
 * (`role="combobox"` on the input, `role="listbox"` on the list, filtering,
 * `aria-activedescendant` keyboard navigation, controlled/uncontrolled value,
 * hidden input for form submission) comes from `@base-ui/react`. Kairo only
 * supplies the `kairo-combobox-*` classes (plus a default chevron on the
 * trigger, an X on the clear button and a check on the item indicator) so
 * `@kairo-ui/theme` can style everything purely off Base UI's data attributes.
 *
 * Built on Base UI's `combobox` primitive rather than its `autocomplete` one:
 * `autocomplete` hard-codes `selectionMode: 'none'`, so it has no selected
 * value at all — its `value` is the input's text and it exists to suggest
 * completions for free-form typing. Kairo's Combobox is a *value picker*: it
 * needs `value`/`defaultValue`/`onValueChange` over item values, item
 * indicators, and `multiple`, all of which only `combobox` provides.
 *
 * **Filtering is Base UI's job, not the consumer's.** Pass the data to
 * `Combobox` via its `items` prop and render it through a function child on
 * `ComboboxList`; Base UI narrows `items` against the input's query using an
 * `Intl.Collator`-backed matcher and hands the survivors to that function.
 * Static `ComboboxItem` children (no `items` prop) are *not* filtered, and
 * `ComboboxEmpty` never appears for them. Pass `filter` to override the
 * matcher, or `filter={null}` to disable filtering entirely.
 *
 * `Combobox.Root` renders no DOM element of its own, so it's re-exported as-is
 * — this also preserves its `<Value, Multiple>` generic signature, which a
 * `forwardRef` wrapper would erase (the same reason `Select` is re-exported
 * raw). Losing it would collapse `onValueChange`'s argument to `unknown` and
 * break the `multiple` overload that widens `value` to an array.
 */
export const Combobox = BaseCombobox.Root;

export interface ComboboxControlProps extends ComboboxInputGroupProps {}

/**
 * The bordered box that visually *is* the control: wraps a `ComboboxInput`
 * plus any adornments (`ComboboxClear`, `ComboboxTrigger`) and is what the
 * popup anchors to, so `--anchor-width` matches this element rather than the
 * bare input. Renders Base UI's `Combobox.InputGroup`.
 *
 * Kairo puts the border and the focus ring here instead of on the input so the
 * whole box lights up when the input inside it is focused — the input itself
 * is borderless and transparent.
 */
export const ComboboxControl = forwardRef<HTMLDivElement, ComboboxControlProps>(
  function ComboboxControl({ className, ...props }, ref) {
    return (
      <BaseCombobox.InputGroup
        ref={ref}
        className={className ? `kairo-combobox-control ${className}` : 'kairo-combobox-control'}
        {...props}
      />
    );
  },
);

ComboboxControl.displayName = 'ComboboxControl';

export interface ComboboxInputComponentProps extends ComboboxInputProps {}

/**
 * The text input. Base UI gives it `role="combobox"`, `aria-expanded`,
 * `aria-controls` and `aria-activedescendant`, and wires typing to the filter
 * query. Place it inside a `ComboboxControl`.
 */
export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputComponentProps>(
  function ComboboxInput({ className, ...props }, ref) {
    return (
      <BaseCombobox.Input
        ref={ref}
        className={className ? `kairo-combobox-input ${className}` : 'kairo-combobox-input'}
        {...props}
      />
    );
  },
);

ComboboxInput.displayName = 'ComboboxInput';

export interface ComboboxTriggerComponentProps extends ComboboxTriggerProps {}

/**
 * A button that opens the popup without the user having to type. Renders a
 * default chevron wrapped in Base UI's `Combobox.Icon` when no `children` are
 * given, so consumers don't need to import an icon themselves.
 *
 * Hidden from the accessibility tree by default: the input next to it already
 * carries `role="combobox"` with `aria-expanded`, so a second focusable
 * control that does the same thing is noise for screen-reader and keyboard
 * users (who open the list with ArrowDown). It stays a pointer affordance.
 * Pass `aria-hidden={false}` with an `aria-label` to expose it.
 */
export const ComboboxTrigger = forwardRef<HTMLButtonElement, ComboboxTriggerComponentProps>(
  function ComboboxTrigger(
    { className, children, 'aria-hidden': ariaHidden = true, tabIndex = -1, ...props },
    ref,
  ) {
    return (
      <BaseCombobox.Trigger
        ref={ref}
        aria-hidden={ariaHidden}
        tabIndex={tabIndex}
        className={className ? `kairo-combobox-trigger ${className}` : 'kairo-combobox-trigger'}
        {...props}
      >
        {children ?? (
          <BaseCombobox.Icon className="kairo-combobox-icon">
            <ChevronIcon />
          </BaseCombobox.Icon>
        )}
      </BaseCombobox.Trigger>
    );
  },
);

ComboboxTrigger.displayName = 'ComboboxTrigger';

export interface ComboboxClearComponentProps extends ComboboxClearProps {
  /**
   * The clear button's accessible name.
   *
   * Kairo has no message key for this yet, so it's a prop with an English
   * default rather than something read from `KairoLocaleProvider`. Pass a
   * translated string when rendering a non-English UI.
   *
   * @default 'Clear selection'
   */
  'aria-label'?: string;
}

/**
 * Resets the value and the typed query. Base UI only mounts it while there is
 * something to clear (unless `keepMounted`), so it doesn't take up space in an
 * empty control. Renders a default X icon when no `children` are given.
 */
export const ComboboxClear = forwardRef<HTMLButtonElement, ComboboxClearComponentProps>(
  function ComboboxClear(
    { className, children, 'aria-label': ariaLabel = 'Clear selection', ...props },
    ref,
  ) {
    return (
      <BaseCombobox.Clear
        ref={ref}
        aria-label={ariaLabel}
        className={className ? `kairo-combobox-clear ${className}` : 'kairo-combobox-clear'}
        {...props}
      >
        {children ?? <ClearIcon />}
      </BaseCombobox.Clear>
    );
  },
);

ComboboxClear.displayName = 'ComboboxClear';

export interface ComboboxContentProps extends ComboboxPopupProps {
  /** Which side of the control to render the popup against. */
  side?: ComboboxPositionerProps['side'];
  /** How to align the popup relative to `side`. @default 'start' */
  align?: ComboboxPositionerProps['align'];
  /** Distance in pixels between the control and the popup. @default 8 */
  sideOffset?: ComboboxPositionerProps['sideOffset'];
  /**
   * A parent element to render the popup's portal into, instead of the
   * default `document.body`. Needed to portal into a shadow DOM, an iframe,
   * or the currently active fullscreen element, where `document.body` isn't
   * reachable or isn't the right paint target.
   */
  container?: ComboboxPortalProps['container'];
}

/**
 * Composes Base UI's `Combobox.Portal` > `Combobox.Positioner` +
 * `Combobox.Arrow` + `Combobox.Popup` so consumers write less. The forwarded
 * ref attaches to the popup element.
 *
 * Unlike `SelectContent`, this is *not* the listbox. Base UI gives
 * `Combobox.Popup` `role="presentation"` and puts `role="listbox"` on
 * `Combobox.List` instead, because the popup also has to hold non-option
 * content — chiefly `ComboboxEmpty`, whose `role="status"` live region would
 * be invalid ARIA as a child of a `listbox`. So render
 * `ComboboxEmpty` and `ComboboxList` as *siblings* inside this component.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  function ComboboxContent(
    { className, children, side, align = 'start', sideOffset = 8, container, ...props },
    ref,
  ) {
    const locale = useKairoLocale();
    return (
      <BaseCombobox.Portal container={container}>
        <BaseCombobox.Positioner side={side} align={align} sideOffset={sideOffset}>
          <BaseCombobox.Arrow className="kairo-combobox-arrow">
            <ArrowIcon />
          </BaseCombobox.Arrow>
          <BaseCombobox.Popup
            ref={ref}
            lang={locale}
            className={className ? `kairo-combobox-popup ${className}` : 'kairo-combobox-popup'}
            {...props}
          >
            {children}
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    );
  },
);

ComboboxContent.displayName = 'ComboboxContent';

export interface ComboboxListComponentProps extends ComboboxListProps {}

/**
 * The `role="listbox"` container for the items, rendered inside a
 * `ComboboxContent`.
 *
 * Pass a **function child** to render the filtered results — Base UI calls it
 * once per surviving item from the root's `items` prop, which is the only way
 * filtering reaches the DOM:
 *
 * ```tsx
 * <ComboboxList>
 *   {(item: Fruit) => (
 *     <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>
 *   )}
 * </ComboboxList>
 * ```
 *
 * Static element children are rendered verbatim and never filtered.
 */
export const ComboboxList = forwardRef<HTMLDivElement, ComboboxListComponentProps>(
  function ComboboxList({ className, ...props }, ref) {
    return (
      <BaseCombobox.List
        ref={ref}
        className={className ? `kairo-combobox-list ${className}` : 'kairo-combobox-list'}
        {...props}
      />
    );
  },
);

ComboboxList.displayName = 'ComboboxList';

export interface ComboboxItemComponentProps extends Omit<ComboboxItemProps, 'children'> {
  children?: ReactNode;
}

/**
 * An individual option. Renders a check-mark `Combobox.ItemIndicator` before
 * the label (only present in the DOM for the selected item; the
 * `.kairo-combobox-item` grid reserves its column regardless so unselected
 * items stay aligned with it).
 *
 * Base UI's Combobox has no `ItemText` part — unlike Select, the item's
 * children *are* the label — so the text is wrapped in a plain `<span>` purely
 * to own the second grid column.
 */
export const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemComponentProps>(
  function ComboboxItem({ className, children, ...props }, ref) {
    return (
      <BaseCombobox.Item
        ref={ref}
        className={className ? `kairo-combobox-item ${className}` : 'kairo-combobox-item'}
        {...props}
      >
        <BaseCombobox.ItemIndicator className="kairo-combobox-item-indicator">
          <CheckIcon />
        </BaseCombobox.ItemIndicator>
        <span className="kairo-combobox-item-text">{children}</span>
      </BaseCombobox.Item>
    );
  },
);

ComboboxItem.displayName = 'ComboboxItem';

export interface ComboboxEmptyComponentProps extends ComboboxEmptyProps {
  /**
   * The message shown when the query matches nothing.
   *
   * Kairo has no message key for this yet, so it's a prop with an English
   * default rather than something read from `KairoLocaleProvider`. Pass a
   * translated node when rendering a non-English UI.
   *
   * @default 'No results found'
   */
  children?: ReactNode;
}

/**
 * The no-results message, rendered as a sibling of `ComboboxList` inside
 * `ComboboxContent`. Only meaningful when the root has an `items` prop, since
 * that's the only case in which Base UI knows how many results survived
 * filtering.
 *
 * Base UI keeps this element mounted at all times — it is a `role="status"`
 * live region, and screen readers only announce mutations to a region that was
 * already present — and empties its *children* instead. So it must never be
 * hidden with `display: none` or conditional rendering; the stylesheet instead
 * collapses it with `:empty` so it costs no space while there are results.
 */
export const ComboboxEmpty = forwardRef<HTMLDivElement, ComboboxEmptyComponentProps>(
  function ComboboxEmpty({ className, children = 'No results found', ...props }, ref) {
    return (
      <BaseCombobox.Empty
        ref={ref}
        className={className ? `kairo-combobox-empty ${className}` : 'kairo-combobox-empty'}
        {...props}
      >
        {children}
      </BaseCombobox.Empty>
    );
  },
);

ComboboxEmpty.displayName = 'ComboboxEmpty';

export interface ComboboxGroupComponentProps extends ComboboxGroupProps {}

/** Groups related items with a `ComboboxGroupLabel`. */
export const ComboboxGroup = forwardRef<HTMLDivElement, ComboboxGroupComponentProps>(
  function ComboboxGroup({ className, ...props }, ref) {
    return (
      <BaseCombobox.Group
        ref={ref}
        className={className ? `kairo-combobox-group ${className}` : 'kairo-combobox-group'}
        {...props}
      />
    );
  },
);

ComboboxGroup.displayName = 'ComboboxGroup';

export interface ComboboxGroupLabelComponentProps extends ComboboxGroupLabelProps {}

/** An accessible label for a `ComboboxGroup`, automatically associated with it. */
export const ComboboxGroupLabel = forwardRef<HTMLDivElement, ComboboxGroupLabelComponentProps>(
  function ComboboxGroupLabel({ className, ...props }, ref) {
    return (
      <BaseCombobox.GroupLabel
        ref={ref}
        className={
          className ? `kairo-combobox-group-label ${className}` : 'kairo-combobox-group-label'
        }
        {...props}
      />
    );
  },
);

ComboboxGroupLabel.displayName = 'ComboboxGroupLabel';

export interface ComboboxSeparatorProps extends SeparatorProps {}

/**
 * A visual divider between items/groups in the list. Renders Base UI's generic
 * `Separator` (Combobox has no separator part of its own).
 *
 * Hidden from the accessibility tree (`aria-hidden="true"`) by default: the
 * `listbox` role only permits `option`/`group` children, so exposing a
 * `role="separator"` node inside it is invalid ARIA (and purely decorative
 * here anyway). Pass `aria-hidden={false}` to opt back into exposing it.
 */
export const ComboboxSeparator = forwardRef<HTMLDivElement, ComboboxSeparatorProps>(
  function ComboboxSeparator({ className, 'aria-hidden': ariaHidden = true, ...props }, ref) {
    return (
      <BaseSeparator
        ref={ref}
        aria-hidden={ariaHidden}
        className={className ? `kairo-combobox-separator ${className}` : 'kairo-combobox-separator'}
        {...props}
      />
    );
  },
);

ComboboxSeparator.displayName = 'ComboboxSeparator';

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

function ClearIcon() {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * The arrow tying the popup back to its control. Only the two slanted edges
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
      <path className="kairo-combobox-arrow-fill" d="M6 0 12 6H0z" />
      <path className="kairo-combobox-arrow-edge" d="M0 6 6 0l6 6" />
    </svg>
  );
}
