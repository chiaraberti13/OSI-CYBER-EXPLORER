import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluatePerformanceBudget } from './performance-budget.mjs';

const manifest = {
  'index.html': { file: 'assets/index-a.js', src: 'index.html', isEntry: true },
  'src/components/Small.tsx': { file: 'assets/Small-a.js', src: 'src/components/Small.tsx', isDynamicEntry: true },
  'src/components/Large.tsx': { file: 'assets/Large-a.js', src: 'src/components/Large.tsx', isDynamicEntry: true },
};
const config = { schemaVersion: 1, budgets: { initialJsGzipBytes: 100, routeChunkGzipBytes: 50 } };
const sizes = { 'assets/index-a.js': 90, 'assets/Small-a.js': 20, 'assets/Large-a.js': 45 };

test('accepts a single entry and every lazy route inside its budget', () => {
  const result = evaluatePerformanceBudget(manifest, config, sizes);
  assert.deepEqual(result.findings, []);
  assert.equal(result.entry.gzipBytes, 90);
  assert.deepEqual(result.routes.map(route => route.source), ['src/components/Large.tsx', 'src/components/Small.tsx']);
});

test('fails independently when initial or route JavaScript exceeds its budget', () => {
  const result = evaluatePerformanceBudget(manifest, config, { ...sizes, 'assets/index-a.js': 101, 'assets/Large-a.js': 51 });
  assert.deepEqual(result.findings.map(finding => finding.rule), ['PERF-B01', 'PERF-B02']);
});

test('rejects missing and invalid budget configuration', () => {
  const result = evaluatePerformanceBudget(manifest, { schemaVersion: 2, budgets: { initialJsGzipBytes: 0 } }, sizes);
  assert.deepEqual(result.findings.slice(0, 3).map(finding => finding.rule), ['PERF-C01', 'PERF-C02', 'PERF-C03']);
});

test('requires exactly one entry and at least one lazy route', () => {
  const result = evaluatePerformanceBudget({ extra: { file: 'assets/extra.js', isEntry: true } }, config, { 'assets/extra.js': 1 });
  assert.deepEqual(result.findings.map(finding => finding.rule), ['PERF-M02']);
});

test('fails closed when a manifest file has no gzip measurement', () => {
  const result = evaluatePerformanceBudget(manifest, config, { 'assets/index-a.js': 90 });
  assert.equal(result.findings.filter(finding => finding.rule === 'PERF-M03').length, 2);
});
