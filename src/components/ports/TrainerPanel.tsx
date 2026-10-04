import React, { type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';
import type { PortInfo } from '../../content/portsExplorerTypes';
import type { Language } from '../../lib/portsFilter';
import type { PortsTab } from './portsTypes';
import { PORT_REGISTRY } from '../../content/portContent';
import { shuffled } from '../../lib/portsFilter';

export interface TrainerPanelProps {
  language: Language;
  setActiveTab: (v: PortsTab) => void;
  flashcardsList: PortInfo[];
  currentFlashcardIdx: number;
  setFlashcardsList: Dispatch<SetStateAction<PortInfo[]>>;
  setCurrentFlashcardIdx: Dispatch<SetStateAction<number>>;
  isFlipped: boolean;
  setIsFlipped: Dispatch<SetStateAction<boolean>>;
}

export default function TrainerPanel({ language, setActiveTab, flashcardsList, currentFlashcardIdx, setFlashcardsList, setCurrentFlashcardIdx, isFlipped, setIsFlipped }: TrainerPanelProps) {
  return (
                /* Interactive Port Trainer / Game Tab */
                <div className="flex-1 p-6 flex flex-col justify-center max-w-2xl mx-auto w-full">
                  <AnimatePresence mode="wait">
                    {(
                      /* Interactive port explorer */
                      <motion.div
                        key="flashcards-mode"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6 w-full"
                      >
                        {/* Status bar */}
                        <div className="flex justify-between items-center text-xs pb-4 border-b border-slate-100">
                          <span className="font-bold text-slate-400 uppercase tracking-wider font-mono">
                            {language === 'en'
                              ? `Flashcard ${currentFlashcardIdx + 1} of ${flashcardsList.length}`
                              : `Flashcard ${currentFlashcardIdx + 1} di ${flashcardsList.length}`}
                          </span>
                          <button
                            onClick={() => {
                              setFlashcardsList(shuffled(PORT_REGISTRY));
                              setCurrentFlashcardIdx(0);
                              setIsFlipped(false);
                            }}
                            className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                            <span className="text-[10px] font-bold uppercase tracking-wide font-mono">
                              {language === 'en' ? 'Shuffle Deck' : 'Mischia'}
                            </span>
                          </button>
                        </div>

                        {/* Interactive Flip Card Component */}
                        <div 
                          onClick={() => setIsFlipped(prev => !prev)}
                          className="min-h-[290px] cursor-pointer relative group active:scale-[0.99] transition-transform duration-150 select-none"
                        >
                          <AnimatePresence mode="wait">
                            {!isFlipped ? (
                              /* Front Side */
                              <motion.div
                                key="front"
                                initial={{ rotateY: -90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-slate-900 rounded-xl p-8 flex flex-col justify-between text-white min-h-[290px]"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="font-semibold text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-indigo-100 font-mono">
                                    {(flashcardsList[currentFlashcardIdx]?.range || 'well-known').toUpperCase()}
                                  </span>
                                  <span className="text-white/40 text-xs font-mono font-bold uppercase">
                                    {language === 'en' ? 'Front Side' : 'Fronte'}
                                  </span>
                                </div>

                                <div className="text-center py-4 space-y-1">
                                  <div className="text-6xl font-semibold font-mono tracking-tight select-all">
                                    {flashcardsList[currentFlashcardIdx]?.ports.join(' / ')}
                                  </div>
                                  <div className="text-indigo-200 text-xs uppercase font-extrabold tracking-wider leading-loose">
                                    {language === 'en' ? 'Protocol Service' : 'Servizio di Rete'}
                                  </div>
                                </div>

                                <div className="text-center text-[10px] text-indigo-200 uppercase font-semibold tracking-wider bg-indigo-800/20 py-1 rounded-lg">
                                  {language === 'en' ? 'Click / Tap to reveal details' : 'Clicca / Tocca per girare'}
                                </div>
                              </motion.div>
                            ) : (
                              /* Back Side */
                              <motion.div
                                key="back"
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between min-h-[290px]"
                              >
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                                    <span className="flex items-center gap-1.5">
                                      <span className="px-2.5 py-1 bg-indigo-600 text-white font-mono font-semibold text-xs rounded-lg select-all">
                                        Port {flashcardsList[currentFlashcardIdx]?.ports.join(' / ')}
                                      </span>
                                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px] uppercase font-bold rounded-lg">
                                        {flashcardsList[currentFlashcardIdx]?.transports.join(' / ')}
                                      </span>
                                    </span>
                                    
                                    <span className="flex items-center gap-1">
                                      {flashcardsList[currentFlashcardIdx]?.isSecure ? (
                                        <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase">
                                          {language === 'en' ? 'Secure' : 'Sicuro'}
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg uppercase">
                                          {language === 'en' ? 'Insecure' : 'Insicuro'}
                                        </span>
                                      )}
                                    </span>
                                  </div>

                                  <div className="space-y-2 text-left">
                                    <div>
                                      <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                                        {language === 'en' ? 'Service Name' : 'Nome Servizio'}
                                      </h4>
                                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                                        {flashcardsList[currentFlashcardIdx]?.service} &bull; <span className="text-slate-400 text-[11px] font-medium font-sans">{flashcardsList[currentFlashcardIdx]?.name}</span>
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                                        {language === 'en' ? 'Base Description' : 'Descrizione di Base'}
                                      </h4>
                                      <p className="text-[11px] text-slate-600 leading-normal font-semibold">
                                        {flashcardsList[currentFlashcardIdx]?.description[language]}
                                      </p>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-150 p-2 rounded-xl flex items-start gap-1.5">
                                      {flashcardsList[currentFlashcardIdx]?.isSecure ? (
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      ) : (
                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                      )}
                                      <div className="text-[9.5px] leading-tight text-left">
                                        <strong className="text-slate-400 uppercase tracking-wider block mb-0.5">
                                          {language === 'en' ? 'Security Review' : 'Sicurezza'}
                                        </strong>
                                        <p className="text-slate-600 font-medium">
                                          {flashcardsList[currentFlashcardIdx]?.security[language]}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-wider mt-2 border-t border-slate-50 pt-1.5">
                                  {language === 'en' ? 'Click / Tap card to flip back' : 'Clicca / Tocca per girare di nuovo'}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Navigation controls */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            disabled={currentFlashcardIdx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentFlashcardIdx(prev => prev - 1);
                              setIsFlipped(false);
                            }}
                            className="py-2.5 px-3 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold uppercase rounded-xl transition flex items-center justify-center gap-1"
                          >
                            &larr; <span className="hidden sm:inline">{language === 'en' ? 'Prev' : 'Prec'}</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFlipped(prev => !prev);
                            }}
                            className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase rounded-xl transition"
                          >
                            {language === 'en' ? 'Flip' : 'Gira'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentFlashcardIdx < flashcardsList.length - 1) {
                                setCurrentFlashcardIdx(prev => prev + 1);
                              } else {
                                setCurrentFlashcardIdx(0); // wrap
                              }
                              setIsFlipped(false);
                            }}
                            className="py-2.5 px-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold uppercase rounded-xl transition flex items-center justify-center gap-1"
                          >
                            <span className="hidden sm:inline">{language === 'en' ? 'Next' : 'Socc'}</span> &rarr;
                          </button>
                        </div>

                        {/* Back home control */}
                        <div className="text-center pt-2">
                          <button
                            onClick={() => setActiveTab('ports')}
                            className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold transition"
                          >
                            {language === 'en' ? 'Back to port registry' : 'Torna al registro delle porte'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
  );
}
