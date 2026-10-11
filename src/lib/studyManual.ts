/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { CCNA_DOMAINS, type CcnaDomain } from '../content/ccna';
import { STUDY_MANUAL, type GuidedLab, type ManualChapter } from '../content/studyManual';

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
