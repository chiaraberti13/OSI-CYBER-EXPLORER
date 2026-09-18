import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BookOpenCheck, Link2, Terminal } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_EVIDENCE_CASES, type EvidenceSeverity } from '../content/securityEvidence';
import { useStore } from '../store';

const DOMAIN_BY_ID = new Map(CCNA_DOMAINS.map(domain => [domain.id, domain]));
const LINE_STYLES: Record<EvidenceSeverity, string> = {
  context: 'border-sky-500/40 bg-sky-500/10',
  warning: 'border-amber-400/50 bg-amber-400/10',
  critical: 'border-rose-500/60 bg-rose-500/15'
};
const BADGE_STYLES: Record<EvidenceSeverity, string> = {
  context: 'bg-sky-100 text-sky-800',
  warning: 'bg-amber-100 text-amber-900',
  critical: 'bg-rose-100 text-rose-900'
};

export default function SecurityEvidenceLab() {
  const language = useStore(state => state.language);
  const [selectedId, setSelectedId] = useState(SECURITY_EVIDENCE_CASES[0].id);
  const selected = useMemo(() => SECURITY_EVIDENCE_CASES.find(item => item.id === selectedId) ?? SECURITY_EVIDENCE_CASES[0], [selectedId]);
  const annotationsByLine = useMemo(() => new Map(selected.annotations.map(item => [item.line, item])), [selected]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-sky-50 p-3 text-sky-700"><Terminal className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <p className="eyebrow">OBSERVE · CORRELATE · VERIFY</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio delle evidenze operative' : 'Operational Evidence Lab'}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">
              {language === 'it'
                ? 'Esplora output IOS, log e audit realistici senza trasformarli in un quiz. Le annotazioni distinguono il dato osservato dalla sua interpretazione e ricordano quali fonti servono per confermare l’ipotesi.'
                : 'Explore realistic IOS output, logs, and audits without turning them into a quiz. Annotations separate observed data from interpretation and identify the sources required to confirm a hypothesis.'}
            </p>
          </div>
        </div>
      </header>

      <section aria-label={language === 'it' ? 'Casi di evidenza' : 'Evidence cases'} className="flex flex-wrap gap-2">
        {SECURITY_EVIDENCE_CASES.map(item => {
          const active = item.id === selected.id;
          return (
            <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} aria-pressed={active} className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${active ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
              {item.title[language]}
            </button>
          );
        })}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="evidence-case-title">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">{selected.source} · {selected.plane} plane</p>
            <h2 id="evidence-case-title" className="mt-1 text-xl font-semibold text-slate-900">{selected.title[language]}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{selected.context[language]}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.domains.map(id => <span key={id} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{DOMAIN_BY_ID.get(id)?.number}. {DOMAIN_BY_ID.get(id)?.title[language]}</span>)}
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <div className="overflow-hidden rounded-xl bg-slate-950 text-slate-200 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="font-mono text-xs text-emerald-300">{selected.command}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{selected.source}</span>
            </div>
            <ol className="overflow-x-auto p-3 font-mono text-xs leading-6">
              {selected.output.map((line, index) => {
                const lineNumber = index + 1;
                const annotation = annotationsByLine.get(lineNumber);
                return (
                  <li key={`${lineNumber}-${line}`} className={`grid min-w-max grid-cols-[2rem_1fr] border-l-2 px-2 ${annotation ? LINE_STYLES[annotation.severity] : 'border-transparent'}`}>
                    <span className="select-none text-right text-slate-600">{lineNumber}</span>
                    <code className="pl-3">{line}</code>
                  </li>
                );
              })}
            </ol>
          </div>

          <aside aria-label={language === 'it' ? 'Annotazioni' : 'Annotations'} className="space-y-3">
            {selected.annotations.map(annotation => (
              <article key={annotation.line} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-semibold text-slate-900">L{annotation.line} · {annotation.label[language]}</h3><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${BADGE_STYLES[annotation.severity]}`}>{annotation.severity}</span></div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{annotation.meaning[language]}</p>
              </article>
            ))}
          </aside>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-indigo-950"><Link2 className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Fonti da correlare' : 'Sources to correlate'}</h3>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-indigo-900">{selected.correlate.map(item => <li key={item.en}>• {item[language]}</li>)}</ul>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-orange-950"><AlertTriangle className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Limite dell’evidenza' : 'Evidence limitation'}</h3>
            <p className="mt-2 text-xs leading-relaxed text-orange-900">{selected.limitation[language]}</p>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
        <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <p>{language === 'it' ? 'Metodo: osserva il dato grezzo, formula più ipotesi, cerca una fonte indipendente e verifica dopo ogni modifica. Un singolo comando raramente basta per attribuire causa o intenzionalità.' : 'Method: observe raw data, form multiple hypotheses, seek an independent source, and verify after every change. A single command is rarely enough to attribute cause or intent.'}</p>
        <Activity className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
      </div>
    </div>
  );
}
