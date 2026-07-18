import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no `IntersectionObserver` implementation, but `Reveal`'s
// `whileInView` (via Motion's viewport feature) needs one to be present at
// import time. Stub a minimal, inert class so `new IntersectionObserver(...)`
// doesn't throw — it never actually fires an entry, so tests only assert the
// pre-observation (`initial`) state of `<Reveal>`, not the post-reveal one.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// `@testing-library/react`'s auto-cleanup only self-registers when it
// detects Jest-style `globals: true`; this project runs Vitest without
// globals, so unmount explicitly after every test to avoid leaking DOM
// nodes across tests.
afterEach(() => {
  cleanup();
});
