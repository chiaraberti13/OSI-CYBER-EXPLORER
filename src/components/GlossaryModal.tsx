import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, BookOpen } from 'lucide-react';
import { GLOSSARY_TERMS } from '../constants';
import { useStore } from '../store';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlossaryModal({ isOpen = false, onClose = () => {}, inline = false }: { isOpen?: boolean; onClose?: () => void; inline?: boolean }) {
  const { language } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = GLOSSARY_TERMS.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition[language].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderWrapper = (children: React.ReactNode) => {
    if (inline) {
      return (
        <div className="relative bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden w-full h-[82vh] min-h-[600px] shadow-sm">
          {children}
        </div>
      );
    }
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden w-full max-w-2xl h-auto max-h-[85vh] border border-slate-100"
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  return renderWrapper(
    <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                    {language === 'en' ? 'Network Glossary' : 'Glossario di Rete'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium italic">
                    {language === 'en' ? 'Key concepts of the OSI world' : 'Concetti chiave del mondo OSI'}
                  </p>
                </div>
              </div>
              {!inline && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search terms or definitions...' : 'Cerca termini o definizioni...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                  autoFocus
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
                    <div className="text-sm font-black text-blue-600 mb-1 group-hover:translate-x-1 transition-transform">
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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                OSI Model Educational Tool • 2024
              </p>
            </div>
    </>
  );
}
