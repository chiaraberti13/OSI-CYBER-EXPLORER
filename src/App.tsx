/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from './components/Header';
import Navigation from './components/Navigation';
import OsiStack from './components/OsiStack';
import LayerDetails from './components/LayerDetails';
import PacketSimulator from './components/PacketSimulator';
import Terminal from './components/Terminal';
import PacketInspector from './components/PacketInspector';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import GuideModal from './components/GuideModal';
import GlossaryModal from './components/GlossaryModal';
import PortsModal from './components/PortsModal';
import SecurityDashboard from './components/SecurityDashboard';
import AttackLab from './components/AttackLab';
import { useStore } from './store';

export default function App() {
  const {
    isGuideOpen,
    setIsGuideOpen,
    activeView,
    language
  } = useStore();

  // Keep the document language + title in sync with the selected UI language.
  // This helps screen readers, browser hyphenation/translation and SEO.
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'it'
      ? 'OSI Cyber Explorer — Laboratorio interattivo di reti e cybersecurity'
      : 'OSI Cyber Explorer — Interactive networking & cybersecurity lab';
  }, [language]);

  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-blue-500/10">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto p-4 md:p-6 min-h-[75vh]">
        <AnimatePresence mode="wait">
          {activeView === 'osi' && (
            <motion.div
              key="osi"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left: Console log + Packet Inspector */}
              <section className="lg:col-span-3 xl:col-span-3 flex flex-col gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 px-1">
                    {language === 'it' ? 'Console' : 'Console'}
                  </h3>
                  <div className="h-[320px]">
                    <Terminal />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 px-1">
                    {language === 'it' ? 'Pacchetto' : 'Packet'}
                  </h3>
                  <PacketInspector />
                </div>
              </section>

              {/* Center: OSI Stack Hub & Controls */}
              <section className="lg:col-span-5 xl:col-span-5 space-y-6">
                <div className="space-y-3">
                   <h3 className="text-xs font-semibold text-slate-500 px-1">
                     {language === 'it' ? 'Simulatore' : 'Simulator'}
                   </h3>
                   <PacketSimulator />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="text-xs font-semibold text-slate-500 px-1">
                    {language === 'it' ? 'Pila OSI' : 'OSI Stack'}
                  </h3>
                  <OsiStack />
                </motion.div>
              </section>

              {/* Right: Technical Intelligence */}
              <section className="lg:col-span-4 xl:col-span-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 px-1">
                  {language === 'it' ? 'Dettagli del livello' : 'Layer details'}
                </h3>
                <LayerDetails />
              </section>
            </motion.div>
          )}

          {activeView === 'attacklab' && (
            <motion.div
              key="attacklab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <AttackLab />
            </motion.div>
          )}

          {activeView === 'ports' && (
            <motion.div
              key="ports"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <PortsModal inline={true} />
            </motion.div>
          )}

          {activeView === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <SecurityDashboard />
            </motion.div>
          )}

          {activeView === 'glossary' && (
            <motion.div
              key="glossary"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <GlossaryModal inline={true} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 mt-12 text-xs text-slate-400">
         <span className="font-semibold text-slate-500">OSI Cyber Explorer</span>
         <span>
           {language === 'it'
             ? 'App didattica · © 2026 Chiara Berti'
             : 'Educational app · © 2026 Chiara Berti'}
         </span>
      </footer>

      {/* Global Modals */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        language={language}
      />
    </div>
  );
}
