/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Crosshair,
  ExternalLink,
  FlaskConical,
  ListChecks,
  RotateCcw,
  Route,
  Scale,
  Target
} from 'lucide-react';
import { useStore } from '../store';
import { uiMessages } from '../i18n';
import {
  ccnaDomainForChapter,
  certificationTrackForChapter,
  chapterCompletion,
  chaptersByCertificationTrack,
  chaptersForCertificationTrack,
  findChapter,
  manualStats,
  orderedChapters
} from '../lib/studyManual';
import { MANUAL_CERTIFICATION_TRACKS } from '../content/studyManual';
import type { GuidedLab, ManualCert, ManualCertificationTrack, ManualDifficulty } from '../content/studyManual';
import { securityReferenceUrl } from '../content/securityReferences';
import { preferredScrollBehavior } from '../lib/motion';
import ViewLink from './ViewLink';
import ManualConceptDiagram from './ManualConceptDiagram';

/**
 * VIS-10 — a coherent, non-textual sign for a chapter's certification route. The icon
 * shape distinguishes the three routes (not colour alone, WCAG 1.4.1); the colour reuses
 * the manual's AA-verified palettes (indigo for CCNA, amber for the Security+/advanced
 * extension) plus a rose accent added for eJPT, each remapped for the dark theme in
 * index.css. The route name is always exposed as text (an sr-only label in the tree, the
 * visible alignment copy in the header), so the mark is never colour- or icon-only.
 */
const TRACK_ICON: Record<ManualCertificationTrack, typeof Route> = {
  ccna: Route,
  ejpt: Crosshair
};
const TRACK_ICON_CLASS: Record<ManualCertificationTrack, string> = {
  ccna: 'text-indigo-700',
  ejpt: 'text-rose-700'
};

function TrackMark({
  track,
  srLabel,
  className
}: {
  track: ManualCertificationTrack;
  srLabel?: string;
  className?: string;
}) {
  const Icon = TRACK_ICON[track];
  return (
    <>
      <Icon
        data-track={track}
        className={`shrink-0 ${className ?? 'h-3.5 w-3.5'} ${TRACK_ICON_CLASS[track]}`}
        aria-hidden="true"
      />
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
    </>
  );
}

/**
 * UX-32 — a certification-route filter for the chapter index. A group of toggle buttons
 * (All / CCNA / eJPT / extension) with `aria-pressed`, each carrying the route icon in
 * the current text colour (so it stays legible on both the selected and idle surfaces)
 * and the route name as text. It reports the choice up; it never navigates.
 */
function TrackFilter({
  value,
  onChange,
  groupLabel,
  allLabel,
  trackLabels
}: {
  value: ManualCertificationTrack | 'all';
  onChange: (next: ManualCertificationTrack | 'all') => void;
  groupLabel: string;
  allLabel: string;
  trackLabels: Record<ManualCertificationTrack, string>;
}) {
  const options: { id: ManualCertificationTrack | 'all'; label: string; track?: ManualCertificationTrack }[] = [
    { id: 'all', label: allLabel },
    { id: 'ccna', label: trackLabels.ccna, track: 'ccna' },
    { id: 'ejpt', label: trackLabels.ejpt, track: 'ejpt' }
  ];
  return (
    <div role="group" aria-label={groupLabel} data-testid="manual-track-filter" className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = value === option.id;
        const Icon = option.track ? TRACK_ICON[option.track] : undefined;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              selected
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function StudyManualView() {
  const language = useStore((state) => state.language);
  const completedChapterIds = useStore((state) => state.completedChapterIds);
  const toggleChapterCompleted = useStore((state) => state.toggleChapterCompleted);
  const resetChapterProgress = useStore((state) => state.resetChapterProgress);
  const t = uiMessages(language).manual;
  const chapters = orderedChapters();
  // UX-32 — a certification-route filter that narrows the chapter index (tree + mobile
  // selector) without changing routing: it is view state, never a navigation, so deep
  // links, Back/Forward and the open chapter are untouched. The linear previous/next
  // flow and overall progress stay over the full chapter set.
  const [trackFilter, setTrackFilter] = useState<ManualCertificationTrack | 'all'>('all');
  // The index is grouped by the two study routes (Percorso CCNA, eJPT); the filter narrows
  // to one route. Grouping and filtering share the same binary model, so there is no third
  // "extension" bucket to reason about.
  const chapterGroups = chaptersByCertificationTrack().filter(
    (group) => trackFilter === 'all' || group.key === trackFilter
  );
  // The active chapter is addressable via the URL (`#/manual/<id>`, EDU-STRUCT-04): it
  // lives in the store so deep links, Back/Forward and in-page selection stay in sync.
  // A null id (the bare `#/manual` route) opens the first chapter.
  const activeChapterId = useStore((state) => state.activeChapterId);
  const setActiveChapter = useStore((state) => state.setActiveChapter);
  // The URL-addressed topic anchor (`#/manual/<id>/<topic>`, UX-29); null at chapter root.
  const urlTopicId = useStore((state) => state.activeTopicId);
  const setActiveTopic = useStore((state) => state.setActiveTopic);
  const chapter = (activeChapterId ? findChapter(activeChapterId) : undefined) ?? chapters[0];
  const stats = manualStats();
  const overallCompletion = chapterCompletion(chapters, completedChapterIds);
  // UX-33 — progress broken out per certification route (Percorso CCNA, eJPT) beside the
  // overall total, so a learner on a single objective sees that objective advance.
  const routeProgress = MANUAL_CERTIFICATION_TRACKS.map((route) => ({
    id: route.id,
    title: route.title,
    completion: chapterCompletion(chaptersForCertificationTrack(route.id), completedChapterIds)
  }));
  const headingId = useId();
  const chapterTitleId = useId();
  const chapterTitleRef = useRef<HTMLHeadingElement>(null);
  const chapterContextRef = useRef<HTMLDivElement>(null);
  const focusChapterTitleAfterChange = useRef(false);
  const mobileChapterSelectId = useId();
  const mobileTopicSelectId = useId();

  const difficultyLabel: Record<ManualDifficulty, string> = {
    intro: t.difficultyIntro,
    core: t.difficultyCore,
    advanced: t.difficultyAdvanced
  };
  const certLabel: Record<ManualCert, string> = {
    ccna: t.certCcna,
    securityplus: t.certSecurityPlus,
    both: t.certBoth,
    ejpt: t.certEjpt
  };
  // VIS-10 — short, stable route names for the track marks (sr-only labels, the header
  // chip) and the accessible-name prefix for a chapter row.
  const trackShort: Record<ManualCertificationTrack, string> = {
    ccna: t.trackCcnaShort,
    ejpt: t.trackEjptShort
  };
  const chapterTrack = certificationTrackForChapter(chapter);
  const chapterDomain = ccnaDomainForChapter(chapter);
  // The context line names where the chapter sits: its CCNA domain for a backbone chapter,
  // otherwise its certification source (Security+ or eJPT) — no separate "extension" label.
  const chapterAlignment =
    chapter.track === 'ccna' && chapterDomain
      ? `CCNA ${chapterDomain.number}.0 · ${chapterDomain.title[language]}`
      : certLabel[chapter.cert];
  const currentChapterCompleted = completedChapterIds.includes(chapter.id);

  // Linear study flow: the chapters immediately before and after the active one.
  const chapterIndex = chapters.findIndex((entry) => entry.id === chapter.id);
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : undefined;

  // Scroll-spy for the "On this page" rail: highlight the topic currently in view.
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(chapter.topics[0]?.id);
  const pendingTopicScroll = useRef<string | undefined>(undefined);
  const pendingTopicScrollRelease = useRef<number | undefined>(undefined);
  // The topic the view last scrolled to for the URL anchor, so a deep link scrolls once
  // while an in-page jump (which already scrolled) does not scroll a second time (UX-29).
  const lastAnchoredTopic = useRef<string | undefined>(undefined);
  // Derive the highlighted topic so a stale id from a previous chapter falls back to the
  // first topic without a synchronous setState on chapter change.
  const activeTopic = chapter.topics.some((topic) => topic.id === activeTopicId)
    ? activeTopicId
    : chapter.topics[0]?.id;
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    // The sections are stacked and tall, so intersection order is unreliable. On any
    // intersection change, recompute the active topic as the last one whose top has
    // scrolled above the sticky-header line — a robust scroll-spy independent of height.
    const recompute = () => {
      const context = chapterContextRef.current;
      const contextHeight = context?.getBoundingClientRect().height ?? 0;
      const stickyTop = context ? Number.parseFloat(window.getComputedStyle(context).top) : Number.NaN;
      const headerOffset = contextHeight > 0 && Number.isFinite(stickyTop) ? stickyTop + contextHeight + 8 : 160;
      const pendingId = pendingTopicScroll.current;
      if (pendingId) {
        const pendingElement = document.getElementById(`topic-${pendingId}`);
        if (pendingElement && Math.abs(pendingElement.getBoundingClientRect().top - headerOffset) > 2) {
          setActiveTopicId(pendingId);
          return;
        }
        pendingTopicScroll.current = undefined;
        window.clearTimeout(pendingTopicScrollRelease.current);
      }
      let current = chapter.topics[0]?.id;
      for (const topic of chapter.topics) {
        const element = document.getElementById(`topic-${topic.id}`);
        if (element && element.getBoundingClientRect().top <= headerOffset) current = topic.id;
      }
      if (current) setActiveTopicId(current);
    };
    const observer = new IntersectionObserver(recompute, { threshold: [0, 1] });
    for (const topic of chapter.topics) {
      const element = document.getElementById(`topic-${topic.id}`);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [chapter.id, chapter.topics]);

  useEffect(
    () => () => {
      window.clearTimeout(pendingTopicScrollRelease.current);
    },
    []
  );

  useEffect(() => {
    if (!focusChapterTitleAfterChange.current) return;
    focusChapterTitleAfterChange.current = false;
    chapterTitleRef.current?.focus({ preventScroll: true });
  }, [chapter.id]);

  const scrollToTopic = (topicId: string) => {
    window.clearTimeout(pendingTopicScrollRelease.current);
    pendingTopicScroll.current = topicId;
    // IntersectionObserver can fire before a smooth scroll reaches its target.
    // Keep the selected location stable during that transition, then hand control
    // back to the scroll-spy for subsequent manual scrolling.
    pendingTopicScrollRelease.current = window.setTimeout(() => {
      pendingTopicScroll.current = undefined;
    }, 1200);
    setActiveTopicId(topicId);
    lastAnchoredTopic.current = topicId;
    try {
      document
        .getElementById(`topic-${topicId}`)
        ?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
    } catch {
      // scrollIntoView is a no-op or unimplemented in some environments (e.g. jsdom); ignore.
    }
  };

  const jumpToTopic = (topicId: string) => {
    scrollToTopic(topicId);
    // Reflect the topic in the URL so the argument has a shareable anchor (UX-29).
    setActiveTopic(topicId);
  };

  // A deep link (or Back/Forward) that carries a topic scrolls to it once the chapter is
  // rendered; an in-page jump already scrolled, so `lastAnchoredTopic` suppresses a repeat.
  // The scroll runs on the next frame so the state update stays out of the effect body.
  useEffect(() => {
    if (!urlTopicId || urlTopicId === lastAnchoredTopic.current) return;
    if (!chapter.topics.some((topic) => topic.id === urlTopicId)) return;
    const topicId = urlTopicId;
    lastAnchoredTopic.current = topicId;
    const frame = requestAnimationFrame(() => scrollToTopic(topicId));
    return () => cancelAnimationFrame(frame);
  }, [urlTopicId, chapter.id, chapter.topics]);

  const selectChapter = (id: string) => {
    if (id === chapter.id) return;
    window.clearTimeout(pendingTopicScrollRelease.current);
    pendingTopicScroll.current = undefined;
    focusChapterTitleAfterChange.current = true;
    // Update the URL-backed store; the router reflects it to `#/manual/<id>`.
    setActiveChapter(id);
    try {
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    } catch {
      // window.scrollTo is unimplemented in some environments (e.g. jsdom); ignore.
    }
  };

  // A chapter card for the index grid (the chapter chooser that replaced the left tree):
  // a large, tappable card with a number/checkmark badge, title, summary and topic count.
  // It is a real link (deep-links to `#/manual/<id>`) so copy/open-in-new-tab work, and it
  // focuses the chapter title on arrival. The stable test id lets specs target chapters.
  const renderChapterCard = (entry: (typeof chapters)[number]) => {
    const isCompleted = completedChapterIds.includes(entry.id);
    const entryDomain = ccnaDomainForChapter(entry);
    return (
      <li key={entry.id}>
        <ViewLink
          view="manual"
          chapterId={entry.id}
          data-testid="manual-chapter-link"
          onClick={() => {
            focusChapterTitleAfterChange.current = true;
          }}
          className="group flex h-full min-h-11 flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="flex items-start justify-between gap-2">
            <span
              aria-hidden="true"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold ${
                isCompleted ? 'bg-emerald-600 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : entry.order}
            </span>
            {entryDomain ? (
              <span
                className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white"
                aria-label={`${t.examWeight}: ${entryDomain.weight}%`}
              >
                {entryDomain.weight}%
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-indigo-800">
              {entry.order}. {entry.title[language]}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-500">{entry.summary[language]}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
            <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
            {entry.topics.length} {t.topics}
            {isCompleted ? <span className="text-emerald-600"> · {t.completedChapter}</span> : null}
          </div>
        </ViewLink>
      </li>
    );
  };

  const renderGuidedLab = (lab: GuidedLab) => (
    <div
      key={lab.id}
      data-manual-tile="guided-lab"
      className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <FlaskConical aria-hidden="true" className="h-4 w-4 text-indigo-600" />
        <span className="eyebrow text-indigo-700">{t.guidedLab}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">
          {difficultyLabel[lab.difficulty]}
        </span>
      </div>
      <h4 className="mt-3 text-base font-semibold leading-6 text-slate-900">{lab.title[language]}</h4>

      <p className="manual-support-copy mt-2 text-slate-600">
        <span className="font-semibold text-slate-700">{t.scenario}: </span>
        {lab.scenario[language]}
      </p>
      <p className="manual-support-copy mt-2 text-slate-700">
        <span className="font-semibold">{t.task}: </span>
        {lab.task[language]}
      </p>

      <p className="mt-3 eyebrow">{t.steps}</p>
      <ol className="manual-support-copy mt-2 list-decimal space-y-1.5 pl-5 text-slate-600">
        {lab.steps.map((step, i) => (
          <li key={`${lab.id}-step-${i}`}>{step[language]}</li>
        ))}
      </ol>

      <p className="manual-support-copy mt-3 text-slate-700">
        <span className="font-semibold">{t.challenge}: </span>
        {lab.challenge[language]}
      </p>

      <details className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium leading-6 text-indigo-700">
          {t.showSolution}
        </summary>
        <p className="mt-2 eyebrow">{t.solution}</p>
        <ol className="manual-support-copy mt-2 list-decimal space-y-1.5 pl-5 text-slate-600">
          {lab.solution.map((line, i) => (
            <li key={`${lab.id}-sol-${i}`}>{line[language]}</li>
          ))}
        </ol>
      </details>

      <div className="mt-3 flex items-start gap-1.5">
        <ListChecks aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div>
          <span className="eyebrow">{t.selfCheck}</span>
          <ul className="manual-support-copy mt-2 list-disc space-y-1.5 pl-5 text-slate-600">
            {lab.selfCheck.map((check, i) => (
              <li key={`${lab.id}-check-${i}`}>{check[language]}</li>
            ))}
          </ul>
        </div>
      </div>

      <ViewLink
        view={lab.lab}
        data-manual-action="guided-exercise"
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <FlaskConical aria-hidden="true" className="h-4 w-4 shrink-0" />
        {t.doGuidedExercise}
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </ViewLink>
    </div>
  );

  return (
    <div data-manual-root className="mx-auto max-w-7xl">
      <header className="mb-6">
        <h1 id={headingId} className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          {t.heading}
        </h1>
        <p className="mt-1.5 text-[15px] text-slate-500">{t.intro}</p>
        {/* A single, compact meta row: the dataset counts, the overall progress and the
            per-route progress sit on one wrapping line instead of four stacked blocks, so
            the reading pane starts higher. Every text node and aria-label is unchanged
            (UX-33: each route keeps its icon + full accessible label). */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
          <span className="font-medium text-slate-600">
            {stats.chapters} {t.chapters} · {stats.topics} {t.topics} · {stats.guidedLabs} {t.guidedLabs}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <span
            className="font-medium text-slate-600"
            aria-label={`${t.chapterProgress}: ${overallCompletion.completed}/${overallCompletion.total}`}
          >
            {t.chapterProgress}: {overallCompletion.completed}/{overallCompletion.total} ({overallCompletion.percent}%)
          </span>
          <ul aria-label={t.progressByRoute} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {routeProgress.map((route) => (
              <li
                key={route.id}
                className="inline-flex items-center gap-1.5"
                aria-label={`${route.title[language]} · ${t.chapterProgress}: ${route.completion.completed}/${route.completion.total} (${route.completion.percent}%)`}
              >
                <TrackMark track={route.id} className="h-3.5 w-3.5" />
                <span aria-hidden="true">
                  {route.title[language]} {route.completion.completed}/{route.completion.total}
                </span>
              </li>
            ))}
          </ul>
          {overallCompletion.completed > 0 ? (
            <button
              type="button"
              onClick={resetChapterProgress}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              {t.resetProgress}
            </button>
          ) : null}
          <span className="w-full text-[11px] text-slate-400">{t.progressStoredLocally}</span>
        </div>
      </header>

      {activeChapterId ? (
        <div className="min-w-0">
          {/* The reader is full width — no chapter tree. The card index (the default
              `#/manual` landing) is the chapter chooser, reached again from this link. */}
          <div className="mb-5">
            <ViewLink
              view="manual"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              {t.backToIndex}
            </ViewLink>
          </div>
          {/* Persistent context for long chapters. It deliberately uses plain text,
          not headings, so the document outline remains one h1 followed by the
          chapter h2 and topic h3 elements. 3.5rem equals the single fixed app top
          bar immediately above the content column (IA-13). */}
          <div
            ref={chapterContextRef}
            role="region"
            aria-label={t.chapterContext}
            data-testid="chapter-context"
            className="sticky top-14 z-30 -mx-4 mb-5 border-y border-slate-200/80 bg-canvas/95 px-4 py-2 shadow-sm backdrop-blur-md md:-mx-6 md:px-6 lg:mx-0 lg:rounded-lg lg:border"
          >
            <div className="hidden min-w-0 lg:flex lg:items-center lg:gap-2">
              <TrackMark track={chapterTrack} className="h-3.5 w-3.5" />
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                {chapterAlignment}
              </span>
              <span aria-hidden="true" className="text-slate-300">
                /
              </span>
              <span className="truncate text-[13px] font-semibold text-slate-800" title={chapter.title[language]}>
                {chapter.title[language]}
              </span>
            </div>

            <nav aria-label={t.mobileChapterNav} data-testid="mobile-manual-toolbar" className="space-y-2 lg:hidden">
              <div className="flex min-w-0 items-center gap-2">
                <label htmlFor={mobileChapterSelectId} className="sr-only">
                  {t.chapterSelector}
                </label>
                <select
                  id={mobileChapterSelectId}
                  value={chapter.id}
                  onChange={(event) => selectChapter(event.target.value)}
                  className="min-h-11 min-w-0 flex-1 truncate rounded-lg border border-slate-300 bg-white px-3 pr-8 text-[13px] font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {/* UX-32: when a filter hides the open chapter, keep a matching (hidden)
                    option so the controlled select stays valid and routing is preserved. */}
                  {chapterGroups.every((group) => group.chapters.every((entry) => entry.id !== chapter.id)) ? (
                    <option value={chapter.id} hidden>
                      {chapter.order}. {chapter.title[language]}
                    </option>
                  ) : null}
                  {chapterGroups.map((group) => {
                    const groupLabel = group.title[language];
                    const groupCompletion = chapterCompletion(group.chapters, completedChapterIds);
                    return (
                      <optgroup
                        key={`mobile-${group.key}`}
                        label={`${groupLabel} · ${groupCompletion.completed}/${groupCompletion.total}`}
                      >
                        {group.chapters.map((entry) => (
                          <option key={`mobile-${entry.id}`} value={entry.id}>
                            {completedChapterIds.includes(entry.id) ? '✓ ' : ''}
                            {entry.order}. {entry.title[language]}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <span
                  aria-label={`${t.chapterProgress}: ${overallCompletion.completed}/${overallCompletion.total} (${overallCompletion.percent}%)`}
                  className="inline-flex h-11 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700"
                >
                  <CircleCheck aria-hidden="true" className="h-3.5 w-3.5 text-emerald-700" />
                  {overallCompletion.completed}/{overallCompletion.total}
                </span>
              </div>

              {chapter.topics.length > 1 ? (
                <div>
                  {/* UX-45c: the per-topic quick jump is a native select, not a
                    horizontally-scrolling chip strip. A dropdown needs no sideways
                    swipe (the strip was unreadable and hard to scroll on a phone), keeps
                    the sticky toolbar short, and stays one tap from every topic. */}
                  <label htmlFor={mobileTopicSelectId} className="sr-only">
                    {t.topicSelector}
                  </label>
                  <select
                    id={mobileTopicSelectId}
                    data-testid="mobile-topic-index"
                    value={activeTopic ?? ''}
                    onChange={(event) => jumpToTopic(event.target.value)}
                    className="min-h-11 w-full truncate rounded-lg border border-slate-300 bg-white px-3 pr-8 text-[13px] font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    {/* Until a topic is anchored the field shows the table-of-contents label
                      as a disabled placeholder, so the control reads as "jump to a topic". */}
                    {activeTopic ? null : (
                      <option value="" disabled>
                        {t.tableOfContents}
                      </option>
                    )}
                    {chapter.topics.map((topic, i) => (
                      <option key={`mobile-topic-${topic.id}`} value={topic.id}>
                        {i + 1}. {topic.title[language]}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </nav>
          </div>

          {/* The "on this page" rail is a third column, so it only appears from xl up.
          Between lg and xl the sidebar + reading pane already fill the width, and a
          third 13rem column would squeeze the reading measure; there the reading pane
          spans the full main area and the persistent topic index covers navigation. */}
          <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-8">
            {/* Keep the desktop topic navigation before the article in DOM/focus order.
            Explicit grid coordinates retain the visual content-left/rail-right layout. */}
            {chapter.topics.length > 1 ? (
              <aside className="hidden xl:col-start-2 xl:row-start-1 xl:block">
                <nav aria-label={t.onThisPage} className="sticky top-20">
                  <p className="flex items-center gap-1.5 eyebrow text-slate-400">
                    <ListChecks aria-hidden="true" className="h-3.5 w-3.5" />
                    {t.onThisPage}
                  </p>
                  <ol className="mt-2 space-y-1 border-l border-slate-200">
                    {chapter.topics.map((topic, i) => {
                      const isActive = activeTopic === topic.id;
                      return (
                        <li key={`rail-${topic.id}`}>
                          <button
                            type="button"
                            onClick={() => jumpToTopic(topic.id)}
                            aria-current={isActive ? 'location' : undefined}
                            className={`-ml-px block border-l-2 py-1 pl-3 text-left text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                              isActive
                                ? 'border-indigo-500 font-semibold text-indigo-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {i + 1}. {topic.title[language]}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              </aside>
            ) : null}

            <article
              aria-labelledby={chapterTitleId}
              data-testid="manual-reading-column"
              className="manual-reading-column min-w-0 space-y-6 xl:col-start-1 xl:row-start-1"
            >
              {/* Chapter overview card: alignment, title, summary and an in-chapter table of contents. */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <TrackMark track={chapterTrack} className="h-3.5 w-3.5" />
                      <span className="eyebrow text-indigo-700">{chapterAlignment}</span>
                    </span>
                    <h2
                      ref={chapterTitleRef}
                      id={chapterTitleId}
                      tabIndex={-1}
                      className="mt-1 text-xl font-semibold text-slate-900"
                    >
                      {chapter.title[language]}
                    </h2>
                    {chapterIndex >= 0 ? (
                      <p className="mt-1 text-[12px] font-medium text-slate-400">
                        {language === 'it'
                          ? `Capitolo ${chapterIndex + 1} di ${chapters.length}`
                          : `Chapter ${chapterIndex + 1} of ${chapters.length}`}
                      </p>
                    ) : null}
                  </div>
                  {(() => {
                    return chapterDomain ? (
                      <span
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                        title={`${t.examWeight}: ${chapterDomain.weight}%`}
                        aria-label={`${t.examWeight}: ${chapterDomain.weight}%`}
                      >
                        <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                        {chapterDomain.weight}%
                      </span>
                    ) : chapterTrack === 'ejpt' ? (
                      // eJPT is a distinct route — a rose chip with the offensive crosshair.
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                        <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.trackEjptShort}
                      </span>
                    ) : (
                      // A CCNA-route advanced chapter (no single exam domain): the route chip.
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
                        <Route className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.trackCcnaShort}
                      </span>
                    );
                  })()}
                </div>
                <p className="manual-reading-copy mt-3 text-slate-600">{chapter.summary[language]}</p>

                <button
                  type="button"
                  aria-pressed={currentChapterCompleted}
                  onClick={() => toggleChapterCompleted(chapter.id)}
                  className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    currentChapterCompleted
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  <CircleCheck aria-hidden="true" className="h-4 w-4" />
                  {currentChapterCompleted ? t.markChapterIncomplete : t.markChapterComplete}
                </button>
              </div>

              {/* One card per topic so each is a bounded, scannable chunk. */}
              {chapter.topics.map((topic, idx) => (
                <section
                  key={topic.id}
                  id={`topic-${topic.id}`}
                  aria-labelledby={`topic-h-${topic.id}`}
                  data-manual-topic={topic.id}
                  className="scroll-mt-[13.5rem] rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm md:p-6 lg:scroll-mt-40"
                >
                  <h3 id={`topic-h-${topic.id}`} className="text-lg font-semibold leading-7 text-slate-900">
                    {idx + 1}. {topic.title[language]}
                  </h3>

                  <div
                    data-manual-tile="objectives"
                    className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4"
                  >
                    <h4 className="flex items-center gap-1.5 eyebrow text-indigo-700">
                      <Target aria-hidden="true" className="h-3.5 w-3.5" />
                      {t.objectives}
                    </h4>
                    <ul className="manual-support-copy mt-2 list-disc space-y-1.5 pl-5 text-slate-700">
                      {topic.objectives.map((o, i) => (
                        <li key={`${topic.id}-obj-${i}`}>{o[language]}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="eyebrow text-slate-400">{t.prerequisites}</h4>
                    <ul className="manual-support-copy mt-2 list-disc space-y-1.5 pl-5 text-slate-500">
                      {topic.prerequisites.map((p, i) => (
                        <li key={`${topic.id}-pre-${i}`}>{p[language]}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5">
                    <h4 className="flex items-center gap-1.5 eyebrow text-slate-500">
                      <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
                      {t.explanation}
                    </h4>
                    <div data-manual-copy="theory" className="manual-reading-copy mt-2 space-y-4 text-slate-700">
                      {topic.theory.map((para, i) => (
                        <p key={`${topic.id}-th-${i}`}>{para[language]}</p>
                      ))}
                    </div>
                  </div>

                  {topic.diagram ? <ManualConceptDiagram id={topic.diagram} language={language} /> : null}

                  {topic.example ? (
                    <div
                      data-manual-tile="example"
                      className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4"
                    >
                      <h4 className="flex items-center gap-1.5 eyebrow text-emerald-700">
                        <FlaskConical aria-hidden="true" className="h-3.5 w-3.5" />
                        {t.example}
                      </h4>
                      <p className="manual-support-copy mt-2 text-emerald-950">{topic.example[language]}</p>
                    </div>
                  ) : null}

                  <div
                    data-manual-tile="common-mistakes"
                    className="mt-4 rounded-lg border border-amber-100 bg-amber-50/50 p-4"
                  >
                    <h4 className="flex items-center gap-1.5 eyebrow text-amber-700">
                      <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
                      {t.commonMistakes}
                    </h4>
                    <ul className="manual-support-copy mt-2 list-disc space-y-1.5 pl-5 text-amber-950">
                      {topic.commonMistakes.map((m, i) => (
                        <li key={`${topic.id}-mis-${i}`}>{m[language]}</li>
                      ))}
                    </ul>
                  </div>

                  {topic.references && topic.references.length > 0 ? (
                    <p className="manual-support-copy mt-4 text-slate-500">
                      <span className="eyebrow">{t.references}: </span>
                      {topic.references.map((ref, i) => (
                        <span key={`${topic.id}-ref-${i}`}>
                          {i > 0 ? ', ' : ''}
                          <a
                            href={securityReferenceUrl(ref)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-indigo-600 hover:underline"
                          >
                            {ref.id}
                            <ExternalLink aria-hidden="true" className="h-3 w-3" />
                          </a>
                        </span>
                      ))}
                    </p>
                  ) : null}

                  {/* Practical path first: the guided exercise is the primary call to
                  action (solid, labelled «Fai l'esercizio guidato»), with the lighter
                  «Studia nel laboratorio» offered afterwards as optional free exploration. */}
                  {topic.guidedLabs?.map(renderGuidedLab)}

                  {topic.lab ? (
                    <ViewLink
                      view={topic.lab}
                      data-manual-action="study-lab"
                      className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      {t.studyInLab}
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </ViewLink>
                  ) : null}
                </section>
              ))}

              {/* Linear study flow: move to the previous or next chapter. */}
              {previousChapter || nextChapter ? (
                <nav
                  aria-label={t.chapterStepNav}
                  className="flex flex-col gap-2 border-t border-slate-200/70 pt-4 sm:flex-row sm:justify-between"
                >
                  {previousChapter ? (
                    <button
                      type="button"
                      onClick={() => selectChapter(previousChapter.id)}
                      className="group inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[13px] text-slate-600 transition-colors hover:text-slate-900"
                    >
                      <ArrowLeft
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600"
                      />
                      <span>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {t.previousChapter}
                        </span>
                        <span className="font-medium">
                          {previousChapter.order}. {previousChapter.title[language]}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  {nextChapter ? (
                    <button
                      type="button"
                      onClick={() => selectChapter(nextChapter.id)}
                      className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-[13px] text-slate-600 transition-colors hover:text-slate-900 sm:text-right"
                    >
                      <span className="sm:text-right">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {t.nextChapter}
                        </span>
                        <span className="font-medium">
                          {nextChapter.order}. {nextChapter.title[language]}
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600"
                      />
                    </button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                </nav>
              ) : null}
            </article>
          </div>
        </div>
      ) : (
        <div className="min-w-0">
          {chapters.length > 1 ? (
            <div className="mb-6">
              <TrackFilter
                value={trackFilter}
                onChange={setTrackFilter}
                groupLabel={t.trackFilterLabel}
                allLabel={t.trackFilterAll}
                trackLabels={trackShort}
              />
            </div>
          ) : null}
          <nav aria-label={t.chapterNav} className="space-y-10">
            {chapterGroups.map((group) => {
              const groupLabel = group.title[language];
              const groupCompletion = chapterCompletion(group.chapters, completedChapterIds);
              return (
                <section key={group.key} role="group" aria-label={groupLabel}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <TrackMark track={group.key} className="h-5 w-5" />
                      <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900">{groupLabel}</h2>
                    </div>
                    <span
                      className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-500"
                      aria-label={`${groupLabel} · ${t.chapterProgress}: ${groupCompletion.completed}/${groupCompletion.total}`}
                    >
                      {groupCompletion.completed}/{groupCompletion.total}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.chapters.map(renderChapterCard)}
                  </ul>
                </section>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
