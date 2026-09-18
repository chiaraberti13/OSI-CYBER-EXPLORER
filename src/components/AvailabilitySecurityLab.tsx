import { useMemo, useState, type ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Filter, Gauge, Search, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { AVAILABILITY_SCENARIOS, type AvailabilityArea } from '../content/availabilityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import type { SecurityPlane } from '../content/securityTaxonomy';

const AREAS: AvailabilityArea[] = ['bandwidth', 'tcp-state', 'reflection', 'control-plane', 'layer2', 'ipv6', 'services', 'nat', 'qos'];
const PLANES: SecurityPlane[] = ['physical', 'data', 'control', 'application', 'management'];
const AREA_LABELS: Record<AvailabilityArea, { it: string; en: string }> = {
  bandwidth: { it: 'Banda e link', en: 'Bandwidth and links' }, 'tcp-state': { it: 'Stato TCP', en: 'TCP state' },
  reflection: { it: 'Reflection UDP', en: 'UDP reflection' }, 'control-plane': { it: 'Control plane', en: 'Control plane' },
  layer2: { it: 'Risorse Layer 2', en: 'Layer 2 resources' }, ipv6: { it: 'Risorse IPv6', en: 'IPv6 resources' },
  services: { it: 'Servizi DNS', en: 'DNS services' }, nat: { it: 'NAT e firewall', en: 'NAT and firewalls' }, qos: { it: 'QoS e code', en: 'QoS and queues' }
};
const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' }, data: { it: 'Dati', en: 'Data' }, control: { it: 'Controllo', en: 'Control' },
  management: { it: 'Gestione', en: 'Management' }, application: { it: 'Applicazione', en: 'Application' }, identity: { it: 'Identità', en: 'Identity' }
};
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));

export default function AvailabilitySecurityLab() {
  const language = useStore(state => state.language);
  const [area, setArea] = useState<'all' | AvailabilityArea>('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => AVAILABILITY_SCENARIOS.filter(item => (area === 'all' || item.area === area) && (plane === 'all' || item.planes.includes(plane))), [area, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-orange-50 p-3 text-orange-700"><Gauge className="h-6 w-6" aria-hidden="true" /></div><div><p className="eyebrow">CAPACITY · STATE · QUEUES · RECOVERY</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio disponibilità, DoS e capacità' : 'Availability, DoS & Capacity Lab'}</h1><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Identifica quale risorsa si esaurisce davvero: banda, packet rate, CPU, backlog, CAM, lease, neighbor, stato, worker o coda. Ogni scenario collega il collo di bottiglia a evidenze, mitigazione e prova di continuità.' : 'Identify which resource is actually exhausted: bandwidth, packet rate, CPU, backlog, CAM, leases, neighbors, state, workers, or queues. Each scenario connects the bottleneck to evidence, mitigation, and continuity proof.'}</p></div></div></header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo disponibilità' : 'Availability summary'}>{[{ value: AVAILABILITY_SCENARIOS.length, it: 'Scenari di capacità', en: 'Capacity scenarios' }, { value: new Set(AVAILABILITY_SCENARIOS.flatMap(item => item.techniqueIds)).size, it: 'Tecniche correlate', en: 'Related techniques' }, { value: AVAILABILITY_SCENARIOS.reduce((total, item) => total + item.verification.length, 0), it: 'Prove di continuità', en: 'Continuity proofs' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}</section>

      <aside className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 text-orange-950"><p className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Regola di diagnosi' : 'Diagnostic rule'}</p><p className="mt-2 text-xs leading-relaxed">{language === 'it' ? '“Traffico alto” non identifica il guasto. Prima di mitigare separa bit/s, packet/s, CPU, queue, backlog e stato; poi individua se il punto di enforcement è prima o dopo il collo di bottiglia.' : '“High traffic” does not identify the failure. Before mitigating, separate bit/s, packet/s, CPU, queues, backlog, and state; then determine whether enforcement sits before or after the bottleneck.'}</p></aside>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="availability-filter-title"><h2 id="availability-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-orange-700" aria-hidden="true" />{language === 'it' ? 'Filtra gli scenari' : 'Filter scenarios'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><FilterSelect label={language === 'it' ? 'Risorsa o area' : 'Resource or area'} value={area} onChange={value => setArea(value as 'all' | AvailabilityArea)} allLabel={language === 'it' ? 'Tutte le aree' : 'All areas'} options={AREAS.map(value => ({ value, label: AREA_LABELS[value][language] }))} /><FilterSelect label={language === 'it' ? 'Piano di sicurezza' : 'Security plane'} value={plane} onChange={value => setPlane(value as 'all' | SecurityPlane)} allLabel={language === 'it' ? 'Tutti i piani' : 'All planes'} options={PLANES.map(value => ({ value, label: PLANE_LABELS[value][language] }))} /></div></section>

      <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Risorse, saturazione e continuità' : 'Resources, saturation, and continuity'}</h2><span className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</span></div>
      {filtered.length > 0 ? <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Scenari disponibilità e DoS' : 'Availability and DoS scenarios'}>{filtered.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 deferred-card [contain-intrinsic-height:auto_760px]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-orange-700">{AREA_LABELS[item.area][language]}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.title[language]}</h3></div><div className="flex flex-wrap justify-end gap-1">{item.planes.map(value => <span key={value} className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-800">{PLANE_LABELS[value][language]}</span>)}</div></div>
        <Info icon={Gauge} label={language === 'it' ? 'Risorsa critica' : 'Critical resource'} tone="sky"><p>{item.resource[language]}</p></Info>
        <Info icon={AlertTriangle} label={language === 'it' ? 'Meccanismo di saturazione' : 'Saturation mechanism'} tone="rose"><p>{item.saturationMechanism[language]}</p></Info>
        <div className="grid gap-3 sm:grid-cols-2"><Info icon={Search} label={language === 'it' ? 'Evidenze' : 'Evidence'} tone="amber"><List items={item.evidence.map(value => value[language])} /></Info><Info icon={ShieldCheck} label={language === 'it' ? 'Controlli' : 'Controls'} tone="teal"><List items={item.controls.map(value => value[language])} /></Info></div>
        <Info icon={CheckCircle2} label={language === 'it' ? 'Verifica della continuità' : 'Continuity verification'} tone="emerald"><List items={item.verification.map(value => value[language])} /></Info>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700"><p className="text-[10px] font-semibold uppercase tracking-wider">{language === 'it' ? 'Limite tecnico' : 'Technical caveat'}</p><p className="mt-2 text-xs leading-relaxed">{item.caveat[language]}</p></div>
        <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche:' : 'Techniques:'}</strong> {item.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p><p className="mt-1"><strong>{language === 'it' ? 'Difese:' : 'Defenses:'}</strong> {item.controlIds.map(id => CONTROL_BY_ID.get(id)?.name[language]).join(' · ')}</p></div>
      </article>)}</section> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessuno scenario corrisponde ai filtri.' : 'No scenario matches the filters.'}</div>}
    </div>
  );
}

const TONES = { sky: 'border-sky-100 bg-sky-50/60 text-sky-950', rose: 'border-rose-100 bg-rose-50/60 text-rose-950', amber: 'border-amber-100 bg-amber-50/60 text-amber-950', teal: 'border-teal-100 bg-teal-50/60 text-teal-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' } as const;
function Info({ icon: Icon, label, tone, children }: { icon: typeof Gauge; label: string; tone: keyof typeof TONES; children: ReactNode }) { return <section className={`mt-3 rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><div className="mt-2 text-xs leading-relaxed">{children}</div></section>; }
function List({ items }: { items: string[] }) { return <ul className="space-y-1.5">{items.map(item => <li key={item}>• {item}</li>)}</ul>; }
function FilterSelect({ label, value, onChange, allLabel, options }: { label: string; value: string; onChange: (value: string) => void; allLabel: string; options: Array<{ value: string; label: string }> }) { return <label className="text-xs text-slate-600">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"><option value="all">{allLabel}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
