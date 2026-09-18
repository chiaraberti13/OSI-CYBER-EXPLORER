import { useMemo, useState } from 'react';
import { Cable, Radio, ShieldCheck, TriangleAlert, Waypoints } from 'lucide-react';
import {
  electRootBridge,
  evaluateTrunkFrame,
  isEtherChannelCompatible,
  parseVlanList,
  STP_SHORT_PATH_COST,
  type EtherChannelMode
} from '../lib/networkAccess';
import { useStore } from '../store';

type Language = 'it' | 'en';
type Localized = Record<Language, string>;

const ETHERCHANNEL_MODES: EtherChannelMode[] = ['active', 'passive', 'desirable', 'auto', 'on'];

const SECURITY_CONTROLS: Array<{
  attack: Localized;
  mechanism: Localized;
  defense: Localized;
  verify: string;
}> = [
  {
    attack: { it: 'VLAN hopping: switch spoofing', en: 'VLAN hopping: switch spoofing' },
    mechanism: { it: 'L’attaccante negozia un trunk tramite DTP da una porta utente.', en: 'The attacker negotiates a trunk through DTP from a user-facing port.' },
    defense: { it: 'Forza switchport mode access, disabilita DTP con switchport nonegotiate e spegni le porte inutilizzate.', en: 'Force switchport mode access, disable DTP with switchport nonegotiate, and shut down unused ports.' },
    verify: 'show interfaces switchport'
  },
  {
    attack: { it: 'VLAN hopping: double tagging', en: 'VLAN hopping: double tagging' },
    mechanism: { it: 'Due tag 802.1Q sfruttano il traffico non taggato della native VLAN; l’attacco è tipicamente unidirezionale.', en: 'Two 802.1Q tags abuse untagged native-VLAN traffic; the attack is typically unidirectional.' },
    defense: { it: 'Usa una native VLAN dedicata e inutilizzata, diversa dalle VLAN di accesso; limita le VLAN ammesse e valuta il tagging della native VLAN.', en: 'Use a dedicated, unused native VLAN that differs from access VLANs; prune allowed VLANs and consider tagging the native VLAN.' },
    verify: 'show interfaces trunk'
  },
  {
    attack: { it: 'Manipolazione STP / BPDU spoofing', en: 'STP manipulation / BPDU spoofing' },
    mechanism: { it: 'BPDU superiori fanno eleggere root uno switch ostile, deviando o interrompendo il traffico.', en: 'Superior BPDUs make a hostile switch the root, redirecting or disrupting traffic.' },
    defense: { it: 'BPDU Guard sugli edge port, Root Guard dove la root non deve comparire e priorità root deterministica.', en: 'BPDU Guard on edge ports, Root Guard where the root must not appear, and deterministic root priority.' },
    verify: 'show spanning-tree inconsistentports'
  },
  {
    attack: { it: 'MAC flooding', en: 'MAC flooding' },
    mechanism: { it: 'Molti MAC sorgente saturano la CAM table e possono causare flooding dei frame unknown-unicast.', en: 'Many source MAC addresses exhaust the CAM table and may trigger unknown-unicast flooding.' },
    defense: { it: 'Port Security con limite, sticky MAC e violation mode coerente; monitoraggio delle variazioni CAM.', en: 'Port Security with a limit, sticky MAC, and an appropriate violation mode; monitor CAM churn.' },
    verify: 'show port-security interface'
  },
  {
    attack: { it: 'DHCP starvation e rogue DHCP', en: 'DHCP starvation and rogue DHCP' },
    mechanism: { it: 'Richieste con MAC falsificati esauriscono il pool; un server non autorizzato invia offerte malevole.', en: 'Requests with forged MAC addresses exhaust the pool; an unauthorized server sends malicious offers.' },
    defense: { it: 'DHCP Snooping: trust solo verso il server, rate limit sulle porte client e binding database protetto.', en: 'DHCP Snooping: trust only toward the server, rate-limit client ports, and protect the binding database.' },
    verify: 'show ip dhcp snooping binding'
  },
  {
    attack: { it: 'ARP spoofing / poisoning', en: 'ARP spoofing / poisoning' },
    mechanism: { it: 'Risposte ARP false associano l’IP del gateway al MAC dell’attaccante.', en: 'Forged ARP replies associate the gateway IP with the attacker MAC.' },
    defense: { it: 'Dynamic ARP Inspection usa binding attendibili, normalmente prodotti da DHCP Snooping; gestisci ACL ARP per host statici.', en: 'Dynamic ARP Inspection uses trusted bindings, normally learned by DHCP Snooping; use ARP ACLs for static hosts.' },
    verify: 'show ip arp inspection statistics'
  },
  {
    attack: { it: 'Evil twin e credenziali Wi-Fi', en: 'Evil twin and Wi-Fi credential attacks' },
    mechanism: { it: 'Un AP imita SSID e portale; protocolli deboli o password condivise ampliano il rischio.', en: 'An AP imitates the SSID and portal; weak protocols or shared passwords increase the risk.' },
    defense: { it: 'WPA3-Enterprise o WPA2-Enterprise con 802.1X/EAP-TLS, validazione del certificato server e WIDS/WIPS.', en: 'WPA3-Enterprise or WPA2-Enterprise with 802.1X/EAP-TLS, server-certificate validation, and WIDS/WIPS.' },
    verify: 'show wireless stats client detail'
  },
  {
    attack: { it: 'Deauthentication/disassociation spoofing', en: 'Deauthentication/disassociation spoofing' },
    mechanism: { it: 'Frame di management falsificati disconnettono i client e possono favorire DoS o evil twin.', en: 'Forged management frames disconnect clients and can support DoS or evil-twin attacks.' },
    defense: { it: 'Protected Management Frames 802.11w, obbligatori con WPA3; RF monitoring e soglie di allarme.', en: '802.11w Protected Management Frames, mandatory with WPA3; RF monitoring and alert thresholds.' },
    verify: 'show wireless client mac-address'
  }
];

const WIRELESS_ROWS: Array<{ topic: Localized; detail: Localized }> = [
  { topic: { it: '2,4 GHz', en: '2.4 GHz' }, detail: { it: 'Maggiore portata e interferenza; in 20 MHz i canali non sovrapposti tipici sono 1, 6 e 11.', en: 'Longer range and more interference; with 20 MHz channels, 1, 6, and 11 are the typical non-overlapping choices.' } },
  { topic: { it: '5 GHz', en: '5 GHz' }, detail: { it: 'Più canali e capacità, minore penetrazione; alcuni canali richiedono DFS.', en: 'More channels and capacity, less penetration; some channels require DFS.' } },
  { topic: { it: '6 GHz', en: '6 GHz' }, detail: { it: 'Spettro aggiuntivo per Wi-Fi 6E/7; richiede client compatibili e sicurezza WPA3.', en: 'Additional spectrum for Wi-Fi 6E/7; requires compatible clients and WPA3 security.' } },
  { topic: { it: 'Infrastruttura', en: 'Infrastructure' }, detail: { it: 'AP lightweight e WLC separano funzioni di accesso, controllo e gestione; CAPWAP crea i tunnel AP–controller.', en: 'Lightweight APs and WLCs separate access, control, and management functions; CAPWAP builds AP-to-controller tunnels.' } }
];

const STP_ROLES: Array<{ name: string; detail: Localized }> = [
  { name: 'Root port', detail: { it: 'Su ogni switch non-root, è la porta con il costo totale minore verso la root bridge.', en: 'On each non-root switch, this is the port with the lowest total path cost toward the root bridge.' } },
  { name: 'Designated port', detail: { it: 'È la porta che offre il percorso migliore verso la root per uno specifico segmento; inoltra i frame.', en: 'This port offers the best path to the root for a specific segment; it forwards frames.' } },
  { name: 'Alternate port', detail: { it: 'In RSTP fornisce un percorso alternativo verso la root e rimane in discarding finché non serve.', en: 'In RSTP, this provides an alternate path to the root and stays discarding until needed.' } },
  { name: 'RSTP states', detail: { it: 'Discarding non inoltra né apprende MAC; learning apprende MAC; forwarding apprende e inoltra.', en: 'Discarding neither forwards nor learns MACs; learning learns MACs; forwarding learns and forwards.' } }
];

const ETHERCHANNEL_REQUIREMENTS: Localized[] = [
  { it: 'Stessa velocità e duplex sulle porte membro.', en: 'Matching speed and duplex on member ports.' },
  { it: 'Coerenza tra modalità access/trunk, VLAN access, native VLAN e allowed list.', en: 'Consistent access/trunk mode, access VLAN, native VLAN, and allowed list.' },
  { it: 'Tutte le porte membro devono appartenere allo stesso channel-group e usare un protocollo compatibile.', en: 'All member ports must use the same channel group and a compatible negotiation protocol.' }
];

const VLAN_CONFIG = `vlan 10
 name USERS
vlan 20
 name VOICE
vlan 99
 name NATIVE-BLACKHOLE
!
interface GigabitEthernet1/0/1
 switchport mode access
 switchport access vlan 10
 switchport nonegotiate
 spanning-tree portfast
 spanning-tree bpduguard enable
!
interface GigabitEthernet1/0/24
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99`;

const L2_SECURITY_CONFIG = `ip dhcp snooping
ip dhcp snooping vlan 10,20
ip arp inspection vlan 10,20
!
interface GigabitEthernet1/0/1
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 ip dhcp snooping limit rate 15
!
interface GigabitEthernet1/0/24
 ip dhcp snooping trust
 ip arp inspection trust`;

function SectionTitle({ icon: Icon, title, id }: { icon: typeof Cable; title: string; id: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-indigo-600" />
      <h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

export default function NetworkAccessLab() {
  const language = useStore(state => state.language);
  const [allowedInput, setAllowedInput] = useState('10,20,30-32,99');
  const [frameVlan, setFrameVlan] = useState(20);
  const [nativeVlan, setNativeVlan] = useState(99);
  const [sw1Priority, setSw1Priority] = useState(24576);
  const [sw2Priority, setSw2Priority] = useState(32768);
  const [leftMode, setLeftMode] = useState<EtherChannelMode>('active');
  const [rightMode, setRightMode] = useState<EtherChannelMode>('passive');

  const trunk = useMemo(() => {
    try {
      const allowed = parseVlanList(allowedInput);
      return { allowed, result: evaluateTrunkFrame(frameVlan, nativeVlan, allowed), error: false } as const;
    } catch {
      return { allowed: [], result: null, error: true } as const;
    }
  }, [allowedInput, frameVlan, nativeVlan]);

  const rootBridge = useMemo(() => {
    try {
      return electRootBridge([
        { id: 'SW1', priority: sw1Priority, mac: '00:11:22:33:44:01' },
        { id: 'SW2', priority: sw2Priority, mac: '00:11:22:33:44:02' }
      ]);
    } catch {
      return null;
    }
  }, [sw1Priority, sw2Priority]);

  const etherChannelUp = isEtherChannelCompatible(leftMode, rightMode);
  const t = language === 'it'
    ? {
        title: 'Network Access Lab', subtitle: 'Esplora switching Ethernet, VLAN, trunk, STP, EtherChannel, wireless e difese di livello 2.',
        vlanTitle: 'VLAN e trunk 802.1Q', allowed: 'VLAN ammesse', frame: 'VLAN del frame', native: 'Native VLAN', invalidVlan: 'La lista deve contenere VLAN da 1 a 4094, separate da virgole o intervalli.',
        tagged: 'Il frame attraversa il trunk con tag 802.1Q.', untagged: 'Il frame appartiene alla native VLAN e, per impostazione predefinita, attraversa il trunk senza tag.', pruned: 'Il frame viene scartato: la VLAN non è nella allowed list.',
        nativeWarning: 'Una native VLAN mismatch può causare perdita di traffico, leakage tra VLAN e messaggi CDP; deve coincidere sui due estremi.',
        stpTitle: 'STP/RSTP e prevenzione dei loop', priority: 'Priorità bridge', root: 'Root bridge eletto', rootRule: 'Nella stessa VLAN vince il Bridge ID più basso: prima la priorità configurata, poi il MAC. Il system ID extension contiene il VLAN ID e la priorità procede a incrementi di 4096.',
        costs: 'Costi STP classici (short method)', etherTitle: 'EtherChannel', left: 'Switch sinistro', right: 'Switch destro', formed: 'Port-channel formato', notFormed: 'Port-channel non formato',
        etherNote: 'LACP: active avvia la negoziazione, passive risponde. PAgP: desirable avvia, auto risponde. La modalità on non negozia e deve essere coerente sui due lati.',
        wirelessTitle: 'Fondamenti wireless', securityTitle: 'Attacchi e difese di accesso', attack: 'Attacco', mechanism: 'Meccanismo e impatto', defense: 'Difesa appropriata', verify: 'Verifica IOS',
        configTitle: 'Configurazioni IOS di riferimento', configNote: 'Gli esempi sono blocchi didattici: nomi interfaccia, VLAN, piattaforma e supporto dei comandi vanno adattati al dispositivo reale.'
      }
    : {
        title: 'Network Access Lab', subtitle: 'Explore Ethernet switching, VLANs, trunks, STP, EtherChannel, wireless, and Layer 2 defenses.',
        vlanTitle: 'VLANs and 802.1Q trunks', allowed: 'Allowed VLANs', frame: 'Frame VLAN', native: 'Native VLAN', invalidVlan: 'The list must contain VLANs from 1 to 4094, separated by commas or ranges.',
        tagged: 'The frame crosses the trunk with an 802.1Q tag.', untagged: 'The frame belongs to the native VLAN and crosses the trunk untagged by default.', pruned: 'The frame is dropped: its VLAN is not in the allowed list.',
        nativeWarning: 'A native VLAN mismatch can cause traffic loss, VLAN leakage, and CDP messages; both trunk ends must match.',
        stpTitle: 'STP/RSTP and loop prevention', priority: 'Bridge priority', root: 'Elected root bridge', rootRule: 'Within the same VLAN, the lowest Bridge ID wins: configured priority first, then MAC address. The system ID extension carries the VLAN ID, and priority uses increments of 4096.',
        costs: 'Classic STP costs (short method)', etherTitle: 'EtherChannel', left: 'Left switch', right: 'Right switch', formed: 'Port-channel formed', notFormed: 'Port-channel not formed',
        etherNote: 'LACP: active initiates negotiation, passive responds. PAgP: desirable initiates, auto responds. Mode on does not negotiate and must be consistent on both sides.',
        wirelessTitle: 'Wireless fundamentals', securityTitle: 'Access-layer attacks and defenses', attack: 'Attack', mechanism: 'Mechanism and impact', defense: 'Appropriate defense', verify: 'IOS verification',
        configTitle: 'Reference IOS configurations', configNote: 'These are teaching blocks: interface names, VLANs, platform, and command support must be adapted to the actual device.'
      };

  const trunkMessage = trunk.result?.reason === 'allowed-tagged' ? t.tagged : trunk.result?.reason === 'native-untagged' ? t.untagged : t.pruned;

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="eyebrow">CCNA 2.1 · 2.2 · 2.3 · 2.4 · 2.5 · 2.6 · 2.7</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="vlan-title">
        <SectionTitle icon={Waypoints} title={t.vlanTitle} id="vlan-title" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.allowed}<input value={allowedInput} onChange={event => setAllowedInput(event.target.value)} spellCheck={false} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.frame}<input type="number" min={1} max={4094} value={frameVlan} onChange={event => setFrameVlan(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.native}<input type="number" min={1} max={4094} value={nativeVlan} onChange={event => setNativeVlan(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
        </div>
        {trunk.error ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalidVlan}</p>
        ) : (
          <div className={`mt-5 rounded-lg border p-4 text-sm ${trunk.result?.forwarded ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <p className="font-semibold">{trunkMessage}</p>
            <p className="mt-2 font-mono text-xs opacity-80">allowed: {trunk.allowed.join(', ')}</p>
          </div>
        )}
        <p className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">{t.nativeWarning}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="stp-title">
        <SectionTitle icon={Waypoints} title={t.stpTitle} id="stp-title" />
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.rootRule}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[['SW1', sw1Priority, setSw1Priority, '00:11:22:33:44:01'], ['SW2', sw2Priority, setSw2Priority, '00:11:22:33:44:02']].map(([id, priority, setter, mac]) => (
            <article key={String(id)} className={`rounded-lg border p-4 ${rootBridge?.id === id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">{String(id)}</h3>{rootBridge?.id === id ? <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white">ROOT</span> : null}</div>
              <label className="mt-3 block space-y-1.5 text-xs text-slate-600">{t.priority}<select value={Number(priority)} onChange={event => (setter as (value: number) => void)(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm">{[0, 4096, 8192, 16384, 24576, 32768, 40960, 49152, 61440].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
              <p className="mt-3 font-mono text-xs text-slate-500">MAC {String(mac)}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-indigo-700">{t.root}: {rootBridge?.id ?? '—'}</p>
        <div className="mt-5"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.costs}</h3><div className="mt-2 flex flex-wrap gap-2">{Object.entries(STP_SHORT_PATH_COST).map(([speed, cost]) => <span key={speed} className="rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">{speed} → {cost}</span>)}</div></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{STP_ROLES.map(item => <article key={item.name} className="rounded-lg border border-slate-200 p-3"><h3 className="text-xs font-semibold text-slate-900">{item.name}</h3><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="etherchannel-title">
        <SectionTitle icon={Cable} title={t.etherTitle} id="etherchannel-title" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[[t.left, leftMode, setLeftMode], [t.right, rightMode, setRightMode]].map(([label, mode, setter]) => <label key={String(label)} className="space-y-1.5 text-xs font-medium text-slate-600">{String(label)}<select value={String(mode)} onChange={event => (setter as (value: EtherChannelMode) => void)(event.target.value as EtherChannelMode)} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm">{ETHERCHANNEL_MODES.map(item => <option key={item} value={item}>{item}</option>)}</select></label>)}
        </div>
        <p className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${etherChannelUp ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{etherChannelUp ? t.formed : t.notFormed}</p>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.etherNote}</p>
        <ul className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">{ETHERCHANNEL_REQUIREMENTS.map(item => <li key={item.en}>• {item[language]}</li>)}</ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="wireless-title">
        <SectionTitle icon={Radio} title={t.wirelessTitle} id="wireless-title" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">{WIRELESS_ROWS.map(row => <article key={row.topic.en} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.topic[language]}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="access-security-title">
        <SectionTitle icon={ShieldCheck} title={t.securityTitle} id="access-security-title" />
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">{t.attack}</th><th className="p-3">{t.mechanism}</th><th className="p-3">{t.defense}</th><th className="p-3">{t.verify}</th></tr></thead><tbody>{SECURITY_CONTROLS.map(item => <tr key={item.attack.en} className="border-b border-slate-100 align-top"><th className="p-3 font-semibold text-rose-700">{item.attack[language]}</th><td className="p-3 leading-relaxed text-slate-600">{item.mechanism[language]}</td><td className="p-3 leading-relaxed text-emerald-800">{item.defense[language]}</td><td className="p-3"><code className="text-[11px] text-indigo-700">{item.verify}</code></td></tr>)}</tbody></table></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="config-title">
        <SectionTitle icon={Cable} title={t.configTitle} id="config-title" />
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.configNote}</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2"><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{VLAN_CONFIG}</code></pre><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-300"><code>{L2_SECURITY_CONFIG}</code></pre></div>
      </section>
    </div>
  );
}
