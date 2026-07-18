'use client';

import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ToastProviderProps as BaseToastProviderProps, ToastObject } from '@base-ui/react/toast';
import { useKairoLocale, useKairoMessages } from '../i18n/use-kairo-messages';

export interface ToastProviderProps extends BaseToastProviderProps {
  /**
   * Merged with the base `kairo-toast-viewport` class on the viewport
   * element Kairo renders internally (see below).
   */
  viewportClassName?: string;
  /**
   * The internal dismiss button's `aria-label`. Overrides both the nearest
   * `KairoLocaleProvider`'s `toastDismissLabel` message and the built-in
   * `'Dismiss notification'` default. A zero-setup escape hatch for
   * localising the close button without mounting a provider.
   */
  dismissLabel?: string;
}

/**
 * Kairo's Toast provider. Wraps Base UI's `Toast.Provider` and additionally
 * renders a styled `Toast.Portal` > `Toast.Viewport` — populated with a
 * default styled row (`Toast.Root` + `Toast.Title` + `Toast.Description` +
 * optional `Toast.Action` + a close button) per queued toast — so consumers
 * get a complete, working toast stack out of the box without touching Base
 * UI's anatomy themselves. The close button is Kairo's own, not Base UI's
 * `Toast.Close` — see the comment above `CloseButton` for why.
 *
 * Mount this once near the root of your app, then call {@link useToast} (or
 * a manager created via {@link createToastManager}) from anywhere inside it
 * to queue a toast:
 *
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * function SaveButton() {
 *   const toast = useToast();
 *   return (
 *     <button onClick={() => toast.add({ title: 'Saved', description: 'Your changes have been saved.' })}>
 *       Save
 *     </button>
 *   );
 * }
 * ```
 *
 * This bundled-viewport shape is deliberately the *only* one Kairo exposes
 * (Base UI's own primitives — `Toast.Root`/`Title`/`Description`/`Action`/
 * `Close`/`Positioner`/`Arrow` — are still available directly from
 * `@base-ui/react/toast` for advanced cases, e.g. anchored toasts or
 * multiple independent viewports, which need more than one `Toast.Provider`
 * and are out of scope for this convenience wrapper).
 */
export function ToastProvider({
  viewportClassName,
  dismissLabel,
  children,
  ...providerProps
}: ToastProviderProps) {
  const locale = useKairoLocale();
  return (
    <BaseToast.Provider {...providerProps}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport
          lang={locale}
          className={
            viewportClassName ? `kairo-toast-viewport ${viewportClassName}` : 'kairo-toast-viewport'
          }
        >
          <ToastList dismissLabel={dismissLabel} />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

/** Reads the live toast queue from context and renders one row per toast. */
function ToastList({ dismissLabel }: { dismissLabel: string | undefined }) {
  const { toasts, close } = BaseToast.useToastManager();
  return (
    <>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} dismissLabel={dismissLabel} onDismiss={close} />
      ))}
    </>
  );
}

/**
 * Kairo's default styled toast row: `Toast.Root` with a title (if given), a
 * description (if given), an action button (if the toast was added with
 * `actionProps`), and a close button. This is not exported — it's the
 * implicit rendering `ToastProvider` uses for every queued toast.
 *
 * The close button is a plain native `<button>` wired directly to the
 * manager's `close(id)`, not Base UI's `Toast.Close` — see the comment above
 * `CloseButton` for why.
 */
function ToastItem({
  toast,
  dismissLabel,
  onDismiss,
}: {
  toast: ToastObject<Record<string, unknown>>;
  dismissLabel: string | undefined;
  onDismiss: (id?: string) => void;
}) {
  return (
    <BaseToast.Root toast={toast} className="kairo-toast">
      {toast.title ? <BaseToast.Title className="kairo-toast-title">{toast.title}</BaseToast.Title> : null}
      {toast.description ? (
        <BaseToast.Description className="kairo-toast-description">
          {toast.description}
        </BaseToast.Description>
      ) : null}
      {toast.actionProps ? (
        <BaseToast.Action
          {...toast.actionProps}
          className={
            toast.actionProps.className
              ? `kairo-toast-action ${toast.actionProps.className}`
              : 'kairo-toast-action'
          }
        />
      ) : null}
      <CloseButton
        toastType={toast.type}
        dismissLabel={dismissLabel}
        onClick={() => onDismiss(toast.id)}
      />
    </BaseToast.Root>
  );
}

/**
 * A plain, always-exposed dismiss button — deliberately *not* Base UI's
 * `Toast.Close`.
 *
 * `Toast.Close` sets `aria-hidden` on itself whenever the viewport isn't
 * "expanded" (i.e. hovered/focused) and the button itself doesn't have
 * focus (see `ToastClose.mjs`). That's by design for Base UI's own demo,
 * which uses a collapsed "peeking" card stack where only the frontmost
 * toast is meaningfully visible until the stack expands — hiding background
 * toasts' dismiss buttons from assistive tech avoids exposing controls for
 * cards a sighted user can't see either. Kairo's viewport is a plain
 * `flex-direction: column-reverse` stack (see `toast.css`) where every toast
 * is always fully visible, so that gating would (incorrectly, for this
 * layout) hide the dismiss control from screen readers by default — a real
 * regression, since "accessible by default" is the whole point. There's no
 * supported Provider/Viewport prop to force the `expanded` state that
 * `Toast.Close` reads (it's derived purely from internal hover/focus
 * tracking on the viewport — see `store.mjs`'s `hovering`/`focused`
 * fields), so this renders its own button and calls the toast manager's
 * `close(id)` directly (the exact call `Toast.Close`'s `onClick` makes
 * internally) instead.
 *
 * The only things this intentionally does *not* reproduce from
 * `Toast.Close`: `render`-prop composition and `nativeButton`/`disabled`
 * handling via Base UI's internal `useButton` (irrelevant here — this
 * always renders a real native `<button>`), and the `data-type` state
 * attribute (replicated manually below via `toastType`).
 *
 * Its `aria-label` resolves, in order: the `dismissLabel` prop passed down
 * from `ToastProvider` → the nearest `KairoLocaleProvider`'s
 * `toastDismissLabel` message → the built-in `'Dismiss notification'`
 * default.
 */
function CloseButton({
  toastType,
  dismissLabel,
  onClick,
}: {
  toastType: string | undefined;
  dismissLabel: string | undefined;
  onClick: () => void;
}) {
  const messages = useKairoMessages();
  return (
    <button
      type="button"
      className="kairo-toast-close"
      aria-label={dismissLabel ?? messages.toastDismissLabel}
      data-type={toastType}
      onClick={onClick}
    >
      <CloseIcon />
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * Returns the current toast queue plus imperative methods (`add`/`close`/
 * `update`/`promise`) to manage it. Must be called from a component rendered
 * inside {@link ToastProvider} — thin wrapper over Base UI's
 * `Toast.useToastManager()`, which throws otherwise.
 */
export function useToast<Data extends object = Record<string, unknown>>() {
  return BaseToast.useToastManager<Data>();
}

/**
 * Creates a standalone toast manager that can queue toasts from outside the
 * React tree entirely (e.g. a fetch handler or router loader), not just from
 * components rendered under `ToastProvider`. Pass the result to
 * `ToastProvider`'s `toastManager` prop so it renders whatever the manager
 * queues. Thin re-export of Base UI's `Toast.createToastManager`.
 */
export const createToastManager = BaseToast.createToastManager;

export type {
  ToastObject,
  ToastManager,
  ToastManagerAddOptions,
  ToastManagerUpdateOptions,
  ToastManagerPromiseOptions,
  UseToastManagerReturnValue,
} from '@base-ui/react/toast';
