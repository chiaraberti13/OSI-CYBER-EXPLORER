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
    en: { clear: 'Clear', terminal: 'System Logs' },
    it: { clear: 'Pulisci', terminal: 'Log di Sistema' }
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
          className="text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest font-bold"
        >
          {labels.clear}
        </button>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-1.5 custom-scrollbar bg-slate-50/30"
      >
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
