import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  createDeploymentFailureReport,
  evaluateSecurityHeaders,
  formatMarkdownSummary,
  parseCsp,
  validateTargetUrl,
} from './deployment-security.mjs';

const secureHeaders = {
  'content-security-policy':
    "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; connect-src 'self'; upgrade-insecure-requests",
  'content-security-policy-report-only': "require-trusted-types-for 'script'",
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), geolocation=(), microphone=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

test('accepts only the production deployment and its Vercel previews', () => {
  assert.equal(
    validateTargetUrl('https://osi-cyber-explorer.vercel.app'),
    'https://osi-cyber-explorer.vercel.app/',
  );
  assert.equal(
    validateTargetUrl('https://osi-cyber-explorer-git-main-team.vercel.app/path?q=1#hash'),
    'https://osi-cyber-explorer-git-main-team.vercel.app/',
  );
});

test('rejects unsafe, unrelated and ambiguous targets', () => {
  for (const url of [
    'http://osi-cyber-explorer.vercel.app',
    'https://user:secret@osi-cyber-explorer.vercel.app',
    'https://osi-cyber-explorer.vercel.app:8443',
    'https://osi-cyber-explorer.vercel.app.evil.example',
    'https://other-project.vercel.app',
    ' https://osi-cyber-explorer.vercel.app',
    'not-a-url',
  ]) {
    assert.throws(() => validateTargetUrl(url), /Target URL/);
  }
});

test('parses CSP directives case-insensitively', () => {
  const csp = parseCsp(
    "DEFAULT-SRC 'SELF'; object-src 'none'; upgrade-insecure-requests; default-src *",
  );
  assert.deepEqual(csp.get('default-src'), ["'self'"]);
  assert.deepEqual(csp.get('upgrade-insecure-requests'), []);
});

test('passes the expected production security policy', () => {
  const report = evaluateSecurityHeaders({
    targetUrl: 'https://osi-cyber-explorer.vercel.app',
    responseUrl: 'https://osi-cyber-explorer.vercel.app/',
    status: 200,
    headers: secureHeaders,
  });

  assert.equal(report.passed, true);
  assert.deepEqual(report.summary, { total: 0, high: 0, medium: 0 });
  assert.equal(report.environment, 'production');
});

test('reports stable finding identifiers for missing or weakened controls', () => {
  const report = evaluateSecurityHeaders({
    targetUrl: 'https://osi-cyber-explorer-preview.vercel.app',
    responseUrl: 'https://osi-cyber-explorer-preview.vercel.app/',
    status: 503,
    headers: {
      ...secureHeaders,
      'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-eval'",
      'x-content-type-options': '',
    },
  });

  assert.equal(report.passed, false);
  assert.equal(report.environment, 'preview');
  assert.ok(report.findings.some(({ id }) => id === 'http-status'));
  assert.ok(report.findings.some(({ id }) => id === 'header-content-type-options'));
  assert.ok(report.findings.some(({ id }) => id === 'csp-base-uri'));
  assert.ok(report.findings.some(({ id }) => id === 'csp-script-src-unsafe-eval'));
  assert.ok(!report.findings.some(({ id }) => id === 'header-strict-transport-security'));
});

test('requires HSTS only on the canonical production hostname', () => {
  const production = evaluateSecurityHeaders({
    targetUrl: 'https://osi-cyber-explorer.vercel.app',
    responseUrl: 'https://osi-cyber-explorer.vercel.app/',
    status: 200,
    headers: { ...secureHeaders, 'strict-transport-security': 'max-age=300' },
  });
  const preview = evaluateSecurityHeaders({
    targetUrl: 'https://osi-cyber-explorer-preview.vercel.app',
    responseUrl: 'https://osi-cyber-explorer-preview.vercel.app/',
    status: 200,
    headers: { ...secureHeaders, 'strict-transport-security': '' },
  });

  assert.ok(production.findings.some(({ id }) => id === 'header-strict-transport-security'));
  assert.ok(!preview.findings.some(({ id }) => id === 'header-strict-transport-security'));
});

test('scopes application HSTS to the exact canonical host, without applying preload to previews', async () => {
  const configuration = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const hstsRules = configuration.headers.filter((rule) =>
    rule.headers.some((header) => header.key.toLowerCase() === 'strict-transport-security'));
  assert.equal(hstsRules.length, 1);
  assert.equal(hstsRules[0].source, '/(.*)');
  assert.deepEqual(hstsRules[0].has, [{ type: 'host', value: 'osi-cyber-explorer.vercel.app' }]);
  const hsts = hstsRules[0].headers.find((header) => header.key.toLowerCase() === 'strict-transport-security');
  assert.equal(hsts.value, secureHeaders['strict-transport-security']);
  // Vercel adds its own HSTS on preview/authentication responses. That platform
  // behavior is accepted; this assertion guards the policy controlled here.
});

test('produces a compact comparable Markdown summary', () => {
  const report = evaluateSecurityHeaders({
    targetUrl: 'https://osi-cyber-explorer.vercel.app',
    responseUrl: 'https://osi-cyber-explorer.vercel.app/',
    status: 200,
    headers: secureHeaders,
  });
  const markdown = formatMarkdownSummary(report);

  assert.match(markdown, /Result: \*\*PASS\*\*/);
  assert.match(markdown, /Findings: \*\*0\*\*/);
});

test('records request and redirect failures with a stable finding identifier', () => {
  const report = createDeploymentFailureReport({
    targetUrl: 'https://osi-cyber-explorer-preview.vercel.app',
    error: new Error('Deployment redirected outside the approved origin allowlist.'),
  });
  const markdown = formatMarkdownSummary(report);

  assert.equal(report.passed, false);
  assert.equal(report.findings[0].id, 'deployment-request');
  assert.match(markdown, /Final response: `not available`/);
});
