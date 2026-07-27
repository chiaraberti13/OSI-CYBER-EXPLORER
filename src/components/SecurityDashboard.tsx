import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Activity, Cpu, Network, Radio, AlertTriangle, CheckCircle, 
  Play, Settings, Terminal as TermIcon, ShieldX, HelpCircle, ArrowRight, Zap
} from 'lucide-react';
import { useStore } from '../store';

interface ThreatScenario {
  id: string;
  name: { en: string; it: string };
  description: { en: string; it: string };
  attackType: string;
  correctDefense: string[];
  alertDefense: string[]; // Defenses that detect/alert but don't prevent
  attackLog: { en: string; it: string }[];
  successLog: { en: string; it: string }[];
  failLog: { en: string; it: string }[];
  alertLog: { en: string; it: string }[];
}

const THREAT_SCENARIOS: ThreatScenario[] = [
  {
    id: 'port_scan',
    name: { en: 'Stealth Port Scanning Sweep', it: 'Scansione Stealth delle Porte' },
    description: { 
      en: 'A hostile actor sends raw TCP SYN scans to probe active listening services on the server.',
      it: 'Un utente ostile invia pacchetti TCP SYN a raffica per mappare le porte aperte e i servizi attivi sul server.'
    },
    attackType: 'scan',
    correctDefense: ['NIPS', 'EDR'],
    alertDefense: ['NIDS', 'NDR'],
    attackLog: [
      { en: 'Attacker generates rapid TCP SYN packets targeting dynamic ports 1-1024...', it: 'L\'attaccante genera pacchetti TCP SYN rapidi diretti alle porte 1-1024...' },
      { en: 'Sniffing network interfaces for half-open handshakes...', it: 'Intercettazione delle risposte di rete per identificare handshake half-open...' }
    ],
    successLog: [
      { en: 'CRITICAL: Port scan completed! Target ports mapping harvested by attacker.', it: 'CRITICO: Scansione completata! Meno di 2 secondi per scoprire tutte le porte attive.' },
      { en: 'Server exposed services (SSH port 22, HTTP port 80) mapped for future exploits.', it: 'Porte esposte (SSH 22, HTTP 80) catalogate per il prossimo exploit di attacco.' }
    ],
    failLog: [
      { en: 'BLOCK: NIPS recognized high-frequency SYN scan from source IP.', it: 'BLOCCO: Il NIPS ha rilevato scansioni SYN ad alta frequenza dall\'IP mittente.' },
      { en: 'Connection dropped. Attacker receives standard connection timeout. Services hidden.', it: 'Pacchetti scartati in-line. L\'attaccante riceve timeout di rete. Porte protette.' }
    ],
    alertLog: [
      { en: 'ALERT: NIDS flagged signature "TCP SYN scanning sweeps" from outer subnet.', it: 'AVVISO: Il NIDS ha generato l\'allarme "TCP SYN scanning sweeps" dal router.' },
      { en: 'Scan still completes. Attacker successfully mapped services, but security log triggered!', it: 'La scansione è avvenuta ma è stata loggata. L\'attaccante ha le mappe, ma l\'allarme è sul SIEM!' }
    ]
  },
  {
    id: 'rce_exploit',
    name: { en: 'Remote Code Execution Payload', it: 'Exploit Remote Code Execution (RCE)' },
    description: { 
      en: 'An attacker transmits malicious software command exploit nested inside an HTTP post request.',
      it: 'Un utente malevolo sfrutta una falla web inserendo comandi shell diretti all\'interno di una richiesta HTTP POST.'
    },
    attackType: 'exploit',
    correctDefense: ['NIPS', 'EDR'],
    alertDefense: ['NIDS', 'HIDS'],
    attackLog: [
      { en: 'Attacker pushes malformed HTTP POST payload carrying base64 commands...', it: 'L\'attaccante invia un payload HTTP POST contenente comandi del sistema operativo cifrati...' },
      { en: 'Attempting to inject administrative "rm -rf /" shell execution...', it: 'Tentativo di iniettare l\'esecuzione shell della routine amministrativa...' }
    ],
    successLog: [
      { en: 'EXPLOIT SUCCESSFUL: Web application processes injected shell commands.', it: 'EXPLOIT COMPLETATO: L\'applicazione web ha eseguito cecamente i comandi shell.' },
      { en: 'Rogue reverse-shell connection initiated back to external controller host.', it: 'Sessione interattiva (reverse-shell) aperta verso il server esterno dell\'hacker.' }
    ],
    failLog: [
      { en: 'PREVENTED: NIPS inline engine detected malicious signature match.', it: 'PREVENUTO: Il motore in-linea del NIPS ha intercettato la firma "Exploit Injection RCE".' },
      { en: 'Connection terminated immediately. Attacker received TCP RST. Web server unaffected.', it: 'Connessione recisa all\'istante. Invio di un TCP RST. Web server intatto.' }
    ],
    alertLog: [
      { en: 'ATTACK LOGGED: NIDS identified exploit pattern in copied packet TAP.', it: 'ATTACCO REGISTRATO: Il NIDS ha identificato l\'exploit tramite TAP passivo.' },
      { en: 'WARNING: Exploit packet reached target web app before alert generated. Target might be compromised.', it: 'ATTENZIONE: Il pacchetto è arrivato al server prima del log. Il sistema potrebbe essere violato.' }
    ]
  },
  {
    id: 'ransomware',
    name: { en: 'Fileless Memory Ransomware Act', it: 'Esecuzione Ransomware in Memoria' },
    description: { 
      en: 'Malicious process executes in physical RAM using PowerShell to mass encrypt disk documents.',
      it: 'Un malware fileless sfrutta una sessione PowerShell in RAM per cifrare tutti i documenti sul disco rigido.'
    },
    attackType: 'endpoint',
    correctDefense: ['HIPS', 'EDR'],
    alertDefense: ['HIDS'],
    attackLog: [
      { en: 'PowerShell session spawns in background via compromised email attachment...', it: 'Viene avviata una sessione PowerShell dormiente tramite download occulto...' },
      { en: 'System calls (syscalls) issued to encrypt documents folder directory using AES-256...', it: 'Chiamate di sistema (syscall) invocate per alterare e cifrare i file sul disco...' }
    ],
    successLog: [
      { en: 'DATA RUINED: Document folders successfully encrypted. Ransom note dropped.', it: 'DATI PERDUTI: Tutti i file sono ora cifrati con estensione .locked. Richiesta riscatto creata.' },
      { en: 'System locked down. No network activity occurred, bypass perimetral firewalls.', it: 'Macchina bloccata. Nessun traffico di rete generato, ignorati tutti i firewall perimetrali.' }
    ],
    failLog: [
      { en: 'INTERCEPTED: HIPS/EDR agent blocked unauthorized PowerShell syscalls.', it: 'INTERCETTATO: L\'agente HIPS/EDR ha bloccato la syscall di cifratura non consentita.' },
      { en: 'Host process terminated instantly. Encryption loop killed. Files safe.', it: 'Processo terminato istantaneamente. Loop di cifratura reciso. File salvi.' }
    ],
    alertLog: [
      { en: 'ALERT: HIDS identified altered system file checksums in the background.', it: 'RILIEVO: L\'HIDS ha individuato checksum alterati di file di sistema.' },
      { en: 'Warning: Ransomware encrypted half the files before registry database checks ran on agent.', it: 'Attenzione: Il ransomware ha cifrato metà dei dati prima dell\'intervallo di analisi dell\'agente.' }
    ]
  },
  {
    id: 'evil_twin',
    name: { en: 'Evil Twin Wireless Broadcast', it: 'Access Point Evil Twin Pirata' },
    description: { 
      en: 'A Wi-Fi access point spoofing the corporate SSID to harvest credentials from employee devices.',
      it: 'Un AP Wi-Fi pirata trasmette lo stesso SSID aziendale per agganciare i PC dei dipendenti e carpirne le password.'
    },
    attackType: 'wireless',
    correctDefense: ['WIPS'],
    alertDefense: ['WIDS'],
    attackLog: [
      { en: 'Attacker activates high-gain antenna radiating clone SSID broadcast beacons...', it: 'L\'attaccante attiva un antenna ad alto guadagno clonando i frame Beacon dell\'SSID aziendale...' },
      { en: 'Employee notebook attempts automatic association with the stronger rogue signal...', it: 'Un PC utente tenta l\'associazione Wi-Fi automatica al segnale pirata più forte...' }
    ],
    successLog: [
      { en: 'MITM ENGAGED: Corporate laptop connected to hacker AP. DNS traffic redirected.', it: 'DIROTTATO: Computer agganciato all\'AP pirata. MitM attivo. Password esposte.' },
      { en: 'Attacker intercepts active browsing sessions and session cookies in clear text.', it: 'L\'hacker intercetta le credenziali di accesso dei servizi aziendali in chiaro.' }
    ],
    failLog: [
      { en: 'NEUTRALIZED: WIPS radio actively shoots spoofed Deauthentication frames.', it: 'NEUTRALIZZATO: Il WIPS di radiofrequenza spara frame di deautenticazione falsificati.' },
      { en: 'Attacker rogue connection shattered on airwaves. Corporate client reverts to authentic AP.', it: 'Canale radio disabilitato. Il client si disconnette per deauth ed aggancia l\'AP originale sicuro.' }
    ],
    alertLog: [
      { en: 'AIR ALERT: WIDS flagged duplicate MAC emitting SSID beacons on channel 6.', it: 'AVVISO RADIO: Il WIDS ha segnalato finti frame Beacon sul canale 6.' },
      { en: 'Log dispatched to administrator, but wireless connection actively persists until fixed.', it: 'Log inviato al tecnico di rete, ma l\'allineamento radio persiste finché non si va sul posto a staccarlo.' }
    ]
  }
];

export default function SecurityDashboard() {
  const { language } = useStore();
  const [selectedScenario, setSelectedScenario] = useState<ThreatScenario>(THREAT_SCENARIOS[0]);
  const [selectedDefense, setSelectedDefense] = useState<string>('NONE');
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simulationOutcome, setSimulationOutcome] = useState<'success' | 'blocked' | 'alerted' | 'none'>('none');

  const runSimulation = () => {
    setSimStatus('running');
    setSimLogs([]);
    setSimulationOutcome('none');

    // Simulate logs in step sequence
    let latency = 600;
    
    // Step 1: Attack initialization
    setTimeout(() => {
      setSimLogs(prev => [...prev, `[INIT] ${selectedScenario.attackLog[0][language]}`]);
    }, latency);

    // Step 2: Running attack
    latency += 800;
    setTimeout(() => {
      setSimLogs(prev => [...prev, `[STAGE_1] ${selectedScenario.attackLog[1][language]}`]);
    }, latency);

    // Step ... evaluation
    latency += 1000;
    setTimeout(() => {
      const isCorrect = selectedScenario.correctDefense.includes(selectedDefense);
      const isAlert = selectedScenario.alertDefense.includes(selectedDefense);

      if (isCorrect) {
        setSimulationOutcome('blocked');
        setSimLogs(prev => [
          ...prev, 
          `[DEFENSE_ACTIVE] Found active blocking agent: ${selectedDefense}`,
          `[BLOCK_ACTION] ${selectedScenario.failLog[0][language]}`,
          `[SECURE] ${selectedScenario.failLog[1][language]}`
        ]);
      } else if (isAlert) {
        setSimulationOutcome('alerted');
        setSimLogs(prev => [
          ...prev, 
          `[DEFENSE_WARNING] Found monitoring agent: ${selectedDefense}`,
          `[ALERT_GENERATED] ${selectedScenario.alertLog[0][language]}`,
          `[LOG_RESULT] ${selectedScenario.alertLog[1][language]}`
        ]);
      } else {
        setSimulationOutcome('success');
        setSimLogs(prev => [
          ...prev, 
          `[DEFENSE_FAILED] Defense engaged: ${selectedDefense === 'NONE' ? 'Nessuna / None' : selectedDefense}`,
          `[EXPLOIT_WARNING] No blocking policy active for this threat vector.`,
          `[CRITICAL_FAILURE] ${selectedScenario.successLog[0][language]}`,
          `[DAMAGED] ${selectedScenario.successLog[1][language]}`
        ]);
      }
      setSimStatus('completed');
    }, latency);
  };

  const securitySystems = [
    {
      id: 'NIDS',
      title: 'NIDS',
      fullName: 'Network Intrusion Detection System',
      nature: 'Passive / Out-of-band',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      description: {
        en: 'Listens passively to a copy of network line traffic (mirror ports) to create alerts. Cannot drop or block frames.',
        it: 'Ascolta passivamente copie del traffico raddoppiato (port mirroring) per segnalare minacce. Non si interpone lungo il cavo.'
      }
    },
    {
      id: 'NIPS',
      title: 'NIPS',
      fullName: 'Network Intrusion Prevention System',
      nature: 'Active / In-line',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      description: {
        en: 'Placed in-line directly inside the network path. Actively intercepts frames to block, reconstruct, or filter packets.',
        it: 'Posizionato in-linea nel tragitto reale dei dati. Ispeziona e scarta pacchetti dannosi forzando reset TCP.'
      }
    },
    {
      id: 'HIDS',
      title: 'HIDS',
      fullName: 'Host Intrusion Detection System',
      nature: 'Passive Endpoint Agent',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      description: {
        en: 'Runs as a background daemon inside servers. Monitors system integrity, login logs and file modifications.',
        it: 'Gira come demone residente nei singoli server. Rileva accessi sospetti e alterazione nei file vitali (checksum).'
      }
    },
    {
      id: 'HIPS',
      title: 'HIPS',
      fullName: 'Host Intrusion Prevention System',
      nature: 'Active Process Interceptor',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      description: {
        en: 'Hooks process threads to block malicious registry modifications, command line triggers and rogue syscalls.',
        it: 'Intercetta le chiamate di sistema (syscall). Impedisce ransomware o iniezioni malware terminandoli al volo.'
      }
    },
    {
      id: 'WIDS',
      title: 'WIDS',
      fullName: 'Wireless Intrusion Detection',
      nature: 'Passive RF Scanner',
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
      description: {
        en: 'Scans public radio frequency bands for fake APs (Evil Twin), WiFi jams, or MAC address spoofs.',
        it: 'Scansiona l\'etere radio via antenna rilevando Access Point impiantati furtivamente o deauth flood.'
      }
    },
    {
      id: 'WIPS',
      title: 'WIPS',
      fullName: 'Wireless Intrusion Prevention',
      nature: 'Active RF Injector',
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
      description: {
        en: 'Actively dispatches fake deauthentication packets over the air to force target disconnects from rogue routers.',
        it: 'Invia pacchetti radio di deautenticazione fasulli nell\'aria per disconnettere PC dai finti AP clonati.'
      }
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Intro block */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Shield className="w-80 h-80" />
        </div>
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/30">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            {language === 'en' ? 'Cybersecurity Architecture' : 'Architettura Cyber-Security'}
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-none text-white">
            {language === 'en' ? 'IDS & IPS Detection Center' : 'Centro di Ispezione IDS / IPS'}
          </h2>
          <p className="text-slate-300 text-[13px] leading-relaxed">
            {language === 'en' 
              ? 'Intrusion Detection (IDS) and Intrusion Prevention (IPS) form the pillars of packet-level auditing. They filter malware, block remote command injections, and protect systems on physical networks, end stations (Hosts) or radio waves (Wireless).'
              : 'I sistemi IDS (Rilevamento) e IPS (Prevenzione) costituiscono i pilastri dell\'ispezione del traffico. Monitorano malware, prevengono iniezioni di codice e difendono le risorse sulla rete fisica, sui singoli server (Host) o nell\'etere (Wireless).'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800/60">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                IDS (Intrusion Detection)
              </div>
              <p className="text-slate-400 text-xs">
                {language === 'en'
                  ? 'Passive analyzer. Receives a raw mirrored copy of the traffic. Can flag, log, and alert, but cannot interrupt connections directly.'
                  : 'Analisi passiva. Riceve log e avvisi fuori banda (TAP). Ha l\'immensa virtù di non rallentare la rete, ma non blocca l\'attacco.'}
              </p>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800/60">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                IPS (Intrusion Prevention)
              </div>
              <p className="text-slate-400 text-xs">
                {language === 'en'
                  ? 'Active guard. Sits inline directly in the middle of routing pathways, inspects real frames and drops packets before reach.'
                  : 'Filtro attivo. Collocato nell\'instradamento in-linea. Se decifra minacce scarta istantaneamente il pacchetto salvando il server.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing complete description of NIDS, NIPS, HIDS, HIPS... */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {language === 'en' ? 'Complete Fleet Comparison Matrix' : 'Matrice di Confronto della Flotta di Sicurezza'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'en'
              ? 'Different intrusion tools defend different OSI scopes. Evaluate their placement and focus.'
              : 'Dispositivi diversi agiscono su strati differenti del modello OSI. Analizza la loro focalizzazione.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securitySystems.map(sys => (
            <div key={sys.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${sys.color}`}>
                    {sys.title}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-2">{sys.fullName}</h4>
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{sys.nature}</p>
                </div>
                {sys.id.startsWith('N') ? (
                  <Network className="w-5 h-5 text-slate-400" />
                ) : sys.id.startsWith('W') ? (
                  <Radio className="w-5 h-5 text-slate-400" />
                ) : (
                  <Cpu className="w-5 h-5 text-slate-400" />
                )}
              </div>
              
              <p className="text-slate-500 text-xs leading-relaxed border-t border-slate-50 pt-3">
                {sys.description[language]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Sandbox Simulator */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sandbox configuration panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              {language === 'en' ? 'IPS & IDS Lab simulator' : 'Laboratorio di Esecuzione Attacchi e Difese'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'en'
                ? 'Test different cyber attack scenarios against NIDS, NIPS, HIDS, HIPS, and analyze the matching consequences.'
                : 'Seleziona una minaccia e posiziona la sonda di difesa adeguata per valutare se l\'attacco viene eseguito, registrato soltanto, o sventato.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Scenarios selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                {language === 'en' ? '1. Select Cyber Attack threat' : '1. Scegli il Vettore di Attacco'}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {THREAT_SCENARIOS.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenario(sc);
                      setSimStatus('idle');
                      setSimLogs([]);
                      setSimulationOutcome('none');
                    }}
                    className={`text-left p-3 rounded-xl border text-xs font-bold transition-all ${
                      selectedScenario.id === sc.id
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{sc.name[language]}</span>
                      {sc.attackType === 'scan' && <Network className="w-3.5 h-3.5 opacity-80" />}
                      {sc.attackType === 'exploit' && <ShieldX className="w-3.5 h-3.5 opacity-80" />}
                      {sc.attackType === 'endpoint' && <Cpu className="w-3.5 h-3.5 opacity-80" />}
                      {sc.attackType === 'wireless' && <Radio className="w-3.5 h-3.5 opacity-80" />}
                    </div>
                    <p className={`text-[10px] font-normal mt-1 leading-snug ${selectedScenario.id === sc.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {sc.description[language]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Defense tool selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                {language === 'en' ? '2. Choose Security Defense System' : '2. Installa lo Strumento di Difesa'}
              </label>
              <select
                value={selectedDefense}
                onChange={(e) => {
                  setSelectedDefense(e.target.value);
                  setSimStatus('idle');
                  setSimLogs([]);
                  setSimulationOutcome('none');
                }}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="NONE">{language === 'en' ? 'No defense (Nessuna Protezione)' : 'Nessuna Difesa (Sistemi scoperti)'}</option>
                <option value="NIDS">NIDS (Network Intrusion Detection System) - Passive</option>
                <option value="NIPS">NIPS (Network Intrusion Prevention System) - In-line inline</option>
                <option value="HIDS">HIDS (Host Intrusion Detection System)</option>
                <option value="HIPS">HIPS (Host Intrusion Prevention System)</option>
                <option value="WIDS">WIDS (Wireless Intrusion Detection)</option>
                <option value="WIPS">WIPS (Wireless Intrusion Prevention)</option>
                <option value="EDR">EDR (Endpoint Detection & Response)</option>
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={runSimulation}
              disabled={simStatus === 'running'}
              className="w-full py-3 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              {simStatus === 'running' 
                ? (language === 'en' ? 'Simulating packet auditing...' : 'Ispezione pacchetto in corso...') 
                : (language === 'en' ? 'Launch attack & trigger audit' : 'Lancia attacco e analizza')}
            </button>
          </div>
        </div>

        {/* Sandbox visualization console */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 space-y-6 flex flex-col h-full min-h-[460px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TermIcon className="w-4 h-4 text-slate-400" />
              {language === 'en' ? 'Visual Audit Stage' : 'Visualizzatore dei Pacchetti di Attacco'}
            </h4>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${simStatus === 'running' ? 'bg-amber-400 animate-ping' : simStatus === 'completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                {simStatus === 'running' ? 'Active' : simStatus === 'completed' ? 'Finished' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Graphical SVG Area with Packet migration animation */}
          <div className="relative bg-slate-900 rounded-2xl h-44 flex items-center justify-around px-6 overflow-hidden border border-slate-950">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />

            {/* Left Node: Attacker */}
            <div className="flex flex-col items-center gap-2 relative z-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center p-2 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider">Attacker</span>
            </div>

            {/* Flow line and interactive packet bubble */}
            <div className="flex-1 max-w-[12rem] h-0.5 bg-slate-700 relative flex items-center justify-center">
              <AnimatePresence>
                {simStatus === 'running' && (
                  <motion.div
                    initial={{ x: -100 }}
                    animate={{ 
                      x: [ -80, 0, 80 ],
                      scale: [ 1, 1.3, 1 ]
                    }}
                    transition={{
                      duration: 2.2,
                      ease: 'easeInOut'
                    }}
                    className={`absolute w-4.5 h-4.5 rounded-full flex items-center justify-center ${
                      selectedScenario.attackType === 'scan' ? 'bg-amber-500 shadow-[0_0_12px_#f59e0b]' :
                      selectedScenario.attackType === 'exploit' ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' :
                      selectedScenario.attackType === 'endpoint' ? 'bg-purple-500 shadow-[0_0_12px_#a855f7]' :
                      'bg-cyan-500 shadow-[0_0_12px_#06b6d4]'
                    }`}
                  >
                    <span className="text-[8px] font-bold text-white uppercase">{selectedScenario.attackType.substring(0, 3)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Probe Barrier icon */}
              {selectedDefense !== 'NONE' && (
                <div className={`absolute w-8 h-8 rounded-full border bg-slate-900 flex items-center justify-center -translate-y-0.5 shadow-md ${
                  simulationOutcome === 'blocked' ? 'border-emerald-500 text-emerald-400' :
                  simulationOutcome === 'alerted' ? 'border-amber-400 text-amber-300' : 'border-indigo-400 text-indigo-300'
                }`}>
                  <Shield className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Right Node: Victim Host */}
            <div className="flex flex-col items-center gap-2 relative z-10 text-center">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center p-2 transition-all ${
                simulationOutcome === 'success' ? 'bg-rose-950/40 border-rose-600/60 text-rose-400 animate-bounce' :
                simulationOutcome === 'blocked' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' :
                'bg-slate-800/40 border-slate-700/60 text-slate-300'
              }`}>
                {selectedScenario.attackType === 'wireless' ? (
                  <Radio className="w-6 h-6" />
                ) : (
                  <Cpu className="w-6 h-6" />
                )}
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                simulationOutcome === 'success' ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {selectedScenario.attackType === 'wireless' ? 'Client Wi-Fi' : 'Core Server'}
              </span>
            </div>
          </div>

          {/* Live Command Shell Outputs with color mapping */}
          <div className="flex-1 bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-900 overflow-y-auto min-h-[160px] h-40 space-y-2">
            <p className="text-slate-500 border-b border-slate-900 pb-1 flex justify-between items-center">
              <span>SECURITY MONITOR SHELL</span>
              <span>UTC: {new Date().toISOString().split('T')[1].substring(0, 8)}</span>
            </p>
            {simLogs.length === 0 ? (
              <p className="text-slate-600 italic">
                {language === 'en' 
                  ? '> Ready. Select components and click "Launch attack".' 
                  : '> Pronto. Scegli le opzioni e avvia la verifica.'}
              </p>
            ) : (
              simLogs.map((log, index) => {
                let colorClass = 'text-slate-300';
                if (log.includes('CRITICAL') || log.includes('EXPLOIT SUCCESSFUL')) {
                  colorClass = 'text-rose-400 font-bold';
                } else if (log.includes('BLOCK') || log.includes('PREVENTED') || log.includes('INTERCEPTED') || log.includes('SECURE')) {
                  colorClass = 'text-emerald-400 font-bold';
                } else if (log.includes('ALERT') || log.includes('WARNING') || log.includes('ATTACK LOGGED')) {
                  colorClass = 'text-amber-400 font-bold';
                } else if (log.includes('INIT') || log.includes('STAGE')) {
                  colorClass = 'text-indigo-300';
                }
                return (
                  <p key={index} className={`${colorClass} leading-snug`}>
                    &gt; {log}
                  </p>
                );
              })
            )}

            {simulationOutcome === 'success' && (
              <div className="bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-lg text-rose-300 font-sans text-xs mt-4">
                <strong>{language === 'en' ? 'Vulnerable Pattern Explored!' : 'Falla di Sicurezza Rilevata!'}</strong>
                <p className="text-[11px] opacity-90 mt-1">
                  {language === 'en'
                    ? `Because your defense of "${selectedDefense}" was not inline (IPS/HIPS) or lacked application-level hooks for this specific threat, the malicious payload completely bypassed audits.`
                    : `Poiché il sistema "${selectedDefense === 'NONE' ? 'Nessuna/None' : selectedDefense}" non si interpone attivamente o non esegue controlli locali su questo tipo di attacco, l'attaccante ha superato incolume la rete.`}
                </p>
              </div>
            )}

            {simulationOutcome === 'blocked' && (
              <div className="bg-emerald-950/20 border border-emerald-900/50 p-2.5 rounded-lg text-emerald-300 font-sans text-xs mt-4">
                <strong>{language === 'en' ? 'Intrusion Successfully Blocked!' : 'Intrusione Bloccata con Successo!'}</strong>
                <p className="text-[11px] opacity-90 mt-1">
                  {language === 'en'
                    ? `Great match! The chosen defense is an active filter inline or high-fidelity agent that intercepted the vulnerability in real-time, safely shutting down the attack.`
                    : `Ottima scelta! Il sistema selezionato opera con filtraggio attivo in-linea o agente locale con facoltà di blocco in tempo reale. Il payload è stato scartato prima di recare danno.`}
                </p>
              </div>
            )}

            {simulationOutcome === 'alerted' && (
              <div className="bg-amber-950/20 border border-amber-900/50 p-2.5 rounded-lg text-amber-300 font-sans text-xs mt-4">
                <strong>{language === 'en' ? 'Alert generated, but attack still succeeded!' : 'Registrato Alert ma Violazione Riuscita!'}</strong>
                <p className="text-[11px] opacity-90 mt-1">
                  {language === 'en'
                    ? `This represents a classic passive IDS behavior. It generated high-fidelity telemetry logs for SIEM analysts, but lacked active inline drop features, meaning the hacker compromised the core host.`
                    : `Questo illustra l'azione passiva dell'IDS. Rileva la scansione o l'exploit generando un log completo che allerta la sala operativa, ma senza il potere di tagliare il filo del ladro.`}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
