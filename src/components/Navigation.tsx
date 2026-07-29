import { useStore } from '../store';
import { Layers, Hash, Shield, BookOpen, Swords } from 'lucide-react';

export default function Navigation() {
  const { language, activeView, setActiveView } = useStore();

  const tabs = [
    {
      id: 'osi' as const,
      en: 'OSI Stack Lab',
      it: 'Lab Pila OSI',
      icon: Layers,
      color: 'text-indigo-600',
      activeBg: 'bg-indigo-50/50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'attacklab' as const,
      en: 'Attack & Defense Lab',
      it: 'Lab Attacco & Difesa',
      icon: Swords,
      color: 'text-red-600',
      activeBg: 'bg-red-50/50 text-red-700 border-red-200'
    },
    {
      id: 'ports' as const,
      en: 'Ports & Protocols',
      it: 'Porte & Protocolli',
      icon: Hash,
      color: 'text-purple-600',
      activeBg: 'bg-purple-50/50 text-purple-700 border-purple-200'
    },
    {
      id: 'security' as const,
      en: 'Cybersecurity (IDS/IPS)',
      it: 'Cybersecurity (IDS/IPS)',
      icon: Shield,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-50/50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'glossary' as const,
      en: 'Network Glossary',
      it: 'Glossario di Rete',
      icon: BookOpen,
      color: 'text-blue-600',
      activeBg: 'bg-blue-50/50 text-blue-700 border-blue-200'
    }
  ];

  return (
    <div className="w-full bg-[#fafafa]/70 border-b border-slate-200/60 py-2.5 sticky top-14 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center overflow-x-auto gap-0.5 sm:gap-1 no-scrollbar pb-1.5 sm:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
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
