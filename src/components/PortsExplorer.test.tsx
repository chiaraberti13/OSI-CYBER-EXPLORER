// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import PortsExplorer from './PortsExplorer';

afterEach(cleanup);

describe('PortsExplorer IANA metadata', () => {
  it('marks a de-facto ambiguous port and shows its verified assignment', () => {
    useStore.setState({ language: 'it' });
    render(<PortsExplorer inline />);

    fireEvent.change(screen.getByPlaceholderText(/cerca porte/i), { target: { value: '1521' } });

    expect(screen.getByText('IANA: de facto')).toBeTruthy();
    expect(screen.getByText('ncube-lm')).toBeTruthy();
    expect(screen.getByText(/Uso ambiguo:/)).toBeTruthy();
    expect(screen.getByText(/Oracle Net with native encryption or TLS/)).toBeTruthy();
    expect(screen.getByText('Verificato: 2026-09-30')).toBeTruthy();
  });

  it('shows TCP 8080 as the assigned http-alt service', () => {
    useStore.setState({ language: 'en' });
    render(<PortsExplorer inline />);

    fireEvent.change(screen.getByPlaceholderText(/search ports/i), { target: { value: '8080' } });

    expect(screen.getByText('IANA: assigned')).toBeTruthy();
    expect(screen.getByText('http-alt')).toBeTruthy();
    expect(screen.queryByText(/Ambiguous use:/)).toBeNull();
    expect(screen.getAllByText('8080', { selector: 'mark' }).length).toBeGreaterThan(0);
  });

  it('shows a visible count and resets search, range, and security filters together', async () => {
    const user = userEvent.setup();
    useStore.setState({ language: 'it' });
    render(<PortsExplorer inline />);

    const status = screen.getByRole('status');
    const total = Number(status.textContent!.match(/di (\d+) servizi/)![1]);
    expect(status.textContent).toBe(`${total} di ${total} servizi`);

    const security = screen.getByRole('combobox', { name: 'Profilo di sicurezza' });
    await user.selectOptions(security, 'review');
    const filtered = Number(status.textContent!.match(/(\d+) di/)![1]);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(total);

    fireEvent.change(screen.getByRole('textbox', { name: 'Cerca porte e servizi di rete' }), {
      target: { value: 'ssh' }
    });
    await user.click(screen.getByRole('button', { name: 'Azzera filtri' }));

    expect((security as HTMLSelectElement).value).toBe('all');
    expect((screen.getByRole('textbox', { name: 'Cerca porte e servizi di rete' }) as HTMLInputElement).value).toBe('');
    expect(status.textContent).toBe(`${total} di ${total} servizi`);
  });

  it('exposes the port range cards as keyboard-operable toggle buttons', async () => {
    const user = userEvent.setup();
    useStore.setState({ language: 'en' });
    render(<PortsExplorer inline />);

    const rangeButton = screen.getByRole('button', { name: /dynamic \/ private.*49152 - 65535/i });
    expect(rangeButton.getAttribute('aria-pressed')).toBe('false');
    rangeButton.focus();
    await user.keyboard('{Enter}');

    expect(rangeButton.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Understanding Dynamic Ports' })).toBeTruthy();
  });
});
