import React from 'react';
import { VPN_CONTENT } from '../../content/vpnContent';
import { EAP_CONTENT } from '../../content/eapContent';
import { AAA_CONTENT } from '../../content/aaaContent';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Lock, Layers, Server } from 'lucide-react';
import type { Language } from '../../lib/portsFilter';
import type { AaaProtocol, EapMethod, SecureSubTab, VpnMode } from './portsTypes';

export interface SecureAccessPanelProps {
  language: Language;
  secureSubTab: SecureSubTab;
  setSecureSubTab: (v: SecureSubTab) => void;
  selectedEap: EapMethod;
  setSelectedEap: (v: EapMethod) => void;
  selectedAaaSim: AaaProtocol;
  setSelectedAaaSim: (v: AaaProtocol) => void;
  selectedVpnMode: VpnMode;
  setSelectedVpnMode: (v: VpnMode) => void;
}

export default function SecureAccessPanel({
  language,
  secureSubTab,
  setSecureSubTab,
  selectedEap,
  setSelectedEap,
  selectedAaaSim,
  setSelectedAaaSim,
  selectedVpnMode,
  setSelectedVpnMode
}: SecureAccessPanelProps) {
  return (
    /* AAA & VPN Secure Access Interface */
    <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Intro Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 relative overflow-hidden border border-slate-950">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Lock className="w-64 h-64" />
        </div>
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
            <Lock className="w-3 h-3" />
            {language === 'en' ? 'Enterprise Access Integrity' : 'Integrità degli Accessi Aziendali'}
          </span>
          <h2 className="text-2xl font-semibold uppercase tracking-tight leading-none text-white">
            {language === 'en'
              ? 'AAA Secure Framework & Virtual Tunneling'
              : 'Framework Sicuro AAA & Tunneling Virtuale'}
          </h2>
          <p className="text-slate-300 text-[12.5px] leading-relaxed">
            {language === 'en'
              ? 'Authentication frameworks, AAA servers, and secure overlay channels protect network boundaries. EAP supports authentication, RADIUS and TACACS+ manage access decisions and accounting, while VPN technologies provide tunnels.'
              : 'I framework di autenticazione, i server AAA e i canali logici protetti difendono i confini delle reti. EAP supporta l’autenticazione, RADIUS e TACACS+ gestiscono decisioni di accesso e accounting, mentre le tecnologie VPN forniscono tunnel.'}
          </p>
        </div>
      </div>

      {/* Segment Selector tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px select-none">
        <button
          id="subtab-eap"
          aria-pressed={secureSubTab === 'eap'}
          onClick={() => setSecureSubTab('eap')}
          className={`min-h-11 px-4 py-2 text-xs font-semibold uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            secureSubTab === 'eap'
              ? 'border-emerald-500 text-emerald-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {language === 'en' ? 'EAP methods' : 'Metodi EAP'}
        </button>
        <button
          id="subtab-aaa"
          aria-pressed={secureSubTab === 'aaa'}
          onClick={() => setSecureSubTab('aaa')}
          className={`min-h-11 px-4 py-2 text-xs font-semibold uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            secureSubTab === 'aaa'
              ? 'border-emerald-500 text-emerald-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          RADIUS vs TACACS+ (AAA)
        </button>
        <button
          id="subtab-vpn"
          aria-pressed={secureSubTab === 'vpn'}
          onClick={() => setSecureSubTab('vpn')}
          className={`min-h-11 px-4 py-2 text-xs font-semibold uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            secureSubTab === 'vpn'
              ? 'border-emerald-500 text-emerald-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          DTLS, IPsec & VPN
        </button>
      </div>

      {/* Subtab Contents panels */}
      <AnimatePresence mode="wait">
        {secureSubTab === 'eap' && (
          <motion.div
            key="eap-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div data-testid="eap-content" className="space-y-6 min-w-0 break-words">
              <h3 className="font-bold text-slate-800">Extensible Authentication Protocol (EAP)</h3>
              <p className="text-sm text-slate-600">{EAP_CONTENT.overview[language]}</p>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div
                  className="md:col-span-4 min-w-0 space-y-2"
                  role="group"
                  aria-label={language === 'en' ? 'Select EAP method' : 'Seleziona metodo EAP'}
                >
                  {(['tls', 'peap', 'ttls', 'fast', 'md5'] as const).map((id) => (
                    <button
                      key={id}
                      id={`eap-btn-${id}`}
                      aria-pressed={selectedEap === id}
                      aria-controls="eap-detail-card"
                      onClick={() => setSelectedEap(id)}
                      className={`w-full min-h-11 text-left p-3 rounded-xl border text-sm ${selectedEap === id ? 'bg-blue-700 text-white border-blue-800' : 'bg-white text-slate-700 border-slate-300'}`}
                    >
                      <span className="block font-bold">{EAP_CONTENT.methods[id].name}</span>
                      <span className="block">{EAP_CONTENT.methods[id].label[language]}</span>
                    </button>
                  ))}
                </div>
                <section
                  id="eap-detail-card"
                  aria-live="polite"
                  aria-atomic="true"
                  className="md:col-span-8 min-w-0 bg-white border border-slate-200 rounded-lg p-5 space-y-4"
                >
                  <h4 className="font-bold text-slate-800">{EAP_CONTENT.methods[selectedEap].name}</h4>
                  <p className="text-sm text-slate-600">{EAP_CONTENT.methods[selectedEap].description[language]}</p>
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-lg space-y-4">
                    <h5 className="font-bold">
                      {language === 'en'
                        ? 'Conceptual authentication sequence'
                        : 'Sequenza concettuale di autenticazione'}
                    </h5>
                    <p className="text-sm">{EAP_CONTENT.flowNote[language]}</p>
                    <ol className="list-decimal pl-5 space-y-3 text-sm">
                      {EAP_CONTENT.methods[selectedEap].steps.map((step, index) => (
                        <li key={index}>{step[language]}</li>
                      ))}
                    </ol>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {secureSubTab === 'aaa' && (
          <motion.div
            key="aaa-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div data-testid="aaa-content" className="space-y-6 min-w-0 break-words">
              <h3 className="font-bold text-slate-800">RADIUS vs TACACS+ (AAA)</h3>
              <p className="text-sm text-slate-600">{AAA_CONTENT.overview[language]}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(AAA_CONTENT.protocols).map(([id, protocol]) => (
                  <section
                    key={id}
                    data-aaa-protocol={id}
                    className="min-w-0 bg-white border border-slate-200 rounded-lg p-5 space-y-4"
                  >
                    <h4 className="font-bold text-slate-800">{protocol.name}</h4>
                    <ul className="list-disc pl-5 space-y-3 text-sm text-slate-600">
                      {protocol.facts.map((fact, index) => (
                        <li key={index}>{fact[language]}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <section
                className="bg-slate-900 rounded-lg p-5 text-slate-200 space-y-4"
                aria-label={language === 'en' ? 'Illustrative AAA trace' : 'Traccia didattica AAA'}
              >
                <h4 className="font-bold">{language === 'en' ? 'Illustrative AAA trace' : 'Traccia didattica AAA'}</h4>
                <p className="text-sm">{AAA_CONTENT.disclaimer[language]}</p>
                <div className="flex flex-wrap gap-2">
                  {(['radius', 'tacacs'] as const).map((id) => (
                    <button
                      key={id}
                      aria-pressed={selectedAaaSim === id}
                      onClick={() => setSelectedAaaSim(id)}
                      className={`min-h-11 px-3 py-2 rounded border text-sm font-bold ${selectedAaaSim === id ? 'bg-blue-700 text-white border-blue-400' : 'bg-slate-800 text-slate-200 border-slate-500'}`}
                    >
                      {language === 'en' ? 'Simulate ' : 'Simula '}
                      {AAA_CONTENT.protocols[id].name}
                    </button>
                  ))}
                </div>
                <div aria-live="polite" aria-atomic="true" data-testid="aaa-trace" className="space-y-4">
                  <ol className="list-decimal pl-5 space-y-3 text-sm font-mono">
                    {AAA_CONTENT.protocols[selectedAaaSim].events.map((event, index) => (
                      <li key={index}>{event[language]}</li>
                    ))}
                  </ol>
                  <p className="text-sm">{AAA_CONTENT.protocols[selectedAaaSim].lesson[language]}</p>
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {secureSubTab === 'vpn' && (
          <motion.div
            key="vpn-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div data-testid="vpn-content" className="space-y-6 min-w-0 break-words">
              <h3 className="font-bold text-slate-800">VPN, IPsec &amp; DTLS</h3>
              <p className="text-sm text-slate-600">{VPN_CONTENT.overview[language]}</p>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div
                  className="lg:col-span-4 min-w-0 space-y-2"
                  role="group"
                  aria-label={language === 'en' ? 'Select VPN topic' : 'Seleziona argomento VPN'}
                >
                  {(['vpn-overview', 'ipsec-tunnel', 'ipsec-transport', 'dtls'] as const).map((id) => (
                    <button
                      key={id}
                      id={`vpn-btn-${id}`}
                      aria-pressed={selectedVpnMode === id}
                      aria-controls="vpn-detail-card"
                      onClick={() => setSelectedVpnMode(id)}
                      className={`w-full min-h-11 text-left p-3 rounded-xl border text-sm font-bold ${selectedVpnMode === id ? 'bg-blue-700 text-white border-blue-800' : 'bg-white text-slate-700 border-slate-300'}`}
                    >
                      {VPN_CONTENT.modes[id].title[language]}
                    </button>
                  ))}
                </div>
                <section
                  id="vpn-detail-card"
                  aria-live="polite"
                  aria-atomic="true"
                  className="lg:col-span-8 min-w-0 bg-white border border-slate-200 rounded-lg p-5 space-y-4"
                >
                  <h4 className="font-bold text-slate-800">{VPN_CONTENT.modes[selectedVpnMode].title[language]}</h4>
                  <p className="text-sm text-slate-600">{VPN_CONTENT.modes[selectedVpnMode].description[language]}</p>
                  <figure className="space-y-3">
                    <figcaption className="text-sm text-slate-600">{VPN_CONTENT.diagramNote[language]}</figcaption>
                    <ol
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none"
                      aria-label={language === 'en' ? 'Packet fields in order' : 'Campi del pacchetto in ordine'}
                    >
                      {VPN_CONTENT.modes[selectedVpnMode].blocks.map((block, index) => (
                        <li
                          key={index}
                          className="min-w-0 rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800"
                        >
                          <span className="block font-bold">{index + 1}.</span>
                          {block[language]}
                        </li>
                      ))}
                    </ol>
                  </figure>
                  <p data-testid="vpn-note" className="text-sm text-slate-600">
                    {VPN_CONTENT.modes[selectedVpnMode].note[language]}
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
