// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import StpConvergenceLab from './StpConvergenceLab';

afterEach(cleanup);

describe('StpConvergenceLab model disclosure', () => {
  it('always identifies the active protocol, cost standard and complete tie-break vector', () => {
    useStore.setState({ language: 'it' });
    render(<StpConvergenceLab />);

    expect(screen.getByText('Modello applicato a questo risultato')).toBeTruthy();
    expect(screen.getByText(/Cisco Rapid PVST\+ · convergenza IEEE 802\.1w/)).toBeTruthy();
    expect(screen.getByText(/short · IEEE 802\.1D-1998 · 16 bit · 1–65\.535/)).toBeTruthy();
    expect(screen.getByText(/root path cost → sender Bridge ID → sender Port ID → porta locale/)).toBeTruthy();

    fireEvent.change(screen.getByRole('combobox', { name: 'Metodo di costo' }), { target: { value: 'long' } });
    expect(screen.getByText(/long · IEEE 802\.1t \/ IEEE 802\.1D-2004 · 32 bit · 1–200\.000\.000/)).toBeTruthy();
  });

  it('shows every valid priority step and distinguishes Rapid PVST+ from PVST+ and MST', () => {
    useStore.setState({ language: 'en' });
    render(<StpConvergenceLab />);

    const priority = screen.getByRole('combobox', { name: 'STP priority DSW1' });
    expect(within(priority).getAllByRole('option')).toHaveLength(16);
    expect(within(priority).getByRole('option', { name: '12288' })).toBeTruthy();
    expect(screen.getByText('PVST+, Rapid PVST+, and MST are not synonyms')).toBeTruthy();
    expect(screen.getByText('Current model')).toBeTruthy();
    expect(screen.getAllByText('Not simulated')).toHaveLength(2);
    expect(screen.getByText(/Region\/VLAN mapping is not simulated here/)).toBeTruthy();
  });
});
