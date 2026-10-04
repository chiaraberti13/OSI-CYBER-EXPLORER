import { useMemo, useState } from 'react';
import { Clock3, Database, Gauge, Network, ShieldCheck, Terminal, TriangleAlert } from 'lucide-react';
import {
  calculateNtpMetrics,
  createPatTranslation,
  dscpName,
  isSyslogForwarded,
  syslogSeverityName
} from '../lib/ipServices';
import { useStore } from '../store';
import DhcpFlowLab from './DhcpFlowLab';
import ResponsiveTable from './ResponsiveTable';
import {
  DHCP_STEPS,
  DNS_RECORDS,
  SYSLOG_LEVELS,
  CLIENT_SERVICE_ROLES,
  SERVICE_CONCEPTS,
  QOS_MECHANISMS,
  SECURITY_ROWS,
  DHCP_NAT_CONFIG,
  MANAGEMENT_CONFIG,
} from '../content/ipServicesLab';


function SectionTitle({ icon: Icon, title, id }: { icon: typeof Network; title: string; id: string }) {
  return <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-indigo-600" /><h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2></div>;
}

export default function IpServicesLab() {
  const language = useStore(state => state.language);
  const [insideIp, setInsideIp] = useState('10.10.10.42');
  const [sourcePort, setSourcePort] = useState(49152);
  const [simulateCollision, setSimulateCollision] = useState(false);
  const [ntpTimes, setNtpTimes] = useState({ t1: 1000, t2: 1050, t3: 1060, t4: 1100 });
  const [syslogMessage, setSyslogMessage] = useState(4);
  const [syslogThreshold, setSyslogThreshold] = useState(5);
  const [dscp, setDscp] = useState(46);

  const pat = useMemo(() => {
    try {
      const occupied = simulateCollision ? new Set([sourcePort, 1024]) : new Set<number>();
      return { value: createPatTranslation(insideIp, sourcePort, '198.51.100.10', occupied), error: false } as const;
    } catch {
      return { value: null, error: true } as const;
    }
  }, [insideIp, sourcePort, simulateCollision]);

  const ntp = useMemo(() => {
    try {
      return calculateNtpMetrics(ntpTimes.t1, ntpTimes.t2, ntpTimes.t3, ntpTimes.t4);
    } catch {
      return null;
    }
  }, [ntpTimes]);

  const t = language === 'it'
    ? {
        title: 'IP Services Lab', subtitle: 'Segui i servizi che rendono operativa una rete, osserva il loro stato e collega ogni abuso alla difesa corretta.',
        dhcp: 'DHCP e relay', relay: 'Il relay converte il broadcast client in unicast verso il server e inserisce giaddr per identificare la subnet di origine.',
        clientRoles: 'DHCP e DNS dal punto di vista del client', phase: 'Aspetto',
        clientRolesNote: 'DHCP e DNS non si sostituiscono a vicenda: il primo dà all’host i parametri per comunicare, il secondo gli dice con chi. Distinguerli è ciò che permette di separare un guasto di rete da un guasto di servizio.',
        dns: 'DNS e cache', dnsFlow: 'Un resolver ricorsivo interroga root, TLD e server autoritativo quando non possiede una risposta valida in cache. Il TTL limita per quanto tempo il record può essere riutilizzato.',
        nat: 'NAT/PAT explorer', inside: 'Inside local IPv4', port: 'Porta sorgente', collision: 'Simula una collisione della porta pubblica', invalidNat: 'Inserisci IPv4 e porta validi.', localTuple: 'Inside local', globalTuple: 'Inside global', preserved: 'Porta preservata', portRange: 'Range di allocazione', natNote: 'PAT distingue i flussi con protocollo e porte. La porta tradotta resta nello stesso range dell’originale (1-511, 512-1023, 1024-65535): un host che sorgente da una porta well-known può esaurire il proprio range mentre quello dinamico è ancora libero. PAT non cifra il traffico, non autentica gli endpoint e non sostituisce un firewall stateful.',
        timing: 'NTP: offset e delay', timestamp: 'Timestamp', offset: 'Offset stimato', delay: 'Round-trip delay', invalidTime: 'I timestamp devono essere coerenti e crescenti per ciascun tratto.',
        telemetry: 'Syslog, SNMP e telemetria', messageSeverity: 'Severità del messaggio', threshold: 'Soglia logging trap', forwarded: 'Inoltrato', discarded: 'Escluso dalla soglia', syslogRule: 'In Syslog 0 è il livello più grave e 7 il più dettagliato. Una soglia include il proprio livello e tutti quelli numericamente inferiori.', concepts: 'Ridondanza, gestione e trasferimento file',
        qos: 'QoS e DSCP', dscp: 'Code point DSCP (0–63)', qosName: 'Classe riconosciuta', qosText: 'QoS non crea banda: stabilisce quale traffico riceve un trattamento differente quando le risorse sono contese.',
        security: 'Matrice attacco–difesa dei servizi', service: 'Servizio', attack: 'Attacco e impatto', defense: 'Difesa appropriata e limite', verify: 'Verifica', config: 'Configurazioni IOS di riferimento', configNote: 'Adatta indirizzi, interfacce, algoritmi e sintassi alla piattaforma. I placeholder delle credenziali non devono essere inseriti letteralmente.'
      }
    : {
        title: 'IP Services Lab', subtitle: 'Follow the services that make a network operational, observe their state, and connect each abuse to the appropriate defense.',
        dhcp: 'DHCP and relay', relay: 'The relay converts the client broadcast into unicast toward the server and inserts giaddr to identify the source subnet.',
        clientRoles: 'DHCP and DNS from the client’s point of view', phase: 'Aspect',
        clientRolesNote: 'DHCP and DNS do not replace each other: the first gives the host the parameters to communicate, the second tells it with whom. Keeping them apart is what separates a network fault from a service fault.',
        dns: 'DNS and caching', dnsFlow: 'A recursive resolver queries root, TLD, and authoritative servers when it lacks a valid cached answer. The TTL limits how long the record may be reused.',
        nat: 'NAT/PAT explorer', inside: 'Inside local IPv4', port: 'Source port', collision: 'Simulate a public-port collision', invalidNat: 'Enter a valid IPv4 address and port.', localTuple: 'Inside local', globalTuple: 'Inside global', preserved: 'Port preserved', portRange: 'Allocation range', natNote: 'PAT distinguishes flows with protocol and ports. A translated port stays inside the same range as the original one (1-511, 512-1023, 1024-65535): a host sourcing from a well-known port can exhaust its own range while the dynamic range is still free. PAT does not encrypt traffic, authenticate endpoints, or replace a stateful firewall.',
        timing: 'NTP: offset and delay', timestamp: 'Timestamp', offset: 'Estimated offset', delay: 'Round-trip delay', invalidTime: 'Timestamps must be coherent and increase across each leg.',
        telemetry: 'Syslog, SNMP, and telemetry', messageSeverity: 'Message severity', threshold: 'Logging trap threshold', forwarded: 'Forwarded', discarded: 'Excluded by threshold', syslogRule: 'In Syslog, 0 is the most severe level and 7 the most detailed. A threshold includes its own level and every numerically lower level.', concepts: 'Redundancy, management, and file transfer',
        qos: 'QoS and DSCP', dscp: 'DSCP code point (0–63)', qosName: 'Recognized class', qosText: 'QoS does not create bandwidth: it determines which traffic receives differentiated treatment when resources are contended.',
        security: 'Service attack–defense matrix', service: 'Service', attack: 'Attack and impact', defense: 'Appropriate defense and limitation', verify: 'Verification', config: 'Reference IOS configurations', configNote: 'Adapt addresses, interfaces, algorithms, and syntax to the platform. Credential placeholders must not be entered literally.'
      };

  const syslogSent = isSyslogForwarded(syslogMessage, syslogThreshold);
  let dscpLabel = '—';
  try { dscpLabel = dscpName(dscp); } catch { /* invalid input is rendered as an em dash */ }

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><p className="eyebrow">CCNA 4.1 · 4.2 · 4.3 · 4.4 · 4.5 · 4.6 · 4.7 · 4.8 · 4.9</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p></header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="dhcp-title"><SectionTitle icon={Network} title={t.dhcp} id="dhcp-title" /><ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{DHCP_STEPS.map((step, index) => <li key={step.acronym} className="rounded-lg border border-slate-200 p-4"><span className="font-mono text-[10px] text-indigo-600">{index + 1} · {step.direction}</span><h3 className="mt-2 text-sm font-semibold text-slate-900">{step.acronym}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{step.detail[language]}</p></li>)}</ol><p className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">{t.relay}</p></section>

      <DhcpFlowLab />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="dns-title"><SectionTitle icon={Database} title={t.dns} id="dns-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.dnsFlow}</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{DNS_RECORDS.map(record => <article key={record.type} className="rounded-lg border border-slate-200 p-3"><h3 className="font-mono text-sm font-semibold text-indigo-700">{record.type}</h3><p className="mt-1.5 text-xs text-slate-600">{record.purpose[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="client-roles-title">
        <SectionTitle icon={Database} title={t.clientRoles} id="client-roles-title" />
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{t.clientRolesNote}</p>
        <div className="mt-4"><ResponsiveTable
          rows={CLIENT_SERVICE_ROLES}
          rowKey={row => row.phase.en}
          label={t.clientRoles}
          minWidth={820}
          columns={[
            { id: 'phase', header: t.phase, heading: true, cell: row => row.phase[language] },
            { id: 'dhcp', header: 'DHCP', headerClassName: 'text-indigo-600', cell: row => row.dhcp[language] },
            { id: 'dns', header: 'DNS', headerClassName: 'text-emerald-700', cell: row => row.dns[language] }
          ]}
        /></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="nat-title"><SectionTitle icon={Network} title={t.nat} id="nat-title" /><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="space-y-1.5 text-xs text-slate-600">{t.inside}<input value={insideIp} onChange={event => setInsideIp(event.target.value)} inputMode="decimal" className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1.5 text-xs text-slate-600">{t.port}<input type="number" min={1} max={65535} value={sourcePort} onChange={event => setSourcePort(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label></div><label className="mt-4 flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={simulateCollision} onChange={event => setSimulateCollision(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />{t.collision}</label>{pat.error ? <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalidNat}</p> : <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.localTuple}</dt><dd className="mt-1 font-mono text-sm">{pat.value?.insideLocal}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.globalTuple}</dt><dd className="mt-1 font-mono text-sm">{pat.value?.insideGlobal}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.portRange}</dt><dd className="mt-1 font-mono text-sm">{pat.value ? `${pat.value.portRange[0]}-${pat.value.portRange[1]}` : '—'}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.preserved}</dt><dd className="mt-1 text-sm font-semibold">{pat.value?.preservedPort ? '✓' : '✗'}</dd></div></dl>}<p className="mt-4 text-xs leading-relaxed text-slate-600">{t.natNote}</p></section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ntp-title"><SectionTitle icon={Clock3} title={t.timing} id="ntp-title" /><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{(['t1', 't2', 't3', 't4'] as const).map(key => <label key={key} className="space-y-1 text-xs text-slate-600">{t.timestamp} {key.toUpperCase()}<input type="number" value={ntpTimes[key]} onChange={event => setNtpTimes(current => ({ ...current, [key]: Number(event.target.value) }))} className="block w-full rounded-lg border border-slate-200 px-2 py-2 font-mono text-xs" /></label>)}</div>{ntp ? <div className="mt-4 flex flex-wrap gap-3"><span className="rounded-md bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800">{t.offset}: {ntp.offsetMs} ms</span><span className="rounded-md bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">{t.delay}: {ntp.delayMs} ms</span></div> : <p className="mt-4 text-xs text-rose-700" role="alert">{t.invalidTime}</p>}</article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="telemetry-title"><SectionTitle icon={Terminal} title={t.telemetry} id="telemetry-title" /><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs text-slate-600">{t.messageSeverity}<select value={syslogMessage} onChange={event => setSyslogMessage(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-2 font-mono text-xs">{SYSLOG_LEVELS.map(level => <option key={level} value={level}>{level} · {syslogSeverityName(level)}</option>)}</select></label><label className="space-y-1 text-xs text-slate-600">{t.threshold}<select value={syslogThreshold} onChange={event => setSyslogThreshold(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-2 font-mono text-xs">{SYSLOG_LEVELS.map(level => <option key={level} value={level}>{level} · {syslogSeverityName(level)}</option>)}</select></label></div><p className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${syslogSent ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{syslogSent ? t.forwarded : t.discarded}</p><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.syslogRule}</p></article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="service-concepts-title"><SectionTitle icon={Terminal} title={t.concepts} id="service-concepts-title" /><div className="mt-4 grid gap-3 md:grid-cols-2">{SERVICE_CONCEPTS.map(item => <article key={item.title} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{item.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="qos-title"><SectionTitle icon={Gauge} title={t.qos} id="qos-title" /><div className="mt-4 flex flex-wrap items-end gap-4"><label className="w-56 space-y-1.5 text-xs text-slate-600">{t.dscp}<input type="number" min={0} max={63} value={dscp} onChange={event => setDscp(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><div className="rounded-lg bg-indigo-50 px-4 py-3"><p className="text-[10px] uppercase text-indigo-500">{t.qosName}</p><p className="mt-1 font-mono text-sm font-semibold text-indigo-800">{dscpLabel}</p></div></div><p className="mt-4 text-xs leading-relaxed text-slate-600">{t.qosText}</p><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{QOS_MECHANISMS.map(item => <article key={item.title} className="rounded-lg border border-slate-200 p-3"><h3 className="text-xs font-semibold text-slate-900">{item.title}</h3><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="services-security-title"><SectionTitle icon={ShieldCheck} title={t.security} id="services-security-title" /><div className="mt-4"><ResponsiveTable
          rows={SECURITY_ROWS}
          rowKey={(row, index) => `${row.service}-${index}`}
          label={t.security}
          breakpoint="xl"
          minWidth={980}
          columns={[
            { id: 'service', header: t.service, heading: true, cellClassName: 'text-indigo-700', cell: row => row.service },
            { id: 'attack', header: t.attack, cellClassName: 'text-rose-800', cell: row => row.attack[language] },
            { id: 'defense', header: t.defense, cellClassName: 'text-emerald-800', cell: row => row.defense[language] },
            { id: 'verify', header: t.verify, cell: row => <code className="text-[11px] text-slate-700">{row.verify}</code> }
          ]}
        /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="services-config-title"><SectionTitle icon={Terminal} title={t.config} id="services-config-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.configNote}</p><div className="mt-4 grid gap-4 xl:grid-cols-2"><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{DHCP_NAT_CONFIG[language]}</code></pre><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-300"><code>{MANAGEMENT_CONFIG}</code></pre></div></section>
    </div>
  );
}
