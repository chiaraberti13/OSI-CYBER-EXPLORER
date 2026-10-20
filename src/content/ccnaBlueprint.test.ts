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

  it('pins the exact official v1.1 domain weights and per-domain objective counts', () => {
    // Transcribed directly from the official Cisco "CCNA Exam v1.1 (200-301)" exam-topics
    // document (2024 Cisco Public), cross-checked against the maintainer-provided PDF on
    // 2026-10-20. These authoritative weights and counts guard against a class of drift the
    // sum-to-100 check cannot catch: two compensating wrong weights still sum to 100.
    const OFFICIAL_V1_1: Readonly<Record<number, { weight: number; objectives: number }>> = {
      1: { weight: 20, objectives: 13 },
      2: { weight: 20, objectives: 9 },
      3: { weight: 25, objectives: 5 },
      4: { weight: 10, objectives: 9 },
      5: { weight: 15, objectives: 10 },
      6: { weight: 10, objectives: 7 }
    };
    expect(CCNA_BLUEPRINT_DOMAINS.map((domain) => domain.number)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const domain of CCNA_BLUEPRINT_DOMAINS) {
      const official = OFFICIAL_V1_1[domain.number];
      expect(official, `unexpected domain ${domain.number}`).toBeDefined();
      expect(domain.weight, `domain ${domain.number} weight`).toBe(official.weight);
      expect(domain.topics.length, `domain ${domain.number} objective count`).toBe(official.objectives);
    }
    // 53 published parent objectives in total (13 + 9 + 5 + 9 + 10 + 7).
    expect(CCNA_BLUEPRINT_TOPICS).toHaveLength(53);
  });

  it('matches every declared curriculum objective in domain order', () => {
    expect(CCNA_BLUEPRINT_DOMAINS.map((domain) => domain.number)).toEqual(CCNA_DOMAINS.map((domain) => domain.number));

    for (const domain of CCNA_DOMAINS) {
      const matrixDomain = CCNA_BLUEPRINT_DOMAINS.find((item) => item.number === domain.number);
      expect(matrixDomain, `missing matrix domain ${domain.number}`).toBeDefined();
      expect(matrixDomain?.weight).toBe(domain.weight);
      expect(matrixDomain?.topics.map((item) => item.id)).toEqual(domain.objectiveIds);
    }
  });

  it('maps each unique topic to at least one registered view', () => {
    const ids = CCNA_BLUEPRINT_TOPICS.map((item) => item.id);
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
