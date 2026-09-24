import { useMemo, useState } from 'react';
import { Layers, Plus, RotateCcw, TriangleAlert } from 'lucide-react';
import { formatMac, simulateCam, type CamStep, type FrameAction, type FrameInput } from '../lib/camTable';
import { CAM_HOSTS, CAM_PORTS, CAM_SCENARIOS } from '../content/camScenarios';
import { useStore } from '../store';

/**
 * The CAM table, frame by frame.
 *
 * Learning, forwarding, flooding and aging are four words that are easy to recite and
 * easy to misapply. Here a sequence of frames is replayed, each decision is labelled
 * with the reason the switch took it, and the table is shown as `show mac
 * address-table` would print it after that exact frame — so the learner can also add
 * a frame of their own and watch what it changes.
 */

const ACTION_STYLES: Record<FrameAction, { badge: string; chip: string }> = {
  forward: { badge: 'bg-emerald-100 text-emerald-800', chip: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  flood: { badge: 'bg-amber-100 text-amber-800', chip: 'border-amber-300 bg-amber-50 text-amber-800' },
  filter: { badge: 'bg-rose-100 text-rose-800', chip: 'border-rose-300 bg-rose-50 text-rose-800' }
};

const COPY = {
  it: {
    title: 'CAM table: una trama per volta',
    intro: 'Uno switch prende una sola decisione per trama, e la prende sull’indirizzo MAC di destinazione: inoltrare su una porta, inondare la VLAN o scartare. Qui la sequenza viene rieseguita passo per passo, con la tabella come la stamperebbe lo switch dopo quella trama.',
    scenario: 'Scenario', lesson: 'Cosa mostra', ports: 'Porte dello switch',
    frames: 'Sequenza di trame', addFrame: 'Aggiungi trama', reset: 'Torna allo scenario',
    source: 'MAC sorgente', destination: 'MAC destinazione', ingress: 'Porta di ingresso', vlan: 'VLAN', time: 'Istante (s)',
    actions: { forward: 'Forwarding', flood: 'Flooding', filter: 'Filtering' },
    egress: 'Esce da', nowhere: 'Nessuna porta',
    learned: 'Appreso', moved: 'spostato da', aged: 'Scaduto per aging', noLearn: 'Nessun apprendimento (voce statica)',
    table: 'Tabella dopo questa trama', cliOutput: 'Come la stamperebbe lo switch',
    colVlan: 'Vlan', colMac: 'Mac Address', colType: 'Type', colPorts: 'Ports',
    empty: 'Tabella vuota',
    invalid: 'Trama non valida: controlla indirizzi MAC, porta e VLAN. Un MAC sorgente non può essere broadcast o multicast, e il tempo non può tornare indietro.',
    decisions: 'Le tre decisioni possibili',
    decisionsBody: 'Forwarding: la destinazione è nota su un’altra porta, la trama esce solo da lì. Flooding: la destinazione è broadcast, multicast o unknown unicast, la trama esce da tutte le altre porte della VLAN. Filtering: la destinazione è nota sulla stessa porta di ingresso, la trama viene scartata. L’apprendimento è un’operazione separata e usa sempre il MAC sorgente.',
    trap: 'Trappola d’esame',
    trapBody: 'Flooding e broadcast non sono sinonimi: un unknown unicast viene inondato ma il suo indirizzo di destinazione resta unicast, e smette di essere inondato appena lo switch impara dove sta quell’host. Un broadcast viene inondato per sempre. Seconda trappola: l’aging predefinito è 300 secondi di inattività, non di vita, e ogni trama del proprio host azzera il conteggio.',
    security: 'Perché conta per la sicurezza',
    securityBody: 'Il MAC flooding punta esattamente a questo meccanismo: riempire la tabella con indirizzi falsi finché le voci legittime non entrano più, così lo switch è costretto a inondare tutto e l’attaccante vede traffico che non gli era destinato. La contromisura è Port Security, che limita quanti MAC una porta può apprendere.'
  },
  en: {
    title: 'CAM table, one frame at a time',
    intro: 'A switch makes a single decision per frame, and it makes it on the destination MAC address: forward out one port, flood the VLAN, or discard. Here the sequence is replayed step by step, with the table as the switch itself would print it after that frame.',
    scenario: 'Scenario', lesson: 'What it shows', ports: 'Switch ports',
    frames: 'Frame sequence', addFrame: 'Add frame', reset: 'Back to the scenario',
    source: 'Source MAC', destination: 'Destination MAC', ingress: 'Ingress port', vlan: 'VLAN', time: 'Time (s)',
    actions: { forward: 'Forwarding', flood: 'Flooding', filter: 'Filtering' },
    egress: 'Leaves on', nowhere: 'No port',
    learned: 'Learned', moved: 'moved from', aged: 'Aged out', noLearn: 'Nothing learned (static entry)',
    table: 'Table after this frame', cliOutput: 'As the switch would print it',
    colVlan: 'Vlan', colMac: 'Mac Address', colType: 'Type', colPorts: 'Ports',
    empty: 'Empty table',
    invalid: 'Invalid frame: check the MAC addresses, the port, and the VLAN. A source MAC cannot be broadcast or multicast, and time cannot run backwards.',
    decisions: 'The three possible decisions',
    decisionsBody: 'Forwarding: the destination is known on another port, and the frame leaves only there. Flooding: the destination is broadcast, multicast, or an unknown unicast, and the frame leaves every other port in the VLAN. Filtering: the destination is known on the ingress port itself, and the frame is discarded. Learning is a separate operation and always uses the source MAC.',
    trap: 'Exam trap',
    trapBody: 'Flooding and broadcast are not synonyms: an unknown unicast is flooded but its destination address stays unicast, and it stops being flooded as soon as the switch learns where that host is. A broadcast is flooded forever. Second trap: the default aging is 300 seconds of inactivity, not of life, and every frame from the host resets the count.',
    security: 'Why it matters for security',
    securityBody: 'MAC flooding targets exactly this mechanism: fill the table with forged addresses until legitimate entries no longer fit, so the switch is forced to flood everything and the attacker sees traffic that was never meant for them. The countermeasure is Port Security, which limits how many MACs a port may learn.'
  }
} as const;

export default function CamTableLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [scenarioId, setScenarioId] = useState(CAM_SCENARIOS[0].id);
  const [extraFrames, setExtraFrames] = useState<FrameInput[]>([]);
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState({ srcMac: CAM_HOSTS[0].mac, dstMac: CAM_HOSTS[1].mac, ingressPort: 'Gi1/0/1', vlan: 10 });

  const scenario = CAM_SCENARIOS.find(item => item.id === scenarioId) ?? CAM_SCENARIOS[0];

  const result = useMemo<{ steps: CamStep[]; error: false } | { steps: null; error: true }>(() => {
    try {
      const lastAt = scenario.frames.reduce((max, item) => Math.max(max, item.at ?? 0), 0);
      const frames = [
        ...scenario.frames,
        ...extraFrames.map((item, index) => ({ ...item, at: lastAt + index + 1 }))
      ];
      return {
        steps: simulateCam(CAM_PORTS, frames, {
          agingSeconds: scenario.agingSeconds,
          initialEntries: scenario.initialEntries
        }),
        error: false
      };
    } catch {
      return { steps: null, error: true };
    }
  }, [scenario, extraFrames]);

  const steps = result.steps ?? [];
  const step = steps[Math.min(selected, Math.max(0, steps.length - 1))];

  const chooseScenario = (id: string) => {
    setScenarioId(id);
    setExtraFrames([]);
    setSelected(0);
  };

  const addFrame = () => {
    setExtraFrames(current => [...current, { ...draft }]);
    setSelected(steps.length);
  };

  const selectClass = 'block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
  const portName = (id: string) => CAM_PORTS.find(port => port.id === id)?.name ?? id;
  const hostOn = (portId: string) => CAM_HOSTS.find(host => host.port === portId);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="cam-title">
      <div className="flex items-center gap-3">
        <Layers className="h-5 w-5 text-indigo-600" />
        <h2 id="cam-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.scenario}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {CAM_SCENARIOS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseScenario(item.id)}
              aria-pressed={item.id === scenarioId}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                item.id === scenarioId
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {item.title[language]}
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">
          <span className="font-semibold uppercase tracking-wide">{copy.lesson}: </span>
          {scenario.lesson[language]}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.ports}</h3>
        <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CAM_PORTS.map(port => {
            const isIngress = step?.frame.ingressPort === port.id;
            const isEgress = step?.egressPorts.includes(port.id) ?? false;
            const host = hostOn(port.id);
            return (
              <div
                key={port.id}
                className={`rounded-lg border p-3 transition ${
                  isIngress ? 'border-indigo-400 bg-indigo-50'
                    : isEgress ? `${ACTION_STYLES[step.action].chip}`
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-900">{port.name}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                    {port.mode === 'trunk' ? `trunk ${(port.trunkVlans ?? []).join(',')}` : `VLAN ${port.vlan}`}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-500">{host ? `${host.name} · ${host.mac}` : port.mode === 'trunk' ? `native ${port.vlan}` : '—'}</p>
                {isIngress ? <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">in</p> : null}
                {isEgress ? <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide">out</p> : null}
              </div>
            );
          })}
        </div>
      </div>

      {result.error ? (
        <p className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> <span>{copy.invalid}</span>
        </p>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.frames}</h3>
            <ol className="mt-2 space-y-2">
              {steps.map((item, index) => (
                <li key={`${item.frame.srcMac}-${item.frame.dstMac}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-pressed={index === selected}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      index === selected ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">t={item.frame.at}s</span>
                      <span className="font-mono text-xs text-slate-700">
                        {formatMac(item.frame.srcMac)} → {formatMac(item.frame.dstMac)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">{portName(item.frame.ingressPort)} · VLAN {item.frame.vlan}</span>
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_STYLES[item.action].badge}`}>
                        {copy.actions[item.action]}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] text-slate-500">
                      {copy.egress}: {item.egressPorts.length > 0 ? item.egressPorts.map(portName).join(', ') : copy.nowhere}
                    </p>
                    {index === selected ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.reason[language]}</p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ol>

            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.addFrame}</h4>
                {extraFrames.length > 0 ? (
                  <button type="button" onClick={() => { setExtraFrames([]); setSelected(0); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                    <RotateCcw className="h-3 w-3" /> {copy.reset}
                  </button>
                ) : null}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
                  {copy.source}
                  <select value={draft.srcMac} onChange={(event) => setDraft({ ...draft, srcMac: event.target.value })} className={selectClass}>
                    {CAM_HOSTS.filter(host => host.vlan !== 0).map(host => <option key={host.mac} value={host.mac}>{host.name} · {host.mac}</option>)}
                  </select>
                </label>
                <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
                  {copy.destination}
                  <select value={draft.dstMac} onChange={(event) => setDraft({ ...draft, dstMac: event.target.value })} className={selectClass}>
                    {CAM_HOSTS.map(host => <option key={host.mac} value={host.mac}>{host.name} · {host.mac}</option>)}
                  </select>
                </label>
                <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
                  {copy.ingress}
                  <select value={draft.ingressPort} onChange={(event) => setDraft({ ...draft, ingressPort: event.target.value })} className={selectClass}>
                    {CAM_PORTS.map(port => <option key={port.id} value={port.id}>{port.name}</option>)}
                  </select>
                </label>
                <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
                  {copy.vlan}
                  <select value={draft.vlan} onChange={(event) => setDraft({ ...draft, vlan: Number(event.target.value) })} className={selectClass}>
                    {[10, 20].map(vlan => <option key={vlan} value={vlan}>VLAN {vlan}</option>)}
                  </select>
                </label>
              </div>
              <button type="button" onClick={addFrame} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">
                <Plus className="h-3.5 w-3.5" /> {copy.addFrame}
              </button>
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.table}</h3>
              {step && step.learned ? (
                <p className="mt-2 text-[11px] text-emerald-700">
                  {copy.learned}: <span className="font-mono">{step.learned.mac}</span> → {portName(step.learned.port)}
                  {step.learned.moved ? ` (${copy.moved} ${portName(step.learned.movedFrom ?? '')})` : ''}
                </p>
              ) : step ? (
                <p className="mt-2 text-[11px] text-slate-500">{copy.noLearn}</p>
              ) : null}
              {step && step.agedOut.length > 0 ? (
                <p className="mt-1 text-[11px] text-amber-700">{copy.aged}: <span className="font-mono">{step.agedOut.join(', ')}</span></p>
              ) : null}

              <div className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3">
                <p className="font-mono text-[10px] text-slate-500">{copy.cliOutput}</p>
                <pre className="mt-2 font-mono text-[11px] leading-relaxed text-emerald-300"><code>{[
                  'Switch# show mac address-table',
                  '          Mac Address Table',
                  '-------------------------------------------',
                  '',
                  'Vlan    Mac Address       Type        Ports',
                  '----    -----------       --------    -----',
                  ...(step?.table.length
                    ? step.table.map(entry => `${String(entry.vlan).padEnd(8)}${formatMac(entry.mac).padEnd(18)}${entry.kind.toUpperCase().padEnd(12)}${portName(entry.port)}`)
                    : ['                     (empty)']),
                  '',
                  `Total Mac Addresses for this criterion: ${step?.table.length ?? 0}`
                ].join('\n')}</code></pre>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.decisions}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">{copy.decisionsBody}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">{copy.trap}</h3>
          <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.trapBody}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-700">{copy.security}</h3>
          <p className="mt-2 text-xs leading-relaxed text-rose-900">{copy.securityBody}</p>
        </div>
      </div>
    </section>
  );
}
