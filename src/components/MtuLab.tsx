import { useMemo, useState } from 'react';
import { Scissors, TriangleAlert } from 'lucide-react';
import { analyseMtu, encapsulationById, ENCAPSULATIONS, type IpVersion, type MtuResult } from '../lib/mtu';
import { useStore } from '../store';

/**
 * MTU, and the packet that does not fit.
 *
 * Three facts collide and each is a mistake on its own: a tunnel shrinks what the
 * inner packet may be rather than the link itself, an IPv4 router fragments only when
 * DF is clear, and an IPv6 router never fragments at all. Add the detail that makes
 * the arithmetic surprising — the fragment offset counts in units of 8 bytes — and the
 * result is worth computing in front of the learner instead of asserting.
 */

const OUTCOME_STYLES: Record<MtuResult['outcome'], string> = {
  fits: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  fragmented: 'border-amber-200 bg-amber-50 text-amber-900',
  'dropped-df': 'border-rose-200 bg-rose-50 text-rose-900',
  'dropped-ipv6': 'border-rose-200 bg-rose-50 text-rose-900',
  impossible: 'border-slate-300 bg-slate-100 text-slate-800'
};

const COPY = {
  it: {
    title: 'MTU, frammentazione e overhead dei tunnel',
    intro: 'Un tunnel non rimpicciolisce il collegamento: rimpicciolisce il pacchetto che ci puoi mettere dentro. Imposta un pacchetto e un incapsulamento e guarda cosa ne fa il router — passa intero, viene diviso in frammenti, oppure viene scartato con un messaggio ICMP di cui qualcuno si è dimenticato.',
    version: 'Versione IP', linkMtu: 'MTU del collegamento (byte)', packet: 'Pacchetto IP totale (byte)', encapsulation: 'Incapsulamento',
    df: 'Bit DF impostato (Don’t Fragment)', dfIpv6: 'In IPv6 non esiste il bit DF: i router non frammentano mai.',
    effective: 'MTU utile per il pacchetto interno', overhead: 'Overhead', mss: 'MSS TCP massima',
    outcomes: {
      fits: 'Passa intero',
      fragmented: 'Frammentato',
      'dropped-df': 'Scartato: DF impostato',
      'dropped-ipv6': 'Scartato: IPv6 non frammenta in transito',
      impossible: 'Configurazione non trasportabile'
    },
    fragments: 'Frammenti generati',
    colIndex: 'N.', colTotal: 'Byte totali', colPayload: 'Payload', colOffset: 'Fragment offset', colFlag: 'Flag MF',
    icmp: 'Messaggio ICMP di ritorno', reportedMtu: 'MTU segnalata',
    adjust: 'Comando da applicare all’interfaccia del tunnel',
    invalid: 'Valori non validi: il pacchetto deve essere più grande del proprio header e l’MTU almeno 68 byte.',
    alignment: 'Perché i frammenti sono multipli di 8',
    alignmentBody: 'Il campo fragment offset dell’header IPv4 è lungo 13 bit e conta in unità di 8 byte: con 13 bit si arriva a 8191, che per 8 byte copre i 65 535 byte massimi di un pacchetto IP. La conseguenza pratica è che ogni frammento tranne l’ultimo deve trasportare un payload multiplo di 8 — se l’MTU disponibile non lo è, si arrotonda per difetto e qualche byte di MTU resta inutilizzato.',
    blackhole: 'Il black hole della PMTU Discovery',
    blackholeBody: 'La Path MTU Discovery funziona solo perché il router scartante avvisa la sorgente: ICMP tipo 3 codice 4 in IPv4, ICMPv6 Packet Too Big in IPv6, con l’MTU del prossimo salto dentro il messaggio. Se un firewall filtra ICMP «per sicurezza», quell’avviso non arriva: le sessioni si aprono (i pacchetti piccoli passano) e poi si bloccano al primo trasferimento grande, senza alcun errore. È la ragione per cui si limita la MSS con ip tcp adjust-mss invece di sperare nella PMTUD.',
    trap: 'Trappola d’esame',
    trapBody: 'Il tag 802.1Q aggiunge 4 byte alla TRAMA, non al pacchetto IP: la trama diventa 1522 byte (baby giant) ma l’MTU IP resta 1500. Sottrarre 4 per un trunk è sbagliato. Attenzione anche alla differenza tra MTU e MSS: la MTU è il pacchetto IP completo, la MSS è solo il payload TCP, quindi su Ethernet 1500 corrisponde a 1460 di MSS (meno 20 di IP e 20 di TCP) e a 1440 in IPv6, dove l’header è di 40 byte.'
  },
  en: {
    title: 'MTU, fragmentation and tunnel overhead',
    intro: 'A tunnel does not shrink the link: it shrinks the packet you can put inside it. Set a packet and an encapsulation and watch what the router does with it — pass it whole, split it into fragments, or drop it with an ICMP message somebody forgot about.',
    version: 'IP version', linkMtu: 'Link MTU (bytes)', packet: 'Total IP packet (bytes)', encapsulation: 'Encapsulation',
    df: 'DF bit set (Don’t Fragment)', dfIpv6: 'IPv6 has no DF bit: routers never fragment.',
    effective: 'MTU left for the inner packet', overhead: 'Overhead', mss: 'Largest TCP MSS',
    outcomes: {
      fits: 'Passes whole',
      fragmented: 'Fragmented',
      'dropped-df': 'Dropped: DF is set',
      'dropped-ipv6': 'Dropped: IPv6 does not fragment in transit',
      impossible: 'Configuration cannot carry traffic'
    },
    fragments: 'Fragments produced',
    colIndex: 'No.', colTotal: 'Total bytes', colPayload: 'Payload', colOffset: 'Fragment offset', colFlag: 'MF flag',
    icmp: 'ICMP message sent back', reportedMtu: 'Reported MTU',
    adjust: 'Command to apply on the tunnel interface',
    invalid: 'Invalid values: the packet must be larger than its own header and the MTU at least 68 bytes.',
    alignment: 'Why fragments are multiples of 8',
    alignmentBody: 'The IPv4 fragment offset field is 13 bits wide and counts in units of 8 bytes: 13 bits reach 8191, which times 8 covers the 65,535-byte maximum of an IP packet. The practical consequence is that every fragment except the last must carry a payload that is a multiple of 8 — and when the available MTU is not, it is rounded down and a few bytes of MTU go unused.',
    blackhole: 'The PMTU Discovery black hole',
    blackholeBody: 'Path MTU Discovery works only because the dropping router tells the source: ICMP type 3 code 4 in IPv4, ICMPv6 Packet Too Big in IPv6, with the next-hop MTU inside the message. If a firewall filters ICMP "for security", that notice never arrives: sessions open (small packets pass) and then stall on the first large transfer, with no error at all. It is why the MSS is clamped with ip tcp adjust-mss instead of trusting PMTUD.',
    trap: 'Exam trap',
    trapBody: 'The 802.1Q tag adds 4 bytes to the FRAME, not to the IP packet: the frame becomes 1522 bytes (a baby giant) but the IP MTU stays 1500. Subtracting 4 for a trunk is wrong. Mind the difference between MTU and MSS too: the MTU is the whole IP packet, the MSS is the TCP payload alone, so 1500 on Ethernet means an MSS of 1460 (less 20 of IP and 20 of TCP) and 1440 in IPv6, where the header is 40 bytes.'
  }
} as const;

export default function MtuLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [version, setVersion] = useState<IpVersion>(4);
  const [linkMtu, setLinkMtu] = useState(1500);
  const [packetBytes, setPacketBytes] = useState(1500);
  const [encapsulationId, setEncapsulationId] = useState('gre');
  const [dontFragment, setDontFragment] = useState(false);

  const result = useMemo<{ value: MtuResult; error: false } | { value: null; error: true }>(() => {
    try {
      return { value: analyseMtu({ version, linkMtu, packetBytes, encapsulationId, dontFragment }), error: false };
    } catch {
      return { value: null, error: true };
    }
  }, [version, linkMtu, packetBytes, encapsulationId, dontFragment]);

  const analysis = result.value;
  const encapsulation = encapsulationById(encapsulationId);
  const inputClass = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="mtu-title">
      <div className="flex items-center gap-3">
        <Scissors className="h-5 w-5 text-indigo-600" />
        <h2 id="mtu-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.version}
          <select value={version} aria-label={copy.version} onChange={(event) => setVersion(Number(event.target.value) as IpVersion)} className={inputClass}>
            <option value={4}>IPv4</option>
            <option value={6}>IPv6</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.linkMtu}
          <input type="number" min={68} max={9216} value={linkMtu} onChange={(event) => setLinkMtu(Number(event.target.value))} className={inputClass} />
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.packet}
          <input type="number" min={41} max={65535} value={packetBytes} onChange={(event) => setPacketBytes(Number(event.target.value))} className={inputClass} />
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.encapsulation}
          <select value={encapsulationId} aria-label={copy.encapsulation} onChange={(event) => setEncapsulationId(event.target.value)} className={inputClass}>
            {ENCAPSULATIONS.map(item => <option key={item.id} value={item.id}>{item.label[language]}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className={`flex items-center gap-2 text-xs ${version === 6 ? 'text-slate-400' : 'text-slate-700'}`}>
          <input type="checkbox" checked={dontFragment} disabled={version === 6} onChange={(event) => setDontFragment(event.target.checked)} />
          {copy.df}
        </label>
        {version === 6 ? <span className="text-[11px] text-slate-500">{copy.dfIpv6}</span> : null}
      </div>

      <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
        {encapsulation.detail[language]}
      </p>

      {!analysis ? (
        <p className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> <span>{copy.invalid}</span>
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [copy.effective, `${analysis.effectiveMtu} B`],
              [copy.overhead, `${analysis.overheadBytes} B`],
              [copy.mss, `${analysis.tcpMss} B`],
              [copy.packet, `${analysis.packetBytes} B`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>

          <div className={`rounded-lg border p-4 ${OUTCOME_STYLES[analysis.outcome]}`}>
            <p className="text-sm font-semibold">{copy.outcomes[analysis.outcome]}</p>
            <p className="mt-2 text-xs leading-relaxed">{analysis.explanation[language]}</p>
            {analysis.icmp ? (
              <p className="mt-2 font-mono text-[11px]">
                {copy.icmp}: {analysis.icmp.name} · type {analysis.icmp.type} code {analysis.icmp.code} · {copy.reportedMtu} {analysis.icmp.reportedMtu} B
              </p>
            ) : null}
          </div>

          {analysis.fragments.length > 0 ? (
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {copy.fragments} ({analysis.fragments.length})
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[440px] text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wide text-slate-400">
                      <th className="pb-2 pr-3 font-semibold">{copy.colIndex}</th>
                      <th className="pb-2 pr-3 font-semibold">{copy.colTotal}</th>
                      <th className="pb-2 pr-3 font-semibold">{copy.colPayload}</th>
                      <th className="pb-2 pr-3 font-semibold">{copy.colOffset}</th>
                      <th className="pb-2 font-semibold">{copy.colFlag}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {analysis.fragments.map(fragment => (
                      <tr key={fragment.index} className="border-t border-slate-100">
                        <td className="py-1.5 pr-3 text-slate-500">{fragment.index + 1}</td>
                        <td className="py-1.5 pr-3 text-slate-800">{fragment.totalBytes}</td>
                        <td className="py-1.5 pr-3 text-slate-800">{fragment.payloadBytes}</td>
                        <td className="py-1.5 pr-3 text-slate-600">{fragment.offsetUnits} <span className="text-slate-400">({fragment.offsetBytes} B)</span></td>
                        <td className="py-1.5 text-slate-600">{fragment.moreFragments ? '1' : '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {analysis.overheadBytes > 0 ? (
            <div className="overflow-x-auto rounded-lg bg-slate-950 p-3">
              <p className="font-mono text-[10px] text-slate-500">{copy.adjust}</p>
              <pre className="mt-2 font-mono text-[11px] leading-relaxed text-emerald-300"><code>{[
                'interface Tunnel0',
                ` ip mtu ${analysis.effectiveMtu}`,
                ` ip tcp adjust-mss ${analysis.tcpMss}`
              ].join('\n')}</code></pre>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.alignment}</h3>
          <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.alignmentBody}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-700">{copy.blackhole}</h3>
          <p className="mt-2 text-xs leading-relaxed text-rose-900">{copy.blackholeBody}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">{copy.trap}</h3>
          <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.trapBody}</p>
        </div>
      </div>
    </section>
  );
}
