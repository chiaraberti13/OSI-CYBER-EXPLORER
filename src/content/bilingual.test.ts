import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * A guard against the one bilingual failure that reading cannot catch reliably.
 *
 * Every dataset here carries an Italian and an English string side by side. When a
 * definition is corrected, it is easy to improve one language and leave the other
 * saying the old, less accurate thing — which is exactly what happened to the IDS,
 * IPS, NIDS/NIPS, HIDS/HIPS and AEAD entries: the operational detail was added in
 * Italian only, so the English glossary kept teaching a weaker definition.
 *
 * Two checks, both deliberately tolerant, because prose is not a translation memory:
 * a length ratio that flags a dropped clause, and a technical-token comparison that
 * flags a dropped fact even when the two sides are the same length.
 */

const CONTENT_DIR = 'src/content';

interface Pair { file: string; line: number; it: string; en: string }

/** Pairs each it:/en: string with its immediate sibling in the same object literal. */
function bilingualPairs(): Pair[] {
  const pairs: Pair[] = [];
  for (const file of readdirSync(CONTENT_DIR).filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'))) {
    const text = readFileSync(`${CONTENT_DIR}/${file}`, 'utf8');
    const matcher = /\b(it|en)\s*:\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/g;
    const hits = [...text.matchAll(matcher)].map(match => ({
      lang: match[1], body: match[3], at: match.index ?? 0, end: (match.index ?? 0) + match[0].length
    }));
    for (let index = 0; index + 1 < hits.length; index += 1) {
      const left = hits[index];
      const right = hits[index + 1];
      if (left.lang === right.lang) continue;
      // Only siblings: whitespace and a comma may separate them, nothing else.
      if (!/^[\s,]*$/.test(text.slice(left.end, right.at))) continue;
      index += 1;
      pairs.push({
        file,
        line: text.slice(0, left.at).split('\n').length,
        it: left.lang === 'it' ? left.body : right.body,
        en: left.lang === 'en' ? left.body : right.body
      });
    }
  }
  return pairs;
}

const PAIRS = bilingualPairs();

/**
 * Acronyms and figures, normalised so that legitimate localisation is not a finding:
 * English plurals (VLANs/VLAN) and the decimal and thousands separators, which are
 * swapped between the two languages (15,4 W against 15.4 W; 65.535 against 65,535).
 */
function technicalTokens(text: string): Set<string> {
  // The trailing `s?` matters: without it "APIs" does not match at all, so an English
  // plural reads as a fact the English side never stated.
  const acronyms = text.match(/\b[A-Z][A-Z0-9][A-Z0-9/.-]{1,14}s?\b/g) ?? [];
  const figures = text.match(/\b\d+(?:[.,]\d+)?\b/g) ?? [];
  const tokens = new Set<string>();
  for (const raw of acronyms) {
    for (const part of raw.split(/[/-]/)) {
      const token = part.replace(/[.]+$/, '').replace(/s$/i, '');
      if (token.length >= 3) tokens.add(token);
    }
  }
  for (const figure of figures) tokens.add(figure.replace(/[.,]/g, ''));
  return tokens;
}

describe('bilingual content', () => {
  it('finds pairs to check at all', () => {
    expect(PAIRS.length).toBeGreaterThan(500);
  });

  it('keeps the two languages within a plausible length of each other', () => {
    const offenders = PAIRS.filter(pair => {
      const shortest = Math.min(pair.it.length, pair.en.length);
      const longest = Math.max(pair.it.length, pair.en.length);
      return longest >= 70 && longest / Math.max(1, shortest) > 1.45;
    }).map(pair => `${pair.file}:${pair.line} (it ${pair.it.length} / en ${pair.en.length})`);
    expect(offenders, 'one language carries a clause the other dropped').toEqual([]);
  });

  it('states the same technical facts in both languages', () => {
    const offenders: string[] = [];
    for (const pair of PAIRS) {
      if (Math.max(pair.it.length, pair.en.length) < 60) continue;
      const italian = technicalTokens(pair.it);
      const english = technicalTokens(pair.en);
      const onlyItalian = [...italian].filter(token => !english.has(token));
      const onlyEnglish = [...english].filter(token => !italian.has(token));
      if (onlyItalian.length + onlyEnglish.length > 0) {
        offenders.push(`${pair.file}:${pair.line} it-only[${onlyItalian}] en-only[${onlyEnglish}]`);
      }
    }
    expect(offenders, 'a term or figure appears in one language only').toEqual([]);
  });
});
