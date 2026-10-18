// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import WebApplicationLab from './WebApplicationLab';

afterEach(() => cleanup());

describe('WebApplicationLab', () => {
  it('keeps the controls scoped, shows HTTP evidence, and runs patched regressions in Italian', () => {
    useStore.setState({ language: 'it' });
    render(<WebApplicationLab />);

    const recon = screen.getByRole('button', { name: 'Ispeziona risposta HTTP' }) as HTMLButtonElement;
    expect(recon.disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Confermo lo scope/i }));
    fireEvent.click(recon);
    expect(screen.getByText('Richiesta', { exact: true })).toBeTruthy();
    expect(screen.getByText('Risposta', { exact: true })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Scopri percorsi fixture' }));
    fireEvent.click(screen.getByRole('button', { name: 'Verifica accesso al profilo fixture-user-02' }));
    expect(screen.getAllByText(/IDOR\/BOLA/)).toHaveLength(2);
    expect(screen.getByText(/GET \/api\/profile\/fixture-user-02/)).toBeTruthy();
    expect(screen.getAllByText(/200 OK/)).toHaveLength(2);
    expect(screen.getByText(/Il percorso indicizzato da robots\.txt/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Applica remediation fixture' }));
    fireEvent.click(screen.getByRole('button', { name: 'Esegui test di regressione' }));
    expect(screen.getByRole('heading', { name: /Esito regressioni: PASS/ })).toBeTruthy();
    expect(screen.getByText(/429 Too Many Requests/)).toBeTruthy();
    expect(screen.getByText(/403 Forbidden/)).toBeTruthy();
    expect(screen.getByText(/la quarta richiesta è limitata/i)).toBeTruthy();
  });

  it('renders English content and performs the deterministic discovery exercise', () => {
    useStore.setState({ language: 'en' });
    render(<WebApplicationLab />);
    expect(screen.getByRole('heading', { level: 1, name: 'Web application pentest: offline fixture' })).toBeTruthy();
    expect(screen.getByText(/No HTTP requests, scans, real credential attempts/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm scope/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Discover fixture paths' }));
    expect(screen.getAllByText('Request', { exact: true }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Response', { exact: true }).length).toBeGreaterThan(0);
    expect(screen.getByText(/200 \/robots\.txt/)).toBeTruthy();
    expect(screen.getByText(/401 \/admin\//)).toBeTruthy();
    expect(screen.getByText(/A path listed in robots\.txt is a surface hint/i)).toBeTruthy();
  });
});
