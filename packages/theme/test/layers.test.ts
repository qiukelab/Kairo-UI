import { readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Every stylesheet in this package must live inside a `kairo.*` cascade layer.
 *
 * Why this is worth a test: a component sheet that forgets the wrapper is
 * *unlayered*, and unlayered CSS beats every layered rule regardless of
 * specificity. So the broken file wins over the rest of the library AND over
 * anything the consumer writes — the exact opposite of the override story the
 * layers exist to provide. Nothing about that fails to build; it just quietly
 * makes one component unstyleable.
 *
 * The layer is declared inside each file (not via `@import … layer()` in
 * `index.css`) so that a sheet pulled in directly through the
 * `@kairo-ui/theme/css/*` subpath cascades identically to the bundle.
 */

const CSS_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'css');

const ALLOWED_LAYERS = ['kairo.tokens', 'kairo.base', 'kairo.components', 'kairo.overrides'];

const LAYER_ORDER_STATEMENT = '@layer kairo.tokens, kairo.base, kairo.components, kairo.overrides;';

function cssFiles(): string[] {
  return readdirSync(CSS_DIR, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.css'))
    .map((f) => f.split(sep).join('/'))
    .sort();
}

/** CSS has no line comments, so this is the whole comment grammar. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Index of the `}` matching the `{` at `open`. */
function matchBrace(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return i;
  }
  return -1;
}

/**
 * Walk the top level of a stylesheet and describe each construct found there.
 * Anything that is not an `@import`, a layer-order statement or a
 * `@layer kairo.* { … }` block is reported verbatim so the failure message
 * points at the offending rule instead of just saying "false !== true".
 */
function topLevelConstructs(css: string): string[] {
  const src = stripComments(css);
  const found: string[] = [];
  let i = 0;

  while (i < src.length) {
    if (/\s/.test(src[i])) {
      i++;
      continue;
    }

    const rest = src.slice(i);

    const statement = /^@(?:import|charset|layer)\b[^;{}]*;/.exec(rest);
    if (statement) {
      found.push(statement[0].replace(/\s+/g, ' '));
      i += statement[0].length;
      continue;
    }

    const block = /^@layer\s+([^{;]+)\{/.exec(rest);
    if (block) {
      const open = i + block[0].length - 1;
      const close = matchBrace(src, open);
      if (close === -1) {
        found.push(`UNCLOSED @layer ${block[1].trim()}`);
        break;
      }
      found.push(`@layer ${block[1].trim()} { … }`);
      i = close + 1;
      continue;
    }

    // Anything else: report the selector/at-rule prelude, which is enough to
    // find it, without dumping the whole declaration body into the diff.
    const prelude = rest.slice(0, Math.min(rest.length, rest.search(/[{;]/) + 1 || 60));
    found.push(`UNLAYERED ${prelude.replace(/\s+/g, ' ').trim()}`);
    const close = matchBrace(src, i + rest.indexOf('{'));
    if (close === -1) break;
    i = close + 1;
  }

  return found;
}

describe('cascade layers', () => {
  const files = cssFiles();

  it('finds the stylesheets (guards against the glob silently matching nothing)', () => {
    expect(files.length).toBeGreaterThan(20);
    expect(files).toContain('index.css');
    expect(files).toContain('base.css');
    expect(files).toContain('tokens.css');
  });

  it.each(files)('%s declares the full layer order before anything else', (file) => {
    const src = readFileSync(join(CSS_DIR, file), 'utf8');
    const firstAtRule = stripComments(src).trim();

    // The plan's rule, literally: once comments are out of the way, the first
    // thing in the file is a `@layer kairo.` at-rule.
    expect(firstAtRule.startsWith('@layer kairo.'), `${file} must open with '@layer kairo.'`).toBe(
      true,
    );

    // …and it is the complete order, not a partial one — a file that named
    // only its own layer would let import order decide the rest.
    expect(firstAtRule.startsWith(LAYER_ORDER_STATEMENT)).toBe(true);
  });

  it.each(files)('%s puts every rule inside a kairo.* layer', (file) => {
    const constructs = topLevelConstructs(readFileSync(join(CSS_DIR, file), 'utf8'));

    for (const construct of constructs) {
      const block = /^@layer (\S+) \{ … \}$/.exec(construct);
      if (block) {
        expect(ALLOWED_LAYERS, `${file}: unknown layer '${block[1]}'`).toContain(block[1]);
        continue;
      }
      expect(
        construct === LAYER_ORDER_STATEMENT || construct.startsWith('@import '),
        `${file}: '${construct}' sits outside any cascade layer`,
      ).toBe(true);
    }
  });

  it('splits base.css so the :lang(th) corrections land in kairo.overrides', () => {
    // Regression guard for a bug that has already shipped once: layer order
    // outranks specificity, so `.kairo-btn:lang(th)` (0,2,0) sitting in
    // `kairo.base` would lose to `.kairo-btn` (0,1,0) in `kairo.components`
    // and long Thai button labels would overflow again. Nothing about that
    // fails to build, hence this assertion.
    const constructs = topLevelConstructs(readFileSync(join(CSS_DIR, 'base.css'), 'utf8'));
    expect(constructs).toEqual([
      LAYER_ORDER_STATEMENT,
      '@layer kairo.base { … }',
      '@layer kairo.overrides { … }',
    ]);

    const src = stripComments(readFileSync(join(CSS_DIR, 'base.css'), 'utf8'));
    const overrides = src.slice(src.indexOf('@layer kairo.overrides'));
    expect(overrides).toContain('.kairo-btn:lang(th)');
    expect(overrides).toContain(':root:lang(th)');
    expect(overrides).toContain('prefers-reduced-motion');
    // The reduced-motion block must keep `!important`: important declarations
    // invert layer order and are the only way to beat a consumer's own
    // unlayered animations.
    expect(overrides).toContain('animation-duration: 0.01ms !important');
  });

  it('puts each remaining sheet in exactly one layer, chosen by directory', () => {
    for (const file of files) {
      if (file === 'base.css' || file === 'index.css') continue;
      const blocks = topLevelConstructs(readFileSync(join(CSS_DIR, file), 'utf8')).filter(
        (c) => c.startsWith('@layer ') && c.endsWith('{ … }'),
      );
      const expected = file.startsWith('components/') ? 'kairo.components' : 'kairo.tokens';
      expect(blocks, file).toEqual([`@layer ${expected} { … }`]);
    }
  });
});
