import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Link2, Menu, Search, X } from 'lucide-react';
import { searchNav } from '../lib/navigation';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import ViewLink from './ViewLink';
import { viewHash } from '../lib/viewRouting';
import { formatSearchResultCount, uiMessages } from '../i18n';

/**
 * The slim top bar of the content column. It carries the utilities that belong next
 * to the content rather than in the primary sidebar: the quick search (an editable
 * combobox, also opened with Ctrl/Cmd+K) and the copy-link control. On mobile it also
 * carries the menu button that opens the navigation drawer, plus the brand (which on
 * desktop lives in the persistent sidebar). This replaces the old horizontal tab
 * switcher, whose group tabs are now the vertical sidebar.
 */
export default function Topbar() {
  const { language, activeView, setActiveView, setIsNavOpen } = useStore(
    useShallow((state) => ({
      language: state.language,
      activeView: state.activeView,
      setActiveView: state.setActiveView,
      setIsNavOpen: state.setIsNavOpen
    }))
  );
  const labels = uiMessages(language).navigation;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => searchNav(query, language), [query, language]);

  // UX-03: an editable combobox owns a listbox popup. Each option needs a stable id so
  // `aria-activedescendant` on the input can point at the highlighted one while DOM
  // focus stays in the field. Keyed by the view id so it is stable as the set changes.
  const SEARCH_LISTBOX_ID = 'nav-search-results';
  const optionId = (view: string) => `nav-search-option-${view}`;
  const activeOptionId = results.length > 0 ? optionId(results[highlighted]?.entry.view) : undefined;
  const resultAnnouncement =
    results.length === 0 ? labels.noResults : formatSearchResultCount(language, results.length);

  // Close the search whenever the view changes: the destination is reached.
  const [lastView, setLastView] = useState(activeView);
  if (lastView !== activeView) {
    setLastView(activeView);
    setIsSearchOpen(false);
    setQuery('');
  }

  // Ctrl/Cmd+K toggles the quick search; Escape closes it.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen((current) => !current);
        return;
      }
      if (event.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // A click outside the bar dismisses the open search panel.
  useEffect(() => {
    if (!isSearchOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Clear the "copied" feedback timer on unmount so it never fires into a gone component.
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

  return (
    <div ref={barRef} className="sticky top-0 z-40 border-b border-slate-200/70 bg-canvas/90 backdrop-blur-md">
      <div className="relative flex h-14 items-center gap-2 px-3 sm:px-5">
        {/* Mobile: the menu button opens the navigation drawer; the brand sits beside it
            because on mobile there is no persistent sidebar to carry it. */}
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          aria-label={labels.menu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6">
            <rect x="1" y="1" width="30" height="30" rx="7.5" fill="#4f46e5" />
            <rect x="7.5" y="8.5" width="17" height="4.2" rx="2.1" fill="#22d3ee" />
            <rect x="7.5" y="13.9" width="17" height="4.2" rx="2.1" fill="#ffffff" />
            <rect x="7.5" y="19.3" width="17" height="4.2" rx="2.1" fill="#ffffff" opacity="0.72" />
          </svg>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            <span className="hidden min-[400px]:inline">OSI Cyber Explorer</span>
            <span className="min-[400px]:hidden">OSI</span>
          </span>
        </div>

        <div className="min-w-0 flex-1" />

        <button
          type="button"
          ref={searchButtonRef}
          onClick={() => setIsSearchOpen((open) => !open)}
          aria-expanded={isSearchOpen}
          aria-label={labels.search}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-200/70 bg-white px-3 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{labels.search}</span>
          <kbd className="ml-1 hidden font-mono text-[10px] text-slate-400 xl:inline">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={copyCurrentLink}
          aria-label={labels.copyLink}
          title={labels.copyLink}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-slate-500 transition-colors hover:text-slate-800"
        >
          {linkCopied ? (
            <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Off-screen live region: confirms the copy without moving focus. */}
      <span className="sr-only" role="status" aria-live="polite">
        {linkCopied ? labels.linkCopied : ''}
      </span>

      <AnimatePresence>
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

            {/* Off-screen live region: announces the result count (or no-results) as the
                query changes, so screen-reader users hear the list update without moving focus. */}
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
    </div>
  );
}
