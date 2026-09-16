import { describe, expect, it } from 'vitest';
import { CCNA_DOMAINS } from '../content/ccna';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';

function expectBilingual(value: { it?: string; en?: string }, label: string) {
  expect(value.it?.trim(), `${label}.it`).toBeTruthy();
  expect(value.en?.trim(), `${label}.en`).toBeTruthy();
}

describe('CCNA curriculum map', () => {
  it('defines the six domains with the official total weight', () => {
    expect(CCNA_DOMAINS.map((domain) => domain.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(CCNA_DOMAINS.reduce((total, domain) => total + domain.weight, 0)).toBe(100);
  });

  it('keeps every learning field bilingual and mapped to objectives', () => {
    for (const domain of CCNA_DOMAINS) {
      expectBilingual(domain.title, `${domain.id}.title`);
      expectBilingual(domain.purpose, `${domain.id}.purpose`);
      expect(domain.objectiveIds.length).toBeGreaterThan(0);
      expect(domain.topics.length).toBeGreaterThan(0);
      expect(domain.securityLinks.length).toBeGreaterThan(0);
      domain.topics.forEach((topic, index) => expectBilingual(topic, `${domain.id}.topics[${index}]`));
      domain.securityLinks.forEach((item, index) => expectBilingual(item, `${domain.id}.securityLinks[${index}]`));
    }
  });
});

describe('attack taxonomy', () => {
  it('uses unique ids and bilingual descriptions', () => {
    const ids = ATTACK_FAMILIES.map((family) => family.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const family of ATTACK_FAMILIES) {
      expectBilingual(family.name, `${family.id}.name`);
      expectBilingual(family.description, `${family.id}.description`);
      expect(family.planes.length).toBeGreaterThan(0);
    }
  });
});
