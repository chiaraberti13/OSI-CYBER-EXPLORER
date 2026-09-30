import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = 'docs/offensive-content-reviews.json';
const REQUIRED_SOURCE_FILES = [
  'src/content/attackScenarios.ts',
  'src/content/attackWalkthroughs.ts',
  'src/content/attackPaths.ts',
  'src/content/osiLayers.ts',
  'src/components/LayerDetails.tsx'
];
const REQUIRED_CHECKS = [
  'simulationOnly',
  'authorizationRequired',
  'defensiveContextRequired',
  'limitationsRequired',
  'documentationTargetsOnly',
  'inertCommandsAndPayloads'
];

const PROHIBITED_CONTENT = [
  ['OC-R01', /<script\b/i, 'executable script markup'],
  ['OC-R02', /\bor\s+['"]?1['"]?\s*=\s*['"]?1\b/i, 'SQL tautology payload'],
  ['OC-R03', /\b(?:admin|root):(?:123456|toor)\b/i, 'reusable credential pair'],
  ['OC-R04', /\bUSER\s+[^\s\[]+\s*\/\s*PASS\s+[^\s\[]+/i, 'clear-text credential pair'],
  ['OC-R05', /\b(?:x?\d{3,}|×flood)\s*\/s\b|\bports?\s+\d+\s*-\s*\d+/i, 'actionable rate or target range'],
  ['OC-R06', /\b(?:nmap|hydra|sqlmap|msfconsole|hping3)\b/i, 'offensive command']
];

function matches(source, pattern) {
  return [...source.matchAll(new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`))];
}

export function extractIds(source, pattern) {
  return matches(source, pattern).map(match => match[1]);
}

function isAllowedHost(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === 'localhost'
    || host.endsWith('.localhost')
    || host.endsWith('.example.test')
    || host === 'example.test'
    || host === 'example.com'
    || host === 'example.org'
    || host === 'example.net';
}

function isAllowedIpv4(address) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some(octet => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;
  const [a, b, c] = octets;
  return a === 10
    || a === 127
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 192 && b === 0 && c === 2)
    || (a === 198 && b === 51 && c === 100)
    || (a === 203 && b === 0 && c === 113)
    || address === '0.0.0.0'
    || address === '255.255.255.255';
}

function hostFindings(source, file) {
  const findings = [];
  const candidates = [
    ...matches(source, /https?:\/\/([a-z0-9.-]+)(?=[:/\s'"`]|$)/i).map(match => match[1]),
    ...matches(source, /\bdig\b[^\n;]*\s([a-z0-9-]+(?:\.[a-z0-9-]+)+)(?=[:\s'"`;]|$)/i).map(match => match[1]),
    ...matches(source, /\bopenssl\s+s_client\s+-connect\s+([a-z0-9.-]+)(?=[:\s'"`]|$)/i).map(match => match[1])
  ];

  for (const host of new Set(candidates)) {
    if (!isAllowedHost(host)) {
      findings.push({ rule: 'OC-T01', file, message: `live third-party target: ${host}` });
    }
  }
  for (const match of matches(source, /\b((?:\d{1,3}\.){3}\d{1,3})\b/)) {
    if (!isAllowedIpv4(match[1])) findings.push({ rule: 'OC-T02', file, message: `non-documentation IPv4 target: ${match[1]}` });
  }
  for (const match of matches(source, /\b((?:[a-z0-9-]+\.)+(?:com|net|org))\b/i)) {
    if (!isAllowedHost(match[1])) findings.push({ rule: 'OC-T03', file, message: `non-documentation domain: ${match[1]}` });
  }
  return findings;
}

export function validateRegistry(registry, inventory, today = new Date()) {
  const findings = [];
  if (registry.schemaVersion !== 1) findings.push({ rule: 'OC-S01', message: 'unsupported schemaVersion' });
  if (!Number.isInteger(registry.cadenceDays) || registry.cadenceDays < 1 || registry.cadenceDays > 180) {
    findings.push({ rule: 'OC-S02', message: 'cadenceDays must be between 1 and 180' });
  }
  for (const key of REQUIRED_CHECKS) {
    if (registry.checklist?.[key] !== true) findings.push({ rule: 'OC-C01', message: `checklist.${key} must be true` });
  }
  const registeredSources = new Set(registry.sourceFiles ?? []);
  for (const file of REQUIRED_SOURCE_FILES) {
    if (!registeredSources.has(file)) findings.push({ rule: 'OC-S03', message: `required source is not reviewed: ${file}` });
  }

  const expected = new Set([
    ...inventory.scenarios.map(id => `attack-scenario:${id}`),
    ...inventory.paths.map(id => `attack-path:${id}`)
  ]);
  const seen = new Set();
  for (const review of registry.reviews ?? []) {
    const key = `${review.kind}:${review.contentId}`;
    if (seen.has(key)) findings.push({ rule: 'OC-C02', message: `duplicate review: ${key}` });
    seen.add(key);
    if (!expected.has(key)) findings.push({ rule: 'OC-C03', message: `orphan review: ${key}` });
    if (review.status !== 'approved') findings.push({ rule: 'OC-C04', message: `review is not approved: ${key}` });

    const reviewed = new Date(`${review.reviewedOn}T00:00:00Z`);
    const next = new Date(`${review.nextReviewBy}T00:00:00Z`);
    const maximum = new Date(reviewed);
    maximum.setUTCDate(maximum.getUTCDate() + registry.cadenceDays);
    if (!Number.isFinite(reviewed.valueOf()) || !Number.isFinite(next.valueOf()) || next <= reviewed || next > maximum) {
      findings.push({ rule: 'OC-C05', message: `invalid review window: ${key}` });
    }
    const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    if (Number.isFinite(next.valueOf()) && next < todayStart) {
      findings.push({ rule: 'OC-C06', message: `review expired on ${review.nextReviewBy}: ${key}` });
    }
  }
  for (const key of expected) {
    if (!seen.has(key)) findings.push({ rule: 'OC-C07', message: `missing review: ${key}` });
  }
  return findings;
}

export function scanSources(sources) {
  const findings = [];
  for (const [file, source] of Object.entries(sources)) {
    findings.push(...hostFindings(source, file));
    for (const [rule, pattern, description] of PROHIBITED_CONTENT) {
      if (pattern.test(source)) findings.push({ rule, file, message: description });
    }
  }
  return findings;
}

export async function reviewRepository(root = ROOT, today = new Date()) {
  const read = relative => readFile(path.join(root, relative), 'utf8');
  const [registrySource, scenariosSource, walkthroughsSource, pathsSource] = await Promise.all([
    read(REGISTRY_PATH),
    read('src/content/attackScenarios.ts'),
    read('src/content/attackWalkthroughs.ts'),
    read('src/content/attackPaths.ts')
  ]);
  const registry = JSON.parse(registrySource);
  const inventory = {
    scenarios: extractIds(scenariosSource, /\bid:\s*['"]([^'"]+)['"]/),
    walkthroughs: extractIds(walkthroughsSource, /\bscenarioId:\s*['"]([^'"]+)['"]/),
    paths: extractIds(pathsSource, /\bp\(\s*['"]([^'"]+)['"]/),
  };
  const findings = validateRegistry(registry, inventory, today);
  const scenarioSet = new Set(inventory.scenarios);
  const walkthroughSet = new Set(inventory.walkthroughs);
  for (const id of scenarioSet) {
    if (!walkthroughSet.has(id)) findings.push({ rule: 'OC-I01', message: `scenario without walkthrough: ${id}` });
  }
  for (const id of walkthroughSet) {
    if (!scenarioSet.has(id)) findings.push({ rule: 'OC-I02', message: `walkthrough without scenario: ${id}` });
  }

  const sources = Object.fromEntries(await Promise.all(
    registry.sourceFiles.map(async file => [file, await read(file)])
  ));
  findings.push(...scanSources(sources));
  return { findings, inventory, reviewedFiles: registry.sourceFiles.length };
}

async function main() {
  const result = await reviewRepository();
  if (result.findings.length) {
    console.error('Offensive-content review failed:');
    for (const finding of result.findings) {
      console.error(`- [${finding.rule}] ${finding.file ? `${finding.file}: ` : ''}${finding.message}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(`Offensive-content review passed: ${result.inventory.scenarios.length} scenarios, ${result.inventory.paths.length} paths, ${result.reviewedFiles} source files.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
