import { describe, expect, it } from 'vitest';
import { CABLING_TYPES, NETWORK_COMPONENTS, TOPOLOGY_ARCHITECTURES } from '../content/networkConcepts';
import { DOMAIN_CHECKLISTS } from '../content/domainChecklists';
import { CCNA_DOMAINS } from '../content/ccna';
import type { Bilingual } from '../types';

function expectBilingual(value: Bilingual, label: string, min = 20) {
  expect(value.it?.trim().length, `${label}.it too short`).toBeGreaterThan(min);
  expect(value.en?.trim().length, `${label}.en too short`).toBeGreaterThan(min);
}

describe('network concepts (CCNA 1.1, 1.2, 1.3)', () => {
  it('describes every component with its decision, boundary, and misconception', () => {
    const ids = NETWORK_COMPONENTS.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(NETWORK_COMPONENTS.length).toBeGreaterThanOrEqual(7);
    for (const component of NETWORK_COMPONENTS) {
      expectBilingual(component.name, `${component.id}.name`, 1);
      expectBilingual(component.decision, `${component.id}.decision`);
      expectBilingual(component.boundary, `${component.id}.boundary`);
      expectBilingual(component.notThis, `${component.id}.notThis`);
      expect(component.layer.trim().length).toBeGreaterThan(1);
    }
  });

  it('covers the topology architectures the objective names', () => {
    const ids = TOPOLOGY_ARCHITECTURES.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const expected of ['two-tier', 'three-tier', 'spine-leaf', 'soho', 'wan', 'cloud']) {
      expect(TOPOLOGY_ARCHITECTURES.map(item => item.id)).toContain(expected);
    }
    for (const topology of TOPOLOGY_ARCHITECTURES) {
      expectBilingual(topology.name, `${topology.id}.name`, 1);
      expectBilingual(topology.shape, `${topology.id}.shape`);
      expectBilingual(topology.whenToUse, `${topology.id}.whenToUse`);
      expectBilingual(topology.tradeOff, `${topology.id}.tradeOff`);
    }
  });

  it('covers copper, both fibre types, pinouts, and negotiation', () => {
    for (const expected of ['utp', 'mmf', 'smf', 'pinout', 'negotiation']) {
      expect(CABLING_TYPES.map(item => item.id)).toContain(expected);
    }
    for (const cable of CABLING_TYPES) {
      expectBilingual(cable.name, `${cable.id}.name`, 1);
      expectBilingual(cable.medium, `${cable.id}.medium`);
      expectBilingual(cable.useCase, `${cable.id}.useCase`);
      expectBilingual(cable.trap, `${cable.id}.trap`);
      // A reach is either a shared figure or a translated phrase, never empty.
      if (typeof cable.reach === 'string') {
        expect(cable.reach.trim().length).toBeGreaterThan(0);
      } else {
        expectBilingual(cable.reach, `${cable.id}.reach`, 3);
      }
    }
  });
});

describe('domain concept checklists', () => {
  it('covers all six domains exactly once', () => {
    const covered = DOMAIN_CHECKLISTS.map(list => list.domainId);
    expect(new Set(covered).size).toBe(covered.length);
    expect([...covered].sort()).toEqual([...CCNA_DOMAINS.map(domain => domain.id)].sort());
  });

  it('states a concept, where to observe it, and a pitfall for every item', () => {
    const allIds: string[] = [];
    for (const list of DOMAIN_CHECKLISTS) {
      expect(list.items.length, `${list.domainId} needs several items`).toBeGreaterThanOrEqual(4);
      for (const entry of list.items) {
        allIds.push(`${list.domainId}/${entry.id}`);
        expectBilingual(entry.concept, `${list.domainId}/${entry.id}.concept`);
        expectBilingual(entry.observeIn, `${list.domainId}/${entry.id}.observeIn`);
        expectBilingual(entry.pitfall, `${list.domainId}/${entry.id}.pitfall`);
      }
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('is a study aid, not an assessment: no item carries an answer or a score', () => {
    for (const list of DOMAIN_CHECKLISTS) {
      for (const entry of list.items) {
        expect(Object.keys(entry).sort()).toEqual(['concept', 'id', 'observeIn', 'pitfall']);
      }
    }
  });
});
