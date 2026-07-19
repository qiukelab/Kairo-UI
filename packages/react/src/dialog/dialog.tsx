'use client';

import { createContext, forwardRef, useContext } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type {
  DialogRootProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogPopupProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
} from '@base-ui/react/dialog';
import { useKairoLocale } from '../i18n/use-kairo-messages';

/**
 * The resolved value of the root's `modal` prop: `true` (focus trapped, page
 * scroll locked, outside pointer interaction disabled), `false` (the rest of
 * the document stays fully usable) or `'trap-focus'` (focus trapped, but page
 * scroll and outside pointer interaction stay enabled).
 */
type DialogModality = NonNullable<DialogRootProps['modal']>;

/**
 * Publishes the root's resolved `modal` value to `DialogContent`, which needs
 * it to decide whether to render a backdrop at all (see `DialogContent`).
 * Base UI keeps `modal` in an internal store and exposes it neither as a
 * context/hook nor as a data attribute on any part — verified against
 * `@base-ui/react@1.6.0`'s installed source: `DialogPopup`'s state is
 * `{ open, nested, transitionStatus, nestedDialogOpen }` and `DialogBackdrop`'s
 * is `{ open, transitionStatus }`, and `dialog/index.parts.js` exports no
 * context hook. So Kairo has to carry it itself, exactly as it already carries
 * `side` for `Drawer`.
 *
 * Defaults to `true` to match Base UI's own default, so a `DialogContent`
 * rendered under a bare `@base-ui/react` `Dialog.Root` still gets a backdrop.
 */
const DialogModalityContext = createContext<DialogModality>(true);

export interface DialogProps<Payload = unknown> extends DialogRootProps<Payload> {}

/**
 * Kairo's Dialog. Thin wrappers over Base UI's `Dialog.Root`/`Trigger`/
 * `Portal`/`Backdrop`/`Popup`/`Title`/`Description`/`Close` anatomy — all
 * interaction and accessibility logic (focus trapping, scroll locking,
 * Escape/outside-press dismissal, `role="dialog"`, and the `aria-hidden`/inert
 * treatment of everything outside the popup) comes from `@base-ui/react`.
 * Kairo only supplies the `.kairo-dialog-backdrop`/`.kairo-dialog-popup`
 * classes (via `DialogContent`, below) so `@kairo-ui/theme` can style them
 * purely off Base UI's `data-starting-style`/`data-ending-style`/`data-open`/
 * `data-closed` attributes.
 *
 * Unlike Base UI's root (which this used to re-export as-is), this renders a
 * context provider around it so `DialogContent` can read back the resolved
 * `modal` value; it still renders no DOM element of its own. The `Payload`
 * type parameter is threaded through so `<Dialog handle={...}>` keeps
 * inferring the payload type of a render-function child.
 */
export function Dialog<Payload = unknown>({ modal = true, ...props }: DialogProps<Payload>) {
  return (
    <DialogModalityContext.Provider value={modal}>
      <BaseDialog.Root<Payload> {...props} modal={modal} />
    </DialogModalityContext.Provider>
  );
}

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

export interface DialogContentProps extends DialogPopupProps {
  /**
   * A parent element to render the portal element into. Forwarded to Base
   * UI's `Dialog.Portal` (which `DialogContent` renders internally, so it is
   * otherwise unreachable), unblocking shadow roots, iframe documents and
   * Fullscreen API containers — a dialog portalled to `document.body` is
   * invisible while another element is fullscreen. Defaults to `<body>`.
   */
  container?: DialogPortalProps['container'];
}

/**
 * Composes Base UI's `Dialog.Portal` > `Dialog.Backdrop` + `Dialog.Popup` so
 * consumers write less: `<DialogContent>` renders the backdrop and the
 * popup's contents in one go. The forwarded ref attaches to the popup
 * element.
 *
 * ### No `aria-modal`
 *
 * This deliberately sets no `aria-modal`, matching what Base UI itself does.
 * Modality is conveyed to assistive tech by `FloatingFocusManager` marking
 * every element outside the popup `aria-hidden`/inert (verified in
 * `@base-ui/react@1.6.0`: `DialogPopup` renders `<FloatingFocusManager
 * modal={modal !== false}>`, which calls `markOthers(..., { ariaHidden: modal })`),
 * which is both better supported by screen readers than `aria-modal` and, unlike
 * the attribute, actually reflects the root's `modal` prop. Radix UI reaches the
 * same conclusion in `DialogContentModal` — it calls `hideOthers()` under the
 * comment "aria-hide everything except the content (better supported equivalent
 * to setting `aria-modal`)" and likewise emits no `aria-modal`.
 *
 * Kairo previously hardcoded `aria-modal="true"` here. That was a lie for any
 * `<Dialog modal={false}>`: the rest of the page stays interactive and is *not*
 * aria-hidden, yet the popup claimed the whole document was inert. Deriving the
 * attribute from the root's `modal` value would have been possible (see
 * `DialogModalityContext`) but pointless — with the outside already hidden, a
 * correct `aria-modal` adds nothing, and known screen-reader bugs around it make
 * "nothing" the better answer.
 *
 * ### The backdrop is only rendered when fully modal
 *
 * `.kairo-dialog-backdrop` is `position: fixed; inset: 0` and purely
 * decorative — Base UI does its own pointer blocking with a separate internal
 * backdrop that it renders from `Dialog.Portal` only when `modal === true`.
 * Rendering Kairo's on top of a `modal={false}`/`'trap-focus'` dialog therefore
 * dimmed and swallowed clicks on a page that both Base UI and its docs say
 * stays interactive, which made those two modes unusable. So the backdrop is
 * skipped unless the root resolved `modal` to `true`, the same call Radix's
 * `DialogOverlay` makes (`return context.modal ? <DialogOverlayImpl/> : null`).
 * Not rendering it also *restores* outside-press dismissal under
 * `'trap-focus'`: Base UI's `useDismiss` only accepts an outside press whose
 * target is the backdrop when a backdrop exists, and accepts any outside press
 * when none does. Render your own overlay inside the popup's tree if a
 * non-modal dialog needs a scrim.
 *
 * When a `KairoLocaleProvider` with a `locale` is mounted above it, this also
 * sets `lang` on the popup — Base UI portals it to `document.body`, outside
 * any `lang` set further up the tree, so CSS `:lang()` rules can't otherwise
 * reach it. Pass `lang` explicitly to override.
 */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { className, children, container, ...props },
  ref,
) {
  const locale = useKairoLocale();
  const modal = useContext(DialogModalityContext);
  return (
    <BaseDialog.Portal container={container}>
      {modal === true && <BaseDialog.Backdrop className="kairo-dialog-backdrop" />}
      <BaseDialog.Popup
        ref={ref}
        lang={locale}
        className={className ? `kairo-dialog-popup ${className}` : 'kairo-dialog-popup'}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
});

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
