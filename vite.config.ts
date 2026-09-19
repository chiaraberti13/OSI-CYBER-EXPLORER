import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    // Pure logic in src/lib needs no DOM; component tests declare `@vitest-environment jsdom`
    // at the top of the file, so the fast default is kept for the 160+ logic tests.
    environment: 'node',
    globals: false,
    restoreMocks: true
  },
});
