export type GlossarySearchScope = 'all' | 'term' | 'definition';

export interface HighlightSegment {
  text: string;
  match: boolean;
}

interface GlossaryEntry {
  term: string;
  definition: { en: string; it: string };
}

export function normalizedQuery(query: string): string {
  return query.trim().toLocaleLowerCase();
}

export function filterGlossaryTerms<T extends GlossaryEntry>(
  terms: readonly T[],
  query: string,
  scope: GlossarySearchScope,
  language: 'en' | 'it'
): T[] {
  const normalized = normalizedQuery(query);
  if (!normalized) return [...terms];

  return terms.filter((item) => {
    const termMatches = item.term.toLocaleLowerCase().includes(normalized);
    const definitionMatches = item.definition[language].toLocaleLowerCase().includes(normalized);

    if (scope === 'term') return termMatches;
    if (scope === 'definition') return definitionMatches;
    return termMatches || definitionMatches;
  });
}

export function highlightSegments(text: string, query: string): HighlightSegment[] {
  const normalized = normalizedQuery(query);
  if (!normalized) return [{ text, match: false }];

  const searchableText = text.toLocaleLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  let matchIndex = searchableText.indexOf(normalized);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), match: false });
    }
    const matchEnd = matchIndex + normalized.length;
    segments.push({ text: text.slice(matchIndex, matchEnd), match: true });
    cursor = matchEnd;
    matchIndex = searchableText.indexOf(normalized, cursor);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }

  return segments.length > 0 ? segments : [{ text, match: false }];
}
