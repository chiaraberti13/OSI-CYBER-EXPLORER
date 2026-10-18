/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { CCNA_DOMAINS, type CcnaDomain } from '../content/ccna';
import {
  MANUAL_CERTIFICATION_TRACKS,
  type GuidedLab,
  type ManualCertificationTrack,
  type ManualChapter
} from '../content/studyManual';
import { STUDY_MANUAL } from '../content/studyManualSupplement';
import type { Bilingual } from '../types';
import type { AppView } from '../store';

/**
 * Pure, side-effect-free selectors over the study manual. Keeping them here (rather
 * than inline in the view) makes the manual's shape testable without a DOM and keeps
 * the component focused on rendering.
 */

/** Comparator that sorts chapters by their study order. Exported so it stays tested
 *  independently of how many chapters the dataset currently holds. */
export function byChapterOrder(a: ManualChapter, b: ManualChapter): number {
  return a.order - b.order;
}

/** Chapters in study order, regardless of their declaration order in the dataset. */
export function orderedChapters(): ManualChapter[] {
  return [...STUDY_MANUAL].sort(byChapterOrder);
}

/** The chapter with this id, or undefined. */
export function findChapter(id: string): ManualChapter | undefined {
  return STUDY_MANUAL.find((chapter) => chapter.id === id);
}

/**
 * The CCNA 200-301 v1.1 domain a chapter maps to, or undefined for an extension chapter
 * (or a CCNA chapter whose domain id does not resolve — a case the content tests reject).
 */
export function ccnaDomainForChapter(chapter: ManualChapter): CcnaDomain | undefined {
  return chapter.domain ? CCNA_DOMAINS.find((domain) => domain.id === chapter.domain) : undefined;
}

/**
 * Primary route derived from existing metadata, without a second field that can drift.
 * `track` describes CCNA blueprint alignment; eJPT is outside that blueprint but is
 * its own study route. `both` remains CCNA + Security+, never CCNA + eJPT.
 */
export function certificationTrackForChapter(chapter: ManualChapter): ManualCertificationTrack {
  // Binary routes: the offensive eJPT chapters, or the CCNA route (its 200-301 backbone
  // plus the Security+/advanced defensive extension, which study together as one path).
  return chapter.cert === 'ejpt' ? 'ejpt' : 'ccna';
}

/** Chapters in one primary certification route, in study order. */
export function chaptersForCertificationTrack(track: ManualCertificationTrack): ManualChapter[] {
  return orderedChapters().filter((chapter) => certificationTrackForChapter(chapter) === track);
}

export interface ManualCertificationGroup {
  key: ManualCertificationTrack;
  title: Bilingual;
  chapters: ManualChapter[];
}

/** Disjoint primary routes in catalog order; empty groups are omitted. */
export function chaptersByCertificationTrack(): ManualCertificationGroup[] {
  return MANUAL_CERTIFICATION_TRACKS.map(({ id, title }) => ({
    key: id,
    title,
    chapters: chaptersForCertificationTrack(id)
  })).filter((group) => group.chapters.length > 0);
}

/** A navigation group: one CCNA domain (or the declared-extension bucket) with its chapters. */
export interface ManualDomainGroup {
  /** The CCNA_DOMAINS id, or 'extension' for the declared-extension bucket. */
  key: string;
  /** The domain, or undefined for the extension bucket. */
  domain?: CcnaDomain;
  /** The group's chapters, in study order. */
  chapters: ManualChapter[];
}

export interface ChapterCompletion {
  completed: number;
  total: number;
  percent: number;
}

/** Safe aggregate for a chapter collection. Unknown stored ids never count. */
export function chapterCompletion(
  chapters: readonly ManualChapter[],
  completedChapterIds: readonly string[]
): ChapterCompletion {
  const completedIds = new Set(completedChapterIds);
  const completed = chapters.filter((chapter) => completedIds.has(chapter.id)).length;
  const total = chapters.length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

/**
 * Chapters grouped by CCNA domain for the manual's domain → chapter navigation. CCNA
 * domains come first in official number order, each with its chapters in study order;
 * the declared extensions follow in a final `extension` group. Empty groups are dropped.
 * An optional primary route narrows the index before grouping, without changing the
 * existing no-argument navigation or confusing eJPT with an official CCNA domain.
 */
export function chaptersByDomain(certificationTrack?: ManualCertificationTrack): ManualDomainGroup[] {
  const ordered = certificationTrack ? chaptersForCertificationTrack(certificationTrack) : orderedChapters();
  const groups: ManualDomainGroup[] = [];
  for (const domain of [...CCNA_DOMAINS].sort((a, b) => a.number - b.number)) {
    const chapters = ordered.filter((chapter) => chapter.track === 'ccna' && chapter.domain === domain.id);
    if (chapters.length > 0) groups.push({ key: domain.id, domain, chapters });
  }
  const extensions = ordered.filter((chapter) => chapter.track === 'extension');
  if (extensions.length > 0) groups.push({ key: 'extension', chapters: extensions });
  return groups;
}

/**
 * The manual chapters whose theory a given interactive lab lets the student practise, in
 * study order. A chapter qualifies when one of its topics studies the lab directly
 * (`topic.lab`) or sets a guided exercise in it (`guidedLab.lab`). This reverse map is
 * derived from the manual data — the single source of truth — so a lab's "theory lives in
 * the manual" link (EDU-STRUCT-05) can never drift from the topics that actually cite it.
 */
export function chaptersForLab(lab: AppView): ManualChapter[] {
  return orderedChapters().filter((chapter) =>
    chapter.topics.some((topic) => topic.lab === lab || (topic.guidedLabs ?? []).some((guided) => guided.lab === lab))
  );
}

/** Every guided lab across the manual, in study order. */
export function allGuidedLabs(): GuidedLab[] {
  return orderedChapters().flatMap((chapter) => chapter.topics.flatMap((topic) => topic.guidedLabs ?? []));
}

/** Headline counts for the manual overview. */
export function manualStats(): { chapters: number; topics: number; guidedLabs: number } {
  const chapters = STUDY_MANUAL.length;
  const topics = STUDY_MANUAL.reduce((sum, chapter) => sum + chapter.topics.length, 0);
  const guidedLabs = allGuidedLabs().length;
  return { chapters, topics, guidedLabs };
}
