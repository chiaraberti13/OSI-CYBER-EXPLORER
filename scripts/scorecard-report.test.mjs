import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { formatScorecardTrend, validateScorecardReport } from './scorecard-report.mjs';

const baseline = JSON.parse(await readFile(new URL('../docs/scorecard/2026-10-05.json', import.meta.url), 'utf8'));
const reportWith = (checks, extra = {}) => ({ ...baseline, checks, ...extra });

test('preserves the published baseline aggregate and every check, including inconclusive results', () => {
  const markdown = formatScorecardTrend(baseline, baseline, baseline.repo.commit);
  assert.match(markdown, /\*\*7\/10\*\*/);
  for (const check of baseline.checks) assert.ok(markdown.includes(`| ${check.name} |`));
  assert.match(markdown, /CI-Tests \| inconclusive \/ non conclusivo/);
  assert.match(markdown, /Branch-Protection \| 0\/10 \| 0\/10 \| =/);
});

test('shows real deltas without inventing scores for new, removed or inconclusive checks', () => {
  const before = reportWith([
    { name: 'One', score: 2, reason: 'old' },
    { name: 'Two', score: -1, reason: 'inconclusive' },
    { name: 'Gone', score: 5, reason: 'old' },
  ]);
  const after = reportWith([
    { name: 'One', score: 0, reason: 'regression' },
    { name: 'Two', score: 10, reason: 'now measured' },
    { name: 'New', score: 3, reason: 'new check' },
  ]);
  const markdown = formatScorecardTrend(after, before);
  assert.match(markdown, /One \| 2\/10 \| 0\/10 \| -2/);
  assert.match(markdown, /Two \| inconclusive \/ non conclusivo \| 10\/10 \| coverage changed/);
  assert.match(markdown, /Gone \| 5\/10 \| absent \/ assente \| removed/);
  assert.match(markdown, /New \| absent \/ assente \| 3\/10 \| new/);
});

test('accepts zero and CLI reports without aggregate scores; never calculates a replacement', () => {
  assert.match(formatScorecardTrend({ ...baseline, score: 0 }, baseline), /\*\*0\/10\*\*/);
  const cliReport = { ...baseline };
  delete cliReport.score;
  assert.match(formatScorecardTrend(cliReport, baseline), /not supplied by CLI/);
});

test('rejects reports for another repository or commit and malformed or duplicate check scores', () => {
  const check = { name: 'Valid', score: 10, reason: 'valid' };
  assert.throws(() => validateScorecardReport(baseline, '0'.repeat(40)), /workflow commit/);
  assert.throws(() => validateScorecardReport({ ...baseline, repo: { ...baseline.repo, name: 'other/repo' } }), /repository/);
  for (const checks of [[], [check, check], [{ ...check, score: -2 }], [{ ...check, score: 11 }], [{ ...check, score: 0.5 }], [{ ...check, name: '<script>' }], [{ ...check, reason: null }]]) {
    assert.throws(() => validateScorecardReport(reportWith(checks)));
  }
  for (const value of [null, [], { ...baseline, date: 'invalid' }, { ...baseline, score: NaN }, { ...baseline, scorecard: { version: '<script>' } }]) {
    assert.throws(() => validateScorecardReport(value));
  }
});

test('escapes scanner reasons without allowing HTML or injected Markdown table rows', () => {
  const markdown = formatScorecardTrend(reportWith([
    { name: 'Safe', score: 0, reason: '<script>bad</script> | injected\nnext row `code`' },
  ]), baseline);
  assert.ok(markdown.includes('&lt;script&gt;'));
  assert.ok(markdown.includes('\\| injected next row \\`code\\`'));
  assert.ok(!markdown.includes('<script>'));
});
