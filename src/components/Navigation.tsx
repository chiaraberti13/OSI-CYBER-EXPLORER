import { Activity, BookOpen, Cable, Calculator, FileSearch, Hash, Layers, LockKeyhole, Map, Route, ServerCog, Shield, Swords, Workflow } from 'lucide-react';
import { useStore, type AppView } from '../store';

const TAB_GROUPS = [
  {
    id: 'ccna', en: 'CCNA path', it: 'Percorso CCNA',
    tabs: [
      { id: 'curriculum', en: 'CCNA Map', it: 'Mappa CCNA', icon: Map },
      { id: 'fundamentals', en: 'IPv4 Lab', it: 'Lab IPv4', icon: Calculator },
      { id: 'access', en: 'Network Access', it: 'Accesso rete', icon: Cable },
      { id: 'routing', en: 'IP Connectivity', it: 'Routing IP', icon: Route },
      { id: 'services', en: 'IP Services', it: 'Servizi IP', icon: ServerCog },
      { id: 'securitycore', en: 'Security Fundamentals', it: 'Sicurezza CCNA', icon: LockKeyhole },
      { id: 'automation', en: 'Automation', it: 'Automazione', icon: Workflow }
    ]
  },
  {
    id: 'cross-labs', en: 'Cross-domain labs', it: 'Laboratori trasversali',
    tabs: [
      { id: 'coverage', en: 'Attack–Defense Catalog', it: 'Catalogo Attacco–Difesa', icon: Activity },
      { id: 'defense', en: 'Defense Lab', it: 'Lab Difese', icon: Shield },
      { id: 'evidence', en: 'Evidence Lab', it: 'Lab Evidenze', icon: FileSearch },
      { id: 'osi', en: 'OSI Stack Lab', it: 'Lab Pila OSI', icon: Layers },
      { id: 'attacklab', en: 'Attack & Defense Lab', it: 'Lab Attacco & Difesa', icon: Swords },
      { id: 'ports', en: 'Ports & Protocols', it: 'Porte & Protocolli', icon: Hash },
      { id: 'security', en: 'Cybersecurity (IDS/IPS)', it: 'Cybersecurity (IDS/IPS)', icon: Shield },
      { id: 'glossary', en: 'Network Glossary', it: 'Glossario di Rete', icon: BookOpen }
    ]
  }
] as const satisfies ReadonlyArray<{
  id: string;
  en: string;
  it: string;
  tabs: ReadonlyArray<{ id: AppView; en: string; it: string; icon: typeof Map }>;
}>;

export default function Navigation() {
  const { language, activeView, setActiveView } = useStore();

  return (
    <nav aria-label={language === 'it' ? 'Navigazione dei laboratori' : 'Lab navigation'} className="sticky top-14 z-40 w-full border-b border-slate-200/60 bg-[#fafafa]/80 py-2.5 backdrop-blur-md">
      <div className="mx-auto max-w-7xl space-y-2 px-6">
        {TAB_GROUPS.map(group => (
          <div key={group.id} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:w-32">{group[language]}</span>
            <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pb-1 no-scrollbar sm:gap-1 sm:pb-0">
              {group.tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative flex items-center gap-2 whitespace-nowrap rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors select-none ${isActive ? 'border-slate-200/70 bg-white text-slate-900' : 'border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-700'}`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} aria-hidden="true" />
                    <span>{tab[language]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
