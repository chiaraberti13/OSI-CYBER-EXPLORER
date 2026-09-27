import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toISOString().slice(0, 10) === value;
}

export function parseReleaseMetadata({ tag, packageJson, changelog }) {
  if (typeof tag !== 'string' || !tag.startsWith('v')) {
    throw new Error('Release tag must use the vMAJOR.MINOR.PATCH form.');
  }

  const version = tag.slice(1);
  if (!SEMVER.test(version)) {
    throw new Error(`Release tag ${tag} is not valid Semantic Versioning.`);
  }

  let manifest;
  try {
    manifest = JSON.parse(packageJson);
  } catch {
    throw new Error('package.json is not valid JSON.');
  }

  if (manifest.version !== version) {
    throw new Error(
      `Tag ${tag} does not match package.json version ${String(manifest.version)}.`,
    );
  }

  const normalizedChangelog = changelog.replace(/\r\n?/g, '\n');
  const heading = new RegExp(
    `^## \\[${escapeRegExp(version)}\\] - (\\d{4}-\\d{2}-\\d{2})\\s*$`,
    'gm',
  );
  const matches = [...normalizedChangelog.matchAll(heading)];

  if (matches.length !== 1) {
    throw new Error(
      `CHANGELOG.md must contain exactly one "## [${version}] - YYYY-MM-DD" section.`,
    );
  }

  const releaseDate = matches[0][1];
  if (!isIsoDate(releaseDate)) {
    throw new Error(`CHANGELOG.md contains an invalid release date: ${releaseDate}.`);
  }

  const contentStart = matches[0].index + matches[0][0].length;
  const nextHeading = normalizedChangelog.indexOf('\n## ', contentStart);
  const notes = normalizedChangelog
    .slice(contentStart, nextHeading === -1 ? undefined : nextHeading)
    .trim();

  if (!notes) {
    throw new Error(`CHANGELOG.md release section ${version} is empty.`);
  }

  return { tag, version, releaseDate, notes };
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const tag = readArgument('--tag') ?? process.env.GITHUB_REF_NAME;
  const manifestPath = resolve(readArgument('--package') ?? 'package.json');
  const changelogPath = resolve(readArgument('--changelog') ?? 'CHANGELOG.md');
  const notesPath = readArgument('--notes');

  const metadata = parseReleaseMetadata({
    tag,
    packageJson: await readFile(manifestPath, 'utf8'),
    changelog: await readFile(changelogPath, 'utf8'),
  });

  if (notesPath) {
    await writeFile(resolve(notesPath), `${metadata.notes}\n`, { flag: 'wx' });
  }

  process.stdout.write(`${JSON.stringify(metadata)}\n`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
