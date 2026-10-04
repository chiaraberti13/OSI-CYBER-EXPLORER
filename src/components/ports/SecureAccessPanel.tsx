import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity, Lock, Layers, Server } from 'lucide-react';
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

export default function SecureAccessPanel({ language, secureSubTab, setSecureSubTab, selectedEap, setSelectedEap, selectedAaaSim, setSelectedAaaSim, selectedVpnMode, setSelectedVpnMode }: SecureAccessPanelProps) {
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
                      <h3 className="text-2xl font-semibold uppercase tracking-tight leading-none text-white">
                        {language === 'en' ? 'AAA Secure Framework & Virtual Tunneling' : 'Framework Sicuro AAA & Tunneling Virtuale'}
                      </h3>
                      <p className="text-slate-300 text-[12.5px] leading-relaxed">
                        {language === 'en'
                          ? 'Authentication frameworks, AAA servers, and secure overlay channels protect network boundaries. Learn how EAP, RADIUS, TACACS+, and VPN technologies establish trusted tunnels and audit administrative sessions.'
                          : 'I framework di autenticazione, i server AAA e i canali logici protetti difendono i confini delle reti. Scopri come le tecnologie EAP, RADIUS, TACACS+ e VPN creano tunnel cifrati e certificano le sessioni degli utenti.'}
                      </p>
                    </div>
                  </div>

                  {/* Segment Selector tabs */}
                  <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px select-none">
                    <button
                      id="subtab-eap"
                      onClick={() => setSecureSubTab('eap')}
                      className={`px-4 py-2 text-xs font-semibold uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        secureSubTab === 'eap'
                          ? 'border-emerald-500 text-emerald-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'en' ? 'EAP Framework (Types)' : 'Framework EAP (Tutti i Tipi)'}
                    </button>
                    <button
                      id="subtab-aaa"
                      onClick={() => setSecureSubTab('aaa')}
                      className={`px-4 py-2 text-xs font-semibold uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
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
                      onClick={() => setSecureSubTab('vpn')}
                      className={`px-4 py-2 text-xs font-semibold uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
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
                        {/* EAP Overview */}
                        <div className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-3">
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                            {language === 'en' ? 'Extensible Authentication Protocol (EAP)' : 'Extensible Authentication Protocol (EAP)'}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {language === 'en'
                              ? 'EAP is an authentication framework that supports multiple methods. In 802.1X, it carries authentication between the supplicant and the authenticator, which normally communicates with a back-end RADIUS server.'
                              : "EAP è un framework di autenticazione che supporta metodi differenti. In 802.1X trasporta l'autenticazione tra il supplicant e l'authenticator, che normalmente comunica con un server RADIUS di back-end."}
                          </p>
                        </div>

                        {/* Interactive EAP Types Explorer */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Method Selector buttons - Left Col */}
                          <div className="md:col-span-4 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              {language === 'en' ? 'Select EAP Method' : 'Seleziona Metodo EAP'}
                            </span>
                            {([
                              { id: 'tls', name: 'EAP-TLS', full: 'EAP Transport Layer Security', desc: 'Dual-certs' },
                              { id: 'peap', name: 'EAP-PEAP', full: 'Protected Extensible Auth Protocol', desc: 'Server cert' },
                              { id: 'ttls', name: 'EAP-TTLS', full: 'Tunneled TLS Auth', desc: 'Flexible inner' },
                              { id: 'fast', name: 'EAP-FAST', full: 'Flexible Auth via Secure Tunneling', desc: 'PAC key exchange' },
                              { id: 'md5', name: 'EAP-MD5', full: 'Message Digest 5', desc: 'Insecure legacy' }
                            ] as const).map((met) => (
                              <button
                                key={met.id}
                                id={`eap-btn-${met.id}`}
                                onClick={() => setSelectedEap(met.id)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex justify-between items-center ${
                                  selectedEap === met.id
                                    ? 'bg-emerald-600 border-emerald-700 text-white shadow'
                                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold">{met.name}</div>
                                  <div className={`text-[10px] font-normal leading-tight ${selectedEap === met.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {met.full}
                                  </div>
                                </div>
                                <span className={`text-[9px] font-bold uppercase shrink-0 px-2 py-0.5 rounded border ${
                                  selectedEap === met.id
                                    ? 'bg-emerald-500/30 border-emerald-400 text-white'
                                    : met.id === 'md5'
                                    ? 'bg-rose-50 border-rose-100 text-rose-600'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}>
                                  {met.desc}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Detail of selected method - Right Col */}
                          <div id="eap-detail-card" className="md:col-span-8 bg-white border border-slate-200/80 rounded-lg p-5 space-y-6">
                            {/* Detailed explanation */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-slate-800 text-md uppercase">
                                  {selectedEap === 'tls' && 'EAP-TLS (Certificates Verified)'}
                                  {selectedEap === 'peap' && 'EAP-PEAP (Protected EAP)'}
                                  {selectedEap === 'ttls' && 'EAP-TTLS (Tunneled TLS)'}
                                  {selectedEap === 'fast' && 'EAP-FAST (Cisco Secure)'}
                                  {selectedEap === 'md5' && 'EAP-MD5 (Vulnerable Legacy)'}
                                </h5>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  selectedEap === 'md5'
                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                  {selectedEap === 'md5' ? (language === 'en' ? 'CRITICAL RISK' : 'RISCHIO ATTO') : (language === 'en' ? 'RECOMMENDED/SECURE' : 'CONSIGLIATO / SICURO')}
                                </span>
                              </div>

                              <p className="text-[12.5px] text-slate-600 leading-relaxed">
                                {selectedEap === 'tls' && (
                                  language === 'en'
                                    ? 'EAP-TLS uses certificates on both the supplicant and authentication server. It removes reusable passwords from the exchange and provides strong mutual authentication, provided certificates and trust validation are managed correctly.'
                                    : 'EAP-TLS usa certificati sia sul supplicant sia sul server di autenticazione. Elimina le password riutilizzabili dallo scambio e offre una forte autenticazione reciproca, purché certificati e validazione della catena di fiducia siano gestiti correttamente.'
                                )}
                                {selectedEap === 'peap' && (
                                  language === 'en'
                                    ? 'EAP-PEAP simplifies deployment: only the authentication server needs a certificate. The server presents its card to establish a secure outer TLS encrypted tunnel. Inside this secure dome, the client can safely transmit standard credentials (usually using MSCHAPv2 user/pass) without danger of sniffing.'
                                    : "EAP-PEAP semplifica l'installazione aziendale: solo il server centrale richiede un certificato. Il server lo invia al client per stabilire inizialmente un tunnel TLS crittografato (involucro esterno). All'interno di questo tunnel protetto, il client autentica sé stesso inviando le classiche credenziali (di solito MSCHAPv2 user/password) in piena sicurezza."
                                )}
                                {selectedEap === 'ttls' && (
                                  language === 'en'
                                    ? 'Similar to PEAP, EAP-TTLS creates a secure outer TLS tunnel first based on the server certificate. Inside the tunnel, however, TTLS allows an even wider variety of legacy inner authentication protocols (like PAP, CHAP, or MSCHAPv1) without exposing them to cleartext sniffing risks.'
                                    : 'Molto simile a PEAP, EAP-TTLS genera un canale TLS esterno cifrato basandosi sul certificato del server. Al suo interno, permette tuttavia un ventaglio flessibile di vecchi protocolli interni di autenticazione (es. PAP, CHAP, MSCHAP) che non potrebbero viaggiare all\'aria aperta in chiaro di default.'
                                )}
                                {selectedEap === 'fast' && (
                                  language === 'en'
                                    ? 'Created by Cisco as an alternative to digital certificates. Instead of heavy certificate authorities, it uses an in-band shared symmetric credential called PAC (Protected Access Credential) to establish a protective tunnel, preventing latency during access handshakes.'
                                    : 'Concepito da Cisco per aggirare la complessa infrastruttura a chiavi pubbliche (PKI). Sostituisce i certificati digitali delegando la transazione iniziale ad una credenziale simmetrica chiamata PAC (Protected Access Credential), riducendo la latenza complessiva.'
                                )}
                                {selectedEap === 'md5' && (
                                  language === 'en'
                                    ? 'An old legacy EAP type that transmits password hashes using MD5 without establishing any encrypted tunnel. Highly vulnerable to dictionary sniffing, offline brute force, and fake access point dirottements (Evil Twin/MitM). Deprecated and strictly forbidden in professional networks.'
                                    : 'Il tipo di EAP più antico. Trasmette gli hash delle password dei client via MD5 senza creare alcun tunnel cifrato a monte. È altamente vulnerabile a intercettazione passiva (sniffing), attacchi offline a dizionario ed Evil Twin. È fortemente sconsigliato e deprecato.'
                                )}
                              </p>
                            </div>

                            {/* Interactive flow map diagram of supplicant authenticator server */}
                            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10.5px] border border-slate-950 space-y-3 shrink-0">
                              <div className="border-b border-slate-800 pb-1.5 flex justify-between items-center text-slate-400 font-bold uppercase tracking-wider">
                                <span>Autentication Protocol Interaction Map</span>
                                <span className="text-[9px] shrink-0 text-amber-500 font-normal">Active Selection: {selectedEap.toUpperCase()}</span>
                              </div>

                              <div className="grid grid-cols-3 text-center gap-1 font-bold text-slate-400 uppercase py-1 bg-slate-800/20 rounded">
                                <span className="text-blue-300">Client / Supplicant</span>
                                <span className="text-emerald-300">Switch/AP / Authenticator</span>
                                <span className="text-pink-300">AAA Server / RADIUS</span>
                              </div>

                              {/* Interactive sequence flow based on EAP choices */}
                              <div className="space-y-2 mt-2 leading-relaxed">
                                {selectedEap === 'tls' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Client starts association</span>
                                      <span className="text-blue-400">EAPOL-Start ───&gt;</span>
                                      <span className="text-emerald-400">AP limits port</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300">
                                      <span>2. Server prompts certificate</span>
                                      <span className="text-pink-400">&lt;─── TLS Certs Exchange ───&gt;</span>
                                      <span>Supplicant &amp; Server validation</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                                      <span>3. Mutual trust verified</span>
                                      <span>Certificates digital signature valid (Dual checks)</span>
                                      <span className="text-emerald-400">✓ Port Activated</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'peap' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Client seeks access</span>
                                      <span className="text-blue-400">WPA-Enterprise init ──&gt;</span>
                                      <span>Relayed to AAA Server</span>
                                    </div>
                                    <div className="flex justify-between items-center text-amber-300">
                                      <span>2. Encrypted TLS Tunnel</span>
                                      <span className="text-pink-400">&lt;═ [Outer Tunnel Established] ═&gt;</span>
                                      <span>RADIUS Cert validated by Client</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400">
                                      <span>3. Inner credential check</span>
                                      <span className="text-blue-400">└─ Sends encrypted User/Pass ──&gt;</span>
                                      <span>RADIUS check against Active Directory</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'ttls' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Request connection</span>
                                      <span>802.1X link initiated</span>
                                      <span>Active bridge suspended</span>
                                    </div>
                                    <div className="flex justify-between items-center text-indigo-300">
                                      <span>2. Server tunnel setup</span>
                                      <span className="text-indigo-400">&lt;═ [Tunnel TLS Shield Active] ═&gt;</span>
                                      <span>Server authentication authenticated</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400">
                                      <span>3. Safe legacy pass exchange</span>
                                      <span className="text-blue-400">└─ Internal PAP/CHAP credential ──&gt;</span>
                                      <span>✓ Decrypted and checked in server</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'fast' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Handshake request</span>
                                      <span className="text-blue-400">PAC identification key ──&gt;</span>
                                      <span>Matches PAC database lookup</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-300">
                                      <span>2. Rapid tunnel creation</span>
                                      <span className="text-pink-400">&lt;═ [PAC encrypted tunnel] ═&gt;</span>
                                      <span>No heavy Certificate Authorities required</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400">
                                      <span>3. Access approved</span>
                                      <span>Credential matched symmetrically</span>
                                      <span>✓ Port instantly authorized</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'md5' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Client logins</span>
                                      <span className="text-blue-300">Simple identity request ──&gt;</span>
                                      <span>No tunnel wrapping available</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-400 font-semibold animate-pulse">
                                      <span>2. Password challenge</span>
                                      <span className="text-pink-400">&lt;─── Sends raw MD5 challenge ───</span>
                                      <span>Vulnerable to dictionary brute force Sniffer</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-500 font-bold">
                                      <span>3. CRITICAL RISK</span>
                                      <span>Password hash readable by rogue antennas</span>
                                      <span>⚠ Deauth and identity loss risk high</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
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
                        {/* AAA Overview info */}
                        <div className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-3">
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                            {language === 'en' ? 'Centralized Network Control: RADIUS vs TACACS+' : 'Controllo Centralizzato degli Accessi: RADIUS vs TACACS+'}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {language === 'en'
                              ? 'RADIUS and TACACS+ are both AAA (Authentication, Authorization, Accounting) protocols used to manage network access. However, they were built for different scopes: RADIUS is engineered for user/client access at the perimeter, while TACACS+ is crafted for fine-grained administrative access controls directly on network hardware.'
                              : "RADIUS e TACACS+ sono i due protocolli di gestione centralizzata AAA (Autenticazione, Autorizzazione, Accounting) leader del mercato. Sebbene si somiglino negli scopi, nascono per esigenze antitetiche: RADIUS si focalizza sul controllo d'accesso degli utenti ai bordi (es. Wi-Fi aziendale), mentre TACACS+ governa la sicurezza degli amministratori di sistema direttamente sulle riga di comando di router e switch."}
                          </p>
                        </div>

                        {/* Comparative Grid Table */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                          {/* RADIUS Features Card */}
                          <div className="bg-white border-t-4 border-t-blue-500 border border-slate-200 rounded-lg p-5 space-y-4">
                            <span className="text-xs font-semibold text-blue-600 font-mono tracking-wider block uppercase">RADIUS</span>
                            <h5 className="font-extrabold text-slate-800 text-sm">Remote Authentication Dial-In User Service</h5>
                            
                            <ul className="space-y-2.5 text-xs text-slate-600">
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">L4</span>
                                <span><strong>{language === 'en' ? 'Transport' : 'Trasporto'}:</strong> UDP (ports 1812 Authentication, 1813 Accounting). Connectionless and fast.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">SEC</span>
                                <span><strong>{language === 'en' ? 'Encryption' : 'Crittografia'}:</strong> Only encrypts the password field inside the packet. Usernames, attributes, and session statistics are sent in cleartext.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">AAA</span>
                                <span><strong>{language === 'en' ? 'Separation' : 'Separazione'}:</strong> Combines Authentication and Authorization together in a single request transaction.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">USE</span>
                                <span><strong>{language === 'en' ? 'Scope' : 'Destinazione'}:</strong> Client access and perimeter doors (secure corporate Wi-Fi, switches port locking, Dial-up/Broadband networks).</span>
                              </li>
                            </ul>
                          </div>

                          {/* TACACS+ Features Card */}
                          <div className="bg-white border-t-4 border-t-emerald-500 border border-slate-200 rounded-lg p-5 space-y-4">
                            <span className="text-xs font-semibold text-emerald-600 font-mono tracking-wider block uppercase">TACACS+</span>
                            <h5 className="font-extrabold text-slate-800 text-sm">Terminal Access Controller Access-Control System Plus</h5>
                            
                            <ul className="space-y-2.5 text-xs text-slate-600">
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">L4</span>
                                <span><strong>{language === 'en' ? 'Transport' : 'Trasporto'}:</strong> TCP (port 49). Establishes a connection-oriented stateful session, guaranteed delivery.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">SEC</span>
                                <span><strong>{language === 'en' ? 'Encryption' : 'Crittografia'}:</strong> Completely encrypts the entire body payload of the packet. Only a minimal standard header is left in plaintext.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">AAA</span>
                                <span><strong>{language === 'en' ? 'Separation' : 'Separazione'}:</strong> Separates Authentication, Authorization, and Accounting cleanly into autonomous queries.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">USE</span>
                                <span><strong>{language === 'en' ? 'Scope' : 'Destinazione'}:</strong> Highly detailed administrative control on switches, routers, firewalls. Authorizes specific configuration commands (e.g. allow only 'show running-config' but deny 'reload').</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Interactive Diagnostic AAA Console simulator */}
                        <div className="bg-slate-900 border border-slate-950 rounded-lg p-5 text-slate-300 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <h5 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                              <Activity className="w-4 h-4 text-emerald-400" />
                              {language === 'en' ? 'AAA Active Protocol Logger' : 'Analizzatore Real-Time Auditing AAA'}
                            </h5>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedAaaSim('radius')}
                                className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors border ${
                                  selectedAaaSim === 'radius'
                                    ? 'bg-blue-600 text-white border-blue-700'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {language === 'en' ? 'Simulate RADIUS' : 'Simula RADIUS'}
                              </button>
                              <button
                                onClick={() => setSelectedAaaSim('tacacs')}
                                className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors border ${
                                  selectedAaaSim === 'tacacs'
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {language === 'en' ? 'Simulate TACACS+' : 'Simula TACACS+'}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs space-y-2 leading-relaxed border border-slate-800">
                            {selectedAaaSim === 'radius' ? (
                              <>
                                <p className="text-blue-400">&gt; RADIUS CLI: Connecting Client WPA3-Enterprise supplicant...</p>
                                <p className="text-slate-500">&gt; Packet generated: UDP Port 1812 destination, size 124 bytes.</p>
                                <p className="text-amber-400 font-bold">&gt; [SNIFFER VIEW] Username: "employee_chiara" [PLAINTEXT]</p>
                                <p className="text-amber-400 font-bold">&gt; [SNIFFER VIEW] Encrypted Attribute: Password hash: "ESP_hash_2026_***" [PROTECTED]</p>
                                <p className="text-slate-400">&gt; Query dispatched to company Active Directory Server. Checking user profiles...</p>
                                <p className="text-emerald-400 font-bold">&gt; RESPONSE RECEIVED [Access-Accept] - Combined Auth/Authz approved. User connected. Profile: "VLAN_IT_Dept" assigned.</p>
                              </>
                            ) : (
                              <>
                                <p className="text-emerald-400">&gt; TACACS+ CLI: Sys-Administrator "chiara_admin" logging on Router_Core_Rome...</p>
                                <p className="text-slate-500">&gt; Session opened: TCP Port 49 connection established. Stateful handshake completed.</p>
                                <p className="text-emerald-500 font-bold">&gt; [SNIFFER VIEW] Entire packet body encrypted. Payload is invisible to hackers! [CRITICAL ADVANTAGE]</p>
                                <p className="text-slate-400">&gt; Command typed: "configure terminal" (auth check requested)...</p>
                                <p className="text-emerald-400 font-bold">&gt; COMMAND AUTHORIZATION: Approved. Server grants "Privilege Level 15" for exact conft commands.</p>
                                <p className="text-slate-400">&gt; Logged command to security audit ledger [TACACS+ Accounting].</p>
                              </>
                            )}
                          </div>
                          
                          <div className="text-slate-400 text-[11px] leading-relaxed">
                            {selectedAaaSim === 'radius' ? (
                              <p>
                                <strong>💡 {language === 'en' ? 'Security Lesson' : 'Spiegazione Pratica'}:</strong>{' '}
                                {language === 'en'
                                  ? 'Notice how RADIUS left the username visible in plaintext over the wire! Because RADIUS only encrypts the password attribute, hackers sniffing local network corridors can map all your corporate active usernames easily. Standard RADIUS should always be encapsulated inside secure IPsec tunnels or upgraded to RadSec (over TLS).'
                                  : "Nota come il pacchetto RADIUS trasmetta il nome utente in chiaro lungo la linea di transito! Poiché RADIUS cifra soltanto la password, terzi hacker in ascolto abusivo possono mappare l'identità dell'utente semplicemente spiando i pacchetti. Per questo motivo, il protocollo va protetto incapsulandolo in tunnel IPsec o migrando a RadSec (RADIUS su TLS Cifrato)."}
                              </p>
                            ) : (
                              <p>
                                <strong>💡 {language === 'en' ? 'Security Lesson' : 'Spiegazione Pratica'}:</strong>{' '}
                                {language === 'en'
                                  ? 'TACACS+ completely encrypts every packet. Sniffers only see the transport TCP layer metadata. Furthermore, TACACS+ checks every single configuration command individually. If a rogue admin types "reload" or "erase startup-config", TACACS+ can block the command instantly while keeping the engineer session active, guaranteeing professional security auditing.'
                                  : 'Il TACACS+ cifra interamente ogni pacchetto; gli sniffer vedono solo i metadati di trasporto. Inoltre, TACACS+ convalida i comandi in modo granulare: se un amministratore malevolo digita "reload" o comandi dannosi, il server può negare lo specifico comando salvando la rete, lasciando l\'utente connesso per compiere altre configurazioni.'}
                              </p>
                            )}
                          </div>
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
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                            {language === 'en' ? 'Overlay Tunneling Security: VPN, IPsec & DTLS' : 'La Sicurezza dell\'Overlay Tunneling: VPN, IPsec & DTLS'}
                          </h4>
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
                            {([
                              { id: 'vpn-overview', name: 'VPN Overview', desc: 'Secure logical envelopes' },
                              { id: 'ipsec-tunnel', name: 'IPsec Tunnel Mode', desc: 'Whole packet encryption' },
                              { id: 'ipsec-transport', name: 'IPsec Transport Mode', desc: 'Payload encryption only' },
                              { id: 'dtls', name: 'DTLS (UDP Security)', desc: 'Real-time high performance' }
                            ] as const).map((vMode) => (
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
                                  <div className={`text-[10px] font-normal leading-tight ${selectedVpnMode === vMode.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {vMode.desc}
                                  </div>
                                </div>
                                <span className="text-[14px] shrink-0 font-bold">→</span>
                              </button>
                            ))}
                          </div>

                          {/* Right detail area */}
                          <div id="vpn-detail-card" className="lg:col-span-8 bg-white border border-slate-200/80 rounded-lg p-5 space-y-5">
                            {/* Header description */}
                            <div className="space-y-2">
                              <h5 className="font-semibold text-slate-800 text-sm uppercase">
                                {selectedVpnMode === 'vpn-overview' && (language === 'en' ? 'VPN Overview & Cryptographic Tunneling' : 'Panoramica VPN & Tunnel Crittografati')}
                                {selectedVpnMode === 'ipsec-tunnel' && 'IPsec Tunnel Mode (Gateway-to-Gateway)'}
                                {selectedVpnMode === 'ipsec-transport' && 'IPsec Transport Mode (Host-to-Host)'}
                                {selectedVpnMode === 'dtls' && 'DTLS (Datagram Transport Layer Security)'}
                              </h5>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {selectedVpnMode === 'vpn-overview' && (
                                  language === 'en'
                                    ? 'VPNs connect remote locations or telecommuters safely. Popular methods include OpenVPN, WireGuard, L2TP/IPsec, and SSL/TLS. Security depends on robust ciphers (AES/ChaCha) and establishing a cryptographic barrier over public lines.'
                                    : 'Le VPN collegano in sicurezza uffici divisi o utenti remoti. I software di riferimento (es. OpenVPN, WireGuard, IPsec) aprono una porta virtuale protetta (TUN/TAP). La solidità dipende dagli algoritmi scelti, ed è garantita introducendo un Kill Switch che stacca Internet se il tunnel cade.'
                                )}
                                {selectedVpnMode === 'ipsec-tunnel' && (
                                  language === 'en'
                                    ? 'In Tunnel Mode, IPsec encrypts the entire original IP packet (the original IP header and payload are both ciphered) and places it inside a completely new IP packet with a new Outer IP Header routing the packet between VPN gateways, making original locations completely hidden from passive analysis. Ideal for Site-to-Site WANs.'
                                    : 'In modalità Tunnel, IPsec cifra interamente il pacchetto IP originale (sia i dati sia l\'intestazione IP di origine). L\'intero pacchetto cifrato viene avvolto all\'interno di un nuovo pacchetto IP con una nuova intestazione (Outer IP Header) che indica i gateway di transito. Nasconde i nodi reali dagli sniffer. Standard per reti Site-to-Site WAN.'
                                )}
                                {selectedVpnMode === 'ipsec-transport' && (
                                  language === 'en'
                                    ? 'In Transport Mode, IPsec only encrypts the payload (TCP/UDP segment and data). The original IP header is kept in plaintext without any wrapper, meaning routing addresses are visible. It is optimized for Host-to-Host communication within already defined private environments, reducing header overhead.'
                                    : 'In modalità Trasporto, IPsec cifra esclusivamente il payload (i dati e i segmenti TCP/UDP), mantenendo l\'intestazione IP originale visibile e intatta. Poiché non c\'è un nuovo indirizzo IP di transito applicato a monte, riduce il peso dei pacchetti. È usato per comunicazioni dirette Host-to-Host in reti private predefinite.'
                                )}
                                {selectedVpnMode === 'dtls' && (
                                  language === 'en'
                                    ? 'DTLS mirrors the TLS engine but adapts it to secure light connectionless UDP transmissions. Standard TLS works over TCP and suffers when nesting TCP payload streams inside TCP tunnels (TCP Meltdown / severe packet loss delays). DTLS bypasses this, making VPN tunnels perform at maximum speed, perfect for audio streams.'
                                    : 'La sicurezza di TLS (lo stesso usufruito per HTTPS) incontra i flussi veloci UDP. TLS richiede TCP e soffre gravemente se si instradano flussi TCP all\'interno di tunnel TCP (frenando la linea per colli di bottiglia e latenze, "TCP Meltdown"). DTLS supera tutto questo, erogando massime performance per VPN ad alto traffico.'
                                )}
                              </p>
                            </div>

                            {/* Packet visualizer grid */}
                            <div className="space-y-2 shrink-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                                {language === 'en' ? 'Packet Frame Structure Visualizer' : 'Visualizzatore del Pacchetto e dei Suoi Strati'}
                              </span>

                              {selectedVpnMode === 'vpn-overview' && (
                                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                                  <div className="text-slate-500 font-bold uppercase pb-1 border-b">Standard Plaintext TCP/IP packet</div>
                                  <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                                    <div className="w-1/4 bg-slate-100 text-slate-500 border-r py-2">Outer IP</div>
                                    <div className="w-1/4 bg-slate-100 text-slate-500 border-r py-2">TCP (L4)</div>
                                    <div className="w-2/4 bg-red-100 text-red-700 py-2 animate-pulse">Application Payload (Plaintext, EXPOSED!)</div>
                                  </div>
                                </div>
                              )}

                              {selectedVpnMode === 'ipsec-tunnel' && (
                                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                                  <div className="text-emerald-700 font-bold uppercase pb-1 border-b">IPsec Tunnel Mode (Site-to-Site Encapsulated)</div>
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
                                  <div className="text-amber-700 font-bold uppercase pb-1 border-b">IPsec Transport Mode (Payload Secure)</div>
                                  <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                                    <div className="w-1/4 bg-slate-200 text-slate-600 border-r py-2">Original IP Header (VISIBLE)</div>
                                    <div className="w-1/4 bg-indigo-600 text-white border-r py-2">ESP Header</div>
                                    <div className="w-2/4 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2">[ENCRYPTED Payload &amp; TCP/UDP Layers]</div>
                                    <div className="w-1/12 bg-indigo-600 text-white py-2 shrink-0">ESP Trailer</div>
                                  </div>
                                </div>
                              )}

                              {selectedVpnMode === 'dtls' && (
                                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                                  <div className="text-purple-700 font-bold uppercase pb-1 border-b">DTLS Secure Datagram Format</div>
                                  <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                                    <div className="w-1/5 bg-slate-200 text-slate-600 border-r py-2">IP</div>
                                    <div className="w-1/5 bg-amber-500 text-white border-r py-2">UDP (L4 datagram)</div>
                                    <div className="w-1/5 bg-indigo-600 text-white border-r py-2">DTLS Header</div>
                                    <div className="w-2/5 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2">[ENCRYPTED Secure Data]</div>
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
