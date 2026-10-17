import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Link2, LifeBuoy, Menu, Search, X } from 'lucide-react';
import { searchNav, navGroupOf } from '../lib/navigation';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import ViewLink from './ViewLink';
import { viewHash } from '../lib/viewRouting';
import { formatSearchResultCount, uiMessages } from '../i18n';
import { PRIMARY, RAIL_VIEWS } from '../lib/primaryNav';
import { LabsList, BrandMark } from './primaryNav';

/**
 * The fixed top bar. It is the app's primary chrome: the brand, the primary navigation
 * (inline on desktop, a drawer via the menu button on mobile) and the global utilities —
 * quick search (Ctrl/Cmd+K), copy-link, the language toggle and the guide. Keeping the
 * menu here, as a handful of horizontal items plus a Laboratori dropdown, avoids both the
 * scrolling tab strip of the old layout and a second vertical menu beside a view's own
 * in-page navigation (e.g. the manual's chapter tree).
 */
export default function Topbar() {
  const { language, activeView, setActiveView, setIsNavOpen, setIsGuideOpen, setLanguage } = useStore(
    useShallow((state) => ({
      language: state.language,
      activeView: state.activeView,
      setActiveView: state.setActiveView,
      setIsNavOpen: state.setIsNavOpen,
      setIsGuideOpen: state.setIsGuideOpen,
      setLanguage: state.setLanguage
    }))
  );
  const labels = uiMessages(language).navigation;
  const header = uiMessages(language).header;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [labsOpen, setLabsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => searchNav(query, language), [query, language]);
  const activeGroup = navGroupOf(activeView);
  const labsHoldsActive = activeGroup?.id === 'labs' && !RAIL_VIEWS.has(activeView);

  // UX-03: an editable combobox owns a listbox popup. Each option needs a stable id so
  // `aria-activedescendant` can point at the highlighted one while focus stays in the field.
  const SEARCH_LISTBOX_ID = 'nav-search-results';
  const LABS_MENU_ID = 'primary-labs-menu';
  const optionId = (view: string) => `nav-search-option-${view}`;
  const activeOptionId = results.length > 0 ? optionId(results[highlighted]?.entry.view) : undefined;
  const resultAnnouncement =
    results.length === 0 ? labels.noResults : formatSearchResultCount(language, results.length);

  // Reaching a destination closes the chrome (adjusted during render, not in an effect).
  const [lastView, setLastView] = useState(activeView);
  if (lastView !== activeView) {
    setLastView(activeView);
    setIsSearchOpen(false);
    setLabsOpen(false);
    setQuery('');
  }

  // Ctrl/Cmd+K toggles the quick search; Escape closes whatever is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setLabsOpen(false);
        setIsSearchOpen((current) => !current);
        return;
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setLabsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // A click outside the bar dismisses the open panels.
  useEffect(() => {
    if (!isSearchOpen && !labsOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setLabsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isSearchOpen, labsOpen]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    []
  );

  // UX-06: copy a shareable link to the current view. Clipboard access can be denied
  // (insecure context, permissions); failing quietly keeps the control harmless.
  const copyCurrentLink = async () => {
    const { origin, pathname, search } = window.location;
    const url = `${origin}${pathname}${search}${viewHash(activeView)}`;
    try {
      await navigator.clipboard?.writeText(url);
      setLinkCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard unavailable: leave the affordance unchanged rather than erroring.
    }
  };

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      setActiveView(results[highlighted].entry.view);
    }
  };

  const navItemClass = (active: boolean) =>
    `flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium transition-colors ${
      active ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header ref={barRef} className="sticky top-0 z-40 border-b border-slate-200/70 bg-canvas/90 backdrop-blur-md">
      <div className="relative flex h-14 items-center gap-2 px-3 sm:px-5">
        {/* Mobile menu button opens the navigation drawer. */}
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          aria-label={labels.menu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Brand. The mark shows at every width; the wordmark only from sm to save phone space. */}
        <ViewLink view="manual" aria-label="OSI Cyber Explorer" className="flex shrink-0 items-center gap-2.5 px-1">
          <BrandMark className="h-7 w-7" />
          <span className="hidden text-sm font-semibold tracking-tight text-slate-900 sm:inline">
            OSI Cyber Explorer
          </span>
        </ViewLink>

        {/* Desktop inline primary navigation. */}
        <nav aria-label={labels.primary} className="ml-2 hidden items-center gap-0.5 lg:flex">
          {PRIMARY.map((item) => {
            const Icon = item.icon;
            const short = language === 'it' ? item.shortIt : item.shortEn;
            if (item.view) {
              const isActive = activeView === item.view;
              return (
                <ViewLink
                  key={item.view}
                  view={item.view}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item[language]}
                  className={navItemClass(isActive)}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                    aria-hidden="true"
                  />
                  {short}
                </ViewLink>
              );
            }
            return (
              <button
                key="labs"
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setLabsOpen((open) => !open);
                }}
                aria-expanded={labsOpen}
                aria-haspopup="true"
                aria-controls={LABS_MENU_ID}
                aria-current={labsHoldsActive ? 'true' : undefined}
                aria-label={item[language]}
                className={navItemClass(labsHoldsActive || labsOpen)}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${labsHoldsActive || labsOpen ? 'text-indigo-600' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                {short}
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${labsOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1" />

        <button
          type="button"
          onClick={() => {
            setLabsOpen(false);
            setIsSearchOpen((open) => !open);
          }}
          aria-expanded={isSearchOpen}
          aria-label={labels.search}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200/70 bg-white px-2.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-800 sm:px-3"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{labels.search}</span>
          <kbd className="ml-1 hidden font-mono text-[10px] text-slate-400 xl:inline">⌘K</kbd>
        </button>

        {/* Copy-link is a desktop convenience; hidden on the phone to keep the bar within 320 px. */}
        <button
          type="button"
          onClick={copyCurrentLink}
          aria-label={labels.copyLink}
          title={labels.copyLink}
          className="hidden min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-slate-500 transition-colors hover:text-slate-800 sm:flex"
        >
          {linkCopied ? (
            <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <div className="flex shrink-0 rounded-lg bg-slate-100 p-0.5" role="group" aria-label={header.language}>
          <button
            type="button"
            onClick={() => setLanguage('it')}
            aria-pressed={language === 'it'}
            aria-label="Italiano"
            className={`min-h-10 rounded-md px-2.5 text-xs font-semibold transition-all ${
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
            className={`min-h-10 rounded-md px-2.5 text-xs font-semibold transition-all ${
              language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            EN
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          aria-haspopup="dialog"
          aria-label={header.openGuide}
          title={header.guide}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LifeBuoy className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="hidden sm:inline">{header.guide}</span>
        </button>
      </div>

      {/* Off-screen live region: confirms the copy without moving focus. */}
      <span className="sr-only" role="status" aria-live="polite">
        {linkCopied ? labels.linkCopied : ''}
      </span>

      <AnimatePresence>
        {labsOpen ? (
          <motion.div
            key="labs-menu"
            id={LABS_MENU_ID}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-3 top-full z-50 mt-1 max-h-[70vh] w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg custom-scrollbar sm:left-5"
          >
            <LabsList onNavigate={() => setLabsOpen(false)} />
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
            className="absolute inset-x-3 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg sm:inset-x-5 sm:left-auto sm:right-5 sm:w-[28rem]"
          >
            <div className="flex min-h-11 items-center gap-2 border-b border-slate-100 px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlighted(0);
                }}
                onKeyDown={onSearchKeyDown}
                placeholder={labels.searchHint}
                aria-label={labels.search}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={results.length > 0}
                aria-controls={results.length > 0 ? SEARCH_LISTBOX_ID : undefined}
                aria-activedescendant={activeOptionId}
                spellCheck={false}
                className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label={labels.close}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <span className="sr-only" role="status" aria-live="polite">
              {resultAnnouncement}
            </span>

            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">{labels.noResults}</p>
            ) : (
              <ul
                id={SEARCH_LISTBOX_ID}
                role="listbox"
                aria-label={labels.results}
                className="max-h-[60vh] overflow-y-auto p-1.5 custom-scrollbar"
              >
                {results.map((item, index) => {
                  const Icon = item.entry.icon;
                  const isHighlighted = index === highlighted;
                  return (
                    <li key={item.entry.view}>
                      <ViewLink
                        view={item.entry.view}
                        role="option"
                        id={optionId(item.entry.view)}
                        aria-selected={isHighlighted}
                        onClick={() => setIsSearchOpen(false)}
                        onMouseEnter={() => setHighlighted(index)}
                        aria-current={activeView === item.entry.view ? 'page' : undefined}
                        className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                          isHighlighted ? 'bg-slate-100' : ''
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-slate-800">
                            {item.entry[language]}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {language === 'it' ? item.entry.hintIt : item.entry.hintEn}
                          </span>
                        </span>
                        <span className="eyebrow shrink-0">
                          {language === 'it' ? item.group.itShort : item.group.enShort}
                        </span>
                      </ViewLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
