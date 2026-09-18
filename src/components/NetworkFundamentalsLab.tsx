import { useMemo, useState } from 'react';
import { AlertTriangle, Binary, Cable, Calculator, ShieldCheck } from 'lucide-react';
import { calculateIpv4Subnet, type Ipv4AddressKind } from '../lib/ipv4';
import { inspectIpv6, macToModifiedEui64, type Ipv6AddressKind } from '../lib/ipv6';
import { useStore } from '../store';

type Language = 'it' | 'en';

const ADDRESS_KIND_LABELS: Record<Ipv4AddressKind, Record<Language, string>> = {
  private: { it: 'Privato RFC 1918', en: 'RFC 1918 private' },
  public: { it: 'Pubblico', en: 'Public' },
  shared: { it: 'Spazio condiviso RFC 6598', en: 'RFC 6598 shared space' },
  'special-use': { it: 'Uso speciale o riservato', en: 'Special-use or reserved' },
  loopback: { it: 'Loopback', en: 'Loopback' },
  'link-local': { it: 'Link-local/APIPA', en: 'Link-local/APIPA' },
  multicast: { it: 'Multicast', en: 'Multicast' },
  documentation: { it: 'Documentazione', en: 'Documentation' },
  unspecified: { it: 'Non specificato', en: 'Unspecified' },
  'limited-broadcast': { it: 'Broadcast limitato', en: 'Limited broadcast' }
};

const IPV6_KIND_LABELS: Record<Ipv6AddressKind, Record<Language, string>> = {
  unspecified: { it: 'Non specificato (::)', en: 'Unspecified (::)' },
  loopback: { it: 'Loopback (::1)', en: 'Loopback (::1)' },
  'link-local': { it: 'Link-local (FE80::/10)', en: 'Link-local (FE80::/10)' },
  'unique-local': { it: 'Unique local (FC00::/7)', en: 'Unique local (FC00::/7)' },
  'global-unicast': { it: 'Global unicast (2000::/3)', en: 'Global unicast (2000::/3)' },
  multicast: { it: 'Multicast (FF00::/8)', en: 'Multicast (FF00::/8)' },
  documentation: { it: 'Documentazione (2001:DB8::/32)', en: 'Documentation (2001:DB8::/32)' },
  'ipv4-mapped': { it: 'IPv4-mapped (::FFFF:0:0/96)', en: 'IPv4-mapped (::FFFF:0:0/96)' },
  'ipv4-compatible': { it: 'IPv4-compatible (::/96, deprecato)', en: 'IPv4-compatible (::/96, deprecated)' },
  nat64: { it: 'Prefisso NAT64 well-known (64:FF9B::/96)', en: 'NAT64 well-known prefix (64:FF9B::/96)' },
  other: { it: 'Altro intervallo IPv6', en: 'Other IPv6 range' }
};

const TRANSPORT_ROWS = [
  {
    property: { it: 'Connessione', en: 'Connection' },
    tcp: { it: 'Orientato alla connessione; handshake a tre vie', en: 'Connection-oriented; three-way handshake' },
    udp: { it: 'Connectionless; nessun handshake', en: 'Connectionless; no handshake' }
  },
  {
    property: { it: 'Affidabilità', en: 'Reliability' },
    tcp: { it: 'ACK, ritrasmissione e consegna ordinata', en: 'ACKs, retransmission, and ordered delivery' },
    udp: { it: 'Nessuna garanzia integrata di consegna o ordine', en: 'No built-in delivery or ordering guarantee' }
  },
  {
    property: { it: 'Controllo', en: 'Control' },
    tcp: { it: 'Controllo di flusso e congestione', en: 'Flow and congestion control' },
    udp: { it: 'Overhead minimo; il controllo spetta all’applicazione', en: 'Minimal overhead; control belongs to the application' }
  },
  {
    property: { it: 'Impieghi tipici', en: 'Typical uses' },
    tcp: { it: 'HTTPS, SSH, FTP, SMTP e BGP', en: 'HTTPS, SSH, FTP, SMTP, and BGP' },
    udp: { it: 'DNS, DHCP, NTP, SNMP e traffico real-time', en: 'DNS, DHCP, NTP, SNMP, and real-time traffic' }
  }
];

const INTERFACE_STATES = [
  {
    state: 'administratively down / down',
    cause: { it: 'Interfaccia disabilitata con shutdown.', en: 'The interface is disabled with shutdown.' },
    action: { it: 'Verifica la configurazione e usa no shutdown.', en: 'Verify the configuration and use no shutdown.' }
  },
  {
    state: 'down / down',
    cause: { it: 'Problema fisico: cavo, transceiver, alimentazione, speed o porta remota.', en: 'Physical problem: cable, transceiver, power, speed, or remote port.' },
    action: { it: 'Controlla LED, cablaggio e show interfaces.', en: 'Check LEDs, cabling, and show interfaces.' }
  },
  {
    state: 'up / down',
    cause: { it: 'Il livello fisico è attivo, ma il protocollo di linea non funziona.', en: 'The physical layer is active, but the line protocol is not operational.' },
    action: { it: 'Controlla encapsulation, keepalive, VLAN e configurazione del peer.', en: 'Check encapsulation, keepalives, VLANs, and peer configuration.' }
  },
  {
    state: 'up / up + CRC/input errors',
    cause: { it: 'Rumore, cablaggio difettoso, transceiver o duplex mismatch.', en: 'Noise, faulty cabling, transceiver issues, or duplex mismatch.' },
    action: { it: 'Confronta speed/duplex e analizza i contatori incrementali.', en: 'Compare speed/duplex settings and inspect increasing counters.' }
  }
];

const ATTACK_ITEMS = [
  { it: 'IP spoofing e falsificazione dell’indirizzo sorgente', en: 'IP spoofing and source-address forgery' },
  { it: 'SYN flood, UDP flood e reflection/amplification', en: 'SYN floods, UDP floods, and reflection/amplification' },
  { it: 'Sniffing su mezzi condivisi o compromessi', en: 'Sniffing on shared or compromised media' },
  { it: 'Rogue Router Advertisement e Neighbor Discovery spoofing', en: 'Rogue Router Advertisements and Neighbor Discovery spoofing' }
];

const DEFENSE_ITEMS = [
  { it: 'ACL infrastrutturali, uRPF e BCP 38', en: 'Infrastructure ACLs, uRPF, and BCP 38' },
  { it: 'Stateful firewall, SYN cookie e rate limiting', en: 'Stateful firewalls, SYN cookies, and rate limiting' },
  { it: 'Segmentazione, sicurezza degli switch e cifratura', en: 'Segmentation, switch security, and encryption' },
  { it: 'RA Guard, DHCPv6 Guard e monitoraggio ICMPv6', en: 'RA Guard, DHCPv6 Guard, and ICMPv6 monitoring' }
];

function BinaryStrip({ octets, prefix }: { octets: string[]; prefix: number }) {
  let bitIndex = 0;
  return (
    <div className="flex flex-wrap gap-2 font-mono" aria-label="32-bit binary representation">
      {octets.map((octet, octetIndex) => (
        <span key={`${octet}-${octetIndex}`} className="flex overflow-hidden rounded border border-slate-200">
          {octet.split('').map((bit) => {
            const currentIndex = bitIndex++;
            const networkBit = currentIndex < prefix;
            return (
              <span
                key={currentIndex}
                className={`px-1 py-1 text-[11px] ${networkBit ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-50 text-amber-800'}`}
              >
                {bit}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

export default function NetworkFundamentalsLab() {
  const language = useStore((state) => state.language);
  const [address, setAddress] = useState('192.168.10.42');
  const [prefix, setPrefix] = useState(24);
  const [ipv6Address, setIpv6Address] = useState('2001:db8:acad::10/64');
  const [macAddress, setMacAddress] = useState('00:1A:2B:3C:4D:5E');

  const calculation = useMemo(() => {
    try {
      return { subnet: calculateIpv4Subnet(address, prefix), error: false } as const;
    } catch {
      return { subnet: null, error: true } as const;
    }
  }, [address, prefix]);

  const ipv6Calculation = useMemo(() => {
    try {
      return { details: inspectIpv6(ipv6Address), error: false } as const;
    } catch {
      return { details: null, error: true } as const;
    }
  }, [ipv6Address]);

  const eui64Calculation = useMemo(() => {
    try {
      return { value: macToModifiedEui64(macAddress), error: false } as const;
    } catch {
      return { value: null, error: true } as const;
    }
  }, [macAddress]);

  const labels = language === 'it'
    ? {
        title: 'Network Fundamentals Lab', subtitle: 'Indirizzamento IPv4, trasporto, diagnostica e sicurezza — senza punteggi o valutazioni.',
        calculator: 'Esploratore IPv4 e subnetting', address: 'Indirizzo IPv4', prefix: 'Prefisso CIDR', invalid: 'Inserisci un indirizzo IPv4 valido e un prefisso compreso tra /0 e /32.',
        mask: 'Subnet mask', wildcard: 'Wildcard mask', network: 'Indirizzo di rete', broadcast: 'Broadcast', noBroadcast: 'Non applicabile', range: 'Intervallo utilizzabile', hosts: 'Host utilizzabili', total: 'Indirizzi totali', kind: 'Tipo indirizzo',
        binary: 'Rappresentazione binaria', networkBits: 'bit di rete', hostBits: 'bit host', special31: '/31: collegamento point-to-point; entrambi gli indirizzi sono utilizzabili.', special32: '/32: host route; identifica un solo indirizzo.', ipv6: 'Esploratore IPv6', ipv6Address: 'Indirizzo IPv6', ipv6Invalid: 'Inserisci un indirizzo IPv6 valido, con prefisso opzionale tra /0 e /128. È accettata anche la notazione mista con IPv4 incorporato, per esempio ::ffff:192.0.2.1 o 64:ff9b::192.0.2.33.', expanded: 'Forma espansa', compressed: 'Forma compressa', ipv6Type: 'Tipo IPv6', eui64: 'Modified EUI-64', mac: 'MAC address', macInvalid: 'Inserisci un MAC address valido di 48 bit.', interfaceId: 'Interface ID generato', anycast: 'Anycast non possiede un prefisso dedicato: usa un indirizzo unicast assegnato a più interfacce e il routing consegna il traffico all’istanza più vicina.',
        transport: 'TCP e UDP', diagnostics: 'Diagnostica delle interfacce', security: 'Attacchi e difese collegati', cause: 'Possibile causa', action: 'Verifica consigliata'
      }
    : {
        title: 'Network Fundamentals Lab', subtitle: 'IPv4 addressing, transport, diagnostics, and security — without scores or assessment.',
        calculator: 'IPv4 and subnetting explorer', address: 'IPv4 address', prefix: 'CIDR prefix', invalid: 'Enter a valid IPv4 address and a prefix between /0 and /32.',
        mask: 'Subnet mask', wildcard: 'Wildcard mask', network: 'Network address', broadcast: 'Broadcast', noBroadcast: 'Not applicable', range: 'Usable range', hosts: 'Usable hosts', total: 'Total addresses', kind: 'Address type',
        binary: 'Binary representation', networkBits: 'network bits', hostBits: 'host bits', special31: '/31: point-to-point link; both addresses are usable.', special32: '/32: host route; identifies one address.', ipv6: 'IPv6 explorer', ipv6Address: 'IPv6 address', ipv6Invalid: 'Enter a valid IPv6 address, with an optional prefix between /0 and /128. Mixed notation with an embedded IPv4 address is also accepted, for example ::ffff:192.0.2.1 or 64:ff9b::192.0.2.33.', expanded: 'Expanded form', compressed: 'Compressed form', ipv6Type: 'IPv6 type', eui64: 'Modified EUI-64', mac: 'MAC address', macInvalid: 'Enter a valid 48-bit MAC address.', interfaceId: 'Generated interface ID', anycast: 'Anycast has no dedicated prefix: it uses a unicast address assigned to multiple interfaces, and routing delivers traffic to the nearest instance.',
        transport: 'TCP and UDP', diagnostics: 'Interface diagnostics', security: 'Related attacks and defenses', cause: 'Possible cause', action: 'Recommended verification'
      };

  const subnet = calculation.subnet;
  const summary = subnet ? [
    [labels.mask, subnet.subnetMask],
    [labels.wildcard, subnet.wildcardMask],
    [labels.network, `${subnet.networkAddress}/${subnet.prefix}`],
    [labels.broadcast, subnet.hasBroadcast ? subnet.broadcastAddress : labels.noBroadcast],
    [labels.range, `${subnet.firstUsable} – ${subnet.lastUsable}`],
    [labels.hosts, subnet.usableHosts.toLocaleString(language)],
    [labels.total, subnet.totalAddresses.toLocaleString(language)],
    [labels.kind, ADDRESS_KIND_LABELS[subnet.kind][language]]
  ] : [];

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="eyebrow">CCNA 1.4 · 1.5 · 1.6 · 1.7 · 1.8 · 1.9</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{labels.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{labels.subtitle}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="subnet-title">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-indigo-600" />
          <h2 id="subnet-title" className="text-lg font-semibold text-slate-900">{labels.calculator}</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_160px]">
          <label className="space-y-1.5 text-xs font-medium text-slate-600">
            {labels.address}
            <input value={address} onChange={(event) => setAddress(event.target.value)} inputMode="decimal" className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">
            {labels.prefix}
            <input type="number" min={0} max={32} value={prefix} onChange={(event) => setPrefix(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
        </div>

        {calculation.error ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {labels.invalid}
          </div>
        ) : subnet ? (
          <div className="mt-6 space-y-6">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summary.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                  <dd className="mt-1 break-words font-mono text-sm font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Binary className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">{labels.binary}</h3>
              </div>
              <div className="mt-3 space-y-3 overflow-x-auto">
                <BinaryStrip octets={subnet.binaryAddress} prefix={subnet.prefix} />
                <BinaryStrip octets={subnet.binaryMask} prefix={subnet.prefix} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-indigo-100" />{labels.networkBits}: {subnet.prefix}</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-amber-50" />{labels.hostBits}: {32 - subnet.prefix}</span>
              </div>
            </div>

            {subnet.pointToPoint || subnet.hostRoute ? (
              <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-800">
                {subnet.pointToPoint ? labels.special31 : labels.special32}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ipv6-title">
        <div className="flex items-center gap-3">
          <Binary className="h-5 w-5 text-violet-600" />
          <h2 id="ipv6-title" className="text-lg font-semibold text-slate-900">{labels.ipv6}</h2>
        </div>

        <label className="mt-5 block space-y-1.5 text-xs font-medium text-slate-600">
          {labels.ipv6Address}
          <input value={ipv6Address} onChange={(event) => setIpv6Address(event.target.value)} spellCheck={false} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>

        {ipv6Calculation.error ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><AlertTriangle className="h-4 w-4 shrink-0" />{labels.ipv6Invalid}</div>
        ) : ipv6Calculation.details ? (
          <dl className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 md:col-span-2"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labels.expanded}</dt><dd className="mt-1 break-all font-mono text-xs font-semibold text-slate-800">{ipv6Calculation.details.expanded}{ipv6Calculation.details.prefix !== undefined ? `/${ipv6Calculation.details.prefix}` : ''}</dd></div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labels.ipv6Type}</dt><dd className="mt-1 text-xs font-semibold text-slate-800">{IPV6_KIND_LABELS[ipv6Calculation.details.kind][language]}</dd></div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 md:col-span-3"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labels.compressed}</dt><dd className="mt-1 break-all font-mono text-sm font-semibold text-violet-700">{ipv6Calculation.details.compressed}{ipv6Calculation.details.prefix !== undefined ? `/${ipv6Calculation.details.prefix}` : ''}</dd></div>
          </dl>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">{labels.eui64}</h3>
            <label className="mt-3 block space-y-1.5 text-xs font-medium text-slate-600">{labels.mac}<input value={macAddress} onChange={(event) => setMacAddress(event.target.value)} spellCheck={false} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></label>
            {eui64Calculation.error ? <p className="mt-3 text-xs text-rose-700" role="alert">{labels.macInvalid}</p> : <p className="mt-3 text-xs text-slate-500">{labels.interfaceId}: <code className="font-semibold text-violet-700">{eui64Calculation.value}</code></p>}
          </div>
          <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-4">
            <h3 className="text-sm font-semibold text-violet-900">Anycast</h3>
            <p className="mt-2 text-xs leading-relaxed text-violet-900/80">{labels.anycast}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="transport-title">
        <h2 id="transport-title" className="text-lg font-semibold text-slate-900">{labels.transport}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-xs">
            <thead><tr className="border-b border-slate-200 text-slate-400"><th className="p-3">{language === 'it' ? 'Proprietà' : 'Property'}</th><th className="p-3 text-indigo-600">TCP</th><th className="p-3 text-amber-600">UDP</th></tr></thead>
            <tbody>{TRANSPORT_ROWS.map(row => <tr key={row.property.en} className="border-b border-slate-100 align-top"><th className="p-3 font-semibold text-slate-700">{row.property[language]}</th><td className="p-3 leading-relaxed text-slate-600">{row.tcp[language]}</td><td className="p-3 leading-relaxed text-slate-600">{row.udp[language]}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="diagnostics-title">
        <div className="flex items-center gap-3"><Cable className="h-5 w-5 text-sky-600" /><h2 id="diagnostics-title" className="text-lg font-semibold text-slate-900">{labels.diagnostics}</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {INTERFACE_STATES.map(item => <article key={item.state} className="rounded-lg border border-slate-200 p-4"><code className="text-xs font-semibold text-sky-700">{item.state}</code><p className="mt-3 text-xs leading-relaxed text-slate-600"><strong>{labels.cause}:</strong> {item.cause[language]}</p><p className="mt-2 text-xs leading-relaxed text-slate-600"><strong>{labels.action}:</strong> {item.action[language]}</p></article>)}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>show ip interface brief{`\n`}show interfaces{`\n`}show interfaces counters errors{`\n`}show controllers ethernet-controller</code></pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="security-title">
        <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-600" /><h2 id="security-title" className="text-lg font-semibold text-slate-900">{labels.security}</h2></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border border-rose-100 bg-rose-50/50 p-4"><h3 className="text-sm font-semibold text-rose-800">{language === 'it' ? 'Superficie di attacco' : 'Attack surface'}</h3><ul className="mt-3 space-y-2 text-xs leading-relaxed text-rose-900/80">{ATTACK_ITEMS.map(item => <li key={item.en}>• {item[language]}</li>)}</ul></article>
          <article className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4"><h3 className="text-sm font-semibold text-emerald-800">{language === 'it' ? 'Difese correlate' : 'Related defenses'}</h3><ul className="mt-3 space-y-2 text-xs leading-relaxed text-emerald-900/80">{DEFENSE_ITEMS.map(item => <li key={item.en}>• {item[language]}</li>)}</ul></article>
        </div>
      </section>
    </div>
  );
}
