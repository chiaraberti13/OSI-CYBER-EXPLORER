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
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Include unimported logic too: a new module must not silently disappear
      // from the denominator. Educational datasets and UI are outside this gate.
      include: ['src/lib/**/*.{ts,tsx}'],
      exclude: ['src/lib/**/*.{test,spec}.{ts,tsx}', 'src/lib/**/*.d.ts'],
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportOnFailure: true,
      thresholds: {
        // ENG-11 baseline (24 modules): 97.58% lines, 95.21% statements,
        // 91.87% branches, 99.59% functions. Keep changes to this policy explicit.
        lines: 95,
        statements: 92,
        branches: 90,
        functions: 98,
        autoUpdate: false,
        // A well-tested large module must not mask an untested small one.
        perFile: { lines: 80, statements: 80, branches: 70, functions: 90 }
      }
    }
  }
});
