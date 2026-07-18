# @kairo-ui/react

React components for Kairo — lightweight, accessible, and styled entirely
through [`@kairo-ui/theme`](../theme)'s CSS variables. No Tailwind required,
no CSS-in-JS runtime.

## Install

```bash
pnpm add @kairo-ui/react @kairo-ui/theme
```

`@kairo-ui/theme` ships the styles every component relies on — import it
once, near the root of your app:

```ts
import '@kairo-ui/theme/styles.css';
```

### Peer dependencies

- `react` `^18.0.0 || ^19.0.0`
- `react-dom` `^18.0.0 || ^19.0.0`

## Usage

```tsx
import { Button } from '@kairo-ui/react';

export function Example() {
  return <Button>Click me</Button>;
}
```

## Components

11 components, built as thin wrappers over native elements or
[Base UI](https://base-ui.com) primitives:

| Static (server-safe) | Interactive (`'use client'`) |
| --------------------- | ------------------------------ |
| Button                | Avatar                         |
| Badge                 | Checkbox                       |
| Card                  | Dialog                         |
| Input                 | Switch                         |
| Spinner               | Tabs                           |
|                       | Tooltip                        |

- **RSC-friendly** — the static components carry no `'use client'` directive
  and render as zero-JS Server Components in the Next.js App Router.
  Interactive components declare their own client boundary, so you never
  need to add `'use client'` yourself just to use them.
- **Accessible** — interactive components are built on Base UI, which
  provides correct ARIA semantics, keyboard navigation and focus management.
- **Tree-shakeable** — import everything from the package root, or reach for
  a per-component subpath to keep bundles minimal:

  ```ts
  import { Button } from '@kairo-ui/react';
  // or
  import { Button } from '@kairo-ui/react/button';
  ```

See each component's docs page (in `apps/docs/content/docs/components`) for
its full prop reference and live examples.

## License

MIT
