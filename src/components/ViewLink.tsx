import type { AnchorHTMLAttributes } from 'react';
import { viewHash } from '../lib/viewRouting';
import { useStore, type AppView } from '../store';

type ViewLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  view: AppView;
};

/** A real lab link: copy/new-tab work, while ordinary clicks stay inside the SPA. */
export default function ViewLink({ view, onClick, ...props }: ViewLinkProps) {
  const setActiveView = useStore(state => state.setActiveView);

  return (
    <a
      {...props}
      href={viewHash(view)}
      onClick={event => {
        onClick?.(event);
        if (
          event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          (props.target && props.target !== '_self') || props.download !== undefined
        ) return;
        event.preventDefault();
        setActiveView(view);
      }}
    />
  );
}
