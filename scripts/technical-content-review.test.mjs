import assert from 'node:assert/strict';
import test from 'node:test';
import { reviewRepository, validateLedger } from './technical-content-review.mjs';

const scopes = ['port-registry', 'platform-commands'];
const facts = { ccnaBlueprint: '200-301 v1.1' };
const files = new Set(['src/a.ts']);

function fixture(overrides = {}) {
  return {
    schemaVersion: 1,
    cadenceDays: 180,
    scheduledWarningDays: 30,
    requiredScopes: scopes,
    reviews: [{
      id: '2026-10-10-review',
      reviewedOn: '2026-10-10',
      nextReviewBy: '2027-04-08',
      reviewer: '@chiaraberti13',
      versions: facts,
      decisions: scopes.map(scope => ({
        scope,
        status: 'confirmed',
        summary: { it: 'Verificato.', en: 'Reviewed.' },
        sources: ['https://www.rfc-editor.org/rfc/rfc8996.html'],
        evidence: ['src/a.ts']
      })),
      ...overrides
    }]
  };
}

test('the repository has a complete current technical review', async () => {
  const result = await reviewRepository(undefined, new Date('2026-10-10T12:00:00Z'), true);
  assert.deepEqual(result.findings, []);
  assert.equal(result.latestReview.id, '2026-10-10-baseline');
  assert.equal(result.scopes, 6);
});

test('every review must cover every declared scope exactly once', () => {
  const ledger = fixture();
  ledger.reviews[0].decisions = [ledger.reviews[0].decisions[0], ledger.reviews[0].decisions[0]];
  const findings = validateLedger(ledger, facts, files, new Date('2026-10-10T12:00:00Z'));
  assert(findings.some(finding => finding.rule === 'TC-C01'));
  assert(findings.some(finding => finding.rule === 'TC-C03'));
});

test('expired reviews and an open scheduled window fail closed', () => {
  const expired = validateLedger(fixture(), facts, files, new Date('2027-04-09T12:00:00Z'));
  assert(expired.some(finding => finding.rule === 'TC-R07'));

  const scheduled = validateLedger(fixture(), facts, files, new Date('2027-03-10T12:00:00Z'), true);
  assert(scheduled.some(finding => finding.rule === 'TC-R08'));
});

test('a pinned source version cannot change without a new ledger decision', () => {
  const findings = validateLedger(fixture(), { ccnaBlueprint: '200-301 v2.0' }, files, new Date('2026-10-10T12:00:00Z'));
  assert(findings.some(finding => finding.rule === 'TC-V01'));
});

test('invalid evidence, source hosts, translations, and reviewer identity are rejected', () => {
  const ledger = fixture({ reviewer: 'someone' });
  ledger.reviews[0].decisions[0].sources = ['http://example.com/reference'];
  ledger.reviews[0].decisions[0].evidence = ['missing.ts'];
  ledger.reviews[0].decisions[0].summary.it = '';
  const findings = validateLedger(ledger, facts, files, new Date('2026-10-10T12:00:00Z'));
  for (const rule of ['TC-R02', 'TC-C05', 'TC-C07', 'TC-C09']) {
    assert(findings.some(finding => finding.rule === rule), `missing ${rule}`);
  }
});
