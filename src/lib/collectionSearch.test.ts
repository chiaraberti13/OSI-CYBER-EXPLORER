import { describe, expect, it } from 'vitest';
import { filterGlossaryTerms, highlightSegments, normalizedQuery } from './collectionSearch';

const terms = [
  { term: 'DNS', definition: { en: 'Resolves names', it: 'Risolve i nomi' } },
  { term: 'Resolver', definition: { en: 'A DNS client', it: 'Un client DNS' } }
] as const;

describe('collection search', () => {
  it('trims and normalizes a query', () => {
    expect(normalizedQuery('  DnS  ')).toBe('dns');
  });

  it('filters glossary fields according to the selected scope', () => {
    expect(filterGlossaryTerms(terms, 'dns', 'all', 'en')).toHaveLength(2);
    expect(filterGlossaryTerms(terms, 'dns', 'term', 'en')).toEqual([terms[0]]);
    expect(filterGlossaryTerms(terms, 'dns', 'definition', 'en')).toEqual([terms[1]]);
    expect(filterGlossaryTerms(terms, 'nomi', 'definition', 'it')).toEqual([terms[0]]);
  });

  it('preserves text while identifying every case-insensitive match', () => {
    const segments = highlightSegments('DNS uses dns resolvers', ' DNS ');
    expect(segments.map((segment) => segment.text).join('')).toBe('DNS uses dns resolvers');
    expect(segments.filter((segment) => segment.match).map((segment) => segment.text)).toEqual(['DNS', 'dns']);
  });

  it('does not create highlight segments for blank or missing matches', () => {
    expect(highlightSegments('HTTPS', ' ')).toEqual([{ text: 'HTTPS', match: false }]);
    expect(highlightSegments('HTTPS', 'dns')).toEqual([{ text: 'HTTPS', match: false }]);
  });
});
