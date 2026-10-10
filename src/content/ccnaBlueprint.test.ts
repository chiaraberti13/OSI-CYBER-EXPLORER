import { describe, expect, it } from 'vitest';
import { CCNA_DOMAINS } from './ccna';
import { CCNA_BLUEPRINT, CCNA_BLUEPRINT_DOMAINS, CCNA_BLUEPRINT_TOPICS } from './ccnaBlueprint';
import { VIEW_REGISTRY } from './viewRegistry';

describe('CCNA 200-301 blueprint coverage', () => {
  it('pins the reviewed official blueprint and valid domain weights', () => {
    expect(CCNA_BLUEPRINT).toMatchObject({ exam: '200-301', version: '1.1' });
    expect(CCNA_BLUEPRINT.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const source = new URL(CCNA_BLUEPRINT.source.url);
    expect(source.protocol).toBe('https:');
    expect(source.hostname).toBe('learningcontent.cisco.com');
    expect(CCNA_BLUEPRINT_DOMAINS.reduce((sum, domain) => sum + domain.weight, 0)).toBe(100);
  });

  it('matches every declared curriculum objective in domain order', () => {
    expect(CCNA_BLUEPRINT_DOMAINS.map(domain => domain.number)).toEqual(CCNA_DOMAINS.map(domain => domain.number));

    for (const domain of CCNA_DOMAINS) {
      const matrixDomain = CCNA_BLUEPRINT_DOMAINS.find(item => item.number === domain.number);
      expect(matrixDomain, `missing matrix domain ${domain.number}`).toBeDefined();
      expect(matrixDomain?.weight).toBe(domain.weight);
      expect(matrixDomain?.topics.map(item => item.id)).toEqual(domain.objectiveIds);
    }
  });

  it('maps each unique topic to at least one registered view', () => {
    const ids = CCNA_BLUEPRINT_TOPICS.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const entry of CCNA_BLUEPRINT_TOPICS) {
      expect(entry.title.it.trim(), `${entry.id} missing Italian title`).not.toBe('');
      expect(entry.title.en.trim(), `${entry.id} missing English title`).not.toBe('');
      expect(entry.destinations.length, `${entry.id} is uncovered`).toBeGreaterThan(0);
      expect(new Set(entry.destinations).size, `${entry.id} repeats a destination`).toBe(entry.destinations.length);
      for (const destination of entry.destinations) {
        expect(VIEW_REGISTRY[destination], `${entry.id} points to missing view ${destination}`).toBeDefined();
      }
    }
  });
});
