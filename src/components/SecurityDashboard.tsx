import { Shield, Cpu, Network, Radio, Zap, Swords, ArrowRight } from 'lucide-react';
import { useStore } from '../store';

export default function SecurityDashboard() {
  const { language, setActiveView } = useStore();

  const securitySystems = [
    {
      id: 'NIDS',
      title: 'NIDS',
      fullName: 'Network Intrusion Detection System',
      nature: 'Passive / Out-of-band',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      description: {
        en: 'Listens passively to a copy of network traffic (mirror ports) to raise alerts. Cannot drop or block frames.',
        it: 'Ascolta passivamente una copia del traffico di rete (port mirroring) per generare allarmi. Non può scartare o bloccare i frame.'
      }
    },
    {
      id: 'NIPS',
      title: 'NIPS',
      fullName: 'Network Intrusion Prevention System',
      nature: 'Active / In-line',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      description: {
        en: 'Placed in-line on the network path. Actively inspects frames and drops malicious packets before they arrive.',
        it: 'Posizionato in linea sul percorso di rete. Ispeziona i frame e scarta i pacchetti dannosi prima che arrivino.'
      }
    },
    {
      id: 'HIDS',
      title: 'HIDS',
      fullName: 'Host Intrusion Detection System',
      nature: 'Passive Endpoint Agent',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      description: {
        en: 'Runs as a daemon inside servers. Monitors system integrity, login logs and file modifications (checksums).',
        it: 'Gira come demone nei server. Controlla l\'integrità del sistema, i log di accesso e le modifiche ai file (checksum).'
      }
    },
    {
      id: 'HIPS',
      title: 'HIPS',
      fullName: 'Host Intrusion Prevention System',
      nature: 'Active Process Interceptor',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      description: {
        en: 'Hooks process activity to block malicious registry changes, commands and rogue syscalls in real time.',
        it: 'Intercetta l\'attività dei processi per bloccare in tempo reale modifiche al registro, comandi e syscall malevoli.'
      }
    },
    {
      id: 'WIDS',
      title: 'WIDS',
      fullName: 'Wireless Intrusion Detection',
      nature: 'Passive RF Scanner',
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
      description: {
        en: 'Scans the radio spectrum for fake APs (Evil Twin), Wi-Fi jamming or MAC spoofing, and alerts.',
        it: 'Scansiona lo spettro radio per rilevare AP falsi (Evil Twin), jamming Wi-Fi o spoofing di MAC, e allerta.'
      }
    },
    {
      id: 'WIPS',
      title: 'WIPS',
      fullName: 'Wireless Intrusion Prevention',
      nature: 'Active RF Injector',
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
      description: {
        en: 'Actively sends deauthentication frames over the air to disconnect clients from rogue access points.',
        it: 'Invia attivamente frame di deautenticazione via radio per disconnettere i client dagli access point pirata.'
      }
    },
    {
      id: 'EDR',
      title: 'EDR',
      fullName: 'Endpoint Detection & Response',
      nature: 'Active Endpoint Agent',
      color: 'bg-teal-500/10 text-teal-600 border-teal-200',
      description: {
        en: 'Modern agent on each device: records process behavior, spots anomalies and can isolate or kill a threat — it detects and responds.',
        it: 'Agente moderno su ogni dispositivo: registra il comportamento dei processi, rileva anomalie e può isolare o terminare la minaccia — rileva e risponde.'
      }
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Intro block */}
      <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Shield className="w-80 h-80" />
        </div>
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            {language === 'en' ? 'Cybersecurity Architecture' : 'Architettura Cyber-Security'}
          </div>
          <h2 className="text-3xl font-semibold uppercase tracking-tight leading-none text-white">
            {language === 'en' ? 'IDS & IPS Detection Center' : 'Centro di Ispezione IDS / IPS'}
          </h2>
          <p className="text-slate-300 text-[13px] leading-relaxed">
            {language === 'en'
              ? 'The defenders\' side: which appliances watch the network, where they sit, and the key difference between detecting an attack (IDS) and actively blocking it (IPS). To run attacks and defenses hands-on, use the Attack & Defense Lab.'
              : 'Il lato dei difensori: quali apparati sorvegliano la rete, dove si posizionano e la differenza chiave tra rilevare un attacco (IDS) e bloccarlo attivamente (IPS). Per provare attacchi e difese in pratica, usa il Laboratorio Attacco & Difesa.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800">
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                IDS (Intrusion Detection)
              </div>
              <p className="text-slate-400 text-xs">
                {language === 'en'
                  ? 'Passive, out-of-band. Reads a copy of the traffic (TAP/mirror): it can flag, log and alert, but cannot stop the attack. It adds no latency.'
                  : 'Passivo, fuori linea. Legge una copia del traffico (TAP/mirror): può segnalare, registrare e allertare, ma non blocca l\'attacco. Non rallenta la rete.'}
              </p>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                IPS (Intrusion Prevention)
              </div>
              <p className="text-slate-400 text-xs">
                {language === 'en'
                  ? 'Active, in-line. Sits on the real data path: it inspects packets and drops the malicious ones before they reach the target.'
                  : 'Attivo, in linea. Sta sul percorso reale dei dati: ispeziona i pacchetti e scarta quelli dannosi prima che arrivino a destinazione.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet comparison matrix: NIDS, NIPS, HIDS, HIPS, WIDS, WIPS, EDR */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {language === 'en' ? 'Defense Appliance Comparison' : 'Confronto degli Apparati di Difesa'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'en'
              ? 'Detection (D) only alerts; Prevention (P) actively blocks. Network, Host and Wireless tools each guard a different scope.'
              : 'Il rilevamento (D) solo allerta; la prevenzione (P) blocca attivamente. Gli strumenti di rete, host e wireless proteggono ambiti diversi.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securitySystems.map(sys => (
            <div key={sys.id} className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-4 hover:shadow-md transition-all">
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

      {/* Call to action: the hands-on attack/defense lab lives in one place */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
            <Swords className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
              {language === 'en' ? 'Hands-on' : 'Pratica'}
            </span>
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            {language === 'en' ? 'Put these defenses to the test' : 'Metti alla prova queste difese'}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {language === 'en'
              ? 'Every attack and its countermeasure — step by step — now lives in one place: the Attack & Defense Lab. Pick an attack, watch it unfold, and switch the defense on to see it neutralized.'
              : 'Ogni attacco e la sua contromisura — passo dopo passo — sono ora in un unico posto: il Laboratorio Attacco & Difesa. Scegli un attacco, guardalo svolgersi e attiva la difesa per vederlo neutralizzato.'}
          </p>
        </div>
        <button
          onClick={() => setActiveView('attacklab')}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm uppercase tracking-wide hover:bg-slate-100 transition-all active:scale-95"
        >
          {language === 'en' ? 'Open the Lab' : 'Apri il Laboratorio'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
