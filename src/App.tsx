/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import Header from './components/Header';
import Navigation from './components/Navigation';
import { motion, AnimatePresence } from 'motion/react';
import GuideModal from './components/GuideModal';
import { lazy, Suspense, useEffect } from 'react';
import { useStore } from './store';

const GlossaryModal = lazy(() => import('./components/GlossaryModal'));
const PortsModal = lazy(() => import('./components/PortsExplorer'));
const SecurityDashboard = lazy(() => import('./components/SecurityDashboard'));
const AttackLab = lazy(() => import('./components/AttackLab'));
const CurriculumView = lazy(() => import('./components/CurriculumView'));
const OsiLabView = lazy(() => import('./components/OsiLabView'));
const NetworkFundamentalsLab = lazy(() => import('./components/NetworkFundamentalsLab'));
const NetworkAccessLab = lazy(() => import('./components/NetworkAccessLab'));
const IpConnectivityLab = lazy(() => import('./components/IpConnectivityLab'));
const IpServicesLab = lazy(() => import('./components/IpServicesLab'));
const SecurityFundamentalsLab = lazy(() => import('./components/SecurityFundamentalsLab'));
const AutomationLab = lazy(() => import('./components/AutomationLab'));
const SecurityCoverageView = lazy(() => import('./components/SecurityCoverageView'));
const SecurityEvidenceLab = lazy(() => import('./components/SecurityEvidenceLab'));
const DefenseControlsLab = lazy(() => import('./components/DefenseControlsLab'));

function ViewFallback({ language }: { language: 'it' | 'en' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500" role="status">
      {language === 'it' ? 'Caricamento del modulo…' : 'Loading module…'}
    </div>
  );
}

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
    <div className="min-h-screen bg-[#fafafa] text-slate-700 selection:bg-indigo-500/10">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto p-4 md:p-6 min-h-[75vh]">
        <Suspense fallback={<ViewFallback language={language} />}>
        <AnimatePresence mode="wait">
          {activeView === 'curriculum' && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <CurriculumView />
            </motion.div>
          )}

          {activeView === 'osi' && (
            <motion.div
              key="osi"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <OsiLabView />
            </motion.div>
          )}

          {activeView === 'fundamentals' && (
            <motion.div
              key="fundamentals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <NetworkFundamentalsLab />
            </motion.div>
          )}

          {activeView === 'access' && (
            <motion.div
              key="access"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <NetworkAccessLab />
            </motion.div>
          )}

          {activeView === 'routing' && (
            <motion.div
              key="routing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <IpConnectivityLab />
            </motion.div>
          )}

          {activeView === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <IpServicesLab />
            </motion.div>
          )}

          {activeView === 'securitycore' && (
            <motion.div
              key="securitycore"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SecurityFundamentalsLab />
            </motion.div>
          )}

          {activeView === 'automation' && (
            <motion.div
              key="automation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <AutomationLab />
            </motion.div>
          )}

          {activeView === 'coverage' && (
            <motion.div
              key="coverage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <SecurityCoverageView />
            </motion.div>
          )}

          {activeView === 'evidence' && (
            <motion.div key="evidence" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <SecurityEvidenceLab />
            </motion.div>
          )}

          {activeView === 'defense' && (
            <motion.div key="defense" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}><DefenseControlsLab /></motion.div>
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
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60 mt-12 text-xs text-slate-400">
         <span className="font-medium text-slate-500 font-mono tracking-tight">osi·cyber·explorer</span>
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
