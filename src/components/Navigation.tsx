import { useStore } from '../store';
import { Layers, Hash, Shield, BookOpen, Swords, Map, Calculator, Cable, Route } from 'lucide-react';

const TABS = [
    {
      id: 'curriculum' as const,
      en: 'CCNA Map',
      it: 'Mappa CCNA',
      icon: Map
    },
    {
      id: 'fundamentals' as const,
      en: 'IPv4 Lab',
      it: 'Lab IPv4',
      icon: Calculator
    },
    {
      id: 'access' as const,
      en: 'Network Access',
      it: 'Accesso alla rete',
      icon: Cable
    },
    {
      id: 'routing' as const,
      en: 'IP Connectivity',
      it: 'Routing IP',
      icon: Route
    },
    {
      id: 'osi' as const,
      en: 'OSI Stack Lab',
      it: 'Lab Pila OSI',
      icon: Layers
    },
    {
      id: 'attacklab' as const,
      en: 'Attack & Defense Lab',
      it: 'Lab Attacco & Difesa',
      icon: Swords
    },
    {
      id: 'ports' as const,
      en: 'Ports & Protocols',
      it: 'Porte & Protocolli',
      icon: Hash
    },
    {
      id: 'security' as const,
      en: 'Cybersecurity (IDS/IPS)',
      it: 'Cybersecurity (IDS/IPS)',
      icon: Shield
    },
    {
      id: 'glossary' as const,
      en: 'Network Glossary',
      it: 'Glossario di Rete',
      icon: BookOpen
    }
  ] as const;

export default function Navigation() {
  const { language, activeView, setActiveView } = useStore();

  return (
    <div className="w-full bg-[#fafafa]/70 border-b border-slate-200/60 py-2.5 sticky top-14 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center overflow-x-auto gap-0.5 sm:gap-1 no-scrollbar pb-1.5 sm:pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors select-none whitespace-nowrap ${
                  isActive
                    ? 'text-slate-900 bg-white border border-slate-200/70'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-white/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{language === 'en' ? tab.en : tab.it}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
