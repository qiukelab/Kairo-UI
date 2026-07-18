---
'@kairo-ui/react': minor
---

Localisable component strings and `lang` forwarding for portalled popups.

- New `KairoLocaleProvider` plus `useKairoMessages()` / `useKairoLocale()` and an exported `defaultMessages`. Strings resolve as explicit prop → provider → default, and components work unwrapped.
- `Toast` gains a `dismissLabel` prop. Its close button previously hardcoded `aria-label="Dismiss notification"` with no way to override it, so a non-English app could not localise it at all.
- Dialog, Tooltip, Popover, Select and Toast now set `lang` on their portalled popup when a locale is provided. Base UI portals these into `document.body`, so language-dependent CSS (such as Thai leading rules) could never reach them from the consumer's tree.
- `Spinner` stays RSC-safe — it does not read context and carries no `'use client'`; only the origin of its default label changed. Pass `aria-label` to localise it from a Server Component.
- `defaultMessages` is importable from a Server Component (the module has no React import).
