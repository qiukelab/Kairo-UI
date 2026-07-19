'use client';

import { forwardRef } from 'react';
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import type {
  AlertDialogRootProps,
  AlertDialogTriggerProps,
  AlertDialogPopupProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogCloseProps,
} from '@base-ui/react/alert-dialog';
import { useKairoLocale } from '../i18n/use-kairo-messages';

export interface AlertDialogProps extends AlertDialogRootProps {}

/**
 * Kairo's AlertDialog — an interrupting dialog that demands an explicit
 * decision (e.g. "Delete this project?"), unlike `Dialog`'s ordinary,
 * freely-dismissible modal. Thin wrappers over Base UI's `AlertDialog.Root`/
 * `Trigger`/`Portal`/`Backdrop`/`Popup`/`Title`/`Description`/`Close`
 * anatomy. Under the hood, Base UI's `AlertDialog` *is* `Dialog` running in a
 * different mode: `AlertDialog.Backdrop`/`Portal`/`Popup`/`Title`/
 * `Description`/`Close` are the exact same `Dialog.*` components re-exported
 * — only `Root` and `Trigger` are alert-dialog-specific.
 *
 * The "can't be casually dismissed" contract is enforced by Base UI itself,
 * not by anything Kairo configures:
 *   - `role="alertdialog"` is set automatically. `Dialog.Popup` (which
 *     `AlertDialog.Popup` literally is) reads its `role` off the store that
 *     `AlertDialog.Root` seeds with `role: 'alertdialog'` — Kairo never sets
 *     a `role` prop here.
 *   - `modal` is hard-coded to `true` inside Base UI — `AlertDialogRootProps`
 *     omits the `modal` prop entirely, so (unlike `Dialog`) it can't be
 *     relaxed to `false`/`'trap-focus'`.
 *   - `disablePointerDismissal` is likewise hard-coded to `true` and omitted
 *     from the props: clicking the backdrop, or anywhere else outside the
 *     popup, never closes an alert dialog. This is the entire reason the
 *     component exists, and it comes from `@base-ui/react`'s
 *     `useDialogRoot`/`useDismiss` wiring, not from a Kairo-authored
 *     click handler.
 *
 * What Base UI does *not* do for you: Escape still closes the dialog
 * (`useDialogRoot`'s `useDismiss` call passes `escapeKey: isTopmost`
 * unconditionally — `disablePointerDismissal` only suppresses the
 * *outside-press* dismiss reason, not the Escape one). Kairo deliberately
 * leaves this enabled rather than intercepting `onOpenChange` to cancel it:
 * an accidental backdrop click has nothing to do with the decision being
 * asked, whereas a keyboard Escape is itself a deliberate act, equivalent to
 * the explicit "Cancel" affordance every alert dialog already offers.
 * Consumers who need to disable even that can pass `onOpenChange` and call
 * `eventDetails.cancel()` when `eventDetails.reason === 'escapeKey'`.
 *
 * `AlertDialog.Root` renders no DOM element of its own, so it's re-exported
 * as-is.
 */
export const AlertDialog = BaseAlertDialog.Root;

export interface AlertDialogTriggerComponentProps extends AlertDialogTriggerProps {}

/**
 * A button that opens the alert dialog. Renders a native `<button>` (or
 * composes with another element via its `render` prop).
 */
export const AlertDialogTrigger = forwardRef<HTMLButtonElement, AlertDialogTriggerComponentProps>(
  function AlertDialogTrigger({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Trigger
        ref={ref}
        className={className ? `kairo-alert-dialog-trigger ${className}` : 'kairo-alert-dialog-trigger'}
        {...props}
      />
    );
  },
);

AlertDialogTrigger.displayName = 'AlertDialogTrigger';

export interface AlertDialogContentProps extends AlertDialogPopupProps {}

/**
 * Composes Base UI's `AlertDialog.Portal` > `AlertDialog.Backdrop` +
 * `AlertDialog.Popup` so consumers write less: `<AlertDialogContent>`
 * renders the backdrop and the popup's contents in one go. The forwarded ref
 * attaches to the popup element.
 *
 * Base UI's `AlertDialog.Popup` sets `role="alertdialog"` but, notably,
 * doesn't add `aria-modal` itself (modality is instead enforced via its
 * focus-trapping `FloatingFocusManager`, not the DOM attribute) — Kairo adds
 * `aria-modal="true"` here, matching `DialogContent`.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent({ className, children, ...props }, ref) {
    const locale = useKairoLocale();
    return (
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop className="kairo-alert-dialog-backdrop" />
        <BaseAlertDialog.Popup
          ref={ref}
          aria-modal="true"
          lang={locale}
          className={className ? `kairo-alert-dialog-popup ${className}` : 'kairo-alert-dialog-popup'}
          {...props}
        >
          {children}
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    );
  },
);

AlertDialogContent.displayName = 'AlertDialogContent';

export interface AlertDialogTitleComponentProps extends AlertDialogTitleProps {}

/** A heading that labels the alert dialog. Renders an `<h2>` element. */
export const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleComponentProps>(
  function AlertDialogTitle({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Title
        ref={ref}
        className={className ? `kairo-alert-dialog-title ${className}` : 'kairo-alert-dialog-title'}
        {...props}
      />
    );
  },
);

AlertDialogTitle.displayName = 'AlertDialogTitle';

export interface AlertDialogDescriptionComponentProps extends AlertDialogDescriptionProps {}

/** A paragraph with additional information about the decision being asked for. Renders a `<p>` element. */
export const AlertDialogDescription = forwardRef<
  HTMLParagraphElement,
  AlertDialogDescriptionComponentProps
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Description
      ref={ref}
      className={className ? `kairo-alert-dialog-description ${className}` : 'kairo-alert-dialog-description'}
      {...props}
    />
  );
});

AlertDialogDescription.displayName = 'AlertDialogDescription';

export interface AlertDialogCloseComponentProps extends AlertDialogCloseProps {}

/**
 * A button that closes the alert dialog — use it for both the "Cancel" and
 * the confirming/destructive action, attaching your own `onClick` to the
 * latter for any side effect that should run before it closes. Renders a
 * native `<button>` element.
 */
export const AlertDialogClose = forwardRef<HTMLButtonElement, AlertDialogCloseComponentProps>(
  function AlertDialogClose({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Close
        ref={ref}
        className={className ? `kairo-alert-dialog-close ${className}` : 'kairo-alert-dialog-close'}
        {...props}
      />
    );
  },
);

AlertDialogClose.displayName = 'AlertDialogClose';
