import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const TRUSTED_NPM_ORIGIN = 'https://registry.npmjs.org';

export class LockfilePolicyError extends Error {
  constructor(violations) {
    super(`Lockfile policy violations:\n- ${violations.join('\n- ')}`);
    this.name = 'LockfilePolicyError';
    this.violations = violations;
  }
}

function hasSha512Integrity(value) {
  if (typeof value !== 'string' || !/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(value)) return false;
  const encoded = value.slice('sha512-'.length);
  return Buffer.from(encoded, 'base64').byteLength === 64;
}

export function verifyLockfilePolicy(lockfile) {
  const violations = [];

  if (lockfile === null || typeof lockfile !== 'object' || Array.isArray(lockfile)) {
    throw new LockfilePolicyError(['package-lock.json must contain a JSON object']);
  }

  if (lockfile?.lockfileVersion !== 3) {
    violations.push('package-lock.json must use lockfileVersion 3');
  }

  const packages = lockfile.packages;
  if (packages === null || typeof packages !== 'object' || Array.isArray(packages)) {
    violations.push('package-lock.json must contain a packages object');
    throw new LockfilePolicyError(violations);
  }

  let packageCount = 0;
  for (const [packagePath, metadata] of Object.entries(packages)) {
    if (packagePath === '') continue;
    packageCount += 1;

    if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
      violations.push(`${packagePath}: invalid package metadata`);
      continue;
    }

    if (typeof metadata.resolved !== 'string') {
      violations.push(`${packagePath}: missing resolved tarball URL`);
    } else {
      try {
        const resolved = new URL(metadata.resolved);
        if (resolved.origin !== TRUSTED_NPM_ORIGIN || resolved.username || resolved.password) {
          violations.push(`${packagePath}: untrusted registry URL ${metadata.resolved}`);
        }
      } catch {
        violations.push(`${packagePath}: invalid resolved URL ${metadata.resolved}`);
      }
    }

    if (!hasSha512Integrity(metadata.integrity)) {
      violations.push(`${packagePath}: missing or non-SHA-512 integrity`);
    }
  }

  if (violations.length > 0) throw new LockfilePolicyError(violations);
  return { packageCount };
}

export async function verifyLockfileFile(path = 'package-lock.json') {
  const content = await readFile(path, 'utf8');
  return verifyLockfilePolicy(JSON.parse(content));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { packageCount } = await verifyLockfileFile(process.argv[2]);
    console.log(`Lockfile bootstrap policy passed for ${packageCount} packages.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
