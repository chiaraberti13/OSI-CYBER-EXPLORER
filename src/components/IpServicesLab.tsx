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

type Language = 'it' | 'en';
type Localized = Record<Language, string>;

const DHCP_STEPS: Array<{ acronym: string; direction: string; detail: Localized }> = [
  { acronym: 'D · Discover', direction: 'client → broadcast', detail: { it: 'Il client senza indirizzo cerca server DHCP usando UDP 68→67.', en: 'A client without an address searches for DHCP servers using UDP 68→67.' } },
  { acronym: 'O · Offer', direction: 'server → client', detail: { it: 'Il server propone indirizzo, mask, gateway, DNS e durata del lease.', en: 'The server offers an address, mask, gateway, DNS, and lease duration.' } },
  { acronym: 'R · Request', direction: 'client → broadcast', detail: { it: 'Il client identifica l’offerta scelta e richiede formalmente l’indirizzo.', en: 'The client identifies the selected offer and formally requests the address.' } },
  { acronym: 'A · Acknowledge', direction: 'server → client', detail: { it: 'Il server conferma lease e opzioni; un NAK rifiuta una richiesta non valida.', en: 'The server confirms the lease and options; a NAK rejects an invalid request.' } }
];

const DNS_RECORDS: Array<{ type: string; purpose: Localized }> = [
  { type: 'A', purpose: { it: 'Nome → indirizzo IPv4', en: 'Name → IPv4 address' } },
  { type: 'AAAA', purpose: { it: 'Nome → indirizzo IPv6', en: 'Name → IPv6 address' } },
  { type: 'CNAME', purpose: { it: 'Alias → nome canonico', en: 'Alias → canonical name' } },
  { type: 'MX', purpose: { it: 'Server di posta e preferenza', en: 'Mail server and preference' } },
  { type: 'PTR', purpose: { it: 'Risoluzione inversa indirizzo → nome', en: 'Reverse lookup address → name' } },
  { type: 'TXT', purpose: { it: 'Testo, verifica e policy come SPF/DMARC', en: 'Text, verification, and policies such as SPF/DMARC' } },
  { type: 'SRV', purpose: { it: 'Localizzazione di un servizio e relativa porta', en: 'Service location and associated port' } }
];

const SYSLOG_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

const SERVICE_CONCEPTS: Array<{ title: string; detail: Localized }> = [
  { title: 'HSRP / FHRP', detail: { it: 'Gli host usano un gateway virtuale. Un router è Active e uno Standby; priorità, preempt e object tracking controllano il failover. VRRP è uno standard aperto con terminologia Master/Backup.', en: 'Hosts use a virtual gateway. One router is Active and another Standby; priority, preempt, and object tracking control failover. VRRP is an open standard using Master/Backup terminology.' } },
  { title: 'SNMP manager · agent · MIB', detail: { it: 'Il manager legge o modifica oggetti dell’agent tramite OID. Trap è una notifica non confermata; Inform richiede conferma ed è più affidabile ma genera più overhead.', en: 'The manager reads or changes agent objects through OIDs. A Trap is unacknowledged; an Inform requires acknowledgment and is more reliable but creates more overhead.' } },
  { title: 'TFTP · FTP', detail: { it: 'TFTP usa UDP/69, non autentica e non cifra. FTP usa TCP/21 più una connessione dati, ma credenziali e contenuti restano in chiaro. Preferisci SCP, SFTP o HTTPS per trasferimenti protetti.', en: 'TFTP uses UDP/69 with no authentication or encryption. FTP uses TCP/21 plus a data connection, but credentials and content remain cleartext. Prefer SCP, SFTP, or HTTPS for protected transfers.' } },
  { title: 'SSH', detail: { it: 'SSHv2 fornisce cifratura, integrità e autenticazione per la gestione CLI. La sicurezza dipende anche da AAA, chiavi, management plane isolato e autorizzazioni minime.', en: 'SSHv2 provides encryption, integrity, and authentication for CLI management. Security also depends on AAA, keys, an isolated management plane, and least privilege.' } }
];

const QOS_MECHANISMS: Array<{ title: string; detail: Localized }> = [
  { title: 'Classification & marking', detail: { it: 'Identifica il traffico e imposta CoS/DSCP; la trust boundary stabilisce dove una marcatura può essere accettata.', en: 'Identifies traffic and sets CoS/DSCP; the trust boundary determines where a marking may be accepted.' } },
  { title: 'CBWFQ / LLQ', detail: { it: 'CBWFQ assegna banda alle classi; LLQ aggiunge una coda a priorità stretta, normalmente sottoposta a policing per evitare starvation.', en: 'CBWFQ assigns bandwidth to classes; LLQ adds strict priority, normally policed to prevent starvation.' } },
  { title: 'Policing', detail: { it: 'Applica un limite senza bufferizzare: il traffico eccedente viene scartato o rimarcato. Può produrre burst e ritrasmissioni.', en: 'Enforces a rate without buffering: excess traffic is dropped or remarked. It may produce bursts and retransmissions.' } },
  { title: 'Shaping', detail: { it: 'Bufferizza e ritarda il traffico eccedente per rispettare una velocità media; aumenta la latenza ma rende il flusso più regolare.', en: 'Buffers and delays excess traffic to meet an average rate; it adds latency but creates a smoother flow.' } },
  { title: 'WRED', detail: { it: 'Scarta probabilisticamente prima che la coda sia piena, soprattutto per segnalare congestione ai flussi TCP; non sostituisce la capacità.', en: 'Drops probabilistically before a queue fills, mainly to signal congestion to TCP flows; it does not replace capacity.' } }
];

const SECURITY_ROWS: Array<{ service: string; attack: Localized; defense: Localized; verify: string }> = [
  { service: 'DHCP', attack: { it: 'Starvation del pool e rogue DHCP con gateway/DNS malevoli.', en: 'Pool starvation and rogue DHCP offering malicious gateway/DNS settings.' }, defense: { it: 'DHCP Snooping, trust solo verso il server, rate limit client, Port Security e binding monitorati.', en: 'DHCP Snooping, trust only toward the server, client rate limits, Port Security, and monitored bindings.' }, verify: 'show ip dhcp snooping' },
  { service: 'DNS', attack: { it: 'Cache poisoning e risposte falsificate che dirottano la risoluzione.', en: 'Cache poisoning and forged replies that redirect resolution.' }, defense: { it: 'DNSSEC valida autenticità e integrità dei dati firmati; randomizzazione e resolver aggiornati riducono spoofing, ma DNSSEC non cifra le query.', en: 'DNSSEC validates authenticity and integrity of signed data; randomization and updated resolvers reduce spoofing, but DNSSEC does not encrypt queries.' }, verify: 'dig +dnssec <name>' },
  { service: 'DNS', attack: { it: 'Amplification/reflection tramite resolver ricorsivi aperti e query con risposta grande.', en: 'Amplification/reflection through open recursive resolvers and queries with large responses.' }, defense: { it: 'Niente open recursion, response-rate limiting, BCP 38 e capacità DDoS a monte.', en: 'No open recursion, response-rate limiting, BCP 38, and upstream DDoS capacity.' }, verify: 'show platform hardware qfp active statistics drop' },
  { service: 'DNS', attack: { it: 'DNS tunneling per comando, controllo o esfiltrazione nei sottodomini.', en: 'DNS tunneling for command and control or data exfiltration in subdomains.' }, defense: { it: 'Resolver aziendali obbligatori, logging, analisi di entropia/volume, allowlist e DNS firewall/RPZ.', en: 'Enforced enterprise resolvers, logging, entropy/volume analysis, allowlists, and DNS firewall/RPZ.' }, verify: 'resolver query logs' },
  { service: 'NAT/PAT', attack: { it: 'Esaurimento delle traduzioni con molte sessioni o porte.', en: 'Translation exhaustion through excessive sessions or ports.' }, defense: { it: 'Timeout coerenti, limiti di sessione, firewall stateful e monitoraggio della tabella. NAT da solo non è un controllo di sicurezza.', en: 'Appropriate timeouts, session limits, a stateful firewall, and table monitoring. NAT alone is not a security control.' }, verify: 'show ip nat statistics' },
  { service: 'FHRP', attack: { it: 'Messaggi HSRP/VRRP falsificati tentano di assumere il ruolo del gateway attivo.', en: 'Forged HSRP/VRRP messages attempt to take over the active-gateway role.' }, defense: { it: 'Autenticazione quando supportata, segmentazione, ACL/CoPP e protezioni di access layer; monitora cambi di stato e virtual MAC.', en: 'Authentication where supported, segmentation, ACLs/CoPP, and access-layer protections; monitor state and virtual-MAC changes.' }, verify: 'show standby brief' },
  { service: 'NTP', attack: { it: 'Time spoofing altera log, certificati, correlazione SIEM e protocolli dipendenti dal tempo.', en: 'Time spoofing disrupts logs, certificates, SIEM correlation, and time-dependent protocols.' }, defense: { it: 'Server multipli attendibili, autenticazione quando supportata, ACL, monitoring dell’offset e NTS nei sistemi compatibili.', en: 'Multiple trusted servers, authentication where supported, ACLs, offset monitoring, and NTS on compatible systems.' }, verify: 'show ntp associations detail' },
  { service: 'SNMP', attack: { it: 'Enumerazione, community guessing o SET non autorizzati con SNMPv1/v2c.', en: 'Enumeration, community guessing, or unauthorized SET operations with SNMPv1/v2c.' }, defense: { it: 'SNMPv3 authPriv per autenticazione, integrità e cifratura; viste minime, ACL e credenziali uniche.', en: 'SNMPv3 authPriv for authentication, integrity, and encryption; minimal views, ACLs, and unique credentials.' }, verify: 'show snmp user' },
  { service: 'Syslog', attack: { it: 'Log injection, perdita UDP, manomissione o cancellazione locale.', en: 'Log injection, UDP loss, tampering, or local deletion.' }, defense: { it: 'Raccolta remota centralizzata, trasporto affidabile/TLS se disponibile, timestamp NTP, accesso ristretto e storage immutabile.', en: 'Centralized remote collection, reliable transport/TLS where available, NTP timestamps, restricted access, and immutable storage.' }, verify: 'show logging' },
  { service: 'QoS', attack: { it: 'DSCP marking abusivo per ottenere priorità o saturare la LLQ.', en: 'Abusive DSCP marking to gain priority or exhaust the LLQ.' }, defense: { it: 'Trust boundary esplicito, remark all’edge, policing per classe e LLQ dimensionata.', en: 'Explicit trust boundary, remarking at the edge, per-class policing, and a properly sized LLQ.' }, verify: 'show policy-map interface' },
  { service: 'SSH', attack: { it: 'Brute force, password spraying, chiavi rubate o accesso da reti non autorizzate.', en: 'Brute force, password spraying, stolen keys, or access from unauthorized networks.' }, defense: { it: 'SSHv2, AAA centralizzata, chiavi, management ACL/VRF, timeout, logging e CoPP; disabilita Telnet.', en: 'SSHv2, centralized AAA, keys, management ACL/VRF, timeouts, logging, and CoPP; disable Telnet.' }, verify: 'show ip ssh' },
  { service: 'TFTP/FTP', attack: { it: 'Credenziali, configurazioni o immagini possono essere intercettate o modificate in transito.', en: 'Credentials, configurations, or images may be intercepted or modified in transit.' }, defense: { it: 'Usa SCP/SFTP/HTTPS, limita i server alla management network e verifica hash/firma delle immagini.', en: 'Use SCP/SFTP/HTTPS, restrict servers to the management network, and verify image hashes/signatures.' }, verify: 'show archive' }
];

const DHCP_NAT_CONFIG: Record<Language, string> = {
  it: `ip dhcp excluded-address 10.10.10.1 10.10.10.20
ip dhcp pool USERS
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 dns-server 10.20.0.53
!
interface Vlan20
 ip helper-address 10.20.0.10
!
ip access-list standard NAT-INSIDE
 permit 10.10.10.0 0.0.0.255
ip nat inside source list NAT-INSIDE interface Gi0/0 overload`,
  en: `ip dhcp excluded-address 10.10.10.1 10.10.10.20
ip dhcp pool USERS
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 dns-server 10.20.0.53
!
interface Vlan20
 ip helper-address 10.20.0.10
!
ip access-list standard NAT-INSIDE
 permit 10.10.10.0 0.0.0.255
ip nat inside source list NAT-INSIDE interface Gi0/0 overload`
};

const MANAGEMENT_CONFIG = `service timestamps log datetime msec localtime show-timezone
logging host 10.20.0.50
logging trap warnings
logging source-interface Loopback0
!
ntp server 10.20.0.123 prefer
!
snmp-server group SECURE v3 priv
snmp-server user netops SECURE v3 auth sha <AUTH_SECRET> priv aes 128 <PRIV_SECRET>
!
ip domain name lab.example
username netadmin privilege 15 secret <SECRET>
crypto key generate rsa modulus 2048
ip ssh version 2
line vty 0 4
 transport input ssh
 login local`;

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
        dns: 'DNS e cache', dnsFlow: 'Un resolver ricorsivo interroga root, TLD e server autoritativo quando non possiede una risposta valida in cache. Il TTL limita per quanto tempo il record può essere riutilizzato.',
        nat: 'NAT/PAT explorer', inside: 'Inside local IPv4', port: 'Porta sorgente', collision: 'Simula una collisione della porta pubblica', invalidNat: 'Inserisci IPv4 e porta validi.', localTuple: 'Inside local', globalTuple: 'Inside global', preserved: 'Porta preservata', natNote: 'PAT distingue i flussi con protocollo e porte. Non cifra il traffico, non autentica gli endpoint e non sostituisce un firewall stateful.',
        timing: 'NTP: offset e delay', timestamp: 'Timestamp', offset: 'Offset stimato', delay: 'Round-trip delay', invalidTime: 'I timestamp devono essere coerenti e crescenti per ciascun tratto.',
        telemetry: 'Syslog, SNMP e telemetria', messageSeverity: 'Severità del messaggio', threshold: 'Soglia logging trap', forwarded: 'Inoltrato', discarded: 'Escluso dalla soglia', syslogRule: 'In Syslog 0 è il livello più grave e 7 il più dettagliato. Una soglia include il proprio livello e tutti quelli numericamente inferiori.', concepts: 'Ridondanza, gestione e trasferimento file',
        qos: 'QoS e DSCP', dscp: 'Code point DSCP (0–63)', qosName: 'Classe riconosciuta', qosText: 'QoS non crea banda: stabilisce quale traffico riceve un trattamento differente quando le risorse sono contese.',
        security: 'Matrice attacco–difesa dei servizi', service: 'Servizio', attack: 'Attacco e impatto', defense: 'Difesa appropriata e limite', verify: 'Verifica', config: 'Configurazioni IOS di riferimento', configNote: 'Adatta indirizzi, interfacce, algoritmi e sintassi alla piattaforma. I placeholder delle credenziali non devono essere inseriti letteralmente.'
      }
    : {
        title: 'IP Services Lab', subtitle: 'Follow the services that make a network operational, observe their state, and connect each abuse to the appropriate defense.',
        dhcp: 'DHCP and relay', relay: 'The relay converts the client broadcast into unicast toward the server and inserts giaddr to identify the source subnet.',
        dns: 'DNS and caching', dnsFlow: 'A recursive resolver queries root, TLD, and authoritative servers when it lacks a valid cached answer. The TTL limits how long the record may be reused.',
        nat: 'NAT/PAT explorer', inside: 'Inside local IPv4', port: 'Source port', collision: 'Simulate a public-port collision', invalidNat: 'Enter a valid IPv4 address and port.', localTuple: 'Inside local', globalTuple: 'Inside global', preserved: 'Port preserved', natNote: 'PAT distinguishes flows with protocol and ports. It does not encrypt traffic, authenticate endpoints, or replace a stateful firewall.',
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

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="dns-title"><SectionTitle icon={Database} title={t.dns} id="dns-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.dnsFlow}</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{DNS_RECORDS.map(record => <article key={record.type} className="rounded-lg border border-slate-200 p-3"><h3 className="font-mono text-sm font-semibold text-indigo-700">{record.type}</h3><p className="mt-1.5 text-xs text-slate-600">{record.purpose[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="nat-title"><SectionTitle icon={Network} title={t.nat} id="nat-title" /><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="space-y-1.5 text-xs text-slate-600">{t.inside}<input value={insideIp} onChange={event => setInsideIp(event.target.value)} inputMode="decimal" className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1.5 text-xs text-slate-600">{t.port}<input type="number" min={1} max={65535} value={sourcePort} onChange={event => setSourcePort(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label></div><label className="mt-4 flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={simulateCollision} onChange={event => setSimulateCollision(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />{t.collision}</label>{pat.error ? <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalidNat}</p> : <dl className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.localTuple}</dt><dd className="mt-1 font-mono text-sm">{pat.value?.insideLocal}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.globalTuple}</dt><dd className="mt-1 font-mono text-sm">{pat.value?.insideGlobal}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-[10px] uppercase text-slate-400">{t.preserved}</dt><dd className="mt-1 text-sm font-semibold">{pat.value?.preservedPort ? '✓' : '✗'}</dd></div></dl>}<p className="mt-4 text-xs leading-relaxed text-slate-600">{t.natNote}</p></section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ntp-title"><SectionTitle icon={Clock3} title={t.timing} id="ntp-title" /><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{(['t1', 't2', 't3', 't4'] as const).map(key => <label key={key} className="space-y-1 text-xs text-slate-600">{t.timestamp} {key.toUpperCase()}<input type="number" value={ntpTimes[key]} onChange={event => setNtpTimes(current => ({ ...current, [key]: Number(event.target.value) }))} className="block w-full rounded-lg border border-slate-200 px-2 py-2 font-mono text-xs" /></label>)}</div>{ntp ? <div className="mt-4 flex flex-wrap gap-3"><span className="rounded-md bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800">{t.offset}: {ntp.offsetMs} ms</span><span className="rounded-md bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">{t.delay}: {ntp.delayMs} ms</span></div> : <p className="mt-4 text-xs text-rose-700" role="alert">{t.invalidTime}</p>}</article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="telemetry-title"><SectionTitle icon={Terminal} title={t.telemetry} id="telemetry-title" /><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs text-slate-600">{t.messageSeverity}<select value={syslogMessage} onChange={event => setSyslogMessage(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-2 font-mono text-xs">{SYSLOG_LEVELS.map(level => <option key={level} value={level}>{level} · {syslogSeverityName(level)}</option>)}</select></label><label className="space-y-1 text-xs text-slate-600">{t.threshold}<select value={syslogThreshold} onChange={event => setSyslogThreshold(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-2 font-mono text-xs">{SYSLOG_LEVELS.map(level => <option key={level} value={level}>{level} · {syslogSeverityName(level)}</option>)}</select></label></div><p className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${syslogSent ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{syslogSent ? t.forwarded : t.discarded}</p><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.syslogRule}</p></article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="service-concepts-title"><SectionTitle icon={Terminal} title={t.concepts} id="service-concepts-title" /><div className="mt-4 grid gap-3 md:grid-cols-2">{SERVICE_CONCEPTS.map(item => <article key={item.title} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{item.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="qos-title"><SectionTitle icon={Gauge} title={t.qos} id="qos-title" /><div className="mt-4 flex flex-wrap items-end gap-4"><label className="w-56 space-y-1.5 text-xs text-slate-600">{t.dscp}<input type="number" min={0} max={63} value={dscp} onChange={event => setDscp(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><div className="rounded-lg bg-indigo-50 px-4 py-3"><p className="text-[10px] uppercase text-indigo-500">{t.qosName}</p><p className="mt-1 font-mono text-sm font-semibold text-indigo-800">{dscpLabel}</p></div></div><p className="mt-4 text-xs leading-relaxed text-slate-600">{t.qosText}</p><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{QOS_MECHANISMS.map(item => <article key={item.title} className="rounded-lg border border-slate-200 p-3"><h3 className="text-xs font-semibold text-slate-900">{item.title}</h3><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="services-security-title"><SectionTitle icon={ShieldCheck} title={t.security} id="services-security-title" /><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">{t.service}</th><th className="p-3">{t.attack}</th><th className="p-3">{t.defense}</th><th className="p-3">{t.verify}</th></tr></thead><tbody>{SECURITY_ROWS.map((row, index) => <tr key={`${row.service}-${index}`} className="border-b border-slate-100 align-top"><th className="p-3 font-semibold text-indigo-700">{row.service}</th><td className="p-3 leading-relaxed text-rose-800">{row.attack[language]}</td><td className="p-3 leading-relaxed text-emerald-800">{row.defense[language]}</td><td className="p-3"><code className="text-[11px] text-slate-700">{row.verify}</code></td></tr>)}</tbody></table></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="services-config-title"><SectionTitle icon={Terminal} title={t.config} id="services-config-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.configNote}</p><div className="mt-4 grid gap-4 xl:grid-cols-2"><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{DHCP_NAT_CONFIG[language]}</code></pre><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-300"><code>{MANAGEMENT_CONFIG}</code></pre></div></section>
    </div>
  );
}
