import { describe, expect, it } from 'vitest';
import { readDirectives } from '../scripts/check-use-client.mjs';

// `check-use-client.mjs` decides client/server status from directives it
// finds by walking dist/, and it must not be fooled by the literal text
// 'use client' showing up in a comment (dist/meter/meter.mjs has exactly
// this: a JSDoc block that discusses the words without meaning them as a
// directive). A naive `source.includes("use client")` check would have
// flagged meter — a static component — as a false positive. This suite
// exercises `readDirectives` as a pure function, independent of any build,
// to prove it parses the directive prologue instead of grepping for text.
describe('readDirectives', () => {
  it('ignores a leading JSDoc comment that mentions the words "use client"', () => {
    const source = `
/**
 * This module intentionally avoids the use client directive so it stays
 * a Server Component.
 */
import { forwardRef } from 'react';
`;
    expect(readDirectives(source)).toEqual([]);
  });

  it('reads a directive that follows a leading block comment', () => {
    const source = `
/* eslint-disable */
'use client';
import { useState } from 'react';
`;
    expect(readDirectives(source)).toEqual(['use client']);
  });

  it('reads a double-quoted directive that follows leading line comments', () => {
    const source = `
// generated file
// do not edit
"use client";
import { useState } from 'react';
`;
    expect(readDirectives(source)).toEqual(['use client']);
  });

  it('returns an empty array for a module with only bare imports', () => {
    const source = `
import { forwardRef } from 'react';
import { jsx } from 'react/jsx-runtime';
`;
    expect(readDirectives(source)).toEqual([]);
  });

  it('ignores a "use client" string that appears after a real statement', () => {
    const source = `
import { forwardRef } from 'react';
'use client';
`;
    expect(readDirectives(source)).toEqual([]);
  });

  it('returns both directives when the prologue has two', () => {
    const source = `
'use client';
'use strict';
import { useState } from 'react';
`;
    expect(readDirectives(source)).toEqual(['use client', 'use strict']);
  });
});
