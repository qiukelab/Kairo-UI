# Publishing Kairo

This repo is fully prepared to publish `@kairo-ui/theme` and `@kairo-ui/react`
to npm — the steps below are the handful of things only a human with the
right credentials can do. Everything else (build, typecheck, test, lint,
changelogs, CI, release automation) is already wired up.

Both packages are a [Changesets **fixed** group](.changeset/config.json)
(`fixed: [["@kairo-ui/theme", "@kairo-ui/react"]]`), so they always version
and release together, and both publish with `--access public`. There are
currently 5 pending changesets (all `minor`), which — per the
[roadmap](docs/ROADMAP.md) — should produce the `v0.1.0` milestone release.

## 0. Prerequisites (one-time, human-only)

1. **Reserve the npm scope.** `@kairo-ui` is unclaimed as of 2026-07-17 but
   this was **not re-verified today** — check before you rely on it:
   ```bash
   npm view @kairo-ui/react
   npm view @kairo-ui/theme
   ```
   If both 404, the scope is free. Reserve it either by:
   - Creating an npm **organization** named `kairo-ui` at
     https://www.npmjs.com/org/create (recommended — lets you add
     maintainers later), or
   - Simply publishing the first package under your own npm user once
     you're a member of a `kairo-ui` org/scope (npm creates scoped packages
     under an org or user scope; a bare user account can't own an
     arbitrary `@kairo-ui` scope without the org).
2. **Log in locally** (needed for the manual path below):
   ```bash
   npm login
   ```

## Option A — Manual local publish

Use this the first time, or anytime you want full control over the release.

```bash
# 1. Turn the pending changesets into version bumps + CHANGELOGs.
pnpm changeset version

# 2. Review the diff: package.json versions, CHANGELOG.md files, and that
#    the 5 changeset files under .changeset/ were deleted.
git diff

# 3. Build once more against the bumped versions and publish both packages.
pnpm build
pnpm publish -r --access public
```

`pnpm publish -r` publishes every workspace package that isn't `private`
(only `packages/theme` and `packages/react` qualify — `apps/docs` and
`tooling/tsconfig` are `"private": true`). `--access public` is required
because scoped packages (`@kairo-ui/*`) default to private otherwise.

Commit and push the version bump / changelog changes (and tag, if you want)
after publishing.

## Option B — Automated release via GitHub Actions

Use this for ongoing releases once the repo is on GitHub.

1. **Add the `NPM_TOKEN` repo secret**: npm → Access Tokens → Generate New
   Token (Automation type, publish access) → GitHub repo → Settings →
   Secrets and variables → Actions → New repository secret → name it
   `NPM_TOKEN`.
2. **Push to `main`** (or merge a PR into it). [`.github/workflows/release.yml`](.github/workflows/release.yml)
   runs on every push to `main` and, via [`changesets/action@v1`](https://github.com/changesets/action):
   - If there are pending changesets, it opens/updates a **"Version
     Packages"** pull request with the version bumps and CHANGELOG entries
     already applied (nothing is published yet).
   - Once that PR is merged (so no changesets remain), the next run
     publishes to npm by executing the root `release` script
     (`pnpm build && changeset publish`), using `NPM_TOKEN` for npm auth
     and the built-in `GITHUB_TOKEN` to open the PR / create GitHub
     releases.
3. No further action needed after that — repeat step 2 for every future
   release (add changesets via `pnpm changeset` as you land user-facing
   changes, merge the resulting Version Packages PR when ready to ship).

## Notes

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs
  install/build/typecheck/test/lint on every push and pull request — it
  does not publish anything.
- CSS minification (LightningCSS) is intentionally out of scope for
  `v0.1.0` — see `docs/ROADMAP.md` Phase 4.
- Neither workflow nor this guide runs `npm publish`/`pnpm publish`
  automatically without the steps above — publishing always requires the
  `NPM_TOKEN` secret (Option B) or a logged-in human (Option A).
