/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

/**
 * The project is distributed under the GNU GPL-3.0 (see LICENSE, the README badges
 * and package.json#license). A relicense left behind source files whose
 * `SPDX-License-Identifier` header still claimed MIT, so a file's own metadata
 * contradicted the project's licence.
 *
 * This guard keeps the two in sync: every SPDX header under `src/` must name the
 * single identifier the project uses, and `package.json#license` must match it.
 * It does not require a header on every file — it only forbids a header that
 * disagrees with the project licence, which is exactly the regression that
 * happened before. A mismatching or re-added MIT header now fails here and in CI.
 */

const EXPECTED_SPDX = 'GPL-3.0-only';
const SPDX_PATTERN = /SPDX-License-Identifier:\s*(.+?)\s*$/m;

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = here;
const repoRoot = join(here, '..');

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...sourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe('licence header consistency', () => {
  const files = sourceFiles(srcDir);

  it('finds the source tree to scan', () => {
    // A path or glob regression must not make the scan vacuously pass.
    expect(files.length).toBeGreaterThan(50);
  });

  it('declares only the project SPDX identifier in src headers', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const match = SPDX_PATTERN.exec(readFileSync(file, 'utf8'));
      if (match && match[1] !== EXPECTED_SPDX) {
        offenders.push(`${relative(repoRoot, file)}: ${match[1]}`);
      }
    }
    expect(offenders, `Unexpected SPDX identifiers (expected ${EXPECTED_SPDX})`).toEqual([]);
  });

  it('keeps package.json#license aligned with the headers', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as {
      license?: string;
    };
    expect(pkg.license).toBe(EXPECTED_SPDX);
  });
});
