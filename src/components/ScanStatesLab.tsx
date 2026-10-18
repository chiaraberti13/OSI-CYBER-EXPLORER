import { useMemo, useState } from 'react';
import { Radar, CheckCircle2, CircleSlash, ShieldX } from 'lucide-react';
import { casesForProtocol, SCAN_PROTOCOLS } from '../lib/scanStates';
import type { ScanProtocol, ScanState } from '../content/scanStates';
import { useStore } from '../store';

/**
 * LAB-01 — the port-state decoder (eJPT scanning).
 *
 * A scan infers a state from the response to a probe; it does not observe it directly.
 * Pick a protocol and compare the three conditions side by side: the probe sent, the
 * response seen, the state deduced (and whether the deduction is certain or ambiguous),
 * and what a defender observes. An explorer, not a quiz — no scores, no live targets,
 * only inert protocol labels and well-known port numbers describing the mechanism.
 */

const STATE_STYLE: Record<ScanState, { badge: string; icon: typeof CheckCircle2 }> = {
  open: { badge: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
  closed: { badge: 'border-slate-300 bg-slate-100 text-slate-700', icon: CircleSlash },
  filtered: { badge: 'border-amber-200 bg-amber-50 text-amber-800', icon: ShieldX }
};

const COPY = {
  it: {
    title: 'Decodificatore degli stati di porta',
    intro:
      'Una scansione non «vede» lo stato di una porta: lo deduce dalla risposta a una sonda. Scegli il protocollo e confronta i tre casi: cosa invia lo scanner, cosa torna, quale stato ne deduce (con certezza o nell’ambiguità) e cosa osserva un difensore.',
    protocol: 'Protocollo',
    probe: 'Sonda',
    response: 'Risposta',
    deduction: 'Deduzione',
    defender: 'Lato difesa',
    states: { open: 'Aperta', closed: 'Chiusa', filtered: 'Filtrata' } as Record<ScanState, string>,
    protocols: { tcp: 'TCP', udp: 'UDP' } as Record<ScanProtocol, string>,
    note: 'Solo a scopo didattico: etichette di protocollo inerti e porte note descrivono il meccanismo, non un attacco.'
  },
  en: {
    title: 'Port-state decoder',
    intro:
      'A scan does not «see» a port’s state: it deduces it from the response to a probe. Pick the protocol and compare the three cases: what the scanner sends, what comes back, which state it deduces (with certainty or in ambiguity), and what a defender observes.',
    protocol: 'Protocol',
    probe: 'Probe',
    response: 'Response',
    deduction: 'Deduction',
    defender: 'Defensive side',
    states: { open: 'Open', closed: 'Closed', filtered: 'Filtered' } as Record<ScanState, string>,
    protocols: { tcp: 'TCP', udp: 'UDP' } as Record<ScanProtocol, string>,
    note: 'Teaching only: inert protocol labels and well-known ports describe the mechanism, not an attack.'
  }
};

export default function ScanStatesLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];
  const [protocol, setProtocol] = useState<ScanProtocol>('tcp');
  const cases = useMemo(() => casesForProtocol(protocol), [protocol]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="scanstates-title">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
          <Radar aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 id="scanstates-title" className="text-lg font-semibold text-slate-900">
            {copy.title}
          </h1>
          <p className="mt-1 max-w-prose text-sm text-slate-600">{copy.intro}</p>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label={copy.protocol}>
        {SCAN_PROTOCOLS.map((option) => {
          const active = option === protocol;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setProtocol(option)}
              aria-pressed={active}
              className={`min-h-11 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                active
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {copy.protocols[option]}
            </button>
          );
        })}
      </div>

      <ul className="mt-5 grid gap-4 lg:grid-cols-3">
        {cases.map((scanCase) => {
          const style = STATE_STYLE[scanCase.condition];
          const StateIcon = style.icon;
          return (
            <li key={scanCase.id} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
              >
                <StateIcon aria-hidden="true" className="h-3.5 w-3.5" />
                {copy.states[scanCase.condition]}
              </span>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.probe}</dt>
                  <dd className="mt-0.5 text-slate-700">{scanCase.probe[language]}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.response}</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{scanCase.response[language]}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.deduction}</dt>
                  <dd className="mt-0.5 text-slate-700">{scanCase.deduction[language]}</dd>
                </div>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">{copy.defender}</dt>
                  <dd className="mt-0.5 text-slate-700">{scanCase.defenderNote[language]}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[11px] text-slate-500">{copy.note}</p>
    </section>
  );
}
