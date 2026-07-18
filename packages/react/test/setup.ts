import '@testing-library/jest-dom/vitest';
// `vitest-axe`@0.1.0 publishes an empty `dist/extend-expect.js` (upstream
// packaging bug), so `vitest-axe/extend-expect` is a no-op at runtime. Wire
// the matcher manually from `vitest-axe/matchers`, which is intact.
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'vitest-axe/matchers';

expect.extend({ toHaveNoViolations });

// `@testing-library/react`'s auto-cleanup only self-registers when it
// detects Jest-style `globals: true`; this project runs Vitest without
// globals, so unmount explicitly after every test to avoid leaking DOM
// nodes across tests.
afterEach(() => {
  cleanup();
});
