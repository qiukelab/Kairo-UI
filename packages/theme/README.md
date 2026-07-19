# @kairo-ui/theme

Framework-agnostic CSS design tokens, presets and a tiny theming API for
Kairo. No React, no build step, no runtime dependencies — just CSS custom
properties (`--kairo-*`) and a handful of DOM helper functions, so it's
reusable by `@kairo-ui/react` today and by any future non-React port.

## Install

```bash
pnpm add @kairo-ui/theme
```

Import the stylesheet once, near the root of your app (e.g. `app/layout.tsx`
in Next.js, or `main.tsx` in Vite):

```ts
import '@kairo-ui/theme/styles.css';
```

That single entry point pulls in the tokens, base keyframes/focus-ring
styles, and every component's CSS.

## Overriding: your CSS always wins

Everything this package ships lives in a cascade layer:

```css
@layer kairo.tokens, kairo.base, kairo.components, kairo.overrides;
```

Unlayered CSS beats layered CSS no matter how specific the layered rule is, so
plain CSS of your own wins over Kairo without a specificity fight and without
`!important`:

```css
/* Beats `.kairo-btn[data-variant='solid']:hover:not(:disabled)` (0,4,0). */
.kairo-btn {
  background: rebeccapurple;
}
```

If you also use Tailwind (or anything else that layers its own output), pin the
order explicitly rather than letting your import order decide it:

```css
@layer theme, base, kairo, components, utilities;
@import '@kairo-ui/theme/styles.css';
@import 'tailwindcss';
```

`kairo` goes **after `base` and before `utilities`**, and both halves matter.
Tailwind's preflight lives in `base` and is
`*, ::before, ::after { border: 0 solid; margin: 0; padding: 0 }` — layer order
beats specificity outright, so listing `kairo` first strips the padding, borders
and backgrounds off every Kairo component with no warning of any kind. Putting
it before `utilities` is what makes `className="w-full"` on a Kairo component
work.

`kairo.overrides` is a supported extension point — put rules there when you
want them to beat Kairo's components but still lose to your utility classes:

```css
@layer kairo.overrides {
  .kairo-btn {
    border-radius: 0;
  }
}
```

Each stylesheet declares its own layer internally, so
`@kairo-ui/theme/css/components/button.css` imported on its own cascades
exactly like the bundle.

## Tokens

Every value components read is expressed as a CSS custom property on
`:root`, grouped as:

- **Surfaces & text** — `background`, `foreground`, `card`, `popover`, `muted` (+ `-foreground` pairs)
- **Intents** — `primary`, `secondary`, `accent`, `success`, `warning`, `danger` (+ `-foreground` pairs)
- **Structural** — `border`, `input`, `ring`
- **Radius** — `radius`, `radius-sm`, `radius-md`, `radius-lg`
- **Typography** — `font-sans`, `font-mono`
- **Shadow** — `shadow-sm`, `shadow-md`, `shadow-lg`
- **Motion** — `duration-fast/normal/slow`, `ease-standard/emphasized/out`

Colors are authored in `oklch()`, and every `*-foreground` token is tuned to
meet WCAG AA contrast (≥ 4.5:1) against the surface it pairs with. Non-color
tokens (radius, typography, shadow, motion) are declared once and shared by
every preset and mode.

## Theming

Kairo ships three presets — **Black**, **Blue** and **Pink** — each with
a light and dark variant, plus a tiny, SSR-safe JS API to switch between
them at runtime:

```ts
import { setMode, setPreset, setTheme, themes } from '@kairo-ui/theme';

setMode('dark'); // toggles the `.dark` class on <html>
setPreset('blue'); // sets `data-kairo-theme="blue"` on <html>
setTheme({ preset: 'pink', mode: 'light' }); // both at once

themes; // => readonly manifest: [{ id, label, swatch }, ...] for building UI pickers
```

Under the hood:

- **Mode** (`setMode`) toggles a `.dark` class on `document.documentElement`.
  Every token declares a light (`:root`) and dark (`.dark`) value.
- **Preset** (`setPreset`) sets a `data-kairo-theme="blue" | "pink"`
  attribute on `document.documentElement`. The `"default"` preset is simply
  the absence of the attribute, since it's expressed as the bare `:root` /
  `.dark` selectors.
- Both mechanisms are independent and composable — any preset can be
  combined with either mode.

All three functions guard against `document` being undefined, so they're
safe to call during SSR/RSC rendering — they simply no-op until the client
mounts.

## Zero runtime dependencies

This package has no dependencies of its own — it's plain CSS plus a few
DOM one-liners. It's designed to be the shared theming layer under any
future Kairo port (Vue, Svelte, etc.), not just `@kairo-ui/react`.

## License

MIT
