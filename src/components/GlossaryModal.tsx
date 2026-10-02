import React, { useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Search, BookOpen } from 'lucide-react';
import { GLOSSARY_TERMS } from '../content/glossaryTerms';
import { useStore } from '../store';
import ModalDialog from './ModalDialog';

export default function GlossaryModal({ isOpen = false, onClose = () => {}, inline = false }: { isOpen?: boolean; onClose?: () => void; inline?: boolean }) {
  const { language } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const titleId = useId();
  const descriptionId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredTerms = GLOSSARY_TERMS.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition[language].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderWrapper = (children: React.ReactNode) => {
    if (inline) {
      return (
        <section aria-labelledby={titleId} aria-describedby={descriptionId} className="relative bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden w-full h-[82vh] min-h-[600px]">
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
        panelClassName="relative bg-white rounded-xl shadow-lg z-[101] flex flex-col overflow-hidden w-full max-w-2xl h-auto max-h-[85vh] border border-slate-100"
      >
        {children}
      </ModalDialog>
    );
  };

  return renderWrapper(
    <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookOpen aria-hidden="true" className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 id={titleId} className="text-lg font-semibold text-slate-900 uppercase tracking-tighter">
                    {language === 'en' ? 'Network Glossary' : 'Glossario di Rete'}
                  </h2>
                  <p id={descriptionId} className="text-xs text-slate-400 font-medium italic">
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
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={language === 'en' ? 'Search terms or definitions...' : 'Cerca termini o definizioni...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                  // In the modal, ModalDialog moves focus here through initialFocusRef.
                  autoFocus={inline}
                />
              </div>
            </div>

            {/* Terms List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group"
                  >
                    <div className="text-sm font-semibold text-blue-600 mb-1 group-hover:translate-x-1 transition-transform">
                      {item.term}
                    </div>
                    <div className="text-[13px] text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-all">
                      {item.definition[language]}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">{language === 'en' ? 'No terms found.' : 'Nessun termine trovato.'}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 text-center bg-slate-50/30">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                OSI Model Educational Tool • 2024
              </p>
            </div>
    </>
  );
}
