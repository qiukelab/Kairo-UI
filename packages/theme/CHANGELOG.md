# @kairo-ui/theme

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
- 6b998fb: Sharper, border-led visual language and correct Thai typography.

  **Design**

  - Corners are square. `--kairo-radius`, `--kairo-radius-sm`, `--kairo-radius-md` and `--kairo-radius-lg` are all `0px`, and the scale is now explicit instead of derived from a `calc()` chain. Shape is carried by borders and the focus ring rather than by rounding. Every tier is still its own token, so rounding can be reintroduced in one line: `:root { --kairo-radius: 8px; --kairo-radius-sm: 6px; --kairo-radius-lg: 10px }`. The new `--kairo-radius-full` is used by Avatar, Spinner and the Switch, which are round by function and unaffected.
  - New structural tokens: `--kairo-border-width`, `--kairo-ring-width`, `--kairo-ring-offset`. Focus rings are now uniform — previously offsets varied between 1px, 2px and -2px.
  - Elevation is border-led. Dialog, Tooltip and the Select popup previously had no border at all; all five floating surfaces now carry one. Shadows were retightened and split into `--kairo-shadow-color` + `--kairo-shadow-strength` so dark mode can retune them — a black shadow is invisible on a dark surface, so dark elevation now reads through brighter border contrast.
  - The Tabs indicator is square; Switch, Avatar and Spinner stay round.

  **Thai typography**

  - `--kairo-font-sans` now includes Thai families (Noto Sans Thai, IBM Plex Sans Thai, Sarabun, Leelawadee UI, Thonburi). No webfont is downloaded — Leelawadee UI ships with Windows and Thonburi with macOS/iOS. This also fixes a latent bug where the generic `sans-serif` preceded the emoji families, making them unreachable.
  - New leading tokens (`--kairo-leading-tight` 1.4 / `-normal` 1.5 / `-relaxed` 1.65). Thai stacks diacritics above and below the base character, so the previous `line-height: 1` on Button, Badge and the Avatar fallback clipped tone marks and below-vowels. No component uses a raw line-height number any more.
  - Text-bearing controls (Button, Input, Select trigger, Badge, Toast action) size with `min-height` + vertical padding instead of a fixed `height`, so tall Thai glyph stacks can grow. Input previously had zero vertical padding, which clipped inside the input's own content box.
  - Popups now declare `font-family` — Tooltip, Dialog, Popover, the Select popup and Toast text previously inherited the host page font, so Thai fell back inconsistently.
  - `base.css` adds a `:lang(th)` block (more generous leading, `white-space: normal` on Button/Badge since Thai has no inter-word spaces, and a guard against negative letter-spacing) and `box-sizing: border-box` scoped to Kairo's own elements.

  **Migration note**: `--kairo-radius` no longer derives the `sm` and `lg` tiers — it now maps to `md` only. If you overrode `--kairo-radius` to reshape the whole system, set `--kairo-radius-sm` and `--kairo-radius-lg` as well.

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
