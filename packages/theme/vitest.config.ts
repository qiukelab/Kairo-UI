import { defineConfig } from 'vitest/config';

/**
 * This package ships CSS and a handful of DOM one-liners, so its tests are
 * file-level assertions about the stylesheets rather than component tests —
 * `node` is enough, and there is deliberately no setup file (the jsdom /
 * vitest-axe wiring in `@kairo-ui/react` is not relevant here).
 */
export default defineConfig({
  test: {
    environment: 'node',
  },
});
