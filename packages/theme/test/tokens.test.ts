import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  OUTPUT_PATH,
  generateTokens,
  parseTokensCss,
  renderTokensModule,
} from '../scripts/generate-tokens.mjs';

/**
 * `src/tokens.generated.ts` is committed, not built on the fly (a token
 * rename needs to show up in the PR diff, and `tsc`/editor IntelliSense need
 * to work on a clean clone without a build step). That only stays true if
 * something notices when it drifts from `css/tokens.css` — this suite is
 * that something.
 */
describe('tokens.generated.ts', () => {
  it('matches what scripts/generate-tokens.mjs produces from css/tokens.css', () => {
    const committed = readFileSync(OUTPUT_PATH, 'utf8');
    const fresh = renderTokensModule(generateTokens());

    expect(
      fresh,
      'src/tokens.generated.ts is out of date. Run `node scripts/generate-tokens.mjs` in packages/theme and commit the result.',
    ).toBe(committed);
  });

  it(":root is a superset of every other block (.dark and each [data-kairo-theme='…'] preset)", () => {
    const { rootNames, foreignTokens } = parseTokensCss();

    // Guards against the check being vacuously true if tokens.css is ever
    // restructured so no block other than :root exists any more.
    expect(foreignTokens.length).toBeGreaterThan(0);

    const missing = foreignTokens.filter((token) => !rootNames.has(token.name));
    expect(
      missing,
      missing
        .map((token) => `${token.name} in '${token.selector}' (tokens.css:${token.line})`)
        .join('\n'),
    ).toEqual([]);
  });

  it('generateTokens() throws when a custom property exists outside :root but not inside it', () => {
    // A synthetic fixture, not css/tokens.css: this proves the check itself
    // can actually fail (a superset assertion that only ever runs against a
    // file with no violations never demonstrates that). `--kairo-bar` is
    // declared in `.dark` only, which is exactly the bug the generator
    // exists to catch — a token that would be `undefined` in the default
    // theme.
    const dir = mkdtempSync(join(tmpdir(), 'kairo-tokens-'));
    const fixture = join(dir, 'tokens.css');
    writeFileSync(
      fixture,
      [
        ':root {',
        '  --kairo-foo: red;',
        '}',
        '.dark {',
        '  --kairo-foo: blue;',
        '  --kairo-bar: green;',
        '}',
        '',
      ].join('\n'),
      'utf8',
    );

    try {
      expect(() => generateTokens(fixture)).toThrow(/--kairo-bar/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
