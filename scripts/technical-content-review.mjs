import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER_PATH = 'docs/technical-content-reviews.json';
const ALLOWED_SOURCE_HOSTS = new Set([
  'attack.mitre.org',
  'csrc.nist.gov',
  'learningcontent.cisco.com',
  'man7.org',
  'www.cisco.com',
  'www.iana.org',
  'www.rfc-editor.org'
]);
const STATUS_VALUES = new Set(['confirmed', 'corrected']);
const DAY_MS = 86_400_000;

function dateValue(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return Number.NaN;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().startsWith(value) ? parsed : Number.NaN;
}

function extract(source, pattern, label) {
  const value = source.match(pattern)?.[1];
  if (!value) throw new Error(`Unable to read ${label} from its source`);
  return value;
}

export function validateLedger(ledger, facts, knownFiles, today = new Date(), scheduled = false) {
  const findings = [];
  if (ledger.schemaVersion !== 1) findings.push({ rule: 'TC-S01', message: 'unsupported schemaVersion' });
  if (!Number.isInteger(ledger.cadenceDays) || ledger.cadenceDays < 150 || ledger.cadenceDays > 184) {
    findings.push({ rule: 'TC-S02', message: 'cadenceDays must represent a six-month window (150–184 days)' });
  }
  if (!Number.isInteger(ledger.scheduledWarningDays) || ledger.scheduledWarningDays < 1 || ledger.scheduledWarningDays > 45) {
    findings.push({ rule: 'TC-S03', message: 'scheduledWarningDays must be between 1 and 45' });
  }

  const requiredScopes = ledger.requiredScopes ?? [];
  if (requiredScopes.length === 0 || new Set(requiredScopes).size !== requiredScopes.length) {
    findings.push({ rule: 'TC-S04', message: 'requiredScopes must be non-empty and unique' });
  }

  const seenIds = new Set();
  let previousReview = Number.NEGATIVE_INFINITY;
  for (const review of ledger.reviews ?? []) {
    if (!review.id || seenIds.has(review.id)) findings.push({ rule: 'TC-R01', message: `missing or duplicate review id: ${review.id ?? '<missing>'}` });
    seenIds.add(review.id);
    if (!/^@[A-Za-z0-9-]+$/.test(review.reviewer ?? '')) findings.push({ rule: 'TC-R02', message: `${review.id}: invalid reviewer handle` });

    const reviewed = dateValue(review.reviewedOn);
    const next = dateValue(review.nextReviewBy);
    if (!Number.isFinite(reviewed) || !Number.isFinite(next) || next <= reviewed || next - reviewed > ledger.cadenceDays * DAY_MS) {
      findings.push({ rule: 'TC-R03', message: `${review.id}: invalid review window` });
    }
    if (Number.isFinite(reviewed) && reviewed < previousReview) findings.push({ rule: 'TC-R04', message: `${review.id}: reviews are not chronological` });
    previousReview = reviewed;

    const decisions = review.decisions ?? [];
    const scopes = decisions.map(decision => decision.scope);
    for (const scope of requiredScopes) {
      if (!scopes.includes(scope)) findings.push({ rule: 'TC-C01', message: `${review.id}: missing scope ${scope}` });
    }
    for (const scope of scopes) {
      if (!requiredScopes.includes(scope)) findings.push({ rule: 'TC-C02', message: `${review.id}: unknown scope ${scope}` });
    }
    if (new Set(scopes).size !== scopes.length) findings.push({ rule: 'TC-C03', message: `${review.id}: duplicate decision scope` });

    for (const decision of decisions) {
      if (!STATUS_VALUES.has(decision.status)) findings.push({ rule: 'TC-C04', message: `${review.id}/${decision.scope}: invalid status` });
      if (!decision.summary?.it?.trim() || !decision.summary?.en?.trim()) findings.push({ rule: 'TC-C05', message: `${review.id}/${decision.scope}: missing bilingual summary` });
      if (!Array.isArray(decision.sources) || decision.sources.length === 0) findings.push({ rule: 'TC-C06', message: `${review.id}/${decision.scope}: missing authoritative source` });
      for (const source of decision.sources ?? []) {
        try {
          const url = new URL(source);
          if (url.protocol !== 'https:' || !ALLOWED_SOURCE_HOSTS.has(url.hostname)) throw new Error('unapproved');
        } catch {
          findings.push({ rule: 'TC-C07', message: `${review.id}/${decision.scope}: unapproved source ${source}` });
        }
      }
      if (!Array.isArray(decision.evidence) || decision.evidence.length === 0) findings.push({ rule: 'TC-C08', message: `${review.id}/${decision.scope}: missing repository evidence` });
      for (const evidence of decision.evidence ?? []) {
        if (!knownFiles.has(evidence)) findings.push({ rule: 'TC-C09', message: `${review.id}/${decision.scope}: evidence does not exist: ${evidence}` });
      }
    }
  }

  const latest = ledger.reviews?.at(-1);
  if (!latest) {
    findings.push({ rule: 'TC-R05', message: 'at least one completed review is required' });
    return findings;
  }
  const todayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const reviewed = dateValue(latest.reviewedOn);
  const next = dateValue(latest.nextReviewBy);
  if (Number.isFinite(reviewed) && reviewed > todayStart) findings.push({ rule: 'TC-R06', message: `${latest.id}: review date is in the future` });
  if (Number.isFinite(next) && next < todayStart) findings.push({ rule: 'TC-R07', message: `${latest.id}: review expired on ${latest.nextReviewBy}` });
  if (scheduled && Number.isFinite(reviewed) && todayStart - reviewed > (ledger.cadenceDays - ledger.scheduledWarningDays) * DAY_MS) {
    findings.push({ rule: 'TC-R08', message: `${latest.id}: scheduled review window is open; add a new completed record` });
  }

  const versions = latest.versions ?? {};
  for (const [key, expected] of Object.entries(facts)) {
    if (versions[key] !== expected) findings.push({ rule: 'TC-V01', message: `${latest.id}: ${key} is '${versions[key] ?? '<missing>'}', expected '${expected}'` });
  }
  return findings;
}

export async function reviewRepository(root = ROOT, today = new Date(), scheduled = false) {
  const read = relative => readFile(path.join(root, relative), 'utf8');
  const [ledgerSource, portsSource, blueprintSource, referencesSource, protocolsSource] = await Promise.all([
    read(LEDGER_PATH),
    read('src/content/portRegistry.ts'),
    read('src/content/ccnaBlueprint.ts'),
    read('src/content/securityReferences.ts'),
    read('src/content/protocolRegistry.ts')
  ]);
  const ledger = JSON.parse(ledgerSource);
  const evidence = new Set((ledger.reviews ?? []).flatMap(review => (review.decisions ?? []).flatMap(decision => decision.evidence ?? [])));
  const knownFiles = new Set();
  for (const file of evidence) {
    try {
      await access(path.join(root, file));
      knownFiles.add(file);
    } catch {
      // validateLedger reports the exact missing path.
    }
  }
  const facts = {
    portRegistryVerifiedOn: extract(portsSource, /PORT_REGISTRY_VERIFIED_ON\s*=\s*['"]([^'"]+)/, 'port-registry date'),
    ccnaBlueprint: `${extract(blueprintSource, /exam:\s*['"]([^'"]+)/, 'CCNA exam')} v${extract(blueprintSource, /version:\s*['"]([^'"]+)/, 'CCNA version')}`,
    mitreAttack: extract(referencesSource, /MITRE_ATTACK_VERSION\s*=\s*['"]([^'"]+)/, 'ATT&CK version'),
    mitreAttackReleasedOn: extract(referencesSource, /MITRE_ATTACK_RELEASED_ON\s*=\s*['"]([^'"]+)/, 'ATT&CK release date'),
    cryptographyGuidance: 'NIST SP 800-131A Rev. 2'
  };
  const findings = validateLedger(ledger, facts, knownFiles, today, scheduled);
  const requiredStatements = [
    ['TC-P01', /TLS 1\.0\/1\.1/, 'TLS 1.0/1.1 legacy warning'],
    ['TC-P02', /TLS 1\.2 or TLS 1\.3/, 'modern TLS replacement'],
    ['TC-P03', /SSHv1/, 'SSHv1 legacy warning'],
    ['TC-P04', /SSHv2/, 'SSHv2 replacement'],
    ['TC-P05', /SNMPv1 and SNMPv2c/, 'SNMPv1/v2c legacy warning'],
    ['TC-P06', /SNMPv3/, 'SNMPv3 replacement']
  ];
  for (const [rule, pattern, label] of requiredStatements) {
    if (!pattern.test(protocolsSource)) findings.push({ rule, message: `protocol registry lacks ${label}` });
  }
  return { findings, latestReview: ledger.reviews.at(-1), scopes: ledger.requiredScopes.length, facts };
}

async function main() {
  const scheduled = process.argv.includes('--scheduled');
  const result = await reviewRepository(ROOT, new Date(), scheduled);
  if (result.findings.length) {
    console.error('Technical-content review failed:');
    for (const finding of result.findings) console.error(`- [${finding.rule}] ${finding.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Technical-content review passed: ${result.latestReview.id}, ${result.scopes} scopes, next review by ${result.latestReview.nextReviewBy}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
