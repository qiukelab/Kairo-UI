'use client';

import { forwardRef } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type {
  DialogRootProps,
  DialogTriggerProps,
  DialogPopupProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
} from '@base-ui/react/dialog';
import { useKairoLocale } from '../i18n/use-kairo-messages';

export interface DialogProps extends DialogRootProps {}

/**
 * Kairo's Dialog (modal). Thin wrappers over Base UI's
 * `Dialog.Root`/`Trigger`/`Portal`/`Backdrop`/`Popup`/`Title`/`Description`/
 * `Close` anatomy — all interaction and accessibility logic (focus trapping,
 * scroll locking, Escape/outside-press dismissal, `role="dialog"`/
 * `aria-modal`) comes from `@base-ui/react`. Kairo only supplies the
 * `.kairo-dialog-backdrop`/`.kairo-dialog-popup` classes (via `DialogContent`,
 * below) so `@kairo-ui/theme` can style them purely off Base UI's
 * `data-starting-style`/`data-ending-style`/`data-open`/`data-closed`
 * attributes.
 *
 * `Dialog.Root` renders no DOM element of its own, so it's re-exported as-is.
 */
export const Dialog = BaseDialog.Root;

export interface DialogTriggerComponentProps extends DialogTriggerProps {}

/**
 * A button that opens the dialog. Renders a native `<button>` (or composes
 * with another element via its `render` prop).
 */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerComponentProps>(
  function DialogTrigger({ className, ...props }, ref) {
    return (
      <BaseDialog.Trigger
        ref={ref}
        className={className ? `kairo-dialog-trigger ${className}` : 'kairo-dialog-trigger'}
        {...props}
      />
    );
  },
);

DialogTrigger.displayName = 'DialogTrigger';

export interface DialogContentProps extends DialogPopupProps {}

/**
 * Composes Base UI's `Dialog.Portal` > `Dialog.Backdrop` + `Dialog.Popup` so
 * consumers write less: `<DialogContent>` renders the backdrop and the
 * popup's contents in one go. The forwarded ref attaches to the popup
 * element.
 *
 * Base UI's `Dialog.Popup` sets `role="dialog"` but, notably, doesn't add
 * `aria-modal` itself (modality is instead enforced via its focus-trapping
 * `FloatingFocusManager`, not the DOM attribute) — Kairo adds
 * `aria-modal="true"` here for the common modal case; pass `aria-modal={false}`
 * explicitly if you set the root's `modal` prop to `false`/`'trap-focus'`.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ className, children, ...props }, ref) {
    const locale = useKairoLocale();
    return (
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="kairo-dialog-backdrop" />
        <BaseDialog.Popup
          ref={ref}
          aria-modal="true"
          lang={locale}
          className={className ? `kairo-dialog-popup ${className}` : 'kairo-dialog-popup'}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    );
  },
);

DialogContent.displayName = 'DialogContent';

export interface DialogTitleComponentProps extends DialogTitleProps {}

/** A heading that labels the dialog. Renders an `<h2>` element. */
export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleComponentProps>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        ref={ref}
        className={className ? `kairo-dialog-title ${className}` : 'kairo-dialog-title'}
        {...props}
      />
    );
  },
);

DialogTitle.displayName = 'DialogTitle';

export interface DialogDescriptionComponentProps extends DialogDescriptionProps {}

/** A paragraph with additional information about the dialog. Renders a `<p>` element. */
export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionComponentProps>(
  function DialogDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        ref={ref}
        className={className ? `kairo-dialog-description ${className}` : 'kairo-dialog-description'}
        {...props}
      />
    );
  },
);

DialogDescription.displayName = 'DialogDescription';

export interface DialogCloseComponentProps extends DialogCloseProps {}

/** A button that closes the dialog. Renders a native `<button>` element. */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseComponentProps>(
  function DialogClose({ className, ...props }, ref) {
    return (
      <BaseDialog.Close
        ref={ref}
        className={className ? `kairo-dialog-close ${className}` : 'kairo-dialog-close'}
        {...props}
      />
    );
  },
);

DialogClose.displayName = 'DialogClose';
