/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { useStore, type AppView } from '../store';
import { uiMessages } from '../i18n';
import ViewLink from './ViewLink';

/**
 * IA-01 — the CCNA study hub switcher.
 *
 * The «Mappa CCNA» (overview) and the «Manuale di studio» (chapters) used to be two
 * separate menu entries covering the same six domains, which read as duplication. They
 * are now the two sections of one hub: this segmented control, rendered at the top of
 * both views, makes that relationship explicit and lets the learner move between the
 * domain overview and the chapter reading. The overview keeps its own route
 * (`#/curriculum`) so it stays deep-linkable; it is simply no longer a separate item in
 * the top navigation.
 */
export default function CcnaHubTabs() {
  const language = useStore((state) => state.language);
  const activeView = useStore((state) => state.activeView);
  const t = uiMessages(language).hub;

  const tabs: ReadonlyArray<{ view: AppView; label: string }> = [
    { view: 'curriculum', label: t.overview },
    { view: 'manual', label: t.chapters }
  ];

  return (
    <div className="mb-6">
      <p className="eyebrow mb-2 text-indigo-700">{t.eyebrow}</p>
      <nav aria-label={t.label} className="inline-flex rounded-lg border border-slate-200 p-1">
        {tabs.map((tab) => {
          const isActive = activeView === tab.view;
          return (
            <ViewLink
              key={tab.view}
              view={tab.view}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </ViewLink>
          );
        })}
      </nav>
    </div>
  );
}
