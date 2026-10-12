import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Lighthouse blocks accessibility scores below 95', () => {
  const config = JSON.parse(read('lighthouserc.json'));
  assert.deepEqual(config.ci.assert.assertions['categories:accessibility'], ['error', { minScore: 0.95 }]);
  assert.equal(config.ci.collect.numberOfRuns, 3);
  assert.ok(config.ci.collect.url.some((url) => url.endsWith('#/osi')));
  assert.ok(config.ci.collect.url.some((url) => url.endsWith('#/ports')));
});

test('the tagged-release workflow runs and retains the browser checklist', () => {
  const workflow = read('.github/workflows/release.yml');
  assert.match(workflow, /name: Run browser accessibility release checklist\n\s+run: npm run test:e2e/);
  assert.match(workflow, /name: Retain Playwright accessibility evidence/);
  assert.match(workflow, /retention-days: 90/);
  assert.match(workflow, /name: Audit release accessibility with Lighthouse CI/);
  assert.match(workflow, /configPath: \.\/lighthouserc\.json/);
  assert.match(workflow, /temporaryPublicStorage: false/);
});

test('the browser suite protects every measurable accessibility target', () => {
  const axe = read('e2e/accessibility.spec.ts');
  const shell = read('e2e/app-shell.spec.ts');

  assert.match(axe, /wcag22aa/);
  assert.match(axe, /traps focus, closes with Escape, and restores the trigger/);
  assert.match(shell, /quick search opens with Ctrl\+K and navigates by keyboard/);
  assert.match(shell, /viewport: \{ width: 320, height: 800 \}/);
  assert.match(shell, /toBeGreaterThanOrEqual\(44\)/);
  assert.match(shell, /reflow\.content.*toBeLessThanOrEqual\(reflow\.viewport\)/s);
});

test('the measurable targets and evidence policy remain documented', () => {
  const policy = read('docs/ACCESSIBILITY_RELEASE_CHECKLIST.md');
  for (const target of ['WCAG 2.2 AA', 'Lighthouse Accessibility', '44 × 44 CSS px', '320 CSS px', '400%']) {
    assert.ok(policy.includes(target), `Missing accessibility target: ${target}`);
  }
  assert.match(policy, /Playwright HTML report/);
  assert.match(policy, /90 days/);
});
