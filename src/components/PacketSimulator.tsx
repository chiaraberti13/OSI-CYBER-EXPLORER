import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { OSI_LAYERS, ATTACK_SCENARIOS, GLOSSARY_TERMS } from '../constants';
import { Zap, Skull, ShieldCheck, Play, RotateCcw, Info, Pause, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { playAudioCue } from '../utils/audio';
import { pduNameForLayer, l4ProtocolFor } from '../lib/osi';

export default function PacketSimulator() {
  const { 
    language, 
    simulationState, 
    setSimulationState, 
    addLog, 
    packetHeaders, 
    addPacketHeader, 
    clearPacketHeaders,
    currentStep,
    setCurrentStep,
    activeAttack,
    setActiveAttack,
    activeScenarioId,
    setActiveScenarioId,
    defenseEnabled,
    setDefenseEnabled,
    isPaused,
    setIsPaused,
    selectedProtocol,
    setViewMode,
    setSelectedLayerId,
    setDetailTab,
    setLanguage,
    isGlossaryOpen,
    setIsGlossaryOpen,
    audioEnabled,
    setAudioEnabled,
    simSpeed,
    setSimSpeed
  } = useStore();

  const stepInterval = Math.round(1000 / simSpeed);

  const labels = {
    en: {
      start: 'Start Simulation',
      reset: 'Reset',
      pause: 'Pause',
      resume: 'Resume',
      encap: 'Encapsulation (TX)',
      decap: 'Decapsulation (RX)',
      idle: 'System Idle',
      interrupted: 'Connection Interrupted',
      headers: 'Packet Inspector',
      attack: 'Inject Attack',
      defense: 'Enable Defense',
      none: 'None'
    },
    it: {
      start: 'Avvia Simulazione',
      reset: 'Reset',
      pause: 'Pausa',
      resume: 'Riprendi',
      encap: 'Incapsulamento (TX)',
      decap: 'Decapsulamento (RX)',
      idle: 'Sistema Idle',
      interrupted: 'Connessione Interrotta',
      headers: 'Ispettore Pacchetto',
      attack: 'Inietta Attacco',
      defense: 'Attiva Difesa',
      none: 'Nessuno'
    }
  }[language];

  const handleStart = async () => {
    if (simulationState !== 'idle') return;
    
    clearPacketHeaders();
    setIsPaused(false);
    setSimulationState('encapsulating');
    setCurrentStep(7);
    
    if (selectedProtocol === 'HTTP') {
      addLog(language === 'en' ? 'HTTP Request: Initiating TCP 3-way handshake...' : 'Richiesta HTTP: Avvio handshake TCP a 3 vie...', 'info');
    } else if (selectedProtocol === 'SSH') {
      addLog(language === 'en' ? 'SSH Session: Initiating Diffie-Hellman Key Exchange...' : 'Sessione SSH: Avvio scambio chiavi Diffie-Hellman...', 'info');
    } else if (selectedProtocol === 'FTP') {
      addLog(language === 'en' ? 'FTP Control: Connecting to command port 21...' : 'Controllo FTP: Connessione alla porta comandi 21...', 'info');
    } else if (selectedProtocol === 'SMTP') {
      addLog(language === 'en' ? 'SMTP Session: Sending EHLO to mail gateway...' : 'Sessione SMTP: Invio EHLO al gateway di posta...', 'info');
    } else if (selectedProtocol === 'DNS') {
      addLog(language === 'en' ? 'DNS Query: Resolving domain name...' : 'Query DNS: Risoluzione nome dominio...', 'info');
    } else if (selectedProtocol === 'BGP') {
      addLog(language === 'en' ? 'BGP Update: Announcing IP prefix...' : 'Update BGP: Annuncio prefisso IP...', 'info');
    } else {
      addLog(language === 'en' ? 'Packet Preparation: Initializing new sequence...' : 'Preparazione Pacchetto: Inizializzazione nuova sequenza...', 'info');
    }
    
    addLog(language === 'en' ? 'Starting packet encapsulation...' : 'Inizio incapsulamento pacchetto...', 'info');
    if (audioEnabled) playAudioCue('start');
  };

  const handleReset = () => {
    setSimulationState('idle');
    setIsPaused(false);
    setCurrentStep(7);
    clearPacketHeaders();
    setActiveAttack('none');
    addLog(language === 'en' ? 'Simulation reset.' : 'Simulazione resettata.', 'warning');
  };

  const getPduName = (layerId: number) => pduNameForLayer(layerId, selectedProtocol);

  const getHeaderForLayer = (layerId: number) => {
    const layer = OSI_LAYERS.find(l => l.id === layerId);
    if (!layer) return 'Data';
    if (layerId === 4) return l4ProtocolFor(selectedProtocol); // TCP / UDP
    if (layerId === 3) return 'IP';
    return layer.translations[language].protocols?.[0] || 'Header';
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (simulationState === 'encapsulating' && !isPaused) {
      interval = setInterval(() => {
        if (currentStep > 1) {
          const headerName = getHeaderForLayer(currentStep);
          const pduName = getPduName(currentStep);
          
          let details = `L${currentStep} Header Added`;
          let fields: { key: string; value: string }[] = [];

          if (selectedProtocol === 'HTTP') {
            if (currentStep === 7) {
              details = 'GET /index.html HTTP/1.1';
              fields = [
                { key: 'Method', value: 'GET' },
                { key: 'Path', value: '/index.html' },
                { key: 'Host', value: 'ais.dev' },
                { key: 'Agent', value: 'Mozilla/5.0' }
              ];
            } else if (currentStep === 6) {
              details = 'Encoding: gzip | Charset: UTF-8';
              fields = [
                { key: 'Encoding', value: 'gzip' },
                { key: 'Charset', value: 'UTF-8' },
                { key: 'Crypto', value: 'TLSv1.3' }
              ];
            } else if (currentStep === 5) {
              details = 'SessionID: 4f8s9... Status: Authenticated';
              fields = [
                { key: 'SessionID', value: 'SESS_4F8S9A' },
                { key: 'Status', value: 'Authenticated' },
                { key: 'Persistence', value: 'Keep-Alive' }
              ];
            } else if (currentStep === 4) {
              details = 'TCP: SYN, Seq=120, Port=80';
              fields = [
                { key: 'SrcPort', value: '54321' },
                { key: 'DstPort', value: '80' },
                { key: 'SeqNo', value: '120485' },
                { key: 'Flags', value: 'SYN' }
              ];
            } else if (currentStep === 3) {
              details = 'IPv4: 192.168.1.10 -> 104.22.3.14';
              fields = [
                { key: 'SrcIP', value: '192.168.1.10' },
                { key: 'DstIP', value: '104.22.3.14' },
                { key: 'TTL', value: '64' },
                { key: 'Proto', value: '0x06 (TCP)' }
              ];
            } else if (currentStep === 2) {
              details = 'MAC: 00:0C:29... -> 00:50:56...';
              fields = [
                { key: 'SrcMAC', value: '00:0C:29:C0:00:08' },
                { key: 'DstMAC', value: '00:50:56:C0:00:01' },
                { key: 'VLAN', value: '10' }
              ];
            }
          } else if (selectedProtocol === 'SSH') {
             if (currentStep === 7) {
              details = 'SSH-2.0-OpenSSH_8.9: Encrypted Payload';
              fields = [
                { key: 'MsgId', value: '34' },
                { key: 'EncData', value: '4f2a...88bc' },
                { key: 'MAC', value: 'SHA256' }
              ];
            } else if (currentStep === 4) {
              details = 'TCP Port 22 (SSH)';
              fields = [
                { key: 'SrcPort', value: '55231' },
                { key: 'DstPort', value: '22' },
                { key: 'SeqNo', value: '1001' }
              ];
            } else {
              details = `L${currentStep} Overhead`;
            }
          } else if (selectedProtocol === 'FTP') {
            if (currentStep === 7) {
              details = 'FTP Command: USER anonymous';
              fields = [
                { key: 'Prefix', value: 'USER' },
                { key: 'Arg', value: 'anonymous' },
                { key: 'EOL', value: 'CRLF' }
              ];
            } else if (currentStep === 4) {
              details = 'TCP Port 21 (FTP-Control)';
              fields = [
                { key: 'SrcPort', value: '55678' },
                { key: 'DstPort', value: '21' }
              ];
            } else {
              details = `L${currentStep} Overhead`;
            }
          } else if (selectedProtocol === 'SMTP') {
            if (currentStep === 7) {
              details = 'SMTP: MAIL FROM:<user@host.com>';
              fields = [
                { key: 'Command', value: 'MAIL FROM' },
                { key: 'Sender', value: 'admin@system.it' }
              ];
            } else if (currentStep === 4) {
              details = 'TCP Port 25 (SMTP)';
              fields = [
                { key: 'SrcPort', value: '5590' },
                { key: 'DstPort', value: '25' }
              ];
            } else {
              details = `L${currentStep} Overhead`;
            }
          } else if (selectedProtocol === 'DNS') {
            if (currentStep === 7) {
              details = 'DNS Query: google.com (A Record)';
              fields = [
                { key: 'ID', value: '0x3a4b' },
                { key: 'Flags', value: 'Standard Query' },
                { key: 'Name', value: 'google.com' },
                { key: 'Type', value: 'A (IPv4 Address)' }
              ];
            } else if (currentStep === 4) {
              details = 'UDP Port 53';
              fields = [
                { key: 'SrcPort', value: '55667' },
                { key: 'DstPort', value: '53 (DNS)' },
                { key: 'Len', value: '38' }
              ];
            } else if (currentStep === 3) {
              details = 'IP Dest: 8.8.8.8';
              fields = [
                { key: 'SrcIP', value: '192.168.1.10' },
                { key: 'DstIP', value: '8.8.8.8' },
                { key: 'TTL', value: '64' }
              ];
            } else if (currentStep === 2) {
              details = 'Ethernet II: ARP Resolved';
              fields = [
                { key: 'SrcMAC', value: '00:0C:29:C0:00:08' },
                { key: 'DstMAC', value: '00:50:56:C0:00:01' }
              ];
            } else {
              details = `L${currentStep} Overhead`;
            }
          } else if (selectedProtocol === 'BGP') {
             if (currentStep === 7) {
              details = 'BGP Update: Prefix 192.168.100.0/24';
              fields = [
                { key: 'MsgType', value: 'UPDATE' },
                { key: 'Prefix', value: '192.168.100.0/24' },
                { key: 'Origin', value: 'IGP' },
                { key: 'AS_PATH', value: '65001 65002' }
              ];
            } else if (currentStep === 4) {
              details = 'TCP Port 179 (BGP)';
              fields = [
                { key: 'SrcPort', value: '179' },
                { key: 'DstPort', value: '179' },
                { key: 'Flags', value: 'PUSH, ACK' }
              ];
            } else if (currentStep === 3) {
              details = 'IP: Internal Routing';
              fields = [
                { key: 'SrcIP', value: '10.0.0.1' },
                { key: 'DstIP', value: '10.0.0.2' }
              ];
            } else if (currentStep === 2) {
              details = 'Fiber Link: Frame tagging';
              fields = [
                { key: 'Tag', value: 'MPLS' }
              ];
            } else {
              details = `L${currentStep} Routing Overhead`;
            }
          } else {
            if (currentStep === 7) {
              details = 'ICMP Echo Request: Data payload';
              fields = [
                { key: 'Type', value: '8 (Echo Request)' },
                { key: 'Code', value: '0' },
                { key: 'Payload', value: '32 Bytes' }
              ];
            } else if (currentStep === 4) {
              details = 'UDP: Checksum 0xAC3F';
              fields = [
                { key: 'SrcPort', value: '32768' },
                { key: 'DstPort', value: '7' },
                { key: 'Length', value: '40' }
              ];
            } else if (currentStep === 3) {
              details = 'ICMP Over IP: Type 8, Code 0';
              fields = [
                { key: 'SrcIP', value: '192.168.1.5' },
                { key: 'DstIP', value: '8.8.8.8' },
                { key: 'TTL', value: '128' }
              ];
            } else if (currentStep === 2) {
              details = 'Ethernet II: IPv4 Payload';
              fields = [
                { key: 'SrcMAC', value: 'B4:2E:99:A1:C2:E0' },
                { key: 'DstMAC', value: 'E4:F4:C6:D1:B2:A1' },
                { key: 'Type', value: '0x0800' }
              ];
            }
          }

          addPacketHeader({
            layer: currentStep,
            protocol: headerName,
            details: details,
            pduName: pduName,
            fields: fields
          });
          addLog(`L${currentStep} encapsulated (${headerName})`, 'success');
          setSelectedLayerId(currentStep);
          setCurrentStep(currentStep - 1);
          if (audioEnabled) playAudioCue('step');
        } else {
          addLog(language === 'en' ? 'Transmitting via Physical Media...' : 'Trasmissione via Media Fisico...', 'info');
          
          if (activeAttack !== 'none' && !defenseEnabled) {
            setSimulationState('interrupted');
            addLog(language === 'en' ? `CRITICAL: ${activeAttack.toUpperCase()} attack successful! Connection dropped.` : `CRITICO: Attacco ${activeAttack.toUpperCase()} riuscito! Connessione interrotta.`, 'danger');
            if (audioEnabled) playAudioCue('alert');
          } else {
             if (activeAttack !== 'none' && defenseEnabled) {
               addLog(language === 'en' ? `Defense mitigated ${activeAttack.toUpperCase()} attack.` : `La difesa ha mitigato l'attacco ${activeAttack.toUpperCase()}.`, 'success');
             }
             setSimulationState('decapsulating');
             addLog(language === 'en' ? 'Packet reaching destination. Starting decapsulation...' : 'Il pacchetto raggiunge il destinatario. Inizio decapsulamento...', 'info');
          }
        }
      }, stepInterval);
    } else if (simulationState === 'decapsulating' && !isPaused) {
      interval = setInterval(() => {
        if (currentStep < 7) {
          const nextStep = currentStep + 1;
          const pduName = getPduName(nextStep);
          addLog(`L${currentStep} decapsulated (${pduName})`, 'success');
          setSelectedLayerId(nextStep);
          setCurrentStep(nextStep);
          if (audioEnabled) playAudioCue('step');
        } else {
          addLog(language === 'en' ? 'Data successfully delivered to Application Layer.' : 'Dati consegnati con successo al Livello Applicazione.', 'success');
          setSimulationState('idle');
          if (audioEnabled) playAudioCue('success');
        }
      }, stepInterval);
    }

    return () => clearInterval(interval);
  }, [simulationState, currentStep, activeAttack, defenseEnabled, isPaused, selectedProtocol, language, audioEnabled, stepInterval]);

  const threatLevel = activeAttack === 'none' ? 0 : defenseEnabled ? 40 : 100;
  const threatBg = activeAttack === 'none' ? 'bg-emerald-500' : defenseEnabled ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="bg-white border border-slate-100 rounded-xl flex flex-col gap-0 overflow-hidden shadow-sm relative">
      {/* Visual Feedback Background Overlay */}
      <AnimatePresence>
        {activeAttack !== 'none' && !defenseEnabled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      {/* Threat Bar (Visual Feedback) */}
      <div className="h-1 bg-slate-100 w-full overflow-hidden relative z-20">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${threatLevel}%` }}
          className={`h-full transition-colors duration-500 ${threatBg}`}
        />
      </div>

      {/* Simulation Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-50 bg-white relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${activeAttack === 'none' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <h2 className="text-sm font-semibold text-slate-700">
            {language === 'en' ? 'Packet simulator' : 'Simulatore di pacchetti'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Playback Speed Control (didactic: slow down to explain, speed up to review) */}
          <div className="flex items-center gap-1.5" role="group" aria-label={language === 'en' ? 'Simulation speed' : 'Velocità simulazione'}>
            <span className="hidden sm:inline text-[10px] font-medium text-slate-400">
              {language === 'en' ? 'Speed' : 'Velocità'}
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  aria-pressed={simSpeed === s}
                  aria-label={language === 'en' ? `Speed ${s}x` : `Velocità ${s}x`}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md font-mono transition-all ${
                    simSpeed === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Audio Feedback Cues Toggle */}
          <button
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (next) playAudioCue('start');
            }}
            aria-label={audioEnabled
              ? (language === 'en' ? 'Disable Audio Cues' : 'Disattiva Segnali Audio')
              : (language === 'en' ? 'Enable Audio Cues' : 'Attiva Segnali Audio')}
            title={audioEnabled
              ? (language === 'en' ? 'Disable Audio Cues' : 'Disattiva Segnali Audio')
              : (language === 'en' ? 'Enable Audio Cues' : 'Attiva Segnali Audio')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
              audioEnabled
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Simulation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-50 bg-slate-50/30 relative z-10">
        <div className="flex items-center gap-3">
          {simulationState === 'idle' ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-[11px] transition-all active:scale-95 uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {labels.start}
            </button>
          ) : (
            <button
              onClick={() => setIsPaused(!isPaused)}
              disabled={simulationState === 'interrupted'}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-800 px-4 py-2 rounded-lg font-bold text-[11px] transition-all border border-slate-200 uppercase tracking-wider"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-800" /> : <Pause className="w-3.5 h-3.5 fill-slate-800" />}
              {isPaused ? labels.resume : labels.pause}
            </button>
          )}

          <button
            onClick={handleReset}
            aria-label={labels.reset}
            title={labels.reset}
            className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-all border border-slate-200 group"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-6">
           {/* Protocol Selection */}
           <div className="flex items-center gap-2">
             <span className="text-xs font-medium text-slate-500">{language === 'en' ? 'Protocol' : 'Protocollo'}</span>
             <div className="relative">
               <select
                 value={selectedProtocol}
                 onChange={(e) => useStore.getState().setSelectedProtocol(e.target.value as any)}
                 aria-label={language === 'en' ? 'Select protocol to simulate' : 'Seleziona il protocollo da simulare'}
                 className="appearance-none bg-white border border-slate-200 text-slate-800 text-[10px] font-bold rounded-lg px-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer uppercase tracking-wider"
               >
                 <option value="HTTP">HTTP (Web)</option>
                 <option value="DNS">DNS (Resolution)</option>
                 <option value="BGP">BGP (Routing)</option>
                 <option value="SSH">SSH (Secure Access)</option>
                 <option value="FTP">FTP (File Transfer)</option>
                 <option value="SMTP">SMTP (Mail)</option>
               </select>
               <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                 <ChevronDown className="w-3 h-3 text-slate-400" />
               </div>
             </div>
           </div>

           <button
             onClick={() => setDefenseEnabled(!defenseEnabled)}
             aria-pressed={defenseEnabled}
             className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${defenseEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}
           >
             <ShieldCheck className="w-3.5 h-3.5" />
             {defenseEnabled
               ? (language === 'en' ? 'Defense on' : 'Difesa attiva')
               : (language === 'en' ? 'Defense off' : 'Difesa spenta')}
           </button>
        </div>
      </div>

      <div className="px-4 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-slate-700">
              {labels.attack}
            </span>
          </div>
          {activeAttack !== 'none' && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
              {activeAttack.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <select
              value={activeScenarioId || 'none'}
              onChange={(e) => {
                const scenarioId = e.target.value;
                if (scenarioId === 'none') {
                  setActiveAttack('none');
                  setActiveScenarioId(null);
                  addLog(language === 'en' ? 'Attack cleared.' : 'Attacco rimosso.', 'info');
                } else {
                  const scenario = ATTACK_SCENARIOS.find(s => s.id === scenarioId);
                  if (scenario) {
                    setActiveAttack(scenario.attackType);
                    setActiveScenarioId(scenario.id);
                    setSelectedLayerId(scenario.targetLayer);
                    setDefenseEnabled(scenario.defenseEnabled || false);
                    addLog(language === 'en' 
                      ? `Scenario loaded: ${scenario.name.en}` 
                      : `Scenario caricato: ${scenario.name.it}`, 'warning');
                  }
                }
              }}
              aria-label={language === 'en' ? 'Select attack scenario to inject' : 'Seleziona lo scenario di attacco da iniettare'}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all cursor-pointer appearance-none"
            >
              <option value="none">{language === 'en' ? '-- Select Attack Scenario --' : '-- Seleziona Scenario di Attacco --'}</option>
              {ATTACK_SCENARIOS.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name[language]}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Zap className="w-3 h-3" />
            </div>
          </div>

          {activeAttack !== 'none' && (
            <div className="sm:w-80 px-3 py-2 bg-red-50 border border-red-100 rounded-lg flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <Info className="w-2.5 h-2.5 text-red-400" />
                <div className="text-[7px] font-bold text-red-400 uppercase tracking-wider">Scenario Intel</div>
              </div>
                <div className="text-[9px] font-medium text-red-700 leading-tight mb-1.5">
                  {ATTACK_SCENARIOS.find(s => s.id === activeScenarioId)?.description[language]}
                </div>
                <div className="pt-1.5 border-t border-red-100/50">
                  <div className="flex items-center gap-1 mb-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                    <span className="text-[7px] font-bold text-emerald-600 uppercase tracking-wider">Recommended Defense</span>
                  </div>
                  <div className="text-[8px] font-bold text-emerald-700 leading-tight mb-2">
                    {ATTACK_SCENARIOS.find(s => s.id === activeScenarioId)?.recommendedDefense[language]}
                  </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setDefenseEnabled(true);
                      addLog(language === 'en' ? 'Countermeasure activated!' : 'Contromisura attivata!', 'success');
                    }}
                    className={`flex-1 px-2 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                      defenseEnabled 
                        ? 'bg-emerald-600 text-white cursor-default' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {defenseEnabled ? (language === 'en' ? 'Active' : 'Attiva') : (language === 'en' ? 'Apply Defense' : 'Attiva Difesa')}
                  </button>
                  <button 
                    onClick={() => {
                      setDetailTab('defenses');
                      setViewMode('theory');
                    }}
                    className="px-2 py-1.5 bg-white border border-slate-200 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest hover:border-slate-300 hover:text-slate-800 transition-all"
                  >
                    {language === 'en' ? 'Learn More' : 'Scopri di più'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current status line */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            simulationState === 'encapsulating' ? 'bg-emerald-500'
            : simulationState === 'decapsulating' ? 'bg-blue-500'
            : simulationState === 'interrupted' ? 'bg-red-500'
            : 'bg-slate-300'
          }`} />
          <span className="text-sm font-medium text-slate-600">
            {simulationState === 'encapsulating' && (language === 'en' ? 'Encapsulating…' : 'Incapsulamento…')}
            {simulationState === 'decapsulating' && (language === 'en' ? 'Decapsulating…' : 'Decapsulamento…')}
            {simulationState === 'idle' && (language === 'en' ? 'Ready' : 'Pronto')}
            {simulationState === 'interrupted' && (language === 'en' ? 'Flow compromised' : 'Flusso compromesso')}
          </span>
        </div>
        {simulationState !== 'idle' && (
          <span className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-xs font-semibold">
            {packetHeaders[packetHeaders.length - 1]?.pduName || 'Data'}
          </span>
        )}
      </div>
    </div>
  );
}