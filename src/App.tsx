/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import Header from './components/Header';
import Navigation from './components/Navigation';
import { motion, AnimatePresence } from 'motion/react';
import GuideModal from './components/GuideModal';
import { Suspense, useEffect } from 'react';
import { useStore } from './store';
import { VIEW_REGISTRY, type MotionPreset } from './content/viewRegistry';

/**
 * Entrance/exit animations for a view switch, resolved from the `motion` preset each
 * view declares in the registry. Keeping the concrete values here keeps presentation
 * in the component while the registry stays declarative.
 */
const MOTION_PRESETS: Record<MotionPreset, {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  exit: { opacity: number; y: number };
  transition: { duration: number };
}> = {
  subtle: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.18 }
  },
  pronounced: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: 0.2 }
  }
};

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

  const activeDefinition = VIEW_REGISTRY[activeView];
  const ActiveView = activeDefinition.component;
  const preset = MOTION_PRESETS[activeDefinition.motion ?? 'subtle'];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-700 selection:bg-indigo-500/10">
      <Header />
      <Navigation />

      <main className="max-w-7xl mx-auto p-4 md:p-6 min-h-[75vh]">
        <Suspense fallback={<ViewFallback language={language} />}>
          <AnimatePresence mode="wait">
            {/*
              A single registry-driven switch replaces the former per-view blocks:
              `key={activeView}` drives the exit/enter animation, the preset comes from
              the view's declared motion, and only the embeddable views receive `inline`.
            */}
            <motion.div
              key={activeView}
              initial={preset.initial}
              animate={preset.animate}
              exit={preset.exit}
              transition={preset.transition}
            >
              {activeDefinition.inline ? <ActiveView inline={true} /> : <ActiveView />}
            </motion.div>
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
