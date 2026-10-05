import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY = 'github.com/chiaraberti13/OSI-CYBER-EXPLORER';
const COMMIT = /^[a-f0-9]{40}$/;
const CHECK_NAME = /^[A-Za-z][A-Za-z0-9-]{0,63}$/;

export function validateScorecardReport(value, expectedCommit) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Scorecard report must be an object.');
  }
  if (value.repo?.name !== REPOSITORY || !COMMIT.test(value.repo?.commit ?? '')) {
    throw new Error('Scorecard repository or commit is invalid.');
  }
  if (expectedCommit !== undefined && value.repo.commit !== expectedCommit) {
    throw new Error('Scorecard report does not match the workflow commit.');
  }
  if (typeof value.date !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(value.date)
      || Number.isNaN(Date.parse(value.date))) {
    throw new Error('Scorecard report date is invalid.');
  }
  if (typeof value.scorecard?.version !== 'string' || !/^v\d+\.\d+\.\d+$/.test(value.scorecard.version)) {
    throw new Error('Scorecard engine version is invalid.');
  }
  if (value.score !== undefined && (!Number.isFinite(value.score) || value.score < 0 || value.score > 10)) {
    throw new Error('Scorecard aggregate score is invalid.');
  }
  if (!Array.isArray(value.checks) || value.checks.length === 0 || value.checks.length > 100) {
    throw new Error('Scorecard checks are missing or exceed the report limit.');
  }
  const names = new Set();
  for (const check of value.checks) {
    if (!check || typeof check.name !== 'string' || !CHECK_NAME.test(check.name) || names.has(check.name)) {
      throw new Error('Scorecard check names must be valid and unique.');
    }
    if (!Number.isInteger(check.score) || check.score < -1 || check.score > 10) {
      throw new Error('Scorecard check score must be -1 or an integer from 0 to 10.');
    }
    if (typeof check.reason !== 'string' || check.reason.length > 4096) {
      throw new Error('Scorecard check reason is invalid.');
    }
    names.add(check.name);
  }
  return value;
}

function cell(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('|', '\\|')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('`', '\\`')
    .replace(/[\r\n]+/g, ' ');
}

function scoreLabel(check) {
  if (!check) return 'absent / assente';
  return check.score === -1 ? 'inconclusive / non conclusivo' : `${check.score}/10`;
}

function changeLabel(current, previous) {
  if (!previous) return 'new / nuovo';
  if (!current) return 'removed / rimosso';
  if (current.score === previous.score) return '=';
  if (current.score === -1 || previous.score === -1) return 'coverage changed / copertura cambiata';
  const delta = current.score - previous.score;
  return `${delta > 0 ? '+' : ''}${delta}`;
}

export function formatScorecardTrend(current, baseline, expectedCommit) {
  validateScorecardReport(current, expectedCommit);
  validateScorecardReport(baseline);
  const oldChecks = new Map(baseline.checks.map((check) => [check.name, check]));
  const newChecks = new Map(current.checks.map((check) => [check.name, check]));
  const names = [...new Set([...oldChecks.keys(), ...newChecks.keys()])].sort();
  const lines = [
    '# OpenSSF Scorecard trend / Andamento OpenSSF Scorecard',
    '',
    '**Informational, never a score gate / Informativo, senza soglia bloccante.**',
    '',
    `- Date / Data: ${cell(current.date)}`,
    `- Commit: \`${current.repo.commit}\``,
    `- Engine / Motore: \`${cell(current.scorecard.version)}\``,
    `- Baseline: ${cell(baseline.date)}, \`${baseline.repo.commit}\``,
    current.score === undefined
      ? '- Aggregate / Punteggio complessivo: not supplied by CLI; use the published API / non fornito dalla CLI; consultare l’API pubblicata.'
      : `- Published aggregate / Punteggio complessivo pubblicato: **${current.score}/10** (preserved, not recalculated / conservato, non ricalcolato).`,
    '- `-1` means inconclusive, never zero / `-1` indica un risultato non conclusivo, mai zero.',
    '- Engine changes may change scoring; inspect reasons before comparing / Una nuova versione può cambiare il punteggio: confrontare anche i motivi.',
    '',
    '| Check / Controllo | Baseline | Current / Attuale | Change / Variazione | Reason / Motivo attuale |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const name of names) {
    const currentCheck = newChecks.get(name);
    const previousCheck = oldChecks.get(name);
    lines.push(`| ${name} | ${scoreLabel(previousCheck)} | ${scoreLabel(currentCheck)} | ${changeLabel(currentCheck, previousCheck)} | ${cell(currentCheck?.reason ?? 'Check absent in current scan / Controllo assente nella scansione attuale')} |`);
  }
  lines.push('', 'Decisions and limitations / Decisioni e limiti: [repository posture / postura del repository](https://github.com/chiaraberti13/OSI-CYBER-EXPLORER/blob/main/docs/REPOSITORY_POSTURE.md).', '');
  return lines.join('\n');
}

async function readReport(path) {
  const text = await readFile(path, 'utf8');
  if (Buffer.byteLength(text, 'utf8') > 1024 * 1024) throw new Error('Scorecard report exceeds 1 MiB.');
  return JSON.parse(text);
}

async function main() {
  const args = process.argv.slice(2);
  const options = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!['--input', '--baseline', '--commit', '--output'].includes(key) || !value || options.has(key)) {
      throw new Error('Expected unique --input, --baseline, --commit and --output arguments.');
    }
    options.set(key, value);
  }
  if (options.size !== 4 || !COMMIT.test(options.get('--commit') ?? '')) {
    throw new Error('Expected report paths and a full workflow commit SHA.');
  }
  const [current, baseline] = await Promise.all([
    readReport(options.get('--input')),
    readReport(options.get('--baseline')),
  ]);
  const report = formatScorecardTrend(current, baseline, options.get('--commit'));
  await writeFile(options.get('--output'), report, 'utf8');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
