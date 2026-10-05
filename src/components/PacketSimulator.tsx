import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'motion/react';
import { ATTACK_SCENARIOS } from '../content/attackScenarios';
import { Zap, Skull, ShieldCheck, Play, RotateCcw, Info, Pause, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { playAudioCue } from '../utils/audio';
import type { SimProtocol } from '../lib/osi';
import { SIMULATION_SPEEDS } from '../lib/preferences';
import { usePacketSimulation } from './usePacketSimulation';
import HeaderSpecificationSummary from './HeaderSpecificationSummary';

export default function PacketSimulator() {
  const {
  language,
  simulationState,
  addLog,
  packetHeaders,
  activeAttack,
  setActiveAttack,
  activeScenarioId,
  setActiveScenarioId,
  defenseEnabled,
  setDefenseEnabled,
  isPaused,
  selectedProtocol,
  setViewMode,
  setSelectedLayerId,
  setDetailTab,
  audioEnabled,
  setAudioEnabled,
  simSpeed,
  setSimSpeed,
} = useStore(useShallow((state) => ({
  language: state.language,
  simulationState: state.simulationState,
  addLog: state.addLog,
  packetHeaders: state.packetHeaders,
  activeAttack: state.activeAttack,
  setActiveAttack: state.setActiveAttack,
  activeScenarioId: state.activeScenarioId,
  setActiveScenarioId: state.setActiveScenarioId,
  defenseEnabled: state.defenseEnabled,
  setDefenseEnabled: state.setDefenseEnabled,
  isPaused: state.isPaused,
  selectedProtocol: state.selectedProtocol,
  setViewMode: state.setViewMode,
  setSelectedLayerId: state.setSelectedLayerId,
  setDetailTab: state.setDetailTab,
  audioEnabled: state.audioEnabled,
  setAudioEnabled: state.setAudioEnabled,
  simSpeed: state.simSpeed,
  setSimSpeed: state.setSimSpeed,
})));

  // Timer, OSI transitions and per-protocol header generation live in the pure
  // engine (src/lib/simulation.ts); this component only renders and dispatches.
  const { start, reset, togglePause } = usePacketSimulation();

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

  const threatLevel = activeAttack === 'none' ? 0 : defenseEnabled ? 40 : 100;
  const threatBg = activeAttack === 'none' ? 'bg-emerald-500' : defenseEnabled ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="bg-white border border-slate-200/70 rounded-lg flex flex-col gap-0 overflow-hidden relative">
      {/* Visual Feedback Background Overlay */}
      <AnimatePresence>
        {activeAttack !== 'none' && !defenseEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      {/* Threat Bar (Visual Feedback) */}
      <div className="h-0.5 bg-slate-100 w-full overflow-hidden relative z-20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${threatLevel}%` }}
          className={`h-full transition-colors duration-500 ${threatBg}`}
        />
      </div>

      {/* Simulation Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-100 bg-white relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-1.5 rounded-full ${activeAttack === 'none' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <h2 className="text-sm font-medium text-slate-700">
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
              {SIMULATION_SPEEDS.map((s) => (
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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-100 bg-slate-50/30 relative z-10">
        <div className="flex items-center gap-2.5">
          {simulationState === 'idle' ? (
            <button
              onClick={start}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-md font-medium text-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {labels.start}
            </button>
          ) : (
            <button
              onClick={togglePause}
              disabled={simulationState === 'interrupted'}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-700 px-3.5 py-2 rounded-md font-medium text-xs transition-all border border-slate-200"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-700" /> : <Pause className="w-3.5 h-3.5 fill-slate-700" />}
              {isPaused ? labels.resume : labels.pause}
            </button>
          )}

          <button
            onClick={reset}
            aria-label={labels.reset}
            title={labels.reset}
            className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-md transition-all border border-slate-200 group"
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
                 onChange={(e) => useStore.getState().setSelectedProtocol(e.target.value as SimProtocol)}
                 aria-label={language === 'en' ? 'Select protocol to simulate' : 'Seleziona il protocollo da simulare'}
                 className="appearance-none bg-white border border-slate-200 text-slate-700 text-[11px] font-mono rounded-md px-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
               >
                 <option value="HTTP">HTTP (Web)</option>
                 <option value="HTTPS">HTTPS (TLS Web)</option>
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
             className={`flex items-center gap-1.5 text-xs font-medium rounded-md px-3 py-1.5 transition-colors border ${defenseEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`}
           >
             <ShieldCheck className="w-3.5 h-3.5" />
             {defenseEnabled
               ? (language === 'en' ? 'Defense on' : 'Difesa attiva')
               : (language === 'en' ? 'Defense off' : 'Difesa spenta')}
           </button>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/30 px-4 py-3 relative z-10">
        <HeaderSpecificationSummary language={language} testId="packet-simulator-header-specifications" />
      </div>

      <div className="px-4 py-4 bg-slate-50/30 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skull className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {labels.attack}
            </span>
          </div>
          {activeAttack !== 'none' && (
            <span className="text-[11px] font-mono text-red-600 border border-red-200 px-2 py-0.5 rounded">
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
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[11px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all cursor-pointer appearance-none"
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
            <div className="sm:w-80 px-3 py-2.5 bg-white border border-slate-200/70 rounded-md flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Info className="w-3 h-3 text-slate-400" />
                <div className="eyebrow">Scenario intel</div>
              </div>
                <div className="text-[11px] text-slate-600 leading-snug mb-2">
                  {ATTACK_SCENARIOS.find(s => s.id === activeScenarioId)?.description[language]}
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span className="eyebrow text-emerald-600/80">{language === 'en' ? 'Recommended defense' : 'Difesa consigliata'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug mb-2.5">
                    {ATTACK_SCENARIOS.find(s => s.id === activeScenarioId)?.recommendedDefense[language]}
                  </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDefenseEnabled(true);
                      addLog(language === 'en' ? 'Countermeasure activated!' : 'Contromisura attivata!', 'success');
                    }}
                    className={`flex-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      defenseEnabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {defenseEnabled ? (language === 'en' ? 'Active' : 'Attiva') : (language === 'en' ? 'Apply Defense' : 'Attiva Difesa')}
                  </button>
                  <button
                    onClick={() => {
                      setDetailTab('defenses');
                      setViewMode('theory');
                    }}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-md text-[11px] font-medium hover:border-slate-300 hover:text-slate-700 transition-all"
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
