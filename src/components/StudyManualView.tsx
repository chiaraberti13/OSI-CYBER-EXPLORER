/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { useEffect, useId, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  FlaskConical,
  ListChecks,
  Target
} from 'lucide-react';
import { useStore } from '../store';
import { uiMessages } from '../i18n';
import { ccnaDomainForChapter, chaptersByDomain, findChapter, manualStats, orderedChapters } from '../lib/studyManual';
import type { GuidedLab, ManualCert, ManualDifficulty } from '../content/studyManual';
import { securityReferenceUrl } from '../content/securityReferences';
import ViewLink from './ViewLink';

export default function StudyManualView() {
  const language = useStore((state) => state.language);
  const t = uiMessages(language).manual;
  const chapters = orderedChapters();
  const [activeId, setActiveId] = useState(chapters[0]?.id);
  const chapter = findChapter(activeId) ?? chapters[0];
  const stats = manualStats();
  const headingId = useId();
  const chapterTitleId = useId();

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

  // Linear study flow: the chapters immediately before and after the active one.
  const chapterIndex = chapters.findIndex((entry) => entry.id === chapter.id);
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : undefined;
  const nextChapter = chapterIndex >= 0 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : undefined;

  // Scroll-spy for the "On this page" rail: highlight the topic currently in view.
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(chapter.topics[0]?.id);
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
    const headerOffset = 160;
    const recompute = () => {
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

  const jumpToTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    try {
      document.getElementById(`topic-${topicId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      // scrollIntoView is a no-op or unimplemented in some environments (e.g. jsdom); ignore.
    }
  };

  const selectChapter = (id: string) => {
    setActiveId(id);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // window.scrollTo is unimplemented in some environments (e.g. jsdom); ignore.
    }
  };

  const renderGuidedLab = (lab: GuidedLab) => (
    <div key={lab.id} className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <FlaskConical aria-hidden="true" className="h-4 w-4 text-indigo-600" />
        <span className="eyebrow text-indigo-700">{t.guidedLab}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">
          {difficultyLabel[lab.difficulty]}
        </span>
      </div>
      <h4 className="mt-2 text-[14px] font-semibold text-slate-900">{lab.title[language]}</h4>

      <p className="mt-2 text-[13px] text-slate-600">
        <span className="font-semibold text-slate-700">{t.scenario}: </span>
        {lab.scenario[language]}
      </p>
      <p className="mt-1 text-[13px] text-slate-700">
        <span className="font-semibold">{t.task}: </span>
        {lab.task[language]}
      </p>

      <p className="mt-3 eyebrow">{t.steps}</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px] text-slate-600">
        {lab.steps.map((step, i) => (
          <li key={`${lab.id}-step-${i}`}>{step[language]}</li>
        ))}
      </ol>

      <p className="mt-3 text-[13px] text-slate-700">
        <span className="font-semibold">{t.challenge}: </span>
        {lab.challenge[language]}
      </p>

      <details className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-[13px] font-medium text-indigo-700">{t.showSolution}</summary>
        <p className="mt-2 eyebrow">{t.solution}</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px] text-slate-600">
          {lab.solution.map((line, i) => (
            <li key={`${lab.id}-sol-${i}`}>{line[language]}</li>
          ))}
        </ol>
      </details>

      <div className="mt-3 flex items-start gap-1.5">
        <ListChecks aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div>
          <span className="eyebrow">{t.selfCheck}</span>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-slate-600">
            {lab.selfCheck.map((check, i) => (
              <li key={`${lab.id}-check-${i}`}>{check[language]}</li>
            ))}
          </ul>
        </div>
      </div>

      <ViewLink
        view={lab.lab}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-indigo-500"
      >
        {t.openLab}
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </ViewLink>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 id={headingId} className="text-xl font-semibold tracking-tight text-slate-900">
          {t.heading}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t.intro}</p>
        <p className="mt-2 text-[12px] font-mono text-slate-400">
          {stats.chapters} {t.chapters} · {stats.topics} {t.topics} · {stats.guidedLabs} {t.guidedLabs}
        </p>
      </header>

      {chapters.length > 1 ? (
        <nav aria-label={t.chapterNav} className="mb-6 space-y-3">
          {chaptersByDomain().map((group) => {
            const groupLabel = group.domain
              ? `CCNA ${group.domain.number}.0 · ${group.domain.title[language]}`
              : t.trackExtension;
            return (
              <div key={group.key} role="group" aria-label={groupLabel}>
                <p className="eyebrow mb-1.5">{groupLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.chapters.map((entry) => {
                    const isActive = entry.id === chapter.id;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => selectChapter(entry.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'border-slate-300 bg-white text-slate-900'
                            : 'border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-800'
                        }`}
                      >
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

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-8">
        <article aria-labelledby={chapterTitleId} className="min-w-0 space-y-5 lg:col-start-1">
          {/* Chapter overview card: alignment, title, summary and an in-chapter table of contents. */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {(() => {
                  const domain = ccnaDomainForChapter(chapter);
                  const alignment =
                    chapter.track === 'ccna' && domain
                      ? `CCNA ${domain.number}.0 · ${domain.title[language]}`
                      : `${t.trackExtension} · ${certLabel[chapter.cert]}`;
                  return <span className="eyebrow text-indigo-700">{alignment}</span>;
                })()}
                <h2 id={chapterTitleId} className="mt-1 text-xl font-semibold text-slate-900">
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
                const domain = ccnaDomainForChapter(chapter);
                return domain ? (
                  <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {domain.weight}%
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    {t.trackExtension}
                  </span>
                );
              })()}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{chapter.summary[language]}</p>

            {chapter.topics.length > 1 ? (
              <nav aria-label={t.tableOfContents} className="mt-4 border-t border-slate-100 pt-4 lg:hidden">
                <p className="flex items-center gap-1.5 eyebrow text-slate-400">
                  <ListChecks aria-hidden="true" className="h-3.5 w-3.5" />
                  {t.tableOfContents}
                </p>
                <ol className="mt-2 grid gap-1 sm:grid-cols-2">
                  {chapter.topics.map((topic, i) => (
                    <li key={`toc-${topic.id}`}>
                      <button
                        type="button"
                        onClick={() => jumpToTopic(topic.id)}
                        className="text-left text-[13px] font-medium text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        {i + 1}. {topic.title[language]}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
          </div>

          {/* One card per topic so each is a bounded, scannable chunk. */}
          {chapter.topics.map((topic, idx) => (
            <section
              key={topic.id}
              id={`topic-${topic.id}`}
              aria-labelledby={`topic-h-${topic.id}`}
              className="scroll-mt-28 rounded-xl border border-slate-200 bg-white p-5 md:p-6"
            >
              <h3 id={`topic-h-${topic.id}`} className="text-base font-semibold text-slate-900">
                {idx + 1}. {topic.title[language]}
              </h3>

              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                <h4 className="flex items-center gap-1.5 eyebrow text-indigo-700">
                  <Target aria-hidden="true" className="h-3.5 w-3.5" />
                  {t.objectives}
                </h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-slate-700">
                  {topic.objectives.map((o, i) => (
                    <li key={`${topic.id}-obj-${i}`}>{o[language]}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <h4 className="eyebrow text-slate-400">{t.prerequisites}</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-slate-500">
                  {topic.prerequisites.map((p, i) => (
                    <li key={`${topic.id}-pre-${i}`}>{p[language]}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="flex items-center gap-1.5 eyebrow text-slate-500">
                  <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
                  {t.explanation}
                </h4>
                <div className="mt-1 space-y-2">
                  {topic.theory.map((para, i) => (
                    <p key={`${topic.id}-th-${i}`} className="text-[13.5px] leading-relaxed text-slate-700">
                      {para[language]}
                    </p>
                  ))}
                </div>
              </div>

              {topic.example ? (
                <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                  <h4 className="flex items-center gap-1.5 eyebrow text-emerald-700">
                    <FlaskConical aria-hidden="true" className="h-3.5 w-3.5" />
                    {t.example}
                  </h4>
                  <p className="mt-1 text-[13px] leading-relaxed text-emerald-950">{topic.example[language]}</p>
                </div>
              ) : null}

              <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                <h4 className="flex items-center gap-1.5 eyebrow text-amber-700">
                  <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
                  {t.commonMistakes}
                </h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-amber-950">
                  {topic.commonMistakes.map((m, i) => (
                    <li key={`${topic.id}-mis-${i}`}>{m[language]}</li>
                  ))}
                </ul>
              </div>

              {topic.references && topic.references.length > 0 ? (
                <p className="mt-3 text-[12px] text-slate-500">
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

              {topic.lab ? (
                <ViewLink
                  view={topic.lab}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {t.studyInLab}
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </ViewLink>
              ) : null}

              {topic.guidedLabs?.map(renderGuidedLab)}
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
                  className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[13px] text-slate-600 transition-colors hover:text-slate-900"
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

        {/* "On this page" rail (desktop): orientation via scroll-spy, content stays visible. */}
        {chapter.topics.length > 1 ? (
          <aside className="hidden lg:col-start-2 lg:block">
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
                        aria-current={isActive ? 'true' : undefined}
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
      </div>
    </div>
  );
}
