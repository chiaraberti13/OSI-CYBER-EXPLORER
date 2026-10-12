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
  CircleCheck,
  CircleHelp,
  ExternalLink,
  FlaskConical,
  ListChecks,
  RotateCcw,
  Target
} from 'lucide-react';
import { useStore } from '../store';
import { uiMessages } from '../i18n';
import {
  ccnaDomainForChapter,
  chapterCompletion,
  chaptersByDomain,
  findChapter,
  manualStats,
  orderedChapters
} from '../lib/studyManual';
import type { GuidedLab, ManualCert, ManualDifficulty } from '../content/studyManual';
import { securityReferenceUrl } from '../content/securityReferences';
import { preferredScrollBehavior } from '../lib/motion';
import ViewLink from './ViewLink';

export default function StudyManualView() {
  const language = useStore((state) => state.language);
  const completedChapterIds = useStore((state) => state.completedChapterIds);
  const toggleChapterCompleted = useStore((state) => state.toggleChapterCompleted);
  const resetChapterProgress = useStore((state) => state.resetChapterProgress);
  const hasDismissedManualHelp = useStore((state) => state.hasDismissedManualHelp);
  const setHasDismissedManualHelp = useStore((state) => state.setHasDismissedManualHelp);
  const [isHelpOpen, setIsHelpOpen] = useState(!hasDismissedManualHelp);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const helpPanelId = useId();
  const helpTitleId = useId();
  const t = uiMessages(language).manual;
  const chapters = orderedChapters();
  const chapterGroups = chaptersByDomain();
  const [activeId, setActiveId] = useState(chapters[0]?.id);
  const chapter = findChapter(activeId) ?? chapters[0];
  const stats = manualStats();
  const overallCompletion = chapterCompletion(chapters, completedChapterIds);
  const headingId = useId();
  const chapterTitleId = useId();
  const chapterTitleRef = useRef<HTMLHeadingElement>(null);
  const chapterContextRef = useRef<HTMLDivElement>(null);
  const focusChapterTitleAfterChange = useRef(false);
  const mobileChapterSelectId = useId();

  const dismissHelp = () => {
    setHasDismissedManualHelp(true);
    setIsHelpOpen(false);
    // Closing removes the focused control from view; return to the disclosure.
    helpTriggerRef.current?.focus();
  };

  const difficultyLabel: Record<ManualDifficulty, string> = {
    intro: t.difficultyIntro,
    core: t.difficultyCore,
    advanced: t.difficultyAdvanced
  };
  const certLabel: Record<ManualCert, string> = {
    ccna: t.certCcna,
    securityplus: t.certSecurityPlus,
    both: t.certBoth
  };
  const chapterDomain = ccnaDomainForChapter(chapter);
  const chapterAlignment =
    chapter.track === 'ccna' && chapterDomain
      ? `CCNA ${chapterDomain.number}.0 · ${chapterDomain.title[language]}`
      : `${t.trackExtension} · ${certLabel[chapter.cert]}`;
  const currentChapterCompleted = completedChapterIds.includes(chapter.id);

  // Linear study flow: the chapters immediately before and after the active one.
  const chapterIndex = chapters.findIndex((entry) => entry.id === chapter.id);
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : undefined;

  // Scroll-spy for the "On this page" rail: highlight the topic currently in view.
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(chapter.topics[0]?.id);
  const pendingTopicScroll = useRef<string | undefined>(undefined);
  const pendingTopicScrollRelease = useRef<number | undefined>(undefined);
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

  const jumpToTopic = (topicId: string) => {
    window.clearTimeout(pendingTopicScrollRelease.current);
    pendingTopicScroll.current = topicId;
    // IntersectionObserver can fire before a smooth scroll reaches its target.
    // Keep the selected location stable during that transition, then hand control
    // back to the scroll-spy for subsequent manual scrolling.
    pendingTopicScrollRelease.current = window.setTimeout(() => {
      pendingTopicScroll.current = undefined;
    }, 1200);
    setActiveTopicId(topicId);
    try {
      document
        .getElementById(`topic-${topicId}`)
        ?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
    } catch {
      // scrollIntoView is a no-op or unimplemented in some environments (e.g. jsdom); ignore.
    }
  };

  const selectChapter = (id: string) => {
    if (id === chapter.id) return;
    window.clearTimeout(pendingTopicScrollRelease.current);
    pendingTopicScroll.current = undefined;
    focusChapterTitleAfterChange.current = true;
    setActiveId(id);
    try {
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    } catch {
      // window.scrollTo is unimplemented in some environments (e.g. jsdom); ignore.
    }
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
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 id={headingId} className="text-xl font-semibold tracking-tight text-slate-900">
            {t.heading}
          </h1>
          <button
            ref={helpTriggerRef}
            type="button"
            aria-expanded={isHelpOpen}
            aria-controls={helpPanelId}
            onClick={() => (isHelpOpen ? dismissHelp() : setIsHelpOpen(true))}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <CircleHelp aria-hidden="true" className="h-4 w-4 shrink-0" />
            {t.helpTitle}
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">{t.intro}</p>
        <p className="mt-2 text-[12px] font-mono text-slate-400">
          {stats.chapters} {t.chapters} · {stats.topics} {t.topics} · {stats.guidedLabs} {t.guidedLabs}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600">
          <span aria-label={`${t.chapterProgress}: ${overallCompletion.completed}/${overallCompletion.total}`}>
            {t.chapterProgress}: {overallCompletion.completed}/{overallCompletion.total} ({overallCompletion.percent}%)
          </span>
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
          <span className="basis-full text-[11px] text-slate-500">{t.progressStoredLocally}</span>
        </div>
      </header>

      <section
        id={helpPanelId}
        aria-labelledby={helpTitleId}
        hidden={!isHelpOpen}
        className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 md:p-5"
      >
        <h2 id={helpTitleId} className="text-base font-semibold text-indigo-900">
          {t.helpTitle}
        </h2>
        <ol className="mt-3 grid gap-4 md:grid-cols-3">
          {[
            { icon: ListChecks, title: t.helpNavigationTitle, body: t.helpNavigationBody },
            { icon: FlaskConical, title: t.helpLabsTitle, body: t.helpLabsBody },
            { icon: ArrowRight, title: t.helpChaptersTitle, body: t.helpChaptersBody }
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="min-w-0 text-sm leading-relaxed text-slate-700">
              <p className="mb-1 flex items-center gap-2 font-semibold text-indigo-900">
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {title}
              </p>
              <p>{body}</p>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={dismissHelp}
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          {t.dismissHelp}
        </button>
      </section>

      {chapters.length > 1 ? (
        <nav aria-label={t.chapterNav} className="mb-6 hidden space-y-3 lg:block">
          {chapterGroups.map((group) => {
            const groupLabel = group.domain
              ? `CCNA ${group.domain.number}.0 · ${group.domain.title[language]}`
              : t.trackExtension;
            const groupCompletion = chapterCompletion(group.chapters, completedChapterIds);
            return (
              <div key={group.key} role="group" aria-label={groupLabel}>
                <p className="eyebrow mb-1.5">
                  {groupLabel} · {groupCompletion.completed}/{groupCompletion.total}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.chapters.map((entry) => {
                    const isActive = entry.id === chapter.id;
                    const isCompleted = completedChapterIds.includes(entry.id);
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => selectChapter(entry.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'border-slate-300 bg-white text-slate-900'
                            : 'border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-800'
                        }`}
                      >
                        {isCompleted ? (
                          <CircleCheck aria-hidden="true" className="h-3.5 w-3.5 text-emerald-700" />
                        ) : null}
                        {entry.order}. {entry.title[language]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      ) : null}

      {/* Persistent context for long chapters. It deliberately uses plain text,
          not headings, so the document outline remains one h1 followed by the
          chapter h2 and topic h3 elements. 6.5rem equals the fixed 3.5rem app
          header plus the 3rem lab navigation immediately above it. */}
      <div
        ref={chapterContextRef}
        role="region"
        aria-label={t.chapterContext}
        data-testid="chapter-context"
        className="sticky top-[6.5rem] z-30 -mx-4 mb-5 border-y border-slate-200/80 bg-canvas/95 px-4 py-2 shadow-sm backdrop-blur-md md:-mx-6 md:px-6 lg:mx-0 lg:rounded-lg lg:border"
      >
        <div className="hidden min-w-0 lg:flex lg:items-baseline lg:gap-2">
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
              {chapterGroups.map((group) => {
                const groupLabel = group.domain
                  ? `CCNA ${group.domain.number}.0 · ${group.domain.title[language]}`
                  : t.trackExtension;
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
              <p className="sr-only">{t.tableOfContents}</p>
              <ol
                data-testid="mobile-topic-index"
                className="-mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
              >
                {chapter.topics.map((topic, i) => {
                  const isActive = activeTopic === topic.id;
                  return (
                    <li key={`mobile-topic-${topic.id}`} className="shrink-0 snap-start">
                      <button
                        type="button"
                        onClick={() => jumpToTopic(topic.id)}
                        aria-current={isActive ? 'location' : undefined}
                        className={`inline-flex min-h-11 items-center rounded-full border px-3 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                          isActive
                            ? 'border-indigo-300 bg-indigo-50 font-semibold text-indigo-800'
                            : 'border-slate-200 bg-white font-medium text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {i + 1}. {topic.title[language]}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
        </nav>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-8">
        {/* Keep the desktop topic navigation before the article in DOM/focus order.
            Explicit grid coordinates retain the visual content-left/rail-right layout. */}
        {chapter.topics.length > 1 ? (
          <aside className="hidden lg:col-start-2 lg:row-start-1 lg:block">
            <nav aria-label={t.onThisPage} className="sticky top-32">
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
          className="manual-reading-column min-w-0 space-y-6 lg:col-start-1 lg:row-start-1"
        >
          {/* Chapter overview card: alignment, title, summary and an in-chapter table of contents. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
              <div className="min-w-0">
                <span className="eyebrow text-indigo-700">{chapterAlignment}</span>
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
                  <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {chapterDomain.weight}%
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    {t.trackExtension}
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
              className="scroll-mt-[13.5rem] rounded-xl border border-slate-200 bg-white p-5 md:p-6 lg:scroll-mt-40"
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
  );
}
