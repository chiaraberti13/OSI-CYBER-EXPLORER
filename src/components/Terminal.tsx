import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'motion/react';

export default function Terminal() {
  const { logs, clearLogs, language } = useStore(
    useShallow((state) => ({
      logs: state.logs,
      clearLogs: state.clearLogs,
      language: state.language
    }))
  );
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
      emptyBody:
        'Choose a protocol and press "Start Simulation" to watch a packet travel down and up the 7 OSI layers.',
      emptyHint: 'Tip: inject an attack and toggle the Shield to see defenses in action.'
    },
    it: {
      clear: 'Pulisci',
      terminal: 'Log di Sistema',
      emptyTitle: 'Console pronta',
      emptyBody:
        'Scegli un protocollo e premi "Avvia Simulazione" per vedere un pacchetto scendere e risalire i 7 livelli OSI.',
      emptyHint: 'Suggerimento: inietta un attacco e attiva lo Shield per vedere le difese in azione.'
    }
  }[language];

  // Approved v2 "Console": a dark terminal surface (always dark in both themes).
  // Log colours use the design's dark-tuned, AA-legible hues so severity reads
  // clearly on the near-black background.
  const logColor: Record<string, string> = {
    info: 'var(--color-code-ink)',
    warning: '#f1bb5a',
    danger: '#ff8a8a',
    success: '#5fd39b'
  };

  return (
    <div className="bg-code-bg border border-stroke rounded-2xl overflow-hidden flex flex-col h-full font-mono text-[13px] shadow-card">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="select-none font-mono text-xs text-code-dim">$_</span>
          <span className="font-sans text-sm font-semibold text-[#eef1f6]">{labels.terminal}</span>
        </div>
        <button
          onClick={clearLogs}
          disabled={logs.length === 0}
          aria-label={labels.clear}
          className="font-sans text-xs font-medium text-code-ink transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {labels.clear}
        </button>
      </div>

      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar leading-relaxed"
      >
        {logs.length === 0 && (
          <div className="flex h-full select-none flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5fd39b]" />
            </div>
            <p className="mb-1.5 font-sans text-sm font-semibold not-italic text-[#eef1f6]">{labels.emptyTitle}</p>
            <p className="mb-3 max-w-[240px] font-sans text-[13px] normal-case leading-relaxed tracking-normal text-code-ink">
              {labels.emptyBody}
            </p>
            <p className="max-w-[240px] font-sans text-[13px] normal-case leading-relaxed tracking-normal text-[#f1bb5a]">
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
              <span className="shrink-0 text-code-dim">[{log.timestamp}]</span>
              <span
                className={`break-words ${log.type === 'danger' || log.type === 'success' ? 'font-semibold' : ''}`}
                style={{ color: logColor[log.type] ?? 'var(--color-code-ink)' }}
              >
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
