// `vitest-axe@0.1.0`'s own `extend-expect.d.ts` only augments the legacy
// global `Vi.Assertion` namespace, which current Vitest (4.x) no longer reads
// matchers from (it now augments `Assertion<T>` inside the `'vitest'` module
// itself — the same mechanism `@testing-library/jest-dom` uses). This local
// augmentation bridges that gap so `toHaveNoViolations` type-checks.
import type { AxeMatchers } from 'vitest-axe';

declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
