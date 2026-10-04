import React from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert, ShieldCheck, Activity, Layers, Shield, Shuffle, Network, Radio, Cpu, Server } from 'lucide-react';
import type { DeviceInfo } from '../../content/portsExplorerTypes';
import type { DeviceCategoryFilter, Language } from '../../lib/portsFilter';

export interface DevicesPanelProps {
  language: Language;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  deviceCategory: DeviceCategoryFilter;
  setDeviceCategory: (v: DeviceCategoryFilter) => void;
  filteredDevices: DeviceInfo[];
}

export default function DevicesPanel({ language, searchTerm, setSearchTerm, deviceCategory, setDeviceCategory, filteredDevices }: DevicesPanelProps) {
  return (
                <>
                  {/* Category cards explaining Network Hardware level */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-6 bg-slate-50/70 border-b border-slate-100">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block">Layer 3, 4, 7</span>
                        <span className="text-xs font-semibold text-slate-800">Security Gateways</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Firewall, Gateway Applicativo</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Layer 3</span>
                        <span className="text-xs font-semibold text-slate-800">Network Layer</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Router, Switch Layer 3</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">Layer 2</span>
                        <span className="text-xs font-semibold text-slate-800">Data Link</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Switch Ethernet, Wireless AP, Bridge</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Layer 1</span>
                        <span className="text-xs font-semibold text-slate-800">Physical Layer</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Hub Passivo, Cavi, Ripetitore</p>
                    </div>
                  </div>

                  {/* Filter / Search Bar for Devices */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between font-sans">
                      <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={language === 'en' ? 'Search network hardware, firewall, router, switch...' : 'Cerca apparati, firewall, router, switch...'}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium font-sans"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 font-mono">
                          {language === 'en' ? 'Total' : 'Totale'}: {filteredDevices.length}
                        </span>
                        {(searchTerm || deviceCategory !== 'all') && (
                          <button
                            onClick={() => { setSearchTerm(''); setDeviceCategory('all'); }}
                            className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border bg-white border-slate-200 text-slate-500 hover:border-slate-300 transition-all shrink-0 font-mono"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mr-1 self-center font-mono">
                        {language === 'en' ? 'Filter by Type:' : 'Filtra per Tipologia:'}
                      </span>
                      <button
                        onClick={() => setDeviceCategory('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'all'
                            ? 'bg-slate-900 border border-slate-900 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'en' ? 'All Hardware' : 'Tutti gli Apparati'}</span>
                      </button>
                      
                      <button
                        onClick={() => setDeviceCategory('security')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'security'
                            ? 'bg-rose-600 border border-rose-600 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Security & Defense' : 'Sicurezza & Protezione'}</span>
                      </button>

                      <button
                        onClick={() => setDeviceCategory('networking')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'networking'
                            ? 'bg-indigo-600 border border-indigo-600 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Network className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Routing & Switching' : 'Connettività & Routing'}</span>
                      </button>

                      <button
                        onClick={() => setDeviceCategory('infrastructure')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'infrastructure'
                            ? 'bg-amber-600 border border-amber-600 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Access & Transport' : 'Accesso & Trasmissione'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Devices Grid */}
                  <div className="flex-1 p-6 space-y-4">
                    {filteredDevices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDevices.map((item, idx) => {
                          // Layer-specific styling
                          let layerColor = "bg-rose-50 text-rose-700 border-rose-200";
                          if (item.layer.includes("Layer 3 (")) {
                            layerColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                          } else if (item.layer.includes("Layer 2")) {
                            layerColor = "bg-blue-50 text-blue-700 border-blue-200";
                          } else if (item.layer.includes("Layer 1")) {
                            layerColor = "bg-amber-50 text-amber-700 border-amber-200";
                          }

                          // Icon logic
                          const getDeviceIcon = (iconName: string) => {
                            switch (iconName) {
                              case 'Shield': return <Shield className="w-5 h-5 text-rose-600" />;
                              case 'Shuffle': return <Shuffle className="w-5 h-5 text-indigo-600" />;
                              case 'Network': return <Network className="w-5 h-5 text-blue-600" />;
                              case 'Radio': return <Radio className="w-5 h-5 text-sky-600" />;
                              case 'Cpu': return <Cpu className="w-5 h-5 text-purple-600" />;
                              case 'Server': return <Server className="w-5 h-5 text-slate-600" />;
                              case 'Activity': return <Activity className="w-5 h-5 text-teal-600" />;
                              default: return <Server className="w-5 h-5 text-slate-600" />;
                            }
                          };

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                              className="bg-white border border-slate-100 rounded-lg p-5 hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between"
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="flex items-center gap-2">
                                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                      {getDeviceIcon(item.iconName)}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-800 tracking-tight">
                                      {item.name}
                                    </span>
                                  </span>
                                  <span className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-lg border uppercase ${layerColor}`}>
                                    {item.layer}
                                  </span>
                                </div>

                                <div>
                                  <div className="text-slate-800 text-xs font-semibold mb-1">
                                    {item.fullName}
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-normal mb-3 font-medium">
                                    {language === 'en' ? item.role.en : item.role.it}
                                  </p>
                                </div>

                                <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/85 overflow-hidden flex flex-col justify-between">
                                  <div>
                                    <strong className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">
                                      {language === 'en' ? 'How it Works' : 'Come Funziona'}
                                    </strong>
                                    <p className="text-[11px] text-slate-600 leading-normal">
                                      {language === 'en' ? item.howItWorks.en : item.howItWorks.it}
                                    </p>
                                  </div>
                                  <div className="pt-2 border-t border-slate-100">
                                    <strong className="text-[9px] text-indigo-500 uppercase tracking-wider block mb-0.5">
                                      {language === 'en' ? 'Cyber Attack Risks (Mitigated)' : 'Vulnerabilità & Attacchi (Mitigati)'}
                                    </strong>
                                    <p className="text-[11px] text-slate-600 leading-normal">
                                      {language === 'en' ? item.securityAttacks.en : item.securityAttacks.it}
                                    </p>
                                  </div>
                                  <div className="pt-2 border-t border-slate-100 bg-rose-50/40 -mx-3 -mb-3 px-3 pb-3 pt-2 rounded-b-xl border-dashed border-rose-100/70 mt-1">
                                    <strong className="text-[9px] text-red-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                      <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                      {language === 'en' ? 'What it CANNOT Stop & Why' : 'Cosa NON può fermare & Perché'}
                                    </strong>
                                    <p className="text-[10.5px] text-red-950 font-semibold leading-relaxed">
                                      {language === 'en' ? item.cannotStop.en : item.cannotStop.it}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-50 flex items-start gap-2 text-[11px]">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div className="leading-snug text-slate-500 font-medium">
                                  <strong className="text-[9px] uppercase font-semibold tracking-wider block mb-0.5 text-slate-400">
                                    {language === 'en' ? 'Strategic Mitigation' : 'Mitigazione & Difesa'}:
                                  </strong>
                                  {language === 'en' ? item.mitigation.en : item.mitigation.it}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                        <Network className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 text-sm">
                          {language === 'en' ? 'No devices match your search' : 'Nessun apparato trovato'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          {language === 'en' 
                            ? 'Try searching by physical terms like firewall, router, switch or hub.' 
                            : 'Prova a cercare termini come firewall, router, switch o hub.'}
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
