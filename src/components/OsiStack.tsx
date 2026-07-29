import { OSI_LAYERS } from '../constants';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { ShieldCheck, Skull } from 'lucide-react';

export default function OsiStack() {
  const {
    selectedLayerId,
    setSelectedLayerId,
    language,
    currentStep,
    simulationState,
    activeAttack,
    defenseEnabled,
    activeScenarioId
  } = useStore();

  return (
    <div className="flex flex-col w-full bg-white rounded-lg border border-slate-200/70 overflow-hidden divide-y divide-slate-100">
      {OSI_LAYERS.map((layer) => {
        const isSelected = selectedLayerId === layer.id;
        const isActive = (simulationState === 'encapsulating' || simulationState === 'decapsulating') && currentStep === layer.id;
        const isTargeted = simulationState === 'interrupted' && (
          (activeAttack === 'mitm' && (layer.id === 2 || layer.id === 3)) ||
          (activeAttack === 'dos' && (layer.id === 7 || layer.id === 4)) ||
          (activeAttack === 'spoofing' && layer.id === 3) ||
          (activeAttack === 'replay' && layer.id === 5) ||
          (activeAttack === 'eavesdropping' && layer.id === 1) ||
          (activeAttack === 'injection' && layer.id === 7) ||
          (activeScenarioId === 'l1-jamming' && layer.id === 1)
        );

        const isMitigated = activeAttack !== 'none' && defenseEnabled && (
          (activeAttack === 'mitm' && (layer.id === 2 || layer.id === 3)) ||
          (activeAttack === 'dos' && (layer.id === 7 || layer.id === 4)) ||
          (activeAttack === 'spoofing' && layer.id === 3) ||
          (activeAttack === 'replay' && layer.id === 5) ||
          (activeAttack === 'eavesdropping' && layer.id === 1) ||
          (activeAttack === 'injection' && layer.id === 7) ||
          (activeScenarioId === 'l1-jamming' && layer.id === 1)
        );

        const layerInfo = layer.translations[language];

        return (
          <motion.button
            key={layer.id}
            whileTap={{ scale: 0.995 }}
            onClick={() => setSelectedLayerId(layer.id)}
            className={`
              relative flex items-center justify-between gap-4 px-4 py-3 text-left transition-colors
              ${isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'}
              ${isTargeted ? 'bg-red-50/60' : ''}
              ${isMitigated ? 'bg-emerald-50/50' : ''}
            `}
          >
            {/* Left state accent */}
            <span
              className={`absolute left-0 top-0 bottom-0 w-0.5 transition-colors ${
                isTargeted ? 'bg-red-400' : isActive ? 'bg-emerald-400' : isSelected ? 'bg-slate-900' : 'bg-transparent'
              }`}
            />

            <div className="flex items-center gap-4 min-w-0">
              <span className={`text-[11px] font-mono w-4 text-center shrink-0 ${
                isSelected ? 'text-slate-900' : isTargeted ? 'text-red-500' : 'text-slate-300'
              }`}>
                {layer.id}
              </span>

              <div className="min-w-0">
                <h3 className={`text-[13px] font-medium leading-tight truncate ${
                  isTargeted ? 'text-red-600' : isActive ? 'text-emerald-600' : isSelected ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {layerInfo.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-slate-400">{layer.pdu}</span>
                  <span className="text-[10px] font-mono text-slate-300">·</span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {layerInfo.protocols?.[0] || 'N/A'}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-mono text-emerald-600">transforming</span>
                  )}
                  {isTargeted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-500">
                      <Skull className="w-2.5 h-2.5" /> compromised
                    </span>
                  )}
                  {isMitigated && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600">
                      <ShieldCheck className="w-2.5 h-2.5" /> hardened
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={`w-2 h-2 rounded-full shrink-0 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`}
              style={{ backgroundColor: isTargeted ? '#ef4444' : layer.color }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
