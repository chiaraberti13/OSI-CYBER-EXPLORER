import assert from 'node:assert/strict';
import test from 'node:test';

import { parseReleaseMetadata } from './release-metadata.mjs';

const manifest = (version = '1.2.3') => JSON.stringify({ version });
const changelog = (heading = '## [1.2.3] - 2026-09-27', body = '### Added\n\n- Release.') =>
  `# Changelog\n\n## [Unreleased]\n\n${heading}\n\n${body}\n`;

test('accepts a tag, package version and non-empty changelog section that agree', () => {
  assert.deepEqual(
    parseReleaseMetadata({
      tag: 'v1.2.3',
      packageJson: manifest(),
      changelog: changelog(),
    }),
    {
      tag: 'v1.2.3',
      version: '1.2.3',
      releaseDate: '2026-09-27',
      notes: '### Added\n\n- Release.',
    },
  );
});

test('accepts a valid Semantic Versioning prerelease', () => {
  const result = parseReleaseMetadata({
    tag: 'v2.0.0-rc.1',
    packageJson: manifest('2.0.0-rc.1'),
    changelog: changelog('## [2.0.0-rc.1] - 2026-09-27'),
  });

  assert.equal(result.version, '2.0.0-rc.1');
});

test('rejects tags without the v prefix or strict Semantic Versioning', () => {
  for (const tag of ['1.2.3', 'v1.2', 'v01.2.3', 'vlatest']) {
    assert.throws(
      () => parseReleaseMetadata({ tag, packageJson: manifest(), changelog: changelog() }),
      /Release tag|Semantic Versioning/,
    );
  }
});

test('rejects a tag that differs from package.json', () => {
  assert.throws(
    () =>
      parseReleaseMetadata({
        tag: 'v1.2.3',
        packageJson: manifest('1.2.4'),
        changelog: changelog(),
      }),
    /does not match package.json/,
  );
});

test('requires one versioned changelog section', () => {
  assert.throws(
    () =>
      parseReleaseMetadata({
        tag: 'v1.2.3',
        packageJson: manifest(),
        changelog: '# Changelog\n\n## [Unreleased]\n',
      }),
    /exactly one/,
  );

  assert.throws(
    () =>
      parseReleaseMetadata({
        tag: 'v1.2.3',
        packageJson: manifest(),
        changelog: `${changelog()}\n${changelog()}`,
      }),
    /exactly one/,
  );
});

test('rejects invalid release dates and empty notes', () => {
  assert.throws(
    () =>
      parseReleaseMetadata({
        tag: 'v1.2.3',
        packageJson: manifest(),
        changelog: changelog('## [1.2.3] - 2026-02-30'),
      }),
    /invalid release date/,
  );

  assert.throws(
    () =>
      parseReleaseMetadata({
        tag: 'v1.2.3',
        packageJson: manifest(),
        changelog: changelog('## [1.2.3] - 2026-09-27', ''),
      }),
    /section 1.2.3 is empty/,
  );
});
