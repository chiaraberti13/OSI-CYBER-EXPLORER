import { useMemo, useState } from 'react';
import { Cable, Radio, ShieldCheck, TriangleAlert, Waypoints } from 'lucide-react';
import {
  electRootBridge,
  evaluateTrunkFrame,
  isEtherChannelCompatible,
  STP_LONG_PATH_COST,
  STP_SHORT_METHOD_CEILING,
  STP_SHORT_PATH_COST,
  type EtherChannelMode
} from '../lib/networkAccess';
import {
  INTERACTIVE_INPUT_LIMITS,
  inputErrorMessage,
  parseVlanId,
  parseVlanListInput
} from '../lib/inputValidation';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';
import CamTableLab from './CamTableLab';
import PortSecurityLab from './PortSecurityLab';
import StpConvergenceLab from './StpConvergenceLab';
import {
  ETHERCHANNEL_MODES,
  SECURITY_CONTROLS,
  WIRELESS_ROWS,
  WIRELESS_PRINCIPLES,
  MGMT_ACCESS_ROWS,
  WLAN_GUI_STEPS,
  STP_ROLES,
  ETHERCHANNEL_REQUIREMENTS,
  VLAN_CONFIG,
  L2_SECURITY_CONFIG,
} from '../content/networkAccessLab';


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
  const [frameVlan, setFrameVlan] = useState('20');
  const [nativeVlan, setNativeVlan] = useState('99');
  const [sw1Priority, setSw1Priority] = useState(24576);
  const [sw2Priority, setSw2Priority] = useState(32768);
  const [leftMode, setLeftMode] = useState<EtherChannelMode>('active');
  const [rightMode, setRightMode] = useState<EtherChannelMode>('passive');

  const trunk = useMemo(() => {
    try {
      const allowed = parseVlanListInput(allowedInput);
      return { allowed, result: evaluateTrunkFrame(parseVlanId(frameVlan), parseVlanId(nativeVlan), allowed), error: null } as const;
    } catch (error) {
      return { allowed: [], result: null, error } as const;
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
        costs: 'Costi STP (short method, 802.1D-1998)', longCosts: 'Costi STP (long method, 802.1D-2004)',
        costNote: `Il metodo short è a 16 bit e si ferma a ${STP_SHORT_METHOD_CEILING}: da lì in su i valori collassano verso 1 e link di velocità molto diversa diventano indistinguibili per STP. Con uplink a 10 Gb/s o più veloci si abilita spanning-tree pathcost method long, che deve essere identico su tutti gli switch della topologia: mescolare short e long produce un albero incoerente.`, etherTitle: 'EtherChannel', left: 'Switch sinistro', right: 'Switch destro', formed: 'Port-channel formato', notFormed: 'Port-channel non formato',
        etherNote: 'LACP: active avvia la negoziazione, passive risponde. PAgP: desirable avvia, auto risponde. La modalità on non negozia e deve essere coerente sui due lati.',
        wirelessTitle: 'Fondamenti wireless', principlesTitle: 'Principi radio e 802.11',
        mgmtTitle: 'Accesso di gestione a dispositivi, AP e WLC', method: 'Metodo', mgmtDetail: 'Come funziona', mgmtVerdict: 'Indicazione operativa',
        guiTitle: 'Configurazione WLAN dalla GUI del WLC (WPA2 PSK)', guiTab: 'Percorso nella GUI', guiFields: 'Campi da impostare', guiNote: 'Nota didattica',
        guiIntro: 'Sequenza dei campi che si incontrano creando una WLAN su un Wireless LAN Controller. È una descrizione testuale, non una GUI interattiva: nomi e posizione dei campi variano tra AireOS e IOS XE.',
        securityTitle: 'Attacchi e difese di accesso', attack: 'Attacco', mechanism: 'Meccanismo e impatto', defense: 'Difesa appropriata', verify: 'Verifica IOS',
        configTitle: 'Configurazioni IOS di riferimento', configNote: 'Gli esempi sono blocchi didattici: nomi interfaccia, VLAN, piattaforma e supporto dei comandi vanno adattati al dispositivo reale.'
      }
    : {
        title: 'Network Access Lab', subtitle: 'Explore Ethernet switching, VLANs, trunks, STP, EtherChannel, wireless, and Layer 2 defenses.',
        vlanTitle: 'VLANs and 802.1Q trunks', allowed: 'Allowed VLANs', frame: 'Frame VLAN', native: 'Native VLAN', invalidVlan: 'The list must contain VLANs from 1 to 4094, separated by commas or ranges.',
        tagged: 'The frame crosses the trunk with an 802.1Q tag.', untagged: 'The frame belongs to the native VLAN and crosses the trunk untagged by default.', pruned: 'The frame is dropped: its VLAN is not in the allowed list.',
        nativeWarning: 'A native VLAN mismatch can cause traffic loss, VLAN leakage, and CDP messages; both trunk ends must match.',
        stpTitle: 'STP/RSTP and loop prevention', priority: 'Bridge priority', root: 'Elected root bridge', rootRule: 'Within the same VLAN, the lowest Bridge ID wins: configured priority first, then MAC address. The system ID extension carries the VLAN ID, and priority uses increments of 4096.',
        costs: 'STP costs (short method, 802.1D-1998)', longCosts: 'STP costs (long method, 802.1D-2004)',
        costNote: `The short method is 16-bit and stops at ${STP_SHORT_METHOD_CEILING}: above that the values collapse toward 1 and links of very different speed become indistinguishable to STP. With 10 Gb/s or faster uplinks, enable spanning-tree pathcost method long — and keep it identical on every switch of the topology, because mixing short and long produces an inconsistent tree.`, etherTitle: 'EtherChannel', left: 'Left switch', right: 'Right switch', formed: 'Port-channel formed', notFormed: 'Port-channel not formed',
        etherNote: 'LACP: active initiates negotiation, passive responds. PAgP: desirable initiates, auto responds. Mode on does not negotiate and must be consistent on both sides.',
        wirelessTitle: 'Wireless fundamentals', principlesTitle: 'Radio and 802.11 principles',
        mgmtTitle: 'Management access to devices, APs, and WLCs', method: 'Method', mgmtDetail: 'How it works', mgmtVerdict: 'Operational guidance',
        guiTitle: 'WLAN configuration from the WLC GUI (WPA2 PSK)', guiTab: 'GUI path', guiFields: 'Fields to set', guiNote: 'Teaching note',
        guiIntro: 'The sequence of fields encountered when creating a WLAN on a Wireless LAN Controller. This is a textual description, not an interactive GUI: field names and placement differ between AireOS and IOS XE.',
        securityTitle: 'Access-layer attacks and defenses', attack: 'Attack', mechanism: 'Mechanism and impact', defense: 'Appropriate defense', verify: 'IOS verification',
        configTitle: 'Reference IOS configurations', configNote: 'These are teaching blocks: interface names, VLANs, platform, and command support must be adapted to the actual device.'
      };

  const trunkMessage = trunk.result?.reason === 'allowed-tagged' ? t.tagged : trunk.result?.reason === 'native-untagged' ? t.untagged : t.pruned;

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="eyebrow">CCNA 1.11 · 2.1 · 2.2 · 2.3 · 2.4 · 2.5 · 2.6 · 2.7 · 2.8 · 2.9</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="vlan-title">
        <SectionTitle icon={Waypoints} title={t.vlanTitle} id="vlan-title" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.allowed}<input value={allowedInput} maxLength={INTERACTIVE_INPUT_LIMITS.vlanListCharacters + 1} onChange={event => setAllowedInput(event.target.value)} spellCheck={false} aria-invalid={trunk.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.frame}<input inputMode="numeric" value={frameVlan} maxLength={4} onChange={event => setFrameVlan(event.target.value)} aria-invalid={trunk.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.native}<input inputMode="numeric" value={nativeVlan} maxLength={4} onChange={event => setNativeVlan(event.target.value)} aria-invalid={trunk.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
        </div>
        {trunk.error ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{inputErrorMessage(trunk.error, language)}</p>
        ) : (
          <div className={`mt-5 rounded-lg border p-4 text-sm ${trunk.result?.forwarded ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <p className="font-semibold">{trunkMessage}</p>
            <p className="mt-2 font-mono text-xs opacity-80">allowed: {trunk.allowed.join(', ')}</p>
          </div>
        )}
        <p className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">{t.nativeWarning}</p>
      </section>

      <CamTableLab />

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
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.costs}</h3><div className="mt-2 flex flex-wrap gap-2">{Object.entries(STP_SHORT_PATH_COST).map(([speed, cost]) => <span key={speed} className="rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">{speed} → {cost}</span>)}</div></div>
          <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.longCosts}</h3><div className="mt-2 flex flex-wrap gap-2">{Object.entries(STP_LONG_PATH_COST).map(([speed, cost]) => <span key={speed} className="rounded-md bg-indigo-50 px-3 py-2 font-mono text-xs text-indigo-800">{speed} → {cost.toLocaleString(language)}</span>)}</div></div>
        </div>
        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.costNote}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{STP_ROLES.map(item => <article key={item.name} className="rounded-lg border border-slate-200 p-3"><h3 className="text-xs font-semibold text-slate-900">{item.name}</h3><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div>
      </section>

      <StpConvergenceLab />

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
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.principlesTitle}</h3>
        <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{WIRELESS_PRINCIPLES.map(item => <article key={item.title.en} className="rounded-lg border border-slate-200 p-4"><h4 className="text-sm font-semibold text-slate-900">{item.title[language]}</h4><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="mgmt-access-title">
        <SectionTitle icon={ShieldCheck} title={t.mgmtTitle} id="mgmt-access-title" />
        <div className="mt-4"><ResponsiveTable
          rows={MGMT_ACCESS_ROWS}
          rowKey={row => row.detail.en}
          label={t.mgmtTitle}
          minWidth={820}
          columns={[
            { id: 'method', header: t.method, heading: true, cellClassName: 'font-mono text-[11px] text-indigo-700', cell: row => (typeof row.method === 'string' ? row.method : row.method[language]) },
            { id: 'detail', header: t.mgmtDetail, cell: row => row.detail[language] },
            { id: 'verdict', header: t.mgmtVerdict, cellClassName: 'text-emerald-800', cell: row => row.verdict[language] }
          ]}
        /></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="wlan-gui-title">
        <SectionTitle icon={Radio} title={t.guiTitle} id="wlan-gui-title" />
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{t.guiIntro}</p>
        <ol className="mt-4 space-y-3">{WLAN_GUI_STEPS.map((step, index) => (
          <li key={step.tab} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-baseline gap-2"><span className="font-mono text-[10px] font-semibold text-indigo-600">{index + 1}</span><code className="text-xs font-semibold text-slate-900">{step.tab}</code></div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600"><strong>{t.guiFields}:</strong> {step.fields[language]}</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-900"><strong>{t.guiNote}:</strong> {step.note[language]}</p>
          </li>
        ))}</ol>
      </section>

      <PortSecurityLab />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="access-security-title">
        <SectionTitle icon={ShieldCheck} title={t.securityTitle} id="access-security-title" />
        <div className="mt-4"><ResponsiveTable
          rows={SECURITY_CONTROLS}
          rowKey={item => item.attack.en}
          label={t.securityTitle}
          minWidth={900}
          columns={[
            { id: 'attack', header: t.attack, heading: true, cellClassName: 'text-rose-700', cell: item => item.attack[language] },
            { id: 'mechanism', header: t.mechanism, cell: item => item.mechanism[language] },
            { id: 'defense', header: t.defense, cellClassName: 'text-emerald-800', cell: item => item.defense[language] },
            { id: 'verify', header: t.verify, cell: item => <code className="text-[11px] text-indigo-700">{item.verify}</code> }
          ]}
        /></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="config-title">
        <SectionTitle icon={Cable} title={t.configTitle} id="config-title" />
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.configNote}</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2"><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{VLAN_CONFIG}</code></pre><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-300"><code>{L2_SECURITY_CONFIG}</code></pre></div>
      </section>
    </div>
  );
}
