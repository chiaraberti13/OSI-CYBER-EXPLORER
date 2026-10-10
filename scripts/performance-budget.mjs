import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function evaluatePerformanceBudget(manifest, config, gzipBytesByFile) {
  const findings = [];
  const limits = config?.budgets ?? {};
  if (config?.schemaVersion !== 1) findings.push({ rule: 'PERF-C01', message: 'unsupported budget schema' });
  if (!positiveInteger(limits.initialJsGzipBytes)) findings.push({ rule: 'PERF-C02', message: 'initial JS budget must be a positive integer' });
  if (!positiveInteger(limits.routeChunkGzipBytes)) findings.push({ rule: 'PERF-C03', message: 'route chunk budget must be a positive integer' });

  const records = Object.values(manifest ?? {});
  const entries = records.filter(item => item.isEntry && item.file?.endsWith('.js'));
  const routes = records.filter(item => item.isDynamicEntry && item.file?.endsWith('.js'));
  if (entries.length !== 1) findings.push({ rule: 'PERF-M01', message: `expected one JavaScript entry, found ${entries.length}` });
  if (routes.length === 0) findings.push({ rule: 'PERF-M02', message: 'no lazy route chunks found' });

  const measure = (record, kind) => {
    const bytes = gzipBytesByFile[record.file];
    if (!positiveInteger(bytes)) {
      findings.push({ rule: 'PERF-M03', message: `missing gzip measurement for ${record.file}` });
      return { source: record.src ?? record.file, file: record.file, gzipBytes: 0 };
    }
    const limit = kind === 'entry' ? limits.initialJsGzipBytes : limits.routeChunkGzipBytes;
    if (positiveInteger(limit) && bytes > limit) {
      findings.push({
        rule: kind === 'entry' ? 'PERF-B01' : 'PERF-B02',
        message: `${record.src ?? record.file} is ${bytes} B gzip; budget is ${limit} B`,
      });
    }
    return { source: record.src ?? record.file, file: record.file, gzipBytes: bytes };
  };

  const entry = entries[0] ? measure(entries[0], 'entry') : undefined;
  const routeMeasurements = routes.map(route => measure(route, 'route')).sort((a, b) => b.gzipBytes - a.gzipBytes);
  return { findings, entry, routes: routeMeasurements };
}

export async function inspectBuild(root = ROOT) {
  const [manifestSource, configSource] = await Promise.all([
    readFile(path.join(root, 'dist/.vite/manifest.json'), 'utf8'),
    readFile(path.join(root, 'performance-budgets.json'), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestSource);
  const files = [...new Set(Object.values(manifest).filter(item => (item.isEntry || item.isDynamicEntry) && item.file?.endsWith('.js')).map(item => item.file))];
  const measurements = Object.fromEntries(await Promise.all(files.map(async file => {
    const content = await readFile(path.join(root, 'dist', file));
    return [file, gzipSync(content, { level: 9 }).byteLength];
  })));
  return evaluatePerformanceBudget(manifest, JSON.parse(configSource), measurements);
}

async function main() {
  const result = await inspectBuild();
  if (result.findings.length) {
    console.error('Performance budget failed:');
    for (const finding of result.findings) console.error(`- [${finding.rule}] ${finding.message}`);
    process.exitCode = 1;
    return;
  }
  const largest = result.routes[0];
  console.log(`Performance budget passed: initial ${result.entry.gzipBytes} B gzip; largest route ${largest.source} ${largest.gzipBytes} B gzip; ${result.routes.length} routes checked.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
