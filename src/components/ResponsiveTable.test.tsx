// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import ResponsiveTable from './ResponsiveTable';

interface Row { id: string; property: string; tcp: string; udp: string }

const rows: Row[] = [
  { id: 'connection', property: 'Connessione', tcp: 'Handshake a tre vie', udp: 'Nessun handshake' },
  { id: 'reliability', property: 'Affidabilità', tcp: 'ACK e ritrasmissione', udp: 'Nessuna garanzia' }
];

function renderTable() {
  return render(
    <ResponsiveTable
      rows={rows}
      rowKey={row => row.id}
      label="TCP e UDP"
      columns={[
        { id: 'property', header: 'Proprietà', heading: true, cell: row => row.property },
        { id: 'tcp', header: 'TCP', cell: row => row.tcp },
        { id: 'udp', header: 'UDP', cell: row => row.udp }
      ]}
    />
  );
}

afterEach(cleanup);

describe('ResponsiveTable', () => {
  it('renders a real table for wide screens, with headers bound to rows', () => {
    renderTable();
    const table = screen.getByRole('table', { name: 'TCP e UDP' });
    expect(within(table).getAllByRole('columnheader').map(cell => cell.textContent)).toEqual(['Proprietà', 'TCP', 'UDP']);
    // The heading column becomes a row header, so screen readers announce which row a cell belongs to.
    expect(within(table).getAllByRole('rowheader').map(cell => cell.textContent)).toEqual(['Connessione', 'Affidabilità']);
  });

  it('renders the same rows as labelled cards for narrow screens', () => {
    renderTable();
    const cards = screen.getByRole('list', { name: 'TCP e UDP' });
    const items = within(cards).getAllByRole('listitem');
    expect(items).toHaveLength(rows.length);
    // Every value keeps the header that explains it: that is the point of the card form.
    expect(items[0].textContent).toContain('Connessione');
    expect(items[0].textContent).toContain('TCP');
    expect(items[0].textContent).toContain('Handshake a tre vie');
    expect(items[0].textContent).toContain('UDP');
    expect(items[0].textContent).toContain('Nessun handshake');
  });

  it('shows both forms in the document, letting CSS pick one per viewport', () => {
    renderTable();
    // A single source of rows drives both, so they can never disagree.
    expect(screen.getByRole('table', { name: 'TCP e UDP' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'TCP e UDP' })).toBeTruthy();
  });

  it('uses the first column as the card heading when none is marked', () => {
    render(
      <ResponsiveTable
        rows={rows}
        rowKey={row => row.id}
        label="senza heading"
        columns={[
          { id: 'property', header: 'Proprietà', cell: row => row.property },
          { id: 'tcp', header: 'TCP', cell: row => row.tcp }
        ]}
      />
    );
    const items = within(screen.getByRole('list', { name: 'senza heading' })).getAllByRole('listitem');
    expect(items[0].textContent?.startsWith('Connessione')).toBe(true);
  });
});
