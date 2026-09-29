import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PRODUCTION_HOSTNAME = 'osi-cyber-explorer.vercel.app';
const PREVIEW_HOSTNAME = /^osi-cyber-explorer(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?\.vercel\.app$/;
const MAX_REDIRECTS = 3;

const REQUIRED_HEADERS = [
  {
    id: 'header-content-security-policy',
    name: 'content-security-policy',
    severity: 'high',
    expected: 'an enforced Content-Security-Policy header',
    validate: (value) => Boolean(value),
  },
  {
    id: 'header-content-security-policy-report-only',
    name: 'content-security-policy-report-only',
    severity: 'medium',
    expected: "require-trusted-types-for 'script'",
    validate: (value) =>
      value.toLowerCase().split(/\s+/).includes('require-trusted-types-for') &&
      value.toLowerCase().includes("'script'"),
  },
  {
    id: 'header-content-type-options',
    name: 'x-content-type-options',
    severity: 'medium',
    expected: 'nosniff',
    validate: (value) => value.toLowerCase() === 'nosniff',
  },
  {
    id: 'header-referrer-policy',
    name: 'referrer-policy',
    severity: 'medium',
    expected: 'no-referrer, same-origin, strict-origin or strict-origin-when-cross-origin',
    validate: (value) =>
      ['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'].includes(
        value.toLowerCase(),
      ),
  },
  {
    id: 'header-permissions-policy',
    name: 'permissions-policy',
    severity: 'medium',
    expected: 'camera=(), geolocation=() and microphone=()',
    validate: (value) =>
      ['camera=()', 'geolocation=()', 'microphone=()'].every((control) =>
        value.toLowerCase().replaceAll(' ', '').includes(control),
      ),
  },
  {
    id: 'header-frame-options',
    name: 'x-frame-options',
    severity: 'medium',
    expected: 'DENY',
    validate: (value) => value.toUpperCase() === 'DENY',
  },
  {
    id: 'header-cross-origin-opener-policy',
    name: 'cross-origin-opener-policy',
    severity: 'medium',
    expected: 'same-origin',
    validate: (value) => value.toLowerCase() === 'same-origin',
  },
];

const REQUIRED_CSP = new Map([
  ['default-src', ["'self'"]],
  ['base-uri', ["'none'"]],
  ['object-src', ["'none'"]],
  ['frame-ancestors', ["'none'"]],
  ['script-src', ["'self'"]],
  ['connect-src', ["'self'"]],
  ['upgrade-insecure-requests', []],
]);

function finding({ id, severity, message, expected, actual = null }) {
  return { id, severity, message, expected, actual };
}

export function validateTargetUrl(value) {
  if (typeof value !== 'string' || value.trim() !== value || value.length > 2048) {
    throw new Error('Target URL must be a trimmed string of at most 2048 characters.');
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Target URL is not a valid absolute URL.');
  }

  if (url.protocol !== 'https:') {
    throw new Error('Target URL must use HTTPS.');
  }
  if (url.username || url.password || url.port) {
    throw new Error('Target URL must not contain credentials or a custom port.');
  }
  if (!PREVIEW_HOSTNAME.test(url.hostname)) {
    throw new Error('Target URL must be the official OSI Cyber Explorer Vercel deployment.');
  }

  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function parseCsp(value) {
  const directives = new Map();
  for (const rawDirective of value.split(';')) {
    const tokens = rawDirective.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const [name, ...sources] = tokens;
    const normalizedName = name.toLowerCase();
    if (!directives.has(normalizedName)) {
      directives.set(normalizedName, sources.map((source) => source.toLowerCase()));
    }
  }
  return directives;
}

export function evaluateSecurityHeaders({ targetUrl, responseUrl, status, headers }) {
  const normalizedTarget = validateTargetUrl(targetUrl);
  const normalizedResponse = validateTargetUrl(responseUrl);
  const normalizedHeaders = new Headers(headers);
  const findings = [];

  if (status < 200 || status >= 400) {
    findings.push(
      finding({
        id: 'http-status',
        severity: 'high',
        message: `Deployment returned HTTP ${status}.`,
        expected: 'a 2xx or 3xx response',
        actual: String(status),
      }),
    );
  }

  for (const requirement of REQUIRED_HEADERS) {
    const value = normalizedHeaders.get(requirement.name) ?? '';
    if (!requirement.validate(value)) {
      findings.push(
        finding({
          id: requirement.id,
          severity: requirement.severity,
          message: `${requirement.name} is missing or does not match the deployment policy.`,
          expected: requirement.expected,
          actual: value || null,
        }),
      );
    }
  }

  const cspValue = normalizedHeaders.get('content-security-policy') ?? '';
  const csp = parseCsp(cspValue);
  for (const [directive, requiredSources] of REQUIRED_CSP) {
    if (!csp.has(directive)) {
      findings.push(
        finding({
          id: `csp-${directive}`,
          severity: 'high',
          message: `CSP directive ${directive} is missing.`,
          expected: requiredSources.length ? requiredSources.join(' ') : 'directive present',
        }),
      );
      continue;
    }

    const actualSources = csp.get(directive);
    for (const source of requiredSources) {
      if (!actualSources.includes(source)) {
        findings.push(
          finding({
            id: `csp-${directive}-${source.replaceAll("'", '')}`,
            severity: 'high',
            message: `CSP directive ${directive} does not contain ${source}.`,
            expected: source,
            actual: actualSources.join(' '),
          }),
        );
      }
    }
  }

  const scriptSources = csp.get('script-src') ?? [];
  for (const unsafeSource of ["'unsafe-inline'", "'unsafe-eval'"]) {
    if (scriptSources.includes(unsafeSource)) {
      findings.push(
        finding({
          id: `csp-script-src-${unsafeSource.replaceAll("'", '')}`,
          severity: 'high',
          message: `CSP script-src contains ${unsafeSource}.`,
          expected: `${unsafeSource} absent`,
          actual: scriptSources.join(' '),
        }),
      );
    }
  }

  const target = new URL(normalizedTarget);
  if (target.hostname === PRODUCTION_HOSTNAME) {
    const hsts = normalizedHeaders.get('strict-transport-security') ?? '';
    const maxAge = /(?:^|;)\s*max-age=(\d+)/i.exec(hsts)?.[1];
    if (!maxAge || Number(maxAge) < 31_536_000) {
      findings.push(
        finding({
          id: 'header-strict-transport-security',
          severity: 'high',
          message: 'Production HSTS is missing or shorter than one year.',
          expected: 'max-age of at least 31536000 seconds',
          actual: hsts || null,
        }),
      );
    }
  }

  return {
    schemaVersion: 1,
    scanner: 'osi-cyber-explorer-deployment-security',
    target: normalizedTarget,
    responseUrl: normalizedResponse,
    environment: target.hostname === PRODUCTION_HOSTNAME ? 'production' : 'preview',
    status,
    passed: findings.length === 0,
    summary: {
      total: findings.length,
      high: findings.filter((item) => item.severity === 'high').length,
      medium: findings.filter((item) => item.severity === 'medium').length,
    },
    findings,
  };
}

export function createDeploymentFailureReport({ targetUrl, error }) {
  const normalizedTarget = validateTargetUrl(targetUrl);
  const target = new URL(normalizedTarget);
  const message = error instanceof Error ? error.message : 'Unknown deployment request failure.';

  return {
    schemaVersion: 1,
    scanner: 'osi-cyber-explorer-deployment-security',
    target: normalizedTarget,
    responseUrl: null,
    environment: target.hostname === PRODUCTION_HOSTNAME ? 'production' : 'preview',
    status: null,
    passed: false,
    summary: { total: 1, high: 1, medium: 0 },
    findings: [
      finding({
        id: 'deployment-request',
        severity: 'high',
        message: 'The deployment could not be inspected inside the approved origin boundary.',
        expected: 'a reachable allowlisted deployment without redirects to another origin',
        actual: message,
      }),
    ],
  };
}

export function formatMarkdownSummary(report) {
  const result = report.passed ? 'PASS' : 'FAIL';
  const lines = [
    '## Deployment security headers',
    '',
    `- Result: **${result}**`,
    `- Environment: \`${report.environment}\``,
    `- Target: \`${report.target}\``,
    `- Final response: \`${
      report.status === null ? 'not available' : `${report.status} ${report.responseUrl}`
    }\``,
    `- Findings: **${report.summary.total}** (${report.summary.high} high, ${report.summary.medium} medium)`,
  ];

  if (report.findings.length > 0) {
    lines.push('', '| Severity | Finding | Expected | Actual |', '|---|---|---|---|');
    for (const item of report.findings) {
      lines.push(
        `| ${item.severity} | ${item.id} | ${item.expected} | ${item.actual ?? 'missing'} |`,
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

async function fetchDeployment(targetUrl, fetchImpl = fetch) {
  let currentUrl = validateTargetUrl(targetUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetchImpl(currentUrl, {
      headers: { 'user-agent': 'osi-cyber-explorer-deployment-security/1.0' },
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000),
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;

    const location = response.headers.get('location');
    if (!location) throw new Error(`HTTP ${response.status} redirect is missing Location.`);
    if (redirectCount === MAX_REDIRECTS) throw new Error('Deployment exceeded redirect limit.');
    try {
      currentUrl = validateTargetUrl(new URL(location, currentUrl).toString());
    } catch {
      throw new Error('Deployment redirected outside the approved origin allowlist.');
    }
  }

  throw new Error('Deployment redirect handling failed.');
}

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function writeNewFile(path, content) {
  const absolutePath = resolve(path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, { flag: 'wx' });
}

async function main() {
  const command = process.argv[2];
  const targetUrl = readArgument('--url') ?? process.env.DEPLOYMENT_URL;
  if (!targetUrl) throw new Error('Provide the deployment URL with --url or DEPLOYMENT_URL.');

  const normalizedTarget = validateTargetUrl(targetUrl);
  if (command === 'validate-url') {
    process.stdout.write(`${normalizedTarget}\n`);
    return;
  }
  if (command !== 'check') {
    throw new Error('Use either the validate-url or check command.');
  }

  let report;
  try {
    const response = await fetchDeployment(normalizedTarget);
    report = evaluateSecurityHeaders({
      targetUrl: normalizedTarget,
      responseUrl: response.url || normalizedTarget,
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    report = createDeploymentFailureReport({ targetUrl: normalizedTarget, error });
  }
  report.checkedAt = new Date().toISOString();
  report.commit = process.env.GITHUB_SHA ?? null;
  report.runId = process.env.GITHUB_RUN_ID ?? null;

  const outputPath = readArgument('--output') ?? 'dynamic-security/security-headers.json';
  const summaryPath = readArgument('--summary') ?? 'dynamic-security/security-headers.md';
  const markdown = formatMarkdownSummary(report);
  await writeNewFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeNewFile(summaryPath, markdown);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(process.env.GITHUB_STEP_SUMMARY, markdown, { flag: 'a' });
  }
  if (!report.passed) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
