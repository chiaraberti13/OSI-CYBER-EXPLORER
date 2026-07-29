import { useStore } from '../store';
import { OSI_LAYERS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ArrowDown } from 'lucide-react';

/**
 * Packet Inspector — the core didactic artefact for encapsulation.
 * As the simulation runs, each OSI layer prepends its header/PDU; this panel
 * shows those headers stacking up (L7 → L1) with their realistic fields, so a
 * learner literally sees a packet being wrapped layer by layer.
 */
export default function PacketInspector() {
  const { packetHeaders, language, currentStep, simulationState } = useStore();

  const t = {
    it: {
      title: 'Ispettore Pacchetto',
      empty: 'Avvia la simulazione per vedere gli header aggiunti a ogni livello.',
      wraps: 'incapsulamenti'
    },
    en: {
      title: 'Packet Inspector',
      empty: 'Start the simulation to watch the headers added at each layer.',
      wraps: 'wraps'
    }
  }[language];

  return (
    <div className="bg-white border border-slate-200/70 rounded-lg overflow-hidden flex flex-col">
      <div className="px-3 py-2 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{t.title}</span>
        </div>
        {packetHeaders.length > 0 && (
          <span className="text-[10px] font-mono text-slate-400">
            {packetHeaders.length} {t.wraps}
          </span>
        )}
      </div>

      <div className="p-3 max-h-[320px] overflow-y-auto custom-scrollbar" aria-live="polite">
        {packetHeaders.length === 0 ? (
          <p className="text-xs text-slate-400 leading-relaxed text-center py-8 px-2">
            {t.empty}
          </p>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {packetHeaders.map((h, i) => {
                const layer = OSI_LAYERS.find(l => l.id === h.layer);
                const color = layer?.color || '#64748b';
                const isCurrent =
                  (simulationState === 'encapsulating' || simulationState === 'decapsulating') &&
                  currentStep === h.layer;
                return (
                  <div key={`${h.layer}-${i}`}>
                    {i > 0 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="w-3 h-3 text-slate-300" />
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-md border px-3 py-2 ${
                        isCurrent ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200/70 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                          L{h.layer}
                        </span>
                        <span className="text-xs font-medium text-slate-800">{h.protocol}</span>
                        <span className="text-[9px] font-mono text-slate-400 border border-slate-200/70 px-1.5 py-0.5 rounded">
                          {h.pduName}
                        </span>
                      </div>
                      {h.fields && h.fields.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {h.fields.map((f, fi) => (
                            <span
                              key={fi}
                              className="text-[10px] font-mono bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5"
                            >
                              <span className="text-slate-400">{f.key}:</span>{' '}
                              <span className="text-slate-700">{f.value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
