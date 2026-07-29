import { describe, it, expect } from 'vitest';
import {
  OSI_LAYERS,
  ATTACK_SCENARIOS,
  ATTACK_WALKTHROUGHS,
  GLOSSARY_TERMS,
} from '../constants';

/** A value that must carry both an Italian and an English string. */
function expectBilingual(value: { it?: string; en?: string } | undefined, label: string) {
  expect(value, `${label} is missing`).toBeTruthy();
  expect(value!.it?.trim(), `${label}.it is empty`).toBeTruthy();
  expect(value!.en?.trim(), `${label}.en is empty`).toBeTruthy();
}

describe('OSI_LAYERS', () => {
  it('defines exactly the 7 layers with unique ids 1..7', () => {
    const ids = OSI_LAYERS.map(l => l.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('has bilingual name and description for every layer', () => {
    for (const layer of OSI_LAYERS) {
      for (const lang of ['it', 'en'] as const) {
        expect(layer.translations[lang].name?.trim(), `L${layer.id} ${lang} name`).toBeTruthy();
        expect(layer.translations[lang].description?.trim(), `L${layer.id} ${lang} desc`).toBeTruthy();
      }
    }
  });
});

describe('ATTACK_SCENARIOS', () => {
  it('has unique ids and a valid target layer', () => {
    const ids = ATTACK_SCENARIOS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of ATTACK_SCENARIOS) {
      expect(s.targetLayer, `${s.id} targetLayer`).toBeGreaterThanOrEqual(1);
      expect(s.targetLayer, `${s.id} targetLayer`).toBeLessThanOrEqual(7);
      expectBilingual(s.name, `${s.id} name`);
      expectBilingual(s.description, `${s.id} description`);
      expectBilingual(s.recommendedDefense, `${s.id} recommendedDefense`);
    }
  });
});

describe('ATTACK_WALKTHROUGHS', () => {
  const scenarioIds = new Set(ATTACK_SCENARIOS.map(s => s.id));

  it('has unique scenarioIds that all reference a real scenario', () => {
    const ids = ATTACK_WALKTHROUGHS.map(w => w.scenarioId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of ATTACK_WALKTHROUGHS) {
      expect(scenarioIds.has(w.scenarioId), `${w.scenarioId} has no matching scenario`).toBe(true);
    }
  });

  it('covers all 7 OSI layers', () => {
    const layers = new Set(ATTACK_WALKTHROUGHS.map(w => w.layer));
    expect([...layers].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps neutralizeAtStep within the steps and fills every bilingual field', () => {
    for (const w of ATTACK_WALKTHROUGHS) {
      const tag = w.scenarioId;
      expect(w.layer, `${tag} layer`).toBeGreaterThanOrEqual(1);
      expect(w.layer, `${tag} layer`).toBeLessThanOrEqual(7);
      expect(w.steps.length, `${tag} needs at least 2 steps`).toBeGreaterThanOrEqual(2);
      expect(Number.isInteger(w.neutralizeAtStep), `${tag} neutralizeAtStep is an int`).toBe(true);
      expect(w.neutralizeAtStep, `${tag} neutralizeAtStep >= 0`).toBeGreaterThanOrEqual(0);
      expect(w.neutralizeAtStep, `${tag} neutralizeAtStep in range`).toBeLessThan(w.steps.length);

      expectBilingual(w.goal, `${tag} goal`);
      expectBilingual(w.defense.name, `${tag} defense.name`);
      expectBilingual(w.defense.action, `${tag} defense.action`);
      expectBilingual(w.defense.mechanism, `${tag} defense.mechanism`);
      expectBilingual(w.outcomeSuccess, `${tag} outcomeSuccess`);
      expectBilingual(w.outcomeBlocked, `${tag} outcomeBlocked`);

      w.steps.forEach((step, i) => {
        expect(['attacker', 'victim', 'network', 'defense']).toContain(step.actor);
        expectBilingual(step.title, `${tag} step ${i} title`);
        expectBilingual(step.detail, `${tag} step ${i} detail`);
      });
    }
  });

  it('provides at least 20 attack walkthroughs', () => {
    expect(ATTACK_WALKTHROUGHS.length).toBeGreaterThanOrEqual(20);
  });
});

describe('GLOSSARY_TERMS', () => {
  it('has unique terms and a bilingual definition each', () => {
    const terms = GLOSSARY_TERMS.map(t => t.term.toLowerCase());
    expect(new Set(terms).size).toBe(terms.length);
    for (const t of GLOSSARY_TERMS) {
      expect(t.term?.trim(), 'term text').toBeTruthy();
      expectBilingual(t.definition, `${t.term} definition`);
    }
  });
});
