/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { describe, expect, it, vi } from 'vitest';
import { importWithRetry } from './lazyWithRetry';

describe('importWithRetry (ENG-09 loader-level chunk retry)', () => {
  it('resolves on the first attempt without retrying', async () => {
    const factory = vi.fn(async () => ({ default: 'view' }));

    await expect(importWithRetry(factory, { delayMs: 0 })).resolves.toEqual({ default: 'view' });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('retries a transient failure and resolves with the eventual success', async () => {
    const factory = vi
      .fn<() => Promise<{ default: string }>>()
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce({ default: 'view' });

    await expect(importWithRetry(factory, { delayMs: 0 })).resolves.toEqual({ default: 'view' });
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('re-invokes the factory on every attempt, issuing a fresh import each time', async () => {
    const factory = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValueOnce('ok');

    await expect(importWithRetry(factory, { retries: 2, delayMs: 0 })).resolves.toBe('ok');
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('rejects with the last error once every attempt has failed', async () => {
    const factory = vi
      .fn<() => Promise<never>>()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockRejectedValueOnce(new Error('final failure'));

    await expect(importWithRetry(factory, { retries: 2, delayMs: 0 })).rejects.toThrow('final failure');
    // 1 initial attempt + 2 retries.
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('makes no retries when retries is 0', async () => {
    const factory = vi.fn<() => Promise<never>>().mockRejectedValue(new Error('boom'));

    await expect(importWithRetry(factory, { retries: 0, delayMs: 0 })).rejects.toThrow('boom');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('defaults to two retries (three attempts) when no options are given', async () => {
    const factory = vi.fn<() => Promise<never>>().mockRejectedValue(new Error('boom'));

    await expect(importWithRetry(factory, { delayMs: 0 })).rejects.toThrow('boom');
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('waits for the default backoff before the second retry', async () => {
    vi.useFakeTimers();
    try {
      const factory = vi.fn<() => Promise<string>>()
        .mockRejectedValueOnce(new Error('first blip'))
        .mockRejectedValueOnce(new Error('second blip'))
        .mockResolvedValueOnce('loaded');
      const result = importWithRetry(factory);

      await vi.advanceTimersByTimeAsync(0);
      expect(factory).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(149);
      expect(factory).toHaveBeenCalledTimes(2);
      await vi.advanceTimersByTimeAsync(1);
      await expect(result).resolves.toBe('loaded');
      expect(factory).toHaveBeenCalledTimes(3);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('clamps negative retry and delay budgets to zero', async () => {
    const factory = vi.fn<() => Promise<never>>().mockRejectedValue(new Error('offline'));
    await expect(importWithRetry(factory, { retries: -1, delayMs: -150 })).rejects.toThrow('offline');
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
