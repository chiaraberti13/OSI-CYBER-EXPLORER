import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Filter, Radio, Search, ShieldCheck, Wifi } from 'lucide-react';
import { useStore } from '../store';
import { WIRELESS_SECURITY_SCENARIOS, type WirelessSecurityArea } from '../content/wirelessSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import type { SecurityPlane } from '../content/securityTaxonomy';

const AREAS: WirelessSecurityArea[] = ['rf', 'rogue', 'evil-twin', 'management-frames', 'personal', 'transition', 'enterprise', 'infrastructure', 'guest'];
const PLANES: SecurityPlane[] = ['physical', 'data', 'control', 'management', 'application', 'identity'];
const AREA_LABELS: Record<WirelessSecurityArea, { it: string; en: string }> = {
  rf: { it: 'Spettro RF', en: 'RF spectrum' }, rogue: { it: 'Rogue AP', en: 'Rogue AP' }, 'evil-twin': { it: 'Evil twin', en: 'Evil twin' },
  'management-frames': { it: 'Frame di management', en: 'Management frames' }, personal: { it: 'Personal / PSK', en: 'Personal / PSK' },
  transition: { it: 'WPA3 transition', en: 'WPA3 transition' }, enterprise: { it: 'Enterprise / RADIUS', en: 'Enterprise / RADIUS' },
  infrastructure: { it: 'WLC e CAPWAP', en: 'WLC and CAPWAP' }, guest: { it: 'Guest WLAN', en: 'Guest WLAN' }
};
const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' }, data: { it: 'Dati', en: 'Data' }, control: { it: 'Controllo', en: 'Control' },
  management: { it: 'Gestione', en: 'Management' }, application: { it: 'Applicazione', en: 'Application' }, identity: { it: 'Identità', en: 'Identity' }
};
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));

export default function WirelessSecurityLab() {
  const language = useStore(state => state.language);
  const [area, setArea] = useState<'all' | WirelessSecurityArea>('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => WIRELESS_SECURITY_SCENARIOS.filter(item => (area === 'all' || item.area === area) && (plane === 'all' || item.planes.includes(plane))), [area, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4"><div className="rounded-xl bg-cyan-50 p-3 text-cyan-700"><Radio className="h-6 w-6" aria-hidden="true" /></div><div>
          <p className="eyebrow">RF · ASSOCIATION · TRUST · POLICY</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio sicurezza Wireless e RF' : 'Wireless & RF Security Lab'}</h1>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Segui la catena di fiducia dallo spettro al client, dall’AP al WLC e da RADIUS al data plane. Ogni scenario separa segnale, associazione, autenticazione, autorizzazione e forwarding.' : 'Follow the trust chain from spectrum to client, from AP to WLC, and from RADIUS to the data plane. Each scenario separates signal, association, authentication, authorization, and forwarding.'}</p>
        </div></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo sicurezza wireless' : 'Wireless security summary'}>
        {[{ value: WIRELESS_SECURITY_SCENARIOS.length, it: 'Scenari operativi', en: 'Operational scenarios' }, { value: new Set(WIRELESS_SECURITY_SCENARIOS.flatMap(item => item.techniqueIds)).size, it: 'Tecniche correlate', en: 'Related techniques' }, { value: WIRELESS_SECURITY_SCENARIOS.reduce((total, item) => total + item.verification.length, 0), it: 'Verifiche operative', en: 'Operational checks' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}
      </section>

      <aside className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 text-cyan-950"><p className="flex items-center gap-2 text-sm font-semibold"><Wifi className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Regola di verifica' : 'Verification rule'}</p><p className="mt-2 text-xs leading-relaxed">{language === 'it' ? 'SSID visibile, client associato o RADIUS Access-Accept non dimostrano da soli identità, protezione negoziata e policy applicata. Correlare sempre RF, BSSID, AKM/cifratura, PMF, EAP/RADIUS e reachability effettiva.' : 'A visible SSID, associated client, or RADIUS Access-Accept alone does not prove identity, negotiated protection, and applied policy. Always correlate RF, BSSID, AKM/cipher, PMF, EAP/RADIUS, and actual reachability.'}</p></aside>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="wireless-security-filter-title"><h2 id="wireless-security-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-cyan-700" aria-hidden="true" />{language === 'it' ? 'Filtra gli scenari' : 'Filter scenarios'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><FilterSelect label={language === 'it' ? 'Area wireless' : 'Wireless area'} value={area} onChange={value => setArea(value as 'all' | WirelessSecurityArea)} allLabel={language === 'it' ? 'Tutte le aree' : 'All areas'} options={AREAS.map(value => ({ value, label: AREA_LABELS[value][language] }))} /><FilterSelect label={language === 'it' ? 'Piano di sicurezza' : 'Security plane'} value={plane} onChange={value => setPlane(value as 'all' | SecurityPlane)} allLabel={language === 'it' ? 'Tutti i piani' : 'All planes'} options={PLANES.map(value => ({ value, label: PLANE_LABELS[value][language] }))} /></div></section>

      <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Segnali, minacce e prove' : 'Signals, threats, and proof'}</h2><span className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</span></div>
      {filtered.length > 0 ? <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Scenari sicurezza wireless' : 'Wireless security scenarios'}>{filtered.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 [content-visibility:auto] [contain-intrinsic-size:auto_720px]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700">{AREA_LABELS[item.area][language]}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.title[language]}</h3></div><div className="flex flex-wrap justify-end gap-1">{item.planes.map(value => <span key={value} className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-800">{PLANE_LABELS[value][language]}</span>)}</div></div>
        <Info icon={Radio} label={language === 'it' ? 'Comportamento normale' : 'Normal behavior'} tone="sky"><p>{item.normalBehavior[language]}</p></Info>
        <Info icon={AlertTriangle} label={language === 'it' ? 'Minaccia o failure mode' : 'Threat or failure mode'} tone="rose"><p>{item.threat[language]}</p></Info>
        <div className="grid gap-3 sm:grid-cols-2"><Info icon={Search} label={language === 'it' ? 'Evidenze' : 'Evidence'} tone="amber"><List items={item.evidence.map(value => value[language])} /></Info><Info icon={ShieldCheck} label={language === 'it' ? 'Controlli' : 'Controls'} tone="teal"><List items={item.controls.map(value => value[language])} /></Info></div>
        <Info icon={CheckCircle2} label={language === 'it' ? 'Verifica operativa' : 'Operational verification'} tone="emerald"><List items={item.verification.map(value => value[language])} /></Info>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700"><p className="text-[10px] font-semibold uppercase tracking-wider">{language === 'it' ? 'Limite tecnico' : 'Technical caveat'}</p><p className="mt-2 text-xs leading-relaxed">{item.caveat[language]}</p></div>
        <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche:' : 'Techniques:'}</strong> {item.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p><p className="mt-1"><strong>{language === 'it' ? 'Difese:' : 'Defenses:'}</strong> {item.controlIds.map(id => CONTROL_BY_ID.get(id)?.name[language]).join(' · ')}</p></div>
      </article>)}</section> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessuno scenario corrisponde ai filtri.' : 'No scenario matches the filters.'}</div>}
    </div>
  );
}

const TONES = { sky: 'border-sky-100 bg-sky-50/60 text-sky-950', rose: 'border-rose-100 bg-rose-50/60 text-rose-950', amber: 'border-amber-100 bg-amber-50/60 text-amber-950', teal: 'border-teal-100 bg-teal-50/60 text-teal-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' } as const;
function Info({ icon: Icon, label, tone, children }: { icon: typeof Radio; label: string; tone: keyof typeof TONES; children: ReactNode }) { return <section className={`mt-3 rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><div className="mt-2 text-xs leading-relaxed">{children}</div></section>; }
function List({ items }: { items: string[] }) { return <ul className="space-y-1.5">{items.map(item => <li key={item}>• {item}</li>)}</ul>; }
function FilterSelect({ label, value, onChange, allLabel, options }: { label: string; value: string; onChange: (value: string) => void; allLabel: string; options: Array<{ value: string; label: string }> }) { return <label className="text-xs text-slate-600">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"><option value="all">{allLabel}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
