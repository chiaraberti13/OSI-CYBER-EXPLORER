/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { describe, expect, it } from 'vitest';
import { STUDY_MANUAL } from '../content/studyManual';
import { VIEW_REGISTRY } from '../content/viewRegistry';
import { securityReferenceUrl } from '../content/securityReferences';
import { allGuidedLabs, byChapterOrder, findChapter, manualStats, orderedChapters } from './studyManual';
import type { AppView } from '../store';

/**
 * EDU track — integrity of the study manual content graph and its pure selectors.
 * Relations TypeScript cannot check (the `lab` a topic/guided lab opens, bilingual
 * parity, unique ids) are enforced here so a broken link or a missing translation
 * fails in CI, exactly like the rest of the content datasets.
 */

const REGISTERED_VIEWS = new Set(Object.keys(VIEW_REGISTRY) as AppView[]);

/** Recursively assert that every { it, en } pair in the data has two non-empty sides. */
function assertBilingualParity(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((entry, i) => assertBilingualParity(entry, `${path}[${i}]`));
    return;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.includes('it') && keys.includes('en') && typeof record.it === 'string' && typeof record.en === 'string') {
      expect((record.it as string).trim(), `${path}.it`).not.toBe('');
      expect((record.en as string).trim(), `${path}.en`).not.toBe('');
      return;
    }
    for (const key of keys) assertBilingualParity(record[key], `${path}.${key}`);
  }
}

describe('study manual content integrity', () => {
  it('has unique chapter ids and orders', () => {
    const ids = STUDY_MANUAL.map(c => c.id);
    const orders = STUDY_MANUAL.map(c => c.order);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('has unique topic ids and guided-lab ids across the whole manual', () => {
    const topicIds = STUDY_MANUAL.flatMap(c => c.topics.map(t => t.id));
    const labIds = allGuidedLabs().map(l => l.id);
    expect(new Set(topicIds).size, 'topic ids').toBe(topicIds.length);
    expect(new Set(labIds).size, 'guided-lab ids').toBe(labIds.length);
  });

  it('requires non-empty teaching fields on every topic', () => {
    for (const chapter of STUDY_MANUAL) {
      expect(chapter.topics.length, `${chapter.id} has topics`).toBeGreaterThan(0);
      for (const topic of chapter.topics) {
        expect(topic.objectives.length, `${topic.id} objectives`).toBeGreaterThan(0);
        expect(topic.theory.length, `${topic.id} theory`).toBeGreaterThan(0);
        expect(topic.commonMistakes.length, `${topic.id} commonMistakes`).toBeGreaterThan(0);
      }
    }
  });

  it('points every lab link at a registered view', () => {
    for (const chapter of STUDY_MANUAL) {
      for (const topic of chapter.topics) {
        if (topic.lab) expect(REGISTERED_VIEWS.has(topic.lab), `${topic.id}.lab=${topic.lab}`).toBe(true);
        for (const lab of topic.guidedLabs ?? []) {
          expect(REGISTERED_VIEWS.has(lab.lab), `${lab.id}.lab=${lab.lab}`).toBe(true);
          expect(lab.steps.length, `${lab.id} steps`).toBeGreaterThan(0);
          expect(lab.solution.length, `${lab.id} solution`).toBeGreaterThan(0);
          expect(lab.selfCheck.length, `${lab.id} selfCheck`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('resolves every structured reference to an https URL', () => {
    for (const chapter of STUDY_MANUAL) {
      for (const topic of chapter.topics) {
        for (const ref of topic.references ?? []) {
          expect(securityReferenceUrl(ref).startsWith('https://'), `${topic.id} ref ${ref.id}`).toBe(true);
        }
      }
    }
  });

  it('keeps full IT/EN parity across the manual', () => {
    assertBilingualParity(STUDY_MANUAL, 'STUDY_MANUAL');
  });
});

describe('study manual selectors', () => {
  it('returns chapters sorted by study order', () => {
    const orders = orderedChapters().map(c => c.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('orders chapters by their order field via the comparator', () => {
    const a = { order: 1 } as Parameters<typeof byChapterOrder>[0];
    const b = { order: 2 } as Parameters<typeof byChapterOrder>[1];
    expect(byChapterOrder(a, b)).toBeLessThan(0);
    expect(byChapterOrder(b, a)).toBeGreaterThan(0);
    expect(byChapterOrder(a, a)).toBe(0);
  });

  it('finds a chapter by id and nothing for an unknown id', () => {
    expect(findChapter('osi-model')?.id).toBe('osi-model');
    expect(findChapter('does-not-exist')).toBeUndefined();
  });

  it('reports counts consistent with the dataset', () => {
    const stats = manualStats();
    expect(stats.chapters).toBe(STUDY_MANUAL.length);
    expect(stats.topics).toBe(STUDY_MANUAL.reduce((n, c) => n + c.topics.length, 0));
    expect(stats.guidedLabs).toBe(allGuidedLabs().length);
    expect(stats.guidedLabs).toBeGreaterThan(0);
  });
});
