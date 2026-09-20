import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity, BookOpen, Cable, Calculator, ChevronDown, FileCode2, FileSearch, Fingerprint, Gauge,
  Split,
  GitBranch, GlobeLock, Hash, HeartPulse, KeyRound, Laptop, Layers, Layers3, LockKeyhole, Map,
  MailWarning, Network, Radar, Radio, Route, Router, Search, ServerCog, Shield, ShieldAlert,
  Swords, Workflow, X
} from 'lucide-react';
import { NAV_GROUPS, navEntryOf, navGroupOf, searchNav } from '../lib/navigation';
import { useStore, type AppView } from '../store';

const VIEW_ICONS: Record<AppView, typeof Map> = {
  curriculum: Map,
  pathtrace: Split,
  fundamentals: Calculator,
  access: Cable,
  routing: Route,
  services: ServerCog,
  securitycore: LockKeyhole,
  automation: Workflow,
  osi: Layers,
  attacklab: Swords,
  ports: Hash,
  security: Shield,
  glossary: BookOpen,
  layer2security: Cable,
  wirelesssecurity: Radio,
  routingsecurity: Router,
  ipv6security: Network,
  segmentation: Layers3,
  identitytrust: Fingerprint,
  vpnsecurity: KeyRound,
  inspection: ShieldAlert,
  managementsecurity: ServerCog,
  endpointsecurity: Laptop,
  applicationsecurity: GlobeLock,
  emailsecurity: MailWarning,
  coverage: Activity,
  attackpaths: GitBranch,
  detection: Radar,
  hardening: FileCode2,
  availability: Gauge,
  recovery: HeartPulse,
  evidence: FileSearch,
  defense: Shield
};

export default function Navigation() {
  const { language, activeView, setActiveView } = useStore();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);

  const navRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeGroup = navGroupOf(activeView);
  const activeEntry = navEntryOf(activeView);
  const results = useMemo(() => searchNav(query, language), [query, language]);

  const labels = language === 'it'
    ? { nav: 'Navigazione dei laboratori', search: 'Cerca un laboratorio', searchHint: 'Cerca per nome, protocollo o argomento…', close: 'Chiudi', noResults: 'Nessun laboratorio corrisponde alla ricerca.', current: 'Sei qui', open: 'Apri il menu', results: 'Risultati della ricerca' }
    : { nav: 'Lab navigation', search: 'Search for a lab', searchHint: 'Search by name, protocol, or topic…', close: 'Close', noResults: 'No lab matches your search.', current: 'You are here', open: 'Open menu', results: 'Search results' };

  // Close the menus whenever the view changes: the destination is reached, so the chrome
  // gets out of the way. The view can also change from another component, so this is
  // adjusted during render rather than in an effect, which would commit an open panel
  // over the new view and then close it on a second render.
  const [lastView, setLastView] = useState(activeView);
  if (lastView !== activeView) {
    setLastView(activeView);
    setOpenGroupId(null);
    setIsSearchOpen(false);
    setQuery('');
  }

  // Ctrl/Cmd+K opens the quick search; Escape closes whatever is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpenGroupId(null);
        setIsSearchOpen(current => !current);
        return;
      }
      if (event.key === 'Escape') {
        setOpenGroupId(null);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // A click anywhere outside the navigation dismisses the open panel.
  useEffect(() => {
    if (!openGroupId && !isSearchOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroupId(null);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [openGroupId, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted(index => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted(index => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      setActiveView(results[highlighted].entry.view);
    }
  };

  const openGroup = NAV_GROUPS.find(group => group.id === openGroupId) ?? null;

  return (
    <nav ref={navRef} aria-label={labels.nav} className="sticky top-14 z-40 w-full border-b border-slate-200/60 bg-[#fafafa]/85 backdrop-blur-md">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex h-12 items-center gap-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar">
            {NAV_GROUPS.map(group => {
              const isOpen = openGroupId === group.id;
              const holdsActiveView = activeGroup?.id === group.id;
              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => { setIsSearchOpen(false); setOpenGroupId(isOpen ? null : group.id); }}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  aria-controls={`nav-panel-${group.id}`}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    isOpen
                      ? 'border-slate-300 bg-white text-slate-900'
                      : holdsActiveView
                        ? 'border-slate-200/70 bg-white text-slate-900'
                        : 'border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-800'
                  }`}
                >
                  {holdsActiveView ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden="true" /> : null}
                  <span className="hidden sm:inline">{group[language]}</span>
                  <span className="sm:hidden">{language === 'it' ? group.itShort : group.enShort}</span>
                  <span className="hidden text-[10px] font-normal text-slate-400 sm:inline">{group.entries.length}</span>
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          {activeEntry ? (
            <p className="hidden shrink-0 items-center gap-1.5 truncate pl-2 text-[11px] text-slate-400 lg:flex" aria-live="polite">
              <span className="eyebrow">{labels.current}</span>
              <span className="font-medium text-slate-600">{activeEntry[language]}</span>
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => { setOpenGroupId(null); setIsSearchOpen(open => !open); }}
            aria-expanded={isSearchOpen}
            aria-label={labels.search}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200/70 bg-white px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <kbd className="hidden font-mono text-[10px] text-slate-400 xl:inline">⌘K</kbd>
          </button>
        </div>

        <AnimatePresence>
          {openGroup ? (
            <motion.div
              key={openGroup.id}
              id={`nav-panel-${openGroup.id}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              className="absolute inset-x-6 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg custom-scrollbar"
            >
              <p className="eyebrow px-1 pb-2">{openGroup[language]}</p>
              <ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                {openGroup.entries.map(entry => {
                  const Icon = VIEW_ICONS[entry.view];
                  const isActive = activeView === entry.view;
                  return (
                    <li key={entry.view}>
                      <button
                        type="button"
                        onClick={() => setActiveView(entry.view)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                          isActive ? 'border-indigo-200 bg-indigo-50/60' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} aria-hidden="true" />
                        <span className="min-w-0">
                          <span className={`block text-[13px] font-medium ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{entry[language]}</span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{language === 'it' ? entry.hintIt : entry.hintEn}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ) : null}

          {isSearchOpen ? (
            <motion.div
              key="nav-search"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              role="dialog"
              aria-modal="false"
              aria-label={labels.search}
              className="absolute inset-x-6 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={event => { setQuery(event.target.value); setHighlighted(0); }}
                  onKeyDown={onSearchKeyDown}
                  placeholder={labels.searchHint}
                  aria-label={labels.search}
                  aria-controls="nav-search-results"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} aria-label={labels.close} className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">{labels.noResults}</p>
              ) : (
                <ul id="nav-search-results" aria-label={labels.results} className="max-h-[60vh] overflow-y-auto p-1.5 custom-scrollbar">
                  {results.map((item, index) => {
                    const Icon = VIEW_ICONS[item.entry.view];
                    const isHighlighted = index === highlighted;
                    return (
                      <li key={item.entry.view}>
                        <button
                          type="button"
                          onClick={() => setActiveView(item.entry.view)}
                          onMouseEnter={() => setHighlighted(index)}
                          aria-current={activeView === item.entry.view ? 'page' : undefined}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${isHighlighted ? 'bg-slate-100' : ''}`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-slate-800">{item.entry[language]}</span>
                            <span className="block truncate text-[11px] text-slate-500">{language === 'it' ? item.entry.hintIt : item.entry.hintEn}</span>
                          </span>
                          <span className="eyebrow shrink-0">{language === 'it' ? item.group.itShort : item.group.enShort}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </nav>
  );
}
