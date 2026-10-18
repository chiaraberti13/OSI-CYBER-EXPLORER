// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import AssessmentWorkspaceLab from './AssessmentWorkspaceLab';

afterEach(() => cleanup());

describe('AssessmentWorkspaceLab', () => {
  it('enforces scope confirmation, phase order, and builds an Italian-English evidence report', () => {
    useStore.setState({ language: 'it' });
    render(<AssessmentWorkspaceLab />);

    const phaseArticle = (heading: string) => screen.getByRole('heading', { name: heading }).closest('article')!;
    const firstButton = within(phaseArticle('OSINT da fixture')).getByRole('button');
    expect((firstButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('checkbox', { name: /Confermo di lavorare esclusivamente/i }));
    expect((firstButton as HTMLButtonElement).disabled).toBe(false);
    expect((within(phaseArticle('Host discovery')).getByRole('button') as HTMLButtonElement).disabled).toBe(true);

    for (const heading of [
      'OSINT da fixture',
      'Host discovery',
      'Porte e servizi',
      'Ipotesi sul sistema operativo',
      'Vulnerability assessment'
    ]) {
      fireEvent.click(within(phaseArticle(heading)).getByRole('button'));
    }

    expect(screen.getByText('198.51.100.20')).toBeTruthy();
    expect(
      within(phaseArticle('Ipotesi sul sistema operativo')).getByText(/banner e TTL sono indizi deboli/i)
    ).toBeTruthy();
    expect(
      within(phaseArticle('Ipotesi sul sistema operativo')).getByText(/non una prova dell’OS reale/i)
    ).toBeTruthy();
    const report = document.querySelector('pre[aria-label="Report bilingue pronto"]');
    expect(report).toBeTruthy();
    expect(report?.textContent).toContain('# Report assessment (simulazione)');
    expect(report?.textContent).toContain('# Assessment report (simulation)');
    expect(report?.textContent).toContain('192.0.2.10/32');
  });

  it('renders the phase controls and safety copy in English', () => {
    useStore.setState({ language: 'en' });
    render(<AssessmentWorkspaceLab />);
    expect(screen.getByRole('heading', { name: 'Assessment workspace' })).toBeTruthy();
    expect(screen.getByText(/No packet, command, scan, or HTTP request is generated/i)).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: /I confirm that I will work exclusively/i })).toBeTruthy();
  });
});
