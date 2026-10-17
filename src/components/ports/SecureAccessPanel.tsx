import React from 'react';
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
            {/* VPN Overview card */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                {language === 'en'
                  ? 'Overlay Tunneling Security: VPN, IPsec & DTLS'
                  : "La Sicurezza dell'Overlay Tunneling: VPN, IPsec & DTLS"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'en'
                  ? 'A Virtual Private Network (VPN) creates a secure logical overlay network on top of physical networks (like the internet). IPsec and DTLS are the standard cryptographic engines that make VPN tunnels secure against sniffing and manipulation.'
                  : "Una Virtual Private Network (VPN) estende un canale privato sicuro (overlay) al di sopra di infrastrutture pubbliche (underlay) non filtrate come la rete globale Internet. IPsec e DTLS rappresentano i motori crittografici fondamentali usati per blindare e convalidare i tunnel contro l'intercettazione e il sabotaggio."}
              </p>
            </div>

            {/* Interactive selector for VPN Modes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left menu selection */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {language === 'en' ? 'Select Tunnel Technology' : 'Scegli la Tecnologia Minerale'}
                </span>
                {(
                  [
                    { id: 'vpn-overview', name: 'VPN Overview', desc: 'Secure logical envelopes' },
                    { id: 'ipsec-tunnel', name: 'IPsec Tunnel Mode', desc: 'Whole packet encryption' },
                    { id: 'ipsec-transport', name: 'IPsec Transport Mode', desc: 'Payload encryption only' },
                    { id: 'dtls', name: 'DTLS (UDP Security)', desc: 'Real-time high performance' }
                  ] as const
                ).map((vMode) => (
                  <button
                    key={vMode.id}
                    id={`vpn-btn-${vMode.id}`}
                    onClick={() => setSelectedVpnMode(vMode.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex justify-between items-center ${
                      selectedVpnMode === vMode.id
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{vMode.name}</div>
                      <div
                        className={`text-[10px] font-normal leading-tight ${selectedVpnMode === vMode.id ? 'text-emerald-100' : 'text-slate-400'}`}
                      >
                        {vMode.desc}
                      </div>
                    </div>
                    <span className="text-[14px] shrink-0 font-bold">→</span>
                  </button>
                ))}
              </div>

              {/* Right detail area */}
              <div
                id="vpn-detail-card"
                className="lg:col-span-8 bg-white border border-slate-200/80 rounded-lg p-5 space-y-5"
              >
                {/* Header description */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-800 text-sm uppercase">
                    {selectedVpnMode === 'vpn-overview' &&
                      (language === 'en'
                        ? 'VPN Overview & Cryptographic Tunneling'
                        : 'Panoramica VPN & Tunnel Crittografati')}
                    {selectedVpnMode === 'ipsec-tunnel' && 'IPsec Tunnel Mode (Gateway-to-Gateway)'}
                    {selectedVpnMode === 'ipsec-transport' && 'IPsec Transport Mode (Host-to-Host)'}
                    {selectedVpnMode === 'dtls' && 'DTLS (Datagram Transport Layer Security)'}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {selectedVpnMode === 'vpn-overview' &&
                      (language === 'en'
                        ? 'VPNs connect remote locations or telecommuters safely. Popular methods include OpenVPN, WireGuard, L2TP/IPsec, and SSL/TLS. Security depends on robust ciphers (AES/ChaCha) and establishing a cryptographic barrier over public lines.'
                        : 'Le VPN collegano in sicurezza uffici divisi o utenti remoti. I software di riferimento (es. OpenVPN, WireGuard, IPsec) aprono una porta virtuale protetta (TUN/TAP). La solidità dipende dagli algoritmi scelti, ed è garantita introducendo un Kill Switch che stacca Internet se il tunnel cade.')}
                    {selectedVpnMode === 'ipsec-tunnel' &&
                      (language === 'en'
                        ? 'In Tunnel Mode, IPsec encrypts the entire original IP packet (the original IP header and payload are both ciphered) and places it inside a completely new IP packet with a new Outer IP Header routing the packet between VPN gateways, making original locations completely hidden from passive analysis. Ideal for Site-to-Site WANs.'
                        : "In modalità Tunnel, IPsec cifra interamente il pacchetto IP originale (sia i dati sia l'intestazione IP di origine). L'intero pacchetto cifrato viene avvolto all'interno di un nuovo pacchetto IP con una nuova intestazione (Outer IP Header) che indica i gateway di transito. Nasconde i nodi reali dagli sniffer. Standard per reti Site-to-Site WAN.")}
                    {selectedVpnMode === 'ipsec-transport' &&
                      (language === 'en'
                        ? 'In Transport Mode, IPsec only encrypts the payload (TCP/UDP segment and data). The original IP header is kept in plaintext without any wrapper, meaning routing addresses are visible. It is optimized for Host-to-Host communication within already defined private environments, reducing header overhead.'
                        : "In modalità Trasporto, IPsec cifra esclusivamente il payload (i dati e i segmenti TCP/UDP), mantenendo l'intestazione IP originale visibile e intatta. Poiché non c'è un nuovo indirizzo IP di transito applicato a monte, riduce il peso dei pacchetti. È usato per comunicazioni dirette Host-to-Host in reti private predefinite.")}
                    {selectedVpnMode === 'dtls' &&
                      (language === 'en'
                        ? 'DTLS mirrors the TLS engine but adapts it to secure light connectionless UDP transmissions. Standard TLS works over TCP and suffers when nesting TCP payload streams inside TCP tunnels (TCP Meltdown / severe packet loss delays). DTLS bypasses this, making VPN tunnels perform at maximum speed, perfect for audio streams.'
                        : 'La sicurezza di TLS (lo stesso usufruito per HTTPS) incontra i flussi veloci UDP. TLS richiede TCP e soffre gravemente se si instradano flussi TCP all\'interno di tunnel TCP (frenando la linea per colli di bottiglia e latenze, "TCP Meltdown"). DTLS supera tutto questo, erogando massime performance per VPN ad alto traffico.')}
                  </p>
                </div>

                {/* Packet visualizer grid */}
                <div className="space-y-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                    {language === 'en'
                      ? 'Packet Frame Structure Visualizer'
                      : 'Visualizzatore del Pacchetto e dei Suoi Strati'}
                  </span>

                  {selectedVpnMode === 'vpn-overview' && (
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                      <div className="text-slate-500 font-bold uppercase pb-1 border-b">
                        Standard Plaintext TCP/IP packet
                      </div>
                      <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                        <div className="w-1/4 bg-slate-100 text-slate-500 border-r py-2">Outer IP</div>
                        <div className="w-1/4 bg-slate-100 text-slate-500 border-r py-2">TCP (L4)</div>
                        <div className="w-2/4 bg-red-100 text-red-700 py-2 animate-pulse">
                          Application Payload (Plaintext, EXPOSED!)
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedVpnMode === 'ipsec-tunnel' && (
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                      <div className="text-emerald-700 font-bold uppercase pb-1 border-b">
                        IPsec Tunnel Mode (Site-to-Site Encapsulated)
                      </div>
                      <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                        <div className="w-1/5 bg-emerald-600 text-white border-r py-2">New IP Header</div>
                        <div className="w-1/5 bg-indigo-600 text-white border-r py-2">ESP Header (L3)</div>
                        <div className="w-3/5 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2 flex flex-col justify-center">
                          <span>[ENCRYPTED Original IP Header]</span>
                          <span className="text-[9px] opacity-80">[ENCRYPTED Payload &amp; TCP]</span>
                        </div>
                        <div className="w-1/10 bg-indigo-600 text-white py-2 shrink-0">ESP Authentication Trailer</div>
                      </div>
                    </div>
                  )}

                  {selectedVpnMode === 'ipsec-transport' && (
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                      <div className="text-amber-700 font-bold uppercase pb-1 border-b">
                        IPsec Transport Mode (Payload Secure)
                      </div>
                      <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                        <div className="w-1/4 bg-slate-200 text-slate-600 border-r py-2">
                          Original IP Header (VISIBLE)
                        </div>
                        <div className="w-1/4 bg-indigo-600 text-white border-r py-2">ESP Header</div>
                        <div className="w-2/4 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2">
                          [ENCRYPTED Payload &amp; TCP/UDP Layers]
                        </div>
                        <div className="w-1/12 bg-indigo-600 text-white py-2 shrink-0">ESP Trailer</div>
                      </div>
                    </div>
                  )}

                  {selectedVpnMode === 'dtls' && (
                    <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                      <div className="text-purple-700 font-bold uppercase pb-1 border-b">
                        DTLS Secure Datagram Format
                      </div>
                      <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                        <div className="w-1/5 bg-slate-200 text-slate-600 border-r py-2">IP</div>
                        <div className="w-1/5 bg-amber-500 text-white border-r py-2">UDP (L4 datagram)</div>
                        <div className="w-1/5 bg-indigo-600 text-white border-r py-2">DTLS Header</div>
                        <div className="w-2/5 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2">
                          [ENCRYPTED Secure Data]
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
