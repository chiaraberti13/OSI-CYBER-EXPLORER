import { useEffect, useRef, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { navGroupOf } from '../lib/navigation';
import ViewLink from './ViewLink';
import { uiMessages } from '../i18n';
import { PRIMARY, RAIL_VIEWS } from '../lib/primaryNav';
import { LabsList, BrandMark } from './primaryNav';

/**
 * The mobile navigation drawer. The primary menu lives in the fixed top bar (Topbar);
 * on phones it collapses behind the top bar's menu button, which opens this slide-in
 * drawer. There is no persistent vertical menu on desktop — the drawer only renders
 * below lg, so the content (and a view's own in-page navigation) keeps the full width.
 */
function DrawerNav({ onNavigate }: { onNavigate: () => void }) {
  const { language, activeView } = useStore(
    useShallow((state) => ({ language: state.language, activeView: state.activeView }))
  );
  const t = uiMessages(language).navigation;

  const activeGroup = navGroupOf(activeView);
  const labsHoldsActive = activeGroup?.id === 'labs' && !RAIL_VIEWS.has(activeView);

  const [labsOpen, setLabsOpen] = useState(labsHoldsActive);
  const [lastView, setLastView] = useState(activeView);
  if (lastView !== activeView) {
    setLastView(activeView);
    if (labsHoldsActive) setLabsOpen(true);
  }

  return (
    <nav aria-label={t.primary} className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
      {PRIMARY.map((item) => {
        const Icon = item.icon;
        if (item.view) {
          const isActive = activeView === item.view;
          return (
            <ViewLink
              key={item.view}
              view={item.view}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-accent-soft text-accent-strong' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? 'text-accent-strong' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span className="min-w-0">{item[language]}</span>
            </ViewLink>
          );
        }
        return (
          <div key="labs">
            <button
              type="button"
              onClick={() => setLabsOpen((open) => !open)}
              aria-expanded={labsOpen}
              aria-current={labsHoldsActive ? 'true' : undefined}
              aria-label={item[language]}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                labsHoldsActive
                  ? 'bg-accent-soft text-accent-strong'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${labsHoldsActive ? 'text-accent-strong' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 text-left">{item[language]}</span>
              <ChevronRight
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${labsOpen ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
            </button>
            {labsOpen ? (
              <div className="mt-0.5 border-l border-slate-200 pb-1 pl-3">
                <LabsList onNavigate={onNavigate} />
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const { language, activeView, isNavOpen, setIsNavOpen } = useStore(
    useShallow((state) => ({
      language: state.language,
      activeView: state.activeView,
      isNavOpen: state.isNavOpen,
      setIsNavOpen: state.setIsNavOpen
    }))
  );
  const t = uiMessages(language).navigation;
  const drawerRef = useRef<HTMLDivElement>(null);

  // The destination is reached, so the drawer gets out of the way.
  useEffect(() => {
    setIsNavOpen(false);
  }, [activeView, setIsNavOpen]);

  // Escape closes the drawer; focus the panel when it opens so keyboard users land inside.
  useEffect(() => {
    if (!isNavOpen) return;
    drawerRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isNavOpen, setIsNavOpen]);

  if (!isNavOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] lg:hidden">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => setIsNavOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        data-testid="app-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t.primary}
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex w-[82%] max-w-[18rem] flex-col bg-canvas shadow-xl outline-none"
      >
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-slate-900">OSI Cyber Explorer</span>
          </div>
          <button
            type="button"
            onClick={() => setIsNavOpen(false)}
            aria-label={t.close}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <DrawerNav onNavigate={() => setIsNavOpen(false)} />
      </div>
    </div>
  );
}
