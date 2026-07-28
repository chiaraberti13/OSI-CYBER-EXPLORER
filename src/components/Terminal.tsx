import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

export default function Terminal() {
  const { logs, clearLogs, language } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const labels = {
    en: {
      clear: 'Clear',
      terminal: 'System Logs',
      emptyTitle: 'Console ready',
      emptyBody: 'Choose a protocol and press "Start Simulation" to watch a packet travel down and up the 7 OSI layers.',
      emptyHint: 'Tip: inject an attack and toggle the Shield to see defenses in action.'
    },
    it: {
      clear: 'Pulisci',
      terminal: 'Log di Sistema',
      emptyTitle: 'Console pronta',
      emptyBody: 'Scegli un protocollo e premi "Avvia Simulazione" per vedere un pacchetto scendere e risalire i 7 livelli OSI.',
      emptyHint: 'Suggerimento: inietta un attacco e attiva lo Shield per vedere le difese in azione.'
    }
  }[language];

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden flex flex-col h-full font-mono text-[10px] shadow-sm">
      <div className="bg-slate-50 px-3 py-2.5 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 opacity-30">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <span className="text-slate-900 uppercase tracking-[0.2em] font-bold">
            {labels.terminal}
          </span>
        </div>
        <button
          onClick={clearLogs}
          disabled={logs.length === 0}
          aria-label={labels.clear}
          className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors uppercase tracking-widest font-bold"
        >
          {labels.clear}
        </button>
      </div>

      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex-1 overflow-y-auto p-5 space-y-1.5 custom-scrollbar bg-slate-50/30"
      >
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 select-none">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 not-italic">
              {labels.emptyTitle}
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-[220px] normal-case tracking-normal font-sans mb-3">
              {labels.emptyBody}
            </p>
            <p className="text-[9px] text-amber-600/80 leading-relaxed max-w-[220px] normal-case tracking-normal font-sans">
              {labels.emptyHint}
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={`${log.timestamp}-${i}`}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 leading-relaxed"
            >
              <span className="text-slate-400 shrink-0 font-bold opacity-80">[{log.timestamp}]</span>
              <span className={`
                ${log.type === 'info' ? 'text-slate-700' : ''}
                ${log.type === 'warning' ? 'text-amber-600' : ''}
                ${log.type === 'danger' ? 'text-red-600 font-bold' : ''}
                ${log.type === 'success' ? 'text-emerald-600 font-bold' : ''}
                break-words
              `}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
