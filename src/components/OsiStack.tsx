import { OSI_LAYERS } from '../content/osiLayers';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
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
  } = useStore(
    useShallow((state) => ({
      selectedLayerId: state.selectedLayerId,
      setSelectedLayerId: state.setSelectedLayerId,
      language: state.language,
      currentStep: state.currentStep,
      simulationState: state.simulationState,
      activeAttack: state.activeAttack,
      defenseEnabled: state.defenseEnabled,
      activeScenarioId: state.activeScenarioId
    }))
  );

  // UX-05: the layer states were shown only through colour and English-only words.
  // These labels localise them and are rendered as text (plus icons) so the state
  // is understandable without colour perception; selection is exposed with
  // aria-pressed below.
  const stateLabels =
    language === 'it'
      ? { transforming: 'in trasformazione', compromised: 'compromesso', hardened: 'protetto' }
      : { transforming: 'transforming', compromised: 'compromised', hardened: 'hardened' };

  const header =
    language === 'it'
      ? { title: 'Pila OSI', encap: 'Incapsulamento', decap: 'Decapsulamento' }
      : { title: 'OSI Stack', encap: 'Encapsulation', decap: 'Decapsulation' };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-stroke bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-stroke px-4 py-3.5">
        <h2 className="text-[15px] font-semibold text-slate-900">{header.title}</h2>
        <span className="flex gap-3 font-mono text-[11px] text-slate-400">
          <span className={simulationState === 'encapsulating' ? 'text-cyan' : ''}>↓ {header.encap}</span>
          <span className={simulationState === 'decapsulating' ? 'text-cyan' : ''}>↑ {header.decap}</span>
        </span>
      </div>
      <div className="flex flex-col divide-y divide-slate-100">
        {OSI_LAYERS.map((layer) => {
          const isSelected = selectedLayerId === layer.id;
          const isActive =
            (simulationState === 'encapsulating' || simulationState === 'decapsulating') && currentStep === layer.id;
          const isTargeted =
            simulationState === 'interrupted' &&
            ((activeAttack === 'mitm' && (layer.id === 2 || layer.id === 3)) ||
              (activeAttack === 'dos' && (layer.id === 7 || layer.id === 4)) ||
              (activeAttack === 'spoofing' && layer.id === 3) ||
              (activeAttack === 'replay' && layer.id === 5) ||
              (activeAttack === 'eavesdropping' && layer.id === 1) ||
              (activeAttack === 'injection' && layer.id === 7) ||
              (activeScenarioId === 'l1-jamming' && layer.id === 1));

          const isMitigated =
            activeAttack !== 'none' &&
            defenseEnabled &&
            ((activeAttack === 'mitm' && (layer.id === 2 || layer.id === 3)) ||
              (activeAttack === 'dos' && (layer.id === 7 || layer.id === 4)) ||
              (activeAttack === 'spoofing' && layer.id === 3) ||
              (activeAttack === 'replay' && layer.id === 5) ||
              (activeAttack === 'eavesdropping' && layer.id === 1) ||
              (activeAttack === 'injection' && layer.id === 7) ||
              (activeScenarioId === 'l1-jamming' && layer.id === 1));

          const layerInfo = layer.translations[language];

          return (
            <motion.button
              key={layer.id}
              type="button"
              aria-pressed={isSelected}
              whileTap={{ scale: 0.995 }}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`
                relative flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors
                ${isSelected ? 'bg-surface-subtle' : 'bg-surface hover:bg-surface-subtle'}
                ${isTargeted ? 'bg-danger-soft' : ''}
                ${isMitigated ? 'bg-success-soft' : ''}
              `}
            >
              {/* Left state accent (decorative: state is also conveyed by text below) */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors"
                style={{
                  backgroundColor: isTargeted
                    ? 'var(--color-danger)'
                    : isSelected
                      ? `var(--color-layer-${layer.id})`
                      : 'transparent'
                }}
              />

              <div className="flex min-w-0 items-center gap-3.5">
                {/* Per-layer identity badge: pale tint fill with the AA ink-on-light number. */}
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-base font-semibold"
                  style={{
                    backgroundColor: `var(--color-layer-${layer.id}-tint)`,
                    color: `var(--color-layer-${layer.id}-ink)`
                  }}
                >
                  {layer.id}
                </span>

                <div className="min-w-0">
                  <h3
                    className={`truncate text-[15px] font-medium leading-tight ${
                      isTargeted
                        ? 'text-danger'
                        : isActive
                          ? 'text-success'
                          : isSelected
                            ? 'text-slate-900'
                            : 'text-slate-600'
                    }`}
                  >
                    {layerInfo.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-[12.5px] text-slate-400">{layer.pdu}</span>
                    <span className="font-mono text-[12.5px] text-slate-300">·</span>
                    <span className="truncate font-mono text-[12.5px] text-slate-400">
                      {layerInfo.protocols?.[0] || 'N/A'}
                    </span>
                    {isActive && <span className="font-mono text-[11px] text-cyan">{stateLabels.transforming}</span>}
                    {isTargeted && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-danger">
                        <Skull aria-hidden="true" className="h-2.5 w-2.5" /> {stateLabels.compromised}
                      </span>
                    )}
                    {isMitigated && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-success">
                        <ShieldCheck aria-hidden="true" className="h-2.5 w-2.5" /> {stateLabels.hardened}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40'}`}
                style={{ backgroundColor: isTargeted ? 'var(--color-danger)' : layer.color }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
