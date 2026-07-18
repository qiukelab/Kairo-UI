# Contributing to Kairo

Thanks for your interest in contributing! This guide covers everything you
need to get set up, make a change, and open a pull request.

## Prerequisites

- **Node.js 20+**
- **pnpm 10.24.0** (the repo pins this via `packageManager` — if you use
  [corepack](https://pnpm.io/installation#using-corepack), it'll pick this up
  automatically)

## Getting set up

```bash
git clone https://github.com/qiukelab/Kairo-UI.git
cd Kairo-UI
pnpm install
```

Common commands (run from the repo root, powered by Turborepo):

```bash
pnpm dev         # watch mode for every package
pnpm build       # build all packages
pnpm typecheck   # type-check all packages
pnpm test        # run tests
pnpm lint        # lint all packages
pnpm format      # format everything with Prettier
```

To work on the docs site while developing a component:

```bash
pnpm --filter @kairo-ui/docs dev
```

## Project structure

Kairo is a pnpm + Turborepo monorepo:

| Path               | Description                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `packages/react`   | `@kairo-ui/react` — React components                                                        |
| `packages/theme`   | `@kairo-ui/theme` — CSS tokens, presets & the theming API (also owns every component's CSS) |
| `apps/docs`        | Documentation site (Fumadocs + Next.js)                                                     |
| `tooling/tsconfig` | Shared TypeScript configs                                                                   |
| `docs/`            | Internal project docs (roadmap, conventions) — not the public docs site                     |

`docs/PROJECT.md` has the full internal stack/conventions reference if you
want more detail than this guide.

## Adding a component

Kairo has an established convention for components — following it keeps the
library consistent and keeps CSS portable to future non-React ports (Vue,
etc). Using an existing component (e.g. `button`) as a reference is the
fastest way to get this right.

1. **CSS first** — add `packages/theme/css/components/<name>.css` and
   `@import` it from `packages/theme/css/index.css`. Prefix classes with
   `kairo-`; drive variants/sizes with `data-*` attributes and states with
   pseudo-classes. Start the file with a comment documenting the selectors
   the component hooks into (state attributes in particular), since this
   CSS is meant to be reusable by non-React ports later.
2. **React component** — add `packages/react/src/<name>/<name>.tsx` +
   `index.ts`. Use `forwardRef`. Components with no interaction (e.g.
   Button, Badge) should **not** have a `'use client'` directive, so they
   stay RSC-safe; components built on Base UI or with interaction need one.
   Merge `className` with a plain space-join — no `clsx`/`cva` — to keep
   `@kairo-ui/react` dependency-free.
3. **Wire up exports** — add a `./<name>` entry to `packages/react/package.json`
   `exports`, add `src/<name>/index.ts` as a new entry in
   `packages/react/tsdown.config.ts`, and export from `src/index.ts`.
4. **Tests** — add Vitest + Testing Library tests covering render, props,
   `ref` forwarding, and accessibility (`vitest-axe`). See
   [the test infra note](#test-infra-note) below before touching
   `packages/react/test/setup.ts`.
5. **Docs page** — add `apps/docs/content/docs/components/<name>.mdx` (use
   `<ComponentPreview>`) and register it in
   `apps/docs/content/docs/components/meta.json`.
6. **Changeset** — run `pnpm changeset` and describe the change. `theme` and
   `react` are a fixed version group, so most component changes bump both.

## Coding standards

- **TypeScript** everywhere — avoid `any`; prefer precise prop types.
- **Prettier** formats the codebase — run `pnpm format` before committing.
- **ESLint** (flat config, typescript-eslint + react-hooks) — run `pnpm lint`
  and fix anything it flags.

## Test infra note

`packages/react/test/setup.ts` works around a couple of upstream quirks
(an empty `vitest-axe@0.1.0` extend-expect build, and Vitest running
without `globals: true`). Please don't remove or "simplify" the manual
`expect.extend`/`cleanup()` wiring there — it's intentional, not leftover
scaffolding.

## Before opening a pull request

Make sure the full verification suite is green:

```bash
pnpm build && pnpm typecheck && pnpm test && pnpm lint
```

Then, in your PR:

- Write a clear description of **what** changed and **why**; link any
  related issue.
- Include a changeset (`pnpm changeset`) for any user-facing change to
  `packages/react` or `packages/theme`.
- Update docs (`apps/docs`) if you changed public behavior.
- Keep the diff focused — unrelated formatting or refactors make review
  harder.

## Release process

Kairo uses [Changesets](https://github.com/changesets/changesets) for
versioning. Contributors just need to add a changeset describing their
change (`pnpm changeset`); maintainers handle turning accumulated
changesets into version bumps and publishing to npm. See
[`PUBLISHING.md`](./PUBLISHING.md) for the full release mechanics if you're
curious how that works.

## Questions?

Feel free to open a [discussion](https://github.com/qiukelab/Kairo-UI/discussions)
or an issue if anything here is unclear. Please also read our
[Code of Conduct](./CODE_OF_CONDUCT.md) — we want Kairo to be a welcoming
project for everyone.
