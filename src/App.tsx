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
import { motion, AnimatePresence } from 'motion/react';
import GuideModal from './components/GuideModal';
import GlossaryModal from './components/GlossaryModal';
import PortsModal from './components/PortsModal';
import QuizModal from './components/QuizModal';
import SecurityDashboard from './components/SecurityDashboard';
import { useStore } from './store';

export default function App() {
  const { 
    isGuideOpen, 
    setIsGuideOpen, 
    activeView,
    language 
  } = useStore();

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
              {/* Left: Terminal & Simulator Controls */}
              <section className="lg:col-span-3 xl:col-span-3 flex flex-col gap-8 lg:sticky lg:top-36">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
                    Console_Output
                    <span className="w-2 h-2 rounded-full bg-emerald-500/20" />
                  </h3>
                  <div className="h-[400px]">
                    <Terminal />
                  </div>
                </div>
              </section>

              {/* Center: OSI Stack Hub & Controls */}
              <section className="lg:col-span-5 xl:col-span-5 space-y-6">
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                     <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Simulation_Engine</h3>
                     <span className="text-[8px] font-mono text-slate-300">DRIVE_UNIT_v1.4</span>
                   </div>
                   <PacketSimulator />
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Architecture_Stack</h3>
                    <span className="text-[8px] font-mono text-slate-300">SYSTEM_CORE_PILA_OSI</span>
                  </div>
                  <OsiStack />
                </motion.div>
              </section>

              {/* Right: Technical Intelligence */}
              <section className="lg:col-span-4 xl:col-span-4 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Layer_Intelligence</h3>
                <LayerDetails />
              </section>
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

          {activeView === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <QuizModal inline={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex justify-between border-t border-slate-100 mt-12 text-[9px] font-mono font-bold text-slate-300 uppercase tracking-[0.3em]">
         <span>Node_ID: ais-pre-quhymgvpx</span>
         <span>© 2026 OSI_LAB_SYSTEMS</span>
         <span>Link_Status: Active</span>
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
