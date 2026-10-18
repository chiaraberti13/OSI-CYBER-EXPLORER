import { useState } from 'react';
import { ClipboardList, FileCheck2, LockKeyhole, ShieldAlert, Trash2 } from 'lucide-react';
import {
  AUDIT_COPY,
  cleanupAuditSession,
  collectAuditEvidence,
  createEmptyAuditSession,
  simulateAuditTransfer,
  type AuditCategory,
  type AuditPlatform,
  type AuditSession,
  type AuditTransferDirection
} from '../content/auditEvidenceLab';
import { useStore } from '../store';

const CATEGORY_ORDER: AuditCategory[] = ['network', 'system', 'accounts', 'sensitive-metadata'];

const REPORT_LABELS = {
  it: {
    title: 'Report di audit host/rete',
    platform: 'Piattaforma',
    scope: 'Scope',
    evidence: 'Evidenze',
    custody: 'Catena di custodia',
    none: 'Nessuna evidenza raccolta.'
  },
  en: {
    title: 'Host/network audit report',
    platform: 'Platform',
    scope: 'Scope',
    evidence: 'Evidence',
    custody: 'Chain of custody',
    none: 'No evidence collected.'
  }
} as const;

export default function HostAuditLab() {
  const language = useStore((state) => state.language);
  const copy = AUDIT_COPY[language];
  const [platform, setPlatform] = useState<AuditPlatform>('linux');
  const [categories, setCategories] = useState<AuditCategory[]>([
    'network',
    'system',
    'accounts',
    'sensitive-metadata'
  ]);
  const [authorized, setAuthorized] = useState(false);
  const [direction, setDirection] = useState<AuditTransferDirection>('host-to-analyst');
  const [session, setSession] = useState<AuditSession>(() => createEmptyAuditSession('linux'));
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setSession(cleanupAuditSession(session));
    setAuthorized(false);
    setMessage(copy.cleaned);
    setError(false);
  };

  const collect = async () => {
    setBusy(true);
    setError(false);
    try {
      const next = await collectAuditEvidence(platform, categories, authorized);
      if (!next) {
        setMessage(copy.notStarted);
        return;
      }
      setSession(next);
      setMessage('');
    } catch {
      setError(true);
      setMessage(copy.error);
    } finally {
      setBusy(false);
    }
  };

  const transfer = async () => {
    setBusy(true);
    setError(false);
    try {
      const next = await simulateAuditTransfer(session, direction, authorized);
      if (!next) {
        setMessage(direction === 'host-to-analyst' ? copy.noEvidence : copy.notStarted);
        return;
      }
      setSession(next);
      setMessage(copy.transferred);
    } catch {
      setError(true);
      setMessage(copy.error);
    } finally {
      setBusy(false);
    }
  };

  const report = buildReport(session, platform, language);

  return (
    <div className="space-y-5" aria-labelledby="host-audit-title">
      <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <ClipboardList aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="host-audit-title" className="mt-1 text-xl font-semibold text-slate-900">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{copy.intro}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label={copy.cleanup}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{copy.cleanup}</span>
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <h2 className="text-sm font-semibold text-indigo-950">{copy.scopeTitle}</h2>
            <p className="mt-1 text-sm leading-relaxed text-indigo-950">{copy.scope}</p>
            <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(event) => setAuthorized(event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
              />
              <span>{copy.inputLabel}</span>
            </label>
          </div>
          <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4" role="note">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-950">
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              {copy.sensitiveTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-amber-950">{copy.noSecrets}</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-950">{copy.integrity}</p>
          </aside>
        </div>
      </header>

      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2" aria-label={copy.collectHelp}>
        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="font-semibold text-slate-900">
            {language === 'it' ? 'Piattaforma e selezione minima' : 'Platform and minimal selection'}
          </h2>
          <label className="mt-3 block max-w-sm text-sm font-semibold text-slate-700">
            {language === 'it' ? 'Sistema fixture' : 'Fixture system'}
            <select
              aria-label={language === 'it' ? 'Sistema fixture' : 'Fixture system'}
              value={platform}
              onChange={(event) => {
                const next = event.target.value as AuditPlatform;
                setPlatform(next);
                setSession(createEmptyAuditSession(next));
                setMessage('');
              }}
              className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="linux">{copy.linux}</option>
              <option value="windows">{copy.windows}</option>
            </select>
          </label>
          <fieldset className="mt-4 space-y-2">
            <legend className="text-sm font-semibold text-slate-700">{copy.collectHelp}</legend>
            {CATEGORY_ORDER.map((category) => (
              <label
                key={category}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={categories.includes(category)}
                  onChange={(event) =>
                    setCategories((current) =>
                      event.target.checked ? [...current, category] : current.filter((item) => item !== category)
                    )
                  }
                  className="h-4 w-4 shrink-0 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
                />
                <span>{copy[category === 'sensitive-metadata' ? 'sensitive' : category]}</span>
              </label>
            ))}
          </fieldset>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!authorized || busy || categories.length === 0}
              onClick={() => void collect()}
              className="min-h-11 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {copy.collect}
            </button>
            <button
              type="button"
              disabled={!authorized || busy || (direction === 'host-to-analyst' && session.evidence.length === 0)}
              onClick={() => void transfer()}
              className="min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {copy.transfer}
            </button>
          </div>
          {message && (
            <p
              className={`mt-3 rounded-lg border p-3 text-sm ${error ? 'border-rose-300 bg-rose-50 text-rose-950' : 'border-emerald-300 bg-emerald-50 text-emerald-950'}`}
              role="status"
              aria-live="polite"
            >
              {error ? (
                <ShieldAlert aria-hidden="true" className="mr-2 inline h-4 w-4" />
              ) : (
                <FileCheck2 aria-hidden="true" className="mr-2 inline h-4 w-4" />
              )}
              {message}
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-slate-600">{copy.allowlist}</p>
          <label className="mt-4 block max-w-sm text-sm font-semibold text-slate-700">
            {copy.direction}
            <select
              aria-label={copy.direction}
              value={direction}
              onChange={(event) => setDirection(event.target.value as AuditTransferDirection)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="host-to-analyst">{copy.toAnalyst}</option>
              <option value="analyst-to-host">{copy.toHost}</option>
            </select>
          </label>
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            <strong>{language === 'it' ? 'Trasferimento:' : 'Transfer:'}</strong> {copy.noNetwork}
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="font-semibold text-slate-900">{copy.evidence}</h2>
          {session.evidence.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              {language === 'it' ? 'Nessun dato fixture raccolto.' : 'No fixture data collected.'}
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {session.evidence.map((item) => (
                <li key={item.id} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <FileCheck2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <div className="min-w-0">
                      <h3 className="break-all text-sm font-semibold text-slate-900">{item.sourcePath}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700">{item.summary[language]}</p>
                      <p className="mt-1 text-xs text-slate-700">
                        {copy.sensitivity}: {item.sensitivity} · {copy.source}: {item.id} · {copy.collected}:{' '}
                        {copy.timestamp}
                      </p>
                      {item.redacted && <p className="mt-1 text-xs font-semibold text-amber-900">{copy.yes}</p>}
                      <p className="mt-2 break-all font-mono text-[11px] text-slate-700">
                        {copy.digest}: {item.sha256}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {session.transfer && (
            <p
              className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-950"
              role="status"
            >
              <strong>{session.transfer.fileName}</strong> · {copy.verified}: {String(session.transfer.verified)} ·
              SHA-256 {session.transfer.sha256}
            </p>
          )}
        </article>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 md:p-5"
          aria-labelledby="audit-custody-heading"
        >
          <h2 id="audit-custody-heading" className="flex items-center gap-2 font-semibold text-slate-900">
            <FileCheck2 aria-hidden="true" className="h-4 w-4" /> {copy.custody}
          </h2>
          {session.custody.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              {language === 'it' ? 'Gli eventi appariranno dopo la raccolta.' : 'Events appear after collection.'}
            </p>
          ) : (
            <ol className="mt-3 min-w-0 space-y-2">
              {session.custody.map((event) => (
                <li
                  key={`${event.sequence}-${event.artifactId}`}
                  className="min-w-0 break-all rounded-lg border border-slate-200 p-3 text-xs leading-relaxed text-slate-700"
                >
                  <strong>
                    #{event.sequence} {event.action}
                  </strong>{' '}
                  · {copy.timestamp}: {event.timestamp} · {copy.actor}: {event.actor} · {copy.from}: {event.from} ·{' '}
                  {copy.to}: {event.to}
                  <p className="mt-1 break-all">
                    {event.artifactId} · {event.sha256}
                  </p>
                  <p className="mt-1 break-all">{event.result[language]}</p>
                </li>
              ))}
            </ol>
          )}
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="font-semibold text-slate-900">{copy.report}</h2>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
            {report}
          </pre>
        </article>
      </section>
    </div>
  );
}

function buildReport(session: AuditSession, platform: AuditPlatform, language: 'it' | 'en'): string {
  const labels = REPORT_LABELS[language];
  const copy = AUDIT_COPY[language];
  const evidence = session.evidence.length
    ? session.evidence
        .map((item) => `- ${item.sourcePath} | ${item.category} | ${item.sensitivity} | SHA-256 ${item.sha256}`)
        .join('\n')
    : labels.none;
  const custody = session.custody.length
    ? session.custody
        .map(
          (item) =>
            `- #${item.sequence} ${item.action}: ${item.from} → ${item.to} | ${item.artifactId} | ${item.sha256}`
        )
        .join('\n')
    : labels.none;
  return `${labels.title}\n${labels.platform}: ${copy[platform]}\n${labels.scope}: ${copy.scope}\n${labels.evidence}:\n${evidence}\n${labels.custody}:\n${custody}\n${copy.noSecrets}`;
}
