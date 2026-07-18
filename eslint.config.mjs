// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    '**/dist/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/.source/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.tsbuildinfo',
    // Next.js codegen — regenerated on every build, not hand-maintained.
    '**/next-env.d.ts',
  ]),

  js.configs.recommended,

  // Non-type-checked TS rules: enough correctness coverage for a library
  // this size without the cross-package `parserOptions.project` wiring
  // (and slower per-file type info) that the `*TypeChecked` presets need.
  ...tseslint.configs.recommended,

  {
    // Browser + Node globals cover both the UI packages (window/document)
    // and Node-context config/tooling files (process, module) in one pass.
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  {
    files: ['**/*.{jsx,tsx}'],
    extends: [react.configs.flat.recommended, react.configs.flat['jsx-runtime']],
    settings: {
      // Hardcoded rather than `'detect'`: avoids `react/package.json`
      // resolution depending on which workspace dir ESLint is invoked from.
      react: { version: '19.2' },
    },
    rules: {
      // TS already validates prop shapes at compile time; this rule predates
      // good TypeScript support and doesn't understand our prop interfaces.
      'react/prop-types': 'off',
    },
  },

  {
    files: ['**/*.{jsx,tsx,ts}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Deliberately not the plugin's `recommended` preset: v7 merged in
      // React Compiler diagnostics (purity/immutability/static-components/
      // ...) meant for apps opting into the compiler. Kairo doesn't use it,
      // and those rules flagged noisy false positives against Base UI's
      // ref- and effect-heavy wrapper patterns. Keep just the two
      // battle-tested Rules-of-Hooks checks.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    // Every component re-exports a Base UI (or native DOM) prop type under a
    // Kairo-branded name for docs/DX, e.g.
    // `interface ButtonProps extends ButtonHTMLAttributes<...> {}` — an
    // intentional single-extends alias, not an accidental empty `{}` type.
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },

  {
    // `vitest-axe.d.ts` mirrors upstream Vitest ambient module-augmentation
    // signatures: `Assertion<T = any>` needs the same `any` default and the
    // same type-parameter arity as the interface it merges with, even though
    // neither is referenced in the (intentionally empty) augmented body.
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]);
