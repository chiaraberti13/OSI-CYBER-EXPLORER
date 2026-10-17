import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ATTACK_FAMILIES } from './securityTaxonomy';
import { GLOSSARY_TERMS } from './glossaryTerms';
import { MANUAL_DIAGRAMS } from './manualDiagrams';
import { STUDY_MANUAL } from './studyManual';
import { SECURITY_TECHNIQUES } from './securityCoverage';
import { DEFENSE_CONTROLS } from './defenseControls';
import { DETECTION_USE_CASES } from './detectionUseCases';
import { SECURITY_PLAYBOOKS } from './securityPlaybooks';
import { DOMAIN_CHECKLISTS } from './domainChecklists';
import { ATTACK_PATHS } from './attackPaths';
import { SECURITY_EVIDENCE_CASES } from './securityEvidence';
import { CCNA_DOMAINS } from './ccna';
import { DEVICE_REGISTRY } from './deviceRegistry';
import { VPN_CONTENT } from './vpnContent';
import { EAP_CONTENT } from './eapContent';
import { AAA_CONTENT } from './aaaContent';
import { PORT_CONTENT } from './portContent';
import { PROTOCOL_REGISTRY } from './protocolRegistry';
import { APPLICATION_SECURITY_SCENARIOS } from './applicationSecurityScenarios';
import { AVAILABILITY_SCENARIOS } from './availabilityScenarios';
import { EMAIL_HUMAN_SECURITY_SCENARIOS } from './emailHumanSecurityScenarios';
import { ENDPOINT_SECURITY_SCENARIOS } from './endpointSecurityScenarios';
import { IDENTITY_TRUST_SCENARIOS } from './identityTrustScenarios';
import { INSPECTION_SCENARIOS } from './inspectionScenarios';
import { IPV6_SECURITY_SCENARIOS } from './ipv6Security';
import { LAYER2_SECURITY_SCENARIOS } from './layer2SecurityScenarios';
import { MANAGEMENT_TELEMETRY_SCENARIOS } from './managementTelemetryScenarios';
import { RECOVERY_SCENARIOS } from './recoveryScenarios';
import { ROUTING_SECURITY_SCENARIOS } from './routingSecurityScenarios';
import { SEGMENTATION_SCENARIOS } from './segmentationScenarios';
import { VPN_PKI_SCENARIOS } from './vpnPkiScenarios';
import { WIRELESS_SECURITY_SCENARIOS } from './wirelessSecurityScenarios';
// The five interactive-lab datasets are imported by namespace so every current and
// future export is walked, without re-listing each one here (I18N-10, 2026-10-16).
import * as networkFundamentalsLab from './networkFundamentalsLab';
import * as networkAccessLab from './networkAccessLab';
import * as ipConnectivityLab from './ipConnectivityLab';
import * as ipServicesLab from './ipServicesLab';
import * as securityFundamentalsLab from './securityFundamentalsLab';

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

// All extracted catalogues are reviewed and included (I18N-10, 2026-10-16); the
// learner-facing glossary joined the structured parity walk below (I18N-10, 2026-10-16),
// and the study manual — the largest learner-facing dataset — followed (I18N-10, 2026-10-16).

interface Pair {
  file: string;
  line: number;
  it: string;
  en: string;
}

/** Pairs each it:/en: string with its immediate sibling in the same object literal. */
function bilingualPairs(): Pair[] {
  const pairs: Pair[] = [];
  for (const file of readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))) {
    const text = readFileSync(`${CONTENT_DIR}/${file}`, 'utf8');
    const matcher = /\b(it|en)\s*:\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/g;
    const hits = [...text.matchAll(matcher)].map((match) => ({
      lang: match[1],
      body: match[3],
      at: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length
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
function technicalTokens(rawText: string): Set<string> {
  // A terminal-style banner ("SIGNAL JAMMING DETECTED: ...") is an uppercase label, not an
  // acronym list: its words are localised, so only the sentence after the colon is compared.
  const text = rawText.replace(/^[A-ZÀ-Ý][A-ZÀ-Ý0-9 ()/&'’.,-]{5,}:\s*/, '');
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
    const offenders = PAIRS.filter((pair) => {
      const shortest = Math.min(pair.it.length, pair.en.length);
      const longest = Math.max(pair.it.length, pair.en.length);
      return longest >= 70 && longest / Math.max(1, shortest) > 1.45;
    }).map((pair) => `${pair.file}:${pair.line} (it ${pair.it.length} / en ${pair.en.length})`);
    expect(offenders, 'one language carries a clause the other dropped').toEqual([]);
  });

  it('states the same technical facts in both languages', () => {
    const offenders: string[] = [];
    for (const pair of PAIRS) {
      if (Math.max(pair.it.length, pair.en.length) < 60) continue;
      const italian = technicalTokens(pair.it);
      const english = technicalTokens(pair.en);
      const onlyItalian = [...italian].filter((token) => !english.has(token));
      const onlyEnglish = [...english].filter((token) => !italian.has(token));
      if (onlyItalian.length + onlyEnglish.length > 0) {
        offenders.push(`${pair.file}:${pair.line} it-only[${onlyItalian}] en-only[${onlyEnglish}]`);
      }
    }
    expect(offenders, 'a term or figure appears in one language only').toEqual([]);
  });
});

/**
 * ENG-13 — Structured IT/EN parity for the typed security datasets.
 *
 * The file scan above is a heuristic over source text; it cannot tell that a specific
 * `Bilingual` field is present but empty, nor that one language of a pair was dropped
 * entirely. These checks walk the real runtime objects and fail when any `{ it, en }`
 * pair (a `Bilingual` or a `Record<Language, string>`) is missing a side or holds an
 * empty string — the "una traduzione mancante fallisce in CI" half of ENG-13.
 */

const BILINGUAL_DATASETS: ReadonlyArray<readonly [string, unknown]> = [
  ['STUDY_MANUAL', STUDY_MANUAL],
  ['MANUAL_DIAGRAMS', MANUAL_DIAGRAMS],
  ['GLOSSARY_TERMS', GLOSSARY_TERMS],
  ['ATTACK_FAMILIES', ATTACK_FAMILIES],
  ['SECURITY_TECHNIQUES', SECURITY_TECHNIQUES],
  ['DEFENSE_CONTROLS', DEFENSE_CONTROLS],
  ['DETECTION_USE_CASES', DETECTION_USE_CASES],
  ['SECURITY_PLAYBOOKS', SECURITY_PLAYBOOKS],
  ['DOMAIN_CHECKLISTS', DOMAIN_CHECKLISTS],
  ['ATTACK_PATHS', ATTACK_PATHS],
  ['SECURITY_EVIDENCE_CASES', SECURITY_EVIDENCE_CASES],
  ['CCNA_DOMAINS', CCNA_DOMAINS],
  ['PROTOCOL_REGISTRY', PROTOCOL_REGISTRY],
  ['PORT_CONTENT', PORT_CONTENT],
  ['AAA_CONTENT', AAA_CONTENT],
  ['EAP_CONTENT', EAP_CONTENT],
  ['VPN_CONTENT', VPN_CONTENT],
  ['DEVICE_REGISTRY', DEVICE_REGISTRY],
  ['APPLICATION_SECURITY_SCENARIOS', APPLICATION_SECURITY_SCENARIOS],
  ['AVAILABILITY_SCENARIOS', AVAILABILITY_SCENARIOS],
  ['EMAIL_HUMAN_SECURITY_SCENARIOS', EMAIL_HUMAN_SECURITY_SCENARIOS],
  ['ENDPOINT_SECURITY_SCENARIOS', ENDPOINT_SECURITY_SCENARIOS],
  ['IDENTITY_TRUST_SCENARIOS', IDENTITY_TRUST_SCENARIOS],
  ['INSPECTION_SCENARIOS', INSPECTION_SCENARIOS],
  ['IPV6_SECURITY_SCENARIOS', IPV6_SECURITY_SCENARIOS],
  ['LAYER2_SECURITY_SCENARIOS', LAYER2_SECURITY_SCENARIOS],
  ['MANAGEMENT_TELEMETRY_SCENARIOS', MANAGEMENT_TELEMETRY_SCENARIOS],
  ['RECOVERY_SCENARIOS', RECOVERY_SCENARIOS],
  ['ROUTING_SECURITY_SCENARIOS', ROUTING_SECURITY_SCENARIOS],
  ['SEGMENTATION_SCENARIOS', SEGMENTATION_SCENARIOS],
  ['VPN_PKI_SCENARIOS', VPN_PKI_SCENARIOS],
  ['WIRELESS_SECURITY_SCENARIOS', WIRELESS_SECURITY_SCENARIOS]
];

/** A language key identifies a pair even when the other side is absent or malformed. */
function isBilingualPair(value: Record<string, unknown>): boolean {
  return 'it' in value || 'en' in value;
}

/** Walks a value and records every `{ it, en }` pair whose sides are missing or empty. */
function collectEmptyTranslations(value: unknown, path: string, offenders: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectEmptyTranslations(item, `${path}[${index}]`, offenders));
    return;
  }
  if (value === null || typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  if (isBilingualPair(record)) {
    for (const lang of ['it', 'en'] as const) {
      const side = record[lang];
      if (typeof side !== 'string' || side.trim() === '') offenders.push(`${path}.${lang}`);
    }
    // A Bilingual/Localized pair carries nothing else to translate, but an object may
    // legitimately own an `it`/`en` field alongside more content, so keep descending.
    for (const key of Object.keys(record)) {
      if (key !== 'it' && key !== 'en') collectEmptyTranslations(record[key], `${path}.${key}`, offenders);
    }
    return;
  }
  for (const key of Object.keys(record)) collectEmptyTranslations(record[key], `${path}.${key}`, offenders);
}

describe('structured bilingual datasets', () => {
  it.each([
    [{ it: 'solo italiano' }, ['root.en']],
    [{ en: 'English only' }, ['root.it']],
    [{ it: '', en: 'English' }, ['root.it']],
    [{ it: 'Italiano', en: '   ' }, ['root.en']],
    [{ it: 42, en: 'English' }, ['root.it']],
    [{ it: 'Italiano', en: null }, ['root.en']],
    [{ nested: [{ it: 'Italiano' }] }, ['root.nested[0].en']],
    [{ it: 'Italiano', en: 'English' }, []]
  ])('rejects missing, blank or non-string translations: %j', (value, expected) => {
    const offenders: string[] = [];
    collectEmptyTranslations(value, 'root', offenders);
    expect(offenders).toEqual(expected);
  });

  it('checks every protocol field without relying on source-text length heuristics', () => {
    const offenders: string[] = [];
    for (const protocol of PROTOCOL_REGISTRY) {
      for (const field of ['description', 'useCase', 'security'] as const) {
        expect(protocol[field]).toHaveProperty('it');
        expect(protocol[field]).toHaveProperty('en');
        collectEmptyTranslations(protocol[field], `${protocol.name}.${field}`, offenders);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('checks every port description and security note', () => {
    const offenders: string[] = [];
    for (const port of PORT_CONTENT) {
      for (const field of ['description', 'security'] as const) {
        expect(port[field]).toHaveProperty('it');
        expect(port[field]).toHaveProperty('en');
        collectEmptyTranslations(port[field], `${port.service}.${field}`, offenders);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('checks all device fields and both language keys', () => {
    const offenders: string[] = [];
    for (const device of DEVICE_REGISTRY) {
      for (const field of ['role', 'howItWorks', 'securityAttacks', 'cannotStop', 'mitigation'] as const) {
        expect(device[field]).toHaveProperty('it');
        expect(device[field]).toHaveProperty('en');
        collectEmptyTranslations(device[field], `${device.name}.${field}`, offenders);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('checks every chapter, topic and guided-lab bilingual field of the study manual', () => {
    const offenders: string[] = [];
    let topics = 0;
    let guidedLabs = 0;
    for (const chapter of STUDY_MANUAL) {
      const at = `STUDY_MANUAL[${chapter.id}]`;
      // Chapter-level title and summary.
      collectEmptyTranslations(chapter.title, `${at}.title`, offenders);
      collectEmptyTranslations(chapter.summary, `${at}.summary`, offenders);
      for (const topic of chapter.topics) {
        topics += 1;
        // Every Bilingual and Bilingual[] a topic carries, including the optional example.
        collectEmptyTranslations(topic.title, `${at}.${topic.id}.title`, offenders);
        collectEmptyTranslations(topic.objectives, `${at}.${topic.id}.objectives`, offenders);
        collectEmptyTranslations(topic.prerequisites, `${at}.${topic.id}.prerequisites`, offenders);
        collectEmptyTranslations(topic.theory, `${at}.${topic.id}.theory`, offenders);
        collectEmptyTranslations(topic.example, `${at}.${topic.id}.example`, offenders);
        collectEmptyTranslations(topic.commonMistakes, `${at}.${topic.id}.commonMistakes`, offenders);
        for (const lab of topic.guidedLabs ?? []) {
          guidedLabs += 1;
          // A guided lab is the deepest bilingual nesting: steps, solution and
          // self-check are Bilingual[] where a dropped side hides most easily.
          collectEmptyTranslations(lab.title, `${at}.${lab.id}.title`, offenders);
          collectEmptyTranslations(lab.scenario, `${at}.${lab.id}.scenario`, offenders);
          collectEmptyTranslations(lab.task, `${at}.${lab.id}.task`, offenders);
          collectEmptyTranslations(lab.steps, `${at}.${lab.id}.steps`, offenders);
          collectEmptyTranslations(lab.challenge, `${at}.${lab.id}.challenge`, offenders);
          collectEmptyTranslations(lab.solution, `${at}.${lab.id}.solution`, offenders);
          collectEmptyTranslations(lab.selfCheck, `${at}.${lab.id}.selfCheck`, offenders);
        }
      }
    }
    expect(offenders, 'a manual field is missing a language or is empty').toEqual([]);
    // Guard against a silent no-op: the manual is the largest learner-facing dataset.
    expect(topics).toBeGreaterThan(80);
    expect(guidedLabs).toBeGreaterThan(70);
  });

  it('checks every glossary definition, including any future nested bilingual field', () => {
    const offenders: string[] = [];
    for (const entry of GLOSSARY_TERMS) {
      expect(entry.definition, `${entry.term} definition`).toHaveProperty('it');
      expect(entry.definition, `${entry.term} definition`).toHaveProperty('en');
      // A deep walk, unlike a shallow `{ it, en }` presence check, also catches a
      // dropped side inside any bilingual field a term may later nest (an example, a note).
      collectEmptyTranslations(entry.definition, `${entry.term}.definition`, offenders);
    }
    expect(offenders).toEqual([]);
  });

  it('fills both languages of every translation pair', () => {
    const offenders: string[] = [];
    for (const [name, dataset] of BILINGUAL_DATASETS) {
      collectEmptyTranslations(dataset, name, offenders);
    }
    expect(offenders, 'a translation pair is missing a language or is empty').toEqual([]);
  });

  it('actually visits a large number of pairs, so a silent no-op cannot pass', () => {
    const seen = { n: 0 };
    const count = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(count);
      if (value === null || typeof value !== 'object') return;
      const record = value as Record<string, unknown>;
      const pair = isBilingualPair(record);
      if (pair) seen.n += 1;
      for (const key of Object.keys(record)) {
        if (pair && (key === 'it' || key === 'en')) continue;
        count(record[key]);
      }
    };
    for (const [, dataset] of BILINGUAL_DATASETS) count(dataset);
    expect(seen.n).toBeGreaterThan(500);
  });

  // The five interactive-lab datasets carry the exercise content the student works
  // through. Each is a plain `Localized` / `Record<Language, string>` shape, so unlike
  // the manual and the OSI layers they were only reachable by the source-text
  // heuristic — which cannot tell that a whole language side was dropped. Walking every
  // export of each module by namespace closes that gap and scales to future exports.
  const INTERACTIVE_LABS: ReadonlyArray<readonly [string, Record<string, unknown>]> = [
    ['networkFundamentalsLab', networkFundamentalsLab],
    ['networkAccessLab', networkAccessLab],
    ['ipConnectivityLab', ipConnectivityLab],
    ['ipServicesLab', ipServicesLab],
    ['securityFundamentalsLab', securityFundamentalsLab]
  ];

  it('fills both languages across every interactive-lab dataset', () => {
    const offenders: string[] = [];
    let pairs = 0;
    for (const [name, mod] of INTERACTIVE_LABS) {
      for (const [exportName, value] of Object.entries(mod)) {
        collectEmptyTranslations(value, `${name}.${exportName}`, offenders);
      }
    }
    // Anti no-op: confirm the walk actually reached a meaningful body of lab prose.
    const count = (value: unknown): void => {
      if (Array.isArray(value)) return value.forEach(count);
      if (value === null || typeof value !== 'object') return;
      const record = value as Record<string, unknown>;
      const pair = isBilingualPair(record);
      if (pair) pairs += 1;
      for (const key of Object.keys(record)) {
        if (pair && (key === 'it' || key === 'en')) continue;
        count(record[key]);
      }
    };
    for (const [, mod] of INTERACTIVE_LABS) for (const value of Object.values(mod)) count(value);
    expect(offenders, 'an interactive-lab translation pair is missing a language or is empty').toEqual([]);
    expect(pairs).toBeGreaterThan(100);
  });
});
