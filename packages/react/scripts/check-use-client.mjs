/**
 * Asserts that every interactive component subpath carries a `'use client'`
 * directive somewhere in its built module graph, and that every static
 * subpath carries none — matching the docs' claim that the 8 static
 * components (button, badge, card, spinner, separator, progress, meter,
 * input) stay Server-Component-safe while the other 20 don't.
 *
 * This runs against `dist/`, not `src/`: the directive lives on the
 * component's own source file (e.g. `dialog.mjs`), not on the subpath's
 * `index.mjs` barrel, and bundling can pull a directive-bearing module into
 * an otherwise-static subpath's graph (or drop one that should be there) in
 * ways `src/` alone can't reveal. A bundler upgrade silently losing a
 * directive is exactly the regression this guards against.
 *
 * The two directions are checked at different scopes on purpose — an
 * interactive component must carry a directive in its *own* modules, while a
 * static one must not reach one *anywhere* in its import graph. See
 * `ownDirectiveModules` for why using either scope for both makes the check
 * vacuous in one direction.
 *
 * Nothing here greps for the string: `'use client'` can appear in a comment
 * (`dist/meter/meter.mjs` has it in JSDoc today) without being a directive.
 * `readDirectives` below is the only thing allowed an opinion on what counts.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

// Components that must stay directive-free so they're usable from a Server
// Component tree without dragging in a client boundary. Hardcoded and
// fail-closed: anything not listed here is assumed interactive, so a new
// component must either ship a directive or be added here on purpose.
const STATIC = new Set([
  'button',
  'badge',
  'card',
  'spinner',
  'separator',
  'progress',
  'meter',
  'input',
  'label',
]);

/**
 * Returns the string-literal values of `source`'s leading directive
 * prologue (the ECMAScript notion a `'use client'` build tag relies on):
 * leading whitespace and comments are skipped, then consecutive top-level
 * string-literal statements are collected until the first statement that
 * isn't one. A `'use client'` string appearing later in the file — inside a
 * comment, or after real code — is not part of the prologue and is ignored.
 */
export function readDirectives(source) {
  const directives = [];
  let i = 0;
  const n = source.length;

  for (;;) {
    // Skip whitespace and comments between statements.
    for (;;) {
      while (i < n && /\s/.test(source[i])) i++;
      if (source.startsWith('//', i)) {
        i = source.indexOf('\n', i);
        i = i === -1 ? n : i + 1;
        continue;
      }
      if (source.startsWith('/*', i)) {
        const end = source.indexOf('*/', i + 2);
        i = end === -1 ? n : end + 2;
        continue;
      }
      break;
    }

    const quote = source[i];
    if (quote !== '"' && quote !== "'") break;

    let j = i + 1;
    let value = '';
    while (j < n && source[j] !== quote) {
      if (source[j] === '\\') j++;
      value += source[j];
      j++;
    }
    if (j >= n) break; // Unterminated string: not a valid directive.
    j++; // Consume the closing quote.

    directives.push(value);
    i = j;
    while (i < n && /[ \t]/.test(source[i])) i++;
    if (source[i] === ';') i++;
  }

  return directives;
}

function readDirectivesOf(absPath) {
  return readDirectives(readFileSync(absPath, 'utf8'));
}

/**
 * Walks the relative-import graph rooted at `entryAbsPath`, following only
 * relative specifiers (bare specifiers like `react` or `@base-ui/react` are
 * external and out of scope) and only `.mjs` files. Returns the first
 * directive-bearing module found, with the import chain that reached it, or
 * `null` if the graph is directive-free.
 */
function findDirective(entryAbsPath) {
  const visited = new Set();
  const queue = [{ absPath: entryAbsPath, path: [entryAbsPath] }];

  while (queue.length > 0) {
    const { absPath, path } = queue.shift();
    if (visited.has(absPath)) continue;
    visited.add(absPath);

    const source = readFileSync(absPath, 'utf8');
    if (readDirectives(source).includes('use client')) return path;

    const importRe = /(?:import|export)\s[^;]*?from\s+['"](\.[^'"]+)['"]/g;
    for (const match of source.matchAll(importRe)) {
      const specifier = match[1];
      const resolved = join(dirname(absPath), specifier);
      // tsdown emits explicit `.mjs` specifiers, so every relative import
      // resolves to a real file as written. Skipping anything else keeps a
      // future extensionless or non-JS import from turning this walk into an
      // ENOENT stack trace — the graph would just be traversed less deeply,
      // which the interactive-needs-a-directive assertion still catches.
      if (!resolved.endsWith('.mjs') || !existsSync(resolved)) continue;
      if (!visited.has(resolved)) queue.push({ absPath: resolved, path: [...path, resolved] });
    }
  }

  return null;
}

/**
 * Names the modules under `dist/<name>/` that carry the directive — the
 * component's *own* code, not what it imports.
 *
 * The two directions genuinely need different scopes, and using one for both
 * makes the check useless in one of them:
 *
 *   - Interactive components are checked here, own-scope. Every one of them
 *     calls hooks, so each must be a client boundary *itself*. A transitive
 *     walk would happily accept a component that lost its own directive but
 *     still reached one through a shared module — `dialog.mjs` imports
 *     `../i18n/use-kairo-messages.mjs`, which has one, so deleting Dialog's
 *     own directive passes a transitive check while breaking Dialog in an
 *     RSC tree.
 *   - Static components are checked with `findDirective`, transitively. It is
 *     not enough that they carry no directive of their own: reaching a client
 *     module still drags a client boundary into a server tree, which is
 *     exactly the promise these 8 exports make.
 */
function ownDirectiveModules(componentDir) {
  if (!existsSync(componentDir)) return [];
  return readdirSync(componentDir)
    .filter((file) => file.endsWith('.mjs'))
    .filter((file) => readDirectivesOf(join(componentDir, file)).includes('use client'));
}

function toDisplayPath(absPath) {
  return relative(ROOT, absPath).split('\\').join('/');
}

function main() {
  if (!existsSync(DIST)) {
    console.error(
      'dist/ does not exist. Run `pnpm build` first — this check inspects the built output, not src/.',
    );
    process.exit(1);
  }

  const { exports: exportsMap } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const componentNames = Object.keys(exportsMap)
    .filter((key) => key !== '.' && key !== './i18n')
    .map((key) => key.slice(2));

  const unknownStatic = [...STATIC].filter((name) => !componentNames.includes(name));
  for (const name of unknownStatic) {
    console.error(`STATIC lists "${name}", which is not a subpath in package.json's "exports"`);
  }
  if (unknownStatic.length > 0) process.exit(1);

  // interactive.length + STATIC.size is always componentNames.length by
  // construction (interactive is everything in componentNames not in
  // STATIC), so this is really asserting componentNames.length === 28 — a
  // renamed or dropped component subpath must fail loudly here rather than
  // silently shrinking (or growing) the set this check covers.
  const EXPECTED_COMPONENT_COUNT = 32;
  if (componentNames.length !== EXPECTED_COMPONENT_COUNT) {
    console.error(
      `Expected ${EXPECTED_COMPONENT_COUNT} component subpaths in "exports", found ${componentNames.length}: ${componentNames.join(', ')}`,
    );
    process.exit(1);
  }

  let failed = false;
  let clientCount = 0;
  let serverCount = 0;

  for (const name of componentNames) {
    const isStatic = STATIC.has(name);
    const componentDir = join(DIST, name);
    const entryAbsPath = join(componentDir, 'index.mjs');
    // Static: nothing in the whole graph may be a client module.
    // Interactive: the component's own code must be one. See
    // `ownDirectiveModules` for why the scopes differ.
    const chain = isStatic ? findDirective(entryAbsPath) : null;
    const own = isStatic ? [] : ownDirectiveModules(componentDir);

    if (isStatic && chain) {
      // The chain always starts at the subpath entry, so when the directive
      // is on the entry itself there is no "via" to report — naming the same
      // file twice (or printing an empty `via`) reads as a bug in the check.
      const culprit = toDisplayPath(chain[chain.length - 1]);
      const via = chain.slice(0, -1).map(toDisplayPath).join(' -> ');
      console.error(
        `@kairo-ui/react/${name} is declared static but ${culprit}${via ? ` (via ${via})` : ''} has a 'use client' directive`,
      );
      failed = true;
    } else if (!isStatic && own.length === 0) {
      console.error(
        `@kairo-ui/react/${name} is declared interactive but no module in ${toDisplayPath(componentDir)}/ carries a 'use client' directive of its own`,
      );
      failed = true;
    } else if (isStatic) {
      serverCount++;
    } else {
      clientCount++;
    }
  }

  // The root barrel re-exports every component; a directive there would turn
  // the whole package into a client boundary, defeating every static export.
  const rootIndex = join(DIST, 'index.mjs');
  if (readDirectivesOf(rootIndex).includes('use client')) {
    console.error(
      `${toDisplayPath(rootIndex)} (the root barrel) must not carry a 'use client' directive`,
    );
    failed = true;
  }

  // `./i18n` isn't a component subpath (no static/interactive split), but its
  // three modules have a known-correct shape worth locking down directly:
  // the barrel and the React-free message table stay server-safe, while the
  // context provider (which the barrel re-exports) needs the directive.
  const i18nExpectations = [
    { file: 'i18n/index.mjs', directive: false },
    { file: 'i18n/locale-provider.mjs', directive: true },
    { file: 'i18n/messages.mjs', directive: false },
  ];
  for (const { file, directive } of i18nExpectations) {
    const absPath = join(DIST, file);
    const has = readDirectivesOf(absPath).includes('use client');
    if (has !== directive) {
      console.error(
        `dist/${file} ${directive ? 'must' : 'must not'} carry a 'use client' directive (found: ${has})`,
      );
      failed = true;
    }
  }

  if (failed) process.exit(1);
  console.log(
    `${componentNames.length} components checked (${clientCount} client, ${serverCount} server)`,
  );
}

// Only run the check when this file is executed directly (`node
// scripts/check-use-client.mjs`), not when `test/use-client.test.ts` imports
// it for `readDirectives` — that suite runs against inline strings and must
// not require `dist/` to exist.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
