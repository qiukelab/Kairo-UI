#!/usr/bin/env node
/**
 * Generates `src/tokens.generated.ts` from the `:root` block of
 * `css/tokens.css`.
 *
 * Parsed with Lightning CSS's visitor API rather than a regex: several
 * custom properties (`--kairo-font-sans` in particular) span multiple lines
 * with comma-separated values, which a line-oriented regex would mangle.
 *
 * `:root` is treated as the single source of truth. Every other block in the
 * file (`.dark`, and every `[data-kairo-theme='…']` preset in both its light
 * and dark variant) is only allowed to *redefine* a subset of `:root`'s
 * custom properties — that is the documented contract in `tokens.css`'s file
 * header. A property that exists in one of those blocks but not in `:root`
 * would be `undefined` in the default theme, which is a real bug, so
 * `generateTokens()` throws if it finds one.
 *
 * Run directly to (re)write the generated file:
 *
 *   node scripts/generate-tokens.mjs
 *
 * `test/tokens.test.ts` imports `parseTokensCss`, `generateTokens` and
 * `renderTokensModule` directly so it can assert against the same parse
 * without shelling out or writing to disk.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transform } from 'lightningcss';

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const TOKENS_CSS_PATH = join(PACKAGE_ROOT, 'css', 'tokens.css');
export const OUTPUT_PATH = join(PACKAGE_ROOT, 'src', 'tokens.generated.ts');

/** True if a selector list is exactly the bare `:root` selector. */
function isRootSelector(selectors) {
  return (
    selectors.length === 1 &&
    selectors[0].length === 1 &&
    selectors[0][0].type === 'pseudo-class' &&
    selectors[0][0].kind === 'root'
  );
}

/** Maps Lightning CSS's named attribute-selector operators back to CSS syntax. */
const ATTR_OPERATORS = {
  equal: '=',
  includes: '~=',
  'dash-match': '|=',
  prefix: '^=',
  substring: '*=',
  suffix: '$=',
};

/**
 * Minimal selector serializer for error messages only. `tokens.css` never
 * uses anything beyond simple compound selectors (`:root`, `.dark`,
 * `[attr='value']`, or a concatenation of those), so this does not need to
 * handle the full selector grammar.
 */
function describeSelector(selector) {
  return selector
    .map((component) => {
      switch (component.type) {
        case 'pseudo-class':
          return `:${component.kind}`;
        case 'class':
          return `.${component.name}`;
        case 'id':
          return `#${component.name}`;
        case 'type':
          return component.name;
        case 'attribute': {
          if (!component.operation) return `[${component.name}]`;
          const op = ATTR_OPERATORS[component.operation.operator] ?? component.operation.operator;
          return `[${component.name}${op}"${component.operation.value}"]`;
        }
        default:
          return `<${component.type}>`;
      }
    })
    .join('');
}

function describeSelectorList(selectors) {
  return selectors.map(describeSelector).join(', ');
}

/**
 * Category rules for the sub-unions, evaluated in order — first match wins.
 * Written by hand against the token *names*, deliberately not derived from
 * the prose comments in `tokens.css`: those are free-form design rationale
 * ("Radius — squared off. Shape is defined by…") that will get reworded
 * over time, and this table would silently drift from it if it depended on
 * comment text.
 */
const CATEGORY_RULES = [
  ['Radius', /^--kairo-radius(-|$)/, 'Corner-radius tokens.'],
  ['Typography', /^--kairo-(font|leading)-/, 'Font-stack and line-height tokens.'],
  [
    'Shadow',
    /^--kairo-shadow-/,
    'Box-shadow tokens (color channel, strength multiplier and the composed shadows).',
  ],
  ['Motion', /^--kairo-(duration|ease)-/, 'Transition-duration and easing-curve tokens.'],
  [
    'Structural',
    /^--kairo-(border-width|ring-width|ring-offset)$/,
    'Border and focus-ring line-weight tokens (as opposed to their colors, which are `KairoColorToken`).',
  ],
  // Catch-all, must stay last: every remaining `:root` token is an oklch()
  // surface, text, intent or border/ring *color*.
  [
    'Color',
    /^--kairo-/,
    'Colour tokens — surfaces, text, borders and semantic intents, all oklch().',
  ],
];

function categoryFor(name) {
  const rule = CATEGORY_RULES.find(([, pattern]) => pattern.test(name));
  // Unreachable: the catch-all rule matches every `--kairo-*` name.
  if (!rule) throw new Error(`generate-tokens: no category rule matched '${name}'`);
  return rule[0];
}

/**
 * Parses `tokens.css` and returns every custom property declared in `:root`
 * (in source order) plus every custom property declared anywhere else in the
 * file, with enough location info to build a useful error message. Never
 * throws — `generateTokens()` is what enforces the superset invariant, so
 * that tests can assert on the raw parse independently of that check.
 */
export function parseTokensCss(cssPath = TOKENS_CSS_PATH) {
  const code = readFileSync(cssPath);
  const rootNames = new Set();
  const rootTokens = [];
  const foreignTokens = [];

  transform({
    filename: 'tokens.css',
    code,
    visitor: {
      Rule: {
        style(rule) {
          const { selectors, declarations, loc } = rule.value;
          const isRoot = isRootSelector(selectors);
          const decls = [
            ...(declarations?.declarations ?? []),
            ...(declarations?.importantDeclarations ?? []),
          ];

          for (const decl of decls) {
            if (decl.property !== 'custom') continue;
            const name = decl.value.name;

            if (isRoot) {
              if (!rootNames.has(name)) {
                rootNames.add(name);
                rootTokens.push(name);
              }
            } else {
              foreignTokens.push({
                name,
                selector: describeSelectorList(selectors),
                line: loc.line + 1, // Lightning CSS lines are 0-based.
              });
            }
          }
        },
      },
    },
  });

  return { rootNames, rootTokens, foreignTokens };
}

/**
 * Parses `tokens.css`, enforces that `:root` is a superset of every other
 * block, and groups the `:root` tokens by category. Throws a single error
 * listing every offending declaration if the invariant is violated.
 */
export function generateTokens(cssPath = TOKENS_CSS_PATH) {
  const { rootNames, rootTokens, foreignTokens } = parseTokensCss(cssPath);

  const missing = foreignTokens.filter((t) => !rootNames.has(t.name));
  if (missing.length > 0) {
    const details = missing
      .map((t) => `  - ${t.name} in '${t.selector}' (tokens.css:${t.line})`)
      .join('\n');
    throw new Error(
      `generate-tokens: found custom propert${missing.length === 1 ? 'y' : 'ies'} declared outside ':root' ` +
        `with no ':root' definition. A token that only exists in a preset or '.dark' block is undefined in ` +
        `the default theme — add it to ':root' in tokens.css first:\n${details}`,
    );
  }

  const byCategory = new Map();
  for (const name of rootTokens) {
    const category = categoryFor(name);
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(name);
  }

  return { rootTokens, byCategory };
}

function renderUnion(names) {
  return names.map((name) => `  | '${name}'`).join('\n');
}

/** Renders the `generateTokens()` result into the `tokens.generated.ts` source text. */
export function renderTokensModule({ rootTokens, byCategory }) {
  // `byCategory` is a `Map`, which preserves insertion order — and it was
  // built by iterating `rootTokens` in source order, so this reproduces the
  // order categories first appear in `tokens.css` (colors, then radius,
  // then border/ring width, then typography, shadow, motion) without a
  // second, independently-maintained ordering table.
  const presentCategories = [...byCategory.keys()];
  const typeNameFor = (category) => `Kairo${category}Token`;
  const descriptionFor = (category) => CATEGORY_RULES.find(([c]) => c === category)[2];

  const lines = [
    '/**',
    ' * AUTO-GENERATED — do not edit by hand.',
    ' *',
    ' * Generated by `scripts/generate-tokens.mjs` from the `:root` block of',
    ' * `css/tokens.css`. After editing that file, regenerate this one with:',
    ' *',
    ' *   node scripts/generate-tokens.mjs',
    ' *',
    ' * …and commit the result. This file is checked in rather than built on',
    ' * the fly, so a token rename shows up in the PR diff and `tsc`/editor',
    ' * IntelliSense work on a clean clone without running a build step first.',
    ' */',
    '',
  ];

  for (const category of presentCategories) {
    lines.push(`/** ${descriptionFor(category)} */`);
    lines.push(`export type ${typeNameFor(category)} =`);
    lines.push(`${renderUnion(byCategory.get(category))};`);
    lines.push('');
  }

  lines.push(
    '/** Every Kairo design token, as the CSS custom property name it is declared under. */',
  );
  lines.push('export type KairoToken =');
  lines.push(`${presentCategories.map((category) => `  | ${typeNameFor(category)}`).join('\n')};`);
  lines.push('');

  lines.push(
    "/** Every token name, in `:root`'s declaration order. See `KairoToken` for the typed union. */",
  );
  lines.push('export const KAIRO_TOKENS: readonly KairoToken[] = [');
  for (const name of rootTokens) lines.push(`  '${name}',`);
  lines.push('];');
  lines.push('');

  lines.push(
    '/** Returns the `var(--kairo-…)` reference for a token, e.g. `token(\'--kairo-primary\')` -> `"var(--kairo-primary)"`. */',
  );
  lines.push('export function token(name: KairoToken): string {');
  lines.push('  return `var(${name})`;');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

const isMain =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const source = renderTokensModule(generateTokens());
  writeFileSync(OUTPUT_PATH, source, 'utf8');
  console.log(`Wrote ${relative(PACKAGE_ROOT, OUTPUT_PATH).split('\\').join('/')}`);
}
