// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  });
});
