import assert from 'node:assert/strict';
import test from 'node:test';
import { reviewRepository, scanSources, validateRegistry } from './offensive-content-review.mjs';

test('the repository inventory has complete, current reviews', async () => {
  const result = await reviewRepository(undefined, new Date('2026-09-30T12:00:00Z'));
  assert.equal(result.findings.length, 0);
  assert.equal(result.inventory.scenarios.length, 25);
  assert.equal(result.inventory.walkthroughs.length, 25);
  assert.equal(result.inventory.paths.length, 8);
});

test('a new scenario cannot bypass the per-content checklist', () => {
  const registry = {
    schemaVersion: 1,
    cadenceDays: 180,
    checklist: {
      simulationOnly: true,
      authorizationRequired: true,
      defensiveContextRequired: true,
      limitationsRequired: true,
      documentationTargetsOnly: true,
      inertCommandsAndPayloads: true
    },
    reviews: []
  };
  const findings = validateRegistry(registry, { scenarios: ['new-scenario'], paths: [] }, new Date('2026-09-30T12:00:00Z'));
  assert(findings.some(finding => finding.rule === 'OC-C07'));
});

test('expired reviews fail closed', () => {
  const registry = {
    schemaVersion: 1,
    cadenceDays: 180,
    checklist: Object.fromEntries([
      'simulationOnly', 'authorizationRequired', 'defensiveContextRequired',
      'limitationsRequired', 'documentationTargetsOnly', 'inertCommandsAndPayloads'
    ].map(key => [key, true])),
    reviews: [{ kind: 'attack-scenario', contentId: 'demo', reviewedOn: '2025-01-01', nextReviewBy: '2025-06-30', status: 'approved' }]
  };
  const findings = validateRegistry(registry, { scenarios: ['demo'], paths: [] }, new Date('2026-09-30T12:00:00Z'));
  assert(findings.some(finding => finding.rule === 'OC-C06'));
});

test('live targets and reusable payloads are rejected', () => {
  const findings = scanSources({
    'fixture.ts': "curl -Iv https://service.invalid.example/path; target=bank.com; dst=8.8.8.8; <script>steal()</script>; user: ' OR 1=1 --"
  });
  assert(findings.some(finding => finding.rule === 'OC-T01'));
  assert(findings.some(finding => finding.rule === 'OC-T02'));
  assert(findings.some(finding => finding.rule === 'OC-T03'));
  assert(findings.some(finding => finding.rule === 'OC-R01'));
  assert(findings.some(finding => finding.rule === 'OC-R02'));
});

test('reserved lab targets and inert labels are accepted', () => {
  const findings = scanSources({
    'fixture.ts': 'curl -Iv https://web.lab.example.test/; dig +short A dns.lab.example.test; [simulated script input — inert]'
  });
  assert.deepEqual(findings, []);
});
