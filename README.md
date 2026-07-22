<div align="center">
  <img src=".github/assets/kairo-banner.svg" alt="Kairo" width="640" />

  <p>
    <strong>Lightweight, accessible React components with a CSS-first theme system.</strong>
  </p>

[![License: MIT](https://img.shields.io/github/license/yindeejs/kairo-ui)](./LICENSE)
[![CI](https://github.com/yindeejs/kairo-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/yindeejs/kairo-ui/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40kairo-ui%2Freact.svg)](https://www.npmjs.com/package/@kairo-ui/react)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-blue.svg)](https://www.typescriptlang.org/)
</div>

<br />

Kairo is a small, no-frills React component library for people who want
accessible, well-designed UI primitives **without** buying into Tailwind,
a CSS-in-JS runtime, or a heavy dependency tree. Styling is plain, compiled
CSS driven by `--kairo-*` custom properties — the same approach popularized
by shadcn/ui — so you get full theming control while keeping your bundle
small. It's a great fit if you're building a Next.js (App Router) or Vite
app and want components that are both easy to restyle and safe to drop into
Server Components.

## Features

- **No Tailwind required** — ships plain CSS + design tokens, drop it into any React app.
- **Next.js & Vite ready** — static components render as zero-JS Server Components in the App Router; interactive ones ship their own `'use client'` boundary. Works just as well in Vite.
- **Full theming** — light/dark mode plus swappable presets (Black, Blue, Pink), all driven by CSS variables and a tiny `setTheme` API — à la shadcn/HeroUI.
- **CSS-first animations** — transitions and keyframes live in CSS, not a JS animation runtime, and respect `prefers-reduced-motion` out of the box.
- **Accessible by default** — interactive components are built on [Base UI](https://base-ui.com) for correct ARIA semantics, keyboard support and focus management.
- **Tree-shakeable** — import from the root or per-component subpaths (`@kairo-ui/react/button`) so bundlers only ship what you use.
- **React 18 & 19** — works with both current major versions as peer dependencies.

## Quick start

```bash
pnpm add @kairo-ui/react @kairo-ui/theme
```

```tsx
// import the tokens + base styles once, e.g. in your root layout / main entry
import '@kairo-ui/theme/styles.css';

import { Button } from '@kairo-ui/react';

export function Example() {
  return <Button>Click me</Button>;
}
```

The full getting-started guide (Next.js App Router and Vite), theming docs
and component reference live in the docs site (`apps/docs`) — see
[Documentation](#documentation) below for how to run it locally.

## Components

28 components, built as thin wrappers over native elements or
[Base UI](https://base-ui.com) primitives. **RSC-safe** means the component
carries no `'use client'` directive and can render as a zero-JS Server
Component in the Next.js App Router.

| Category       | Components                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **Forms**      | Button ⚡, Input ⚡, Number Field, Select, Combobox, Checkbox, Radio Group, Switch, Toggle Group, Slider |
| **Navigation** | Tabs                                                                                                     |
| **Display**    | Badge ⚡, Avatar, Card ⚡, Spinner ⚡, Separator ⚡, Progress ⚡, Meter ⚡                                |
| **Disclosure** | Accordion, Collapsible                                                                                   |
| **Overlay**    | Popover, Tooltip, Menu, Context Menu, Dialog, Alert Dialog, Drawer, Toast                                |

⚡ = RSC-safe (no `'use client'`). Everything else declares its own client
boundary, so you never need to add `'use client'` yourself just to use it.

## Theming

Every color, radius, shadow and motion curve is a `--kairo-*` CSS variable,
grouped into swappable **presets** (Black, Blue, Pink) with light/dark
variants for each. Switch either at runtime with the zero-dependency,
SSR-safe theme API from `@kairo-ui/theme`:

```ts
import { setPreset, setMode } from '@kairo-ui/theme';

setPreset('blue'); // sets data-kairo-theme="blue" on <html>
setMode('dark'); // toggles the .dark class on <html>
```

## Documentation

The docs site (Fumadocs + Next.js, in `apps/docs`) has the full
getting-started guide, theming reference and a live preview for every
component. It isn't hosted yet — run it locally:

```bash
pnpm install
pnpm --filter @kairo-ui/docs dev
```

## Contributing

Contributions are very welcome — whether it's a bug fix, a new component, a
docs improvement, or just filing a well-written issue. Check the
[open issues](https://github.com/yindeejs/kairo-ui/issues) (look for
`good first issue`) or start a
[discussion](https://github.com/yindeejs/kairo-ui/discussions) if you'd
like to propose something bigger first.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full setup guide,
conventions for adding a component, and the verification checklist. Please
also read our [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — we want this to
be a welcoming project for everyone.

## Roadmap

Kairo has 28 components, theming and a full docs site — `v0.1.0` is being
prepared for its first npm publish (both packages are still at `0.0.0`).
Where things stand:

- **Done** — the 14 → 28 component expansion, pushing/merging to GitHub,
  and CSS `@layer`s + Lightning CSS minification + typed tokens.
- **Planned, not started** — migrating the toolchain from ESLint/Prettier
  to oxlint/oxfmt.
- **Pending** — hosting the docs site (it only runs locally today),
  publishing to npm (see [`PUBLISHING.md`](./PUBLISHING.md)), and flipping
  the GitHub repo to public.
- **Later** — `@kairo-ui/motion-react` (already built, but kept `private`
  and held out of the v0.1.0 publish on purpose), a Vue port
  (`@kairo-ui/vue`), Color/ListBox/TagGroup components, a
  Field/Fieldset/Form primitive cluster, npm provenance, and a Tailwind
  token bridge.

## License

[MIT](./LICENSE)
