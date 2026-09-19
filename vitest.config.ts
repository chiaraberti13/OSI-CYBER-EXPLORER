import { defineConfig } from 'vitest/config';

/**
 * Vitest keeps its own config file because it ships its own copy of Vite: sharing one
 * `defineConfig` made the plugin types from the two copies disagree. No Vite plugin is
 * needed to run the suite — esbuild handles the TSX in the component tests.
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
