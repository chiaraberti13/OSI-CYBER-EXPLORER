import { useMemo, useState } from 'react';
import { Lock, TriangleAlert } from 'lucide-react';
import { simulatePortSecurity, type PortSecurityAction, type PortSecurityResult, type ViolationMode } from '../lib/portSecurity';
import { useStore } from '../store';

/**
 * Port Security, replayed one MAC at a time.
 *
 * Three commands, and three violation modes that look interchangeable on a slide and
 * are not: `protect` says nothing at all — not even a counter — so the host simply
 * does not work and the logs are empty; `restrict` drops, counts and reports while
 * keeping the port up; `shutdown`, which is the default nobody remembers, takes the
 * whole port down, legitimate host included, and waits for a human.
 */

const A = '0000.1111.aaaa';
const B = '0000.2222.bbbb';
const C = '0000.3333.cccc';

const SEQUENCES = [
  { id: 'single', macs: [A, A], label: { it: 'Un solo host', en: 'A single host' } },
  { id: 'hub', macs: [A, B], label: { it: 'Due host dietro uno hub', en: 'Two hosts behind a hub' } },
  { id: 'phone', macs: [A, B, A], label: { it: 'Telefono IP con PC in cascata', en: 'IP phone with a PC daisy-chained' } },
  { id: 'spoof', macs: [A, B, C, A], label: { it: 'MAC che cambiano in continuazione', en: 'MACs that keep changing' } }
] as const;

const ACTION_STYLES: Record<PortSecurityAction, string> = {
  learned: 'bg-emerald-100 text-emerald-800',
  allowed: 'bg-sky-100 text-sky-800',
  violation: 'bg-rose-100 text-rose-800',
  'port-down': 'bg-slate-200 text-slate-700'
};

const COPY = {
  it: {
    title: 'Port Security: le tre violation mode non sono equivalenti',
    intro: 'Tre comandi di configurazione, e una differenza che si vede solo al momento della violazione. Imposta il massimo di indirizzi e la modalità, poi guarda cosa accade quando si presenta un MAC in più.',
    maximum: 'Indirizzi massimi', mode: 'Violation mode', sticky: 'Apprendimento sticky',
    aging: 'Aging (minuti, 0 = disattivato)', agingType: 'Tipo di aging',
    absolute: 'absolute — scade comunque', inactivity: 'inactivity — scade solo se l’host tace',
    sequence: 'Indirizzi che si presentano sulla porta',
    actions: { learned: 'Appreso', allowed: 'Consentito', violation: 'Violazione', 'port-down': 'Porta giù' },
    portState: 'Stato della porta', up: 'up', errDisabled: 'err-disabled',
    violations: 'Contatore SecurityViolation', notified: 'syslog + trap SNMP', silent: 'nessuna notifica',
    secureMacs: 'Indirizzi sicuri', aged: 'Scaduti per aging',
    configuration: 'Configurazione risultante', recovery: 'Come far tornare su la porta',
    invalid: 'Parametri non validi: il massimo va da 1 a 132 e l’aging da 0 a 1440 minuti.',
    modes: 'Le tre modalità, in breve',
    modesBody: 'protect: scarta il traffico dell’indirizzo in eccesso e non dice niente — nessun log, nessuna trap, e il contatore di violazioni non avanza. È la modalità più difficile da diagnosticare, perché l’utente segnala che «non va» e non c’è traccia di nulla. restrict: scarta, incrementa il contatore e genera syslog e trap, lasciando la porta attiva. shutdown (PREDEFINITA): porta subito l’interfaccia in err-disable, fermando anche l’host legittimo, e richiede un intervento.',
    trap: 'Trappola d’esame',
    trapBody: 'Il massimo predefinito è 1 e la modalità predefinita è shutdown: abilitare switchport port-security senza altro significa «alla seconda scheda di rete che si presenta, spengo la porta». Su una porta con telefono IP e PC in cascata servono almeno 2 indirizzi (spesso 3). Ricorda anche che gli indirizzi sticky finiscono nella running configuration e non invecchiano: se sposti un PC su un’altra porta senza cancellarli, la porta nuova impara e quella vecchia resta con un indirizzo che non tornerà più.'
  },
  en: {
    title: 'Port Security: the three violation modes are not equivalent',
    intro: 'Three configuration commands, and a difference that only shows at the moment of the violation. Set the maximum number of addresses and the mode, then watch what happens when one address too many turns up.',
    maximum: 'Maximum addresses', mode: 'Violation mode', sticky: 'Sticky learning',
    aging: 'Aging (minutes, 0 = disabled)', agingType: 'Aging type',
    absolute: 'absolute — expires regardless', inactivity: 'inactivity — expires only if the host goes quiet',
    sequence: 'Addresses appearing on the port',
    actions: { learned: 'Learned', allowed: 'Allowed', violation: 'Violation', 'port-down': 'Port down' },
    portState: 'Port state', up: 'up', errDisabled: 'err-disabled',
    violations: 'SecurityViolation counter', notified: 'syslog + SNMP trap', silent: 'no notification',
    secureMacs: 'Secure addresses', aged: 'Aged out',
    configuration: 'Resulting configuration', recovery: 'How to bring the port back',
    invalid: 'Invalid parameters: the maximum runs from 1 to 132 and aging from 0 to 1440 minutes.',
    modes: 'The three modes, briefly',
    modesBody: 'protect: drops the excess address’s traffic and says nothing — no log, no trap, and the violation counter does not advance. It is the hardest mode to diagnose, because the user reports that "it does not work" and there is no trace of anything. restrict: drops, increments the counter and generates syslog and a trap, leaving the port up. shutdown (THE DEFAULT): err-disables the interface immediately, stopping the legitimate host too, and needs someone to intervene.',
    trap: 'Exam trap',
    trapBody: 'The default maximum is 1 and the default mode is shutdown: enabling switchport port-security and nothing else means "the second NIC that turns up, I kill the port". A port with an IP phone and a daisy-chained PC needs at least 2 addresses, often 3. Remember too that sticky addresses land in the running configuration and never age: move a PC to another port without clearing them and the new port learns while the old one keeps an address that will never come back.'
  }
} as const;

export default function PortSecurityLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [sequenceId, setSequenceId] = useState<string>(SEQUENCES[1].id);
  const [maximum, setMaximum] = useState(1);
  const [mode, setMode] = useState<ViolationMode>('shutdown');
  const [sticky, setSticky] = useState(false);
  const [agingMinutes, setAgingMinutes] = useState(0);
  const [agingType, setAgingType] = useState<'absolute' | 'inactivity'>('absolute');

  const sequence = SEQUENCES.find(item => item.id === sequenceId) ?? SEQUENCES[1];

  const result = useMemo<{ value: PortSecurityResult; error: false } | { value: null; error: true }>(() => {
    try {
      const frames = sequence.macs.map((mac, index) => ({ mac, at: index * 30 }));
      return { value: simulatePortSecurity(frames, { maximum, mode, sticky, agingMinutes, agingType }), error: false };
    } catch {
      return { value: null, error: true };
    }
  }, [sequence, maximum, mode, sticky, agingMinutes, agingType]);

  const analysis = result.value;
  const inputClass = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="port-security-title">
      <div className="flex items-center gap-3">
        <Lock className="h-5 w-5 text-indigo-600" />
        <h2 id="port-security-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.sequence}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {SEQUENCES.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSequenceId(item.id)}
              aria-pressed={item.id === sequenceId}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                item.id === sequenceId
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {item.label[language]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.maximum}
          <input type="number" min={1} max={132} value={maximum} onChange={(event) => setMaximum(Number(event.target.value))} className={inputClass} />
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.mode}
          <select value={mode} aria-label={copy.mode} onChange={(event) => setMode(event.target.value as ViolationMode)} className={inputClass}>
            <option value="protect">protect</option>
            <option value="restrict">restrict</option>
            <option value="shutdown">shutdown</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.aging}
          <input type="number" min={0} max={1440} value={agingMinutes} onChange={(event) => setAgingMinutes(Number(event.target.value))} className={inputClass} />
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.agingType}
          <select value={agingType} aria-label={copy.agingType} onChange={(event) => setAgingType(event.target.value as 'absolute' | 'inactivity')} className={inputClass}>
            <option value="absolute">{copy.absolute}</option>
            <option value="inactivity">{copy.inactivity}</option>
          </select>
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs text-slate-700">
        <input type="checkbox" checked={sticky} onChange={(event) => setSticky(event.target.checked)} />
        {copy.sticky}
      </label>

      {!analysis ? (
        <p className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> <span>{copy.invalid}</span>
        </p>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <ol className="space-y-2">
              {analysis.steps.map((step, index) => (
                <li key={`${step.mac}-${index}`} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">t={step.at}s</span>
                    <span className="font-mono text-xs text-slate-800">{step.mac}</span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_STYLES[step.action]}`}>
                      {copy.actions[step.action]}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.reason[language]}</p>
                  <p className="mt-1.5 font-mono text-[10px] text-slate-400">
                    {copy.secureMacs}: {step.secureMacs.length > 0 ? step.secureMacs.map(entry => `${entry.mac}${entry.kind === 'sticky' ? ' (sticky)' : ''}`).join(', ') : '—'}
                    {' · '}{copy.violations}: {step.violationCount}
                    {' · '}{step.notified ? copy.notified : copy.silent}
                    {step.agedOut.length > 0 ? ` · ${copy.aged}: ${step.agedOut.join(', ')}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="min-w-0 space-y-3">
            <div className={`rounded-lg border p-4 ${analysis.finalState === 'err-disabled' ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{copy.portState}</p>
              <p className={`mt-1 font-mono text-sm font-semibold ${analysis.finalState === 'err-disabled' ? 'text-rose-800' : 'text-emerald-800'}`}>
                {analysis.finalState === 'err-disabled' ? copy.errDisabled : copy.up}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{copy.violations}</p>
              <p className="font-mono text-sm text-slate-800">{analysis.violationCount}</p>
            </div>

            <div className="overflow-x-auto rounded-lg bg-slate-950 p-3">
              <p className="font-mono text-[10px] text-slate-500">{copy.configuration}</p>
              <pre className="mt-2 font-mono text-[11px] leading-relaxed text-emerald-300"><code>{analysis.configuration.join('\n')}</code></pre>
            </div>

            {analysis.recovery ? (
              <div className="overflow-x-auto rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-amber-700">{copy.recovery}</p>
                <pre className="mt-2 font-mono text-[11px] leading-relaxed text-amber-900"><code>{analysis.recovery.join('\n')}</code></pre>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.modes}</h3>
          <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.modesBody}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">{copy.trap}</h3>
          <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.trapBody}</p>
        </div>
      </div>
    </section>
  );
}
