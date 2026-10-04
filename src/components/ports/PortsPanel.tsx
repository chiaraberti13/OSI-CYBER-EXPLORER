import React from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert, ShieldCheck, Hash, Activity, Lock, Unlock } from 'lucide-react';
import type { PortInfo } from '../../content/portsExplorerTypes';
import type { Language, PortRangeFilter } from '../../lib/portsFilter';
import { IANA_PORT_REGISTRY_SOURCE, PORT_REGISTRY_METADATA, PORT_REGISTRY_VERIFIED_ON } from '../../content/portRegistry';

export interface PortsPanelProps {
  language: Language;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedRange: PortRangeFilter;
  setSelectedRange: (v: PortRangeFilter) => void;
  filteredPorts: PortInfo[];
}

export default function PortsPanel({ language, searchTerm, setSearchTerm, selectedRange, setSelectedRange, filteredPorts }: PortsPanelProps) {
  return (
                <>
                  {/* Registry Top Bar: Category cards explaining numbering */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-slate-50/70 border-b border-slate-100">
                    <div 
                      onClick={() => setSelectedRange('well-known')}
                      className={`cursor-pointer p-4 rounded-lg border transition-all ${
                        selectedRange === 'well-known' 
                          ? 'bg-amber-50/50 border-amber-300' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider leading-none">
                          {language === 'en' ? 'Well-Known' : 'Porte Ben Note'}
                        </span>
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-700">0 - 1023</h4>
                      <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
                        {language === 'en' 
                          ? 'Reserved for core system administration and essential transport daemons (HTTP, DNS, SSH, SMTP).' 
                          : 'Assegnate da IANA per sistemi e servizi fondamentali della suite TCP/IP.'}
                      </p>
                    </div>

                    <div 
                      onClick={() => setSelectedRange('registered')}
                      className={`cursor-pointer p-4 rounded-lg border transition-all ${
                        selectedRange === 'registered' 
                          ? 'bg-blue-50/50 border-blue-300' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider leading-none">
                          {language === 'en' ? 'Registered' : 'Porte Registrate'}
                        </span>
                        <Unlock className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-700">1024 - 49151</h4>
                      <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
                        {language === 'en' 
                          ? 'Assigned to user processes, databases (MySQL, Redis, PostgreSQL), third-party programs or local web servers.' 
                          : 'Assegnate a ditte, utenti o processi specifici approvati (database, app locali, microservizi).'}
                      </p>
                    </div>

                    <div 
                      onClick={() => setSelectedRange('dynamic')}
                      className={`cursor-pointer p-4 rounded-lg border transition-all ${
                        selectedRange === 'dynamic' 
                          ? 'bg-emerald-50/50 border-emerald-300' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-none">
                          {language === 'en' ? 'Dynamic / Private' : 'Porte Dinamiche'}
                        </span>
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-700">49152 - 65535</h4>
                      <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
                        {language === 'en' 
                          ? 'Ephemeral sockets dynamically chosen by the host OS during client connection initiation.' 
                          : 'Porte temporanee assegnate dinamicamente dal sistema operativo client all\'avvio di connessioni esterne.'}
                      </p>
                    </div>
                  </div>

                  {/* Filter / Search Bar */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={language === 'en' ? 'Search ports, services, security or protocols...' : 'Cerca porte, sigle, sicurezze o protocolli...'}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium"
                      />
                    </div>

                    <div className="flex gap-2 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => setSelectedRange('all')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'all' 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {language === 'en' ? 'All ranges' : 'Tutte'}
                      </button>
                      <button
                        onClick={() => setSelectedRange('well-known')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'well-known' 
                            ? 'bg-amber-500 border-amber-500 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        0 - 1023
                      </button>
                      <button
                        onClick={() => setSelectedRange('registered')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'registered' 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        1024 - 49151
                      </button>
                      <button
                        onClick={() => setSelectedRange('dynamic')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'dynamic' 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        49152+
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-2.5 border-b border-slate-100 bg-indigo-50/40 text-[10px] text-indigo-700 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {IANA_PORT_REGISTRY_SOURCE} · {PORT_REGISTRY_METADATA.length} {language === 'en' ? 'curated services' : 'servizi selezionati'}
                    </span>
                    <span className="font-mono">
                      {language === 'en' ? 'Verified' : 'Verificato'}: {PORT_REGISTRY_VERIFIED_ON}
                    </span>
                  </div>

                  {/* Port Rows Grid */}
                  <div className="flex-1 p-6 space-y-4">
                    {selectedRange === 'dynamic' && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex gap-4 items-start mb-4">
                        <Activity className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-wider">
                            {language === 'en' ? 'Understanding Dynamic Range' : 'Comprensione della Banda Dinamica'}
                          </h5>
                          <p className="text-[11px] text-emerald-700 leading-relaxed mt-1">
                            {language === 'en' 
                              ? 'This range (49152 to 65535) does not host pre-assigned application daemons. When you open a website, your computer chooses a dynamic port from this exact block as the "Source Port" (Porta Sorgente) to route incoming server replies back to your browser process.' 
                              : 'Questo intervallo (da 49152 a 65535) non ospita demoni di sistema fissi o preassegnati. Quando apri una pagina web, il tuo computer sceglie una porta dinamica da questo blocco come "Porta Sorgente" per ricanalizzare le risposte della rete verso la scheda corretta.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {filteredPorts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPorts.map((item, idx) => (
                          <motion.div
                            key={`${item.ports.join('-')}-${item.transports.join('-')}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                            className="bg-white border border-slate-100 rounded-lg p-4 hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between"
                          >
                            <div>
                              {/* Header segment of port row */}
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <span className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-semibold text-xs rounded-lg select-all">
                                    PORT {item.ports.join(' / ')}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-800 tracking-tight">
                                    {item.service}
                                  </span>
                                </span>

                                <span className="flex items-center gap-1">
                                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                                    {item.transports.join(' / ')}
                                  </span>
                                  <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 ${
                                    item.range === 'well-known' 
                                      ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                                  }`}>
                                    {item.range === 'well-known' 
                                      ? (language === 'en' ? 'Core' : 'Nucleo') 
                                      : (language === 'en' ? 'App' : 'Servizio')}
                                  </span>
                                </span>
                              </div>

                              <div className="text-slate-800 text-xs font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                                {item.name}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal">
                                {item.description[language]}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] font-semibold">
                                <span className={`px-2 py-0.5 rounded-lg border uppercase ${
                                  item.registrationStatus === 'assigned'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : item.registrationStatus === 'de-facto'
                                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  IANA: {item.registrationStatus === 'assigned'
                                    ? (language === 'en' ? 'assigned' : 'assegnata')
                                    : item.registrationStatus === 'de-facto'
                                      ? 'de facto'
                                      : item.registrationStatus === 'reserved'
                                        ? (language === 'en' ? 'reserved' : 'riservata')
                                        : (language === 'en' ? 'unassigned' : 'non assegnata')}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg border bg-slate-50 text-slate-500 border-slate-100 font-mono">
                                  {item.ianaServiceNames.join(' · ')}
                                </span>
                              </div>

                              {item.ambiguity && (
                                <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2 flex gap-1.5 text-[10px] text-amber-800 leading-snug">
                                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span><strong>{language === 'en' ? 'Ambiguous use:' : 'Uso ambiguo:'}</strong> {item.ambiguity[language]}</span>
                                </div>
                              )}

                              {item.encryptedEquivalent && (
                                <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-1.5 text-[10px] text-indigo-700">
                                  <strong>{language === 'en' ? 'Encrypted option' : 'Alternativa cifrata'}:</strong>{' '}
                                  {item.encryptedEquivalent.service} · {item.encryptedEquivalent.transports.join('/')}{' '}
                                  {item.encryptedEquivalent.ports.join(' / ')}
                                </div>
                              )}
                            </div>

                            {/* Security Note at bottom of card */}
                            <div className="mt-3 pt-3 border-t border-slate-50/80 flex items-start gap-2 text-[11px]">
                              {item.isSecure ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              ) : (
                                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <p className={`leading-snug font-medium ${item.isSecure ? 'text-slate-500' : 'text-slate-500'}`}>
                                <strong className="text-[10px] uppercase font-semibold tracking-wider block mb-0.5">
                                  {language === 'en' ? 'Security Review' : 'Profilo di Sicurezza'}:
                                </strong>
                                {item.security[language]}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                        <Hash className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 text-sm">
                          {language === 'en' ? 'No ports match your search' : 'Nessuna corrispondenza trovata'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          {language === 'en' 
                            ? 'Try searching by numeric port (e.g., 22), protocol abbreviation (e.g., SSH), or search keyword.' 
                            : 'Prova a cercare per numero di porta (es. 22), sigla del protocollo (es. SSH) o parole descrittive.'}
                        </p>
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedRange('all'); }}
                          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all"
                        >
                          {language === 'en' ? 'Clear search filters' : 'Riazzera filtri'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
  );
}
