/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { describe, expect, it } from 'vitest';
import { MANUAL_CERTIFICATION_TRACKS, STUDY_MANUAL, type ManualChapter } from '../content/studyManual';
import { CCNA_DOMAINS } from '../content/ccna';
import { VIEW_REGISTRY } from '../content/viewRegistry';
import { securityReferenceUrl } from '../content/securityReferences';
import {
  allGuidedLabs,
  byChapterOrder,
  ccnaDomainForChapter,
  certificationTrackForChapter,
  chaptersForCertificationTrack,
  chaptersByCertificationTrack,
  chapterCompletion,
  chaptersByDomain,
  chaptersForLab,
  findChapter,
  manualStats,
  orderedChapters
} from './studyManual';
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
    const ids = STUDY_MANUAL.map((c) => c.id);
    const orders = STUDY_MANUAL.map((c) => c.order);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('has unique topic ids and guided-lab ids across the whole manual', () => {
    const topicIds = STUDY_MANUAL.flatMap((c) => c.topics.map((t) => t.id));
    const labIds = allGuidedLabs().map((l) => l.id);
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

  it('aligns every chapter to the CCNA 200-301 v1.1 blueprint or marks it an extension', () => {
    const domainIds = new Set(CCNA_DOMAINS.map((domain) => domain.id));
    for (const chapter of STUDY_MANUAL) {
      expect(['ccna', 'extension'], `${chapter.id} track`).toContain(chapter.track);
      if (chapter.track === 'ccna') {
        expect(chapter.domain, `${chapter.id} ccna chapter needs a domain`).toBeDefined();
        expect(domainIds.has(chapter.domain as string), `${chapter.id} domain=${chapter.domain}`).toBe(true);
      } else {
        expect(chapter.domain, `${chapter.id} extension must not carry a domain`).toBeUndefined();
      }
    }
  });
});

describe('study manual selectors', () => {
  it('returns chapters sorted by study order', () => {
    const orders = orderedChapters().map((c) => c.order);
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

  it('resolves the CCNA domain for a core chapter and nothing for an extension', () => {
    const osi = findChapter('osi-model');
    expect(osi && ccnaDomainForChapter(osi)?.id).toBe('network-fundamentals');
    const attacks = findChapter('attacks-osi-killchain');
    expect(attacks && ccnaDomainForChapter(attacks)).toBeUndefined();
  });

  it('groups chapters by CCNA domain, in domain order, with extensions last', () => {
    const groups = chaptersByDomain();
    // Every chapter appears exactly once across the groups.
    const grouped = groups.flatMap((group) => group.chapters);
    expect(grouped.length).toBe(STUDY_MANUAL.length);
    expect(new Set(grouped.map((c) => c.id)).size).toBe(STUDY_MANUAL.length);

    // CCNA domain groups precede the extension bucket, and domain groups are in number order.
    const domainNumbers = groups.filter((g) => g.domain).map((g) => g.domain!.number);
    expect(domainNumbers).toEqual([...domainNumbers].sort((a, b) => a - b));
    const extensionIndex = groups.findIndex((g) => g.key === 'extension');
    if (extensionIndex !== -1) {
      expect(extensionIndex).toBe(groups.length - 1);
      expect(groups[extensionIndex].chapters.every((c) => c.track === 'extension')).toBe(true);
    }

    // Chapters within a group stay in study order.
    for (const group of groups) {
      const orders = group.chapters.map((c) => c.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it('aggregates chapter completion without counting duplicates or unknown ids', () => {
    const chapters = orderedChapters().slice(0, 2);
    expect(chapterCompletion(chapters, [chapters[0].id, chapters[0].id, 'unknown'])).toEqual({
      completed: 1,
      total: 2,
      percent: 50
    });
    expect(chapterCompletion([], ['unknown'])).toEqual({ completed: 0, total: 0, percent: 0 });
  });

  it('reports counts consistent with the dataset', () => {
    const stats = manualStats();
    expect(stats.chapters).toBe(STUDY_MANUAL.length);
    expect(stats.topics).toBe(STUDY_MANUAL.reduce((n, c) => n + c.topics.length, 0));
    expect(stats.guidedLabs).toBe(allGuidedLabs().length);
    expect(stats.guidedLabs).toBeGreaterThan(0);
  });

  // EDU-STRUCT-05 — the lab→chapter reverse map that lets a lab defer its theory.
  it('maps a lab back to exactly the chapters whose topics cite it, in study order', () => {
    // Every (topic.lab / guidedLab.lab) citation is covered, and each returned chapter
    // genuinely cites the lab — so the back-link can never point at an unrelated chapter.
    const citedLabs = new Set<AppView>();
    for (const chapter of STUDY_MANUAL) {
      for (const topic of chapter.topics) {
        if (topic.lab) citedLabs.add(topic.lab);
        for (const guided of topic.guidedLabs ?? []) citedLabs.add(guided.lab);
      }
    }
    expect(citedLabs.size).toBeGreaterThan(0);

    for (const lab of citedLabs) {
      const chapters = chaptersForLab(lab);
      expect(chapters.length).toBeGreaterThan(0);
      // Study order, and each chapter really cites the lab.
      expect(chapters.map((c) => c.order)).toEqual([...chapters.map((c) => c.order)].sort((a, b) => a - b));
      for (const chapter of chapters) {
        const cites = chapter.topics.some(
          (topic) => topic.lab === lab || (topic.guidedLabs ?? []).some((guided) => guided.lab === lab)
        );
        expect(cites).toBe(true);
      }
    }
  });

  it('returns no chapter for a view no topic studies (the manual itself, an uncited lab)', () => {
    expect(chaptersForLab('manual')).toEqual([]);
    expect(chaptersForLab('curriculum')).toEqual([]);
  });
});

describe('manual certification routes (ENG-30, two-route IA)', () => {
  it('provides exactly the two study routes with bilingual labels', () => {
    expect(MANUAL_CERTIFICATION_TRACKS.map((track) => track.id)).toEqual(['ccna', 'ejpt']);
    assertBilingualParity(MANUAL_CERTIFICATION_TRACKS, 'MANUAL_CERTIFICATION_TRACKS');
  });

  it.each([
    ['ccna', 'ccna', 'ccna'],
    ['both', 'ccna', 'ccna'],
    // The Security+/advanced extension studies as part of the CCNA (blue) route.
    ['both', 'extension', 'ccna'],
    ['securityplus', 'extension', 'ccna'],
    // Only eJPT chapters form the offensive route.
    ['ejpt', 'extension', 'ejpt']
  ] as const)('classifies cert=%s / blueprint=%s as the %s route', (cert, track, expected) => {
    const chapter: ManualChapter = { ...STUDY_MANUAL[0], cert, track };
    expect(certificationTrackForChapter(chapter)).toBe(expected);
  });

  it('keeps certification and blueprint metadata compatible across the dataset', () => {
    for (const chapter of STUDY_MANUAL) {
      expect(['ccna', 'both', 'securityplus', 'ejpt']).toContain(chapter.cert);
      if (chapter.track === 'ccna') expect(['ccna', 'both']).toContain(chapter.cert);
      if (chapter.cert === 'ccna') expect(chapter.track).toBe('ccna');
      if (chapter.cert === 'ejpt') {
        expect(chapter.track).toBe('extension');
        expect(chapter.domain).toBeUndefined();
      }
    }
  });

  it('partitions every chapter into the two routes, once, without mutating the source', () => {
    const originalIds = STUDY_MANUAL.map((chapter) => chapter.id);
    const groups = chaptersByCertificationTrack();
    expect(groups.map((group) => group.key)).toEqual(['ccna', 'ejpt']);
    const chapters = groups.flatMap((group) => group.chapters);
    expect(chapters.map((chapter) => chapter.id).sort()).toEqual([...originalIds].sort());
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(STUDY_MANUAL.length);
    for (const group of groups) {
      expect(group.chapters.length).toBeGreaterThan(0);
      expect(group.title).toEqual(MANUAL_CERTIFICATION_TRACKS.find((track) => track.id === group.key)?.title);
      const orders = group.chapters.map((chapter) => chapter.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
    expect(STUDY_MANUAL.map((chapter) => chapter.id)).toEqual(originalIds);
    // Returned arrays can be manipulated by callers without mutating the dataset.
    chaptersForCertificationTrack('ccna').pop();
    groups[0].chapters.reverse();
    expect(chaptersForCertificationTrack('ccna').map((chapter) => chapter.order)).toEqual(
      STUDY_MANUAL.filter((chapter) => chapter.cert !== 'ejpt')
        .map((chapter) => chapter.order)
        .sort((a, b) => a - b)
    );
  });

  it('puts only eJPT on the offensive route and folds the defensive extension into CCNA', () => {
    expect(chaptersForCertificationTrack('ejpt').map((chapter) => chapter.id)).toEqual([
      'pentest-methodology',
      'web-app-pentest',
      'exploitation-post-exploitation'
    ]);
    // The CCNA route carries both the backbone and the Security+/advanced extension.
    const ccnaIds = chaptersForCertificationTrack('ccna').map((chapter) => chapter.id);
    expect(ccnaIds).toContain('osi-model');
    expect(ccnaIds).toContain('attacks-osi-killchain');
    expect(ccnaIds).toContain('access-layer-security');
    expect(chaptersForCertificationTrack('ejpt').every((chapter) => chapter.cert === 'ejpt')).toBe(true);
    expect(chaptersForCertificationTrack('ccna').every((chapter) => chapter.cert !== 'ejpt')).toBe(true);
  });

  it.each(['ccna', 'ejpt'] as const)('narrows domain navigation to %s without losing chapters', (track) => {
    const groups = chaptersByDomain(track);
    const ids = groups.flatMap((group) => group.chapters.map((chapter) => chapter.id));
    const expected = chaptersForCertificationTrack(track).map((chapter) => chapter.id);
    expect(ids.sort()).toEqual(expected.sort());
    expect(groups.every((group) => group.chapters.length > 0)).toBe(true);
    // eJPT is all beyond-blueprint, so it collapses to the single extension bucket; the
    // CCNA route keeps its official domain groups (plus the advanced-extension bucket).
    if (track === 'ejpt') expect(groups.map((group) => group.key)).toEqual(['extension']);
    else expect(groups.some((group) => group.domain !== undefined)).toBe(true);
  });
});
