---
"@kairo-ui/theme": minor
"@kairo-ui/react": minor
---

Make non-modal dialogs, alert dialogs and drawers actually usable, and let popups portal anywhere

**`modal={false}` and `modal="trap-focus"` now work.** Previously the decorative
backdrop rendered regardless of modality — a full-screen, half-opaque layer with
no `pointer-events: none`, so a "non-modal" dialog still dimmed the page and
swallowed every click behind it. The backdrop is now rendered only for a modal
root. Base UI supplies its own internal backdrop for pointer blocking when it is
genuinely modal, so nothing is lost. Verified in a browser: with a non-modal
drawer open, a click lands on the element behind it and that element's handler
runs; with a modal one, it is correctly blocked.

Two consequences worth knowing:

- Under `modal="trap-focus"`, outside-press dismissal now behaves as documented.
  It previously required pressing the backdrop specifically; with no backdrop in
  the way, any outside press dismisses.
- `Drawer`'s viewport spans the screen and cannot be removed (Base UI needs it
  for swipe handling), so it is now marked `data-modal` and made click-through
  when non-modal.

**`aria-modal="true"` is no longer emitted.** It was hardcoded on every dialog,
alert dialog and drawer popup, which made `modal={false}` announce itself to
screen readers as modal when it was not. Modality is conveyed by marking
everything outside the popup `aria-hidden`/inert — which tracks the root's
`modal` prop, unlike the attribute did. This matches both Base UI and Radix,
which deliberately emit no `aria-modal` for the same reason.

**New `container` prop** on `Dialog`, `AlertDialog`, `Drawer`, `Menu`,
`ContextMenu`, `Combobox`, `Select`, `Popover` and `Tooltip`, forwarded to the
portal. Popups default to `document.body`; pass `container` to mount them into a
shadow root, an iframe document, or the current fullscreen element instead.
