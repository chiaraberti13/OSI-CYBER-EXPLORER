import React, { useId, useRef, useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { GLOSSARY_TERMS } from '../content/glossaryTerms';
import { filterGlossaryTerms, type GlossarySearchScope } from '../lib/collectionSearch';
import { useStore } from '../store';
import ModalDialog from './ModalDialog';
import SearchHighlight from './SearchHighlight';

export default function GlossaryModal({
  isOpen = false,
  onClose = () => {},
  inline = false
}: {
  isOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}) {
  const language = useStore((state) => state.language);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchScope, setSearchScope] = useState<GlossarySearchScope>('all');
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();
  const termsId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const Title = inline ? 'h1' : 'h2';

  const filteredTerms = filterGlossaryTerms(GLOSSARY_TERMS, searchTerm, searchScope, language);

  // UX-04: the result count is announced through a live region so screen-reader
  // users hear the list narrow as they type; it also serves as the input's
  // description. Zero results reuse the visible empty-state wording.
  const count = filteredTerms.length;
  const searchLabel =
    language === 'en' ? 'Search glossary terms or definitions' : 'Cerca termini o definizioni del glossario';
  const resultAnnouncement =
    count === 0
      ? language === 'en'
        ? 'No terms found.'
        : 'Nessun termine trovato.'
      : language === 'en'
        ? `${count} of ${GLOSSARY_TERMS.length} ${count === 1 ? 'term' : 'terms'}`
        : `${count} di ${GLOSSARY_TERMS.length} ${count === 1 ? 'termine' : 'termini'}`;
  const hasActiveFilters = searchTerm.length > 0 || searchScope !== 'all';

  // UX: a 120+ entry reference is unusable in insertion order. Sort A–Z (locale-aware,
  // numeric-safe so "802.1X" lands under a "#" bucket) and group under a light letter
  // index, so the eye can jump to a letter instead of scrolling the whole list. The
  // letter dividers are decorative (aria-hidden): every term stays a real dt/dd.
  const collator = new Intl.Collator(language, { sensitivity: 'base', numeric: true });
  const sortedTerms = [...filteredTerms].sort((a, b) => collator.compare(a.term, b.term));
  const groupLetter = (term: string) => {
    const first = term.trim().charAt(0).toUpperCase();
    return /[A-Z]/.test(first) ? first : '#';
  };
  const letterGroups: { letter: string; items: typeof sortedTerms }[] = [];
  for (const item of sortedTerms) {
    const letter = groupLetter(item.term);
    const last = letterGroups[letterGroups.length - 1];
    if (last && last.letter === letter) last.items.push(item);
    else letterGroups.push({ letter, items: [item] });
  }

  const renderWrapper = (children: React.ReactNode) => {
    if (inline) {
      return (
        <section
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="relative flex h-[82dvh] max-h-[48rem] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
        >
          {children}
        </section>
      );
    }
    return (
      <ModalDialog
        isOpen={isOpen}
        onClose={onClose}
        labelledBy={titleId}
        describedBy={descriptionId}
        initialFocusRef={searchRef}
        overlayClassName="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        backdropClassName="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        panelClassName="relative z-[101] flex h-auto max-h-[calc(100dvh-2rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg"
      >
        {children}
      </ModalDialog>
    );
  };

  return renderWrapper(
    <>
      {/* Header */}
      <div className="sticky top-0 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5">
            <BookOpen aria-hidden="true" className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <Title id={titleId} className="text-xl font-semibold tracking-tight text-slate-900">
              {language === 'en' ? 'Network Glossary' : 'Glossario di Rete'}
            </Title>
            <p id={descriptionId} className="text-[13px] font-medium text-slate-500">
              {language === 'en' ? 'Key concepts of the OSI world' : 'Concetti chiave del mondo OSI'}
            </p>
          </div>
        </div>
        {!inline && (
          <button
            type="button"
            onClick={onClose}
            aria-label={language === 'en' ? 'Close the glossary' : 'Chiudi il glossario'}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X aria-hidden="true" className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="shrink-0 space-y-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder={language === 'en' ? 'Search terms or definitions...' : 'Cerca termini o definizioni...'}
            aria-label={searchLabel}
            aria-describedby={statusId}
            aria-controls={termsId}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
            // In the modal, ModalDialog moves focus here through initialFocusRef.
            autoFocus={inline}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                searchRef.current?.focus();
              }}
              aria-label={language === 'en' ? 'Clear the search' : 'Cancella la ricerca'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:text-slate-600"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-slate-700">
            <span>{language === 'en' ? 'Search in' : 'Cerca in'}</span>
            <select
              value={searchScope}
              onChange={(event) => setSearchScope(event.target.value as GlossarySearchScope)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            >
              <option value="all">{language === 'en' ? 'Terms and definitions' : 'Termini e definizioni'}</option>
              <option value="term">{language === 'en' ? 'Terms only' : 'Solo termini'}</option>
              <option value="definition">{language === 'en' ? 'Definitions only' : 'Solo definizioni'}</option>
            </select>
          </label>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span id={statusId} role="status" aria-live="polite" className="text-xs font-semibold text-slate-600">
              {resultAnnouncement}
            </span>
            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={() => {
                setSearchTerm('');
                setSearchScope('all');
                searchRef.current?.focus();
              }}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {language === 'en' ? 'Reset filters' : 'Azzera filtri'}
            </button>
          </div>
        </div>
      </div>

      {/* Terms List */}
      <div
        data-testid="glossary-terms-scroll"
        id={termsId}
        tabIndex={0}
        aria-label={language === 'en' ? 'Glossary terms' : 'Termini del glossario'}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white p-6"
      >
        {filteredTerms.length > 0 ? (
          <div className="space-y-5">
            {letterGroups.map((group) => (
              <div key={group.letter}>
                <div
                  aria-hidden="true"
                  className="sticky top-0 z-[1] -mx-1 mb-2 bg-white/95 px-1 py-1 text-[13px] font-bold tracking-wide text-indigo-500 backdrop-blur-sm"
                >
                  {group.letter}
                </div>
                <dl className="divide-y divide-slate-100">
                  {group.items.map((item) => (
                    <div key={item.term} className="py-3 first:pt-0">
                      <dt className="text-[15px] font-semibold tracking-tight text-slate-900">
                        <SearchHighlight text={item.term} query={searchTerm} />
                      </dt>
                      <dd className="mt-1 text-[13px] leading-relaxed text-slate-600">
                        <SearchHighlight text={item.definition[language]} query={searchTerm} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen aria-hidden="true" className="w-12 h-12 text-slate-100 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {language === 'en' ? 'No terms found.' : 'Nessun termine trovato.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/30 p-4 text-center">
        <p className="text-[11px] font-medium text-slate-400">
          {GLOSSARY_TERMS.length} {language === 'en' ? 'terms' : 'termini'} · CCNA 200-301 + eJPT · IT/EN
        </p>
      </div>
    </>
  );
}
