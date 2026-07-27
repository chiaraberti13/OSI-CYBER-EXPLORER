import React from 'react';
import { useStore } from '../store';
import { Layers, Hash, Shield, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

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
    },
    {
      id: 'quiz' as const,
      en: 'Quiz',
      it: 'Quiz',
      icon: GraduationCap,
      color: 'text-rose-600',
      activeBg: 'bg-rose-50/50 text-rose-700 border-rose-200'
    }
  ];

  return (
    <div className="w-full bg-slate-50/40 border-b border-slate-100 py-3 sticky top-14 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center overflow-x-auto gap-1 sm:gap-2 no-scrollbar pb-1.5 sm:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all select-none whitespace-nowrap ${
                  isActive
                    ? tab.activeBg
                    : 'bg-white border-slate-100 text-slate-500 hover:text-slate-800 hover:border-slate-200/80'
                }`}
              >
                {/* Active Indicator Micro-Motion */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabOutline"
                    className="absolute inset-0 rounded-xl border-2 border-indigo-600 pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${tab.color}`} />
                <span>{language === 'en' ? tab.en : tab.it}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
