// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LayerDetails from './LayerDetails';
import PacketInspector from './PacketInspector';
import PacketSimulator from './PacketSimulator';
import { useStore } from '../store';

const packetHeaders = [
  { layer: 4, protocol: 'TCP', details: 'TCP test', pduName: 'Segment', fields: [] },
  { layer: 3, protocol: 'IP', details: 'IP test', pduName: 'Packet', fields: [] },
  { layer: 2, protocol: 'Ethernet II', details: 'Ethernet test', pduName: 'Frame', fields: [] },
];

afterEach(() => {
  cleanup();
  useStore.setState({
    language: 'it',
    viewMode: 'theory',
    packetHeaders: [],
    selectedLayerId: 7,
    selectedProtocol: 'HTTP',
    simulationState: 'idle',
  });
});

function normalizedText(element: HTMLElement): string {
  return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe('header specification consistency', () => {
  it('shows the complete centralized profile in the packet simulator', () => {
    render(<PacketSimulator />);
    const profile = screen.getByTestId('packet-simulator-header-specifications');

    expect(normalizedText(profile)).toContain('Header Ethernet II: 14 B');
    expect(normalizedText(profile)).toContain('Frame Ethernet: 64–1518 B');
    expect(normalizedText(profile)).toContain('Header IPv4: 20–60 B');
    expect(normalizedText(profile)).toContain('Header IPv6 fisso: 40 B');
    expect(normalizedText(profile)).toContain('Header TCP: 20–60 B');
    expect(normalizedText(profile)).toContain('Header UDP: 8 B');
    expect(normalizedText(profile)).toContain('MSS tipico IPv4: 1460 B');
    expect(normalizedText(profile)).toContain('MSS tipico IPv6: 1440 B');
    expect(normalizedText(profile)).toContain('TTL iniziali (default di sistema): 64 / 128 / 255');
  });

  it('renders identical layer values in PacketInspector and LayerDetails', () => {
    useStore.setState({
      language: 'it',
      viewMode: 'packet',
      packetHeaders,
      selectedLayerId: 3,
      selectedProtocol: 'HTTP',
    });

    const inspector = render(<PacketInspector />);
    const inspectorValues = new Map(
      [2, 3, 4].map((layer) => [
        layer,
        normalizedText(screen.getByTestId(`packet-inspector-header-specifications-l${layer}`)),
      ]),
    );
    inspector.unmount();

    render(<LayerDetails />);
    for (const layer of [2, 3, 4]) {
      expect(normalizedText(screen.getByTestId(`layer-details-header-specifications-l${layer}`)))
        .toBe(inspectorValues.get(layer));
    }
  });
});
