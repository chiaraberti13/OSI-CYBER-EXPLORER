import { useEffect, useRef, useState } from 'react';
import { BookOpen, FlaskConical, Library, Map as MapIcon, Network, X, LifeBuoy, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { NAV_GROUPS, navGroupOf } from '../lib/navigation';
import { LAB_CATEGORIES } from '../content/viewRegistry';
import ViewLink from './ViewLink';
import { uiMessages } from '../i18n';
import type { AppView } from '../store';
import type { LucideIcon } from 'lucide-react';

/**
 * Primary navigation as a persistent left sidebar — the dashboard/app pattern the
 * learner asked for. On desktop (lg+) it is always visible and always labelled, so
 * every destination is one click away without a horizontal tab strip to scroll. On
 * mobile it collapses to a drawer opened from the top bar's menu button. This single
 * vertical surface replaces the two stacked top bars (brand header + horizontal tab
 * switcher) the earlier layout used. Quick search and the copy-link control live in
 * the slim top bar (Topbar).
 */

interface PrimaryItem {
  /** The view a single-destination item opens. */
  view?: AppView;
  /** A group id whose entries expand in a secondary list (Laboratori). */
  group?: 'labs';
  it: string;
  en: string;
  icon: LucideIcon;
}

// The top-level destinations, in study order. Glossario and Porte are promoted out of
// the labs list to their own entries; the Laboratori disclosure then omits them.
const PRIMARY: PrimaryItem[] = [
  { view: 'manual', it: 'Manuale', en: 'Manual', icon: BookOpen },
  { group: 'labs', it: 'Laboratori', en: 'Labs', icon: FlaskConical },
  { view: 'glossary', it: 'Glossario', en: 'Glossary', icon: Library },
  { view: 'curriculum', it: 'Mappa CCNA', en: 'CCNA map', icon: MapIcon },
  { view: 'ports', it: 'Porte e protocolli', en: 'Ports & protocols', icon: Network }
];

const RAIL_VIEWS = new Set<AppView>(['glossary', 'ports']);

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { language, activeView, setIsGuideOpen, setLanguage } = useStore(
    useShallow((state) => ({
      language: state.language,
      activeView: state.activeView,
      setIsGuideOpen: state.setIsGuideOpen,
      setLanguage: state.setLanguage
    }))
  );
  const t = uiMessages(language).navigation;
  const header = uiMessages(language).header;

  const activeGroup = navGroupOf(activeView);
  const labsHoldsActive = activeGroup?.id === 'labs' && !RAIL_VIEWS.has(activeView);
  const labsGroup = NAV_GROUPS.find((group) => group.id === 'labs');

  const [labsOpen, setLabsOpen] = useState(labsHoldsActive);
  // Reveal the labs list whenever the learner lands on a lab, so the active item is never
  // hidden inside a collapsed disclosure. Adjusted during render (not in an effect) keyed on
  // the active view — the pattern React recommends for state derived from a changing input.
  const [lastActiveView, setLastActiveView] = useState(activeView);
  if (lastActiveView !== activeView) {
    setLastActiveView(activeView);
    if (labsHoldsActive) setLabsOpen(true);
  }

  const labsPanel =
    labsOpen && labsGroup ? (
      <div className="mt-0.5 space-y-2 border-l border-slate-200 pb-1 pl-3">
        {LAB_CATEGORIES.map((category) => {
          const entries = labsGroup.entries.filter(
            (entry) => entry.category === category.id && !RAIL_VIEWS.has(entry.view)
          );
          if (entries.length === 0) return null;
          return (
            <div key={category.id}>
              <p className="eyebrow px-1 pb-1">{language === 'it' ? category.it : category.en}</p>
              <ul className="space-y-0.5">
                {entries.map((entry) => {
                  const Icon = entry.icon;
                  const isActive = activeView === entry.view;
                  return (
                    <li key={entry.view}>
                      <ViewLink
                        view={entry.view}
                        onClick={onNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex min-h-10 items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] ${
                          isActive
                            ? 'bg-indigo-50 font-semibold text-indigo-800'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="min-w-0">{entry[language]}</span>
                      </ViewLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    ) : null;

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
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span className="min-w-0">{item[language]}</span>
            </ViewLink>
          );
        }
        // Laboratori: a disclosure revealing the area-grouped lab list.
        return (
          <div key="labs">
            <button
              type="button"
              onClick={() => setLabsOpen((open) => !open)}
              aria-expanded={labsOpen}
              aria-current={labsHoldsActive ? 'true' : undefined}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                labsHoldsActive
                  ? 'bg-indigo-50 text-indigo-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${labsHoldsActive ? 'text-indigo-600' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 text-left">{item[language]}</span>
              <ChevronRight
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${labsOpen ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
            </button>
            {labsPanel}
          </div>
        );
      })}

      {/* Footer: guide + language, pinned to the bottom of the nav column. */}
      <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/70 px-1 pt-3">
        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          aria-haspopup="dialog"
          aria-label={header.openGuide}
          className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LifeBuoy className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <span>{header.guide}</span>
        </button>
        <div className="flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label={header.language}>
          <button
            type="button"
            onClick={() => setLanguage('it')}
            aria-pressed={language === 'it'}
            aria-label="Italiano"
            className={`min-h-9 flex-1 rounded-md px-2.5 text-xs font-semibold transition-all ${
              language === 'it' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            IT
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
            aria-label="English"
            className={`min-h-9 flex-1 rounded-md px-2.5 text-xs font-semibold transition-all ${
              language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3.5">
      {/* App mark: a stack of OSI layers on the brand tile, the top layer cyan (the
          cyber accent). Identical to the favicon so tab and sidebar match. */}
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 shrink-0">
        <rect x="1" y="1" width="30" height="30" rx="7.5" fill="#4f46e5" />
        <rect x="7.5" y="8.5" width="17" height="4.2" rx="2.1" fill="#22d3ee" />
        <rect x="7.5" y="13.9" width="17" height="4.2" rx="2.1" fill="#ffffff" />
        <rect x="7.5" y="19.3" width="17" height="4.2" rx="2.1" fill="#ffffff" opacity="0.72" />
      </svg>
      <span className="text-sm font-semibold tracking-tight text-slate-900">OSI Cyber Explorer</span>
    </div>
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

  return (
    <>
      {/* Desktop: persistent sidebar, always visible and labelled. */}
      <aside
        data-testid="app-sidebar"
        className="sticky top-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-200/70 bg-canvas lg:flex"
      >
        <Brand />
        <SidebarContent />
      </aside>

      {/* Mobile drawer, opened from the top bar's menu button. */}
      {isNavOpen ? (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsNavOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.primary}
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[82%] max-w-[18rem] flex-col bg-canvas shadow-xl outline-none"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                aria-label={t.close}
                className="mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setIsNavOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
