import { readFile, readdir } from 'node:fs/promises';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWLIST_PATH = 'docs/documentation-target-allowlist.json';
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const DOMAIN_PATTERN = /\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|dev|app|co|it|edu|gov|google)\b/gi;
const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const ADDRESS_TOKEN_PATTERN = /(?<![a-z0-9])[0-9a-f:.]{2,}(?:\/\d{1,3})?(?![a-z0-9])/gi;
const QUOTED_STRING_PATTERN = /'(?:\\.|[^'\\\r\n])*'|"(?:\\.|[^"\\\r\n])*"/g;
const TEMPLATE_STRING_PATTERN = /`(?:\\.|[^`\\])*`/gs;

async function productionSources(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await productionSources(absolute, root));
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name)) && !/\.(?:test|spec)\.[^.]+$/.test(entry.name)) {
      files.push(path.relative(path.dirname(root), absolute).replaceAll(path.sep, '/'));
    }
  }
  return files.sort();
}

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length;
}

function stringLiterals(source) {
  const literals = [];
  for (const match of source.matchAll(QUOTED_STRING_PATTERN)) {
    literals.push({ value: match[0].slice(1, -1), index: match.index + 1 });
  }
  for (const match of source.matchAll(TEMPLATE_STRING_PATTERN)) {
    const value = match[0].slice(1, -1).replace(/\$\{[\s\S]*?\}/g, expression => ' '.repeat(expression.length));
    literals.push({ value, index: match.index + 1 });
  }
  return literals;
}

function isAllowedIpv4(address) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some(value => !Number.isInteger(value) || value < 0 || value > 255)) return false;
  const [a, b, c] = octets;
  return a === 0
    || a === 10
    || a === 127
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 192 && b === 0 && c === 2)
    || (a === 198 && b === 51 && c === 100)
    || (a === 203 && b === 0 && c === 113)
    || a >= 224;
}

function isAllowedIpv6(candidate) {
  const [address, prefix] = candidate.toLowerCase().split('/');
  if (isIP(address) !== 6) return true;
  if (address === '::' || address === '::1') return true;
  if (/^fe[89ab]/.test(address) || /^f[cd]/.test(address) || /^ff/.test(address)) return true;
  if (address === '2001:db8' || address.startsWith('2001:db8:')) return true;
  if (address === '64:ff9b::' && prefix === '96') return true;
  if (address.startsWith('64:ff9b::')) return true;
  if (address.startsWith('::ffff:')) return true;
  return address === '2000::' && prefix === '3';
}

function isReservedDomain(domain, suffixes) {
  const normalized = domain.toLowerCase().replace(/\.$/, '');
  return suffixes.some(suffix => normalized === suffix || normalized.endsWith(`.${suffix}`));
}

function exceptionKey(value, file) {
  return `${value.toLowerCase()}|${file}`;
}

export function validateAllowlist(allowlist, knownFiles = []) {
  const findings = [];
  if (allowlist.schemaVersion !== 1) findings.push({ rule: 'NET-S01', message: 'unsupported allowlist schemaVersion' });
  const known = new Set(knownFiles);
  const seenDomains = new Set();
  for (const item of allowlist.externalDomainExceptions ?? []) {
    const key = exceptionKey(item.domain ?? '', item.file ?? '');
    if (!item.domain || !item.file || !item.purpose) findings.push({ rule: 'NET-S02', message: `incomplete domain exception: ${key}` });
    if (seenDomains.has(key)) findings.push({ rule: 'NET-S03', message: `duplicate domain exception: ${key}` });
    if (known.size && !known.has(item.file)) findings.push({ rule: 'NET-S04', message: `domain exception file does not exist: ${item.file}` });
    seenDomains.add(key);
  }
  const seenIpv4 = new Set();
  for (const item of allowlist.ipv4LiteralExceptions ?? []) {
    if (!item.address || !item.purpose || !Array.isArray(item.files) || item.files.length === 0) {
      findings.push({ rule: 'NET-S05', message: `incomplete IPv4 exception: ${item.address ?? '<missing>'}` });
      continue;
    }
    for (const file of item.files) {
      const key = exceptionKey(item.address, file);
      if (seenIpv4.has(key)) findings.push({ rule: 'NET-S06', message: `duplicate IPv4 exception: ${key}` });
      if (known.size && !known.has(file)) findings.push({ rule: 'NET-S07', message: `IPv4 exception file does not exist: ${file}` });
      seenIpv4.add(key);
    }
  }
  return findings;
}

export function validateSource(source, file, allowlist) {
  const findings = [];
  const ipv4Exceptions = new Set((allowlist.ipv4LiteralExceptions ?? []).flatMap(item =>
    (item.files ?? []).map(exceptionFile => exceptionKey(item.address, exceptionFile))
  ));
  const domainExceptions = new Set((allowlist.externalDomainExceptions ?? []).map(item => exceptionKey(item.domain, item.file)));

  for (const match of source.matchAll(IPV4_PATTERN)) {
    const address = match[0];
    if (!isAllowedIpv4(address) && !ipv4Exceptions.has(exceptionKey(address, file))) {
      findings.push({ rule: 'NET-T01', file, line: lineAt(source, match.index), value: address, message: 'public IPv4 literal' });
    }
  }

  for (const match of source.matchAll(ADDRESS_TOKEN_PATTERN)) {
    const candidate = match[0];
    if (candidate.includes(':') && isIP(candidate.split('/')[0]) === 6 && !isAllowedIpv6(candidate)) {
      findings.push({ rule: 'NET-T02', file, line: lineAt(source, match.index), value: candidate, message: 'public IPv6 literal' });
    }
  }

  for (const literal of stringLiterals(source)) {
    const value = literal.value;
    for (const match of value.matchAll(DOMAIN_PATTERN)) {
      const domain = match[0].toLowerCase();
      if (!isReservedDomain(domain, allowlist.reservedDomainSuffixes ?? [])
        && !domainExceptions.has(exceptionKey(domain, file))) {
        const index = literal.index + match.index;
        findings.push({ rule: 'NET-T03', file, line: lineAt(source, index), value: domain, message: 'non-reserved public domain' });
      }
    }
  }
  return findings;
}

export async function validateRepository(root = ROOT) {
  const allowlist = JSON.parse(await readFile(path.join(root, ALLOWLIST_PATH), 'utf8'));
  const files = await productionSources(path.join(root, 'src'));
  const findings = validateAllowlist(allowlist, files);
  let ipv4Literals = 0;
  let ipv6Literals = 0;
  let domainLiterals = 0;
  for (const file of files) {
    const source = await readFile(path.join(root, file), 'utf8');
    ipv4Literals += [...source.matchAll(IPV4_PATTERN)].length;
    ipv6Literals += [...source.matchAll(ADDRESS_TOKEN_PATTERN)]
      .filter(match => match[0].includes(':') && isIP(match[0].split('/')[0]) === 6).length;
    for (const literal of stringLiterals(source)) domainLiterals += [...literal.value.matchAll(DOMAIN_PATTERN)].length;
    findings.push(...validateSource(source, file, allowlist));
  }
  return { findings, files: files.length, ipv4Literals, ipv6Literals, domainLiterals };
}

async function main() {
  const result = await validateRepository();
  if (result.findings.length) {
    console.error('Documentation-target validation failed:');
    for (const finding of result.findings) {
      const location = finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ''}: ` : '';
      console.error(`- [${finding.rule}] ${location}${finding.message}${finding.value ? ` (${finding.value})` : ''}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(`Documentation-target validation passed: ${result.files} files, ${result.ipv4Literals} IPv4, ${result.ipv6Literals} IPv6, ${result.domainLiterals} domain literals.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
