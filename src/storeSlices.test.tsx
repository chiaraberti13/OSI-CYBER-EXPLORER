// @vitest-environment jsdom

import { Profiler } from 'react';
import { act, render } from '@testing-library/react';
import { useShallow } from 'zustand/react/shallow';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import type { OsiLayerId } from './types';
import { useStore } from './store';

function resetStore(): void {
  useStore.setState({
    language: 'it',
    audioEnabled: true,
    simSpeed: 1,
    hasSeenGuide: false,
    selectedLayerId: 7,
    viewMode: 'theory',
    detailTab: 'overview',
    activeView: 'osi',
    simulationState: 'idle',
    activeAttack: 'none',
    activeScenarioId: null,
    defenseEnabled: false,
    logs: [],
    packetHeaders: [],
    currentStep: 7,
    selectedProtocol: 'HTTP',
    hasSimulated: false,
    isPaused: false,
    isGuideOpen: false,
  });
}

describe('store slices and granular subscriptions', () => {
  afterEach(() => {
    resetStore();
  });

  it('keeps simulation speed and OSI layer state inside closed TypeScript domains', () => {
    expectTypeOf(useStore.getState().simSpeed).toEqualTypeOf<0.5 | 1 | 2>();
    expectTypeOf(useStore.getState().selectedLayerId).toEqualTypeOf<OsiLayerId>();
    expectTypeOf(useStore.getState().currentStep).toEqualTypeOf<OsiLayerId>();
  });

  it('React Profiler sees no commit for an unrelated preference update', () => {
    let renders = 0;
    let profilerCommits = 0;

    function Probe() {
      useStore(useShallow((state) => ({
        simulationState: state.simulationState,
        currentStep: state.currentStep,
      })));
      renders += 1;
      return null;
    }

    render(
      <Profiler id="simulation-selector" onRender={() => { profilerCommits += 1; }}>
        <Probe />
      </Profiler>,
    );
    expect(renders).toBe(1);
    expect(profilerCommits).toBe(1);

    act(() => {
      useStore.getState().setLanguage('en');
    });
    expect(renders).toBe(1);
    expect(profilerCommits).toBe(1);

    act(() => {
      useStore.getState().setCurrentStep(6);
    });
    expect(renders).toBe(2);
    expect(profilerCommits).toBe(2);
  });

  it('keeps modal UI updates isolated from navigation selectors', () => {
    let renders = 0;

    function Probe() {
      useStore(useShallow((state) => ({
        activeView: state.activeView,
        selectedLayerId: state.selectedLayerId,
      })));
      renders += 1;
      return null;
    }

    render(<Probe />);
    expect(renders).toBe(1);

    act(() => {
      useStore.getState().setIsGuideOpen(true);
    });
    expect(renders).toBe(1);

    act(() => {
      useStore.getState().setActiveView('security');
    });
    expect(renders).toBe(2);
  });
});
