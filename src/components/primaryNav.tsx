import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { NAV_GROUPS } from '../lib/navigation';
import { LAB_CATEGORIES } from '../content/viewRegistry';
import { RAIL_VIEWS } from '../lib/primaryNav';
import ViewLink from './ViewLink';

/** The area-grouped list of labs, shared by the desktop dropdown and the mobile drawer. */
export function LabsList({ onNavigate }: { onNavigate?: () => void }) {
  const { language, activeView } = useStore(
    useShallow((state) => ({ language: state.language, activeView: state.activeView }))
  );
  const labsGroup = NAV_GROUPS.find((group) => group.id === 'labs');
  if (!labsGroup) return null;
  return (
    <div className="space-y-2">
      {LAB_CATEGORIES.map((category) => {
        const entries = labsGroup.entries.filter(
          (entry) => entry.category === category.id && !RAIL_VIEWS.has(entry.view)
        );
        if (entries.length === 0) return null;
        return (
          <div key={category.id}>
            <p className="eyebrow px-1 pb-1">{language === 'it' ? category.it : category.en}</p>
            <ul className="space-y-0.5">
              {entries.map((entry) => {
                const Icon = entry.icon;
                const isActive = activeView === entry.view;
                return (
                  <li key={entry.view}>
                    <ViewLink
                      view={entry.view}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-10 items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] ${
                        isActive
                          ? 'bg-indigo-50 font-semibold text-indigo-800'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      <span className="min-w-0">{entry[language]}</span>
                    </ViewLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** The shared app mark: a stack of OSI layers on the brand tile, top layer cyan. */
export function BrandMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect x="1" y="1" width="30" height="30" rx="7.5" fill="#4f46e5" />
      <rect x="7.5" y="8.5" width="17" height="4.2" rx="2.1" fill="#22d3ee" />
      <rect x="7.5" y="13.9" width="17" height="4.2" rx="2.1" fill="#ffffff" />
      <rect x="7.5" y="19.3" width="17" height="4.2" rx="2.1" fill="#ffffff" opacity="0.72" />
    </svg>
  );
}
