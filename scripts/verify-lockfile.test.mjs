import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LockfilePolicyError, verifyLockfilePolicy } from './verify-lockfile.mjs';

const integrity = `sha512-${Buffer.alloc(64, 7).toString('base64')}`;

function lockfileWith(metadata) {
  return {
    lockfileVersion: 3,
    packages: {
      '': { name: 'fixture' },
      'node_modules/example': {
        version: '1.0.0',
        resolved: 'https://registry.npmjs.org/example/-/example-1.0.0.tgz',
        integrity,
        ...metadata,
      },
    },
  };
}

describe('bootstrap lockfile policy', () => {
  it('accepts an npmjs HTTPS tarball with SHA-512 integrity', () => {
    assert.deepEqual(verifyLockfilePolicy(lockfileWith({})), { packageCount: 1 });
  });

  it('rejects an unexpected registry host', () => {
    assert.throws(
      () => verifyLockfilePolicy(lockfileWith({ resolved: 'https://evil.example/example.tgz' })),
      error => error instanceof LockfilePolicyError && error.message.includes('untrusted registry URL'),
    );
  });

  it('rejects HTTP even for the trusted hostname', () => {
    assert.throws(
      () => verifyLockfilePolicy(lockfileWith({ resolved: 'http://registry.npmjs.org/example.tgz' })),
      error => error instanceof LockfilePolicyError && error.message.includes('untrusted registry URL'),
    );
  });

  it('rejects missing, malformed and weaker integrity values', () => {
    for (const invalid of [undefined, 'sha1-deadbeef', 'sha512-not-base64']) {
      assert.throws(
        () => verifyLockfilePolicy(lockfileWith({ integrity: invalid })),
        error => error instanceof LockfilePolicyError && error.message.includes('non-SHA-512 integrity'),
      );
    }
  });

  it('rejects packages without a resolved tarball', () => {
    assert.throws(
      () => verifyLockfilePolicy(lockfileWith({ resolved: undefined })),
      error => error instanceof LockfilePolicyError && error.message.includes('missing resolved tarball URL'),
    );
  });

  it('rejects unexpected lockfile schemas', () => {
    assert.throws(
      () => verifyLockfilePolicy({ lockfileVersion: 2, packages: [] }),
      error => error instanceof LockfilePolicyError
        && error.message.includes('lockfileVersion 3')
        && error.message.includes('packages object'),
    );
    assert.throws(
      () => verifyLockfilePolicy({ lockfileVersion: 3 }),
      error => error instanceof LockfilePolicyError && error.message.includes('packages object'),
    );
    assert.throws(
      () => verifyLockfilePolicy(null),
      error => error instanceof LockfilePolicyError && error.message.includes('JSON object'),
    );
  });
});
