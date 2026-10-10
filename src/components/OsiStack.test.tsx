// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OsiStack from './OsiStack';
import { useStore } from '../store';

/**
 * UX-05: layer states must be understandable without colour perception. Selection
 * is exposed with aria-pressed, and the transforming/compromised/hardened states
 * are rendered as localised text (not English-only, not colour-only).
 */

afterEach(() => {
  cleanup();
  useStore.setState({
    language: 'it',
    selectedLayerId: 7,
    simulationState: 'idle',
    activeAttack: 'none',
    defenseEnabled: false,
    activeScenarioId: null,
    currentStep: 7,
  });
});

describe('UX-05 semantic OSI layer states', () => {
  it('exposes selection with aria-pressed, on exactly one layer at a time', async () => {
    const user = userEvent.setup();
    useStore.setState({ selectedLayerId: 7 });
    const { container } = render(<OsiStack />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);

    // Selecting another layer moves the pressed state and updates the store.
    const other = buttons.find(b => b.getAttribute('aria-pressed') === 'false')!;
    await user.click(other);
    expect(other.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
    expect(useStore.getState().selectedLayerId).not.toBe(7);
  });

  it('labels the compromised state as text and localises it', () => {
    // MITM targets L2/L3 while the simulation is interrupted.
    useStore.setState({ simulationState: 'interrupted', activeAttack: 'mitm', language: 'it' });
    const { rerender } = render(<OsiStack />);
    expect(screen.getAllByText('compromesso').length).toBeGreaterThan(0);

    useStore.setState({ language: 'en' });
    rerender(<OsiStack />);
    expect(screen.getAllByText('compromised').length).toBeGreaterThan(0);
  });

  it('labels the hardened state as text and localises it', () => {
    useStore.setState({ activeAttack: 'mitm', defenseEnabled: true, simulationState: 'idle', language: 'it' });
    const { rerender } = render(<OsiStack />);
    expect(screen.getAllByText('protetto').length).toBeGreaterThan(0);

    useStore.setState({ language: 'en' });
    rerender(<OsiStack />);
    expect(screen.getAllByText('hardened').length).toBeGreaterThan(0);
  });

  it('labels the transforming state as text and localises it', () => {
    useStore.setState({ simulationState: 'encapsulating', currentStep: 3, language: 'it' });
    const { rerender } = render(<OsiStack />);
    expect(screen.getByText('in trasformazione')).toBeTruthy();

    useStore.setState({ language: 'en' });
    rerender(<OsiStack />);
    expect(screen.getByText('transforming')).toBeTruthy();
  });
});
