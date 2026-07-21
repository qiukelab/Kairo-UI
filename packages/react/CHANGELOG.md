# @kairo-ui/react

## 0.1.0

### Minor Changes

- 54cde3e: Add Avatar, Checkbox and Tabs components
- 54cde3e: Add Button component
- a75fd15: Add Popover component
- 54cde3e: Add Tooltip and Dialog components
- a75fd15: Add Select component
- 54cde3e: Add Spinner, Badge, Card and Input components
- 54cde3e: Add Switch component
- a75fd15: Add Toast component
- 6b998fb: Localisable component strings and `lang` forwarding for portalled popups.

  - New `KairoLocaleProvider` plus `useKairoMessages()` / `useKairoLocale()` and an exported `defaultMessages`. Strings resolve as explicit prop → provider → default, and components work unwrapped.
  - `Toast` gains a `dismissLabel` prop. Its close button previously hardcoded `aria-label="Dismiss notification"` with no way to override it, so a non-English app could not localise it at all.
  - Dialog, Tooltip, Popover, Select and Toast now set `lang` on their portalled popup when a locale is provided. Base UI portals these into `document.body`, so language-dependent CSS (such as Thai leading rules) could never reach them from the consumer's tree.
  - `Spinner` stays RSC-safe — it does not read context and carries no `'use client'`; only the origin of its default label changed. Pass `aria-label` to localise it from a Server Component.
  - `defaultMessages` is importable from a Server Component (the module has no React import).

- f620dc7: Add 14 components, taking the set from 14 to 28

  Display and disclosure: Separator, Progress, Meter, Accordion, Collapsible.

  Form controls: RadioGroup, Slider, NumberField, ToggleGroup, Combobox.

  Portalled popups: Menu, ContextMenu, AlertDialog, Drawer.

  Every component follows the established pattern: a thin wrapper over the
  matching Base UI primitive, with all styling shipped as vanilla CSS from
  `@kairo-ui/theme`. Each is available both from the package root and as its
  own subpath export (e.g. `@kairo-ui/react/radio-group`). Separator, Progress
  and Meter carry no `'use client'` directive and render in React Server
  Components.

- 3b8ce29: Make non-modal dialogs, alert dialogs and drawers actually usable, and let popups portal anywhere

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
