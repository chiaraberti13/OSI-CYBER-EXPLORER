import React from 'react';
import { highlightSegments } from '../lib/collectionSearch';

export default function SearchHighlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightSegments(text, query).map((segment, index) =>
        segment.match ? (
          <mark key={`${index}-${segment.text}`} className="rounded-sm bg-amber-200 px-0.5 text-inherit">
            {segment.text}
          </mark>
        ) : (
          <React.Fragment key={`${index}-${segment.text}`}>{segment.text}</React.Fragment>
        )
      )}
    </>
  );
}
