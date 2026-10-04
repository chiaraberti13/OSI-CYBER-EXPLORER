import { useMemo, useState } from 'react';
import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Siren, TriangleAlert, Wifi } from 'lucide-react';
import { evaluateIpv4Acl, type PacketDescriptor } from '../lib/securityFundamentals';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';
import AclBuilderLab from './AclBuilderLab';
import WildcardBuilder from './WildcardBuilder';
import {
  ACL_RULES,
  ACL_IOS,
  SECURITY_FOUNDATIONS,
  AAA_ROWS,
  VPN_ROWS,
  ENFORCEMENT_ROWS,
  PKI_STEPS,
  WLAN_SECURITY_ROWS,
  WPA2_PSK_STEPS,
  ATTACK_ROWS,
  HARDENING_CONFIG,
} from '../content/securityFundamentalsLab';


function SectionTitle({ icon: Icon, title, id }: { icon: typeof ShieldCheck; title: string; id: string }) {
  return <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-indigo-600" /><h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2></div>;
}

export default function SecurityFundamentalsLab() {
  const language = useStore(state => state.language);
  const [packet, setPacket] = useState<PacketDescriptor>({ protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', sourcePort: 49152, destinationPort: 443, tcpFlags: ['SYN'] });

  const decision = useMemo(() => {
    try { return { value: evaluateIpv4Acl(ACL_RULES, packet), error: false } as const; }
    catch { return { value: null, error: true } as const; }
  }, [packet]);

  const t = language === 'it'
    ? {
        title: 'Security Fundamentals Lab', subtitle: 'Applica controlli preventivi, investigativi e correttivi senza confondere capacità, limiti e piano operativo.', foundations: 'Concetti e programma di sicurezza',
        acl: 'ACL IPv4: prima corrispondenza', protocol: 'Protocollo', source: 'IPv4 sorgente', destination: 'IPv4 destinazione', port: 'Porta destinazione', ack: 'Imposta ACK TCP', invalid: 'Il descrittore del pacchetto contiene indirizzi o porte non validi.', permit: 'PERMIT', deny: 'DENY', matched: 'Regola corrispondente', implicit: 'Implicit deny', aclNote: 'Le ACL vengono lette dall’alto verso il basso e si fermano alla prima corrispondenza. Standard ACL: solo sorgente. Extended ACL: protocollo, sorgente, destinazione e porte. “established” verifica ACK/RST ma non mantiene stato.',
        aaa: 'AAA e controllo amministrativo', property: 'Proprietà',
        wlan: 'Protocolli di sicurezza wireless e WPA2 PSK', generation: 'Generazione', crypto: 'Cifratura', authN: 'Autenticazione', weakness: 'Limite da conoscere',
        wlanNote: 'WPA2 PSK è adeguato a una rete piccola o a un laboratorio: la passphrase è condivisa, quindi non identifica un utente, non si revoca singolarmente e chi la conosce può decifrare il traffico degli altri se ha catturato il loro handshake. In ambito aziendale si usa Enterprise con 802.1X/EAP-TLS. La sequenza dei campi nella GUI del WLC è nel Network Access Lab.',
        psk: 'Creare una WLAN WPA2 PSK', vpn: 'VPN e protezione del transito', enforcement: 'ACL, firewall e IDS/IPS', pki: 'PKI e catena di fiducia', attacks: 'Attacchi, difese e limiti', attack: 'Attacco', plane: 'Area', defense: 'Difesa', limit: 'Limite operativo', hardening: 'Hardening IOS di riferimento', hardeningNote: 'L’ordine AAA deve conservare un fallback locale testato per evitare lockout. service password-encryption applica offuscamento Type 7 reversibile: non sostituisce secret robusti, AAA e MFA. Algoritmi e comandi dipendono dalla piattaforma.'
      }
    : {
        title: 'Security Fundamentals Lab', subtitle: 'Apply preventive, detective, and corrective controls without confusing capabilities, limitations, and operational plane.', foundations: 'Security concepts and program',
        acl: 'IPv4 ACL: first match', protocol: 'Protocol', source: 'Source IPv4', destination: 'Destination IPv4', port: 'Destination port', ack: 'Set TCP ACK', invalid: 'The packet descriptor contains invalid addresses or ports.', permit: 'PERMIT', deny: 'DENY', matched: 'Matched rule', implicit: 'Implicit deny', aclNote: 'ACLs are read top-down and stop at the first match. Standard ACL: source only. Extended ACL: protocol, source, destination, and ports. “established” checks ACK/RST but keeps no state.',
        aaa: 'AAA and administrative control', property: 'Property',
        wlan: 'Wireless security protocols and WPA2 PSK', generation: 'Generation', crypto: 'Encryption', authN: 'Authentication', weakness: 'Limitation to know',
        wlanNote: 'WPA2 PSK is adequate for a small network or a lab: the passphrase is shared, so it identifies no user, cannot be revoked individually, and whoever knows it can decrypt other clients’ traffic if their handshake was captured. Enterprise deployments use 802.1X/EAP-TLS instead. The WLC GUI field sequence lives in the Network Access Lab.',
        psk: 'Creating a WPA2 PSK WLAN', vpn: 'VPN and transit protection', enforcement: 'ACLs, firewalls, and IDS/IPS', pki: 'PKI and chain of trust', attacks: 'Attacks, defenses, and limitations', attack: 'Attack', plane: 'Area', defense: 'Defense', limit: 'Operational limitation', hardening: 'Reference IOS hardening', hardeningNote: 'The AAA order should retain a tested local fallback to avoid lockout. service password-encryption applies reversible Type 7 obfuscation: it does not replace strong secrets, AAA, or MFA. Algorithms and commands depend on the platform.'
      };

  const setPacketField = <Key extends keyof PacketDescriptor,>(key: Key, value: PacketDescriptor[Key]) => setPacket(current => ({ ...current, [key]: value }));

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><p className="eyebrow">CCNA 5.1 · 5.2 · 5.3 · 5.4 · 5.5 · 5.6 · 5.7 · 5.8 · 5.9 · 5.10</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p></header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="security-foundations-title"><SectionTitle icon={ShieldCheck} title={t.foundations} id="security-foundations-title" /><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{SECURITY_FOUNDATIONS.map(item => <article key={item.title.en} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{item.title[language]}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="acl-title"><SectionTitle icon={ShieldCheck} title={t.acl} id="acl-title" /><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="space-y-1 text-xs text-slate-600">{t.protocol}<select value={packet.protocol} onChange={event => setPacketField('protocol', event.target.value as PacketDescriptor['protocol'])} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm"><option value="tcp">TCP</option><option value="udp">UDP</option><option value="icmp">ICMP</option></select></label><label className="space-y-1 text-xs text-slate-600">{t.source}<input value={packet.sourceIp} onChange={event => setPacketField('sourceIp', event.target.value)} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1 text-xs text-slate-600">{t.destination}<input value={packet.destinationIp} onChange={event => setPacketField('destinationIp', event.target.value)} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1 text-xs text-slate-600">{t.port}<input type="number" min={1} max={65535} value={packet.destinationPort ?? ''} onChange={event => setPacketField('destinationPort', Number(event.target.value))} disabled={packet.protocol === 'icmp'} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm disabled:bg-slate-100" /></label></div><label className="mt-4 flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={(packet.tcpFlags ?? []).includes('ACK')} disabled={packet.protocol !== 'tcp'} onChange={event => setPacketField('tcpFlags', event.target.checked ? ['ACK'] : ['SYN'])} />{t.ack}</label><div className="mt-4 space-y-2 font-mono text-xs">{ACL_IOS.map((line, index) => <div key={line} className={`rounded-md border px-3 py-2 ${decision.value?.matchedSequence === ACL_RULES[index]?.sequence || (decision.value?.implicit && index === ACL_IOS.length - 1) ? 'border-indigo-300 bg-indigo-50 text-indigo-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>{line}</div>)}</div>{decision.error ? <p className="mt-4 flex items-center gap-2 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalid}</p> : <div className={`mt-4 rounded-lg border p-4 ${decision.value?.action === 'permit' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}><span className="font-semibold">{decision.value?.action === 'permit' ? t.permit : t.deny}</span><span className="ml-3 text-xs">{decision.value?.implicit ? t.implicit : `${t.matched}: ${decision.value?.matchedSequence}`}{decision.value?.logged ? ' · log' : ''}</span></div>}<p className="mt-4 text-xs leading-relaxed text-slate-600">{t.aclNote}</p></section>

      <AclBuilderLab />

      <WildcardBuilder />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="aaa-title"><SectionTitle icon={Fingerprint} title={t.aaa} id="aaa-title" /><div className="mt-4"><ResponsiveTable
          rows={AAA_ROWS}
          rowKey={row => row.property.en}
          label={t.aaa}
          breakpoint="md"
          minWidth={640}
          columns={[
            { id: 'property', header: t.property, heading: true, cell: row => row.property[language] },
            { id: 'tacacs', header: 'TACACS+', cell: row => row.tacacs[language] },
            { id: 'radius', header: 'RADIUS', cell: row => row.radius[language] }
          ]}
        /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="vpn-title"><SectionTitle icon={LockKeyhole} title={t.vpn} id="vpn-title" /><div className="mt-4 grid gap-3 md:grid-cols-2">{VPN_ROWS.map(row => <article key={row.title} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="enforcement-title"><SectionTitle icon={Siren} title={t.enforcement} id="enforcement-title" /><div className="mt-4 grid gap-3 md:grid-cols-2">{ENFORCEMENT_ROWS.map(row => <article key={row.title} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="pki-title"><SectionTitle icon={KeyRound} title={t.pki} id="pki-title" /><ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{PKI_STEPS.map((step, index) => <li key={step.title} className="rounded-lg border border-slate-200 p-4"><span className="font-mono text-[10px] text-indigo-600">{index + 1}</span><h3 className="mt-1 text-sm font-semibold text-slate-900">{step.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{step.detail[language]}</p></li>)}</ol></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="wlan-security-title">
        <SectionTitle icon={Wifi} title={t.wlan} id="wlan-security-title" />
        <div className="mt-4"><ResponsiveTable
          rows={WLAN_SECURITY_ROWS}
          rowKey={row => row.generation}
          label={t.wlan}
          minWidth={900}
          columns={[
            { id: 'generation', header: t.generation, heading: true, cellClassName: 'text-indigo-700', cell: row => row.generation },
            { id: 'crypto', header: t.crypto, cell: row => row.crypto[language] },
            { id: 'authn', header: t.authN, cell: row => row.authentication[language] },
            { id: 'weakness', header: t.weakness, cellClassName: 'text-amber-900', cell: row => row.weakness[language] }
          ]}
        /></div>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.psk}</h3>
        <ol className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{WPA2_PSK_STEPS.map(item => <li key={item.step.en} className="rounded-lg border border-slate-200 p-4"><h4 className="text-xs font-semibold text-slate-900">{item.step[language]}</h4><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></li>)}</ol>
        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.wlanNote}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="security-matrix-title"><SectionTitle icon={ShieldCheck} title={t.attacks} id="security-matrix-title" /><div className="mt-4"><ResponsiveTable
          rows={ATTACK_ROWS}
          rowKey={row => row.attack.en}
          label={t.attacks}
          breakpoint="xl"
          minWidth={1040}
          columns={[
            { id: 'attack', header: t.attack, heading: true, cellClassName: 'text-rose-700', cell: row => row.attack[language] },
            { id: 'plane', header: t.plane, cellClassName: 'font-mono text-indigo-700', cell: row => row.layer },
            { id: 'defense', header: t.defense, cellClassName: 'text-emerald-800', cell: row => row.defense[language] },
            { id: 'limit', header: t.limit, cell: row => row.limit[language] }
          ]}
        /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="hardening-title"><SectionTitle icon={LockKeyhole} title={t.hardening} id="hardening-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.hardeningNote}</p><pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{HARDENING_CONFIG}</code></pre></section>
    </div>
  );
}
