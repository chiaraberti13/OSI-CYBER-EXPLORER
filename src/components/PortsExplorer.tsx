import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Hash, Sparkles, Lock, X, Layers, Network
} from 'lucide-react';
import { useStore } from '../store';
import { PORT_REGISTRY } from '../content/portContent';
import { PROTOCOL_REGISTRY } from '../content/protocolRegistry';
import { DEVICE_REGISTRY } from '../content/deviceRegistry';
import {
  filterDevices,
  filterPorts,
  filterProtocols,
  shuffled,
  type DeviceCategoryFilter,
  type PortRangeFilter
} from '../lib/portsFilter';
import type { PortInfo } from '../content/portsExplorerTypes';
import type { AaaProtocol, EapMethod, PortsTab, SecureSubTab, VpnMode } from './ports/portsTypes';
import PortsPanel from './ports/PortsPanel';
import ProtocolsPanel from './ports/ProtocolsPanel';
import DevicesPanel from './ports/DevicesPanel';
import SecureAccessPanel from './ports/SecureAccessPanel';
import TrainerPanel from './ports/TrainerPanel';

export default function PortsExplorer({ isOpen = false, onClose = () => {}, inline = false }: { isOpen?: boolean; onClose?: () => void; inline?: boolean }) {
  const { language } = useStore();
  const [activeTab, setActiveTab] = useState<PortsTab>('ports');
  const [selectedRange, setSelectedRange] = useState<PortRangeFilter>('all');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [secureSubTab, setSecureSubTab] = useState<SecureSubTab>('eap');
  const [selectedEap, setSelectedEap] = useState<EapMethod>('tls');
  const [selectedAaaSim, setSelectedAaaSim] = useState<AaaProtocol>('radius');
  const [selectedVpnMode, setSelectedVpnMode] = useState<VpnMode>('vpn-overview');

  // Port explorer state
  const [flashcardsList, setFlashcardsList] = useState<PortInfo[]>([]);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredPorts = filterPorts(PORT_REGISTRY, selectedRange, searchTerm, language);
  const filteredProtocols = filterProtocols(PROTOCOL_REGISTRY, searchTerm, language);
  const filteredDevices = filterDevices(DEVICE_REGISTRY, deviceCategory, searchTerm, language);

  const startFlashcards = () => {
    setFlashcardsList(shuffled(PORT_REGISTRY));
    setCurrentFlashcardIdx(0);
    setIsFlipped(false);
  };

  const renderWrapper = (children: React.ReactNode) => {
    if (inline) {
      return (
        <div className="relative bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden w-full h-[82vh] min-h-[600px]">
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
              className="relative bg-white rounded-xl shadow-lg z-[101] flex flex-col overflow-hidden w-full max-w-4xl h-auto max-h-[85vh] border border-slate-100"
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
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Hash className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-tighter">
                    {language === 'en' ? 'Network Ports & Protocols' : 'Porte & Protocolli di Rete'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === 'en' 
                      ? 'IANA numeric bands, protocol associations, standard definitions and security' 
                      : 'Bande numeriche IANA, associazioni dei protocolli, definizioni standard e sicurezza'}
                  </p>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl select-none sm:mr-3">
                <button
                  onClick={() => setActiveTab('ports')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'ports' 
                      ? 'bg-white text-slate-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Ports' : 'Porte'}
                </button>
                <button
                  onClick={() => setActiveTab('protocols')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'protocols' 
                      ? 'bg-white text-slate-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Protocols' : 'Protocolli'}
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'devices' 
                      ? 'bg-white text-slate-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Hardware' : 'Apparati'}
                </button>
                <button
                  onClick={() => setActiveTab('secure-access')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'secure-access' 
                      ? 'bg-white text-slate-900' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  {language === 'en' ? 'AAA & VPN' : 'AAA & VPN'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('trainer');
                    startFlashcards();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1 transition-all ${
                    activeTab === 'trainer' 
                      ? 'bg-indigo-600 text-white font-extrabold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Port Explorer' : 'Esplora porte'}
                </button>
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

            {/* Main Content Pane */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col min-h-[350px]">
              {activeTab === 'ports' ? (
                <PortsPanel
                  language={language}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedRange={selectedRange}
                  setSelectedRange={setSelectedRange}
                  filteredPorts={filteredPorts}
                />
              ) : activeTab === 'protocols' ? (
                <ProtocolsPanel
                  language={language}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filteredProtocols={filteredProtocols}
                />
              ) : activeTab === 'devices' ? (
                <DevicesPanel
                  language={language}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  deviceCategory={deviceCategory}
                  setDeviceCategory={setDeviceCategory}
                  filteredDevices={filteredDevices}
                />
              ) : activeTab === 'secure-access' ? (
                <SecureAccessPanel
                  language={language}
                  secureSubTab={secureSubTab}
                  setSecureSubTab={setSecureSubTab}
                  selectedEap={selectedEap}
                  setSelectedEap={setSelectedEap}
                  selectedAaaSim={selectedAaaSim}
                  setSelectedAaaSim={setSelectedAaaSim}
                  selectedVpnMode={selectedVpnMode}
                  setSelectedVpnMode={setSelectedVpnMode}
                />
              ) : (
                <TrainerPanel
                  language={language}
                  setActiveTab={setActiveTab}
                  flashcardsList={flashcardsList}
                  currentFlashcardIdx={currentFlashcardIdx}
                  setFlashcardsList={setFlashcardsList}
                  setCurrentFlashcardIdx={setCurrentFlashcardIdx}
                  isFlipped={isFlipped}
                  setIsFlipped={setIsFlipped}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 text-center bg-slate-50/30">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {language === 'en' ? 'IANA Bandwidth Classification • Standard Protocol Mappings' : 'Classificazione Bande IANA • Monitor di Sicurezza Standard'}
              </p>
            </div>
    </>
  );
}
