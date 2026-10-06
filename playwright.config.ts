import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

/**
 * ENG-12 — end-to-end smoke tests.
 *
 * The suite runs against the production build served by `vite preview`, so it
 * exercises the same lazy chunks, hash routing and CSP-safe assets that ship to
 * users, not a dev-server approximation. Only Chromium runs for now; Firefox and
 * WebKit are added once the suite has proven stable in CI (see ROADMAP ENG-12).
 */

const HOST = '127.0.0.1';
const PORT = 4173;
const BASE_URL = `http://${HOST}:${PORT}`;
const isCI = !!process.env.CI;

/**
 * The managed cloud/dev environment ships a pinned Chromium at a fixed revision and
 * points PLAYWRIGHT_BROWSERS_PATH at it; the generic `chromium` symlink lets the
 * pinned @playwright/test launch that build without downloading one. In CI and on
 * developer machines this path does not exist, so Playwright resolves the browser it
 * installed itself (`npx playwright install chromium`).
 */
const PREINSTALLED_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = existsSync(PREINSTALLED_CHROMIUM) ? PREINSTALLED_CHROMIUM : undefined;

export default defineConfig({
  testDir: './e2e',
  // A static SPA has no shared server state, so specs are safe to parallelise.
  fullyParallel: true,
  // A stray `test.only` must never silently shrink the CI suite.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
    launchOptions: executablePath ? { executablePath } : {}
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    // Build once, then serve the real bundle. `reuseExistingServer` keeps local
    // reruns fast when a preview is already up.
    command: `npm run build && npm run preview -- --port=${PORT} --host=${HOST} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000
  }
});
