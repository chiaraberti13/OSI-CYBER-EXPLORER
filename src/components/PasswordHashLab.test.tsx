// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import PasswordHashLab from './PasswordHashLab';

afterEach(() => cleanup());

describe('PasswordHashLab', () => {
  it('requires fixture scope and separates rate limiting from account lockout', () => {
    useStore.setState({ language: 'it' });
    render(<PasswordHashLab />);
    const run = screen.getByRole('button', { name: 'Simula tentativi online' }) as HTMLButtonElement;
    expect(run.disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Confermo che opero solo sulle fixture/i }));
    expect(run.disabled).toBe(false);
    fireEvent.click(run);
    expect(screen.getByRole('heading', { name: 'Registro eventi fixture' })).toBeTruthy();

    const limited = screen.getByText('Richieste frenate dal rate limit', { exact: true });
    expect(limited.parentElement?.querySelector('dd')?.textContent).toBe('2');
    expect(screen.getByText(/Il rate limit frena le richieste oltre la soglia/)).toBeTruthy();
    expect(screen.getByText('AUTH_FAILURE: fixture-user-01 · 3 synthetic failure(s)')).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: /Rate limit:/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Blocca l’account dopo 5 errori/i }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Tentativi simulati sul singolo account' }), {
      target: { value: '8' }
    });
    fireEvent.click(run);
    expect(screen.getByText('ACCOUNT_LOCKOUT: fixture-user-01 · fixture policy threshold reached')).toBeTruthy();
    expect(screen.getAllByText('ACCOUNT_LOCKOUT_REJECT: fixture-user-01')).toHaveLength(3);
  });

  it('correlates distributed spray failures while individual thresholds remain clear', () => {
    useStore.setState({ language: 'it' });
    render(<PasswordHashLab />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Confermo che opero solo sulle fixture/i }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Strategia da confrontare' }), {
      target: { value: 'password-spray' }
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Account sintetici nel campione' }), {
      target: { value: '5' }
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /Blocca l’account dopo 5 errori/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Simula tentativi online' }));
    expect(screen.getByText('Allerta: errori distribuiti su più account')).toBeTruthy();
    expect(screen.getByText('CORRELATED_FAILURES: 5 synthetic accounts · simulated window')).toBeTruthy();
    const locked = screen.getByText('Account bloccati', { exact: true });
    expect(locked.parentElement?.querySelector('dd')?.textContent).toBe('0');
  });

  it('compares synthetic offline KDF fixtures in English without a credential input', () => {
    useStore.setState({ language: 'en' });
    render(<PasswordHashLab />);
    expect(screen.getByRole('heading', { level: 1, name: 'Password & hash workbench' })).toBeTruthy();
    expect(screen.getByText('eJPT · PASSWORDS · HASHING · DEFENSES')).toBeTruthy();
    expect(document.querySelectorAll('input[type="password"], input[name*="password"]')).toHaveLength(0);
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm I will use only synthetic fixtures/i }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Synthetic candidate budget' }), {
      target: { value: '100' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Compare offline profiles' }));
    expect(screen.getByText('Weak sample found within budget')).toBeTruthy();
    expect(screen.getByText('Sample not found within budget')).toBeTruthy();
    expect(screen.getByText('Argon2id KDF fixture (illustrative profile)')).toBeTruthy();
    expect(screen.getByText(/no hash is computed/i)).toBeTruthy();
  });
});
