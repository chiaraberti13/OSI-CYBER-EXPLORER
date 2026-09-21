import { useMemo, useState } from 'react';
import { Radio, TriangleAlert } from 'lucide-react';
import { simulateDhcp, type DhcpMessage, type DhcpResult, type ServerLocation } from '../lib/dhcpFlow';
import { useStore } from '../store';

/**
 * DORA on the wire, with the parts the four cards never show.
 *
 * The sequence is easy to name and hard to explain: why the REQUEST is broadcast again
 * after the client has already chosen its server, why a router ends the exchange
 * silently unless it is told to relay, and what `giaddr` is for. Add the two ways the
 * exchange fails while looking perfectly configured — snooping dropping a server
 * message on an untrusted port, Option 82 arriving with giaddr at zero — and the
 * sequence is worth walking rather than listing.
 */

const MESSAGE_STYLES: Record<DhcpMessage, string> = {
  DISCOVER: 'bg-sky-100 text-sky-800',
  OFFER: 'bg-indigo-100 text-indigo-800',
  REQUEST: 'bg-amber-100 text-amber-800',
  ACK: 'bg-emerald-100 text-emerald-800',
  NAK: 'bg-rose-100 text-rose-800'
};

const COPY = {
  it: {
    title: 'DORA passo per passo, con relay e Option 82',
    intro: 'Quattro messaggi che tutti sanno elencare e quasi nessuno sa spiegare. Muovi le condizioni e guarda gli indirizzi, le porte UDP e il campo giaddr cambiare — e i due modi in cui lo scambio si rompe restando apparentemente configurato.',
    mode: 'Cosa sta facendo il client', initial: 'Primo avvio (nessun indirizzo)', renew: 'Rinnovo del lease',
    location: 'Dove sta il server', sameSubnet: 'Nella stessa subnet', remote: 'In un’altra subnet (serve il relay)',
    relay: 'ip helper-address configurato sul gateway',
    option82: 'Option 82 inserita (relay agent information)',
    snooping: 'Messaggi del server su porta untrusted (DHCP snooping)',
    pool: 'Pool esaurito',
    lease: 'Durata del lease (secondi)',
    sequence: 'Messaggi sulla rete',
    broadcast: 'broadcast', unicast: 'unicast',
    leaseObtained: 'Indirizzo ottenuto', noLease: 'Nessun indirizzo ottenuto',
    address: 'Indirizzo', mask: 'Mask', gateway: 'Default gateway (option 3)', dns: 'DNS (option 6)',
    t1: 'T1 — rinnovo (50%)', t2: 'T2 — rebinding (87,5%)',
    invalid: 'Il lease deve essere di almeno 60 secondi.',
    ports: 'Le porte non sono simmetriche',
    portsBody: 'Il client parla dalla porta UDP 68 verso la 67 del server. Le risposte tornano da 67 a 68. Un relay, però, non è un client: quando riscrive il pacchetto verso il server usa 67 come porta sorgente, perché agisce come agente DHCP. È il dettaglio che rende riconoscibile un relay in una cattura di traffico.',
    why: 'Perché la REQUEST è ancora in broadcast',
    whyBody: 'Il client ha già scelto il server e lo indica nell’option 54 dentro il pacchetto, ma l’indirizzo offerto non è suo finché non arriva l’ACK — quindi non può ancora usarlo come sorgente. E soprattutto gli altri server che avevano risposto devono vedere quale offerta è stata accettata, per ritirare la propria e rimettere l’indirizzo nel pool. Un unicast non lo permetterebbe.',
    trap: 'Trappola d’esame',
    trapBody: 'Il campo giaddr non è l’indirizzo del client: è l’indirizzo dell’interfaccia del relay sulla subnet del client, e serve al server per scegliere il pool giusto. Se vale 0.0.0.0 il server assume che il client sia sulla propria subnet. Attenzione anche al sintomo: un indirizzo 169.254.x.x sul client significa «nessuna risposta DHCP ricevuta», e le cause possibili sono il relay mancante, il pool esaurito o lo snooping che scarta le risposte — tre problemi diversi con lo stesso sintomo.'
  },
  en: {
    title: 'DORA step by step, with relay and Option 82',
    intro: 'Four messages everyone can list and almost nobody can explain. Move the conditions and watch the addresses, the UDP ports and the giaddr field change — along with the two ways the exchange breaks while looking perfectly configured.',
    mode: 'What the client is doing', initial: 'First boot (no address)', renew: 'Lease renewal',
    location: 'Where the server is', sameSubnet: 'In the same subnet', remote: 'In another subnet (a relay is needed)',
    relay: 'ip helper-address configured on the gateway',
    option82: 'Option 82 inserted (relay agent information)',
    snooping: 'Server messages on an untrusted port (DHCP snooping)',
    pool: 'Pool exhausted',
    lease: 'Lease duration (seconds)',
    sequence: 'Messages on the network',
    broadcast: 'broadcast', unicast: 'unicast',
    leaseObtained: 'Address obtained', noLease: 'No address obtained',
    address: 'Address', mask: 'Mask', gateway: 'Default gateway (option 3)', dns: 'DNS (option 6)',
    t1: 'T1 — renewal (50%)', t2: 'T2 — rebinding (87.5%)',
    invalid: 'The lease must be at least 60 seconds.',
    ports: 'The ports are not symmetric',
    portsBody: 'The client speaks from UDP port 68 toward the server’s 67. Replies come back from 67 to 68. A relay, however, is not a client: when it rewrites the packet toward the server it uses 67 as its source port, because it acts as a DHCP agent. It is the detail that makes a relay recognisable in a packet capture.',
    why: 'Why the REQUEST is still a broadcast',
    whyBody: 'The client has already chosen the server and names it in option 54 inside the packet, but the offered address is not its own until the ACK arrives — so it cannot use it as a source yet. And above all the other servers that replied must see which offer was accepted, so they can withdraw theirs and put the address back in the pool. A unicast would not allow that.',
    trap: 'Exam trap',
    trapBody: 'The giaddr field is not the client’s address: it is the address of the relay’s interface on the client’s subnet, and the server uses it to pick the right pool. When it is 0.0.0.0 the server assumes the client is on its own subnet. Mind the symptom too: a 169.254.x.x address on the client means "no DHCP reply received", and the possible causes are a missing relay, an exhausted pool, or snooping dropping the replies — three different problems with one symptom.'
  }
} as const;

export default function DhcpFlowLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [mode, setMode] = useState<'initial' | 'renew'>('initial');
  const [serverLocation, setServerLocation] = useState<ServerLocation>('remote');
  const [relayConfigured, setRelayConfigured] = useState(true);
  const [option82, setOption82] = useState(false);
  const [snoopingUntrustedServer, setSnooping] = useState(false);
  const [poolExhausted, setPoolExhausted] = useState(false);
  const [leaseSeconds, setLeaseSeconds] = useState(86_400);

  const result = useMemo<{ value: DhcpResult; error: false } | { value: null; error: true }>(() => {
    try {
      return {
        value: simulateDhcp({ mode, serverLocation, relayConfigured, option82, snoopingUntrustedServer, poolExhausted, leaseSeconds }),
        error: false
      };
    } catch {
      return { value: null, error: true };
    }
  }, [mode, serverLocation, relayConfigured, option82, snoopingUntrustedServer, poolExhausted, leaseSeconds]);

  const flow = result.value;
  const inputClass = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  const toggles: Array<{ id: string; label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }> = [
    { id: 'relay', label: copy.relay, checked: relayConfigured, onChange: setRelayConfigured, disabled: serverLocation === 'same-subnet' || mode === 'renew' },
    { id: 'option82', label: copy.option82, checked: option82, onChange: setOption82, disabled: mode === 'renew' },
    { id: 'snooping', label: copy.snooping, checked: snoopingUntrustedServer, onChange: setSnooping, disabled: mode === 'renew' },
    { id: 'pool', label: copy.pool, checked: poolExhausted, onChange: setPoolExhausted }
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="dhcp-flow-title">
      <div className="flex items-center gap-3">
        <Radio className="h-5 w-5 text-indigo-600" />
        <h2 id="dhcp-flow-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.mode}
          <select value={mode} aria-label={copy.mode} onChange={(event) => setMode(event.target.value as 'initial' | 'renew')} className={inputClass}>
            <option value="initial">{copy.initial}</option>
            <option value="renew">{copy.renew}</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.location}
          <select value={serverLocation} aria-label={copy.location} onChange={(event) => setServerLocation(event.target.value as ServerLocation)} className={inputClass}>
            <option value="same-subnet">{copy.sameSubnet}</option>
            <option value="remote">{copy.remote}</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.lease}
          <input type="number" min={60} max={604800} step={60} value={leaseSeconds} onChange={(event) => setLeaseSeconds(Number(event.target.value))} className={inputClass} />
        </label>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {toggles.map(toggle => (
          <label key={toggle.id} className={`flex min-w-0 items-start gap-2 text-xs ${toggle.disabled ? 'text-slate-400' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              checked={toggle.checked}
              disabled={toggle.disabled}
              aria-label={toggle.label}
              onChange={(event) => toggle.onChange(event.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span className="min-w-0">{toggle.label}</span>
          </label>
        ))}
      </div>

      {!flow ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="h-4 w-4 shrink-0" /> {copy.invalid}
        </p>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.sequence}</h3>
            <ol className="mt-2 space-y-2">
              {flow.steps.map((step, index) => (
                <li key={`${step.message}-${index}`} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${MESSAGE_STYLES[step.message]}`}>
                      {step.message}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">{step.from} → {step.to}</span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${step.broadcast ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                      {step.broadcast ? copy.broadcast : copy.unicast}
                    </span>
                  </div>
                  <p className="mt-1.5 break-words font-mono text-[10px] text-slate-500">
                    {step.sourceIp}:{step.udp.source} → {step.destinationIp}:{step.udp.destination}
                    {' · '}{step.sourceMac} → {step.destinationMac}
                    {' · giaddr '}{step.giaddr}
                    {step.option82 ? ' · option 82' : ''}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.note[language]}</p>
                </li>
              ))}
            </ol>

            {flow.failure ? (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <p className="flex items-start gap-2 text-xs font-semibold text-rose-800">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {copy.noLease} · {flow.failure.code}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-rose-900">{flow.failure.note[language]}</p>
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <div className={`rounded-lg border p-4 ${flow.leased ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-semibold ${flow.leased ? 'text-emerald-800' : 'text-slate-600'}`}>
                {flow.leased ? copy.leaseObtained : copy.noLease}
              </p>
              {flow.lease ? (
                <dl className="mt-3 space-y-2">
                  {[
                    [copy.address, flow.lease.address],
                    [copy.mask, flow.lease.mask],
                    [copy.gateway, flow.lease.gateway],
                    [copy.dns, flow.lease.dns],
                    [copy.t1, `${flow.lease.t1Seconds} s`],
                    [copy.t2, `${flow.lease.t2Seconds} s`]
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="font-mono text-xs font-semibold text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 font-mono text-xs text-slate-500">169.254.x.x (APIPA)</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.why}</h3>
          <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.whyBody}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.ports}</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-700">{copy.portsBody}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">{copy.trap}</h3>
          <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.trapBody}</p>
        </div>
      </div>
    </section>
  );
}
