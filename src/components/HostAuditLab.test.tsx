// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import HostAuditLab from './HostAuditLab';

afterEach(() => cleanup());

describe('HostAuditLab', () => {
  it('gates collection and simulates minimized outbound evidence in Italian', async () => {
    useStore.setState({ language: 'it' });
    render(<HostAuditLab />);
    expect(screen.getByText('eJPT · AUDIT DI HOST E RETE · GESTIONE DELLE EVIDENZE')).toBeTruthy();
    const collect = screen.getByRole('button', { name: 'Raccogli evidenze selezionate' });
    expect((collect as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Confermo autorizzazione/i }));
    fireEvent.click(collect);
    await waitFor(() => expect(screen.getByText(/192\.0\.2\.44\/24/)).toBeTruthy());
    expect(screen.getByText(/password\/hash omessi e non acquisiti/i)).toBeTruthy();
    expect(screen.getAllByText(/SHA-256 fixture: [a-f0-9]{64}/i)).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'Simula trasferimento autorizzato' }));
    await waitFor(() => expect(screen.getByText(/Trasferimento fixture verificato/i)).toBeTruthy());
    expect(screen.getByText(/Report di audit host\/rete/i)).toBeTruthy();
  });

  it('simulates only an inert inbound marker and cleanup clears sensitive metadata', async () => {
    useStore.setState({ language: 'en' });
    render(<HostAuditLab />);
    expect(screen.getByText('eJPT · HOST & NETWORK AUDITING · EVIDENCE HANDLING')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm authorization/i }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Simulated transfer direction' }), {
      target: { value: 'analyst-to-host' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simulate authorized transfer' }));
    await waitFor(() => expect(screen.getByText('validation-note.txt')).toBeTruthy());
    expect(screen.getByText(/no command, real file, system, socket, or network request/i)).toBeTruthy();
    expect(screen.queryByText(/passwords\/hashes omitted and not collected/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Clear session' }));
    expect(
      screen.getByText('Session cleared: evidence, transfer, and custody chain removed from the view.')
    ).toBeTruthy();
    expect(screen.queryByText('validation-note.txt')).toBeNull();
  });
});
