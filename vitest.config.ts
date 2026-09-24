import { defineConfig } from 'vitest/config';

/**
 * Vitest keeps a focused config so the test runner does not load the application-only
 * React and Tailwind plugins. Vitest 5 now shares the same Vite 8 installation used by
 * the build; esbuild handles TSX in the component tests without those plugins.
 */
export default defineConfig({
  test: {
    // Pure logic in src/lib needs no DOM; component tests opt in with a
    // `@vitest-environment jsdom` directive at the top of the file, so the
    // 180+ logic tests keep the fast default.
    environment: 'node',
    globals: false,
    restoreMocks: true,
    include: ['src/**/*.test.{ts,tsx}']
  }
});
