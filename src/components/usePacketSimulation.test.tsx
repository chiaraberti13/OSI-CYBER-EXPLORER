// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useStore } from '../store';
import { usePacketSimulation } from './usePacketSimulation';

// The Web Audio synth is irrelevant to the state machine and unavailable in jsdom.
vi.mock('../utils/audio', () => ({ playAudioCue: vi.fn() }));

function resetStore() {
  useStore.setState({
    simulationState: 'idle',
    currentStep: 7,
    isPaused: false,
    selectedProtocol: 'HTTP',
    activeAttack: 'none',
    defenseEnabled: false,
    language: 'en',
    audioEnabled: false,
    simSpeed: 1,
    logs: [],
    packetHeaders: [],
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  resetStore();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  resetStore();
});

const state = () => useStore.getState();

describe('usePacketSimulation', () => {
  it('start() begins encapsulation at the top layer', () => {
    const { result } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    expect(state().simulationState).toBe('encapsulating');
    expect(state().currentStep).toBe(7);
    expect(state().packetHeaders).toHaveLength(0);
  });

  it('adds one packet header per timer tick at the configured speed', () => {
    const { result } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000); // one step at 1x (1000ms/tick)
    });
    expect(state().packetHeaders).toHaveLength(1);
    expect(state().packetHeaders[0]?.layer).toBe(7);
    expect(state().currentStep).toBe(6);
  });

  it('runs a full simulation from idle back to idle', () => {
    const { result } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(14_000); // 14 ticks completes TX + RX at 1x
    });
    expect(state().simulationState).toBe('idle');
    expect(state().packetHeaders).toHaveLength(6);
  });

  it('pause halts stepping and resume continues it', () => {
    const { result } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(state().packetHeaders).toHaveLength(1);

    act(() => result.current.togglePause());
    expect(state().isPaused).toBe(true);
    act(() => {
      vi.advanceTimersByTime(5000); // no stepping while paused
    });
    expect(state().packetHeaders).toHaveLength(1);
    expect(state().currentStep).toBe(6);

    act(() => result.current.togglePause());
    expect(state().isPaused).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(state().packetHeaders).toHaveLength(2);
  });

  it('reset() returns to idle and clears headers and attack mid-run', () => {
    useStore.setState({ activeAttack: 'mitm' });
    const { result } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(state().packetHeaders.length).toBeGreaterThan(0);

    act(() => result.current.reset());
    expect(state().simulationState).toBe('idle');
    expect(state().currentStep).toBe(7);
    expect(state().packetHeaders).toHaveLength(0);
    expect(state().activeAttack).toBe('none');
  });

  it('honors the playback speed multiplier', () => {
    useStore.setState({ simSpeed: 0.5 }); // 2000ms per step
    const { result } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000); // not enough for one step yet
    });
    expect(state().packetHeaders).toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(1000); // reaches 2000ms → one step
    });
    expect(state().packetHeaders).toHaveLength(1);
  });

  it('reflects a protocol change on the next tick', () => {
    const { result } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000); // L7 header with the HTTP profile
    });
    expect(state().packetHeaders[0]?.details).toBe('GET /index.html HTTP/1.1');

    act(() => {
      useStore.setState({ selectedProtocol: 'SSH' });
      vi.advanceTimersByTime(1000); // L6 now read from the SSH profile
    });
    const last = state().packetHeaders[state().packetHeaders.length - 1];
    expect(last?.details).toBe('L6 Overhead');
  });

  it('clears its timer on unmount so no further steps run', () => {
    const { result, unmount } = renderHook(() => usePacketSimulation());
    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(state().packetHeaders).toHaveLength(1);

    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(state().packetHeaders).toHaveLength(1); // frozen after unmount
  });
});
