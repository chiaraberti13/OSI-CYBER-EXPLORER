import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAllowlist, validateRepository, validateSource } from './documentation-targets.mjs';

const BASE_ALLOWLIST = {
  schemaVersion: 1,
  reservedDomainSuffixes: ['example.com', 'example.org', 'example.net', 'example.test', 'test', 'localhost'],
  externalDomainExceptions: [],
  ipv4LiteralExceptions: []
};

test('all production sources use reserved or contextual targets', async () => {
  const result = await validateRepository();
  assert.deepEqual(result.findings, []);
  assert(result.files > 50);
  assert(result.ipv4Literals > 100);
  assert(result.ipv6Literals > 10);
});

test('public IPv4, IPv6 and domains fail closed', () => {
  const source = "const targets = ['8.8.8.8', '2606:4700:4700::1111', 'https://dns.google/query'];";
  const findings = validateSource(source, 'src/fixture.ts', BASE_ALLOWLIST);
  assert(findings.some(finding => finding.rule === 'NET-T01' && finding.value === '8.8.8.8'));
  assert(findings.some(finding => finding.rule === 'NET-T02' && finding.value === '2606:4700:4700::1111'));
  assert(findings.some(finding => finding.rule === 'NET-T03' && finding.value === 'dns.google'));
});

test('documentation, private and protocol addresses are accepted', () => {
  const source = "const targets = ['203.0.113.8', '198.51.100.14', '10.20.0.1', '224.0.0.5', '2001:db8::10', 'fe80::1', 'ff02::1', '64:ff9b::/96', 'https://lab.example.test'];";
  assert.deepEqual(validateSource(source, 'src/fixture.ts', BASE_ALLOWLIST), []);
});

test('an OSPF router ID exception is bound to its declared file', () => {
  const allowlist = {
    ...BASE_ALLOWLIST,
    ipv4LiteralExceptions: [{ address: '1.1.1.1', files: ['src/ospf.ts'], purpose: 'Router ID' }]
  };
  assert.deepEqual(validateSource("const id = '1.1.1.1';", 'src/ospf.ts', allowlist), []);
  assert(validateSource("const target = '1.1.1.1';", 'src/other.ts', allowlist).some(finding => finding.rule === 'NET-T01'));
});

test('external domains require a file-bound rationale', () => {
  const allowlist = {
    ...BASE_ALLOWLIST,
    externalDomainExceptions: [{ domain: 'docs.vendor.com', file: 'src/reference.ts', purpose: 'Official reference' }]
  };
  assert.deepEqual(validateSource("const url = 'https://docs.vendor.com';", 'src/reference.ts', allowlist), []);
  assert(validateSource("const url = 'https://docs.vendor.com';", 'src/lab.ts', allowlist).some(finding => finding.rule === 'NET-T03'));
});

test('malformed, duplicate and missing-file exceptions are rejected', () => {
  const allowlist = {
    ...BASE_ALLOWLIST,
    externalDomainExceptions: [
      { domain: 'docs.vendor.com', file: 'src/missing.ts', purpose: 'Reference' },
      { domain: 'docs.vendor.com', file: 'src/missing.ts', purpose: 'Reference' },
      { domain: '', file: '', purpose: '' }
    ]
  };
  const findings = validateAllowlist(allowlist, ['src/existing.ts']);
  assert(findings.some(finding => finding.rule === 'NET-S02'));
  assert(findings.some(finding => finding.rule === 'NET-S03'));
  assert(findings.some(finding => finding.rule === 'NET-S04'));
});
