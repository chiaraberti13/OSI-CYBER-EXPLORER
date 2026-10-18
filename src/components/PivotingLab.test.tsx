// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import PivotingLab from './PivotingLab';

afterEach(() => cleanup());

describe('PivotingLab', () => {
  it('compares a scoped host route, denies SSH, then tears down to baseline', () => {
    useStore.setState({ language: 'it' });
    render(<PivotingLab />);
    expect(screen.getByText('eJPT · PIVOTING · SCOPE · DURATA · TEARDOWN')).toBeTruthy();

    const setup = screen.getByRole('button', { name: 'Attiva la simulazione' }) as HTMLButtonElement;
    expect(setup.disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Confermo l’autorizzazione/i }));
    expect(setup.disabled).toBe(false);
    fireEvent.click(setup);

    expect(screen.getByText(/203\.0\.113\.25\/32 via 198\.51\.100\.20/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Simula il flusso selezionato' }));
    expect(screen.getByText(/Il tester instrada l’host \/32 al pivot/)).toBeTruthy();
    expect(screen.getByText('FIREWALL_ALLOW: TCP/443 in authorized fixture scope')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Esegui teardown' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Servizio richiesto' }), {
      target: { value: '22' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Attiva la simulazione' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simula il flusso selezionato' }));
    expect(screen.getByText(/La destinazione TCP\/22 è fuori scope/)).toBeTruthy();
    expect(screen.getByText('FIREWALL_DENY: TCP/22 outside authorized scope')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Esegui teardown' }));
    expect(screen.getByText(/Teardown completato: configurazione rimossa/)).toBeTruthy();
    expect(screen.getAllByText('Nessuna route specifica per l’host obiettivo')).toHaveLength(2);
  });

  it('maps only TCP/443 in port-forward mode and expires the lease', () => {
    useStore.setState({ language: 'en' });
    render(<PivotingLab />);
    expect(screen.getByText('eJPT · PIVOTING · SCOPE · LEASE · TEARDOWN')).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm authorization/i }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Mechanism to simulate' }), {
      target: { value: 'port-forward' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enable simulation' }));
    expect(screen.getByText(/198\.51\.100\.20:8443 → 203\.0\.113\.25:443\/TCP/)).toBeTruthy();
    expect(screen.getAllByText('No specific route to the target host')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Simulate selected flow' }));
    expect(screen.getByText(/The tester contacts the pivot’s fixture listener/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Advance by 5 minutes' }));
    expect(screen.getByText(/Lease expired: route or mapping removed automatically/)).toBeTruthy();
    expect(screen.getAllByText('No active mapping')).toHaveLength(2);
  });

  it('localizes topology and prevents traffic when the scope is not confirmed', () => {
    useStore.setState({ language: 'en' });
    render(<PivotingLab />);
    expect(screen.getByRole('heading', { level: 1, name: 'Pivoting: route or port forwarding?' })).toBeTruthy();
    expect(screen.getByRole('img', { name: /Test system 198\.51\.100\.10/ })).toBeTruthy();
    expect(screen.getByText(/No commands run, hosts or firewalls are configured/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Simulate selected flow' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
