import { describe, it, expect } from 'vitest';
import { OSI_LAYERS } from '../content/osiLayers';
import { ATTACK_SCENARIOS } from '../content/attackScenarios';
import { ATTACK_WALKTHROUGHS } from '../content/attackWalkthroughs';
import { GLOSSARY_TERMS } from '../content/glossaryTerms';
import { CCNA_DOMAINS } from '../content/ccna';
import { ATTACK_FAMILIES, type SecurityPlane } from '../content/securityTaxonomy';
import { SECURITY_TECHNIQUES, type CcnaDomainId } from '../content/securityCoverage';
import { DEFENSE_CONTROLS, type DefenseFunction } from '../content/defenseControls';
import { DETECTION_USE_CASES } from '../content/detectionUseCases';
import { SECURITY_PLAYBOOKS } from '../content/securityPlaybooks';
import { DOMAIN_CHECKLISTS } from '../content/domainChecklists';
import { ATTACK_PATHS } from '../content/attackPaths';
import { SECURITY_EVIDENCE_CASES, type EvidenceSeverity } from '../content/securityEvidence';
import { APPLICATION_SECURITY_SCENARIOS } from '../content/applicationSecurityScenarios';
import { AVAILABILITY_SCENARIOS } from '../content/availabilityScenarios';
import { EMAIL_HUMAN_SECURITY_SCENARIOS } from '../content/emailHumanSecurityScenarios';
import { ENDPOINT_SECURITY_SCENARIOS } from '../content/endpointSecurityScenarios';
import { IDENTITY_TRUST_SCENARIOS } from '../content/identityTrustScenarios';
import { INSPECTION_SCENARIOS } from '../content/inspectionScenarios';
import { IPV6_SECURITY_SCENARIOS } from '../content/ipv6Security';
import { LAYER2_SECURITY_SCENARIOS } from '../content/layer2SecurityScenarios';
import { MANAGEMENT_TELEMETRY_SCENARIOS } from '../content/managementTelemetryScenarios';
import { RECOVERY_SCENARIOS } from '../content/recoveryScenarios';
import { ROUTING_SECURITY_SCENARIOS } from '../content/routingSecurityScenarios';
import { SEGMENTATION_SCENARIOS } from '../content/segmentationScenarios';
import { VPN_PKI_SCENARIOS } from '../content/vpnPkiScenarios';
import { WIRELESS_SECURITY_SCENARIOS } from '../content/wirelessSecurityScenarios';
import {
  MITRE_ATTACK_RELEASED_ON,
  MITRE_ATTACK_REVIEWED_ON,
  MITRE_ATTACK_VERSION,
  securityReferenceUrl,
  type SecurityReference,
  type SecurityReferenceKind,
} from '../content/securityReferences';

/** A value that must carry both an Italian and an English string. */
function expectBilingual(value: { it?: string; en?: string } | undefined, label: string) {
  expect(value, `${label} is missing`).toBeTruthy();
  expect(value!.it?.trim(), `${label}.it is empty`).toBeTruthy();
  expect(value!.en?.trim(), `${label}.en is empty`).toBeTruthy();
}

describe('OSI_LAYERS', () => {
  it('defines exactly the 7 layers with unique ids 1..7', () => {
    const ids = OSI_LAYERS.map(l => l.id).sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('offers the same number of attacks and defenses in both languages', () => {
    // A missing entry in one language is invisible to a reader of that language:
    // the Italian Layer 7 block once had one attack fewer than the English one.
    for (const layer of OSI_LAYERS) {
      expect(layer.translations.it.attacks?.length, `L${layer.id} attacks`).toBe(layer.translations.en.attacks?.length);
      expect(layer.translations.it.defenses?.length, `L${layer.id} defenses`).toBe(layer.translations.en.defenses?.length);
    }
  });

  it('has bilingual name and description for every layer', () => {
    for (const layer of OSI_LAYERS) {
      for (const lang of ['it', 'en'] as const) {
        expect(layer.translations[lang].name?.trim(), `L${layer.id} ${lang} name`).toBeTruthy();
        expect(layer.translations[lang].description?.trim(), `L${layer.id} ${lang} desc`).toBeTruthy();
      }
    }
  });
});

describe('ATTACK_SCENARIOS', () => {
  it('has unique ids and a valid target layer', () => {
    const ids = ATTACK_SCENARIOS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of ATTACK_SCENARIOS) {
      expect(s.targetLayer, `${s.id} targetLayer`).toBeGreaterThanOrEqual(1);
      expect(s.targetLayer, `${s.id} targetLayer`).toBeLessThanOrEqual(7);
      expectBilingual(s.name, `${s.id} name`);
      expectBilingual(s.description, `${s.id} description`);
      expectBilingual(s.recommendedDefense, `${s.id} recommendedDefense`);
    }
  });

  it('gives every attack scenario at least one structured authoritative reference', () => {
    for (const scenario of ATTACK_SCENARIOS) {
      expect(scenario.references.length, `${scenario.id} references`).toBeGreaterThan(0);
    }
  });
});

const REFERENCE_PATTERNS = {
  rfc: /^RFC [1-9]\d*$/,
  ieee: /^IEEE 802(?:\.\d+)+(?:-[12]\d{3})?$/,
  nist: /^SP \d+-\d+[A-Z]?(?: Rev\. \d+)?$/,
  attack: /^T\d{4}(?:\.\d{3})?$/,
  cisco: /^Cisco [A-Za-z0-9][A-Za-z0-9 .:/_-]*$/,
} as const satisfies Record<SecurityReferenceKind, RegExp>;

function expectValidReferences(references: readonly SecurityReference[], owner: string) {
  const unique = new Set<string>();
  for (const reference of references) {
    expect(REFERENCE_PATTERNS[reference.kind].test(reference.id), `${owner}: invalid ${reference.kind} id '${reference.id}'`).toBe(true);
    const key = `${reference.kind}:${reference.id}`;
    expect(unique.has(key), `${owner}: duplicate reference '${key}'`).toBe(false);
    unique.add(key);

    const url = new URL(securityReferenceUrl(reference));
    expect(url.protocol, `${owner}: ${key} must resolve over HTTPS`).toBe('https:');
    expect(
      ['datatracker.ietf.org', 'standards.ieee.org', 'csrc.nist.gov', 'attack.mitre.org', 'www.cisco.com'],
      `${owner}: ${key} has an unapproved authority`,
    ).toContain(url.hostname);
  }
}

describe('structured security references', () => {
  it('pins the current reviewed MITRE ATT&CK release', () => {
    expect(MITRE_ATTACK_VERSION).toBe('19.2');
    expect(MITRE_ATTACK_RELEASED_ON).toBe('2026-04-28');
    expect(MITRE_ATTACK_REVIEWED_ON).toBe('2026-10-10');
  });

  it('validates every attack-scenario reference and its authoritative URL', () => {
    for (const scenario of ATTACK_SCENARIOS) {
      expectValidReferences(scenario.references, `attack scenario '${scenario.id}'`);
    }
  });

  it('gives every defensive control a valid authoritative reference', () => {
    for (const control of DEFENSE_CONTROLS) {
      expect(control.references.length, `${control.id} references`).toBeGreaterThan(0);
      expectValidReferences(control.references, `defensive control '${control.id}'`);
    }
  });
});

describe('ATTACK_WALKTHROUGHS', () => {
  const scenarioIds = new Set(ATTACK_SCENARIOS.map(s => s.id));

  it('has unique scenarioIds that all reference a real scenario', () => {
    const ids = ATTACK_WALKTHROUGHS.map(w => w.scenarioId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of ATTACK_WALKTHROUGHS) {
      expect(scenarioIds.has(w.scenarioId), `${w.scenarioId} has no matching scenario`).toBe(true);
    }
  });

  it('keeps each walkthrough on the same primary layer as its scenario', () => {
    const scenarios = new Map(ATTACK_SCENARIOS.map(s => [s.id, s]));
    for (const walkthrough of ATTACK_WALKTHROUGHS) {
      expect(
        walkthrough.layer,
        `${walkthrough.scenarioId} layer differs from its scenario`
      ).toBe(scenarios.get(walkthrough.scenarioId)?.targetLayer);
    }
  });

  it('covers all 7 OSI layers', () => {
    const layers = new Set(ATTACK_WALKTHROUGHS.map(w => w.layer));
    expect([...layers].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps neutralizeAtStep within the steps and fills every bilingual field', () => {
    for (const w of ATTACK_WALKTHROUGHS) {
      const tag = w.scenarioId;
      expect(w.layer, `${tag} layer`).toBeGreaterThanOrEqual(1);
      expect(w.layer, `${tag} layer`).toBeLessThanOrEqual(7);
      expect(w.steps.length, `${tag} needs at least 2 steps`).toBeGreaterThanOrEqual(2);
      expect(Number.isInteger(w.neutralizeAtStep), `${tag} neutralizeAtStep is an int`).toBe(true);
      expect(w.neutralizeAtStep, `${tag} neutralizeAtStep >= 0`).toBeGreaterThanOrEqual(0);
      expect(w.neutralizeAtStep, `${tag} neutralizeAtStep in range`).toBeLessThan(w.steps.length);

      expectBilingual(w.goal, `${tag} goal`);
      expectBilingual(w.defense.name, `${tag} defense.name`);
      expectBilingual(w.defense.action, `${tag} defense.action`);
      expectBilingual(w.defense.mechanism, `${tag} defense.mechanism`);
      expectBilingual(w.outcomeSuccess, `${tag} outcomeSuccess`);
      expectBilingual(w.outcomeBlocked, `${tag} outcomeBlocked`);

      w.steps.forEach((step, i) => {
        expect(['attacker', 'victim', 'network', 'defense']).toContain(step.actor);
        expectBilingual(step.title, `${tag} step ${i} title`);
        expectBilingual(step.detail, `${tag} step ${i} detail`);
      });
    }
  });

  it('provides at least 20 attack walkthroughs', () => {
    expect(ATTACK_WALKTHROUGHS.length).toBeGreaterThanOrEqual(20);
  });
});

describe('GLOSSARY_TERMS', () => {
  it('has unique terms and a bilingual definition each', () => {
    const terms = GLOSSARY_TERMS.map(t => t.term.toLowerCase());
    expect(new Set(terms).size).toBe(terms.length);
    for (const t of GLOSSARY_TERMS) {
      expect(t.term?.trim(), 'term text').toBeTruthy();
      expectBilingual(t.definition, `${t.term} definition`);
    }
  });
});

/**
 * ENG-13 — Systematic content validation of the security taxonomy graph.
 *
 * The security content is a graph wired together by *string* ids: a scenario cites
 * `techniqueIds`/`controlIds`, a technique cites a `familyId`, a detection cites
 * `evidenceIds`, and so on. TypeScript cannot check those strings — a renamed or
 * deleted id leaves a dangling reference that still compiles and silently teaches a
 * broken relationship. These tests make a broken reference, a duplicate id, an
 * out-of-domain value, or an orphaned node (a technique no control defends, a domain
 * with no scenario) fail in CI, which is the completion criterion for ENG-13.
 */

/** The closed CCNA 200-301 domain set; `satisfies` makes the type the single source. */
const ALL_DOMAINS = [
  'network-fundamentals', 'network-access', 'ip-connectivity',
  'ip-services', 'security-fundamentals', 'automation-programmability',
] as const satisfies readonly CcnaDomainId[];

/** The closed security-plane set shared by taxonomy, controls, and scenarios. */
const ALL_PLANES = [
  'physical', 'data', 'control', 'management', 'application', 'identity',
] as const satisfies readonly SecurityPlane[];

/** The closed defensive-function set used by DEFENSE_CONTROLS. */
const ALL_FUNCTIONS = [
  'prevent', 'detect', 'contain', 'recover', 'compensate',
] as const satisfies readonly DefenseFunction[];

/** The closed evidence-severity set used by SECURITY_EVIDENCE_CASES annotations. */
const ALL_SEVERITIES = ['context', 'warning', 'critical'] as const satisfies readonly EvidenceSeverity[];

/** The reference-carrying shape shared by every security scenario dataset. */
interface ReferencingScenario {
  id: string;
  domains: readonly CcnaDomainId[];
  planes?: readonly SecurityPlane[];
  techniqueIds: readonly string[];
  controlIds: readonly string[];
}

/** Every scenario dataset, each paired with its export name for readable failures. */
const SCENARIO_DATASETS: ReadonlyArray<readonly [string, readonly ReferencingScenario[]]> = [
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
  ['WIRELESS_SECURITY_SCENARIOS', WIRELESS_SECURITY_SCENARIOS],
];

const ALL_SCENARIOS: readonly ReferencingScenario[] = SCENARIO_DATASETS.flatMap(([, rows]) => rows);

const DOMAIN_IDS = new Set<string>(CCNA_DOMAINS.map(d => d.id));
const FAMILY_IDS = new Set<string>(ATTACK_FAMILIES.map(f => f.id));
const TECHNIQUE_IDS = new Set<string>(SECURITY_TECHNIQUES.map(t => t.id));
const CONTROL_IDS = new Set<string>(DEFENSE_CONTROLS.map(c => c.id));
const EVIDENCE_IDS = new Set<string>(SECURITY_EVIDENCE_CASES.map(e => e.id));

/** Collects dangling ids: every id in `ids` that is not present in `registry`. */
function danglingRefs(source: string, ids: readonly string[], registry: Set<string>, registryName: string): string[] {
  return ids.filter(id => !registry.has(id)).map(id => `${source} → '${id}' is not a ${registryName}`);
}

describe('security taxonomy — identifiers', () => {
  it('declares the six CCNA domains exactly, matching the CcnaDomainId type', () => {
    expect([...DOMAIN_IDS].sort()).toEqual([...ALL_DOMAINS].sort());
    expect(CCNA_DOMAINS.length).toBe(ALL_DOMAINS.length);
  });

  it('gives every node a unique, non-empty id within its dataset', () => {
    const datasets: ReadonlyArray<readonly [string, readonly { id: string }[]]> = [
      ['ATTACK_FAMILIES', ATTACK_FAMILIES],
      ['SECURITY_TECHNIQUES', SECURITY_TECHNIQUES],
      ['DEFENSE_CONTROLS', DEFENSE_CONTROLS],
      ['DETECTION_USE_CASES', DETECTION_USE_CASES],
      ['SECURITY_PLAYBOOKS', SECURITY_PLAYBOOKS],
      ['ATTACK_PATHS', ATTACK_PATHS],
      ['SECURITY_EVIDENCE_CASES', SECURITY_EVIDENCE_CASES],
      ...SCENARIO_DATASETS,
    ];
    const problems: string[] = [];
    for (const [name, rows] of datasets) {
      const ids = rows.map(r => r.id);
      for (const id of ids) {
        if (typeof id !== 'string' || id.trim() === '') problems.push(`${name} has an empty id`);
      }
      const seen = new Set<string>();
      for (const id of ids) {
        if (seen.has(id)) problems.push(`${name} repeats id '${id}'`);
        seen.add(id);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('security taxonomy — reference integrity', () => {
  it('resolves every cross-reference to an existing node', () => {
    const problems: string[] = [];

    for (const t of SECURITY_TECHNIQUES) {
      problems.push(...danglingRefs(`technique '${t.id}'.familyId`, [t.familyId], FAMILY_IDS, 'family'));
      problems.push(...danglingRefs(`technique '${t.id}'.domains`, t.domains, DOMAIN_IDS, 'domain'));
    }
    for (const c of DEFENSE_CONTROLS) {
      problems.push(...danglingRefs(`control '${c.id}'.techniqueIds`, c.techniqueIds, TECHNIQUE_IDS, 'technique'));
      problems.push(...danglingRefs(`control '${c.id}'.domains`, c.domains, DOMAIN_IDS, 'domain'));
    }
    for (const d of DETECTION_USE_CASES) {
      problems.push(...danglingRefs(`detection '${d.id}'.familyIds`, d.familyIds, FAMILY_IDS, 'family'));
      problems.push(...danglingRefs(`detection '${d.id}'.techniqueIds`, d.techniqueIds, TECHNIQUE_IDS, 'technique'));
      problems.push(...danglingRefs(`detection '${d.id}'.evidenceIds`, d.evidenceIds, EVIDENCE_IDS, 'evidence case'));
      problems.push(...danglingRefs(`detection '${d.id}'.domains`, d.domains, DOMAIN_IDS, 'domain'));
    }
    for (const p of SECURITY_PLAYBOOKS) {
      problems.push(...danglingRefs(`playbook '${p.id}'.techniqueIds`, p.techniqueIds, TECHNIQUE_IDS, 'technique'));
      problems.push(...danglingRefs(`playbook '${p.id}'.domains`, p.domains, DOMAIN_IDS, 'domain'));
    }
    for (const a of ATTACK_PATHS) {
      problems.push(...danglingRefs(`path '${a.id}'.familyIds`, a.familyIds, FAMILY_IDS, 'family'));
      problems.push(...danglingRefs(`path '${a.id}'.domains`, a.domains, DOMAIN_IDS, 'domain'));
      for (const stage of a.stages) {
        problems.push(...danglingRefs(`path '${a.id}' stage '${stage.id}'.techniqueIds`, stage.techniqueIds, TECHNIQUE_IDS, 'technique'));
        problems.push(...danglingRefs(`path '${a.id}' stage '${stage.id}'.defenseControlIds`, stage.defenseControlIds, CONTROL_IDS, 'control'));
      }
    }
    for (const [name, rows] of SCENARIO_DATASETS) {
      for (const s of rows) {
        problems.push(...danglingRefs(`${name} '${s.id}'.techniqueIds`, s.techniqueIds, TECHNIQUE_IDS, 'technique'));
        problems.push(...danglingRefs(`${name} '${s.id}'.controlIds`, s.controlIds, CONTROL_IDS, 'control'));
        problems.push(...danglingRefs(`${name} '${s.id}'.domains`, s.domains, DOMAIN_IDS, 'domain'));
      }
    }

    expect(problems).toEqual([]);
  });

  it('keeps every evidence annotation anchored to a line of the same case', () => {
    const problems: string[] = [];
    for (const evidenceCase of SECURITY_EVIDENCE_CASES) {
      const lineIds = new Set(evidenceCase.output.map(line => line.id));
      if (lineIds.size !== evidenceCase.output.length) problems.push(`evidence '${evidenceCase.id}' repeats an output line id`);
      for (const annotation of evidenceCase.annotations) {
        if (!lineIds.has(annotation.lineId)) problems.push(`evidence '${evidenceCase.id}' annotates missing line '${annotation.lineId}'`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('security taxonomy — allowed values', () => {
  it('uses only declared planes, functions, severities, and domains', () => {
    const planeSet = new Set<string>(ALL_PLANES);
    const functionSet = new Set<string>(ALL_FUNCTIONS);
    const severitySet = new Set<string>(ALL_SEVERITIES);
    const problems: string[] = [];

    const checkPlanes = (source: string, planes: readonly string[]) =>
      problems.push(...planes.filter(p => !planeSet.has(p)).map(p => `${source} uses unknown plane '${p}'`));

    ATTACK_FAMILIES.forEach(f => checkPlanes(`family '${f.id}'`, f.planes));
    SECURITY_TECHNIQUES.forEach(t => checkPlanes(`technique '${t.id}'`, t.planes));
    DEFENSE_CONTROLS.forEach(c => {
      checkPlanes(`control '${c.id}'`, c.planes);
      problems.push(...c.functions.filter(fn => !functionSet.has(fn)).map(fn => `control '${c.id}' uses unknown function '${fn}'`));
    });
    for (const [name, rows] of SCENARIO_DATASETS) {
      for (const s of rows) if (s.planes) checkPlanes(`${name} '${s.id}'`, s.planes);
    }
    for (const evidenceCase of SECURITY_EVIDENCE_CASES) {
      if (!planeSet.has(evidenceCase.plane)) problems.push(`evidence '${evidenceCase.id}' uses unknown plane '${evidenceCase.plane}'`);
      problems.push(...evidenceCase.annotations
        .filter(a => !severitySet.has(a.severity))
        .map(a => `evidence '${evidenceCase.id}' uses unknown severity '${a.severity}'`));
    }

    expect(problems).toEqual([]);
  });
});

describe('security taxonomy — relationship coverage', () => {
  it('ties every technique to exactly one existing family', () => {
    for (const t of SECURITY_TECHNIQUES) {
      expect(FAMILY_IDS.has(t.familyId), `technique '${t.id}' points at family '${t.familyId}'`).toBe(true);
    }
  });

  it('gives every scenario at least one domain, technique, and control', () => {
    const problems: string[] = [];
    for (const [name, rows] of SCENARIO_DATASETS) {
      for (const s of rows) {
        if (s.domains.length === 0) problems.push(`${name} '${s.id}' has no domain`);
        if (s.techniqueIds.length === 0) problems.push(`${name} '${s.id}' has no technique`);
        if (s.controlIds.length === 0) problems.push(`${name} '${s.id}' has no control`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('defends every technique with at least one control (technique ↔ control)', () => {
    const defended = new Set<string>();
    for (const c of DEFENSE_CONTROLS) c.techniqueIds.forEach(id => defended.add(id));
    const undefended = [...TECHNIQUE_IDS].filter(id => !defended.has(id));
    expect(undefended, 'these techniques have no defending control').toEqual([]);
  });

  it('references every technique, control, and family from the scenario/detection/path graph', () => {
    const technique = new Set<string>();
    const control = new Set<string>();
    const family = new Set<string>();
    for (const s of ALL_SCENARIOS) {
      s.techniqueIds.forEach(id => technique.add(id));
      s.controlIds.forEach(id => control.add(id));
    }
    for (const t of SECURITY_TECHNIQUES) family.add(t.familyId);
    for (const c of DEFENSE_CONTROLS) c.techniqueIds.forEach(id => technique.add(id));
    for (const d of DETECTION_USE_CASES) { d.familyIds.forEach(id => family.add(id)); d.techniqueIds.forEach(id => technique.add(id)); }
    for (const p of SECURITY_PLAYBOOKS) p.techniqueIds.forEach(id => technique.add(id));
    for (const a of ATTACK_PATHS) {
      a.familyIds.forEach(id => family.add(id));
      a.stages.forEach(stage => { stage.techniqueIds.forEach(id => technique.add(id)); stage.defenseControlIds.forEach(id => control.add(id)); });
    }

    expect([...TECHNIQUE_IDS].filter(id => !technique.has(id)), 'orphan techniques').toEqual([]);
    expect([...CONTROL_IDS].filter(id => !control.has(id)), 'orphan controls').toEqual([]);
    expect([...FAMILY_IDS].filter(id => !family.has(id)), 'orphan families').toEqual([]);
  });

  it('covers every CCNA domain with scenarios and exactly one checklist', () => {
    const checklistDomains = DOMAIN_CHECKLISTS.map(c => c.domainId);
    expect(new Set(checklistDomains).size, 'a domain has two checklists').toBe(checklistDomains.length);
    expect([...checklistDomains].sort()).toEqual([...DOMAIN_IDS].sort());

    const scenarioDomains = new Set<string>();
    ALL_SCENARIOS.forEach(s => s.domains.forEach(d => scenarioDomains.add(d)));
    expect([...DOMAIN_IDS].filter(d => !scenarioDomains.has(d)), 'domains with no scenario').toEqual([]);
  });
});
