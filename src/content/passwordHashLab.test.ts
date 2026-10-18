import { describe, expect, it } from 'vitest';
import { simulateOfflineCost, simulateOnlineAttempts, type GuessBudget } from './passwordHashLab';

const defaults = {
  strategy: 'brute-force' as const,
  attempts: 8,
  accounts: 4,
  rateLimitEnabled: false,
  accountLockoutEnabled: false
};

describe('offline password fixture model', () => {
  it('applies per-account lockout after five synthetic failures', () => {
    const result = simulateOnlineAttempts({ ...defaults, accountLockoutEnabled: true });
    expect(result).toMatchObject({
      submitted: 8,
      processed: 5,
      lockedAccounts: 1,
      lockoutBlocked: 3,
      rateLimited: 0,
      sprayDetected: false
    });
    expect(result?.telemetry).toContain('ACCOUNT_LOCKOUT: fixture-user-01 · fixture policy threshold reached');
  });

  it('distinguishes a rate limit from lockout for repeated online attempts', () => {
    const result = simulateOnlineAttempts({ ...defaults, rateLimitEnabled: true });
    expect(result).toMatchObject({ processed: 3, rateLimited: 5, lockedAccounts: 0, lockoutBlocked: 0 });
    expect(result?.telemetry.some((event) => event.startsWith('RATE_LIMIT:'))).toBe(true);
  });

  it('detects a distributed spray without locking each synthetic account', () => {
    const result = simulateOnlineAttempts({
      ...defaults,
      strategy: 'password-spray',
      accounts: 5,
      rateLimitEnabled: true,
      accountLockoutEnabled: true
    });
    expect(result).toMatchObject({
      submitted: 5,
      processed: 5,
      distinctAccounts: 5,
      rateLimited: 0,
      lockedAccounts: 0,
      sprayDetected: true
    });
    expect(result?.telemetry.at(-1)).toContain('CORRELATED_FAILURES: 5 synthetic accounts');
  });

  it('compares illustrative offline KDF costs without calculating hashes', () => {
    const smallBudget = simulateOfflineCost(10);
    expect(smallBudget?.[0].sampleFound).toBe(false);
    expect(smallBudget?.[1].sampleFound).toBe(false);
    const result = simulateOfflineCost(100);
    expect(result).toHaveLength(2);
    expect(result?.[0]).toMatchObject({ id: 'fast', sampleFound: true, unitsPerGuess: 1, saltLabel: 'none' });
    expect(result?.[1]).toMatchObject({
      id: 'kdf',
      sampleFound: false,
      unitsPerGuess: 100,
      totalUnits: 10_000,
      saltLabel: 'fixture-salt-unique-02'
    });
    expect(result?.[0].fingerprint).not.toBe(result?.[1].fingerprint);
  });

  it('rejects budgets and online controls outside the bounded fixture', () => {
    expect(simulateOfflineCost(11 as GuessBudget)).toBeNull();
    expect(simulateOnlineAttempts({ ...defaults, attempts: 9 })).toBeNull();
    expect(simulateOnlineAttempts({ ...defaults, strategy: 'password-spray', accounts: 7 })).toBeNull();
  });
});
