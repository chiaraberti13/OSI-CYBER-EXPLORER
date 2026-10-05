import { useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { playAudioCue } from '../utils/audio';
import {
  simulationReducer,
  type SimAction,
  type SimContext,
  type SimEffect,
  type SimMachineState,
} from '../lib/simulation';

/**
 * Apply the pure reducer's declarative effects to the Zustand store (and the
 * audio synth). Reads the store fresh via `getState()` so it never captures a
 * stale snapshot, and only emits audio when the user has enabled cues.
 */
function applyEffects(effects: SimEffect[], audioEnabled: boolean) {
  const store = useStore.getState();
  for (const effect of effects) {
    switch (effect.kind) {
      case 'clearHeaders':
        store.clearPacketHeaders();
        break;
      case 'clearAttack':
        store.setActiveAttack('none');
        break;
      case 'log':
        store.addLog(effect.message, effect.severity);
        break;
      case 'addHeader':
        store.addPacketHeader(effect.header);
        break;
      case 'selectLayer':
        store.setSelectedLayerId(effect.layerId);
        break;
      case 'audio':
        if (audioEnabled) playAudioCue(effect.cue);
        break;
    }
  }
}

export interface PacketSimulationController {
  start: () => void;
  reset: () => void;
  togglePause: () => void;
}

/**
 * Drives the OSI Packet Simulator: owns the single stepping timer and routes
 * every transition through the pure `simulationReducer`. The store remains the
 * single source of truth — each dispatch reads the live machine state and
 * context from it, runs the reducer and writes back the next state plus
 * effects. The timer cadence follows `simSpeed` and is torn down on unmount,
 * pause and phase change.
 */
export function usePacketSimulation(): PacketSimulationController {
  const simulationState = useStore((s) => s.simulationState);
  const isPaused = useStore((s) => s.isPaused);
  const simSpeed = useStore((s) => s.simSpeed);

  const dispatch = useCallback((action: SimAction) => {
    const store = useStore.getState();
    const machine: SimMachineState = {
      phase: store.simulationState,
      currentStep: store.currentStep,
      paused: store.isPaused,
    };
    const ctx: SimContext = {
      protocol: store.selectedProtocol,
      attack: store.activeAttack,
      defenseEnabled: store.defenseEnabled,
      language: store.language,
    };
    const { state, effects } = simulationReducer(machine, action, ctx);
    applyEffects(effects, store.audioEnabled);
    if (state.phase !== machine.phase) store.setSimulationState(state.phase);
    if (state.currentStep !== machine.currentStep) store.setCurrentStep(state.currentStep);
    if (state.paused !== machine.paused) store.setIsPaused(state.paused);
  }, []);

  const start = useCallback(() => dispatch({ type: 'START' }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);
  const togglePause = useCallback(
    () => dispatch({ type: useStore.getState().isPaused ? 'RESUME' : 'PAUSE' }),
    [dispatch],
  );

  // One interval for the whole run: it fires a TICK every `stepInterval` ms and
  // is recreated only when the phase, pause flag or speed changes. Each tick
  // reads live state via getState(), so step/protocol/attack changes are picked
  // up without re-subscribing the effect.
  const stepInterval = Math.round(1000 / simSpeed);
  useEffect(() => {
    if (isPaused) return;
    if (simulationState !== 'encapsulating' && simulationState !== 'decapsulating') return;
    const interval = setInterval(() => dispatch({ type: 'TICK' }), stepInterval);
    return () => clearInterval(interval);
  }, [simulationState, isPaused, stepInterval, dispatch]);

  return { start, reset, togglePause };
}
