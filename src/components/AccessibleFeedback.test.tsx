// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import AutomationLab from './AutomationLab';
import PacketSimulator from './PacketSimulator';
import WildcardBuilder from './WildcardBuilder';

beforeEach(() => {
  useStore.setState({
    language: 'it',
    simulationState: 'idle',
    currentStep: 7,
    isPaused: false,
    simSpeed: 1,
    activeAttack: 'none',
    activeScenarioId: null,
    packetHeaders: []
  });
});

afterEach(cleanup);

describe('accessible critical feedback', () => {
  it('announces simulation commands, speed changes, and outcomes with visible text', async () => {
    const user = userEvent.setup();
    render(<PacketSimulator />);

    const status = screen.getByRole('status');
    expect(status.textContent).toContain('Simulazione pronta.');

    await user.click(screen.getByRole('button', { name: 'Velocità 2x' }));
    expect(status.textContent).toContain('Velocità della simulazione impostata su 2x.');

    act(() => useStore.setState({ language: 'en' }));
    expect(status.textContent).toContain('Simulation speed set to 2x.');
    act(() => useStore.setState({ language: 'it' }));

    await user.click(screen.getByRole('button', { name: 'Avvia Simulazione' }));
    expect(status.textContent).toContain('Simulazione avviata.');

    await user.click(screen.getByRole('button', { name: 'Pausa' }));
    expect(status.textContent).toContain('Simulazione in pausa.');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(status.textContent).toContain('Simulazione reimpostata.');

    act(() => useStore.setState({ simulationState: 'interrupted' }));
    expect(status.textContent).toContain('Simulazione interrotta: il flusso è stato compromesso.');

    act(() => useStore.setState({ simulationState: 'decapsulating' }));
    act(() => useStore.setState({ simulationState: 'idle' }));
    expect(status.textContent).toContain('Simulazione completata correttamente.');
  });

  it('associates wildcard validation text with every invalid field', () => {
    render(<WildcardBuilder />);
    const [first, last] = screen.getAllByRole('textbox');

    fireEvent.change(first, { target: { value: '999.1.1.1' } });

    const alert = screen.getByRole('alert');
    expect(first.getAttribute('aria-invalid')).toBe('true');
    expect(last.getAttribute('aria-invalid')).toBe('true');
    expect(first.getAttribute('aria-describedby')).toBe(alert.id);
    expect(last.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('associates REST and JSON validation messages with their invalid controls', () => {
    render(<AutomationLab />);

    const resource = screen.getByRole('textbox', { name: /risorsa|resource/i });
    fireEvent.change(resource, { target: { value: 'not-a-path' } });
    const restAlert = screen.getAllByRole('alert')[0];
    expect(resource.getAttribute('aria-invalid')).toBe('true');
    expect(resource.getAttribute('aria-describedby')).toBe(restAlert.id);

    const json = screen.getByRole('textbox', { name: 'JSON inspector' });
    fireEvent.change(json, { target: { value: '{invalid' } });
    const jsonAlert = screen.getAllByRole('alert').at(-1);
    expect(json.getAttribute('aria-invalid')).toBe('true');
    expect(json.getAttribute('aria-describedby')).toBe(jsonAlert?.id);
  });
});
