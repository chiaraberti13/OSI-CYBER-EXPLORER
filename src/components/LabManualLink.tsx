import { BookOpen, ArrowRight } from 'lucide-react';
import { useStore, type AppView } from '../store';
import { uiMessages } from '../i18n';
import { manualChaptersForLab } from '../content/manualRouteIndex';
import ViewLink from './ViewLink';

/**
 * EDU-STRUCT-05 — a lab's deferral to the manual. The study manual is the single source
 * of theory; a lab is where the student practises it. This renders the back-reference
 * from a lab to the chapter(s) whose theory it exercises, deep-linking each chapter
 * (`#/manual/<id>`, EDU-STRUCT-04). The compact route index is guarded against the full
 * manual dataset, so this shell link does not pull the handbook into the initial bundle.
 */
export default function LabManualLink({ lab }: { lab: AppView }) {
  const language = useStore((state) => state.language);
  const chapters = manualChaptersForLab(lab);
  if (chapters.length === 0) return null;
  const copy = uiMessages(language).labManual;

  return (
    <aside className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-indigo-950">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        {copy.label}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-indigo-900/90">{copy.intro}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <ViewLink
              view="manual"
              chapterId={chapter.id}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            >
              <span className="sr-only">{chapters.length > 1 ? copy.openMany : copy.openOne}: </span>
              {chapter.title[language]}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </ViewLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
