/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { uiMessages } from '../i18n';

/**
 * UX-27 — a loading skeleton that mirrors {@link StudyManualView}'s layout.
 *
 * The manual is a lazily-loaded chunk. The previous Suspense fallback was a small
 * centred box, so when the (tall) manual replaced it the page jumped. This skeleton
 * reserves the same structure — header, chapter navigation, the sticky context bar,
 * the desktop rail and a couple of topic cards — so the swap to real content causes
 * no layout shift.
 *
 * It is purely decorative: every shape is `aria-hidden`, and a single polite
 * `role="status"` region carries a bilingual label for assistive technology. The
 * shimmer is disabled under `prefers-reduced-motion`.
 */

const shimmer = 'animate-pulse motion-reduce:animate-none';
const bar = (className: string) => <div aria-hidden="true" className={`rounded bg-slate-200/80 ${className}`} />;

function TopicCardSkeleton() {
  return (
    <div aria-hidden="true" data-skeleton="card" className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
      {bar('h-5 w-2/3')}
      <div className="mt-4 space-y-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
        {bar('h-3 w-24 bg-indigo-200/70')}
        {bar('h-3 w-full')}
        {bar('h-3 w-11/12')}
      </div>
      <div className="mt-5 space-y-2">
        {bar('h-3 w-32')}
        {bar('h-3 w-full')}
        {bar('h-3 w-full')}
        {bar('h-3 w-10/12')}
      </div>
      <div className="mt-4 space-y-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
        {bar('h-3 w-20 bg-emerald-200/70')}
        {bar('h-3 w-5/6')}
      </div>
    </div>
  );
}

export default function ManualViewSkeleton({ language }: { language: 'it' | 'en' }) {
  const copy = uiMessages(language).app;

  return (
    <div role="status" aria-live="polite" data-testid="manual-skeleton" className={`mx-auto max-w-5xl ${shimmer}`}>
      <span className="sr-only">{copy.loadingManual}</span>

      {/* Header */}
      <div aria-hidden="true" className="mb-6">
        <div className="flex items-center justify-between gap-2">
          {bar('h-6 w-48')}
          {bar('h-11 w-40')}
        </div>
        {bar('mt-2 h-3 w-3/4')}
        {bar('mt-3 h-3 w-56')}
        {bar('mt-3 h-3 w-40')}
      </div>

      {/* Chapter navigation: compact selector on mobile, grouped chips on desktop. */}
      <div aria-hidden="true" className="mb-6">
        <div className="lg:hidden">{bar('h-11 w-full')}</div>
        <div className="hidden space-y-3 lg:block">
          {[0, 1].map((group) => (
            <div key={group}>
              {bar('mb-1.5 h-3 w-48')}
              <div className="flex flex-wrap gap-1.5">
                {[0, 1, 2].map((chip) => (
                  <div key={chip} aria-hidden="true" className="h-11 w-40 rounded-md bg-slate-200/70" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky context bar */}
      {bar('mb-5 h-9 w-full')}

      {/* Two-column reading layout: rail + article */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-8">
        <div aria-hidden="true" className="hidden lg:col-start-2 lg:row-start-1 lg:block">
          <div className="space-y-2">
            {bar('h-3 w-24')}
            {bar('h-3 w-5/6')}
            {bar('h-3 w-4/6')}
            {bar('h-3 w-3/6')}
          </div>
        </div>

        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
          {/* Overview card */}
          <div
            aria-hidden="true"
            data-skeleton="card"
            className="rounded-xl border border-slate-200 bg-white p-5 md:p-6"
          >
            {bar('h-3 w-40')}
            {bar('mt-2 h-6 w-3/5')}
            {bar('mt-3 h-3 w-full')}
            {bar('mt-2 h-3 w-11/12')}
            {bar('mt-4 h-11 w-44')}
          </div>

          <TopicCardSkeleton />
          <TopicCardSkeleton />
        </div>
      </div>
    </div>
  );
}
