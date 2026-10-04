import { useMemo, useState } from 'react';
import { AlertTriangle, Binary, Cable, Calculator, Laptop, Network, Router, Server, ShieldCheck, Workflow } from 'lucide-react';
import { calculateIpv4Subnet } from '../lib/ipv4';
import { INTERACTIVE_INPUT_LIMITS, inputErrorMessage, parseIpv4Subnet } from '../lib/inputValidation';
import { inspectIpv6, macToModifiedEui64 } from '../lib/ipv6';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';
import MtuLab from './MtuLab';
import VlsmPlanner from './VlsmPlanner';
import { CABLING_TYPES, NETWORK_COMPONENTS, TOPOLOGY_ARCHITECTURES } from '../content/networkConcepts';
import {
  ADDRESS_KIND_LABELS,
  IPV6_KIND_LABELS,
  TRANSPORT_ROWS,
  INTERFACE_STATES,
  SWITCHING_CONCEPTS,
  VIRTUALIZATION_ROWS,
  CLIENT_IP_COMMANDS,
  CLIENT_IP_SYMPTOMS,
  ATTACK_ITEMS,
  DEFENSE_ITEMS,
} from '../content/networkFundamentalsLab';


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
  const [prefix, setPrefix] = useState('24');
  const [ipv6Address, setIpv6Address] = useState('2001:db8:acad::10/64');
  const [macAddress, setMacAddress] = useState('00:1A:2B:3C:4D:5E');

  const calculation = useMemo(() => {
    try {
      const validated = parseIpv4Subnet(address, prefix);
      return { subnet: calculateIpv4Subnet(validated.address, validated.prefix), error: null } as const;
    } catch (error) {
      return { subnet: null, error } as const;
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
        transport: 'TCP e UDP', diagnostics: 'Diagnostica delle interfacce', security: 'Attacchi e difese collegati', cause: 'Possibile causa', action: 'Verifica consigliata',
        switching: 'Concetti di switching', switchingNote: 'Uno switch prende una sola decisione per frame, e la prende sul MAC di destinazione: inoltrare su una porta, filtrare o fare flooding. Tutto il resto — VLAN, STP, Port Security — serve a delimitare dove quella decisione può avere effetto.',
        virtualization: 'Virtualizzazione: server, container e VRF', virtualizationImpact: 'Effetto sulla rete',
        clientIp: 'Verifica dei parametri IP sul client', clientRead: 'Cosa leggere', clientSymptoms: 'Sintomi e interpretazione', clientNote: 'Prima di sospettare la rete, leggi i quattro parametri che l’host possiede davvero: indirizzo, mask, gateway e DNS. Tre quarti dei problemi “di rete” si chiudono qui.',
        components: 'Componenti di rete e decisione che prendono', componentsNote: 'Ogni apparato prende una sola decisione per ogni unità di traffico. Sapere quale è, e quale confine crea, spiega in anticipo perché una configurazione funziona o no.',
        decision: 'Decisione che prende', boundary: 'Confine che crea', notThis: 'Ciò che NON fa',
        topology: 'Architetture di topologia', shape: 'Com’è fatta', whenToUse: 'Quando si usa', tradeOff: 'Compromesso',
        cabling: 'Interfacce fisiche e cablaggio', medium: 'Come funziona il mezzo', reach: 'Portata', useCase: 'Dove si usa', trap: 'Trappola d’esame'
      }
    : {
        title: 'Network Fundamentals Lab', subtitle: 'IPv4 addressing, transport, diagnostics, and security — without scores or assessment.',
        calculator: 'IPv4 and subnetting explorer', address: 'IPv4 address', prefix: 'CIDR prefix', invalid: 'Enter a valid IPv4 address and a prefix between /0 and /32.',
        mask: 'Subnet mask', wildcard: 'Wildcard mask', network: 'Network address', broadcast: 'Broadcast', noBroadcast: 'Not applicable', range: 'Usable range', hosts: 'Usable hosts', total: 'Total addresses', kind: 'Address type',
        binary: 'Binary representation', networkBits: 'network bits', hostBits: 'host bits', special31: '/31: point-to-point link; both addresses are usable.', special32: '/32: host route; identifies one address.', ipv6: 'IPv6 explorer', ipv6Address: 'IPv6 address', ipv6Invalid: 'Enter a valid IPv6 address, with an optional prefix between /0 and /128. Mixed notation with an embedded IPv4 address is also accepted, for example ::ffff:192.0.2.1 or 64:ff9b::192.0.2.33.', expanded: 'Expanded form', compressed: 'Compressed form', ipv6Type: 'IPv6 type', eui64: 'Modified EUI-64', mac: 'MAC address', macInvalid: 'Enter a valid 48-bit MAC address.', interfaceId: 'Generated interface ID', anycast: 'Anycast has no dedicated prefix: it uses a unicast address assigned to multiple interfaces, and routing delivers traffic to the nearest instance.',
        transport: 'TCP and UDP', diagnostics: 'Interface diagnostics', security: 'Related attacks and defenses', cause: 'Possible cause', action: 'Recommended verification',
        switching: 'Switching concepts', switchingNote: 'A switch makes a single decision per frame, and makes it on the destination MAC: forward out one port, filter, or flood. Everything else — VLANs, STP, Port Security — exists to bound where that decision can take effect.',
        virtualization: 'Virtualization: servers, containers, and VRFs', virtualizationImpact: 'Network impact',
        clientIp: 'Verifying IP parameters on the client', clientRead: 'What to read', clientSymptoms: 'Symptoms and interpretation', clientNote: 'Before suspecting the network, read the four parameters the host actually holds: address, mask, gateway, and DNS. Three quarters of “network” problems end here.',
        components: 'Network components and the decision they make', componentsNote: 'Every device makes a single decision per unit of traffic. Knowing which one it is, and which boundary it creates, explains in advance why a configuration works or does not.',
        decision: 'Decision it makes', boundary: 'Boundary it creates', notThis: 'What it does NOT do',
        topology: 'Topology architectures', shape: 'What it looks like', whenToUse: 'When it is used', tradeOff: 'Trade-off',
        cabling: 'Physical interfaces and cabling', medium: 'How the medium works', reach: 'Reach', useCase: 'Where it is used', trap: 'Exam trap'
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
        <p className="eyebrow">CCNA 1.1 → 1.10 · 1.12 · 1.13</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{labels.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{labels.subtitle}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="components-title">
        <div className="flex items-center gap-3"><Router className="h-5 w-5 text-indigo-600" /><h2 id="components-title" className="text-lg font-semibold text-slate-900">{labels.components}</h2></div>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{labels.componentsNote}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {NETWORK_COMPONENTS.map(component => (
            <article key={component.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{component.name[language]}</h3>
                <span className="eyebrow shrink-0">{component.layer}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600"><strong className="text-slate-700">{labels.decision}:</strong> {component.decision[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-sky-900"><strong>{labels.boundary}:</strong> {component.boundary[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-900"><strong>{labels.notThis}:</strong> {component.notThis[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="topology-title">
        <div className="flex items-center gap-3"><Workflow className="h-5 w-5 text-violet-600" /><h2 id="topology-title" className="text-lg font-semibold text-slate-900">{labels.topology}</h2></div>
        <div className="mt-4">
          <ResponsiveTable
            rows={TOPOLOGY_ARCHITECTURES}
            rowKey={row => row.id}
            label={labels.topology}
            minWidth={880}
            columns={[
              { id: 'name', header: labels.topology, heading: true, cell: row => row.name[language] },
              { id: 'shape', header: labels.shape, cell: row => row.shape[language] },
              { id: 'when', header: labels.whenToUse, cell: row => row.whenToUse[language] },
              { id: 'tradeoff', header: labels.tradeOff, cellClassName: 'text-amber-900', cell: row => row.tradeOff[language] }
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="cabling-title">
        <div className="flex items-center gap-3"><Cable className="h-5 w-5 text-sky-600" /><h2 id="cabling-title" className="text-lg font-semibold text-slate-900">{labels.cabling}</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CABLING_TYPES.map(cable => (
            <article key={cable.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{cable.name[language]}</h3>
                <span className="eyebrow min-w-0">{typeof cable.reach === 'string' ? cable.reach : cable.reach[language]}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{cable.medium[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600"><strong className="text-slate-700">{labels.useCase}:</strong> {cable.useCase[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-900"><strong>{labels.trap}:</strong> {cable.trap[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="subnet-title">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-indigo-600" />
          <h2 id="subnet-title" className="text-lg font-semibold text-slate-900">{labels.calculator}</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_160px]">
          <label className="space-y-1.5 text-xs font-medium text-slate-600">
            {labels.address}
            <input value={address} maxLength={INTERACTIVE_INPUT_LIMITS.ipv4Characters + 1} onChange={(event) => setAddress(event.target.value)} inputMode="decimal" aria-invalid={calculation.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">
            {labels.prefix}
            <input inputMode="numeric" value={prefix} maxLength={2} onChange={(event) => setPrefix(event.target.value)} aria-invalid={calculation.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
        </div>

        {calculation.error ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {inputErrorMessage(calculation.error, language)}
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

      <VlsmPlanner />

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

      <MtuLab />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="transport-title">
        <h2 id="transport-title" className="text-lg font-semibold text-slate-900">{labels.transport}</h2>
        <div className="mt-4">
          <ResponsiveTable
            rows={TRANSPORT_ROWS}
            rowKey={row => row.property.en}
            label={labels.transport}
            breakpoint="md"
            minWidth={620}
            columns={[
              { id: 'property', header: language === 'it' ? 'Proprietà' : 'Property', heading: true, cell: row => row.property[language] },
              { id: 'tcp', header: 'TCP', headerClassName: 'text-indigo-600', cell: row => row.tcp[language] },
              { id: 'udp', header: 'UDP', headerClassName: 'text-amber-600', cell: row => row.udp[language] }
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="diagnostics-title">
        <div className="flex items-center gap-3"><Cable className="h-5 w-5 text-sky-600" /><h2 id="diagnostics-title" className="text-lg font-semibold text-slate-900">{labels.diagnostics}</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {INTERFACE_STATES.map(item => <article key={item.state} className="rounded-lg border border-slate-200 p-4"><code className="text-xs font-semibold text-sky-700">{item.state}</code><p className="mt-3 text-xs leading-relaxed text-slate-600"><strong>{labels.cause}:</strong> {item.cause[language]}</p><p className="mt-2 text-xs leading-relaxed text-slate-600"><strong>{labels.action}:</strong> {item.action[language]}</p></article>)}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>show ip interface brief{`\n`}show interfaces{`\n`}show interfaces counters errors{`\n`}show controllers ethernet-controller</code></pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="switching-title">
        <div className="flex items-center gap-3"><Network className="h-5 w-5 text-indigo-600" /><h2 id="switching-title" className="text-lg font-semibold text-slate-900">{labels.switching}</h2></div>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{labels.switchingNote}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SWITCHING_CONCEPTS.map(item => <article key={item.title.en} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{item.title[language]}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>show mac address-table dynamic{`\n`}show mac address-table count{`\n`}show mac address-table aging-time{`\n`}show interfaces status</code></pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="virtualization-title">
        <div className="flex items-center gap-3"><Server className="h-5 w-5 text-violet-600" /><h2 id="virtualization-title" className="text-lg font-semibold text-slate-900">{labels.virtualization}</h2></div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {VIRTUALIZATION_ROWS.map(item => (
            <article key={item.title.en} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.title[language]}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p>
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-violet-900"><strong>{labels.virtualizationImpact}:</strong> {item.network[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="client-ip-title">
        <div className="flex items-center gap-3"><Laptop className="h-5 w-5 text-sky-600" /><h2 id="client-ip-title" className="text-lg font-semibold text-slate-900">{labels.clientIp}</h2></div>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{labels.clientNote}</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {CLIENT_IP_COMMANDS.map(item => (
            <article key={item.os} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.os}</h3>
              <pre className="mt-2 overflow-x-auto rounded-md bg-slate-950 p-3 text-[11px] leading-relaxed text-sky-300"><code>{item.commands}</code></pre>
              <p className="mt-3 text-xs leading-relaxed text-slate-600"><strong>{labels.clientRead}:</strong> {item.read[language]}</p>
            </article>
          ))}
        </div>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">{labels.clientSymptoms}</h3>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {CLIENT_IP_SYMPTOMS.map(item => {
            const symptom = typeof item.symptom === 'string' ? item.symptom : item.symptom[language];
            return <article key={typeof item.symptom === 'string' ? item.symptom : item.symptom.en} className="rounded-lg border border-slate-200 p-4"><code className="text-xs font-semibold text-sky-700">{symptom}</code><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.meaning[language]}</p></article>;
          })}
        </div>
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
