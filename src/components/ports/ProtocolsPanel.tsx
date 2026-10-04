import React from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert, ShieldCheck, Layers } from 'lucide-react';
import type { ProtocolInfo } from '../../content/portsExplorerTypes';
import type { Language } from '../../lib/portsFilter';

export interface ProtocolsPanelProps {
  language: Language;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filteredProtocols: ProtocolInfo[];
}

export default function ProtocolsPanel({ language, searchTerm, setSearchTerm, filteredProtocols }: ProtocolsPanelProps) {
  return (
                <>
                  {/* Category cards explaining OSI / TCP-IP Layers summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-6 bg-slate-50/70 border-b border-slate-100">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block">Layer 7</span>
                        <span className="text-xs font-semibold text-slate-800">Application</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">HTTP, DNS, SSH, SMTP, SNMP</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Layer 4</span>
                        <span className="text-xs font-semibold text-slate-800">Transport</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">TCP (Reliable), UDP (Fast)</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Layer 3</span>
                        <span className="text-xs font-semibold text-slate-800">Network</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">IP (Routing), ICMP (Ping)</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Layer 2</span>
                        <span className="text-xs font-semibold text-slate-800">Data Link</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">ARP (Local Resolution)</p>
                    </div>
                  </div>

                  {/* Filter / Search Bar for Protocols */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={language === 'en' ? 'Search protocol names, acronyms, or descriptions...' : 'Cerca nomi di protocolli, sigle o definizioni...'}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium"
                      />
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border bg-white border-slate-200 text-slate-500 hover:border-slate-300 transition-all shrink-0 font-mono"
                      >
                        {language === 'en' ? 'Reset' : 'Reset'}
                      </button>
                    )}
                  </div>

                  {/* Protocols Grid */}
                  <div className="flex-1 p-6 space-y-4">
                    {filteredProtocols.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProtocols.map((item, idx) => {
                          // Layer-specific styling
                          let layerColor = "bg-rose-50 text-rose-700 border-rose-200";
                          if (item.layer === 4) layerColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                          if (item.layer === 3) layerColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                          if (item.layer === 2) layerColor = "bg-amber-50 text-amber-700 border-amber-200";

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                              className="bg-white border border-slate-100 rounded-lg p-4 hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <span className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 bg-indigo-600 text-white font-semibold text-xs rounded-lg select-all font-mono">
                                      {item.name}
                                    </span>
                                    <span className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-lg border uppercase ${layerColor}`}>
                                      Layer {item.layer} ({item.type})
                                    </span>
                                  </span>
                                  {item.isSecure ? (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase">
                                      {language === 'en' ? 'Secure' : 'Sicuro'}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="text-slate-800 text-xs font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                                  {item.fullName}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-normal">
                                  {item.description[language]}
                                </p>

                                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                                  <strong className="text-[9.5px] text-slate-400 uppercase tracking-wider block mb-0.5">
                                    {language === 'en' ? 'Core Use Case' : 'Caso d\'Uso Principale'}
                                  </strong>
                                  <p className="text-[11px] text-slate-600 leading-normal">
                                    {item.useCase[language]}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-slate-50/80 flex items-start gap-2 text-[11px]">
                                {item.isSecure ? (
                                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                )}
                                <p className="leading-snug font-medium text-slate-500">
                                  <strong className="text-[9.5px] uppercase font-semibold tracking-wider block mb-0.5 text-slate-400">
                                    {language === 'en' ? 'Security Review' : 'Profilo di Sicurezza'}:
                                  </strong>
                                  {item.security[language]}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                        <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 text-sm">
                          {language === 'en' ? 'No protocols match your search' : 'Nessun protocollo trovato'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          {language === 'en' 
                            ? 'Try searching by name, description key terms, or OSI layer acronym.' 
                            : 'Prova a cercare per sigla, parole chiave della descrizione o livello OSI.'}
                        </p>
                        <button
                          onClick={() => { setSearchTerm(''); }}
                          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all"
                        >
                          {language === 'en' ? 'Clear search filter' : 'Riazzera filtro'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
  );
}
