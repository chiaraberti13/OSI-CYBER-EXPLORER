/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { useId, useState } from 'react';
import { ArrowRight, ExternalLink, FlaskConical, ListChecks, Target } from 'lucide-react';
import { useStore } from '../store';
import { uiMessages } from '../i18n';
import { findChapter, manualStats, orderedChapters } from '../lib/studyManual';
import type { GuidedLab, ManualCert, ManualDifficulty } from '../content/studyManual';
import { securityReferenceUrl } from '../content/securityReferences';
import ViewLink from './ViewLink';

export default function StudyManualView() {
  const language = useStore(state => state.language);
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
    advanced: t.difficultyAdvanced,
  };
  const certLabel: Record<ManualCert, string> = {
    ccna: t.certCcna,
    securityplus: t.certSecurityPlus,
    both: t.certBoth,
  };

  const renderGuidedLab = (lab: GuidedLab) => (
    <div key={lab.id} className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <FlaskConical aria-hidden="true" className="h-4 w-4 text-indigo-600" />
        <span className="eyebrow text-indigo-700">{t.guidedLab}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">{difficultyLabel[lab.difficulty]}</span>
      </div>
      <h5 className="mt-2 text-[14px] font-semibold text-slate-900">{lab.title[language]}</h5>

      <p className="mt-2 text-[13px] text-slate-600"><span className="font-semibold text-slate-700">{t.scenario}: </span>{lab.scenario[language]}</p>
      <p className="mt-1 text-[13px] text-slate-700"><span className="font-semibold">{t.task}: </span>{lab.task[language]}</p>

      <p className="mt-3 eyebrow">{t.steps}</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px] text-slate-600">
        {lab.steps.map((step, i) => <li key={`${lab.id}-step-${i}`}>{step[language]}</li>)}
      </ol>

      <p className="mt-3 text-[13px] text-slate-700"><span className="font-semibold">{t.challenge}: </span>{lab.challenge[language]}</p>

      <details className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-[13px] font-medium text-indigo-700">{t.showSolution}</summary>
        <p className="mt-2 eyebrow">{t.solution}</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px] text-slate-600">
          {lab.solution.map((line, i) => <li key={`${lab.id}-sol-${i}`}>{line[language]}</li>)}
        </ol>
      </details>

      <div className="mt-3 flex items-start gap-1.5">
        <ListChecks aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div>
          <span className="eyebrow">{t.selfCheck}</span>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-slate-600">
            {lab.selfCheck.map((check, i) => <li key={`${lab.id}-check-${i}`}>{check[language]}</li>)}
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
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h2 id={headingId} className="text-xl font-semibold tracking-tight text-slate-900">{t.heading}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.intro}</p>
        <p className="mt-2 text-[12px] font-mono text-slate-400">
          {stats.chapters} {t.chapters} · {stats.topics} {t.topics} · {stats.guidedLabs} {t.guidedLabs}
        </p>
      </header>

      {chapters.length > 1 ? (
        <nav aria-label={t.chapterNav} className="mb-6 flex flex-wrap gap-1.5">
          {chapters.map(entry => {
            const isActive = entry.id === chapter.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setActiveId(entry.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  isActive ? 'border-slate-300 bg-white text-slate-900' : 'border-transparent text-slate-500 hover:bg-white/70 hover:text-slate-800'
                }`}
              >
                {entry.order}. {entry.title[language]}
              </button>
            );
          })}
        </nav>
      ) : null}

      <article aria-labelledby={chapterTitleId}>
        <span className="eyebrow">{certLabel[chapter.cert]}</span>
        <h3 id={chapterTitleId} className="mt-1 text-lg font-semibold text-slate-900">{chapter.title[language]}</h3>
        <p className="mt-1 text-sm text-slate-600">{chapter.summary[language]}</p>

        {chapter.topics.map(topic => (
          <section key={topic.id} className="mt-8 border-t border-slate-200/70 pt-6">
            <h4 className="text-[15px] font-semibold text-slate-900">{topic.title[language]}</h4>

            <div className="mt-3 flex items-start gap-1.5">
              <Target aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <div>
                <span className="eyebrow">{t.objectives}</span>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-slate-600">
                  {topic.objectives.map((o, i) => <li key={`${topic.id}-obj-${i}`}>{o[language]}</li>)}
                </ul>
              </div>
            </div>

            <p className="mt-3 eyebrow">{t.prerequisites}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-slate-500">
              {topic.prerequisites.map((p, i) => <li key={`${topic.id}-pre-${i}`}>{p[language]}</li>)}
            </ul>

            <div className="mt-3 space-y-2">
              {topic.theory.map((para, i) => (
                <p key={`${topic.id}-th-${i}`} className="text-[13.5px] leading-relaxed text-slate-700">{para[language]}</p>
              ))}
            </div>

            {topic.example ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                <span className="eyebrow">{t.example}</span>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{topic.example[language]}</p>
              </div>
            ) : null}

            <p className="mt-3 eyebrow">{t.commonMistakes}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] text-slate-600">
              {topic.commonMistakes.map((m, i) => <li key={`${topic.id}-mis-${i}`}>{m[language]}</li>)}
            </ul>

            {topic.references && topic.references.length > 0 ? (
              <p className="mt-3 text-[12px] text-slate-500">
                <span className="eyebrow">{t.references}: </span>
                {topic.references.map((ref, i) => (
                  <span key={`${topic.id}-ref-${i}`}>
                    {i > 0 ? ', ' : ''}
                    <a href={securityReferenceUrl(ref)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-indigo-600 hover:underline">
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
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {t.studyInLab}
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </ViewLink>
            ) : null}

            {topic.guidedLabs?.map(renderGuidedLab)}
          </section>
        ))}
      </article>
    </div>
  );
}
