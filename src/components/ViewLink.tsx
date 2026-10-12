import type { AnchorHTMLAttributes } from 'react';
import { manualChapterHash, viewHash } from '../lib/viewRouting';
import { useStore, type AppView } from '../store';

type ViewLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  view: AppView;
  /** Deep-link a specific manual chapter (`#/manual/<chapterId>`); only used for the manual view. */
  chapterId?: string;
};

/** A real lab link: copy/new-tab work, while ordinary clicks stay inside the SPA. */
export default function ViewLink({ view, chapterId, onClick, ...props }: ViewLinkProps) {
  const setActiveView = useStore((state) => state.setActiveView);
  const setActiveChapter = useStore((state) => state.setActiveChapter);
  const deepLinkChapter = view === 'manual' && chapterId ? chapterId : undefined;

  return (
    <a
      {...props}
      href={deepLinkChapter ? manualChapterHash(deepLinkChapter) : viewHash(view)}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (props.target && props.target !== '_self') ||
          props.download !== undefined
        )
          return;
        event.preventDefault();
        setActiveView(view);
        // Clearing the chapter on a plain manual link keeps the URL canonical (`#/manual`).
        if (view === 'manual') setActiveChapter(deepLinkChapter ?? null);
      }}
    />
  );
}
