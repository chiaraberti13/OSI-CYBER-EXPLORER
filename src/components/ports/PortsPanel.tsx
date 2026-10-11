import React, { useId } from 'react';
import { motion } from 'motion/react';
import { Search, ShieldAlert, ShieldCheck, Hash, Activity, Lock, Unlock } from 'lucide-react';
import type { PortInfo } from '../../content/portsExplorerTypes';
import type { Language, PortRangeFilter, PortSecurityFilter } from '../../lib/portsFilter';
import {
  IANA_PORT_REGISTRY_SOURCE,
  PORT_REGISTRY_METADATA,
  PORT_REGISTRY_VERIFIED_ON
} from '../../content/portRegistry';
import SearchHighlight from '../SearchHighlight';

export interface PortsPanelProps {
  language: Language;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedRange: PortRangeFilter;
  setSelectedRange: (v: PortRangeFilter) => void;
  securityFilter: PortSecurityFilter;
  setSecurityFilter: (v: PortSecurityFilter) => void;
  filteredPorts: PortInfo[];
  totalPorts: number;
}

export default function PortsPanel({
  language,
  searchTerm,
  setSearchTerm,
  selectedRange,
  setSelectedRange,
  securityFilter,
  setSecurityFilter,
  filteredPorts,
  totalPorts
}: PortsPanelProps) {
  const statusId = useId();
  const resultsId = useId();
  const hasActiveFilters = searchTerm.length > 0 || selectedRange !== 'all' || securityFilter !== 'all';
  const resultNoun =
    language === 'en'
      ? filteredPorts.length === 1
        ? 'service'
        : 'services'
      : filteredPorts.length === 1
        ? 'servizio'
        : 'servizi';
  const resultLabel =
    language === 'en'
      ? `${filteredPorts.length} of ${totalPorts} ${resultNoun}`
      : `${filteredPorts.length} di ${totalPorts} ${resultNoun}`;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRange('all');
    setSecurityFilter('all');
  };

  return (
    <>
      {/* Registry Top Bar: Category cards explaining numbering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-slate-50/70 border-b border-slate-100">
        <button
          type="button"
          aria-pressed={selectedRange === 'well-known'}
          onClick={() => setSelectedRange('well-known')}
          className={`w-full cursor-pointer text-left p-4 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
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
          <h2 className="font-mono text-xs font-bold text-slate-700">0 - 1023</h2>
          <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
            {language === 'en'
              ? 'Reserved for core system administration and essential transport daemons (HTTP, DNS, SSH, SMTP).'
              : 'Assegnate da IANA per sistemi e servizi fondamentali della suite TCP/IP.'}
          </p>
        </button>

        <button
          type="button"
          aria-pressed={selectedRange === 'registered'}
          onClick={() => setSelectedRange('registered')}
          className={`w-full cursor-pointer text-left p-4 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
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
          <h2 className="font-mono text-xs font-bold text-slate-700">1024 - 49151</h2>
          <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
            {language === 'en'
              ? 'Assigned to user processes, databases (MySQL, Redis, PostgreSQL), third-party programs or local web servers.'
              : 'Assegnate a ditte, utenti o processi specifici approvati (database, app locali, microservizi).'}
          </p>
        </button>

        <button
          type="button"
          aria-pressed={selectedRange === 'dynamic'}
          onClick={() => setSelectedRange('dynamic')}
          className={`w-full cursor-pointer text-left p-4 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
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
          <h2 className="font-mono text-xs font-bold text-slate-700">49152 - 65535</h2>
          <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
            {language === 'en'
              ? 'Ephemeral sockets dynamically chosen by the host OS during client connection initiation.'
              : "Porte temporanee assegnate dinamicamente dal sistema operativo client all'avvio di connessioni esterne."}
          </p>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={language === 'en' ? 'Search network ports and services' : 'Cerca porte e servizi di rete'}
            aria-describedby={statusId}
            aria-controls={resultsId}
            placeholder={
              language === 'en'
                ? 'Search ports, services, security or protocols...'
                : 'Cerca porte, sigle, sicurezze o protocolli...'
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto shrink-0">
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

      <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-6 py-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-slate-700 sm:max-w-xs">
          <span>{language === 'en' ? 'Security posture' : 'Profilo di sicurezza'}</span>
          <select
            value={securityFilter}
            onChange={(event) => setSecurityFilter(event.target.value as PortSecurityFilter)}
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50"
          >
            <option value="all">{language === 'en' ? 'All services' : 'Tutti i servizi'}</option>
            <option value="secure">{language === 'en' ? 'Secure by design' : 'Sicuri per progettazione'}</option>
            <option value="review">{language === 'en' ? 'Needs security review' : 'Da valutare con attenzione'}</option>
          </select>
        </label>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span id={statusId} role="status" aria-live="polite" className="text-xs font-semibold text-slate-600">
            {resultLabel}
          </span>
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={resetFilters}
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {language === 'en' ? 'Reset filters' : 'Azzera filtri'}
          </button>
        </div>
      </div>

      <div className="px-6 py-2.5 border-b border-slate-100 bg-indigo-50/40 text-[10px] text-indigo-700 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">
          {IANA_PORT_REGISTRY_SOURCE} · {PORT_REGISTRY_METADATA.length}{' '}
          {language === 'en' ? 'curated services' : 'servizi selezionati'}
        </span>
        <span className="font-mono">
          {language === 'en' ? 'Verified' : 'Verificato'}: {PORT_REGISTRY_VERIFIED_ON}
        </span>
      </div>

      {/* Port Rows Grid */}
      <div id={resultsId} className="flex-1 p-6 space-y-4">
        {selectedRange === 'dynamic' && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex gap-4 items-start mb-4">
            <Activity className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-xs text-emerald-800 uppercase tracking-wider">
                {language === 'en' ? 'Understanding Dynamic Range' : 'Comprensione della Banda Dinamica'}
              </h2>
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
                        <SearchHighlight text={`PORT ${item.ports.join(' / ')}`} query={searchTerm} />
                      </span>
                      <span className="text-xs font-semibold text-slate-800 tracking-tight">
                        <SearchHighlight text={item.service} query={searchTerm} />
                      </span>
                    </span>

                    <span className="flex items-center gap-1">
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                        <SearchHighlight text={item.transports.join(' / ')} query={searchTerm} />
                      </span>
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 ${
                          item.range === 'well-known'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        {item.range === 'well-known'
                          ? language === 'en'
                            ? 'Core'
                            : 'Nucleo'
                          : language === 'en'
                            ? 'App'
                            : 'Servizio'}
                      </span>
                    </span>
                  </div>

                  <div className="text-slate-800 text-xs font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                    <SearchHighlight text={item.name} query={searchTerm} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    <SearchHighlight text={item.description[language]} query={searchTerm} />
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded-lg border uppercase ${
                        item.registrationStatus === 'assigned'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : item.registrationStatus === 'de-facto'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}
                    >
                      IANA:{' '}
                      {item.registrationStatus === 'assigned'
                        ? language === 'en'
                          ? 'assigned'
                          : 'assegnata'
                        : item.registrationStatus === 'de-facto'
                          ? 'de facto'
                          : item.registrationStatus === 'reserved'
                            ? language === 'en'
                              ? 'reserved'
                              : 'riservata'
                            : language === 'en'
                              ? 'unassigned'
                              : 'non assegnata'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg border bg-slate-50 text-slate-500 border-slate-100 font-mono">
                      <SearchHighlight text={item.ianaServiceNames.join(' · ')} query={searchTerm} />
                    </span>
                  </div>

                  {item.ambiguity && (
                    <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2 flex gap-1.5 text-[10px] text-amber-800 leading-snug">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        <strong>{language === 'en' ? 'Ambiguous use:' : 'Uso ambiguo:'}</strong>{' '}
                        <SearchHighlight text={item.ambiguity[language]} query={searchTerm} />
                      </span>
                    </div>
                  )}

                  {item.encryptedEquivalent && (
                    <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-1.5 text-[10px] text-indigo-700">
                      <strong>{language === 'en' ? 'Encrypted option' : 'Alternativa cifrata'}:</strong>{' '}
                      <SearchHighlight
                        text={`${item.encryptedEquivalent.service} · ${item.encryptedEquivalent.transports.join('/')} ${item.encryptedEquivalent.ports.join(' / ')}`}
                        query={searchTerm}
                      />
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
                    <SearchHighlight text={item.security[language]} query={searchTerm} />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
            <Hash className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h2 className="font-bold text-slate-700 text-sm">
              {language === 'en' ? 'No ports match your search' : 'Nessuna corrispondenza trovata'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {language === 'en'
                ? 'Try searching by numeric port (e.g., 22), protocol abbreviation (e.g., SSH), or search keyword.'
                : 'Prova a cercare per numero di porta (es. 22), sigla del protocollo (es. SSH) o parole descrittive.'}
            </p>
            <button
              onClick={resetFilters}
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
