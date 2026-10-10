/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import Header from './components/Header';
import Navigation from './components/Navigation';
import { motion, AnimatePresence } from 'motion/react';
import GuideModal from './components/GuideModal';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
import { Suspense, useEffect } from 'react';
import { useStore } from './store';
import { useShallow } from 'zustand/react/shallow';
import { VIEW_REGISTRY, type MotionPreset } from './content/viewRegistry';
import { viewTitle } from './lib/viewRouting';
import { uiMessages } from './i18n';

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
      {uiMessages(language).app.loadingModule}
    </div>
  );
}

export default function App() {
  const {
  isGuideOpen,
  setIsGuideOpen,
  activeView,
  setActiveView,
  language,
} = useStore(useShallow((state) => ({
  isGuideOpen: state.isGuideOpen,
  setIsGuideOpen: state.setIsGuideOpen,
  activeView: state.activeView,
  setActiveView: state.setActiveView,
  language: state.language,
})));

  // Each deep-linked lab has a bilingual title, including after history traversal.
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = viewTitle(activeView, language);
  }, [activeView, language]);

  const activeDefinition = VIEW_REGISTRY[activeView];
  const ActiveView = activeDefinition.component;
  const preset = MOTION_PRESETS[activeDefinition.motion ?? 'subtle'];
  const copy = uiMessages(language).app;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-700 selection:bg-indigo-500/10">
      {/*
        UX-02: the skip link is the first focusable element, so the first Tab offers
        to jump past the sticky header and navigation. It targets the main landmark
        by id, but must not mutate the router hash (`#/<view>`): writing `#main-content`
        to location.hash would fire the hashchange handler, resolve to an unknown
        route and canonicalise the user back to the OSI view. So it keeps the href for
        link semantics and no-JS crawlers, prevents the default jump, and moves focus
        to the main landmark programmatically instead.
      */}
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById('main-content');
          if (main) {
            main.focus();
            // scrollIntoView is unavailable in some non-browser test DOMs.
            main.scrollIntoView?.();
          }
        }}
      >
        {copy.skipToContent}
      </a>
      <Header />
      <Navigation />

      <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto p-4 md:p-6 min-h-[75vh]">
        {/*
          ENG-09: a lazy chunk that fails to download throws during render. The boundary
          wraps Suspense so it catches that rejection (and any render error in the view)
          and shows a recoverable panel instead of a blank page. `resetKeys={[activeView]}`
          clears the error when the user navigates elsewhere; the safe return sends them
          back to the always-available OSI overview without a reload.
        */}
        <ChunkErrorBoundary
          language={language}
          resetKeys={[activeView]}
          safeReturn={{
            label: copy.backToOsi,
            onAction: () => setActiveView('osi')
          }}
        >
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
        </ChunkErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60 mt-12 text-xs text-slate-400">
         <span className="font-medium text-slate-500 font-mono tracking-tight">osi·cyber·explorer</span>
         <span>
           {copy.footer}
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
