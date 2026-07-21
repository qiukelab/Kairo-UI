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
git clone https://github.com/yindeejs/kairo-ui.git
cd kairo-ui
pnpm install
```

Common commands (run from the repo root, powered by Turborepo):

```bash
pnpm dev         # watch mode for every package
pnpm build       # build all packages
pnpm typecheck   # type-check all packages
pnpm test        # run tests
pnpm lint        # lint all packages
pnpm format      # format everything with oxfmt
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
etc). Adding a single component touches 7 files and around a dozen
registration points across `packages/react`, `packages/theme` and
`apps/docs`, which is too much to reliably get right by hand. Start with the
scaffolding script instead of copying an existing component:

```bash
node scripts/scaffold-component.mjs <kebab-name> [--static] [--icon <LucideName>]
```

Pass `--static` for a component with no interaction (like Button, Badge,
Input): it skips the `'use client'` directive and the docs demo, and adds the
component to `check-use-client.mjs`'s `STATIC` set instead of leaving it in
the default interactive path. `--icon` names the lucide-react icon shown in
the docs sidebar (default: a placeholder — pick a real one before shipping).

The script creates working stubs for the component's CSS, its React
component + `index.ts` + test, its `.mdx`/`.th.mdx` docs pages, and (unless
`--static`) its docs demo — then wires all of it into the registration points
that are easy to miss by hand: `packages/react`'s `package.json` exports,
`tsdown.config.ts` entry, and `src/index.ts` barrel; `check-use-client.mjs`'s
`EXPECTED_COMPONENT_COUNT` (and `STATIC` set, when `--static`);
`packages/theme/css/index.css`'s `@import`; the docs' `meta.json` /
`meta.th.json`, `components/index.mdx` / `index.th.mdx` (table row *and*
component-count header), `vite.config.ts`'s `COMPONENT_SLUGS`, and the
sidebar icon registration in `apps/docs/src/lib/source.ts`; both page-count
floors in `.github/workflows/ci.yml`; and a changeset. It prints a summary of
what it touched, what was already correct, and which docs category it filed
the new component under — that last guess isn't always right, so move it by
hand if it isn't.

What the script does **not** do — still yours to write:

1. **The real component** — `packages/react/src/<name>/<name>.tsx` is a
   working stub, not the real implementation. Use `forwardRef`; merge
   `className` with a plain space-join — no `clsx`/`cva` — to keep
   `@kairo-ui/react` dependency-free; drive variants/state with `data-*`
   attributes so the CSS (and any future non-React port) can key off the DOM
   alone. Reading an existing component (e.g. `number-field` for something
   interactive, `input` for something RSC-safe) is the fastest way to match
   the house style.
2. **The real CSS** — `packages/theme/css/components/<name>.css` is a
   scaffolded stub too. Prefix classes with `kairo-`, drive variants/sizes
   with `data-*` attributes and states with pseudo-classes, and keep the
   file's header comment accurate about which selectors (state attributes
   in particular) the component hooks into.
3. **Real tests** — the scaffolded Vitest + Testing Library file already
   covers render, `className` merging, `ref` forwarding and accessibility
   (`vitest-axe`); extend it with real coverage of the component's actual
   props and behavior. See [the test infra note](#test-infra-note) below
   before touching `packages/react/test/setup.ts`.
4. **The demo** (skipped entirely for `--static` components) — flesh out
   `apps/docs/src/components/demos/<name>-demo.tsx` into a real interactive
   demo.
5. **Docs prose, in both languages** — replace the TODOs in
   `apps/docs/content/docs/components/<name>.mdx` and the matching
   `<name>.th.mdx` with real usage docs and a real Props table.
6. **The Thai translation** — both the `.th.mdx` page itself, and (unless
   `--static`) a `## <name>-demo.tsx` section in
   `apps/docs/src/components/demos/DEMO_COPY.th.md` documenting the EN → TH
   strings you chose for the demo, following the format of the sections
   already there.
7. **The changeset's content** — the script already creates
   `.changeset/add-<name>.md` bumping `theme` and `react` (they're a fixed
   version group), with a one-line description; expand it if the change
   needs more detail.

## Coding standards

- **TypeScript** everywhere — avoid `any`; prefer precise prop types.
- **oxfmt** (`.oxfmtrc.jsonc`) formats the codebase — run `pnpm format` before
  committing, and `pnpm format:check` to see what CI will say. Markdown, MDX
  and `packages/theme/src/tokens.generated.ts` are deliberately excluded; the
  config explains why for each.
- **oxlint** (`.oxlintrc.json`) — run `pnpm lint` and fix anything it flags.
  It is a single repo-wide pass, not per-package, so run it from the root.

### Two linting decisions worth knowing before you propose changing them

Both used to be explained in the ESLint config that `.oxlintrc.json` replaced.
Neither has a natural home in the new config, because oxlint doesn't implement
the thing being opted out of — so they are recorded here instead.

- **No type-aware linting.** The old setup deliberately used the
  non-type-checked `typescript-eslint` presets: enough correctness coverage
  for a library this size without wiring `parserOptions.project` across
  packages or paying for per-file type information. oxlint has no type-aware
  rules at all, so this is now structural. Type-level correctness is
  `pnpm typecheck`'s job, and that is where it should stay.
- **No React Compiler diagnostics.** `eslint-plugin-react-hooks` v7 folded
  purity/immutability/static-component rules into its `recommended` preset,
  aimed at apps opting into the compiler. Kairo doesn't use it, and those
  rules produced noisy false positives against Base UI's ref- and effect-heavy
  wrapper patterns, so only the two battle-tested Rules-of-Hooks checks were
  ever enabled. oxlint's `react` plugin bundles react-hooks and ships no
  compiler diagnostics, so there is currently nothing to opt out of — but if
  that changes, this is the reasoning.

## Test infra note

`packages/react/test/setup.ts` works around a couple of upstream quirks
(an empty `vitest-axe@0.1.0` extend-expect build, and Vitest running
without `globals: true`). Please don't remove or "simplify" the manual
`expect.extend`/`cleanup()` wiring there — it's intentional, not leftover
scaffolding.

## Branching and commits

Outside contributors work from a fork: click "Fork" on GitHub, clone your
fork, then branch off `main`. Nobody — maintainers included — commits
directly to `main`; every change, however small, goes through a branch and a
pull request. Keep branches narrow: one branch should represent one intent,
so it maps cleanly onto one PR and one changelog entry.

Name the branch after what it does, not who's doing it:

| Prefix   | For                                                                    | Example                     |
| -------- | ----------------------------------------------------------------------| ---------------------------- |
| `feat/`  | A new component, prop, or capability                                  | `feat/avatar-group`         |
| `fix/`   | A bug fix                                                              | `fix/dialog-focus-trap`     |
| `chore/` | Maintenance with no user-facing behavior change (deps, tooling, etc.) | `chore/bump-turborepo`      |
| `docs/`  | Docs-only changes (public docs site or repo docs)                     | `docs/translate-th-sidebar` |
| `ci/`    | CI/workflow changes                                                   | `ci/cache-pnpm-store`       |

Use a kebab-case slug after the prefix — short enough to read in a branch
list, specific enough to tell PRs apart.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
a lowercase, imperative subject describing the outcome, no trailing period,
an optional scope in parentheses, and `!` right before the colon if the
change is breaking.

```
<type>(<scope>)!: <subject>
```

| Type       | For                                        |
| ---------- | ------------------------------------------- |
| `feat`     | New feature or capability                  |
| `fix`      | Bug fix                                    |
| `chore`    | Maintenance, deps, release                 |
| `docs`     | Documentation                              |
| `ci`       | CI/CD, workflows                           |
| `style`    | Formatting only, no logic change           |
| `refactor` | Code change that isn't a fix or a feature  |
| `test`     | Adding or fixing tests                     |
| `perf`     | Performance improvement                    |

Real examples from this repo's history:

```
feat(theme)!: put every rule in a cascade layer
fix(docs): let a collapsed sidebar be brought back
style: format repo with oxfmt
```

Scope is optional — common ones here are `react`, `theme`, `docs` and
`release`, but leave it off if the change doesn't belong to a single
package.

Keep commits to one reviewable decision each: a refactor and the behavior
change it enables don't share a commit, and a formatting-only pass is its
own commit (and gets added to `.git-blame-ignore-revs`, since a repo-wide
reformat commit has no business showing up in `git blame`). It's a small
amount of discipline that pays off the moment someone has to review the
diff, `git revert` one part of it, or `git bisect` a regression.

A full loop, start to finish:

```bash
git checkout -b feat/avatar-group
# ...make the change...
pnpm format:check && pnpm lint && pnpm build && pnpm typecheck && pnpm test
git add packages/react/src/avatar-group
git commit -m "feat(react): add AvatarGroup component"
git push -u origin feat/avatar-group
gh pr create --fill
```

## Before opening a pull request

Make sure the full verification suite is green:

```bash
pnpm format:check && pnpm lint && pnpm build && pnpm typecheck && pnpm test
```

Same order CI uses — format and lint are near-instant and need no build, so
they fail first if they're going to. If `format:check` complains, `pnpm format`
fixes it.

Then, in your PR:

- Title the PR the same way you'd title a commit — a Conventional Commits
  subject (e.g. `feat(react): add AvatarGroup component`). Maintainers
  squash-merge PRs, so this title becomes the commit subject on `main`
  (GitHub appends the PR number automatically), regardless of how the
  commits on your branch are titled — which is why the format matters here
  too.
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

Feel free to open a [discussion](https://github.com/yindeejs/kairo-ui/discussions)
or an issue if anything here is unclear. Please also read our
[Code of Conduct](./CODE_OF_CONDUCT.md) — we want Kairo to be a welcoming
project for everyone.
