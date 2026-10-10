/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

/**
 * Loader-level retry for lazily-loaded chunks (ENG-09).
 *
 * A dynamic `import()` is the one place this otherwise self-contained SPA depends on
 * the network at runtime: the per-view chunks are fetched on demand. The common failure
 * is transient — a dropped connection, a chunk still propagating on a fresh deploy, a
 * flaky proxy — and a single immediate retry usually succeeds. `React.lazy` calls its
 * factory exactly once and then caches the result (success *or* failure) forever, so a
 * bare `lazy(() => import(...))` turns a one-off blip into a permanently broken view.
 *
 * `importWithRetry` wraps the import factory so those transient failures are retried,
 * with a short linear backoff, before the promise is allowed to reject. Only once the
 * attempts are exhausted does the error propagate — at which point the {@link
 * ChunkErrorBoundary} takes over with a recoverable, bilingual fallback. Keeping the
 * retry here (pure, deterministic, no React) makes it unit-testable without a DOM.
 */

export interface ImportRetryOptions {
  /** How many *extra* attempts to make after the first failure. Default: 2. */
  retries?: number;
  /** Base delay between attempts, multiplied by the attempt index (linear backoff). Default: 150ms. */
  delayMs?: number;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_DELAY_MS = 150;

function wait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Invoke `factory` and, if it rejects, retry up to `retries` more times with a linear
 * backoff. Resolves with the first successful result; rejects with the last error only
 * after every attempt has failed. The factory is re-invoked on each attempt, so a fresh
 * `import()` is issued every time rather than reusing a rejected promise.
 */
export async function importWithRetry<T>(
  factory: () => Promise<T>,
  options: ImportRetryOptions = {}
): Promise<T> {
  const retries = Math.max(0, options.retries ?? DEFAULT_RETRIES);
  const delayMs = Math.max(0, options.delayMs ?? DEFAULT_DELAY_MS);

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await factory();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        // Linear backoff: 0 before the first retry grows with each subsequent attempt.
        await wait(delayMs * attempt);
      }
    }
  }
  throw lastError;
}
