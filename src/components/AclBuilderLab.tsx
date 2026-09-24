import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ListOrdered, TriangleAlert, Wand2 } from 'lucide-react';
import { buildAcl, portToken, type AceStatus, type BuiltAcl } from '../lib/aclBuilder';
import { evaluateIpv4Acl, type PacketDescriptor } from '../lib/securityFundamentals';
import { ACL_INTENTS, ACL_PRESETS } from '../content/aclIntents';
import { useStore } from '../store';

/**
 * An ACL written from the requirement, not read from the configuration.
 *
 * The evaluator elsewhere in this lab answers "what happens to this packet". A
 * requirement arrives in the other direction — "block Telnet from the guests, allow
 * HTTPS to the servers" — and the difficulty is never writing the lines. It is that
 * first match wins, so a general line placed above a specific one makes the specific
 * one unreachable: it will never match a packet and its counter stays at zero.
 *
 * Here the order is the thing the learner moves, and the consequence is immediate.
 */

const STATUS_STYLES: Record<AceStatus, { badge: string; row: string }> = {
  active: { badge: 'bg-emerald-100 text-emerald-800', row: 'border-slate-200' },
  shadowed: { badge: 'bg-rose-100 text-rose-800', row: 'border-rose-300 bg-rose-50/60' },
  redundant: { badge: 'bg-amber-100 text-amber-800', row: 'border-amber-300 bg-amber-50/60' }
};

const COPY = {
  it: {
    title: 'Costruttore di ACL dai requisiti',
    intro: 'Un requisito non arriva mai come una riga di configurazione: arriva come «blocca Telnet dagli utenti, consenti HTTPS verso i server». Scrivere le righe è la parte facile. La parte che costa è l’ordine, perché la valutazione è first match e una riga generica messa sopra una specifica la rende irraggiungibile.',
    preset: 'Punto di partenza', lesson: 'Cosa mostra',
    requirements: 'Requisiti nell’ordine in cui verranno scritti',
    moveUp: 'Sposta su', moveDown: 'Sposta giù', remove: 'Escludi dalla ACL', add: 'Requisiti disponibili',
    statuses: { active: 'Attiva', shadowed: 'Riga morta', redundant: 'Ridondante' },
    acl: 'ACL generata', applySuggestion: 'Applica l’ordine che le salva tutte',
    deadWarning: 'Almeno una riga non potrà mai corrispondere a del traffico',
    configuration: 'Configurazione IOS',
    tester: 'Prova un pacchetto', protocol: 'Protocollo', sourceIp: 'IP sorgente', destinationIp: 'IP destinazione', port: 'Porta destinazione',
    matched: 'Corrisponde alla riga', implicit: 'Nessuna riga corrisponde: decide il deny implicito',
    permitted: 'Permesso', denied: 'Scartato', logged: 'registrato nel log',
    emptyAcl: 'Seleziona almeno un requisito per generare la ACL.',
    invalid: 'Pacchetto non valido: controlla gli indirizzi e la porta.',
    firstMatch: 'First match wins',
    firstMatchBody: 'Il router scorre le righe in ordine di sequenza e si ferma alla prima che corrisponde: le successive non vengono nemmeno guardate. Non esiste «la regola più specifica vince» come negli ACL di altri prodotti — qui vince la prima, e la specificità è responsabilità di chi scrive l’ordine.',
    placement: 'Dove si applica, e in quale direzione',
    placementBody: 'Una ACL estesa filtra su sorgente, destinazione, protocollo e porta, quindi si applica il più vicino possibile alla SORGENTE: il traffico da scartare non attraversa la rete inutilmente. Una ACL standard filtra solo sulla sorgente, quindi va il più vicino possibile alla DESTINAZIONE, altrimenti blocca anche il traffico legittimo verso altre reti. La direzione è rispetto all’interfaccia: in = traffico che entra nel router da quell’interfaccia, out = traffico che esce.',
    trap: 'Trappola d’esame',
    trapBody: 'Il deny implicito finale non appare in configurazione ma c’è sempre: una ACL di soli deny blocca tutto. Seconda trappola: le ACL usano wildcard mask, non subnet mask, e 0.0.0.255 non è 255.255.255.0. Terza: una ACL applicata a un’interfaccia non filtra il traffico generato dal router stesso, e per Telnet o SSH verso il router serve access-class sulla linea VTY, non ip access-group.'
  },
  en: {
    title: 'ACL builder, from the requirement',
    intro: 'A requirement never arrives as a configuration line: it arrives as "block Telnet from the guests, allow HTTPS to the servers". Writing the lines is the easy part. The costly part is the order, because evaluation is first match and a general line above a specific one makes the specific one unreachable.',
    preset: 'Starting point', lesson: 'What it shows',
    requirements: 'Requirements, in the order they will be written',
    moveUp: 'Move up', moveDown: 'Move down', remove: 'Exclude from the ACL', add: 'Available requirements',
    statuses: { active: 'Active', shadowed: 'Dead line', redundant: 'Redundant' },
    acl: 'Generated ACL', applySuggestion: 'Apply the order that keeps them all alive',
    deadWarning: 'At least one line can never match any traffic',
    configuration: 'IOS configuration',
    tester: 'Test a packet', protocol: 'Protocol', sourceIp: 'Source IP', destinationIp: 'Destination IP', port: 'Destination port',
    matched: 'Matches line', implicit: 'No line matches: the implicit deny decides',
    permitted: 'Permitted', denied: 'Dropped', logged: 'written to the log',
    emptyAcl: 'Select at least one requirement to generate the ACL.',
    invalid: 'Invalid packet: check the addresses and the port.',
    firstMatch: 'First match wins',
    firstMatchBody: 'The router walks the lines in sequence order and stops at the first one that matches: the ones after it are never even looked at. There is no "most specific rule wins" as in some other products — here the first one wins, and specificity is the responsibility of whoever writes the order.',
    placement: 'Where it is applied, and in which direction',
    placementBody: 'An extended ACL filters on source, destination, protocol and port, so it is applied as close as possible to the SOURCE: traffic that will be dropped does not cross the network for nothing. A standard ACL filters on source only, so it goes as close as possible to the DESTINATION, or it also blocks legitimate traffic toward other networks. The direction is relative to the interface: in = traffic entering the router through it, out = traffic leaving.',
    trap: 'Exam trap',
    trapBody: 'The final implicit deny never appears in the configuration but is always there: an ACL of deny lines only blocks everything. Second trap: ACLs use wildcard masks, not subnet masks, and 0.0.0.255 is not 255.255.255.0. Third: an ACL applied to an interface does not filter traffic generated by the router itself, and for Telnet or SSH toward the router you need access-class on the VTY line, not ip access-group.'
  }
} as const;

export default function AclBuilderLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [presetId, setPresetId] = useState(ACL_PRESETS[0].id);
  const preset = ACL_PRESETS.find(item => item.id === presetId) ?? ACL_PRESETS[0];
  const [order, setOrder] = useState<string[]>(preset.order);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [packet, setPacket] = useState<PacketDescriptor>({
    protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', destinationPort: 23
  });

  const intentsById = useMemo(() => new Map(ACL_INTENTS.map(intent => [intent.id, intent])), []);
  const chosen = order.map(id => intentsById.get(id)).filter((intent): intent is NonNullable<typeof intent> => Boolean(intent));
  const available = ACL_INTENTS.filter(intent => !order.includes(intent.id));

  const acl = useMemo<BuiltAcl | null>(() => {
    if (chosen.length === 0) return null;
    try {
      return buildAcl(chosen, { name: 'GUEST-IN', interfaceName: preset.interfaceName, direction: preset.direction });
    } catch {
      return null;
    }
  }, [chosen, preset]);

  const decision = useMemo(() => {
    if (!acl) return null;
    try {
      return evaluateIpv4Acl(acl.aces.map(ace => ace.rule), packet);
    } catch {
      return null;
    }
  }, [acl, packet]);

  const choosePreset = (id: string) => {
    const next = ACL_PRESETS.find(item => item.id === id) ?? ACL_PRESETS[0];
    setPresetId(id);
    setOrder(next.order);
    setSelectedLine(null);
  };

  const move = (index: number, delta: number) => {
    setOrder(current => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSelectedLine(null);
  };

  const inputClass = 'block w-full rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="acl-builder-title">
      <div className="flex items-center gap-3">
        <ListOrdered className="h-5 w-5 text-indigo-600" />
        <h2 id="acl-builder-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.preset}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACL_PRESETS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => choosePreset(item.id)}
              aria-pressed={item.id === presetId}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                item.id === presetId
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
          {preset.lesson[language]}
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.requirements}</h3>
          <ol className="mt-2 space-y-2">
            {chosen.map((intent, index) => (
              <li key={intent.id} className="flex min-w-0 items-start gap-2 rounded-lg border border-slate-200 p-2.5">
                <span className="mt-0.5 font-mono text-[10px] text-slate-400">{(index + 1) * 10}</span>
                <span className="min-w-0 flex-1">
                  <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${intent.action === 'deny' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {intent.action}
                  </span>
                  <span className="ml-2 text-xs leading-snug text-slate-700">{intent.description[language]}</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`${copy.moveUp}: ${intent.id}`} className="rounded border border-slate-200 p-1 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30">
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === chosen.length - 1} aria-label={`${copy.moveDown}: ${intent.id}`} className="rounded border border-slate-200 p-1 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30">
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => setOrder(current => current.filter(id => id !== intent.id))} aria-label={`${copy.remove}: ${intent.id}`} className="rounded border border-slate-200 px-1.5 text-[11px] text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ol>

          {available.length > 0 ? (
            <div className="mt-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.add}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {available.map(intent => (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => setOrder(current => [...current, intent.id])}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    + {intent.description[language]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.acl}</h3>
          {!acl ? (
            <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">{copy.emptyAcl}</p>
          ) : (
            <>
              {acl.hasDeadRules ? (
                <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="flex items-start gap-2 text-xs font-semibold text-rose-800">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {copy.deadWarning}
                  </p>
                  {acl.suggestedOrder ? (
                    <button
                      type="button"
                      onClick={() => { setOrder(acl.suggestedOrder ?? order); setSelectedLine(null); }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Wand2 className="h-3.5 w-3.5" /> {copy.applySuggestion}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <ul className="mt-2 space-y-1.5">
                {acl.aces.map((ace, index) => (
                  <li key={ace.intentId}>
                    <button
                      type="button"
                      onClick={() => setSelectedLine(selectedLine === index ? null : index)}
                      aria-pressed={selectedLine === index}
                      className={`w-full rounded-lg border p-2.5 text-left transition hover:bg-slate-50 ${STATUS_STYLES[ace.status].row}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="min-w-0 break-all font-mono text-[11px] text-slate-800">{ace.text}</code>
                        <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[ace.status].badge}`}>
                          {copy.statuses[ace.status]}
                        </span>
                      </div>
                      {selectedLine === index ? (
                        <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{ace.note[language]}</p>
                      ) : null}
                    </button>
                  </li>
                ))}
                <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2.5">
                  <code className="font-mono text-[11px] text-slate-500">deny ip any any (implicito)</code>
                </li>
              </ul>

              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
                {acl.implicitDeny[language]}
              </p>

              <div className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3">
                <p className="font-mono text-[10px] text-slate-500">{copy.configuration}</p>
                <pre className="mt-2 font-mono text-[11px] leading-relaxed text-emerald-300"><code>{acl.configuration.join('\n')}</code></pre>
              </div>
            </>
          )}
        </div>
      </div>

      {acl ? (
        <div className="mt-6 rounded-lg border border-slate-200 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.tester}</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
              {copy.protocol}
              <select
                value={packet.protocol}
                aria-label={copy.protocol}
                onChange={(event) => setPacket({ ...packet, protocol: event.target.value as PacketDescriptor['protocol'] })}
                className={inputClass}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
              </select>
            </label>
            <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
              {copy.sourceIp}
              <input value={packet.sourceIp} onChange={(event) => setPacket({ ...packet, sourceIp: event.target.value })} className={inputClass} />
            </label>
            <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
              {copy.destinationIp}
              <input value={packet.destinationIp} onChange={(event) => setPacket({ ...packet, destinationIp: event.target.value })} className={inputClass} />
            </label>
            <label className="min-w-0 space-y-1 text-[11px] text-slate-600">
              {copy.port}
              <input
                type="number" min={1} max={65535}
                value={packet.destinationPort ?? ''}
                disabled={packet.protocol === 'icmp'}
                onChange={(event) => setPacket({ ...packet, destinationPort: Number(event.target.value) })}
                className={`${inputClass} disabled:bg-slate-100`}
              />
            </label>
          </div>

          {!decision ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-rose-700" role="alert">
              <TriangleAlert className="h-3.5 w-3.5" /> {copy.invalid}
            </p>
          ) : (
            <div className={`mt-3 rounded-lg border p-3 ${decision.action === 'permit' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
              <p className={`text-sm font-semibold ${decision.action === 'permit' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {decision.action === 'permit' ? copy.permitted : copy.denied}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-600">
                {decision.implicit
                  ? copy.implicit
                  : `${copy.matched} ${decision.matchedSequence}: ${acl.aces.find(ace => ace.rule.sequence === decision.matchedSequence)?.text ?? ''}`}
                {decision.logged ? ` · ${copy.logged}` : ''}
              </p>
              {packet.protocol !== 'icmp' && packet.destinationPort ? (
                <p className="mt-1 font-mono text-[10px] text-slate-500">
                  {packet.protocol} {packet.sourceIp} → {packet.destinationIp} eq {portToken(packet.destinationPort)}
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.firstMatch}</h3>
          <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.firstMatchBody}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.placement}</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">{copy.placementBody}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">{copy.trap}</h3>
          <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.trapBody}</p>
        </div>
      </div>
    </section>
  );
}
